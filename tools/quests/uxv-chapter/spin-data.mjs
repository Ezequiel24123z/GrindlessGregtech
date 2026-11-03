// Quest data for uxv_spin: the spintronic wafer line, X1 of pl_uxv (docs/eras/lines-uev-uxv.md, section 8), in nine modules from the 28Si wafer to the spintronic mainframe.
// Each module names its machines, circuits and sizes from the recipes in the dump (9f6c318722c0); the line chart (pl_uxv) draws every step. Replaces the generic
// wafer quests of the old uxv_wafers file, which named machines that no longer exist.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: {
    name: 'UXV Spintronic Wafer',
    origin: { x: 27, y: 19.5 },
    heading: { key: 'H_SPIN', x: 0, y: 0, deps: ['SENSOR'], icon: 'grindless:spintronic_wafer', desc: [
      'The spintronic wafer, X1 of the UXV Lines chart: a silicon-28 wafer carrying memory, racetrack, oscillators, spin-wave bus, magnetoelectric switch and spin-orbit readout.',
      'Nine modules, one after another. The Spintronic Cluster Tool, the vdW stacker and the Photonic Foundry do most of the work.',
    ] },
  },
  filename: 'uxv_spin',
  era: 'uxv',
  role: 'spin',
  order: 9,
  icon: 'grindless:spintronic_wafer',
  autofocus: 'S_SI28',
  title: 'UXV: Spintronic Wafer',
  subtitle: ['Nine modules from the silicon-28 wafer to the spintronic mainframe.'],
};

export const LINKS = [];

const s = (key, title, icon, deps, x, y, teach, tasks, xpN) => ({
  key, kind: 'process', title, icon, deps, x, y, teach, desc: [], tasks, rewards: [xp(xpN)],
});

