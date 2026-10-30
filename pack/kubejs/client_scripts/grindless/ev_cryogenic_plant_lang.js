// priority: 10800
// Gregtech Grindless - names and tooltips of the EV Cryogenic Plant and its radiator.
//
//   gtceu:cryogenic_plant                        (machine name + tooltips + the controller line about the sky)
//   gtceu:cryogenic_processing                   (recipe type name)
//   gtceu.recipe.grindless_night_eut             (the EMI line with the night price of each recipe)
//   grindless:night_sky_radiator                 (block name + tooltip)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.cryogenic_plant', 'Cryogenic Plant')
    add('gtceu.cryogenic_processing', 'Cryogenic Processing')

    add('grindless.machine.cryogenic_plant.tooltip.0', '§7Liquefies gases: liquid oxygen, helium and nitrogen.')

    add('grindless.machine.cryogenic_plant.sky.night', 'Lunar night, radiators open to the sky: the next run costs half')
    add('grindless.machine.cryogenic_plant.sky.day', 'The sun is up: the next run costs the full price (the freezer\'s)')
    add('grindless.machine.cryogenic_plant.sky.covered', 'Night, but %s radiators cannot see the sky: the next run costs the full price')

    add('gtceu.recipe.grindless_night_eut', 'Lunar night, radiators open to the sky: %s EU/t')

    add('block.grindless.night_sky_radiator', 'Night-Sky Radiator')
    add('tooltip.grindless.night_sky_radiator.0', 'A white-coated aluminium panel with ammonia heat pipes. Facing a black sky, it sheds heat as infrared light.')
    add('tooltip.grindless.night_sky_radiator.1', 'Twelve make the wings of the Cryogenic Plant. At night, open to the sky, they halve its energy.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.cryogenic_plant', 'Planta criogénica')
    add('gtceu.cryogenic_processing', 'Procesado criogénico')

    add('grindless.machine.cryogenic_plant.tooltip.0', '§7Licúa gases: oxígeno, helio y nitrógeno líquidos.')

    add('grindless.machine.cryogenic_plant.sky.night', 'Noche lunar, radiadores abiertos al cielo: el próximo ciclo cuesta la mitad')
    add('grindless.machine.cryogenic_plant.sky.day', 'El sol está arriba: el próximo ciclo cuesta el precio completo (el del congelador)')
    add('grindless.machine.cryogenic_plant.sky.covered', 'Es de noche, pero %s radiadores no ven el cielo: el próximo ciclo cuesta el precio completo')

    add('gtceu.recipe.grindless_night_eut', 'Noche lunar, radiadores abiertos al cielo: %s EU/t')

    add('block.grindless.night_sky_radiator', 'Radiador de cielo nocturno')
    add('tooltip.grindless.night_sky_radiator.0', 'Panel de aluminio con recubrimiento blanco y tubos de calor de amoníaco. Frente a un cielo negro, suelta el calor como luz infrarroja.')
    add('tooltip.grindless.night_sky_radiator.1', 'Doce forman las alas de la planta criogénica. De noche, abiertos al cielo, reducen su energía a la mitad.')
})
