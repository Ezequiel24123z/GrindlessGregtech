// EN-1: the English-only guard (spanishFindings in lib/kubejs_static.mjs, run by check-static.mjs): any es_es key, block, column or file
// under pack/kubejs fails T0.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spanishFindings } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

function fakePack(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gg-en1-'));
  for (const [rel, text] of Object.entries(files)) {
    const f = path.join(dir, 'kubejs', rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, text);
  }
  return dir;
}

test('an English-only pack passes the guard', () => {
  const dir = fakePack({ 'client_scripts/grindless/a_lang.js': "ClientEvents.lang('en_us', function (e) { e.add('grindless', 'k', 'v') })\n" });
  try { assert.deepEqual(spanishFindings(dir), []); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('a planted es_es key, block or file fails the guard', () => {
  const dir = fakePack({
    'client_scripts/grindless/planted_lang.js': "ClientEvents.lang('en_us', function () {})\nClientEvents.lang('es_es', function () {})\n",
    'data/grindless/tables/t.json': '{"name": {"en_us": "A", "es_es": "B"}}',
    'assets/grindless/lang/es_es.json': '{}',
  });
  try {
    assert.deepEqual(spanishFindings(dir), [
      'assets/grindless/lang/es_es.json: es_es file name',
      'client_scripts/grindless/planted_lang.js:2: es_es',
      'data/grindless/tables/t.json:1: es_es',
    ]);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('the real pack has no es_es under pack/kubejs', () => {
  assert.deepEqual(spanishFindings(path.join(here, '..', '..', '..', 'pack')), []);
});
