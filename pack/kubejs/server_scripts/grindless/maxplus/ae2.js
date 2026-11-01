// priority: -20090
// MAX+ lines A1 to A3, the AE2 lines, on the older machines (docs/eras/maxplus.md 'Lines' and 'AE2'; package XP-AE).
// (no priority header: the integrator stamps it with tools/analysis/script-order.mjs --write)
//
//   A1 horizon storage die      MTJ c32 -> mram_stack_plus; BEUV c22 -> patterned_mram; racetrack fab c7 -> racetrack_3d_stack; GTM cutter -> horizon_storage_die
//   A2 photonic coprocessor     MOCVD c32 -> laser_array_wafer; TFLN ion slicing c20 -> ln_modulator_array; photonic foundry c32 -> optical_matrix_die;
//                               photonic integration hall c10 -> photonic_coprocessor
//   A3 pattern memory unit      crystal growth c32 -> fe_ln_boule; GTM cutter -> holographic_slab; femtosecond writer c21 -> addressed_holo_slab;
//                               spectral hole burner c27 -> burned_pattern_crystal; fibre draw c23 -> pattern_memory_unit
//
// Circuits are the first free ones of each older machine type counted in line-id order, built or not (maxplus.md 'Older machines'); the
// types already at 32 (MTJ, MOCVD, photonic foundry, crystal growth) share it and differ by item inputs, as maxplus/loom.js does. Every
// row's lookup is its own circuit or an item no other row of its type holds. Every output that is not the product is an inert gas
// returned to its line (argon, helium) or vented (nitrogen, ammonia reacted away), and no recipe time is inflated.
// Published for the tests: global.grindless.maxPlusAe2 { rows, cutters, skipped }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus_ae2] '
  var G = global.grindless || (global.grindless = {})
  var MA = G.maxPlusAe2 || (G.maxPlusAe2 = {})
  MA.skipped = []

  function va(t) { return Number(GTValues.VA[t]) }
  var CUTTER_EUT = 536870912

  // type, name, circuit, EU/t, ticks, data key, items in, fluids in, items out, fluids out
  var ROWS = [
    // A1
    { type: 'mtj_sputtering', name: 'mram_stack_plus', circuit: 32, eut: va(12), duration: 900, key: 'grindless_mtj_sputtering',
      items: [['grindless:mram_stack_wafer', 4], ['grindless:nb_target', 1]], fluids: [['gtceu:argon', 1000]],
      outs: [['grindless:mram_stack_plus', 2]], fluidOuts: [['gtceu:argon', 800]] },
    { type: 'beuv_lithography', name: 'patterned_mram', circuit: 22, eut: va(13), duration: 1200, key: 'grindless_beuv_lithography',
      items: [['grindless:mram_stack_plus', 2], ['grindless:annealed_mram_wafer', 2]], fluids: [['gtceu:nitrogen', 500]],
      outs: [['grindless:patterned_mram', 2]] },
    { type: 'racetrack_patterning', name: 'racetrack_3d_stack', circuit: 7, eut: va(13), duration: 1200, key: 'grindless_racetrack_patterning',
      items: [['grindless:patterned_mram', 2], ['grindless:racetrack_chip', 4]], fluids: [['gtceu:helium', 1000]],
      outs: [['grindless:racetrack_3d_stack', 2]] },
    // A2
    { type: 'mocvd', name: 'laser_array_wafer', circuit: 32, eut: va(12), duration: 1200,
      items: [['grindless:gan_laser_array', 2], ['grindless:inp_1550_laser_die', 2]], fluids: [['gtceu:ammonia', 1000]],
      outs: [['grindless:laser_array_wafer', 2]] },
    { type: 'ion_slicing', name: 'ln_modulator_array', circuit: 20, eut: va(13), duration: 1200, key: 'grindless_ion_slicing',
      items: [['grindless:ln_on_insulator_plus', 2], ['grindless:laser_array_wafer', 1]], fluids: [['gtceu:helium', 1000]],
      outs: [['grindless:ln_modulator_array', 2]], fluidOuts: [['gtceu:helium', 800]] },
    { type: 'photonic_foundry', name: 'optical_matrix_die', circuit: 32, eut: va(13), duration: 1500, key: 'grindless_photonic_foundry',
      items: [['grindless:ln_modulator_array', 2], ['grindless:ppln_waveguide', 2], ['grindless:photonic_chip', 1]], fluids: [['gtceu:argon', 1000]],
      outs: [['grindless:optical_matrix_die', 2]], fluidOuts: [['gtceu:argon', 800]] },
    { type: 'photonic_integration', name: 'photonic_coprocessor', circuit: 10, eut: va(14), duration: 1800, key: 'grindless_photonic_integration',
      items: [['grindless:optical_matrix_die', 4], ['grindless:pcm_photonic_die', 2], ['grindless:quantum_photonic_chip', 1], ['grindless:cryo_photonic_interposer', 1]],
      fluids: [['gtceu:epoxy', 288]], outs: [['grindless:photonic_coprocessor', 1]] },
    // A3
    { type: 'crystal_growth', name: 'fe_ln_boule', circuit: 32, eut: va(12), duration: 2400, key: 'grindless_crystal_growth',
      items: [['grindless:lithium_niobate_boule', 2], ['grindless:er_yso_boule', 1]], fluids: [['gtceu:argon', 1000]],
      outs: [['grindless:fe_ln_boule', 1]] },
    { type: 'femtosecond_writing', name: 'addressed_holo_slab', circuit: 21, eut: va(13), duration: 1500, key: 'grindless_femtosecond_writing',
      items: [['grindless:holographic_slab', 2], ['grindless:laser_array_wafer', 1]], fluids: [['gtceu:argon', 1000]],
      outs: [['grindless:addressed_holo_slab', 2]], fluidOuts: [['gtceu:argon', 800]] },
    { type: 'spectral_hole_burning', name: 'burned_pattern_crystal', circuit: 27, eut: va(13), duration: 1800, key: 'grindless_spectral_hole_burning',
      items: [['grindless:addressed_holo_slab', 1]], fluids: [['gtceu:helium', 1000]],
      outs: [['grindless:burned_pattern_crystal', 1]] },
    { type: 'fibre_draw', name: 'pattern_memory_unit', circuit: 23, eut: va(13), duration: 1200,
      items: [['grindless:burned_pattern_crystal', 1], ['grindless:hollow_core_fibre', 4], ['grindless:memory_fibre_pigtail', 4]], fluids: [['gtceu:polyethylene', 144]],
      outs: [['grindless:pattern_memory_unit', 2]] }
  ]

  // the two GTM cutter steps (the cutter has no circuit; distilled water cools the saw like every cutter recipe)
  var CUTTERS = [
    { name: 'horizon_storage_die', eut: CUTTER_EUT, duration: 1200, input: 'grindless:racetrack_3d_stack', out: 'grindless:horizon_storage_die', count: 4 },
    { name: 'holographic_slab', eut: CUTTER_EUT, duration: 1200, input: 'grindless:fe_ln_boule', out: 'grindless:holographic_slab', count: 4 }
  ]

  MA.rows = ROWS
  MA.cutters = CUTTERS

  function missingIds(ids, fluids) {
    return ids.filter(function (id, k) { return ids.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id, k) { return fluids.indexOf(id) === k && !Fluid.exists(id) }))
  }

  function pairs(list, k) { return (list[k] || []).map(function (x) { return x[0] }) }

  function skip(name, reason) {
    MA.skipped.push({ name: name, reason: reason })
    console.error(LOG + 'skipped ' + name + ': ' + reason)
  }

  function addRow(event, r) {
    var ids = pairs(r, 'items').concat(pairs(r, 'outs'))
    var fluids = pairs(r, 'fluids').concat(pairs(r, 'fluidOuts'))
    var missing = missingIds(ids, fluids)
    if (missing.length > 0) return skip(r.type + '/' + r.name, 'unknown id(s): ' + missing.join(', '))
    var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
    ;(r.items || []).forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    b.circuit(r.circuit)
    ;(r.fluids || []).forEach(function (x) { b.inputFluids(Fluid.of(x[0], x[1])) })
    ;(r.outs || []).forEach(function (x) { b.itemOutputs(x[1] + 'x ' + x[0]) })
    ;(r.fluidOuts || []).forEach(function (x) { b.outputFluids(Fluid.of(x[0], x[1])) })
    if (r.key) b.addDataString(r.key, r.name)
    b.EUt(r.eut).duration(r.duration)
  }

  function addCutter(event, r) {
    var missing = missingIds([r.input, r.out], ['gtceu:distilled_water'])
    if (missing.length > 0) return skip('cutter/' + r.name, 'unknown id(s): ' + missing.join(', '))
    // GTM prefixes the type itself: grindless:<name> becomes grindless:cutter/<name>
    var b = event.recipes.gtceu.cutter('grindless:' + r.name)
    b.itemInputs('1x ' + r.input)
    b.inputFluids(Fluid.of('gtceu:distilled_water', 1000))
    b.itemOutputs(r.count + 'x ' + r.out)
    b.EUt(r.eut).duration(r.duration)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      MA.skipped = []
      ROWS.forEach(function (r) { addRow(event, r) })
      CUTTERS.forEach(function (r) { addCutter(event, r) })
      console.info(LOG + 'ae2 lines: ' + (ROWS.length + CUTTERS.length) + ' rows; skipped ' + MA.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
