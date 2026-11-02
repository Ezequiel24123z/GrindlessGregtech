// Quest data for uhv_circuits: the UHV circuit assembler and the ladder to the wetware mainframe that is the UHV circuit, through the lithium niobate
// wafer, the photonic die, the quantum memory and the optical processor and assembly (docs/reforge/05_quest_design.md, sections 2 and 3.2;
// docs/eras/uhv.md, "Our multiblocks", "Family steps" and the circuit rows). Every row starts at a link to START. Charts own the line
// intermediates, so these quests ask for machines, wafers and circuits only; the furnaces, the foundry and the array are in the machines chapter.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'UHV Circuits', origin: { x: 5, y: 7.5 }, heading: { key: 'H_CIRC', x: 0, y: 0, deps: ['J_HOME'], icon: 'gtceu:uhv_circuit_assembler', desc: [
      'The photonic and quantum chips of this age.',
      'Wafers, lasers, memory and the four mainframes, then the hull.',
    ] } },
  filename: 'uhv_circuits',
  era: 'uhv',
  role: 'circuits',
  order: 1,
  icon: 'gtceu:wetware_processor_mainframe',
  autofocus: 'UCH_LN',
  title: 'UHV: Circuits',
  subtitle: ['Crystals that bend light, a laser grown a few atoms at a time, tissue on a scaffold, and the circuit every UHV machine is built around.'],
};

export const LINKS = [];

// A row's first quest depends on the era quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

const q = (key, kind, title, icon, deps, x, y, teach, tasks, xpN) => ({
  key, kind, title, icon, deps: deps_(deps), x, y, teach, desc: [], tasks, rewards: [xp(xpN)],
});

