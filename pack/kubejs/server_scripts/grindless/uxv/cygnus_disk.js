// priority: -26144
// -----------------------------------------------------------------------------------------------
// Recipes of UXV's accretion disk skimmer, FRC former and BZ dynamo (machines and recipe types: startup_scripts/grindless/uxv/cygnus_disk.js;
// docs/eras/uxv.md, machines 13-15, process lines 30 and 31; package UXV-B3), generated at every server load from
// data/grindless/tables/cygnus_disk.json, plus the controllers' recipes and the field generator's.
//
//   gtceu:disk_skimming        accretion disk skimmer, circuit 1 skim (a wearing MH winding -> 1,000 mB disk plasma); Cygnus X-1 orbit only.
//   gtceu:frc_forming          FRC former, circuit 1 cartridge (500 mB filtered disk plasma + 4 MH windings, 10% worn -> frc_cartridge; orbit
//                              only), 2 flux loading (500 mB filtered disk plasma -> 400 mB flux-loaded plasma + 100 mB hydrogen).
//   gtceu:blandford_znajek     BZ dynamo, a generator: circuit 1 spin down (400 mB flux-loaded plasma -> 2^30 EU/t for 200 t); orbit only.
//   assembly_line              the three controllers (UIV hull + UIV parts + mainframes + UIV circuits + 3 domain items, the era fluid,
//                              soldering alloy, lubricant, behind station research), grindless:assembly_line/<machine>, and the UXV field
//                              generator (line 30: strand coils from the magnet works c9, researched with a cartridge).
//
// Row keys: "site" true puts recipe.dimension(cygnus_x1_orbit) on it; "kept" are not consumed; "wear" are consumed by their chance;
// "generator" writes the EUt negative.
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.cygnusDisk.recipes, .skipped, .clashes, .controllerRecipes, .fieldGeneratorRecipe.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uxv] '
  var G = global.grindless || (global.grindless = {})
  var CD = G.cygnusDisk || (G.cygnusDisk = {})
  var TABLE = CD.table || 'kubejs/data/grindless/tables/cygnus_disk.json'
  var SITE = CD.site || 'grindless:cygnus_x1_orbit'

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
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1)) bad = true
          return { id: String(x.id), count: Number(x.count) }
        }
        var worn = function (x) {
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1) || !(Number(x.chance) >= 1 && Number(x.chance) <= 10000)) bad = true
          return { id: String(x.id), count: Number(x.count), chance: Number(x.chance) }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dataKey: def.dataKey ? String(def.dataKey) : '',
          site: r.site === true, generator: r.generator === true, itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack),
          wear: list(r.wear).map(worn), fluidsIn: list(r.fluidsIn).map(fluid), itemsOut: list(r.itemsOut).map(stack),
          fluidsOut: list(r.fluidsOut).map(fluid) }
        if (bad || (rec.itemsOut.length === 0 && rec.fluidsOut.length === 0 && !rec.generator) ||
          (rec.itemsIn.length === 0 && rec.wear.length === 0 && rec.fluidsIn.length === 0)) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        seen[type + '/' + n] = true
        circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'cygnus_disk: ' + TABLE + ': ' + problems.join('; '))
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
    ;(CD.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
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
    rec.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    if (rec.site) recipe.dimension(SITE)
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
    CD.recipes = []
    CD.skipped = []
    CD.clashes = []
    function skip(name, reason) {
      CD.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'cygnus_disk skipped ' + name + ': ' + reason)
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
      CD.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    CD.clashes = clashesOf(CD.recipes)
    if (CD.clashes.length > 0) console.error(LOG + 'cygnus_disk: recipes whose ingredients are a subset of another\'s: ' + CD.clashes.join('; '))
    console.info(LOG + 'cygnus_disk: ' + CD.recipes.length + ' recipes; skipped ' + CD.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uiv_machine_hull'
    var MAINFRAME = 'gtnn:spintronic_mainframe'
    var defs = [
      { name: 'accretion_disk_skimmer', research: 'grindless:mh_winding', fluid: 'gtceu:stellar_hydrogen_cut',
        parts: ['2x grindless:uiv_electric_motor', '2x grindless:uiv_emitter', 'grindless:uxv_sensor'],
        domain: ['2x grindless:ga2o3_power_die', '2x grindless:w184_cvi_preform', '2x grindless:shielded_interposer'] },
      { name: 'frc_former', research: 'gtceu:accretion_disk_skimmer', fluid: 'gtceu:stellar_hydrogen_cut',
        parts: ['2x grindless:uiv_field_generator', '2x grindless:uiv_electric_pump', 'grindless:uxv_sensor'],
        domain: ['2x grindless:ga2o3_power_die', '2x grindless:mh_winding', '2x grindless:vuv_caf2_optic'] },
      { name: 'bz_dynamo', research: 'gtceu:frc_former', fluid: 'gtceu:filtered_disk_plasma',
        parts: ['2x grindless:uiv_field_generator', '2x grindless:uiv_electric_piston', 'grindless:uxv_sensor'],
        domain: ['2x grindless:frc_cartridge', '2x grindless:ga2o3_power_die', '2x grindless:mh_winding'] }
    ]
    CD.controllerRecipes = []
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
      CD.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // line 30: two strand coils (each holds a cartridge), a UIV field generator, windings and plates; researched with a cartridge
  function addFieldGenerator(event) {
    var OUTPUT = 'grindless:uxv_field_generator'
    var RESEARCH = 'grindless:frc_cartridge'
    var PLASMA = 'gtceu:filtered_disk_plasma'
    var items = ['2x grindless:strand_coil', 'grindless:uiv_field_generator', '2x grindless:mh_winding', '2x gtceu:rhea_plate']
    var ids = [OUTPUT, RESEARCH, 'grindless:strand_coil', 'grindless:uiv_field_generator', 'grindless:mh_winding', 'gtceu:rhea_plate']
    var missing = ids.filter(function (id) { return !Item.exists(id) })
    if (!Fluid.exists(PLASMA)) missing.push(PLASMA)
    CD.fieldGeneratorRecipe = ''
    if (missing.length > 0) {
      console.error(LOG + 'uxv_field_generator recipe skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:uxv_field_generator')
    items.forEach(function (s) { b.itemInputs(s) })
    b.itemInputs('4x #gtceu:circuits/uxv')
    b.inputFluids(Fluid.of(PLASMA, 1000), Fluid.of('gtceu:soldering_alloy', 4608), Fluid.of('gtceu:lubricant', 4000))
    b.itemOutputs(OUTPUT)
    b.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(128).EUt(31457280) })
    b.EUt(31457280).duration(1200)
    CD.fieldGeneratorRecipe = 'grindless:assembly_line/uxv_field_generator'
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers], ['field generator', addFieldGenerator]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'cygnus_disk ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
