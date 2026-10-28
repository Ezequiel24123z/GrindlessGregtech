// Quest data for zpm_age ("ZPM: The Ringed and Ice Giants"); gen.mjs in this folder writes the chapter (docs/quests.md, sections 8 and 14;
// docs/eras/zpm.md, "Quests"). Ids come from the keys: never rename a key once a quest has shipped.
// Positions: columns every 2, rows every 1.5. The spine (y = 0) is home: naquadria, fuel, the big reactor, the network and the Mk2. Above
// it the europium and waste side of home, then Saturn and Uranus further right; below it carbon, qubits, life and cold. The Mk2's
// materials and the listening post sit on the right of the spine and the gate closes the chapter.
// Every ZPM package has landed, so there is no package gating here.
const it = (item, count) => ({ type: 'item', item, count });
const dim = (dimension) => ({ type: 'dimension', dimension });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  group: '3F021F40CD26BF57',
  order: 7,
  icon: 'grindless:saturn_transfer_chart',
  autofocus: 'START',
  title: 'ZPM: The Ringed and Ice Giants',
  subtitle: ['Naquadria at home, a third and fourth station in orbit, then Saturn, its rings and the ice giants.'],
};

export const QUESTS = [
  // ------------------------------------------------------------------ home
  {
    key: 'START', title: 'Saturn and Beyond', icon: 'grindless:saturn_transfer_chart', shape: 'rsquare', size: 1.5,
    deps: ['X:1753F1FE9C989F6C'], x: 0, y: 0,
    desc: [
      'The &6Saturn Transfer Chart&r from the Jovian flyby points at rings, a hazy moon and two ice giants. Nothing out there is walkable, so the trip starts in orbit and stays there.',
      'Home first: ZPM needs a lot of naquadria, and a reactor to burn it.',
    ],
    tasks: [ck()],
    rewards: [xp(50)],
  },
  {
    key: 'NAQD', title: 'Naquadria', icon: 'gtceu:naquadria_dust',
    deps: ['START'], x: 2, y: 0,
    desc: [
      'The &6Naquadria Refinery&r pushes enriched naquadah one step further, into a dust that wants to burn. Its casing is built to hold something that would rather not be held.',
    ],
    tasks: [it('gtceu:naquadria_refinery'), it('grindless:naquadria_containment_casing'), it('gtceu:naquadria_dust')],
    rewards: [xp(60)],
  },
  {
    key: 'FUEL', title: 'Fuel', icon: 'gtceu:naquadah_fuel_works', shape: 'gear', size: 1.25,
    deps: ['NAQD'], x: 4, y: 0,
    desc: [
      "The &6Naquadah Fuel Works&r turns naquadria into a liquid fuel and takes spent fuel back, so a burnt tank isn't the end of it.",
    ],
    tasks: [it('gtceu:naquadah_fuel_works')],
    rewards: [xp(80)],
  },
  {
    key: 'EXC', title: 'Excited', icon: 'gtceu:radon_bucket', size: 0.75,
    deps: ['FUEL'], x: 6, y: 0,
    desc: [
      "Fuel only gets worth burning once the Mk2 has excited it with radon. That's a big start for a small amount, so the Mk2 comes before the reactor in practice.",
    ],
    tasks: [ck()],
    rewards: [xp(30)],
  },
  {
    key: 'BIG', title: 'The Big Reactor', icon: 'gtnn:large_naquadah_reactor', shape: 'gear', size: 1.5,
    deps: ['EXC'], x: 8, y: 0,
    desc: [
      "GT--'s &6Large Naquadah Reactor&r on excited fuel is the era's main plant. It asks for duranium frames here, so the Mk2's metal is part of the price. Feed the spent fuel back to the fuel works.",
    ],
    tasks: [it('gtnn:large_naquadah_reactor'), it('gtceu:duranium_frame')],
    rewards: [xp(150)],
  },
  {
    key: 'EURO', title: 'Europium Without Fusion', icon: 'gtceu:europium_reductor', shape: 'gear', size: 1.25,
    deps: ['START'], x: 2, y: -2,
    desc: [
      'The &6Europium Reductor&r pulls europium out of monazite froth. The Mk1 still makes it, slowly, but a second and third Mk2 are far more reasonable with this running.',
    ],
    tasks: [it('gtceu:europium_reductor'), it('gtceu:europium_dust')],
    rewards: [xp(100)],
  },
  {
    key: 'CLEAN', title: 'Clean-Up', icon: 'gtceu:waste_retrieval_plant', shape: 'gear', size: 1.25,
    deps: ['EURO'], x: 4, y: -2,
    desc: [
      "Old reactor waste is still sitting in your storage. The &6Waste Retrieval Plant&r digs it out and gives radon and a radium capsule back. The radon is what the Mk2 wants for excited fuel.",
    ],
    tasks: [it('gtceu:waste_retrieval_plant'), it('grindless:radium_capsule')],
    rewards: [xp(100)],
  },
  {
    key: 'SYN', title: 'Synroc', icon: 'grindless:synroc_block',
    deps: ['CLEAN'], x: 6, y: -2,
    desc: [
      "What the plant can't use is locked into a ceramic: &6Synroc&r, a block that doesn't leak. Dangerous byproducts get contained, not poured away.",
    ],
    tasks: [it('grindless:synroc_block')],
    rewards: [xp(60)],
  },
  {
    key: 'AMER', title: 'Americium', icon: 'gtceu:americium_dust', shape: 'gear', size: 1.25,
    deps: ['SYN'], x: 8, y: -2,
    desc: [
      'The &6Actinide Partitioning Plant&r splits the leftover stream into its elements. Americium and curium come out of it.',
    ],
    tasks: [it('gtceu:actinide_partitioning_plant'), it('gtceu:americium_dust'), it('grindless:curium_oxide')],
    rewards: [xp(100)],
  },
  {
    key: 'WIRE', title: 'Wire Without the Furnace', icon: 'gtceu:uranium_rhodium_dinaquadide_single_wire',
    deps: ['START'], x: 2, y: -4,
    desc: [
      'The &6Naquadria Magnet Works&r winds URhNq2 wire straight from its metals. The same cold room makes the ZPM SMES cell and the HTS insert.',
    ],
    tasks: [it('gtceu:naquadria_magnet_works'), it('gtceu:uranium_rhodium_dinaquadide_single_wire'), it('grindless:hts_insert')],
    rewards: [xp(100)],
  },
  {
    key: 'NETZ', title: 'The Network Goes ZPM', icon: 'grindless:zpm_smes_cell', shape: 'rsquare', size: 1.25,
    deps: ['BIG'], x: 10, y: 0,
    desc: [
      'A ZPM SMES cell and a wireless hatch put another tier on the network. Everything in orbit draws from it, so build this before you leave.',
    ],
    tasks: [it('grindless:zpm_smes_cell'), it('gtceu:zpm_wireless_energy_hatch')],
    rewards: [xp(100)],
  },
  {
    key: 'MK2', title: 'Second Ring', icon: 'gtceu:zpm_fusion_reactor', shape: 'gear', size: 1.5,
    deps: ['NETZ'], x: 12, y: 0,
    desc: [
      'The &6Fusion Reactor Mk2&r. Its start is huge, so wire in plenty of ZPM hatches. Duranium comes only from here.',
    ],
    tasks: [it('gtceu:zpm_fusion_reactor'), it('gtceu:zpm_energy_input_hatch', 4), it('gtceu:duranium_ingot')],
    rewards: [xp(150)],
  },
  {
    key: 'QUENCH', title: 'Quenched', icon: 'gtceu:plasma_quench_caster', shape: 'gear', size: 1.25,
    deps: ['MK2'], x: 14, y: -1.5,
    desc: [
      "The &6Plasma Quench Caster&r takes the Mk2's molten metal and casts it into plate and foil in one step. Its heat isn't wasted either: it comes out as steam.",
    ],
    tasks: [it('gtceu:plasma_quench_caster')],
    rewards: [xp(100)],
  },
  {
    key: 'SIXTYFOUR', title: 'Sixty-Four at Once', icon: 'gtceu:zpm_parallel_hatch', size: 0.75, optional: true,
    deps: ['MK2'], x: 14, y: 1.5,
    desc: [
      'The &6ZPM Parallel Hatch&r runs a machine on far more at a time. Worth a few for any line that keeps backing up.',
    ],
    tasks: [it('gtceu:zpm_parallel_hatch')],
    rewards: [xp(60)],
  },

  // ------------------------------------------------------------------ carbon and qubits
  {
    key: 'GRAPH', title: 'Graphene', icon: 'gtceu:graphene_dust', shape: 'gear', size: 1.25,
    deps: ['START'], x: 2, y: 2,
    desc: [
      "The &6Methane Pyrolyser&r cracks methane in a hot tin bath and skims graphene off the top. It's the carbon a lot of ZPM parts depend on.",
    ],
    tasks: [it('gtceu:methane_pyrolyser'), it('gtceu:graphene_dust')],
    rewards: [xp(80)],
  },
  {
    key: 'DIAM', title: 'Grown Diamond', icon: 'grindless:cvd_diamond_plate', shape: 'gear', size: 1.25,
    deps: ['GRAPH'], x: 4, y: 2,
    desc: [
      "The &6Diamond Lattice Fab&r grows flat diamond plates out of gas. They're thinner than anything you can cut.",
    ],
    tasks: [it('gtceu:diamond_lattice_fab'), it('grindless:cvd_diamond_plate')],
    rewards: [xp(80)],
  },
  {
    key: 'SI28', title: 'Silicon-28', icon: 'grindless:silicon_28_wafer',
    deps: ['DIAM'], x: 6, y: 2,
    desc: [
      'Isotopically pure silicon is grown as a boule and cut into wafers. Ordinary silicon has too much noise in it for what comes next.',
    ],
    tasks: [it('grindless:silicon_28_boule'), it('grindless:silicon_28_wafer')],
    rewards: [xp(80)],
  },
  {
    key: 'IMPL', title: 'Implanted', icon: 'gtceu:ion_implanter', shape: 'gear', size: 1.25,
    deps: ['SI28'], x: 8, y: 2,
    desc: [
      'The &6Ion Implanter&r fires single donor atoms into a wafer. Slow, and the only way to make a donor qubit.',
    ],
    tasks: [it('gtceu:ion_implanter'), it('grindless:donor_qubit_wafer')],
    rewards: [xp(100)],
  },
  {
    key: 'MILLI', title: 'Millikelvin', icon: 'grindless:cryostat_casing',
    deps: ['IMPL'], x: 10, y: 2,
    desc: [
      'Qubits only hold their state when almost nothing is moving. The cryostat casing keeps the fab that cold, and liquid helium gets a second life here.',
    ],
    tasks: [it('grindless:cryostat_casing'), it('grindless:nv_diamond_chip')],
    rewards: [xp(80)],
  },
  {
    key: 'QUBIT', title: 'Qubits Instead of Circuits', icon: 'grindless:qubit_array', shape: 'gear', size: 1.5,
    deps: ['MILLI'], x: 12, y: 2,
    desc: [
      'The &6Qubit Fab&r builds &6Qubit Arrays&r, and the HPCA components made from them replace a stack of circuits. Fewer parts, much harder to build.',
    ],
    tasks: [it('gtceu:qubit_fab'), it('grindless:qubit_array')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ life and cold
  {
    key: 'VENT', title: 'Vent Life', icon: 'gtceu:vent_bioreactor', shape: 'gear', size: 1.25,
    deps: ['START'], x: 2, y: 4,
    desc: [
      'Archaea that live on hot seabed vents grow in the &6Vent Bioreactor&r. They eat what nothing else in the pack can.',
    ],
    tasks: [it('gtceu:vent_bioreactor'), it('grindless:archaeal_culture')],
    rewards: [xp(80)],
  },
  {
    key: 'AERO', title: 'Aerogel', icon: 'grindless:silica_aerogel', shape: 'gear', size: 1.25,
    deps: ['VENT'], x: 4, y: 4,
    desc: [
      "The &6Aerogel Works&r makes &6Silica Aerogel&r, light enough to float and cold enough to catch comet dust. It's also half of the fuel tank for the trip to Uranus.",
    ],
    tasks: [it('gtceu:aerogel_works'), it('grindless:silica_aerogel')],
    rewards: [xp(80)],
  },
  {
    key: 'NEUT', title: 'Neutrinos', icon: 'gtceu:neutrino_observatory', shape: 'gear', size: 1.25,
    deps: ['AERO'], x: 6, y: 4,
    desc: [
      'A tank of heavy water under photomultipliers catches the odd neutrino from the Sun. The &6Neutrino Observatory&r turns the flashes into a &6Solar Core Survey&r.',
    ],
    tasks: [it('gtceu:neutrino_observatory'), it('grindless:photomultiplier_casing'), it('grindless:solar_core_survey')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ Saturn
  {
    key: 'LVL5', title: 'Level Five', icon: 'grindless:naquadah_fuel_tank',
    deps: ['NETZ'], x: 12, y: -3,
    desc: [
      'A &6Naquadah Fuel Tank&r and a &6Saturnian Quantum Seed&r are what the rocket to Saturn needs.',
    ],
    tasks: [it('grindless:naquadah_fuel_tank'), it('grindless:saturnian_quantum_seed')],
    rewards: [xp(100)],
  },
  {
    key: 'STN3', title: 'Third Station', icon: 'grindless:station_truss_casing', shape: 'rsquare', size: 1.25,
    deps: ['LVL5'], x: 14, y: -3,
    desc: [
      'Saturn orbit: no ground, no air, a very long way from the Sun. Chunk-load the station, or its machines stop the moment you leave.',
    ],
    tasks: [dim('grindless:saturn_orbit')],
    rewards: [xp(120)],
  },
  {
    key: 'RICE', title: 'Ring Ice', icon: 'gtceu:ring_harvester', shape: 'gear', size: 1.25,
    deps: ['STN3'], x: 16, y: -3,
    desc: [
      'The &6Ring Harvester&r sweeps a net through the rings and brings back &6Ring Ice&r. Nobody mines a ring by hand.',
    ],
    tasks: [it('gtceu:ring_harvester'), it('grindless:ring_sail_net'), it('grindless:ring_ice_sample')],
    rewards: [xp(100)],
  },
  {
    key: 'SCOOP', title: 'Scoop', icon: 'gtceu:gas_giant_siphon', shape: 'gear', size: 1.25,
    deps: ['STN3'], x: 16, y: -4.5,
    desc: [
      "The &6Gas Giant Siphon&r drops a scoop head into Saturn's air and draws up helium and hydrogen. The scoop wears, so keep spares.",
    ],
    tasks: [it('gtceu:gas_giant_siphon'), it('grindless:scoop_head')],
    rewards: [xp(100)],
  },
  {
    key: 'HE3', title: 'Helium-3 in Bulk', icon: 'gtceu:isotope_column', shape: 'gear', size: 1.25,
    deps: ['SCOOP'], x: 18, y: -4.5,
    desc: [
      "The &6Isotope Column&r splits Saturn's helium into helium-3, deuterium and helium-4. It's the fuel for the aneutronic burn, and the reason Saturn is worth the trip.",
    ],
    tasks: [it('gtceu:isotope_column'), it('gtceu:helium_3_bucket')],
    rewards: [xp(120)],
  },
  {
    key: 'TITAN', title: "Titan's Haze", icon: 'gtceu:entry_probe_bay', shape: 'gear', size: 1.25,
    deps: ['STN3'], x: 16, y: -6,
    desc: [
      "A heat-shielded probe falls through Titan's orange haze and radios back what it passes. The &6Entry Probe Bay&r builds and launches it.",
    ],
    tasks: [it('gtceu:entry_probe_bay'), it('grindless:titan_entry_probe'), it('grindless:titan_probe_recording')],
    rewards: [xp(100)],
  },
  {
    key: 'THOL', title: 'Tholins', icon: 'grindless:tholin', shape: 'gear', size: 1.25,
    deps: ['TITAN'], x: 18, y: -6,
    desc: [
      "Titan's haze is organic: &6Tholin&r, a tarry mix of nitriles. The &6Tholin Reformer&r turns it into something the chemistry here can use.",
    ],
    tasks: [it('gtceu:tholin_reformer'), it('grindless:tholin')],
    rewards: [xp(100)],
  },
  {
    key: 'PLUME', title: 'Through the Plume', icon: 'gtceu:plume_sampler', shape: 'gear', size: 1.25,
    deps: ['RICE'], x: 18, y: -3,
    desc: [
      'Enceladus vents salt water into space. The &6Plume Sampler&r flies through it and collects some, and the brine is the start of the aerogel cartridge.',
    ],
    tasks: [it('gtceu:plume_sampler'), it('grindless:aerogel_cartridge')],
    rewards: [xp(100)],
  },
  {
    key: 'RSONG', title: 'Ring Song', icon: 'gtceu:ring_seismometer', shape: 'gear', size: 1.25,
    deps: ['PLUME'], x: 20, y: -3,
    desc: [
      'The rings ring like a bell when something hits them. The &6Ring Seismometer&r listens and builds a &6Saturn Interior Model&r, which is what the chart to Uranus is made from.',
    ],
    tasks: [it('gtceu:ring_seismometer'), it('grindless:saturn_interior_model'), it('grindless:uranus_transfer_chart')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ Uranus
  {
    key: 'LVL6', title: 'Level Six', icon: 'grindless:aerogel_fuel_tank',
    deps: ['RSONG'], x: 22, y: -3,
    desc: [
      'The next tank is built round aerogel, and the &6Uranian Quantum Seed&r comes from the new chart. Bring plenty of fuel: nothing out there refuels you.',
    ],
    tasks: [it('grindless:aerogel_fuel_tank'), it('grindless:uranian_quantum_seed')],
    rewards: [xp(120)],
  },
  {
    key: 'STN4', title: 'Fourth Station', icon: 'grindless:station_truss_casing', shape: 'rsquare', size: 1.25,
    deps: ['LVL6'], x: 24, y: -3,
    desc: [
      'Uranus orbit, tipped on its side and colder than Saturn. Same station, but anything dipping into the air needs a stronger hull.',
    ],
    tasks: [dim('grindless:uranus_orbit')],
    rewards: [xp(120)],
  },
  {
    key: 'DEEP', title: 'Deep Gas', icon: 'gtceu:ice_giant_siphon', shape: 'gear', size: 1.25,
    deps: ['STN4'], x: 26, y: -3,
    desc: [
      'The &6Ice Giant Siphon&r reaches deeper than the one at Saturn, under a hull rated for it. It brings up an &6Ice Giant Atmosphere Sample&r too.',
    ],
    tasks: [it('gtceu:ice_giant_siphon'), it('grindless:pressure_hull_casing'), it('grindless:ice_giant_atmosphere_sample')],
    rewards: [xp(120)],
  },
  {
    key: 'RAIN', title: 'Diamond Rain', icon: 'gtceu:slurry_separator', shape: 'gear', size: 1.25,
    deps: ['STN4'], x: 26, y: -4.5,
    desc: [
      'Deep in the ice giants carbon is squeezed into diamond. The &6Slurry Separator&r filters a diamond slurry and the seed in it grows a better qubit plate.',
    ],
    tasks: [it('gtceu:slurry_separator'), it('grindless:ice_giant_diamond_seed')],
    rewards: [xp(120)],
  },
  {
    key: 'NEPT', title: 'Past Neptune', icon: 'gtceu:flyby_probe_bay', shape: 'gear', size: 1.25,
    deps: ['DEEP'], x: 28, y: -3,
    desc: [
      "A flyby probe passes Neptune and Triton and doesn't stop. It reports back late, and what it reports is the last step to the next chart.",
    ],
    tasks: [it('gtceu:flyby_probe_bay'), it('grindless:neptune_flyby_probe'), it('grindless:neptune_probe_recording')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ exit
  {
    key: 'LIST', title: 'Listening', icon: 'gtceu:deep_space_network', shape: 'gear', size: 1.25,
    deps: ['MK2'], x: 16, y: 0,
    desc: [
      'The &6Deep Space Network&r decodes what the probes send home. Feed it the recordings and it hands back flyby data and a &6Multimessenger Catalogue&r.',
    ],
    tasks: [it('gtceu:deep_space_network'), it('grindless:multimessenger_catalogue'), it('grindless:neptune_flyby_data')],
    rewards: [xp(120)],
  },
  {
    key: 'KUIPER', title: 'Kuiper Targets', icon: 'gtceu:kuiper_survey_telescope', shape: 'gear', size: 1.25,
    deps: ['LIST'], x: 18, y: 0,
    desc: [
      'The &6Kuiper Survey Telescope&r picks out the small icy worlds past Neptune. Its &6Pluto-Kuiper Chart&r is where the next era sets off from.',
    ],
    tasks: [it('gtceu:kuiper_survey_telescope'), it('grindless:kuiper_target_list'), it('grindless:pluto_kuiper_chart')],
    rewards: [xp(150)],
  },
  {
    key: 'TRIT', title: 'Tritanium', icon: 'gtceu:tritanium_ingot',
    deps: ['MK2'], x: 16, y: 1.5,
    desc: [
      "Titanium and duranium fuse into &6Tritanium&r in the Mk2. It's a UV metal, made here first.",
    ],
    tasks: [it('gtceu:tritanium_ingot')],
    rewards: [xp(100)],
  },
  {
    key: 'DARM', title: 'Darmstadtium', icon: 'gtceu:darmstadtium_ingot',
    deps: ['TRIT'], x: 18, y: 1.5,
    desc: [
      "Arsenic and ruthenium make &6Darmstadtium&r in the same reactor. Another UV metal you'll need ahead of schedule.",
    ],
    tasks: [it('gtceu:darmstadtium_ingot')],
    rewards: [xp(100)],
  },
  {
    key: 'ANEU', title: 'Aneutronic', icon: 'gtceu:helium_3_bucket',
    deps: ['HE3'], x: 20, y: -4.5,
    desc: [
      "Deuterium and helium-3 fuse into helium plasma with almost no stray neutrons. It runs on the Mk2 only, and it's the clean way to turn Saturn's gas into power.",
    ],
    tasks: [it('gtceu:zpm_fusion_reactor'), it('gtceu:helium_3_bucket')],
    rewards: [xp(120)],
  },
  {
    key: 'DEC', title: 'Direct Conversion', icon: 'gtceu:direct_energy_converter', shape: 'gear', size: 1.25,
    deps: ['ANEU'], x: 22, y: -4.5,
    desc: [
      'The &6Direct Energy Converter&r takes charge straight off the plasma, with no turbine in between. It returns the cooled gas, so nothing is lost but the heat.',
    ],
    tasks: [it('gtceu:direct_energy_converter')],
    rewards: [xp(120)],
  },
  {
    key: 'ASMH', title: 'Assembly Hall', icon: 'gtceu:assembly_hall', shape: 'gear', size: 1.25,
    deps: ['SIXTYFOUR'], x: 14, y: 3,
    desc: [
      'The &6Assembly Hall&r runs assembler and circuit assembler recipes in parallel. It has to stand inside a cleanroom, and the circuit assembler recipes want molten tin on top.',
    ],
    tasks: [it('gtceu:assembly_hall')],
    rewards: [xp(150)],
  },
  {
    key: 'GATE', title: 'Gate to UV', icon: 'gtceu:uv_machine_hull', shape: 'diamond', size: 1.75,
    deps: ['NEPT'], x: 30, y: -3,
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
