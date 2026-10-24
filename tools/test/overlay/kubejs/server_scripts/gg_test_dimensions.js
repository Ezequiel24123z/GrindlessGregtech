// Gregtech Grindless - test overlay (not shipped with the pack)
//
// Usage: powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//   -Commands 'kubejs custom_command gg_test_dimensions' -WaitForLog 'GGTEST\|dimensions\|DONE'
//
// Verifies: both custom dimensions exist and generate, grindless:void is empty air before any
// platform is placed, grindless:flat has the expected flat layer stack, both travel keys are
// registered items, and (bonus, non-fatal) whether GT ore veins show up underground in
// grindless:flat.
//
// Uses `var` + plain `function` everywhere (see the matching note in
// server_scripts/grindless/dimensions.js): a const/let declared directly inside a function that
// KubeJS/Rhino can end up invoking more than once in a session throws a "redeclaration of var X"
// TypeError on the second call, regardless of whether that function is named or anonymous.
ServerEvents.customCommand('gg_test_dimensions', function (event) { runDimensionsTest(event) })

function ggCheck(name, ok, detail) {
    console.log('GGTEST|dimensions|' + name + '|' + (ok ? 'PASS' : 'FAIL') + (detail ? ' (' + detail + ')' : ''))
}

function ggSafely(name, fn) {
    try {
        fn()
    } catch (e) {
        ggCheck(name, false, 'exception: ' + e)
    }
}

