// priority: -3024
// Gregtech Grindless - smoke test of the road to the first rocket: the Engine Test Stand (MV), the Composite Autoclave (HV) and the GCYR
// parts they feed (TEST-ONLY overlay: copied over the instance on the test PC, never shipped with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_launch_road;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|launch_road\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|<scope>|<check>|PASS|FAIL|NOTE|<detail>   (scope = launch_road or a machine id)
//   launch_road|registry, recipe_types, recipes, controllers, gcyr_replaced, gcyr_untouched, motor_sources, tank_sources, id_chip,
//               id_chip_keeps_chart
//                                   registration, the recipes of launch_road/recipes.js and integration/gcyr_launch_road.js, the GCYR
//                                   recipes they replace, the ones of integration/gcyr.js that must stay as they are, and the chart that
//                                   stays in the grid when the ID chip is crafted
//   <machine>|DESCRIPTION / PLACED / FORMED / PATTERN / PREVIEW   the registered description is placed block by block, forms, GTM
//                                                                 builds the pattern and previews it
//   <machine>|PROCESS_<scenario>   one run: inputs in -> the expected items / fluids out and the fluids used
//   launch_road|DONE               last line
//
// Machines (all facing north in the overworld; the test only uses its own band, X 4096..4159, Y 98..112, Z 0..15, which is generated,
// force-loaded and cleared first - other tests use other bands of the same server):
//   Engine Test Stand, two MV energy hatches (= HV, GTM's rule)   controller (4104, 100, 1)   the MV thruster cluster (overclocked
//                                                                                             to HV) and the HV motor static fire
//   Composite Autoclave, one HV energy hatch                      controller (4120, 102, 1)   a composite overwrapped tank and a pair
//                                                                                             of ablative heat shield tiles
// Every machine runs its scenarios one after the other (buses, hatches and the recipe logic are reset between them), is checked every
// STEP ticks and its energy hatches are refilled every tick. var + function everywhere (this Rhino throws "redeclaration of var" for
// const/let inside functions that run more than once). No setTimeout: a server-tick handler drives the steps.
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'launch_road'
  var STEP = 10
  var FORM_TIMEOUT = 300

  // The command only leaves a request in `global` (it survives script reloads) and the tick handler starts the test once these
  // scripts have been loaded for QUIET_MS (a datapack reload right after the server starts would lose a running test).
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestLaunchRoadRequest'

  var BAND = { x0: 4096, x1: 4159, y0: 98, y1: 112, z0: 0, z1: 15 }

  var MV_PARTS = {
    energy_input: 'gtceu:mv_energy_input_hatch',
    input_bus: 'gtceu:mv_input_bus',
    output_bus: 'gtceu:mv_output_bus',
    input_hatch: 'gtceu:mv_input_hatch',
    output_hatch: 'gtceu:mv_output_hatch'
  }
  var HV_PARTS = {
    energy_input: 'gtceu:hv_energy_input_hatch',
    input_bus: 'gtceu:hv_input_bus',
    output_bus: 'gtceu:hv_output_bus',
    input_hatch: 'gtceu:hv_input_hatch',
    output_hatch: 'gtceu:hv_output_hatch'
  }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var STAND = 'gtceu:engine_test_stand'
  var AUTOCLAVE = 'gtceu:composite_autoclave'
  var THRUSTER = 'gtceu:power_thruster'
  var QUALIFIED = 'grindless:qualified_power_thruster'
  var UNTESTED = 'grindless:untested_rocket_motor'
  var TILE = 'grindless:ablative_heat_shield_tile'
  var COPV = 'grindless:composite_overwrapped_tank'
  var MOTOR = 'gcyr:basic_rocket_motor'
  var TANK = 'gcyr:basic_fuel_tank'
  var CHIP = 'gcyr:id_chip'
  var RP1 = 'gtceu:rp_1_rocket_fuel'
  var DIESEL = 'gtceu:diesel'
  var O2 = 'gtceu:oxygen'
  var CO2 = 'gtceu:carbon_dioxide'
  var WATER = 'minecraft:water'
  var ROCKET_FUEL = 'gtceu:rocket_fuel'
  var EPOXY = 'gtceu:epoxy'
  var N2 = 'gtceu:nitrogen'

  var S = null
  var metaMachineClass = null
  var classes = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 900)
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

  function recipeExists(id) {
    return S.server.getRecipeManager().byKey(rl(id)).isPresent()
  }

  function recipesOf(typeId) {
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    if (!type) return []
    return asArray(S.server.getRecipeManager().getAllRecipesFor(type))
  }

  // the item ids a GT recipe gives (this KubeJS hides Ingredient.getItems(); its own getItemIds() works on every ingredient)
  function gtOutputIds(recipe) {
    var ic = lazy().ItemCap
    var out = []
    asArray(recipe.getOutputContents(ic)).forEach(function (c) {
      try {
        asArray(ic.of(c.content).getItemIds()).forEach(function (id) { out.push(String(id)) })
      } catch (e) { /* not an item ingredient */ }
    })
    return out
  }

  function fuelThruster() {
    return Fluid.exists(RP1) ? RP1 : DIESEL
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var G = global.grindless || {}
    var LR = G.launchRoad || null

    var items = [QUALIFIED, UNTESTED, TILE, COPV]
    var missingItems = items.filter(function (id) { return !Item.exists(id) })
    var machines = [STAND, AUTOCLAVE]
    var missingMachines = machines.filter(function (id) { return !GTRegistries.MACHINES.get(rl(id)) })
    var described = machines.filter(function (id) { return !!(G.patterns && G.patterns.describe(id)) })
    check(SCOPE, 'registry', missingItems.length === 0 && missingMachines.length === 0 && described.length === 2 && !!LR &&
      !!LR.testStand && !!LR.autoclave && !!LR.recipes && !!LR.gcyr,
      'items=' + (items.length - missingItems.length) + '/' + items.length + ' machines=' + (machines.length - missingMachines.length) + '/2' +
      ' described=' + described.length + '/2 shared=' + (!!LR) +
      (missingItems.length > 0 ? ' missing items=' + missingItems.join(',') : '') +
      (missingMachines.length > 0 ? ' missing machines=' + missingMachines.join(',') : ''))

    var ic = lazy().ItemCap
    var fc = lazy().FluidCap
    var fire = GTRegistries.RECIPE_TYPES.get(rl('gtceu:static_fire'))
    var cure = GTRegistries.RECIPE_TYPES.get(rl('gtceu:composite_curing'))
    var io = function (t) {
      return t ? [t.getMaxInputs(ic), t.getMaxOutputs(ic), t.getMaxInputs(fc), t.getMaxOutputs(fc)].join(',') : 'missing'
    }
    check(SCOPE, 'recipe_types', io(fire) === '1,1,2,2' && io(cure) === '2,1,2,0',
      'static_fire items in/out, fluids in/out=' + io(fire) + ' composite_curing=' + io(cure))

    var ours = ['grindless:static_fire/power_thrusters', 'grindless:static_fire/gcyr/basic_rocket_motor',
      'grindless:composite_curing/ablative_heat_shield_tile', 'grindless:composite_curing/composite_overwrapped_tank',
      'grindless:assembler/gcyr/untested_rocket_motor', 'grindless:assembler/gcyr/basic_fuel_tank']
    var missingOurs = ours.filter(function (id) { return !recipeExists(id) })
    check(SCOPE, 'recipes', missingOurs.length === 0,
      'count=' + (ours.length - missingOurs.length) + '/' + ours.length + ' static_fire recipes=' + recipesOf('gtceu:static_fire').length +
      ' composite_curing recipes=' + recipesOf('gtceu:composite_curing').length + ' thruster fuel=' + fuelThruster() +
      (missingOurs.length > 0 ? ' missing=' + missingOurs.join(',') : ''))

    var ctrls = ['grindless:assembler/engine_test_stand', 'grindless:assembler/composite_autoclave']
    var missingCtrls = ctrls.filter(function (id) { return !recipeExists(id) })
    check(SCOPE, 'controllers', missingCtrls.length === 0, ctrls.join(', ') + (missingCtrls.length > 0 ? ' missing=' + missingCtrls.join(',') : ''))

    var gone = ['gcyr:assembler/basic_rocket_motor', 'gcyr:assembler/basic_fuel_tank']
    var stillThere = gone.filter(function (id) { return recipeExists(id) })
    check(SCOPE, 'gcyr_replaced', stillThere.length === 0,
      'removed: ' + gone.join(', ') + (stillThere.length > 0 ? ' still present=' + stillThere.join(',') : ''))

    // integration/gcyr.js (moon-proto) and GCYR's other rocket parts stay as they are
    var kept = ['grindless:gcyr/rocket_scanner', 'gcyr:assembler/launch_pad', 'gcyr:assembler/seat', 'grindless:assembler/gcyr/space_fabric']
    var lost = kept.filter(function (id) { return !recipeExists(id) })
    check(SCOPE, 'gcyr_untouched', lost.length === 0, kept.join(', ') + (lost.length > 0 ? ' missing=' + lost.join(',') : ''))

    // the motor only comes out of the static fire; the tank only out of our assembler recipe
    var motorSources = []
    var tankSources = []
    recipesOf('gtceu:assembler').concat(recipesOf('gtceu:static_fire')).forEach(function (r) {
      var outs = gtOutputIds(r)
      if (outs.indexOf(MOTOR) >= 0) motorSources.push(String(r.id))
      if (outs.indexOf(TANK) >= 0) tankSources.push(String(r.id))
    })
    check(SCOPE, 'motor_sources', motorSources.length === 1 && motorSources[0] === 'grindless:static_fire/gcyr/basic_rocket_motor',
      'assembler and static fire recipes giving ' + MOTOR + ': ' + (motorSources.join(', ') || 'none'))
    check(SCOPE, 'tank_sources', tankSources.length === 1 && tankSources[0] === 'grindless:assembler/gcyr/basic_fuel_tank',
      'assembler recipes giving ' + TANK + ': ' + (tankSources.join(', ') || 'none'))

    // the landing-site chart of the observatory: wired into the ID chip when it is registered, GCYR's chip otherwise
    var chart = LR && LR.gcyr ? LR.gcyr.chart : '?'
    if (Item.exists(chart)) {
      check(SCOPE, 'id_chip', recipeExists('grindless:gcyr/id_chip') && !recipeExists('gcyr:shapeless/id_chip'),
        'chart ' + chart + ' registered: grindless:gcyr/id_chip=' + recipeExists('grindless:gcyr/id_chip') +
        ' gcyr:shapeless/id_chip removed=' + !recipeExists('gcyr:shapeless/id_chip'))
      // the chart stays in the crafting grid: the loaded recipe carries KubeJS's keep action, and its filter takes the chart and
      // nothing else (KubeJS's ShapelessKubeJSRecipe.getRemainingItems applies it)
      var keepOk = false
      var keepDetail = ''
      try {
        var chip = S.server.getRecipeManager().byKey(rl('grindless:gcyr/id_chip')).get()
        var list = typeof chip.getIngredientActions === 'function' ? chip.getIngredientActions() : chip['kjs$getIngredientActions']()
        var actions = asArray(list)
        var types = actions.map(function (a) { return String(a.getType()) })
        var keepsChart = actions.some(function (a) { return /keep/i.test(String(a.getType())) && a.checkFilter(0, Item.of(chart)) })
        var keepsPlate = actions.some(function (a) { return a.checkFilter(0, Item.of('gtceu:polyethylene_plate')) })
        keepOk = keepsChart && !keepsPlate
        keepDetail = 'recipe class=' + chip.getClass().getSimpleName() + ' actions=[' + types.join(',') + '] keeps the chart=' + keepsChart +
          ' keeps the polyethylene plate=' + keepsPlate
      } catch (e) {
        keepDetail = 'exception: ' + e
      }
      check(SCOPE, 'id_chip_keeps_chart', keepOk, keepDetail)
    } else {
      check(SCOPE, 'id_chip', recipeExists('gcyr:shapeless/id_chip') && !recipeExists('grindless:gcyr/id_chip'),
        'chart ' + chart + ' not registered yet (observatory): ' + CHIP + ' keeps GCYR\'s recipe=' + recipeExists('gcyr:shapeless/id_chip'))
    }
  }

  // ---------------------------------------------------------------- structures (same technique as gg_test_hv_multis.js)

  function simpleBlock(sym, machineId, partBlocks) {
    switch (sym.kind) {
      case 'blocks':
        return { id: sym.blocks[0] }
      case 'frames':
        return { id: 'gtceu:' + sym.materials[0] + '_frame' }
      case 'part':
        if (!partBlocks[sym.ability]) throw new Error('the test does not know the part ability ' + sym.ability)
        return { id: partBlocks[sym.ability], ability: sym.ability }
      case 'controller':
        return { id: machineId, controller: true }
      case 'air':
      case 'any':
        return null
      default:
        throw new Error('unsupported symbol kind ' + sym.kind)
    }
  }

  // a "casing OR parts" cell: the parts the limits ask for (or the amount the spec says) are spread evenly over the cells, the
  // rest is the plain block
  function assignOneOf(sym, list, machineId, counts, partBlocks) {
    var filler = null
    var parts = []
    sym.options.forEach(function (o) {
      if (o.kind === 'part') {
        var lim = o.limits || {}
        var need = lim.exact != null ? lim.exact : (lim.min != null ? lim.min : 0)
        if (counts && counts[o.ability] != null) need = counts[o.ability]
        for (var k = 0; k < need; k++) parts.push(simpleBlock(o, machineId, partBlocks))
      } else if (filler === null) {
        filler = simpleBlock(o, machineId, partBlocks)
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
  function planOf(machineId, cx, cy, cz, counts, partBlocks) {
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
        assignOneOf(sym, list, machineId, counts, partBlocks)
      } else {
        var b = simpleBlock(sym, machineId, partBlocks)
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

  function inBand(c) {
    return c.x >= BAND.x0 && c.x <= BAND.x1 && c.y >= BAND.y0 && c.y <= BAND.y1 && c.z >= BAND.z0 && c.z <= BAND.z1
  }

  function setBlock(c) {
    return S.server.runCommandSilent('setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
  }

  // everything but the controller first, the controller last
  function place(plan, scope) {
    var outside = plan.cells.filter(function (c) { return !inBand(c) })
    if (outside.length > 0) {
      check(scope, 'PLACED', false, outside.length + ' cells outside this test\'s band, e.g. ' + outside[0].x + ',' + outside[0].y + ',' + outside[0].z)
      return false
    }
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
    check(scope, 'PLACED', failed.length === 0 && wrong.length === 0,
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

  // the structure preview EMI / JEI draw: the controller and every kind of part are in it
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
    var missing = []
    m.spec.previewParts.forEach(function (ability) {
      var suffix = m.spec.partBlocks[ability].replace(/^gtceu:[a-z]+_/, '')
      var found = Object.keys(counts).some(function (bid) { return bid.indexOf('_' + suffix) > 0 })
      if (!found) missing.push(ability)
    })
    if (!counts[m.id]) missing.push('controller')
    check(m.scope, 'PREVIEW', shapes.length >= 1 && missing.length === 0,
      'shapes=' + shapes.length + ' blocks=' + total + ' (placed structure: ' + m.plan.blocks + ')' +
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

  function findParts(ctrl, partBlocks) {
    var P = { energy: [], inBus: null, outBuses: [], inHatches: [], outHatches: [] }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === partBlocks.energy_input) P.energy.push(p)
      else if (pid === partBlocks.input_bus) P.inBus = p
      else if (pid === partBlocks.output_bus) P.outBuses.push(p)
      else if (pid === partBlocks.input_hatch) P.inHatches.push(p)
      else if (pid === partBlocks.output_hatch) P.outHatches.push(p)
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

  function emptyHatches(P) {
    P.inHatches.concat(P.outHatches).forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
  }

  function resetMachine(m, ctrl) {
    var P = m.parts
    clearInventory(P.inBus.getInventory())
    P.outBuses.forEach(function (b) { clearInventory(b.getInventory()) })
    emptyHatches(P)
    ctrl.getRecipeLogic().resetRecipeLogic()
  }

  // fluids go into the input hatches in order: the first fluid of a scenario in the first hatch, and so on
  function putFluids(P, fluids) {
    if (fluids.length > P.inHatches.length) {
      throw new Error('the scenario needs ' + fluids.length + ' fluids but the machine has ' + P.inHatches.length + ' input hatch(es)')
    }
    fluids.forEach(function (f, i) {
      P.inHatches[i].tank.setFluidInTank(0, Fluid.of(f.id, f.mb).getFluidStack())
    })
  }

  function fluidText(fluids) {
    return fluids.length === 0 ? 'none' : fluids.map(function (f) { return f.id + ' ' + f.mb + ' mB' }).join(' + ')
  }

  function fillScenario(m, sc) {
    var P = m.parts
    var inv = P.inBus.getInventory()
    sc.items.forEach(function (input, slot) {
      var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
    })
    putFluids(P, sc.fluids)
    note(m.scope, 'INPUT_' + sc.name, 'bus=[' + itemSummary(readBus(P.inBus)) + '] fluids=' + fluidText(sc.fluids) +
      ' energy hatches=' + P.energy.length + ' input hatches=' + P.inHatches.length + ' output hatches=' + P.outHatches.length)
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
      out.push('maxVoltage=' + ctrl.getMaxVoltage())
      var fails = asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
      if (fails.length > 0) out.push('failureReasons=[' + fails.join(' ; ') + ']')
    } catch (e) {
      out.push('diagnose threw ' + e)
    }
    return out.join(' ')
  }

  // the output buses, every output hatch, what is left in the input hatches and the input bus, the recipes seen
  function collect(m, sc) {
    var P = m.parts
    var counts = {}
    P.outBuses.forEach(function (b) {
      var c = readBus(b)
      Object.keys(c).forEach(function (id) { counts[id] = (counts[id] || 0) + c[id] })
    })
    var fluidsOut = {}
    P.outHatches.forEach(function (h) {
      var t = tankInfo(h)
      if (t.id !== 'none') fluidsOut[t.id] = (fluidsOut[t.id] || 0) + t.amount
    })
    var fluidsIn = {}
    P.inHatches.forEach(function (h) {
      var t = tankInfo(h)
      if (t.id !== 'none') fluidsIn[t.id] = (fluidsIn[t.id] || 0) + t.amount
    })
    return { items: counts, fluidsOut: fluidsOut, fluidsIn: fluidsIn, leftover: readBus(P.inBus), seen: m.seen, sc: sc }
  }

  // how much of a scenario fluid has been used
  function used(r, fluidId) {
    var start = 0
    r.sc.fluids.forEach(function (f) { if (f.id === fluidId) start += f.mb })
    return start - (r.fluidsIn[fluidId] || 0)
  }

  function fluidSummary(map) {
    return Object.keys(map).sort().map(function (id) { return id + ' ' + map[id] }).join(', ') || 'none'
  }

  // one generic verdict: exactly the wanted items in the output buses, the wanted fluids out and in, nothing left in the input bus
  function expectRun(r, want) {
    var problems = []
    Object.keys(want.items).forEach(function (id) {
      if ((r.items[id] || 0) !== want.items[id]) problems.push(id + ' x' + (r.items[id] || 0) + ' (want ' + want.items[id] + ')')
    })
    Object.keys(r.items).forEach(function (id) {
      if (want.items[id] === undefined) problems.push('unexpected ' + id + ' x' + r.items[id])
    })
    Object.keys(want.fluidsOut).forEach(function (id) {
      if ((r.fluidsOut[id] || 0) !== want.fluidsOut[id]) problems.push(id + ' out ' + (r.fluidsOut[id] || 0) + ' (want ' + want.fluidsOut[id] + ')')
    })
    Object.keys(want.used).forEach(function (id) {
      if (used(r, id) !== want.used[id]) problems.push(id + ' used ' + used(r, id) + ' (want ' + want.used[id] + ')')
    })
    if (Object.keys(r.leftover).length > 0) problems.push('left in the input bus: ' + itemSummary(r.leftover))
    if (want.recipe && r.seen[want.recipe] !== true) problems.push('recipe ' + want.recipe + ' not seen (seen: ' + (Object.keys(r.seen).join(',') || 'none') + ')')
    return {
      ok: problems.length === 0,
      detail: 'out=[' + itemSummary(r.items) + '] fluids out=[' + fluidSummary(r.fluidsOut) + '] left in hatches=[' + fluidSummary(r.fluidsIn) + ']' +
        (problems.length > 0 ? ' problems: ' + problems.join('; ') : '')
    }
  }

  // ---------------------------------------------------------------- scenarios

  function standScenarios() {
    var fuel = fuelThruster()
    return [
      {
        // the MV recipe (120 EU/t, 300 t), overclocked once by the two MV hatches (HV): 480 EU/t, 150 t
        name: 'thruster_cluster', ticks: 360,
        items: [{ id: THRUSTER, n: 4 }],
        fluids: [{ id: fuel, mb: 200 }, { id: O2, mb: 300 }],
        verify: function (r) {
          var want = { items: {}, fluidsOut: {}, used: {}, recipe: 'grindless:static_fire/power_thrusters' }
          want.items[QUALIFIED] = 4
          want.fluidsOut[CO2] = 200
          want.fluidsOut[WATER] = 200
          want.used[fuel] = 200
          want.used[O2] = 300
          return expectRun(r, want)
        }
      },
      {
        // the HV recipe (480 EU/t, 400 t): two MV hatches are HV, no overclock
        name: 'motor_static_fire', ticks: 520,
        items: [{ id: UNTESTED, n: 1 }],
        fluids: [{ id: ROCKET_FUEL, mb: 500 }],
        verify: function (r) {
          var want = { items: {}, fluidsOut: {}, used: {}, recipe: 'grindless:static_fire/gcyr/basic_rocket_motor' }
          want.items[MOTOR] = 1
          want.fluidsOut[CO2] = 250
          want.fluidsOut[WATER] = 500
          want.used[ROCKET_FUEL] = 500
          return expectRun(r, want)
        }
      }
    ]
  }

  function autoclaveScenarios() {
    return [
      {
        name: 'overwrapped_tank', ticks: 420,
        items: [{ id: 'gtceu:stainless_steel_drum', n: 1 }, { id: 'gcyr:para_aramid_foil', n: 4 }],
        fluids: [{ id: EPOXY, mb: 250 }, { id: N2, mb: 500 }],
        verify: function (r) {
          var want = { items: {}, fluidsOut: {}, used: {}, recipe: 'grindless:composite_curing/composite_overwrapped_tank' }
          want.items[COPV] = 1
          want.used[EPOXY] = 250
          want.used[N2] = 500
          return expectRun(r, want)
        }
      },
      {
        name: 'heat_shield_tiles', ticks: 420,
        items: [{ id: 'gcyr:fiberglass_foil', n: 4 }],
        fluids: [{ id: EPOXY, mb: 250 }, { id: N2, mb: 500 }],
        verify: function (r) {
          var want = { items: {}, fluidsOut: {}, used: {}, recipe: 'grindless:composite_curing/ablative_heat_shield_tile' }
          want.items[TILE] = 2
          want.used[EPOXY] = 250
          want.used[N2] = 500
          return expectRun(r, want)
        }
      }
    ]
  }

  var SPECS = [
    { id: STAND, x: 4104, y: 100, z: 1, counts: { energy_input: 2, input_hatch: 2 }, partBlocks: MV_PARTS, scenarios: standScenarios,
      previewParts: ['energy_input', 'input_bus', 'output_bus', 'input_hatch', 'output_hatch'] },
    { id: AUTOCLAVE, x: 4120, y: 102, z: 1, counts: { energy_input: 1 }, partBlocks: HV_PARTS, scenarios: autoclaveScenarios,
      previewParts: ['energy_input', 'input_bus', 'output_bus', 'input_hatch'] }
  ]

  // this test's own band of the overworld: X 4096..4159, Y 98..112, Z 0..15 (chunks 256..259,0)
  function prepareWorld() {
    for (var cx = 256; cx < 260; cx++) S.level.getChunk(cx, 0)
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    note(SCOPE, 'AREA', 'chunks 256..259,0 (X 4096..4159) generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function startMachine(spec) {
    var m = { id: spec.id, scope: spec.id, spec: spec, phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false,
      parts: null, scenarios: null, sc: -1, scStart: 0, seen: {}, stateNoted: false }
    S.machines.push(m)
    try {
      var def = GTRegistries.MACHINES.get(rl(spec.id))
      if (def === null || def === undefined) {
        check(m.scope, 'PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      // the pattern is NOT built here: the structure is placed from the registered description and GTM builds the pattern
      // itself, lazily, when the controller first checks its structure (what happens in a real world)
      var desc = global.grindless.patterns.describe(spec.id)
      m.builtBefore = !!(desc && desc.built)
      m.def = def
      m.plan = planOf(spec.id, spec.x, spec.y, spec.z, spec.counts, spec.partBlocks)
      check(m.scope, 'DESCRIPTION', true, 'registered at startup, ' + m.plan.blocks + ' blocks, ' + m.plan.size +
        ', pattern already built before placing: ' + m.builtBefore)
      if (!place(m.plan, m.scope)) {
        m.phase = 'done'
        return
      }
      m.ctrl = m.plan.ctrl
      m.t0 = S.t
    } catch (e) {
      check(m.scope, 'DESCRIPTION', false, 'exception while describing/placing: ' + e)
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
      check(m.scope, 'FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }

    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        check(m.scope, 'FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') +
          'parts=[' + partIds(ctrl).join(' ') + '] maxVoltage=' + ctrl.getMaxVoltage())
        check(m.scope, 'PATTERN', global.grindless.patterns.describe(m.id).built,
          'built by GTM itself on the first structure check (already built before placing: ' + m.builtBefore + ')')
        try {
          previewCheck(m)
        } catch (e3) {
          check(m.scope, 'PREVIEW', false, 'exception: ' + e3)
        }
        m.parts = findParts(ctrl, m.spec.partBlocks)
        if (m.parts.inBus === null || m.parts.outBuses.length === 0 || m.parts.energy.length === 0 || m.parts.inHatches.length === 0) {
          check(m.scope, 'PARTS', false, 'missing parts: input bus=' + (m.parts.inBus !== null) + ' output buses=' + m.parts.outBuses.length +
            ' energy hatches=' + m.parts.energy.length + ' input hatches=' + m.parts.inHatches.length)
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
          check(m.scope, 'FORMED', false, 'not formed after ' + waited + ' ticks and GTM never built the pattern')
          m.phase = 'done'
          return
        }
        var syncOk = ctrl.checkPatternWithLock()
        if (!syncOk) {
          check(m.scope, 'FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(m, ctrl))
          m.phase = 'done'
          return
        }
        check(m.scope, 'FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
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
        note(m.scope, 'STATE_' + sc.name, 'after ' + running + ' ticks: ' + recipeState(ctrl) + ' ' + diagnose(ctrl))
      }
      if (running >= sc.ticks) {
        var verdict = null
        try {
          verdict = sc.verify(collect(m, sc))
        } catch (e) {
          verdict = { ok: false, detail: 'exception while checking: ' + e }
        }
        check(m.scope, 'PROCESS_' + sc.name, verdict.ok, verdict.detail + ' / ' + recipeState(ctrl))
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

  function step(elapsed) {
    try {
      S.t = elapsed
      S.machines.forEach(function (m) {
        if (m.phase === 'done') return
        try {
          advance(m)
        } catch (e) {
          check(m.scope, 'STEP', false, 'exception in ' + m.phase + ': ' + e)
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

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_launch_road', function (event) {
    if (S !== null && !S.finished) {
      note(SCOPE, 'run', 'a previous gg_test_launch_road run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
