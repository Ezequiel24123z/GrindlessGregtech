// priority: -26152
// -----------------------------------------------------------------------------------------------
// Recipes of UXV's Vela pasta works (machines and recipe types: startup_scripts/grindless/uxv/vela_pasta.js; docs/eras/uxv.md, machines 16-20,
// process lines 32, 33 and 48; package UXV-B4), generated at every server load from data/grindless/tables/vela_pasta.json, plus the five
// controllers' recipes and line 48's GTM-type steps.
//
//   gtceu:pasta_extraction     pasta extractor, circuit 1 raw pasta (a timing record kept, a pellet worn at 10%).
//   gtceu:pasta_sorting        phase sorter, circuit 1 raw pasta -> spaghetti, lasagna, gnocchi, anti-phase residue; 2 residue -> core sample.
//   gtceu:pasta_drawing        draw bench, circuit 1 spaghetti -> eight strands of pasta wire.
//   gtceu:pasta_lamination     laminator, circuit 1 lasagna -> four plates; 2 plate + wire -> polar cap electrode.
//   gtceu:polar_cap_tapping    polar cap tap (a generator), circuit 1 lasagna electrode -> 536,870,912 EU/t for 720 t.
//   gtceu:neutronium_caging    UIV's type, one circuit-less companion row: pellet + mh winding -> cage part (circuits 1 and 2 are taken).
//   assembler                  line 48: the wound finemet toroid, the voltage coil, the pasta strand repeater (machine form).
//   assembly_line              the five controllers, grindless:assembly_line/<machine>.
//
// Row keys: "site" true puts recipe.dimension(vela_pulsar_orbit) on it (a string names another site); "kept" are not consumed; "wear" are chanced
// inputs. A type with "noCircuit" accepts circuit 0; "external" types are UIV's (their slots in "maxIO"); "generator" types make EU.
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.velaPasta.recipes, .skipped, .clashes, .controllerRecipes, .line48.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uxv] '
  var G = global.grindless || (global.grindless = {})
  var VP = G.velaPasta || (G.velaPasta = {})
  var TABLE = VP.table || 'kubejs/data/grindless/tables/vela_pasta.json'
  var SITE = VP.site || 'grindless:vela_pulsar_orbit'

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
        var circuitOk = circuit >= (def.noCircuit === true ? 0 : 1) && circuit <= 32 && circuit % 1 === 0 && (circuit === 0 || !circuits[circuit])
        if (!/^[a-z0-9_]+$/.test(n) || seen[type + '/' + n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration)
          return
        }
        var bad = false
        var stack = function (x) {
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1)) bad = true
          return { id: String(x.id), count: Number(x.count), chance: Number(x.chance) }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dataKey: def.dataKey ? String(def.dataKey) : '',
          generator: def.generator === true, maxIO: def.maxIO || null, site: r.site === true ? SITE : (typeof r.site === 'string' ? String(r.site) : ''),
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), wear: list(r.wear).map(stack), fluidsIn: list(r.fluidsIn).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        var hasInput = rec.itemsIn.length + rec.kept.length + rec.wear.length + rec.fluidsIn.length > 0
        var hasOutput = rec.itemsOut.length + rec.fluidsOut.length > 0
        if (bad || (!hasOutput && !rec.generator) || !hasInput) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        seen[type + '/' + n] = true
        if (circuit > 0) circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'vela_pasta: ' + TABLE + ': ' + problems.join('; '))
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
    var io = rec.maxIO
    ;(VP.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
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
    if (rec.site !== '') recipe.dimension(rec.site)
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
    VP.recipes = []
    VP.skipped = []
    VP.clashes = []
    function skip(name, reason) {
      VP.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'vela_pasta skipped ' + name + ': ' + reason)
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
      VP.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    VP.clashes = clashesOf(VP.recipes)
    if (VP.clashes.length > 0) console.error(LOG + 'vela_pasta: recipes whose ingredients are a subset of another\'s: ' + VP.clashes.join('; '))
    console.info(LOG + 'vela_pasta: ' + VP.recipes.length + ' recipes; skipped ' + VP.skipped.length)
  }

  // line 48 (docs/eras/uxv.md): the wound toroid (A3's c16 field anneal turns it into finemet_core), the strand-wound voltage coil, the repeater
  function addLine48(event) {
    VP.line48 = []
    var rows = [
      { name: 'finemet_toroid', items: ['6x grindless:finemet_ribbon', '1x gtceu:tungsten_steel_ring', '2x gtceu:copper_foil', '1x gtceu:rhea_plate'],       fluids: [['gtceu:epoxy', 144], ['gtceu:he_6n', 250]],
        out: 'grindless:finemet_toroid', eut: 7864320, duration: 300 },
      { name: 'uxv_voltage_coil', items: ['1x grindless:finemet_core', '8x gtceu:pasta_strand_single_wire', '2x gtceu:rhea_plate', '1x grindless:ffkm_seal'],
        fluids: [['gtceu:epoxy', 144], ['gtceu:he_6n', 500]], out: 'grindless:uxv_voltage_coil', eut: 7864320, duration: 400 },
      { name: 'pasta_strand_repeater', items: ['2x gtceu:pasta_strand_single_wire', '1x grindless:pulsar_timed_repeater', '1x grindless:mtj_die'],
        fluids: [['gtceu:soldering_alloy', 144], ['gtceu:lubricant', 100]], out: 'grindless:pasta_strand_repeater', eut: 7864320, duration: 300 }
    ]
    rows.forEach(function (r) {
      var ids = r.items.map(function (s) { return s.replace(/^\d+x /, '') }).concat([r.out])
      var missing = ids.filter(function (id) { return !Item.exists(id) }).concat(r.fluids.map(function (f) { return f[0] }).filter(function (id) { return !Fluid.exists(id) }))
      if (missing.length > 0) {
        console.error(LOG + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembler('grindless:' + r.name)
      r.items.forEach(function (s) { b.itemInputs(s) })
      r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
      b.itemOutputs(r.out)
      b.EUt(r.eut).duration(r.duration)
      VP.line48.push('grindless:assembler/' + r.name)
    })
  }

  function addControllers(event) {
    var HULL = 'gtceu:uiv_machine_hull'
    var MAINFRAME = 'gtnn:spintronic_mainframe'
    var defs = [
      { name: 'pasta_extractor', research: 'grindless:vela_glitch_timing', fluid: 'gtceu:filtered_disk_plasma',
        parts: ['2x grindless:uiv_field_generator', '2x grindless:uiv_emitter', 'grindless:uxv_sensor'],
        domain: ['2x grindless:cage_part', '2x grindless:frc_cartridge', '2x grindless:neutronium_pellet'] },
      { name: 'pasta_phase_sorter', research: 'grindless:cage_part', fluid: 'gtceu:filtered_disk_plasma',
        parts: ['2x grindless:uiv_conveyor_module', '2x grindless:uiv_electric_pump', 'grindless:uxv_sensor'],
        domain: ['2x grindless:frc_cartridge', '2x grindless:neutronium_pellet', '2x grindless:ga2o3_power_die'] },
      { name: 'pasta_draw_bench', research: 'gtceu:pasta_phase_sorter', fluid: 'gtceu:stellar_helium_cut',
        parts: ['2x grindless:uiv_electric_motor', '2x grindless:uiv_robot_arm', 'grindless:uxv_sensor'],
        domain: ['2x grindless:cage_part', '2x grindless:frc_cartridge', '2x grindless:uxv_strain_wave_gear'] },
      { name: 'pasta_laminator', research: 'grindless:wf_rhea_billet', fluid: 'gtceu:filtered_disk_plasma',
        parts: ['2x grindless:uiv_electric_piston', '2x grindless:uiv_robot_arm', 'grindless:uxv_sensor'],
        domain: ['2x grindless:cage_part', '2x grindless:frc_cartridge', '2x grindless:w184_cvi_preform'] },
      { name: 'polar_cap_tap', research: 'gtceu:pasta_laminator', fluid: 'gtceu:filtered_disk_plasma',
        parts: ['2x grindless:uiv_electric_motor', '2x grindless:uiv_electric_pump', 'grindless:uxv_sensor'],
        domain: ['2x grindless:frc_cartridge', '2x grindless:ga2o3_power_die', '2x grindless:mh_winding'] }
    ]
    VP.controllerRecipes = []
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
      VP.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['line48', addLine48], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'vela_pasta ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
