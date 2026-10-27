// priority: -20524
// -----------------------------------------------------------------------------------------------
// gtceu:bio_distillation recipes of the Biorefinery (gtceu:biorefinery), generated at server load from GTM's own gtceu:distillation_tower
// recipes whose INPUT is an organic fluid. Nothing is typed by hand: the recipes are read from the recipe set (ServerEvents.recipes, original
// recipes, their JSON) and rebuilt for our type, so the ratios are GTM's by construction.
//
//   kept        creosote, charcoal byproducts, wood tar, wood vinegar, wood gas, seed oil, fish oil, biomass, fermented biomass, coal tar,
//               coal gas, diluted sulfuric acid, diluted hydrochloric acid (13 recipes in GTM 7.5.3)
//   left out    crude oil and the cracked fractions, liquid air, acetone, calcium acetate, water and the naquadah wastes: the HV tower's
//
// Same ratios (every input, output and chance as GTM has them, the outputs in the same order: output N leaves through layer N) and the same
// energy per recipe. GTM's tower recipes draw up to 640 EU/t; this machine is MV, so a recipe above 120 EU/t (one MV hatch, VA[MV]) runs at
// 120 EU/t for longer: duration = ceil(duration x EU/t / 120), rounded UP so the energy never drops (at most +119 EU on a recipe). Recipes at
// or below 120 EU/t are copied as they are. No bonus of any kind.
//
// Published in global.grindless.biorefinery for the smoke test:
//   .recipes   [{ id, source, input: { id, amount }, fluids: [{ id, amount }], items: [{ id, count, chance }], eut, duration,
//                 sourceEut, sourceDuration }]    (chance in 1/10000, 10000 = certain)
//   .skipped   [{ source, reason }]     .others  number of tower recipes left to the HV tower
(function () {
  const G = global.grindless || (global.grindless = {})
  const BIO = G.biorefinery || (G.biorefinery = {})

  const MAX_EUT = 120
  const SOURCE_PREFIX = 'gtceu:distillation_tower/'
  const ID_PREFIX = 'grindless:bio/'
  const MAX_FLUID_OUTPUTS = 12
  const ORGANIC = ['gtceu:creosote', 'gtceu:charcoal_byproducts', 'gtceu:wood_tar', 'gtceu:wood_vinegar', 'gtceu:wood_gas', 'gtceu:seed_oil',
    'gtceu:fish_oil', 'gtceu:biomass', 'gtceu:fermented_biomass', 'gtceu:coal_tar', 'gtceu:coal_gas', 'gtceu:diluted_sulfuric_acid',
    'gtceu:diluted_hydrochloric_acid']

  BIO.organicInputs = ORGANIC
  BIO.recipes = []
  BIO.skipped = []
  BIO.others = 0

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

  function energyOf(j) {
    var eu = j.tickInputs && j.tickInputs.eu && j.tickInputs.eu[0] ? j.tickInputs.eu[0].content : null
    if (typeof eu === 'number') return { voltage: eu, amperage: 1 }
    if (eu && eu.voltage !== undefined) return { voltage: Number(eu.voltage), amperage: Number(eu.amperage || 1) }
    return null
  }

  function parse(id, j) {
    var name = id.substring(SOURCE_PREFIX.length).replace(/^distill_/, '')
    var fluidsIn = j.inputs && j.inputs.fluid ? j.inputs.fluid : []
    var itemsIn = j.inputs && j.inputs.item ? j.inputs.item : []
    if (fluidsIn.length !== 1 || itemsIn.length !== 0) return { name: name, skip: 'not one fluid in and nothing else' }
    var input = fluidOf(fluidsIn[0].content)
    if (input === null) return { name: name, skip: 'unreadable fluid input' }
    var energy = energyOf(j)
    if (energy === null || energy.amperage !== 1) return { name: name, skip: 'unreadable or multi-amp energy' }

    var fluids = []
    var fluidsOut = j.outputs && j.outputs.fluid ? j.outputs.fluid : []
    for (var i = 0; i < fluidsOut.length; i++) {
      var f = fluidOf(fluidsOut[i].content)
      if (f === null) return { name: name, skip: 'unreadable fluid output ' + i }
      fluids.push(f)
    }
    var items = []
    var itemsOut = j.outputs && j.outputs.item ? j.outputs.item : []
    for (var k = 0; k < itemsOut.length; k++) {
      var it = itemOf(itemsOut[k].content)
      if (it === null) return { name: name, skip: 'unreadable item output ' + k }
      var maxChance = itemsOut[k].maxChance !== undefined ? Number(itemsOut[k].maxChance) : 10000
      var chance = itemsOut[k].chance !== undefined ? Number(itemsOut[k].chance) : maxChance
      it.chance = Math.round(chance * 10000 / maxChance)
      items.push(it)
    }
    if (fluids.length === 0 || fluids.length > MAX_FLUID_OUTPUTS) return { name: name, skip: fluids.length + ' fluid outputs' }
    if (items.length > 1) return { name: name, skip: items.length + ' item outputs (the type holds 1)' }

    var sourceEut = energy.voltage
    var sourceDuration = Number(j.duration)
    var eut = Math.min(sourceEut, MAX_EUT)
    return {
      name: name,
      id: ID_PREFIX + name,
      source: id,
      input: input,
      fluids: fluids,
      items: items,
      eut: eut,
      duration: Math.max(1, Math.ceil(sourceDuration * sourceEut / eut - 1e-9)),
      sourceEut: sourceEut,
      sourceDuration: sourceDuration
    }
  }

  function generate(event) {
    BIO.recipes = []
    BIO.skipped = []
    BIO.others = 0
    var sources = []
    event.originalRecipes.values().forEach(function (r) {
      var id = recipeId(r)
      if (id.indexOf(SOURCE_PREFIX) !== 0) return
      try {
        if (r.json !== null && r.json !== undefined) sources.push({ id: id, json: JSON.parse(String(r.json)) })
      } catch (e) {
        BIO.skipped.push({ source: id, reason: 'unreadable recipe: ' + e })
      }
    })
    sources.sort(function (a, b) { return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0) })

    var seenInputs = {}
    sources.forEach(function (s) {
      var inputId = null
      try {
        inputId = fluidOf(s.json.inputs.fluid[0].content).id
      } catch (e) {
        inputId = null
      }
      if (inputId === null || ORGANIC.indexOf(inputId) < 0) {
        BIO.others++
        return
      }
      seenInputs[inputId] = true
      var plan = parse(s.id, s.json)
      if (plan.skip) {
        BIO.skipped.push({ source: s.id, reason: plan.skip })
        return
      }
      var wanted = plan.items.map(function (it) { return it.id })
      var missing = wanted.filter(function (id) { return !Item.exists(id) })
        .concat(plan.fluids.map(function (f) { return f.id }).filter(function (id) { return !Fluid.exists(id) }))
      if (missing.length > 0 || !Fluid.exists(plan.input.id)) {
        BIO.skipped.push({ source: s.id, reason: 'unknown id(s): ' + missing.join(', ') })
        return
      }

      var recipe = event.recipes.gtceu.bio_distillation(plan.id)
        .inputFluids(Fluid.of(plan.input.id, plan.input.amount))
      plan.fluids.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      plan.items.forEach(function (it) {
        if (it.chance >= 10000) recipe.itemOutputs(it.count + 'x ' + it.id)
        else recipe.chancedOutput(it.count + 'x ' + it.id, it.chance, 0)
      })
      recipe.EUt(plan.eut).duration(plan.duration)
      BIO.recipes.push({
        id: 'grindless:bio_distillation/bio/' + plan.name,
        source: plan.source,
        input: plan.input,
        fluids: plan.fluids,
        items: plan.items,
        eut: plan.eut,
        duration: plan.duration,
        sourceEut: plan.sourceEut,
        sourceDuration: plan.sourceDuration
      })
    })

    var absent = ORGANIC.filter(function (id) { return !seenInputs[id] })
    if (absent.length > 0) {
      BIO.skipped.push({ source: '(none)', reason: 'no tower recipe found for ' + absent.join(', ') })
    }
    console.info('[grindless/mv] bio_distillation recipes added: ' + BIO.recipes.length + ' from ' + sources.length + ' tower recipes (' +
      BIO.others + ' left to the HV tower), skipped ' + BIO.skipped.length)
    BIO.skipped.forEach(function (s) {
      console.info('[grindless/mv] biorefinery skipped ' + s.source + ': ' + s.reason)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error('[grindless/mv] biorefinery recipe generation failed: ' + e)
    }
  })
})()
