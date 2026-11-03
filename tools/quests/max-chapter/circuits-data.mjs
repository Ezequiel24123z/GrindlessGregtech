// Quest data for max_circuits: the three MAX parts that make the supracausal mainframe (squeezed-light chip, tweezer die, cryo photonic interposer), the
// mainframe itself (the one MAX circuit), the assembly hall that puts MAX parts together, the nine MAX components and the MAX parts and hatches
// (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/max.md, "Voltages, hull, hatches and controllers"). Every row starts at a link to a max_age
// quest (START) or, where a part waits for a machine of max_machines, at a link to that gear. Charts own the line intermediates: these quests ask for
// chips, dies and parts only. MAX has one circuit and no MAX assembler, so the ladder is the three parts and the mainframe, and the assembler step is the
// assembly hall. All keys are new (prefix C_): the old max_age quests for these items are replaced, never copied, so no key is defined twice.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.circuits,
  filename: 'max_circuits',
  era: 'max',
  role: 'circuits',
  order: 1,
  icon: 'gtnn:supracausal_mainframe',
  autofocus: 'C_CHIP',
  title: 'MAX: Circuits',
  subtitle: ['One circuit at the top of the ladder, and the hall, components and hatches that turn it into machines.'],
};

export const LINKS = [
  { key: 'C_L_PHOT', ref: 'START', x: 0, y: 0 },
  { key: 'C_L_ATOM', ref: 'M_ATOM', x: 12.5, y: 3 },
  { key: 'C_L_BELT', ref: 'M_MEMB', x: 12.5, y: 4.5 },
  { key: 'C_L_FIELD', ref: 'M_MEMB', x: 12.5, y: 6 },
];

// A row's first quest depends on the quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

const q = (key, kind, title, icon, deps, x, y, teach, desc, tasks, xpN) => ({
  key, kind, title, icon, deps: deps_(deps), x, y, ...(teach ? { teach } : {}), desc, tasks, rewards: [xp(xpN)],
});

