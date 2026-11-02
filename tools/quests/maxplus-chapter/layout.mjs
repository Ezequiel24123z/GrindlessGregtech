// AF-Q2b: the MAX+ chapter layout, as QB-4 did for MAX. One era chapter, one section per data file; every quest's place and dependencies are
// decided here (docs/quests.md, section 4b), so a dependency never points backwards and no line crosses another. A data file keeps its texts
// and kinds and passes its quests through place(); the x, y and deps written in the file are the old, per-file layout.
// Positions are absolute (every section's origin is 0, 0). Above the spine from 30 Doradus on: the Tarantula's lift and plasma pair, then three
// rows: the Stream's gas works and fuels (y = -1.75), helium-3 and the torus (y = -3.25 and -2.5), and the nickel-56 chain (y = -4.75), which meet
// at the wireless dynamo. Parts come before the machine that is built from them.

export const SECTIONS = {
  age1: { name: 'Stage I: Out of the Galaxy', origin: { x: 0, y: 0 } },
  age2: { name: 'Stage II: The Local Group', origin: { x: 0, y: 0 } },
  age3: { name: 'Stage III: Back to the Hole', origin: { x: 0, y: 0 } },
  circuits: { name: 'Circuits and Components', origin: { x: 0, y: 0 }, heading: { key: 'H_CIRCUITS', x: 3, y: 2, deps: ['TAP'], icon: 'grindless:horizon_processor', desc: ['The strand cable, the hull and casing, the nine components and the horizon processor, the one circuit above the top of the ladder.'] } },
  creative: { name: 'Creative Items', origin: { x: 0, y: 0 }, heading: { key: 'H_CREATIVE', x: 61.5, y: -1, deps: ['S3_HOME'], icon: 'grindless:creative_energy', desc: ['The four cores and the six creative stand-ins: ingredients of the gate that can never be placed.'] } },
  hyperstargate: { name: 'Building the Gate', origin: { x: 0, y: 0 }, heading: { key: 'H_GATE', x: 51.5, y: 2, deps: ['S3_TREE'], icon: 'gtceu:hyperstargate', desc: ['The machines of the tree and the parts of the gate: ring blocks, upgrades, chevrons, power units, the base and the controller, then the dial.'] } },
  integration: { name: 'Older Machines, Power and AE2', origin: { x: 0, y: 0 }, heading: { key: 'H_INTEGRATION', x: 0, y: 1.5, deps: ['START'], icon: 'gtceu:max_wireless_dynamo_hatch_16a', desc: ['What the older machines become at MAX+ scale, the power from nickel-56 and fusion, and the AE2 grid that holds the plan.'] } },
  machines: { name: 'Machines of MAX+', origin: { x: 0, y: 0 }, heading: { key: 'H_MACHINES', x: 2, y: 1.5, deps: ['TAP'], icon: 'gtceu:hyperfactory', desc: ['The machines of the era, in the order you meet them, each with the first products it makes.'] } },
};

