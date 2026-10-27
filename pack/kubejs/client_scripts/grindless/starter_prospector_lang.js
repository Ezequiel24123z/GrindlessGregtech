// priority: 5700
ClientEvents.lang('en_us', function (event) {
  event.add('grindless', 'item.grindless.field_prospector', 'Field Prospector (HV)')
  event.add('grindless', 'tooltip.grindless.field_prospector.range', 'Right-click: mark ore veins up to 16 chunks (256 blocks) away in X and Z.')
  event.add('grindless', 'tooltip.grindless.field_prospector.power', 'Instant survey. Unlimited scans, no charging, no power output.')
  event.add('grindless', 'tooltip.grindless.field_prospector.terrain', 'Open your map and enable Ore Veins. Only surveys generated terrain; explore further, then scan again.')
  event.add('grindless', 'message.grindless.field_prospector.result', 'Surveyed %s ore veins within 16 chunks (256 blocks in X and Z). Open your map and enable Ore Veins. Ungenerated terrain is not surveyed.')
  event.add('grindless', 'message.grindless.field_prospector.no_data', 'No cached ore-vein data within 16 chunks (256 blocks in X and Z). Explore more terrain, then scan again; this does not mean there are no ores.')
  event.add('grindless', 'message.grindless.field_prospector.error', 'The survey failed. Check the server KubeJS log for the error.')
})

ClientEvents.lang('es_es', function (event) {
  event.add('grindless', 'item.grindless.field_prospector', 'Prospector de campo (HV)')
  event.add('grindless', 'tooltip.grindless.field_prospector.range', 'Clic derecho: marca vetas hasta a 16 chunks (256 bloques) en X y Z.')
  event.add('grindless', 'tooltip.grindless.field_prospector.power', 'Escaneo instantáneo. Usos ilimitados, sin recarga ni salida de energía.')
  event.add('grindless', 'tooltip.grindless.field_prospector.terrain', 'Abre el mapa y activa las vetas. Solo analiza terreno generado; explora más y vuelve a escanear.')
  event.add('grindless', 'message.grindless.field_prospector.result', 'Se han analizado %s vetas a un máximo de 16 chunks (256 bloques en X y Z). Abre el mapa y activa las vetas. El terreno sin generar no se analiza.')
  event.add('grindless', 'message.grindless.field_prospector.no_data', 'No hay datos de vetas a un máximo de 16 chunks (256 bloques en X y Z). Explora más y vuelve a escanear; esto no significa que no haya minerales.')
  event.add('grindless', 'message.grindless.field_prospector.error', 'El escaneo ha fallado. Consulta el error en el registro de KubeJS del servidor.')
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
