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

    add('grindless.machine.mercury_vein_drill.tooltip.0', 'Mercury\'s vein drill: a low body of heat-shield bricks under a brick sunshade on four tungsten steel posts, with radiators hanging under the shade and a drill string down into the crust. It only drills Mercury\'s veins, and only on Mercury.')
    add('grindless.machine.mercury_vein_drill.tooltip.1', 'Tungsten steel drill bit, 5.625 raw ores per run. By day it only runs with liquid nitrogen (10 mB per run, the bit worn out in about 0.25% of the runs): Mercury\'s sun would burn a dry bit out. At night it drills dry and keeps the nitrogen, but the bit wears twice as fast (0.5%).')
    add('grindless.machine.mercury_vein_drill.tooltip.2', 'Runs as many bores at once as its energy hatches allow (voltage / 8 EU/t, up to 128, one bit per bore): one IV hatch fills all 128 and halves the time. Day or night is read when each run starts, so dawn and dusk never stop a run halfway.')
    add('grindless.machine.mercury_vein_drill.tooltip.3', 'Needs 1 or 2 energy hatches, 1 input bus (sample and bits), 1 or 2 output buses and 1 input hatch for the liquid nitrogen; ME buses and hatches fit. It stands on Hermean Heat-Shield Bricks.')
    add('grindless.machine.mercury_vein_drill.needs_nitrogen', 'Mercury\'s day: the drill only runs with liquid nitrogen in its input hatch (10 mB per bore)')
    add('grindless.machine.mercury_vein_drill.keeps_nitrogen', 'Mercury\'s night: the drill drills dry and keeps the liquid nitrogen for the day')
    add('grindless.machine.mercury_vein_drill.shift.day', 'Mercury\'s day: drilling with liquid nitrogen (%s mB in the hatch, 10 mB per bore)')
    add('grindless.machine.mercury_vein_drill.shift.night', 'Mercury\'s night: drilling dry, the bit wears twice as fast (%s mB of liquid nitrogen kept)')

    add('grindless.machine.mercury_solar_works.tooltip.0', 'Mercury\'s site workshop: eight heliostat mirrors focus the sun on a focal furnace of robust tungsten steel, with a laminated glass evaporation bell beside it. It works only on Mercury.')
    add('grindless.machine.mercury_solar_works.tooltip.1', 'It sinters Hermean regolith dust into heat-shield bricks, evaporates gallium arsenide onto silicon wafers into thin-film panels, and fuses iridosmine with saltpeter and salt water into rarest metal mixture and osmium tetroxide (3 iridium to 1 osmium, refined at home).')
    add('grindless.machine.mercury_solar_works.tooltip.2', 'Sun rule: a run that starts with the sun on the receiver and all eight mirrors under open sky pays a quarter of its EU/t; at night or shaded it pays all of it. Cheaper, never faster.')
    add('grindless.machine.mercury_solar_works.tooltip.3', 'Needs 1 or 2 energy hatches, 1 or 2 input buses, 1 or 2 output buses, up to 1 input hatch and up to 2 output hatches. It makes the bricks, so its pad is Mercury rock. While it voids fluids, the fusion does not run: the osmium tetroxide is kept.')
    add('grindless.machine.mercury_solar_works.no_voiding', 'The solar works keeps the osmium tetroxide and the steam: they leave through its output hatches. Turn fluid voiding off')
    add('grindless.machine.mercury_solar_works.sun.sun', 'Sun on the receiver: the next run pays a quarter of its EU/t')
    add('grindless.machine.mercury_solar_works.sun.night', 'Night: the next run pays its full EU/t')
    add('grindless.machine.mercury_solar_works.sun.shaded', 'Shaded (%s of the receiver and the 8 mirrors without open sky): the next run pays its full EU/t')

    add('grindless.machine.mercury_solar_field.tooltip.0', '36 Hermean Thin-Film Panels on tungsten steel posts over heat-shield bricks, a radiator bank behind them and the control hut under a brick sunshade. Sunlight straight into EU.')
    add('grindless.machine.mercury_solar_field.tooltip.1', 'Works only by day, on Mercury (x6.7 sunlight: 2,010 EU/t per panel). Each of its 36 panels with open sky above it adds a run: 72,360 EU/t. At night it waits, losing nothing.')
    add('grindless.machine.mercury_solar_field.tooltip.2', 'Put programmed circuit 1 in the input bus. Runs = the fewest of the lit panels and what the dynamo hatches carry (an IV dynamo hatch carries 16,384 EU/t: 8 panels; three IV 4A hatches carry the whole field).')
    add('grindless.machine.mercury_solar_field.tooltip.3', 'Needs, in the control hut: 1 input bus and 1 to 4 dynamo hatches. At night, use buffers or the power of home through the AE2 bridge.')
    add('grindless.machine.mercury_solar_field.no_sky', 'No panel sees the open sky')
    add('grindless.machine.mercury_solar_field.panels', 'Panels under open sky: %s of %s')
    add('grindless.machine.mercury_solar_field.hint', 'Programmed circuit 1 in the input bus. Works by day only, on Mercury.')

    add('grindless.machine.interferometer.tooltip.0', 'Three tungsten steel dishes on brick pedestals, joined by a cable run to a correlator hut: a radio interferometer on Mercury, with the Moon\'s Deep Space Antenna at the far end of its baseline.')
    add('grindless.machine.interferometer.tooltip.1', 'Works only on Mercury, at night. If dawn comes mid-run, it waits and keeps its progress.')
    add('grindless.machine.interferometer.tooltip.2', 'It adds Mercury\'s half to a Lunar VLBI Recording and writes the Outer System Chart (calibrated by the Inner Planets Chart, never used up) or, calibrated by the Outer System Chart, the first signal of Sagittarius A*.')
    add('grindless.machine.interferometer.tooltip.3', 'Needs, in the correlator hut: 1 or 2 energy hatches (IV), 1 input bus and 1 output bus.')

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

    add('grindless.machine.mercury_vein_drill.tooltip.0', 'La perforadora de vetas de Mercurio: un cuerpo bajo de ladrillos de escudo térmico bajo un parasol de ladrillos sobre cuatro postes de acero de tungsteno, con radiadores colgados bajo el parasol y una sarta de perforación hasta la corteza. Solo perfora las vetas de Mercurio, y solo en Mercurio.')
    add('grindless.machine.mercury_vein_drill.tooltip.1', 'Broca de acero de tungsteno, 5,625 menas en bruto por ciclo. De día solo funciona con nitrógeno líquido (10 mB por ciclo, y la broca se gasta en cerca del 0,25 % de los ciclos): el sol de Mercurio quemaría una broca en seco. De noche perfora en seco y guarda el nitrógeno, pero la broca se gasta el doble de rápido (0,5 %).')
    add('grindless.machine.mercury_vein_drill.tooltip.2', 'Hace tantos ciclos a la vez como permitan sus escotillas de energía (voltaje / 8 EU/t, hasta 128, una broca por ciclo): una escotilla IV llena los 128 y reduce el tiempo a la mitad. El día o la noche se leen al empezar cada ciclo, así que el amanecer y el anochecer nunca paran un ciclo a medias.')
    add('grindless.machine.mercury_vein_drill.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada (muestra y brocas), 1 o 2 buses de salida y 1 escotilla de entrada para el nitrógeno líquido; valen los buses y escotillas ME. Se apoya en ladrillos de escudo térmico de Mercurio.')
    add('grindless.machine.mercury_vein_drill.needs_nitrogen', 'Día en Mercurio: la perforadora solo funciona con nitrógeno líquido en su escotilla de entrada (10 mB por ciclo)')
    add('grindless.machine.mercury_vein_drill.keeps_nitrogen', 'Noche en Mercurio: la perforadora perfora en seco y guarda el nitrógeno líquido para el día')
    add('grindless.machine.mercury_vein_drill.shift.day', 'Día en Mercurio: perforando con nitrógeno líquido (%s mB en la escotilla, 10 mB por ciclo)')
    add('grindless.machine.mercury_vein_drill.shift.night', 'Noche en Mercurio: perforando en seco, la broca se gasta el doble de rápido (%s mB de nitrógeno líquido guardados)')

    add('grindless.machine.mercury_solar_works.tooltip.0', 'El taller de Mercurio: ocho espejos heliostatos concentran el sol en un horno focal de acero de tungsteno robusto, con una campana de evaporación de vidrio laminado al lado. Solo funciona en Mercurio.')
    add('grindless.machine.mercury_solar_works.tooltip.1', 'Sinteriza polvo de regolito de Mercurio en ladrillos de escudo térmico, evapora arseniuro de galio sobre obleas de silicio en paneles de película fina y funde iridosmina con salitre y agua salada en mezcla de metales rarísimos y tetróxido de osmio (3 de iridio por 1 de osmio, refinados en casa).')
    add('grindless.machine.mercury_solar_works.tooltip.2', 'Regla del sol: un ciclo que empieza con el sol en el receptor y los ocho espejos bajo el cielo abierto paga una cuarta parte de su EU/t; de noche o a la sombra lo paga entero. Más barato, nunca más rápido.')
    add('grindless.machine.mercury_solar_works.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 o 2 buses de entrada, 1 o 2 buses de salida, hasta 1 escotilla de entrada y hasta 2 de salida. Hace los ladrillos, así que su base es roca de Mercurio. Mientras vacía fluidos, la fusión no funciona: el tetróxido de osmio se guarda.')
    add('grindless.machine.mercury_solar_works.no_voiding', 'La planta solar guarda el tetróxido de osmio y el vapor: salen por sus escotillas de salida. Desactiva el vaciado de fluidos')
    add('grindless.machine.mercury_solar_works.sun.sun', 'Sol en el receptor: el próximo ciclo paga una cuarta parte de su EU/t')
    add('grindless.machine.mercury_solar_works.sun.night', 'Noche: el próximo ciclo paga su EU/t entero')
    add('grindless.machine.mercury_solar_works.sun.shaded', 'A la sombra (%s entre el receptor y los 8 espejos sin cielo abierto): el próximo ciclo paga su EU/t entero')

    add('grindless.machine.mercury_solar_field.tooltip.0', '36 paneles de película fina de Mercurio sobre postes de acero de tungsteno y ladrillos de escudo térmico, una batería de radiadores detrás y la caseta de control bajo un parasol de ladrillos. La luz del sol pasa directa a EU.')
    add('grindless.machine.mercury_solar_field.tooltip.1', 'Solo funciona de día, en Mercurio (luz solar x6,7: 2.010 EU/t por panel). Cada uno de sus 36 paneles con el cielo abierto encima suma un ciclo: 72.360 EU/t. De noche espera, sin perder nada.')
    add('grindless.machine.mercury_solar_field.tooltip.2', 'Pon el circuito programado 1 en el bus de entrada. Ciclos = el menor de los paneles iluminados y lo que llevan las escotillas dinamo (una escotilla dinamo IV lleva 16.384 EU/t: 8 paneles; tres escotillas IV de 4 A llevan el campo entero).')
    add('grindless.machine.mercury_solar_field.tooltip.3', 'Necesita, en la caseta de control: 1 bus de entrada y de 1 a 4 escotillas dinamo. De noche, usa baterías o la energía de casa a través del puente de AE2.')
    add('grindless.machine.mercury_solar_field.no_sky', 'Ningún panel ve el cielo abierto')
    add('grindless.machine.mercury_solar_field.panels', 'Paneles bajo el cielo abierto: %s de %s')
    add('grindless.machine.mercury_solar_field.hint', 'Circuito programado 1 en el bus de entrada. Solo funciona de día, en Mercurio.')

    add('grindless.machine.interferometer.tooltip.0', 'Tres antenas parabólicas de acero de tungsteno sobre pedestales de ladrillo, unidas por un tendido de cable a una caseta correladora: un interferómetro de radio en Mercurio, con la antena de espacio profundo de la Luna en el otro extremo de su línea de base.')
    add('grindless.machine.interferometer.tooltip.1', 'Solo funciona en Mercurio y de noche. Si amanece a medio ciclo, espera y no pierde lo hecho.')
    add('grindless.machine.interferometer.tooltip.2', 'Añade la mitad de Mercurio a una grabación VLBI lunar y escribe la carta del sistema exterior (calibrada por la carta de los planetas interiores, que no se gasta) o, calibrada por la carta del sistema exterior, la primera señal de Sagitario A*.')
    add('grindless.machine.interferometer.tooltip.3', 'Necesita, en la caseta correladora: 1 o 2 escotillas de energía (IV), 1 bus de entrada y 1 bus de salida.')

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
