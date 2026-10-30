// priority: 6200
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
    add('grindless.machine.advanced_multi_smelter.tooltip.0', '§7Smelts different items in the same run, up to 64 at once.')
    add('grindless.machine.advanced_multi_smelter.tooltip.1', 'Coils set the parallels: 4 cupronickel, 64 from HSS-G.')
    add('grindless.machine.advanced_multi_smelter.parallels', 'Parallels: %s (coils at %s K)')

    add('block.gtceu.lava_furnace', 'Lava Furnace')
    add('grindless.machine.lava_furnace.tooltip.0', '§7A furnace heated by lava, with no energy hatch: up to 8 items at once.')
    add('grindless.machine.lava_furnace.no_lava', 'Not enough lava in the hearth')

    add('block.gtceu.weather_controller', 'Weather Controller')
    add('gtceu.weather_control', 'Weather Control')
    add('grindless.machine.weather_controller.tooltip.0', '§7Seeds the clouds: a clear sky, rain or a thunderstorm.')
    add('grindless.machine.weather_controller.tooltip.1', 'Works on Earth only.')
    add('grindless.machine.weather_controller.already_set', 'That weather is already set')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.advanced_multi_smelter', 'Multihorno avanzado')
    add('grindless.machine.advanced_multi_smelter.tooltip.0', '§7Funde objetos distintos en el mismo ciclo, hasta 64 a la vez.')
    add('grindless.machine.advanced_multi_smelter.tooltip.1', 'Paralelos por bobina: 4 cuproníquel, 64 desde HSS-G.')
    add('grindless.machine.advanced_multi_smelter.parallels', 'Paralelos: %s (bobinas a %s K)')

    add('block.gtceu.lava_furnace', 'Horno de lava')
    add('grindless.machine.lava_furnace.tooltip.0', '§7Un horno calentado con lava, sin escotilla de energía: hasta 8 objetos a la vez.')
    add('grindless.machine.lava_furnace.no_lava', 'No hay lava suficiente en el hogar')

    add('block.gtceu.weather_controller', 'Controlador del clima')
    add('gtceu.weather_control', 'Control del clima')
    add('grindless.machine.weather_controller.tooltip.0', '§7Siembra las nubes: cielo despejado, lluvia o tormenta eléctrica.')
    add('grindless.machine.weather_controller.tooltip.1', 'Solo funciona en la Tierra.')
    add('grindless.machine.weather_controller.already_set', 'Ese clima ya está puesto')

    add('item.wildcard_pattern.wildcard_pattern', 'Patrón comodín')
})
