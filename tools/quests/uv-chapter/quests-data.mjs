// Quest data for uv_age ("UV: Pluto and the Edge"); gen.mjs in this folder writes the chapter (docs/quests.md, sections 8 and 14;
// docs/eras/uv.md, "Quests"). Ids come from the keys: never rename a key once a quest has shipped.
// Positions: columns every 2. The left half is home, in lanes off START as in ZPM: life into the Mk3 and the network on the spine
// (y = 0), the cold and the accelerators above it, the detectors on top, the lasers and their fuel below it, the superconductor wire at
// the bottom. The right half leaves home from the network: Neptune and Pluto on the upper rows, the materials and the Starshot below
// them, and the gate closes the chapter with the Proxima data and the Sgr A* image.
// Every UV package has landed, so there is no package gating here.
const it = (item, count) => ({ type: 'item', item, count });
const dim = (dimension) => ({ type: 'dimension', dimension });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  group: '3F021F40CD26BF57',
  order: 8,
  icon: 'grindless:pluto_kuiper_chart',
  autofocus: 'START',
  title: 'UV: Pluto and the Edge',
  subtitle: ['A third fusion ring, thorium and a lot of cold at home, then Neptune, Pluto, the heliopause and a sail to the next star.'],
};

export const QUESTS = [
  // ------------------------------------------------------------------ home: life, the Mk3 and the network
  {
    key: 'START', title: 'Pluto and Beyond', icon: 'grindless:pluto_kuiper_chart', shape: 'rsquare', size: 1.5,
    deps: ['X:78B5C3A48F753C53'], x: 0, y: 0,
    desc: [
      'The &6Pluto-Kuiper Chart&r points past Neptune, and the &6Multimessenger Catalogue&r points at the middle of the galaxy. UV goes after both.',
      'Home first: a bigger fusion ring, thorium, and more cold than anything so far.',
    ],
    tasks: [it('grindless:pluto_kuiper_chart'), it('grindless:multimessenger_catalogue')],
    rewards: [xp(50)],
  },
  {
    key: 'ARK', title: 'The Ark', icon: 'gtceu:ark_biosphere', shape: 'gear', size: 1.25,
    deps: ['START'], x: 2, y: 0,
    desc: [
      'The &6Ark Biosphere&r is a sealed little world: algae fix the air, archaea eat what dies, and a growth medium comes out the other side. Grown neurons need that medium.',
    ],
    tasks: [it('gtceu:ark_biosphere')],
    rewards: [xp(100)],
  },
  {
    key: 'NEURO', title: 'Grown Neurons', icon: 'gtceu:neural_culture_vat', shape: 'gear', size: 1.25,
    deps: ['ARK'], x: 4, y: 0,
    desc: [
      "The &6Neural Culture Vat&r grows stem cells on the ark's medium and wires them into processing units by the batch. Wetware mainframes are what the third ring's controller asks for.",
    ],
    tasks: [it('gtceu:neural_culture_vat'), it('gtceu:wetware_processor_mainframe')],
    rewards: [xp(120)],
  },
  {
    key: 'MK3', title: 'Third Ring', icon: 'gtceu:uv_fusion_reactor', shape: 'gear', size: 1.5,
    deps: ['NEURO'], x: 6, y: 0,
    desc: [
      "The &6Fusion Reactor Mk3&r is a bigger ring with a bigger appetite: it lights plasmas the Mk2 can't even start. Feed it through UV energy hatches, and plenty of them.",
    ],
    tasks: [it('gtceu:uv_fusion_reactor'), it('gtceu:uv_energy_input_hatch')],
    rewards: [xp(150)],
  },
  {
    key: 'AMLP', title: 'Americium Loop', icon: 'gtceu:americium_plasma_bucket',
    deps: ['MK3'], x: 8, y: 0,
    desc: [
      'Plutonium-241 and hydrogen fuse into &6Americium&r plasma. Run it through a plasma turbine for power on the way out, and the cooled metal goes on to neutronium.',
    ],
    tasks: [it('gtceu:plutonium_241_ingot'), it('gtceu:americium_plasma_bucket'), it('gtceu:americium_ingot')],
    rewards: [xp(100)],
  },
  {
    key: 'NEUT', title: 'Neutronium', icon: 'gtceu:neutronium_ingot',
    deps: ['AMLP'], x: 10, y: 0,
    desc: [
      "Americium and naquadria start the hottest burn the Mk3 runs, and &6Neutronium&r comes out. It's the densest metal you'll handle, and UV's parts are full of it.",
    ],
    tasks: [it('gtceu:neutronium_ingot')],
    rewards: [xp(120)],
  },
  {
    key: 'GRAVI', title: 'Gravi Star', icon: 'gtceu:gravi_star',
    deps: ['NEUT'], x: 12, y: 0,
    desc: [
      "A &6Gravi Star&r is a nether star wrapped in neutronium. It's the link the UV wireless network is built on.",
    ],
    tasks: [it('gtceu:gravi_star')],
    rewards: [xp(100)],
  },
  {
    key: 'NETUV', title: 'The Network Goes UV', icon: 'grindless:uv_smes_cell', shape: 'rsquare', size: 1.25,
    deps: ['GRAVI'], x: 14, y: 0,
    desc: [
      'Move your towers onto &6UV SMES Cells&r and the wireless network carries UV. The new hatches draw from it wherever the network reaches, out to the stations too.',
    ],
    tasks: [it('grindless:uv_smes_cell'), it('gtceu:uv_wireless_energy_hatch')],
    rewards: [xp(150)],
  },
  {
    key: 'PAR', title: 'Wider Still', icon: 'gtceu:uv_parallel_hatch', size: 0.75, optional: true,
    deps: ['NETUV'], x: 16, y: 1.5,
    desc: [
      'The &6UV Parallel Hatch&r runs more recipes side by side in the plants that take one. Optional, but your queues will thank you.',
    ],
    tasks: [it('gtceu:uv_parallel_hatch')],
    rewards: [xp(60)],
  },

  // ------------------------------------------------------------------ cold and accelerators
  {
    key: 'HE2', title: 'Below Lambda', icon: 'gtceu:superfluid_helium_plant', shape: 'gear', size: 1.25,
    deps: ['START'], x: 2, y: -2,
    desc: [
      'Cool liquid helium past the lambda point and it turns superfluid: no viscosity at all, and it creeps up the walls. The &6Superfluid Helium Plant&r makes it, and every accelerator here bathes in it.',
    ],
    tasks: [it('gtceu:superfluid_helium_plant')],
    rewards: [xp(100)],
  },
  {
    key: 'CAV', title: 'Cavities', icon: 'gtceu:srf_cavity_works', shape: 'gear', size: 1.25,
    deps: ['HE2'], x: 4, y: -2,
    desc: [
      'The &6SRF Cavity Works&r melts niobium very pure, forms it into cavities and polishes them in acid. The spent acid gives its niobium back, so nothing goes down the drain.',
    ],
    tasks: [it('gtceu:srf_cavity_works'), it('grindless:srf_cavity')],
    rewards: [xp(100)],
  },
  {
    key: 'CRYO', title: 'Cryomodule', icon: 'grindless:srf_cryomodule',
    deps: ['CAV'], x: 6, y: -2,
    desc: [
      "Cavities, a superfluid bath and a magnetic shield make one &6SRF Cryomodule&r. Placed as blocks, they're the linac inside every accelerator that follows.",
    ],
    tasks: [it('grindless:srf_cryomodule')],
    rewards: [xp(100)],
  },
  {
    key: 'ADR', title: 'Thorium at Last', icon: 'gtceu:accelerator_driven_reactor', shape: 'gear', size: 1.25,
    deps: ['CRYO'], x: 8, y: -2,
    desc: [
      "Thorium can't keep a chain reaction going by itself. The &6Accelerator-Driven Reactor&r fires a proton beam into a lead-bismuth pool and the spallation neutrons do the rest: switch the beam off and it stops.",
    ],
    tasks: [it('gtceu:accelerator_driven_reactor'), it('grindless:thorium_oxide_fuel_assembly')],
    rewards: [xp(150)],
  },
  {
    key: 'U233', title: 'Back to Uranium-233', icon: 'gtceu:pyroprocessing_cell', shape: 'gear', size: 1.25,
    deps: ['ADR'], x: 10, y: -2,
    desc: [
      'The &6Pyroprocessing Cell&r melts spent thorium fuel in salt and pulls the bred &6Uranium-233&r out. The thorium goes back in, the salt is cleaned for another run, and only the waste leaves.',
    ],
    tasks: [it('gtceu:pyroprocessing_cell'), it('gtceu:uranium_233_ingot'), it('grindless:u233_fuel_rod')],
    rewards: [xp(120)],
  },
  {
    key: 'MUCF', title: 'Cold Fusion That Works', icon: 'gtceu:muon_fusion_cell', shape: 'gear', size: 1.25,
    deps: ['CRYO'], x: 8, y: -3.5,
    desc: [
      'In the &6Muon Fusion Cell&r a muon stands in for the electron and pulls deuterium and tritium close enough to fuse, with a lithium blanket breeding the tritium back.',
      "Real muon-catalysed fusion never broke even: each muon is lost too soon. This machine is an extrapolation that assumes it does.",
    ],
    tasks: [it('gtceu:muon_fusion_cell'), it('grindless:lithium_breeder_blanket')],
    rewards: [xp(150)],
  },
  {
    key: 'SYNC', title: 'Synchrotron Light', icon: 'gtceu:synchrotron', shape: 'gear', size: 1.25,
    deps: ['CRYO'], x: 8, y: -5,
    desc: [
      'Bend a beam round a ring and it shines X-rays. The &6Synchrotron&r prints chip patterns through an X-ray mask far finer than any lens can, and turns them into &6Photonic Chips&r.',
    ],
    tasks: [it('gtceu:synchrotron'), it('grindless:photonic_chip')],
    rewards: [xp(120)],
  },
  {
    key: 'ANTI', title: 'Antimatter', icon: 'gtceu:antimatter_trap', shape: 'gear', size: 1.25,
    deps: ['SYNC'], x: 10, y: -5,
    desc: [
      'The synchrotron knocks antiprotons loose too. The &6Antimatter Trap&r holds them in a superfluid-cooled magnetic bottle, and a pinch sparked into a uranium pellet makes the &6ICAN Pellets&r a deep-space probe kicks with.',
    ],
    tasks: [it('gtceu:antimatter_trap'), it('grindless:antiproton_trap'), it('grindless:ican_pellet')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ detectors and probe heat
  {
    key: 'CURIUM', title: 'Curium Heat', icon: 'gtceu:heat_source_works', shape: 'gear', size: 1.25,
    deps: ['START'], x: 2, y: -4,
    desc: [
      'Past Pluto the Sun is too faint for panels. The &6Heat Source Works&r presses curium into pellets, clads them in iridium and carbon, and stacks them into &6Probe RTGs&r. The heavier curium it sorts out is kept, never voided.',
    ],
    tasks: [it('gtceu:heat_source_works'), it('grindless:gphs_module'), it('grindless:probe_rtg')],
    rewards: [xp(120)],
  },
  {
    key: 'HPGE', title: 'Thirteen Nines', icon: 'gtceu:zone_refining_tower', shape: 'gear', size: 1.25,
    deps: ['CURIUM'], x: 4, y: -4,
    desc: [
      "The &6Zone Refining Tower&r sweeps germanium's impurities to the ends of a bar, over and over, until the crystal is purer than almost anything else you make. Probes carry it as their eye.",
    ],
    tasks: [it('gtceu:zone_refining_tower'), it('grindless:hpge_crystal')],
    rewards: [xp(120)],
  },
  {
    key: 'SNSPD', title: 'Counting Photons', icon: 'grindless:snspd_array',
    deps: ['HPGE'], x: 6, y: -4,
    desc: [
      "A superconducting nanowire turns resistive the moment a single photon lands on it. The &6SNSPD Array&r is a grid of them on a niobium nitride film, and it's how the faintest signal gets read.",
    ],
    tasks: [it('grindless:snspd_array')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ lasers and their fuel
  {
    key: 'YBF', title: 'Ytterbium Fibre', icon: 'gtceu:fibre_draw_tower', shape: 'gear', size: 1.25,
    deps: ['START'], x: 2, y: 2,
    desc: [
      'The &6Fibre Draw Tower&r lays doped glass inside a tube, collapses it into a preform and pulls it into &6Ytterbium Fibre&r. Pumped hard, that fibre is a laser.',
    ],
    tasks: [it('gtceu:fibre_draw_tower'), it('grindless:ytterbium_fibre')],
    rewards: [xp(100)],
  },
  {
    key: 'PUMP', title: 'Pump Diodes', icon: 'gtceu:mocvd_reactor', shape: 'gear', size: 1.25,
    deps: ['YBF'], x: 4, y: 2,
    desc: [
      "The &6MOCVD Reactor&r grows indium gallium arsenide layer by layer for the &6Pump Modules&r. Fibre, pumps and a grating make a &6Fibre Laser Module&r. The reactor's spare arsine goes to the scrubber, never the air.",
    ],
    tasks: [it('gtceu:mocvd_reactor'), it('grindless:ingaas_pump_module'), it('grindless:fibre_laser_module')],
    rewards: [xp(120)],
  },
  {
    key: 'ALPHA', title: 'Three Alphas', icon: 'gtceu:laser_fusion_chamber', shape: 'gear', size: 1.5,
    deps: ['PUMP'], x: 6, y: 2,
    desc: [
      'Fire a ring of fibre lasers at a fuel capsule and a proton and boron-11 fuse into helium, with almost no neutrons. The &6Laser Fusion Chamber&r is the era\'s big power plant; its lasers wear, so keep spares.',
    ],
    tasks: [it('gtceu:laser_fusion_chamber')],
    rewards: [xp(150)],
  },
  {
    key: 'B11', title: 'Boron-11', icon: 'gtceu:boron_dust', size: 0.75,
    deps: ['ALPHA'], x: 8, y: 2,
    desc: [
      "The hot cell already splits boron's isotopes. React the &6Boron-11&r trifluoride with hydrogen into decaborane, and the fluorine leaves as acid the rest of your chemistry takes.",
    ],
    tasks: [ck()],
    rewards: [xp(40)],
  },
  {
    key: 'CAPS', title: 'Diamond Capsules', icon: 'grindless:pb11_capsule',
    deps: ['B11'], x: 10, y: 2,
    desc: [
      'The diamond lattice fab grows a &6Fuel Capsule&r round decaborane, or round deuterium and helium-3 for the other burn. Every shot spends one, so automate them early.',
    ],
    tasks: [it('grindless:pb11_capsule'), it('grindless:d_he3_capsule')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ the superconductor
  {
    key: 'PIT', title: 'Powder in Tube', icon: 'gtceu:powder_in_tube_line', shape: 'gear', size: 1.25,
    deps: ['START'], x: 2, y: 4,
    desc: [
      "UV's superconductor won't draw like a normal wire. The &6Powder-in-Tube Line&r packs its powder into silver tubes and draws the lot, and the silver comes back. It's the only place that wire is made now.",
    ],
    tasks: [it('gtceu:powder_in_tube_line'), it('gtceu:enriched_naquadah_trinium_europium_duranide_single_wire')],
    rewards: [xp(120)],
  },

  // ------------------------------------------------------------------ Neptune
  {
    key: 'STN5', title: 'Fifth Station', icon: 'grindless:station_truss_casing', shape: 'rsquare', size: 1.25,
    deps: ['NETUV'], x: 16, y: -3,
    desc: [
      'Neptune orbit, on the same aerogel tank that took you to Uranus. Chunk-load the station; the winds below are the fastest anywhere in the Solar System.',
    ],
    tasks: [dim('grindless:neptune_orbit')],
    rewards: [xp(120)],
  },
  {
    key: 'DEEPN', title: 'Deep Neptune', icon: 'gtceu:neptune_deep_siphon', shape: 'gear', size: 1.25,
    deps: ['STN5'], x: 18, y: -3,
    desc: [
      'The &6Neptune Deep Siphon&r drops a scoop through the methane deck for hydrogen rich in deuterium, and helium with a trace of helium-3. That helium also grows the &6Neptunian Quantum Seed&r, so pipes reach home.',
    ],
    tasks: [it('gtceu:neptune_deep_siphon'), it('grindless:neptunian_quantum_seed')],
    rewards: [xp(120)],
  },
  {
    key: 'TRITON', title: "Triton's Geysers", icon: 'gtceu:triton_geyser_sampler', shape: 'gear', size: 1.25,
    deps: ['STN5'], x: 18, y: -4.5,
    desc: [
      "Triton's geysers throw nitrogen and dark grit high above the ice. The &6Triton Geyser Sampler&r flies through them, and its &6Triton Ice Core&r is what the Pluto penetrator is tuned on.",
    ],
    tasks: [it('gtceu:triton_geyser_sampler'), it('grindless:triton_ice_core')],
    rewards: [xp(120)],
  },
  {
    key: 'LEAK', title: 'Superleak', icon: 'gtceu:superfluid_helium_plant', size: 0.75,
    deps: ['DEEPN'], x: 20, y: -4.5,
    desc: [
      'Only helium-4 slips through a superleak. Run Neptune helium through the superfluid plant and the helium-3 stays behind as a concentrate for the isotope column.',
    ],
    tasks: [ck()],
    rewards: [xp(40)],
  },
  {
    key: 'N15', title: 'Nitrogen-15', icon: 'grindless:thorium_nitride_fuel_assembly',
    deps: ['TRITON'], x: 20, y: -6,
    desc: [
      "Triton's nitrogen is rich in &6Nitrogen-15&r. Burn it to nitric oxide, let the cryogenic plant sort out the heavy kind and reduce it back. Thorium nitride made with it breeds better, and the pyroprocessing cell hands the nitrogen back.",
    ],
    tasks: [it('grindless:thorium_nitride_fuel_assembly')],
    rewards: [xp(120)],
  },

  // ------------------------------------------------------------------ materials
  {
    key: 'BNNT', title: 'Nanotubes of Boron', icon: 'gtceu:boron_nitride_reactor', shape: 'gear', size: 1.25,
    deps: ['NETUV'], x: 16, y: 0,
    desc: [
      "The &6Boron Nitride Reactor&r turns boron oxide into hexagonal boron nitride, then grows it into nanotubes in a plasma. Spun into &6BNNT Yarn&r, they're strong, light and shrug off heat.",
    ],
    tasks: [it('gtceu:boron_nitride_reactor'), it('grindless:bnnt_yarn')],
    rewards: [xp(120)],
  },
  {
    key: 'TANK', title: 'Wound Tank', icon: 'gtceu:cryotank_winder', shape: 'gear', size: 1.25,
    deps: ['BNNT'], x: 18, y: 0,
    desc: [
      'The &6Cryotank Winder&r wraps the aerogel tank in boron nitride and carbon nanotube yarn. The &6BNNT Fuel Tank&r it makes is the one that reaches Pluto.',
    ],
    tasks: [it('gtceu:cryotank_winder'), it('grindless:bnnt_fuel_tank')],
    rewards: [xp(120)],
  },
  {
    key: 'PRINT', title: 'Printed in Metal', icon: 'gtceu:powder_bed_printer', shape: 'gear', size: 1.25,
    deps: ['BNNT'], x: 20, y: 2.5,
    desc: [
      'The &6Powder Bed Printer&r atomises metal under argon and melts it layer by layer with a fibre laser. It prints what no mould can, like a thruster chamber with its cooling channels inside.',
    ],
    tasks: [it('gtceu:powder_bed_printer'), it('grindless:printed_thruster_chamber')],
    rewards: [xp(120)],
  },

  // ------------------------------------------------------------------ Pluto
  {
    key: 'LVL7', title: 'Level Seven', icon: 'grindless:bnnt_fuel_tank',
    deps: ['DEEPN', 'TANK'], x: 20, y: -3,
    desc: [
      "Put the BNNT tank in the rocket and Pluto is in reach. Bring plenty of fuel: there's nothing out there to refuel you.",
    ],
    tasks: [it('grindless:bnnt_fuel_tank')],
    rewards: [xp(120)],
  },
  {
    key: 'STN6', title: 'Sixth Station', icon: 'grindless:station_truss_casing', shape: 'rsquare', size: 1.25,
    deps: ['LVL7'], x: 22, y: -3,
    desc: [
      'Pluto orbit, as far out as the stations go. Sunlight takes hours to get here; chunk-load the station and keep spares, because nothing out here is quick to replace.',
    ],
    tasks: [dim('grindless:pluto_orbit')],
    rewards: [xp(150)],
  },
  {
    key: 'HEART', title: 'Into the Heart', icon: 'gtceu:penetrator_probe_bay', shape: 'gear', size: 1.25,
    deps: ['STN6'], x: 24, y: -3,
    desc: [
      "The &6Penetrator Probe Bay&r drops a probe that melts its way into Sputnik Planitia's nitrogen glacier and sends a core up. That &6Sputnik Ice Core&r grows the &6Plutonian Quantum Seed&r, the last pipe home.",
    ],
    tasks: [it('gtceu:penetrator_probe_bay'), it('grindless:penetrator_probe'), it('grindless:sputnik_ice_core'), it('grindless:plutonian_quantum_seed')],
    rewards: [xp(150)],
  },
  {
    key: 'CHARON', title: 'Charon', icon: 'grindless:charon_core',
    deps: ['HEART'], x: 26, y: -4.5,
    desc: [
      "Aim the penetrator at Charon instead and it brings back the moon's crust: water ice laced with ammonia, and grit underneath.",
    ],
    tasks: [it('grindless:charon_core')],
    rewards: [xp(100)],
  },
  {
    key: 'ICES', title: 'Ices Apart', icon: 'gtceu:volatile_ice_fractionator', shape: 'gear', size: 1.25,
    deps: ['HEART'], x: 26, y: -3,
    desc: [
      'Every ice boils off at its own temperature. The &6Volatile Ice Fractionator&r warms the cores step by step and collects nitrogen, carbon monoxide, methane, water and ammonia apart. Each one has a home in your chemistry.',
    ],
    tasks: [it('gtceu:volatile_ice_fractionator')],
    rewards: [xp(120)],
  },
  {
    key: 'KUIPER', title: "Arrokoth's Kin", icon: 'gtceu:kuiper_interceptor_bay', shape: 'gear', size: 1.25,
    deps: ['STN6'], x: 24, y: -1.5,
    desc: [
      "The chart lists small worlds that haven't changed since the planets formed. The &6Kuiper Interceptor Bay&r sends a craft to grab a &6Planetesimal Sample&r, and the canister comes back for the next one.",
    ],
    tasks: [it('gtceu:kuiper_interceptor_bay'), it('grindless:kuiper_interceptor'), it('grindless:planetesimal_sample')],
    rewards: [xp(150)],
  },
  {
    key: 'ANNEAL', title: 'Trapped Since the Beginning', icon: 'gtceu:amorphous_ice_annealer', shape: 'gear', size: 1.25,
    deps: ['KUIPER'], x: 26, y: -1.5,
    desc: [
      'Ice that formed that cold is amorphous, and it holds gas in its cage. Warm it slowly in the &6Amorphous Ice Annealer&r and it lets go of water, carbon monoxide and a noble gas mix the cryogenic plant splits into krypton and xenon.',
    ],
    tasks: [it('gtceu:amorphous_ice_annealer')],
    rewards: [xp(120)],
  },
  {
    key: 'KRYPTON', title: 'Krypton for Thrust', icon: 'gtceu:thruster_works', shape: 'gear', size: 1.25,
    deps: ['ANNEAL'], x: 28, y: -1.5,
    desc: [
      'The &6Thruster Works&r builds a gridded ion thruster on xenon and a Hall thruster on Kuiper krypton, then pairs them in a &6Thruster Pod&r. Electric thrust is gentle, but it never stops.',
    ],
    tasks: [it('gtceu:thruster_works'), it('grindless:ion_thruster'), it('grindless:thruster_pod')],
    rewards: [xp(150)],
  },
  {
    key: 'HELIO', title: 'Heliopause', icon: 'gtceu:precursor_probe_bay', shape: 'gear', size: 1.25,
    deps: ['KRYPTON'], x: 30, y: -1.5,
    desc: [
      "The &6Precursor Probe&r leaves Pluto on antimatter-sparked pellets, then cruises on its thrusters and RTGs until the solar wind gives out. The &6Heliopause Data&r it sends tells the Starshot what it's flying into.",
    ],
    tasks: [it('gtceu:precursor_probe_bay'), it('grindless:precursor_probe'), it('grindless:heliopause_data')],
    rewards: [xp(200)],
  },
  {
    key: 'SHADOW', title: 'The Shadow', icon: 'grindless:sgr_a_star_image', shape: 'gear', size: 1.25,
    deps: ['HELIO'], x: 32, y: -2.25,
    desc: [
      "Correlate a dish at Pluto with the dishes at home and you get a telescope as wide as Pluto's orbit. The &6Event Horizon Interferometer&r images the shadow of the black hole at the galaxy's centre.",
      'No real array has a baseline that long, so this one is an extrapolation of how today\'s arrays work.',
    ],
    tasks: [it('gtceu:event_horizon_interferometer'), it('grindless:sgr_a_star_image')],
    rewards: [xp(200)],
  },

  // ------------------------------------------------------------------ Starshot
  {
    key: 'SAIL', title: 'The Sail', icon: 'gtceu:light_sail_fab', shape: 'gear', size: 1.25,
    deps: ['PRINT'], x: 24, y: 1.5,
    desc: [
      "The &6Light Sail Fab&r coats a wafer in silicon nitride, patterns it through the X-ray mask and etches the silicon away underneath. What's left is a &6Light Sail&r too thin to survive gravity, so it's made in Earth orbit.",
    ],
    tasks: [it('gtceu:light_sail_fab'), it('grindless:light_sail')],
    rewards: [xp(150)],
  },
  {
    key: 'STARCHIP', title: 'Starchip', icon: 'grindless:starchip',
    deps: ['SAIL'], x: 28, y: 1.5,
    desc: [
      'A photonic chip, a diamond qubit, an americium source and a neutronium wafer become one &6Starchip&r in the &6Starchip Fab&r. Mount it on a sail and you have a probe about as heavy as a paperclip.',
    ],
    tasks: [it('gtceu:starchip_fab'), it('grindless:starchip'), it('grindless:sailcraft')],
    rewards: [xp(150)],
  },
  {
    key: 'LAUNCH', title: 'Launch', icon: 'gtceu:laser_sail_launcher', shape: 'gear', size: 1.5,
    deps: ['HELIO', 'STARCHIP'], x: 32, y: 0,
    desc: [
      'On the Moon, the &6Laser Sail Launcher&r points a whole array of fibre lasers at one sail and pushes. The heliopause data sets the course, and every launch wears the modules, so keep the refurbishing going.',
    ],
    tasks: [it('gtceu:laser_sail_launcher'), it('grindless:starshot_probe')],
    rewards: [xp(200)],
  },
  {
    key: 'PROX', title: 'Light from Proxima', icon: 'gtceu:optical_ground_station', shape: 'gear', size: 1.25,
    deps: ['LAUNCH'], x: 34, y: 0,
    desc: [
      'Far out, the probe calls home with a laser too faint to see. The &6Optical Ground Station&r catches it photon by photon on the SNSPD array and builds the &6Proxima Approach Data&r.',
    ],
    tasks: [it('gtceu:optical_ground_station'), it('grindless:proxima_approach_data')],
    rewards: [xp(200)],
  },

  // ------------------------------------------------------------------ exit
  {
    key: 'MFAC', title: 'Mega Factory', icon: 'gtceu:mega_factory', shape: 'gear', size: 1.25,
    deps: ['NETUV'], x: 14, y: 1.5,
    desc: [
      'The &6Mega Factory&r has sockets, and each takes a module: separation, forming, cutting, mixing or heat. A module adds its own recipe types, and every installed one drinks PCB coolant to keep running.',
    ],
    tasks: [it('gtceu:mega_factory')],
    rewards: [xp(200)],
  },
  {
    key: 'GATE', title: 'Gate to UHV', icon: 'gtceu:uhv_machine_hull', shape: 'diamond', size: 1.75,
    deps: ['PROX', 'SHADOW'], x: 36, y: -0.75,
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
