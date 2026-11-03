// priority: 4933
// Gregtech Grindless - names and tooltips of UEV's Sirius B machines (startup_scripts/grindless/uev/sirius.js; package UEV-B4):
//
//   block.gtceu.<machine>, gtceu.<type>                                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                              controller tooltips
//   gtceu.recipe.<dataKey>.<recipe>                                    the EMI line of each recipe
//   emi.grindless.info.<key>.N                                         the EMI info pages (the named fiction of degenerate matter included)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.white_dwarf_spectrograph', 'White Dwarf Spectrograph'],
        ['block.gtceu.degenerate_harvester', 'Degenerate Harvester'],
        ['block.gtceu.containment_works', 'Containment Works'],
        ['gtceu.gravitational_redshift', 'Gravitational Redshift'],
        ['gtceu.degenerate_harvesting', 'Degenerate Harvesting'],
        ['gtceu.degenerate_containment', 'Degenerate Containment'],

        ['grindless.machine.white_dwarf_spectrograph.tooltip.0',
            '§7Reads Sirius B\'s redshift to weigh the star.'],
        ['grindless.machine.white_dwarf_spectrograph.tooltip.1', 'Works in Sirius B orbit only.'],
        ['emi.grindless.info.white_dwarf_spectrograph.1',
            'Reads the redshift of Sirius B\'s light to weigh the star: the mass-radius chart. Works in Sirius B orbit only.'],
        ['emi.grindless.info.white_dwarf_spectrograph.2',
            'Circuit 1: a ULE cavity and 2 SNSPDs, with the nuclear clock kept as the frequency reference. The clock is never consumed.'],
        ['emi.grindless.info.white_dwarf_spectrograph.3',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses. Accepts a parallel hatch.'],

        ['grindless.machine.degenerate_harvester.tooltip.0',
            '§7Takes degenerate matter from Sirius B using an equation-of-state model.'],
        ['grindless.machine.degenerate_harvester.tooltip.1', 'Works in Sirius B orbit only.'],
        ['emi.grindless.info.degenerate_harvester.0',
            'Takes degenerate matter from Sirius B following the equation-of-state model, with the mass-radius chart as the guide. Works in Sirius B orbit only.'],
        ['emi.grindless.info.degenerate_harvester.1',
            'Circuit 1: consumes the EOS model, keeps the chart and 1,000 mB of liquid helium as the cold loop. Gives 1 degenerate matter, which must be contained at once.'],
        ['emi.grindless.info.degenerate_harvester.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1 input hatch, 1-2 output buses. Accepts a parallel hatch.'],

        ['grindless.machine.containment_works.tooltip.0',
            '§7Seals degenerate matter into a carryable pellet.'],
        ['grindless.machine.containment_works.tooltip.1', 'Works in Sirius B orbit only.'],
        ['emi.grindless.info.containment_works.2',
            'Seals degenerate matter in a stasis field into a pellet that can be carried. Works in Sirius B orbit only.'],
        ['emi.grindless.info.containment_works.3',
            'Circuit 1: 1 degenerate matter and 1 exotic matter cell (the Casimir array\'s stasis field) give 1 degenerate pellet. Nothing is released.'],
        ['emi.grindless.info.containment_works.4',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses. Accepts a parallel hatch.'],

        ['gtceu.recipe.grindless_gravitational_redshift.mass_radius_chart',
            'The nuclear clock (kept) times the redshift against the ULE cavity; the SNSPDs count the photons. The chart gives the star\'s mass at its radius.'],
        ['gtceu.recipe.grindless_degenerate_harvesting.degenerate_matter',
            'The EOS model is spent, the chart (kept) says where the matter is dense enough, and the helium loop (kept) carries the heat away. The matter leaves as one contained unit.'],
        ['gtceu.recipe.grindless_degenerate_containment.degenerate_pellet',
            'The matter and the stasis-field cell are sealed together; the cell is the pellet\'s shell. The pellet goes to the UEV field generator and the Sirius warp gate.'],

        ['emi.grindless.info.sirius_fiction.0',
            'Degenerate matter is named fiction, like the Casimir array\'s exotic matter: the pack gives the label to a step, it claims no physics.'],
        ['emi.grindless.info.sirius_fiction.1',
            'It exists only in Sirius B orbit, comes out of the harvester (consuming the EOS model, keeping the chart) and is sealed at once into a pellet in the containment works. Nothing is voided and nothing escapes.'],
        ['emi.grindless.info.white_dwarf_spectrograph.0',
            'The mass-radius chart is made only in Sirius B orbit. It is the harvester\'s kept catalyst and is never consumed.'],
        ['emi.grindless.info.containment_works.0',
            'The pellet is the core of the UEV field generator (assembler, with a pump rotor of single-crystal rhenium alloy) and the seed of the Sirius warp gate.'],
        ['emi.grindless.info.containment_works.1',
            'The degenerate containment casing (assembler) walls the harvester and the containment works; it is built only into those two shells.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
