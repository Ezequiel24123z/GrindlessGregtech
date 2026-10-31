// priority: 6587
// Gregtech Grindless - text of the MAX parallel hatch (package MAX-M1; startup_scripts/grindless/lib/parallel_hatch.js and
// server_scripts/grindless/max/parallel.js).
//
//   block.gtceu.max_parallel_hatch                 its name
//   grindless.machine.max_parallel_hatch.tooltip   its tooltip line
//   emi.grindless.info.max_parallel_hatch.0        its EMI info page
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.max_parallel_hatch', 'Maximum Parallel Control Hatch')
    add('grindless.machine.max_parallel_hatch.tooltip', 'Allows up to §f1048576§7 recipes to be processed at once. Each copy costs the recipe\'s own EU/t.')
    add('emi.grindless.info.max_parallel_hatch.0', 'The Maximum Parallel Control Hatch lets a machine that takes parallel hatches run up to 1048576 copies of a recipe at once, each at its own EU/t. It is made in the Assembly Line from the Overpowered hatch, a MAX hull, field generators, robot arms and MAX circuits, cooled with superfluid helium-3.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.max_parallel_hatch', 'Escotilla de control paralelo máxima')
    add('grindless.machine.max_parallel_hatch.tooltip', 'Permite procesar hasta §f1048576§7 recetas a la vez. Cada copia cuesta el EU/t de la receta.')
    add('emi.grindless.info.max_parallel_hatch.0', 'La escotilla de control paralelo máxima deja que una máquina que acepta escotillas de paralelos ejecute hasta 1048576 copias de una receta a la vez, cada una con su EU/t. Se fabrica en la línea de ensamblaje a partir de la escotilla desmedida, un casco MAX, generadores de campo, brazos robóticos y circuitos MAX, enfriada con helio-3 superfluido.')
})
