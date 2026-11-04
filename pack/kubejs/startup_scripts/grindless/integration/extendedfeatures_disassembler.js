// priority: -2249
// Gregtech Grindless - Extended Features' universal disassembler logic removed (it emptied EMI on dedicated servers)
//
// extendedfeatures 3.0.0 (EFRecipeTypes) attaches DisassemblerRecipeLogic to its machine_disassembly recipe type, whatever
// config/extendedfeatures.yaml says. GTM's EMI plugin asks every type for its representative recipes
// (GTRecipeType#buildRepresentativeRecipes), and this logic reads the integrated server's level
// (ComponentResolver#resolveFromCraftingTable), which a client joined to a dedicated server does not have. Its NullPointerException
// aborted GTM's whole EMI plugin there (v1.5.0): no GregTech recipe, category or workstation in EMI. Singleplayer was fine.
// The disassembler is out (DECISIONS, 2026-10-24; server_scripts/grindless/integration/extendedfeatures.js removes its controller and
// recipes), so its custom logic goes too, on both sides, once every recipe type is registered (the 'gtceu:dimension_marker' event is
// posted after the machines, as in recipe_info_wrap.js).
;(function () {
GTCEuStartupEvents.registry('gtceu:dimension_marker', function (event) {
  try {
    var Registries = Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
    var ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var type = Registries.RECIPE_TYPES.get(new ResourceLocation('extendedfeatures:machine_disassembly'))
    if (type == null) {
      console.warn('[grindless/integration] extendedfeatures:machine_disassembly is not registered: no disassembler logic to remove')
      return
    }
    var runners = type.getCustomRecipeLogicRunners()
    var n = runners.size()
    runners.clear()
    console.info('[grindless/integration] extendedfeatures:machine_disassembly: ' + n + ' custom recipe logic runner(s) removed')
  } catch (e) {
    console.error('[grindless/integration] extendedfeatures:machine_disassembly logic not removed: ' + e)
  }
})
})()
