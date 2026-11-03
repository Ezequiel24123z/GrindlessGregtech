// Quest data for uxv_circuits: the spintronic ladder from the CoFeB target to the spintronic mainframe that is the UXV circuit, the superfluid sensor,
// the UXV hull, components and hatches, and the UXV circuit assembler (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/uxv.md, "Our
// multiblocks", "Family steps"). Every row starts at a link to a uxv_age quest; the spintronic machines are in uxv_machines, so the die quests link to
// their gears. Charts own the line intermediates: these quests ask for targets, dies, wafers, chips and parts only.
// Moved here from uxv_age with their keys: TARGET, MRAM, DSO, MAINF, APER, GYRO, SENSOR, HULL, EMIT. Merged: MOTOR, MOVERS and FIELD into COMP,
// and PAR into HATCH. The MTJ, RACE, MESO and WEAK quests became gears in uxv_machines, and their dies and cells are MTJD, RACED, MESOD and WEAKC here.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.circuits,
  filename: 'uxv_circuits',
  era: 'uxv',
  role: 'circuits',
  order: 1,
  icon: 'gtnn:spintronic_mainframe',
  autofocus: 'TARGET',
  title: 'UXV: Circuits',
  subtitle: ['Logic that runs on electron spin, a sensor made of superfluid, and the hull, parts and assembler that put them to work.'],
};

export const LINKS = [
  { key: 'C_L_SPIN', ref: 'START', x: 0, y: 3 },
  { key: 'C_L_MTJ', ref: 'MTJ', x: 2, y: 4.5 },
  { key: 'C_L_RACE', ref: 'MTJ', x: 7, y: 1.5 },
  { key: 'C_L_MESO', ref: 'MTJ', x: 7, y: 6 },
  { key: 'C_L_YIG', ref: 'YIG', x: 12, y: 5.5 },
  { key: 'C_L_APER', ref: 'START', x: 0, y: 8 },
  { key: 'C_L_WEAK', ref: 'WEAK', x: 2, y: 9.5 },
  { key: 'C_L_VELA', ref: 'JUMPV', x: 0, y: 11 },
  { key: 'C_L_GLASER', ref: 'GLASER', x: 7, y: 12.5 },
];

// A row's first quest depends on the era quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

const q = (key, kind, title, icon, deps, x, y, teach, desc, tasks, xpN) => ({
  key, kind, title, icon, deps: deps_(deps), x, y, ...(teach ? { teach } : {}), desc, tasks, rewards: [xp(xpN)],
});

