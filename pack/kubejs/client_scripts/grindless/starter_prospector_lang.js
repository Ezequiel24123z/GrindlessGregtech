// priority: 5620
ClientEvents.lang('en_us', function (event) {
  event.add('grindless', 'item.grindless.field_prospector', 'Field Prospector (HV)')
  event.add('grindless', 'tooltip.grindless.field_prospector.range', 'Right-click: mark ore veins up to 16 chunks (256 blocks) away in X and Z.')
  event.add('grindless', 'tooltip.grindless.field_prospector.power', 'Instant survey. Unlimited scans, no charging, no power output.')
  event.add('grindless', 'tooltip.grindless.field_prospector.terrain', 'Open your map and enable Ore Veins. Only surveys generated terrain; explore further, then scan again.')
  event.add('grindless', 'message.grindless.field_prospector.result', 'Surveyed %s ore veins within 16 chunks (256 blocks in X and Z). Open your map and enable Ore Veins. Ungenerated terrain is not surveyed.')
  event.add('grindless', 'message.grindless.field_prospector.no_data', 'No cached ore-vein data within 16 chunks (256 blocks in X and Z). Explore more terrain, then scan again; this does not mean there are no ores.')
  event.add('grindless', 'message.grindless.field_prospector.error', 'The survey failed. Check the server KubeJS log for the error.')
})

ItemEvents.tooltip(function (event) {
  event.addAdvanced('gtceu:prospector.hv', function (item, advanced, text) {
    var tag = item.getNbt()
    if (tag === null || !tag.getBoolean('grindless_starter_prospector')) return
    var name = text.get(0)
    text.clear()
    text.add(name)
    text.add(Text.aqua(Text.translate('tooltip.grindless.field_prospector.range')))
    text.add(Text.green(Text.translate('tooltip.grindless.field_prospector.power')))
    text.add(Text.gray(Text.translate('tooltip.grindless.field_prospector.terrain')))
    if (advanced) text.add(Text.darkGray('gtceu:prospector.hv'))
  })
})
