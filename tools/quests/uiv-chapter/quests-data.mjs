// Quest data for uiv_age ("UIV - Dead Stars"); gen.mjs in this folder writes the chapter (docs/quests.md, sections 8 and 14;
// docs/eras/uiv.md, "Quests", the ten parts). Ids come from the keys: never rename a key once a quest has shipped.
// Positions: the foundation spine runs along y = 0 and the three home lanes leave START (metallic hydrogen and RHEA above,
// superheavy II above that, light and the Mk5 below). The trunk then runs right along y = 0: Mercury, RX J1856, PSR J0437, Cygnus X-1
// and the gate. Every UIV package has landed, so there is no package gating. Rewards stay small and no quest blocks a recipe.
// Built as built: the decay heat vault only runs generator recipes, so its quest takes the controller; the Neutronium Compression Hall
// (UIV-M2) sits after the neutronium pellet; the gate quests never reward the gate product.
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
  order: 11,
  icon: 'gtceu:uiv_machine_casing',
  autofocus: 'START',
  title: 'UIV - Dead Stars',
  subtitle: ['Metallic hydrogen, superheavy atoms, light for computers and a fusion ring at home, then a neutron star, a pulsar and a black hole, and a gate held open.'],
};

export const QUESTS = [
  // ------------------------------------------------------------------ 1. foundation
  P('START', 'Dead Stars', 'gtceu:uiv_machine_hull', ['X:5316E435F8496672'], 0, 0, [
    'The warp gate left you the &6UIV Machine Hull&r and a stack of casings. The stars you can reach now are the ones that already died: a neutron star, a pulsar and a black hole.',
    'Home first. Nothing out there is built without metallic hydrogen and a very hard alloy.',
  ], [it('gtceu:uiv_machine_hull'), it('gtceu:uiv_machine_casing')], 50, { shape: 'rsquare', size: 1.5 }),
  P('CABLE', 'Metallic Hydrogen Cable', 'gtceu:metallic_hydrogen_single_cable', ['START'], 2.5, 0, [
    'Hydrogen squeezed until it conducts, drawn into wire and wrapped in a seal that survives it. The &6Metallic Hydrogen Cable&r carries the UIV hull and everything after it.',
  ], [it('gtceu:metallic_hydrogen_single_cable')], 100),
  P('COIL', 'Metallic Hydrogen Coil', 'grindless:metallic_hydrogen_coil_block', ['CABLE'], 5, 0, [
    'The same wire, wound on a refractory former and soaked in resin, makes the &6Metallic Hydrogen Coil Block&r. It lines the Mk5 ring, and a lot of magnets besides.',
  ], [it('grindless:metallic_hydrogen_coil_block')], 100),
  P('PLATE', 'RHEA Plate', 'gtceu:rhea_plate', ['COIL'], 7.5, 0, [
    'Five refractory metals melted together in a cold crucible and forged flat: the &6RHEA Plate&r. It is what the UIV parts are cased in.',
  ], [it('gtceu:rhea_plate')], 100),
  P('PUMP', 'UIV Parts', 'grindless:uiv_electric_pump', ['PLATE'], 10, 0, [
    'The &6UIV Electric Pump&r has a printed impeller, pressed at a megabar and balanced by hand-me-down machines. The other UIV parts wait for stars further out.',
  ], [it('grindless:uiv_electric_pump')], 150),
  P('CELL', 'UIV SMES Cell', 'grindless:uiv_smes_cell', ['PUMP'], 10, 1.75, [
    'The &6UIV SMES Cell&r holds four times what the UEV cell does, in metallic hydrogen windings. It is what the wireless grid stores its surplus in from here on.',
  ], [it('grindless:uiv_smes_cell')], 100),

  // ------------------------------------------------------------------ 2. metallic hydrogen and RHEA
  M('PULSER', 'Ramp Compression', 'gtceu:ramp_compression_pulser', ['CABLE'], 3, -3, [
    'The &6Ramp Compression Pulser&r squeezes cold hydrogen until it turns metallic.',
    'The squeeze is real, the quench is fiction: nobody has ever kept metallic hydrogen once the pressure is gone. Here it comes out as a rod.',
  ], [it('gtceu:ramp_compression_pulser'), it('gtceu:metallic_hydrogen_ingot')], 150),
  P('LONS', 'Lonsdaleite', 'grindless:lonsdaleite_bearing', ['PULSER'], 5.5, -3, [
    'Shock graphite and you get lonsdaleite, a harder cousin of diamond. Race and bearing are cut from it for the UIV piston.',
  ], [it('gtceu:lonsdaleite_dust'), it('grindless:lonsdaleite_bearing')], 100),
  P('CGN', 'Cubic Gauche Nitrogen', 'grindless:quenched_cg_nitrogen', ['PULSER'], 5.5, -5, [
    'Nitrogen laser-heated at crushing pressure becomes a single-bonded solid that stores a fearful amount of energy.',
    'Keeping it at ordinary pressure is fiction, the same trick as the hydrogen. The &6Quenched cg-N&r is the filling of every sled charge.',
  ], [it('grindless:quenched_cg_nitrogen')], 150),
  M('LEV', 'Levitation Melter', 'gtceu:levitation_melter', ['PLATE'], 8, -3, [
    'A melt held in the air by a magnetic field never touches a crucible, so nothing dissolves into it. The &6Levitation Melter&r pours the RHEA ingot and a few worse-tempered alloys.',
  ], [it('gtceu:levitation_melter'), it('gtceu:rhea_ingot')], 150),
  P('BMG', 'Metallic Glass Gear', 'grindless:strain_wave_gear', ['LEV'], 10.5, -3, [
    'Cool a zirconium alloy too fast to crystallise and it is a glass that behaves like a spring. A flexspline cast from it makes a &6Strain Wave Gear&r with no backlash.',
  ], [it('grindless:bmg_flexspline'), it('grindless:strain_wave_gear')], 150),
  P('WTILE', 'Fibre-Reinforced Tile', 'grindless:first_wall_tile', ['LEV'], 10.5, -5, [
    'Tungsten fibre in an RHEA matrix, sprayed as plasma into a tile that can face a fusion fire. It is the first &6First Wall Tile&r of the Mk5 casing.',
  ], [it('grindless:wf_rhea_billet'), it('grindless:first_wall_tile')], 150),

  // ------------------------------------------------------------------ 3. superheavy II
  P('TICL', 'Titanium-50 Chloride', 'gtceu:titanium_50_chloride_dust', ['PULSER'], 3.5, -6, [
    'The calutron sorts the titanium isotopes just as it sorted calcium. Only one of them is the next bullet.',
  ], [it('gtceu:titanium_50_chloride_dust')], 100),
  P('TI50', 'Titanium-50 Metal', 'gtceu:titanium_50_dust', ['TICL'], 5.5, -7.5, [
    'Sponge, then melt, then an oven charge for the cyclotron. The &6Titanium-50&r goes through the melter once and comes out as pure as the beam needs.',
  ], [it('gtceu:titanium_50_dust'), it('grindless:ti50_oven_charge')], 100),
  P('CFW', 'Californium Target Wheel', 'grindless:cf249_target_wheel', ['TI50'], 8, -7.5, [
    'Californium-249 comes from berkelium that sat in the hot cell and decayed. A thin layer on a spinning wheel makes the &6Cf-249 Target Wheel&r.',
  ], [it('grindless:cf249_target_wheel')], 150),
  P('REC120', 'Element 120 Recoil Gas', 'gtceu:element_120_recoil_gas_bucket', ['CFW'], 10.5, -7.5, [
    'A titanium beam on a californium wheel throws out a gas with a few atoms of something new in it. The cyclotron and the separator you already have do the rest.',
  ], [it('gtceu:element_120_recoil_gas_bucket')], 150),
  P('E120', 'Element 120', 'grindless:element_120_recoil', ['REC120'], 13, -7.5, [
    'One more entry for the census: the &6Element 120 Recoil&r record. Real element 120 has never been made, so this one is a recipe and a hope.',
  ], [it('grindless:element_120_recoil')], 200),

  // ------------------------------------------------------------------ 4. light and the mainframe
  M('LNSIN', 'Lithium Niobate on Nitride', 'gtceu:tfln_fab', ['START'], 2.5, 3.5, [
    'The &6TFLN Fab&r bonds a thin crystal of lithium niobate onto a silicon nitride chip, so one wafer steers light and tunes it.',
  ], [it('gtceu:tfln_fab'), it('grindless:ln_on_sin_wafer')], 150),
  M('FIVED', 'Five-Dimensional Crystal', 'gtceu:femtosecond_writer', ['LNSIN'], 5, 3.5, [
    'A laser pulse a millionth of a millionth of a second long can write inside glass. The &6Femtosecond Writer&r etches a &65D Data Crystal&r that keeps its data longer than the Sun.',
  ], [it('gtceu:femtosecond_writer'), it('grindless:data_crystal_5d')], 150),
  M('BEUV', 'Beyond Extreme UV', 'gtceu:beuv_scanner', ['FIVED'], 7.5, 3.5, [
    'A terbium plasma gives light at a wavelength nobody built a scanner for before. The &6BEUV Scanner&r exposes a wafer and the driver ASIC comes out of it. The debris is caught and recycled.',
  ], [it('gtceu:beuv_scanner'), it('grindless:beuv_exposed_wafer')], 150),
  M('SIXH', 'Six-Hour Memory', 'gtceu:spectral_hole_burner', ['BEUV'], 10, 3.5, [
    'A crystal of a single europium isotope remembers a light pulse for hours when you burn the right comb into it. The &6Spectral Hole Burner&r makes the &6Six-Hour Memory&r.',
  ], [it('gtceu:spectral_hole_burner'), it('grindless:six_hour_memory')], 150),
  M('PSI', 'Phosphorus in Silicon', 'gtceu:stm_lithography_cell', ['SIXH'], 12.5, 3.5, [
    'A scanning tip peels hydrogen off a silicon surface one atom at a time, and phosphine fills the holes. The &6STM Lithography Cell&r writes a &6P:Si Die&r. It has to be cold before it works.',
  ], [it('gtceu:stm_lithography_cell'), it('grindless:p_si_die')], 150),
  M('MK', 'Millikelvin Cryostat', 'gtceu:millikelvin_cryostat_works', ['PSI'], 15, 3.5, [
    'Colder than the superfluid helium plant ever gets. The &6Millikelvin Cryostat Works&r wets a rare-earth stage with helium-3 and finishes the P:Si processor.',
  ], [it('gtceu:millikelvin_cryostat_works'), it('grindless:mk_cryostat_module'), it('grindless:p_si_processor')], 200),
  P('MAIN', 'Optical Mainframe', 'gtnn:optical_mainframe', ['MK'], 17.5, 3.5, [
    'The Photonic Integration Hall puts a crossbar, a glass interposer and a comb together into a &6Optical Mainframe&r. It is the only place that mainframe comes from now.',
  ], [it('gtnn:optical_mainframe')], 250, { rewards: [ri('gtceu:wetware_processor_assembly', 4)] }),

  // ------------------------------------------------------------------ 5. Mk5
  M('POLSRC', 'Polarised Protons', 'gtceu:polarised_proton_source', ['LNSIN'], 3, 7, [
    'Fuse nuclei with their spins lined up and you get about half as much again. The &6Polarised Proton Source&r freezes hydrogen, lithium hydride and ammonia into pellets that remember.',
  ], [it('gtceu:polarised_proton_source'), it('grindless:polarised_h_pellet')], 150),
  M('RING', 'Mk5 Fusion Ring', 'gtceu:uiv_fusion_reactor', ['POLSRC'], 5.5, 7, [
    'The &6Mk5 Fusion Ring&r has an octagon of casing round an empty channel, lined with metallic hydrogen coils. It holds a very large buffer and takes sixteen hatches.',
  ], [it('gtceu:uiv_fusion_reactor'), it('grindless:uiv_fusion_casing')], 250),
  P('MK5A', 'Helium-3 on Helium-3', 'gtceu:he3he3_ash_bucket', ['RING'], 8, 5.5, [
    'Two helium-3 nuclei and two protons come out. The direct energy converter turns the plasma into power, and the protons go back to the polarised source.',
  ], [it('gtceu:he3he3_ash_bucket')], 200),
  P('MK5B', 'Proton on Lithium-6', 'gtceu:pli6_ash_bucket', ['RING'], 8, 7, [
    'Pellets of polarised lithium hydride burn to helium. The ash still holds helium-3, so a second pass at the superfluid plant keeps it out of the bin.',
  ], [it('gtceu:pli6_ash_bucket')], 200),
  P('MK5C', 'Proton on Nitrogen-15', 'gtceu:pn15_ash_bucket', ['RING'], 8, 8.5, [
    'The hottest fuel, and the best returns. It leaves carbon-12 behind, and the diamond lines take every bit of it.',
  ], [it('gtceu:pn15_ash_bucket')], 250),

  // ------------------------------------------------------------------ 6. Mercury
  M('MATR', 'Matrioshka Computer', 'gtceu:matrioshka_computer', ['PUMP'], 13, 0, [
    'A computer built in shells, in nine times Earth\'s sunlight, running logic that barely makes heat. The &6Matrioshka Computer&r is where UIV research is written, and its logic tiles are among the longest things to build here.',
  ], [it('gtceu:matrioshka_computer'), it('grindless:matrioshka_logic_tile')], 250),
  M('RAD', 'Droplet Radiators', 'gtceu:droplet_radiator_works', ['MATR'], 15.5, 0, [
    'Heat has nowhere to go in space but out. A sheet of liquid tin droplets falling in free fall carries it away, which only works in orbit. The &6Droplet Radiator Works&r makes the modules and the TPV tiles.',
  ], [it('gtceu:droplet_radiator_works'), it('grindless:droplet_radiator_module')], 200),
  P('TPV', 'Thermophotovoltaic Shell', 'grindless:matrioshka_tpv_shell', ['RAD'], 18, 0, [
    'A tile of indium gallium arsenide antimonide turns hot glow into power. Enough of them wrapped round a computer make the &6Matrioshka TPV Shell&r.',
  ], [it('grindless:tpv_tile'), it('grindless:matrioshka_tpv_shell')], 200),
  P('EOS', 'Equation of State', 'grindless:ns_eos_chart', ['PROF'], 38, -3, [
    'Pulse profiles from a pulsar go into the Matrioshka, and the &6Neutron Star EOS Chart&r comes out. It tells you how hard a star pushes back. The computer decides on a long run.',
  ], [it('grindless:ns_eos_chart')], 250),

  // ------------------------------------------------------------------ 7. RX J1856.5-3754
  P('JUMP1', 'RX J1856.5-3754', 'grindless:neutron_star_site_casing', ['TPV'], 21, 0, [
    'The first jump. A drive built from your new alloys carries a seed to a lone neutron star and opens a ring there.',
    'The jump is fiction, as every jump is: the distance is a few hundred light years and the drive does not exist. The star, a cold X-ray emitter, is real.',
  ], [dim('grindless:rx_j1856_orbit')], 250, { size: 1.25 }),
  M('CRUST', 'Crust Lift', 'gtceu:crust_lift', ['JUMP1'], 23.5, 0, [
    'A tether down to the poles and the star\'s own electric field carry a little of the crust up. The &6Crust Lift&r is fiction: no tether survives that gravity, and the yield is a game number.',
  ], [it('gtceu:crust_lift'), it('grindless:neutron_star_crust')], 250),
  M('DRIP', 'Drip Neutrons', 'gtceu:neutron_drip_separator', ['CRUST'], 26, 0, [
    'Deep in the crust the nuclei are so crowded that neutrons leak out between them. The &6Neutron Drip Separator&r takes them away before the matter relaxes. They decay if you wait, so don\'t.',
  ], [it('gtceu:neutron_drip_separator'), it('gtceu:drip_neutrons_bucket')], 250),
  M('NEUT', 'Neutronium Pellet', 'gtceu:neutronium_cage', ['DRIP'], 28.5, 0, [
    'Cool the drip neutrons into a superfluid and shut it in a cage. The &6Neutronium Pellet&r is fiction: a spoonful of neutron matter held at ordinary pressure by a field. It is not the neutronium of the other mods.',
  ], [it('gtceu:neutronium_cage'), it('grindless:neutronium_pellet')], 300),
  M('HALL', 'Neutronium Compression Hall', 'gtceu:neutronium_compression_hall', ['NEUT'], 31, -2.5, [
    'The &6Neutronium Compression Hall&r reads the pellets in its bus as parallels, and the pellets are never used up. Its implosion mode keeps the explosive, so switch the hall to implosion in its own window first.',
  ], [it('gtceu:neutronium_compression_hall')], 250),
  M('E119', 'Element 119', 'gtceu:r_process_decompressor', ['DRIP'], 28.5, 3, [
    'Decompress a bit of crust and the heavy elements are born, as in a kilonova. A uranium target hit by the same neutrons gives einsteinium and fermium, and from them the &6Element 119 Recoil&r and &6Census II&r.',
  ], [it('gtceu:r_process_decompressor'), it('grindless:element_119_recoil'), it('grindless:superheavy_census_ii')], 300),
  M('VAULT', 'Decay Heat Vault', 'gtceu:decay_heat_vault', ['E119'], 31, 3, [
    'Fresh r-process matter keeps on decaying and giving off heat. The &6Decay Heat Vault&r burns a sealed kilonova capsule for power, and the ash goes back to the platinum plant. Its power is local to the site.',
  ], [it('gtceu:decay_heat_vault')], 250),

  // ------------------------------------------------------------------ 8. PSR J0437-4715
  P('JUMP2', 'PSR J0437-4715', 'grindless:rad_hard_controller', ['NEUT'], 33, 0, [
    'The second jump: a pulsar close enough to time. A seed rides there on a course you worked out with the neutron star, and the jump is fiction here too.',
  ], [dim('grindless:psr_j0437_orbit')], 250, { size: 1.25 }),
  M('WIND', 'Pair Wind', 'gtceu:pulsar_wind_trap', ['JUMP2'], 35.5, 0, [
    'A pulsar blows a wind of electrons and positrons. The &6Pulsar Wind Trap&r catches a sample in a tungsten-lined magnet, and the gamma rays heat the lining.',
  ], [it('gtceu:pulsar_wind_trap'), it('gtceu:pair_plasma_bucket')], 250),
  M('PS', 'Positronium', 'gtceu:positronium_condensate_lab', ['WIND'], 38, 0, [
    'An electron and a positron orbiting each other, laser-cooled in aerogel until they act as one. The &6Positronium Condensate Lab&r makes the &6Ps BEC&r. Nobody has made a condensate of it yet, so this one is a proposal.',
  ], [it('gtceu:positronium_condensate_lab'), it('grindless:ps_bec')], 250),
  P('GAMMA', 'Gamma Laser Cavity', 'grindless:gamma_laser_cavity', ['PS'], 40.5, 0, [
    'Let the condensate annihilate all at once and you get a gamma-ray laser. It is fiction: nobody has built one. The &6Gamma Laser Cavity&r is the core of the UIV emitter.',
  ], [it('grindless:gamma_laser_cavity')], 300),
  M('PROF', 'Pulse Profile', 'gtceu:xray_pulse_profiler', ['JUMP2'], 35.5, -3, [
    'A pulsar blinks hundreds of times a second. The &6X-ray Pulse Profiler&r folds the blinks into a profile and times it against a clock at home.',
  ], [it('gtceu:xray_pulse_profiler'), it('grindless:xray_pulse_timed')], 250),
  P('NAV', 'Navigation Solution', 'grindless:pulsar_navigation_solution', ['EOS'], 40.5, -3, [
    'Four timed profiles and the equation of state give a position in space. The &6Pulsar Navigation Solution&r is what points the seed at the black hole.',
  ], [it('grindless:pulsar_navigation_solution')], 300),

  // ------------------------------------------------------------------ 9. Cygnus X-1
  P('JUMP3', 'Cygnus X-1', 'grindless:probe_bay_casing', ['NAV', 'GAMMA'], 43, -1.5, [
    'The last jump: a black hole as massive as a small galaxy\'s core is not, but spinning fast enough to matter. The jump is fiction, and the black hole is real.',
  ], [dim('grindless:cygnus_x1_orbit')], 300, { size: 1.25 }),
  M('PROBE', 'Probe Run', 'gtceu:ergosphere_probe_bay', ['JUMP3'], 45.5, -1.5, [
    'Drop a probe into the ergosphere and read how fast the hole spins. The probe doesn\'t come back, and nobody needs it to. The &6Ergosphere Probe Bay&r also loads the sleds.',
  ], [it('gtceu:ergosphere_probe_bay'), it('grindless:kerr_probe_data')], 250),
  P('KERR', 'Kerr Chart', 'grindless:kerr_chart', ['PROBE'], 48, -1.5, [
    'The probe data goes home, and the gravitational-wave detector and the interferometer correlate it. The Matrioshka turns it into a &6Kerr Chart&r.',
  ], [it('grindless:correlated_kerr_data'), it('grindless:kerr_chart')], 300),
  P('SLED', 'Split-Charge Sled', 'grindless:split_charge_sled', ['JUMP3'], 45.5, 1.5, [
    'A compacted waste canister, a charge of cg-N and a hull. Every era\'s waste goes in: it is the last place anything is put.',
  ], [it('grindless:split_charge_sled')], 250),
  M('PENROSE', 'Drop a Sled into the Ergosphere', 'gtceu:penrose_engine', ['SLED', 'KERR'], 48, 1.5, [
    'The &6Penrose Engine&r drops the sled in, the sled splits, one half falls into the hole and the other comes out with more energy than it took in. The hole spins a little slower.',
    'The half you get back is the &6Recovered Half-Sled&r. It goes back to the bay for a refit.',
  ], [it('gtceu:penrose_engine'), it('grindless:recovered_half_sled')], 300),

  // ------------------------------------------------------------------ 10. the gate
  P('HOLD', 'Open the Cygnus Gate', 'gtceu:warp_gate', ['PENROSE'], 51, 0, [
    'Hold the warp gate open at the UIV load for sixty seconds in Cygnus X-1 orbit, then tick this box. Take care of your power first: the Penrose engine is the cheaper way to pay for it, not the only one.',
    'The gate\'s casing is never a reward: it is a product of the run.',
  ], [ck()], 300, { shape: 'diamond', size: 1.75 }),
  P('STORE', 'Stored Proof', 'grindless:neutronium_pellet', ['HOLD'], 53.5, 0, [
    'Keep a neutronium pellet, census II, the equation of state chart, a half-sled and an optical mainframe in the store. The gate looks for them before it opens further.',
  ], [it('grindless:neutronium_pellet'), it('grindless:superheavy_census_ii'), it('grindless:ns_eos_chart'), it('grindless:recovered_half_sled'), it('gtnn:optical_mainframe')], 300),
  P('UXV', 'Gate to UXV', 'gtceu:uxv_machine_casing', ['STORE'], 56, 0, [
    'The &6Kerr Chart&r is the research for the UXV machine casing. Build it and the next voltage is open.',
  ], [it('gtceu:uxv_machine_casing'), it('grindless:kerr_chart')], 400, { size: 1.5 }),
];
