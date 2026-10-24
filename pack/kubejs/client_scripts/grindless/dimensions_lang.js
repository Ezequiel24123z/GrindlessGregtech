// Gregtech Grindless - "Dimensiones de construcción"
//
// Item names/tooltips for grindless:void_key and grindless:flat_key.
// Kept out of pack/kubejs/assets/grindless/lang/* (owned by another agent) - Minecraft merges
// lang entries from every namespace/script, so ClientEvents.lang works fine regardless of where
// it is declared. Confirmed present in KubeJS 2001 (dev.latvian.mods.kubejs.bindings.event.ClientEvents#LANG).
ClientEvents.lang('en_us', event => {
    event.add('grindless', 'item.grindless.void_key', 'Void Key')
    event.add('grindless', 'item.grindless.void_key.tooltip', 'Teleports you to the Void building dimension. Use again to return.')
    event.add('grindless', 'item.grindless.flat_key', 'Flat Key')
    event.add('grindless', 'item.grindless.flat_key.tooltip', 'Teleports you to the Flat building dimension. Use again to return.')
})

ClientEvents.lang('es_es', event => {
    event.add('grindless', 'item.grindless.void_key', 'Llave del Vacío')
    event.add('grindless', 'item.grindless.void_key.tooltip', 'Teletransporta a la dimensión Vacío. Úsala otra vez para volver.')
    event.add('grindless', 'item.grindless.flat_key', 'Llave del Llano')
    event.add('grindless', 'item.grindless.flat_key.tooltip', 'Teletransporta a la dimensión Llano. Úsala otra vez para volver.')
})
