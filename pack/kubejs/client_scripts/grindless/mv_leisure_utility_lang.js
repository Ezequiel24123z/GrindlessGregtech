// priority: 6200
// Gregtech Grindless - names and tooltips of the Leisure utility machines (startup_scripts/grindless/mv/leisure_utility.js).
//
//   gtceu:advanced_multi_smelter, gtceu:lava_furnace, gtceu:weather_controller   (machine names + tooltips + their messages)
//   gtceu:weather_control                                                       (recipe type name)
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

