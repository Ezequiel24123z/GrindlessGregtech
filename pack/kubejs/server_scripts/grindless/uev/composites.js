// priority: -23017
// -----------------------------------------------------------------------------------------------
// Recipes of UEV's nitride magnet works, SiC fibre plant and CVI furnace (machines and recipe types: startup_scripts/grindless/uev/composites.js;
// docs/eras/uev.md, machines 8-10, lines 14-17 and 35; package UEV-A5), generated at every server load from
// data/grindless/tables/composites.json, plus the recipes of the three controllers.
//
//   gtceu:nitride_magnet_synthesis / sic_fibre_spinning / chemical_vapour_infiltration   one recipe per table entry, id grindless:<type>/<name>;
//                          the programmed circuit picks the recipe; every recipe carries the data key of its type = <name> (its EMI line).
//   gtceu:chemical_reactor, mixer, assembler, compressor, macerator, electric_blast_furnace   the line steps GTM can run (ids grindless:<type>/<name>);
//                          the EBF rows carry the table's temperature. The HfTaCN coil block, the heating element and the UEV motor are assembler rows.
//   crafting               the controllers: UHV hull + 2 UV parts + 2 UHV circuits, shaped recipes grindless:crafting/<machine>.
//
// Byproducts are never voided: CH4 and H2 go to the ZPM pyrolyser (gtceu:methane_pyrolysis), HCl to the EV extraction cascade, HF to the IV fluorspar kiln,
// CO to the HV syngas line. The UV BN reactor's interphase row is in uv/materials.js and the UHV sinterer's HfTaCN row in uhv/propulsion.js.
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.composites.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var CO = G.composites || (G.composites = {})
  var TABLE = CO.table || 'kubejs/data/grindless/tables/composites.json'
  // GTM's own types: their circuit is optional (0 = none) and their slots are GTM's
  var GTM_TYPES = { mixer: true, assembler: true, compressor: true, macerator: true, chemical_reactor: true, electric_blast_furnace: true }

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
        var circuitOk = ((optional && circuit === 0) || (circuit >= 1 && circuit <= 32 && circuit % 1 === 0)) && !circuits[circuit]
        if (!/^[a-z0-9_]+$/.test(n) || names[n] || !(circuitOk || (optional && circuit === 0)) || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
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
          temp: def.temp ? Number(def.temp) : 0,
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
    if (problems.length > 0) console.error(LOG + 'composites: ' + TABLE + ': ' + problems.join('; '))
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
    var io = null
    if (GTM_TYPES[rec.type] === true) return null
    Object.keys(CO.machines || {}).forEach(function (k) { if (CO.machines[k].type === rec.type) io = CO.machines[k].maxIO })
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
    rec.itemsIn.forEach(function (x) {
      if (x.chance >= 10000) recipe.itemInputs(x.count + 'x ' + x.id)
      else recipe.chancedInput(x.count + 'x ' + x.id, x.chance, 0)
    })
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
    if (rec.temp > 0) {
      try {
        recipe.blastFurnaceTemp(rec.temp)
      } catch (e) {
        console.error(LOG + rec.type + '/' + rec.name + ': blastFurnaceTemp failed: ' + e)
      }
    }
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
    CO.recipes = []
    CO.skipped = []
    CO.clashes = []
    function skip(name, reason) {
      CO.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'composites skipped ' + name + ': ' + reason)
    }
    loadTable().forEach(function (rec) {
      // GTM prefixes the type itself: grindless:<type>/<name>
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
      CO.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    CO.clashes = clashesOf(CO.recipes)
    if (CO.clashes.length > 0) console.error(LOG + 'composites: recipes whose ingredients are a subset of another\'s: ' + CO.clashes.join('; '))
    console.info(LOG + 'composites: ' + CO.recipes.length + ' recipes; skipped ' + CO.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var MOTOR = 'gtceu:uv_electric_motor'
    var PUMP = 'gtceu:uv_electric_pump'
    var ARM = 'gtceu:uv_robot_arm'
    var EMITTER = 'gtceu:uv_emitter'
    var defs = [
      { machine: CO.machines.works.machine, parts: [HULL, MOTOR], pattern: [' C ', 'MHM', ' C '], ingredients: { C: '#gtceu:circuits/uhv', M: MOTOR, H: HULL }, name: 'nitride_magnet_works' },
      { machine: CO.machines.fibre.machine, parts: [HULL, PUMP, ARM], pattern: [' C ', 'PHA', ' C '], ingredients: { C: '#gtceu:circuits/uhv', P: PUMP, A: ARM, H: HULL }, name: 'sic_fibre_plant' },
      { machine: CO.machines.cvi.machine, parts: [HULL, PUMP, EMITTER], pattern: [' C ', 'PHE', ' C '], ingredients: { C: '#gtceu:circuits/uhv', P: PUMP, E: EMITTER, H: HULL }, name: 'cvi_furnace' }
    ]
    CO.controllerRecipes = []
    defs.forEach(function (d) {
      var missing = d.parts.concat([d.machine]).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(d.machine, d.pattern, d.ingredients).id('grindless:crafting/' + d.name)
      CO.controllerRecipes.push('grindless:crafting/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'composites ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
