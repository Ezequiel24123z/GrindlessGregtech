// priority: -23048
// -----------------------------------------------------------------------------------------------
// Recipes of UEV's quantum gas lab and entanglement station (machines and recipe types: startup_scripts/grindless/uev/earth_orbit.js;
// docs/eras/uev.md, machines 16 and 17, lines 31, 32, 34, 36, 39 and 40; package UEV-A8), generated at every server load from
// data/grindless/tables/earth_orbit.json, plus the recipes of the two controllers.
//
//   gtceu:quantum_degenerate_gas / entanglement_distribution   one recipe per table entry, id grindless:<type>/<name>, Earth orbit only
//                          (recipe.dimension(ORBIT), the pattern of uhv/zblan.js); the programmed circuit picks the recipe; every recipe carries the
//                          data key of its type = <name> (its EMI line). The ULE cavity is a kept input of the calibration: never consumed.
//   gtceu:chemical_reactor, electric_blast_furnace, cutter, lathe, mixer, wiremill, polarizer, assembler   the line steps GTM can run (circuit 0).
//   assembly line          the controller(s): station research, UEV-era circuits, 3 domain parts of the line, soldering alloy and lubricant, grindless:assembly_line/<machine>.
//   The older machines' rows (fibre draw 6-8, crystal furnace 6-7, pyrolyser 3) are in their own scripts.
//
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.uevEarthOrbit.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var EO = G.uevEarthOrbit || (G.uevEarthOrbit = {})
  var TABLE = EO.table || 'kubejs/data/grindless/tables/earth_orbit.json'
  var ORBIT = G.orbits ? G.orbits.earth : 'gcyr:overworld_orbit'
  // GTM's own types: their circuit is optional (0 = none) and their slots are GTM's
  var GTM_TYPES = { cutter: true, electric_blast_furnace: true, chemical_reactor: true, assembler: true, lathe: true, mixer: true, wiremill: true, polarizer: true }

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
          temp: def.temp ? Number(def.temp) : 0, dimension: def.dimension === true,
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
    if (problems.length > 0) console.error(LOG + 'earth orbit: ' + TABLE + ': ' + problems.join('; '))
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
    Object.keys(EO.machines || {}).forEach(function (k) { if (EO.machines[k].type === rec.type) io = EO.machines[k].maxIO })
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
    EO.recipes = []
    EO.skipped = []
    EO.clashes = []
    function skip(name, reason) {
      EO.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'earth orbit skipped ' + name + ': ' + reason)
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
      EO.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    EO.clashes = clashesOf(EO.recipes)
    if (EO.clashes.length > 0) console.error(LOG + 'earth orbit: recipes whose ingredients are a subset of another\'s: ' + EO.clashes.join('; '))
    console.info(LOG + 'earth orbit: ' + EO.recipes.length + ' recipes; skipped ' + EO.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var C = '4x #gtceu:circuits/uhv'
    // QR-R6: assembly line with station research (a component of the line, then the previous machine), the era fluid and domain inputs
    var defs = [
      { machine: EO.machines.gas_lab.machine, name: EO.machines.gas_lab.name, research: 'grindless:atom_interferometer', era: 'gtceu:neutronium',
        ins: [HULL, '2x gtceu:uv_sensor', C, 'grindless:li_cooling_laser', 'grindless:k_cooling_laser', 'grindless:ule_cavity'] },
      { machine: EO.machines.station.machine, name: EO.machines.station.name, research: EO.machines.gas_lab.machine, era: 'gtceu:tritanium',
        ins: [HULL, '2x gtceu:uv_emitter', C, 'grindless:spdc_source', 'grindless:hollow_core_fibre', 'grindless:snspd'] }
    ]
    EO.controllerRecipes = []
    defs.forEach(function (d) {
      var ids = d.ins.map(function (s) { return s.replace(/^[0-9]+x /, '') }).filter(function (id) { return id.charAt(0) !== '#' }).concat([d.machine, d.research])
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      b.itemInputs(d.ins)
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 1000), Fluid.of(d.era, 576))
      b.itemOutputs(d.machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(491520) })
      b.EUt(491520).duration(2400)
      EO.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'earth orbit ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
