// priority: -20004
// Gregtech Grindless - the MAX wireless tier's own recipes (package MAX-W, docs/eras/max.md 'W. Wireless case 14'). The MAX row of
// tables/wireless_energy.json gives lv/wireless_energy.js (and its startup twin, withTiers case 14) the hatches and covers; its cell has a
// cellMadeBy, so that script makes no cell, and this one makes the cell and the row's link, both assembler rows at VA[MAX]:
//
//   grindless:horizon_strand_repeater   the MAX link: two horizon strand wires round the OpV link (the chain strand repeater), timed by a
//                                       MAX sensor
//   grindless:max_smes_cell             the MAX cell (64,424,509,440,000 EU, four OpV cells' worth): the cold SMES toroids of line L27 on
//                                       horizon strand wire, held by two MAX field generators
//
// The MAX parts (the sensor, the field generator, the horizon strand wire) only exist after A2, so until then these rows are skipped with
// a logged error and listed in pendingRoutes (the integrator turns them on with A2). The cold SMES toroid is the line's result and is
// made on older machines now (coated conductor line, oxide PLD, HTS magnet works, naquadria magnet works, helium refrigerator).
(function () {
  const LOG = '[grindless/max_wireless] '
  const MAXT = 14
  global.grindless = global.grindless || {}
  const MW = global.grindless.maxWireless = { recipes: [], pendingRoutes: [] }
  const ROWS = [
    { name: 'horizon_strand_repeater', items: ['2x gtceu:horizon_strand_single_wire', '1x grindless:chain_strand_repeater', '1x grindless:max_sensor'],
      fluids: [['gtceu:soldering_alloy', 144], ['gtceu:lubricant', 100]], out: 'grindless:horizon_strand_repeater', duration: 300 },
    { name: 'max_smes_cell', items: ['16x gtceu:horizon_strand_single_wire', '4x grindless:cold_smes_toroid', '2x grindless:max_field_generator'],
      fluids: [], out: 'grindless:max_smes_cell', duration: 600 }
  ]
  MW.rows = ROWS

  ServerEvents.recipes(function (event) {
    var eut = Number(GTValues.VA[MAXT])
    ROWS.forEach(function (r) {
      var ids = r.items.map(function (s) { return s.replace(/^\d+x /, '') }).concat([r.out])
      var missing = ids.filter(function (id) { return !Item.exists(id) }).concat(r.fluids.map(function (f) { return f[0] }).filter(function (id) { return !Fluid.exists(id) }))
      if (missing.length > 0) {
        console.error(LOG + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        MW.pendingRoutes.push(r.out)
        return
      }
      var b = event.recipes.gtceu.assembler('grindless:' + r.name)
      r.items.forEach(function (s) { b.itemInputs(s) })
      r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
      b.itemOutputs(r.out)
      b.EUt(eut).duration(r.duration)
      MW.recipes.push('grindless:assembler/' + r.name)
    })
  })
})()
