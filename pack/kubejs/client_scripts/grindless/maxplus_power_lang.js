// priority: 6800
// Gregtech Grindless - EMI lines of the MAX+ power plumbing recipes (server_scripts/grindless/maxplus/power.js): the Kerr
// fault-current limiter line, one line per data-keyed recipe of the older machines it runs on.
//
//   gtceu.recipe.grindless_<recipe type>.<recipe name>
ClientEvents.lang('en_us', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('gtceu.recipe.grindless_coated_conductor.kerr_fcl_buffer_tape', 'Circuit 10: Kerr buffer tape for the fault-current limiter, strand wire on a coated substrate')
    add('gtceu.recipe.grindless_pulsed_laser_deposition.thick_kerr_fcl_tape', 'Circuit 8: thick Kerr tape, gadolinium-doped layers laser-deposited on the buffer')
    add('gtceu.recipe.grindless_magnet_winding.kerr_fcl_coil', 'Circuit 16: a Kerr fault-current limiter coil, wound in the helium charge')
})

ClientEvents.lang('es_es', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('gtceu.recipe.grindless_coated_conductor.kerr_fcl_buffer_tape', 'Circuito 10: cinta amortiguadora Kerr para el limitador de corriente de falla, hilo trenzado sobre un sustrato recubierto')
    add('gtceu.recipe.grindless_pulsed_laser_deposition.thick_kerr_fcl_tape', 'Circuito 8: cinta Kerr gruesa, capas dopadas con gadolinio depositadas por láser sobre el amortiguador')
    add('gtceu.recipe.grindless_magnet_winding.kerr_fcl_coil', 'Circuito 16: una bobina del limitador de corriente de falla Kerr, bobinada en la carga de helio')
})
