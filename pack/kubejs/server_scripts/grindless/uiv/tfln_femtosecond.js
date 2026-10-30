// priority: -24674
// -----------------------------------------------------------------------------------------------
// Recipes of UIV's TFLN fab and femtosecond writer (machines and recipe types: startup_scripts/grindless/uiv/tfln_femtosecond.js;
// docs/eras/uiv.md, machines 3 and 4, lines 10, 12, 18, 36 and 40; package UIV-A4), generated at every server load from
// data/grindless/tables/tfln_femtosecond.json, plus the controllers' recipes.
//
//   gtceu:ion_slicing           TFLN fab, circuit 1 LN-on-Si3N4, 2 Si-28 SOI (and donor), 3 poled LNOI, 4 EO microcomb.
//   gtceu:femtosecond_writing   femtosecond writer, circuit 1 interposer blank, 2 2PP lattice, 3 orifice plate, 4 5D-crystal blank.
//   chemical_reactor, distillery, cutter, assembler, laser_engraver, electric_blast_furnace   the line steps GTM can run
//                               (ids grindless:<type>/<name>).
//   assembly_line               the controllers: UIV hull + 2 UEV parts + 2 optical computers + UEV circuits + 3 line items, with
//                               soldering alloy, lubricant and neutronium, behind station research, grindless:assembly_line/<machine>.
//
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.tflnFemtosecond.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uiv] '
  var G = global.grindless || (global.grindless = {})
  var TF = G.tflnFemtosecond || (G.tflnFemtosecond = {})
  var TABLE = TF.table || 'kubejs/data/grindless/tables/tfln_femtosecond.json'
  var GTM_TYPES = {
    assembler: true, chemical_reactor: true, laser_engraver: true, cutter: true, distillery: true, electric_blast_furnace: true
  }

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
          temp: r.temp ? Number(r.temp) : 0,
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
    if (problems.length > 0) console.error(LOG + 'tfln/femtosecond: ' + TABLE + ': ' + problems.join('; '))
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
    ;(TF.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
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
    TF.recipes = []
    TF.skipped = []
    TF.clashes = []
    function skip(name, reason) {
      TF.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'tfln/femtosecond skipped ' + name + ': ' + reason)
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
      TF.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    TF.clashes = clashesOf(TF.recipes)
    if (TF.clashes.length > 0) console.error(LOG + 'tfln/femtosecond: recipes whose ingredients are a subset of another\'s: ' + TF.clashes.join('; '))
    console.info(LOG + 'tfln/femtosecond: ' + TF.recipes.length + ' recipes; skipped ' + TF.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uiv_machine_hull'
    var COMPUTER = 'gtnn:optical_computer'
    var defs = [
      { name: 'tfln_fab', part: 'gtceu:uev_electric_motor', research: 'grindless:pumped_edfa', domain: ['2x grindless:silica_storage_preform', '2x grindless:er_fibre', '2x grindless:ule_boule'] },
      { name: 'femtosecond_writer', part: 'gtceu:uev_emitter', research: 'grindless:ps_cooling_laser', domain: ['2x grindless:shg_486_stage', '2x grindless:ppln_waveguide', '2x grindless:silica_storage_preform'] }
    ]
    TF.controllerRecipes = []
    defs.forEach(function (d) {
      var machine = 'gtceu:' + d.name
      var ids = [HULL, d.part, COMPUTER, machine, d.research].concat(d.domain.map(function (s) { return s.replace(/^\d+x /, '') }))
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      b.itemInputs(HULL)
      b.itemInputs('2x ' + d.part)
      b.itemInputs('2x ' + COMPUTER)
      // UEV circuits: these machines make the optical mainframe's parts, and the mainframe is the first UIV circuit
      b.itemInputs('4x #gtceu:circuits/uev')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:neutronium', 576))
      b.itemOutputs(machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(7864320) })
      b.EUt(31457280).duration(1500)
      TF.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'tfln/femtosecond ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
