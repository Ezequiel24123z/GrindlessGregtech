// -----------------------------------------------------------------------------------------------
// Ender eye, HV era (decision 5 of docs/eras/hv.md): the vanilla recipe (ender pearl + blaze powder, shapeless, minecraft:ender_eye) goes
// away, so an eye is only made through GregTech's route, which GTM 7.5.3 already has in full:
//
//   blaze powder     gtceu:chemical_reactor/blaze_powder     1 carbon dust + 1 sulfur dust -> 1 blaze dust          HV, 480 EU/t, 200 t
//   liquid blaze     gtceu:extractor/extract_blaze_powder    1 blaze dust -> 144 mB blaze     (GTM's extractor recycling, on by default
//                                                            as recipes.enableExtractorRecycling; the rod gives 576 mB)
//   ender eye        gtceu:chemical_bath/eye_of_ender        144 mB blaze + 1 ender pearl -> 1 ender eye            HV, 480 EU/t, 50 t
//
// Nothing is added: the route was complete. The pearl is the creature simulator's (LV) and the blaze rods of the HV simulator can go to
// powder in the macerator, the other way to get blaze. In GTM the vanilla recipe is only removed with recipes.hardMiscRecipes, which would
// also take the furnace and the crafting table of half the pack, so it is removed here, by id.
//
// The ids and numbers GTM has are checked by the smoke test (gg_test_hv_refinery.js, check ender_eye).
(function () {
  const G = global.grindless || (global.grindless = {})
  const HV = G.hv || (G.hv = {})

  HV.enderEye = {
    removed: 'minecraft:ender_eye',
    route: ['gtceu:chemical_reactor/blaze_powder', 'gtceu:extractor/extract_blaze_powder', 'gtceu:chemical_bath/eye_of_ender']
  }

  ServerEvents.recipes(function (event) {
    event.remove({ id: HV.enderEye.removed })
  })
})()
