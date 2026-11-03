// priority: 1800
// Gregtech Grindless - names and tooltips of UV's thorium line (startup_scripts/grindless/uv/thorium.js; package UV-A1):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.u233_fuel_rod, tooltip.grindless.u233_fuel_rod.0/.1
//   material.gtceu.<n>                                            the new GT materials
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.pyroprocessing_cell', 'Pyroprocessing Cell'],
        ['gtceu.pyroprocessing', 'Pyroprocessing'],
        ['block.gtceu.accelerator_driven_reactor', 'Accelerator-Driven Reactor'],
        ['gtceu.accelerator_driven', 'Accelerator-Driven Reactor'],

        ['grindless.machine.pyroprocessing_cell.tooltip.0',
            '§7Reprocesses spent thorium fuel in a molten LiCl bath.'],
        ['grindless.machine.pyroprocessing_cell.no_voiding',
            'Voiding is off: the waste and the salt must never be thrown away.'],

        ['grindless.machine.accelerator_driven_reactor.tooltip.0',
            '§7A subcritical thorium core driven by a proton beam.'],
        ['grindless.machine.accelerator_driven_reactor.no_voiding',
            'Voiding is off: the spent fuel and the polonium must never be thrown away.'],

        ['gtceu.recipe.grindless_pyroprocessing.reduce',
            'Circuit 1: spent oxide fragments reduced with lithium to thorium-uranium metal; the LiCl and the lithium are never used up'],
        ['gtceu.recipe.grindless_pyroprocessing.refine',
            'Circuit 2: the metal electrorefined to a uranium-233 cathode deposit and thorium; the salt takes up the rest'],
        ['gtceu.recipe.grindless_pyroprocessing.nitride',
            'Circuit 3: spent nitride fragments to a uranium-233 cathode deposit, thorium and nitrogen-15, with a 5 % nitrogen-14 make-up'],
        ['gtceu.recipe.grindless_pyroprocessing.salt',
            'Circuit 4: protactinium extracted from the loaded salt into bismuth with lithium; the LiCl returns and the fission products go to the waste retrieval plant'],
        ['gtceu.recipe.grindless_pyroprocessing.chop_oxide',
            'Circuit 10: a spent oxide assembly chopped into fragments; the hulls are radioactive waste for the waste retrieval plant'],
        ['gtceu.recipe.grindless_pyroprocessing.chop_nitride',
            'Circuit 11: a spent nitride assembly chopped into fragments; the hulls are radioactive waste for the waste retrieval plant'],
        ['gtceu.recipe.grindless_pyroprocessing.cathode',
            'Circuit 12: the deposits distilled under vacuum to uranium-233 ingots (the quarter bred from protactinium comes from the hold); the entrained salt returns'],
        ['gtceu.recipe.grindless_pyroprocessing.decay',
            'Circuit 13: the protactinium-233 hold; it decays to uranium-233 dust and the bismuth is stripped clean and goes round'],
        ['gtceu.recipe.grindless_accelerator_driven.thorium_oxide',
            'A thorium oxide assembly burns for 12,000 ticks; the lead-bismuth charge is never used up'],
        ['gtceu.recipe.grindless_accelerator_driven.thorium_nitride',
            'A thorium nitride assembly burns for 16,000 ticks; the lead-bismuth charge is never used up'],

        ['item.grindless.u233_fuel_rod', 'Uranium-233 Fuel Rod'],
        ['tooltip.grindless.u233_fuel_rod.0', 'Uranium-233 slugs sodium-bonded in zircaloy tubes.'],
        ['tooltip.grindless.u233_fuel_rod.1', 'Made by the fuel fabrication plant (circuit 6). The fission reactor can burn it once its core table lists it.'],

        ['item.grindless.spent_oxide_fragments', 'Spent Oxide Fragments'],
        ['tooltip.grindless.spent_oxide_fragments.0', 'Chopped, declad pieces of a spent thorium oxide assembly.'],
        ['tooltip.grindless.spent_oxide_fragments.1', 'Made by the pyroprocessing cell (circuit 10); reduced with lithium (circuit 1).'],
        ['item.grindless.spent_nitride_fragments', 'Spent Nitride Fragments'],
        ['tooltip.grindless.spent_nitride_fragments.0', 'Chopped, declad pieces of a spent thorium nitride assembly.'],
        ['tooltip.grindless.spent_nitride_fragments.1', 'Made by the pyroprocessing cell (circuit 11); electrorefined directly (circuit 3).'],
        ['item.grindless.u233_cathode_deposit', 'Uranium-233 Cathode Deposit'],
        ['tooltip.grindless.u233_cathode_deposit.0', 'Uranium-233 grown on the cathode, still wet with salt.'],
        ['tooltip.grindless.u233_cathode_deposit.1', 'Distilled under vacuum in the pyroprocessing cell (circuit 12): four deposits give three ingots.'],

        ['material.gtceu.protactinium_bismuth', 'Protactinium-Bismuth'],
        ['material.gtceu.triton_nitric_oxide', 'Triton Nitric Oxide'],
        ['material.gtceu.lead_bismuth_eutectic', 'Lead-Bismuth Eutectic'],
        ['material.gtceu.polonium_210', 'Polonium-210'],
        ['material.gtceu.thorium_uranium_metal', 'Thorium-Uranium Metal'],
        ['material.gtceu.licl_salt', 'Molten Lithium Chloride'],
        ['material.gtceu.loaded_licl_salt', 'Loaded Lithium Chloride Salt']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
