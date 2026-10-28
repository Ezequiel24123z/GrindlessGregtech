// Recipes of the IV Smelting Complex (machine and recipe type: startup_scripts/grindless/iv/mega_smelting_complex.js; docs/eras/mega.md 4.7;
// package MEGA-5), generated at every server load from data/grindless/tables/mega_smelting_complex.json, and the recipe that makes the controller.
//
//   gtceu:smelting_complex   one recipe per live electric_blast_furnace recipe that outputs a hot ingot, id grindless:smelting_complex/<EBF recipe
//                            path> (GTM's builder puts the type in front), composed by server_scripts/grindless/lib/compose.js from this load's
//                            LIVE recipes: the EBF run (dusts, the gas of a gas variant -> hot ingot + byproducts) joined to the vacuum freezer
//                            recipe that cools that hot ingot (the hot ingot is the linked key, the batch is one EBF run; the coolant goes in and
//                            comes back as the freezer's return gas). The hot ingot never leaves; every other input and output of both stages
//                            stays and the energy is the SUM of both (family rule 7), spent at the table's maxEUt (IV, 8192 EU/t).
//                            Carried from the stages (compose leaves them out): the EBF's programmed circuit and ebf_temp (the coil gate of GTM's
//                            EBF rule, so the gas and no-gas variants never clash in the lookup) and the freezer's non-consumed casting mold.
//   The set is capped at EBF recipes whose freezer stage exists live: the count and every skipped hot ingot are printed at every load.
//   Lookup safety: a recipe whose ingredients (and circuit) are a subset of another's can hide it in GTM's lookup; a clash is logged as an error.
//   crafting                 the controller, made in the IV assembler: 4 electric blast furnaces + 4 vacuum freezers + 4 IV circuits.
//
// Published for the tests: global.grindless.megaSmeltingComplex.recipes [{ id, recipeId, name, hot, ebf, freezer, itemsIn: [{ id, count, chance }],
// kept: [{ id, count }], circuit, temp, fluidsIn, itemsOut: [{ id, whole, chance }], fluidsOut, eut, duration, energy, sourceEnergy, sources }],
// .skipped [{ name, reason }], .clashes, .candidates, .stagesRead, .crafting, .craftingInputs.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/iv] '
  var G = global.grindless || (global.grindless = {})
  var SC = G.megaSmeltingComplex || (G.megaSmeltingComplex = {})

  var TABLE = 'kubejs/data/grindless/tables/mega_smelting_complex.json'
  var MAX_CHANCE = 10000
  var TYPE_PATH = 'smelting_complex'

  var CONTROLLER = 'gtceu:smelting_complex'
  var MACHINES = ['gtceu:electric_blast_furnace', 'gtceu:vacuum_freezer']
  var INPUTS = ['4x gtceu:electric_blast_furnace', '4x gtceu:vacuum_freezer', '4x #gtceu:circuits/iv']
  SC.crafting = 'grindless:smelting_complex'
  SC.craftingInputs = INPUTS.slice()

  function io() {
    return SC.maxIO || { itemsIn: 3, itemsOut: 6, fluidsIn: 2, fluidsOut: 2 }
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var maxEut = Number(t.maxEUt)
    if (!(maxEut > 0)) problems.push('maxEUt ' + t.maxEUt)
    if (typeof t.ebfPrefix !== 'string') problems.push('ebfPrefix')
    if (typeof t.freezerPrefix !== 'string') problems.push('freezerPrefix')
    var hot = null
    try {
      hot = new RegExp(String(t.hotIngot))
    } catch (e) {
      problems.push('hotIngot ' + t.hotIngot)
    }
    if (problems.length > 0) console.error(LOG + 'smelting complex: ' + TABLE + ': ' + problems.join('; '))
    return {
      maxEut: maxEut > 0 ? maxEut : 8192,
      ebfPrefix: String(t.ebfPrefix || 'gtceu:electric_blast_furnace/'),
      freezerPrefix: String(t.freezerPrefix || 'gtceu:vacuum_freezer/'),
      hot: hot
    }
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.itemsOut, rec.kept).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    rec.fluidsIn.concat(rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    var limits = io()
    var entries = 0
    rec.itemsOut.forEach(function (o) {
      if (o.whole > 0) entries++
      if (o.chance > 0) entries++
    })
    var inputs = rec.itemsIn.length + rec.kept.length + (rec.circuit > 0 ? 1 : 0)
    if (inputs > limits.itemsIn) return inputs + ' item inputs (the type holds ' + limits.itemsIn + ')'
    if (entries > limits.itemsOut) return entries + ' item outputs (the type holds ' + limits.itemsOut + ')'
    if (rec.fluidsIn.length > limits.fluidsIn) return rec.fluidsIn.length + ' fluid inputs (the type holds ' + limits.fluidsIn + ')'
    if (rec.fluidsOut.length > limits.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + limits.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu.smelting_complex(rec.recipeId)
    rec.itemsIn.forEach(function (x) {
      if (x.chance >= MAX_CHANCE) recipe.itemInputs(x.count + 'x ' + x.id)
      else recipe.chancedInput(x.count + 'x ' + x.id, x.chance, 0)
    })
    rec.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
    if (rec.circuit > 0) recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (o) {
      if (o.whole > 0) recipe.itemOutputs(o.whole + 'x ' + o.id)
      if (o.chance > 0) recipe.chancedOutput('1x ' + o.id, o.chance, 0)
    })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.temp > 0) recipe.blastFurnaceTemp(rec.temp)
    recipe.EUt(rec.eut).duration(rec.duration)
  }

  function keysOf(rec) {
    var keys = {}
    rec.itemsIn.concat(rec.kept).forEach(function (x) { keys['i:' + x.id] = true })
    rec.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
    keys['circuit:' + rec.circuit] = true
    return keys
  }

  // pairs where one recipe's keys are a subset of the other's (equal sets included): GTM's lookup would hide one of them
  function clashesOf(recs) {
    var out = []
    var keys = recs.map(keysOf)
    function subset(a, b) {
      return Object.keys(a).every(function (k) { return b[k] === true })
    }
    for (var i = 0; i < recs.length; i++) {
      for (var j = i + 1; j < recs.length; j++) {
        if (subset(keys[i], keys[j]) || subset(keys[j], keys[i])) out.push(recs[i].name + ' / ' + recs[j].name)
      }
    }
    return out
  }

  function contentOf(entry) {
    return entry && entry.content ? entry.content : null
  }

  // the programmed circuit of a GT recipe's item inputs (0 = none)
  function circuitOf(j) {
    var items = j.inputs && j.inputs.item ? j.inputs.item : []
    for (var i = 0; i < items.length; i++) {
      var c = contentOf(items[i])
      if (c && (c.type === 'gtceu:circuit' || (c.ingredient && c.ingredient.type === 'gtceu:circuit'))) {
        var n = Number(c.configuration !== undefined ? c.configuration : (c.ingredient ? c.ingredient.configuration : 0))
        return n > 0 ? n : 0
      }
    }
    return 0
  }

  // the item inputs a recipe keeps (chance 0: the casting mold of the freezer), [{ id, count }]
  function keptOf(j) {
    var out = []
    var items = j.inputs && j.inputs.item ? j.inputs.item : []
    for (var i = 0; i < items.length; i++) {
      var c = contentOf(items[i])
      if (!c || Number(items[i].chance) !== 0) continue
      if (c.type === 'gtceu:circuit' || (c.ingredient && c.ingredient.type === 'gtceu:circuit')) continue
      var it = G.compose.itemOf(c)
      if (it !== null) out.push(it)
    }
    return out
  }

  // does a recipe output a hot ingot (read from its JSON, for a recipe compose could not parse)
  function makesHot(j, pattern) {
    var items = j.outputs && j.outputs.item ? j.outputs.item : []
    return items.some(function (e) {
      var c = contentOf(e)
      var src = c && c.ingredient ? c.ingredient : c
      if (Array.isArray(src)) src = src.length > 0 ? src[0] : null
      return !!(src && src.item && pattern.test(String(src.item)))
    })
  }

  // every item tag a recipe's item contents name
  function tagsOf(j) {
    var out = []
    ;['inputs', 'outputs'].forEach(function (side) {
      var items = j[side] && j[side].item ? j[side].item : []
      items.forEach(function (e) {
        var c = contentOf(e)
        var src = c && c.ingredient ? c.ingredient : c
        if (Array.isArray(src)) src = src.length > 0 ? src[0] : null
        if (src && src.tag && out.indexOf(String(src.tag)) < 0) out.push(String(src.tag))
      })
    })
    return out
  }

  // the first live item (by id) of an item tag, null when the tag is empty or unknown
  function itemOfLiveTag(tag) {
    try {
      if (typeof Ingredient === 'undefined') return null
      var list = Ingredient.of('#' + tag).getItemIds().toArray().map(String).sort()
      return list.length > 0 ? list[0] : null
    } catch (e) {
      return null
    }
  }

  // the first item key a stage takes (negative net), sorted; '' when it takes none
  function firstInput(step) {
    var keys = Object.keys(step.v).filter(function (k) { return k.indexOf('i:') === 0 && step.v[k] < 0 }).sort()
    return keys.length > 0 ? keys[0] : ''
  }

  function generate(event) {
    SC.recipes = []
    SC.skipped = []
    SC.clashes = []
    SC.candidates = 0
    var table = loadTable()
    SC.maxEut = table.maxEut
    var C = G.compose

    function skip(name, reason) {
      SC.skipped.push({ name: name, reason: reason })
      console.warn(LOG + 'smelting complex skipped ' + name + ': ' + reason)
    }

    // 1. the live EBF and vacuum freezer recipes (their JSON, for the circuit, the temperature and the mold)
    var raw = {}
    var ids = []
    event.originalRecipes.values().forEach(function (r) {
      var id = C.recipeId(r)
      if (id.indexOf(table.ebfPrefix) !== 0 && id.indexOf(table.freezerPrefix) !== 0) return
      try {
        if (r.json === null || r.json === undefined) return
        raw[id] = JSON.parse(String(r.json))
        ids.push(id)
      } catch (e) {
        skip(id, 'unreadable recipe: ' + e)
      }
    })
    var read = C.gather(event, ids, {})
    var steps = read.steps

    // a stage whose item tag has no GTM form (a GTCA material's dust) is read again with the live item of each of its tags
    var retry = ids.filter(function (id) { return steps[id] && steps[id].error && String(steps[id].error).indexOf('unreadable item') === 0 })
    if (retry.length > 0) {
      var tagItems = {}
      retry.forEach(function (id) {
        tagsOf(raw[id]).forEach(function (t) {
          if (tagItems[t] !== undefined) return
          var x = itemOfLiveTag(t)
          if (x !== null) tagItems[t] = x
        })
      })
      var again = C.gather(event, retry, { tagItems: tagItems })
      retry.forEach(function (id) {
        if (again.steps[id] && !again.steps[id].error) {
          steps[id] = again.steps[id]
          read.read++
        }
      })
    }
    SC.stagesRead = read.read

    // 2. every EBF recipe that outputs a hot ingot; the freezer recipes that take each hot ingot
    var freezers = {}
    var ebfs = []
    ids.sort().forEach(function (id) {
      var s = steps[id]
      if (s && s.error && id.indexOf(table.ebfPrefix) === 0 && table.hot !== null && makesHot(raw[id], table.hot)) {
        SC.candidates++
        skip(id.substring(table.ebfPrefix.length), s.error)
      }
      if (!s || s.error) return
      Object.keys(s.v).forEach(function (k) {
        if (k.indexOf('i:') !== 0 || table.hot === null || !table.hot.test(k.substring(2))) return
        if (id.indexOf(table.freezerPrefix) === 0 && s.v[k] < 0) {
          freezers[k] = freezers[k] || []
          freezers[k].push(id)
        } else if (id.indexOf(table.ebfPrefix) === 0 && s.v[k] > 0) {
          ebfs.push({ id: id, hot: k })
        }
      })
    })
    SC.candidates = SC.candidates + ebfs.length

    // 3. compose every EBF run with its freezer
    var made = []
    ebfs.forEach(function (e) {
      var name = e.id.substring(table.ebfPrefix.length)
      var list = freezers[e.hot]
      if (!list || list.length === 0) {
        skip(name, 'no live vacuum freezer recipe for ' + e.hot.substring(2))
        return
      }
      if (list.length > 1) console.warn(LOG + 'smelting complex ' + name + ': ' + list.length + ' freezer recipes take ' + e.hot.substring(2) + ', using ' + list[0])
      var ebf = steps[e.id]
      var vf = steps[list[0]]
      var start = firstInput(ebf)
      if (start === '') {
        skip(name, 'the blast furnace recipe takes no item')
        return
      }
      var given = {}
      given[start] = -ebf.v[start]
      var composed
      try {
        composed = C.compose({ stages: [e.id, list[0]], given: given, linked: [e.hot] }, steps)
      } catch (err) {
        composed = { error: String(err) }
      }
      if (composed.error) {
        skip(name, composed.error)
        return
      }
      var cooled = Object.keys(vf.v).filter(function (k) { return k.indexOf('i:') === 0 && k !== e.hot && vf.v[k] > 0 }).sort()
      var rec = C.contents(composed, { maxEut: table.maxEut, itemOrder: cooled.length > 0 ? [cooled[0].substring(2)] : [] })
      var j = raw[e.id]
      rec.name = name
      rec.hot = e.hot.substring(2)
      rec.ebf = e.id
      rec.freezer = list[0]
      rec.circuit = circuitOf(j)
      rec.temp = j.data && Number(j.data.ebf_temp) > 0 ? Number(j.data.ebf_temp) : 0
      rec.kept = keptOf(raw[list[0]])
      made.push(rec)
    })

    made.forEach(function (rec) {
      rec.id = 'grindless:' + rec.name
      rec.recipeId = 'grindless:' + TYPE_PATH + '/' + rec.name
      var missing = missingIds(rec)
      if (missing.length > 0) {
        skip(rec.hot, 'unknown id(s): ' + missing.join(', '))
        return
      }
      var tooBig = sizeProblem(rec)
      if (tooBig !== null) {
        skip(rec.hot, tooBig)
        return
      }
      try {
        add(event, rec)
      } catch (e) {
        skip(rec.hot, 'the builder failed: ' + e)
        return
      }
      SC.recipes.push(rec)
    })

    SC.clashes = clashesOf(SC.recipes)
    if (SC.clashes.length > 0) {
      console.error(LOG + 'smelting complex: recipes whose ingredients are a subset of another\'s (GTM\'s lookup would hide one): ' + SC.clashes.join('; '))
    }
    console.info(LOG + 'smelting complex: ' + SC.recipes.length + ' EBF + freezer lines composed (of ' + SC.candidates + ' blast furnace recipes that make a hot ingot) from ' +
      SC.stagesRead + ' of ' + ids.length + ' live stages; skipped ' + SC.skipped.length + (SC.skipped.length > 0
        ? ': ' + SC.skipped.map(function (s) { return s.name + ' (' + s.reason + ')' }).join('; ') : ''))
  }

  function addController(event) {
    var missing = MACHINES.concat([CONTROLLER]).filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'smelting complex controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler(SC.crafting)
      .itemInputs(INPUTS[0], INPUTS[1], INPUTS[2])
      .itemOutputs(CONTROLLER)
      .EUt(1920)
      .duration(400)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'smelting complex recipe generation failed: ' + e)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'smelting complex controller recipe failed: ' + e2)
    }
  })
})()
