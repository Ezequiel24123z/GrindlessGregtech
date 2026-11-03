// Quest data for the EV teaching section: the EV multiblocks that no other quest of the era names. One row per theme, left to
// right; every row starts under the one before it. Rewards are XP only.
const PARENT = { key: 'NPM', x: 30, y: 7.5 };
const ROWS = [
  [
    ['EV_LARGE_BOILER_TITANIUM', 'Titanium Large Boiler', 'gtceu:titanium_large_boiler',
      'The &6Titanium Large Boiler&r makes more steam than the steel one, from the same fuel.',
      'Its controller, with a titanium firebox casing, EV circuits and gold cable.',
      'Steam for the big turbine halls without a boiler farm.',
      'Fuel in by bus, water in by hatch, steam out by hatch.', 50],
    ['EV_LARGE_COMBUSTION_ENGINE', 'Large Combustion Engine', 'gtceu:large_combustion_engine',
      'Fuel burns in the &6Large Combustion Engine&r and turns into power at a fair rate. Oxygen makes it run harder.',
      'Its controller, with an EV piston, an EV motor and titanium gears.',
      'Power from diesel and other fuels, and the way up to the extreme engine.',
      'Fuel in by hatch. A pipe from the oxygen tank is all it needs.', 50],
    ['EV_GAS_LARGE_TURBINE', 'Gas Turbine', 'gtceu:gas_large_turbine',
      'Gas goes through the &6Large Gas Turbine&r and comes out as power. Rotors do the work, so keep spares.',
      'Its controller, with stainless gears, EV circuits and a stainless fluid pipe, and a rotor holder.',
      'Power from natural gas and fuels, and a part of the combined-cycle plant.',
      'Gas in by hatch. Swap a worn rotor before it breaks.', 50],
  ],
  [
    ['EV_LARGE_MINER', 'EV Large Miner', 'gtceu:ev_large_miner',
      'The &6EV Large Miner&r digs a wide square of ore and pulls it all up in one go.',
      'Its controller, with an EV hull, titanium frames and IV circuits, and drill fluid.',
      'Ore at a rate no single drill reaches.',
      'Ore out by bus. Feed the drilling fluid from a tank.', 50],
    ['EV_HV_FLUID_DRILLING_RIG', 'Fluid Drilling Rig', 'gtceu:hv_fluid_drilling_rig',
      'The &6Fluid Drilling Rig&r pulls oil and other fluids from the vein under it and costs no ore.',
      'Its controller, with an EV hull, titanium frames and EV circuits.',
      'Fluids from a vein, and a step toward the in-situ leach field.',
      'Fluid out by hatch, straight into a pipe.', 50],
  ],
  [
    ['EV_THERMAL_REACTOR', 'Thermal Reactor', 'gtca:thermal_reactor',
      'Heat does the chemistry inside the &6Thermal Reactor&r. Several jobs that took chains now take one machine.',
      'Its controller, with EV circuits, tungsten steel rotors and an EV pump.',
      'Redstone, aluminium dust and silica dust from heat alone.',
      'Items and fluid in by bus and hatch, results out the same way.', 50],
  ],
];

export const CHAPTER = {
  section: { name: 'Machines', origin: { x: 0, y: 0 }, heading: { key: 'EV_H_TEACHING', x: PARENT.x, y: PARENT.y + 2.5, deps: [PARENT.key], icon: 'gtceu:large_combustion_engine', desc: ['The EV halls that sit outside the lines: boilers, engines, turbines, miners, drilling rigs and a reactor.'] } },
};

export const QUESTS = ROWS.flatMap((row, r) => row.map(([key, title, item, f, n, u, a, xp], i) => ({
  key, kind: 'machine', title, icon: item,
  deps: [i > 0 ? row[i - 1][0] : r > 0 ? ROWS[r - 1][0][0] : 'EV_H_TEACHING'],
  x: PARENT.x + 2 + 2 * i, y: PARENT.y + 4.5 + 2 * r,
  teach: { for: f, needs: n, unlocks: u, automate: a },
  desc: [],
  tasks: [{ type: 'item', item }],
  rewards: [{ type: 'xp', xp }],
})));
