// priority: 7900
// LuV B8, Europa: the cryobot, the algae bioreactor, the bioreactor type and magnesium sulfate (startup_scripts/grindless/luv/europa.js).
ClientEvents.lang('en_us', function (event) {
  var entries = {
    'block.gtceu.cryobot': 'Cryobot',
    'block.gtceu.algae_bioreactor': 'Algae Bioreactor',
    'gtceu.bioreactor': 'Bioreactor',
    'material.gtceu.magnesium_sulfate': 'Magnesium Sulfate',
    'grindless.machine.cryobot.tooltip.0': '§7Melts through Europa\'s ice and drills its ocean.',
    'grindless.machine.cryobot.no_voiding': 'The cryobot keeps the ocean sample and the brine. Disable item and fluid voiding.',
    'grindless.machine.algae_bioreactor.tooltip.0': '§7Grows algae and bacteria under LED lamps.',
    'grindless.machine.algae_bioreactor.no_voiding': 'The bioreactor keeps the pack\'s only living matter. Disable item and fluid voiding.'
  }
  Object.keys(entries).forEach(function (key) { event.add('grindless', key, entries[key]) })
})

