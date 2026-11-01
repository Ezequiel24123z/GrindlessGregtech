// Quest data for uev_age ("UEV: Several Stars"), the journey chapter: home, the drives, Alpha Centauri, Barnard b, Sirius B and the gate
// (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/uev.md, "Quests", "Gate to UIV").
// The era's machines and circuits are in uev_machines and uev_circuits (RF-5Q-UEVb); the Mk4 plasmas, the parallel hatch, the UEV cell,
// the DFD, the AE2 steps and the older machines' new modes are in uev_integration. Quests that moved there keep their keys and ids.
// Fixed keys (other chapters link to them): START, MK1, ALPHA, BARN, MK2, SIRIUS, WARP, HOLD, J_HOME, A_CHART, B_CORE, S_PELLET.
// Positions: columns every 2, rows every 2. The spine runs along y = 0; Alpha Centauri is above it, Barnard b below, Sirius B at the end.
const it = (item, count) => ({ type: 'item', item, count });
const dim = (dimension) => ({ type: 'dimension', dimension });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  order: 0,
  icon: 'gtceu:uev_machine_casing',
  autofocus: 'START',
  title: 'UEV: Several Stars',
  subtitle: ['A first light at home, then Alpha Centauri, Barnard b and a white dwarf, and a gate held open.'],
};

