// Quest data for ev_age; gen.mjs in this folder writes the chapter. Texts rewritten in the quest voice on 2026-10-25 (docs/quests.md section 8);
// quests that taught nothing new were cut. Every id is spelled out, so a cut never shifts another id.
// Positions: columns every 2, rows every 1.5; upper half = off-world, lower half = Earth.
const it = (item, count, id) => ({ type: 'item', item, count, id });
const ck = (id) => ({ type: 'checkmark', id });
const xp = (n, id) => ({ type: 'xp', xp: n, id });
const ri = (item, count, id) => ({ type: 'item', item, count, id });

export const CHAPTER = {
  id: "36522099DD26AB80",
  group: "3F021F40CD26BF57",
  order: 4,
  icon: "gtceu:ev_vein_drill",
  autofocus: "LB",
  title: "EV: Lunar Base",
  subtitle: ["The Moon learns to run without you, and then a rocket points at Mars."],
};

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
    key: "VAC", id: "16E2B1FFE70AC165", title: "Vacuum: Nothing Burns", icon: "minecraft:flint_and_steel", shape: "circle", size: 0.75,
    deps: ["LB"], x: 2, y: 1.5,
    desc: [
      "No air, no fire. Bring a diesel generator up here and it'll just sit there, looking embarrassed. Methalox and rocket fuel carry their own oxygen; EMI lists where everything else burns.",
    ],
    tasks: [ck("36E0705B646B27B6")],
    rewards: [xp(20, "31B61BB841330806")],
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
    rewards: [xp(80, "7451BE7DAFCDCDCC"), ri("grindless:stainless_steel_drill_bit", 2, "731EAC7375E702A5")],
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
      "EV energy hatches come much later, and until then two HV energy hatches on a multiblock run EV recipes just fine.",
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
    key: "BR", id: "366AB48E5BF50431", title: "Earth-Moon Bridge", icon: "ae2:quantum_link", shape: "gear", size: 1.25,
    deps: ["HE"], x: 4, y: -3,
    desc: [
      "The Earth-Moon bridge starts with a &6Lunar Quantum Seed&r, made in a chemical reactor up here from an ender pearl and helium-3. An ordinary singularity pair won't do: a lunar quantum chamber spits it out.",
      "One half goes in a chamber at home, one here, and both ends stay chunk-loaded.",
    ],
    tasks: [it("grindless:lunar_quantum_seed", 1, "76B12CF105EBB9FF"), it("ae2:quantum_entangled_singularity", 2, "7D3865E8AB3A4A6D"), it("ae2:quantum_link", 2, "105F48A9288461CC"), it("ae2:quantum_ring", 16, "318D644FC6DE61F3")],
    rewards: [xp(80, "7E388C5B6B30F54B")],
  },
  {
    key: "PE", id: "42BF2F77456F8773", title: "Power from Earth", icon: "eup2p:eu_p2p_tunnel",
    deps: ["BR"], x: 6, y: -4.5,
    desc: [
      "Two &6EU P2P Tunnels&r on one frequency, one on a cable at home and one on a hatch up here, and the power plant on Earth runs the Moon.",
      "The tunnels pass whatever voltage you feed them, so match it to the hatch at the far end. AE2 charges a small toll in AE energy for the delivery.",
    ],
    tasks: [it("eup2p:eu_p2p_tunnel", 2, "751D67F4EBA6DE8C")],
    rewards: [xp(60, "5D6B28FB61E42CBD")],
  },
  {
    key: "SP", id: "38AA0491A1AFD8C9", title: "A Second Pair, No Rocket", icon: "grindless:lunar_quantum_seed",
    deps: ["BR"], x: 6, y: -3,
    desc: [
      "Once the first bridge is up, the Moon can make its own seeds in a chemical reactor up here, with ender pearls sent from home and helium-3 from the drill or the cell.",
      "The seed travels home over the bridge, the explosion happens there, and one half travels back. Nobody has to fly.",
    ],
    tasks: [it("grindless:lunar_quantum_seed", 1, "11691B6B87A0E83E"), it("ae2:quantum_link", 2, "1BCF50880C918E54"), it("ae2:quantum_ring", 16, "172A4B25DF6871FF")],
    rewards: [xp(50, "5D23F1FDA315072E"), ri("minecraft:ender_pearl", 4, "3CA3C104FB1DDB7B")],
  },
  {
    key: "BRK", id: "33EFC07080657F50", title: "Bricks from the Ground", icon: "grindless:sintered_regolith",
    deps: ["LD"], x: 6, y: -1.5,
    desc: [
      "Cobblestone from the drill, or any lunar stone you dig up, grinds into &6Lunar Regolith Dust&r in any macerator.",
      "An electric furnace bakes that into &6Sintered Regolith Bricks&r, but only up here: at home the furnace just stares at it. Nearly the whole Moon base stands on these bricks.",
    ],
    tasks: [it("gtceu:lunar_regolith_dust", 1, "35C7DD57A884640E"), it("grindless:sintered_regolith", 16, "7504084A6B44AD55")],
    rewards: [xp(35, "12E9B79D096C02EA"), ri("gtceu:lunar_regolith_dust", 16, "3AB895BCA0F1FF7D")],
  },
  {
    key: "CELL", id: "5BEACE3F7A414F40", title: "Regolith Cell", icon: "gtceu:regolith_cell", shape: "gear", size: 1.5,
    deps: ["BRK", "MP", "X:70F4075BAF69DA99"], x: 10, y: -1.5,
    desc: [
      "The &6Regolith Cell&r cooks moon dirt until it gives up oxygen and metal, which is a lot to ask of dirt. It is a hall of sintered brick around a crucible ringed with nichrome coils, and it only works up here.",
      "A platinum electrode in the input bus is its anode. On circuit 3 it bakes bricks faster than a furnace.",
    ],
    tasks: [it("gtceu:regolith_cell", 1, "3955EAB8FBFF6100")],
    rewards: [xp(80, "138B6A7977750137"), ri("grindless:platinum_electrode", 1, "55ADFF45989716A6")],
  },
  {
    key: "BRO", id: "320CD85A4C8D87D5", title: "Oxygen from Rock", icon: "gtceu:oxygen_bucket",
    deps: ["CELL"], x: 12, y: -1.5,
    desc: [
      "On circuit 2 the cell melts regolith and runs current through it. Oxygen bubbles off the platinum anode, and iron and silicon settle out.",
      "That oxygen fills your suit and feeds the cryogenic plant.",
    ],
    tasks: [ck("33B726E8B2DB7D96")],
    rewards: [xp(35, "79FE3323A8B1B780")],
  },
  {
    key: "SWB", id: "1F20597E41D764DE", title: "Solar Wind, Bottled", icon: "gtceu:helium_bucket",
    deps: ["CELL"], x: 10, y: -3,
    desc: [
      "Billions of years of solar wind are stuck to the regolith grains. Circuit 1 heats them until they let go: mostly hydrogen and helium, a little nitrogen, a pinch of helium-3.",
      "Give each gas its own output hatch, or let one ME output hatch take the lot.",
    ],
    tasks: [ck("394D8CD1CC1EBBF9")],
    rewards: [xp(35, "5F5858D2E73DF3BF")],
  },
  {
    key: "TWC", id: "33176DE8937B3BEE", title: "Titanium without Chlorine", icon: "grindless:molten_salt_charge",
    deps: ["BRO", "DRY"], x: 14, y: -1.5,
    desc: [
      "Ilmenite dust in molten calcium chloride, current through it, and the oxygen leaves for the anode while the titanium stays behind. Same energy as the long way, and no chlorine at all.",
      "It runs on circuit 2 with the &6Molten Salt Charge&r in the bus, and the charge never gets used up. The platinum plant has calcium chloride to spare.",
    ],
    tasks: [it("grindless:molten_salt_charge", 1, "1CB526CAE9B11C78")],
    rewards: [xp(50, "125FC86C33CAA992")],
  },
  {
    key: "LSA", id: "734B97375A3121C4", title: "Lunar Solar Array", icon: "gtceu:lunar_solar_array", shape: "gear", size: 1.25,
    deps: ["CELL"], x: 12, y: -3,
    desc: [
      "The &6Lunar Solar Array&r is rows of wing panels on titanium posts over sintered brick. With circuit 1 in its input bus, every panel that sees open sky pays out by day.",
      "At night it rests, and buffers or Earth over the bridge keep the lights on.",
    ],
    tasks: [it("gtceu:lunar_solar_array", 1, "32C9AF4491B411D4")],
    rewards: [xp(80, "75E155745FD05519"), ri("grindless:solar_wing_panel", 3, "1D1C45A97E81AA5B")],
  },
  {
    key: "CRY", id: "79EE0C54F2D89358", title: "Cryogenic Plant", icon: "gtceu:cryogenic_plant", shape: "gear", size: 1.5,
    deps: ["SWB"], x: 10, y: -4.5,
    desc: [
      "The &6Cryogenic Plant&r is a frostproof tower on sintered brick with a wing of &6Night-Sky Radiators&r on each side, and it only runs on the Moon.",
      "At night it dumps its heat into the black sky and liquefies gases for half the vacuum freezer's energy. Keep the radiators uncovered.",
    ],
    tasks: [it("grindless:night_sky_radiator", 12, "3F869B2BB13436B0"), it("gtceu:cryogenic_plant", 1, "58324638CAF43E78")],
    rewards: [xp(80, "12ED220DB70AD3CF"), ri("grindless:night_sky_radiator", 2, "1E34767BB12D9536")],
  },
  {
    key: "LN2", id: "71F33D9D6D486DFE", title: "Liquid Nitrogen", icon: "gtceu:liquid_nitrogen_bucket",
    deps: ["CRY"], x: 12, y: -4.5,
    desc: [
      "GregTech never liquefied nitrogen, but the cryogenic plant does. Check the tooltip of every pipe and tank it goes through, since not all of them like cryogenic fluids.",
      "In the tripod's input hatch it keeps the bit cold: more ore, much less wear. Let the hatch run low and the tripod drills dry.",
    ],
    tasks: [it("gtceu:liquid_nitrogen_bucket", 1, "1BBB212BC73F2606")],
    rewards: [xp(45, "3ECB34DDDF8FD7F8"), ri("gtceu:stainless_steel_fluid_cell", 1, "3AA211C12A2B4DF1")],
  },
  {
    key: "LOX", id: "587829FDC7BAB863", title: "Liquid Oxygen", icon: "gtceu:liquid_oxygen_bucket",
    deps: ["CRY"], x: 12, y: -6,
    desc: [
      "The cell's oxygen becomes &6Liquid Oxygen&r here, as fast as in the freezer and at half the energy once the sun's down. The controller tells you what the next run will cost.",
      "Start a stockpile of liquid oxygen and liquid helium: IV's extreme engines want the first, its hottest ingots the second.",
    ],
    tasks: [it("gtceu:liquid_oxygen_bucket", 1, "7C844C0B7BCB595B")],
    rewards: [xp(40, "147BF2D687A70D59")],
  },
  {
    key: "DSA", id: "5940CA99055BAF42", title: "Deep Space Antenna", icon: "gtceu:deep_space_antenna", shape: "gear", size: 1.25,
    deps: ["LSA", "X:5C4613715A82BDBF"], x: 14, y: -3,
    desc: [
      "With Earth's noise blocked by 3,474 km of rock, the &6Deep Space Antenna&r hears a steady hiss from Sagittarius: the center of the galaxy, 26,000 light-years away. You will go there. Mars first.",
      "It only listens on the Moon, at night, and your landing-site chart calibrates the dish.",
    ],
    tasks: [it("gtceu:deep_space_antenna", 1, "1C33E0A1C8B74069")],
    rewards: [xp(100, "77023010782731C0"), ri("gtceu:data_stick", 1, "1B174F9D773F1E2C")],
  },
  {
    key: "DOME", id: "56820468F118D3EA", title: "Sealed Dome", icon: "gtceu:sealed_dome", shape: "gear", size: 1.25,
    deps: ["LSA"], x: 14, y: -4.5,
    desc: [
      "The &6Sealed Dome&r is a greenhouse that brings its own soil and makes a sky out of lamps. On circuit 5 (Moon) or 6 (Mars) it grows crops from water and carbon dioxide, and breathes out oxygen.",
      "Mars supplies the carbon dioxide from its air; up here it has to come from home.",
    ],
    tasks: [it("gtceu:sealed_dome", 1, "7D87303BAEF28490")],
    rewards: [xp(60, "320FD462BCBA4081"), ri("minecraft:dirt", 9, "77DB74D40CF625D1")],
  },
  {
    key: "TRP", id: "5107982325BE34B7", title: "EV Tripod Drill", icon: "gtceu:ev_vein_drill", shape: "gear", size: 1.25,
    deps: ["MP"], x: 12, y: 0,
    desc: [
      "The lunar drill was a visitor; the &6EV Tripod Drill&r moves in, on titanium legs with a solar wing on each side. It is crafted from the old lunar drill and only drills the veins of the Moon and Mars.",
      "Its titanium bits come off an EV lathe, and a full cycle can wear out one per bore.",
    ],
    tasks: [it("grindless:titanium_drill_bit", 16, "31582C1C38CC314C"), it("grindless:solar_wing_panel", 18, "123430355F4FAED8"), it("gtceu:ev_vein_drill", 1, "1C53BF2915922005")],
    rewards: [xp(100, "7D0D9D1EEC42BBEB"), ri("grindless:titanium_drill_bit", 8, "7C99B717F081DB18")],
  },
  {
    key: "DRY", id: "321540F2528D14FA", title: "Drilling Dry", icon: "gtceu:raw_ilmenite",
    deps: ["TRP"], x: 14, y: 0,
    desc: [
      "There's no water up here, so there's no drilling mud either, and a dry bit wears out fast. By day the solar wings cover half the bill; at night Earth pays all of it over the bridge.",
      "Swap an output bus for an ME Output Bus and the ilmenite ships itself home.",
    ],
    tasks: [it("gtceu:raw_ilmenite", 64, "159814B37781817F")],
    rewards: [xp(50, "3C91B7DB655E3564")],
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
    key: "CCP", id: "1DD071239194961D", title: "Combined-Cycle Plant", icon: "gtceu:combined_cycle_plant", shape: "gear", size: 1.25,
    deps: ["EVH"], x: 10, y: 3,
    desc: [
      "A gas turbine throws its exhaust away while it's still hot. The &6Combined-Cycle Plant&r, built around a large gas turbine controller, sends it through a boiler instead, so the same fuel also spins a &6Large Steam Turbine&r.",
      "Feed it distilled water; it needs no rotor. If the steam has nowhere to go, the whole plant stops.",
    ],
    tasks: [it("gtceu:combined_cycle_plant", 1, "39AE70B2671E0A18"), it("gtceu:steam_large_turbine", 1, "554E1B9CAF293B9A")],
    rewards: [xp(80, "1CD1FF02CF964051")],
  },
  {
    key: "HSM", id: "7637A9813DB73D6B", title: "Hot Strip Mill", icon: "gtceu:hot_strip_mill", shape: "gear", size: 1.25,
    deps: ["MP"], x: 10, y: 1.5,
    desc: [
      "The &6Hot Strip Mill&r rolls a hot ingot straight into plates, rods or foil, skipping the freezer and the bender. The circuit picks the shape.",
      "The cooling water comes out as steam, so give it a turbine to go to. Ingots that need liquid helium still go to the freezer.",
    ],
    tasks: [it("gtceu:hot_strip_mill", 1, "5BE8B5540509D143")],
    rewards: [xp(80, "352FB77A52EC3415")],
  },
  {
    key: "PP", id: "1F70EF41E5F8ED95", title: "Platinum Plant", icon: "gtceu:platinum_plant", shape: "gear", size: 1.5,
    deps: ["MP", "X:004525B795119B1B"], x: 12, y: 3,
    desc: [
      "GT--'s platinum line is about forty recipes across a dozen machines; the &6Platinum Plant&r packs it into one hall, loops and all. It drinks nitration mixture and ammonium chloride, so get both flowing first.",
      "Don't expect iridium or osmium from Earth's ore: those wait for Mercury. The electrode wears out rarely, and after the first one, made from End platinum, the plant pays for its own.",
    ],
    tasks: [it("grindless:platinum_electrode", 1, "593E46F6C0670998"), it("gtceu:platinum_plant", 1, "1B3F08EE9C03B6B0")],
    rewards: [xp(100, "3EACE716001AFAEB"), ri("grindless:platinum_electrode", 1, "1E92FF3E0CABF2CA")],
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
    rewards: [xp(40, "5067394C445994B8"), ri("grindless:ruthenium_catalyst", 1, "7E2ADEECDA9F8A70")],
  },
  {
    key: "EVHATCH", id: "147B753858CA98F8", title: "EV Hatches", icon: "gtceu:ev_energy_input_hatch",
    deps: ["PT"], x: 18, y: 4.5,
    desc: [
      "Real &6EV Energy Hatches&r need two things you only get late: fine platinum wire for the &6Extreme Voltage Coil&r, and MPIC chips.",
      "The chips come from a phosphorus boule that grows slowly in the blast furnace, so start one early. Dynamo hatches are built the same way.",
    ],
    tasks: [it("gtceu:mpic_chip", 1, "122E1A370CCA9586"), it("gtceu:ev_voltage_coil", 1, "1E4DA31A3DE66AED"), it("gtceu:ev_energy_input_hatch", 2, "34BB3C6659E110AC")],
    rewards: [xp(70, "1945B8580D9E3172")],
  },
  {
    key: "ECA", id: "3C5EB45848DA6797", title: "EV Circuit Assembler", icon: "gtceu:ev_circuit_assembler",
    deps: ["MP"], x: 12, y: 1.5,
    desc: [
      "Nano circuits need more voltage than the HV circuit assembler has. The &6EV Circuit Assembler&r asks for Microprocessor Mainframes, the micro line's IV circuit, so the cleanroom gets busy again.",
      "Its emitter is an HV one: the EV emitter waits for IV.",
    ],
    tasks: [it("gtceu:micro_processor_mainframe", 2, "57A2C4C8EBDA842C"), it("gtceu:ev_circuit_assembler", 1, "3304D08BC6374CB2")],
    rewards: [xp(60, "5BA2C540CC3F5FC0")],
  },
  {
    key: "NP", id: "115A9664BF3CF352", title: "Nanoprocessor", icon: "gtceu:nano_processor",
    deps: ["ECA"], x: 16, y: 1.5,
    desc: [
      "The nano line starts with a CPU wafer turned into a nano CPU wafer in an EV chemical reactor, inside the cleanroom.",
      "The &6Nanoprocessor&r is its HV circuit, and only the EV circuit assembler can put one together.",
    ],
    tasks: [it("gtceu:carbon_fibers", 1, "31FD831D914C3A7F"), it("gtceu:nano_cpu_wafer", 1, "58D15CEE70FAFFD8"), it("gtceu:nano_cpu_chip", 1, "78FC02B0C1444A88"), it("gtceu:nano_processor", 1, "56249581DA728383")],
    rewards: [xp(50, "1D596DC95CD2B572")],
  },
  {
    key: "NPA", id: "368E5D61D5E5572B", title: "Nanoprocessor Assembly", icon: "gtceu:nano_processor_assembly",
    deps: ["NP"], x: 20, y: 1.5,
    desc: [
      "The &6Nanoprocessor Assembly&r is the nano line's EV circuit, and it sits on an epoxy circuit board, so HV's epoxy line still has work to do. The supercomputer is built from these.",
    ],
    tasks: [it("gtceu:nano_processor_assembly", 1, "5EFB1E15AA8BFF6A")],
    rewards: [xp(50, "7624CE505F1A4895")],
  },
  {
    key: "NPC", id: "1D65975B45CF7836", title: "Nanoprocessor Supercomputer", icon: "gtceu:nano_processor_computer", shape: "gear", size: 1.5,
    deps: ["NPA"], x: 24, y: 1.5,
    desc: [
      "The &6Nanoprocessor Supercomputer&r is the IV circuit and the real wall of EV. Its NOR chips come from the same slow phosphorus boule as the MPIC chips, engraved with a pink lens this time.",
      "The SMD diodes want fine platinum wire, so the platinum plant comes first.",
    ],
    tasks: [it("gtceu:nor_memory_chip", 1, "7D94247AE508FA15"), it("gtceu:smd_diode", 1, "1CE9AE32E93A886E"), it("gtceu:nano_processor_computer", 1, "16EF052E69CEFC07")],
    rewards: [xp(120, "3BE3697CB13B80C4")],
  },
  {
    key: "MC", id: "319C39AD99B5E4A8", title: "The Way to Mars", icon: "grindless:mars_chart",
    deps: ["DSA"], x: 16, y: -1.5,
    desc: [
      "At night the antenna takes radio fixes on Mars, works out the next transfer window and marks a landing ellipse on the northern plains.",
      "Your landing-site chart stays in the bus, and a data stick comes out as the &6Mars Transfer Chart&r. The tier 2 rocket parts are built with it, and it's never used up.",
    ],
    tasks: [it("grindless:mars_chart", 1, "3A236F3B926B3BD2")],
    rewards: [xp(60, "1641701EDE841626")],
  },
  {
    key: "RKT", id: "5A84C7A4F1A7F2D9", title: "A Rocket for Mars", icon: "gcyr:advanced_rocket_motor",
    deps: ["MC", "DRY"], x: 16, y: 0,
    desc: [
      "Mars needs a tier 2 rocket, and the game averages your parts: a single basic motor or tank left on board keeps you at the Moon. Swap every one for an &6Advanced Rocket Motor&r or &6Advanced Fuel Tank&r, made in the EV assembler with the Mars chart.",
      "Two advanced tanks hold exactly one trip. Set the ID chip to Mars.",
    ],
    tasks: [it("gcyr:advanced_fuel_tank", 2, "1325820C09A0B5F9"), it("gcyr:advanced_rocket_motor", 6, "311C26C14AF5C9FE")],
    rewards: [xp(80, "17E645C4A771E50C"), ri("waystones:waystone", 1, "7E14DC7E71F53E24")],
  },
  {
    key: "RH", id: "3C5189B47D70D762", title: "Red Horizon", icon: "gcyr:mars_regolith", shape: "rsquare", size: 1.25,
    deps: ["RKT"], x: 18, y: 0,
    desc: [
      "Mars is cold and its air is thin carbon dioxide, but your HV suit copes. Bring a waystone: it's your ride home.",
      "Pack sintered-brick footings, the bridge parts, a chemical reactor with ender pearls and helium-3, and charged batteries. Sunlight is weak here, so the solar array wants circuit 2 and gives under a third.",
    ],
    tasks: [{ type: 'dimension', dimension: "gcyr:mars", id: "5A92C623281A6694" }],
    rewards: [xp(150, "59052BD0D36A5824"), ri("grindless:empty_vein_probe", 3, "1B2D6B69B1579CD9")],
  },
  {
    key: "SMP", id: "5EFC42884771D00C", title: "Martian Samples", icon: "grindless:vein_sample_scheelite_mars",
    deps: ["RH"], x: 20, y: 0,
    desc: [
      "Mars has only three veins: scheelite, merrillite and ice. None of them exists anywhere else, and small rocks on the surface give each one away.",
      "Dip a probe in both raw ores of each vein. Scheelite sits deepest, so expect a long dig.",
    ],
    tasks: [it("grindless:vein_sample_scheelite_mars", 1, "19C4B5C81E5E5DDC"), it("grindless:vein_sample_merrillite_mars", 1, "5E50801BB633D859"), it("grindless:vein_sample_ice_mars", 1, "11F2EA23D6358D4B")],
    rewards: [xp(60, "30C28952047E5D65")],
  },
  {
    key: "MSEED", id: "5301384885D78BAC", title: "A Seed from Mars", icon: "grindless:martian_quantum_seed",
    deps: ["SMP"], x: 20, y: -1.5,
    desc: [
      "Rare-earth ions are what real quantum memories store their states in, so merrillite gets the job here. A chemical reactor makes the &6Martian Quantum Seed&r from merrillite dust, an ender pearl and helium-3, and only on Mars.",
      "Raw merrillite becomes dust in a plain furnace, which still works here.",
    ],
    tasks: [it("grindless:martian_quantum_seed", 1, "13C945C4547889F7")],
    rewards: [xp(50, "7BA522A8AA02443F")],
  },
  {
    key: "EMB", id: "53893FAB153254B8", title: "Earth-Mars Bridge", icon: "ae2:quantum_ring", shape: "gear", size: 1.25,
    deps: ["MSEED"], x: 22, y: -3,
    desc: [
      "Blow the seed up with a singularity at home, then send one half to Mars. The Martian end needs no power of its own; once linked, it runs on the home network.",
      "Chunk-load both ends, same as the Moon.",
    ],
    tasks: [it("ae2:quantum_entangled_singularity", 2, "341F20E16D19B012"), it("ae2:quantum_link", 2, "7EA7F34E19722ED5"), it("ae2:quantum_ring", 16, "108C6CDDD90C502E")],
    rewards: [xp(80, "56844C1FA1C458D3")],
  },
  {
    key: "ATM", id: "58BBEC58FB5953BD", title: "Atmosphere Processor", icon: "gtceu:atmosphere_processor", shape: "gear", size: 1.5,
    deps: ["EMB"], x: 24, y: -4.5,
    desc: [
      "The &6Atmosphere Processor&r breathes Martian air, splits water and joins the hydrogen to the carbon dioxide: three machines in one, and it only runs on Mars.",
      "Circuit 1, with a ruthenium catalyst, makes methane and oxygen from water you send from home. Save the Martian ice for IV. Circuit 2 only collects carbon dioxide.",
    ],
    tasks: [it("gtceu:atmosphere_processor", 1, "78097613D42E5A43")],
    rewards: [xp(80, "7A0B13C332E8056B"), ri("grindless:ruthenium_catalyst", 1, "7CFB02E1A78ECD9E")],
  },
  {
    key: "MTH", id: "76CC753087EAD9F0", title: "Methalox", icon: "gtceu:methalox_bucket",
    deps: ["ATM"], x: 26, y: -4.5,
    desc: [
      "Methane and oxygen from the EV mixer make &6Methalox&r, a fuel that brings its own oxygen, so it burns in any gas turbine on Mars or the Moon.",
      "It costs more energy to make than it gives back, so treat it as a battery, not a power plant.",
    ],
    tasks: [it("gtceu:methalox_bucket", 1, "1C4C427019CC4B41")],
    rewards: [xp(45, "59C404F9D1D26FD8")],
  },
  {
    key: "MTR", id: "56FFD4EF98A6C3B8", title: "The Martian Tripod", icon: "gtceu:raw_scheelite",
    deps: ["SMP"], x: 22, y: 0,
    desc: [
      "Build a second EV Tripod Drill here and give it the scheelite sample and titanium bits. The solar wings don't do much in this weak sunlight.",
      "Tungsten only comes from Mars, and from now on it reaches home without you.",
    ],
    tasks: [it("gtceu:raw_scheelite", 16, "7391930490146D70")],
    rewards: [xp(80, "3977177DF1BB38B0"), ri("grindless:titanium_drill_bit", 8, "7DA8045ABC20D814")],
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
    key: "CAS", id: "3FCCD81DE98DA9EF", title: "Extraction Cascade", icon: "gtceu:extraction_cascade", shape: "gear", size: 1.5,
    deps: ["MTR"], x: 24, y: -1.5,
    desc: [
      "Merrillite is a phosphate, and no electrolyzer will split it. The &6Extraction Cascade&r leaches it in hydrochloric acid and then pulls the rare earths apart with kerosene, one stage at a time.",
      "Circuit 1 leaches, circuit 2 extracts. Each fluid needs its own output hatch, or the whole cascade stops.",
    ],
    tasks: [it("gtceu:merrillite_dust", 1, "783A6711D48C304B"), it("gtceu:extraction_cascade", 1, "7B8358196931945F")],
    rewards: [xp(80, "5F47032EACBE0A7F")],
  },
  {
    key: "SM", id: "72022B0ECDC3668B", title: "Samarium", icon: "gtceu:samarium_dust",
    deps: ["CAS"], x: 26, y: -3,
    desc: [
      "The cascade gives samarium, neodymium and mixed rare-earth chlorides, and hands most of the kerosene back. Any electrolyzer turns the chlorides into metal and chlorine.",
      "&6Samarium&r only comes from Mars, and IV's superconductor and LuV's motor magnets both want it, so start a pile.",
    ],
    tasks: [it("gtceu:samarium_chloride_dust", 1, "5C5A45DA7E372E3D"), it("gtceu:samarium_dust", 1, "1088F02E75EFC2DD")],
    rewards: [xp(60, "5E60AB1D3DB8F6C6")],
  },
  {
    key: "TU", id: "5B6B5BE89721691A", title: "Tungsten", icon: "gtceu:tungsten_ingot",
    deps: ["MTR"], x: 24, y: 0,
    desc: [
      "Scheelite takes the familiar road to &6Tungsten&r: an acid bath, the electrolyzer, the blast furnace and the freezer. Nichrome coils are just hot enough to melt it.",
    ],
    tasks: [it("gtceu:tungstic_acid_dust", 1, "1666328E006A2DD6"), it("gtceu:tungsten_dust", 1, "12F35AEF44226368"), it("gtceu:tungsten_ingot", 1, "71A6759B1111A3DC")],
    rewards: [xp(60, "3EDBCF351DEE2347")],
  },
  {
    key: "RTM", id: "3DB3729547372E91", title: "RTM Coils", icon: "gtceu:rtm_alloy_coil_block",
    deps: ["TU"], x: 26, y: -1.5,
    desc: [
      "&6RTM Alloy&r takes shopping on three worlds: ruthenium from the platinum plant, tungsten from Mars and molybdenum from the Nether. A blast furnace lined with its coils runs hotter than nichrome ever could.",
    ],
    tasks: [it("gtceu:rtm_alloy_coil_block", 4, "56EE64CD3A69B9CA")],
    rewards: [xp(80, "58D020FF415A194C")],
  },
  {
    key: "TS", id: "11BD5A24AAF314BC", title: "Tungsten Steel", icon: "gtceu:tungsten_steel_ingot",
    deps: ["TU"], x: 26, y: 0,
    desc: [
      "Tungsten and steel dust from the mixer take another trip through the blast furnace and the freezer. &6Tungsten Steel&r is what IV machines are made of, so you'll want plenty.",
    ],
    tasks: [it("gtceu:tungsten_steel_dust", 1, "3D4D6BFA66540329"), it("gtceu:tungsten_steel_ingot", 1, "106C109CA8C652F8")],
    rewards: [xp(60, "18399F59E4F03505")],
  },
  {
    key: "ORER", title: "Ore to Dust in One Pass", icon: "gtceu:ore_refinery", shape: "gear", size: 1.25,
    deps: ["TI"], x: 6, y: 1.5,
    desc: [
      "The &6Ore Refinery&r takes raw ore through the macerator, the washer, the thermal centrifuge and the sifter in a single recipe. The washer uses plain water here, and many ores go through at once.",
    ],
    tasks: [it("gtceu:ore_refinery", 1)],
    rewards: [xp(80), ri("gtceu:steel_plate", 8)],
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
