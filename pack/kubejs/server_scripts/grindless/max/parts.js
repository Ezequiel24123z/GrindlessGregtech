// priority: -20001
// Gregtech Grindless - the recipes of GTM's parts at MAX (package MAX-A4, docs/eras/max.md 'Hatches' and A4), generated at every server
// load from data/grindless/tables/max_parts.json, plus the bender step of line L39:
//
//   assembly line   grindless:max_<part> -> gtceu:max_<part>, at VA[MAX] (the validator's H-FORM/S-FORM want the line at MAX): the MAX hull (not the battery), the row's MAX components
//               (never fewer than 2), 2 #gtceu:circuits/max, 2 horizon strand cables, 1 chain lamina stack, 1,152 mB soldering alloy and the
//               (6 or more distinct items, one fluid; no programmed circuit, the row's circuit number only keeps the rows distinct). It runs in gtceu:assembly_line, no research.
//   bender      grindless:bender/fcl_substrate_strip: L39 step 1, high-resistivity Hastelloy C-276 plate bent to the limiter's substrate strip
//
// GTM's own recipes of these ids are cut by opv/cuts.js (every MAX part but gtceu:max_battery, which keeps GTM's UHV row).
// Lookup safety: two rows with the same circuit and one's components inside the other's would hide one; checked at load (an error).
// Published for the smoke test: global.grindless.maxParts { recipes, skipped, clashes, bender }.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/max_parts] '
  var MAXT = 14
  var G = global.grindless || (global.grindless = {})
  var MP = G.maxParts || (G.maxParts = {})
  var TABLE = MP.table || 'kubejs/data/grindless/tables/max_parts.json'
  var COMPONENT_RE = /^(grindless|gtceu):[a-z0-9_]+$/
  var BENDER = { name: 'fcl_substrate_strip', circuit: 30, eut: 7864320, duration: 300, input: 'gtceu:hastelloy_c_276_plate', count: 2,
    output: 'grindless:fcl_substrate_strip', outCount: 4 }

  MP.bender = BENDER
  MP.recipes = []
  MP.skipped = []
  MP.clashes = []

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var out = []
    var seen = {}
    var duration = Number(t.duration)
    var hull = String(t.hull || '')
    var circuits = t.circuits || {}
    var cable = t.cable || {}
    var lamina = t.lamina || {}
    var fluid = t.fluid || {}
    if (!(duration > 0) || duration % 1 !== 0) problems.push('duration ' + t.duration)
    if (hull.indexOf(':') < 0) problems.push('hull ' + t.hull)
    if (String(circuits.id || '').indexOf('#') !== 0 || !(Number(circuits.count) >= 1)) problems.push('circuits')
    if (String(cable.id || '').indexOf(':') < 0 || !(Number(cable.count) >= 1)) problems.push('cable')
    if (String(lamina.id || '').indexOf(':') < 0 || !(Number(lamina.count) >= 1)) problems.push('lamina')
    if (String(fluid.id || '').indexOf(':') < 0 || !(Number(fluid.amount) >= 1)) problems.push('fluid')
    list(t.machines).forEach(function (r) {
      var m = String(r.machine || '')
      var circuit = Number(r.circuit)
      var total = 0
      var bad = false
      var components = list(r.components).map(function (c) {
        var n = Number(c.count)
        if (!COMPONENT_RE.test(String(c.id || '')) || !(n >= 1) || n % 1 !== 0) bad = true
        total += n
        return { id: String(c.id), count: n }
      })
      if (!/^gtceu:max_[a-z0-9_]+$/.test(m) || seen[m] || !(circuit >= 1 && circuit <= 32 && circuit % 1 === 0) || bad || total < 2) {
        problems.push(m + ': id, circuit ' + r.circuit + ' or components (at least 2 MAX components)')
        return
      }
      seen[m] = true
      out.push({ machine: m, name: m.substring(6), circuit: circuit, hull: r.hull !== false, components: components })
    })
    if (out.length === 0) problems.push('no row')
    if (problems.length > 0) console.error(LOG + TABLE + ': ' + problems.join('; '))
    return { hull: hull, circuits: { id: String(circuits.id), count: Number(circuits.count) },
      cable: { id: String(cable.id), count: Number(cable.count) }, lamina: { id: String(lamina.id), count: Number(lamina.count) },
      fluid: { id: String(fluid.id), amount: Number(fluid.amount) }, duration: duration, rows: out }
  }

  function keysOf(rec) {
    var keys = {}
    rec.components.forEach(function (c) { keys[c.id] = true })
    keys.hull = rec.hull
    return keys
  }

  function clashesOf(recs) {
    var out = []
    var keys = recs.map(keysOf)
    function subset(a, b) {
      return Object.keys(a).every(function (k) { return b[k] === a[k] })
    }
    for (var i = 0; i < recs.length; i++) {
      for (var j = i + 1; j < recs.length; j++) {
        if (recs[i].circuit !== recs[j].circuit) continue
        if (subset(keys[i], keys[j]) || subset(keys[j], keys[i])) out.push(recs[i].machine + ' / ' + recs[j].machine + ' (circuit ' + recs[i].circuit + ')')
      }
    }
    return out
  }

  function addBender(event) {
    var missing = [BENDER.input, BENDER.output].filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      MP.skipped.push({ name: BENDER.name, reason: 'unknown id(s): ' + missing.join(', ') })
      console.error(LOG + 'skipped ' + BENDER.name + ': unknown id(s) ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.bender('grindless:' + BENDER.name)
      .itemInputs(BENDER.count + 'x ' + BENDER.input)
      .circuit(BENDER.circuit)
      .itemOutputs(BENDER.outCount + 'x ' + BENDER.output)
      .EUt(BENDER.eut).duration(BENDER.duration)
    MP.recipes.push({ recipeId: 'grindless:bender/' + BENDER.name, out: BENDER.output })
  }

  function generate(event) {
    var table = loadTable()
    var eut = Number(GTValues.VA[MAXT])
    function skip(name, reason) {
      MP.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'skipped ' + name + ': ' + reason)
    }
    var made = []
    table.rows.forEach(function (rec) {
      var ids = [rec.machine, table.cable.id, table.lamina.id].concat(rec.hull ? [table.hull] : []).concat(rec.components.map(function (c) { return c.id }))
      var missing = ids.filter(function (id, k) { return ids.indexOf(id) === k && !Item.exists(id) })
      if (!Fluid.exists(table.fluid.id)) missing.push(table.fluid.id)
      if (missing.length > 0) return skip(rec.name, 'unknown id(s): ' + missing.join(', '))
      try {
        var b = event.recipes.gtceu.assembly_line('grindless:' + rec.name)
        if (rec.hull) b.itemInputs('1x ' + table.hull)
        rec.components.forEach(function (c) { b.itemInputs(c.count + 'x ' + c.id) })
        b.itemInputs(table.circuits.count + 'x ' + table.circuits.id)
        b.itemInputs(table.cable.count + 'x ' + table.cable.id)
        b.itemInputs(table.lamina.count + 'x ' + table.lamina.id)
        b.inputFluids(Fluid.of(table.fluid.id, table.fluid.amount))
        b.itemOutputs(rec.machine)
        b.EUt(eut).duration(table.duration)
      } catch (e) {
        return skip(rec.name, 'the builder failed: ' + e)
      }
      rec.recipeId = 'grindless:assembly_line/' + rec.name
      made.push(rec)
      MP.recipes.push(rec)
    })
    MP.clashes = clashesOf(made)
    if (MP.clashes.length > 0) console.error(LOG + 'rows whose ingredients are a subset of another\'s: ' + MP.clashes.join('; '))
    addBender(event)
    console.info(LOG + MP.recipes.length + ' recipes (the parts at ' + eut + ' EU/t and the bender); skipped ' + MP.skipped.length)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      MP.recipes = []
      MP.skipped = []
      MP.clashes = []
      generate(event)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
