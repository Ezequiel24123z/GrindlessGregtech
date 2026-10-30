// priority: 8600
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

    add('grindless.machine.tritium_removal_facility.tooltip.0', '§7Strips tritium from spent fission moderator.')

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

    add('grindless.machine.tritium_removal_facility.tooltip.0', '§7Extrae el tritio del moderador agotado de fisión.')

    add('grindless.machine.tritium_removal_facility.sky.night', 'Noche lunar, radiadores abiertos al cielo: el próximo ciclo cuesta la mitad')
    add('grindless.machine.tritium_removal_facility.sky.day', 'El sol está arriba: el próximo ciclo cuesta el precio completo')
    add('grindless.machine.tritium_removal_facility.sky.covered', 'Es de noche, pero %s radiadores no ven el cielo: el próximo ciclo cuesta el precio completo')

    add('grindless.machine.tritium_removal_facility.carrier.ok', 'Portador de deuterio: %s mB (necesita %s mB, nunca se gasta)')
    add('grindless.machine.tritium_removal_facility.carrier.low', 'Portador de deuterio: %s de %s mB. No arranca nada sin la carga completa en una escotilla de entrada')

    add('grindless.machine.tritium_removal_facility.no_voiding', 'La planta guarda todo lo que hace: el tritio y el agua pesada salen por sus escotillas. Desactiva el vaciado de fluidos')
    add('grindless.machine.tritium_removal_facility.not_moon', 'Esta planta solo funciona en la Luna: aquí su receta no arranca')
})
