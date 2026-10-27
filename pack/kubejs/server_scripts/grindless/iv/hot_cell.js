// priority: -16624
// -----------------------------------------------------------------------------------------------
// Recipes of IV's hot cell (machine and recipe type: startup_scripts/grindless/iv/hot_cell.js; docs/eras/iv.md, "Hot cell"; package
// IV-A3), generated at every server load from data/grindless/tables/hot_cell.json, and the recipe that makes the controller.
//
//   gtceu:hot_cell   one recipe per entry of the table, id grindless:hot_cell/<name> (GTM's builder puts the type in front); the
//                    programmed circuit is the mode, and every recipe carries the data key grindless_hot_cell = <name> (its EMI line).
//     composed[]     modes 1 (enrichment) and 4 (radon): GTM's live recipes named in the plan, read from this load's original recipes and
//                    composed by server_scripts/grindless/lib/compose.js (the EV platinum plant's composer): the same ratios, the loops
//                    closed inside (the UF6 and its fluorine; the plutonium catalyst and its dust -> ingot smelting) and the SAME
//                    energy, the sum of every stage, spent at the table's maxEUt (IV, 7 680 EU/t). A smelting stage costs what GTM's
//                    electric furnace pays for it: its EU/t is read from GTM (GTRecipeTypes.FURNACE_RECIPES' prepared builder).
//     recipes[]      modes 2 (fuel) and 3 (reprocessing): ours, as the table writes them.
//   Lookup safety: GTM's recipe lookup keeps one recipe per set of ingredients (counts ignored), and a recipe whose ingredients are a
//   subset of another's can hide it. Every recipe of the type is checked against every other at load: none may take a subset of another's
//   ingredients (the programmed circuit counts as one). A clash is logged as an error.
//   crafting         the controller (iv.md, "Built with"), made in the EV assembler: IV hull + IV centrifuge + IV chemical reactor +
//                    EV electrolyzer + 2 IV robot arms + 4 IV circuits, grindless:assembler/hot_cell. Ten items do not fit a crafting
//                    grid. GTM's IV electrolyzer needs four osmium wires, and osmium only comes from Mercury, after the hot cell: the
//                    EV electrolyzer does the line's electrolyses (GTM runs them at 120 EU/t).
//
// Destinations: U-235 and U-238 go to the fuel fabrication plant (LEU) and back into the hot cell (MOX, breeder, radon); the fluorine
// to HF (the naquadah plant, PTFE); the water to the network; radon to the Quantum Star; the plutonium to MOX, breeders, RTG pellets
// and Pu-Be sources; xenon, krypton, caesium and neodymium are stored (enriched naquadah, noble gases, naquadria, magnets); the NO2
// goes to GTM's nitric acid recipes; the waste is contained (the hot cell refuses voiding).
//
// Published for the smoke test: global.grindless.hotCell.recipes [{ id, recipeId, name, kind, circuit, itemsIn: [{ id, count, chance }],
// fluidsIn: [{ id, amount }], itemsOut: [{ id, whole, chance }], fluidsOut: [{ id, amount }], eut, duration, energy, sourceEnergy?,
// sources? }], .skipped [{ name, reason }], .clashes, .furnace { eut, from }, .stagesRead, .craftingRecipe, .craftingParts.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/iv] '
  var G = global.grindless || (global.grindless = {})
  var HC = G.hotCell || (G.hotCell = {})

  var TABLE = HC.table || 'kubejs/data/grindless/tables/hot_cell.json'
  var MAX_CHANCE = 10000
  var DATA_KEY = HC.dataKey || 'grindless_hot_cell'
  var TYPE_PATH = 'hot_cell'
  var FURNACE_FALLBACK = 4

  var ITEM_ORDER = ['gtceu:uranium_235_dust', 'gtceu:uranium_dust', 'gtceu:plutonium_dust']
  var FLUID_ORDER = ['gtceu:fluorine', 'minecraft:water', 'gtceu:radon']

  var CONTROLLER = 'gtceu:hot_cell'
  var HULL = 'gtceu:iv_machine_hull'
  var CENTRIFUGE = 'gtceu:iv_centrifuge'
  var REACTOR = 'gtceu:iv_chemical_reactor'
  var ELECTROLYZER = 'gtceu:ev_electrolyzer'
  var ARM = 'gtceu:iv_robot_arm'
  var CONTROLLER_PARTS = [HULL, CENTRIFUGE, REACTOR, ELECTROLYZER, ARM, CONTROLLER]
  HC.craftingRecipe = 'grindless:assembler/hot_cell'
  HC.craftingParts = CONTROLLER_PARTS

  function io() {
    return HC.maxIO || { itemsIn: 4, itemsOut: 6, fluidsIn: 2, fluidsOut: 4 }
  }

  // ---------------------------------------------------------------- the table

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var maxEut = Number(t.maxEUt)
    if (!(maxEut > 0)) problems.push('maxEUt ' + t.maxEUt)
    var names = {}
    function name(entry) {
      var n = String(entry.name || '')
      if (!/^[a-z0-9_]+$/.test(n) || names[n]) {
        problems.push('recipe name "' + n + '"')
        return null
      }
      if (!(Number(entry.circuit) >= 1 && Number(entry.circuit) <= 32)) {
        problems.push(n + ': circuit ' + entry.circuit)
        return null
      }
      names[n] = true
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
      var itemsIn = list(r.itemsIn).map(function (x) {
        if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1)) bad = true
        return { id: String(x.id), count: Number(x.count), chance: MAX_CHANCE }
      })
      var itemsOut = list(r.itemsOut).map(function (x) {
        var chance = x.chance === undefined ? MAX_CHANCE : Number(x.chance)
        if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1) || !(chance > 0 && chance <= MAX_CHANCE)) bad = true
        if (chance < MAX_CHANCE && Number(x.count) !== 1) bad = true
        return chance < MAX_CHANCE ? { id: String(x.id), whole: 0, chance: chance } : { id: String(x.id), whole: Number(x.count), chance: 0 }
      })
      var fluid = function (f) {
        if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
        return { id: String(f.id), amount: Number(f.amount) }
      }
      var fluidsIn = list(r.fluidsIn).map(fluid)
      var fluidsOut = list(r.fluidsOut).map(fluid)
      if (bad || itemsIn.length + fluidsIn.length === 0 || itemsOut.length + fluidsOut.length === 0) {
        problems.push(n + ': contents ' + JSON.stringify({ itemsIn: r.itemsIn, itemsOut: r.itemsOut, fluidsIn: r.fluidsIn, fluidsOut: r.fluidsOut }))
        return
      }
      own.push({ name: n, circuit: Number(r.circuit), eut: Number(r.eut), duration: Number(r.duration), itemsIn: itemsIn, fluidsIn: fluidsIn,
        itemsOut: itemsOut, fluidsOut: fluidsOut })
    })
    if (problems.length > 0) console.error(LOG + 'hot cell: ' + TABLE + ': ' + problems.join('; '))
    return { maxEut: maxEut > 0 ? maxEut : 7680, composed: composed, own: own }
  }

  // ---------------------------------------------------------------- the electric furnace's EU/t (for smelting stages)

  // GTM's electric furnace runs a smelting recipe at the EU/t its recipe type prepares every builder with (GTRecipeTypes:
  // FURNACE_RECIPES.prepareBuilder(EUt(4)) in 7.5.3), for the recipe's cooking time
  function furnaceEUt() {
    try {
      var builder = GTRecipeTypes.FURNACE_RECIPES['recipeBuilder(net.minecraft.resources.ResourceLocation)'](new ResourceLocation('grindless', 'furnace_probe'))
      var eu = Number(builder.EUt().getTotalEU())
      if (eu > 0) return { eut: eu, from: 'gtm' }
      console.warn(LOG + 'hot cell: the electric furnace builder has no EU/t, smelting stages use ' + FURNACE_FALLBACK)
    } catch (e) {
      console.warn(LOG + 'hot cell: could not read the electric furnace EU/t (' + e + '), smelting stages use ' + FURNACE_FALLBACK)
    }
    return { eut: FURNACE_FALLBACK, from: 'fallback' }
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
    var recipe = event.recipes.gtceu.hot_cell(rec.id)
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

  function generate(event) {
    HC.recipes = []
    HC.skipped = []
    HC.clashes = []
    var table = loadTable()
    HC.maxEut = table.maxEut
    HC.furnace = furnaceEUt()

    function skip(name, reason) {
      HC.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'hot cell skipped ' + name + ': ' + reason)
    }

    var stageIds = []
    table.composed.forEach(function (p) {
      p.stages.forEach(function (id) { if (stageIds.indexOf(id) < 0) stageIds.push(id) })
    })
    HC.stageIds = stageIds
    var C = G.compose
    var read = C.gather(event, stageIds, { furnaceEUt: HC.furnace.eut })
    HC.stagesRead = read.read

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
      rec.kind = 'composed'
      rec.circuit = plan.circuit
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
      HC.recipes.push(rec)
      console.info(LOG + 'hot_cell ' + rec.name + ' (circuit ' + rec.circuit + ', ' + rec.kind + '): ' + rec.duration + ' t x ' + rec.eut + ' EU/t = ' +
        rec.energy + ' EU' + (rec.kind === 'composed' ? ' from ' + rec.sources.length + ' stages (' + rec.sourceEnergy + ' EU)' : ''))
    })

    HC.clashes = clashesOf(HC.recipes)
    if (HC.clashes.length > 0) {
      console.error(LOG + 'hot cell: recipes whose ingredients are a subset of another\'s (GTM\'s lookup would hide one): ' + HC.clashes.join('; '))
    }
    console.info(LOG + 'hot cell: ' + HC.recipes.length + ' recipes (' + HC.recipes.filter(function (r) { return r.kind === 'composed' }).length +
      ' composed from ' + HC.stagesRead + ' of ' + stageIds.length + ' live stages, smelting at ' + HC.furnace.eut + ' EU/t from ' + HC.furnace.from +
      '); skipped ' + HC.skipped.length)
  }

  // ---------------------------------------------------------------- crafting

  function addController(event) {
    var missing = CONTROLLER_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'hot cell controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:hot_cell')
      .itemInputs(HULL, CENTRIFUGE, REACTOR, ELECTROLYZER, '2x ' + ARM, '4x #gtceu:circuits/iv')
      .itemOutputs(CONTROLLER)
      .EUt(1920).duration(600)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'hot cell recipe generation failed: ' + e)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'hot cell controller recipe failed: ' + e2)
    }
  })
})()
