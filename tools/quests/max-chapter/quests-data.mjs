// Quest data for max_age ("MAX - The Galactic Centre"); tools/quests/gen-chapters.mjs writes the chapter (docs/quests.md, sections 8 and 14;
// docs/eras/max.md, "Quests", "The ending"). Ids come from the keys: never rename a key once a quest has shipped.
// Positions: one trunk runs right along y = 0, 2.5 columns per step, in the order of max.md "Quests": way in, circuits, components,
// home machines, probe and arrival, Sagittarius A*, the belt, horizon work, the shell, the last recipe. A product of a machine hangs
// one row above it, so no line is longer than the linter allows. Every MAX package has landed, so there is no package gating.
// Substages: home (max), Sagittarius A* after the black hole orbit gate (max-sgra), the belt after the belt gate (max-nsc).
// Texts say what a machine does, never its inputs or counts. Gate quests never reward the gate product: each is a dimension task.
// MAX parts are assembled in an assembly hall on two OpV 4 A hatches (there is no MAX assembler).
// Named fiction is marked in one line: the horizon strand, Sagittarius A*'s spin, the NSC belt, the cluster-light furnace, the feeder
// ring, the mirror shell and the universe seed (Smolin's cosmological natural selection: named, not claimed).
// The epilogue is given once by the credits handler, so its quest only detects it and rewards xp.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const dim = (dimension) => ({ type: 'dimension', dimension });
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
  order: 14,
  icon: 'gtceu:max_machine_casing',
  autofocus: 'START',
  title: 'MAX - The Galactic Centre',
  subtitle: ['Horizon strand cables, supracausal circuits, a probe to Sagittarius A*, a belt of planetesimals and a mirror shell: the last recipe.'],
};

const FICTION = '&oFiction:&r ';

