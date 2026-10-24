// Gregtech Grindless - smoke test of the LV multiblocks (TEST-ONLY overlay: copied over the instance on the test PC,
// never shipped with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_lv_multis' -WaitForLog 'GGTEST\|lv_multis\|DONE@@600'
//
// Markers: GGTEST|<scope>|<check>|PASS|FAIL|NOTE|<detail>   (scope = lv_multis or a machine id)
//   lv_multis|items, gt_items, fluids, tags, tables, recipe_types, recipes, crafting, arc_tier   registration and data
//   <machine>|DESCRIPTION / PLACED / FORMED / PATTERN / PREVIEW   the registered description is placed block by block, forms, GTM builds the pattern and previews it
//   <machine>|PROCESS_<scenario>   one run of the machine: inputs in -> the expected items / fluids out
//   <machine>|LOOKUP               GTM's recipe lookup still reaches every recipe (steam and LV) the machine can run
//   lv_multis|DONE                 last line
//
// The three machines are built at once: drill around (8, 101, 2), greenhouse around (24, 102, 2), arc furnace around
// (40, 101, 2), all facing north in the overworld (chunks 0..3,0 are generated and force-loaded, the area is cleared first).
// Every machine runs its scenarios one after the other (the buses, hatches and the recipe logic are reset between them) and
// is checked every STEP ticks; the energy hatches are refilled every tick. Everything is driven by the structure description
// that lib/patterns.js records (global.grindless.structures). var + function everywhere (this Rhino throws "redeclaration
// of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'lv_multis'
  var STEP = 10
  var FORM_TIMEOUT = 300

  // The pack's Additional Placements mod rebuilds its block tags and reloads the datapacks (so these scripts too) a couple of
  // seconds after the server is up; a test that is running then is lost and its static checks can see empty tags. The command
  // therefore only leaves a request in `global` (it survives script reloads) and the tick handler starts the test once these scripts
  // have been loaded for QUIET_MS.
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestLvMultisRequest'

  var PART_BLOCKS = {
    energy_input: 'gtceu:lv_energy_input_hatch',
    input_bus: 'gtceu:lv_input_bus',
    output_bus: 'gtceu:lv_output_bus',
    input_hatch: 'gtceu:lv_input_hatch',
    output_hatch: 'gtceu:lv_output_hatch',
    muffler: 'gtceu:lv_muffler_hatch'
  }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var S = null
  var metaMachineClass = null
  var classes = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 700)
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

  function tagSize(tag) {
    return asArray(Ingredient.of('#' + tag).getItemIds()).length
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

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var G = global.grindless
    var LV = G.lv
    var rm = S.server.getRecipeManager()
    var nether = LV.netherVeins()

    var items = ['grindless:graphite_electrode']
    nether.forEach(function (v) { items.push(v.sample) })
    var missingItems = items.filter(function (id) { return !Item.exists(id) })
    check(SCOPE, 'items', missingItems.length === 0,
      'count=' + items.length + (missingItems.length > 0 ? ' missing=' + missingItems.join(',') : ''))

    var gtItems = LV.craftingParts.concat(LV.arc.neededItems).concat(['gtceu:fertilizer', 'gtceu:solid_machine_casing',
      'gtceu:steel_pipe_casing', 'gtceu:heatproof_machine_casing', 'gtceu:lv_energy_input_hatch', 'gtceu:lv_input_bus',
      'gtceu:lv_output_bus', 'gtceu:lv_input_hatch', 'gtceu:lv_output_hatch', 'gtceu:lv_muffler_hatch',
      'gtceu:lv_vein_drill', 'gtceu:lv_greenhouse', 'gtceu:submerged_arc_furnace', 'gtceu:programmed_circuit'])
    var seenIds = {}
    var uniqueGt = gtItems.filter(function (id) {
      if (seenIds[id]) return false
      seenIds[id] = true
      return true
    })
    var missingGt = uniqueGt.filter(function (id) { return !Item.exists(id) })
    check(SCOPE, 'gt_items', missingGt.length === 0,
      'count=' + uniqueGt.length + (missingGt.length > 0 ? ' missing=' + missingGt.join(',') : ''))

    var fluids = ['gtceu:drilling_fluid', 'minecraft:water', 'gtceu:carbon_dioxide', 'gtceu:carbon_monoxide']
    var missingFluids = fluids.filter(function (id) { return !Fluid.exists(id) })
    check(SCOPE, 'fluids', missingFluids.length === 0,
      'count=' + fluids.length + (missingFluids.length > 0 ? ' missing=' + missingFluids.join(',') : ''))

    var tags = ['forge:plates/steel', 'forge:rods/steel', 'forge:glass', 'minecraft:saplings', 'gtceu:circuits/lv']
    nether.forEach(function (v) {
      v.ores.forEach(function (o) {
        var t = o.tag.substring(1)
        if (tags.indexOf(t) < 0) tags.push(t)
      })
    })
    var emptyTags = tags.filter(function (t) { return tagSize(t) === 0 })
    check(SCOPE, 'tags', emptyTags.length === 0,
      'count=' + tags.length + (emptyTags.length > 0 ? ' empty=' + emptyTags.join(',') : ''))

    var problems = LV.checkTables()
    check(SCOPE, 'tables', problems.length === 0,
      'nether veins=' + nether.length + (problems.length > 0 ? ' problems=' + problems.join('; ') : '') +
      ' pairs=[' + nether.map(function (v) { return v.id + ':' + v.samplePair.map(function (t) { return t.replace('#forge:raw_materials/', '') }).join('+') }).join(' ') + ']')

    var fc = lazy().FluidCap
    var ic = lazy().ItemCap
    var drilling = GTRegistries.RECIPE_TYPES.get(rl('gtceu:vein_drilling'))
    var greenhouse = GTRegistries.RECIPE_TYPES.get(rl('gtceu:greenhouse'))
    var arc = GTRegistries.RECIPE_TYPES.get(rl('gtceu:arc_smelting'))
    var machines = ['gtceu:lv_vein_drill', 'gtceu:lv_greenhouse', 'gtceu:submerged_arc_furnace']
    var missingMachines = machines.filter(function (id) { return !GTRegistries.MACHINES.get(rl(id)) })
    var typesOk = !!drilling && !!greenhouse && !!arc && missingMachines.length === 0
    var widened = !!drilling && !!greenhouse && drilling.getMaxInputs(fc) === 1 && greenhouse.getMaxInputs(ic) === 3 &&
      greenhouse.getMaxInputs(fc) === 2 && greenhouse.getMaxOutputs(fc) === 1
    check(SCOPE, 'recipe_types', typesOk && widened,
      'arc_smelting=' + (arc ? 'registered' : 'missing') + ' machines=' + (missingMachines.length === 0 ? 'registered' : 'missing ' + missingMachines.join(',')) +
      ' vein_drilling fluid in=' + (drilling ? drilling.getMaxInputs(fc) : '?') + ' items out=' + (drilling ? drilling.getMaxOutputs(ic) : '?') +
      ' greenhouse items in=' + (greenhouse ? greenhouse.getMaxInputs(ic) : '?') + ' fluid in=' + (greenhouse ? greenhouse.getMaxInputs(fc) : '?') +
      ' fluid out=' + (greenhouse ? greenhouse.getMaxOutputs(fc) : '?'))

    var overworld = G.veinTable()
    var steelOnly = overworld.filter(function (v) { return v.steelOnly }).length
    var steamDrilling = overworld.length * 2 - steelOnly
    var wantDrilling = steamDrilling * 2 + nether.length * 2
    var wantGreenhouse = G.greenhouse.entries.length * 2 + LV.greenhouseExtras.length * 2
    var wantArc = 4
    // the MV scripts (server_scripts/grindless/mv/) add recipes of the same types under <type>/mv/: not counted here
    var notMv = function (recipes) {
      var n = 0
      asArray(recipes).forEach(function (r) { if (String(r.id).indexOf('/mv/') < 0) n++ })
      return n
    }
    var haveDrilling = drilling ? notMv(rm.getAllRecipesFor(drilling)) : -1
    var haveGreenhouse = greenhouse ? notMv(rm.getAllRecipesFor(greenhouse)) : -1
    var haveArc = arc ? rm.getAllRecipesFor(arc).size() : -1
    check(SCOPE, 'recipes', haveDrilling === wantDrilling && haveGreenhouse === wantGreenhouse && haveArc === wantArc,
      'vein_drilling=' + haveDrilling + '/' + wantDrilling + ' greenhouse=' + haveGreenhouse + '/' + wantGreenhouse +
      ' arc_smelting=' + haveArc + '/' + wantArc)

    var ids = ['grindless:crafting/lv_vein_drill', 'grindless:crafting/lv_greenhouse', 'grindless:crafting/submerged_arc_furnace',
      'grindless:forming_press/graphite_electrode']
    nether.forEach(function (v) { ids.push('grindless:crafting/vein_sample/' + v.id) })
    var missingRecipes = ids.filter(function (id) { return !rm.byKey(rl(id)).isPresent() })
    check(SCOPE, 'crafting', missingRecipes.length === 0,
      'count=' + ids.length + (missingRecipes.length > 0 ? ' missing=' + missingRecipes.join(',') : ''))

    // the arc recipes are LV by GTM's own measure (RecipeHelper.getRecipeEUtTier reads the voltage): 32 V x 2 A = 64 EU/t
    try {
      var RecipeHelper = Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
      var arcBad = []
      var arcSeen = []
      LV.arc.recipes.forEach(function (id) {
        var found = rm.byKey(rl(id))
        if (!found.isPresent()) {
          arcBad.push(id + ' missing')
          return
        }
        var recipe = found.get()
        var eu = recipe.getInputEUt()
        var volts = Number(eu.voltage())
        var amps = Number(eu.amperage())
        var tier = Number(RecipeHelper.getRecipeEUtTier(recipe))
        arcSeen.push(id.replace('grindless:arc_smelting/', '') + '=' + volts + 'Vx' + amps + 'A tier ' + tier)
        if (volts !== LV.arc.voltage || amps !== LV.arc.amperage || tier !== 1) arcBad.push(id + ' ' + volts + 'Vx' + amps + 'A tier ' + tier)
      })
      check(SCOPE, 'arc_tier', arcBad.length === 0 && arcSeen.length === LV.arc.recipes.length,
        arcSeen.join(' ') + (arcBad.length > 0 ? ' bad=' + arcBad.join('; ') : ''))
    } catch (e0) {
      check(SCOPE, 'arc_tier', false, 'exception: ' + e0)
    }

    // what the LV recipes look like to GTM: the order of the inputs decides where they sit in the lookup trie
    try {
      var r = rm.byKey(rl('grindless:vein_drilling/lv/iron_steel_fluid')).get()
      var ins = asArray(r.getInputContents(ic)).map(function (c) { return String(c.content.toJson()) + ' chance=' + c.chance })
      var fl = asArray(r.getInputContents(fc)).map(function (c) { return 'fluid ' + c.content.getStacks()[0].getAmount() + ' mB' })
      var outs = asArray(r.getOutputContents(ic)).map(function (c) { return c.chance })
      note(SCOPE, 'recipe_iron_steel_fluid', 'inputs=[' + ins.join(' ; ') + ' ; ' + fl.join(' ') + '] output chances=[' + outs.join(' ') + '] duration=' + r.duration)
    } catch (e) {
      note(SCOPE, 'recipe_iron_steel_fluid', 'could not inspect: ' + e)
    }
  }

  // ---------------------------------------------------------------- structures (same technique as gg_test_steam.js)

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

  // the structure preview EMI / JEI draw: size and the parts it contains
  function previewCheck(id, def, plan, wantParts) {
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
    var missing = []
    wantParts.forEach(function (ability) {
      var found = false
      Object.keys(counts).forEach(function (bid) {
        if (bid.indexOf('_' + PART_BLOCKS[ability].replace(/^gtceu:[a-z]+_/, '')) > 0 || bid === PART_BLOCKS[ability]) found = true
      })
      if (!found) missing.push(ability)
    })
    if (!counts[id]) missing.push('controller')
    check(id, 'PREVIEW', shapes.length >= 1 && missing.length === 0,
      'shapes=' + shapes.length + ' blocks=' + total + ' (placed structure: ' + plan.blocks + ')' +
      (missing.length > 0 ? ' missing=' + missing.join(',') : ''))
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

  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return { id: st.isEmpty() ? 'none' : fluidName(st), amount: st.isEmpty() ? 0 : st.getAmount() }
  }

  function findParts(ctrl) {
    var P = { energy: [], inBus: null, outBuses: [], inHatch: null, outHatch: null, muffler: null }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.energy_input) P.energy.push(p)
      else if (pid === PART_BLOCKS.input_bus) P.inBus = p
      else if (pid === PART_BLOCKS.output_bus) P.outBuses.push(p)
      else if (pid === PART_BLOCKS.input_hatch) P.inHatch = p
      else if (pid === PART_BLOCKS.output_hatch) P.outHatch = p
      else if (pid === PART_BLOCKS.muffler) P.muffler = p
    })
    return P
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
    if (P.inHatch !== null) P.inHatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    if (P.outHatch !== null) P.outHatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    ctrl.getRecipeLogic().resetRecipeLogic()
  }

  function fillScenario(m, sc) {
    var P = m.parts
    var inv = P.inBus.getInventory()
    sc.items.forEach(function (input, slot) {
      var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
    })
    var how = 'none'
    if (sc.circuit) {
      // the bus circuit slot refuses insertItem (its capability IO is NONE); players set it through the GUI
      P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(sc.circuit))
      how = 'circuit slot'
    }
    if (sc.fluid) {
      if (P.inHatch === null) throw new Error('the scenario needs a fluid but the machine has no input hatch')
      P.inHatch.tank.setFluidInTank(0, Fluid.of(sc.fluid.id, sc.fluid.mb).getFluidStack())
    }
    note(m.id, 'INPUT_' + sc.name, 'bus=[' + itemSummary(readBus(P.inBus)) + '] circuit=' + (sc.circuit ? sc.circuit + ' (' + how + ')' : 'none') +
      ' fluid=' + (sc.fluid ? sc.fluid.id + ' ' + sc.fluid.mb + ' mB' : 'none') + ' output buses=' + P.outBuses.length +
      ' energy hatches=' + P.energy.length)
  }

  function recipeState(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() +
        ' lastRecipe=' + (last ? last.id + ' parallels=' + last.parallels : 'none')
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
      var fails = asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
      if (fails.length > 0) out.push('failureReasons=[' + fails.join(' ; ') + ']')
    } catch (e) {
      out.push('diagnose threw ' + e)
    }
    return out.join(' ')
  }

  function collect(m, ctrl, sc) {
    var P = m.parts
    var counts = {}
    P.outBuses.forEach(function (b) {
      var c = readBus(b)
      Object.keys(c).forEach(function (id) { counts[id] = (counts[id] || 0) + c[id] })
    })
    var fluidOut = P.outHatch !== null ? tankInfo(P.outHatch) : { id: 'none', amount: 0 }
    var fluidIn = P.inHatch !== null ? tankInfo(P.inHatch) : { id: 'none', amount: 0 }
    var leftover = readBus(P.inBus)
    return { items: counts, fluidOut: fluidOut, fluidIn: fluidIn, leftover: leftover, seen: m.seen, sc: sc }
  }

  // sums the output counts of the given item ids
  function total(counts, ids) {
    var n = 0
    ids.forEach(function (id) { n += counts[id] || 0 })
    return n
  }

  function unexpectedItems(counts, allowed) {
    return Object.keys(counts).filter(function (id) { return allowed.indexOf(id) < 0 })
  }

  function seenAny(r, id) {
    return r.seen[id] === true
  }

  function seenIds(r) {
    return Object.keys(r.seen).join(',')
  }

  // ---------------------------------------------------------------- scenarios

  function findVein(id) {
    var veins = global.grindless.lv.allVeins()
    for (var i = 0; i < veins.length; i++) {
      if (veins[i].id === id) return veins[i]
    }
    throw new Error('no vein ' + id + ' in the vein tables')
  }

  function veinVerify(veinId, recipeId, minOresPerRun, fluidPerRun) {
    return function (r) {
      var vein = findVein(veinId)
      var ores = vein.ores.map(function (o) { return o.item })
      var oreTotal = total(r.items, ores)
      var stone = r.items[vein.stone] || 0
      var unexpected = unexpectedItems(r.items, ores.concat([vein.stone]))
      var used = r.sc.fluid ? r.sc.fluid.mb - r.fluidIn.amount : 0
      var ok = stone >= 4 && stone % 4 === 0 && oreTotal >= stone * minOresPerRun && unexpected.length === 0 && seenAny(r, recipeId)
      if (fluidPerRun > 0) ok = ok && used >= stone * fluidPerRun && used % fluidPerRun === 0
      return {
        ok: ok,
        detail: veinId + ': runs(stone)=' + stone + ' ores=' + oreTotal + ' fluidUsed=' + used + ' mB, recipes seen=[' + seenIds(r) + ']' +
          ' / items=[' + itemSummary(r.items) + ']' + (unexpected.length > 0 ? ' unexpected=' + unexpected.join(',') : '')
      }
    }
  }

  var DRILL_BITS_BRONZE = 'grindless:bronze_drill_bit'
  var DRILL_BITS_STEEL = 'grindless:steel_drill_bit'

  function drillScenarios() {
    return [
      {
        // steam recipe, no fluid: 4 runs at once (32 EU/t from one LV hatch, 8 EU/t per run)
        name: 'base', ticks: 260,
        items: [{ id: 'grindless:vein_sample_iron', n: 1 }, { id: DRILL_BITS_BRONZE, n: 16 }], circuit: 0, fluid: null,
        verify: veinVerify('iron', 'grindless:vein_drilling/iron_bronze', 1, 0)
      },
      {
        // drilling fluid in the hatch: the fluid variant runs, the base recipe waits (and gives 1.5x ore)
        name: 'fluid', ticks: 260,
        items: [{ id: 'grindless:vein_sample_iron', n: 1 }, { id: DRILL_BITS_STEEL, n: 16 }], circuit: 0,
        fluid: { id: 'gtceu:drilling_fluid', mb: 8000 },
        verify: veinVerify('iron', 'grindless:vein_drilling/lv/iron_steel_fluid', 4, 50)
      },
      {
        // a Nether vein: only possible with drilling fluid
        name: 'nether', ticks: 260,
        items: [{ id: 'grindless:vein_sample_sulfur', n: 1 }, { id: DRILL_BITS_BRONZE, n: 16 }], circuit: 0,
        fluid: { id: 'gtceu:drilling_fluid', mb: 8000 },
        verify: veinVerify('sulfur', 'grindless:vein_drilling/lv/sulfur_bronze_fluid', 1, 50)
      },
      {
        // the same Nether sample without fluid must not run (this is what keeps the steam drill out of the Nether)
        name: 'nether_no_fluid', ticks: 60,
        items: [{ id: 'grindless:vein_sample_sulfur', n: 1 }, { id: DRILL_BITS_BRONZE, n: 16 }], circuit: 0, fluid: null,
        verify: function (r) {
          var n = Object.keys(r.items).length
          return { ok: n === 0, detail: 'no recipe expected: output items=[' + itemSummary(r.items) + '] recipes seen=[' + seenIds(r) + ']' }
        }
      },
      {
        // the vanadium steel bit is the MV drill's: its recipes (grindless:vein_drilling/mv/...) are vetoed here, with and without fluid
        name: 'mv_bit_gated', ticks: 60,
        items: [{ id: 'grindless:vein_sample_iron', n: 1 }, { id: 'grindless:vanadium_steel_drill_bit', n: 16 }], circuit: 0,
        fluid: { id: 'gtceu:drilling_fluid', mb: 8000 },
        verify: function (r) {
          var n = Object.keys(r.items).length
          return { ok: n === 0, detail: 'no recipe expected: output items=[' + itemSummary(r.items) + '] recipes seen=[' + seenIds(r) + ']' }
        }
      }
    ]
  }

  function greenhouseScenarios() {
    return [
      {
        // circuit 1 = base: the steam recipe, 8 runs at once (32 EU/t from one LV hatch, 4 EU/t per run)
        name: 'base', ticks: 430,
        items: [{ id: 'minecraft:oak_sapling', n: 1 }], circuit: 1, fluid: null,
        verify: function (r) {
          var logs = r.items['minecraft:oak_log'] || 0
          var unexpected = unexpectedItems(r.items, ['minecraft:oak_log', 'minecraft:oak_sapling', 'minecraft:stick', 'minecraft:apple'])
          return {
            ok: logs >= 6 && logs % 6 === 0 && unexpected.length === 0 && seenAny(r, 'grindless:greenhouse/oak'),
            detail: 'oak: logs=' + logs + ' (runs=' + (logs / 6) + ') recipes seen=[' + seenIds(r) + '] / items=[' + itemSummary(r.items) + ']'
          }
        }
      },
      {
        // circuit 2 + fertilizer + water: double output, half the time
        name: 'fertilizer', ticks: 260,
        items: [{ id: 'minecraft:oak_sapling', n: 1 }, { id: 'gtceu:fertilizer', n: 16 }], circuit: 2,
        fluid: { id: 'minecraft:water', mb: 8000 },
        verify: function (r) {
          var logs = r.items['minecraft:oak_log'] || 0
          var runs = logs / 12
          var fertUsed = 16 - (r.leftover['gtceu:fertilizer'] || 0)
          var waterUsed = 8000 - r.fluidIn.amount
          var unexpected = unexpectedItems(r.items, ['minecraft:oak_log', 'minecraft:oak_sapling', 'minecraft:stick', 'minecraft:apple'])
          return {
            ok: logs >= 12 && logs % 12 === 0 && fertUsed >= runs && waterUsed >= runs * 100 && unexpected.length === 0 &&
              seenAny(r, 'grindless:greenhouse/lv/oak_fertilizer') && !seenAny(r, 'grindless:greenhouse/oak'),
            detail: 'oak fertilizer: logs=' + logs + ' (runs=' + runs + ') fertilizerUsed=' + fertUsed + ' waterUsed=' + waterUsed + ' mB recipes seen=[' +
              seenIds(r) + '] / items=[' + itemSummary(r.items) + ']'
          }
        }
      },
      {
        // an extra crop that needs water (no circuit)
        name: 'extra', ticks: 430,
        items: [{ id: 'minecraft:red_mushroom', n: 1 }], circuit: 0, fluid: { id: 'minecraft:water', mb: 8000 },
        verify: function (r) {
          var n = r.items['minecraft:red_mushroom'] || 0
          var waterUsed = 8000 - r.fluidIn.amount
          return {
            ok: n >= 6 && n % 6 === 0 && waterUsed >= (n / 6) * 100 && seenAny(r, 'grindless:greenhouse/lv/extra_red_mushroom'),
            detail: 'red mushrooms=' + n + ' (runs=' + (n / 6) + ') waterUsed=' + waterUsed + ' mB recipes seen=[' + seenIds(r) + ']'
          }
        }
      }
    ]
  }

  function arcScenarios() {
    var ELE = 'grindless:graphite_electrode'
    return [
      {
        name: 'silicon', ticks: 230,
        items: [{ id: 'gtceu:quartz_sand_dust', n: 12 }, { id: 'gtceu:coke_dust', n: 8 }, { id: ELE, n: 8 }], circuit: 1, fluid: null,
        verify: function (r) {
          var si = r.items['ae2:silicon'] || 0
          var unexpected = unexpectedItems(r.items, ['ae2:silicon', 'gtceu:ash_dust'])
          return {
            ok: si >= 1 && r.fluidOut.id === 'gtceu:carbon_dioxide' && r.fluidOut.amount === si * 2000 && unexpected.length === 0 &&
              seenAny(r, 'grindless:arc_smelting/silicon'),
            detail: 'silicon=' + si + ' fluid out=' + r.fluidOut.id + ' ' + r.fluidOut.amount + ' mB, electrodes left=' + (r.leftover[ELE] || 0) +
              ' recipes seen=[' + seenIds(r) + '] / items=[' + itemSummary(r.items) + ']'
          }
        }
      },
      {
        name: 'silicon_co', ticks: 230,
        items: [{ id: 'gtceu:quartz_sand_dust', n: 12 }, { id: 'gtceu:coke_dust', n: 8 }, { id: ELE, n: 8 }], circuit: 2, fluid: null,
        verify: function (r) {
          var si = r.items['ae2:silicon'] || 0
          return {
            ok: si >= 1 && r.fluidOut.id === 'gtceu:carbon_monoxide' && r.fluidOut.amount === si * 2000 && seenAny(r, 'grindless:arc_smelting/silicon_co'),
            detail: 'silicon=' + si + ' fluid out=' + r.fluidOut.id + ' ' + r.fluidOut.amount + ' mB recipes seen=[' + seenIds(r) + '] / items=[' + itemSummary(r.items) + ']'
          }
        }
      },
      {
        name: 'sky_dust', ticks: 330,
        items: [{ id: 'gtceu:obsidian_dust', n: 8 }, { id: 'gtceu:quartz_sand_dust', n: 8 }, { id: 'ae2:charged_certus_quartz_crystal', n: 2 }, { id: ELE, n: 8 }],
        circuit: 0, fluid: null,
        verify: function (r) {
          var sky = r.items['ae2:sky_dust'] || 0
          return {
            ok: sky >= 4 && sky % 4 === 0 && seenAny(r, 'grindless:arc_smelting/sky_dust'),
            detail: 'sky dust=' + sky + ' recipes seen=[' + seenIds(r) + '] / items=[' + itemSummary(r.items) + ']'
          }
        }
      },
      {
        // melt + water quench: 32 cobblestone and 4 000 mB of water per run -> 4 obsidian, nothing leaves in a fluid (the water is gone)
        name: 'obsidian', ticks: 330,
        items: [{ id: 'minecraft:cobblestone', n: 64 }, { id: ELE, n: 8 }], circuit: 0, fluid: { id: 'minecraft:water', mb: 8000 },
        verify: function (r) {
          var obs = r.items['minecraft:obsidian'] || 0
          var runs = obs / 4
          var waterUsed = 8000 - r.fluidIn.amount
          var unexpected = unexpectedItems(r.items, ['minecraft:obsidian'])
          return {
            ok: obs >= 4 && obs % 4 === 0 && waterUsed >= runs * 4000 && waterUsed % 4000 === 0 && r.fluidOut.amount === 0 &&
              unexpected.length === 0 && seenAny(r, 'grindless:arc_smelting/obsidian'),
            detail: 'obsidian=' + obs + ' (runs=' + runs + ') waterUsed=' + waterUsed + ' mB fluid out=' + r.fluidOut.id + ' ' + r.fluidOut.amount +
              ' mB recipes seen=[' + seenIds(r) + '] / items=[' + itemSummary(r.items) + ']'
          }
        }
      }
    ]
  }

  // ---------------------------------------------------------------- lookup checks

  // every recipe GTM's lookup can reach with the inputs now in the machine (the predicate accepts everything)
  function candidateIds(ctrl) {
    var ids = []
    var it = ctrl.getRecipeType().db().iterator(ctrl, function (r) { return true })
    if (it === null || it === undefined) return ids
    var guard = 0
    while (it.hasNext() && guard < 600) {
      ids.push(String(it.next().id))
      guard++
    }
    return ids
  }

  function setLookupInputs(m, c) {
    var P = m.parts
    clearInventory(P.inBus.getInventory())
    clearInventory(P.inBus.getCircuitInventory())
    if (P.inHatch !== null) P.inHatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    var inv = P.inBus.getInventory()
    c.items.forEach(function (input, slot) { inv.insertItem(slot, Item.of(input.id, input.n), false) })
    if (c.circuit) P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(c.circuit))
    if (c.fluid) P.inHatch.tank.setFluidInTank(0, Fluid.of(c.fluid.id, c.fluid.mb).getFluidStack())
  }

  function runLookup(m, ctrl, cases) {
    var bad = []
    cases.forEach(function (c) {
      setLookupInputs(m, c)
      var ids = candidateIds(ctrl)
      if (ids.indexOf(c.want) < 0) bad.push(c.label + ' wanted ' + c.want + ' got [' + ids.slice(0, 6).join(',') + ']')
    })
    check(m.id, 'LOOKUP', bad.length === 0,
      'cases=' + cases.length + (bad.length > 0 ? ' unreachable=' + bad.slice(0, 8).join('; ') : ''))
  }

  function drillLookupCases() {
    var cases = []
    global.grindless.lv.allVeins().forEach(function (v) {
      ;['bronze', 'steel'].forEach(function (kind) {
        if (kind === 'bronze' && v.steelOnly) return
        var bit = kind === 'bronze' ? DRILL_BITS_BRONZE : DRILL_BITS_STEEL
        if (!v.nether) {
          cases.push({ label: v.id + '+' + kind + ' (steam)', items: [{ id: v.sample, n: 1 }, { id: bit, n: 4 }], circuit: 0, fluid: null,
            want: 'grindless:vein_drilling/' + v.id + '_' + kind })
        }
        cases.push({ label: v.id + '+' + kind + ' (fluid)', items: [{ id: v.sample, n: 1 }, { id: bit, n: 4 }], circuit: 0,
          fluid: { id: 'gtceu:drilling_fluid', mb: 1000 }, want: 'grindless:vein_drilling/lv/' + v.id + '_' + kind + '_fluid' })
      })
    })
    return cases
  }

  function greenhouseLookupCases() {
    var cases = []
    var G = global.grindless
    var WATER = { id: 'minecraft:water', mb: 1000 }
    G.greenhouse.entries.forEach(function (e) {
      cases.push({ label: e.id + ' (steam)', items: [{ id: e.catalyst, n: 1 }], circuit: 0, fluid: null, want: 'grindless:greenhouse/' + e.id })
      cases.push({ label: e.id + ' (fertilizer)', items: [{ id: e.catalyst, n: 1 }, { id: 'gtceu:fertilizer', n: 4 }], circuit: 2, fluid: WATER,
        want: 'grindless:greenhouse/lv/' + e.id + '_fertilizer' })
    })
    G.lv.greenhouseExtras.forEach(function (e) {
      cases.push({ label: e.id, items: [{ id: e.catalyst, n: 1 }], circuit: 0, fluid: WATER, want: 'grindless:greenhouse/lv/' + e.id })
      cases.push({ label: e.id + ' (fertilizer)', items: [{ id: e.catalyst, n: 1 }, { id: 'gtceu:fertilizer', n: 4 }], circuit: 2, fluid: WATER,
        want: 'grindless:greenhouse/lv/' + e.id + '_fertilizer' })
    })
    return cases
  }

  function arcLookupCases() {
    var ELE = 'grindless:graphite_electrode'
    return [
      { label: 'silicon', items: [{ id: 'gtceu:quartz_sand_dust', n: 3 }, { id: 'gtceu:coke_dust', n: 2 }, { id: ELE, n: 1 }], circuit: 1, fluid: null, want: 'grindless:arc_smelting/silicon' },
      { label: 'silicon_co', items: [{ id: 'gtceu:quartz_sand_dust', n: 3 }, { id: 'gtceu:coke_dust', n: 2 }, { id: ELE, n: 1 }], circuit: 2, fluid: null, want: 'grindless:arc_smelting/silicon_co' },
      { label: 'sky_dust', items: [{ id: 'gtceu:obsidian_dust', n: 4 }, { id: 'gtceu:quartz_sand_dust', n: 4 }, { id: 'ae2:charged_certus_quartz_crystal', n: 1 }, { id: ELE, n: 1 }], circuit: 0, fluid: null, want: 'grindless:arc_smelting/sky_dust' },
      { label: 'obsidian', items: [{ id: 'minecraft:cobblestone', n: 32 }, { id: ELE, n: 1 }], circuit: 0, fluid: { id: 'minecraft:water', mb: 4000 }, want: 'grindless:arc_smelting/obsidian' }
    ]
  }

  // ---------------------------------------------------------------- machines

  var SPECS = [
    { id: 'gtceu:lv_vein_drill', x: 264, y: 101, z: 2, scenarios: drillScenarios, lookup: drillLookupCases,
      previewParts: ['energy_input', 'input_bus', 'output_bus', 'input_hatch'] },
    { id: 'gtceu:lv_greenhouse', x: 280, y: 102, z: 2, scenarios: greenhouseScenarios, lookup: greenhouseLookupCases,
      previewParts: ['energy_input', 'input_bus', 'output_bus', 'input_hatch'] },
    { id: 'gtceu:submerged_arc_furnace', x: 296, y: 101, z: 2, scenarios: arcScenarios, lookup: arcLookupCases,
      previewParts: ['energy_input', 'input_bus', 'output_bus', 'input_hatch', 'output_hatch', 'muffler'] }
  ]

  function prepareWorld() {
    for (var cx = 16; cx < 20; cx++) S.level.getChunk(cx, 0)
    S.server.runCommandSilent('forceload add 256 0 319 15')
    var cleared = S.server.runCommandSilent('fill 256 98 0 319 112 15 air')
    note(SCOPE, 'AREA', 'chunks 16..19,0 generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function startMachine(spec) {
    var m = { id: spec.id, spec: spec, phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false, noted: false,
      parts: null, scenarios: null, sc: -1, scStart: 0, seen: {}, stateNoted: false }
    S.machines.push(m)
    try {
      var def = GTRegistries.MACHINES.get(rl(spec.id))
      if (def === null || def === undefined) {
        check(spec.id, 'PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      // the pattern is NOT built here: the structure is placed from the registered description and GTM builds the
      // pattern itself, lazily, when the controller first checks its structure (what happens in a real world)
      var desc = global.grindless.patterns.describe(spec.id)
      m.builtBefore = !!(desc && desc.built)
      m.def = def
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

  function observe(m, ctrl) {
    try {
      var last = ctrl.getRecipeLogic().getLastRecipe()
      if (last) m.seen[String(last.id)] = true
    } catch (e) { /* optional */ }
  }

  function nextScenario(m, ctrl) {
    m.sc++
    if (m.sc >= m.scenarios.length) {
      try {
        runLookup(m, ctrl, m.spec.lookup())
      } catch (e) {
        check(m.id, 'LOOKUP', false, 'exception: ' + e)
      }
      m.phase = 'done'
      return
    }
    var sc = m.scenarios[m.sc]
    resetMachine(m, ctrl)
    m.seen = {}
    m.stateNoted = false
    fillScenario(m, sc)
    m.scStart = S.t
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
          'parts=[' + partIds(ctrl).join(' ') + '] flipped=' + ctrl.isFlipped() + ' tier=' + (ctrl.getTier ? ctrl.getTier() : '?'))
        check(m.id, 'PATTERN', global.grindless.patterns.describe(m.id).built,
          'built by GTM itself on the first structure check (already built before placing: ' + m.builtBefore + ')')
        try {
          previewCheck(m.id, m.def, m.plan, m.spec.previewParts)
        } catch (e3) {
          check(m.id, 'PREVIEW', false, 'exception: ' + e3)
        }
        m.parts = findParts(ctrl)
        if (m.parts.inBus === null || m.parts.outBuses.length === 0 || m.parts.energy.length === 0) {
          check(m.id, 'PARTS', false, 'missing parts: input bus=' + (m.parts.inBus !== null) + ' output buses=' + m.parts.outBuses.length +
            ' energy hatches=' + m.parts.energy.length)
          m.phase = 'done'
          return
        }
        m.scenarios = m.spec.scenarios()
        m.sc = -1
        m.phase = 'running'
        topUpEnergy(m)
        nextScenario(m, ctrl)
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
      var sc = m.scenarios[m.sc]
      var running = S.t - m.scStart
      observe(m, ctrl)
      if (!m.stateNoted && running >= 60) {
        m.stateNoted = true
        note(m.id, 'STATE_' + sc.name, 'after ' + running + ' ticks: ' + recipeState(ctrl) + ' ' + diagnose(ctrl))
      }
      if (running >= sc.ticks) {
        var verdict = null
        try {
          var result = collect(m, ctrl, sc)
          verdict = sc.verify(result)
        } catch (e) {
          verdict = { ok: false, detail: 'exception while checking: ' + e }
        }
        check(m.id, 'PROCESS_' + sc.name, verdict.ok, verdict.detail + ' | ' + recipeState(ctrl))
        nextScenario(m, ctrl)
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
    console.info(TAG + SCOPE + '|DONE')
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
      check(SCOPE, 'STEP', false, 'exception: ' + e)
      finish()
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    S.machines.forEach(function (m) {
      if (m.phase === 'running') {
        try { topUpEnergy(m) } catch (e) { /* the next step reports problems */ }
      }
    })
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
    S = { server: server, level: server.overworld(), t: 0, tick0: now, nextAt: now + STEP, machines: [], finished: false }
    try {
      staticChecks()
    } catch (e) {
      check(SCOPE, 'static', false, 'exception: ' + e)
    }
    try {
      prepareWorld()
    } catch (e) {
      check(SCOPE, 'AREA', false, 'exception: ' + e)
    }
    SPECS.forEach(startMachine)
    if (allDone()) finish()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_lv_multis', function (event) {
    if (S !== null && !S.finished) {
      note(SCOPE, 'run', 'a previous gg_test_lv_multis run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
