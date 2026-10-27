// priority: -13224
// -----------------------------------------------------------------------------------------------
// Ender eye, MV era (the End is MV, DECISIONS.md 2026-10-24; it was decision 5 of docs/eras/hv.md): the vanilla recipe (ender pearl +
// blaze powder, shapeless, minecraft:ender_eye) goes away, so an eye is only made through GregTech's route, which GTM 7.5.3 already
// has in full:
//
//   blaze rods       the MV creature simulator (data/grindless/tables/mobs.json, blaze: MV)  -> macerator -> blaze powder
//   blaze powder     gtceu:chemical_reactor/blaze_powder     1 carbon dust + 1 sulfur dust -> 1 blaze dust          HV, 480 EU/t, 200 t
//                                                            (the other way in, from HV on)
//   liquid blaze     gtceu:extractor/extract_blaze_powder    1 blaze dust -> 144 mB blaze     (GTM's extractor recycling, on by default
//                                                            as recipes.enableExtractorRecycling; the rod gives 576 mB)
//   ender eye        gtceu:chemical_bath/eye_of_ender        144 mB blaze + 1 ender pearl -> 1 ender eye            MV here: 120 EU/t
//                                                            instead of GTM's 480, same time (50 t). GTM's recipe is removed and
//                                                            built again with the same id, inputs and time (RecipeJS.EUt on a loaded
//                                                            recipe would add a second energy input, not replace the first)
//
// The pearl is the creature simulator's (LV). In GTM the vanilla recipe is only removed with recipes.hardMiscRecipes, which would also
// take the furnace and the crafting table of half the pack, so it is removed here, by id.
//
// The ids and numbers GTM has are checked by the smoke tests (gg_test_hv_refinery.js, check ender_eye; gg_test_moon.js, end_mv).
(function () {
  const G = global.grindless || (global.grindless = {})
  const HV = G.hv || (G.hv = {})

  HV.enderEye = {
    removed: 'minecraft:ender_eye',
    route: ['gtceu:chemical_reactor/blaze_powder', 'gtceu:extractor/extract_blaze_powder', 'gtceu:chemical_bath/eye_of_ender'],
    bath: 'gtceu:chemical_bath/eye_of_ender',
    bathEut: 120
  }

  ServerEvents.recipes(function (event) {
    event.remove({ id: HV.enderEye.removed })
    event.remove({ id: HV.enderEye.bath })
    event.recipes.gtceu.chemical_bath('gtceu:eye_of_ender')
      .itemInputs('#forge:gems/ender_pearl')
      .inputFluids('#forge:blaze 144')
      .itemOutputs('minecraft:ender_eye')
      .EUt(HV.enderEye.bathEut)
      .duration(50)
  })
})()