export const QUESTS = [
  // ------------------------------------------------------------------ spintronics: target, die, wafer, chip, mainframe
  q('TARGET', 'step', 'CoFeB Target', 'grindless:cofeb_target', ['C_L_SPIN'], 2, 3, null, [
    'Cobalt, iron and boron melted in the levitation melter, atomised, printed and pressed into a bonded &6CoFeB Target&r. The magnesia, Heusler and SAF targets come the same way.',
  ], [it('grindless:cofeb_ingot'), it('grindless:cofeb_target')], 100),
  q('MTJD', 'wafer', 'Magnetic Tunnel Junction Die', 'grindless:mtj_die', ['TARGET', 'C_L_MTJ'], 4.5, 3, {
    for: 'Two magnets with an insulator a few atoms thick between them: current tunnels through more easily when they point the same way. A wafer of them, cut up, gives the &6MTJ Die&r.',
    needs: 'The MTJ sputter cluster, a CoFeB target and a magnesia target, on silicon-28.',
    unlocks: 'The racetrack chip, the SHeQUID gyro and the mainframe itself, and later the UXV sensor, emitter and hatches.',
    automate: 'Targets wear out, so stock them by ME and send dies on to the foundry.',
  }, [], [it('grindless:mtj_die')], 120),
  q('MRAM', 'wafer', 'MRAM Wafer', 'grindless:mram_wafer', ['MTJD'], 7, 3, {
    for: 'The same junctions in a grid make memory that keeps its bits with the power off. The &6MRAM Wafer&r is sputtered, annealed and etched.',
    needs: 'The MTJ sputter cluster, the photonic foundry and a Heusler target.',
    unlocks: 'The spintronic mainframe, which takes the wafer whole as its fast memory.',
    automate: 'Dies and targets by ME; keep a few wafers waiting for the Spintronic Cluster Tool.',
  }, [], [it('grindless:mram_wafer')], 120),
  q('DSO', 'wafer', 'Scandate Substrate', 'grindless:dysco3_substrate', ['MTJD'], 7, 4.5, {
    for: 'Oxide films only grow well on a crystal whose spacing matches theirs. Dysprosium scandate is grown as a boule, sliced, polished and annealed into a &6DyScO3 Substrate&r.',
    needs: 'The crystal growth furnace from UHV, then slicing, polishing and an anneal.',
    unlocks: 'The MESO logic die, whose films need this crystal underneath.',
    automate: 'Boules are slow, so run two furnaces and stock substrates in a chest.',
  }, [], [it('grindless:dysco3_substrate')], 120),
  q('RACED', 'circuit', 'Racetrack Chip', 'grindless:racetrack_chip', ['MRAM', 'C_L_RACE'], 9.5, 3, {
    for: 'Push magnetic domains along a nanowire with current pulses and read them as they pass a head. The &6Racetrack Chip&r is the memory of the mainframe.',
    needs: 'The Spintronic Cluster Tool, an MTJ die and a patterned SAF track wafer.',
    unlocks: 'The spintronic mainframe, as its storage.',
    automate: 'Wafers by ME; the fab returns chips in a chest, so stock a few.',
  }, [], [it('grindless:racetrack_chip')], 150),
  q('MESOD', 'circuit', 'Spintronic Die', 'grindless:spintronic_die', ['DSO', 'C_L_MESO'], 9.5, 4.5, {
    for: 'One 28Si wafer carries the CMOS layer, the memory, the racetrack, the spin-wave bus and a multiferroic switch read by a spin-orbit stack. Cut in four, it makes the &6Spintronic Die&r.',
    needs: 'The MOCVD reactor, the photonic foundry, the vdW stacker, the MRAM wafer, the racetrack chip and the magnonic bus.',
    unlocks: 'The spintronic mainframe, as its logic, memory and bus in one.',
    automate: 'Run the wafer line as one chain by ME; the cutter returns four dies per wafer.',
  }, [], [it('grindless:spintronic_die')], 150),
  q('MAINF', 'circuit', 'Spintronic Mainframe', 'gtnn:spintronic_mainframe', ['RACED', 'MESOD', 'C_L_YIG'], 12, 3.75, {
    for: 'Spin waves in a garnet film carry signals between the chips with almost no heat. Logic, memory and that bus together are the &6Spintronic Mainframe&r, the UXV circuit.',
    needs: 'The photonic integration hall, a racetrack chip, a MESO logic die, an MRAM wafer, an MTJ die, a shielded interposer and a magnonic bus from the YIG furnace.',
    unlocks: 'The UXV hull, emitter and hatches, the OpV casing and the controller of every UXV machine. They take any UXV circuit.',
    automate: 'One of each part per mainframe: keep a dedicated chest, never a big stock.',
  }, [], [it('gtnn:spintronic_mainframe')], 250),

  // ------------------------------------------------------------------ the sensor
  q('APER', 'step', 'Nanoaperture Array', 'grindless:nanoaperture_array', ['C_L_APER'], 2, 8, null, [
    'A silicon nitride membrane drilled with thousands of holes, each narrower than a virus, by the electron beam furnace. Superfluid helium leaks through the &6Nanoaperture Array&r in step, as one quantum object.',
  ], [it('grindless:nanoaperture_array')], 100),
  q('WEAKC', 'circuit', 'Weak Link Cell', 'grindless:weak_link_cell', ['APER', 'C_L_WEAK'], 4.5, 8, {
    for: 'Two baths of superfluid helium joined by the array oscillate at a frequency set by the pressure across it. The &6Weak Link Cell&r is that pair, filled and sealed.',
    needs: 'The SHeQUID works, a nanoaperture array and superfluid helium.',
    unlocks: 'The SHeQUID gyro, which closes two of them into a loop.',
    automate: 'Helium by pipe; cells come out sealed, so send them straight on.',
  }, [], [it('grindless:weak_link_cell')], 150),
  q('GYRO', 'circuit', 'SHeQUID Gyro', 'grindless:shequid_gyro', ['WEAKC'], 7, 8, {
    for: 'Two weak links in a loop make an interferometer for superfluid, and it feels the rotation of the Earth. The &6SHeQUID Gyro&r is real physics.',
    needs: 'The SHeQUID works and two weak link cells.',
    unlocks: 'The UXV sensor.',
    automate: 'Cells arrive by ME; one gyro goes into each sensor.',
  }, [], [it('grindless:shequid_gyro')], 150),
  q('SENSOR', 'circuit', 'UXV Sensor', 'gtceu:uxv_sensor', ['GYRO'], 9.5, 8, {
    for: 'The &6UXV Sensor&r feels rotation with superfluid and magnetic fields with diamond. The emitter, both new generators and most controllers need one.',
    needs: 'A SHeQUID gyro, an NV diamond chip, an MTJ die and a UIV sensor, with UIV circuits, on the assembly line.',
    unlocks: 'The UXV hull and emitter, and the controllers of the Cygnus, Vela and Cassiopeia machines.',
    automate: 'Gyros by ME in matched counts; keep sensors in a small stock.',
  }, [], [it('gtceu:uxv_sensor')], 200),

  // ------------------------------------------------------------------ hull, components, assembler, emitter, hatches
  q('HULL', 'step', 'UXV Machine Hull', 'gtceu:uxv_machine_hull', ['C_L_VELA'], 2, 11, null, [
    'The &6UXV Machine Hull&r is the first thing Vela\'s lasagna plate goes into, with the UXV casing, a UXV voltage coil, a Ga2O3 power die and a UXV sensor. The UXV hatches and buses are built on it.',
  ], [it('gtceu:uxv_machine_hull')], 200),
  q('COMP', 'step', 'UXV Components', 'gtceu:uxv_electric_motor', ['HULL'], 4.5, 11, null, [
    'The &6UXV Electric Motor&r is wound with pasta strand stators and metallic hydrogen windings round a meteorite-iron rotor, and the &6UXV Electric Pump&r pushes liquid metal with a moving field. The piston and the conveyor move by metals that change shape in a magnetic field, the robot arm turns on a gear with no backlash, and the field generator projects from a plasma ring that holds its own field.',
  ], [
    it('gtceu:uxv_electric_motor'), it('gtceu:uxv_electric_pump'), it('gtceu:uxv_electric_piston'), it('gtceu:uxv_conveyor_module'),
    it('gtceu:uxv_robot_arm'), it('gtceu:uxv_field_generator'),
  ], 200),
  q('CH_ASM', 'machine', 'UXV Circuit Assembler', 'gtceu:uxv_circuit_assembler', ['COMP'], 7, 11, {
    for: 'The &6UXV Circuit Assembler&r is the assembler that works at the voltage of the mainframe, for everything below it that still wants a board.',
    needs: 'A UXV hull and the UXV components, with the cleanroom you already run.',
    unlocks: 'Faster circuit rows at UXV voltage; the mainframe itself still comes from the photonic hall.',
    automate: 'Boards and chips by ME; keep a small stock of what it returns.',
  }, [], [it('gtceu:uxv_circuit_assembler')], 150),
  q('EMIT', 'step', 'UXV Emitter', 'gtceu:uxv_emitter', ['SENSOR', 'C_L_GLASER'], 9.5, 11, null, [
    'With a gamma laser in hand, the &6UXV Emitter&r can be built. The parallel hatch and the OpV casing both need it.',
  ], [it('gtceu:uxv_emitter')], 250),
  q('HATCH', 'step', 'UXV Energy Hatch', 'gtceu:uxv_energy_input_hatch', ['EMIT'], 12, 11, null, [
    'The &6UXV Energy Input Hatch&r takes the full UXV voltage into a machine, and it is the door every UXV controller draws its power through.',
    'It is built in the assembly line on a UXV hull with the emitter parts of this page, UXV circuits and the lasagna cable of the age. Without it the UXV machines of the next chapters do not run. Make hatches in small batches by ME: each machine needs one, and a multiblock with parallel hatches needs more.',
  ], [it('gtceu:uxv_energy_input_hatch')], 200),
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
