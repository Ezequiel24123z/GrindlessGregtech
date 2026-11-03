// priority: -27774
// -----------------------------------------------------------------------------------------------
// Cost curve (Project Reforge, RF-2A; docs/reforge/02_cost_curve.md): scales the consumed item and fluid inputs of the recipes
// that make key items, GTM's own and ours, by a factor per era read from data/grindless/tables/cost_curve/<era>.json (mv..max).
// Outputs, duration, EU/t, chances, tick inputs, programmed circuits and non-consumed inputs never change. A scaled amount is a whole count dithered around n * f (see scaledCount; P2-Z).
//
// Landing state: every table has enabled=false and factors 1.0, so the pass reads the tables, logs one line and changes nothing.
// A later package switches a band on by editing its table; nothing here is hand-edited per recipe.
//
// Which recipes (one rule; tools/analysis/lib/cost_curve.mjs loads this very file, so the Node tools cannot drift from the pack):
//   1. only GT machine recipes (type gtceu:*, an `inputs` object);
//   2. the era is that of the recipe's primary output (the first item output) when a table lists it in `keys` (ids or * globs),
//      else, when a table's `include` globs match the recipe id, the tier of its EU/t; a table's `override` {glob: era|"none"} moves
//      a selected recipe to another era; any table's `exclude` globs drop it;
//   3. a table that is not enabled leaves its recipes untouched; `remove` (recipe ids, only of enabled tables) deletes a bypass.
//
// Per-key steepness (AF-CC, mega audit #202 M2-07/M2-16): the era factor is one number for the whole era, but the key series (hull,
// casing, hatches, each component, the cheapest circuit, the controllers) start from materials of very different cost, so one factor
// leaves some steps flat or falling. Two optional fields of a table act on its selected recipes, by the recipe's primary output:
//   keyFactor {glob: k}            the item and fluid factors of that output's recipes are the era's times k (k >= 1; exact id first,
//                                  then the first glob in table order). Solved per key so that every series climbs (cost-matrix --check).
//   pin {glob: {inputGlob: count}} the matching consumed input is exactly `count` and never scaled: the container of a container
//                                  key (one casing per hull, one hull per hatch) and the amperage ladder (2 of the hatch one step below,
//                                  wired and wireless; M2-03).
//
// Mechanism (KubeJS 2001 / GTM 7.5.3, evidence in the document): originals, GTM's included, are edited in place (r.json.add + save()),
// which skips the lossy GT component round trip; added recipes are not visited by forEachRecipe and their JSON is rebuilt from the
// builder's holders when the event ends, so they go through serialize() + set('inputs'). Priority: the lowest band of the server
// scripts (tools/analysis/script_order.json), after every script that adds, removes or derives a recipe.
//
// Published: global.grindless.costCurve = { eras, scaledCount, tierOfEut, validateTable, makeSelector, scaleRecipe, isOrdered, stats }.
//
// Rhino: var + function declarations only (this Rhino throws "redeclaration of var").
(function () {
  var G = global.grindless || (global.grindless = {})
  var DIR = 'kubejs/data/grindless/tables/cost_curve/'
  var ERAS = ['mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max']
  var TIERS = ['ulv', 'lv'].concat(ERAS)
  var INT_MAX = 2147483647
  var SIZED = 'gtceu:sized'
  var LOG = '[grindless/cost_curve] '

  var S = {
    tables: 0, enabled: [], scanned: 0, selected: { original: 0, added: 0 }, changed: { original: 0, added: 0 },
    items: 0, fluids: 0, split: 0, removed: { original: 0, added: 0 }, errors: 0, verifyFail: 0, firstError: '', ms: 0
  }

  function has(o, k) {
    return Object.prototype.hasOwnProperty.call(o, k)
  }

  // A fixed threshold in (0, 1] per key (plain double arithmetic only, so the pack's Rhino and Node give the same bits).
  // No charCodeAt: the pack's Rhino returns a character from it, not a number, and the hash was NaN (so no input ever rounded
  // up). The code of a printable ASCII character is its position in this table plus 32, which is what charCodeAt gave in Node.
  var ASCII = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'

  function unitOf(key) {
    var h = 7
    var s = String(key)
    for (var i = 0; i < s.length; i++) h = (h * 31 + ASCII.indexOf(s.charAt(i)) + 32) % 2147483647
    for (var k = 0; k < 3; k++) h = (h * 48271) % 2147483647
    return (h + 1) / 2147483648
  }

  // n * f as a whole count, dithered: the whole part of n * f, plus one when the fraction reaches the threshold of `key` (the
  // ingredient and its count). The count is n * f on average over all keys, whatever f is, and it never shrinks an input. With
  // ceil every count of 1 became 2 at f = 1.001 (the quantisation cliff: the index doubled there and no factor fell in the
  // band); with round a whole step of the index at 1.5, 1.25, ... still left whole eras out; with the threshold each key crosses
  // its step at its own factor, so the index follows f. Without a key it is round half up. Float noise is cut first (10 * 1.15
  // is 11.499999999999998 in doubles) and the result is capped to an int.
  function scaledCount(n, f, key) {
    var x = Math.round(n * f * 1e6) / 1e6
    var w = Math.floor(x)
    var u = key === undefined ? 0.5 : unitOf(key + '#' + n)
    var v = x - w >= u ? w + 1 : w
    return v > INT_MAX ? INT_MAX : v
  }

  function globToRe(g) {
    return new RegExp('^' + String(g).replace(/[.+?^${}()|\[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$')
  }

  function anyMatch(list, s) {
    for (var i = 0; i < list.length; i++) if (list[i].test(s)) return true
    return false
  }

  // lowest tier whose voltage (8 * 4^i) covers the EU/t; null when the recipe has none
  function tierOfEut(eut) {
    if (typeof eut !== 'number' || eut < 0) return null
    var v = 8
    for (var i = 0; i < TIERS.length - 1; i++) {
      if (eut <= v) return TIERS[i]
      v *= 4
    }
    return TIERS[TIERS.length - 1]
  }

  function eutOf(json) {
    var t = json.tickInputs
    var e = t && t.eu && t.eu[0]
    return e && typeof e.content === 'number' ? e.content : null
  }

  // 	ype is the recipe type when the json does not carry it: a recipe a script added dumps as type "unknown" even after serialize()
  function isGtRecipe(json, type) {
    var ty = typeof type === 'string' && type !== '' ? type : json && json.type
    return !!json && typeof ty === 'string' && ty.indexOf('gtceu:') === 0 &&
      !!json.inputs && typeof json.inputs === 'object' && !Array.isArray(json.inputs)
  }

  function primaryOutput(json) {
    var o = json.outputs && json.outputs.item && json.outputs.item[0]
    var c = o && o.content
    if (!c) return null
    if (typeof c.item === 'string') return c.item
    if (c.ingredient && typeof c.ingredient.item === 'string') return c.ingredient.item
    return null
  }

  function copy(o) {
    var r = {}
    for (var k in o) if (has(o, k)) r[k] = o[k]
    return r
  }

  // consumed every cycle: no chance, or the full chance (chance 0 is a catalyst or a circuit, a partial chance is a chanced input)
  function isConsumed(e) {
    if (e.chance === undefined || e.chance === null) return true
    var max = e.maxChance === undefined || e.maxChance === null ? 10000 : e.maxChance
    return e.chance > 0 && e.chance === max
  }

  // what an input is, for its threshold: the item or tag id, the fluid or tag id, else the JSON text
  function keyOf(x) {
    if (x && typeof x === 'object') {
      if (Array.isArray(x)) return x.length ? keyOf(x[0]) : ''
      if (typeof x.item === 'string') return x.item
      if (typeof x.fluid === 'string') return x.fluid
      if (typeof x.tag === 'string') return '#' + x.tag
      if (x.ingredient !== undefined) return keyOf(x.ingredient)
      if (x.value !== undefined) return keyOf(x.value)
    }
    return typeof x === 'string' ? x : JSON.stringify(x)
  }

  // the count of a pinned input (pin: [{re, count}]), else undefined
  function pinOf(pin, key) {
    if (!pin) return undefined
    for (var i = 0; i < pin.length; i++) if (pin[i].re.test(key)) return pin[i].count
    return undefined
  }

  function scaleItem(e, f, pin) {
    var c = e && e.content
    if (!c || typeof c !== 'object' || !isConsumed(e)) return e
    var n
    var plain = false
    if (c.type === SIZED && typeof c.count === 'number') n = c.count
    else if (c.type === undefined && typeof c.item === 'string' && c.count === undefined && Object.keys(c).length === 1) {
      n = 1
      plain = true
    } else return e
    var p = pinOf(pin, keyOf(c))
    var m = p !== undefined ? p : scaledCount(n, f, keyOf(c))
    if (m === n) return e
    var out = copy(e)
    if (plain) out.content = { type: SIZED, count: m, ingredient: { item: c.item } }
    else {
      out.content = copy(c)
      out.content.count = m
    }
    return out
  }

  function scaleFluid(e, f) {
    var c = e && e.content
    if (!c || typeof c !== 'object' || typeof c.amount !== 'number' || !isConsumed(e)) return e
    var m = scaledCount(c.amount, f, keyOf(c))
    if (m === c.amount) return e
    var out = copy(e)
    out.content = copy(c)
    out.content.amount = m
    return out
  }

  /** The recipe with its consumed inputs scaled (`pin`: optional [{re, count}] of item inputs held at a count; `ordered`: the type matches
   *  its item inputs in order, one bus each, so an input over a stack is split, see splitStacks): {json, changed, items, fluids, split}.
   *  Pure: `json` is never modified. */
  function scaleRecipe(json, itemFactor, fluidFactor, pin, ordered) {
    var inputs = copy(json.inputs)
    var items = 0
    var fluids = 0
    var split = 0
    if (Array.isArray(inputs.item)) {
      inputs.item = inputs.item.map(function (e) {
        var s = scaleItem(e, itemFactor, pin)
        if (s !== e) items++
        return s
      })
      if (ordered) {
        var sp = splitStacks(inputs.item)
        inputs.item = sp.list
        split = sp.split
      }
    }
    if (Array.isArray(inputs.fluid)) {
      inputs.fluid = inputs.fluid.map(function (e) {
        var s = scaleFluid(e, fluidFactor)
        if (s !== e) fluids++
        return s
      })
    }
    var out = copy(json)
    out.inputs = inputs
    return { json: out, changed: items + fluids + split > 0, items: items, fluids: fluids, split: split }
  }

  // GTM's assembly line matches its item inputs in order, one input bus each, and an ME input bus slot holds one stack, so a sized input
  // over 64 could never be fed by ME (T2 mass_production, 2026-11-03: the LuV motor's 128 fine ruridit wire). It becomes several entries
  // of 64 and a remainder, as GTCEu's own recipes write it; the total, and so the cost, is unchanged.
  var ORDERED_TYPES = { 'gtceu:assembly_line': true }
  var STACK = 64
  function splitStacks(list) {
    var out = []
    var n = 0
    for (var i = 0; i < list.length; i++) {
      var e = list[i]
      var c = e && e.content
      if (!c || typeof c !== 'object' || c.type !== SIZED || typeof c.count !== 'number' || c.count <= STACK) {
        out.push(e)
        continue
      }
      for (var left = c.count; left > 0; left -= STACK) {
        var part = copy(e)
        part.content = copy(c)
        part.content.count = left > STACK ? STACK : left
        out.push(part)
      }
      n++
    }
    return { list: out, split: n }
  }

  function isStrings(a) {
    if (!Array.isArray(a)) return false
    for (var i = 0; i < a.length; i++) if (typeof a[i] !== 'string') return false
    return true
  }

  /** Problems of a table (empty = valid); `file` is the era the file name promises. */
  function validateTable(t, file) {
    var p = []
    if (!t || typeof t !== 'object') return ['not an object']
    if (ERAS.indexOf(t.era) < 0) p.push('era ' + t.era + ' is not one of ' + ERAS.join(','))
    else if (file && t.era !== file) p.push('era ' + t.era + ' in the file of ' + file)
    if (typeof t.enabled !== 'boolean') p.push('enabled must be true or false')
    if (typeof t.item !== 'number' || !(t.item >= 1) || t.item > 1e6) p.push('item must be a number from 1 to 1e6')
    if (typeof t.fluid !== 'number' || !(t.fluid >= 1) || t.fluid > 1e6) p.push('fluid must be a number from 1 to 1e6')
    var lists = ['keys', 'include', 'exclude', 'remove']
    for (var i = 0; i < lists.length; i++) if (!isStrings(t[lists[i]])) p.push(lists[i] + ' must be a list of strings')
    if (!t.override || typeof t.override !== 'object' || Array.isArray(t.override)) p.push('override must be an object {glob: era|none}')
    else {
      Object.keys(t.override).forEach(function (g) {
        var v = t.override[g]
        if (v !== 'none' && ERAS.indexOf(v) < 0) p.push('override ' + g + ': ' + v + ' is not an era or none')
      })
    }
    if (t.keyFactor !== undefined) {
      if (!isMap(t.keyFactor)) p.push('keyFactor must be an object {glob: factor}')
      else {
        Object.keys(t.keyFactor).forEach(function (g) {
          var k = t.keyFactor[g]
          if (typeof k !== 'number' || !(k >= 1) || k > 1e6) p.push('keyFactor ' + g + ' must be a number from 1 to 1e6')
        })
      }
    }
    if (t.pin !== undefined) {
      if (!isMap(t.pin)) p.push('pin must be an object {glob: {inputGlob: count}}')
      else {
        Object.keys(t.pin).forEach(function (g) {
          var m = t.pin[g]
          if (!isMap(m)) p.push('pin ' + g + ' must be an object {inputGlob: count}')
          else {
            Object.keys(m).forEach(function (ig) {
              var n = m[ig]
              if (typeof n !== 'number' || !(n >= 1) || n % 1 !== 0 || n > 64) p.push('pin ' + g + ' ' + ig + ' must be a whole count from 1 to 64')
            })
          }
        })
      }
    }
    return p
  }

  function isMap(o) {
    return !!o && typeof o === 'object' && !Array.isArray(o)
  }

  // the first entry of `list` [{re, v}] whose glob matches `out`, an exact id before any glob; null when none
  function firstOf(list, out) {
    if (out === null) return null
    var hit = null
    for (var i = 0; i < list.length; i++) {
      if (list[i].exact === out) return list[i].v
      if (hit === null && list[i].re.test(out)) hit = list[i].v
    }
    return hit
  }

  function compiled(map, value) {
    return Object.keys(map || {}).map(function (g) { return { exact: g.indexOf('*') < 0 ? g : null, re: globToRe(g), v: value(map[g]) } })
  }

  /** The one selection rule over validated tables (one per era at most): select(id, json) and apply(id, json). */
  function makeSelector(tables) {
    var byEra = {}
    var exactKey = {}
    var keyGlobs = []
    var includeRes = []
    var excludeRes = []
    var overrides = []
    var removeIds = []
    var perEra = {}
    ERAS.forEach(function (era) {
      var t = null
      tables.forEach(function (x) {
        if (x.era === era) t = x
      })
      if (!t) return
      byEra[era] = t
      perEra[era] = {
        keyFactor: compiled(t.keyFactor, function (k) { return k }),
        pin: compiled(t.pin, function (m) {
          return Object.keys(m).map(function (ig) { return { re: globToRe(ig), count: m[ig] } })
        })
      }
      t.keys.forEach(function (k) {
        if (k.indexOf('*') >= 0) keyGlobs.push({ re: globToRe(k), era: era })
        else if (!has(exactKey, k)) exactKey[k] = era
      })
      t.include.forEach(function (g) { includeRes.push(globToRe(g)) })
      t.exclude.forEach(function (g) { excludeRes.push(globToRe(g)) })
      Object.keys(t.override).forEach(function (g) { overrides.push({ re: globToRe(g), era: t.override[g] }) })
      if (t.enabled) t.remove.forEach(function (id) { removeIds.push(id) })
    })

    function select(id, json, type) {
      if (!isGtRecipe(json, type)) return null
      var out = primaryOutput(json)
      var era = null
      var via = null
      if (out !== null && has(exactKey, out)) era = exactKey[out]
      else if (out !== null) {
        for (var i = 0; i < keyGlobs.length; i++) {
          if (keyGlobs[i].re.test(out)) {
            era = keyGlobs[i].era
            break
          }
        }
      }
      if (era !== null) via = 'key'
      else if (anyMatch(includeRes, id)) {
        var tier = tierOfEut(eutOf(json))
        era = tier !== null && ERAS.indexOf(tier) >= 0 ? tier : null
        via = 'include'
      }
      if (era === null || anyMatch(excludeRes, id)) return null
      for (var j = 0; j < overrides.length; j++) {
        if (overrides[j].re.test(id)) {
          era = overrides[j].era
          break
        }
      }
      var t = has(byEra, era) ? byEra[era] : null
      if (t === null) return null
      var k = firstOf(perEra[era].keyFactor, out)
      if (k === null) k = 1
      var pin = firstOf(perEra[era].pin, out)
      return {
        era: era, via: via, enabled: t.enabled === true, item: t.item * k, fluid: t.fluid * k, keyFactor: k,
        pin: pin && pin.length ? pin : null
      }
    }

    function apply(id, json, type) {
      var sel = select(id, json, type)
      if (sel === null || !sel.enabled) return null
      var r = scaleRecipe(json, sel.item, sel.fluid, sel.pin, ORDERED_TYPES[String(type || json.type)] === true)
      r.era = sel.era
      r.via = sel.via
      return r
    }

    return { select: select, apply: apply, removeIds: removeIds, eras: Object.keys(byEra) }
  }

  // ---------------------------------------------------------------- the event
  function readTable(era) {
    var path = DIR + era + '.json'
    try {
      return typeof G.readJsonTable === 'function' ? G.readJsonTable(path) : JSON.parse(String(JsonIO.toPrettyString(JsonIO.readJson(path))))
    } catch (e) {
      console.error(LOG + 'cannot read ' + path + ': ' + e)
      S.errors++
      return null
    }
  }

  function fail(what, e) {
    S.errors++
    if (!S.firstError) S.firstError = what + ': ' + e
  }

  // the amounts a recipe consumes, in order, to compare what we wrote with what the component round trip returns
  function signature(json) {
    var s = []
    var inputs = json.inputs || {}
    var items = inputs.item || []
    var fluids = inputs.fluid || []
    items.forEach(function (e) {
      var c = e.content || {}
      s.push('i' + (typeof c.count === 'number' ? c.count : 1))
    })
    fluids.forEach(function (e) {
      var c = e.content || {}
      s.push('f' + c.amount)
    })
    return s.join(',')
  }

  // RecipeJS.toString() is "<id>[<type>]" (the dump takes ids the same way)
  function idOfAdded(r) {
    var m = /^(.*)\[([^\[\]]*)\]$/.exec(String(r))
    return m ? m[1] : String(r.getOrCreateId())
  }
  function typeOfAdded(r) {
    var m = /^(.*)\[([^\[\]]*)\]$/.exec(String(r))
    return m ? m[2] : ''
  }

  function scanOriginal(r, sel, drop) {
    if (r.removed) return
    var text = String(r.json)
    if (text.indexOf('"inputs"') < 0) return
    var id = String(r.getId())
    if (drop[id] === true) return
    var json = JSON.parse(text)
    S.scanned++
    var res = sel.apply(id, json)
    if (res === null) return
    S.selected.original++
    if (!res.changed) return
    r.json.add('inputs', JsonIO.parseRaw(JSON.stringify(res.json.inputs)))
    r.save()
    S.changed.original++
    S.items += res.items
    S.fluids += res.fluids
    S.split += res.split
  }

  function scanAdded(r, sel, drop) {
    if (r.removed) return
    var id = idOfAdded(r)
    if (drop[id] === true) return
    r.serialize()
    var text = String(r.json)
    if (text.indexOf('"inputs"') < 0) return
    var json = JSON.parse(text)
    S.scanned++
    var res = sel.apply(id, json, typeOfAdded(r))
    if (res === null) return
    S.selected.added++
    if (!res.changed) return
    r.set('inputs', JsonIO.parseRaw(JSON.stringify(res.json.inputs)))
    r.serialize()
    if (signature(JSON.parse(String(r.json))) !== signature(res.json)) {
      S.verifyFail++
      fail('added recipe ' + id + ' did not take the new inputs', signature(JSON.parse(String(r.json))) + ' != ' + signature(res.json))
      return
    }
    S.changed.added++
    S.items += res.items
    S.fluids += res.fluids
    S.split += res.split
  }

  function removeBypasses(event, ids) {
    if (ids.length === 0) return {}
    var want = {}
    ids.forEach(function (id) { want[id] = true })
    var filters = ids.map(function (id) { return { id: id } })
    S.removed.original = Number(event.findRecipeIds(filters).size())
    event.remove(filters)
    var it = event.addedRecipes.iterator()
    while (it.hasNext()) {
      var r = it.next()
      var id = null
      try {
        id = idOfAdded(r)
      } catch (e) {
        id = null
      }
      if (id !== null && want[id] === true) {
        it.remove()
        S.removed.added++
      }
    }
    return want
  }

  ServerEvents.recipes(function (event) {
    try {
    var started = Date.now()
    var tables = []
    ERAS.forEach(function (era) {
      var t = readTable(era)
      if (t === null) return
      var problems = validateTable(t, era)
      if (problems.length > 0) {
        console.error(LOG + era + '.json is invalid, skipped: ' + problems.join('; '))
        S.errors++
        return
      }
      tables.push(t)
      if (t.enabled) S.enabled.push(era)
    })
    S.tables = tables.length
    if (S.enabled.length === 0) {
      console.info(LOG + 'no table enabled (' + tables.length + ' read): no recipe changed')
      return
    }
    var sel = makeSelector(tables)
    var drop = removeBypasses(event, sel.removeIds)
    event.originalRecipes.values().forEach(function (r) {
      try {
        scanOriginal(r, sel, drop)
      } catch (e) {
        fail('original', e)
      }
    })
    event.addedRecipes.forEach(function (r) {
      try {
        scanAdded(r, sel, drop)
      } catch (e) {
        fail('added', e)
      }
    })
    S.ms = Date.now() - started
    console.info(LOG + 'enabled ' + S.enabled.join(',') + ': scanned ' + S.scanned + ' GT recipes, selected ' + S.selected.original + ' original + ' +
      S.selected.added + ' added, changed ' + S.changed.original + ' + ' + S.changed.added + ' (' + S.items + ' item and ' + S.fluids +
      ' fluid inputs, ' + S.split + ' ordered inputs split into stacks), removed ' + S.removed.original + ' + ' + S.removed.added + ', errors ' + S.errors + ', ' + S.ms + ' ms')
    if (S.firstError) console.error(LOG + 'first error: ' + S.firstError)
    } catch (e) {
      console.error(LOG + 'recipes handler failed: ' + e)
    }
  })

  G.costCurve = {
    eras: ERAS, scaledCount: scaledCount, tierOfEut: tierOfEut, validateTable: validateTable, makeSelector: makeSelector,
    scaleRecipe: scaleRecipe, isOrdered: function (type) { return ORDERED_TYPES[String(type)] === true }, stats: S
  }
})()
