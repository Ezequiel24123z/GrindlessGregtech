// priority: -24532
// -----------------------------------------------------------------------------------------------
// The UXV machine casing's research (docs/eras/uiv.md "Gate to UXV", package UIV-B5). The warp gate's c7 hold row lives in
// data/grindless/tables/gate.json, read by server_scripts/grindless/uhv/gate.js (the UHV-B7 table loader).
//
//   gtceu:assembly_line  gtceu:uxv_machine_casing (GTM registers it without a recipe; it keeps its id), researched with the Kerr chart
//                        (grindless:kerr_chart: made only by the Matrioshka's correlated Kerr data line). stationResearch makes the
//                        research_station row; nothing else researches the casing. No UXV hull, nothing of MAX or MAX+ (DECISIONS.md:450).
// Published for the tests: global.grindless.uivGate.casing, .skipped.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uiv] '
  var G = global.grindless || (global.grindless = {})
  var UG = G.uivGate || (G.uivGate = {})
  var VA_UHV = 1966080
  var VA_UEV = 7864320
  var CHART = 'grindless:kerr_chart'
  var CASING = 'gtceu:uxv_machine_casing'
  var CWUT = 512

  UG.skipped = []

  function addCasing(event) {
    var inputs = ['2x gtceu:uiv_machine_casing', '2x gtceu:uiv_field_generator', '4x gtceu:uiv_emitter', '2x gtnn:optical_mainframe']
    var missing = [CASING, CHART].concat(inputs.map(function (s) { return s.substring(s.indexOf(' ') + 1) }))
      .filter(function (x) { return !Item.exists(x) })
    if (!Fluid.exists('gtceu:soldering_alloy')) missing.push('gtceu:soldering_alloy')
    if (missing.length > 0) throw new Error('unknown: ' + missing.join(', '))
    var b = event.recipes.gtceu.assembly_line('grindless:uxv_machine_casing')
    inputs.forEach(function (s) { b.itemInputs(s) })
    b.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152))
    b.itemOutputs('2x ' + CASING).EUt(VA_UEV).duration(800)
    b.stationResearch(function (r) { return r.researchStack(Item.of(CHART)).CWUt(CWUT).EUt(VA_UHV) })
    UG.casing = { id: 'grindless:assembly_line/uxv_machine_casing', items: inputs, output: '2x ' + CASING, research: CHART, cwut: CWUT,
      researchEUt: VA_UHV, eut: VA_UEV, duration: 800 }
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addCasing(event)
    } catch (e) {
      UG.skipped.push({ name: 'uxv_machine_casing', reason: String(e) })
      console.info(LOG + 'gate casing skipped: ' + e)
    }
  })
})()
