// -----------------------------------------------------------------------------------------------
// Recipes of LuV's coated conductor line (machine and recipe type: startup_scripts/grindless/luv/coated_conductor_line.js;
// docs/eras/luv.md, "2. Coated conductor line"; package LuV-A3), generated at every server load from
// data/grindless/tables/coated_conductor_line.json, and the recipe that makes the controller.
//
//   gtceu:coated_conductor   one recipe per entry of the table, id grindless:coated_conductor/<name> (GTM's builder puts the type in
//                            front); the programmed circuit is the step (1 substrate, 2 tape), and every recipe carries the data key
//                            grindless_coated_conductor = <name> (its EMI line). EU/t and duration are the table's.
//     circuit 1  substrate   19 nickel dust + 1 tungsten dust -> 20 grindless:nickel_tungsten_tape, 7,680 EU/t x 400 t
//     circuit 2  tape        16 nickel-tungsten tape + 1 ITBTC dust + 1,000 mB oxygen + 36 mB molten silver -> 16
//                            grindless:itbtc_coated_conductor, 30,720 EU/t x 300 t
//   Lookup safety: GTM's recipe lookup keeps one recipe per set of ingredients (counts ignored), and a recipe whose ingredients are a
//   subset of another's can hide it. The recipes of the type are checked against each other at load (the circuit counts as an
//   ingredient); a clash is logged as an error.
//   crafting                 the controller (luv.md, "Controller"): LuV hull + LuV emitter (the deposition laser) + 2 LuV conveyor
//                            modules + 4 LuV circuits, in a crafting grid (grindless:crafting/coated_conductor_line, GTM's shaped recipe).
//
// The tape and the coated conductor are LuV-A1's items (no GTM material info, so GTM makes no recycling for them). Until they are
// registered, the recipes that need them are skipped with an error that names them. Destinations: the coated conductor goes to the HTS
// magnet works (LuV-A4: HTS coils, SMES cells); nothing else comes out.
//
// Published for the smoke test: global.grindless.coatedConductorLine.recipes [{ id, recipeId, name, step, circuit, itemsIn: [{ id,
// count }], fluidsIn: [{ id, amount }], itemsOut: [{ id, count }], eut, duration, energy }], .skipped [{ name, reason }], .clashes,
// .craftingRecipe, .craftingParts.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/luv] '
  var G = global.grindless || (global.grindless = {})
  var CCL = G.coatedConductorLine || (G.coatedConductorLine = {})

  var TABLE = CCL.table || 'kubejs/data/grindless/tables/coated_conductor_line.json'
  var DATA_KEY = CCL.dataKey || 'grindless_coated_conductor'
  var TYPE_PATH = 'coated_conductor'

  var CONTROLLER = 'gtceu:coated_conductor_line'
  var HULL = 'gtceu:luv_machine_hull'
  var EMITTER = 'gtceu:luv_emitter'
  var CONVEYOR = 'gtceu:luv_conveyor_module'
  var CONTROLLER_PARTS = [CONTROLLER, HULL, EMITTER, CONVEYOR]
  CCL.craftingRecipe = 'grindless:crafting/coated_conductor_line'
  CCL.craftingParts = CONTROLLER_PARTS

  function io() {
    return CCL.maxIO || { itemsIn: 3, itemsOut: 1, fluidsIn: 2, fluidsOut: 0 }
  }

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  // ---------------------------------------------------------------- the table

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var names = {}
    var recipes = []
    list(t.recipes).forEach(function (r) {
      var n = String(r.name || '')
      if (!/^[a-z0-9_]+$/.test(n) || names[n]) {
        problems.push('recipe name "' + n + '"')
        return
      }
      if (!(Number(r.circuit) >= 1 && Number(r.circuit) <= 32) || !(Number(r.eut) > 0) || !(Number(r.duration) > 0)) {
        problems.push(n + ': circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration)
        return
      }
      var bad = false
      var item = function (x) {
        if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1)) bad = true
        return { id: String(x.id), count: Number(x.count) }
      }
      var fluid = function (f) {
        if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
        return { id: String(f.id), amount: Number(f.amount) }
      }
      var itemsIn = list(r.itemsIn).map(item)
      var fluidsIn = list(r.fluidsIn).map(fluid)
      var itemsOut = list(r.itemsOut).map(item)
      if (bad || itemsIn.length + fluidsIn.length === 0 || itemsOut.length === 0) {
        problems.push(n + ': contents ' + JSON.stringify({ itemsIn: r.itemsIn, fluidsIn: r.fluidsIn, itemsOut: r.itemsOut }))
        return
      }
      names[n] = true
      recipes.push({ name: n, step: String(r.step || ''), circuit: Number(r.circuit), itemsIn: itemsIn, fluidsIn: fluidsIn,
        itemsOut: itemsOut, eut: Number(r.eut), duration: Number(r.duration) })
    })
    if (recipes.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'coated conductor line: ' + TABLE + ': ' + problems.join('; '))
    return recipes
  }

  // ---------------------------------------------------------------- building recipes

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    rec.fluidsIn.forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    var limits = io()
    // the programmed circuit is one more item input
    var itemsIn = rec.itemsIn.length + 1
    if (itemsIn > limits.itemsIn) return itemsIn + ' item inputs (the type holds ' + limits.itemsIn + ')'
    if (rec.fluidsIn.length > limits.fluidsIn) return rec.fluidsIn.length + ' fluid inputs (the type holds ' + limits.fluidsIn + ')'
    if (rec.itemsOut.length > limits.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + limits.itemsOut + ')'
    return null
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu.coated_conductor(rec.id)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    recipe.addDataString(DATA_KEY, rec.name)
      .EUt(rec.eut)
      .duration(rec.duration)
  }

  // the lookup keys of a recipe: its items, its fluids, its circuit
  function keysOf(rec) {
    var keys = {}
    rec.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    rec.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
    keys['circuit:' + rec.circuit] = true
    return keys
  }

  // pairs where one recipe's keys are a subset of the other's (equal sets included): GTM's lookup would hide one of them
  function clashesOf(recs) {
    var out = []
    var keys = recs.map(keysOf)
    function subset(a, b) {
      return Object.keys(a).every(function (k) { return b[k] === true })
    }
    for (var i = 0; i < recs.length; i++) {
      for (var j = i + 1; j < recs.length; j++) {
        if (subset(keys[i], keys[j]) || subset(keys[j], keys[i])) out.push(recs[i].name + ' / ' + recs[j].name)
      }
    }
    return out
  }

  function generate(event) {
    CCL.recipes = []
    CCL.skipped = []
    CCL.clashes = []

    function skip(name, reason) {
      CCL.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'coated conductor line skipped ' + name + ': ' + reason)
    }

    loadTable().forEach(function (rec) {
      rec.id = 'grindless:' + rec.name
      rec.recipeId = 'grindless:' + TYPE_PATH + '/' + rec.name
      rec.energy = rec.eut * rec.duration
      var missing = missingIds(rec)
      if (missing.length > 0) {
        skip(rec.name, 'unknown id(s): ' + missing.join(', '))
        return
      }
      var tooBig = sizeProblem(rec)
      if (tooBig !== null) {
        skip(rec.name, tooBig)
        return
      }
      try {
        add(event, rec)
      } catch (e) {
        skip(rec.name, 'the builder failed: ' + e)
        return
      }
      CCL.recipes.push(rec)
    })

    CCL.clashes = clashesOf(CCL.recipes)
    if (CCL.clashes.length > 0) {
      console.error(LOG + 'coated conductor line: recipes whose ingredients are a subset of another\'s (GTM\'s lookup would hide one): ' +
        CCL.clashes.join('; '))
    }
    console.info(LOG + 'coated_conductor recipes added: ' + CCL.recipes.length + '; skipped ' + CCL.skipped.length)
  }

  // ---------------------------------------------------------------- crafting

  function addController(event) {
    var missing = CONTROLLER_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'coated conductor line controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped(CONTROLLER, ['CEC', 'VHV', 'C C'], {
      C: '#gtceu:circuits/luv',
      E: EMITTER,
      V: CONVEYOR,
      H: HULL
    }).id(CCL.craftingRecipe)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'coated conductor line recipe generation failed: ' + e)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'coated conductor line controller recipe failed: ' + e2)
    }
  })
})()
