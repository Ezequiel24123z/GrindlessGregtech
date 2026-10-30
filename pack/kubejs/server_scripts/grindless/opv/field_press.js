// -----------------------------------------------------------------------------------------------
// Recipes of OpV's field-frozen press (machine and recipe type: startup_scripts/grindless/opv/field_press.js; docs/eras/opv.md, machine 13,
// lines 3 and 45; package OpV-A3), generated at every server load from data/grindless/tables/field_press.json, plus the controller's
// assembly line.
//
//   gtceu:field_freezing  field-frozen press, c1 four W-Re canned stacks -> billet + spent cans, c2 billet -> field-frozen plates,
//                         c3 plates + tungsten steel frame -> field-frozen casing. Only at SGR 1806-20's orbit.
//   assembly_line         the controller (grindless:assembly_line/field_frozen_press): OpV parts only, no field generator and no OpV hatch
//                         (they need its plate).
//
// Older rows of the package, in their own tables and files: electron beam c22 (the W-Re can and its re-melt, tables/electron_beam.json).
// Row keys: "site" true puts recipe.dimension(sgr1806_orbit) on it; "kept" are not consumed; "wear" are chanced inputs; an output with a
// "chance" is a chanced output (count 1).
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.fieldPress.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var FP = G.fieldPress || (G.fieldPress = {})
  var TABLE = FP.table || 'kubejs/data/grindless/tables/field_press.json'
  var SITE = FP.site || 'grindless:sgr1806_orbit'
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
    if (problems.length > 0) console.error(LOG + 'field_press: ' + TABLE + ': ' + problems.join('; '))
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
    ;(FP.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
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
    FP.recipes = []
    FP.skipped = []
    FP.clashes = []
    function skip(name, reason) {
      FP.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'field_press skipped ' + name + ': ' + reason)
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
      FP.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    FP.clashes = clashesOf(FP.recipes)
    if (FP.clashes.length > 0) console.error(LOG + 'field_press: recipes whose ingredients are a subset of another\'s: ' + FP.clashes.join('; '))
    console.info(LOG + 'field_press: ' + FP.recipes.length + ' recipes; skipped ' + FP.skipped.length)
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
    b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(d.cwut).EUt(d.researchEut) })
    b.EUt(d.eut).duration(d.duration)
    return 'grindless:assembly_line/' + d.name
  }

  // the controller: 10 OpV components of three families and 4 OpV circuits on the OpV hull, researched with the chain lamina stack. Nothing
  // in it needs the press's plate: no field generator, no OpV hatch (the bootstrap of docs/eras/opv.md machine 13).
  function addController(event) {
    FP.controllerRecipes = []
    var id = assemblyLine(event, {
      name: 'field_frozen_press', output: 'gtceu:field_frozen_press', research: 'grindless:chain_lamina_stack', cwut: 64, researchEut: 125829120,
      items: ['gtceu:opv_machine_hull', '4x gtceu:opv_electric_piston', '4x gtceu:opv_electric_motor', '2x gtceu:opv_robot_arm', '4x #gtceu:circuits/opv',
        '2x grindless:chain_field_coil', '2x gtceu:chain_strand_single_cable', '4x grindless:chain_lamina_stack'],
      fluids: [['gtceu:superfluid_helium_3', 1000], ['gtceu:soldering_alloy', 2304], ['gtceu:lubricant', 2000]],
      eut: VA_OPV, duration: 2400
    })
    if (id !== null) FP.controllerRecipes.push(id)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controller', addController]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'field_press ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
