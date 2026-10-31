// priority: -20019
// -----------------------------------------------------------------------------------------------
// MAX-D1 (docs/eras/max.md, L24 steps 3 and 5): the two GTM steps of the Penrose payload line, which have no older table of their own.
//
//   gtceu:lathe      compressed_payload_core -> turned_payload_core (turned to the capture bore).
//   gtceu:assembler  turned_payload_core + payload_casing -> max_penrose_payload, at VA[MAX] (2,013,265,920 EU/t) for 400 t. There is no
//                    gtceu:max_assembler: the row runs in gtceu:assembly_hall on two OpV 4 A hatches (decision 68).
//
// The other steps are rows of older machines: degenerate harvester c2 (tables/sirius.json), megabar c11 (tables/megabar.json), SPS c22
// (uhv/propulsion.js) and the Penrose engine c6 at Sgr A* (tables/cygnus.json), which returns one payload_casing for the assembler.
// Published for the smoke test: global.grindless.sgraModes.recipes, .skipped.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var SM = G.sgraModes || (G.sgraModes = {})
  SM.recipes = []
  SM.skipped = []

  var ROWS = [
    { type: 'lathe', name: 'turned_payload_core', eut: 1966080, duration: 600,
      items: ['1x grindless:compressed_payload_core'], fluids: [], out: 'grindless:turned_payload_core' },
    { type: 'assembler', name: 'max_penrose_payload', eut: 2013265920, duration: 400,
      items: ['1x grindless:turned_payload_core', '1x grindless:payload_casing', '2x grindless:mh_winding', '2x grindless:sic_sic_plate', '2x gtceu:tungsten_steel_plate'],
      fluids: [{ id: 'gtceu:liquid_helium', amount: 1000 }], out: 'grindless:max_penrose_payload' }
  ]

  ServerEvents.recipes(function (event) {
    ROWS.forEach(function (r) {
      var ids = r.items.map(function (s) { return s.replace(/^\d+x /, '') }).concat([r.out])
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        SM.skipped.push(r.name)
        console.error(LOG + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
      r.items.forEach(function (s) { b.itemInputs(s) })
      r.fluids.forEach(function (s) { b.inputFluids(Fluid.of(s.id, s.amount)) })
      b.itemOutputs(r.out)
      b.EUt(r.eut).duration(r.duration)
      SM.recipes.push('grindless:' + r.type + '/' + r.name)
    })
    console.info(LOG + 'sgra_modes: ' + SM.recipes.length + ' recipes; skipped ' + SM.skipped.length)
  })
})()
