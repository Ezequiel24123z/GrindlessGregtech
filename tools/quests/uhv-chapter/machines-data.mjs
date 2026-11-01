// Quest data for uhv_machines: one gear per multiblock of ours, the casings and parts each one asks for that are new in this era, and the product
// quests that close each row (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/uhv.md, "Our multiblocks"). Gear keys moved here from
// uhv_age keep their ids. Intermediates belong to the pl_uhv chart.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: 'uhv_machines',
  era: 'uhv',
  role: 'machines',
  order: 2,
  icon: 'gtceu:warp_gate',
  autofocus: 'HFR',
  title: 'UHV: Machines',
  subtitle: ['Transcurium and clocks, light and life, the tether and the gate, Mercury and Proxima b.'],
};

export const LINKS = [
  { key: 'M_L_TRANS', ref: 'START', x: 0, y: 0 },
  { key: 'M_L_CLOCK', ref: 'START', x: 0, y: 1.5 },
  { key: 'M_L_BETA', ref: 'START', x: 0, y: 3 },
  { key: 'M_L_PHOT', ref: 'START', x: 0, y: 4.5 },
  { key: 'M_L_SIC', ref: 'START', x: 0, y: 6 },
  { key: 'M_L_LIFE', ref: 'START', x: 0, y: 7.5 },
  { key: 'M_L_TETH', ref: 'START', x: 0, y: 9 },
  { key: 'M_L_GATE', ref: 'START', x: 0, y: 12 },
  { key: 'M_L_ZB', ref: 'START', x: 0, y: 13.5 },
  { key: 'M_L_SAMP', ref: 'START', x: 0, y: 15 },
  { key: 'M_L_MERC', ref: 'STN7', x: 0, y: 18 },
  { key: 'M_L_PROX', ref: 'STN8', x: 0, y: 22.5 },
  { key: 'M_L_BASE', ref: 'STN8', x: 0, y: 24 },
  { key: 'M_L_ICE', ref: 'STN8', x: 0, y: 25.5 },
];

// A row's first quest depends on the era quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

// One multiblock gear: controller plus the casings and parts new in this era.
const gear = (key, id, title, deps, x, y, teach, tasks, xpN = 120) => ({
  key, kind: 'machine', title, icon: `gtceu:${id}`, deps: deps_(deps), x, y,
  teach, desc: [], tasks: [it(`gtceu:${id}`), ...tasks], rewards: [xp(xpN)],
});

// One product or material quest that closes a row.
const prod = (key, title, icon, deps, x, y, text, tasks, xpN = 80) => ({
  key, title, icon, deps: deps_(deps), x, y, desc: [text], tasks, rewards: [xp(xpN)],
});

const UVC = 'gtceu:uv_machine_casing';
const SHIELD = 'gtnn:radiation_proof_machine_casing';
const CLEAN = 'gtceu:clean_machine_casing';
const INERT = 'gtceu:inert_machine_casing';
const ROBUST = 'gtceu:robust_machine_casing';
const HEATP = 'gtceu:heatproof_machine_casing';
const PTFE = 'gtceu:ptfe_pipe_casing';
const FILTER = 'gtceu:filter_casing';
const COMP = 'gtceu:computer_casing';
const TRUSS = 'grindless:station_truss_casing';
const CRYOSTAT = 'grindless:cryostat_casing';
const BSL4 = 'grindless:bsl4_casing';
const WARP = 'grindless:warp_gate_casing';
const BASEC = 'grindless:proxima_base_casing';
const HANGAR = 'grindless:hangar_casing';
const FIELD = 'grindless:field_ring_casing';
const HULL = 'gtceu:uhv_machine_hull';

