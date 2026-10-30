// priority: -26204
// -----------------------------------------------------------------------------------------------
// Recipes of UXV's SHeQUID works and MNT collider (machines and recipe types: startup_scripts/grindless/uxv/shequid_mnt.js; docs/eras/uxv.md,
// machines 6 and 7, process lines 18, 24 and 43; package UXV-A6), generated at every server load from data/grindless/tables/shequid_mnt.json,
// plus the controllers' recipes and the UXV sensor's assembly line.
//
//   gtceu:shequid_assembly         SHeQUID works, circuit 1 weak-link cell, 2 SHeQUID gyro (the warmed He-II goes back to UV's cold works).
//   gtceu:multinucleon_transfer    MNT collider, circuit 1 collision (the gas stopping cell is not consumed), 2 gas catcher, 3 MR-TOF,
//                                  4 island chart.
//   assembler                      line 43's last step, the gas stopping cell (id grindless:assembler/gas_stopping_cell).
//   assembly_line                  the two controllers (UIV hull + UIV parts + mainframes + UIV circuits + 3 domain items, 6N helium,
//                                  soldering alloy, lubricant, behind station research) and the UXV sensor (research: the SHeQUID gyro),
//                                  grindless:assembly_line/<name>.
//
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.shequidMnt.recipes, .skipped, .clashes, .controllerRecipes, .sensorRecipe.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uxv] '
  var G = global.grindless || (global.grindless = {})
  var SM = G.shequidMnt || (G.shequidMnt = {})
  var TABLE = SM.table || 'kubejs/data/grindless/tables/shequid_mnt.json'
  var GTM_TYPES = { assembler: true }

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
        var circuitOk = ((optional && circuit === 0) || (circuit >= 1 && circuit <= 32 && circuit % 1 === 0)) && !circuits[circuit]
        if (!/^[a-z0-9_]+$/.test(n) || seen[type + '/' + n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
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
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dataKey: def.dataKey ? String(def.dataKey) : '',
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), fluidsIn: list(r.fluidsIn).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        if (bad || (rec.itemsOut.length === 0 && rec.fluidsOut.length === 0) || (rec.itemsIn.length === 0 && rec.fluidsIn.length === 0)) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        seen[type + '/' + n] = true
        if (circuit > 0) circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'shequid_mnt: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.itemsOut).forEach(function (x) {
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    rec.fluidsIn.concat(rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    if (GTM_TYPES[rec.type] === true) return null
    var io = null
    ;(SM.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
    if (io === null) return 'no slots known for type ' + rec.type
    var circuit = rec.circuit > 0 ? 1 : 0
    if (rec.itemsIn.length + rec.kept.length + circuit > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
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
    rec.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
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
    SM.recipes = []
    SM.skipped = []
    SM.clashes = []
    function skip(name, reason) {
      SM.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'shequid_mnt skipped ' + name + ': ' + reason)
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
      SM.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    SM.clashes = clashesOf(SM.recipes)
    if (SM.clashes.length > 0) console.error(LOG + 'shequid_mnt: recipes whose ingredients are a subset of another\'s: ' + SM.clashes.join('; '))
    console.info(LOG + 'shequid_mnt: ' + SM.recipes.length + ' recipes; skipped ' + SM.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uiv_machine_hull'
    var HE = 'gtceu:he_6n'
    var defs = [
      { name: 'shequid_works', mainframe: 'gtnn:optical_mainframe', research: 'grindless:nanoaperture_array',
        parts: ['2x gtceu:uiv_field_generator', '2x gtceu:uiv_electric_pump'],
        domain: ['2x grindless:mu_metal_foil', '2x grindless:sin_membrane', '2x grindless:mtj_die'] },
      { name: 'mnt_collider', mainframe: 'gtnn:spintronic_mainframe', research: 'grindless:cm248_target',
        parts: ['gtceu:uxv_sensor', '2x gtceu:uiv_field_generator', '2x gtceu:uiv_electric_pump'],
        domain: ['2x grindless:gas_stopping_cell', '2x grindless:u238_ion_source', '2x grindless:mu_metal_foil'] }
    ]
    SM.controllerRecipes = []
    defs.forEach(function (d) {
      var machine = 'gtceu:' + d.name
      var strip = function (s) { return s.replace(/^\d+x /, '') }
      var ids = [HULL, d.mainframe, machine, d.research].concat(d.parts.map(strip), d.domain.map(strip))
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (!Fluid.exists(HE)) missing.push(HE)
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      b.itemInputs(HULL)
      d.parts.forEach(function (s) { b.itemInputs(s) })
      b.itemInputs('2x ' + d.mainframe)
      b.itemInputs('4x #gtceu:circuits/uiv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of(HE, 1000), Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000))
      b.itemOutputs(machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(7864320) })
      b.EUt(7864320).duration(1500)
      SM.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // line 18's last step: the gyro's SQUID readout, an NV-diamond chip, a second MTJ die and the UIV sensor, cooled by 6N helium
  function addSensor(event) {
    var out = 'gtceu:uxv_sensor'
    var inputs = ['grindless:shequid_gyro', 'grindless:nv_diamond_chip', 'grindless:mtj_die', 'gtceu:uiv_sensor', 'gtceu:iridium_plate', 'gtceu:osmium_plate']
    var missing = inputs.concat([out]).filter(function (id) { return !Item.exists(id) })
    if (!Fluid.exists('gtceu:he_6n')) missing.push('gtceu:he_6n')
    SM.sensorRecipe = null
    if (missing.length > 0) {
      console.error(LOG + 'uxv_sensor assembly line skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:uxv_sensor')
    b.itemInputs('grindless:shequid_gyro')
    b.itemInputs('2x grindless:nv_diamond_chip')
    b.itemInputs('grindless:mtj_die')
    b.itemInputs('gtceu:uiv_sensor')
    b.itemInputs('4x gtceu:iridium_plate')
    b.itemInputs('4x gtceu:osmium_plate')
    b.itemInputs('2x #gtceu:circuits/uiv')
    b.inputFluids(Fluid.of('gtceu:he_6n', 1000), Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 1000))
    b.itemOutputs(out)
    b.stationResearch(function (r) { return r.researchStack(Item.of('grindless:shequid_gyro')).CWUt(64).EUt(7864320) })
    b.EUt(7864320).duration(1200)
    SM.sensorRecipe = 'grindless:assembly_line/uxv_sensor'
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers], ['sensor', addSensor]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'shequid_mnt ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
