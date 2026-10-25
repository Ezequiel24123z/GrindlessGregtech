// Gregtech Grindless - test of the small Steam multiblock family (GTL idea, docs/investigacion/leisure.md 4.2;
// TEST-ONLY overlay: copied over the instance on the test PC, never shipped with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_steam_small_family;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|steam_small_family\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|steam_small_family|<check>|PASS|FAIL|NOTE|<detail>
//   registry, recipe_types, crafting            registration: the 6 machines, their crafting recipes and the ULV
//                                               input hatch crafting recipe (mixer/bath/washer need fluid input)
//   <m>.DESCRIPTION / PLACED / FORMED / PATTERN / PREVIEW   the structure recorded by lib/patterns.js is placed
//                       block by block and forms by itself; the preview EMI shows has the controller and every part
//   <m>.PROCESS         steam_compressor: 32 sand -> 8 sandstone (GTM's compressor/sandstone, x8 parallels);
//                       steam_chemical_bath: 8 sugar cane + 800 mB water -> 8 paper (GTM's chemical_bath/
//                       paper_from_sugar_cane, x8 parallels; its EUt is capped at 32 by SteamParallelMultiblockMachine)
//   <m>.PARALLEL        8 batches ran at once (the other four only form + static-check: same mechanism as the
//                       macerator/furnace Steam Grinder/Oven and our own steam_blast_furnace/coking_battery, already
//                       proven in-game; AGENTS.md "no se vuelve a probar lo que ya está probado")
//   <m>.LOOKUP          static check for all six: a real GTM recipe of the machine's own recipe type (forge_hammer/
//                       compressor/alloy_smelter/mixer/chemical_bath/ore_washer), picked live from the recipe
//                       manager (EUt <= 32, LV tier or below) and fed into the formed structure, resolves through
//                       GTM's own recipe lookup (ctrl.getRecipeType().db().find) to that exact recipe: proves the
//                       multiblock is correctly bound to and can run its recipe type, with no numbers hardcoded here
//   DONE                last line
//
// Band (AGENTS.md): X 5120-5183, Z 0-15, Y 98-112 of the Overworld; chunks are force-loaded and the band is cleared
// first. Everything is driven by the structure descriptions lib/patterns.js records (global.grindless.structures) and
// the ids global.grindless.steamSmallFamily publishes. var + function everywhere (Rhino).
(function () {
  var TAG = 'GGTEST|steam_small_family|'
  var STEAM_MB = 64000
  var STEP = 20
  var FORM_TIMEOUT = 300
  var EU_CAP = 32 // SteamParallelMultiblockMachine.recipeModifier: rejects recipe tiers above LV (32 EU/t)
  var X0 = 5120
  var X1 = 5183

  var PART_BLOCKS = {
    steam: 'gtceu:steam_input_hatch',
    steam_input_bus: 'gtceu:steam_input_bus',
    steam_output_bus: 'gtceu:steam_output_bus',
    input_hatch: 'gtceu:ulv_input_hatch',
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

  function emit(check, status, detail) {
    var line = TAG + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) { emit(name, ok ? 'PASS' : 'FAIL', detail) }
  function note(name, detail) { emit(name, 'NOTE', detail) }

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

  function contentsOf(recipe, cap, output) {
    var list = output ? recipe.getOutputContents(cap) : recipe.getInputContents(cap)
    return asArray(list).map(function (content) {
      return { raw: content.content, n: amountOf(content), chance: content.chance, fluid: cap === lazy().FluidCap }
    })
  }

  // a concrete, correctly-sized sample stack straight out of the recipe's own ingredient (SizedIngredient.getItems() /
  // FluidIngredient.getStacks() both already return stacks at the recipe's own amount - no guessing involved)
  function sampleStack(entry) {
    try {
      if (entry.fluid) {
        var stacks = asArray(entry.raw.getStacks())
        return stacks.length > 0 ? stacks[0] : null
      }
      var items = asArray(entry.raw.getItems())
      return items.length > 0 ? items[0] : null
    } catch (e) {
      return null
    }
  }

  // Picks the simplest (fewest distinct fluids, then fewest total contents) LV-tier-or-below recipe of a GTM recipe
  // type straight from the live recipe manager: nothing about alloy_smelter/mixer/ore_washer's own recipes is
  // hardcoded here, so this works whatever recipes GTM 7.5.3 actually ships.
  function pickRecipe(typeId, euCap, noFluid) {
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    if (!type) return null
    var c = lazy()
    var all = asArray(S.server.getRecipeManager().getAllRecipesFor(type))
    var candidates = []
    all.forEach(function (r) {
      try {
        var eut = Number(r.getInputEUt().getTotalEU())
        if (eut > euCap) return
        var ii = contentsOf(r, c.ItemCap, false)
        var fi = contentsOf(r, c.FluidCap, false)
        if (noFluid && fi.length > 0) return
        if (ii.length + fi.length === 0) return
        if (ii.length > 4) return // a steam input bus only has 4 slots (one distinct item ingredient per slot)
        var iiS = ii.map(sampleStack)
        var fiS = fi.map(sampleStack)
        if (iiS.some(function (s) { return s === null })) return
        if (fiS.some(function (s) { return s === null })) return
        candidates.push({ recipe: r, iiS: iiS, fiS: fiS, score: fi.length * 100 + ii.length + fi.length })
      } catch (e) { /* skip unreadable recipe */ }
    })
    if (candidates.length === 0) return null
    candidates.sort(function (a, b) { return a.score - b.score })
    return candidates[0]
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var SF = global.grindless.steamSmallFamily
    if (!SF || !SF.machines || SF.machines.length !== 6) {
      check('registry', false, 'global.grindless.steamSmallFamily was not published by the server scripts')
      return
    }
    var rm = S.server.getRecipeManager()
    var machineIds = SF.machines.map(function (m) { return m.id })
    var missingMachines = machineIds.filter(function (id) { return !GTRegistries.MACHINES.get(rl(id)) })
    check('registry', missingMachines.length === 0, 'machines=' + machineIds.length +
      (missingMachines.length > 0 ? ' missing=' + missingMachines.join(',') : ''))

    var missingTypes = SF.machines.filter(function (m) { return !GTRegistries.RECIPE_TYPES.get(rl(m.type)) })
    check('recipe_types', missingTypes.length === 0, 'types=' + SF.machines.map(function (m) { return m.type }).join(',') +
      (missingTypes.length > 0 ? ' missing=' + missingTypes.map(function (m) { return m.type }).join(',') : ''))

    var craftIds = SF.machines.map(function (m) { return m.crafting }).concat([SF.ulvInputHatchRecipe])
    var missingCrafting = craftIds.filter(function (id) { return !rm.byKey(rl(id)).isPresent() })
    var missingItem = Item.exists('gtceu:ulv_input_hatch') ? [] : ['gtceu:ulv_input_hatch']
    check('crafting', missingCrafting.length === 0 && missingItem.length === 0, 'count=' + craftIds.length +
      (missingCrafting.length > 0 ? ' missing recipes=' + missingCrafting.join(',') : '') +
      (missingItem.length > 0 ? ' missing items=' + missingItem.join(',') : ''))

    check('parallels', SF.parallels === 8, 'global.grindless.steamSmallFamily.parallels=' + SF.parallels)
  }

  // ---------------------------------------------------------------- structures (shared with the other steam tests)

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

  // a "casing OR parts" cell: optional parts (min only, no exact) place their MINIMUM (0 is valid - e.g. the mixer's
  // fluid hatches - so the cheapest valid structure is built, same as a player who only needs the dust-alloy recipes)
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
    m.inHatch = null
    m.outHatch = null
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.steam_input_bus) m.inBus = p
      else if (pid === PART_BLOCKS.steam) m.hatch = p
      else if (pid === PART_BLOCKS.steam_output_bus) m.outs.push(p)
      else if (pid === PART_BLOCKS.input_hatch) m.inHatch = p
      else if (pid === PART_BLOCKS.output_hatch) m.outHatch = p
    })
    if (m.inBus === null || m.hatch === null || m.outs.length === 0) {
      throw new Error('missing parts: input bus=' + (m.inBus !== null) + ' steam hatch=' + (m.hatch !== null) + ' output buses=' + m.outs.length)
    }
    if (m.spec.needsInputHatch && m.inHatch === null) {
      throw new Error('missing fluid input hatch (mandatory for ' + m.key + ')')
    }
  }

  function fillInputs(m) {
    var inv = m.inBus.getInventory()
    clearInventory(inv)
    m.outs.forEach(function (b) { clearInventory(b.getInventory()) })
    m.spec.inputs.forEach(function (input, slot) {
      var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
    })
    if (m.spec.fluidInput) {
      if (!m.inHatch) throw new Error('fluid input hatch missing for ' + m.key)
      m.inHatch.tank.setFluidInTank(0, Fluid.of(m.spec.fluidInput.id, m.spec.fluidInput.n).getFluidStack())
    }
    var steam = fillSteam(m.hatch)
    m.steamStart = steamIn(m)
    note(m.key + '.INPUT', 'bus=[' + itemSummary(readBus(m.inBus)) + ']' +
      (m.spec.fluidInput ? ' fluidHatch=' + JSON.stringify(readTanks([m.inHatch])) : '') +
      ' steam=' + m.steamStart + ' mB (' + steam.report + ')')
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

  function collectProcess(m, ctrl) {
    var counts = {}
    m.outs.forEach(function (b) {
      var c = readBus(b)
      Object.keys(c).forEach(function (id) { counts[id] = (counts[id] || 0) + c[id] })
    })
    var left = readBus(m.inBus)
    var used = m.steamStart - steamIn(m)
    var verdict = m.spec.verify(counts, left)
    check(m.key + '.PROCESS', verdict.ok, verdict.detail + ' | items=[' + itemSummary(counts) + '] left in bus=[' + itemSummary(left) +
      '] steamUsed=' + used + ' mB ' + recipeState(ctrl))
    var runs = m.spec.runs(counts)
    check(m.key + '.PARALLEL', runs === 8, 'runs=' + runs + ' at once (8 expected)')
  }

  // The static check, shared by all six: a real recipe of the machine's own GTM recipe type, picked live from the
  // recipe manager (no numbers of ours hardcoded), resolves through the formed controller's own lookup.
  function lookupCheck(m, ctrl) {
    try {
      ctrl.setWorkingEnabled(false)
      var inv = m.inBus.getInventory()
      clearInventory(inv)
      m.outs.forEach(function (b) { clearInventory(b.getInventory()) })
      if (m.inHatch) m.inHatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
      if (m.outHatch) m.outHatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)

      var pick = pickRecipe(m.spec.gtmType, EU_CAP, !!m.spec.noFluidPick)
      if (!pick) {
        check(m.key + '.LOOKUP', false, 'no LV-tier-or-below recipe of ' + m.spec.gtmType + ' could be read from the live recipe manager')
        return
      }
      var slot = 0
      pick.iiS.forEach(function (st) { inv.insertItem(slot, st, false); slot++ })
      if (pick.fiS.length > 0) {
        if (!m.inHatch) throw new Error('the picked recipe needs a fluid but this machine has no fluid input hatch')
        m.inHatch.tank.setFluidInTank(0, pick.fiS[0])
      }
      var found = ctrl.getRecipeType().db().find(ctrl)
      var foundId = found ? String(found.id) : 'none'
      var wantId = String(pick.recipe.id)
      check(m.key + '.LOOKUP', foundId === wantId, 'type=' + m.spec.gtmType + ' picked=' + wantId + ' items=[' +
        pick.iiS.map(function (st) { return st.getId() + ' x' + st.getCount() }).join(', ') + ']' +
        (pick.fiS.length > 0 ? ' fluid=' + fluidName(pick.fiS[0]) + ' x' + pick.fiS[0].getAmount() + ' mB' : '') +
        ' found=' + foundId)
    } catch (e) {
      check(m.key + '.LOOKUP', false, 'exception: ' + e)
    }
  }

  // ---------------------------------------------------------------- machines

  var SPECS = [
    {
      key: 'steam_compressor', id: 'gtceu:steam_compressor', gtmType: 'gtceu:compressor', mode: 'process',
      x: 5125, y: 100, z: 3, runTicks: 500,
      previewParts: ['gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus'],
      inputs: [{ id: 'minecraft:sand', n: 32 }],
      runs: function (counts) { return counts['minecraft:sandstone'] || 0 },
      verify: function (counts, left) {
        var sandstone = counts['minecraft:sandstone'] || 0
        var unexpected = Object.keys(counts).filter(function (id) { return id !== 'minecraft:sandstone' })
        return {
          ok: sandstone === 8 && unexpected.length === 0 && Object.keys(left).length === 0,
          detail: 'sand x32 (GTM compressor/sandstone, 8 parallels x4 sand): sandstone=' + sandstone + ' (8)' +
            (unexpected.length > 0 ? ' unexpected=' + unexpected.join(',') : '')
        }
      }
    },
    {
      key: 'steam_forge_hammer', id: 'gtceu:steam_forge_hammer', gtmType: 'gtceu:forge_hammer', mode: 'static',
      x: 5135, y: 100, z: 3,
      previewParts: ['gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus']
    },
    {
      key: 'steam_alloy_smelter', id: 'gtceu:steam_alloy_smelter', gtmType: 'gtceu:alloy_smelter', mode: 'static',
      x: 5145, y: 100, z: 3,
      previewParts: ['gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus']
    },
    {
      key: 'steam_mixer', id: 'gtceu:steam_mixer', gtmType: 'gtceu:mixer', mode: 'static', noFluidPick: true,
      x: 5155, y: 100, z: 3,
      previewParts: ['gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus']
    },
    {
      key: 'steam_chemical_bath', id: 'gtceu:steam_chemical_bath', gtmType: 'gtceu:chemical_bath', mode: 'process', needsInputHatch: true,
      x: 5165, y: 100, z: 3, runTicks: 220,
      previewParts: ['gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus', 'gtceu:ulv_input_hatch'],
      inputs: [{ id: 'minecraft:sugar_cane', n: 8 }],
      fluidInput: { id: 'minecraft:water', n: 800 },
      runs: function (counts) { return counts['minecraft:paper'] || 0 },
      verify: function (counts, left) {
        var paper = counts['minecraft:paper'] || 0
        var unexpected = Object.keys(counts).filter(function (id) { return id !== 'minecraft:paper' })
        return {
          ok: paper === 8 && unexpected.length === 0 && Object.keys(left).length === 0,
          detail: 'sugar cane x8 + water 800 mB (GTM chemical_bath/paper_from_sugar_cane, 8 parallels x1 cane +100 mB): paper=' + paper + ' (8)' +
            (unexpected.length > 0 ? ' unexpected=' + unexpected.join(',') : '')
        }
      }
    },
    {
      key: 'steam_ore_washer', id: 'gtceu:steam_ore_washer', gtmType: 'gtceu:ore_washer', mode: 'static', needsInputHatch: true,
      x: 5175, y: 100, z: 3,
      previewParts: ['gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus', 'gtceu:ulv_input_hatch']
    }
  ]

  function prepareWorld() {
    for (var cx = X0 >> 4; cx <= X1 >> 4; cx++) S.level.getChunk(cx, 0)
    S.server.runCommandSilent('forceload add ' + X0 + ' 0 ' + X1 + ' 15')
    var cleared = S.server.runCommandSilent('fill ' + X0 + ' 98 0 ' + X1 + ' 112 15 air')
    note('AREA', 'chunks ' + (X0 >> 4) + '..' + (X1 >> 4) + ',0 generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function startMachine(spec) {
    var m = { key: spec.key, spec: spec, phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false, noted: false }
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
        try {
          findParts(m, ctrl)
        } catch (eParts) {
          check(m.key + '.FORMED', false, 'formed but parts are wrong: ' + eParts)
          m.phase = 'done'
          return
        }
        if (m.spec.mode === 'process') {
          fillInputs(m)
          m.phase = 'running'
          m.tStart = S.t
        } else {
          lookupCheck(m, ctrl)
          m.phase = 'done'
        }
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
      if (!m.noted && running >= 40) {
        m.noted = true
        note(m.key + '.STATE', 'after ' + running + ' ticks: ' + recipeState(ctrl) + ' steam=' + steamIn(m))
      }
      if (running >= m.spec.runTicks) {
        collectProcess(m, ctrl)
        lookupCheck(m, ctrl)
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

  ServerEvents.customCommand('gg_test_steam_small_family', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_steam_small_family run is still in progress')
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
