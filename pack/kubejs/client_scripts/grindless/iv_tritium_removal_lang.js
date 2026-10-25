// Gregtech Grindless - names and tooltips of IV's Tritium Removal Facility (startup_scripts/grindless/iv/tritium_removal.js), its recipe
// type and its controller lines.
//
//   gtceu:tritium_removal_facility / gtceu.detritiation             (machine name + tooltips, recipe type name)
//   grindless.machine.tritium_removal_facility.sky.night|day|covered (controller line: what the sky gives the next run; %s covered)
//   grindless.machine.tritium_removal_facility.carrier.ok|low       (controller line: the deuterium charge; %s held, %s needed)
//   grindless.machine.tritium_removal_facility.no_voiding           (why a run does not start)
//   grindless.machine.tritium_removal_facility.not_moon             (controller line off the Moon)
// The EMI line with the night price is the cryogenic plant's (gtceu.recipe.grindless_night_eut, ev_cryogenic_plant_lang.js).
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.tritium_removal_facility', 'Tritium Removal Facility')
    add('gtceu.detritiation', 'Detritiation')

    add('grindless.machine.tritium_removal_facility.tooltip.0', 'Takes the tritium out of the fission reactor\'s spent moderator, on the Moon. Catalytic exchange columns move the water\'s tritium into a deuterium carrier, and the cold box distils it off at cryogenic temperature. It only works on the Moon.')
    add('grindless.machine.tritium_removal_facility.tooltip.1', '1,000 mB of tritiated heavy water gives 900 mB of heavy water back for the reactor and 200 mB of tritium, at 6,880 EU/t for 0.8 s. It needs a 100 mB deuterium charge in an input hatch: the carrier circulates inside and is never used up.')
    add('grindless.machine.tritium_removal_facility.tooltip.2', 'In the lunar night, with every radiator open to the sky, a run costs half: 3,440 EU/t. Each run keeps the price it started with. The tritium is kept for fusion: the facility refuses to void fluids.')
    add('grindless.machine.tritium_removal_facility.tooltip.3', 'Needs, in the lowest ring of the cold box: 1 or 2 energy hatches, 1 or 2 input hatches (the tritiated heavy water and the deuterium) and 1 or 2 output hatches (heavy water and tritium). ME hatches fit. It stands on sintered regolith, and nothing may cover the radiators.')

    add('grindless.machine.tritium_removal_facility.sky.night', 'Lunar night, radiators open to the sky: the next run costs half')
    add('grindless.machine.tritium_removal_facility.sky.day', 'The sun is up: the next run costs the full price')
    add('grindless.machine.tritium_removal_facility.sky.covered', 'Night, but %s radiators cannot see the sky: the next run costs the full price')

    add('grindless.machine.tritium_removal_facility.carrier.ok', 'Deuterium carrier: %s mB (needs %s mB, never used up)')
    add('grindless.machine.tritium_removal_facility.carrier.low', 'Deuterium carrier: %s of %s mB. Nothing starts without the full charge in an input hatch')

    add('grindless.machine.tritium_removal_facility.no_voiding', 'The facility keeps all it makes: the tritium and the heavy water leave through their hatches. Turn fluid voiding off')
    add('grindless.machine.tritium_removal_facility.not_moon', 'This facility only works on the Moon: its recipe does not start here')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.tritium_removal_facility', 'Planta de extracción de tritio')
    add('gtceu.detritiation', 'Destritiación')

    add('grindless.machine.tritium_removal_facility.tooltip.0', 'Saca el tritio del moderador gastado del reactor de fisión, en la Luna. Las columnas de intercambio catalítico pasan el tritio del agua a un portador de deuterio, y la caja fría lo separa por destilación criogénica. Solo funciona en la Luna.')
    add('grindless.machine.tritium_removal_facility.tooltip.1', '1000 mB de agua pesada tritiada devuelven 900 mB de agua pesada al reactor y dan 200 mB de tritio, a 6880 EU/t durante 0,8 s. Necesita una carga de 100 mB de deuterio en una escotilla de entrada: el portador circula dentro y nunca se gasta.')
    add('grindless.machine.tritium_removal_facility.tooltip.2', 'En la noche lunar, con todos los radiadores abiertos al cielo, cada ciclo cuesta la mitad: 3440 EU/t. Cada ciclo conserva el precio con el que empezó. El tritio se guarda para la fusión: la planta no deja vaciar fluidos.')
    add('grindless.machine.tritium_removal_facility.tooltip.3', 'Necesita, en el anillo más bajo de la caja fría: 1 o 2 escotillas de energía, 1 o 2 escotillas de entrada (el agua pesada tritiada y el deuterio) y 1 o 2 escotillas de salida (agua pesada y tritio). Valen escotillas ME. Se apoya en regolito sinterizado, y nada puede tapar los radiadores.')

    add('grindless.machine.tritium_removal_facility.sky.night', 'Noche lunar, radiadores abiertos al cielo: el próximo ciclo cuesta la mitad')
    add('grindless.machine.tritium_removal_facility.sky.day', 'El sol está arriba: el próximo ciclo cuesta el precio completo')
    add('grindless.machine.tritium_removal_facility.sky.covered', 'Es de noche, pero %s radiadores no ven el cielo: el próximo ciclo cuesta el precio completo')

    add('grindless.machine.tritium_removal_facility.carrier.ok', 'Portador de deuterio: %s mB (necesita %s mB, nunca se gasta)')
    add('grindless.machine.tritium_removal_facility.carrier.low', 'Portador de deuterio: %s de %s mB. No arranca nada sin la carga completa en una escotilla de entrada')

    add('grindless.machine.tritium_removal_facility.no_voiding', 'La planta guarda todo lo que hace: el tritio y el agua pesada salen por sus escotillas. Desactiva el vaciado de fluidos')
    add('grindless.machine.tritium_removal_facility.not_moon', 'Esta planta solo funciona en la Luna: aquí su receta no arranca')
})