export const QUESTS = [
  // ------------------------------------------------------------------ home
  {
    key: 'START', kind: 'start', title: 'Several Stars', icon: 'gtceu:uev_machine_hull',
    deps: ['X:7C44999E6D4544D4'], x: 0, y: 0,
    desc: [
      'The &6Stellar Neighbourhood Chart&r gave you the &6UEV Machine Hull&r. One star is not enough now: three more are within reach of a drive.',
      'Home first: isotopes, pressure, light and a new fusion reactor. Then Alpha Centauri and Barnard b, and last a white dwarf.',
    ],
    tasks: [it('gtceu:uev_machine_hull'), it('grindless:stellar_neighbourhood_chart')],
    rewards: [xp(50)],
  },
  {
    key: 'J_HOME', kind: 'reading', title: 'Home First', icon: 'gtceu:uev_machine_hull',
    deps: ['START'], x: 2, y: 0,
    desc: [
      'Most of UEV is built at home. The drives, the stations and the gate all need what the four home lanes make, so the machine tabs come before the rockets.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'J_SUPER', kind: 'reading', title: 'The Heaviest Atoms', icon: 'gtceu:calutron',
    deps: ['J_HOME'], x: 4, y: -4,
    desc: [
      'Calcium-48 and an actinide target make atoms heavier than anything in nature. They live for seconds, so the chemistry is built around speed. The Superheavy Census closes the lane.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'J_PRESS', kind: 'reading', title: 'A Megabar', icon: 'gtceu:megabar_press',
    deps: ['J_HOME'], x: 4, y: -2,
    desc: [
      'Pressure and clean melting give diamond harder than any mined, ceramic fibres with no seam and the coil for the next fusion reactor.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'J_LIGHT', kind: 'reading', title: 'One Photon at a Time', icon: 'gtceu:photonic_integration_hall',
    deps: ['J_HOME'], x: 4, y: 2,
    desc: [
      'Single-photon detectors, stacked graphene and a chip made of waveguides lead to the first computer that thinks in light.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'J_FUSION', kind: 'reading', title: 'A Hotter Ring', icon: 'gtceu:uev_fusion_reactor',
    deps: ['J_HOME'], x: 4, y: 4,
    desc: [
      'The Mk4 ring burns helium-3 aligned by a laser, and a direct converter turns its plasma into current. It is the power the gate asks for.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },

  // ------------------------------------------------------------------ the drives
  {
    key: 'MK1', kind: 'step', title: 'Drive Mk1', icon: 'grindless:dfd_mk1_motor',
    deps: ['J_HOME'], x: 4, y: 0,
    desc: [
      'The &6DFD Mk1 Motor&r is made at home: its antenna is a UEV emitter. It carries a level 9 rocket to the next star and needs nothing from abroad.',
    ],
    tasks: [it('grindless:dfd_mk1_motor')],
    rewards: [xp(150)],
  },
  {
    key: 'LVL9', kind: 'reading', title: 'Level Nine', icon: 'gtceu:uev_machine_hull',
    deps: ['MK1'], x: 6, y: 0,
    desc: [
      'A level 9 rocket is the first that crosses between stars. The trip takes four light years of fuel, so load the tanks from ME and check the guidance before launch.',
    ],
    tasks: [ck()],
    rewards: [xp(50)],
  },

  // ------------------------------------------------------------------ Alpha Centauri
  {
    key: 'ALPHA', kind: 'step', title: 'First Light of Another Star', icon: 'gtceu:uev_machine_casing',
    deps: ['LVL9'], x: 8, y: -2,
    desc: [
      'Park in orbit round &6Alpha Centauri&r A and B and build station nine. Every machine of the star lives in that orbit.',
    ],
    tasks: [dim('grindless:alpha_centauri_orbit')],
    rewards: [xp(200)],
  },
  {
    key: 'A_BINARY', kind: 'reading', title: 'Two Suns', icon: 'minecraft:sunflower',
    deps: ['ALPHA'], x: 10, y: -4,
    desc: [
      'A and B circle each other, and a dim third star trails far behind. The swarm here collects from A.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'A_GAS', kind: 'reading', title: 'Thin Gas, Old Dust', icon: 'gtceu:nebula_collector',
    deps: ['ALPHA'], x: 10, y: -2,
    desc: [
      'The orbit holds gas and dust between the stars, and the collectors and the dust lab work it. Real interstellar gas is a few atoms in a cubic metre; the yield here is a game number.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'A_CHART', kind: 'step', title: 'The Course to Sirius', icon: 'grindless:pulsar_navigation_chart',
    deps: ['A_GAS'], x: 12, y: -2,
    desc: [
      'Pulsars tick like clocks, and three of them fix your place. The &6Pulsar Navigation Chart&r gives the course to the white dwarf and is research for the UIV casing.',
    ],
    tasks: [it('grindless:pulsar_navigation_chart')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ Barnard b
  {
    key: 'BARN', kind: 'step', title: 'Barnard b', icon: 'gtceu:barnard_core_drill',
    deps: ['LVL9'], x: 8, y: 2,
    desc: [
      'Barnard\'s Star is a cold red dwarf with an iron planet. Land on &6Barnard b&r and sink the &6Barnard Core Drill&r for a core rock.',
    ],
    tasks: [dim('grindless:barnard_b'), it('gtceu:barnard_core_drill')],
    rewards: [xp(200)],
  },
  {
    key: 'B_RED', kind: 'reading', title: 'A Cold Red Light', icon: 'minecraft:red_dye',
    deps: ['BARN'], x: 10, y: 4,
    desc: [
      'The planet\'s year is days long and its star flares. Build the base under shielding, and keep the machines that fear heat on the night side.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'B_CORE', kind: 'step', title: 'An Iron World', icon: 'grindless:barnard_core_rock',
    deps: ['BARN'], x: 10, y: 2,
    desc: [
      'Barnard b is mostly iron, with nickel, cobalt and a rhenium-rich residue. The &6Barnard Core Rock&r is what the carbonyl route starts from, and the rhenium goes home for the Mk2 drive.',
    ],
    tasks: [it('grindless:barnard_core_rock')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ Mk2 and Sirius B
  {
    key: 'MK2', kind: 'step', title: 'Drive Mk2', icon: 'grindless:dfd_mk2_motor',
    deps: ['A_CHART', 'B_CORE'], x: 14, y: 0,
    desc: [
      'The Mk2 drive takes the UEV motor and a Brayton turbine wheel cast as single crystals. It is the drive for a level 10 rocket.',
    ],
    tasks: [it('grindless:dfd_mk2_motor'), it('grindless:brayton_turbine_wheel')],
    rewards: [xp(250)],
  },
  {
    key: 'LVL10', kind: 'reading', title: 'Level Ten', icon: 'gtceu:uev_machine_hull',
    deps: ['MK2'], x: 16, y: 0,
    desc: [
      'The level 10 flight is one of the gate\'s tests: one trip to Sirius B on the Mk2 drive, with the pulsar course set.',
    ],
    tasks: [ck()],
    rewards: [xp(50)],
  },
  {
    key: 'SIRIUS', kind: 'step', title: 'Sirius B', icon: 'grindless:warp_gate_casing',
    deps: ['LVL10'], x: 18, y: 0,
    desc: [
      'Sirius B is a white dwarf, a star\'s core left bare. Park in its orbit and build station ten.',
    ],
    tasks: [dim('grindless:sirius_b_orbit')],
    rewards: [xp(250)],
  },
  {
    key: 'S_DWARF', kind: 'reading', title: 'A Star\'s Core', icon: 'gtceu:white_dwarf_spectrograph',
    deps: ['SIRIUS'], x: 20, y: -2,
    desc: [
      'A white dwarf packs a Sun\'s mass into an Earth\'s volume. Light climbing out of its gravity loses energy, and that loss is what the instruments here measure.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'S_FIC', kind: 'reading', title: 'Fiction, Mostly', icon: 'gtceu:degenerate_harvester',
    deps: ['SIRIUS'], x: 20, y: 2,
    desc: [
      'Nothing like a spoonful of white dwarf could be lifted, or weigh what it does. Degenerate matter here is a recipe and no more.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'S_PELLET', kind: 'step', title: 'A White Dwarf in a Bottle', icon: 'grindless:degenerate_pellet',
    deps: ['SIRIUS'], x: 20, y: 0,
    desc: [
      'A sealed &6Degenerate Pellet&r is a fuel that never runs out in your lifetime. The gate\'s load is run on it.',
    ],
    tasks: [it('grindless:degenerate_pellet')],
    rewards: [xp(250)],
  },

  // ------------------------------------------------------------------ the gate
  {
    key: 'WARP', kind: 'step', title: 'The Gate at UEV', icon: 'gtceu:warp_gate',
    deps: ['S_PELLET'], x: 22, y: 0,
    desc: [
      'The warp gate was built for UHV. At the UEV load it draws sixteen amps of UEV and runs on a circuit 3 program. Your fuel is in the pellets and your power is in the cell.',
    ],
    tasks: [it('gtceu:warp_gate')],
    rewards: [xp(250)],
  },
  {
    key: 'HOLD', kind: 'exit', title: 'Gate to UIV', icon: 'gtceu:warp_gate',
    deps: ['WARP'], x: 24, y: 0,
    desc: [
      'Hold the warp gate open at the UEV load for sixty seconds in Sirius B orbit, then tick this box. The gate\'s casing is never a reward: it is a product of the run.',
    ],
    tasks: [ck()],
    rewards: [xp(300)],
  },
];
