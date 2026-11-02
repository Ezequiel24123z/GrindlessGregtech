// Quest data for luv_circuits: the LuV assembler, the crystal fold, the wetware ladder and the research that opens ZPM
// (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/luv.md, "Quests"). Quests moved here from luv_age keep their keys and ids;
// every row starts at a link to the quest that opens it. Charts own the line intermediates, so these quests ask for machines and line ends only.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });
const ri = (item, count) => ({ type: 'item', item, count });

export const CHAPTER = {
  filename: 'luv_circuits',
  era: 'luv',
  role: 'circuits',
  order: 1,
  icon: 'gtceu:wetware_processor',
  autofocus: 'LCA',
  title: 'LuV: Circuits',
  subtitle: ['Crystals grown in orbit, neurons grown in a lab, and the research that lets ZPM begin.'],
};

export const LINKS = [
  { key: 'C_L_LC', ref: 'LUVC', x: 0, y: 0 },
  { key: 'C_L_RC', ref: 'STAT', x: 0, y: 1.5 },
  { key: 'C_L_NP', ref: 'ORGANOID', x: 0, y: 3 },
  { key: 'C_L_DB', ref: 'FIBQ', x: 0, y: 4.5 },
];

export const QUESTS = [
  {
    key: 'LCA', kind: 'machine', title: 'LuV Circuit Assembler', icon: 'gtceu:luv_circuit_assembler',
    deps: ['LUVC'], x: 2, y: 0,
    teach: {
      for: 'The &6LuV Circuit Assembler&r builds the crystal circuits, which the IV one cannot.',
      needs: 'LuV components for its hull, and a cleanroom you already run for the IV line.',
      unlocks: 'The crystal chain, and through it the wetware chain that follows.',
      automate: 'Boards and chips come from the cleanroom by ME; keep a stock of the circuits it returns.',
    },
    desc: [],
    tasks: [it('gtceu:luv_circuit_assembler')],
    rewards: [xp(60)],
  },
  {
    key: 'RAWC', kind: 'wafer', title: 'Raw Crystal Chip', icon: 'gtceu:raw_crystal_chip', pkg: ['S03'],
    deps: ['LCA'], x: 2, y: 1.5,
    teach: {
      for: 'A raw crystal chip is a flawless crystal sliced thin, and engraved it becomes the &6Engraved Crystal Chip&r.',
      needs: 'Chips from the Zero-G Crystal Grower, the same dopant GregTech asks for, and a laser engraver.',
      unlocks: 'The crystal CPU and SoC, and with them every circuit up to the wetware.',
      automate: 'The grower runs all day. Send its raw chips to the engraver by ME and stock the result.',
    },
    desc: [],
    tasks: [it('gtceu:raw_crystal_chip'), it('gtceu:engraved_crystal_chip')],
    rewards: [xp(60)],
  },
  {
    key: 'CCPU', kind: 'wafer', title: 'Crystal CPU', icon: 'gtceu:crystal_cpu', pkg: ['S03'],
    deps: ['RAWC'], x: 4, y: 1.5,
    teach: {
      for: 'The engraved crystal chip becomes a &6Crystal CPU&r, and its sibling the crystal SoC.',
      needs: 'A cleanroom and the lasers GregTech asks for. The grown chips are a faster route, not a different one.',
      unlocks: 'The crystal processor now, and the wetware circuits after it.',
      automate: 'A chip in, a CPU out. Let ME feed the engraver.',
    },
    desc: [],
    tasks: [it('gtceu:crystal_cpu'), it('gtceu:crystal_soc')],
    rewards: [xp(60)],
  },
  {
    key: 'CPROC', kind: 'circuit', title: 'Crystal Processor', icon: 'gtceu:crystal_processor', pkg: ['S03'],
    deps: ['CCPU'], x: 6, y: 1.5,
    teach: {
      for: 'The LuV assembler puts a crystal CPU and a crystal SoC together into a &6Crystal Processor&r.',
      needs: 'Circuit boards, the CPU and SoC, and plenty of cables.',
      unlocks: 'The crystal assembly, and the LuV machine hulls and components that ask for it.',
      automate: 'Keep a stock by ME so the component lines never wait.',
    },
    desc: [],
    tasks: [it('gtceu:crystal_processor')],
    rewards: [xp(80)],
  },
  {
    key: 'CASM', kind: 'circuit', title: 'Crystal Assembly', icon: 'gtceu:crystal_processor_assembly', pkg: ['S03'],
    deps: ['CPROC'], x: 8, y: 1.5,
    teach: {
      for: 'Processors joined on a bigger board make a &6Crystal Processor Assembly&r, the circuit LuV buildings run on.',
      needs: 'Several crystal processors for each, so the crystal route is a line, not a trickle.',
      unlocks: 'LuV hulls, hatches and the machines you will want at the gate to ZPM.',
      automate: 'Keep processors flowing from the circuit assembler to a second assembler.',
    },
    desc: [],
    tasks: [it('gtceu:crystal_processor_assembly')],
    rewards: [xp(80)],
  },
  {
    key: 'NPU', kind: 'circuit', title: 'Neuro Processing Unit', icon: 'gtceu:neuro_processing_unit', pkg: ['B1', 'B5', 'B8', 'S03'],
    deps: ['ORGANOID'], x: 2, y: 3,
    teach: {
      for: 'A neural organoid grown in orbit, wired and packaged, becomes the &6Neuro Processing Unit&r.',
      needs: 'Organoids from the lab and LuV power for the assembler.',
      unlocks: 'The wetware processor. Nothing else makes an NPU before ZPM.',
      automate: 'Let ME feed the lab and keep a stock of units.',
    },
    desc: [],
    tasks: [it('gtceu:neuro_processing_unit')],
    rewards: [xp(100)],
  },
  {
    key: 'LIVING', kind: 'circuit', title: 'Living Circuits', icon: 'gtceu:wetware_processor', pkg: ['B1', 'B5', 'B8', 'S03'],
    deps: ['NPU', 'CCPU'], x: 4, y: 3,
    teach: {
      for: "GT--'s circuit assembly line puts NPUs and crystal CPUs together into &6Wetware Processors&r.",
      needs: 'A whole batch a run on a single LuV energy hatch, and organoids kept alive in between.',
      unlocks: 'ZPM goes through these like crisps, so the stock is the real bottleneck.',
      automate: 'Feed it from AE2 and let it keep a stock.',
    },
    desc: [],
    tasks: [it('gtnn:circuit_assembly_line'), it('gtceu:wetware_processor')],
    rewards: [xp(150)],
  },
  {
    key: 'WASM', kind: 'circuit', title: 'Wetware Assembly', icon: 'gtceu:wetware_processor_assembly', pkg: ['B1', 'B5', 'B8', 'S03'],
    deps: ['LIVING'], x: 6, y: 3,
    teach: {
      for: 'Wetware processors on a bigger board make the &6Wetware Processor Assembly&r.',
      needs: 'Several processors for each. The tissue has to stay fed the whole way.',
      unlocks: 'The ZPM machine hull, and the machines that lean on it.',
      automate: 'Keep it in a dedicated ME stock chest; ZPM draws it by the stack.',
    },
    desc: [],
    tasks: [it('gtceu:wetware_processor_assembly')],
    rewards: [xp(150)],
  },
  {
    key: 'DBANK', kind: 'machine', title: 'Data Bank', icon: 'gtceu:data_bank', pkg: ['B10'],
    deps: ['FIBQ'], x: 2, y: 4.5,
    teach: {
      for: 'The &6Data Bank&r stores every orb and stick of research in one hall.',
      needs: 'Computer casings, and the same computer racks the research station will want.',
      unlocks: 'Research, and the saved patterns that ZPM and later machines ask for.',
      automate: 'Let ME carry orbs in and out so you never swap them by hand.',
    },
    desc: [],
    tasks: [it('gtceu:data_bank')],
    rewards: [xp(100)],
  },
  {
    key: 'HPCA', kind: 'machine', title: 'Computation Array', icon: 'gtceu:high_performance_computation_array', pkg: ['B10'],
    deps: ['DBANK'], x: 4, y: 4.5,
    teach: {
      for: 'The &6High-Performance Computation Array&r is a stack of computation racks that the research station draws on.',
      needs: 'Heat sinks and active coolers, optical pipe from the microgravity smelter, and more racks the more you ask of it.',
      unlocks: 'Computation power for every orb the station writes.',
      automate: 'Power and coolant are the whole upkeep; keep them on the network.',
    },
    desc: [],
    tasks: [it('gtceu:high_performance_computation_array')],
    rewards: [xp(100)],
  },
  {
    key: 'RSTN', kind: 'machine', title: 'Research Station', icon: 'gtceu:research_station', pkg: ['B10'],
    deps: ['HPCA'], x: 6, y: 4.5,
    teach: {
      for: 'The &6Research Station&r reads a data stick or orb, runs the array on it and writes the research back.',
      needs: 'The array behind it, the data bank for storage, and a research item to read.',
      unlocks: 'The first ZPM research: the hatch that opens the next era.',
      automate: 'Feed orbs by ME and let the bank file them.',
    },
    desc: [],
    tasks: [it('gtceu:research_station')],
    rewards: [xp(120)],
  },
  {
    key: 'ORB', kind: 'process', title: 'First Data Orb', icon: 'gtceu:data_orb', pkg: ['B10'],
    deps: ['RSTN'], x: 8, y: 4.5,
    teach: {
      for: "The first orb worth writing is the ZPM energy hatch's research.",
      needs: 'The large mixer on two LuV hatches for the wiring, and the europium that went into the station\'s ZPM motors.',
      unlocks: 'The ZPM energy hatch, and so the gate to the next era.',
      automate: 'Copy orbs rather than rewriting them; the station keeps the original.',
    },
    desc: [],
    tasks: [it('gtceu:data_orb')],
    rewards: [xp(150), ri('gtceu:data_orb', 2)],
  },
  {
    key: 'QTSUIT', kind: 'process', title: 'QuarkTech Suit', icon: 'gtceu:quarktech_chestplate',
    deps: ['CASM'], x: 10, y: 3,
    teach: {
      for: 'The &6QuarkTech Suit&r holds 100M EU. A charged chestplate flies like creative: 2,500 EU/t while flying, nothing on the ground, about 33 minutes per charge.',
      needs: 'Assembler recipes. The chestplate takes LuV circuits, a lapotronic orb, IV emitters and a field generator.',
      unlocks: 'Flight on your own power. The advanced chestplate (ZPM circuit) adds the jetpack.',
      automate: 'Recharge in a charger or battery buffer.',
    },
    desc: [],
    tasks: [it('gtceu:quarktech_chestplate')],
    rewards: [xp(200)],
  },
];
