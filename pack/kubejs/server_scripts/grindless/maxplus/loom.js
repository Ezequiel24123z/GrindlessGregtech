// priority: -20272
// MAX+ machine 11, the meta-material loom, and the older steps of lines T4 to T7 (docs/eras/maxplus.md, machine 11 and 'Lines'; package XP-H1).
//
//   T4 horizon shielding   (the existing valence-reduction line's gadolinium oxide) SPS c27 -> gd_hfb2_cermet; press c4 (maxplus/condensate.js) ->
//                          graded_horizon_laminate; loom c1 -> horizon_shielding
//   T5 horizon waveguide   CVI c20 -> sic_waveguide_tube; chemical bath c3 (electropolish) -> polished_waveguide_tube; MTJ c32 ->
//                          nb_lined_tube; loom c2 -> horizon_waveguide; mK cryostat c27 -> cold_horizon_waveguide
//   T6 horizon conduit     coated conductor c12 -> conduit_tape; oxide PLD c9 -> thick_conduit_tape; HTS works c19 -> cabled_conductor;
//                          loom c3 -> horizon_conduit; helium refrigerator (keyed) -> cold_horizon_conduit
//   T7 horizon valve       chemical reactor c29 (TEOS sol-gel) -> condensate_alcogel; aerogel works c7 -> condensate_superleak_plug;
//                          SHeQUID c9 -> calibrated_condensate_leak; loom c4 -> horizon_valve_body; SHeQUID c12 -> horizon_valve
//                          (the superfluid helium plant has no item slots, so the final valve step runs on the SHeQUID line, after its
//                          designed MAX+ rows P19 c8, T7 c9, C2 c10 and K3 c11)
//
// The loom runs at home at V[MAX] x 4 A (2^33 EU/t, the design's machine 11) for 600 ticks per row; the older rows run at their own machine's VA. Older-machine rows are written here,
// as XP-W's maxplus/power.js writes P18's: the circuits are the first free ones of each older machine type counted in line-id order (P1..P25,
// T1..T17, ...), built or not (maxplus.md 'Older machines'); extraction and MTJ sit at 32, where rows differ by item inputs. Lookup: each row has
// a circuit or an item no other row of its type holds. Published for the tests: global.grindless.maxPlusLoom { rows, loom, skipped, controller }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus_loom] '
  var G = global.grindless || (global.grindless = {})
  var ML = G.maxPlusLoom || (G.maxPlusLoom = {})
  ML.skipped = []
  ML.controller = 'grindless:assembly_line/meta_material_loom'

  function va(t) { return Number(GTValues.VA[t]) }
  var VA_MAX = va(14)
  var V_MAX = Number(GTValues.V[14])
  var LOOM_EUT = V_MAX * 4
  var KERR = 'gtceu:kerr_condensate'
  var BOIL = 'grindless:condensate_boil_off'
  var CIRCUIT = '#gtceu:circuits/max'
  var HULL = 'gtceu:max_machine_hull'
  var EPOXY = 'gtceu:epoxy'
  var LHE = 'gtceu:liquid_helium'

  // type, name, circuit, items in, kept items, fluids in, kept fluids, items out, fluids out, EU/t, ticks, data key (types with one)
  var ROWS = [
    // T4
    { type: 'spark_plasma_sintering', name: 'gd_hfb2_cermet', circuit: 27, eut: va(9), duration: 900,
      items: [['gtceu:gadolinium_oxide_dust', 2], ['grindless:hafnium_sponge', 4], ['gtceu:boron_carbide_dust', 4]],
      outs: [['grindless:gd_hfb2_cermet', 2]] },
    // T5
    { type: 'chemical_vapour_infiltration', name: 'sic_waveguide_tube', circuit: 20, eut: va(10), duration: 1200, key: 'grindless_chemical_vapour_infiltration',
      items: [['grindless:sic_tow', 8]], fluids: [['gtceu:methyltrichlorosilane', 1000], ['gtceu:hydrogen', 2000]],
      outs: [['grindless:sic_waveguide_tube', 2]], fluidOuts: [['gtceu:hydrochloric_acid', 3000]] },
    { type: 'chemical_bath', name: 'polished_waveguide_tube', circuit: 3, eut: va(8), duration: 400,
      items: [['grindless:sic_waveguide_tube', 2]], fluids: [['gtceu:electropolish_acid', 1000]],
      outs: [['grindless:polished_waveguide_tube', 2]], fluidOuts: [['gtceu:spent_electropolish_acid', 1000]] },
    { type: 'mtj_sputtering', name: 'nb_lined_tube', circuit: 32, eut: va(12), duration: 900, key: 'grindless_mtj_sputtering',
      items: [['grindless:polished_waveguide_tube', 2], ['grindless:nb_target', 1]], fluids: [['gtceu:argon', 1000]],
      outs: [['grindless:nb_lined_tube', 2]], fluidOuts: [['gtceu:argon', 800]] },
    { type: 'nuclear_demagnetisation', name: 'cold_horizon_waveguide', circuit: 27, eut: va(11), duration: 1200, key: 'grindless_nuclear_demagnetisation',
      items: [['grindless:horizon_waveguide', 1], ['grindless:nb_target', 1]], keptFluids: [['gtceu:superfluid_helium', 1000]],
      outs: [['grindless:cold_horizon_waveguide', 1]] },
    // T6
    { type: 'coated_conductor', name: 'conduit_tape', circuit: 12, eut: va(6), duration: 500, key: 'grindless_coated_conductor',
      items: [['grindless:nickel_tungsten_tape', 8], ['grindless:kerr_strand_wire', 4]], fluids: [[EPOXY, 288]],
      outs: [['grindless:conduit_tape', 2]] },
    { type: 'pulsed_laser_deposition', name: 'thick_conduit_tape', circuit: 9, eut: va(12), duration: 1000, key: 'grindless_pulsed_laser_deposition',
      items: [['grindless:conduit_tape', 4], ['gtceu:gd_123_dust', 4]], kept: [['grindless:krf_excimer_laser', 1]], fluids: [['gtceu:oxygen', 4000]],
      outs: [['grindless:thick_conduit_tape', 4]] },
    { type: 'magnet_winding', name: 'cabled_conductor', circuit: 19, eut: va(6), duration: 800, key: 'grindless_magnet_winding',
      items: [['grindless:thick_conduit_tape', 16], ['grindless:kerr_strand_wire', 4]], fluids: [[EPOXY, 288]], keptFluids: [[LHE, 1000]],
      outs: [['grindless:cabled_conductor', 1]] },
    // T7
    { type: 'chemical_reactor', name: 'condensate_alcogel', circuit: 29, eut: va(6), duration: 400,
      items: [['grindless:teos_flask', 2]], fluids: [['gtceu:ammonia', 500]],
      outs: [['grindless:condensate_alcogel', 2]], fluidOuts: [['gtceu:ethanol', 1000]] },
    { type: 'supercritical_drying', name: 'condensate_superleak_plug', circuit: 7, eut: va(6), duration: 1200,
      items: [['grindless:condensate_alcogel', 2]], fluids: [['gtceu:ethanol', 500]], keptFluids: [['gtceu:carbon_dioxide', 1000]],
      outs: [['grindless:condensate_superleak_plug', 2]], fluidOuts: [['gtceu:ethanol', 500]] },
    { type: 'shequid_assembly', name: 'calibrated_condensate_leak', circuit: 9, eut: va(12), duration: 900, key: 'grindless_shequid_assembly',
      items: [['grindless:condensate_superleak_plug', 1], ['grindless:nb_jj_wafer', 2]], kept: [['grindless:shequid_rotation_ref', 1]],
      fluids: [[LHE, 500]], outs: [['grindless:calibrated_condensate_leak', 1]], fluidOuts: [['gtceu:helium', 500]] },
    { type: 'shequid_assembly', name: 'horizon_valve', circuit: 12, eut: va(12), duration: 800, key: 'grindless_shequid_assembly',
      items: [['grindless:horizon_valve_body', 1]], kept: [['grindless:shequid_rotation_ref', 1]], fluids: [[LHE, 2000]],
      outs: [['grindless:horizon_valve', 1]], fluidOuts: [['gtceu:helium', 1000]] }
  ]

  // the loom's own rows: bound plates, Kerr strand and condensate woven into the four meta-materials; the boil-off goes back to the refinery's c10
  var LOOM = [
    { type: 'meta_material_loom', name: 'horizon_shielding', circuit: 1, eut: LOOM_EUT, duration: 600, key: 'grindless_meta_material_loom',
      items: [['grindless:graded_horizon_laminate', 8], ['grindless:horizon_compressed_plate', 4]], fluids: [[KERR, 2000]],
      outs: [['grindless:horizon_shielding', 1], ['grindless:condensate_boil_off', 2]] },
    { type: 'meta_material_loom', name: 'horizon_waveguide', circuit: 2, eut: LOOM_EUT, duration: 600, key: 'grindless_meta_material_loom',
      items: [['grindless:nb_lined_tube', 4], ['grindless:kerr_strand_wire', 8], ['grindless:kerr_strange_plate', 4]], fluids: [[KERR, 4000]],
      outs: [['grindless:horizon_waveguide', 1], ['grindless:condensate_boil_off', 2]] },
    { type: 'meta_material_loom', name: 'horizon_conduit', circuit: 3, eut: LOOM_EUT, duration: 600, key: 'grindless_meta_material_loom',
      items: [['grindless:cabled_conductor', 4], ['grindless:kerr_braid_sleeve', 4], ['grindless:horizon_compressed_plate', 4]], fluids: [[KERR, 4000]],
      outs: [['grindless:horizon_conduit', 1], ['grindless:condensate_boil_off', 2]] },
    { type: 'meta_material_loom', name: 'horizon_valve_body', circuit: 4, eut: LOOM_EUT, duration: 600, key: 'grindless_meta_material_loom',
      items: [['grindless:calibrated_condensate_leak', 4], ['grindless:kerr_strange_plate', 8], ['grindless:horizon_compressed_plate', 4]], fluids: [[KERR, 4000]],
      outs: [['grindless:horizon_valve_body', 1], ['grindless:condensate_boil_off', 2]] }
  ]

  // the helium refrigerator's keyed row: the woven conduit run cold until it holds its critical current (maxplus/power.js addCool's shape)
  var COOL = { name: 'cold_horizon_conduit', input: 'grindless:horizon_conduit', output: 'grindless:cold_horizon_conduit', eut: va(6), duration: 800 }
  var COOL_FLUIDS = {
    makeUp: { id: 'gtceu:liquid_helium', amount: 25 }, precoolIn: { id: 'gtceu:liquid_nitrogen', amount: 50 },
    precoolOut: { id: 'gtceu:nitrogen', amount: 50 }, charge: { id: 'gtceu:liquid_helium', amount: 4000 }
  }

  var CONTROLLER = { machine: 'gtceu:meta_material_loom', research: 'grindless:horizon_phase_sensor_core', casing: 'grindless:horizon_machine_casing',
    comps: ['2x grindless:maxplus_electric_motor', '2x grindless:maxplus_electric_piston', '2x grindless:maxplus_robot_arm', '2x grindless:maxplus_conveyor_module'] }

  ML.rows = ROWS
  ML.loom = LOOM

  function missingIds(ids, fluids) {
    return ids.filter(function (id, k) { return String(id).charAt(0) !== '#' && ids.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id, k) { return fluids.indexOf(id) === k && !Fluid.exists(id) }))
  }

  function pairs(list, k) { return (list[k] || []).map(function (x) { return x[0] }) }

  function skip(name, reason) {
    ML.skipped.push({ name: name, reason: reason })
    console.error(LOG + 'skipped ' + name + ': ' + reason)
  }

  function addRow(event, r) {
    var ids = pairs(r, 'items').concat(pairs(r, 'kept'), pairs(r, 'outs'))
    var fluids = pairs(r, 'fluids').concat(pairs(r, 'keptFluids'), pairs(r, 'fluidOuts'))
    var missing = missingIds(ids, fluids)
    if (missing.length > 0) return skip(r.type + '/' + r.name, 'unknown id(s): ' + missing.join(', '))
    var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
    ;(r.items || []).forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    ;(r.kept || []).forEach(function (x) { b.notConsumable(x[1] + 'x ' + x[0]) })
    b.circuit(r.circuit)
    ;(r.fluids || []).forEach(function (x) { b.inputFluids(Fluid.of(x[0], x[1])) })
    ;(r.keptFluids || []).forEach(function (x) { b.notConsumableFluid(Fluid.of(x[0], x[1])) })
    ;(r.outs || []).forEach(function (x) { b.itemOutputs(x[1] + 'x ' + x[0]) })
    ;(r.fluidOuts || []).forEach(function (x) { b.outputFluids(Fluid.of(x[0], x[1])) })
    if (r.key) b.addDataString(r.key, r.name)
    b.EUt(r.eut).duration(r.duration)
  }

  function addCool(event) {
    var cfg = (G.heliumRefrigerator && G.heliumRefrigerator.config) || COOL_FLUIDS
    var fl = [cfg.makeUp.id, cfg.precoolIn.id, cfg.precoolOut.id, cfg.charge.id]
    var missing = missingIds([COOL.input, COOL.output], fl)
    if (missing.length > 0) return skip('closed_loop_cooling/' + COOL.name, 'unknown id(s): ' + missing.join(', '))
    var dataKey = (G.heliumRefrigerator && G.heliumRefrigerator.dataKey) || 'grindless_closed_loop'
    event.recipes.gtceu.closed_loop_cooling('grindless:' + COOL.name)
      .itemInputs('1x ' + COOL.input)
      .inputFluids(Fluid.of(cfg.makeUp.id, cfg.makeUp.amount))
      .inputFluids(Fluid.of(cfg.precoolIn.id, cfg.precoolIn.amount))
      .notConsumableFluid(Fluid.of(cfg.charge.id, cfg.charge.amount))
      .itemOutputs('1x ' + COOL.output)
      .outputFluids(Fluid.of(cfg.precoolOut.id, cfg.precoolOut.amount))
      .addDataString(dataKey, 'grindless:closed_loop_cooling/' + COOL.name)
      .EUt(COOL.eut).duration(COOL.duration)
  }

  function addController(event) {
    var c = CONTROLLER
    var ins = [HULL, c.research, c.casing, 'grindless:horizon_processor'].concat(c.comps.map(function (s) { return s.replace(/^\d+x /, '') }))
    var missing = missingIds(ins.concat([c.machine]), [KERR])
    if (missing.length > 0) return skip('meta_material_loom controller', 'unknown id(s): ' + missing.join(', '))
    var a = event.recipes.gtceu.assembly_line('grindless:meta_material_loom')
    a.itemInputs(HULL, '2x ' + c.casing, '8x #gtceu:circuits/maxplus', '4x ' + CIRCUIT)
    c.comps.forEach(function (s) { a.itemInputs(s) })
    a.inputFluids(Fluid.of(KERR, 2000))
    a.itemOutputs(c.machine)
    a.stationResearch(function (r) { return r.researchStack(Item.of(c.research)).CWUt(64).EUt(VA_MAX) })
    a.EUt(VA_MAX).duration(4800)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      ML.skipped = []
      ROWS.forEach(function (r) { addRow(event, r) })
      LOOM.forEach(function (r) { addRow(event, r) })
      addCool(event)
      addController(event)
      console.info(LOG + 'loom: ' + (ROWS.length + LOOM.length + 2) + ' rows; skipped ' + ML.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
