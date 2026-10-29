// priority: -24571
// -----------------------------------------------------------------------------------------------
// Recipes of UIV's PSR J0437-4715 machines (machines and recipe types: startup_scripts/grindless/uiv/j0437.js; docs/eras/uiv.md,
// machines 18 to 20, lines 34, 38 and 45; package UIV-B3), generated at every server load from data/grindless/tables/j0437.json, plus the
// controllers' recipes.
//
//   gtceu:pulsar_wind_trapping       pulsar wind trap, circuit 1 pair plasma (a metallic hydrogen coil block kept). Only at J0437.
//   gtceu:positronium_condensation   positronium condensate lab, circuit 1 Ps in aerogel, 2 laser-cooled Ps (the 243 nm laser kept),
//                                    3 gamma laser cavity. Only at J0437.
//   gtceu:xray_pulse_profiling       X-ray pulse profiler, circuit 1 raw J0437 profile (the UEV chart kept), 2 navigation solution. Only at J0437.
//   gtceu:positron_accumulation      the two own rows on older machines: circuit 4 on UHV's positron accumulator (pair plasma -> cooled
//   gtceu:antimatter_storage         positrons) and on UV's antimatter trap (laser-cooled Ps -> Ps BEC). Both carry the J0437 dimension,
//                                    so they are not in tables/antimatter.json or tables/accelerators.json (their orbit flag is Earth orbit).
//   assembler, cutter, laser_engraver, distillery, vacuum_freezer   the GTM steps of lines 34, 38 and 45 and the UIV emitter (ids grindless:<name>).
//   assembly_line                    the controllers: UIV hull + 2 UIV parts + 2 optical mainframes + UIV circuits + 3 line items, with
//                                    soldering alloy, lubricant and neutronium, behind station research, grindless:assembly_line/<machine>.
//
// A recipe whose "site" is true gets dimension grindless:psr_j0437_orbit. Lookup safety: a recipe whose ingredients are a subset of another's
// of its type can hide it; checked at load (a clash is an error). Published for the smoke test: global.grindless.j0437.recipes, .skipped,
// .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uiv] '
  var G = global.grindless || (global.grindless = {})
  var J = G.j0437 || (G.j0437 = {})
  var TABLE = J.table || 'kubejs/data/grindless/tables/j0437.json'
  var SITE = J.site || 'grindless:psr_j0437_orbit'
  var GTM_TYPES = { assembler: true, cutter: true, laser_engraver: true, distillery: true, vacuum_freezer: true }
  // older machines' types (UHV positron accumulator, UV antimatter trap): slots as their startup scripts define them
  var OLD_IO = {
    positron_accumulation: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
    antimatter_storage: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 }
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
        var circuitOk = ((optional && circuit === 0) || (circuit >= 1 && circuit <= 32 && circuit % 1 === 0)) && (circuit === 0 || !circuits[circuit])
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
          site: r.site === true,
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), fluidsIn: list(r.fluidsIn).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        var hasInput = rec.itemsIn.length + rec.kept.length + rec.fluidsIn.length > 0
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
    if (problems.length > 0) console.error(LOG + 'j0437: ' + TABLE + ': ' + problems.join('; '))
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
    var io = OLD_IO[rec.type] || null
    ;(J.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
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
    if (rec.site) recipe.dimension(SITE)
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
    J.recipes = []
    J.skipped = []
    J.clashes = []
    function skip(name, reason) {
      J.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'j0437 skipped ' + name + ': ' + reason)
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
      J.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    J.clashes = clashesOf(J.recipes)
    if (J.clashes.length > 0) console.error(LOG + 'j0437: recipes whose ingredients are a subset of another\'s: ' + J.clashes.join('; '))
    console.info(LOG + 'j0437: ' + J.recipes.length + ' recipes; skipped ' + J.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uiv_machine_hull'
    var MAINFRAME = 'gtnn:optical_mainframe'
    var defs = [
      { name: 'pulsar_wind_trap', part: 'grindless:uiv_electric_motor', research: 'grindless:gamma_bragg_mirror', domain: ['2x grindless:neon_moderator_cartridge', '2x grindless:c12_ion_milled_plate', '2x grindless:annealed_neon_cone'] },
      { name: 'positronium_condensate_lab', part: 'grindless:uiv_electric_pump', research: 'grindless:neon_moderator_cartridge', domain: ['2x grindless:gamma_bragg_mirror', '2x grindless:c12_004_plate', '2x grindless:annealed_neon_cone'] },
      { name: 'xray_pulse_profiler', part: 'grindless:uiv_sensor', research: 'grindless:c12_ion_milled_plate', domain: ['2x grindless:gamma_bragg_mirror', '2x grindless:neon_moderator_cartridge', '2x grindless:c12_004_plate'] }
    ]
    J.controllerRecipes = []
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
      J.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'j0437 ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
