// -----------------------------------------------------------------------------------------------
// The MAX machine casing's research (docs/eras/opv.md "Gate to MAX", package OpV-G1). The warp gate's c13 hold row lives in
// data/grindless/tables/gate.json, read by server_scripts/grindless/uhv/gate.js.
//
//   gtceu:assembly_line  gtceu:max_machine_casing (GTM registers it without a recipe; it keeps its id), researched with the Sgr A* chart
//                        (grindless:sgr_a_chart: made only by the warp gate's c13 hold). stationResearch makes the research_station row;
//                        nothing else researches the casing. Only the casing: no MAX hull, hatch or product, and no Sgr A* place. The
//                        substage `max` is the tier model's grant of that research (tools/analysis/tiers), not a script.
// Published for the tests: global.grindless.opvGate.casing, .skipped.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var OG = G.opvGate || (G.opvGate = {})
  var VA_UXV = 125829120
  var VA_OPV = 503316480
  var CHART = 'grindless:sgr_a_chart'
  var CASING = 'gtceu:max_machine_casing'
  var CWUT = 2048
  var FLUIDS = [['gtceu:soldering_alloy', 2304], ['gtceu:lubricant', 1000]]

  OG.skipped = []

  function addCasing(event) {
    var inputs = ['2x gtceu:opv_machine_casing', '2x gtceu:opv_field_generator', '4x gtceu:opv_emitter', '2x gtceu:opv_sensor',
      '2x grindless:tetron_array', '2x grindless:chain_lamina_stack', '8x gtceu:chain_strand_single_wire', '2x grindless:gamma_multilayer_mirror']
    var missing = [CASING, CHART].concat(inputs.map(function (s) { return s.substring(s.indexOf(' ') + 1) }))
      .filter(function (x) { return !Item.exists(x) })
    FLUIDS.forEach(function (f) { if (!Fluid.exists(f[0])) missing.push(f[0]) })
    if (missing.length > 0) throw new Error('unknown: ' + missing.join(', '))
    var b = event.recipes.gtceu.assembly_line('grindless:max_machine_casing')
    inputs.forEach(function (s) { b.itemInputs(s) })
    FLUIDS.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
    b.itemOutputs('2x ' + CASING).EUt(VA_OPV).duration(1200)
    b.stationResearch(function (r) { return r.researchStack(Item.of(CHART)).CWUt(CWUT).EUt(VA_UXV) })
    OG.casing = { id: 'grindless:assembly_line/max_machine_casing', items: inputs, output: '2x ' + CASING, research: CHART, cwut: CWUT,
      researchEUt: VA_UXV, eut: VA_OPV, duration: 1200 }
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addCasing(event)
    } catch (e) {
      OG.skipped.push({ name: 'max_machine_casing', reason: String(e) })
      console.info(LOG + 'gate casing skipped: ' + e)
    }
  })
})()
