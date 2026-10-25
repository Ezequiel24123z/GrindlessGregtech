// -----------------------------------------------------------------------------------------------
// Addon recipes that collide in GTM's recipe lookup (data/grindless/tables/lookup_collisions.json; AGENTS.md "One recipe per lookup
// path"). GTM 7.5.3 keeps one recipe per ingredient path, so of two recipes of one type on one path, or one whose path runs into the
// other's, only one ever runs. The table lists the addon collisions that lose a route or run the wrong recipe; the same-result
// duplicates stay in the baseline of the bench guard (tools/test/overlay/kubejs/server_scripts/gg_test_recipe_lookup.js), which
// asks GTM's lookup for every recipe after this script and checks the recipes below by name (must_reach).
//   remove   the listed recipes go away; refused (an error in the log) when the entry's `keeps` recipe is missing, so the route
//            itself never disappears
//   circuit  each recipe is read back as JSON, removed, and added again with GTM's KubeJS builder under grindless:<type>/<old path>:
//            the same inputs in the same order, chances, EU, duration, data and dimension conditions, and the programmed circuit
//            set to the entry's (added after the items when the recipe had none). GTM's .circuit(n) on an existing recipe ADDS a
//            second circuit and a recipe with two circuits never runs, hence the rebuild. Each recipe is planned first and only
//            then removed: a shape the rebuild does not know leaves the original alone and logs an error.
// GTM copies every chemical reactor recipe a script adds into the large chemical reactor under the same path
// (GregTechKubeJSPlugin.handleGTRecipe runs the type's onRecipeBuild), so the large reactor's own rebuilt dynamite and GTM's copy
// of the small reactor's one are the same recipe, grindless:large_chemical_reactor/dynamite.
// Dynamite in the small chemical reactor now has paper, string and circuit 2: one item more than the machine's two slots, so GTM's
// KubeJS schema warns ("Trying to add more inputs than RecipeType can support") and EMI's page for the small reactor draws only
// the first two. The circuit sits in the machine's own circuit slot; GT--'s bomb has the same shape (GTM warns about it in
// latest.log), and the large reactor's page shows both circuits.
// Published as global.grindless.lookupCollisions = { removed, rebuilt: [{ from, to, circuit }], kept, failed, missing } for the
// guard.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var G = global.grindless || (global.grindless = {})
  var LOG = '[grindless/lookup] '
  var TABLE = 'kubejs/data/grindless/tables/lookup_collisions.json'

  // gtceu:sized / plain item ingredient (item or tag) -> builder text ("2x minecraft:paper", "1x #forge:dusts/carbon")
  function sizedOf(content) {
    var count = 1
    var ing = content
    if (content.type === 'gtceu:sized') {
      count = content.count || 1
      ing = content.ingredient
    }
    if (!ing || ing.type !== undefined) return null
    if (ing.item) return count + 'x ' + ing.item
    if (ing.tag) return count + 'x #' + ing.tag
    return null
  }

  // fluid ingredient with one value -> { text (inputFluids), id (Fluid.of, null for a tag), amount }
  function fluidOf(content) {
    var values = content.value || []
    if (values.length !== 1 || content.nbt !== undefined) return null
    var v = values[0]
    if (v.tag) return { text: '#' + v.tag + ' ' + content.amount, id: null, amount: content.amount }
    if (v.fluid) return { text: v.fluid + ' ' + content.amount, id: v.fluid, amount: content.amount }
    return null
  }

  // GT recipe JSON (GTM 7.5.3 serializer) -> the builder calls that make it again with `circuit` as its programmed circuit.
  // Throws on anything it does not know, before anything is touched.
  function planRebuild(json, circuit) {
    var known = ['type', 'duration', 'category', 'tickInputs', 'inputs', 'outputs', 'data', 'recipeConditions']
    var extra = Object.keys(json).filter(function (k) { return known.indexOf(k) < 0 })
    if (extra.length > 0) throw new Error('unsupported fields ' + extra.join(','))
    if (json.category !== undefined && json.category !== json.type) throw new Error('category ' + json.category + ' is not the type\'s')
    var tickIn = json.tickInputs || {}
    var tickKeys = Object.keys(tickIn).filter(function (k) { return k !== 'eu' })
    if (tickKeys.length > 0) throw new Error('unsupported tick inputs ' + tickKeys.join(','))
    var eu = tickIn.eu && tickIn.eu.length === 1 ? tickIn.eu[0].content : null
    if (typeof eu !== 'number' || eu <= 0) throw new Error('EU is not one positive number')
    if (typeof json.duration !== 'number' || json.duration <= 0) throw new Error('no duration')
    var inputs = json.inputs || {}
    var outputs = json.outputs || {}
    ;['inputs', 'outputs'].forEach(function (part) {
      var other = Object.keys(json[part] || {}).filter(function (k) { return k !== 'item' && k !== 'fluid' })
      if (other.length > 0) throw new Error('unsupported ' + part + ' ' + other.join(','))
    })
    var calls = []
    var circuits = 0
    ;(inputs.item || []).forEach(function (e) {
      if (e.content && e.content.type === 'gtceu:circuit') {
        circuits++
        calls.push(function (b) { b.circuit(circuit) })
        return
      }
      var s = sizedOf(e.content)
      if (s === null) throw new Error('item input ' + JSON.stringify(e))
      if (e.chance === undefined) calls.push(function (b) { b.itemInputs(s) })
      else if (e.chance === 0) calls.push(function (b) { b.notConsumable(s) })
      else {
        var chanceIn = e.chance
        var boostIn = e.tierChanceBoost || 0
        calls.push(function (b) { b.chancedInput(s, chanceIn, boostIn) })
      }
    })
    if (circuits > 1) throw new Error('already has ' + circuits + ' circuits')
    if (circuits === 0) calls.push(function (b) { b.circuit(circuit) })
    ;(inputs.fluid || []).forEach(function (e) {
      var f = fluidOf(e.content)
      if (f === null || e.chance !== undefined) throw new Error('fluid input ' + JSON.stringify(e))
      calls.push(function (b) { b.inputFluids(f.text) })
    })
    ;(outputs.item || []).forEach(function (e) {
      var s = sizedOf(e.content)
      if (s === null) throw new Error('item output ' + JSON.stringify(e))
      if (e.chance === undefined || e.chance >= 10000) calls.push(function (b) { b.itemOutputs(s) })
      else {
        var chanceOut = e.chance
        var boostOut = e.tierChanceBoost || 0
        calls.push(function (b) { b.chancedOutput(s, chanceOut, boostOut) })
      }
    })
    ;(outputs.fluid || []).forEach(function (e) {
      var f = fluidOf(e.content)
      if (f === null || f.id === null) throw new Error('fluid output ' + JSON.stringify(e))
      var stack = Fluid.of(f.id, f.amount)
      if (e.chance === undefined || e.chance >= 10000) calls.push(function (b) { b.outputFluids(stack) })
      else {
        var chanceFl = e.chance
        var boostFl = e.tierChanceBoost || 0
        calls.push(function (b) { b.chancedFluidOutput(stack, chanceFl, boostFl) })
      }
    })
    var data = json.data || {}
    Object.keys(data).forEach(function (k) {
      var v = data[k]
      // addData has int, long, float and Tag overloads: the blast temperature goes through its own int setter
      if (k === 'ebf_temp' && typeof v === 'number') calls.push(function (b) { b.blastFurnaceTemp(v) })
      else if (typeof v === 'string') calls.push(function (b) { b.addDataString(k, v) })
      else if (typeof v === 'number' && Math.floor(v) === v) calls.push(function (b) { b['addData(java.lang.String,int)'](k, v) })
      else throw new Error('data ' + k + '=' + JSON.stringify(v))
    })
    ;(json.recipeConditions || []).forEach(function (c) {
      if (c.type !== 'dimension' || !c.dimension || c.reverse) throw new Error('condition ' + JSON.stringify(c))
      calls.push(function (b) { b.dimension(c.dimension) })
    })
    return { calls: calls, eu: eu, duration: json.duration }
  }

  // grindless:<type path>/<old path>; GTM's builder puts the type path in front of the id it is given
  function newIds(type, oldId) {
    var typePath = type.substring(type.indexOf(':') + 1)
    var path = oldId.substring(oldId.indexOf(':') + 1)
    if (path.indexOf(typePath + '/') === 0) path = path.substring(typePath.length + 1)
    return { builder: 'grindless:' + path, final: 'grindless:' + typePath + '/' + path }
  }

  function exists(event, id) {
    var n = 0
    event.forEachRecipe({ id: id }, function () { n++ })
    return n > 0
  }

  function readJson(event, id) {
    var found = []
    event.forEachRecipe({ id: id }, function (r) { found.push(JSON.parse(String(r.json))) })
    return found.length > 0 ? found[0] : null
  }

  function applyRemove(event, entry, report) {
    var keeps = entry.keeps
    if (keeps && !exists(event, keeps)) {
      report.failed.push(entry.ids.join(', ') + ' (kept: ' + keeps + ' is missing, nothing removed)')
      return
    }
    if (keeps) report.kept.push(keeps)
    entry.ids.forEach(function (id) {
      if (!exists(event, id)) {
        report.missing.push(id)
        return
      }
      event.remove({ id: id })
      report.removed.push(id)
    })
  }

  function applyCircuit(event, entry, report) {
    entry.ids.forEach(function (id) {
      var json = readJson(event, id)
      if (json === null) {
        report.missing.push(id)
        return
      }
      var type = String(json.type)
      var shortType = type.replace(/^gtceu:/, '')
      var ids = newIds(type, id)
      var plan
      try {
        var builder = type.indexOf('gtceu:') === 0 ? event.recipes.gtceu[shortType] : undefined
        if (builder === undefined || builder === null) throw new Error('no GT builder for ' + type)
        plan = planRebuild(json, entry.circuit)
      } catch (e) {
        report.failed.push(id + ' (' + e + ', left as it was)')
        return
      }
      event.remove({ id: id })
      try {
        var b = event.recipes.gtceu[shortType](ids.builder)
        plan.calls.forEach(function (call) { call(b) })
        b.EUt(plan.eu).duration(plan.duration)
        report.rebuilt.push({ from: id, to: ids.final, circuit: entry.circuit })
      } catch (e2) {
        // the plan was validated: only an unexpected builder mismatch gets here, and the original is already gone
        report.failed.push(id + ' (removed, could not add ' + ids.final + ': ' + e2 + ')')
      }
    })
  }

  ServerEvents.recipes(function (event) {
    var report = { removed: [], rebuilt: [], kept: [], failed: [], missing: [] }
    G.lookupCollisions = report
    try {
      var table = G.readJsonTable(TABLE)
      ;(table.collisions || []).forEach(function (entry) {
        if (entry.action === 'remove') applyRemove(event, entry, report)
        else if (entry.action === 'circuit' && typeof entry.circuit === 'number') applyCircuit(event, entry, report)
        else report.failed.push(entry.ids.join(', ') + ' (unknown action ' + entry.action + ')')
      })
    } catch (e) {
      report.failed.push('table: ' + e)
    }
    console.info(LOG + 'recipe lookup collisions: removed ' + report.removed.length + ', rebuilt ' + report.rebuilt.length + ' on their own circuit (' +
      report.rebuilt.map(function (r) { return r.to + ' circuit ' + r.circuit }).join(', ') + ')' +
      (report.missing.length > 0 ? '; not in this pack: ' + report.missing.join(', ') : ''))
    if (report.failed.length > 0) console.error(LOG + 'recipe lookup collisions not fixed: ' + report.failed.join('; '))
  })
})()
