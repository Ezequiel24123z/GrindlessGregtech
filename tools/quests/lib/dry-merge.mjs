// Dry merge (QB-0): what would the book look like with one chapter per era? Copies the book to a temp dir, replaces every era's
// chapters with the merged <era>_age, lints it with the merged-era rules and returns the counts per era. Writes nothing in the pack.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ERAS, buildWorld, renderWorld } from './chapter-gen.mjs';
import { loadBook } from './book.mjs';
import { checkBook } from './checks.mjs';

export const REPORT_RULES = ['connectivity', 'long-edge', 'overlap', 'crowded', 'through-node', 'crossing', 'backward', 'vertical-long'];

export function dryMerge({ eraMods, bookRoot, cfg, eras }) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gg-dry-merge-'));
  try {
    fs.cpSync(bookRoot, tmp, { recursive: true });
    const chapDir = path.join(tmp, 'chapters');
    const world = buildWorld(eraMods, {});
    const names = eras || [...world.eras.keys()];
    // the underscore keeps lv_ apart from luv_ and max_ from maxplus_
    for (const f of fs.readdirSync(chapDir)) if (ERAS.some((e) => f.startsWith(e + '_'))) fs.rmSync(path.join(chapDir, f));
    const merged = renderWorld(world, [...world.eras.keys()]);
    for (const ch of merged) fs.writeFileSync(path.join(chapDir, ch.filename + '.snbt'), ch.text, 'utf8');
    const findings = checkBook(loadBook(tmp), cfg, { mergedEras: true });
    const report = [];
    for (const era of names) {
      const e = world.eras.get(era);
      const file = `${era}_age`;
      const mine = findings.filter((f) => f.chapter === file && f.level !== 'info');
      const counts = {};
      for (const r of REPORT_RULES) counts[r] = mine.filter((f) => f.rule === r).length;
      const other = mine.filter((f) => !REPORT_RULES.includes(f.rule)).length;
      const ch = merged.find((m) => m.filename === file);
      report.push({ era, chapter: file, quests: ch ? ch.counts.quests ?? null : null, droppedLinks: e && e.droppedLinks ? e.droppedLinks.length : 0, counts, other, total: mine.length });
    }
    return report;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

export function formatReport(report) {
  const lines = [];
  for (const r of report) {
    const parts = REPORT_RULES.filter((k) => r.counts[k]).map((k) => `${k} ${r.counts[k]}`);
    if (r.other) parts.push(`other ${r.other}`);
    lines.push(`${r.chapter}: quests ${r.quests ?? '?'}, dropped same-era links ${r.droppedLinks}, findings ${r.total}${parts.length ? ' (' + parts.join(', ') + ')' : ''}`);
  }
  return lines;
}
