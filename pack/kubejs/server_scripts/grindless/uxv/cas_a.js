// priority: -26290
// -----------------------------------------------------------------------------------------------
// Recipes of UXV's Cassiopeia A machine and the emitter's gamma source (machines and recipe types: startup_scripts/grindless/uxv/cas_a.js;
// docs/eras/uxv.md, machines 21 and 8, process line 25; package UXV-B5), generated at every server load from data/grindless/tables/cas_a.json,
// plus the two controllers' recipes, the uxv_emitter assembly line and the antimatter trap's positron-stack row.
//
//   gtceu:ejecta_sweeping      ejecta knot sweeper, circuit 1 sweep (an MH winding worn at 2%) -> ejecta knot dust. Only at Cassiopeia A.
//   gtceu:annihilation_lasing  laser works, circuit 1 Ti-44 core (worn at 2%) + neon cartridge -> moderated Ps cell, 2 cell + cavity + die -> module.
//   gtceu:antimatter_storage   UV's trap (shared type), circuit 5: slow positrons + nitrogen buffer gas -> positron stack, in Earth orbit.
//   assembly_line              the two controllers (grindless:assembly_line/<machine>) and grindless:assembly_line/uxv_emitter (researched
//                              with the gamma laser module, stellar hydrogen cut as the fluid).
//
// Older rows of the package, in their own tables and files: calutron c14 (tables/isotopes.json), extraction cascade c22
// (ev/extraction_cascade.js), hot cell c16-17 (tables/hot_cell.json), X-ray pulse profiler c3 (tables/j0437.json).
// Row keys: "site" true puts recipe.dimension(cas_a_remnant) on it; "kept" are not consumed; "wear" are chanced inputs; an output with a "chance"
// is a chanced output (count 1).
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.casA.recipes, .skipped, .clashes, .controllerRecipes, .emitter, .trap.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uxv] '
  var G = global.grindless || (global.grindless = {})
  var CA = G.casA || (G.casA = {})
  var TABLE = CA.table || 'kubejs/data/grindless/tables/cas_a.json'
  var SITE = CA.site || 'grindless:cas_a_remnant'

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
        var circuitOk = circuit >= 1 && circuit <= 32 && circuit % 1 === 0 && !circuits[circuit]
        if (!/^[a-z0-9_]+$/.test(n) || seen[type + '/' + n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration)
          return
        }
        var bad = false
        var stack = function (x) {
          var chance = x.chance === undefined ? 0 : Number(x.chance)
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1) || chance < 0 || chance > 10000 || chance % 1 !== 0) bad = true
          return { id: String(x.id), count: Number(x.count), chance: chance }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dataKey: def.dataKey ? String(def.dataKey) : '',
          site: r.site === true ? SITE : '',
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), wear: list(r.wear).map(stack), fluidsIn: list(r.fluidsIn).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        rec.wear.forEach(function (x) { if (!(x.chance >= 1)) bad = true })
        var hasInput = rec.itemsIn.length + rec.kept.length + rec.wear.length + rec.fluidsIn.length > 0
        var hasOutput = rec.itemsOut.length + rec.fluidsOut.length > 0
        if (bad || !hasOutput || !hasInput) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        seen[type + '/' + n] = true
        circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'cas_a: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.wear, rec.itemsOut).forEach(function (x) {
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    rec.fluidsIn.concat(rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    var io = null
    ;(CA.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
    if (io === null) return 'no slots known for type ' + rec.type
    if (rec.itemsIn.length + rec.kept.length + rec.wear.length + 1 > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
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
    recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) {
      if (x.chance > 0) recipe.chancedOutput(x.count + 'x ' + x.id, x.chance, 0)
      else recipe.itemOutputs(x.count + 'x ' + x.id)
    })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    if (rec.site !== '') recipe.dimension(rec.site)
    recipe.EUt(rec.eut).duration(rec.duration)
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
    CA.recipes = []
    CA.skipped = []
    CA.clashes = []
    function skip(name, reason) {
      CA.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'cas_a skipped ' + name + ': ' + reason)
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
      CA.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    CA.clashes = clashesOf(CA.recipes)
    if (CA.clashes.length > 0) console.error(LOG + 'cas_a: recipes whose ingredients are a subset of another\'s: ' + CA.clashes.join('; '))
    console.info(LOG + 'cas_a: ' + CA.recipes.length + ' recipes; skipped ' + CA.skipped.length)
  }

  // UV's antimatter trap, circuit 5 (1-4 are taken: antiproton stack, ICAN, antihydrogen, positronium BEC): four slow positron cartridges
  // are held in a Penning trap under a nitrogen buffer gas, which is only a medium (90% comes back). Earth orbit, like every trap row.
  function addTrap(event) {
    CA.trap = []
    var ids = ['grindless:positron_cartridge', 'grindless:positron_stack']
    var missing = ids.filter(function (id) { return !Item.exists(id) }).concat(['gtceu:nitrogen'].filter(function (id) { return !Fluid.exists(id) }))
    if (missing.length > 0) {
      console.error(LOG + 'positron_stack trap row skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    var orbit = G.orbits ? G.orbits.earth : 'gcyr:overworld_orbit'
    event.recipes.gtceu.antimatter_storage('grindless:positron_stack')
      .itemInputs('4x grindless:positron_cartridge')
      .circuit(5)
      .inputFluids(Fluid.of('gtceu:nitrogen', 100))
      .itemOutputs('grindless:positron_stack')
      .outputFluids(Fluid.of('gtceu:nitrogen', 90))
      .addDataString('grindless_antimatter_storage', 'positron_stack')
      .dimension(orbit)
      .EUt(1966080).duration(1200)
    CA.trap.push('grindless:antimatter_storage/positron_stack')
  }

  function addControllers(event) {
    var HULL = 'gtceu:uiv_machine_hull'
    var MAINFRAME = 'gtnn:spintronic_mainframe'
    var defs = [
      { name: 'ejecta_knot_sweeper', research: 'grindless:cnt_whipple_shield', fluid: 'gtceu:stellar_hydrogen_cut',
        parts: ['2x grindless:uiv_electric_pump', '2x grindless:uiv_conveyor_module', 'grindless:uxv_sensor'],
        domain: ['2x grindless:cnt_bumper_weave', '2x grindless:mh_winding', '2x grindless:ga2o3_power_die'] },
      { name: 'annihilation_laser_works', research: 'grindless:gamma_laser_cavity', fluid: 'gtceu:he_6n',
        parts: ['2x grindless:uiv_field_generator', '2x grindless:uiv_emitter', 'grindless:uxv_sensor'],
        domain: ['2x grindless:mtj_die', '2x grindless:mu_metal_foil', '2x grindless:w184_cvi_preform'] }
    ]
    CA.controllerRecipes = []
    defs.forEach(function (d) {
      var machine = 'gtceu:' + d.name
      var strip = function (s) { return s.replace(/^\d+x /, '') }
      var ids = [HULL, MAINFRAME, d.research].concat(d.parts.map(strip), d.domain.map(strip))
      var missing = ids.concat([machine]).filter(function (id) { return !Item.exists(id) })
      if (!Fluid.exists(d.fluid)) missing.push(d.fluid)
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      b.itemInputs(HULL)
      d.parts.forEach(function (s) { b.itemInputs(s) })
      b.itemInputs('2x ' + MAINFRAME)
      b.itemInputs('4x #gtceu:circuits/uiv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of(d.fluid, 1000), Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000))
      b.itemOutputs(machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(7864320) })
      b.EUt(7864320).duration(1500)
      CA.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // the UXV emitter: a UIV emitter pair rebuilt around the gamma laser module (researched with it), on lasagna plates and UXV circuits.
  // It opens the UXV parallel hatch and the UXV wireless dynamo hatches and cover.
  function addEmitter(event) {
    var items = ['2x grindless:uiv_emitter', '1x grindless:gamma_laser_module', '2x grindless:lasagna_plate', '1x grindless:uxv_sensor', '2x grindless:mtj_die']
    var ids = items.map(function (s) { return s.replace(/^\d+x /, '') }).concat(['grindless:uxv_emitter'])
    var missing = ids.filter(function (id) { return !Item.exists(id) })
    if (!Fluid.exists('gtceu:stellar_hydrogen_cut')) missing.push('gtceu:stellar_hydrogen_cut')
    CA.emitter = []
    if (missing.length > 0) {
      console.error(LOG + 'uxv_emitter skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:uxv_emitter')
    items.forEach(function (s) { b.itemInputs(s) })
    b.itemInputs('4x #gtceu:circuits/uxv')
    b.inputFluids(Fluid.of('gtceu:stellar_hydrogen_cut', 1000), Fluid.of('gtceu:soldering_alloy', 2304))
    b.itemOutputs('grindless:uxv_emitter')
    b.stationResearch(function (r) { return r.researchStack(Item.of('grindless:gamma_laser_module')).CWUt(64).EUt(7864320) })
    b.EUt(134217728).duration(1200)
    CA.emitter.push('grindless:assembly_line/uxv_emitter')
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['trap', addTrap], ['controllers', addControllers], ['emitter', addEmitter]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'cas_a ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
