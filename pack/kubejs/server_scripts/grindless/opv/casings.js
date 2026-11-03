// The OpV casing family (D5-CAS-OPV, docs/eras/lines-opv-maxplus.md 7.1): the casings the bulge-era multiblocks are built from.
//   gtceu:assembler        grindless:chain_lamina_casing   4 chain lamina stacks + 8 chain strand wires + neutronium plate and frame -> 4
//   gtceu:assembler        grindless:tpv_wall_casing       2 TPV panels + absorber tile + 2 copper plates + a lamina stack -> 4
//   gtceu:assembly_line    grindless:kugelblitz_cavity_casing  (station research: the gamma multilayer mirror) -> 2
// The three older casings are retuned where they are made (field press c3, opv/antimatter.js, opv/beam_hardware.js).
// Published for the tests: global.grindless.opvCasings.recipes (ids made) and .skipped (ids with their reason).
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var C = G.opvCasings || (G.opvCasings = {})
  C.recipes = []
  C.skipped = []

  var ROWS = [
    { id: 'chain_lamina_casing', type: 'assembler', out: 4, eut: 503316480, duration: 200, fluid: 500,
      items: ['4x grindless:chain_lamina_stack', '8x gtceu:chain_strand_single_wire', '2x gtceu:neutronium_plate', 'gtceu:neutronium_frame', '2x gtceu:tungsten_plate', '2x gtceu:stainless_steel_plate'] },
    { id: 'tpv_wall_casing', type: 'assembler', out: 4, eut: 503316480, duration: 400, fluid: 250,
      items: ['2x grindless:tpv_panel', 'grindless:gamma_absorber_tile', '2x gtceu:copper_plate', 'grindless:chain_lamina_stack', '2x gtceu:tungsten_plate', '2x gtceu:stainless_steel_plate'] },
    { id: 'kugelblitz_cavity_casing', type: 'assembly_line', out: 2, eut: 503316480, duration: 600,
      research: 'grindless:gamma_multilayer_mirror',
      items: ['grindless:gamma_multilayer_mirror', '2x grindless:field_frozen_plate', 'grindless:annihilation_shield_casing', '4x gtceu:chain_strand_single_wire'] }
  ]

  function bare(s) { return s.replace(/^\d+x /, '') }

  function add(event, row) {
    var ids = row.items.map(bare).concat(['grindless:' + row.id])
    var missing = ids.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + row.id + ' recipe skipped, unknown id(s): ' + missing.join(', '))
      C.skipped.push(row.id + ': ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu[row.type]('grindless:' + row.id)
    row.items.forEach(function (s) { b.itemInputs(s) })
    if (row.fluid) b.inputFluids(Fluid.of('gtceu:superfluid_helium_3', row.fluid))
    b.itemOutputs(row.out + 'x grindless:' + row.id)
    if (row.research) {
      b.stationResearch(function (r) { return r.researchStack(Item.of(row.research)).dataStack(Item.of('gtceu:data_module')).CWUt(256).EUt(row.eut) })
    }
    b.EUt(row.eut).duration(row.duration)
    C.recipes.push('grindless:' + row.id)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    ROWS.forEach(function (row) {
      try {
        add(event, row)
      } catch (e) {
        console.error(LOG + row.id + ' failed: ' + e)
        C.skipped.push(row.id + ': ' + e)
      }
    })
  })
})()