export const QUESTS = [
  // ------------------------------------------------------------------ transcurium
  gear('HFR', 'high_flux_reactor', 'High Flux', ['M_L_TRANS'], 2, 0, {
    for: 'The &6High Flux Reactor&r bombards curium in a dense neutron flux and is the start of every transcurium chain.',
    needs: 'Its controller, a UHV hull and the &6Radiation-Proof Casing&r that holds the flux in.',
    unlocks: 'Berkelium and californium targets, and the driver elements that feed them.',
    automate: 'Targets and driver elements travel by ME; send spent drivers back to the reactor.',
  }, [it(HULL), it(SHIELD), it(PTFE)]),
  gear('BK', 'transuranium_facility', 'Berkelium', ['HFR'], 4, 0, {
    for: 'The &6Transuranium Facility&r separates the irradiated targets into berkelium and californium.',
    needs: 'Its controller, radiation-proof casing and tungstensteel pipe casing.',
    unlocks: 'Berkelium-249 and the californium-252 source the clock lab and the gate ask for.',
    automate: 'Keep the targets in sealed buses; leftovers go to the partitioning plant.',
  }, [it(SHIELD), it('gtceu:tungstensteel_pipe_casing')]),
  prod('CF', 'A Californium Source', 'grindless:californium_252_source', ['BK'], 6, 0,
    'One more neutron capture and berkelium becomes &6Californium-252&r, a source that emits neutrons by itself. It starts the reactors that cannot start alone.',
    [it('grindless:californium_252'), it('grindless:californium_252_source')], 120),
  prod('TH229', 'Thorium-229', 'grindless:thorium_229', ['CF'], 8, 0,
    'A trace of &6thorium-229&r comes out of the uranium-233 line. It is rare, and it has the lowest nuclear excited state known.',
    [it('grindless:thorium_229')], 120),
  prod('DRV', 'Back to the Driver', 'grindless:spent_hfir_driver_element', ['HFR'], 4, -1.5,
    'A spent driver element is not waste: it holds &6uranium-233&r bred in the flux. Reprocess it and a fresh driver goes back in the reactor.',
    [it('grindless:spent_hfir_driver_element')], 100),
  prod('NI63', 'Nickel-63', 'grindless:nickel_63_target', ['DRV'], 6, -1.5,
    'Irradiate a nickel-62 target and it turns into &6nickel-63&r, a pure beta emitter that is safe behind a thin shield and decays for a century.',
    [it('grindless:nickel_62_target'), it('grindless:nickel_63_target')], 100),

  // ------------------------------------------------------------------ clock
  gear('CLOCK', 'nuclear_clock_lab', 'A Clock in a Nucleus', ['M_L_CLOCK'], 2, 1.5, {
    for: 'The &6Nuclear Clock Lab&r locks a laser onto a thorium-229 nucleus and keeps time to a part in a quintillion.',
    needs: 'Its controller, a UHV hull and clean machine casing.',
    unlocks: 'The nuclear clock, the timing reference for the Mercury swarm and the gate.',
    automate: 'Thorium-229 targets come by ME; the clock leaves by ME.',
  }, [it(HULL), it(CLEAN)]),
  prod('P_CLK', 'The Clock', 'grindless:nuclear_clock', ['CLOCK'], 4, 1.5,
    'The &6Nuclear Clock&r keeps every later machine honest.',
    [it('grindless:nuclear_clock')]),

  // ------------------------------------------------------------------ betavoltaics
  gear('BETA', 'betavoltaic_fab', 'Fifty Years of Current', ['M_L_BETA'], 2, 3, {
    for: 'The &6Betavoltaic Fab&r builds cells that turn the decay of nickel-63 straight into current, for decades.',
    needs: 'Its controller, inert machine casing and clean machine casing.',
    unlocks: 'Betavoltaic cells for sensors and probes that cannot be recharged.',
    automate: 'Nickel-63 targets by ME; cells leave by ME.',
  }, [it(INERT), it(CLEAN)]),
  prod('P_BETA', 'A Cell That Never Ends', 'grindless:betavoltaic_cell', ['BETA'], 4, 3,
    'A &6Betavoltaic Cell&r gives microwatts for fifty years.',
    [it('grindless:betavoltaic_cell')]),

  // ------------------------------------------------------------------ photonics
  gear('LN', 'crystal_growth_furnace', 'Lithium Niobate', ['M_L_PHOT'], 2, 4.5, {
    for: 'The &6Crystal Growth Furnace&r pulls lithium niobate and other boules out of a melt, slowly.',
    needs: 'Its controller, robust and heatproof casing, computer casing and tritanium coils.',
    unlocks: 'The lithium niobate wafer and the europium-doped boule behind optical memory.',
    automate: 'Feed seeds and melt by ME; a boule is hours of work, so run several furnaces.',
  }, [it(ROBUST), it(HEATP), it(COMP), it('gtceu:tritanium_coil_block')]),
  gear('MBE', 'mbe_reactor', 'Molecular Beams', ['LN'], 4, 4.5, {
    for: 'The &6MBE Reactor&r lays a crystal down one atomic layer at a time in ultra-high vacuum.',
    needs: 'Its controller, a UHV hull and clean machine casing.',
    unlocks: 'The indium phosphide wafer and the quantum cascade laser built on it.',
    automate: 'Substrates and dopants by ME; keep the vacuum pump line free of byproducts.',
  }, [it(HULL), it(CLEAN)]),
  gear('PCM', 'photonic_foundry', 'Phase Change', ['MBE'], 6, 4.5, {
    for: 'The &6Photonic Foundry&r writes light paths and phase-change memory into a wafer.',
    needs: 'Its controller, clean machine casing and a UHV hull.',
    unlocks: 'The phase-change die and the optical assembly for photonic circuits.',
    automate: 'Wafers by ME from the furnaces; dies leave by ME.',
  }, [it(HULL), it(CLEAN)]),

  // ------------------------------------------------------------------ silicon carbide
  gear('WATER', 'ultrapure_water_plant', 'Eighteen Megohms', ['M_L_SIC'], 2, 6, {
    for: 'The &6Ultrapure Water Plant&r polishes water until it carries almost no ions at all.',
    needs: 'Its controller, clean machine casing and filter casing.',
    unlocks: 'Water clean enough for the carbide fab and the solar array fab.',
    automate: 'Pipe it straight to the fabs; do not bucket it.',
  }, [it(CLEAN), it(FILTER)]),
  gear('SIC', 'sic_device_fab', 'Silicon Carbide', ['WATER'], 4, 6, {
    for: 'The &6SiC Device Fab&r grows and etches silicon carbide into power devices that run hot.',
    needs: 'Its controller, heatproof and robust machine casing.',
    unlocks: 'SiC power modules for the UHV power stage.',
    automate: 'Wafers and ultrapure water by pipe and ME; modules leave by ME.',
  }, [it(HEATP), it(ROBUST)]),
  gear('IMM', 'solar_array_fab', 'Inverted Cells', ['SIC'], 6, 6, {
    for: 'The &6Solar Array Fab&r builds inverted metamorphic cells and stacks them into an array.',
    needs: 'Its controller and clean machine casing.',
    unlocks: 'IMM solar arrays for the Mercury station and the swarm.',
    automate: 'Cells and frames by ME; arrays leave by ME.',
  }, [it(CLEAN)]),
  prod('P_IMM', 'A Solar Array', 'grindless:imm_solar_array', ['IMM'], 8, 6,
    'An &6IMM Solar Array&r is the first panel that makes sense next to the Sun.',
    [it('grindless:imm_solar_array')]),

  // ------------------------------------------------------------------ life
  gear('ORG', 'organoid_array', 'Organoids', ['M_L_LIFE'], 2, 7.5, {
    for: 'The &6Organoid Array&r grows neural tissue on a scaffold under sterile flow.',
    needs: 'Its controller, filter casing, PTFE pipe casing and computer casing.',
    unlocks: 'Neural organoids, the core of the wetware mainframe.',
    automate: 'Scaffolds and nutrient by ME and pipe; discard cultures on a schedule.',
  }, [it(HULL), it(FILTER), it(PTFE), it(COMP)]),
  prod('P_ORG', 'A Living Processor', 'grindless:neural_organoid', ['ORG'], 4, 7.5,
    'A &6Neural Organoid&r is grown, not assembled.',
    [it('grindless:neural_organoid')]),

  // ------------------------------------------------------------------ tether
  gear('PBO', 'pbo_plant', 'PBO', ['M_L_TETH'], 2, 9, {
    for: 'The &6PBO Plant&r spins the strongest fibre we know how to make.',
    needs: 'Its controller and inert machine casing.',
    unlocks: 'PBO fibre for the tether ribbon.',
    automate: 'Keep the acid loop sealed and pipe the fibre out by ME.',
  }, [it(INERT)]),
  gear('RIB', 'tether_ribbon_works', 'Ribbon', ['PBO'], 4, 9, {
    for: 'The &6Tether Ribbon Works&r weaves fibre into a ribbon long enough to reach orbit.',
    needs: 'Its controller and robust machine casing.',
    unlocks: 'Tether ribbon segments for the space elevator.',
    automate: 'Fibre by ME; segments stack in a chest for the climber.',
  }, [it(ROBUST), it('grindless:tether_ribbon_segment')]),
  gear('UHTC', 'spark_plasma_sinterer', 'Three Thousand Degrees', ['PBO'], 2, 10.5, {
    for: 'The &6Spark Plasma Sinterer&r fuses ultra-high-temperature ceramics in seconds under pulsed current.',
    needs: 'Its controller and robust machine casing.',
    unlocks: 'UHTC tiles and nozzles for the rocket motor.',
    automate: 'Powders by ME; the dies cool before the tiles leave.',
  }, [it(ROBUST)]),
  prod('P_UHTC', 'A Tile for Reentry', 'grindless:uhtc_tile', ['UHTC'], 4, 10.5,
    'A &6UHTC Tile&r survives a heat that melts steel.',
    [it('grindless:uhtc_tile'), it('grindless:uhtc_nozzle')]),

  // ------------------------------------------------------------------ gate
  gear('POS', 'positron_accumulator', 'Positrons', ['M_L_GATE'], 2, 12, {
    for: 'The &6Positron Accumulator&r collects antimatter in a trap and fills a cartridge.',
    needs: 'Its controller, UV machine casing and a UHV hull.',
    unlocks: 'Positron cartridges and, from them, antihydrogen.',
    automate: 'Cartridges leave by ME; never let a full trap sit unwatched.',
  }, [it(HULL), it(UVC)]),
  gear('CAS', 'casimir_array', 'Casimir', ['ANTIH'], 6, 12, {
    for: 'The &6Casimir Array&r holds plates a few nanometres apart and squeezes energy from the vacuum between them.',
    needs: 'Its controller, station truss casing and cryostat casing.',
    unlocks: 'Casimir cavity stacks for the warp gate.',
    automate: 'Plates by ME; the stacks leave by ME to the gate.',
  }, [it(TRUSS), it(CRYOSTAT)]),
  gear('M_GATE', 'warp_gate', 'The Gate Opens', ['CAS'], 8, 12, {
    for: 'The &6Warp Gate&r is the first door to another star.',
    needs: 'Its controller, warp gate casing and field ring casing.',
    unlocks: 'The gate seed and the trip to Proxima b.',
    automate: 'Power and cavity stacks by ME; only the seed leaves.',
  }, [it(WARP), it(FIELD)], 160),
  prod('ANTIH', 'Antihydrogen', 'grindless:antihydrogen_cartridge', ['POS'], 4, 12,
    'A positron and an antiproton, held together long enough to make an atom. The &6Antihydrogen Cartridge&r holds a handful, and a small leak is expected: keep the cartridges sealed.',
    [it('grindless:antihydrogen_cartridge'), it('grindless:exotic_matter_cell')], 150),
  gear('ZBLAN', 'zblan_draw_tower', 'Glass from Orbit', ['M_L_ZB'], 2, 13.5, {
    for: 'The &6ZBLAN Draw Tower&r pulls fluoride glass in microgravity, where it does not crystallise.',
    needs: 'Its controller and station truss casing.',
    unlocks: 'ZBLAN fibre, the lowest-loss optical fibre there is.',
    automate: 'Preforms by ME; the fibre spools out to a chest.',
  }, [it(TRUSS)]),
  prod('P_ZB', 'Fibre Without Loss', 'grindless:zblan_fibre', ['ZBLAN'], 4, 13.5,
    '&6ZBLAN Fibre&r carries light for the whole circuit stack.',
    [it('grindless:zblan_fibre')]),

  // ------------------------------------------------------------------ mercury
  gear('GROUND', 'regolith_excavator', "Mercury's Ground", ['M_L_MERC'], 2, 18, {
    for: 'The &6Regolith Excavator&r scrapes the surface of Mercury for dust and heat-baked rock.',
    needs: 'Its controller, heatproof machine casing and station truss casing.',
    unlocks: 'Mercury regolith for the vapour furnace.',
    automate: 'Dust leaves by ME; keep the bay cooled.',
  }, [it(HEATP), it(TRUSS)]),
  prod('P_REG', 'Mercury Dust', 'grindless:mercury_regolith', ['GROUND'], 2, 19.5,
    '&6Mercury Regolith&r is the first thing we take from the inner system.',
    [it('grindless:mercury_regolith')]),
  gear('SOLVAP', 'solar_vapour_furnace', 'Vaporised by the Sun', ['GROUND'], 4, 18, {
    for: 'The &6Solar Vapour Furnace&r uses concentrated sunlight to boil regolith into its metals.',
    needs: 'Its controller, heatproof casing and station truss casing.',
    unlocks: 'Metals for swarm segments, free of fuel.',
    automate: 'Feed by ME; the heat is free but the mirrors need care.',
  }, [it(HEATP), it(TRUSS)]),
  gear('SEG', 'swarm_segment_foundry', 'Segments', ['SOLVAP'], 6, 18, {
    for: 'The &6Swarm Segment Foundry&r builds the panels of a star-powered swarm.',
    needs: 'Its controller, station truss casing and a UHV hull.',
    unlocks: 'Swarm segments and the propellant they ride on.',
    automate: 'Metals by ME; segments go to the control station.',
  }, [it(HULL), it(TRUSS)]),
  prod('P_SEG', 'A Swarm Segment', 'grindless:swarm_segment', ['SEG'], 6, 19.5,
    'A &6Swarm Segment&r is one panel of thousands.',
    [it('grindless:swarm_segment')]),
  gear('M_SWARM', 'swarm_control_station', 'The Swarm', ['SEG'], 8, 18, {
    for: 'The &6Swarm Control Station&r steers the segments and collects their power.',
    needs: 'Its controller, station truss casing and a UHV hull.',
    unlocks: 'Stellar power for UHV and the coronal map.',
    automate: 'Segments by ME; the station needs a steady stream.',
  }, [it(HULL), it(TRUSS)], 160),
  gear('M_PROBE', 'solar_probe_bay', 'Coronal Map', ['M_SWARM'], 10, 18, {
    for: 'The &6Solar Probe Bay&r launches probes into the corona to map its field.',
    needs: 'Its controller, heatproof casing and station truss casing.',
    unlocks: 'The coronal field map for the Kardashev goal.',
    automate: 'Probes by ME; maps leave by ME.',
  }, [it(HEATP), it(TRUSS)]),
  prod('P_PROBE', 'A Probe in the Corona', 'grindless:solar_probe', ['M_PROBE'], 12, 18,
    'A &6Solar Probe&r survives where nothing else does.',
    [it('grindless:solar_probe'), it('grindless:coronal_field_map')]),

  // ------------------------------------------------------------------ proxima b
  gear('SAMPLE', 'sample_receiving_facility', 'Sample Receiving', ['M_L_SAMP'], 2, 15, {
    for: 'The &6Sample Receiving Facility&r opens canisters from another world in a sealed, level-four lab.',
    needs: 'Its controller and the sealed-lab &6BSL Casing&r.',
    unlocks: 'Safe handling of every alien sample.',
    automate: 'Canisters by ME; nothing leaves unsterilised.',
  }, [it(BSL4)]),
  prod('P_SAMP', 'A Canister Opened', 'grindless:sample_canister', ['SAMPLE'], 4, 15,
    'A &6Sample Canister&r is the proof that the trip worked.',
    [it('grindless:sample_canister')]),
  gear('ROVER', 'xenoflora_rover_bay', 'Rover', ['M_L_PROX'], 2, 22.5, {
    for: 'The &6Xenoflora Rover Bay&r builds and sends rovers across the surface of Proxima b.',
    needs: 'Its controller, hangar casing and Proxima base casing.',
    unlocks: 'Flora samples from the red-lit surface.',
    automate: 'Rovers return by ME with their samples.',
  }, [it(HANGAR), it(BASEC)]),
  gear('XBOT', 'xenobotany_greenhouse', 'Under Glass', ['ROVER'], 4, 22.5, {
    for: 'The &6Xenobotany Greenhouse&r grows alien plants under red light.',
    needs: 'Its controller, Proxima base casing and filter casing.',
    unlocks: 'Xeno biomass and mushrooms.',
    automate: 'Samples by ME; harvest to the chemistry plant.',
  }, [it(BASEC), it(FILTER)]),
  gear('XBIO', 'xenobiochem_plant', 'Xenobiochemistry', ['XBOT'], 6, 22.5, {
    for: 'The &6Xenobiochem Plant&r refines alien biomass into pigments and radioprotectants.',
    needs: 'Its controller, Proxima base casing and PTFE pipe casing.',
    unlocks: 'Infrared pigment and radioprotectant, and the far-red algae.',
    automate: 'Biomass by ME; pipe the pigments on.',
  }, [it(BASEC), it(PTFE)]),
  gear('FUNGI', 'radiotrophic_vat', 'Black Fungi', ['XBIO'], 8, 22.5, {
    for: 'The &6Radiotrophic Vat&r feeds fungi on radiation instead of light.',
    needs: 'Its controller, Proxima base casing and radiation-proof casing.',
    unlocks: 'Melanised biomass for shielding.',
    automate: 'Fungus cultures by ME; keep the radiation source inside.',
  }, [it(BASEC), it(SHIELD)]),
  gear('M_ASTRO', 'baseline_astrometer', 'Four Light Years of Baseline', ['M_L_BASE'], 2, 24, {
    for: 'The &6Baseline Astrometer&r measures the sky from two stars at once.',
    needs: 'Its controller, Proxima base casing and clean machine casing.',
    unlocks: 'The survey that points toward the next gate.',
    automate: 'Surveys leave by ME.',
  }, [it(BASEC), it(CLEAN)]),
  prod('P_BASE', 'A Survey of Proxima b', 'grindless:proxima_regolith_survey', ['M_ASTRO'], 4, 24,
    'The &6Regolith Survey&r tells us what lies under the red sun.',
    [it('grindless:proxima_regolith_survey')]),
  gear('ICE', 'cold_trap_drill', 'Night-Side Ice', ['M_L_ICE'], 2, 25.5, {
    for: 'The &6Cold Trap Drill&r cores ice from the night side of Proxima b.',
    needs: 'Its controller, Proxima base casing and cryostat casing.',
    unlocks: 'Ice cores for water and biomining.',
    automate: 'Cores leave by ME.',
  }, [it(BASEC), it(CRYOSTAT)]),
  gear('BIOM', 'biomining_heap', 'Biomining', ['ICE'], 4, 25.5, {
    for: 'The &6Biomining Heap&r lets bacteria dissolve metals from regolith, slowly.',
    needs: 'Its controller, Proxima base casing and PTFE pipe casing.',
    unlocks: 'Biocemented regolith and melanin-chitosan composite.',
    automate: 'Regolith by ME; bacteria cultures stay inside.',
  }, [it(BASEC), it(PTFE)]),
  prod('BRICK', 'Bricks by Bacteria', 'grindless:biocemented_regolith', ['BIOM'], 6, 25.5,
    'Bacteria that precipitate calcite glue regolith into a hard block. &6Biocemented Regolith&r builds a base without importing a single brick.',
    [it('grindless:biocemented_regolith'), it('grindless:melanin_chitosan_composite')], 100),
  prod('FAR', 'Far-Red', 'grindless:engineered_far_red_algae', ['FUNGI'], 10, 22.5,
    'Chlorophyll cannot use far-red light, but one cyanobacterium can. Its gene cassette goes into an algae that feeds on a red sun.',
    [it('grindless:far_red_gene_cassette'), it('grindless:engineered_far_red_algae')], 150),
  prod('RED', 'Under a Red Sun', 'grindless:proxima_flora_sample', ['ROVER'], 4, 21,
    'Plants under a red sun are black, to take every photon they can. A &6Proxima Flora Sample&r and a &6Regolith Survey&r go to the &6Sample Receiving Facility&r.',
    [it('grindless:proxima_flora_sample'), it('grindless:proxima_regolith_survey')], 150),
  prod('CLIMB', 'Climber', 'grindless:tether_climber', ['RIB'], 6, 9,
    'The &6Tether Climber&r grips the ribbon and rides it up. Its wheels wear, so refurbish them.',
    [it('grindless:tether_climber')], 100),
];
