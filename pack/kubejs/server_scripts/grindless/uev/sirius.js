// priority: -23152
// -----------------------------------------------------------------------------------------------
// Recipes of UEV's white dwarf spectrograph, degenerate harvester and containment works (machines and recipe types:
// startup_scripts/grindless/uev/sirius.js; docs/eras/uev.md, machines 23-25 and line 28; package UEV-B4), generated at every server load from
// data/grindless/tables/sirius.json, plus the recipes of the three controllers.
//
//   gtceu:gravitational_redshift / degenerate_harvesting / degenerate_containment   one recipe per table entry, id grindless:<type>/<name>,
//                          Sirius B orbit only (recipe.dimension(grindless:sirius_b_orbit), the pattern of uev/earth_orbit.js); every recipe carries
//                          the data key of its type = <name> (its EMI line). The nuclear clock, the chart and the helium are kept inputs.
//   gtceu:assembler        the degenerate containment casing and the UEV field generator (circuit 0, anywhere: the pellet inside is the orbit-only part).
//   crafting               the controllers: UEV hull + 2 UEV parts + 2 optical computers, shaped recipes grindless:crafting/<machine>.
//
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.uevSirius.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var SI = G.uevSirius || (G.uevSirius = {})
  var TABLE = SI.table || 'kubejs/data/grindless/tables/sirius.json'
  var ORBIT = SI.orbit || 'grindless:sirius_b_orbit'
  // GTM's own types: their circuit is optional (0 = none) and their slots are GTM's
  var GTM_TYPES = { assembler: true }

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
      var def = t.types[type]
      var optional = GTM_TYPES[type] === true
      list(def.recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var circuitOk = (optional && circuit === 0) || (circuit >= 1 && circuit <= 32 && circuit % 1 === 0 && !circuits[circuit])
        if (!/^[a-z0-9_]+$/.test(n) || names[n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration)
          return
        }
        var bad = false
        var stack = function (x) {
          var chance = x.chance === undefined ? 10000 : Number(x.chance)
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1) || !(chance >= 1 && chance <= 10000) || chance % 1 !== 0) bad = true
          return { id: String(x.id), count: Number(x.count), chance: chance }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dataKey: def.dataKey ? String(def.dataKey) : '',
          dimension: def.dimension === true,
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), fluidsIn: list(r.fluidsIn).map(fluid), charge: list(r.charge).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        if (bad || (rec.itemsOut.length === 0 && rec.fluidsOut.length === 0) || (rec.itemsIn.length === 0 && rec.fluidsIn.length === 0)) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        names[n] = true
        if (circuit > 0) circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'sirius: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.itemsOut).forEach(function (x) {
      if (x.id.charAt(0) === '#') return
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    rec.fluidsIn.concat(rec.charge, rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    if (GTM_TYPES[rec.type] === true) return null
    var io = null
    Object.keys(SI.machines || {}).forEach(function (k) { if (SI.machines[k].type === rec.type) io = SI.machines[k].maxIO })
    if (io === null) return 'no slots known for type ' + rec.type
    var circuit = rec.circuit > 0 ? 1 : 0
    if (rec.itemsIn.length + rec.kept.length + circuit > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length + rec.charge.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu[rec.type](rec.recipeId)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    rec.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
    if (rec.circuit > 0) recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.charge.forEach(function (x) { recipe.notConsumableFluid(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) {
      if (x.chance >= 10000) recipe.itemOutputs(x.count + 'x ' + x.id)
      else recipe.chancedOutput(x.count + 'x ' + x.id, x.chance, 0)
    })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    if (rec.dimension) recipe.dimension(ORBIT)
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
    SI.recipes = []
    SI.skipped = []
    SI.clashes = []
    function skip(name, reason) {
      SI.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'sirius skipped ' + name + ': ' + reason)
    }
    loadTable().forEach(function (rec) {
      // GTM prefixes the type itself: grindless:<name> becomes grindless:<type>/<name>
      rec.recipeId = 'grindless:' + rec.name
      var missing = missingIds(rec)
      if (missing.length > 0) return skip(rec.type + '/' + rec.name, 'unknown id(s): ' + missing.join(', '))
      var tooBig = sizeProblem(rec)
      if (tooBig !== null) return skip(rec.type + '/' + rec.name, tooBig)
      try {
        add(event, rec)
      } catch (e) {
        return skip(rec.type + '/' + rec.name, 'the builder failed: ' + e)
      }
      SI.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    SI.clashes = clashesOf(SI.recipes)
    if (SI.clashes.length > 0) console.error(LOG + 'sirius: recipes whose ingredients are a subset of another\'s: ' + SI.clashes.join('; '))
    console.info(LOG + 'sirius: ' + SI.recipes.length + ' recipes; skipped ' + SI.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uev_machine_hull'
    var O = 'gtnn:optical_computer'
    var SENSOR = 'grindless:uev_sensor'
    var EMITTER = 'grindless:uev_emitter'
    var ARM = 'grindless:uev_robot_arm'
    var PUMP = 'grindless:uev_electric_pump'
    var M = SI.machines
    // shapes differ from every other UEV controller's: grep "pattern: [" and "shaped(" in server_scripts/grindless/uev/*.js
    var defs = [
      { m: M.spectrograph, parts: [SENSOR, EMITTER], pattern: ['OSO', 'EHE'], ingredients: { O: O, S: SENSOR, E: EMITTER, H: HULL } },
      { m: M.harvester, parts: [ARM, PUMP], pattern: ['OAO', 'PHP'], ingredients: { O: O, A: ARM, P: PUMP, H: HULL } },
      { m: M.works, parts: [EMITTER, PUMP], pattern: ['OEO', 'PHP'], ingredients: { O: O, E: EMITTER, P: PUMP, H: HULL } }
    ]
    SI.controllerRecipes = []
    defs.forEach(function (d) {
      var missing = [HULL, O, d.m.machine].concat(d.parts).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.m.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(d.m.machine, d.pattern, d.ingredients).id('grindless:crafting/' + d.m.name)
      SI.controllerRecipes.push('grindless:crafting/' + d.m.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'sirius ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
