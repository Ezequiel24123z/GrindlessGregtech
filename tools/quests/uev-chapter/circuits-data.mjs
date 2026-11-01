// Quest data for uev_circuits: the UEV circuit assembler and the ladder to the optical computer that is the UEV circuit, through the lithium niobate
// wafer, the waveguide circuit, the quantum photonic chip and the optical computer, with the quantum dot, SNSPD and graphene parts it asks for and the
// quantum repeater node (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/uev.md, "Our multiblocks", "Family steps" and
// the circuit rows). Every row starts at a link to a uev_age quest. Charts own the line intermediates, so these quests ask for wafers, chips and
// circuits only; the photonic hall, the SNSPD foundry, the stacker and the entanglement station are in the machines chapter.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: 'uev_circuits',
  era: 'uev',
  role: 'circuits',
  order: 1,
  icon: 'gtnn:optical_computer',
  autofocus: 'CH_ASM',
  title: 'UEV: Circuits',
  subtitle: ['A wafer that bends light, a chip that counts single photons, and the optical computer every UEV machine is built around.'],
};

export const LINKS = [
  { key: 'C_L_ASM', ref: 'START', x: 0, y: 0 },
  { key: 'C_L_LIGHT', ref: 'START', x: 0, y: 2 },
  { key: 'C_L_DET', ref: 'START', x: 0, y: 5 },
  { key: 'C_L_VDW', ref: 'START', x: 0, y: 6.5 },
  { key: 'C_L_NET', ref: 'START', x: 0, y: 8.5 },
];

// A row's first quest depends on the era quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

const q = (key, kind, title, icon, deps, x, y, teach, tasks, xpN) => ({
  key, kind, title, icon, deps: deps_(deps), x, y, teach, desc: [], tasks, rewards: [xp(xpN)],
});

