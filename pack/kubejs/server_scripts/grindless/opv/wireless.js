// priority: -21490
// Gregtech Grindless - the OpV wireless tier's own recipes (package OpV-W, docs/eras/opv.md 'W. Wireless case 13'). The OpV row of
// tables/wireless_energy.json gives server_scripts/grindless/lv/wireless_energy.js the hatches and covers; its cell has a cellMadeBy,
// so that script makes no cell, and this one makes the cell and the row's link:
//
//   grindless:chain_strand_repeater   the OpV link: two chain strand wires round the UXV link (the pasta strand repeater), timed by a
//                                     tetron die (the UXV repeater's recipe, uxv/vela_pasta.js line 48, one tier up)
//   grindless:opv_smes_cell           the OpV cell (16,106,127,360,000 EU, four UXV cells' worth): chain strand wound on chain lamina
//                                     stacks, held by two OpV field generators
//
// Both are assembler rows at VA[OpV] (503,316,480 EU/t): GCYM's large assembler on two UXV 4 A hatches until A4 gives
// gtceu:opv_assembler its recipe (docs/eras/opv.md 'Voltages and controllers'). Their inputs come from A0 (the strand wire, the lamina
// stack), A2 (the die) and A3 (the field generator).
(function () {
  const LOG = '[grindless/opv_wireless] '
  const OPV = 13
  global.grindless = global.grindless || {}
  const OW = global.grindless.opvWireless = { recipes: [] }
  const ROWS = [
    { name: 'chain_strand_repeater', items: ['2x gtceu:chain_strand_single_wire', '1x grindless:pasta_strand_repeater', '1x grindless:tetron_die'],
      fluids: [['gtceu:soldering_alloy', 144], ['gtceu:lubricant', 100]], out: 'grindless:chain_strand_repeater', duration: 300 },
    { name: 'opv_smes_cell', items: ['16x gtceu:chain_strand_single_wire', '4x grindless:chain_lamina_stack', '2x gtceu:opv_field_generator'],
      fluids: [], out: 'grindless:opv_smes_cell', duration: 600 }
  ]
  OW.rows = ROWS

  ServerEvents.recipes(function (event) {
    var eut = Number(GTValues.VA[OPV])
    ROWS.forEach(function (r) {
      var ids = r.items.map(function (s) { return s.replace(/^\d+x /, '') }).concat([r.out])
      var missing = ids.filter(function (id) { return !Item.exists(id) }).concat(r.fluids.map(function (f) { return f[0] }).filter(function (id) { return !Fluid.exists(id) }))
      if (missing.length > 0) {
        console.error(LOG + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembler('grindless:' + r.name)
      r.items.forEach(function (s) { b.itemInputs(s) })
      r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
      b.itemOutputs(r.out)
      b.EUt(eut).duration(r.duration)
      OW.recipes.push('grindless:assembler/' + r.name)
    })
  })
})()
