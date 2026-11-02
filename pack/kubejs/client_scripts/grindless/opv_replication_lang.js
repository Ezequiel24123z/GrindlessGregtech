// priority: 5696
// Gregtech Grindless - names and tooltips of OpV's replication chain (startup_scripts/grindless/opv/replication.js; package OpV-R2):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   item.grindless.<id>, tooltip.grindless.<id>.N      the package's items
//   material.grindless.<id>                            the package's fluid
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controller
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.debris_harvester', 'Debris Harvester'],
        ['gtceu.debris_harvesting', 'Debris Harvesting'],
        ['grindless.machine.debris_harvester.tooltip.0',
            '\u00a77Gathers bulge debris around Terzan 5 and sorts it into fractions.'],

        ['item.grindless.metal_debris_fraction', 'Metal Debris Fraction'],
        ['tooltip.grindless.metal_debris_fraction.0', 'The iron and nickel grains sorted out of bulge debris.'],
        ['tooltip.grindless.metal_debris_fraction.1', 'Refined through carbonyl in the replication refinery.'],

        ['emi.grindless.info.debris_harvester.0',
            'The harvester runs only at Terzan 5 core. Its first run needs no input: a sensor head is its only tool and is never used up, so the first debris is gathered without any supply. Harvesting debris from a bulge is named fiction.'],
        ['emi.grindless.info.debris_harvester.1',
            'Circuit 2 sorts four bulge debris into two metal and two silicate fractions; the refinery turns them into feedstock and casings.'],

        ['gtceu.recipe.grindless_debris_harvesting.bulge_debris_harvest',
            'Circuit 1: four bulge debris gathered with a sensor head that is not consumed.'],
        ['gtceu.recipe.grindless_debris_harvesting.debris_fractions',
            'Circuit 2: four bulge debris sorted into two metal and two silicate fractions.'],

        ['block.gtceu.replication_refinery', 'Replication Refinery'],
        ['gtceu.replication_refining', 'Replication Refining'],
        ['grindless.machine.replication_refinery.tooltip.0',
            '\u00a77Turns debris fractions into feedstock and casings: Mond carbonyl and FFC salt.'],
        ['material.grindless.metal_carbonyl', 'Metal Carbonyl'],

        ['item.grindless.carbonyl_iron_nickel', 'Carbonyl Iron-Nickel Powder'],
        ['tooltip.grindless.carbonyl_iron_nickel.0', 'Fine powder from the decomposed metal carbonyl.'],
        ['tooltip.grindless.carbonyl_iron_nickel.1', 'Sintered into metal feedstock for the foundry.'],
        ['item.grindless.ffc_pellet', 'FFC Pellet'],
        ['tooltip.grindless.ffc_pellet.0', 'Pressed silicate debris, ready for the molten salt bath.'],
        ['tooltip.grindless.ffc_pellet.1', 'Reduced to silicon alloy powder at the anode.'],
        ['item.grindless.spent_graphite_anode', 'Spent Graphite Anode'],
        ['tooltip.grindless.spent_graphite_anode.0', 'A worn anode from the FFC salt bath.'],
        ['tooltip.grindless.spent_graphite_anode.1', 'The methane pyrolyser cracks it back into graphene.'],

        ['emi.grindless.info.replication_refinery.0',
            'Two cells in one plant. The carbonyl cell binds metal fractions with carbon monoxide, then decomposes the carbonyl into powder and returns 90% of the gas; the powder sinters into feedstock.'],
        ['emi.grindless.info.replication_refinery.1',
            'The salt cell presses silicate pellets, turns them into silicon alloy powder at graphite anodes (oxygen is the by-product, the spent anodes go to the methane pyrolyser) and sinters cluster casings.'],

        ['gtceu.recipe.grindless_replication_refining.metal_carbonyl_synthesis', 'Circuit 1: metal fraction and carbon monoxide bound into carbonyl.'],
        ['gtceu.recipe.grindless_replication_refining.carbonyl_decomposition', 'Circuit 2: carbonyl decomposed into powder; 90% of the gas returns.'],
        ['gtceu.recipe.grindless_replication_refining.metal_feedstock_sinter', 'Circuit 3: iron-nickel powder sintered into metal feedstock.'],
        ['gtceu.recipe.grindless_replication_refining.ffc_pellet_press', 'Circuit 4: silicate fractions pressed into FFC pellets.'],
        ['gtceu.recipe.grindless_replication_refining.ffc_salt_bath', 'Circuit 5: pellets reduced at graphite anodes into silicon alloy powder, oxygen and spent anodes.'],
        ['gtceu.recipe.grindless_replication_refining.cluster_casing_sinter', 'Circuit 6: silicon alloy powder sintered into cluster casings.'],

        ['block.gtceu.von_neumann_foundry', 'Von Neumann Foundry'],
        ['gtceu.self_replication', 'Self-Replication'],
        ['grindless.machine.von_neumann_foundry.tooltip.0',
        '\u00a77Builds probe seeds from Terzan 5 feedstock; the seed itself is never used up.'],
        ['emi.grindless.info.von_neumann_foundry.0',
        'A probe copies itself only with real material: 16 metal feedstock, 8 cluster casings and a vitamin kit. The seed is kept in circuit 1 and two seeds come out; nothing is copied from nothing.'],
        ['emi.grindless.info.von_neumann_foundry.1',
        'Circuit 2 turns a pathfinder probe core and the same feedstock into one seed.'],
        ['gtceu.recipe.grindless_self_replication.probe_self_copy', 'Circuit 1: the seed is kept; feedstock, casings and a vitamin kit make a second seed.'],
        ['gtceu.recipe.grindless_self_replication.probe_core_seed', 'Circuit 2: a pathfinder probe core and the same feedstock make one seed.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
