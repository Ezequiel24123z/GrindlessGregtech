// priority: 4925
// Gregtech Grindless - text of the UEV parallel hatch (package UEV-M1; startup_scripts/grindless/lib/parallel_hatch.js and
// server_scripts/grindless/uev/parallel_hatch.js).
//
//   block.gtceu.uev_parallel_hatch                 its name
//   grindless.machine.uev_parallel_hatch.tooltip   its tooltip line
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.uev_parallel_hatch', 'Ultimate Parallel Control Hatch')
    add('grindless.machine.uev_parallel_hatch.tooltip', 'Allows up to §f4096§7 recipes to be processed at once. Each copy costs the recipe\'s own EU/t.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.uev_parallel_hatch', 'Escotilla de control paralelo definitiva')
    add('grindless.machine.uev_parallel_hatch.tooltip', 'Permite procesar hasta §f4096§7 recetas a la vez. Cada copia cuesta el EU/t de la receta.')
})
