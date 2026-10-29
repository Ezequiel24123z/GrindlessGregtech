// priority: -12674
// Recipes of the EV Ore Refinery (machine and recipe type: startup_scripts/grindless/ev/mega_ore_refinery.js; docs/eras/mega.md 4.6;
// package MEGA-4), generated at every server load from data/grindless/tables/mega_ore_refinery.json, and the recipe that makes the controller.
//
//   gtceu:ore_refinery   one recipe per ore, id grindless:ore_refinery/<ore> (GTM's builder puts the type in front), composed by
//                        server_scripts/grindless/lib/compose.js from GTM's LIVE recipes of this load's original recipes: the whole ore line
//                        1 raw ore -> macerator -> 2 crushed ore -> ore washer (plain water, one variant for every ore) -> 2 purified ore ->
//                        thermal centrifuge -> 2 refined ore -> macerator -> 2 dust. The start item is the RAW ore (gtceu:raw_<ore>, or
//                        minecraft:raw_iron / raw_copper / raw_gold): it is what the drills and the vein drills deliver (server_scripts/
//                        grindless/data/veins.js, hv/family_vein_drilling.js). The intermediates never leave, every chanced byproduct of the
//                        four stages stays in the outputs, and the energy is the SUM of every stage (family rule 7), spent at the table's
//                        maxEUt (EV, 512 EU/t) so a composed recipe never costs less than the stages.
//   The set is capped at ores with a live full chain: the live raw-ore macerator recipes are walked, and an ore with a missing stage or item is
//   skipped and logged with what is missing. The count and the skipped ores are printed at every load.
//   Lookup safety: GTM's recipe lookup keeps one recipe per set of ingredients (counts ignored), and a recipe whose ingredients are a subset
//   of another's can hide it. Every recipe takes its own raw ore and water; a clash is logged as an error.
//   crafting             the controller, made in the EV assembler: 4 EV macerators + 4 EV ore washers + 4 EV thermal centrifuges + 4 EV sifters +
//                        4 EV circuits (the machines it replaces). Twenty items do not fit a crafting grid.
//
// Destinations: the dusts go on to the ore line's usual users (smelting, the centrifuges, the chemical lines); every byproduct is an output
// that leaves through the output buses.
//
// Published for the tests: global.grindless.megaOreRefinery.recipes [{ id, recipeId, name, itemsIn: [{ id, count, chance }], fluidsIn: [{ id,
// amount }], itemsOut: [{ id, whole, chance }], fluidsOut, eut, duration, energy, sourceEnergy, sources }], .skipped [{ name, reason }], .clashes,
// .stagesRead, .stageIds, .candidates, .crafting, .craftingInputs.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/ev] '
  var G = global.grindless || (global.grindless = {})
  var OR = G.megaOreRefinery || (G.megaOreRefinery = {})

  var TABLE = 'kubejs/data/grindless/tables/mega_ore_refinery.json'
  var MAX_CHANCE = 10000
  var TYPE_PATH = 'ore_refinery'
  var KEYS = ['macerateRaw', 'wash', 'centrifuge', 'macerateRefined']

  var CONTROLLER = 'gtceu:ore_refinery'
  var MACHINES = ['gtceu:ev_macerator', 'gtceu:ev_ore_washer', 'gtceu:ev_thermal_centrifuge', 'gtceu:ev_sifter']
  var INPUTS = ['4x gtceu:ev_macerator', '4x gtceu:ev_ore_washer', '4x gtceu:ev_thermal_centrifuge', '4x gtceu:ev_sifter', '4x #gtceu:circuits/ev', '2x grindless:titanium_drill_bit', '2x grindless:contact_catalyst']
  OR.crafting = 'grindless:ore_refinery'
  OR.craftingInputs = INPUTS.slice()

  function io() {
    return OR.maxIO || { itemsIn: 1, itemsOut: 9, fluidsIn: 1, fluidsOut: 0 }
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var maxEut = Number(t.maxEUt)
    if (!(maxEut > 0)) problems.push('maxEUt ' + t.maxEUt)
    var given = Number(t.given)
    if (!(given > 0)) problems.push('given ' + t.given)
    KEYS.forEach(function (k) { if (!t.stages || typeof t.stages[k] !== 'string') problems.push('stages.' + k) })
    var pattern = null
    try {
      pattern = new RegExp(String(t.rawMacerate))
    } catch (e) {
      problems.push('rawMacerate ' + t.rawMacerate)
    }
    if (problems.length > 0) console.error(LOG + 'ore refinery: ' + TABLE + ': ' + problems.join('; '))
    return {
      maxEut: maxEut > 0 ? maxEut : 512,
      given: given > 0 ? given : 1,
      stages: t.stages || {},
      pattern: pattern,
      vanillaRaw: Array.isArray(t.vanillaRaw) ? t.vanillaRaw.map(String) : []
    }
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
    var recipe = event.recipes.gtceu.ore_refinery(rec.id)
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

  function fill(template, m) {
    return String(template).replace('{m}', m)
  }

  // the first item the last stage makes (the dust): the output that sorts first
  function firstOutput(step) {
    var keys = Object.keys(step.v)
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf('i:') === 0 && step.v[keys[i]] > 0) return keys[i].substring(2)
    }
    return ''
  }

  function generate(event) {
    OR.recipes = []
    OR.skipped = []
    OR.clashes = []
    OR.candidates = 0
    var table = loadTable()
    OR.maxEut = table.maxEut
    var C = G.compose

    function skip(name, reason) {
      OR.skipped.push({ name: name, reason: reason })
      console.warn(LOG + 'ore refinery skipped ' + name + ': ' + reason)
    }

    // 1. the live recipes of the three stage types, by id, and the ores with a live raw-ore macerator recipe
    var present = {}
    var ores = []
    event.originalRecipes.values().forEach(function (r) {
      var id = C.recipeId(r)
      if (id.indexOf('gtceu:macerator/') !== 0 && id.indexOf('gtceu:ore_washer/') !== 0 && id.indexOf('gtceu:thermal_centrifuge/') !== 0) return
      present[id] = true
      var m = table.pattern === null ? null : table.pattern.exec(id)
      if (m && ores.indexOf(m[1]) < 0) ores.push(m[1])
    })
    ores.sort()
    OR.candidates = ores.length

    // 2. keep the ores whose four stages and four items are live
    var plans = []
    var stageIds = []
    var tagItems = {}
    ores.forEach(function (m) {
      var ids = KEYS.map(function (k) { return fill(table.stages[k], m) })
      var gone = ids.filter(function (id) { return present[id] !== true })
      if (gone.length > 0) {
        skip(m, 'missing stage recipe(s): ' + gone.join(', '))
        return
      }
      var raw = table.vanillaRaw.indexOf(m) >= 0 ? 'minecraft:raw_' + m : 'gtceu:raw_' + m
      var crushed = 'gtceu:crushed_' + m + '_ore'
      var purified = 'gtceu:purified_' + m + '_ore'
      var refined = 'gtceu:refined_' + m + '_ore'
      var noItem = [raw, crushed, purified, refined].filter(function (id) { return !Item.exists(id) })
      if (noItem.length > 0) {
        skip(m, 'missing item(s): ' + noItem.join(', '))
        return
      }
      tagItems['forge:raw_materials/' + m] = raw
      tagItems['forge:crushed_ores/' + m] = crushed
      tagItems['forge:purified_ores/' + m] = purified
      tagItems['forge:refined_ores/' + m] = refined
      var given = {}
      given['i:' + raw] = table.given
      plans.push({ name: m, stages: ids, given: given, linked: ['i:' + crushed, 'i:' + purified, 'i:' + refined] })
      ids.forEach(function (id) { stageIds.push(id) })
    })
    OR.stageIds = stageIds
    var read = C.gather(event, stageIds, { tagItems: tagItems })
    OR.stagesRead = read.read

    // 3. compose every ore
    var made = []
    plans.forEach(function (plan) {
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
      var last = read.steps[plan.stages[plan.stages.length - 1]]
      var rec = C.contents(composed, { maxEut: table.maxEut, itemOrder: [firstOutput(last)] })
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
      OR.recipes.push(rec)
    })

    OR.clashes = clashesOf(OR.recipes)
    if (OR.clashes.length > 0) {
      console.error(LOG + 'ore refinery: recipes whose ingredients are a subset of another\'s (GTM\'s lookup would hide one): ' + OR.clashes.join('; '))
    }
    console.info(LOG + 'ore refinery: ' + OR.recipes.length + ' ore lines composed (of ' + OR.candidates + ' raw-ore macerator recipes) from ' +
      OR.stagesRead + ' of ' + stageIds.length + ' live stages; skipped ' + OR.skipped.length + (OR.skipped.length > 0
        ? ': ' + OR.skipped.map(function (s) { return s.name + ' (' + s.reason + ')' }).join('; ') : ''))
  }

  function addController(event) {
    var missing = MACHINES.concat([CONTROLLER]).filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'ore refinery controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler(OR.crafting)
      .itemInputs(INPUTS[0], INPUTS[1], INPUTS[2], INPUTS[3], INPUTS[4], INPUTS[5], INPUTS[6])
      .inputFluids(Fluid.of('gtceu:sulfuric_acid', 2000))
      .itemOutputs(CONTROLLER)
      .EUt(1920)
      .duration(400)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'ore refinery recipe generation failed: ' + e)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'ore refinery controller recipe failed: ' + e2)
    }
  })
})()
