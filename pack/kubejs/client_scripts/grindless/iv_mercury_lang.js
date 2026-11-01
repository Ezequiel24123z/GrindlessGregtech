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
// en_us.
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

