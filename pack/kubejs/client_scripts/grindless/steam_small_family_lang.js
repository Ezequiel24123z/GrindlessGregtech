// priority: 5300
// Gregtech Grindless - names and tooltips of the small Steam multiblock family (startup_scripts/grindless/steam/
// small_family.js, GTL idea - docs/research/leisure.md 4.2 - reimplemented with our own code and textures):
//
//   gtceu:steam_forge_hammer, gtceu:steam_compressor, gtceu:steam_alloy_smelter,
//   gtceu:steam_mixer, gtceu:steam_chemical_bath, gtceu:steam_ore_washer
//
// Kept out of pack/kubejs/assets/grindless/lang/* (owned by another agent): Minecraft merges lang entries from every
// script, so ClientEvents.lang works wherever it is declared (same approach as steam_content_lang.js).
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.steam_forge_hammer', 'Steam Forge Hammer')
    add('block.gtceu.steam_compressor', 'Steam Compressor')
    add('block.gtceu.steam_alloy_smelter', 'Steam Alloy Smelter')
    add('block.gtceu.steam_mixer', 'Steam Mixer')
    add('block.gtceu.steam_chemical_bath', 'Steam Chemical Bath')
    add('block.gtceu.steam_ore_washer', 'Steam Ore Washer')

    add('grindless.machine.steam_forge_hammer.tooltip.0', '§7Runs forge hammer recipes on steam, eight at a time.')

    add('grindless.machine.steam_compressor.tooltip.0', '§7Runs compressor recipes on steam, eight at a time.')

    add('grindless.machine.steam_alloy_smelter.tooltip.0', '§7Runs alloy smelter recipes on steam, eight at a time.')

    add('grindless.machine.steam_mixer.tooltip.0', '§7Runs mixer recipes on steam, eight at a time.')

    add('grindless.machine.steam_chemical_bath.tooltip.0', '§7Runs chemical bath recipes on steam, eight at a time.')

    add('grindless.machine.steam_ore_washer.tooltip.0', '§7Runs ore washer recipes on steam, eight at a time.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.steam_forge_hammer', 'Martillo de forja de vapor')
    add('block.gtceu.steam_compressor', 'Compresor de vapor')
    add('block.gtceu.steam_alloy_smelter', 'Fundición de aleación de vapor')
    add('block.gtceu.steam_mixer', 'Mezclador de vapor')
    add('block.gtceu.steam_chemical_bath', 'Baño químico de vapor')
    add('block.gtceu.steam_ore_washer', 'Lavadora de mineral de vapor')

    add('grindless.machine.steam_forge_hammer.tooltip.0', '§7Corre recetas de martillo de forja con vapor, ocho a la vez.')

    add('grindless.machine.steam_compressor.tooltip.0', '§7Corre recetas de compresor con vapor, ocho a la vez.')

    add('grindless.machine.steam_alloy_smelter.tooltip.0', '§7Corre recetas de fundición de aleación con vapor, ocho a la vez.')

    add('grindless.machine.steam_mixer.tooltip.0', '§7Corre recetas de mezcladora con vapor, ocho a la vez.')

    add('grindless.machine.steam_chemical_bath.tooltip.0', '§7Corre recetas de baño químico con vapor, ocho a la vez.')

    add('grindless.machine.steam_ore_washer.tooltip.0', '§7Corre recetas de lavadora de mena con vapor, ocho a la vez.')
})
