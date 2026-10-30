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

ClientEvents.lang('es_es', function (event) {
  var entries = {
    'block.gtceu.cryobot': 'Criobot',
    'block.gtceu.algae_bioreactor': 'Biorreactor de algas',
    'gtceu.bioreactor': 'Biorreactor',
    'material.gtceu.magnesium_sulfate': 'Sulfato de magnesio',
    'grindless.machine.cryobot.tooltip.0': '§7Atraviesa el hielo de Europa y perfora su océano.',
    'grindless.machine.cryobot.no_voiding': 'El criobot conserva la muestra del océano y la salmuera. Desactiva el descarte de objetos y fluidos.',
    'grindless.machine.algae_bioreactor.tooltip.0': '§7Cultiva algas y bacterias bajo lámparas LED.',
    'grindless.machine.algae_bioreactor.no_voiding': 'El biorreactor conserva la única materia viva del pack. Desactiva el descarte de objetos y fluidos.'
  }
  Object.keys(entries).forEach(function (key) { event.add('grindless', key, entries[key]) })
})
