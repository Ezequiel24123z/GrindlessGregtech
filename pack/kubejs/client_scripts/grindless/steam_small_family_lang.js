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

    add('grindless.machine.steam_forge_hammer.tooltip.0', 'Runs the Forge Hammer recipe type with 8 parallels: ingots into plates, ore crushing, eight at a time.')
    add('grindless.machine.steam_forge_hammer.tooltip.1', 'Replaces the single-block Low/High Pressure Steam Forge Hammer: same steam limit, same LV-tier cap, eight times the throughput.')
    add('grindless.machine.steam_forge_hammer.tooltip.2', 'Needs 1 steam input hatch, 1 steam input bus and 1 steam output bus.')

    add('grindless.machine.steam_compressor.tooltip.0', 'Runs the Compressor recipe type with 8 parallels: dusts into plates, blocks from the base item, eight at a time.')
    add('grindless.machine.steam_compressor.tooltip.1', 'Replaces the single-block Low/High Pressure Steam Compressor: same steam limit, same LV-tier cap, eight times the throughput.')
    add('grindless.machine.steam_compressor.tooltip.2', 'Needs 1 steam input hatch, 1 steam input bus and 1 steam output bus.')

    add('grindless.machine.steam_alloy_smelter.tooltip.0', 'Runs the Alloy Smelter recipe type with 8 parallels: two ingots or dusts straight into an alloy ingot, eight at a time.')
    add('grindless.machine.steam_alloy_smelter.tooltip.1', 'Replaces the single-block Low/High Pressure Steam Alloy Smelter: same steam limit, same LV-tier cap, eight times the throughput.')
    add('grindless.machine.steam_alloy_smelter.tooltip.2', 'Needs 1 steam input hatch, 1 steam input bus and 1 steam output bus.')

    add('grindless.machine.steam_mixer.tooltip.0', 'Runs the Mixer recipe type with 8 parallels: bronze, brass, invar and the other dust alloys need no fluid at all.')
    add('grindless.machine.steam_mixer.tooltip.1', 'Add 1 or 2 fluid input hatches for glue, salt water, concrete or drilling fluid, and 1 fluid output hatch if the recipe gives one back.')
    add('grindless.machine.steam_mixer.tooltip.2', 'No single-block Steam Mixer exists in GTM: this is the only way to mix before LV.')
    add('grindless.machine.steam_mixer.tooltip.3', 'Needs 1 steam input hatch, 1 steam input bus and 1 steam output bus; the fluid hatches are optional.')

    add('grindless.machine.steam_chemical_bath.tooltip.0', 'Runs the Chemical Bath recipe type with 8 parallels: paper from wood dust or sugar cane, treated planks from creosote, dark concrete.')
    add('grindless.machine.steam_chemical_bath.tooltip.1', 'No single-block Steam Chemical Bath exists in GTM: this is the only way to use one before LV.')
    add('grindless.machine.steam_chemical_bath.tooltip.2', 'Needs 1 steam input hatch, 1 steam input bus, 1 steam output bus and 1 fluid input hatch.')

    add('grindless.machine.steam_ore_washer.tooltip.0', 'Runs the Ore Washer recipe type with 8 parallels: crushed ore washed clean with water, eight at a time.')
    add('grindless.machine.steam_ore_washer.tooltip.1', 'No single-block Steam Ore Washer exists in GTM: this is the only way to wash ore before LV.')
    add('grindless.machine.steam_ore_washer.tooltip.2', 'Needs 1 steam input hatch, 1 steam input bus, 1 steam output bus and 1 fluid input hatch.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.steam_forge_hammer', 'Martillo de forja de vapor')
    add('block.gtceu.steam_compressor', 'Compresor de vapor')
    add('block.gtceu.steam_alloy_smelter', 'Fundición de aleación de vapor')
    add('block.gtceu.steam_mixer', 'Mezclador de vapor')
    add('block.gtceu.steam_chemical_bath', 'Baño químico de vapor')
    add('block.gtceu.steam_ore_washer', 'Lavadora de mineral de vapor')

    add('grindless.machine.steam_forge_hammer.tooltip.0', 'Corre el tipo de receta del martillo de forja con 8 paralelos: lingotes a chapas, triturado de mena, de ocho en ocho.')
    add('grindless.machine.steam_forge_hammer.tooltip.1', 'Sustituye al martillo de forja de vapor de un bloque (baja o alta presión): mismo límite de vapor, mismo tope de LV, ocho veces el rendimiento.')
    add('grindless.machine.steam_forge_hammer.tooltip.2', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 1 bus de salida de vapor.')

    add('grindless.machine.steam_compressor.tooltip.0', 'Corre el tipo de receta del compresor con 8 paralelos: polvos a chapas, bloques desde el objeto base, de ocho en ocho.')
    add('grindless.machine.steam_compressor.tooltip.1', 'Sustituye al compresor de vapor de un bloque (baja o alta presión): mismo límite de vapor, mismo tope de LV, ocho veces el rendimiento.')
    add('grindless.machine.steam_compressor.tooltip.2', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 1 bus de salida de vapor.')

    add('grindless.machine.steam_alloy_smelter.tooltip.0', 'Corre el tipo de receta de la fundición de aleación con 8 paralelos: dos lingotes o polvos directos a un lingote de aleación, de ocho en ocho.')
    add('grindless.machine.steam_alloy_smelter.tooltip.1', 'Sustituye a la fundición de aleación de vapor de un bloque (baja o alta presión): mismo límite de vapor, mismo tope de LV, ocho veces el rendimiento.')
    add('grindless.machine.steam_alloy_smelter.tooltip.2', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 1 bus de salida de vapor.')

    add('grindless.machine.steam_mixer.tooltip.0', 'Corre el tipo de receta del mezclador con 8 paralelos: el bronce, el latón, el invar y el resto de aleaciones en polvo no piden ningún fluido.')
    add('grindless.machine.steam_mixer.tooltip.1', 'Añade 1 o 2 escotillas de entrada de fluido para la cola, el agua salada, el hormigón o el lodo de perforación, y 1 escotilla de salida si la receta devuelve un fluido.')
    add('grindless.machine.steam_mixer.tooltip.2', 'GTM no tiene mezclador de vapor de un bloque: es la única forma de mezclar antes de LV.')
    add('grindless.machine.steam_mixer.tooltip.3', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 1 bus de salida de vapor; las escotillas de fluido son opcionales.')

    add('grindless.machine.steam_chemical_bath.tooltip.0', 'Corre el tipo de receta del baño químico con 8 paralelos: papel desde polvo de madera o caña de azúcar, madera tratada desde creosota, hormigón oscuro.')
    add('grindless.machine.steam_chemical_bath.tooltip.1', 'GTM no tiene baño químico de vapor de un bloque: es la única forma de usarlo antes de LV.')
    add('grindless.machine.steam_chemical_bath.tooltip.2', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor, 1 bus de salida de vapor y 1 escotilla de entrada de fluido.')

    add('grindless.machine.steam_ore_washer.tooltip.0', 'Corre el tipo de receta de la lavadora de mineral con 8 paralelos: mena triturada lavada con agua, de ocho en ocho.')
    add('grindless.machine.steam_ore_washer.tooltip.1', 'GTM no tiene lavadora de mineral de vapor de un bloque: es la única forma de lavar mena antes de LV.')
    add('grindless.machine.steam_ore_washer.tooltip.2', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor, 1 bus de salida de vapor y 1 escotilla de entrada de fluido.')
})
