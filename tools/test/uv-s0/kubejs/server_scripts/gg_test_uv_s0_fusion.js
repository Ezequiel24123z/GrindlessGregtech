// TEST ONLY, UV-S0 (S0-4): ZPM's audit (server_scripts/grindless/zpm/fusion.js `audit` and `addDHe3`) against the Mk3 table, plus the
// custom 640 M start recipe. Disposable copy, never shipped; the table is tools/test/uv-s0/kubejs/data/grindless/tables/fusion_mk3.json.
ServerEvents.recipes(function (event) {
  var R = { audited: [], unaudited: [], missing: [], errors: [], ours: [] }
  try {
    var table = global.grindless.readJsonTable('kubejs/data/grindless/tables/fusion_mk3.json')
    var listed = {}
    table.recipes.forEach(function (r) { listed[r.id] = r })
    var ours = {}
    table.ours.forEach(function (r) { ours[r.id] = r })
    var live = {}
    event.forEachRecipe({ type: 'gtceu:fusion_reactor' }, function (r) {
      var id = String(r.getId())
      var json = JSON.parse(String(r.json))
      live[id] = true
      if (listed[id]) { R.audited.push(id); return }
      if (ours[id]) return
      var eut = json.tickInputs && json.tickInputs.eu ? Number(json.tickInputs.eu[0].content) : 0
      var start = json.data ? Number(json.data.eu_to_start) : 0
      if (eut <= table.mk3.maxEUt && start <= table.mk3.maxStart) R.unaudited.push(id + ' (' + eut + ' EU/t, ' + start + ' EU start)')
    })
    table.recipes.forEach(function (r) { if (r.fate === 'keep' && !live[r.id]) R.missing.push(r.id) })
    table.ours.forEach(function (r) {
      var b = event.recipes.gtceu.fusion_reactor(r.builderId)
      r.inputs.forEach(function (i) { b.inputFluids(i.tag ? '#' + i.tag + ' ' + i.amount : i.fluid + ' ' + i.amount) })
      b.outputFluids(Fluid.of(r.output.id, r.output.amount)).EUt(r.eut).duration(r.duration).fusionStartEU(r.start)
      R.ours.push(r.id)
    })
    R.mk3 = table.mk3
  } catch (e) {
    R.errors.push(String(e))
  }
  global.ggUvS0Audit = R
  // S0-6: a generator recipe of a custom type outside generators.js TYPES, 2.62 M EU/t (5 A of UV), plus a plain fluid one at 1.5 M
  try {
    event.recipes.gtceu.direct_conversion('grindless:s0_big_gen').inputFluids(Fluid.of('gtceu:helium_plasma', 1)).outputFluids(Fluid.of('gtceu:helium', 1)).EUt(-2621440).duration(100)
  } catch (e) { console.info('GGTEST|uv_s0|s0_6_builder|FAIL|' + e) }
  R.unaudited.forEach(function (u) { console.info('GGTEST|uv_s0|s0_4_unaudited|NOTE|' + u) })
  console.info('GGTEST|uv_s0|s0_4_audit_loaded|NOTE|audited ' + R.audited.length + ' unaudited ' + R.unaudited.length + ' missing ' + R.missing.length + ' ours ' + R.ours.length + ' errors ' + R.errors.length)
})
