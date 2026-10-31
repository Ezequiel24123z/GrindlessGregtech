// Gregtech Grindless - the recipes of GTM's basic machines at OpV (package OpV-A4, docs/eras/opv.md 'A4. Basic machines'), generated at
// every server load from data/grindless/tables/opv_basic_machines.json:
//
//   assembler   grindless:assembler/opv_<machine> -> gtceu:opv_<machine>, at VA[OpV]: the OpV hull, the row's OpV components (GTM's UV
//               recipe one tier up, never fewer than 2), 2 #gtceu:circuits/opv, 2 chain strand cables, 1 chain lamina stack, 1152 mB
//               soldering alloy and the row's programmed circuit (6 or more distinct items and fluids, one fluid)
//
// GTM's own recipes for these ids are cut by OpV-F2. Every id is GTM's (highTierContent, tables/opv_ids.json gtm.machines).
// Lookup safety: a row whose ingredients are a subset of another's with the same circuit can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.opvBasicMachines.recipes, .skipped, .clashes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/opv_basic_machines] '
  var OPV = 13
  var G = global.grindless || (global.grindless = {})
  var OB = G.opvBasicMachines || (G.opvBasicMachines = {})
  var TABLE = OB.table || 'kubejs/data/grindless/tables/opv_basic_machines.json'
  var COMPONENT_RE = /^gtceu:opv_(electric_motor|electric_pump|conveyor_module|electric_piston|robot_arm|emitter|sensor|field_generator)$/

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
      if (!/^[a-z0-9_]+$/.test(m) || seen[m] || !(circuit >= 1 && circuit <= 32 && circuit % 1 === 0) || bad || total < 2) {
        problems.push(m + ': name, circuit ' + r.circuit + ' or components (at least 2 OpV components)')
        return
      }
      seen[m] = true
      out.push({ machine: m, out: 'gtceu:opv_' + m, circuit: circuit, components: components, pending: r.pending ? String(r.pending) : '' })
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
    return keys
  }

  // every row shares the hull, circuits, cable, lamina and fluid, so two rows clash when they have the same circuit and one's components are in the other's
  function clashesOf(recs) {
    var out = []
    var keys = recs.map(keysOf)
    function subset(a, b) {
      return Object.keys(a).every(function (k) { return b[k] === true })
    }
    for (var i = 0; i < recs.length; i++) {
      for (var j = i + 1; j < recs.length; j++) {
        if (recs[i].circuit !== recs[j].circuit) continue
        if (subset(keys[i], keys[j]) || subset(keys[j], keys[i])) out.push(recs[i].machine + ' / ' + recs[j].machine + ' (circuit ' + recs[i].circuit + ')')
      }
    }
    return out
  }

  function generate(event) {
    OB.recipes = []
    OB.skipped = []
    OB.clashes = []
    var table = loadTable()
    var eut = Number(GTValues.VA[OPV])
    function skip(name, reason) {
      OB.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'skipped opv_' + name + ': ' + reason)
    }
    table.rows.forEach(function (rec) {
      var ids = [rec.out, table.hull, table.cable.id, table.lamina.id].concat(rec.components.map(function (c) { return c.id }))
      var missing = ids.filter(function (id, k) { return id.charAt(0) !== '#' && ids.indexOf(id) === k && !Item.exists(id) })
      if (missing.length > 0) return skip(rec.machine, 'unknown id(s): ' + missing.join(', '))
      var id = 'grindless:opv_' + rec.machine
      try {
        var b = event.recipes.gtceu.assembler(id)
        b.itemInputs('1x ' + table.hull)
        rec.components.forEach(function (c) { b.itemInputs(c.count + 'x ' + c.id) })
        b.itemInputs(table.circuits.count + 'x ' + table.circuits.id)
        b.itemInputs(table.cable.count + 'x ' + table.cable.id)
        b.itemInputs(table.lamina.count + 'x ' + table.lamina.id)
        b.inputFluids(Fluid.of(table.fluid.id, table.fluid.amount))
        b.circuit(rec.circuit)
        b.itemOutputs(rec.out)
        b.EUt(eut).duration(table.duration)
      } catch (e) {
        return skip(rec.machine, 'the builder failed: ' + e)
      }
      rec.recipeId = 'grindless:assembler/opv_' + rec.machine
      OB.recipes.push(rec)
    })
    OB.clashes = clashesOf(OB.recipes)
    if (OB.clashes.length > 0) console.error(LOG + 'rows whose ingredients are a subset of another\'s: ' + OB.clashes.join('; '))
    console.info(LOG + OB.recipes.length + ' basic machine recipes at ' + eut + ' EU/t; skipped ' + OB.skipped.length)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
