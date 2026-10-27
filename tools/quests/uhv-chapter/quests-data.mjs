// Quest data for uhv_age ("UHV: Proxima and the Swarm"); gen.mjs in this folder writes the chapter (docs/quests.md, sections 8 and 14;
// docs/eras/uhv.md, "Quests"). Ids come from the keys: never rename a key once a quest has shipped.
// Positions: columns every 2. Home is the left half, in lanes off START: isotopes above, then light, power devices and water, life,
// materials and antimatter below. The right half leaves home: Mercury and the Swarm on the upper rows, Proxima b on the lower
// rows, and the chapter closes with the stellar neighbourhood chart and the Gate to UEV.
// Every UHV package has landed, so there is no package gating here. Rewards stay small and no quest blocks a recipe.
const it = (item, count) => ({ type: 'item', item, count });
const dim = (dimension) => ({ type: 'dimension', dimension });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });
// a machine quest: gear shape, 1.25
const M = (key, title, icon, deps, x, y, desc, tasks, reward = 100, extra = {}) => ({
  key, title, icon, shape: 'gear', size: 1.25, deps, x, y, desc, tasks, rewards: [xp(reward)], ...extra,
});
// a product quest: default shape
const P = (key, title, icon, deps, x, y, desc, tasks, reward = 100, extra = {}) => ({
  key, title, icon, deps, x, y, desc, tasks, rewards: [xp(reward)], ...extra,
});

export const CHAPTER = {
  group: '3F021F40CD26BF57',
  order: 9,
  icon: 'grindless:stellar_neighbourhood_chart',
  autofocus: 'START',
  title: 'UHV: Proxima and the Swarm',
  subtitle: ['Heavier isotopes, light and silicon carbide at home, a swarm of mirrors round Mercury, then a gate to the star next door.'],
};

