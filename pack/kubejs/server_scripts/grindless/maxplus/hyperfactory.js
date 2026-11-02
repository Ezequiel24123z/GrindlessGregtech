// priority: -20248
// MAX+ machine 15, the Hyperfactory, and its parallel hatch (docs/eras/maxplus.md, 'Hyperfactory' and Controllers; package XP-M1). The hatch is registered in
// startup_scripts/grindless/lib/parallel_hatch.js (gtceu:max_maxplus_parallel_hatch, x4,194,304), the machine in startup_scripts/grindless/maxplus/hyperfactory.js.
//
//   hatch        assembly line at VA[MAX], station research on the MAX hatch: a MAX hull, MAX+ components, 4 MAX circuits, kerr condensate
//   controller   the design's base: MAX hull, 2 horizon casings, 8 horizon processors, 4 MAX circuits, 2,000 mB kerr condensate, 8 MAX+ components from 4 families
//
// Published for the tests: global.grindless.hyperfactoryRecipes { hatch, controller, skipped }. Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus_hyperfactory] '
  var G = global.grindless || (global.grindless = {})
  var HR = G.hyperfactoryRecipes || (G.hyperfactoryRecipes = {})
  HR.skipped = []
  HR.hatch = 'grindless:assembly_line/maxplus_parallel_hatch'
  HR.controller = 'grindless:assembly_line/hyperfactory'

  var VA_MAX = Number(GTValues.VA[14])
  var KERR = 'gtceu:kerr_condensate'
  var HULL = 'gtceu:max_machine_hull'
  var CIRCUIT = '#gtceu:circuits/max'

  var HATCH = { out: 'gtceu:max_maxplus_parallel_hatch', research: 'gtceu:max_parallel_hatch', cwut: 128, duration: 2400,
    items: ['1x ' + HULL, '4x grindless:maxplus_field_generator', '4x grindless:maxplus_robot_arm', '2x grindless:maxplus_sensor', '4x ' + CIRCUIT],
    fluids: [[KERR, 4000]] }
  var CONTROLLER = { out: 'gtceu:hyperfactory', research: 'grindless:horizon_photonic_engine', cwut: 64,
    items: ['1x ' + HULL, '2x grindless:horizon_machine_casing', '8x #gtceu:circuits/maxplus', '4x ' + CIRCUIT, '1x gtceu:max_parallel_hatch',
      '2x grindless:maxplus_conveyor_module', '2x grindless:maxplus_robot_arm', '2x grindless:maxplus_field_generator', '2x grindless:maxplus_sensor'],
    fluids: [[KERR, 2000]] }
  HR.specs = { hatch: HATCH, controller: CONTROLLER }

  function idOf(s) { return String(s).replace(/^\d+x /, '') }

  function missingIds(spec) {
    var items = spec.items.map(idOf).concat([spec.out, spec.research])
    var fluids = spec.fluids.map(function (f) { return f[0] })
    return items.filter(function (id, k) { return id.charAt(0) !== '#' && items.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id) { return !Fluid.exists(id) }))
  }

  function skip(name, reason) {
    HR.skipped.push({ name: name, reason: reason })
    console.error(LOG + 'skipped ' + name + ': ' + reason)
  }

  function add(event, name, spec, duration) {
    var missing = missingIds(spec)
    if (missing.length > 0) return skip(name, 'unknown id(s): ' + missing.join(', '))
    var a = event.recipes.gtceu.assembly_line('grindless:' + name)
    spec.items.forEach(function (s) { a.itemInputs(s) })
    spec.fluids.forEach(function (f) { a.inputFluids(Fluid.of(f[0], f[1])) })
    a.itemOutputs(spec.out)
    a.stationResearch(function (r) { return r.researchStack(Item.of(spec.research)).CWUt(spec.cwut).EUt(VA_MAX) })
    return a
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      HR.skipped = []
      var h = add(event, 'maxplus_parallel_hatch', HATCH)
      if (h) h.EUt(VA_MAX).duration(HATCH.duration)
      var c = add(event, 'hyperfactory', CONTROLLER)
      if (c) c.EUt(VA_MAX).duration(4800)
      console.info(LOG + '2 recipes; skipped ' + HR.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
