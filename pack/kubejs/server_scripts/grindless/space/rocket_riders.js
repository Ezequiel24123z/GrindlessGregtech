// -----------------------------------------------------------------------------------------------
// GCYR rockets (GCYR 0.2.9) must not burn the people riding them.
//
// While a rocket climbs, RocketEntity.burnEntities sets every living entity in a box under the rocket on fire for 15 s, unless it
// has fire resistance or heat-resistant armour (the gcyr:heat_resistant tag is empty in 0.2.9, so no space suit counts). The rider
// sits above that box, but the rocket's movement belongs to the rider's client: the server moves the rocket to where the client
// says (vanilla handleMoveVehicle) and puts the rider back on its seat only after the rocket's next tick. A client a tick ahead
// lifts the rocket by up to 5 blocks, the rider is inside the box for that tick and burns. Seen in game leaving the Moon
// (tools/test/overlay/kubejs/server_scripts/gg_test_gcyr_flight.js): 19 fire hits, 19 of the player's 20 health points, on top of
// the Moon's vacuum.
//
// The pack gives whoever rides a rocket a short fire resistance without particles, renewed while seated, and puts out a rider that
// is already burning. People standing under a launching rocket still burn.
(function () {
  var RocketEntity = Java.loadClass('argent_matter.gcyr.common.entity.RocketEntity')
  var MobEffects = Java.loadClass('net.minecraft.world.effect.MobEffects')
  var PERIOD = 10
  var DURATION = 40

  ServerEvents.tick(function (event) {
    var server = event.server
    if (server.getTickCount() % PERIOD !== 0) return
    var players = server.getPlayers()
    for (var i = 0; i < players.size(); i++) {
      var player = players.get(i)
      try {
        var vehicle = player.getVehicle()
        if (vehicle === null || vehicle === undefined || !(vehicle instanceof RocketEntity)) continue
        player.getPotionEffects().add(MobEffects.FIRE_RESISTANCE, DURATION, 0, false, false)
        if (player.getRemainingFireTicks() > 0) player.extinguish()
      } catch (e) {
        console.error('[grindless space] rocket rider ' + player + ': ' + e)
      }
    }
  })
})()
