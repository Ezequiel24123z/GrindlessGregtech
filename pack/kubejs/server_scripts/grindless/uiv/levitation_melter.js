// priority: -24582
// -----------------------------------------------------------------------------------------------
// Recipes of UIV's levitation melter (machine and recipe type: startup_scripts/grindless/uiv/levitation_melter.js; docs/eras/uiv.md, machine 2,
// lines 2, 4, 5, 7, 8, 9 and 39; package UIV-A3), generated at every server load from data/grindless/tables/levitation_melter.json, plus the
// controller's recipe.
//
//   gtceu:levitation_melting   circuit 1 RHEA ingot, 2 Wf/RHEA billet, 3 melted Ti-50, 4 Zr-Ti-Cu-Ni-Be glass, 5 PrNi5; each carries the data
//                              key = <name> (its EMI line). Ids grindless:levitation_melting/<name>.
//   gtceu:mixer, electrolyzer, chemical_reactor, electric_blast_furnace, assembler   the steps GTM can run (the master alloy, the BeO
//                              electrolysis, the Nb2O5 reduction, the RHEA homogenisation, the coil block, the sled charge and the UIV conveyor).
//   gtceu:hot_rolling          the RHEA slab to plate (circuit 4; EV's generated rows use 1 to 3); the hot strip mill's own type.
//   crafting                   the controller: UEV hull + 2 UEV electric pistons + 2 optical computers, grindless:crafting/levitation_melter.
//
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.levitationMelter.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uiv] '
  var G = global.grindless || (global.grindless = {})
  var LM = G.levitationMelter || (G.levitationMelter = {})
  var TABLE = LM.table || 'kubejs/data/grindless/tables/levitation_melter.json'
  var GTM_TYPES = { assembler: true, mixer: true, electrolyzer: true, chemical_reactor: true, electric_blast_furnace: true }
  // the hot strip mill's own type (startup_scripts/grindless/ev/combined_cycle_and_hot_mill.js, HM.maxIO)
  var HOT_ROLLING_IO = { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 }

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
        if (!/^[a-z0-9_]+$/.test(n) || seen[n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
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
          temp: def.temp ? Number(def.temp) : 0,
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
    if (problems.length > 0) console.error(LOG + 'levitation melter: ' + TABLE + ': ' + problems.join('; '))
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
    if (LM.machine && LM.machine.type === rec.type) io = LM.machine.maxIO
    else if (rec.type === 'hot_rolling') io = HOT_ROLLING_IO
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
    if (rec.temp > 0) recipe.blastFurnaceTemp(rec.temp)
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
    LM.recipes = []
    LM.skipped = []
    LM.clashes = []
    function skip(name, reason) {
      LM.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'levitation melter skipped ' + name + ': ' + reason)
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
      LM.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    LM.clashes = clashesOf(LM.recipes)
    if (LM.clashes.length > 0) console.error(LOG + 'levitation melter: recipes whose ingredients are a subset of another\'s: ' + LM.clashes.join('; '))
    console.info(LOG + 'levitation melter: ' + LM.recipes.length + ' recipes; skipped ' + LM.skipped.length)
  }

  function addController(event) {
    var HULL = 'gtceu:uev_machine_hull'
    var PISTON = 'grindless:uev_electric_piston'
    var COMPUTER = 'gtnn:optical_computer'
    var machine = LM.machine.machine
    LM.controllerRecipes = []
    var missing = [HULL, PISTON, COMPUTER, machine].filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'levitation melter controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped(machine, ['OPO', 'PHP'], { O: COMPUTER, P: PISTON, H: HULL }).id('grindless:crafting/levitation_melter')
    LM.controllerRecipes.push('grindless:crafting/levitation_melter')
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controller', addController]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'levitation melter ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
