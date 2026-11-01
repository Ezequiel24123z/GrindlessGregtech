// Quest data for mv_age; tools/quests/gen-chapters.mjs writes the chapter. Imported from the hand-written chapter by tools/quests/lib/import-snbt.mjs (RF-5L2): every id is spelled out.

export const CHAPTER = {
  id: "358BED21B6D9DE8C",
  group: "3F021F40CD26BF57",
  order: 2,
  icon: "gtceu:mv_machine_hull",
  autofocus: "MV_MV_FACTORY",
  title: "MV: The Far End",
  subtitle: ["The End for ore, silicon and plastics at home, and a landing site picked by radar."],
};

export const QUESTS = [
  {
    key: "MV_MV_FACTORY", id: "055851443092A93B", title: "MV Factory", icon: "gtceu:mv_machine_hull", shape: "rsquare", size: 1.5, deps: ["lv:LV_LV_TO_MV_TRANSFORMER"], x: 0, y: 0,
    desc: [
      "MV is where the factory stops fitting in one room and the lines start feeding each other. The gas off the silicon furnace ends up as methanol, for one.",
      "It also takes you past the Nether, to the End, for veins worth the trip.",
    ],
    tasks: [{ type: "checkmark", id: "29FAB6C83D5E24E2" }],
    rewards: [{ type: "xp", id: "04FC4C525A119501", xp: 40 }],
  },
  {
    key: "MV_CHROMIUM_AND_ALUMINIUM", id: "3EB82BACA3DFF6DB", title: "Chromium and Aluminium", icon: "gtceu:chromium_ingot", deps: ["MV_MV_COMPONENTS"], x: 4, y: 0,
    desc: [
      "Ruby from the deep redstone vein splits into chromium and aluminium in the electrolyzer. Now that you have MV power, bauxite gives you aluminium too.",
    ],
    tasks: [{ type: "item", id: "0D9122DA72BB797F", item: "gtceu:chromium_ingot", count: 4 }, { type: "item", id: "47222F0CFA9330D0", item: "gtceu:aluminium_ingot", count: 4 }],
    rewards: [{ type: "xp", id: "2CADAAFB5EDA183C", xp: 30 }],
  },
  {
    key: "MV_KANTHAL", id: "5DC39DF3C1563B6B", title: "Kanthal", icon: "gtceu:kanthal_coil_block", deps: ["MV_CHROMIUM_AND_ALUMINIUM"], x: 6, y: 0,
    desc: [
      "Iron, aluminium and chromium, mixed and then melted in the blast furnace, which now wants two MV energy hatches. The hot ingot cools in a chemical bath.",
      "Wound into coils, it goes back into the furnace that made it, and now that furnace is hot enough for silicon.",
    ],
    tasks: [{ type: "item", id: "0928209E9F6A03E3", item: "gtceu:kanthal_coil_block", count: 4 }],
    rewards: [{ type: "xp", id: "5C6DDC6FFEF5B6E3", xp: 35 }],
  },
  {
    key: "MV_VANADIUM_STEEL", id: "74057E6BDC378944", title: "Vanadium Steel", icon: "gtceu:vanadium_steel_ingot", deps: ["MV_CHROMIUM_AND_ALUMINIUM"], x: 8, y: -1.5,
    desc: [
      "Mostly steel, with a little vanadium and chromium. The cutter's saw blade is made of it, and so is the drill bit that can reach the End veins.",
    ],
    tasks: [{ type: "item", id: "0EEAC3D611425D40", item: "gtceu:vanadium_steel_ingot", count: 4 }],
    rewards: [{ type: "xp", id: "41D73766281A9B27", xp: 30 }],
  },
  {
    key: "MV_STAINLESS_STEEL", id: "24DEACCFA4DCD216", title: "Stainless Steel", icon: "gtceu:stainless_steel_ingot", deps: ["MV_KANTHAL"], x: 8, y: 1.5,
    desc: [
      "Iron with chromium, manganese and nickel, through the blast furnace on its two MV hatches. The HV hull and the HV motor are made of it, and the cleanroom needs both.",
    ],
    tasks: [{ type: "item", id: "743FC2F716A5B238", item: "gtceu:stainless_steel_ingot", count: 4 }],
    rewards: [{ type: "xp", id: "40C419EDB155285F", xp: 30 }],
  },
  {
    key: "MV_MV_COMPONENTS", id: "51BBBA6F37785CD7", title: "MV Components", icon: "gtceu:mv_electric_motor", deps: ["MV_MV_FACTORY"], x: 2, y: 0,
    desc: [
      "The same five parts, one size up, with aluminium and cupronickel where iron and copper used to be. The rest of MV is built from them.",
    ],
    tasks: [{ type: "item", id: "6E165FEAE1147BC8", item: "gtceu:mv_electric_motor" }, { type: "item", id: "11C48258FDAD4CC6", item: "gtceu:mv_electric_piston" }, { type: "item", id: "7072F2D65FCD8EBA", item: "gtceu:mv_electric_pump" }, { type: "item", id: "73417A9AFF066795", item: "gtceu:mv_robot_arm" }, { type: "item", id: "67DAEC4CC0556D49", item: "gtceu:mv_conveyor_module" }],
    rewards: [{ type: "xp", id: "790DC64279681079", xp: 35 }],
  },
  {
    key: "MV_MV_CUTTER_AND_LASER", id: "6213116B3B6723B8", title: "MV Cutter and Laser Engraver", icon: "gtceu:mv_laser_engraver", deps: ["MV_VANADIUM_STEEL"], x: 10, y: -1.5,
    desc: [
      "The silicon line needs both. The &6Cutter&r runs on a vanadium steel saw blade, and the &6Laser Engraver&r's emitter needs a flawless emerald.",
      "The Nether's beryllium vein has the emeralds, and the sifter finds the flawless ones.",
    ],
    tasks: [{ type: "item", id: "3B923A18591A522B", item: "gtceu:mv_cutter" }, { type: "item", id: "3DD4F723E828CFB2", item: "gtceu:mv_laser_engraver" }],
    rewards: [{ type: "xp", id: "1905C6F89AEBEF24", xp: 35 }],
  },
  {
    key: "MV_ORE_PLANT", id: "3FCAFC1E38DD934C", title: "Ore Plant", icon: "gtceu:ore_plant", shape: "gear", size: 1.75, deps: ["MV_MV_COMPONENTS"], x: 2, y: -3,
    desc: [
      "The LV ore line, all of it, in one building: crush, wash, bake and crush again, with every byproduct delivered. It's built from the MV versions of the machines it replaces.",
      "Same ore and the same energy per ore as the loose machines, about ten fewer machines and no buses in between. A second energy hatch doubles the ores in flight.",
    ],
    tasks: [{ type: "item", id: "637CD62AA2052170", item: "gtceu:ore_plant" }],
    rewards: [{ type: "xp", id: "1B8BF1FB66892FB3", xp: 80 }, { type: "item", id: "44804D8CAFF739EE", item: "minecraft:torch", count: 16 }],
  },
  {
    key: "MV_MV_VEIN_DRILL", id: "430CFDDFCF9174C1", title: "MV Vein Drill", icon: "gtceu:mv_vein_drill", shape: "gear", size: 1.5, deps: ["MV_MV_COMPONENTS"], x: 6, y: -1.5,
    desc: [
      "Same samples as the LV drill, and many more bores: one MV hatch keeps it busier than two LV hatches ever kept the last one.",
      "Put a vanadium steel bit in the bus and drilling fluid in the tank, and it reaches the End veins too.",
    ],
    tasks: [{ type: "item", id: "4672CBD07B794FDE", item: "gtceu:mv_vein_drill" }],
    rewards: [{ type: "xp", id: "0C4CC380A108D82B", xp: 60 }, { type: "item", id: "7F949ADB2FDB784E", item: "minecraft:torch", count: 16 }],
  },
  {
    key: "MV_VANADIUM_STEEL_DRILL_BIT", id: "30D3D68203F455F9", title: "Vanadium Steel Drill Bit", icon: "grindless:vanadium_steel_drill_bit", deps: ["MV_MV_VEIN_DRILL","MV_VANADIUM_STEEL"], x: 10, y: -3,
    desc: [
      "Wears down far slower than steel, and drilling fluid slows the wear again. It's the first bit that can bite into the End veins.",
    ],
    tasks: [{ type: "item", id: "4F9706A386EF5506", item: "grindless:vanadium_steel_drill_bit", count: 4 }],
    rewards: [{ type: "xp", id: "269EC3BA9860D58B", xp: 25 }],
  },
  {
    key: "MV_STONE_DUST_SEPARATION", id: "793F6428373310F1", title: "Stone Dust Separation", icon: "gtceu:mv_centrifuge", deps: ["MV_ORE_PLANT"], x: 4, y: -4.5,
    desc: [
      "At MV the centrifuge can finally do something with all that stone dust: quartzite, marble and a handful of other useful dusts come out of it.",
      "The mixed metal residue left over isn't worth sorting yet. Drawer it; EV will ask.",
    ],
    tasks: [{ type: "checkmark", id: "511754291104BED2" }],
    rewards: [{ type: "xp", id: "2F874B0D92C4AD22", xp: 25 }],
  },
  {
    key: "MV_SILICON_INGOT", id: "7C7BAECAD00C19E7", title: "Silicon Ingot", icon: "gtceu:silicon_ingot", deps: ["MV_KANTHAL"], x: 8, y: 0,
    desc: [
      "This is GregTech's own silicon. Silicon dioxide and carbon go into a blast furnace that only gets hot enough with Kanthal coils, and the ingot comes out hot and needs a dip in the chemical bath.",
      "Keep the carbon monoxide it gives off. It's poisonous and goes in a tank, and the methanol line takes it later.",
    ],
    tasks: [{ type: "item", id: "24A64FE0CBFB7BBC", item: "gtceu:silicon_ingot", count: 4 }],
    rewards: [{ type: "xp", id: "141E1BFA68E4415F", xp: 30 }],
  },
  {
    key: "MV_SILICON_BOULE", id: "12A688D7F923740B", title: "Silicon Boule", icon: "gtceu:silicon_boule", deps: ["MV_SILICON_INGOT"], x: 10, y: 0,
    desc: [
      "Back into the furnace with silicon dust and a pinch of gallium arsenide, and out comes a &6Silicon Boule&r, one big single crystal. All your chips for a long while start as slices of one of these.",
    ],
    tasks: [{ type: "item", id: "314055A0A7D0B4DA", item: "gtceu:silicon_boule" }],
    rewards: [{ type: "xp", id: "723753988B299A39", xp: 35 }],
  },
  {
    key: "MV_SILICON_WAFERS", id: "086C8CD2541ED490", title: "Silicon Wafers", icon: "gtceu:silicon_wafer", deps: ["MV_SILICON_BOULE","MV_MV_CUTTER_AND_LASER"], x: 12, y: 0,
    desc: [
      "The cutter slices a boule into a stack of wafers. Handle them gently; there's a long road between a wafer and a working chip.",
    ],
    tasks: [{ type: "item", id: "196CF5113D833357", item: "gtceu:silicon_wafer", count: 8 }],
    rewards: [{ type: "xp", id: "0B53DE86A2D8D40B", xp: 30 }],
  },
  {
    key: "MV_ILC_AND_RAM", id: "4A6B8F971E17C847", title: "ILC and RAM", icon: "gtceu:ilc_chip", deps: ["MV_SILICON_WAFERS"], x: 14, y: 0,
    desc: [
      "The laser engraver prints a circuit pattern onto the wafer, and the lens colour decides which one: red for ILC, green for RAM. The cutter then dices the printed wafer into chips.",
      "Both go into every integrated circuit until HV.",
    ],
    tasks: [{ type: "item", id: "2CA6F3BD5D88EE26", item: "gtceu:ilc_chip", count: 4 }, { type: "item", id: "25078E469CB4E802", item: "gtceu:ram_chip", count: 4 }],
    rewards: [{ type: "xp", id: "22837AE7060D658D", xp: 35 }],
  },
  {
    key: "MV_MV_GREENHOUSE", id: "3AE74DC5E01AD916", title: "MV Greenhouse", icon: "gtceu:mv_greenhouse", shape: "gear", size: 1.5, deps: ["MV_MV_COMPONENTS"], x: 4, y: 3,
    desc: [
      "Many more crops at once than the LV one, and it takes carbon dioxide on top of the fertilizer: the harvest grows by half, with oxygen back for the blast furnace.",
      "The logs go to pyrolysis and the crops to the brewery.",
    ],
    tasks: [{ type: "item", id: "59AE03D63045757C", item: "gtceu:mv_greenhouse" }],
    rewards: [{ type: "xp", id: "4251E295C87B7454", xp: 60 }, { type: "item", id: "3F99F7EF4A1613B8", item: "minecraft:wheat_seeds", count: 4 }],
  },
  {
    key: "MV_PYROLYSIS", id: "7168260562812CF8", title: "Pyrolysis", icon: "gtceu:pyrolyse_oven", deps: ["MV_MV_GREENHOUSE"], x: 4, y: 6,
    desc: [
      "The &6Pyrolyse Oven&r cooks logs into charcoal and a whole chemistry set of liquids and gases, and the circuit decides which. Nitrogen in the hatch makes it run twice as fast.",
    ],
    tasks: [{ type: "item", id: "7A6F1688CFA14C4C", item: "gtceu:pyrolyse_oven" }],
    rewards: [{ type: "xp", id: "716F10BFB3CF8C10", xp: 35 }],
  },
  {
    key: "MV_METHANOL", id: "48331D61E0C6B691", title: "Methanol", icon: "gtceu:mv_chemical_reactor", deps: ["MV_PYROLYSIS"], x: 8, y: 7.5,
    desc: [
      "Remember the carbon monoxide from the silicon furnace and the hydrogen you tanked in LV? The chemical reactor turns them into methanol. Carbon dioxide works too, with more hydrogen.",
      "Methanol goes into biodiesel, or straight into a generator.",
    ],
    tasks: [{ type: "checkmark", id: "3858A9F06BB3A0EE" }],
    rewards: [{ type: "xp", id: "7432D0E71BD682FE", xp: 30 }],
  },
  {
    key: "MV_BIOREFINERY", id: "62C555A8293900FA", title: "Biorefinery", icon: "gtceu:biorefinery", shape: "gear", size: 1.5, deps: ["MV_METHANOL"], x: 12, y: 6,
    desc: [
      "A distillery gets one fraction out per run and the rest never comes out. The &6Biorefinery&r is a column that keeps them all, one hatch per layer.",
      "It only takes organic feedstock, wood and biomass and the like. Crude oil waits for the distillation tower.",
    ],
    tasks: [{ type: "item", id: "6D666454092B45EE", item: "gtceu:biorefinery" }],
    rewards: [{ type: "xp", id: "36C63C01BD92A0F6", xp: 40 }],
  },
  {
    key: "MV_MV_FLUID_DRILLING_RIG", id: "1A38798F23E8EA97", title: "MV Fluid Drilling Rig", icon: "gtceu:mv_fluid_drilling_rig", shape: "gear", size: 1.5, deps: ["MV_MV_COMPONENTS"], x: 6, y: 1.5,
    desc: [
      "GregTech's rig pumps oil, gas or salt water from the fluid vein under it. Veins never run dry in this pack, and the Flatlands and the Void have oil and gas too, so pick a spot once and leave it there.",
    ],
    tasks: [{ type: "item", id: "0721BC67872504EC", item: "gtceu:mv_fluid_drilling_rig" }],
    rewards: [{ type: "xp", id: "58FE1CD5AD9C17E5", xp: 50 }],
  },
  {
    key: "MV_DIESEL", id: "44031073B1E3A181", title: "Diesel", icon: "gtceu:mv_distillery", deps: ["MV_MV_FLUID_DRILLING_RIG"], x: 6, y: 3,
    desc: [
      "Crude goes through the distillery a fraction at a time, hydrogen strips the sulfur out, and the mixer blends what's left into diesel.",
      "No oil under the base? Seed oil and methanol make biodiesel, which burns in the same generators.",
    ],
    tasks: [{ type: "checkmark", id: "7A175AB84B6DABE5" }],
    rewards: [{ type: "xp", id: "7509CCC2EB6D0716", xp: 30 }],
  },
  {
    key: "MV_BRINE_AND_CHLORINE", id: "498077C9A58D9578", title: "Brine and Chlorine", icon: "gtceu:lv_electrolyzer", deps: ["MV_MV_FLUID_DRILLING_RIG"], x: 10, y: 3,
    desc: [
      "Salt water comes from the rig if your base sits over an ocean; anywhere else, salt and water in the mixer do the job. The electrolyzer splits it into sodium hydroxide, chlorine and hydrogen.",
      "The chlorine goes into PVC and the hydrogen into methanol.",
    ],
    tasks: [{ type: "checkmark", id: "2061C5FD9F9B9C7B" }],
    rewards: [{ type: "xp", id: "609D15E06779863F", xp: 30 }],
  },
  {
    key: "MV_ETHYLENE_AND_PE", id: "0D69D5BBC371A5B7", title: "Ethylene and PE", icon: "gtceu:lv_chemical_reactor", deps: ["MV_BIOREFINERY"], x: 14, y: 3,
    desc: [
      "Ethanol and sulfuric acid give ethylene, and ethylene with air or oxygen gives polyethylene, your first plastic. Transistors and the HV hull are both waiting on it.",
    ],
    tasks: [{ type: "checkmark", id: "2DADD3DCAD01B312" }],
    rewards: [{ type: "xp", id: "5946CE65167C48A5", xp: 30 }],
  },
  {
    key: "MV_PVC", id: "0F6966AED46B5795", title: "PVC", icon: "gtceu:mv_mixer", deps: ["MV_ETHYLENE_AND_PE","MV_BRINE_AND_CHLORINE"], x: 14, y: 4.5,
    desc: [
      "Chlorine and ethylene make vinyl chloride, and that polymerizes into PVC. The hazmat suit is mostly PVC.",
    ],
    tasks: [{ type: "checkmark", id: "3C0D1AB8A4AB4406" }],
    rewards: [{ type: "xp", id: "5DE2D5B9164A186F", xp: 30 }],
  },
  {
    key: "MV_TRANSISTORS_AND_RESISTORS", id: "6A521D8B1437F9E4", title: "Transistors and Resistors", icon: "gtceu:transistor", deps: ["MV_ETHYLENE_AND_PE"], x: 14, y: 1.5,
    desc: [
      "The small parts the integrated circuits eat by the handful. Transistors need silicon and polyethylene, and the plastic only just arrived. The assembler now makes resistors in batches, too.",
    ],
    tasks: [{ type: "item", id: "4DA707ABAEF025A9", item: "gtceu:transistor", count: 4 }, { type: "item", id: "1C024E6FA2BEAE4A", item: "gtceu:resistor", count: 4 }],
    rewards: [{ type: "xp", id: "24107FFF763CEE90", xp: 30 }],
  },
  {
    key: "MV_INTEGRATED_CIRCUITS", id: "1617CBC90D126D2F", title: "Integrated Circuits", icon: "gtceu:good_integrated_circuit", deps: ["MV_ILC_AND_RAM","MV_TRANSISTORS_AND_RESISTORS"], x: 16, y: 0,
    desc: [
      "The first circuits with a real chip inside. The basic one counts as an LV circuit and the good one as MV, and the circuit assembler makes both.",
    ],
    tasks: [{ type: "item", id: "647511CD759A7CB8", item: "gtceu:basic_integrated_circuit", count: 4 }, { type: "item", id: "7EE54ED2F26F26DA", item: "gtceu:good_integrated_circuit", count: 4 }],
    rewards: [{ type: "xp", id: "6E0340634B4E4921", xp: 40 }],
  },
  {
    key: "MV_ADVANCED_INTEGRATED_CIRCUIT", id: "49BA4B42FA5DD586", title: "Advanced Integrated Circuit", icon: "gtceu:advanced_integrated_circuit", deps: ["MV_INTEGRATED_CIRCUITS","MV_TRANSISTORS_AND_RESISTORS"], x: 18, y: 0,
    desc: [
      "The HV circuit, made on MV power. It wants a bit of everything the chip line makes, and the cleanroom won't build without it.",
    ],
    tasks: [{ type: "item", id: "23078925A3CD9598", item: "gtceu:advanced_integrated_circuit", count: 8 }],
    rewards: [{ type: "xp", id: "60E0CBE6799FF623", xp: 50 }],
  },
  {
    key: "MV_HAZMAT_SUIT", id: "7B6466252E0C044A", title: "Hazmat Suit", icon: "gtceu:hazmat_chestpiece", deps: ["MV_PVC"], x: 14, y: 6,
    desc: [
      "GregTech's hazards are on in this pack, and some of what you handle from here on will hurt you. The &6Hazmat Suit&r keeps it off you, with PVC on the outside and an activated carbon filter in the mask.",
      "The carbon comes from pyrolysis with nitrogen in the hatch.",
    ],
    tasks: [{ type: "item", id: "22D15E2F083EBEF9", item: "gtceu:hazmat_headpiece" }, { type: "item", id: "0F7CA8A312A8C1EB", item: "gtceu:hazmat_chestpiece" }, { type: "item", id: "1877B04F88A3D4C5", item: "gtceu:hazmat_leggings" }, { type: "item", id: "0423480BB10991E0", item: "gtceu:hazmat_boots" }],
    rewards: [{ type: "xp", id: "66D264C84F214235", xp: 45 }],
  },
  {
    key: "MV_HV_MACHINE_HULL", id: "01AAEC5F1DC1C5EE", title: "HV Machine Hull", icon: "gtceu:hv_machine_hull", deps: ["MV_ETHYLENE_AND_PE"], x: 18, y: 1.5,
    desc: [
      "Hull number three, in stainless steel with polyethylene trim. Both the furnace and the plastic line have to be running for this one.",
    ],
    tasks: [{ type: "item", id: "4CFF1C375225DF80", item: "gtceu:hv_machine_hull", count: 2 }],
    rewards: [{ type: "xp", id: "57FE7D4629271854", xp: 40 }],
  },
  {
    key: "MV_HV_MOTOR_AND_PUMP", id: "21B999C2D0EF51A9", title: "HV Motor and Pump", icon: "gtceu:hv_electric_motor", deps: ["MV_HV_MACHINE_HULL"], x: 20, y: 1.5,
    desc: [
      "The first two HV parts, made ahead of the rest. The cleanroom runs its fans on these motors.",
    ],
    tasks: [{ type: "item", id: "242873E27919655F", item: "gtceu:hv_electric_motor" }, { type: "item", id: "7E359107E29AC257", item: "gtceu:hv_electric_pump" }],
    rewards: [{ type: "xp", id: "1C8DB2E0CEAB0D08", xp: 40 }],
  },
  {
    key: "MV_AE2_GROWS_UP", id: "63CD92CD1D3FC989", title: "AE2 Grows Up", icon: "ae2:controller", optional: true, deps: ["MV_INTEGRATED_CIRCUITS"], x: 18, y: -1.5,
    desc: [
      "Applied Flux, which stores FE in the network, and the wireless pattern terminals both need MV circuits in this pack. Build whichever you'll actually use.",
    ],
    tasks: [{ type: "checkmark", id: "3B48C0F2BEC84CC3" }],
    rewards: [{ type: "xp", id: "231C195DB1B74F7E", xp: 25 }],
  },
  {
    key: "MV_CLEANROOM", id: "53336232501835EE", title: "Cleanroom", icon: "gtceu:cleanroom", shape: "diamond", size: 1.75, deps: ["MV_ADVANCED_INTEGRATED_CIRCUIT","MV_HV_MACHINE_HULL","MV_HV_MOTOR_AND_PUMP"], x: 22, y: 0,
    desc: [
      "HV chips can't be made in a dusty factory, so they get a room of their own. Wipe your feet.",
      "The &6Cleanroom&r closes MV. Past it is HV, and at the end of HV, the Moon.",
    ],
    tasks: [{ type: "item", id: "004271B08D0CFDDF", item: "gtceu:cleanroom" }],
    rewards: [{ type: "xp", id: "16A43F54CF171ADA", xp: 150 }, { type: "item", id: "7E0A8B43D7625BFF", item: "minecraft:torch", count: 16 }],
  },
  {
    key: "MV_RADIO_TELESCOPE", id: "1E1E4E32D9532D1A", title: "Radio Telescope", icon: "gtceu:radio_telescope", shape: "gear", size: 1.5, deps: ["MV_MV_COMPONENTS","lv:LV_PHOTOGRAPHIC_LUNAR_MAP","lv:LV_LUNAR_EPHEMERIS"], x: 4, y: -3,
    desc: [
      "Radio doesn't mind clouds, so the &6Radio Telescope&r works right through the rain. A thunderstorm is another matter: the lightning drowns out the echo. It still needs the Moon in the sky, so nights only.",
      "It reads the LV map and ephemeris and never uses them up.",
    ],
    tasks: [{ type: "item", id: "5A0E7C41B2D93F18", item: "gtceu:radio_telescope" }],
    rewards: [{ type: "xp", id: "1B7C4D2A9E035F61", xp: 40 }],
  },
  {
    key: "MV_LUNAR_LANDING_SITE_CHART", id: "5C4613715A82BDBF", title: "Lunar Landing-Site Chart", icon: "grindless:lunar_landing_chart", deps: ["MV_RADIO_TELESCOPE"], x: 6, y: -4.5,
    desc: [
      "Radar echoes laid over the photographic map show smooth seas, boulder fields and crater walls, and one flat ellipse circled in red. That's where you're landing.",
      "HV writes the rocket's flight chip from this chart.",
    ],
    tasks: [{ type: "item", id: "3F8A1D6C02B7E945", item: "grindless:lunar_landing_chart" }],
    rewards: [{ type: "xp", id: "2D91E6B4C7A08F13", xp: 60 }],
  },
  {
    key: "MV_KEROSENE", id: "6E2B9F41C5A7D038", title: "Kerosene", icon: "gtceu:kerosene_bucket", deps: ["MV_DIESEL"], x: 6, y: 4.5,
    desc: [
      "Run diesel through the distillery again and kerosene comes off. Hang on to it; it's halfway to rocket fuel.",
    ],
    tasks: [{ type: "checkmark", id: "5C1F0A8E3B94D672" }],
    rewards: [{ type: "xp", id: "7A4D2C90E61B53F8", xp: 30 }],
  },
  {
    key: "MV_RP_1", id: "4B8E1D73A0F25C69", title: "RP-1", icon: "gtceu:rp_1_rocket_fuel_bucket", deps: ["MV_KEROSENE"], x: 8, y: 3,
    desc: [
      "One more pass through the distillery turns kerosene into &6RP-1&r, rocket-grade kerosene. The engine test stand burns it with oxygen.",
    ],
    tasks: [{ type: "checkmark", id: "2F6C9A40D7E18B35" }],
    rewards: [{ type: "xp", id: "1D5E8B2A7C90F436", xp: 40 }],
  },
  {
    key: "MV_QUALIFIED_POWER_THRUSTERS", id: "3A9D0C6F82B14E57", title: "Qualified Power Thrusters", icon: "grindless:qualified_power_thruster", deps: ["MV_ENGINE_TEST_STAND"], x: 10, y: 6,
    desc: [
      "A set of power thrusters goes on the stand together for a static fire on RP-1 and oxygen, and comes off qualified. HV's rocket motor only takes qualified thrusters.",
    ],
    tasks: [{ type: "item", id: "6C2F8E14B9A03D7B", item: "grindless:qualified_power_thruster", count: 4 }],
    rewards: [{ type: "xp", id: "5E0A7D3C1F92B684", xp: 50 }],
  },
  {
    key: "MV_ENGINE_TEST_STAND", id: "115744A9113F8B38", title: "Engine Test Stand", icon: "gtceu:engine_test_stand", shape: "gear", size: 1.5, deps: ["MV_RP_1"], x: 10, y: 4.5,
    desc: [
      "Fires rocket engines while they're bolted to the ground, which is the right order to do things in. Your first rocket's thrusters and its motor both get a burn here before they're allowed to fly.",
    ],
    tasks: [{ type: "item", id: "7D3B0E92A6C41F58", item: "gtceu:engine_test_stand" }],
    rewards: [{ type: "xp", id: "2B6F4C9E8D0A17E3", xp: 60 }],
  },
  {
    key: "MV_BLAZE", id: "3C356A1439744E15", title: "Blaze", icon: "minecraft:blaze_rod", deps: ["MV_MV_COMPONENTS","lv:LV_CREEPER_AND_BLAZE_MODELS"], x: 4, y: -1.5,
    desc: [
      "The blaze model you printed in LV gets to run now, in an MV simulator. Blaze rods lead to ender eyes, and ender eyes lead to the End.",
    ],
    tasks: [{ type: "item", id: "1C226BFF42F4D0D1", item: "gtceu:mv_creature_simulator" }, { type: "item", id: "7ED4D594DF1095B4", item: "minecraft:blaze_rod" }],
    rewards: [{ type: "xp", id: "5C2423EF0233FD7F", xp: 30 }],
  },
  {
    key: "MV_ENDER_EYE", id: "3DDBE9267C197FEE", title: "Ender Eye", icon: "minecraft:ender_eye", deps: ["MV_BLAZE"], x: 6, y: -3,
    desc: [
      "No crafting-table eyes in this pack. The extractor melts blaze rods into liquid blaze, and the MV chemical bath soaks an ender pearl in it until it comes out as an eye.",
    ],
    tasks: [{ type: "item", id: "27CDF7857BE02FBD", item: "minecraft:ender_eye" }, { type: "item", id: "7D0735D4C3007874", item: "gtceu:mv_chemical_bath" }],
    rewards: [{ type: "xp", id: "455F4629A4E480F9", xp: 35 }],
  },
  {
    key: "MV_END_KEY", id: "756117B334515EA3", title: "End Key", icon: "grindless:end_key", deps: ["MV_ENDER_EYE"], x: 8, y: -4.5,
    desc: [
      "The &6End Key&r drops you on a safe platform well away from the main island, and brings you home again. You're here for ore; the dragon can keep its island.",
    ],
    tasks: [{ type: "item", id: "5AA55A133132E331", item: "grindless:end_key" }],
    rewards: [{ type: "xp", id: "1232F0B14764A6C8", xp: 30 }],
  },
  {
    key: "MV_END_VEINS", id: "004525B795119B1B", title: "End Veins", icon: "grindless:vein_sample_sheldonite", deps: ["MV_END_KEY","MV_VANADIUM_STEEL_DRILL_BIT"], x: 10, y: -4.5,
    desc: [
      "Bring back raw ore from each End vein and make the samples at home, same as ever. The MV drill runs them with a vanadium steel bit and drilling fluid in the tank, and platinum, palladium and zirconium come up with the rest.",
    ],
    tasks: [{ type: "item", id: "1AF75215B6DC9170", item: "grindless:vein_sample_bauxite_end" }, { type: "item", id: "6EAC9D6932581F0E", item: "grindless:vein_sample_magnetite_end" }, { type: "item", id: "456E0BD2E8DB3874", item: "grindless:vein_sample_sheldonite" }, { type: "item", id: "1DA53D76EFA29AB0", item: "grindless:vein_sample_zirconium" }],
    rewards: [{ type: "xp", id: "6BC885CD026BAD65", xp: 40 }],
  },
  {
    key: "MV_UNIVERSAL_PROCESSING_FACTORY", id: "627E186404378CB4", title: "Universal Processing Factory", icon: "gtceu:universal_processing_factory", deps: ["MV_MV_COMPONENTS"], x: 2, y: 3,
    desc: [
      "Eleven shaping machines share one controller, from the bender and wiremill to the lathe and cutter, and its mode tab picks which one it is. It runs a few recipes at once, each at full price: less floor space, same power bill.",
    ],
    tasks: [{ type: "item", id: "6453007841DA2C65", item: "gtceu:universal_processing_factory" }],
    rewards: [{ type: "xp", id: "2D3C6C97135BC1D7", xp: 50 }],
  },
  {
    key: "MV_UNIVERSAL_ASSEMBLY_FACTORY", id: "661F318CAF9FAB23", title: "Universal Assembly Factory", icon: "gtceu:universal_assembly_factory", deps: ["MV_UNIVERSAL_PROCESSING_FACTORY"], x: 2, y: 4.5,
    desc: [
      "The assembler and the circuit assembler in one hall. If a recipe needs a cleanroom, so does this.",
    ],
    tasks: [{ type: "item", id: "7D3B9ED1BD1DACC3", item: "gtceu:universal_assembly_factory" }],
    rewards: [{ type: "xp", id: "36FBB71246272AC6", xp: 50 }],
  },
  {
    key: "MV_UNIVERSAL_SEPARATION_FACTORY", id: "12DED2DD9F460B1E", title: "Universal Separation Factory", icon: "gtceu:universal_separation_factory", deps: ["MV_UNIVERSAL_ASSEMBLY_FACTORY"], x: 2, y: 6,
    desc: [
      "Seven ways of taking things apart in one hall, from the centrifuge and electrolyzer to the electromagnetic separator. Each output hatch holds one fluid, so give it one for every fluid a recipe makes.",
    ],
    tasks: [{ type: "item", id: "25A4C777B062B5E0", item: "gtceu:universal_separation_factory" }],
    rewards: [{ type: "xp", id: "1BC8ED62911B2B29", xp: 50 }],
  },
  {
    key: "MV_UNIVERSAL_MIXING_FACTORY", id: "334DF899A63DBB13", title: "Universal Mixing Factory", icon: "gtceu:universal_mixing_factory", deps: ["MV_UNIVERSAL_SEPARATION_FACTORY"], x: 2, y: 7.5,
    desc: [
      "The mixer, chemical reactor, chemical bath and ore washer under one roof. Dry mixes don't need a single hatch.",
    ],
    tasks: [{ type: "item", id: "1354E905F7AA5B40", item: "gtceu:universal_mixing_factory" }],
    rewards: [{ type: "xp", id: "6CD8011712E8A87D", xp: 50 }],
  },
  {
    key: "MV_ADVANCED_MULTI_SMELTER", id: "1DAF5DAC3FE8DF4E", title: "Advanced Multi Smelter", icon: "gtceu:advanced_multi_smelter", deps: ["MV_UNIVERSAL_MIXING_FACTORY"], x: 4, y: 7.5,
    desc: [
      "Throw in a mixed batch and it smelts everything that shares a cooking time in one run, dusts and dinner alike. Each better coil doubles how much it takes at once.",
    ],
    tasks: [{ type: "item", id: "120EE92F2E3CA8B6", item: "gtceu:advanced_multi_smelter" }],
    rewards: [{ type: "xp", id: "1CA714AF20413892", xp: 50 }],
  },
  {
    key: "MV_LAVA_FURNACE", id: "7F6788F6AAD7AE1B", title: "Lava Furnace", icon: "gtceu:lava_furnace", deps: ["MV_ADVANCED_MULTI_SMELTER"], x: 6, y: 7.5,
    desc: [
      "Smelts with lava for heat and needs no power at all. It won't make lava, mind you, only burn it.",
    ],
    tasks: [{ type: "item", id: "27704CDD80CD50C9", item: "gtceu:lava_furnace" }],
    rewards: [{ type: "xp", id: "31EB13E7D3C67344", xp: 40 }],
  },
  {
    key: "MV_WEATHER_CONTROLLER", id: "78EB08D129F7B21A", title: "Weather Controller", icon: "gtceu:weather_controller", deps: ["MV_RADIO_TELESCOPE"], x: 6, y: -6,
    desc: [
      "Tired of waiting for a clear night? Seed the clouds. Calcium chloride clears the sky, salt brings rain, and salt with copper wire calls up a storm.",
      "It only works in the Overworld, and the weather turns when the run ends.",
    ],
    tasks: [{ type: "item", id: "7329F59F90310654", item: "gtceu:weather_controller" }],
    rewards: [{ type: "xp", id: "68EC208C4D9846BA", xp: 50 }],
  },
  {
    key: "MV_PLASTIC_BY_THE_SHEET", id: "3B42346CE2FA1CC4", title: "Plastic by the Sheet", icon: "gtceu:polymer_works", shape: "gear", size: 1.25, deps: ["MV_ETHYLENE_AND_PE"], x: 16, y: 4.5,
    desc: [
      "The &6Polymer Works&r turns raw inputs into polyethylene and rubber sheets in a single recipe, with no chemical reactor, mixer and solidifier chain in between. It runs several at once, up to what your hatch voltage allows.",
    ],
    tasks: [{ type: "item", id: "15FEC3AC6D61B5F5", item: "gtceu:polymer_works" }],
    rewards: [{ type: "xp", id: "3236E3D5ABD0F3DA", xp: 50 }, { type: "item", id: "1CC5EF3BF4664077", item: "gtceu:polyethylene_plate", count: 16 }],
  },
];
