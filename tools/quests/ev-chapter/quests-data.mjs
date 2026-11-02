// Quest data for ev_age; tools/quests/gen-chapters.mjs writes the chapter. Texts rewritten in the quest voice on 2026-10-25 (docs/quests.md section 8);
// quests that taught nothing new were cut. Every id is spelled out, so a cut never shifts another id.
// EV has three chapters (RF-5Q-EV): this one keeps the journey, circuits-data.mjs the nano ladder, machines-data.mjs the halls.
// Quests that moved there keep their keys and ids. Positions: columns every 2, rows every 1.5; upper half = off-world, lower half = Earth.
const it = (item, count, id) => ({ type: 'item', item, count, id });
const ck = (id) => ({ type: 'checkmark', id });
const xp = (n, id) => ({ type: 'xp', xp: n, id });
const ri = (item, count, id) => ({ type: 'item', item, count, id });

export const CHAPTER = {
  id: "36522099DD26AB80",
  order: 0,
  icon: "gtceu:ev_vein_drill",
  autofocus: "LB",
  title: "EV: Lunar Base",
  subtitle: ["The Moon learns to run without you, and then a rocket points at Mars."],
  section: { name: "EV: Lunar Base", origin: { x: 0, y: 0 } },
};

export const LINKS = [];

export const QUESTS = [
  {
    key: "LB", id: "7E510A95C066D14C", title: "Lunar Base", icon: "gcyr:lunar_mare_regolith", shape: "rsquare", size: 1.5,
    deps: ["X:2897E3EB8159710C"], x: 0, y: 0,
    desc: [
      "Every bit of titanium in this pack is up here, under grey dust and a black sky. First the Moon learns to run without you. Then you point a rocket at Mars.",
    ],
    tasks: [ck("1C694669AF199258")],
    rewards: [xp(40, "073D0AACCEB758A2")],
  },
  {
    key: "LS", id: "65FD970F8628E474", title: "Lunar Samples", icon: "grindless:vein_sample_ilmenite_moon",
    deps: ["LB"], x: 2, y: 0,
    desc: [
      "Same as on Earth: an empty probe dipped in both raw ores of a vein makes its sample. Raw ilmenite and raw olivine make the first.",
      "The second takes the two kinds of regolith, scooped straight off the ground.",
    ],
    tasks: [it("grindless:vein_sample_ilmenite_moon", 1, "050FFA47CAA5050F"), it("grindless:vein_sample_regolith_moon", 1, "5AB7933E30EF63DD")],
    rewards: [xp(40, "16857AADAB1453ED")],
  },
  {
    key: "LD", id: "246C8ADBADA728E9", title: "Lunar Drill", icon: "gtceu:lunar_drill", shape: "gear", size: 1.5,
    deps: ["LS"], x: 4, y: 0,
    desc: [
      "Craft the &6Lunar Drill&r at home and build it up here: it forms anywhere but only drills on the Moon. A sample and a stainless steel bit go in its input bus.",
      "Until there's a bridge to Earth, it runs on the batteries you packed. You did pack batteries.",
    ],
    tasks: [it("gtceu:lunar_drill", 1, "5B07A5D98BA69B39")],
    rewards: [xp(100, "7451BE7DAFCDCDCC")],
  },
  {
    key: "TI", id: "14DF849D657D6AEF", title: "Titanium", icon: "gtceu:titanium_ingot",
    deps: ["LD", "X:53D1CE971F63D842"], x: 6, y: 0,
    desc: [
      "The Moon's ilmenite is the only titanium you'll ever get. Back home it takes the long way round: the EBF twice, a chlorine bath and the vacuum freezer. Clear your afternoon.",
    ],
    tasks: [it("gtceu:raw_ilmenite", 1, "7D8636FA23850C39"), it("gtceu:rutile_dust", 1, "570EBC0CBD0365D1"), it("gtceu:titanium_ingot", 1, "5F998A4F472AB2CF")],
    rewards: [xp(55, "7EF3030512FB7BB2")],
  },
  {
    key: "EVH", id: "61ECF6270ECCE3C2", title: "EV Machine Hull", icon: "gtceu:ev_machine_hull",
    deps: ["TI"], x: 8, y: 0,
    desc: [
      "Your first lunar titanium goes into the &6EV Machine Hull&r.",
      "Machines of EV size need circuits the nano line makes, and the halls of the Moon base each have their own gear in the sections beside the journey.",
    ],
    tasks: [it("gtceu:ev_machine_hull", 1, "13B7784B22044D02")],
    rewards: [xp(40, "6DE5A471269B3A5D")],
  },
  {
    key: "MP", id: "164F0808EF9DF557", title: "EV Components", icon: "gtceu:ev_electric_motor",
    deps: ["EVH"], x: 10, y: 0,
    desc: [
      "The EV motor is built around titanium rods, and every other part here needs a motor, so the Moon is officially in your supply chain.",
      "The motor's neodymium magnet comes from the monazite vein in the Nether.",
    ],
    tasks: [it("gtceu:ev_electric_motor", 1, "0CB11B272083BF4F"), it("gtceu:ev_electric_pump", 1, "01D849EAF82915F5"), it("gtceu:ev_electric_piston", 1, "3FC827F4C82F8B11"), it("gtceu:ev_robot_arm", 1, "19CA491E1535D0D1"), it("gtceu:ev_conveyor_module", 1, "3EB895FBD4951335")],
    rewards: [xp(70, "1B2016D2F9628E2F")],
  },
  {
    key: "HE", id: "1DC956E9F071636A", title: "Helium-3", icon: "grindless:vein_sample_regolith_moon",
    deps: ["LD"], x: 4, y: -1.5,
    desc: [
      "With the regolith sample, the lunar drill pumps &6Helium-3&r into an output hatch, by lunar day only. Nothing burns it yet.",
      "The quantum seeds need some, and the rest is worth keeping for the day something does.",
    ],
    tasks: [ck("3FFC2A59AF730E83")],
    rewards: [xp(40, "3B994EBAA2AF1405")],
  },
  {
    key: "BRK", id: "33EFC07080657F50", title: "Bricks from the Ground", icon: "grindless:sintered_regolith",
    deps: ["LD"], x: 6, y: -1.5,
    desc: [
      "Cobblestone from the drill, or any lunar stone you dig up, grinds into &6Lunar Regolith Dust&r in any macerator.",
      "An electric furnace bakes that into &6Sintered Regolith Bricks&r, slowly, and it works anywhere once you have the dust. Nearly the whole Moon base stands on these bricks.",
    ],
    tasks: [it("gtceu:lunar_regolith_dust", 1, "35C7DD57A884640E"), it("grindless:sintered_regolith", 16, "7504084A6B44AD55")],
    rewards: [xp(35, "12E9B79D096C02EA"), ri("gtceu:lunar_regolith_dust", 16, "3AB895BCA0F1FF7D")],
  },
  {
    key: "ECS", id: "1F57B2083B56B2BA", title: "Advanced Creature Simulator III", icon: "gtceu:ev_creature_simulator",
    deps: ["EVH"], x: 8, y: 1.5,
    desc: [
      "The &6Advanced Creature Simulator III&r runs models the HV one can't, like the wither. It's built with an HV emitter and sensor, because the EV ones need a quantum eye and that waits for IV.",
    ],
    tasks: [it("gtceu:ev_creature_simulator", 1, "1869942F7008236A")],
    rewards: [xp(40, "5B4FA8CE917B791D")],
  },
  {
    key: "WS", id: "561EADDBC1373853", title: "Wither Skeletons", icon: "grindless:creature_model_wither_skeleton",
    deps: ["ECS"], x: 8, y: 3,
    desc: [
      "Skip the fortress. Nether bricks and bone blocks print a &6Wither Skeleton&r model, and any simulator from HV up runs it on biomass and tricalcium phosphate.",
      "Skulls drop now and then; circuit 2 gives nothing but skulls.",
    ],
    tasks: [it("grindless:creature_model_wither_skeleton", 1, "3554ADB692D9075E")],
    rewards: [xp(35, "5B634D8FFCAF0786"), ri("gtceu:tricalcium_phosphate_dust", 4, "70052057802E0E94")],
  },
  {
    key: "WI", id: "73D14393C00DE14D", title: "Nether Stars", icon: "minecraft:nether_star",
    deps: ["WS"], x: 8, y: 4.5,
    desc: [
      "Wither skeleton skulls print a &6Wither&r model, and only the EV simulator runs it. Each run hands back a Nether Star, no boss fight required.",
      "Keep a stock, because IV turns them into quantum stars.",
    ],
    tasks: [it("grindless:creature_model_wither", 1, "56A559EC98B8D9CA"), it("minecraft:nether_star", 1, "1D42A20C7B41C7DF")],
    rewards: [xp(60, "14A92A496BAA46E1")],
  },
  {
    key: "PT", id: "791D4E94384E12AB", title: "Platinum", icon: "gtceu:platinum_dust",
    deps: ["PP"], x: 14, y: 3,
    desc: [
      "Circuit 1 leaches purified pentlandite or chalcopyrite into &6Platinum Group Sludge&r, with nickel or copper on the side. Circuit 2 turns the sludge into &6Platinum&r, gold and slag.",
      "That second run is long and hungry, so put a battery buffer on the plant. Its nitrogen dioxide goes back to nitric acid.",
    ],
    tasks: [it("gtceu:platinum_group_sludge_dust", 1, "776F10F0174DD518"), it("gtceu:platinum_dust", 1, "725A2FE2FC260568")],
    rewards: [xp(60, "37FF74FD63247BE6")],
  },
  {
    key: "RR", id: "74BC8201D518D3BA", title: "Rhodium and Ruthenium", icon: "gtceu:ruthenium_dust",
    deps: ["PT"], x: 16, y: 3,
    desc: [
      "The platinum slag still has &6Rhodium&r and &6Ruthenium&r in it, and this run gets them out. The toxic ruthenium tetroxide stays inside the plant, which is where you want it.",
      "It fills all four output hatches, so give every fluid somewhere to go.",
    ],
    tasks: [it("gtceu:rhodium_dust", 1, "7BD232212828FBA3"), it("gtceu:ruthenium_dust", 1, "3E3FF44F46764B58")],
    rewards: [xp(55, "7F86CFDEDA853216")],
  },
  {
    key: "PD", id: "31410FFA71DAFA0F", title: "Palladium", icon: "gtceu:palladium_dust",
    deps: ["PT"], x: 16, y: 4.5,
    desc: [
      "The platinum run also lets go of palladium-rich ammonia. Feed it back with more ammonia and formic acid and out comes &6Palladium&r.",
      "Keep the palladium metal dust the platinum run drops, because this one needs it too.",
    ],
    tasks: [it("gtceu:palladium_dust", 1, "37DDC43E6EF22757")],
    rewards: [xp(40, "3A7A69EE74073864")],
  },
  {
    key: "RC", id: "169F778007DE0484", title: "Ruthenium Catalyst", icon: "grindless:ruthenium_catalyst",
    deps: ["RR"], x: 18, y: 3,
    desc: [
      "Ruthenium on alumina pellets makes the &6Ruthenium Catalyst&r, which turns carbon dioxide and hydrogen into methane.",
      "Mars's atmosphere processor wears them out slowly, so pack a few for the trip.",
    ],
    tasks: [it("grindless:ruthenium_catalyst", 4, "7CD60D931DAFDC14")],
    rewards: [xp(60, "5067394C445994B8")],
  },
  {
    key: "MC", id: "319C39AD99B5E4A8", title: "The Way to Mars", icon: "grindless:mars_chart",
    deps: ["DSA"], x: 14, y: -1.5,
    desc: [
      "At night the antenna takes radio fixes on Mars, works out the next transfer window and marks a landing ellipse on the northern plains.",
      "Your landing-site chart stays in the bus, and a data stick comes out as the &6Mars Transfer Chart&r. The tier 2 rocket parts are built with it, and it's never used up.",
    ],
    tasks: [it("grindless:mars_chart", 1, "3A236F3B926B3BD2")],
    rewards: [xp(60, "1641701EDE841626")],
  },
  {
    key: "RKT", id: "5A84C7A4F1A7F2D9", title: "A Rocket for Mars", icon: "gcyr:advanced_rocket_motor",
    deps: ["MC", "MP"], x: 14, y: 0,
    desc: [
      "Mars needs a tier 2 rocket, and the game averages your parts: a single basic motor or tank left on board keeps you at the Moon. Swap every one for an &6Advanced Rocket Motor&r or &6Advanced Fuel Tank&r, made in the EV assembler with the Mars chart.",
      "Two advanced tanks hold exactly one trip. Set the ID chip to Mars.",
    ],
    tasks: [it("gcyr:advanced_fuel_tank", 2, "1325820C09A0B5F9"), it("gcyr:advanced_rocket_motor", 6, "311C26C14AF5C9FE")],
    rewards: [xp(80, "17E645C4A771E50C"), ri("waystones:waystone", 1, "7E14DC7E71F53E24")],
  },
  {
    key: "RH", id: "3C5189B47D70D762", title: "Red Horizon", icon: "gcyr:mars_regolith", shape: "rsquare", size: 1.25,
    deps: ["RKT"], x: 16, y: 0,
    desc: [
      "Mars is cold and its air is thin carbon dioxide, but your HV suit copes. Bring a waystone: it's your ride home.",
      "Pack sintered-brick footings, the bridge parts, a chemical reactor with ender pearls and helium-3, and charged batteries. Sunlight is weak here, so the solar array wants circuit 2 and gives under a third.",
    ],
    tasks: [{ type: 'dimension', dimension: "gcyr:mars", id: "5A92C623281A6694" }],
    rewards: [xp(150, "59052BD0D36A5824"), ri("grindless:empty_vein_probe", 3, "1B2D6B69B1579CD9")],
  },
  {
    key: "SMP", id: "5EFC42884771D00C", title: "Martian Samples", icon: "grindless:vein_sample_scheelite_mars",
    deps: ["RH"], x: 18, y: 0,
    desc: [
      "Mars has only three veins: scheelite, merrillite and ice. None of them exists anywhere else, and small rocks on the surface give each one away.",
      "Dip a probe in both raw ores of each vein. Scheelite sits deepest, so expect a long dig.",
    ],
    tasks: [it("grindless:vein_sample_scheelite_mars", 1, "19C4B5C81E5E5DDC"), it("grindless:vein_sample_merrillite_mars", 1, "5E50801BB633D859"), it("grindless:vein_sample_ice_mars", 1, "11F2EA23D6358D4B")],
    rewards: [xp(60, "30C28952047E5D65")],
  },
  {
    key: "MSEED", id: "5301384885D78BAC", title: "A Seed from Mars", icon: "grindless:martian_quantum_seed",
    deps: ["SMP"], x: 18, y: -1.5,
    desc: [
      "Rare-earth ions are what real quantum memories store their states in, so merrillite gets the job here. A chemical reactor makes the &6Martian Quantum Seed&r from merrillite dust, an ender pearl and helium-3. The recipe works in any chemical reactor, so the dust can ship home.",
      "Raw merrillite becomes dust in a plain furnace, which still works here.",
    ],
    tasks: [it("grindless:martian_quantum_seed", 1, "13C945C4547889F7")],
    rewards: [xp(50, "7BA522A8AA02443F")],
  },
  {
    key: "MTR", id: "56FFD4EF98A6C3B8", title: "The Martian Tripod", icon: "gtceu:raw_scheelite",
    deps: ["SMP"], x: 20, y: 0,
    desc: [
      "Build a second EV Tripod Drill here and give it the scheelite sample and titanium bits. The solar wings don't do much in this weak sunlight.",
      "Tungsten only comes from Mars, and from now on it reaches home without you.",
    ],
    tasks: [it("gtceu:raw_scheelite", 16, "7391930490146D70")],
    rewards: [xp(120, "3977177DF1BB38B0")],
  },
  {
    key: "ICE", id: "148A0854C671B0AC", title: "Deuterium-Rich Ice", icon: "gtceu:raw_deuterium_rich_ice", size: 0.75, optional: true,
    deps: ["MTR"], x: 22, y: -1.5,
    desc: [
      "Mars lost most of its water to space, but the heavy kind tended to stay, so this ice holds about five times Earth's deuterium. Nothing uses it yet. Store it, because IV turns it into heavy water.",
    ],
    tasks: [it("gtceu:raw_deuterium_rich_ice", 16, "39F11652861B7724")],
    rewards: [xp(30, "34868A8CB47D7899")],
  },
  {
    key: "SM", id: "72022B0ECDC3668B", title: "Samarium", icon: "gtceu:samarium_dust",
    deps: ["CAS"], x: 22, y: -3,
    desc: [
      "The cascade gives samarium, neodymium and mixed rare-earth chlorides, and hands most of the kerosene back. Any electrolyzer turns the chlorides into metal and chlorine.",
      "&6Samarium&r only comes from Mars, and IV's superconductor and LuV's motor magnets both want it, so start a pile.",
    ],
    tasks: [it("gtceu:samarium_chloride_dust", 1, "5C5A45DA7E372E3D"), it("gtceu:samarium_dust", 1, "1088F02E75EFC2DD")],
    rewards: [xp(60, "5E60AB1D3DB8F6C6")],
  },
  {
    key: "TU", id: "5B6B5BE89721691A", title: "Tungsten", icon: "gtceu:tungsten_ingot",
    deps: ["MTR"], x: 22, y: 0,
    desc: [
      "Scheelite takes the familiar road to &6Tungsten&r: an acid bath, the electrolyzer, the blast furnace and the freezer. Nichrome coils are just hot enough to melt it.",
    ],
    tasks: [it("gtceu:tungstic_acid_dust", 1, "1666328E006A2DD6"), it("gtceu:tungsten_dust", 1, "12F35AEF44226368"), it("gtceu:tungsten_ingot", 1, "71A6759B1111A3DC")],
    rewards: [xp(60, "3EDBCF351DEE2347")],
  },
  {
    key: "RTM", id: "3DB3729547372E91", title: "RTM Coils", icon: "gtceu:rtm_alloy_coil_block",
    deps: ["TU"], x: 24, y: -1.5,
    desc: [
      "&6RTM Alloy&r takes shopping on three worlds: ruthenium from the platinum plant, tungsten from Mars and molybdenum from the Nether. A blast furnace lined with its coils runs hotter than nichrome ever could.",
    ],
    tasks: [it("gtceu:rtm_alloy_coil_block", 4, "56EE64CD3A69B9CA")],
    rewards: [xp(80, "58D020FF415A194C")],
  },
  {
    key: "TS", id: "11BD5A24AAF314BC", title: "Tungsten Steel", icon: "gtceu:tungsten_steel_ingot",
    deps: ["TU"], x: 24, y: 0,
    desc: [
      "Tungsten and steel dust from the mixer take another trip through the blast furnace and the freezer. &6Tungsten Steel&r is what IV machines are made of, so you'll want plenty.",
    ],
    tasks: [it("gtceu:tungsten_steel_dust", 1, "3D4D6BFA66540329"), it("gtceu:tungsten_steel_ingot", 1, "106C109CA8C652F8")],
    rewards: [xp(60, "18399F59E4F03505")],
  },
  {
    key: "STOCK", kind: "reading", title: "Before IV", icon: "gtceu:liquid_helium_bucket",
    deps: ["TS", "SM"], x: 26, y: -1.5,
    desc: [
      "Venus and Mercury burn, and IV leans on what you stored here: liquid oxygen and helium, nether stars, samarium and the deuterium-rich ice.",
      "Look over the tanks once before you leave.",
    ],
    tasks: [ck()],
    rewards: [xp(30)],
  },
  {
    key: "IVH", id: "7AF6FD3F4F3B06B4", title: "IV Machine Hull", icon: "gtceu:iv_machine_hull", shape: "diamond", size: 1.75,
    deps: ["TS", "NPC"], x: 28, y: 0,
    desc: [
      "The &6IV Machine Hull&r puts Martian tungsten steel, platinum cable and PTFE into one box.",
      "Mars gave you tungsten. Venus and Mercury burn. That's next.",
    ],
    tasks: [it("gtceu:iv_machine_hull", 1, "165460090EBCFE61")],
    rewards: [xp(200, "77CC1D46CCA5BF7C")],
  },
];
