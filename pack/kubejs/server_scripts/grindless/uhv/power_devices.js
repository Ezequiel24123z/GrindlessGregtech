// priority: -23724
// -----------------------------------------------------------------------------------------------
// Recipes of UHV's SiC device fab and solar array fab (machines and recipe types: startup_scripts/grindless/uhv/power_devices.js;
// docs/eras/uhv.md, machines 7 and 8, lines 10 and 21; package UHV-A5), generated at every server load from
// data/grindless/tables/power_devices.json, plus the recipes of the two controllers and the package's GTM side rows.
//
//   gtceu:silicon_carbide / gtceu:space_photovoltaics   one recipe per table entry, id grindless:<type>/<name>; the programmed circuit
//                          picks the recipe; every recipe carries the data key of its type = <name> (its EMI line). "kept" entries are
//                          GTM's non-consumed item inputs, "charge" the same for fluids (the argon of the boule and the anneal).
//                          The fab is the only maker of grindless:sic_power_module and grindless:sic_mirror_blank.
//     line 10: GTCA's silicon carbide dust -> boule (c1) -> GTM cutter: 8 wafers -> epi wafer (c2) -> ZPM ion implanter's aluminium
//              (A4's photonics.json, circuit 4) -> 1,700 °C anneal (c3) -> device wafer -> 4 SiC power modules (c4)
//     line 21: UV's MOCVD reactor (circuit 7, uv/photonics.js) grows the IMM epi wafer inverted on GaAs -> lift-off (c1): eight wafers
//              give eight films and seven GaAs substrates back; the eighth, worn, comes back as gallium arsenide dust (UV's blast
//              furnace boule takes 8) -> coverglass laminate (c2, c3: + UV's InGaAs epi wafer for the red-tuned junction)
//   gtceu:cutter           GTM, no circuit: SiC boule + lubricant -> 8 SiC wafers (UV's GaAs and sapphire wafers are cut the same way).
//   gtceu:alloy_smelter    GTM, no circuit: borosilicate glass dust + cerium dust -> cerium-doped coverglass (the ceria keeps the
//                          glass from browning under ultraviolet and protons).
//   crafting               the controllers: UHV hull + 2 UV robot arms + 2 UHV circuits each, in two shapes (and not the crystal
//                          growth furnace's), assembly lines grindless:assembly_line/<machine>.
//                          Each is an assembly line: station research, tritanium + soldering alloy + lubricant, 3 domain items of its own line.
//
// Destinations (rule 3 of AGENTS.md):
//   hydrogen (epi)         -> back into the epi or GTM's hydrochloric acid (the contract's HCl: the silane route brings no chlorine in)
//   arsine (lift-off)      -> UV's MOCVD reactor: the epi rows (circuits 2 and 7) or the scrubber (circuit 6); never voided
//   gallium arsenide dust  -> UV's blast furnace GaAs boule (gallium and arsenic recovered, the arsenic contained)
//   argon (boule, anneal)  -> charge, never used up
//
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.uhvPowerDevices.recipes [{ type, name, recipeId, ... }], .skipped, .clashes,
// .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var PD = G.uhvPowerDevices || (G.uhvPowerDevices = {})
  var TABLE = PD.table || 'kubejs/data/grindless/tables/power_devices.json'
  // GTM's own types are not size-checked and their circuit is optional (0 = none)
  var GTM_TYPES = { cutter: true, alloy_smelter: true }

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
          dataKey: def.dataKey ? String(def.dataKey) : '',
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
    if (problems.length > 0) console.error(LOG + 'power devices: ' + TABLE + ': ' + problems.join('; '))
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
    Object.keys(PD.machines || {}).forEach(function (k) { if (PD.machines[k].type === type) io = PD.machines[k].maxIO })
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
    PD.recipes = []
    PD.skipped = []
    PD.clashes = []
    function skip(name, reason) {
      PD.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'power devices skipped ' + name + ': ' + reason)
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
      PD.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    PD.clashes = clashesOf(PD.recipes)
    if (PD.clashes.length > 0) console.error(LOG + 'power devices: recipes whose ingredients are a subset of another\'s: ' + PD.clashes.join('; '))
    console.info(LOG + 'power devices: ' + PD.recipes.length + ' recipes; skipped ' + PD.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var ARM = 'gtceu:uv_robot_arm'
    var defs = [
      { machine: PD.machines.fab.machine, parts: [HULL, ARM], research: 'grindless:mu_metal_shield', domain: ['4x grindless:gallium_arsenide_wafer', '2x grindless:silicon_nitride_film', '2x grindless:srf_cavity'], name: 'sic_device_fab' },
      { machine: PD.machines.arrays.machine, parts: [HULL, ARM], research: 'grindless:gallium_arsenide_wafer', domain: ['4x grindless:silicon_nitride_film', '2x grindless:fibre_bragg_grating', '2x grindless:mu_metal_shield'], name: 'solar_array_fab' }
    ]
    PD.controllerRecipes = []
    defs.forEach(function (d) {
      var missing = d.parts.concat([d.machine, d.research], d.domain.map(function (s) { return s.replace(/^\d+x /, '') })).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      d.parts.forEach(function (s, i) { b.itemInputs(i === 0 ? s : '2x ' + s) })
      b.itemInputs('4x #gtceu:circuits/uhv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:tritanium', 1152))
      b.itemOutputs(d.machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(1966080) })
      b.EUt(1966080).duration(1500)
      PD.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'power devices ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
