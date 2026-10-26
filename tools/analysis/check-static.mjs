// T0 static check of the pack's KubeJS scripts, used by tools/Check-Fast.ps1. No Minecraft, no network.
//   node tools/analysis/check-static.mjs [--pack <dir>]
// Runs every startup, server and client script through lib/kubejs_static.mjs (Node `vm`), then checks:
//   scripts   no script throws while loading or in an event callback (syntax errors included). console.error lines are
//             reported as a count only: the stand-in does not model the mods' materials, so some are expected.
//   lang      every en_us key has an es_es key (es_es may have more: GTM names materials in English itself).
//   registry  every machine, recipe type and grindless: item/block the scripts register has an en_us and es_es name.
// Prints one line per check; problems follow (at most 8 per check). Exit 0 = clean, 1 = problems, 2 = tool failure.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from './lib/kubejs_static.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const i = process.argv.indexOf('--pack');
const packDir = i > 0 ? path.resolve(process.argv[i + 1]) : path.join(repo, 'pack');
const MAX = 8;

let run;
try {
  run = runPackScripts(packDir);
} catch (e) {
  console.log('check-static: tool failure: ' + String(e && e.message ? e.message : e).slice(0, 200));
  process.exit(2);
}

const lines = [];
let failed = false;
const report = (name, problems, info) => {
  lines.push((problems.length ? 'FAIL ' : 'ok   ') + name + (info ? ': ' + info : ''));
  for (const p of problems.slice(0, MAX)) lines.push('     ' + p);
  if (problems.length > MAX) lines.push('     ... ' + (problems.length - MAX) + ' more');
  if (problems.length) failed = true;
};

const thrown = run.errors.filter((e) => e.stage !== 'console.error');
const consoleErrors = run.errors.length - thrown.length;
// kubejs_static keeps 3 stack lines, which for a SyntaxError are the location and source, not the message: re-parse for it.
const describe = (e) => {
  if (/load$/.test(e.stage)) {
    try { new vm.Script(fs.readFileSync(path.join(packDir, e.file), 'utf8'), { filename: e.file }); } catch (se) {
      if (se instanceof SyntaxError) {
        const at = String(se.stack).split('\n')[0];
        return e.file + ' [' + e.stage + '] ' + se.name + ': ' + se.message + ' (' + at + ')';
      }
    }
  }
  return e.file + ' [' + e.stage + '] ' + String(e.message).slice(0, 160);
};
report('scripts', thrown.map(describe),
  thrown.length + ' exceptions, ' + consoleErrors + ' console.error (stand-in, informational)');

const en = run.lang.en_us || {};
const es = run.lang.es_es || {};
const missingEs = Object.keys(en).filter((k) => !(k in es)).sort();
report('lang', missingEs.map((k) => 'es_es missing ' + k), Object.keys(en).length + ' en_us keys, ' + missingEs.length + ' without es_es');

const named = (keys) => keys.some((k) => k in en) && keys.some((k) => k in es);
const unnamed = [];
for (const m of run.registry.machines.values()) {
  if (!named(['block.' + m.id.replace(':', '.')])) unnamed.push('machine ' + m.id + ' (' + m.file + ')');
}
for (const t of run.registry.recipeTypes.values()) {
  if (!named(['gtceu.' + t.id.split(':')[1]])) unnamed.push('recipe type ' + t.id + ' (' + t.file + ')');
}
let items = 0;
for (const it of run.registry.items.values()) {
  if (!it.id.startsWith('grindless:')) continue;
  items++;
  const k = it.id.replace(':', '.');
  if (!named(['item.' + k, 'block.' + k])) unnamed.push('item ' + it.id + ' (' + it.file + ')');
}
report('registry', unnamed, run.registry.machines.size + ' machines, ' + run.registry.recipeTypes.size + ' recipe types, ' + items + ' grindless items');

console.log(lines.join('\n'));
process.exit(failed ? 1 : 0);
