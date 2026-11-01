// priority: 4846
// Gregtech Grindless - names and tooltips of UHV's antimatter and Casimir machines (startup_scripts/grindless/uhv/antimatter.js;
// package UHV-A6):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N, .no_voiding            controller tooltips; the accumulator's refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe (also the synchrotron's sodium_22 and the
//                                                                 antimatter trap's antihydrogen rows, server_scripts/grindless/uv/accelerators.js)
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items (the F1 items are in uhv_foundation_lang.js)
//   material.gtceu.high_purity_neon                               the cryogenic plant's 99.999 % neon
//   emi.grindless.info.casimir_array_fiction.0                    the array's EMI page (assets/emi/recipe/additions/grindless/
//                                                                 uhv_antimatter_casimir_fiction.json): what is real and what is fiction
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.positron_accumulator', 'Positron Accumulator'],
        ['gtceu.positron_accumulation', 'Positron Accumulation'],
        ['block.gtceu.casimir_array', 'Casimir Array'],
        ['gtceu.casimir_cavity', 'Casimir Cavities'],

        ['grindless.machine.positron_accumulator.tooltip.0',
            '§7Slows and traps positrons by the billion into Penning traps.'],
        ['grindless.machine.positron_accumulator.no_voiding',
            'The spent source\'s radioactive waste and neon must leave through the output bus and hatch: turn output voiding off.'],
        ['grindless.machine.casimir_array.tooltip.0',
            '§7Harvests exotic matter from the Casimir force (fiction).'],
        ['grindless.machine.casimir_array.tooltip.1', 'Works in Earth orbit only.'],
        ['emi.grindless.info.casimir_array.0',
            'Mirrors nanometres apart feel the Casimir force (measured by Lamoreaux in 1997). Harvesting it as exotic matter is fiction. Works only in Earth orbit. The only maker of exotic matter cells.'],
        ['emi.grindless.info.casimir_array.1',
            'Circuit 1: a cavity stack of 7 NbN-coated SiC plates under helium II (the helium back). 2: harvest; a nuclear clock locks the phase, 16 stacks wear out together 1 run in 32. 3: strip a worn stack to its 7 mirror blanks for the MOCVD reactor.'],
        ['emi.grindless.info.casimir_array.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, an input hatch, an output bus, an output hatch. Accepts a parallel hatch.'],

        ['gtceu.recipe.grindless_positron_accumulation.moderated_source', 'Moderated positron source'],
        ['gtceu.recipe.grindless_positron_accumulation.accumulate', 'Accumulate positrons in a Penning trap'],
        ['gtceu.recipe.grindless_positron_accumulation.strip_source', 'Strip a spent source'],
        ['gtceu.recipe.grindless_casimir_cavity.cavity_stack', 'Build a cavity stack'],
        ['gtceu.recipe.grindless_casimir_cavity.harvest', 'Harvest exotic matter (fiction)'],
        ['gtceu.recipe.grindless_casimir_cavity.strip_stack', 'Strip a worn stack'],
        ['gtceu.recipe.grindless_synchrotron.sodium_22', 'Sodium-22 from magnesium-24 (d,α)'],
        ['gtceu.recipe.grindless_antimatter_storage.antihydrogen', 'Merge antiprotons and positrons into antihydrogen'],

        ['item.grindless.magnesium_target', 'Magnesium-24 Target'],
        ['tooltip.grindless.magnesium_target.0',
            'Magnesium pressed on a copper backing; natural magnesium is 79 % magnesium-24.'],
        ['tooltip.grindless.magnesium_target.1',
            'The synchrotron\'s deuteron beam turns it into sodium-22.'],
        ['item.grindless.sodium_22_target', 'Sodium-22 Target'],
        ['tooltip.grindless.sodium_22_target.0',
            'A positron emitter with a 2.6-year half-life, the source of every positron trap.'],
        ['tooltip.grindless.sodium_22_target.1',
            'The positron accumulator coats it with solid neon.'],
        ['item.grindless.moderated_positron_source', 'Moderated Positron Source'],
        ['tooltip.grindless.moderated_positron_source.0',
            'Sodium-22 under a few microns of solid neon, which slows its positrons to a few electronvolts.'],
        ['tooltip.grindless.moderated_positron_source.1',
            'Fills Penning traps until it wears out (1 run in 16).'],
        ['item.grindless.spent_positron_source', 'Spent Positron Source'],
        ['tooltip.grindless.spent_positron_source.0',
            'The moderator has crept away and the sodium-22 has decayed.'],
        ['tooltip.grindless.spent_positron_source.1',
            'Strip it in the accumulator: the neon back, the rest as radioactive waste.'],
        ['item.grindless.empty_penning_trap', 'Empty Penning Trap'],
        ['tooltip.grindless.empty_penning_trap.0',
            'Gold electrodes inside a niobium-titanium solenoid, in a titanium can.'],
        ['tooltip.grindless.empty_penning_trap.1',
            'The positron accumulator fills it.'],
        ['item.grindless.casimir_cavity_stack', 'Casimir Cavity Stack'],
        ['tooltip.grindless.casimir_cavity_stack.0',
            'Seven superconducting mirrors held nanometres apart at 2 K.'],
        ['tooltip.grindless.casimir_cavity_stack.1',
            'The Casimir array harvests sixteen at a time.'],
        ['item.grindless.worn_casimir_cavity_stack', 'Worn Casimir Cavity Stack'],
        ['tooltip.grindless.worn_casimir_cavity_stack.0',
            'The niobium nitride coating has pitted.'],
        ['tooltip.grindless.worn_casimir_cavity_stack.1',
            'Strip it in the array: the seven mirror blanks go back to the MOCVD reactor.'],

        ['material.gtceu.high_purity_neon', '99.999 % Neon'],

        ['emi.grindless.info.casimir_array_fiction.0',
            'Real: the Casimir force between mirrors nanometres apart (predicted in 1948, measured by Lamoreaux in 1997). Fiction: harvesting it as exotic matter with negative energy density in quantities that could hold a wormhole open (Morris and Thorne, 1988). The array is the one labelled fiction of the UHV era.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
