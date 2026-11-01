// Quest data for uhv_circuits: the UHV circuit assembler and the ladder to the wetware mainframe that is the UHV circuit, through the lithium niobate
// wafer, the photonic die, the quantum memory and the optical processor and assembly (docs/reforge/05_quest_design.md, sections 2 and 3.2;
// docs/eras/uhv.md, "Our multiblocks", "Family steps" and the circuit rows). Every row starts at a link to START. Charts own the line
// intermediates, so these quests ask for machines, wafers and circuits only; the furnaces, the foundry and the array are in the machines chapter.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: 'uhv_circuits',
  era: 'uhv',
  role: 'circuits',
  order: 1,
  icon: 'gtceu:wetware_processor_mainframe',
  autofocus: 'UCH_ASM',
  title: 'UHV: Circuits',
  subtitle: ['Crystals that bend light, a laser grown a few atoms at a time, tissue on a scaffold, and the circuit every UHV machine is built around.'],
};

export const LINKS = [
  { key: 'C_L_ASM', ref: 'START', x: 0, y: 0 },
  { key: 'C_L_LIGHT', ref: 'START', x: 0, y: 1.5 },
  { key: 'C_L_INP', ref: 'START', x: 0, y: 3 },
  { key: 'C_L_MEM', ref: 'START', x: 0, y: 4.5 },
  { key: 'C_L_LIFE', ref: 'START', x: 0, y: 6 },
];

// A row's first quest depends on the era quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

const q = (key, kind, title, icon, deps, x, y, teach, tasks, xpN) => ({
  key, kind, title, icon, deps: deps_(deps), x, y, teach, desc: [], tasks, rewards: [xp(xpN)],
});

