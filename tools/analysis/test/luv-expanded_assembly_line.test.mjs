// QR-G0: the Expanded Assembly Line is craftable at LuV from the normal line, with its LuV data path. Static checks only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const read = p => fs.readFileSync(path.join(root, ...p.split('/')), 'utf8');
const SCRIPT = read('pack/kubejs/server_scripts/grindless/luv/expanded_assembly_line.js');
const OUTPUTS = ['expanded_assembly_line', 'luv_wireless_data_receptor', 'luv_wireless_data_transmissor', 'matrix_data_relay'];

test('four assembly line recipes, none on the crafting table', () => {
  for (const o of OUTPUTS) assert.ok(SCRIPT.includes(`extendedfeatures:${o}`), o);
  assert.match(SCRIPT, /assembly_line/);
  assert.ok(!/event\.shaped|event\.shapeless/.test(SCRIPT), 'no crafting-table recipe');
  assert.ok(SCRIPT.includes('30720') || /eut\(30720\)|EUt/.test(SCRIPT), 'LuV voltage');
});

test('the controller takes the normal assembly line', () => {
  assert.match(SCRIPT, /['"]gtceu:assembly_line['"]/);
});

test('uncraftable note no longer lists the LuV parts', () => {
  const note = read('pack/kubejs/server_scripts/grindless/integration/extendedfeatures.js');
  assert.ok(!/matrix_data_relay|luv_wireless_data/.test(note.split('Kept')[1] || ''), 'LuV parts are not kept recipe-less');
});

test('EMI info page and keys in both languages', () => {
  const lang = read('pack/kubejs/client_scripts/grindless/emi_info_lang.js');
  for (const n of [0, 1, 2]) {
    const k = `emi.grindless.info.expanded_assembly_line.${n}`;
    assert.equal(lang.split(k).length - 1, 2, k);
  }
  const page = read('pack/kubejs/assets/emi/recipe/additions/grindless/expanded_assembly_line.json');
  for (const o of OUTPUTS) assert.ok(page.includes(`extendedfeatures:${o}`), o);
});

test('quest exists in the LuV chapter data', () => {
  const q = read('tools/quests/luv-chapter/quests-data.mjs');
  assert.ok(q.includes('XAL') && q.includes('extendedfeatures:expanded_assembly_line'));
});

test('bench zone is registered in its band', () => {
  const z = JSON.parse(read('tools/test/zones.json')).zones.find(e => e.id === 'expanded_assembly_line');
  assert.ok(z && z.x[0] === 36032 && z.x[1] === 36063);
});
