// priority: -18474
// -----------------------------------------------------------------------------------------------
// Recipes of the LuV Mega Chemical Complex (machine and recipe type: startup_scripts/grindless/luv/mega_chemical_complex.js; docs/eras/mega.md
// 4.8; package MEGA-6), generated at every server load from data/grindless/tables/mega_chemical_complex.json, and the recipe that makes the
// controller.
//
//   gtceu:mega_chemical_complex   one recipe per line of the table, id grindless:mega_chemical_complex/<name> (GTM's builder puts the type in
//                                 front): the live recipes named in the plan, read from this load's original recipes and composed by
//                                 server_scripts/grindless/lib/compose.js (gather -> compose -> contents): the same ratios, the intermediates
//                                 closed inside, every byproduct (HCl, water, salts...) leaving as an output (rule 3) and the SAME energy, the
//                                 sum of every stage (family rule 7), spent at the table's maxEUt (LuV, 32768 EU/t) so a composed recipe never
//                                 costs less than its stages. The recipes of the large chemical reactor mode are GTM's own, untouched.
//   Gregicality's fluids (gcyr:) are not found by compose's tag rule (a tag forge:<m> is the fluid gtceu:<m>), so gather's patch hook names
//   them: the tags of GCYR_FLUIDS in a stage's JSON become the fluid gcyr:<m>.
//   A line whose stages are not all live is skipped and logged with the missing stage: nothing is made up.
//   Lookup safety: GTM's recipe lookup keeps one recipe per set of ingredients (counts ignored), and a recipe whose ingredients are a subset
//   of another's can hide it. The lines take different ingredients; a clash is logged as an error.
//   crafting                      the controller, made in the LuV assembler: 4 coil chemical plants + 16 LuV chemical reactors + 4 LuV
//                                 circuits + 16 PTFE frames (the machines it replaces). Too many items for a crafting grid.
//
// Destinations: the HCl goes to the chlorine, vinyl chloride and bisphenol A recipes of the chemical reactor, the water and the salt water to
// the electrolyzer and the centrifuge, the ammonium chloride to the electrolyzer, the acetone to the bisphenol A line again.
//
// Published for the tests: global.grindless.megaChemicalComplex.recipes [{ id, recipeId, name, itemsIn: [{ id, count, chance }],
// fluidsIn: [{ id, amount }], itemsOut: [{ id, whole, chance }], fluidsOut: [{ id, amount }], eut, duration, energy, sourceEnergy, sources }],
// .skipped [{ name, reason }], .clashes, .stagesRead, .stageIds, .crafting, .craftingInputs.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/luv] '
  var G = global.grindless || (global.grindless = {})
  var MC = G.megaChemicalComplex || (G.megaChemicalComplex = {})

  var TABLE = 'kubejs/data/grindless/tables/mega_chemical_complex.json'
  var MAX_CHANCE = 10000
  var TYPE_PATH = 'mega_chemical_complex'

  var ITEM_ORDER = ['gtceu:ammonium_chloride_dust']
  var FLUID_ORDER = ['gtceu:polytetrafluoroethylene', 'gtceu:epoxy', 'gcyr:para_aramid', 'gtceu:hydrochloric_acid']
  var GCYR_FLUIDS = [
    'nitroaniline', 'para_phenylenediamine', 'bis_trichloromethyl_benzene', 'therephthalic_acid', 'terephthaloyl_chloride',
    'para_xylene', 'methylbenzaldehyde'
  ]

  var CONTROLLER = 'gtceu:mega_chemical_complex'
  var MACHINES = ['gtceu:coil_chemical_plant', 'gtceu:luv_chemical_reactor', 'gtceu:polytetrafluoroethylene_frame']
  var INPUTS = ['4x gtceu:coil_chemical_plant', '16x gtceu:luv_chemical_reactor', '4x #gtceu:circuits/luv', '16x gtceu:polytetrafluoroethylene_frame', '2x grindless:ion_exchange_resin', '2x grindless:contact_catalyst']
  MC.crafting = 'grindless:mega_chemical_complex'
  MC.craftingInputs = INPUTS.slice()

  function io() {
    return MC.maxIO || { itemsIn: 3, itemsOut: 3, fluidsIn: 8, fluidsOut: 6 }
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
    if (problems.length > 0) console.error(LOG + 'mega chemical complex: ' + TABLE + ': ' + problems.join('; '))
    return { maxEut: maxEut > 0 ? maxEut : 32768, composed: composed }
  }

  // forge:<m> of a Gregicality fluid -> the fluid gcyr:<m>
  function patchStage(id, json) {
    var text = JSON.stringify(json)
    GCYR_FLUIDS.forEach(function (m) {
      text = text.split('{"tag":"forge:' + m + '"}').join('{"fluid":"gcyr:' + m + '"}')
    })
    return JSON.parse(text)
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
    var recipe = event.recipes.gtceu.mega_chemical_complex(rec.id)
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
    MC.recipes = []
    MC.skipped = []
    MC.clashes = []
    var table = loadTable()
    MC.maxEut = table.maxEut

    function skip(name, reason) {
      MC.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'mega chemical complex skipped ' + name + ': ' + reason)
    }

    var stageIds = []
    table.composed.forEach(function (p) {
      p.stages.forEach(function (id) { if (stageIds.indexOf(id) < 0) stageIds.push(id) })
    })
    MC.stageIds = stageIds
    var C = G.compose
    var read = C.gather(event, stageIds, { patch: patchStage })
    MC.stagesRead = read.read

    var made = []
    table.composed.forEach(function (plan) {
      var missingStages = plan.stages.filter(function (id) { return !read.steps[id] || read.steps[id].error })
      if (missingStages.length > 0) {
        skip(plan.name, 'missing stage(s): ' + missingStages.join(', '))
        return
      }
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
      MC.recipes.push(rec)
      console.info(LOG + 'mega_chemical_complex ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t = ' + rec.energy + ' EU from ' +
        rec.sources.length + ' stages (' + rec.sourceEnergy + ' EU)')
    })

    MC.clashes = clashesOf(MC.recipes)
    if (MC.clashes.length > 0) {
      console.error(LOG + 'mega chemical complex: recipes whose ingredients are a subset of another\'s (GTM\'s lookup would hide one): ' + MC.clashes.join('; '))
    }
    console.info(LOG + 'mega chemical complex: ' + MC.recipes.length + ' lines composed from ' + MC.stagesRead + ' of ' + stageIds.length +
      ' live stages; skipped ' + MC.skipped.length + (MC.skipped.length > 0 ? ' (' + MC.skipped.map(function (s) { return s.name + ': ' + s.reason }).join('; ') + ')' : ''))
  }

  function addController(event) {
    var missing = MACHINES.concat([CONTROLLER]).filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'mega chemical complex controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    var rc = event.recipes.gtceu.assembly_line(MC.crafting)
    INPUTS.forEach(function (x) { rc.itemInputs(x) })
    rc.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 1000))
      .itemOutputs(CONTROLLER)
      .EUt(30720)
      .duration(1200)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'mega chemical complex recipe generation failed: ' + e)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'mega chemical complex controller recipe failed: ' + e2)
    }
  })
})()
