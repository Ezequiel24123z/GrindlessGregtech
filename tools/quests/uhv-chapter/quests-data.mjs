// Quest data for uhv_age ("UHV: Proxima and the Swarm"), the journey chapter: home, the elevator, the gate, Mercury and Proxima b
// (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/uhv.md, "Quests", "Gate to UEV").
// The older machines' new modes, the power devices, the swarm plant, the network and the AE2 steps are in uhv_integration; the era's new
// machines and circuits are in uhv_machines and uhv_circuits (RF-5Q-UHVb). Quests that moved there keep their keys and ids.
// Fixed keys (other chapters link to them): START, STN7, STN8, GATEOPEN, STEP, GATE.
// Positions: columns every 2, rows every 2. The spine runs along y = 0 from START to the Gate to UEV; Mercury is above it, Proxima b below.
const it = (item, count) => ({ type: 'item', item, count });
const dim = (dimension) => ({ type: 'dimension', dimension });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  era: 'uhv',
  role: 'age',
  order: 0,
  icon: 'grindless:stellar_neighbourhood_chart',
  autofocus: 'START',
  title: 'UHV: Proxima and the Swarm',
  subtitle: ['Up the elevator, a gate to the star next door, a swarm of mirrors round Mercury and the first base on Proxima b.'],
};

export const LINKS = [];

