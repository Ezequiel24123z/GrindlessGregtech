// priority: -20224
// -----------------------------------------------------------------------------------------------
// Resources of other worlds do not come from Earth (DECISIONS.md 2026-10-24 and 2026-10-25): titanium and helium-3 only from the
// Moon; tungsten, samarium and deuterium only from Mars. data/grindless/tables/offworld_only.json lists every Earth source the pack
// had (the Moon's at v0.4.0, Mars' at v0.5.4 with wave B) and what happens to it:
//   strip    the recipe is removed and added back with GTM's builder (same inputs, chances, energy and time), without the listed item
//            or fluid outputs; new id grindless:<type>/offworld_only/<old path>
//   remove   the recipe goes away (its only product was a resource of another world)
// The ore byproducts are changed at startup (startup_scripts/grindless/moon/earth_byproducts.js), the End bauxite vein loses its
// ilmenite and the End its scheelite vein (moon/worldgen.js, data/grindless/tables/veins_end.json) and the Productive Bees combs of
// those materials only run in their own world (integration/productivebees.js, the table's "worlds"). The smoke test (gg_test_moon.js)
// also scans every loaded recipe for a new Earth source of each world's watched resources.
// Published as global.grindless.moon.offworldOnly for the test.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  const G = global.grindless
  const MOON = G.moon || (G.moon = {})
  const LOG = '[grindless/moon] '

  // GT recipe JSON (GTM 7.5.3 serializer) -> the GTM KubeJS builder, dropping the given outputs. Only what these recipes use:
  // sized / plain item ingredients (item or tag) with chances, fluid ingredients (tag or fluid), item and fluid outputs with
  // chances, EU per tick, duration and the data map. Anything else (conditions, CWU...) makes it refuse: the recipe stays.
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

  function fluidOf(content) {
    var v = content.value && content.value[0]
    if (!v) return null
    if (v.tag) return { text: '#' + v.tag + ' ' + content.amount, id: null, amount: content.amount }
    if (v.fluid) return { text: v.fluid + ' ' + content.amount, id: v.fluid, amount: content.amount }
    return null
  }

  function rebuild(event, json, newId, dropItems, dropFluids) {
    var known = ['type', 'duration', 'category', 'tickInputs', 'inputs', 'outputs', 'data']
    var extra = Object.keys(json).filter(function (k) { return known.indexOf(k) < 0 })
    if (extra.length > 0) throw new Error('unsupported fields ' + extra.join(','))
    var tickIn = json.tickInputs || {}
    var tickKeys = Object.keys(tickIn).filter(function (k) { return k !== 'eu' })
    if (tickKeys.length > 0) throw new Error('unsupported tick inputs ' + tickKeys.join(','))
    var eu = tickIn.eu && tickIn.eu[0] ? tickIn.eu[0].content : 0
    if (typeof eu !== 'number') throw new Error('EU is not a number')
    var type = String(json.type).replace(/^gtceu:/, '')
    var b = event.recipes.gtceu[type](newId)
    var inputs = json.inputs || {}
    var outputs = json.outputs || {}
    ;(inputs.item || []).forEach(function (e) {
      var s = sizedOf(e.content)
      if (s === null) throw new Error('item input ' + JSON.stringify(e))
      if (e.chance === undefined) b.itemInputs(s)
      else if (e.chance === 0) b.notConsumable(s)
      else b.chancedInput(s, e.chance, e.tierChanceBoost || 0)
    })
    ;(inputs.fluid || []).forEach(function (e) {
      var f = fluidOf(e.content)
      if (f === null || e.chance !== undefined) throw new Error('fluid input ' + JSON.stringify(e))
      b.inputFluids(f.text)
    })
    var dropped = []
    ;(outputs.item || []).forEach(function (e) {
      var s = sizedOf(e.content)
      if (s === null) throw new Error('item output ' + JSON.stringify(e))
      var id = s.replace(/^\d+x /, '')
      if (dropItems.indexOf(id) >= 0) { dropped.push(id); return }
      if (e.chance === undefined || e.chance >= 10000) b.itemOutputs(s)
      else b.chancedOutput(s, e.chance, e.tierChanceBoost || 0)
    })
    ;(outputs.fluid || []).forEach(function (e) {
      var f = fluidOf(e.content)
      if (f === null || f.id === null) throw new Error('fluid output ' + JSON.stringify(e))
      if (dropFluids.indexOf(f.id) >= 0) { dropped.push(f.id); return }
      if (e.chance === undefined || e.chance >= 10000) b.outputFluids(Fluid.of(f.id, f.amount))
      else b.chancedFluidOutput(Fluid.of(f.id, f.amount), e.chance, e.tierChanceBoost || 0)
    })
    var data = json.data || {}
    Object.keys(data).forEach(function (k) {
      if (typeof data[k] === 'number') b.addData(k, data[k])
      else b.addDataString(k, String(data[k]))
    })
    b.EUt(eu).duration(json.duration)
    return dropped
  }

  ServerEvents.recipes(function (event) {
    var table = G.readJsonTable('kubejs/data/grindless/tables/offworld_only.json')
    var report = { stripped: [], removed: [], failed: [], missing: [] }

    table.strip.forEach(function (s) {
      var captured = []
      event.forEachRecipe({ id: s.recipe }, function (r) {
        try {
          captured.push(JSON.parse(String(r.json)))
        } catch (e) {
          report.failed.push(s.recipe + ' (unreadable: ' + e + ')')
        }
      })
      if (captured.length === 0) {
        report.missing.push(s.recipe)
        return
      }
      var path = s.recipe.split(':')[1].replace(/^[^\/]+\//, '')
      var newId = 'grindless:offworld_only/' + path
      try {
        var dropped = rebuild(event, captured[0], newId, s.outputs || [], s.fluids || [])
        var want = (s.outputs || []).concat(s.fluids || [])
        var notFound = want.filter(function (id) { return dropped.indexOf(id) < 0 })
        event.remove({ id: s.recipe })
        report.stripped.push({ from: s.recipe, to: 'grindless:' + String(captured[0].type).replace(/^gtceu:/, '') + '/offworld_only/' + path, dropped: dropped, notFound: notFound })
        if (notFound.length > 0) console.warn(LOG + s.recipe + ': ' + notFound.join(', ') + ' was not an output any more')
      } catch (e) {
        // the original stays: better a known Earth source in the log than a broken recipe
        report.failed.push(s.recipe + ' (' + e + ')')
      }
    })

    table.remove.forEach(function (r) {
      var n = 0
      event.forEachRecipe({ id: r.recipe }, function () { n++ })
      if (n === 0) {
        report.missing.push(r.recipe)
        return
      }
      event.remove({ id: r.recipe })
      report.removed.push(r.recipe)
    })

    MOON.offworldOnly = report
    console.info(LOG + 'resources of other worlds cut on Earth: stripped ' + report.stripped.length + '/' + table.strip.length + ', removed ' + report.removed.length + '/' +
      table.remove.length + (report.missing.length > 0 ? '; not in this pack: ' + report.missing.join(', ') : ''))
    if (report.failed.length > 0) console.error(LOG + 'resources of other worlds: could not rebuild ' + report.failed.join('; '))
  })
})()
