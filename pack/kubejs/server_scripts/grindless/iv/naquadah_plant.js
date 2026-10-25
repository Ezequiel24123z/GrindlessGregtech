// -----------------------------------------------------------------------------------------------
// Recipes of IV's naquadah plant (machine and recipe type: startup_scripts/grindless/iv/naquadah_plant.js; docs/eras/iv.md, "Naquadah
// plant"; package IV-B3), generated at every server load from data/grindless/tables/naquadah_plant.json, and the recipe that makes the
// controller.
//
//   gtceu:naquadah_refining   one recipe per entry of the table's composed[], id grindless:naquadah_refining/<name> (GTM's builder puts
//                             the type in front); the programmed circuit is the mode, and every recipe carries the data key
//                             grindless_naquadah_plant = <name> (its EMI line).
//     composed[]   GT--'s live naquadah line, read from this load's original recipes and composed by server_scripts/grindless/lib/compose.js:
//                  the same ratios, the loops closed inside (the fluoroantimonic acid and the antimony trifluoride it is made from, the
//                  titanium trifluoride and its hot titanium) and the SAME energy, the sum of every stage, spent at the table's maxEUt (IV,
//                  7 680 EU/t). Nothing of GT--'s numbers is typed here.
//     the window   GT--'s neutron activator recipe carries no EU: its neutron energy comes from accelerator hatches and must sit in a
//                  window when a run starts. The plant takes the table's Pu-Be source instead (a chanced input: 100 of 10 000, about one
//                  source per 100 batches) and charges the activator stage the accelerators' upkeep, read as that stage's EU/t:
//                  decayEv / decayTicks / evPerEu (GT--'s constants, see the table): 72 000 eV lost every 20 ticks while the
//                  accelerators rest, paid back at 15 eV per EU, so 240 EU/t over the activator's run.
//   Lookup safety: every recipe of the type has its own circuit (today there is one recipe).
//   crafting         the controller (iv.md, "Built with"), made in the assembler: IV hull + IV chemical reactor + IV mixer + IV centrifuge +
//                    2 IV electric pumps + 4 IV circuits, grindless:assembler/naquadah_plant. Ten items do not fit a crafting grid.
//
// Destinations: naquadah dust goes to GTM's 5,000 K blast furnace (ingots, the boule); titanium to the titanium loop (iv.md decision 9:
// the TiF3's titanium is accepted from IV on); gallium to gallium arsenide; the hydrogen to the network (the TiF3 step already took what
// it needs inside); the water to the network. The HF comes from the fluorspar kiln and the antimony trioxide from GTM's chemical reactor.
//
// Published for the smoke test: global.grindless.naquadahPlant.recipes [{ id, recipeId, name, circuit, itemsIn: [{ id, count, chance }],
// fluidsIn: [{ id, amount }], itemsOut: [{ id, whole, chance }], fluidsOut: [{ id, amount }], eut, duration, energy, sourceEnergy,
// sources }], .skipped [{ name, reason }], .stagesRead, .stageIds, .accelerator { upkeepEUt, evPerEu, decayEv, decayTicks }, .source,
// .craftingRecipe, .craftingParts.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/iv] '
  var G = global.grindless || (global.grindless = {})
  var NP = G.naquadahPlant || (G.naquadahPlant = {})

  var TABLE = NP.table || 'kubejs/data/grindless/tables/naquadah_plant.json'
  var MAX_CHANCE = 10000
  var DATA_KEY = NP.dataKey || 'grindless_naquadah_plant'
  var TYPE_PATH = 'naquadah_refining'

  var ITEM_ORDER = ['gtceu:naquadah_dust', 'gtceu:titanium_ingot', 'gtceu:gallium_dust']
  var FLUID_ORDER = ['gtceu:hydrogen', 'minecraft:water']

  var CONTROLLER = 'gtceu:naquadah_plant'
  var HULL = 'gtceu:iv_machine_hull'
  var REACTOR = 'gtceu:iv_chemical_reactor'
  var MIXER = 'gtceu:iv_mixer'
  var CENTRIFUGE = 'gtceu:iv_centrifuge'
  var PUMP = 'gtceu:iv_electric_pump'
  var CONTROLLER_PARTS = [HULL, REACTOR, MIXER, CENTRIFUGE, PUMP, CONTROLLER]
  NP.craftingRecipe = 'grindless:assembler/naquadah_plant'
  NP.craftingParts = CONTROLLER_PARTS

  function io() {
    return NP.maxIO || { itemsIn: 4, itemsOut: 3, fluidsIn: 1, fluidsOut: 2 }
  }

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  // ---------------------------------------------------------------- the table

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
      var activator = p.activator ? String(p.activator) : null
      if (activator !== null && p.stages.map(String).indexOf(activator) < 0) {
        problems.push(n + ': the activator ' + activator + ' is not one of its stages')
        return
      }
      names[n] = true
      circuits[c] = true
      plans.push({ name: n, circuit: c, activator: activator, stages: p.stages.map(String), given: p.given, linked: p.linked.map(String) })
    })
    if (problems.length > 0) console.error(LOG + 'naquadah plant: ' + TABLE + ': ' + problems.join('; '))
    return { maxEut: maxEut > 0 ? maxEut : 7680, accelerator: accelerator, source: source, plans: plans }
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
    var recipe = event.recipes.gtceu.naquadah_refining(rec.id)
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

  function generate(event) {
    NP.recipes = []
    NP.skipped = []
    var table = loadTable()
    NP.maxEut = table.maxEut
    NP.accelerator = table.accelerator
    NP.source = table.source

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
      patch: function (id, j) {
        if (activators[id] !== true) return j
        var eu = j.tickInputs && j.tickInputs.eu && j.tickInputs.eu[0] ? j.tickInputs.eu[0].content : null
        if (eu !== null && eu !== undefined) return j
        j.tickInputs = { eu: [{ content: table.accelerator.upkeepEUt }] }
        return j
      }
    })
    NP.stagesRead = read.read

    table.plans.forEach(function (plan) {
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
      rec.circuit = plan.circuit
      rec.id = 'grindless:' + plan.name
      rec.recipeId = 'grindless:' + TYPE_PATH + '/' + plan.name
      // the Pu-Be source holds the window: used up in `chance` of 10 000 batches
      if (plan.activator !== null) rec.itemsIn.push({ id: table.source.id, count: 1, chance: table.source.chance })
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
        ' EU from ' + rec.sources.length + ' stages (' + rec.sourceEnergy + ' EU, the accelerators\' upkeep at ' + table.accelerator.upkeepEUt + ' EU/t)')
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
