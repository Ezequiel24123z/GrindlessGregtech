// Quest data for the HV teaching section: the HV multiblocks that no other quest of the era names. One row per theme, left to
// right; every row starts under the one before it. Rewards are XP only.
const PARENT = { key: 'HV_SIMPLE_SOC', x: 4, y: 6 };
const ROWS = [
  [
    ['HV_MULTI_SMELTER', 'Multi Smelter', 'gtceu:multi_smelter',
      'The &6Multi Smelter&r cooks a whole stack of ingots at once, and alloys them too.',
      'Its controller, which takes a furnace, HV circuits and copper cable, and cupronickel coils.',
      'Bronze, brass and cupronickel by the stack, with no row of furnaces.',
      'Ingots in by bus, alloys out by bus.', 40],
    ['HV_IMPLOSION_COMPRESSOR', 'Implosion Compressor', 'gtceu:implosion_compressor',
      'Some gems only form under a blast. The &6Implosion Compressor&r does it behind steel walls, and you stand clear.',
      'Its controller, with obsidian, HV circuits and gold cable, and explosives to feed it.',
      'Ender pearls and gems, made on purpose.',
      'Gems in and explosives in by bus, results out by bus.', 40],
  ],
  [
    ['HV_CRACKER', 'Cracker', 'gtceu:cracker',
      'Long hydrocarbons break into short ones inside the &6Cracker&r, with hydrogen or steam to help.',
      'Its controller, with cupronickel coils, an HV pump and HV circuits.',
      'Lighter oil products for plastics and fuels, and a base for the big cracking hall later.',
      'Oil and hydrogen in by hatch, cracked fluids out by hatch.', 40],
    ['HV_DISTILLATION_TOWER', 'Distillation Tower', 'gtceu:distillation_tower',
      'The &6Distillation Tower&r splits oil into its fractions, one output hatch per layer.',
      'Its controller, with EV circuits, a stainless fluid pipe and an HV pump.',
      'Light fuel, propene, lubricant and the parts of the large distillery and the heavy-water plant.',
      'Fluid in by hatch, each fraction out by its own hatch.', 40],
  ],
  [
    ['HV_STEEL_LARGE_BOILER', 'Steel Large Boiler', 'gtceu:steel_large_boiler',
      'The &6Steel Large Boiler&r burns solid fuel into steam for every turbine that follows.',
      'Its controller, with a steel firebox casing, HV circuits and copper cable.',
      'Steam at the scale a turbine hall wants, before the titanium boiler.',
      'Fuel in by bus, water in by hatch, steam out by hatch.', 40],
  ],
];

export const CHAPTER = {
  section: { name: 'Machines', origin: { x: 0, y: 0 }, heading: { key: 'HV_H_TEACHING', x: PARENT.x, y: PARENT.y + 2.5, deps: [PARENT.key], icon: 'gtceu:cracker', desc: ['The HV halls that are not part of a line: smelting, blasting, cracking, distilling and the first big boiler.'] } },
};

export const QUESTS = ROWS.flatMap((row, r) => row.map(([key, title, item, f, n, u, a, xp], i) => ({
  key, kind: 'machine', title, icon: item,
  deps: [i > 0 ? row[i - 1][0] : r > 0 ? ROWS[r - 1][0][0] : 'HV_H_TEACHING'],
  x: PARENT.x + 2 + 2 * i, y: PARENT.y + 4.5 + 2 * r,
  teach: { for: f, needs: n, unlocks: u, automate: a },
  desc: [],
  tasks: [{ type: 'item', item }],
  rewards: [{ type: 'xp', xp }],
})));
