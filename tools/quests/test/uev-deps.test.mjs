import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTER as C_CIRCUITS, QUESTS as CIRCUITS } from '../uev-chapter/circuits-data.mjs';
import { CHAPTER as C_MACHINES, QUESTS as MACHINES } from '../uev-chapter/machines-data.mjs';
import { CHAPTER as C_INTEGRATION, QUESTS as INTEGRATION } from '../uev-chapter/integration-data.mjs';
import { QUESTS as JOURNEY } from '../uev-chapter/quests-data.mjs';

const headings = [C_CIRCUITS, C_MACHINES, C_INTEGRATION].map((c) => c.section.heading);
const byKey = Object.fromEntries([...headings, ...CIRCUITS, ...MACHINES, ...INTEGRATION, ...JOURNEY].map((q) => [q.key, q]));

// AF-Q2c dropped these to clear layout lint. FIX-UEVQ re-laid the chapter and brought 30 back; QUEST-HIGH (#295) brought the
// last 5 (HULL>NEB, SX>FIELD, SNSPD>SPEC, SNSPD>ENT, EOS>HOLD; their quests hide the long dependency lines).
const RESTORED = [
  'PARTS>MK1', 'I_DFD>MK1', 'PULS>A_CHART', 'SXB>MK2', 'MAGP>MK2', 'PEL>S_PELLET', 'NETUEV>WARP', 'TENS>HOLD',
  'CH_SNS>PARTS', 'S_PELLET>FIELD', 'PHOT>CH_WG', 'SNSPD>CH_SNS', 'VDW>CH_HBN', 'VDW>CH_GRM', 'ENT>CH_REP',
  'HULL>FORGE', 'CH_SIN>SNSPD', 'CH_GRM>PHOT', 'CH_QD>PHOT', 'CH_SIN>PHOT', 'COIL>MK4', 'HULL>MK4',
  'HULL>MOND', 'HULL>SPEC', 'EOS>DEG', 'HULL>PARH', 'PARTS>PARH', 'I_OM_DEC>CELL', 'CH_REP>NETUEV', 'HATCH>NETUEV',
  'HULL>NEB', 'SX>FIELD', 'SNSPD>SPEC', 'SNSPD>ENT', 'EOS>HOLD',
];

test('the UEV chapter keeps the dependencies AF-Q2c dropped', () => {
  assert.equal(RESTORED.length, 35);
  for (const e of RESTORED) {
    const [from, to] = e.split('>');
    assert.ok(byKey[to], `${to} exists`);
    assert.ok(byKey[to].deps.includes(from), `${to} depends on ${from}`);
  }
});
