// Gregtech Grindless - test overlay (not shipped with the pack)
//
// Usage: powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//   -Commands 'kubejs custom_command gg_test_dimension_fluids' -WaitForLog 'GGTEST\|fluids\|DONE'
//
// Verifies: worldgen.oreVeins.infiniteBedrockOresFluids is on, and that grindless:void/flat have
// non-empty bedrock fluid deposits by querying com.gregtechceu.gtceu.api.data.worldgen.bedrockfluid.
// BedrockFluidVeinSavedData#getFluidVeinWorldEntry(chunkX, chunkZ) directly - the exact same call
// FluidDrillLogic (the MV Fluid Drilling Rig's recipe logic) makes, so a non-null definition here
// means the rig's own logic would see the same deposit. Uses `var` + plain `function` everywhere
// (see server_scripts/grindless/dimensions.js for why).
ServerEvents.customCommand('gg_test_dimension_fluids', function (event) { runFluidsTest(event) })

function ffCheck(name, ok, detail) {
    console.log('GGTEST|fluids|' + name + '|' + (ok ? 'PASS' : 'FAIL') + (detail ? ' (' + detail + ')' : ''))
}

function ffSafely(name, fn) {
    try {
        fn()
    } catch (e) {
        ffCheck(name, false, 'exception: ' + e)
    }
}

// A handful of widely spaced chunk coords, since bedrock fluid veins are assigned to clusters of
// several chunks at once (see BedrockFluidVeinSavedData#getVeinCoord), not every single chunk.
var SAMPLE_CHUNKS = [[0, 0], [5, 5], [-5, 5], [10, -10], [20, 0], [0, 20], [-15, -15]]

function sampleFluidVeins(savedDataClass, level, dimLabel) {
    var $BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    var data = savedDataClass.getOrCreate(level)
    var found = []
    for (var i = 0; i < SAMPLE_CHUNKS.length; i++) {
        var cx = SAMPLE_CHUNKS[i][0]
        var cz = SAMPLE_CHUNKS[i][1]
        var entry = data.getFluidVeinWorldEntry(cx, cz)
        var def = entry ? entry.getDefinition() : null
        if (def) {
            var fluid = def.getStoredFluid().get()
            var fluidId = $BuiltInRegistries.FLUID.getKey(fluid)
            found.push(cx + ',' + cz + '=' + fluidId + '(yield=' + entry.getFluidYield() + ')')
        }
    }
    console.log('GGTEST|fluids|' + dimLabel + '_sample|INFO ' + (found.length ? found.join('; ') : '(no deposit in any sampled chunk)'))
    return found.length
}

function runFluidsTest(event) {
    var server = event.getLevel().getServer()

    ffSafely('infinite_bedrock_fluids_config', function () {
        var $GTConfigHolder = Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder')
        $GTConfigHolder.init()
        var value = $GTConfigHolder.INSTANCE.worldgen.oreVeins.infiniteBedrockOresFluids
        ffCheck('infinite_bedrock_fluids_config', value === true, 'infiniteBedrockOresFluids=' + value)
    })

    ffSafely('void_fluid_deposits', function () {
        var $SavedData = Java.loadClass('com.gregtechceu.gtceu.api.data.worldgen.bedrockfluid.BedrockFluidVeinSavedData')
        var voidLevel = server.getLevel('grindless:void')
        if (!voidLevel) throw 'grindless:void missing'
        var count = sampleFluidVeins($SavedData, voidLevel, 'void')
        ffCheck('void_fluid_deposits', count > 0, count + '/' + SAMPLE_CHUNKS.length + ' sampled chunks have a deposit')
    })

    ffSafely('flat_fluid_deposits', function () {
        var $SavedData = Java.loadClass('com.gregtechceu.gtceu.api.data.worldgen.bedrockfluid.BedrockFluidVeinSavedData')
        var flatLevel = server.getLevel('grindless:flat')
        if (!flatLevel) throw 'grindless:flat missing'
        var count = sampleFluidVeins($SavedData, flatLevel, 'flat')
        ffCheck('flat_fluid_deposits', count > 0, count + '/' + SAMPLE_CHUNKS.length + ' sampled chunks have a deposit')
    })

    console.log('GGTEST|fluids|DONE')
}
