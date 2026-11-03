// priority: 5766
// Gregtech Grindless - names and tooltips of OpV's field-frozen press, its items and the package's older rows
// (startup_scripts/grindless/opv/field_press.js; package OpV-A3):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   item.grindless.<id>, tooltip.grindless.<id>.N      the package's items
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controller
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.field_frozen_press', 'Field-Frozen Press'],
        ['gtceu.field_freezing', 'Field Freezing'],

        ['grindless.machine.field_frozen_press.tooltip.0',
            '\u00a77Presses canned chain laminae while a magnetar field freezes into them.'],

        ['item.grindless.field_canned_stack', 'Field-Canned Stack'],
        ['tooltip.grindless.field_canned_stack.0', 'A chain lamina stack sealed in a tungsten-rhenium can.'],
        ['tooltip.grindless.field_canned_stack.1', 'Pressed at SGR 1806-20 into a field-frozen billet.'],
        ['item.grindless.field_frozen_billet', 'Field-Frozen Billet'],
        ['tooltip.grindless.field_frozen_billet.0', 'Chain laminae holding a frozen magnetar field (named fiction).'],
        ['tooltip.grindless.field_frozen_billet.1', 'Rolled into field-frozen plates by the same press.'],
        ['item.grindless.spent_field_can', 'Spent Field Can'],
        ['tooltip.grindless.spent_field_can.0', 'The tungsten-rhenium can left after pressing.'],
        ['tooltip.grindless.spent_field_can.1', 'Re-melted in the electron beam furnace: 80% comes back.'],

        ['item.grindless.aln_powder', 'AlN Powder'],
        ['tooltip.grindless.aln_powder.0', 'Aluminium nitride from aluminium in a nitrogen stream.'],
        ['tooltip.grindless.aln_powder.1', 'Grown into AlN boules by sublimation.'],
        ['item.grindless.aln_kerf', 'AlN Kerf'],
        ['tooltip.grindless.aln_kerf.0', 'What the saw takes when the AlN boule is sliced.'],
        ['tooltip.grindless.aln_kerf.1', 'Re-pressed into powder by the nitride magnet works.'],
        ['item.grindless.aln_boule', 'AlN Boule'],
        ['tooltip.grindless.aln_boule.0', 'An aluminium nitride single crystal: an ultra-wide bandgap substrate.'],
        ['tooltip.grindless.aln_boule.1', 'Sliced into wafers on a cutter.'],
        ['item.grindless.aln_wafer', 'AlN Wafer'],
        ['tooltip.grindless.aln_wafer.0', 'A polished aluminium nitride substrate.'],
        ['tooltip.grindless.aln_wafer.1', 'The MOCVD reactor grows AlGaN on it.'],
        ['item.grindless.algan_epi_wafer', 'AlGaN Epi Wafer'],
        ['tooltip.grindless.algan_epi_wafer.0', 'An AlGaN channel layer grown on aluminium nitride.'],
        ['tooltip.grindless.algan_epi_wafer.1', 'Its gates are drawn by the BEUV lithography cell.'],
        ['item.grindless.algan_patterned_wafer', 'Gated AlGaN Wafer'],
        ['tooltip.grindless.algan_patterned_wafer.0', 'AlGaN transistors with their gates written at 6.7 nm.'],
        ['tooltip.grindless.algan_patterned_wafer.1', 'Diced into power dies by the SiC device fab.'],

        ['emi.grindless.info.field_frozen_press.0',
            'The field is SGR 1806-20\'s: the press runs in the magnetar\'s orbit and nowhere else, on two UXV 4 A energy hatches, because the OpV hatches need its plate. Flux freezing in a superconducting stack is real; keeping a magnetar field in a billet is named fiction.'],
        ['emi.grindless.info.field_frozen_press.1',
            'The W-Re cans come from the electron beam furnace (circuit 22); the spent cans go back to it (circuit 22, other inputs) and return 80% of the 6N rhenium and the tungsten. The plates make the OpV field generator and energy hatches; the casing is for later OpV machines.'],

        ['gtceu.recipe.grindless_field_freezing.field_frozen_billet',
            'Circuit 1: four W-Re canned stacks pressed in the field into one billet; the four cans come off spent.'],
        ['gtceu.recipe.grindless_field_freezing.field_frozen_plate',
            'Circuit 2: the billet rolled into four field-frozen plates.'],
        ['gtceu.recipe.grindless_field_freezing.field_frozen_casing',
            'Circuit 3: four field-frozen plates and two chain field coils make two field-frozen casings.'],
        ['gtceu.recipe.grindless_electron_beam.field_can',
            'Circuit 22: a chain lamina stack canned in 6N rhenium and molten tungsten, welded shut by the beam.'],
        ['gtceu.recipe.grindless_electron_beam.field_can_remelt',
            'Circuit 22: five spent field cans re-melted; 80% of the rhenium and the tungsten come back.'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.aln_powder',
            'Circuit 16: aluminium nitrided in a nitrogen stream into AlN powder.'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.aln_kerf_repress',
            'Circuit 17: four AlN kerf re-pressed into three AlN powder.'],
        ['gtceu.recipe.grindless_crystal_growth.aln_boule',
            'Circuit 22: an AlN boule sublimed from the powder under nitrogen (not consumed).'],
        ['gtceu.recipe.grindless_beuv_lithography.algan_gates',
            'Circuit 9: the AlGaN epi wafer gated at 6.7 nm; the mirror comes out fouled (circuit 3 cleans it).'],
        ['gtceu.recipe.grindless_silicon_carbide.aln_power_die',
            'Circuit 8: the gated AlGaN wafer diced into four AlN power dies on copper with silver sinter.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
