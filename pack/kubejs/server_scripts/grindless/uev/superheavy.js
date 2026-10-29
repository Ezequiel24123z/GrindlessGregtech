// priority: -23274
// -----------------------------------------------------------------------------------------------
// Recipes of UEV's superheavy line (docs/eras/uev.md, machines 2-4, lines 3-6; package UEV-A2), generated at every server load from
// data/grindless/tables/superheavy.json (machines and recipe types: startup_scripts/grindless/uev/superheavy.js), plus the three
// controller recipes.
//
//   gtceu:heavy_ion_irradiation / recoil_separation / superheavy_chemistry   one recipe per entry of types.<type>, id
//                          grindless:<type>/<name>; the programmed circuit picks the recipe; each carries the data key of the type.
//                          kept[] are non-consumed items (the SRF cavity), charge[] non-consumed fluids (the helium chamber).
//   gtceu:assembler / chemical_reactor   the rows of types.<type> (id grindless:<type>/<name>): the beam, the wheel, the capsule, the
//                          foils, the nitrate -> dust conversions, phosgene and polycarbonate. Circuits 20 and up so GTM's own recipes
//                          cannot hide a row.
//   assembly line          the controller(s): station research, UEV-era circuits, 3 domain parts of the line, soldering alloy and lubricant, grindless:assembly_line/<machine>.
//
// Published for the smoke test: global.grindless.superheavy.recipes [{ type, name, recipeId, ... }], .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var SH = G.superheavy || (G.superheavy = {})
  var TABLE = SH.table || 'kubejs/data/grindless/tables/superheavy.json'
  var OWN_TYPES = {
    heavy_ion_irradiation: { itemsIn: 4, itemsOut: 3, fluidsIn: 2, fluidsOut: 2 },
    recoil_separation: { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 },
    superheavy_chemistry: { itemsIn: 6, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }
  }
  var CONTROLLERS = ['heavy_ion_cyclotron', 'recoil_separator', 'superheavy_chemistry_lab']

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
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dataKey: t.types[type].dataKey ? String(t.types[type].dataKey) : '',
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
    if (problems.length > 0) console.error(LOG + 'superheavy: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    rec.fluidsIn.concat(rec.charge, rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    var io = OWN_TYPES[rec.type]
    if (!io) return null
    if (rec.itemsIn.length + rec.kept.length + 1 > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length + rec.charge.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu[rec.type]('grindless:' + rec.name)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    rec.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
    recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.charge.forEach(function (x) { recipe.notConsumableFluid(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
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
    SH.recipes = []
    SH.skipped = []
    SH.clashes = []
    function skip(name, reason) {
      SH.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'superheavy skipped ' + name + ': ' + reason)
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
      SH.recipes.push(rec)
    })
    SH.clashes = clashesOf(SH.recipes)
    if (SH.clashes.length > 0) console.error(LOG + 'superheavy: recipes whose ingredients are a subset of another\'s: ' + SH.clashes.join('; '))
    console.info(LOG + 'superheavy: ' + SH.recipes.length + ' recipes; skipped ' + SH.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var SENSOR = 'gtceu:uv_sensor'
    var FIELD = 'gtceu:uv_field_generator'
    SH.controllerRecipes = []
    // QR-R6: assembly line with station research (the previous machine, the calutron for the cyclotron), the era fluid and domain inputs
    var ins = {
      heavy_ion_cyclotron: { research: 'gtceu:calutron', era: 'gtceu:neutronium',
        ins: [HULL, '2x ' + SENSOR, '2x ' + FIELD, '4x #gtceu:circuits/uhv', '2x grindless:ca48_beam', 'grindless:target_wheel', 'grindless:nb3sn_srf_cavity'] },
      recoil_separator: { research: 'gtceu:heavy_ion_cyclotron', era: 'gtceu:tritanium',
        ins: [HULL, '2x ' + SENSOR, '2x ' + FIELD, '4x #gtceu:circuits/uhv', '2x grindless:etched_membrane', 'grindless:ion_tracked_foil', 'grindless:nb3sn_srf_cavity'] },
      superheavy_chemistry_lab: { research: 'gtceu:recoil_separator', era: 'gtceu:neutronium',
        ins: [HULL, '2x ' + SENSOR, '2x ' + FIELD, '4x #gtceu:circuits/uhv', '2x grindless:sealed_capsule', 'grindless:polycarbonate_foil', 'grindless:etched_membrane'] }
    }
    CONTROLLERS.forEach(function (name) {
      var machine = 'gtceu:' + name
      var d = ins[name]
      var ids = d.ins.map(function (s) { return s.replace(/^[0-9]+x /, '') }).filter(function (id) { return id.charAt(0) !== '#' }).concat([machine, d.research])
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + name)
      b.itemInputs(d.ins)
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 1000), Fluid.of(d.era, 576))
      b.itemOutputs(machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(491520) })
      b.EUt(491520).duration(2400)
      SH.controllerRecipes.push('grindless:assembly_line/' + name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'superheavy ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
