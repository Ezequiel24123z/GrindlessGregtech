// -----------------------------------------------------------------------------------------------
// Recipes of UV's pyroprocessing cell and accelerator-driven reactor (machines and recipe types: startup_scripts/grindless/uv/thorium.js;
// docs/eras/uv.md, machines 1 and 2 and line 3; package UV-A1), generated at every server load from data/grindless/tables/thorium.json,
// plus the recipes of the two controllers and the GTM chemical reactor rows of the line.
//
//   gtceu:pyroprocessing / gtceu:accelerator_driven   one recipe per table entry, id grindless:<type>/<name>; the programmed circuit
//                          picks the recipe (the reactor's assemblies differ, so it has none); every recipe carries the data key of
//                          its type = <name> (its EMI line). "charge" entries are GTM's non-consumed fluid inputs, "kept" the same for
//                          items. The generator's eut is the EU/t GIVEN, written as -eut.
//   gtceu:chemical_reactor  the rows of types.chemical_reactor (id grindless:chemical_reactor/<name>): the Triton nitrogen's oxide, the
//                          15N back from its oxide, and the LiCl salt's first charge.
//   crafting               the controllers: UV hull + 2 UV robot arms + UV sensor + 4 UV circuits (cell) and UV hull + 2 UV field
//                          generators + 4 UV circuits (reactor), shaped recipes grindless:crafting/<machine>.
//
// Destinations: radioactive waste -> ZPM's waste retrieval plant; the loaded salt -> cleaned by circuit 4 and back into the charge;
// 15N -> the fuel fabrication plant's nitride row; the carbon monoxide of that row -> GTM's CO uses; polonium-210 stays in the output hatch.
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.thorium.recipes [{ type, name, recipeId, ... }], .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var TH = G.thorium || (G.thorium = {})
  var TABLE = TH.table || 'kubejs/data/grindless/tables/thorium.json'

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    // UHV-A1's spent HFIR driver row: merged into the cell's recipes before the checks, so its circuit is checked with the others
    var extra = G.readJsonTable('kubejs/data/grindless/tables/transcurium_pyroprocessing.json')
    if (t.types && t.types.pyroprocessing && extra.types && extra.types.pyroprocessing) t.types.pyroprocessing.recipes = list(t.types.pyroprocessing.recipes).concat(list(extra.types.pyroprocessing.recipes))
    var problems = []
    var out = []
    Object.keys(t.types || {}).forEach(function (type) {
      var names = {}
      var circuits = {}
      var noCircuit = type === 'chemical_reactor' || type === 'accelerator_driven'
      list(t.types[type].recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var circuitOk = noCircuit ? circuit === 0 : (circuit >= 1 && circuit <= 32 && !circuits[circuit])
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
        circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'thorium: ' + TABLE + ': ' + problems.join('; '))
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
    Object.keys(TH.machines).forEach(function (k) { if (TH.machines[k].type === rec.type) def = TH.machines[k] })
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
    recipe.EUt(rec.type === 'accelerator_driven' ? -rec.eut : rec.eut).duration(rec.duration)
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
    TH.recipes = []
    TH.skipped = []
    TH.clashes = []
    function skip(name, reason) {
      TH.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'thorium skipped ' + name + ': ' + reason)
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
      TH.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    TH.clashes = clashesOf(TH.recipes)
    if (TH.clashes.length > 0) console.error(LOG + 'thorium: recipes whose ingredients are a subset of another\'s: ' + TH.clashes.join('; '))
    console.info(LOG + 'thorium: ' + TH.recipes.length + ' recipes; skipped ' + TH.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uv_machine_hull'
    var ARM = 'gtceu:uv_robot_arm'
    var SENSOR = 'gtceu:uv_sensor'
    var FIELD = 'gtceu:uv_field_generator'
    var defs = [
      { machine: TH.machines.cell.machine, parts: [HULL, ARM, SENSOR], pattern: ['CSC', 'AHA', 'C C'], ingredients: { C: '#gtceu:circuits/uv', S: SENSOR, A: ARM, H: HULL }, name: 'pyroprocessing_cell' },
      { machine: TH.machines.reactor.machine, parts: [HULL, FIELD], pattern: ['CFC', 'FHF', 'C C'], ingredients: { C: '#gtceu:circuits/uv', F: FIELD, H: HULL }, name: 'accelerator_driven_reactor' }
    ]
    TH.controllerRecipes = []
    defs.forEach(function (d) {
      var missing = d.parts.concat([d.machine]).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(d.machine, d.pattern, d.ingredients).id('grindless:crafting/' + d.name)
      TH.controllerRecipes.push('grindless:crafting/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'thorium ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
