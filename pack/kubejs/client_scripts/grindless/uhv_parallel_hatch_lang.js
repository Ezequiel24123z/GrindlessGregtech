// priority: 9000
// Gregtech Grindless - text of the UHV parallel hatch (package MEGA-0b; startup_scripts/grindless/lib/parallel_hatch.js and
// server_scripts/grindless/uhv/parallel_hatch.js).
//
//   block.gtceu.uhv_parallel_hatch                 its name (the static check wants it in both languages)
//   grindless.machine.uhv_parallel_hatch.tooltip   its tooltip line, as GTM's own hatches have one
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.uhv_parallel_hatch', 'Hyper Parallel Control Hatch')
    add('grindless.machine.uhv_parallel_hatch.tooltip', 'Allows up to §f1024§7 recipes to be processed at once. Each copy costs the recipe\'s own EU/t.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.uhv_parallel_hatch', 'Escotilla de control paralelo hiper')
    add('grindless.machine.uhv_parallel_hatch.tooltip', 'Permite procesar hasta §f1024§7 recetas a la vez. Cada copia cuesta el EU/t de la receta.')
})
