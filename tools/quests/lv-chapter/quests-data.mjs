// Quest data for lv_age; tools/quests/gen-chapters.mjs writes the chapter. Imported from the hand-written chapter by tools/quests/lib/import-snbt.mjs (RF-5L2): every id is spelled out.

export const CHAPTER = {
  id: "34A0FD45D2A63F82",
  order: 1,
  icon: "gtceu:lv_machine_hull",
  autofocus: "LV_LV_FACTORY",
  section: { name: 'LV: The First Spark', origin: { x: 0, y: 0 } },
  title: "LV: The First Spark",
  subtitle: ["Electricity at last: ore lines, a little chemistry, AE2, and the Moon on film."],
};

export const QUESTS = [
  {
    key: "LV_LV_FACTORY", id: "1AC672110DFD0C14", title: "LV Factory", icon: "gtceu:lv_machine_hull", shape: "rsquare", size: 1.5, deps: ["steam:STEAM_LV_STEAM_TURBINE"], x: 0, y: 0,
    desc: [
      "Steam turns into current. Machines want a cable now instead of a firebox, and the Nether stops being a quick raid: its veins end up in your drills.",
      "The Moon also gets its first proper photograph, taken with the chart you drew by hand.",
    ],
    tasks: [{ type: "checkmark", id: "63D4DB568C704834" }],
    rewards: [{ type: "xp", id: "4786320F4045B988", xp: 40 }],
  },
  {
    key: "LV_LV_ASSEMBLER", id: "6D668A4CB9B8384A", title: "LV Assembler", icon: "gtceu:lv_assembler", deps: ["LV_LV_COMPONENTS"], x: 4, y: 0,
    desc: [
      "The &6Assembler&r puts parts together into finished pieces, and here it builds a surprising amount: the blast furnace's coils, the heliostat mirrors, the creature models and AE2's network blocks. It rarely sits idle.",
    ],
    tasks: [{ type: "item", id: "35B04A0D13C90131", item: "gtceu:lv_assembler" }],
    rewards: [{ type: "xp", id: "1B81E3E9597DAE9B", xp: 30 }],
  },
  {
    key: "LV_CUPRONICKEL_COILS", id: "5C7A2E94B1D03F68", title: "Cupronickel Coils", icon: "gtceu:cupronickel_coil_block", deps: ["LV_LV_ASSEMBLER"], x: 6, y: 0,
    desc: [
      "They make the blast furnace's heating ring. The coil decides how hot the furnace gets, and the heat decides what it can make. Cupronickel is the first and coolest of them; you'll be back for better ones.",
    ],
    tasks: [{ type: "item", id: "4E0A9C2D6B3F1785", item: "gtceu:cupronickel_coil_block", count: 16 }],
    rewards: [{ type: "xp", id: "2B8E4D1A7C09F356", xp: 35 }],
  },
  {
    key: "LV_LV_COMPONENTS", id: "5795EAFBAB034E45", title: "LV Components", icon: "gtceu:lv_electric_motor", deps: ["LV_LV_FACTORY"], x: 2, y: 0,
    desc: [
      "Motor, piston, pump, conveyor and robot arm. Nearly every LV machine is some mix of the five. Keep a few of each in a chest and you'll walk to the crafting table a lot less.",
    ],
    tasks: [{ type: "item", id: "6191C496F3440A30", item: "gtceu:lv_electric_motor" }, { type: "item", id: "593F87E0E6962621", item: "gtceu:lv_electric_piston" }, { type: "item", id: "02B134D9B3C59D42", item: "gtceu:lv_electric_pump" }, { type: "item", id: "422B9B071F8AE818", item: "gtceu:lv_conveyor_module" }, { type: "item", id: "3922B6EA6ABAD1D2", item: "gtceu:lv_robot_arm" }],
    rewards: [{ type: "xp", id: "4B9A14388EC1DE1F", xp: 35 }],
  },
  {
    key: "LV_MACERATOR", id: "3822BE3A45F1C474", title: "Macerator", icon: "gtceu:lv_macerator", deps: ["LV_LV_COMPONENTS"], x: 4, y: -3,
    desc: [
      "The steam macerator's electric replacement. It still gives only the first output until HV, so the byproducts come from the washer and the centrifuges instead.",
      "Everything after it starts from crushed ore.",
    ],
    tasks: [{ type: "item", id: "55E3030426D27EC5", item: "gtceu:lv_macerator" }],
    rewards: [{ type: "xp", id: "398BF14CA6CAFA1E", xp: 30 }],
  },
  {
    key: "LV_ORE_WASHER", id: "766C58FC4FAC6D61", title: "Ore Washer", icon: "gtceu:lv_ore_washer", deps: ["LV_MACERATOR"], x: 6, y: -3,
    desc: [
      "The washer rinses crushed ore into purified ore and shakes loose some of the first byproduct. Distilled water does it faster than plain water.",
      "For some ores a sodium persulfate soak in the chemical bath gives a lot more; that is how bauxite gives up its gallium.",
    ],
    tasks: [{ type: "item", id: "68276F11F073D951", item: "gtceu:lv_ore_washer" }],
    rewards: [{ type: "xp", id: "3F8A3B9EF346D7A9", xp: 30 }],
  },
  {
    key: "LV_THERMAL_CENTRIFUGE", id: "18D60FF391B2F8DC", title: "Thermal Centrifuge", icon: "gtceu:lv_thermal_centrifuge", deps: ["LV_ORE_WASHER"], x: 8, y: -3,
    desc: [
      "Heat and spin turn washed ore into refined ore, and a second byproduct falls out on the way. The macerator then grinds it into clean dust. In MV the Ore Plant does all of this in one building.",
    ],
    tasks: [{ type: "item", id: "5E478CDE07E1C692", item: "gtceu:lv_thermal_centrifuge" }],
    rewards: [{ type: "xp", id: "7C387B8FD56D62F2", xp: 30 }],
  },
  {
    key: "LV_CENTRIFUGE", id: "5ECDAA1F9811AC0A", title: "Centrifuge", icon: "gtceu:lv_centrifuge", deps: ["LV_THERMAL_CENTRIFUGE"], x: 10, y: -3,
    desc: [
      "The last stop of the ore line, where dust gets spun apart into what it's made of. Air from the gas collector comes out as nitrogen and oxygen.",
      "It also splits realgar into arsenic and sulfur, so the next batch of rubber needs no trip to the Nether.",
    ],
    tasks: [{ type: "item", id: "71F985CEEB82AD09", item: "gtceu:lv_centrifuge" }],
    rewards: [{ type: "xp", id: "4E54241FEC649BA9", xp: 35 }],
  },
  {
    key: "LV_LV_VEIN_DRILL", id: "2235038DEB4D9870", title: "LV Vein Drill",     icon: "gtceu:lv_vein_drill", kind: "machine", deps: ["LV_LV_COMPONENTS"], x: 4, y: 1.5,
        teach: {
          for: "The electric vein drill: the same samples and bits as the steam one, quicker.",
          needs: "An LV hull, a vein sample, bits, drilling fluid and an energy hatch.",
          unlocks: "Faster ore from every vein, and every steam drill recipe.",
          automate: "Bits and fluid by bus and hatch, ore out by bus. A second energy hatch speeds it up.",
        },
        desc: [
          "It also has a fluid hatch, which matters more than it sounds.",
        ],
        tasks: [{ type: "item", id: "31B8E7F41955B3AC", item: "gtceu:lv_vein_drill" }],
        rewards: [{ type: "xp", id: "7D49D8C7E78B9686", xp: 60 }],
  },
  {
    key: "LV_DRILLING_FLUID", id: "3C4B301F348411BF", title: "Drilling Fluid", icon: "grindless:empty_vein_probe", deps: ["LV_LV_VEIN_DRILL"], x: 6, y: 1.5,
    desc: [
      "The drill's own stone dust, mixed with lubricant and water, comes back as drilling fluid. With it in the hatch the drill brings up more ore and wears its bits slower.",
      "The Nether veins won't drill without it, and the steam drill has nowhere to put it. The lubricant comes from the creosote your coke ovens have been hoarding.",
    ],
    tasks: [{ type: "checkmark", id: "1157F014AE90D968" }],
    rewards: [{ type: "xp", id: "25F806C232F0B708", xp: 30 }],
  },
  {
    key: "LV_NETHER_VEINS", id: "65FE680CCF2D67C5", title: "Nether Veins", icon: "grindless:vein_sample_certus_quartz", optional: true, deps: ["LV_DRILLING_FLUID"], x: 8, y: 1.5,
    desc: [
      "The Nether has veins of its own, certus quartz, beryllium and saltpeter among them. Bring back raw ore from the vein you want and make its sample at home.",
      "One trip per vein. After that the drill does the visiting.",
    ],
    tasks: [{ type: "checkmark", id: "4818390ABECA1D36" }],
    rewards: [{ type: "xp", id: "6D4BD4D9D3258F3A", xp: 25 }],
  },
  {
    key: "LV_LV_GREENHOUSE", id: "73CA53E9E02D4639", title: "LV Greenhouse",     icon: "gtceu:lv_greenhouse", kind: "machine", deps: ["LV_LV_COMPONENTS"], x: 4, y: 4.5,
        teach: {
          for: "An electric greenhouse with a water hatch, so it grows what the steam one cannot.",
          needs: "An LV hull, glass, water and a seed or sapling in the bus.",
          unlocks: "Mushrooms, berries, vines, kelp and flowers, plus everything the steam greenhouse grew.",
          automate: "Water by hatch, harvest by output bus.",
        },
        desc: [
          "It still runs the old recipes, only faster.",
        ],
        tasks: [{ type: "item", id: "517E334F5EDF0822", item: "gtceu:lv_greenhouse" }],
        rewards: [{ type: "xp", id: "3A8B6F69F89E37B8", xp: 60 }],
  },
  {
    key: "LV_FERTILIZER", id: "47283300070CD8C2", title: "Fertilizer", icon: "gtceu:fertilizer", deps: ["LV_LV_GREENHOUSE"], x: 6, y: 4.5,
    desc: [
      "Fertilizer and the right programmed circuit in the greenhouse's bus double the harvest and halve the time.",
      "The mixer makes it from dirt, wood dust and sand. The chemical reactor makes it from calcite or apatite with ash, which is where the ash from your furnaces ends up.",
    ],
    tasks: [{ type: "item", id: "68E554C92C5B3A0C", item: "gtceu:fertilizer", count: 8 }],
    rewards: [{ type: "xp", id: "446F9500700968E8", xp: 30 }],
  },
  {
    key: "LV_CREATURE_SIMULATOR", id: "15D34CE9F5FCE6B3", title: "Creature Simulator", icon: "gtceu:lv_creature_simulator", deps: ["LV_FERTILIZER"], x: 8, y: 7.5,
    desc: [
      "Mob drops without the mob. The &6Creature Simulator&r turns a model, some biomass and the creature's own mineral into drops.",
      "The programmed circuit picks the roll: circuit 1 gives the full set, the others a single kind of drop.",
    ],
    tasks: [{ type: "item", id: "0F89B4F048E5F983", item: "gtceu:lv_creature_simulator" }],
    rewards: [{ type: "xp", id: "391C99C4924378FE", xp: 40 }],
  },
  {
    key: "LV_FIRST_PEARL", id: "32CF7B11121B4DA9", title: "First Pearl", icon: "minecraft:ender_pearl", deps: ["LV_CREATURE_SIMULATOR"], x: 10, y: 7.5,
    desc: [
      "GregTech asks for ender pearls at LV and only lets you synthesize them much later, so here's one on the house.",
      "Spend it on the enderman model. The simulator makes every pearl after that.",
    ],
    tasks: [{ type: "checkmark", id: "2AF30FE5A1B67780" }],
    rewards: [{ type: "xp", id: "5E7E5F853EC1126C", xp: 40 }, { type: "item", id: "4D1381871CA636B6", item: "minecraft:ender_pearl" }],
  },
  {
    key: "LV_CREATURE_MODELS", id: "29B4717D718C6BB5", title: "Creature Models", icon: "grindless:blank_creature_model", deps: ["LV_FIRST_PEARL"], x: 12, y: 7.5,
    desc: [
      "Print models for whatever you're short on. A blank model plus some of the creature's own material makes one, and the simulator never uses it up.",
      "Any one of them counts here.",
    ],
    tasks: [{ type: "item", id: "6B39783669D5AE2E", item: "grindless:creature_model_skeleton", raw: { optional_task: "true" } }, { type: "item", id: "705082C0BE79BADE", item: "grindless:creature_model_spider", raw: { optional_task: "true" } }, { type: "item", id: "1E56DA4C00BE6A2F", item: "grindless:creature_model_slime", raw: { optional_task: "true" } }, { type: "item", id: "36F184755D8092CC", item: "grindless:creature_model_sheep", raw: { optional_task: "true" } }, { type: "item", id: "2961A704C29317BA", item: "grindless:creature_model_cow", raw: { optional_task: "true" } }, { type: "item", id: "19BD855ED20A96BD", item: "grindless:creature_model_chicken", raw: { optional_task: "true" } }, { type: "item", id: "785BE405026B5CDF", item: "grindless:creature_model_enderman", raw: { optional_task: "true" } }],
    rewards: [{ type: "xp", id: "782162B7F4EAE965", xp: 30 }],
  },
  {
    key: "LV_CREEPER_AND_BLAZE_MODELS", id: "47892302FAEA3244", title: "Creeper and Blaze Models", icon: "grindless:creature_model_creeper", optional: true, deps: ["LV_CREATURE_MODELS"], x: 14, y: 7.5,
    desc: [
      "Both models print at LV, but the creeper and the blaze only run in an MV simulator. Make them now and they'll be waiting.",
    ],
    tasks: [{ type: "item", id: "680D18F57C8DB75E", item: "grindless:creature_model_creeper" }, { type: "item", id: "3CDE7F33A821E1DF", item: "grindless:creature_model_blaze" }],
    rewards: [{ type: "xp", id: "4E622AC6A0F97D24", xp: 25 }],
  },
  {
    key: "LV_GAS_COLLECTOR", id: "09FAB2A84C90B5D6", title: "Gas Collector", icon: "gtceu:lv_gas_collector", deps: ["LV_LV_COMPONENTS"], x: 4, y: 3,
    desc: [
      "It breathes in air for the centrifuge to split into nitrogen and oxygen. Stock GregTech only lets it do that in the Overworld; here the Void and the Flatlands work too.",
    ],
    tasks: [{ type: "item", id: "237690F5149BA95F", item: "gtceu:lv_gas_collector" }],
    rewards: [{ type: "xp", id: "4C62188771A6494D", xp: 30 }],
  },
  {
    key: "LV_ELECTROLYZER", id: "50622961B58725B8", title: "Electrolyzer", icon: "gtceu:lv_electrolyzer", deps: ["LV_GAS_COLLECTOR"], x: 6, y: 3,
    desc: [
      "It pulls compounds apart with electricity and nothing else. Its big job right now is sapphire, which splits into aluminium and oxygen, and aluminium is your way into MV.",
    ],
    tasks: [{ type: "item", id: "18B27DABA1F1A8A8", item: "gtceu:lv_electrolyzer" }],
    rewards: [{ type: "xp", id: "1737F89DF7F3A701", xp: 30 }],
  },
  {
    key: "LV_CHEMICAL_REACTOR", id: "09155B5B0F1BE994", title: "Chemical Reactor", icon: "gtceu:lv_chemical_reactor", deps: ["LV_ELECTROLYZER"], x: 8, y: 3,
    desc: [
      "LV's small chemistry happens here: sulfuric acid, iron chloride, and the sodium bisulfate that the electrolyzer turns into persulfate. The chloride and the persulfate both etch circuit boards.",
      "The hydrogen they give off goes in a tank, not the sky. MV turns it into methanol.",
    ],
    tasks: [{ type: "item", id: "5B7E3A5E7F5D45F7", item: "gtceu:lv_chemical_reactor" }],
    rewards: [{ type: "xp", id: "73880280BC223A89", xp: 35 }],
  },
  {
    key: "LV_MIXER", id: "3C89167418EA462B", title: "Mixer", icon: "gtceu:lv_mixer", deps: ["LV_CHEMICAL_REACTOR"], x: 10, y: 3,
    desc: [
      "It mixes things, as advertised. Here that means drilling fluid, gallium arsenide, the roaster's catalyst and AE2's fluix crystal.",
    ],
    tasks: [{ type: "item", id: "4BE599CF418E61FB", item: "gtceu:lv_mixer" }],
    rewards: [{ type: "xp", id: "3FE8B3BDBC000C5D", xp: 30 }],
  },
  {
    key: "LV_CIRCUIT_ASSEMBLER", id: "220C6C2F1D568194", title: "Circuit Assembler",     icon: "gtceu:lv_circuit_assembler", kind: "machine", deps: ["LV_MV_CIRCUIT"], x: 16, y: 6,
        teach: {
          for: "It makes circuits in batches and takes the soldering off your hands.",
          needs: "An LV hull and MV circuits made by hand first.",
          unlocks: "Circuit lines that run without you.",
          automate: "Boards, parts and wire by bus, circuits out by bus.",
        },
        desc: [
          "Its own recipe asks for the circuits it will later make, a loop you break by hand once.",
        ],
    tasks: [{ type: "item", id: "5899D39CB5599808", item: "gtceu:lv_circuit_assembler" }],
    rewards: [{ type: "xp", id: "32A9BD5A41455BB9", xp: 35 }],
  },
  {
    key: "LV_GOOD_CIRCUIT_BOARD", id: "5F2D3E9A2F35D8E0", title: "Good Circuit Board",     icon: "gtceu:phenolic_printed_circuit_board", kind: "circuit", deps: ["LV_CHEMICAL_REACTOR"], x: 10, y: 6,
        teach: {
          for: "A better board than the resin one, for the good circuit.",
          needs: "Silver foil etched in sodium persulfate or iron chloride, both from your chemistry.",
          unlocks: "The good electronic circuit and the circuit assembler.",
          automate: "Etching baths on a fluid loop, boards out by bus.",
        },
        desc: [
          "Pick whichever etchant you have more of.",
        ],
    tasks: [{ type: "item", id: "45C73EBE75172899", item: "gtceu:phenolic_printed_circuit_board", count: 4 }],
    rewards: [{ type: "xp", id: "3CCE26DF092C48D3", xp: 30 }],
  },
  {
    key: "LV_DIODES", id: "0785A341666D046E", title: "Diodes", icon: "gtceu:diode", deps: ["LV_GOOD_CIRCUIT_BOARD"], x: 12, y: 6,
    desc: [
      "The mixer turns gallium and arsenic dust into gallium arsenide, and the assembler turns that into diodes. Arsenic comes out of realgar in the centrifuge, gallium out of bauxite in a persulfate bath.",
      "Diodes are the last piece the MV circuit is waiting on.",
    ],
    tasks: [{ type: "item", id: "10F2763E413CF2FB", item: "gtceu:diode", count: 4 }],
    rewards: [{ type: "xp", id: "47C80CB0BB026BC9", xp: 30 }],
  },
  {
    key: "LV_MV_CIRCUIT", id: "3879D8323DF4F8BB",     title: "Good Electronic Circuit", icon: "gtceu:good_electronic_circuit", kind: "circuit", deps: ["LV_DIODES"], x: 14, y: 6,
        teach: {
          for: "The first circuit above basic, and the key to the circuit assembler.",
          needs: "A phenolic board, diodes, and the usual wire and parts.",
          unlocks: "The circuit assembler and MV machines.",
          automate: "By hand first; the assembler takes over.",
        },
        desc: [
          "No MV power is needed to make it. Make a few.",
        ],
    tasks: [{ type: "item", id: "01134F436F85414C", item: "gtceu:good_electronic_circuit", count: 4 }],
    rewards: [{ type: "xp", id: "7A7D7E619B5877B2", xp: 45 }],
  },
  {
    key: "LV_FORMING_PRESS", id: "2C50918B882FA400", title: "Forming Press", icon: "gtceu:lv_forming_press", deps: ["LV_CIRCUIT_ASSEMBLER"], x: 18, y: 7.5,
    desc: [
      "The press stamps shaped parts out of plates. In this pack it also stamps AE2's processor presses out of steel plate, so you can skip the meteorite hunting.",
    ],
    tasks: [{ type: "item", id: "19930A5D35E31332", item: "gtceu:lv_forming_press" }],
    rewards: [{ type: "xp", id: "04A087AC4B66AAE9", xp: 30 }],
  },
  {
    key: "LV_GRAPHITE_ELECTRODE", id: "4767E74EF8428F44", title: "Graphite Electrode", icon: "grindless:graphite_electrode", deps: ["LV_FORMING_PRESS"], x: 20, y: 7.5,
    desc: [
      "Graphite dust from the diamond vein, pressed around a steel rod. The arc furnace burns through one now and then, the way the drill eats bits. Spares go in its bus.",
    ],
    tasks: [{ type: "item", id: "6322BDD620B9ABED", item: "grindless:graphite_electrode", count: 2 }],
    rewards: [{ type: "xp", id: "4BD45FED6F5C4863", xp: 30 }],
  },
  {
    key: "LV_SUBMERGED_ARC_FURNACE", id: "62D5FBAC11D478E9", title: "Submerged Arc Furnace",     icon: "gtceu:submerged_arc_furnace", kind: "machine", deps: ["LV_GRAPHITE_ELECTRODE"], x: 22, y: 7.5,
        teach: {
          for: "An arc under quartz sand and coke makes AE2's silicon at LV.",
          needs: "Two energy hatches and a graphite electrode.",
          unlocks: "Silicon for AE2, obsidian from cobblestone and water, and sky dust.",
          automate: "Sand and coke by bus, spare electrodes in the bus.",
        },
        desc: [
          "GregTech's own silicon waits for an MV blast furnace.",
        ],
    tasks: [{ type: "item", id: "697FE42849C59317", item: "gtceu:submerged_arc_furnace" }],
    rewards: [{ type: "xp", id: "74420A10ED35F67C", xp: 70 }],
  },
  {
    key: "LV_AE2_BRANCH", title: "The AE2 Branch", icon: "ae2:controller", kind: "milestone", id: "4B8D2F6A1C7E9035", deps: ["LV_SUBMERGED_ARC_FURNACE"], x: 22, y: 9,
    desc: [
      "Silicon is in hand, so the storage network is within reach. The row below walks it from crystal to terminal.",
    ],
    tasks: [{ type: "checkmark", id: "5A3C7E1D9B2F4086" }],
    rewards: [{ type: "xp", id: "6F2B8D4A1E7C3095", xp: 30 }],
  },
  {
    key: "LV_CERTUS_QUARTZ_CRYSTAL", id: "3D374AE4AF789B83", title: "Certus Quartz Crystal", icon: "ae2:certus_quartz_crystal", deps: ["LV_AE2_BRANCH"], x: 24, y: 9,
    desc: [
      "The autoclave grows certus dust into crystals in water, and distilled water does it faster and never fails. GregTech's machines hand out AE2's crystal here, so the ore line and the network share one pile.",
    ],
    tasks: [{ type: "item", id: "0E183815EF33551B", item: "ae2:certus_quartz_crystal", count: 4 }],
    rewards: [{ type: "xp", id: "5686983FDF28C1EF", xp: 30 }],
  },
  {
    key: "LV_INSCRIBER_AND_CHARGER", id: "28CA19174EBE8705", title: "Inscriber and Charger", icon: "ae2:inscriber", deps: ["LV_CERTUS_QUARTZ_CRYSTAL"], x: 26, y: 9,
    desc: [
      "AE2's own &6Inscriber&r and &6Charger&r, built in the assembler from GregTech parts instead of a handful of iron. Once they're down they work exactly like they do anywhere else.",
    ],
    tasks: [{ type: "item", id: "3204555D105E47B3", item: "ae2:inscriber" }, { type: "item", id: "696FD4F84D5675EE", item: "ae2:charger" }],
    rewards: [{ type: "xp", id: "3EDF966589041684", xp: 35 }],
  },
  {
    key: "LV_CHARGED_CERTUS_QUARTZ", id: "19778BA6D436527A", title: "Charged Certus Quartz", icon: "ae2:charged_certus_quartz_crystal", deps: ["LV_INSCRIBER_AND_CHARGER"], x: 28, y: 9,
    desc: [
      "The charger you just built and GregTech's polarizer both charge certus, and they make the same crystal. Use whichever one isn't busy.",
    ],
    tasks: [{ type: "item", id: "3B8D3FBB4B68718B", item: "ae2:charged_certus_quartz_crystal", count: 4 }],
    rewards: [{ type: "xp", id: "78479C7E6FA1CB30", xp: 30 }],
  },
  {
    key: "LV_FLUIX_CRYSTAL", id: "382D3153A231CEBF", title: "Fluix Crystal", icon: "ae2:fluix_crystal", deps: ["LV_CHARGED_CERTUS_QUARTZ"], x: 30, y: 9,
    desc: [
      "The mixer makes fluix from charged certus, redstone and quartzite dust. Quartzite stands in for Nether quartz here, and this one needs no trip at all.",
    ],
    tasks: [{ type: "item", id: "78F2A1568773608B", item: "ae2:fluix_crystal", count: 4 }],
    rewards: [{ type: "xp", id: "18C037E708F2E829", xp: 30 }],
  },
  {
    key: "LV_PROCESSOR_PRESSES", id: "7F321CF5445BE4CA", title: "Processor Presses", icon: "ae2:logic_processor_press", deps: ["LV_FLUIX_CRYSTAL"], x: 32, y: 9,
    desc: [
      "The forming press stamps the presses and the inscriber uses them the usual way. Any one counts here. Make whichever your next build needs.",
    ],
    tasks: [{ type: "item", id: "5EE27C7DFD78B0DD", item: "ae2:calculation_processor_press", raw: { optional_task: "true" } }, { type: "item", id: "3BA479A9CFF3AB74", item: "ae2:engineering_processor_press", raw: { optional_task: "true" } }, { type: "item", id: "119BE7CDA204D7E8", item: "ae2:logic_processor_press", raw: { optional_task: "true" } }, { type: "item", id: "539BC9848FEEAFB2", item: "ae2:silicon_press", raw: { optional_task: "true" } }],
    rewards: [{ type: "xp", id: "26CC9027970196F1", xp: 30 }],
  },
  {
    key: "LV_NETWORK_CORE", id: "0BB3182B7BA1B9AF", title: "Network Core", icon: "ae2:controller", deps: ["LV_PROCESSOR_PRESSES"], x: 34, y: 10.5,
    desc: [
      "A controller, a drive and an energy acceptor are all a network needs to wake up. Here they come out of the LV assembler, built on machine hulls like any GregTech machine.",
      "AE2 runs on FE, but GregTech cable plugged straight into the acceptor powers it. No converter needed.",
    ],
    tasks: [{ type: "item", id: "27B4F7D25E2FD772", item: "ae2:controller" }, { type: "item", id: "4F106CF2D52F0292", item: "ae2:drive" }, { type: "item", id: "37C8C2C66E3570A8", item: "ae2:energy_acceptor" }],
    rewards: [{ type: "xp", id: "4A7EA0B8AF33B190", xp: 35 }],
  },
  {
    key: "LV_ME_INTERFACES", id: "3B94B80BD64D83F2", title: "ME Interfaces", icon: "ae2:interface", deps: ["LV_NETWORK_CORE"], x: 36, y: 10.5,
    desc: [
      "With an interface, a pattern provider and a molecular assembler, the network starts crafting for you. They're LV hull builds too, around AE2's usual cores, and the annihilation core takes a quartzite gem where AE2 would ask for Nether quartz.",
    ],
    tasks: [{ type: "item", id: "7B4BD72F2BCA09DB", item: "ae2:interface" }, { type: "item", id: "2846ECC3B9C63CDB", item: "ae2:pattern_provider" }, { type: "item", id: "3C0A1068ABFB82C5", item: "ae2:molecular_assembler" }],
    rewards: [{ type: "xp", id: "3AEB32EA0C418EC9", xp: 35 }],
  },
  {
    key: "LV_ME_NETWORK_ACCESS", id: "09539172C5EF719B", title: "ME Network Access", icon: "ae2:terminal", deps: ["LV_ME_INTERFACES"], x: 38, y: 10.5,
    desc: [
      "A terminal to see everything and a crafting CPU to plan the jobs. From here on AE2 is plain AE2, and the Applied Energistics tab has the rest.",
    ],
    tasks: [{ type: "item", id: "3EAA84E5A758CEEF", item: "ae2:terminal" }, { type: "checkmark", id: "723AEB75C306D427" }],
    rewards: [{ type: "xp", id: "083A7ABE76B72B69", xp: 40 }],
  },
  {
    key: "LV_ALUMINIUM", id: "7853BCDA154074E2", title: "Aluminium", icon: "gtceu:aluminium_ingot", deps: ["LV_ELECTRIC_BLAST_FURNACE"], x: 10, y: 0,
    desc: [
      "At this stage aluminium comes from sapphire. Sample the deep sapphire vein, drill it, and the electrolyzer splits the dust into aluminium and oxygen.",
      "The aluminium dust becomes ingots in the blast furnace you just gave two hatches.",
    ],
    tasks: [{ type: "item", id: "2D3AF680D8226BBE", item: "grindless:vein_sample_sapphire" }, { type: "item", id: "6C26B2DBDC31CEE6", item: "gtceu:aluminium_ingot", count: 4 }],
    rewards: [{ type: "xp", id: "4126A6387A296E7D", xp: 40 }],
  },
  {
    key: "LV_MV_MACHINE_HULL", id: "0B26AF4B18A1BE7D", title: "MV Machine Hull", icon: "gtceu:mv_machine_hull", deps: ["LV_ALUMINIUM"], x: 12, y: 0,
    desc: [
      "Another hull, one tier up. Its casing is aluminium, hence the wait for the ingots.",
    ],
    tasks: [{ type: "item", id: "0A359FF1522011F7", item: "gtceu:mv_machine_hull", count: 2 }],
    rewards: [{ type: "xp", id: "67869852D11F151B", xp: 40 }],
  },
  {
    key: "LV_LV_TO_MV_TRANSFORMER", id: "39A5A5CC76591697", title: "LV to MV Transformer", icon: "gtceu:lv_transformer_1a", kind: "exit", deps: ["LV_MV_MACHINE_HULL"], x: 14, y: 0,
    desc: [
      "The &6Transformer&r steps LV up to MV, which is about all there is to say about transformers.",
      "MV is next, and MV goes somewhere new: the End, for ore the Overworld won't give you.",
    ],
    tasks: [{ type: "item", id: "4B097EF6A689ADD8", item: "gtceu:lv_transformer_1a" }],
    rewards: [{ type: "xp", id: "7F84F988D7C11D2C", xp: 45 }],
  },
  {
    key: "LV_ELECTRIC_BLAST_FURNACE", id: "78451687508D5888", title: "Electric Blast Furnace", icon: "gtceu:electric_blast_furnace", deps: ["LV_CUPRONICKEL_COILS"], x: 8, y: 0,
    desc: [
      "GregTech's big furnace, the one you'll keep coming back to for the rest of the game. Cupronickel coils get it hot enough for aluminium.",
      "The catch: aluminium is an MV recipe. Two LV energy hatches count as MV, so give it two.",
    ],
    tasks: [{ type: "item", id: "4CE9780299D08B3E", item: "gtceu:electric_blast_furnace" }],
    rewards: [{ type: "xp", id: "68887B95D69575F2", xp: 120 }],
  },
  {
    key: "LV_AMMONIA", id: "2E4A6C8B1D3F5170", title: "Ammonia", icon: "gtceu:ammonia_bucket", kind: "process", deps: ["LV_MACERATOR"], x: 4, y: -6,
    teach: {
      for: "The nitrogen side of the plate line: coal gas gives ammonia, and ammonia becomes nitric acid.",
      needs: "Coal gas from a coke oven, run through the distillery and the reactor.",
      unlocks: "Nitric oxide, then nitric acid.",
      automate: "Coal gas by pipe; ammonia piped to the oxidation reactor.",
    },
    desc: [
      "Photographic plates start further back than you'd think.",
    ],
    tasks: [{ type: "item", id: "3B5D7F1A9C2E4608", item: "gtceu:ammonia_bucket" }],
    rewards: [{ type: "xp", id: "4C6E8A1B3D5F7092", xp: 20 }],
  },
  {
    key: "LV_NITRIC_OXIDE", id: "5D7F1B3A9C2E4806", title: "Nitric Oxide", icon: "gtceu:nitric_oxide_bucket", kind: "process", deps: ["LV_AMMONIA"], x: 6, y: -6,
    teach: {
      for: "Ammonia burned over a catalyst gives nitric oxide.",
      needs: "Ammonia and oxygen from the gas collector, in a chemical reactor.",
      unlocks: "Nitrogen dioxide.",
      automate: "Ammonia and oxygen by pipe, gas out by pipe.",
    },
    desc: [
      "A gas, so a tank and a pipe.",
    ],
    tasks: [{ type: "item", id: "6E8A1C3B5D7F2094", item: "gtceu:nitric_oxide_bucket" }],
    rewards: [{ type: "xp", id: "7F1B3D5A9C2E4068", xp: 20 }],
  },
  {
    key: "LV_NITROGEN_DIOXIDE", id: "1A3C5E7B9D2F4086", title: "Nitrogen Dioxide", icon: "gtceu:nitrogen_dioxide_bucket", kind: "process", deps: ["LV_NITRIC_OXIDE"], x: 8, y: -6,
    teach: {
      for: "Nitric oxide takes up more oxygen and turns brown.",
      needs: "Nitric oxide and oxygen.",
      unlocks: "Nitric acid, when it meets water.",
      automate: "Pipe both gases in; the reactor does the rest.",
    },
    desc: [
      "Keep it contained, it's nasty.",
    ],
    tasks: [{ type: "item", id: "2B4D6F8A1C3E5097", item: "gtceu:nitrogen_dioxide_bucket" }],
    rewards: [{ type: "xp", id: "3C5E7A9B1D2F4068", xp: 20 }],
  },
  {
    key: "LV_NITRIC_ACID", id: "4D6F8B1A3C5E7092", title: "Nitric Acid", icon: "gtceu:nitric_acid_bucket", kind: "process", deps: ["LV_NITROGEN_DIOXIDE"], x: 10, y: -6,
    teach: {
      for: "The acid that dissolves silver, and later the metals of the platinum group.",
      needs: "Nitrogen dioxide and water.",
      unlocks: "Silver nitrate here, and aqua regia in MV.",
      automate: "Keep a tank of it on the pipe network; both lines draw from it.",
    },
    desc: [
      "Don't store it in anything that isn't made for acid.",
    ],
    tasks: [{ type: "item", id: "5E7A9C1B3D2F4086", item: "gtceu:nitric_acid_bucket" }],
    rewards: [{ type: "xp", id: "6F8B1D3A5C7E2094", xp: 25 }],
  },
  {
    key: "LV_SILVER_NITRATE", id: "7A9C1E3B5D4F2068", title: "Silver Nitrate", icon: "gtceu:silver_nitrate_dust", kind: "process", deps: ["LV_NITRIC_ACID"], x: 12, y: -6,
    teach: {
      for: "Silver in nitric acid becomes a salt that light can work on.",
      needs: "Nitric acid and silver, from the galena roaster.",
      unlocks: "Silver chloride.",
      automate: "Silver by bus, acid by pipe, crystals out by bus.",
    },
    desc: [
      "Plain silver dust no longer makes a plate.",
    ],
    tasks: [{ type: "item", id: "8B1D3F5A7C9E2046", item: "gtceu:silver_nitrate_dust" }],
    rewards: [{ type: "xp", id: "9C2E4A6B8D1F3057", xp: 25 }],
  },
  {
    key: "LV_SILVER_CHLORIDE", id: "6B8D1F3A5C7E4092", title: "Silver Chloride", icon: "gtceu:silver_chloride_dust", kind: "process", deps: ["LV_SILVER_NITRATE"], x: 14, y: -6,
    teach: {
      for: "Silver nitrate and chloride swap partners, and the silver chloride drops out as a powder.",
      needs: "Silver nitrate and a chloride, such as hydrochloric acid.",
      unlocks: "The emulsion.",
      automate: "Both by pipe and bus, powder out by bus.",
    },
    desc: [
      "This is the light-sensitive part of the plate.",
    ],
    tasks: [{ type: "item", id: "7C9E2A4B6D8F1035", item: "gtceu:silver_chloride_dust" }],
    rewards: [{ type: "xp", id: "3D5F7B9A1C2E4068", xp: 25 }],
  },
  {
    key: "LV_PHOTOGRAPHIC_EMULSION", id: "4E6A8C1B3D5F7092", title: "Photographic Emulsion", icon: "gtceu:photographic_emulsion_bucket", kind: "process", deps: ["LV_SILVER_CHLORIDE"], x: 16, y: -6,
    teach: {
      for: "Silver chloride held in glue, thin enough to coat glass.",
      needs: "Silver chloride and glue, in the mixer.",
      unlocks: "Photographic plates.",
      automate: "Glue by pipe, powder by bus, emulsion by pipe to the assembler.",
    },
    desc: [
      "Glue comes from the same animal and plant leftovers as before.",
    ],
    tasks: [{ type: "item", id: "5F7B9D1A3C2E4086", item: "gtceu:photographic_emulsion_bucket" }],
    rewards: [{ type: "xp", id: "6A8C1E3B5D7F2094", xp: 25 }],
  },
  {
    key: "LV_PHOTOGRAPHIC_PLATES", id: "365B9E86E3AA4894", title: "Photographic Plates", icon: "grindless:photographic_plate", kind: "process", deps: ["LV_PHOTOGRAPHIC_EMULSION"], x: 18, y: -6,
    teach: {
      for: "Glass coated with the emulsion: the film the Moon is recorded on.",
      needs: "Glass and the emulsion, in the assembler.",
      unlocks: "The optical observatory.",
      automate: "Glass by bus, emulsion by pipe, plates out by bus.",
    },
    desc: [
      "Silver dust alone is gone from this recipe.",
    ],
    tasks: [{ type: "item", id: "396D2C12CB2C436B", item: "grindless:photographic_plate" }],
    rewards: [{ type: "xp", id: "5422CC6BEE374C8F", xp: 30 }],
  },
  {
    key: "LV_OPTICAL_OBSERVATORY", id: "3D32B4FC8AEE49CE", title: "Optical Observatory",     icon: "gtceu:optical_observatory", kind: "machine", deps: ["LV_PHOTOGRAPHIC_PLATES","steam:STEAM_LUNAR_CHART_DRAFT"], x: 18, y: -4.5,
        teach: {
          for: "A refractor in a dome that tracks the Moon for long plate exposures.",
          needs: "Photographic plates and your steam-age draft chart, which it reads and hands back.",
          unlocks: "Lunar maps, and the ephemeris that later eras read.",
          automate: "Plates by bus; it still wants a clear night, at any height.",
        },
        desc: [
          "Build it anywhere you like.",
        ],
    tasks: [{ type: "item", id: "149106CCB19946CB", item: "gtceu:optical_observatory" }],
    rewards: [{ type: "xp", id: "72DE2BE97D294BA3", xp: 60 }],
  },
  {
    key: "LV_PHOTOGRAPHIC_LUNAR_MAP", id: "101BAA038F0ACAA6", title: "Photographic Lunar Map", icon: "grindless:lunar_map", deps: ["LV_OPTICAL_OBSERVATORY"], x: 20, y: -4.5,
    desc: [
      "The plates come back with crater chains, cracks and long shadows along the terminator, and for the first time you can tell flat ground from rough. The same run gives you the ephemeris too.",
    ],
    tasks: [{ type: "item", id: "341C3A1BD14B42D1", item: "grindless:lunar_map" }],
    rewards: [{ type: "xp", id: "763B0BB08C2440D6", xp: 40 }],
  },
  {
    key: "LV_LUNAR_EPHEMERIS", id: "1EEB24C2AB3EF4B0", title: "Lunar Ephemeris", icon: "grindless:lunar_ephemeris", deps: ["LV_PHOTOGRAPHIC_LUNAR_MAP"], x: 22, y: -4.5,
    desc: [
      "Tables of where the Moon will be on any night, worked out from the same plates as the map. The radio telescope in MV reads both and never uses them up.",
    ],
    tasks: [{ type: "item", id: "15CC3A50277F4F8F", item: "grindless:lunar_ephemeris" }],
    rewards: [{ type: "xp", id: "3F3B1C55D2A048F1", xp: 40 }],
  },
  {
    key: "LV_CONTACT_CATALYST", id: "30B1A00EBEC54B6D", title: "Contact Catalyst", icon: "grindless:contact_catalyst", deps: ["LV_MIXER"], x: 12, y: 3,
    desc: [
      "The sulfide roaster's catalyst, vanadium on diatomite, from the mixer. It wears out now and then, so keep a few in the roaster's bus.",
      "For the vanadium, smelt raw vanadium magnetite into dust and let the centrifuge split it.",
    ],
    tasks: [{ type: "item", id: "3FF1A8EC8D614951", item: "grindless:contact_catalyst", count: 4 }],
    rewards: [{ type: "xp", id: "124DE9A929364C39", xp: 30 }],
  },
  {
    key: "LV_SULFIDE_ROASTER", id: "5A176E45F8E64ED7", title: "Sulfide Roaster",     icon: "gtceu:sulfide_roaster", kind: "machine", deps: ["LV_CONTACT_CATALYST"], x: 14, y: 3,
        teach: {
          for: "It burns sulfide ores in air and turns the sulfur into sulfuric acid.",
          needs: "Sulfide ore, air and a contact catalyst.",
          unlocks: "Acid without a cloud, silver from galena, and steam from the waste heat.",
          automate: "Ore by bus, acid by pipe, heat back to your turbines.",
        },
        desc: [
          "The heat comes back as steam for your turbines.",
        ],
    tasks: [{ type: "item", id: "5B51E7ED80874170", item: "gtceu:sulfide_roaster" }],
    rewards: [{ type: "xp", id: "6A1E3C0D9B2F4E58", xp: 35 }],
  },
  {
    key: "LV_SODIUM_PERSULFATE", id: "8D1F3A5C7E9B2046", title: "Sodium Persulfate", icon: "gtceu:sodium_persulfate_bucket", kind: "process", deps: ["LV_SULFIDE_ROASTER"], x: 14, y: 4.5,
    teach: {
      for: "Sulfuric acid makes bisulfate, and electrolysis turns that into the etching bath for circuit boards.",
      needs: "Sulfuric acid, salt, a reactor and an electrolyzer.",
      unlocks: "Etched boards, and the gallium bath.",
      automate: "Acid and salt in by pipe and bus, bath out by pipe.",
    },
    desc: [
      "Boards are etched in it, with silver foil for the traces.",
    ],
    tasks: [{ type: "item", id: "9E2A4C6B8D1F3057", item: "gtceu:sodium_persulfate_bucket" }],
    rewards: [{ type: "xp", id: "1F3B5D7A9C2E4068", xp: 25 }],
  },
  {
    key: "LV_GALLIUM_ARSENIDE", id: "2A4C6E8B1D3F5097", title: "Gallium Arsenide", icon: "gtceu:gallium_arsenide_dust", kind: "process", deps: ["LV_MIXER"], x: 12, y: 4.5,
    teach: {
      for: "The semiconductor behind diodes, and the dopant every silicon boule needs.",
      needs: "Gallium recovered from the sulfide byproducts, and arsenic, in the mixer.",
      unlocks: "Diodes here, and boules in MV.",
      automate: "Both dusts by bus, crystal out by bus.",
    },
    desc: [
      "Make plenty; MV spends it faster than it looks.",
    ],
    tasks: [{ type: "item", id: "3B5D7F9A1C2E4086", item: "gtceu:gallium_arsenide_dust" }],
    rewards: [{ type: "xp",     id: "5D7F9B1A3C2E4086", xp: 25 }],
  },
  {
    key: "LV_SILVER_FROM_GALENA", id: "2B7D9F41C0E83A65", title: "Silver from Galena", icon: "gtceu:silver_nugget", deps: ["LV_SULFIDE_ROASTER"], x: 16, y: 3,
    desc: [
      "Roast galena and silver nuggets drop out with the lead oxide. The heliostat mirrors and the photographic plates both want silver.",
    ],
    tasks: [{ type: "item", id: "3E1C4A7D35B20F96", item: "gtceu:silver_nugget", count: 6 }],
    rewards: [{ type: "xp", id: "34D2F60B19C7E853", xp: 35 }],
  },
  {
    key: "LV_STEAM_FOR_THE_NIGHT", id: "1D9C4B27E05F8A36", title: "Steam for the Night", icon: "gtceu:steel_multiblock_tank", deps: ["LV_HELIOSTAT_TOWER"], x: 10, y: -1.5,
    desc: [
      "A steel multiblock tank soaks up the tower's daytime steam so the turbines keep turning after dark. A long night with a lot of turbines needs more than one.",
    ],
    tasks: [{ type: "item", id: "4C2E8B51A7D03F9E", item: "gtceu:steel_multiblock_tank" }],
    rewards: [{ type: "xp", id: "5E0A7C93D2B14F68", xp: 35 }],
  },
  {
    key: "LV_MIRROR_FIELD", id: "2F6B1D9A8C4E0527", title: "Mirror Field", icon: "grindless:heliostat_mirror", deps: ["LV_LV_ASSEMBLER"], x: 6, y: -1.5,
    desc: [
      "The heliostat tower needs a whole field of these behind it, each angled to throw sunlight at the top. They're silvered glass. Get the silver going before you start on them.",
    ],
    tasks: [{ type: "item", id: "6A3D0E7B9F21C84D", item: "grindless:heliostat_mirror", count: 28 }],
    rewards: [{ type: "xp", id: "7B1F4C8E2D05A930", xp: 40 }],
  },
  {
    key: "LV_HELIOSTAT_TOWER", id: "3A7E2C5F1B9D4061", title: "Heliostat Tower",     icon: "gtceu:heliostat_tower", kind: "plant", deps: ["LV_MIRROR_FIELD"], x: 8, y: -1.5,
        teach: {
          for: "It turns sunlight into steam with no fuel anywhere.",
          needs: "A mirror field, steel casings and an open, dry sky by day.",
          unlocks: "Free steam for turbines and the generator array.",
          automate: "Steam by pipe into a tank, then to the turbines.",
        },
        desc: [
          "At night it does nothing at all, which is what the tank is for.",
        ],
    tasks: [{ type: "item", id: "3C0F4A2E6B17D35C", item: "gtceu:heliostat_tower" }],
    rewards: [{ type: "xp", id: "5D5B1E3A7C42F086", xp: 60 }],
  },
  {
    key: "LV_SIXTEEN_TURBINES_ONE_HALL", id: "1CE11DDA27E5B778", title: "Sixteen Turbines, One Hall",     icon: "gtceu:generator_array", kind: "plant", deps: ["LV_LV_FACTORY"], x: 2, y: -1.5,
        teach: {
          for: "Up to sixteen LV generators behind one controller.",
          needs: "A steel hall, generators, and dynamo hatches that set how many run.",
          unlocks: "Compact power from steam turbines, combustion or gas turbines.",
          automate: "One fuel input, one power output, all by pipe and cable.",
        },
        desc: [
          "Same fuel, same energy per bucket; you only save floor space and cable spaghetti.",
        ],
    tasks: [{ type: "item", id: "4D711CBAE950FEAA", item: "gtceu:generator_array" }],
    rewards: [{ type: "xp", id: "18760F8546AE3848", xp: 40 }],
  },
  {
    key: "LV_WIRE_WORKS", id: "70655BD4956EB088", title: "Wire Works",     icon: "gtceu:wire_works", kind: "machine", deps: ["LV_LV_FACTORY"], x: 0, y: 2,
        teach: {
          for: "A wiremill and a bender in one box, so wire and plate come off one line.",
          needs: "An LV hull, steel and motors.",
          unlocks: "Several wire and plate recipes side by side, as many as your hatch voltage feeds.",
          automate: "Ingots in by bus, wire and plate out by bus.",
        },
        desc: [
          "One box doing the job of two, which is the whole idea.",
        ],
        tasks: [{ type: "item", id: "791A459098A43495", item: "gtceu:wire_works" }],
        rewards: [{ type: "xp", id: "3C4547840227F1B1", xp: 40 }],
  },
];
