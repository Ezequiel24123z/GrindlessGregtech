// Quest data for uxv_age ("UXV - Spin and Strange Stars"); gen.mjs in this folder writes the chapter (docs/quests.md, sections 8 and 14;
// docs/eras/uxv.md, "Quests", the ten parts). Ids come from the keys: never rename a key once a quest has shipped.
// Positions: three lanes leave START. Spintronics runs above (CoFeB to the mainframe, then the sensor lane further up), superheavy III
// below, and the trunk runs right along y = 0 through Cygnus X-1, the Kerr sling, Vela, the UXV parts and the Mk6 to the gate. Cassiopeia A
// is a lane of its own above the trunk, from the Whipple shield to the emitter. Every UXV package has landed, so there is no package gating.
// Built as built: the tier parity retrofit makes the parts from tier components, so the texts say what a machine does, never its inputs or
// counts. The gate quests never reward the gate product: the hold is a checkmark, the bulge chart quest only asks for the chart.
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
  order: 12,
  icon: 'gtceu:uxv_machine_casing',
  autofocus: 'START',
  title: 'UXV - Spin and Strange Stars',
  subtitle: ['Logic that runs on spin, a sensor made of superfluid, and three strange places: a black hole\'s companion star, a pulsar\'s crust and a supernova\'s ashes.'],
};

