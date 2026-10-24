// Gregtech Grindless - "Dimensiones de construcción"
//
// Registers the three travel keys. Names/tooltips live in client_scripts/grindless/dimensions_lang.js
// (ClientEvents.lang) so we never touch pack/kubejs/assets/grindless/lang/* (owned by another agent).
// Teleport behaviour lives in server_scripts/grindless/dimensions.js.
StartupEvents.registry('item', event => {
    event.create('grindless:void_key')
        .maxStackSize(1)
        .texture('grindless:item/void_key')
        .tooltip(Text.gray(Text.translate('item.grindless.void_key.tooltip')))

    event.create('grindless:flat_key')
        .maxStackSize(1)
        .texture('grindless:item/flat_key')
        .tooltip(Text.gray(Text.translate('item.grindless.flat_key.tooltip')))

    event.create('grindless:end_key')
        .maxStackSize(1)
        .texture('grindless:item/end_key')
        .tooltip(Text.gray(Text.translate('item.grindless.end_key.tooltip')))
})
