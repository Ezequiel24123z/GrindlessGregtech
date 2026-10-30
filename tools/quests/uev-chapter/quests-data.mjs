// Quest data for uev_age ("UEV - Several Stars"); gen.mjs in this folder writes the chapter (docs/quests.md, sections 8 and 14;
// docs/eras/uev.md, "Quests"). Ids come from the keys: never rename a key once a quest has shipped.
// Positions: START and a short spine (parts, hatches, the Mk1 drive) run along y = 0. Four home lanes leave START: superheavy
// elements and pressure above, light and Mk4 fusion below. The Mk1 drive then forks to Alpha Centauri (upper) and Barnard b
// (lower) side by side, they meet in the Mk2 drive, and the chapter runs on to Sirius B and the warp gate.
// Every UEV package has landed, so there is no package gating here. Rewards stay small and no quest blocks a recipe.
const it = (item, count) => ({ type: 'item', item, count });
const dim = (dimension) => ({ type: 'dimension', dimension });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });
const ri = (item, count) => ({ type: 'item', item, count });
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
  order: 10,
  icon: 'gtceu:uev_machine_casing',
  autofocus: 'START',
  title: 'UEV - Several Stars',
  subtitle: ['The heaviest elements, a megabar of pressure and a first light at home, then Alpha Centauri, Barnard b and a white dwarf, and a gate held open.'],
};

