// Multiblock tooltip lint (docs/research/tier-parity.md TP-D5, docs/quality/recipes.md): every multiblock controller we register says what it
// does and what it can use, in short lines.
//
//   node tools/analysis/tooltip-lint.mjs [--pack pack] [--write-baseline] [--quiet]
//
// Rules, per controller <id> (the machine's name, lang keys grindless.machine.<id>.tooltip.N):
//   TT-COUNT  the startup tooltips(...) array has at most 4 entries (read from the static stand-in's registry, which records the call)
//   TT-FIRST  tooltip.0 exists in en_us and es_es and starts with §7
//   TT-FIRST-LEN  tooltip.0 is at most 80 visible characters (formatting codes stripped)
//   TT-LEN    every other tooltip.N is at most 60 visible characters
//   TT-PARITY en_us and es_es have the same tooltip keys
// The lang values are the stand-in's (it runs ClientEvents.lang, the same lang check-static.mjs reads). Ratchet: tooltip_lint.json
// "baseline" lists today's violations (controller id -> codes); T0 fails on a new one and on a fixed one still listed.
// Exit code: 0 clean, 1 new or stale entries, 2 tool failure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from './lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PACK = path.resolve(here, '..', '..', 'pack');
export const BASELINE_FILE = path.join(here, 'tooltip_lint.json');
export const LIMITS = { entries: 4, first: 80, other: 60 };

export const visible = (s) => String(s).replace(/§./g, '').length;
const eraOf = (file) => (/startup_scripts\/grindless\/([a-z_]+)\//.exec(String(file || '').replace(/\\/g, '/')) || [])[1] || '?';

/** Our multiblock controllers: [{id, name, era, entries}] from the stand-in's registry (entries: the tooltips(...) array length, null when unknown). */
export function controllersOf(registry) {
  const out = [];
  for (const m of registry.machines.values()) {
    if (m.kind !== 'multiblock' || !/startup_scripts\/grindless\//.test(String(m.file || '').replace(/\\/g, '/'))) continue;
    out.push({ id: m.id, name: m.name, era: eraOf(m.file), entries: Array.isArray(m.tooltips) ? m.tooltips.length : m.tooltips === undefined ? 0 : null });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

const tipKeys = (lang, name) => {
  const re = new RegExp(`^grindless\\.machine\\.${name}\\.tooltip\\.(\\d+)$`);
  return Object.keys(lang || {}).map((k) => re.exec(k)).filter(Boolean).map((m) => Number(m[1])).sort((a, b) => a - b);
};

/** controllers from controllersOf; lang {en_us, es_es}. Returns [{id, era, code, detail}], sorted. */
export function lint(controllers, lang) {
  const out = [];
  for (const c of controllers) {
    const add = (code, detail) => out.push({ id: c.id, era: c.era, code, detail });
    if (c.entries !== null && c.entries > LIMITS.entries) add('TT-COUNT', `${c.entries} entries, at most ${LIMITS.entries}`);
    const keys = { en_us: tipKeys(lang.en_us, c.name), es_es: tipKeys(lang.es_es, c.name) };
    for (const l of ['en_us', 'es_es']) {
      const first = (lang[l] || {})[`grindless.machine.${c.name}.tooltip.0`];
      if (first === undefined) add('TT-FIRST', `${l} tooltip.0 missing`);
      else {
        if (!String(first).startsWith('§7')) add('TT-FIRST', `${l} tooltip.0 does not start with §7`);
        if (visible(first) > LIMITS.first) add('TT-FIRST-LEN', `${l} tooltip.0 has ${visible(first)} chars, at most ${LIMITS.first}`);
      }
      for (const n of keys[l]) {
        if (n === 0) continue;
        const text = lang[l][`grindless.machine.${c.name}.tooltip.${n}`];
        if (visible(text) > LIMITS.other) add('TT-LEN', `${l} tooltip.${n} has ${visible(text)} chars, at most ${LIMITS.other}`);
      }
    }
    if (keys.en_us.join() !== keys.es_es.join()) add('TT-PARITY', `en_us tooltip keys [${keys.en_us}] differ from es_es [${keys.es_es}]`);
  }
  return out.sort((a, b) => a.id.localeCompare(b.id) || a.code.localeCompare(b.code));
}

export function compare(findings, baseline) {
  const got = new Map();
  for (const f of findings) { if (!got.has(f.id)) got.set(f.id, new Set()); got.get(f.id).add(f.code); }
  const fresh = findings.filter((f) => !(baseline[f.id] || []).includes(f.code));
  const stale = [];
  for (const [id, codes] of Object.entries(baseline)) for (const c of codes) if (!(got.get(id) && got.get(id).has(c))) stale.push(`${id}|${c}`);
  return { fresh, stale };
}

export const baselineOf = (findings) => {
  const b = {};
  for (const f of findings) { (b[f.id] = b[f.id] || []); if (!b[f.id].includes(f.code)) b[f.id].push(f.code); }
  return Object.fromEntries(Object.entries(b).sort(([a], [c]) => a.localeCompare(c)));
};

export const loadBaseline = (file = BASELINE_FILE) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).baseline || {} : {});

/** Controllers per era and code, for the report. */
export function counts(findings) {
  const seen = new Set();
  const by = {};
  for (const f of findings) {
    if (seen.has(f.id + f.code)) continue;
    seen.add(f.id + f.code);
    const e = (by[f.era] = by[f.era] || {});
    e[f.code] = (e[f.code] || 0) + 1;
  }
  return by;
}

function main(argv) {
  const i = argv.indexOf('--pack');
  const pack = i >= 0 ? argv[i + 1] : DEFAULT_PACK;
  const run = runPackScripts(pack);
  const controllers = controllersOf(run.registry);
  const findings = lint(controllers, run.lang);
  if (argv.includes('--write-baseline')) {
    const b = baselineOf(findings);
    const body = Object.entries(b).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n');
    fs.writeFileSync(BASELINE_FILE, `{\n "_doc": "Baseline of tools/analysis/tooltip-lint.mjs (docs/quality/recipes.md, Multiblock tooltips): controller id -> codes still violated. T0 fails on new violations and on fixed ones still listed. Regenerate with --write-baseline only after fixing.",\n "baseline": {\n${body}\n }\n}\n`);
    process.stdout.write(`baseline: ${Object.keys(b).length} controllers; ${JSON.stringify(counts(findings))}\n`);
    return 0;
  }
  const { fresh, stale } = compare(findings, loadBaseline());
  const lines = [`ok tooltips: ${controllers.length} controllers, ${findings.length} violations in baseline`];
  if (fresh.length || stale.length) lines[0] = `FAIL tooltips: ${controllers.length} controllers, ${fresh.length} new, ${stale.length} stale`;
  for (const f of fresh) lines.push(`     NEW ${f.code} ${f.id} (${f.era}): ${f.detail}`);
  for (const s of stale) lines.push(`     STALE baseline ${s}: fixed, remove it (node tools/analysis/tooltip-lint.mjs --write-baseline)`);
  if (!argv.includes('--quiet') || fresh.length || stale.length) process.stdout.write(lines.join('\n') + '\n');
  return fresh.length || stale.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { process.stderr.write(String(e && e.stack || e) + '\n'); process.exitCode = 2; }
}
