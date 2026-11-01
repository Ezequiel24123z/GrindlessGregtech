// priority: 5500
// Gregtech Grindless - Steam era: names and tooltips of the Horizon Collector, its recipe type and the Horizon Shard
// (startup_scripts/grindless/steam/horizon_collector.js; package STEAM-X1).
(function () {
  ClientEvents.lang('en_us', function (event) {
    event.add('gtceu', 'block.gtceu.lv_horizon_collector', 'Horizon Collector')
    event.add('gtceu', 'gtceu.horizon_collection', 'Horizon Collection')

    event.add('grindless', 'grindless.machine.horizon_collector.tooltip.0',
      'Nobody built it, and nobody can make another. It was in your pack when you arrived.')
    event.add('grindless', 'grindless.machine.horizon_collector.tooltip.1',
      'Horizon Shard (never used up) + a programmed circuit: the circuit picks what comes through, several stacks every 8 seconds.')
    event.add('grindless', 'grindless.machine.horizon_collector.tooltip.2',
      'A solar panel cover on its top face runs it by day. At night it waits.')

    event.add('grindless', 'item.grindless.horizon_shard', 'Horizon Shard')
    event.add('grindless', 'tooltip.grindless.horizon_shard', 'It hums at a pitch you feel more than hear.')
    event.add('grindless', 'tooltip.grindless.horizon_shard.use', 'Put it in the Horizon Collector. It is never used up and cannot be made.')
  })

})()
