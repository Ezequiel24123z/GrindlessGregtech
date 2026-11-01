// Quest data for maxplus_circuits: the MAX+ cable (line P4 ends at the wire), the hull and casing, the seven core lines and nine components (C1-C7), the horizon
// processor with its die and interposer (Q1, Q2), the controller recipe and the MAX hatches (docs/reforge/05_quest_design.md, sections 2.3, 2.4 and 3.2;
// docs/eras/maxplus.md, "Voltages, hull, hatches and controllers" and "Lines"). Charts own the line intermediates: these quests ask for end products only,
// the core of a line standing for the line. Rows hang from maxplus_age_1 and maxplus_age_2 keys (START, TAP, BN, BDEG, META_B) and from MA_CLAD of
// maxplus_machines. All keys are new (prefix CI_) so they never collide with XP-C2a or XP-C2c.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: 'maxplus_circuits',
  era: 'maxplus',
  role: 'circuits',
  order: 3,
  icon: 'grindless:horizon_processor',
  autofocus: 'CI_PROC',
  title: 'MAX+: Circuits',
  subtitle: ['A cable of strand, nine components and the one circuit above the top: the horizon processor.'],
};

export const LINKS = [
  { key: 'CI_L_START', ref: 'START', x: 0, y: 0 },
  { key: 'CI_L_CLAD', ref: 'MA_CLAD', x: 0, y: 1.5 },
  { key: 'CI_L_BN', ref: 'BN', x: 0, y: 3 },
  { key: 'CI_L_BDEG', ref: 'BDEG', x: 0, y: 4.5 },
  { key: 'CI_L_META', ref: 'META_B', x: 0, y: 6.5 },
  { key: 'CI_L_TAP', ref: 'TAP', x: 0, y: 12 },
];

// A row's first quest depends on the quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

const q = (key, kind, title, icon, deps, x, y, teach, desc, tasks, xpN) => ({
  key, kind, title, icon, deps: deps_(deps), x, y, ...(teach ? { teach } : {}), desc, tasks, rewards: [xp(xpN)],
});

