// Quest data for iv_age: the IV journey and its capstone; tools/quests/gen-chapters.mjs writes the chapter. The gears live in iv_machines
// and the quantum ladder in iv_circuits. Ids of quests that kept their meaning are pinned (RF-5L2 import); new quests derive theirs.
const it = (item, count) => (count === undefined ? { type: 'item', item } : { type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

const step = (key, id, title, icon, deps, x, y, desc, tasks, rewards, optional) =>
  ({ key, id, title, icon, deps, x, y, ...(optional ? { optional: true } : {}), desc, tasks, rewards });

// The changed lines, one quest per step that makes a new species. The folded shortcuts (hot cell circuit 1, platinum plant circuit 3)
// stay on the spine; these rows teach the real chain behind them and nothing on the spine waits for them.
const BRANCHES = [
  // Fuel front end: leach liquor to enriched uranium, step by step
  step("IV_URANYL_LIQUOR", "72950A35E94ED64F", "Uranyl Liquor", "gtceu:uranyl_sulfate_liquor_bucket", ["IV_IN_SITU_LEACH_FIELD"], 6.5, 3,
    ["The leach field no longer hands you rock, only a pale &6Uranyl Sulfate Liquor&r pumped out of the pitchblende. It's the start of the long way round to enriched uranium, the one the hot cell folds into a single recipe.", "Pipe it out of the field and keep a tank of it ready for the next step."],
    [it("gtceu:uranyl_sulfate_liquor_bucket")], [xp(30)], true),
  step("IV_URANIUM_ELUATE", "30ED21805A9D7D52", "Uranium Eluate", "gtceu:uranium_eluate_bucket", ["IV_URANYL_LIQUOR"], 8.5, 3,
    ["A large chemical reactor passes the liquor over ion-exchange resin, which grabs the uranium and lets everything else go. What comes out is &6Uranium Eluate&r, plus diluted sulfuric acid you can recycle.", "Feed the resin and the liquor from buses, and send the acid back to the plant."],
    [it("gtceu:uranium_eluate_bucket")], [xp(30)], true),
  step("IV_YELLOWCAKE", "3EE025908022C81B", "Yellowcake", "gtceu:yellowcake_dust", ["IV_URANIUM_ELUATE"], 10.5, 3,
    ["Hydrogen peroxide drops the uranium out of the eluate as &6Yellowcake&r, and the sulfuric acid comes back for another round. A chemical reactor does it, and a pump on the acid line closes the loop.", "Yellowcake is the form uranium ships in, which is why it sounds so ominous."],
    [it("gtceu:yellowcake_dust")], [xp(30)], true),
  step("IV_U3O8", "3D922EF8A7A71BA8", "Triuranium Octoxide", "gtceu:triuranium_octoxide_dust", ["IV_YELLOWCAKE"], 12.5, 3,
    ["An electric blast furnace at the lower coil tier roasts the yellowcake into &6Triuranium Octoxide&r, the stable oxide. It needs a steady heat and nothing else, so one furnace fed by a bus keeps it going.", "Next it gets reduced."],
    [it("gtceu:triuranium_octoxide_dust")], [xp(30)], true),
  step("IV_URANINITE_ROAST", "32C246F3F710DDCA", "Uraninite Again", "gtceu:uraninite_dust", ["IV_U3O8"], 14.5, 3,
    ["Hydrogen strips oxygen off the oxide in a hotter blast furnace, and out comes clean &6Uraninite&r, ready to take fluorine. Run the hydrogen from your electrolysers and the furnace needs no attention.", "Yes, you've now made uraninite from uraninite. The detour was the point."],
    [it("gtceu:uraninite_dust")], [xp(30)], true),
  step("IV_UF4", "3E95F7B29EEF175F", "Uranium Tetrafluoride", "gtceu:uranium_tetrafluoride_dust", ["IV_URANINITE_ROAST"], 16.5, 3,
    ["Uraninite and hydrofluoric acid meet in a large chemical reactor and make &6Uranium Tetrafluoride&r, the green salt. The HF is the kiln's, so keep it flowing by pipe.", "From here the fluorine is the whole story."],
    [it("gtceu:uranium_tetrafluoride_dust")], [xp(40)], true),
  step("IV_UF6", "1C25A2FDF954027C", "Uranium Hexafluoride", "gtceu:uranium_hexafluoride_bucket", ["IV_UF4"], 18.5, 3,
    ["Fluorine takes the tetrafluoride up to &6Uranium Hexafluoride&r, a gas at the temperatures that matter, and that's exactly what a centrifuge wants. Pipe the fluorine from your electrolysis line.", "It is also nasty stuff, so keep it in tanks."],
    [it("gtceu:uranium_hexafluoride_bucket")], [xp(40)], true),
  step("IV_UF6_ENRICHED", "58CC8D75DBD62574", "Spun and Split", "gtceu:enriched_uranium_hexafluoride_bucket", ["IV_UF6"], 20.5, 3,
    ["A centrifuge splits the gas into &6Enriched UF6&r and a depleted stream, and a last large chemical reactor with steam and hydrogen turns each into dust and gives the fluorine back as HF. That's the whole of circuit 1 in the hot cell, unfolded.", "Automate it and the hot cell becomes a luxury."],
    [it("gtceu:enriched_uranium_hexafluoride_bucket"), it("gtceu:depleted_uranium_hexafluoride_bucket")], [xp(50)], true),

  // Zirconium for Zircaloy, from the End's zircon
  step("IV_ZIRCON_CHLORIDE", "10FDDB217295CE41", "Zircon Chloride", "grindless:zr_hf_chloride_dust", ["IV_FUEL_FABRICATION_PLANT"], 5.75, -5,
    ["Zircaloy tubes start as the End's red zircon. A chemical reactor chlorinates it with carbon and chlorine into &6Zr-Hf Chloride&r, with zirconium and hafnium still together.", "Feed it from a zircon drill line and the chlorine from your electrolysers."],
    [it("gtca:red_zircon_dust"), it("grindless:zr_hf_chloride_dust")], [xp(30)], true),
  step("IV_ZR_HF_CUT", "7AB284E7415B1B48", "Zirconium without Hafnium", "grindless:zirconium_chloride_dust", ["IV_ZIRCON_CHLORIDE"], 7.75, -5,
    ["Hafnium eats neutrons, so a reactor wants zirconium without it. The extraction cascade splits the chloride into &6Zirconium Chloride&r and hafnium chloride, and you'll want to keep the hafnium for much later.", "Set circuit 8 and let it run from a bus."],
    [it("grindless:zirconium_chloride_dust"), it("grindless:hafnium_chloride_dust")], [xp(40)], true),
  step("IV_ZR_SPONGE", "571BC6BEA49E80B4", "Zirconium Sponge", "grindless:zirconium_sponge", ["IV_ZR_HF_CUT"], 9.75, -5,
    ["Magnesium reduces the chloride to &6Zirconium Sponge&r in the fuel fabrication plant, under argon. The sponge is what the mixer wants.", "Keep a bus of magnesium dust beside it."],
    [it("grindless:zirconium_sponge")], [xp(40)], true),
  step("IV_ZIRCALOY", "5BFA3C91B22A0A4C", "Zircaloy", "gtceu:zircaloy_ingot", ["IV_ZR_SPONGE"], 11.75, -5,
    ["A mixer folds the sponge together with a little tin into &6Zircaloy&r, tough enough to hold fuel and invisible to neutrons. Melt it into ingots and roll tubes for the LEU assembly.", "Automate it and the fuel line never starves for cladding."],
    [it("gtceu:zircaloy_ingot")], [xp(50)], true),

  // Closing the loop: plutonium back into the reactor
  step("IV_MOX", "344E7865AFE4DE0D", "MOX Fuel", "grindless:mox_fuel_assembly", ["IV_REPROCESSING"], 26.75, 2,
    ["The plutonium you reprocessed goes back to work. Circuit 2 in the hot cell blends it with uranium into a &6MOX Fuel Assembly&r, and the reactor burns it like any other fuel.", "Feed the spent assemblies back in by bus and the loop closes: fuel goes in, power comes out, waste becomes fuel."],
    [it("grindless:mox_fuel_assembly")], [xp(80)]),
  step("IV_BREEDER", "3EAA3FBD8795A8DB", "Breeder Assembly", "grindless:breeder_fuel_assembly", ["IV_MOX"], 28.75, 2,
    ["A &6Breeder Fuel Assembly&r from the hot cell, circuit 2 again, makes more plutonium than it uses. Run one beside the MOX loop and your reprocessor never runs dry.", "Not free energy, just patience."],
    [it("grindless:breeder_fuel_assembly")], [xp(80)]),

  // PBI: from chlorobenzene to the insulating fabric the thermal suit needs
  step("IV_CHLOROBENZENE", "5A33EE3D00497E1E", "Chlorobenzene", "gtceu:chlorobenzene_bucket", ["IV_REPROCESSING"], 26, 4.5,
    ["The thermal suit needs fabric that survives Mercury, and that means polybenzimidazole. It starts with &6Chlorobenzene&r from benzene and chlorine in a chemical reactor.", "Pipe the benzene from your oil line and the chlorine from the electrolysers."],
    [it("gtceu:chlorobenzene_bucket")], [xp(40)]),
  step("IV_NITROCHLOROBENZENE", "1E9EC2AF5DED6169", "Nitrochlorobenzene", "gtceu:nitrochlorobenzene_bucket", ["IV_CHLOROBENZENE"], 28, 4.5,
    ["Nitration mixture adds the nitro groups and gives &6Nitrochlorobenzene&r. Keep the acids in dedicated tanks.", "Automate it with a pump per acid."],
    [it("gtceu:nitrochlorobenzene_bucket")], [xp(40)]),
  step("IV_DICHLOROBENZIDINE", "322B526A30805D80", "Dichlorobenzidine", "gtceu:dichlorobenzidine_bucket", ["IV_NITROCHLOROBENZENE"], 30, 4.5,
    ["Two rings join into &6Dichlorobenzidine&r, a step closer to the polymer.", "A single chemical reactor with the right circuit keeps up if you feed it by pipe."],
    [it("gtceu:dichlorobenzidine_bucket")], [xp(40)]),
  step("IV_DIAMINOBENZIDINE", "34D40E52EC3B7994", "Diaminobenzidine", "gtceu:diaminobenzidine_bucket", ["IV_DICHLOROBENZIDINE"], 32, 4.5,
    ["Ammonia swaps the chlorines for amines and leaves &6Diaminobenzidine&r, one of the two halves of PBI.", "The other half is the isophthalate branch just below."],
    [it("gtceu:diaminobenzidine_bucket")], [xp(40)]),
  step("IV_ISOPHTHALATE", "5B32D9128788FA5F", "Diphenyl Isophthalate", "gtceu:diphenyl_isophthalate_bucket", ["IV_NITROCHLOROBENZENE"], 31, 6.25,
    ["Phenol and phthalic acid combine into &6Diphenyl Isophthalate&r, the other half of the polymer. Make it beside the diaminobenzidine and let both pipes meet at the polymerizer.", "Phenol is easy once you have a coal tar line."],
    [it("gtceu:diphenyl_isophthalate_bucket")], [xp(40)]),
  step("IV_PBI_FLUID", "39442B3BEA24CCC3", "Polybenzimidazole", "gtceu:polybenzimidazole_bucket", ["IV_DIAMINOBENZIDINE", "IV_ISOPHTHALATE"], 34, 4.5,
    ["The two halves react into liquid &6Polybenzimidazole&r, the plastic that laughs at heat. Run both feeds from tanks and the reactor sets its own pace.", "Next it gets cast and rolled."],
    [it("gtceu:polybenzimidazole_bucket")], [xp(60)]),
  step("IV_PBI_FOIL", "7AABD30EE6634C08", "PBI Foil", "gtceu:polybenzimidazole_foil", ["IV_PBI_FLUID"], 36, 4.5,
    ["Cast the fluid into ingots, then roll them into &6PBI Foil&r. A foil line off a bender keeps up with the fabric assembler.", "Para-aramid and PTFE foil are the other two layers."],
    [it("gtceu:polybenzimidazole_ingot"), it("gtceu:polybenzimidazole_foil")], [xp(60)]),
  step("IV_INSULATING_FABRIC", "3B013256ED81A3A9", "Insulating Fabric", "gcyr:insulating_fabric", ["IV_PBI_FOIL"], 39, 3,
    ["An assembler layers PBI, para-aramid and PTFE foil into &6Insulating Fabric&r, which goes into the thermal suit's smithing template. Build a small foil bus so one assembler makes them all.", "Mercury will test it."],
    [it("gcyr:insulating_fabric")], [xp(80)]),

  // Naquadah and platinum-group, unfolded
  step("IV_NAQUADAH_OXIDES", "7ADD2278E31A240E", "Oxide Mixture", "gtceu:naquadah_oxide_mixture_dust", ["IV_RAW_NAQUADAH"], 55, -2.75,
    ["Raw naquadah is ground and washed into an &6Oxide Mixture&r that the plant takes in circuit 1. It also needs a neutron source, and gallium and titanium come out as byproducts.", "Feed it by bus and the plant runs unattended."],
    [it("gtceu:naquadah_oxide_mixture_dust")], [xp(50)]),
  step("IV_NAQUADAH_DUST", "35D0E940C0A997B4", "Naquadah Dust", "gtceu:naquadah_dust", ["IV_NAQUADAH_OXIDES", "IV_NAQUADAH_PLANT"], 58.25, -2.75,
    ["The plant turns the mixture into &6Naquadah Dust&r, which then goes to the blast furnace for the hot ingot. That's the very start of the quantum wafers.", "Keep the byproduct hatches emptied or the plant stalls."],
    [it("gtceu:naquadah_dust")], [xp(60)]),
  step("IV_RAREST_METALS", "366A06483B5FCF08", "Rarest Metal Mixture", "gtceu:rarest_metal_mixture_dust", ["IV_MERCURY_VEIN_DRILL"], 54.75, 4,
    ["The platinum plant on circuit 3 hides a long chain. Unfolded, it starts in the solar works: iridosmine is fused into a &6Rarest Metal Mixture&r and osmium tetroxide.", "Build it if you want the real thing; the plant will do the rest."],
    [it("gtceu:rarest_metal_mixture_dust")], [xp(40)], true),
  step("IV_OSMIUM_TETROXIDE", "10AD66A112A6CA9C", "Osmium Tetroxide", "gtceu:osmium_tetroxide_bucket", ["IV_RAREST_METALS"], 56, 5.5,
    ["The fusion also gives &6Osmium Tetroxide&r, which is toxic and must stay in tanks. Reduce it to osmium and you have the other half of the line.", "Never vent it."],
    [it("gtceu:osmium_tetroxide_bucket")], [xp(40)], true),
  step("IV_OSMIUM_METAL", "7BC9481B61245FCE", "Osmium", "gtceu:osmium_ingot", ["IV_OSMIUM_TETROXIDE"], 57.25, 5.5,
    ["Reduce the tetroxide and cast the &6Osmium&r ingots. Osmium is among the densest metals and will make rotors and armour later.", "A tank-fed reactor handles it."],
    [it("gtceu:osmium_dust"), it("gtceu:osmium_ingot")], [xp(50)], true),
  step("IV_IRIDIUM_RESIDUE", "3CA5AE7AE68D8B1B", "Iridium Residue", "gtceu:iridium_metal_residue_dust", ["IV_RAREST_METALS"], 56, 4,
    ["A blast furnace burns the mixture down to &6Iridium Metal Residue&r, the stubborn rest of the platinum group.", "One furnace on a bus covers it."],
    [it("gtceu:iridium_metal_residue_dust")], [xp(40)], true),
  step("IV_IRIDIUM_DIOXIDE", "1DD88D65C232A993", "Iridium Dioxide", "gtceu:iridium_dioxide_dust", ["IV_IRIDIUM_RESIDUE"], 57.25, 4,
    ["Processing the residue gives &6Iridium Dioxide&r.", "Feed it to the next reactor in line."],
    [it("gtceu:iridium_dioxide_dust")], [xp(40)], true),
  step("IV_ACIDIC_IRIDIUM", "3AF926C8DD78295B", "Acidic Iridium", "gtceu:acidic_iridium_bucket", ["IV_IRIDIUM_DIOXIDE"], 58.5, 4,
    ["Dissolve the dioxide in acid and you have &6Acidic Iridium&r, a liquid iridium can be coaxed out of.", "Acids belong in tanks."],
    [it("gtceu:acidic_iridium_bucket")], [xp(40)], true),
  step("IV_IRIDIUM_CHLORIDE", "1A379DBEE493AAEB", "Iridium Chloride", "gtceu:iridium_chloride_dust", ["IV_ACIDIC_IRIDIUM"], 59.75, 4,
    ["Precipitate it into &6Iridium Chloride&r, almost there.", "The chain is long, so automate it once."],
    [it("gtceu:iridium_chloride_dust")], [xp(40)], true),
  step("IV_IRIDIUM_METAL", "162CF4FCADFF1AC8", "Iridium", "gtceu:iridium_ingot", ["IV_IRIDIUM_CHLORIDE"], 60, 5.5,
    ["Reduce the chloride and cast the &6Iridium&r ingot. This is the real chain behind the platinum plant's third mode, and the metal that finally frees you from the EV hatches.", "Take the shortcut next time."],
    [it("gtceu:iridium_dust"), it("gtceu:iridium_ingot")], [xp(60)], true),

  // Niobium and tantalum from the kiln
  step("IV_PYROCHLORE", "5EB1428768BFC192", "Pyrochlore", "gtceu:pyrochlore_dust", ["IV_FLUORSPAR_KILN"], 3.75, 3.25,
    ["Pyrochlore carries niobium, the metal LuV hulls and superconducting cables want. Crush it to &6Pyrochlore Dust&r and take it to the kiln.", "Feed the kiln from a bus and the HF from a pipe."],
    [it("gtceu:pyrochlore_dust")], [xp(30)], true),
  step("IV_NIOBIUM_OXYFLUORIDE", "328E661A0E6C270B", "Niobium Oxyfluoride", "grindless:niobium_oxyfluoride_dust", ["IV_PYROCHLORE"], 4.5, 4.75,
    ["Hydrofluoric acid in the fluorspar kiln dissolves the pyrochlore into &6Niobium Oxyfluoride&r and gives fluorite back for the next batch.", "The kiln is the only place that makes it."],
    [it("grindless:niobium_oxyfluoride_dust")], [xp(40)], true),
  step("IV_NIOBIUM_OXIDE", "37C265FE38F79F06", "Niobium Pentoxide", "gtceu:niobium_pentoxide_dust", ["IV_NIOBIUM_OXYFLUORIDE"], 6.5, 4.75,
    ["The extraction cascade cleans the oxyfluoride into &6Niobium Pentoxide&r.", "Keep the cascade fed by pipe."],
    [it("gtceu:niobium_pentoxide_dust")], [xp(40)], true),
  step("IV_NIOBIUM_METAL", "730B99265A452ADE", "Niobium", "gtceu:niobium_dust", ["IV_NIOBIUM_OXIDE"], 8.5, 4.75,
    ["Aluminium reduces the oxide in a very hot blast furnace and leaves &6Niobium&r, with sapphire as a byproduct. Don't waste the sapphire.", "One furnace, one bus."],
    [it("gtceu:niobium_dust"), it("gtceu:sapphire_dust")], [xp(50)], true),
  step("IV_NIOBIUM_TITANIUM", "1713F411CB42B4E4", "Niobium Titanium", "gtceu:niobium_titanium_ingot", ["IV_NIOBIUM_METAL"], 10.5, 4.75,
    ["A mixer alloys it with titanium and the smelting complex casts the &6Niobium Titanium&r ingot.", "Cable and hulls come next."],
    [it("gtceu:niobium_titanium_dust"), it("gtceu:niobium_titanium_ingot")], [xp(50)], true),
  step("IV_NBTI_CABLE", "59C312BC18D9843E", "NbTi Cable", "gtceu:niobium_titanium_single_cable", ["IV_NIOBIUM_TITANIUM"], 12.5, 4.75,
    ["Wire it into &6Niobium Titanium Cable&r, which the LuV hull needs.", "Automate it and the hull line never waits."],
    [it("gtceu:niobium_titanium_single_cable")], [xp(60)], true),
  step("IV_TANTALITE_CAKE", "5D9F1414557080DC", "Tantalite Cake", "grindless:tantalite_fluoride_cake", ["IV_NIOBIUM_OXYFLUORIDE"], 6.5, 6.5,
    ["Tantalite goes through the same kiln as pyrochlore and makes a &6Tantalite Fluoride Cake&r.", "Same kiln, same feed."],
    [it("grindless:tantalite_fluoride_cake")], [xp(40)], true),
  step("IV_K2TAF7", "7D114FEB29816B3D", "Potassium Fluorotantalate", "grindless:k2taf7_dust", ["IV_TANTALITE_CAKE"], 8.5, 6.5,
    ["The cascade splits the cake into &6K2TaF7&r, the salt tantalum comes from.", "A pipe feed keeps it going."],
    [it("grindless:k2taf7_dust")], [xp(40)], true),
  step("IV_TANTALUM", "3A65053CB32AA94E", "Tantalum", "gtceu:tantalum_dust", ["IV_K2TAF7"], 10.5, 6.5,
    ["Sodium reduces the salt to &6Tantalum&r in a blast furnace and gives an alkali fluoride back. Capacitors have wanted this for a long time.", "Don't void the fluoride."],
    [it("gtceu:tantalum_dust"), it("grindless:alkali_fluoride_dust")], [xp(50)], true),
];

export const CHAPTER = {
  id: "10A73E7D249CDD67",
  order: 0,
  icon: "gtceu:fission_reactor",
  autofocus: "IV_INNER_PLANETS",
  title: "IV: Inner Planets",
  subtitle: ["Split the atom at home, then go where it's hot: Venus for naquadah, Mercury for iridium and osmium."],
  section: { name: "Journey", origin: { x: 0, y: 0 } },
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
    key: "IV_FLUORITE_VEIN", id: "5C008907C9055459", title: "Fluorite Vein", icon: "grindless:vein_sample_fluorite", deps: ["IV_INNER_PLANETS"], x: 1.25, y: 1.5,
    desc: [
      "A new Overworld vein of fluorite, barite, galena and sphalerite grows only in freshly generated chunks. Time to go somewhere you've never been.",
      "Raw fluorite and raw barite make a &6Fluorite Vein Sample&r, and any vein drill takes it.",
    ],
    tasks: [it("grindless:vein_sample_fluorite"), it("gcyr:raw_fluorite", 16)],
    rewards: [xp(40), it("gcyr:raw_fluorite", 8)],
  },
  {
    key: "IV_PITCHBLENDE", id: "77B6F588980A4B1C", title: "Pitchblende", icon: "grindless:vein_sample_pitchblende_end", deps: ["IV_INNER_PLANETS"], x: 1.75, y: -0.25,
    desc: [
      "The End's pitchblende vein has been there all along, and no drill will touch it: you'll dissolve the uranium right out of the rock.",
      "Raw pitchblende and raw uraninite make an &6End Pitchblende Vein Sample&r.",
    ],
    tasks: [it("grindless:vein_sample_pitchblende_end")],
    rewards: [xp(40)],
  },
  {
    key: "IV_ENRICHMENT", id: "174353B4F6C61A79", title: "Enrichment", icon: "gtceu:uranium_235_dust", deps: ["IV_HOT_CELL", "IV_FLUORSPAR_KILN", "IV_IN_SITU_LEACH_FIELD"], x: 7.25, y: 0.25,
    desc: [
      "Circuit 1 is the hot cell's shortcut for the whole fluorine chain: uraninite and hydrofluoric acid in, &6Uranium 235&r out, with a pile of uranium 238. Keep the 238: pellets, radon and later MOX all want it. The row below unfolds the real steps.",
    ],
    tasks: [it("gtceu:uranium_235_dust"), it("gtceu:uranium_dust")],
    rewards: [xp(60)],
  },
  {
    key: "IV_QUANTUM_STAR", id: "7136B78C360303F9", title: "Quantum Star", icon: "gtceu:quantum_star", deps: ["IV_ENRICHMENT", "X:73D14393C00DE14D"], x: 11.75, y: 0.25,
    desc: [
      "Circuit 4 blows air over uranium 238 for radon, with no plutonium needed. A Nether Star soaked in radon becomes a &6Quantum Star&r, and an Ender Eye becomes the Quantum Eye that EV sensors and emitters have waited for.",
    ],
    tasks: [it("gtceu:radon_bucket"), it("gtceu:quantum_eye"), it("gtceu:quantum_star")],
    rewards: [xp(60)],
  },
  {
    key: "IV_LEU_FUEL", id: "77E9A2979A7161D3", title: "LEU Fuel", icon: "grindless:leu_fuel_assembly", deps: ["IV_FISSION_REACTOR", "hv:HV_END_VEINS"], x: 19, y: 0.75,
    desc: [
      "An &6LEU Fuel Assembly&r is enriched uranium pressed into pellets and sealed in Zircaloy tubes with a breath of helium. The zirconium comes from the End's zircon, with a pinch of tin.",
    ],
    tasks: [it("grindless:leu_pellet"), it("grindless:zircaloy_cladding_tube"), it("grindless:leu_fuel_assembly")],
    rewards: [xp(60)],
  },
  {
    key: "IV_FIRST_CRITICALITY", id: "72139ED6F4E46D37", title: "First Criticality", icon: "gtceu:ev_energy_output_hatch_16a", deps: ["IV_LEU_FUEL"], x: 22.75, y: 0.25,
    desc: [
      "Load an LEU assembly with circuit 1, give it water, and the reactor wakes up. Each assembly in the bus runs another channel, up to four.",
      "Until iridium, the &6EV 16A Dynamo Hatch&r is the biggest it can feed.",
    ],
    tasks: [it("gtceu:ev_energy_output_hatch_16a")],
    rewards: [xp(100)],
  },
  {
    key: "IV_REPROCESSING", id: "7E266AE6DB3351F7", title: "Reprocessing", icon: "gtceu:plutonium_dust", deps: ["IV_FIRST_CRITICALITY"], x: 24.75, y: 0.5,
    desc: [
      "A spent assembly still holds uranium and the plutonium it bred. The hot cell's circuit 3 dissolves it in nitric acid and hands back both. The waste is glassed and kept.",
    ],
    tasks: [it("grindless:spent_fuel_assembly"), it("gtceu:plutonium_dust")],
    rewards: [xp(60)],
  },
  {
    key: "IV_RTG_PELLETS", id: "1D931CB1451E8B5A", title: "RTG Pellets", icon: "grindless:rtg_pellet", deps: ["IV_REPROCESSING"], x: 26.5, y: 0,
    desc: [
      "Plutonium oxide sealed in platinum and rhodium foil stays warm on its own. The hot cell's circuit 2 makes an &6RTG Pellet&r, as close to a pocket sun as GregTech allows.",
    ],
    tasks: [it("grindless:rtg_pellet")],
    rewards: [xp(40)],
  },
  {
    key: "IV_HEAVY_WATER", id: "3513B00E50D7C58B", title: "Heavy Water", icon: "gtceu:heavy_water_bucket", deps: ["IV_HEAVY_WATER_PLANT", "X:148A0854C671B0AC"], x: 26.75, y: -1.25,
    desc: [
      "Circuit 1 makes a concentrate from ice and steam, and circuit 2 finishes it into &6Heavy Water&r. Any steam works, and the combined-cycle plant has plenty it isn't allowed to throw away.",
    ],
    tasks: [it("gtceu:hydrogen_sulfide_bucket"), it("gtceu:heavy_water_concentrate_bucket"), it("gtceu:heavy_water_bucket")],
    rewards: [xp(50)],
  },
  {
    key: "IV_HEAVY_WATER_CORE", id: "373CBFB746FCAD51", title: "Heavy-Water Core", icon: "gtceu:tritiated_heavy_water_bucket", deps: ["IV_HEAVY_WATER"], x: 30, y: 0.25,
    desc: [
      "Heavy water slows neutrons without eating them, and on circuit 2 the same assembly gives twice the power. It comes out as &6Tritiated Heavy Water&r, and the reactor never vents it. Give it a tank.",
    ],
    tasks: [it("gtceu:tritiated_heavy_water_bucket")],
    rewards: [xp(60)],
  },
  {
    key: "IV_TRITIUM", id: "7FD8A4969E497C3A", title: "Tritium", icon: "gtceu:tritium_bucket", deps: ["IV_TRITIUM_REMOVAL_FACILITY"], x: 35.75, y: -0.75,
    desc: [
      "The only &6Tritium&r in the pack comes out of the Moon's cold box. Nothing uses it yet, but fusion will. Store every drop.",
    ],
    tasks: [it("gtceu:tritium_bucket")],
    rewards: [xp(50)],
  },
  {
    key: "IV_INNER_PLANETS_CHART", id: "539716A235672461", title: "Inner Planets Chart", icon: "grindless:inner_planets_chart", deps: ["IV_TRITIUM_REMOVAL_FACILITY", "X:319C39AD99B5E4A8"], x: 38.25, y: 0,
    desc: [
      "Give the far-side antenna a second EV energy hatch, the trick the tritium facility runs on. At night, with the Mars chart calibrating the dish, it writes the &6Inner Planets Chart&r onto a data stick.",
      "Copy it anyway: charts end up in the wrong chest.",
    ],
    tasks: [it("grindless:inner_planets_chart")],
    rewards: [xp(60), it("gtceu:data_stick", 2)],
  },
  {
    key: "IV_ELITE_ROCKET_THERMAL_SUIT", id: "5A378E5CFD8DFF82", title: "Elite Rocket, Thermal Suit", icon: "gcyr:elite_rocket_motor", deps: ["IV_INNER_PLANETS_CHART", "IV_INSULATING_FABRIC"], x: 42.25, y: 0.25,
    desc: [
      "Venus and Mercury want a level 3 rocket, and GCYR averages the parts, so one leftover advanced motor keeps you at level 2. The IV assembler makes the &6elite parts&r with the chart.",
      "Each suit piece gets the thermal upgrade and a heat shielding fabric: do all four.",
    ],
    tasks: [it("gcyr:elite_fuel_tank", 2), it("gcyr:elite_rocket_motor", 6), it("gcyr:space_suit_thermal_upgrade_smithing_template", 4)],
    rewards: [xp(140)],
  },
  {
    key: "IV_UNDER_THE_CLOUDS", id: "5693331C34A5A291", title: "Under the Clouds", icon: "gcyr:venus_rock", shape: "rsquare", size: 1.25, deps: ["IV_ELITE_ROCKET_THERMAL_SUIT"], x: 44.75, y: -0.25,
    desc: [
      "Ninety bar of carbon dioxide, sulfuric acid clouds and ground hot enough to melt lead. Nothing burns for lack of air here, so land with an RTG cell or charged batteries; self-oxidising fuels like methalox still run.",
      "Bring ender pearls, helium-3 and a waystone for the ride home.",
    ],
    tasks: [{ type: "dimension", dimension: "gcyr:venus" }],
    rewards: [xp(150), it("grindless:empty_vein_probe", 3)],
  },
  {
    key: "IV_VENUSIAN_REGOLITH", id: "1B1714A8E0124C58", title: "Venusian Regolith", icon: "gcyr:venusian_regolith", deps: ["IV_UNDER_THE_CLOUDS"], x: 46.25, y: -1.5,
    desc: [
      "&6Venusian Regolith&r is the ground every Venus machine stands on, and it falls like sand, so build on something solid.",
    ],
    tasks: [it("gcyr:venusian_regolith", 19)],
    rewards: [xp(40)],
  },
  {
    key: "IV_NAQUADAH_SAMPLE", id: "7FCCB79E1561AAAB", title: "Naquadah Sample", icon: "grindless:vein_sample_naquadah_venus", deps: ["IV_UNDER_THE_CLOUDS"], x: 48.5, y: -1,
    desc: [
      "Naquadah sits deep under Venus's lava seas, with some plutonium mixed in. Dig down for raw naquadah and raw plutonium and pack a &6Venusian Naquadah Vein Sample&r.",
    ],
    tasks: [it("grindless:vein_sample_naquadah_venus")],
    rewards: [xp(40)],
  },
  {
    key: "IV_A_SEED_FROM_VENUS", id: "71E4B392A6D559D9", title: "A Seed from Venus", icon: "grindless:venusian_quantum_seed", deps: ["IV_VENUSIAN_REGOLITH"], x: 48.5, y: -4.25,
    desc: [
      "Ender pearls and helium-3 from home, sealed under Venusian regolith in a chemical reactor, make a &6Venusian Quantum Seed&r. The reactor can stand anywhere once the regolith is shipped. Blow it up with a singularity back home for the Venus bridge's pair.",
    ],
    tasks: [it("grindless:venusian_quantum_seed")],
    rewards: [xp(60)],
  },
  {
    key: "IV_RAW_NAQUADAH", id: "77FF1E1CF59D10BC", title: "Raw Naquadah", icon: "gtceu:raw_naquadah", deps: ["IV_PRESSURIZED_VEIN_DRILL"], x: 53.5, y: -1,
    desc: [
      "&6Raw Naquadah&r comes from the bottom of Venus and nowhere else, with a little plutonium on the side. Through the ore plant it becomes naquadah oxide, and a little comes out enriched: that's LuV's business.",
    ],
    tasks: [it("gtceu:raw_naquadah", 16)],
    rewards: [xp(60), it("gtceu:antimony_trioxide_dust", 8)],
  },
  {
    key: "IV_NAQUADAH_INGOT", id: "571EB64508F2FF8E", title: "Naquadah Ingot", icon: "gtceu:naquadah_ingot", deps: ["IV_NAQUADAH_PLANT", "IV_NAQUADAH_DUST"], x: 60.25, y: -0.75,
    desc: [
      "Naquadah only melts in a blast furnace with HSS-G coils, and the hot ingot wants liquid helium in the vacuum freezer. The &6Naquadah Ingot&r is where the quantum wafers start.",
      "The plant's titanium is the one exception to the Moon's monopoly.",
    ],
    tasks: [it("gtceu:naquadah_ingot")],
    rewards: [xp(80)],
  },
  {
    key: "IV_DAY_OF_FIRE", id: "55613604E4C62B5F", title: "Day of Fire", icon: "gcyr:mercury_rock", shape: "rsquare", size: 1.25, deps: ["IV_ELITE_ROCKET_THERMAL_SUIT"], x: 43.75, y: 1.25,
    desc: [
      "Mercury keeps Earth's clock: a scorching day and a cold, dark night. There's no air, so ordinary fuel won't burn; an RTG cell, charged batteries or a self-oxidising fuel keep the first base going until the sun returns.",
      "Bring a waystone and an empty vein probe.",
    ],
    tasks: [{ type: "dimension", dimension: "gcyr:mercury" }],
    rewards: [xp(150), it("grindless:empty_vein_probe", 3)],
  },
  {
    key: "IV_A_SEED_FROM_MERCURY", id: "19D2E454A31BDFC2", title: "A Seed from Mercury", icon: "grindless:hermean_quantum_seed", deps: ["IV_DAY_OF_FIRE"], x: 44.5, y: 3,
    desc: [
      "Hermean regolith dust, a chemical reactor and the same trick make the &6Hermean Quantum Seed&r in any world, once the dust is shipped. Its pair is the Mercury bridge.",
    ],
    tasks: [it("grindless:hermean_quantum_seed")],
    rewards: [xp(60)],
  },
  {
    key: "IV_HEAT_SHIELD_BRICKS", id: "15320440D70D86A7", title: "Heat-Shield Bricks", icon: "grindless:hermean_heat_shield_brick", deps: ["IV_MERCURY_SOLAR_WORKS"], x: 50.25, y: 1,
    desc: [
      "Mercury's own dust, baked under the mirrors, makes &6Hermean Heat-Shield Bricks&r. The drill, the solar field and the interferometer all stand on them.",
    ],
    tasks: [it("grindless:hermean_heat_shield_brick", 16)],
    rewards: [xp(40)],
  },
  {
    key: "IV_IRIDOSMINE", id: "147AC69C089D11C2", title: "Iridosmine", icon: "gtceu:raw_iridosmine", deps: ["IV_MERCURY_VEIN_DRILL"], x: 57.75, y: 1.25,
    desc: [
      "&6Raw Iridosmine&r is grains of native iridium and osmium in Mercury's dark crust, and the only iridium and osmium in the system. It won't melt in a furnace or split in an electrolyzer.",
    ],
    tasks: [it("gtceu:raw_iridosmine", 16)],
    rewards: [xp(60)],
  },
  {
    key: "IV_IRIDIUM_AND_OSMIUM", id: "72E1760292CBF88F", title: "Iridium and Osmium", icon: "gtceu:iridium_dust", deps: ["IV_IRIDOSMINE", "X:1F70EF41E5F8ED95"], x: 59, y: 0.25,
    desc: [
      "The ore plant turns raw iridosmine into dust, and the platinum plant on circuit 3 runs the whole chain until &6Iridium&r and &6Osmium&r come out.",
      "Iridium is what IV hatches were waiting for, and osmium only melts at LuV voltage.",
    ],
    tasks: [it("gtceu:iridosmine_dust"), it("gtceu:iridium_dust"), it("gtceu:osmium_dust")],
    rewards: [xp(110)],
  },
  {
    key: "IV_ASSEMBLY_LINE", id: "3CF7A4745035119A", title: "Assembly Line", icon: "gtceu:assembly_line", shape: "gear", size: 1.25, deps: ["IV_IRIDIUM_AND_OSMIUM"], x: 61.75, y: 0,
    desc: [
      "The &6Assembly Line&r builds what no single machine can, reading its input buses in order, one ingredient each. Its casings want IV sensors, emitters and ruridit gears, which is why it waits for iridium.",
      "For the LuV motor, an EV scanner reads an IV motor onto a data stick that lives in a data access hatch on the line.",
    ],
    tasks: [it("gtceu:data_access_hatch"), it("gtceu:assembly_line")],
    rewards: [xp(100), it("gtceu:ulv_input_bus", 4)],
  },
  {
    key: "IV_FED_BY_THE_NETWORK", id: "305FCC7C554A03CC", title: "Fed by the Network", icon: "gtceu:luv_electric_motor", deps: ["IV_ASSEMBLY_LINE"], x: 66, y: 1.25,
    desc: [
      "Put an AE2 export bus under every input bus, each set to its ingredient, and the fluids into their own hatches in the same order.",
      "The &6LuV Electric Motor&r comes out of an ME output bus, and nobody crafted it by hand.",
    ],
    tasks: [it("gtceu:luv_electric_motor")],
    rewards: [xp(120), it("ae2:speed_card", 2)],
  },
  {
    key: "IV_OUTER_SYSTEM_CHART", id: "18E80E32AB01B8F6", title: "Outer System Chart", icon: "grindless:outer_system_chart", deps: ["IV_INTERFEROMETER"], x: 66.75, y: 2.75,
    desc: [
      "The Moon's antenna records the sky at night onto a data orb, and the recording travels to Mercury. With the Inner Planets Chart in its bus, the interferometer writes the &6Outer System Chart&r of the belt and Jupiter's moons.",
    ],
    tasks: [it("grindless:lunar_vlbi_recording"), it("grindless:outer_system_chart")],
    rewards: [xp(80)],
  },
  {
    key: "IV_SAGITTARIUS_A", id: "5EC977A2B65C7030", title: "Sagittarius A*", icon: "grindless:sagittarius_a_star_signal", deps: ["IV_OUTER_SYSTEM_CHART"], x: 68.75, y: 2.75,
    desc: [
      "The hiss the Moon's antenna picked up from Sagittarius finally has an address: one faint, steady point at the centre of the galaxy. The &6Sagittarius A* Signal&r is a long way off, and you're going anyway.",
    ],
    tasks: [it("grindless:sagittarius_a_star_signal")],
    rewards: [xp(150)],
  },
  {
    key: "IV_GATE_TO_LUV", id: "77B4DDD47050E3C7", title: "Gate to LuV", icon: "gtceu:luv_machine_hull", shape: "diamond", size: 1.75, deps: ["IV_OUTER_SYSTEM_CHART", "IV_FED_BY_THE_NETWORK"], x: 67.75, y: 1,
    desc: [
      "Rhodium plated palladium, niobium titanium cable and PTFE make the &6LuV Machine Hull&r, and yes, it's another hull.",
      "Venus's naquadah and Mercury's iridium got you here, and the new chart points further out still.",
    ],
    tasks: [it("gtceu:luv_machine_hull"), it("gtceu:naquadah_ingot"), it("grindless:outer_system_chart")],
    rewards: [xp(300)],
  },
  ...BRANCHES,
];
