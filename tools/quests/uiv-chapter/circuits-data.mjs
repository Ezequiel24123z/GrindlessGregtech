// Quest data for uiv_circuits: the UIV circuit assembler, the UIV components and hatches, and the ladder from the LN-on-SiN wafer, the BEUV exposure,
// the 5D crystal and the P:Si die to the P:Si processor and the optical mainframe that is the UIV circuit (docs/reforge/05_quest_design.md, sections 2
// and 3.2; docs/eras/uiv.md, "Our multiblocks", "Family steps" and the circuit rows). Every row starts at a link to a uiv_age quest. Charts own the
// line intermediates, so these quests ask for wafers, chips and circuits only; the machines that make them are in the machines chapter.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'UIV Circuits', origin: { x: 4, y: 10.25 }, heading: { key: 'H_CIRC', x: 0, y: 0, deps: ['J_HOME'], icon: 'gtceu:uiv_circuit_assembler', desc: [
      'The photonic chips of this age, then the parts, the circuit assembler and the hatches built from them.',
      'The lithium niobate wafers come first.',
    ] } },
  filename: 'uiv_circuits',
  era: 'uiv',
  role: 'circuits',
  order: 1,
  icon: 'gtnn:optical_mainframe',
  autofocus: 'CH_LNOI',
  title: 'UIV: Circuits',
  subtitle: ['A wafer with light on it, an exposure at 6.7 nanometres, a crystal that outlives the Sun and a processor of single phosphorus atoms.'],
};

export const LINKS = [];

// A row's first quest depends on the era quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

const q = (key, kind, title, icon, deps, x, y, teach, tasks, xpN) => ({
  key, kind, title, icon, deps: deps_(deps), x, y, teach, desc: [], tasks, rewards: [xp(xpN)],
});

