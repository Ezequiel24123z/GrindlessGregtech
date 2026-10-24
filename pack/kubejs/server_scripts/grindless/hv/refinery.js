// -----------------------------------------------------------------------------------------------
// gtceu:refining recipes of the Refinery (gtceu:refinery), generated at server load from GTM's own recipes. Nothing is typed by hand: the
// stages are read from the recipe set (ServerEvents.recipes, original recipes, their JSON) and chained, so the ratios are GTM's by
// construction. The programmed circuit picks the mode:
//
//   circuit 1  refining        crude oil + hydrogen -> the four desulfurized fractions + hydrogen sulfide, for the four crudes of GTM
//                              (oil, raw oil, light oil, heavy oil)
//                              stages: gtceu:distillation_tower/distill_<crude> + the four gtceu:chemical_reactor/desulfurize_<fraction>
//   circuit 2  hydro-cracking  naphtha, light fuel, heavy fuel or refinery gas + hydrogen -> the separated gases
//                              stages: gtceu:cracker/lightly_hydro_crack_<feed> + the tower recipe that separates what it makes
//   circuit 3  steam cracking  the same feeds + steam -> olefins, aromatics, fuels (and carbon)
//                              stages: gtceu:cracker/lightly_steam_crack_<feed> + the tower recipe that separates what it makes
//
// What "the same as GTM" means here:
//   ratios   every input and output has the proportion of the loose chain: a stage that makes X runs just as often as the next one needs
//            (the desulfurization of the heavy fuel runs 15/8000 of a reactor batch for every 50 mB of crude, and so on). Amounts are scaled
//            up by the smallest whole number that makes every total an integer in mB (24 for oil, 3 for raw oil, 12 for light oil, 1 for
//            the cracking recipes; heavy oil takes 5 instead of 1 so that a 27-tick recipe does not round coarsely), so nothing is rounded and
//            the H2 and H2S of the crude recipes are exact.
//   energy   the SUM of the energy of every stage (EU = EU/t x ticks of each, scaled by how much of each stage's batch is used). No discount.
//   time     the SUM of the ticks of every stage (the stages run one after the other in the same vessel). The recipe then draws
//            ceil(energy / ticks) EU/t and lasts ceil(energy / EU/t) ticks: the energy never drops, it can only grow by less than one tick of power.
//            GTM's normal overclock does the rest, with one HV hatch (2 A, 512 V) or with two (4 A: GTM counts them as an EV supply): a recipe of up to
//            128 EU/t (oil, raw oil, light oil, hydro-cracking) takes one overclock step with one hatch and two with two (four times as fast: medium
//            crude 92 -> 185 mB/s), and heavy oil and the steam cracking, which are HV recipes (226 and 168 EU/t), take one step with two hatches.
//   outputs  the order of the tower recipe (output N leaves through layer N); for the crude recipes: heavy fuel, light fuel, naphtha, refinery
//            gas, hydrogen sulfide. The item output of the separation (carbon) is kept with its chance.
// Every recipe needs the hydrotreating catalyst (grindless:hydrotreating_catalyst) in the input bus: a chanced input, used up in 0.05 % of
// the runs. Recipe ids: grindless:refining/hv/refine_<crude>, hydrocrack_<feed>, steamcrack_<feed>.
// Natural gas is not here: its desulfurization has no distillation in front of it and GTM's chemical reactor does it as it is.
//
// Published in global.grindless.refinery for the smoke test:
//   .recipes  [{ id, name, mode, circuit, feed, sources: [stage ids], scale, fluidsIn: [{ id, amount }], fluidsOut: [...], items: [{ id, count,
//                chance }], eut, duration, energy (what the recipe costs), sourceEnergy (sum of the stages), sourceDuration }]
//   .skipped  [{ name, reason }]      .stages  number of source recipes read     .h2     { <crude>: { h2, h2s, naphtha, crude } } per recipe
(function () {
  const G = global.grindless || (global.grindless = {})
  const REF = G.refinery || (G.refinery = {})

  const CATALYST = 'grindless:hydrotreating_catalyst'
  const CATALYST_WEAR = 5
  const MAX_EUT = 480
  const MAX_FLUID_INPUTS = 2
  const MAX_FLUID_OUTPUTS = 12
  const MAX_SCALE = 96
  const MAX_MULTIPLE = 8
  const MAX_EXTRA = 0.004
  const ID_PREFIX = 'grindless:hv/'

  const TOWER = 'gtceu:distillation_tower/'
  const CRACKER = 'gtceu:cracker/'
  const REACTOR = 'gtceu:chemical_reactor/'
  const HYDROGEN = 'gtceu:hydrogen'
  const SULFIDE = 'gtceu:hydrogen_sulfide'

  const CRUDES = [
    { name: 'oil', source: 'distill_oil' },
    { name: 'raw_oil', source: 'distill_raw_oil' },
    { name: 'light_oil', source: 'distill_light_oil' },
    { name: 'heavy_oil', source: 'distill_heavy_oil' }
  ]
  const FEEDS = ['naphtha', 'light_fuel', 'heavy_fuel', 'refinery_gas']
  const CRACKS = [
    { name: 'hydrocrack', circuit: 2, source: 'lightly_hydro_crack_' },
    { name: 'steamcrack', circuit: 3, source: 'lightly_steam_crack_' }
  ]

  REF.catalyst = CATALYST
  REF.catalystWear = CATALYST_WEAR
  REF.maxEut = MAX_EUT
  REF.recipes = []
  REF.skipped = []
  REF.stages = 0
  REF.h2 = {}

  // ---------------------------------------------------------------- reading GTM's recipes

  // RecipeJS.toString() is "<id>[<type>]" (the type object cannot be read from scripts); getId() is the fallback
  function recipeId(r) {
    var m = /^(.*)\[([^\[\]]*)\]$/.exec(String(r))
    if (m) return m[1]
    try {
      return String(r.getId())
    } catch (e) {
      return ''
    }
  }

  // { amount, value: [{ fluid } | { tag }] } -> { id, amount } (a tag is a GTM material tag: forge:<name> is the fluid gtceu:<name>)
  function fluidOf(content) {
    if (!content || !content.value || content.value.length === 0) return null
    var v = content.value[0]
    var id = null
    if (v.fluid) {
      id = String(v.fluid)
    } else if (v.tag) {
      var name = String(v.tag).replace(/^[^:]*:/, '')
      var candidates = ['gtceu:' + name, 'minecraft:' + name]
      for (var i = 0; i < candidates.length; i++) {
        if (Fluid.exists(candidates[i])) {
          id = candidates[i]
          break
        }
      }
    }
    return id === null ? null : { id: id, amount: Number(content.amount) }
  }

  // { item } | { type: 'gtceu:sized', count, ingredient: { item } } -> { id, count }
  function itemOf(content) {
    if (!content) return null
    if (content.item) return { id: String(content.item), count: Number(content.count || 1) }
    if (content.ingredient && content.ingredient.item) return { id: String(content.ingredient.item), count: Number(content.count || 1) }
    return null
  }

  // total EU/t of a recipe: a plain number is voltage x 1 A, { voltage, amperage } is both
  function energyOf(j) {
    var eu = j.tickInputs && j.tickInputs.eu && j.tickInputs.eu[0] ? j.tickInputs.eu[0].content : null
    if (typeof eu === 'number') return eu
    if (eu && eu.voltage !== undefined) return Number(eu.voltage) * Number(eu.amperage || 1)
    return null
  }

  // one source recipe -> { id, duration, eut, circuit, fluidsIn, fluidsOut, itemsOut } or { id, error }
  function parseStage(id, j) {
    var eut = energyOf(j)
    if (eut === null) return { id: id, error: 'unreadable energy' }
    var out = { id: id, duration: Number(j.duration), eut: eut, circuit: 0, fluidsIn: [], fluidsOut: [], itemsOut: [] }
    var i
    var fluidsIn = j.inputs && j.inputs.fluid ? j.inputs.fluid : []
    for (i = 0; i < fluidsIn.length; i++) {
      var fi = fluidOf(fluidsIn[i].content)
      if (fi === null) return { id: id, error: 'unreadable fluid input ' + i }
      out.fluidsIn.push(fi)
    }
    var itemsIn = j.inputs && j.inputs.item ? j.inputs.item : []
    for (i = 0; i < itemsIn.length; i++) {
      var c = itemsIn[i].content
      if (c && c.type === 'gtceu:circuit') out.circuit = Number(c.configuration)
      else return { id: id, error: 'an item input that is not a circuit' }
    }
    var fluidsOut = j.outputs && j.outputs.fluid ? j.outputs.fluid : []
    for (i = 0; i < fluidsOut.length; i++) {
      var fo = fluidOf(fluidsOut[i].content)
      if (fo === null) return { id: id, error: 'unreadable fluid output ' + i }
      out.fluidsOut.push(fo)
    }
    var itemsOut = j.outputs && j.outputs.item ? j.outputs.item : []
    for (i = 0; i < itemsOut.length; i++) {
      var it = itemOf(itemsOut[i].content)
      if (it === null) return { id: id, error: 'unreadable item output ' + i }
      var maxChance = itemsOut[i].maxChance !== undefined ? Number(itemsOut[i].maxChance) : 10000
      var chance = itemsOut[i].chance !== undefined ? Number(itemsOut[i].chance) : maxChance
      it.chance = Math.round(chance * 10000 / maxChance)
      out.itemsOut.push(it)
    }
    if (!(out.duration > 0)) return { id: id, error: 'no duration' }
    return out
  }

  // a desulfurization reactor: sulfuric fraction + hydrogen -> hydrogen sulfide + the clean fraction
  function desulfurizer(s) {
    if (s.circuit !== 0 || s.itemsOut.length !== 0 || s.fluidsIn.length !== 2 || s.fluidsOut.length !== 2) return null
    var h2 = null
    var sulfuric = null
    s.fluidsIn.forEach(function (f) {
      if (f.id === HYDROGEN) h2 = f
      else if (f.id.indexOf('gtceu:sulfuric_') === 0) sulfuric = f
    })
    var sulfide = null
    var clean = null
    s.fluidsOut.forEach(function (f) {
      if (f.id === SULFIDE) sulfide = f
      else clean = f
    })
    if (h2 === null || sulfuric === null || sulfide === null || clean === null) return null
    return { id: s.id, sulfuric: sulfuric, hydrogen: h2, sulfide: sulfide, clean: clean, eut: s.eut, duration: s.duration }
  }

  function gather(event) {
    var stages = {}
    var read = 0
    event.originalRecipes.values().forEach(function (r) {
      var id = recipeId(r)
      if (id.indexOf(TOWER) !== 0 && id.indexOf(CRACKER) !== 0 && id.indexOf(REACTOR) !== 0) return
      try {
        if (r.json === null || r.json === undefined) return
        var s = parseStage(id, JSON.parse(String(r.json)))
        if (!s.error) {
          stages[id] = s
          read++
        }
      } catch (e) {
        // a recipe of those types that this script cannot read is none of its business
      }
    })
    var towersByInput = {}
    var ambiguous = {}
    var desulfurizers = {}
    Object.keys(stages).sort().forEach(function (id) {
      var s = stages[id]
      if (id.indexOf(TOWER) === 0 && s.fluidsIn.length === 1 && s.circuit === 0) {
        var key = s.fluidsIn[0].id
        if (towersByInput[key]) ambiguous[key] = true
        else towersByInput[key] = s
      } else if (id.indexOf(REACTOR) === 0) {
        var d = desulfurizer(s)
        if (d !== null) desulfurizers[d.sulfuric.id] = d
      }
    })
    Object.keys(ambiguous).forEach(function (key) { delete towersByInput[key] })
    return { stages: stages, read: read, towersByInput: towersByInput, desulfurizers: desulfurizers }
  }

  // ---------------------------------------------------------------- chaining the stages

  function newPlan(name, mode, circuit, feed) {
    return { name: name, mode: mode, circuit: circuit, feed: feed, sources: [], fluidsIn: [], fluidsOut: [], items: [], energy: 0, duration: 0 }
  }

  function addFluid(list, id, amount) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        list[i].amount += amount
        return
      }
    }
    list.push({ id: id, amount: amount })
  }

  // crude oil: the tower splits it into four sulfuric fractions, each one goes through its own reactor, for as much of a batch as it comes
  function crudePlan(crude, g) {
    var tower = g.stages[TOWER + crude.source]
    if (!tower) return { error: 'no source recipe ' + TOWER + crude.source }
    if (tower.fluidsIn.length !== 1 || tower.itemsOut.length !== 0) return { error: 'the tower recipe is not one fluid in and fluids out' }
    var plan = newPlan('refine_' + crude.name, 'refining', 1, crude.name)
    plan.sources.push(tower.id)
    addFluid(plan.fluidsIn, tower.fluidsIn[0].id, tower.fluidsIn[0].amount)
    plan.energy = tower.eut * tower.duration
    plan.duration = tower.duration
    var h2 = 0
    var h2s = 0
    for (var i = 0; i < tower.fluidsOut.length; i++) {
      var o = tower.fluidsOut[i]
      var d = g.desulfurizers[o.id]
      if (!d) return { error: 'no desulfurization recipe for ' + o.id }
      var batches = o.amount / d.sulfuric.amount
      plan.sources.push(d.id)
      addFluid(plan.fluidsOut, d.clean.id, batches * d.clean.amount)
      h2 += batches * d.hydrogen.amount
      h2s += batches * d.sulfide.amount
      plan.energy += batches * d.eut * d.duration
      plan.duration += batches * d.duration
    }
    addFluid(plan.fluidsIn, HYDROGEN, h2)
    addFluid(plan.fluidsOut, SULFIDE, h2s)
    return plan
  }

  // cracking: the cracker makes the intermediate, the tower recipe that takes it in separates it; the cracker runs as often as the tower needs
  function crackPlan(crack, feed, g) {
    var source = CRACKER + crack.source + feed
    var cracker = g.stages[source]
    if (!cracker) return { error: 'no source recipe ' + source }
    if (cracker.fluidsOut.length !== 1 || cracker.fluidsIn.length !== 2 || cracker.itemsOut.length !== 0) return { error: 'the cracker recipe is not two fluids in and one out' }
    var tower = g.towersByInput[cracker.fluidsOut[0].id]
    if (!tower) return { error: 'no tower recipe that separates ' + cracker.fluidsOut[0].id }
    var runs = tower.fluidsIn[0].amount / cracker.fluidsOut[0].amount
    var plan = newPlan(crack.name + '_' + feed, crack.name, crack.circuit, feed)
    plan.sources.push(cracker.id, tower.id)
    cracker.fluidsIn.forEach(function (f) { addFluid(plan.fluidsIn, f.id, runs * f.amount) })
    tower.fluidsOut.forEach(function (f) { addFluid(plan.fluidsOut, f.id, f.amount) })
    plan.items = tower.itemsOut.map(function (it) { return { id: it.id, count: it.count, chance: it.chance } })
    plan.energy = runs * cracker.eut * cracker.duration + tower.eut * tower.duration
    plan.duration = runs * cracker.duration + tower.duration
    return plan
  }

  // smallest whole number that makes every amount an integer (0 = none up to MAX_SCALE)
  function integerScale(values) {
    for (var k = 1; k <= MAX_SCALE; k++) {
      var ok = true
      for (var i = 0; i < values.length; i++) {
        var v = values[i] * k
        if (Math.abs(v - Math.round(v)) > 1e-6) {
          ok = false
          break
        }
      }
      if (ok) return k
    }
    return 0
  }

  // EU/t and ticks of a recipe that has to cost AT LEAST `energy` over about `duration` ticks: ceil(energy / duration) EU/t (never above
  // MAX_EUT: then it runs longer) and ceil(energy / EU/t) ticks. The surplus is under one EU/t of power
  function costOf(energy, duration) {
    var eut = Math.max(1, Math.ceil(energy / duration - 1e-9))
    if (eut > MAX_EUT) eut = MAX_EUT
    var ticks = Math.max(1, Math.ceil(energy / eut - 1e-9))
    return { eut: eut, ticks: ticks, extra: (eut * ticks - energy) / energy }
  }

  // scales the plan to whole amounts and turns its energy and time into the EU/t and ticks of the recipe. A short recipe rounds coarsely
  // (one tick or one EU/t is a large share of it), so the batch grows by whole multiples until the surplus is under MAX_EXTRA
  function finish(plan) {
    var amounts = plan.fluidsIn.concat(plan.fluidsOut).map(function (f) { return f.amount })
    var base = integerScale(amounts)
    if (base === 0) return 'the amounts are not whole numbers with a scale up to ' + MAX_SCALE
    var k = base
    var cost = costOf(plan.energy * k, plan.duration * k)
    for (var m = 2; m <= MAX_MULTIPLE && cost.extra > MAX_EXTRA; m++) {
      var next = costOf(plan.energy * base * m, plan.duration * base * m)
      if (next.extra < cost.extra) {
        k = base * m
        cost = next
      }
    }
    plan.scale = k
    plan.fluidsIn.forEach(function (f) { f.amount = Math.round(f.amount * k) })
    plan.fluidsOut.forEach(function (f) { f.amount = Math.round(f.amount * k) })
    plan.items.forEach(function (it) { it.count = it.count * k })
    if (plan.fluidsIn.length > MAX_FLUID_INPUTS) return plan.fluidsIn.length + ' fluid inputs (the type holds ' + MAX_FLUID_INPUTS + ')'
    if (plan.fluidsOut.length === 0 || plan.fluidsOut.length > MAX_FLUID_OUTPUTS) return plan.fluidsOut.length + ' fluid outputs (the type holds ' + MAX_FLUID_OUTPUTS + ')'
    if (plan.items.length > 1) return plan.items.length + ' item outputs (the type holds 1)'
    plan.sourceEnergy = Math.round(plan.energy * k * 1e6) / 1e6
    plan.sourceDuration = Math.round(plan.duration * k * 1e6) / 1e6
    plan.eut = cost.eut
    plan.duration = cost.ticks
    plan.energy = cost.eut * cost.ticks
    return null
  }

  function plans(g) {
    var out = []
    var skipped = []
    function take(name, plan) {
      if (plan.error) {
        skipped.push({ name: name, reason: plan.error })
        return
      }
      var problem = finish(plan)
      if (problem) {
        skipped.push({ name: name, reason: problem })
        return
      }
      var missing = plan.fluidsIn.concat(plan.fluidsOut).map(function (f) { return f.id }).filter(function (id) { return !Fluid.exists(id) })
        .concat(plan.items.map(function (it) { return it.id }).filter(function (id) { return !Item.exists(id) }))
      if (missing.length > 0) {
        skipped.push({ name: name, reason: 'unknown id(s): ' + missing.join(', ') })
        return
      }
      out.push(plan)
    }
    CRUDES.forEach(function (crude) { take('refine_' + crude.name, crudePlan(crude, g)) })
    CRACKS.forEach(function (crack) {
      FEEDS.forEach(function (feed) { take(crack.name + '_' + feed, crackPlan(crack, feed, g)) })
    })
    return { plans: out, skipped: skipped }
  }

  // ---------------------------------------------------------------- recipes

  function add(event, plan) {
    var recipe = event.recipes.gtceu.refining(ID_PREFIX + plan.name)
      .chancedInput(CATALYST, CATALYST_WEAR, 0)
      .circuit(plan.circuit)
    plan.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
    plan.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
    plan.items.forEach(function (it) {
      if (it.chance >= 10000) recipe.itemOutputs(it.count + 'x ' + it.id)
      else recipe.chancedOutput(it.count + 'x ' + it.id, it.chance, 0)
    })
    recipe.EUt(plan.eut).duration(plan.duration)
  }

  function generate(event) {
    REF.recipes = []
    REF.skipped = []
    REF.h2 = {}
    if (!Item.exists(CATALYST)) {
      console.error('[grindless/hv] refining recipes skipped: the item ' + CATALYST + ' is not registered')
      return
    }
    var g = gather(event)
    REF.stages = g.read
    var result = plans(g)
    result.plans.forEach(function (plan) {
      add(event, plan)
      var crude = plan.mode === 'refining' ? plan.feed : null
      var amountOf = function (list, id) {
        var total = 0
        list.forEach(function (f) { if (f.id === id) total += f.amount })
        return total
      }
      if (crude !== null) {
        REF.h2[crude] = {
          crude: plan.fluidsIn[0].amount,
          h2: amountOf(plan.fluidsIn, HYDROGEN),
          h2s: amountOf(plan.fluidsOut, SULFIDE),
          naphtha: amountOf(plan.fluidsOut, 'gtceu:naphtha')
        }
      }
      REF.recipes.push({
        id: 'grindless:refining/hv/' + plan.name,
        name: plan.name,
        mode: plan.mode,
        circuit: plan.circuit,
        feed: plan.feed,
        sources: plan.sources,
        scale: plan.scale,
        fluidsIn: plan.fluidsIn,
        fluidsOut: plan.fluidsOut,
        items: plan.items,
        eut: plan.eut,
        duration: plan.duration,
        energy: plan.energy,
        sourceEnergy: plan.sourceEnergy,
        sourceDuration: plan.sourceDuration
      })
    })
    REF.skipped = result.skipped
    console.info('[grindless/hv] refining recipes added: ' + REF.recipes.length + ' from ' + g.read + ' source recipes, skipped ' + REF.skipped.length)
    REF.skipped.forEach(function (s) {
      console.info('[grindless/hv] refining skipped ' + s.name + ': ' + s.reason)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error('[grindless/hv] refining recipe generation failed: ' + e)
    }
  })
})()
