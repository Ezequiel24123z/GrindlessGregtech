// priority: -24661
// -----------------------------------------------------------------------------------------------
// Recipes of RX J1856.5-3754's five machines (machines and recipe types: startup_scripts/grindless/uiv/rx_j1856.js; docs/eras/uiv.md,
// machines 13-17, lines 30-33; package UIV-B2), generated at every server load from data/grindless/tables/rx_j1856.json, plus the controllers'
// recipes.
//
//   gtceu:crust_lifting               crust lift. Only at grindless:rx_j1856_orbit.
//   gtceu:neutron_drip_separation     neutron drip separator. Only at grindless:rx_j1856_orbit.
//   gtceu:neutronium_caging           neutronium cage. Only at grindless:rx_j1856_orbit.
//   gtceu:r_process_decompression     r-process decompressor. Only at grindless:rx_j1856_orbit.
//   gtceu:decay_heat                  decay heat vault, a generator (EUt written negative). Only at grindless:rx_j1856_orbit.
//   assembler, chemical_reactor, ...  the line steps GTM can run (ids grindless:<name>).
//   assembly_line               the controllers: UIV hull + 2 UIV parts + 2 optical mainframes + UIV circuits + 3 line items, with
//                               soldering alloy, lubricant and neutronium, behind station research, grindless:assembly_line/<machine>.
//
// Row keys: "site" true puts recipe.dimension(rx_j1856_orbit) on it; "wear" are chanced inputs (a tool that wears); "kept" are not consumed.
// A type with "generator": true makes EU (the recipe's EUt is written negative).
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.rxJ1856.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uiv] '
  var G = global.grindless || (global.grindless = {})
  var RX = G.rxJ1856 || (G.rxJ1856 = {})
  var TABLE = RX.table || 'kubejs/data/grindless/tables/rx_j1856.json'
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
          site: r.site === true, generator: def.generator === true, research: r.research ? String(r.research) : '',
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), wear: list(r.wear).map(stack), fluidsIn: list(r.fluidsIn).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        var hasInput = rec.itemsIn.length + rec.kept.length + rec.wear.length + rec.fluidsIn.length > 0
        if (bad || (rec.itemsOut.length === 0 && rec.fluidsOut.length === 0) || !hasInput) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        seen[n] = true
        if (circuit > 0) circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'rx_j1856: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.wear, rec.itemsOut).forEach(function (x) {
      if (x.id.charAt(0) === '#') return
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    rec.fluidsIn.concat(rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    if (GTM_TYPES[rec.type] === true) return null
    var io = null
    ;(RX.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
    if (io === null) return 'no slots known for type ' + rec.type
    var circuit = rec.circuit > 0 ? 1 : 0
    if (rec.itemsIn.length + rec.kept.length + rec.wear.length + circuit > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu[rec.type](rec.recipeId)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    rec.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
    rec.wear.forEach(function (x) { recipe.chancedInput(x.count + 'x ' + x.id, x.chance, 0) })
    if (rec.circuit > 0) recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) {
      if (x.nbt !== '') recipe.itemOutputs(Item.of(x.id, x.count, x.nbt))
      else if (x.chance >= 10000) recipe.itemOutputs(x.count + 'x ' + x.id)
      else recipe.chancedOutput(x.count + 'x ' + x.id, x.chance, 0)
    })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    if (rec.site) recipe.dimension(RX.site || 'grindless:rx_j1856_orbit')
    if (rec.research !== '') recipe.researchWithoutRecipe(rec.research)
    recipe.EUt(rec.generator ? -rec.eut : rec.eut).duration(rec.duration)
  }

  function keysOf(rec) {
    var keys = {}
    rec.itemsIn.concat(rec.kept, rec.wear).forEach(function (x) { keys['i:' + x.id] = true })
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
    RX.recipes = []
    RX.skipped = []
    RX.clashes = []
    function skip(name, reason) {
      RX.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'rx_j1856 skipped ' + name + ': ' + reason)
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
      RX.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    RX.clashes = clashesOf(RX.recipes)
    if (RX.clashes.length > 0) console.error(LOG + 'rx_j1856: recipes whose ingredients are a subset of another\'s: ' + RX.clashes.join('; '))
    console.info(LOG + 'rx_j1856: ' + RX.recipes.length + ' recipes; skipped ' + RX.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uiv_machine_hull'
    var MAINFRAME = 'gtnn:optical_mainframe'
    // es254_target is not a controller input here: einsteinium only comes from the separator and the decompressor
    var defs = [
      { name: 'crust_lift', part: 'grindless:uiv_electric_piston', research: 'grindless:crust_lift_tether', domain: ['2x grindless:polar_cap_electrode', '2x grindless:braided_mh_tether', '2x grindless:mh_laminated_yarn'] },
      { name: 'neutron_drip_separator', part: 'grindless:uiv_electric_pump', research: 'grindless:neutron_supermirror', domain: ['2x grindless:neutron_guide', '2x grindless:neutron_supermirror', '2x grindless:target_wheel_blank'] },
      { name: 'neutronium_cage', part: 'grindless:uiv_robot_arm', research: 'grindless:cage_part', domain: ['2x grindless:neutron_guide', '2x grindless:neutron_supermirror', '2x grindless:target_wheel_blank'] },
      { name: 'r_process_decompressor', part: 'grindless:uiv_conveyor_module', research: 'grindless:sealed_capsule', domain: ['2x grindless:sealed_capsule', '2x grindless:neutron_guide', '2x grindless:target_wheel_blank'] },
      { name: 'decay_heat_vault', part: 'grindless:uiv_electric_motor', research: 'grindless:mh_laminated_yarn', domain: ['2x grindless:braided_mh_tether', '2x grindless:polar_cap_electrode', '2x grindless:crust_lift_tether'] }
    ]
    RX.controllerRecipes = []
    defs.forEach(function (d) {
      var machine = 'gtceu:' + d.name
      var ids = [HULL, d.part, MAINFRAME, machine, d.research].concat(d.domain.map(function (s) { return s.replace(/^\d+x /, '') }))
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      b.itemInputs(HULL)
      b.itemInputs('2x ' + d.part)
      b.itemInputs('2x ' + MAINFRAME)
      b.itemInputs('4x #gtceu:circuits/uiv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:neutronium', 576))
      b.itemOutputs(machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(7864320) })
      b.EUt(7864320).duration(1500)
      RX.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'rx_j1856 ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
