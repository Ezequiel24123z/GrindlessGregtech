// Checks shared by lint.mjs (text report) and export.mjs (data for the preview renderer).
// Every finding: { level: 'error' | 'warn' | 'info', rule, chapter, quest?, other?, message }.
import { collectItemIds } from './book.mjs';
import { ERAS } from './chapter-gen.mjs';

const EPS = 0.01;

// An era chapter is <era>_age (QB-0: one chapter per era). It gets the merged-chapter rules (connectivity, section bridges) when
// lint-config.json eraChapters.enabled lists it, or for every era chapter with options.mergedEras (lint.mjs --merged-eras, the dry merge).
export const isEraChapter = (filename) => ERAS.some((e) => filename === `${e}_age`);
export function isMergedEra(cfg, filename, options = {}) {
  if (!isEraChapter(filename)) return false;
  return Boolean(options.mergedEras) || ((cfg.eraChapters && cfg.eraChapters.enabled) || []).includes(filename);
}

export function stripCodes(s) {
  return String(s ?? '').replace(/[&§][0-9a-fk-orA-FK-OR]/g, '').replace(/\{@pagebreak\}/g, '');
}

function center(q) { return { x: q.x, y: q.y }; }
function half(q) { return Math.max(0.1, q.size) / 2; }

function segIntersect(a, b, c, d) {
  const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  const o1 = o(a, b, c), o2 = o(a, b, d), o3 = o(c, d, a), o4 = o(c, d, b);
  return o1 * o2 < 0 && o3 * o4 < 0;
}

function segHitsBox(a, b, box) {
  // Liang-Barsky clip of segment a-b against the axis-aligned box
  let t0 = 0, t1 = 1;
  const dx = b.x - a.x, dy = b.y - a.y;
  const p = [-dx, dx, -dy, dy];
  const q = [a.x - box.x0, box.x1 - a.x, a.y - box.y0, box.y1 - a.y];
  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-12) { if (q[i] < 0) return false; continue; }
    const t = q[i] / p[i];
    if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
  }
  return t1 - t0 > 1e-6;
}

export function questLabel(q) {
  if (!q) return '?';
  if (q.title) return stripCodes(q.title);
  const t = q.tasks[0];
  if (t && t.itemId) return t.itemId;
  return q.id;
}

// Edges of a chapter: dependency -> dependent, same chapter only; cross-chapter ones are returned apart.
export function chapterEdges(book, ch) {
  const edges = [];
  const cross = [];
  for (const q of ch.quests) {
    for (const d of q.deps) {
      const p = book.questById.get(d);
      if (!p) continue;
      if (p.chapter !== ch) { cross.push({ from: p, to: q }); continue; }
      edges.push({ from: p, to: q, length: Math.hypot(q.x - p.x, q.y - p.y) });
    }
  }
  return { edges, cross };
}

// FTB Quests 2001.4 (BaseQuestFile#readID, QuestObjectBase#parseCodeString) reads ids with Long.parseLong(hex, 16):
// only 1-16 hex digits up to 7FFFFFFFFFFFFFFF survive a load. Its own editor only makes those (Math.abs(nextLong())).
export function readableId(id) {
  return typeof id === 'string' && /^[0-9A-Fa-f]{1,16}$/.test(id) && !(id.length === 16 && /^[89A-Fa-f]/.test(id));
}

// The chapter's role for the text limits (docs/reforge/05_quest_design.md, section 3.2): an explicit chapterRoles entry, else the
// file name's suffix (<era>_circuits, <era>_machines, <era>_integration), else none.
export function chapterRole(cfg, filename) {
  const lim = cfg.limits || {};
  if (lim.chapterRoles && lim.chapterRoles[filename]) return lim.chapterRoles[filename];
  const m = /_(circuits|machines|integration|capstone)$/.exec(filename);
  return m && lim.roles && lim.roles[m[1]] ? m[1] : '';
}

// { role, maxWords, maxLines } for a chapter: its role's limits, else the default (70 words, 4 paragraphs).
export function textLimits(cfg, filename) {
  const lim = cfg.limits || {};
  const def = lim.default || {};
  const role = chapterRole(cfg, filename);
  const r = (role && lim.roles && lim.roles[role]) || {};
  return {
    role,
    maxWords: r.maxWords ?? def.maxWords ?? cfg.maxWords ?? 70,
    maxLines: r.maxLines ?? def.maxLines ?? cfg.maxLines ?? 4,
  };
}

