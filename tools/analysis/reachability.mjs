#!/usr/bin/env node
// Validador estático de progresión de Gregtech Grindless.
// Uso:  node tools/analysis/reachability.mjs --tier steam --dump <carpeta con recipes.json, tags.json, items.json ...>
// Sin dependencias; Node >= 18. Salida 0 = PASS, 1 = FAIL, 2 = error de uso/datos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTierConfig } from './lib/config.mjs';
import { loadDump } from './lib/dump.mjs';
import { buildModel } from './lib/model.mjs';
import { runPasses } from './lib/analyze.mjs';
import { analyze, renderText, toJson } from './lib/report.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  return `Uso: node reachability.mjs --tier <steam|lv> --dump <carpeta> [opciones]
  --tier <nombre>     config en tiers/<nombre>.json (o --config <ruta>)
  --dump <carpeta>    volcado de gg_dump (recipes.json, tags.json, items.json, machines.json, veins.json)
  --pass <both|gate|auto>   qué paso ejecutar (por defecto both)
  --out <archivo>     guarda el informe de texto además de imprimirlo
  --json <archivo>    guarda el resultado en JSON
  --explain <texto>   imprime la derivación de los objetivos cuyo id/nombre contenga el texto (aunque den PASS)
  --verbose           imprime la derivación de todos los objetivos
  --quiet             solo veredicto y resumen
`;
}

function parseArgs(argv) {
  const o = { pass: 'both' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--tier') o.tier = next();
    else if (a === '--config') o.config = next();
    else if (a === '--dump') o.dump = next();
    else if (a === '--pass') o.pass = next();
    else if (a === '--out') o.out = next();
    else if (a === '--json') o.json = next();
    else if (a === '--explain') o.explain = next();
    else if (a === '--verbose') o.verbose = true;
    else if (a === '--quiet') o.quiet = true;
    else if (a === '-h' || a === '--help') o.help = true;
    else throw new Error(`argumento desconocido: ${a}`);
  }
  return o;
}

function loadConfig(o) {
  return loadTierConfig(o, path.join(here, 'tiers'));
}

function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.help || (!o.tier && !o.config) || !o.dump) {
    process.stdout.write(usage());
    process.exit(o.help ? 0 : 2);
  }
  const { raw, file } = loadConfig(o);
  const dump = loadDump(path.resolve(o.dump));
  const t0 = Date.now();
  const model = buildModel(dump, raw);
  const res = runPasses(model);
  const out = analyze(model, res, { verbose: o.verbose, explain: o.explain, pass: o.pass });
  const text = renderText(model, res, out, { pass: o.pass });
  const header = `Config  : ${file}\n`;
  const body = o.quiet ? text.split('\n').filter((l) => /^(===|VEREDICTO|PASO|  (FAIL|WARN) )/.test(l)).join('\n') + '\n' : text;
  process.stdout.write(body.replace(/\n(Modelo {2}:)/, `\n${header}$1`));
  process.stdout.write(`(análisis en ${Date.now() - t0} ms)\n`);
  if (o.out) fs.writeFileSync(path.resolve(o.out), body.replace(/\n(Modelo {2}:)/, `\n${header}$1`), 'utf8');
  if (o.json) fs.writeFileSync(path.resolve(o.json), JSON.stringify(toJson(model, res, out), null, 2), 'utf8');
  process.exit(out.verdict === 'PASS' ? 0 : 1);
}

try {
  main();
} catch (e) {
  process.stderr.write(`ERROR: ${e.message}\n`);
  process.exit(2);
}
