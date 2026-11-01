// Quest data for uiv_circuits: the UIV circuit assembler, the UIV components and hatches, and the ladder from the LN-on-SiN wafer, the BEUV exposure,
// the 5D crystal and the P:Si die to the P:Si processor and the optical mainframe that is the UIV circuit (docs/reforge/05_quest_design.md, sections 2
// and 3.2; docs/eras/uiv.md, "Our multiblocks", "Family steps" and the circuit rows). Every row starts at a link to a uiv_age quest. Charts own the
// line intermediates, so these quests ask for wafers, chips and circuits only; the machines that make them are in the machines chapter.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: 'uiv_circuits',
  era: 'uiv',
  role: 'circuits',
  order: 1,
  icon: 'gtnn:optical_mainframe',
  autofocus: 'CH_ASM',
  title: 'UIV: Circuits',
  subtitle: ['A wafer with light on it, an exposure at 6.7 nanometres, a crystal that outlives the Sun and a processor of single phosphorus atoms.'],
};

export const LINKS = [
  { key: 'C_L_ASM', ref: 'START', x: 0, y: 0 },
  { key: 'C_L_LN', ref: 'START', x: 0, y: 2.5 },
  { key: 'C_L_BEUV', ref: 'START', x: 0, y: 5 },
  { key: 'C_L_5D', ref: 'START', x: 0, y: 7.5 },
  { key: 'C_L_STM', ref: 'START', x: 0, y: 10 },
];

// A row's first quest depends on the era quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

const q = (key, kind, title, icon, deps, x, y, teach, tasks, xpN) => ({
  key, kind, title, icon, deps: deps_(deps), x, y, teach, desc: [], tasks, rewards: [xp(xpN)],
});

