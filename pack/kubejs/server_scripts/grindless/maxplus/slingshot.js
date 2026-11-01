// priority: -20170
// MAX+ machine 3, the Hills slingshot, and lines P15 and P16 (docs/eras/maxplus.md, machine 3 and 'Lines'; package XP-T1). Gate c16 to 30 Doradus is a
// row of data/grindless/tables/gate.json.
//
//   P15 counterweight    debris harvester c3 and cluster-light furnace c1 (max/, existing) -> metal_rich_bloom; megabar c14 -> dense_counterweight_core;
//                        canner -> canned_counterweight
//   P16 relay probe      self-replication (opv/, existing) -> probe_seed; Kugelblitz forge c4 (existing) -> hawking_drive; clock lab c9 ->
//                        thorium_nav_clock; photonic foundry c28 -> optical_nav_core; assembly line -> ig_relay_probe
//   slingshot            c1 binds the probe and the counterweight into a bound pair; c2 releases it as a launched probe (the counterweight falls
//                        into the hole: it is consumed). Both rows run in orbit around Sgr A*.
//
// Older-machine rows live here (circuits: the first free one of each older machine type in line-id order: megabar P15 = 14, photonic foundry P16 = 28,
// clock lab P16 = 9, the clock lab's own free circuit; the canner is item-keyed). Published for the tests:
// global.grindless.maxPlusSlingshot { rows, slingshot, controller, probe, skipped }. Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus_slingshot] '
  var G = global.grindless || (global.grindless = {})
  var MS = G.maxPlusSlingshot || (G.maxPlusSlingshot = {})
  MS.skipped = []
  MS.controller = 'grindless:assembly_line/hills_slingshot'
  MS.probe = 'grindless:assembly_line/ig_relay_probe'

  function va(t) { return Number(GTValues.VA[t]) }
  var VA_MAX = va(14)
  var V_MAX = Number(GTValues.V[14])
  var KERR = 'gtceu:kerr_condensate'
  var HULL = 'gtceu:max_machine_hull'
  var SITE = (G.maxTravel && G.maxTravel.places && G.maxTravel.places.sgra ? G.maxTravel.places.sgra.dimension : 'gcyr:black_hole_orbit')

  // type, name, circuit (none for item-keyed rows), items in, fluids in, items out, EU/t, ticks, data key
  var ROWS = [
    // P15
    { type: 'megabar_synthesis', name: 'dense_counterweight_core', circuit: 14, eut: va(10), duration: 900, key: 'grindless_megabar',
      items: [['grindless:metal_rich_bloom', 8], ['grindless:graded_z_billet', 2]],
      outs: [['grindless:dense_counterweight_core', 1]] },
    { type: 'canner', name: 'canned_counterweight', eut: va(9), duration: 400,
      items: [['grindless:dense_counterweight_core', 4], ['gtceu:steel_drum', 1]],
      outs: [['grindless:canned_counterweight', 1]] },
    { type: 'assembler', name: 'slingshot_coil_casing', circuit: 3, eut: va(12), duration: 300,
      items: [['gtceu:superconducting_coil', 4], ['grindless:horizon_compressed_plate', 4], ['grindless:dense_counterweight_core', 1]],
      outs: [['grindless:slingshot_coil_casing', 2]] },
    // P16
    { type: 'nuclear_clock', name: 'thorium_nav_clock', circuit: 9, eut: va(11), duration: 1200, key: 'grindless_nuclear_clock',
      items: [['grindless:nuclear_clock', 2], ['gtceu:thorium_plate', 8]], fluids: [['gtceu:argon', 2000]],
      outs: [['grindless:thorium_nav_clock', 1]] },
    { type: 'photonic_foundry', name: 'optical_nav_core', circuit: 28, eut: va(12), duration: 1200, key: 'grindless_photonic_foundry',
      items: [['gtceu:sapphire_plate', 8], ['gtceu:gold_plate', 8]], fluids: [['gtceu:argon', 2000]],
      outs: [['grindless:optical_nav_core', 1]] }
  ]
  MS.rows = ROWS

  // the slingshot's own rows (V[MAX] x 16 A: the 1,024 A MAX+ hatch)
  var SL_EUT = V_MAX * 16
  var SL_KEY = 'grindless_hills_slingshot'
  var SLING = [
    { type: 'hills_slingshot', name: 'bound_probe_pair', circuit: 1, eut: SL_EUT, duration: 600, key: SL_KEY,
      items: [['grindless:ig_relay_probe', 1], ['grindless:canned_counterweight', 1]],
      outs: [['grindless:bound_probe_pair', 1]] },
    { type: 'hills_slingshot', name: 'launched_ig_probe', circuit: 2, eut: SL_EUT, duration: 1200, key: SL_KEY,
      items: [['grindless:bound_probe_pair', 1]],
      outs: [['grindless:launched_ig_probe', 1]] }
  ]
  MS.slingshot = SLING

  var PROBE = {
    items: ['1x grindless:probe_seed', '1x grindless:hawking_drive', '1x grindless:optical_nav_core', '4x grindless:maxplus_sensor',
      '2x grindless:maxplus_robot_arm', '32x grindless:metal_feedstock', '4x grindless:cluster_sinter_casing', '2x #gtceu:circuits/max'],
    fluids: [['gtceu:soldering_alloy', 4608], ['gtceu:lubricant', 4000]],
    out: 'grindless:ig_relay_probe', research: 'grindless:thorium_nav_clock', cwut: 256, duration: 2400
  }
  MS.probeRecipe = PROBE

  var CONTROLLER = { machine: 'gtceu:hills_slingshot', research: 'grindless:ig_relay_probe', casing: 'grindless:horizon_machine_casing',
    comps: ['2x grindless:max_conveyor_module', '2x grindless:max_robot_arm', '2x grindless:max_field_generator', '2x grindless:max_sensor'],
    plates: ['16x grindless:slingshot_coil_casing', '4x grindless:horizon_compressed_plate'] }

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

  function addRow(event, r, site) {
    var ids = pairs(r, 'items').concat(pairs(r, 'outs'))
    var missing = missingIds(ids, pairs(r, 'fluids'))
    if (missing.length > 0) return skip(r.type + '/' + r.name, 'unknown id(s): ' + missing.join(', '))
    var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
    ;(r.items || []).forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    if (r.circuit) b.circuit(r.circuit)
    ;(r.fluids || []).forEach(function (x) { b.inputFluids(Fluid.of(x[0], x[1])) })
    ;(r.outs || []).forEach(function (x) { b.itemOutputs(x[1] + 'x ' + x[0]) })
    if (r.key) b.addDataString(r.key, r.name)
    if (site) b.dimension(SITE)
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
      SLING.forEach(function (r) { addRow(event, r, true) })
      addAssemblyLine(event, 'ig_relay_probe', PROBE, PROBE.items, PROBE.fluids, PROBE.out, PROBE.research, PROBE.cwut, PROBE.duration)
      var c = CONTROLLER
      var items = ['1x ' + HULL, '2x ' + c.casing, '8x grindless:horizon_processor', '4x #gtceu:circuits/max'].concat(c.comps, c.plates)
      addAssemblyLine(event, 'hills_slingshot', c, items, [[KERR, 2000]], c.machine, c.research, 64, 4800)
      console.info(LOG + (ROWS.length + SLING.length + 2) + ' rows; skipped ' + MS.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
