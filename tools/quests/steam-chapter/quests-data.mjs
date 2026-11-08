// Quest data for steam_age; tools/quests/gen-chapters.mjs writes the chapter. Imported from the hand-written chapter by tools/quests/lib/import-snbt.mjs (RF-5L2): every id is spelled out.

export const CHAPTER = {
  id: "47DE4F5800320CB8",
  order: 0,
  icon: "gtceu:bronze_gear",
  autofocus: "STEAM_STEAM_AGE",
  section: { name: 'Steam Age: Escape Velocity', origin: { x: 0, y: 0 } },
  title: "Steam Age: Escape Velocity",
  subtitle: ["Still no electricity: coal, steam and bronze, until ore and wood start turning up on their own."],
};

export const QUESTS = [
  {
    key: "STEAM_STEAM_AGE", id: "3041A191AB566E3E", title: "Steam Age", icon: "gtceu:lp_steam_solid_boiler", shape: "rsquare", size: 1.5, deps: ["X:3207813527EE1FBD"], x: 0, y: 0,
    desc: [
      "Still on Earth, still no electricity. Fire boils water here, and the steam drives bronze machines.",
      "By the end, drills and greenhouses do the gathering and your first generator is turning. Until then, the pickaxe still has work to do.",
    ],
    tasks: [{ type: "checkmark", id: "410D4E9D93B2590D" }],
    rewards: [{ type: "xp", id: "52D5B636AC2AFE95", xp: 20 }],
  },
  {
    key: "STEAM_CLAY_AND_BRICKS", id: "2504804D432C502B", title: "Clay and Bricks", icon: "minecraft:bricks", deps: ["STEAM_STEAM_AGE"], x: 2, y: 0,
    desc: [
      "Smelt clay into bricks. The boiler and the bricked casings of the steam machines are built on them, and the clay you got for finishing bronze was meant for exactly this.",
    ],
    tasks: [{ type: "item", id: "71F99DC62AF5BF3C", item: "minecraft:brick", count: 16 }],
    rewards: [{ type: "xp", id: "2A35AC3AAAB1DF17", xp: 20 }],
  },
  {
    key: "STEAM_COKE_OVEN_BRICKS", id: "2FF295FBA78AF335", title: "Coke Oven Bricks", icon: "gtceu:coke_oven_bricks", deps: ["STEAM_STEAM_AGE"], x: 2, y: -1.5,
    desc: [
      "The coke oven wants its own bricks, and they take a few more steps than the plain kind: a carved wooden form, coke clay, then the furnace. The form never leaves the grid, so one carving lasts forever.",
    ],
    tasks: [{ type: "item", id: "1375061D838CBA5C", item: "gtceu:empty_wooden_form" }, { type: "item", id: "798F691F46884A2A", item: "gtceu:brick_wooden_form" }, { type: "item", id: "4089C686D0D31180", item: "gtceu:compressed_coke_clay" }, { type: "item", id: "40B754DC855D6933", item: "gtceu:coke_oven_brick" }, { type: "item", id: "46BC785D13A069E4", item: "gtceu:coke_oven_bricks", count: 25 }],
    rewards: [{ type: "xp", id: "6A7800690D415A43", xp: 25 }],
  },
  {
    key: "STEAM_COKE_OVEN", id: "20A9578F6F706702", title: "Coke Oven", icon: "gtceu:coke_oven", deps: ["STEAM_COKE_OVEN_BRICKS"], x: 4, y: -1.5,
    desc: [
      "Your first multiblock, and a gentle one: a hollow cube of bricks with the controller in one face. EMI shows the shape on the controller's page.",
      "It turns coal into coke and logs into charcoal, which a furnace won't do here. The creosote that collects inside burns in boilers, or soaks planks into treated wood.",
    ],
    tasks: [{ type: "item", id: "74AB3375CC84D045", item: "gtceu:coke_oven" }, { type: "item", id: "160AC0E4D073488B", item: "gtceu:coke_gem", count: 8 }],
    rewards: [{ type: "xp", id: "2F8316F0B18FE31A", xp: 30 }, { type: "item", id: "4CEF32FF034FD548", item: "minecraft:coal", count: 8 }],
  },
  {
    key: "STEAM_COKE_BATTERY", id: "3A7C5E1D9B2F6048", title: "Coke Battery",     icon: "gtceu:coking_battery", kind: "machine", deps: ["STEAM_COKE_OVEN"], x: 6, y: -1.5,
        teach: {
          for: "It cokes like a row of ovens and keeps the coal gas they let escape.",
          needs: "Bricks, steel and a ULV output hatch, hand-crafted.",
          unlocks: "Coke by the stack, and gas for LV chemistry.",
          automate: "Feed coal by conveyor and tank the gas.",
        },
        desc: [
          "No steam part can pull fluid out of a multiblock. A screwdriver turns the ULV output hatch into the input version.",
        ],
    tasks: [{ type: "item", id: "5F1E8B2C4A9D7063", item: "gtceu:coking_battery" }],
    rewards: [{ type: "xp", id: "6A2D9F4C1E8B5073", xp: 40 }],
  },
  {
    key: "STEAM_PRIMITIVE_PUMP", id: "0E2E13522BA2A323", title: "Primitive Pump", icon: "gtceu:primitive_pump", deps: ["STEAM_COKE_OVEN"], x: 6, y: -3,
    desc: [
      "The pump makes its own water, a little faster in wet biomes, so no bucket or lake is needed.",
      "Give it a ULV fluid output hatch instead of its own pump hatch and it pumps twice as much. The large steam ore washer is built around one later, too.",
    ],
    tasks: [{ type: "item", id: "4AAD651868C2E72F", item: "gtceu:primitive_pump" }],
    rewards: [{ type: "xp", id: "413042DF78D6A4F5", xp: 20 }],
  },
  {
    key: "STEAM_LOW_PRESSURE_BOILER", id: "6D923ADC90127182", title: "Low-Pressure Boiler", icon: "gtceu:lp_steam_solid_boiler", deps: ["STEAM_CLAY_AND_BRICKS"], x: 4, y: 0,
    desc: [
      "Your first steam. Fill it with water before the first fuel goes in: a dry, hot boiler that suddenly gets water doesn't stay a boiler for long.",
      "Boilers here make far more steam than in stock GregTech, and one goes a long way. Steam leaves through the top, back and sides, never the bottom or the front. Feed the water in from below.",
    ],
    tasks: [{ type: "item", id: "4753776446D60E4F", item: "gtceu:lp_steam_solid_boiler" }],
    rewards: [{ type: "xp", id: "0348F0407B42C093", xp: 30 }, { type: "item", id: "31391282AEDC2039", item: "minecraft:charcoal", count: 8 }],
  },
  {
    key: "STEAM_STEAM_MACHINES", id: "4F0049B2E382BA8E", title: "Steam Machines", icon: "gtceu:bronze_machine_casing", deps: ["STEAM_LOW_PRESSURE_BOILER"], x: 6, y: 0,
    desc: [
      "Each steam machine starts from a &6Bronze Machine Casing&r or a &6Bricked Bronze Casing&r and drinks steam from a boiler or pipe beside it.",
      "After every cycle it vents a puff of steam out of the back. Wall that side off and the machine stops, and it'll wait there as long as you will. The bronze ones also run at half the speed of the steel versions.",
    ],
    tasks: [{ type: "item", id: "25ADC88A15337AD3", item: "gtceu:bronze_machine_casing" }, { type: "item", id: "5EFEA10D880CB812", item: "gtceu:bronze_brick_casing" }],
    rewards: [{ type: "xp", id: "3584CC34BCFF6E54", xp: 25 }],
  },
  {
    key: "STEAM_STEAM_MINER", id: "3E65A226A598A301", title: "Steam Miner", icon: "gtceu:lp_steam_miner", deps: ["STEAM_STEAM_MACHINES"], x: 8, y: -3,
    desc: [
      "GregTech's miner chews through the ore under it, block by block, until there's nothing left. Don't scrap it when it runs dry; the steam vein drill is built around one.",
    ],
    tasks: [{ type: "item", id: "07D15B562DFB45B0", item: "gtceu:lp_steam_miner" }],
    rewards: [{ type: "xp", id: "000E98439123F51B", xp: 30 }],
  },
  {
    key: "STEAM_STEAM_MACERATOR", id: "0238F574F77C30E5", title: "Steam Macerator", icon: "gtceu:lp_steam_macerator", deps: ["STEAM_STEAM_MACHINES"], x: 8, y: -1.5,
    desc: [
      "The mortar's job without the elbow grease. It only gives the first output, so byproducts wait for the large steam macerator or an HV one. It still doubles your ore, though: raw ore comes out as crushed ore, and crushed ore smelts too.",
      "It wants diamonds from the deep veins.",
    ],
    tasks: [{ type: "item", id: "482297E9CDFF2C7C", item: "gtceu:lp_steam_macerator" }],
    rewards: [{ type: "xp", id: "5B2F25CCB1188B32", xp: 30 }],
  },
  {
    key: "STEAM_STEAM_COMPRESSOR", id: "6BB23A9836716A37", title: "Steam Compressor", icon: "gtceu:lp_steam_compressor", deps: ["STEAM_STEAM_MACHINES"], x: 8, y: 0,
    desc: [
      "GregTech won't let you pack nuggets into ingots by hand, so the compressor does it. It also presses wood dust into the wood plates the first circuit boards start from, and fireclay dust into bricks ready for the furnace.",
    ],
    tasks: [{ type: "item", id: "3CC85B833FE429F6", item: "gtceu:lp_steam_compressor" }],
    rewards: [{ type: "xp", id: "1D0789B0F2987E54", xp: 25 }],
  },
  {
    key: "STEAM_STEAM_ALLOY_SMELTER", id: "0B3A5E0D83643882", title: "Steam Alloy Smelter", icon: "gtceu:lp_steam_alloy_smelter", deps: ["STEAM_STEAM_MACERATOR"], x: 10, y: -1.5,
    desc: [
      "Copper and tin go in and bronze comes out, with less waste than mixing dust by hand. Red alloy comes from here too, and once you have molds it casts glass, glass tubes and rubber sheets.",
      "The steam furnace is its plainer cousin, if you want one.",
    ],
    tasks: [{ type: "item", id: "568FAC5542664DE3", item: "gtceu:lp_steam_alloy_smelter" }, { type: "item", id: "2708C54E534B1E99", item: "gtceu:lp_steam_furnace", raw: { optional_task: "true" } }],
    rewards: [{ type: "xp", id: "6C4BDF67A0491A0F", xp: 35 }],
  },
  {
    key: "STEAM_STEAM_ROCK_CRUSHER", id: "68EB76B726CD7484", title: "Steam Rock Crusher", icon: "gtceu:lp_steam_rock_crusher", size: 0.75, optional: true, deps: ["STEAM_STEAM_MACHINES"], x: 8, y: 3,
    desc: [
      "With water on one side and lava on the other, it breaks out cobblestone and stone for as long as you like. Neither fluid gets used up, so the first bucket of lava is also the last.",
    ],
    tasks: [{ type: "item", id: "4BA8B69D840E07D5", item: "gtceu:lp_steam_rock_crusher" }],
    rewards: [{ type: "xp", id: "00D8E81A9DDF7BA9", xp: 25 }],
  },
  {
    key: "STEAM_STEAM_FORGE_HAMMER", id: "15187E005F30E142", title: "Steam Forge Hammer", icon: "gtceu:lp_steam_forge_hammer", size: 0.75, optional: true, deps: ["STEAM_STEAM_ROCK_CRUSHER"], x: 10, y: 3,
    desc: [
      "It gets more plates out of your ingots than the hand hammer, and it smashes cobblestone into gravel and gravel into sand. Put it behind the rock crusher and you never dig sand again.",
    ],
    tasks: [{ type: "item", id: "3E50605DD26A6BFC", item: "gtceu:lp_steam_forge_hammer" }],
    rewards: [{ type: "xp", id: "33ECC7FB7F419BC9", xp: 25 }],
  },
  {
    key: "STEAM_STEAM_MULTIS", id: "67124C424660DDAE", title: "Steam Multis", icon: "gtceu:steam_grinder", size: 0.75, optional: true, deps: ["STEAM_STEAM_MACERATOR"], x: 10, y: -3,
    desc: [
      "The &6Steam Grinder&r and &6Steam Oven&r are GregTech's macerator and furnace in multiblock form, working on several items per cycle from one steam hatch. Like the small macerator, the grinder skips the byproducts.",
      "It won't go to waste later, either: the large steam macerator is built around a grinder.",
    ],
    tasks: [{ type: "item", id: "430BBAA23DA7FB8D", item: "gtceu:steam_grinder", raw: { optional_task: "true" } }, { type: "item", id: "733A302F2C306579", item: "gtceu:steam_oven", raw: { optional_task: "true" } }],
    rewards: [{ type: "xp", id: "5F282F1DCDBBE785", xp: 30 }],
  },
  {
    key: "STEAM_FIREBRICKS", id: "7E4FF9E6FF9F495C", title: "Firebricks", icon: "gtceu:firebricks", deps: ["STEAM_STEAM_COMPRESSOR","STEAM_STEAM_MACERATOR"], x: 10, y: 0,
    desc: [
      "The primitive blast furnace runs hot enough to ruin ordinary bricks. Firebricks can take it. They start as ground clay and brick, and the compressor and a furnace do the rest.",
    ],
    tasks: [{ type: "item", id: "0042B4B912A67298", item: "gtceu:clay_dust" }, { type: "item", id: "745EA8BD32C82370", item: "gtceu:brick_dust" }, { type: "item", id: "596503EAECB53F55", item: "gtceu:fireclay_dust" }, { type: "item", id: "058E00150C410DCB", item: "gtceu:compressed_fireclay" }, { type: "item", id: "05EE67E923A1F3C0", item: "gtceu:firebrick" }, { type: "item", id: "30FE470093309B75", item: "gtceu:firebricks", count: 32 }],
    rewards: [{ type: "xp", id: "6162F57F24166A2C", xp: 30 }],
  },
  {
    key: "STEAM_WROUGHT_IRON", id: "2985D1F260EE851E", title: "Wrought Iron", icon: "gtceu:wrought_iron_ingot", deps: ["STEAM_STEAM_COMPRESSOR"], x: 10, y: 1.5,
    desc: [
      "Smelt iron nuggets and they come out as wrought iron nuggets. It surprises everyone the first time. The compressor packs them into ingots, and those turn into steel faster than plain iron. LV hulls wear its plates, too.",
    ],
    tasks: [{ type: "item", id: "44EC529548F6EB36", item: "gtceu:wrought_iron_nugget" }, { type: "item", id: "4086942D4962E24A", item: "gtceu:wrought_iron_ingot" }],
    rewards: [{ type: "xp", id: "77068FD9291EF2AB", xp: 20 }],
  },
  {
    key: "STEAM_PRIMITIVE_BLAST_FURNACE", id: "376295DE4FA3B31E", title: "Primitive Blast Furnace", icon: "gtceu:primitive_blast_furnace", deps: ["STEAM_FIREBRICKS"], x: 12, y: 0,
    desc: [
      "Iron and coke, or coal, make steel in here, slowly. Wrought iron speeds it up. When one furnace can't keep up, build the next against it; they're happy to share a wall.",
    ],
    tasks: [{ type: "item", id: "74759AA68CA79F1D", item: "gtceu:primitive_blast_furnace" }],
    rewards: [{ type: "xp", id: "2C462FC0FC9B6EA1", xp: 35 }],
  },
  {
    key: "STEAM_STEAM_BLAST_FURNACE", id: "4B8E2D6A1F9C3057", title: "Steam Blast Furnace",     icon: "gtceu:steam_blast_furnace", kind: "machine", deps: ["STEAM_PRIMITIVE_BLAST_FURNACE"], x: 12, y: 1.5,
        teach: {
          for: "The fast, scalable steel route: what you feed it picks the mode, sinter into pig iron, pig iron into steel.",
          needs: "Bricks, steel, coke, and calcite from the lapis vein.",
          unlocks: "Pig iron and Bessemer steel, at a pace the primitive furnaces cannot match.",
          automate: "Sinter, pig iron, coke and calcite by conveyor, steam from the boiler hall.",
        },
        desc: [
          "The primitive furnace keeps its slow route from ingots, but this one is the line you scale up. The next four quests follow the iron from the washer to the steel.",
        ],
    tasks: [{ type: "item", id: "7C1A4E9D2B6F3081", item: "gtceu:steam_blast_furnace" }],
    rewards: [{ type: "xp", id: "5D9B3F7A1C2E6048", xp: 40 }],
  },
  {
    key: "STEAM_IRON_WASHING", id: "3A5C7E1B9D204F68", title: "Washed Iron Ore", icon: "gtceu:purified_hematite_ore", kind: "process", deps: ["STEAM_PRIMITIVE_BLAST_FURNACE","STEAM_STEAM_ALLOY_SMELTER"], x: 14, y: -1.5,
    teach: {
      for: "Iron ore is ground and washed first, so the sinter plant gets clean feed.",
      needs: "Iron ore from the drill, the steam macerator and an ore washer.",
      unlocks: "Purified ore for the sinter plant.",
      automate: "Drill, macerator and washer in a row on one conveyor.",
    },
    desc: [
      "Hematite, goethite or magnetite all work. The steam alloy smelter, one quest back, takes the washed ore on to sinter.",
    ],
    tasks: [{ type: "item", id: "4B6D8F2C0E315A79", item: "gtceu:purified_hematite_ore" }],
    rewards: [{ type: "xp", id: "5C7E9A3D1F4B2068", xp: 20 }],
  },
  {
    key: "STEAM_IRON_SINTER", id: "2C4E6A8B1D3F5079", title: "Iron Sinter", icon: "grindless:iron_sinter", kind: "process", deps: ["STEAM_IRON_WASHING"], x: 15.25, y: -1.5,
    teach: {
      for: "Fine ore won't survive a blast furnace, so it is baked into hard lumps first.",
      needs: "Purified iron ore and coke dust, in the steam alloy smelter.",
      unlocks: "Feed for the pig iron run.",
      automate: "Ore and coke dust by bus; sinter leaves by bus.",
    },
    desc: [
      "The steam alloy smelter presses four purified ore and one coke dust into four sinter. The blast furnace takes it from there.",
    ],
    tasks: [{ type: "item", id: "6D8F1B3A5C7E2094", item: "grindless:iron_sinter" }],
    rewards: [{ type: "xp", id: "7A9C1E3B5D2F4068", xp: 25 }],
  },
  {
    key: "STEAM_PIG_IRON", id: "1D3F5B7A9C2E4086", title: "Pig Iron", icon: "grindless:pig_iron", kind: "process", deps: ["STEAM_IRON_SINTER"], x: 16.5, y: -1.5,
    teach: {
      for: "Sinter smelted with coke gives brittle, carbon-heavy iron, the stuff steel is made from.",
      needs: "Sinter, coke and calcite, and steam for the blast furnace.",
      unlocks: "Bessemer steel.",
      automate: "Run the same furnace in a loop, or give pig iron its own; the input picks the mode.",
    },
    desc: [
      "The ash it leaves behind has a use later on, so keep it.",
    ],
    tasks: [{ type: "item", id: "0E2A4C6B8D1F3597", item: "grindless:pig_iron" }],
    rewards: [{ type: "xp", id: "6F1B3D5A7C9E2048", xp: 25 }],
  },
  {
    key: "STEAM_BESSEMER_STEEL", id: "4F6A8C1B3D5E7092", title: "Bessemer Steel", icon: "gtceu:steel_ingot", kind: "process", deps: ["STEAM_PIG_IRON"], x: 17.75, y: -1.5,
    teach: {
      for: "Blowing air through molten pig iron burns the carbon out and leaves steel.",
      needs: "Pig iron and steam, in the same steam blast furnace.",
      unlocks: "Every steel recipe from here on.",
      automate: "Pig iron in by bus, ingots out by bus, steam from the boiler hall.",
    },
    desc: [
      "Pig iron is the fast route to steel; the primitive blast furnace still makes it slowly from ingots.",
    ],
    tasks: [{ type: "item", id: "5A7C9E1B3D2F4086", item: "gtceu:steel_ingot" }],
    rewards: [{ type: "xp", id: "1B3D5F7A9C2E4068", xp: 30 }],
  },
  {
    key: "STEAM_CLOCKWORK_OBSERVATORY", id: "1253203E620BE055", title: "Clockwork Observatory",     icon: "gtceu:steam_observatory", kind: "machine", deps: ["STEAM_STEAM_MULTIS"], x: 12, y: -3,
        teach: {
          for: "It charts the Moon, one night at a time.",
          needs: "Bronze, glass and a clear sky, the controller at Y 100 or higher.",
          unlocks: "The lunar chart the optical observatory reads in LV.",
          automate: "Steam by pipe; it runs itself every clear night.",
        },
        desc: [
          "Through the eyepiece the Moon shows dark seas and bright highlands. Above the haze of your coke ovens is the place to stand.",
        ],
    tasks: [{ type: "item", id: "2E8C5A1F9D4B7036", item: "gtceu:steam_observatory" }],
    rewards: [{ type: "xp", id: "1F6D3B9E4A2C8075", xp: 45 }],
  },
  {
    key: "STEAM_LUNAR_CHART_DRAFT", id: "10F6A7BFB476944C", title: "Lunar Chart (Draft)", icon: "grindless:lunar_chart_draft", deps: ["STEAM_CLOCKWORK_OBSERVATORY"], x: 14, y: -3,
    desc: [
      "Your first map of the Moon, drawn by hand at the eyepiece. Hold on to it: the optical observatory in LV reads it on every run and never uses it up. If you ever want a second one, a copy is cheap.",
    ],
    tasks: [{ type: "item", id: "3B9E6D2F8A1C4057", item: "grindless:lunar_chart_draft" }],
    rewards: [{ type: "xp", id: "6E2A8C4F1D9B3072", xp: 45 }],
  },
  {
    key: "STEAM_STEEL", id: "33AF6A368B3587E0", title: "Steel", icon: "gtceu:steel_ingot", deps: ["STEAM_PRIMITIVE_BLAST_FURNACE"], x: 14, y: 0,
    desc: [
      "Steel goes into the high-pressure steam machines, the casting molds and the steel drill bit, and it stays in your recipes from then on. The Bessemer run feeds this stack; leave it going and let the ingots pile up.",
    ],
    tasks: [{ type: "item", id: "2CA3C60C99A47B84", item: "gtceu:steel_ingot", count: 16 }],
    rewards: [{ type: "xp", id: "57EE27EA8875AE38", xp: 40 }],
  },
  {
    key: "STEAM_CASTING_MOLDS", id: "6D95C40FFB75ABEB", title: "Casting Molds", icon: "gtceu:plate_casting_mold", deps: ["STEAM_STEEL"], x: 16, y: 0,
    desc: [
      "Molds turn the alloy smelter into a caster. The block mold makes glass, the plate mold rubber sheets and the ball mold glass tubes.",
      "They all start as the same empty steel mold, and where the hammer sits next to it in the grid picks the shape.",
    ],
    tasks: [{ type: "item", id: "55F67293B20529C3", item: "gtceu:empty_mold" }, { type: "item", id: "05FBB202FAB1D73D", item: "gtceu:block_casting_mold" }, { type: "item", id: "4F220D6CFE4C1956", item: "gtceu:plate_casting_mold" }, { type: "item", id: "0E1D8ED73159C325", item: "gtceu:ball_casting_mold" }],
    rewards: [{ type: "xp", id: "71A316942CE7B93D", xp: 30 }],
  },
  {
    key: "STEAM_GLASS", id: "64A0425E87F233F6", title: "Glass", icon: "minecraft:glass", deps: ["STEAM_CASTING_MOLDS"], x: 18, y: 0,
    desc: [
      "Sand smelts into glass in a furnace as in vanilla. The long way round, through quartz sand and glass dust cast with the block mold in the alloy smelter, also works and scales to machines.",
      "Worth it, because the extractor, the vein probe and the greenhouse all want glass.",
    ],
    tasks: [{ type: "item", id: "018B744EC3166BF6", item: "gtceu:quartz_sand_dust" }, { type: "item", id: "573CDB7EADF7589F", item: "gtceu:glass_dust" }, { type: "item", id: "21A61C6D87C21AE2", item: "minecraft:glass" }],
    rewards: [{ type: "item", id: "47736A6945ECE04C", item: "minecraft:glass", count: 4 }],
  },
  {
    key: "STEAM_STEAM_EXTRACTOR", id: "64373EE5BFA62739", title: "Steam Extractor", icon: "gtceu:lp_steam_extractor", deps: ["STEAM_GLASS"], x: 20, y: 0,
    desc: [
      "Squeezes sticky resin into raw rubber pulp. Rubber logs and saplings work too, only slower. Rubber also wants sulfur, and that's a trip.",
    ],
    tasks: [{ type: "item", id: "234AE2D4FC820309", item: "gtceu:lp_steam_extractor" }],
    rewards: [{ type: "xp", id: "29189781B581B2F3", xp: 25 }],
  },
  {
    key: "STEAM_SULFUR_FROM_THE_NETHER", id: "221A824594716C2E", title: "Sulfur from the Nether", icon: "gtceu:sulfur_dust", deps: ["STEAM_STEAM_EXTRACTOR"], x: 22, y: 0,
    desc: [
      "This early, the only sulfur is sulfur ore in the Nether. Craft a flint and steel as in vanilla: light a portal, grab some ore and smelt it into dust.",
      "Bring back extra. At home, sulfur comes out of the realgar in the copper-tin vein, once you have a centrifuge to split it.",
    ],
    tasks: [{ type: "item", id: "20696957C9820316", item: "gtceu:sulfur_dust" }],
    rewards: [{ type: "xp", id: "4DA6B3951C5CCE1C", xp: 30 }],
  },
  {
    key: "STEAM_RUBBER_SHEETS", id: "61E429627580A285", title: "Rubber Sheets", icon: "gtceu:rubber_plate", deps: ["STEAM_SULFUR_FROM_THE_NETHER"], x: 24, y: 0,
    desc: [
      "The alloy smelter turns raw rubber pulp and sulfur into rubber ingots, and the plate mold presses those into sheets.",
      "Wrap a wire in a sheet and you have a cable. Tin cable carries LV power, and the hull and the turbine both want some.",
    ],
    tasks: [{ type: "item", id: "4DD8562ADA32AC7D", item: "gtceu:raw_rubber_dust" }, { type: "item", id: "1FF0BFF4B9C41FFA", item: "gtceu:rubber_ingot" }, { type: "item", id: "737DC382A1303573", item: "gtceu:rubber_plate" }],
    rewards: [{ type: "xp", id: "411B97BDD0C19199", xp: 30 }],
  },
  {
    key: "STEAM_LV_MOTOR", id: "2AEFA5A96D5BA55D", title: "LV Motor", icon: "gtceu:lv_electric_motor", deps: ["STEAM_RUBBER_SHEETS"], x: 26, y: 1.5,
    desc: [
      "A magnetic iron rod wrapped in copper wire does most of the work in a motor. Most LV machines have one inside, and so does the turbine.",
    ],
    tasks: [{ type: "item", id: "3C266DF2A91AC483", item: "gtceu:magnetic_iron_rod" }, { type: "item", id: "6ED6C37428C7D4F3", item: "gtceu:lv_electric_motor" }],
    rewards: [{ type: "xp", id: "27376BB009545BF4", xp: 30 }],
  },
  {
    key: "STEAM_LV_MACHINE_HULL", id: "6862838CB35D8296", title: "LV Machine Hull", icon: "gtceu:lv_machine_hull", deps: ["STEAM_RUBBER_SHEETS"], x: 26, y: 0,
    desc: [
      "The empty box every LV machine starts from: a steel casing dressed in wrought iron plates and tin cable. You'll make a great many of these, so get comfortable.",
    ],
    tasks: [{ type: "item", id: "54307AB204FD89FD", item: "gtceu:lv_machine_hull" }],
    rewards: [{ type: "xp", id: "7E0CC46E3BF5F812", xp: 30 }],
  },
  {
    key: "STEAM_VACUUM_TUBES", id: "4A21D67EFA0E04C5", title: "Vacuum Tubes", icon: "gtceu:vacuum_tube", deps: ["STEAM_GLASS"], x: 18, y: 3,
    desc: [
      "The first electronics in the pack are glowing glass bottles. The glass tube comes out of the ball mold, and EMI has the rest of the &6Vacuum Tube&r.",
    ],
    tasks: [{ type: "item", id: "3ED99B517FBD6417", item: "gtceu:vacuum_tube", count: 2 }],
    rewards: [{ type: "xp", id: "6EDBD02B79B38D90", xp: 25 }],
  },
  {
    key: "STEAM_RESISTORS_AND_BOARDS", id: "1861D320C9F055D2",     title: "Resistors", icon: "gtceu:resistor", deps: ["STEAM_VACUUM_TUBES"], x: 20, y: 3,
    desc: [
          "Small parts that lean on sticky resin. It pays to have a rubber sapling in the greenhouse by now.",
    ],
        tasks: [{ type: "item", id: "2A14C6530C6DF63B", item: "gtceu:resistor", count: 2 }],
    rewards: [{ type: "xp", id: "0D7381C6AD892F5B", xp: 25 }],
  },
  {
        key: "STEAM_RESIN_BOARD", id: "3C5A7E1B9D204F68", title: "Resin Board", icon: "gtceu:resin_printed_circuit_board", kind: "circuit", deps: ["STEAM_RESISTORS_AND_BOARDS"], x: 22, y: 3,
        teach: {
          for: "The board every first circuit is soldered onto.",
          needs: "A wood plate from the compressor, sticky resin and copper foil.",
          unlocks: "The basic electronic circuit.",
          automate: "Greenhouse resin and compressor plates, one assembler line later.",
        },
        desc: [
          "A slab of pressed wood with ambitions.",
        ],
        tasks: [{ type: "item", id: "5702CAC6CB88D573", item: "gtceu:resin_printed_circuit_board" }],
        rewards: [{ type: "xp", id: "4E1B8D3A6C927F05", xp: 30 }],
      },
      {
        key: "STEAM_RED_ALLOY", id: "30D4DD1212DB31E0", title: "Red Alloy", icon: "gtceu:red_alloy_ingot", deps: ["STEAM_RESIN_BOARD"], x: 24, y: 3,
    desc: [
      "Copper and redstone melt together into red alloy in the alloy smelter. Hammer it into a plate, cut that into wire and wrap it like tin cable. The first circuits are wired with it.",
    ],
    tasks: [{ type: "item", id: "16CD5C26281202E7", item: "gtceu:red_alloy_ingot" }],
    rewards: [{ type: "xp", id: "56375B9B39F19228", xp: 25 }],
  },
  {
    key: "STEAM_LV_CIRCUIT", id: "59DE11D9BE2E0E47", title: "LV Circuit",     icon: "gtceu:basic_electronic_circuit", kind: "circuit", deps: ["STEAM_RED_ALLOY","STEAM_RUBBER_SHEETS"], x: 26, y: 3,
        teach: {
          for: "The first LV circuit, in nearly every LV machine and in the turbine.",
          needs: "A resin board, vacuum tubes, resistors and red alloy cable.",
          unlocks: "LV machines, and the circuit ladder above them.",
          automate: "Hand-assembled here; the LV circuit assembler takes it over.",
        },
        desc: [
          "All those small parts meet in the &6Basic Electronic Circuit&r.",
        ],
    tasks: [{ type: "item", id: "52E895BDF72B86AC", item: "gtceu:basic_electronic_circuit", count: 2 }],
    rewards: [{ type: "xp", id: "7E788BEAF5DACB6D", xp: 40 }],
  },
  {
    key: "STEAM_LARGE_BRONZE_BOILER", id: "36B68B4C2B1E0DBA", title: "Large Bronze Boiler", icon: "gtceu:bronze_large_boiler", optional: true, deps: ["STEAM_LV_CIRCUIT"], x: 28, y: 6,
    desc: [
      "A boiler the size of a shed, and its recipe asks for LV circuits, so it comes late. One out-steams a yard full of small boilers, and it burns creosote and biomass as well as coal.",
    ],
    tasks: [{ type: "item", id: "1128EA2A780C9E3B", item: "gtceu:bronze_large_boiler" }],
    rewards: [{ type: "xp", id: "47536037A0E7A152", xp: 35 }],
  },
  {
    key: "STEAM_LV_STEAM_TURBINE", id: "4996827E4BFC339E", title: "LV Steam Turbine", icon: "gtceu:lv_steam_turbine", kind: "exit", deps: ["STEAM_LV_MACHINE_HULL","STEAM_LV_MOTOR","STEAM_LV_CIRCUIT"], x: 28, y: 0,
    desc: [
      "Steam in, electricity out. The &6Basic Steam Turbine Generator&r runs off the boilers you already have, and like every generator here it gets twice the usual EU from its fuel.",
      "It's the first electricity on Earth. LV comes next, with electric machines and drills that reach into the Nether.",
    ],
    tasks: [{ type: "item", id: "1D440BC33682A584", item: "gtceu:lv_steam_turbine" }],
    rewards: [{ type: "xp", id: "7B0D5D25018EB656",     xp: 100 }],
  },
  {
    key: "STEAM_STEAM_GREENHOUSE", id: "1AFD1F4557C5DA80", title: "Steam Greenhouse",     icon: "gtceu:steam_greenhouse", kind: "machine", deps: ["STEAM_GLASS"], x: 22, y: -1.5,
        teach: {
          for: "It farms logs, sticky resin and crops while you are busy elsewhere.",
          needs: "Glass, bronze casing and a sapling or seed in the input bus.",
          unlocks: "Wood and resin without a forest trip.",
          automate: "Output bus to a chest or conveyor; the sapling is never used up.",
        },
        desc: [
          "One with a rubber sapling in it ends your resin worries.",
        ],
        tasks: [{ type: "item", id: "681EBC183F437749", item: "gtceu:steam_greenhouse" }],
        rewards: [{ type: "xp", id: "21456737917678C3", xp: 50 }],
  },
  {
    key: "STEAM_EMPTY_VEIN_PROBE", id: "5DF70249D310BA55", title: "Empty Vein Probe", icon: "grindless:empty_vein_probe", deps: ["STEAM_GLASS"], x: 20, y: -3,
    desc: [
      "On its own it's a fancy bronze jar. It stays one until you bring home ore from a vein.",
    ],
    tasks: [{ type: "item", id: "46595CCD8118CE7A", item: "grindless:empty_vein_probe" }],
    rewards: [{ type: "xp", id: "45FD9A5114AE0F7F", xp: 25 }],
  },
  {
    key: "STEAM_VEIN_SAMPLE", id: "4B2FCEC042219588", title: "Vein Sample", icon: "grindless:vein_sample_copper_tin", deps: ["STEAM_EMPTY_VEIN_PROBE"], x: 22, y: -3,
    desc: [
      "A probe and raw ore from one vein make that vein's sample; EMI shows which ores each vein takes. The drill reads the sample and never uses it up, so one per vein lasts forever.",
    ],
    tasks: [{ type: "item", id: "4054C0EB5D1893FC", snbt: "{\n\ticon: \"grindless:vein_sample_copper_tin\"\n\tid: \"4054C0EB5D1893FC\"\n\titem: {\n\t\tCount: 1b\n\t\tid: \"itemfilters:tag\"\n\t\ttag: { value: \"grindless:vein_samples\" }\n\t}\n\ttitle: \"Any Vein Sample\"\n\ttype: \"item\"\n}" }],
    rewards: [{ type: "xp", id: "6200EA49FE45BD7E", xp: 25 }],
  },
  {
    key: "STEAM_DRILL_BITS", id: "54FC9D8B7F999601", title: "Drill Bits", icon: "grindless:bronze_drill_bit", deps: ["STEAM_EMPTY_VEIN_PROBE"], x: 22, y: -4.5,
    desc: [
      "Bronze, filed sharp. The drill grinds one down every so often. Keep spares in the input bus and it won't stall on you.",
    ],
    tasks: [{ type: "item", id: "66FEC38CDE525717", item: "grindless:bronze_drill_bit", count: 4 }],
    rewards: [{ type: "xp", id: "2F36C1C84B8AA4B0", xp: 20 }],
  },
  {
    key: "STEAM_STEAM_VEIN_DRILL", id: "103C07A78792B593", title: "Steam Vein Drill",     icon: "gtceu:steam_vein_drill", kind: "signature", deps: ["STEAM_VEIN_SAMPLE","STEAM_DRILL_BITS"], x: 24, y: -3,
        teach: {
          for: "It keeps one vein sending up raw ore for as long as steam lasts.",
          needs: "A vein sample, bronze drill bits and steam; your steam miner sits inside it.",
          unlocks: "Raw ore from the veins the Steam drill can reach, with no pickaxe. Deeper veins need a later drill.",
          automate: "Bits and steam fed by hatch, ore taken out by bus. One drill per vein.",
        },
        desc: [
          "This is the deal the pack runs on.",
        ],
    tasks: [{ type: "item", id: "04DEFD03BAF635AB", item: "gtceu:steam_vein_drill" }],
    rewards: [{ type: "xp", id: "01EFF2510A6E8A0D", xp: 60 }, { type: "item", id: "2DFE667772A0BD6B", item: "grindless:bronze_drill_bit", count: 2 }],
  },
  {
    key: "STEAM_STEEL_DRILL_BIT", id: "0634FBEA53408D40", title: "Steel Drill Bit", icon: "grindless:steel_drill_bit", size: 0.75, optional: true, deps: ["STEAM_DRILL_BITS"], x: 24, y: -4.5,
    desc: [
      "Lasts a lot longer than bronze. It's also the only bit that reaches the veins lying wholly below Y 0, which means diamond, redstone and mica.",
    ],
    tasks: [{ type: "item", id: "68B43926030627EA", item: "grindless:steel_drill_bit", count: 4 }],
    rewards: [{ type: "xp", id: "25ED67CFD166C808", xp: 20 }],
  },
  {
    key: "STEAM_NO_MORE_PICKAXE", id: "3557D15A5D2004C4", title: "No More Pickaxe", icon: "gtceu:steam_vein_drill", shape: "rsquare", size: 1.25, deps: ["STEAM_STEAM_VEIN_DRILL","STEAM_STEAM_GREENHOUSE"], x: 26, y: -1.5,
    desc: [
      "Ore comes from the drills now and wood from the greenhouses. You can hang the pickaxe on the wall; it had a good run.",
    ],
    tasks: [{ type: "checkmark", id: "59EBF6F3A0E28D4D" }],
    rewards: [{ type: "xp", id: "499C3B20D8C53E18", xp: 50 }, { type: "item", id: "21410F60279332F6", item: "minecraft:bread", count: 8 }],
  },
  {
    key: "STEAM_SMALL_STEAM_PLANTS", id: "325185F9C76235D6", title: "Small Steam Plants",     icon: "gtceu:steam_mixer", kind: "plant", optional: true, deps: ["STEAM_STEAM_MACHINES"], x: 8, y: 4.5,
        teach: {
          for: "Small steam multiblocks that run several recipes at once from one steam hatch.",
          needs: "Bronze and steel casings, a steam hatch, and hand-made ULV hatches for the bath and washer.",
          unlocks: "Mixing, chemical bathing and ore washing before any electricity.",
          automate: "Steam by pipe, inputs and outputs by bus.",
        },
        desc: [
          "The mixer, bath and washer have no steam version at all, which makes them the point.",
        ],
    tasks: [{ type: "item", id: "7FDE1B5742620E3D", item: "gtceu:steam_mixer", raw: { optional_task: "true" } }, { type: "item", id: "76592CF23910A086", item: "gtceu:steam_compressor", raw: { optional_task: "true" } }, { type: "item", id: "63FADE8890C34B36", item: "gtceu:steam_alloy_smelter", raw: { optional_task: "true" } }, { type: "item", id: "62098CF31D3E9627", item: "gtceu:steam_forge_hammer", raw: { optional_task: "true" } }, { type: "item", id: "2F64EE349B042190", item: "gtceu:steam_chemical_bath", raw: { optional_task: "true" } }, { type: "item", id: "77BE0BB17FB1D30A", item: "gtceu:steam_ore_washer", raw: { optional_task: "true" } }],
    rewards: [{ type: "xp", id: "6BCC7552C07375CE",     xp: 40 }],
  },
  {
        key: "STEAM_LARGE_STEAM_PLANTS", id: "52D6BD0494A56791", title: "Large Steam Plants", icon: "gtceu:large_steam_macerator", kind: "plant", optional: true, deps: ["STEAM_STEEL"], x: 16, y: 4.5,
        teach: {
          for: "Big steel halls that run ore by the stack on steam and keep every byproduct.",
          needs: "Steel casings, a steam grinder or primitive pump inside, and ULV fluid hatches.",
          unlocks: "GregTech's full ore line before you have seen a volt.",
          automate: "Ore in by bus, steam by pipe, products onward by conveyor.",
        },
        desc: [
          "The centrifuge insists on its fluid hatches even for dry recipes.",
        ],
    tasks: [{ type: "item", id: "62538627EA89C8A4", item: "gtceu:large_steam_macerator", raw: { optional_task: "true" } }, { type: "item", id: "5920D0DDED303CFA", item: "gtceu:large_steam_centrifuge", raw: { optional_task: "true" } }, { type: "item", id: "7E94C78253DD1567", item: "gtceu:large_steam_thermal_centrifuge", raw: { optional_task: "true" } }, { type: "item", id: "63F121276C05604F", item: "gtceu:large_steam_chemical_bath", raw: { optional_task: "true" } }, { type: "item", id: "1BB28F8EF6908B4F", item: "gtceu:large_steam_ore_washer", raw: { optional_task: "true" } }],
    rewards: [{ type: "xp", id: "58E1F78F6D22AA8D",     xp: 60 }],
  },
  {
    key: "STEAM_CHARCOAL_PILE_IGNITER", title: "Charcoal Pile", icon: "gtceu:charcoal_pile_igniter", kind: "machine", deps: ["STEAM_STEAM_AGE"], x: 2, y: -3,
    teach: {
      for: "Logs buried under dirt and lit by the &6Charcoal Pile Igniter&r burn slowly into charcoal, with no coal anywhere in sight.",
      needs: "The controller, bronze plates, flint and steel and iron rotors, and a heap of logs under earth.",
      unlocks: "Fuel before the first coke oven, and charcoal for steel later.",
      automate: "It needs a person to stack the logs, so let a steam miner or a tree farm feed the pile.",
    },
    desc: [],
    tasks: [{ type: "item", item: "gtceu:charcoal_pile_igniter" }],
    rewards: [{ type: "xp", xp: 20 }],
  },
  {
    key: "STEAM_WOODEN_TANK", title: "Wooden Tank", icon: "gtceu:wooden_multiblock_tank", kind: "machine", deps: ["STEAM_LOW_PRESSURE_BOILER"], x: 4, y: 3,
    teach: {
      for: "A box of wooden walls around a &6Wooden Tank&r controller holds more water than any bucket chain will.",
      needs: "The controller, copper rings, wood walls and a crafting mallet.",
      unlocks: "A buffer that keeps the first boilers drinking.",
      automate: "Pump into the tank and draw from it with a pipe.",
    },
    desc: [],
    tasks: [{ type: "item", item: "gtceu:wooden_multiblock_tank" }],
    rewards: [{ type: "xp", xp: 20 }],
  },
  {
    key: "STEAM_BRONZE_TANK", title: "Bronze Tank", icon: "gtceu:bronze_multiblock_tank", kind: "machine", deps: ["STEAM_WOODEN_TANK"], x: 6, y: 3,
    teach: {
      for: "The &6Bronze Tank&r is the same idea in metal. It holds steam and hot fluids the wooden one would burn.",
      needs: "The controller, bronze rings, steam machine casing and a crafting hammer.",
      unlocks: "Storage for steam and for fluids that are too hot for wood.",
      automate: "Pipe it in and out like any tank.",
    },
    desc: [],
    tasks: [{ type: "item", item: "gtceu:bronze_multiblock_tank" }],
    rewards: [{ type: "xp", xp: 20 }],
  },
];

    export const LINKS = [
      { key: "STEAM_L_HORIZON_COLLECTOR", ref: "X:5C562BD093CBA553", x: 0, y: -1.5 },
    ];
