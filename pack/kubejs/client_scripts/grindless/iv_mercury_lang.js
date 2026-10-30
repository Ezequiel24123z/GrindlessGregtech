// priority: 8900
// Gregtech Grindless - names and tooltips of IV on Mercury (startup_scripts/grindless/iv/mercury.js and iv/tungsten_steel_drill_bit.js):
//
//   gtceu:mercury_vein_drill, gtceu:mercury_solar_works, gtceu:mercury_solar_field, gtceu:interferometer   (names, tooltips, lines)
//   gtceu:solar_processing, gtceu:mercury_solar, gtceu:interferometry                                      (recipe types)
//   grindless:tungsten_steel_drill_bit, lunar_vlbi_recording, outer_system_chart, sagittarius_a_star_signal (items)
//   gtceu.recipe.grindless_sun_eut, grindless_sky.<hermean_day|interferometer|vlbi_moon>,
//   grindless_mercury_shift.<day|night>                                                                     (the EMI line of a recipe)
//
// The bricks, the panels, the Mercury vein sample and the Hermean regolith keep their keys in iv_foundation_lang.js. The lines
// grindless.generators.* (dynamo capacity, output) come from power_generator_array_lang.js. Quests are English only; names go in
// en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.mercury_vein_drill', 'Mercury Vein Drill')
    add('block.gtceu.mercury_solar_works', 'Mercury Solar Works')
    add('block.gtceu.mercury_solar_field', 'Mercury Solar Field')
    add('block.gtceu.interferometer', 'Interferometer')
    add('gtceu.solar_processing', 'Solar Processing')
    add('gtceu.mercury_solar', 'Mercury Solar Power')
    add('gtceu.interferometry', 'Interferometry')

    add('grindless.machine.mercury_vein_drill.tooltip.0', '§7Drills Mercury\'s ore veins.')
    add('grindless.machine.mercury_vein_drill.needs_nitrogen', 'Mercury\'s day: the drill only runs with liquid nitrogen in its input hatch (10 mB per bore)')
    add('grindless.machine.mercury_vein_drill.keeps_nitrogen', 'Mercury\'s night: the drill drills dry and keeps the liquid nitrogen for the day')
    add('grindless.machine.mercury_vein_drill.shift.day', 'Mercury\'s day: drilling with liquid nitrogen (%s mB in the hatch, 10 mB per bore)')
    add('grindless.machine.mercury_vein_drill.shift.night', 'Mercury\'s night: drilling dry, the bit wears twice as fast (%s mB of liquid nitrogen kept)')

    add('grindless.machine.mercury_solar_works.tooltip.0', '§7Heliostat workshop that processes materials with solar heat.')
    add('grindless.machine.mercury_solar_works.no_voiding', 'The solar works keeps the osmium tetroxide and the steam: they leave through its output hatches. Turn fluid voiding off')
    add('grindless.machine.mercury_solar_works.sun.sun', 'Sun on the receiver: the next run pays a quarter of its EU/t')
    add('grindless.machine.mercury_solar_works.sun.night', 'Night: the next run pays its full EU/t')
    add('grindless.machine.mercury_solar_works.sun.shaded', 'Shaded (%s of the receiver and the 8 mirrors without open sky): the next run pays its full EU/t')

    add('grindless.machine.mercury_solar_field.tooltip.0', '§7Mercury thin-film panels: sunlight straight into EU.')
    add('grindless.machine.mercury_solar_field.no_sky', 'No panel sees the open sky')
    add('grindless.machine.mercury_solar_field.panels', 'Panels under open sky: %s of %s')
    add('grindless.machine.mercury_solar_field.hint', 'Programmed circuit 1 in the input bus. Works by day only, on Mercury.')

    add('grindless.machine.interferometer.tooltip.0', '§7A radio interferometer on Mercury, working at night.')

    add('item.grindless.tungsten_steel_drill_bit', 'Tungsten Steel Drill Bit')
    add('tooltip.grindless.tungsten_steel_drill_bit.0', 'The bit of the IV vein drills, turned on an IV lathe from a long tungsten steel rod.')
    add('tooltip.grindless.tungsten_steel_drill_bit.1', 'One per bore, worn out by chance. In the Mercury Vein Drill: about 0.25% of the runs by day (with liquid nitrogen), 0.5% at night (dry).')
    add('item.grindless.lunar_vlbi_recording', 'Lunar VLBI Recording')
    add('tooltip.grindless.lunar_vlbi_recording.0', 'A data orb with the Moon\'s half of a very-long-baseline observation: the radio sky, timed to the nanosecond.')
    add('tooltip.grindless.lunar_vlbi_recording.1', 'Written by the Deep Space Antenna at night on the Moon, pointed by the Inner Planets Chart. The Interferometer on Mercury adds its half.')
    add('item.grindless.outer_system_chart', 'Outer System Chart')
    add('tooltip.grindless.outer_system_chart.0', 'A data orb with the asteroid belt and the moons of Jupiter, fixed by an interferometer whose baseline runs from the Moon to Mercury.')
    add('tooltip.grindless.outer_system_chart.1', 'The chart of the trip beyond the inner planets. Made by the Interferometer; copy it with a data orb.')
    add('item.grindless.sagittarius_a_star_signal', 'Sagittarius A* Signal')
    add('tooltip.grindless.sagittarius_a_star_signal.0', 'The first radio signal of Sagittarius A*, the black hole at the centre of the galaxy, recorded by the Interferometer.')
    add('tooltip.grindless.sagittarius_a_star_signal.1', 'Radio astronomers first found it this way in 1974. Here it marks where the journey points.')

    add('gtceu.recipe.grindless_sun_eut', 'With the sun on the receiver: %s EU/t (a quarter)')
    add('gtceu.recipe.grindless_sky.hermean_day', 'Mercury\'s day, panels under open sky (x6.7 sunlight): %s EU/t per panel, %s panels = %s EU/t')
    add('gtceu.recipe.grindless_sky.interferometer', 'Sky: night on Mercury. The other half: the Deep Space Antenna, at night on the Moon')
    add('gtceu.recipe.grindless_sky.vlbi_moon', 'Sky: lunar night, on the Moon. The Interferometer adds Mercury\'s half')
    add('gtceu.recipe.grindless_mercury_shift.day', 'Mercury\'s day: liquid nitrogen keeps the bit alive')
    add('gtceu.recipe.grindless_mercury_shift.night', 'Mercury\'s night: dry, the bit wears twice as fast')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.mercury_vein_drill', 'Perforadora de vetas de Mercurio')
    add('block.gtceu.mercury_solar_works', 'Planta solar de Mercurio')
    add('block.gtceu.mercury_solar_field', 'Campo solar de Mercurio')
    add('block.gtceu.interferometer', 'Interferómetro')
    add('gtceu.solar_processing', 'Procesado solar')
    add('gtceu.mercury_solar', 'Energía solar de Mercurio')
    add('gtceu.interferometry', 'Interferometría')

    add('grindless.machine.mercury_vein_drill.tooltip.0', '§7Perfora las vetas de mineral de Mercurio.')
    add('grindless.machine.mercury_vein_drill.needs_nitrogen', 'Día en Mercurio: la perforadora solo funciona con nitrógeno líquido en su escotilla de entrada (10 mB por ciclo)')
    add('grindless.machine.mercury_vein_drill.keeps_nitrogen', 'Noche en Mercurio: la perforadora perfora en seco y guarda el nitrógeno líquido para el día')
    add('grindless.machine.mercury_vein_drill.shift.day', 'Día en Mercurio: perforando con nitrógeno líquido (%s mB en la escotilla, 10 mB por ciclo)')
    add('grindless.machine.mercury_vein_drill.shift.night', 'Noche en Mercurio: perforando en seco, la broca se gasta el doble de rápido (%s mB de nitrógeno líquido guardados)')

    add('grindless.machine.mercury_solar_works.tooltip.0', '§7Taller de helióstatos que procesa materiales con calor solar.')
    add('grindless.machine.mercury_solar_works.no_voiding', 'La planta solar guarda el tetróxido de osmio y el vapor: salen por sus escotillas de salida. Desactiva el vaciado de fluidos')
    add('grindless.machine.mercury_solar_works.sun.sun', 'Sol en el receptor: el próximo ciclo paga una cuarta parte de su EU/t')
    add('grindless.machine.mercury_solar_works.sun.night', 'Noche: el próximo ciclo paga su EU/t entero')
    add('grindless.machine.mercury_solar_works.sun.shaded', 'A la sombra (%s entre el receptor y los 8 espejos sin cielo abierto): el próximo ciclo paga su EU/t entero')

    add('grindless.machine.mercury_solar_field.tooltip.0', '§7Paneles de película fina de Mercurio: luz solar a EU.')
    add('grindless.machine.mercury_solar_field.no_sky', 'Ningún panel ve el cielo abierto')
    add('grindless.machine.mercury_solar_field.panels', 'Paneles bajo el cielo abierto: %s de %s')
    add('grindless.machine.mercury_solar_field.hint', 'Circuito programado 1 en el bus de entrada. Solo funciona de día, en Mercurio.')

    add('grindless.machine.interferometer.tooltip.0', '§7Interferómetro de radio en Mercurio, activo de noche.')

    add('item.grindless.tungsten_steel_drill_bit', 'Broca de acero de tungsteno')
    add('tooltip.grindless.tungsten_steel_drill_bit.0', 'La broca de las perforadoras de vetas IV, torneada en un torno IV a partir de una varilla larga de acero de tungsteno.')
    add('tooltip.grindless.tungsten_steel_drill_bit.1', 'Una por ciclo, y se gasta por probabilidad. En la perforadora de vetas de Mercurio: cerca del 0,25 % de los ciclos de día (con nitrógeno líquido), 0,5 % de noche (en seco).')
    add('item.grindless.lunar_vlbi_recording', 'Grabación VLBI lunar')
    add('tooltip.grindless.lunar_vlbi_recording.0', 'Un orbe de datos con la mitad lunar de una observación de muy larga base: el cielo de radio, cronometrado al nanosegundo.')
    add('tooltip.grindless.lunar_vlbi_recording.1', 'La escribe la antena de espacio profundo de noche en la Luna, apuntada por la carta de los planetas interiores. El interferómetro de Mercurio añade su mitad.')
    add('item.grindless.outer_system_chart', 'Carta del sistema exterior')
    add('tooltip.grindless.outer_system_chart.0', 'Un orbe de datos con el cinturón de asteroides y las lunas de Júpiter, fijados por un interferómetro cuya línea de base va de la Luna a Mercurio.')
    add('tooltip.grindless.outer_system_chart.1', 'La carta del viaje más allá de los planetas interiores. La hace el interferómetro; se copia con un orbe de datos.')
    add('item.grindless.sagittarius_a_star_signal', 'Señal de Sagitario A*')
    add('tooltip.grindless.sagittarius_a_star_signal.0', 'La primera señal de radio de Sagitario A*, el agujero negro del centro de la galaxia, grabada por el interferómetro.')
    add('tooltip.grindless.sagittarius_a_star_signal.1', 'Los radioastrónomos la encontraron así por primera vez en 1974. Aquí marca hacia dónde apunta el viaje.')

    add('gtceu.recipe.grindless_sun_eut', 'Con el sol en el receptor: %s EU/t (una cuarta parte)')
    add('gtceu.recipe.grindless_sky.hermean_day', 'Día en Mercurio, paneles bajo el cielo abierto (luz solar x6,7): %s EU/t por panel, %s paneles = %s EU/t')
    add('gtceu.recipe.grindless_sky.interferometer', 'Cielo: noche en Mercurio. La otra mitad: la antena de espacio profundo, de noche en la Luna')
    add('gtceu.recipe.grindless_sky.vlbi_moon', 'Cielo: noche lunar, en la Luna. El interferómetro añade la mitad de Mercurio')
    add('gtceu.recipe.grindless_mercury_shift.day', 'Día en Mercurio: el nitrógeno líquido mantiene viva la broca')
    add('gtceu.recipe.grindless_mercury_shift.night', 'Noche en Mercurio: en seco, la broca se gasta el doble de rápido')
})
