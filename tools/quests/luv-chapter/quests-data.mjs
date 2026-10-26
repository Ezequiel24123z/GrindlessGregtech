// Quest data for luv_age ("LuV: The Outer System"); gen.mjs in this folder writes the chapter (docs/quests.md, sections 8 and 14;
// docs/eras/luv.md, "Quests"). Ids come from the keys: never rename a key once a quest has shipped.
// Positions: columns every 2, rows every 1.5. The spine (y = 0) is home, then Earth orbit, then the rocket and Io; above it the
// trinium line, the orbit's machines and the belt; below it the cryogenics, the biofoundry, Europa and Ganymede. Fusion and research
// close the chapter on the right; while the Jovian packages are missing they sit at home (`fallback`).
//
// Packages (docs/eras/luv.md, "Build order"): a quest is in the book only when every package in its `pkg` is in LANDED. When the
// coordinator merges a package, add it to LANDED, check the quest's ids against what the package registered, run gen.mjs and the
// linter. `adjust` marks quests already in the book that a package may change (gen.mjs --pending lists both).
const it = (item, count) => ({ type: 'item', item, count });
const dim = (dimension) => ({ type: 'dimension', dimension });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });
const ri = (item, count) => ({ type: 'item', item, count });

// B7 is one of two: the flux-tube tether with a second station (B7T) or the sulfur-iodine plant on Io (B7S), decided by spike S0-3.
export const PACKAGES = ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7T', 'B7S', 'B8', 'B9', 'B10'];
export const LANDED = ['A1', 'A2', 'A3', 'A4', 'A5', 'B2', 'B3', 'B4', 'B6', 'B9', 'B10'];
// what gen.mjs --all draws: everything, with the tether
export const ALL_STATE = PACKAGES.filter((p) => p !== 'B7S');

export const CHAPTER = {
  group: '3F021F40CD26BF57',
  order: 6,
  icon: 'grindless:outer_system_chart',
  autofocus: 'START',
  title: 'LuV: The Outer System',
  subtitle: ["Superconductors at home, a station in orbit, then out past Mars to the belt and Jupiter's moons."],
};