export const QUESTS = [
  s('S_SI28', 'Silicon-28 and the CMOS Wafer', 'grindless:si28_cmos_wafer', ['H_SPIN'], 2.5, 0, {
    for: 'Spins that last need a silicon with no nuclear spin of its own, so the line starts with silicon-28 and a CMOS wafer, the floor under every layer after it.',
    needs: 'The hot cell enriches silicon dust with hydrogen fluoride into silicon-28 dust (circuit 5). Zone refining melts it under argon into an ingot (circuit 6, 800 ticks); the cutter slices a wafer with water (400 ticks). The ion implanter loads hydrogen (circuit 6). The MOCVD reactor grows a hafnia gate and a titanium nitride gate (circuit 10, 700 ticks), and the Photonic Foundry lays tungsten vias and a copper layer (circuit 17).',
    unlocks: 'The 28Si M1 Wafer, which every later module is grown on.',
    automate: 'Silicon, acid and argon by ME and by pipe; wafers pass from machine to machine by pattern provider.',
  }, [it('grindless:si28_fz_wafer'), it('grindless:si28_cmos_wafer'), it('grindless:si28_m1_wafer')], 120),
  s('S_MRAM', 'MRAM Stack', 'grindless:mram_wafer', ['S_SI28'], 6, 0, {
    for: 'The magnetic tunnel junctions that store a bit as the direction of a magnet. They are laid on the M1 wafer by the &6Spintronic Cluster Tool&r.',
    needs: 'The Cluster Tool sputters a heusler target, a magnesia barrier and a tantalum seed onto the wafer under argon (circuit 2, 800 ticks); the heusler powder comes back. The nitride magnet works anneals it (circuit 9), the ion implanter etches it (circuit 9), and the Photonic Foundry caps it with copper (circuit 18).',
    unlocks: 'The racetrack module, which writes tracks over the MRAM wafer.',
    automate: 'Targets by ME from the melter; return the heusler powder to the target line so nothing is lost.',
  }, [it('grindless:mram_stack_wafer'), it('grindless:mram_wafer')], 140),
  s('S_RACE', 'Racetrack', 'grindless:racetrack_chip', ['S_MRAM'], 9.5, 0, {
    for: 'A racetrack is a nanowire along which magnetic domains move like cars on a track. It stores more bits per area than any plain memory.',
    needs: 'The Cluster Tool lays a synthetic antiferromagnet over the MRAM wafer (circuit 3, 600 ticks). The nitride magnet works anneals it (circuit 10) and electron beam refining writes the track (circuit 16). The Cluster Tool then patterns the nanowires (circuit 1; a quarter of the platinum comes off as sludge) and joins the MTJ die for the racetrack chip (circuit 2, 900 ticks).',
    unlocks: 'The oscillator module, which is grown on the racetrack chip.',
    automate: 'Keep the platinum sludge in a chest or send it to the platinum line; it is the byproduct that pays for the sputter targets.',
  }, [it('grindless:saf_track_wafer'), it('grindless:patterned_track_wafer'), it('grindless:racetrack_chip')], 160),
  s('S_STNO', 'Spin-Torque Oscillators', 'grindless:stno_array', ['S_SI28'], 2.5, 2.5, {
    for: 'A spin-torque oscillator turns a direct current into a microwave signal through the spin of its electrons. An array of them drives the spin-wave bus.',
    needs: 'The Cluster Tool sputters the oscillator stack on the racetrack chip (circuit 4, 700 ticks). Electron beam refining defines the pillars (circuit 27), the ion implanter mills them (circuit 10), a chemical bath with hydrochloric acid cleans the redeposit, and the MOCVD reactor planarises with silane and ammonia (circuit 15). The Photonic Foundry caps the array with gold (circuit 20).',
    unlocks: 'The magnonic bus.',
    automate: 'Acid and silane by pipe; the bath returns its redeposit as dust.',
  }, [it('grindless:stno_stack_wafer'), it('grindless:stno_array')], 160),
  s('S_BUS', 'Magnonic Bus', 'grindless:magnonic_bus', ['S_STNO'], 6, 2.5, {
    for: 'A yttrium iron garnet film carries spin waves with almost no loss, and the oscillator array drives them: together they make the bus that moves data inside the chip.',
    needs: 'The &6YIG LPE Furnace&r grows the film on a GGG wafer in a platinum crucible (circuit 2, 1,200 ticks), and electron beam refining cuts the waveguides (circuit 17). An assembler (800 ticks) joins the waveguide wafer, the oscillator array, a 5N platinum part, a platinum sheet and soldering alloy.',
    unlocks: 'The ME-on-spin wafer.',
    automate: 'The flux comes back from the skim recipe (circuit 3); keep a spare platinum crucible.',
  }, [it('grindless:yig_film_wafer'), it('grindless:yig_waveguide_wafer'), it('grindless:magnonic_bus')], 180),
  s('S_OXIDE', 'Oxide Membranes', 'grindless:me_switch_wafer', ['S_BUS'], 9.5, 2.5, {
    for: 'A magnetoelectric membrane flips a magnet with a voltage instead of a current, so it switches with far less heat. It is made of oxides that only grow in a pulsed laser plume.',
    needs: 'The Cluster Tool, with a KrF laser and oxygen: a strontium ruthenate electrode on a dysprosium scandate substrate (circuit 1, 400 ticks), a bismuth ferrite film (circuit 2) and a cobalt-iron layer (circuit 3). Electron beam refining then patterns the switch (circuit 19).',
    unlocks: 'The ME-on-spin wafer.',
    automate: 'Oxygen by pipe; the bismuth fume is a byproduct and goes to the fume scrubber.',
  }, [it('grindless:srruo3_electrode_wafer'), it('grindless:bfo_film_wafer'), it('grindless:me_switch_wafer')], 160),
  s('S_VDW', 'Van der Waals Readouts', 'grindless:sot_readout_stack', ['S_STNO'], 2.5, 5, {
    for: 'Spin-orbit torque reads the bit out through a stack of two-dimensional crystals: a heavy metal, a magnet and a barrier a few atoms thick, each laid on the last by the vdW stacker.',
    needs: 'The vdW stacker in its UXV mode cleaves WTe2 and FGT flakes (circuits 1 and 2), then stacks them with hBN into a heterostack under argon (circuit 4, 900 ticks). Electron beam refining adds gold edge contacts (circuit 18) and the nitride magnet works anneals the stack (circuit 12).',
    unlocks: 'The MESO spin wafer, where the readout is laid over the magnetoelectric layer.',
    automate: 'Crystals by ME; broken flakes come out as dust, send it back to the crystal line.',
  }, [it('grindless:sot_heterostack'), it('grindless:sot_readout_stack')], 160),
  s('S_DICE', 'Interconnect and Dicing', 'grindless:spintronic_die', ['S_VDW'], 6, 5, {
    for: 'The two membranes are joined to the bus, the wafer is closed with its top copper and gold layers, and a cutter dices it. Each die holds the logic, the memory and the bus of one mainframe.',
    needs: 'The vdW stacker joins the bus and the switch (ME-on-spin wafer, circuit 7, 700 ticks) and lays the readout over it (MESO spin wafer, circuit 8). The Photonic Foundry caps it with copper and gold (circuit 30). The cutter dices it with lubricant.',
    unlocks: 'The spintronic mainframe.',
    automate: 'Lubricant by pipe; dice a stack at a time and send the dies straight to the integration hall.',
  }, [it('grindless:me_on_spin_wafer'), it('grindless:meso_spin_wafer'), it('grindless:spintronic_wafer'), it('grindless:spintronic_die')], 200),
  s('S_MAIN', 'Spintronic Mainframe', 'gtnn:spintronic_mainframe', ['S_DICE', 'S_RACE', 'S_OXIDE'], 9.5, 5, {
    for: 'The end of the line: a mainframe that computes in spin waves. It is the circuit every UXV machine asks for.',
    needs: 'The Photonic Integration Hall (3,000 ticks, circuit 7): a spintronic die, an MTJ die, a shielded interposer and UIV circuits. The interposer is a mu-metal shield can on a glass interposer, soldered in the Photonic Foundry (circuit 22).',
    unlocks: 'The UXV circuit chain and every UXV machine that needs it.',
    automate: 'Dies and interposers by ME; the hall takes one of each per mainframe.',
  }, [it('gtnn:spintronic_mainframe')], 300),
];
