// priority: -21074
// -----------------------------------------------------------------------------------------------
// Recipes of the MV Polymer Works (machine and recipe type: startup_scripts/grindless/mv/mega_polymer_works.js; docs/eras/mega.md 4.4;
// package MEGA-2), generated at every server load from data/grindless/tables/mega_polymer_works.json, and the recipe that makes the
// controller.
//
//   gtceu:polymer_works   one recipe per line of the table, id grindless:polymer_works/<name> (GTM's builder puts the type in front): GTM's
//                         live recipes named in the plan, read from this load's original recipes and composed by
//                         server_scripts/grindless/lib/compose.js: the same ratios, the loops closed inside (the ethylene, the polyethylene
//                         and the rubber never leave) and the SAME energy, the sum of every stage (family rule 7), spent at the table's
//                         maxEUt (MV, 128 EU/t) so a composed recipe never costs less than the stages. The plate mold of the fluid
//                         solidifier is a catalyst (chance 0) and is not part of the recipe.
//   A line whose stages are not all live is skipped and logged: nothing is made up.
//   Lookup safety: GTM's recipe lookup keeps one recipe per set of ingredients (counts ignored), and a recipe whose ingredients are a
//   subset of another's can hide it. The two lines take different ingredients; a clash is logged as an error.
//   crafting              the controller, made in the MV assembler: 2 MV chemical reactors + 2 MV fluid solidifiers + 2 MV mixers + 4 MV
//                         circuits (the machines it replaces). Ten items do not fit a crafting grid.
//
// Destinations: the plates go to the assembler, the extruder and the cable lines; the diluted sulfuric acid goes back to the sulfuric acid
// recipes of the chemical reactor.
//
// Published for the tests: global.grindless.megaPolymerWorks.recipes [{ id, recipeId, name, itemsIn: [{ id, count, chance }],
// fluidsIn: [{ id, amount }], itemsOut: [{ id, whole, chance }], fluidsOut: [{ id, amount }], eut, duration, energy, sourceEnergy, sources }],
// .skipped [{ name, reason }], .clashes, .stagesRead, .stageIds, .crafting, .craftingInputs.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/mv] '
  var G = global.grindless || (global.grindless = {})
  var PW = G.megaPolymerWorks || (G.megaPolymerWorks = {})

  var TABLE = 'kubejs/data/grindless/tables/mega_polymer_works.json'
  var MAX_CHANCE = 10000
  var TYPE_PATH = 'polymer_works'

  var ITEM_ORDER = ['gtceu:polyethylene_plate', 'gtceu:rubber_plate']
  var FLUID_ORDER = ['gtceu:diluted_sulfuric_acid']

  var CONTROLLER = 'gtceu:polymer_works'
  var MACHINES = ['gtceu:mv_chemical_reactor', 'gtceu:mv_fluid_solidifier', 'gtceu:mv_mixer']
  var INPUTS = ['2x gtceu:mv_chemical_reactor', '2x gtceu:mv_fluid_solidifier', '2x gtceu:mv_mixer', '4x #gtceu:circuits/mv', '2x grindless:contact_catalyst']
  PW.crafting = 'grindless:polymer_works'
  PW.craftingInputs = INPUTS.slice()

  function io() {
    return PW.maxIO || { itemsIn: 2, itemsOut: 2, fluidsIn: 3, fluidsOut: 2 }
  }

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var maxEut = Number(t.maxEUt)
    if (!(maxEut > 0)) problems.push('maxEUt ' + t.maxEUt)
    var names = {}
    var composed = []
    list(t.composed).forEach(function (p) {
      var n = String(p.name || '')
      if (!/^[a-z0-9_]+$/.test(n) || names[n]) {
        problems.push('recipe name "' + n + '"')
        return
      }
      names[n] = true
      if (list(p.stages).length === 0 || !p.given || Object.keys(p.given).length === 0 || !Array.isArray(p.linked)) {
        problems.push(n + ': stages, given and linked are needed')
        return
      }
      composed.push({ name: n, stages: p.stages.map(String), given: p.given, linked: p.linked.map(String) })
    })
    if (problems.length > 0) console.error(LOG + 'polymer works: ' + TABLE + ': ' + problems.join('; '))
    return { maxEut: maxEut > 0 ? maxEut : 128, composed: composed }
  }

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
    if (rec.itemsIn.length > limits.itemsIn) return rec.itemsIn.length + ' item inputs (the type holds ' + limits.itemsIn + ')'
    if (entries > limits.itemsOut) return entries + ' item outputs (the type holds ' + limits.itemsOut + ')'
    if (rec.fluidsIn.length > limits.fluidsIn) return rec.fluidsIn.length + ' fluid inputs (the type holds ' + limits.fluidsIn + ')'
    if (rec.fluidsOut.length > limits.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + limits.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu.polymer_works(rec.id)
    rec.itemsIn.forEach(function (x) {
      if (x.chance >= MAX_CHANCE) recipe.itemInputs(x.count + 'x ' + x.id)
      else recipe.chancedInput(x.count + 'x ' + x.id, x.chance, 0)
    })
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (o) {
      if (o.whole > 0) recipe.itemOutputs(o.whole + 'x ' + o.id)
      if (o.chance > 0) recipe.chancedOutput('1x ' + o.id, o.chance, 0)
    })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    recipe.EUt(rec.eut).duration(rec.duration)
  }

  function keysOf(rec) {
    var keys = {}
    rec.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    rec.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
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
    PW.recipes = []
    PW.skipped = []
    PW.clashes = []
    var table = loadTable()
    PW.maxEut = table.maxEut

    function skip(name, reason) {
      PW.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'polymer works skipped ' + name + ': ' + reason)
    }

    var stageIds = []
    table.composed.forEach(function (p) {
      p.stages.forEach(function (id) { if (stageIds.indexOf(id) < 0) stageIds.push(id) })
    })
    PW.stageIds = stageIds
    var C = G.compose
    var read = C.gather(event, stageIds, {})
    PW.stagesRead = read.read

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
      var rec = C.contents(composed, { maxEut: table.maxEut, itemOrder: ITEM_ORDER, fluidOrder: FLUID_ORDER })
      rec.name = plan.name
      made.push(rec)
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
      PW.recipes.push(rec)
      console.info(LOG + 'polymer_works ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t = ' + rec.energy + ' EU from ' +
        rec.sources.length + ' stages (' + rec.sourceEnergy + ' EU)')
    })

    PW.clashes = clashesOf(PW.recipes)
    if (PW.clashes.length > 0) {
      console.error(LOG + 'polymer works: recipes whose ingredients are a subset of another\'s (GTM\'s lookup would hide one): ' + PW.clashes.join('; '))
    }
    console.info(LOG + 'polymer works: ' + PW.recipes.length + ' recipes composed from ' + PW.stagesRead + ' of ' + stageIds.length +
      ' live stages; skipped ' + PW.skipped.length)
  }

  function addController(event) {
    var missing = MACHINES.concat([CONTROLLER]).filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'polymer works controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler(PW.crafting)
      .itemInputs(INPUTS[0], INPUTS[1], INPUTS[2], INPUTS[3], INPUTS[4])
      .itemOutputs(CONTROLLER)
      .EUt(120)
      .duration(400)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'polymer works recipe generation failed: ' + e)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'polymer works controller recipe failed: ' + e2)
    }
  })
})()
