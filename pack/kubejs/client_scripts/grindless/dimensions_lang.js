// Gregtech Grindless - "Building Dimensions"
//
// Item names/tooltips for the three travel keys, and the action-bar message shown when a key fails.
// Kept out of pack/kubejs/assets/grindless/lang/* (owned by another agent) - Minecraft merges
// lang entries from every namespace/script, so ClientEvents.lang works fine regardless of where
// it is declared. Confirmed present in KubeJS 2001 (dev.latvian.mods.kubejs.bindings.event.ClientEvents#LANG).
ClientEvents.lang('en_us', event => {
    event.add('grindless', 'item.grindless.void_key', 'Void Key')
    event.add('grindless', 'item.grindless.void_key.tooltip', 'Teleports you to the Void building dimension. Use again to return.')
    event.add('grindless', 'item.grindless.flat_key', 'Flat Key')
    event.add('grindless', 'item.grindless.flat_key.tooltip', 'Teleports you to the Flat building dimension. Use again to return.')
    event.add('grindless', 'item.grindless.end_key', 'End Key')
    event.add('grindless', 'item.grindless.end_key.tooltip', 'Teleports you to a safe platform in the End, far from the central island. Use again to return.')
    event.add('grindless', 'message.grindless.travel_key.failed', 'The key fails: the trip did not happen (details in logs/kubejs/server.log).')
})

ClientEvents.lang('es_es', event => {
    event.add('grindless', 'item.grindless.void_key', 'Llave del Vacío')
    event.add('grindless', 'item.grindless.void_key.tooltip', 'Teletransporta a la dimensión Vacío. Úsala otra vez para volver.')
    event.add('grindless', 'item.grindless.flat_key', 'Llave del Llano')
    event.add('grindless', 'item.grindless.flat_key.tooltip', 'Teletransporta a la dimensión Llano. Úsala otra vez para volver.')
    event.add('grindless', 'item.grindless.end_key', 'Llave del End')
    event.add('grindless', 'item.grindless.end_key.tooltip', 'Teletransporta a una plataforma segura en el End, lejos de la isla central. Úsala otra vez para volver.')
    event.add('grindless', 'message.grindless.travel_key.failed', 'La llave falla: el viaje no se ha hecho (detalles en logs/kubejs/server.log).')
})
