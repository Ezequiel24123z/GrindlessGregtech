// priority: -23224
// -----------------------------------------------------------------------------------------------
// Recipes of UHV's ultrapure water plant and betavoltaic fab (machines and recipe types: startup_scripts/grindless/uhv/betavoltaics.js;
// docs/eras/uhv.md, machines 9 and 10, lines 4, 11 and 22; package UHV-A3), generated at every server load from
// data/grindless/tables/betavoltaics.json, plus the recipes of the two controllers and the older machines' rows of the package.
//
//   gtceu:ultrapure_water / gtceu:betavoltaic   one recipe per table entry, id grindless:<type>/<name>; the programmed circuit picks
//                          the recipe; every recipe carries the data key of its type = <name> (its EMI line). "kept" entries are GTM's
//                          non-consumed item inputs, "charge" the same for fluids. The plant is the only source of gtceu:ultrapure_water.
//   gtceu:diamond_cvd      ZPM diamond lattice fab, circuits 5-6: the boron/phosphorus-doped diamond diodes and the C-12 diamond
//                          spreader (on the ZPM ice giant seed, kept). Circuits 1-4 stay in zpm/qubits.js.
//   gtceu:cryogenic_isotope_separation   ZPM isotope column, circuit 3, Saturn orbit: CO -> C-12 monoxide; the enriched tails go back
//                          as ordinary CO. Circuits 1-2 stay in zpm/saturn_siphon.js.
//   gtceu:chemical_reactor GTM, circuit 6 (line 22): C-12 monoxide + hydrogen over nickel -> C-12 methane + water.
//   crafting               the controllers: UHV hull + 2 UV electric pumps + UV sensor + 4 UHV circuits (plant) and UHV hull +
//                          2 UV robot arms + UV sensor + 4 UHV circuits (fab), shaped recipes grindless:crafting/<machine>.
//
// The older rows live in this package's table, not in the ZPM scripts, so the ZPM tables (and their tests) keep their rows.
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error)
// among this table's rows; tools/analysis/test/uhv-betavoltaics.test.mjs also checks them against the ZPM rows of the same types.
// Published for the smoke test: global.grindless.betavoltaics.recipes [{ type, name, recipeId, ... }], .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var BV = G.betavoltaics || (G.betavoltaics = {})
  var TABLE = BV.table || 'kubejs/data/grindless/tables/betavoltaics.json'
  // the older machines' slots (startup zpm/qubits.js and zpm/saturn_siphon.js); GTM's chemical reactor is not checked
  var OLDER_IO = {
    diamond_cvd: { itemsIn: 4, itemsOut: 1, fluidsIn: 3, fluidsOut: 1 },
    cryogenic_isotope_separation: { itemsIn: 1, itemsOut: 0, fluidsIn: 1, fluidsOut: 2 }
  }

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
        var circuitOk = circuit >= 1 && circuit <= 32 && circuit % 1 === 0 && !circuits[circuit]
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
        var dimension = r.dimension ? String(r.dimension) : ''
        if (dimension !== '' && dimension.indexOf(':') < 0) bad = true
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dimension: dimension,
          dataKey: t.types[type].dataKey ? String(t.types[type].dataKey) : '',
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), fluidsIn: list(r.fluidsIn).map(fluid), charge: list(r.charge).map(fluid),
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
    if (problems.length > 0) console.error(LOG + 'betavoltaics: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    rec.fluidsIn.concat(rec.charge, rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function ioOf(type) {
    if (OLDER_IO[type]) return OLDER_IO[type]
    var io = null
    Object.keys(BV.machines || {}).forEach(function (k) { if (BV.machines[k].type === type) io = BV.machines[k].maxIO })
    return io
  }

  function sizeProblem(rec) {
    if (rec.type === 'chemical_reactor') return null
    var io = ioOf(rec.type)
    if (io === null) return 'no machine for type ' + rec.type
    if (rec.itemsIn.length + rec.kept.length + 1 > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length + rec.charge.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    // GTM puts the type's path in front: 'grindless:<name>' becomes grindless:<type>/<name> (= rec.recipeId)
    var recipe = event.recipes.gtceu[rec.type]('grindless:' + rec.name)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    rec.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
    recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.charge.forEach(function (x) { recipe.notConsumableFluid(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    if (rec.dimension !== '') recipe.dimension(rec.dimension)
    recipe.EUt(rec.eut).duration(rec.duration)
  }

  function keysOf(rec) {
    var keys = {}
    rec.itemsIn.concat(rec.kept).forEach(function (x) { keys['i:' + x.id] = true })
    rec.fluidsIn.concat(rec.charge).forEach(function (x) { keys['f:' + x.id] = true })
    keys['circuit:' + rec.circuit] = true
    return keys
  }

  function clashesOf(recs) {
    var out = []
    var keys = recs.map(keysOf)
    function subset(a, b) {
      return Object.keys(a).every(function (k) { return b[k] === true })
    }
    for (var i = 0; i < recs.length; i++) {
      for (var j = i + 1; j < recs.length; j++) {
        if (recs[i].type !== recs[j].type) continue
        if (subset(keys[i], keys[j]) || subset(keys[j], keys[i])) out.push(recs[i].type + '/' + recs[i].name + ' / ' + recs[j].name)
      }
    }
    return out
  }

  function generate(event) {
    BV.recipes = []
    BV.skipped = []
    BV.clashes = []
    function skip(name, reason) {
      BV.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'betavoltaics skipped ' + name + ': ' + reason)
    }
    loadTable().forEach(function (rec) {
      rec.recipeId = 'grindless:' + rec.type + '/' + rec.name
      var missing = missingIds(rec)
      if (missing.length > 0) return skip(rec.type + '/' + rec.name, 'unknown id(s): ' + missing.join(', '))
      var tooBig = sizeProblem(rec)
      if (tooBig !== null) return skip(rec.type + '/' + rec.name, tooBig)
      try {
        add(event, rec)
      } catch (e) {
        return skip(rec.type + '/' + rec.name, 'the builder failed: ' + e)
      }
      BV.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    BV.clashes = clashesOf(BV.recipes)
    if (BV.clashes.length > 0) console.error(LOG + 'betavoltaics: recipes whose ingredients are a subset of another\'s: ' + BV.clashes.join('; '))
    console.info(LOG + 'betavoltaics: ' + BV.recipes.length + ' recipes; skipped ' + BV.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var ARM = 'gtceu:uv_robot_arm'
    var PUMP = 'gtceu:uv_electric_pump'
    var SENSOR = 'gtceu:uv_sensor'
    var defs = [
      { machine: BV.machines.water.machine, parts: [HULL, PUMP, SENSOR], pattern: ['CSC', 'PHP', 'C C'], ingredients: { C: '#gtceu:circuits/uhv', S: SENSOR, P: PUMP, H: HULL }, name: 'ultrapure_water_plant' },
      { machine: BV.machines.fab.machine, parts: [HULL, ARM, SENSOR], pattern: ['CAC', 'SHS', 'C C'], ingredients: { C: '#gtceu:circuits/uhv', S: SENSOR, A: ARM, H: HULL }, name: 'betavoltaic_fab' }
    ]
    BV.controllerRecipes = []
    defs.forEach(function (d) {
      var missing = d.parts.concat([d.machine]).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(d.machine, d.pattern, d.ingredients).id('grindless:crafting/' + d.name)
      BV.controllerRecipes.push('grindless:crafting/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'betavoltaics ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
