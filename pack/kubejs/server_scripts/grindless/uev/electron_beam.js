// priority: -23060
// -----------------------------------------------------------------------------------------------
// Recipes of UEV's electron beam furnace and single-crystal foundry (machines and recipe types: startup_scripts/grindless/uev/electron_beam.js;
// docs/eras/uev.md, machines 6 and 7, lines 11, 12, 13, 33 and 38; package UEV-A4), generated at every server load from
// data/grindless/tables/electron_beam.json, plus the recipes of the two controllers.
//
//   gtceu:electron_beam_refining / gtceu:single_crystal_casting   one recipe per table entry, id grindless:<type>/<name>; the programmed
//                          circuit picks the recipe (a circuit may repeat inside a type when the item inputs differ, OpV-F3: then
//                          the items pick it); every recipe carries the data key of its type = <name> (its EMI line).
//   gtceu:srf_cavity       UV's cryomodule works (uv/cold.js, circuits 1-4): circuit 5 here is the Sn vapour diffusion that turns UV's
//                          niobium cavity into the Nb3Sn cavity (id grindless:srf_cavity/nb3sn_diffusion).
//   gtceu:chemical_reactor, mixer, assembler, compressor, bender, macerator, electric_blast_furnace   the line steps GTM can run
//                          (ids grindless:<type>/<name>); the EBF row carries the table's temperature.
//   assembly line          the controllers: UHV hull + 2 UV emitters (or robot arms) + 4 UHV circuits + the UV cryomodule and SRF cavities, soldering alloy
//                          and neutronium, with station research; ids grindless:assembly_line/<machine>.
//
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// A row that repeats a circuit of its type with the same item inputs (ids, consumed or kept) is refused at load.
// Published for the smoke test: global.grindless.electronBeam.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var EB = G.electronBeam || (G.electronBeam = {})
  var TABLE = EB.table || 'kubejs/data/grindless/tables/electron_beam.json'
  // GTM's own types: their circuit is optional (0 = none) and their slots are GTM's
  var GTM_TYPES = { mixer: true, assembler: true, compressor: true, bender: true, macerator: true, chemical_reactor: true, electric_blast_furnace: true }

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  // the item ids the lookup sees (consumed and kept), sorted: two rows with the same string have identical item inputs
  function itemSet(rec) {
    var ids = []
    rec.itemsIn.concat(rec.kept).forEach(function (x) { if (ids.indexOf(x.id) < 0) ids.push(x.id) })
    return ids.sort().join(',')
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
        var circuitOk = (optional && circuit === 0) || (circuit >= 1 && circuit <= 32 && circuit % 1 === 0)
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
        var items = itemSet(rec)
        var same = circuit > 0 ? list(circuits[circuit]) : []
        for (var k = 0; k < same.length; k++) {
          if (same[k].items === items) {
            problems.push(type + '/' + n + ': circuit ' + circuit + ' repeats ' + same[k].name + ' with the same item inputs')
            return
          }
        }
        names[n] = true
        if (circuit > 0) circuits[circuit] = same.concat([{ name: n, items: items }])
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'electron beam: ' + TABLE + ': ' + problems.join('; '))
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
    if (rec.type === 'srf_cavity') io = (G.cold || {}).worksIO || null
    else if (GTM_TYPES[rec.type] === true) return null
    else Object.keys(EB.machines || {}).forEach(function (k) { if (EB.machines[k].type === rec.type) io = EB.machines[k].maxIO })
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
    EB.recipes = []
    EB.skipped = []
    EB.clashes = []
    function skip(name, reason) {
      EB.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'electron beam skipped ' + name + ': ' + reason)
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
      EB.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    EB.clashes = clashesOf(EB.recipes)
    if (EB.clashes.length > 0) console.error(LOG + 'electron beam: recipes whose ingredients are a subset of another\'s: ' + EB.clashes.join('; '))
    console.info(LOG + 'electron beam: ' + EB.recipes.length + ' recipes; skipped ' + EB.skipped.length)
  }

  // ASSEMBLY LINE with station research (the UV emitter / robot arm of the machine, scanned into a data module): UHV hull + the
  // machine's UV tool + 4 UHV circuits + the UV cryomodule and cavities that are its beam optics / pull head + 2 B soldering alloy
  // + neutronium (the shielding of the chamber). The ids are grindless:assembly_line/<name>.
  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var EMITTER = 'gtceu:uv_emitter'
    var ARM = 'gtceu:uv_robot_arm'
    var CRYO = 'grindless:srf_cryomodule'
    var CAVITY = 'grindless:srf_cavity'
    var GEAR = 'grindless:near_net_neutronium_gear'
    var defs = [
      { machine: EB.machines.furnace.machine, tool: EMITTER, parts: [HULL, EMITTER, CRYO, CAVITY, GEAR], ins: [HULL, '2x ' + EMITTER, '4x #gtceu:circuits/uhv', '2x ' + CRYO, '4x ' + CAVITY, '2x ' + GEAR], name: 'electron_beam_furnace' },
      { machine: EB.machines.foundry.machine, tool: ARM, parts: [HULL, ARM, CRYO, CAVITY, GEAR], ins: [HULL, '2x ' + ARM, '4x #gtceu:circuits/uhv', CRYO, '2x ' + CAVITY, '4x ' + GEAR], name: 'single_crystal_foundry' }
    ]
    EB.controllerRecipes = []
    defs.forEach(function (d) {
      var missing = d.parts.concat([d.machine]).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var id = 'grindless:assembly_line/' + d.name
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      b.itemInputs(d.ins)
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:neutronium', 288))
      b.itemOutputs(d.machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.tool)).CWUt(64).EUt(491520) })
      b.EUt(491520).duration(2400)
      EB.controllerRecipes.push(id)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'electron beam ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
