// priority: 5900
// Gregtech Grindless - names and tooltips of the LV Generator Array, plus the controller lines that every generator multiblock built
// with startup_scripts/grindless/lib/generators.js shows (grindless.generators.*).
//
//   gtceu:generator_array   (machine name + tooltips)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.generator_array', 'Generator Array')

    add('grindless.machine.generator_array.tooltip.0', 'Up to 16 generators in one hall: steam turbine, combustion generator or gas turbine (switch the machine mode in the controller). It runs the single blocks\' own fuel recipes side by side: the same EU per unit of fuel, no overclock, no bonus.')
    add('grindless.machine.generator_array.tooltip.1', 'Generators running = the fewest of 16, the fuel in the input hatches, and what the dynamo hatches carry (every LV fuel is 32 EU/t per generator; a dynamo hatch carries 2 amps: an LV one 2 generators, an MV one 8, an HV one all 16). It pauses, losing nothing, while the dynamo hatches are full.')
    add('grindless.machine.generator_array.tooltip.2', 'Steam mode gives back 4 mB of distilled water per 640 mB of steam: put a fluid output hatch in the floor for it, or set the controller to void fluids.')
    add('grindless.machine.generator_array.tooltip.3', 'Needs, in the floor: 1 to 16 dynamo hatches (any tier), 1 or 2 fluid input hatches (the fuel) and 0 or 1 fluid output hatch. The front holds 16 steel gearboxes, the generator units.')

    add('grindless.generators.capacity', 'Dynamo hatches carry up to %s EU/t')
    add('grindless.generators.output', 'Producing %s EU/t: %s runs in parallel (up to %s)')
    add('grindless.generators.dynamo_too_small', 'The dynamo hatches cannot carry even one run of this fuel')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.generator_array', 'Matriz de generadores')

    add('grindless.machine.generator_array.tooltip.0', 'Hasta 16 generadores en una nave: turbina de vapor, generador de combustión o turbina de gas (el modo de máquina se cambia en el controlador). Corre las mismas recetas de combustible que las máquinas de un bloque, una junto a otra: los mismos EU por unidad de combustible, sin overclock ni bonificación.')
    add('grindless.machine.generator_array.tooltip.1', 'Generadores en marcha = el menor de 16, el combustible de las escotillas de entrada y lo que llevan las escotillas dinamo (cada combustible LV da 32 EU/t por generador; una escotilla dinamo lleva 2 amperios: una LV 2 generadores, una MV 8 y una HV los 16). Se detiene, sin perder nada, mientras las escotillas dinamo están llenas.')
    add('grindless.machine.generator_array.tooltip.2', 'El modo vapor devuelve 4 mB de agua destilada por cada 640 mB de vapor: pon una escotilla de salida de fluidos en el suelo, o ajusta el controlador para que tire los fluidos.')
    add('grindless.machine.generator_array.tooltip.3', 'Necesita, en el suelo: de 1 a 16 escotillas dinamo (de cualquier nivel), 1 o 2 escotillas de entrada de fluidos (el combustible) y 0 o 1 escotilla de salida de fluidos. El frente lleva 16 cajas de engranajes de acero, los generadores.')

    add('grindless.generators.capacity', 'Las escotillas dinamo llevan hasta %s EU/t')
    add('grindless.generators.output', 'Produciendo %s EU/t: %s ciclos en paralelo (hasta %s)')
    add('grindless.generators.dynamo_too_small', 'Las escotillas dinamo no pueden llevar ni un ciclo de este combustible')
})
