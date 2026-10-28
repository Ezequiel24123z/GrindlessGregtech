// priority: -24604
// -----------------------------------------------------------------------------------------------
// Recipes of UIV's Matrioshka computer and droplet radiator works (machines and recipe types: startup_scripts/grindless/uiv/matrioshka.js;
// docs/eras/uiv.md, machines 11 and 12, lines 19, 20, 21, 37, 41, 43 and 46; package UIV-A10), generated at every server load from
// data/grindless/tables/matrioshka.json, plus the controllers' recipes.
//
//   gtceu:matrioshka_computing        Matrioshka computer, circuit 1 research write (a data module with the research of the radiator
//                                     controller), 2 neutron-star EOS chart, 3 Kerr chart. Only at gcyr:mercury_orbit.
//   gtceu:droplet_radiator_assembly   droplet radiator works, circuit 1 droplet radiator module, 2 TPV tile. Only at gcyr:mercury_orbit.
//   assembler, lathe, mixer, ...      the line steps GTM can run (ids grindless:<name>).
//   assembly_line                     the radiation-hardened controller, researchWithoutRecipe (the research is the Matrioshka's write).
//   crafting                          the controllers: UIV hull + 2 UIV parts + 2 optical mainframes, grindless:crafting/<machine>.
//
// A recipe whose "site" is true gets dimension gcyr:mercury_orbit; an item stack with "nbt" carries that tag.
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.matrioshka.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uiv] '
  var G = global.grindless || (global.grindless = {})
  var MA = G.matrioshka || (G.matrioshka = {})
  var TABLE = MA.table || 'kubejs/data/grindless/tables/matrioshka.json'
  var GTM_TYPES = {
    assembler: true, chemical_reactor: true, laser_engraver: true, cutter: true, distillery: true, electric_blast_furnace: true,
    lathe: true, mixer: true, assembly_line: true
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
        if (optional && circuit === 0) circuitOk = true
        if (!/^[a-z0-9_]+$/.test(n) || seen[n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration)
          return
        }
        var bad = false
        var stack = function (x) {
          var chance = x.chance === undefined ? 10000 : Number(x.chance)
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1) || !(chance >= 1 && chance <= 10000) || chance % 1 !== 0) bad = true
          return { id: String(x.id), count: Number(x.count), chance: chance, nbt: x.nbt ? String(x.nbt) : '' }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dataKey: def.dataKey ? String(def.dataKey) : '',
          site: r.site === true, research: r.research ? String(r.research) : '',
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), fluidsIn: list(r.fluidsIn).map(fluid),
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
    if (problems.length > 0) console.error(LOG + 'matrioshka: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.itemsOut).forEach(function (x) {
      if (x.id.charAt(0) === '#') return
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    rec.fluidsIn.concat(rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    if (GTM_TYPES[rec.type] === true) return null
    var io = null
    ;(MA.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
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
    rec.itemsOut.forEach(function (x) {
      if (x.nbt !== '') recipe.itemOutputs(Item.of(x.id, x.count, x.nbt))
      else if (x.chance >= 10000) recipe.itemOutputs(x.count + 'x ' + x.id)
      else recipe.chancedOutput(x.count + 'x ' + x.id, x.chance, 0)
    })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    if (rec.site) recipe.dimension(MA.site || 'gcyr:mercury_orbit')
    if (rec.research !== '') recipe.researchWithoutRecipe(rec.research)
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
    MA.recipes = []
    MA.skipped = []
    MA.clashes = []
    function skip(name, reason) {
      MA.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'matrioshka skipped ' + name + ': ' + reason)
    }
    loadTable().forEach(function (rec) {
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
      MA.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    MA.clashes = clashesOf(MA.recipes)
    if (MA.clashes.length > 0) console.error(LOG + 'matrioshka: recipes whose ingredients are a subset of another\'s: ' + MA.clashes.join('; '))
    console.info(LOG + 'matrioshka: ' + MA.recipes.length + ' recipes; skipped ' + MA.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uiv_machine_hull'
    var MAINFRAME = 'gtnn:optical_mainframe'
    var parts = { matrioshka_computer: 'grindless:uiv_electric_piston', droplet_radiator_works: 'grindless:uiv_conveyor_module' }
    MA.controllerRecipes = []
    Object.keys(parts).forEach(function (name) {
      var machine = 'gtceu:' + name
      var missing = [HULL, parts[name], MAINFRAME, machine].filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(machine, ['OPO', 'PHP'], { O: MAINFRAME, P: parts[name], H: HULL }).id('grindless:crafting/' + name)
      MA.controllerRecipes.push('grindless:crafting/' + name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'matrioshka ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
