// Structure drawings (lib/structure_svg.mjs) used by docs/multiblock-tutorial.md. Fixtures only; T0: local, deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describeSymbol, renderIso, renderSlices, symbolCounts, symbolStyles } from '../lib/structure_svg.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const specDir = path.resolve(here, '../../../docs/images/multiblock-tutorial/specs');
const tiny = JSON.parse(fs.readFileSync(path.join(specDir, 'tiny-furnace.json'), 'utf8'));

const polygonsFilled = (svg, fill) =>
  [...svg.matchAll(/<polygon points="([^"]+)" fill="([^"]+)"/g)]
    .filter((m) => m[2] === fill)
    .map((m) => m[1].split(' ').map((p) => p.split(',').map(Number)));
const meanX = (pts) => pts.reduce((t, p) => t + p[0], 0) / pts.length;

test('the tutorial specs parse, and the tiny furnace has the cell counts its legend shows', () => {
  for (const f of fs.readdirSync(specDir).filter((f) => f.endsWith('.json'))) {
    const d = JSON.parse(fs.readFileSync(path.join(specDir, f), 'utf8'));
    assert.ok(d.id && d.slices && d.symbols, f);
    assert.match(renderIso(d), /^<svg [^>]*width="\d+" height="\d+"/, f);
  }
  assert.deepEqual(symbolCounts(tiny), { X: 22, G: 1, '#': 1, M: 1, E: 1, S: 1 });
});

test('styles: the controller is marked, glass is see-through, air is not drawn, frames are framed', () => {
  const st = symbolStyles({ ...tiny, symbols: { ...tiny.symbols, F: { kind: 'frames', materials: ['steel'] } } });
  assert.equal(st.S.controller, true);
  assert.equal(st.G.see, true);
  assert.equal(st['#'].solid, false);
  assert.equal(st.F.frame, true);
  assert.equal(st.X.see, false);
  assert.equal(describeSymbol(tiny.symbols.E), 'energy hatch ×1');
});

test('characters run left to right as you face the controller: the first character of a row is drawn on the left', () => {
  const svg = renderIso(tiny);
  const st = symbolStyles(tiny);
  const [hatch] = polygonsFilled(svg, st.E.color);
  const [controller] = polygonsFilled(svg, st.S.color);
  assert.ok(hatch && controller, 'both front faces are drawn');
  assert.ok(meanX(hatch) < meanX(controller), 'E (first character of "ESX") is left of S');
  const mirrored = renderIso({ ...tiny, slices: [...tiny.slices.slice(0, 2), ['XXX', 'XSE', 'XXX']] });
  assert.ok(meanX(polygonsFilled(mirrored, st.E.color)[0]) > meanX(polygonsFilled(mirrored, st.S.color)[0]));
});

test('axes, the exploded view and the slice view are labelled back to front; titles are escaped', () => {
  assert.match(renderIso(tiny, { axes: true }), /slices: first = back,/);
  const exploded = renderIso(tiny, { explode: 1.5 });
  assert.match(exploded, /Slice 1 · back/);
  assert.match(exploded, /Slice 3 · front/);
  const flat = renderSlices(tiny, { title: 'a <b> & c' });
  assert.ok(flat.indexOf('Slice 1 · back') < flat.indexOf('Slice 3 · front'));
  assert.match(flat, /a &lt;b&gt; &amp; c/);
});
