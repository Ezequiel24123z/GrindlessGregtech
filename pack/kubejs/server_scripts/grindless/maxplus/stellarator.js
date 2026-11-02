// priority: -20302
// MAX+ machine 18, the polarized fusion stellarator, and line P26, spin-polarized fusion fuel (docs/eras/maxplus.md "Polarized fusion stellarator
// (machine 18, B13-PWRD)"; package B13-STEL).
//
//   P26 spin-polarized fuel  chemical reactor -> hd_equilibrium_mix; distillation tower -> pure_hd (the hydrogen and deuterium go back to d1);
//                            millikelvin cryostat works (nuclear_demagnetisation) -> frozen_spin_hd; extruder -> polarized_hd_pellet;
//                            photonic foundry (optical pumping, wears a MAX+ emitter 1 in 64) -> polarized_helium_3 from pristine_helium_3 (P10)
//
// The plant's row (gtceu:polarized_fusion, circuit 1): 4 pellets and 1,000 mB of polarized helium-3 make 1,000 mB of helium-4 ash and 2,000 mB of hydrogen
// at 2^34 EU/t out for 3,600 t, one run; the machine runs up to 64 of them at once (lib/generators.js, limited by its dynamo hatches and its fuel). It wears a
// neutral beam injector (1 in 64), a direct converter stack (1 in 128) and an sCO2 turbine module (1 in 128). Rule 10: no row has a site, the fuel ships.
// Circuits: d1 to d4 and h1 have unique inputs and take none. Published for the tests: global.grindless.maxPlusStellarator { rows, controllers, skipped }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus_stellarator] '
  var G = global.grindless || (global.grindless = {})
  var MS = G.maxPlusStellarator || (G.maxPlusStellarator = {})
  MS.skipped = []

  function va(t) { return Number(GTValues.VA[t]) }
  var VA_MAX = va(14)
  var KERR = 'gtceu:kerr_condensate'
  var HULL = 'gtceu:max_machine_hull'
  var KEY = 'grindless_polarized_fusion'

  // type, name, circuit (none: 0), items in, kept (not consumed), wear (chanced inputs: [id, chance of 10000]), fluids in, items out, fluids out, EU/t, ticks
  var ROWS = [
    // d1 isotope exchange
    { type: 'chemical_reactor', name: 'hd_equilibrium_mix', eut: va(7), duration: 400, kept: ['gtceu:platinum_dust'],
      fluids: [['gtceu:primordial_deuterium', 1000], ['gtceu:hydrogen', 1000]], fluidOuts: [['gtceu:hd_equilibrium_mix', 2000]] },
    // d2 cryogenic distillation: the hydrogen and the deuterium go back to d1
    { type: 'distillation_tower', name: 'pure_hd', eut: va(7), duration: 400,
      fluids: [['gtceu:hd_equilibrium_mix', 2000]], fluidOuts: [['gtceu:pure_hd', 1000], ['gtceu:hydrogen', 500], ['gtceu:primordial_deuterium', 500]] },
    // d3 brute-force polarization (crossing: the millikelvin cryostat works)
    { type: 'nuclear_demagnetisation', name: 'frozen_spin_hd', eut: va(14), duration: 2400, key: 'grindless_nuclear_demagnetisation',
      fluids: [['gtceu:pure_hd', 2000]], outs: [['grindless:frozen_spin_hd', 1]] },
    // d4 pellet extrusion
    { type: 'extruder', name: 'polarized_hd_pellet', eut: va(7), duration: 200, kept: ['gtceu:rod_extruder_mold'],
      items: [['grindless:frozen_spin_hd', 1]], outs: [['grindless:polarized_hd_pellet', 4]] },
    // h1 optical pumping (crossing: the photonic foundry; the 1,083 nm pump is a MAX+ emitter)
    { type: 'photonic_foundry', name: 'polarized_helium_3', eut: va(13), duration: 1200, key: 'grindless_photonic_foundry',
      wear: [['grindless:max_emitter', 156]], fluids: [['gtceu:pristine_helium_3', 1000]], fluidOuts: [['gtceu:polarized_helium_3', 1000]] },
    // the plant's own row: 2^34 EU/t out per run
    { type: 'polarized_fusion', name: 'helium_4_ash', circuit: 1, eut: -Math.pow(2, 34), duration: 3600, key: KEY,
      items: [['grindless:polarized_hd_pellet', 4]],
      wear: [['grindless:neutral_beam_injector', 156], ['grindless:direct_converter_stack', 78], ['grindless:sco2_turbine_module', 78]],
      fluids: [['gtceu:polarized_helium_3', 1000]], fluidOuts: [['gtceu:helium_4_ash', 1000], ['gtceu:hydrogen', 2000]] }
  ]
  MS.rows = ROWS

  var CASING = 'grindless:horizon_machine_casing'
  var CONTROLLERS = [
    { name: 'polarized_fusion_stellarator', machine: 'gtceu:polarized_fusion_stellarator', research: 'grindless:frozen_spin_hd', casing: CASING,
      comps: ['2x grindless:maxplus_field_generator', '2x grindless:maxplus_sensor', '2x grindless:maxplus_emitter', '2x grindless:maxplus_electric_pump'],
      plates: ['1x gtceu:primordial_fusion_torus', '4x grindless:sco2_turbine_module', '4x grindless:direct_converter_stack', '4x grindless:neutral_beam_injector'] }
  ]
  MS.controllers = CONTROLLERS

  function missingIds(ids, fluids) {
    return ids.filter(function (id, k) { return String(id).charAt(0) !== '#' && ids.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id, k) { return fluids.indexOf(id) === k && !Fluid.exists(id) }))
  }
  function pairs(list, k) { return (list[k] || []).map(function (x) { return x[0] }) }
  function idOf(s) { return s.replace(/^\d+x /, '') }

  function skip(name, reason) {
    MS.skipped.push({ name: name, reason: reason })
    console.error(LOG + 'skipped ' + name + ': ' + reason)
  }

  function addRow(event, r) {
    var ids = pairs(r, 'items').concat(pairs(r, 'wear'), pairs(r, 'outs'), r.kept || [])
    var fluids = pairs(r, 'fluids').concat(pairs(r, 'fluidOuts'))
    var missing = missingIds(ids, fluids)
    if (missing.length > 0) return skip(r.type + '/' + r.name, 'unknown id(s): ' + missing.join(', '))
    var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
    ;(r.items || []).forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    ;(r.kept || []).forEach(function (x) { b.notConsumable(x) })
    ;(r.wear || []).forEach(function (x) { b.chancedInput('1x ' + x[0], x[1], 0) })
    if (r.circuit) b.circuit(r.circuit)
    ;(r.fluids || []).forEach(function (x) { b.inputFluids(Fluid.of(x[0], x[1])) })
    ;(r.outs || []).forEach(function (x) { b.itemOutputs(x[1] + 'x ' + x[0]) })
    ;(r.fluidOuts || []).forEach(function (x) { b.outputFluids(Fluid.of(x[0], x[1])) })
    if (r.key) b.addDataString(r.key, r.name)
    b.EUt(r.eut).duration(r.duration)
  }

  function addAssemblyLine(event, name, spec, items, fluids, out, research, cwut, duration) {
    var ids = items.map(idOf).concat([out, research])
    var missing = missingIds(ids, fluids.map(function (f) { return f[0] }))
    if (missing.length > 0) return skip(name, 'unknown id(s): ' + missing.join(', '))
    var a = event.recipes.gtceu.assembly_line('grindless:' + name)
    items.forEach(function (s) { a.itemInputs(s) })
    fluids.forEach(function (f) { a.inputFluids(Fluid.of(f[0], f[1])) })
    a.itemOutputs(out)
    a.stationResearch(function (r) { return r.researchStack(Item.of(research)).CWUt(cwut).EUt(VA_MAX) })
    a.EUt(VA_MAX).duration(duration)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      MS.skipped = []
      ROWS.forEach(function (r) { addRow(event, r) })
      CONTROLLERS.forEach(function (c) {
        var items = ['1x ' + HULL, '2x ' + c.casing, '8x #gtceu:circuits/maxplus', '4x #gtceu:circuits/max'].concat(c.comps, c.plates)
        addAssemblyLine(event, c.name, c, items, [[KERR, 2000]], c.machine, c.research, 64, 4800)
      })
      console.info(LOG + (ROWS.length + CONTROLLERS.length) + ' rows; skipped ' + MS.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
