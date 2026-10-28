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
