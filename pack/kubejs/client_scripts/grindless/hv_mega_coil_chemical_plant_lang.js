// Gregtech Grindless - names and tooltips of the HV Coil Chemical Plant (startup_scripts/grindless/hv/mega_coil_chemical_plant.js).
//
//   gtceu:coil_chemical_plant   (machine name + 3 tooltip lines, en_us and es_es)
//
// It runs GTM's large chemical reactor recipes, so the recipe type name (gtceu.large_chemical_reactor) is GTM's own, already translated.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.coil_chemical_plant', 'Coil Chemical Plant')
    add('grindless.machine.coil_chemical_plant.tooltip.0', 'A large chemical reactor that grows with its heating coil: it runs every large chemical reactor recipe (and so every chemical reactor recipe) with 2^(coil temperature / 900 K) copies at once, up to 64: Cupronickel 4, Kanthal 8, Nichrome 16, RTM alloy 32, HSS-G 64.')
    add('grindless.machine.coil_chemical_plant.tooltip.1', 'Each copy pays its full EU/t, so the energy hatches set how many run: floor(hatch voltage / recipe EU/t). Every coil step above Cupronickel cuts the energy by 5% (down to 80%), spare voltage gives perfect overclocks, and batch mode is on.')
    add('grindless.machine.coil_chemical_plant.tooltip.2', 'Needs: 1 maintenance hatch, 1 or 2 energy hatches, up to 4 fluid input and 4 fluid output hatches, up to 2 input buses and 2 output buses in any casing cell; at least 131 PTFE inert casings, 5 PTFE pipe casings down the core, 2 full rings of 8 heating coils of one type and tempered glass windows.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.coil_chemical_plant', 'Planta Química de Bobinas')
    add('grindless.machine.coil_chemical_plant.tooltip.0', 'Un reactor químico grande que crece con su bobina calefactora: ejecuta todas las recetas del reactor químico grande (y por tanto las del reactor químico) con 2^(temperatura de la bobina / 900 K) copias a la vez, hasta 64: Cuproníquel 4, Kanthal 8, Nicrom 16, aleación RTM 32, HSS-G 64.')
    add('grindless.machine.coil_chemical_plant.tooltip.1', 'Cada copia paga su EU/t completo, así que los hatches de energía fijan cuántas corren: floor(voltaje del hatch / EU/t de la receta). Cada nivel de bobina sobre el Cuproníquel recorta la energía un 5% (hasta el 80%), el voltaje sobrante da sobrecargas perfectas y el modo por lotes está activo.')
    add('grindless.machine.coil_chemical_plant.tooltip.2', 'Necesita: 1 hatch de mantenimiento, 1 o 2 hatches de energía, hasta 4 hatches de fluido de entrada y 4 de salida, hasta 2 buses de entrada y 2 de salida en cualquier celda de carcasa; al menos 131 carcasas inertes de PTFE, 5 carcasas de tubería de PTFE por el núcleo, 2 anillos completos de 8 bobinas calefactoras del mismo tipo y ventanas de vidrio templado.')
})
