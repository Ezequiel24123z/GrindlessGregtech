// -----------------------------------------------------------------------------------------------
// Power pass (DECISIONS.md): to read a little more permissive than base GregTech, closer to GTL (research/gtl/
// leisure-port.md #2), every generator recipe gives twice the EU per unit of fuel: burning the same fuel now makes
// twice the energy, so fuel use for a given power need is halved. GTL itself does not touch this (it only inflates
// its boilers, see pack/config/gtceu.yaml); this half of the boost is ours.
//
// The only field that changes is the recipe's duration: for a fixed EU/t and a fixed fuel amount per recipe, EU
// produced = EUt * duration, so doubling duration doubles total EU for the same fuel without touching the fuel
// itself, the EU/t, or any output. Large/multiblock turbines read the very same recipe types as their single-block
// versions (GTM's SimpleGeneratorMachine just parallelizes the unmodified recipe up to the machine's voltage), so
// they get the boost for free, with no separate list.
//
// Recipes are matched by TYPE and then filtered by shape, not by trusting every recipe of that type to be a
// generator: gcyr:dyson_controller mixes true power-out recipes (tickOutputs.eu, the sphere beaming power down) with
// EU-eating build/repair recipes of the same type (tickInputs.eu), so each recipe is read back and only a tickOutputs.eu
// one with no tickInputs.eu is touched. gtceu:semi_fluid_generator has no recipe in GTM 7.5.3 (creosote and the other
// semi-fluid fuels are Large/Steam Boiler fuels here, not a generator: data/recipe/misc/FuelRecipes.java); the type
// stays in the list for whenever one ships, but today it changes nothing.
//
// event.custom() only understands vanilla-shaped schemas (it is how ae2.js and expatternprovider.js patch AE2/vanilla
// crafting recipes): for a gtceu: recipe it throws deep inside KubeJS ("Cannot call property id ... It is not a
// function, it is an object"). A GT recipe has to be rebuilt through its own KubeJS builder instead, the same way
// moon/offworld_only.js does for its own GT recipe rewrites: read the recipe back as JSON, replay every input/output
// through the builder, then set EUt and the doubled duration. Only the shapes these generators actually use are
// supported (sized/plain item or fluid, tag or plain, EU on tickOutputs, the data map); anything else makes the
// rebuild refuse and leaves that one recipe at its original duration, logged under "failed". This is how gcyr:
// dyson_controller's two true generator recipes (run_dyson_sphere_space/not_space) end up skipped: they carry
// recipeConditions (dyson_sphere, orbit), a field this rebuild does not support.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var G = global.grindless || (global.grindless = {})
  var POWER = G.power || (G.power = {})
  var LOG = '[grindless/power] '

  // gtceu:steam_turbine, combustion_generator, gas_turbine, semi_fluid_generator, plasma_generator (DECISIONS.md list),
  // plus the addon generator types this pack loads: GT--'s naquadah reactor (single and large) and rocket engine,
  // and GCYR's Dyson Sphere controller (unreachable today, kept consistent for whenever the journey gets there).
  var TYPES = [
    'gtceu:steam_turbine', 'gtceu:combustion_generator', 'gtceu:gas_turbine', 'gtceu:semi_fluid_generator',
    'gtceu:plasma_generator', 'gtceu:naquadah_reactor', 'gtceu:large_naquadah_reactor', 'gtceu:rocket_engine',
    'gcyr:dyson_controller'
  ]

  function producesEu(json) {
    var out = json.tickOutputs
    return !!(out && out.eu && out.eu.length > 0)
  }

  function consumesEu(json) {
    var tin = json.tickInputs
    return !!(tin && tin.eu && tin.eu.length > 0)
  }

  // sized / plain item ingredient (item or tag) -> a builder-ready string, same reading as moon/offworld_only.js
  function sizedOf(content) {
    var count = 1
    var ing = content
    if (content.type === 'gtceu:sized') {
      count = content.count || 1
      ing = content.ingredient
    }
    if (!ing) return null
    if (ing.item) return count + 'x ' + ing.item
    if (ing.tag) return count + 'x #' + ing.tag
    return null
  }

  // fluid ingredient (tag or plain fluid) -> { text (for inputFluids), id (for Fluid.of, null for a tag), amount }
  function fluidOf(content) {
    var v = content.value && content.value[0]
    if (!v) return null
    if (v.tag) return { text: '#' + v.tag + ' ' + content.amount, id: null, amount: content.amount }
    if (v.fluid) return { text: v.fluid + ' ' + content.amount, id: v.fluid, amount: content.amount }
    return null
  }

  // validates json and turns it into a plain-data plan (nothing touches `event` yet): the exact sequence of builder
  // calls to replay, plus the doubled duration and the signed EUt. Throws on any shape it does not recognize, so the
  // caller can decide not to touch the live recipe at all when that happens (see "plan before you remove" below).
  function planRebuild(json) {
    var known = ['type', 'duration', 'category', 'tickOutputs', 'inputs', 'outputs', 'data']
    var extra = Object.keys(json).filter(function (k) { return known.indexOf(k) < 0 })
    if (extra.length > 0) throw new Error('unsupported fields ' + extra.join(','))
    var eu = json.tickOutputs.eu[0] && json.tickOutputs.eu[0].content
    if (typeof eu !== 'number') throw new Error('EU is not a number')
    var inputs = json.inputs || {}
    var outputs = json.outputs || {}
    var calls = []
    ;(inputs.item || []).forEach(function (e) {
      var s = sizedOf(e.content)
      if (s === null) throw new Error('item input ' + JSON.stringify(e))
      if (e.chance === undefined) calls.push(function (b) { b.itemInputs(s) })
      else if (e.chance === 0) calls.push(function (b) { b.notConsumable(s) })
      else { var boost1 = e.tierChanceBoost || 0; calls.push(function (b) { b.chancedInput(s, e.chance, boost1) }) }
    })
    ;(inputs.fluid || []).forEach(function (e) {
      var f = fluidOf(e.content)
      if (f === null || e.chance !== undefined) throw new Error('fluid input ' + JSON.stringify(e))
      calls.push(function (b) { b.inputFluids(f.text) })
    })
    ;(outputs.item || []).forEach(function (e) {
      var s = sizedOf(e.content)
      if (s === null) throw new Error('item output ' + JSON.stringify(e))
      if (e.chance === undefined || e.chance >= 10000) calls.push(function (b) { b.itemOutputs(s) })
      else { var boost2 = e.tierChanceBoost || 0; calls.push(function (b) { b.chancedOutput(s, e.chance, boost2) }) }
    })
    ;(outputs.fluid || []).forEach(function (e) {
      var f = fluidOf(e.content)
      if (f === null || f.id === null) throw new Error('fluid output ' + JSON.stringify(e))
      var stack = Fluid.of(f.id, f.amount)
      if (e.chance === undefined || e.chance >= 10000) calls.push(function (b) { b.outputFluids(stack) })
      else { var boost3 = e.tierChanceBoost || 0; calls.push(function (b) { b.chancedFluidOutput(stack, e.chance, boost3) }) }
    })
    var data = json.data || {}
    Object.keys(data).forEach(function (k) {
      if (typeof data[k] === 'number') { var num = data[k]; calls.push(function (b) { b.addData(k, num) }) }
      else { var str = String(data[k]); calls.push(function (b) { b.addDataString(k, str) }) }
    })
    // a generator recipe stores its output as a positive tickOutputs.eu; the builder takes EU/t signed (negative = output)
    return { calls: calls, eu: -eu, duration: json.duration * 2 }
  }

  // only called once planRebuild succeeded for this recipe, so this replay is not expected to throw; the recipe was
  // already removed by the caller at this point (same id), which is why the plan has to be validated first.
  // GTM's KubeJS builder prefixes the recipe type's path to the id it is given (event.recipes.gtceu.steam_turbine('gtceu:steam')
  // is saved as gtceu:steam_turbine/steam), so the type prefix is stripped first: the rebuilt recipe keeps its original id.
  function builderId(type, id) {
    var typePath = type.substring(type.indexOf(':') + 1)
    var ns = id.substring(0, id.indexOf(':'))
    var path = id.substring(id.indexOf(':') + 1)
    if (path.indexOf(typePath + '/') === 0) return ns + ':' + path.substring(typePath.length + 1)
    return id
  }

  function applyPlan(event, type, id, plan) {
    var shortType = type.replace(/^gtceu:/, '')
    var b = event.recipes.gtceu[shortType](builderId(type, id))
    plan.calls.forEach(function (call) { call(b) })
    b.EUt(plan.eu).duration(plan.duration)
  }

  ServerEvents.recipes(function (event) {
    var report = { doubled: [], skipped: [], failed: [], perType: {} }

    TYPES.forEach(function (type) {
      var captured = []
      event.forEachRecipe({ type: type }, function (r) {
        var id = String(r.getId())
        try {
          captured.push({ id: id, json: JSON.parse(String(r.json)) })
        } catch (e) {
          console.error(LOG + 'cannot read ' + id + ': ' + e)
        }
      })

      var doubledHere = 0
      captured.forEach(function (c) {
        var json = c.json
        if (!producesEu(json) || consumesEu(json)) return
        if (typeof json.duration !== 'number') {
          report.skipped.push(c.id + ' (no duration field)')
          return
        }
        // conditional generators (gcyr:dyson_controller's orbit / dyson_sphere recipes) are out of reach today and the
        // rebuild does not replay recipeConditions: they stay at their original duration, on purpose
        if (json.recipeConditions !== undefined) {
          report.skipped.push(c.id + ' (has recipeConditions)')
          return
        }
        var plan
        try {
          plan = planRebuild(json)
        } catch (e) {
          // nothing touched `event` yet: the original recipe is simply left alone, at its vanilla duration
          report.failed.push(c.id + ' (' + e + ')')
          return
        }
        event.remove({ id: c.id })
        try {
          applyPlan(event, type, c.id, plan)
          report.doubled.push(c.id)
          doubledHere++
        } catch (e) {
          // the plan was already validated: this would only happen on an unexpected GTM/KubeJS API mismatch. The
          // original recipe is already gone at this point (same id), so the id is logged as missing rather than
          // silently left at its vanilla duration.
          report.failed.push(c.id + ' (removed, could not re-add: ' + e + ')')
        }
      })
      report.perType[type] = { seen: captured.length, doubled: doubledHere }
    })

    POWER.generators = report
    console.info(LOG + 'duration doubled on ' + report.doubled.length + ' generator recipes across ' + TYPES.length +
      ' types' + (report.skipped.length > 0 ? '; skipped: ' + report.skipped.join(', ') : ''))
    if (report.failed.length > 0) console.error(LOG + 'could not rebuild (kept at vanilla duration): ' + report.failed.join('; '))
  })
})()

