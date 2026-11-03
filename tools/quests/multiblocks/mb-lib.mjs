// Pure helpers of the Multiblocks chapter: ids, band layout and the chapter's SNBT. No dump, no file access.
import crypto from 'node:crypto';
import { CHAPTER, TIERS, TIER_NAMES, MOD_NAMES, labelIcon } from './mb-data.mjs';

export const COLS = 12; // controllers per row
export const PITCH_X = 2; // docs/quests.md section 4: a column every 2 squares
export const PITCH_Y = 2; // rows every 2: our multiblocks are 1.5 gears and boxes need 0.25 of air (section 4 says 1.5 for 1.25 boxes)
export const BAND_GAP = 1; // extra empty squares between two bands
export const SIZE = { machine: 1.25, ours: 1.5, label: 1.5 };

// 16 uppercase hex digits, first digit 1-7 (docs/quests.md section 10), stable for a seed
export function hid(seed) {
  const b = crypto.createHash('sha1').update(seed).digest().subarray(0, 8);
  b[0] = ((1 + (b[0] >> 4) % 7) << 4) | (b[0] & 0x0f);
  return b.toString('hex').toUpperCase();
}

export const tierRank = (t) => {
  const i = TIERS.indexOf(t);
  return i < 0 ? TIERS.length : i;
};
export const tierName = (t) => TIER_NAMES[t] || String(t).toUpperCase();

// a stable "ours first, then alphabetical by English name" order
export function sortControllers(list) {
  return [...list].sort((a, b) => (b.ours ? 1 : 0) - (a.ours ? 1 : 0) || a.name.localeCompare(b.name, 'en') || a.id.localeCompare(b.id));
}

// controllers: [{ id, name, tier, ours }] -> [{ tier, label: {x, y}, cells: [{ ...controller, x, y }] }] in band order; empty bands skipped
export function layoutBands(controllers) {
  const byTier = new Map();
  for (const c of controllers) {
    if (!byTier.has(c.tier)) byTier.set(c.tier, []);
    byTier.get(c.tier).push(c);
  }
  const tiers = [...byTier.keys()].sort((a, b) => tierRank(a) - tierRank(b) || a.localeCompare(b));
  const bands = [];
  let y = 0;
  for (const tier of tiers) {
    const list = sortControllers(byTier.get(tier));
    const cells = list.map((c, i) => ({ ...c, x: PITCH_X * (1 + (i % COLS)), y: y + PITCH_Y * Math.floor(i / COLS) }));
    bands.push({ tier, label: { x: 0, y }, cells });
    y += PITCH_Y * Math.ceil(list.length / COLS) + BAND_GAP;
  }
  return bands;
}

export function originOf(id, ours) {
  if (ours) return 'Grindless';
  const ns = id.split(':')[0];
  return MOD_NAMES[ns] || ns;
}

// ---------------------------------------------------------------- descriptions (docs/quests.md, section 19): text from data only
export const DESC_MAX_CHARS = 450;
export const DESC_MAX_WORDS = 66; // lint-config limits.default.maxWords is 70
const SENTENCE_QTY = /\b\d+\s*(?:x\s*)?(?:ingots?|plates?|dusts?|blocks?|bricks?|logs?|planks?|items?|mb|buckets?|stacks?|nuggets?|gems?|pieces?|cables?|wires?|rods?|bolts?|screws?|gears?|casings?|ores?)\b|\bx\s?\d+\b/i;

