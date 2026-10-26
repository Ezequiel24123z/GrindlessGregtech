// GTM 7.5.3's saved vein cache and prospecting packet, without its block-scanning GUI.
// The GUI forces chunk generation and cannot fit a 16-chunk radius. See docs/quests.md.
;(function () {
  var ServerCache = Java.loadClass('com.gregtechceu.gtceu.integration.map.cache.server.ServerCache')
  var GTRegistries = Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
  var RADIUS_BLOCKS = 256

  ItemEvents.rightClicked('gtceu:prospector.hv', function (event) {
    var tag = event.item.getNbt()
    if (tag === null || !tag.getBoolean('grindless_starter_prospector')) return
    var player = event.player
    if (player.getCooldowns().isOnCooldown(event.item.getItem())) event.cancel()
    try {
      player.getCooldowns().addCooldown(event.item.getItem(), 10)
      var level = player.getLevel()
      var dimension = level.getDimensionKey()
      var position = player.blockPosition()
      var veins = ServerCache.instance.getNearbyVeins(dimension, position, RADIUS_BLOCKS)
      var deposits = {}
      // Use GTM's public discovery API; KubeJS deliberately blocks direct network classes.
      veins.forEach(function (vein) {
        var deposit = String(GTRegistries.ORE_VEINS.getKey(vein.definition()))
        if (deposits[deposit]) return
        deposits[deposit] = true
        ServerCache.instance.prospectByDepositName(dimension, deposit, position, player, RADIUS_BLOCKS)
      })
      player.tell(veins.isEmpty()
        ? Text.translate('message.grindless.field_prospector.no_data')
        : Text.translate('message.grindless.field_prospector.result', String(veins.size())))
    } catch (e) {
      console.error('[grindless starter prospector] ' + e)
      player.tell(Text.translate('message.grindless.field_prospector.error'))
    }
    // KubeJS cancel() throws to end the handler; it must come after the scan and outside the catch.
    event.cancel()
  })
})()
