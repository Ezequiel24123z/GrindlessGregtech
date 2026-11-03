// Quest data for uhv_machines: one gear per multiblock of ours, the casings and parts each one asks for that are new in this era, and the product
// quests that close each row (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/uhv.md, "Our multiblocks"). Gear keys moved here from
// uhv_age keep their ids. Intermediates belong to the pl_uhv chart.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'UHV Machines', origin: { x: 5.5, y: 17.5 }, heading: { key: 'H_ISO', x: 0, y: 0, deps: ['H_CIRC'], icon: 'gtceu:high_flux_reactor', desc: [
      'Heavy isotopes, nuclear clocks and long-lived cells.',
      'The machines of this age start here.',
    ] } },
  filename: 'uhv_machines',
  era: 'uhv',
  role: 'machines',
  order: 2,
  icon: 'gtceu:warp_gate',
  autofocus: 'HFR',
  title: 'UHV: Machines',
  subtitle: ['Transcurium and clocks, light and life, the tether and the gate, Mercury and Proxima b.'],
};

export const LINKS = [];

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
  key, title, icon, deps: deps_(deps), x, y, desc: Array.isArray(text) ? text : [text], tasks, rewards: [xp(xpN)],
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
  gear('HFR', 'high_flux_reactor', 'High Flux', ['H_ISO'], 3, -3, {
    for: 'The &6High Flux Reactor&r bombards curium in a dense neutron flux and is the start of every transcurium chain.',
    needs: 'Its controller, a UHV hull and the &6Radiation-Proof Casing&r that holds the flux in.',
    unlocks: 'Berkelium and californium targets, and the driver elements that feed them.',
    automate: 'Targets and driver elements travel by ME; send spent drivers back to the reactor.',
  }, [it(HULL), it(SHIELD), it(PTFE)]),
  gear('BK', 'transuranium_facility', 'Berkelium', ['HFR'], 5, -3, {
    for: 'The &6Transuranium Facility&r separates the irradiated targets into berkelium and californium.',
    needs: 'Its controller, radiation-proof casing and tungstensteel pipe casing.',
    unlocks: 'Berkelium-249 and the californium-252 source that cold-trap drilling and YBCO irradiation use as a catalyst.',
    automate: 'Keep the targets in sealed buses; leftovers go to the partitioning plant.',
  }, [it(SHIELD), it('gtceu:tungstensteel_pipe_casing')]),
  prod('CF', 'A Californium Source', 'grindless:californium_252_source', ['BK'], 7, -3,
    'One more neutron capture and berkelium becomes &6Californium-252&r, a source that emits neutrons by itself. It is the catalyst of cold-trap drilling and of YBCO irradiation, and it is not used up.',
    [it('grindless:californium_252'), it('grindless:californium_252_source')], 120),
  prod('TH229', 'Thorium-229', 'grindless:thorium_229', ['CF'], 9, -3,
    ['Uranium-233 decays slowly into &6thorium-229&r, and the Transuranium Facility keeps the uranium in a decay store while the thorium grows in. It is rare, and its nucleus has the lowest excited state known.', 'The hot cell then dissolves it as a nitrate. Keep the store fed by ME and take the thorium out on a schedule.'],
    [it('grindless:thorium_229'), it('grindless:thorium_229_nitrate')], 120),
  prod('THF4', 'Laser-Grade Fluoride', 'grindless:thorium_caf2_crystal', ['TH229'], 11, -3,
    ['The nitrate is fluorinated in the fluorspar kiln to &6laser-grade thorium tetrafluoride&r, pure enough to dope a crystal. Then the crystal growth furnace grows it into calcium fluoride.', 'The Th:CaF2 crystal is what the Nuclear Clock Lab locks its laser onto. Automate it with the nitrate by ME and run the furnace on its own bus: a crystal takes hours.'],
    [it('grindless:laser_grade_thf4'), it('grindless:thorium_caf2_crystal')], 120),
  prod('DRV', 'Back to the Driver', 'grindless:spent_hfir_driver_element', ['HFR'], 5, -4.5,
    'A spent driver element is not waste: it holds &6uranium-233&r bred in the flux. Reprocess it and a fresh driver goes back in the reactor.',
    [it('grindless:spent_hfir_driver_element')], 100),
  prod('NI63', 'Nickel-63', 'grindless:nickel_63_target', ['DRV'], 7, -4.5,
    'The same reactor that breeds californium breeds &6nickel-63&r: a nickel-62 target captures a neutron beside a driver element. It is a pure beta emitter, safe behind a thin shield, and the betavoltaic fab plates it from a liquor that is cleaned and reused.',
    [it('grindless:nickel_62_target'), it('grindless:nickel_63_target')], 100),

  // ------------------------------------------------------------------ clock
  gear('CLOCK', 'nuclear_clock_lab', 'A Clock in a Nucleus', ['H_ISO'], 3, -1, {
    for: 'The &6Nuclear Clock Lab&r locks a laser onto a thorium-229 nucleus and keeps time to a part in a quintillion.',
    needs: 'Its controller, a UHV hull and clean machine casing.',
    unlocks: 'The nuclear clock, the timing reference for the Mercury swarm and the gate.',
    automate: 'Thorium-229 targets come by ME; the clock leaves by ME.',
  }, [it(HULL), it(CLEAN)]),
  prod('P_CLK', 'The Clock', 'grindless:nuclear_clock', ['CLOCK'], 5, -1,
    ['The &6Nuclear Clock&r is a thorium-229 target locked to a laser: it keeps time to a part in a quintillion, and every later machine that must agree on the second is timed from it.', 'It is made in the Nuclear Clock Lab from thorium-229 and a UHV circuit. It is a component of the gate and of the swarm control station, so build one early. Make them in the lab by ME and keep a small stock.'],
    [it('grindless:nuclear_clock')]),

  // ------------------------------------------------------------------ betavoltaics
  gear('BETA', 'betavoltaic_fab', 'Fifty Years of Current', ['H_ISO'], 3, 1, {
    for: 'The &6Betavoltaic Fab&r builds cells that turn the decay of nickel-63 straight into current, for decades.',
    needs: 'Its controller, inert machine casing and clean machine casing.',
    unlocks: 'Betavoltaic cells for sensors and probes that cannot be recharged.',
    automate: 'Nickel-63 targets by ME; cells leave by ME.',
  }, [it(INERT), it(CLEAN)]),
  prod('P_BETA', 'A Cell That Never Ends', 'grindless:betavoltaic_cell', ['BETA'], 5, 1,
    ['A &6Betavoltaic Cell&r turns the beta decay of nickel-63 straight into current: microwatts for fifty years, with nothing to refuel.', 'The fab makes it from a nickel-63 target and clean-room parts. It powers sensors and probes that cannot be recharged, and the solar probe carries one. Automate it with a nickel-63 target feed from the driver line and a chest of finished cells.'],
    [it('grindless:betavoltaic_cell')]),

  // ------------------------------------------------------------------ photonics
  gear('LN', 'crystal_growth_furnace', 'Lithium Niobate', ['H_CRYS'], 3.5, 6, {
    for: 'The &6Crystal Growth Furnace&r pulls lithium niobate and other boules out of a melt, slowly.',
    needs: 'Its controller, robust and heatproof casing, computer casing and tritanium coils.',
    unlocks: 'The lithium niobate wafer and the europium-doped boule behind optical memory. The wafer is etched into waveguides before any modulator is made.',
    automate: 'Feed seeds and melt by ME; a boule is hours of work, so run several furnaces.',
  }, [it(ROBUST), it(HEATP), it(COMP), it('gtceu:tritanium_coil_block'), it('grindless:etched_lnoi_wafer'), it('grindless:thin_film_ln_modulator')]),
  gear('MBE', 'mbe_reactor', 'Molecular Beams', ['LN'], 5.5, 6, {
    for: 'The &6MBE Reactor&r lays a crystal down one atomic layer at a time in ultra-high vacuum.',
    needs: 'Its controller, a UHV hull and clean machine casing.',
    unlocks: 'The indium phosphide wafer and the quantum cascade laser built on it.',
    automate: 'Substrates and dopants by ME; keep the vacuum pump line free of byproducts.',
  }, [it(HULL), it(CLEAN)]),
  gear('PCM', 'photonic_foundry', 'Phase Change', ['MBE'], 7.5, 6, {
    for: 'The &6Photonic Foundry&r writes light paths and phase-change memory into a wafer.',
    needs: 'Its controller, clean machine casing and a UHV hull.',
    unlocks: 'The phase-change die and the optical assembly for photonic circuits.',
    automate: 'Wafers by ME from the furnaces; dies leave by ME.',
  }, [it(HULL), it(CLEAN)]),

  // ------------------------------------------------------------------ silicon carbide
  gear('WATER', 'ultrapure_water_plant', 'Eighteen Megohms', ['H_CRYS'], 3.5, 8, {
    for: 'The &6Ultrapure Water Plant&r polishes water until it carries almost no ions at all.',
    needs: 'Its controller, clean machine casing and filter casing. It takes grade 5 water, which five purification stages make from plain water.',
    unlocks: 'Ultrapure water at eighteen megohms, which the carbide fab, the solar array fab and every foundry recipe drink. Any ion left ruins a wafer.',
    automate: 'Build the five grades in order, then pipe the result straight to the fabs; do not bucket it.'
  }, [it(CLEAN), it(FILTER), it('gtca:purified_water_grade_5_bucket'), it('gtceu:ultrapure_water_bucket')]),
  gear('SIC', 'sic_device_fab', 'Silicon Carbide', ['WATER'], 5.5, 8, {
    for: 'The &6SiC Device Fab&r grows and etches silicon carbide into power devices that run hot.',
    needs: 'Its controller, heatproof and robust machine casing.',
    unlocks: 'SiC power modules for the UHV power stage. The boule grows from source powder made of polysilicon, graphite and argon, so the silicon line feeds it.',
    automate: 'Powder, wafers and ultrapure water by pipe and ME; modules leave by ME.'
  }, [it(HEATP), it(ROBUST), it('grindless:sic_source_powder')]),
  gear('IMM', 'solar_array_fab', 'Inverted Cells', ['SIC'], 7.5, 8, {
    for: 'The &6Solar Array Fab&r builds inverted metamorphic cells and stacks them into an array.',
    needs: 'Its controller and clean machine casing.',
    unlocks: 'IMM solar arrays for the Mercury station and the swarm.',
    automate: 'Cells and frames by ME; arrays leave by ME.',
  }, [it(CLEAN)]),
  prod('P_IMM', 'A Solar Array', 'grindless:imm_solar_array', ['IMM'], 9.5, 8,
    'An &6IMM Solar Array&r is the first panel that makes sense next to the Sun.',
    [it('grindless:imm_solar_array')]),

  // ------------------------------------------------------------------ life
  gear('ORG', 'organoid_array', 'Organoids', ['H_CRYS'], 3.5, 12, {
    for: 'The &6Organoid Array&r grows neural tissue on a scaffold under sterile flow.',
    needs: 'Its controller, filter casing, PTFE pipe casing and computer casing.',
    unlocks: 'Neural organoids, the core of the wetware mainframe. The scaffold is chitosan, from the xenobiochemistry plant at Proxima b.',
    automate: 'Chitosan scaffolds and nutrient by ME and pipe; discard cultures on a schedule.'
  }, [it(HULL), it(FILTER), it(PTFE), it(COMP)]),
  prod('P_ORG', 'A Living Processor', 'grindless:neural_organoid', ['ORG'], 5.5, 12,
    ['A &6Neural Organoid&r is grown, not assembled: neurons on a scaffold, fed and kept sterile until they work as a processor.', 'The organoid array grows it from a scaffold and nutrient, and the cultures are discarded on a schedule. It is the core of the wetware circuit row and one of the gate\'s five ingredients. Automate it with scaffolds and nutrient by ME and pipe, and never leave a culture unwatched.'],
    [it('grindless:neural_organoid')]),

  // ------------------------------------------------------------------ tether
  gear('PBO', 'pbo_plant', 'PBO', ['H_HEAT'], 4, 15, {
    for: 'The &6PBO Plant&r spins the strongest fibre we know how to make.',
    needs: 'Its controller and inert machine casing.',
    unlocks: 'PBO fibre for the tether ribbon.',
    automate: 'Keep the acid loop sealed and pipe the fibre out by ME.',
  }, [it(INERT)]),
  gear('RIB', 'tether_ribbon_works', 'Ribbon', ['PBO'], 6, 15, {
    for: 'The &6Tether Ribbon Works&r weaves fibre into a ribbon long enough to reach orbit.',
    needs: 'Its controller and robust machine casing.',
    unlocks: 'Tether ribbon segments for the space elevator.',
    automate: 'Fibre by ME; segments stack in a chest for the climber.',
  }, [it(ROBUST), it('grindless:tether_ribbon_segment')]),
  gear('UHTC', 'spark_plasma_sinterer', 'Three Thousand Degrees', ['PBO'], 4, 16.5, {
    for: 'The &6Spark Plasma Sinterer&r fuses ultra-high-temperature ceramics in seconds under pulsed current.',
    needs: 'Its controller and robust machine casing.',
    unlocks: 'UHTC tiles and nozzles for the rocket motor.',
    automate: 'Powders by ME; the dies cool before the tiles leave.',
  }, [it(ROBUST)]),
  prod('P_UHTC', 'A Tile for Reentry', 'grindless:uhtc_tile', ['UHTC'], 6, 16.5,
    ['A &6UHTC Tile&r is an ultra-high-temperature ceramic that survives a heat that melts steel. The &6UHTC Nozzle&r is the same ceramic cast as the throat of a rocket motor.', 'Both come from the spark plasma sinterer, from ceramic powders pressed under pulsed current. The tile lines the reentry capsule and the nozzle goes into the ICAN rocket motor. Automate it with powders by ME and let the dies cool before the parts leave.'],
    [it('grindless:uhtc_tile'), it('grindless:uhtc_nozzle')]),

  // ------------------------------------------------------------------ gate
  gear('POS', 'positron_accumulator', 'Positrons', ['H_HEAT'], 4, 18.5, {
    for: 'The &6Positron Accumulator&r collects antimatter in a trap and fills a cartridge.',
    needs: 'Its controller, UV machine casing and a UHV hull.',
    unlocks: 'Positron cartridges and, from them, antihydrogen.',
    automate: 'Cartridges leave by ME; never let a full trap sit unwatched.',
  }, [it(HULL), it(UVC)]),
  gear('CAS', 'casimir_array', 'Casimir', ['ANTIH'], 8, 18.5, {
    for: 'The &6Casimir Array&r holds plates a few nanometres apart and squeezes energy from the vacuum between them.',
    needs: 'Its controller, station truss casing and cryostat casing.',
    unlocks: 'Casimir cavity stacks for the warp gate.',
    automate: 'Plates by ME; the stacks leave by ME to the gate.',
  }, [it(TRUSS), it(CRYOSTAT)]),
  gear('M_GATE', 'warp_gate', 'The Warp Gate', ['G_CAS'], 20, 20.5, {
    for: 'The &6Warp Gate&r is the first door to another star: a 15x15 ring of casings round open air, 25x9x20 in all, with a coil band and six UHV mounts for the modulators.',
    needs: 'Its controller, warp gate casing, field ring casing and the 48 superconducting coils of the wall band, with station truss, fusion glass and tungsten steel frames for the berm. It is built twice: once in Earth orbit and once in orbit of Proxima b.',
    unlocks: 'The gate seed and the trip to Proxima b.',
    automate: 'Power and cavity stacks by ME; only the seed leaves.',
  }, [it(WARP), it(FIELD)], 160),
  prod('G_WIRE', 'Superconducting Wire', 'gtceu:magnesium_diboride_single_wire', ['CAS'], 8, 20.5,
    ['The ring is a magnet, and its wire is &6magnesium diboride&r: Mercury\'s magnesium mixed with boron, packed in an iron tube and drawn by the powder-in-tube line.', 'Braid it into cable in the Naquadria Magnet Works. Automate it with powder by ME and keep the draw line on its own bus.'],
    [it('gtceu:magnesium_diboride_dust'), it('gtceu:powder_in_tube_line'), it('gtceu:magnesium_diboride_single_wire'), it('grindless:mgb2_cable')], 100),
  prod('G_WIND', 'Winding the Coil', 'grindless:gate_coil_winding', ['G_WIRE'], 10, 20.5,
    ['The &6Naquadria Magnet Works&r winds the cable into a gate coil. The winding is still not a superconductor.', 'Keep the cable on a dedicated feed: a winding takes a lot of it.'],
    [it('gtceu:naquadria_magnet_works'), it('grindless:gate_coil_winding')], 100),
  prod('G_REACT', 'Reacting the Coil', 'grindless:reacted_gate_coil', ['G_WIND'], 12, 20.5,
    ['Heated at about 973 K in the electric blast furnace under argon, the powder reacts and the coil turns &6superconducting&r. It is brittle now.', 'Automate it with windings by ME and argon by pipe.'],
    [it('grindless:reacted_gate_coil')], 100),
  prod('G_IMP', 'Impregnated', 'grindless:impregnated_gate_coil', ['G_REACT'], 14, 20.5,
    ['The composite autoclave soaks the brittle coil in epoxy and cures it, so it can bear the field without cracking.', 'Epoxy comes by pipe and the cured coils leave by ME.'],
    [it('gtceu:composite_autoclave'), it('grindless:impregnated_gate_coil')], 100),
  prod('G_QUAL', 'Quench Test', 'grindless:qualified_gate_coil', ['G_IMP'], 16, 20.5,
    ['The Magnet Works cools the coil with helium and tests it at field. Only a &6qualified coil&r goes on; a failure goes back to be rewound.', 'Keep helium on a pipe and route failures back to the winding step.'],
    [it('grindless:qualified_gate_coil')], 100),
  prod('G_CAS', 'Warp Gate Casing', 'grindless:warp_gate_casing', ['G_QUAL'], 18, 20.5,
    ['The UHV assembler seats a qualified coil in a neutronium shell: one coil, four plates and a frame make two &6warp gate casings&r.', 'About 350 coils make a ring, so build the whole chain as one automated line.'],
    [it('grindless:warp_gate_casing')], 120),  prod('ANTIH', 'Antihydrogen', 'grindless:antihydrogen_cartridge', ['POS'], 6, 18.5,
    'A positron and an antiproton, held together long enough to make an atom. The &6Antihydrogen Cartridge&r holds a handful, and a small leak is expected: keep the cartridges sealed.',
    [it('grindless:antihydrogen_cartridge'), it('grindless:exotic_matter_cell')], 150),
  gear('ZBLAN', 'zblan_draw_tower', 'Glass from Orbit', ['H_CRYS'], 3.5, 10, {
    for: 'The &6ZBLAN Draw Tower&r pulls fluoride glass in microgravity, where it does not crystallise.',
    needs: 'Its controller and station truss casing.',
    unlocks: 'ZBLAN fibre, the lowest-loss optical fibre there is.',
    automate: 'Preforms by ME; the fibre spools out to a chest.',
  }, [it(TRUSS)]),
  prod('P_ZB', 'Fibre Without Loss', 'grindless:zblan_fibre', ['ZBLAN'], 5.5, 10,
    ['&6ZBLAN Fibre&r is a fluoride glass drawn in microgravity, where it cannot crystallise, so it is the lowest-loss optical fibre there is.', 'The ZBLAN draw tower pulls it from a preform on the station. It is the light path of the photonic circuit stack and of the optical links of the ages after this. Automate it with preforms by ME and a chest on the spool.'],
    [it('grindless:zblan_fibre')]),

  // ------------------------------------------------------------------ mercury
  gear('GROUND', 'regolith_excavator', "Mercury's Ground", ['H_MERCURY'], 8.5, -30.5, {
    for: 'The &6Regolith Excavator&r scrapes the surface of Mercury for dust and heat-baked rock.',
    needs: 'Its controller, heatproof machine casing and station truss casing.',
    unlocks: 'Mercury regolith for the vapour furnace.',
    automate: 'Dust leaves by ME; keep the bay cooled.',
  }, [it(HEATP), it(TRUSS)]),
  prod('P_REG', 'Mercury Dust', 'grindless:mercury_regolith', ['GROUND'], 8.5, -29,
    '&6Mercury Regolith&r is the first thing we take from the inner system.',
    [it('grindless:mercury_regolith')]),
  gear('SOLVAP', 'solar_vapour_furnace', 'Vaporised by the Sun', ['GROUND'], 10.5, -30.5, {
    for: 'The &6Solar Vapour Furnace&r uses concentrated sunlight to boil regolith into its metals.',
    needs: 'Its controller, heatproof casing and station truss casing.',
    unlocks: 'Metals for swarm segments, free of fuel.',
    automate: 'Feed by ME; the heat is free but the mirrors need care.',
  }, [it(HEATP), it(TRUSS)]),
  gear('SEG', 'swarm_segment_foundry', 'Segments', ['SOLVAP'], 12.5, -30.5, {
    for: 'The &6Swarm Segment Foundry&r builds the panels of a star-powered swarm.',
    needs: 'Its controller, station truss casing and a UHV hull.',
    unlocks: 'Swarm segments, built from films, arrays, a laser, a spreader, a power module and cells. The whole swarm is one line, from Mercury regolith to the segment.',
    automate: 'Films, arrays and cells by ME; segments go to the control station and worn ones come back.'
  }, [it(HULL), it(TRUSS)]),
  prod('P_SEG', 'A Swarm Segment', 'grindless:swarm_segment', ['SEG'], 12.5, -29,
    ['A &6Swarm Segment&r is one mirror-and-collector panel of the thousands that make a star-powered swarm.', 'The foundry builds it from Mercury metals and a UHV hull. The control station needs a steady stream of them to steer the swarm and collect its power, which UEV asks for. Automate it with metals by ME and send segments straight to the station.'],
    [it('grindless:swarm_segment')]),
  gear('M_SWARM', 'swarm_control_station', 'Swarm Control Station', ['SEG'], 14.5, -30.5, {
    for: 'The &6Swarm Control Station&r steers the segments and collects their power.',
    needs: 'Its controller, station truss casing and a UHV hull.',
    unlocks: 'Stellar power for UHV and the coronal map.',
    automate: 'Segments by ME; the station needs a steady stream.',
  }, [it(HULL), it(TRUSS)], 160),
  gear('M_PROBE', 'solar_probe_bay', 'Solar Probe Bay', ['M_SWARM'], 16.5, -30.5, {
    for: 'The &6Solar Probe Bay&r launches probes into the corona to map its field.',
    needs: 'Its controller, heatproof casing and station truss casing.',
    unlocks: 'The coronal field map for the Kardashev goal.',
    automate: 'Probes by ME; maps leave by ME.',
  }, [it(HEATP), it(TRUSS)]),
  prod('P_PROBE', 'A Probe in the Corona', 'grindless:solar_probe', ['M_PROBE'], 18.5, -30.5,
    ['A &6Solar Probe&r survives where nothing else does: it flies through the corona and measures the field of the Sun\'s outer atmosphere.', 'The solar probe bay builds it from heat-shielded parts, and the swarm control station guides it. The returned &6Coronal Field Map&r is part of the Gate to UEV. Automate it with probes by ME, and let the maps leave by ME.'],
    [it('grindless:solar_probe'), it('grindless:coronal_field_map')]),

  // ------------------------------------------------------------------ proxima b
  gear('SAMPLE', 'sample_receiving_facility', 'Sample Receiving', ['H_ISO'], 3, 3, {
    for: 'The &6Sample Receiving Facility&r opens canisters from another world in a sealed, level-four lab.',
    needs: 'Its controller and the sealed-lab &6BSL-4&r walls.',
    unlocks: 'Safe handling of every alien sample.',
    automate: 'Canisters by ME; nothing leaves unsterilised.',
  }, [it(BSL4)]),
  prod('P_SAMP', 'A Canister Opened', 'grindless:sample_canister', ['SAMPLE'], 5, 3,
    ['A &6Sample Canister&r holds rock and soil from another world and is the proof that the trip worked. It is opened only in a sealed lab.', 'The sample receiving facility opens it behind BSL-4 walls and sorts what it holds. Those samples feed the surface machines on Proxima b and the life rows of UEV. Automate it with canisters by ME and keep nothing unsterilised outside the lab.'],
    [it('grindless:sample_canister')]),
  gear('ROVER', 'xenoflora_rover_bay', 'Rover', ['H_PROXIMA'], 19.5, -27.5, {
    for: 'The &6Xenoflora Rover Bay&r builds and sends rovers across the surface of Proxima b.',
    needs: 'Its controller, hangar casing and Proxima base casing.',
    unlocks: 'Flora samples from the red-lit surface.',
    automate: 'Rovers return by ME with their samples.',
  }, [it(HANGAR), it(BASEC)]),
  gear('XBOT', 'xenobotany_greenhouse', 'Under Glass', ['ROVER'], 21.5, -27.5, {
    for: 'The &6Xenobotany Greenhouse&r grows alien plants under red light.',
    needs: 'Its controller, Proxima base casing and filter casing.',
    unlocks: 'Xeno biomass and mushrooms.',
    automate: 'Samples by ME; harvest to the chemistry plant.',
  }, [it(BASEC), it(FILTER)]),
  gear('XBIO', 'xenobiochem_plant', 'Xenobiochemistry', ['XBOT'], 23.5, -27.5, {
    for: 'The &6Xenobiochem Plant&r refines alien biomass into pigments and radioprotectants.',
    needs: 'Its controller, Proxima base casing and PTFE pipe casing.',
    unlocks: 'Chitin from the mushrooms, then chitosan and the freeze-cast scaffold that carries organoids, mixed with melanin into the flare shield. Also radioprotectant and the far-red algae. It is portable processing, so it works on any base.',
    automate: 'Biomass by ME; pipe the chitosan on and send scaffolds home.',
  }, [it(BASEC), it(PTFE), it('grindless:xeno_chitin'), it('grindless:xeno_chitosan'), it('grindless:chitosan_scaffold')]),
  gear('FUNGI', 'radiotrophic_vat', 'Black Fungi', ['XBIO'], 25.5, -27.5, {
    for: 'The &6Radiotrophic Vat&r feeds fungi on radiation instead of light.',
    needs: 'Its controller, Proxima base casing and radiation-proof casing.',
    unlocks: 'Melanised biomass for shielding.',
    automate: 'Fungus cultures by ME; keep the radiation source inside.',
  }, [it(BASEC), it(SHIELD)]),
  gear('M_ASTRO', 'baseline_astrometer', 'Baseline Astrometer', ['H_PROXIMA'], 19.5, -25.5, {
    for: 'The &6Baseline Astrometer&r measures the sky from two stars at once.',
    needs: 'Its controller, Proxima base casing and clean machine casing.',
    unlocks: 'The survey that points toward the next gate.',
    automate: 'Surveys leave by ME.',
  }, [it(BASEC), it(CLEAN)]),
  prod('P_BASE', 'A Survey of Proxima b', 'grindless:proxima_regolith_survey', ['M_ASTRO'], 21.5, -25.5,
    'The &6Regolith Survey&r tells us what lies under the red sun.',
    [it('grindless:proxima_regolith_survey')]),
  gear('ICE', 'cold_trap_drill', 'Night-Side Ice', ['H_PROXIMA'], 19.5, -23.5, {
    for: 'The &6Cold Trap Drill&r cores ice from the night side of Proxima b.',
    needs: 'Its controller, Proxima base casing and cryostat casing.',
    unlocks: 'Ice cores for water and biomining.',
    automate: 'Cores leave by ME.',
  }, [it(BASEC), it(CRYOSTAT)]),
  gear('BIOM', 'biomining_heap', 'Biomining', ['ICE'], 21.5, -23.5, {
    for: 'The &6Biomining Heap&r lets bacteria dissolve metals from regolith, slowly.',
    needs: 'Its controller, Proxima base casing and PTFE pipe casing.',
    unlocks: 'Biocemented regolith and melanin-chitosan composite.',
    automate: 'Regolith by ME; bacteria cultures stay inside.',
  }, [it(BASEC), it(PTFE)]),
  prod('BRICK', 'Bricks by Bacteria', 'grindless:biocemented_regolith', ['BIOM'], 23.5, -23.5,
    'Bacteria that precipitate calcite glue regolith into a hard block. &6Biocemented Regolith&r builds a base without importing a single brick.',
    [it('grindless:biocemented_regolith'), it('grindless:melanin_chitosan_composite')], 100),
  prod('FAR', 'Far-Red', 'grindless:engineered_far_red_algae', ['FUNGI'], 27.5, -27.5,
    'Chlorophyll cannot use far-red light, but one cyanobacterium can. Its gene cassette goes into an algae that feeds on a red sun.',
    [it('grindless:far_red_gene_cassette'), it('grindless:engineered_far_red_algae')], 150),
  prod('RED', 'Under a Red Sun', 'grindless:proxima_flora_sample', ['ROVER'], 21.5, -29,
    'Plants under a red sun are black, to take every photon they can. A &6Proxima Flora Sample&r and a &6Regolith Survey&r go to the &6Sample Receiving Facility&r.',
    [it('grindless:proxima_flora_sample'), it('grindless:proxima_regolith_survey')], 150),
  prod('CLIMB', 'Climber', 'grindless:tether_climber', ['RIB'], 8, 15,
    'The &6Tether Climber&r grips the ribbon and rides it up. Its wheels wear, so refurbish them.',
    [it('grindless:tether_climber')], 100),
  {
    key: 'H_PROXIMA', kind: 'reading', title: 'Work on Proxima b', icon: 'gtceu:xenoflora_rover_bay',
    deps: ['STN8'], x: 16.5, y: -24.5,
    desc: [
      'Everything that runs on the new world.',
      'The rover and the glass houses, the baseline survey, the night-side ice and the first link to the network.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
  {
    key: 'H_MERCURY', kind: 'reading', title: 'Work Near the Sun', icon: 'gtceu:regolith_excavator',
    deps: ['STN7'], x: 5.5, y: -27,
    desc: [
      'Mercury and the swarm.',
      'The ground, the sunlit vaporiser, the segments and the corona probe, with their link to the network.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
  {
    key: 'H_CRYS', kind: 'reading', title: 'Crystals and Light', icon: 'gtceu:crystal_growth_furnace',
    deps: ['H_ISO'], x: 0.5, y: 9.75,
    desc: [
      'Crystals, solar cells, fibre and living processors.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
  {
    key: 'H_HEAT', kind: 'reading', title: 'Heat and Antimatter', icon: 'gtceu:pbo_plant',
    deps: ['H_CRYS'], x: 1, y: 17.5,
    desc: [
      'Tiles for reentry, ribbons and the antihydrogen line.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
];
