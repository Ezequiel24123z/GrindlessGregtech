// Gregtech Grindless - smoke test of the HV Syngas and Shift Plant (TEST-ONLY overlay: copied over the instance on the test PC, never shipped
// with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_syngas;;kubejs custom_command gg_dump' -WaitForLog 'GGTEST\|syngas\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|<scope>|<check>|PASS|FAIL|NOTE|<detail>   (scope = syngas, or syngas_plant for the machine)
//   syngas|registration, items, feed_tag, recipes, balance, catalyst, crafting   registration and data: the recipe type and its sizes, the six
//       recipes in the recipe manager against the table published by the recipe script (global.grindless.syngas.recipes), carbon, hydrogen and
//       oxygen balanced in every one, the catalyst wear GTM sees (5 / 10000) only where there is a shift, the plant and catalyst recipes
//   syngas|co_sources, methanol_ratio, rocket_chain, co2_destinations, ash_destination   integration with the HV chain read from the recipe manager:
//       the HV CO sources (silicon, wood gas, nether air), mode 2 being exactly GTM's methanol syngas, the rocket fuel chain and GCYR's hydrogen
//       fuel, and an honest destination for every by-product. syngas|h2_bill (NOTE): the hydrogen and CO of 8 B of rocket fuel, from GTM's recipes
//   syngas_plant|DESCRIPTION / PLACED / FORMED / PATTERN / PREVIEW / PARTS   the registered description is placed block by block and forms
//   syngas_plant|PROCESS_<scenario>   one run: inputs in -> the expected gases out (summed over the output hatches), ash, inputs used up
//   syngas_plant|LOOKUP               GTM's recipe lookup reaches every recipe of the type from its inputs
//   syngas|DONE                       last line
//
// Machine (faces north in the overworld): the plant around (3850, 99, 2), one HV energy hatch, 2 input hatches and 3 output hatches.
// TEST AREA: this test builds, force-loads and clears ONLY its own band of the overworld, X 3840-3903, Y 98-112, Z 0-15 (AGENTS.md: tests run at
// the same time in one server). Everything is driven by the structure description that lib/patterns.js records (global.grindless.structures).
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'syngas'
  var KEY = 'syngas_plant'
  var STEP = 10
  var FORM_TIMEOUT = 600
  var BAND = { x0: 3840, x1: 3903, y0: 98, y1: 112, z0: 0, z1: 15 }

  // The pack's Additional Placements mod used to reload the datapacks (so these scripts too) a couple of seconds after the server was up; a
  // test running then was lost. The command therefore only leaves a request in `global` (it survives script reloads) and the tick handler starts
  // the test once these scripts have been loaded for QUIET_MS (same as the other tests).
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestSyngasRequest'

  var MACHINE_ID = 'gtceu:syngas_plant'
  var TYPE_ID = 'gtceu:syngas'
  var CATALYST = 'grindless:shift_catalyst'
  var FEED_TAG = 'grindless:gasifier_feed'
  var CATALYST_WEAR = 5
  var STEAM = 'gtceu:steam'
  var CO = 'gtceu:carbon_monoxide'
  var CO2 = 'gtceu:carbon_dioxide'
  var H2 = 'gtceu:hydrogen'
  var HEAVY = 'gtceu:heavy_fuel'
  var ASH = 'gtceu:ash_dust'
  var PLANT = { x: 3850, y: 99, z: 2 }
  var COUNTS = { energy_input: 1, input_bus: 1, output_bus: 1, input_hatch: 2, output_hatch: 3 }
  var NEED = { energy: 1, inBus: true, outBuses: 1, inHatches: 2, outHatches: 3 }

  var PART_BLOCKS = {
    energy_input: 'gtceu:hv_energy_input_hatch',
    input_bus: 'gtceu:hv_input_bus',
    output_bus: 'gtceu:hv_output_bus',
    input_hatch: 'gtceu:hv_input_hatch',
    output_hatch: 'gtceu:hv_output_hatch'
  }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var S = null
  var metaMachineClass = null
  var classes = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(scope, name, status, detail) {
    var line = TAG + scope + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(scope, name, ok, detail) {
    emit(scope, name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(scope, name, detail) {
    emit(scope, name, 'NOTE', detail)
  }

  function asArray(coll) {
    var AL = Java.loadClass('java.util.ArrayList')
    var list = new AL(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function rl(id) {
    return new ResourceLocation(id)
  }

  function lazy() {
    if (classes === null) {
      classes = {
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      }
    }
    return classes
  }

  function machineAt(p) {
    if (metaMachineClass === null) metaMachineClass = Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
    return metaMachineClass.getMachine(S.level, new BlockPos(p.x, p.y, p.z))
  }

  function blockIdAt(x, y, z) {
    return String(S.level.getBlock(x, y, z).getId())
  }

  function itemSummary(counts) {
    return Object.keys(counts).sort().map(function (id) { return id + ' x' + counts[id] }).join(', ')
  }

  function fluidName(stack) {
    try {
      return String(lazy().Registries.FLUIDS.getKey(stack.getFluid()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  function dedupe(list) {
    var seen = {}
    return list.filter(function (id) {
      if (seen[id]) return false
      seen[id] = true
      return true
    })
  }

  // ---------------------------------------------------------------- reading recipes from the recipe manager

  // item ingredient JSON -> { id | tag, count } (null for a circuit or anything unreadable)
  function parseItem(j) {
    if (!j) return null
    var count = Number(j.count || 1)
    if (j.item) return { id: String(j.item), count: count }
    if (j.tag) return { tag: String(j.tag), count: count }
    if (j.ingredient) {
      if (j.ingredient.item) return { id: String(j.ingredient.item), count: count }
      if (j.ingredient.tag) return { tag: String(j.ingredient.tag), count: count }
    }
    return null
  }

  function parseFluid(j) {
    if (!j || !j.value || j.value.length === 0) return null
    var v = j.value[0]
    var out = { amount: Number(j.amount) }
    if (v.fluid) out.id = String(v.fluid)
    else if (v.tag) out.tag = String(v.tag)
    else return null
    return out
  }

  // fluid name without namespace: gtceu:hydrogen and forge:hydrogen are both "hydrogen"
  function fluidShort(f) {
    var s = f.id !== undefined ? f.id : f.tag
    return String(s).replace(/^[^:]*:/, '')
  }

  function readRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    if (!found.isPresent()) return null
    var r = found.get()
    var L = lazy()
    var eu = null
    try {
      eu = r.getInputEUt()
    } catch (e0) {
      eu = null
    }
    function side(list) {
      return asArray(list).map(function (c) {
        var j = null
        try {
          j = JSON.parse(String(c.content.toJson()))
        } catch (e) {
          j = null
        }
        return { j: j, chance: Number(c.chance), max: Number(c.maxChance) }
      })
    }
    return {
      id: id,
      duration: Number(r.duration),
      voltage: eu === null ? 0 : Number(eu.voltage()),
      eut: eu === null ? 0 : Number(eu.voltage()) * Number(eu.amperage()),
      itemsIn: side(r.getInputContents(L.ItemCap)),
      itemsOut: side(r.getOutputContents(L.ItemCap)),
      fluidsIn: side(r.getInputContents(L.FluidCap)),
      fluidsOut: side(r.getOutputContents(L.FluidCap))
    }
  }

  function recipeCount(typeId) {
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    return type ? S.server.getRecipeManager().getAllRecipesFor(type).size() : -1
  }

  function circuitOf(rec) {
    var circuit = 0
    rec.itemsIn.forEach(function (o) {
      if (!o.j) return
      if (o.j.configuration !== undefined) circuit = Number(o.j.configuration)
      else if (o.j.ingredient && o.j.ingredient.configuration !== undefined) circuit = Number(o.j.ingredient.configuration)
    })
    return circuit
  }

  // the wear of an item input as GTM sees it: { chance, max } of the first input with that item id (null = not an input)
  function wearOf(rec, itemId) {
    var found = null
    rec.itemsIn.forEach(function (o) {
      var it = parseItem(o.j)
      if (it !== null && it.id === itemId && found === null) found = { chance: o.chance, max: o.max }
    })
    return found
  }

  function fluidsOf(rec, sideName) {
    return rec[sideName].map(function (o) { return parseFluid(o.j) })
  }

  function sameFluidLists(want, got) {
    if (want.length !== got.length) return 'count ' + got.length + ' (wanted ' + want.length + ')'
    for (var i = 0; i < want.length; i++) {
      var w = want[i]
      var g = got[i]
      if (g === null || w === null) return 'unreadable fluid ' + i
      if (fluidShort(w) !== fluidShort(g) || w.amount !== g.amount) {
        return i + ': ' + fluidShort(g) + ' ' + g.amount + ' (wanted ' + fluidShort(w) + ' ' + w.amount + ')'
      }
    }
    return null
  }

  // item inputs of a recipe as { <id or #tag>: count } (circuits left out)
  function inputMap(rec) {
    var map = {}
    rec.itemsIn.forEach(function (o) {
      var it = parseItem(o.j)
      if (it === null) return
      var key = it.id !== undefined ? it.id : '#' + it.tag
      map[key] = (map[key] || 0) + it.count
    })
    return map
  }

  function sameMap(want, got) {
    var keys = dedupe(Object.keys(want).concat(Object.keys(got)))
    var bad = keys.filter(function (k) { return want[k] !== got[k] })
    return bad.length === 0 ? null : bad.map(function (k) { return k + ' ' + got[k] + ' (wanted ' + want[k] + ')' }).join(', ')
  }

  // amount of a fluid (by short name) on one side of a recipe, 0 when absent
  function fluidAmount(rec, sideName, shortName) {
    var total = 0
    fluidsOf(rec, sideName).forEach(function (f) {
      if (f !== null && fluidShort(f) === shortName) total += f.amount
    })
    return total
  }

  // ---------------------------------------------------------------- static checks

  function recipeChecks() {
    var SYN = global.grindless.syngas
    var problems = []
    SYN.recipes.forEach(function (plan) {
      var gen = readRecipe(plan.id)
      if (gen === null) {
        problems.push(plan.name + ': not in the recipe manager')
        return
      }
      var bad = sameFluidLists(plan.fluidsIn, fluidsOf(gen, 'fluidsIn'))
      if (bad) problems.push(plan.name + ' fluids in ' + bad)
      bad = sameFluidLists(plan.fluidsOut, fluidsOf(gen, 'fluidsOut'))
      if (bad) problems.push(plan.name + ' fluids out ' + bad)
      var wantItems = {}
      if (plan.feed) wantItems['#' + plan.feed.tag] = plan.feed.count
      if (plan.catalyst) wantItems[CATALYST] = 1
      bad = sameMap(wantItems, inputMap(gen))
      if (bad) problems.push(plan.name + ' items in ' + bad)
      if (circuitOf(gen) !== plan.circuit) problems.push(plan.name + ' circuit ' + circuitOf(gen) + ' (wanted ' + plan.circuit + ')')
      if (plan.ash > 0) {
        var ash = gen.itemsOut.length === 1 ? parseItem(gen.itemsOut[0].j) : null
        var ratio = ash === null ? -1 : gen.itemsOut[0].chance / gen.itemsOut[0].max
        if (ash === null || ash.id !== ASH || ash.count !== 1 || Math.abs(ratio - plan.ash / 10000) > 0.00001) {
          problems.push(plan.name + ' ash ' + JSON.stringify(ash) + ' @' + ratio)
        }
      } else if (gen.itemsOut.length !== 0) {
        problems.push(plan.name + ' has ' + gen.itemsOut.length + ' item outputs (wanted none)')
      }
      if (gen.eut !== plan.eut || gen.duration !== plan.duration) problems.push(plan.name + ' ' + gen.eut + ' EU/t x ' + gen.duration + ' t (wanted ' + plan.eut + ' x ' + plan.duration + ')')
      var stageEnergy = plan.stages.gasify * global.grindless.syngas.stageEnergy.gasify + plan.stages.shift * global.grindless.syngas.stageEnergy.shift
      if (gen.eut * gen.duration !== stageEnergy) problems.push(plan.name + ' energy ' + (gen.eut * gen.duration) + ' (stages ' + stageEnergy + ')')
    })
    return problems
  }

  // carbon, hydrogen and oxygen in = out, read from the recipes in the manager (feed dust = 1 C, steam = H2O, heavy fuel = CH2 per 1 000 mB)
  var ATOMS = { steam: [0, 2, 1], carbon_monoxide: [1, 0, 1], carbon_dioxide: [1, 0, 2], hydrogen: [0, 1, 0], heavy_fuel: [1, 2, 0] }

  function balanceChecks() {
    var SYN = global.grindless.syngas
    var problems = []
    var lines = []
    SYN.recipes.forEach(function (plan) {
      var gen = readRecipe(plan.id)
      if (gen === null) return
      var sum = [0, 0, 0]
      var feed = inputMap(gen)['#' + FEED_TAG] || 0
      sum[0] += feed
      function add(list, sign) {
        list.forEach(function (f) {
          var a = f === null ? null : ATOMS[fluidShort(f)]
          if (!a) {
            problems.push(plan.name + ': no formula for ' + JSON.stringify(f))
            return
          }
          for (var k = 0; k < 3; k++) sum[k] += sign * a[k] * f.amount / 1000
        })
      }
      add(fluidsOf(gen, 'fluidsIn'), 1)
      add(fluidsOf(gen, 'fluidsOut'), -1)
      if (sum[0] !== 0 || sum[1] !== 0 || sum[2] !== 0) problems.push(plan.name + ' C/H/O in - out = ' + sum.join('/'))
      lines.push(plan.name + ' ' + sum.join('/'))
    })
    return { problems: problems, lines: lines }
  }

  function catalystChecks() {
    var SYN = global.grindless.syngas
    var problems = []
    SYN.recipes.forEach(function (plan) {
      var gen = readRecipe(plan.id)
      if (gen === null) return
      var wear = wearOf(gen, CATALYST)
      if (plan.stages.shift > 0) {
        if (wear === null || wear.chance !== CATALYST_WEAR || wear.max !== 10000) problems.push(plan.name + ' wear ' + JSON.stringify(wear))
      } else if (wear !== null) {
        problems.push(plan.name + ' asks for the catalyst without a shift')
      }
    })
    return problems
  }

  function craftingChecks(rm) {
    var SYN = global.grindless.syngas
    var problems = []
    var plant = rm.byKey(rl(SYN.craftingRecipes.plant))
    if (!plant.isPresent()) {
      problems.push('no ' + SYN.craftingRecipes.plant)
    } else {
      try {
        var res = plant.get().getResultItem(S.server.registryAccess())
        if (String(res.getId()) !== MACHINE_ID) problems.push('plant recipe makes ' + res.getId())
      } catch (e) { /* the result is not readable from here: the recipe being there is enough */ }
    }
    var cat = readRecipe(SYN.craftingRecipes.catalyst)
    if (cat === null) {
      problems.push('no ' + SYN.craftingRecipes.catalyst)
    } else {
      var bad = sameMap({ 'gtceu:magnetite_dust': 3, 'gtceu:chromium_dust': 1 }, inputMap(cat))
      if (bad) problems.push('catalyst inputs: ' + bad)
      var out = cat.itemsOut.length === 1 ? parseItem(cat.itemsOut[0].j) : null
      if (out === null || out.id !== CATALYST || out.count !== 4) problems.push('catalyst output ' + JSON.stringify(out))
      if (cat.eut > 512) problems.push('catalyst recipe draws ' + cat.eut + ' EU/t (more than HV)')
    }
    return problems
  }

  // ---------------------------------------------------------------- integration with the HV chain

  function present(ids) {
    return ids.filter(function (id) { return readRecipe(id) === null })
  }

  function integrationChecks() {
    var SYN = global.grindless.syngas

    // HV sources of CO (Kroll's TiCl4 is EV now: titanium only comes from the Moon)
    var sources = [
      { id: 'gtceu:electric_blast_furnace/blast_silicon_dioxide', what: 'EBF silicon' },
      { id: 'grindless:arc_smelting/silicon_co', what: 'arc furnace silicon' },
      { id: 'gtceu:centrifuge/nether_air_separation', what: 'nether air' },
      { id: 'grindless:bio_distillation/bio/wood_gas', what: 'wood gas (biorefinery)' }
    ]
    var srcProblems = []
    var srcLines = []
    sources.forEach(function (s) {
      var r = readRecipe(s.id)
      var made = r === null ? 0 : fluidAmount(r, 'fluidsOut', 'carbon_monoxide')
      if (made <= 0) srcProblems.push(s.id + (r === null ? ' missing' : ' makes no CO'))
      else srcLines.push(s.what + ' ' + made + ' mB (' + r.eut + ' EU/t)')
    })
    check(SCOPE, 'co_sources', srcProblems.length === 0, 'HV CO the shift (mode 4) turns into hydrogen: ' + srcLines.join(', ') + (srcProblems.length > 0 ? ' problems=' + srcProblems.join(' ; ') : ''))
    var kroll = readRecipe('gtceu:chemical_reactor/titanium_tetrachloride')
    note(SCOPE, 'co_kroll', 'TiCl4 (Kroll) makes ' + (kroll === null ? '?' : fluidAmount(kroll, 'fluidsOut', 'carbon_monoxide')) + ' mB CO, but titanium is EV (Moon ilmenite): not an HV source')

    // mode 2 is exactly GTM's methanol syngas
    var methanol = readRecipe('gtceu:chemical_reactor/methanol_from_monoxide')
    var mode2 = null
    SYN.recipes.forEach(function (p) { if (p.name === 'methanol_syngas') mode2 = readRecipe(p.id) })
    var ratioOk = false
    var ratioDetail = 'missing recipe'
    if (methanol !== null && mode2 !== null) {
      var mco = fluidAmount(methanol, 'fluidsIn', 'carbon_monoxide')
      var mh = fluidAmount(methanol, 'fluidsIn', 'hydrogen')
      var oco = fluidAmount(mode2, 'fluidsOut', 'carbon_monoxide')
      var oh = fluidAmount(mode2, 'fluidsOut', 'hydrogen')
      ratioOk = mco > 0 && oco > 0 && oco * mh === oh * mco
      ratioDetail = 'methanol_from_monoxide takes CO ' + mco + ' + H ' + mh + '; mode 2 gives CO ' + oco + ' + H ' + oh + ' = ' + (oco / mco) + ' runs, nothing left over'
    }
    check(SCOPE, 'methanol_ratio', ratioOk, ratioDetail)

    // the rocket: GTM's rocket fuel through methanol and ammonia, and GCYR's own hydrogen fuel
    var chain = ['gtceu:mixer/rocket_fuel_from_dinitrogen_tetroxide', 'gtceu:chemical_reactor/dimethylhydrazine_from_methanol',
      'gtceu:chemical_reactor/dinitrogen_tetroxide_from_ammonia', 'gtceu:chemical_reactor/ammonia_from_elements',
      'gtceu:chemical_reactor/methanol_from_monoxide', 'gcyr:rocket_fuel/hydrogen', 'gcyr:rocket_fuel/rocket_fuel']
    var missingChain = present(chain)
    check(SCOPE, 'rocket_chain', missingChain.length === 0, 'rocket fuel = UDMH (methanol + ammonia) + N2O4 (ammonia), and GCYR burns hydrogen as a tier 1 fuel' +
      (missingChain.length > 0 ? ' missing=' + missingChain.join(',') : ''))
    try {
      note(SCOPE, 'h2_bill', h2Bill())
    } catch (e) {
      note(SCOPE, 'h2_bill', 'could not compute: ' + e)
    }

    // honest destinations of every by-product
    var co2 = ['gtceu:chemical_reactor/methanol_from_dioxide', 'gtceu:chemical_reactor/ethylene_from_glycerol',
      'gtceu:electrolyzer/decomposition_electrolyzing_carbon_dioxide', 'gtceu:chemical_reactor/carbon_monoxide_from_dioxide',
      'grindless:greenhouse/mv/oak_fertilizer_co2']
    var missingCo2 = present(co2)
    var co2Hazard = null
    var hazard = 'unread'
    try {
      var Mats = Java.loadClass('com.gregtechceu.gtceu.common.data.GTMaterials')
      var Keys = Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.material.properties.PropertyKey')
      co2Hazard = Mats.CarbonDioxide.hasProperty(Keys.HAZARD) === true
      hazard = 'CO2 hazard=' + co2Hazard + ' CO hazard=' + Mats.CarbonMonoxide.hasProperty(Keys.HAZARD)
    } catch (e2) {
      hazard = 'hazard unreadable (' + e2 + ')'
    }
    check(SCOPE, 'co2_destinations', missingCo2.length === 0 && co2Hazard !== true,
      'CO2 is inert (can be vented) and has uses: methanol from CO2, ethylene from glycerol, electrolysis, back to CO, greenhouses; ' + hazard +
      (missingCo2.length > 0 ? ' missing=' + missingCo2.join(',') : ''))
    var missingAsh = present(['gtceu:centrifuge/ash_separation'])
    check(SCOPE, 'ash_destination', missingAsh.length === 0, 'ash -> GTM centrifuge (quicklime, potash, magnesia...) or fertilizer')
  }

  // the hydrogen and CO of 8 B of rocket fuel (what GCYR's tank must hold to fly to the Moon), from GTM's recipes as they are loaded
  function h2Bill() {
    var rf = readRecipe('gtceu:mixer/rocket_fuel_from_dinitrogen_tetroxide')
    var udmh = readRecipe('gtceu:chemical_reactor/dimethylhydrazine_from_methanol')
    var n2o4 = readRecipe('gtceu:chemical_reactor/dinitrogen_tetroxide_from_ammonia')
    var nh3 = readRecipe('gtceu:chemical_reactor/ammonia_from_elements')
    var meoh = readRecipe('gtceu:chemical_reactor/methanol_from_monoxide')
    var fuel = 8000
    var runsRf = fuel / fluidAmount(rf, 'fluidsOut', 'rocket_fuel')
    var udmhNeed = runsRf * fluidAmount(rf, 'fluidsIn', 'dimethylhydrazine')
    var n2o4Need = runsRf * fluidAmount(rf, 'fluidsIn', 'dinitrogen_tetroxide')
    var runsUdmh = udmhNeed / fluidAmount(udmh, 'fluidsOut', 'dimethylhydrazine')
    var runsN2o4 = n2o4Need / fluidAmount(n2o4, 'fluidsOut', 'dinitrogen_tetroxide')
    var methanolNeed = runsUdmh * fluidAmount(udmh, 'fluidsIn', 'methanol')
    var ammoniaNeed = runsUdmh * fluidAmount(udmh, 'fluidsIn', 'ammonia') + runsN2o4 * fluidAmount(n2o4, 'fluidsIn', 'ammonia')
    var runsMeoh = methanolNeed / fluidAmount(meoh, 'fluidsOut', 'methanol')
    var runsNh3 = ammoniaNeed / fluidAmount(nh3, 'fluidsOut', 'ammonia')
    var h = runsMeoh * fluidAmount(meoh, 'fluidsIn', 'hydrogen') + runsNh3 * fluidAmount(nh3, 'fluidsIn', 'hydrogen')
    var co = runsMeoh * fluidAmount(meoh, 'fluidsIn', 'carbon_monoxide')
    return fuel + ' mB of rocket fuel need ' + Math.round(h) + ' mB of hydrogen and ' + Math.round(co) + ' mB of CO (methanol ' + Math.round(methanolNeed) +
      ', ammonia ' + Math.round(ammoniaNeed) + '); the plant: mode 2 gives the methanol syngas from ' + (co / 2000 * 3).toFixed(1) + ' dust, mode 3 the rest of the hydrogen from ' +
      ((h - co * 4) / 4000).toFixed(1) + ' dust. GCYR also flies on 8 000 mB of plain hydrogen (2 dust of mode 3 each 4 000 mB)'
  }

  function staticChecks() {
    var G = global.grindless
    var SYN = G.syngas
    var rm = S.server.getRecipeManager()
    var fc = lazy().FluidCap
    var ic = lazy().ItemCap

    var type = GTRegistries.RECIPE_TYPES.get(rl(TYPE_ID))
    var machine = GTRegistries.MACHINES.get(rl(MACHINE_ID))
    var sizesOk = !!type && type.getMaxInputs(ic) === 3 && type.getMaxOutputs(ic) === 1 && type.getMaxInputs(fc) === 2 && type.getMaxOutputs(fc) === 3
    check(SCOPE, 'registration', sizesOk && !!machine,
      'syngas=' + (type ? 'registered (items in ' + type.getMaxInputs(ic) + ' out ' + type.getMaxOutputs(ic) + ', fluids in ' + type.getMaxInputs(fc) + ' out ' + type.getMaxOutputs(fc) + ')' : 'missing') +
      ' machine=' + (machine ? 'registered' : 'missing'))

    var items = dedupe(SYN.craftingParts.concat(SYN.feedItems).concat([CATALYST, ASH, 'gtceu:clean_machine_casing', 'gtceu:heatproof_machine_casing',
      'gtceu:kanthal_coil_block', 'gtceu:steel_pipe_casing', 'gtceu:stainless_steel_frame', 'gtceu:tempered_glass', 'gtceu:programmed_circuit'])
      .concat(Object.keys(PART_BLOCKS).map(function (k) { return PART_BLOCKS[k] })))
    var missingItems = items.filter(function (id) { return !Item.exists(id) })
    var fluids = [STEAM, CO, CO2, H2, HEAVY]
    var missingFluids = fluids.filter(function (id) { return !Fluid.exists(id) })
    check(SCOPE, 'items', missingItems.length === 0 && missingFluids.length === 0,
      'items=' + items.length + ' fluids=' + fluids.length + (missingItems.length > 0 ? ' missing items=' + missingItems.join(',') : '') +
      (missingFluids.length > 0 ? ' missing fluids=' + missingFluids.join(',') : ''))

    var inTag = asArray(Ingredient.of('#' + FEED_TAG).getItemIds()).map(String)
    var missingFeed = SYN.feedItems.filter(function (id) { return inTag.indexOf(id) < 0 })
    check(SCOPE, 'feed_tag', missingFeed.length === 0, '#' + FEED_TAG + ' = [' + inTag.join(', ') + ']' + (missingFeed.length > 0 ? ' missing=' + missingFeed.join(',') : ''))

    var have = recipeCount(TYPE_ID)
    try {
      var rp = recipeChecks()
      check(SCOPE, 'recipes', rp.length === 0 && have === SYN.recipes.length,
        'gtceu:syngas recipes=' + have + '/' + SYN.recipes.length + ' [' + SYN.recipes.map(function (p) {
          return p.name + ' c' + p.circuit + ' ' + p.eut + 'x' + p.duration
        }).join(', ') + ']' + (rp.length > 0 ? ' problems=' + rp.join(' ; ') : ''))
    } catch (e1) {
      check(SCOPE, 'recipes', false, 'exception: ' + e1)
    }
    try {
      var bal = balanceChecks()
      check(SCOPE, 'balance', bal.problems.length === 0, 'C/H/O in - out per recipe: ' + bal.lines.join(', ') + (bal.problems.length > 0 ? ' problems=' + bal.problems.join(' ; ') : ''))
    } catch (e2) {
      check(SCOPE, 'balance', false, 'exception: ' + e2)
    }
    try {
      var cat = catalystChecks()
      check(SCOPE, 'catalyst', cat.length === 0, 'wear ' + CATALYST_WEAR + ' / 10000 in every recipe that shifts, none in pure gasification' + (cat.length > 0 ? ' problems=' + cat.join(' ; ') : ''))
    } catch (e3) {
      check(SCOPE, 'catalyst', false, 'exception: ' + e3)
    }
    try {
      var craft = craftingChecks(rm)
      check(SCOPE, 'crafting', craft.length === 0, 'plant (crafting table), shift catalyst (mixer)' + (craft.length > 0 ? ' problems=' + craft.join(' ; ') : ''))
    } catch (e4) {
      check(SCOPE, 'crafting', false, 'exception: ' + e4)
    }
    try {
      integrationChecks()
    } catch (e5) {
      check(SCOPE, 'integration', false, 'exception: ' + e5)
    }
  }

  // ---------------------------------------------------------------- structure (same technique as gg_test_hv_refinery.js)

  function simpleBlock(sym, machineId) {
    switch (sym.kind) {
      case 'blocks':
        return { id: sym.blocks[0] }
      case 'frames':
        return { id: 'gtceu:' + sym.materials[0] + '_frame' }
      case 'part':
        if (!PART_BLOCKS[sym.ability]) throw new Error('the test does not know the part ability ' + sym.ability)
        return { id: PART_BLOCKS[sym.ability], ability: sym.ability }
      case 'controller':
        return { id: machineId, controller: true }
      case 'air':
      case 'any':
        return null
      default:
        throw new Error('unsupported symbol kind ' + sym.kind)
    }
  }

  // a "casing OR parts" cell: the parts the limits ask for (or the counts the test sets) are spread evenly over the cells, the rest is the block
  function assignOneOf(sym, list, machineId, counts) {
    var filler = null
    var parts = []
    sym.options.forEach(function (o) {
      if (o.kind === 'part') {
        var lim = o.limits || {}
        var need = lim.exact != null ? lim.exact : (lim.min != null ? lim.min : 0)
        if (counts && counts[o.ability] !== undefined) need = counts[o.ability]
        for (var k = 0; k < need; k++) parts.push(simpleBlock(o, machineId))
      } else if (filler === null) {
        filler = simpleBlock(o, machineId)
      }
    })
    if (filler === null) throw new Error('a oneOf symbol has no plain block option')
    if (parts.length > list.length) throw new Error('more required parts (' + parts.length + ') than cells (' + list.length + ')')
    list.forEach(function (c) { c.block = filler })
    parts.forEach(function (p, i) {
      list[Math.floor((i + 0.5) * list.length / parts.length)].block = p
    })
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing
  // north: x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(machineId, cx, cy, cz, counts) {
    var desc = global.grindless.patterns.describe(machineId)
    if (!desc) throw new Error('no structure description recorded for ' + machineId)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, ch: ch, sym: sym, block: null, props: '' })
        }
      })
    })
    if (ctrl === null) throw new Error('the description has no controller cell')
    cells.forEach(function (c) {
      c.x = cx - (c.ci - ctrl.ci)
      c.y = cy + (c.ri - ctrl.ri)
      c.z = cz - (c.si - ctrl.si)
    })

    var byChar = {}
    cells.forEach(function (c) {
      if (!byChar[c.ch]) byChar[c.ch] = []
      byChar[c.ch].push(c)
    })
    Object.keys(byChar).forEach(function (ch) {
      var sym = desc.symbols[ch]
      var list = byChar[ch]
      if (sym.kind === 'oneOf') {
        assignOneOf(sym, list, machineId, counts)
      } else {
        var b = simpleBlock(sym, machineId)
        list.forEach(function (c) { c.block = b })
      }
    })

    var occupied = {}
    cells.forEach(function (c) {
      if (c.block) occupied[c.x + ',' + c.y + ',' + c.z] = true
    })
    cells.forEach(function (c) {
      if (!c.block) return
      if (c.block.controller) {
        c.props = '[facing=north]'
      } else if (c.block.ability) {
        for (var i = 0; i < SIDES.length; i++) {
          var s = SIDES[i]
          if (!occupied[(c.x + s[1]) + ',' + (c.y + s[2]) + ',' + (c.z + s[3])]) {
            c.props = '[facing=' + s[0] + ']'
            break
          }
        }
      }
    })

    var placed = cells.filter(function (c) { return c.block !== null })
    var width = desc.slices[0][0].length
    return {
      id: machineId,
      cells: placed,
      desc: desc,
      size: width + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)',
      blocks: placed.length
    }
  }

  function setBlock(c) {
    return S.server.runCommandSilent('setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
  }

  // everything but the controller first, the controller last
  function place(plan) {
    var failed = []
    var ctrlCell = null
    var tally = {}
    plan.cells.forEach(function (c) {
      tally[c.block.id] = (tally[c.block.id] || 0) + 1
      if (c.block.controller) {
        ctrlCell = c
        return
      }
      if (setBlock(c) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.block.id + c.props)
    })
    if (setBlock(ctrlCell) < 1) failed.push('controller ' + ctrlCell.block.id)
    plan.ctrl = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }

    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.block.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.block.id + ' got ' + got)
    })
    check(KEY, 'PLACED', failed.length === 0 && wrong.length === 0,
      'blocks=' + plan.blocks + ' size=' + plan.size + ' controller=' + plan.ctrl.x + ',' + plan.ctrl.y + ',' + plan.ctrl.z + ' bill=[' + itemSummary(tally) + ']' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function describeSymbol(sym) {
    if (sym.kind === 'oneOf') return 'oneOf(' + sym.options.map(describeSymbol).join(' | ') + ')'
    if (sym.kind === 'blocks') return sym.blocks.join('/')
    if (sym.kind === 'frames') return 'frame ' + sym.materials.join('/')
    if (sym.kind === 'part') return 'part ' + sym.ability
    return sym.kind
  }

  function describeError(m, ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = 'pattern error ' + String(err)
      try {
        var pos = err.getPos()
        var px = pos.getX()
        var py = pos.getY()
        var pz = pos.getZ()
        text += ' at ' + px + ',' + py + ',' + pz + ' found ' + blockIdAt(px, py, pz)
        for (var i = 0; i < m.plan.cells.length; i++) {
          var c = m.plan.cells[i]
          if (c.x === px && c.y === py && c.z === pz) {
            text += ' expected symbol ' + c.ch + ' = ' + describeSymbol(c.sym) + ' (placed ' + c.block.id + c.props + ')'
            break
          }
        }
      } catch (e1) {
        text += ' (no position: ' + e1 + ')'
      }
      return text
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  function partIds(ctrl) {
    return asArray(ctrl.getParts()).map(function (p) { return String(p.getDefinition().getId()).replace('gtceu:', '') })
  }

  var PART_KIND = {
    energy_input: /^gtceu:[a-z]+_energy_input_hatch$/,
    input_bus: /^gtceu:[a-z]+_input_bus$/,
    output_bus: /^gtceu:[a-z]+_output_bus$/,
    input_hatch: /^gtceu:[a-z]+_input_hatch$/,
    output_hatch: /^gtceu:[a-z]+_output_hatch$/
  }

  function previewCheck(def, plan) {
    var shapes = asArray(def.getMatchingShapes())
    var blocks = shapes[0].getBlocks()
    var counts = {}
    var total = 0
    for (var x = 0; x < blocks.length; x++) {
      for (var y = 0; y < blocks[x].length; y++) {
        for (var z = 0; z < blocks[x][y].length; z++) {
          var info = blocks[x][y][z]
          if (info === null || info === undefined) continue
          var bid = String(Block.getId(info.getBlockState().getBlock()))
          if (bid === 'minecraft:air') continue
          counts[bid] = (counts[bid] || 0) + 1
          total++
        }
      }
    }
    var missing = []
    Object.keys(PART_KIND).forEach(function (ability) {
      var found = false
      Object.keys(counts).forEach(function (bid) {
        if (PART_KIND[ability].test(bid)) found = true
      })
      if (!found) missing.push(ability)
    })
    if (!counts[MACHINE_ID]) missing.push('controller')
    check(KEY, 'PREVIEW', shapes.length >= 1 && missing.length === 0,
      'shapes=' + shapes.length + ' blocks=' + total + ' (placed structure: ' + plan.blocks + ')' + (missing.length > 0 ? ' missing=' + missing.join(',') : ''))
  }

  // ---------------------------------------------------------------- inputs and outputs

  function readHandler(inv) {
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = String(st.getId())
      counts[id] = (counts[id] || 0) + st.getCount()
    }
    return counts
  }

  function clearInventory(inv) {
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
  }

  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return { id: st.isEmpty() ? 'none' : fluidName(st), amount: st.isEmpty() ? 0 : st.getAmount() }
  }

  function findParts(ctrl) {
    var P = { energy: [], inBus: null, outBuses: [], inHatches: [], outHatches: [] }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.energy_input) P.energy.push(p)
      else if (pid === PART_BLOCKS.input_bus) P.inBus = p
      else if (pid === PART_BLOCKS.output_bus) P.outBuses.push(p)
      else if (pid === PART_BLOCKS.input_hatch) P.inHatches.push(p)
      else if (pid === PART_BLOCKS.output_hatch) P.outHatches.push(p)
    })
    function byPos(a, b) {
      var pa = a.self().getPos()
      var pb = b.self().getPos()
      return (pa.getY() - pb.getY()) || (pa.getX() - pb.getX()) || (pa.getZ() - pb.getZ())
    }
    P.inHatches.sort(byPos)
    P.outHatches.sort(byPos)
    return P
  }

  function partsProblem(P) {
    var problems = []
    if (P.energy.length !== NEED.energy) problems.push('energy hatches ' + P.energy.length + ' (wanted ' + NEED.energy + ')')
    if ((P.inBus !== null) !== NEED.inBus) problems.push('input bus ' + (P.inBus !== null))
    if (P.outBuses.length !== NEED.outBuses) problems.push('output buses ' + P.outBuses.length + ' (wanted ' + NEED.outBuses + ')')
    if (P.inHatches.length !== NEED.inHatches) problems.push('input hatches ' + P.inHatches.length + ' (wanted ' + NEED.inHatches + ')')
    if (P.outHatches.length !== NEED.outHatches) problems.push('output hatches ' + P.outHatches.length + ' (wanted ' + NEED.outHatches + ')')
    return problems
  }

  function topUpEnergy(m) {
    if (m.parts === null) return
    m.parts.energy.forEach(function (p) {
      var c = p.energyContainer
      c.setEnergyStored(c.getEnergyCapacity())
    })
  }

  function resetMachine(m, ctrl) {
    var P = m.parts
    clearInventory(P.inBus.getInventory())
    clearInventory(P.inBus.getCircuitInventory())
    P.outBuses.forEach(function (b) { clearInventory(b.getInventory()) })
    P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    P.outHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    ctrl.getRecipeLogic().resetRecipeLogic()
  }

  function fillInputs(m, sc) {
    var P = m.parts
    var inv = P.inBus.getInventory()
    ;(sc.items || []).forEach(function (input, slot) {
      var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
    })
    // the bus circuit slot refuses insertItem (its capability IO is NONE); players set it through the GUI
    if (sc.circuit) P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(sc.circuit))
    ;(sc.fluids || []).forEach(function (f) {
      if (!P.inHatches[f.hatch]) throw new Error('the scenario needs input hatch ' + f.hatch + ' but the machine has ' + P.inHatches.length)
      P.inHatches[f.hatch].tank.setFluidInTank(0, Fluid.of(f.id, f.mb).getFluidStack())
    })
  }

  function recipeState(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() + ' lastRecipe=' + (last ? last.id : 'none')
    } catch (e) {
      return 'recipe state unreadable: ' + e
    }
  }

  function diagnose(ctrl) {
    var out = []
    try {
      var match = ctrl.getRecipeType().db().find(ctrl)
      if (!match) {
        out.push('lookup=none')
      } else {
        var helper = Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
        out.push('lookup=' + match.id)
        try { out.push('matchRecipe=' + helper.matchRecipe(ctrl, match).isSuccess()) } catch (e1) { out.push('matchRecipe threw ' + e1) }
        try { out.push('matchTickRecipe=' + helper.matchTickRecipe(ctrl, match).isSuccess()) } catch (e2) { out.push('matchTickRecipe threw ' + e2) }
      }
      var fails = asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
      if (fails.length > 0) out.push('failureReasons=[' + fails.join(' ; ') + ']')
    } catch (e) {
      out.push('diagnose threw ' + e)
    }
    return out.join(' ')
  }

  function collect(m) {
    var P = m.parts
    var items = {}
    P.outBuses.forEach(function (b) {
      var c = readHandler(b.getInventory())
      Object.keys(c).forEach(function (id) { items[id] = (items[id] || 0) + c[id] })
    })
    var gases = {}
    var hatches = P.outHatches.map(tankInfo)
    hatches.forEach(function (h) {
      if (h.amount > 0) gases[h.id] = (gases[h.id] || 0) + h.amount
    })
    return { items: items, gases: gases, hatches: hatches, fluidIn: P.inHatches.map(tankInfo), leftover: readHandler(P.inBus.getInventory()), seen: m.seen, duration: m.duration }
  }

  // ---------------------------------------------------------------- scenarios

  function planByName(name) {
    var list = global.grindless.syngas.recipes
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === name) return list[i]
    }
    throw new Error('no syngas recipe ' + name)
  }

  // one run of a plan: the feed (as one dust of the tag), the catalyst when it shifts, its fluids in the input hatches in order
  function runScenario(name, plan, feedItem) {
    var items = []
    if (plan.feed) items.push({ id: feedItem, n: plan.feed.count })
    if (plan.catalyst) items.push({ id: CATALYST, n: 1 })
    return {
      name: name,
      ticks: plan.duration + 100,
      items: items,
      circuit: plan.circuit,
      fluids: plan.fluidsIn.map(function (f, i) { return { hatch: i, id: f.id, mb: f.amount } }),
      verify: function (r) {
        var problems = []
        var have = []
        plan.fluidsOut.forEach(function (f) {
          var got = r.gases[f.id] || 0
          have.push(f.id.replace('gtceu:', '') + ' ' + got)
          if (got !== f.amount) problems.push(f.id + ' ' + got + ' (wanted ' + f.amount + ')')
        })
        Object.keys(r.gases).forEach(function (id) {
          if (!plan.fluidsOut.some(function (f) { return f.id === id })) problems.push('unexpected ' + id + ' ' + r.gases[id])
        })
        var ash = r.items[ASH] || 0
        if (plan.ash > 0) have.push('ash ' + ash + ' [0-1 @' + plan.ash + ']')
        if (ash > (plan.ash > 0 ? 1 : 0)) problems.push('ash x' + ash)
        Object.keys(r.items).forEach(function (id) { if (id !== ASH) problems.push('unexpected item ' + id) })
        r.fluidIn.forEach(function (h, i) {
          if (h.amount !== 0) problems.push('input hatch ' + i + ' still holds ' + h.id + ' ' + h.amount + ' mB')
        })
        if (plan.feed && (r.leftover[feedItem] || 0) !== 0) problems.push('feed left ' + r.leftover[feedItem])
        var cat = r.leftover[CATALYST] || 0
        if (plan.catalyst && cat > 1) problems.push('catalyst x' + cat)
        if (r.seen[plan.id] === undefined) problems.push('recipe ' + plan.id + ' never ran')
        var others = Object.keys(r.seen).filter(function (id) { return id !== plan.id })
        if (others.length > 0) problems.push('other recipes seen ' + others.join(','))
        // one HV hatch: every recipe is 480 EU/t, an HV recipe, so GTM does not overclock it
        if (!(r.duration > 0)) problems.push('the length of the run was never seen')
        else if (Math.abs(r.duration - plan.duration) > 1) problems.push('the run lasted ' + r.duration + ' t (wanted ' + plan.duration + ')')
        return {
          ok: problems.length === 0,
          detail: plan.id + ' with ' + (plan.feed ? plan.feed.count + 'x ' + feedItem + ' + ' : '') + plan.fluidsIn.map(function (f) { return f.amount + ' ' + f.id.replace('gtceu:', '') }).join(' + ') +
            ' (' + plan.eut + ' EU/t x ' + r.duration + ' t): ' + have.join(', ') + ' in hatches [' + r.hatches.map(function (h) { return h.id.replace('gtceu:', '') + ' ' + h.amount }).join(', ') + ']' +
            (plan.catalyst ? ' catalyst left=' + cat : '') + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '')
        }
      }
    }
  }

  // hydrogen mode without the catalyst: nothing may happen and nothing may be taken
  function noCatalystScenario() {
    var plan = planByName('hydrogen_carbon')
    return {
      name: 'no_catalyst',
      ticks: 80,
      items: [{ id: 'gtceu:coal_dust', n: 1 }],
      circuit: plan.circuit,
      fluids: plan.fluidsIn.map(function (f, i) { return { hatch: i, id: f.id, mb: f.amount } }),
      verify: function (r) {
        var problems = []
        if (Object.keys(r.gases).length > 0) problems.push('gases out ' + JSON.stringify(r.gases))
        var want = {}
        var got = {}
        plan.fluidsIn.forEach(function (f) { want[f.id] = (want[f.id] || 0) + f.amount })
        r.fluidIn.forEach(function (h) { if (h.amount > 0) got[h.id] = (got[h.id] || 0) + h.amount })
        dedupe(Object.keys(want).concat(Object.keys(got))).forEach(function (id) {
          if (want[id] !== got[id]) problems.push('input hatches hold ' + id + ' ' + (got[id] || 0) + ' (put in ' + (want[id] || 0) + ')')
        })
        if ((r.leftover['gtceu:coal_dust'] || 0) !== 1) problems.push('coal dust left ' + (r.leftover['gtceu:coal_dust'] || 0))
        if (Object.keys(r.seen).length > 0) problems.push('recipes seen ' + Object.keys(r.seen).join(','))
        return { ok: problems.length === 0, detail: 'coal dust + steam + circuit 3 without the shift catalyst: no run, inputs untouched' + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '') }
      }
    }
  }

  function scenarios() {
    return [
      runScenario('gasify_coal', planByName('gasify_carbon'), 'gtceu:coal_dust'),
      runScenario('shift_co', planByName('shift'), null),
      runScenario('hydrogen_coke', planByName('hydrogen_carbon'), 'gtceu:coke_dust'),
      runScenario('methanol_syngas_charcoal', planByName('methanol_syngas'), 'gtceu:charcoal_dust'),
      runScenario('hydrogen_heavy_fuel', planByName('hydrogen_heavy_fuel'), null),
      noCatalystScenario()
    ]
  }

  // ---------------------------------------------------------------- lookup

  function candidateIds(ctrl) {
    var ids = []
    var it = ctrl.getRecipeType().db().iterator(ctrl, function (r) { return true })
    if (it === null || it === undefined) return ids
    var guard = 0
    while (it.hasNext() && guard < 200) {
      ids.push(String(it.next().id))
      guard++
    }
    return ids
  }

  function runLookup(m, ctrl) {
    var bad = []
    var feeds = ['gtceu:coal_dust', 'gtceu:coke_dust', 'gtceu:charcoal_dust', 'gtceu:carbon_dust']
    global.grindless.syngas.recipes.forEach(function (plan, k) {
      var P = m.parts
      clearInventory(P.inBus.getInventory())
      clearInventory(P.inBus.getCircuitInventory())
      P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
      var sc = runScenario('lookup', plan, feeds[k % feeds.length])
      fillInputs(m, sc)
      var ids = candidateIds(ctrl)
      if (ids.indexOf(plan.id) < 0) bad.push(plan.name + ' wanted ' + plan.id + ' got [' + ids.slice(0, 6).join(',') + ']')
    })
    resetMachine(m, ctrl)
    check(KEY, 'LOOKUP', bad.length === 0, 'cases=' + global.grindless.syngas.recipes.length + ' (each with another dust of the feed tag)' + (bad.length > 0 ? ' unreachable=' + bad.join('; ') : ''))
  }

  // ---------------------------------------------------------------- the machine

  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    note(SCOPE, 'AREA', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 +
      ' generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function startMachine() {
    var m = { phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false, parts: null, scenarios: null, sc: -1, scStart: 0, seen: {}, duration: 0, stateNoted: false }
    S.machine = m
    try {
      var def = GTRegistries.MACHINES.get(rl(MACHINE_ID))
      if (def === null || def === undefined) {
        check(KEY, 'PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      // the pattern is NOT built here: GTM builds it itself, lazily, when the controller first checks its structure (as in a real world)
      var desc = global.grindless.patterns.describe(MACHINE_ID)
      m.builtBefore = !!(desc && desc.built)
      m.def = def
      m.plan = planOf(MACHINE_ID, PLANT.x, PLANT.y, PLANT.z, COUNTS)
      check(KEY, 'DESCRIPTION', true, 'registered at startup, ' + m.plan.blocks + ' blocks, ' + m.plan.size + ', pattern already built before placing: ' + m.builtBefore)
      if (!place(m.plan)) {
        m.phase = 'done'
        return
      }
      m.ctrl = m.plan.ctrl
      m.t0 = S.t
    } catch (e) {
      check(KEY, 'DESCRIPTION', false, 'exception while describing/placing: ' + e)
      m.phase = 'done'
    }
  }

  function observe(m, ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      if (last) m.seen[String(last.id)] = true
      if (m.duration === 0 && String(rlg.getStatus()) === 'WORKING' && Number(rlg.getDuration()) > 0) m.duration = Number(rlg.getDuration())
    } catch (e) { /* optional */ }
  }

  function nextScenario(m, ctrl) {
    m.sc++
    if (m.sc >= m.scenarios.length) {
      try {
        runLookup(m, ctrl)
      } catch (e) {
        check(KEY, 'LOOKUP', false, 'exception: ' + e)
      }
      m.phase = 'done'
      return
    }
    var sc = m.scenarios[m.sc]
    resetMachine(m, ctrl)
    m.seen = {}
    m.duration = 0
    m.stateNoted = false
    fillInputs(m, sc)
    note(KEY, 'INPUT_' + sc.name, 'bus=[' + itemSummary(readHandler(m.parts.inBus.getInventory())) + '] circuit=' + sc.circuit +
      ' fluids=[' + sc.fluids.map(function (f) { return 'hatch ' + f.hatch + ': ' + f.id + ' ' + f.mb + ' mB' }).join(' ; ') + ']')
    m.scStart = S.t
  }

  function advance(m) {
    var ctrl = machineAt(m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check(KEY, 'FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }

    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        var cls = 'unknown'
        try { cls = String(ctrl.getClass().getSimpleName()) } catch (e0) { cls = 'unreadable' }
        check(KEY, 'FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') + 'parts=' + partIds(ctrl).length +
          ' [' + partIds(ctrl).join(' ') + '] class=' + cls + ' tier=' + (ctrl.getTier ? ctrl.getTier() : '?'))
        check(KEY, 'PATTERN', global.grindless.patterns.describe(MACHINE_ID).built, 'built by GTM itself on the first structure check (already built before placing: ' + m.builtBefore + ')')
        try {
          previewCheck(m.def, m.plan)
        } catch (e3) {
          check(KEY, 'PREVIEW', false, 'exception: ' + e3)
        }
        m.parts = findParts(ctrl)
        var problems = partsProblem(m.parts)
        check(KEY, 'PARTS', problems.length === 0, problems.length === 0 ? '1 energy hatch, 1 input bus, 1 output bus, 2 input hatches, 3 output hatches' : problems.join('; '))
        if (problems.length > 0) {
          m.phase = 'done'
          return
        }
        m.scenarios = scenarios()
        m.sc = -1
        m.phase = 'running'
        topUpEnergy(m)
        nextScenario(m, ctrl)
        return
      }
      if (waited >= FORM_TIMEOUT) {
        if (!global.grindless.patterns.describe(MACHINE_ID).built) {
          check(KEY, 'FORMED', false, 'not formed after ' + waited + ' ticks and GTM never built the pattern')
          m.phase = 'done'
          return
        }
        if (!ctrl.checkPatternWithLock()) {
          check(KEY, 'FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(m, ctrl))
          m.phase = 'done'
          return
        }
        check(KEY, 'FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
        ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
        ctrl.onStructureFormed()
        m.forced = true
      }
      return
    }

    if (m.phase === 'running') {
      var sc = m.scenarios[m.sc]
      var running = S.t - m.scStart
      observe(m, ctrl)
      if (!m.stateNoted && running >= 30) {
        m.stateNoted = true
        note(KEY, 'STATE_' + sc.name, 'after ' + running + ' ticks: ' + recipeState(ctrl) + ' ' + diagnose(ctrl))
      }
      if (running >= sc.ticks) {
        var verdict = null
        try {
          verdict = sc.verify(collect(m))
        } catch (e) {
          verdict = { ok: false, detail: 'exception while checking: ' + e }
        }
        check(KEY, 'PROCESS_' + sc.name, verdict.ok, verdict.detail + ' | ' + recipeState(ctrl))
        nextScenario(m, ctrl)
      }
    }
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    console.info(TAG + SCOPE + '|DONE')
  }

  // setTimeout is not bound in the scripts of this server, so a server-tick handler drives the steps
  function step(elapsed) {
    try {
      S.t = elapsed
      var m = S.machine
      if (m !== null && m.phase !== 'done') {
        try {
          advance(m)
        } catch (e) {
          check(KEY, 'STEP', false, 'exception in ' + m.phase + ': ' + e)
          m.phase = 'done'
        }
      }
      if (m === null || m.phase === 'done') finish()
    } catch (e2) {
      check(SCOPE, 'STEP', false, 'exception: ' + e2)
      finish()
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    if (S.machine !== null && S.machine.phase === 'running') {
      try { topUpEnergy(S.machine) } catch (e) { /* the next step reports problems */ }
    }
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    step(now - S.tick0)
  }

  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    global[REQUEST] = false
    try {
      run(server)
    } catch (e) {
      check(SCOPE, 'run', false, 'exception: ' + e)
      finish()
    }
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, level: server.overworld(), t: 0, tick0: now, nextAt: now + STEP, machine: null, finished: false }
    try {
      staticChecks()
    } catch (e) {
      check(SCOPE, 'static', false, 'exception: ' + e)
    }
    try {
      prepareWorld()
    } catch (e2) {
      check(SCOPE, 'AREA', false, 'exception: ' + e2)
    }
    startMachine()
    if (S.machine === null || S.machine.phase === 'done') finish()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_syngas', function (event) {
    if (S !== null && !S.finished) {
      note(SCOPE, 'run', 'a previous gg_test_syngas run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