export const QUESTS = [
  // ------------------------------------------------------------------ the ladder: chip, die, interposer, mainframe
  q('C_CHIP', 'wafer', 'Squeezed Light Chip', 'grindless:squeezed_light_chip', ['C_L_PHOT'], 2.5, 0, {
    for: 'Light squeezed until its noise drops below what any ordinary beam can reach. The &6Squeezed Light Chip&r goes into the mainframe, and the MAX emitter is built around it. It is one of three parts the mainframe needs, and they can be made in any order.',
    needs: 'The SNSPD fabrication line, with a bonded pump-laser die, an SNSPD, gold dust and superfluid helium.',
    unlocks: 'The mainframe and the MAX emitter.',
    automate: 'Feed the fabrication line by ME; chips are small, so stock a few and send the rest on.',
  }, [], [it('grindless:squeezed_light_chip')], 120),
  q('C_DIE', 'wafer', 'Tweezer Array Die', 'grindless:tweezer_array_die', ['H_MAX_CIRCUITS'], 5, 0, {
    for: 'Single atoms held in beams of light, one by one, on a die. The &6Tweezer Array Die&r is the logic the mainframe reads its qubits from. It does not depend on the chip or the interposer.',
    needs: 'A laser engraver, a calibrated lens and a purple glass lens.',
    unlocks: 'The mainframe, and the Rydberg array works, which is researched from it.',
    automate: 'Lenses by ME in matched counts; the engraver returns dies in a chest.',
  }, [], [it('grindless:tweezer_array_die')], 120),
  q('C_INTERP', 'circuit', 'Cryo Photonic Interposer', 'grindless:cryo_photonic_interposer', ['H_MAX_CIRCUITS'], 7.5, 0, {
    for: 'The board that joins the chips at millikelvin. The &6Cryo Photonic Interposer&r carries light between them without heating either. It is made on its own, not from the chip or the die.',
    needs: 'The nuclear demagnetisation line, with a transducer wafer, a millikelvin cryostat module and helium-3/helium-4 mixture.',
    unlocks: 'The mainframe.',
    automate: 'Keep a few of each part per mainframe in a dedicated chest; a big stock gains nothing.',
  }, [], [it('grindless:cryo_photonic_interposer')], 150),
  q('C_MAINF', 'circuit', 'Supracausal Mainframe', 'gtnn:supracausal_mainframe', ['C_CHIP', 'C_DIE', 'C_INTERP'], 10, 0, {
    for: 'The only circuit of MAX, and the last one the pack has.     The &6Supracausal Mainframe&r is the end of the staged line: the Photonic Integration Hall takes a shielded quantum module (built from the interposer, tetron dies and squeezed-light chips), 3 tweezer array dies, 7 OpV circuits, programmed circuit 9 and 3,142 mB of superfluid helium-3, and runs 4,800 ticks.',
        needs: 'The Photonic Integration Hall (see the M1 line in the lines section), superfluid helium-3 and a stock of the parts.',
    unlocks: 'Every MAX component, hatch and controller.',
    automate: 'Three part lines into one hall: give each its own chest so one slow line never starves the others.',
  }, [], [it('gtnn:supracausal_mainframe')], 250),

  // ------------------------------------------------------------------ the assembler step and the components
  q('C_HALL', 'machine', 'The Assembly Hall', 'gtceu:assembly_hall', ['C_MAINF'], 12.5, 0, {
    for: 'MAX has no assembler of its own, so MAX parts are put together in the &6Assembly Hall&r. It takes many parts at once and does the work of a whole row of assemblers.',
    needs: 'The hall controller and two OpV hatches that give it MAX voltage, because MAX hatches do not exist yet.',
    unlocks: 'Every MAX component, and later the hatches that replace the OpV pair.',
    automate: 'Parts by ME; the hall hands back one kind at a time, so a pattern provider per component keeps it busy.',
  }, [], [it('gtceu:assembly_hall')], 150),
  q('C_MOTOR', 'step', 'Motors and Pistons', 'grindless:max_electric_motor', ['C_HALL'], 15, 0, null, [
    'MAX motors wind strand cable round a bearing that floats without touching anything, and the piston is a motor with a harmonic drive and a stack of shape-changing metal. The older motors will not do here.',
  ], [it('grindless:max_electric_motor'), it('grindless:max_electric_piston')], 100),
  q('C_PUMP', 'step', 'Pump', 'grindless:max_electric_pump', ['C_MOTOR'], 17.5, 0, null, [
    'The &6MAX Electric Pump&r is a motor with a rotor and a superfluid seal. Nothing leaks past it, which is the point.',
  ], [it('grindless:max_electric_pump')], 100),
  q('C_REG', 'step', 'Fluid Regulator', 'grindless:max_fluid_regulator', ['C_PUMP'], 20, 0, null, [
    'The &6MAX Fluid Regulator&r adds a superfluid valve and a tetron array to the pump, so it can meter a flow nobody can see.',
  ], [it('grindless:max_fluid_regulator')], 100),
  q('C_EMIT', 'step', 'Emitter', 'grindless:max_emitter', ['C_HALL'], 12.5, 1.5, null, [
    'A squeezed-light chip behind an optical isolator, so the light goes out and nothing comes back. The &6MAX Emitter&r goes into the field generator and most controllers.',
  ], [it('grindless:max_emitter')], 100),
  q('C_ARM', 'step', 'Robot Arm', 'grindless:max_robot_arm', ['C_MOTOR'], 15, 1.5, null, [
    'Motors, a piston and a circuit: the &6MAX Robot Arm&r. It is also what the belt seed and the Rydberg works are built around.',
  ], [it('grindless:max_robot_arm')], 100),

  // ------------------------------------------------------------------ components that wait for a home machine
  q('C_SENS', 'step', 'Sensor', 'grindless:max_sensor', ['C_L_ATOM'], 15, 3, null, [
    'The &6MAX Sensor&r reads gravity from atoms, so it waits for the atom interferometer works to make the gradiometer. Until then, every MAX machine that wants one waits too.',
  ], [it('grindless:max_sensor')], 120),
  q('C_CONV', 'step', 'Conveyor Module', 'grindless:max_conveyor_module', ['C_L_BELT'], 15, 4.5, null, [
    'A belt that carries the load on a film one atom thick. The &6MAX Conveyor Module&r needs the membrane line, and the buses need the conveyor.',
  ], [it('grindless:max_conveyor_module')], 120),
  q('C_FIELD', 'step', 'Field Generator', 'grindless:max_field_generator', ['C_L_FIELD'], 15, 6, null, [
    'The part that bends space: an emitter, field coils, superconducting membranes, stable exotic matter and regulators. The &6MAX Field Generator&r is the last component and the one every big machine asks for most.',
  ], [it('grindless:max_field_generator')], 150),
  q('C_PARTS', 'step', 'MAX Parts and Hatches', 'gtceu:max_energy_input_hatch', ['C_SENS', 'C_CONV'], 17.5, 3, null, [
    'The &6MAX Energy Input Hatch&r, its 16 A version, the &6MAX Input Bus&r and the &6MAX Battery&r are assembly-line recipes built on the MAX hull, with MAX sensors and circuits. With them in place the OpV pair you have been using can retire.',
  ], [it('gtceu:max_energy_input_hatch'), it('gtceu:max_energy_input_hatch_16a'), it('gtceu:max_input_bus'), it('gtceu:max_battery')], 150),
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
