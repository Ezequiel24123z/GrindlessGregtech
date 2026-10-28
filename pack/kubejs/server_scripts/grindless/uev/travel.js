// priority: -23286
// -----------------------------------------------------------------------------------------------
// UEV travel, server side (package UEV-B1; motors and places: startup_scripts/grindless/uev/travel.js).
// The DFD motors are createCustom blocks: KubeJS gives them no loot table and no tool tag, so both are added here (UHV-A8's ICAN
// does the same). Their recipes are rows 6 and 7 of UV's thruster works (server_scripts/grindless/uv/propulsion.js).
(function () {
  var T = global.grindless.uevTravel || {}
  var MOTORS = [
    (T.motors && T.motors.mk1 ? T.motors.mk1.id : 'grindless:dfd_mk1_motor'),
    (T.motors && T.motors.mk2 ? T.motors.mk2.id : 'grindless:dfd_mk2_motor')
  ]

  ServerEvents.blockLootTables(function (event) {
    MOTORS.forEach(function (id) {
      if (Item.exists(id)) event.addSimpleBlock(id)
    })
  })

  ServerEvents.tags('block', function (event) {
    MOTORS.forEach(function (id) {
      if (Item.exists(id)) event.add('minecraft:mineable/pickaxe', id)
    })
  })
})()
