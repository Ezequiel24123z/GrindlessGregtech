// -----------------------------------------------------------------------------------------------
// Recipes of OpV's antimatter machines (machines and recipe types: startup_scripts/grindless/opv/antimatter.js; docs/eras/opv.md, machines 3 and
// 5-8, process lines 26-28 and 30-33; package OpV-B3), generated at every server load from data/grindless/tables/antimatter_opv.json, plus the
// controllers' recipes and the annihilation shield casing's.
//
//   gtceu:antihydrogen_synthesis   antihydrogen foundry (home): c1 trap, c2 laser cool, c3 freeze to ice.
//   gtceu:annihilation_power       annihilation engine (home), a generator: c1 ice cell + hydrogen (2^29 EU/t), c2 ACMF pellet + antiproton
//                                  stack (2^30 EU/t); both wear the gamma absorber tile.
//   assembly_line                  the controllers (OpV hull + OpV components + OpV circuits + superfluid He-3 + 3 domain items, behind
//                                  station research), grindless:assembly_line/<machine>.
//   assembler                      the annihilation shield casing (2 OpV circuits).
//
// Row keys: "site" true puts recipe.dimension(cygnus_x1_orbit) on it; "kept" are not consumed; "wear" are consumed by their chance (out of
// 10000); "chanceOut" are outputs made by their chance; "generator" writes the EUt negative.
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.opvAntimatter.recipes, .skipped, .clashes, .controllerRecipes, .casingRecipe.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var AM = G.opvAntimatter || (G.opvAntimatter = {})
  var TABLE = AM.table || 'kubejs/data/grindless/tables/antimatter_opv.json'
  var SITE = AM.site || 'grindless:cygnus_x1_orbit'
  // GTM's own types (OpV-B3a lines 26-33): the circuit is optional there (0 = none) and the slots are GTM's
  var GTM_TYPES = { assembler: true, cutter: true, alloy_smelter: true, chemical_reactor: true, centrifuge: true, mixer: true, compressor: true }

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
      list(def.recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var circuitOk = (GTM_TYPES[type] === true && circuit === 0) || (circuit >= 1 && circuit <= 32 && circuit % 1 === 0 && !circuits[circuit])
        if (!/^[a-z0-9_]+$/.test(n) || seen[type + '/' + n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || eut >= 2147483648 || !(duration > 0) || duration % 1 !== 0) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration)
          return
        }
        var bad = false
        var stack = function (x) {
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1)) bad = true
          return { id: String(x.id), count: Number(x.count) }
        }
        var chanced = function (x) {
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1) || !(Number(x.chance) >= 1 && Number(x.chance) <= 10000)) bad = true
          return { id: String(x.id), count: Number(x.count), chance: Number(x.chance) }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dataKey: def.dataKey ? String(def.dataKey) : '',
          site: r.site === true, generator: r.generator === true, itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack),
          wear: list(r.wear).map(chanced), fluidsIn: list(r.fluidsIn).map(fluid), itemsOut: list(r.itemsOut).map(stack),
          chanceOut: list(r.chanceOut).map(chanced), fluidsOut: list(r.fluidsOut).map(fluid) }
        if (bad || (rec.itemsOut.length === 0 && rec.chanceOut.length === 0 && rec.fluidsOut.length === 0 && !rec.generator) ||
          (rec.itemsIn.length === 0 && rec.wear.length === 0 && rec.fluidsIn.length === 0)) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        seen[type + '/' + n] = true
        circuits[circuit] = circuit > 0
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'antimatter: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.wear, rec.itemsOut, rec.chanceOut).forEach(function (x) {
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    rec.fluidsIn.concat(rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    // OpV-B3a: GTM's own types (their rows are written inside GTM's slot counts: assembler 9 in, cutter 1 in, reactors 2 in)
    if (GTM_TYPES[rec.type] === true) return null
    var io = null
    ;(AM.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
    if (io === null) return 'no slots known for type ' + rec.type
    var circuit = rec.circuit > 0 ? 1 : 0
    if (rec.itemsIn.length + rec.kept.length + rec.wear.length + circuit > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length + rec.chanceOut.length > io.itemsOut) return rec.itemsOut.length + rec.chanceOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
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
    rec.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    rec.chanceOut.forEach(function (x) { recipe.chancedOutput(x.count + 'x ' + x.id, x.chance, 0) })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    if (rec.type === 'antihydrogen_synthesis' || rec.type === 'annihilation_power') recipe.dimension('minecraft:overworld')
    else if (rec.site) recipe.dimension(SITE)
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
    AM.recipes = []
    AM.skipped = []
    AM.clashes = []
    function skip(name, reason) {
      AM.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'antimatter skipped ' + name + ': ' + reason)
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
      AM.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    AM.clashes = clashesOf(AM.recipes)
    if (AM.clashes.length > 0) console.error(LOG + 'antimatter: recipes whose ingredients are a subset of another\'s: ' + AM.clashes.join('; '))
    console.info(LOG + 'antimatter: ' + AM.recipes.length + ' recipes; skipped ' + AM.skipped.length)
  }

  // the controllers: an OpV hull, OpV components, OpV circuits, superfluid He-3 and three domain items, behind station research
  function addControllers(event) {
    var HULL = 'gtceu:opv_machine_hull'
    var FLUID = 'grindless:superfluid_helium_3'
    var defs = [
      { name: 'antihydrogen_foundry', research: 'grindless:octupole_trap_magnet', circuits: 4,
        parts: ['4x gtceu:opv_field_generator', '4x gtceu:opv_emitter', '2x gtceu:opv_electric_pump'],
        domain: ['grindless:neg_xhv_casing', 'grindless:levitation_trap_cell', 'grindless:lyman_alpha_laser'] },
      { name: 'annihilation_engine', research: 'grindless:gamma_absorber_tile', circuits: 8,
        parts: ['4x gtceu:opv_field_generator', '4x gtceu:opv_electric_pump', '4x gtceu:opv_sensor'],
        domain: ['grindless:tpv_panel', 'grindless:li6_hydride_shield', 'grindless:octupole_trap_magnet'] }
    ]
    AM.controllerRecipes = []
    defs.forEach(function (d) {
      var machine = 'gtceu:' + d.name
      var strip = function (s) { return s.replace(/^\d+x /, '') }
      var ids = [HULL, d.research].concat(d.parts.map(strip), d.domain)
      var missing = ids.concat([machine]).filter(function (id) { return !Item.exists(id) })
      if (!Fluid.exists(FLUID)) missing.push(FLUID)
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      b.itemInputs(HULL)
      d.parts.forEach(function (s) { b.itemInputs(s) })
      b.itemInputs(d.circuits + 'x #gtceu:circuits/opv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of(FLUID, 1000))
      b.itemOutputs(machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).dataStack(Item.of('gtceu:data_module')).CWUt(256).EUt(503316480) })
      b.EUt(503316480).duration(2400)
      AM.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // the shield casing has no crafting-table recipe: an assembler at OpV with two OpV circuits
  function addCasing(event) {
    var OUT = 'grindless:annihilation_shield_casing'
    var ins = ['gtceu:opv_machine_casing', 'gtceu:tungsten_steel_plate', 'gtceu:opv_sensor', 'gtceu:lead_plate', 'gtceu:boron_carbide_dust']
    var missing = [OUT].concat(ins).filter(function (id) { return !Item.exists(id) })
    AM.casingRecipe = ''
    if (missing.length > 0) {
      console.error(LOG + 'annihilation_shield_casing recipe skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembler('grindless:annihilation_shield_casing')
    b.itemInputs('gtceu:opv_machine_casing')
    b.itemInputs('4x gtceu:tungsten_steel_plate')
    b.itemInputs('gtceu:opv_sensor', '4x gtceu:lead_plate', '2x gtceu:boron_carbide_dust')
    b.itemInputs('2x #gtceu:circuits/opv')
    b.inputFluids(Fluid.of('grindless:superfluid_helium_3', 250))
    b.itemOutputs('2x ' + OUT)
    b.EUt(503316480).duration(200)
    AM.casingRecipe = 'grindless:assembler/annihilation_shield_casing'
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers], ['casing', addCasing]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'antimatter ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
