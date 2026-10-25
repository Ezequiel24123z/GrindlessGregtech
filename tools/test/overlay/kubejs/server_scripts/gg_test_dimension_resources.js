// Gregtech Grindless - test overlay (not shipped with the pack)
//
// Usage: powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//   -Commands 'kubejs custom_command gg_test_dimension_resources' -WaitForLog 'GGTEST\|resources\|DONE'
//
// Verifies (1) that GTM's gas collector Air recipe (gtceu:gas_collector/air, circuit 1) carries the dimension
// conditions of the Overworld and both building dimensions (grindless:void, grindless:flat; ORed by GTM), and that the
// old copies for the building dimensions are gone (they shared circuit 1, so GTM's lookup could only keep one of the
// three recipes), and (2) reports GTM's pump biome
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

function rrRecipe(manager, id) {
    var $ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var opt = manager.byKey(new $ResourceLocation(id))
    return opt.isPresent() ? opt.get() : null
}

function runResourcesTest(event) {
    var server = event.getLevel().getServer()
    var manager = server.getRecipeManager()

    rrSafely('air_recipe_dimensions', function () {
        var $DimensionCondition = Java.loadClass('com.gregtechceu.gtceu.common.recipe.condition.DimensionCondition')
        var recipe = rrRecipe(manager, 'gtceu:gas_collector/air')
        if (!recipe) throw 'gtceu:gas_collector/air is missing'
        var dims = []
        var conditions = recipe.conditions
        for (var i = 0; i < conditions.size(); i++) {
            var c = conditions.get(i)
            if (c instanceof $DimensionCondition) dims.push(String(c.getDimension().location()))
        }
        dims.sort()
        var got = dims.join(',')
        rrCheck('air_recipe_dimensions', got === 'grindless:flat,grindless:void,minecraft:overworld', got)
    })
    rrSafely('air_copies_gone', function () {
        var left = ['grindless:gas_collector/grindless_void_air', 'grindless:gas_collector/grindless_flat_air']
            .filter(function (id) { return rrRecipe(manager, id) !== null })
        rrCheck('air_copies_gone', left.length === 0, left.length ? 'still there: ' + left.join(', ') : 'none left')
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
