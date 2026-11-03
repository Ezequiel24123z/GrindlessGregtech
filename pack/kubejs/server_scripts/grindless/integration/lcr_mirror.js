// priority: -27799
// -----------------------------------------------------------------------------------------------
// The large chemical reactor follows the chemical reactor (FIX-LCR, audit 2026-11-03).
//
// GTM 7.5.3 copies a chemical reactor recipe into the large chemical reactor only when it is built in Java (GTRecipeType#onRecipeBuild sets
// onSave on GTRecipeBuilder; KubeJS's GTRecipeJS.onSave is never set). So a chemical reactor recipe a script adds has no large reactor copy
// (the HV coil chemical plant and the LuV mega chemical complex run the large reactor's type), and GTM's copy of one a script removed or
// rebuilt stays live and bypasses the new line. This script makes the large chemical reactor follow the FINAL chemical reactor set, in
// every namespace:
//   - every <ns>:chemical_reactor/<path> gets <ns>:large_chemical_reactor/<path> with the same content and the type switched; a stale copy
//     (its chemical reactor original was rebuilt under the same id or edited) is replaced;
//   - an <ns>:large_chemical_reactor/<path> whose <ns>:chemical_reactor/<path> was in the datapack but a script removed it is removed.
// Left alone: large reactor recipes with no chemical reactor original (GTM's shortcut family, GT--'s lines) and explicit large reactor
// recipes a script added (an explicit recipe on the same path wins: never two).
//
// Band -400 (tools/analysis/script_order.json): after every handler that adds, removes or edits recipes (offworld_only -210, the composers
// -200, hidden -100, the cost curve -300). Recipes are read live like the composers do (ev/combined_cycle_and_hot_mill.js gather()):
// originalRecipes plus addedRecipes, minus removed, serialized when changed.
//
// Published for the test (tools/test/overlay/kubejs/server_scripts/gg_test_lcr_mirror.js):
//   global.grindless.lcrMirror = { done, added: [ids], replaced: [ids], removed: [ids], kept: [ids already equal], explicit: [ids], failed: [ids] }
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var G = global.grindless || (global.grindless = {})
  var LOG = '[grindless/lcr_mirror] '
  var CR = 'gtceu:chemical_reactor'
  var LCR = 'gtceu:large_chemical_reactor'
  var CR_ID = /^([^:]+):chemical_reactor\/(.+)$/
  var LCR_ID = /^([^:]+):large_chemical_reactor\/(.+)$/
  // RecipeJS.toString() is "<id>[<type>]"
  var ID_TYPE = /^(.*)\[([^\[\]]*)\]$/

  G.lcrMirror = { done: false, added: [], replaced: [], removed: [], kept: [], explicit: [], failed: [] }

  function canonical(v) {
    if (v === null || typeof v !== 'object') return JSON.stringify(v)
    if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']'
    return '{' + Object.keys(v).sort().map(function (k) { return JSON.stringify(k) + ':' + canonical(v[k]) }).join(',') + '}'
  }

  function jsonOf(entry) {
    if (entry.json !== undefined) return entry.json
    var r = entry.recipe
    entry.json = null
    try {
      if (entry.added || r.hasChanged()) r.serialize()
      if (r.json !== null && r.json !== undefined) entry.json = JSON.parse(String(r.json))
    } catch (e) {
      entry.error = String(e)
    }
    return entry.json
  }

  // the chemical reactor and large chemical reactor recipes: { crFinal, crOriginalIds, lcrFinal } (ids to { id, recipe, added })
  function gather(event) {
    var s = { crFinal: {}, crOriginalIds: {}, lcrFinal: {} }
    function take(r, added) {
      var m = ID_TYPE.exec(String(r))
      if (!m) return
      var removed = !!r.removed
      if (m[2] === CR) {
        if (!added) s.crOriginalIds[m[1]] = true
        if (!removed) s.crFinal[m[1]] = { id: m[1], recipe: r, added: added }
      } else if (m[2] === LCR && !removed) {
        s.lcrFinal[m[1]] = { id: m[1], recipe: r, added: added }
      }
    }
    event.originalRecipes.values().forEach(function (r) { take(r, false) })
    event.addedRecipes.forEach(function (r) { take(r, true) })
    return s
  }

  function mirrorOf(json) {
    var copy = JSON.parse(JSON.stringify(json))
    if (copy.category !== undefined) copy.category = LCR
    copy.type = LCR
    return copy
  }

  function comparable(json) {
    var c = JSON.parse(JSON.stringify(json))
    delete c.type
    delete c.category
    return canonical(c)
  }

  global.grindless.recipes('integration/lcr_mirror', function (event) {
    var started = Date.now()
    var R = G.lcrMirror
    var s = gather(event)

    Object.keys(s.crFinal).forEach(function (id) {
      var m = CR_ID.exec(id)
      if (!m) return
      var target = m[1] + ':large_chemical_reactor/' + m[2]
      var existing = s.lcrFinal[target]
      if (existing && existing.added) {
        R.explicit.push(target)
        return
      }
      var json = jsonOf(s.crFinal[id])
      if (!json) {
        R.failed.push(id + ': ' + s.crFinal[id].error)
        return
      }
      if (existing) {
        var have = jsonOf(existing)
        if (have && comparable(have) === comparable(json)) {
          R.kept.push(target)
          return
        }
        event.remove({ id: target })
        R.replaced.push(target)
      } else {
        R.added.push(target)
      }
      event.custom(JsonIO.parseRaw(JSON.stringify(mirrorOf(json)))).id(target)
    })

    Object.keys(s.lcrFinal).forEach(function (target) {
      var m = LCR_ID.exec(target)
      if (!m || s.lcrFinal[target].added) return
      var crId = m[1] + ':chemical_reactor/' + m[2]
      if (s.crOriginalIds[crId] && !s.crFinal[crId]) {
        event.remove({ id: target })
        R.removed.push(target)
      }
    })

    R.done = true
    console.info(LOG + R.added.length + ' added, ' + R.replaced.length + ' replaced, ' + R.removed.length + ' removed, ' + R.kept.length + ' already equal, ' +
      R.explicit.length + ' explicit large reactor recipes kept, ' + R.failed.length + ' failed, in ' + (Date.now() - started) + ' ms')
    if (R.failed.length > 0) console.error(LOG + 'could not read: ' + R.failed.join('; '))
  })
})()
