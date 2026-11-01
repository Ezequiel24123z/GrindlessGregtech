// priority: 6736
// Gregtech Grindless - names and tooltips of MAX's horizon flux clamp (startup_scripts/grindless/max/flux_clamp.js; package MX-S3):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each row of the package that has one (the machine's own, the L54
//                                                      steps on older machines and the plasmoid return on the plasma mass filter)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.horizon_flux_clamp', 'Horizon Flux Clamp'],
        ['grindless.machine.horizon_flux_clamp.tooltip.0', '\u00a77Winds HTS flux pumps, field coils and stream bundles into a clamp winding.'],
        ['emi.grindless.info.clamp_coil_casing.0', 'A structure block: a coil ring of the Horizon Flux Clamp, held off the floor on stream bundle blocks. Made in the assembler.'],
        ['gtceu.recipe.grindless_horizon_flux_clamp.horizon_flux_clamp', 'Circuit 1: four HTS flux pumps, eight field coils and four stream bundles are wound into a clamp winding under flux-loaded FRC; the flares it suppresses come out as a reconnection plasmoid. Runs only at Sgr A* (gcyr:black_hole_orbit).'],
        ['gtceu.recipe.grindless_coated_conductor.pump_buffered_tape', 'Circuit 9: ITBTC coated conductor is laid on the Hastelloy substrate strip under an epoxy bond into the buffered tape of the HTS flux pump (line L54, step 1).'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.thick_pump_tape', 'Circuit 7: the KrF laser ablates gadolinium barium copper oxide onto the buffered pump tape in oxygen, growing the thick film the pump stator is wound from (line L54, step 2).'],
        ['gtceu.recipe.grindless_magnet_winding.flux_pump_stator', 'Circuit 15: eight turns of thick pump tape are wound with horizon strand wire and potted in epoxy, then ramped in the cold-test helium (line L54, step 3).'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.fe16n2_rotor_magnet', 'Circuit 21: the flux pump stator is set into Fe16N2 ring magnets in a nitrogen stream, below the 320 C ordering limit (line L54, step 4).'],
        ['gtceu.recipe.grindless_plasma_mass_filtering.reconnection_plasmoid_return', 'Circuit 5: the clamp\'s captured reconnection plasmoid is sorted again; it is consumed here and comes out as filtered hot flow and the heavy cut. Runs only at Sgr A* (gcyr:black_hole_orbit).']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
