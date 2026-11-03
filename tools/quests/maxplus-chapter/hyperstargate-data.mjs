// Quest data for maxplus_hyperstargate ("MAX+: The Hyperstargate"), the capstone: the tree's machines 12 to 17, the gate's parts, the structure,
// the dial and the crossing (docs/reforge/05_quest_design.md section 2.2; docs/eras/maxplus.md, "Machines" 12 to 17, "The Hyperstargate", "The ending").
// The tree is folded in (section 2.2: together under about 40 quests), so there is no maxplus_tree chapter. TR_* are the tree's machines, HG_* the gate.
// The products of the tree and the grid's bulk crafts are in maxplus_age_3; the creative items are in maxplus_creative.
// Fixed keys (other chapters link to them): HG_MACH.
// Numbers follow startup_scripts/grindless/maxplus/hyperstargate.js: 41 x 43 x 9, 151 ring blocks and 9 locked chevrons on the ring,
// 4 power units, the iris and the base in the base row. The crossing is XP-Z1b's; no quest gives the epilogue or rolls the credits.
// Positions and dependencies: layout.mjs.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  filename: 'maxplus_hyperstargate',
  era: 'maxplus',
  role: 'capstone',
  order: 8,
  icon: 'gtceu:hyperstargate',
  autofocus: 'TR_FURN',
  section: SECTIONS.hyperstargate,
  title: 'MAX+: Building the Gate',
  subtitle: ['Six machines, eight kinds of part, one dial and a ring that opens once for a whole team.'],
};

export const LINKS = [
  { key: 'HG_L_IN', ref: 'S3_TREE', x: 0, y: 0 },
];