export const QUESTS = [
  // ------------------------------------------------------------------ the assembler and the parts
  q('UCH_ASM', 'machine', 'UHV Circuit Assembler', 'gtceu:uhv_circuit_assembler', ['C_L_ASM'], 2, 0, {
    for: 'The &6UHV Circuit Assembler&r is the first assembler that can put together the circuits UHV machines are made of.',
    needs: 'A UHV hull, UV components and the cleanroom you already run; the UV circuits keep feeding it.',
    unlocks: 'The optical assembly and the wetware mainframe on the rows below, and every controller of this era.',
    automate: 'Boards and chips arrive from the cleanroom by ME; keep a stock of what it returns.',
  }, [it('gtceu:uhv_circuit_assembler')], 150),
  q('UCH_PARTS', 'process', 'UV Parts for UHV Controllers', 'gtceu:uv_robot_arm', ['UCH_ASM'], 4, 0, {
    for: 'GTM adds a UHV hull and UHV hatches but no UHV arm, sensor or emitter, so every UHV controller is built from UV parts and UHV circuits.',
    needs: 'The UV robot arms, sensors and emitters you already make, and the UHV circuits from this chapter.',
    unlocks: 'The controllers of the machines chapter, in the order it lists them.',
    automate: 'Stock each UV part by ME; the assembler draws two of the kind a controller asks for.',
  }, [it('gtceu:uv_robot_arm'), it('gtceu:uv_sensor'), it('gtceu:uv_emitter')], 100),
  q('UCH_HULL', 'step', 'The UHV Hull', 'gtceu:uhv_machine_hull', ['UCH_PARTS', 'UCH_MAIN'], 16, 6, {}, [it('gtceu:uhv_machine_hull')], 120),

  // ------------------------------------------------------------------ light: wafer, die, processor, assembly
  q('UCH_LN', 'wafer', 'Lithium Niobate Wafer', 'grindless:lithium_niobate_wafer', ['C_L_LIGHT'], 2, 1.5, {
    for: 'A &6Lithium Niobate Wafer&r is cut from a boule pulled out of a melt. It bends light with an electric field, so a chip can modulate a beam.',
    needs: 'A boule from the crystal growth furnace, and a cleanroom to cut and polish it.',
    unlocks: 'The thin-film wafer next to it, and through it the optical processor.',
    automate: 'The crucible is reused; keep boules and cut wafers in a stocked chest by ME.',
  }, [it('grindless:lithium_niobate_wafer')], 100),
  q('UCH_LNOI', 'wafer', 'Lithium Niobate on Insulator', 'grindless:ln_on_insulator_plus', ['UCH_LN'], 4, 1.5, {
    for: 'Bond a thin lithium niobate film onto an insulating layer and you have the &6LNOI&r wafer, the stage light is guided on.',
    needs: 'A lithium niobate wafer, silicon nitride film and the cleanroom.',
    unlocks: 'The optical processor, which is cut from it.',
    automate: 'Bonding runs in plain machines by ME; keep spare wafers for the foundry.',
  }, [it('grindless:ln_on_insulator_plus')], 120),
  q('UCH_PCM', 'circuit', 'Phase-Change Die', 'grindless:pcm_photonic_die', ['UCH_LNOI'], 6, 1.5, {
    for: 'A chalcogenide film flips between glass and crystal when a laser says so, and the &6Photonic Die&r keeps a bit of light in that state.',
    needs: 'The photonic foundry, an LNOI wafer and the phase-change film.',
    unlocks: 'The optical processor and the memory node of the photonic line.',
    automate: 'The foundry fills a stack of dies per wafer; send them on by ME.',
  }, [it('grindless:pcm_photonic_die')], 120),
  q('UCH_OPT', 'circuit', 'Optical Processor', 'gtnn:optical_processor', ['UCH_PCM', 'UCH_QCL', 'UCH_QMEM'], 10, 1.5, {
    for: 'A processor that thinks in light and runs cold: the &6Optical Processor&r is the circuit that comes after the wetware computer.',
    needs: 'An LNOI wafer, phase-change dies, a quantum cascade laser, a memory chip and a UHV circuit, all in the photonic foundry.',
    unlocks: 'The optical assembly and, through it, the mainframes of the organoid array.',
    automate: 'Foundry inputs by ME; processors go into their own chest, one stack per assembly.',
  }, [it('gtnn:optical_processor')], 180),
  q('UCH_OASM', 'circuit', 'Optical Assembly', 'gtnn:optical_assembly', ['UCH_OPT', 'UCH_ASM'], 12, 1.5, {
    for: 'Optical processors on an optical board with capacitors and diodes make the &6Optical Assembly&r, the largest circuit this era builds.',
    needs: 'Optical processors, the UHV circuit assembler and optical SMD parts.',
    unlocks: 'The wetware mainframe, whose recipe in the organoid array asks for one.',
    automate: 'One assembly per mainframe batch: keep a small stock by ME and never more.',
  }, [it('gtnn:optical_assembly')], 200),

  // ------------------------------------------------------------------ the laser and the memory
  q('UCH_INP', 'wafer', 'Indium Phosphide Wafer', 'grindless:inp_wafer', ['C_L_INP'], 2, 3, {
    for: 'An &6InP Wafer&r is the substrate a mid-infrared laser is grown on. Its lattice matches the layers the molecular beam reactor lays down.',
    needs: 'An InP boule from the crystal growth furnace, indium and red phosphorus, and the cleanroom.',
    unlocks: 'The quantum cascade laser next to it.',
    automate: 'The boule is slow. Keep indium and phosphorus topped up by ME and stock the wafers.',
  }, [it('grindless:inp_wafer')], 100),
  q('UCH_QCL', 'circuit', 'Quantum Cascade Laser', 'grindless:quantum_cascade_laser', ['UCH_INP'], 6, 3, {
    for: 'An electron falls down a staircase of thin layers and gives up a photon at every step. The &6Quantum Cascade Laser&r is hundreds of those layers on InP.',
    needs: 'The MBE reactor, an InP wafer and arsenic, which is contained.',
    unlocks: 'The optical processor, and the sensors of the astrometer and the swarm.',
    automate: 'Contain the arsenic loop; stock lasers by ME.',
  }, [it('grindless:quantum_cascade_laser')], 120),

  q('UCH_EUY', 'wafer', 'Europium-Doped Crystal', 'grindless:eu_yso_boule', ['C_L_MEM'], 2, 4.5, {
    for: 'Europium in an yttrium orthosilicate crystal stores the state of a photon for hours. The &6Eu:YSO Boule&r is where memory chips start.',
    needs: 'The crystal growth furnace and its iridium crucible.',
    unlocks: 'The quantum memory chip beside it.',
    automate: 'Boules are slow to pull; keep the melt stocked by ME and stock slabs.',
  }, [it('grindless:eu_yso_boule')], 100),
  q('UCH_QMEM', 'circuit', 'Quantum Memory Chip', 'grindless:quantum_memory_chip', ['UCH_EUY'], 6, 4.5, {
    for: 'A slab cut from the boule and patterned in the photonic foundry becomes a &6Quantum Memory Chip&r that holds light as an excitation.',
    needs: 'An Eu:YSO boule and the photonic foundry.',
    unlocks: 'The optical processor.',
    automate: 'One boule cuts several slabs; send chips on by ME.',
  }, [it('grindless:quantum_memory_chip')], 120),

  // ------------------------------------------------------------------ life: the UHV circuit
  q('UCH_ORG', 'circuit', 'Organoid Processor', 'grindless:organoid_processor', ['C_L_LIFE'], 2, 6, {
    for: 'Neurons grown on a chitosan scaffold in ultrapure water make an &6Organoid Processor&r, tissue that learns on a board.',
    needs: 'The organoid array, stem cells from UV\'s vat, a scaffold, ultrapure water and sterile growth medium.',
    unlocks: 'The wetware mainframe, four organoids at a time.',
    automate: 'Medium and water by pipe; a tissue line fed by ME runs without a hand.',
  }, [it('grindless:organoid_processor')], 120),
  q('UCH_MAIN', 'circuit', 'Four Mainframes', 'gtceu:wetware_processor_mainframe', ['UCH_ORG', 'UCH_OASM'], 14, 6, {
    for: 'The &6Wetware Processor Mainframe&r is the UHV circuit. The organoid array makes four at once from organoid processors, neurons and an optical assembly.',
    needs: 'Four organoid processors, neuro processing units, an SiC power module and an optical assembly for each batch.',
    unlocks: 'Every UHV controller, and the hull of this era.',
    automate: 'Run the array in batches of four by ME and keep a dedicated mainframe chest.',
  }, [it('gtceu:wetware_processor_mainframe', 4)], 220),
];
