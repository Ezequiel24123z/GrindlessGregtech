// Quest data for luv_age ("LuV: The Outer System"); tools/quests/gen-chapters.mjs writes the chapter (docs/quests.md, sections 8 and 14;
// docs/eras/luv.md, "Quests"). Ids come from the keys: never rename a key once a quest has shipped.
// LuV has three chapters (RF-5Q-LUV): this one keeps the journey (home, the orbit, the belt and the moons, with the arrivals and the readings
// only they give), circuits-data.mjs the crystal and wetware ladders and the research, machines-data.mjs the halls of ours and the integration rows.
// Quests that moved there keep their keys and ids. Positions: columns every 2, rows every 1.5. The spine (y = 0) is home, then the rocket and
// Io; above it the trinium line, the orbit and the belt; below it Europa and Ganymede.
//
// Packages (docs/eras/luv.md, "Build order"): a quest is in the book only when every package in its `pkg` is in LANDED. When the
// coordinator merges a package, add it to LANDED, check the quest's ids against what the package registered, run gen-chapters.mjs and the
// linter. `adjust` marks quests already in the book that a package may change (gen-chapters.mjs --era luv --pending lists both).
import { STATION_PACKAGES } from '../luv-stations.mjs';

const it = (item, count) => ({ type: 'item', item, count });
const dim = (dimension) => ({ type: 'dimension', dimension });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });
const ri = (item, count) => ({ type: 'item', item, count });

// S03 is spike S0-3: GCYR stations (tables/stations.json enabled); Earth orbit, its machines and what needs their products wait for it.
// B7 is one of two: the flux-tube tether with a second station (B7T) or the sulfur-iodine plant on Io (B7S), decided by spike S0-3.
// S03, B7T and B7S are not listed by hand: they follow tables/stations.json (../luv-stations.mjs, the rule of lib/stations.js). After
// the table flips, regenerate luv_age, luv_machines, pl_luv and power and lint (docs/quests.md, section 14).
export const PACKAGES = ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'S03', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7T', 'B7S', 'B8', 'B9', 'B10'];
const STATIC = ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B8', 'B9', 'B10'];
export const LANDED = PACKAGES.filter((p) => STATIC.includes(p) || STATION_PACKAGES.includes(p));
// what gen-chapters.mjs --every-package draws: everything, with the tether
export const ALL_STATE = PACKAGES.filter((p) => p !== 'B7S');

export const CHAPTER = {
  era: 'luv',
  role: 'age',
  order: 0,
  icon: 'grindless:outer_system_chart',
  autofocus: 'START',
  title: 'LuV: The Outer System',
  subtitle: ["Superconductors at home, a station in orbit, then out past Mars to the belt and Jupiter's moons."],
};

export const LINKS = [];

