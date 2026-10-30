// priority: -23102
// -----------------------------------------------------------------------------------------------
// The UIV machine casing's research (docs/eras/uev.md "Gate to UIV", package UEV-B5). The warp gate's c3 row lives in
// server_scripts/grindless/uhv/gate.js (the UHV-B7 table loader), because the gate type's rows are generated there.
//
//   gtceu:assembly_line  gtceu:uiv_machine_casing (GTM registers it without a recipe; it keeps its id), researched with the pulsar
//                        navigation chart (grindless:pulsar_navigation_chart: made only by the pulsar timing station at Alpha Centauri
//                        AB's orbit). Nothing else researches the casing; nothing of MAX+ (DECISIONS.md:450).
// Published for the tests: global.grindless.uevGate.casing, .skipped.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var UG = G.uevGate || (G.uevGate = {})
  var VA_UV = 491520
  var VA_UEV = 7864320
  var CHART = 'grindless:pulsar_navigation_chart'
  var CASING = 'gtceu:uiv_machine_casing'
  var CWUT = 256

  UG.skipped = []

  function addCasing(event) {
    var inputs = ['2x gtceu:uev_machine_casing', '2x gtceu:uev_field_generator', '4x gtceu:uev_emitter', '2x gtnn:optical_computer']
    var missing = [CASING, CHART].concat(inputs.map(function (s) { return s.substring(s.indexOf(' ') + 1) }))
      .filter(function (x) { return !Item.exists(x) })
    if (!Fluid.exists('gtceu:soldering_alloy')) missing.push('gtceu:soldering_alloy')
    if (missing.length > 0) throw new Error('unknown: ' + missing.join(', '))
    var b = event.recipes.gtceu.assembly_line('grindless:uiv_machine_casing')
    inputs.forEach(function (s) { b.itemInputs(s) })
    b.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152))
    b.itemOutputs('2x ' + CASING).EUt(VA_UEV).duration(800)
    b.stationResearch(function (r) { return r.researchStack(Item.of(CHART)).CWUt(CWUT).EUt(VA_UV) })
    UG.casing = { id: 'grindless:assembly_line/uiv_machine_casing', items: inputs, output: '2x ' + CASING, research: CHART, cwut: CWUT,
      researchEUt: VA_UV, eut: VA_UEV, duration: 800 }
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addCasing(event)
    } catch (e) {
      UG.skipped.push({ name: 'uiv_machine_casing', reason: String(e) })
      console.error(LOG + 'gate casing failed: ' + e)
    }
  })
})()
