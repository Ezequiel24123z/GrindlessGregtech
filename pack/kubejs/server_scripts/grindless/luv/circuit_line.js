// -----------------------------------------------------------------------------------------------
// GT--'s circuit assembly line at LuV (docs/eras/luv.md, decision 4 "Living circuits at LuV"; spike S0-4; package LuV-A5): its wetware
// processor at LuV voltage, and the molten cerrobase its own recipe needs.
//
// GT--'s circuit assembly line (gtnn:circuit_assembly_line) has ONE energy-hatch cell (gtnn 1.3.10, GTPPMachines.kt:58-105), and GTM
// gives a single hatch no tier above its own, so its wetware recipe at 38,400 EU/t (ZPM tier) could never run on LuV power. The design
// makes wetware processors at LuV on that line, so the recipe is registered again at LuV voltage with the SAME energy per run
// (rule 2: no inflated cost, no discount): 30,720 EU/t for ceil(EU of the original / 30,720) ticks, 750 t for GT--'s 38,400 x 600.
//
//   removed   gtnn:circuit_assembly_line/wetware_processor_luv_soldering_alloy (by id: one recipe per lookup path)
//   added     grindless:circuit_assembly_line/wetware_processor_luv: the original's inputs IN ORDER (the line checks its buses in order),
//             its fluid and outputs, read from this load's original recipe, at 30,720 EU/t; .researchWithoutRecipe(<the original's
//             research id>), so GT--'s data stick (gtceu:scanner/1_x_gtnn_etched_wetware_processor_base) still opens it: GTM's KubeJS
//             plugin saves every added GT recipe through GTRecipeBuilder#save, which files it under that research id, and GT--'s
//             CircuitAssemblyLineMachine#checkResearch looks it up there (GTRecipe equality is by id).
//   If the original is missing or unreadable nothing is removed, and the reason is logged as an error.
//
// Molten cerrobase 140 (LuV integration run C3): GT--'s gtnn:assembly_line/circuit_assembly_line takes 1,440 mB of
// #forge:molten_cerrobase_140 (CircuitAssemblyLineMachineRecipeHandler.kt:60), and nothing made it, so the line could not be built.
// GT-- builds cerrobase 140 with a plain liquid (gtceu:cerrobase_140, SecondMaterials.kt:83) and a 1,230 K blast temperature; GTM then
// registers a molten form too, but its generators only ever fill a material's primary fluid: the extractor (ingot, nugget, block) and
// the alloy blast smelter give the liquid. GTM makes molten alloys only in the alloy blast smelter, for blast temperatures of 1,750 K
// and up; below that (cerrobase, stainless steel, rose gold...) the molten form is never made. So:
//   added     grindless:fluid_heater/molten_cerrobase_140: GTM's liquid cerrobase -> the same amount of molten cerrobase, circuit 1, at the
//             EU/t and time GTM's extractor charges to melt one ingot (gtceu:extractor/extract_cerrobase_140_ingot, read at load:
//             144 mB, 120 EU/t x 181 t). Not an extractor recipe: ingot -> molten would share the path of GTM's ingot -> liquid
//             (one recipe per lookup path), and dust -> molten would skip the electric blast furnace GTM asks of cerrobase.
//
// Published for the bench test: global.grindless.circuitLine { retiered: [{ from, id, recipeId, eut, duration, energy, sourceEnergy,
// researchId, itemsIn, fluidsIn, itemsOut }], melt: { from, id, recipeId, input, output, amount, circuit, eut, duration },
// skipped: [{ from, reason }] }.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/luv] '
  var G = global.grindless || (global.grindless = {})
  var CL = G.circuitLine || (G.circuitLine = {})

  var LUV_EUT = 30720
  var RETIER = [
    { from: 'gtnn:circuit_assembly_line/wetware_processor_luv_soldering_alloy', name: 'wetware_processor_luv', researchId: '1x_gtnn_etched_wetware_processor_base' }
  ]
  CL.planned = RETIER
  var MELT = {
    from: 'gtceu:extractor/extract_cerrobase_140_ingot', name: 'molten_cerrobase_140', liquid: 'gtceu:cerrobase_140',
    molten: 'gtceu:molten_cerrobase_140', circuit: 1
  }
  CL.meltPlan = MELT

  // RecipeJS.toString() is "<id>[<type>]"
  function recipeId(r) {
    var m = /^(.*)\[([^\[\]]*)\]$/.exec(String(r))
    if (m) return m[1]
    try {
      return String(r.getId())
    } catch (e) {
      return ''
    }
  }

  function originalJson(event, id) {
    var found = null
    event.originalRecipes.values().forEach(function (r) {
      if (found !== null || recipeId(r) !== id) return
      if (r.json === null || r.json === undefined) return
      found = JSON.parse(String(r.json))
    })
    return found
  }

  // a sized item content -> "<count>x <item>" or "<count>x #<tag>"
  function itemText(content) {
    var count = Number(content.count || 1)
    var ing = content.ingredient ? content.ingredient : content
    if (Array.isArray(ing)) ing = ing.length === 1 ? ing[0] : null
    if (ing && ing.item) return count + 'x ' + ing.item
    if (ing && ing.tag) return count + 'x #' + ing.tag
    return null
  }

  function energyOf(j) {
    var eu = j.tickInputs && j.tickInputs.eu && j.tickInputs.eu[0] ? j.tickInputs.eu[0].content : null
    if (typeof eu === 'number') return eu
    if (eu && eu.voltage !== undefined) return Number(eu.voltage) * Number(eu.amperage || 1)
    return null
  }

  function researchIdsOf(j) {
    var ids = []
    ;(j.recipeConditions || []).forEach(function (c) {
      if (c.type !== 'research') return
      ;(c.research || []).forEach(function (e) { if (e.researchId) ids.push(String(e.researchId)) })
    })
    return ids
  }

  function retier(event, plan) {
    var j = originalJson(event, plan.from)
    if (j === null) return 'no original recipe ' + plan.from
    var eut = energyOf(j)
    var duration = Number(j.duration)
    if (!(eut > 0) || !(duration > 0)) return 'unreadable energy or duration'
    var research = researchIdsOf(j)
    if (research.length !== 1 || research[0] !== plan.researchId) return 'research ' + research.join(',') + ' is not ' + plan.researchId
    var itemsIn = []
    var bad = null
    ;((j.inputs && j.inputs.item) || []).forEach(function (e) {
      var t = itemText(e.content)
      if (t === null || (e.chance !== undefined && Number(e.chance) !== Number(e.maxChance || 10000))) bad = 'item input ' + JSON.stringify(e)
      itemsIn.push(t)
    })
    var fluidsIn = []
    ;((j.inputs && j.inputs.fluid) || []).forEach(function (e) {
      var f = G.compose.fluidOf(e.content)
      if (f === null) bad = 'fluid input ' + JSON.stringify(e)
      else fluidsIn.push(f)
    })
    var itemsOut = []
    ;((j.outputs && j.outputs.item) || []).forEach(function (e) {
      var t = itemText(e.content)
      if (t === null || e.chance !== undefined) bad = 'item output ' + JSON.stringify(e)
      itemsOut.push(t)
    })
    if ((j.outputs && j.outputs.fluid && j.outputs.fluid.length > 0) || (j.inputs && j.inputs.fluid && j.inputs.fluid.length > 1)) bad = 'unexpected fluids'
    if (bad !== null) return bad
    if (itemsIn.length === 0 || itemsOut.length === 0) return 'no items'

    var energy = eut * duration
    var ticks = Math.ceil(energy / LUV_EUT - 1e-9)
    var rec = {
      from: plan.from, id: 'grindless:' + plan.name, recipeId: 'grindless:circuit_assembly_line/' + plan.name, eut: LUV_EUT, duration: ticks,
      energy: LUV_EUT * ticks, sourceEnergy: energy, sourceEut: eut, sourceDuration: duration, researchId: plan.researchId,
      itemsIn: itemsIn, fluidsIn: fluidsIn, itemsOut: itemsOut
    }
    var r = event.recipes.gtceu.circuit_assembly_line(rec.id)
    // one call per stack keeps the original's order (the line checks its buses in order)
    itemsIn.forEach(function (t) { r.itemInputs(t) })
    fluidsIn.forEach(function (f) { r.inputFluids(Fluid.of(f.id, f.amount)) })
    itemsOut.forEach(function (t) { r.itemOutputs(t) })
    r.EUt(rec.eut).duration(rec.duration)
    r.researchWithoutRecipe(plan.researchId)
    event.remove({ id: plan.from })
    CL.retiered.push(rec)
    console.info(LOG + 'circuit assembly line: ' + plan.from + ' (' + eut + ' EU/t x ' + duration + ' t) -> ' + rec.recipeId + ' (' + rec.eut +
      ' EU/t x ' + rec.duration + ' t), research ' + plan.researchId)
    return null
  }

  // the molten cerrobase the line's own recipe takes, from GTM's liquid cerrobase at the price of GTM's melting of one ingot
  function melt(event) {
    var j = originalJson(event, MELT.from)
    if (j === null) return 'no original recipe ' + MELT.from
    var eut = energyOf(j)
    var duration = Number(j.duration)
    if (!(eut > 0) || !(duration > 0)) return 'unreadable energy or duration'
    var outs = (j.outputs && j.outputs.fluid) || []
    var made = outs.length === 1 ? G.compose.fluidOf(outs[0].content) : null
    if (made === null || made.id !== MELT.liquid || !(made.amount > 0)) return 'it does not make ' + MELT.liquid + ': ' + JSON.stringify(j.outputs)
    if (!Fluid.exists(MELT.molten)) return MELT.molten + ' is not registered'
    var rec = {
      from: MELT.from, id: 'grindless:' + MELT.name, recipeId: 'grindless:fluid_heater/' + MELT.name, input: MELT.liquid, output: MELT.molten,
      amount: made.amount, circuit: MELT.circuit, eut: eut, duration: duration
    }
    event.recipes.gtceu.fluid_heater(rec.id)
      .inputFluids(Fluid.of(rec.input, rec.amount))
      .circuit(rec.circuit)
      .outputFluids(Fluid.of(rec.output, rec.amount))
      .EUt(rec.eut)
      .duration(rec.duration)
    CL.melt = rec
    console.info(LOG + 'circuit assembly line: ' + rec.recipeId + ': ' + rec.amount + ' mB ' + rec.input + ' -> ' + rec.output + ', ' + rec.eut +
      ' EU/t x ' + rec.duration + ' t (from ' + MELT.from + ')')
    return null
  }

  ServerEvents.recipes(function (event) {
    CL.retiered = []
    CL.skipped = []
    RETIER.forEach(function (plan) {
      var why
      try {
        why = retier(event, plan)
      } catch (e) {
        why = 'failed: ' + e
      }
      if (why !== null) {
        CL.skipped.push({ from: plan.from, reason: why })
        console.error(LOG + 'circuit assembly line: ' + plan.from + ' left as it is: ' + why)
      }
    })
    CL.melt = null
    var whyMelt
    try {
      whyMelt = melt(event)
    } catch (e) {
      whyMelt = 'failed: ' + e
    }
    if (whyMelt !== null) {
      CL.skipped.push({ from: MELT.from, reason: whyMelt })
      console.error(LOG + 'circuit assembly line: no ' + MELT.molten + ' route, so the line cannot be built: ' + whyMelt)
    }
  })
})()
