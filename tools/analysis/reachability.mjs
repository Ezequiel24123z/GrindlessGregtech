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
import { analyze, renderText, summaryParts, toJson } from './lib/report.mjs';
import { hiddenTable, obtainToJson, renderHiddenTable, renderObtainMarkdown, renderObtainText, runObtain } from './lib/obtain.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const PASSES = ['both', 'gate', 'auto', 'eras', 'obtain'];

function usage() {
  return `Uso: node reachability.mjs --tier <steam|lv|mv|hv|next/hv> --dump <carpeta> [opciones]
       node reachability.mjs --pass obtain --dump <carpeta> [--md <archivo>]
  --tier <nombre>     config en tiers/<nombre>.json (o --config <ruta>); next/<tier> = la capa preparada de la versión siguiente
  --dump <carpeta>    volcado de gg_dump (recipes.json, tags.json, items.json, machines.json, veins.json, fluid_veins.json, config.json)
  --pass <both|gate|auto|eras|obtain>   qué paso ejecutar (por defecto both = los tres: puerta, automático y regla de eras;
                      obtain = auditoría de lo que no se consigue nunca, con tiers/obtain.json si el tier no trae sección "obtain")
  --dimension <id|all>  dimensión donde está la fábrica (por defecto la del tier, Overworld); "all" = todas las de \`contexts\`
  --out <archivo>     guarda el informe de texto además de imprimirlo
  --json <archivo>    guarda el resultado en JSON
  --md <archivo>      (obtain) guarda el informe en Markdown: tabla por clase, la lista A entera y las B y C compactas
  --table <archivo>   (obtain) escribe la tabla de ocultos del pack (kubejs/data/grindless/tables/hidden_until.json): grupos B con
                      su era y C con las recetas a quitar; conserva las recetas quitadas que ya listaba el archivo
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
    else if (a === '--dimension') o.dimension = next();
    else if (a === '--out') o.out = next();
    else if (a === '--json') o.json = next();
    else if (a === '--md') o.md = next();
    else if (a === '--table') o.table = next();
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

/** Dimensiones a comprobar: la indicada, o con "all" las del tier (`contexts`). */
function contextsOf(o, raw) {
  const home = raw.dimension || 'minecraft:overworld';
  if (o.dimension === 'all') return raw.contexts && raw.contexts.length > 0 ? raw.contexts : [home];
  return [o.dimension || home];
}

function runContext(raw, dump, o, dimension, file) {
  const t0 = Date.now();
  const model = buildModel(dump, { ...raw, dimension });
  const res = runPasses(model);
  const out = analyze(model, res, { verbose: o.verbose, explain: o.explain, pass: o.pass });
  const text = renderText(model, res, out, { pass: o.pass });
  const header = `Config  : ${file}\n`;
  const body = o.quiet ? text.split('\n').filter((l) => /^(===|Contexto|VEREDICTO|PASO|  (FAIL|WARN) )/.test(l)).join('\n') + '\n' : text;
  return { dimension, model, res, out, body: body.replace(/\n(Modelo {2}:)/, `\n${header}$1`), ms: Date.now() - t0 };
}

/**
 * Paso obtain: auditoría de lo que no se consigue nunca (lib/obtain.mjs). Usa la sección "obtain" del tier o, si no la trae,
 * tiers/obtain.json. Salida 0 = todo clasificado (PASS), 1 = hay grupos sin clasificar (FAIL).
 */
function mainObtain(o, loaded) {
  const { raw, file } = loaded && loaded.raw.obtain ? loaded : loadTierConfig({ tier: 'obtain' }, path.join(here, 'tiers'));
  const dumpDir = path.resolve(o.dump);
  const dump = loadDump(dumpDir);
  const res = runObtain(dump, raw);
  const full = renderObtainText(res, file);
  const keep = (l) => /^(===|Config|Auditados|CLASE|[ABC?] +\d|VEREDICTO)/.test(l);
  const text = o.quiet ? full.split('\n').filter(keep).join('\n') + '\n' : full;
  process.stdout.write(text);
  if (o.out) fs.writeFileSync(path.resolve(o.out), text, 'utf8');
  if (o.json) fs.writeFileSync(path.resolve(o.json), JSON.stringify(obtainToJson(res), null, 2), 'utf8');
  if (o.md) {
    const ob = raw.obtain || {};
    const md = renderObtainMarkdown(res, {
      dump: dumpDir, date: new Date().toISOString().slice(0, 10), namespaces: (ob.audit || []).join(', '),
      dimensions: ob.reachableDimensions,
    });
    fs.writeFileSync(path.resolve(o.md), md, 'utf8');
  }
  if (o.table) {
    // tabla de ocultos del pack: se combina con la que ya hay (conserva las recetas ya quitadas de los grupos que siguen siendo C)
    const file = path.resolve(o.table);
    const previous = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
    const parts = dumpDir.split(/[\\/]/);
    const run = parts.indexOf('test-runs') >= 0 ? parts[parts.indexOf('test-runs') + 1] : parts[parts.length - 1];
    const table = hiddenTable(res, { previous, dump: run, date: new Date().toISOString().slice(0, 10) });
    fs.writeFileSync(file, renderHiddenTable(table), 'utf8');
    process.stdout.write(`Tabla de ocultos: ${file} (${table.groups.length} grupos; ${table.groups.filter((x) => x.until === 'never').reduce((n, x) => n + x.removeRecipes.length, 0)} recetas a quitar)\n`);
  }
  process.exit(res.verdict === 'PASS' ? 0 : 1);
}

function main() {
  const o = parseArgs(process.argv.slice(2));
  if (!PASSES.includes(o.pass)) throw new Error(`--pass ${o.pass} no vale (${PASSES.join(', ')})`);
  if (o.help || (!o.tier && !o.config && o.pass !== 'obtain') || !o.dump) {
    process.stdout.write(usage());
    process.exit(o.help ? 0 : 2);
  }
  const loaded = o.tier || o.config ? loadConfig(o) : null;
  // una configuración de auditoría (sección "obtain", p. ej. tiers/obtain.json) solo tiene ese paso
  if (o.pass === 'obtain' || (o.pass === 'both' && loaded && loaded.raw.obtain)) {
    mainObtain(o, loaded);
    return;
  }
  const { raw, file } = loaded;
  const dump = loadDump(path.resolve(o.dump));
  const runs = contextsOf(o, raw).map((d) => runContext(raw, dump, o, d, file));
  let text = '';
  for (const r of runs) {
    text += r.body;
    text += `(análisis en ${r.ms} ms)\n`;
  }
  const verdict = runs.every((r) => r.out.verdict === 'PASS') ? 'PASS' : 'FAIL';
  if (runs.length > 1) {
    text += '\nRESUMEN POR DIMENSIÓN\n';
    for (const r of runs) text += `  ${r.dimension.padEnd(22)} ${r.out.verdict}  (${summaryParts(r.out, o.pass).join(' · ')})\n`;
    text += `VEREDICTO GLOBAL: ${verdict}\n`;
  }
  process.stdout.write(text);
  if (o.out) fs.writeFileSync(path.resolve(o.out), text, 'utf8');
  if (o.json) {
    const one = (r) => ({ dimension: r.dimension, ...toJson(r.model, r.res, r.out) });
    const doc = runs.length === 1 ? one(runs[0]) : { tier: runs[0].model.cfg.tier, verdict, contexts: runs.map(one) };
    fs.writeFileSync(path.resolve(o.json), JSON.stringify(doc, null, 2), 'utf8');
  }
  process.exit(verdict === 'PASS' ? 0 : 1);
}

try {
  main();
} catch (e) {
  process.stderr.write(`ERROR: ${e.message}\n`);
  process.exit(2);
}