export const QUESTS = [
  // ------------------------------------------------------------------ home and the elevator
  {
    key: 'START', kind: 'start', title: 'Proxima and Beyond', icon: 'grindless:proxima_approach_data',
    deps: ['X:183EEB9BF7A06AC5'], x: 0, y: 0,
    desc: [
      'The &6Proxima Approach Data&r says the nearest star has a rocky planet in its habitable zone. The &6Heavy Curium Oxide&r in store is what the next isotopes start from.',
      'The road runs up the elevator, through a gate, to Mercury and Proxima b. The machines on that road have their own chapters.',
    ],
    tasks: [it('grindless:proxima_approach_data'), it('grindless:heavy_curium_oxide')],
    rewards: [xp(50)],
  },
  {
    key: 'J_HOME', kind: 'reading', title: 'Home First', icon: 'gtceu:uhv_machine_hull',
    deps: ['START'], x: 2, y: 0,
    desc: [
      'Most of UHV is built at home: isotopes, light, silicon carbide, life. The gate and the stations need all of it, so the machine tabs come before the rockets.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'J_ISO', kind: 'reading', title: 'Heavier Isotopes', icon: 'gtceu:high_flux_reactor',
    deps: ['J_HOME'], x: 4, y: -2,
    desc: [
      'Berkelium, californium, nickel-63 and thorium-229 all come from one very hot reactor and its chemistry. They feed the clock, the batteries and the gate.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'J_LIGHT', kind: 'reading', title: 'Light Does the Work', icon: 'gtceu:photonic_foundry',
    deps: ['J_HOME'], x: 4, y: 2,
    desc: [
      'Crystals, lasers and optical chips replace a lot of electronics from here on. The glass that carries them is pulled in orbit.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'ELEV', kind: 'machine', title: 'Up the Elevator', icon: 'gtca:space_elevator',
    deps: ['J_HOME'], x: 4, y: 0,
    teach: {
      for: 'The &6Space Elevator&r is a base, a cable and a lift: payload reaches the stations without a rocket.',
      needs: 'A tether climber on a ribbon long enough to reach orbit, and the elevator\'s own casings.',
      unlocks: 'Station level 8 and the kits for Mercury and Proxima b.',
      automate: 'Load the lift from ME and let it send payload on a schedule.',
    },
    desc: [],
    tasks: [it('gtca:space_elevator')],
    rewards: [xp(200)],
  },
  {
    key: 'LVL8', kind: 'step', title: 'Level Eight', icon: 'gtceu:uhv_machine_hull',
    deps: ['ELEV'], x: 6, y: 0,
    desc: [
      'The elevator reaches the eighth station level. UHV hulls can now go up with the payload, and the next two stations need them.',
    ],
    tasks: [ck()],
    rewards: [xp(50)],
  },
  {
    key: 'PLAN', kind: 'step', title: 'Planetary Protection', icon: 'grindless:bsl4_casing',
    deps: ['LVL8'], x: 6, y: 2,
    desc: [
      'Nothing that lived on another world reaches Earth unsterilised. Every lab that handles samples sits behind casing rated &6BSL-4&r: it seals the room.',
    ],
    tasks: [it('grindless:bsl4_casing')],
    rewards: [xp(100)],
  },
  {
    key: 'ICAN', kind: 'step', title: 'The Motor', icon: 'grindless:ican_rocket_motor',
    deps: ['LVL8'], x: 8, y: 2,
    desc: [
      'An antimatter-catalysed fission motor behind a heat-proof nozzle. The &6ICAN Rocket Motor&r is the engine that makes a four-year trip possible at all.',
    ],
    tasks: [it('grindless:ican_rocket_motor')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ the gate
  {
    key: 'GATEOPEN', kind: 'machine', title: 'The Gate Opens', icon: 'gtceu:warp_gate',
    deps: ['LVL8'], x: 8, y: 0,
    teach: {
      for: 'The &6Warp Gate&r is a ring built at both ends: one in Earth orbit, one at Proxima b. A first run opens it, a second holds it open.',
      needs: 'Exotic matter and antihydrogen cartridges for the opening, and the warp gate casing.',
      unlocks: 'The second station and the base at Proxima b.',
      automate: 'Antihydrogen and exotic matter by pipe and bus from their own lines; the shells come back after each run.',
    },
    desc: [],
    tasks: [it('gtceu:warp_gate'), it('grindless:warp_gate_casing')],
    rewards: [xp(250)],
  },
  {
    key: 'G_FICTION', kind: 'reading', title: 'Fiction, Mostly', icon: 'gtceu:casimir_array',
    deps: ['GATEOPEN'], x: 10, y: 2,
    desc: [
      'The Casimir force is real and tiny. Nobody has made negative energy from it. Here it holds a gate open, and that is a story the pack tells, not physics.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'STEP', kind: 'step', title: 'Step Through', icon: 'grindless:proxima_gate_seed',
    deps: ['GATEOPEN'], x: 10, y: 0,
    desc: [
      'Players cross only while both ends hold. Items go over the AE2 pair the &6Proxima Gate Seed&r makes, so nobody has to carry a stack of plates.',
    ],
    tasks: [it('grindless:proxima_gate_seed')],
    rewards: [xp(200)],
  },

  // ------------------------------------------------------------------ Mercury
  {
    key: 'STN7', kind: 'step', title: 'Seventh Station', icon: 'gtceu:uhv_machine_hull',
    deps: ['LVL8'], x: 8, y: -2,
    desc: [
      'The seventh station orbits Mercury, close enough to the Sun that the heat tells the first mirror what it will be.',
    ],
    tasks: [dim('gcyr:mercury_orbit')],
    rewards: [xp(120)],
  },
  {
    key: 'M_SUN', kind: 'reading', title: 'Under Six Suns', icon: 'minecraft:sunflower',
    deps: ['STN7'], x: 10, y: -2,
    desc: [
      'Mercury gets several times the sunlight Earth does. The surface is vacuum and the day side is a furnace, so the machines there run only in daylight.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'M_MASS', kind: 'reading', title: 'Where the Mirrors Come From', icon: 'grindless:swarm_segment',
    deps: ['M_SUN'], x: 12, y: -2,
    desc: [
      'A swarm needs aluminium, magnesium and silicon. Mercury\'s surface has all three and almost no gravity to climb out of. The segments are built in orbit, where the light is strongest.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },

  // ------------------------------------------------------------------ Proxima b
  {
    key: 'STN8', kind: 'step', title: 'Eighth Station', icon: 'gtceu:uhv_machine_hull',
    deps: ['STEP'], x: 12, y: 0,
    desc: [
      'The gate lands you in orbit round Proxima b. Build the eighth station here and the rest of the system opens up.',
    ],
    tasks: [dim('grindless:proxima_b_orbit')],
    rewards: [xp(150)],
  },
  {
    key: 'LAND', kind: 'step', title: 'Landing on Proxima b', icon: 'grindless:proxima_base_casing',
    deps: ['STN8'], x: 14, y: 0,
    desc: [
      'The planet is tidally locked: one face in endless red light, one in endless night. Set the base down on the lit side with the &6Proxima Base Casing&r.',
    ],
    tasks: [dim('gcyr:proxima_centauri_b'), it('grindless:proxima_base_casing')],
    rewards: [xp(150)],
  },
  {
    key: 'P_FLARE', kind: 'reading', title: 'Flares', icon: 'grindless:proxima_base_casing',
    deps: ['LAND'], x: 16, y: 2,
    desc: [
      'Proxima throws UV-class flares several times a day. The base needs shielding, and the black fungi that eat radiation grow well here.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'P_SURFACE', kind: 'reading', title: 'Six Machines on the Ground', icon: 'gtceu:xenoflora_rover_bay',
    deps: ['LAND'], x: 16, y: -2,
    desc: [
      'A rover, a drill, a greenhouse, a vat and a heap do the work down here. Life from this planet only enters Earth through the sample receiving facility.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'BASE', kind: 'step', title: 'Four Light Years of Baseline', icon: 'grindless:stellar_neighbourhood_chart',
    deps: ['LAND'], x: 16, y: 0,
    desc: [
      'Measure a star from two places and its distance falls out. The astrometer in Proxima b orbit has four light years of baseline to the telescopes at home, and it charts the neighbourhood.',
    ],
    tasks: [it('grindless:stellar_neighbourhood_chart')],
    rewards: [xp(200)],
  },

  // ------------------------------------------------------------------ exit
  {
    key: 'GATE', kind: 'exit', title: 'Gate to UEV', icon: 'gtceu:uev_machine_casing',
    deps: ['BASE'], x: 18, y: 0,
    desc: [
      'The &6Stellar Neighbourhood Chart&r is the research for the UEV machine casing, and the hull comes with it. Keep the gate and the swarm running: UEV asks for both.',
    ],
    tasks: [it('gtceu:uev_machine_casing'), it('grindless:stellar_neighbourhood_chart'), it('grindless:coronal_field_map')],
    rewards: [xp(300)],
  },
];
