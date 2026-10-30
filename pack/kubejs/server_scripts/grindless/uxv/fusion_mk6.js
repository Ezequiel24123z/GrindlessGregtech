// -----------------------------------------------------------------------------------------------
// Recipes of UXV's Mk6 fusion ring, the stellar burning ring (machine: startup_scripts/grindless/uxv/fusion_mk6.js; docs/eras/uxv.md,
// machine 9 and "Fusion"; package UXV-A7), generated at every server load from data/grindless/tables/fusion_mk6.json, plus the controller.
//
//   gtceu:fusion_reactor   the Mk6 ring, c1-c4: one fuel (c1 two), one plasma each (a row with "start" gets fusionStartEU).
//   gtceu:assembler        grindless:uxv_fusion_casing (line 38): wf_rhea_billet + w184_cvi_preform + mh_winding + field generator + frame + he_6n.
//   gtceu:assembly_line    the controller grindless:assembly_line/uxv_fusion_reactor: UXV hull + UXV parts, researched with the Mk5 controller.
//
// The converter and quench rows are zpm/fusion.js's (addMk6Converter, addMk6Quench).
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.fusionMk6.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uxv/fusion_mk6] '
  var G = global.grindless || (global.grindless = {})
  var MK6 = G.fusionMk6 || (G.fusionMk6 = {})
  var TABLE = MK6.table || 'kubejs/data/grindless/tables/fusion_mk6.json'

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var out = []
    var seen = {}
    Object.keys(t.types || {}).forEach(function (type) {
      list(t.types[type].recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var start = r.start === undefined ? 0 : Number(r.start)
        if (!/^[a-z0-9_]+$/.test(n) || seen[n] || Number(r.circuit) !== 0 || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0 ||
          (r.start !== undefined && !(start > 0 && start % 1 === 0))) {
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
        var rec = { type: type, name: n, eut: eut, duration: duration, start: start,
          itemsIn: list(r.itemsIn).map(stack), fluidsIn: list(r.fluidsIn).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        if (bad || (rec.itemsOut.length === 0 && rec.fluidsOut.length === 0) || (rec.itemsIn.length === 0 && rec.fluidsIn.length === 0)) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        seen[n] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.itemsOut).forEach(function (x) {
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    rec.fluidsIn.concat(rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu[rec.type](rec.recipeId)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    recipe.EUt(rec.eut).duration(rec.duration)
    if (rec.start > 0) recipe.fusionStartEU(rec.start)
  }

  function keysOf(rec) {
    var keys = {}
    rec.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    rec.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
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
    MK6.recipes = []
    MK6.skipped = []
    MK6.clashes = []
    function skip(name, reason) {
      MK6.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'skipped ' + name + ': ' + reason)
    }
    loadTable().forEach(function (rec) {
      rec.recipeId = 'grindless:' + rec.name
      var missing = missingIds(rec)
      if (missing.length > 0) return skip(rec.type + '/' + rec.name, 'unknown id(s): ' + missing.join(', '))
      try {
        add(event, rec)
      } catch (e) {
        return skip(rec.type + '/' + rec.name, 'the builder failed: ' + e)
      }
      MK6.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    MK6.clashes = clashesOf(MK6.recipes)
    if (MK6.clashes.length > 0) console.error(LOG + 'recipes whose ingredients are a subset of another\'s: ' + MK6.clashes.join('; '))
    console.info(LOG + MK6.recipes.length + ' recipes; skipped ' + MK6.skipped.length)
  }

  // docs/eras/uxv.md "Voltages and controllers", machine 9: UXV hull + UXV components, researched with the Mk5 controller; era fluid
  // stellar_hydrogen_cut, domain inputs uxv_fusion_casing, uxv_field_generator, uxv_electric_pump
  function addController(event) {
    var HULL = 'gtceu:uxv_machine_hull'
    var MOTOR = 'grindless:uxv_electric_motor'
    var PUMP = 'grindless:uxv_electric_pump'
    var FIELD = 'grindless:uxv_field_generator'
    var CASING = 'grindless:uxv_fusion_casing'
    var MACHINE = 'gtceu:uxv_fusion_reactor'
    var RESEARCH = 'gtceu:uiv_fusion_reactor'
    MK6.controllerRecipes = []
    var ids = [HULL, MOTOR, PUMP, FIELD, CASING, MACHINE, RESEARCH]
    var missing = ids.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:uxv_fusion_reactor')
    b.itemInputs(HULL)
    b.itemInputs('2x ' + MOTOR)
    b.itemInputs('2x ' + PUMP)
    b.itemInputs('2x ' + FIELD)
    b.itemInputs('2x ' + CASING)
    b.itemInputs('4x #gtceu:circuits/uxv')
    b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:stellar_hydrogen_cut', 1000))
    b.itemOutputs(MACHINE)
    b.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(31457280) })
    b.EUt(31457280).duration(1800)
    MK6.controllerRecipes.push('grindless:assembly_line/uxv_fusion_reactor')
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controller', addController]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + s[0] + ' failed: ' + e)
      }
    })
  })
})()
