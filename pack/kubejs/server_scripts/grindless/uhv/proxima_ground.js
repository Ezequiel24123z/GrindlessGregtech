// -----------------------------------------------------------------------------------------------
// Recipes of UHV's Proxima ground (machines and recipe types: startup_scripts/grindless/uhv/proxima_ground.js; docs/eras/uhv.md,
// machines 29 and 31, lines 16, 17 and 18; package UHV-B5), generated at every server load from
// data/grindless/tables/proxima_ground.json, plus the two controllers.
//
//   gtceu:cold_trap_drilling   Proxima b's night side only (G.places + GTM's biome condition gcyr:proxima_centauri_b_opp_side): the
//                          drill family's step 13; the survey and the californium-252 source are kept, the coring head wears out 1 run
//                          in 32. The only source of the ice core and the cold-trap regolith.
//   gtceu:biomining         Proxima b only: the cultures (kept) leach the regolith into the PGM and REE liquors (their only source),
//                          or cement it with urea and calcium chloride; c4 cements lunar regolith for the first pad (the bootstrap).
//                          One recipe per table entry, id grindless:<type>/<name>; the programmed circuit picks the recipe; every
//                          recipe carries the data key of its type = <name> (its EMI line).
//   gtceu:chemical_reactor / mixer / centrifuge / assembler   GTM rows (no circuit): the tailings' calcium, urea (Bosch-Meiser),
//                          the ammonium chloride's fertiliser, the ice core's steam melt (Proxima b), the Proxima base casing and the
//                          coring head.
//   crafting               the controllers: UHV hull + 2 UV parts + 2 UHV circuits, shaped recipes grindless:crafting/<machine>.
//   hosted rows (older machines' types, id grindless:<type>/<idPrefix><name>; uhv/crystals.js's precedent):
//     gtceu:pgm_refining      EV's platinum plant, circuit 6: the PGM liquor electrowon (the plant's slots and its keep flag,
//                          global.grindless.platinumPlant.maxIO / .keepKey: the recipe refuses voiding).
//     gtceu:tholin_reforming  ZPM's tholin reformer, circuit 4, Saturn orbit: the sterilised ice organics hydrolysed to nitriles
//                          (the reformer's slots from global.grindless.zpmTitanProbes.machines).
//
// The other older rows of the package are in their own scripts: ev/extraction_cascade.js (circuit 7), ev/regolith_cell.js
// (circuit 2, the tailings) and tables/heavy_water_plant.json (circuit 3).
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the tests: global.grindless.proximaGround.recipes [{ type, name, recipeId, site, biome, ... }], .skipped, .clashes,
// .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var PG = G.proximaGround || (G.proximaGround = {})
  var TABLE = PG.table || 'kubejs/data/grindless/tables/proxima_ground.json'
  var GTM_TYPES = ['chemical_reactor', 'mixer', 'centrifuge', 'assembler']
  var SITES = ['proxima_b', 'saturn_orbit', '']
  var SATURN_ORBIT = 'grindless:saturn_orbit'
  var MAX_CHANCE = 10000

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  // the slots of the older machines whose types host a row of this table
  var HOSTED = {
    pgm_refining: function () {
      return (G.platinumPlant || {}).maxIO || null
    },
    tholin_reforming: function () {
      var io = null
      list((G.zpmTitanProbes || {}).machines).forEach(function (m) {
        if (m.type === 'tholin_reforming') io = { itemsIn: m.io[0], itemsOut: m.io[1], fluidsIn: m.io[2], fluidsOut: m.io[3] }
      })
      return io
    }
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var out = []
    Object.keys(t.types || {}).forEach(function (type) {
      var names = {}
      var circuits = {}
      var gtm = GTM_TYPES.indexOf(type) >= 0
      var hosted = HOSTED[type] !== undefined
      var def = t.types[type]
      list(def.recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var site = String(r.site || '')
        var biome = String(r.biome || '')
        var circuitOk = (gtm && circuit === 0) || (!gtm && circuit >= 1 && circuit <= 32 && circuit % 1 === 0 && !circuits[circuit])
        if (!/^[a-z0-9_]+$/.test(n) || names[n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0 ||
          SITES.indexOf(site) < 0 || (!gtm && !hosted && site === '') || (biome !== '' && biome.indexOf(':') < 0)) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration + ', site ' + site +
            ', biome ' + biome)
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
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, site: site, biome: biome,
          dataKey: def.dataKey ? String(def.dataKey) : '', hosted: hosted, idPrefix: def.idPrefix ? String(def.idPrefix) : '',
          keep: def.keep === true, circuitSlot: def.circuitSlot !== false,
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
    if (problems.length > 0) console.error(LOG + 'proxima ground: ' + TABLE + ': ' + problems.join('; '))
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
    var io = null
    if (rec.hosted) io = HOSTED[rec.type]()
    else Object.keys(PG.machines || {}).forEach(function (k) { if (PG.machines[k].type === rec.type) io = PG.machines[k].maxIO })
    if (io === null) return 'no slots known for type ' + rec.type
    var circuit = rec.circuit > 0 && rec.circuitSlot ? 1 : 0
    if (rec.itemsIn.length + rec.kept.length + circuit > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    // GTM's builder puts the type in front: grindless:<name> becomes grindless:<type>/<name>
    var recipe = event.recipes.gtceu[rec.type]('grindless:' + rec.idPrefix + rec.name)
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
    if (rec.keep) recipe.addDataBool(String((G.platinumPlant || {}).keepKey || 'grindless_pgm_keep'), true)
    if (rec.site === 'proxima_b') G.places.allow(recipe, 'proxima_b')
    if (rec.site === 'saturn_orbit') recipe.dimension(SATURN_ORBIT)
    if (rec.biome !== '') {
      // the night side: kept on the dimension alone (and logged) if this GTM build refuses the biome condition
      try {
        recipe.biome(rec.biome)
      } catch (e) {
        rec.biome = ''
        console.error(LOG + 'proxima ground ' + rec.type + '/' + rec.name + ': biome condition refused, Proxima b only: ' + e)
      }
    }
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
    PG.recipes = []
    PG.skipped = []
    PG.clashes = []
    function skip(name, reason) {
      PG.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'proxima ground skipped ' + name + ': ' + reason)
    }
    loadTable().forEach(function (rec) {
      rec.recipeId = 'grindless:' + rec.type + '/' + rec.idPrefix + rec.name
      var missing = missingIds(rec)
      if (missing.length > 0) return skip(rec.type + '/' + rec.name, 'unknown id(s): ' + missing.join(', '))
      var tooBig = sizeProblem(rec)
      if (tooBig !== null) return skip(rec.type + '/' + rec.name, tooBig)
      try {
        add(event, rec)
      } catch (e) {
        return skip(rec.type + '/' + rec.name, 'the builder failed: ' + e)
      }
      PG.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    PG.clashes = clashesOf(PG.recipes)
    if (PG.clashes.length > 0) console.error(LOG + 'proxima ground: recipes whose ingredients are a subset of another\'s: ' + PG.clashes.join('; '))
    console.info(LOG + 'proxima ground: ' + PG.recipes.length + ' recipes; skipped ' + PG.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var C = '#gtceu:circuits/uhv'
    var MOTOR = 'gtceu:uv_electric_motor'
    var PUMP = 'gtceu:uv_electric_pump'
    var M = PG.machines || {}
    // the other UHV controllers' shapes: grep "pattern: [" and "shaped(" in server_scripts/grindless/uhv/*.js (mirrors match too)
    var defs = [
      { key: 'drill', parts: [HULL, MOTOR], pattern: ['MCM', 'CHC'], ingredients: { C: C, M: MOTOR, H: HULL } },
      { key: 'heap', parts: [HULL, PUMP], pattern: ['PCP', 'CHC'], ingredients: { C: C, P: PUMP, H: HULL } }
    ]
    PG.controllerRecipes = []
    defs.forEach(function (d) {
      var m = M[d.key]
      if (!m) {
        console.error(LOG + 'proxima ground controller ' + d.key + ' skipped: no machine')
        return
      }
      var missing = d.parts.concat([m.machine]).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + m.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(m.machine, d.pattern, d.ingredients).id('grindless:crafting/' + m.name)
      PG.controllerRecipes.push('grindless:crafting/' + m.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'proxima ground ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