export const QUESTS = [
  P('START', 'Several Stars', 'gtceu:uev_machine_hull', ['X:7C44999E6D4544D4'], 0, 0, [
    'The &6Stellar Neighbourhood Chart&r gave you the &6UEV Machine Hull&r. One star is not enough now: three more are within reach of a drive.',
    'Home first: isotopes, pressure, light and a new fusion reactor. Then Alpha Centauri and Barnard b, and last a white dwarf.',
  ], [it('gtceu:uev_machine_hull'), it('grindless:stellar_neighbourhood_chart')], 50, { shape: 'rsquare', size: 1.5 }),
  P('PARTS', 'UEV Parts', 'gtceu:uev_emitter', ['START'], 3, 0, [
    'The &6UEV Emitter&r, &6Sensor&r and &6Field Generator&r are built from what the UHV era left in store. The motor waits for iron from another star.',
  ], [it('gtceu:uev_emitter'), it('gtceu:uev_sensor'), it('gtceu:uev_field_generator')], 100),
  P('HATCH', 'UEV Hatches', 'gtceu:uev_energy_input_hatch', ['PARTS'], 6, 0, [
    'The &6UEV Energy Hatch&r takes the power of a whole swarm. The wireless hatches wait for a quantum link, later in the chapter.',
  ], [it('gtceu:uev_energy_input_hatch')], 100),
  P('PARH', 'Parallel Control', 'gtceu:uev_parallel_hatch', ['HATCH'], 8.5, -0.5, [
    'The &6Ultimate Parallel Control Hatch&r lets a mega machine run up to 4,096 copies of a recipe at once. Energy is still the limit: every copy pays its own EU/t.',
  ], [it('gtceu:uev_parallel_hatch')], 150),
  P('MK1', 'Drive Mk1', 'grindless:dfd_mk1_motor', ['HATCH'], 11, 0, [
    'The &6DFD Mk1 Motor&r is made at home: its antenna is a UEV emitter. It carries a level 9 rocket to the next star, and needs nothing from abroad.',
  ], [it('grindless:dfd_mk1_motor')], 150),

  // ------------------------------------------------------------------ superheavy
  M('CAL', 'Separate the Isotopes', 'gtceu:calutron', ['START'], 2, -4, [
    'The &6Calutron&r bends a beam of ions in a magnet, and each isotope lands in its own cup. The first prize is &6calcium-48&r, rare in nature and the bullet of every superheavy run.',
  ], [it('gtceu:calutron'), it('gtceu:calcium_48_dust')], 150),
  P('PU', 'Plutonium-244', 'gtceu:plutonium_244_dust', ['CAL'], 4, -4, [
    'The same magnet pulls &6plutonium-244&r out of the feed, and &6lithium-6&r and &6potassium-40&r with it. The tailings go back to the feed.',
  ], [it('gtceu:plutonium_244_dust'), it('gtceu:lithium_6_dust'), it('gtceu:potassium_40_dust')], 100),
  M('HIC', 'Heavy Ion Cyclotron', 'gtceu:heavy_ion_cyclotron', ['PU'], 6, -4, [
    'The &6Heavy Ion Cyclotron&r fires a calcium-48 beam at an actinide target. A few atoms of &6flerovium&r fly out as a recoil gas.',
  ], [it('gtceu:heavy_ion_cyclotron'), it('gtceu:flerovium_recoil_gas_bucket')], 150),
  M('REC', 'Catch the Recoil', 'gtceu:recoil_separator', ['HIC'], 8, -4, [
    'The &6Recoil Separator&r sends the gas through an etched membrane and keeps only the new atoms. The helium carrier goes back to the cyclotron.',
  ], [it('gtceu:recoil_separator'), it('grindless:flerovium_atoms')], 150),
  M('SHL', 'Superheavy Chemistry', 'gtceu:superheavy_chemistry_lab', ['REC'], 10, -4, [
    'The &6Superheavy Chemistry Lab&r handles samples that live for seconds. Tennessine is first, sealed in a capsule.',
  ], [it('gtceu:superheavy_chemistry_lab'), it('grindless:tennessine_sample')], 150),
  P('CEN', 'Superheavy Census', 'grindless:superheavy_census', ['SHL'], 12, -4, [
    'Flerovium, livermorium, moscovium and oganesson on one gold foil: the &6Superheavy Census&r.',
    'Real oganesson lives for milliseconds and only a handful of atoms exist. Here it is a gas you can keep, and that is fiction.',
  ], [it('grindless:superheavy_census')], 200),

  // ------------------------------------------------------------------ pressure and fibres
  M('MEGA', 'Under Pressure', 'gtceu:megabar_press', ['START'], 2, -2, [
    'The &6Megabar Press&r squeezes nanodiamond pellets between anvils into &6Nanotwinned Diamond&r, harder than any diamond mined.',
  ], [it('gtceu:megabar_press'), it('grindless:nanotwinned_diamond')], 150),
  P('HYD', 'Squeeze a Hydride', 'gtceu:lay_superhydride_ingot', ['MEGA'], 4, -2, [
    'Lanthanum, yttrium and ammonia borane between diamond anvils make a &6(La,Y)H10 Superhydride&r.',
    'This is fiction: the real hydride needs over 100 GPa and stays in a lab cell. Here it comes out as an ingot, and the quench is a recipe.',
  ], [it('gtceu:lay_superhydride_ingot')], 150),
  M('EBF', 'Electron Beam Furnace', 'gtceu:electron_beam_furnace', ['HYD'], 6, -2, [
    'The &6Electron Beam Furnace&r melts a metal in vacuum with no crucible to dirty it. Hafnium, tantalum and niobium leave six nines pure, and the skull goes back.',
  ], [it('gtceu:electron_beam_furnace'), it('grindless:six_n_hafnium'), it('grindless:six_n_tantalum')], 150),
  M('FIBRE', 'Silicon Carbide Fibre', 'gtceu:sic_fibre_plant', ['EBF'], 8, -2, [
    'The &6SiC Fibre Plant&r spins polycarbosilane, cures it with a beam and fires it to a &6SiC Fibre&r. The methane and hydrogen are caught.',
  ], [it('gtceu:sic_fibre_plant'), it('grindless:sic_fibre')], 150),
  M('CVI', 'Seamless Ceramic', 'gtceu:cvi_furnace', ['FIBRE'], 10, -2, [
    'The &6CVI Furnace&r grows silicon carbide into a preform of fibres, until a &6SiC/SiC Plate&r is solid and has no seam to crack.',
  ], [it('gtceu:cvi_furnace'), it('grindless:sic_sic_plate')], 150),
  P('COIL', 'HfTaCN Coil', 'grindless:hftacn_coil_block', ['CVI'], 12, -2, [
    'Hafnium, tantalum, carbon and nitrogen make the most heat-proof ceramic known. The &6HfTaCN Coil Block&r lines a hotter fusion reactor.',
  ], [it('grindless:hftacn_coil_block')], 150),
  M('FORGE', 'Stellar Forge', 'gtceu:stellar_forge', ['COIL'], 14, -4, [
    'The &6Stellar Forge&r runs blast furnace recipes on four rings of coils. Every 450 K its coils run above a recipe doubles the copies it may run, up to the parallel hatch.',
    'A full charge of &6UEV D-He-3 Plasma&r makes one run 900 K hotter, and comes back as helium-4 ash. A recipe hotter than the coils is never run.',
  ], [it('gtceu:stellar_forge')], 200),

  // ------------------------------------------------------------------ light
  M('SNSPD', 'One Photon', 'gtceu:snspd_foundry', ['START'], 2, 2, [
    'A thin tungsten silicide wire cooled to near zero fires when one photon lands on it. The &6SNSPD Foundry&r writes, mounts and packages &6SNSPDs&r.',
  ], [it('gtceu:snspd_foundry'), it('grindless:snspd')], 150),
  M('VDW', 'Stack the Layers', 'gtceu:vdw_stacker', ['SNSPD'], 4, 2, [
    'The &6Van der Waals Stacker&r lays graphene between hexagonal boron nitride films, one atom at a time, and makes a &6Graphene Modulator&r.',
  ], [it('gtceu:vdw_stacker'), it('grindless:graphene_modulator')], 150),
  M('PHOT', 'Photonic Integration', 'gtceu:photonic_integration_hall', ['VDW'], 6, 2, [
    'The &6Photonic Integration Hall&r puts a waveguide, a quantum dot source, a detector and a modulator on one chip: the &6Quantum Photonic Chip&r.',
  ], [it('gtceu:photonic_integration_hall'), it('grindless:quantum_photonic_chip')], 150),
  P('FIRST', 'First Light', 'gtnn:optical_computer', ['PHOT'], 8, 2, [
    'An &6Optical Computer&r thinks in photons and runs cold. It comes only from the Hall now.',
  ], [it('gtnn:optical_computer')], 200, { rewards: [ri('gtceu:wetware_processor_assembly', 4)] }),
  P('COOL', 'Cold Atoms', 'grindless:li_cooling_laser', ['FIRST'], 10, 2, [
    'Lithium-6 and potassium-40 each need a laser tuned to their own line. A gas of both, cooled to a few billionths of a degree, behaves as one quantum object.',
  ], [it('grindless:li_cooling_laser'), it('grindless:k_cooling_laser')], 150),
  M('ENT', 'Entangled', 'gtceu:entanglement_station', ['COOL'], 12, 2, [
    'The &6Entanglement Station&r in Earth orbit joins a photon source, a memory crystal, detectors and a hollow-core fibre into a &6Quantum Repeater Node&r. Its neighbour, the Quantum Gas Lab, makes the cold gas.',
  ], [it('gtceu:entanglement_station'), it('grindless:quantum_repeater_node')], 200,
  { rewards: [ri('gtceu:helium_bucket', 4)] }),
  M('CELL', 'The UEV Cell', 'grindless:uev_smes_cell', ['ENT'], 13.5, 4, [
    'The &6UEV SMES Cell&r holds ninety-six UV naquadria batteries, about 250 billion EU, and the quantum repeater keeps the network in step. The UEV wireless hatches work with it.',
  ], [it('grindless:uev_smes_cell'), it('gtceu:uev_wireless_energy_hatch')], 200),

  // ------------------------------------------------------------------ Mk4 fusion
  M('POL', 'Polarised Helium', 'gtceu:helium3_polariser', ['START'], 2, 4, [
    'A laser at 1083 nm lines up the spins of helium-3 nuclei. Aligned nuclei fuse faster, and the &6Helium-3 Polariser&r makes the fuel.',
  ], [it('gtceu:helium3_polariser'), it('gtceu:polarised_helium_3_bucket')], 150),
  M('MK4', 'Mk4 Fusion Reactor', 'gtceu:uev_fusion_reactor', ['POL'], 4, 4, [
    'The &6Mk4 Fusion Reactor&r holds sixteen UEV hatches and a very large buffer. It is built from the HfTaCN coil and the Mk4 casing.',
  ], [it('gtceu:uev_fusion_reactor'), it('grindless:uev_fusion_casing')], 200),
  P('BURN', 'First Mk4 Burn', 'gtceu:uev_dhe3_plasma_bucket', ['MK4'], 6, 4, [
    'Run the first fuel recipe on the Mk4 and take the D-He-3 plasma out.',
  ], [it('gtceu:uev_dhe3_plasma_bucket')], 200),
  P('PB', 'Aneutronic', 'gtceu:uev_pb11_plasma_bucket', ['MK4'], 6, 6, [
    'Proton and boron-11 fuse into three helium nuclei and almost no neutrons. The plasma gives its energy to the direct converter.',
  ], [it('gtceu:uev_pb11_plasma_bucket')], 150),

  // ------------------------------------------------------------------ Alpha Centauri
  P('ALPHA', 'First Light of Another Star', 'gtceu:uev_machine_casing', ['MK1'], 15.5, -2, [
    'The Mk1 drive takes a level 9 rocket across four light years. Park in orbit round &6Alpha Centauri&r A and B, and build station nine.',
  ], [dim('grindless:alpha_centauri_orbit')], 200, { size: 1.25 }),
  M('NEB', 'Nebula Collector', 'gtceu:nebula_collector', ['ALPHA'], 17.5, -2, [
    'The &6Nebula Collector&r drags a coil through thin gas and compresses what it catches: &6Interstellar Gas&r, and aerogel tiles that trap grains.',
    'Real interstellar gas is a few atoms in a cubic metre, and a coil that scoops it is fiction. The yield here is a game number.',
  ], [it('gtceu:nebula_collector'), it('gtceu:interstellar_gas_bucket')], 150),
  M('DUST', 'Interstellar Dust Lab', 'gtceu:interstellar_dust_lab', ['NEB'], 19.5, -2, [
    'A grain of dust is older than the Sun. The &6Interstellar Dust Lab&r frees the grains from the aerogel and measures iron-60, thrown out by a dying star.',
  ], [it('gtceu:interstellar_dust_lab'), it('grindless:fe60_record')], 150),
  M('PULS', 'Light from the Neighbours', 'gtceu:pulsar_timing_station', ['DUST'], 21.5, -2, [
    'Pulsars tick like clocks. The &6Pulsar Timing Station&r times them with a clock, a detector and a lobster-eye optic, and with the dust record writes a &6Pulsar Navigation Chart&r.',
  ], [it('gtceu:pulsar_timing_station'), it('grindless:pulsar_navigation_chart')], 200,
  { rewards: [ri('gtceu:helium_bucket', 4)] }),

  // ------------------------------------------------------------------ Barnard b
  P('BARN', 'Barnard b', 'gtceu:barnard_core_drill', ['MK1'], 15.5, 2, [
    'Barnard\'s Star is a cold red dwarf with an iron planet. Land on &6Barnard b&r and sink the &6Barnard Core Drill&r for a core rock.',
  ], [dim('grindless:barnard_b'), it('gtceu:barnard_core_drill'), it('grindless:barnard_core_rock')], 200, { size: 1.25 }),
  M('MOND', 'Mond on Barnard', 'gtceu:carbonyl_refinery', ['BARN'], 17.5, 2, [
    'Carbon monoxide at moderate heat lifts iron out of the core rock as a gas, and the gas is cracked back to pure iron. Nickel, cobalt and a rhenium-rich residue are left.',
  ], [it('gtceu:carbonyl_refinery'), it('gtceu:iron_pentacarbonyl_bucket')], 150,
  { rewards: [ri('gtceu:iron_plate', 16)] }),
  M('SX', 'First Single Crystal', 'gtceu:single_crystal_foundry', ['MOND'], 19.5, 2, [
    'A turbine blade cast as one crystal has no grain boundary to creep along. The &6Single-Crystal Foundry&r pours a superalloy that needs Barnard\'s rhenium, and the result is the &6SX Blade&r.',
  ], [it('gtceu:single_crystal_foundry'), it('grindless:sx_blade')], 200,
  { rewards: [ri('gtceu:wetware_processor_assembly', 4)] }),
  M('MAG', 'A Nitride Magnet', 'gtceu:nitride_magnet_works', ['SX'], 21.5, 2, [
    'Carbonyl iron nitrided to Fe16N2 makes a magnet with no rare earth in it. The &6Nitride Magnet Works&r bonds it, and the &6UEV Electric Motor&r follows.',
  ], [it('gtceu:nitride_magnet_works'), it('grindless:bonded_fe16n2_magnet'), it('gtceu:uev_electric_motor')], 150),

  // ------------------------------------------------------------------ Sirius B
  P('MK2', 'Drive Mk2', 'grindless:dfd_mk2_motor', ['MAG'], 24, 0, [
    'The Mk2 drive takes the UEV motor and a Brayton turbine wheel cast as single crystals. It is the drive for a level 10 rocket.',
  ], [it('grindless:dfd_mk2_motor'), it('grindless:brayton_turbine_wheel')], 250),
  P('SIRIUS', 'Sirius B', 'grindless:warp_gate_casing', ['MK2', 'PULS'], 26, -2, [
    'The pulsar chart gives the course. Sirius B is a white dwarf, a star\'s core left bare. Park in its orbit and build station ten.',
  ], [dim('grindless:sirius_b_orbit')], 250, { size: 1.25 }),
  M('SPEC', 'Spectrograph', 'gtceu:white_dwarf_spectrograph', ['SIRIUS'], 28, -2, [
    'The &6White Dwarf Spectrograph&r reads the pull of gravity on a photon. With a clock and detectors it draws a &6Mass-Radius Chart&r.',
  ], [it('gtceu:white_dwarf_spectrograph'), it('grindless:mass_radius_chart')], 200),
  M('DEG', 'Degenerate Matter', 'gtceu:degenerate_harvester', ['SPEC'], 30, -2, [
    'The &6Degenerate Matter Harvester&r takes a sample from the equation of state and the chart.',
    'Degenerate matter is fiction: nothing like a spoonful of white dwarf could be lifted, or weigh what it does. Here it is a recipe and no more.',
  ], [it('gtceu:degenerate_harvester'), it('grindless:degenerate_matter')], 250),
  M('PEL', 'White Dwarf in a Bottle', 'gtceu:containment_works', ['DEG'], 32, -2, [
    'Seal a sample of degenerate matter in an exotic matter cell inside the &6Containment Works&r, and the &6Degenerate Pellet&r is a fuel that never runs out in your lifetime. It is still fiction.',
  ], [it('gtceu:containment_works'), it('grindless:degenerate_pellet')], 250,
  { rewards: [ri('grindless:exotic_matter_cell', 2)] }),

  // ------------------------------------------------------------------ the gate
  M('WARP', 'The Gate at UEV', 'gtceu:warp_gate', ['PEL'], 34, -2, [
    'The warp gate was built for UHV. At the UEV load it draws sixteen amps of UEV and runs on a circuit 3 program. Your fuel is in the pellets and your power is in the cell.',
  ], [it('gtceu:warp_gate'), it('grindless:degenerate_pellet')], 250),
  P('HOLD', 'Hold the Gate', 'gtceu:warp_gate', ['WARP'], 36, -2, [
    'Hold the warp gate open at the UEV load for sixty seconds in Sirius B orbit, then tick this box. The gate\'s casing is never a reward: it is a product of the run.',
  ], [ck()], 300, { shape: 'diamond', size: 1.75, rewards: [ri('gtceu:helium_bucket', 8)] }),
];
