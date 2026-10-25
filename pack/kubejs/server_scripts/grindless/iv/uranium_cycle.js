// -----------------------------------------------------------------------------------------------
// Recipes of IV's uranium cycle (machines and recipe types: startup_scripts/grindless/iv/uranium_cycle.js; docs/eras/iv.md,
// "Uranium in-situ leach field" and "Fuel fabrication plant"; package IV-A4), generated at every server load from
// data/grindless/tables/uranium_cycle.json, and the recipes that make the two controllers.
//
//   gtceu:in_situ_leaching   one recipe per vein of veins_leach.json (IV-A1's table: the End's pitchblende vein, which no drill takes),
//                            id grindless:in_situ_leaching/<vein>: the vein sample (never used up) + 100 mB sulfuric acid + 50 mB oxygen,
//                            the ion-exchange resin a chanced input (1 %: its wear) -> 2 uraninite dust + GT--'s radioactive waste
//                            (1 %: the radium of the eluate, contained: the field refuses item voiding), .dimension('minecraft:the_end').
//                            Thorium and lead stay in the ground: the acid does not take them. The barren solution is re-injected
//                            inside the recipe; the 100 mB of acid is what the ground keeps.
//   gtceu:fuel_fabrication   the programmed circuit picks the step, ids grindless:fuel_fabrication/<name>:
//                              1 leu_pellets              1 U-235 + 9 U-238 dust + 20,000 mB oxygen -> 10 LEU pellets (UO2), pressed and
//                                                         sintered; 500 mB of hydrogen must be in a hatch and is never used up (the
//                                                         sintering atmosphere goes round inside the furnace)
//                              2 zircaloy_cladding_tube   1 Zircaloy ingot -> 2 cladding tubes on the pilger mill
//                              3 leu_fuel_assembly        10 pellets + 4 tubes + 100 mB helium -> 1 LEU fuel assembly (the reactor's fuel)
//   energy                   every recipe costs the sum of the GTM stages the table names, spent at its maxEUt (IV, 7,680 EU/t):
//                            ceil(energy / 7,680) ticks at ceil(energy / ticks) EU/t, like the hot cell and the platinum plant.
//   crafting                 GTM shaped recipes (iv.md "Controller"):
//                              leach field   IV hull + GTM's HV fluid drilling rig + 2 IV electric pumps + IV chemical bath + 4 IV circuits
//                              fuel plant    IV hull + IV forming press + IV extruder + IV assembler + 4 IV circuits
//
// Lookup safety: GTM's recipe lookup keeps one recipe per set of ingredients (counts ignored), and a recipe whose ingredients are a subset
// of another's can hide it. Every recipe of each type is checked against the others at load (the vein sample and the circuit count): a
// clash is logged as an error. The bench test gg_test_recipe_lookup asks GTM's own lookup.
//
// Destinations: uraninite -> the hot cell's enrichment (mode 1), whose U-235 and U-238 come back here for the pellets; the waste ->
// stored, contained (the hot cell's store); the assembly -> the fission reactor. Zircaloy comes from GTCA's End zircon (IV-A1's
// mixer, GTM's blast furnace), the helium from the Moon, the acid from the LV contact process, the resin from IV-A1's recipe.
//
// Published for the smoke test: global.grindless.uraniumCycle.recipes [{ id, recipeId, kind ('leaching' | 'fabrication'), name, vein,
// sample, circuit, itemsIn: [{ id, count, chance }] (chance 10000 = used up, 0 = never used up, between = a chanced input), fluidsIn, fluidsKept: [{ id, amount }], itemsOut: [{ id,
// whole, chance }], dimension, stages: [{ stage, eu, times, from }], energy, eut, duration }], .skipped [{ name, reason }], .clashes,
// .maxEut, .craftingRecipes { field, plant }, .craftingParts { field, plant }.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/iv] '
  var G = global.grindless || (global.grindless = {})
  var UC = G.uraniumCycle || (G.uraniumCycle = {})
  var IVF = G.ivFoundation || (G.ivFoundation = {})

  var TABLE = UC.table || 'kubejs/data/grindless/tables/uranium_cycle.json'
  var MAX_CHANCE = 10000

  var FIELD = 'gtceu:isr_wellfield'
  var PLANT = 'gtceu:fuel_fabrication_plant'
  var HULL = 'gtceu:iv_machine_hull'
  var CIRCUIT = '#gtceu:circuits/iv'
  var FIELD_PARTS = [FIELD, HULL, 'gtceu:hv_fluid_drilling_rig', 'gtceu:iv_electric_pump', 'gtceu:iv_chemical_bath']
  var PLANT_PARTS = [PLANT, HULL, 'gtceu:iv_forming_press', 'gtceu:iv_extruder', 'gtceu:iv_assembler']
  UC.craftingRecipes = { field: 'grindless:crafting/isr_wellfield', plant: 'grindless:crafting/fuel_fabrication_plant' }
  UC.craftingParts = { field: FIELD_PARTS, plant: PLANT_PARTS }

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function isId(x) {
    return /^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(String(x || ''))
  }

  // ---------------------------------------------------------------- the table

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var maxEut = Number(t.maxEUt)
    if (!(maxEut > 0)) problems.push('maxEUt ' + t.maxEUt)

    function energyOf(owner, entries) {
      var out = []
      list(entries).forEach(function (e) {
        var eu = Number(e.eu)
        var times = e.times === undefined ? 1 : Number(e.times)
        if (!(eu > 0) || !(times >= 1) || Math.floor(times) !== times) {
          problems.push(owner + ': energy entry ' + JSON.stringify(e))
          return
        }
        out.push({ stage: String(e.stage || ''), eu: eu, times: times, from: e.from || null })
      })
      if (out.length === 0) problems.push(owner + ': no energy')
      return out
    }
    // inputs: chance 10000 (or none) = used up, 0 = never used up (needed in the bus), anything between = a chanced input (wear);
    // outputs: chance 10000 (or none) = whole, anything above 0 = a chanced output of one item
    function items(owner, entries, outputs) {
      return list(entries).map(function (x) {
        var count = Number(x.count)
        var chance = x.chance === undefined ? MAX_CHANCE : Number(x.chance)
        var chanceOk = outputs ? (chance > 0 && chance <= MAX_CHANCE && (chance === MAX_CHANCE || count === 1)) : (chance >= 0 && chance <= MAX_CHANCE)
        if (!isId(x.id) || !(count >= 1) || Math.floor(chance) !== chance || !chanceOk) {
          problems.push(owner + ': item ' + JSON.stringify(x))
        }
        if (!outputs) return { id: String(x.id), count: count, chance: chance }
        return chance < MAX_CHANCE ? { id: String(x.id), whole: 0, chance: chance } : { id: String(x.id), whole: count, chance: 0 }
      })
    }
    function fluids(owner, entries) {
      return list(entries).map(function (f) {
        if (!isId(f.id) || !(Number(f.amount) >= 1)) problems.push(owner + ': fluid ' + JSON.stringify(f))
        return { id: String(f.id), amount: Number(f.amount) }
      })
    }

    var leaching = null
    var l = t.leaching
    if (!l) {
      problems.push('no leaching entry')
    } else {
      var resinChance = Number(l.resin && l.resin.chance)
      if (!l.resin || !isId(l.resin.id) || !(resinChance > 0 && resinChance < MAX_CHANCE)) problems.push('leaching: resin ' + JSON.stringify(l.resin))
      if (!isId(l.dimension)) problems.push('leaching: dimension ' + l.dimension)
      leaching = {
        dimension: String(l.dimension),
        resin: { id: String(l.resin && l.resin.id), chance: resinChance },
        fluidsIn: fluids('leaching', l.fluidsIn),
        itemsOut: items('leaching', l.itemsOut, true),
        stages: energyOf('leaching', l.energy)
      }
      if (leaching.itemsOut.length === 0) problems.push('leaching: no output')
    }

    var steps = []
    var names = {}
    var circuits = {}
    list(t.fabrication).forEach(function (s) {
      var name = String(s.name || '')
      var circuit = Number(s.circuit)
      if (!/^[a-z0-9_]+$/.test(name) || names[name]) {
        problems.push('fabrication step name "' + name + '"')
        return
      }
      if (!(circuit >= 1 && circuit <= 32) || circuits[circuit]) {
        problems.push(name + ': circuit ' + s.circuit + ' (1-32, one per step)')
        return
      }
      names[name] = true
      circuits[circuit] = true
      var step = {
        name: name,
        circuit: circuit,
        itemsIn: items(name, s.itemsIn, false),
        fluidsIn: fluids(name, s.fluidsIn),
        fluidsKept: fluids(name, s.fluidsKept),
        itemsOut: items(name, s.itemsOut, true),
        stages: energyOf(name, s.energy)
      }
      if (step.itemsIn.length + step.fluidsIn.length === 0 || step.itemsOut.length === 0) problems.push(name + ': inputs and outputs are needed')
      steps.push(step)
    })
    if (steps.length === 0) problems.push('no fabrication step')

    if (problems.length > 0) console.error(LOG + 'uranium cycle: ' + TABLE + ': ' + problems.join('; '))
    return { maxEut: maxEut > 0 ? maxEut : 7680, leaching: leaching, steps: steps }
  }

  // the stages' energy spent at maxEut: ceil(energy / maxEut) ticks at ceil(energy / ticks) EU/t (never less than the stages)
  function spend(stages, maxEut) {
    var energy = stages.reduce(function (s, e) { return s + e.eu * e.times }, 0)
    var duration = Math.max(1, Math.ceil(energy / maxEut))
    var eut = Math.ceil(energy / duration)
    return { stagesEnergy: energy, duration: duration, eut: eut, energy: eut * duration }
  }
  UC.spend = spend

  // ---------------------------------------------------------------- building recipes

  function missingIds(rec) {
    var missing = []
    var item = function (id) { if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) }
    var fluid = function (id) { if (!Fluid.exists(id) && missing.indexOf(id) < 0) missing.push(id) }
    if (rec.sample) item(rec.sample)
    rec.itemsIn.forEach(function (x) { item(x.id) })
    rec.itemsOut.forEach(function (x) { item(x.id) })
    rec.fluidsIn.concat(rec.fluidsKept).forEach(function (x) { fluid(x.id) })
    return missing
  }

  function sizeProblem(rec, limits) {
    var itemsIn = rec.itemsIn.length + (rec.sample ? 1 : 0) + (rec.circuit ? 1 : 0)
    var itemsOut = 0
    rec.itemsOut.forEach(function (o) {
      if (o.whole > 0) itemsOut++
      if (o.chance > 0) itemsOut++
    })
    var fluidsIn = rec.fluidsIn.length + rec.fluidsKept.length
    if (itemsIn > limits.itemsIn) return itemsIn + ' item inputs (the type holds ' + limits.itemsIn + ')'
    if (itemsOut > limits.itemsOut) return itemsOut + ' item outputs (the type holds ' + limits.itemsOut + ')'
    if (fluidsIn > limits.fluidsIn) return fluidsIn + ' fluid inputs (the type holds ' + limits.fluidsIn + ')'
    return null
  }

  function outputsOf(recipe, rec) {
    rec.itemsOut.forEach(function (o) {
      if (o.whole > 0) recipe.itemOutputs(o.whole + 'x ' + o.id)
      if (o.chance > 0) recipe.chancedOutput('1x ' + o.id, o.chance, 0)
    })
  }

  // used up, never used up (chance 0) or worn by chance, as the table says
  function inputsOf(recipe, rec) {
    rec.itemsIn.forEach(function (x) {
      if (x.chance >= MAX_CHANCE) recipe.itemInputs(x.count + 'x ' + x.id)
      else if (x.chance === 0) recipe.notConsumable(x.count + 'x ' + x.id)
      else recipe.chancedInput(x.count + 'x ' + x.id, x.chance, 0)
    })
  }

  function addLeach(event, rec) {
    var recipe = event.recipes.gtceu.in_situ_leaching(rec.id)
      .notConsumable(rec.sample)
    inputsOf(recipe, rec)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    outputsOf(recipe, rec)
    recipe.dimension(rec.dimension)
      .EUt(rec.eut)
      .duration(rec.duration)
  }

  function addStep(event, rec) {
    var recipe = event.recipes.gtceu.fuel_fabrication(rec.id)
      .circuit(rec.circuit)
    inputsOf(recipe, rec)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.fluidsKept.forEach(function (x) { recipe.notConsumableFluid(Fluid.of(x.id, x.amount)) })
    outputsOf(recipe, rec)
    recipe.EUt(rec.eut)
      .duration(rec.duration)
  }

  // the lookup keys of a recipe: its items (the sample and the circuit too) and its fluids (kept ones too)
  function keysOf(rec) {
    var keys = {}
    if (rec.sample) keys['i:' + rec.sample] = true
    if (rec.circuit) keys['circuit:' + rec.circuit] = true
    rec.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    rec.fluidsIn.concat(rec.fluidsKept).forEach(function (x) { keys['f:' + x.id] = true })
    return keys
  }

  // pairs of the same type where one recipe's keys are a subset of the other's (equal sets included): GTM's lookup would hide one
  function clashesOf(recs) {
    var out = []
    function subset(a, b) {
      return Object.keys(a).every(function (k) { return b[k] === true })
    }
    for (var i = 0; i < recs.length; i++) {
      for (var j = i + 1; j < recs.length; j++) {
        if (recs[i].kind !== recs[j].kind) continue
        var a = keysOf(recs[i])
        var b = keysOf(recs[j])
        if (subset(a, b) || subset(b, a)) out.push(recs[i].name + ' / ' + recs[j].name)
      }
    }
    return out
  }

  function plans(table) {
    var made = []
    if (table.leaching !== null) {
      var veins = typeof IVF.leachVeins === 'function' ? IVF.leachVeins() : []
      if (veins.length === 0) console.error(LOG + 'uranium cycle: no leach vein (IV-A1\'s veins_leach.json), no leaching recipe')
      veins.forEach(function (vein) {
        var cost = spend(table.leaching.stages, table.maxEut)
        made.push({
          kind: 'leaching',
          name: vein.id,
          vein: vein.id,
          sample: vein.sample,
          veinDimension: vein.dimension,
          circuit: 0,
          itemsIn: [{ id: table.leaching.resin.id, count: 1, chance: table.leaching.resin.chance }],
          fluidsIn: table.leaching.fluidsIn,
          fluidsKept: [],
          itemsOut: table.leaching.itemsOut,
          dimension: table.leaching.dimension,
          stages: table.leaching.stages,
          stagesEnergy: cost.stagesEnergy,
          energy: cost.energy,
          eut: cost.eut,
          duration: cost.duration,
          id: 'grindless:' + vein.id,
          recipeId: 'grindless:in_situ_leaching/' + vein.id
        })
      })
    }
    table.steps.forEach(function (s) {
      var cost = spend(s.stages, table.maxEut)
      made.push({
        kind: 'fabrication',
        name: s.name,
        vein: null,
        sample: null,
        circuit: s.circuit,
        itemsIn: s.itemsIn,
        fluidsIn: s.fluidsIn,
        fluidsKept: s.fluidsKept,
        itemsOut: s.itemsOut,
        dimension: null,
        stages: s.stages,
        stagesEnergy: cost.stagesEnergy,
        energy: cost.energy,
        eut: cost.eut,
        duration: cost.duration,
        id: 'grindless:' + s.name,
        recipeId: 'grindless:fuel_fabrication/' + s.name
      })
    })
    return made
  }

  function generate(event) {
    UC.recipes = []
    UC.skipped = []
    UC.clashes = []
    var table = loadTable()
    UC.maxEut = table.maxEut

    function skip(name, reason) {
      UC.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'uranium cycle skipped ' + name + ': ' + reason)
    }

    plans(table).forEach(function (rec) {
      if (rec.kind === 'leaching' && rec.veinDimension !== rec.dimension) {
        skip(rec.name, 'the vein is in ' + rec.veinDimension + ', the field works in ' + rec.dimension)
        return
      }
      var missing = missingIds(rec)
      if (missing.length > 0) {
        skip(rec.name, 'unknown id(s): ' + missing.join(', '))
        return
      }
      var limits = rec.kind === 'leaching' ? UC.field.maxIO : UC.plant.maxIO
      var tooBig = sizeProblem(rec, limits)
      if (tooBig !== null) {
        skip(rec.name, tooBig)
        return
      }
      try {
        if (rec.kind === 'leaching') addLeach(event, rec)
        else addStep(event, rec)
      } catch (e) {
        skip(rec.name, 'the builder failed: ' + e)
        return
      }
      UC.recipes.push(rec)
    })

    UC.clashes = clashesOf(UC.recipes)
    if (UC.clashes.length > 0) {
      console.error(LOG + 'uranium cycle: recipes whose ingredients are a subset of another\'s (GTM\'s lookup would hide one): ' + UC.clashes.join('; '))
    }
    console.info(LOG + 'uranium cycle: ' + UC.recipes.length + ' recipes (' + UC.recipes.map(function (r) {
      return r.recipeId + ' ' + r.duration + ' t x ' + r.eut + ' EU/t = ' + r.energy + ' EU'
    }).join('; ') + '); skipped ' + UC.skipped.length)
  }

  // ---------------------------------------------------------------- crafting

  function addControllers(event) {
    var missing = FIELD_PARTS.concat(PLANT_PARTS).filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'uranium cycle controller recipes skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    // GTM shaped: lowercase letters are tool symbols, so ingredient keys are uppercase
    event.recipes.gtceu.shaped(FIELD, ['CRC', 'PHP', 'CBC'], {
      C: CIRCUIT,
      R: 'gtceu:hv_fluid_drilling_rig',
      P: 'gtceu:iv_electric_pump',
      H: HULL,
      B: 'gtceu:iv_chemical_bath'
    }).id(UC.craftingRecipes.field)

    event.recipes.gtceu.shaped(PLANT, ['CFC', 'EHA', 'C C'], {
      C: CIRCUIT,
      F: 'gtceu:iv_forming_press',
      E: 'gtceu:iv_extruder',
      A: 'gtceu:iv_assembler',
      H: HULL
    }).id(UC.craftingRecipes.plant)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'uranium cycle recipe generation failed: ' + e)
    }
    try {
      addControllers(event)
    } catch (e2) {
      console.error(LOG + 'uranium cycle controller recipes failed: ' + e2)
    }
  })
})()
