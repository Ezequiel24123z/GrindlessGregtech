// Quest data for ev_machines: one gear per multiblock of ours, and the integration rows (docs/reforge/05_quest_design.md, sections 2 and 3.2).
// Quests moved here from ev_age keep their keys and ids; every row starts at a link to the ev_age quest that opens it.
const it = (item, count, id) => ({ type: 'item', item, count, id });
const ck = (id) => ({ type: 'checkmark', id });
const xp = (n, id) => ({ type: 'xp', xp: n, id });
const ri = (item, count, id) => ({ type: 'item', item, count, id });

export const CHAPTER = {
  filename: "ev_machines",
  era: "ev",
  role: "machines",
  order: 2,
  icon: "gtceu:regolith_cell",
  autofocus: "TRP",
  title: "EV: Machines",
  subtitle: ["Eleven halls of ours, and the rules that let them run on two worlds."],
  section: { name: "EV: Machines", origin: { x: 0, y: 0 }, heading: { key: "H_MACHINES", x: 1, y: -4.5, deps: ["LB"], icon: "gtceu:regolith_cell", desc: ["The halls of the Moon base: oxygen, cold, power and the bridge home. Each machine here makes the next part of the journey work without you."] } },
};

export const LINKS = [];

export const QUESTS = [
  {
    key: "TRP", id: "5107982325BE34B7", kind: "machine", title: "EV Tripod Drill", icon: "gtceu:ev_vein_drill",
    deps: ["MP"], x: 10, y: -1.5,
    teach: {
      for: "The lunar drill was a visitor; the &6EV Tripod Drill&r moves in, on titanium legs with a solar wing on each side.",
      needs: "It is crafted from the old lunar drill, and titanium bits off an EV lathe: a full cycle can wear out one per bore.",
      unlocks: "It only drills the veins of the Moon and Mars, and it is where all your titanium and tungsten come from.",
      automate: "Let a lathe keep bits flowing by ME, and ship the ore home.",
    },
    desc: [],
    tasks: [it("grindless:titanium_drill_bit", 16, "31582C1C38CC314C"), it("grindless:solar_wing_panel", 18, "123430355F4FAED8"), it("gtceu:ev_vein_drill", 1, "1C53BF2915922005")],
    rewards: [xp(100, "7D0D9D1EEC42BBEB")],
  },
  {
    key: "DRY", id: "321540F2528D14FA", title: "Drilling Dry", icon: "gtceu:raw_ilmenite",
    deps: ["TRP"], x: 12, y: -1.5,
    desc: [
      "There's no water up here, so there's no drilling mud either, and a dry bit wears out fast. By day the solar wings cover half the bill; at night Earth pays all of it over the bridge.",
      "Swap an output bus for an ME Output Bus and the ilmenite ships itself home.",
    ],
    tasks: [it("gtceu:raw_ilmenite", 64, "159814B37781817F")],
    rewards: [xp(50, "3C91B7DB655E3564")],
  },
  {
    key: "CELL", id: "5BEACE3F7A414F40", kind: "machine", title: "Regolith Cell", icon: "gtceu:regolith_cell",
    deps: ["BRK", "X:70F4075BAF69DA99"], x: 8, y: -3,
    teach: {
      for: "The &6Regolith Cell&r cooks moon dirt until it gives up oxygen and metal.",
      needs: "A hall of sintered brick around a crucible ringed with nichrome coils, and a platinum electrode in the input bus as its anode.",
      unlocks: "Circuit 1 releases solar wind gases, circuit 2 gives oxygen and iron, and on circuit 3 it bakes bricks faster than a furnace.",
      automate: "Give each gas its own output hatch, or let one ME output hatch take the lot.",
    },
    desc: [],
    tasks: [it("gtceu:regolith_cell", 1, "3955EAB8FBFF6100")],
    rewards: [xp(80, "138B6A7977750137")],
  },
  {
    key: "BRO", id: "320CD85A4C8D87D5", title: "Oxygen from Rock", icon: "gtceu:oxygen_bucket",
    deps: ["CELL"], x: 10, y: -3,
    desc: [
      "On circuit 2 the cell melts regolith and runs current through it. Oxygen bubbles off the platinum anode, and iron and silicon settle out.",
      "That oxygen fills your suit and feeds the cryogenic plant.",
    ],
    tasks: [ck("33B726E8B2DB7D96")],
    rewards: [xp(35, "79FE3323A8B1B780")],
  },
  {
    key: "TWC", id: "33176DE8937B3BEE", title: "Titanium without Chlorine", icon: "grindless:molten_salt_charge",
    deps: ["BRO", "DRY"], x: 12, y: -3,
    desc: [
      "Ilmenite dust in molten calcium chloride, current through it, and the oxygen leaves for the anode while the titanium stays behind. Same energy as the long way, and no chlorine at all.",
      "It runs on circuit 2 with the &6Molten Salt Charge&r in the bus, and the charge never gets used up. The platinum plant has calcium chloride to spare.",
    ],
    tasks: [it("grindless:molten_salt_charge", 1, "1CB526CAE9B11C78")],
    rewards: [xp(50, "125FC86C33CAA992")],
  },
  {
    key: "ORER", kind: "machine", title: "Ore Refinery", icon: "gtceu:ore_refinery",
    deps: ["TI"], x: 6, y: 3,
    teach: {
      for: "The &6Ore Refinery&r takes raw ore through the macerator, the washer, the thermal centrifuge and the sifter in a single recipe.",
      needs: "Plain water for the washer, and a steady stream of raw ore.",
      unlocks: "Many ores at once, with every byproduct in one place.",
      automate: "Raw ore in from the drills by ME, dusts out to the lines.",
    },
    desc: [],
    tasks: [it("gtceu:ore_refinery", 1)],
    rewards: [xp(80), ri("gtceu:steel_plate", 8)],
  },
  {
    key: "HSM", id: "7637A9813DB73D6B", kind: "machine", title: "Hot Strip Mill", icon: "gtceu:hot_strip_mill",
    deps: ["ORER"], x: 6, y: 6,
    teach: {
      for: "The &6Hot Strip Mill&r rolls a hot ingot straight into plates, rods or foil, skipping the freezer and the bender.",
      needs: "A circuit that picks the shape, and cooling water that comes out as steam, so give it a turbine to go to.",
      unlocks: "Faster metal for every line. Ingots that need liquid helium still go to the freezer.",
      automate: "Ingots in by ME, plates and rods out, and the steam into the combined-cycle plant.",
    },
    desc: [],
    tasks: [it("gtceu:hot_strip_mill", 1, "5BE8B5540509D143")],
    rewards: [xp(80, "352FB77A52EC3415")],
  },
  {
    key: "PP", id: "1F70EF41E5F8ED95", kind: "signature", title: "Platinum Plant", icon: "gtceu:platinum_plant",
    deps: ["HSM", "X:004525B795119B1B"], x: 10, y: 6,
    teach: {
      for: "The platinum line is about forty recipes across a dozen machines; the &6Platinum Plant&r packs it into one hall, loops and all.",
      needs: "A 7x7x9 hall of inert casing, tempered glass and titanium pipes around a glass tower. Nitration mixture and ammonium chloride flowing first, and an electrode that wears out rarely: after the first one, made from End platinum, the plant pays for its own.",
      unlocks: "Platinum, rhodium, ruthenium and palladium. Iridium and osmium from Earth's ore don't exist: those wait for Mercury.",
      automate: "A battery buffer, plenty of output hatches and a place for every fluid.",
    },
    desc: [],
    tasks: [it("grindless:platinum_electrode", 1, "593E46F6C0670998"), it("gtceu:platinum_plant", 1, "1B3F08EE9C03B6B0")],
    rewards: [xp(100, "3EACE716001AFAEB")],
  },
  {
    key: "CRY", id: "79EE0C54F2D89358", kind: "machine", title: "Cryogenic Plant", icon: "gtceu:cryogenic_plant",
    deps: ["CELL"], x: 9, y: -7.5,
    teach: {
      for: "The &6Cryogenic Plant&r liquefies gases at night for half the vacuum freezer's energy, and only runs on the Moon.",
      needs: "A frostproof tower on sintered brick with a wing of &6Night-Sky Radiators&r on each side. Keep the radiators uncovered.",
      unlocks: "Liquid nitrogen, liquid oxygen and the stockpile IV will ask for.",
      automate: "Gas from the cell goes in by hatch, liquids go out to tanks.",
    },
    desc: [],
    tasks: [it("grindless:night_sky_radiator", 12, "3F869B2BB13436B0"), it("gtceu:cryogenic_plant", 1, "58324638CAF43E78")],
    rewards: [xp(80, "12ED220DB70AD3CF")],
  },
  {
    key: "LN2", id: "71F33D9D6D486DFE", title: "Liquid Nitrogen", icon: "gtceu:liquid_nitrogen_bucket",
    deps: ["CRY"], x: 9, y: -9,
    desc: [
      "GregTech never liquefied nitrogen, but the cryogenic plant does. Check the tooltip of every pipe and tank it goes through, since not all of them like cryogenic fluids.",
      "In the tripod's input hatch it keeps the bit cold: more ore, much less wear. Let the hatch run low and the tripod drills dry.",
    ],
    tasks: [it("gtceu:liquid_nitrogen_bucket", 1, "1BBB212BC73F2606")],
    rewards: [xp(45, "3ECB34DDDF8FD7F8"), ri("gtceu:stainless_steel_fluid_cell", 1, "3AA211C12A2B4DF1")],
  },
  {
    key: "LOX", id: "587829FDC7BAB863", title: "Liquid Oxygen", icon: "gtceu:liquid_oxygen_bucket",
    deps: ["CRY"], x: 11, y: -7.5,
    desc: [
      "The cell's oxygen becomes &6Liquid Oxygen&r here, as fast as in the freezer and at half the energy once the sun's down. The controller tells you what the next run will cost.",
      "Start a stockpile of liquid oxygen and liquid helium: IV's extreme engines want the first, its hottest ingots the second.",
    ],
    tasks: [it("gtceu:liquid_oxygen_bucket", 1, "7C844C0B7BCB595B")],
    rewards: [xp(40, "147BF2D687A70D59")],
  },
  {
    key: "VAC", id: "16E2B1FFE70AC165", title: "Vacuum: Nothing Burns", icon: "minecraft:flint_and_steel", shape: "circle", size: 0.75,
    deps: ["LB"], x: 2, y: -3,
    desc: [
      "No air, no fire. Bring a diesel generator up here and it'll just sit there, looking embarrassed. Methalox and rocket fuel carry their own oxygen; EMI lists where everything else burns.",
    ],
    tasks: [ck("36E0705B646B27B6")],
    rewards: [xp(20, "31B61BB841330806")],
  },
  {
    key: "LSA", id: "734B97375A3121C4", kind: "machine", title: "Lunar Solar Array", icon: "gtceu:lunar_solar_array",
    deps: ["CELL"], x: 10, y: -4.5,
    teach: {
      for: "The &6Lunar Solar Array&r is rows of wing panels on titanium posts over sintered brick. With circuit 1 in its input bus, every panel that sees open sky pays out by day.",
      needs: "Wing panels, a clear sky and brick footings.",
      unlocks: "Moon power that needs no fuel. At night it rests, so buffers or Earth over the bridge keep the lights on.",
      automate: "Wire it to a battery buffer and let the bridge fill the gap.",
    },
    desc: [],
    tasks: [it("gtceu:lunar_solar_array", 1, "32C9AF4491B411D4")],
    rewards: [xp(80, "75E155745FD05519")],
  },
  {
    key: "CCP", id: "1DD071239194961D", kind: "machine", title: "Combined-Cycle Plant", icon: "gtceu:combined_cycle_plant",
    deps: ["VAC"], x: 2, y: -6,
    teach: {
      for: "A gas turbine throws its exhaust away while it's still hot. The &6Combined-Cycle Plant&r sends it through a boiler instead, so the same fuel also spins a &6Large Steam Turbine&r.",
      needs: "A large gas turbine controller and distilled water. It needs no rotor.",
      unlocks: "More EU from the same fuel. If the steam has nowhere to go, the whole plant stops.",
      automate: "Distilled water by pipe, fuel by ME, and make sure the output never backs up.",
    },
    desc: [],
    tasks: [it("gtceu:combined_cycle_plant", 1, "39AE70B2671E0A18"), it("gtceu:steam_large_turbine", 1, "554E1B9CAF293B9A")],
    rewards: [xp(80, "1CD1FF02CF964051")],
  },
  {
    key: "DOME", id: "56820468F118D3EA", kind: "machine", title: "Sealed Dome", icon: "gtceu:sealed_dome",
    deps: ["LSA"], x: 10, y: -6,
    teach: {
      for: "The &6Sealed Dome&r is a greenhouse that brings its own soil and makes a sky out of lamps.",
      needs: "Water and carbon dioxide. Circuit 5 runs on carbon dioxide you ship in, anywhere; Mars supplies its own from the air.",
      unlocks: "On circuit 5 (any world) or 6 (Mars only) it grows crops and breathes out oxygen.",
      automate: "Water and gas by hatch, harvest by output bus.",
    },
    desc: [],
    tasks: [it("gtceu:sealed_dome", 1, "7D87303BAEF28490")],
    rewards: [xp(80, "320FD462BCBA4081")],
  },
  {
    key: "DSA", id: "5940CA99055BAF42", kind: "machine", title: "Deep Space Antenna", icon: "gtceu:deep_space_antenna",
    deps: ["LSA", "X:5C4613715A82BDBF"], x: 12, y: -4.5,
    teach: {
      for: "With Earth's noise blocked by 3,474 km of rock, the &6Deep Space Antenna&r hears a steady hiss from Sagittarius. You will go there. Mars first.",
      needs: "Night on the Moon and your landing-site chart, which calibrates the dish.",
      unlocks: "The Mars Transfer Chart, and with it the road to Mars.",
      automate: "It runs unattended at night. Keep a data stick ready.",
    },
    desc: [],
    tasks: [it("gtceu:deep_space_antenna", 1, "1C33E0A1C8B74069")],
    rewards: [xp(100, "77023010782731C0"), ri("gtceu:data_stick", 1, "1B174F9D773F1E2C")],
  },
  {
    key: "BR", id: "366AB48E5BF50431", title: "Earth-Moon Bridge", icon: "ae2:quantum_link", shape: "gear", size: 1.25,
    deps: ["HE"], x: 4, y: -4.5,
    desc: [
      "The Earth-Moon bridge starts with a &6Lunar Quantum Seed&r, made in a chemical reactor from an ender pearl and helium-3, anywhere. An ordinary singularity pair won't do: a lunar quantum chamber spits it out.",
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
      "There is no recipe for the tunnel: craft an ordinary ME P2P Tunnel and right-click it with a GregTech wire or cable. That attunes it to EU, and the cable you choose is the voltage it carries. Make a pair on one frequency: the home end next to the generators, the far end next to the Moon base's main hatch.",
    ],
    tasks: [it("eup2p:eu_p2p_tunnel", 2, "751D67F4EBA6DE8C")],
    rewards: [xp(60, "5D6B28FB61E42CBD")],
  },
  {
    key: "SP", id: "38AA0491A1AFD8C9", title: "A Second Pair, No Rocket", icon: "grindless:lunar_quantum_seed",
    deps: ["BR"], x: 5, y: -3,
    desc: [
      "A chemical reactor makes a seed anywhere, so once the first bridge is up the Moon can make its own, with ender pearls sent from home and helium-3 from the drill or the cell.",
      "The seed travels home over the bridge, the explosion happens there, and one half travels back. Nobody has to fly.",
    ],
    tasks: [it("grindless:lunar_quantum_seed", 1, "11691B6B87A0E83E"), it("ae2:quantum_link", 2, "1BCF50880C918E54"), it("ae2:quantum_ring", 16, "172A4B25DF6871FF")],
    rewards: [xp(70, "5D23F1FDA315072E")],
  },
  {
    key: "EMB", id: "53893FAB153254B8", title: "Earth-Mars Bridge", icon: "ae2:quantum_ring", shape: "gear", size: 1.25,
    deps: ["MSEED"], x: 19, y: -6.75,
    desc: [
      "Blow the seed up with a singularity at home, then send one half to Mars. The Martian end needs no power of its own; once linked, it runs on the home network.",
      "Chunk-load both ends, same as the Moon.",
    ],
    tasks: [it("ae2:quantum_entangled_singularity", 2, "341F20E16D19B012"), it("ae2:quantum_link", 2, "7EA7F34E19722ED5"), it("ae2:quantum_ring", 16, "108C6CDDD90C502E")],
    rewards: [xp(80, "56844C1FA1C458D3")],
  },
  {
    key: "ATM", id: "58BBEC58FB5953BD", kind: "machine", title: "Atmosphere Processor", icon: "gtceu:atmosphere_processor",
    deps: ["EMB"], x: 22, y: -6.75,
    teach: {
      for: "The &6Atmosphere Processor&r breathes Martian air, splits water and joins the hydrogen to the carbon dioxide: three machines in one, and it only runs on Mars.",
      needs: "Water sent from home and a ruthenium catalyst. Save the Martian ice for IV.",
      unlocks: "Circuit 1 makes methane and oxygen; circuit 2 only collects carbon dioxide.",
      automate: "Water over the bridge, products home by ME.",
    },
    desc: [],
    tasks: [it("gtceu:atmosphere_processor", 1, "78097613D42E5A43")],
    rewards: [xp(80, "7A0B13C332E8056B")],
  },
  {
    key: "MTH", id: "76CC753087EAD9F0", title: "Methalox", icon: "gtceu:methalox_bucket",
    deps: ["ATM"], x: 28, y: -6,
    desc: [
      "Methane and oxygen from the EV mixer make &6Methalox&r, a fuel that brings its own oxygen, so it burns in any gas turbine on Mars or the Moon.",
      "It costs more energy to make than it gives back, so treat it as a battery, not a power plant.",
    ],
    tasks: [it("gtceu:methalox_bucket", 1, "1C4C427019CC4B41")],
    rewards: [xp(45, "59C404F9D1D26FD8")],
  },
  {
    key: "CAS", id: "3FCCD81DE98DA9EF", kind: "machine", title: "Extraction Cascade", icon: "gtceu:extraction_cascade",
    deps: ["MTR"], x: 20, y: -1.5,
    teach: {
      for: "Merrillite is a phosphate, and no electrolyzer will split it. The &6Extraction Cascade&r leaches it in hydrochloric acid and then pulls the rare earths apart with kerosene, one stage at a time.",
      needs: "A 7x5x13 hall of mixer-settler stages in inert PTFE casing and tempered glass. Merrillite dust, hydrochloric acid and kerosene for the Martian feed.",
      unlocks: "Samarium, neodymium and mixed rare-earth chlorides. Circuit 1 leaches, circuit 2 extracts, and circuit 28 makes the SEG cut that strips europium from the Nether line.",
      automate: "Each fluid needs its own output hatch, or the whole cascade stops.",
    },
    desc: [],
    tasks: [it("gtceu:merrillite_dust", 1, "783A6711D48C304B"), it("gtceu:extraction_cascade", 1, "7B8358196931945F")],
    rewards: [xp(80, "5F47032EACBE0A7F")],
  },
  {
    key: "EVHATCH", id: "147B753858CA98F8", title: "EV Hatches", icon: "gtceu:ev_energy_input_hatch",
    deps: ["PT"], x: 14, y: 4.5,
    desc: [
      "Real &6EV Energy Hatches&r need two things you only get late: fine platinum wire for the &6Extreme Voltage Coil&r, and MPIC chips.",
      "The chips come from a phosphorus boule that grows slowly in the blast furnace, so start one early. Dynamo hatches are built the same way.",
    ],
    tasks: [it("gtceu:mpic_chip", 1, "122E1A370CCA9586"), it("gtceu:ev_voltage_coil", 1, "1E4DA31A3DE66AED"), it("gtceu:ev_energy_input_hatch", 2, "34BB3C6659E110AC")],
    rewards: [xp(70, "1945B8580D9E3172")],
  },
  {
    key: "TWOH", title: "Two Hatches Will Do", icon: "gtceu:hv_energy_input_hatch", shape: "circle", size: 0.75,
    deps: ["EVH"], x: 8, y: -1.5,
    desc: [
      "EV energy hatches come much later, and until then two HV energy hatches on a multiblock run EV recipes just fine.",
      "Build the halls now and swap the hatches when the chips arrive.",
    ],
    tasks: [{ type: "checkmark" }],
    rewards: [xp(20)],
  },
];
