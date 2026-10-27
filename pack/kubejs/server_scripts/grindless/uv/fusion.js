// -----------------------------------------------------------------------------------------------
// UV-A3: the Mk3 audit, the laser fusion chamber's recipes (machine 4), its controller, and the chemical reactor rows that make decaborane
// (docs/eras/uv.md, "The Mk3 audit", "Machine 4", "Fusion", package A3; the chamber itself: startup_scripts/grindless/uv/fusion.js).
//
//   audit      every gtceu:fusion_reactor recipe the Mk3 (gtceu:uv_fusion_reactor) can run (EU/t at most VA[UV], start at most 640 M) has one
//              row in data/grindless/tables/fusion_mk3.json. UV adds no Mk3 recipe: line 1 (Pu-241 + hydrogen -> americium plasma ->
//              plasma turbine -> americium, + naquadria -> neutronium) is GTM's. A recipe the Mk3 could run that is neither listed nor
//              ours is logged as an error (it needs a fate), exactly as in ZPM.
//
// Published for the tests: global.grindless.uvFusion = { table, audited, unaudited, missing, luvCutsLive, errors, ours }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uv/fusion] '
  var G = global.grindless || (global.grindless = {})
  var F = G.uvFusion || (G.uvFusion = {})
  var TABLE = 'kubejs/data/grindless/tables/fusion_mk3.json'
  var TYPE = 'gtceu:fusion_reactor'

  var table = G.readJsonTable(TABLE)
  F.table = table

  // ---------------------------------------------------------------- the audit

  function audit(event) {
    var report = { audited: [], unaudited: [], missing: [], luvCutsLive: [], errors: [] }
    var listed = {}
    table.recipes.forEach(function (r) { listed[r.id] = r })
    var ours = {}
    table.ours.forEach(function (r) { ours[r.id] = r })
    var live = {}
    event.forEachRecipe({ type: TYPE }, function (r) {
      var id = String(r.getId())
      var json
      try { json = JSON.parse(String(r.json)) } catch (e) { report.errors.push(id + ' unreadable: ' + e); return }
      live[id] = true
      if (listed[id]) {
        report.audited.push(id)
        if (listed[id].fate === 'luv_cut') report.luvCutsLive.push(id)
        return
      }
      if (ours[id]) return
      var eut = json.tickInputs && json.tickInputs.eu ? Number(json.tickInputs.eu[0].content) : 0
      var start = json.data ? Number(json.data.eu_to_start) : 0
      if (eut <= table.mk3.maxEUt && start <= table.mk3.maxStart) report.unaudited.push(id + ' (' + eut + ' EU/t, ' + start + ' EU start)')
    })
    table.recipes.forEach(function (r) { if (r.fate === 'keep' && !live[r.id]) report.missing.push(r.id) })
    return report
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var report = { audited: [], unaudited: [], missing: [], luvCutsLive: [], errors: [] }
    try {
      report = audit(event)
    } catch (e) {
      report.errors.push('audit failed: ' + e)
    }
    F.ours = []
    F.audited = report.audited
    F.unaudited = report.unaudited
    F.missing = report.missing
    F.luvCutsLive = report.luvCutsLive
    F.errors = report.errors
    report.unaudited.forEach(function (s) { console.error(LOG + 'unaudited Mk3 recipe ' + s + ': give it a fate in ' + TABLE) })
    report.luvCutsLive.forEach(function (s) { console.error(LOG + s + ' was cut by LuV and is live again') })
    report.missing.forEach(function (s) { console.warn(LOG + s + ' is in the audit but not in the recipe manager') })
    report.errors.forEach(function (s) { console.error(LOG + s) })
    console.info(LOG + 'audited ' + report.audited.length + ', unaudited ' + report.unaudited.length + ', missing ' + report.missing.length)
  })
})()