export const QUESTS = [
  // ------------------------------------------------------------------ 1. way in
  P('START', 'The Galactic Centre', 'gtceu:max_machine_casing', ['X:3E3C190F1A77EB6D'], 0, 0, [
    'The warp gate gave you the &6MAX Machine Casing&r. The hull waits for parts nobody has made yet.',
    'Sagittarius A* is four million suns folded into a point. Everything here is a way to reach it, feed it, and use it.',
  ], [it('gtceu:max_machine_casing')], 50, { shape: 'rsquare', size: 1.5 }),
  P('HULL', 'MAX Hull', 'gtceu:max_machine_hull', ['START'], 2.5, 0, [
    'The &6MAX Machine Hull&r is the first thing every MAX machine needs.',
  ], [it('gtceu:max_machine_hull')], 100),
  P('LOOK', 'The Way In', 'gtceu:max_machine_hull', ['HULL'], 5, 0, [
    'Four ways lead out of the hull: the strand, the circuits and components, the home machines, and the probe to Sagittarius A*. Read the MAX Lines chart before you pick one.',
  ], [ck()], 50),
  P('STRAND', 'Horizon Strand', 'gtceu:horizon_strand_single_cable', ['LOOK'], 7.5, 0, [
    'A strand of matter that never crosses the horizon. ' + FICTION + 'a cable that carries MAX power, with no real counterpart.',
  ], [it('gtceu:horizon_strand_single_cable')], 100),
  P('REPEAT', 'Strand Repeater', 'grindless:horizon_strand_repeater', ['STRAND'], 7.5, -2.5, [
    'The link that keeps the wireless network in step across the galaxy.',
  ], [it('grindless:horizon_strand_repeater')], 100),

  // ------------------------------------------------------------------ 2. circuits
  P('CHIP', 'Squeezed-Light Chip', 'grindless:squeezed_light_chip', ['STRAND'], 10, 0, [
    'A photonic chip that beats the quantum noise limit. It takes crystals, a femtosecond writer and a lot of patience.',
  ], [it('grindless:squeezed_light_chip')], 100),
  P('DIE', 'Tweezer Array Die', 'grindless:tweezer_array_die', ['CHIP'], 12.5, 0, [
    'Atoms held in light, one by one, on a die. A laser engraver does the last step.',
  ], [it('grindless:tweezer_array_die')], 100),
  P('INTERP', 'Cryo Photonic Interposer', 'grindless:cryo_photonic_interposer', ['DIE'], 15, 0, [
    'The board that joins the chips at millikelvin.',
  ], [it('grindless:cryo_photonic_interposer')], 100),
  P('MAINFRAME', 'Supracausal Mainframe', 'gtnn:supracausal_mainframe', ['INTERP'], 17.5, 0, [
    'The MAX circuit. The photonic integration hall joins the three parts with a tetron array and OpV circuits.',
  ], [it('gtnn:supracausal_mainframe')], 150, { shape: 'rsquare', size: 1.5 }),

  // ------------------------------------------------------------------ 3. components
  M('HALL', 'The Assembly Hall', 'gtceu:assembly_hall', ['MAINFRAME'], 20, 0, [
    'MAX parts are put together in an &6assembly hall&r, fed by two OpV 4 A hatches. There is no MAX assembler.',
  ], [it('gtceu:assembly_hall')], 100),
  P('MOTOR', 'Motors and Pistons', 'grindless:max_electric_motor', ['HALL'], 22.5, 0, [
    'MAX motors and pistons, built from the new strand and the bearings that float without touching.',
  ], [it('grindless:max_electric_motor'), it('grindless:max_electric_piston')], 100),
  P('PUMP', 'Pumps and Regulators', 'grindless:max_electric_pump', ['MOTOR'], 25, 0, [
    'Superfluid valves sit inside the MAX pump and the fluid regulator.',
  ], [it('grindless:max_electric_pump'), it('grindless:max_fluid_regulator')], 100),
  P('ARM', 'Arms and Conveyors', 'grindless:max_robot_arm', ['PUMP'], 27.5, 0, [
    'The robot arm and the conveyor module, at the end of the strand.',
  ], [it('grindless:max_robot_arm'), it('grindless:max_conveyor_module')], 100),
  P('EMIT', 'Emitters and Sensors', 'grindless:max_emitter', ['ARM'], 30, 0, [
    'The emitter and the sensor, the parts that sense and shine.',
  ], [it('grindless:max_emitter'), it('grindless:max_sensor')], 100),
  P('FIELD', 'Field Generator', 'grindless:max_field_generator', ['EMIT'], 32.5, 0, [
    'The part that bends space: the &6MAX Field Generator&r, last of the components.',
  ], [it('grindless:max_field_generator')], 150),
  P('BATT', 'MAX Battery', 'gtceu:max_battery', ['FIELD'], 35, 0, [
    'The battery, and the 16 A hatch that takes its power in. The hatches wait for the machines.',
  ], [it('gtceu:max_battery'), it('gtceu:max_energy_input_hatch_16a')], 100),

  // ------------------------------------------------------------------ 4. home machines
  M('RYD', 'Rydberg Array Works', 'gtceu:rydberg_array_works', ['BATT'], 37.5, 0, [
    'Atoms swollen to a thousand times their size, arranged in a lattice. The works makes the &6Rydberg logic array&r.',
  ], [it('gtceu:rydberg_array_works')], 100),
  P('RYDOUT', 'Rydberg Logic Array', 'grindless:rydberg_logic_array', ['RYD'], 37.5, -2.5, [
    'A logic array of excited atoms. Once spent it is not lost: it goes back into the works.',
  ], [it('grindless:rydberg_logic_array')], 100),
  M('ATOM', 'Atom Interferometer Works', 'gtceu:atom_interferometer_works', ['RYD'], 40, 0, [
    'Matter waves on an optical table. The works makes the &6matter-wave gradiometer&r that maps gravity.',
  ], [it('gtceu:atom_interferometer_works')], 100),
  P('GRADIO', 'Matter-Wave Gradiometer', 'grindless:matter_wave_gradiometer', ['ATOM'], 40, -2.5, [
    'It measures how steeply gravity falls from one atom to the next.',
  ], [it('grindless:matter_wave_gradiometer')], 100),
  M('MEMB', 'Membrane Line', 'gtceu:membrane_line', ['ATOM'], 42.5, 0, [
    'A film one atom thick, rolled and laid on a belt. The line makes the &6superconducting membrane&r.',
  ], [it('gtceu:membrane_line')], 100),
  P('MEMBOUT', 'Superconducting Membrane', 'grindless:superconducting_membrane', ['MEMB'], 42.5, -2.5, [
    'The skin of the horizon work: a membrane that carries current with no loss.',
  ], [it('grindless:superconducting_membrane')], 100),
  M('ARK', 'Gene Ark', 'gtceu:gene_ark', ['MEMB'], 45, 0, [
    'A library of every genome the pack has met, written to crystal. The ark makes the &6genome archive&r.',
  ], [it('gtceu:gene_ark')], 100),
  P('GENOME', 'Genome Archive', 'grindless:genome_archive', ['ARK'], 47.5, 0, [
    'The archive goes in the last seed. What is written there is what the new universe remembers.',
  ], [it('grindless:genome_archive')], 100),

  // ------------------------------------------------------------------ 5. probe and arrival
  P('PROBE', 'Relay Probe', 'grindless:gc_relay_probe', ['GENOME'], 50, 0, [
    'A relay probe for the Galactic Centre. Nothing comes back from it: the gate to the black hole orbit takes it in.',
  ], [it('grindless:gc_relay_probe')], 150),
  P('LAUNCH', 'Probe Away', 'grindless:launched_gc_probe', ['PROBE'], 52.5, 0, [
    'The launched probe crosses twenty-six thousand light years. The gate does the rest.',
  ], [it('grindless:launched_gc_probe')], 100),
  P('SGRCHART', 'Sagittarius A* Chart', 'grindless:sgr_a_chart', ['LAUNCH'], 55, 0, [
    'The first chart of the centre, sent back by the probe.',
  ], [it('grindless:sgr_a_chart')], 100),
  P('GATE14', 'Black Hole Orbit', 'gtceu:max_machine_casing', ['SGRCHART'], 57.5, 0, [
    'The warp gate opens on the orbit of Sagittarius A*. Machines for the orbit start here. Nothing is rewarded for the gate itself.',
  ], [dim('gcyr:black_hole_orbit')], 100, { shape: 'rsquare', size: 1.5 }),

  // ------------------------------------------------------------------ 6. Sgr A* machines
  M('IMAGER', 'Photon Ring Imager', 'gtceu:photon_ring_imager', ['GATE14'], 60, 0, [
    'It looks at the light that has gone round the hole. The imager makes the &6Sagittarius A* image&r.',
  ], [it('gtceu:photon_ring_imager')], 100),
  P('SPIN', 'Spin Map', 'grindless:sgr_a_spin_map', ['IMAGER'], 62.5, 0, [
    'The spin of the hole, measured from the ring. ' + FICTION + 'this pack gives it a spin a = 0.9.',
  ], [it('grindless:sgr_a_spin_map')], 100),
  M('WINCH', 'Geroch Winch', 'gtceu:geroch_winch', ['SPIN'], 65, 0, [
    'A tether dropped over the horizon, wound on a drum. The winch takes power from the spin and wears its tether as it works.',
  ], [it('gtceu:geroch_winch')], 150),
  P('TETHER', 'Horizon Tether', 'grindless:horizon_tether', ['WINCH'], 65, -2.5, [
    'The tether that the winch wears. Keep spares.',
  ], [it('grindless:horizon_tether')], 100),
  M('INJ', 'Mass Stream Injector', 'gtceu:mass_stream_injector', ['WINCH'], 67.5, 0, [
    'It shapes the hot flow into streams, and the streams into bundles.',
  ], [it('gtceu:mass_stream_injector')], 100),
  P('BUNDLE', 'Stream Bundle', 'grindless:stream_bundle', ['INJ'], 70, 0, [
    'A bundle of streams, bound to be laid in rings around the shell.',
  ], [it('grindless:stream_bundle')], 100),
  P('NSCSEED', 'Belt Seed', 'grindless:nsc_belt_seed', ['BUNDLE'], 72.5, 0, [
    'A seed for a belt of planetesimals at the centre. The belt gate takes it in; nothing is rewarded for the gate itself.',
  ], [it('grindless:nsc_belt_seed')], 150),

  // ------------------------------------------------------------------ 7. the belt
  P('GATE15', 'The Belt Opens', 'gtceu:max_machine_casing', ['NSCSEED'], 75, 0, [
    'The warp gate opens on the nuclear star cluster belt. ' + FICTION + 'a belt of planetesimals the pack makes up for the centre.',
  ], [dim('grindless:nsc_belt')], 100, { shape: 'rsquare', size: 1.5 }),
  P('EPHEM', 'Cluster Ephemeris', 'grindless:nsc_ephemeris', ['GATE15'], 77.5, 0, [
    'Where every belt rock will be, and when.',
  ], [it('grindless:nsc_ephemeris')], 100),
  M('FURN', 'Cluster-Light Furnace', 'gtceu:cluster_light_furnace', ['EPHEM'], 80, 0, [
    'It melts the belt rock with the light of the cluster. ' + FICTION + 'the starlight is concentrated beyond what optics allow.',
  ], [it('gtceu:cluster_light_furnace')], 100),
  P('SLAG', 'Silicate Slag', 'grindless:silicate_slag', ['FURN'], 80, -2.5, [
    'What is left of the rock once the iron is out. It is not wasted: it goes to the feeder.',
  ], [it('grindless:silicate_slag')], 100),
  P('SEGTRUSS', 'Segment Truss', 'grindless:segment_truss', ['FURN'], 82.5, 0, [
    'The frame of one shell segment, rolled from belt iron.',
  ], [it('grindless:segment_truss')], 100),

  // ------------------------------------------------------------------ 8. horizon work
  M('FEEDER', 'Accretion Feeder', 'gtceu:accretion_feeder', ['SEGTRUSS'], 85, 0, [
    'It feeds the hole a ring of belt matter and takes power off the disc. ' + FICTION + 'the ring of the feeder does not exist; the disc does.',
    'The feeder wears its panel and its module. Rework them in the solar array fab and the assembler.',
  ], [it('gtceu:accretion_feeder')], 150),
  P('PANEL', 'XUV Collector Panel', 'grindless:xuv_collector_panel', ['FEEDER'], 85, -2.5, [
    'The panel that the feeder wears. The solar array fab reworks the worn ones.',
  ], [it('grindless:xuv_collector_panel')], 100),
  P('GRAD', 'Shell Gradient Map', 'grindless:shell_gradient_map', ['FEEDER'], 87.5, 0, [
    'Where on the shell the field is steepest, so the first segments go where they are needed.',
  ], [it('grindless:shell_gradient_map')], 100),
  P('CRYO', 'Shell Cryocooler', 'grindless:shell_cryocooler', ['GRAD'], 90, 0, [
    'A cooler the size of a house, to keep the shell below the temperature of the sky.',
  ], [it('grindless:shell_cryocooler')], 100),

  // ------------------------------------------------------------------ 9. the shell
  M('SHELL', 'Mirror Shell', 'gtceu:mirror_shell', ['CRYO'], 92.5, 0, [
    FICTION + 'a shell of mirrors around the hole that sends the light back in. It is the largest structure in the pack: the controller wants thirty-three cubes of space.',
    'Build it segment by segment. The quests ahead mark each quarter.',
  ], [it('gtceu:mirror_shell')], 150, { shape: 'rsquare', size: 1.5 }),
  P('SEG1', 'A Quarter of the Shell', 'grindless:mirror_shell_segment', ['SHELL'], 95, 0, [
    'The first quarter of the shell is up. The tether lines hold.',
  ], [it('grindless:mirror_shell_segment', 871)], 100),
  P('SEG2', 'Half the Shell', 'grindless:mirror_shell_segment', ['SEG1'], 97.5, 0, [
    'Half the segments are cut. Charge the cryocoolers.',
  ], [it('grindless:mirror_shell_segment', 1742)], 100),
  P('SEG3', 'Three Quarters', 'grindless:mirror_shell_segment', ['SEG2'], 100, 0, [
    'Three quarters of the segments are cut. The light starts to come back.',
  ], [it('grindless:mirror_shell_segment', 2612)], 100),
  P('SEG4', 'The Shell Is Closed', 'grindless:mirror_shell_segment', ['SEG3'], 102.5, 0, [
    'Every segment is cut. The shell closes.',
  ], [it('grindless:mirror_shell_segment', 3483)], 150),

  // ------------------------------------------------------------------ 10. the last recipe
  P('SMES', 'MAX SMES Cell', 'grindless:max_smes_cell', ['SEG4'], 105, 0, [
    'The last recipe draws from the wireless network. Charge your MAX SMES cell first.',
  ], [it('grindless:max_smes_cell')], 100),
  P('WAVE', 'Seed Wave Packet', 'grindless:seed_wave_packet', ['SMES'], 107.5, 0, [
    'A packet of waves tuned to the shell. One of them runs the shell vent for a long while.',
  ], [it('grindless:seed_wave_packet')], 100),
  P('LOCK', 'The Horizon Lock', 'grindless:horizon_lock', ['WAVE'], 110, 0, [
    'The mirror shell\'s last recipe stabilises the horizon. ' + FICTION + 'A rotating black hole\'s horizon, held still long enough to be measured and sealed in a reference.',
    'The first lock opens MAX+. The shell stays, and the recipe can run again.',
  ], [it('grindless:horizon_lock')], 200, { shape: 'rsquare', size: 1.5 }),
];
