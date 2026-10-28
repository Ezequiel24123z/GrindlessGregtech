// priority: -24586
// -----------------------------------------------------------------------------------------------
// Recipes of UIV's isotope chains in GTM's own types (docs/eras/uiv.md, lines 9 and 24; package UIV-A1), generated at every server load
// from data/grindless/tables/isotopes_uiv.json (registrations: startup_scripts/grindless/uiv/isotopes.js).
//   gtceu:vacuum_freezer / chemical_reactor / assembler  id grindless:<type>/<name>; circuit 0 = none; chemical reactor 30, assembler 29-32.
// Published: global.grindless.uivIsotopes.recipes [{ type, name, recipeId, circuit }], .skipped.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uiv] '
  var G = global.grindless || (global.grindless = {})
  var ISO = G.uivIsotopes || (G.uivIsotopes = {})
  var TABLE = ISO.table || 'kubejs/data/grindless/tables/isotopes_uiv.json'

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var out = []
    Object.keys(t.types || {}).forEach(function (type) {
      var names = {}
      var circuits = {}
      list(t.types[type].recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var circuitOk = circuit >= 0 && circuit <= 32 && circuit % 1 === 0 && (circuit === 0 || !circuits[circuit])
        if (!/^[a-z0-9_]+$/.test(n) || names[n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration)
          return
        }
        var bad = false
        var stack = function (x) {
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1)) bad = true
          return { id: String(x.id), count: Number(x.count) }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration,
          itemsIn: list(r.itemsIn).map(stack), fluidsIn: list(r.fluidsIn).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        if (bad || (rec.itemsOut.length === 0 && rec.fluidsOut.length === 0) || (rec.itemsIn.length === 0 && rec.fluidsIn.length === 0)) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        names[n] = true
        circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'isotopes: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    rec.fluidsIn.concat(rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu[rec.type]('grindless:' + rec.type + '/' + rec.name)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    if (rec.circuit > 0) recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    recipe.EUt(rec.eut).duration(rec.duration)
  }

  ServerEvents.recipes(function (event) {
    ISO.recipes = []
    ISO.skipped = []
    try {
      loadTable().forEach(function (rec) {
        rec.recipeId = 'grindless:' + rec.type + '/' + rec.name
        var missing = missingIds(rec)
        if (missing.length > 0) {
          ISO.skipped.push({ name: rec.recipeId, reason: 'unknown id(s): ' + missing.join(', ') })
          console.error(LOG + 'isotopes skipped ' + rec.recipeId + ': unknown id(s): ' + missing.join(', '))
          return
        }
        try {
          add(event, rec)
          ISO.recipes.push(rec)
        } catch (e) {
          ISO.skipped.push({ name: rec.recipeId, reason: String(e) })
          console.error(LOG + 'isotopes skipped ' + rec.recipeId + ': the builder failed: ' + e)
        }
      })
    } catch (e) {
      console.error(LOG + 'isotopes failed: ' + e)
    }
    console.info(LOG + 'isotopes: ' + ISO.recipes.length + ' recipes; skipped ' + ISO.skipped.length)
  })
})()
