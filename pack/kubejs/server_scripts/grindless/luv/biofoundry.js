// priority: -17624
// -----------------------------------------------------------------------------------------------
// Recipes of LuV's biofoundry (machine and recipe type: startup_scripts/grindless/luv/biofoundry.js; docs/eras/luv.md, "4. Biofoundry";
// package LuV-A5), generated at every server load from data/grindless/tables/biofoundry.json, and the recipe that makes the controller.
//
//   gtceu:sterile_culture   one recipe per entry of the table, id grindless:sterile_culture/<name> (GTM's builder puts the type in front);
//                           the programmed circuit is the step, and every recipe carries the data key grindless_biofoundry = <name>
//                           (its EMI line).
//     composed[]            steps 1 to 8, GTM's sterile chain: GTM's live recipes named in the plan, read from this load's original
//                           recipes and composed by server_scripts/grindless/lib/compose.js (the platinum plant's composer): the same
//                           ratios, the merged steps' intermediates kept inside (the gelatin mixture, the enriched sludge, the raw
//                           medium) and the SAME energy, the sum of every stage, spent at the highest EU/t among its stages. GTM's
//                           sterile cleanroom condition is not copied: the hall is the cleanroom. GTM's own recipes are not touched.
//     recipes[]             steps 9 and 10, the engineered seeds: ours, as the table writes them.
//   Lookup safety: every recipe of the type is checked against every other at load: none may take a subset of another's ingredients
//   (the programmed circuit counts as one). A clash is logged as an error.
//   assembler               the controller (luv.md: LuV hull + 2 LuV pumps + LuV sensor + 4 LuV circuits), made in the IV assembler at
//                           7,680 EU/t, grindless:assembler/biofoundry. Eight items, but the pack's controllers of this size are
//                           assembled (the hot cell, the naquadah plant).
//
// Destinations: collagen, gelatin and agar stay in the chain (gelatin and agar; the medium); the diluted sulfuric acid goes back to
// sulfuric acid (GTM's distillery) and the phosphorus to phosphoric acid for the next gelatin; the bacterial sludge of the stem cells goes
// back to mutagen (step 6); the sterile medium and the stem cells go to the organoid lab and GTM's wetware boards; the engineered seeds
// to the rotating hydroponic ring. Nothing is thrown away: the biofoundry refuses voiding.
//
// Bacteria before Europa (B8): GTM's brewery/bacteria needs a sterile cleanroom (ZPM), so at LuV the only bacteria are the algae
// bioreactor's Europan culture. GTM's bacteria recipe is cut by B8, beside its replacement; not here.
//
// Published for the smoke test: global.grindless.biofoundry.recipes [{ id, recipeId, name, kind, circuit, itemsIn: [{ id, count, chance }],
// fluidsIn: [{ id, amount }], itemsOut: [{ id, whole, chance }], fluidsOut: [{ id, amount }], eut, duration, energy, sourceEnergy?,
// sources? }], .skipped [{ name, reason }], .clashes, .stagesRead, .stageIds, .craftingRecipe, .craftingParts.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/luv] '
  var G = global.grindless || (global.grindless = {})
  var BF = G.biofoundry || (G.biofoundry = {})

  var TABLE = BF.table || 'kubejs/data/grindless/tables/biofoundry.json'
  var MAX_CHANCE = 10000
  var DATA_KEY = BF.dataKey || 'grindless_biofoundry'
  var TYPE_PATH = 'sterile_culture'

  var ITEM_ORDER = ['gtceu:collagen_dust', 'gtceu:gelatin_dust', 'gtceu:agar_dust', 'gtceu:stem_cells', 'gtceu:phosphorus_dust']
  var FLUID_ORDER = ['gtceu:sterilized_growth_medium', 'gtceu:mutagen', 'gtceu:bacterial_sludge', 'gtceu:diluted_sulfuric_acid']

  var CONTROLLER = 'gtceu:biofoundry'
  var HULL = 'gtceu:luv_machine_hull'
  var PUMP = 'gtceu:luv_electric_pump'
  var SENSOR = 'gtceu:luv_sensor'
  var CONTROLLER_PARTS = [HULL, PUMP, SENSOR, CONTROLLER]
  BF.craftingRecipe = 'grindless:assembler/biofoundry'
  BF.craftingParts = CONTROLLER_PARTS

  function io() {
    return BF.maxIO || { itemsIn: 5, itemsOut: 2, fluidsIn: 2, fluidsOut: 1 }
  }

  // ---------------------------------------------------------------- the table

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var names = {}
    var circuits = {}
    function name(entry) {
      var n = String(entry.name || '')
      if (!/^[a-z0-9_]+$/.test(n) || names[n]) {
        problems.push('recipe name "' + n + '"')
        return null
      }
      var c = Number(entry.circuit)
      if (!(c >= 1 && c <= 32) || circuits[c]) {
        problems.push(n + ': circuit ' + entry.circuit + ' (every step has its own)')
        return null
      }
      names[n] = true
      circuits[c] = true
      return n
    }
    var composed = []
    list(t.composed).forEach(function (p) {
      var n = name(p)
      if (n === null) return
      if (list(p.stages).length === 0 || !p.given || Object.keys(p.given).length === 0 || !Array.isArray(p.linked)) {
        problems.push(n + ': stages, given and linked are needed')
        return
      }
      composed.push({ name: n, circuit: Number(p.circuit), stages: p.stages.map(String), given: p.given, linked: p.linked.map(String) })
    })
    var own = []
    list(t.recipes).forEach(function (r) {
      var n = name(r)
      if (n === null) return
      if (!(Number(r.eut) > 0) || !(Number(r.duration) > 0)) {
        problems.push(n + ': eut and duration are needed')
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
      var itemsIn = list(r.itemsIn).map(item).map(function (x) { return { id: x.id, count: x.count, chance: MAX_CHANCE } })
      var itemsOut = list(r.itemsOut).map(item).map(function (x) { return { id: x.id, whole: x.count, chance: 0 } })
      var fluidsIn = list(r.fluidsIn).map(fluid)
      var fluidsOut = list(r.fluidsOut).map(fluid)
      if (bad || itemsIn.length + fluidsIn.length === 0 || itemsOut.length + fluidsOut.length === 0) {
        problems.push(n + ': contents ' + JSON.stringify({ itemsIn: r.itemsIn, itemsOut: r.itemsOut, fluidsIn: r.fluidsIn, fluidsOut: r.fluidsOut }))
        return
      }
      own.push({ name: n, circuit: Number(r.circuit), eut: Number(r.eut), duration: Number(r.duration), itemsIn: itemsIn, fluidsIn: fluidsIn,
        itemsOut: itemsOut, fluidsOut: fluidsOut })
    })
    if (problems.length > 0) console.error(LOG + 'biofoundry: ' + TABLE + ': ' + problems.join('; '))
    return { composed: composed, own: own }
  }

  // ---------------------------------------------------------------- building recipes

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    rec.fluidsIn.concat(rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    var limits = io()
    var entries = 0
    rec.itemsOut.forEach(function (o) {
      if (o.whole > 0) entries++
      if (o.chance > 0) entries++
    })
    // the programmed circuit is one more item input
    if (rec.itemsIn.length + 1 > limits.itemsIn) return (rec.itemsIn.length + 1) + ' item inputs (the type holds ' + limits.itemsIn + ')'
    if (entries > limits.itemsOut) return entries + ' item outputs (the type holds ' + limits.itemsOut + ')'
    if (rec.fluidsIn.length > limits.fluidsIn) return rec.fluidsIn.length + ' fluid inputs (the type holds ' + limits.fluidsIn + ')'
    if (rec.fluidsOut.length > limits.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + limits.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu.sterile_culture(rec.id)
    rec.itemsIn.forEach(function (x) {
      if (x.chance >= MAX_CHANCE) recipe.itemInputs(x.count + 'x ' + x.id)
      else recipe.chancedInput(x.count + 'x ' + x.id, x.chance, 0)
    })
    recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (o) {
      if (o.whole > 0) recipe.itemOutputs(o.whole + 'x ' + o.id)
      if (o.chance > 0) recipe.chancedOutput('1x ' + o.id, o.chance, 0)
    })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    recipe.addDataString(DATA_KEY, rec.name)
      .EUt(rec.eut)
      .duration(rec.duration)
  }

  // the lookup keys of a recipe: its items, its fluids and its circuit
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

  // the highest EU/t among a plan's stages: the composed recipe never draws more per tick than GTM's own steps
  function stageEUt(plan, steps) {
    var top = 0
    plan.stages.forEach(function (id) {
      var s = steps[id]
      if (s && !s.error && Number(s.eut) > top) top = Number(s.eut)
    })
    return top
  }

  function generate(event) {
    BF.recipes = []
    BF.skipped = []
    BF.clashes = []
    var table = loadTable()

    function skip(name, reason) {
      BF.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'biofoundry skipped ' + name + ': ' + reason)
    }

    var stageIds = []
    table.composed.forEach(function (p) {
      p.stages.forEach(function (id) { if (stageIds.indexOf(id) < 0) stageIds.push(id) })
    })
    BF.stageIds = stageIds
    var C = G.compose
    var read = C.gather(event, stageIds, {})
    BF.stagesRead = read.read

    var made = []
    table.composed.forEach(function (plan) {
      var composed
      try {
        composed = C.compose(plan, read.steps)
      } catch (e) {
        composed = { error: String(e) }
      }
      if (composed.error) {
        skip(plan.name, composed.error)
        return
      }
      var maxEut = stageEUt(plan, read.steps)
      if (!(maxEut > 0)) {
        skip(plan.name, 'no stage EU/t')
        return
      }
      var rec = C.contents(composed, { maxEut: maxEut, itemOrder: ITEM_ORDER, fluidOrder: FLUID_ORDER })
      rec.name = plan.name
      rec.kind = 'composed'
      rec.circuit = plan.circuit
      rec.maxEut = maxEut
      made.push(rec)
    })
    table.own.forEach(function (r) {
      made.push({
        name: r.name, kind: 'own', circuit: r.circuit, itemsIn: r.itemsIn, fluidsIn: r.fluidsIn, itemsOut: r.itemsOut, fluidsOut: r.fluidsOut,
        eut: r.eut, duration: r.duration, energy: r.eut * r.duration
      })
    })

    made.forEach(function (rec) {
      rec.id = 'grindless:' + rec.name
      rec.recipeId = 'grindless:' + TYPE_PATH + '/' + rec.name
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
      BF.recipes.push(rec)
      console.info(LOG + 'sterile_culture ' + rec.name + ' (circuit ' + rec.circuit + ', ' + rec.kind + '): ' + rec.duration + ' t x ' + rec.eut + ' EU/t = ' +
        rec.energy + ' EU' + (rec.kind === 'composed' ? ' from ' + rec.sources.length + ' stages (' + rec.sourceEnergy + ' EU)' : ''))
    })

    BF.clashes = clashesOf(BF.recipes)
    if (BF.clashes.length > 0) {
      console.error(LOG + 'biofoundry: recipes whose ingredients are a subset of another\'s (GTM\'s lookup would hide one): ' + BF.clashes.join('; '))
    }
    console.info(LOG + 'biofoundry: ' + BF.recipes.length + ' recipes (' + BF.recipes.filter(function (r) { return r.kind === 'composed' }).length +
      ' composed from ' + BF.stagesRead + ' of ' + stageIds.length + ' live stages); skipped ' + BF.skipped.length)
  }

  // ---------------------------------------------------------------- the controller

  function addController(event) {
    var missing = CONTROLLER_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'biofoundry controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:biofoundry')
      .itemInputs(HULL, '2x ' + PUMP, SENSOR, '4x #gtceu:circuits/luv')
      .itemOutputs(CONTROLLER)
      .EUt(7680).duration(600)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'biofoundry recipe generation failed: ' + e)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'biofoundry controller recipe failed: ' + e2)
    }
  })
})()
