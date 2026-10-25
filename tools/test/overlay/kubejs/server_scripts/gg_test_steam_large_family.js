// Gregtech Grindless - test of the Large Steam family (TEST-ONLY overlay: copied over the instance on the test PC,
// never shipped with the pack): startup_scripts/grindless/steam/large_family.js, server_scripts/grindless/steam/
// large_family.js.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_steam_large_family;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|steam_large_family\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|steam_large_family|<check>|PASS|FAIL|NOTE|<detail>
//   registry, recipe_types, crafting      registration: the 5 machines, their crafting recipes and the global.grindless.largeSteamFamily registry
//   recipe_type_voltage                   static, all 5: how many real recipes of each GTM type sit at or below LV
//                                          voltage (32 EU/t, the steam cap) vs the type's total - the brief's "check GTM's
//                                          rules" question, answered from the live recipe manager instead of just source reading
//   <m>.DESCRIPTION / PLACED / FORMED / PATTERN / PREVIEW   the structure lib/patterns.js recorded is placed block by
//                       block and forms by itself; the preview EMI shows has the controller and every part kind
//   macerator.PROCESS / PARALLEL     64 iron ore -> 128 crushed iron ore (+ nickel/stone dust chance byproducts),
//                       the real GTM macerate_iron_ore_to_crushed_ore recipe read from the live recipe manager
//                       (its own output, not hardcoded), run through the controller at 64 parallels
//   ore_washer.PROCESS / PARALLEL    64 crushed iron ore + 6400 mB distilled water -> 64 purified iron ore + 64
//                       stone dust (+ chance nickel dust), the real GTM wash_iron_crushed_ore_to_purified_ore_distilled
//                       recipe (no circuit needed), 64 parallels. ore_washer's item input (every material, not just
//                       iron) is a tag (forge:crushed_ores/<material>), and Rhino cannot read a live SizedIngredient's
//                       tag (see firstItemId) - so its concrete, known member (gtceu:crushed_iron_ore) is hardcoded in
//                       SPECS below instead, while every output stays read live from the recipe.
//   DONE                last line
//
// Band (AGENTS.md): X 5376-5439, Z 0-15, Y 98-112 of the Overworld; chunks are force-loaded and the band is cleared
// first. Everything is driven by the structure descriptions lib/patterns.js records (global.grindless.structures)
// and global.grindless.largeSteamFamily (published by the server script). var + function everywhere (Rhino).
(function () {
  var TAG = 'GGTEST|steam_large_family|'
  var STEAM_MB = 200000
  var STEP = 20
  var FORM_TIMEOUT = 300
  var PARALLELS = 64
  var X0 = 5376
  var X1 = 5439
  var Y0 = 102
  var Z0 = 3

  // one 'X' part ability -> one concrete block id, for placement only (the pattern itself accepts any tier of
  // input_hatch / output_hatch; ULV is just a cheap, always-present representative - see large_family.js and
  // steam/small_family.js, which already hand-crafts both ULV fluid hatch directions in the Steam Age).
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
  function machineAt(p) { return lazy().MetaMachine.getMachine(S.level, new BlockPos(p.x, p.y, p.z)) }
  function blockIdAt(x, y, z) { return String(S.level.getBlock(x, y, z).getId()) }
  function itemSummary(counts) {
    return Object.keys(counts).sort().map(function (id) { return id + ' x' + counts[id] }).join(', ')
  }

  // ---------------------------------------------------------------- recipe reading (GTM 7.5.3 GTRecipe contents)

  function recipeOf(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  function recipesFor(typeId) {
    var rt = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    if (!rt) return []
    return asArray(S.server.getRecipeManager().getAllRecipesFor(rt))
  }

  function eut(recipe) {
    try { return Number(recipe.getInputEUt().getTotalEU()) } catch (e) { return -1 }
  }

  // the first real GTM recipe of this type whose id contains every substring and whose EU/t is steam-legal
  function pickRecipe(typeId, substrings) {
    var list = recipesFor(typeId)
    for (var i = 0; i < list.length; i++) {
      var id = String(list[i].id)
      var ok = true
      for (var j = 0; j < substrings.length; j++) { if (id.indexOf(substrings[j]) < 0) { ok = false; break } }
      if (ok && eut(list[i]) >= 0 && eut(list[i]) <= 32) return list[i]
    }
    return null
  }

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

  function isGuaranteed(entry) {
    return entry.chance === null || entry.chance === undefined || Number(entry.chance) >= 10000
  }

  function contentsOf(recipe, cap, output) {
    var list = output ? recipe.getOutputContents(cap) : recipe.getInputContents(cap)
    return asArray(list).map(function (content) {
      return { raw: content.content, n: amountOf(content), chance: content.chance }
    })
  }

  // the item id a {type:"gtceu:sized", ingredient:{item:"..."}} / {item:"..."} / {tag:"..."} JSON node resolves to
  // (tags are not expected on the ore-chain recipes this test reads and are left unresolved on purpose)
  function extractItemId(x) {
    if (x === null || x === undefined || typeof x !== 'object') return null
    if (Array.isArray(x)) {
      for (var i = 0; i < x.length; i++) {
        var r = extractItemId(x[i])
        if (r) return r
      }
      return null
    }
    if (x.type === 'gtceu:sized' || x.type === 'gtceu:int_provider') return extractItemId(x.ingredient)
    if (typeof x.item === 'string') return x.item
    if (Array.isArray(x.children)) return extractItemId(x.children)
    if (x.base) return extractItemId(x.base)
    return null
  }

  // a concrete item id this (item) ingredient accepts - for reading outputs back, never for guessing inputs
  // (ore_washer's item input is a material tag, e.g. forge:crushed_ores/iron, which extractItemId does not
  // resolve on purpose - see SPECS' inputItemId instead).
  // Ingredient#getItems() fails under Rhino on this GTM build ("Cannot find function getItems" on a live
  // SizedIngredient, even though the Java method exists and GTM's own code calls it fine) - toJson() is a
  // different, non-array-returning method on the same object and parses cleanly instead.
  function firstItemId(entry) {
    var viaJson = null
    try {
      viaJson = extractItemId(JSON.parse(String(entry.raw.toJson())))
    } catch (e1) { /* fall through */ }
    if (viaJson) return viaJson
    try {
      var stacks = asArray(entry.raw.getItems())
      if (stacks.length > 0) return String(stacks[0].getId())
    } catch (e2) { /* fall through */ }
    try {
      var stacks2 = asArray(entry.raw["getItems()"]())
      if (stacks2.length > 0) return String(stacks2[0].getId())
    } catch (e3) { /* fall through */ }
    throw new Error('ingredient has no concrete item id (toJson=' + viaJson + ')')
  }

  // ---------------------------------------------------------------- static checks

  function registryChecks() {
    var family = global.grindless.largeSteamFamily
    var ids = ['large_steam_macerator', 'large_steam_centrifuge', 'large_steam_thermal_centrifuge',
      'large_steam_chemical_bath', 'large_steam_ore_washer']
    if (!family) {
      check('registry', false, 'global.grindless.largeSteamFamily was not published by the server script')
      return
    }
    var missingFamily = ids.filter(function (id) { return !family[id] })
    var machines = ids.map(function (id) { return 'gtceu:' + id })
    var missingMachines = machines.filter(function (id) { return !GTRegistries.MACHINES.get(rl(id)) })
    var cores = ['gtceu:solid_machine_casing', 'gtceu:steam_grinder', 'gtceu:primitive_pump',
      'gtceu:bronze_normal_fluid_pipe', 'gtceu:bronze_frame', 'gtceu:steel_frame']
    var missingItems = cores.filter(function (id) { return !Item.exists(id) })
    check('registry', missingFamily.length === 0 && missingMachines.length === 0 && missingItems.length === 0,
      'machines=' + machines.length +
      (missingFamily.length > 0 ? ' missing in largeSteamFamily=' + missingFamily.join(',') : '') +
      (missingMachines.length > 0 ? ' missing machines=' + missingMachines.join(',') : '') +
      (missingItems.length > 0 ? ' missing items=' + missingItems.join(',') : ''))

    var rm = S.server.getRecipeManager()
    var craftIds = ids.map(function (id) { return family[id] ? family[id].recipe : null }).filter(function (x) { return x })
    var noCraft = craftIds.filter(function (id) { return !rm.byKey(rl(id)).isPresent() })
    check('crafting', craftIds.length === ids.length && noCraft.length === 0,
      'count=' + craftIds.length + '/' + ids.length + (noCraft.length > 0 ? ' missing=' + noCraft.join(',') : ''))
  }

  // the brief's question: does GTM's steam voltage cap (recipes above LV / 32 EU/t are rejected outright) block a
  // recipe type entirely, or just the high-voltage recipes within it? Answered from the live recipe manager.
  function recipeTypeVoltageChecks() {
    var TYPES = ['gtceu:macerator', 'gtceu:centrifuge', 'gtceu:thermal_centrifuge', 'gtceu:chemical_bath', 'gtceu:ore_washer']
    var details = []
    var allHaveLegal = true
    TYPES.forEach(function (typeId) {
      var all = recipesFor(typeId)
      var legal = all.filter(function (r) { var e = eut(r); return e >= 0 && e <= 32 })
      if (all.length === 0 || legal.length === 0) allHaveLegal = false
      details.push(typeId + ': ' + legal.length + '/' + all.length + ' steam-legal (<=32 EU/t)')
    })
    check('recipe_type_voltage', allHaveLegal, details.join(' ; '))
  }

  // ---------------------------------------------------------------- structures (shared placement engine)

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
      return !Object.keys(counts).some(function (bid) { return bid === p })
    })
    if (!counts['gtceu:' + m.spec.id]) missing.push('controller')
    check(m.key + '.PREVIEW', shapes.length >= 1 && missing.length === 0 && total === m.plan.blocks,
      'shapes=' + shapes.length + ' blocks=' + total + '/' + m.plan.blocks + ' parts=[' + Object.keys(counts).filter(function (bid) {
        return /hatch|bus/.test(bid)
      }).map(function (bid) { return bid + ' x' + counts[bid] }).join(', ') + ']' + (missing.length > 0 ? ' missing=' + missing.join(',') : ''))
  }

  // ---------------------------------------------------------------- inputs / outputs (the 2 deep-processed machines)

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
    m.inTank = null
    m.outTanks = []
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.steam_input_bus) m.inBus = p
      else if (pid === PART_BLOCKS.steam) m.hatch = p
      else if (pid === PART_BLOCKS.steam_output_bus) m.outs.push(p)
      else if (pid === PART_BLOCKS.input_hatch) m.inTank = p
      else if (pid === PART_BLOCKS.output_hatch) m.outTanks.push(p)
    })
    var problems = []
    if (m.inBus === null) problems.push('no input bus')
    if (m.hatch === null) problems.push('no steam hatch')
    if (m.outs.length !== 2) problems.push('output buses=' + m.outs.length + ' (want 2)')
    if (m.spec.needsInTank && m.inTank === null) problems.push('no fluid input hatch')
    if (problems.length > 0) throw new Error('missing parts: ' + problems.join(', '))
  }

  function fillInputs(m) {
    clearInventory(m.inBus.getInventory())
    m.outs.forEach(function (b) { clearInventory(b.getInventory()) })
    var inv = m.inBus.getInventory()
    var itemIn = m.verifier.inputs[0]
    // ore_washer's own item ingredient is a material tag (forge:crushed_ores/iron) which firstItemId cannot read
    // (see its own comment) - m.spec.inputItemId is hardcoded to the concrete item known to satisfy it (macerator's
    // ingredient is already concrete, but both specs use the same hardcoded field for a uniform fillInputs).
    // The amount (n) still comes from the live recipe through itemIn.n, same as the fluid input below.
    var itemId = m.spec.inputItemId
    var n = itemIn.n * PARALLELS
    var left = inv.insertItem(0, Item.of(itemId, n), false)
    if (!left.isEmpty()) throw new Error('could not insert ' + itemId + ' x' + n + ' into the input bus')
    var fluidNote = 'no fluid input'
    if (m.inTank) {
      var fl = m.verifier.inputFluids[0]
      var amount = fl.n * PARALLELS
      m.inTank.tank.setFluidInTank(0, Fluid.of(m.spec.inputFluidId, amount).getFluidStack())
      var got = m.inTank.tank.getFluidInTank(0).getAmount()
      if (got !== amount) throw new Error('fluid input hatch holds ' + got + ' mB, wanted ' + amount)
      if (!fl.raw.test(Fluid.of(m.spec.inputFluidId, 1000).getFluidStack())) {
        throw new Error('the recipe does not accept ' + m.spec.inputFluidId + ' as its fluid input')
      }
      fluidNote = m.spec.inputFluidId + '=' + got + ' mB'
    }
    var steam = fillSteam(m.hatch)
    m.steamStart = steamIn(m)
    note(m.key + '.INPUT', 'bus=[' + itemSummary(readBus(m.inBus)) + '] ' + fluidNote + ' steam=' + m.steamStart + ' mB (' + steam.report + ')')
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
    var left = readBus(m.inBus)
    var used = m.steamStart - steamIn(m)
    var verdict = m.verifier.verify(counts, {}, left)
    check(m.key + '.PROCESS', verdict.ok, verdict.detail + ' | items=[' + itemSummary(counts) + '] left in bus=[' +
      itemSummary(left) + '] steamUsed=' + used + ' mB ' + recipeState(ctrl))
    var guaranteedId = firstItemId(m.verifier.guaranteedOutputs[0])
    var runs = Math.floor((counts[guaranteedId] || 0) / m.verifier.guaranteedOutputs[0].n)
    check(m.key + '.PARALLEL', runs === PARALLELS, 'runs=' + runs + ' at once (' + PARALLELS + ' expected), recipe=' + m.verifier.recipeId)
  }

  // ---------------------------------------------------------------- machines

  // verifier: reads the REAL recipe's own contents (amounts, guaranteed vs. chanced outputs) instead of hardcoding
  // them, so the test stays correct if GTM's own numbers for the picked recipe ever change; only the recipe id
  // (SPECS' pick) and its tag-based item input (SPECS' inputItemId) are pinned - see fillInputs/firstItemId above.
  function buildVerifier(recipe) {
    var c = lazy()
    var insI = contentsOf(recipe, c.ItemCap, false)
    var outsI = contentsOf(recipe, c.ItemCap, true)
    var insF = contentsOf(recipe, c.FluidCap, false)
    var guaranteed = outsI.filter(isGuaranteed)
    var chanced = outsI.filter(function (e) { return !isGuaranteed(e) })
    if (guaranteed.length === 0) throw new Error('recipe ' + recipe.id + ' has no guaranteed item output')
    return {
      recipeId: String(recipe.id), inputs: insI, inputFluids: insF, guaranteedOutputs: guaranteed, chancedOutputs: chanced,
      verify: function (counts, fluids, left) {
        var problems = []
        var details = []
        guaranteed.forEach(function (g) {
          var id = firstItemId(g)
          var want = g.n * PARALLELS
          var got = counts[id] || 0
          details.push(id + '=' + got + ' (want ' + want + ')')
          if (got !== want) problems.push(id + ' expected ' + want + ' got ' + got)
        })
        var knownIds = guaranteed.concat(chanced).map(firstItemId)
        var unexpected = Object.keys(counts).filter(function (id) { return knownIds.indexOf(id) < 0 })
        if (unexpected.length > 0) problems.push('unexpected outputs=' + unexpected.join(','))
        chanced.forEach(function (ch) {
          var id = firstItemId(ch)
          details.push(id + ' (chanced ' + (Number(ch.chance) / 100) + '%) got ' + (counts[id] || 0))
        })
        if (Object.keys(left).length > 0) problems.push('leftover in input bus=' + itemSummary(left))
        return { ok: problems.length === 0, detail: details.join(' ') + (problems.length > 0 ? ' problems=' + problems.join(', ') : '') }
      }
    }
  }

  var SPECS = [
    {
      key: 'macerator', id: 'large_steam_macerator', type: 'gtceu:macerator', x: 5384, deep: true, needsInTank: false,
      previewParts: ['gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus'],
      inputItemId: 'gtceu:iron_ore',
      pick: function () { return pickRecipe('gtceu:macerator', ['macerate_iron_ore_to_crushed_ore']) }
    },
    {
      key: 'centrifuge', id: 'large_steam_centrifuge', type: 'gtceu:centrifuge', x: 5396, deep: false, needsInTank: true,
      previewParts: ['gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus', 'gtceu:ulv_input_hatch', 'gtceu:ulv_output_hatch']
    },
    {
      key: 'thermal_centrifuge', id: 'large_steam_thermal_centrifuge', type: 'gtceu:thermal_centrifuge', x: 5408, deep: false, needsInTank: false,
      previewParts: ['gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus']
    },
    {
      key: 'chemical_bath', id: 'large_steam_chemical_bath', type: 'gtceu:chemical_bath', x: 5420, deep: false, needsInTank: true,
      previewParts: ['gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus', 'gtceu:ulv_input_hatch', 'gtceu:ulv_output_hatch']
    },
    {
      key: 'ore_washer', id: 'large_steam_ore_washer', type: 'gtceu:ore_washer', x: 5432, deep: true, needsInTank: true,
      inputItemId: 'gtceu:crushed_iron_ore', inputFluidId: 'gtceu:distilled_water',
      previewParts: ['gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus', 'gtceu:ulv_input_hatch'],
      pick: function () { return pickRecipe('gtceu:ore_washer', ['wash_iron_crushed_ore_to_purified_ore_distilled']) }
    }
  ]

  function prepareWorld() {
    for (var cx = X0 >> 4; cx <= X1 >> 4; cx++) S.level.getChunk(cx, 0)
    S.server.runCommandSilent('forceload add ' + X0 + ' 0 ' + X1 + ' 15')
    var cleared = S.server.runCommandSilent('fill ' + X0 + ' 98 0 ' + X1 + ' 112 15 air')
    note('AREA', 'chunks ' + (X0 >> 4) + '..' + (X1 >> 4) + ',0 generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function startMachine(spec) {
    var fullId = 'gtceu:' + spec.id
    var m = { key: spec.key, spec: spec, phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false, noted: false, ff: false }
    S.machines.push(m)
    try {
      var def = GTRegistries.MACHINES.get(rl(fullId))
      if (!def) {
        check(m.key + '.PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      m.def = def
      var desc = global.grindless.patterns.describe(fullId)
      m.builtBefore = !!(desc && desc.built)
      m.plan = planOf(fullId, spec.x, Y0, Z0)
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

  function startDeepProcessing(m, ctrl) {
    try {
      var recipe = m.spec.pick()
      if (!recipe) throw new Error('no steam-legal (<=32 EU/t) real recipe found for ' + m.spec.type + ' matching the expected ore-chain pattern')
      m.verifier = buildVerifier(recipe)
      findParts(m, ctrl)
      fillInputs(m)
      // a freshly-formed WorkableMultiblockMachine unsubscribes its RecipeLogic from the tick loop the first time
      // it finds nothing to process (keepSubscribing() == false) - its own "a recipe was inserted" notification
      // does not always resubscribe it in time, so force it to recheck on the very next tick instead of a
      // variable, sometimes 100+ tick wait for GTM's own idle-polling to notice the new inputs by itself
      ctrl.getRecipeLogic().updateTickSubscription()
      m.phase = 'running'
      m.tStart = S.t
    } catch (e) {
      check(m.key + '.PROCESS', false, 'could not start processing: ' + e)
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
        check(m.key + '.PATTERN', global.grindless.patterns.describe('gtceu:' + m.spec.id).built,
          'built by GTM itself on the first structure check (already built before placing: ' + m.builtBefore + ')')
        try { previewCheck(m) } catch (e3) { check(m.key + '.PREVIEW', false, 'exception: ' + e3) }
        if (m.spec.deep) {
          startDeepProcessing(m, ctrl)
        } else {
          m.phase = 'done'
        }
        return
      }
      if (waited >= FORM_TIMEOUT) {
        if (!global.grindless.patterns.describe('gtceu:' + m.spec.id).built) {
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
      if (!m.ff && running >= 40) {
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
      if (running >= 160) {
        collect(m, ctrl)
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
    try { registryChecks() } catch (e) { check('registry', false, 'exception: ' + e) }
    try { recipeTypeVoltageChecks() } catch (e1) { check('recipe_type_voltage', false, 'exception: ' + e1) }
    try { prepareWorld() } catch (e2) { check('AREA', false, 'exception: ' + e2) }
    SPECS.forEach(startMachine)
    if (allDone()) finish()
  }

  ServerEvents.tick(function () { onTick() })

  ServerEvents.customCommand('gg_test_steam_large_family', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_steam_large_family run is still in progress')
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
