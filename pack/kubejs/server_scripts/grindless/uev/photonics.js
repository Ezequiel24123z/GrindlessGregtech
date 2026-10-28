// priority: -23238
// -----------------------------------------------------------------------------------------------
// Recipes of UEV's SNSPD foundry, van der Waals stacker and photonic integration hall (machines and recipe types:
// startup_scripts/grindless/uev/photonics.js; docs/eras/uev.md, machines 11, 12 and 13, lines 18, 19, 20, 21, 22 and 27; package UEV-A6),
// generated at every server load from data/grindless/tables/photonics_uev.json, plus the recipes of the three controllers.
//
//   gtceu:snspd_fabrication / vdw_assembly / photonic_integration   one recipe per table entry, id grindless:<type>/<name>; the programmed
//                          circuit picks the recipe; every recipe carries the data key of its type = <name> (its EMI line).
//   gtceu:zone_refining (circuits 4 and 5), synchrotron (6), ion_implantation (5)   the older machines' rows of the lines (circuits 1-3,
//                          1-5 and 1-4 are taken by UV, UV/ZPM and UHV); the older MBE (circuit 3) and photonic foundry (circuit 7) rows are
//                          in photonics.json (server_scripts/grindless/uhv/photonics.js).
//   gtceu:cutter, electric_blast_furnace, chemical_reactor, assembler   the line steps GTM can run (ids grindless:<type>/<name>); the
//                          assembler also makes the UEV sensor, emitter, pump, conveyor module and piston from the UV parts.
//   crafting               the controllers: UHV hull + 2 UV parts + 2 UHV circuits, shaped recipes grindless:crafting/<machine>.
//   gtnn:optical_computer  GT--'s own recipe is removed; the hall's circuit 3 is the only recipe that makes it. gtnn:optical_mainframe is untouched.
//
// Arsine: no recipe here makes or vents it; the MBE row (circuit 3) takes it from UV's arsine step and consumes all of it.
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.uevPhotonics.recipes, .skipped, .clashes, .controllerRecipes, .removed.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var UP = G.uevPhotonics || (G.uevPhotonics = {})
  var TABLE = UP.table || 'kubejs/data/grindless/tables/photonics_uev.json'
  var COMPUTER = 'gtnn:optical_computer'
  var COMPUTER_RECIPE = 'grindless:photonic_integration/optical_computer'
  // GTM's own types: their circuit is optional (0 = none) and their slots are GTM's
  var GTM_TYPES = { cutter: true, electric_blast_furnace: true, chemical_reactor: true, assembler: true }
  // older machines' slots (items in/out, fluids in/out), from their startup scripts
  var OLDER_IO = {
    zone_refining: { itemsIn: 2, itemsOut: 2, fluidsIn: 3, fluidsOut: 2 },
    synchrotron: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
    ion_implantation: { itemsIn: 3, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 }
  }

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
      var def = t.types[type]
      var optional = GTM_TYPES[type] === true
      list(def.recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var circuitOk = (optional && circuit === 0) || (circuit >= 1 && circuit <= 32 && circuit % 1 === 0 && !circuits[circuit])
        if (!/^[a-z0-9_]+$/.test(n) || names[n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
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
        names[n] = true
        if (circuit > 0) circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'photonics: ' + TABLE + ': ' + problems.join('; '))
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
    var io = null
    if (GTM_TYPES[rec.type] === true) return null
    if (OLDER_IO[rec.type]) io = OLDER_IO[rec.type]
    else Object.keys(UP.machines || {}).forEach(function (k) { if (UP.machines[k].type === rec.type) io = UP.machines[k].maxIO })
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
    if (rec.temp > 0) {
      try {
        recipe.blastFurnaceTemp(rec.temp)
      } catch (e) {
        console.error(LOG + rec.type + '/' + rec.name + ': blastFurnaceTemp failed: ' + e)
      }
    }
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
    UP.recipes = []
    UP.skipped = []
    UP.clashes = []
    function skip(name, reason) {
      UP.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'photonics skipped ' + name + ': ' + reason)
    }
    loadTable().forEach(function (rec) {
      // GTM prefixes the type itself: grindless:<name> becomes grindless:<type>/<name>
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
      UP.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    UP.clashes = clashesOf(UP.recipes)
    if (UP.clashes.length > 0) console.error(LOG + 'photonics: recipes whose ingredients are a subset of another\'s: ' + UP.clashes.join('; '))
    console.info(LOG + 'photonics: ' + UP.recipes.length + ' recipes; skipped ' + UP.skipped.length)
  }

  // The optical computer comes only from the hall: any other recipe that outputs it (GT--'s own) goes; ours is kept by id.
  function removeOtherComputers(event) {
    UP.removed = COMPUTER
    event.remove({ output: COMPUTER, not: { id: COMPUTER_RECIPE } })
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var defs = [
      { machine: UP.machines.snspd.machine, part: 'gtceu:uv_sensor', name: UP.machines.snspd.name },
      { machine: UP.machines.stacker.machine, part: 'gtceu:uv_robot_arm', name: UP.machines.stacker.name },
      { machine: UP.machines.hall.machine, part: 'gtceu:uv_emitter', name: UP.machines.hall.name }
    ]
    UP.controllerRecipes = []
    defs.forEach(function (d) {
      var missing = [HULL, d.part, d.machine].filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(d.machine, [' C ', 'PHP', ' C '], { C: '#gtceu:circuits/uhv', P: d.part, H: HULL }).id('grindless:crafting/' + d.name)
      UP.controllerRecipes.push('grindless:crafting/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['remove', removeOtherComputers], ['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'photonics ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
