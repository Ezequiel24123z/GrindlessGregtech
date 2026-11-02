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
  section: { name: "Circuits", origin: { x: 0, y: 0 }, heading: { key: "IV_H_CIRCUITS", x: 64.25, y: 0, deps: ["IV_ASSEMBLY_LINE"], icon: "gtceu:quantum_processor", desc: ["The quantum ladder: the IV wafers, chips and circuits, and the parts built from them, once the assembly line is running."] } },
};

export const QUESTS = [
  {
    key: "IVCA", kind: "machine", title: "IV Circuit Assembler", icon: "gtceu:iv_circuit_assembler",
    deps: ["IV_H_CIRCUITS"], x: 67.25, y: -0.75,
    teach: {
      for: "The &6IV Circuit Assembler&r builds the quantum circuits, which the EV assembler cannot.",
      needs: "Two Nano Processor Mainframes from the EV circuit assembler (the LuV-tier circuit this machine is built around), and the machine itself. A LuV universal circuit works too.",
      unlocks: "Every quantum circuit, from the processor to the mainframe.",
      automate: "Feed boards and chips by ME, and keep a standing stock of mainframes.",
    },
    desc: [],
    tasks: [it("gtceu:nano_processor_mainframe", 2), it("gtceu:iv_circuit_assembler", 1)],
    rewards: [xp(80)],
  },
  {
    key: "IVLE", kind: "machine", title: "IV Laser Engraver", icon: "gtceu:iv_laser_engraver",
    deps: ["IVCA"], x: 69.5, y: 0.75,
    teach: {
      for: "The &6IV Laser Engraver&r       engraves wafers at a higher voltage, with a cutter beside it to slice them.",
      needs: "An IV laser engraver and a cutter beside it, both in the cleanroom.",
            unlocks: "A wafer line that keeps up with the IV circuits.",
      automate: "Wafers in from the network, chips out. Give each lens its own engraver.",
    },
    desc: [],
    tasks: [it("gtceu:iv_laser_engraver", 1), it("gtceu:iv_cutter", 1)],
    rewards: [xp(60)],
  },
  {
    key: "IVNB", kind: "process", title: "Naquadah Boule", icon: "gtceu:naquadah_boule",
    deps: ["IV_NAQUADAH_INGOT"], x: 64.25, y: -1.25,
    teach: {
      for: "Naquadah grows into a boule in the blast furnace, and the cutter slices it into &6Naquadah Wafers&r.",
      needs: "Naquadah from Venus, silicon, argon and a blast furnace that reaches the temperature.",
      unlocks: "The SoC and Advanced SoC wafers.",
      automate: "Keep a boule always growing and let the cutter feed the wafer line.",
    },
    desc: [],
    tasks: [it("gtceu:naquadah_boule", 1), it("gtceu:naquadah_wafer", 1)],
    rewards: [xp(60)],
  },
  {
    key: "IVSOC", kind: "wafer", title: "SoC Wafer", icon: "gtceu:soc_wafer",
    deps: ["IVNB"], x: 66.5, y: -2.25,
    teach: {
      for: "A naquadah wafer, engraved, becomes the &6SoC Wafer&r and the cutter turns it into &6SoCs&r.",
      needs: "The IV laser engraver and a cleanroom.",
      unlocks: "The SoC chip, which later circuits and the Advanced SoC build on.",
      automate: "A wafer in, chips out. Let ME feed the engraver and store the chips.",
    },
    desc: [],
    tasks: [it("gtceu:soc_wafer", 1), it("gtceu:soc", 1)],
    rewards: [xp(60)],
  },
  {
    key: "IVASOC", kind: "wafer", title: "Advanced SoC Wafer", icon: "gtceu:advanced_soc_wafer",
    deps: ["IVSOC"], x: 68.5, y: -3.75,
    teach: {
      for: "A naquadah wafer under a purple lens becomes the &6Advanced SoC Wafer&r, and the cutter turns it into &6Advanced SoCs&r.",
      needs: "The IV laser engraver, a purple lens, a cutter with lubricant or water, and a cleanroom.",
      unlocks: "Advanced SoCs, for the quantum processor's faster recipe and the parts that ask for them.",
      automate: "A wafer in, chips out. Keep lenses in the engraver and lubricant on a pipe.",
    },
    desc: [],
    tasks: [it("gtceu:advanced_soc_wafer", 1), it("gtceu:advanced_soc", 1)],
    rewards: [xp(60)],
  },
  {
    key: "IVQB", kind: "wafer", title: "QBit CPU Wafer", icon: "gtceu:qbit_cpu_wafer",
    deps: ["IVSOC"], x: 70.25, y: -2.25,
    teach: {
      for: "The &6QBit CPU Wafer&r       is a nano CPU wafer treated with radon. The cutter slices it into QBit chips, which the quantum processor is built from.",
            needs: "Nano CPU wafers, radon from the air line and a chemical reactor. Every wafer uses radon up, so the supply has to be continuous.",
            unlocks: "The quantum processor.",
            automate: "Radon by pipe, wafers by ME, chips from the cleanroom cutter.",
    },
    desc: [],
    tasks: [it("gtceu:qbit_cpu_wafer", 1), it("gtceu:qbit_cpu_chip", 1)],
    rewards: [xp(60)],
  },
  {
    key: "IVHP", kind: "wafer", title: "HPIC Wafer", icon: "gtceu:hpic_wafer",
    deps: ["IVQB"], x: 71.5, y: -2,
    teach: {
      for: "The &6HPIC Wafer&r carries the high-power chips       that the energy hatches, transformers and large power parts ask for.",
            needs: "A chemical reactor or large chemical reactor, or the epitaxy route if you have built it.",
            unlocks: "The IV and LuV energy parts. No quantum circuit needs it.",
      automate: "Two routes, one wafer. Pick the one your cleanroom can feed and stock chips.",
    },
    desc: [],
    tasks: [it("gtceu:hpic_wafer", 1), it("gtceu:hpic_chip", 1)],
    rewards: [xp(60)],
  },
  {
    key: "IVQP", kind: "circuit", title: "Quantum Processor", icon: "gtceu:quantum_processor",
    deps: ["IVCA", "IVQB"], x: 71.75, y: -0.75,
    teach: {
      for: "The &6Quantum Processor&r is the quantum line's EV circuit. The usual recipe takes QBit and nano CPU chips.",
      needs: "QBit chips, nano CPU chips and fibre-reinforced boards, in the IV assembler or the assembly line. A faster recipe takes Advanced SoCs but wants an assembler far bigger than IV.",
      unlocks: "The assembly, and every IV machine that wants circuits.",
      automate: "Run it from the assembler's own pattern, with chips delivered by ME.",
    },
    desc: [],
    tasks: [it("gtceu:quantum_processor", 2)],
    rewards: [xp(60)],
  },
  {
    key: "IVQA", kind: "circuit", title: "Quantum Assembly", icon: "gtceu:quantum_processor_assembly",
    deps: ["IVQP"], x: 73.5, y: 0.25,
    teach: {
      for: "The &6Quantum Processor Assembly&r is the quantum line's IV circuit.",
      needs: "A stack of quantum processors and fibre-reinforced boards. It takes no chips of its own.",
      unlocks: "The computer, and the IV machines that ask for assemblies.",
      automate: "Processors come from the network; the assembler repeats.",
    },
    desc: [],
    tasks: [it("gtceu:quantum_processor_assembly", 1)],
    rewards: [xp(70)],
  },
  {
    key: "IVQC", kind: "circuit", title: "Quantum Processor Computer", icon: "gtceu:quantum_processor_computer",
    deps: ["IVQA"], x: 75.25, y: 0,
    teach: {
      for: "The &6Quantum Processor Computer&r is the quantum line's LuV circuit and the real wall of IV.",
      needs: "Assemblies, boards, plenty of RAM and NOR chips. The wall is the volume of processors behind it.",
      unlocks: "The LuV machine hull, and the mainframe after it.",
      automate: "Stock every input in the network first. This recipe is the one that stalls.",
    },
    desc: [],
    tasks: [it("gtceu:quantum_processor_computer", 1)],
    rewards: [xp(120)],
  },
  {
    key: "IVQM", kind: "signature", title: "Quantum Processor Mainframe", icon: "gtceu:quantum_processor_mainframe",
    deps: ["IVQC"], x: 76.75, y: 0.25,
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
