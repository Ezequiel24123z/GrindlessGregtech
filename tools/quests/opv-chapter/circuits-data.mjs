// Quest data for opv_circuits: the cryogenic ladder from the silicon-28 wafer to the cosmic mainframe that is the OpV circuit, the OpV sensor, the
// harmonic drive, and the OpV hull-side parts, hatches and circuit assembler (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/opv.md,
// "Our multiblocks", "Family steps"). Rows start at a link to an opv_age quest (START, or the hull step that opv_age keeps). The machines that make
// these parts are in opv_machines, so the chip quests ask for products only, and charts own the line intermediates. The tetron array stays a product
// step in opv_age (TETRON), the hull is HULL there, and the generators, parallel hatch and old controllers are in opv_integration.
// Moved here from opv_age with their keys: LINK, COSMIC (SOI and CMOS are now steps 7 to 18 of qubit-data.mjs). New: DRIVE, SENSOR, COMP, HATCH, ASM and CH_ASM. MOTOR, ARM, EMIT, FIELD and PUMP
// are merged into COMP, and HATCH (the old connector quest) is now the energy hatches.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.circuits,
  filename: 'opv_circuits',
  era: 'opv',
  role: 'circuits',
  order: 1,
  icon: 'gtnn:cosmic_mainframe',
  autofocus: 'LINK',
  title: 'OpV: Circuits',
  subtitle: ['Logic that runs at the temperature of space, and the sensor, drive, parts and assembler that put it to work.'],
};

export const LINKS = [
  { key: 'C_L_DRIVE', ref: 'START', x: 0, y: 3 },
  { key: 'C_L_HULL', ref: 'HULL', x: 0, y: 6 },
];

// A row's first quest depends on the era quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

const q = (key, kind, title, icon, deps, x, y, teach, desc, tasks, xpN) => ({
  key, kind, title, icon, deps: deps_(deps), x, y, ...(teach ? { teach } : {}), desc, tasks, rewards: [xp(xpN)],
});

