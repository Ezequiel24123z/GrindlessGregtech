// Quest data for hv_age; tools/quests/gen-chapters.mjs writes the chapter. Imported from the hand-written chapter by tools/quests/lib/import-snbt.mjs (RF-5L2): every id is spelled out.

export const CHAPTER = {
  id: "7CD2454BDDCF0DD6",
  order: 3,
  icon: "gtceu:refinery",
  autofocus: "HV_HV_FACTORY",
  section: { name: 'HV: Moonshot', origin: { x: 0, y: 0 } },
  title: "HV: Moonshot",
  subtitle: ["Crude oil becomes chemistry, and the chemistry becomes a rocket to the Moon."],
};

export const QUESTS = [
  {
    key: "HV_HV_FACTORY", id: "3610F788A08B9FD3", title: "HV Factory", icon: "gtceu:hv_machine_hull", shape: "rsquare", size: 1.5, deps: ["mv:MV_CLEANROOM"], x: 0, y: 0,
    desc: [
      "The cleanroom works, so welcome to HV. Crude oil stops being something you burn and turns into chemistry, and stainless steel goes into everything.",
      "The way out is up: a rocket to the Moon.",
    ],
    tasks: [{ type: "checkmark", id: "652DBE317E40AFE7" }],
    rewards: [{ type: "xp", id: "097536B58AB1C2EC", xp: 40 }],
  },
  {
    key: "HV_HV_COMPONENTS", id: "5B595A919C80BFC0", title: "HV Components", icon: "gtceu:hv_electric_motor", deps: ["HV_HV_FACTORY"], x: 2, y: 0,
    desc: [
      "Another tier, another round of motors, pumps and arms, mostly in stainless steel this time. You'll be making these for the rest of the age, so an assembler that does nothing else isn't a bad idea.",
    ],
    tasks: [{ type: "item", id: "1259BDC6AE103E3A", item: "gtceu:hv_electric_motor" }, { type: "item", id: "75481D84726D613B", item: "gtceu:hv_electric_piston" }, { type: "item", id: "23DA5CC1B81AD05C", item: "gtceu:hv_electric_pump" }, { type: "item", id: "5BC3088D093E5BCF", item: "gtceu:hv_robot_arm" }, { type: "item", id: "61D202ED6D17FF04", item: "gtceu:hv_conveyor_module" }],
    rewards: [{ type: "xp", id: "5B58F6733D9F1DB6", xp: 35 }],
  },
  {
    key: "HV_HV_VEIN_DRILL", id: "721FA9268C278B3F", title: "HV Vein Drill",     icon: "gtceu:hv_vein_drill", kind: "machine", deps: ["HV_HV_COMPONENTS"], x: 4, y: -1.5,
        teach: {
          for: "More bores per run than the MV drill, on every vein it knows.",
          needs: "An HV hatch, stainless bits, drilling fluid.",
          unlocks: "Earth and End ore, with the pickaxe retired.",
          automate: "Bits and fluid by bus and pipe.",
        },
        desc: [],
        tasks: [{ type: "item", id: "3FA479D4D0FB6DE4", item: "gtceu:hv_vein_drill" }],
        rewards: [{ type: "xp", id: "291D4CDF7933776F", xp: 60 }],
  },
  {
    key: "HV_STAINLESS_STEEL_DRILL_BIT", id: "2CD2C8EF5A408796", title: "Stainless Steel Drill Bit", icon: "grindless:stainless_steel_drill_bit", deps: ["HV_HV_VEIN_DRILL"], x: 6, y: -3,
    desc: [
      "The HV drill's own bit, in stainless steel. If you run out, the old vanadium steel bit still fits, so the drill never has to sit idle.",
    ],
    tasks: [{ type: "item", id: "4222DE23EA3992E8", item: "grindless:stainless_steel_drill_bit", count: 4 }],
    rewards: [{ type: "xp", id: "396C938D1616ED8E", xp: 25 }],
  },
  {
    key: "HV_END_VEINS", id: "004525B795119B1B", title: "End Veins", icon: "grindless:vein_sample_sheldonite", deps: ["mv:MV_END_KEY","HV_STAINLESS_STEEL_DRILL_BIT"], x: 8, y: -4.5,
    desc: [
      "Bring back raw ore from each End vein and make the samples at home, same as ever. The HV drill runs them with a stainless steel bit and drilling fluid in the tank, and platinum, palladium and zirconium come up with the rest.",
    ],
    tasks: [{ type: "item", id: "1AF75215B6DC9170", item: "grindless:vein_sample_bauxite_end" }, { type: "item", id: "6EAC9D6932581F0E", item: "grindless:vein_sample_magnetite_end" }, { type: "item", id: "456E0BD2E8DB3874", item: "grindless:vein_sample_sheldonite" }, { type: "item", id: "1DA53D76EFA29AB0", item: "grindless:vein_sample_zirconium" }],
    rewards: [{ type: "xp", id: "6BC885CD026BAD65", xp: 40 }],
  },
  {
    key: "HV_HV_GREENHOUSE", id: "3C06724477E3E0BB", title: "HV Greenhouse",     icon: "gtceu:hv_greenhouse", kind: "machine", deps: ["HV_HV_COMPONENTS"], x: 2, y: -1.5,
        teach: {
          for: "The greenhouse at HV size: more bores per run.",
          needs: "Fertilizer and carbon dioxide.",
          unlocks: "Plant stock for the chemistry ahead.",
          automate: "Seeds in, harvest out, both by bus.",
        },
        desc: [
          "HV needs no more wood than MV: its carbon comes up as crude oil.",
        ],
        tasks: [{ type: "item", id: "5DB8D7813E63F2DC", item: "gtceu:hv_greenhouse" }],
        rewards: [{ type: "xp", id: "35502C2CA21A059D", xp: 55 }],
  },
  {
    key: "HV_REFINERY", id: "5C5D6FB9ECB7BC51", title: "Refinery",     icon: "gtceu:refinery", kind: "plant", deps: ["HV_HV_COMPONENTS"], x: 4, y: 0,
        teach: {
          for: "Every crude oil fraction in one pass, sulfur already removed.",
          needs: "Crude oil, hydrogen, a programmed circuit for the job.",
          unlocks: "Refining, hydrocracking and steam cracking.",
          automate: "Crude in by pipe, a pipe out per fraction.",
        },
        desc: [],
        tasks: [{ type: "item", id: "659FBFC6A4539F6D", item: "gtceu:refinery" }],
        rewards: [{ type: "xp", id: "012A2C94D6BE9D69", xp: 90 }],
  },
  {
    key: "HV_SYNGAS_PLANT", id: "4C18E0B7D5A92F61", title: "Syngas Plant",     icon: "gtceu:syngas_plant", kind: "machine", deps: ["HV_REFINERY"], x: 4, y: 1.5,
        teach: {
          for: "Carbon monoxide and hydrogen from coal or heavy fuel and steam.",
          needs: "Powdered coal or heavy fuel, steam.",
          unlocks: "Easy hydrogen for the ammonia in rocket fuel.",
          automate: "Each gas leaves by its own hatch.",
        },
        desc: [
          "The carbon monoxide is toxic: shift it or make methanol.",
        ],
        tasks: [{ type: "item", id: "0E5A7C2D98B14F36", item: "gtceu:syngas_plant" }],
    rewards: [{ type: "xp", id: "47E2104B9F6D3A58", xp: 50 }],
  },
  {
    key: "HV_WATER_GAS_SHIFT", id: "7B52A3F9E0C84D16", title: "Water-Gas Shift", icon: "grindless:shift_catalyst", deps: ["HV_SYNGAS_PLANT"], x: 6, y: 1.5,
    desc: [
      "On circuit 4 the plant runs carbon monoxide and steam over the &6Shift Catalyst&r, and the poison comes out as carbon dioxide and more hydrogen. Send it to the refinery.",
      "The catalyst is mixed from magnetite and chromium dust, and it wears out slowly.",
    ],
    tasks: [{ type: "checkmark", id: "1D4F16B0A2E73C85" }],
    rewards: [{ type: "xp", id: "19B8F5D3A60E7C42", xp: 35 }],
  },
  {
    key: "HV_HYDROTREATING_CATALYST", id: "64F01001238ACD74", title: "Hydrotreating Catalyst", icon: "grindless:hydrotreating_catalyst", deps: ["HV_REFINERY"], x: 6, y: 0,
    desc: [
      "The refinery eats a &6Hydrotreating Catalyst&r every so often, so keep spares in its input bus. Cobalt comes from the nickel vein and molybdenum from the Nether, and the syngas plant's ash can stand in for the silica.",
    ],
    tasks: [{ type: "item", id: "700AC5219F2F1ADB", item: "grindless:hydrotreating_catalyst", count: 4 }],
    rewards: [{ type: "xp", id: "7BB92FDB97461071", xp: 30 }],
  },
  {
    key: "HV_CRACKING_AND_OLEFINS", id: "1051C4B8835DB4A3", title: "Cracking and Olefins", icon: "gtceu:refinery", deps: ["HV_HYDROTREATING_CATALYST"], x: 8, y: 0,
    desc: [
      "Put circuit 3 in the refinery, give it steam, and naphtha comes back as ethylene, propene, butadiene and benzene. Most of HV's plastics start there.",
      "Circuit 2 cracks with hydrogen instead, which is handy for whatever fraction keeps piling up.",
    ],
    tasks: [{ type: "checkmark", id: "5104D985778131A0" }],
    rewards: [{ type: "xp", id: "40F96569A80405B1", xp: 30 }],
  },
  {
    key: "HV_CATALYTIC_REFORMER", id: "52781D6F5A69C4BE", title: "Catalytic Reformer",     icon: "gtceu:reformer", kind: "machine", optional: true, deps: ["HV_HYDROTREATING_CATALYST"], x: 6, y: -1.5,
        teach: {
          for: "Reforms naphtha into benzene, toluene and spare hydrogen.",
          needs: "Naphtha and a reforming catalyst.",
          unlocks: "More hydrogen for the refinery.",
          automate: "Hydrogen pipes straight back to the refinery.",
        },
        desc: [
          "Optional: the electrolyzer covers hydrogen without it, with less to spare.",
        ],
    tasks: [{ type: "item", id: "3D77A53BF29A83F5", item: "gtceu:reformer" }],
    rewards: [{ type: "xp", id: "46D2EE333DEFD840", xp: 40 }],
  },
  {
    key: "HV_REFORMING_CATALYST", id: "045FA73ADE3D0624", title: "Reforming Catalyst", icon: "grindless:reforming_catalyst", deps: ["HV_CATALYTIC_REFORMER"], x: 8, y: -3,
    desc: [
      "Platinum on silica, and the platinum comes from the End's sheldonite vein. That End sample in your drill finally earns its keep.",
    ],
    tasks: [{ type: "item", id: "0CAB2A5FCAE4C6DC", item: "grindless:reforming_catalyst", count: 4 }],
    rewards: [{ type: "xp", id: "5669400C0C30D05F", xp: 30 }],
  },
  {
    key: "HV_PTFE", id: "720331A06D7F2344", title: "PTFE", icon: "gtceu:inert_machine_casing", deps: ["HV_CRACKING_AND_OLEFINS"], x: 10, y: 0,
    desc: [
      "&6PTFE&r is the plastic nothing eats, which is why the large chemical reactor is lined with it. The road runs through chloroform and TFE.",
      "Methane comes from distilling refinery gas, and the fluorine from topaz, lepidolite or bastnasite.",
    ],
    tasks: [{ type: "item", id: "2B26A5F014E45D2A", item: "gtceu:inert_machine_casing", count: 8 }],
    rewards: [{ type: "xp", id: "2BA86A8E9940CABD", xp: 35 }],
  },
  {
    key: "HV_GASOLINE", id: "35719B747A75F7B6", title: "Gasoline", icon: "gtceu:large_chemical_reactor", deps: ["HV_PTFE"], x: 12, y: 0,
    desc: [
      "With PTFE walls, the &6Large Chemical Reactor&r can finally be built. Its big job in HV is gasoline, and the methanol and acetone piling up since MV go straight into it.",
      "Gasoline is also a far better fuel than creosote.",
    ],
    tasks: [{ type: "item", id: "1E56A8818DE368EE", item: "gtceu:large_chemical_reactor" }],
    rewards: [{ type: "xp", id: "3EB45CE14A466656", xp: 55 }],
  },
  {
    key: "HV_COMPOSITE_AUTOCLAVE", id: "3B7E2C9A41D06F85", title: "Composite Autoclave",     icon: "gtceu:composite_autoclave", kind: "machine", deps: ["HV_CRACKING_AND_OLEFINS"], x: 8, y: -1.5,
        teach: {
          for: "Cures fiber in epoxy under nitrogen pressure.",
          needs: "Fiber, epoxy and nitrogen through the hatches.",
          unlocks: "Heat-shield tiles and overwrapped tanks.",
          automate: "Everything arrives by hatch; leave the inside empty.",
        },
        desc: [],
    tasks: [{ type: "item", id: "5A0C81E7D2B94F16", item: "gtceu:composite_autoclave" }],
    rewards: [{ type: "xp", id: "2A3D5F1E07C4B926", xp: 60 }],
  },
  {
    key: "HV_HEAT_SHIELD_TILES", id: "6D0A4F18B2E93C57", title: "Heat-Shield Tiles", icon: "grindless:ablative_heat_shield_tile", deps: ["HV_COMPOSITE_AUTOCLAVE"], x: 10, y: -1.5,
    desc: [
      "&6Ablative Heat-Shield Tiles&r are fiberglass soaked in epoxy and cured under nitrogen. They sit at the base of each motor and burn away so the motor doesn't.",
    ],
    tasks: [{ type: "item", id: "1C7E09A3F5D82B64", item: "grindless:ablative_heat_shield_tile", count: 2 }],
    rewards: [{ type: "xp", id: "2C6E9B0F4D17A853", xp: 45 }],
  },
  {
    key: "HV_OVERWRAPPED_TANKS", id: "1F8C57E2A6D40B93", title: "Overwrapped Tanks", icon: "grindless:composite_overwrapped_tank", deps: ["HV_GT_DRUMS","HV_COMPOSITE_AUTOCLAVE"], x: 12, y: -3,
    desc: [
      "An &6Overwrapped Tank&r is a stainless steel drum wrapped in para-aramid and cured in epoxy, light and very hard to burst. The rocket's fuel tanks are built around them.",
    ],
    tasks: [{ type: "item", id: "4E2B9D06C1A7F358", item: "grindless:composite_overwrapped_tank", count: 4 }],
    rewards: [{ type: "xp", id: "7F1A4D82B0E6C395", xp: 45 }],
  },
  {
    key: "HV_UNTESTED_ROCKET_MOTOR", id: "5E26B9D13A7C08F4", title: "Untested Rocket Motor", icon: "grindless:untested_rocket_motor", shape: "gear", size: 1.25, deps: ["HV_HEAT_SHIELD_TILES"], x: 12, y: -1.5,
    desc: [
      "The &6Untested Rocket Motor&r is where the qualified thrusters and heat-shield tiles come together, on a stainless steel frame. The name is honest.",
    ],
    tasks: [{ type: "item", id: "3F90C2E8B1D5A746", item: "grindless:untested_rocket_motor" }],
    rewards: [{ type: "xp", id: "305E3C97D2A18F64", xp: 50 }],
  },
  {
    key: "HV_STATIC_FIRE", id: "2A94D7C0E6B15F38", title: "Static Fire", icon: "gtceu:engine_test_stand", shape: "gear", size: 1.25, deps: ["HV_UNTESTED_ROCKET_MOTOR","HV_ROCKET_FUEL","mv:MV_ENGINE_TEST_STAND"], x: 16, y: 0,
    desc: [
      "Back to the &6Engine Test Stand&r from MV, this time with a whole motor, burning the same rocket fuel it'll fly on. It needs HV power now: an HV energy hatch, or a second MV one.",
      "The motors always pass, but it's nice to know before you're sitting on top of one.",
    ],
    tasks: [{ type: "checkmark", id: "6B1D3E7A90C24F5D" }],
    rewards: [{ type: "xp", id: "4D9A6E2C81F0B375", xp: 60 }],
  },
  {
    key: "HV_ROCKET_MOTORS", id: "5C1D3FB96A9FB74A", title: "Rocket Motors", icon: "gcyr:basic_rocket_motor", deps: ["HV_STATIC_FIRE"], x: 18, y: 0,
    desc: [
      "Each static fire hands you a &6Basic Rocket Motor&r. Make more than the bare minimum: every block of the rocket has weight, and with too few motors it barely leaves the pad.",
      "The rocket's screen shows its speed.",
    ],
    tasks: [{ type: "item", id: "6C0A50CC41916AEE", item: "gcyr:basic_rocket_motor", count: 6 }],
    rewards: [{ type: "xp", id: "71613751FE3583C9", xp: 40 }],
  },
  {
    key: "HV_FUEL_TANKS", id: "4A6E81ABD8026025", title: "Fuel Tanks", icon: "gcyr:basic_fuel_tank", deps: ["HV_OVERWRAPPED_TANKS"], x: 16, y: -1.5,
    desc: [
      "A single &6Basic Fuel Tank&r can't hold enough for a Moon launch, so the first rocket carries a pair.",
    ],
    tasks: [{ type: "item", id: "216EB77B2A3105FF", item: "gcyr:basic_fuel_tank", count: 2 }],
    rewards: [{ type: "xp", id: "240589002FC5DF78", xp: 40 }],
  },
  {
    key: "HV_ROCKET_FUEL", id: "76D281E9D9C6FD20", title: "Rocket Fuel", icon: "gtceu:hv_chemical_reactor", deps: ["HV_GASOLINE"], x: 14, y: 0,
    desc: [
      "&6Rocket Fuel&r is dimethylhydrazine and oxygen out of the mixer, and the hydrazine comes from methanol, ammonia and hypochlorous acid.",
      "A Moon launch needs at least 8 buckets in the tanks. Make extra, because every static fire burns some too.",
    ],
    tasks: [{ type: "checkmark", id: "437D6750BF09654E" }],
    rewards: [{ type: "xp", id: "3E3E25931D1CA960", xp: 40 }],
  },
  {
    key: "HV_LAUNCH_PAD", id: "7B21622AADB1E1D1", title: "Launch Pad", icon: "gcyr:launch_pad", deps: ["HV_GASOLINE"], x: 16, y: 1.5,
    desc: [
      "The rocket stands on a square of &6Launch Pads&r with a short tower of stainless steel frames. The scanner's EMI page shows where every block goes.",
    ],
    tasks: [{ type: "item", id: "6661EAA2F3C9E650", item: "gcyr:launch_pad", count: 9 }, { type: "item", id: "3B8A9579E4CC32E1", item: "gtceu:stainless_steel_frame", count: 2 }],
    rewards: [{ type: "xp", id: "559F7D571DE034D2", xp: 30 }],
  },
  {
    key: "HV_SPACE_SUIT", id: "5615E54AF782990A", title: "Space Suit", icon: "gcyr:space_helmet", deps: ["HV_FUEL_TANKS"], x: 20, y: -1.5,
    desc: [
      "The suit is sewn from the same para-aramid and Kapton as the fuel tanks. Fill the &6Space Chestplate&r with oxygen in a fluid canner before you leave: an empty suit drowns you on the Moon.",
      "Wear all four pieces. The lunar cold finds whichever one you forgot.",
    ],
    tasks: [{ type: "item", id: "337084D39FB4E97E", item: "gcyr:space_helmet" }, { type: "item", id: "6A0E2F3ACDFB6FD0", item: "gcyr:space_chestplate" }, { type: "item", id: "02737F107983D7E9", item: "gcyr:space_leggings" }, { type: "item", id: "2734B9A769F33E71", item: "gcyr:space_boots" }],
    rewards: [{ type: "xp", id: "010BB817D271287F", xp: 40 }],
  },
  {
    key: "HV_FIRST_ROCKET", id: "5151DE8D3623EDCF", title: "First Rocket", icon: "gcyr:rocket_scanner", shape: "gear", size: 1.25, deps: ["HV_ROCKET_MOTORS","HV_FUEL_TANKS","HV_LAUNCH_PAD"], x: 20, y: 0,
    desc: [
      "Motors on the pad, tanks on the motors, the &6Seat&r on top, all in front of the &6Rocket Scanner&r. Right-click the scanner and press Build, and the pile of blocks becomes a rocket.",
    ],
    tasks: [{ type: "item", id: "214541FBE8CB3605", item: "gcyr:rocket_scanner" }, { type: "item", id: "1DF6E14CDCEDEA6D", item: "gcyr:seat" }],
    rewards: [{ type: "xp", id: "6C490E4AB37CEB62", xp: 60 }],
  },
  {
    key: "HV_LIFTOFF", id: "4A672DF7CF424623", title: "Liftoff", icon: "gcyr:id_chip", deps: ["HV_FIRST_ROCKET","mv:MV_LUNAR_LANDING_SITE_CHART"], x: 22, y: 0,
    desc: [
      "The &6ID Chip&r is written from your landing-site chart, which you get back, and set to the Moon on the planet screen.",
      "Pack the lunar drill, empty vein probes, charged batteries and a waystone. Check the suit has air, load the chip and the fuel, sit down and go.",
    ],
    tasks: [{ type: "item", id: "4B08AC4FA0E80C99", item: "gcyr:id_chip" }],
    rewards: [{ type: "xp", id: "3E3DC37BC58FD75C", xp: 40 }],
  },
  {
    key: "HV_THE_MOON", id: "2897E3EB8159710C", title: "The Moon", icon: "gcyr:moon_stone", shape: "diamond", size: 1.75, deps: ["HV_LIFTOFF","HV_SPACE_SUIT"], x: 24, y: 0,
    desc: [
      "Hold Space to brake on the way down. A hard landing blows the rocket up, and the walk home is long.",
      "Keep the chestplate topped up with oxygen, then set up camp: the lunar base is where EV begins.",
    ],
    tasks: [{ type: "dimension", id: "2717156C3769D52D", dimension: "gcyr:luna" }],
    rewards: [{ type: "xp", id: "178ADCEDFB41DCA4", xp: 150 }],
  },
  {
    key: "HV_CPU_WAFER", id: "51DD45CBEDEE31D9", title: "CPU Wafer and Chip", icon: "gtceu:cpu_chip", kind: "wafer", deps: ["HV_HV_COMPONENTS"], x: 4, y: 3,
    teach: {
      for: "The central processor, the first chip of the micro line.",
      needs: "Silicon wafers, the laser engraver, the cutter.",
      unlocks: "Microprocessors and everything built on them.",
      automate: "Engrave then cut on one bus line; keep wafers stocked.",
    },
    desc: [],
    tasks: [{ type: "item", id: "28566FCC6FBBF1B3", item: "gtceu:cpu_wafer", count: 4 }, { type: "item", item: "gtceu:cpu_chip", count: 8 }],
    rewards: [{ type: "xp", id: "3701FB44C4351347", xp: 45 }],
  },
  {
    key: "HV_MICROPROCESSOR", title: "Microprocessor", icon: "gtceu:micro_processor", kind: "circuit", deps: ["HV_CPU_WAFER"], x: 6, y: 3,
    teach: {
      for: "The first circuit built round a CPU.",
      needs: "CPU chips, resistors, capacitors, transistors.",
      unlocks: "The microprocessor assembly.",
      automate: "Circuit assembler with all four inputs on buses.",
    },
    desc: [],
    tasks: [{ type: "item", item: "gtceu:micro_processor", count: 8 }],
    rewards: [{ type: "xp", xp: 40 }],
  },
  {
    key: "HV_MICROPROCESSOR_ASSEMBLY", title: "Microprocessor Assembly", icon: "gtceu:micro_processor_assembly", kind: "circuit", deps: ["HV_MICROPROCESSOR"], x: 8, y: 3,
    teach: {
      for: "Several microprocessors on one board.",
      needs: "Microprocessors, capacitors, more RAM.",
      unlocks: "The workstation.",
      automate: "Same circuit assembler, a second recipe on the circuit.",
    },
    desc: [],
    tasks: [{ type: "item", item: "gtceu:micro_processor_assembly", count: 4 }],
    rewards: [{ type: "xp", xp: 45 }],
  },
  {
    key: "HV_EV_WORKSTATION", title: "Workstation", icon: "gtceu:micro_processor_computer", kind: "circuit", deps: ["HV_MICROPROCESSOR_ASSEMBLY"], x: 10, y: 3,
    teach: {
      for: "The EV circuit, and the end of the micro line.",
      needs: "Assemblies, plus a cleanroom for the last step.",
      unlocks: "The vacuum freezer and nearly all of EV.",
      automate: "Run the line early: the assemblies buffer on a bus.",
    },
    desc: [],
    tasks: [{ type: "item", item: "gtceu:micro_processor_computer", count: 2 }],
    rewards: [{ type: "xp", xp: 80 }],
  },
  {
    key: "HV_LPIC", title: "LPIC Wafer and Chip", icon: "gtceu:lpic_chip", kind: "wafer", deps: ["HV_CPU_WAFER"], x: 4, y: 4.5,
    teach: {
      for: "The low-power IC, a leaner chip than the ULPIC.",
      needs: "Wafers, the laser engraver, the cutter.",
      unlocks: "The simple SoC.",
      automate: "Another engrave and cut line, another lens.",
    },
    desc: [],
    tasks: [{ type: "item", item: "gtceu:lpic_wafer", count: 2 }, { type: "item", item: "gtceu:lpic_chip", count: 8 }],
    rewards: [{ type: "xp", xp: 40 }],
  },
  {
    key: "HV_SIMPLE_SOC", title: "Simple SoC", icon: "gtceu:simple_soc", kind: "wafer", deps: ["HV_LPIC"], x: 4, y: 6,
    teach: {
      for: "A whole small computer on one die.",
      needs: "Wafers, the laser engraver, the cutter, a cleanroom.",
      unlocks: "Compact circuits in later eras.",
      automate: "Cleanroom line; keep wafers stocked.",
    },
    desc: [],
    tasks: [{ type: "item", item: "gtceu:simple_soc_wafer", count: 2 }, { type: "item", item: "gtceu:simple_soc", count: 8 }],
    rewards: [{ type: "xp", xp: 45 }],
  },
  {
    key: "HV_NAND_MEMORY", title: "NAND Memory", icon: "gtceu:nand_memory_chip", kind: "wafer", deps: ["HV_CPU_WAFER"], x: 6, y: 4.5,
    teach: {
      for: "Dense storage for the circuits that remember.",
      needs: "Wafers, the laser engraver, the cutter.",
      unlocks: "NOR memory and the data circuits.",
      automate: "Engrave then cut, same as every chip.",
    },
    desc: [],
    tasks: [{ type: "item", item: "gtceu:nand_memory_wafer", count: 2 }, { type: "item", item: "gtceu:nand_memory_chip", count: 8 }],
    rewards: [{ type: "xp", xp: 40 }],
  },
  {
    key: "HV_NOR_MEMORY", title: "NOR Memory", icon: "gtceu:nor_memory_chip", kind: "wafer", deps: ["HV_NAND_MEMORY"], x: 8, y: 4.5,
    teach: {
      for: "Fast memory that runs code in place.",
      needs: "Wafers and phosphorus, on HV power.",
      unlocks: "The faster circuits of EV.",
      automate: "A phosphorus feed on the engraver line.",
    },
    desc: [],
    tasks: [{ type: "item", item: "gtceu:nor_memory_wafer", count: 2 }, { type: "item", item: "gtceu:nor_memory_chip", count: 8 }],
    rewards: [{ type: "xp", xp: 45 }],
  },
  {
    key: "HV_VACUUM_FREEZER", id: "53D1CE971F63D842", title: "Vacuum Freezer", icon: "gtceu:vacuum_freezer", kind: "machine", deps: ["HV_EV_WORKSTATION"], x: 12, y: 3,
    teach: {
      for: "Cools the hottest ingots and turns air into liquid air.",
      needs: "EV circuits, so it waits for the workstation.",
      unlocks: "Nichrome now, lunar titanium later.",
      automate: "Ingots in by bus, cooled ingots out by bus.",
    },
    desc: [],
    tasks: [{ type: "item", id: "0AEBA5F4B70C1D3E", item: "gtceu:vacuum_freezer" }],
    rewards: [{ type: "xp", id: "312C422590E22590", xp: 60 }],
  },
  {
    key: "HV_NICHROME", id: "70F4075BAF69DA99", title: "Nichrome", icon: "gtceu:nichrome_ingot", deps: ["HV_VACUUM_FREEZER"], x: 14, y: 3,
    desc: [
      "&6Nichrome&r needs more power than one HV energy hatch gives, so the blast furnace gets two, and the hot ingot goes through the freezer.",
      "EV turns it into coils: the regolith cell and tungsten's furnace both want them.",
    ],
    tasks: [{ type: "item", id: "7FEDE320D91D5B65", item: "gtceu:nichrome_ingot", count: 4 }],
    rewards: [{ type: "xp", id: "5B177DB0EA38B7DC", xp: 40 }],
  },
  {
    key: "HV_GT_DRUMS", id: "471A024EBFCA8459", title: "GT Drums", icon: "gtceu:stainless_steel_drum", deps: ["mv:MV_STAINLESS_STEEL","HV_STAINLESS_STEEL_DRILL_BIT"], x: 10, y: -3,
    desc: [
      "A &6Stainless Steel Drum&r holds a lot of fluid and keeps it when you pick it up. It's also the liner inside the rocket's overwrapped tanks, so make a few extra.",
    ],
    tasks: [{ type: "item", id: "336736F34B2A70B0", item: "gtceu:stainless_steel_drum" }],
    rewards: [{ type: "xp", id: "6707FD083533EF59", xp: 30 }],
  },
  {
    key: "HV_CLEANROOM_IN_A_HATCH", id: "12831B49EE204B0B", title: "Cleanroom in a Hatch", icon: "gtceu:cleaning_maintenance_hatch", deps: ["mv:MV_CLEANROOM","HV_HV_COMPONENTS"], x: 2, y: 1.5,
    desc: [
      "GregTech saves the &6Cleaning Maintenance Hatch&r for UV; here you get it in HV. Any GregTech multiblock with a maintenance slot counts as being in a cleanroom once it's fitted.",
      "The pack's own multiblocks don't take one.",
    ],
    tasks: [{ type: "item", id: "2AB3457DB642C0B2", item: "gtceu:cleaning_maintenance_hatch" }],
    rewards: [{ type: "xp", id: "290DE13044D4E778", xp: 60 }],
  },
  {
    key: "HV_COIL_CHEMICAL_PLANT", id: "5731FF20BC9CBDD9", title: "Coil Chemical Plant",     icon: "gtceu:coil_chemical_plant", kind: "plant", deps: ["HV_GASOLINE"], x: 12, y: 1.5,
        teach: {
          for: "A large chemical reactor heated by coils.",
          needs: "Coils: better ones run more recipes at once.",
          unlocks: "Chemistry at scale, with a trimmed energy bill.",
          automate: "Hatches in and out, like the reactor it grew from.",
        },
        desc: [],
        tasks: [{ type: "item", id: "332A714483469ADA", item: "gtceu:coil_chemical_plant" }],
        rewards: [{ type: "xp", id: "5ADAE012D2D4306D", xp: 60 }],
  },
  {
    key: "HV_NANOMUSCLE_SUIT", id: "3C71A9D5E04B8F26", title: "NanoMuscle Suit", icon: "gtceu:nanomuscle_chestplate", deps: ["HV_SPACE_SUIT"], x: 22, y: -3,
    desc: [
      "The &6NanoMuscle Chestplate&r is eight carbon fibre plates around an &6Energy Crystal&r. It holds 6.4M EU.",
      "Charged, it lets you &6fly like in creative&r: 175 EU/t while flying, nothing on the ground, about 30 minutes per charge. It warns you at 10%. Recharge it in a charger or battery buffer. The advanced version adds the jetpack.",
    ],
    tasks: [{ type: "item", id: "6D2E8B4107A35C91", item: "gtceu:nanomuscle_chestplate" }],
    rewards: [{ type: "xp", id: "1F5A07C3B9E24D68", xp: 60 }],
  },
];
