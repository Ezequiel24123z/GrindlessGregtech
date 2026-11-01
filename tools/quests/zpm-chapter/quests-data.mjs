// Quest data for zpm_age ("ZPM: The Ringed and Ice Giants"), the journey and capstone chapter; tools/quests/gen-chapters.mjs writes it
// (docs/reforge/05_quest_design.md, sections 2 and 4; docs/eras/zpm.md, "Quests", "Gate to UV"). Machine and circuit quests live in
// zpm_machines and zpm_circuits, power and the older machines' modes in zpm_integration. START, LVL5, STN3, LVL6, STN4 and GATE keep their
// keys: the other ZPM chapters link to them. Ids come from the keys.
// Positions: columns every 2, rows every 1.5. The spine (y = 0) is the trip: home, Saturn, Uranus, Neptune's flyby, the Kuiper chart and the
// gate. Saturn's products run above it, Uranus's above and below.
// Every ZPM package has landed, so there is no package gating here.
const it = (item, count) => ({ type: 'item', item, count });
const dim = (dimension) => ({ type: 'dimension', dimension });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  era: 'zpm',
  role: 'age',
  order: 0,
  icon: 'grindless:saturn_transfer_chart',
  autofocus: 'START',
  title: 'ZPM: The Ringed and Ice Giants',
  subtitle: ['A third and fourth station in orbit, then Saturn, its rings and the ice giants, and a chart to the Kuiper Belt.'],
};

export const LINKS = [];

