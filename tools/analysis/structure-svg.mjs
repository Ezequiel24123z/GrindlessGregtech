// Draws multiblock structures as SVG images (used by docs/multiblock-tutorial.md).
//   node tools/analysis/structure-svg.mjs <machine id | spec.json> [...] [--out <dir>] [--explode <gap>] [--axes] [--dump <dir>]
// A machine id is read from the pack's scripts run in Node (as structure-quality --static does, about 80 s) or from a dump
// (--dump). A .json file holds one description { id, title?, slices, symbols } in the lib/structure.mjs format, for examples
// that are not in the pack. Writes <name>-3d.svg and <name>-slices.svg (plus <name>-exploded.svg with --explode) to --out
// (default: the current directory).
import fs from 'node:fs';
import path from 'node:path';
import { renderIso, renderSlices } from './lib/structure_svg.mjs';
import { loadStructures } from './structure-quality.mjs';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const valued = new Set(['--out', '--explode', '--dump']);
const targets = args.filter((a, i) => !a.startsWith('--') && !valued.has(args[i - 1]));
if (!targets.length) {
  console.error('usage: structure-svg.mjs <machine id | spec.json> [...] [--out <dir>] [--explode <gap>] [--axes] [--dump <dir>]');
  process.exit(2);
}
const out = opt('--out') || '.';
fs.mkdirSync(out, { recursive: true });

let pack = null;
for (const t of targets) {
  let desc;
  if (t.endsWith('.json')) desc = JSON.parse(fs.readFileSync(t, 'utf8'));
  else {
    if (!pack) pack = await loadStructures(opt('--dump') ? ['--dump', opt('--dump')] : ['--static']);
    desc = pack[t];
    if (!desc) { console.error(`no structure for ${t}`); process.exitCode = 1; continue; }
  }
  const id = desc.id || path.basename(t, '.json');
  const name = id.replace(/^[^:]+:/, '').replace(/_/g, '-');
  const title = desc.title || id;
  const files = {
    [`${name}-3d.svg`]: renderIso(desc, { title, axes: args.includes('--axes') }),
    [`${name}-slices.svg`]: renderSlices(desc, { title: `${title}: slice by slice` }),
  };
  if (opt('--explode')) files[`${name}-exploded.svg`] = renderIso(desc, { title: `${title}: slices pulled apart`, explode: Number(opt('--explode')) });
  for (const [f, svg] of Object.entries(files)) {
    fs.writeFileSync(path.join(out, f), svg);
    console.log(path.join(out, f));
  }
}
