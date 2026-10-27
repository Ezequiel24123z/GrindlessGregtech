// -----------------------------------------------------------------------------------------------
// Recipes of UHV's positron accumulator and Casimir array (machines and recipe types: startup_scripts/grindless/uhv/antimatter.js;
// docs/eras/uhv.md, machines 13 and 17, lines 27 and 28; package UHV-A6), generated at every server load from
// data/grindless/tables/antimatter.json, plus the recipes of the two controllers and the package's GTM side rows.
//
//   gtceu:positron_accumulation / gtceu:casimir_cavity   one recipe per table entry, id grindless:<type>/<name>; the programmed circuit
//                          picks the recipe; every recipe carries the data key of its type = <name> (its EMI line). "kept" entries are
//                          GTM's non-consumed item inputs, "charge" the same for fluids; a chance below 10,000 is a chanced input or
//                          output. A type with orbit: true (the Casimir array) adds .dimension(Earth orbit).
//     line 27: magnesium-24 target (GTM assembler) -> UV's synchrotron (circuit 5, uv/accelerators.js): sodium-22 target -> moderated
//              source (c1, under the cryogenic plant's 99.999 % neon) -> accumulate (c2: the Surko trap fills an empty Penning trap;
//              the source wears 1 in 16 runs) -> positron cartridge -> UV's antimatter trap (circuit 3) -> antihydrogen cartridge
//     line 28: SiC mirror blank -> UV's MOCVD (circuit 8): NbN-coated plate -> cavity stack (c1) -> harvest (c2) -> exotic matter cell
//   gtceu:assembler        GTM, no circuit: 4 magnesium dust pressed on a copper backing plate (natural magnesium is 79 % Mg-24);
//                          the empty Penning trap (gold electrodes, a niobium-titanium winding, a titanium can).
//   crafting               the controllers, shaped recipes grindless:crafting/<machine>: UHV hull + 2 UV electric pumps + 2 UHV circuits
//                          (accumulator); UHV hull + 2 UV field generators + 2 UHV circuits (array), in shapes no other UHV controller
//                          uses.
//
// Destinations (rule 3 of AGENTS.md):
//   spent positron source  -> c3: the neon back (to the cryogenic plant's neon row), the sodium-22 as gtnn:radioactive_waste -> ZPM's waste
//                             retrieval plant (synroc); the accumulator refuses voiding (contained)
//   nitrogen (c2)          -> charge, never used up
//   helium (c1)            -> UV's superfluid helium plant (back to helium II)
//   worn cavity stacks     -> c3: the 7 mirror blanks back -> UV's MOCVD re-coats them -> c1
//   nuclear clock (c2)     -> kept, never used up
//
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.uhvAntimatter.recipes [{ type, name, recipeId, ... }], .skipped, .clashes,
// .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var AM = G.uhvAntimatter || (G.uhvAntimatter = {})
  var TABLE = AM.table || 'kubejs/data/grindless/tables/antimatter.json'
  var ORBIT = G.orbits ? G.orbits.earth : 'gcyr:overworld_orbit'
  // GTM's own types are not size-checked and their circuit is optional (0 = none)
  var GTM_TYPES = { assembler: true }

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
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration,
          dataKey: def.dataKey ? String(def.dataKey) : '', orbit: def.orbit === true,
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
    if (problems.length > 0) console.error(LOG + 'antimatter: ' + TABLE + ': ' + problems.join('; '))
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
    var io = null
    Object.keys(AM.machines || {}).forEach(function (k) { if (AM.machines[k].type === type) io = AM.machines[k].maxIO })
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
    if (rec.orbit) recipe.dimension(ORBIT)
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
    AM.recipes = []
    AM.skipped = []
    AM.clashes = []
    function skip(name, reason) {
      AM.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'antimatter skipped ' + name + ': ' + reason)
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
      AM.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    AM.clashes = clashesOf(AM.recipes)
    if (AM.clashes.length > 0) console.error(LOG + 'antimatter: recipes whose ingredients are a subset of another\'s: ' + AM.clashes.join('; '))
    console.info(LOG + 'antimatter: ' + AM.recipes.length + ' recipes; skipped ' + AM.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var PUMP = 'gtceu:uv_electric_pump'
    var FIELD = 'gtceu:uv_field_generator'
    var C = '#gtceu:circuits/uhv'
    // the other UHV controllers' shapes: grep "pattern: [" in server_scripts/grindless/uhv/*.js
    var defs = [
      { machine: AM.machines.accumulator.machine, parts: [HULL, PUMP], pattern: ['PCP', ' H ', ' C '], ingredients: { C: C, P: PUMP, H: HULL }, name: 'positron_accumulator' },
      { machine: AM.machines.array.machine, parts: [HULL, FIELD], pattern: ['CFC', ' H ', ' F '], ingredients: { C: C, F: FIELD, H: HULL }, name: 'casimir_array' }
    ]
    AM.controllerRecipes = []
    defs.forEach(function (d) {
      var missing = d.parts.concat([d.machine]).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(d.machine, d.pattern, d.ingredients).id('grindless:crafting/' + d.name)
      AM.controllerRecipes.push('grindless:crafting/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'antimatter ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
