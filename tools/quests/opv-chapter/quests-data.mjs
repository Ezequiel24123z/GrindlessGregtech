// Quest data for opv_age ("OpV - The Galactic Bulge"); gen.mjs in this folder writes the chapter (docs/quests.md, sections 8 and 14;
// docs/eras/opv.md, "Quests", the sixteen parts). Ids come from the keys: never rename a key once a quest has shipped.
// Positions: the trunk runs right along y = 0 from the hull to the gate. Each part is a column group; lanes above and below hold the
// side products. Every OpV package has landed, so there is no package gating.
// Texts say what a machine does, never its inputs or counts. The gate quest never rewards the gate product: it is a checkmark and the
// MAX casing, because the Sagittarius A* chart stays hidden until MAX.
// Named fiction is marked in one line: the chain strand, the Kugelblitz, the von Neumann foundry, the stable strangelet, census IV.
const it = (item, count) => ({ type: 'item', item, count });
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
  order: 13,
  icon: 'gtceu:opv_machine_casing',
  autofocus: 'START',
  title: 'OpV - The Galactic Bulge',
  subtitle: ['Chain strand cables, cryogenic circuits, a beam of antiprotons, a Kugelblitz and a fleet of probes: the way to the heart of the Milky Way.'],
};

export const QUESTS = [
  // ------------------------------------------------------------------ 1. arrival
  P('START', 'The Galactic Bulge', 'gtceu:opv_machine_casing', ['X:3D7C8C36A2896D4E'], 0, 0, [
    'The Superheavy chart gave you the &6OpV Machine Casing&r. The hull waits for parts nobody has made yet.',
    'The bulge is crowded and very old. Terzan 5 is a fossil of the early galaxy, and Sagittarius A* sits at its centre.',
  ], [it('gtceu:opv_machine_casing')], 50, { shape: 'rsquare', size: 1.5 }),
  P('HULL', 'OpV Hull', 'gtceu:opv_machine_hull', ['START'], 2.5, 0, [
    'The &6OpV Machine Hull&r is the first thing every OpV machine needs. Its cables and plates are made from a strand nobody had before.',
  ], [it('gtceu:opv_machine_hull')], 100),
  P('LOOK', 'The Way In', 'gtceu:opv_machine_casing', ['HULL'], 5, 0, [
    'Four ways lead out of the hull: chain strand and field freezing for the parts, cryogenic circuits, beams and antimatter, and the probes. Read the OpV Lines chart before you pick one.',
  ], [ck()], 50),

  // ------------------------------------------------------------------ 2. bulge relay
  P('RELAY', 'Bulge Relay', 'grindless:bulge_relay_seed', ['LOOK'], 7.5, 0, [
    'A relay seed is the first thing you send to the bulge. It arrives and starts to listen.',
  ], [it('grindless:bulge_relay_seed')], 100),
  P('LAUNCH', 'Seed Away', 'grindless:launched_bulge_seed', ['RELAY'], 10, 0, [
    'The launched seed crosses the dark between the arm and the bulge. Nothing comes back, and that is the idea.',
  ], [it('grindless:launched_bulge_seed')], 100),
  P('BCHART', 'Bulge Chart', 'grindless:bulge_chart', ['LAUNCH'], 12.5, 0, [
    'The first image from the bulge. It shows where the debris, the nodes and the old stars are.',
  ], [it('grindless:bulge_chart')], 100),

  // ------------------------------------------------------------------ 3. chain strand
  P('STRAND', 'Chain Strand', 'gtceu:chain_strand_ingot', ['HULL'], 2.5, -2.5, [
    'A strand of chain-like matter, drawn from a slab of crust. In the real universe this is only a hypothesis; here it is a material.',
    'It is caged, sorted, drawn and made into an &6ingot&r.',
  ], [it('gtceu:chain_strand_ingot')], 100),
  P('CABLE', 'Chain Strand Cable', 'gtceu:chain_strand_single_cable', ['STRAND'], 5, -2.5, [
    'Wire, braided in PBO and sheathed. The &6Chain Strand Cable&r carries OpV power.',
  ], [it('gtceu:chain_strand_single_cable')], 100),
  P('LAMINA', 'Chain Lamina', 'grindless:chain_lamina_stack', ['STRAND'], 5, -5, [
    'Thin sheets, laminated into a &6Chain Lamina Stack&r for the hull plates.',
  ], [it('grindless:chain_lamina_stack')], 100),
  P('REPEAT', 'Chain Strand Repeater', 'grindless:chain_strand_repeater', ['CABLE', 'LAMINA'], 7.5, -3.75, [
    'The link that keeps the wireless network in step across the bulge.',
  ], [it('grindless:chain_strand_repeater')], 150),

  // ------------------------------------------------------------------ 4. components
  M('MOTOR', 'Motors and Pistons', 'gtceu:opv_electric_motor', ['CABLE'], 5, 2.5, [
    'OpV motors and pistons, built from composite rotors, mesh belts and harmonic drives.',
  ], [it('gtceu:opv_electric_motor'), it('gtceu:opv_electric_piston')], 150),
  M('ARM', 'Arms and Conveyors', 'gtceu:opv_robot_arm', ['MOTOR'], 7.5, 2.5, [
    'Harmonic drives let an arm place things without a wobble. Conveyors carry them off.',
  ], [it('gtceu:opv_robot_arm'), it('gtceu:opv_conveyor_module')], 150),
  M('EMIT', 'Emitters and Sensors', 'gtceu:opv_emitter', ['ARM'], 10, 2.5, [
    'A thorium-229 crystal makes the emitter. A Compton crystal makes the sensor.',
  ], [it('gtceu:opv_emitter'), it('gtceu:opv_sensor')], 150),
  M('FIELD', 'Field Generator', 'gtceu:opv_field_generator', ['EMIT'], 12.5, 2.5, [
    'A trained coil in a chain-strand frame.',
  ], [it('gtceu:opv_field_generator')], 150),
  M('PUMP', 'Pumps and Regulators', 'gtceu:opv_electric_pump', ['FIELD'], 15, 2.5, [
    'A superfluid seal holds against any pressure. Pumps and fluid regulators use it.',
  ], [it('gtceu:opv_electric_pump'), it('gtceu:opv_fluid_regulator')], 150),

  // ------------------------------------------------------------------ 5. field freezing
  M('PRESS', 'Field Frozen Press', 'gtceu:field_frozen_press', ['LAMINA'], 7.5, -7.5, [
    'The &6Field Frozen Press&r freezes a metal in a strong magnetic field so its grains line up.',
  ], [it('gtceu:field_frozen_press')], 150),
  P('FROZEN', 'Field Frozen Casing', 'grindless:field_frozen_casing', ['PRESS'], 10, -7.5, [
    'A casing with no weak direction. The energy hatches are built around it.',
  ], [it('grindless:field_frozen_casing')], 100),
  M('HATCH', 'OpV Energy Hatches', 'gtceu:opv_energy_input_hatch', ['FROZEN'], 12.5, -7.5, [
    'The first hatches that can carry OpV power. Build a wireless network first if you can; the cells in it are your buffer.',
  ], [it('gtceu:opv_energy_input_hatch'), it('gtceu:opv_energy_output_hatch'), it('grindless:opv_smes_cell')], 200),

  // ------------------------------------------------------------------ 6. cosmic circuits
  P('SOI', 'Silicon-28 on Insulator', 'grindless:si28_soi_wafer', ['BCHART'], 15, 0, [
    'Isotopically pure silicon, split off and bonded. Fewer spins, longer coherence.',
  ], [it('grindless:si28_soi_wafer')], 100),
  P('CMOS', 'Cryo-CMOS', 'grindless:cryo_cmos_die', ['SOI'], 17.5, -2.5, [
    'Logic that works at 4 K, for control electronics next to the qubits.',
  ], [it('grindless:cryo_cmos_die')], 100),
  P('LINK', 'Cryo Optical Link', 'grindless:cryo_optical_link', ['SOI'], 17.5, 2.5, [
    'Light carries the signals in, because wires carry heat.',
  ], [it('grindless:cryo_optical_link')], 100),
  P('COSMIC', 'Cosmic Mainframe', 'gtnn:cosmic_mainframe', ['CMOS', 'LINK'], 20, 0, [
    'The OpV circuit. It joins tetrons, cryogenic logic and optical links in one mainframe.',
  ], [it('gtnn:cosmic_mainframe')], 250),

  // ------------------------------------------------------------------ 7. tetrons and gamma optics
  M('TFAB', 'Tetron Fab', 'gtceu:tetron_fab', ['COSMIC'], 22.5, -2.5, [
    'The &6Tetron Fab&r bonds a tested die to its amplifier.',
  ], [it('gtceu:tetron_fab')], 150),
  P('TETRON', 'Tetron Array', 'grindless:tetron_array', ['TFAB'], 25, -2.5, [
    'Dies are bumped, bonded and tested near absolute zero before they are put together.',
  ], [it('grindless:tetron_array')], 150),
  M('GOPT', 'Gamma Optics Works', 'gtceu:gamma_optics_works', ['COSMIC'], 22.5, 2.5, [
    'Mirrors for gamma rays are multilayers a few atoms thick. The &6Gamma Optics Works&r makes them.',
  ], [it('gtceu:gamma_optics_works'), it('grindless:gamma_multilayer_mirror')], 150),
  P('LAUE', 'Laue Lens', 'grindless:laue_lens', ['GOPT'], 25, 2.5, [
    'Bent crystals focus gamma rays by diffraction.',
  ], [it('grindless:laue_lens')], 150),

  // ------------------------------------------------------------------ 8. beams at Cygnus
  P('WINDOW', 'Beam Window', 'grindless:be_beam_window', ['TETRON'], 27.5, -2.5, [
    'A thin beryllium foil that lets the beam out and keeps the vacuum in.',
  ], [it('grindless:be_beam_window')], 100),
  M('SPALL', 'Spallation Target', 'gtceu:spallation_target_station', ['WINDOW'], 30, -2.5, [
    'The &6Spallation Target Station&r hits an iridium target with protons and collects what comes out.',
  ], [it('gtceu:spallation_target_station'), it('grindless:ir_spallation_target')], 200),
  M('COOLER', 'Antiproton Decelerator', 'gtceu:antiproton_decelerator', ['SPALL'], 32.5, -2.5, [
    'Stochastic cooling pickups and an electron cooler slow the antiprotons until they can be trapped.',
  ], [it('gtceu:antiproton_decelerator'), it('grindless:electron_cooler')], 200),
  P('STACK', 'Antiproton Stack', 'grindless:antiproton_stack_opv', ['COOLER'], 35, -2.5, [
    'Cold antiprotons, held in a trap. Handle them as you would anything that destroys itself on touch.',
  ], [it('grindless:antiproton_stack_opv')], 200),

  // ------------------------------------------------------------------ 9. antihydrogen and power
  P('LYMAN', 'Lyman-alpha Laser', 'grindless:lyman_alpha_laser', ['LAUE'], 27.5, 2.5, [
    'A laser that cools antihydrogen to a standstill.',
  ], [it('grindless:lyman_alpha_laser'), it('grindless:octupole_trap_magnet')], 150),
  M('ANTIH', 'Antihydrogen Foundry', 'gtceu:antihydrogen_foundry', ['LYMAN', 'STACK'], 37.5, 0, [
    'The &6Antihydrogen Foundry&r joins an antiproton with a positron, and the magnetic trap keeps it off the walls.',
  ], [it('gtceu:antihydrogen_foundry'), it('grindless:antihydrogen_ice_cell')], 250),
  M('ENGINE', 'Annihilation Engine', 'gtceu:annihilation_engine', ['ANTIH'], 40, 0, [
    'Matter and antimatter turned entirely into energy. Everything that comes out is either captured or absorbed.',
  ], [it('gtceu:annihilation_engine')], 300),
  P('ABSORB', 'Absorbers and Panels', 'grindless:gamma_absorber_tile', ['ENGINE'], 42.5, 0, [
    'Absorber tiles take the gamma flash. TPV panels turn heat into power. ACMF pellets start the burn.',
  ], [it('grindless:gamma_absorber_tile'), it('grindless:tpv_panel'), it('grindless:acmf_pellet')], 150),

  // ------------------------------------------------------------------ 10. positrons at SGR
  M('PACC', 'Positron Accumulator', 'gtceu:positron_accumulator', ['ANTIH'], 40, -2.5, [
    'Positrons collect in a Penning trap until there are enough.',
  ], [it('gtceu:positron_accumulator')], 150),
  P('POS', 'Dense Positron Cell', 'grindless:dense_positron_cell', ['PACC'], 42.5, -2.5, [
    'A dense plasma of positrons, sealed in a cell.',
  ], [it('grindless:dense_positron_cell')], 150),

  // ------------------------------------------------------------------ 11. exotic matter
  M('DISTIL', 'Strangelet Distiller', 'gtceu:strangelet_distiller', ['POS'], 45, -2.5, [
    'A lead beam gives a fireball. The distiller picks out the seed of a strangelet.',
  ], [it('gtceu:strangelet_distiller'), it('grindless:strangelet_seed')], 200),
  M('VAULT', 'Strangelet Vault', 'gtceu:strangelet_vault', ['DISTIL'], 47.5, -2.5, [
    'The vault grows a strangelet by feeding it neutrons. A negative strangelet is contained and annihilated.',
  ], [it('gtceu:strangelet_vault'), it('grindless:grown_strangelet')], 200),
  P('EXOTIC', 'Stable Exotic Matter', 'grindless:stable_exotic_matter', ['VAULT'], 50, -2.5, [
    'A strangelet that stays stable is a hypothesis, not an observation. In this pack it is a fuel.',
  ], [it('grindless:stable_exotic_matter')], 250),

  // ------------------------------------------------------------------ 12. Kugelblitz
  M('KFORGE', 'Kugelblitz Forge', 'gtceu:kugelblitz_forge', ['EXOTIC'], 52.5, -2.5, [
    'Light so dense it collapses into a black hole. The forge holds the seed.',
    'Forming a Kugelblitz goes beyond Hawking evaporation, which is real physics. Here it is fiction.',
  ], [it('gtceu:kugelblitz_forge'), it('grindless:kugelblitz_seed')], 250),
  P('KCORE', 'Kugelblitz Core', 'grindless:kugelblitz_core', ['KFORGE'], 55, -2.5, [
    'A small black hole made of nothing but gamma rays.',
  ], [it('grindless:kugelblitz_core')], 250),
  M('HAWK', 'Hawking Collector', 'gtceu:hawking_collector', ['KCORE'], 57.5, -2.5, [
    'A black hole radiates. The collector takes the power and leaves the shell. It also makes the drive for the warp gate.',
  ], [it('gtceu:hawking_collector'), it('grindless:hawking_drive')], 300),

  // ------------------------------------------------------------------ 13. probes to Terzan 5
  M('DEBRIS', 'Debris Harvester', 'gtceu:debris_harvester', ['BCHART'], 15, 5, [
    'The bulge is full of debris. The &6Debris Harvester&r collects it for the probes.',
  ], [it('gtceu:debris_harvester'), it('grindless:bulge_debris')], 150),
  P('PSEED', 'Probe Seed', 'grindless:probe_seed', ['DEBRIS'], 17.5, 5, [
    'A probe that copies itself. Terzan 5 supplies the metal.',
  ], [it('grindless:probe_seed')], 200),
  M('FOUNDRY', 'Von Neumann Foundry', 'gtceu:von_neumann_foundry', ['PSEED'], 20, 5, [
    'A foundry that makes copies of its own probes. Self-replication is fiction here; a real one is far away.',
  ], [it('gtceu:von_neumann_foundry')], 250),
  M('SINTER', 'Replication Refinery', 'gtceu:replication_refinery', ['FOUNDRY'], 22.5, 5, [
    'The refinery sinters silicate into casings for the copies.',
  ], [it('gtceu:replication_refinery'), it('grindless:cluster_sinter_casing')], 200),

  // ------------------------------------------------------------------ 14. Kardashev III
  M('NODE', 'Collector Node Works', 'gtceu:collector_node_works', ['SINTER'], 25, 5, [
    'Nodes unfold in the bulge and collect the light of its stars.',
  ], [it('gtceu:collector_node_works'), it('grindless:deployed_node_pack')], 200),
  M('CENSUS3', 'Bulge Collector', 'gtceu:bulge_collector', ['NODE'], 27.5, 5, [
    'The &6Bulge Collector&r turns starlight into power. The &6Bulge Light Census&r records what it finds.',
  ], [it('gtceu:bulge_collector'), it('grindless:bulge_light_census')], 300),

  // ------------------------------------------------------------------ 15. census IV and scale
  P('CENSUS4', 'Superheavy Census IV', 'grindless:superheavy_census_iv', ['HAWK'], 60, -2.5, [
    'Californium and nickel, fired at one another, make an element beyond 124. Element 126 is fiction here: the real island of stability is not found.',
  ], [it('grindless:superheavy_census_iv')], 300),
  M('PARHATCH', 'Parallel Hatch', 'gtceu:opv_parallel_hatch', ['COSMIC'], 22.5, 7.5, [
    'The &6OpV Parallel Hatch&r runs a machine many times at once.',
  ], [it('gtceu:opv_parallel_hatch')], 250),
  M('ARRAY', 'Assembly Line Array', 'gtceu:assembly_line_array', ['PARHATCH'], 25, 7.5, [
    'An array of assembly lines, side by side, all running together.',
  ], [it('gtceu:assembly_line_array')], 300),

  // ------------------------------------------------------------------ 16. gate to MAX
  P('MAX', 'Gate to MAX', 'gtceu:max_machine_casing', ['CENSUS4', 'CENSUS3', 'ENGINE'], 62.5, 0, [
    'The Sagittarius A* chart is not on any shelf yet. When you have power to spare, the warp gate waits for it. Charge your SMES bank first.',
  ], [it('gtceu:max_machine_casing')], 100, { shape: 'rsquare', size: 1.5 }),
];