export const QUESTS = [
  // ------------------------------------------------------------------ the tree's machines
  {
    key: 'TR_FURN', kind: 'machine', title: 'Horizon Crystal Furnace', icon: 'gtceu:horizon_crystal_furnace',
    deps: ['S3_TREE'], x: -1.5, y: -0.5,
    teach: {
      for: 'The &6Horizon Crystal Furnace&r blends one plasma from each place the pack has worked into slurry, then grows core and controller crystals from it. Other packs wait weeks for this; here the cost is slurry and many parallel runs.',
      needs: 'Plasmas from the forge, elevator, filter, very massive star, p-process and jet lines, plus hot flow and condensate for the slurry; then slurry by the hundred million millibuckets.',
      unlocks: 'Core crystals and the controller crystal.',
      automate: 'Slurry is the bottleneck. Give each plasma its own pipe, and size the slurry line before you add furnaces.',
    },
    desc: [],
    tasks: [it('gtceu:horizon_crystal_furnace')],
    rewards: [xp(300)],
  },
  {
    key: 'TR_COND', kind: 'machine', title: 'Condensate Assembler', icon: 'gtceu:condensate_assembler',
    deps: ['S3_TREE'], x: 2, y: -0.5,
    teach: {
      for: 'The &6Condensate Assembler&r bathes its parts in condensate. Containment plates, chevron cores, mesh and frame parts come from here and nowhere else.',
      needs: 'Dozens of inputs a recipe and an ocean of condensate. The meta-materials arrive from the loom at home.',
      unlocks: 'Frame parts, plates and cores for the whole grid.',
      automate: 'Run several. Condensate output sets the pace, not the clock.',
    },
    desc: [],
    tasks: [it('gtceu:condensate_assembler')],
    rewards: [xp(300)],
  },
  {
    key: 'TR_BANK', kind: 'machine', title: 'Horizon Capacitor Bank', icon: 'gtceu:horizon_capacitor_bank',
    deps: ['S3_TREE'], x: -1.5, y: -3.5,
    teach: {
      for: 'The &6Horizon Capacitor Bank&r is a ring of capacitors that adds its capacity to your network. It stores; it never makes energy. The dial only starts when the formed banks hold at least one dial of charge.',
      needs: 'Capacitors in a ring, at Sgr A* orbit only. The network\'s generators fill it, and some charge is lost on the way in.',
      unlocks: 'The dial.',
      automate: 'Charge it long before the dial. A big plant refills it in minutes, a small one in days.',
    },
    desc: [],
    tasks: [it('gtceu:horizon_capacitor_bank')],
    rewards: [xp(300)],
  },
  {
    key: 'TR_ARRAY', kind: 'machine', title: 'Hyper Assembly Array', icon: 'gtceu:hyper_assembly_array',
    deps: ['S3_TREE'], x: 7.5, y: 4.5,
    teach: {
      for: 'The &6Hyper Assembly Array&r crafts what no single machine can take: dozens of different inputs in one recipe. Every part of the gate and every creative item is made here.',
      needs: 'A wide room and a great many input buses, all fed by AE2.',
      unlocks: 'The ring, the upgrades, the iris, the base and the interface.',
      automate: 'Let AE2 patterns do the counting. Never hand-feed this machine.',
    },
    desc: [],
    tasks: [it('gtceu:hyper_assembly_array')],
    rewards: [xp(300)],
  },

  // ------------------------------------------------------------------ the gate's parts
  {
    key: 'HG_IRIS', kind: 'step', title: 'Horizon Iris', icon: 'grindless:horizon_iris',
    deps: ['HG_IFACE'], x: 13, y: 4,
    desc: [
      'A shutter of hundreds of blades that closes the ring between crossings. Each blade is a craft of its own, so queue them early.',
    ],
    tasks: [it('grindless:horizon_iris')],
    rewards: [xp(400)],
  },
  {
    key: 'HG_RING', kind: 'step', title: 'Ring Blocks', icon: 'grindless:hyperstargate_ring_block',
    deps: ['TR_ARRAY'], x: 10, y: 4.5,
    desc: [
      'The ring is made of them, and so are the chevron blocks, the base, the power units, the interface and the controller. Make far more than the ring itself needs.',
    ],
    tasks: [it('grindless:hyperstargate_ring_block', 519)],
    rewards: [xp(500)],
  },
  {
    key: 'HG_UPG', kind: 'step', title: 'Chevron Upgrades', icon: 'grindless:hyperstargate_chevron_upgrade',
    deps: ['TR_ARRAY'], x: 8.5, y: 6,
    desc: [
      'The parts that turn a plain block into a chevron. The base takes some as well.',
    ],
    tasks: [it('grindless:hyperstargate_chevron_upgrade', 360)],
    rewards: [xp(500)],
  },
  {
    key: 'HG_POWER', kind: 'step', title: 'Power Units', icon: 'grindless:hyperstargate_power_unit',
    deps: ['HG_RING'], x: 11, y: 3,
    desc: [
      'Four of them sit in the base row and hold the dial\'s current. Each one swallows a creative energy block.',
    ],
    tasks: [it('grindless:hyperstargate_power_unit', 4)],
    rewards: [xp(500)],
  },
  {
    key: 'HG_CHEVB', kind: 'step', title: 'Chevron Blocks', icon: 'grindless:hyperstargate_chevron_block',
    deps: ['HG_RING', 'HG_UPG'], x: 10, y: 6,
    desc: [
      'Four ring blocks, nine upgrades and a crowd of meta-materials. The base takes all of them, and the locked chevrons are built from the same parts, not from these.',
    ],
    tasks: [it('grindless:hyperstargate_chevron_block', 27)],
    rewards: [xp(600)],
  },
  {
    key: 'HG_IFACE', kind: 'step', title: 'Interface', icon: 'grindless:hyperstargate_interface',
    deps: ['HG_POWER', 'HG_RING'], x: 11.5, y: 4.5,
    desc: [
          'The controller\'s window to the network. It is built from ring blocks.',
    ],
    tasks: [it('grindless:hyperstargate_interface')],
    rewards: [xp(500)],
  },
  {
    key: 'HG_LOCKED', kind: 'step', title: 'Locked Chevrons', icon: 'grindless:hyperstargate_locked_chevron',
    deps: ['HG_RING', 'HG_UPG'], x: 11.5, y: 6,
    desc: [
      'Made like a chevron block, from ring blocks, upgrades and meta-materials, with a horizon lock and a crowd of MAX+ circuits sealed in. Nine of them go on the ring, and the dial recognises them by the lock.',
    ],
    tasks: [it('grindless:hyperstargate_locked_chevron', 9)],
    rewards: [xp(600)],
  },
  {
    key: 'HG_BASE', kind: 'step', title: 'The Base', icon: 'grindless:hyperstargate_base',
    deps: ['HG_CHEVB', 'HG_UPG'], x: 11, y: 7.5,
    desc: [
      'Chevron blocks, ring blocks, upgrades, MAX+ circuits and field generators, with the creative chest and tank. It is the heaviest single craft of the pack.',
    ],
    tasks: [it('grindless:hyperstargate_base')],
    rewards: [xp(800)],
  },

  // ------------------------------------------------------------------ the structure and the gate
  {
    key: 'HG_STRUCT', kind: 'reading', title: 'The Structure', icon: 'grindless:hyperstargate_ring_block',
    deps: ['HG_IRIS', 'HG_IFACE', 'HG_LOCKED', 'HG_BASE'], x: 13, y: 5.5,
    desc: [
      'The ring stands in a 59 by 60 by 23 shell at Sgr A* orbit: 151 ring blocks and 9 locked chevrons on the ring, wrapped in a jacket of horizon gate casing, a cold channel of primordial cryostat casing, void diamond windows and an Fe-56 pedestal. The base row holds the iris, the base, 4 power units and a 4,096 A wireless MAX+ hatch: the dial draws its power through that hatch from the network store, which only the capacitor banks make large enough.',
    ],
    tasks: [ck()],
    rewards: [xp(100)],
  },
  {
    key: 'HG_MACH', kind: 'signature', title: 'The Hyperstargate', icon: 'gtceu:hyperstargate',
    deps: ['HG_STRUCT'], x: 14.5, y: 2,
    teach: {
      for: 'The &6Hyperstargate&r is the pack\'s last multiblock. It forms round a dial at Sgr A* orbit and opens a ring into the final dimension.',
      needs: 'The controller recipe is crafted at the black hole orbit, from ring blocks, a controller crystal, a creative computation provider, MAX+ circuits and the interface. The structure then needs the ring, the iris, the base, four power units and the 4,096 A wireless hatch, with a horizon lock kept in the controller.',
      unlocks: 'The dial.',
      automate: 'Nothing here is a production line. Build it once and keep the banks charged.',
    },
    desc: [],
    tasks: [it('gtceu:hyperstargate')],
    rewards: [xp(1000)],
  },
  {
    key: 'HG_DIAL', kind: 'reading', title: 'The Dial', icon: 'grindless:horizon_lock',
    deps: ['HG_MACH'], x: 16, y: 2,
    teach: {
      for: 'The dial opens the ring for a minute. It eats the genome archive, the cloud phase map, a stack of phase locks and a crate of jacketed cells, and keeps the &6Horizon Lock&r in the controller.',
      needs: 'The full charge in your team\'s capacitor banks for the whole opening (the wireless network is per team); EMI shows the draw. The dial will not start on a charge it cannot finish.',
      unlocks: 'The crossing, and a spent charge to recharge.',
      automate: 'Stock every input and keep the banks full. The next opening costs the same.',
    },
    desc: [],
    tasks: [ck()],
    rewards: [xp(100)],
  },
  {
    key: 'HG_RECHARGE', kind: 'reading', title: 'Recharging the Dial', icon: 'grindless:spent_dial_charge',
    deps: ['HG_DIAL'], x: 17.5, y: 1,
    desc: [
      'The dial returns a spent charge. The condensate refinery recharges it, and 48 of the 64 cells come back for the next opening. The phase locks are used up: each opening needs sixteen new ones.',
    ],
    tasks: [ck()],
    rewards: [xp(100)],
  },
  {
    key: 'HG_CROSS', kind: 'reading', title: 'One Dial, One Team', icon: 'gtceu:hyperstargate',
    deps: ['HG_DIAL'], x: 17.5, y: 2,
    desc: [
      'The ring is open only while the dial runs, and one dial takes the whole team: every member of the team that owns the controller crosses once per opening, and nobody from another team does. A solo player is a team of one. A second crossing, for anyone, pays for its own archive and charge. Nothing else goes through.',
    ],
    tasks: [ck()],
    rewards: [xp(100)],
  },
];
// Shipped shapes and Terminal passes (a pass is up to 2,300 blocks), from the structure dump.
const SIZE = {
  TR_FURN: ['21 by 23 by 21', 3], TR_COND: ['25 by 15 by 25', 5], TR_BANK: ['41 by 9 by 41', 2], TR_ARRAY: ['33 by 13 by 33', 7],
  HG_MACH: ['59 by 60 by 23', 6],
};
for (const q of QUESTS) {
  const s = SIZE[q.key];
  if (s && q.teach) q.teach.needs += ` Its shape is ${s[0]}, built by the Terminal in ${s[1]} passes.`;
}
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
