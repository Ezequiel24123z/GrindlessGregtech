// priority: -7224
// Gregtech Grindless - test of the Steam Age additions of the journey plan: the Steam Blast Furnace and the By-product Coke
// Battery (TEST-ONLY overlay: copied over the instance on the test PC, never shipped with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_steam_content;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|steam_content\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|steam_content|<check>|PASS|FAIL|NOTE|<detail>
//   registry, recipe_types, recipes, crafting, flux_tag, feed_tags   registration and the recipes generated from the table
//   recipe_numbers      the live recipes carry the documented numbers (batch, coke, flux, EU/t, duration, fluid amounts)
//   yield_vs_gtm        per coal, the battery never beats GTM: coke 1:1, creosote <= the coke oven's, coal gas <= the pyrolyse
//                       oven's; per steel the blast furnace eats 1 coke like the Primitive Blast Furnace
//   coal_gas_sinks      coal gas has its LV destinations (gas turbine, distillery) and their machines exist
//   <m>.DESCRIPTION / PLACED / FORMED / PATTERN / PREVIEW   the structure recorded by lib/patterns.js is placed block by block and
//                       forms by itself; the preview EMI shows has the controller and every part kind
//   <m>.PROCESS         blast furnace: 16 raw iron + 16 coke + 4 calcite + steam -> 16 steel + 4 ash (its 3 600 ticks of waiting
//                       are skipped once it works: FASTFORWARD note; the outputs are the real ones)
//                       battery: 4 coal + steam -> 4 coke + 2 000 mB creosote + 500 mB coal gas in the two output hatches
//   <m>.PARALLEL        4 batches / 4 chambers ran at once
//   <m>.LOOKUP          GTM's lookup finds the right recipe for every feed and every flux form (and for coal)
//   DONE                last line
//
// Band (AGENTS.md): X 3072-3135, Z 0-15, Y 98-112 of the Overworld; chunks 192..195,0 are force-loaded and the band is cleared
// first. Everything is driven by the structure descriptions lib/patterns.js records (global.grindless.structures) and the
// numbers the pack scripts publish (global.grindless.steamContent). var + function everywhere (Rhino).
(function () {
  var TAG = 'GGTEST|steam_content|'
  var STEAM_MB = 64000
  var STEP = 20
  var FORM_TIMEOUT = 300
  var X0 = 3072
  var X1 = 3135

  var PART_BLOCKS = {
    steam: 'gtceu:steam_input_hatch',
    steam_input_bus: 'gtceu:steam_input_bus',
    steam_output_bus: 'gtceu:steam_output_bus',
    output_hatch: 'gtceu:ulv_output_hatch'
  }
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var S = null
  var LC = null

  function lazy() {
    if (LC === null) {
      LC = {
        MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        Fluids: Java.loadClass('net.minecraftforge.registries.ForgeRegistries').FLUIDS,
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        AL: Java.loadClass('java.util.ArrayList')
      }
    }
    return LC
  }

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 700)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(check, status, detail) {
    var line = TAG + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) { emit(name, ok ? 'PASS' : 'FAIL', detail) }
  function note(name, detail) { emit(name, 'NOTE', detail) }

  // a Java collection or a Java array -> JS array
  function asArray(coll) {
    var out = []
    if (coll === null || coll === undefined) return out
    if (typeof coll.size === 'function') {
      var list = new (lazy().AL)(coll)
      for (var i = 0; i < list.size(); i++) out.push(list.get(i))
      return out
    }
    for (var j = 0; j < coll.length; j++) out.push(coll[j])
    return out
  }

  function rl(id) { return new ResourceLocation(id) }

  function machineAt(p) {
    return lazy().MetaMachine.getMachine(S.level, new BlockPos(p.x, p.y, p.z))
  }

  function blockIdAt(x, y, z) { return String(S.level.getBlock(x, y, z).getId()) }

  function tagItems(tag) { return asArray(Ingredient.of('#' + tag).getItemIds()).map(String) }

  function itemSummary(counts) {
    return Object.keys(counts).sort().map(function (id) { return id + ' x' + counts[id] }).join(', ')
  }

  function fluidName(stack) {
    try {
      return String(lazy().Fluids.getKey(stack.getFluid()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  // ---------------------------------------------------------------- recipe reading (GTM 7.5.3 GTRecipe contents)

  function recipeOf(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  // SizedIngredient / FluidIngredient amount; a plain Ingredient counts 1 (or the count of its first stack)
  function amountOf(content) {
    var c = content.content
    try {
      var a = Number(c.getAmount())
      if (!isNaN(a)) return a
    } catch (e1) { /* not sized */ }
    try {
      var stacks = asArray(c.getItems())
      if (stacks.length > 0) return Number(stacks[0].getCount())
    } catch (e2) { /* not an item ingredient */ }
    return 1
  }

  // [{ raw: the ingredient, n, chance, fluid }] of one side of a recipe
  function contentsOf(recipe, cap, output) {
    var list = output ? recipe.getOutputContents(cap) : recipe.getInputContents(cap)
    return asArray(list).map(function (content) {
      return { raw: content.content, n: amountOf(content), chance: content.chance, fluid: cap === lazy().FluidCap }
    })
  }

  // the ingredient accepts this item / fluid (GTM's own Ingredient / FluidIngredient test)
  function matches(entry, id) {
    try {
      if (entry.fluid) return !!entry.raw.test(Fluid.of(id, 1000).getFluidStack())
      return !!entry.raw.test(Item.of(id))
    } catch (e) {
      return false
    }
  }

  function amountFor(entries, id) {
    var total = 0
    entries.forEach(function (e) { if (matches(e, id)) total += e.n })
    return total
  }

  function contentClasses(recipe) {
    var c = lazy()
    var names = []
    ;[[c.ItemCap, false], [c.ItemCap, true], [c.FluidCap, true]].forEach(function (k) {
      asArray(k[1] ? recipe.getOutputContents(k[0]) : recipe.getInputContents(k[0])).forEach(function (content) {
        try { names.push(String(content.content.getClass().getSimpleName()) + 'x' + amountOf(content)) } catch (e) { names.push('?') }
      })
    })
    return names.join(',')
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var SC = global.grindless.steamContent
    if (!SC || !SC.blastFurnace || !SC.cokingBattery) {
      check('registry', false, 'global.grindless.steamContent was not published by the server scripts')
      return
    }
    var bf = SC.blastFurnace
    var cb = SC.cokingBattery
    var rm = S.server.getRecipeManager()

    var machines = [bf.machine, cb.machine]
    var missingMachines = machines.filter(function (id) { return !GTRegistries.MACHINES.get(rl(id)) })
    var items = machines.concat(['gtceu:ulv_output_hatch', 'gtceu:ulv_machine_hull', 'gtceu:firebricks', 'gtceu:coke_oven_bricks',
      'gtceu:bronze_firebox_casing', 'gtceu:steam_machine_casing', 'gtceu:bronze_pipe_casing', 'gtceu:bronze_frame',
      bf.coke, bf.steel, bf.ash, 'gtceu:raw_calcite', 'gtceu:calcite_dust', 'minecraft:coal'])
    var missingItems = items.filter(function (id) { return !Item.exists(id) })
    var fluids = [cb.creosote, cb.coalGas]
    var missingFluids = fluids.filter(function (id) { return !Fluid.exists(id) })
    check('registry', missingMachines.length + missingItems.length + missingFluids.length === 0,
      'machines=' + machines.length + ' items=' + items.length + ' fluids=' + fluids.length +
      (missingMachines.length > 0 ? ' missing machines=' + missingMachines.join(',') : '') +
      (missingItems.length > 0 ? ' missing items=' + missingItems.join(',') : '') +
      (missingFluids.length > 0 ? ' missing fluids=' + missingFluids.join(',') : ''))

    var steel = GTRegistries.RECIPE_TYPES.get(rl(bf.type))
    var coking = GTRegistries.RECIPE_TYPES.get(rl(cb.type))
    check('recipe_types', !!steel && !!coking, bf.type + '=' + (steel ? 'registered' : 'missing') + ' ' + cb.type + '=' +
      (coking ? 'registered' : 'missing'))

    var want = bf.feeds.map(function (f) { return f.recipe }).concat([cb.recipe])
    var absent = want.filter(function (id) { return !rm.byKey(rl(id)).isPresent() })
    check('recipes', absent.length === 0, 'steelmaking=' + bf.feeds.length + ' (one per feed of the table) coking=1 found=' +
      (want.length - absent.length) + '/' + want.length + (absent.length > 0 ? ' missing=' + absent.join(',') : '') +
      ' type totals: steelmaking=' + (steel ? rm.getAllRecipesFor(steel).size() : -1) + ' coking=' +
      (coking ? rm.getAllRecipesFor(coking).size() : -1))

    var crafting = ['grindless:crafting/steam_blast_furnace', 'grindless:crafting/coking_battery', cb.hatchRecipe]
    var noCraft = crafting.filter(function (id) { return !rm.byKey(rl(id)).isPresent() })
    check('crafting', noCraft.length === 0, 'count=' + crafting.length + (noCraft.length > 0 ? ' missing=' + noCraft.join(',') : ''))

    var flux = tagItems(bf.fluxTag)
    var wantFlux = ['gtceu:raw_calcite', 'gtceu:calcite_dust', 'minecraft:calcite']
    var noFlux = wantFlux.filter(function (id) { return flux.indexOf(id) < 0 })
    check('flux_tag', noFlux.length === 0, '#' + bf.fluxTag + '=[' + flux.join(', ') + ']' +
      (noFlux.length > 0 ? ' missing=' + noFlux.join(',') : ''))

    var emptyFeeds = bf.feeds.filter(function (f) { return tagItems(f.input.substring(1)).length === 0 })
    check('feed_tags', emptyFeeds.length === 0, 'feeds=' + bf.feeds.length +
      (emptyFeeds.length > 0 ? ' empty=' + emptyFeeds.map(function (f) { return f.input }).join(',') : ''))

    numberChecks(bf, cb)
    yieldChecks(bf, cb)
    sinkChecks(cb)
  }

  function numberChecks(bf, cb) {
    var c = lazy()
    var problems = []
    var details = []
    try {
      var r = recipeOf(bf.feeds[0].recipe)
      var ins = contentsOf(r, c.ItemCap, false)
      var outs = contentsOf(r, c.ItemCap, true)
      var feedN = ins.length > 0 ? ins[0].n : -1
      var coke = amountFor(ins, bf.coke)
      var steel = amountFor(outs, bf.steel)
      var ash = amountFor(outs, bf.ash)
      var flux = amountFor(ins, 'gtceu:calcite_dust')
      details.push(bf.feeds[0].recipe + ': feed ' + feedN + ' coke ' + coke + ' flux ' + flux + ' -> steel ' + steel + ' ash ' + ash +
        ' EU/t ' + r.getInputEUt().getTotalEU() + ' ' + r.duration + ' t')
      if (feedN !== bf.batch || coke !== bf.batch || steel !== bf.batch || ash !== 1 || flux !== 1) problems.push('blast furnace amounts')
      if (r.duration !== bf.duration || Number(r.getInputEUt().getTotalEU()) !== bf.eut) problems.push('blast furnace EU/t or duration')
    } catch (e) {
      problems.push('blast furnace recipe unreadable: ' + e)
    }
    try {
      var k = recipeOf(cb.recipe)
      var kin = contentsOf(k, c.ItemCap, false)
      var kout = contentsOf(k, c.ItemCap, true)
      var kfl = contentsOf(k, c.FluidCap, true)
      var coal = amountFor(kin, 'minecraft:coal')
      var cokeOut = amountFor(kout, cb.coke)
      var creo = amountFor(kfl, cb.creosote)
      var gas = amountFor(kfl, cb.coalGas)
      details.push(cb.recipe + ': coal ' + coal + ' -> coke ' + cokeOut + ' creosote ' + creo + ' mB coal gas ' + gas + ' mB EU/t ' +
        k.getInputEUt().getTotalEU() + ' ' + k.duration + ' t')
      if (coal !== 1 || cokeOut !== 1 || creo !== cb.creosoteMb || gas !== cb.coalGasMb) problems.push('battery amounts')
      if (k.duration !== cb.duration || Number(k.getInputEUt().getTotalEU()) !== cb.eut) problems.push('battery EU/t or duration')
    } catch (e2) {
      problems.push('battery recipe unreadable: ' + e2)
    }
    check('recipe_numbers', problems.length === 0, details.join(' ; ') + (problems.length > 0 ? ' problems=' + problems.join(', ') : ''))
    try {
      note('recipe_contents', bf.feeds[0].recipe + ': ' + contentClasses(recipeOf(bf.feeds[0].recipe)) + ' ; ' + cb.recipe + ': ' +
        contentClasses(recipeOf(cb.recipe)))
    } catch (e3) {
      note('recipe_contents', 'unreadable: ' + e3)
    }
  }

  // the GTCA lesson: never more coke than coal, never more creosote than GTM's coke oven, never more coal gas than GTM's
  // pyrolyse oven, per coal; and the blast furnace eats as much coke per steel as GTM's Primitive Blast Furnace
  function yieldChecks(bf, cb) {
    var c = lazy()
    var problems = []
    var details = []
    var perCoal = function (r) {
      var coal = amountFor(contentsOf(r, c.ItemCap, false), 'minecraft:coal')
      var coke = amountFor(contentsOf(r, c.ItemCap, true), cb.coke)
      var fl = contentsOf(r, c.FluidCap, true)
      return { coke: coke / coal, creosote: amountFor(fl, cb.creosote) / coal, gas: amountFor(fl, cb.coalGas) / coal }
    }
    try {
      var oven = recipeOf('gtceu:coke_oven/coal_to_coke')
      var pyro = recipeOf('gtceu:pyrolyse_oven/coal_to_coal_gas')
      var pbf = recipeOf('gtceu:primitive_blast_furnace/steel_from_coke_gem')
      var battery = recipeOf(cb.recipe)
      var steel = recipeOf(bf.feeds[0].recipe)
      if (!oven || !pyro || !pbf || !battery || !steel) throw new Error('a reference recipe is missing: coke oven ' + !!oven +
        ' pyrolyse ' + !!pyro + ' pbf ' + !!pbf + ' battery ' + !!battery + ' steelmaking ' + !!steel)
      var o = perCoal(oven)
      var p = perCoal(pyro)
      var b = perCoal(battery)
      details.push('per coal: coke oven ' + JSON.stringify(o) + ' pyrolyse ' + JSON.stringify(p) + ' battery ' + JSON.stringify(b))
      if (b.coke > 1) problems.push('battery makes more coke than coal')
      if (b.creosote > o.creosote) problems.push('battery makes more creosote than the coke oven')
      if (b.gas > p.gas) problems.push('battery makes more coal gas than the pyrolyse oven')
      if (!(b.gas > 0 && b.creosote >= o.creosote)) problems.push('battery does not win the gas over the coke oven')
      var pbfIn = contentsOf(pbf, c.ItemCap, false)
      var pbfCoke = amountFor(pbfIn, bf.coke) / amountFor(contentsOf(pbf, c.ItemCap, true), bf.steel)
      var sbfCoke = amountFor(contentsOf(steel, c.ItemCap, false), bf.coke) / amountFor(contentsOf(steel, c.ItemCap, true), bf.steel)
      details.push('coke per steel: PBF ' + pbfCoke + ' steam blast furnace ' + sbfCoke)
      if (sbfCoke < pbfCoke) problems.push('the blast furnace eats less coke per steel than the PBF')
    } catch (e) {
      problems.push('exception: ' + e)
    }
    check('yield_vs_gtm', problems.length === 0, details.join(' ; ') + (problems.length > 0 ? ' problems=' + problems.join(', ') : ''))
  }

  function sinkChecks(cb) {
    var rm = S.server.getRecipeManager()
    var sinks = ['gtceu:gas_turbine/coal_gas', 'gtceu:distillery/distill_coal_gas_to_coal_tar',
      'gtceu:distillery/distill_coal_gas_to_ammonia', 'gtceu:distillery/distill_coal_gas_to_ethylbenzene']
    var machines = ['gtceu:lv_gas_turbine', 'gtceu:lv_distillery']
    var noRecipe = sinks.filter(function (id) { return !rm.byKey(rl(id)).isPresent() })
    var noMachine = machines.filter(function (id) { return !GTRegistries.MACHINES.get(rl(id)) })
    check('coal_gas_sinks', noRecipe.length === 0 && noMachine.length === 0, 'LV recipes ' + (sinks.length - noRecipe.length) + '/' +
      sinks.length + ' machines ' + (machines.length - noMachine.length) + '/' + machines.length +
      (noRecipe.length > 0 ? ' missing recipes=' + noRecipe.join(',') : '') + (noMachine.length > 0 ? ' missing machines=' + noMachine.join(',') : ''))
    var mv = ['grindless:bio_distillation/bio/coal_gas', 'gtceu:distillation_tower/distill_coal_gas']
    note('coal_gas_sinks_mv', mv.map(function (id) { return id + '=' + rm.byKey(rl(id)).isPresent() }).join(' '))
  }

  // ---------------------------------------------------------------- structures

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

  // a "casing OR parts" cell: the parts the limits ask for are spread over the cells, the rest is the plain block
  function assignOneOf(sym, list, machineId) {
    var filler = null
    var parts = []
    sym.options.forEach(function (o) {
      if (o.kind === 'part') {
        var lim = o.limits || {}
        var need = lim.exact != null ? lim.exact : (lim.min != null ? lim.min : 0)
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

  // slices back -> front (controller in the last one), rows bottom -> top; the controller faces north:
  // x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)
  function planOf(machineId, cx, cy, cz) {
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
        assignOneOf(sym, list, machineId)
      } else {
        var b = simpleBlock(sym, machineId)
        list.forEach(function (c) { c.block = b })
      }
    })
    var occupied = {}
    cells.forEach(function (c) { if (c.block) occupied[c.x + ',' + c.y + ',' + c.z] = true })
    var air = cells.filter(function (c) { return c.sym.kind === 'air' })
    cells.forEach(function (c) {
      if (!c.block) return
      if (c.block.controller) {
        c.props = '[facing=north]'
      } else if (c.block.ability) {
        // an outside face first; a part under the hollow shaft can only face into it
        for (var pass = 0; pass < 2 && c.props === ''; pass++) {
          for (var i = 0; i < SIDES.length; i++) {
            var s = SIDES[i]
            var key = (c.x + s[1]) + ',' + (c.y + s[2]) + ',' + (c.z + s[3])
            var inside = air.some(function (a) { return a.x + ',' + a.y + ',' + a.z === key })
            if (!occupied[key] && (pass === 1 || !inside)) {
              c.props = '[facing=' + s[0] + ']'
              break
            }
          }
        }
      }
    })
    var placed = cells.filter(function (c) { return c.block !== null })
    return {
      id: machineId, cx: cx, cy: cy, cz: cz, cells: placed, air: air, desc: desc,
      size: desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)',
      blocks: placed.length
    }
  }

  function setBlock(c) {
    return S.server.runCommandSilent('setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
  }

  function place(m) {
    var plan = m.plan
    var failed = []
    var ctrlCell = null
    plan.cells.forEach(function (c) {
      if (c.block.controller) { ctrlCell = c; return }
      if (setBlock(c) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.block.id + c.props)
    })
    if (setBlock(ctrlCell) < 1) failed.push('controller ' + ctrlCell.block.id)
    plan.ctrl = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.block.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.block.id + ' got ' + got)
    })
    plan.air.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== 'minecraft:air') wrong.push(c.x + ',' + c.y + ',' + c.z + ' should be air, got ' + got)
    })
    var parts = plan.cells.filter(function (c) { return c.block.ability }).map(function (c) {
      return c.block.ability + '@' + c.x + ',' + c.y + ',' + c.z + c.props
    })
    check(m.key + '.PLACED', failed.length === 0 && wrong.length === 0,
      'blocks=' + plan.blocks + ' air=' + plan.air.length + ' size=' + plan.size + ' controller=' + plan.ctrl.x + ',' + plan.ctrl.y + ',' +
      plan.ctrl.z + ' parts=[' + parts.join(' ') + ']' +
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
        m.plan.cells.forEach(function (c) {
          if (c.x === px && c.y === py && c.z === pz) text += ' expected ' + c.ch + ' = ' + describeSymbol(c.sym) + ' (placed ' + c.block.id + ')'
        })
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

  function previewCheck(m) {
    var shapes = asArray(m.def.getMatchingShapes())
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
    var missing = m.spec.previewParts.filter(function (p) {
      return !Object.keys(counts).some(function (bid) { return bid === p || (p.indexOf('*') === 0 && bid.indexOf(p.substring(1)) >= 0) })
    })
    if (!counts[m.spec.id]) missing.push('controller')
    check(m.key + '.PREVIEW', shapes.length >= 1 && missing.length === 0 && total === m.plan.blocks,
      'shapes=' + shapes.length + ' blocks=' + total + '/' + m.plan.blocks + ' parts=[' + Object.keys(counts).filter(function (bid) {
        return /hatch|bus/.test(bid)
      }).map(function (bid) { return bid + ' x' + counts[bid] }).join(', ') + ']' + (missing.length > 0 ? ' missing=' + missing.join(',') : ''))
  }

  // ---------------------------------------------------------------- inputs and outputs

  function readBus(bus) {
    var inv = bus.getInventory()
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

  function readTanks(hatches) {
    var out = {}
    hatches.forEach(function (h) {
      var st = h.tank.getFluidInTank(0)
      if (st.isEmpty()) return
      var id = fluidName(st)
      out[id] = (out[id] || 0) + Number(st.getAmount())
    })
    return out
  }

  function steamIn(m) { return Number(m.hatch.tank.getFluidInTank(0).getAmount()) }

  function fillSteam(hatch) {
    var tank = hatch.tank
    var report = []
    var makers = [
      ['material', function () { return GTMaterials.Steam.getFluid(STEAM_MB) }],
      ['kubejs', function () { return Fluid.of('gtceu:steam', STEAM_MB).getFluidStack() }]
    ]
    for (var i = 0; i < makers.length; i++) {
      try {
        var stack = makers[i][1]()
        tank.setFluidInTank(0, stack)
        var got = tank.getFluidInTank(0).getAmount()
        report.push(makers[i][0] + '->' + got)
        if (got > 0) return { ok: true, report: report.join(' ') }
      } catch (e) {
        report.push(makers[i][0] + ' threw ' + e)
      }
    }
    return { ok: false, report: report.join(' ') }
  }

  function findParts(m, ctrl) {
    m.inBus = null
    m.hatch = null
    m.outs = []
    m.tanks = []
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.steam_input_bus) m.inBus = p
      else if (pid === PART_BLOCKS.steam) m.hatch = p
      else if (pid === PART_BLOCKS.steam_output_bus) m.outs.push(p)
      else if (pid === PART_BLOCKS.output_hatch) m.tanks.push(p)
    })
    if (m.inBus === null || m.hatch === null || m.outs.length === 0 || m.tanks.length !== m.spec.tanks) {
      throw new Error('missing parts: input bus=' + (m.inBus !== null) + ' steam hatch=' + (m.hatch !== null) + ' output buses=' +
        m.outs.length + ' output hatches=' + m.tanks.length + '/' + m.spec.tanks)
    }
  }

  function fillInputs(m) {
    var inv = m.inBus.getInventory()
    clearInventory(inv)
    m.outs.forEach(function (b) { clearInventory(b.getInventory()) })
    m.tanks.forEach(function (t) { t.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    m.spec.inputs.forEach(function (input, slot) {
      var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
    })
    var steam = fillSteam(m.hatch)
    m.steamStart = steamIn(m)
    note(m.key + '.INPUT', 'bus=[' + itemSummary(readBus(m.inBus)) + '] steam=' + m.steamStart + ' mB (' + steam.report + ') output buses=' +
      m.outs.length + ' output hatches=' + m.tanks.length)
    if (!steam.ok) throw new Error('no steam could be put into the hatch')
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
      out.push('workingEnabled=' + ctrl.isWorkingEnabled())
    } catch (e) {
      out.push('diagnose threw ' + e)
    }
    return out.join(' ')
  }

  function collect(m, ctrl) {
    var counts = {}
    m.outs.forEach(function (b) {
      var c = readBus(b)
      Object.keys(c).forEach(function (id) { counts[id] = (counts[id] || 0) + c[id] })
    })
    var fluids = readTanks(m.tanks)
    var left = readBus(m.inBus)
    var used = m.steamStart - steamIn(m)
    var verdict = m.spec.verify(counts, fluids, left)
    check(m.key + '.PROCESS', verdict.ok, verdict.detail + ' | items=[' + itemSummary(counts) + '] fluids=' + JSON.stringify(fluids) +
      ' left in bus=[' + itemSummary(left) + '] steamUsed=' + used + ' mB ' + recipeState(ctrl))
    var runs = m.spec.runs(counts)
    check(m.key + '.PARALLEL', runs === 4, 'runs=' + runs + ' at once (4 expected)')
  }

  // GTM's lookup picks the expected recipe for every case; outputs are emptied first (a recipe is only found when they fit)
  function runLookup(m, ctrl) {
    ctrl.setWorkingEnabled(false)
    var bus = m.inBus.getInventory()
    var db = ctrl.getRecipeType().db()
    var bad = []
    var cases = m.spec.cases()
    m.outs.forEach(function (b) { clearInventory(b.getInventory()) })
    m.tanks.forEach(function (t) { t.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    cases.forEach(function (c) {
      clearInventory(bus)
      c.inputs.forEach(function (input, slot) { bus.insertItem(slot, Item.of(input.id, input.n), false) })
      var found = db.find(ctrl)
      var got = found ? String(found.id) : 'none'
      if (got !== c.want) bad.push(c.label + ' wanted ' + c.want + ' got ' + got)
    })
    clearInventory(bus)
    check(m.key + '.LOOKUP', bad.length === 0, 'cases=' + cases.length + (bad.length > 0 ? ' mismatches=' + bad.slice(0, 8).join('; ') : ''))
  }

  function firstItem(tagOrId) {
    if (tagOrId.charAt(0) !== '#') return tagOrId
    var ids = tagItems(tagOrId.substring(1))
    if (ids.length === 0) throw new Error('empty tag ' + tagOrId)
    // prefer the GT item of a tag (vanilla raw iron is first for #forge:raw_materials/iron anyway)
    for (var i = 0; i < ids.length; i++) if (ids[i].indexOf('gtceu:') === 0 || ids[i].indexOf('minecraft:') === 0) return ids[i]
    return ids[0]
  }

  function blastCases() {
    var bf = global.grindless.steamContent.blastFurnace
    var cases = bf.feeds.map(function (f) {
      return {
        label: f.id, want: f.recipe,
        inputs: [{ id: firstItem(f.input), n: bf.batch }, { id: bf.coke, n: bf.batch }, { id: 'gtceu:calcite_dust', n: 1 }]
      }
    })
    ;['gtceu:raw_calcite', 'minecraft:calcite'].forEach(function (flux) {
      cases.push({
        label: 'raw_iron+' + flux, want: bf.feeds[0].recipe,
        inputs: [{ id: firstItem(bf.feeds[0].input), n: bf.batch }, { id: bf.coke, n: bf.batch }, { id: flux, n: 1 }]
      })
    })
    cases.push({
      label: 'no flux', want: 'none',
      inputs: [{ id: firstItem(bf.feeds[0].input), n: bf.batch }, { id: bf.coke, n: bf.batch }]
    })
    return cases
  }

  function batteryCases() {
    var cb = global.grindless.steamContent.cokingBattery
    return [
      { label: 'coal', want: cb.recipe, inputs: [{ id: 'minecraft:coal', n: 1 }] },
      { label: 'charcoal', want: 'none', inputs: [{ id: 'minecraft:charcoal', n: 1 }] }
    ]
  }

  // ---------------------------------------------------------------- machines

  var SPECS = [
    {
      key: 'steam_blast_furnace', id: 'gtceu:steam_blast_furnace', x: 3080, y: 100, z: 3, tanks: 0, fastForward: true, runTicks: 160,
      previewParts: ['gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus'],
      inputs: [{ id: 'minecraft:raw_iron', n: 16 }, { id: 'gtceu:coke_gem', n: 16 }, { id: 'gtceu:calcite_dust', n: 4 }],
      cases: blastCases,
      runs: function (counts) { return Math.floor((counts['gtceu:steel_ingot'] || 0) / 4) },
      verify: function (counts, fluids, left) {
        var steel = counts['gtceu:steel_ingot'] || 0
        var ash = counts['gtceu:ash_dust'] || 0
        var unexpected = Object.keys(counts).filter(function (id) { return id !== 'gtceu:steel_ingot' && id !== 'gtceu:ash_dust' })
        return {
          ok: steel === 16 && ash === 4 && unexpected.length === 0 && Object.keys(left).length === 0,
          detail: 'raw iron x16 + coke x16 + calcite x4: steel=' + steel + ' (16) ash=' + ash + ' (4)' +
            (unexpected.length > 0 ? ' unexpected=' + unexpected.join(',') : '')
        }
      }
    },
    {
      key: 'coking_battery', id: 'gtceu:coking_battery', x: 3100, y: 100, z: 3, tanks: 2, fastForward: false, runTicks: 640,
      previewParts: ['gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus', '*output_hatch'],
      inputs: [{ id: 'minecraft:coal', n: 4 }],
      cases: batteryCases,
      runs: function (counts) { return counts['gtceu:coke_gem'] || 0 },
      verify: function (counts, fluids, left) {
        var cb = global.grindless.steamContent.cokingBattery
        var coke = counts['gtceu:coke_gem'] || 0
        var creo = fluids[cb.creosote] || 0
        var gas = fluids[cb.coalGas] || 0
        return {
          ok: coke === 4 && creo === 4 * cb.creosoteMb && gas === 4 * cb.coalGasMb && Object.keys(left).length === 0,
          detail: 'coal x4: coke=' + coke + ' (4) creosote=' + creo + ' mB (' + 4 * cb.creosoteMb + ') coal gas=' + gas + ' mB (' +
            4 * cb.coalGasMb + ')'
        }
      }
    }
  ]

  function prepareWorld() {
    for (var cx = X0 >> 4; cx <= X1 >> 4; cx++) S.level.getChunk(cx, 0)
    S.server.runCommandSilent('forceload add ' + X0 + ' 0 ' + X1 + ' 15')
    var cleared = S.server.runCommandSilent('fill ' + X0 + ' 98 0 ' + X1 + ' 112 15 air')
    note('AREA', 'chunks ' + (X0 >> 4) + '..' + (X1 >> 4) + ',0 generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function startMachine(spec) {
    var m = { key: spec.key, spec: spec, phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false, noted: false, ff: false }
    S.machines.push(m)
    try {
      var def = GTRegistries.MACHINES.get(rl(spec.id))
      if (!def) {
        check(m.key + '.PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      m.def = def
      var desc = global.grindless.patterns.describe(spec.id)
      m.builtBefore = !!(desc && desc.built)
      m.plan = planOf(spec.id, spec.x, spec.y, spec.z)
      check(m.key + '.DESCRIPTION', true, 'registered at startup, ' + m.plan.blocks + ' blocks + ' + m.plan.air.length + ' air, ' + m.plan.size +
        ', pattern already built before placing: ' + m.builtBefore)
      if (!place(m)) {
        m.phase = 'done'
        return
      }
      m.ctrl = m.plan.ctrl
      m.t0 = S.t
    } catch (e) {
      check(m.key + '.DESCRIPTION', false, 'exception while describing/placing: ' + e)
      m.phase = 'done'
    }
  }

  function advance(m) {
    var ctrl = machineAt(m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check(m.key + '.FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }
    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        check(m.key + '.FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') + 'parts=[' +
          partIds(ctrl).join(' ') + ']')
        check(m.key + '.PATTERN', global.grindless.patterns.describe(m.spec.id).built,
          'built by GTM itself on the first structure check (already built before placing: ' + m.builtBefore + ')')
        try { previewCheck(m) } catch (e3) { check(m.key + '.PREVIEW', false, 'exception: ' + e3) }
        findParts(m, ctrl)
        fillInputs(m)
        m.phase = 'running'
        m.tStart = S.t
        return
      }
      if (waited >= FORM_TIMEOUT) {
        if (!global.grindless.patterns.describe(m.spec.id).built) {
          check(m.key + '.FORMED', false, 'not formed after ' + waited + ' ticks and GTM never built the pattern')
          m.phase = 'done'
          return
        }
        if (!ctrl.checkPatternWithLock()) {
          check(m.key + '.FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(m, ctrl))
          m.phase = 'done'
          return
        }
        check(m.key + '.FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
        ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
        ctrl.onStructureFormed()
        m.forced = true
      }
      return
    }
    if (m.phase === 'running') {
      var running = S.t - m.tStart
      if (m.spec.fastForward && !m.ff && running >= 40) {
        var logic = ctrl.getRecipeLogic()
        if (String(logic.getStatus()) === 'WORKING' && logic.getDuration() > 100) {
          var before = logic.getProgress()
          logic.setProgress(logic.getDuration() - 20)
          m.ff = true
          note(m.key + '.FASTFORWARD', 'progress ' + before + ' -> ' + logic.getProgress() + ' of ' + logic.getDuration() +
            ' (only the waiting is skipped, the outputs are the real ones)')
        }
      }
      if (!m.noted && running >= 60) {
        m.noted = true
        note(m.key + '.STATE', 'after ' + running + ' ticks: ' + recipeState(ctrl) + ' steam=' + steamIn(m) + ' ' + diagnose(ctrl))
      }
      if (running >= m.spec.runTicks) {
        collect(m, ctrl)
        try { runLookup(m, ctrl) } catch (e) { check(m.key + '.LOOKUP', false, 'exception: ' + e) }
        m.phase = 'done'
      }
    }
  }

  function allDone() {
    for (var i = 0; i < S.machines.length; i++) if (S.machines[i].phase !== 'done') return false
    return true
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    console.info(TAG + 'DONE')
  }

  function step(elapsed) {
    try {
      S.t = elapsed
      S.machines.forEach(function (m) {
        if (m.phase === 'done') return
        try {
          advance(m)
        } catch (e) {
          check(m.key + '.STEP', false, 'exception in ' + m.phase + ': ' + e)
          m.phase = 'done'
        }
      })
      if (allDone()) finish()
    } catch (e) {
      check('STEP', false, 'exception: ' + e)
      finish()
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    step(now - S.tick0)
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, level: server.overworld(), t: 0, tick0: now, nextAt: now + STEP, machines: [], finished: false }
    try { staticChecks() } catch (e) { check('static', false, 'exception: ' + e) }
    try { prepareWorld() } catch (e2) { check('AREA', false, 'exception: ' + e2) }
    SPECS.forEach(startMachine)
    if (allDone()) finish()
  }

  ServerEvents.tick(function () { onTick() })

  ServerEvents.customCommand('gg_test_steam_content', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_steam_content run is still in progress')
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
