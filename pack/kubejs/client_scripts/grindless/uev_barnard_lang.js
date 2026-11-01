// priority: 5138
// Gregtech Grindless - names and tooltips of UEV's Barnard b (startup_scripts/grindless/uev/barnard.js; package UEV-B3):
//
//   block.gtceu.barnard_core_drill, block.gtceu.carbonyl_refinery, gtceu.barnard_core_drilling, gtceu.carbonyl_refining   machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                                                     controller tooltips
//   gtceu.recipe.grindless_carbonyl_refining.<recipe>                                         the EMI line of each refinery recipe
//   emi.grindless.info.<machine>.0                                                            the EMI info page of each controller
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1                                          the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.barnard_core_drill', 'Barnard Core Drill'],
        ['block.gtceu.carbonyl_refinery', 'Carbonyl Refinery'],
        ['gtceu.carbonyl_refining', 'Carbonyl Refining'],
        ['gtceu.barnard_core_drilling', 'Barnard Core Drilling'],

        ['grindless.machine.barnard_core_drill.tooltip.0',
            '§7Cores Barnard b\'s crust for Barnard core rock.'],
        ['grindless.machine.barnard_core_drill.tooltip.1', 'Works on Barnard b only.'],
        ['emi.grindless.info.barnard_core_drill.1',
            'Cores the metal-rich crust of Barnard b: the only source of Barnard core rock. Works on Barnard b only.'],
        ['emi.grindless.info.barnard_core_drill.2',
            'With the gravity survey (kept) and a nanotwinned diamond bit: 8 rock a run. With the bit and circuit 1: a pilot core of 2 rock, to make the first survey. The bit wears 5 % a run.'],
        ['emi.grindless.info.barnard_core_drill.3',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses. Accepts a parallel hatch.'],

        ['grindless.machine.carbonyl_refinery.tooltip.0',
            '§7Mond process: carbon monoxide carries iron out of Barnard rock.'],
        ['grindless.machine.carbonyl_refinery.tooltip.1', 'Works on Barnard b only.'],
        ['emi.grindless.info.carbonyl_refinery.1',
            'The Mond process on Barnard rock: carbon monoxide takes the iron as iron pentacarbonyl. Works on Barnard b only.'],
        ['emi.grindless.info.carbonyl_refinery.2',
            'Circuit 1: rock and 5,000 mB of CO give 1,000 mB of Fe(CO)5, nickel, cobalt and a residue for the platinum plant.'],
        ['emi.grindless.info.carbonyl_refinery.3',
            'Parts go in the walls and floor: 1-2 energy hatches, 1-2 input buses, 1 input hatch, 1-2 output buses, 1 output hatch. Accepts a parallel hatch.'],

        ['gtceu.recipe.grindless_barnard_core_drilling.pilot_core',
            'A pilot core with the bit alone (circuit 1): 2 rock, enough for the first gravity survey. The bit wears 5 % a run.'],
        ['gtceu.recipe.grindless_barnard_core_drilling.core_survey',
            'With the gravity survey (kept): the drill follows the metal-rich seam and brings up 8 rock a run. The bit wears 5 % a run.'],

        ['gtceu.recipe.grindless_carbonyl_refining.mond',
            'The nickel and cobalt carbonyls form and crack inside the vessel and never leave it. The Fe(CO)5 decomposes in the nitride works, which returns the 5,000 mB of CO.'],

        ['emi.grindless.info.barnard_core_drill.0',
            'The deep-core drill of the family, for Barnard b. The pilot core (circuit 1) breaks the loop between the survey, which needs 4 rock, and the rock, which needs the survey.'],
        ['emi.grindless.info.carbonyl_refinery.0',
            'Barnard b only. Its residue (Re, Os, Ir, Pt, W) goes to the platinum plant (circuit 9); the rhenium comes out as ammonium perrhenate, then dust, pellet and ingot.']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['barnard_residue', 'Barnard Residue',
            'What the Mond process leaves of Barnard rock: rhenium, osmium, iridium, platinum and tungsten.',
            'Digested in the platinum plant (circuit 9).'],
        ['crude_ammonium_perrhenate', 'Crude Ammonium Perrhenate',
            'Rhenium taken up from the digest, still carrying chloride.',
            'Recrystallised in a chemical reactor.'],
        ['ammonium_perrhenate', 'Ammonium Perrhenate',
            'The salt in which rhenium is sold and shipped.',
            'Reduced with hydrogen to rhenium dust.'],
        ['rhenium_pellet', 'Rhenium Pellet',
            'Rhenium powder pressed so it can be sintered.',
            'Sintered to an ingot in an electric furnace.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[3]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
