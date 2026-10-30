// priority: -26213
// -----------------------------------------------------------------------------------------------
// Recipes of UXV's MTJ sputter cluster and oxide PLD chamber (machines and recipe types: startup_scripts/grindless/uxv/spin_deposition.js;
// docs/eras/uxv.md, machines 1 and 2, process lines 10, 11 and 41; package UXV-A4), generated at every server load from
// data/grindless/tables/spin_deposition.json, plus the controllers' recipes and the KrF excimer laser's assembly line.
//
//   gtceu:mtj_sputtering          MTJ sputter cluster, circuit 1 MTJ stack, 2 MRAM stack, 3 SAF track, 4 STNO stack (argon in, argon out;
//                                 the CoFeB target comes back spent, overspray as powder).
//   gtceu:pulsed_laser_deposition oxide PLD chamber, circuit 1 SrRuO3 electrode, 2 BiFeO3 film, 3 ME switch (the KrF laser is not consumed).
//   mixer, assembler, chemical_reactor   line 41's steps GTM can run (ids grindless:<type>/<name>): the Kr/F2 premix, the discharge tube
//                                 blank, the pulsed power head, the CoFe target, the conditioned tube.
//   assembly_line                 the two controllers (UIV hull + 2 UIV parts + 2 optical mainframes + UIV circuits + 3 domain items,
//                                 6N helium, soldering alloy, lubricant, behind station research) and the KrF excimer laser itself
//                                 (research: the conditioned discharge tube), grindless:assembly_line/<name>.
//
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.spinDeposition.recipes, .skipped, .clashes, .controllerRecipes, .laserRecipe.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uxv] '
  var G = global.grindless || (global.grindless = {})
  var SD = G.spinDeposition || (G.spinDeposition = {})
  var TABLE = SD.table || 'kubejs/data/grindless/tables/spin_deposition.json'
  var GTM_TYPES = { assembler: true, chemical_reactor: true, mixer: true }

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
        if (circuit > 0) circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'spin_deposition: ' + TABLE + ': ' + problems.join('; '))
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
    if (GTM_TYPES[rec.type] === true) return null
    var io = null
    ;(SD.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
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
    SD.recipes = []
    SD.skipped = []
    SD.clashes = []
    function skip(name, reason) {
      SD.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'spin_deposition skipped ' + name + ': ' + reason)
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
      SD.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    SD.clashes = clashesOf(SD.recipes)
    if (SD.clashes.length > 0) console.error(LOG + 'spin_deposition: recipes whose ingredients are a subset of another\'s: ' + SD.clashes.join('; '))
    console.info(LOG + 'spin_deposition: ' + SD.recipes.length + ' recipes; skipped ' + SD.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uiv_machine_hull'
    var MAINFRAME = 'gtnn:optical_mainframe'
    var HE = 'gtceu:he_6n'
    var defs = [
      { name: 'mtj_sputter_cluster', part: 'gtceu:uiv_sensor', research: 'grindless:cofeb_target', domain: ['2x grindless:ta_seed_target', '2x grindless:mgo_target', '2x grindless:mu_metal_foil'] },
      { name: 'oxide_pld_chamber', part: 'gtceu:uiv_emitter', research: 'grindless:srruo3_target', domain: ['2x grindless:krf_excimer_laser', '2x grindless:vuv_caf2_optic', '2x grindless:pt_sheet'] }
    ]
    SD.controllerRecipes = []
    defs.forEach(function (d) {
      var machine = 'gtceu:' + d.name
      var ids = [HULL, d.part, MAINFRAME, machine, d.research].concat(d.domain.map(function (s) { return s.replace(/^\d+x /, '') }))
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (!Fluid.exists(HE)) missing.push(HE)
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      b.itemInputs(HULL)
      b.itemInputs('2x ' + d.part)
      b.itemInputs('2x ' + MAINFRAME)
      b.itemInputs('4x #gtceu:circuits/uiv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of(HE, 1000), Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000))
      b.itemOutputs(machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(7864320) })
      b.EUt(7864320).duration(1500)
      SD.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // line 41 step 5: tube + pulsed power head + two windows + sensor + circuits, cooled by 6N helium
  function addLaser(event) {
    var out = 'grindless:krf_excimer_laser'
    var inputs = ['grindless:krf_discharge_tube', 'grindless:pulsed_power_head', 'grindless:vuv_caf2_optic', 'gtceu:uev_sensor']
    var missing = inputs.concat([out]).filter(function (id) { return !Item.exists(id) })
    if (!Fluid.exists('gtceu:he_6n')) missing.push('gtceu:he_6n')
    SD.laserRecipe = null
    if (missing.length > 0) {
      console.error(LOG + 'krf_excimer_laser assembly line skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:krf_excimer_laser')
    b.itemInputs('grindless:krf_discharge_tube')
    b.itemInputs('grindless:pulsed_power_head')
    b.itemInputs('2x grindless:vuv_caf2_optic')
    b.itemInputs('gtceu:uev_sensor')
    b.itemInputs('2x #gtceu:circuits/uhv')
    b.inputFluids(Fluid.of('gtceu:he_6n', 1000), Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 1000))
    b.itemOutputs(out)
    b.stationResearch(function (r) { return r.researchStack(Item.of('grindless:krf_discharge_tube')).CWUt(48).EUt(7864320) })
    b.EUt(7864320).duration(1200)
    SD.laserRecipe = 'grindless:assembly_line/krf_excimer_laser'
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers], ['laser', addLaser]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'spin_deposition ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