export const QUESTS = [
  // ------------------------------------------------------------------ start
  P('START', 'Spin and Strange Stars', 'gtceu:uxv_machine_casing', ['X:1433B6EB4860DF3C'], 0, 0, [
    'The Kerr chart gave you the &6UXV Machine Casing&r. The hull waits for parts nobody has made yet.',
    'Home builds logic that runs on electron spin. Out there, Cygnus X-1\'s companion is lifted, a pulsar\'s crust is mined and a supernova\'s ashes are swept.',
  ], [it('gtceu:uxv_machine_casing')], 50, { shape: 'rsquare', size: 1.5 }),

  // ------------------------------------------------------------------ 1. spintronics
  P('TARGET', 'Sputter Targets', 'grindless:cofeb_target', ['START'], 2.5, -2.5, [
    'Cobalt, iron and boron melted in the levitation melter, atomised, printed and pressed into a bonded &6CoFeB Target&r. The magnesia, Heusler and SAF targets come the same way.',
  ], [it('grindless:cofeb_ingot'), it('grindless:cofeb_target')], 100),
  M('MTJ', 'Magnetic Tunnel Junction', 'gtceu:mtj_sputter_cluster', ['TARGET'], 5, -2.5, [
    'Two magnets with an insulator a few atoms thick between them: current tunnels through more easily when they point the same way. The &6MTJ Sputter Cluster&r lays the stack on silicon-28, and the wafer ends as an &6MTJ Die&r.',
  ], [it('gtceu:mtj_sputter_cluster'), it('grindless:mtj_die')], 150),
  P('MRAM', 'Magnetic Memory', 'grindless:mram_wafer', ['MTJ'], 7.5, -2.5, [
    'The same junctions in a grid make memory that keeps its bits with the power off. The &6MRAM Wafer&r is sputtered, annealed, etched and finished in the photonic foundry.',
  ], [it('grindless:mram_wafer')], 100),
  M('RACE', 'Racetrack Memory', 'gtceu:racetrack_fab', ['MRAM'], 10, -2.5, [
    'Push magnetic domains along a nanowire with current pulses and read them as they pass a head. The &6Racetrack Fab&r patterns the track and cuts the &6Racetrack Chip&r.',
  ], [it('gtceu:racetrack_fab'), it('grindless:racetrack_chip')], 150),
  P('DSO', 'Scandate Substrate', 'grindless:dysco3_substrate', ['MTJ'], 7.5, -5, [
    'Oxide films only grow well on a crystal whose spacing matches theirs. Dysprosium scandate is grown as a boule, sliced, polished and annealed into a &6DyScO3 Substrate&r.',
  ], [it('grindless:dysco3_substrate')], 100),
  M('MESO', 'MESO Logic', 'gtceu:oxide_pld_chamber', ['DSO'], 10, -5, [
    'A multiferroic film flips a magnet with voltage instead of current, and a spin-orbit stack reads it back. The &6Oxide PLD Chamber&r grows the films, the &6vdW Stacking Cell&r builds the readout, and the photonic foundry joins them into a &6MESO Logic Die&r.',
  ], [it('gtceu:oxide_pld_chamber'), it('gtceu:vdw_stacking_cell'), it('grindless:meso_logic_die')], 200),
  P('MAINF', 'Spintronic Mainframe', 'gtnn:spintronic_mainframe', ['RACE', 'MESO'], 12.5, -3.75, [
    'Spin waves in a garnet film carry signals between the chips with almost no heat. The &6YIG LPE Furnace&r grows that film, and the Photonic Integration Hall puts logic, memory and bus together into a &6Spintronic Mainframe&r.',
  ], [it('gtceu:yig_lpe_furnace'), it('gtnn:spintronic_mainframe')], 250),

  // ------------------------------------------------------------------ 2. the sensor
  P('APER', 'Nanoaperture Array', 'grindless:nanoaperture_array', ['MAINF'], 15, -5.5, [
    'A silicon nitride membrane drilled with thousands of holes, each narrower than a virus, by the electron beam furnace. Superfluid helium leaks through the &6Nanoaperture Array&r in step, as one quantum object.',
  ], [it('grindless:nanoaperture_array')], 100),
  M('WEAK', 'Weak Link', 'gtceu:shequid_works', ['APER'], 17.5, -5.5, [
    'Two baths of superfluid helium joined by the array oscillate at a frequency set by the pressure across it. The &6SHeQUID Works&r fills and seals the &6Weak Link Cell&r.',
  ], [it('gtceu:shequid_works'), it('grindless:weak_link_cell')], 150),
  P('GYRO', 'SHeQUID Gyro', 'grindless:shequid_gyro', ['WEAK'], 20, -5.5, [
    'Two weak links in a loop make an interferometer for superfluid, and it feels the rotation of the Earth. The &6SHeQUID Gyro&r is real physics, built in the same works.',
  ], [it('grindless:shequid_gyro')], 150),
  P('SENSOR', 'UXV Sensor', 'gtceu:uxv_sensor', ['GYRO'], 23, -5.5, [
    'The &6UXV Sensor&r feels rotation with superfluid and magnetic fields with diamond. The hull, the emitter and both new generators need it.',
  ], [it('gtceu:uxv_sensor')], 200),

  // ------------------------------------------------------------------ 3. superheavy III
  P('FM257', 'Fermium-257 Target', 'grindless:fm257_target', ['START'], 2.5, 3, [
    'The calutron picks fermium-257 out of the fermium, the transuranium facility plates it, and the spark plasma sinterer fuses it into an &6Fm-257 Target&r.',
  ], [it('grindless:fm257_target')], 150),
  P('ES254', 'Einsteinium-254 Target', 'grindless:es254_target', ['FM257'], 2.5, 5.5, [
    'Einsteinium-254 is extracted from its solution and set into a target wheel. The &6Es-254 Target&r is the heavier half of element 121.',
  ], [it('grindless:es254_target')], 150),
  P('E121', 'Element 121', 'grindless:element_121_recoil', ['ES254'], 5, 5.5, [
    'Titanium-50 on einsteinium in the heavy ion cyclotron. The recoil separator catches the few atoms, and the superheavy lab seals them as an &6Element 121 Recoil&r.',
  ], [it('grindless:element_121_recoil')], 200),
  P('E122', 'Element 122', 'grindless:superheavy_census_iii', ['FM257', 'E121'], 5, 3, [
    'The same beam on the fermium target makes element 122. With both atoms in hand, the superheavy lab writes &6Census III&r, which the gate keeps.',
  ], [it('grindless:element_122_recoil'), it('grindless:superheavy_census_iii')], 250),
  M('ISLAND', 'Island Chart', 'gtceu:mnt_collider', ['E122'], 7.5, 5.5, [
    'Collide uranium on curium and the two swap nucleons, leaving neutron-rich nuclei near the island of stability. The &6MNT Collider&r stops them in gas, weighs them by flight time and writes the &6Island Chart&r.',
  ], [it('gtceu:mnt_collider'), it('grindless:island_nuclide'), it('grindless:island_chart')], 250),

  // ------------------------------------------------------------------ 4. Cygnus X-1
  M('LIFT', 'Lift the Star', 'gtceu:stellar_elevator', ['START'], 2.5, 0, [
    'The black hole already pulls its companion apart. The &6Stellar Elevator&r heats the star\'s surface where the pull is strongest and catches the stream as &6Stellar Plasma&r. It works at Cygnus X-1 only.',
  ], [it('gtceu:stellar_elevator'), it('gtceu:stellar_plasma_bucket')], 200),
  M('CUTS', 'Stellar Cuts', 'gtceu:plasma_mass_filter', ['LIFT'], 5, 0, [
    'A spinning plasma flings its heavy ions outward. The &6Plasma Mass Filter&r cuts the star into hydrogen, helium, carbon-nitrogen-oxygen and heavy cuts, and cleans the disk plasma the same way.',
  ], [it('gtceu:plasma_mass_filter'), it('gtceu:stellar_cno_cut_bucket')], 200),
  M('TOWER', 'Condensation', 'gtceu:stellar_condensation_tower', ['CUTS'], 7.5, 2.5, [
    'Cool a star slowly and its metals come out in the order a young solar system makes them. The &6Stellar Condensation Tower&r drops refractory, metal and silicate condensates, and lets the volatiles out as a gas.',
  ], [it('gtceu:stellar_condensation_tower'), it('grindless:refractory_condensate')], 150),
  M('DISK', 'Skim the Disk', 'gtceu:accretion_disk_skimmer', ['CUTS'], 7.5, 0, [
    'The gas falling into the hole spins in a disk hot enough to glow in X-rays. The &6Accretion Disk Skimmer&r skims its edge, and the mass filter turns the catch into &6Filtered Disk Plasma&r.',
  ], [it('gtceu:accretion_disk_skimmer'), it('gtceu:filtered_disk_plasma_bucket')], 200),
  M('FRC', 'FRC Cartridge', 'gtceu:frc_former', ['DISK'], 10, 0, [
    'A field-reversed configuration is a smoke ring of plasma that holds its own field. The &6FRC Former&r shoots one into a cartridge and keeps it there.',
    'FRCs are real; one that sits in a cartridge until you need it is fiction.',
  ], [it('gtceu:frc_former'), it('grindless:frc_cartridge')], 200),
  M('BZ', 'Spin Down a Black Hole', 'gtceu:bz_dynamo', ['FRC'], 12.5, 2.5, [
    'A spinning black hole threaded by a magnetic field drives a current, and the hole slows down to pay for it. The &6BZ Dynamo&r burns &6Flux-Loaded Plasma&r from the FRC former that way, at Cygnus X-1 only.',
  ], [it('gtceu:bz_dynamo'), it('gtceu:flux_loaded_plasma_bucket')], 250),

  // ------------------------------------------------------------------ 5. the Kerr sling
  P('SEED', 'The Kerr Sling', 'grindless:launched_relay_seed', ['FRC'], 12.5, 0, [
    'Swing a relay seed through the ergosphere and it leaves with some of the hole\'s spin. The ergosphere probe bay launches it as a &6Launched Relay Seed&r.',
    'The sling is fiction: nothing survives that close a pass, and no seed is this fast.',
  ], [it('grindless:launched_relay_seed')], 200),
  P('WHIPPLE', 'Whipple Shield', 'grindless:cnt_whipple_shield', ['SEED'], 15, -2.5, [
    'A thin bumper in front of a wall breaks up whatever hits it, so the wall only meets a spray. The &6CNT Whipple Shield&r carries a seed through the dust of a supernova remnant.',
    'Whipple shields are real; one that survives that crossing at that speed is fiction.',
  ], [it('grindless:cnt_whipple_shield')], 200),
  P('JUMPV', 'Vela Pulsar', 'grindless:vela_glitch_timing', ['SEED'], 15, 0, [
    'The first jump. A seed slung from Cygnus X-1 opens a ring at the Vela pulsar, a neutron star that spins eleven times a second and now and then speeds up.',
    'The jump is fiction, as every jump is. The pulsar and its glitches are real.',
  ], [dim('grindless:vela_pulsar_orbit')], 300, { size: 1.25 }),

  // ------------------------------------------------------------------ 6. Vela
  M('PASTA', 'Raw Pasta', 'gtceu:pasta_extractor', ['JUMPV'], 17.5, 0, [
    'Deep in a neutron star\'s crust the nuclei melt into rods, sheets and holes that physicists call pasta. A glitch shakes the crust loose; the &6Pasta Extractor&r times it and grows &6Raw Pasta&r from a neutronium pellet.',
  ], [it('gtceu:pasta_extractor'), it('grindless:raw_pasta')], 250),
  M('PHASE', 'Caged Phases', 'gtceu:pasta_phase_sorter', ['PASTA'], 20, 0, [
    'The &6Pasta Phase Sorter&r separates the rods from the sheets inside a cage that keeps each one squeezed. The anti-phase residue goes to the core sample the gate keeps.',
  ], [it('gtceu:pasta_phase_sorter'), it('grindless:spaghetti_phase'), it('grindless:lasagna_phase')], 250),
  M('WIRE', 'First Pasta Wire', 'gtceu:pasta_draw_bench', ['PHASE'], 22.5, 2.5, [
    'The &6Pasta Draw Bench&r pulls spaghetti phase through aerogel into &6Pasta Strand Wire&r, the UXV wire.',
    'Pasta as wire is fiction: outside a neutron star it would fly apart at once.',
  ], [it('gtceu:pasta_draw_bench'), it('gtceu:pasta_strand_single_wire')], 250),
  M('PLATE', 'Lasagna Plate', 'gtceu:pasta_laminator', ['PHASE'], 22.5, 0, [
    'The &6Pasta Laminator&r presses lasagna phase onto a tungsten-fibre billet as a &6Lasagna Plate&r, the plate of the UXV hull and parts.',
    'Pasta as plate is fiction, for the same reason as the wire.',
  ], [it('gtceu:pasta_laminator'), it('grindless:lasagna_plate')], 250),
  P('HULL', 'UXV Machine Hull', 'gtceu:uxv_machine_hull', ['PLATE'], 25, 0, [
    'The &6UXV Machine Hull&r is the first thing Vela\'s plate goes into. The UXV hatches and buses are built on it.',
  ], [it('gtceu:uxv_machine_hull')], 250),
  M('TAP', 'Tap the Polar Cap', 'gtceu:polar_cap_tap', ['WIRE'], 25, 5, [
    'Above a pulsar\'s magnetic poles the field tears charges off the surface. The &6Polar Cap Tap&r lowers a &6Lasagna Electrode&r into that current and burns through it, at Vela only.',
    'The tap is fiction: the voltage there is real, a way to collect it is not.',
  ], [it('gtceu:polar_cap_tap'), it('grindless:lasagna_electrode')], 250),

  // ------------------------------------------------------------------ 7. Cassiopeia A
  P('JUMPC', 'Cassiopeia A', 'grindless:ejecta_knot_dust', ['WHIPPLE'], 17.5, -2.5, [
    'The second jump: a shielded seed rides into one of the youngest supernova remnants in the galaxy and opens a ring among its ejecta. The jump is fiction; the remnant is real.',
  ], [dim('grindless:cas_a_remnant')], 300, { size: 1.25 }),
  M('KNOT', 'Knot Dust', 'gtceu:ejecta_knot_sweeper', ['JUMPC'], 20, -2.5, [
    'The star\'s core was thrown out in clumps still rich in what it made as it died. The &6Ejecta Knot Sweeper&r sweeps up &6Ejecta Knot Dust&r, and the X-ray pulse profiler maps its titanium-44.',
  ], [it('gtceu:ejecta_knot_sweeper'), it('grindless:ejecta_knot_dust')], 250),
  P('TI44', 'Titanium-44 Core', 'grindless:ti44_core', ['KNOT'], 22.5, -2.5, [
    'Titanium-44 decays into a positron emitter and lives for decades. The cascade and the calutron take it out of the dust, and the hot cell seals it into a &6Ti-44 Core&r.',
  ], [it('grindless:ti44_core')], 200),
  M('GLASER', 'Gamma Laser Module', 'gtceu:annihilation_laser_works', ['TI44'], 25, -2.5, [
    'Slow the core\'s positrons into positronium, cool it, then let it annihilate all at once into a beam. The &6Annihilation Laser Works&r makes the &6Gamma Laser Module&r.',
    'A gamma-ray laser is fiction: nobody has built one.',
  ], [it('gtceu:annihilation_laser_works'), it('grindless:gamma_laser_module')], 250),
  P('EMIT', 'Emitter Online', 'gtceu:uxv_emitter', ['GLASER', 'SENSOR'], 27.5, -4, [
    'With a gamma laser in hand, the &6UXV Emitter&r can be built. The parallel hatch and the OpV casing both need it.',
  ], [it('gtceu:uxv_emitter')], 250),

  // ------------------------------------------------------------------ 8. parts and power
  P('MOTOR', 'UXV Motor and Pump', 'gtceu:uxv_electric_motor', ['HULL'], 27.5, 0, [
    'The &6UXV Electric Motor&r is wound with pasta strand round a meteorite-iron rotor. The &6UXV Electric Pump&r pushes liquid metal with a moving field, with no moving parts in the flow.',
  ], [it('gtceu:uxv_electric_motor'), it('gtceu:uxv_electric_pump')], 200),
  P('MOVERS', 'Robot Arm', 'gtceu:uxv_robot_arm', ['MOTOR'], 30, -1.75, [
    'The &6UXV Electric Piston&r and the &6UXV Conveyor Module&r move by metals that change shape in a magnetic field. The &6UXV Robot Arm&r turns on a gear with no backlash and knows its angle to a hair.',
  ], [it('gtceu:uxv_electric_piston'), it('gtceu:uxv_conveyor_module'), it('gtceu:uxv_robot_arm')], 200),
  P('FIELD', 'UXV Field Generator', 'gtceu:uxv_field_generator', ['WIRE'], 27.5, 2.5, [
    'A plasma ring that holds its own field, wrapped in pasta strand, is what the &6UXV Field Generator&r projects from.',
  ], [it('gtceu:uxv_field_generator')], 200),
  M('MK6', 'Mk6 Fusion Ring', 'gtceu:uxv_fusion_reactor', ['MOTOR', 'FIELD'], 30, 1.25, [
    'The &6Mk6 Fusion Ring&r burns as a star does: hot CNO, then helium, carbon and oxygen. A direct energy converter takes the power off each ash, and the ash of one burn is quenched into the fuel of the next.',
    'A ring that runs a star\'s burning stages on demand is fiction.',
  ], [it('gtceu:uxv_fusion_reactor'), it('grindless:uxv_fusion_casing')], 300),
  P('MK6C4', 'Oxygen Burning', 'gtceu:oxygen_burning_ash_plasma_bucket', ['MK6'], 32.5, 1.25, [
    'The fourth burn, oxygen, is the last stage the ring runs. Its ash leaves silicon, sulfur and phosphorus once the converter and the quench caster are done with it.',
  ], [it('gtceu:oxygen_burning_ash_plasma_bucket')], 250),
  P('CELL', 'UXV SMES Cell', 'grindless:uxv_smes_cell', ['WIRE'], 22.5, 5, [
    'The nitride magnet works winds the &6UXV SMES Cell&r with pasta strand. The wireless grid jumps to UXV only when every formed tower holds these.',
  ], [it('grindless:uxv_smes_cell')], 150),

  // ------------------------------------------------------------------ 9. scale
  P('PAR', 'UXV Parallel Hatch', 'gtceu:uxv_parallel_hatch', ['EMIT'], 30, -5.5, [
    'The &6UXV Parallel Hatch&r lets the mega machines run far more recipes at once. It is the most expensive hatch of the era.',
  ], [it('gtceu:uxv_parallel_hatch')], 200),
  M('HALL', 'Stellar Fractionation Hall', 'gtceu:stellar_fractionation_hall', ['MOVERS'], 32.5, -1.75, [
    'The &6Stellar Fractionation Hall&r runs distillation tower and distillery recipes, one mode at a time, with a parallel hatch behind it. Pick the mode in the controller.',
  ], [it('gtceu:stellar_fractionation_hall')], 250),

  // ------------------------------------------------------------------ 10. the gate
  P('ARM', 'Arm Chart', 'grindless:arm_chart', ['EMIT'], 32.5, -4, [
    'The Matrioshka in Mercury orbit puts the elevator log, the Vela glitch record, the titanium-44 map and the Cygnus radio record together into the &6Arm Chart&r: our arm of the galaxy, mapped toward the centre.',
  ], [it('grindless:arm_chart')], 300),
  P('HOLD', 'Open the Bulge Gate', 'gtceu:warp_gate', ['ARM', 'MK6C4'], 35, -1.25, [
    'Hold the warp gate open at the full UXV load for sixty seconds in Cygnus X-1 orbit, then tick this box. Take care of your power first: the BZ dynamo with polar cap taps, or the Mk6 through the converter.',
    'The gate burns an FRC cartridge and keeps census III, the island chart, the arm chart, a pasta core sample and spintronic mainframes in its store.',
  ], [ck()], 300, { shape: 'diamond', size: 1.75 }),
  P('BULGE', 'Chart the Bulge', 'grindless:bulge_chart', ['HOLD'], 37.5, -1.25, [
    'Through the open gate the seed looks at the crowded centre of the galaxy. The run gives the &6Bulge Chart&r.',
  ], [it('grindless:bulge_chart')], 150),
  P('OPV', 'Gate to OpV', 'gtceu:opv_machine_casing', ['BULGE'], 40, -1.25, [
    'The &6Bulge Chart&r is the research for the OpV machine casing. Build it and the next voltage is open.',
  ], [it('gtceu:opv_machine_casing')], 400, { size: 1.5 }),
];
