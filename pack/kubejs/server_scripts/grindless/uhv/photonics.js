// priority: -23624
// -----------------------------------------------------------------------------------------------
// Recipes of UHV's MBE reactor and photonic foundry (machines and recipe types: startup_scripts/grindless/uhv/photonics.js;
// docs/eras/uhv.md, machines 5 and 6, lines 5, 6, 7 and 9; package UHV-A4), generated at every server load from
// data/grindless/tables/photonics.json, plus the recipes of the two controllers and the older machines' rows of the package.
//
//   gtceu:molecular_beam_epitaxy / gtceu:photonic_foundry   one recipe per table entry, id grindless:<type>/<name>; the programmed
//                          circuit picks the recipe; every recipe carries the data key of its type = <name> (its EMI line). "kept"
//                          entries are GTM's non-consumed item inputs, "charge" the same for fluids; an entry with a chance below
//                          10 000 is a chanced input or output (the arsenic off the cryoshroud, the LN donor wafer reused). The foundry
//                          is the only maker of gtnn:optical_processor and gtnn:optical_assembly, and every foundry recipe takes
//                          1,000 mB of A3's ultrapure water (back as water).
//   gtceu:ion_implantation ZPM ion implanter, circuits 3-4 (line 5's helium smart-cut of the LN wafer, line 10's aluminium implant of
//                          the SiC epi wafer). Circuits 1-2 stay in zpm/qubits.js.
//   gtceu:electric_blast_furnace   GTM, no circuit (GTM's dust rows use circuits 1-2): germanium + antimony + tellurium under argon ->
//                          the GST target; three spent targets remelted to two (line 6's target scrap).
//   gtceu:large_chemical_reactor   GTM, no circuit: tellurium out of EV's platinum plant metal sludge (soda ash, sulfuric acid, SO2
//                          reduction), with its nickel and copper; the acid leaves diluted.
//   crafting               the controllers: UHV hull + 2 UV sensors + 2 UHV circuits (reactor) and UHV hull + 2 UV emitters +
//                          2 UHV circuits (foundry), shaped recipes grindless:crafting/<machine>.
//
// The older rows live in this package's table, not in the ZPM scripts, so the ZPM tables (and their tests) keep their rows.
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error)
// among this table's rows; tools/analysis/test/uhv-photonics.test.mjs also checks them against the ZPM rows of the same types.
// Published for the smoke test: global.grindless.uhvPhotonics.recipes [{ type, name, recipeId, ... }], .skipped, .clashes,
// .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var PH = G.uhvPhotonics || (G.uhvPhotonics = {})
  var TABLE = PH.table || 'kubejs/data/grindless/tables/photonics.json'
  // the older machine's slots (startup zpm/qubits.js); GTM's own types are not checked and their circuit is optional (0 = none)
  var OLDER_IO = {
    ion_implantation: { itemsIn: 3, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 }
  }
  var GTM_TYPES = { electric_blast_furnace: true, large_chemical_reactor: true }

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
        var temp = r.temp === undefined ? 0 : Number(r.temp)
        var circuitOk = (optional && circuit === 0) || (circuit >= 1 && circuit <= 32 && circuit % 1 === 0 && !circuits[circuit])
        var tempOk = type === 'electric_blast_furnace' ? temp > 0 && temp % 1 === 0 : temp === 0
        if (!/^[a-z0-9_]+$/.test(n) || names[n] || !circuitOk || !tempOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', temp ' + r.temp + ', eut ' + r.eut + ', duration ' + r.duration)
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
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, temp: temp,
          dataKey: def.dataKey ? String(def.dataKey) : '',
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

  function ioOf(type) {
    if (OLDER_IO[type]) return OLDER_IO[type]
    var io = null
    Object.keys(PH.machines || {}).forEach(function (k) { if (PH.machines[k].type === type) io = PH.machines[k].maxIO })
    return io
  }

  function sizeProblem(rec) {
    if (GTM_TYPES[rec.type] === true) return null
    var io = ioOf(rec.type)
    if (io === null) return 'no machine for type ' + rec.type
    if (rec.itemsIn.length + rec.kept.length + 1 > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length + rec.charge.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    // GTM puts the type's path in front: 'grindless:<name>' becomes grindless:<type>/<name> (= rec.recipeId)
    var recipe = event.recipes.gtceu[rec.type]('grindless:' + rec.name)
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
    PH.recipes = []
    PH.skipped = []
    PH.clashes = []
    function skip(name, reason) {
      PH.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'photonics skipped ' + name + ': ' + reason)
    }
    loadTable().forEach(function (rec) {
      rec.recipeId = 'grindless:' + rec.type + '/' + rec.name
      var missing = missingIds(rec)
      if (missing.length > 0) return skip(rec.type + '/' + rec.name, 'unknown id(s): ' + missing.join(', '))
      var tooBig = sizeProblem(rec)
      if (tooBig !== null) return skip(rec.type + '/' + rec.name, tooBig)
      try {
        add(event, rec)
      } catch (e) {
        return skip(rec.type + '/' + rec.name, 'the builder failed: ' + e)
      }
      PH.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    PH.clashes = clashesOf(PH.recipes)
    if (PH.clashes.length > 0) console.error(LOG + 'photonics: recipes whose ingredients are a subset of another\'s: ' + PH.clashes.join('; '))
    console.info(LOG + 'photonics: ' + PH.recipes.length + ' recipes; skipped ' + PH.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var SENSOR = 'gtceu:uv_sensor'
    var EMITTER = 'gtceu:uv_emitter'
    var defs = [
      { machine: PH.machines.reactor.machine, parts: [HULL, SENSOR], pattern: ['SCS', ' H ', ' C '], ingredients: { C: '#gtceu:circuits/uhv', S: SENSOR, H: HULL }, name: 'mbe_reactor' },
      { machine: PH.machines.foundry.machine, parts: [HULL, EMITTER], pattern: ['ECE', ' H ', ' C '], ingredients: { C: '#gtceu:circuits/uhv', E: EMITTER, H: HULL }, name: 'photonic_foundry' }
    ]
    PH.controllerRecipes = []
    defs.forEach(function (d) {
      var missing = d.parts.concat([d.machine]).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(d.machine, d.pattern, d.ingredients).id('grindless:crafting/' + d.name)
      PH.controllerRecipes.push('grindless:crafting/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'photonics ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
