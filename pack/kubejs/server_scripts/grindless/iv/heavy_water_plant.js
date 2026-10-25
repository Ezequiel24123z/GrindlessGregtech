// -----------------------------------------------------------------------------------------------
// Recipes of IV's heavy-water plant (machine and recipe type: startup_scripts/grindless/iv/heavy_water_plant.js; docs/eras/iv.md,
// "Heavy-water plant"; package IV-A5), generated at every server load from data/grindless/tables/heavy_water_plant.json, and the recipe
// that makes the controller.
//
//   gtceu:isotope_exchange   one recipe per entry of the table, id grindless:isotope_exchange/<name> (GTM's builder puts the type in
//                            front); the programmed circuit is the mode (1 exchange, 2 finishing), and every recipe carries the data key
//                            grindless_isotope_exchange = <name> (its EMI line).
//     energy                 the sum of the entry's stages, each at the rate of the GTM recipe it names, spent at no more than the
//                            entry's maxEUt: duration = ceil(energy / maxEUt), EU/t = ceil(energy / duration) (the hot cell's rule).
//     charge                 an entry with "charge": true takes the table's charge (1 000 mB of hydrogen sulfide) as GTM's non-consumed
//                            fluid input (notConsumableFluid: chance 0): needed to start, never drained, taken once whatever the
//                            overclock or parallels.
//   Lookup safety: GTM's recipe lookup keeps one recipe per set of ingredients (counts ignored), and a recipe whose ingredients are a
//   subset of another's can hide it. The recipes of the type are checked against each other at load (the circuit and the charge count as
//   ingredients); a clash is logged as an error.
//   crafting                 the controller (iv.md, "Controller"): IV hull + distillation tower + IV fluid heater + 2 IV electric pumps
//                            + 4 IV circuits, in a crafting grid (grindless:crafting/heavy_water_plant, GTM's shaped recipe).
//
// Destinations: the heavy water goes to the fission reactor's heavy-water cores (IV-A2) and to IV-A1's electrolysis (deuterium for LuV,
// and oxygen); the concentrate goes back into the plant (circuit 2); the distilled water to the network; the depleted water is inert
// (the network, or voided).
//
// Published for the smoke test: global.grindless.heavyWaterPlant.recipes [{ id, recipeId, name, mode, circuit, charge, itemsIn: [{ id,
// count }], fluidsIn: [{ id, amount }], fluidsOut: [{ id, amount }], stages: [{ stage, from, euPer, per, amount, eu }], sourceEnergy, eut,
// duration, energy }], .skipped [{ name, reason }], .clashes, .craftingRecipe, .craftingParts.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/iv] '
  var G = global.grindless || (global.grindless = {})
  var HW = G.heavyWaterPlant || (G.heavyWaterPlant = {})

  var TABLE = HW.table || 'kubejs/data/grindless/tables/heavy_water_plant.json'
  var DATA_KEY = HW.dataKey || 'grindless_isotope_exchange'
  var TYPE_PATH = 'isotope_exchange'

  var CONTROLLER = 'gtceu:heavy_water_plant'
  var HULL = 'gtceu:iv_machine_hull'
  var TOWER = 'gtceu:distillation_tower'
  var HEATER = 'gtceu:iv_fluid_heater'
  var PUMP = 'gtceu:iv_electric_pump'
  var CONTROLLER_PARTS = [HULL, TOWER, HEATER, PUMP, CONTROLLER]
  HW.craftingRecipe = 'grindless:crafting/heavy_water_plant'
  HW.craftingParts = CONTROLLER_PARTS

  function io() {
    return HW.maxIO || { itemsIn: 2, itemsOut: 0, fluidsIn: 2, fluidsOut: 3 }
  }

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  // ---------------------------------------------------------------- the table

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
      if (!(Number(r.circuit) >= 1 && Number(r.circuit) <= 32) || !(Number(r.maxEUt) > 0)) {
        problems.push(n + ': circuit ' + r.circuit + ', maxEUt ' + r.maxEUt)
        return
      }
      var bad = false
      var itemsIn = list(r.itemsIn).map(function (x) {
        if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1)) bad = true
        return { id: String(x.id), count: Number(x.count) }
      })
      var fluid = function (f) {
        if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
        return { id: String(f.id), amount: Number(f.amount) }
      }
      var fluidsIn = list(r.fluidsIn).map(fluid)
      var fluidsOut = list(r.fluidsOut).map(fluid)
      var stages = list(r.energy).map(function (s) {
        var euPer = Number(s.euPer)
        var per = Number(s.per)
        var amount = Number(s.amount)
        if (!(euPer > 0) || !(per > 0) || !(amount > 0)) bad = true
        return { stage: String(s.stage || ''), from: String(s.from || ''), euPer: euPer, per: per, amount: amount, eu: euPer * amount / per }
      })
      if (bad || stages.length === 0 || itemsIn.length + fluidsIn.length === 0 || fluidsOut.length === 0) {
        problems.push(n + ': contents ' + JSON.stringify({ itemsIn: r.itemsIn, fluidsIn: r.fluidsIn, fluidsOut: r.fluidsOut, energy: r.energy }))
        return
      }
      names[n] = true
      recipes.push({ name: n, mode: String(r.mode || ''), circuit: Number(r.circuit), charge: r.charge === true, maxEut: Number(r.maxEUt),
        itemsIn: itemsIn, fluidsIn: fluidsIn, fluidsOut: fluidsOut, stages: stages })
    })
    if (recipes.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'heavy-water plant: ' + TABLE + ': ' + problems.join('; '))
    return { charge: { id: String(charge.id), amount: Number(charge.amount) }, recipes: recipes }
  }

  // ---------------------------------------------------------------- building recipes

  // the stages' energy spent at no more than maxEut: the shortest whole duration, then the smallest EU/t that pays for it
  function price(rec) {
    var source = rec.stages.reduce(function (a, s) { return a + s.eu }, 0)
    var duration = Math.max(1, Math.ceil(source / rec.maxEut))
    var eut = Math.ceil(source / duration)
    rec.sourceEnergy = source
    rec.duration = duration
    rec.eut = eut
    rec.energy = eut * duration
  }

  function missingIds(rec, charge) {
    var missing = []
    rec.itemsIn.forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    var fluids = rec.fluidsIn.concat(rec.fluidsOut)
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
    if (rec.fluidsOut.length > limits.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + limits.fluidsOut + ')'
    return null
  }

  function add(event, rec, charge) {
    var recipe = event.recipes.gtceu.isotope_exchange(rec.id)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.charge) recipe.notConsumableFluid(Fluid.of(charge.id, charge.amount))
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
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
    HW.recipes = []
    HW.skipped = []
    HW.clashes = []
    var table = loadTable()
    HW.tableCharge = table.charge

    function skip(name, reason) {
      HW.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'heavy-water plant skipped ' + name + ': ' + reason)
    }

    table.recipes.forEach(function (rec) {
      rec.id = 'grindless:' + rec.name
      rec.recipeId = 'grindless:' + TYPE_PATH + '/' + rec.name
      price(rec)
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
      HW.recipes.push(rec)
      console.info(LOG + 'isotope_exchange ' + rec.name + ' (circuit ' + rec.circuit + (rec.charge ? ', ' + table.charge.amount + ' mB ' + table.charge.id +
        ' not consumed' : '') + '): ' + rec.duration + ' t x ' + rec.eut + ' EU/t = ' + rec.energy + ' EU for ' + rec.sourceEnergy.toFixed(1) +
        ' EU of stages (' + rec.stages.map(function (s) { return s.stage + ' ' + s.eu.toFixed(1) }).join(', ') + ')')
    })

    HW.clashes = clashesOf(HW.recipes, table.charge)
    if (HW.clashes.length > 0) {
      console.error(LOG + 'heavy-water plant: recipes whose ingredients are a subset of another\'s (GTM\'s lookup would hide one): ' + HW.clashes.join('; '))
    }
    console.info(LOG + 'heavy-water plant: ' + HW.recipes.length + ' recipes; skipped ' + HW.skipped.length)
  }

  // ---------------------------------------------------------------- crafting

  function addController(event) {
    var missing = CONTROLLER_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'heavy-water plant controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped(CONTROLLER, ['CDC', 'PHP', 'CFC'], {
      C: '#gtceu:circuits/iv',
      D: TOWER,
      P: PUMP,
      H: HULL,
      F: HEATER
    }).id(HW.craftingRecipe)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'heavy-water plant recipe generation failed: ' + e)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'heavy-water plant controller recipe failed: ' + e2)
    }
  })
})()
