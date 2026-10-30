// priority: -24224
// -----------------------------------------------------------------------------------------------
// Recipes of UHV's high flux reactor and transuranium facility (machines and recipe types: startup_scripts/grindless/uhv/transcurium.js;
// docs/eras/uhv.md, machines 1 and 2, lines 1-3 and 25; package UHV-A1), generated at every server load from
// data/grindless/tables/transcurium.json, plus the recipes of the two controllers and the GTM chemical reactor rows of line 25.
//
//   gtceu:high_flux_irradiation / gtceu:transuranium_processing   one recipe per table entry, id grindless:<type>/<name>; the
//                          programmed circuit picks the recipe; every recipe carries the data key of its type = <name> (its EMI line).
//                          "charge" entries are GTM's non-consumed fluid inputs, "kept" the same for items.
//   gtceu:chemical_reactor  the rows of types.chemical_reactor (id grindless:chemical_reactor/<name>): line 25, butyraldehyde (GTM's
//                          oxo recipe) -> 2-ethylhexenal -> 2-ethylhexanol; phosphorus -> POCl3; both -> HDEHP; HDEHP + kerosene -> the
//                          solvent. Each carries its own circuit so GTM's chemical reactor recipes cannot hide it.
//   crafting               the controllers: UHV hull + 2 UV field generators + UV sensor + 4 UHV circuits (reactor) and UHV hull +
//                          2 UV robot arms + UV sensor + 4 UHV circuits (facility), assembly lines grindless:assembly_line/<machine>.
//                          Each is an assembly line: station research, tritanium + soldering alloy + lubricant, 3 domain items of its own line.
//
// The older rows of the package are read elsewhere: the driver elements by iv/uranium_cycle.js (transcurium_fabrication.json), the
// spent drivers by uv/thorium.js (transcurium_pyroprocessing.json), the nickel-62 targets by iv/hot_cell.js (hot_cell.json, mode 7).
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.transcurium.recipes [{ type, name, recipeId, ... }], .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var TC = G.transcurium || (G.transcurium = {})
  var TABLE = TC.table || 'kubejs/data/grindless/tables/transcurium.json'
  // UEV-A1's rows (the same format): merged after the main table's, so circuits are checked across both
  var ISOTOPES_TABLE = 'kubejs/data/grindless/tables/isotopes_facility.json'

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var extra = G.readJsonTable(ISOTOPES_TABLE)
    Object.keys(extra.types || {}).forEach(function (type) {
      if (!t.types[type]) t.types[type] = { recipes: [] }
      t.types[type].recipes = list(t.types[type].recipes).concat(list(extra.types[type].recipes))
    })
    var problems = []
    var out = []
    Object.keys(t.types || {}).forEach(function (type) {
      var names = {}
      var circuits = {}
      var optional = type === 'chemical_reactor'
      list(t.types[type].recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var circuitOk = (optional && circuit === 0) || (circuit >= 1 && circuit <= 32 && circuit % 1 === 0 && !circuits[circuit])
        if (!/^[a-z0-9_]+$/.test(n) || names[n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration)
          return
        }
        var bad = false
        var stack = function (x) {
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1)) bad = true
          return { id: String(x.id), count: Number(x.count) }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dataKey: t.types[type].dataKey ? String(t.types[type].dataKey) : '',
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), fluidsIn: list(r.fluidsIn).map(fluid), charge: list(r.charge).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        if (bad || (rec.itemsOut.length === 0 && rec.fluidsOut.length === 0) || (rec.itemsIn.length === 0 && rec.fluidsIn.length === 0)) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        names[n] = true
        if (circuit > 0) circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'transcurium: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    rec.fluidsIn.concat(rec.charge, rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    if (rec.type === 'chemical_reactor') return null
    var def = null
    Object.keys(TC.machines || {}).forEach(function (k) { if (TC.machines[k].type === rec.type) def = TC.machines[k] })
    if (def === null) return 'no machine for type ' + rec.type
    var io = def.maxIO
    var circuit = rec.circuit > 0 ? 1 : 0
    if (rec.itemsIn.length + rec.kept.length + circuit > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length + rec.charge.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu[rec.type](rec.recipeId)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    rec.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
    if (rec.circuit > 0) recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.charge.forEach(function (x) { recipe.notConsumableFluid(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    recipe.EUt(rec.eut).duration(rec.duration)
  }

  function keysOf(rec) {
    var keys = {}
    rec.itemsIn.concat(rec.kept).forEach(function (x) { keys['i:' + x.id] = true })
    rec.fluidsIn.concat(rec.charge).forEach(function (x) { keys['f:' + x.id] = true })
    keys['circuit:' + rec.circuit] = true
    return keys
  }

  function clashesOf(recs) {
    var out = []
    var keys = recs.map(keysOf)
    function subset(a, b) {
      return Object.keys(a).every(function (k) { return b[k] === true })
    }
    for (var i = 0; i < recs.length; i++) {
      for (var j = i + 1; j < recs.length; j++) {
        if (recs[i].type !== recs[j].type) continue
        if (subset(keys[i], keys[j]) || subset(keys[j], keys[i])) out.push(recs[i].type + '/' + recs[i].name + ' / ' + recs[j].name)
      }
    }
    return out
  }

  function generate(event) {
    TC.recipes = []
    TC.skipped = []
    TC.clashes = []
    function skip(name, reason) {
      TC.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'transcurium skipped ' + name + ': ' + reason)
    }
    loadTable().forEach(function (rec) {
      rec.recipeId = 'grindless:' + rec.type + '/' + rec.name
      var missing = missingIds(rec)
      if (missing.length > 0) return skip(rec.type + '/' + rec.name, 'unknown id(s): ' + missing.join(', '))
      var tooBig = sizeProblem(rec)
      if (tooBig !== null) return skip(rec.type + '/' + rec.name, tooBig)
      try {
        add(event, rec)
      } catch (e) {
        return skip(rec.type + '/' + rec.name, 'the builder failed: ' + e)
      }
      TC.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    TC.clashes = clashesOf(TC.recipes)
    if (TC.clashes.length > 0) console.error(LOG + 'transcurium: recipes whose ingredients are a subset of another\'s: ' + TC.clashes.join('; '))
    console.info(LOG + 'transcurium: ' + TC.recipes.length + ' recipes; skipped ' + TC.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var ARM = 'gtceu:uhv_robot_arm'
    var SENSOR = 'gtceu:uhv_sensor'
    var FIELD = 'gtceu:uhv_field_generator'
    var PUMP = 'gtceu:uhv_electric_pump'
    var CONVEYOR = 'gtceu:uhv_conveyor_module'
    var defs = [
      { machine: TC.machines.reactor.machine, parts: [HULL, FIELD, SENSOR, PUMP], research: 'grindless:lithium_breeder_blanket', domain: ['4x grindless:srf_cryomodule', '2x grindless:mu_metal_shield', '2x grindless:uv_electromagnet'], name: 'high_flux_reactor' },
      { machine: TC.machines.facility.machine, parts: [HULL, ARM, SENSOR, CONVEYOR], research: 'grindless:pmma_coated_wafer', domain: ['4x grindless:hpge_crystal', '2x grindless:silicon_nitride_film', '2x grindless:mu_metal_shield'], name: 'transuranium_facility' }
    ]
    TC.controllerRecipes = []
    defs.forEach(function (d) {
      var missing = d.parts.concat([d.machine, d.research], d.domain.map(function (s) { return s.replace(/^\d+x /, '') })).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      d.parts.forEach(function (s, i) { b.itemInputs(i === 0 ? s : '3x ' + s) })
      b.itemInputs('4x #gtceu:circuits/uhv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:tritanium', 1152))
      b.itemOutputs(d.machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(1966080) })
      b.EUt(1966080).duration(1500)
      TC.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'transcurium ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
