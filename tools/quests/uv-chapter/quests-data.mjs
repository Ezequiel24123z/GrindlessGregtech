// Quest data for uv_age ("UV: Pluto and the Edge"), the journey: Neptune, Pluto, the heliopause and a sail to the next star
// (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/uv.md, "Route" and "Quests"). Ids come from the keys.
// The plants and circuits are taught in uv_machines and uv_circuits (RF-5Q-UVb) and the fuel chains and older machines in
// uv_integration, so this chapter keeps only arrival, samples, readings and the exit. START, STN5 and STN6 are linked from the others.
// Positions: columns every 2, rows every 1.5. Home on the left, Neptune and Pluto in the middle, the Starshot and the gate on the right.
const it = (item, count) => ({ type: 'item', item, count });
const dim = (dimension) => ({ type: 'dimension', dimension });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.quests,
  era: 'uv',
  role: 'age',
  order: 0,
  icon: 'grindless:pluto_kuiper_chart',
  autofocus: 'START',
  title: 'UV: Pluto and the Edge',
  subtitle: ['Neptune, Pluto, the heliopause and a sail to the next star. The plants and circuits that get you there are here too.'],
};

export const LINKS = [];

export const QUESTS = [
  // ------------------------------------------------------------------ home
  {
    key: 'START', kind: 'start', title: 'Pluto and Beyond', icon: 'grindless:pluto_kuiper_chart', shape: 'rsquare', size: 1.5,
    deps: ['X:78B5C3A48F753C53'], x: 0, y: 0,
    desc: [
      'The &6Pluto-Kuiper Chart&r points past Neptune, and the &6Multimessenger Catalogue&r points at the middle of the galaxy. UV goes after both.',
      'Home first: the machines and circuits build the plants, and this branch records where they take you.',
    ],
    tasks: [it('grindless:pluto_kuiper_chart'), it('grindless:multimessenger_catalogue')],
    rewards: [xp(50)],
  },
  {
    key: 'J_HOME', kind: 'reading', title: 'The Long Dark', icon: 'grindless:pluto_kuiper_chart', size: 0.75,
    deps: ['START'], x: 2, y: 0,
    desc: [
      'Past Neptune the sun is a bright star: solar and sky mirrors give almost nothing. Everything out there runs on power made at home, so build the UV network before the first launch.',
    ],
    tasks: [ck()],
    rewards: [xp(20)],
  },
  {
    key: 'CRYO', kind: 'step', title: 'Cryomodule', icon: 'grindless:srf_cryomodule',
    deps: ['START'], x: 2, y: -1.5,
    desc: [
      "Cavities, a superfluid bath and a magnetic shield make one &6SRF Cryomodule&r. Placed as blocks, they're the linac inside every accelerator that follows.",
    ],
    tasks: [it('grindless:srf_cryomodule')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ Neptune
  {
    key: 'STN5', kind: 'milestone', title: 'Fifth Station', icon: 'grindless:station_truss_casing', shape: 'rsquare', size: 1.25,
    deps: ['J_HOME'], x: 4, y: 0,
    desc: [
      'Neptune orbit, on the same aerogel tank that took you to Uranus. Chunk-load the station; the winds below are the fastest anywhere in the Solar System.',
    ],
    tasks: [dim('grindless:neptune_orbit')],
    rewards: [xp(120)],
  },
  {
    key: 'J_NWIND', kind: 'reading', title: 'Winds of Neptune', icon: 'grindless:station_truss_casing', size: 0.75, optional: true,
    deps: ['STN5'], x: 6, y: 1.5,
    desc: [
      'Neptune has the fastest winds in the Solar System, past 2000 kilometres an hour. They make the scoop below hard to hold: the deep siphon fires in bursts.',
    ],
    tasks: [ck()],
    rewards: [xp(20)],
  },
  {
    key: 'J_DEEP', kind: 'step', title: 'Neptunian Seed', icon: 'grindless:neptunian_quantum_seed',
    deps: ['STN5'], x: 6, y: 0,
    desc: [
      'The deep siphon scoops hydrogen rich in deuterium, and helium with a trace of helium-3. That helium also grows the &6Neptunian Quantum Seed&r, so pipes reach home.',
    ],
    tasks: [it('grindless:neptunian_quantum_seed')],
    rewards: [xp(100)],
  },
  {
    key: 'J_TRIT', kind: 'step', title: 'Triton', icon: 'grindless:triton_ice_core',
    deps: ['STN5'], x: 6, y: -1.5,
    desc: [
      "A geyser sampler on Triton brings up a &6Triton Ice Core&r: frozen nitrogen with methane and carbon monoxide. It's where the nitrogen-15 comes from.",
    ],
    tasks: [it('grindless:triton_ice_core')],
    rewards: [xp(100)],
  },
  {
    key: 'LEAK', kind: 'reading', title: 'Superleak', icon: 'gtceu:superfluid_helium_plant', size: 0.75,
    deps: ['J_DEEP'], x: 8, y: 1.5,
    desc: [
      'Only helium-4 slips through a superleak. Run Neptune helium through the superfluid plant and the helium-3 stays behind as a concentrate for the isotope column.',
    ],
    tasks: [ck()],
    rewards: [xp(40)],
  },

  // ------------------------------------------------------------------ the way out
  {
    key: 'LVL7', kind: 'step', title: 'Level Seven', icon: 'grindless:bnnt_fuel_tank',
    deps: ['J_DEEP', 'J_TRIT'], x: 8, y: 0,
    desc: [
      "Put the BNNT tank in the rocket and Pluto is in reach. Bring plenty of fuel: there's nothing out there to refuel you.",
    ],
    tasks: [it('grindless:bnnt_fuel_tank')],
    rewards: [xp(120)],
  },
  {
    key: 'J_FUELR', kind: 'reading', title: 'One Way Fuel', icon: 'grindless:bnnt_fuel_tank', size: 0.75,
    deps: ['LVL7'], x: 10, y: 1.5,
    desc: [
      'Pluto is about thirty times further than the Earth from the Sun. Plan the trip as a round one: fuel for the way back goes in the tank before you leave.',
    ],
    tasks: [ck()],
    rewards: [xp(20)],
  },

  // ------------------------------------------------------------------ Pluto
  {
    key: 'STN6', kind: 'milestone', title: 'Sixth Station', icon: 'grindless:station_truss_casing', shape: 'rsquare', size: 1.25,
    deps: ['LVL7'], x: 10, y: 0,
    desc: [
      'Pluto orbit, as far out as the stations go. Sunlight takes hours to get here; chunk-load the station and keep spares, because nothing out here is quick to replace.',
    ],
    tasks: [dim('grindless:pluto_orbit')],
    rewards: [xp(150)],
  },
  {
    key: 'J_PLUTO', kind: 'reading', title: 'The Heart of Pluto', icon: 'grindless:sputnik_ice_core', size: 0.75,
    deps: ['STN6'], x: 12, y: 1.5,
    desc: [
      "Sputnik Planitia is a plain of nitrogen ice that flows like a slow glacier. It's the softest place to land a probe, and the first sample comes from there. The Penetrator Probe Bay drops the probe, and the Volatile Ice Fractionator then splits each core into its gases (both in the Machines chapter).",
    ],
    tasks: [ck()],
    rewards: [xp(20)],
  },
  {
    key: 'J_SPUT', kind: 'step', title: 'Sputnik Core', icon: 'grindless:sputnik_ice_core',
    deps: ['STN6'], x: 12, y: 0,
    desc: [
      'A penetrator probe melts into the nitrogen glacier and sends a core up. The &6Sputnik Ice Core&r grows the &6Plutonian Quantum Seed&r, the last pipe home.',
    ],
    tasks: [it('grindless:sputnik_ice_core'), it('grindless:plutonian_quantum_seed')],
    rewards: [xp(120)],
  },
  {
    key: 'CHARON', kind: 'step', title: 'Charon', icon: 'grindless:charon_core',
    deps: ['J_SPUT'], x: 14, y: 1.5,
    desc: [
      "Aim the penetrator at Charon instead and it brings back the moon's crust: water ice laced with ammonia, and grit underneath.",
    ],
    tasks: [it('grindless:charon_core')],
    rewards: [xp(100)],
  },
  {
    key: 'J_ICEW', kind: 'reading', title: 'Ice by Ice', icon: 'grindless:sputnik_ice_core', size: 0.75,
    deps: ['J_SPUT'], x: 14, y: 0,
    desc: [
      'Every ice boils off at its own temperature. Warmed step by step, one core gives nitrogen, carbon monoxide, methane, water and ammonia apart, and each has a home in your chemistry.',
    ],
    tasks: [ck()],
    rewards: [xp(30)],
  },
  {
    key: 'J_PLAN', kind: 'step', title: 'Planetesimal', icon: 'grindless:planetesimal_sample',
    deps: ['J_ICEW'], x: 16, y: 0,
    desc: [
      'The Kuiper Belt is leftover from the Solar System\'s birth. An interceptor sent into it brings back a &6Planetesimal Sample&r, a stone that never melted.',
    ],
    tasks: [it('grindless:planetesimal_sample')],
    rewards: [xp(120)],
  },
  {
    key: 'J_NOBLE', kind: 'reading', title: 'Noble Gas', icon: 'gtceu:krypton_bucket', size: 0.75,
    deps: ['J_PLAN'], x: 18, y: 1.5,
    desc: [
      'Krypton and xenon are what an ion thruster burns. Kuiper gas gives both once the cryogenic plant sorts it: there is no other source out here.',
    ],
    tasks: [ck()],
    rewards: [xp(20)],
  },
  {
    key: 'J_KRYP', kind: 'step', title: 'Thruster Gas', icon: 'gtceu:xenon_bucket',
    deps: ['J_NOBLE'], x: 20, y: 1.5,
    desc: [
      'Stock krypton and xenon in tanks before you build the thrusters. Both are produced a drop at a time, so a full tank is what matters, not the rate.',
    ],
    tasks: [it('gtceu:krypton_bucket'), it('gtceu:xenon_bucket')],
    rewards: [xp(60)],
  },
  {
    key: 'J_POD', kind: 'step', title: 'Thruster Pod', icon: 'grindless:thruster_pod',
    deps: ['J_PLAN'], x: 18, y: 0,
    desc: [
      'An ion thruster, a krypton tank and an aeroshell make a &6Thruster Pod&r. A probe with one can reach the edge of the Solar System in a few game days.',
    ],
    tasks: [it('grindless:thruster_pod')],
    rewards: [xp(120)],
  },
  {
    key: 'J_HELIO', kind: 'step', title: 'The Heliopause', icon: 'grindless:heliopause_data',
    deps: ['J_POD'], x: 20, y: 0,
    desc: [
      'A precursor probe crosses the heliopause, where the solar wind gives way to interstellar space. Its &6Heliopause Data&r sets the course for the sail.',
    ],
    tasks: [it('grindless:heliopause_data')],
    rewards: [xp(150)],
  },
  {
    key: 'J_SGR', kind: 'milestone', title: 'Shadow of the Hole', icon: 'grindless:sgr_a_star_image', size: 1.25,
    deps: ['J_CRAFT'], x: 27, y: -1.5,
    desc: [
      'An interferometer the size of a planet is out of reach, so this one is an extrapolation: the &6Sgr A* Image&r is pieced together from many telescopes. It opens the UHV hatch.',
    ],
    tasks: [it('grindless:sgr_a_star_image')],
    rewards: [xp(200)],
  },

  // ------------------------------------------------------------------ Starshot
  {
    key: 'J_SAILQ', kind: 'step', title: 'The Sail', icon: 'grindless:light_sail',
    deps: ['J_HELIO'], x: 22, y: 0,
    desc: [
      'A &6Light Sail&r is a film a few atoms thick and as wide as a stadium. It weighs almost nothing and takes a lot to make.',
    ],
    tasks: [it('grindless:light_sail')],
    rewards: [xp(120)],
  },
  {
    key: 'J_CRAFT', kind: 'step', title: 'Sailcraft', icon: 'grindless:sailcraft',
    deps: ['J_SAILQ'], x: 24, y: 0,
    desc: [
      'The sail carries a chip a few grams in weight: sensors, a small laser and a radio. Fit it in the sail and the &6Sailcraft&r is ready for the launcher.',
    ],
    tasks: [it('grindless:sailcraft')],
    rewards: [xp(120)],
  },
  {
    key: 'J_LAUNCH', kind: 'step', title: 'Starshot', icon: 'grindless:starshot_probe',
    deps: ['J_CRAFT'], x: 26, y: 0,
    desc: [
      'On the Moon, a whole array of fibre lasers points at one sail and pushes. The Laser Sail Launcher fires the sailcraft from the Starchip Fab (Machines chapter). The heliopause data sets the course and is kept, and every launch wears the modules: keep the refurbishing going.',
    ],
    tasks: [it('grindless:starshot_probe')],
    rewards: [xp(200)],
  },
  {
    key: 'J_PROX', kind: 'milestone', title: 'Light from Proxima', icon: 'grindless:proxima_approach_data', size: 1.25,
    deps: ['J_LAUNCH'], x: 28, y: 0,
    desc: [
      'Years later in the pack\'s time, the probe passes Proxima Centauri and a ground station catches its signal. The &6Proxima Approach Data&r is the first look at the next star.',
    ],
    tasks: [it('grindless:proxima_approach_data')],
    rewards: [xp(250)],
  },
  {
    key: 'J_NEXT', kind: 'reading', title: 'What Comes Next', icon: 'grindless:proxima_approach_data', size: 0.75,
    deps: ['J_PROX'], x: 30, y: 1.5,
    desc: [
      'UHV is a hatch and a hull away. Proxima b waits beyond it: a rocky planet in the habitable zone, and the next dimension.',
    ],
    tasks: [ck()],
    rewards: [xp(20)],
  },

  // ------------------------------------------------------------------ exit
  {
    key: 'GATE', kind: 'exit', title: 'Gate to UHV', icon: 'gtceu:uhv_machine_hull', shape: 'diamond', size: 1.75,
    deps: ['J_PROX', 'J_SGR'], x: 30, y: 0,
    desc: [
      'The &6UHV Energy Hatch&r is researched from the Sgr A* image, and the hull comes with it. Bring the Proxima data along, and keep heavy curium and uranium-233 in store.',
    ],
    tasks: [
      it('gtceu:uhv_machine_hull'), it('gtceu:uhv_energy_input_hatch'),
      it('grindless:sgr_a_star_image'), it('grindless:proxima_approach_data'),
      it('grindless:heavy_curium_oxide'), it('gtceu:uranium_233_ingot'),
    ],
    rewards: [xp(300)],
  },
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