export const QUESTS = [
  // ------------------------------------------------------------------ the assembler and the moving parts
  q('CH_ASM', 'machine', 'UEV Circuit Assembler', 'gtceu:uev_circuit_assembler', ['C_L_ASM'], 2, 0, {
    for: 'The &6UEV Circuit Assembler&r is the first assembler that can put together the optical computers that UEV machines are built around.',
    needs: 'A UEV hull and UEV components, and the cleanroom you already run.',
    unlocks: 'The optical computer on the rows below, and the controller of every machine past the UEV hull.',
    automate: 'Boards and chips arrive from the cleanroom by ME; keep a small stock of what it returns.',
  }, [it('gtceu:uev_circuit_assembler')], 150),
  q('PARTS', 'step', 'UEV Parts', 'gtceu:uev_emitter', ['CH_ASM'], 4, 0, {}, [
    it('gtceu:uev_emitter'), it('gtceu:uev_sensor'), it('gtceu:uev_field_generator'), it('gtceu:uev_robot_arm'), it('gtceu:uev_conveyor_module'),
    it('gtceu:uev_electric_pump'), it('gtceu:uev_electric_piston'), it('gtceu:uev_rotor_holder'),
  ], 100),
  q('HATCH', 'step', 'UEV Hatches', 'gtceu:uev_energy_input_hatch', ['PARTS'], 6, 0, {}, [it('gtceu:uev_energy_input_hatch')], 100),

  // ------------------------------------------------------------------ light: wafer, chip, circuit, computer
  q('CH_LNOI', 'wafer', 'Lithium Niobate on Insulator', 'grindless:lnoi_wafer', ['C_L_LIGHT'], 2, 2, {
    for: 'A thin film of lithium niobate bonded onto an insulator makes the &6LNOI Wafer&r, the stage a modulator guides light on.',
    needs: 'The photonic foundry and a boule from UHV\'s crystal growth furnace, in the cleanroom.',
    unlocks: 'The waveguide circuit next to it, and through it the whole photonic line.',
    automate: 'Bonding runs in plain machines by ME; keep spare wafers for the foundry.',
  }, [it('grindless:lnoi_wafer')], 100),
  q('CH_SIN', 'wafer', 'Silicon Nitride Chip', 'grindless:annealed_sin_chip', ['C_L_LIGHT'], 2, 3.5, {
    for: 'Light travels in silicon nitride with almost no loss. An annealed &6SiN Chip&r carries the waveguides cut into it.',
    needs: 'The photonic foundry, a damascene SiN wafer and the cleanroom.',
    unlocks: 'The waveguide circuit, which joins it to the LNOI wafer.',
    automate: 'The anneal is slow, so run two foundries; keep chips in a stocked chest by ME.',
  }, [it('grindless:annealed_sin_chip')], 100),
  q('CH_WG', 'circuit', 'Waveguide Circuit', 'grindless:waveguide_circuit', ['CH_LNOI', 'CH_SIN'], 5, 2.75, {
    for: 'An SiN chip bonded to an LNOI wafer is a &6Waveguide Circuit&r: light goes in, is steered and switched, and comes out.',
    needs: 'The photonic integration hall, one SiN chip, one LNOI wafer and a circuit 1 program.',
    unlocks: 'The quantum photonic chip, which puts sources and detectors on it.',
    automate: 'One chip and one wafer per circuit: stock both by ME and send circuits on.',
  }, [it('grindless:waveguide_circuit')], 120),

  // ------------------------------------------------------------------ sources and detectors
  q('CH_QD', 'wafer', 'Quantum Dot Wafer', 'grindless:inas_qd_wafer', ['C_L_DET'], 2, 5, {
    for: 'Indium arsenide islands a few nanometres wide emit one photon at a time. The &6InAs Quantum Dot Wafer&r is where the chip\'s source comes from.',
    needs: 'UHV\'s MBE reactor, indium and arsenic, which is contained.',
    unlocks: 'The quantum dot source, mounted and ready for the chip.',
    automate: 'Contain the arsenic loop; keep wafers by ME and cut one source per chip.',
  }, [it('grindless:inas_qd_wafer'), it('grindless:qd_source')], 120),
  q('CH_SNS', 'circuit', 'Single-Photon Detector', 'grindless:snspd', ['CH_QD'], 4, 5, {
    for: 'A tungsten silicide nanowire cooled to near zero fires when a single photon lands on it: the &6SNSPD&r.',
    needs: 'The SNSPD foundry, a WSi wafer and superfluid helium to cool and package it.',
    unlocks: 'The quantum photonic chip, and the entanglement station\'s repeater.',
    automate: 'Helium by pipe; stock packaged detectors by ME, one per chip and one per repeater.',
  }, [it('grindless:snspd')], 120),
  q('CH_HBN', 'circuit', 'Single-Photon Emitter', 'grindless:hbn_emitter_chip', ['C_L_VDW'], 2, 6.5, {
    for: 'A defect in a layer of hexagonal boron nitride gives off photons one by one: the &6hBN Emitter Chip&r.',
    needs: 'The van der Waals stacker, CVD boron nitride film and a cleanroom.',
    unlocks: 'The quantum photonic chip, as its second light source.',
    automate: 'Film by ME; the stacker returns chips in a chest, stock a few.',
  }, [it('grindless:hbn_emitter_chip')], 120),
  q('CH_GRM', 'circuit', 'Graphene Modulator', 'grindless:graphene_modulator', ['CH_HBN'], 4, 6.5, {
    for: 'Graphene between two films of boron nitride changes how much light passes when a voltage is applied: the &6Graphene Modulator&r.',
    needs: 'The van der Waals stacker, graphene film and hBN film.',
    unlocks: 'The quantum photonic chip.',
    automate: 'Graphene and boron nitride arrive by ME; send modulators on by ME.',
  }, [it('grindless:graphene_modulator')], 120),

  // ------------------------------------------------------------------ the chip and the circuit
  q('CH_QPC', 'circuit', 'Quantum Photonic Chip', 'grindless:quantum_photonic_chip', ['CH_WG', 'CH_SNS', 'CH_GRM'], 8, 5, {
    for: 'A waveguide circuit with a quantum dot source, a detector, a modulator and an emitter on it is the &6Quantum Photonic Chip&r: a whole optical circuit on a few millimetres.',
    needs: 'The photonic integration hall, a circuit 2 program and one of each part above.',
    unlocks: 'The optical computer, which is a chip on an optical assembly.',
    automate: 'Parts by ME in matched counts; keep a few chips in stock, one per computer.',
  }, [it('grindless:quantum_photonic_chip')], 180),
  q('FIRST', 'circuit', 'Optical Computer', 'gtnn:optical_computer', ['CH_QPC'], 10, 5, {
    for: 'The &6Optical Computer&r thinks in photons and runs cold. It is the UEV circuit, and the hall is the only machine that makes it.',
    needs: 'A quantum photonic chip and an optical assembly from UHV, in the photonic integration hall.',
    unlocks: 'Every UEV controller after the hull, and the hatches and parts that go with them.',
    automate: 'One chip and one assembly per computer: keep a dedicated chest and never a big stock.',
  }, [it('gtnn:optical_computer')], 220),

  // ------------------------------------------------------------------ the repeater
  q('CH_REP', 'circuit', 'Quantum Repeater Node', 'grindless:quantum_repeater_node', ['C_L_NET'], 2, 8.5, {
    for: 'Two photons entangled over a distance let a network stay in step. A &6Quantum Repeater Node&r keeps one end of the link.',
    needs: 'The entanglement station in Earth orbit, an Eu:YSO memory crystal, quantum dots, SNSPDs and hollow-core fibre.',
    unlocks: 'The UEV wireless link, and the cell that the quantum repeater keeps in step.',
    automate: 'Ship the parts to orbit by ME and bring the nodes back; one node is worth a long run.',
  }, [it('grindless:quantum_repeater_node')], 180),
];
