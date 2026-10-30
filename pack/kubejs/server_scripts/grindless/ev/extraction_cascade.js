// priority: -12324
// -----------------------------------------------------------------------------------------------
// gtceu:solvent_extraction recipes of the Rare Earth Extraction Cascade (gtceu:extraction_cascade) and the recipe that makes the cascade
// (EV era, docs/eras/ev.md "Rare-earth extraction cascade"). GTM has no rare earth leach and no solvent extraction, so these two recipes
// are ours, written from the real process in a table. The programmed circuit picks the mode:
//
//   circuit 1  leach       4 merrillite dust + 3 000 mB hydrochloric acid -> 1 000 mB rare earth chloride solution + 1 000 mB phosphoric
//                          acid + 3 tricalcium phosphate dust                                        1 920 EU/t, 40 t (76 800 EU)
//   circuit 2  extraction  1 000 mB rare earth chloride solution + 3 000 mB hydrochloric acid (the strip) + 1 000 mB kerosene ->
//                          1 samarium chloride + 1 neodymium chloride + 2 mixed rare earth chloride + 950 mB kerosene + 6 000 mB diluted
//                          hydrochloric acid                                                          1 920 EU/t, 200 t (384 000 EU)
//   circuit 5  ZPM mode    (ZPM-A3, the europium reductor's feed) 4 000 mB GTCA monazite froth + 3 000 mB hydrochloric acid -> 4 000 mB
//                          europium chloride solution + 1 000 mB phosphoric acid (the froth's phosphate)     122 880 EU/t, 40 t (ZPM hatch)
//                          The solution goes to the europium reductor (zpm/europium.js); its depleted liquor comes back into circuit 2.
//   circuit 6  UV mode     (UV-A6, the Yb strip: ytterbium oxide's only maker) 32 mixed rare earth chloride + 3 000 mB water + 1 000 mB
//                          kerosene -> 5 ytterbium oxide + 24 mixed rare earth chloride + 950 mB kerosene + 6 000 mB hydrochloric acid
//                                                                                                    122 880 EU/t, 100 t (ZPM hatch)
//                          A last heavy cut of the mixed chloride: 8 moles in (4 dust each), 2 of them are the heavies, reckoned as
//                          ytterbium, and are stripped and precipitated as the oxide: 2 YbCl3 + 3 H2O -> Yb2O3 + 6 HCl (Yb2O3 is 5 dust,
//                          one per atom, GTM's convention). The other 6 moles go back out as mixed chloride, to GTM's electrolyzer.
//   circuit 7  UHV mode    (UHV-B5, Proxima b's rare earths: the biomining heap's Sphingomonas leach, its only source) 1 000 mB Proxima REE
//                          liquor + 3 000 mB hydrochloric acid -> 1 000 mB rare earth chloride solution + 1 000 mB water   1 920 EU/t, 40 t
//                          Ion exchange: the cascade's resin loads the dilute rare earths from the liquor (the barren water leaves, back to
//                          the heap) and the acid elutes them as REECl3; the solution then takes circuit 2, the existing route.
//
// The chemistry. Merrillite (A1: Ca8(Mg,Fe)(REE)(PO4)7 per half cell) is three (Ca,Mg)3(PO4)2 and one rare earth phosphate in one
// lattice. The leach, net of the cascade's own recycling of calcium and phosphate inside, is
//     Ca8(Mg,Fe)(REE)(PO4)7 + 3 HCl -> REECl3 + H3PO4 + 3 (Ca,Mg)3(PO4)2
// balanced in every element. Units: one formula unit is 4 merrillite dust (by formula units it is three tricalcium phosphate and one
// rare earth phosphate, about four to one by mass, so the dust count is conserved: 4 in, 3 tricalcium phosphate out and the fourth
// dissolved), 1 000 mB of a fluid is one mole, as in GTM's chemistry (1 000 mB of solution holds one mole of REECl3). In the extraction an
// organic phase (an organophosphorus extractant in kerosene) loads the rare earths and gives an acid back to the aqueous side (REE3+ + 3 HA
// -> REEA3 + 3 H+), and the strip returns them to a clean chloride with 3 HCl (REEA3 + 3 HCl -> REECl3 + 3 HA); per mole: 3 Cl in with the
// solution and 3 HCl of strip in, 3 Cl out in the chlorides and 3 000 mB of HCl out in 6 000 mB of diluted acid (GTM's diluted
// hydrochloric acid is HCl + water, 2 000 mB -> 1 000 mB HCl + 1 000 mB water in the distillation tower). The kerosene carries the
// extractant through the stages and 5 % of it is lost per pass (entrainment and solubility).
// The split: the cascade cuts the rare earths in three. Martian merrillite is reckoned rich in the middle rare earths, so one quarter of
// the rare earths comes out as samarium, one quarter as neodymium and half as the mixed chloride of the rest (lanthanum, cerium,
// praseodymium, yttrium and the heavies), which GTM's own centrifuge already separates. Each chloride is 4 dust per mole, GTM's
// convention for MCl3 (its decomposition takes 4 dust for 1 metal + 3 000 mB of chlorine): 1 + 1 + 2 = 4 dust per mole.
//
// Energy (no discount, no parallels): the leach is a hot acid attack (76 800 EU per mole); the extraction is the long cascade of
// mixer-settlers, pumps and the strip (384 000 EU per mole). Both are EV recipes (1 920 EU/t), like the platinum plant's, so one EV hatch
// runs them with no overclock and these are the figures the player pays. One samarium (4 moles of rare earth, with one neodymium and two
// mixed rare earths) costs about 1.84 million EU in the cascade, plus GTM's electrolysis (4 chloride dust, 224 t at 30 EU/t). The rates of
// one cascade with one EV hatch: 30 moles a minute in the leach, 6 in the extraction (one cascade on the leach feeds five on the
// extraction). Two EV hatches count as an IV supply, and GTM overclocks both recipes one step (four times the power, half the time):
// twice as fast and twice the EU per run.
//
// Destinations (rule 3 of AGENTS.md):
//   samarium chloride     -> GTM electrolyzer -> samarium (IV superconductor SmFeAsO, LuV motor magnets) + chlorine
//   neodymium chloride    -> GTM electrolyzer -> neodymium (motors, alongside the Nether's) + chlorine
//   mixed RE chloride     -> GTM electrolyzer -> GTM's rare earth dust (rare_earth_separation: cerium, lanthanum, yttrium...) + chlorine
//   chlorine              -> hydrochloric acid again (GTM's chemical reactor, with hydrogen): the leach's acid comes back
//   diluted HCl           -> GTM's distillation tower or distillery -> hydrochloric acid + water: the strip acid comes back
//   kerosene              -> back into the cascade; the loss is made up from GT--'s distillery (diesel -> kerosene, the MV RP-1 line)
//   phosphoric acid       -> GTM's cumene and phenol (epoxy) and gelatin; it is a mild, inert acid: the surplus can be voided
//   tricalcium phosphate  -> GTM's fertilizer recipes and its centrifuge (calcium + phosphate); inert: the surplus can be voided
//   The hydrogen of the HCl ends in the phosphoric acid: the HCl loop needs hydrogen from outside, 3 000 mB per mole.
//   ytterbium oxide       -> the fibre draw tower's preform (uv/photonics.js); nothing else makes it
//   HCl of the Yb strip   -> back into the leach (circuit 1) and the strip (circuit 2)
//   water of circuit 7    -> the biomining heap's leach water (uhv/proxima_ground.js), or the network
//
// Published in global.grindless.extractionCascade for the smoke test:
//   .recipes  [{ id (what the builder got), recipeId (the final id), name, mode, circuit, itemsIn: [{ id, count }], fluidsIn: [{ id, amount }],
//                itemsOut: [{ id, count }], fluidsOut: [{ id, amount }], eut, duration, energy }]
//   .decomposition  [{ id, input: { id, count }, outputs: { item: { id, count }, fluid: { id, amount } } }] what GTM must generate for
//                   the three chlorides
//   .craftingRecipe, .craftingParts
(function () {
  const G = global.grindless || (global.grindless = {})
  const EC = G.extractionCascade || (G.extractionCascade = {})

  const LOG = '[grindless/ev] '
  const ID_PREFIX = 'grindless:ev/'
  const TYPE_NAME = 'solvent_extraction'

  const MERRILLITE = 'gtceu:merrillite_dust'
  const TCP = 'gtceu:tricalcium_phosphate_dust'
  const SM_CL = 'gtceu:samarium_chloride_dust'
  const ND_CL = 'gtceu:neodymium_chloride_dust'
  const MIX_CL = 'gtceu:mixed_rare_earth_chloride_dust'

  const HCL = 'gtceu:hydrochloric_acid'
  const DILUTED_HCL = 'gtceu:diluted_hydrochloric_acid'
  const SOLUTION = 'gtceu:rare_earth_chloride_solution'
  const PHOSPHORIC = 'gtceu:phosphoric_acid'
  const KEROSENE = 'gtceu:kerosene'
  const CHLORINE = 'gtceu:chlorine'

  // one row per recipe; amounts per run (one mole of rare earth)
  const TABLE = [
    {
      name: 'merrillite_leach', mode: 'leach', circuit: 1,
      itemsIn: [{ id: MERRILLITE, count: 4 }],
      fluidsIn: [{ id: HCL, amount: 3000 }],
      itemsOut: [{ id: TCP, count: 3 }],
      fluidsOut: [{ id: SOLUTION, amount: 1000 }, { id: PHOSPHORIC, amount: 1000 }],
      eut: 1920, duration: 40
    },
    {
      name: 'rare_earth_extraction', mode: 'extraction', circuit: 2,
      itemsIn: [],
      fluidsIn: [{ id: SOLUTION, amount: 1000 }, { id: HCL, amount: 3000 }, { id: KEROSENE, amount: 1000 }],
      itemsOut: [{ id: SM_CL, count: 1 }, { id: ND_CL, count: 1 }, { id: MIX_CL, count: 2 }],
      fluidsOut: [{ id: KEROSENE, amount: 950 }, { id: DILUTED_HCL, amount: 6000 }],
      eut: 1920, duration: 200
    },
    {
      name: 'monazite_froth_europium', mode: 'zpm', circuit: 5,
      itemsIn: [],
      fluidsIn: [{ id: 'gtca:monazite_froth', amount: 4000 }, { id: HCL, amount: 3000 }],
      itemsOut: [],
      fluidsOut: [{ id: 'gtceu:europium_chloride_solution', amount: 4000 }, { id: PHOSPHORIC, amount: 1000 }],
      eut: 122880, duration: 40
    },
    {
      name: 'ytterbium_strip', mode: 'uv', circuit: 6,
      itemsIn: [{ id: MIX_CL, count: 32 }],
      fluidsIn: [{ id: 'minecraft:water', amount: 3000 }, { id: KEROSENE, amount: 1000 }],
      itemsOut: [{ id: 'gtceu:ytterbium_oxide_dust', count: 5 }, { id: MIX_CL, count: 24 }],
      fluidsOut: [{ id: KEROSENE, amount: 950 }, { id: HCL, amount: 6000 }],
      eut: 122880, duration: 100
    },
    {
      name: 'proxima_ree_liquor', mode: 'uhv', circuit: 7,
      itemsIn: [],
      fluidsIn: [{ id: 'gtceu:proxima_ree_liquor', amount: 1000 }, { id: HCL, amount: 3000 }],
      itemsOut: [],
      fluidsOut: [{ id: SOLUTION, amount: 1000 }, { id: 'minecraft:water', amount: 1000 }],
      eut: 1920, duration: 40
    },
    // UEV-A4 modes (circuits 8-11): the Zr/Hf, Ta/Nb, Tb and La/Y cuts that feed the electron beam furnace and the superalloy lines
    {
      name: 'zr_hf_cut', mode: 'uev', circuit: 8,
      itemsIn: [{ id: 'grindless:zr_hf_chloride_dust', count: 4 }],
      fluidsIn: [{ id: 'minecraft:water', amount: 2000 }, { id: KEROSENE, amount: 1000 }, { id: HCL, amount: 1000 }],
      itemsOut: [{ id: 'grindless:zirconium_chloride_dust', count: 3 }, { id: 'grindless:hafnium_chloride_dust', count: 1 }],
      fluidsOut: [{ id: KEROSENE, amount: 950 }, { id: DILUTED_HCL, amount: 1000 }],
      eut: 1920, duration: 100
    },
    {
      name: 'tantalum_cut', mode: 'uev', circuit: 9,
      itemsIn: [{ id: 'grindless:tantalite_fluoride_cake', count: 4 }],
      fluidsIn: [{ id: 'gtceu:hydrofluoric_acid', amount: 2000 }, { id: KEROSENE, amount: 1000 }, { id: 'minecraft:water', amount: 1000 }],
      itemsOut: [{ id: 'grindless:k2taf7_dust', count: 2 }, { id: 'grindless:niobium_oxyfluoride_dust', count: 1 }],
      fluidsOut: [{ id: KEROSENE, amount: 950 }, { id: 'gtceu:hydrofluoric_acid', amount: 1000 }],
      eut: 1920, duration: 100
    },
    {
      name: 'terbium_strip', mode: 'uev', circuit: 10,
      itemsIn: [{ id: MIX_CL, count: 32 }],
      fluidsIn: [{ id: 'minecraft:water', amount: 3000 }, { id: KEROSENE, amount: 1000 }],
      itemsOut: [{ id: 'grindless:terbium_oxide_dust', count: 5 }, { id: MIX_CL, count: 24 }],
      fluidsOut: [{ id: KEROSENE, amount: 950 }, { id: HCL, amount: 6000 }],
      eut: 1920, duration: 100
    },
    {
      name: 'lanthanum_yttrium_strip', mode: 'uev', circuit: 11,
      itemsIn: [{ id: MIX_CL, count: 32 }],
      fluidsIn: [{ id: 'minecraft:water', amount: 3000 }, { id: KEROSENE, amount: 1000 }],
      itemsOut: [{ id: 'grindless:yttrium_oxide_dust', count: 5 }, { id: 'gtceu:lanthanum_oxide_dust', count: 5 }, { id: MIX_CL, count: 16 }],
      fluidsOut: [{ id: KEROSENE, amount: 950 }, { id: HCL, amount: 6000 }],
      eut: 1920, duration: 100
    },
    // UIV-A3: the columbite split and the melter dross digestion (docs/eras/uiv.md, lines 5 and 7)
    {
      name: 'columbite_niobium_split', mode: 'uev', circuit: 12,
      itemsIn: [{ id: 'grindless:niobium_oxyfluoride_dust', count: 4 }],
      fluidsIn: [{ id: 'minecraft:water', amount: 3000 }, { id: KEROSENE, amount: 1000 }],
      itemsOut: [{ id: 'gtceu:niobium_pentoxide_dust', count: 2 }],
      fluidsOut: [{ id: KEROSENE, amount: 950 }, { id: 'gtceu:hydrofluoric_acid', amount: 2000 }],
      eut: 1920, duration: 100
    },
    {
      name: 'melter_dross_digestion', mode: 'uev', circuit: 13,
      itemsIn: [{ id: 'grindless:melter_dross', count: 4 }],
      fluidsIn: [{ id: 'gtceu:hydrofluoric_acid', amount: 3000 }, { id: KEROSENE, amount: 1000 }],
      itemsOut: [{ id: 'grindless:niobium_oxyfluoride_dust', count: 1 }, { id: 'grindless:hafnium_chloride_dust', count: 1 }],
      fluidsOut: [{ id: KEROSENE, amount: 950 }, { id: 'minecraft:water', amount: 1000 }],
      eut: 1920, duration: 100
    },
    // UXV-A2 (circuits 14-21; c22 is B5's): the plant side of the spintronic feedstock. Destinations: arsenic and sulfur go to GTM's
    // chemistry, CaCl2 to GTM's electrolyser or the recycle row (16), CO2 is inert and vented, the lead and B2O3 of the LPE dross go back
    // to the YIG melt, the Fe of the BFO fume to the iron stock, the tungstic acid (the WO3 of the design) to c19.
    {
      name: 'cobaltite_split', mode: 'uxv', circuit: 14,
      itemsIn: [{ id: 'gtceu:cobaltite_dust', count: 4 }],
      fluidsIn: [{ id: HCL, amount: 3000 }, { id: KEROSENE, amount: 1000 }],
      itemsOut: [{ id: 'gtceu:cobalt_dust', count: 4 }, { id: 'gtceu:arsenic_dust', count: 4 }, { id: 'gtceu:sulfur_dust', count: 4 }],
      fluidsOut: [{ id: KEROSENE, amount: 950 }, { id: DILUTED_HCL, amount: 3000 }],
      eut: 1920, duration: 100
    },
    {
      name: 'magnesite_hydroxide', mode: 'uxv', circuit: 15,
      itemsIn: [{ id: 'gtceu:magnesite_dust', count: 2 }],
      fluidsIn: [{ id: 'minecraft:water', amount: 2000 }],
      itemsOut: [{ id: 'grindless:magnesium_hydroxide_dust', count: 2 }],
      fluidsOut: [{ id: 'gtceu:carbon_dioxide', amount: 2000 }],
      eut: 1920, duration: 100
    },
    {
      name: 'calcium_chloride_recycle', mode: 'uxv', circuit: 16,
      itemsIn: [{ id: 'gtceu:calcium_chloride_dust', count: 2 }, { id: 'gtceu:soda_ash_dust', count: 2 }],
      fluidsIn: [{ id: 'minecraft:water', amount: 1000 }],
      itemsOut: [{ id: 'gtceu:calcite_dust', count: 1 }, { id: 'gtceu:salt_dust', count: 4 }, { id: 'grindless:strontium_carbonate_dust', count: 1 }],
      fluidsOut: [],
      eut: 1920, duration: 100
    },
    {
      name: 'scandium_strip', mode: 'uxv', circuit: 17,
      itemsIn: [{ id: MIX_CL, count: 32 }],
      fluidsIn: [{ id: 'minecraft:water', amount: 3000 }, { id: KEROSENE, amount: 1000 }],
      itemsOut: [{ id: 'grindless:scandium_oxide_dust', count: 5 }, { id: MIX_CL, count: 24 }],
      fluidsOut: [{ id: KEROSENE, amount: 950 }, { id: HCL, amount: 6000 }],
      eut: 1920, duration: 100
    },
    {
      name: 'scheelite_tungstic_acid', mode: 'uxv', circuit: 18,
      itemsIn: [{ id: 'gtceu:scheelite_dust', count: 2 }],
      fluidsIn: [{ id: HCL, amount: 4000 }],
      itemsOut: [{ id: 'gtceu:tungstic_acid_dust', count: 2 }, { id: 'gtceu:calcium_chloride_dust', count: 2 }],
      fluidsOut: [],
      eut: 1920, duration: 100
    },
    {
      name: 'tungsten_charge', mode: 'uxv', circuit: 19,
      itemsIn: [{ id: 'gtceu:tungstic_acid_dust', count: 2 }],
      fluidsIn: [{ id: 'gtceu:hydrogen', amount: 6000 }],
      itemsOut: [{ id: 'gtceu:tungsten_dust', count: 2 }],
      fluidsOut: [{ id: 'minecraft:water', amount: 8000 }],
      eut: 1920, duration: 100
    },
    {
      name: 'bfo_fume_bismuth', mode: 'uxv', circuit: 20,
      itemsIn: [{ id: 'grindless:bfo_fume', count: 2 }],
      fluidsIn: [{ id: 'gtceu:hydrogen', amount: 3000 }],
      itemsOut: [{ id: 'gtceu:bismuth_dust', count: 1 }, { id: 'gtceu:small_iron_dust', count: 2 }],
      fluidsOut: [{ id: 'minecraft:water', amount: 3000 }],
      eut: 1920, duration: 100
    },
    {
      name: 'lpe_dross_lead', mode: 'uxv', circuit: 21,
      itemsIn: [{ id: 'grindless:lpe_dross', count: 2 }],
      fluidsIn: [{ id: 'gtceu:hydrogen', amount: 2000 }],
      itemsOut: [{ id: 'gtceu:lead_dust', count: 2 }, { id: 'gtceu:boron_trioxide_dust', count: 1 }],
      fluidsOut: [{ id: 'minecraft:water', amount: 2000 }],
      eut: 1920, duration: 100
    },
    // UXV-B5: Cassiopeia A's ejecta dust, leached in HCl under kerosene: the Ti fraction (calutron c14) and the Ca+Si and Fe+S residues
    {
      name: 'ejecta_knot_titanium', mode: 'uxv', circuit: 22,
      itemsIn: [{ id: 'grindless:ejecta_knot_dust', count: 4 }],
      fluidsIn: [{ id: 'gtceu:hydrochloric_acid', amount: 3000 }, { id: 'gtceu:kerosene', amount: 1000 }],
      itemsOut: [{ id: 'grindless:ejecta_ti_fraction_dust', count: 1 }, { id: 'gtceu:wollastonite_dust', count: 1 }, { id: 'gtceu:pyrite_dust', count: 1 }],
      fluidsOut: [{ id: 'gtceu:kerosene', amount: 950 }, { id: 'gtceu:diluted_hydrochloric_acid', amount: 3000 }],
      eut: 1920, duration: 100
    },
    // OpV-A2 (opv.md line 11): the Si-28 fusion ash hydrochlorinated to Si-28 trichlorosilane (Si + 3 HCl -> SiHCl3 + H2) for the
    // MOCVD reactor's Siemens rod (c17), whose HCl comes back
    {
      name: 'si28_trichlorosilane', mode: 'opv', circuit: 24,
      itemsIn: [{ id: 'grindless:si28_ash', count: 4 }],
      fluidsIn: [{ id: 'gtceu:hydrochloric_acid', amount: 12000 }],
      itemsOut: [],
      fluidsOut: [{ id: 'gtceu:si28_trichlorosilane', amount: 4000 }, { id: 'gtceu:hydrogen', amount: 4000 }],
      eut: 1920, duration: 100
    },
    // OpV-A2 (opv.md line 12): the InP scrap of the boule, wafer and HEMT cuts leached in HCl; indium is won back, the phosphine goes to
    // the STM cell or its scrubber and the chlorine to stock
    {
      name: 'inp_scrap_indium', mode: 'opv', circuit: 26,
      itemsIn: [{ id: 'grindless:inp_scrap', count: 2 }],
      fluidsIn: [{ id: 'gtceu:hydrochloric_acid', amount: 6000 }],
      itemsOut: [{ id: 'gtceu:indium_dust', count: 2 }],
      fluidsOut: [{ id: 'gtceu:phosphine', amount: 2000 }, { id: 'gtceu:chlorine', amount: 6000 }],
      eut: 1920, duration: 100
    },
    // OpV-A2 (opv.md line 17): the GaN MOCVD exhaust (excess ammonia carrying unreacted gallium) scrubbed in HCl: the gallium is won
    // back, the ammonia stripped off for the reactor or stock, the spent acid leaves diluted
    {
      name: 'gan_exhaust_gallium', mode: 'opv', circuit: 27,
      itemsIn: [],
      fluidsIn: [{ id: 'gtceu:gan_mocvd_exhaust', amount: 3000 }, { id: 'gtceu:hydrochloric_acid', amount: 1000 }],
      itemsOut: [{ id: 'gtceu:small_gallium_dust', count: 1 }],
      fluidsOut: [{ id: 'gtceu:ammonia', amount: 2250 }, { id: 'gtceu:diluted_hydrochloric_acid', amount: 1000 }],
      eut: 1920, duration: 100
    }
  ]

  EC.recipes = TABLE.map(function (t) {
    return {
      id: ID_PREFIX + t.name,
      recipeId: 'grindless:' + TYPE_NAME + '/ev/' + t.name,
      name: t.name,
      mode: t.mode,
      circuit: t.circuit,
      itemsIn: t.itemsIn,
      fluidsIn: t.fluidsIn,
      itemsOut: t.itemsOut,
      fluidsOut: t.fluidsOut,
      eut: t.eut,
      duration: t.duration,
      energy: t.eut * t.duration
    }
  })

  // GTM's DecompositionRecipeHandler, for MCl3 dust (2 components, so 30 EU/t; duration = average protons x 4 x 2)
  EC.decomposition = [
    { id: 'gtceu:electrolyzer/decomposition_electrolyzing_samarium_chloride', input: { id: SM_CL, count: 4 },
      outputs: { item: { id: 'gtceu:samarium_dust', count: 1 }, fluid: { id: CHLORINE, amount: 3000 } } },
    { id: 'gtceu:electrolyzer/decomposition_electrolyzing_neodymium_chloride', input: { id: ND_CL, count: 4 },
      outputs: { item: { id: 'gtceu:neodymium_dust', count: 1 }, fluid: { id: CHLORINE, amount: 3000 } } },
    { id: 'gtceu:electrolyzer/decomposition_electrolyzing_mixed_rare_earth_chloride', input: { id: MIX_CL, count: 4 },
      outputs: { item: { id: 'gtceu:rare_earth_dust', count: 1 }, fluid: { id: CHLORINE, amount: 3000 } } }
  ]

  const HULL = 'gtceu:ev_machine_hull'
  const MIXER = 'gtceu:ev_mixer'
  const CENTRIFUGE = 'gtceu:ev_centrifuge'
  const REACTOR = 'gtceu:ev_chemical_reactor'
  EC.craftingParts = [HULL, MIXER, CENTRIFUGE, REACTOR, 'grindless:reforming_catalyst', 'grindless:hydrotreating_catalyst', EC.machine || 'gtceu:extraction_cascade']
  EC.craftingRecipe = 'grindless:assembler/extraction_cascade'

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addRecipes(event)
    } catch (e) {
      console.error(LOG + 'extraction cascade recipes failed: ' + e)
    }
    try {
      addCrafting(event)
    } catch (e2) {
      console.error(LOG + 'extraction cascade crafting recipe failed: ' + e2)
    }
  })

  function addRecipes(event) {
    var added = 0
    EC.recipes.forEach(function (r) {
      // one recipe with an unknown id (the ZPM mode takes a GTCA fluid) never takes the others down
      var missing = r.itemsIn.concat(r.itemsOut).filter(function (x) { return !Item.exists(x.id) }).map(function (x) { return x.id })
        .concat(r.fluidsIn.concat(r.fluidsOut).filter(function (f) { return !Fluid.exists(f.id) }).map(function (f) { return f.id }))
      if (missing.length > 0) {
        console.error(LOG + 'extraction cascade recipe ' + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      added++
      var recipe = event.recipes.gtceu.solvent_extraction(r.id)
      r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
      recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
      r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      recipe.EUt(r.eut).duration(r.duration)
    })
    console.info(LOG + 'extraction cascade recipes added: ' + added)
  }

  // CRAFTING TABLE: EV hull + EV mixer (the mixers of the stages) + EV centrifuge (the settlers: the phases come apart) + EV chemical
  // reactor (the leach and the strip) + 4 EV circuits
  function addCrafting(event) {
    var missing = EC.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'extraction cascade crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:extraction_cascade')
      .itemInputs(HULL, '2x ' + MIXER, '2x ' + CENTRIFUGE, REACTOR, '4x #gtceu:circuits/ev', '2x grindless:reforming_catalyst', '2x grindless:hydrotreating_catalyst')
      .inputFluids(Fluid.of('gtceu:hydrochloric_acid', 2000))
      .itemOutputs('gtceu:extraction_cascade')
      .EUt(120).duration(400)
    console.info(LOG + 'extraction cascade crafting recipe added')
  }
})()