function allowedLongEdge(cfg, from, to) {
  return (cfg.allowLongEdges || []).some((e) => (e.from === from.id && e.to === to.id) || (Array.isArray(e) && e[0] === from.id && e[1] === to.id));
}

// lint-config allowLayout: [{ from, to, kinds: ['crossing', 'through-node'], why }]. A real dependency whose line cannot avoid a crossing
// or a node in the layout keeps its line: real dependencies come before a clean drawing (owner, 2026-11-02). No kinds = both.
export function allowedLayout(cfg, from, to, kind) {
  return (cfg.allowLayout || []).some((e) => e.from === from.id && e.to === to.id && (!Array.isArray(e.kinds) || e.kinds.includes(kind)));
}

export function checkBook(book, cfg, options = {}) {
  const findings = [];
  const add = (level, rule, chapter, quest, message, other) => findings.push({ level, rule, chapter: chapter ? chapter.filename : '', quest: quest ? quest.id : '', questTitle: quest ? questLabel(quest) : '', other: other ? other.id : '', message });
  const only = options.chapters && options.chapters.length ? new Set(options.chapters) : null;
  const inScope = (ch) => !only || only.has(ch.filename);
  const manyOk = new Set((cfg.manyRewardsOk || []).map((e) => e.quest));
  // chapter groups (and single chapters) whose quests give no reward on purpose
  // (lint-config.json noRewardGroups: { groups: [titles], chapters: [file names], why }; pl-gen.mjs rewrites that line), and single
  // quests that give nothing on purpose (noRewardQuests: { ids: [quest ids], why }; no generator touches it)
  const noRewardGroups = new Set(((cfg.noRewardGroups && cfg.noRewardGroups.groups) || []).map((t) => String(t)));
  const noRewardChapters = new Set(((cfg.noRewardGroups && cfg.noRewardGroups.chapters) || []).map((t) => String(t)));
  const noRewardQuests = new Set(((cfg.noRewardQuests && cfg.noRewardQuests.ids) || []).map((t) => String(t)));
  const rewardFree = (ch) => noRewardChapters.has(ch.filename) || noRewardGroups.has((book.groups.find((g) => g.id === ch.group) || {}).title);
  // quantityOk: { quest, why } for one quest, or { chapter, why } for a whole chapter whose numbers are its point
  const quantityOk = new Set((cfg.quantityOk || []).filter((e) => e.quest).map((e) => e.quest));
  const quantityOkChapters = new Set((cfg.quantityOk || []).filter((e) => e.chapter).map((e) => e.chapter));
  const banned = (cfg.bannedPhrases || []).map((s) => s.toLowerCase());

  // New classes (AF-A2): their level comes from lint-config.json classLevels ('error' | 'warn' | 'info', default 'info' = listed in
  // the export, never counted), or 'warn' for all of them with options.newClasses (lint.mjs --new-classes) to list what they find.
  const classLevel = (rule) => (options.newClasses ? 'warn' : ((cfg.classLevels || {})[rule] || 'info'));
  const cr = cfg.creativeRewards || {};
  const creativeRe = new RegExp((cr.patterns || ['creative', 'debug', 'command_block', 'structure_block', 'jigsaw', 'barrier']).join('|'), 'i');
  const creativeOkChapters = new Set(cr.allowChapters || []);
  const creativeOkQuests = new Set(cr.allowQuests || []);
  const stackOf = (id) => ((cfg.stackSizes || {})[id] ?? cfg.defaultMaxStack ?? 64);
  const stackFactor = cfg.maxStacks ?? 36;
  const recipeLessOk = new Set(cfg.recipeLessOk || []);
  const checkRewardsAndTasks = (ch, q) => {
    for (const r of q.rewards) {
      if (r.itemId && creativeRe.test(r.itemId) && !creativeOkChapters.has(ch.filename) && !creativeOkQuests.has(q.id)) {
        add(classLevel('creative-reward'), 'creative-reward', ch, q, `reward ${r.itemId} is a creative or debug item: only designated endgame quests (lint-config creativeRewards) may give one`);
      }
    }
    for (const t of q.tasks) {
      const n = Number(t.count ?? (t.item && t.item.Count) ?? 1);
      if (t.itemId && n > stackFactor * stackOf(t.itemId)) add(classLevel('count-stack'), 'count-stack', ch, q, `task of ${n} ${t.itemId}: more than ${stackFactor} stacks (${stackFactor * stackOf(t.itemId)})`);
      if (!t.itemId || t.itemId === 'minecraft:air') continue;
      if (options.hidden && options.hidden.has(t.itemId)) add(classLevel('task-hidden'), 'task-hidden', ch, q, `task item ${t.itemId} is hidden (grindless:hidden_with_recipes or never obtainable)`);
      else if (options.recipeOutputs && !options.recipeOutputs.has(t.itemId) && !recipeLessOk.has(t.itemId)) add(classLevel('task-no-recipe'), 'task-no-recipe', ch, q, `task item ${t.itemId} is the output of no recipe`);
    }
  };

  // ids used more than once anywhere in the book
  for (const [id, uses] of book.objectIds) {
    if (uses.length > 1) {
      const chs = uses.map((u) => u.where.split('/')[0]);
      if (!only || chs.some((c) => only.has(c))) findings.push({ level: 'error', rule: 'dup-id', chapter: chs[0], quest: id, questTitle: '', other: '', message: `id ${id} is used ${uses.length} times: ${uses.map((u) => u.kind + ' ' + u.where).join('; ')}` });
    }
    if (!/^[0-9A-F]{16}$/.test(id)) findings.push({ level: 'warn', rule: 'id-format', chapter: uses[0].where.split('/')[0], quest: id, questTitle: '', other: '', message: `id ${id} is not 16 upper-case hex digits` });
    if (!readableId(id)) {
      const chs = uses.map((u) => u.where.split('/')[0]);
      if (!only || chs.some((c) => only.has(c))) findings.push({ level: 'error', rule: 'id-range', chapter: chs[0], quest: id, questTitle: '', other: '', message: `id ${id} (${uses.map((u) => u.kind + ' ' + u.where).join('; ')}) is above 7FFFFFFFFFFFFFFF: FTB Quests 2001.4 reads ids with Long.parseLong(hex, 16), so in game it gets a new random id at every load (its progress is lost) and every dependency on it is dropped. Fix: node tools/quests/fix-ids.mjs` });
    }
  }
  for (const ch of book.chapters) {
    if (!inScope(ch) || ch.parseError) continue;
    const refs = [];
    for (const q of ch.quests) for (const d of q.deps) refs.push([q, 'dependency', d]);
    if (ch.raw && ch.raw.autofocus_id !== undefined) refs.push([null, 'autofocus_id', String(ch.raw.autofocus_id)]);
    if (ch.group) refs.push([null, 'group', String(ch.group)]);
    for (const l of ch.links) refs.push([null, 'quest link', String(l.linked)]);
    for (const [q, kind, ref] of refs) if (!readableId(ref)) add('error', 'id-range', ch, q, `${kind} ${ref} can't be read by FTB Quests 2001.4 (above 7FFFFFFFFFFFFFFF): in game the link is dropped. Fix: node tools/quests/fix-ids.mjs`);
  }

  for (const ch of book.chapters) {
    if (!inScope(ch)) continue;
    if (ch.parseError) { add('error', 'parse', ch, null, ch.parseError); continue; }
    if (!ch.title) add('error', 'chapter-title', ch, null, 'chapter has no title (FTB Quests 2001.4 shows "Unnamed")');
    const dir = (cfg.direction && (cfg.direction[ch.filename] || cfg.direction.default)) || 'ltr';
    const isMerged = isMergedEra(cfg, ch.filename, options);
    const bridgeMax = isMerged ? ((cfg.eraChapters && cfg.eraChapters.bridgeMaxEdge) ?? 14) : 0;
    const along = (p) => (dir === 'ttb' ? p.y : p.x);
    const across = (p) => (dir === 'ttb' ? p.x : p.y);
    const roots = ch.quests.filter((q) => q.deps.length === 0);
    const allowRoots = new Set((cfg.allowRoots && cfg.allowRoots[ch.filename]) || []);
    // a quest that stands alone on purpose (a placeholder for something being built): allowIsolated: { <chapter>: [ids], _why... }
    const allowIsolated = new Set((cfg.allowIsolated && cfg.allowIsolated[ch.filename]) || []);
    const dependents = new Map();
    for (const q of ch.quests) for (const d of q.deps) { if (!dependents.has(d)) dependents.set(d, []); dependents.get(d).push(q); }

    if (isMerged) {
      // QB-0: one start, everything reachable through dependencies inside the chapter (supersedes root and isolated here)
      const inChapter = (q) => q.deps.map((d) => book.questById.get(d)).filter((p) => p && p.chapter === ch);
      const starts = ch.quests.filter((q) => inChapter(q).length === 0).sort((a, b) => along(a) - along(b) || across(a) - across(b));
      if (ch.quests.length > 0 && starts.length === 0) add('error', 'connectivity', ch, null, 'no start: every quest depends on another quest of the chapter (a cycle)');
      starts.slice(1).forEach((q) => add('error', 'connectivity', ch, q, `second start: "${questLabel(q)}" has no dependency inside the chapter` + (q.deps.length ? ' (a dependency on another chapter does not connect it)' : '') + ` (the chapter starts at "${questLabel(starts[0])}")`));
      const reach = (from) => {
        const seen = new Set();
        const stack = [...from];
        while (stack.length) {
          const q = stack.pop();
          if (seen.has(q.id)) continue;
          seen.add(q.id);
          for (const n of dependents.get(q.id) || []) stack.push(n);
        }
        return seen;
      };
      const fromMain = reach(starts.slice(0, 1));
      const fromAny = reach(starts);
      for (const q of ch.quests) {
        if (fromMain.has(q.id) || (starts.length > 1 && fromAny.has(q.id))) continue;
        add('error', 'connectivity', ch, q, `unreachable: no chain of dependencies inside the chapter leads from "${questLabel(starts[0])}" to it`);
      }
    } else {
      if (ch.quests.length > 0 && roots.length === 0) add('info', 'root', ch, null, 'no quest without dependencies: the chapter starts from another chapter');
      const sortedRoots = [...roots].sort((a, b) => along(a) - along(b) || across(a) - across(b));
      sortedRoots.slice(1).forEach((q) => { if (!allowRoots.has(q.id)) add('error', 'root', ch, q, `second starting point: "${questLabel(q)}" has no dependency (the chapter starts at "${questLabel(sortedRoots[0])}")`); });
    }

    for (const q of ch.quests) {
      if (!isMerged && q.deps.length === 0 && !(dependents.get(q.id) || []).length && ch.quests.length > 1 && !allowIsolated.has(q.id)) add('error', 'isolated', ch, q, 'floating quest: nothing leads to it and nothing hangs from it');
      for (const d of q.deps) {
        if (d === q.id) add('error', 'self-dep', ch, q, 'depends on itself');
        else if (!book.questById.has(d)) add('error', 'missing-dep', ch, q, `depends on unknown quest id ${d}`);
      }
      if (cfg.grid) {
        const off = (v) => Math.abs(v / cfg.grid - Math.round(v / cfg.grid)) > 1e-6;
        if (off(q.x) || off(q.y)) add('warn', 'off-grid', ch, q, `position (${q.x}, ${q.y}) is not on the ${cfg.grid} grid`);
      }
      if (!q.title && !(q.tasks[0] && q.tasks[0].itemId)) add('warn', 'title', ch, q, 'no title and no item task to name it');
    }

    // cycles (in-chapter and cross-chapter)
    const state = new Map();
    const visit = (q, stack) => {
      if (state.get(q.id) === 2) return;
      if (state.get(q.id) === 1) { add('error', 'cycle', ch, q, 'dependency cycle: ' + [...stack, q].map(questLabel).join(' -> ')); return; }
      state.set(q.id, 1);
      for (const d of q.deps) { const p = book.questById.get(d); if (p) visit(p, [...stack, q]); }
      state.set(q.id, 2);
    };
    for (const q of ch.quests) visit(q, []);

    // overlaps and crowding
    for (let i = 0; i < ch.quests.length; i++) {
      for (let j = i + 1; j < ch.quests.length; j++) {
        const a = ch.quests[i], b = ch.quests[j];
        const gapX = Math.abs(a.x - b.x) - half(a) - half(b);
        const gapY = Math.abs(a.y - b.y) - half(a) - half(b);
        const gap = Math.max(gapX, gapY);
        if (gap < -EPS) add('error', 'overlap', ch, a, `overlaps "${questLabel(b)}"`, b);
        else if (gap < (cfg.minGap ?? 0.25) - EPS) add('warn', 'crowded', ch, a, `only ${gap.toFixed(2)} cells from "${questLabel(b)}"`, b);
      }
    }

    const { edges, cross } = chapterEdges(book, ch);
    for (const e of edges) {
      const { from, to } = e;
      const d = along(to) - along(from);
      if (d < -EPS) add('error', 'backward', ch, to, `depends on "${questLabel(from)}", which sits after it in the reading direction (${dir})`, from);
      else if (Math.abs(d) <= EPS && Math.abs(across(to) - across(from)) > (cfg.maxVerticalDrop ?? 3) + EPS) add('warn', 'vertical-long', ch, to, `hangs ${Math.abs(across(to) - across(from)).toFixed(2)} cells straight below/above "${questLabel(from)}"`, from);
      const tooLong = e.length > (cfg.maxEdge ?? 4.6) + EPS && !to.hideDependencyLines && !allowedLongEdge(cfg, from, to);
      // a forward line between two sections of a merged era chapter may be longer (eraChapters.bridgeMaxEdge)
      if (tooLong && !(isMerged && d > EPS && e.length <= bridgeMax + EPS)) add('error', 'long-edge', ch, to, `line from "${questLabel(from)}" is ${e.length.toFixed(2)} cells long (max ${cfg.maxEdge}${isMerged ? ', ' + bridgeMax + ' for a forward line between sections' : ''})`, from);
      if (!to.hideDependencyLines && !allowedLayout(cfg, from, to, 'through-node')) {
        for (const o of ch.quests) {
          if (o === from || o === to) continue;
          const h = half(o) * 0.9;
          if (segHitsBox(center(from), center(to), { x0: o.x - h, x1: o.x + h, y0: o.y - h, y1: o.y + h })) add('warn', 'through-node', ch, to, `line from "${questLabel(from)}" runs under "${questLabel(o)}"`, o);
        }
      }
    }
    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        const a = edges[i], b = edges[j];
        if (a.from === b.from || a.from === b.to || a.to === b.from || a.to === b.to) continue;
        if (a.to.hideDependencyLines || b.to.hideDependencyLines) continue;
        if (allowedLayout(cfg, a.from, a.to, 'crossing') || allowedLayout(cfg, b.from, b.to, 'crossing')) continue;
        if (segIntersect(center(a.from), center(a.to), center(b.from), center(b.to))) add('warn', 'crossing', ch, a.to, `line "${questLabel(a.from)}" -> "${questLabel(a.to)}" crosses "${questLabel(b.from)}" -> "${questLabel(b.to)}"`, b.to);
      }
    }
    for (const c of cross) add('info', 'cross-chapter', ch, c.to, `depends on "${questLabel(c.from)}" in chapter ${c.from.chapter.filename}`, c.from);

    // items
    // Structure first (no dump needed): FTB Quests parses item ids and icons as resource locations, and a malformed one (an
    // uppercase quest id where the item id goes, itemfilters without tag.value) crashes the server while it loads the book.
    const RL = /^[a-z0-9_.-]+:[a-z0-9_.\/-]+$/;
    for (const q of ch.quests) {
      if (typeof q.icon === 'string' && !RL.test(q.icon)) add('error', 'item-format', ch, q, `icon "${q.icon}" is not a resource id`);
      for (const t of [...q.tasks, ...q.rewards]) {
        const it = t.item;
        if (typeof it === 'string' && !RL.test(it)) add('error', 'item-format', ch, q, `item "${it}" is not a resource id`);
        if (it && typeof it === 'object') {
          if (typeof it.id !== 'string' || !RL.test(it.id)) add('error', 'item-format', ch, q, `item id ${JSON.stringify(it.id)} is not a resource id (write { Count: 1b, id: "namespace:path", tag: {...} })`);
          else if (it.id === 'itemfilters:tag' && !(it.tag && typeof it.tag === 'object' && it.tag.value)) add('error', 'item-format', ch, q, 'itemfilters:tag needs tag: { value: "<tag>" }');
        }
      }
    }
    if (options.items) {
      for (const q of ch.quests) {
        const ids = [...collectItemIds(q.icon ? { icon: q.icon } : null), ...collectItemIds(q.tasks), ...collectItemIds(q.rewards)];
        for (const id of ids) {
          if (!id || id === 'minecraft:air') continue;
          if (!options.items.has(id)) add('error', 'item-id', ch, q, `unknown item id ${id}`);
        }
        if (options.tags) {
          for (const t of [...q.tasks, ...q.rewards]) {
            const it = t.item;
            if (it && typeof it === 'object' && it.id === 'itemfilters:tag' && it.tag && !options.tags.has(String(it.tag.value))) add('warn', 'item-tag', ch, q, `tag #${it.tag.value} is not in the tags file (a gg_dump only exports tags that recipes use; gg_test_quests checks every tag in game)`);
          }
        }
      }
    }

    // text and rewards
    for (const q of ch.quests) {
      const lines = q.description.map(stripCodes).filter((s) => s.trim() !== '');
      const text = lines.join(' ');
      const words = text.split(/\s+/).filter(Boolean).length;
      const lim = textLimits(cfg, ch.filename);
      if (words > lim.maxWords) add('warn', 'text-length', ch, q, `${words} words (max ${lim.maxWords}${lim.role ? ', ' + lim.role + ' chapter' : ''})`);
      if (lines.length > lim.maxLines) add('warn', 'text-lines', ch, q, `${lines.length} paragraphs (max ${lim.maxLines}${lim.role ? ', ' + lim.role + ' chapter' : ''})`);
      const low = text.toLowerCase();
      for (const p of banned) if (low.includes(p)) add('warn', 'text-phrase', ch, q, `filler phrase "${p}"`);
      if (/[—–]/.test(text)) add('warn', 'text-dash', ch, q, 'long dash in the text: write two sentences instead');
      else if (/\s-\s/.test(text)) add('warn', 'text-dash', ch, q, '" - " used as a dash: write two sentences, or use a colon');
      const qty = /\b\d+\s*(?:x\s*)?(?:ingots?|plates?|dusts?|blocks?|bricks?|logs?|planks?|items?|mb|buckets?|stacks?|nuggets?|gems?|pieces?|cables?|wires?|rods?|bolts?|screws?|gears?|casings?|ores?)\b|\bx\s?\d+\b/i.exec(text);
      if (qty && !quantityOk.has(q.id) && !quantityOkChapters.has(ch.filename)) add('warn', 'text-quantity', ch, q, `quantity in the text ("${qty[0]}"): counts go in the task or in EMI`);
      const infoOnly = q.tasks.length > 0 && q.tasks.every((t) => t.type === 'checkmark');
      if (q.rewards.length === 0 && !infoOnly && !rewardFree(ch) && !noRewardQuests.has(q.id)) add('warn', 'no-reward', ch, q, 'no reward (rule: every quest gives a small one)');
      if (q.rewards.length > (cfg.maxRewardEntries ?? 6) && !manyOk.has(q.id)) add('warn', 'reward-entries', ch, q, `${q.rewards.length} rewards (max ${cfg.maxRewardEntries})`);
      for (const r of q.rewards) {
        const n = Number(r.count ?? (r.item && r.item.Count) ?? 1);
        if (r.type === 'item' && n > 64) add('warn', 'reward-size', ch, q, `reward of ${n} ${r.itemId}`);
      }
      if (q.tasks.length === 0) add('error', 'no-task', ch, q, 'quest without tasks');
      if (lines.length === 0 && !infoOnly) add(classLevel('empty-description'), 'empty-description', ch, q, 'the description is empty: say what the quest is for');
      checkRewardsAndTasks(ch, q);
    }
    const seenTitles = new Map();
    for (const q of ch.quests) {
      const t = stripCodes(q.title).trim().toLowerCase();
      if (!t) continue;
      if (seenTitles.has(t)) add(classLevel('same-title'), 'same-title', ch, q, `same title as another quest of the chapter ("${stripCodes(q.title).trim()}")`, seenTitles.get(t));
      else seenTitles.set(t, q);
    }
  }
  return findings;
}

// Item ids whose use in a recipe-less or hidden way a quest task must not depend on: recipe outputs read from a dump's recipes.json.
// Walks every key named result(s) / output(s) and collects the item ids under it (GT `outputs.item[].content.ingredient.item`,
// vanilla `result.item`, KubeJS `output`, ...).
export function recipeOutputIds(recipeJsons) {
  const out = new Set();
  const grab = (v) => {
    if (!v) return;
    if (typeof v === 'string') { if (/^[a-z0-9_.-]+:[a-z0-9_.\/-]+$/.test(v)) out.add(v); return; }
    if (Array.isArray(v)) { v.forEach(grab); return; }
    if (typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (k === 'item' || k === 'id' || typeof x === 'object') grab(x); }
  };
  const walk = (v) => {
    if (!v || typeof v !== 'object') return;
    if (Array.isArray(v)) { v.forEach(walk); return; }
    for (const [k, x] of Object.entries(v)) { if (/^(results?|outputs?)$/i.test(k)) grab(x); else walk(x); }
  };
  recipeJsons.forEach(walk);
  return out;
}