export const QUESTS = [
  // ------------------------------------------------------------------ cryogenic logic: wafer, chip, parts, mainframe
  q('LINK', 'step', 'Cryogenic Links', 'grindless:cryo_optical_link', ['Q18'], 7, 0, null, [
    'A niobium interposer carries the signals through the die, a HEMT amplifier lifts them out of the noise, and an optical link takes them out of the cold without carrying heat in. The &6Nb TSV Interposer&r is tested cold in the helium refrigerator, the &6HEMT Amplifier&r is cut from its wafer and the &6Cryo Optical Link&r is drawn on the fibre tower.',
  ], [it('grindless:nb_tsv_interposer'), it('grindless:hemt_amplifier'), it('grindless:cryo_optical_link')], 120),
  q('COSMIC', 'circuit', 'Cosmic Mainframe', 'gtnn:cosmic_mainframe', ['LINK'], 9.5, 0, {
    for: 'A cryo-CMOS die, a niobium interposer, an amplifier and an optical link, all joined in one cold package. The &6Cosmic Mainframe&r is the OpV circuit.',
    needs: 'The cryo-CMOS die and the three parts of the row before it, in the photonic integration hall.',
    unlocks: 'Every recipe that asks for OpV circuits: the sensor, the hatches and every OpV controller.',
    automate: 'One of each part per mainframe, so keep a dedicated chest and never a big stock.',
  }, [], [it('gtnn:cosmic_mainframe')], 250),

  // ------------------------------------------------------------------ drive and sensor
  q('DRIVE', 'step', 'Harmonic Drive', 'grindless:opv_harmonic_drive', ['C_L_DRIVE'], 2, 3, null, [
    'A flexible steel cup that deforms against a ring of teeth turns with no backlash at all. The &6OpV Harmonic Drive&r is the gear of the OpV robot arm and holds position to a fraction of an arc second.',
  ], [it('grindless:opv_harmonic_drive')], 100),
  q('TISAPH', 'wafer', 'Ti:Sapphire Boule', 'grindless:ti_sapphire_boule', ['H_OPV_CIRCUITS'], 12.5, 9, {
    for: 'A sapphire crystal doped with titanium is the gain medium of a tunable laser. The &6Ti:Sapphire Boule&r is the crystal that the Lyman-alpha laser of the antihydrogen line is built round.',
    needs: 'The crystal growth furnace, two sapphire dust, a titanium dust and an iridium crucible, with a circuit of any kind. It draws OpV power.',
    unlocks: 'The Lyman-alpha laser, which cools the antihydrogen atoms before they freeze into a cell, beside the krypton tripler cell.',
    automate: 'Feed the dusts by ME and keep a spare crucible; one boule is used up per laser, so stock only a few.',
  }, [], [it('grindless:ti_sapphire_boule')], 120),
  q('SENSOR', 'circuit', 'OpV Sensor', 'gtceu:opv_sensor', ['COSMIC'], 12, 0, {
    for: 'The &6OpV Sensor&r measures what the detectors of the age need to see: single photons, charge and spin. The emitter, the field generator and many controllers use one.',
    needs: 'An HPGE Compton crystal, a chain lamina stack, a cryo optical link, chain strand cable, a UXV sensor and OpV circuits, in an assembler.',
    unlocks: 'The energy input hatches, the annihilation shield casing and the controllers that watch a beam.',
    automate: 'Mainframes by ME in matched counts; keep sensors in a small stock.',
  }, [], [it('gtceu:opv_sensor')], 200),

  // ------------------------------------------------------------------ hull-side parts, hatches, assemblers
  q('COMP', 'step', 'OpV Components', 'gtceu:opv_electric_motor', ['C_L_HULL', 'DRIVE'], 4.5, 6, null, [
    'The &6OpV Electric Motor&r turns chain composite rods inside a chain field coil, a trained REBCO pancake wound with chain strand, and is charged with superfluid helium-3. The &6OpV Electric Pump&r spins a chain composite rotor behind superfluid helium-3 seals, and the conveyor drives a chain mesh belt. The piston runs on rods and lamina stacks, the robot arm turns on the harmonic drive, and the emitter and sensor carry the Th-229 lasing crystal and the Compton crystal on a cryo optical link. The field generator and the fluid regulator close the set.',
  ], [
    it('gtceu:opv_electric_motor'), it('gtceu:opv_electric_pump'), it('gtceu:opv_electric_piston'), it('gtceu:opv_conveyor_module'),
    it('gtceu:opv_robot_arm'), it('gtceu:opv_emitter'), it('gtceu:opv_field_generator'), it('gtceu:opv_fluid_regulator'),
  ], 200),
  q('HATCH', 'step', 'OpV Energy Hatches', 'gtceu:opv_energy_input_hatch', ['COMP'], 7, 6, null, [
    'The &6OpV Energy Hatch&r takes power in or gives it back, as a single, four or sixteen amp hatch. Each is built with an AlN power die and a field-frozen plate. The beam lines and the engines of the age are wired to them.',
  ], [it('gtceu:opv_energy_input_hatch'), it('gtceu:opv_energy_output_hatch')], 150),
  q('ASM', 'machine', 'OpV Assembler', 'gtceu:opv_assembler', ['HATCH'], 9.5, 6, {
    for: 'The &6OpV Assembler&r is the single-block assembler at the voltage of the age, for every part that does not need a line.',
    needs: 'An OpV hull, the OpV components and the machine casing of the age.',
    unlocks: 'Faster part rows at OpV voltage.',
    automate: 'Parts by ME in and out; one assembler per product keeps the recipes from interleaving.',
  }, [], [it('gtceu:opv_assembler')], 120),
  q('CH_ASM', 'machine', 'OpV Circuit Assembler', 'gtceu:opv_circuit_assembler', ['ASM'], 12, 6, {
    for: 'The &6OpV Circuit Assembler&r works at the voltage of the cosmic mainframe, for everything below it that still wants a board.',
    needs: 'An OpV hull, the OpV components and the cleanroom you already run.',
    unlocks: 'Faster circuit rows at OpV voltage; the mainframe itself still comes from the cold line.',
    automate: 'Boards and chips by ME; keep a small stock of what it returns.',
  }, [], [it('gtceu:opv_circuit_assembler')], 120),
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