export const QUESTS = [
  // ------------------------------------------------------------------ home and the way out
  {
    key: 'START', kind: 'start', title: 'Saturn and Beyond', icon: 'grindless:saturn_transfer_chart', shape: 'rsquare', size: 1.5,
    deps: ['X:1753F1FE9C989F6C'], x: 0, y: 0,
    desc: [
      'The &6Saturn Transfer Chart&r from the Jovian flyby points at rings, a hazy moon and two ice giants. Nothing out there is walkable, so the trip starts in orbit and stays there.',
      'The other ZPM chapters hold the machines, the circuits and the power. This one keeps the trip.',
    ],
    tasks: [ck()],
    rewards: [xp(50)],
  },
  {
    key: 'J_SUN', kind: 'reading', title: 'Thin Sunlight', icon: 'gtceu:zpm_wireless_energy_hatch', size: 0.75,
    deps: ['START'], x: 2, y: 0,
    desc: [
      "Out at Saturn the Sun gives about a hundredth and a half of what home gets, and at Uranus far less. Solar panels there are a joke nobody laughs at.",
      'So both stations run on the wireless network. Get the ZPM tier of it built before you leave.',
    ],
    tasks: [ck()],
    rewards: [xp(30)],
  },
  {
    key: 'LVL5', kind: 'step', title: 'Level Five', icon: 'grindless:naquadah_fuel_tank',
    deps: ['J_SUN'], x: 4, y: 0,
    desc: [
      'A &6Naquadah Fuel Tank&r and a &6Saturnian Quantum Seed&r are what the rocket to Saturn needs.',
    ],
    tasks: [it('grindless:naquadah_fuel_tank'), it('grindless:saturnian_quantum_seed')],
    rewards: [xp(100)],
  },
  {
    key: 'STN3', kind: 'milestone', title: 'Third Station', icon: 'grindless:station_truss_casing', shape: 'rsquare', size: 1.25,
    deps: ['LVL5'], x: 6, y: 0,
    desc: [
      'Saturn orbit: no ground, no air, a very long way from the Sun. Chunk-load the station, or its machines stop the moment you leave.',
    ],
    tasks: [dim('grindless:saturn_orbit')],
    rewards: [xp(120)],
  },
  {
    key: 'J_LOAD', kind: 'side', title: 'Keep the Lights On', icon: 'grindless:station_truss_casing', size: 0.75, optional: true,
    deps: ['STN3'], x: 6, y: 1.5,
    desc: [
      "A station only works while its chunks are loaded. Claim and force-load them before you head home, and the far machines keep humming while you're away.",
    ],
    tasks: [ck()],
    rewards: [xp(40)],
  },

  // ------------------------------------------------------------------ Saturn
  {
    key: 'J_ENC', kind: 'reading', title: 'The Salty Moon', icon: 'gtceu:plume_sampler', size: 0.75,
    deps: ['STN3'], x: 8, y: -3,
    desc: [
      'Enceladus vents salt water into space, and a probe can fly straight through it. The brine feeds your living chemistry back home and starts the aerogel cartridge.',
    ],
    tasks: [ck()],
    rewards: [xp(40)],
  },
  {
    key: 'J_RICE', kind: 'step', title: 'Ring Ice', icon: 'grindless:ring_ice_sample',
    deps: ['STN3'], x: 8, y: -1.5,
    desc: [
      'Nobody mines a ring by hand. A net sweeps through it and brings back a &6Ring Ice Sample&r, and the samples are the start of everything the rings teach you.',
    ],
    tasks: [it('grindless:ring_ice_sample')],
    rewards: [xp(100)],
  },
  {
    key: 'J_TIT', kind: 'step', title: "Titan's Haze", icon: 'grindless:titan_probe_recording',
    deps: ['J_RICE'], x: 10, y: -1.5,
    desc: [
      "A heat-shielded probe falls through Titan's orange haze and radios back what it passes. The &6Titan Probe Recording&r is the proof it made it.",
    ],
    tasks: [it('grindless:titan_probe_recording')],
    rewards: [xp(100)],
  },
  {
    key: 'J_THOL', kind: 'step', title: 'Tholins', icon: 'grindless:tholin',
    deps: ['J_TIT'], x: 12, y: -1.5,
    desc: [
      "Titan's haze is organic: &6Tholin&r, a tarry mix of nitriles that the chemistry back home can use.",
    ],
    tasks: [it('grindless:tholin')],
    rewards: [xp(100)],
  },
  {
    key: 'J_HAZE', kind: 'reading', title: 'Organics Everywhere', icon: 'grindless:tholin', size: 0.75,
    deps: ['J_THOL'], x: 14, y: -1.5,
    desc: [
      "Tholin turns up in carbon fibre, in bacteria food and in a few things you haven't met yet. A tank or two in ME is cheap insurance.",
    ],
    tasks: [ck()],
    rewards: [xp(40)],
  },
  {
    key: 'J_HE3', kind: 'step', title: "Saturn's Helium", icon: 'gtceu:helium_3_bucket',
    deps: ['STN3'], x: 8, y: 1.5,
    desc: [
      "Saturn's air splits into helium-3, deuterium and helium-4, and the helium-3 is the reason the trip is worth it. Bring a bucket of it home.",
    ],
    tasks: [it('gtceu:helium_3_bucket')],
    rewards: [xp(100)],
  },
  {
    key: 'J_CART', kind: 'step', title: 'Aerogel, Flown', icon: 'grindless:aerogel_cartridge',
    deps: ['STN3'], x: 8, y: 0,
    desc: [
      'A &6Aerogel Cartridge&r is the brine, flown home and set into silica. It is half of what the next fuel tank is built round.',
    ],
    tasks: [it('grindless:aerogel_cartridge')],
    rewards: [xp(100)],
  },
  {
    key: 'J_SIM', kind: 'step', title: 'Ring Song', icon: 'grindless:saturn_interior_model',
    deps: ['J_CART'], x: 10, y: 0,
    desc: [
      'The rings ring like a bell when something hits them. Listen long enough and you get a &6Saturn Interior Model&r, and from it a &6Uranus Transfer Chart&r.',
    ],
    tasks: [it('grindless:saturn_interior_model'), it('grindless:uranus_transfer_chart')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ Uranus
  {
    key: 'LVL6', kind: 'step', title: 'Level Six', icon: 'grindless:aerogel_fuel_tank',
    deps: ['J_SIM'], x: 12, y: 0,
    desc: [
      'The next tank is built round aerogel, and the &6Uranian Quantum Seed&r comes from the new chart. Bring plenty of fuel: nothing out there refuels you.',
    ],
    tasks: [it('grindless:aerogel_fuel_tank'), it('grindless:uranian_quantum_seed')],
    rewards: [xp(120)],
  },
  {
    key: 'STN4', kind: 'milestone', title: 'Fourth Station', icon: 'grindless:station_truss_casing', shape: 'rsquare', size: 1.25,
    deps: ['LVL6'], x: 14, y: 0,
    desc: [
      'Uranus orbit, tipped on its side and colder than Saturn. Same station, but anything dipping into the air needs a stronger hull.',
    ],
    tasks: [dim('grindless:uranus_orbit')],
    rewards: [xp(120)],
  },
  {
    key: 'J_URA', kind: 'reading', title: 'Tipped Over', icon: 'grindless:uranian_quantum_seed', size: 0.75,
    deps: ['STN4'], x: 14, y: 1.5,
    desc: [
      "Uranus rolls round the Sun on its side, so a day there lasts decades. The station doesn't care, but the chart did, which is why it took a seed of its own.",
    ],
    tasks: [ck()],
    rewards: [xp(40)],
  },
  {
    key: 'J_ICE', kind: 'step', title: 'Deep Gas', icon: 'grindless:ice_giant_atmosphere_sample',
    deps: ['STN4'], x: 16, y: 0,
    desc: [
      'Under a hull rated for it, a siphon reaches far deeper than the one at Saturn. What it brings up includes an &6Ice Giant Atmosphere Sample&r.',
    ],
    tasks: [it('grindless:ice_giant_atmosphere_sample')],
    rewards: [xp(120)],
  },
  {
    key: 'J_DIA', kind: 'step', title: 'Diamond Rain', icon: 'grindless:ice_giant_diamond_seed',
    deps: ['STN4'], x: 16, y: -1.5,
    desc: [
      'Deep in the ice giants carbon is squeezed into diamond. A seed grown from that slurry makes a better qubit plate than anything you can cut.',
    ],
    tasks: [it('grindless:ice_giant_diamond_seed')],
    rewards: [xp(120)],
  },
  {
    key: 'J_TRI', kind: 'reading', title: 'Where the Carbon Goes', icon: 'grindless:cvd_diamond_plate', size: 0.75,
    deps: ['J_DIA'], x: 18, y: -1.5,
    desc: [
      'The seed sits at the head of the qubit line: diamond plate, implanted wafer, cold fab. The circuits chapter walks you through it.',
    ],
    tasks: [ck()],
    rewards: [xp(40)],
  },
  {
    key: 'J_NEP', kind: 'step', title: 'Past Neptune', icon: 'grindless:neptune_flyby_probe',
    deps: ['J_ICE'], x: 18, y: 0,
    desc: [
      "A flyby probe passes Neptune and Triton and doesn't stop. It reports back late, and what it reports is the last step to the next chart.",
    ],
    tasks: [it('grindless:neptune_flyby_probe')],
    rewards: [xp(120)],
  },
  {
    key: 'J_NREC', kind: 'step', title: 'The Recording', icon: 'grindless:neptune_probe_recording',
    deps: ['J_NEP'], x: 20, y: 0,
    desc: [
      'Years of silence, then a &6Neptune Probe Recording&r arrives. Keep it safe: you only get the one pass.',
    ],
    tasks: [it('grindless:neptune_probe_recording')],
    rewards: [xp(100)],
  },
  {
    key: 'J_CAT', kind: 'step', title: 'Many Messengers', icon: 'grindless:multimessenger_catalogue',
    deps: ['J_NREC'], x: 20, y: 1.5,
    desc: [
      'Light, neutrinos and ripples in space all tell different parts of the same story. A &6Multimessenger Catalogue&r puts them side by side.',
    ],
    tasks: [it('grindless:multimessenger_catalogue')],
    rewards: [xp(120)],
  },

  // ------------------------------------------------------------------ the Kuiper chart and the gate
  {
    key: 'J_FLY', kind: 'step', title: 'Flyby Data', icon: 'grindless:neptune_flyby_data',
    deps: ['J_NREC'], x: 22, y: 0,
    desc: [
      'The listening post decodes the recording into &6Neptune Flyby Data&r. This is the last thing the Kuiper chart is waiting for.',
    ],
    tasks: [it('grindless:neptune_flyby_data')],
    rewards: [xp(120)],
  },
  {
    key: 'J_KUI', kind: 'step', title: 'Kuiper Targets', icon: 'grindless:kuiper_target_list',
    deps: ['J_FLY'], x: 24, y: 0,
    desc: [
      'The survey picks out the small icy worlds past Neptune and writes them into a &6Kuiper Target List&r.',
    ],
    tasks: [it('grindless:kuiper_target_list')],
    rewards: [xp(120)],
  },
  {
    key: 'J_SOL', kind: 'step', title: 'The Sun From Inside', icon: 'grindless:solar_core_survey',
    deps: ['J_KUI'], x: 26, y: 1.5,
    desc: [
      "A tank of heavy water catches the odd neutrino from the Sun's core. Enough flashes make a &6Solar Core Survey&r, and the gate asks for it.",
    ],
    tasks: [it('grindless:solar_core_survey')],
    rewards: [xp(100)],
  },
  {
    key: 'J_PLU', kind: 'milestone', title: 'The Pluto Chart', icon: 'grindless:pluto_kuiper_chart', shape: 'rsquare', size: 1.25,
    deps: ['J_KUI'], x: 26, y: 0,
    desc: [
      'The &6Pluto-Kuiper Chart&r is where the next era sets off from. Nothing in ZPM goes that far, and that is by design.',
    ],
    tasks: [it('grindless:pluto_kuiper_chart')],
    rewards: [xp(150)],
  },
  {
    key: 'J_RESERVE', kind: 'reading', title: 'What UV Keeps', icon: 'gtceu:uv_machine_hull', size: 0.75,
    deps: ['J_PLU'], x: 26, y: -1.5,
    desc: [
      'The Mk3, a fifth station and the first interstellar probe all wait for UV. ZPM only leaves you the flyby data, the chart and a lot of americium.',
    ],
    tasks: [ck()],
    rewards: [xp(40)],
  },
  {
    key: 'GATE', kind: 'exit', title: 'Gate to UV', icon: 'gtceu:uv_machine_hull', shape: 'diamond', size: 1.75,
    deps: ['J_PLU', 'J_SOL'], x: 28, y: 0,
    desc: [
      'Tritanium and darmstadtium make the &6UV Machine Hull&r, and the UV energy hatch needs everything you learned out here. Bring the Pluto chart and the Solar Core Survey along.',
    ],
    tasks: [
      it('gtceu:uv_machine_hull'), it('gtceu:uv_energy_input_hatch'),
      it('grindless:pluto_kuiper_chart'), it('grindless:solar_core_survey'),
    ],
    rewards: [xp(300)],
  },
];
