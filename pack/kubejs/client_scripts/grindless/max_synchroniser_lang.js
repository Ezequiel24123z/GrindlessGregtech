// priority: 6544
// Gregtech Grindless - names and tooltips of MAX's ergoregion synchroniser (startup_scripts/grindless/max/synchroniser.js; package MX-S2):
//
//   gtceu.<type>                                       recipe type name (the controller's block name is in max_foundation_lang.js)
//   grindless.machine.<machine>.tooltip.N              controller tooltip
//   emi.grindless.info.<machine>.N                     the EMI info page of the controller
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe of the package's type
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['gtceu.ergoregion_synchronisation', 'Ergoregion Synchronisation'],

        ['grindless.machine.ergoregion_synchroniser.tooltip.0',
            '\u00a77Locks a shell to the spin of Sgr A*: phase locks. Runs only in its orbit.'],

        ['emi.grindless.info.ergoregion_synchroniser.0',
            'Two SRF driver modules, a pair of calibrated oscillator banks and four tunable impedance sheets are tuned against a quantum memory node in a superfluid He-3 bath until the whole assembly follows the frame dragging of the black hole: a horizon phase lock. Every shell of the mirror swarm needs one. A fatigued VO2 sheet comes out one time in eight; the extraction cascade (circuit 32) turns it back into vanadium pentoxide and sapphire dust.'],
        ['emi.grindless.info.ergoregion_synchroniser.1',
            'Circuit 2 relocks a spent phase lock with one fresh oscillator bank. The sheets are lines L50 (VO2 on sapphire, patterned and metallised), the driver modules are L51 (niobium cavities, Nb3Sn layer, conduction cooling) and the oscillator banks are L55 (sapphire resonators, nuclear clock, photonic foundry).'],

        ['emi.grindless.info.driver_ring_casing.0',
            'A structure block: a ring segment of the Ergoregion Synchroniser. Made in the assembler.'],

        ['gtceu.recipe.grindless_ergoregion_synchronisation.horizon_phase_lock',
            'Circuit 1: two driver modules, two oscillator banks, four impedance sheets and a memory node in superfluid He-3; one time in eight a fatigued VO2 sheet comes back.'],
        ['gtceu.recipe.grindless_ergoregion_synchronisation.relock_phase_lock',
            'Circuit 2: a spent phase lock is retuned with one new oscillator bank.']
    ]

    // [key, en] of the line recipes
    ;[
        ['gtceu.recipe.grindless_nuclear_clock.clock_steer_oscillator', 'Circuit 8: a clock-steering oscillator, with a UHV circuit'],
        ['gtceu.recipe.grindless_crystal_growth.sapphire_web_wafer', 'Circuit 30: a c-plane sapphire web wafer pulled from the alumina melt'],
        ['gtceu.recipe.grindless_crystal_growth.sapphire_resonator_disc', 'Circuit 31: a sapphire boule for the whispering-gallery resonator disc'],
        ['gtceu.recipe.grindless_beuv_lithography.patterned_vo2_metasurface', 'Circuit 16: the VO2 film exposed with the metasurface pattern'],
        ['gtceu.recipe.grindless_mtj_sputtering.metallised_metasurface', 'Circuit 26: titanium and gold sputtered over the patterned VO2 film'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.vo2_on_sapphire', 'Circuit 6: VO2 grown on the sapphire web wafer by pulsed laser deposition'],
        ['gtceu.recipe.grindless_photonic_foundry.optical_phase_lock_unit', 'Circuit 27: an optical phase-lock unit'],
        ['gtceu.recipe.grindless_single_crystal_casting.large_grain_nb_disc', 'Circuit 28: four niobium ingots drawn into one large-grain disc']
    ].forEach(function (e) { ENTRIES.push(e) })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
