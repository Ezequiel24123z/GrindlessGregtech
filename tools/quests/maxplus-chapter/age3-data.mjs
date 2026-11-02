// Quest data for maxplus_age_3 ("MAX+: The Hyperstargate"), stage III's journey: the tree's products, the grid crafts at home,
// the gate formed, the dial and the arrival (docs/reforge/05_quest_design.md; docs/eras/maxplus.md, "Route" 11 to 13, "The Hyperstargate", "The ending").
// This chapter follows the items. The machines of the tree and the gate's parts are taught in maxplus_hyperstargate (HG_*), the creative items
// in maxplus_creative (CR_*), and the wireless store in maxplus_integration.
// Fixed keys: STAGE3 (depends on STAGE2_END of XP-C2a), ARRIVAL.
// ARRIVAL is a dimension task on grindless:horizon_city and gives nothing. XP-Z1b gives the epilogue and rolls the credits; no quest does.
// Positions: columns every 2, rows every 2 along y = 0; the tree's products stand in two columns at x = 6 and 8.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const dim = (dimension) => ({ type: 'dimension', dimension });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: 'maxplus_age_3',
  era: 'maxplus',
  role: 'age',
  order: 2,
  icon: 'gtceu:hyperstargate',
  autofocus: 'STAGE3',
  section: { name: 'Stage III: Back to the Hole', origin: { x: 46, y: 0 } },
  title: 'MAX+: The Hyperstargate',
  subtitle: ['A tree of plasma, crystal and condensate that grows anywhere, a great many parts at home and one ring at the black hole that opens for a single crossing.'],
};

