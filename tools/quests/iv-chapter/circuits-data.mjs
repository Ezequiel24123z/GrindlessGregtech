// Quest data for iv_circuits: the quantum generation, its wafers and the machines that build it (docs/reforge/05_quest_design.md, sections 2 and 3.2).
// Every row starts at a link to the iv_age quest that opens it. Charts own the line intermediates, so these quests ask for
// machines and line ends only.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: "iv_circuits",
  era: "iv",
  role: "circuits",
  order: 1,
  icon: "gtceu:quantum_processor",
  autofocus: "IVCA",
  title: "IV: Circuits",
  subtitle: ["Naquadah in the wafer, and the first circuits that no hand-built line can feed."],
};

export const LINKS = [
  { key: "C_L_IV_ASSEMBLY_LINE", ref: "IV_ASSEMBLY_LINE", x: 0, y: 0 },
  { key: "C_L_IV_NAQUADAH_INGOT", ref: "IV_NAQUADAH_INGOT", x: 0, y: 1.5 },
];

export const QUESTS = [
  {
    key: "IVCA", kind: "machine", title: "IV Circuit Assembler", icon: "gtceu:iv_circuit_assembler",
    deps: ["IV_ASSEMBLY_LINE"], x: 2, y: 0,
    teach: {
      for: "The &6IV Circuit Assembler&r builds the quantum circuits, which the EV assembler cannot.",
      needs: "Nanoprocessor Supercomputers, the EV line's last circuit, and the machine itself.",
      unlocks: "Every quantum circuit, from the processor to the mainframe.",
      automate: "Feed boards and chips by ME, and keep a standing stock of supercomputers.",
    },
    desc: [],
    tasks: [it("gtceu:nano_processor_computer", 2), it("gtceu:iv_circuit_assembler", 1)],
    rewards: [xp(80)],
  },
  {
    key: "IVLE", kind: "machine", title: "IV Laser Engraver", icon: "gtceu:iv_laser_engraver",
    deps: ["IVCA"], x: 2, y: -1.5,
    teach: {
      for: "The &6IV Laser Engraver&r etches the quantum wafers with lenses the EV engraver cannot hold.",
      needs: "An IV laser engraver and a cutter beside it, both in the cleanroom.",
      unlocks: "The SoC, QBit and HPIC wafers.",
      automate: "Wafers in from the network, chips out. Give each lens its own engraver.",
    },
    desc: [],
    tasks: [it("gtceu:iv_laser_engraver", 1), it("gtceu:iv_cutter", 1)],
    rewards: [xp(60)],
  },
  {
    key: "IVCAL", kind: "machine", title: "Circuit Assembly Line", icon: "gtnn:circuit_assembly_line",
    deps: ["IVLE"], x: 4, y: -1.5,
    teach: {
      for: "The &6Circuit Assembly Line&r builds quantum circuits in bulk, with several inputs at once.",
      needs: "Its controller, plus the same boards and chips the single assembler uses.",
      unlocks: "Quantum circuits at the rate the IV hulls and the next era demand.",
      automate: "Every slot fed from the network. Stock first, then run.",
    },
    desc: [],
    tasks: [it("gtnn:circuit_assembly_line", 1)],
    rewards: [xp(80)],
  },
  {
    key: "IVNB", kind: "process", title: "Naquadah Boule", icon: "gtceu:naquadah_boule",
    deps: ["IV_NAQUADAH_INGOT"], x: 2, y: 1.5,
    teach: {
      for: "Naquadah grows into a boule in the blast furnace, and the cutter slices it into &6Naquadah Wafers&r.",
      needs: "Naquadah from Venus and a blast furnace that reaches the temperature.",
      unlocks: "The SoC, QBit and HPIC wafers.",
      automate: "Keep a boule always growing and let the cutter feed the wafer line.",
    },
    desc: [],
    tasks: [it("gtceu:naquadah_boule", 1), it("gtceu:naquadah_wafer", 1)],
    rewards: [xp(60)],
  },
  {
    key: "IVSOC", kind: "wafer", title: "SoC Wafer", icon: "gtceu:soc_wafer",
    deps: ["IVNB"], x: 4, y: 1.5,
    teach: {
      for: "A naquadah wafer, engraved, becomes the &6SoC Wafer&r and the cutter turns it into &6SoCs&r.",
      needs: "The IV laser engraver and a cleanroom.",
      unlocks: "The quantum processor.",
      automate: "A wafer in, chips out. Let ME feed the engraver and store the chips.",
    },
    desc: [],
    tasks: [it("gtceu:soc_wafer", 1), it("gtceu:soc", 1)],
    rewards: [xp(60)],
  },
  {
    key: "IVQB", kind: "wafer", title: "QBit CPU Wafer", icon: "gtceu:qbit_cpu_wafer",
    deps: ["IVSOC"], x: 6, y: 1.5,
    teach: {
      for: "The &6QBit CPU Wafer&r is a CPU wafer treated with radon, and its chips go into every quantum assembly.",
      needs: "Radon from the air line and a chemical reactor that can take it.",
      unlocks: "The quantum assembly and the supercomputer.",
      automate: "Radon by pipe, wafers by ME. Keep a spare tank of radon.",
    },
    desc: [],
    tasks: [it("gtceu:qbit_cpu_wafer", 1), it("gtceu:qbit_cpu_chip", 1)],
    rewards: [xp(60)],
  },
  {
    key: "IVHP", kind: "wafer", title: "HPIC Wafer", icon: "gtceu:hpic_wafer",
    deps: ["IVQB"], x: 8, y: 1.5,
    teach: {
      for: "The &6HPIC Wafer&r carries the high-power chips that every IV energy part asks for.",
      needs: "A large chemical reactor, or the epitaxy route if you have built it.",
      unlocks: "The supercomputer and the IV hatches.",
      automate: "Two routes, one wafer. Pick the one your cleanroom can feed and stock chips.",
    },
    desc: [],
    tasks: [it("gtceu:hpic_wafer", 1), it("gtceu:hpic_chip", 1)],
    rewards: [xp(60)],
  },
  {
    key: "IVQP", kind: "circuit", title: "Quantum Processor", icon: "gtceu:quantum_processor",
    deps: ["IVCA", "IVSOC"], x: 4, y: 0,
    teach: {
      for: "The &6Quantum Processor&r is the quantum line's EV circuit, and it needs a SoC to exist.",
      needs: "SoCs, and the IV assembler or the assembly line.",
      unlocks: "The assembly, and every IV machine that wants circuits.",
      automate: "Run it from the assembler's own pattern, with SoCs delivered by ME.",
    },
    desc: [],
    tasks: [it("gtceu:quantum_processor", 2)],
    rewards: [xp(60)],
  },
  {
    key: "IVQA", kind: "circuit", title: "Quantum Assembly", icon: "gtceu:quantum_processor_assembly",
    deps: ["IVQP", "IVQB"], x: 6, y: 0,
    teach: {
      for: "The &6Quantum Processor Assembly&r is the quantum line's IV circuit.",
      needs: "Quantum processors and QBit chips.",
      unlocks: "The computer, and the IV machines that ask for assemblies.",
      automate: "Processors and QBit chips come from the network; the assembler repeats.",
    },
    desc: [],
    tasks: [it("gtceu:quantum_processor_assembly", 1)],
    rewards: [xp(70)],
  },
  {
    key: "IVQC", kind: "circuit", title: "Quantum Processor Computer", icon: "gtceu:quantum_processor_computer",
    deps: ["IVQA", "IVHP"], x: 8, y: 0,
    teach: {
      for: "The &6Quantum Processor Computer&r is the quantum line's LuV circuit and the real wall of IV.",
      needs: "Assemblies and HPIC chips, which means the whole wafer row behind it.",
      unlocks: "The LuV machine hull, and the mainframe after it.",
      automate: "Stock every input in the network first. This recipe is the one that stalls.",
    },
    desc: [],
    tasks: [it("gtceu:quantum_processor_computer", 1)],
    rewards: [xp(120)],
  },
  {
    key: "IVQM", kind: "signature", title: "Quantum Processor Mainframe", icon: "gtceu:quantum_processor_mainframe",
    deps: ["IVQC"], x: 10, y: 0,
    teach: {
      for: "The &6Quantum Processor Mainframe&r closes the quantum ladder.",
      needs: "Computers, and the same cleanroom discipline at a larger scale.",
      unlocks: "Nothing in IV asks for it. Later eras do.",
      automate: "A dedicated assembler line and a standing stock of computers.",
    },
    desc: [],
    tasks: [it("gtceu:quantum_processor_mainframe", 1)],
    rewards: [xp(120)],
  },
];
