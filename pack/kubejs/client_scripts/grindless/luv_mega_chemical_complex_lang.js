// priority: 7350
// Gregtech Grindless - names and tooltips of the LuV Mega Chemical Complex (startup_scripts/grindless/luv/mega_chemical_complex.js).
//
//   gtceu:mega_chemical_complex   (machine name + 4 tooltip lines, en_us and es_es)
//   gtceu:mega_chemical_complex   (the recipe type name, the second mode)
//
// The first mode runs GTM's large chemical reactor recipes, so gtceu.large_chemical_reactor is GTM's own, already translated.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.mega_chemical_complex', 'Mega Chemical Complex')
    add('gtceu.mega_chemical_complex', 'Mega Chemical Complex')
    add('grindless.machine.mega_chemical_complex.tooltip.0', 'The massive large chemical reactor, with two modes picked in the controller: every large chemical reactor and chemical reactor recipe, or its own long chemical lines (PTFE, epoxy, para-aramid) made in one step from the live recipes: the same inputs, every byproduct as an output, and the energy of all the stages added up.')
    add('grindless.machine.mega_chemical_complex.tooltip.1', 'Copies at once: 2^(coil temperature / 900 K) times the parallel hatch, with no cap (HSS-G coil 64 x LuV hatch 16 = 1024; Naquadah coil 256 x ZPM hatch 64 = 16384). Each copy pays its full EU/t, so the energy hatches set how many run: floor(hatch voltage / recipe EU/t).')
    add('grindless.machine.mega_chemical_complex.tooltip.2', 'Every coil step above Cupronickel cuts the energy by 5% (down to 80%), spare voltage gives perfect overclocks, and batch mode is on.')
    add('grindless.machine.mega_chemical_complex.tooltip.3', 'Needs, in a 15 x 15 x 15 shell of PTFE inert casings with HSS-S frames on the edges: 4 rings of 32 heating coils of one type, a column of PTFE pipe casings, laminated glass in the side walls; in any casing cell 1 maintenance hatch, 1 or 2 energy hatches, 1 parallel hatch, up to 2 input and 2 output buses, up to 8 fluid input and 6 fluid output hatches.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.mega_chemical_complex', 'Complejo Químico Mega')
    add('gtceu.mega_chemical_complex', 'Complejo Químico Mega')
    add('grindless.machine.mega_chemical_complex.tooltip.0', 'El reactor químico grande masivo, con dos modos que se eligen en el controlador: todas las recetas del reactor químico grande y del reactor químico, o sus propias líneas químicas largas (PTFE, epoxi, para-aramida) hechas en un solo paso a partir de las recetas reales: las mismas entradas, cada subproducto como salida y la energía de todas las etapas sumada.')
    add('grindless.machine.mega_chemical_complex.tooltip.1', 'Copias a la vez: 2^(temperatura de la bobina / 900 K) por la escotilla de paralelos, sin tope (bobina HSS-G 64 x escotilla LuV 16 = 1024; bobina de Naquadah 256 x escotilla ZPM 64 = 16384). Cada copia paga su EU/t completo, así que las escotillas de energía fijan cuántas corren: floor(voltaje de la escotilla / EU/t de la receta).')
    add('grindless.machine.mega_chemical_complex.tooltip.2', 'Cada nivel de bobina sobre el Cuproníquel recorta la energía un 5% (hasta el 80%), el voltaje sobrante da sobrecargas perfectas y el modo por lotes está activo.')
    add('grindless.machine.mega_chemical_complex.tooltip.3', 'Necesita, en una carcasa de 15 x 15 x 15 de carcasas inertes de PTFE con marcos de HSS-S en las aristas: 4 anillos de 32 bobinas calefactoras del mismo tipo, una columna de carcasas de tubería de PTFE, vidrio laminado en las paredes laterales; en cualquier celda de carcasa 1 escotilla de mantenimiento, 1 o 2 escotillas de energía, 1 escotilla de paralelos, hasta 2 buses de entrada y 2 de salida, hasta 8 escotillas de entrada de fluidos y 6 de salida.')
})
