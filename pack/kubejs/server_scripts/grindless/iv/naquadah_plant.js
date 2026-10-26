// -----------------------------------------------------------------------------------------------
// Recipes of the naquadah plant (machine and recipe type: startup_scripts/grindless/iv/naquadah_plant.js; docs/eras/iv.md, "Naquadah
// plant", package IV-B3; mode 2 is LuV's, docs/eras/luv.md "Naquadah plant, mode 2: the exact balance", package A2), generated at every
// server load from data/grindless/tables/naquadah_plant.json, and the recipe that makes the controller.
//
//   gtceu:naquadah_refining   one recipe per entry of the table's composed[], id grindless:naquadah_refining/<name> (GTM's builder puts
//                             the type in front); the programmed circuit is the mode, and every recipe carries the data key
//                             grindless_naquadah_plant = <name> (its EMI line).
//     composed[]   GT--'s live naquadah line, read from this load's original recipes and composed by server_scripts/grindless/lib/compose.js:
//                  the same ratios, the loops closed inside and the SAME energy, the sum of every stage, spent at the plan's maxEUt (the
//                  table's, IV's 7,680 EU/t, unless the plan names its own: mode 2 is LuV, 30,720 EU/t). Nothing of GT--'s numbers is typed here.
//       circuit 1  naquadah            (IV) naquadah oxide mixture -> naquadah, the HSbF6 made inside from Sb2O3 and HF.
//       circuit 2  enriched_naquadah   (LuV) enriched naquadah oxide mixture -> enriched naquadah sulfate, trinium sulfide, impure
//                                      naquadria solution, titanium and HF, with full recovery: the xenon, gold, antimony and Pd/C stay
//                                      inside (the plan's `recovered` keys leave the balance and its `charges` sit in the recipe, not
//                                      consumed but the catalyst's wear); fluorine, hydrogen, sulfuric acid and the oxide are used up.
//       circuit 3  spent_naquadah      (LuV) reactor III's spent rods, macerated: naquadah dust through GT--'s naquadah_separation, then the
//                                      same stages as circuit 2 (decision 21).
//     the window   GT--'s neutron activator recipes carry no EU: their neutron energy comes from accelerator hatches and must sit in a
//                  window when a run starts. The plant takes the table's Pu-Be source instead (a chanced input: `chance` of 10 000 per
//                  activator run, so the recipe's chance is that times how often the plan runs the activator) and charges the activator
//                  stage the accelerators' upkeep, read as that stage's EU/t: decayEv / decayTicks / evPerEu (GT--'s constants, see the
//                  table): 72 000 eV lost every 20 ticks while the accelerators rest, paid back at 15 eV per EU, so 240 EU/t over its run.
//     the pins     every stage id is pinned to GT-- 1.3.10 (the table's gtnnVersion; pack/mods/gtnn.pw.toml). A pinned stage that is missing
//                  from the loaded recipes, or empty (no inputs and no outputs: GT-- empties the recipes it replaces), or one of the
//                  table's `rejected` placeholders, is an ERROR in the log and its mode is not built (spike S0-11: the pins fail
//                  loudly). tools/analysis/test/naquadah-mode2.test.mjs runs this script on the pinned recipes and checks the balance.
//     keep         a plan with keep: true (mode 2) carries the data boolean grindless_naquadah_keep; the plant refuses voiding while it runs
//                  those recipes (startup script: lib/no_voiding.js in the modifier and in beforeWorking). The impure naquadria solution
//                  is contained, and the trinium sulfide and the sulfate are kept.
//   Lookup safety: every recipe of the type has its own circuit.
//   crafting         the controller (iv.md, "Built with"), made in the assembler: IV hull + IV chemical reactor + IV mixer + IV centrifuge +
//                    2 IV electric pumps + 4 IV circuits, grindless:assembler/naquadah_plant. Ten items do not fit a crafting grid.
//
// Destinations: naquadah dust goes to GTM's 5,000 K blast furnace (ingots, the boule), or to circuit 3 when it comes from spent rods;
// titanium to the titanium loop (iv.md decision 9); gallium to gallium arsenide; the hydrogen and the water to the network; mode 2's
// enriched naquadah sulfate to GT--'s 7,000 K blast furnace (enriched naquadah, reactor III's rods), its trinium sulfide to the 7,200 K
// one (trinium), its impure naquadria solution to a quantum tank (ZPM's), its HF to mode 1. The HF and fluorine come from the fluorspar
// kiln and the antimony trioxide from GTM's chemical reactor.
//
// Published for the smoke tests: global.grindless.naquadahPlant.recipes [{ id, recipeId, name, circuit, maxEut, keep, itemsIn: [{ id,
// count, chance }], fluidsIn: [{ id, amount }], charges: [{ item | fluid, count | amount, chance }], itemsOut: [{ id, whole, chance }],
// fluidsOut: [{ id, amount }], eut, duration, energy, sourceEnergy, sources, recovered, activatorRuns, batches }], .skipped [{ name,
// reason }], .pins { <stage id>: 'ok' | 'missing' | 'empty' | 'rejected' }, .stagesRead, .stageIds, .accelerator { upkeepEUt, evPerEu,
// decayEv, decayTicks }, .source, .gtnnVersion, .keepKey, .craftingRecipe, .craftingParts.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/iv] '
  var G = global.grindless || (global.grindless = {})
  var NP = G.naquadahPlant || (G.naquadahPlant = {})

  var TABLE = NP.table || 'kubejs/data/grindless/tables/naquadah_plant.json'
  var MAX_CHANCE = 10000
  var DATA_KEY = NP.dataKey || 'grindless_naquadah_plant'
  var KEEP_KEY = NP.keepKey || 'grindless_naquadah_keep'
  var TYPE_PATH = 'naquadah_refining'

  var ITEM_ORDER = ['gtceu:naquadah_dust', 'gtceu:enriched_naquadah_sulfate_dust', 'gtceu:trinium_sulfide_dust', 'gtceu:titanium_ingot', 'gtceu:gallium_dust']
  var FLUID_ORDER = ['gtceu:impure_naquadria_solution', 'gtceu:hydrogen', 'gtceu:hydrofluoric_acid', 'minecraft:water']

  var CONTROLLER = 'gtceu:naquadah_plant'
  var HULL = 'gtceu:iv_machine_hull'
  var REACTOR = 'gtceu:iv_chemical_reactor'
  var MIXER = 'gtceu:iv_mixer'
  var CENTRIFUGE = 'gtceu:iv_centrifuge'
  var PUMP = 'gtceu:iv_electric_pump'
  var CONTROLLER_PARTS = [HULL, REACTOR, MIXER, CENTRIFUGE, PUMP, CONTROLLER]
  NP.craftingRecipe = 'grindless:assembler/naquadah_plant'
  NP.craftingParts = CONTROLLER_PARTS
  NP.keepKey = KEEP_KEY

  function io() {
    return NP.maxIO || { itemsIn: 5, itemsOut: 6, fluidsIn: 5, fluidsOut: 2 }
  }

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  // ---------------------------------------------------------------- the table

  // a charge: { item, count } or { fluid, amount }, with an optional wearPerBatch (of 10 000, used up per run of the plan's batchStage)
  function chargeOf(c) {
    var wear = c.wearPerBatch === undefined ? 0 : Number(c.wearPerBatch)
    if (!(wear >= 0 && wear < MAX_CHANCE)) return null
    if (c.item !== undefined && Number(c.count) >= 1) return { item: String(c.item), count: Number(c.count), wearPerBatch: wear }
    if (c.fluid !== undefined && Number(c.amount) >= 1 && wear === 0) return { fluid: String(c.fluid), amount: Number(c.amount), wearPerBatch: 0 }
    return null
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var maxEut = Number(t.maxEUt)
    if (!(maxEut > 0)) problems.push('maxEUt ' + t.maxEUt)
    var acc = t.accelerator || {}
    var accelerator = { evPerEu: Number(acc.evPerEu), decayEv: Number(acc.decayEv), decayTicks: Number(acc.decayTicks) }
    if (!(accelerator.evPerEu > 0) || !(accelerator.decayEv > 0) || !(accelerator.decayTicks > 0)) problems.push('accelerator ' + JSON.stringify(acc))
    accelerator.upkeepEUt = accelerator.decayEv / accelerator.decayTicks / accelerator.evPerEu
    var src = t.source || {}
    var source = { id: String(src.id || ''), chance: Number(src.chance) }
    if (source.id.indexOf(':') < 0 || !(source.chance > 0 && source.chance < MAX_CHANCE)) problems.push('source ' + JSON.stringify(src))
    var rejected = list(t.rejected).map(String)
    var tagItems = t.tagItems && typeof t.tagItems === 'object' ? t.tagItems : {}
    var names = {}
    var circuits = {}
    var plans = []
    list(t.composed).forEach(function (p) {
      var n = String(p.name || '')
      var c = Number(p.circuit)
      if (!/^[a-z0-9_]+$/.test(n) || names[n]) {
        problems.push('recipe name "' + n + '"')
        return
      }
      if (!(c >= 1 && c <= 32) || circuits[c]) {
        problems.push(n + ': circuit ' + p.circuit + ' (each recipe needs its own)')
        return
      }
      if (list(p.stages).length === 0 || !p.given || Object.keys(p.given).length === 0 || !Array.isArray(p.linked)) {
        problems.push(n + ': stages, given and linked are needed')
        return
      }
      var stages = p.stages.map(String)
      var activator = p.activator ? String(p.activator) : null
      if (activator !== null && stages.indexOf(activator) < 0) {
        problems.push(n + ': the activator ' + activator + ' is not one of its stages')
        return
      }
      var batchStage = p.batchStage ? String(p.batchStage) : null
      if (batchStage !== null && stages.indexOf(batchStage) < 0) {
        problems.push(n + ': the batch stage ' + batchStage + ' is not one of its stages')
        return
      }
      var planMax = p.maxEUt === undefined ? maxEut : Number(p.maxEUt)
      if (!(planMax > 0)) {
        problems.push(n + ': maxEUt ' + p.maxEUt)
        return
      }
      var charges = []
      var badCharge = false
      list(p.charges).forEach(function (raw) {
        var ch = chargeOf(raw)
        if (ch === null || (ch.wearPerBatch > 0 && batchStage === null)) badCharge = true
        else charges.push(ch)
      })
      if (badCharge) {
        problems.push(n + ': charges ' + JSON.stringify(p.charges))
        return
      }
      names[n] = true
      circuits[c] = true
      plans.push({
        name: n, circuit: c, maxEut: planMax, keep: p.keep === true, activator: activator, batchStage: batchStage, stages: stages,
        given: p.given, linked: p.linked.map(String), recovered: list(p.recovered).map(String), charges: charges
      })
    })
    // a problem in the table would silently drop a mode: an error, so the release check sees it
    if (problems.length > 0) console.error(LOG + 'naquadah plant: ' + TABLE + ': ' + problems.join('; '))
    return {
      maxEut: maxEut > 0 ? maxEut : 7680, accelerator: accelerator, source: source, plans: plans, rejected: rejected, tagItems: tagItems,
      gtnnVersion: String(t.gtnnVersion || '')
    }
  }

  // ---------------------------------------------------------------- the pins

  // every stage of every plan, by id: 'ok', 'missing' (not among the loaded recipes), 'empty' (GT-- emptied it) or 'rejected' (one of
  // the table's placeholders). A plan with a broken pin is not built, and the log says which pin, as an ERROR.
  function checkPins(table, read) {
    var pins = {}
    table.plans.forEach(function (p) {
      p.stages.forEach(function (id) {
        if (pins[id] !== undefined) return
        var s = read.steps[id]
        if (table.rejected.indexOf(id) >= 0) pins[id] = 'rejected'
        else if (!s) pins[id] = 'missing'
        else if (s.error && /empty recipe/.test(s.error)) pins[id] = 'empty'
        else pins[id] = 'ok'
      })
    })
    return pins
  }

  function brokenPins(plan, pins) {
    return plan.stages.filter(function (id) { return pins[id] !== 'ok' }).map(function (id) { return id + ' (' + pins[id] + ')' })
  }

  // ---------------------------------------------------------------- building recipes

  function missingIds(rec) {
    var missing = []
    function want(id, exists) {
      if (!exists && missing.indexOf(id) < 0) missing.push(id)
    }
    rec.itemsIn.concat(rec.itemsOut).forEach(function (x) { want(x.id, Item.exists(x.id)) })
    rec.fluidsIn.concat(rec.fluidsOut).forEach(function (x) { want(x.id, Fluid.exists(x.id)) })
    rec.charges.forEach(function (c) {
      if (c.item !== undefined) want(c.item, Item.exists(c.item))
      else want(c.fluid, Fluid.exists(c.fluid))
    })
    return missing
  }

  function sizeProblem(rec) {
    var limits = io()
    var entries = 0
    rec.itemsOut.forEach(function (o) {
      if (o.whole > 0) entries++
      if (o.chance > 0) entries++
    })
    var itemCharges = rec.charges.filter(function (c) { return c.item !== undefined }).length
    var fluidCharges = rec.charges.length - itemCharges
    // the programmed circuit is one more item input
    var itemsIn = rec.itemsIn.length + itemCharges + 1
    var fluidsIn = rec.fluidsIn.length + fluidCharges
    if (itemsIn > limits.itemsIn) return itemsIn + ' item inputs (the type holds ' + limits.itemsIn + ')'
    if (entries > limits.itemsOut) return entries + ' item outputs (the type holds ' + limits.itemsOut + ')'
    if (fluidsIn > limits.fluidsIn) return fluidsIn + ' fluid inputs (the type holds ' + limits.fluidsIn + ')'
    if (rec.fluidsOut.length > limits.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + limits.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu.naquadah_refining(rec.id)
    rec.itemsIn.forEach(function (x) {
      if (x.chance >= MAX_CHANCE) recipe.itemInputs(x.count + 'x ' + x.id)
      else recipe.chancedInput(x.count + 'x ' + x.id, x.chance, 0)
    })
    rec.charges.forEach(function (c) {
      if (c.fluid !== undefined) recipe.notConsumableFluid(Fluid.of(c.fluid, c.amount))
      else if (c.chance > 0) recipe.chancedInput(c.count + 'x ' + c.item, c.chance, 0)
      else recipe.notConsumable(c.count + 'x ' + c.item)
    })
    recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (o) {
      if (o.whole > 0) recipe.itemOutputs(o.whole + 'x ' + o.id)
      if (o.chance > 0) recipe.chancedOutput('1x ' + o.id, o.chance, 0)
    })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    recipe.addDataString(DATA_KEY, rec.name)
    if (rec.keep) recipe.addDataBool(KEEP_KEY, true)
    recipe.EUt(rec.eut).duration(rec.duration)
  }

  // how many times the composed plan runs a stage
  function runsOf(composed, id) {
    for (var i = 0; i < composed.sources.length; i++) {
      if (composed.sources[i].id === id) return composed.sources[i].scale
    }
    return 0
  }

  function generate(event) {
    NP.recipes = []
    NP.skipped = []
    NP.pins = {}
    var table = loadTable()
    NP.maxEut = table.maxEut
    NP.accelerator = table.accelerator
    NP.source = table.source
    NP.gtnnVersion = table.gtnnVersion

    // a skipped plan means the plant lost a mode (GT--'s line changed, or an id is missing): an error, so the release check sees it
    function skip(name, reason) {
      NP.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'naquadah plant skipped ' + name + ': ' + reason)
    }

    var C = G.compose
    if (!C) throw new Error('the composer library (server_scripts/grindless/lib/compose.js) is not loaded')
    var stageIds = []
    var activators = {}
    table.plans.forEach(function (p) {
      p.stages.forEach(function (id) { if (stageIds.indexOf(id) < 0) stageIds.push(id) })
      if (p.activator !== null) activators[p.activator] = true
    })
    NP.stageIds = stageIds
    // GT--'s activator recipes carry no EU: the accelerators' upkeep is their EU/t (an activator recipe that has EU keeps its own)
    var read = C.gather(event, stageIds, {
      tagItems: table.tagItems,
      patch: function (id, j) {
        if (activators[id] !== true) return j
        var eu = j.tickInputs && j.tickInputs.eu && j.tickInputs.eu[0] ? j.tickInputs.eu[0].content : null
        if (eu !== null && eu !== undefined) return j
        j.tickInputs = { eu: [{ content: table.accelerator.upkeepEUt }] }
        return j
      }
    })
    NP.stagesRead = read.read
    NP.pins = checkPins(table, read)

    table.plans.forEach(function (plan) {
      var broken = brokenPins(plan, NP.pins)
      if (broken.length > 0) {
        skip(plan.name, 'GT-- ' + (table.gtnnVersion || '?') + ' pin(s) broken: ' + broken.join(', ') + ' (re-check the line against the pinned GT--)')
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
      var rec = C.contents(composed, { maxEut: plan.maxEut, itemOrder: ITEM_ORDER, fluidOrder: FLUID_ORDER })
      rec.name = plan.name
      rec.circuit = plan.circuit
      rec.maxEut = plan.maxEut
      rec.keep = plan.keep
      rec.id = 'grindless:' + plan.name
      rec.recipeId = 'grindless:' + TYPE_PATH + '/' + plan.name
      rec.recovered = composed.recovered || {}
      rec.activatorRuns = plan.activator !== null ? runsOf(composed, plan.activator) : 0
      rec.batches = plan.batchStage !== null ? runsOf(composed, plan.batchStage) : 0
      // the Pu-Be source holds the window: used up in `chance` of 10 000 activator runs
      if (plan.activator !== null) {
        var chance = Math.round(table.source.chance * rec.activatorRuns)
        if (!(chance > 0 && chance < MAX_CHANCE)) {
          skip(rec.name, 'the Pu-Be source would be used up in ' + chance + ' of 10 000 runs')
          return
        }
        rec.itemsIn.push({ id: table.source.id, count: 1, chance: chance })
      }
      // the charges: held, not consumed (chance 0), but a catalyst's wear for each batch
      rec.charges = plan.charges.map(function (c) {
        if (c.fluid !== undefined) return { fluid: c.fluid, amount: c.amount, chance: 0 }
        return { item: c.item, count: c.count, chance: Math.round(c.wearPerBatch * rec.batches) }
      })
      var badWear = rec.charges.filter(function (c) { return !(c.chance >= 0 && c.chance < MAX_CHANCE) })
      if (badWear.length > 0) {
        skip(rec.name, 'a charge would wear ' + badWear[0].chance + ' of 10 000 a run')
        return
      }
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
      } catch (e2) {
        skip(rec.name, 'the builder failed: ' + e2)
        return
      }
      NP.recipes.push(rec)
      console.info(LOG + 'naquadah_refining ' + rec.name + ' (circuit ' + rec.circuit + '): ' + rec.duration + ' t x ' + rec.eut + ' EU/t = ' + rec.energy +
        ' EU from ' + rec.sources.length + ' stages (' + rec.sourceEnergy + ' EU, the accelerators\' upkeep at ' + table.accelerator.upkeepEUt + ' EU/t)' +
        (rec.batches > 0 ? '; ' + rec.batches + ' batches' : '') + (rec.keep ? '; refuses voiding' : ''))
    })
    console.info(LOG + 'naquadah plant: ' + NP.recipes.length + ' recipes composed from ' + NP.stagesRead + ' of ' + stageIds.length + ' live stages; skipped ' +
      NP.skipped.length)
  }

  // ---------------------------------------------------------------- crafting

  function addController(event) {
    var missing = CONTROLLER_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'naquadah plant controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:naquadah_plant')
      .itemInputs(HULL, REACTOR, MIXER, CENTRIFUGE, '2x ' + PUMP, '4x #gtceu:circuits/iv')
      .itemOutputs(CONTROLLER)
      .EUt(1920).duration(600)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'naquadah plant recipe generation failed: ' + e)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'naquadah plant controller recipe failed: ' + e2)
    }
  })
})()
