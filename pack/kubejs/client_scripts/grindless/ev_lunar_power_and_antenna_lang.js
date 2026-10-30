// priority: 10500
// Gregtech Grindless - names and tooltips of the EV Moon base's family steps (startup_scripts/grindless/ev/lunar_power_and_antenna.js):
//
//   gtceu:lunar_solar_array, gtceu:deep_space_antenna             (machine names, tooltips and the array's controller lines)
//   gtceu:lunar_solar, gtceu:deep_space_tracking                  (recipe types)
//   gtceu.recipe.grindless_sky.<lunar_day|martian_day|deep_space> (the EMI line of each recipe, the observatories' key)
//
// The array's panels are the EV Tripod Drill's Solar Wing Panels (named in ev_tripod_lang.js).
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts: Minecraft merges lang entries from every
// namespace/script. Quests are English only; names go in en_us and es_es. The lines grindless.generators.* (dynamo capacity, output)
// come from power_generator_array_lang.js, shared by every generator built with lib/generators.js.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.lunar_solar_array', 'Lunar Solar Array')
    add('block.gtceu.deep_space_antenna', 'Deep Space Antenna')
    add('gtceu.lunar_solar', 'Lunar Solar Power')
    add('gtceu.deep_space_tracking', 'Deep Space Tracking')

    add('grindless.machine.lunar_solar_array.tooltip.0', '§7Solar wing panels on the Moon: sunlight straight into EU.')
    add('grindless.machine.lunar_solar_array.no_sky', 'No panel sees the open sky')
    add('grindless.machine.lunar_solar_array.panels', 'Panels under open sky: %s of %s')
    add('grindless.machine.lunar_solar_array.hint', 'Programmed circuit in the input bus: 1 on the Moon, 2 on Mars. Works by day only.')

    add('grindless.machine.deep_space_antenna.tooltip.0', '§7A radio dish that listens to Mars and the deep sky.')

    add('gtceu.recipe.grindless_sky.lunar_day', 'Lunar day, panels under open sky (x1.4 sunlight): %s EU/t per panel, %s panels = %s EU/t')
    add('gtceu.recipe.grindless_sky.martian_day', 'Martian day, panels under open sky (x0.43 sunlight): %s EU/t per panel, %s panels = %s EU/t')
    add('gtceu.recipe.grindless_sky.deep_space', 'Sky: lunar night, on the Moon')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.lunar_solar_array', 'Matriz solar lunar')
    add('block.gtceu.deep_space_antenna', 'Antena de espacio profundo')
    add('gtceu.lunar_solar', 'Energía solar lunar')
    add('gtceu.deep_space_tracking', 'Seguimiento de espacio profundo')

    add('grindless.machine.lunar_solar_array.tooltip.0', '§7Paneles solares en la Luna: de la luz directa a EU.')
    add('grindless.machine.lunar_solar_array.no_sky', 'Ningún panel ve el cielo abierto')
    add('grindless.machine.lunar_solar_array.panels', 'Paneles bajo el cielo abierto: %s de %s')
    add('grindless.machine.lunar_solar_array.hint', 'Circuito programado en el bus de entrada: 1 en la Luna, 2 en Marte. Solo funciona de día.')

    add('grindless.machine.deep_space_antenna.tooltip.0', '§7Antena parabólica que escucha Marte y el cielo profundo.')

    add('gtceu.recipe.grindless_sky.lunar_day', 'Día lunar, paneles bajo el cielo abierto (luz solar x1,4): %s EU/t por panel, %s paneles = %s EU/t')
    add('gtceu.recipe.grindless_sky.martian_day', 'Día marciano, paneles bajo el cielo abierto (luz solar x0,43): %s EU/t por panel, %s paneles = %s EU/t')
    add('gtceu.recipe.grindless_sky.deep_space', 'Cielo: noche lunar, en la Luna')
})
