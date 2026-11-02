// priority: 5250
// Tooltip line for the chestplates that grant creative flight (server_scripts/grindless/integration/suit_flight.js; costs must match).
ItemEvents.tooltip(function (event) {
  var line = function (id, eut) {
    event.add(id, Text.aqua('Creative flight while charged: ' + eut + ' EU/t, only while flying'))
  }
  line('gtceu:nanomuscle_chestplate', 175)
  line('gtceu:advanced_nanomuscle_chestplate', 175)
  line('gtceu:quarktech_chestplate', '2,500')
  line('gtceu:advanced_quarktech_chestplate', '2,500')
})
