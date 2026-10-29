// priority: -24636
// -----------------------------------------------------------------------------------------------
// Recipes of UIV's polarised proton source and Mk5 fusion ring, lines 7 and 25-29 (machines and recipe type:
// startup_scripts/grindless/uiv/mk5.js; docs/eras/uiv.md, machines 9 and 10; package UIV-A9), generated at every server load from
// data/grindless/tables/mk5.json, plus the controllers' recipes.
//
//   gtceu:proton_polarisation   polarised proton source, circuit 1 detritiated protium, 2 Li-6H, 3 15NH3.
//   gtceu:fusion_reactor        the Mk5 ring: three premixed fuels, one plasma each (a row with "start" gets fusionStartEU).
//   chemical_reactor, compressor, mixer, centrifuge, assembler   the line steps GTM can run (ids grindless:<type>/<name>).
//   assembly_line               the controllers: UIV hull + 2 UIV parts + 2 optical mainframes + UIV circuits + 3 line items, with
//                               soldering alloy, lubricant and neutronium, behind station research, grindless:assembly_line/<machine>.
//
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.mk5.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uiv] '
  var G = global.grindless || (global.grindless = {})
  var MK = G.mk5 || (G.mk5 = {})
  var TABLE = MK.table || 'kubejs/data/grindless/tables/mk5.json'
  var GTM_TYPES = {
    assembler: true, chemical_reactor: true, compressor: true, mixer: true, centrifuge: true, fusion_reactor: true
  }

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
      var optional = GTM_TYPES[type] === true
      list(def.recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var start = r.start === undefined ? 0 : Number(r.start)
        var circuitOk = ((optional && circuit === 0) || (circuit >= 1 && circuit <= 32 && circuit % 1 === 0)) && !circuits[circuit]
        if (!/^[a-z0-9_]+$/.test(n) || seen[n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0 ||
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
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, start: start, dataKey: def.dataKey ? String(def.dataKey) : '',
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), fluidsIn: list(r.fluidsIn).map(fluid), charge: list(r.charge).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        if (bad || (rec.itemsOut.length === 0 && rec.fluidsOut.length === 0) || (rec.itemsIn.length === 0 && rec.fluidsIn.length === 0)) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        seen[n] = true
        if (circuit > 0) circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'mk5: ' + TABLE + ': ' + problems.join('; '))
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
    if (GTM_TYPES[rec.type] === true) return null
    var io = MK.source && MK.source.type === rec.type ? MK.source.maxIO : null
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
    rec.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    recipe.EUt(rec.eut).duration(rec.duration)
    if (rec.start > 0) recipe.fusionStartEU(rec.start)
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
    MK.recipes = []
    MK.skipped = []
    MK.clashes = []
    function skip(name, reason) {
      MK.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'mk5 skipped ' + name + ': ' + reason)
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
      MK.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    MK.clashes = clashesOf(MK.recipes)
    if (MK.clashes.length > 0) console.error(LOG + 'mk5: recipes whose ingredients are a subset of another\'s: ' + MK.clashes.join('; '))
    console.info(LOG + 'mk5: ' + MK.recipes.length + ' recipes; skipped ' + MK.skipped.length)
  }

  // docs/eras/uiv.md "Voltages and controllers": UIV hull + 2 UIV components + 2 optical mainframes, here raised to an assembly line
  function addControllers(event) {
    var HULL = 'gtceu:uiv_machine_hull'
    var MAINFRAME = 'gtnn:optical_mainframe'
    var defs = [
      { name: 'polarised_proton_source', part: 'grindless:uiv_electric_pump', research: 'grindless:cps_wetted_mesh', domain: ['2x grindless:li6_hydride', '2x grindless:first_wall_tile', '2x grindless:divertor_cassette'] },
      { name: 'uiv_fusion_reactor', part: 'grindless:uiv_electric_piston', research: 'grindless:divertor', domain: ['2x grindless:first_wall_tile', '2x grindless:li_sn_armoured_tile', '2x grindless:cps_wetted_mesh'] }
    ]
    MK.controllerRecipes = []
    defs.forEach(function (d) {
      var machine = 'gtceu:' + d.name
      var ids = [HULL, d.part, MAINFRAME, machine, d.research].concat(d.domain.map(function (s) { return s.replace(/^\d+x /, '') }))
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      b.itemInputs(HULL)
      b.itemInputs('2x ' + d.part)
      b.itemInputs('2x ' + MAINFRAME)
      b.itemInputs('4x #gtceu:circuits/uiv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:neutronium', 576))
      b.itemOutputs(machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(7864320) })
      b.EUt(7864320).duration(1500)
      MK.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'mk5 ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
