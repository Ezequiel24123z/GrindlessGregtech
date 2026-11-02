// priority: -20188
// MAX+ lines K1 to K4, the creative cores, on the OpV-UXV older machines and the MAX+ refinery and fab (docs/eras/maxplus.md 'Lines'; package XP-K).
//
//   K1 horizon cloud core       Kugelblitz forge c7 -> caged_kugelblitz; strangelet vault c5 -> strange_cage_lining;
//                               magnetic pair converter c3 -> pair_confined_cage; condensate refinery c8 -> cloud_loaded_cage; mK cryostat c32 -> horizon_cloud_core
//   K2 bottomless store core    void crystal fab c2 -> void_holographic_block; femto writer c23 -> addressed_holo_block;
//                               spectral hole burner c28 -> burned_store_block; mK cryostat c32 -> bottomless_store_core
//   K3 bottomless tank core     aerogel works c8 -> condensate_aerogel; SHeQUID c13 -> superfluid_reservoir_core; refinery c9 -> condensate_wetted_core;
//                               SHeQUID c14 -> bottomless_tank_core (the superfluid helium plant cannot output an item)
//   K4 horizon computation core TFLN fab c21 -> photonic_qpu_wafer; SNSPD foundry c9 -> detector_layer_wafer; photonic integration hall c15 -> photonic_qpu;
//                               mK cryostat c32 -> horizon_computation_core
//
// Circuits are the first free ones of each machine type (strictly above every row built or reserved). The cryostat type is already at 32, so its
// rows share it and differ by item inputs (maxplus/ae2.js, loom.js). Site rows carry their machine's site (Cygnus X-1, SGR 1806, Sgr A*, the
// Local Group filament); the rest run at home. The refinery's boil-off returns to its own c10 recompress row, so no byproduct is lost.
// No recipe time is inflated: the cost is in quantity and in the steps.
// Published for the tests: global.grindless.maxPlusCreativeCores { rows, skipped }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus_creative_cores] '
  var G = global.grindless || (global.grindless = {})
  var MK = G.maxPlusCreativeCores || (G.maxPlusCreativeCores = {})
  MK.skipped = []

  function va(t) { return Number(GTValues.VA[t]) }
  var V_MAX = Number(GTValues.V[14])
  var OPV = 503316480
  var CYGNUS = 'grindless:cygnus_x1_orbit'
  var SGR1806 = 'grindless:sgr1806_orbit'
  var VOID = (G.maxPlusTravel && G.maxPlusTravel.places && G.maxPlusTravel.places.void ? G.maxPlusTravel.places.void.dimension : 'grindless:local_group_filament')
  var SETTLED = 'gtceu:settled_condensate'
  var HE3 = 'gtceu:superfluid_helium_3'

  // type, name, circuit, EU/t, ticks, data key, site, items in, fluids in, items out, fluids out
  var ROWS = [
    // K1
    { type: 'kugelblitz_forming', name: 'caged_kugelblitz', circuit: 7, eut: OPV, duration: 2400, key: 'grindless_kugelblitz_forming', dim: CYGNUS,
      items: [['grindless:kugelblitz_seed', 16], ['grindless:kugelblitz_core', 8], ['grindless:caged_ni_chain', 32], ['grindless:horizon_tether', 64], ['grindless:fed_strangelet', 16]],
      outs: [['grindless:caged_kugelblitz', 1]] },
    { type: 'strangelet_growth', name: 'strange_cage_lining', circuit: 5, eut: OPV, duration: 2400, key: 'grindless_strangelet_growth',
      items: [['grindless:caged_kugelblitz', 2], ['grindless:strangelet_seed', 32], ['grindless:fed_strangelet', 32], ['grindless:horizon_tether', 32]],
      outs: [['grindless:strange_cage_lining', 1]] },
    { type: 'magnetic_pair_production', name: 'pair_confined_cage', circuit: 3, eut: OPV, duration: 2400, key: 'grindless_magnetic_pair_production', dim: SGR1806,
      items: [['grindless:strange_cage_lining', 2], ['grindless:caged_ni_chain', 32], ['grindless:horizon_tether', 32]], fluids: [['gtceu:hot_pair_plasma', 64000]],
      outs: [['grindless:pair_confined_cage', 1]] },
    { type: 'condensate_refinery', name: 'cloud_loaded_cage', circuit: 8, eut: V_MAX * 16, duration: 2400, key: 'grindless_condensate_refinery',
      items: [['grindless:pair_confined_cage', 2], ['grindless:horizon_tether', 64]], fluids: [[SETTLED, 64000]],
      outs: [['grindless:cloud_loaded_cage', 1], ['grindless:condensate_boil_off', 8]] },
    { type: 'nuclear_demagnetisation', name: 'horizon_cloud_core', circuit: 32, eut: va(14), duration: 2400, key: 'grindless_nuclear_demagnetisation',
      items: [['grindless:cloud_loaded_cage', 2], ['grindless:horizon_core_crystal', 4]], keep: [['grindless:horizon_shard', 1]], fluids: [[HE3, 32000]],
      outs: [['grindless:horizon_cloud_core', 1]] },
    // K2
    { type: 'void_crystal_fab', name: 'void_holographic_block', circuit: 2, eut: va(14), duration: 2400, key: 'grindless_void_crystal_fab', dim: VOID,
      items: [['grindless:void_crystal_lattice', 16], ['grindless:void_grown_diamond', 32]], keep: [['grindless:horizon_shard', 1]], fluids: [[HE3, 16000]],
      outs: [['grindless:void_holographic_block', 1]] },
    { type: 'femtosecond_writing', name: 'addressed_holo_block', circuit: 23, eut: va(14), duration: 2400, key: 'grindless_femtosecond_writing',
      items: [['grindless:void_holographic_block', 2], ['grindless:laser_array_wafer', 16], ['grindless:holographic_slab', 16]], fluids: [['gtceu:argon', 16000]],
      outs: [['grindless:addressed_holo_block', 1]], fluidOuts: [['gtceu:argon', 12800]] },
    { type: 'spectral_hole_burning', name: 'burned_store_block', circuit: 28, eut: va(14), duration: 2400, key: 'grindless_spectral_hole_burning',
      items: [['grindless:addressed_holo_block', 2], ['grindless:burned_memory_crystal', 16]], fluids: [['gtceu:helium', 32000]],
      outs: [['grindless:burned_store_block', 1]] },
    { type: 'nuclear_demagnetisation', name: 'bottomless_store_core', circuit: 32, eut: va(14), duration: 2400, key: 'grindless_nuclear_demagnetisation',
      items: [['grindless:burned_store_block', 2], ['grindless:horizon_logic_wafer', 8], ['grindless:horizon_strand_preform', 16]], fluids: [[HE3, 32000]],
      outs: [['grindless:bottomless_store_core', 1]] },
    // K3: the superfluid helium plant has no item slot, so its final step is a second SHeQUID row (c14), as XP-H1's T7 does
    { type: 'supercritical_drying', name: 'condensate_aerogel', circuit: 8, eut: va(12), duration: 2400,
      items: [['grindless:silica_aerogel', 64], ['grindless:refractory_condensate', 32], ['grindless:silicate_condensate', 32]], fluids: [[HE3, 8000]],
      outs: [['grindless:condensate_aerogel', 8]] },
    { type: 'shequid_assembly', name: 'superfluid_reservoir_core', circuit: 13, eut: va(13), duration: 2400, key: 'grindless_shequid_assembly',
      items: [['grindless:condensate_aerogel', 16], ['grindless:aerogel_superleak_plug', 16], ['grindless:superfluid_he3_seal', 8]], fluids: [[HE3, 64000]],
      outs: [['grindless:superfluid_reservoir_core', 1]] },
    { type: 'condensate_refinery', name: 'condensate_wetted_core', circuit: 9, eut: V_MAX * 16, duration: 2400, key: 'grindless_condensate_refinery',
      items: [['grindless:superfluid_reservoir_core', 2], ['grindless:metal_condensate', 32]], fluids: [[SETTLED, 64000]],
      outs: [['grindless:condensate_wetted_core', 1], ['grindless:condensate_boil_off', 8]] },
    { type: 'shequid_assembly', name: 'bottomless_tank_core', circuit: 14, eut: va(13), duration: 2400, key: 'grindless_shequid_assembly',
      items: [['grindless:condensate_wetted_core', 2], ['grindless:superfluid_valve', 16], ['grindless:aerogel_fuel_tank', 8]], fluids: [[HE3, 64000]],
      outs: [['grindless:bottomless_tank_core', 1]] },
    // K4: electronic-grade silicon is the substrate of both wafer steps
    { type: 'ion_slicing', name: 'photonic_qpu_wafer', circuit: 21, eut: va(13), duration: 2400, key: 'grindless_ion_slicing',
      items: [['grindless:electronic_grade_silicon', 64], ['grindless:ln_on_insulator_plus', 32]], fluids: [['gtceu:helium', 32000]],
      outs: [['grindless:photonic_qpu_wafer', 2]], fluidOuts: [['gtceu:helium', 25600]] },
    { type: 'snspd_fabrication', name: 'detector_layer_wafer', circuit: 9, eut: va(13), duration: 2400, key: 'grindless_snspd_fabrication',
      items: [['grindless:photonic_qpu_wafer', 2], ['grindless:wsi_nanowire_wafer', 16], ['grindless:snspd_die', 16], ['grindless:electronic_grade_silicon', 32]], fluids: [['gtceu:helium', 16000]],
      outs: [['grindless:detector_layer_wafer', 2]] },
    { type: 'photonic_integration', name: 'photonic_qpu', circuit: 15, eut: va(14), duration: 2400, key: 'grindless_photonic_integration',
      items: [['grindless:detector_layer_wafer', 4], ['grindless:snspd_link_wafer', 16], ['grindless:horizon_logic_die', 8], ['grindless:quantum_photonic_chip', 4]], fluids: [['gtceu:epoxy', 2304]],
      outs: [['grindless:photonic_qpu', 1]] },
    { type: 'nuclear_demagnetisation', name: 'horizon_computation_core', circuit: 32, eut: va(14), duration: 2400, key: 'grindless_nuclear_demagnetisation',
      items: [['grindless:photonic_qpu', 2], ['grindless:horizon_interposer', 8], ['grindless:horizon_alignment_matrix', 4]], fluids: [[HE3, 32000]],
      outs: [['grindless:horizon_computation_core', 1]] }
  ]

  MK.rows = ROWS

  function missingIds(ids, fluids) {
    return ids.filter(function (id, k) { return ids.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id, k) { return fluids.indexOf(id) === k && !Fluid.exists(id) }))
  }

  function pairs(list, k) { return (list[k] || []).map(function (x) { return x[0] }) }

  function skip(name, reason) {
    MK.skipped.push({ name: name, reason: reason })
    console.error(LOG + 'skipped ' + name + ': ' + reason)
  }

  function addRow(event, r) {
    var ids = pairs(r, 'items').concat(pairs(r, 'keep'), pairs(r, 'outs'))
    var fluids = pairs(r, 'fluids').concat(pairs(r, 'fluidOuts'))
    var missing = missingIds(ids, fluids)
    if (missing.length > 0) return skip(r.type + '/' + r.name, 'unknown id(s): ' + missing.join(', '))
    var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
    ;(r.items || []).forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    ;(r.keep || []).forEach(function (x) { b.notConsumable(x[1] + 'x ' + x[0]) })
    b.circuit(r.circuit)
    ;(r.fluids || []).forEach(function (x) { b.inputFluids(Fluid.of(x[0], x[1])) })
    ;(r.outs || []).forEach(function (x) { b.itemOutputs(x[1] + 'x ' + x[0]) })
    ;(r.fluidOuts || []).forEach(function (x) { b.outputFluids(Fluid.of(x[0], x[1])) })
    if (r.dim) b.dimension(r.dim)
    if (r.key) b.addDataString(r.key, r.name)
    b.EUt(r.eut).duration(r.duration)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      MK.skipped = []
      ROWS.forEach(function (r) { addRow(event, r) })
      console.info(LOG + 'creative core lines: ' + ROWS.length + ' rows; skipped ' + MK.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
