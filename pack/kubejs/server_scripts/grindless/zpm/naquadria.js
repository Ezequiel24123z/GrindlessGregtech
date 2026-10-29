// priority: -26624
// -----------------------------------------------------------------------------------------------
// Recipes of ZPM's naquadria refinery and naquadah fuel works (machines and recipe types: startup_scripts/grindless/zpm/naquadria.js;
// docs/eras/zpm.md, machines 1 and 2; package ZPM-A2), generated at every server load from data/grindless/tables/naquadria.json, plus
// the recipes of their controllers and of the naquadria containment casing.
//
//   gtceu:naquadria_refining / gtceu:naquadah_fuel   one recipe per table entry, id grindless:<type>/<name>; the programmed circuit
//                          picks the recipe, every recipe carries the data key of its type = <name> (its EMI line). "charge" entries
//                          are GTM's non-consumed fluid inputs (needed to start, never drained). A "chance" on an input is the wear of
//                          a catalyst stack (the fuel works' 5 % cerium and neodymium make-up); on an output, a chanced output.
//   Lookup safety: GTM's lookup keeps one recipe per set of ingredients, and a recipe whose ingredients are a subset of another's can
//   hide it. The recipes of each type are checked against each other at load (circuit and charge count as ingredients); a clash is an error.
//   crafting               the controllers: ZPM hull + 2 ZPM pumps + ZPM sensor + 4 ZPM circuits (refinery) and ZPM hull + 2 ZPM pumps
//                          + ZPM motor + 4 ZPM circuits (works), shaped crafting recipes grindless:crafting/<machine>.
//   assembler              grindless:assembler/naquadria_containment_casing: the casing's route.
//
// Destinations: enriched naquadah solution -> naquadah plant mode 3; gallium sulfide -> the MV gallium line; sulfuric acid -> the
// refinery's charge; naquadah -> plant mode 2; xenon -> GTM's xenon uses; europium -> the motor line. No byproduct is voided.
//
// Published for the smoke test: global.grindless.naquadria.recipes [{ type, name, recipeId, circuit, ... }], .skipped, .clashes,
// .casingRecipe, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/zpm] '
  var G = global.grindless || (global.grindless = {})
  var NQ = G.naquadria || (G.naquadria = {})
  var TABLE = NQ.table || 'kubejs/data/grindless/tables/naquadria.json'

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  // ---------------------------------------------------------------- the table

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var out = []
    var chanceOf = function (x) {
      var ch = x.chance === undefined ? 10000 : Number(x.chance)
      if (!(ch >= 1 && ch <= 10000) || ch % 1 !== 0) problems.push('chance ' + x.chance)
      return ch
    }
    Object.keys(t.types || {}).forEach(function (type) {
      var names = {}
      var circuits = {}
      list(t.types[type].recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        if (!/^[a-z0-9_]+$/.test(n) || names[n] || circuits[circuit] || !(circuit >= 1 && circuit <= 32) || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration)
          return
        }
        var bad = false
        var stack = function (x) {
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1)) bad = true
          return { id: String(x.id), count: Number(x.count), chance: chanceOf(x) }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dataKey: String(t.types[type].dataKey),
          itemsIn: list(r.itemsIn).map(stack), fluidsIn: list(r.fluidsIn).map(fluid), charge: list(r.charge).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        if (bad || (rec.itemsOut.length === 0 && rec.fluidsOut.length === 0) || (rec.itemsIn.length === 0 && rec.fluidsIn.length === 0)) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        names[n] = true
        circuits[circuit] = true
        out.push(rec)
      })
    })
    var casing = t.casing || {}
    var cas = { id: String(casing.id), recipe: String(casing.recipe), eut: Number(casing.eut), duration: Number(casing.duration), count: Number(casing.count),
      itemsIn: list(casing.itemsIn).map(function (x) { return { id: String(x.id), count: Number(x.count) } }) }
    if (cas.id.indexOf(':') < 0 || !(cas.eut > 0) || !(cas.duration > 0) || !(cas.count >= 1) || cas.itemsIn.length === 0) problems.push('casing ' + JSON.stringify(t.casing))
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'naquadria: ' + TABLE + ': ' + problems.join('; '))
    return { recipes: out, casing: cas }
  }

  // ---------------------------------------------------------------- building recipes

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    rec.fluidsIn.concat(rec.charge, rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    var m = NQ.machines
    var def = null
    Object.keys(m).forEach(function (k) { if (m[k].type === rec.type) def = m[k] })
    if (def === null) return 'no machine for type ' + rec.type
    var io = def.maxIO
    if (rec.itemsIn.length + 1 > io.itemsIn) return (rec.itemsIn.length + 1) + ' item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length + rec.charge.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    var recipe = event.recipes.gtceu[rec.type](rec.id)
    rec.itemsIn.forEach(function (x) {
      if (x.chance < 10000) recipe.chancedInput(x.count + 'x ' + x.id, x.chance, 0)
      else recipe.itemInputs(x.count + 'x ' + x.id)
    })
    recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.charge.forEach(function (x) { recipe.notConsumableFluid(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) {
      if (x.chance < 10000) recipe.chancedOutput(x.count + 'x ' + x.id, x.chance, 0)
      else recipe.itemOutputs(x.count + 'x ' + x.id)
    })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    recipe.addDataString(rec.dataKey, rec.name)
      .EUt(rec.eut)
      .duration(rec.duration)
  }

  function keysOf(rec) {
    var keys = {}
    rec.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
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
    NQ.recipes = []
    NQ.skipped = []
    NQ.clashes = []
    var table = loadTable()
    NQ.casing = table.casing

    function skip(name, reason) {
      NQ.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'naquadria skipped ' + name + ': ' + reason)
    }

    table.recipes.forEach(function (rec) {
      rec.id = 'grindless:' + rec.name
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
      NQ.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ' (circuit ' + rec.circuit + '): ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })

    NQ.clashes = clashesOf(NQ.recipes)
    if (NQ.clashes.length > 0) console.error(LOG + 'naquadria: recipes whose ingredients are a subset of another\'s (GTM\'s lookup would hide one): ' + NQ.clashes.join('; '))
    console.info(LOG + 'naquadria: ' + NQ.recipes.length + ' recipes; skipped ' + NQ.skipped.length)
  }

  // ---------------------------------------------------------------- the casing and the controllers

  var VAULT = 'grindless:radiation_vault_casing'

  // the containment casing: the table's inputs + a radiation vault casing (LuV) and soldering alloy for the shell's welds
  function addCasing(event) {
    var c = NQ.casing
    var missing = c.itemsIn.map(function (x) { return x.id }).concat([c.id, VAULT]).filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'naquadria containment casing recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    var r = event.recipes.gtceu.assembler(c.id)
    c.itemsIn.forEach(function (x) { r.itemInputs(x.count + 'x ' + x.id) })
    r.itemInputs('1x ' + VAULT).inputFluids(Fluid.of('gtceu:soldering_alloy', 144))
    r.itemOutputs(c.count + 'x ' + c.id).EUt(c.eut).duration(c.duration)
    NQ.casingRecipe = 'grindless:assembler/' + c.id.split(':')[1]
  }

  // ASSEMBLY LINE with scanner research: ZPM hull + 2 pumps + the machine's part + 4 ZPM circuits + two domain parts of its own.
  // Refinery: sensor + radiation vault casings (LuV) + RTG pellets; research: the containment casing. Fuel works: motor + LEU
  // pellets + molten salt charge (EV); research: the RTG pellet.
  function addControllers(event) {
    var HULL = 'gtceu:zpm_machine_hull'
    var PUMP = 'gtceu:zpm_electric_pump'
    var defs = [
      { machine: NQ.machines.refinery.machine, extra: 'gtceu:zpm_sensor', domain: [VAULT, 'grindless:rtg_pellet'], research: 'grindless:naquadria_containment_casing', name: 'naquadria_refinery' },
      { machine: NQ.machines.fuelWorks.machine, extra: 'gtceu:zpm_electric_motor', domain: ['grindless:leu_pellet', 'grindless:molten_salt_charge'], research: 'grindless:rtg_pellet', name: 'naquadah_fuel_works' }
    ]
    NQ.controllerRecipes = []
    defs.forEach(function (d) {
      var parts = [HULL, PUMP, d.extra, d.machine, d.research].concat(d.domain)
      var missing = parts.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      b.itemInputs(HULL, '2x ' + PUMP, d.extra, '4x #gtceu:circuits/zpm', '2x ' + d.domain[0], '2x ' + d.domain[1])
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 1000))
      b.itemOutputs(d.machine)
      b.scannerResearch(Item.of(d.research))
      b.EUt(122880).duration(1200)
      NQ.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // the large naquadah reactor's assembly-line recipe at ZPM: GTM's own recipe re-added under the same id with duranium frames for the
  // neutronium ones (everything else, the research and the output kept), read from this load's original recipe
  var REACTOR = { id: 'gtceu:assembly_line/large_naquadah_reactor', name: 'gtceu:large_naquadah_reactor', from: 'gtceu:neutronium_frame', to: 'gtceu:duranium_frame' }

  function reactorArgs(j) {
    var research = []
    var bad = null
    ;(j.recipeConditions || []).forEach(function (c) {
      if (c.type !== 'research' || !c.research) bad = 'a condition other than research'
      else c.research.forEach(function (r) { research.push(String(r.researchId)) })
    })
    if (bad !== null) return bad
    if (research.length !== 1) return 'not one research entry'
    var eu = j.tickInputs && j.tickInputs.eu && j.tickInputs.eu[0] ? j.tickInputs.eu[0].content : null
    var eut = typeof eu === 'number' ? eu : (eu && eu.voltage !== undefined ? Number(eu.voltage) * Number(eu.amperage || 1) : null)
    if (!(eut > 0) || !(j.duration > 0)) return 'unreadable energy or duration'
    var items = []
    var swapped = 0
    ;((j.inputs && j.inputs.item) || []).forEach(function (e) {
      var c = e.content
      var sized = c && c.type === 'gtceu:sized'
      var ing = sized ? c.ingredient : c
      var count = sized ? (c.count || 1) : 1
      if (!ing || (e.chance !== undefined && e.chance !== 10000)) { bad = 'item input ' + JSON.stringify(e); return }
      if (ing.item && !ing.nbt) {
        var id = ing.item
        if (id === REACTOR.from) { id = REACTOR.to; swapped += count }
        items.push(count + 'x ' + id)
      } else if (ing.tag === 'forge:frames/neutronium') { swapped += count; items.push(count + 'x ' + REACTOR.to) }
      else if (ing.tag) items.push(count + 'x #' + ing.tag)
      else bad = 'item input ' + JSON.stringify(e)
    })
    var fluids = []
    ;((j.inputs && j.inputs.fluid) || []).forEach(function (e) {
      var c = e.content
      var v = c && c.value && c.value.length === 1 ? c.value[0] : null
      if (v && v.fluid && c.amount > 0) fluids.push(v.fluid + ' ' + c.amount)
      else bad = 'fluid input ' + JSON.stringify(e)
    })
    var outs = []
    ;((j.outputs && j.outputs.item) || []).forEach(function (e) {
      var c = e.content
      var sized = c && c.type === 'gtceu:sized'
      var ing = sized ? c.ingredient : c
      if (ing && ing.item && !ing.nbt) outs.push((sized ? (c.count || 1) : 1) + 'x ' + ing.item)
      else bad = 'item output ' + JSON.stringify(e)
    })
    if (bad !== null) return bad
    if (swapped !== 8) return 'expected 8 ' + REACTOR.from + ', found ' + swapped + ' in ' + JSON.stringify(((j.inputs && j.inputs.item) || []).map(function (e) { return e.content })).slice(0, 700)
    if (outs.length !== 1 || (j.outputs && j.outputs.fluid && j.outputs.fluid.length > 0)) return 'not one item output'
    if (!Item.exists(REACTOR.to)) return REACTOR.to + ' does not exist'
    return { items: items, fluids: fluids, output: outs[0], eut: eut, duration: j.duration, research: research[0] }
  }

  function addReactor(event) {
    var found = null
    event.forEachRecipe({ id: REACTOR.id }, function (r) {
      if (found === null && r.json !== null && r.json !== undefined) found = JSON.parse(String(r.json))
    })
    if (found === null) throw new Error('no original recipe ' + REACTOR.id)
    var args = reactorArgs(found)
    if (typeof args === 'string') throw new Error(REACTOR.id + ' left as it is: ' + args)
    event.remove({ id: REACTOR.id })
    var b = event.recipes.gtceu.assembly_line(REACTOR.name)
    args.items.forEach(function (s) { b.itemInputs(s) })
    args.fluids.forEach(function (s) { b.inputFluids(s) })
    b.itemOutputs(args.output).EUt(args.eut).duration(args.duration).researchWithoutRecipe(args.research)
    NQ.reactor = { id: REACTOR.id, items: args.items, fluids: args.fluids, output: args.output, eut: args.eut, duration: args.duration, research: args.research }
    console.info(LOG + 'large naquadah reactor: ' + REACTOR.id + ' re-added with 8 ' + REACTOR.to + ' (' + args.eut + ' EU/t x ' + args.duration + ' t), research ' + args.research)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['casing', addCasing], ['controllers', addControllers], ['reactor', addReactor]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'naquadria ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