export const QUESTS = [
  // ------------------------------------------------------------------ home
  {
    key: 'START', title: 'The Outer System', icon: 'grindless:outer_system_chart', shape: 'rsquare', size: 1.5,
    deps: ['X:77B4DDD47050E3C7'], x: 0, y: 0,
    desc: [
      "The interferometer's chart shows the asteroid belt and Jupiter's big moons: cold, dark and a very long way from a wall socket. Out there is metal that fell from the sky, a volcano that powers a grid, and the only living thing in the pack.",
      'This chapter is the trip. The halls you build along the way are in LuV: Machines, and the circuits in LuV: Circuits.',
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
    deps: ['NAQC', 'FREC'], x: 4, y: -1.5,
    desc: [
      "Trinium sulfide and zinc go into the naquadah-coil EBF and come out as a hot ingot. &6Trinium&r is the wall GregTech builds in front of fusion, and this pack lowers it instead of knocking it down: the magnet works needs far less of it than you fear.",
    ],
    tasks: [it('gtceu:hot_trinium_ingot'), it('gtceu:trinium_ingot')],
    rewards: [xp(80), ri('gtceu:zinc_dust', 4)],
  },
  {
    key: 'SEEDS', title: 'Engineered Seeds', icon: 'grindless:engineered_barley_seed', pkg: ['B1', 'B8'],
    deps: ['LUVC'], x: 4, y: 3,
    desc: [
      "Bacteria carry new genes into ordinary seeds: barley that makes a nerve growth factor and tobacco that makes human collagen. Real farms do both. Keep the &6Engineered Barley Seed&r and its tobacco cousin; the ring in orbit replants them instead of eating them.",
    ],
    tasks: [it('grindless:engineered_barley_seed'), it('grindless:engineered_tobacco_seed')],
    rewards: [xp(60)],
  },
  {
    key: 'NTF', title: 'Nerve Growth', icon: 'grindless:neurotrophic_factor', pkg: ['B1', 'B5', 'B8', 'S03'],
    deps: ['SEEDS'], x: 6, y: 3,
    desc: [
      "&6Neurotrophic Factor&r is what the barley makes in the hydroponic ring: a protein that tells nerve cells to grow and stay. It is the one ingredient the organoid lab can't do without, so never let the ring run dry.",
    ],
    tasks: [it('grindless:neurotrophic_factor')],
    rewards: [xp(80)],
  },

  // ------------------------------------------------------------------ Earth orbit
  {
    key: 'PACK', title: 'Packed and Launched', icon: 'gcyr:space_station_packager', pkg: ['S03'],
    deps: ['OSM', 'NETL'], x: 6, y: -1.5,
    adjust: 'B1: the station flow (packager, package, ID chip, keycard) and the suit freeze protection',
    desc: [
      "GCYR's &6Space Station Packager&r folds a whole station into one package small enough for a rocket. Pack it at home, fly it to Earth orbit and open it there; the GregTech machines go in once you've arrived.",
      'Everything up there draws from the wireless network, which is why the network came first.',
    ],
    tasks: [it('gcyr:space_station_packager'), it('gcyr:space_station_package')],
    rewards: [xp(80)],
  },
  {
    key: 'STAT', title: 'First Station', icon: 'grindless:station_truss_casing', pkg: ['S03'], shape: 'rsquare', size: 1.25,
    deps: ['PACK'], x: 6, y: -3,
    adjust: 'B1: the station truss recipe and anything the first station needs on arrival',
    desc: [
      "Earth orbit: no air, no night, and the coldest shade you'll ever stand in. Chunk-load the station, or its machines stop the moment you fly home.",
      'The halls that belong up here are in LuV: Machines.',
    ],
    tasks: [dim('gcyr:overworld_orbit')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ level 4 and the belt
  {
    key: 'LVL4', title: 'Level Four', icon: 'grindless:cryogenic_fuel_tank', pkg: ['B1'],
    deps: ['OSM', 'NETL'], x: 8, y: 0,
    desc: [
      "Elite motors and cryogenic fuel tanks make a level 4 rocket, and that reaches past Mars. Pack a landing kit every time: wireless energy covers and hatches, a couple of RTG cells in case, and a waystone.",
    ],
    tasks: [it('grindless:cryogenic_fuel_tank'), it('gcyr:elite_rocket_motor')],
    rewards: [xp(100)],
  },
  {
    key: 'RTG', title: 'Packed for the Trip', icon: 'grindless:probe_rtg', pkg: ['B1'],
    deps: ['LVL4'], x: 8, y: 1.5,
    desc: [
      "A &6Probe RTG&r keeps a landing kit warm when the Sun is faint and the wireless link drops. Out past Mars nothing else will, so pack a spare for every world you visit.",
    ],
    tasks: [it('grindless:probe_rtg')],
    rewards: [xp(60)],
  },
  {
    key: 'BELT', title: 'The Belt', icon: 'grindless:asteroid_quantum_seed', pkg: ['B1'],
    deps: ['LVL4'], x: 10, y: -1.5,
    desc: [
      "A floor of rubble with boulders hanging over it, and metal that fell out of the sky. Raw meteoric iron dug on the spot goes into the &6Asteroid Quantum Seed&r, made there in a chemical reactor, and the AE2 bridge reaches the belt.",
    ],
    tasks: [dim('grindless:asteroid_belt'), it('grindless:asteroid_quantum_seed')],
    rewards: [xp(100)],
  },
  {
    key: 'METIRON', title: 'Fallen Metal', icon: 'gtceu:raw_meteoric_iron', pkg: ['B1', 'B5'],
    deps: ['BELT'], x: 12, y: -1.5,
    desc: [
      "&6Raw Meteoric Iron&r is nickel-rich and shaped by space, nothing like what's under your feet at home. The harpoon drill digs it by the stack, and the Mond process takes it from there.",
    ],
    tasks: [it('gtceu:raw_meteoric_iron')],
    rewards: [xp(80)],
  },
  {
    key: 'CHON', title: 'Chondrite Extract', icon: 'grindless:chondritic_extract', pkg: ['B1', 'B5'],
    deps: ['BELT'], x: 12, y: -3,
    desc: [
      "&6Chondritic Extract&r is what the optical miner boils off a carbon-rich boulder: nitrogen, phosphorus and a bit of everything else the algae like. It's the belt's gift to the bioreactor on Europa.",
    ],
    tasks: [it('grindless:chondritic_extract')],
    rewards: [xp(80)],
  },
  {
    key: 'PGM', title: 'Platinum Concentrate', icon: 'grindless:asteroid_pgm_concentrate', pkg: ['B1', 'B5'],
    deps: ['METIRON'], x: 14, y: -1.5,
    desc: [
      "The Mond process leaves the &6Asteroid PGM Concentrate&r behind: platinum metals in a meteorite's own proportions. It exists nowhere else in the pack, so keep it out of the void.",
    ],
    tasks: [it('grindless:asteroid_pgm_concentrate')],
    rewards: [xp(80)],
  },
  {
    key: 'STAR', title: 'Star Metal', icon: 'gtceu:platinum_group_sludge_dust', pkg: ['B1', 'B5'],
    deps: ['PGM'], x: 16, y: -1.5,
    desc: [
      "The platinum plant's fourth mode dissolves the asteroid concentrate into iridium, osmium and a sludge its old recipes already split into platinum, palladium, rhodium and ruthenium. All six in bulk, in roughly a meteorite's proportions, and Mercury gets a rest.",
    ],
    tasks: [it('gtceu:platinum_group_sludge_dust'), it('gtceu:iridium_dust'), it('gtceu:osmium_dust')],
    rewards: [xp(80)],
  },

  // ------------------------------------------------------------------ Io (the spine)
  {
    key: 'IO', title: 'Behind the Vault', icon: 'grindless:radiation_vault_casing', pkg: ['B1', 'B6'],
    deps: ['LVL4'], x: 10, y: 0,
    desc: [
      "Io sits in Jupiter's radiation, and electronics there die young. Every machine on Io, on Europa and in Io's orbit carries &6Radiation Vault Casing&r: titanium, then tantalum, like Juno's vault. You'll be fine in the suit. The machines won't.",
      'Brimstone dug on the spot makes the Ionian quantum seed.',
    ],
    tasks: [dim('grindless:io'), it('grindless:radiation_vault_casing'), it('grindless:ionian_quantum_seed')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ Europa (below the spine)
  {
    key: 'EUR', title: 'Under the Ice', icon: 'grindless:europan_quantum_seed', pkg: ['B1'],
    deps: ['LVL4'], x: 10, y: 1.5,
    desc: [
      "Europa is a shell of ice over an ocean nobody has ever seen. Blue ice dug on the spot makes the &6Europan Quantum Seed&r, and the AE2 bridge reaches the lid of that ocean.",
    ],
    tasks: [dim('grindless:europa'), it('grindless:europan_quantum_seed')],
    rewards: [xp(100)],
  },
  {
    key: 'OCEAN', title: 'A Sample of the Ocean', icon: 'grindless:europan_ocean_sample', pkg: ['B1', 'B6', 'B8'],
    deps: ['EUR'], x: 12, y: 1.5,
    desc: [
      "The Cryobot's probe brings back the &6Europan Ocean Sample&r in a sealed vial. It is alive, there is only one, and everything bacterial in the pack begins with it. Don't spill it.",
    ],
    tasks: [it('grindless:europan_ocean_sample')],
    rewards: [xp(100)],
  },
  {
    key: 'BACT', title: 'Bacteria', icon: 'gtceu:bacteria_bucket', pkg: ['B1', 'B8'],
    deps: ['OCEAN'], x: 14, y: 1.5,
    desc: [
      "The algae bioreactor turns the ocean sample, brine and the belt's extract into &6Bacteria&r: the only living matter in the pack. The bioreactor refuses to void it. So should you.",
    ],
    tasks: [it('gtceu:bacteria_bucket')],
    rewards: [xp(150)],
  },
  {
    key: 'STEM', title: 'Stem Cells', icon: 'gtceu:stem_cells', pkg: ['B1', 'B8'],
    deps: ['BACT'], x: 16, y: 1.5,
    desc: [
      "Back home the biofoundry finally has bacteria: sludge, mutagen, sterile growth medium and then &6Stem Cells&r, grown on osmiridium. The sludge they hand back goes round again.",
    ],
    tasks: [it('gtceu:sterilized_growth_medium_bucket'), it('gtceu:stem_cells')],
    rewards: [xp(80)],
  },

  // ------------------------------------------------------------------ Ganymede (bottom)
  {
    key: 'GANY', title: 'Quiet Moon', icon: 'grindless:ganymedean_quantum_seed', pkg: ['B1'],
    deps: ['LVL4'], x: 10, y: 3,
    desc: [
      "Ganymede has no quakes, its own magnetic field and ice deep enough to bury things in. It's also cold enough that an old HV superconductor works with no cryostat at all. Tuff dug on the spot makes the &6Ganymedean Quantum Seed&r.",
    ],
    tasks: [dim('grindless:ganymede'), it('grindless:ganymedean_quantum_seed')],
    rewards: [xp(100)],
  },
  {
    key: 'SGR', title: 'The Signal You Carried', icon: 'grindless:sagittarius_a_star_signal', pkg: ['B1', 'B9', 'S03'],
    deps: ['GANY'], x: 12, y: 4.5,
    desc: [
      "IV's &6Sagittarius A* Signal&r is the one thing you bring to the detector rather than make there. It stays in the bus for the whole run, so carry a spare.",
    ],
    tasks: [it('grindless:sagittarius_a_star_signal')],
    rewards: [xp(80)],
  },
  {
    key: 'CAT', title: 'The Catalogue', icon: 'grindless:gravitational_wave_catalogue', pkg: ['B1', 'B9', 'S03'],
    deps: ['GANY'], x: 12, y: 3,
    desc: [
      "A long run at the detector writes the &6Gravitational-Wave Catalogue&r: two black holes merging, heard as a rising chirp. Copy it with a data orb, because the next era wants it and the detector keeps the original.",
    ],
    tasks: [it('grindless:gravitational_wave_catalogue')],
    rewards: [xp(150)],
  },
  {
    key: 'CLOUDS', title: 'Into the Clouds', icon: 'grindless:jovian_atmosphere_survey', pkg: ['B1', 'B9'],
    deps: ['SGR'], x: 14, y: 4.5,
    desc: [
      "A probe with a heat shield falls into Jupiter and radios back hydrogen, helium and helium-3 until it stops. Keep the &6Jovian Atmosphere Survey&r: nobody mines a gas giant by hand.",
    ],
    tasks: [it('grindless:jupiter_entry_probe'), it('grindless:jovian_atmosphere_survey')],
    rewards: [xp(100)],
  },
  {
    key: 'SLING', title: 'Slingshot', icon: 'grindless:saturn_transfer_chart', pkg: ['B1', 'B9'],
    deps: ['CLOUDS'], x: 16, y: 4.5,
    desc: [
      "The flyby probe swings round Jupiter the way Pioneer and the Voyagers did and keeps going. It takes its time reporting back, and what it sends is the &6Saturn Transfer Chart&r: where you're going next, and this time you won't land. Copy it with a data orb and keep it for ZPM.",
    ],
    tasks: [it('grindless:saturn_flyby_probe'), it('grindless:saturn_transfer_chart')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ europium and the gate
  {
    key: 'EUROP', title: 'Europium', icon: 'gtceu:europium_ingot', pkg: ['B10'],
    deps: ['FUSION'], x: 18, y: 1.5,
    fallback: { unless: ['B1', 'B6'], x: 6, y: 1.5, deps: ['FUSION'] },
    desc: [
      "Mars's neodymium and plain hydrogen go in, &6Europium&r comes out, and nothing else in the pack makes it. It leaves the ring as a very hot liquid, not a plasma, so pipe it accordingly. The ZPM motor wants a lot of it as fine wire.",
    ],
    tasks: [it('gtceu:europium_ingot')],
    rewards: [xp(100)],
  },
  {
    key: 'GATE', title: 'Gate to ZPM', icon: 'gtceu:zpm_machine_hull', pkg: ['B1', 'B5', 'B6', 'B8', 'B9', 'B10', 'S03'], shape: 'diamond', size: 1.75,
    deps: ['EUROP', 'ORB', 'CAT', 'SLING'], x: 18, y: 3,
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
