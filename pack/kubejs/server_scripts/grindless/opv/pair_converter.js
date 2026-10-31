// priority: -21724
// -----------------------------------------------------------------------------------------------
// Recipes of OpV's magnetic pair converter (machine and recipe type: startup_scripts/grindless/opv/pair_converter.js; docs/eras/opv.md,
// machine 12, line 29; package OpV-E1), generated at every server load from data/grindless/tables/pair_converter.json, plus the
// controller's assembly_line recipe.
//
//   gtceu:magnetic_pair_production  magnetic pair converter, circuit 1 boil the seed plasma (an empty Penning trap in exchange, nine
//                                   times in ten) + 2 seal the cell. Only at SGR 1806-20 orbit.
//
// Older rows of the package, in their own tables and files: positron accumulator c5 (tables/antimatter.json, UHV-A6's machine), EB c23
// (tables/electron_beam.json, UEV-C2's machine).
// Row keys: "site" true puts recipe.dimension(sgr1806_orbit) on it; "kept" are not consumed; "wear" are chanced inputs; an output with a
// "chance" is a chanced output (count 1).
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.pairConverter.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var PC = G.pairConverter || (G.pairConverter = {})
  var TABLE = PC.table || 'kubejs/data/grindless/tables/pair_converter.json'
  var SITE = PC.site || 'grindless:sgr1806_orbit'

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
          var chance = x.chance === undefined ? 0 : Number(x.chance)
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1) || chance < 0 || chance > 10000 || chance % 1 !== 0) bad = true
          return { id: String(x.id), count: Number(x.count), chance: chance }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dataKey: def.dataKey ? String(def.dataKey) : '',
          site: r.site === true ? SITE : '',
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
    if (problems.length > 0) console.error(LOG + 'pair_converter: ' + TABLE + ': ' + problems.join('; '))
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
    ;(PC.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
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
    recipe.EUt(rec.eut).duration(rec.duration)
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
    PC.recipes = []
    PC.skipped = []
    PC.clashes = []
    function skip(name, reason) {
      PC.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'pair_converter skipped ' + name + ': ' + reason)
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
      PC.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    PC.clashes = clashesOf(PC.recipes)
    if (PC.clashes.length > 0) console.error(LOG + 'pair_converter: recipes whose ingredients are a subset of another\'s: ' + PC.clashes.join('; '))
    console.info(LOG + 'pair_converter: ' + PC.recipes.length + ' recipes; skipped ' + PC.skipped.length)
  }

  // the converter's own controller: two OpV field generators and emitters flank an OpV sensor around an OpV hull, cooled by superfluid
  // helium-3 (the UEV-C2 polariser's output); researched with the seed plasma itself, the magnetar's only product so far.
  function addControllers(event) {
    var HULL = 'gtceu:opv_machine_hull'
    PC.controllerRecipes = []
    var items = ['4x gtceu:opv_field_generator', '4x gtceu:opv_emitter', '2x gtceu:opv_sensor', '2x grindless:gamma_laser_module',
      '2x grindless:chain_field_coil', '2x grindless:field_frozen_plate']
    var ids = items.map(function (s) { return s.replace(/^\d+x /, '') }).concat([HULL, 'grindless:seed_positron_plasma', 'gtceu:magnetic_pair_converter'])
    var missing = ids.filter(function (id) { return !Item.exists(id) })
    if (!Fluid.exists('gtceu:superfluid_helium_3')) missing.push('gtceu:superfluid_helium_3')
    if (missing.length > 0) {
      console.error(LOG + 'magnetic_pair_converter controller recipe skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:magnetic_pair_converter')
    b.itemInputs(HULL)
    items.forEach(function (s) { b.itemInputs(s) })
    b.itemInputs('4x #gtceu:circuits/opv')
    b.inputFluids(Fluid.of('gtceu:superfluid_helium_3', 1000))
    b.itemOutputs('gtceu:magnetic_pair_converter')
    b.stationResearch(function (r) { return r.researchStack(Item.of('grindless:seed_positron_plasma')).CWUt(64).EUt(503316480) })
    b.EUt(503316480).duration(2400)
    PC.controllerRecipes.push('grindless:assembly_line/magnetic_pair_converter')
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'pair_converter ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