export const QUESTS = [
  // ------------------------------------------------------------------ cable, hull and the motor
  q('CI_WIRE', 'step', 'Kerr Strand Wire', 'grindless:kerr_strand_wire', ['CI_L_CLAD'], 2.5, 1.5, null, [
    'The refinery clads the strand; a pasta draw bench then pulls it into &6Kerr Strand Wire&r. This wire is the MAX+ cable, and it carries the coils and the casing. The line stops at the wire: later steps coat it, braid it and wind it.',
  ], [it('grindless:kerr_strand_wire')], 120),
  q('CI_HULL', 'step', 'The MAX+ Hull', 'grindless:horizon_machine_casing', ['CI_WIRE', 'CI_L_BN'], 4.5, 2.25, null, [
    'There is no MAX+ hull block. Machines use the MAX &6Machine Hull&r with the &6Horizon Machine Casing&r, which is MAX casing, four compressed plates and strand cable. Every MAX+ controller asks for two casings.',
  ], [it('gtceu:max_machine_hull'), it('grindless:horizon_machine_casing')], 150),
  q('CI_MOTOR', 'step', 'Motor and Its Cores', 'grindless:maxplus_electric_motor', ['CI_WIRE', 'CI_L_BDEG'], 4.5, 4.5, null, [
    'The &6MAX+ Electric Motor&r joins two &6Kerr Field Coils&r, a &6Bound-Matter Rotor&r and a MAX motor, on the assembly line at the top voltage. The coil is a five-step line on strand wire; the rotor is a four-step line on the degenerate billet.',
    'The two cores come first, each ending in a single part. The motor then uses its MAX counterpart, so the older line stays running.',
  ], [it('grindless:kerr_field_coil'), it('grindless:bound_matter_rotor'), it('grindless:maxplus_electric_motor')], 200),
  q('CI_PISTON', 'step', 'Piston and Actuator', 'grindless:maxplus_electric_piston', ['CI_MOTOR'], 7, 3, null, [
    'A motor with a stack of shape-changing crystal, grown, cut, electroded and stacked. The &6Horizon Actuator Stack&r is the core and the &6MAX+ Electric Piston&r the part.',
  ], [it('grindless:horizon_actuator_stack'), it('grindless:maxplus_electric_piston')], 150),
  q('CI_PUMP', 'step', 'Pump and Regulator', 'grindless:maxplus_electric_pump', ['CI_MOTOR', 'CI_L_META'], 4.5, 6.5, null, [
    'Pump and regulator both take the &6Horizon Valve&r that the loom makes, so they wait for the meta-materials. The pump is a motor and a rotor; the &6Fluid Regulator&r adds a second valve and two processors.',
  ], [it('grindless:maxplus_electric_pump'), it('grindless:maxplus_fluid_regulator')], 150),
  q('CI_BELT', 'step', 'Conveyor Module', 'grindless:maxplus_conveyor_module', ['CI_MOTOR'], 7, 6, null, [
    'The &6Horizon Belt&r is a braided web of strand wire, primed, coated and finished on the membrane line. Two motors carry it as the &6MAX+ Conveyor Module&r.',
  ], [it('grindless:horizon_belt'), it('grindless:maxplus_conveyor_module')], 150),

  // ------------------------------------------------------------------ the horizon processor
  q('CI_DIE', 'wafer', 'Horizon Logic Die', 'grindless:horizon_logic_die', ['CI_L_START'], 2.5, 9, {
    for: 'A silicon-28 wafer, spin-stacked on a racetrack fab and cut to size. The &6Horizon Logic Die&r is the logic half of the horizon processor.',
    needs: 'The calutron for pure silicon-28, crystal growth, the beam-ultraviolet scanner and the racetrack fab, six steps in all.',
    unlocks: 'The horizon processor, which asks for two dies.',
    automate: 'Stock the boules by ME; the cutter returns dies by chest, so give it a buffer.',
  }, [], [it('grindless:horizon_logic_die')], 250),
  q('CI_INTERP', 'wafer', 'Horizon Interposer', 'grindless:horizon_interposer', ['CI_L_START'], 2.5, 10.5, {
    for: 'The board that joins the dies with light, written by a femtosecond laser and chilled in the cryostat. The &6Horizon Interposer&r carries the waveguides between them.',
    needs: 'Thin-film lithium niobate, the femtosecond writer, molecular-beam epitaxy for the piezo layer and the millikelvin cryostat.',
    unlocks: 'The horizon processor, one interposer per circuit.',
    automate: 'Keep one chest per interposer step; the cryostat is the slow one.',
  }, [], [it('grindless:horizon_interposer')], 250),
  q('CI_PROC', 'circuit', 'Horizon Processor', 'grindless:horizon_processor', ['CI_DIE', 'CI_INTERP', 'CI_L_TAP'], 5, 9.75, {
    for: 'The circuit above the top of the ladder. The &6Horizon Processor&r joins two logic dies, an interposer, a quantum memory node, a Rydberg logic array, two mainframes and condensate.',
    needs: 'The UEV photonic integration hall at the top voltage, and one of every older part, with kerr condensate from the shell.',
    unlocks: 'Every MAX+ component and controller. A controller asks for eight; the Hyperstargate asks for sixteen.',
    automate: 'Six inputs on six chests; a missing one stalls the hall, so alarm on the stock.',
  }, [], [it('grindless:horizon_processor')], 400),
  q('CI_CTRL', 'step', 'The Controller Recipe', 'gtceu:max_machine_hull', ['CI_PROC'], 7.5, 9.75, null, [
    'Every MAX+ controller is built on the assembly line: one MAX hull from the hull quest, two Horizon Machine Casings, eight processors, kerr condensate, at least eight components from three families, and the inputs of its own domain.',
    'The components are listed here; the domain inputs are in the machine\'s own quest.',
  ], [ck()], 100),

  // ------------------------------------------------------------------ components that need a processor
  q('CI_EMIT', 'step', 'Emitter and Photonic Engine', 'grindless:maxplus_emitter', ['CI_PROC'], 7.5, 8.25, null, [
    'A photonic engine, a MAX emitter and two processors. The &6Horizon Photonic Engine&r is a five-step line from diamond plate to foundry; the &6MAX+ Emitter&r is the part it feeds.',
  ], [it('grindless:horizon_photonic_engine'), it('grindless:maxplus_emitter')], 200),
  q('CI_SENS', 'step', 'Sensor and Phase Core', 'grindless:maxplus_sensor', ['CI_PROC'], 7.5, 11.25, null, [
    'Single-photon detectors on a wafer, read out, cut and chilled make the &6Horizon Phase Sensor Core&r. With a MAX sensor and two processors it becomes the &6MAX+ Sensor&r.',
  ], [it('grindless:horizon_phase_sensor_core'), it('grindless:maxplus_sensor')], 200),
  q('CI_ARM', 'step', 'Robot Arm', 'grindless:maxplus_robot_arm', ['CI_PROC'], 7.5, 12.75, null, [
    'Two motors, a piston and two processors make the &6MAX+ Robot Arm&r. It has no core line of its own, so it is the first part that needs the motor, the piston and the processor together.',
  ], [it('grindless:maxplus_robot_arm')], 150),
  q('CI_FIELD', 'step', 'Field Generator', 'grindless:maxplus_field_generator', ['CI_EMIT', 'CI_PISTON'], 9.5, 5.5, null, [
    'The last component: an emitter, two Kerr Field Coils and a &6Condensate Field Cell&r. The cell is a five-step line that loads a niobium cavity with condensate in the refinery and seals it cold. The &6MAX+ Field Generator&r is what the big machines ask for most.',
  ], [it('grindless:condensate_field_cell'), it('grindless:maxplus_field_generator')], 250),
  q('CI_HATCH', 'step', 'MAX Hatches in Bulk', 'gtceu:max_energy_input_hatch_16a', ['CI_HULL'], 7, 2.25, null, [
    'MAX+ has no hatches of its own. Rows take GTM\'s &6MAX Energy Input Hatches&r, buses and fluid hatches, two of them at the top voltage, in bulk. The wireless versions draw on the network instead, as the integration chapter shows.',
  ], [it('gtceu:max_energy_input_hatch_16a'), it('gtceu:max_input_bus'), it('gtceu:max_output_bus'), it('gtceu:max_input_hatch_9x')], 150),
];
