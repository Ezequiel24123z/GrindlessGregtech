// -----------------------------------------------------------------------------------------------
// Recipes of UEV's megabar press (machine and recipe type: startup_scripts/grindless/uev/megabar.js; docs/eras/uev.md, machine 5, lines 7, 8
// and 9; package UEV-A3), generated at every server load from data/grindless/tables/megabar.json, plus the controller's recipe and the
// removal of GTM's own routes to (La,Y)H10 wire.
//
//   gtceu:megabar_synthesis   one recipe per table entry, id grindless:megabar_synthesis/<name>; the programmed circuit picks the recipe
//                          (1 superhydride, 2 nanotwinned diamond); each carries the data key = <name> (its EMI line, which names the
//                          superhydride quench as fiction). The anvil of circuit 1 is a 10 % chanced input: it wears.
//   gtceu:chemical_reactor, electric_blast_furnace, bender, compressor, assembler   the line steps GTM can run (ids grindless:<type>/<name>)
//   crafting               the controller: UHV hull + 2 UV electric pistons + 2 UHV circuits, grindless:crafting/megabar_press.
//   removals               GTM makes (La,Y)H10 wire from the metal by wiremill, extruder or a plate and a wire cutter; the superhydride
//                          has no ingot outside the press, but the wire gets one real route only: the powder-in-tube line (uv/materials.js,
//                          row lay_wire). GTM's cable covering recipes then turn that wire into the cable of the F1 hull, hatches and casing.
//
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.megabar.recipes, .skipped, .clashes, .controllerRecipes, .removals.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var MB = G.megabar || (G.megabar = {})
  var TABLE = MB.table || 'kubejs/data/grindless/tables/megabar.json'
  var GTM_TYPES = { assembler: true, compressor: true, bender: true, chemical_reactor: true, electric_blast_furnace: true }
  var WIRE = 'gtceu:lay_superhydride_'

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
        var circuitOk = ((optional && circuit === 0) || (circuit >= 1 && circuit <= 32 && circuit % 1 === 0)) && !circuits[circuit]
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
    if (problems.length > 0) console.error(LOG + 'megabar: ' + TABLE + ': ' + problems.join('; '))
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
    var io = MB.machine && MB.machine.type === rec.type ? MB.machine.maxIO : null
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
    rec.itemsIn.forEach(function (x) {
      if (x.chance >= 10000) recipe.itemInputs(x.count + 'x ' + x.id)
      else recipe.chancedInput(x.count + 'x ' + x.id, x.chance, 0)
    })
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
    MB.recipes = []
    MB.skipped = []
    MB.clashes = []
    function skip(name, reason) {
      MB.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'megabar skipped ' + name + ': ' + reason)
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
      MB.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    MB.clashes = clashesOf(MB.recipes)
    if (MB.clashes.length > 0) console.error(LOG + 'megabar: recipes whose ingredients are a subset of another\'s: ' + MB.clashes.join('; '))
    console.info(LOG + 'megabar: ' + MB.recipes.length + ' recipes; skipped ' + MB.skipped.length)
  }

  function addController(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var PISTON = 'gtceu:uv_electric_piston'
    var machine = MB.machine.machine
    MB.controllerRecipes = []
    var missing = [HULL, PISTON, machine].filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'megabar controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped(machine, [' C ', 'PHP', ' C '], { C: '#gtceu:circuits/uhv', P: PISTON, H: HULL }).id('grindless:crafting/megabar_press')
    MB.controllerRecipes.push('grindless:crafting/megabar_press')
  }

  // GTM's own makers of (La,Y)H10 wire: the wiremill and the extruder (every size) and the single wire from a plate
  function removeWireRoutes(event) {
    MB.removals = []
    ;['single_wire', 'double_wire', 'quadruple_wire', 'octal_wire', 'hex_wire'].forEach(function (size) {
      MB.removals.push({ type: 'gtceu:wiremill', output: WIRE + size })
      MB.removals.push({ type: 'gtceu:extruder', output: WIRE + size })
    })
    MB.removals.push({ id: 'gtceu:shaped/lay_superhydride_wire_single' })
    var found = 0
    MB.removals.forEach(function (f) { found += Number(event.countRecipes(f)) })
    MB.removals.forEach(function (f) { event.remove(f) })
    MB.removed = found
    console.info(LOG + 'megabar: removed ' + found + ' GTM recipes that make (La,Y)H10 wire')
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['removals', removeWireRoutes], ['recipes', generate], ['controller', addController]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'megabar ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
