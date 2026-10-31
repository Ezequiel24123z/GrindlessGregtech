// priority: -21746
// -----------------------------------------------------------------------------------------------
// Recipes of OpV's tetron fab and gamma optics works (machines and recipe types: startup_scripts/grindless/opv/tetron_optics.js;
// docs/eras/opv.md, machines 1 and 2, process lines 19, 34 and 35; package OpV-B1), generated at every server load from
// data/grindless/tables/tetron_optics.json, plus the controllers' recipes.
//
//   gtceu:tetron_assembly   tetron fab, circuit 1 tetron dies, 2 tetron array (the superfluid He-3 bath is a charge, not consumed).
//   gtceu:gamma_optics      gamma optics works, circuit 1 Laue lens, 2 gamma multilayer mirror.
//   assembly_line           the controllers (OpV hull + OpV components + OpV circuits + 3 domain items, superfluid He-3, behind
//                           station research), grindless:assembly_line/<name>.
//
// Line 19's middle steps are rows of older machines, in their own files: UXV MTJ sputtering c11 (tables/spin_deposition.json), UIV ion
// slicing c8 (tables/tfln_femtosecond.json), UIV nuclear demagnetisation c6 (tables/memories_cryostat.json) and the EV extraction
// cascade c25 (ev/extraction_cascade.js). Lines 34 and 35's: UHV spark plasma sintering c14 (uhv/propulsion.js), UXV MTJ sputtering
// c12, UEV CVI c10-11 (tables/composites.json), UEV megabar c8-9 (tables/megabar.json), UHV crystal growth c24 (tables/crystals.json)
// and UV synchrotron c10-11 (tables/accelerators.json).
//
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.tetronOptics.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var TO = G.tetronOptics || (G.tetronOptics = {})
  var TABLE = TO.table || 'kubejs/data/grindless/tables/tetron_optics.json'
  var VA_OPV = 503316480
  var HE3 = 'gtceu:superfluid_helium_3'

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var out = []
    var seen = {}
    Object.keys(t.types || {}).forEach(function (type) {
      var circuits = {}
      var def = t.types[type]
      list(def.recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var circuitOk = circuit >= 1 && circuit <= 32 && circuit % 1 === 0 && !circuits[circuit]
        if (!/^[a-z0-9_]+$/.test(n) || seen[type + '/' + n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
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
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), fluidsIn: list(r.fluidsIn).map(fluid), charge: list(r.charge).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        if (bad || (rec.itemsOut.length === 0 && rec.fluidsOut.length === 0) || (rec.itemsIn.length === 0 && rec.fluidsIn.length === 0)) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        seen[type + '/' + n] = true
        circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'tetron_optics: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.itemsOut).forEach(function (x) {
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    rec.fluidsIn.concat(rec.charge, rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    var io = null
    ;(TO.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
    if (io === null) return 'no slots known for type ' + rec.type
    if (rec.itemsIn.length + rec.kept.length + 1 > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length + rec.charge.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu[rec.type](rec.recipeId)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    rec.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
    recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.charge.forEach(function (x) { recipe.notConsumableFluid(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) {
      if (x.chance >= 10000) recipe.itemOutputs(x.count + 'x ' + x.id)
      else recipe.chancedOutput(x.count + 'x ' + x.id, x.chance, 0)
    })
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
    TO.recipes = []
    TO.skipped = []
    TO.clashes = []
    function skip(name, reason) {
      TO.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'tetron_optics skipped ' + name + ': ' + reason)
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
      TO.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    TO.clashes = clashesOf(TO.recipes)
    if (TO.clashes.length > 0) console.error(LOG + 'tetron_optics: recipes whose ingredients are a subset of another\'s: ' + TO.clashes.join('; '))
    console.info(LOG + 'tetron_optics: ' + TO.recipes.length + ' recipes; skipped ' + TO.skipped.length)
  }

  // QR-OpV (docs/eras/opv.md, Controllers): OpV hull, the components of the table, 4 OpV circuits, 1,000 mB superfluid He-3 and three
  // domain inputs, at VA[OpV] for 2,400 t behind station research on an item of the machine's own line
  function addControllers(event) {
    var HULL = 'gtceu:opv_machine_hull'
    var defs = [
      { name: 'tetron_fab', research: 'grindless:inas_al_wafer',
        parts: ['4x gtceu:opv_robot_arm', '4x gtceu:opv_sensor', '2x gtceu:opv_field_generator'],
        domain: ['2x grindless:cryo_cmos_die', '2x grindless:nb_tsv_interposer', '2x grindless:chain_field_coil'] },
      { name: 'gamma_optics_works', research: 'grindless:hpge_compton_crystal',
        parts: ['4x gtceu:opv_emitter', '4x gtceu:opv_sensor', '2x gtceu:opv_robot_arm'],
        domain: ['2x grindless:field_frozen_plate', '2x grindless:th229_lasing_crystal', '2x grindless:opv_harmonic_drive'] }
    ]
    TO.controllerRecipes = []
    defs.forEach(function (d) {
      var machine = 'gtceu:' + d.name
      var strip = function (s) { return s.replace(/^\d+x /, '') }
      var ids = [HULL, machine, d.research].concat(d.parts.map(strip), d.domain.map(strip))
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (!Fluid.exists(HE3)) missing.push(HE3)
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      b.itemInputs(HULL)
      d.parts.forEach(function (s) { b.itemInputs(s) })
      b.itemInputs('4x #gtceu:circuits/opv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of(HE3, 1000))
      b.itemOutputs(machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(VA_OPV) })
      b.EUt(VA_OPV).duration(2400)
      TO.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'tetron_optics ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