const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
const words = (s) => s.split('_').filter(Boolean);
// words that are acronyms or have a fixed spelling when a name has to be built from an id
export const ACRONYMS = {
  ebf: 'EBF', lcr: 'LCR', cvd: 'CVD', pvd: 'PVD', mocvd: 'MOCVD', mbe: 'MBE', ald: 'ALD', mtj: 'MTJ', mram: 'MRAM', me: 'ME', ae: 'AE', ae2: 'AE2', bfo: 'BFO', cofe: 'CoFe', cofeb: 'CoFeB',
  aln: 'AlN', pcb: 'PCB', smd: 'SMD', cpu: 'CPU', ram: 'RAM', lpe: 'LPE', led: 'LED', hts: 'HTS', snspd: 'SNSPD', qpu: 'QPU', tbc: 'TBC',
  pmn: 'PMN', hd: 'HD', fcl: 'FCL', cmos: 'CMOS', sic: 'SiC', si: 'Si', nb: 'Nb', ito: 'ITO', uv: 'UV', ic: 'IC', soc: 'SoC', nand: 'NAND',
  hsla: 'HSLA', ptfe: 'PTFE', pvc: 'PVC', pbi: 'PBI', yig: 'YIG', zblan: 'ZBLAN', ndfeb: 'NdFeB', smco: 'SmCo', beuv: 'BEUV', euv: 'EUV',
  ulv: 'ULV', rf: 'RF', dna: 'DNA', rna: 'RNA', ev: 'EV',
};
const idTitle = (id) => words(id.split(':').pop().replace(/\//g, '_')).map((w) => TIER_NAMES[w] || ACRONYMS[w] || cap(w)).join(' ');
export { idTitle };

// GTM's form words, longest first, for ids like gtceu:<material>_<form> whose material our lang names
const FORMS = [['tiny_dust', 'Tiny Dust'], ['small_dust', 'Small Dust'], ['long_rod', 'Long Rod'], ['small_gear', 'Small Gear'], ['fine_wire', 'Fine Wire'],
  ['dust', 'Dust'], ['ingot', 'Ingot'], ['plate', 'Plate'], ['nugget', 'Nugget'], ['gem', 'Gem'], ['rod', 'Rod'], ['foil', 'Foil'], ['ring', 'Ring'],
  ['bolt', 'Bolt'], ['screw', 'Screw'], ['gear', 'Gear'], ['rotor', 'Rotor'], ['round', 'Round']];

// a display name for an item, block, fluid or tag id. Our lang first (item/block.<ns>.<path>, material.gtceu.<name> plus the form word), then
// the id with acronyms: "forge:plates/steel" -> "Steel plates", "gtceu:circuits/hv" -> "HV circuits"
export function niceName(id, lang = {}) {
  const isTag = id.startsWith('#');
  if (isTag) id = id.slice(1);
  const [ns, path] = id.includes(':') ? id.split(':') : ['minecraft', id];
  if (!isTag) {
    for (const k of [`item.${ns}.${path}`, `block.${ns}.${path}`, `fluid.${ns}.${path}`]) if (lang[k]) return lang[k];
    if (ns === 'gtceu') {
      if (lang[`material.gtceu.${path}`]) return lang[`material.gtceu.${path}`];
      for (const [form, label] of FORMS) {
        if (path.endsWith('_' + form) && lang[`material.gtceu.${path.slice(0, -form.length - 1)}`]) return `${lang[`material.gtceu.${path.slice(0, -form.length - 1)}`]} ${label}`;
      }
    }
  }
  if (!path.includes('/')) return idTitle(id);
  const [category, ...rest] = path.split('/');
  const mat = rest.join('/');
  if (category === 'circuits') return `${mat.toUpperCase()} circuits`;
  const matName = lang[`material.gtceu.${mat}`] || words(mat).map((w) => ACRONYMS[w] || cap(w)).join(' ');
  return `${matName} ${category.replace(/_/g, ' ')}`;
}

export function joinList(list) {
  if (list.length <= 1) return list.join('');
  return list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
}

// the id of one recipe content entry: an item, a tag or a fluid
function contentId(c) {
  if (!c || typeof c !== 'object') return null;
  const v = c.ingredient || c;
  if (Array.isArray(v.value) && v.value.length) return contentId(v.value[0]);
  if (v.item) return typeof v.item === 'string' ? v.item : v.item.id || null;
  if (v.fluid) return v.fluid;
  if (v.tag) return '#' + v.tag;
  if (typeof v.id === 'string') return v.id;
  return null;
}

// crafting and machine recipe outputs of one recipe json: every id it produces, first main output first
export function recipeOutputIds(j) {
  const out = [];
  if (j.result) out.push(contentId(j.result));
  const o = j.outputs || {};
  for (const kind of ['item', 'fluid']) for (const e of o[kind] || []) out.push(contentId(e.content));
  return out.filter(Boolean);
}

// the main product of a machine recipe: the first item output without a chance, else the first fluid output
function mainProduct(j) {
  const o = j.outputs || {};
  for (const kind of ['item', 'fluid']) {
    for (const e of o[kind] || []) {
      if (e.chance !== undefined && e.chance < 10000) continue;
      const id = contentId(e.content);
      if (id) return id;
    }
  }
  return null;
}

// ingredient ids of one recipe json, most used first (shaped crafting counts its pattern), circuits and ids without a name skipped
export function recipeInputIds(j) {
  const order = [];
  const count = new Map();
  const add = (id, n = 1) => {
    if (!id) return;
    if (!count.has(id)) order.push(id);
    count.set(id, (count.get(id) || 0) + n);
  };
  if (j.key && j.pattern) {
    const uses = {};
    for (const row of j.pattern) for (const ch of row) uses[ch] = (uses[ch] || 0) + 1;
    for (const k of Object.keys(j.key)) add(contentId(j.key[k]), uses[k] || 1);
  }
  for (const e of Array.isArray(j.ingredients) ? j.ingredients : []) add(contentId(e));
  const inp = j.inputs || {};
  for (const kind of ['item', 'fluid']) for (const e of inp[kind] || []) add(contentId(e.content));
  return order.sort((a, b) => count.get(b) - count.get(a) || order.indexOf(a) - order.indexOf(b));
}

// recipes: [{ i, t, j }]; controllers: [{ id }]; returns Map id -> ingredient ids of its cheapest-id-sorted recipe
export function controllerInputs(recipes, controllers) {
  const idSet = new Set(controllers.map((c) => c.id));
  const best = new Map();
  for (const r of recipes) {
    if (!r.j) continue;
    for (const id of recipeOutputIds(r.j)) {
      if (!idSet.has(id)) continue;
      const cur = best.get(id);
      if (!cur || String(r.i) < String(cur.i)) best.set(id, r);
    }
  }
  const out = new Map();
  for (const [id, r] of best) out.set(id, recipeInputIds(r.j));
  return out;
}

// how many recipes consume each plain item or fluid id
export function consumerCounts(recipes) {
  const n = new Map();
  for (const r of recipes) {
    if (!r.j) continue;
    for (const id of new Set(recipeInputIds(r.j))) if (typeof id === 'string' && !id.startsWith('#')) n.set(id, (n.get(id) || 0) + 1);
  }
  return n;
}

const BY_FORM = /nugget|(?:^|_)(?:tiny|small)_|impure|pure_|_pile|crushed|scrap|slag/;
// GTM's recycling rows (category <type>_recycling, as obtain.mjs reads them) take crafted items apart; they never name what a machine
// unlocks, and their counts change between boots (GTM resolves material info in hash order)
const isRecycling = (j) => typeof j.category === 'string' && /_recycling$/.test(j.category);

// the products of the recipes of some recipe types worth naming: [{ id, n }]. Main outputs that other recipes consume come first, nuggets and
// other by-forms last; then the more recipes make it, then the id. Recycling rows are skipped.
export function mainProducts(recipes, typeIds, limit = 4, consumers = new Map()) {
  const types = new Set(typeIds);
  const n = new Map();
  for (const r of recipes) {
    if (!r.j || !types.has(r.t) || isRecycling(r.j)) continue;
    const id = mainProduct(r.j);
    if (id) n.set(id, (n.get(id) || 0) + 1);
  }
  const rank = (id) => (BY_FORM.test(id.split(':').pop()) ? 2 : (consumers.get(id) || 0) > 0 ? 0 : 1);
  return [...n].map(([id, c]) => ({ id, n: c }))
    .sort((a, b) => rank(a.id) - rank(b.id) || b.n - a.n || (consumers.get(b.id) || 0) - (consumers.get(a.id) || 0) || a.id.localeCompare(b.id)).slice(0, limit);
}

// the main casing and the heating coil of a structure ({ slices, symbols } of structures.json), by block count
export function structureParts(st) {
  if (!st || !st.slices) return null;
  const uses = {};
  for (const sl of st.slices) for (const row of sl) for (const ch of row) uses[ch] = (uses[ch] || 0) + 1;
  const blocks = new Map();
  for (const [sym, def] of Object.entries(st.symbols || {})) {
    const opts = def.kind === 'oneOf' ? def.options || [] : [def];
    for (const o of opts) {
      if (o.kind !== 'blocks' || !o.blocks || !o.blocks.length) continue;
      const id = o.blocks[0];
      blocks.set(id, (blocks.get(id) || 0) + (uses[sym] || 0));
    }
  }
  const ranked = [...blocks].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const coil = ranked.find(([id]) => /coil/.test(id));
  const casing = ranked.find(([id]) => /casing|machine_hull|firebricks|solid_machine/.test(id) && !/coil|pipe|gearbox|turbine/.test(id)) || ranked.find(([id]) => !/coil|frame/.test(id));
  return { casing: casing ? casing[0] : null, coil: coil ? coil[0] : null };
}

const part = (s) => s.replace(/(?:§|\\u00a7)./gi, '').replace(/\s*[—–]\s*/g, ', ').replace(/\s+/g, ' ').trim();
const endSentence = (s) => (/[.!?]$/.test(s) ? s : s + '.');

// c: { name, ours, origin, tooltip, types: [id], io: [itemIn, itemOut, fluidIn, fluidOut], products: [id], parts: { casing, coil },
//      inputs: [id], usedBy: [name] }. Returns one paragraph, at most DESC_MAX_CHARS characters and DESC_MAX_WORDS words.
export function describeController(c) {
  const nameOf = c.nameOf || niceName;
  const typeNames = (c.types || []).map(idTitle);
  const shown = typeNames.length > 3 ? [...typeNames.slice(0, 3), 'others'] : typeNames;
  const clean = (ids) => ids.map((x) => nameOf(x)).filter((n) => !SENTENCE_QTY.test(n));
  const build = (o) => {
    const out = [];
    const tip = c.tooltip && !SENTENCE_QTY.test(c.tooltip) ? endSentence(part(c.tooltip)) : '';
    if (tip) out.push(tip);
    else out.push(shown.length ? `A ${c.origin} multiblock for ${joinList(shown)} recipes.` : `A ${c.origin} multiblock.`);
    if (tip && shown.length) out.push(`Runs ${joinList(shown)} recipes.`);
    const p = c.parts || {};
    if (p.casing) {
      const cn = p.coil ? nameOf(p.coil) : '';
      const coil = cn && o.coil ? (/ coil block$/i.test(cn) ? `, with ${cn.replace(/ coil block$/i, '')} coils` : `, with ${cn}`) : '';
      const casingName = nameOf(p.casing);
      out.push(`Build it mostly from ${SENTENCE_QTY.test(casingName) ? casingName.replace(/^(.*?)(\d+) (\w+)$/, '$3 type $1$2') : casingName}${coil}.`);
    }
    const ins = clean(c.inputs || []).slice(0, o.inputs);
    if (ins.length) out.push(`The controller is crafted from ${joinList(ins)}.`);
    const prods = clean((c.products || []).map((x) => x.id || x)).slice(0, o.products);
    if (prods.length) out.push(`Unlocks ${joinList(prods)}.`);
    if (o.usedBy && (c.usedBy || []).length) out.push(`Also needed to craft ${joinList(c.usedBy.slice(0, 2))}.`);
    if (o.automate && c.io) {
      const [ii, io, fi, fo] = c.io;
      const feed = [ii > 0 ? 'item buses' : '', fi > 0 ? 'fluid hatches' : ''].filter(Boolean);
      const take = [io > 0 ? 'item buses' : '', fo > 0 ? 'fluid hatches' : ''].filter(Boolean);
      if (feed.length && take.length) out.push(`Automate it through input ${joinList(feed)} and output ${joinList(take)}.`);
      else if (feed.length) out.push(`Automate it through input ${joinList(feed)}.`);
      else if (take.length) out.push(`Automate it through output ${joinList(take)}.`);
    }
    return out.join(' ');
  };
  const steps = [
    { inputs: 3, products: 3, coil: true, usedBy: true, automate: true },
    { inputs: 3, products: 3, coil: true, usedBy: false, automate: true },
    { inputs: 3, products: 3, coil: true, usedBy: false, automate: false },
    { inputs: 2, products: 2, coil: true, usedBy: false, automate: false },
    { inputs: 2, products: 2, coil: false, usedBy: false, automate: false },
    { inputs: 1, products: 1, coil: false, usedBy: false, automate: false },
    { inputs: 0, products: 1, coil: false, usedBy: false, automate: false },
    { inputs: 0, products: 0, coil: false, usedBy: false, automate: false },
  ];
  let text = '';
  for (const s of steps) {
    text = build(s);
    if (text.length <= DESC_MAX_CHARS && text.split(/\s+/).length <= DESC_MAX_WORDS) return text;
  }
  const first = text.split(/(?<=\.) /)[0];
  return first.length <= DESC_MAX_CHARS ? first : first.slice(0, DESC_MAX_CHARS - 1).replace(/\s+\S*$/, '') + '.';
}

// our tooltips: machine name -> first tooltip line, from grindless.machine.<name>.tooltip.0 in the lang scripts
export function tooltipsFromLang(text) {
  const out = new Map();
  for (const m of text.matchAll(/grindless\.machine\.([a-z0-9_]+)\.tooltip\.0['"]\s*,\s*(['"])((?:\\.|(?!\2)[^\\])*)\2/g)) {
    if (!out.has(m[1])) out.set(m[1], m[3].replace(/\\(['"\\])/g, '$1'));
  }
  return out;
}

// the descriptions of a list of controllers [{ id, name, ours, ... }]: Map id -> text. All inputs are plain data, so a test can feed them.
export function describeAll({ controllers, machines, recipeTypes, recipes, structures, tooltips, lang = {} }) {
  const nameOf = (id) => niceName(id, lang);
  const consumers = consumerCounts(recipes);
  const byId = new Map(machines.map((m) => [m.id, m]));
  const ioOf = new Map(recipeTypes.map((t) => [t.id, t.io || [0, 0, 0, 0]]));
  const inputs = controllerInputs(recipes, controllers);
  const usedBy = new Map();
  for (const c of controllers) for (const id of inputs.get(c.id) || []) {
    if (id === c.id) continue;
    if (!usedBy.has(id)) usedBy.set(id, []);
    usedBy.get(id).push(nameOf(c.id));
  }
  const out = new Map();
  for (const c of controllers) {
    const m = byId.get(c.id) || {};
    const types = (m.types || []).filter((t) => ioOf.has(t) || recipes.some((r) => r.t === t));
    const io = types.length ? types.reduce((a, t) => a.map((v, i) => v + (ioOf.get(t) || [0, 0, 0, 0])[i]), [0, 0, 0, 0]) : null;
    out.set(c.id, describeController({
      name: nameOf(c.id),
      ours: c.ours,
      origin: originOf(c.id, c.ours),
      tooltip: c.ours ? tooltips.get(c.id.split(':')[1]) : null,
      types,
      io,
      products: mainProducts(recipes, types, 3, consumers),
      nameOf,
      parts: structureParts(structures[c.id]),
      inputs: inputs.get(c.id) || [],
      usedBy: (usedBy.get(c.id) || []).slice().sort(),
    }));
  }
  return out;
}

// ---------------------------------------------------------------- SNBT (the book's format: tabs, LF, keys sorted)
const str = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
function dnum(v) {
  return Number.isInteger(v) ? v + '.0d' : String(v) + 'd';
}
const compound = (fields) => '{ ' + Object.keys(fields).sort().map((k) => k + ': ' + fields[k]).join(', ') + ' }';

function questSnbt(f, indent) {
  const inner = indent + '\t';
  const keys = Object.keys(f).sort();
  return [indent + '{', ...keys.map((k) => inner + k + ': ' + f[k]), indent + '}'].join('\n');
}

export const XP = 10; // the side-quest reward: ~300 quests, so really small

function controllerQuest(c, indent) {
  return questSnbt({
    ...(c.desc ? { description: '[' + str(c.desc) + ']' } : {}),
    icon: str(c.id),
    id: str(hid('multiblocks:' + c.id)),
    rewards: '[' + compound({ id: str(hid('multiblocks:reward:' + c.id)), type: '"xp"', xp: String(XP) }) + ']',
    shape: '"gear"',
    size: dnum(c.ours ? SIZE.ours : SIZE.machine),
    subtitle: str(`${tierName(c.tier)}, ${originOf(c.id, c.ours)}`),
    tasks: '[' + compound({ id: str(hid('multiblocks:task:' + c.id)), item: str(c.id), type: '"item"' }) + ']',
    x: dnum(c.x),
    y: dnum(c.y),
  }, indent);
}

export function labelId(tier) {
  return hid('multiblocks:label:' + tier);
}

function labelQuest(tier, pos, indent) {
  return questSnbt({
    icon: str(labelIcon(tier)),
    id: str(labelId(tier)),
    shape: '"rsquare"',
    size: dnum(SIZE.label),
    subtitle: str(tier === 'steam' ? 'Steam Age multiblocks' : `${tierName(tier)} multiblocks`),
    tasks: '[' + compound({ id: str(hid('multiblocks:label:task:' + tier)), type: '"checkmark"' }) + ']',
    title: str(tierName(tier)),
    x: dnum(pos.x),
    y: dnum(pos.y),
  }, indent);
}

export function chapterSnbt(bands) {
  if (!bands.length) throw new Error('no bands');
  const quests = [];
  for (const b of bands) {
    quests.push(labelQuest(b.tier, b.label, '\t\t'));
    for (const c of b.cells) quests.push(controllerQuest(c, '\t\t'));
  }
  return [
    '{',
    '\tautofocus_id: ' + str(labelId(bands[0].tier)),
    '\tconsume_items: false',
    '\tdefault_hide_dependency_lines: false',
    '\tdefault_quest_shape: ""',
    '\tfilename: ' + str(CHAPTER.file),
    '\tgroup: ' + str(CHAPTER.groupId),
    '\ticon: ' + str(CHAPTER.icon),
    '\tid: ' + str(hid('multiblocks:chapter')),
    '\torder_index: ' + CHAPTER.order,
    '\tprogression_mode: "flexible"',
    '\tquest_links: [ ]',
    '\tquests: [',
    quests.join('\n'),
    '\t]',
    '\tsubtitle: [' + str(CHAPTER.subtitle) + ']',
    '\ttitle: ' + str(CHAPTER.title),
    '}',
  ].join('\n') + '\n';
}
