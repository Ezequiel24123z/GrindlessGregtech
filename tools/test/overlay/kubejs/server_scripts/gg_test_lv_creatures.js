// Gregtech Grindless - smoke test of the LV Creature Simulator (TEST-ONLY overlay: copied over the instance on the
// test PC, never shipped with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_lv_creatures' -WaitForLog 'GGTEST\|lv_creatures\|DONE@@600'
//
// Markers: GGTEST|lv_creatures|<check>|PASS|FAIL|NOTE|<detail>
//   Static (registries, data and recipes as the pack loaded them):
//     items, tag          the blank model, every creature model and the grindless:creature_models tag
//     registry            recipe type gtceu:creature_simulation and the four machines (LV, MV, HV, EV)
//     table               global.grindless.checkCreatureTable() (tiers = EU/t, unique prints, items exist...)
//     recipes             one gtceu:creature_simulation recipe per roll with the right EU/t tier, model and circuit
//                         not consumed, biomass and mineral consumed, drops (chanced ones too); the assembler recipes
//                         (blank model + one print per creature); the four machine crafting recipes
//     biomass_chain       biomass comes out of the LV brewery from what the greenhouse grows (carrots, saplings);
//                         raw rubber (slime mineral) comes out of the extractor from the resin of the rubber tree
//     biomass_rate        the rule behind biomass_mb of the table: ONE brewery of a tier keeps ONE simulator of that tier
//                         running at full speed (GTM's own brewery recipes: 2.5 mB/s at LV, x2 per tier above)
//   Lookup (GTM's recipe database asks the real machine, nothing runs):
//     lookup_sim          every roll of every creature finds its recipe in the simulator of its tier
//     lookup_neg          wrong / missing circuit, mineral or biomass find nothing
//     lookup_print        blank model + print items finds the print of every creature (and the blank model recipe)
//   Process (real machines with their energy container filled every tick):
//     skeleton_lv         LV: model + 2 TCP + the biomass of 2 cycles + circuit 1 -> 2 cycles of bones; model kept, rest eaten
//     enderman_lv         LV: 2 obsidian + 50 mB -> 1 pearl in 20 s
//     cow_mv              MV: circuit 2 (leather only, no beef), overclocked (duration < 200), 3 cycles
//     creeper_mv          MV: runs the MV creature
//     blaze_mv            MV: runs the blaze (the End is MV since v0.5.0)
//     creeper_lv_gate     LV simulator refuses the MV creature: nothing is made, nothing is consumed
//     print_skeleton      LV assembler: blank model + 8 TCP -> the skeleton model
//     brewery_lv|mv|hv    real breweries (carrots + water): 20 mB per 160 / 80 / 40 ticks = 2.5 / 5 / 10 mB/s, the biomass
//                         one simulator of the tier eats (an LV brewery does not overclock the 3 EU/t recipe, MV and HV do)
//   lv_creatures|DONE     last line
//
// Everything is placed around x 64..79, y 101, z 2..6 in the overworld (chunks 4,0 and 5,0 are generated and
// force-loaded, the area is cleared first). Every check of the machines is driven by the creature table, so the test
// follows it. var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that
// run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'lv_creatures'
  var STEP = 20
  var SETTLE = 20
  var Y = 101
  var BIOMASS_FILL_MARGIN = 0

  // a mod can reload the datapacks while the test runs (Additional Placements does it once, right after the world starts):
  // KubeJS then loads this script again, so the state of a running test lives in global and the new copy picks it up
  var S = global.ggLvCreaturesState || null
  var metaMachineClass = null
  var circuitClass = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 700)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(check, status, detail) {
    var line = TAG + SCOPE + '|' + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
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

  function machineAt(p) {
    if (metaMachineClass === null) metaMachineClass = Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
    return metaMachineClass.getMachine(S.level, new BlockPos(p.x, p.y, p.z))
  }

  function circuitStack(n) {
    if (circuitClass === null) circuitClass = Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour')
    return circuitClass.stack(n)
  }

  function blockIdAt(p) {
    return String(S.level.getBlock(p.x, p.y, p.z).getId())
  }

  function itemSummary(counts) {
    var keys = Object.keys(counts).sort()
    if (keys.length === 0) return 'nothing'
    return keys.map(function (id) { return id + ' x' + counts[id] }).join(', ')
  }

  function tagSize(tag) {
    return asArray(Ingredient.of('#' + tag).getItemIds()).length
  }

  function ingredientOk(id) {
    return String(id).charAt(0) === '#' ? tagSize(String(id).substring(1)) > 0 : Item.exists(id)
  }

  function fluidExists(id) {
    return Java.loadClass('net.minecraftforge.registries.ForgeRegistries').FLUIDS.containsKey(rl(id))
  }

  function recipeOf(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  // what one of GTM's brewery recipes makes: { mb per cycle, ticks per cycle, EU/t tier (0 = ULV) }
  function breweryRecipe(id) {
    var helper = Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
    var r = recipeOf(id)
    if (r === null) throw new Error(id + ' is missing')
    var fluids = asArray(helper.getOutputFluids(r))
    if (fluids.length !== 1) throw new Error(id + ' has ' + fluids.length + ' fluid outputs')
    return { mb: Number(fluids[0].getAmount()), ticks: Number(r.duration), tier: helper.getRecipeEUtTier(r) }
  }

  function findMob(id) {
    for (var i = 0; i < S.table.mobs.length; i++) {
      if (S.table.mobs[i].id === id) return S.table.mobs[i]
    }
    throw new Error('no creature ' + id + ' in the creature table')
  }

  function findRoll(mob, circuit) {
    for (var i = 0; i < mob.rolls.length; i++) {
      if (mob.rolls[i].circuit === circuit) return mob.rolls[i]
    }
    throw new Error('creature ' + mob.id + ' has no roll with circuit ' + circuit)
  }

  // one failing API call must not hide the rest of the checks
  function safely(name, fn) {
    try {
      fn()
    } catch (e) {
      check(name, false, 'exception: ' + e)
    }
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var G = global.grindless
    var rm = S.server.getRecipeManager()
    var table = S.table
    var helper = Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
    var itemCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
    var fluidCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
    var type = GTRegistries.RECIPE_TYPES.get(rl('gtceu:creature_simulation'))

    safely('items', function () {
      var items = [table.blank]
      table.mobs.forEach(function (mob) { items.push(mob.model) })
      var missingItems = items.filter(function (id) { return !Item.exists(id) })
      check('items', missingItems.length === 0,
        'count=' + items.length + (missingItems.length > 0 ? ' missing=' + missingItems.join(',') : ''))
      var tagged = tagSize('grindless:creature_models')
      check('tag', tagged === table.mobs.length, 'grindless:creature_models has ' + tagged + ' of ' + table.mobs.length)
    })

    safely('registry', function () {
      check('registry', !!type, 'recipe type gtceu:creature_simulation ' + (type ? 'registered' : 'missing'))
      var machineNotes = []
      var machinesOk = true
      G.creatureMachines().forEach(function (m) {
        var def = GTRegistries.MACHINES.get(rl(m.machine))
        if (def === null || def === undefined) {
          machinesOk = false
          machineNotes.push(m.machine + ' missing')
          return
        }
        var typeIds = []
        var defTypes = def.getRecipeTypes()
        for (var i = 0; i < defTypes.length; i++) typeIds.push(String(defTypes[i].registryName))
        var tierOk = def.getTier() === m.tier && typeIds.length === 1 && typeIds[0] === 'gtceu:creature_simulation'
        if (!tierOk) machinesOk = false
        machineNotes.push(m.machine + ' tier=' + def.getTier() + ' types=' + typeIds.join('/'))
      })
      check('registry_machines', machinesOk, machineNotes.join('; '))
    })

    safely('table', function () {
      var problems = G.checkCreatureTable()
      check('table', problems.length === 0,
        'creatures=' + table.mobs.length + (problems.length > 0 ? ' problems=' + problems.join('; ') : ''))
    })

    // the table check covers the items; this one covers the fluid, the tags and the machine parts
    safely('ingredients', function () {
      var tagProblems = []
      G.creatureBlank().inputs.forEach(function (id) { if (!ingredientOk(id)) tagProblems.push(id) })
      G.creatureMachines().forEach(function (m) {
        Object.keys(m.keys).forEach(function (k) { if (!ingredientOk(m.keys[k])) tagProblems.push(m.keys[k]) })
        if (!Item.exists(m.machine)) tagProblems.push(m.machine)
      })
      check('ingredients', fluidExists(table.biomass.fluid) && tagProblems.length === 0,
        'biomass fluid ' + table.biomass.fluid + ' ' + (fluidExists(table.biomass.fluid) ? 'exists' : 'missing') +
        (tagProblems.length > 0 ? ' missing=' + tagProblems.join(',') : ''))
    })

    safely('recipes_sim', function () {
      if (!type) {
        check('recipes_sim', false, 'the recipe type is not registered')
        return
      }
      var wantSim = 0
      table.mobs.forEach(function (mob) { wantSim += mob.rolls.length })
      var haveSim = rm.getAllRecipesFor(type).size()
      var simProblems = []
      table.mobs.forEach(function (mob) {
        mob.rolls.forEach(function (roll) {
          var id = G.creatureRecipeId(mob, roll)
          var r = recipeOf(id)
          if (r === null) {
            simProblems.push(id + ' missing')
            return
          }
          var tier = helper.getRecipeEUtTier(r)
          if (tier !== mob.tier) simProblems.push(id + ' EU/t tier ' + tier + ' (table: ' + mob.tier + ')')
          if (r.duration !== mob.duration) simProblems.push(id + ' duration ' + r.duration + ' (table: ' + mob.duration + ')')

          var itemsIn = asArray(r.getInputContents(itemCap))
          var notConsumed = itemsIn.filter(function (c) { return c.chance === 0 }).length
          var consumed = itemsIn.length - notConsumed
          // not consumed: the model and the circuit; consumed: the mineral
          var wantConsumed = mob.mineral ? 1 : 0
          if (notConsumed !== 2 || consumed !== wantConsumed) {
            simProblems.push(id + ' item inputs: ' + notConsumed + ' not consumed (2 wanted) and ' + consumed + ' consumed (' + wantConsumed + ' wanted)')
          }
          var fluidsIn = asArray(r.getInputContents(fluidCap))
          if (fluidsIn.length !== 1 || fluidsIn[0].chance === 0) simProblems.push(id + ' needs exactly one consumed fluid input')

          var outs = asArray(r.getOutputContents(itemCap))
          var chanced = outs.filter(function (c) { return c.chance < c.maxChance }).length
          var wantChanced = roll.drops.filter(function (d) { return d.chance < 1 }).length
          if (outs.length !== roll.drops.length || chanced !== wantChanced) {
            simProblems.push(id + ' outputs: ' + outs.length + ' (' + chanced + ' chanced), table: ' + roll.drops.length + ' (' + wantChanced + ' chanced)')
          }
        })
      })
      check('recipes_sim', haveSim === wantSim && simProblems.length === 0,
        'creature_simulation=' + haveSim + '/' + wantSim + (simProblems.length > 0 ? ' problems=' + simProblems.slice(0, 6).join('; ') : ''))
    })

    // assembler recipes (blank model + prints) and the machine crafting recipes
    safely('recipes_print', function () {
      var printProblems = []
      if (recipeOf(G.creatureBlankRecipeId) === null) printProblems.push(G.creatureBlankRecipeId + ' missing')
      table.mobs.forEach(function (mob) {
        if (recipeOf(G.creaturePrintId(mob)) === null) printProblems.push(G.creaturePrintId(mob) + ' missing')
      })
      check('recipes_print', printProblems.length === 0,
        'blank + ' + table.mobs.length + ' prints' + (printProblems.length > 0 ? ' missing=' + printProblems.join(', ') : ''))
    })

    safely('recipes_crafting', function () {
      var craftingMissing = G.creatureMachines().filter(function (m) { return !rm.byKey(rl(m.recipe)).isPresent() })
      check('recipes_crafting', craftingMissing.length === 0,
        'machines=' + G.creatureMachines().length + (craftingMissing.length > 0 ? ' missing=' + craftingMissing.map(function (m) { return m.recipe }).join(',') : ''))
    })

    // where the biomass and the raw rubber come from (GTM recipes + what the greenhouse grows)
    safely('biomass_chain', function () {
      var chainProblems = []
      if (GTRegistries.MACHINES.get(rl('gtceu:lv_brewery')) === null) chainProblems.push('gtceu:lv_brewery is not registered')
      var chainRecipes = ['gtceu:brewery/biomass_from_carrot', 'gtceu:brewery/biomass_from_sapling', 'gtceu:extractor/raw_rubber_from_resin']
      chainRecipes.forEach(function (id) {
        if (recipeOf(id) === null) chainProblems.push(id + ' missing')
      })
      var greenhouse = G.greenhouse
      if (greenhouse && greenhouse.entries) {
        var grows = function (item) {
          return greenhouse.entries.some(function (e) { return e.outputs.some(function (o) { return o.item === item }) })
        }
        var growsSaplingBack = greenhouse.entries.some(function (e) {
          return e.outputs.some(function (o) { return /_sapling$|propagule$/.test(String(o.item)) })
        })
        if (!grows('minecraft:carrot')) chainProblems.push('the greenhouse table does not grow carrots')
        if (!growsSaplingBack) chainProblems.push('the greenhouse table gives no saplings')
        if (!grows('gtceu:sticky_resin')) chainProblems.push('the greenhouse table does not give sticky resin')
      } else {
        note('biomass_chain', 'global.grindless.greenhouse is not available, only the GTM recipes were checked')
      }
      check('biomass_chain', chainProblems.length === 0,
        'greenhouse (carrots, saplings) -> lv_brewery -> ' + table.biomass.fluid + '; resin -> extractor -> raw rubber' +
        (chainProblems.length > 0 ? ' problems=' + chainProblems.join('; ') : ''))
    })

    // the rule behind biomass_mb: ONE brewery of a tier keeps ONE simulator of that tier running at full speed. The brewery
    // side is read from GTM's own recipes (carrot, sapling) and the table is held to it; the x2 per tier above LV is
    // measured on real breweries further down (brewery_lv, brewery_mv, brewery_hv)
    safely('biomass_rate', function () {
      var rateProblems = []
      var rates = []
      var recipeIds = ['gtceu:brewery/biomass_from_carrot', 'gtceu:brewery/biomass_from_sapling']
      var sources = []
      recipeIds.forEach(function (id) {
        var b = breweryRecipe(id)
        rates.push(b.mb * 20 / b.ticks)
        sources.push(id.replace('gtceu:brewery/biomass_from_', '') + ' ' + b.mb + ' mB / ' + b.ticks + ' t')
        if (b.tier !== 0) rateProblems.push(id + ' is no longer a ULV recipe (EU/t tier ' + b.tier + '): the LV brewery would overclock it')
      })
      var liveRate = Math.min.apply(null, rates)
      if (table.biomass.lvBreweryMbPerS > liveRate + 1e-9) {
        rateProblems.push('the table counts on ' + table.biomass.lvBreweryMbPerS + ' mB/s from an LV brewery, GTM makes ' + liveRate)
      }
      var eats = []
      table.mobs.forEach(function (mob) {
        var demand = mob.biomassMb * 20 / mob.duration
        var supply = liveRate * Math.pow(2, mob.tier - 1)
        eats.push(mob.id + ' ' + demand + '/' + supply)
        if (demand > supply + 1e-9) rateProblems.push(mob.id + ' eats ' + demand + ' mB/s, one brewery of its tier makes ' + supply)
      })
      check('biomass_rate', rateProblems.length === 0,
        'LV brewery ' + liveRate + ' mB/s (' + sources.join(', ') + '); creature eats/brewery makes in mB/s: ' + eats.join(', ') +
        (rateProblems.length > 0 ? ' problems=' + rateProblems.join('; ') : ''))
    })

    // every part of the machine recipes and of the blank model, and every mineral / print item, has at least one recipe
    // that produces it (a crafting table recipe or a GT machine recipe): nothing in the chain is a dead end
    safely('parts_craftable', function () {
      var access = S.server.registryAccess()

      var parts = []
      G.creatureMachines().forEach(function (m) {
        Object.keys(m.keys).forEach(function (k) { parts.push({ id: m.keys[k], required: true }) })
      })
      G.creatureBlank().inputs.forEach(function (id) { parts.push({ id: id, required: true }) })
      var extras = []
      table.mobs.forEach(function (mob) {
        mob.print.forEach(function (p) { extras.push(p.item) })
        if (mob.mineral) extras.push(mob.mineral.item)
      })
      extras.forEach(function (id) { parts.push({ id: id, required: false }) })

      // a tag is covered when any of its members is produced
      var wanted = {}
      parts.forEach(function (p) {
        if (String(p.id).charAt(0) === '#') {
          asArray(Ingredient.of(p.id).getItemIds()).forEach(function (m) { wanted[String(m)] = true })
        } else {
          wanted[p.id] = true
        }
      })
      var made = {}
      Object.keys(wanted).forEach(function (id) { made[id] = [] })

      var seen = { gt: 0, other: 0, errors: 0, firstError: '' }
      asArray(S.server.getRecipeManager().getRecipes()).forEach(function (r) {
        var outs = []
        try {
          // GT machine recipes answer getOutputContents; crafting recipes have a result item. The ingredient of a GT
          // output cannot be read from here (Rhino does not see SizedIngredient.getItems), RecipeHelper can
          if (typeof r.getOutputContents === 'function') {
            seen.gt++
            asArray(helper.getOutputItems(r)).forEach(function (st) { outs.push(String(st.getId())) })
          } else {
            seen.other++
            outs.push(String(r.getResultItem(access).getId()))
          }
        } catch (e) {
          seen.errors++
          if (seen.firstError === '') seen.firstError = String(e)
          return
        }
        outs.forEach(function (id) {
          if (made[id] !== undefined && made[id].length < 3) made[id].push(String(r.getId()))
        })
      })

      var missing = []
      var notes = []
      var noProducer = []
      parts.forEach(function (p) {
        var ids = String(p.id).charAt(0) === '#' ? asArray(Ingredient.of(p.id).getItemIds()).map(String) : [p.id]
        var producers = []
        ids.forEach(function (id) { producers = producers.concat(made[id] || []) })
        if (p.required) notes.push(p.id + '<-' + (producers.length > 0 ? producers[0] : 'nothing'))
        if (producers.length === 0 && p.required) missing.push(p.id)
        if (producers.length === 0 && !p.required && noProducer.indexOf(p.id) < 0) noProducer.push(p.id)
      })
      if (noProducer.length > 0) {
        note('parts_craftable', 'no recipe produces ' + noProducer.join(', ') + ' (they come from the veins, the greenhouse, a creature or the quest)')
      }
      note('parts_craftable', 'scanned ' + seen.gt + ' GT recipes and ' + seen.other + ' others, ' + seen.errors + ' unreadable' +
        (seen.firstError !== '' ? ' (first: ' + seen.firstError + ')' : ''))
      check('parts_craftable', missing.length === 0,
        'parts=' + parts.length + (missing.length > 0 ? ' no recipe makes: ' + missing.join(', ') : ' all of them have a recipe') + ' | ' + notes.slice(0, 12).join('; '))
    })

    // an example, as GTM stores it
    try {
      var sample = recipeOf(G.creatureRecipeId(table.mobs[0], table.mobs[0].rolls[0]))
      if (sample !== null) {
        note('recipe_sample', table.mobs[0].id + ': duration=' + sample.duration + ' tier=' + helper.getRecipeEUtTier(sample) +
          ' item inputs=' + asArray(sample.getInputContents(itemCap)).map(function (c) { return 'chance=' + c.chance }).join(' ') +
          ' outputs=' + asArray(sample.getOutputContents(itemCap)).map(function (c) { return 'chance=' + c.chance + '/' + c.maxChance }).join(' '))
      }
    } catch (e) {
      note('recipe_sample', 'could not inspect: ' + e)
    }
  }

  // ---------------------------------------------------------------- machine helpers

  function clearHandler(h) {
    for (var i = 0; i < h.getSlots(); i++) h.setStackInSlot(i, Item.empty)
  }

  function clearMachine(mm) {
    var empty = Java.loadClass('net.minecraftforge.fluids.FluidStack').EMPTY
    clearHandler(mm.importItems)
    clearHandler(mm.exportItems)
    clearHandler(mm.getCircuitInventory())
    for (var i = 0; i < mm.importFluids.getTanks(); i++) mm.importFluids.setFluidInTank(i, empty)
    for (var j = 0; j < mm.exportFluids.getTanks(); j++) mm.exportFluids.setFluidInTank(j, empty)
  }

  function readHandler(h) {
    var counts = {}
    for (var i = 0; i < h.getSlots(); i++) {
      var st = h.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = String(st.getId())
      counts[id] = (counts[id] || 0) + st.getCount()
    }
    return counts
  }

  function fluidName(stack) {
    try {
      return String(Java.loadClass('net.minecraftforge.registries.ForgeRegistries').FLUIDS.getKey(stack.getFluid()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  // the GT material's stack, then KubeJS' Fluid.of, then the tank's own fill(): the first one that sticks wins
  function fillFluid(tank, id, mb) {
    var report = []
    var makers = []
    if (id === 'gtceu:biomass') makers.push(['material', function () { return GTMaterials.Biomass.getFluid(mb) }])
    makers.push(['kubejs', function () { return Fluid.of(id, mb).getFluidStack() }])
    for (var i = 0; i < makers.length; i++) {
      try {
        var stack = makers[i][1]()
        tank.setFluidInTank(0, stack)
        var got = tank.getFluidInTank(0).getAmount()
        report.push(makers[i][0] + '(' + fluidName(stack) + ' empty=' + stack.isEmpty() + ')->' + got)
        if (got > 0) return { ok: true, report: report.join(' ') }
      } catch (e) {
        report.push(makers[i][0] + ' threw ' + e)
      }
    }
    try {
      var action = Java.loadClass('net.minecraftforge.fluids.capability.IFluidHandler$FluidAction').EXECUTE
      var filled = tank.fill(Fluid.of(id, mb).getFluidStack(), action)
      report.push('fill()->' + filled + ' now ' + tank.getFluidInTank(0).getAmount())
      if (tank.getFluidInTank(0).getAmount() > 0) return { ok: true, report: report.join(' ') }
    } catch (e2) {
      report.push('fill() threw ' + e2)
    }
    return { ok: false, report: report.join(' ') }
  }

  // items: [{id, n}] into slots 0..; fluidMb of fluidId (default: the biomass of the table) into the first tank; circuit 0 = none
  function loadMachine(mm, items, fluidMb, circuit, fluidId) {
    clearMachine(mm)
    items.forEach(function (it, slot) {
      var left = mm.importItems.insertItem(slot, Item.of(it.id, it.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + it.id + ' x' + it.n + ' into slot ' + slot)
    })
    if (fluidMb > 0) {
      var wantedFluid = fluidId || S.table.biomass.fluid
      var f = fillFluid(mm.importFluids, wantedFluid, fluidMb)
      if (!f.ok) throw new Error('could not put ' + fluidMb + ' mB of ' + wantedFluid + ' into the tank: ' + f.report)
    }
    if (circuit > 0) mm.getCircuitInventory().setStackInSlot(0, circuitStack(circuit))
  }

  function recipeState(mm) {
    try {
      var rlg = mm.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() +
        ' lastRecipe=' + (last ? last.id : 'none')
    } catch (e) {
      return 'recipe state unreadable: ' + e
    }
  }

  // what GTM's own recipe lookup and matching say about the machine right now (used when a machine stays idle)
  function diagnose(mm) {
    var out = []
    try {
      var match = mm.getRecipeType().db().find(mm)
      if (!match) {
        out.push('lookup=none')
      } else {
        var helper = Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
        out.push('lookup=' + match.id)
        try { out.push('matchRecipe=' + helper.matchRecipe(mm, match).isSuccess()) } catch (e1) { out.push('matchRecipe threw ' + e1) }
        try { out.push('matchTickRecipe=' + helper.matchTickRecipe(mm, match).isSuccess()) } catch (e2) { out.push('matchTickRecipe threw ' + e2) }
      }
      out.push('workingEnabled=' + mm.isWorkingEnabled())
      out.push('energy=' + mm.energyContainer.getEnergyStored() + '/' + mm.energyContainer.getEnergyCapacity())
    } catch (e) {
      out.push('diagnose threw ' + e)
    }
    return out.join(' ')
  }

  // find(holder) is unambiguous; find(holder, predicate) is not for Rhino (the holder could also be read as a list or a
  // map), so the structural lookup spells the signature out
  var FIND_ANY = 'find(com.gregtechceu.gtceu.api.capability.recipe.IRecipeCapabilityHolder,java.util.function.Predicate)'

  function lookup(mm, items, fluidMb, circuit) {
    loadMachine(mm, items, fluidMb, circuit)
    var db = mm.getRecipeType().db()
    var found = db.find(mm)
    var got = found ? String(found.id) : 'none'
    var loose = null
    if (!found) {
      try {
        var any = db[FIND_ANY](mm, function () { return true })
        loose = any ? String(any.id) : 'none'
      } catch (e) {
        loose = 'unavailable (' + e + ')'
      }
    }
    return { got: got, loose: loose }
  }

  // ---------------------------------------------------------------- lookups

  function runLookups() {
    var G = global.grindless
    var table = S.table

    var bad = []
    var cases = 0
    table.mobs.forEach(function (mob) {
      var mm = machineAt(S.lookups['t' + mob.tier])
      mob.rolls.forEach(function (roll) {
        var items = [{ id: mob.model, n: 1 }]
        if (mob.mineral) items.push({ id: mob.mineral.item, n: mob.mineral.n })
        var res = lookup(mm, items, mob.biomassMb, roll.circuit)
        var want = G.creatureRecipeId(mob, roll)
        cases++
        if (res.got !== want) bad.push(mob.id + '/circuit ' + roll.circuit + ' wanted ' + want + ' got ' + res.got)
      })
      clearMachine(mm)
    })
    check('lookup_sim', bad.length === 0, 'cases=' + cases + (bad.length > 0 ? ' mismatches=' + bad.slice(0, 8).join('; ') : ''))

    // wrong or missing circuit / mineral / biomass / model: nothing is found
    var negs = []
    var negBad = []
    var skeleton = findMob('skeleton')
    var cow = findMob('cow')
    var mm1 = machineAt(S.lookups.t1)
    var skeletonItems = [{ id: skeleton.model, n: 1 }, { id: skeleton.mineral.item, n: skeleton.mineral.n }]
    negs.push(['wrong circuit', skeletonItems, skeleton.biomassMb, 2])
    negs.push(['no circuit', skeletonItems, skeleton.biomassMb, 0])
    negs.push(['no biomass', skeletonItems, 0, 1])
    negs.push(['no mineral', [{ id: skeleton.model, n: 1 }], skeleton.biomassMb, 1])
    negs.push(['no model', [{ id: skeleton.mineral.item, n: skeleton.mineral.n }], skeleton.biomassMb, 1])
    negs.push(['circuit without a roll', [{ id: cow.model, n: 1 }], cow.biomassMb, cow.rolls.length + 1])
    negs.forEach(function (n) {
      var res = lookup(mm1, n[1], n[2], n[3])
      if (res.got !== 'none') negBad.push(n[0] + ' found ' + res.got)
    })
    clearMachine(mm1)
    check('lookup_neg', negBad.length === 0, 'cases=' + negs.length + (negBad.length > 0 ? ' unexpected=' + negBad.join('; ') : ''))

    // the prints in the LV assembler
    var asm = machineAt(S.lookups.assembler)
    var printBad = []
    var printCases = 0
    table.mobs.forEach(function (mob) {
      var items = [{ id: table.blank, n: 1 }]
      mob.print.forEach(function (p) { items.push({ id: p.item, n: p.n }) })
      var res = lookup(asm, items, 0, 0)
      printCases++
      if (res.got !== G.creaturePrintId(mob)) {
        printBad.push(mob.id + ' wanted ' + G.creaturePrintId(mob) + ' got ' + res.got + ' (structural: ' + res.loose + ')')
      }
    })
    var blankItems = G.creatureBlank().inputs.map(function (id) {
      var item = String(id).charAt(0) === '#' ? String(asArray(Ingredient.of(id).getItemIds())[0]) : id
      return { id: item, n: 1 }
    })
    var blankRes = lookup(asm, blankItems, 0, 0)
    printCases++
    if (blankRes.got !== G.creatureBlankRecipeId) {
      printBad.push('blank wanted ' + G.creatureBlankRecipeId + ' got ' + blankRes.got + ' (structural: ' + blankRes.loose + ')')
    }
    clearMachine(asm)
    check('lookup_print', printBad.length === 0, 'cases=' + printCases + (printBad.length > 0 ? ' mismatches=' + printBad.slice(0, 6).join('; ') : ''))
  }

  // ---------------------------------------------------------------- processes

  function dropTotals(roll, cycles) {
    var want = {}
    var chanced = {}
    roll.drops.forEach(function (d) {
      if (d.chance >= 1) want[d.item] = d.n * cycles
      else chanced[d.item] = d.n * cycles
    })
    return { want: want, chanced: chanced }
  }

  // outputs must hold exactly the guaranteed drops x cycles, plus at most the chanced ones; nothing else
  function verifyDrops(roll, cycles, outs) {
    var totals = dropTotals(roll, cycles)
    var problems = []
    Object.keys(totals.want).forEach(function (id) {
      if ((outs[id] || 0) !== totals.want[id]) problems.push(id + ' ' + (outs[id] || 0) + ' (wanted ' + totals.want[id] + ')')
    })
    Object.keys(outs).forEach(function (id) {
      if (totals.want[id] === undefined && totals.chanced[id] === undefined) problems.push('unexpected ' + id + ' x' + outs[id])
      if (totals.chanced[id] !== undefined && outs[id] > totals.chanced[id]) problems.push(id + ' ' + outs[id] + ' (at most ' + totals.chanced[id] + ')')
    })
    return problems
  }

  function simSpec(name, machineId, mobId, circuit, cycles, wait, x, z) {
    var mob = findMob(mobId)
    var roll = findRoll(mob, circuit)
    var items = [{ id: mob.model, n: 1 }]
    if (mob.mineral) items.push({ id: mob.mineral.item, n: mob.mineral.n * cycles })
    return {
      name: name, machineId: machineId, mob: mob, roll: roll, cycles: cycles, wait: wait, pos: { x: x, y: Y, z: z },
      items: items, fluidMb: mob.biomassMb * cycles + BIOMASS_FILL_MARGIN, circuit: circuit,
      verify: function (outs, left, tank) {
        var problems = verifyDrops(roll, cycles, outs)
        if (mob.mineral && (left[mob.mineral.item] || 0) !== 0) problems.push(mob.mineral.item + ' left ' + left[mob.mineral.item])
        if ((left[mob.model] || 0) !== 1) problems.push('model count ' + (left[mob.model] || 0) + ' (never used up, wanted 1)')
        if (tank !== 0) problems.push('biomass left ' + tank + ' mB')
        return problems
      }
    }
  }

  // a real brewery of the tier fed with carrots and water makes 20 mB per (160 / 2^(tier-1)) ticks, which is the 2.5 mB/s x
  // 2^(tier-1) of the table: the biomass of one simulator cycle. The cycle length is probed while the recipe runs and the
  // fluid made by the end is counted
  function brewerySpec(name, machineId, tier, x, carrot) {
    var cycle = carrot.ticks / Math.pow(2, tier - 1)
    return {
      name: name, machineId: machineId, wait: 350, pos: { x: x, y: Y, z: 6 },
      items: [{ id: 'minecraft:carrot', n: 32 }], fluidId: 'minecraft:water', fluidMb: 1000, circuit: 0,
      probeAt: 60,
      describe: function (mm) {
        var made = mm.exportFluids.getFluidInTank(0)
        return 'made ' + made.getAmount() + ' mB of ' + fluidName(made)
      },
      probe: function (mm) {
        var duration = Number(mm.getRecipeLogic().getDuration())
        var perSecond = duration > 0 ? carrot.mb * 20 / duration : 0
        var counted = S.table.biomass.lvBreweryMbPerS * Math.pow(2, tier - 1)
        check(name + '_rate', duration === cycle && perSecond >= counted - 1e-9,
          'cycle ' + duration + ' ticks (' + cycle + ' wanted) = ' + perSecond + ' mB/s, the table counts on ' + counted + ' mB/s ' + recipeState(mm))
      },
      verify: function (outs, left, tank, mm, running) {
        var made = mm.exportFluids.getFluidInTank(0)
        var amount = Number(made.getAmount())
        var problems = []
        if (amount > 0 && fluidName(made) !== S.table.biomass.fluid) problems.push('made ' + fluidName(made) + ', not ' + S.table.biomass.fluid)
        // the recipe starts a tick or two after loading and may lose a few ticks on each restart
        var least = Math.floor((running - 2) / (cycle + 6)) * carrot.mb
        var most = Math.floor((running + 2) / cycle) * carrot.mb
        if (amount < least || amount > most) problems.push('made ' + amount + ' mB of biomass in ' + running + ' ticks, ' + least + '..' + most + ' wanted')
        return problems
      }
    }
  }

  function buildSpecs() {
    var specs = [
      simSpec('skeleton_lv', 'gtceu:lv_creature_simulator', 'skeleton', 1, 2, 560, 66, 6),
      simSpec('enderman_lv', 'gtceu:lv_creature_simulator', 'enderman', 1, 1, 560, 68, 6),
      simSpec('cow_mv', 'gtceu:mv_creature_simulator', 'cow', 2, 3, 420, 70, 6),
      simSpec('creeper_mv', 'gtceu:mv_creature_simulator', 'creeper', 1, 1, 340, 72, 6),
      simSpec('blaze_mv', 'gtceu:mv_creature_simulator', 'blaze', 1, 1, 340, 74, 6),
      // a chanced drop: 4 cycles, the spider eye (33 %) may show up 0..4 times, the string always 6 per cycle
      simSpec('spider_mv', 'gtceu:mv_creature_simulator', 'spider', 1, 4, 520, 80, 6)
    ]
    specs[2].probeAt = 60
    specs[2].probe = function (mm) {
      var duration = mm.getRecipeLogic().getDuration()
      var base = specs[2].mob.duration
      check('cow_mv_overclock', duration > 0 && duration < base,
        'duration ' + duration + ' ticks, the recipe says ' + base + ' (an MV machine overclocks an LV recipe) ' + recipeState(mm))
    }

    // the LV simulator refuses a creature of a higher tier
    var creeper = findMob('creeper')
    specs.push({
      name: 'creeper_lv_gate', machineId: 'gtceu:lv_creature_simulator', mob: creeper, wait: 140, pos: { x: 76, y: Y, z: 6 },
      items: [{ id: creeper.model, n: 1 }, { id: creeper.mineral.item, n: creeper.mineral.n }],
      fluidMb: creeper.biomassMb, circuit: 1,
      verify: function (outs, left, tank) {
        var problems = []
        if (Object.keys(outs).length > 0) problems.push('made ' + itemSummary(outs))
        if ((left[creeper.mineral.item] || 0) !== creeper.mineral.n) problems.push('the mineral was consumed')
        if (tank !== creeper.biomassMb) problems.push('biomass ' + tank + ' mB, should be untouched')
        return problems
      }
    })

    // the LV assembler prints a model from a blank one: blank + print items -> model, inputs eaten
    var skeleton = findMob('skeleton')
    var printItems = [{ id: S.table.blank, n: 1 }]
    skeleton.print.forEach(function (p) { printItems.push({ id: p.item, n: p.n }) })
    specs.push({
      name: 'print_skeleton', machineId: 'gtceu:lv_assembler', mob: skeleton, wait: 200, pos: { x: 78, y: Y, z: 6 },
      items: printItems, fluidMb: 0, circuit: 0, assembler: true,
      verify: function (outs, left, tank) {
        var problems = []
        if ((outs[skeleton.model] || 0) !== 1 || Object.keys(outs).length !== 1) problems.push('made ' + itemSummary(outs) + ' (wanted ' + skeleton.model + ' x1)')
        if (Object.keys(left).length > 0) problems.push('left over ' + itemSummary(left))
        return problems
      }
    })

    // the biomass side of the rule, on real breweries
    try {
      var carrot = breweryRecipe('gtceu:brewery/biomass_from_carrot')
      specs.push(brewerySpec('brewery_lv', 'gtceu:lv_brewery', 1, 82, carrot))
      specs.push(brewerySpec('brewery_mv', 'gtceu:mv_brewery', 2, 84, carrot))
      specs.push(brewerySpec('brewery_hv', 'gtceu:hv_brewery', 3, 86, carrot))
    } catch (e) {
      check('brewery_specs', false, 'exception: ' + e)
    }
    return specs
  }

  // ---------------------------------------------------------------- world

  // machines face north; the property is dropped if a block refuses it
  function setBlock(id, p) {
    var at = p.x + ' ' + p.y + ' ' + p.z + ' ' + id
    var res = S.server.runCommandSilent('setblock ' + at + '[facing=north] replace')
    if (res < 1) res = S.server.runCommandSilent('setblock ' + at + ' replace')
    return res
  }

  function prepareWorld() {
    S.level.getChunk(4, 0)
    S.level.getChunk(5, 0)
    S.server.runCommandSilent('forceload add 64 0 95 15')
    var cleared = S.server.runCommandSilent('fill 64 98 0 95 112 15 air')
    note('AREA', 'chunks 4,0 and 5,0 generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function placeMachines() {
    S.lookups = {
      t1: { x: 66, y: Y, z: 2 }, t2: { x: 68, y: Y, z: 2 }, t3: { x: 70, y: Y, z: 2 }, t4: { x: 72, y: Y, z: 2 },
      assembler: { x: 74, y: Y, z: 2 }
    }
    var placed = []
    var failed = []
    var place = function (id, p) {
      if (setBlock(id, p) < 1) failed.push(id + '@' + p.x + ',' + p.y + ',' + p.z)
      else placed.push(id)
    }
    place('gtceu:lv_creature_simulator', S.lookups.t1)
    place('gtceu:mv_creature_simulator', S.lookups.t2)
    place('gtceu:hv_creature_simulator', S.lookups.t3)
    place('gtceu:ev_creature_simulator', S.lookups.t4)
    place('gtceu:lv_assembler', S.lookups.assembler)
    S.specs.forEach(function (spec) { place(spec.machineId, spec.pos) })
    check('PLACED', failed.length === 0, 'machines=' + placed.length + (failed.length > 0 ? ' setblock failed: ' + failed.join('; ') : ''))
    return failed.length === 0
  }

  function checkShapes() {
    var problems = []
    var notes = []
    var keys = ['t1', 't2', 't3', 't4']
    keys.forEach(function (key) {
      var mm = machineAt(S.lookups[key])
      if (mm === null || mm === undefined) {
        problems.push(key + ': no machine at the position')
        return
      }
      var shape = 'in=' + mm.importItems.getSlots() + ' out=' + mm.exportItems.getSlots() + ' tanks=' + mm.importFluids.getTanks() +
        '/' + mm.exportFluids.getTanks() + ' circuit=' + mm.getCircuitInventory().getSlots() + ' tank=' + mm.importFluids.getTankCapacity(0) + 'mB' +
        ' energy=' + mm.energyContainer.getEnergyCapacity()
      notes.push(key + ' ' + shape)
      if (mm.importItems.getSlots() !== 3 || mm.exportItems.getSlots() !== 4 || mm.importFluids.getTanks() !== 1 ||
        mm.exportFluids.getTanks() !== 0 || mm.getCircuitInventory().getSlots() !== 1) {
        problems.push(key + ' has the wrong slots: ' + shape)
      }
    })
    check('machine_shape', problems.length === 0, notes.join('; ') + (problems.length > 0 ? ' problems=' + problems.join('; ') : ''))
  }

  // ---------------------------------------------------------------- driving

  function refillEnergy() {
    S.specs.forEach(function (spec) {
      if (spec.phase === 'done') return
      var mm = machineAt(spec.pos)
      if (mm === null || mm === undefined) return
      var e = mm.energyContainer
      e.setEnergyStored(e.getEnergyCapacity())
    })
  }

  function startSpec(spec) {
    var mm = machineAt(spec.pos)
    if (mm === null || mm === undefined) {
      check(spec.name, false, 'no machine at ' + spec.pos.x + ',' + spec.pos.y + ',' + spec.pos.z + ' (' + blockIdAt(spec.pos) + ')')
      spec.phase = 'done'
      return
    }
    loadMachine(mm, spec.items, spec.fluidMb, spec.circuit, spec.fluidId)
    spec.t0 = S.t
    spec.phase = 'running'
    spec.noted = false
    note(spec.name + '_INPUT', 'items=[' + itemSummary(readHandler(mm.importItems)) + '] fluid=' +
      (mm.importFluids.getTanks() > 0 ? mm.importFluids.getFluidInTank(0).getAmount() : 0) + ' mB circuit=' + spec.circuit +
      ' machine=' + spec.machineId)
  }

  function advanceSpec(spec) {
    var mm = machineAt(spec.pos)
    if (mm === null || mm === undefined) {
      check(spec.name, false, 'the machine disappeared')
      spec.phase = 'done'
      return
    }
    var running = S.t - spec.t0
    if (spec.probe && !spec.probed && running >= spec.probeAt) {
      spec.probed = true
      spec.probe(mm)
    }
    if (!spec.noted && running >= 100) {
      spec.noted = true
      note(spec.name + '_STATE', 'after ' + running + ' ticks: ' + recipeState(mm) + ' outputs=[' + itemSummary(readHandler(mm.exportItems)) + ']')
    }
    if (running < spec.wait) return

    var outs = readHandler(mm.exportItems)
    var left = readHandler(mm.importItems)
    var tank = mm.importFluids.getTanks() > 0 ? mm.importFluids.getFluidInTank(0).getAmount() : 0
    var problems = spec.verify(outs, left, tank, mm, running)
    var detail = 'after ' + running + ' ticks: outputs=[' + itemSummary(outs) + '] inputs left=[' + itemSummary(left) + '] fluid left=' + tank +
      ' mB ' + recipeState(mm)
    if (spec.describe) detail += ' | ' + spec.describe(mm)
    if (problems.length > 0) detail += ' | problems: ' + problems.join('; ') + ' | ' + diagnose(mm)
    check(spec.name, problems.length === 0, detail)
    spec.phase = 'done'
  }

  function allDone() {
    for (var i = 0; i < S.specs.length; i++) {
      if (S.specs[i].phase !== 'done') return false
    }
    return true
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
      if (!S.started && elapsed >= SETTLE) {
        S.started = true
        try {
          checkShapes()
        } catch (e0) {
          check('machine_shape', false, 'exception: ' + e0)
        }
        try {
          runLookups()
        } catch (e1) {
          check('lookups', false, 'exception: ' + e1)
        }
        S.specs.forEach(function (spec) {
          try {
            startSpec(spec)
          } catch (e2) {
            check(spec.name, false, 'exception while starting: ' + e2)
            spec.phase = 'done'
          }
        })
      }
      if (S.started) {
        S.specs.forEach(function (spec) {
          if (spec.phase !== 'running') return
          try {
            advanceSpec(spec)
          } catch (e3) {
            check(spec.name, false, 'exception: ' + e3)
            spec.phase = 'done'
          }
        })
        if (allDone()) finish()
      }
    } catch (e) {
      check('STEP', false, 'exception: ' + e)
      finish()
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    try {
      if (S.started) refillEnergy()
    } catch (e) {
      check('ENERGY', false, 'exception: ' + e)
      finish()
      return
    }
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    step(now - S.tick0)
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, level: server.overworld(), t: 0, tick0: now, nextAt: now + STEP, specs: [], started: false, finished: false, table: null, lookups: null }
    global.ggLvCreaturesState = S
    try {
      S.table = global.grindless.creatureTable()
    } catch (e) {
      check('table', false, 'cannot read the creature table: ' + e)
      finish()
      return
    }
    try {
      staticChecks()
    } catch (e1) {
      check('static', false, 'exception: ' + e1)
    }
    try {
      prepareWorld()
      S.specs = buildSpecs()
      S.specs.forEach(function (spec) { spec.phase = 'waiting' })
      if (!placeMachines()) {
        finish()
      }
    } catch (e2) {
      check('SETUP', false, 'exception: ' + e2)
      finish()
    }
  }

  if (S !== null && !S.finished) note('reload', 'the scripts were loaded again while the test was running, it carries on')

  ServerEvents.tick(function () { onTick() })

  ServerEvents.customCommand('gg_test_lv_creatures', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_lv_creatures run is still in progress')
      return 0
    }
    try {
      run(event.getLevel().getServer())
    } catch (e) {
      check('run', false, 'exception: ' + e)
      finish()
    }
    return 1
  })
})()
