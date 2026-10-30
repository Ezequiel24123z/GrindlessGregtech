// priority: -24699
// -----------------------------------------------------------------------------------------------
// Recipes of UV's synchrotron, muon fusion cell and antimatter trap (machines and recipe types: startup_scripts/grindless/uv/accelerators.js;
// docs/eras/uv.md, machines 7, 8 and 22, lines 5, 18 and 22; package UV-A5), generated at every server load from
// data/grindless/tables/accelerators.json, plus the controllers and the GTM rows that feed the lines.
//
//   gtceu:synchrotron / gtceu:antimatter_storage   one recipe per table entry, id grindless:<type>/<name>; the programmed circuit picks
//                          the recipe; every recipe carries the data key of its type = <name> (its EMI line). "charge" entries are GTM's
//                          non-consumed fluid inputs, "kept" the same for items; chancedIn / chancedOut are GTM's chanced ingredients
//                          (chance out of 10,000). orbit: true adds .dimension(G.orbits.earth): the trap works only in Earth orbit.
//   gtceu:muon_catalysed_fusion   the generator: eut is the EU/t GIVEN, written as -eut, final (not in power/generators.js TYPES).
//   GTM types              vacuum_freezer, chemical_reactor, mixer, chemical_bath, assembler, cutter: rows keyed by our new items or fluids
//                          (id grindless:<type>/<name>, no circuit); cleanroom: true asks GTM's cleanroom.
//   crafting               the controllers, shaped recipes grindless:crafting/<machine>: UV hull + 2 UV field generators + 2 UV sensors +
//                          4 UV circuits (synchrotron); UV hull + UV emitter + 2 UV pumps + 4 UV circuits (cell); UV hull + UV field
//                          generator + 2 UV sensors + 4 UV circuits (trap).
//
// Destinations: the activated tungsten target -> the chemical bath's cooling pond row (tungsten and copper dust back); the beam's hydrogen
// and the reactor's -> any hydrogen use; helium -> the superfluid helium plant (uv/cold.js) or LuV's helium refrigerator; bred tritium ->
// the vacuum freezer's liquid D-T row; diluted sulfuric acid -> GTM's distillation back to sulfuric acid; the developer is a charge, never
// drained; empty cartridges and traps come back out and are refilled.
// UHV rows (UHV-A6, docs/eras/uhv.md line 27; inline in UHV_ROWS, not in the table): synchrotron circuit 5 sodium_22 (24Mg(d,alpha)22Na:
// the magnesium-24 target from uhv/antimatter.js's assembler row -> the sodium-22 target for the positron accumulator; the helium -> the
// superfluid helium plant) and antimatter trap circuit 3 antihydrogen (in Earth orbit: an antiproton cartridge and a positron cartridge
// merged under helium II; the antiproton cartridge's shell comes back, the positron cartridge's trap becomes the antihydrogen cartridge).
// Their builder id is 'grindless:<name>' (GTM adds the type: grindless:<type>/<name>); published as .uhvRows.
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.accelerators.recipes [{ type, name, recipeId, ... }], .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var AC = G.accelerators || (G.accelerators = {})
  var TABLE = AC.table || 'kubejs/data/grindless/tables/accelerators.json'
  var GENERATOR = 'muon_catalysed_fusion'
  var OWN = { synchrotron: true, muon_catalysed_fusion: true, antimatter_storage: true }
  var ORBIT = G.orbits ? G.orbits.earth : 'gcyr:overworld_orbit'
  var CleanroomType = Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.CleanroomType')

  // UHV-A6's rows on these UV machines, in the table's rec shape (dataKey and recipeId are filled in by generate)
  var UHV_ROWS = [
    { type: 'synchrotron', name: 'sodium_22', circuit: 5, eut: 491520, duration: 800, orbit: false, cleanroom: false,
      itemsIn: [{ id: 'grindless:magnesium_target', count: 1 }], kept: [], chancedIn: [],
      fluidsIn: [{ id: 'gtceu:deuterium', amount: 250 }], charge: [],
      itemsOut: [{ id: 'grindless:sodium_22_target', count: 1 }], chancedOut: [],
      fluidsOut: [{ id: 'gtceu:helium', amount: 250 }] },
    { type: 'antimatter_storage', name: 'antihydrogen', circuit: 3, eut: 1966080, duration: 1000, orbit: true, cleanroom: false,
      itemsIn: [{ id: 'grindless:antiproton_cartridge', count: 1 }, { id: 'grindless:positron_cartridge', count: 1 }], kept: [], chancedIn: [],
      fluidsIn: [{ id: 'gtceu:superfluid_helium', amount: 100 }], charge: [],
      itemsOut: [{ id: 'grindless:antihydrogen_cartridge', count: 1 }, { id: 'grindless:empty_antiproton_cartridge', count: 1 }], chancedOut: [],
      fluidsOut: [{ id: 'gtceu:helium', amount: 100 }] }
  ]

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
      var noCircuit = !OWN[type] || type === GENERATOR
      list(t.types[type].recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var circuitOk = noCircuit ? circuit === 0 : (circuit >= 1 && circuit <= 32 && !circuits[circuit])
        if (!/^[a-z0-9_]+$/.test(n) || names[n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration)
          return
        }
        var bad = false
        var stack = function (x) {
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1)) bad = true
          return { id: String(x.id), count: Number(x.count) }
        }
        var chanced = function (x) {
          var c = Number(x.chance)
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1) || !(c >= 1 && c <= 9999) || c % 1 !== 0) bad = true
          return { id: String(x.id), count: Number(x.count), chance: c }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dataKey: t.types[type].dataKey ? String(t.types[type].dataKey) : '',
          orbit: r.orbit === true, cleanroom: r.cleanroom === true,
          site: r.site ? String(r.site) : '',
          builderId: r.builderId ? String(r.builderId) : '',
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), chancedIn: list(r.chancedIn).map(chanced),
          fluidsIn: list(r.fluidsIn).map(fluid), charge: list(r.charge).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), chancedOut: list(r.chancedOut).map(chanced), fluidsOut: list(r.fluidsOut).map(fluid) }
        if (bad || (rec.itemsOut.length === 0 && rec.chancedOut.length === 0 && rec.fluidsOut.length === 0) ||
            (rec.itemsIn.length === 0 && rec.fluidsIn.length === 0)) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        names[n] = true
        circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'accelerators: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.chancedIn, rec.itemsOut, rec.chancedOut).forEach(function (x) {
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    rec.fluidsIn.concat(rec.charge, rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    if (!OWN[rec.type]) return null
    var def = null
    Object.keys(AC.machines).forEach(function (k) { if (AC.machines[k].type === rec.type) def = AC.machines[k] })
    if (def === null) return 'no machine for type ' + rec.type
    var io = def.maxIO
    var circuit = rec.circuit > 0 ? 1 : 0
    var itemsOut = rec.itemsOut.length + rec.chancedOut.length
    if (rec.itemsIn.length + rec.kept.length + rec.chancedIn.length + circuit > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length + rec.charge.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (itemsOut > io.itemsOut) return itemsOut + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu[rec.type](rec.builderId || rec.recipeId)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    rec.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
    rec.chancedIn.forEach(function (x) { recipe.chancedInput(x.count + 'x ' + x.id, x.chance, 0) })
    if (rec.circuit > 0) recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.charge.forEach(function (x) { recipe.notConsumableFluid(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    rec.chancedOut.forEach(function (x) { recipe.chancedOutput(x.count + 'x ' + x.id, x.chance, 0) })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    if (rec.orbit) recipe.dimension(ORBIT)
    // OpV-D2's older crossing processes Cygnus plasma at its source.
    if (rec.site) recipe.dimension(rec.site)
    if (rec.cleanroom) recipe.cleanroom(CleanroomType.CLEANROOM)
    recipe.EUt(rec.type === GENERATOR ? -rec.eut : rec.eut).duration(rec.duration)
  }

  function keysOf(rec) {
    var keys = {}
    rec.itemsIn.concat(rec.kept, rec.chancedIn).forEach(function (x) { keys['i:' + x.id] = true })
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
    AC.recipes = []
    AC.skipped = []
    AC.clashes = []
    function skip(name, reason) {
      AC.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'accelerators skipped ' + name + ': ' + reason)
    }
    function addOne(rec) {
      var missing = missingIds(rec)
      if (missing.length > 0) return skip(rec.type + '/' + rec.name, 'unknown id(s): ' + missing.join(', '))
      var tooBig = sizeProblem(rec)
      if (tooBig !== null) return skip(rec.type + '/' + rec.name, tooBig)
      try {
        add(event, rec)
      } catch (e) {
        return skip(rec.type + '/' + rec.name, 'the builder failed: ' + e)
      }
      AC.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    }
    var tableRecs = loadTable()
    tableRecs.forEach(function (rec) {
      rec.recipeId = 'grindless:' + rec.type + '/' + rec.name
      addOne(rec)
    })
    AC.uhvRows = []
    UHV_ROWS.forEach(function (row) {
      var rec = {}
      Object.keys(row).forEach(function (k) { rec[k] = row[k] })
      var def = null
      Object.keys(AC.machines).forEach(function (k) { if (AC.machines[k].type === rec.type) def = AC.machines[k] })
      rec.dataKey = def !== null && def.dataKey ? String(def.dataKey) : ''
      rec.recipeId = 'grindless:' + rec.type + '/' + rec.name
      rec.builderId = 'grindless:' + rec.name
      var taken = tableRecs.some(function (t) { return t.type === rec.type && (t.circuit === rec.circuit || t.name === rec.name) })
      if (taken) return skip(rec.type + '/' + rec.name, 'circuit ' + rec.circuit + ' or name already used by the table')
      addOne(rec)
      if (AC.recipes.indexOf(rec) >= 0) AC.uhvRows.push(rec.recipeId)
    })
    AC.clashes = clashesOf(AC.recipes)
    if (AC.clashes.length > 0) console.error(LOG + 'accelerators: recipes whose ingredients are a subset of another\'s: ' + AC.clashes.join('; '))
    console.info(LOG + 'accelerators: ' + AC.recipes.length + ' recipes; skipped ' + AC.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uv_machine_hull'
    var SENSOR = 'gtceu:uv_sensor'
    var FIELD = 'gtceu:uv_field_generator'
    var EMITTER = 'gtceu:uv_emitter'
    var PUMP = 'gtceu:uv_electric_pump'
    var C = '#gtceu:circuits/uv'
    // station research of a component of the line; each controller reads a different one and takes different parts (GTM's lookup ignores counts)
    var defs = [
      { machine: AC.machines.synchrotron.machine, parts: [HULL, FIELD, SENSOR], domain: ['2x grindless:x_ray_mask', '8x grindless:silicon_nitride_film', '4x grindless:pmma_coated_wafer'], research: 'grindless:x_ray_mask', name: 'synchrotron' },
      { machine: AC.machines.cell.machine, parts: [HULL, EMITTER, PUMP], domain: ['2x grindless:tungsten_target', '2x grindless:empty_antiproton_cartridge', 'grindless:lithium_breeder_blanket'], research: 'grindless:tungsten_target', name: 'muon_fusion_cell' },
      { machine: AC.machines.trap.machine, parts: [HULL, FIELD, SENSOR], domain: ['4x grindless:empty_antiproton_cartridge', '2x grindless:tungsten_target', 'grindless:empty_antiproton_trap'], research: 'grindless:empty_antiproton_trap', name: 'antimatter_trap' }
    ]
    AC.controllerRecipes = []
    defs.forEach(function (d) {
      var missing = d.parts.concat([d.machine, d.research]).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      b.itemInputs(d.parts[0], '2x ' + d.parts[1], '2x ' + d.parts[2], '4x ' + C)
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 1000), Fluid.of('gtceu:tritanium', 576))
      b.itemOutputs(d.machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(491520) })
      b.EUt(491520).duration(1200)
      AC.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'accelerators ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
