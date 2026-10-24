// -----------------------------------------------------------------------------------------------
// gtceu:ore_processing recipes of the Ore Plant (gtceu:ore_plant), generated at server load for every material that has an OreProperty.
// No table of our own: the plant does GTM's whole ore chain in one pass, and the chain is read from GTM's own recipes (the ones
// OreRecipeHandler builds from the OreProperty: byproducts, ore multiplier, washing reagent), so whatever GTM, or an addon that changes
// an ore's chain, says about a material is what the plant does:
//
//   macerator       1 raw ore -> 2 x oreMultiplier crushed ore  + 14 % byproduct 0 (the gem form when the material has one)         2 EU/t x 400 t
//   ore washer      each crushed ore + 1 000 mB water -> purified crushed ore + 1/3 byproduct 0 + 1 stone dust                        16 EU/t x 400 t
//   thermal centr.  each purified ore -> refined ore + 1/3 byproduct 1                                                                30 EU/t x 400 t
//   macerator       each refined ore -> 1 dust + 14 % byproduct 2                                                                      2 EU/t x 400 t
//
// (the numbers of GTM 7.5.3 for an ore with oreMultiplier 1; the generator reads them from the recipes, it does not assume them).
// One plant recipe is that chain for one raw ore, with the expected amount of every output (an amount of 0.8 is a chance of 80 %; more than
// one is a whole amount plus a chanced remainder; the same item from two steps is merged). With oreMultiplier = 1: 2 dust + byproduct 0 (80.7 %)
// + byproduct 1 (66.7 %) + byproduct 2 (28 %), and 4 stone dust of rubble (the washers give 2: the rubble is a duty of the plant, not a bonus).
// Energy: EXACTLY the loose chain at 40 EU/t, so the duration is its total energy / 40: 39 200 EU = 980 t (2 x oreMultiplier crushed ores
// through wash + centrifuge + macerator, plus the first maceration). No discount, no surcharge.
//
// Three variants per ore, like the three ways GTM washes it (each one only when GTM has that recipe for the ore):
//   _water       1 raw ore + 1 000 mB of water per crushed ore (2 000 mB for oreMultiplier 1)                    the ore washer
//   _distilled   1 raw ore + programmed circuit 2 + 100 mB of distilled water per crushed ore (200 mB)            the ore washer with distilled water: half the washing time
//   _bath        1 raw ore + the reagent of the ore (sodium persulfate or mercury) in a hatch, instead of water. The chemical bath of GTM replaces
//                the washing: its byproduct (x byProductMultiplier) comes instead of the 1/3 of byproduct 0 and only 0.4 stone dust per crushed ore
//                come out of the washing (the same 4 rubble all the same). Only ores that have a chemical bath.
// Which one runs when several fit the machine is decided by the recipe modifier (startup_scripts/grindless/mv/ore_plant.js).
//
// Left out, and logged: gem ores (their purified crushed ore goes to the sifter: they keep it) and any ore whose chain does not map cleanly
// (a step missing, an item that does not exist, a step that does not take one item and give one, more outputs than the recipe type holds).
// Electromagnetic separation (HV) and the chemical-bath dust steps are not part of the chain.
//
// Lookup note (GTM's RecipeDB cannot keep a recipe whose ingredient list is a prefix of another's): per ore the lists are [raw ore, water],
// [raw ore, circuit 2, distilled water] and [raw ore, reagent]: none is the beginning of another.
//
// Published in global.grindless.orePlant for the smoke test and the other scripts:
//   .recipes    [{ id, material, variant, input, stone, fluid: { id, amount }, circuit, eut, duration, energy, n, rubble,
//                  outputs: [{ item, whole, chance }] }]      (chance in 1/10000, 0 = none; id is the id given to the builder, the
//                                                              recipe id is grindless:ore_processing/ + the path of this one)
//   .skipped    [{ material, reason }]            .ores  number of ores with recipes
//   .reagents   { material: fluid id }            reagents of the chemical baths (read by the recipe modifier)
(function () {
  const G = global.grindless || (global.grindless = {})
  const OP = G.orePlant || (G.orePlant = {})

  const EUT = 40
  const ID_PREFIX = 'grindless:mv/'
  const MAX_ITEM_OUTPUTS = 9       // what the recipe type holds (startup_scripts/grindless/mv/ore_plant.js); redstone (ore multiplier 5) needs all 9
  const RUBBLE_PER_CRUSHED = 2     // stone dust per crushed ore: twice the 1 the ore washers give
  const STONE = 'gtceu:stone_dust'
  const FAMILIES = ['gtceu:macerator/macerate_', 'gtceu:ore_washer/wash_', 'gtceu:thermal_centrifuge/centrifuge_', 'gtceu:chemical_bath/bathe_']
  const VARIANTS = ['water', 'distilled', 'bath']

  OP.reagents = {}
  OP.recipes = []
  OP.skipped = []
  OP.ores = 0

  var CL = null
  function classes() {
    if (CL === null) {
      CL = {
        PropertyKey: Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.material.properties.PropertyKey'),
        TagPrefix: Java.loadClass('com.gregtechceu.gtceu.api.data.tag.TagPrefix'),
        ChemicalHelper: Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.ChemicalHelper'),
        API: Java.loadClass('com.gregtechceu.gtceu.api.GTCEuAPI'),
        ArrayList: Java.loadClass('java.util.ArrayList')
      }
    }
    return CL
  }

  // item id of the raw ore of a material or null. GTM's macerator takes it as a tag, the plant needs the item. The three-argument overload
  // on purpose: Rhino cannot choose between get(TagPrefix, Material) and get(MaterialEntry, int) ("ambiguous").
  function rawItemOf(mat) {
    var K = classes()
    var stack = K.ChemicalHelper.get(K.TagPrefix.rawOre, mat, 1)
    return stack.isEmpty() ? null : String(stack.getId())
  }

  // ---------------------------------------------------------------- reading GTM's loose chain (original recipes, their JSON)

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

  // { item } | { tag } | { type: 'gtceu:sized', count, ingredient: { item | tag } } -> { id | tag, count }
  function ingredientOf(content) {
    if (!content) return null
    var count = Number(content.count || 1)
    var source = content.ingredient ? content.ingredient : content
    if (source.item) return { id: String(source.item), count: count }
    if (source.tag) return { tag: String(source.tag), count: count }
    return null
  }

  function isCircuit(content) {
    return !!content && ((!!content.ingredient && content.ingredient.type === 'gtceu:circuit') || content.type === 'gtceu:circuit')
  }

  // EU/t of a recipe (voltage x amperage), null when unreadable
  function energyOf(j) {
    var eu = j.tickInputs && j.tickInputs.eu && j.tickInputs.eu[0] ? j.tickInputs.eu[0].content : null
    if (typeof eu === 'number') return eu
    if (eu && eu.voltage !== undefined) return Number(eu.voltage) * Number(eu.amperage || 1)
    return null
  }

  // one recipe of the chain -> { eut, duration, inputs: [{ id | tag, count }] (circuits left out), fluid: { id, amount } | null,
  //                              outputs: [{ id, count, chance }] (chance 0..1) } or { error }
  function stepOf(r, what) {
    if (r === undefined || r === null) return { error: 'no ' + what + ' recipe' }
    var j = null
    try {
      j = JSON.parse(String(r.json))
    } catch (e) {
      return { error: 'unreadable ' + what + ' recipe' }
    }
    var eut = energyOf(j)
    if (eut === null) return { error: 'unreadable energy of the ' + what + ' recipe' }

    var inputs = []
    var itemsIn = j.inputs && j.inputs.item ? j.inputs.item : []
    for (var a = 0; a < itemsIn.length; a++) {
      if (isCircuit(itemsIn[a].content)) continue
      var input = ingredientOf(itemsIn[a].content)
      if (input === null) return { error: 'unreadable item input of the ' + what + ' recipe' }
      inputs.push(input)
    }
    var fluid = null
    var fluidsIn = j.inputs && j.inputs.fluid ? j.inputs.fluid : []
    if (fluidsIn.length > 1) return { error: 'the ' + what + ' recipe has several fluid inputs' }
    if (fluidsIn.length === 1) {
      fluid = fluidOf(fluidsIn[0].content)
      if (fluid === null) return { error: 'unreadable fluid input of the ' + what + ' recipe' }
    }
    if (j.outputs && j.outputs.fluid && j.outputs.fluid.length > 0) return { error: 'the ' + what + ' recipe has fluid outputs' }

    var outputs = []
    var itemsOut = j.outputs && j.outputs.item ? j.outputs.item : []
    for (var b = 0; b < itemsOut.length; b++) {
      var out = ingredientOf(itemsOut[b].content)
      if (out === null || out.id === undefined) return { error: 'unreadable item output of the ' + what + ' recipe' }
      var max = itemsOut[b].maxChance !== undefined ? Number(itemsOut[b].maxChance) : 10000
      var chance = itemsOut[b].chance !== undefined ? Number(itemsOut[b].chance) : max
      out.chance = chance / max
      outputs.push(out)
    }
    return { eut: eut, duration: Number(j.duration), inputs: inputs, fluid: fluid, outputs: outputs }
  }

  // the loose recipes by id (only the four families of the chain; their JSON is read when an ore needs it)
  function looseRecipes(event) {
    var found = {}
    event.originalRecipes.values().forEach(function (r) {
      var id = recipeId(r)
      for (var i = 0; i < FAMILIES.length; i++) {
        if (id.indexOf(FAMILIES[i]) === 0) {
          found[id] = r
          return
        }
      }
    })
    return found
  }

  // a step that takes ONE item and gives ONE item first (100 %), as the chain of every ore does
  function oneToOne(step, what) {
    if (step.inputs.length !== 1 || step.inputs[0].count !== 1) return 'the ' + what + ' step does not take one item'
    if (step.outputs.length < 1 || step.outputs[0].count < 1 || step.outputs[0].chance < 1) return 'the ' + what + ' step does not give one item for sure'
    return null
  }

  // the steps of one ore: { crush, thermal, dust, water, distilled, bath, raw, crushed, ... } or { skip: reason }
  function chainOf(found, name) {
    var ids = {
      crush: 'gtceu:macerator/macerate_raw_' + name + '_ore_to_crushed_ore',
      water: 'gtceu:ore_washer/wash_' + name + '_crushed_ore_to_purified_ore',
      distilled: 'gtceu:ore_washer/wash_' + name + '_crushed_ore_to_purified_ore_distilled',
      bath: 'gtceu:chemical_bath/bathe_' + name + '_crushed_ore_to_purified_ore',
      thermal: 'gtceu:thermal_centrifuge/centrifuge_' + name + '_purified_ore_to_refined_ore',
      dust: 'gtceu:macerator/macerate_' + name + '_refined_ore_to_dust'
    }
    var chain = {}
    var required = ['crush', 'water', 'thermal', 'dust']
    var optional = ['distilled', 'bath']
    for (var i = 0; i < required.length; i++) {
      chain[required[i]] = stepOf(found[ids[required[i]]], required[i] === 'crush' ? 'raw ore maceration' : required[i] === 'dust' ? 'refined ore maceration' : required[i])
      if (chain[required[i]].error) return { skip: chain[required[i]].error }
    }
    for (var k = 0; k < optional.length; k++) {
      if (found[ids[optional[k]]] === undefined) continue
      chain[optional[k]] = stepOf(found[ids[optional[k]]], optional[k])
      if (chain[optional[k]].error) return { skip: chain[optional[k]].error }
    }

    var problem = null
    if (chain.crush.inputs.length !== 1 || chain.crush.inputs[0].count !== 1 || chain.crush.fluid !== null) problem = 'the raw ore maceration does not take one raw ore'
    else if (chain.crush.outputs.length < 1 || chain.crush.outputs[0].chance < 1) problem = 'the raw ore maceration gives no crushed ore for sure'
    if (problem === null) problem = oneToOne(chain.thermal, 'thermal centrifuge')
    if (problem === null && chain.thermal.fluid !== null) problem = 'the thermal centrifuge step has a fluid'
    if (problem === null) problem = oneToOne(chain.dust, 'refined ore maceration')
    if (problem === null && chain.dust.fluid !== null) problem = 'the refined ore maceration has a fluid'
    if (problem === null) {
      chain.raw = chain.crush.inputs[0].id !== undefined ? chain.crush.inputs[0].id : null   // a tag when GTM takes any raw ore of the material
      chain.crushed = chain.crush.outputs[0]
      VARIANTS.forEach(function (v) {
        if (problem !== null || !chain[v]) return
        problem = oneToOne(chain[v], v)
        if (problem === null && chain[v].fluid === null) problem = 'the ' + v + ' step has no fluid'
      })
    }
    if (problem !== null) return { skip: problem }
    return chain
  }

  // ---------------------------------------------------------------- one plant recipe

  // the outputs of one variant: [{ item, whole, chance }] in order (dust first), amounts are expected values (merged by item); the stone dust of
  // the washers is not among them (the plant's own rubble replaces it)
  function outputsOf(chain, variant, crushed) {
    var wash = chain[variant]
    var order = []
    var amount = {}
    function add(item, x) {
      if (x <= 0) return
      if (amount[item] === undefined) {
        amount[item] = 0
        order.push(item)
      }
      amount[item] += x
    }
    var dust = chain.dust.outputs[0]
    add(dust.id, crushed * dust.count * dust.chance)
    chain.crush.outputs.slice(1).forEach(function (o) { add(o.id, o.count * o.chance) })
    wash.outputs.slice(1).forEach(function (o) {
      if (o.id !== STONE) add(o.id, crushed * o.count * o.chance)
    })
    chain.thermal.outputs.slice(1).forEach(function (o) { add(o.id, crushed * o.count * o.chance) })
    chain.dust.outputs.slice(1).forEach(function (o) { add(o.id, crushed * o.count * o.chance) })
    return order.map(function (item) {
      var whole = Math.floor(amount[item] + 1e-9)
      var chance = Math.round((amount[item] - whole) * 10000)
      if (chance >= 10000) {
        whole++
        chance = 0
      }
      return { item: item, whole: whole, chance: chance }
    })
  }

  function planOf(name, chain, variant) {
    var wash = chain[variant]
    var crushed = chain.crushed.count
    var energy = chain.crush.eut * chain.crush.duration +
      crushed * (wash.eut * wash.duration + chain.thermal.eut * chain.thermal.duration + chain.dust.eut * chain.dust.duration)
    return {
      id: ID_PREFIX + name + '_' + variant,
      material: name,
      variant: variant,
      input: chain.raw,
      stone: STONE,
      n: crushed,
      circuit: variant === 'distilled' ? 2 : 0,
      eut: EUT,
      rubble: crushed * RUBBLE_PER_CRUSHED,
      fluid: { id: wash.fluid.id, amount: crushed * wash.fluid.amount },
      outputs: outputsOf(chain, variant, crushed),
      energy: energy,
      duration: Math.max(1, Math.round(energy / EUT))
    }
  }

  function entriesOf(plan) {
    var entries = 1   // the rubble
    plan.outputs.forEach(function (o) {
      if (o.whole > 0) entries++
      if (o.chance > 0) entries++
    })
    return entries
  }

  function generate(event) {
    OP.reagents = {}
    OP.recipes = []
    OP.skipped = []
    OP.ores = 0
    var K = classes()
    var materials = []
    var coll = new K.ArrayList(K.API.materialManager.getRegisteredMaterials())
    for (var i = 0; i < coll.size(); i++) materials.push(coll.get(i))
    materials.sort(function (a, b) {
      var x = String(a.getName())
      var y = String(b.getName())
      return x < y ? -1 : (x > y ? 1 : 0)
    })
    var found = looseRecipes(event)

    var counts = { water: 0, distilled: 0, bath: 0 }
    var bySkip = {}

    materials.forEach(function (mat) {
      var name = String(mat.getName())
      var skip = null
      var plans = []
      var reagent = null
      try {
        var prop = mat.getProperty(K.PropertyKey.ORE)
        if (prop === null || prop === undefined) return
        if (mat.hasProperty(K.PropertyKey.GEM)) {
          skip = 'gem ore, stays with the sifter'
        } else {
          var chain = chainOf(found, name)
          if (chain.skip) {
            skip = chain.skip
          } else {
            if (chain.raw === null) chain.raw = rawItemOf(mat)
            if (chain.raw === null) skip = 'no raw ore item'
            else {
              VARIANTS.forEach(function (v) {
                if (chain[v]) plans.push(planOf(name, chain, v))
              })
              var wanted = [chain.raw, STONE]
              plans.forEach(function (plan) {
                plan.outputs.forEach(function (o) { wanted.push(o.item) })
              })
              var missing = wanted.filter(function (id) { return !Item.exists(id) })
              var tooMany = plans.filter(function (plan) { return entriesOf(plan) > MAX_ITEM_OUTPUTS })
              if (missing.length > 0) {
                skip = 'item not registered: ' + missing.join(', ')
              } else if (tooMany.length > 0) {
                skip = 'more item outputs than the recipe type holds (' + MAX_ITEM_OUTPUTS + ')'
              } else {
                plans.forEach(function (plan) {
                  if (plan.variant === 'bath') reagent = plan.fluid.id
                  if (!Fluid.exists(plan.fluid.id)) skip = 'fluid not registered: ' + plan.fluid.id
                })
              }
            }
          }
        }
      } catch (e) {
        skip = 'exception while reading its recipes: ' + e
      }
      if (skip) {
        OP.skipped.push({ material: name, reason: skip })
        if (!bySkip[skip]) bySkip[skip] = []
        bySkip[skip].push(name)
        return
      }

      plans.forEach(function (plan) {
        var recipe = event.recipes.gtceu.ore_processing(plan.id)
          .itemInputs('1x ' + plan.input)
        if (plan.circuit > 0) recipe.circuit(plan.circuit)
        recipe.inputFluids(Fluid.of(plan.fluid.id, plan.fluid.amount))
        plan.outputs.forEach(function (o) {
          if (o.whole > 0) recipe.itemOutputs(o.whole + 'x ' + o.item)
          if (o.chance > 0) recipe.chancedOutput('1x ' + o.item, o.chance, 0)
        })
        recipe.itemOutputs(plan.rubble + 'x ' + plan.stone)
        recipe.EUt(plan.eut).duration(plan.duration)
        counts[plan.variant]++
        OP.recipes.push(plan)
      })
      if (reagent !== null) OP.reagents[name] = reagent
      OP.ores++
    })

    var total = counts.water + counts.distilled + counts.bath
    console.info('[grindless/mv] ore_processing recipes added: ' + total + ' (water ' + counts.water + ', distilled ' + counts.distilled +
      ', bath ' + counts.bath + ') for ' + OP.ores + ' ores; skipped ' + OP.skipped.length)
    Object.keys(bySkip).forEach(function (reason) {
      console.info('[grindless/mv] ore plant skipped (' + reason + '): ' + bySkip[reason].join(', '))
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error('[grindless/mv] ore plant recipe generation failed: ' + e)
    }
  })
})()
