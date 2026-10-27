// priority: -21524
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
// -----------------------------------------------------------------------------------------------
// Site rules (docs/eras/ev.md, Moon rules and Mars rules; the data is data/grindless/tables/site_fuels.json): a fuel
// needs air to burn. Every fuel recipe of the burning types (combustion generator, gas turbine, semi-fluid generator,
// GT--'s rocket engine, and the small and large boilers) gets one dimension condition per dimension with air: the
// Overworld, the Nether, the End and the two building dimensions. GTM ORs the dimension conditions of one recipe
// (DimensionCondition.isOr, GTM 7.5.3), so the fuel burns in any of them and nowhere else: not on the Moon, on Mars, in
// an orbit or on any planet added later. Reversed conditions cannot express "not the Moon and not Mars" (ORed, they
// pass everywhere), which is why this is an allowlist. Steam turbines, plasma and naquadah generators and the Dyson
// sphere do not burn anything and keep working everywhere.
//   - Fuels that carry their own oxidizer (methalox, GTM's rocket fuel, GT--'s RP-1 and methylhydrazine nitrate
//     mixtures) and lava (heat, not a fire) get no condition: they burn anywhere. On the Moon and Mars they are the
//     only fuels that work; methalox is the one made there (ev/mars_site.js and the mixer of ev/foundation.js).
//   - GTM 7.5.3's small boilers DO use recipes (gtceu:steam_boiler, one per burnable item, made by FuelRecipes from
//     burn times; GTMachines registers the solid and liquid boilers with that type), so they follow the same rule.
//   - The generator types are already rebuilt above, so their conditions are added to the rebuild. The boiler types are
//     not doubled (their boost is in pack/config/gtceu.yaml): their recipes are changed in place instead (KubeJS keeps
//     the rest of the recipe as it was and only writes recipeConditions), which also keeps the 20 boiler recipes whose
//     ingredient carries NBT (wooden tools with Damage:0) exactly as GTM made them.
//   - A recipe that already carries a dimension condition is left alone: it was placed on purpose.
//   - The new fuels of the table (methalox in the gas turbine) are added after the passes, with no condition and the
//     doubled duration. event.forEachRecipe only sees the datapack recipes, never the ones scripts add, so nothing here
//     can double them twice.
// Other scripts that add burning fuel recipes of their own call global.grindless.power.burnsInAir(recipe) to give them
// the same conditions (this pass only sees GTM's and the addons' recipes).
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var G = global.grindless || (global.grindless = {})
  var POWER = G.power || (G.power = {})
  var LOG = '[grindless/power] '
  var FACTOR = 2
  var SITE_TABLE = 'kubejs/data/grindless/tables/site_fuels.json'

  // gtceu:steam_turbine, combustion_generator, gas_turbine, semi_fluid_generator, plasma_generator (DECISIONS.md list),
  // plus the addon generator types this pack loads: GT--'s naquadah reactor (single and large) and rocket engine,
  // and GCYR's Dyson Sphere controller (unreachable today, kept consistent for whenever the journey gets there).
  var TYPES = [
    'gtceu:steam_turbine', 'gtceu:combustion_generator', 'gtceu:gas_turbine', 'gtceu:semi_fluid_generator',
    'gtceu:plasma_generator', 'gtceu:naquadah_reactor', 'gtceu:large_naquadah_reactor', 'gtceu:rocket_engine',
    'gcyr:dyson_controller'
  ]

  // ---------------------------------------------------------------- site rules (data/grindless/tables/site_fuels.json)

  function loadSite() {
    var empty = { airDimensions: [], burningTypes: [], burnAnywhere: [], newFuels: [], loaded: false }
    try {
      var t = G.readJsonTable(SITE_TABLE)
      return {
        airDimensions: (t.airDimensions || []).map(String),
        burningTypes: (t.burningTypes || []).map(String),
        burnAnywhere: t.burnAnywhere || [],
        newFuels: t.newFuels || [],
        loaded: true
      }
    } catch (e) {
      console.error(LOG + 'cannot read ' + SITE_TABLE + ', no site rules applied: ' + e)
      return empty
    }
  }

  var SITE = loadSite()

  // 'fluid:<id>' and 'tag:forge:<path>' of every fuel that burns anywhere: GTM's fuel recipes name their fluid by tag
  var ANYWHERE = {}
  SITE.burnAnywhere.forEach(function (f) {
    var id = String(f.fluid)
    ANYWHERE['fluid:' + id] = true
    ANYWHERE['tag:forge:' + id.substring(id.indexOf(':') + 1)] = true
  })

  function isBurningType(type) {
    return SITE.burningTypes.indexOf(type) >= 0
  }

  function burnsAnywhere(json) {
    var fluids = (json.inputs && json.inputs.fluid) || []
    return fluids.some(function (e) {
      var values = (e.content && e.content.value) || []
      return values.some(function (v) {
        return (v.fluid && ANYWHERE['fluid:' + v.fluid]) || (v.tag && ANYWHERE['tag:' + v.tag])
      })
    })
  }

  function hasDimension(json) {
    return (json.recipeConditions || []).some(function (c) { return c && (c.type === 'dimension' || c.type === 'gtceu:dimension') })
  }

  // published for the test and for scripts that add burning fuels of their own: burnsInAir(recipe) gives a GT recipe
  // builder the same conditions as every fuel recipe of the burning types
  POWER.factor = FACTOR
  POWER.site = SITE
  POWER.siteTable = SITE_TABLE
  POWER.burnsInAir = function (builder) {
    SITE.airDimensions.forEach(function (d) { builder.dimension(d) })
    return builder
  }

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
  // dims: the dimensions with air when the recipe burns a fuel (site rules), else empty
  function planRebuild(json, dims) {
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
    ;(dims || []).forEach(function (d) { calls.push(function (b) { b.dimension(d) }) })
    // a generator recipe stores its output as a positive tickOutputs.eu; the builder takes EU/t signed (negative = output)
    return { calls: calls, eu: -eu, duration: json.duration * FACTOR }
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

  // the burning types that are not generator types (the small and large boilers): their datapack recipes get the
  // conditions in place, so KubeJS only writes recipeConditions and the rest of each recipe stays as GTM made it
  function conditionInPlace(event, type, site) {
    var n = 0
    event.forEachRecipe({ type: type }, function (r) {
      var id = String(r.getId())
      var json
      try {
        json = JSON.parse(String(r.json))
      } catch (e) {
        site.failed.push(id + ' (unreadable: ' + e + ')')
        return
      }
      if (hasDimension(json)) {
        site.kept.push(id)
        return
      }
      if (burnsAnywhere(json)) {
        site.anywhere.push(id)
        return
      }
      try {
        SITE.airDimensions.forEach(function (d) { r.dimension(d) })
        n++
      } catch (e2) {
        site.failed.push(id + ' (' + e2 + ')')
      }
    })
    return n
  }

  // the fuels of ours (methalox): no condition, the duration GTM would give them doubled like every generator recipe
  function addNewFuels(event, site) {
    SITE.newFuels.forEach(function (f) {
      var shortType = String(f.type).replace(/^gtceu:/, '')
      var id = 'grindless:' + shortType + '/' + f.name
      if (!Fluid.exists(f.fluid)) {
        site.failed.push(id + ' (unknown fluid ' + f.fluid + ')')
        return
      }
      try {
        var duration = f.gtmDuration * FACTOR
        event.recipes.gtceu[shortType]('grindless:' + f.name)
          .inputFluids(Fluid.of(f.fluid, f.amount))
          .EUt(-f.eut)
          .duration(duration)
        site.newFuels.push({ id: id, type: String(f.type), fluid: String(f.fluid), amount: f.amount, eut: f.eut, duration: duration })
      } catch (e) {
        site.failed.push(id + ' (' + e + ')')
      }
    })
  }

  ServerEvents.recipes(function (event) {
    var report = { doubled: [], skipped: [], failed: [], perType: {} }
    var site = { airDimensions: SITE.airDimensions, conditioned: 0, perType: {}, anywhere: [], kept: [], failed: [], newFuels: [] }

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

      var burning = isBurningType(type)
      var doubledHere = 0
      var airHere = 0
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
          if (burning) site.kept.push(c.id)
          return
        }
        var dims = []
        if (burning) {
          if (burnsAnywhere(json)) site.anywhere.push(c.id)
          else dims = SITE.airDimensions
        }
        var plan
        try {
          plan = planRebuild(json, dims)
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
          if (dims.length > 0) airHere++
        } catch (e) {
          // the plan was already validated: this would only happen on an unexpected GTM/KubeJS API mismatch. The
          // original recipe is already gone at this point (same id), so the id is logged as missing rather than
          // silently left at its vanilla duration.
          report.failed.push(c.id + ' (removed, could not re-add: ' + e + ')')
        }
      })
      report.perType[type] = { seen: captured.length, doubled: doubledHere }
      if (burning) site.perType[type] = airHere
    })

    SITE.burningTypes.forEach(function (type) {
      if (TYPES.indexOf(type) >= 0) return
      site.perType[type] = conditionInPlace(event, type, site)
    })
    Object.keys(site.perType).forEach(function (t) { site.conditioned += site.perType[t] })
    addNewFuels(event, site)

    POWER.generators = report
    POWER.siteReport = site
    console.info(LOG + 'duration doubled on ' + report.doubled.length + ' generator recipes across ' + TYPES.length +
      ' types' + (report.skipped.length > 0 ? '; skipped: ' + report.skipped.join(', ') : ''))
    if (report.failed.length > 0) console.error(LOG + 'could not rebuild (kept at vanilla duration): ' + report.failed.join('; '))
    console.info(LOG + 'site rules: ' + site.conditioned + ' fuel recipes burn only where there is air (' + SITE.airDimensions.join(', ') + '): ' +
      Object.keys(site.perType).map(function (t) { return t.replace(/^gtceu:/, '') + ' ' + site.perType[t] }).join(', ') +
      '; burn anywhere: ' + site.anywhere.join(', ') + (site.kept.length > 0 ? '; kept with their own conditions: ' + site.kept.join(', ') : '') +
      '; new fuels: ' + site.newFuels.map(function (f) { return f.id + ' (' + f.amount + ' mB, ' + f.duration + ' t, ' + f.eut + ' EU/t)' }).join(', '))
    if (site.failed.length > 0) console.error(LOG + 'site rules not applied to: ' + site.failed.join('; '))
  })
})()

