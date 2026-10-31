// priority: -23391
// -----------------------------------------------------------------------------------------------
// Recipes of UHV's nuclear clock lab and crystal growth furnace (machines and recipe types: startup_scripts/grindless/uhv/crystals.js;
// docs/eras/uhv.md, machines 3 and 4, lines 3, 7 and 8; package UHV-A2), generated at every server load from
// data/grindless/tables/crystals.json, plus the recipes of the two controllers.
//
//   gtceu:nuclear_clock / gtceu:crystal_growth   one recipe per table entry, id grindless:<type>/<name>; the programmed circuit picks
//                          the recipe (one per boule); every recipe carries the data key of its type = <name> (its EMI line). "charge"
//                          entries are GTM's non-consumed fluid inputs, "kept" the same for items; an entry with a chance below 10 000
//                          is a chanced input or output (the iridium crucible, worn 1 run in 32).
//   gtceu:cutter           the boules cut to VUV optics and to LiNbO3 and InP wafers (id grindless:cutter/<name>).
//   gtceu:assembler        the iridium crucible: 8 iridium ingots, circuit 24 (id grindless:assembler/iridium_crucible).
//   gtceu:chemical_reactor the two F1 dusts the boules need: niobium + oxygen -> Nb2O5, lead + HF -> PbF2 + hydrogen
//                          (ids grindless:chemical_reactor/niobium_oxide, /lead_fluoride).
//   gtceu:pgm_refining     the worn crucible back to iridium in EV's platinum plant, circuit 5 (id grindless:pgm_refining/uhv/iridium_crucible):
//                          chlorine dissolves it, hydrogen reduces it, the plant's platinum electrode wears as in its other modes, and
//                          the recipe carries the plant's keep flag (global.grindless.platinumPlant.keepKey: it refuses voiding).
//   crafting               the controllers: UHV hull + 2 UV sensors + 2 UHV circuits (lab) and UHV hull + 2 UV robot arms + 2 UHV
//                          circuits (furnace), assembly lines grindless:assembly_line/<machine>.
//                          Each is an assembly line: station research, tritanium + soldering alloy + lubricant, 3 domain items of its own line.
//
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// A row that repeats a circuit of its type with the same item inputs (ids, consumed or kept) is refused at load.
// Published for the smoke test: global.grindless.crystals.recipes [{ type, name, recipeId, ... }], .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var CR = G.crystals || (G.crystals = {})
  var TABLE = CR.table || 'kubejs/data/grindless/tables/crystals.json'
  // GTM's own types: their circuit is optional (0 = none) and their slots are GTM's
  var GTM_TYPES = { cutter: true, assembler: true, pgm_refining: true, chemical_reactor: true }

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  // the item ids the lookup sees (consumed and kept), sorted: two rows with the same string have identical item inputs
  function itemSet(rec) {
    var ids = []
    rec.itemsIn.concat(rec.kept).forEach(function (x) { if (ids.indexOf(x.id) < 0) ids.push(x.id) })
    return ids.sort().join(',')
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
        var circuitOk = (optional && circuit === 0) || (circuit >= 1 && circuit <= 32 && circuit % 1 === 0)
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
          idPrefix: def.idPrefix ? String(def.idPrefix) : '', keep: def.keep === true,
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), fluidsIn: list(r.fluidsIn).map(fluid), charge: list(r.charge).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        if (bad || (rec.itemsOut.length === 0 && rec.fluidsOut.length === 0) || (rec.itemsIn.length === 0 && rec.fluidsIn.length === 0)) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        var items = itemSet(rec)
        var same = circuit > 0 ? list(circuits[circuit]) : []
        for (var k = 0; k < same.length; k++) {
          if (same[k].items === items) {
            problems.push(type + '/' + n + ': circuit ' + circuit + ' repeats ' + same[k].name + ' with the same item inputs')
            return
          }
        }
        names[n] = true
        if (circuit > 0) circuits[circuit] = same.concat([{ name: n, items: items }])
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'crystals: ' + TABLE + ': ' + problems.join('; '))
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
    if (rec.type === 'pgm_refining') io = (G.platinumPlant || {}).maxIO || null
    else if (GTM_TYPES[rec.type] === true) return null
    else Object.keys(CR.machines || {}).forEach(function (k) { if (CR.machines[k].type === rec.type) io = CR.machines[k].maxIO })
    if (io === null) return 'no slots known for type ' + rec.type
    var circuit = rec.circuit > 0 ? 1 : 0
    if (rec.itemsIn.length + rec.kept.length + circuit > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length + rec.charge.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec, keepKey) {
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
    if (rec.keep) recipe.addDataBool(keepKey, true)
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
    var keepKey = String((G.platinumPlant || {}).keepKey || 'grindless_pgm_keep')
    CR.recipes = []
    CR.skipped = []
    CR.clashes = []
    function skip(name, reason) {
      CR.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'crystals skipped ' + name + ': ' + reason)
    }
    loadTable().forEach(function (rec) {
      rec.recipeId = 'grindless:' + rec.type + '/' + rec.idPrefix + rec.name
      var missing = missingIds(rec)
      if (missing.length > 0) return skip(rec.type + '/' + rec.name, 'unknown id(s): ' + missing.join(', '))
      var tooBig = sizeProblem(rec)
      if (tooBig !== null) return skip(rec.type + '/' + rec.name, tooBig)
      try {
        add(event, rec, keepKey)
      } catch (e) {
        return skip(rec.type + '/' + rec.name, 'the builder failed: ' + e)
      }
      CR.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    CR.clashes = clashesOf(CR.recipes)
    if (CR.clashes.length > 0) console.error(LOG + 'crystals: recipes whose ingredients are a subset of another\'s: ' + CR.clashes.join('; '))
    console.info(LOG + 'crystals: ' + CR.recipes.length + ' recipes; skipped ' + CR.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var ARM = 'gtceu:uhv_robot_arm'
    var SENSOR = 'gtceu:uhv_sensor'
    var EMITTER = 'gtceu:uhv_emitter'
    var FIELD = 'gtceu:uhv_field_generator'
    var MOTOR = 'gtceu:uhv_electric_motor'
    var defs = [
      { machine: CR.machines.lab.machine, parts: [HULL, SENSOR, EMITTER, FIELD], research: 'grindless:fibre_bragg_grating', domain: ['4x grindless:sapphire_wafer', '2x grindless:srf_cavity', '2x grindless:ytterbium_fibre'], name: 'nuclear_clock_lab' },
      { machine: CR.machines.furnace.machine, parts: [HULL, ARM, MOTOR, SENSOR], research: 'grindless:iridium_crucible', domain: ['2x grindless:iridium_crucible', '4x grindless:hpge_crystal', '2x grindless:cvd_diamond_plate'], name: 'crystal_growth_furnace' }
    ]
    CR.controllerRecipes = []
    defs.forEach(function (d) {
      var missing = d.parts.concat([d.machine, d.research], d.domain.map(function (s) { return s.replace(/^\d+x /, '') })).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      d.parts.forEach(function (s, i) { b.itemInputs(i === 0 ? s : '3x ' + s) })
      b.itemInputs('4x #gtceu:circuits/uhv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:tritanium', 1152))
      b.itemOutputs(d.machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(1966080) })
      b.EUt(1966080).duration(1500)
      CR.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'crystals ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
