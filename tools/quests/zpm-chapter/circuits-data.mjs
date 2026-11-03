// Quest data for zpm_circuits: silicon-28 and the qubit materials, the ZPM circuit assembler and the ladder to the quantum mainframe
// (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/zpm.md, "Our multiblocks" and "Family steps"). SI28 and MILLI moved here from
// zpm_age and keep their keys and ids; every row starts at a link to the quest that opens it. Charts own the line intermediates, so these quests
// ask for machines and line ends only.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.circuits,
  filename: 'zpm_circuits',
  era: 'zpm',
  role: 'circuits',
  order: 1,
  icon: 'grindless:qubit_array',
  autofocus: 'ZC_ASM',
  title: 'ZPM: Circuits',
  subtitle: ['Silicon with one isotope, atoms placed one at a time, and the cold that lets them count.'],
};

export const LINKS = [
  { key: 'C_L_ST', ref: 'START', x: 0, y: 0 },
  { key: 'C_L_SI', ref: 'START', x: 0, y: 1.5 },
];

export const QUESTS = [
  // ------------------------------------------------------------------ the assembler and the ladder
  {
    key: 'ZC_ASM', kind: 'machine', title: 'ZPM Circuit Assembler', icon: 'gtceu:zpm_circuit_assembler',
    deps: ['ZC_CCOMP'], x: 4, y: 0,
    teach: {
      for: 'The &6ZPM Circuit Assembler&r is the first assembler that can build the circuits ZPM machines are made of.',
      needs: 'ZPM components for its hull, a cleanroom you already run, and the circuits that feed it: the Crystal Processor Computer from the quest before, the Crystal Processor Mainframe from the LuV assembly line, or a UV universal circuit.',
      unlocks: 'The Wetware Processor Assembly, which only this assembler builds, and the circuits the controllers of this era ask for.',
      automate: 'Boards and chips arrive by ME from the cleanroom; keep a stock of what it returns.',
    },
    desc: [],
    tasks: [it('gtceu:crystal_processor_mainframe'), it('gtceu:zpm_circuit_assembler')],
    rewards: [xp(100)],
  },
  {
    key: 'ZC_CCOMP', kind: 'circuit', title: 'Crystal Computer', icon: 'gtceu:crystal_processor_computer',
    deps: ['START'], x: 2, y: 0,
    teach: {
      for: 'Crystal processor assemblies on a larger board make       the &6Crystal Processor Computer&r, a ZPM-tier circuit that the LuV assembler builds.',
            needs: 'Several crystal assemblies for each and a LuV circuit assembler or assembly line. The ZPM assembler is not needed.',
      unlocks: 'ZPM hulls and the controllers of this era that ask for a circuit.',
            automate: 'Crystal assemblies come from the LuV line by ME; let the LuV assembler draw them on demand.',
    },
    desc: [],
    tasks: [it('gtceu:crystal_processor_computer')],
    rewards: [xp(120)],
  },
  {
    key: 'ZC_QWAF', kind: 'wafer', title: 'Quantum Wafer', icon: 'gtceu:qbit_cpu_wafer',
    deps: ['START'], x: 2, y: -1.5,
    teach: {
      for: 'A &6Qubit CPU Wafer&r is a wafer treated with radon so that its structure can hold a quantum state.',
      needs: 'A nano CPU wafer and indium gallium phosphide dust, with a little radon, in a chemical reactor. A quantum eye with gallium arsenide is the other route.',
      unlocks: 'The qubit CPU chip, and through it the quantum processors the mainframe is built from.',
      automate: 'Every wafer uses its radon up. Pipe it from the plant continuously and keep a spare tank.',
    },
    desc: [],
    tasks: [it('gtceu:qbit_cpu_wafer')],
    rewards: [xp(80)],
  },
  {
    key: 'ZC_QCHIP', kind: 'wafer', title: 'Quantum Chip', icon: 'gtceu:qbit_cpu_chip',
    deps: ['ZC_QWAF'], x: 4, y: -1.5,
    teach: {
      for: 'Cut from the wafer, the &6Qubit CPU Chip&r is the part of a quantum circuit that does the counting.',
      needs: 'A cleanroom and a cutter fed with lubricant or water.',
      unlocks: 'The quantum mainframe.',
      automate: 'One wafer, many chips: keep a stock by ME so the assembler never waits.',
    },
    desc: [],
    tasks: [it('gtceu:qbit_cpu_chip')],
    rewards: [xp(80)],
  },
  {
    key: 'ZC_QMAIN', kind: 'machine', title: 'Quantum Mainframe', icon: 'gtceu:quantum_processor_mainframe',
    deps: ['ZC_QCHIP'], x: 6, y: -1.5,
    teach: {
      for: 'The &6Quantum Processor Mainframe&r is a ZPM-tier circuit made from Quantum Processor Computers, frames and SMD parts. Its quantum chips come in through those computers.',
      needs: 'Quantum Processor Computers from the IV line, HSS-G frames and RAM, in a circuit assembler of IV tier or better.',
      unlocks: 'ZPM machine hulls and the hatches that open the gate to UV.',
      automate: 'Keep a stock of computers by ME; the assembler draws them and the mainframes go to a dedicated chest.',
    },
    desc: [],
    tasks: [it('gtceu:quantum_processor_mainframe')],
    rewards: [xp(180)],
  },

  // ------------------------------------------------------------------ silicon-28, donors and the cold
  {
    key: 'SI28', kind: 'wafer', title: 'Silicon-28', icon: 'grindless:silicon_28_wafer',
    deps: ['START'], x: 2, y: 1.5,
    teach: {
      for: 'Isotopically pure silicon is grown as a &6Silicon-28 Boule&r and cut into wafers. Ordinary silicon has too much magnetic noise for what comes next.',
      needs: 'Silicon-28 from the hot cell, an EBF for the boule and a cutter. The boule is the slow part.',
      unlocks: 'Donor qubits, and the silicon the qubit fab asks for.',
      automate: 'The hot cell runs all day. Send its silicon to the EBF by ME and stock the wafers.',
    },
    desc: [],
    tasks: [it('grindless:silicon_28_boule'), it('grindless:silicon_28_wafer')],
    rewards: [xp(80)],
  },
  {
    key: 'ZC_DONOR', kind: 'wafer', title: 'Donor Qubits', icon: 'grindless:donor_qubit_wafer',
    deps: ['SI28'], x: 4, y: 1.5,
    teach: {
      for: 'A single phosphorus atom in spin-free silicon holds a quantum state. The &6Donor Qubit Wafer&r is a silicon-28 wafer with them placed one at a time.',
      needs: 'The ion implanter, a silicon-28 wafer and phosphorus dust.',
      unlocks: 'The qubit array, by the donor route.',
      automate: 'Implantation is slow, so run several implanters and let ME collect the wafers.',
    },
    desc: [],
    tasks: [it('grindless:donor_qubit_wafer')],
    rewards: [xp(100)],
  },
  {
    key: 'ZC_NV', kind: 'wafer', title: 'NV Diamond', icon: 'grindless:nv_diamond_chip',
    deps: ['START'], x: 2, y: 4.5,
    teach: {
      for: 'A nitrogen atom next to a gap in diamond is a qubit that works warm. The &6NV Diamond Chip&r is a doped diamond plate with them placed in it.',
      needs: 'Nitrogen-doped plates from the diamond lattice fab, then the ion implanter.',
      unlocks: 'The qubit array, by the slower diamond route.',
      automate: 'The doped plate is the slow step; give the fab its own nitrogen feed.',
    },
    desc: [],
    tasks: [it('grindless:nitrogen_doped_cvd_plate'), it('grindless:nv_diamond_chip')],
    rewards: [xp(100)],
  },
  {
    key: 'MILLI', kind: 'process', title: 'Millikelvin', icon: 'grindless:cryostat_casing',
    deps: ['ZC_DONOR', 'ZC_NV'], x: 6, y: 1.5,
    teach: {
      for: 'Qubits only hold their state when almost nothing is moving. The &6Cryostat Casing&r keeps the fab that cold.',
      needs: 'Aerogel and gold-plated copper for the casing,       and liquid helium to run the cold, with a little Saturn helium on top.',
      unlocks: 'The qubit fab, and every cryogenic hall that comes after.',
            automate: 'Every fab batch draws liquid helium and a little Saturn helium. Pipe both in.',
    },
    desc: [],
    tasks: [it('grindless:cryostat_casing')],
    rewards: [xp(80)],
  },
  {
    key: 'ZC_ARRAY', kind: 'circuit', title: 'Qubit Array', icon: 'grindless:qubit_array',
    deps: ['MILLI'], x: 8, y: 1.5,
    teach: {
      for: 'A &6Qubit Array&r stands in for a stack of circuits in the computation parts our alternative recipes build.',
      needs: 'A donor wafer or an NV chip in the qubit fab, which draws liquid helium and a little Saturn helium for every array.',
      unlocks: 'The computation components for the research station, at a fraction of the circuits.',
      automate: 'Keep a stock by ME; the fab is slow and the components draw them by the handful.',
    },
    desc: [],
    tasks: [it('grindless:qubit_array')],
    rewards: [xp(150)],
  },
  {
    key: 'ZC_HPCA', title: 'Computation from Qubits', icon: 'gtceu:hpca_computation_component',
    deps: ['ZC_ARRAY'], x: 10, y: 1.5,
    desc: [
      'One qubit array does the work of four circuits in an &6HPCA Computation Component&r, and two replace the advanced component\'s four UV circuits. Fewer parts, harder to make.',
      'The ZPM Lines chart shows the line.',
    ],
    tasks: [it('gtceu:hpca_computation_component'), it('gtceu:hpca_advanced_computation_component')],
    rewards: [xp(120)],
  },
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
