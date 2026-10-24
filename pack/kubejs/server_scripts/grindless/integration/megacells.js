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

  ServerEvents.recipes(function (event) {
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
})()
