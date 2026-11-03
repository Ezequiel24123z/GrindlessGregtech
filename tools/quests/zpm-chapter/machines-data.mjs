// Quest data for zpm_machines: one gear per multiblock of ours (the Direct Energy Converter is in zpm_integration), the casings each one asks
// for, and the product quests that close each row (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/zpm.md, "Our multiblocks").
// Keys moved here from zpm_age keep their ids. Intermediates belong to the pl_zpm chart.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.machines,
  filename: 'zpm_machines',
  era: 'zpm',
  role: 'machines',
  order: 2,
  icon: 'gtceu:naquadria_refinery',
  autofocus: 'NAQD',
  title: 'ZPM: Machines',
  subtitle: ['Naquadria at home, the rings and the gas giants of Saturn, and the cold ice giants beyond.'],
};

export const LINKS = [
  { key: 'M_L_HOME', ref: 'START', x: 0, y: 0 },
  { key: 'M_L_EURO', ref: 'START', x: 0, y: 1.5 },
  { key: 'M_L_WIRE', ref: 'START', x: 0, y: 3 },
  { key: 'M_L_GRAPH', ref: 'START', x: 0, y: 4.5 },
  { key: 'M_L_VENT', ref: 'START', x: 0, y: 6 },
  { key: 'M_L_RICE', ref: 'STN3', x: 0, y: 9 },
  { key: 'M_L_SCOOP', ref: 'STN3', x: 0, y: 10.5 },
  { key: 'M_L_DEEP', ref: 'STN4', x: 0, y: 13.5 },
  { key: 'M_L_LIST', ref: 'START', x: 0, y: 15 },
  { key: 'M_L_TRIT', ref: 'START', x: 0, y: 16.5 },
];

// One multiblock gear: controller plus the casings and parts new in this era.
const gear = (key, id, title, deps, x, y, teach, tasks, xpN = 120) => ({
  key, kind: 'machine', title, icon: `gtceu:${id}`, deps, x, y,
  teach, desc: [], tasks: [it(`gtceu:${id}`), ...tasks], rewards: [xp(xpN)],
});

// One product or material quest that closes a row.
const prod = (key, title, icon, deps, x, y, text, tasks, xpN = 80) => ({
  key, title, icon, deps, x, y, desc: [text], tasks, rewards: [xp(xpN)],
});

