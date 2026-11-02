// priority: -15524
// -----------------------------------------------------------------------------------------------
// MEGA Cells (modId megacells) on the IV era (docs/eras/lv.md "Despues": MEGA Cells at IV, more than 256k; hv.md keeps it out of HV).
// Era: IV.
//
// Everything MEGA adds (1M-256M cell components, mega crafting units and storage, mega interface / pattern provider / energy
// cell, portable cells, compression and energy cards) is built from the ACCUMULATION PROCESSOR, so that is the only gate:
// its AE2 inscriber recipe (printed silicon + fluix dust + printed accumulation processor) is replaced by a GT circuit
// assembler recipe at IV (7 680 EU/t) that also asks for one IV circuit. The printed processor, its press (singularity),
// the sky steel ingot and the 256k components stay AE2's, so MEGA stays in reach of an AE2 network that has HV storage.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/megacells] '

  global.grindless.recipes('integration/megacells', function (event) {
    event.remove({ id: 'megacells:inscriber/accumulation_processor' })
    if (!Item.exists('megacells:accumulation_processor')) {
      console.warn(LOG + 'megacells:accumulation_processor does not exist; nothing added')
      return
    }
    event.recipes.gtceu.circuit_assembler('grindless:megacells/accumulation_processor')
      .itemInputs('ae2:printed_silicon', '#forge:dusts/fluix', 'megacells:printed_accumulation_processor', '#gtceu:circuits/iv')
      .itemOutputs('megacells:accumulation_processor')
      .EUt(7680)
      .duration(200)
    console.info(LOG + 'accumulation processor: AE2 inscriber recipe replaced by a GT circuit assembler recipe with an IV circuit')
  })

  // MAX+ (docs/eras/maxplus.md 'AE2', package XP-AE): only the true top is re-gated, with line A1's horizon storage die. The 256M
  // component (so every 256M cell, the 256M crafting storage and the portable 256M cells) and the bulk item cell. Everything
  // below stays as it was: the 1M to 64M components, mega crafting units, accelerators, interfaces, pattern providers, energy
  // cells, cards and the other portable cells keep their recipes and the accumulation-processor gate above.
  ServerEvents.recipes(function (event) {
    try {
      if (!Item.exists('grindless:horizon_storage_die')) {
        console.warn(LOG + 'grindless:horizon_storage_die does not exist; top tier not re-gated')
        return
      }
      var die = { item: 'grindless:horizon_storage_die' }
      event.remove({ id: 'megacells:cells/cell_component_256m' })
      event.custom({
        type: 'minecraft:crafting_shaped',
        category: 'misc',
        pattern: ['aba', 'cdc', 'aca'],
        key: {
          a: { item: 'ae2:matter_ball' },
          b: { item: 'megacells:accumulation_processor' },
          c: { item: 'megacells:cell_component_64m' },
          d: die
        },
        result: { item: 'megacells:cell_component_256m' }
      }).id('megacells:cells/cell_component_256m')
      event.remove({ id: 'megacells:cells/standard/bulk_item_cell' })
      event.custom({
        type: 'minecraft:crafting_shaped',
        category: 'misc',
        pattern: ['aea', 'bcb', 'ddd'],
        key: {
          a: { item: 'ae2:quartz_vibrant_glass' },
          b: { item: 'ae2:sky_dust' },
          c: { item: 'megacells:bulk_cell_component' },
          d: { item: 'minecraft:netherite_ingot' },
          e: die
        },
        result: { item: 'megacells:bulk_item_cell' }
      }).id('megacells:cells/standard/bulk_item_cell')
      console.info(LOG + 'MAX+: 256M component and bulk item cell re-gated with the horizon storage die')
    } catch (e) {
      console.error(LOG + 'top tier failed: ' + e)
    }
  })
})()
