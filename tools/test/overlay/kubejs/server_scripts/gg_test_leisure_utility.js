// priority: -3324
// Gregtech Grindless - test of the Leisure utility package (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): startup_scripts/grindless/mv/leisure_utility.js, lib/coils.js, server_scripts/grindless/mv/leisure_utility.js.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_leisure_utility;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|leisure_utility\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|leisure_utility|<check>|PASS|FAIL|NOTE|<detail>
//   registry, crafting, weather_recipes, hatch_recipe, wildcard   static: machines, recipe type, recipes, removed GTM recipes, the
//                                                               optional mod (item, recipe, its mixin targets load)
//   <m>.PLACED / FORMED                the structure lib/patterns.js recorded is placed block by block and forms by itself
//   smelter_cu.* / smelter_ni.*        the advanced multi smelter with cupronickel (1,800 K -> 4 parallels) and nichrome coils
//                                      (3,600 K -> 16): MERGED (one run takes several kinds of item, up to the limit, EU/t and
//                                      time after GTM's overclock) and PROCESS (the outputs of that run)
//   smelter_mix.DURATIONS              kanthal (2,700 K -> 8): 200-tick and 1,800-tick smelts never share a run
//   lava.NOLAVA / MERGED / PROCESS     the lava furnace waits without lava, then smelts 8 mixed items for 80 mB of lava, no energy
//   weather.<mode> / weather.gate      the weather controller: thunder, clear, rain, each changing the Overworld's weather when its
//                                      run ends; a second clear run waits while the clear sky still has more than half its time
//   DONE                               last line
//
// Band (AGENTS.md / PACKAGES.md A5): X 6656-6719, Z 0-15, Y 98-112 of the Overworld; chunks are force-loaded and the band is
// cleared first. var + function everywhere (Rhino).
(function () {
  var TAG = 'GGTEST|leisure_utility|'
  var STEP = 10
  var FORM_TIMEOUT = 300
  var RUN_TIMEOUT = 600
  var X0 = 6656
  var X1 = 6719
  var Y0 = 100
  var Z0 = 3

  var PART_BLOCKS = {
    energy_input: 'gtceu:mv_energy_input_hatch',
    input_bus: 'gtceu:mv_input_bus',
    output_bus: 'gtceu:mv_output_bus',
    input_hatch: 'gtceu:mv_input_hatch'
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
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        AL: Java.loadClass('java.util.ArrayList')
      }
    }
    return LC
  }

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 900)
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
  function machineAt(p) { return lazy().MetaMachine.getMachine(S.level, new BlockPos(p.x, p.y, p.z)) }
  function blockIdAt(x, y, z) { return String(S.level.getBlock(x, y, z).getId()) }
  function summary(counts) {
    return Object.keys(counts).sort().map(function (id) { return id + ' x' + counts[id] }).join(', ')
  }
  function total(counts) {
    var n = 0
    Object.keys(counts).forEach(function (id) { n += counts[id] })
    return n
  }
  function hasRecipe(id) { return S.server.getRecipeManager().byKey(rl(id)).isPresent() }
  function recipeOf(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var U = global.grindless.leisureUtility
    if (!U || !U.machines) {
      check('registry', false, 'global.grindless.leisureUtility was not published by the startup script')
      return
    }
    var machines = [U.machines.smelter, U.machines.furnace, U.machines.weather]
    var missing = machines.filter(function (id) { return !GTRegistries.MACHINES.get(rl(id)) })
    var type = GTRegistries.RECIPE_TYPES.get(rl(U.weatherType))
    var described = machines.filter(function (id) { return !global.grindless.patterns.describe(id) })
    check('registry', missing.length === 0 && !!type && described.length === 0 && !!global.grindless.coils,
      'machines=' + machines.join(',') + ' type=' + U.weatherType + (type ? '' : ' (missing)') +
      (missing.length > 0 ? ' missing=' + missing.join(',') : '') + (described.length > 0 ? ' undescribed=' + described.join(',') : '') +
      ' smelter limits 1800K=' + U.smelterLimitAt(1800) + ' 2700K=' + U.smelterLimitAt(2700) + ' 3600K=' + U.smelterLimitAt(3600) +
      ' 5400K=' + U.smelterLimitAt(5400) + ' 10800K=' + U.smelterLimitAt(10800))
    check('smelter_limits', U.smelterLimitAt(1800) === 4 && U.smelterLimitAt(2700) === 8 && U.smelterLimitAt(3600) === 16 &&
      U.smelterLimitAt(4500) === 32 && U.smelterLimitAt(5400) === 64 && U.smelterLimitAt(10800) === 64,
      'GTL doubling per 900 K, capped at 64')

    var crafting = U.craftingRecipes ? [U.craftingRecipes.smelter, U.craftingRecipes.furnace, U.craftingRecipes.weather] : []
    var noCraft = crafting.filter(function (id) { return !hasRecipe(id) })
    check('crafting', crafting.length === 3 && noCraft.length === 0, 'recipes=' + crafting.join(',') + (noCraft.length > 0 ? ' missing=' + noCraft.join(',') : ''))

    var W = U.weather
    var problems = []
    var details = []
    W.modes.forEach(function (m) {
      var id = U.weatherRecipes ? U.weatherRecipes[m.mode] : null
      var r = id ? recipeOf(id) : null
      if (!r) {
        problems.push(m.mode + ' missing (' + id + ')')
        return
      }
      var mode = String(r.data.getString(W.key))
      var ticks = Number(r.data.getInt(W.ticksKey))
      var conds = asArray(r.conditions).map(function (c) { return String(c.getType ? c.getType() : c) })
      var items = asArray(r.getInputContents(lazy().ItemCap)).length
      details.push(id + ' mode=' + mode + ' ticks=' + ticks + ' items=' + items + ' eut=' + Number(r.getInputEUt().getTotalEU()) + ' t=' + r.duration +
        ' conditions=' + conds.length)
      if (mode !== m.mode || ticks !== m.ticks) problems.push(m.mode + ' data ' + mode + '/' + ticks)
      if (conds.length !== 1) problems.push(m.mode + ' has ' + conds.length + ' conditions (wanted the dimension one)')
    })
    check('weather_recipes', problems.length === 0, details.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join(', ') : ''))

    // the UV crafting must be gone; the recycling ids come back after the recipe event (GTM rebuilds them, see the server script)
    var removedLeft = (U.hatchRemoved || []).filter(function (id) { return (U.hatchRecycling || []).indexOf(id) < 0 && hasRecipe(id) })
    var hatch = U.hatchRecipe ? recipeOf(U.hatchRecipe) : null
    var hatchDetail = hatch ? ('eut=' + Number(hatch.getInputEUt().getTotalEU()) + ' t=' + hatch.duration + ' inputs=' +
      asArray(hatch.getInputContents(lazy().ItemCap)).length) : 'missing'
    // GTM rebuilds the hatch's recycling after the recipe event from its material info: it must hold none of the UV materials
    var UV = /americium|tritanium|naquadah|darmstadtium|neutronium|yttrium_barium|osmiridium|ruridit|europium|samarium/
    var recycling = []
    var uvLeft = []
    ;(U.hatchRecycling || []).forEach(function (id) {
      var r = recipeOf(id)
      if (!r) {
        recycling.push(id + '=none')
        return
      }
      var outs = asArray(r.getOutputContents(lazy().ItemCap)).map(function (ct) {
        try {
          var json = JSON.parse(String(ct.content.toJson()))
          var node = json.ingredient || json
          return (node.item || ('#' + node.tag)) + ' x' + (json.count || 1)
        } catch (e) {
          return 'unreadable'
        }
      })
      recycling.push(id + '=[' + outs.join(', ') + ']')
      outs.forEach(function (o) { if (UV.test(o)) uvLeft.push(id + ': ' + o) })
    })
    check('hatch_recipe', !!hatch && removedLeft.length === 0 && uvLeft.length === 0,
      U.hatchRecipe + ' ' + hatchDetail + ' | removed GTM recipes still present=[' + removedLeft.join(',') + '] | recycling ' + recycling.join(' ; ') +
      (uvLeft.length > 0 ? ' | UV materials still recycled: ' + uvLeft.join(', ') : ''))

    wildcardChecks(U)
  }

  // the optional mod: loaded, its item has our recipe, and the classes its mixins patch load without a mixin error
  function wildcardChecks(U) {
    var loaded = Platform.isLoaded('wildcard_pattern')
    if (!loaded) {
      note('wildcard', 'wildcard_pattern is not installed (optional)')
      return
    }
    var targets = [
      'appeng.helpers.patternprovider.PatternProviderLogic',
      'appeng.api.crafting.PatternDetailsHelper',
      'com.gregtechceu.gtceu.integration.ae2.machine.MEPatternBufferPartMachine',
      'com.gregtechceu.gtceu.api.data.chemical.material.info.MaterialFlags',
      'com.gregtechceu.gtceu.api.data.chemical.material.properties.MaterialProperties'
    ]
    var failed = []
    targets.forEach(function (cls) {
      try {
        Java.loadClass(cls)
      } catch (e) {
        failed.push(cls + ': ' + e)
      }
    })
    var item = Item.exists('wildcard_pattern:wildcard_pattern')
    var recipe = hasRecipe(U.wildcardRecipe)
    check('wildcard', item && recipe && failed.length === 0, 'item=' + item + ' recipe ' + U.wildcardRecipe + '=' + recipe +
      ' mixin targets loaded=' + (targets.length - failed.length) + '/' + targets.length + (failed.length > 0 ? ' failed: ' + failed.join(' ; ') : ''))
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

  // swap: { <block id>: <block id> } replaces a placed block (the second smelter gets nichrome coils)
  function planOf(machineId, cx, cy, cz, swap) {
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
    if (swap) {
      cells.forEach(function (c) {
        if (c.block && swap[c.block.id]) c.block = { id: swap[c.block.id] }
      })
    }
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
    return { id: machineId, cells: placed, air: air, size: desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length, blocks: placed.length }
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
    var parts = plan.cells.filter(function (c) { return c.block.ability }).map(function (c) { return c.block.ability + c.props })
    check(m.key + '.PLACED', failed.length === 0 && wrong.length === 0,
      'blocks=' + plan.blocks + ' air=' + plan.air.length + ' size=' + plan.size + ' controller=' + plan.ctrl.x + ',' + plan.ctrl.y + ',' + plan.ctrl.z +
      ' parts=[' + parts.join(' ') + ']' + (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function describeError(ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      return err === null || err === undefined ? 'no pattern error recorded' : 'pattern error ' + String(err)
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  function partIds(ctrl) {
    return asArray(ctrl.getParts()).map(function (p) { return String(p.getDefinition().getId()).replace('gtceu:', '') })
  }

  // ---------------------------------------------------------------- parts and contents

  function findParts(ctrl) {
    var P = { energy: [], inBus: null, outBuses: [], inHatch: null }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.energy_input) P.energy.push(p)
      else if (pid === PART_BLOCKS.input_bus) P.inBus = p
      else if (pid === PART_BLOCKS.output_bus) P.outBuses.push(p)
      else if (pid === PART_BLOCKS.input_hatch) P.inHatch = p
    })
    return P
  }

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

  function outputs(P) {
    var counts = {}
    P.outBuses.forEach(function (b) {
      var c = readHandler(b.getInventory())
      Object.keys(c).forEach(function (id) { counts[id] = (counts[id] || 0) + c[id] })
    })
    return counts
  }

  function topUpEnergy(P) {
    P.energy.forEach(function (p) {
      var c = p.energyContainer
      c.setEnergyStored(c.getEnergyCapacity())
    })
  }

  function insertItems(P, items) {
    var inv = P.inBus.getInventory()
    items.forEach(function (it, slot) {
      var left = inv.insertItem(slot, Item.of(it[0], it[1]), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + it[0] + ' x' + it[1] + ' into slot ' + slot)
    })
  }

  function setCircuit(P, n) {
    P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(n))
  }

  function lavaIn(P) {
    var st = P.inHatch.tank.getFluidInTank(0)
    return st.isEmpty() ? 0 : Number(st.getAmount())
  }

  function recipeState(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      var fails = asArray(rlg.getFailureReasons()).map(function (c) { return String(c.getString()) })
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() + ' lastRecipe=' + (last ? last.id : 'none') +
        (fails.length > 0 ? ' failureReasons=[' + fails.join(' ; ') + ']' : '')
    } catch (e) {
      return 'recipe state unreadable: ' + e
    }
  }

  // what the running (merged) recipe holds: items in per id, parallels, EU/t, ticks, lava in
  function recipeInfo(r) {
    var ins = {}
    asArray(r.getInputContents(lazy().ItemCap)).forEach(function (ct) {
      var id = 'unknown'
      try {
        var json = JSON.parse(String(ct.content.toJson()))
        var node = json.ingredient || json
        if (node.type === 'gtceu:circuit') id = 'circuit ' + node.configuration
        else id = node.item || ('#' + node.tag)
        var n = Number(json.count || 1)
        ins[id] = (ins[id] || 0) + n
      } catch (e) {
        ins[id] = (ins[id] || 0) + 1
      }
    })
    var lava = 0
    asArray(r.getInputContents(lazy().FluidCap)).forEach(function (ct) {
      try { lava += Number(ct.content.getAmount()) } catch (e) { /* not a sized fluid */ }
    })
    var eut = 0
    try { eut = Number(r.getInputEUt().getTotalEU()) } catch (e2) { eut = -1 }
    return { ins: ins, kinds: Object.keys(ins).length, parallels: Number(r.parallels), eut: eut, duration: Number(r.duration), lava: lava }
  }

  // ---------------------------------------------------------------- machines

  var SMELT_RESULTS = {
    'minecraft:cobblestone': 'minecraft:stone', 'minecraft:clay_ball': 'minecraft:brick', 'minecraft:kelp': 'minecraft:dried_kelp',
    'minecraft:potato': 'minecraft:baked_potato', 'minecraft:beef': 'minecraft:cooked_beef', 'minecraft:cactus': 'minecraft:green_dye',
    'minecraft:raw_iron': 'minecraft:iron_ingot'
  }

  var SPECS = [
    {
      key: 'smelter_cu', id: 'gtceu:advanced_multi_smelter', kind: 'smelter', x: 6662, kelvin: 1800,
      items: [['minecraft:cobblestone', 2], ['minecraft:clay_ball', 2], ['minecraft:kelp', 2]],
      // 4 x 4 EU/t = 16 EU/t (LV) -> one overclock on an MV hatch: 64 EU/t, 200 -> 100 ticks
      expect: { parallels: 4, minKinds: 2, eut: 64, duration: 100 }
    },
    {
      key: 'smelter_ni', id: 'gtceu:advanced_multi_smelter', kind: 'smelter', x: 6672, kelvin: 3600,
      swap: { 'gtceu:cupronickel_coil_block': 'gtceu:nichrome_coil_block' },
      items: [['minecraft:cobblestone', 3], ['minecraft:clay_ball', 3], ['minecraft:kelp', 3], ['minecraft:potato', 3],
        ['minecraft:beef', 3], ['minecraft:cactus', 3]],
      // 16 x 4 EU/t = 64 EU/t (MV): no overclock on an MV hatch
      expect: { parallels: 16, minKinds: 5, eut: 64, duration: 200 }
    },
    {
      // two cooking times never share a run: 3 cobblestone (200 ticks) and 2 raw iron blocks (quark, 1,800 ticks) go in two runs,
      // whichever the lookup picks first (kanthal, 2,700 K: 8 parallels, room for all five)
      key: 'smelter_mix', id: 'gtceu:advanced_multi_smelter', kind: 'smelter', mix: true, x: 6702, kelvin: 2700,
      swap: { 'gtceu:cupronickel_coil_block': 'gtceu:kanthal_coil_block' },
      items: [['minecraft:cobblestone', 3], ['minecraft:raw_iron_block', 2]],
      // 3 x 4 = 12 EU/t (LV) or 2 x 4 = 8 EU/t (ULV): one overclock on an MV hatch either way
      classes: {
        'minecraft:cobblestone': { n: 3, out: 'minecraft:stone', eut: 48, duration: 100 },
        'minecraft:raw_iron_block': { n: 2, out: 'minecraft:iron_block', eut: 32, duration: 900 }
      }
    },
    {
      key: 'lava', id: 'gtceu:lava_furnace', kind: 'lava', x: 6682,
      items: [['minecraft:raw_iron', 5], ['minecraft:potato', 5]],
      lava: 1000,
      expect: { parallels: 8, minKinds: 2, lava: 80, duration: 200 }
    },
    { key: 'weather', id: 'gtceu:weather_controller', kind: 'weather', x: 6692 }
  ]

  // the weather sequence: each step sets the circuit and the reagents, then checks the Overworld's weather after the run
  var WEATHER_STEPS = [
    { name: 'thunder', circuit: 3, items: [['gtceu:salt_dust', 2], ['gtceu:fine_copper_wire', 4]] },
    { name: 'clear', circuit: 1, items: [['gtceu:calcium_chloride_dust', 4]] },
    { name: 'gate', circuit: 1, items: [['gtceu:calcium_chloride_dust', 4]], gate: true },
    { name: 'rain', circuit: 2, items: [['gtceu:salt_dust', 2]] }
  ]

  function weatherState() {
    var d = S.level.getLevelData()
    return {
      raining: !!d.isRaining(), thundering: !!d.isThundering(), clear: Number(d.getClearWeatherTime()),
      rain: Number(d.getRainTime()), thunder: Number(d.getThunderTime())
    }
  }
  function weatherText(w) {
    return 'raining=' + w.raining + ' thundering=' + w.thundering + ' clearTime=' + w.clear + ' rainTime=' + w.rain + ' thunderTime=' + w.thunder
  }

  function prepareWorld() {
    for (var cx = X0 >> 4; cx <= X1 >> 4; cx++) S.level.getChunk(cx, 0)
    S.server.runCommandSilent('forceload add ' + X0 + ' 0 ' + X1 + ' 15')
    var cleared = S.server.runCommandSilent('fill ' + X0 + ' 98 0 ' + X1 + ' 112 15 air')
    note('AREA', 'chunks ' + (X0 >> 4) + '..' + (X1 >> 4) + ',0 force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function startMachine(spec) {
    var m = { key: spec.key, spec: spec, phase: 'forming', t0: S.t, plan: null, ctrl: null, P: null }
    S.machines.push(m)
    try {
      if (!GTRegistries.MACHINES.get(rl(spec.id))) {
        check(m.key + '.FORMED', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      m.plan = planOf(spec.id, spec.x, Y0, Z0, spec.swap)
      if (!place(m)) {
        m.phase = 'done'
        return
      }
      m.ctrl = m.plan.ctrl
      m.t0 = S.t
    } catch (e) {
      check(m.key + '.PLACED', false, 'exception while placing: ' + e)
      m.phase = 'done'
    }
  }

  function begin(m, ctrl) {
    m.P = findParts(ctrl)
    var P = m.P
    if (P.inBus === null || (m.spec.kind !== 'weather' && P.outBuses.length === 0)) throw new Error('missing buses: parts=' + partIds(ctrl).join(' '))
    clearInventory(P.inBus.getInventory())
    P.outBuses.forEach(function (b) { clearInventory(b.getInventory()) })
    topUpEnergy(P)
    if (m.spec.kind === 'smelter') {
      var temp = global.grindless.coils.temperature(ctrl)
      check(m.key + '.COILS', temp === m.spec.kelvin, 'coil temperature ' + temp + ' K (wanted ' + m.spec.kelvin + '), coil=' + String(ctrl.getCoilType().getName()))
      insertItems(P, m.spec.items)
      m.phase = 'running'
    } else if (m.spec.kind === 'lava') {
      if (P.inHatch === null) throw new Error('no lava hatch: parts=' + partIds(ctrl).join(' '))
      check(m.key + '.NO_ENERGY', P.energy.length === 0, 'energy hatches=' + P.energy.length)
      insertItems(P, m.spec.items)
      m.phase = 'nolava'
    } else {
      S.server.runCommandSilent('weather clear 600')
      m.stepIndex = 0
      m.phase = 'weather_setup'
    }
    m.tPhase = S.t
    ctrl.getRecipeLogic().updateTickSubscription()
  }

  // a run is under way: note what the merged recipe holds, then skip the waiting (the outputs are the real ones)
  function watchRun(m, ctrl) {
    var logic = ctrl.getRecipeLogic()
    var working = String(logic.getStatus()) === 'WORKING'
    if (working && !m.info) {
      var last = logic.getLastRecipe()
      if (last) {
        m.info = recipeInfo(last)
        m.infoText = 'parallels=' + m.info.parallels + ' kinds=' + m.info.kinds + ' items in=[' + summary(m.info.ins) + '] eut=' + m.info.eut +
          ' ticks=' + m.info.duration + (m.info.lava > 0 ? ' lava=' + m.info.lava + ' mB' : '')
      }
    }
    if (working && m.info && !m.ff && logic.getProgress() >= 1 && logic.getDuration() > 3) {
      logic.setProgress(logic.getDuration() - 1)
      m.ff = true
      m.ffAt = S.t
    }
    return working
  }

  // the first run's outputs are checked one step after the fast-forward: a second run (the leftovers) may already have taken its
  // inputs from the bus but cannot have produced anything yet, so what is "in flight" is counted with what is left
  function finishSmelt(m, ctrl) {
    var e = m.spec.expect
    var i = m.info
    var problems = []
    if (!i) problems.push('the run was never seen')
    else {
      if (i.parallels !== e.parallels) problems.push('parallels ' + i.parallels + ' (wanted ' + e.parallels + ')')
      if (i.kinds < e.minKinds) problems.push('kinds ' + i.kinds + ' (wanted ' + e.minKinds + ' or more)')
      if (total(i.ins) !== e.parallels) problems.push('items in ' + total(i.ins) + ' (wanted ' + e.parallels + ')')
      if (e.eut !== undefined && i.eut !== e.eut) problems.push('EU/t ' + i.eut + ' (wanted ' + e.eut + ')')
      if (e.lava !== undefined && (i.lava !== e.lava || i.eut > 0)) problems.push('lava ' + i.lava + ' mB, EU/t ' + i.eut + ' (wanted ' + e.lava + ' mB, no EU)')
      if (i.duration !== e.duration) problems.push('ticks ' + i.duration + ' (wanted ' + e.duration + ')')
    }
    check(m.key + '.MERGED', problems.length === 0, (m.infoText || 'no run seen') + (problems.length > 0 ? ' | problems: ' + problems.join(', ') : ''))

    var logic = ctrl.getRecipeLogic()
    var flight = { items: 0, lava: 0, text: 'none' }
    if (String(logic.getStatus()) === 'WORKING' && logic.getLastRecipe()) {
      var next = recipeInfo(logic.getLastRecipe())
      flight = { items: total(next.ins), lava: next.lava, text: 'items=[' + summary(next.ins) + ']' + (next.lava > 0 ? ' lava=' + next.lava : '') }
    }
    var out = outputs(m.P)
    var left = readHandler(m.P.inBus.getInventory())
    var wantOut = {}
    if (i) Object.keys(i.ins).forEach(function (id) { if (SMELT_RESULTS[id]) wantOut[SMELT_RESULTS[id]] = i.ins[id] })
    var outProblems = []
    if (total(out) !== e.parallels) outProblems.push('outputs ' + total(out) + ' (wanted ' + e.parallels + ')')
    Object.keys(wantOut).forEach(function (id) { if ((out[id] || 0) !== wantOut[id]) outProblems.push(id + ' ' + (out[id] || 0) + ' (wanted ' + wantOut[id] + ')') })
    var fed = 0
    m.spec.items.forEach(function (it) { fed += it[1] })
    if (total(left) + flight.items !== fed - e.parallels) {
      outProblems.push('left in bus ' + total(left) + ' + in the next run ' + flight.items + ' (wanted ' + (fed - e.parallels) + ')')
    }
    var lavaNote = ''
    if (m.spec.kind === 'lava') {
      var lavaLeft = lavaIn(m.P)
      lavaNote = ' lava left=' + lavaLeft + ' mB'
      if (lavaLeft + flight.lava !== m.spec.lava - e.lava) {
        outProblems.push('lava left ' + lavaLeft + ' + in the next run ' + flight.lava + ' (wanted ' + (m.spec.lava - e.lava) + ')')
      }
    }
    check(m.key + '.PROCESS', outProblems.length === 0, 'out=[' + summary(out) + '] left=[' + summary(left) + ']' + lavaNote + ' next run=' + flight.text +
      (outProblems.length > 0 ? ' | problems: ' + outProblems.join(', ') : '') + ' ' + recipeState(ctrl))
    m.phase = 'done'
  }

  // the first run holds one cooking time only, with that class's own EU/t and time; the next run (already under way) the other one
  function finishMix(m, ctrl) {
    var classes = m.spec.classes
    var i = m.info
    var problems = []
    var first = i ? Object.keys(i.ins) : []
    var cls = first.length === 1 ? classes[first[0]] : null
    if (!i) problems.push('the run was never seen')
    else if (!cls) problems.push('the first run mixed ' + first.join(' + ') + ' (wanted one cooking time)')
    else {
      if (i.ins[first[0]] !== cls.n) problems.push(first[0] + ' x' + i.ins[first[0]] + ' (wanted ' + cls.n + ')')
      if (i.eut !== cls.eut || i.duration !== cls.duration) problems.push('EU/t ' + i.eut + ' ticks ' + i.duration + ' (wanted ' + cls.eut + ' / ' + cls.duration + ')')
    }
    var logic = ctrl.getRecipeLogic()
    var next = null
    if (String(logic.getStatus()) === 'WORKING' && logic.getLastRecipe()) next = recipeInfo(logic.getLastRecipe())
    var nextIds = next ? Object.keys(next.ins) : []
    var other = Object.keys(classes).filter(function (id) { return first.indexOf(id) < 0 })
    if (nextIds.length !== 1 || other.indexOf(nextIds[0]) < 0) problems.push('the next run holds [' + nextIds.join(', ') + '] (wanted ' + other.join(', ') + ' alone)')
    var out = outputs(m.P)
    if (cls && (out[cls.out] || 0) !== cls.n) problems.push(cls.out + ' x' + (out[cls.out] || 0) + ' (wanted ' + cls.n + ')')
    if (cls && total(out) !== cls.n) problems.push('outputs ' + total(out) + ' (wanted ' + cls.n + ')')
    check(m.key + '.DURATIONS', problems.length === 0, 'first run: ' + (m.infoText || 'none') + ' | out=[' + summary(out) + '] | next run: ' +
      (next ? 'items=[' + summary(next.ins) + '] eut=' + next.eut + ' ticks=' + next.duration : 'none') + (problems.length > 0 ? ' | problems: ' + problems.join(', ') : ''))
    m.phase = 'done'
  }

  function advanceSmelt(m, ctrl) {
    topUpEnergy(m.P)
    watchRun(m, ctrl)
    if (m.ff && S.t - m.ffAt >= STEP) {
      if (m.spec.mix) finishMix(m, ctrl)
      else finishSmelt(m, ctrl)
      return
    }
    if (S.t - m.tPhase > RUN_TIMEOUT) {
      check(m.key + '.MERGED', false, 'no finished run after ' + (S.t - m.tPhase) + ' ticks: ' + recipeState(ctrl) +
        ' bus=[' + summary(readHandler(m.P.inBus.getInventory())) + ']' + (m.P.inHatch ? ' lava=' + lavaIn(m.P) : ''))
      m.phase = 'done'
    }
  }

  function advanceNoLava(m, ctrl) {
    if (S.t - m.tPhase < 40) return
    var logic = ctrl.getRecipeLogic()
    var bus = readHandler(m.P.inBus.getInventory())
    check(m.key + '.NOLAVA', String(logic.getStatus()) !== 'WORKING' && total(bus) === 10,
      'without lava for ' + (S.t - m.tPhase) + ' ticks: ' + recipeState(ctrl) + ' bus=[' + summary(bus) + ']')
    m.P.inHatch.tank.setFluidInTank(0, Fluid.of('minecraft:lava', m.spec.lava).getFluidStack())
    check(m.key + '.LAVA_IN', lavaIn(m.P) === m.spec.lava, 'hatch holds ' + lavaIn(m.P) + ' mB')
    logic.updateTickSubscription()
    m.phase = 'running'
    m.tPhase = S.t
  }

  function advanceWeather(m, ctrl) {
    topUpEnergy(m.P)
    var logic = ctrl.getRecipeLogic()
    var step = WEATHER_STEPS[m.stepIndex]
    if (!step) {
      m.phase = 'done'
      return
    }
    var U = global.grindless.leisureUtility
    if (m.phase === 'weather_setup') {
      clearInventory(m.P.inBus.getInventory())
      setCircuit(m.P, step.circuit)
      insertItems(m.P, step.items)
      m.applied = U.stats.weatherCount
      m.ff = false
      m.info = null
      m.tPhase = S.t
      m.phase = 'weather_run'
      logic.updateTickSubscription()
      return
    }
    watchRun(m, ctrl)
    var waited = S.t - m.tPhase
    if (step.gate) {
      if (waited < 60) return
      var bus = readHandler(m.P.inBus.getInventory())
      var fails = asArray(logic.getFailureReasons()).map(function (c) { return String(c.getString()) }).join(' ; ')
      check('weather.gate', U.stats.weatherCount === m.applied && total(bus) === 4,
        'a second clear run with ' + weatherText(weatherState()) + ': ' + recipeState(ctrl) + ' bus=[' + summary(bus) + '] reasons=[' + fails + ']')
      m.stepIndex++
      m.phase = 'weather_setup'
      return
    }
    if (U.stats.weatherCount > m.applied) {
      var w = weatherState()
      var last = U.stats.weather[U.stats.weather.length - 1]
      var bus2 = readHandler(m.P.inBus.getInventory())
      var ok = false
      if (step.name === 'thunder') ok = w.raining && w.thundering && w.thunder > 5000 && w.thunder <= 6000
      else if (step.name === 'clear') ok = !w.raining && !w.thundering && w.clear > 23000 && w.clear <= 24000
      else if (step.name === 'rain') ok = w.raining && !w.thundering && w.rain > 11000 && w.rain <= 12000
      check('weather.' + step.name, ok && total(bus2) === 0 && last.mode === step.name,
        'hook applied ' + last.mode + ' for ' + last.ticks + ' ticks; Overworld now ' + weatherText(w) + ' reagents left=[' + summary(bus2) + '] run: ' + (m.infoText || 'not seen'))
      m.stepIndex++
      m.phase = 'weather_setup'
      return
    }
    if (waited > RUN_TIMEOUT) {
      check('weather.' + step.name, false, 'the weather never changed after ' + waited + ' ticks: ' + recipeState(ctrl) + ' ' + weatherText(weatherState()) +
        ' bus=[' + summary(readHandler(m.P.inBus.getInventory())) + ']')
      m.stepIndex++
      m.phase = 'weather_setup'
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
        check(m.key + '.FORMED', true, 'after ' + waited + ' ticks, parts=[' + partIds(ctrl).join(' ') + ']')
        begin(m, ctrl)
        return
      }
      if (waited >= FORM_TIMEOUT) {
        check(m.key + '.FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
        m.phase = 'done'
      }
      return
    }
    if (m.phase === 'running') advanceSmelt(m, ctrl)
    else if (m.phase === 'nolava') advanceNoLava(m, ctrl)
    else if (m.phase === 'weather_setup' || m.phase === 'weather_run') advanceWeather(m, ctrl)
  }

  function allDone() {
    for (var i = 0; i < S.machines.length; i++) if (S.machines[i].phase !== 'done') return false
    return true
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      var st = global.grindless.leisureUtility.stats
      note('stats', 'merges=' + st.merges + ' last=' + JSON.stringify(st.last) + ' weather=' + JSON.stringify(st.weather))
    } catch (e) { /* notes only */ }
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

  ServerEvents.customCommand('gg_test_leisure_utility', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_leisure_utility run is still in progress')
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