export const QUESTS = [
  P('START', 'Proxima and Beyond', 'grindless:proxima_approach_data', ['X:183EEB9BF7A06AC5'], 0, 0, [
    'The &6Proxima Approach Data&r says the nearest star has a rocky planet in its habitable zone. The &6Heavy Curium Oxide&r in store is what the next isotopes start from.',
    'Home first: heavier isotopes, light and silicon carbide. Then Mercury, and a gate.',
  ], [it('grindless:proxima_approach_data'), it('grindless:heavy_curium_oxide')], 50, { shape: 'rsquare', size: 1.5 }),

  // ------------------------------------------------------------------ isotopes
  M('HFR', 'High Flux', 'gtceu:high_flux_reactor', ['START'], 2, -4, [
    'The &6High Flux Reactor&r is a small, dense core with a very high neutron flux, cooled by a heavy water loop. Targets go in, and a driver element keeps the flux up.',
  ], [it('gtceu:high_flux_reactor'), it('grindless:hfir_driver_element')], 120),
  M('BK', 'Berkelium', 'gtceu:transuranium_facility', ['HFR'], 4, -4, [
    'Curium targets soaked in neutrons become heavier elements. The &6Transuranium Facility&r separates the liquor and hands you &6Berkelium-249&r, with the fission products set apart and the solvent cleaned for the next run.',
  ], [it('gtceu:transuranium_facility'), it('grindless:berkelium_249')], 120),
  P('CF', 'A Californium Source', 'grindless:californium_252_source', ['BK'], 6, -4, [
    'One more neutron capture and berkelium becomes &6Californium-252&r, a source that emits neutrons by itself. It starts the reactors that cannot start alone.',
  ], [it('grindless:californium_252'), it('grindless:californium_252_source')], 120),
  P('DRV', 'Back to the Driver', 'grindless:spent_hfir_driver_element', ['HFR'], 4, -2, [
    'A spent driver element is not waste: it holds &6uranium-233&r bred in the flux. Reprocess it and a fresh driver goes back in the reactor.',
  ], [it('grindless:spent_hfir_driver_element')], 100),
  P('TH229', 'Thorium-229', 'grindless:thorium_229', ['CF'], 8, -4, [
    'A trace of &6thorium-229&r comes out of the uranium-233 line. It is rare, and it has the lowest nuclear excited state known.',
  ], [it('grindless:thorium_229')], 120),
  M('CLOCK', 'A Clock in a Nucleus', 'gtceu:nuclear_clock_lab', ['TH229'], 10, -4, [
    'Thorium-229 changes state with a vacuum-ultraviolet photon, and a crystal that holds it keeps time better than any electron can. The &6Nuclear Clock Lab&r builds the &6Nuclear Clock&r that the wireless network syncs to.',
  ], [it('gtceu:nuclear_clock_lab'), it('grindless:nuclear_clock')], 150),
  P('NI63', 'Nickel-63', 'grindless:nickel_63_target', ['DRV'], 6, -2, [
    'Irradiate a nickel-62 target and it turns into &6nickel-63&r, a pure beta emitter that is safe behind a thin shield and decays for a century.',
  ], [it('grindless:nickel_62_target'), it('grindless:nickel_63_target')], 100),
  M('BETA', 'Fifty Years of Current', 'gtceu:betavoltaic_fab', ['NI63'], 8, -2, [
    'A &6Betavoltaic Cell&r turns decay electrons into a small, steady current in a diamond. It outlasts any battery, and the nickel plating is recovered when the cell is worn.',
  ], [it('gtceu:betavoltaic_fab'), it('grindless:betavoltaic_cell')], 120),

  // ------------------------------------------------------------------ light
  M('LN', 'Lithium Niobate', 'gtceu:crystal_growth_furnace', ['START'], 2, 2, [
    'The &6Crystal Growth Furnace&r pulls a &6Lithium Niobate&r boule out of a melt, slowly, in a crucible that is reused. It bends light with an electric field.',
  ], [it('gtceu:crystal_growth_furnace'), it('grindless:lithium_niobate_wafer')], 100),
  M('PCM', 'Phase Change', 'gtceu:photonic_foundry', ['LN'], 4, 2, [
    'The &6Photonic Foundry&r sputters a chalcogenide film that flips between glass and crystal when a laser says so. Light holds a bit, and a &6Photonic Die&r is born.',
  ], [it('gtceu:photonic_foundry'), it('grindless:pcm_photonic_die')], 120),
  P('EUY', 'Memory of Light', 'grindless:eu_yso_boule', ['LN'], 4, 4, [
    'Europium in an yttrium crystal stores the state of a photon for hours. It makes a &6Quantum Memory Chip&r.',
  ], [it('grindless:eu_yso_boule'), it('grindless:quantum_memory_chip')], 120),
  P('VUV', 'Vacuum Ultraviolet', 'grindless:vuv_frequency_comb', ['EUY'], 6, 4, [
    'The thorium crystal needs light no glass lets through. Fluoride optics and a &6VUV Frequency Comb&r make it, a ruler of light for the clock.',
  ], [it('grindless:vuv_caf2_boule'), it('grindless:vuv_frequency_comb')], 120),
  P('QCL', 'Cascade', 'grindless:quantum_cascade_laser', ['PCM'], 6, 2, [
    'An electron falls down a staircase of thin layers and gives up a photon at every step. The &6Quantum Cascade Laser&r is built from those layers on an indium phosphide wafer.',
  ], [it('grindless:inp_wafer'), it('grindless:quantum_cascade_laser')], 120),
  P('OPT', 'Optical Processor', 'grindless:thin_film_ln_modulator', ['QCL', 'VUV'], 8, 2, [
    'A thin-film modulator, a laser and a memory chip make a processor that thinks in light and runs cold.',
  ], [it('grindless:thin_film_ln_modulator')], 120),
  M('ZBLAN', 'Glass from Orbit', 'gtceu:zblan_draw_tower', ['OPT'], 10, 2, [
    'ZBLAN fluoride glass is clearest of all, but it crystallises under gravity. The &6ZBLAN Draw Tower&r pulls it in microgravity, and the broken fibre goes back in the melt.',
  ], [it('gtceu:zblan_draw_tower'), it('grindless:zblan_fibre')], 150),

  // ------------------------------------------------------------------ power devices and water
  M('SIC', 'Silicon Carbide', 'gtceu:sic_device_fab', ['WATER'], 2, 6, [
    'Silicon carbide takes more heat and more volts than silicon. The &6SiC Device Fab&r grows the boule, cuts and implants the wafer, and finishes it as a &6SiC Power Module&r.',
  ], [it('gtceu:sic_device_fab'), it('grindless:sic_power_module')], 120),
  M('IMM', 'Inverted Cells', 'gtceu:solar_array_fab', ['SIC'], 4, 6, [
    'An inverted metamorphic cell stacks junctions so every colour of light gets its own layer. The &6Solar Array Fab&r makes the array a swarm segment is built from.',
  ], [it('gtceu:solar_array_fab'), it('grindless:imm_solar_array')], 120),
  M('WATER', 'Eighteen Megohms', 'gtceu:ultrapure_water_plant', ['LN'], 2, 4, [
    'Water this clean barely conducts: eighteen megohm-centimetres. The &6Ultrapure Water Plant&r polishes it for the fabs that cannot take a single ion.',
  ], [it('gtceu:ultrapure_water_plant')], 100),

  // ------------------------------------------------------------------ life at home
  M('ORG', 'Organoids', 'gtceu:organoid_array', ['HFR'], 2, -6, [
    'The &6Organoid Array&r grows neural tissue on a scaffold and keeps it fed from the Ark. The tissue is the start of a processor that learns.',
  ], [it('gtceu:organoid_array'), it('grindless:organoid_processor')], 120),
  P('MAIN', 'Four Mainframes', 'grindless:organoid_processor', ['ORG'], 4, -6, [
    'Four organoid processors make a mainframe, and every UHV machine needs one.',
  ], [it('grindless:organoid_processor', 4)], 100),
  P('PLAN', 'Planetary Protection', 'grindless:bsl4_casing', ['MAIN'], 6, -6, [
    'Nothing that lived on another world may reach Earth. The biosafety casing seals the labs that handle samples, and everything that touches them is sterilised first.',
  ], [it('grindless:bsl4_casing')], 100),

  // ------------------------------------------------------------------ materials
  M('PBO', 'PBO', 'gtceu:pbo_plant', ['SIC'], 2, 8, [
    'PBO polymer is stronger than steel by weight. The &6PBO Plant&r spins it into fibre, and the phosphoric acid it needs is recycled.',
  ], [it('gtceu:pbo_plant'), it('grindless:pbo_fibre')], 100),
  M('RIB', 'Ribbon', 'gtceu:tether_ribbon_works', ['PBO'], 4, 8, [
    'Weave PBO fibre and a ribbon appears that is long enough to reach geostationary orbit. The &6Tether Ribbon Works&r makes the segments.',
  ], [it('gtceu:tether_ribbon_works'), it('grindless:tether_ribbon_segment')], 120),
  P('CLIMB', 'Climber', 'grindless:tether_climber', ['RIB'], 6, 8, [
    'The &6Tether Climber&r grips the ribbon and rides it up. Its wheels wear, so refurbish them.',
  ], [it('grindless:tether_climber')], 100),
  M('ELEV', 'Up the Elevator', 'gtca:space_elevator', ['CLIMB'], 8, 8, [
    'The &6Space Elevator&r is the tallest structure you will build: a base, a cable and a lift to the stations. Payload goes up without a single rocket.',
  ], [it('gtca:space_elevator')], 200, { size: 1.5 }),
  M('UHTC', 'Three Thousand Degrees', 'gtceu:spark_plasma_sinterer', ['PBO'], 2, 10, [
    'Zirconium diboride melts above three thousand degrees. The &6Spark Plasma Sinterer&r presses its powder into &6UHTC Tiles&r in seconds, and a nozzle that can survive a rocket.',
  ], [it('gtceu:spark_plasma_sinterer'), it('grindless:uhtc_tile')], 120),
  P('ICAN', 'ICAN', 'grindless:ican_rocket_motor', ['UHTC', 'CLIMB'], 6, 10, [
    'An antimatter-catalysed fission motor in a &6UHTC Nozzle&r: the &6ICAN Rocket Motor&r. It is the strongest engine you can fly to the next star.',
  ], [it('grindless:uhtc_nozzle'), it('grindless:ican_rocket_motor')], 150),
  P('LVL8', 'Level Eight', 'gtceu:uhv_machine_hull', ['ELEV'], 10, 8, [
    'The elevator reaches the eighth station level. From here, UHV machines can be carried to orbit with the payload.',
  ], [ck()], 50),

  // ------------------------------------------------------------------ antimatter and the gate
  M('POS', 'Positrons', 'gtceu:positron_accumulator', ['IMM'], 6, 6, [
    'Sodium-22 decays and sheds positrons. The &6Positron Accumulator&r moderates them and keeps them in a trap until a cartridge is full.',
  ], [it('gtceu:positron_accumulator'), it('grindless:positron_cartridge')], 120),
  P('ANTIH', 'Antihydrogen', 'grindless:antihydrogen_cartridge', ['POS'], 8, 6, [
    'A positron and an antiproton, held together long enough to make an atom. The &6Antihydrogen Cartridge&r holds a handful, and a small leak is expected: keep the cartridges sealed.',
  ], [it('grindless:antihydrogen_cartridge'), it('grindless:exotic_matter_cell')], 150),
  M('CAS', 'Casimir', 'gtceu:casimir_array', ['ANTIH'], 10, 6, [
    'Two plates a few nanometres apart feel a force from the vacuum. The &6Casimir Array&r stacks cavities like that and tunes them until a pinch of &6Exotic Matter&r comes out.',
    'This is fiction: the Casimir force is real but tiny, and nobody has made negative energy density from it. Here it is the only way to hold a gate open, so the machine is an extrapolation and not physics.',
  ], [it('gtceu:casimir_array'), it('grindless:casimir_cavity_stack')], 200),
  M('GATEOPEN', 'The Gate Opens', 'gtceu:warp_gate', ['CAS'], 12, 6, [
    'The &6Warp Gate&r is a ring of casing, fifteen blocks wide, built on both ends: in Earth orbit and in Proxima b orbit. A first run with exotic matter and antihydrogen opens it, and a second holds it a minute at sixteen amps.',
    'The shells come back after each run.',
  ], [it('gtceu:warp_gate'), it('grindless:warp_gate_casing')], 250, { size: 1.5 }),
  P('STEP', 'Step Through', 'grindless:proxima_gate_seed', ['GATEOPEN'], 14, 6, [
    'Players cross only while both ends hold. Items go by the AE2 pair the &6Proxima Gate Seed&r creates, so a stack of plates never needs a person to carry it.',
  ], [it('grindless:proxima_gate_seed')], 200),

  // ------------------------------------------------------------------ Mercury and the Swarm
  P('STN7', 'Seventh Station', 'gtceu:uhv_machine_hull', ['CLOCK'], 12, -4, [
    'The seventh station orbits Mercury, close enough to the Sun that the heat tells the first mirror what it will be.',
  ], [dim('gcyr:mercury_orbit')], 120, { size: 1.25 }),
  M('GROUND', "Mercury's Ground", 'gtceu:regolith_excavator', ['STN7'], 14, -4, [
    'The &6Regolith Excavator&r digs the surface of Mercury. Tailings are kept for the chemistry that wants them, never dumped.',
  ], [dim('gcyr:mercury'), it('gtceu:regolith_excavator')], 120),
  M('SOLVAP', 'Vaporised by the Sun', 'gtceu:solar_vapour_furnace', ['GROUND'], 16, -4, [
    'The &6Solar Vapour Furnace&r uses sunlight focused on regolith, and the vapour condenses into thin films of metal. The sun is the only heat source it needs.',
  ], [it('gtceu:solar_vapour_furnace')], 120),
  M('SEG', 'Segments', 'gtceu:swarm_segment_foundry', ['SOLVAP'], 18, -4, [
    'A segment is a mirror, a solar array and a little control, folded and launched. The &6Swarm Segment Foundry&r builds them, and worn ones return as scrap for the next batch.',
  ], [it('gtceu:swarm_segment_foundry'), it('grindless:swarm_segment')], 150),
  M('SWARM', 'The Swarm', 'gtceu:swarm_control_station', ['SEG'], 20, -4, [
    'The &6Swarm Control Station&r steers a cloud of segments around the Sun and sends the power as a beam. Two control stations feed the bank, and the bank loses five percent on the way.',
  ], [it('gtceu:swarm_control_station')], 200, { size: 1.5 }),
  M('CORONA', 'Coronal Map', 'gtceu:solar_probe_bay', ['SWARM'], 22, -4, [
    'A probe that dips into the corona returns the field map the swarm needs to point itself.',
  ], [it('gtceu:solar_probe_bay'), it('grindless:coronal_field_map')], 150),
  P('KARD', 'Kardashev II', 'gtceu:swarm_control_station', ['CORONA'], 24, -4, [
    'A civilisation that uses all of the power of its star is a type II on the Kardashev scale. You have a swarm, so you are on the way.',
  ], [ck()], 100),
  P('NOBLE', 'Noble Thrust', 'grindless:oganesson_propellant_pod', ['SEG'], 20, -6, [
    'Oganesson is the heaviest noble gas, and the best propellant a thruster could ask for. The &6Oganesson Propellant Pod&r packs it for the ICAN motor.',
    'Real oganesson lives for milliseconds and only a few atoms have ever been made. Here GregTech Modern treats it as a stable gas, and that is the fiction this pack runs on: do not expect the real thing.',
  ], [it('grindless:oganesson_propellant_pod')], 200),

  // ------------------------------------------------------------------ Proxima b
  P('STN8', 'Eighth Station', 'gtceu:uhv_machine_hull', ['STEP'], 16, 6, [
    'The gate lands you in orbit round Proxima b. Build the eighth station here and the rest of the system opens up.',
  ], [dim('grindless:proxima_b_orbit')], 150, { size: 1.25 }),
  P('LAND', 'Landing on Proxima b', 'grindless:proxima_base_casing', ['STN8'], 18, 6, [
    'The planet is tidally locked: one face in endless red light, one in endless night. Set down a base on the lit side and bring the &6Proxima Base Casing&r.',
  ], [dim('gcyr:proxima_centauri_b'), it('grindless:proxima_base_casing')], 150),
  M('ROVER', 'Rover', 'gtceu:xenoflora_rover_bay', ['LAND'], 20, 6, [
    'The &6Xenoflora Rover Bay&r sends a rover over the terminator for samples. The rover comes back, and it is cleaned before it is sent again.',
  ], [it('gtceu:xenoflora_rover_bay'), it('grindless:proxima_rover')], 120),
  P('RED', 'Under a Red Sun', 'grindless:proxima_flora_sample', ['ROVER'], 22, 6, [
    'Plants under a red sun are black, to take every photon they can. A &6Proxima Flora Sample&r and a &6Regolith Survey&r go to the &6Sample Receiving Facility&r.',
  ], [it('gtceu:sample_receiving_facility'), it('grindless:proxima_flora_sample'), it('grindless:proxima_regolith_survey')], 150),
  M('XBIO', 'Xenobiochemistry', 'gtceu:xenobiochem_plant', ['RED'], 24, 6, [
    'The &6Xenobiochem Plant&r sorts the molecules of another biosphere: its sugars, its pigments and its genes. What it learns goes into the &6Xeno Genome Data&r.',
  ], [it('gtceu:xenobiochem_plant'), it('grindless:xeno_genome_data')], 150),
  M('ICE', 'Night-Side Ice', 'gtceu:cold_trap_drill', ['LAND'], 18, 8, [
    'On the dark face water ice has sat since the planet formed. The &6Cold Trap Drill&r takes &6Ice Cores&r, and the regolith left over goes to the biomining heap.',
  ], [it('gtceu:cold_trap_drill'), it('grindless:proxima_ice_core')], 120),
  M('FUNGI', 'Black Fungi', 'gtceu:radiotrophic_vat', ['XBIO'], 26, 6, [
    'Some fungi on Earth eat radiation, and they are black with melanin. The &6Radiotrophic Vat&r grows them on the planet\'s flare-washed soil, and the melanin shields everything else.',
  ], [it('gtceu:radiotrophic_vat'), it('grindless:melanin_extract')], 150),
  M('BIOM', 'Biomining', 'gtceu:biomining_heap', ['ICE'], 20, 8, [
    'Bacteria dissolve a heap of regolith and give up its platinum group metals and rare earths in a liquor, with no cyanide and no acid pit.',
  ], [it('gtceu:biomining_heap'), it('grindless:cold_trap_regolith')], 150),
  P('BRICK', 'Bricks by Bacteria', 'grindless:biocemented_regolith', ['BIOM'], 22, 8, [
    'Bacteria that precipitate calcite glue regolith into a hard block. &6Biocemented Regolith&r builds a base without importing a single brick.',
  ], [it('grindless:biocemented_regolith')], 100),
  P('FAR', 'Far-Red', 'grindless:engineered_far_red_algae', ['FUNGI'], 28, 6, [
    'Chlorophyll cannot use far-red light, but one cyanobacterium can. Its gene cassette goes into an algae that feeds on a red sun.',
  ], [it('grindless:far_red_gene_cassette'), it('grindless:engineered_far_red_algae')], 150),
  M('BASE', 'Four Light Years of Baseline', 'gtceu:baseline_astrometer', ['LAND'], 20, 4, [
    'Measure a star from two places and its distance falls out. The &6Baseline Astrometer&r on Proxima b orbit has four light years of baseline to the telescopes at home, and it charts the neighbourhood.',
  ], [it('gtceu:baseline_astrometer'), it('grindless:stellar_neighbourhood_chart')], 200),

  // ------------------------------------------------------------------ the network
  P('RTAN', 'RTAN', 'gtceu:platinum_plant', ['BIOM'], 22, 10, [
    'The &6Platinum Plant&r turns the biomining liquor into salts, and the ruthenium and iridium become the alloy that carries the highest currents yet: RTAN wire.',
  ], [it('gtceu:platinum_plant')], 120),
  M('CELL', 'The UHV Cell', 'grindless:uhv_smes_cell', ['CLOCK'], 12, -2, [
    'The &6UHV SMES Cell&r holds as much as twenty-four UV naquadria batteries, about sixty-three billion EU, and the nuclear clock keeps it in step with the network.',
  ], [it('gtceu:naquadria_magnet_works'), it('grindless:uhv_smes_cell')], 200),
  P('NETUHV', 'The Network Goes UHV', 'gtceu:uhv_wireless_energy_hatch', ['CELL'], 14, -2, [
    'Move your towers onto &6UHV SMES Cells&r and the wireless network carries UHV, out to the stations and now to Mercury and Proxima.',
  ], [it('gtceu:uhv_wireless_energy_hatch')], 200),

  // ------------------------------------------------------------------ exit
  P('GATE', 'Gate to UEV', 'gtceu:uev_machine_hull', ['BASE'], 22, 4, [
    'The &6Stellar Neighbourhood Chart&r is the research for the UEV machine casing, and the hull comes with it. Keep the gate and the swarm running.',
  ], [it('gtceu:uev_machine_hull'), it('grindless:stellar_neighbourhood_chart'), it('grindless:coronal_field_map')], 300,
  { shape: 'diamond', size: 1.75 }),
];