export const QUESTS = [
  // ------------------------------------------------------------------ home: the LuV grid
  {
    key: 'START', title: 'The Outer System', icon: 'grindless:outer_system_chart', shape: 'rsquare', size: 1.5,
    deps: ['X:77B4DDD47050E3C7'], x: 0, y: 0,
    desc: [
      "The interferometer's chart shows the asteroid belt and Jupiter's big moons: cold, dark and a very long way from a wall socket. Out there is metal that fell from the sky, a volcano that powers a grid, and the only living thing in the pack.",
      'Until your own LuV hatches turn up, two IV energy hatches still run any LuV multiblock.',
    ],
    tasks: [ck()],
    rewards: [xp(50)],
  },
  {
    key: 'LUVC', title: 'LuV Components', icon: 'gtceu:luv_electric_motor',
    deps: ['START'], x: 2, y: 0,
    desc: [
      "The IV assembly line makes the LuV parts, fed from AE2 as before. Motors, pumps, sensors and emitters turn up in nearly every controller from here on, so set the line to keep a stock instead of making them one at a time.",
    ],
    tasks: [it('gtceu:luv_electric_motor'), it('gtceu:luv_electric_pump'), it('gtceu:luv_sensor'), it('gtceu:luv_emitter')],
    rewards: [xp(60)],
  },
  {
    key: 'OSM', title: 'Osmiridium', icon: 'gtceu:osmiridium_ingot',
    deps: ['LUVC'], x: 4, y: 0,
    desc: [
      "The LuV mixer stirs Mercury's iridium and osmium into &6Osmiridium&r, and the same mixer makes the ITBTC dust your superconducting tape is coated with. Like every first machine of a tier, it lives on a transformer for a while.",
    ],
    tasks: [it('gtceu:luv_mixer'), it('gtceu:osmiridium_dust'), it('gtceu:indium_tin_barium_titanium_cuprate_dust')],
    rewards: [xp(60), ri('gtceu:indium_dust', 4)],
  },
  {
    key: 'TAPE', title: 'Tape', icon: 'gtceu:coated_conductor_line', shape: 'gear', size: 1.25,
    deps: ['OSM'], x: 6, y: 0,
    desc: [
      "The &6Coated Conductor Line&r rolls nickel and Mars tungsten into a textured tape, then lays a film of ITBTC on it with a laser, oxygen and a silver cap. No ultra-hot EBF, no helium, and a fraction of the superconductor a cast wire eats.",
      "The tape can't be melted back down, so make what you need.",
    ],
    tasks: [it('gtceu:coated_conductor_line'), it('grindless:nickel_tungsten_tape'), it('grindless:itbtc_coated_conductor')],
    rewards: [xp(80), ri('gtceu:nickel_dust', 16)],
  },
  {
    key: 'WIND', title: 'Winding', icon: 'gtceu:hts_magnet_works', shape: 'gear', size: 1.5,
    deps: ['TAPE', 'TRIN'], x: 8, y: 0,
    desc: [
      "The &6HTS Magnet Works&r winds tape round a mandrel, soaks it in epoxy and tests it cold before anything leaves the building. Its superconducting coil needs a sliver of the trinium GregTech's own coil asks for, and that's what makes a fusion ring affordable at LuV.",
      'It also winds the network cells, coilgun coils and magnetic bearings.',
    ],
    tasks: [it('gtceu:hts_magnet_works'), it('gtceu:superconducting_coil')],
    rewards: [xp(120), ri('gtceu:epoxy_bucket', 2)],
  },
  {
    key: 'NETL', title: 'The Network Goes LuV', icon: 'grindless:luv_smes_cell', shape: 'rsquare', size: 1.25,
    deps: ['WIND'], x: 10, y: 0,
    desc: [
      "A &6LuV SMES Cell&r keeps its energy in a superconducting coil's field. The bank only hands out LuV once every formed tower holds LuV cells, so swap them all: one forgotten tower in the corner holds the whole network back.",
      'Until then, two IV wireless hatches on a multiblock still reach LuV.',
    ],
    tasks: [it('grindless:luv_smes_cell'), it('gtceu:luv_wireless_energy_hatch')],
    rewards: [xp(120)],
  },

  // ------------------------------------------------------------------ home: trinium and naquadah power (above the spine)
  {
    key: 'NAQC', title: 'Naquadah Coil', icon: 'gtceu:naquadah_coil_block',
    deps: ['START'], x: 2, y: -1.5,
    desc: [
      "Trinium and enriched naquadah won't melt in anything short of an EBF wound with &6Naquadah Coil&r. Rewind your hottest one. Yes, it's another trip to the EBF.",
    ],
    tasks: [it('gtceu:naquadah_coil_block', 16)],
    rewards: [xp(60)],
  },
  {
    key: 'FREC', title: 'Full Recovery', icon: 'gtceu:enriched_naquadah_sulfate_dust',
    deps: ['START'], x: 2, y: -3,
    desc: [
      "The naquadah plant learns a second mode: GT--'s enriched line, but the xenon, gold, antimony and catalyst stay inside as charges instead of going down the drain. Fluorine and hydrogen are what it actually eats.",
      "Out come &6Enriched Naquadah Sulfate&r, trinium sulfide and a little impure naquadria solution. Keep the naquadria in a tank; ZPM wants it, and it's not something you leave in a chest.",
    ],
    tasks: [it('gtceu:enriched_naquadah_oxide_mixture_dust'), it('gtceu:enriched_naquadah_sulfate_dust'), it('gtceu:trinium_sulfide_dust')],
    rewards: [xp(80), ri('gtceu:fluorine_bucket', 2)],
  },
  {
    key: 'TRIN', title: 'Trinium', icon: 'gtceu:trinium_ingot',
    deps: ['NAQC', 'FREC'], x: 6, y: -1.5,
    desc: [
      "Trinium sulfide and zinc go into the naquadah-coil EBF and come out as a hot ingot. &6Trinium&r is the wall GregTech builds in front of fusion, and this pack lowers it instead of knocking it down: the magnet works needs far less of it than you fear.",
    ],
    tasks: [it('gtceu:hot_trinium_ingot'), it('gtceu:trinium_ingot')],
    rewards: [xp(80), ri('gtceu:zinc_dust', 4)],
  },
  {
    key: 'REACT', title: 'Reactor III', icon: 'gtnn:luv_naquadah_reactor',
    deps: ['FREC'], x: 4, y: -4.5,
    desc: [
      "Enriched naquadah becomes long rods for GT--'s &6Naquadah Reactor III&r, the fuel-burning half of LuV power. A spent rod isn't rubbish: macerate it and send the dust back to the plant's spent-fuel recipe, which squeezes some enriched naquadah back out. Not all of it, sadly.",
    ],
    tasks: [it('gtnn:luv_naquadah_reactor'), it('gtceu:long_enriched_naquadah_rod')],
    rewards: [xp(80)],
  },
  {
    key: 'SIXTEEN', title: 'Sixteen at Once', icon: 'gtceu:luv_parallel_hatch', size: 0.75, optional: true,
    deps: ['FREC'], x: 6, y: -3,
    desc: [
      "The &6LuV Parallel Hatch&r fits the same slot as the IV one in every plant of ours, the naquadah plant included. Each copy still pays its own power, so it's your energy hatches that decide how many really run, and multi-amp hatches lift that cap.",
    ],
    tasks: [it('gtceu:luv_parallel_hatch')],
    rewards: [xp(60)],
  },

  // ------------------------------------------------------------------ home: cryogenics and the biofoundry (below the spine)
  {
    key: 'CLOOP', title: 'Closed Loop', icon: 'gtceu:helium_refrigerator', shape: 'gear', size: 1.25,
    deps: ['LUVC'], x: 4, y: 1.5,
    desc: [
      "Every hot ingot in the vacuum freezer throws half its liquid helium away. The &6Helium Refrigerator&r keeps a helium charge in its own hatch and only tops it up, with liquid nitrogen doing the precooling.",
      "The nitrogen leaves as gas: send it back to the Moon's cryogenic plant.",
    ],
    tasks: [it('gtceu:helium_refrigerator')],
    rewards: [xp(80), ri('gtceu:liquid_nitrogen_bucket', 4)],
  },
  {
    key: 'BIOF', title: 'Biofoundry', icon: 'gtceu:biofoundry', shape: 'gear', size: 1.25,
    deps: ['LUVC'], x: 2, y: 1.5,
    desc: [
      "GregTech's sterile chain normally waits for a ZPM cleanroom. The &6Biofoundry&r is a sealed hall with an airlock and a UV ceiling, and it runs the whole chain at LuV, starting from your creature simulators' meat and bone.",
      "Collagen, gelatin and agar need nothing alive. Everything after them needs bacteria, and Earth hasn't got any you can use.",
    ],
    tasks: [it('gtceu:biofoundry'), it('gtceu:gelatin_dust'), it('gtceu:agar_dust')],
    rewards: [xp(80), ri('minecraft:bone', 16)],
  },
  {
    key: 'SEEDS', title: 'Engineered Seeds', icon: 'grindless:engineered_barley_seed', pkg: ['B1', 'B8'],
    deps: ['BIOF'], x: 4, y: 3,
    desc: [
      "Bacteria carry new genes into ordinary seeds: barley that makes a nerve growth factor and tobacco that makes human collagen. Real farms do both. Keep the &6Engineered Barley Seed&r and its tobacco cousin; the ring in orbit replants them instead of eating them.",
    ],
    tasks: [it('grindless:engineered_barley_seed'), it('grindless:engineered_tobacco_seed')],
    rewards: [xp(60)],
  },

  // ------------------------------------------------------------------ Earth orbit
  {
    key: 'PACK', title: 'Packed and Launched', icon: 'gcyr:space_station_packager',
    deps: ['NETL'], x: 12, y: 0,
    adjust: 'B1: the station flow (packager, package, ID chip, keycard) and the suit freeze protection',
    desc: [
      "GCYR's &6Space Station Packager&r folds a whole station into one package small enough for a rocket. Pack it at home, fly it to Earth orbit and open it there; the GregTech machines go in once you've arrived.",
      'Everything up there draws from the wireless network, which is why the network came first.',
    ],
    tasks: [it('gcyr:space_station_packager'), it('gcyr:space_station_package')],
    rewards: [xp(80)],
  },
  {
    key: 'STAT', title: 'First Station', icon: 'grindless:station_truss_casing', shape: 'rsquare', size: 1.25,
    deps: ['PACK'], x: 14, y: 0,
    adjust: 'B1: the station truss recipe and anything the first station needs on arrival',
    desc: [
      "Earth orbit: no air, no night, and the coldest shade you'll ever stand in. Chunk-load the station, or its machines stop the moment you fly home.",
    ],
    tasks: [dim('gcyr:overworld_orbit')],
    rewards: [xp(100)],
  },
  {
    key: 'ENDLESS', title: 'Endless Day', icon: 'gtceu:orbital_solar_station', shape: 'gear', size: 1.25,
    deps: ['STAT'], x: 16, y: -1.5,
    desc: [
      "Up here the Sun never sets, and the &6Orbital Solar Station&r makes the most of it: two wings of panels on a truss, and every panel that sees open sky pays. Send the power home through a LuV wireless dynamo hatch.",
      "It burns nothing, so nothing doubles it.",
    ],
    tasks: [it('gtceu:orbital_solar_station'), it('grindless:orbital_solar_panel')],
    rewards: [xp(100), ri('gcyr:photovoltaic_cell', 2)],
  },
  {
    key: 'FIBRE', title: 'Fibre from Nothing', icon: 'gtceu:microgravity_smelter', shape: 'gear', size: 1.25,
    deps: ['STAT'], x: 16, y: -3,
    desc: [
      "On the ground ZBLAN glass crystallizes while it's drawn; up here it stays clear. The &6Microgravity Smelter&r draws it into optical pipe with no silver at all, foams metal into Whipple shield casing and melts naquadah alloy floating in a field, no crucible.",
      "Mix the ZBLAN at home in the Large Mixing Vessel: a normal mixer can't hold that much fluorine.",
    ],
    tasks: [it('gtceu:microgravity_smelter'), it('gtceu:zblan_dust'), it('gtceu:normal_optical_pipe')],
    rewards: [xp(100)],
  },
  {
    key: 'WAKE', title: 'In the Wake', icon: 'gtceu:wake_shield_facility', shape: 'gear', size: 1.25,
    deps: ['FIBRE'], x: 18, y: -3,
    desc: [
      "Behind a disc flying through orbit, the vacuum is emptier than any chamber you could build. The &6Wake Shield Facility&r grows HPIC and UHPIC wafers there with half the source and half the time.",
      "Its disc is Whipple shield casing, so the smelter goes first. Give it germanium and it grows solar wafers too.",
    ],
    tasks: [it('gtceu:wake_shield_facility'), it('gtceu:uhpic_wafer')],
    rewards: [xp(100), ri('gtceu:indium_gallium_phosphide_dust', 4)],
  },
  {
    key: 'CRYSTAL', title: 'Perfect Crystal', icon: 'gtceu:zero_g_crystal_grower', shape: 'gear', size: 1.25,
    deps: ['STAT'], x: 16, y: 1.5,
    desc: [
      "With nothing stirring the melt, a crystal grows without flaws. The &6Zero-G Crystal Grower&r makes raw crystal chips every time instead of now and then, and much faster, with the same dopant GregTech asks for.",
      "Its sapphire test masses are for later; EMI says what for.",
    ],
    tasks: [it('gtceu:zero_g_crystal_grower'), it('grindless:sapphire_test_mass')],
    rewards: [xp(100), ri('gtceu:sapphire_dust', 16)],
  },

  // ------------------------------------------------------------------ level 4 and the belt
  {
    key: 'LVL4', title: 'Level Four', icon: 'grindless:cryogenic_fuel_tank', pkg: ['B1'],
    deps: ['STAT'], x: 16, y: 0,
    desc: [
      "Elite motors and cryogenic fuel tanks make a level 4 rocket, and that reaches past Mars. Pack a landing kit every time: wireless energy covers and hatches, a couple of RTG cells in case, and a waystone.",
    ],
    tasks: [it('grindless:cryogenic_fuel_tank'), it('gcyr:elite_rocket_motor')],
    rewards: [xp(100)],
  },
  {
    key: 'BELT', title: 'The Belt', icon: 'grindless:asteroid_quantum_seed', pkg: ['B1'],
    deps: ['LVL4'], x: 18, y: -1.5,
    desc: [
      "A floor of rubble with boulders hanging over it, and metal that fell out of the sky. Raw meteoric iron dug on the spot goes into the &6Asteroid Quantum Seed&r, made there in a chemical reactor, and the AE2 bridge reaches the belt.",
    ],
    tasks: [dim('grindless:asteroid_belt'), it('grindless:asteroid_quantum_seed')],
    rewards: [xp(100)],
  },
  {
    key: 'HARP', title: 'Harpoon', icon: 'gtceu:harpoon_anchor_drill', pkg: ['B1', 'B5'], shape: 'gear', size: 1.25,
    deps: ['BELT'], x: 20, y: -1.5,
    desc: [
      "The belt's veins answer to one drill: the &6Harpoon Anchor Drill&r, pinned to the rock by harpoons while its HSS-S bit works. Bits and harpoons both wear slowly. No drilling fluid, it's vacuum, same as Mercury.",
    ],
    tasks: [it('gtceu:harpoon_anchor_drill'), it('grindless:hss_s_drill_bit'), it('grindless:anchor_harpoon'), it('gtceu:raw_meteoric_iron')],
    rewards: [xp(100), ri('grindless:anchor_harpoon', 2)],
  },
  {
    key: 'MOND', title: 'Mond', icon: 'gtceu:asteroid_processor', pkg: ['B1', 'B5'], shape: 'gear', size: 1.25,
    deps: ['HARP'], x: 22, y: -1.5,
    desc: [
      "The &6Asteroid Processor&r runs the Mond process: carbon monoxide carries the iron and nickel away as gas and leaves the platinum metals behind as a concentrate. The CO stays in the machine. The concentrate exists nowhere else, so the processor won't void it.",
      "It also pulls tetrataenite apart by magnet.",
    ],
    tasks: [it('gtceu:asteroid_processor'), it('grindless:asteroid_pgm_concentrate')],
    rewards: [xp(100), ri('gtceu:carbon_monoxide_bucket', 2)],
  },
  {
    key: 'STAR', title: 'Star Metal', icon: 'gtceu:platinum_group_sludge_dust', pkg: ['B1', 'B5'],
    deps: ['MOND'], x: 24, y: -1.5,
    desc: [
      "The platinum plant's fourth mode dissolves the asteroid concentrate into iridium, osmium and a sludge its old recipes already split into platinum, palladium, rhodium and ruthenium. All six in bulk, in roughly a meteorite's proportions, and Mercury gets a rest.",
    ],
    tasks: [it('gtceu:platinum_group_sludge_dust'), it('gtceu:iridium_dust'), it('gtceu:osmium_dust')],
    rewards: [xp(80)],
  },
  {
    key: 'BOULDER', title: 'Sunlight on a Boulder', icon: 'gtceu:optical_miner', pkg: ['B1', 'B5'], shape: 'gear', size: 1.25,
    deps: ['BELT'], x: 20, y: -3,
    desc: [
      "The &6Optical Miner&r bags crumbly carbon-rich boulders and bakes them with mirrors until water, carbon dioxide and a nitrogen-and-phosphorus extract boil off. It only runs with the Sun on its receiver, and the Sun is faint out here, hence all the mirrors.",
      "Its second recipe turns the carbon dioxide into the processor's CO.",
    ],
    tasks: [it('gtceu:optical_miner'), it('grindless:capture_bag'), it('grindless:chondritic_extract')],
    rewards: [xp(100), ri('grindless:capture_bag', 1)],
  },
  {
    key: 'RING', title: 'Molecular Farm', icon: 'gtceu:hydroponic_ring', pkg: ['B1', 'B5', 'B8'], shape: 'gear', size: 1.25,
    deps: ['MOND'], x: 24, y: -3,
    desc: [
      "The &6Rotating Hydroponic Ring&r spins for gravity, keeps the Sun on all the time and seals engineered crops away from the wild. The barley makes neurotrophic factor, the tobacco plant collagen, and neither seed gets eaten.",
      'Its hub turns on magnetic bearings: tetrataenite from the processor, wound at the magnet works.',
    ],
    tasks: [it('gtceu:hydroponic_ring'), it('grindless:magnetic_bearing', 4), it('grindless:neurotrophic_factor')],
    rewards: [xp(100), ri('gtceu:carbon_dioxide_bucket', 4)],
  },

  // ------------------------------------------------------------------ Io and Io orbit (the spine)
  {
    key: 'IO', title: 'Behind the Vault', icon: 'grindless:radiation_vault_casing', pkg: ['B1', 'B6'],
    deps: ['LVL4'], x: 18, y: 0,
    desc: [
      "Io sits in Jupiter's radiation, and electronics there die young. Every machine on Io, on Europa and in Io's orbit carries &6Radiation Vault Casing&r: titanium, then tantalum, like Juno's vault. You'll be fine in the suit. The machines won't.",
      'Brimstone dug on the spot makes the Ionian quantum seed.',
    ],
    tasks: [dim('grindless:io'), it('grindless:radiation_vault_casing'), it('grindless:ionian_quantum_seed')],
    rewards: [xp(100)],
  },
  {
    key: 'FUM', title: 'Fumarole', icon: 'gtceu:fumarole_condenser', pkg: ['B1', 'B6'], shape: 'gear', size: 1.25,
    deps: ['IO'], x: 20, y: 0,
    desc: [
      "The &6Fumarole Condenser&r sits over a field of vents and catches what the gas drops as it cools: sulfur dioxide, sulfur, and a sublimate with germanium and indium in it. It's the only germanium before ZPM, and it runs on the wireless hatch you brought.",
      'It also casts sulfur concrete, which needs no water. Jovian bases are built from it.',
    ],
    tasks: [it('gtceu:fumarole_condenser'), it('gtceu:germanium_dust'), it('grindless:sulfur_concrete_casing')],
    rewards: [xp(100)],
  },
  {
    key: 'PATERA', title: 'Patera', icon: 'gtceu:volcanic_intake', pkg: ['B1', 'B6'], shape: 'gear', size: 1.25,
    deps: ['FUM'], x: 22, y: 0,
    desc: [
      "The &6Volcanic Intake&r stands on a patera's magma and runs sulfur dioxide through turbines, and the power goes home through the network. It burns nothing, but the exchanger bundles erode in hot sulfur and need replacing.",
      "Its sulfur dioxide charge comes from the condenser next door.",
    ],
    tasks: [it('gtceu:volcanic_intake'), it('grindless:heat_exchanger_bundle')],
    rewards: [xp(120), ri('grindless:heat_exchanger_bundle', 1)],
  },
  {
    key: 'TORUS', title: 'Riding the Torus', icon: 'gtceu:flux_tube_tether', pkg: ['B1', 'B7T'], slot: 'io-orbit', shape: 'gear', size: 1.25,
    deps: ['PATERA'], x: 24, y: 0,
    desc: [
      "Io orbits inside a ring of plasma that turns with Jupiter, much faster than Io moves. The &6Flux-Tube Tether&r hangs a wire into it from a second station and collects the current. No ground and no fuel, only spools and a breath of Mars argon.",
    ],
    tasks: [it('gtceu:flux_tube_tether'), it('grindless:tether_spool')],
    rewards: [xp(120)],
  },
  {
    key: 'IODINE', title: 'Iodine Loop', icon: 'gtceu:sulfur_iodine_plant', pkg: ['B1', 'B7S'], slot: 'io-orbit', shape: 'gear', size: 1.25,
    deps: ['PATERA'], x: 24, y: 0,
    desc: [
      "The &6Sulfur-Iodine Plant&r splits water into hydrogen and oxygen with Io's heat instead of electricity: sulfuric acid and iodine go round and round, and only the water is used up. The naquadah plant and the fusion ring drink hydrogen by the tank.",
    ],
    tasks: [it('gtceu:sulfur_iodine_plant')],
    rewards: [xp(120)],
  },

  // ------------------------------------------------------------------ Europa (below the spine)
  {
    key: 'EUR', title: 'Under the Ice', icon: 'grindless:europan_quantum_seed', pkg: ['B1'],
    deps: ['LVL4'], x: 18, y: 1.5,
    desc: [
      "Europa is a shell of ice over an ocean nobody has ever seen. Blue ice dug on the spot makes the &6Europan Quantum Seed&r, and the AE2 bridge reaches the lid of that ocean.",
    ],
    tasks: [dim('grindless:europa'), it('grindless:europan_quantum_seed')],
    rewards: [xp(100)],
  },
  {
    key: 'CRYO', title: 'Cryobot', icon: 'gtceu:cryobot', pkg: ['B1', 'B6', 'B8'], shape: 'gear', size: 1.25,
    deps: ['EUR', 'FUM'], x: 20, y: 1.5,
    desc: [
      "The &6Cryobot&r melts its way down through the ice, paying out its tether as it sinks. A probe brings back a living ocean sample; after that it just pumps brine. Its base is sulfur concrete, so Io comes first.",
    ],
    tasks: [it('gtceu:cryobot'), it('grindless:cryobot_probe'), it('grindless:europan_ocean_sample')],
    rewards: [xp(100)],
  },
  {
    key: 'ALIVE', title: 'Something Alive', icon: 'gtceu:algae_bioreactor', pkg: ['B1', 'B8'], shape: 'gear', size: 1.25,
    deps: ['CRYO'], x: 22, y: 1.5,
    desc: [
      "Brine, hydrogen, peroxide and the belt's chondritic extract feed the ocean sample in the &6Algae Bioreactor&r, and out come bacteria: the only living matter in the pack. The bioreactor refuses to void them. So should you.",
    ],
    tasks: [it('gtceu:algae_bioreactor'), it('gtceu:bacteria_bucket')],
    rewards: [xp(150)],
  },
  {
    key: 'STEM', title: 'Stem Cells', icon: 'gtceu:stem_cells', pkg: ['B1', 'B8'],
    deps: ['ALIVE'], x: 24, y: 1.5,
    desc: [
      "Back home the biofoundry finally has bacteria: sludge, mutagen, sterile growth medium and then &6Stem Cells&r, grown on osmiridium. The sludge they hand back goes round again.",
    ],
    tasks: [it('gtceu:sterilized_growth_medium_bucket'), it('gtceu:stem_cells')],
    rewards: [xp(80)],
  },
  {
    key: 'ORGANOID', title: 'Organoid', icon: 'gtceu:organoid_lab', pkg: ['B1', 'B5', 'B8'], shape: 'gear', size: 1.25,
    deps: ['STEM'], x: 26, y: 1.5,
    desc: [
      "In orbit, neurons grow in three dimensions without a scaffold. The &6Organoid Lab&r turns stem cells, growth medium and the ring's neurotrophic factor into a neural organoid, and that into a neuro processing unit at LuV power. Nothing else makes an NPU before ZPM.",
    ],
    tasks: [it('gtceu:organoid_lab'), it('grindless:neural_organoid'), it('gtceu:neuro_processing_unit')],
    rewards: [xp(120)],
  },
  {
    key: 'LIVING', title: 'Living Circuits', icon: 'gtceu:wetware_processor', pkg: ['B1', 'B5', 'B8'],
    deps: ['ORGANOID'], x: 28, y: 1.5,
    desc: [
      "GT--'s circuit assembly line puts NPUs and crystal CPUs together into &6Wetware Processors&r, a whole batch a run on a single LuV energy hatch. Feed it from AE2 and let it keep a stock. ZPM goes through these like crisps.",
    ],
    tasks: [it('gtnn:circuit_assembly_line'), it('gtceu:wetware_processor')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ Ganymede (bottom)
  {
    key: 'GANY', title: 'Quiet Moon', icon: 'grindless:ganymedean_quantum_seed', pkg: ['B1'],
    deps: ['LVL4'], x: 18, y: 3,
    desc: [
      "Ganymede has no quakes, its own magnetic field and ice deep enough to bury things in. It's also cold enough that an old HV superconductor works with no cryostat at all. Tuff dug on the spot makes the &6Ganymedean Quantum Seed&r.",
    ],
    tasks: [dim('grindless:ganymede'), it('grindless:ganymedean_quantum_seed')],
    rewards: [xp(100)],
  },
  {
    key: 'CHIRP', title: 'Chirp', icon: 'gtceu:gravitational_wave_detector', pkg: ['B1', 'B9'], shape: 'gear', size: 1.25,
    deps: ['GANY'], x: 20, y: 3,
    desc: [
      "The &6Gravitational-Wave Detector&r is an L of vacuum tubes buried in packed or blue ice, with your sapphire test masses for mirrors. Put IV's Sagittarius A* signal in its bus, where it stays, and a long observing run writes the catalogue: two black holes merging, heard as a rising chirp.",
      "Copy the catalogue with a data orb. Plain ice won't do for the cover; it melts.",
    ],
    tasks: [it('gtceu:gravitational_wave_detector'), it('grindless:sapphire_test_mass', 4), it('grindless:sagittarius_a_star_signal'), it('grindless:gravitational_wave_catalogue')],
    rewards: [xp(150), ri('gtceu:data_orb', 2)],
  },
  {
    key: 'COIL', title: 'Coilgun', icon: 'gtceu:coilgun_launcher', pkg: ['B1', 'B9'], shape: 'gear', size: 1.25,
    deps: ['GANY'], x: 20, y: 4.5,
    desc: [
      "Out here mercury barium calcium cuprate superconducts on its own, so the magnet works' coils need no cryostat. String them into the barrel of the &6Coilgun Probe Launcher&r and throw probes off the moon with no rocket at all.",
    ],
    tasks: [it('gtceu:coilgun_launcher'), it('grindless:coilgun_coil_casing')],
    rewards: [xp(120)],
  },
  {
    key: 'CLOUDS', title: 'Into the Clouds', icon: 'grindless:jovian_atmosphere_survey', pkg: ['B1', 'B9'],
    deps: ['COIL'], x: 22, y: 4.5,
    desc: [
      "A probe with a heat shield falls into Jupiter and radios back hydrogen, helium and helium-3 until it stops. Keep the &6Jovian Atmosphere Survey&r: nobody mines a gas giant by hand.",
    ],
    tasks: [it('grindless:jupiter_entry_probe'), it('grindless:jovian_atmosphere_survey')],
    rewards: [xp(100)],
  },
  {
    key: 'SLING', title: 'Slingshot', icon: 'grindless:saturn_transfer_chart', pkg: ['B1', 'B9'],
    deps: ['COIL'], x: 22, y: 3,
    desc: [
      "The flyby probe swings round Jupiter the way Pioneer and the Voyagers did and keeps going. It takes its time reporting back, and what it sends is the &6Saturn Transfer Chart&r: where you're going next, and this time you won't land. Copy it with a data orb and keep it for ZPM.",
    ],
    tasks: [it('grindless:saturn_flyby_probe'), it('grindless:saturn_transfer_chart')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ fusion, research and the gate
  {
    key: 'FUSION', title: 'Fusion', icon: 'gtceu:luv_fusion_reactor', pkg: ['B10'], shape: 'gear', size: 1.25,
    deps: ['TORUS', 'IODINE'], x: 26, y: 0,
    fallback: { unless: ['B1', 'B6'], x: 10, y: 3, deps: ['WIND'] },
    desc: [
      "GregTech's &6Fusion Reactor Mk1&r, built round your own HTS coils. Every energy hatch adds to the buffer that pays for a start, and europium needs a big start, so fit plenty of LuV hatches.",
      "At LuV it's a materials machine first: the old transmutations that faked osmium and uranium are gone, and calcium plasma from magnesium and oxygen is its power recipe.",
    ],
    tasks: [it('gtceu:luv_fusion_reactor'), it('gtceu:superconducting_coil', 4)],
    rewards: [xp(150)],
  },
  {
    key: 'EUROP', title: 'Europium', icon: 'gtceu:europium_ingot', pkg: ['B10'],
    deps: ['FUSION'], x: 28, y: 0,
    fallback: { unless: ['B1', 'B6'], x: 12, y: 3, deps: ['FUSION'] },
    desc: [
      "Mars's neodymium and plain hydrogen go in, &6Europium&r comes out, and nothing else in the pack makes it. It leaves the ring as a very hot liquid, not a plasma, so pipe it accordingly. The ZPM motor wants a lot of it as fine wire.",
    ],
    tasks: [it('gtceu:europium_ingot')],
    rewards: [xp(100)],
  },
  {
    key: 'ORB', title: 'First Data Orb', icon: 'gtceu:research_station', pkg: ['B10'], shape: 'gear', size: 1.5,
    deps: ['EUROP'], x: 30, y: 0,
    fallback: { unless: ['B1', 'B6'], x: 14, y: 3, deps: ['EUROP'] },
    desc: [
      "The &6Research Station&r and the HPCA turn computation into data orbs, and the first one worth writing is the ZPM energy hatch's. Their wiring needs the large mixer on two LuV hatches, and the europium went into the station's ZPM motors.",
      'Computer casings, a data bank and plenty of optical pipe come first.',
    ],
    tasks: [it('gtceu:data_bank'), it('gtceu:high_performance_computation_array'), it('gtceu:research_station')],
    rewards: [xp(150), ri('gtceu:data_orb', 2)],
  },
  {
    key: 'GATE', title: 'Gate to ZPM', icon: 'gtceu:zpm_machine_hull', pkg: ['B1', 'B5', 'B6', 'B8', 'B9', 'B10'], shape: 'diamond', size: 1.75,
    deps: ['ORB'], x: 32, y: 0,
    desc: [
      "Trinium and naquadah alloy make the &6ZPM Machine Hull&r, and the ZPM energy hatch needs everything you learned out here. Bring the wetware, the catalogue and the Saturn chart along: the next trip starts in orbit and never touches the ground.",
    ],
    tasks: [
      it('gtceu:zpm_machine_hull'), it('gtceu:zpm_energy_input_hatch'), it('gtceu:wetware_processor', 4),
      it('grindless:gravitational_wave_catalogue'), it('grindless:saturn_transfer_chart'),
    ],
    rewards: [xp(300)],
  },
];
