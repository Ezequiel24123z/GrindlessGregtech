// Gregtech Grindless - "Building Dimensions": base fluids in the building dimensions
//
// (1) GTM 7.5.3's gas collector only has an Air recipe for the Overworld (plus separate
// nether_air/ender_air recipes gated to those two dimensions - see GTM's own
// data/recipe/serialized/chemistry/ChemistryRecipes.java):
//   GAS_COLLECTOR_RECIPES.recipeBuilder("air").circuitMeta(1).outputFluids(Air.getFluid(10000))
//       .dimension(new ResourceLocation("overworld")).duration(200).EUt(16)
// Mirrored here 1:1 (same circuit/output amount/duration/EUt) for grindless:void and
// grindless:flat via the `.dimension(...)` recipe condition (confirmed in GTM 7.5.3's own
// docs/content/Modpacks/Recipes/Recipe-Conditions.md: `.dimension("namespace:dimension_id")`,
// and GTRecipeSchema.GTRecipeJS#dimension(ResourceLocation) in the KubeJS integration).
ServerEvents.recipes(function (event) { addGasCollectorRecipes(event) })

function addGasCollectorRecipes(event) {
    event.recipes.gtceu.gas_collector('grindless:grindless_void_air')
        .circuit(1)
        .outputFluids(Fluid.of('gtceu:air', 10000))
        .dimension('grindless:void')
        .duration(200).EUt(16)

    event.recipes.gtceu.gas_collector('grindless:grindless_flat_air')
        .circuit(1)
        .outputFluids(Fluid.of('gtceu:air', 10000))
        .dimension('grindless:flat')
        .duration(200).EUt(16)
}
