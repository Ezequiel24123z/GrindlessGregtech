// -----------------------------------------------------------------------------------------------
// Recipes of OpV's collector nodes and bulge collector (machines and recipe types: startup_scripts/grindless/opv/bulge_collector.js; docs/eras/opv.md,
// machines 17 and 18, line 40; package OpV-R3), generated at every server load from data/grindless/tables/bulge_collector.json, plus the two
// controllers' assembly lines. Refinery c7 (spent nodes -> Si alloy powder) is a row of tables/replication.json (server_scripts/.../replication.js).
//
//   gtceu:collector_node_assembly  collector node works: c1 Si ribbon, c2 PV film, c3 node, c4 deployed pack (4 nodes + a probe seed).
//   gtceu:bulge_light_collection   bulge collector, a generator: c1 / c2 / c3 consume 1 / 4 / 16 packs for 2^26 / 2^28 / 2^30 EU/t over one shared
//                                  duration and give back 4 / 16 / 64 spent nodes (c3 also the light census).
//   assembly_line                  the two controllers (grindless:assembly_line/<machine>), OpV parts only, each its own research item.
// Row keys as in replication.json, plus "generator" true: the EUt is written negative.
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.bulgeCollector.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var B = G.bulgeCollector || (G.bulgeCollector = {})
  var TABLE = B.table || 'kubejs/data/grindless/tables/bulge_collector.json'
  var SITE = B.site || 'grindless:terzan5_core'
  var VA_OPV = 503316480

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function strip(s) {
    return s.replace(/^\d+x /, '')
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
          var chance = x.chance === undefined ? 0 : Number(x.chance)
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1) || chance < 0 || chance > 10000 || chance % 1 !== 0) bad = true
          return { id: String(x.id), count: Number(x.count), chance: chance }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dataKey: def.dataKey ? String(def.dataKey) : '',
          site: r.site === true ? SITE : '', generator: r.generator === true,
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), wear: list(r.wear).map(stack), fluidsIn: list(r.fluidsIn).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        rec.wear.forEach(function (x) { if (!(x.chance >= 1)) bad = true })
        var hasInput = rec.itemsIn.length + rec.kept.length + rec.wear.length + rec.fluidsIn.length > 0
        var hasOutput = rec.itemsOut.length + rec.fluidsOut.length > 0
        if (bad || !hasOutput || !hasInput) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        seen[type + '/' + n] = true
        circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'bulge collector: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.wear, rec.itemsOut).forEach(function (x) {
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    rec.fluidsIn.concat(rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    var io = null
    ;(B.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
    if (io === null) return 'no slots known for type ' + rec.type
    if (rec.itemsIn.length + rec.kept.length + rec.wear.length + 1 > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu[rec.type](rec.recipeId)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    rec.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
    rec.wear.forEach(function (x) { recipe.chancedInput(x.count + 'x ' + x.id, x.chance, 0) })
    recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) {
      if (x.chance > 0) recipe.chancedOutput(x.count + 'x ' + x.id, x.chance, 0)
      else recipe.itemOutputs(x.count + 'x ' + x.id)
    })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    if (rec.site !== '') recipe.dimension(rec.site)
    recipe.EUt(rec.generator ? -rec.eut : rec.eut).duration(rec.duration)
  }

  function keysOf(rec) {
    var keys = {}
    rec.itemsIn.concat(rec.kept, rec.wear).forEach(function (x) { keys['i:' + x.id] = true })
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
    B.recipes = []
    B.skipped = []
    B.clashes = []
    function skip(name, reason) {
      B.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'bulge collector skipped ' + name + ': ' + reason)
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
      B.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    B.clashes = clashesOf(B.recipes)
    if (B.clashes.length > 0) console.error(LOG + 'bulge collector: recipes whose ingredients are a subset of another\'s: ' + B.clashes.join('; '))
    console.info(LOG + 'bulge collector: ' + B.recipes.length + ' recipes; skipped ' + B.skipped.length)
  }

  // an assembly line of OpV parts; skipped (logged) when an id is missing
  function assemblyLine(event, d) {
    var ids = d.items.map(function (s) { return strip(s) }).filter(function (id) { return id.charAt(0) !== '#' })
    var missing = ids.concat([d.output, d.research]).filter(function (id, k, a) { return a.indexOf(id) === k && !Item.exists(id) })
    d.fluids.forEach(function (f) { if (!Fluid.exists(f[0])) missing.push(f[0]) })
    if (missing.length > 0) {
      console.error(LOG + d.name + ' skipped, unknown id(s): ' + missing.join(', '))
      return null
    }
    var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
    d.items.forEach(function (s) { b.itemInputs(s) })
    d.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
    b.itemOutputs(d.output)
    b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(125829120) })
    b.EUt(d.eut).duration(d.duration)
    return 'grindless:assembly_line/' + d.name
  }

  // each controller: OpV hull, 10 OpV components of three families, OpV circuits (4 for the works, 8 for the collector), superfluid helium-3,
  // its research item and three domain inputs; OpV parts only, no OpV hatch
  var FLUIDS = [['gtceu:superfluid_helium_3', 1000], ['gtceu:soldering_alloy', 2304], ['gtceu:lubricant', 2000]]
  var CONTROLLERS = [
    { name: 'collector_node_works', research: 'grindless:cluster_sinter_casing',
      items: ['gtceu:opv_machine_hull', '4x gtceu:opv_robot_arm', '4x gtceu:opv_emitter', '2x gtceu:opv_sensor', '4x #gtceu:circuits/opv',
        '2x grindless:node_power_transmitter', '2x grindless:tpv_panel', '2x grindless:field_frozen_plate'] },
    { name: 'bulge_collector', research: 'grindless:collector_node',
      items: ['gtceu:opv_machine_hull', '4x gtceu:opv_sensor', '4x gtceu:opv_field_generator', '4x gtceu:opv_emitter', '8x #gtceu:circuits/opv',
        '2x grindless:cryo_optical_link', '2x grindless:node_power_transmitter', '2x grindless:aln_power_die'] }
  ]

  function addControllers(event) {
    B.controllerRecipes = []
    CONTROLLERS.forEach(function (c) {
      var id = assemblyLine(event, {
        name: c.name, output: 'gtceu:' + c.name, research: c.research,
        items: c.items, fluids: FLUIDS, eut: VA_OPV, duration: 2400
      })
      if (id !== null) B.controllerRecipes.push(id)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'bulge collector ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
