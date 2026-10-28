// Gregtech Grindless - names and tooltips of the IV Smelting Complex (startup_scripts/grindless/iv/mega_smelting_complex.js).
//
//   gtceu:smelting_complex / gtceu.smelting_complex   (machine name + 3 tooltip lines, recipe type name; en_us and es_es)
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.smelting_complex', 'Smelting Complex')
    add('gtceu.smelting_complex', 'Smelting Complex')
    add('grindless.machine.smelting_complex.tooltip.0', 'A blast furnace and a vacuum freezer in one hall: a coil chamber for the heat, a cold chamber for the cooling, a tungstensteel bulkhead between them. One recipe per blast furnace recipe that makes a hot ingot, with the freezer step folded in: dusts and gas in, the cooled ingot, the byproducts and the coolant\'s return gas out.')
    add('grindless.machine.smelting_complex.tooltip.1', 'The coils set the parallels (2^(coil temperature / 900), up to 64) and GTM\'s blast furnace rule: a recipe whose temperature is above the coils\' (plus 100 K per voltage tier above MV) does not run. Each copy pays the full energy of both steps, so the hatches also bound the parallels. Batch mode is on.')
    add('grindless.machine.smelting_complex.tooltip.2', 'Needs, in any front-wall cell: 1 maintenance hatch, 1 muffler, 1 or 2 energy hatches, up to 2 input buses, 2 output buses, 4 input hatches and 4 output hatches (gases, coolant in, its return gas out); at least 64 heatproof casings there. 32 heating coils in two rings.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.smelting_complex', 'Complejo de Fundición')
    add('gtceu.smelting_complex', 'Complejo de Fundición')
    add('grindless.machine.smelting_complex.tooltip.0', 'Un horno de alta temperatura y un congelador de vacío en una nave: una cámara de bobinas para el calor, una cámara fría para el enfriado y un mamparo de acero de tungsteno entre ambas. Una receta por cada receta del horno que da un lingote caliente, con el paso del congelador incluido: polvos y gas de entrada, el lingote enfriado, los subproductos y el gas de retorno del refrigerante como salidas.')
    add('grindless.machine.smelting_complex.tooltip.1', 'Las bobinas fijan los paralelos (2^(temperatura de la bobina / 900), hasta 64) y la regla del horno de GTM: una receta cuya temperatura supera la de las bobinas (más 100 K por tier de voltaje sobre MV) no corre. Cada copia paga la energía completa de los dos pasos, así que los hatches también limitan los paralelos. El modo por lotes está activo.')
    add('grindless.machine.smelting_complex.tooltip.2', 'Necesita, en cualquier celda de la pared frontal: 1 hatch de mantenimiento, 1 silenciador, 1 o 2 hatches de energía, hasta 2 buses de entrada, 2 de salida, 4 hatches de entrada y 4 de salida (gases, refrigerante de entrada, su gas de retorno de salida); al menos 64 carcasas termorresistentes allí. 32 bobinas calefactoras en dos anillos.')
})
