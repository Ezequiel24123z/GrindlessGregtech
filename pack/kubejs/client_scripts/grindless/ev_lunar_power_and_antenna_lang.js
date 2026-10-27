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

    add('grindless.machine.lunar_solar_array.tooltip.0', '36 Solar Wing Panels on titanium frames over sintered regolith, with a bank of radiators behind. No mirrors, no boiler, no water: sunlight straight into EU.')
    add('grindless.machine.lunar_solar_array.tooltip.1', 'Works only by day, on the Moon (x1.4 sunlight: 420 EU/t per panel) or on Mars (x0.43: 129 EU/t per panel). Each of its 36 panels with open sky above it adds a run: 15,120 EU/t on the Moon. At night it waits, losing nothing.')
    add('grindless.machine.lunar_solar_array.tooltip.2', 'Put a programmed circuit in the input bus: 1 on the Moon, 2 on Mars. Runs = the fewest of the lit panels and what the dynamo hatches carry (an EV dynamo hatch carries 4,096 EU/t: 9 panels on the Moon).')
    add('grindless.machine.lunar_solar_array.tooltip.3', 'Needs, in the control hut: 1 input bus and 1 to 4 dynamo hatches. At night, use buffers or Earth\'s power through the AE2 bridge.')
    add('grindless.machine.lunar_solar_array.no_sky', 'No panel sees the open sky')
    add('grindless.machine.lunar_solar_array.panels', 'Panels under open sky: %s of %s')
    add('grindless.machine.lunar_solar_array.hint', 'Programmed circuit in the input bus: 1 on the Moon, 2 on Mars. Works by day only.')

    add('grindless.machine.deep_space_antenna.tooltip.0', 'A titanium dish on a sintered regolith pedestal, its feed horn at the focus. From the Moon, far from Earth\'s radio noise, it listens to Mars and the deep sky.')
    add('grindless.machine.deep_space_antenna.tooltip.1', 'Works only on the Moon, at night: the lunar night hides the Sun\'s radio noise. If dawn comes mid-run, it waits and keeps its progress.')
    add('grindless.machine.deep_space_antenna.tooltip.2', 'The only source of the Mars Transfer Chart, and in IV of the Inner Planets Chart and the Lunar VLBI Recording, written onto data sticks and orbs. The chart before each one calibrates the dish and is never used up.')
    add('grindless.machine.deep_space_antenna.tooltip.3', 'Needs, in the control hut: 1 or 2 energy hatches (EV; two run its IV recipe), 1 input bus and 1 output bus.')

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

    add('grindless.machine.lunar_solar_array.tooltip.0', '36 paneles de ala solar sobre marcos de titanio y regolito sinterizado, con una batería de radiadores detrás. Sin espejos, sin caldera y sin agua: la luz del sol pasa directa a EU.')
    add('grindless.machine.lunar_solar_array.tooltip.1', 'Solo funciona de día, en la Luna (luz solar x1,4: 420 EU/t por panel) o en Marte (x0,43: 129 EU/t por panel). Cada uno de sus 36 paneles con el cielo abierto encima suma un ciclo: 15.120 EU/t en la Luna. De noche espera, sin perder nada.')
    add('grindless.machine.lunar_solar_array.tooltip.2', 'Pon un circuito programado en el bus de entrada: 1 en la Luna, 2 en Marte. Ciclos = el menor de los paneles iluminados y lo que llevan las escotillas dinamo (una escotilla dinamo EV lleva 4.096 EU/t: 9 paneles en la Luna).')
    add('grindless.machine.lunar_solar_array.tooltip.3', 'Necesita, en la caseta de control: 1 bus de entrada y de 1 a 4 escotillas dinamo. De noche, usa baterías o la energía de la Tierra a través del puente de AE2.')
    add('grindless.machine.lunar_solar_array.no_sky', 'Ningún panel ve el cielo abierto')
    add('grindless.machine.lunar_solar_array.panels', 'Paneles bajo el cielo abierto: %s de %s')
    add('grindless.machine.lunar_solar_array.hint', 'Circuito programado en el bus de entrada: 1 en la Luna, 2 en Marte. Solo funciona de día.')

    add('grindless.machine.deep_space_antenna.tooltip.0', 'Una antena parabólica de titanio sobre un pedestal de regolito sinterizado, con la bocina en el foco. Desde la Luna, lejos del ruido de radio de la Tierra, escucha a Marte y al cielo profundo.')
    add('grindless.machine.deep_space_antenna.tooltip.1', 'Solo funciona en la Luna y de noche: la noche lunar esconde el ruido de radio del Sol. Si amanece a medio ciclo, espera y no pierde lo hecho.')
    add('grindless.machine.deep_space_antenna.tooltip.2', 'Es lo único que hace la carta de transferencia a Marte y, en IV, la carta de los planetas interiores y la grabación VLBI lunar, en memorias y orbes de datos. La carta anterior a cada una calibra la antena y no se gasta.')
    add('grindless.machine.deep_space_antenna.tooltip.3', 'Necesita, en la caseta de control: 1 o 2 escotillas de energía (EV; con dos hace su receta IV), 1 bus de entrada y 1 bus de salida.')

    add('gtceu.recipe.grindless_sky.lunar_day', 'Día lunar, paneles bajo el cielo abierto (luz solar x1,4): %s EU/t por panel, %s paneles = %s EU/t')
    add('gtceu.recipe.grindless_sky.martian_day', 'Día marciano, paneles bajo el cielo abierto (luz solar x0,43): %s EU/t por panel, %s paneles = %s EU/t')
    add('gtceu.recipe.grindless_sky.deep_space', 'Cielo: noche lunar, en la Luna')
})
