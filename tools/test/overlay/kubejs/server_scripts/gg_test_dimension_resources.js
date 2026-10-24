// Gregtech Grindless - test overlay (not shipped with the pack)
//
// Usage: powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//   -Commands 'kubejs custom_command gg_test_dimension_resources' -WaitForLog 'GGTEST\|resources\|DONE'
//
// Verifies (1) the gas_collector air recipes for grindless:void/flat exist in the recipe manager
// with a DimensionCondition pointing at the right dimension, and (2) reports GTM's pump biome
// modifier for both dimensions' biomes (GTUtil.getPumpBiomeModifier - used by the primitive pump
// multiblock) so we know empirically whether it yields water there or not. Uses `var` + plain
// `function` everywhere (see server_scripts/grindless/dimensions.js for why).
ServerEvents.customCommand('gg_test_dimension_resources', function (event) { runResourcesTest(event) })

function rrCheck(name, ok, detail) {
    console.log('GGTEST|resources|' + name + '|' + (ok ? 'PASS' : 'FAIL') + (detail ? ' (' + detail + ')' : ''))
}

function rrSafely(name, fn) {
    try {
        fn()
    } catch (e) {
        rrCheck(name, false, 'exception: ' + e)
    }
}

function checkGasCollectorRecipe(manager, checkName, recipeId, expectedDim) {
    var $ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var $DimensionCondition = Java.loadClass('com.gregtechceu.gtceu.common.recipe.condition.DimensionCondition')
    var opt = manager.byKey(new $ResourceLocation(recipeId))
    var recipe = null
    if (opt.isPresent()) {
        recipe = opt.get()
    } else {
        // Fallback: scan every registered recipe for one whose id merely *contains* our path, in
        // case GTM's KubeJS recipe schema resolved/renamed the id differently than expected.
        var needle = recipeId.substring(recipeId.indexOf(':') + 1)
        var all = manager.getRecipes().iterator()
        var foundIds = []
        while (all.hasNext()) {
            var r = all.next()
            var rid = r.getId().toString()
            if (rid.indexOf(needle) !== -1) {
                foundIds.push(rid)
                recipe = r
            }
        }
        if (!recipe) {
            rrCheck(checkName, false, recipeId + ' not found by key, and no recipe id contains "' + needle + '"')
            return
        }
        console.log('GGTEST|resources|' + checkName + '|INFO exact id not found; fallback scan matched: ' + foundIds.join(', '))
    }
    var conditions = recipe.conditions
    var matchedDim = null
    for (var i = 0; i < conditions.size(); i++) {
        var c = conditions.get(i)
        if (c instanceof $DimensionCondition) {
            matchedDim = c.getDimension().location().toString()
        }
    }
    rrCheck(checkName, matchedDim === expectedDim, recipeId + ' dimensionCondition=' + matchedDim)
}

function runResourcesTest(event) {
    var server = event.getLevel().getServer()
    var manager = server.getRecipeManager()

    rrSafely('void_air_recipe', function () {
        checkGasCollectorRecipe(manager, 'void_air_recipe', 'grindless:grindless_void_air', 'grindless:void')
    })
    rrSafely('flat_air_recipe', function () {
        checkGasCollectorRecipe(manager, 'flat_air_recipe', 'grindless:grindless_flat_air', 'grindless:flat')
    })

    // Pump biome modifier: GTUtil.getPumpBiomeModifier(Holder<Biome>) drives the primitive pump
    // multiblock's water output (0 or negative = none; the single-block electric Pump is separate
    // and instead drains real water-source blocks regardless of biome, so it is not covered here).
    rrSafely('pump_biome_modifiers', function () {
        var $GTUtil = Java.loadClass('com.gregtechceu.gtceu.utils.GTUtil')
        var voidLevel = server.getLevel('grindless:void')
        var flatLevel = server.getLevel('grindless:flat')
        if (!voidLevel || !flatLevel) throw 'a dimension is missing'

        var voidBiome = voidLevel.getBiome(voidLevel.getBlock(0, 64, 0).getPos())
        var flatBiome = flatLevel.getBiome(flatLevel.getBlock(0, 64, 0).getPos())
        var voidMod = $GTUtil.getPumpBiomeModifier(voidBiome)
        var flatMod = $GTUtil.getPumpBiomeModifier(flatBiome)

        console.log('GGTEST|resources|pump_biome_modifiers|INFO voidBiomeModifier=' + voidMod +
            ' flatBiomeModifier=' + flatMod + ' (mB/cycle*hatchModifier; <=0 means the primitive pump yields nothing)')
        rrCheck('pump_biome_modifiers', true, 'void=' + voidMod + ' flat=' + flatMod)
    })

    console.log('GGTEST|resources|DONE')
}
