// -----------------------------------------------------------------------------------------------
// Recipes of UEV's isotope separation (docs/eras/uev.md, machine 1, lines 1, 2, 29 and 30; package UEV-A1), generated at every server
// load from data/grindless/tables/isotopes.json (machine and recipe type: startup_scripts/grindless/uev/isotopes.js), plus the
// recipe of the calutron controller.
//
//   gtceu:calutron_separation  one recipe per table entry, id grindless:calutron_separation/<name>; the programmed circuit picks the
//                          recipe; each carries the data key of the type = <name> (its EMI line).
//   gtceu:chemical_reactor / mixer / assembler   the rows of types.<type> (id grindless:<type>/<name>): the chlorinations, oxidations,
//                          MOX blend and targets round the calutron. Circuits 20 and up so GTM's own recipes cannot hide a row.
//   crafting               the controller: UHV hull + 2 UV field generators + UV sensor + 4 UHV circuits, grindless:crafting/calutron.
//
// The older rows of the package are read elsewhere: HFIR and facility rows by uhv/transcurium.js (isotopes_facility.json), the
// depleted-plutonium MOX by iv/uranium_cycle.js (isotopes_fabrication.json), three partitioning rows in zpm/actinides.js.
// Published for the smoke test: global.grindless.isotopes.recipes [{ type, name, recipeId, ... }], .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var ISO = G.isotopes || (G.isotopes = {})
  var TABLE = ISO.table || 'kubejs/data/grindless/tables/isotopes.json'
  var CALUTRON_IO = { itemsIn: 2, itemsOut: 3, fluidsIn: 0, fluidsOut: 0 }

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
    if (problems.length > 0) console.error(LOG + 'isotopes: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    rec.fluidsIn.concat(rec.charge, rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    if (rec.type !== 'calutron_separation') return null
    var io = CALUTRON_IO
    if (rec.itemsIn.length + rec.kept.length + 1 > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length + rec.charge.length > io.fluidsIn) return 'fluid inputs (the type holds none)'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return 'fluid outputs (the type holds none)'
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
    ISO.recipes = []
    ISO.skipped = []
    ISO.clashes = []
    function skip(name, reason) {
      ISO.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'isotopes skipped ' + name + ': ' + reason)
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
      ISO.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    ISO.clashes = clashesOf(ISO.recipes)
    if (ISO.clashes.length > 0) console.error(LOG + 'isotopes: recipes whose ingredients are a subset of another\'s: ' + ISO.clashes.join('; '))
    console.info(LOG + 'isotopes: ' + ISO.recipes.length + ' recipes; skipped ' + ISO.skipped.length)
  }

  function addController(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var SENSOR = 'gtceu:uv_sensor'
    var FIELD = 'gtceu:uv_field_generator'
    var machine = 'gtceu:calutron'
    ISO.controllerRecipes = []
    var missing = [HULL, SENSOR, FIELD, machine].filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'calutron controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped(machine, ['CSC', 'FHF', 'C C'], { C: '#gtceu:circuits/uhv', S: SENSOR, F: FIELD, H: HULL }).id('grindless:crafting/calutron')
    ISO.controllerRecipes.push('grindless:crafting/calutron')
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controller', addController]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'isotopes ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