export const QUESTS = [
  // ------------------------------------------------------------------ naquadria at home
  gear('NAQD', 'naquadria_refinery', 'Naquadria', ['START'], 2, 0, {
    for: 'The &6Naquadria Refinery&r pushes naquadah past the point it was stable. What comes out is denser, hotter and far more dangerous.',
    needs: 'Its controller, and the &6Naquadria Containment Casing&r that keeps the dust from escaping.',
    unlocks: 'Naquadria for the fuel works and the magnet works.',
    automate: 'Feed it naquadah by ME and send the naquadria dust on; never let the output back up.',
  }, [it('grindless:naquadria_containment_casing')]),
  gear('FUEL', 'naquadah_fuel_works', 'Fuel Works', ['NAQD'], 4, 0, {
    for: 'The &6Naquadah Fuel Works&r turns naquadria into the fuel that the integration plants burn.',
    needs: 'The same containment casing as the refinery, plus its controller.',
    unlocks: 'Fuel for the large reactors later on.',
    automate: 'A fuel line off the refinery by pipe; buffer it in a tank so the reactors never starve.',
  }, [it('grindless:naquadria_containment_casing')]),

  // ------------------------------------------------------------------ waste, americium and synroc
  gear('EURO', 'europium_reductor', 'Europium', ['START'], 2, 1.5, {
    for: 'The &6Europium Reductor&r pulls europium out of rare-earth ore with a reducing bath that nothing smaller can run.',
    needs: 'Its controller and heat-proof coils; europium dust is the product.',
    unlocks: 'Europium for the ZPM wire and the hulls.',
    automate: 'One reductor feeds the whole base. Stock the dust by ME.',
  }, [it('gtceu:europium_dust')]),
  gear('CLEAN', 'waste_retrieval_plant', 'Waste Retrieval', ['EURO'], 4, 1.5, {
    for: 'The &6Waste Retrieval Plant&r digs what the reactors leave behind back out of its storage and sorts it.',
    needs: 'Its controller and the radiation vault; it also hands back a &6Radium Capsule&r.',
    unlocks: 'Radon for the quantum wafer, and the stock that feeds the partitioning plant.',
    automate: 'Pipe reactor waste straight in; send radon and capsules out by ME.',
  }, [it('grindless:radium_capsule')]),
  prod('SYN', 'Synroc', 'grindless:synroc_block', ['CLEAN'], 6, 1.5,
    'Waste you cannot use is cast into a ceramic block that holds it sealed. &6Synroc&r is a place to put what is left, not a way to hide it.',
    [it('grindless:synroc_block')]),
  gear('AMER', 'actinide_partitioning_plant', 'Actinide Partitioning', ['SYN'], 8, 1.5, {
    for: 'The &6Actinide Partitioning Plant&r splits waste into americium and curium so that very little of it needs burying.',
    needs: 'Its controller and the americium and curium it makes; the synroc you already cast takes the rest.',
    unlocks: 'Americium for the ZPM hulls and curium for the magnet works.',
    automate: 'Run it off the Waste Retrieval Plant by pipe and conveyor.',
  }, [it('gtceu:americium_dust'), it('grindless:curium_oxide')]),

  // ------------------------------------------------------------------ wire and plasma
  gear('WIRE', 'naquadria_magnet_works', 'Magnet Works', ['START'], 2, 3, {
    for: 'The &6Naquadria Magnet Works&r winds the superconducting wire and insert the fusion hall and the large coils need.',
    needs: 'Its controller, naquadria and the cryostat casing from the circuits further up.',
    unlocks: 'Uranium rhodium dinaquadide wire, and the insert for the next hall.',
    automate: 'Slow and cold: keep the cryostat topped up and let it run beside the refinery.',
  }, [it('gtceu:uranium_rhodium_dinaquadide_single_wire')]),
  gear('QUENCH', 'plasma_quench_caster', 'Plasma Quench', ['WIRE'], 4, 3, {
    for: 'The &6Plasma Quench Caster&r drops plasma straight into a mould, so the metal never has time to cool in a way you did not choose.',
    needs: 'Its controller and a plasma supply; no new casing.',
    unlocks: 'Casting directly from plasma at the speed the Mk2 can feed.',
    automate: 'Plasma by pipe from the fusion hall, ingots out by conveyor.',
  }, []),
  prod('HTS', 'HTS Insert', 'grindless:hts_insert', ['QUENCH'], 6, 3,
    'A high-temperature superconductor insert, wound by the magnet works and set into a coil block. It carries current with no loss.',
    [it('grindless:hts_insert')]),

  // ------------------------------------------------------------------ diamond and qubits
  gear('GRAPH', 'methane_pyrolyser', 'Pyrolysis', ['START'], 2, 4.5, {
    for: 'The &6Methane Pyrolyser&r cracks methane into graphene and hydrogen, with the carbon coming out as a sheet.',
    needs: 'Its controller and methane from the gas network.',
    unlocks: 'Graphene for the diamond lattice and for the circuits further on.',
    automate: 'Methane by pipe; keep the hydrogen moving so it never blocks.',
  }, [it('gtceu:graphene_dust')]),
  gear('DIAM', 'diamond_lattice_fab', 'Diamond Lattice', ['GRAPH'], 4, 4.5, {
    for: 'The &6Diamond Lattice Fab&r grows a flawless diamond plate from graphene, layer by layer.',
    needs: 'Its controller and graphene; the plate is the product.',
    unlocks: 'The NV diamond chip and the ion implanter.',
    automate: 'Slow by design: run two or three side by side.',
  }, [it('grindless:cvd_diamond_plate')]),
  gear('IMPL', 'ion_implanter', 'Ion Implanter', ['DIAM'], 6, 4.5, {
    for: 'The &6Ion Implanter&r fires single atoms into a wafer or plate and places them where a qubit has to sit.',
    needs: 'Its controller, a cleanroom and silicon-28 or doped diamond.',
    unlocks: 'The donor qubit wafer and the NV diamond chip, further along.',
    automate: 'One batch at a time: feed by ME and queue the output.',
  }, [it('grindless:donor_qubit_wafer')]),
  gear('QUBIT', 'qubit_fab', 'Qubit Fab', ['IMPL'], 8, 4.5, {
    for: 'The &6Qubit Fab&r assembles qubits into an array under cryogenic conditions.',
    needs: 'Its controller and the &6Cryostat Casing&r.',
    unlocks: 'The qubit array that the circuits further on use.',
    automate: 'Keep the cryostat topped up and send the arrays on by ME.',
  }, [it('grindless:cryostat_casing')], 150),

  // ------------------------------------------------------------------ vents, aerogel and neutrinos
  gear('VENT', 'vent_bioreactor', 'Vent Life', ['START'], 2, 6, {
    for: 'The &6Vent Bioreactor&r grows microbes that live by deep-sea heat and feed on what the vents give off.',
    needs: 'Its controller and the heat-resistant culture it grows.',
    unlocks: 'Archaeal culture for aerogel, and the organics for later lines.',
    automate: 'The culture is not consumed in small runs; keep a seed batch alive in ME.',
  }, []),
  prod('ARCH', 'Archaea', 'grindless:archaeal_culture', ['VENT'], 4, 6,
    '&6Archaea&r are a culture that thrives where nothing else survives, and the biology behind the aerogel recipes. The vent bioreactor grows them from a seed batch, with heat and nutrients. They feed the aerogel works. A seed batch survives small runs, so keep one alive in ME and draw from it.',
    [it('grindless:archaeal_culture')]),
  gear('AERO', 'aerogel_works', 'Aerogel', ['ARCH'], 6, 6, {
    for: 'The &6Aerogel Works&r dries silica gel so slowly that it stays as a foam that is almost all air.',
    needs: 'Its controller and archaeal culture for the gel.',
    unlocks: 'Silica aerogel for the cryostat casing and the hulls that need to hold the cold.',
    automate: 'Slow and steady. Stock aerogel by ME.',
  }, [it('grindless:silica_aerogel')]),
  gear('NEUT', 'neutrino_observatory', 'Neutrinos', ['AERO'], 8, 6, {
    for: 'The &6Neutrino Observatory&r waits for particles that pass through the planet and counts the rare one that stops.',
    needs: 'Its controller and the &6Photomultiplier Casing&r.',
    unlocks: 'The Solar Core Survey and, from it, the data the gate to UV asks for.',
    automate: 'It needs no tending. Collect the survey by ME when it finishes.',
  }, [it('grindless:photomultiplier_casing')]),
  prod('SURVEY', 'Solar Core Survey', 'grindless:solar_core_survey', ['NEUT'], 10, 6,
    'The neutrino count, written up as a map of the sun\'s core, is what the &6Solar Core Survey&r is for: it is the proof of work the gate to UV asks for. It is made from the neutrino detector\'s readings in the survey line, so keep the detector fed and running. Nothing else uses it, so make one and hand it in. Detector output reaches the line by ME, so the whole run can be left unattended.',
    [it('grindless:solar_core_survey')], 120),

  // ------------------------------------------------------------------ Saturn
  gear('RICE', 'ring_harvester', 'Ring Ice', ['STN3'], 2, 9, {
    for: 'The &6Ring Harvester&r sails through Saturn\'s rings and nets the ice, which is not the same as the ice at home.',
    needs: 'Its controller, the &6Station Truss Casing&r you already know, and a net for the sail.',
    unlocks: 'Ring ice samples for the plume sampler and the seismometer.',
    automate: 'A station-side buffer holds the ice; ME takes it home.',
  }, [it('grindless:ring_sail_net'), it('grindless:ring_ice_sample')]),
  gear('PLUME', 'plume_sampler', 'Plumes', ['RICE'], 4, 9, {
    for: 'The &6Plume Sampler&r flies through the geysers of an icy moon and catches what comes out.',
    needs: 'Its controller and the &6Probe Bay Casing&r.',
    unlocks: 'The aerogel cartridge, the seismometer\'s other input.',
    automate: 'Probes are launched, not driven: stock them by ME.',
  }, [it('grindless:probe_bay_casing')]),
  prod('CART', 'Aerogel Cartridge', 'grindless:aerogel_cartridge', ['PLUME'], 6, 9,
    'The &6Aerogel Cartridge&r seals a sample in aerogel so that it reaches home unchanged. It is made in an assembler from aerogel and polyethylene, with the aerogel works supplying the first. Every Saturn and Uranus sample asks for one, so it unlocks the whole sample run. Keep a stock in ME and let the assembler refill it on demand.',
    [it('grindless:aerogel_cartridge')]),
  gear('RSONG', 'ring_seismometer', 'Ring Song', ['CART'], 8, 9, {
    for: 'The &6Ring Seismometer&r listens to the rings ring: tiny quakes in Saturn that tell you what is inside.',
    needs: 'Its controller, ring ice and cartridges, and the interior model it writes.',
    unlocks: 'The Saturn interior model and the Uranus transfer chart that leads onward.',
    automate: 'It listens for a long time. Leave it be.',
  }, [it('grindless:saturn_interior_model'), it('grindless:uranus_transfer_chart')], 150),

  gear('SCOOP', 'gas_giant_siphon', 'Siphon', ['STN3'], 2, 10.5, {
    for: 'The &6Gas Giant Siphon&r lowers a scoop into the clouds and brings up gas from a planet that has no ground.',
    needs: 'Its controller and a &6Scoop Head&r for the clouds.',
    unlocks: 'Helium-3 for the clean fusion route, and hydrogen in bulk.',
    automate: 'Gas by pipe into a buffer tank; the head is worn and replaced.',
  }, [it('grindless:scoop_head')]),
  gear('HE3', 'isotope_column', 'Helium-3', ['SCOOP'], 4, 10.5, {
    for: 'The &6Isotope Column&r separates helium-3 from the gas the siphon brings up.',
    needs: 'Its controller and a stream of Saturn gas.',
    unlocks: 'Helium-3 for the aneutronic route later on and the cold of the cryostat.',
    automate: 'Run the column continuously; bucket or pipe the helium-3 off.',
  }, [it('gtceu:helium_3_bucket')]),
  gear('TITAN', 'entry_probe_bay', 'Titan', ['HE3'], 6, 10.5, {
    for: 'The &6Entry Probe Bay&r drops a probe through Titan\'s haze and records the way down.',
    needs: 'Its controller, the &6Probe Bay Casing&r and a titan entry probe.',
    unlocks: 'The recording the tholin reformer starts from.',
    automate: 'Probes are single use; build them by the dozen.',
  }, [it('grindless:probe_bay_casing'), it('grindless:titan_entry_probe')]),
  prod('TREC', 'Titan Recording', 'grindless:titan_probe_recording', ['TITAN'], 8, 10.5,
    'The &6Titan Recording&r is what the entry probe saw as it fell, stored for the lab. It comes from a probe launched through the Titan line, so you need a probe, a launch and a working station. It unlocks the tholin reformer, which needs the recording to work. Probes are single use, so automate probe building and let ME collect each recording.',
    [it('grindless:titan_probe_recording')]),
  gear('THOL', 'tholin_reformer', 'Tholins', ['TREC'], 10, 10.5, {
    for: 'The &6Tholin Reformer&r turns the haze of Titan into tholin, a tar that is rich in carbon and nitrogen.',
    needs: 'Its controller and the recording from Titan.',
    unlocks: 'Tholin for the organics of the lines ahead.',
    automate: 'Feed from ME; the haze is a loop you keep.',
  }, [it('grindless:tholin')]),

  // ------------------------------------------------------------------ Uranus
  gear('DEEP', 'ice_giant_siphon', 'Deep Gas', ['STN4'], 2, 13.5, {
    for: 'The &6Ice Giant Siphon&r reaches deeper than the Saturn one, under a hull rated for the pressure.',
    needs: 'Its controller, the &6Pressure Hull Casing&r and the atmosphere sample it brings up.',
    unlocks: 'Ice giant gases, and the diamond seed in the next quest.',
    automate: 'Gas by pipe into tanks; the hull is a one-time cost.',
  }, [it('grindless:pressure_hull_casing'), it('grindless:ice_giant_atmosphere_sample')]),
  gear('RAIN', 'slurry_separator', 'Diamond Rain', ['DEEP'], 4, 12, {
    for: 'The &6Slurry Separator&r filters the diamond slurry that forms where carbon is squeezed.',
    needs: 'Its controller and the &6Pressure Hull Casing&r.',
    unlocks: 'The ice giant diamond seed.',
    automate: 'It filters constantly. Let ME collect the seeds.',
  }, [it('grindless:pressure_hull_casing')]),
  prod('SEED', 'Diamond Seed', 'grindless:ice_giant_diamond_seed', ['RAIN'], 6, 12,
    'A seed that grows a flawless plate in the lattice fab. It gives a better qubit plate than anything from home.',
    [it('grindless:ice_giant_diamond_seed')]),
  gear('NEPT', 'flyby_probe_bay', 'Past Neptune', ['DEEP'], 4, 13.5, {
    for: 'The &6Flyby Probe Bay&r launches probes that pass Neptune and Triton and never stop.',
    needs: 'Its controller, the &6Probe Bay Casing&r and a Neptune flyby probe.',
    unlocks: 'The data the Deep Space Network decodes, and the Pluto chart that leads out.',
    automate: 'Probes are one-way. Build a stock.',
  }, [it('grindless:probe_bay_casing'), it('grindless:neptune_flyby_probe')], 150),

  // ------------------------------------------------------------------ listening and exit
  gear('LIST', 'deep_space_network', 'Listening', ['START'], 2, 15, {
    for: 'The &6Deep Space Network&r decodes what the probes send home.',
    needs: 'Its controller, the recordings and the &6Multimessenger Catalogue&r it makes.',
    unlocks: 'Flyby data, and the target list the Kuiper telescope uses.',
    automate: 'Feed recordings by ME; the network works without being watched.',
  }, [it('grindless:multimessenger_catalogue'), it('grindless:neptune_flyby_data')]),
  gear('KUIPER', 'kuiper_survey_telescope', 'Kuiper Targets', ['LIST'], 4, 15, {
    for: 'The &6Kuiper Survey Telescope&r sees the small icy worlds beyond Neptune.',
    needs: 'Its controller, in Earth orbit, and the target list it produces.',
    unlocks: 'The Pluto-Kuiper Chart the next era starts from.',
    automate: 'It surveys all by itself; collect the chart when it is done.',
  }, [it('grindless:kuiper_target_list'), it('grindless:pluto_kuiper_chart')], 150),

  prod('TRIT', 'Tritanium', 'gtceu:tritanium_ingot', ['START'], 2, 16.5,
    '&6Tritanium&r is the first UV metal, made here early. Titanium and duranium fuse into it in the Mk2 reactor, so the Second Ring must be running with plenty of hatches. It unlocks darmstadtium, the assembly hall and the UV machine hulls. Feed the reactor by tank and pipe and pull the ingots by ME.',
    [it('gtceu:tritanium_ingot')], 100),
  prod('DARM', 'Darmstadtium', 'gtceu:darmstadtium_ingot', ['TRIT'], 4, 16.5,
    '&6Darmstadtium&r is another UV metal you will need early. Arsenic and ruthenium fuse into it in the same Mk2 reactor, after tritanium. It unlocks the assembly hall and the metal parts of UV machines. Keep both feeds on tanks and send the ingots on by ME.',
    [it('gtceu:darmstadtium_ingot')], 100),
  gear('ASMH', 'assembly_hall', 'Assembly Hall', ['DARM'], 6, 16.5, {
    for: 'The &6Assembly Hall&r runs assembler and circuit assembler recipes in parallel.',
    needs: 'Its controller, in a cleanroom; the circuit assembler recipes want molten tin on top.',
    unlocks: 'Mass production of the machines of this era.',
    automate: 'Feed it by ME and let the hall fill the output chests.',
  }, [], 150),
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