function runDimensionsTest(event) {
    var server = event.getLevel().getServer()

    ggSafely('void_key_item_registered', function () {
        ggCheck('void_key_item_registered', Item.exists('grindless:void_key'))
    })
    ggSafely('flat_key_item_registered', function () {
        ggCheck('flat_key_item_registered', Item.exists('grindless:flat_key'))
    })

    var voidLevel = null
    var flatLevel = null
    ggSafely('void_dimension_exists', function () {
        voidLevel = server.getLevel('grindless:void')
        ggCheck('void_dimension_exists', voidLevel != null)
    })
    ggSafely('flat_dimension_exists', function () {
        flatLevel = server.getLevel('grindless:flat')
        ggCheck('flat_dimension_exists', flatLevel != null)
    })

    // Reading a block forces that chunk to load/generate first, so these checks double as the
    // "force-load/generate a chunk in each dimension" step.
    ggSafely('void_air_before_platform', function () {
        if (!voidLevel) throw 'grindless:void missing'
        var b = voidLevel.getBlock(0, 64, 0)
        ggCheck('void_air_before_platform', b.getBlockState().isAir(), 'block=' + b.getId())
    })

    ggSafely('flat_layers', function () {
        if (!flatLevel) throw 'grindless:flat missing'
        var grass = flatLevel.getBlock(0, 63, 0)
        ggCheck('flat_surface_is_grass', grass.getId() === 'minecraft:grass_block', 'block=' + grass.getId())

        var dirt = flatLevel.getBlock(0, 61, 0)
        ggCheck('flat_dirt_below_grass', dirt.getId() === 'minecraft:dirt', 'block=' + dirt.getId())

        var stone = flatLevel.getBlock(0, 30, 0)
        ggCheck('flat_stone_below_dirt', stone.getId() === 'minecraft:stone', 'block=' + stone.getId())

        var deepslate = flatLevel.getBlock(0, -30, 0)
        ggCheck('flat_deepslate_near_bottom', deepslate.getId() === 'minecraft:deepslate', 'block=' + deepslate.getId())

        var bedrock = flatLevel.getBlock(0, -64, 0)
        ggCheck('flat_bedrock_floor', bedrock.getId() === 'minecraft:bedrock', 'block=' + bedrock.getId())

        // Heightmap check last: it is only reliable once the chunk above has actually finished
        // generating (querying it on a brand new chunk before anything forced that chunk to load
        // can read a stale/empty heightmap). The real teleport logic does not depend on this at
        // all - grindless:flat's surface is always y=63 by construction - this is extra evidence.
        var $HeightmapTypes = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')
        var surfaceY = flatLevel.getHeight($HeightmapTypes.MOTION_BLOCKING, 0, 0)
        ggCheck('flat_surface_height_is_64', surfaceY === 64, 'surfaceY=' + surfaceY)
    })

    // Bonus (reported, not pass/fail for the suite): do GTM Overworld ore veins show up
    // underground in grindless:flat? Scans a modest area/height range around spawn.
    ggSafely('flat_gt_ore_veins', function () {
        if (!flatLevel) throw 'grindless:flat missing'
        var found = null
        var ys = [60, 48, 32, 20, 8, -10, -25, -40, -55]
        outer:
        for (var yi = 0; yi < ys.length; yi++) {
            var y = ys[yi]
            for (var x = -48; x < 48 && !found; x += 2) {
                for (var z = -48; z < 48 && !found; z += 2) {
                    var b = flatLevel.getBlock(x, y, z)
                    var id = b.getId()
                    if (b.hasTag('forge:ores') || (id.startsWith('gtceu:') && id.indexOf('ore') !== -1)) {
                        found = id + ' @ ' + x + ',' + y + ',' + z
                        break outer
                    }
                }
            }
        }
        if (found) {
            ggCheck('flat_gt_ore_veins', true, found)
        } else {
            console.log('GGTEST|dimensions|flat_gt_ore_veins|INFO no ore block found in the sampled area (vein placement is random; this does not fail the suite)')
        }
    })

    // Diagnostic for the bonus feature: did our GTCEuServerEvents.oreVeins mutation actually stick
    // on at least one real Overworld vein's live dimensionFilter, and is dev.doSuperflatOres really
    // on? This tells pass/fail apart from "mutation silently did nothing" vs "mutated fine but GTM's
    // generator still does not place anything in a minecraft:flat chunk generator for some other
    // reason". Still informational only - does not fail the suite.
    ggSafely('flat_vein_filter_and_config_state', function () {
        var $GTRegistries = Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
        var $GTConfigHolder2 = Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder')
        var doSuperflatOres = $GTConfigHolder2.INSTANCE.dev.doSuperflatOres

        var keys = $GTRegistries.ORE_VEINS.keys().iterator()
        var sampleId = null
        var hasFlatInFilter = false
        while (keys.hasNext() && !sampleId) {
            var k = keys.next()
            var vein = $GTRegistries.ORE_VEINS.get(k)
            var filter = vein.dimensionFilter()
            var hasOverworld = false
            filter.forEach(function (key) { if (key.location().toString() === OVERWORLD_DIM) hasOverworld = true })
            if (hasOverworld) {
                sampleId = k.toString()
                filter.forEach(function (key) { if (key.location().toString() === 'grindless:flat') hasFlatInFilter = true })
            }
        }
        console.log('GGTEST|dimensions|flat_vein_filter_and_config_state|INFO doSuperflatOres=' + doSuperflatOres +
            ' sampleVein=' + sampleId + ' flatInDimensionFilter=' + hasFlatInFilter)
    })

    // server_scripts share one global scope, so computeLanding (from dimensions.js) is callable
    // here directly without a real player. Calling it *twice* in a row specifically re-checks the
    // "redeclaration of var" Rhino bug this suite caught earlier (a function invoked more than
    // once that declares its own locals): this is the real per-use teleport landing logic, not a
    // fake stand-in, so a second clean call is good evidence the actual key-use path (which runs
    // this same function on every right click) will not break on a second use either.
    ggSafely('teleport_landing_logic_repeatable', function () {
        if (!voidLevel || !flatLevel) throw 'a dimension is missing'
        var firstVoid = computeLanding(voidLevel, 'grindless:void', 100.0, 100.0)
        var firstFlat = computeLanding(flatLevel, 'grindless:flat', 100.0, 100.0)
        var secondVoid = computeLanding(voidLevel, 'grindless:void', 100.0, 100.0)
        var secondFlat = computeLanding(flatLevel, 'grindless:flat', 100.0, 100.0)
        var ok = firstVoid.y === 64 && secondVoid.y === 64 && firstFlat.y === 64 && secondFlat.y === 64
        ggCheck('teleport_landing_logic_repeatable', ok,
            'void=' + firstVoid.y + '/' + secondVoid.y + ' flat=' + firstFlat.y + '/' + secondFlat.y)
    })

    console.log('GGTEST|dimensions|DONE')
}
