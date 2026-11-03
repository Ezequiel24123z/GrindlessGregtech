// priority: 6655
// Gregtech Grindless - names, tooltips and EMI lines of the Si-28 qubit line's MAX stage (package D5-QPU-MAX, docs/eras/lines-opv-maxplus.md, M1):
//
//   item.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)   the four items registered in startup_scripts/grindless/max/foundation.js
//   gtceu.recipe.<dataKey>.<recipe>                                              the EMI line of each of the four new rows
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // id, name, tip 0, tip 1
    var ITEMS = [
        ['transducer_bonded_stack', 'Transducer-Bonded Stack', 'Four tested tetron dies hybrid-bonded onto the cryo photonic interposer.', 'Goes on to Photonic Tetron Module.'],
        ['photonic_tetron_module', 'Photonic Tetron Module', 'The bonded dies with two squeezed-light chips attached for optical readout.', 'Goes on to Calibrated Photonic Module.'],
        ['calibrated_photonic_module', 'Calibrated Photonic Module', 'A module whose microwave-to-optical transduction was calibrated at 10 mK.', 'Goes on to Shielded Quantum Module.'],
        ['shielded_quantum_module', 'Shielded Quantum Module', 'The calibrated module wrapped in a superconducting membrane shield.', 'Integrated into the Supracausal Mainframe.']
    ]

    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_ion_slicing.transducer_bonded_stack', 'Circuit 14: four tested tetron dies hybrid-bonded onto a cryo photonic interposer; one bond in ten fails and returns a failed die'],
        ['gtceu.recipe.grindless_photonic_foundry.photonic_tetron_module', 'Circuit 17: two squeezed-light chips attached to the bonded stack for optical readout'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.calibrated_photonic_module', 'Circuit 12: the module calibrated at 10 mK in the cryostat module (kept); the He-3/He-4 mixture is returned'],
        ['gtceu.recipe.grindless_membrane_rolling.shielded_quantum_module', 'Circuit 4: the calibrated module wrapped in a superconducting membrane under liquid helium']
    ]

    ClientEvents.lang('en_us', function (event) {
        ITEMS.forEach(function (e) {
            event.add('grindless', 'item.grindless.' + e[0], e[1])
            event.add('grindless', 'tooltip.grindless.' + e[0] + '.0', e[2])
            event.add('grindless', 'tooltip.grindless.' + e[0] + '.1', e[3])
        })
        ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1]) })
    })
})()