export const QUESTS = [
  // ------------------------------------------------------------------ the assembler and the parts
  q('UCH_PARTS', 'process', 'UHV Components', 'gtceu:uhv_robot_arm', ['UCH_MAIN'], 15, -1, {
    // Parts take UHV circuits (the mainframes), so they stay after UCH_MAIN. The hull takes none; it sits beside the parts only for the layout.
    for: 'The eight &6UHV Components&r (emitter, sensor, field generator, robot arm, conveyor module, pump, piston and motor) are what every UHV controller, the UHV circuit assembler and the parallel hatch are built from. Each is an assembly line recipe on top of its UV part, the motor goes into most of the others.',
    needs: 'The UV component of the same kind, neutronium, naquadria and europium cable; the emitter, sensor, field generator and arm also take UHV circuits, the mainframes made above.',
    unlocks: 'The UHV circuit assembler, which takes an arm, an emitter and two conveyors, and the controllers of the machines chapter.',
    automate: 'Stock each UHV component by ME: a controller draws up to five of the same kind.',
  }, [
    it('gtceu:uhv_emitter'), it('gtceu:uhv_sensor'), it('gtceu:uhv_field_generator'), it('gtceu:uhv_robot_arm'), it('gtceu:uhv_conveyor_module'),
    it('gtceu:uhv_electric_pump'), it('gtceu:uhv_electric_piston'), it('gtceu:uhv_electric_motor'),
  ], 100),
  q('UCH_HULL', 'step', 'The UHV Hull', 'gtceu:uhv_machine_hull',   ['UCH_MAIN'], 15, 1, {
    for: 'The &6UHV Machine Hull&r is the frame of every UHV hatch and of the UHV circuit assembler. It is made in an assembler from two UHV machine casings, polybenzimidazole and europium cable; it takes no circuit.',
    needs: 'Two UHV machine casings, polybenzimidazole and europium cable.',
    unlocks: 'The UHV circuit assembler and the UHV hatches.',
    automate: 'Craft a few at a time by ME; each hatch and machine takes one.',
  }, [it('gtceu:uhv_machine_hull')], 120),
  q('UCH_ASM', 'machine', 'UHV Circuit Assembler', 'gtceu:uhv_circuit_assembler', ['UCH_PARTS', 'UCH_HULL'], 17, 1, {
    for: 'The &6UHV Circuit Assembler&r is the first assembler that can put together the circuits UHV machines are made of.',
    needs: 'A UHV hull, a UHV robot arm, a UHV emitter, two UHV conveyor modules, two UHV circuits (the mainframes made on this page), europium cable and the UV circuit assembler it upgrades.',
    unlocks: 'The circuit rows of the eras above, and every controller of this era that asks for it.',
    automate: 'Boards and chips arrive from the cleanroom by ME; keep a stock of what it returns.',
  }, [it('gtceu:uhv_circuit_assembler')], 150),

  // ------------------------------------------------------------------ light: wafer, die, processor, assembly
  q('UCH_LN', 'wafer', 'Lithium Niobate Wafer', 'grindless:lithium_niobate_wafer', ['H_CIRC'], 3, -2, {
    for: 'A &6Lithium Niobate Wafer&r is cut from a boule pulled out of a melt. It bends light with an electric field, so a chip can modulate a beam.',
    needs: 'A boule from the crystal growth furnace, and a cleanroom to cut and polish it.',
    unlocks: 'The LNOI wafer next to it, and through it the optical processor.',
    automate: 'The crucible is reused; keep boules and cut wafers in a stocked chest by ME.',
  }, [it('grindless:lithium_niobate_wafer')], 100),
  q('UCH_LNOI', 'wafer', 'Lithium Niobate on Insulator', 'grindless:lnoi_wafer', ['UCH_LN'], 5, -2, {
    for: 'Bond a thin lithium niobate film onto silicon and you have the &6LNOI Wafer&r, the stage light is guided on. A helium implant splits the film off a lithium niobate wafer, and the photonic foundry bonds it.',
    needs: 'A lithium niobate wafer cut with a helium implant (the ion implantation recipe), a silicon wafer, quicklime, ultrapure water, oxygen and hydrofluoric acid, in the photonic foundry. The lithium niobate wafer comes back.',
    unlocks: 'The phase-change die and the optical processor, which takes three LNOI wafers.',
    automate: 'Keep the implanted wafers, silicon wafers and quicklime stocked by ME and the acid and water piped; stock the LNOI wafers for the foundry.',
  }, [it('grindless:lnoi_wafer')], 120),
  q('UCH_PCM', 'circuit', 'Phase-Change Die', 'grindless:pcm_photonic_die', ['UCH_LNOI'], 7, -2, {
    for: 'A chalcogenide film flips between glass and crystal when a laser says so, and the &6Photonic Die&r keeps a bit of light in that state.',
    needs: 'The photonic foundry: one LNOI wafer and a GST target per batch, with argon and ultrapure water. Eight dies come out, and a spent target.',
    unlocks: 'The optical processor, which takes six.',
    automate: 'The foundry fills a stack of dies per wafer; send them on by ME and recycle the spent target.',
  }, [it('grindless:pcm_photonic_die')], 120),
  q('UCH_TFLN', 'circuit', 'Thin-Film Modulators', 'grindless:thin_film_ln_modulator', ['UCH_LNOI'], 9, -3.5, {
    for: 'A &6Thin-Film Lithium Niobate Modulator&r switches a beam with a voltage. One LNOI wafer is cut into sixteen of them, and the optical processor needs ten per batch.',
    needs: 'The photonic foundry: one LNOI wafer, ultrapure water and a circuit program.',
    unlocks: 'The optical processor.',
    automate: 'One wafer fills a stack of modulators: stock them by ME and send them to the foundry that makes processors.',
  }, [it('grindless:thin_film_ln_modulator')], 120),
  q('UCH_OPT', 'circuit', 'Optical Processor', 'gtnn:optical_processor', ['UCH_PCM', 'UCH_QCL', 'UCH_TFLN'], 11, -2, {
    for: 'A processor that thinks in light and runs cold: the &6Optical Processor&r is the light half of the optical assembly that goes into the wetware mainframe.',
    needs: 'In the photonic foundry: three LNOI wafers, six phase-change dies, three quantum cascade lasers, ten thin-film lithium niobate modulators, ultrapure water and a circuit program. Two processors come out.',
    unlocks: 'The optical assembly, which takes three processors.',
    automate: 'Foundry inputs by ME; processors go into their own chest, one stack per assembly.',
  }, [it('gtnn:optical_processor')], 180),
  q('UCH_OASM', 'circuit', 'Optical Assembly', 'gtnn:optical_assembly', ['UCH_OPT', 'UCH_QMEM'], 13, -2, {
    for: 'Optical processors and quantum memory chips make the &6Optical Assembly&r, the largest circuit this era builds.',
    needs: 'In the photonic foundry: three optical processors, three quantum memory chips and ultrapure water.',
    unlocks: 'The wetware mainframe, whose recipe in the organoid array asks for two.',
    automate: 'Two assemblies per mainframe batch: keep a small stock by ME and never more.',
  }, [it('gtnn:optical_assembly')], 200),

  // ------------------------------------------------------------------ the laser and the memory
  q('UCH_INP', 'wafer', 'Indium Phosphide Wafer', 'grindless:inp_wafer', ['H_CIRC'], 3, -0.5, {
      for: 'An &6Indium Phosphide Wafer&r is the substrate a mid-infrared laser is grown on. Its lattice matches the layers the molecular beam reactor lays down.',
    needs: 'An InP boule from the crystal growth furnace, indium and red phosphorus, and the cleanroom.',
    unlocks: 'The quantum cascade laser next to it.',
    automate: 'The boule is slow. Keep indium and phosphorus topped up by ME and stock the wafers.',
  }, [it('grindless:inp_wafer')], 100),
  q('UCH_QCL', 'circuit', 'Quantum Cascade Laser', 'grindless:quantum_cascade_laser', ['UCH_INP'], 7, -0.5, {
    for: 'An electron falls down a staircase of thin layers and gives up a photon at every step. The &6Quantum Cascade Laser&r is hundreds of those layers on InP.',
    needs: 'The MBE reactor: a quantum cascade superlattice wafer and gold dust make eight lasers. Arsenic is contained.',
    unlocks: 'The optical processor, and the sensors of the astrometer and the swarm.',
    automate: 'Contain the arsenic loop; stock lasers by ME.',
  }, [it('grindless:quantum_cascade_laser')], 120),

  q('UCH_EUY', 'wafer', 'Europium-Doped Crystal', 'grindless:eu_yso_boule', ['H_CIRC'], 3, 1, {
    for: 'Europium in an yttrium orthosilicate crystal stores the state of a photon for hours. The &6Eu:YSO Boule&r is where memory chips start.',
    needs: 'The crystal growth furnace and its iridium crucible.',
    unlocks: 'The quantum memory chip beside it.',
    automate: 'Boules are slow to pull; keep the melt stocked by ME and stock slabs.',
  }, [it('grindless:eu_yso_boule')], 100),
  q('UCH_QMEM', 'circuit', 'Quantum Memory Chip', 'grindless:quantum_memory_chip', ['UCH_EUY'], 7, 1, {
    for: 'A slab cut from the boule and patterned in the photonic foundry becomes a &6Quantum Memory Chip&r that holds light as an excitation.',
    needs: 'An Eu:YSO boule and the photonic foundry: one boule and ultrapure water make four chips.',
    unlocks: 'The optical assembly, which takes three.',
    automate: 'One boule cuts several slabs; send chips on by ME.',
  }, [it('grindless:quantum_memory_chip')], 120),

  // ------------------------------------------------------------------ life: the UHV circuit
  q('UCH_ORG', 'circuit', 'Organoid Processor', 'grindless:organoid_processor', ['H_CIRC'], 3, 2.5, {
    for: 'Neurons grown on a chitosan scaffold in ultrapure water make an &6Organoid Processor&r, tissue that learns on a board.',
    needs: 'The organoid array, stem cells from UV\'s vat, a scaffold, ultrapure water and sterile growth medium. It runs only in the Overworld.',
    unlocks: 'The wetware mainframe, four organoids at a time.',
    automate: 'Medium and water by pipe; a tissue line fed by ME runs without a hand.',
  }, [it('grindless:organoid_processor')], 120),
  q('UCH_MAIN', 'circuit', 'Four Mainframes', 'gtceu:wetware_processor_mainframe', ['UCH_ORG', 'UCH_OASM'], 13, 1, {
    for: 'The &6Wetware Processor Mainframe&r is the UHV circuit. The organoid array makes four at once from organoid processors, neuro processing units and optical assemblies.',
    needs: 'Per batch of four: six organoid processors, six neuro processing units, two SiC power modules and two optical assemblies. Like the organoid, it runs only in the Overworld.',
    unlocks: 'Every UHV controller, the UHV components and the UHV circuit assembler.',
    automate: 'Run the array in batches of four by ME and keep a dedicated mainframe chest.',
  }, [it('gtceu:wetware_processor_mainframe', 4)], 220),
];
