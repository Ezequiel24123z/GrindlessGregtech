// Quest data for iv_age; tools/quests/gen-chapters.mjs writes the chapter. Imported from the hand-written chapter by tools/quests/lib/import-snbt.mjs (RF-5L2): every id is spelled out.

export const CHAPTER = {
  id: "10A73E7D249CDD67",
  order: 0,
  icon: "gtceu:fission_reactor",
  autofocus: "IV_INNER_PLANETS",
  title: "IV: Inner Planets",
  subtitle: ["Split the atom at home, then go where it's hot: Venus for naquadah, Mercury for iridium and osmium."],
};

export const QUESTS = [
  {
    key: "IV_INNER_PLANETS", id: "3FB9EA4152DCD1D3", title: "Inner Planets", icon: "gtceu:iv_machine_hull", shape: "rsquare", size: 1.5, deps: ["X:7AF6FD3F4F3B06B4"], x: 0, y: 0,
    desc: [
      "From the far side of the Moon, the antenna can just make out Mercury in the Sun's glare and Venus under its clouds, and you're going to both. First, though, the atom: uranium from the End, a hot cell and a reactor that burns nothing.",
      "IV hatches wait for Mercury's iridium, and until then two EV energy hatches run any IV multiblock.",
    ],
    tasks: [{ type: "checkmark", id: "57DEFEB8476D0C21" }],
    rewards: [{ type: "xp", id: "7044ED917D669557", xp: 50 }],
  },
  {
    key: "IV_FLUORITE_VEIN", id: "5C008907C9055459", title: "Fluorite Vein", icon: "grindless:vein_sample_fluorite", deps: ["IV_INNER_PLANETS"], x: 2, y: -1.5,
    desc: [
      "There's a new Overworld vein of fluorite, barite, galena and sphalerite, and it only grows in freshly generated chunks. Time to go somewhere you've never been.",
      "Raw fluorite and raw barite make a &6Fluorite Vein Sample&r, and any vein drill takes it, steam ones included.",
    ],
    tasks: [{ type: "item", id: "5E187BE14C983E81", item: "grindless:vein_sample_fluorite" }, { type: "item", id: "77F69ECE1ABFC4AE", item: "gcyr:raw_fluorite", count: 16 }],
    rewards: [{ type: "xp", id: "7B9F1E328EB5EE2F", xp: 40 }, { type: "item", id: "3F7CDDC11E9E812C", item: "gcyr:raw_fluorite", count: 8 }],
  },
  {
    key: "IV_FLUORSPAR_KILN", id: "5EE3EB2547415591", title: "Fluorspar Kiln", icon: "gtceu:fluorspar_kiln", shape: "gear", size: 1.25, deps: ["IV_FLUORITE_VEIN"], x: 4, y: -1.5,
    desc: [
      "Fluorite and sulfuric acid go in at the cold end of the &6Fluorspar Kiln&r, and hydrofluoric acid comes out of the scrubber at the hot one. That's the fluorine for enrichment, and nobody grinds a mountain of mica for it.",
      "It runs lots of charges at once instead of overclocking, and its gypsum goes into concrete.",
    ],
    tasks: [{ type: "item", id: "15DE13E4D77E3653", item: "gtceu:fluorspar_kiln" }, { type: "item", id: "3CF6C2C31D340263", item: "gtceu:hydrofluoric_acid_bucket" }],
    rewards: [{ type: "xp", id: "51B3F0619D171EC0", xp: 80 }, { type: "item", id: "794706880191B58A", item: "gcyr:fluorite_dust", count: 6 }],
  },
  {
    key: "IV_PITCHBLENDE", id: "77B6F588980A4B1C", title: "Pitchblende", icon: "grindless:vein_sample_pitchblende_end", deps: ["IV_INNER_PLANETS"], x: 2, y: -3,
    desc: [
      "The End's pitchblende vein has been there all along, and no drill will touch it: you're going to dissolve the uranium right out of the rock.",
      "Its raw pitchblende and raw uraninite make an &6End Pitchblende Vein Sample&r.",
    ],
    tasks: [{ type: "item", id: "7D0E205645D080F6", item: "grindless:vein_sample_pitchblende_end" }],
    rewards: [{ type: "xp", id: "70655102B05149BB", xp: 40 }],
  },
  {
    key: "IV_IN_SITU_LEACH_FIELD", id: "5FD0B9548159D199", title: "In-Situ Leach Field", icon: "gtceu:isr_wellfield", shape: "gear", size: 1.25, deps: ["IV_PITCHBLENDE"], x: 4, y: -3,
    desc: [
      "Four wells push acid into the rock, one pulls the uranium back up, and resin in the header house catches it. The &6In-Situ Leach Field&r only works in the End, and you do dig the five wells yourself.",
      "The sample is never used up, the resin wears slowly, and the odd bit of radioactive waste goes into storage, not a chest by the door.",
    ],
    tasks: [{ type: "item", id: "3F9C133862854E97", item: "grindless:ion_exchange_resin", count: 4 }, { type: "item", id: "743B9F4AD256F24B", item: "gtceu:isr_wellfield" }, { type: "item", id: "7DAF0BEA5BE61AD0", item: "gtceu:uraninite_dust", count: 30 }],
    rewards: [{ type: "xp", id: "1845E73B52D4284A", xp: 80 }, { type: "item", id: "72A3FD84380B88BE", item: "grindless:ion_exchange_resin", count: 2 }],
  },
  {
    key: "IV_RADIATION_PROOF_CASING", id: "5BDF50007C1EAFE2", title: "Radiation-Proof Casing", icon: "gtnn:radiation_proof_machine_casing", deps: ["IV_INNER_PLANETS"], x: 2, y: 0,
    desc: [
      "Both the hot cell and the reactor hide behind &6Radiation-Proof Machine Casing&r, lead-heavy blocks out of the IV assembler. They're set in concrete, and clay concrete does fine until the kiln's gypsum turns up.",
    ],
    tasks: [{ type: "item", id: "70F4496C01D4AED9", item: "gtnn:radiation_proof_machine_casing", count: 54 }],
    rewards: [{ type: "xp", id: "7503D049BFB5C02C", xp: 40 }],
  },
  {
    key: "IV_HOT_CELL", id: "30D78F6EB49AF27B", title: "Hot Cell", icon: "gtceu:hot_cell", shape: "gear", size: 1.25, deps: ["IV_RADIATION_PROOF_CASING"], x: 4, y: 0,
    desc: [
      "The &6Hot Cell&r is where uranium stops being something you carry around. It rides in and out on buses, the programmed circuit picks the job, and the tongs behind the lead-glass windows do the touching.",
    ],
    tasks: [{ type: "item", id: "3E606383198DBAB6", item: "gtceu:hot_cell" }],
    rewards: [{ type: "xp", id: "5FE2E31B75F05904", xp: 100 }],
  },
  {
    key: "IV_ENRICHMENT", id: "174353B4F6C61A79", title: "Enrichment", icon: "gtceu:uranium_235_dust", deps: ["IV_HOT_CELL","IV_FLUORSPAR_KILN","IV_IN_SITU_LEACH_FIELD"], x: 6, y: 0,
    desc: [
      "Circuit 1 turns uraninite and hydrofluoric acid into &6Uranium 235&r and a pile of uranium 238. Keep the 238: the pellets, the radon and later MOX all want it.",
      "The hexafluoride never leaves the cell, and the fluorine comes back out as gas.",
    ],
    tasks: [{ type: "item", id: "54EE2919EBE407C9", item: "gtceu:uranium_235_dust" }, { type: "item", id: "77DB1A0B29910D9C", item: "gtceu:uranium_dust" }],
    rewards: [{ type: "xp", id: "31A78D220008DAFC", xp: 60 }],
  },
  {
    key: "IV_QUANTUM_STAR", id: "7136B78C360303F9", title: "Quantum Star", icon: "gtceu:quantum_star", deps: ["IV_ENRICHMENT","X:73D14393C00DE14D"], x: 8, y: 0,
    desc: [
      "Circuit 4 blows air over uranium 238 for radon, and unlike GregTech's own recipe it needs no plutonium. A Nether Star soaked in radon in the chemical bath becomes a &6Quantum Star&r, and an Ender Eye becomes the Quantum Eye that EV sensors, emitters and scanners have been waiting for.",
      "That stack from the simulator's Withers finally has a job.",
    ],
    tasks: [{ type: "item", id: "796CE71547E2EE7D", item: "gtceu:radon_bucket" }, { type: "item", id: "5D7EAB9D77291432", item: "gtceu:quantum_eye" }, { type: "item", id: "34220B07D73EBF63", item: "gtceu:quantum_star" }],
    rewards: [{ type: "xp", id: "76D5B425BB45E0F2", xp: 60 }],
  },
  {
    key: "IV_FISSION_REACTOR", id: "774234968F1BEB95", title: "Fission Reactor", icon: "gtceu:fission_reactor", shape: "gear", size: 1.5, deps: ["IV_QUANTUM_STAR","X:72022B0ECDC3668B"], x: 10, y: 0,
    desc: [
      "The &6Fission Reactor&r runs uranium in four channels, with water through the core and a turbine hall out front, and it burns nothing. If the water or the room for spent fuel runs out, it shuts down instead of melting.",
      "Its controller wants an IV field generator: a Quantum Star and samarium wire from Mars, which only melts in a blast furnace with HSS-G coils.",
    ],
    tasks: [{ type: "item", id: "5B8B6955385CCA84", item: "gtceu:iv_field_generator" }, { type: "item", id: "314CE8A31C2B2D45", item: "gtceu:fission_reactor" }],
    rewards: [{ type: "xp", id: "7191AFDE0ABC670A", xp: 150 }, { type: "item", id: "336827B61BB005C1", item: "gtceu:light_concrete", count: 16 }],
  },
  {
    key: "IV_FUEL_FABRICATION_PLANT", id: "77A25AB4BB859C79", title: "Fuel Fabrication Plant", icon: "gtceu:fuel_fabrication_plant", shape: "gear", size: 1.25, deps: ["IV_ENRICHMENT"], x: 8, y: -1.5,
    desc: [
      "Real nuclear fuel is pellets in metal tubes, pressed, sintered and sealed with helium. The &6Fuel Fabrication Plant&r does the whole line, and the circuit picks the step.",
      "You'll build it around an IV assembler, so maybe make two of those.",
    ],
    tasks: [{ type: "item", id: "135CC8040C8DB996", item: "gtceu:fuel_fabrication_plant" }],
    rewards: [{ type: "xp", id: "1E5C7EB0C7637A72", xp: 80 }],
  },
  {
    key: "IV_LEU_FUEL", id: "77E9A2979A7161D3", title: "LEU Fuel", icon: "grindless:leu_fuel_assembly", deps: ["IV_FUEL_FABRICATION_PLANT","mv:MV_END_VEINS"], x: 10, y: -1.5,
    desc: [
      "An &6LEU Fuel Assembly&r is enriched uranium pressed into pellets and sealed in Zircaloy tubes with a breath of helium. The zirconium comes from the End's zircon, with a pinch of tin.",
      "The sintering wants hydrogen in a hatch, but it never uses any up.",
    ],
    tasks: [{ type: "item", id: "1DE73D3441521EAC", item: "grindless:leu_pellet" }, { type: "item", id: "1C78223D64859AE3", item: "grindless:zircaloy_cladding_tube" }, { type: "item", id: "15DCE7EEEBD913CC", item: "grindless:leu_fuel_assembly" }],
    rewards: [{ type: "xp", id: "54040CCC26849B75", xp: 60 }],
  },
  {
    key: "IV_FIRST_CRITICALITY", id: "72139ED6F4E46D37", title: "First Criticality", icon: "gtceu:ev_energy_output_hatch_16a", deps: ["IV_FISSION_REACTOR","IV_LEU_FUEL"], x: 12, y: 0,
    desc: [
      "Load an LEU assembly with circuit 1, give it water, and the reactor wakes up. Each assembly in the bus runs another channel, up to four, as long as the dynamo hatches can carry them.",
      "IV dynamo hatches need Mercury's iridium, and until then the &6EV 16A Dynamo Hatch&r is the biggest you can give it.",
    ],
    tasks: [{ type: "item", id: "372DFA502C128D18", item: "gtceu:ev_energy_output_hatch_16a" }],
    rewards: [{ type: "xp", id: "165CFE01A1667E2A", xp: 100 }],
  },
  {
    key: "IV_REPROCESSING", id: "7E266AE6DB3351F7", title: "Reprocessing", icon: "gtceu:plutonium_dust", deps: ["IV_FIRST_CRITICALITY"], x: 14, y: -1.5,
    desc: [
      "An assembly lasts a good long while, then comes out spent, still holding uranium and the plutonium it bred. The hot cell's circuit 3 dissolves it in nitric acid and hands back the uranium and the &6Plutonium&r.",
      "The waste is glassed and kept, and the fumes go back to making nitric acid.",
    ],
    tasks: [{ type: "item", id: "5EF89FF57108D2FB", item: "grindless:spent_fuel_assembly" }, { type: "item", id: "72A355DB71F7B4F7", item: "gtceu:plutonium_dust" }],
    rewards: [{ type: "xp", id: "55D892B85E698FA5", xp: 60 }],
  },
  {
    key: "IV_MOX_FUEL", id: "16CAD9CBBF3B46D9", title: "MOX Fuel", icon: "grindless:mox_fuel_assembly", size: 0.75, optional: true, deps: ["IV_REPROCESSING"], x: 16, y: -3,
    desc: [
      "Plutonium and uranium 238 in Zircaloy tubes make a &6MOX Fuel Assembly&r, which the reactor burns in heavy water on circuit 3.",
      "A breeder assembly on circuit 4 gives less power but hands back more plutonium than it took.",
    ],
    tasks: [{ type: "item", id: "5764F970966E4FAE", item: "grindless:mox_fuel_assembly" }],
    rewards: [{ type: "xp", id: "3BAB6E4A8186641F", xp: 40 }],
  },
  {
    key: "IV_RTG_PELLETS", id: "1D931CB1451E8B5A", title: "RTG Pellets", icon: "grindless:rtg_pellet", deps: ["IV_REPROCESSING"], x: 16, y: -1.5,
    desc: [
      "Plutonium oxide sealed in platinum and rhodium foil stays warm all on its own. The hot cell's circuit 2 makes an &6RTG Pellet&r, about as close to a pocket sun as GregTech will let you get.",
    ],
    tasks: [{ type: "item", id: "76AAE02263EB02CB", item: "grindless:rtg_pellet" }],
    rewards: [{ type: "xp", id: "1AAE161648DE4215", xp: 40 }],
  },
  {
    key: "IV_RTG_CELL", id: "503863FFACA225A8", title: "RTG Cell", icon: "gtceu:ev_rtg", deps: ["IV_RTG_PELLETS"], x: 18, y: -1.5,
    desc: [
      "The &6RTG Cell&r is a pellet behind lead with a thermopile and some fins, and it works on every world, day and night, because it burns nothing.",
      "Each pellet lasts about an hour of running, and its EV power starts the first bases on Venus and Mercury.",
    ],
    tasks: [{ type: "item", id: "74D514BC27E28AF3", item: "gtceu:ev_rtg" }],
    rewards: [{ type: "xp", id: "125CEA08554D895E", xp: 60 }, { type: "item", id: "53F03289B7802D20", item: "grindless:rtg_pellet" }],
  },
  {
    key: "IV_HEAVY_WATER_PLANT", id: "5A1DBDF9E739CEF2", title: "Heavy-Water Plant", icon: "gtceu:heavy_water_plant", shape: "gear", size: 1.25, deps: ["IV_FIRST_CRITICALITY"], x: 12, y: 1.5,
    desc: [
      "The &6Heavy-Water Plant&r squeezes heavy water out of Martian ice with two towers and a hydrogen sulfide loop. In the cold tower deuterium slips from the gas into the water; in the hot one it slips back out.",
      "Its controller is built around a distillation tower.",
    ],
    tasks: [{ type: "item", id: "39600F8879724225", item: "gtceu:heavy_water_plant" }],
    rewards: [{ type: "xp", id: "58E46537278E0B36", xp: 80 }],
  },
  {
    key: "IV_HEAVY_WATER", id: "3513B00E50D7C58B", title: "Heavy Water", icon: "gtceu:heavy_water_bucket", deps: ["IV_HEAVY_WATER_PLANT","X:148A0854C671B0AC"], x: 14, y: 1.5,
    desc: [
      "Circuit 1 makes a concentrate from ice and steam, and circuit 2 finishes it into &6Heavy Water&r. The hydrogen sulfide sits in a hatch of its own and only circulates, so one fill lasts forever.",
      "Any steam works, and the combined-cycle plant and the hot strip mill have plenty they aren't allowed to throw away.",
    ],
    tasks: [{ type: "item", id: "3B84E2D84CA1A792", item: "gtceu:hydrogen_sulfide_bucket" }, { type: "item", id: "7A613D0C7A728F23", item: "gtceu:heavy_water_concentrate_bucket" }, { type: "item", id: "5AA8209BEA7FE401", item: "gtceu:heavy_water_bucket" }],
    rewards: [{ type: "xp", id: "1927F031E0113E2D", xp: 50 }],
  },
  {
    key: "IV_HEAVY_WATER_CORE", id: "373CBFB746FCAD51", title: "Heavy-Water Core", icon: "gtceu:tritiated_heavy_water_bucket", deps: ["IV_FIRST_CRITICALITY","IV_HEAVY_WATER"], x: 14, y: 0,
    desc: [
      "Heavy water slows neutrons without eating them, and on circuit 2 the same assembly gives twice the power. It comes out as &6Tritiated Heavy Water&r, and the reactor never vents it. Give it a tank.",
    ],
    tasks: [{ type: "item", id: "1A82047FD3D6215B", item: "gtceu:tritiated_heavy_water_bucket" }],
    rewards: [{ type: "xp", id: "5FB7091F09100089", xp: 60 }],
  },
  {
    key: "IV_DEUTERIUM", id: "1802C3DEADA12B33", title: "Deuterium", icon: "gtceu:deuterium_bucket", deps: ["IV_HEAVY_WATER"], x: 16, y: 1.5,
    desc: [
      "Heavy water in the electrolyzer splits into &6Deuterium&r and oxygen, the first deuterium since Earth ran out of it. The Moon's tritium facility wants a charge, and fusion will want the rest.",
    ],
    tasks: [{ type: "item", id: "1F57DEA61BE43132", item: "gtceu:deuterium_bucket" }],
    rewards: [{ type: "xp", id: "3134B8343CD4914B", xp: 40 }],
  },
  {
    key: "IV_TRITIUM_REMOVAL_FACILITY", id: "32FD8F32DC829A03", title: "Tritium Removal Facility", icon: "gtceu:tritium_removal_facility", shape: "gear", size: 1.25, deps: ["IV_HEAVY_WATER_CORE","X:79EE0C54F2D89358"], x: 16, y: 0,
    desc: [
      "On the Moon, a cold box between two exchange columns pulls the tritium out and hands the heavy water back for the reactor. The &6Tritium Removal Facility&r is built from a cryogenic plant controller, and its deuterium charge is never drained.",
      "Run it at night with every radiator open to the sky and it costs half.",
    ],
    tasks: [{ type: "item", id: "517C82990CE93DDE", item: "gtceu:tritium_removal_facility" }],
    rewards: [{ type: "xp", id: "1FB2D45849999215", xp: 80 }, { type: "item", id: "3D7C17422BC4EE30", item: "grindless:night_sky_radiator", count: 2 }],
  },
  {
    key: "IV_TRITIUM", id: "7FD8A4969E497C3A", title: "Tritium", icon: "gtceu:tritium_bucket", deps: ["IV_TRITIUM_REMOVAL_FACILITY","IV_DEUTERIUM"], x: 18, y: 1.5,
    desc: [
      "The only &6Tritium&r in the pack comes out of that cold box. Nothing uses it yet, but fusion will. Store every drop.",
    ],
    tasks: [{ type: "item", id: "1C954386BA730522", item: "gtceu:tritium_bucket" }],
    rewards: [{ type: "xp", id: "77B41281449353DE", xp: 50 }],
  },
  {
    key: "IV_INNER_PLANETS_CHART", id: "539716A235672461", title: "Inner Planets Chart", icon: "grindless:inner_planets_chart", deps: ["IV_TRITIUM_REMOVAL_FACILITY","X:319C39AD99B5E4A8"], x: 18, y: 0,
    desc: [
      "While you're on the Moon, give the antenna on the far side a second EV energy hatch, the same trick the tritium facility runs on. At night, with the Mars chart calibrating the dish, it writes the &6Inner Planets Chart&r onto a data stick.",
      "It's never used up, but copy it anyway: charts have a way of ending up in the wrong chest.",
    ],
    tasks: [{ type: "item", id: "319C2A03113D6CD4", item: "grindless:inner_planets_chart" }],
    rewards: [{ type: "xp", id: "1BFDF964AD6323E1", xp: 60 }, { type: "item", id: "15B37430C2F6B838", item: "gtceu:data_stick", count: 2 }],
  },
  {
    key: "IV_ELITE_ROCKET_THERMAL_SUIT", id: "5A378E5CFD8DFF82", title: "Elite Rocket, Thermal Suit", icon: "gcyr:elite_rocket_motor", deps: ["IV_INNER_PLANETS_CHART"], x: 20, y: 0,
    desc: [
      "Venus and Mercury want a level 3 rocket, and since GCYR averages the parts, one leftover advanced motor keeps you at level 2. The IV assembler makes the &6elite parts&r with the chart, and one trip takes two elite tanks.",
      "Each suit piece gets the thermal upgrade and a heat shielding fabric in a smithing table: do all four, unless you like warm knees.",
    ],
    tasks: [{ type: "item", id: "59C4E8109DDA23B7", item: "gcyr:elite_fuel_tank", count: 2 }, { type: "item", id: "7F07DE4F24210C8C", item: "gcyr:elite_rocket_motor", count: 6 }, { type: "item", id: "501C290545582F38", item: "gcyr:space_suit_thermal_upgrade_smithing_template", count: 4 }],
    rewards: [{ type: "xp", id: "3F155B6C3573CD88", xp: 100 }, { type: "item", id: "5131070CAECCD5E6", item: "gcyr:heat_shielding_fabric", count: 4 }],
  },
  {
    key: "IV_UNDER_THE_CLOUDS", id: "5693331C34A5A291", title: "Under the Clouds", icon: "gcyr:venus_rock", shape: "rsquare", size: 1.25, deps: ["IV_ELITE_ROCKET_THERMAL_SUIT"], x: 22, y: -3,
    desc: [
      "Ninety bar of carbon dioxide, clouds of sulfuric acid and ground hot enough to melt lead: lovely place. Nothing burns here, so land with an RTG cell or charged batteries.",
      "The cell puts out EV, which means an EV chemical reactor for the bridge seed; bring ender pearls, helium-3 and a waystone for the ride home too.",
    ],
    tasks: [{ type: "dimension", id: "1B08C454E7CC134D", dimension: "gcyr:venus" }],
    rewards: [{ type: "xp", id: "598ECBCF2FA7DA6D", xp: 150 }, { type: "item", id: "50BD5C3F1D9BFAA9", item: "grindless:empty_vein_probe", count: 3 }],
  },
  {
    key: "IV_VENUSIAN_REGOLITH", id: "1B1714A8E0124C58", title: "Venusian Regolith", icon: "gcyr:venusian_regolith", deps: ["IV_UNDER_THE_CLOUDS"], x: 24, y: -3,
    desc: [
      "&6Venusian Regolith&r is the ground every Venus machine stands on, and you won't find it anywhere else. It falls like sand, so build on something solid.",
      "Later the forge hammer crumbles Venus cobblestone into more, but only here.",
    ],
    tasks: [{ type: "item", id: "596F3C529886C579", item: "gcyr:venusian_regolith", count: 19 }],
    rewards: [{ type: "xp", id: "133FE0AF8961FB31", xp: 40 }],
  },
  {
    key: "IV_NAQUADAH_SAMPLE", id: "7FCCB79E1561AAAB", title: "Naquadah Sample", icon: "grindless:vein_sample_naquadah_venus", deps: ["IV_UNDER_THE_CLOUDS"], x: 24, y: -4.5,
    desc: [
      "Naquadah sits deep under Venus's lava seas, with some plutonium mixed in. Dig down for raw naquadah and raw plutonium and pack a &6Venusian Naquadah Vein Sample&r.",
    ],
    tasks: [{ type: "item", id: "18F9DC93F9BDF5C3", item: "grindless:vein_sample_naquadah_venus" }],
    rewards: [{ type: "xp", id: "7730DE7D03D0B700", xp: 40 }],
  },
  {
    key: "IV_A_SEED_FROM_VENUS", id: "71E4B392A6D559D9", title: "A Seed from Venus", icon: "grindless:venusian_quantum_seed", deps: ["IV_VENUSIAN_REGOLITH"], x: 26, y: -3,
    desc: [
      "Ender pearls and helium-3 from home, sealed under Venusian regolith in a chemical reactor, make a &6Venusian Quantum Seed&r, and only here. Blow it up with a singularity back home for the Venus bridge's pair.",
    ],
    tasks: [{ type: "item", id: "1DF1D6B18AE08DD7", item: "grindless:venusian_quantum_seed" }],
    rewards: [{ type: "xp", id: "7E71298B16603452", xp: 40 }, { type: "item", id: "34C3881E9E8041E3", item: "minecraft:ender_pearl", count: 2 }],
  },
  {
    key: "IV_PRESSURIZED_VEIN_DRILL", id: "7DCDEF4DEDB8B607", title: "Pressurized Vein Drill", icon: "gtceu:pressurized_vein_drill", shape: "gear", size: 1.25, deps: ["IV_NAQUADAH_SAMPLE","IV_VENUSIAN_REGOLITH","X:5107982325BE34B7"], x: 26, y: -4.5,
    desc: [
      "The &6Pressurized Vein Drill&r is an EV Tripod Drill rebuilt for ninety bar: a closed shaft, filters for the dust and water to carry off the heat. It works Venus's naquadah and Mars's three veins with tungsten steel bits from the IV lathe.",
      "On Venus each run drinks distilled water and breathes out steam.",
    ],
    tasks: [{ type: "item", id: "51D6EB89033354F6", item: "grindless:tungsten_steel_drill_bit", count: 16 }, { type: "item", id: "71EF6FA1EBA63FC4", item: "gtceu:pressurized_vein_drill" }],
    rewards: [{ type: "xp", id: "370D79787365186B", xp: 100 }, { type: "item", id: "31BC2448B8840575", item: "grindless:tungsten_steel_drill_bit", count: 8 }],
  },
  {
    key: "IV_RAW_NAQUADAH", id: "77FF1E1CF59D10BC", title: "Raw Naquadah", icon: "gtceu:raw_naquadah", deps: ["IV_PRESSURIZED_VEIN_DRILL"], x: 28, y: -4.5,
    desc: [
      "&6Raw Naquadah&r comes from the bottom of Venus and nowhere else, with a little plutonium on the side. The drill's steam can turn a turbine or just drift off.",
    ],
    tasks: [{ type: "item", id: "35E8AB7058621F59", item: "gtceu:raw_naquadah", count: 16 }],
    rewards: [{ type: "xp", id: "3C7F560E9EC76DC1", xp: 60 }],
  },
  {
    key: "IV_VENUS_ACID_WORKS", id: "534239273A7CA7FC", title: "Venus Acid Works", icon: "gtceu:venus_acid_works", shape: "gear", size: 1.25, deps: ["IV_UNDER_THE_CLOUDS","X:74BC8201D518D3BA"], x: 24, y: -6,
    desc: [
      "A gas collector above the cloud base, on circuit 5, fills up with the clouds' sulfuric acid. Crack it over a hot gauze of platinum and rhodium and the &6Venus Acid Works&r hands the base distilled water and oxygen.",
      "Circuit 1 lets the sulfur dioxide back into the sky; circuit 2 keeps it for chemistry at home.",
    ],
    tasks: [{ type: "item", id: "78F6293E80757FC6", item: "grindless:platinum_gauze", count: 2 }, { type: "item", id: "58A817B847B35354", item: "gtceu:venus_acid_works" }],
    rewards: [{ type: "xp", id: "7EBE82CACB764274", xp: 80 }, { type: "item", id: "382D38BE5080875A", item: "grindless:platinum_gauze" }],
  },
  {
    key: "IV_VENUS_HEAT_ENGINE", id: "5669D88DE37D633F", title: "Venus Heat Engine", icon: "gtceu:venus_heat_engine", shape: "gear", size: 1.25, deps: ["IV_VENUS_ACID_WORKS"], x: 26, y: -6,
    desc: [
      "No fuel burns here, but the ground itself is a furnace. A hot plate on it and a tall radiator up towards the clouds run the &6Venus Heat Engine&r on a trickle of the acid works' distilled water, and it's always noon on Venus.",
      "Its controller is built from a Heliostat Tower and a Large Steam Turbine.",
    ],
    tasks: [{ type: "item", id: "5DADD59814909BAF", item: "gtceu:venus_heat_engine" }],
    rewards: [{ type: "xp", id: "1CF501359EDFA396", xp: 80 }],
  },
  {
    key: "IV_NAQUADAH_OXIDE", id: "1FC3B4F64BD93361", title: "Naquadah Oxide", icon: "gtceu:naquadah_oxide_mixture_dust", deps: ["IV_RAW_NAQUADAH","mv:MV_ORE_PLANT"], x: 30, y: -4.5,
    desc: [
      "Raw naquadah goes through the ore plant like any other ore and comes out as &6Naquadah Oxide Mixture&r.",
      "A little of it comes out enriched. That's LuV's business; put it somewhere safe.",
    ],
    tasks: [{ type: "item", id: "30E4DFE74CCAEDAC", item: "gtceu:naquadah_oxide_mixture_dust" }],
    rewards: [{ type: "xp", id: "50C5908A6226199E", xp: 40 }, { type: "item", id: "18E824C749B352EE", item: "gtceu:antimony_trioxide_dust", count: 8 }],
  },
  {
    key: "IV_NAQUADAH_PLANT", id: "14C75CDBACADEE5A", title: "Naquadah Plant", icon: "gtceu:naquadah_plant", shape: "gear", size: 1.25, deps: ["IV_NAQUADAH_OXIDE"], x: 32, y: -4.5,
    desc: [
      "GT--'s activator only makes naquadah while its neutron energy sits in a narrow window; outside it, you get radioactive waste. The &6Naquadah Plant&r holds the window with a Pu-Be source from the hot cell's circuit 2 and brews its superacid inside.",
      "Like every IV machine before Mercury, it runs on two EV energy hatches.",
    ],
    tasks: [{ type: "item", id: "749F83A931E128B4", item: "grindless:pube_neutron_source" }, { type: "item", id: "300FFD2D1E285CD9", item: "gtceu:naquadah_plant" }],
    rewards: [{ type: "xp", id: "3D4EDBB58C38A878", xp: 100 }, { type: "item", id: "16F43F3CC5082D8F", item: "gtceu:inert_machine_casing", count: 16 }],
  },
  {
    key: "IV_NAQUADAH_DUST", id: "1D2410B18346F998", title: "Naquadah Dust", icon: "gtceu:naquadah_dust", deps: ["IV_NAQUADAH_PLANT"], x: 34, y: -4.5,
    desc: [
      "Fluoroantimonic acid, the strongest acid there is, gets made and used up inside the plant. What leaves is &6Naquadah Dust&r, plus titanium and gallium half the time, and that titanium is the one exception to the Moon's monopoly.",
    ],
    tasks: [{ type: "item", id: "1772EED53F883039", item: "gtceu:naquadah_dust" }],
    rewards: [{ type: "xp", id: "1498D6CCC48B6AEB", xp: 60 }],
  },
  {
    key: "IV_NAQUADAH_INGOT", id: "571EB64508F2FF8E", title: "Naquadah Ingot", icon: "gtceu:naquadah_ingot", deps: ["IV_NAQUADAH_DUST"], x: 36, y: -4.5,
    desc: [
      "Naquadah only melts in a blast furnace with HSS-G coils, and the hot ingot wants liquid helium in the vacuum freezer. The &6Naquadah Ingot&r is where the doped boule, the wafers and the UHPIC chips of LuV start.",
    ],
    tasks: [{ type: "item", id: "7633937EAF5ACE0A", item: "gtceu:naquadah_ingot" }],
    rewards: [{ type: "xp", id: "507504BBED5D8740", xp: 80 }],
  },
  {
    key: "IV_DAY_OF_FIRE", id: "55613604E4C62B5F", title: "Day of Fire", icon: "gcyr:mercury_rock", shape: "rsquare", size: 1.25, deps: ["IV_ELITE_ROCKET_THERMAL_SUIT"], x: 22, y: 0,
    desc: [
      "Mercury keeps Earth's clock: a scorching day and a cold, dark night. There's no air and nothing burns, and an RTG cell or charged batteries keep the first base going until the sun comes back.",
      "Bring a waystone and an empty vein probe.",
    ],
    tasks: [{ type: "dimension", id: "7C2DA5C2FEFD8389", dimension: "gcyr:mercury" }],
    rewards: [{ type: "xp", id: "32563D886A944AF9", xp: 150 }, { type: "item", id: "139E6A0FBAF99DA9", item: "grindless:empty_vein_probe", count: 3 }],
  },
  {
    key: "IV_HERMEAN_DUST", id: "5FEF4C258358DCEE", title: "Hermean Dust", icon: "gtceu:hermean_regolith_dust", deps: ["IV_DAY_OF_FIRE"], x: 24, y: 0,
    desc: [
      "Mercury rock in any macerator gives &6Hermean Regolith Dust&r. Under a ring of mirrors it bakes into heat-shield bricks.",
    ],
    tasks: [{ type: "item", id: "73AA89265BAD1B8D", item: "gtceu:hermean_regolith_dust", count: 16 }],
    rewards: [{ type: "xp", id: "75A74DFD8D561355", xp: 40 }, { type: "item", id: "7F7A8D1DF7693F0F", item: "gtceu:hermean_regolith_dust", count: 16 }],
  },
  {
    key: "IV_A_SEED_FROM_MERCURY", id: "19D2E454A31BDFC2", title: "A Seed from Mercury", icon: "grindless:hermean_quantum_seed", deps: ["IV_HERMEAN_DUST"], x: 26, y: -1.5,
    desc: [
      "A chemical reactor on Mercury plays the same trick under Hermean dust and makes the &6Hermean Quantum Seed&r, only there. Its pair is the Mercury bridge.",
    ],
    tasks: [{ type: "item", id: "57BB72C9A435D4F2", item: "grindless:hermean_quantum_seed" }],
    rewards: [{ type: "xp", id: "578951E5CC4A5BBA", xp: 40 }, { type: "item", id: "32932E215A8E99D2", item: "minecraft:ender_pearl", count: 2 }],
  },
  {
    key: "IV_MERCURY_SOLAR_WORKS", id: "32D53F1384080352", title: "Mercury Solar Works", icon: "gtceu:mercury_solar_works", shape: "gear", size: 1.25, deps: ["IV_HERMEAN_DUST"], x: 26, y: 0,
    desc: [
      "Eight heliostat mirrors stand around a focal furnace on a pad of smelted Mercury rock. When a run starts with the sun on the receiver and every mirror under open sky, the &6Mercury Solar Works&r pays a quarter of the power.",
      "Its controller is built from a Heliostat Tower, an IV electric furnace and an IV assembler.",
    ],
    tasks: [{ type: "item", id: "582485C805CF2B91", item: "gtceu:mercury_solar_works" }],
    rewards: [{ type: "xp", id: "3E68ECF9EE35CE01", xp: 80 }, { type: "item", id: "7647C247E894F315", item: "grindless:heliostat_mirror", count: 2 }],
  },
  {
    key: "IV_HEAT_SHIELD_BRICKS", id: "15320440D70D86A7", title: "Heat-Shield Bricks", icon: "grindless:hermean_heat_shield_brick", deps: ["IV_MERCURY_SOLAR_WORKS"], x: 28, y: 0,
    desc: [
      "Mercury's own dust, baked under the mirrors, makes &6Hermean Heat-Shield Bricks&r. The drill, the solar field and the interferometer all stand on them.",
    ],
    tasks: [{ type: "item", id: "1711DBB76B4F48E0", item: "grindless:hermean_heat_shield_brick", count: 16 }],
    rewards: [{ type: "xp", id: "572273CE60DFE2C3", xp: 40 }],
  },
  {
    key: "IV_MERCURY_SOLAR_FIELD", id: "1BADC15A1CDF6CF1", title: "Mercury Solar Field", icon: "gtceu:mercury_solar_field", shape: "gear", size: 1.25, deps: ["IV_HEAT_SHIELD_BRICKS","IV_MERCURY_SOLAR_WORKS","X:734B97375A3121C4"], x: 30, y: 1.5,
    desc: [
      "The works evaporates gallium arsenide onto silicon in Mercury's free vacuum, and that's a thin-film panel. The &6Mercury Solar Field&r is built from a Lunar Solar Array and works by day only, with programmed circuit 1 in its bus.",
      "At night the RTG cell or the bridge carries the base.",
    ],
    tasks: [{ type: "item", id: "162DBF3E32F70B3D", item: "grindless:hermean_thin_film_panel", count: 36 }, { type: "item", id: "5FE2D36F7E08DD1D", item: "gtceu:mercury_solar_field" }],
    rewards: [{ type: "xp", id: "7A95DE8264B0E637", xp: 80 }],
  },
  {
    key: "IV_MERCURY_VEIN_DRILL", id: "171D167E3CB497BB", title: "Mercury Vein Drill", icon: "gtceu:mercury_vein_drill", shape: "gear", size: 1.25, deps: ["IV_HEAT_SHIELD_BRICKS","X:5107982325BE34B7"], x: 30, y: 0,
    desc: [
      "Raw iridosmine and raw graphite make the sample, and the &6Mercury Vein Drill&r is built from an EV Tripod Drill under a brick sunshade.",
      "By day the sun would cook a bare bit, so it only drills with liquid nitrogen from the Moon. At night it drills dry and saves the nitrogen, but the bit wears faster.",
    ],
    tasks: [{ type: "item", id: "737B9ED7C0D3BAC5", item: "grindless:vein_sample_iridosmine_mercury" }, { type: "item", id: "19005AEA2FD6ED7A", item: "gtceu:mercury_vein_drill" }],
    rewards: [{ type: "xp", id: "1621D64D182CAD95", xp: 100 }, { type: "item", id: "599EAFB8992A6B48", item: "grindless:tungsten_steel_drill_bit", count: 8 }],
  },
  {
    key: "IV_IRIDOSMINE", id: "147AC69C089D11C2", title: "Iridosmine", icon: "gtceu:raw_iridosmine", deps: ["IV_MERCURY_VEIN_DRILL"], x: 32, y: 0,
    desc: [
      "&6Raw Iridosmine&r is grains of native iridium and osmium in Mercury's dark crust, and the only iridium and osmium in the system. It won't melt in a furnace or split in an electrolyzer. Don't bother asking.",
    ],
    tasks: [{ type: "item", id: "12359EADE2DD3B2D", item: "gtceu:raw_iridosmine", count: 16 }],
    rewards: [{ type: "xp", id: "1DB9EF3AA96D2E21", xp: 60 }],
  },
  {
    key: "IV_IRIDIUM_AND_OSMIUM", id: "72E1760292CBF88F", title: "Iridium and Osmium", icon: "gtceu:iridium_dust", deps: ["IV_IRIDOSMINE","X:1F70EF41E5F8ED95"], x: 34, y: 0,
    desc: [
      "The ore plant turns raw iridosmine into dust, and the platinum plant on circuit 3 runs GregTech's whole chain inside until &6Iridium&r and &6Osmium&r come out. Earth's platinum doesn't give either any more.",
      "Iridium is what IV energy and dynamo hatches were waiting for, and osmium only melts at LuV voltage, which takes two IV hatches.",
    ],
    tasks: [{ type: "item", id: "50A84FB075AA85E7", item: "gtceu:iridosmine_dust" }, { type: "item", id: "59D4650D0BD6ADE4", item: "gtceu:iridium_dust" }, { type: "item", id: "7AF69E243D2D99A5", item: "gtceu:osmium_dust" }],
    rewards: [{ type: "xp", id: "5E6AC73E7F9203E1", xp: 80 }, { type: "item", id: "39C125F5441940A1", item: "grindless:platinum_electrode" }],
  },
  {
    key: "IV_ASSEMBLY_LINE", id: "3CF7A4745035119A", title: "Assembly Line", icon: "gtceu:assembly_line", shape: "gear", size: 1.25, deps: ["IV_IRIDIUM_AND_OSMIUM"], x: 36, y: 0,
    desc: [
      "The &6Assembly Line&r builds what no single machine can, reading its tiny input buses in order, one ingredient each. Its casings want IV sensors, emitters and ruridit gears, which is why it waits for iridium.",
      "Research comes first, and for the LuV motor an EV scanner reads an IV motor onto a data stick that then lives in a data access hatch on the line.",
    ],
    tasks: [{ type: "item", id: "36EB9EF0875C0768", item: "gtceu:data_access_hatch" }, { type: "item", id: "13B65CD07A715F89", item: "gtceu:assembly_line" }],
    rewards: [{ type: "xp", id: "50DDE00AC6725134", xp: 100 }, { type: "item", id: "3C9111C6E36316A4", item: "gtceu:ulv_input_bus", count: 4 }],
  },
  {
    key: "IV_FED_BY_THE_NETWORK", id: "305FCC7C554A03CC", title: "Fed by the Network", icon: "gtceu:luv_electric_motor", deps: ["IV_ASSEMBLY_LINE"], x: 38, y: 0,
    desc: [
      "Put an AE2 export bus under every input bus, each set to its ingredient, and the fluids into their own hatches in the same order.",
      "The &6LuV Electric Motor&r comes out of an ME output bus, which only talks to AE2 through its front face, and nobody crafted it by hand.",
    ],
    tasks: [{ type: "item", id: "7078E4AB85A716B9", item: "gtceu:luv_electric_motor" }],
    rewards: [{ type: "xp", id: "179DC94D3A806BE5", xp: 120 }, { type: "item", id: "3882C4BA21B8B55E", item: "ae2:speed_card", count: 2 }],
  },
  {
    key: "IV_PARALLEL_HATCH", id: "14E966D3D6D326FE", title: "Parallel Hatch", icon: "gtceu:iv_parallel_hatch", deps: ["IV_IRIDIUM_AND_OSMIUM"], x: 36, y: 1.5,
    desc: [
      "An &6Elite Parallel Control Hatch&r runs up to four copies of a recipe at once, in GCYM's machines (new at IV) and in the hot cell and the fuel, heavy-water, naquadah and platinum plants.",
      "Each copy pays full price, and four copies of an IV recipe want two IV energy hatches. The naquadah and platinum plants also want a Pu-Be source or electrode per copy.",
    ],
    tasks: [{ type: "item", id: "5F78F1B406873CDD", item: "gtceu:iv_parallel_hatch" }],
    rewards: [{ type: "xp", id: "10CD574948A92D4B", xp: 60 }],
  },
  {
    key: "IV_INTERFEROMETER", id: "5EB98498505C969F", title: "Interferometer", icon: "gtceu:interferometer", shape: "gear", size: 1.25, deps: ["IV_IRIDIUM_AND_OSMIUM","X:5940CA99055BAF42"], x: 36, y: -1.5,
    desc: [
      "The &6Interferometer&r is three dishes on Mercury listening as one, with a baseline that reaches back to the Moon. Its controller is built around a spare Deep Space Antenna, and it only listens at night.",
      "Its IV sensors and emitters take iridium and Quantum Stars, so the hot cell and Mercury both chip in.",
    ],
    tasks: [{ type: "item", id: "1DD25BCD182DEE47", item: "gtceu:interferometer" }],
    rewards: [{ type: "xp", id: "14B5B7E2FAA88F37", xp: 100 }, { type: "item", id: "781B85C09D42558D", item: "gtceu:data_orb", count: 2 }],
  },
  {
    key: "IV_OUTER_SYSTEM_CHART", id: "18E80E32AB01B8F6", title: "Outer System Chart", icon: "grindless:outer_system_chart", deps: ["IV_INTERFEROMETER"], x: 38, y: -1.5,
    desc: [
      "The Moon's antenna records the sky at night onto a data orb, and the recording travels to Mercury, over the bridge or in your pocket. With the Inner Planets Chart in its bus, the interferometer adds its own and writes the &6Outer System Chart&r of the belt and Jupiter's moons.",
      "Copy it with a data orb.",
    ],
    tasks: [{ type: "item", id: "7552AC54D4A3F523", item: "grindless:lunar_vlbi_recording" }, { type: "item", id: "337E13CB209AC332", item: "grindless:outer_system_chart" }],
    rewards: [{ type: "xp", id: "59EFDAAB6227E9DD", xp: 80 }],
  },
  {
    key: "IV_SAGITTARIUS_A", id: "5EC977A2B65C7030", title: "Sagittarius A*", icon: "grindless:sagittarius_a_star_signal", deps: ["IV_OUTER_SYSTEM_CHART"], x: 40, y: -3,
    desc: [
      "The hiss the Moon's antenna picked up from Sagittarius finally has an address: one faint, steady point at the centre of the galaxy, the same one two astronomers found in 1974. The &6Sagittarius A* Signal&r is a long way off, and you're going anyway.",
    ],
    tasks: [{ type: "item", id: "323CD14792896DA0", item: "grindless:sagittarius_a_star_signal" }],
    rewards: [{ type: "xp", id: "39227D6EAF003F8E", xp: 150 }],
  },
  {
    key: "IV_GATE_TO_LUV", id: "77B4DDD47050E3C7", title: "Gate to LuV", icon: "gtceu:luv_machine_hull", shape: "diamond", size: 1.75, deps: ["IV_OUTER_SYSTEM_CHART","IV_FED_BY_THE_NETWORK"], x: 40, y: 0,
    desc: [
      "Rhodium plated palladium, niobium titanium cable and PTFE make the &6LuV Machine Hull&r, and yes, it's another hull.",
      "Venus's naquadah and Mercury's iridium got you here, and the new chart points further out still.",
    ],
    tasks: [{ type: "item", id: "3BEDD9FEF08A23F7", item: "gtceu:luv_machine_hull" }, { type: "item", id: "1CDB7775F7E3766C", item: "gtceu:naquadah_ingot" }, { type: "item", id: "59ECD9397821182D", item: "grindless:outer_system_chart" }],
    rewards: [{ type: "xp", id: "13B7F93FCA293D74", xp: 300 }],
  },
  {
    key: "IV_SMELT_AND_FREEZE_IN", id: "14682D455D2C4F7C", title: "Smelt and Freeze in One", icon: "gtceu:smelting_complex", shape: "gear", size: 1.25, deps: ["IV_INNER_PLANETS"], x: 2, y: 1.5,
    desc: [
      "The &6Smelting Complex&r runs the blast furnace and the vacuum freezer as one recipe, so a hot ingot never has to be carried between machines. EMI shows which ingots it takes.",
    ],
    tasks: [{ type: "item", id: "1939718ECD2BF659", item: "gtceu:smelting_complex" }],
    rewards: [{ type: "xp", id: "3350CA5D8B5CEB38", xp: 80 }, { type: "item", id: "3D006D8F2B740DEF", item: "gtceu:steel_ingot", count: 16 }],
  },
];
