// -----------------------------------------------------------------------------------------------
// The OpV machine casing's research (docs/eras/uxv.md "Gate to OpV", package UXV-B6). The warp gate's c10 hold row lives in
// data/grindless/tables/gate.json, read by server_scripts/grindless/uhv/gate.js; the arm chart's row lives in
// data/grindless/tables/matrioshka.json, read by server_scripts/grindless/uiv/matrioshka.js.
//
//   gtceu:assembly_line  gtceu:opv_machine_casing (GTM registers it without a recipe; it keeps its id), researched with the bulge chart
//                        (grindless:bulge_chart: made only by the warp gate's c10 hold). stationResearch makes the research_station row;
//                        nothing else researches the casing. No OpV hull or hatch, nothing of MAX or MAX+ (DECISIONS.md:450). The
//                        substage `opv` is the tier model's grant of that research (tools/analysis/tiers), not a script.
// Published for the tests: global.grindless.uxvGate.casing, .skipped.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uxv] '
  var G = global.grindless || (global.grindless = {})
  var UG = G.uxvGate || (G.uxvGate = {})
  var VA_UIV = 31457280
  var VA_UXV = 125829120
  var CHART = 'grindless:bulge_chart'
  var CASING = 'gtceu:opv_machine_casing'
  var CWUT = 1024

  UG.skipped = []

  function addCasing(event) {
    var inputs = ['2x gtceu:uxv_machine_casing', '2x gtceu:uxv_field_generator', '4x gtceu:uxv_emitter', '2x gtnn:spintronic_mainframe']
    var missing = [CASING, CHART].concat(inputs.map(function (s) { return s.substring(s.indexOf(' ') + 1) }))
      .filter(function (x) { return !Item.exists(x) })
    if (!Fluid.exists('gtceu:soldering_alloy')) missing.push('gtceu:soldering_alloy')
    if (missing.length > 0) throw new Error('unknown: ' + missing.join(', '))
    var b = event.recipes.gtceu.assembly_line('grindless:opv_machine_casing')
    inputs.forEach(function (s) { b.itemInputs(s) })
    b.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152))
    b.itemOutputs('2x ' + CASING).EUt(VA_UXV).duration(800)
    b.stationResearch(function (r) { return r.researchStack(Item.of(CHART)).CWUt(CWUT).EUt(VA_UIV) })
    UG.casing = { id: 'grindless:assembly_line/opv_machine_casing', items: inputs, output: '2x ' + CASING, research: CHART, cwut: CWUT,
      researchEUt: VA_UIV, eut: VA_UXV, duration: 800 }
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addCasing(event)
    } catch (e) {
      UG.skipped.push({ name: 'opv_machine_casing', reason: String(e) })
      console.info(LOG + 'gate casing skipped: ' + e)
    }
  })
})()
