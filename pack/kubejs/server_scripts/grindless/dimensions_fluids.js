// Gregtech Grindless - "Dimensiones de construcción": bedrock fluid deposits in void/flat
//
// GTM 7.5.3's six Overworld bedrock fluid veins (gtceu:heavy_oil_deposit, light_oil_deposit,
// natural_gas_deposit, oil_deposit, raw_oil_deposit, salt_water_deposit - see GTM's own
// common/data/GTBedrockFluids.java) are each registered with `.dimensions(Set.of(Level.OVERWORLD))`.
// Extend every one of them so grindless:void and grindless:flat count as valid dimensions too,
// the same additive approach already used for regular ore veins in dimensions.js - but unlike
// regular ore veins, bedrock fluid veins are NOT tied to chunk-generation at all: a chunk's vein is
// a lazy weighted-random pick done purely from BedrockFluidVeinSavedData (see
// api/data/worldgen/bedrockfluid/BedrockFluidVeinSavedData#getFluidVeinWorldEntry, the exact method
// the MV Fluid Drilling Rig itself calls via FluidDrillLogic), independent of the chunk generator
// (minecraft:flat included). So this does not have the "doSuperflatOres" caveat the ore veins had.
//
// Note salt_water_deposit has a base weight of 0 (only reachable via its ocean/deep-ocean biome
// bonus) - grindless:void (the_void) and grindless:flat (plains) are not ocean biomes, so it will
// correctly never appear there, same as it would not in an Overworld desert. The other five veins
// all have a positive base weight regardless of biome, so they remain pickable.
//
// Config: pack/config/gtceu.yaml now also sets worldgen.oreVeins.infiniteBedrockOresFluids: true,
// so none of these veins (anywhere, including the Overworld) ever deplete.

var OUR_FLUID_VEIN_IDS = [
    'gtceu:heavy_oil_deposit',
    'gtceu:light_oil_deposit',
    'gtceu:natural_gas_deposit',
    'gtceu:oil_deposit',
    'gtceu:raw_oil_deposit',
    'gtceu:salt_water_deposit',
]

var $FluidsHashSet = Java.loadClass('java.util.HashSet')
var $FluidsResourceKey = Java.loadClass('net.minecraft.resources.ResourceKey')
var $FluidsRegistries = Java.loadClass('net.minecraft.core.registries.Registries')
var $FluidsResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')

GTCEuServerEvents.fluidVeins(function (event) { extendFluidVeinsToOurDims(event) })

function extendFluidVeinsToOurDims(event) {
    var voidKey = $FluidsResourceKey.create($FluidsRegistries.DIMENSION, new $FluidsResourceLocation('grindless', 'void'))
    var flatKey = $FluidsResourceKey.create($FluidsRegistries.DIMENSION, new $FluidsResourceLocation('grindless', 'flat'))
    for (var i = 0; i < OUR_FLUID_VEIN_IDS.length; i++) {
        extendOneFluidVein(event, OUR_FLUID_VEIN_IDS[i], voidKey, flatKey)
    }
}

function extendOneFluidVein(event, id, voidKey, flatKey) {
    try {
        event.modify(id, function (def) { addDimsToFluidVeinFilter(def, voidKey, flatKey) })
    } catch (e) {
        console.error('[grindless] No se pudo extender la veta de fluido ' + id + ': ' + e)
    }
}

function addDimsToFluidVeinFilter(def, voidKey, flatKey) {
    // BedrockFluidDefinition has no fluent @Accessors (unlike GTOreDefinition): dimensionFilter is
    // a plain public field, so it is read/written as a property, not called as a method.
    var updated = new $FluidsHashSet(def.dimensionFilter)
    updated.add(voidKey)
    updated.add(flatKey)
    def.dimensionFilter = updated
}
