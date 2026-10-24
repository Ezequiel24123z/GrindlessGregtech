// Gregtech Grindless - smoke test of the two Steam Age multiblocks (TEST-ONLY overlay: copied over the instance on
// the test PC, never shipped with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_steam' -WaitForLog 'GGTEST\|steam\|DONE@@300'
//
// Markers: GGTEST|<scope>|<check>|PASS|FAIL|NOTE|<detail>   (scope = steam or a machine id)
//   steam|items, machines, recipe_types, recipes, crafting, tags, vein_table   registration and data
//   <machine>|DESCRIPTION  the structure description registered at startup (global.grindless.structures) is placed
//                       block by block; the pattern is NOT built by the test
//   <machine>|PLACED    every block of the structure is where it should be
//   <machine>|FORMED    the placed structure forms by itself (GTM's async structure thread)
//   <machine>|PATTERN   GTM built the pattern itself, lazily, on that first structure check
//   <machine>|PREVIEW   the structure preview EMI / JEI show has the controller and all three part kinds
//   <machine>|PROCESS   sample/sapling + bits + steam in -> the expected items in the output bus
//   <machine>|PARALLEL  the machine ran 4 recipes at once
//   <machine>|LOOKUP    GTM's recipe lookup finds the right recipe for every sample / sapling / seed (and none for a
//                       deep-vein sample with a bronze bit)
//   steam|DONE          last line
//
// Both machines are built at once around (8, 101, 2) and (24, 102, 2) in the overworld (chunks 0,0 and 1,0 are
// generated and force-loaded, the area is cleared first) and checked every 20 ticks. Everything is driven by
// the structure description that lib/patterns.js records (global.grindless.structures), so the test follows the
// pattern when it changes. var + function everywhere (this Rhino throws "redeclaration of var" for const/let
// inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var DRILL = 'gtceu:steam_vein_drill'
  var GREENHOUSE = 'gtceu:steam_greenhouse'
  var STEAM_MB = 64000
  var STEP = 20
  var FORM_TIMEOUT = 300

  var PART_BLOCKS = {
    steam: 'gtceu:steam_input_hatch',
    steam_input_bus: 'gtceu:steam_input_bus',
    steam_output_bus: 'gtceu:steam_output_bus'
  }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var S = null
  var metaMachineClass = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 600)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(scope, check, status, detail) {
    var line = TAG + scope + '|' + check + '|' + status
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

  function machineAt(p) {
    if (metaMachineClass === null) metaMachineClass = Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
    return metaMachineClass.getMachine(S.level, new BlockPos(p.x, p.y, p.z))
  }

  function blockIdAt(x, y, z) {
    return String(S.level.getBlock(x, y, z).getId())
  }

  function tagSize(tag) {
    return asArray(Ingredient.of('#' + tag).getItemIds()).length
  }

  function itemSummary(counts) {
    return Object.keys(counts).sort().map(function (id) { return id + ' x' + counts[id] }).join(', ')
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var G = global.grindless
    var rm = S.server.getRecipeManager()
    var veins = G.veinTable()

    var items = ['grindless:bronze_drill_bit', 'grindless:steel_drill_bit', 'grindless:empty_vein_probe']
    veins.forEach(function (v) { items.push(v.sample) })
    var missingItems = items.filter(function (id) { return !Item.exists(id) })
    check('steam', 'items', missingItems.length === 0,
      'count=' + items.length + (missingItems.length > 0 ? ' missing=' + missingItems.join(',') : ''))

    var gtItems = ['gtceu:lp_steam_miner', 'gtceu:bronze_normal_fluid_pipe', 'gtceu:steam_machine_casing',
      'gtceu:bronze_machine_casing', 'gtceu:bronze_frame', 'gtceu:steel_frame', 'gtceu:bronze_pipe_casing',
      'gtceu:steel_pipe_casing', 'gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus',
      'gtceu:rubber_sapling', 'gtceu:rubber_log', 'gtceu:sticky_resin']
    var missingGt = gtItems.filter(function (id) { return !Item.exists(id) })
    check('steam', 'gt_items', missingGt.length === 0,
      'count=' + gtItems.length + (missingGt.length > 0 ? ' missing=' + missingGt.join(',') : ''))

    var tags = ['forge:plates/bronze', 'forge:plates/steel', 'forge:rods/bronze', 'forge:rods/steel',
      'forge:gears/bronze', 'forge:glass', 'minecraft:saplings']
    veins.forEach(function (v) {
      v.ores.forEach(function (o) {
        var t = o.tag.substring(1)
        if (tags.indexOf(t) < 0) tags.push(t)
      })
    })
    var emptyTags = tags.filter(function (t) { return tagSize(t) === 0 })
    check('steam', 'tags', emptyTags.length === 0,
      'count=' + tags.length + (emptyTags.length > 0 ? ' empty=' + emptyTags.join(',') : ''))

    var problems = G.checkVeinTable()
    check('steam', 'vein_table', problems.length === 0,
      'veins=' + veins.length + (problems.length > 0 ? ' problems=' + problems.join('; ') : ''))

    var drilling = GTRegistries.RECIPE_TYPES.get(rl('gtceu:vein_drilling'))
    var greenhouse = GTRegistries.RECIPE_TYPES.get(rl('gtceu:greenhouse'))
    check('steam', 'recipe_types', !!drilling && !!greenhouse,
      'vein_drilling=' + (drilling ? 'registered' : 'missing') + ' greenhouse=' + (greenhouse ? 'registered' : 'missing'))

    // only the steam-tier recipes (this pack's ids) are counted; other agents add recipes of the same types
    var wantDrilling = []
    veins.forEach(function (v) {
      if (!v.steelOnly) wantDrilling.push('grindless:vein_drilling/' + v.id + '_bronze')
      wantDrilling.push('grindless:vein_drilling/' + v.id + '_steel')
    })
    var wantGreenhouse = G.greenhouse.entries.map(function (e) { return 'grindless:greenhouse/' + e.id })
    var absent = function (id) { return !rm.byKey(rl(id)).isPresent() }
    var missingDrilling = wantDrilling.filter(absent)
    var missingGreenhouse = wantGreenhouse.filter(absent)
    check('steam', 'recipes', !!drilling && !!greenhouse && missingDrilling.length === 0 && missingGreenhouse.length === 0,
      'vein_drilling=' + (wantDrilling.length - missingDrilling.length) + '/' + wantDrilling.length +
      ' greenhouse=' + (wantGreenhouse.length - missingGreenhouse.length) + '/' + wantGreenhouse.length +
      (missingDrilling.length + missingGreenhouse.length > 0 ? ' missing=' + missingDrilling.concat(missingGreenhouse).join(',') : ''))
    var totalDrilling = drilling ? rm.getAllRecipesFor(drilling).size() : -1
    var totalGreenhouse = greenhouse ? rm.getAllRecipesFor(greenhouse).size() : -1
    note('steam', 'recipes_other', 'vein_drilling total=' + totalDrilling + ' (other tiers ' + (totalDrilling - wantDrilling.length + missingDrilling.length) +
      ') greenhouse total=' + totalGreenhouse + ' (other tiers ' + (totalGreenhouse - wantGreenhouse.length + missingGreenhouse.length) + ')')

    var ids = ['grindless:crafting/bronze_drill_bit', 'grindless:crafting/steel_drill_bit',
      'grindless:crafting/empty_vein_probe', 'grindless:crafting/steam_vein_drill',
      'grindless:crafting/steam_greenhouse']
    veins.forEach(function (v) { ids.push('grindless:crafting/vein_sample/' + v.id) })
    var missingRecipes = ids.filter(function (id) { return !rm.byKey(rl(id)).isPresent() })
    check('steam', 'crafting', missingRecipes.length === 0,
      'count=' + ids.length + (missingRecipes.length > 0 ? ' missing=' + missingRecipes.join(',') : ''))

    // the chanced bit input and the non-consumed sample as GTM sees them (GTM puts the recipe type in the id path)
    try {
      var itemCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
      var r = rm.byKey(rl('grindless:vein_drilling/iron_bronze')).get()
      var ins = asArray(r.getInputContents(itemCap)).map(function (c) { return 'chance=' + c.chance })
      var outs = asArray(r.getOutputContents(itemCap)).map(function (c) { return 'chance=' + c.chance })
      note('steam', 'recipe_iron_bronze', 'inputs=[' + ins.join(' ') + '] outputs=[' + outs.join(' ') + '] duration=' +
        r.duration)
    } catch (e) {
      note('steam', 'recipe_iron_bronze', 'could not inspect: ' + e)
    }
  }

  // JS -> JS calls of one function that has a top-of-body const/let (information for the next agent, never a FAIL)
  function rhinoProbe() {
    function probeTwice(a) {
      const probeConstA = a + 1
      let probeLetB = probeConstA * 2
      return probeLetB
    }
    try {
      probeTwice(1)
      probeTwice(2)
      note('steam', 'rhino_const_let', 'two direct JS calls of a function with top-of-body const/let: ok')
    } catch (e) {
      note('steam', 'rhino_const_let', 'second direct JS call threw: ' + e)
    }
  }

  // ---------------------------------------------------------------- structures

  function findVein(id) {
    var veins = global.grindless.veinTable()
    for (var i = 0; i < veins.length; i++) {
      if (veins[i].id === id) return veins[i]
    }
    throw new Error('no vein ' + id + ' in the vein table')
  }

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

  // a "casing OR parts" cell: the parts the limits ask for are spread evenly over the cells, the rest is the plain block
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

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing
  // north: x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
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
      cx: cx, cy: cy, cz: cz,
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
    plan.cells.forEach(function (c) {
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
    var parts = plan.cells.filter(function (c) { return c.block.ability }).map(function (c) {
      return c.block.ability + '@' + c.x + ',' + c.y + ',' + c.z + c.props
    })
    check(plan.id, 'PLACED', failed.length === 0 && wrong.length === 0,
      'blocks=' + plan.blocks + ' size=' + plan.size + ' controller=' + plan.ctrl.x + ',' + plan.ctrl.y + ',' + plan.ctrl.z +
      ' parts=[' + parts.join(' ') + ']' +
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
      var st = ctrl.getMultiblockState()
      var err = st.error
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
      try {
        text += ' info=' + err.getErrorInfo().getString()
      } catch (e2) { /* optional */ }
      return text
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  function partIds(ctrl) {
    return asArray(ctrl.getParts()).map(function (p) { return String(p.getDefinition().getId()).replace('gtceu:', '') })
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

  function steamIn(m) {
    return m.hatch.tank.getFluidInTank(0).getAmount()
  }

  function fluidName(stack) {
    try {
      return String(Java.loadClass('net.minecraftforge.registries.ForgeRegistries').FLUIDS.getKey(stack.getFluid()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  // the stack the GT material gives, then KubeJS' Fluid.of, then the tank's own fill(): the first one that sticks wins
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
        report.push(makers[i][0] + '(' + fluidName(stack) + ' empty=' + stack.isEmpty() + ')->' + got)
        if (got > 0) return { ok: true, report: report.join(' ') }
      } catch (e) {
        report.push(makers[i][0] + ' threw ' + e)
      }
    }
    try {
      var action = Java.loadClass('net.minecraftforge.fluids.capability.IFluidHandler$FluidAction').EXECUTE
      var filled = tank.fill(Fluid.of('gtceu:steam', STEAM_MB).getFluidStack(), action)
      report.push('fill()->' + filled + ' now ' + tank.getFluidInTank(0).getAmount())
      if (tank.getFluidInTank(0).getAmount() > 0) return { ok: true, report: report.join(' ') }
    } catch (e2) {
      report.push('fill() threw ' + e2)
    }
    return { ok: false, report: report.join(' ') }
  }

  function fillInputs(m, ctrl) {
    var inBus = null
    var hatch = null
    var outs = []
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.steam_input_bus) inBus = p
      else if (pid === PART_BLOCKS.steam) hatch = p
      else if (pid === PART_BLOCKS.steam_output_bus) outs.push(p)
    })
    if (inBus === null || hatch === null || outs.length === 0) {
      throw new Error('missing parts: input bus=' + (inBus !== null) + ' steam hatch=' + (hatch !== null) + ' output buses=' + outs.length)
    }
    m.inBus = inBus
    m.hatch = hatch
    m.outs = outs

    var inv = inBus.getInventory()
    m.spec.inputs.forEach(function (input, slot) {
      var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
    })
    var steam = fillSteam(hatch)
    m.steamStart = steamIn(m)
    note(m.id, 'INPUT', 'bus=[' + itemSummary(readBus(inBus)) + '] steam=' + m.steamStart + ' mB (' + steam.report +
      ') output buses=' + outs.length)
    if (!steam.ok) throw new Error('no steam could be put into the hatch')
  }

  function recipeState(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() +
        ' lastRecipe=' + (last ? last.id : 'none')
    } catch (e) {
      return 'recipe state unreadable: ' + e
    }
  }

  // what GTM's own recipe lookup and matching say about the machine right now (used when a machine stays idle)
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

  function clearInventory(inv) {
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
  }

  // GTM's lookup picks the expected recipe for every sample / sapling (and none for a deep-vein sample with a bronze
  // bit). Every case replaces the contents of the input bus (the output buses are emptied first: a recipe is only
  // found when its outputs fit), then asks the recipe database about the formed machine.
  function runLookup(m, ctrl, cases) {
    var bus = m.inBus.getInventory()
    var db = ctrl.getRecipeType().db()
    var anyRecipe = function () { return true }
    var bad = []
    m.outs.forEach(function (b) { clearInventory(b.getInventory()) })
    cases.forEach(function (c) {
      clearInventory(bus)
      c.inputs.forEach(function (input, slot) {
        bus.insertItem(slot, Item.of(input.id, input.n), false)
      })
      var found = db.find(ctrl)
      var got = found ? String(found.id) : 'none'
      if (got !== c.want) {
        var loose = db.find(ctrl, anyRecipe)
        bad.push(c.label + ' wanted ' + c.want + ' got ' + got + ' (structural match: ' + (loose ? loose.id : 'none') + ')')
      }
    })
    check(m.id, 'LOOKUP', bad.length === 0,
      'cases=' + cases.length + (bad.length > 0 ? ' mismatches=' + bad.slice(0, 8).join('; ') : ''))
  }

  function drillCases() {
    var cases = []
    global.grindless.veinTable().forEach(function (v) {
      cases.push({
        label: v.id + '+bronze', inputs: [{ id: v.sample, n: 1 }, { id: 'grindless:bronze_drill_bit', n: 4 }],
        want: v.steelOnly ? 'none' : 'grindless:vein_drilling/' + v.id + '_bronze'
      })
      cases.push({
        label: v.id + '+steel', inputs: [{ id: v.sample, n: 1 }, { id: 'grindless:steel_drill_bit', n: 4 }],
        want: 'grindless:vein_drilling/' + v.id + '_steel'
      })
    })
    return cases
  }

  function greenhouseCases() {
    return global.grindless.greenhouse.entries.map(function (e) {
      return { label: e.id, inputs: [{ id: e.catalyst, n: 1 }], want: 'grindless:greenhouse/' + e.id }
    })
  }

  function collect(m, ctrl) {
    var counts = {}
    m.outs.forEach(function (b) {
      var c = readBus(b)
      Object.keys(c).forEach(function (id) { counts[id] = (counts[id] || 0) + c[id] })
    })
    var verdict = m.spec.verify(counts)
    var used = m.steamStart - steamIn(m)
    var detail = verdict.detail + ' | items=[' + itemSummary(counts) + '] steamUsed=' + used + ' mB ' + recipeState(ctrl)
    check(m.id, 'PROCESS', verdict.ok, detail)
    var runs = m.spec.runs(counts)
    check(m.id, 'PARALLEL', runs > 0 && runs % 4 === 0, 'runs=' + runs + ' in the first cycles (4 expected per cycle)')
  }

  // ---------------------------------------------------------------- machines

  // the structure preview EMI / JEI draw (GTM builds it from the same pattern): size and the parts it contains
  function previewCheck(id, def, plan) {
    var shapes = asArray(def.getMatchingShapes())
    var blocks = shapes[0].getBlocks()
    var counts = {}
    var total = 0
    for (var x = 0; x < blocks.length; x++) {
      for (var y = 0; y < blocks[x].length; y++) {
        for (var z = 0; z < blocks[x][y].length; z++) {
          var info = blocks[x][y][z]
          if (info === null || info === undefined) continue
          var block = info.getBlockState().getBlock()
          var bid = String(Block.getId(block))
          if (bid === 'minecraft:air') continue
          counts[bid] = (counts[bid] || 0) + 1
          total++
        }
      }
    }
    var missing = ['steam_input_hatch', 'steam_input_bus', 'steam_output_bus'].filter(function (p) {
      return !counts['gtceu:' + p]
    })
    if (!counts[id]) missing.push('controller')
    check(id, 'PREVIEW', shapes.length >= 1 && missing.length === 0 && total === plan.blocks,
      'shapes=' + shapes.length + ' blocks=' + total + '/' + plan.blocks + ' hatch=' + (counts['gtceu:steam_input_hatch'] || 0) +
      ' input_bus=' + (counts['gtceu:steam_input_bus'] || 0) + ' output_bus=' + (counts['gtceu:steam_output_bus'] || 0) +
      (missing.length > 0 ? ' missing=' + missing.join(',') : ''))
  }

  var SPECS = [
    {
      id: DRILL, x: 8, y: 101, z: 2, runTicks: 450,
      inputs: [{ id: 'grindless:vein_sample_iron', n: 1 }, { id: 'grindless:bronze_drill_bit', n: 4 }],
      cases: drillCases,
      runs: function (counts) { return counts['minecraft:cobblestone'] || 0 },
      verify: function (counts) {
        var vein = findVein('iron')
        var ores = vein.ores.map(function (o) { return o.item })
        var oreTotal = 0
        ores.forEach(function (id) { oreTotal += counts[id] || 0 })
        var stone = counts[vein.stone] || 0
        var unexpected = Object.keys(counts).filter(function (id) { return id !== vein.stone && ores.indexOf(id) < 0 })
        return {
          ok: stone >= 1 && oreTotal >= 1 && unexpected.length === 0,
          detail: 'iron vein: stone=' + stone + ' ores=' + oreTotal + (unexpected.length > 0 ? ' unexpected=' + unexpected.join(',') : '')
        }
      }
    },
    {
      id: GREENHOUSE, x: 24, y: 102, z: 2, runTicks: 700,
      inputs: [{ id: 'minecraft:oak_sapling', n: 1 }],
      cases: greenhouseCases,
      runs: function (counts) { return Math.floor((counts['minecraft:oak_log'] || 0) / 6) },
      verify: function (counts) {
        var logs = counts['minecraft:oak_log'] || 0
        return { ok: logs >= 6, detail: 'oak: logs=' + logs }
      }
    }
  ]

  function prepareWorld() {
    S.level.getChunk(0, 0)
    S.level.getChunk(1, 0)
    S.server.runCommandSilent('forceload add 0 0 31 15')
    var cleared = S.server.runCommandSilent('fill 0 98 0 31 112 15 air')
    note('steam', 'AREA', 'chunks 0,0 and 1,0 generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function startMachine(spec) {
    var m = { id: spec.id, spec: spec, phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false, noted: false }
    S.machines.push(m)
    try {
      var def = GTRegistries.MACHINES.get(rl(spec.id))
      if (def === null || def === undefined) {
        check(spec.id, 'PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      m.def = def
      // the pattern is NOT built here: the structure is placed from the registered description and GTM builds the
      // pattern itself, lazily, when the controller first checks its structure (what happens in a real world)
      var desc = global.grindless.patterns.describe(spec.id)
      m.builtBefore = !!(desc && desc.built)
      m.plan = planOf(spec.id, spec.x, spec.y, spec.z)
      check(spec.id, 'DESCRIPTION', true, 'registered at startup, ' + m.plan.blocks + ' blocks, ' + m.plan.size +
        ', pattern already built before placing: ' + m.builtBefore)
      if (!place(m.plan)) {
        m.phase = 'done'
        return
      }
      m.ctrl = m.plan.ctrl
      m.t0 = S.t
    } catch (e) {
      check(spec.id, 'DESCRIPTION', false, 'exception while describing/placing: ' + e)
      m.phase = 'done'
    }
  }

  function advance(m) {
    var ctrl = machineAt(m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check(m.id, 'FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }

    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        check(m.id, 'FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') +
          'parts=[' + partIds(ctrl).join(' ') + '] flipped=' + ctrl.isFlipped())
        check(m.id, 'PATTERN', global.grindless.patterns.describe(m.id).built,
          'built by GTM itself on the first structure check (already built before placing: ' + m.builtBefore + ')')
        try {
          previewCheck(m.id, m.def, m.plan)
        } catch (e3) {
          check(m.id, 'PREVIEW', false, 'exception: ' + e3)
        }
        fillInputs(m, ctrl)
        m.phase = 'running'
        m.tStart = S.t
        return
      }
      if (waited >= FORM_TIMEOUT) {
        if (!global.grindless.patterns.describe(m.id).built) {
          check(m.id, 'FORMED', false, 'not formed after ' + waited + ' ticks and GTM never built the pattern')
          m.phase = 'done'
          return
        }
        var syncOk = ctrl.checkPatternWithLock()
        if (!syncOk) {
          check(m.id, 'FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(m, ctrl))
          m.phase = 'done'
          return
        }
        check(m.id, 'FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
        ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
        ctrl.onStructureFormed()
        m.forced = true
      }
      return
    }

    if (m.phase === 'running') {
      var running = S.t - m.tStart
      if (!m.noted && running >= 60) {
        m.noted = true
        note(m.id, 'STATE', 'after ' + running + ' ticks: ' + recipeState(ctrl) + ' steam=' + steamIn(m) + ' ' + diagnose(ctrl))
      }
      if (running >= m.spec.runTicks) {
        collect(m, ctrl)
        try {
          runLookup(m, ctrl, m.spec.cases())
        } catch (e) {
          check(m.id, 'LOOKUP', false, 'exception: ' + e)
        }
        m.phase = 'done'
      }
    }
  }

  function allDone() {
    for (var i = 0; i < S.machines.length; i++) {
      if (S.machines[i].phase !== 'done') return false
    }
    return true
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    console.info(TAG + 'steam|DONE')
  }

  // setTimeout is not bound in the scripts of this server, so a server-tick handler drives the steps
  function step(elapsed) {
    try {
      S.t = elapsed
      S.machines.forEach(function (m) {
        if (m.phase === 'done') return
        try {
          advance(m)
        } catch (e) {
          check(m.id, 'STEP', false, 'exception in ' + m.phase + ': ' + e)
          m.phase = 'done'
        }
      })
      if (allDone()) finish()
    } catch (e) {
      check('steam', 'STEP', false, 'exception: ' + e)
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
    try {
      staticChecks()
    } catch (e) {
      check('steam', 'static', false, 'exception: ' + e)
    }
    rhinoProbe()
    try {
      prepareWorld()
    } catch (e) {
      check('steam', 'AREA', false, 'exception: ' + e)
    }
    SPECS.forEach(startMachine)
    if (allDone()) finish()
  }

  ServerEvents.tick(function () { onTick() })

  ServerEvents.customCommand('gg_test_steam', function (event) {
    if (S !== null && !S.finished) {
      note('steam', 'run', 'a previous gg_test_steam run is still in progress')
      return 0
    }
    try {
      run(event.getLevel().getServer())
    } catch (e) {
      check('steam', 'run', false, 'exception: ' + e)
      finish()
    }
    return 1
  })
})()
