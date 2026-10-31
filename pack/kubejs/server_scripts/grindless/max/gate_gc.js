// priority: -19964
// Gregtech Grindless - MAX-T1 "Gate c14 to Sgr A*" (docs/eras/max.md, Bridges). The warp gate's c14 row (hold_sgr_a_probe) is in
// data/grindless/tables/gate.json, read by server_scripts/grindless/uhv/gate.js; the platform it places is the sgra row of
// tables/relay_platforms.json, placed by uxv/kerr_sling.js (its poller matches the run's name to the row's jump); the max-sgra substage
// is the tier model's grant of the arrival (tools/analysis/tiers), not a script.
//
//   grindless:gc_relay_probe   gtceu:assembly_line at VA[OpV], researched with the Hawking drive: the galactic-centre probe. OpV hardware
//                              (exempt from the MAX component rule, Validator), so it can be built before any MAX part exists. The seed
//                              unfolds the platform from the feedstock it carries; the magsail (chain strand wire) brakes it in the hot gas.
//
// Published in global.grindless.maxGateGc: .probe, .recipes, .skipped.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/max_gate_gc] '
  var OPV = 13
  var G = global.grindless || (global.grindless = {})
  var MG = G.maxGateGc || (G.maxGateGc = {})
  MG.recipes = []
  MG.skipped = []

  var PROBE = {
    items: ['1x grindless:probe_seed', '1x grindless:hawking_drive', '64x gtceu:chain_strand_single_wire', '1x grindless:tetron_array',
      '1x grindless:vitamin_kit', '16x grindless:metal_feedstock', '8x grindless:cluster_sinter_casing', '4x gtceu:opv_sensor'],
    fluids: [['gtceu:soldering_alloy', 4608], ['gtceu:lubricant', 4000]],
    out: 'grindless:gc_relay_probe', research: 'grindless:hawking_drive', cwut: 256, researchEUt: 125829120, duration: 2400
  }
  MG.probe = PROBE

  function idOf(s) { return s.replace(/^\d+x /, '') }

  function addProbe(event) {
    var eut = Number(GTValues.VA[OPV])
    var ids = PROBE.items.map(idOf).concat([PROBE.out, PROBE.research])
    var missing = ids.filter(function (id) { return !Item.exists(id) })
    PROBE.fluids.forEach(function (f) { if (!Fluid.exists(f[0])) missing.push(f[0]) })
    if (missing.length > 0) {
      MG.skipped.push({ name: 'gc_relay_probe', missing: missing })
      console.error(LOG + 'gc_relay_probe skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:gc_relay_probe')
    PROBE.items.forEach(function (s) { b.itemInputs(s) })
    PROBE.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
    b.itemOutputs(PROBE.out)
    b.stationResearch(function (r) { return r.researchStack(Item.of(PROBE.research)).CWUt(PROBE.cwut).EUt(PROBE.researchEUt) })
    b.EUt(eut).duration(PROBE.duration)
    MG.recipes.push('grindless:assembly_line/gc_relay_probe')
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addProbe(event)
    } catch (e) {
      console.error(LOG + 'gc_relay_probe failed: ' + e)
    }
  })
})()
