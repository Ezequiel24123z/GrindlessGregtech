// priority: -24024
// -----------------------------------------------------------------------------------------------
// Recipes of UHV's Proxima life (machines and recipe types: startup_scripts/grindless/uhv/proxima_life.js; docs/eras/uhv.md, machines
// 12, 26, 27, 28 and 30, lines 13, 14 and 15; package UHV-B4), generated at every server load from data/grindless/tables/proxima_life.json,
// plus the five controllers.
//
//   gtceu:xenoflora_rover / xenobotany / xenobiochemistry / radiotrophic   Proxima b only (G.places, gcyr:proxima_centauri_b)
//   gtceu:sample_receiving                                                Earth only (minecraft:overworld): the only consumer of the
//                          flora samples the rover alone brings back. One recipe per table entry, id grindless:<type>/<name>; the
//                          programmed circuit picks the recipe; every recipe carries the data key of its type = <name> (its EMI line).
//                          "kept" entries are GTM's non-consumed item inputs; a "chance" below 10,000 is a chanced input or output of 1
//                          (the rover wears out 1 run in 8 and gives its americium source back as often).
//   gtceu:chemical_reactor / assembler / centrifuge   GTM rows keyed by our items (no circuit): line 15's melanin extract, the
//                          melanin-chitosan composite and the flare shield panel; the rover; the Earth extracts' destinations;
//                          and F1's two casings, 2 a craft: bsl4_casing (HSS-S, PTFE, a sterilising filter) and hangar_casing
//                          (tungstensteel and naquadah alloy on a frame).
//   crafting               the controllers: UHV hull + 3 UHV component families (3 of each) + 2 UHV circuits, assembly lines grindless:assembly_line/<machine>.
//                          Each is an assembly line: station research, tritanium + soldering alloy + lubricant, 3 domain items of its own line.
//
// The older rows of the package are read elsewhere: biofoundry.json circuits 11-16 (luv/biofoundry.js) and the algae bioreactor's
// far-red row (luv/europa.js).
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the tests: global.grindless.proximaLife.recipes [{ type, name, recipeId, site, ... }], .skipped, .clashes,
// .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var PL = G.proximaLife || (G.proximaLife = {})
  var TABLE = PL.table || 'kubejs/data/grindless/tables/proxima_life.json'
  var GTM_TYPES = ['chemical_reactor', 'assembler', 'centrifuge']
  var SITES = ['proxima_b', 'earth', '']
  var MAX_CHANCE = 10000

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
      var gtm = GTM_TYPES.indexOf(type) >= 0
      list(t.types[type].recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var site = String(r.site || '')
        var circuitOk = (gtm && circuit === 0) || (!gtm && circuit >= 1 && circuit <= 32 && circuit % 1 === 0 && !circuits[circuit])
        if (!/^[a-z0-9_]+$/.test(n) || names[n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0 ||
          SITES.indexOf(site) < 0 || (!gtm && site === '')) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration + ', site ' + site)
          return
        }
        var bad = false
        var stack = function (x) {
          var chance = x.chance === undefined ? MAX_CHANCE : Number(x.chance)
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1) || !(chance >= 1 && chance <= MAX_CHANCE) ||
            (chance < MAX_CHANCE && Number(x.count) !== 1)) bad = true
          return { id: String(x.id), count: Number(x.count), chance: chance }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, site: site,
          dataKey: t.types[type].dataKey ? String(t.types[type].dataKey) : '',
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), fluidsIn: list(r.fluidsIn).map(fluid),
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
    if (problems.length > 0) console.error(LOG + 'proxima life: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    rec.fluidsIn.concat(rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    if (GTM_TYPES.indexOf(rec.type) >= 0) return null
    var def = null
    Object.keys(PL.machines || {}).forEach(function (k) { if (PL.machines[k].type === rec.type) def = PL.machines[k] })
    if (def === null) return 'no machine for type ' + rec.type
    var io = def.maxIO
    var circuit = rec.circuit > 0 ? 1 : 0
    if (rec.itemsIn.length + rec.kept.length + circuit > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    // GTM's builder puts the type in front: grindless:<name> becomes grindless:<type>/<name>
    var recipe = event.recipes.gtceu[rec.type]('grindless:' + rec.name)
    rec.itemsIn.forEach(function (x) {
      if (x.chance < MAX_CHANCE) recipe.chancedInput('1x ' + x.id, x.chance, 0)
      else recipe.itemInputs(x.count + 'x ' + x.id)
    })
    rec.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
    if (rec.circuit > 0) recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) {
      if (x.chance < MAX_CHANCE) recipe.chancedOutput('1x ' + x.id, x.chance, 0)
      else recipe.itemOutputs(x.count + 'x ' + x.id)
    })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    if (rec.site === 'proxima_b') G.places.allow(recipe, 'proxima_b')
    else if (rec.site === 'earth') recipe.dimension('minecraft:overworld')
    recipe.EUt(rec.eut).duration(rec.duration)
  }

  function keysOf(rec) {
    var keys = {}
    rec.itemsIn.concat(rec.kept).forEach(function (x) { keys['i:' + x.id] = true })
    rec.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
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
    PL.recipes = []
    PL.skipped = []
    PL.clashes = []
    function skip(name, reason) {
      PL.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'proxima life skipped ' + name + ': ' + reason)
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
      PL.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    PL.clashes = clashesOf(PL.recipes)
    if (PL.clashes.length > 0) console.error(LOG + 'proxima life: recipes whose ingredients are a subset of another\'s: ' + PL.clashes.join('; '))
    console.info(LOG + 'proxima life: ' + PL.recipes.length + ' recipes; skipped ' + PL.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var C = '#gtceu:circuits/uhv'
    var ARM = 'gtceu:uhv_robot_arm'
    var MOTOR = 'gtceu:uhv_electric_motor'
    var PUMP = 'gtceu:uhv_electric_pump'
    var SENSOR = 'gtceu:uhv_sensor'
    var CONVEYOR = 'gtceu:uhv_conveyor_module'
    var REGULATOR = 'gtceu:uhv_fluid_regulator'
    var PISTON = 'gtceu:uhv_electric_piston'
    var EMITTER = 'gtceu:uhv_emitter'
    var M = PL.machines || {}
    var defs = [
      { key: 'facility', parts: [HULL, ARM, SENSOR, CONVEYOR], research: 'grindless:carbon_nanotube_yarn', domain: ['4x grindless:cladosporium_culture', '2x grindless:bsl4_casing', '2x grindless:srf_cryomodule'] },
      { key: 'rover', parts: [HULL, MOTOR, CONVEYOR, SENSOR], research: 'grindless:proxima_rover', domain: ['4x grindless:thruster_pod', '2x grindless:hangar_casing', '2x grindless:mu_metal_shield'] },
      { key: 'greenhouse', parts: [HULL, PUMP, REGULATOR, SENSOR], research: 'grindless:sphingomonas_culture', domain: ['4x grindless:cladosporium_culture', '2x grindless:bsl4_casing', '2x grindless:silica_aerogel'] },
      { key: 'plant', parts: [HULL, PUMP, REGULATOR, PISTON], research: 'grindless:chromobacterium_culture', domain: ['4x grindless:sporosarcina_culture', '2x grindless:bsl4_casing', '2x grindless:mu_metal_shield'] },
      { key: 'vat', parts: [HULL, PUMP, REGULATOR, EMITTER], research: 'grindless:hangar_casing', domain: ['4x grindless:sphingomonas_culture', '2x grindless:bsl4_casing', '2x grindless:srf_cryomodule'] }
    ]
    PL.controllerRecipes = []
    defs.forEach(function (d) {
      var m = M[d.key]
      if (!m) {
        console.error(LOG + 'proxima life controller ' + d.key + ' skipped: no machine')
        return
      }
      var missing = d.parts.concat([m.machine, d.research], d.domain.map(function (s) { return s.replace(/^\d+x /, '') })).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + m.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + m.name)
      d.parts.forEach(function (s, i) { b.itemInputs(i === 0 ? s : '3x ' + s) })
      b.itemInputs('4x #gtceu:circuits/uhv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:tritanium', 1152))
      b.itemOutputs(m.machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(1966080) })
      b.EUt(1966080).duration(1500)
      PL.controllerRecipes.push('grindless:assembly_line/' + m.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'proxima life ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
