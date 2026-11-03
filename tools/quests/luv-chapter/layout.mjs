// QB-2: the LuV chapter layout. One era chapter, one section per data file; every quest's place and dependencies are decided here
// (docs/quests.md, section 4b), so a dependency never points backwards and no line crosses another. A data file keeps its texts and
// kinds and passes its quests through place(); the x, y and deps written in the file are the old, per-chapter layout.

import { TEACH } from './teaching-rows.mjs';

export const SECTIONS = {
  'quests': { name: "The Journey", origin: { x: 0, y: 0 }, heading: { key: 'H_LUV_AGE', x: 2.5, y: -1, deps: ["START"], desc: ["The road of the era, from the first step to the gate that leads on. Everything else here hangs from it."] } },
  'circuits': { name: "Circuits", origin: { x: 0, y: 0 }, heading: { key: 'H_LUV_CIRCUITS', x: 4, y: 0, deps: ["START"], desc: ["The wafers, chips and circuits of the era, from the first assembler to the mainframe, and the parts built from them."] } },
  'machines': { name: "Machines", origin: { x: 0, y: 0 }, heading: { key: 'H_LUV_MACHINES', x: 1.5, y: 0.5, deps: ["START"], desc: ["The machines of the era and the first steps that put each one to work."] } },
};

// key: [x, y, deps]; null deps keep the quest's own (START hangs from the previous era's gate)
const rowAt = (x0, y, keys) => Object.fromEntries(keys.map((k, i) => [k, [x0 + 2 * i, y, null]]));
const LAYOUT = {
  START: [0, 0, null],
  LUVC: [4, -4, null],
  OSM: [6, -1, null],
  NAQC: [1.5, 3, null],
  FREC: [1.5, 6, null],
  TRIN: [3, 4.5, null],
  SEEDS: [7, -4.5, null],
  NTF: [9.5, -5.5, null],
  PACK: [10.5, -3, ['OSM', 'LVL4']],
  STAT: [12, -5, null],
  LVL4: [9, 4.5, null],
  RTG: [13, 4.5, null],
  BELT: [10.5, 0, null],
  METIRON: [12, 2.5, null],
  CHON: [12, 1, null],
  PGM: [14.5, 1, null],
  STAR: [16.5, 0.5, null],
  IO: [10.5, 5, null],
  EUR: [13.5, 3, null],
  OCEAN: [16.5, 2.5, null],
  BACT: [18, 2.5, null],
  STEM: [20.5, 3, null],
  GANY: [13.5, 9.5, null],
  SGR: [15.5, 10, null],
  CAT: [17, 8.5, null],
  CLOUDS: [17.5, 10, null],
  SLING: [20, 10.5, null],
  EUROP: [20.5, 8, null],
  GATE: [22, 10, ['EUROP', 'CAT', 'SLING']],
  LCA: [12.5, -8.5, null],
  RAWC: [14, -8.5, null],
  CCPU: [21.5, -9.5, null],
  CPROC: [23.5, -10, null],
  CASM: [26, -10, null],
  NPU: [25, -6, null],
  LIVING: [26.5, -8.5, null],
  WASM: [29, -8, null],
  DBANK: [17.5, -7, null],
  BLANKORB: [16, -6.5, null],
  HPCA: [19, -7, null],
  RSTN: [20.5, -8, null],
  ORB: [23.5, -8, null],
  QTSUIT: [28, -10, null],
  CLOOP: [6.5, -2.5, null],
  BIOF: [7, -6.5, null],
  TAPE: [7.5, -0.5, null],
  TAPEQ: [9.5, -1.5, null],
  WIND: [4.5, 5.5, null],
  NETL: [6, 5.5, null],
  ENDLESS: [14, -6.5, null],
  FIBRE: [14.5, -4.5, null],
  FIBQ: [16, -4.5, null],
  WHIP: [17.5, -5.5, null],
  WAKE: [19.5, -4.5, null],
  WAKEQ: [21, -5.5, null],
  TJW: [21, -3.5, null],
  CRYSTAL: [15.5, -3, null],
  HARP: [13, -2, null],
  HARPQ: [14.5, -0.5, null],
  MOND: [16, -1, null],
  RING: [18, -1, null],
  RINGQ: [12, -3.5, null],
  ORGANOID: [23.5, -0.5, null],
  ORGQ: [26, -0.5, null],
  BOULDER: [12.5, -0.5, null],
  FUM: [12, 6, null],
  FUMQ: [13.5, 6.5, null],
  PATERA: [15, 6, null],
  PATQ: [16.5, 6, null],
  TORUS: [18, 6.5, null],
  IODINE: [18, 6.5, null],
  FUSION: [18.5, 8, null],
  CRYO: [16.5, 4, null],
  ALIVE: [18.5, 4.5, null],
  CHIRP: [15.5, 7.5, null],
  COIL: [16, 11.5, null],
  COILQ: [18, 12, null],
  REACT: [4.5, 8, null],
  SIXTEEN: [6, 9.5, null],
  MCC: [8.5, -3, null],
  AE2L: [10.5, 2, null],
  ...rowAt(22.5, 3, ['THIO', 'TBT', 'DBT', 'DMT', 'EDOT']),
  PSS: [22.5, 1.5, ['STEM']],
  PEDOT: [32.5, 1.5, ['EDOT', 'PSS']],
  MEA: [34.5, 1.5, null],
  ...rowAt(22.5, 8, ['GECL', 'PURE', 'GEO2', 'GE', 'BOULE', 'WAFER']),
  ...rowAt(24.5, 10, ['ZRF4', 'BAF2', 'LAF3', 'BLEND', 'ZBLANQ']),
  ...rowAt(28, -2, ['MONDR', 'DISTC', 'DECOMP', 'NIW', 'TAPES', 'TEX', 'SEED', 'BARR', 'BUFF', 'COAT', 'CAP']),
  ...Object.fromEntries(TEACH.map((q) => [q.key, [q.x, q.y, q.deps]])),
};

export function place(quests) {
  return quests.map((q) => {
    const l = LAYOUT[q.key];
    if (!l) throw new Error('no layout for quest ' + q.key);
    return { ...q, x: l[0], y: l[1], deps: l[2] || q.deps };
  });
}