export const QUESTS = [
  // ------------------------------------------------------------------ the tree
  {
    key: 'STAGE3', kind: 'start', title: 'Stage III Begins', icon: 'gtceu:hyperstargate',
    deps: ['STAGE2_END'], x: 0, y: 0,
    desc: [
      'Crystals from the dark, meta-materials from the loom and every place you have ever worked. The last stage spends all of it on one gate.',
    ],
    tasks: [ck()],
    rewards: [xp(100)],
  },
  {
    key: 'S3_SITE', kind: 'reading', title: 'Back to the Hole', icon: 'grindless:horizon_lock',
    deps: ['STAGE3'], x: 2, y: 0,
    desc: [
      'The gate goes up where the shell holds the horizon still, at Sgr A* orbit, and the controller recipe is crafted there too. The tree that feeds it needs no such place: its machines run anywhere, so grow it at home.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'S3_TREE', kind: 'reading', title: 'The Shape of the Tree', icon: 'gtceu:condensate_assembler',
    deps: ['S3_SITE'], x: 4, y: 0,
    desc: [
      'Three trunks. Plasmas become a slurry and the slurry becomes crystal. Condensate becomes plates, cores and mesh. Charge goes into a bank. Everything else is built at home.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'S3_SLURRY', kind: 'step', title: 'Horizon Crystal Slurry', icon: 'gtceu:horizon_crystal_slurry_bucket',
    deps: ['S3_TREE'], x: 8.5, y: -3,
    desc: [
      'One plasma from every place you have worked, blended into a single bucket. It is the only slurry there is.',
    ],
    tasks: [it('gtceu:horizon_crystal_slurry_bucket')],
    rewards: [xp(300)],
  },
  {
    key: 'S3_CORE', kind: 'step', title: 'Core Crystals', icon: 'grindless:horizon_core_crystal',
    deps: ['S3_SLURRY'], x: 10, y: -3.5,
    desc: [
      'Core crystals are cut from inscribed crystals in the nuclear demagnetisation line, with liquid helium. The gate\'s parts want a crowd of them.',
    ],
    tasks: [it('grindless:horizon_core_crystal', 64)],
    rewards: [xp(400)],
  },
  {
    key: 'S3_CTRL', kind: 'step', title: 'Controller Crystal', icon: 'grindless:horizon_controller_crystal',
    deps: ['S3_SLURRY'], x: 12.5, y: -2,
    desc: [
      'One flawless crystal for the gate\'s controller. It grows slowly, so start it early.',
    ],
    tasks: [it('grindless:horizon_controller_crystal')],
    rewards: [xp(300)],
  },
  {
    key: 'S3_CAPS', kind: 'step', title: 'Capacitors for the Bank', icon: 'grindless:horizon_capacitor',
    deps: ['S3_HOME', 'CR_CELL'], x: 16, y: -0.5,
    desc: [
      'Each capacitor holds a slice of the dial\'s charge. The bank is a ring of them, built into the gate at Sgr A* orbit.',
    ],
    tasks: [it('grindless:horizon_capacitor', 40)],
    rewards: [xp(400)],
  },
  {
    key: 'S3_PLATE', kind: 'step', title: 'Containment Plates', icon: 'grindless:horizon_containment_plate',
    deps: ['S3_TREE'], x: 9, y: -1,
    desc: [
      'A plate of bound condensate, pressed until it stops leaking light. The gate eats them in great numbers; a stack in hand proves the line, and the rest stay in AE2.',
    ],
    tasks: [it('grindless:horizon_containment_plate', 64)],
    rewards: [xp(400)],
  },
  {
    key: 'S3_CHEV', kind: 'step', title: 'Chevron Cores', icon: 'grindless:chevron_core',
    deps: ['S3_TREE'], x: 7, y: 0,
    desc: [
      'The small knot of field that makes a chevron a chevron. Ring blocks and upgrades both carry some. A stack in hand proves the line; the rest stay in AE2.',
    ],
    tasks: [it('grindless:chevron_core', 64)],
    rewards: [xp(400)],
  },
  {
    key: 'S3_MESH', kind: 'step', title: 'Horizon Mesh', icon: 'grindless:horizon_mesh',
    deps: ['S3_TREE'], x: 9, y: 1,
    desc: [
      'A woven sheet that holds the frame parts together. The assembler is the only place it comes from.',
    ],
    tasks: [it('grindless:horizon_mesh')],
    rewards: [xp(300)],
  },
  {
    key: 'S3_FRAME', kind: 'step', title: 'Frame Parts', icon: 'grindless:horizon_frame_part',
    deps: ['S3_PLATE', 'S3_MESH', 'S3_CHEV'], x: 10.5, y: -0.5,
    desc: [
      'The loom\'s four meta-materials, a mesh and plates, assembled into the part that every ring block is made of. A stack in hand proves the line; the rest stay in AE2.',
    ],
    tasks: [it('grindless:horizon_frame_part', 64)],
    rewards: [xp(500)],
  },

  // ------------------------------------------------------------------ home
  {
    key: 'S3_HOME', kind: 'reading', title: 'The Grid at Home', icon: 'gtceu:hyper_assembly_array',
    deps: ['S3_CTRL', 'S3_FRAME'], x: 14.5, y: -1.5,
    desc: [
      'Back home the hyper assembly array does the rest: a grid for every part, and a great many of those. Feed it from AE2 and let the patterns do the counting.',
    ],
    tasks: [ck()],
    rewards: [xp(50)],
  },
  {
    key: 'S3_COMP', kind: 'step', title: 'Compressed Plates', icon: 'grindless:horizon_compressed_plate',
    deps: ['S3_HOME'], x: 16, y: -3,
    desc: [
      'Upgrades and ring blocks use them most. A stack in hand proves the line; the rest stay in AE2.',
    ],
    tasks: [it('grindless:horizon_compressed_plate', 64)],
    rewards: [xp(500)],
  },
  {
    key: 'S3_FIELD', kind: 'step', title: 'Field Generators', icon: 'grindless:maxplus_field_generator',
    deps: ['S3_HOME'], x: 17.5, y: -2,
    desc: [
      'A field generator sits inside nearly every part of the gate. Build the line once and leave it running; a stack in hand proves it, the rest stay in AE2.',
    ],
    tasks: [it('grindless:maxplus_field_generator', 64)],
    rewards: [xp(500)],
  },
  {
    key: 'S3_PROC', kind: 'step', title: 'Horizon Processors', icon: 'grindless:horizon_processor',
    deps: ['S3_HOME'], x: 19, y: -1.5,
    desc: [
      'The gate\'s controller, its base and its locked chevrons take them, and so do many machines of the pack, which makes this the biggest circuit order of the pack. A stack in hand proves the line; the rest stay in AE2, so plan the Hyperfactory\'s bus before you start.',
    ],
    tasks: [it('grindless:horizon_processor', 64)],
    rewards: [xp(600)],
  },
  {
    key: 'S3_ARCH', kind: 'step', title: 'The Archive and the Map', icon: 'grindless:genome_archive',
    deps: ['S3_GATE'], x: 21, y: -0.5,
    desc: [
      'The &6Genome Archive&r is the one thing that crosses with you. The &6Cloud Phase Map&r from the interferometer tells the dial where to aim.',
    ],
    tasks: [it('grindless:genome_archive'), it('grindless:cloud_phase_map')],
    rewards: [xp(400)],
  },
  {
    key: 'S3_LOCKS', kind: 'step', title: 'Locks and Cells for the Dial', icon: 'grindless:jacketed_condensate_cell',
    deps: ['S3_GATE'], x: 22, y: -2,
    desc: [
      'Every opening uses up sixteen phase locks and a crate of jacketed cells. The locks are gone for good; the refinery recharges the spent charge into most of the cells again.',
    ],
    tasks: [it('grindless:horizon_phase_lock', 16), it('grindless:jacketed_condensate_cell', 64)],
    rewards: [xp(500)],
  },

  // ------------------------------------------------------------------ the gate, the dial, the arrival
  {
    key: 'S3_GATE', kind: 'milestone', title: 'The Gate Stands', icon: 'gtceu:hyperstargate',
    deps: ['S3_COMP', 'S3_FIELD',     'S3_PROC', 'S3_CAPS', 'HG_MACH'], x: 20.5, y: -2,
    desc: [
          'The ring is closed, the base is lit and the controller holds its kept lock. It looks like nothing so much as a very large door. Check it off once it has formed.',
    ],
        tasks: [ck()],
    rewards: [xp(1000)],
  },
  {
    key: 'S3_DIAL', kind: 'step', title: 'Run the Dial', icon: 'grindless:spent_dial_charge',
    deps: ['S3_ARCH', 'S3_LOCKS'], x: 22.5, y: -0.5,
    desc: [
      'Start the dial once. The ring opens, the banks drain and the refinery gets a spent charge to recharge for the next time.',
    ],
    tasks: [it('grindless:spent_dial_charge')],
    rewards: [xp(1000)],
  },
  {
    key: 'ARRIVAL', kind: 'exit', title: 'Beyond the Horizon', icon: 'grindless:genome_archive',
    deps: ['S3_DIAL'], x: 24.5, y: -0.5,
    desc: [
      'Step into the ring while it is open. One player crosses per opening.',
    ],
    tasks: [dim('grindless:horizon_city')],
    rewards: [],
  },
];
