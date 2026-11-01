// Quest data for ev_circuits: the nano ladder, its wafers and the machine that builds it (docs/reforge/05_quest_design.md, sections 2 and 3.2).
// Every row starts at a link to the ev_age quest that opens it. Charts own the line intermediates, so these quests ask for
// machines and line ends only.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: "ev_circuits",
  era: "ev",
  role: "circuits",
  order: 5,
  icon: "gtceu:nano_processor",
  autofocus: "ECA",
  title: "EV: Circuits",
  subtitle: ["Phosphorus, patience and the first circuits that need a cleanroom twice."],
};

export const LINKS = [
  { key: "L_MP", ref: "MP", x: 0, y: 0 },
  { key: "L_TI", ref: "TI", x: 0, y: 1.5 },
];

export const QUESTS = [
  {
    key: "ECA", kind: "machine", title: "EV Circuit Assembler", icon: "gtceu:ev_circuit_assembler",
    deps: ["MP"], x: 2, y: 0,
    teach: {
      for: "The &6EV Circuit Assembler&r builds the nano circuits, which the HV assembler cannot.",
      needs: "It asks for Microprocessor Mainframes, the micro line's last circuit, and an HV emitter, since the EV one waits for IV.",
      unlocks: "Every nano circuit from here to the supercomputer.",
      automate: "Feed circuit boards and chips from the cleanroom lines by ME, and keep a stock of mainframes.",
    },
    desc: [],
    tasks: [it("gtceu:micro_processor_mainframe", 2), it("gtceu:ev_circuit_assembler", 1)],
    rewards: [xp(60)],
  },
  {
    key: "NCPU", kind: "wafer", title: "Nano CPU Wafer", icon: "gtceu:nano_cpu_wafer",
    deps: ["ECA"], x: 2, y: -1.5,
    teach: {
      for: "A CPU wafer treated in an EV chemical reactor becomes a &6Nano CPU Wafer&r, and the laser engraver cuts it into chips.",
      needs: "A working cleanroom, carbon fibers and the HV wafer line behind you.",
      unlocks: "The nanoprocessor, and with it the whole nano ladder.",
      automate: "Cleanroom hatches take wafers from the ME network and return chips to it.",
    },
    desc: [],
    tasks: [it("gtceu:nano_cpu_wafer", 1), it("gtceu:nano_cpu_chip", 1)],
    rewards: [xp(50)],
  },
  {
    key: "PHOS", kind: "process", title: "Phosphorus Boule", icon: "gtceu:phosphorus_boule",
    deps: ["TI"], x: 2, y: 1.5,
    teach: {
      for: "A phosphorus boule grows slowly in the blast furnace and is sliced into wafers.",
      needs: "Patience: the boule takes its time, so start one before you need the chips.",
      unlocks: "MPIC and NOR memory chips, and through them EV hatches and the supercomputer.",
      automate: "Keep a boule always growing and let the cutter feed the wafer line.",
    },
    desc: [],
    tasks: [it("gtceu:phosphorus_boule", 1), it("gtceu:phosphorus_wafer", 1)],
    rewards: [xp(50)],
  },
  {
    key: "MPIC", kind: "wafer", title: "MPIC Chips", icon: "gtceu:mpic_chip",
    deps: ["PHOS"], x: 4, y: 1.5,
    teach: {
      for: "The phosphorus wafer becomes an &6MPIC Wafer&r and the engraver cuts the &6MPIC Chips&r out of it.",
      needs: "A laser engraver and the right lens.",
      unlocks: "Real EV energy and dynamo hatches.",
      automate: "A wafer in, chips out. Let ME feed the engraver and store the chips.",
    },
    desc: [],
    tasks: [it("gtceu:mpic_wafer", 1), it("gtceu:mpic_chip", 1)],
    rewards: [xp(50)],
  },
  {
    key: "NOR", kind: "wafer", title: "NOR Memory", icon: "gtceu:nor_memory_chip",
    deps: ["MPIC"], x: 6, y: 1.5,
    teach: {
      for: "&6NOR Memory&r is the same boule engraved with a pink lens, which is a different chip from the same slice of rock.",
      needs: "The pink glass lens and a free engraver.",
      unlocks: "The Nanoprocessor Supercomputer.",
      automate: "Keep a second engraver for this lens so the MPIC line never waits for a lens swap.",
    },
    desc: [],
    tasks: [it("gtceu:nor_memory_wafer", 1), it("gtceu:nor_memory_chip", 1), it("gtceu:pink_glass_lens", 1)],
    rewards: [xp(50)],
  },
  {
    key: "SMD", title: "SMD Diodes", icon: "gtceu:smd_diode",
    deps: ["NOR"], x: 8, y: 1.5,
    desc: [
      "The &6SMD Diode&r wants fine platinum wire, so the platinum plant comes before it. Past that it is another cleanroom assembler recipe.",
      "The supercomputer wants plenty. Put it on a repeating pattern.",
    ],
    tasks: [it("gtceu:smd_diode", 1)],
    rewards: [xp(40)],
  },
  {
    key: "NP", kind: "circuit", title: "Nanoprocessor", icon: "gtceu:nano_processor",
    deps: ["ECA", "NCPU"], x: 4, y: 0,
    teach: {
      for: "The &6Nanoprocessor&r is the nano line's HV circuit, and only the EV circuit assembler can put one together.",
      needs: "Nano CPU chips, carbon fibers and the usual SMD parts.",
      unlocks: "The assembly, and every EV machine that wants circuits.",
      automate: "Run it from the assembler's own pattern, with the chips delivered by ME.",
    },
    desc: [],
    tasks: [it("gtceu:carbon_fibers", 1), it("gtceu:nano_processor", 1)],
    rewards: [xp(50)],
  },
  {
    key: "NPA", kind: "circuit", title: "Nanoprocessor Assembly", icon: "gtceu:nano_processor_assembly",
    deps: ["NP"], x: 6, y: 0,
    teach: {
      for: "The &6Nanoprocessor Assembly&r is the nano line's EV circuit, built on an epoxy board.",
      needs: "Nanoprocessors and the epoxy line from HV, which still has work to do.",
      unlocks: "The supercomputer and the EV machines that ask for assemblies.",
      automate: "Epoxy boards and nanoprocessors come from the network; the assembler repeats.",
    },
    desc: [],
    tasks: [it("gtceu:nano_processor_assembly", 1)],
    rewards: [xp(50)],
  },
  {
    key: "NPC", kind: "circuit", title: "Nanoprocessor Supercomputer", icon: "gtceu:nano_processor_computer",
    deps: ["NPA", "NOR", "SMD"], x: 8, y: 0,
    teach: {
      for: "The &6Nanoprocessor Supercomputer&r is the IV circuit and the real wall of EV.",
      needs: "Assemblies, NOR memory and SMD diodes, which means the platinum plant and the slow boule.",
      unlocks: "The IV machine hull, and the mainframe after it.",
      automate: "Stock every input in the network first. This recipe is the one that stalls.",
    },
    desc: [],
    tasks: [it("gtceu:nano_processor_computer", 1)],
    rewards: [xp(120)],
  },
  {
    key: "NPM", kind: "signature", title: "Nanoprocessor Mainframe", icon: "gtceu:nano_processor_mainframe",
    deps: ["NPC"], x: 10, y: 0,
    teach: {
      for: "The &6Nanoprocessor Mainframe&r closes the nano ladder.",
      needs: "Supercomputers, and the same cleanroom discipline, at a larger scale.",
      unlocks: "Nothing in EV asks for it. Later eras do.",
      automate: "A dedicated assembler line and a standing stock of supercomputers.",
    },
    desc: [],
    tasks: [it("gtceu:nano_processor_mainframe", 1)],
    rewards: [xp(120)],
  },
];