export const QUESTS = [
  // ------------------------------------------------------------------ the assembler and the moving parts
  q('PUMP', 'step', 'UIV Parts', 'gtceu:uiv_electric_pump', ['MAIN'], 16, 5.75, {
    for: 'The UIV emitter, sensor, field generator, robot arm, conveyor module, pump, piston and motor are the parts of this era. The circuit assembler, the hatches and the controllers past them are built from these.',
    needs: 'The UEV part of the same kind (two for the motor, pump and field generator), plus UIV circuits of any kind from the optical mainframe. The motor also takes metallic hydrogen cable, windings and superconducting coils; the pump takes RHEA impellers and plates; the emitter takes two gamma laser cavities.',
    unlocks: 'The UIV circuit assembler and the UIV hatches.',
    automate: 'Stock each part by ME; a controller draws several of the same kind.',
  }, [
    it('gtceu:uiv_emitter'), it('gtceu:uiv_sensor'), it('gtceu:uiv_field_generator'), it('gtceu:uiv_robot_arm'), it('gtceu:uiv_conveyor_module'),
    it('gtceu:uiv_electric_pump'), it('gtceu:uiv_electric_piston'), it('gtceu:uiv_electric_motor'),
  ], 120),
  q('CH_ASM', 'machine', 'UIV Circuit Assembler', 'gtceu:uiv_circuit_assembler', ['PUMP', 'HULL'], 18.5, 7.25, {
    for: 'The &6UIV Circuit Assembler&r puts the UIV controllers together from the circuits of this page.',
    needs: 'A UIV machine hull, a UIV robot arm, an emitter and two conveyor modules, with a circuit of a high tier and red alloy cable.',
    unlocks: 'The UIV hatches and the controllers of this era.',
    automate: 'Boards and chips come from the cleanroom by ME; stock what it returns.',
  }, [it('gtceu:uiv_circuit_assembler')], 150),
  q('HATCH', 'step', 'UIV Hatches and Cable', 'gtceu:uiv_energy_input_hatch', ['HULL'], 21, 8.75, {
    for: 'The &6UIV Energy Hatch&r and &6UIV Dynamo Hatch&r are assembly line recipes on two UIV hulls, with metallic hydrogen cable, RHEA plates and FFKM seals. &6Metallic Hydrogen Single Cable&r carries the power.',
    needs: 'Two UIV machine hulls, three metallic hydrogen cables, six RHEA plates, six FFKM seals, three UIV circuits of any kind, three UIV sensors and a UIV motor.',
    unlocks: 'Every UIV machine that takes power from a hatch.',
    automate: 'Craft hatches and cable by ME in small batches; each machine takes one.',
  }, [it('gtceu:uiv_energy_input_hatch'), it('gtceu:uiv_energy_output_hatch'), it('gtceu:metallic_hydrogen_single_cable')], 100),

  // ------------------------------------------------------------------ light on a wafer
  q('CH_LNOI', 'wafer', 'Lithium Niobate on Insulator', 'grindless:lnoi_wafer', ['H_CIRC'], 3, 0.25, {
    for: 'A thin film of lithium niobate on silicon makes the &6LNOI Wafer&r. The photonic foundry cuts it into thin-film modulators, and it is the base of the optical processor and of the nitride wafer next to it.',
    needs: 'An ion-implanted lithium niobate wafer, a silicon wafer and quicklime in the photonic foundry.',
    unlocks: 'The LN-on-Si3N4 wafer, the optical processors of the mainframe and the thin-film modulators of the tensor core.',
    automate: 'Implanted wafers by ME; one LNOI wafer gives many modulators, so stock modulators, not wafers.',
  }, [it('grindless:lnoi_wafer')], 120),
  q('CH_LNSIN', 'wafer', 'Lithium Niobate on Nitride', 'grindless:ln_on_sin_wafer', ['CH_LNOI'], 5.5, 0.25, {
    for: 'The TFLN Fab slices an LNOI wafer onto a silicon nitride coated wafer and makes the &6LN-on-Si3N4 Wafer&r. It does not go into the mainframe: thinned and tipped with platinum it becomes the EO transceiver of the pulsar-timed repeater.',
    needs: 'The TFLN Fab, an LNOI wafer and a silicon nitride coated wafer.',
    unlocks: 'The EO transceiver of the pulsar-timed repeater and the UIV wireless hatches.',
    automate: 'LNOI wafers and nitride wafers by ME; the fab returns wafers to a chest.',
  }, [it('grindless:ln_on_sin_wafer')], 120),
  q('CH_SOI', 'wafer', 'Ion-Sliced Silicon-28', 'grindless:si28_donor_wafer', ['CH_LNSIN'], 8, 0.25, {
    for: 'The TFLN Fab implants hydrogen into an isotopically pure silicon-28 wafer and slices off a thin film onto a handle wafer. The film is the &6Si-28 SOI Wafer&r that the quiet-qubit row needs; what remains is the &6Si-28 Donor Wafer&r.',
    needs: 'The TFLN Fab with a circuit of any UIV kind, and a silicon-28 wafer to slice. It draws UIV power.',
    unlocks: 'The silicon-28 SOI wafer of the later chapters. The donor wafer goes back to zone refining and is regrown, so no silicon-28 is lost.',
    automate: 'Feed handle wafers by ME and send the donors straight to the zone refiner; one loop keeps the isotope in circulation.',
  }, [it('grindless:si28_donor_wafer')], 120),

  // ------------------------------------------------------------------ BEUV
  q('CH_BEUV', 'wafer', 'BEUV Exposure', 'grindless:beuv_exposed_wafer', ['H_LADDER'], 3.5, 3.25, {
    for: 'A wafer exposed at 6.7 nanometres holds finer lines than any light before it: the &6BEUV-Exposed Wafer&r.',
    needs: 'The BEUV scanner (a UIV hull, UEV circuits), a tin-terbium droplet target, an HfO2 resist wafer and a BEUV mirror. The debris is caught and recycled.',
    unlocks: 'The BEUV driver ASIC next to it.',
    automate: 'Wafers by ME; send the fouled mirrors to the cleaning line, not to the bin.',
  }, [it('grindless:beuv_exposed_wafer')], 120),
  q('CH_ASIC', 'circuit', 'Driver ASIC', 'grindless:beuv_driver_asic', ['CH_BEUV'], 7.5, 3.25, {
    for: 'Cut from the exposed wafer, the &6BEUV Driver ASIC&r is the logic that drives the photonic tensor core.',
    needs: 'A BEUV-exposed wafer, a VUV frequency comb and ethanol in the BEUV lithography line.',
    unlocks: 'The photonic tensor core.',
    automate: 'One wafer yields several chips; stock them in a chest by ME.',
  }, [it('grindless:beuv_driver_asic')], 140),
  q('CH_TENSOR', 'circuit', 'Photonic Tensor Core', 'grindless:photonic_tensor_core', ['CH_ASIC', 'CH_LNOI'], 11, 3.25, {
    for: 'Matrix products done in light: the &6Photonic Tensor Core&r is the arithmetic of the optical mainframe. It takes the compute module of the first pass of the hall.',
    needs: 'In the photonic integration hall (a circuit 4 program): a BEUV driver ASIC, a Photonic Compute Module and four thin-film LN modulators. The modulators come from the photonic foundry: an etched LNOI wafer and gold foil (circuit 6) make sixteen.',
    unlocks: 'The comb-fed tensor core, one pass later in the same hall.',
    automate: 'Modulators and ASICs by ME; the tensor core is made one at a time and goes straight to the next pass.',
  }, [it('grindless:thin_film_ln_modulator'), it('grindless:photonic_tensor_core')], 160),

  // ------------------------------------------------------------------ memory
  q('CH_5D', 'wafer', 'Five-Dimensional Crystal', 'grindless:data_crystal_5d', ['H_LADDER'], 3.5, 5.75, {
    for: 'A laser pulse a millionth of a millionth of a second long writes inside glass. The &65D Data Crystal&r keeps what it holds longer than the Sun will shine.',
    needs: 'A silica storage preform written by the femtosecond laser, engraved with a UHV circuit, then annealed in the electric blast furnace at 9,001 K.',
    unlocks: 'The Matrioshka research writes in Mercury orbit, the ergosphere probe bay and the Kerr probe.',
    automate: 'Silica preforms by ME; written crystals go to the research store.',
  }, [it('grindless:data_crystal_5d')], 120),
  q('CH_MKM', 'circuit', 'Millikelvin Cryostat Module', 'grindless:mk_cryostat_module', ['H_LADDER'], 3.5, 8.25, {
    for: 'The die has to be cold before it works. The &6mK Cryostat Module&r wets a rare-earth stage with a helium-3 mixture and holds the die at millikelvin.',
    needs: 'The nuclear demagnetisation stage: a nuclear stage, a cold plate and a helium-3/helium-4 mixture, with a circuit 2 program.',
    unlocks: 'The six-hour memory and the P:Si processor.',
    automate: 'The helium mixture returns to the works; send finished modules on by ME.',
  }, [it('grindless:mk_cryostat_module')], 150),
  q('CH_SIXH', 'circuit', 'Six-Hour Memory', 'grindless:six_hour_memory', ['CH_MKM'], 6, 5.75, {
    for: 'A crystal of one europium isotope remembers a light pulse for hours when the right comb is burned in. That is the &6Six-Hour Quantum Memory&r.',
    needs: 'In an assembler: a hole-burned Eu-151:YSO slab (spectral hole burning with superfluid helium), an mK cryostat module, a UEV sensor and a circuit 20 program.',
    unlocks: 'The optical mainframe.',
    automate: 'Slabs by ME, helium by pipe; a few stocked memories are enough.',
  }, [it('grindless:six_hour_memory')], 140),

  // ------------------------------------------------------------------ the die and the processor
  q('CH_STM', 'wafer', 'STM-Patterned Wafer', 'grindless:stm_patterned_wafer', ['H_LADDER'], 3.5, 9.75, {
    for: 'A scanning tip peels hydrogen off silicon one atom at a time. The &6STM-Patterned Wafer&r is the silicon with the holes ready.',
    needs: 'The STM lithography cell: a hydrogen-terminated silicon wafer in ultra-high vacuum.',
    unlocks: 'The P:Si die, once phosphine fills the holes.',
    automate: 'Wafers by ME; the cell is slow, so run two.',
  }, [it('grindless:stm_patterned_wafer')], 120),
  q('CH_DIE', 'circuit', 'P:Si Die', 'grindless:p_si_die', ['CH_STM'], 6, 9.75, {
    for: 'Phosphine fills the holes and silicon-28 grown over them seals them. The &6P:Si Die&r holds qubits made of single phosphorus atoms.',
    needs: 'The patterned wafer dosed with phosphine in the STM cell, then molecular beam epitaxy with silicon-28 and liquid nitrogen. Excess phosphine is scrubbed and kept.',
    unlocks: 'The P:Si processor.',
    automate: 'Phosphine by pipe in a contained loop; dies back by ME.',
  }, [it('grindless:p_si_die')], 140),
  q('CH_PSI', 'circuit', 'P:Si Processor', 'grindless:p_si_processor', ['CH_DIE', 'CH_MKM'], 8.5, 8.25, {
    for: 'A cooled die makes the &6Characterised P:Si Processor&r. It is the logic of the UIV circuit.',
    needs: 'The millikelvin cryostat works: a P:Si die, an mK cryostat module and liquid helium, with a circuit 3 program.',
    unlocks: 'The optical mainframe.',
    automate: 'Dies and modules in matched numbers by ME; keep one processor per mainframe.',
  }, [it('grindless:p_si_processor')], 200),
  q('MAIN', 'circuit', 'Optical Mainframe', 'gtnn:optical_mainframe', ['CH_PSI', 'CH_SIXH', 'CH_TENSOR'], 13.5, 5.75, {
    for: 'A processor, a memory, a comb-fed tensor core and two optical assemblies make the &6Optical Mainframe&r, the UIV circuit.',
    needs: 'The photonic integration hall (a circuit 5 program): a Characterised P:Si Processor, a Six-Hour Quantum Memory, a Comb-Fed Tensor Core, two optical assemblies and three UEV circuits. The assemblies come from the photonic foundry (optical processors and quantum memory chips, with ultrapure water).',
    unlocks: 'The UIV parts, the controllers of Mk5 and Matrioshka and the stored proof of the gate.',
    automate: 'Keep a dedicated chest and never a big stock; every part goes into each.',
  }, [it('gtnn:optical_assembly', 2), it('gtnn:optical_mainframe')], 250),
  {
    key: 'H_LADDER', kind: 'reading', title: 'The Light Ladder', icon: 'grindless:beuv_exposed_wafer',
    deps: ['H_CIRC'], x: 0.5, y: 6.5,
    desc: [
      'Extreme light, ASIC wafers and five dimensional storage, step by step.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
];
