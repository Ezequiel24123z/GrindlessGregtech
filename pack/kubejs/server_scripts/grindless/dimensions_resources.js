// Gregtech Grindless - "Building Dimensions": base fluids in the building dimensions
//
// GTM 7.5.3's gas collector only has an Air recipe for the Overworld (plus separate nether_air/ender_air recipes,
// on circuits 2 and 3, gated to those two dimensions; GTM's data/recipe/serialized/chemistry/ChemistryRecipes.java):
//   GAS_COLLECTOR_RECIPES.recipeBuilder("air").circuitMeta(1).outputFluids(Air.getFluid(10000))
//       .dimension(new ResourceLocation("overworld")).duration(200).EUt(16)
//
// The two building dimensions (grindless:void and grindless:flat) get air from that same recipe: it gains their two
// dimension conditions in place, and GTM ORs the dimension conditions of one recipe (DimensionCondition.isOr; the same
// mechanism as the site rules in power/generators.js). One recipe, not copies: GTM's recipe lookup keeps one recipe per
// ingredient path (RecipeDB.addRecursive), so recipes with the same inputs (circuit 1 alone) can't all be found. Up to
// v0.6.0 this file added two copies for the building dimensions, and on the server one of them took the lookup leaf:
// the log said "failed to add recipe from staging into lookup DB" for gtceu:gas_collector/air, and a gas collector in
// the Overworld found no recipe. The old copies' ids (grindless:gas_collector/grindless_void_air and _flat_air) are
// gone; nothing else referred to them.
//
// Rhino: var + function in every callback (this event runs again on every /reload).
ServerEvents.recipes(function (event) {
    var found = 0
    event.forEachRecipe({ id: 'gtceu:gas_collector/air' }, function (r) {
        r.dimension('grindless:void')
        r.dimension('grindless:flat')
        found++
    })
    if (found !== 1) {
        console.error('[grindless/dimensions_resources] expected 1 recipe gtceu:gas_collector/air, found ' + found +
            ': the building dimensions have no air')
    }
})
