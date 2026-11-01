// priority: 1000
// Gregtech Grindless - names and tooltips of ZPM's Naquadria Magnet Works (startup_scripts/grindless/zpm/magnet_works.js), its recipe type,
// the EMI line of each of its recipes, the controller's cold-test charge line, the HTS insert and the EMI info page text of the insert.
//
//   gtceu:naquadria_magnet_works / gtceu.naquadria_magnets          (machine name + tooltips, recipe type name)
//   gtceu.recipe.grindless_naquadria_magnets.<recipe name>          (EMI line of each recipe: what the circuit makes)
//   grindless.machine.naquadria_magnet_works.charge.ok|low          (controller line: the liquid helium in the input hatches)
//   item.grindless.hts_insert, tooltip.grindless.hts_insert.*       (the hybrid HTS insert)
//   emi.grindless.info.hts_insert.0                                 (its EMI info page)
// The ZPM SMES cell's and the ZPM wireless tier's names are in wireless_energy_lang.js (the table's rows).
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.naquadria_magnet_works', 'Naquadria Magnet Works')
    add('gtceu.naquadria_magnets', 'Naquadria Magnets')

    add('grindless.machine.naquadria_magnet_works.tooltip.0', '§7Makes SMES cells, URhNq2 wire and HTS inserts.')

    add('gtceu.recipe.grindless_naquadria_magnets.zpm_smes_cell', 'Circuit 1: the wireless network\'s ZPM cell, an SMES coil cold-tested in the helium charge')
    add('gtceu.recipe.grindless_naquadria_magnets.urhnq2_wire', 'Circuit 2: URhNq2 single wires, powder in the tube')
    add('gtceu.recipe.grindless_naquadria_magnets.hts_insert', 'Circuit 3: an HTS insert, a LuV HTS coil nested in URhNq2 winding')

    add('grindless.machine.naquadria_magnet_works.charge.ok', 'Liquid helium charge: %s mB (needs %s mB, never used up)')
    add('grindless.machine.naquadria_magnet_works.charge.low', 'Liquid helium charge: %s of %s mB. No cell starts without the full charge in an input hatch')

    add('item.grindless.hts_insert', 'HTS Insert')
    add('tooltip.grindless.hts_insert.0', 'A LuV HTS coil nested in URhNq2 winding.')
    add('tooltip.grindless.hts_insert.1', 'The field source of the ion implanter\'s magnet and the qubit fab.')
    add('emi.grindless.info.hts_insert.0', 'Wound in the Naquadria Magnet Works (circuit 3) from a LuV HTS coil and URhNq2 single wires. The ZPM machines that need a strong, steady field take it as their magnet.')
    add('emi.grindless.info.cryostat_casing.0', 'The Naquadria Magnet Works\' shell: a frostproof casing lined with gold and annealed copper plate, made in the assembler. It is the whole casing of that multiblock.')
})

