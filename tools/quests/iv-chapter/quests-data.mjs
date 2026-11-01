// Quest data for iv_age: the IV journey and its capstone; tools/quests/gen-chapters.mjs writes the chapter. The gears live in iv_machines
// and the quantum ladder in iv_circuits. Ids of quests that kept their meaning are pinned (RF-5L2 import); new quests derive theirs.
const it = (item, count) => (count === undefined ? { type: 'item', item } : { type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

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
      "From the far side of the Moon the antenna can just make out Mercury in the Sun's glare and Venus under its clouds, and you're going to both. First, the atom: a hot cell and a reactor that burns nothing.",
      "Until Mercury's iridium, two EV energy hatches run any IV multiblock.",
    ],
    tasks: [{ type: "checkmark" }],
    rewards: [xp(50)],
  },
  {
    key: "IV_FLUORITE_VEIN", id: "5C008907C9055459", title: "Fluorite Vein", icon: "grindless:vein_sample_fluorite", deps: ["IV_INNER_PLANETS"], x: 2, y: -1.5,
    desc: [
      "A new Overworld vein of fluorite, barite, galena and sphalerite grows only in freshly generated chunks. Time to go somewhere you've never been.",
      "Raw fluorite and raw barite make a &6Fluorite Vein Sample&r, and any vein drill takes it.",
    ],
    tasks: [it("grindless:vein_sample_fluorite"), it("gcyr:raw_fluorite", 16)],
    rewards: [xp(40), it("gcyr:raw_fluorite", 8)],
  },
  {
    key: "IV_PITCHBLENDE", id: "77B6F588980A4B1C", title: "Pitchblende", icon: "grindless:vein_sample_pitchblende_end", deps: ["IV_INNER_PLANETS"], x: 2, y: -3,
    desc: [
      "The End's pitchblende vein has been there all along, and no drill will touch it: you'll dissolve the uranium right out of the rock.",
      "Raw pitchblende and raw uraninite make an &6End Pitchblende Vein Sample&r.",
    ],
    tasks: [it("grindless:vein_sample_pitchblende_end")],
    rewards: [xp(40)],
  },
  {
    key: "IV_ENRICHMENT", id: "174353B4F6C61A79", title: "Enrichment", icon: "gtceu:uranium_235_dust", deps: ["IV_HOT_CELL", "IV_FLUORSPAR_KILN", "IV_IN_SITU_LEACH_FIELD"], x: 4, y: 0,
    desc: [
      "Circuit 1 turns uraninite and hydrofluoric acid into &6Uranium 235&r and a pile of uranium 238. Keep the 238: pellets, radon and later MOX all want it.",
    ],
    tasks: [it("gtceu:uranium_235_dust"), it("gtceu:uranium_dust")],
    rewards: [xp(60)],
  },
  {
    key: "IV_QUANTUM_STAR", id: "7136B78C360303F9", title: "Quantum Star", icon: "gtceu:quantum_star", deps: ["IV_ENRICHMENT", "X:73D14393C00DE14D"], x: 6, y: 0,
    desc: [
      "Circuit 4 blows air over uranium 238 for radon, with no plutonium needed. A Nether Star soaked in radon becomes a &6Quantum Star&r, and an Ender Eye becomes the Quantum Eye that EV sensors and emitters have waited for.",
    ],
    tasks: [it("gtceu:radon_bucket"), it("gtceu:quantum_eye"), it("gtceu:quantum_star")],
    rewards: [xp(60)],
  },
  {
    key: "IV_LEU_FUEL", id: "77E9A2979A7161D3", title: "LEU Fuel", icon: "grindless:leu_fuel_assembly", deps: ["IV_FUEL_FABRICATION_PLANT", "mv:MV_END_VEINS"], x: 8, y: -1.5,
    desc: [
      "An &6LEU Fuel Assembly&r is enriched uranium pressed into pellets and sealed in Zircaloy tubes with a breath of helium. The zirconium comes from the End's zircon, with a pinch of tin.",
    ],
    tasks: [it("grindless:leu_pellet"), it("grindless:zircaloy_cladding_tube"), it("grindless:leu_fuel_assembly")],
    rewards: [xp(60)],
  },
  {
    key: "IV_FIRST_CRITICALITY", id: "72139ED6F4E46D37", title: "First Criticality", icon: "gtceu:ev_energy_output_hatch_16a", deps: ["IV_FISSION_REACTOR", "IV_LEU_FUEL"], x: 10, y: 0,
    desc: [
      "Load an LEU assembly with circuit 1, give it water, and the reactor wakes up. Each assembly in the bus runs another channel, up to four.",
      "Until iridium, the &6EV 16A Dynamo Hatch&r is the biggest it can feed.",
    ],
    tasks: [it("gtceu:ev_energy_output_hatch_16a")],
    rewards: [xp(100)],
  },
  {
    key: "IV_REPROCESSING", id: "7E266AE6DB3351F7", title: "Reprocessing", icon: "gtceu:plutonium_dust", deps: ["IV_FIRST_CRITICALITY"], x: 12, y: -1.5,
    desc: [
      "A spent assembly still holds uranium and the plutonium it bred. The hot cell's circuit 3 dissolves it in nitric acid and hands back both. The waste is glassed and kept.",
    ],
    tasks: [it("grindless:spent_fuel_assembly"), it("gtceu:plutonium_dust")],
    rewards: [xp(60)],
  },
  {
    key: "IV_RTG_PELLETS", id: "1D931CB1451E8B5A", title: "RTG Pellets", icon: "grindless:rtg_pellet", deps: ["IV_REPROCESSING"], x: 14, y: -1.5,
    desc: [
      "Plutonium oxide sealed in platinum and rhodium foil stays warm on its own. The hot cell's circuit 2 makes an &6RTG Pellet&r, as close to a pocket sun as GregTech allows.",
    ],
    tasks: [it("grindless:rtg_pellet")],
    rewards: [xp(40)],
  },
  {
    key: "IV_HEAVY_WATER", id: "3513B00E50D7C58B", title: "Heavy Water", icon: "gtceu:heavy_water_bucket", deps: ["IV_HEAVY_WATER_PLANT", "X:148A0854C671B0AC"], x: 12, y: 1.5,
    desc: [
      "Circuit 1 makes a concentrate from ice and steam, and circuit 2 finishes it into &6Heavy Water&r. Any steam works, and the combined-cycle plant has plenty it isn't allowed to throw away.",
    ],
    tasks: [it("gtceu:hydrogen_sulfide_bucket"), it("gtceu:heavy_water_concentrate_bucket"), it("gtceu:heavy_water_bucket")],
    rewards: [xp(50)],
  },
  {
    key: "IV_HEAVY_WATER_CORE", id: "373CBFB746FCAD51", title: "Heavy-Water Core", icon: "gtceu:tritiated_heavy_water_bucket", deps: ["IV_FIRST_CRITICALITY", "IV_HEAVY_WATER"], x: 14, y: 0,
    desc: [
      "Heavy water slows neutrons without eating them, and on circuit 2 the same assembly gives twice the power. It comes out as &6Tritiated Heavy Water&r, and the reactor never vents it. Give it a tank.",
    ],
    tasks: [it("gtceu:tritiated_heavy_water_bucket")],
    rewards: [xp(60)],
  },
  {
    key: "IV_TRITIUM", id: "7FD8A4969E497C3A", title: "Tritium", icon: "gtceu:tritium_bucket", deps: ["IV_TRITIUM_REMOVAL_FACILITY", "IV_HEAVY_WATER"], x: 16, y: 1.5,
    desc: [
      "The only &6Tritium&r in the pack comes out of the Moon's cold box. Nothing uses it yet, but fusion will. Store every drop.",
    ],
    tasks: [it("gtceu:tritium_bucket")],
    rewards: [xp(50)],
  },
  {
    key: "IV_INNER_PLANETS_CHART", id: "539716A235672461", title: "Inner Planets Chart", icon: "grindless:inner_planets_chart", deps: ["IV_TRITIUM_REMOVAL_FACILITY", "X:319C39AD99B5E4A8"], x: 16, y: 0,
    desc: [
      "Give the far-side antenna a second EV energy hatch, the trick the tritium facility runs on. At night, with the Mars chart calibrating the dish, it writes the &6Inner Planets Chart&r onto a data stick.",
      "Copy it anyway: charts end up in the wrong chest.",
    ],
    tasks: [it("grindless:inner_planets_chart")],
    rewards: [xp(60), it("gtceu:data_stick", 2)],
  },
  {
    key: "IV_ELITE_ROCKET_THERMAL_SUIT", id: "5A378E5CFD8DFF82", title: "Elite Rocket, Thermal Suit", icon: "gcyr:elite_rocket_motor", deps: ["IV_INNER_PLANETS_CHART"], x: 18, y: 0,
    desc: [
      "Venus and Mercury want a level 3 rocket, and GCYR averages the parts, so one leftover advanced motor keeps you at level 2. The IV assembler makes the &6elite parts&r with the chart.",
      "Each suit piece gets the thermal upgrade and a heat shielding fabric: do all four.",
    ],
    tasks: [it("gcyr:elite_fuel_tank", 2), it("gcyr:elite_rocket_motor", 6), it("gcyr:space_suit_thermal_upgrade_smithing_template", 4)],
    rewards: [xp(100), it("gcyr:heat_shielding_fabric", 4)],
  },
  {
    key: "IV_UNDER_THE_CLOUDS", id: "5693331C34A5A291", title: "Under the Clouds", icon: "gcyr:venus_rock", shape: "rsquare", size: 1.25, deps: ["IV_ELITE_ROCKET_THERMAL_SUIT"], x: 20, y: -3,
    desc: [
      "Ninety bar of carbon dioxide, sulfuric acid clouds and ground hot enough to melt lead. Nothing burns here, so land with an RTG cell or charged batteries.",
      "Bring ender pearls, helium-3 and a waystone for the ride home.",
    ],
    tasks: [{ type: "dimension", dimension: "gcyr:venus" }],
    rewards: [xp(150), it("grindless:empty_vein_probe", 3)],
  },
  {
    key: "IV_VENUSIAN_REGOLITH", id: "1B1714A8E0124C58", title: "Venusian Regolith", icon: "gcyr:venusian_regolith", deps: ["IV_UNDER_THE_CLOUDS"], x: 22, y: -3,
    desc: [
      "&6Venusian Regolith&r is the ground every Venus machine stands on, and it falls like sand, so build on something solid.",
    ],
    tasks: [it("gcyr:venusian_regolith", 19)],
    rewards: [xp(40)],
  },
  {
    key: "IV_NAQUADAH_SAMPLE", id: "7FCCB79E1561AAAB", title: "Naquadah Sample", icon: "grindless:vein_sample_naquadah_venus", deps: ["IV_UNDER_THE_CLOUDS"], x: 22, y: -4.5,
    desc: [
      "Naquadah sits deep under Venus's lava seas, with some plutonium mixed in. Dig down for raw naquadah and raw plutonium and pack a &6Venusian Naquadah Vein Sample&r.",
    ],
    tasks: [it("grindless:vein_sample_naquadah_venus")],
    rewards: [xp(40)],
  },
  {
    key: "IV_A_SEED_FROM_VENUS", id: "71E4B392A6D559D9", title: "A Seed from Venus", icon: "grindless:venusian_quantum_seed", deps: ["IV_VENUSIAN_REGOLITH"], x: 24, y: -3,
    desc: [
      "Ender pearls and helium-3 from home, sealed under Venusian regolith in a chemical reactor, make a &6Venusian Quantum Seed&r, and only here. Blow it up with a singularity back home for the Venus bridge's pair.",
    ],
    tasks: [it("grindless:venusian_quantum_seed")],
    rewards: [xp(40), it("minecraft:ender_pearl", 2)],
  },
  {
    key: "IV_RAW_NAQUADAH", id: "77FF1E1CF59D10BC", title: "Raw Naquadah", icon: "gtceu:raw_naquadah", deps: ["IV_PRESSURIZED_VEIN_DRILL"], x: 24, y: -4.5,
    desc: [
      "&6Raw Naquadah&r comes from the bottom of Venus and nowhere else, with a little plutonium on the side. Through the ore plant it becomes naquadah oxide, and a little comes out enriched: that's LuV's business.",
    ],
    tasks: [it("gtceu:raw_naquadah", 16)],
    rewards: [xp(60), it("gtceu:antimony_trioxide_dust", 8)],
  },
  {
    key: "IV_NAQUADAH_INGOT", id: "571EB64508F2FF8E", title: "Naquadah Ingot", icon: "gtceu:naquadah_ingot", deps: ["IV_NAQUADAH_PLANT"], x: 26, y: -4.5,
    desc: [
      "Naquadah only melts in a blast furnace with HSS-G coils, and the hot ingot wants liquid helium in the vacuum freezer. The &6Naquadah Ingot&r is where the quantum wafers start.",
      "The plant's titanium is the one exception to the Moon's monopoly.",
    ],
    tasks: [it("gtceu:naquadah_ingot")],
    rewards: [xp(80)],
  },
  {
    key: "IV_DAY_OF_FIRE", id: "55613604E4C62B5F", title: "Day of Fire", icon: "gcyr:mercury_rock", shape: "rsquare", size: 1.25, deps: ["IV_ELITE_ROCKET_THERMAL_SUIT"], x: 20, y: 0,
    desc: [
      "Mercury keeps Earth's clock: a scorching day and a cold, dark night. There's no air and nothing burns, so an RTG cell or charged batteries keep the first base going until the sun returns.",
      "Bring a waystone and an empty vein probe.",
    ],
    tasks: [{ type: "dimension", dimension: "gcyr:mercury" }],
    rewards: [xp(150), it("grindless:empty_vein_probe", 3)],
  },
  {
    key: "IV_A_SEED_FROM_MERCURY", id: "19D2E454A31BDFC2", title: "A Seed from Mercury", icon: "grindless:hermean_quantum_seed", deps: ["IV_DAY_OF_FIRE"], x: 22, y: -1.5,
    desc: [
      "Hermean regolith dust, a chemical reactor and the same trick make the &6Hermean Quantum Seed&r, only on Mercury. Its pair is the Mercury bridge.",
    ],
    tasks: [it("grindless:hermean_quantum_seed")],
    rewards: [xp(40), it("minecraft:ender_pearl", 2)],
  },
  {
    key: "IV_HEAT_SHIELD_BRICKS", id: "15320440D70D86A7", title: "Heat-Shield Bricks", icon: "grindless:hermean_heat_shield_brick", deps: ["IV_MERCURY_SOLAR_WORKS"], x: 24, y: 0,
    desc: [
      "Mercury's own dust, baked under the mirrors, makes &6Hermean Heat-Shield Bricks&r. The drill, the solar field and the interferometer all stand on them.",
    ],
    tasks: [it("grindless:hermean_heat_shield_brick", 16)],
    rewards: [xp(40)],
  },
  {
    key: "IV_IRIDOSMINE", id: "147AC69C089D11C2", title: "Iridosmine", icon: "gtceu:raw_iridosmine", deps: ["IV_MERCURY_VEIN_DRILL"], x: 26, y: 0,
    desc: [
      "&6Raw Iridosmine&r is grains of native iridium and osmium in Mercury's dark crust, and the only iridium and osmium in the system. It won't melt in a furnace or split in an electrolyzer.",
    ],
    tasks: [it("gtceu:raw_iridosmine", 16)],
    rewards: [xp(60)],
  },
  {
    key: "IV_IRIDIUM_AND_OSMIUM", id: "72E1760292CBF88F", title: "Iridium and Osmium", icon: "gtceu:iridium_dust", deps: ["IV_IRIDOSMINE", "X:1F70EF41E5F8ED95"], x: 28, y: 0,
    desc: [
      "The ore plant turns raw iridosmine into dust, and the platinum plant on circuit 3 runs the whole chain until &6Iridium&r and &6Osmium&r come out.",
      "Iridium is what IV hatches were waiting for, and osmium only melts at LuV voltage.",
    ],
    tasks: [it("gtceu:iridosmine_dust"), it("gtceu:iridium_dust"), it("gtceu:osmium_dust")],
    rewards: [xp(80), it("grindless:platinum_electrode", 1)],
  },
  {
    key: "IV_ASSEMBLY_LINE", id: "3CF7A4745035119A", title: "Assembly Line", icon: "gtceu:assembly_line", shape: "gear", size: 1.25, deps: ["IV_IRIDIUM_AND_OSMIUM"], x: 30, y: 0,
    desc: [
      "The &6Assembly Line&r builds what no single machine can, reading its input buses in order, one ingredient each. Its casings want IV sensors, emitters and ruridit gears, which is why it waits for iridium.",
      "For the LuV motor, an EV scanner reads an IV motor onto a data stick that lives in a data access hatch on the line.",
    ],
    tasks: [it("gtceu:data_access_hatch"), it("gtceu:assembly_line")],
    rewards: [xp(100), it("gtceu:ulv_input_bus", 4)],
  },
  {
    key: "IV_FED_BY_THE_NETWORK", id: "305FCC7C554A03CC", title: "Fed by the Network", icon: "gtceu:luv_electric_motor", deps: ["IV_ASSEMBLY_LINE"], x: 32, y: 0,
    desc: [
      "Put an AE2 export bus under every input bus, each set to its ingredient, and the fluids into their own hatches in the same order.",
      "The &6LuV Electric Motor&r comes out of an ME output bus, and nobody crafted it by hand.",
    ],
    tasks: [it("gtceu:luv_electric_motor")],
    rewards: [xp(120), it("ae2:speed_card", 2)],
  },
  {
    key: "IV_OUTER_SYSTEM_CHART", id: "18E80E32AB01B8F6", title: "Outer System Chart", icon: "grindless:outer_system_chart", deps: ["IV_INTERFEROMETER"], x: 32, y: -1.5,
    desc: [
      "The Moon's antenna records the sky at night onto a data orb, and the recording travels to Mercury. With the Inner Planets Chart in its bus, the interferometer writes the &6Outer System Chart&r of the belt and Jupiter's moons.",
    ],
    tasks: [it("grindless:lunar_vlbi_recording"), it("grindless:outer_system_chart")],
    rewards: [xp(80)],
  },
  {
    key: "IV_SAGITTARIUS_A", id: "5EC977A2B65C7030", title: "Sagittarius A*", icon: "grindless:sagittarius_a_star_signal", deps: ["IV_OUTER_SYSTEM_CHART"], x: 34, y: -3,
    desc: [
      "The hiss the Moon's antenna picked up from Sagittarius finally has an address: one faint, steady point at the centre of the galaxy. The &6Sagittarius A* Signal&r is a long way off, and you're going anyway.",
    ],
    tasks: [it("grindless:sagittarius_a_star_signal")],
    rewards: [xp(150)],
  },
  {
    key: "IV_GATE_TO_LUV", id: "77B4DDD47050E3C7", title: "Gate to LuV", icon: "gtceu:luv_machine_hull", shape: "diamond", size: 1.75, deps: ["IV_OUTER_SYSTEM_CHART", "IV_FED_BY_THE_NETWORK"], x: 34, y: 0,
    desc: [
      "Rhodium plated palladium, niobium titanium cable and PTFE make the &6LuV Machine Hull&r, and yes, it's another hull.",
      "Venus's naquadah and Mercury's iridium got you here, and the new chart points further out still.",
    ],
    tasks: [it("gtceu:luv_machine_hull"), it("gtceu:naquadah_ingot"), it("grindless:outer_system_chart")],
    rewards: [xp(300)],
  },
];
