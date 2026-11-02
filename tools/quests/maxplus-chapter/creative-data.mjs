// Quest data for maxplus_creative ("MAX+: Creative Items"): the four K cores and the six creative stand-ins, made on the hyper assembly array
// (docs/reforge/05_quest_design.md; docs/eras/maxplus.md, "Creative items").
// They are ingredients only: not placeable and no source of anything. The array itself is taught in maxplus_hyperstargate (HG_ARRAY).
// Counts follow the gate: 4 creative energy (one per power unit), one creative energy cell in hand (40 are used, one per capacitor; the item stacks to 1), 1 of each of the rest.
// The row starts at a link to the stage's grid quest. Positions: columns every 2, rows every 2.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: 'maxplus_creative',
  era: 'maxplus',
  role: 'capstone',
  order: 6,
  icon: 'grindless:creative_energy',
  autofocus: 'CR_RULE',
  section: { name: 'Creative Items', origin: { x: 61.5, y: -1 }, heading: { key: 'H_CREATIVE', x: 0, y: 0, deps: ['S3_HOME'], icon: 'grindless:creative_energy', desc: ['The four cores and the six creative stand-ins: ingredients of the gate that can never be placed.'] } },
  title: 'MAX+: Creative Items',
  subtitle: ['Six creative blocks, crafted at enormous cost and used up as ingredients of the gate. None of them will ever run.'],
};

export const LINKS = [
  { key: 'CR_L_IN', ref: 'S3_HOME', x: 0, y: 0 },
];

export const QUESTS = [
  {
    key: 'CR_RULE', kind: 'step', title: 'Ingredients Only', icon: 'grindless:creative_chest',
    deps: ['S3_HOME'], x: -0.5, y: 1.5,
    desc: [
      'The creative items of this pack are parts, not toys. Set one down outside creative mode and the game cancels it with a message. A creative cell is refused by drives for the same reason.',
      'They make nothing and store nothing for you. They exist to be crafted, carried to the gate and consumed there.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [xp(50)],
  },
  {
    key: 'CR_CORES', kind: 'step', title: 'The Four Cores', icon: 'grindless:horizon_cloud_core',
    deps: ['CR_RULE'], x: 1, y: 3,
    desc: [
      'Each creative item starts from its own core: cloud, store, tank and computation. They come from their own lines, so they are the slow part.',
    ],
    tasks: [
      it('grindless:horizon_cloud_core'), it('grindless:bottomless_store_core'),
      it('grindless:bottomless_tank_core'), it('grindless:horizon_computation_core'),
    ],
    rewards: [xp(500)],
  },
  {
    key: 'CR_ENERGY', kind: 'process', title: 'Creative Energy', icon: 'grindless:creative_energy',
    deps: ['CR_CORES'], x: 4, y: 3,
    teach: {
      for: 'The &6Creative Energy Source (Ingredient)&r is a power unit\'s heart. It never runs as a source, because energy from nothing would end the pack\'s power chain.',
      needs: 'A cloud core and the hyper assembly array, plus a mountain of field coils, processors and condensate.',
      unlocks: 'The gate\'s power units.',
      automate: 'One array row per block. Keep a stock in AE2 before the gate needs it.',
    },
    desc: [],
    tasks: [it('grindless:creative_energy', 4)],
    rewards: [xp(800)],
  },
  {
    key: 'CR_CELL', kind: 'process', title: 'Creative Energy Cell', icon: 'grindless:creative_energy_cell',
    deps: ['CR_CORES'], x: 1, y: 1.5,
    teach: {
      for: 'The &6Creative Energy Cell (Ingredient)&r sits inside every horizon capacitor, as one of its parts. Drives will not take it.',
      needs: 'A cloud core and the array. A tenth of the cost of a creative block, and one for every capacitor of the bank. A cell holds one item to the stack, so a single cell in hand proves the craft.',
      unlocks: 'The capacitors of the bank.',
      automate: 'Queue it with the capacitor patterns so the bank never waits on it.',
    },
    desc: [],
    tasks: [it('grindless:creative_energy_cell')],
    rewards: [xp(800)],
  },
  {
    key: 'CR_CHEST', kind: 'process', title: 'Creative Chest', icon: 'grindless:creative_chest',
    deps: ['CR_CORES'], x: 2.5, y: 2,
    teach: {
      for: 'The &6Creative Chest (Ingredient)&r goes into the gate\'s base. Placed anywhere else it would void your logistics, so it is cancelled.',
      needs: 'A store core and the array.',
      unlocks: 'The gate\'s base.',
      automate: 'One craft, once. Do not forget to leave it in the network.',
    },
    desc: [],
    tasks: [it('grindless:creative_chest')],
    rewards: [xp(800)],
  },
  {
    key: 'CR_TANK', kind: 'process', title: 'Creative Tank', icon: 'grindless:creative_tank',
    deps: ['CR_CORES'], x: 2.5, y: 3.5,
    teach: {
      for: 'The &6Creative Tank (Ingredient)&r is the base\'s other half. It is a part, and it is never a fluid source.',
      needs: 'A tank core and the array.',
      unlocks: 'The gate\'s base.',
      automate: 'Order it beside the chest so the base is built in one pass.',
    },
    desc: [],
    tasks: [it('grindless:creative_tank')],
    rewards: [xp(800)],
  },
  {
    key: 'CR_COMP', kind: 'process', title: 'Creative Computation Provider', icon: 'grindless:creative_computation_provider',
    deps: ['CR_CORES'], x: 1, y: 4.5,
    teach: {
      for: 'The &6Creative Computation Provider (Ingredient)&r gives the controller all the thinking the dial asks for. Outside the gate it does nothing.',
      needs: 'A computation core and the array.',
      unlocks: 'The gate\'s controller.',
      automate: 'One craft, queued after the computation line is running.',
    },
    desc: [],
    tasks: [it('grindless:creative_computation_provider')],
    rewards: [xp(800)],
  },
  {
    key: 'CR_DATA', kind: 'process', title: 'Creative Data Access Hatch', icon: 'grindless:creative_data_access_hatch',
    deps: ['CR_COMP'], x: 2.5, y: 5,
    teach: {
      for: 'The &6Creative Data Access Hatch (Ingredient)&r is the interface\'s data store: every recipe the gate asks for, always available.',
      needs: 'A computation core, the array and a pile of pattern memory from the AE2 line.',
      unlocks: 'The gate\'s interface.',
      automate: 'Craft it after the provider, from the same stock of cores.',
    },
    desc: [],
    tasks: [it('grindless:creative_data_access_hatch')],
    rewards: [xp(800)],
  },
];