// key: [x, y, deps]
const LAYOUT = {
  // stage I: the key, the condensate, the probe and the slingshot
  START: [0, 0, ['max:LOCK']],
  TAP: [2, 0, ['START']],
  SETTLED: [4, 0, ['TAP']],
  KS: [4, -1.5, ['SETTLED']],
  NAVCORE: [6, -1.5, ['SETTLED']],
  CW: [6, 0, ['SETTLED']],
  PROBE: [8, 0, ['NAVCORE']],
  PAIR: [10.5, 0, ['PROBE', 'MA_SLING']],
  LAUNCH: [12, 0, ['PAIR']],
  BN: [13, 4, ['MA_BIND']],
  BDEG: [16, 4.5, ['SETTLED']],
  // 30 Doradus
  LMC: [14, 0, ['LAUNCH']],
  J_TAR: [16, 0, ['LMC']],
  RAW: [19, -3.25, ['MA_LIFT', 'OM_DOR']],
  NI56: [23.5, -4.75, ['MA_CRUC']],
  CASK: [25, -4.75, ['NI56']],
  // the Stream
  NAV17: [18, 0, ['J_TAR']],
  STREAM: [20, 0, ['NAV17']],
  J_STR: [21.25, -1.75, ['STREAM']],
  PD: [25.75, -1.75, ['MA_GAS']],
  PHE3: [25.75, -3.25, ['MA_GAS']],

  // stage II
  STAGE2: [22, 0, ['STREAM']],
  NAV18: [24, 0, ['STAGE2']],
  PROBE18: [26, 0, ['NAV18']],
  M31: [28, 0, ['PROBE18']],
  J_M31: [30, 0, ['M31']],
  TETHER: [30.5, 1.5, ['J_M31']],
  PNUC: [35, 1.5, ['MA_TARGET']],
  NAV19: [32, 0, ['J_M31']],
  PROBE19: [34, 0, ['NAV19']],
  VOID: [36, 0, ['PROBE19']],
  J_VOID: [38, 0, ['VOID']],
  VDIA: [40.5, -1.5, ['J_VOID']],
  VLAT: [42, -1.5, ['VDIA']],
  SCALE: [40, 0, ['J_VOID']],
  META_A: [42, 0, ['SCALE']],
  META_B: [43.5, 4, ['SCALE']],
  STAGE2_END: [44, 0, ['VLAT', 'META_A', 'META_B']],

  // stage III
  STAGE3: [46, 0, ['STAGE2_END']],
  S3_SITE: [48, 0, ['STAGE3']],
  S3_TREE: [50, 0, ['S3_SITE']],
  S3_SLURRY: [54.5, -3, ['S3_TREE']],
  S3_CORE: [56, -3.5, ['S3_SLURRY']],
  S3_CTRL: [58.5, -2, ['S3_SLURRY']],
  S3_CAPS: [65.5, 0.5, ['CR_CELL']],
  S3_PLATE: [55, -1, ['S3_TREE']],
  S3_CHEV: [53, 0, ['S3_TREE']],
  S3_MESH: [55, 1, ['S3_TREE']],
  S3_FRAME: [56.5, -0.5, ['S3_PLATE', 'S3_MESH', 'S3_CHEV']],
  S3_HOME: [60.5, -1.5, ['S3_CTRL', 'S3_FRAME']],
  S3_COMP: [62, -3, ['S3_HOME']],
  S3_FIELD: [63.5, -2, ['S3_HOME']],
  S3_PROC: [65, -1.5, ['S3_HOME']],
  S3_ARCH: [67, -0.5, ['S3_GATE']],
  S3_LOCKS: [68, -2, ['S3_GATE']],
  S3_GATE: [66.5, -2, ['S3_COMP', 'S3_FIELD', 'S3_PROC', 'S3_CAPS', 'HG_MACH']],
  S3_DIAL: [68.5, -0.5, ['S3_ARCH', 'S3_LOCKS']],
  ARRIVAL: [70.5, -0.5, ['S3_DIAL']],

  // circuits and components
  CI_WIRE: [15.5, 6.5, ['MA_CLAD']],
  CI_HULL: [17, 6, ['CI_WIRE', 'BN']],
  CI_MOTOR: [29.5, 6.5, ['CI_WIRE', 'BDEG']],
  CI_PISTON: [29.5, 8, ['CI_MOTOR']],
  CI_PUMP: [43.5, 6.5, ['CI_MOTOR', 'META_B']],
  CI_BELT: [31, 6, ['CI_MOTOR']],
  CI_DIE: [9.5, 6.5, ['TAP']],
  CI_INTERP: [7, 5.5, ['TAP']],
  CI_PROC: [10, 8, ['CI_DIE', 'CI_INTERP']],
  CI_CTRL: [10, 9.5, ['CI_PROC']],
  CI_EMIT: [21, 9, ['CI_PROC']],
  CI_SENS: [11.5, 9, ['CI_PROC']],
  CI_ARM: [11.5, 7.5, ['CI_PROC']],
  CI_FIELD: [29.5, 9.5, ['CI_EMIT', 'CI_PISTON']],
  CI_HATCH: [18.5, 6, ['CI_HULL']],

  // machines: the refinery and the press at home, the slingshot, then each place's machines after their parts
  MA_REF: [9, 5, ['TAP']],
  MA_CLAD: [13, 6, ['MA_REF']],
  MA_CELL: [9, 3.5, ['MA_REF']],
  MA_BIND: [10.5, 4.5, ['MA_REF']],
  MA_PRESS: [5.5, 1.5, ['SETTLED']],
  MA_LAM: [7, 2, ['MA_PRESS']],
  MA_SLING: [10.5, 1.5, ['CW']],
  MA_NOZ: [17, -1.75, ['J_TAR']],
  MA_LIFT: [18.5, -1.75, ['MA_NOZ']],
  MA_LINER: [20.5, -4.75, ['RAW']],
  MA_CRUC: [22, -4.75, ['MA_LINER']],
  MA_ASH: [23.5, -6.25, ['MA_CRUC']],
  MA_BURN: [26.5, -4.75, ['CASK']],
  MA_FE: [29.5, -6.25, ['PW_NI']],
  MA_SCOOP: [22.75, -1.75, ['J_STR']],
  MA_GAS: [24.25, -1.75, ['MA_SCOOP']],
  MA_NBI: [27.25, -1.75, ['PD']],
  MA_DCS: [27.25, -3.25, ['PHE3']],
  MA_TORUS: [28.75, -2.5, ['MA_NBI', 'MA_DCS']],
  MA_STEL: [30.25, -1.5, ['MA_TORUS']],
  MA_PELLET: [31.75, -1.5, ['MA_STEL']],
  MA_FORGE: [32, 1.5, ['TETHER']],
  MA_TARGET: [33.5, 1.5, ['MA_FORGE']],
  MA_FAB: [37, 2.25, ['VOID']],
  MA_LOOM: [43, 2, ['SCALE']],
  MA_HYPER: [41.5, 3, ['SCALE']],

  // older machines, power and AE2
  OM_SHELL: [2.5, 3.5, ['START']],
  OM_OPV: [4, 3.5, ['OM_SHELL']],
  OM_OPV2: [4, 5, ['OM_OPV']],
  OM_DOR: [17, -3.25, ['LMC']],
  OM_UXV: [1, 3, ['START']],
  OM_UIV: [1, 4.5, ['OM_UXV']],
  OM_UEV: [1.5, 6, ['OM_UIV']],
  OM_UHV: [3, 6.5, ['OM_UEV']],
  OM_OLD: [4.5, 6.5, ['OM_UHV']],
  PW_NI: [28, -4.75, ['MA_BURN']],
  PW_TORUS: [30.25, -3.5, ['MA_TORUS']],
  PW_DYN: [31.75, -4.75, ['PW_NI', 'PW_TORUS']],
  PW_STORE: [33.25, -4.75, ['PW_DYN']],
  AE_A1: [40, 2.5, ['SCALE']],
  AE_A2: [40.5, 6, ['AE_A1', 'AE_LASER']],
  AE_LASER: [38, 6, ['AE_A1']],
  AE_A3: [42, 6, ['AE_A2']],
  PAR: [41, 4.5, ['SCALE']],

  // building the gate
  TR_BLEND: [51.5, -2, ['S3_TREE']],
  TR_FURN: [50, 1.5, ['S3_TREE']],
  TR_COND: [53.5, 1.5, ['S3_TREE']],
  TR_BANK: [50, -1.5, ['S3_TREE']],
  TR_ARRAY: [59, 6.5, ['S3_TREE']],
  HG_IRIS: [64.5, 6, ['HG_IFACE']],
  HG_RING: [61.5, 6.5, ['TR_ARRAY']],
  HG_UPG: [60, 8, ['TR_ARRAY']],
  HG_POWER: [62.5, 5, ['HG_RING']],
  HG_CHEVB: [61.5, 8, ['HG_RING', 'HG_UPG']],
  HG_IFACE: [63, 6.5, ['HG_POWER', 'HG_RING']],
  HG_LOCKED: [63, 8, ['HG_RING', 'HG_UPG']],
  HG_BASE: [62.5, 9.5, ['HG_CHEVB', 'HG_UPG']],
  HG_STRUCT: [64.5, 7.5, ['HG_IRIS', 'HG_IFACE', 'HG_LOCKED', 'HG_BASE']],
  HG_MACH: [66, 4, ['HG_STRUCT']],
  HG_DIAL: [67.5, 4, ['HG_MACH']],
  HG_RECHARGE: [69, 3, ['HG_DIAL']],
  HG_CROSS: [69, 4, ['HG_DIAL']],

  // creative items
  CR_RULE: [61, 0.5, ['S3_HOME']],
  CR_CORES: [62.5, 2, ['CR_RULE']],
  CR_ENERGY: [65.5, 2, ['CR_CORES']],
  CR_CELL: [62.5, 0.5, ['CR_CORES']],
  CR_CHEST: [64, 1, ['CR_CORES']],
  CR_TANK: [64, 2.5, ['CR_CORES']],
  CR_COMP: [62.5, 3.5, ['CR_CORES']],
  CR_DATA: [64, 4, ['CR_COMP']],
};

export function place(quests) {
  return quests.map((q) => {
    const l = LAYOUT[q.key];
    if (!l) throw new Error('no layout for quest ' + q.key);
    return { ...q, x: l[0], y: l[1], deps: l[2] || q.deps };
  });
}
