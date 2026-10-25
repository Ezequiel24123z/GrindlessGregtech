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

    add('grindless.machine.cryogenic_plant.tooltip.0', 'Liquefies gases on the Moon: oxygen into liquid oxygen, helium into liquid helium, and nitrogen into liquid nitrogen, which GTM cannot make. 1,000 mB of gas gives 1,000 mB of liquid in 12 s. It only works on the Moon.')
    add('grindless.machine.cryogenic_plant.tooltip.1', 'By day it costs what GTM\'s vacuum freezer costs: 1,920 EU/t. In the lunar night, with every radiator open to the sky, it dumps its heat into the black sky and costs half: 960 EU/t, in the same 12 s. Each run keeps the price it started with.')
    add('grindless.machine.cryogenic_plant.tooltip.2', 'Liquid nitrogen cools the EV tripod drill; liquid oxygen and liquid helium are kept for IV (extreme engines, 5,000 K ingots). No catalyst and no parallels: the advantage is the cold.')
    add('grindless.machine.cryogenic_plant.tooltip.3', 'Needs, in the two lowest rings of the tower: 1 or 2 EV energy hatches, 1 or 2 input hatches (the gases) and 1 to 4 output hatches (each holds one liquid). ME hatches fit. It stands on sintered regolith, and nothing may cover the radiators.')

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

    add('grindless.machine.cryogenic_plant.tooltip.0', 'Licúa gases en la Luna: oxígeno en oxígeno líquido, helio en helio líquido, y nitrógeno en nitrógeno líquido, que GTM no sabe hacer. 1 000 mB de gas dan 1 000 mB de líquido en 12 s. Solo funciona en la Luna.')
    add('grindless.machine.cryogenic_plant.tooltip.1', 'De día cuesta lo mismo que el congelador al vacío de GTM: 1 920 EU/t. En la noche lunar, con todos los radiadores abiertos al cielo, vuelca su calor al cielo negro y cuesta la mitad: 960 EU/t, en los mismos 12 s. Cada ciclo conserva el precio con el que empezó.')
    add('grindless.machine.cryogenic_plant.tooltip.2', 'El nitrógeno líquido enfría la perforadora trípode EV; el oxígeno líquido y el helio líquido se guardan para IV (motores extremos, lingotes de 5 000 K). Sin catalizador y sin paralelos: la ventaja es el frío.')
    add('grindless.machine.cryogenic_plant.tooltip.3', 'Necesita, en los dos anillos más bajos de la torre: 1 o 2 escotillas de energía EV, 1 o 2 escotillas de entrada (los gases) y de 1 a 4 escotillas de salida (cada una guarda un líquido). Valen escotillas ME. Se apoya en regolito sinterizado, y nada puede tapar los radiadores.')

    add('grindless.machine.cryogenic_plant.sky.night', 'Noche lunar, radiadores abiertos al cielo: el próximo ciclo cuesta la mitad')
    add('grindless.machine.cryogenic_plant.sky.day', 'El sol está arriba: el próximo ciclo cuesta el precio completo (el del congelador)')
    add('grindless.machine.cryogenic_plant.sky.covered', 'Es de noche, pero %s radiadores no ven el cielo: el próximo ciclo cuesta el precio completo')

    add('gtceu.recipe.grindless_night_eut', 'Noche lunar, radiadores abiertos al cielo: %s EU/t')

    add('block.grindless.night_sky_radiator', 'Radiador de cielo nocturno')
    add('tooltip.grindless.night_sky_radiator.0', 'Panel de aluminio con recubrimiento blanco y tubos de calor de amoníaco. Frente a un cielo negro, suelta el calor como luz infrarroja.')
    add('tooltip.grindless.night_sky_radiator.1', 'Doce forman las alas de la planta criogénica. De noche, abiertos al cielo, reducen su energía a la mitad.')
})
