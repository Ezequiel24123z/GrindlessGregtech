// priority: 5726
// Gregtech Grindless - names and tooltips of OpV's magnetic pair converter, its item and the package's older rows
// (startup_scripts/grindless/opv/pair_converter.js; package OpV-E1):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   item.grindless.<id>, tooltip.grindless.<id>.N      the package's one item
//   emi.grindless.info.<machine>.N                     the EMI info page of the controller
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.magnetic_pair_converter', 'Magnetic Pair Converter'],
        ['gtceu.magnetic_pair_production', 'Magnetic Pair Production'],

        ['grindless.machine.magnetic_pair_converter.tooltip.0',
            '\u00a77Converts gamma photons into dense positron plasma in a magnetar\'s field.'],
        ['grindless.machine.magnetic_pair_converter.tooltip.1',
            'Electrons to magnetosphere; split photons leave no item.'],
        ['grindless.machine.magnetic_pair_converter.tooltip.2',
            'Accepts wireless energy hatches.'],

        ['item.grindless.unsealed_positron_cell', 'Unsealed Positron Cell'],
        ['tooltip.grindless.unsealed_positron_cell.0', 'A positron cell cooled out of the magnetar\'s hot pair plasma.'],
        ['tooltip.grindless.unsealed_positron_cell.1', 'Sealed with a fresh getter in the electron beam furnace (circuit 23).'],

        ['emi.grindless.info.magnetic_pair_converter.0',
            'The seed plasma is UHV-A6\'s accumulator packed under a magnetar\'s field (circuit 5, positron accumulator): the seed plasma boils only at SGR 1806-20 orbit. The gamma laser module times the field\'s pulse and wears out one run in sixteen; what the trap misses condenses back as an empty Penning trap nine times in ten.'],
        ['emi.grindless.info.magnetic_pair_converter.2',
            'SGR 1806-20 has no absorber tile: the escaping electrons and the split gamma photons have no item here and are not voided into one, they simply leave the frame with the field\'s own losses.'],
        ['emi.grindless.info.magnetic_pair_converter.1',
            'The electron beam furnace seals the unsealed cell with a fresh zirconium getter (circuit 23). Dense positron cells feed the antihydrogen foundry (B3) and replication forge lines (D3); their consumers return traps at 90%.'],

        ['emi.grindless.info.field_frozen_casing.0',
            'The Magnetic Pair Converter\'s structure block: field-frozen plate on a tungstensteel frame. Two come from the field-frozen press (circuit 3, OpV-A3) at SGR 1806-20 orbit. The converter is its only user for now; the kugelblitz forge (D3) will use it too.'],

        ['gtceu.recipe.grindless_positron_accumulation.seed_plasma',
            'Circuit 5: a positron cartridge and an empty Penning trap are packed into a seed positron plasma for the magnetic pair converter.'],
        ['gtceu.recipe.grindless_electron_beam.positron_cell_seal',
            'Circuit 23: an unsealed positron cell is sealed with a fresh zirconium getter into a dense positron cell.'],
        ['gtceu.recipe.grindless_magnetic_pair_production.boil_seed_plasma',
            'Circuit 1: the magnetar\'s field boils a seed plasma into hot pair plasma; the gamma laser module wears out one run in sixteen. An empty Penning trap condenses back nine times in ten.'],
        ['gtceu.recipe.grindless_magnetic_pair_production.seal_positron_cell',
            'Circuit 2: the hot pair plasma is loaded into an empty Penning trap and cooled into an unsealed positron cell.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
