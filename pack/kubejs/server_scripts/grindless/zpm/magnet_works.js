// -----------------------------------------------------------------------------------------------
// Recipes of ZPM's naquadria magnet works (machine and recipe type: startup_scripts/grindless/zpm/magnet_works.js; docs/eras/zpm.md,
// "Machine 6"; package ZPM-A5), generated at every server load from data/grindless/tables/magnet_works.json, the cryostat casing's
// assembler recipe and the recipe that makes the controller.
//
//   gtceu:naquadria_magnets   one recipe per entry of the table, id grindless:naquadria_magnets/<name> (GTM's builder puts the type in
//                             front); the programmed circuit picks the product (1 ZPM SMES cell, 2 URhNq2 single wires, 3 HTS insert,
//                             4 UV SMES cell: UV-A9, 5 UHV SMES cell: UHV-A9),
//                             every recipe carries the data key grindless_naquadria_magnets = <name> (its EMI line), and an entry with
//                             "charge": true takes the table's cold-test charge as GTM's non-consumed fluid input (notConsumableFluid).
//   Lookup safety: GTM's lookup keeps one recipe per set of ingredients (counts ignored), and a recipe whose ingredients are a subset of
//   another's can hide it; the type's recipes are checked against each other at load (the circuit and the charge count as ingredients).
//   assembler                 the cryostat casing (grindless:assembler/cryostat_casing): the table's "casing" entry. The design's aerogel
//                             is package A8's, so the casing takes a frostproof casing with gold and copper plates.
//   crafting                  the controller (zpm.md, "Controller"): ZPM hull + 2 ZPM motors + ZPM sensor + 4 ZPM circuits, in a crafting
//                             grid (grindless:crafting/naquadria_magnet_works).
//
// Published for the smoke test: global.grindless.magnetWorks.recipes [{ name, id, recipeId, circuit, charge, itemsIn, fluidsIn, itemsOut,
// eut, duration }], .skipped, .clashes, .casingRecipe, .craftingRecipe, .craftingParts.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/zpm] '
  var G = global.grindless || (global.grindless = {})
  var MW = G.magnetWorks || (G.magnetWorks = {})

  var TABLE = MW.table || 'kubejs/data/grindless/tables/magnet_works.json'
  var DATA_KEY = MW.dataKey || 'grindless_naquadria_magnets'
  var TYPE_PATH = 'naquadria_magnets'

  var CONTROLLER = 'gtceu:naquadria_magnet_works'
  var HULL = 'gtceu:zpm_machine_hull'
  var MOTOR = 'gtceu:zpm_electric_motor'
  var SENSOR = 'gtceu:zpm_sensor'
  var CONTROLLER_PARTS = [HULL, MOTOR, SENSOR, CONTROLLER]
  MW.craftingRecipe = 'grindless:crafting/naquadria_magnet_works'
  MW.craftingParts = CONTROLLER_PARTS
  MW.casingRecipe = 'grindless:assembler/cryostat_casing'

  function io() {
    return MW.maxIO || { itemsIn: 6, itemsOut: 1, fluidsIn: 2, fluidsOut: 0 }
  }

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var charge = t.charge || {}
    if (String(charge.id || '').indexOf(':') < 0 || !(Number(charge.amount) > 0)) problems.push('charge ' + JSON.stringify(t.charge))
    var names = {}
    var recipes = []
    list(t.recipes).forEach(function (r) {
      var n = String(r.name || '')
      if (!/^[a-z0-9_]+$/.test(n) || names[n]) {
        problems.push('recipe name "' + n + '"')
        return
      }
      var eut = Number(r.eut)
      var duration = Number(r.duration)
      if (!(Number(r.circuit) >= 1 && Number(r.circuit) <= 32) || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
        problems.push(n + ': circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration)
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
      var itemsIn = list(r.itemsIn).map(stack)
      var fluidsIn = list(r.fluidsIn).map(fluid)
      var itemsOut = list(r.itemsOut).map(stack)
      if (bad || itemsIn.length === 0 || itemsOut.length === 0) {
        problems.push(n + ': contents ' + JSON.stringify({ itemsIn: r.itemsIn, fluidsIn: r.fluidsIn, itemsOut: r.itemsOut }))
        return
      }
      names[n] = true
      recipes.push({ name: n, circuit: Number(r.circuit), charge: r.charge === true, itemsIn: itemsIn, fluidsIn: fluidsIn, itemsOut: itemsOut,
        eut: eut, duration: duration })
    })
    if (recipes.length === 0) problems.push('no recipe')
    var casing = t.casing || {}
    var casingIn = list(casing.itemsIn).map(function (x) { return { id: String(x.id), count: Number(x.count) } })
    if (String(casing.output || '').indexOf(':') < 0 || casingIn.length === 0 || !(Number(casing.count) >= 1) || !(Number(casing.eut) > 0) ||
      !(Number(casing.duration) > 0)) problems.push('casing ' + JSON.stringify(t.casing))
    if (problems.length > 0) console.error(LOG + 'naquadria magnet works: ' + TABLE + ': ' + problems.join('; '))
    return { charge: { id: String(charge.id), amount: Number(charge.amount) }, recipes: recipes,
      casing: { output: String(casing.output), count: Number(casing.count), itemsIn: casingIn, eut: Number(casing.eut), duration: Number(casing.duration) } }
  }

  function missingIds(rec, charge) {
    var missing = []
    rec.itemsIn.concat(rec.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    var fluids = rec.fluidsIn.slice()
    if (rec.charge) fluids.push(charge)
    fluids.forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    var limits = io()
    // the programmed circuit is one more item input, the charge one more fluid input
    var itemsIn = rec.itemsIn.length + 1
    var fluidsIn = rec.fluidsIn.length + (rec.charge ? 1 : 0)
    if (itemsIn > limits.itemsIn) return itemsIn + ' item inputs (the type holds ' + limits.itemsIn + ')'
    if (fluidsIn > limits.fluidsIn) return fluidsIn + ' fluid inputs (the type holds ' + limits.fluidsIn + ')'
    if (rec.itemsOut.length > limits.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + limits.itemsOut + ')'
    return null
  }

  function add(event, rec, charge) {
    var recipe = event.recipes.gtceu.naquadria_magnets(rec.id)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.charge) recipe.notConsumableFluid(Fluid.of(charge.id, charge.amount))
    rec.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    recipe.addDataString(DATA_KEY, rec.name)
      .EUt(rec.eut)
      .duration(rec.duration)
  }

  // the lookup keys of a recipe: its items, its fluids (the charge included), its circuit
  function keysOf(rec, charge) {
    var keys = {}
    rec.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    rec.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
    if (rec.charge) keys['f:' + charge.id] = true
    keys['circuit:' + rec.circuit] = true
    return keys
  }

  // pairs where one recipe's keys are a subset of the other's (equal sets included): GTM's lookup would hide one of them
  function clashesOf(recs, charge) {
    var out = []
    var keys = recs.map(function (r) { return keysOf(r, charge) })
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
    MW.recipes = []
    MW.skipped = []
    MW.clashes = []
    var table = loadTable()
    MW.tableCharge = table.charge

    function skip(name, reason) {
      MW.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'naquadria magnet works skipped ' + name + ': ' + reason)
    }

    table.recipes.forEach(function (rec) {
      rec.id = 'grindless:' + rec.name
      rec.recipeId = 'grindless:' + TYPE_PATH + '/' + rec.name
      var missing = missingIds(rec, table.charge)
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
        add(event, rec, table.charge)
      } catch (e) {
        skip(rec.name, 'the builder failed: ' + e)
        return
      }
      MW.recipes.push(rec)
      console.info(LOG + 'naquadria_magnets ' + rec.name + ' (circuit ' + rec.circuit + (rec.charge ? ', ' + table.charge.amount + ' mB ' + table.charge.id +
        ' not consumed' : '') + '): ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })

    MW.clashes = clashesOf(MW.recipes, table.charge)
    if (MW.clashes.length > 0) {
      console.error(LOG + 'naquadria magnet works: recipes whose ingredients are a subset of another\'s (GTM\'s lookup would hide one): ' + MW.clashes.join('; '))
    }
    console.info(LOG + 'naquadria magnet works: ' + MW.recipes.length + ' recipes; skipped ' + MW.skipped.length)
    addCasing(event, table.casing)
  }

  function addCasing(event, c) {
    var missing = c.itemsIn.map(function (x) { return x.id }).concat([c.output]).filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'cryostat casing recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    var recipe = event.recipes.gtceu.assembler('grindless:cryostat_casing')
    c.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    recipe.itemOutputs(c.count + 'x ' + c.output).EUt(c.eut).duration(c.duration)
  }

  function addController(event) {
    var missing = CONTROLLER_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'naquadria magnet works controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped(CONTROLLER, ['CSC', 'MHM', 'C C'], {
      C: '#gtceu:circuits/zpm',
      S: SENSOR,
      M: MOTOR,
      H: HULL
    }).id(MW.craftingRecipe)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'naquadria magnet works recipe generation failed: ' + e)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'naquadria magnet works controller recipe failed: ' + e2)
    }
  })
})()
