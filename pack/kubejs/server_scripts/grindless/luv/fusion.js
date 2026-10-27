// priority: -18024
// -----------------------------------------------------------------------------------------------
// LuV-B10: GTM's Fusion Reactor Mk1 as docs/eras/luv.md integrates it ("Fusion, and what is not fusion", decisions 6, 19 and 20).
// The audit of every gtceu:fusion_reactor recipe in the native dump, with its fate, is data/grindless/tables/fusion_mk1.json.
//
//   cut   Ag + Cu -> Os, Hg + Mg -> U-235 and Au + Al -> U-238 are removed: osmium comes from Mercury or the belt, U-235 from the
//         End's uranium through the hot cell, uranium from the End or Venus.
//   mk2   Ga + Rn -> duranium is re-registered under GTM's own id with a 200 M EU start, beyond the Mk1's 160 M (16 hatches x 10 M):
//         duranium only from the Mk2 (ZPM's tritanium). Same fluids, EU/t, duration and output as GTM's recipe.
//   keep  Nd + H -> Eu (the ZPM motor's europium), D + T, La + Si -> Lu, H + V -> Cr and GTCA's calcium plasma run as GTM made them.
//   Every other recipe of the type is beyond the Mk1 (EU/t above LuV or a start above 160 M) and untouched. A recipe of the type that
//   the Mk1 could run and the table does not list (a new addon recipe) is logged as an error: it needs a fate.
//
// The Mk1 itself, its fusion casings and the HTS coil (GTM's superconducting coil block, from A4's magnet works) are GTM's.
// Fuels: deuterium (IV's heavy-water plant), tritium (the Moon's removal facility), helium-3 (the Moon), magnesium and oxygen.
// Products: europium, lutetium and chromium go to their GTM lines; helium and calcium plasma to GTM's plasma turbine.
//
// Published for the tests: global.grindless.fusion = { table, cuts, kept, moved, removed, rebuilt, unaudited, missing, errors }.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/luv/fusion] '
  var G = global.grindless || (global.grindless = {})
  var F = G.fusion || (G.fusion = {})
  var TABLE = 'kubejs/data/grindless/tables/fusion_mk1.json'
  var TYPE = 'gtceu:fusion_reactor'

  var table = G.readJsonTable(TABLE)
  F.table = table
  function ids(fate) {
    return table.recipes.filter(function (r) { return r.fate === fate }).map(function (r) { return r.id })
  }
  F.cuts = ids('cut')
  F.kept = ids('keep')
  F.moved = table.recipes.filter(function (r) { return r.fate === 'mk2' })
  F.mk2Start = table.mk2Start

  // the builder puts the type in front of the id it is given: gtceu:x is saved as gtceu:fusion_reactor/x
  function builderId(id) {
    return id.replace(TYPE.substring(TYPE.indexOf(':') + 1) + '/', '')
  }

  ServerEvents.recipes(function (event) {
    var report = { removed: [], rebuilt: [], unaudited: [], missing: [], errors: [] }
    try {
      var listed = {}
      table.recipes.forEach(function (r) { listed[r.id] = r })
      var live = {}
      event.forEachRecipe({ type: TYPE }, function (r) {
        var id = String(r.getId())
        var json
        try { json = JSON.parse(String(r.json)) } catch (e) { report.errors.push(id + ' unreadable: ' + e); return }
        live[id] = true
        if (listed[id]) return
        var eut = json.tickInputs && json.tickInputs.eu ? Number(json.tickInputs.eu[0].content) : 0
        var start = json.data ? Number(json.data.eu_to_start) : 0
        if (eut <= table.mk1.maxEUt && start <= table.mk1.maxStart) report.unaudited.push(id + ' (' + eut + ' EU/t, ' + start + ' EU start)')
      })
      table.recipes.forEach(function (r) { if (!live[r.id]) report.missing.push(r.id) })

      F.cuts.forEach(function (id) {
        if (!live[id]) return
        event.remove({ id: id })
        report.removed.push(id)
      })
      F.moved.forEach(function (r) {
        // only replace a recipe GTM really made: otherwise the move would add a second duranium recipe
        if (!live[r.id]) return
        event.remove({ id: r.id })
        var b = event.recipes.gtceu.fusion_reactor(builderId(r.id))
        // GTM's fluid tags, as in its own recipe ('#forge:gallium 16': the form the pack's other rebuilt recipes use)
        r.inputs.forEach(function (i) { b.inputFluids('#' + i.tag + ' ' + i.amount) })
        b.outputFluids(Fluid.of(r.output.id, r.output.amount))
          .EUt(r.eut)
          .duration(r.duration)
          .fusionStartEU(table.mk2Start)
        report.rebuilt.push(r.id)
      })
    } catch (e) {
      report.errors.push(String(e))
    }
    F.removed = report.removed
    F.rebuilt = report.rebuilt
    F.unaudited = report.unaudited
    F.missing = report.missing
    F.errors = report.errors
    report.unaudited.forEach(function (s) { console.error(LOG + 'unaudited Mk1 recipe ' + s + ': give it a fate in ' + TABLE) })
    report.missing.forEach(function (s) { console.warn(LOG + s + ' is in the audit but not in the recipe manager') })
    report.errors.forEach(function (s) { console.error(LOG + s) })
    console.info(LOG + 'cut ' + report.removed.length + ', moved to the Mk2 ' + report.rebuilt.length + ', kept ' + F.kept.length)
  })
})()
