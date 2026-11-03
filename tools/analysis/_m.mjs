import { runPackScripts } from './lib/kubejs_static.mjs';
import { activeBlocksOf } from './lib/active_blocks.mjs';
const s = runPackScripts('../../pack').docs.structures.structures;
const FAM = /^grindless:(gum_metal|mu_metal_shield|pulsed_field|pasta_containment|uxv_fusion)_casing$/;
const ids = process.argv.slice(2);
for (const id of ids) {
  const d = s[id];
  if (!d) { console.log(id, 'MISSING'); continue; }
  const cnt = {}; let cells = 0, parts = 0;
  const w = d.slices[0][0].length, h = d.slices[0].length, z = d.slices.length;
  let mn = [1e9, 1e9, 1e9], mx = [-1, -1, -1];
  d.slices.forEach((sl, zi) => sl.forEach((row, yi) => [...row].forEach((ch, xi) => {
    if (ch === ' ') return;
    const sym = d.symbols[ch];
    if (!sym || sym.kind === 'air') return;
    cells++;
    mn = [Math.min(mn[0], xi), Math.min(mn[1], yi), Math.min(mn[2], zi)]; mx = [Math.max(mx[0], xi), Math.max(mx[1], yi), Math.max(mx[2], zi)];
    if (sym.kind === 'controller') return;
    let key = ch;
    const first = sym.kind === 'oneOf' ? sym.options[0] : sym;
    if (first.kind === 'blocks') key = first.blocks[0]; else if (first.kind === 'frames') key = 'frame:' + first.materials[0]; else key = first.kind + ':' + (first.ability || '');
    cnt[key] = (cnt[key] || 0) + 1;
  })));
  let fam = 0, tot = 0, top = ['', 0];
  for (const [k, v] of Object.entries(cnt)) { tot += v; if (FAM.test(k)) fam += v; if (v > top[1]) top = [k, v]; }
  console.log(`${id}: bbox ${mx[0] - mn[0] + 1}x${mx[1] - mn[1] + 1}x${mx[2] - mn[2] + 1} (decl ${w}x${h}x${z}) cells ${cells} fam ${(100 * fam / tot).toFixed(0)}% top ${top[0]} ${(100 * top[1] / tot).toFixed(0)}% active ${activeBlocksOf(d)}`);
  if (process.env.V) console.log(JSON.stringify(cnt));
}
