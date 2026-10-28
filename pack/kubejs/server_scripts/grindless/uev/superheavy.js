// priority: -23163
// -----------------------------------------------------------------------------------------------
// Recipes of UEV's superheavy line (docs/eras/uev.md, machines 2-4, lines 3-6; package UEV-A2), generated at every server load from
// data/grindless/tables/superheavy.json (machines and recipe types: startup_scripts/grindless/uev/superheavy.js), plus the three
// controller recipes.
//
//   gtceu:heavy_ion_irradiation / recoil_separation / superheavy_chemistry   one recipe per entry of types.<type>, id
//                          grindless:<type>/<name>; the programmed circuit picks the recipe; each carries the data key of the type.
//                          kept[] are non-consumed items (the SRF cavity), charge[] non-consumed fluids (the helium chamber).
//   gtceu:assembler / chemical_reactor   the rows of types.<type> (id grindless:<type>/<name>): the beam, the wheel, the capsule, the
//                          foils, the nitrate -> dust conversions, phosgene and polycarbonate. Circuits 20 and up so GTM's own recipes
//                          cannot hide a row.
//   crafting               each controller: UHV hull + 2 UV field generators + UV sensor + 4 UHV circuits, grindless:crafting/<machine>.
//
// Published for the smoke test: global.grindless.superheavy.recipes [{ type, name, recipeId, ... }], .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var SH = G.superheavy || (G.superheavy = {})
  var TABLE = SH.table || 'kubejs/data/grindless/tables/superheavy.json'
  var OWN_TYPES = {
    heavy_ion_irradiation: { itemsIn: 4, itemsOut: 3, fluidsIn: 2, fluidsOut: 2 },
    recoil_separation: { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 },
    superheavy_chemistry: { itemsIn: 6, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }
  }
  var CONTROLLERS = ['heavy_ion_cyclotron', 'recoil_separator', 'superheavy_chemistry_lab']

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var out = []
    Object.keys(t.types || {}).forEach(function (type) {
      var names = {}
      var circuits = {}
      list(t.types[type].recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var circuitOk = circuit >= 1 && circuit <= 32 && circuit % 1 === 0 && !circuits[circuit]
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
    if (problems.length > 0) console.error(LOG + 'superheavy: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    rec.fluidsIn.concat(rec.charge, rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    var io = OWN_TYPES[rec.type]
    if (!io) return null
    if (rec.itemsIn.length + rec.kept.length + 1 > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length + rec.charge.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu[rec.type]('grindless:' + rec.name)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    rec.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
    recipe.circuit(rec.circuit)
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
    SH.recipes = []
    SH.skipped = []
    SH.clashes = []
    function skip(name, reason) {
      SH.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'superheavy skipped ' + name + ': ' + reason)
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
      SH.recipes.push(rec)
    })
    SH.clashes = clashesOf(SH.recipes)
    if (SH.clashes.length > 0) console.error(LOG + 'superheavy: recipes whose ingredients are a subset of another\'s: ' + SH.clashes.join('; '))
    console.info(LOG + 'superheavy: ' + SH.recipes.length + ' recipes; skipped ' + SH.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var SENSOR = 'gtceu:uv_sensor'
    var FIELD = 'gtceu:uv_field_generator'
    SH.controllerRecipes = []
    CONTROLLERS.forEach(function (name) {
      var machine = 'gtceu:' + name
      var missing = [HULL, SENSOR, FIELD, machine].filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(machine, ['CSC', 'FHF', 'C C'], { C: '#gtceu:circuits/uhv', S: SENSOR, F: FIELD, H: HULL }).id('grindless:crafting/' + name)
      SH.controllerRecipes.push('grindless:crafting/' + name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'superheavy ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
