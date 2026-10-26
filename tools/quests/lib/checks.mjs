// Checks shared by lint.mjs (text report) and export.mjs (data for the preview renderer).
// Every finding: { level: 'error' | 'warn' | 'info', rule, chapter, quest?, other?, message }.
import { collectItemIds } from './book.mjs';

const EPS = 0.01;

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

function allowedLongEdge(cfg, from, to) {
  return (cfg.allowLongEdges || []).some((e) => (e.from === from.id && e.to === to.id) || (Array.isArray(e) && e[0] === from.id && e[1] === to.id));
}

export function checkBook(book, cfg, options = {}) {
  const findings = [];
  const add = (level, rule, chapter, quest, message, other) => findings.push({ level, rule, chapter: chapter ? chapter.filename : '', quest: quest ? quest.id : '', questTitle: quest ? questLabel(quest) : '', other: other ? other.id : '', message });
  const only = options.chapters && options.chapters.length ? new Set(options.chapters) : null;
  const inScope = (ch) => !only || only.has(ch.filename);
  const manyOk = new Set((cfg.manyRewardsOk || []).map((e) => e.quest));
  // chapter groups (and single chapters) whose quests give no reward on purpose
  // (lint-config.json noRewardGroups: { groups: [titles], chapters: [file names], why })
  const noRewardGroups = new Set(((cfg.noRewardGroups && cfg.noRewardGroups.groups) || []).map((t) => String(t)));
  const noRewardChapters = new Set(((cfg.noRewardGroups && cfg.noRewardGroups.chapters) || []).map((t) => String(t)));
  const rewardFree = (ch) => noRewardChapters.has(ch.filename) || noRewardGroups.has((book.groups.find((g) => g.id === ch.group) || {}).title);
  // quantityOk: { quest, why } for one quest, or { chapter, why } for a whole chapter whose numbers are its point
  const quantityOk = new Set((cfg.quantityOk || []).filter((e) => e.quest).map((e) => e.quest));
  const quantityOkChapters = new Set((cfg.quantityOk || []).filter((e) => e.chapter).map((e) => e.chapter));
  const banned = (cfg.bannedPhrases || []).map((s) => s.toLowerCase());

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
    const along = (p) => (dir === 'ttb' ? p.y : p.x);
    const across = (p) => (dir === 'ttb' ? p.x : p.y);
    const roots = ch.quests.filter((q) => q.deps.length === 0);
    const allowRoots = new Set((cfg.allowRoots && cfg.allowRoots[ch.filename]) || []);
    // a quest that stands alone on purpose (a placeholder for something being built): allowIsolated: { <chapter>: [ids], _why... }
    const allowIsolated = new Set((cfg.allowIsolated && cfg.allowIsolated[ch.filename]) || []);
    const dependents = new Map();
    for (const q of ch.quests) for (const d of q.deps) { if (!dependents.has(d)) dependents.set(d, []); dependents.get(d).push(q); }

    if (ch.quests.length > 0 && roots.length === 0) add('info', 'root', ch, null, 'no quest without dependencies: the chapter starts from another chapter');
    const sortedRoots = [...roots].sort((a, b) => along(a) - along(b) || across(a) - across(b));
    sortedRoots.slice(1).forEach((q) => { if (!allowRoots.has(q.id)) add('error', 'root', ch, q, `second starting point: "${questLabel(q)}" has no dependency (the chapter starts at "${questLabel(sortedRoots[0])}")`); });

    for (const q of ch.quests) {
      if (q.deps.length === 0 && !(dependents.get(q.id) || []).length && ch.quests.length > 1 && !allowIsolated.has(q.id)) add('error', 'isolated', ch, q, 'floating quest: nothing leads to it and nothing hangs from it');
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
      if (e.length > (cfg.maxEdge ?? 4.6) + EPS && !to.hideDependencyLines && !allowedLongEdge(cfg, from, to)) add('error', 'long-edge', ch, to, `line from "${questLabel(from)}" is ${e.length.toFixed(2)} cells long (max ${cfg.maxEdge})`, from);
      if (!to.hideDependencyLines) {
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
      if (words > (cfg.maxWords ?? 70)) add('warn', 'text-length', ch, q, `${words} words (max ${cfg.maxWords})`);
      if (lines.length > (cfg.maxLines ?? 4)) add('warn', 'text-lines', ch, q, `${lines.length} paragraphs (max ${cfg.maxLines})`);
      const low = text.toLowerCase();
      for (const p of banned) if (low.includes(p)) add('warn', 'text-phrase', ch, q, `filler phrase "${p}"`);
      if (/[—–]/.test(text)) add('warn', 'text-dash', ch, q, 'long dash in the text: write two sentences instead');
      else if (/\s-\s/.test(text)) add('warn', 'text-dash', ch, q, '" - " used as a dash: write two sentences, or use a colon');
      const qty = /\b\d+\s*(?:x\s*)?(?:ingots?|plates?|dusts?|blocks?|bricks?|logs?|planks?|items?|mb|buckets?|stacks?|nuggets?|gems?|pieces?|cables?|wires?|rods?|bolts?|screws?|gears?|casings?|ores?)\b|\bx\s?\d+\b/i.exec(text);
      if (qty && !quantityOk.has(q.id) && !quantityOkChapters.has(ch.filename)) add('warn', 'text-quantity', ch, q, `quantity in the text ("${qty[0]}"): counts go in the task or in EMI`);
      const infoOnly = q.tasks.length > 0 && q.tasks.every((t) => t.type === 'checkmark');
      if (q.rewards.length === 0 && !infoOnly && !rewardFree(ch)) add('warn', 'no-reward', ch, q, 'no reward (rule: every quest gives a small one)');
      if (q.rewards.length > (cfg.maxRewardEntries ?? 6) && !manyOk.has(q.id)) add('warn', 'reward-entries', ch, q, `${q.rewards.length} rewards (max ${cfg.maxRewardEntries})`);
      for (const r of q.rewards) {
        const n = Number(r.count ?? (r.item && r.item.Count) ?? 1);
        if (r.type === 'item' && n > 64) add('warn', 'reward-size', ch, q, `reward of ${n} ${r.itemId}`);
      }
      if (q.tasks.length === 0) add('error', 'no-task', ch, q, 'quest without tasks');
    }
  }
  return findings;
}
