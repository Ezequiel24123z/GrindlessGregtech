// priority: 3337
// Gregtech Grindless - text of the UIV parallel hatch (package UIV-M1; startup_scripts/grindless/lib/parallel_hatch.js and
// server_scripts/grindless/uiv/parallel_hatch.js).
//
//   block.gtceu.uiv_parallel_hatch                 its name
//   grindless.machine.uiv_parallel_hatch.tooltip   its tooltip line
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.uiv_parallel_hatch', 'Insane Parallel Control Hatch')
    add('grindless.machine.uiv_parallel_hatch.tooltip', 'Allows up to §f16384§7 recipes to be processed at once. Each copy costs the recipe\'s own EU/t.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.uiv_parallel_hatch', 'Escotilla de control paralelo demencial')
    add('grindless.machine.uiv_parallel_hatch.tooltip', 'Permite procesar hasta §f16384§7 recetas a la vez. Cada copia cuesta el EU/t de la receta.')
})