export const QUESTS = [
  // ------------------------------------------------------------------ the assembler and the moving parts
  q('CH_ASM', 'machine', 'UIV Circuit Assembler', 'gtceu:uiv_circuit_assembler', ['C_L_ASM'], 2, 0, {
    for: 'The &6UIV Circuit Assembler&r puts the UIV components and the controllers of this era together from the circuits on this page.',
    needs: 'A UIV hull and UIV components, and the cleanroom you already run.',
    unlocks: 'The parts and hatches on the next two quests, and every controller past the UIV hull.',
    automate: 'Boards and chips come from the cleanroom by ME; stock what it returns.',
  }, [it('gtceu:uiv_circuit_assembler')], 150),
  q('PUMP', 'step', 'UIV Parts', 'gtceu:uiv_electric_pump', ['CH_ASM'], 4.5, 0, {}, [
    it('gtceu:uiv_emitter'), it('gtceu:uiv_sensor'), it('gtceu:uiv_field_generator'), it('gtceu:uiv_robot_arm'), it('gtceu:uiv_conveyor_module'),
    it('gtceu:uiv_electric_pump'), it('gtceu:uiv_electric_piston'), it('gtceu:uiv_electric_motor'),
  ], 120),
  q('HATCH', 'step', 'UIV Hatches', 'gtceu:uiv_energy_input_hatch', ['PUMP'], 7, 0, {}, [it('gtceu:uiv_energy_input_hatch'), it('gtceu:uiv_energy_output_hatch')], 100),

  // ------------------------------------------------------------------ light on a wafer
  q('CH_LNSIN', 'wafer', 'Lithium Niobate on Nitride', 'grindless:ln_on_sin_wafer', ['C_L_LN'], 2, 2.5, {
    for: 'A thin crystal of lithium niobate bonded onto silicon nitride makes the &6LN-on-SiN Wafer&r: one wafer that steers light and tunes it.',
    needs: 'The TFLN fab, a lithium niobate boule and silicon nitride wafers, in the cleanroom.',
    unlocks: 'The comb that the optical mainframe is built round.',
    automate: 'Boules and nitride wafers by ME; the fab returns wafers to a chest.',
  }, [it('grindless:ln_on_sin_wafer')], 120),

  // ------------------------------------------------------------------ BEUV
  q('CH_BEUV', 'wafer', 'BEUV Exposure', 'grindless:beuv_exposed_wafer', ['C_L_BEUV'], 2, 5, {
    for: 'A wafer exposed at 6.7 nanometres holds finer lines than any light before it: the &6BEUV Exposed Wafer&r.',
    needs: 'The BEUV scanner, a resist-coated wafer and clean mirrors. The terbium debris is caught and recycled.',
    unlocks: 'The driver ASIC next to it, and through it the P:Si processor.',
    automate: 'Wafers by ME; send the fouled mirrors to the cleaning line, not to the bin.',
  }, [it('grindless:beuv_exposed_wafer')], 120),
  q('CH_ASIC', 'circuit', 'Driver ASIC', 'grindless:beuv_driver_asic', ['CH_BEUV'], 4.5, 5, {
    for: 'Cut from the exposed wafer, the &6BEUV Driver ASIC&r is the logic that steers the single-atom writer.',
    needs: 'A BEUV exposed wafer and a circuit 1 program in the cleanroom.',
    unlocks: 'The P:Si processor.',
    automate: 'One wafer yields many chips; stock them in a chest by ME.',
  }, [it('grindless:beuv_driver_asic')], 140),

  // ------------------------------------------------------------------ memory
  q('CH_5D', 'wafer', 'Five-Dimensional Crystal', 'grindless:data_crystal_5d', ['C_L_5D'], 2, 7.5, {
    for: 'A laser pulse a millionth of a millionth of a second long writes inside glass. The &65D Data Crystal&r keeps what it holds longer than the Sun will shine.',
    needs: 'The femtosecond writer and a block of fused silica.',
    unlocks: 'The research data that Matrioshka runs and the six-hour memory.',
    automate: 'Silica blanks by ME; written crystals go to the research store.',
  }, [it('grindless:data_crystal_5d')], 120),
  q('CH_SIXH', 'circuit', 'Six-Hour Memory', 'grindless:six_hour_memory', ['CH_5D'], 4.5, 7.5, {
    for: 'A crystal of one europium isotope remembers a light pulse for hours when the right comb is burned in. That is the &6Six-Hour Memory&r.',
    needs: 'The spectral hole burner, a 5D crystal and superfluid helium.',
    unlocks: 'The P:Si processor, which holds its state in this memory.',
    automate: 'Crystals by ME, helium by pipe; a few stocked memories are enough.',
  }, [it('grindless:six_hour_memory')], 140),

  // ------------------------------------------------------------------ the die and the processor
  q('CH_STM', 'wafer', 'STM-Patterned Wafer', 'grindless:stm_patterned_wafer', ['C_L_STM'], 2, 10, {
    for: 'A scanning tip peels hydrogen off silicon one atom at a time. The &6STM-Patterned Wafer&r is the silicon with the holes ready.',
    needs: 'The STM lithography cell, a clean silicon wafer and ultra-high vacuum.',
    unlocks: 'The P:Si die, once phosphine fills the holes.',
    automate: 'Wafers by ME; the cell is slow, so run two.',
  }, [it('grindless:stm_patterned_wafer')], 120),
  q('CH_DIE', 'circuit', 'P:Si Die', 'grindless:p_si_die', ['CH_STM'], 4.5, 10, {
    for: 'Phosphine fills the holes and a cap seals them. The &6P:Si Die&r holds qubits made of single phosphorus atoms.',
    needs: 'A patterned wafer in the STM lithography cell. The excess phosphine is scrubbed and kept.',
    unlocks: 'The cryostat module and the P:Si processor.',
    automate: 'Phosphine by pipe in a contained loop; dies back by ME.',
  }, [it('grindless:p_si_die')], 140),
  q('CH_MKM', 'circuit', 'Millikelvin Cryostat Module', 'grindless:mk_cryostat_module', ['CH_DIE'], 7, 10, {
    for: 'The die has to be cold before it works. The &6mK Cryostat Module&r wets a rare-earth stage with helium-3 and holds the die at millikelvin.',
    needs: 'The millikelvin cryostat works, a P:Si die and helium-3.',
    unlocks: 'The P:Si processor.',
    automate: 'The helium mixture returns to the works; send finished modules on by ME.',
  }, [it('grindless:mk_cryostat_module')], 150),
  q('CH_PSI', 'circuit', 'P:Si Processor', 'grindless:p_si_processor', ['CH_ASIC', 'CH_SIXH', 'CH_MKM'], 9.5, 7.5, {
    for: 'A cooled die, a driver and a memory make the &6P:Si Processor&r. It is the logic of the UIV circuit.',
    needs: 'The millikelvin cryostat works, a cryostat module, a driver ASIC and a six-hour memory.',
    unlocks: 'The optical mainframe.',
    automate: 'Parts in matched counts by ME; keep one processor per mainframe.',
  }, [it('grindless:p_si_processor')], 200),
  q('MAIN', 'circuit', 'Optical Mainframe', 'gtnn:optical_mainframe', ['CH_PSI'], 12, 7.5, {
    for: 'A processor, a crossbar, a glass interposer and a comb on a LN-on-SiN wafer make the &6Optical Mainframe&r, the UIV circuit.',
    needs: 'The photonic integration hall, a P:Si processor and a LN-on-SiN wafer.',
    unlocks: 'The controllers of Mk5, Matrioshka and every dead-star machine, and the gate store.',
    automate: 'Keep a dedicated chest and never a big stock; one processor and one wafer go into each.',
  }, [it('gtnn:optical_mainframe')], 250),
];
