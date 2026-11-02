// priority: 1524
// Gregtech Grindless - names and tooltips of UXV's SHeQUID works and MNT collider (startup_scripts/grindless/uxv/shequid_mnt.js; package UXV-A6):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each SHeQUID, MNT and synchrotron recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.shequid_works', 'SHeQUID Works'],
        ['block.gtceu.mnt_collider', 'MNT Collider'],
        ['gtceu.shequid_assembly', 'SHeQUID Assembly'],
        ['gtceu.multinucleon_transfer', 'Multinucleon Transfer'],

        ['grindless.machine.shequid_works.tooltip.0',
            '\u00a77Makes the weak-link cell and the SHeQUID gyro in a He-II bath.'],
        ['grindless.machine.mnt_collider.tooltip.0',
            '\u00a77A beamline that makes island nuclides by multinucleon transfer.'],

        ['emi.grindless.info.shequid_works.0',
            'Two weak links in a superconducting loop make a SQUID; the SHeQUID reads it with superfluid helium. It needs two UIV energy hatches and a 6N helium-cooled controller.'],
        ['emi.grindless.info.shequid_works.1',
            'Nothing is vented: the warmed He-II returns to the superfluid helium plant, where a heat flush recovers it and its helium-3.'],
        ['emi.grindless.info.mnt_collider.0',
            'A U-238 beam strikes a Cm-248 target near the Coulomb barrier; the recoils are stopped in a gas cell, thermalised in 6N helium and sorted by a time-of-flight spectrometer. It needs two UIV energy hatches.'],
        ['emi.grindless.info.mnt_collider.1',
            'The spent actinide target goes to waste retrieval and the light fragments to actinide partitioning; the helium is recovered.'],

        ['gtceu.recipe.grindless_shequid_assembly.weak_link_cell',
            'Circuit 1: a 70 nm aperture array is bonded into a titanium cell body as a weak link.'],
        ['gtceu.recipe.grindless_shequid_assembly.shequid_gyro',
            'Circuit 2: two weak-link cells and an MTJ die readout in a He-II bath; the warmed bath is returned.'],
        ['gtceu.recipe.grindless_multinucleon_transfer.collision',
            'Circuit 1: a U-238 beam on a Cm-248 target; the gas stopping cell is kept, the spent target comes back and the recoils leave as gas.'],
        ['gtceu.recipe.grindless_multinucleon_transfer.gas_catcher',
            'Circuit 2: the recoil gas is thermalised in 6N helium inside the stopping cell; 10 mB of buffer is lost.'],
        ['gtceu.recipe.grindless_multinucleon_transfer.mr_tof',
            'Circuit 3: the spectrometer separates the island nuclide; the light fragments leave as gas and the helium is recovered.'],
        ['gtceu.recipe.grindless_multinucleon_transfer.island_chart',
            'Circuit 4: sixteen island nuclides are recorded on a data module as the island chart.'],
        ['gtceu.recipe.grindless_synchrotron.u238_beam_charge',
            'Circuit 8: the ion-source charge is accelerated to a U-238 beam charge; liquid helium cools the injector and returns as gas.']
    ]

    // [name, en, tooltip 0 en, tooltip 1 en]
    var ITEMS = [
        ['weak_link_cell', 'Weak-Link Cell', 'A 70 nm aperture array bonded into a titanium cell body.', 'Two of them make a SHeQUID gyro in the SHeQUID works (circuit 2).'],
        ['mnt_thermal_ions', 'MNT Thermal Ions', 'Recoil nuclei stopped and thermalised in 6N helium.', 'Sorted in the MNT collider\'s MR-TOF (circuit 3).']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[3]])
    })

    ENTRIES.push(['gtceu.recipe.grindless_shequid_assembly.superfluid_reservoir_core',
        'Circuit 13: 16 condensate aerogel, 16 superleak plugs and 8 He-3 seals in 64000 mB of He-3 make 1 superfluid reservoir core'])
    ENTRIES.push(['gtceu.recipe.grindless_shequid_assembly.bottomless_tank_core',
        'Circuit 14: 2 condensate wetted cores, 16 superfluid valves and 8 aerogel fuel tanks in 64000 mB of He-3 make 1 bottomless tank core'])

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
