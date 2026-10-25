// priority: 1000
// -----------------------------------------------------------------------------------------------
// Grindless recipe composer: turns a line of LIVE recipes (several machines, loops between them) into the contents of ONE recipe with the
// same ratios and the SAME energy. It is the EV platinum plant's composer (server_scripts/grindless/ev/platinum_plant.js), taken out into
// a library so other plants can use it. The platinum plant still carries its own copy, unchanged; the IV hot cell
// (server_scripts/grindless/iv/hot_cell.js) is the first user of this one.
//
// What it does, for a plan { stages: [recipe ids], given: { key: amount }, linked: [keys] }:
//   1. gather(event, ids, opts) reads the stage recipes from ServerEvents.recipes' ORIGINAL recipes (their JSON), so the numbers are the
//      ones of the loaded pack, never typed by hand. A GT recipe gives its EU/t (tickInputs.eu), duration and item and fluid contents
//      (the programmed circuit is left out; a chanced input or output counts as chance / maxChance of one run). A vanilla smelting recipe
//      (minecraft:smelting) is read as GTM's electric furnace runs it (GTRecipeType#toGTrecipe: the cooking time as duration, at the
//      furnace's EU/t, which the caller reads from GTM and passes as opts.furnaceEUt).
//      Keys: 'i:<item id>' and 'f:<fluid id>'. A tag is turned into GTM's item or fluid (forge:dusts/<m> -> gtceu:<m>_dust,
//      forge:ingots/<m> -> gtceu:<m>_ingot, forge:gems/<m> -> gtceu:<m>_gem, forge:purified_ores/<m> -> gtceu:purified_<m>_ore,
//      a fluid tag forge:<m> -> gtceu:<m> or minecraft:<m>).
//   2. compose(plan, steps) solves the linear system of the stages (Gauss with partial pivoting): every `given` key is used up to its
//      amount (the batch) and every `linked` key (an intermediate, or a catalyst the line gives back) nets to zero. Given + linked must
//      be as many as the stages. Everything else the stages touch is a free input (net < 0) or output (net > 0). The energy is the SUM
//      of every stage's EU/t x duration, scaled by how often it runs: no discount.
//   3. contents(composed, opts) turns the balance into recipe contents: a whole number of items, a fraction as a chance (of the output,
//      or of using up the input), fluids in whole millibuckets (inputs rounded up, outputs to the nearest), and the energy as
//      ceil(energy / maxEut) ticks at ceil(energy / ticks) EU/t (costOf): a recipe of the machine's tier that never costs less than the
//      stages, by a tick of power at most.
//
// Use (inside ServerEvents.recipes; every function only reads):
//   var C = global.grindless.compose
//   var read = C.gather(event, ['gtceu:chemical_reactor/x', ...], { furnaceEUt: 4 })     // { steps: { id: stage }, read: n }
//   var composed = C.compose(plan, read.steps)                                            // { net, order, energy, sources } or { error }
//   var made = C.contents(composed, { maxEut: 7680 })                                     // { itemsIn, fluidsIn, itemsOut, fluidsOut, ... }
//
// Rhino: var + function inside every function (this Rhino throws "redeclaration of var" for const/let in code that runs more than once).
(function () {
  var G = global.grindless || (global.grindless = {})
  var EPS = 1e-6
  var MAX_CHANCE = 10000

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

  // an item tag of GTM -> its item
  function itemOfTag(tag) {
    var forms = [
      [/^[^:]*:dusts\/(.+)$/, function (m) { return 'gtceu:' + m + '_dust' }],
      [/^[^:]*:ingots\/(.+)$/, function (m) { return 'gtceu:' + m + '_ingot' }],
      [/^[^:]*:gems\/(.+)$/, function (m) { return 'gtceu:' + m + '_gem' }],
      [/^[^:]*:purified_ores\/(.+)$/, function (m) { return 'gtceu:purified_' + m + '_ore' }]
    ]
    for (var i = 0; i < forms.length; i++) {
      var m = forms[i][0].exec(tag)
      if (m) {
        var id = forms[i][1](m[1])
        return Item.exists(id) ? id : null
      }
    }
    return null
  }

  // { item } | { tag } | { type: 'gtceu:sized', count, ingredient: { item | tag } } | [ alternatives ] -> { id, count } or null
  function itemOf(content) {
    if (!content) return null
    if (Array.isArray(content)) return content.length > 0 ? itemOf(content[0]) : null
    var count = Number(content.count || 1)
    var source = content.ingredient ? content.ingredient : content
    if (Array.isArray(source)) source = source.length > 0 ? source[0] : null
    if (!source) return null
    if (source.item) return { id: String(source.item), count: count }
    if (source.tag) {
      var id = itemOfTag(String(source.tag))
      return id === null ? null : { id: id, count: count }
    }
    return null
  }

  function isCircuit(content) {
    if (!content) return false
    if (content.ingredient && content.ingredient.type === 'gtceu:circuit') return true
    return content.type === 'gtceu:circuit'
  }

  // total EU/t of a GT recipe: a plain number is voltage x 1 A, { voltage, amperage } is both
  function energyOf(j) {
    var eu = j.tickInputs && j.tickInputs.eu && j.tickInputs.eu[0] ? j.tickInputs.eu[0].content : null
    if (typeof eu === 'number') return eu
    if (eu && eu.voltage !== undefined) return Number(eu.voltage) * Number(eu.amperage || 1)
    return null
  }

  // the share of the content that is used / made in a run: chance / maxChance (a chance of 0 is a catalyst that is not used up)
  function shareOf(entry) {
    var max = entry.maxChance !== undefined ? Number(entry.maxChance) : MAX_CHANCE
    var chance = entry.chance !== undefined ? Number(entry.chance) : max
    return chance / max
  }

  // a vanilla smelting recipe as GTM's electric furnace runs it: { ingredient, result, cookingtime } at opts.furnaceEUt
  function parseSmelting(id, j, opts) {
    var eut = opts && Number(opts.furnaceEUt) > 0 ? Number(opts.furnaceEUt) : null
    if (eut === null) return { id: id, error: 'a smelting stage needs the electric furnace EU/t (opts.furnaceEUt)' }
    var input = itemOf(j.ingredient)
    if (input === null) return { id: id, error: 'unreadable smelting ingredient' }
    var result = j.result
    var out = null
    if (typeof result === 'string') out = { id: result, count: 1 }
    else if (result && result.item) out = { id: String(result.item), count: Number(result.count || 1) }
    if (out === null) return { id: id, error: 'unreadable smelting result' }
    var duration = j.cookingtime !== undefined ? Number(j.cookingtime) : 200
    if (!(duration > 0)) return { id: id, error: 'no cooking time' }
    var v = {}
    v['i:' + input.id] = -1
    v['i:' + out.id] = (v['i:' + out.id] || 0) + out.count
    return { id: id, eut: eut, duration: duration, v: v }
  }

  // one stage recipe -> { id, eut, duration, v: { 'i:<item>' | 'f:<fluid>': net amount of one run } } or { id, error }. The programmed
  // circuit is left out.
  function parseStage(id, j, opts) {
    if (j && j.type === 'minecraft:smelting') return parseSmelting(id, j, opts)
    if (!j.inputs && !j.outputs) return { id: id, error: 'an empty recipe (a line that was emptied)' }
    var eut = energyOf(j)
    if (eut === null) return { id: id, error: 'unreadable energy' }
    var duration = Number(j.duration)
    if (!(duration > 0)) return { id: id, error: 'no duration' }
    var v = {}
    function add(key, x) {
      v[key] = (v[key] || 0) + x
    }
    var i
    var inputs = j.inputs && j.inputs.item ? j.inputs.item : []
    for (i = 0; i < inputs.length; i++) {
      if (isCircuit(inputs[i].content)) continue
      var it = itemOf(inputs[i].content)
      if (it === null) return { id: id, error: 'unreadable item input ' + i }
      add('i:' + it.id, -it.count * shareOf(inputs[i]))
    }
    var fluidsIn = j.inputs && j.inputs.fluid ? j.inputs.fluid : []
    for (i = 0; i < fluidsIn.length; i++) {
      var fi = fluidOf(fluidsIn[i].content)
      if (fi === null) return { id: id, error: 'unreadable fluid input ' + i }
      add('f:' + fi.id, -fi.amount * shareOf(fluidsIn[i]))
    }
    var outputs = j.outputs && j.outputs.item ? j.outputs.item : []
    for (i = 0; i < outputs.length; i++) {
      var io = itemOf(outputs[i].content)
      if (io === null) return { id: id, error: 'unreadable item output ' + i }
      add('i:' + io.id, io.count * shareOf(outputs[i]))
    }
    var fluidsOut = j.outputs && j.outputs.fluid ? j.outputs.fluid : []
    for (i = 0; i < fluidsOut.length; i++) {
      var fo = fluidOf(fluidsOut[i].content)
      if (fo === null) return { id: id, error: 'unreadable fluid output ' + i }
      add('f:' + fo.id, fo.amount * shareOf(fluidsOut[i]))
    }
    if (Object.keys(v).length === 0) return { id: id, error: 'an empty recipe (a line that was emptied)' }
    return { id: id, eut: eut, duration: duration, v: v }
  }

  // every wanted stage, by recipe id, from the event's original recipes: { steps: { id: stage or { id, error } }, read: parsed ones }
  function gather(event, ids, opts) {
    var steps = {}
    var wanted = {}
    ids.forEach(function (id) { wanted[String(id)] = true })
    var read = 0
    event.originalRecipes.values().forEach(function (r) {
      var id = recipeId(r)
      if (wanted[id] !== true) return
      try {
        if (r.json === null || r.json === undefined) return
        var s = parseStage(id, JSON.parse(String(r.json)), opts)
        steps[id] = s
        if (!s.error) read++
      } catch (e) {
        steps[id] = { id: id, error: 'unreadable recipe: ' + e }
      }
    })
    return { steps: steps, read: read }
  }

  // Gauss with partial pivoting on a square system (the rows are scaled first); null when it is singular
  function solve(A, b) {
    var n = A.length
    var M = []
    var i
    var j
    for (i = 0; i < n; i++) {
      var biggest = 0
      for (j = 0; j < n; j++) biggest = Math.max(biggest, Math.abs(A[i][j]))
      if (biggest === 0) return null
      var row = []
      for (j = 0; j < n; j++) row.push(A[i][j] / biggest)
      row.push(b[i] / biggest)
      M.push(row)
    }
    for (var c = 0; c < n; c++) {
      var p = c
      for (var r = c + 1; r < n; r++) {
        if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
      }
      if (Math.abs(M[p][c]) < 1e-12) return null
      var swap = M[c]
      M[c] = M[p]
      M[p] = swap
      for (var q = 0; q < n; q++) {
        if (q === c) continue
        var f = M[q][c] / M[c][c]
        if (f === 0) continue
        for (var k = c; k <= n; k++) M[q][k] -= f * M[c][k]
      }
    }
    var x = []
    for (i = 0; i < n; i++) x.push(M[i][n] / M[i][i])
    return x
  }

  // how often every stage runs, and what the whole chain takes and gives: { net, order, energy, sources } or { error }
  function compose(plan, steps) {
    var stages = []
    for (var i = 0; i < plan.stages.length; i++) {
      var id = String(plan.stages[i])
      var s = steps[id]
      if (!s) return { error: 'no source recipe ' + id }
      if (s.error) return { error: id + ': ' + s.error }
      stages.push(s)
    }
    var keys = Object.keys(plan.given).concat(plan.linked)
    if (keys.length !== stages.length) return { error: keys.length + ' balance equations for ' + stages.length + ' stages' }
    var A = keys.map(function (key) { return stages.map(function (s) { return s.v[key] || 0 }) })
    var b = keys.map(function (key) { return -(plan.given[key] || 0) })
    var x = solve(A, b)
    if (x === null) return { error: 'the stages do not close (singular)' }

    var net = {}
    var gross = {}
    var order = []
    var energy = 0
    var sources = []
    for (var k = 0; k < stages.length; k++) {
      if (!(x[k] > -1e-9)) return { error: stages[k].id + ' would have to run ' + x[k] + ' times' }
      var scale = Math.max(0, x[k])
      sources.push({ id: stages[k].id, scale: scale, eut: stages[k].eut, duration: stages[k].duration })
      energy += scale * stages[k].eut * stages[k].duration
      Object.keys(stages[k].v).forEach(function (key) {
        if (net[key] === undefined) {
          net[key] = 0
          gross[key] = 0
          order.push(key)
        }
        net[key] += scale * stages[k].v[key]
        gross[key] += Math.abs(scale * stages[k].v[key])
      })
    }
    // the linked keys must net out and the given inputs must be used up entirely (to the rounding of the solver)
    for (var g = 0; g < plan.linked.length; g++) {
      var left = net[plan.linked[g]] || 0
      if (Math.abs(left) > 1e-7 * (gross[plan.linked[g]] || 0) + 1e-9) return { error: plan.linked[g] + ' does not net out (' + left + ')' }
    }
    var givenKeys = Object.keys(plan.given)
    for (var h = 0; h < givenKeys.length; h++) {
      var used = -(net[givenKeys[h]] || 0)
      if (Math.abs(used - plan.given[givenKeys[h]]) > 1e-7 * (gross[givenKeys[h]] || 0) + 1e-9) {
        return { error: givenKeys[h] + ' is used ' + used + ', not ' + plan.given[givenKeys[h]] }
      }
    }
    return { net: net, order: order, energy: energy, sources: sources }
  }

  function wholeAndChance(x) {
    var whole = Math.floor(x + 1e-9)
    var chance = Math.round((x - whole) * MAX_CHANCE)
    if (chance >= MAX_CHANCE) {
      whole++
      chance = 0
    }
    return { whole: whole, chance: Math.max(0, chance) }
  }

  // ceil(energy / maxEut) ticks, ceil(energy / ticks) EU/t: the energy never drops and the surplus is under one EU/t over the ticks
  function costOf(energy, maxEut) {
    var ticks = Math.max(1, Math.ceil(energy / maxEut - 1e-9))
    var eut = Math.max(1, Math.ceil(energy / ticks - 1e-9))
    ticks = Math.max(1, Math.ceil(energy / eut - 1e-9))
    return { eut: eut, ticks: ticks }
  }

  function rank(list, id) {
    var i = (list || []).indexOf(id)
    return i < 0 ? (list || []).length : i
  }

  // a composed balance -> recipe contents (opts.maxEut is required; opts.itemOrder / fluidOrder sort the outputs):
  // { itemsIn: [{ id, count, chance }] (chance 10000 = used up), fluidsIn: [{ id, amount }], itemsOut: [{ id, whole, chance }],
  //   fluidsOut: [{ id, amount }], eut, duration, energy (what the recipe costs), sourceEnergy (the sum of the stages), sources }
  function contents(composed, opts) {
    var o = opts || {}
    var rec = { itemsIn: [], fluidsIn: [], itemsOut: [], fluidsOut: [], sources: composed.sources }
    var outItems = []
    composed.order.forEach(function (key) {
      var x = composed.net[key]
      if (Math.abs(x) < EPS) return
      var isItem = key.indexOf('i:') === 0
      var id = key.substring(2)
      if (isItem && x < 0) {
        var need = -x
        if (Math.abs(need - Math.round(need)) < EPS) {
          rec.itemsIn.push({ id: id, count: Math.round(need), chance: MAX_CHANCE })
        } else {
          // a fraction of an item: the whole stack, used up in `chance` of 10 000 runs (the expected use is what the chain needs)
          var count = Math.max(1, Math.ceil(need))
          rec.itemsIn.push({ id: id, count: count, chance: Math.round(need / count * MAX_CHANCE) })
        }
      } else if (isItem) {
        var wc = wholeAndChance(x)
        outItems.push({ id: id, whole: wc.whole, chance: wc.chance })
      } else if (x < 0) {
        rec.fluidsIn.push({ id: id, amount: Math.ceil(-x - 1e-6) })
      } else if (Math.round(x) > 0) {
        rec.fluidsOut.push({ id: id, amount: Math.round(x) })
      }
    })
    outItems.sort(function (a, b) { return rank(o.itemOrder, a.id) - rank(o.itemOrder, b.id) })
    rec.itemsOut = outItems.filter(function (x) { return x.whole > 0 || x.chance > 0 })
    rec.fluidsOut.sort(function (a, b) { return rank(o.fluidOrder, a.id) - rank(o.fluidOrder, b.id) })
    // what is used up for certain first, the chanced inputs after it
    rec.itemsIn.sort(function (a, b) { return (b.chance >= MAX_CHANCE ? 1 : 0) - (a.chance >= MAX_CHANCE ? 1 : 0) })
    var cost = costOf(composed.energy, Number(o.maxEut))
    rec.eut = cost.eut
    rec.duration = cost.ticks
    rec.energy = cost.eut * cost.ticks
    rec.sourceEnergy = Math.round(composed.energy * 1e6) / 1e6
    return rec
  }

  G.compose = {
    MAX_CHANCE: MAX_CHANCE,
    recipeId: recipeId,
    fluidOf: fluidOf,
    itemOf: itemOf,
    itemOfTag: itemOfTag,
    parseStage: parseStage,
    gather: gather,
    solve: solve,
    compose: compose,
    wholeAndChance: wholeAndChance,
    costOf: costOf,
    contents: contents
  }
})()
