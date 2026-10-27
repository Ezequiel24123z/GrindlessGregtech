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

  // ---------------------------------------------------------------- the laser fusion chamber (machine 4)

  var CH = table.chamber
  var MODULE = 'grindless:fibre_laser_module'
  var SPENT = 'grindless:spent_laser_module'
  F.chamber = []
  F.skipped = []
  F.crafting = { chamber: 'grindless:crafting/laser_fusion_chamber' }

  function addChamber(event) {
    var missing = [CH.recipes[0].capsule, CH.recipes[1].capsule, MODULE, SPENT].filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      F.skipped.push({ name: 'chamber', reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'laser fusion chamber recipes skipped, unknown id(s): ' + missing.join(', '))
      return []
    }
    var added = []
    CH.recipes.forEach(function (r, i) {
      var b = event.recipes.gtceu.laser_fusion('grindless:laser_fusion/' + r.name)
      b.itemInputs('1x ' + r.capsule)
      b.circuit(i + 1)
      b.chancedInput('1x ' + MODULE, CH.wearChance, 0)
      b.chancedOutput('1x ' + SPENT, CH.wearChance, 0)
      b.outputFluids(Fluid.of('gtceu:helium', r.helium))
      if (r.hydrogen > 0) b.outputFluids(Fluid.of('gtceu:hydrogen', r.hydrogen))
      b.EUt(-CH.eut).duration(r.duration)
      added.push({ name: r.name, circuit: i + 1, eut: CH.eut, duration: r.duration })
    })
    return added
  }

  function addCrafting(event) {
    event.recipes.gtceu.shaped(CH.machine, ['CEC', 'CHC', ' E '], {
      C: '#gtceu:circuits/uv', E: 'gtceu:uv_emitter', H: 'gtceu:uv_machine_hull'
    }).id(F.crafting.chamber)
  }

  // ---------------------------------------------------------------- decaborane (the capsule's boron-11 fuel)
  // GTM has no diborane, sodium hydride or plain boron trifluoride, so the route of the design (BF3 + NaH -> B2H6 -> B10H14) is one
  // chemical reactor row from the hot cell's boron-11 trifluoride: 3 BF3 + 6 H -> decaborane, the fluorine leaving as hydrofluoric acid.
  var DECABORANE = { name: 'decaborane', circuit: 1, eut: 7680, duration: 400,
    fluidsIn: [{ id: 'gtceu:boron_11_trifluoride', amount: 3000 }, { id: 'gtceu:hydrogen', amount: 6000 }],
    fluidsOut: [{ id: 'gtceu:decaborane', amount: 1000 }, { id: 'gtceu:hydrofluoric_acid', amount: 9000 }] }
  F.decaborane = DECABORANE

  function addDecaborane(event) {
    var d = DECABORANE
    var missing = d.fluidsIn.concat(d.fluidsOut).filter(function (f) { return !Fluid.exists(f.id) }).map(function (f) { return f.id })
    if (missing.length > 0) {
      F.skipped.push({ name: d.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'decaborane recipe skipped, unknown id(s): ' + missing.join(', '))
      return []
    }
    var b = event.recipes.gtceu.chemical_reactor('grindless:chemical_reactor/' + d.name)
    b.circuit(d.circuit)
    d.fluidsIn.forEach(function (f) { b.inputFluids(Fluid.of(f.id, f.amount)) })
    d.fluidsOut.forEach(function (f) { b.outputFluids(Fluid.of(f.id, f.amount)) })
    b.EUt(d.eut).duration(d.duration)
    return [d.name]
  }

  ServerEvents.recipes(function (event) {
    try { F.chamber = addChamber(event) } catch (e) { F.chamber = []; console.error(LOG + 'laser fusion chamber recipes failed: ' + e) }
    try { addCrafting(event) } catch (e2) { console.error(LOG + 'laser fusion chamber crafting failed: ' + e2) }
    try { F.chemistry = addDecaborane(event) } catch (e3) { F.chemistry = []; console.error(LOG + 'decaborane recipe failed: ' + e3) }
    console.info(LOG + 'chamber recipes ' + F.chamber.length + ', decaborane recipes ' + F.chemistry.length)
  })
})()
