// Gregtech Grindless - names and tooltips of the Leisure utility machines (startup_scripts/grindless/mv/leisure_utility.js).
//
//   gtceu:advanced_multi_smelter, gtceu:lava_furnace, gtceu:weather_controller   (machine names + tooltips + their messages)
//   gtceu:weather_control                                                       (recipe type name)
//   wildcard_pattern:wildcard_pattern                                           (Spanish name only: the mod ships its English one)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.advanced_multi_smelter', 'Advanced Multi Smelter')
    add('grindless.machine.advanced_multi_smelter.tooltip.0', 'Smelts different items in the same run: every kind of smeltable item in its input buses with the same cooking time joins the batch, up to its parallel limit.')
    add('grindless.machine.advanced_multi_smelter.tooltip.1', 'Parallels double for every 900 K of coil temperature: 4 with cupronickel, 8 kanthal, 16 nichrome, 32 RTM alloy, 64 from HSS-G on. Never more than 64.')
    add('grindless.machine.advanced_multi_smelter.tooltip.2', 'Each parallel costs one electric furnace (the recipe\'s own EU/t and time), then GTM\'s overclock. For a single item in bulk, GTM\'s HV Multi Smelter is faster.')
    add('grindless.machine.advanced_multi_smelter.tooltip.3', 'Needs: 1 or 2 energy hatches, 1 to 4 input buses and 1 to 4 output buses in the heatproof shell, and 12 heating coils of one type.')
    add('grindless.machine.advanced_multi_smelter.parallels', 'Parallels: %s (coils at %s K)')

    add('block.gtceu.lava_furnace', 'Lava Furnace')
    add('grindless.machine.lava_furnace.tooltip.0', 'A furnace heated by lava instead of electricity: it has no energy hatch. Smelts any furnace recipe, up to 8 items at once, mixed kinds of the same cooking time in the same run.')
    add('grindless.machine.lava_furnace.tooltip.1', 'Every item takes 10 mB of lava, the heat a vanilla furnace gets from a bucket (100 items). The lava comes in through a fluid input hatch in the hearth floor.')
    add('grindless.machine.lava_furnace.tooltip.2', 'It never makes lava: burned in a large boiler, lava is worth far more than melting stone would cost. This is the compact way to smelt with lava pumped from the Nether. Lava heat needs no air.')
    add('grindless.machine.lava_furnace.tooltip.3', 'Needs: 1 fluid input hatch in the hearth of steel fireboxes, and 1 or 2 input buses and 1 or 2 output buses in the steel chamber.')
    add('grindless.machine.lava_furnace.no_lava', 'Not enough lava in the hearth')

    add('block.gtceu.weather_controller', 'Weather Controller')
    add('gtceu.weather_control', 'Weather Control')
    add('grindless.machine.weather_controller.tooltip.0', 'Seeds the clouds from the ground. Circuit 1: a clear sky for a whole day (calcium chloride rains the clouds out upwind). Circuit 2: rain for half a day (salt). Circuit 3: a thunderstorm for 5 minutes (salt, and copper wire for rocket-triggered lightning).')
    add('grindless.machine.weather_controller.tooltip.1', 'The weather changes when the run ends. Earth only: the other worlds take their weather from it or have none. While the same weather still has more than half of its time left, it waits instead of seeding again.')
    add('grindless.machine.weather_controller.tooltip.2', 'Clear nights for the observatories and dry days for the heliostat tower, without waiting for the sky.')
    add('grindless.machine.weather_controller.tooltip.3', 'Needs: 1 or 2 energy hatches and 1 input bus in the 3x3 base, four steel frame struts, a launch tube of 4 steel pipe casings and a lightning rod on top.')
    add('grindless.machine.weather_controller.already_set', 'That weather is already set')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.advanced_multi_smelter', 'Multihorno avanzado')
    add('grindless.machine.advanced_multi_smelter.tooltip.0', 'Funde objetos distintos en el mismo ciclo: todo lo fundible que haya en sus buses de entrada con el mismo tiempo de cocción entra en la tanda, hasta su límite de paralelos.')
    add('grindless.machine.advanced_multi_smelter.tooltip.1', 'Los paralelos se doblan por cada 900 K de temperatura de las bobinas: 4 con cuproníquel, 8 con kanthal, 16 con nicromo, 32 con aleación RTM y 64 desde HSS-G. Nunca más de 64.')
    add('grindless.machine.advanced_multi_smelter.tooltip.2', 'Cada paralelo cuesta lo que un horno eléctrico (los EU/t y el tiempo de la receta), y después el overclock de GTM. Para un solo objeto en grandes cantidades, el multihorno HV de GTM es más rápido.')
    add('grindless.machine.advanced_multi_smelter.tooltip.3', 'Necesita: 1 o 2 escotillas de energía, de 1 a 4 buses de entrada y de 1 a 4 buses de salida en la carcasa termorresistente, y 12 bobinas de calentamiento del mismo tipo.')
    add('grindless.machine.advanced_multi_smelter.parallels', 'Paralelos: %s (bobinas a %s K)')

    add('block.gtceu.lava_furnace', 'Horno de lava')
    add('grindless.machine.lava_furnace.tooltip.0', 'Un horno que se calienta con lava en vez de electricidad: no lleva escotilla de energía. Funde cualquier receta de horno, hasta 8 objetos a la vez, de distintos tipos con el mismo tiempo de cocción en el mismo ciclo.')
    add('grindless.machine.lava_furnace.tooltip.1', 'Cada objeto gasta 10 mB de lava, el calor que un horno normal saca de un cubo (100 objetos). La lava entra por una escotilla de entrada de fluidos en el suelo del hogar.')
    add('grindless.machine.lava_furnace.tooltip.2', 'Nunca fabrica lava: quemada en una caldera grande, la lava vale mucho más de lo que costaría fundir piedra. Es la forma compacta de fundir con lava bombeada del Nether. El calor de la lava no necesita aire.')
    add('grindless.machine.lava_furnace.tooltip.3', 'Necesita: 1 escotilla de entrada de fluidos en el hogar de cajas de fuego de acero, y 1 o 2 buses de entrada y 1 o 2 buses de salida en la cámara de acero.')
    add('grindless.machine.lava_furnace.no_lava', 'No hay lava suficiente en el hogar')

    add('block.gtceu.weather_controller', 'Controlador del clima')
    add('gtceu.weather_control', 'Control del clima')
    add('grindless.machine.weather_controller.tooltip.0', 'Siembra las nubes desde el suelo. Circuito 1: cielo despejado durante un día entero (el cloruro de calcio hace llover las nubes antes de que lleguen). Circuito 2: lluvia durante medio día (sal). Circuito 3: tormenta eléctrica durante 5 minutos (sal, e hilo de cobre para provocar los rayos con cohetes).')
    add('grindless.machine.weather_controller.tooltip.1', 'El clima cambia al terminar el ciclo. Solo en la Tierra: los demás mundos toman el clima de ella o no tienen. Mientras al mismo clima le quede más de la mitad de su tiempo, espera en vez de volver a sembrar.')
    add('grindless.machine.weather_controller.tooltip.2', 'Noches despejadas para los observatorios y días secos para la torre de helióstatos, sin esperar al cielo.')
    add('grindless.machine.weather_controller.tooltip.3', 'Necesita: 1 o 2 escotillas de energía y 1 bus de entrada en la base de 3x3, cuatro puntales de marco de acero, un tubo de lanzamiento de 4 carcasas de tubería de acero y un pararrayos arriba.')
    add('grindless.machine.weather_controller.already_set', 'Ese clima ya está puesto')

    add('item.wildcard_pattern.wildcard_pattern', 'Patrón comodín')
})
