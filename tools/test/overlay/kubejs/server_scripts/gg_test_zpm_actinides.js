// priority: -10424
// Gregtech Grindless - smoke test of ZPM's Waste Retrieval Plant and Actinide Partitioning Plant (package ZPM-A4; TEST-ONLY overlay:
// copied over the instance on the test PC, never shipped with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -Commands 'kubejs custom_command gg_test_zpm_actinides' `
//     -WaitForLog 'GGTEST\|zpm_actinides\|DONE@@180'
//
// What it proves:
//   zpm_actinides|registration  both recipe types with their IO sizes, both machines, the two GT materials, the F1 ids
//   zpm_actinides|recipes       the five recipes plus the lanthanide nitrate reactor recipe under their final ids with the script's duration,
//                               EU/t and ids; the crafting recipes
//   zpm_actinides|gt_waste      NOTE: the count of other namespaces' recipes touching gtnn:radioactive_waste (GT-- has none; the static test
//                               proves none is removed)
//   zpm_actinides|LOOKUP        GTM's lookup reaches each recipe of both types from its inputs (one recipe per lookup path)
//   zpm_actinides|DESCRIPTION / PLACED / FORMED / PATTERN / PARTS   the retrieval plant placed block by block and formed by itself
//   zpm_actinides|PROCESS_retrieve  circuit 1 consumes 4 waste + 1,000 mB nitric acid and gives the exact outputs
//   zpm_actinides|DONE          last line
//
// TEST AREA: ONLY the band X 19968-20031, Y 98-112, Z 0-63 (force-loaded and cleared); the plant faces north with its controller at
// (19990, 100, 40). var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run twice).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'zpm_actinides'
  var STEP = 10
  var FORM_TIMEOUT = 600
  var BAND = { x0: 19968, x1: 20031, y0: 98, y1: 112, z0: 0, z1: 63 }
  var CONTROLLER = { x: 19990, y: 100, z: 40 }

  // the datapack reload a couple of seconds after the server is up would lose a running test: the command only leaves a request
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestZpmActinidesRequest'

  var MACHINE_ID = 'gtceu:waste_retrieval_plant'
  var TYPE_ID = 'gtceu:waste_retrieval'

  var PART_BLOCKS = {
    energy_input: 'gtceu:zpm_energy_input_hatch',
    input_bus: 'gtceu:zpm_input_bus',
    output_bus: 'gtceu:zpm_output_bus',
    input_hatch: 'gtceu:zpm_input_hatch',
    output_hatch: 'gtceu:zpm_output_hatch'
  }
  var TEST_PARTS = { energy_input: 1, input_bus: 1, output_bus: 1, input_hatch: 3, output_hatch: 2 }
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var S = null
  var metaMachineClass = null
  var classes = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = TAG + SCOPE + '|' + name + '|' + status
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

  function lazy() {
    if (classes === null) {
      classes = {
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
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

  function short(id) {
    return String(id).replace(/^gtceu:/, '')
  }

  function AC() {
    return global.grindless.actinides
  }

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  function recipeCount(typeId) {
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    return type ? S.server.getRecipeManager().getAllRecipesFor(type).size() : -1
  }

  // the ids a live GT recipe takes and gives, read through RecipeHelper (the ingredient getters are not reachable from Rhino)
  function liveIO(r) {
    var H = lazy().Helper
    function items(list) {
      return asArray(list).map(function (st) { return { id: String(st.getId()), n: Number(st.getCount()) } })
    }
    function fluids(list) {
      return asArray(list).map(function (st) { return { id: fluidName(st), n: Number(st.getAmount()) } })
    }
    return {
      itemsIn: items(H.getInputItems(r)).filter(function (x) { return x.id !== 'gtceu:programmed_circuit' }),
      fluidsIn: fluids(H.getInputFluids(r)),
      itemsOut: items(H.getOutputItems(r)),
      fluidsOut: fluids(H.getOutputFluids(r))
    }
  }

  function sameIds(have, want) {
    var a = have.map(function (x) { return x.id }).sort().join(',')
    var b = want.map(function (x) { return x.id }).sort().join(',')
    return a === b ? null : 'ids ' + a + ', wanted ' + b
  }

  function compareIO(label, lio, want, problems) {
    ;['itemsIn', 'fluidsIn', 'itemsOut', 'fluidsOut'].forEach(function (k) {
      var d = sameIds(lio[k], want[k])
      if (d !== null) problems.push(label + ' ' + k + ' ' + d)
    })
  }

  // ---------------------------------------------------------------- static checks

  function checkType(label, typeId, machineId, io) {
    var ic = lazy().ItemCap
    var fc = lazy().FluidCap
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    var machine = GTRegistries.MACHINES.get(rl(machineId))
    var sizes = type ? [type.getMaxInputs(ic), type.getMaxOutputs(ic), type.getMaxInputs(fc), type.getMaxOutputs(fc)] : []
    var ok = !!type && sizes.join(',') === [io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut].join(',') && !!machine
    check('registration_' + label, ok, typeId + '=' + (type ? 'registered (' + sizes.join('/') + ')' : 'missing') + ' machine=' + (machine ? 'registered' : 'missing'))
  }

  function checkRecipes(label, plans, typeId) {
    var problems = []
    var notes = []
    plans.forEach(function (p) {
      var live = liveRecipe(p.recipeId)
      if (live === null) {
        problems.push(p.recipeId + ' not in the recipe manager')
        return
      }
      var eut = Number(lazy().Helper.getRealEUt(live).getTotalEU())
      if (Number(live.duration) !== p.duration || eut !== p.eut) {
        problems.push(p.name + ' is ' + live.duration + ' t x ' + eut + ' EU/t, the script wanted ' + p.duration + ' x ' + p.eut)
      }
      var lio = liveIO(live)
      compareIO(p.name, lio, {
        itemsIn: p.itemsIn.concat(p.chancedIn),
        fluidsIn: p.fluidsIn.concat(p.notConsumed),
        itemsOut: p.itemsOut.concat(p.chancedOut),
        fluidsOut: p.fluidsOut
      }, problems)
      notes.push(p.recipeId + ' ' + live.duration + ' t x ' + eut + ' EU/t')
    })
    var have = recipeCount(typeId)
    check('recipes_' + label, have === plans.length && problems.length === 0, typeId + '=' + have + ' ; ' + notes.join(' ; ') +
      (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : ''))
  }

  function staticChecks() {
    checkType('retrieval', TYPE_ID, MACHINE_ID, AC().maxIO.retrieval)
    checkType('partition', 'gtceu:actinide_partitioning', 'gtceu:actinide_partitioning_plant', AC().maxIO.partition)

    var problems = []
    ;['gtceu:minor_actinide_strip', 'gtceu:lanthanide_nitrate', 'gtceu:actinide_raffinate'].forEach(function (id) {
      if (!Fluid.exists(id)) problems.push('fluid ' + id + ' missing')
    })
    ;['grindless:radium_capsule', 'grindless:curium_oxide', 'grindless:synroc_block', 'gtnn:radioactive_waste', 'gtceu:radium_dust', 'gtceu:americium_dust'].forEach(function (id) {
      if (!Item.exists(id)) problems.push('item ' + id + ' missing')
    })
    ;['minor_actinide_strip', 'lanthanide_nitrate'].forEach(function (name) {
      var mat = GTMaterials.get(name)
      if (mat === null || mat.isNull()) problems.push('material ' + name + ' missing')
      else if (!mat.hasFlag(GTMaterialFlags.DISABLE_DECOMPOSITION)) problems.push(name + ' can be decomposed')
    })
    check('materials', problems.length === 0, problems.join(' ; ') || 'strip and lanthanide nitrate fluids, F1 ids, waste and radium and americium dusts exist')

    checkRecipes('retrieval', AC().retrieval, TYPE_ID)
    checkRecipes('partition', AC().partition, 'gtceu:actinide_partitioning')
    if (AC().skipped.length > 0) check('skipped', false, JSON.stringify(AC().skipped))
    if (AC().clashes.length > 0) check('clashes', false, AC().clashes.join(', '))

    // the lanthanide nitrate's destination
    var re = liveRecipe(AC().reactor.recipeId)
    var reProblems = []
    if (re === null) {
      reProblems.push(AC().reactor.recipeId + ' missing')
    } else {
      var rio = liveIO(re)
      compareIO('reactor', rio, { itemsIn: [], fluidsIn: AC().reactor.fluidsIn, itemsOut: [], fluidsOut: AC().reactor.fluidsOut }, reProblems)
    }
    check('lanthanide_route', reProblems.length === 0, reProblems.join(' ; ') || AC().reactor.recipeId + ' lanthanide nitrate + HCl -> rare earth chloride solution + nitric acid')

    // crafting
    var craftProblems = []
    ;[[AC().crafting.retrieval, MACHINE_ID], [AC().crafting.partition, 'gtceu:actinide_partitioning_plant']].forEach(function (pair) {
      var craft = liveRecipe(pair[0])
      if (craft === null) {
        craftProblems.push(pair[0] + ' missing')
        return
      }
      var res = craft.getResultItem(S.server.registryAccess())
      if (String(res.getId()) !== pair[1] || Number(res.getCount()) !== 1) craftProblems.push(pair[0] + ' gives ' + res.getId() + ' x' + res.getCount())
    })
    check('crafting', craftProblems.length === 0, craftProblems.join(' ; ') || 'both controllers craftable')

    // GT--'s own waste recipes: still loaded, none of ours under another namespace
    var all = asArray(S.server.getRecipeManager().getRecipes())
    var waste = []
    all.forEach(function (r) {
      var id = String(r.getId())
      if (id.indexOf('grindless:') === 0) return
      try {
        if (r.getClass().getName().indexOf('GTRecipe') < 0) return
        var io = liveIO(r)
        if (io.itemsIn.some(function (x) { return x.id === 'gtnn:radioactive_waste' }) || io.itemsOut.some(function (x) { return x.id === 'gtnn:radioactive_waste' })) waste.push(id)
      } catch (e) { /* not an item recipe */ }
    })
    // GT-- 7.5.3 has no GT recipe of its own for the waste (only ours make it), so there is nothing to keep: a count, not a pass condition.
    // That none is removed is the static test's (no event.remove in zpm/actinides.js).
    note('gt_waste', 'recipes of other namespaces touching gtnn:radioactive_waste loaded=' + waste.length + ' ' + waste.slice(0, 4).join(','))
  }

  // ---------------------------------------------------------------- structure (same technique as gg_test_zpm_europium.js)

  function simpleBlock(sym) {
    switch (sym.kind) {
      case 'blocks':
        return { id: sym.blocks[0] }
      case 'frames':
        return { id: 'gtceu:' + sym.materials[0] + '_frame' }
      case 'part':
        if (!PART_BLOCKS[sym.ability]) throw new Error('the test does not know the part ability ' + sym.ability)
        return { id: PART_BLOCKS[sym.ability], ability: sym.ability }
      case 'controller':
        return { id: MACHINE_ID, controller: true }
      case 'air':
      case 'any':
        return null
      default:
        throw new Error('unsupported symbol kind ' + sym.kind)
    }
  }

  function assignOneOf(sym, list) {
    var filler = null
    var parts = []
    sym.options.forEach(function (o) {
      if (o.kind === 'part') {
        var lim = o.limits || {}
        var n = TEST_PARTS[o.ability]
        if (n === undefined) n = lim.exact != null ? lim.exact : (lim.min != null ? lim.min : 0)
        if ((lim.exact != null && n !== lim.exact) || (lim.min != null && n < lim.min) || (lim.max != null && n > lim.max)) {
          throw new Error('the test wants ' + n + ' ' + o.ability + ' but the pattern allows ' + JSON.stringify(lim))
        }
        for (var k = 0; k < n; k++) parts.push(simpleBlock(o))
      } else if (filler === null) {
        filler = simpleBlock(o)
      }
    })
    if (filler === null) throw new Error('a oneOf symbol has no plain block option')
    if (parts.length > list.length) throw new Error('more parts (' + parts.length + ') than cells (' + list.length + ')')
    list.forEach(function (c) { c.block = filler })
    parts.forEach(function (p, i) {
      list[Math.floor((i + 0.5) * list.length / parts.length)].block = p
    })
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing north:
  // x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)
  function planOf(cx, cy, cz) {
    var desc = global.grindless.patterns.describe(MACHINE_ID)
    if (!desc) throw new Error('no structure description recorded for ' + MACHINE_ID)
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
        assignOneOf(sym, list)
      } else {
        var b = simpleBlock(sym)
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
      cells: placed,
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
    check('PLACED', failed.length === 0 && wrong.length === 0,
      'blocks=' + plan.blocks + ' size=' + plan.size + ' controller=' + plan.ctrl.x + ',' + plan.ctrl.y + ',' + plan.ctrl.z + ' parts=[' + parts.join(' ') + ']' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function describeError(ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = 'pattern error ' + String(err)
      try {
        var pos = err.getPos()
        text += ' at ' + pos.getX() + ',' + pos.getY() + ',' + pos.getZ() + ' found ' + blockIdAt(pos.getX(), pos.getY(), pos.getZ())
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

  function topUpEnergy(m) {
    if (m.parts === null) return
    m.parts.energy.forEach(function (p) {
      var c = p.energyContainer
      c.setEnergyStored(c.getEnergyCapacity())
    })
  }

  // an idle, freshly formed multiblock can stop ticking: wake its recipe logic after the inputs change
  function wake(ctrl) {
    try {
      ctrl.getRecipeLogic().updateTickSubscription()
    } catch (e) { /* the scenario reports what did not run */ }
  }

  function resetMachine(m, ctrl) {
    var P = m.parts
    if (P.inBus !== null) {
      clearInventory(P.inBus.getInventory())
      clearInventory(P.inBus.getCircuitInventory())
    }
    P.outBuses.forEach(function (b) { clearInventory(b.getInventory()) })
    P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    P.outHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    ctrl.getRecipeLogic().resetRecipeLogic()
  }

  function fillInputs(m, sc) {
    var P = m.parts
    var inv = P.inBus !== null ? P.inBus.getInventory() : null
    ;(sc.items || []).forEach(function (input, slot) {
      if (inv === null) throw new Error('the scenario needs an input bus but the machine has none')
      var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
    })
    if (sc.circuit) {
      // the bus circuit slot refuses insertItem (its capability IO is NONE); players set it through the GUI
      P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(sc.circuit))
    }
    ;(sc.fluids || []).forEach(function (f) {
      if (!P.inHatches[f.hatch]) throw new Error('the scenario needs input hatch ' + f.hatch + ' but the machine has ' + P.inHatches.length)
      // a FluidStack built by KubeJS: setFluidInTank ignores one built outside it
      P.inHatches[f.hatch].tank.setFluidInTank(0, Fluid.of(f.id, f.mb).getFluidStack())
    })
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

  function diagnose(ctrl) {
    var out = []
    try {
      var match = ctrl.getRecipeType().db().find(ctrl)
      if (!match) {
        out.push('lookup=none')
      } else {
        out.push('lookup=' + match.id)
        try { out.push('matchRecipe=' + lazy().Helper.matchRecipe(ctrl, match).isSuccess()) } catch (e1) { out.push('matchRecipe threw ' + e1) }
      }
      out.push('workingEnabled=' + ctrl.isWorkingEnabled())
      var fails = asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
      if (fails.length > 0) out.push('failureReasons=[' + fails.join(' ; ') + ']')
    } catch (e) {
      out.push('diagnose threw ' + e)
    }
    return out.join(' ')
  }

  function sumTanks(list) {
    var t = {}
    list.forEach(function (h) {
      if (h.id !== 'none' && h.amount > 0) t[h.id] = (t[h.id] || 0) + h.amount
    })
    return t
  }

  function collect(m) {
    var P = m.parts
    var counts = {}
    P.outBuses.forEach(function (b) {
      var c = readBus(b)
      Object.keys(c).forEach(function (id) { counts[id] = (counts[id] || 0) + c[id] })
    })
    return {
      items: counts,
      fluidIn: P.inHatches.map(tankInfo),
      fluidOut: sumTanks(P.outHatches.map(tankInfo)),
      outHatches: P.outHatches.map(tankInfo),
      leftover: P.inBus !== null ? readBus(P.inBus) : {},
      seen: m.seen
    }
  }

  function seenIds(r) {
    return Object.keys(r.seen).map(function (id) { return id + '(x' + r.seen[id] + ')' }).join(',')
  }

  // ---------------------------------------------------------------- scenarios

  // one run of the retrieve step: waste and acid used exactly, outputs exact, each output fluid in a hatch of its own
  function recipeScenario(plan) {
    var sc = { name: plan.name, ticks: plan.duration + 60, circuit: plan.circuit, items: [], fluids: [] }
    plan.itemsIn.forEach(function (x) { sc.items.push({ id: x.id, n: x.count }) })
    sc.fluids = plan.fluidsIn.concat(plan.notConsumed).map(function (f, i) { return { hatch: i, id: f.id, mb: f.amount + 300 } })
    sc.verify = function (r) {
      var problems = []
      var have = []
      var used = []
      plan.itemsOut.forEach(function (o) {
        var got = r.items[o.id] || 0
        have.push(short(o.id) + ' ' + got)
        if (got !== o.count) problems.push(o.id + ' ' + got + ', wanted ' + o.count)
      })
      Object.keys(r.items).forEach(function (id) {
        if (!plan.itemsOut.some(function (o) { return o.id === id })) problems.push('unexpected item ' + id)
      })
      plan.fluidsOut.forEach(function (f) {
        var got = r.fluidOut[f.id] || 0
        have.push(short(f.id) + ' ' + got + ' mB')
        if (got !== f.amount) problems.push(f.id + ' ' + got + ' mB, wanted ' + f.amount)
      })
      Object.keys(r.fluidOut).forEach(function (id) {
        if (!plan.fluidsOut.some(function (f) { return f.id === id })) problems.push('unexpected fluid out ' + id + ' ' + r.fluidOut[id])
      })
      plan.fluidsIn.forEach(function (f, i) {
        var spent = sc.fluids[i].mb - (r.fluidIn[i] ? r.fluidIn[i].amount : -1)
        used.push(short(f.id) + ' used ' + spent + ' of ' + f.amount)
        if (spent !== f.amount) problems.push(f.id + ' used ' + spent + ' mB, wanted ' + f.amount)
      })
      plan.itemsIn.forEach(function (x) {
        var spent = x.count - (r.leftover[x.id] || 0)
        used.push(short(x.id) + ' used ' + spent)
        if (spent !== x.count) problems.push(x.id + ' used ' + spent + ', wanted ' + x.count)
      })
      if (r.seen[plan.recipeId] === undefined) problems.push('recipe ' + plan.recipeId + ' never ran')
      var others = Object.keys(r.seen).filter(function (id) { return id !== plan.recipeId })
      if (others.length > 0) problems.push('other recipes seen ' + others.join(','))
      return {
        ok: problems.length === 0,
        detail: plan.recipeId + ' (' + plan.duration + ' t, ' + plan.eut + ' EU/t before overclock): ' + have.join(', ') + ' | ' + used.join(' ; ') +
          ' | recipes seen=[' + seenIds(r) + ']' + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '')
      }
    }
    return sc
  }

  function scenarios() {
    return [recipeScenario(AC().retrieval[0])]
  }

  // ---------------------------------------------------------------- lookup

  // every recipe GTM's lookup can reach with the inputs now in the machine (the predicate accepts everything)
  function candidateIds(ctrl) {
    var ids = []
    var it = ctrl.getRecipeType().db().iterator(ctrl, function (r) { return true })
    if (it === null || it === undefined) return ids
    var guard = 0
    while (it.hasNext() && guard < 900) {
      ids.push(String(it.next().id))
      guard++
    }
    return ids
  }

  function runLookup(m, ctrl) {
    var bad = []
    var P = m.parts
    var plans = AC().retrieval
    plans.forEach(function (plan) {
      clearInventory(P.inBus.getInventory())
      clearInventory(P.inBus.getCircuitInventory())
      P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
      fillInputs(m, {
        items: plan.itemsIn.concat(plan.chancedIn).map(function (x) { return { id: x.id, n: x.count } }),
        circuit: plan.circuit,
        fluids: plan.fluidsIn.concat(plan.notConsumed).map(function (f, i) { return { hatch: i, id: f.id, mb: f.amount } })
      })
      var ids = candidateIds(ctrl)
      if (ids.indexOf(plan.recipeId) < 0) bad.push(plan.name + ' wanted ' + plan.recipeId + ' got [' + ids.slice(0, 6).join(',') + ']')
      if (ids.length !== 1) bad.push(plan.name + ' reaches ' + ids.length + ' recipes: [' + ids.slice(0, 6).join(',') + ']')
    })
    resetMachine(m, ctrl)
    check('LOOKUP', bad.length === 0, 'cases=' + plans.length + (bad.length > 0 ? ' problems=' + bad.join('; ') : ''))
  }

  // ---------------------------------------------------------------- the machine

  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    note('AREA', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 +
      ' generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function startMachine() {
    var m = { phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false, parts: null, list: null, sc: -1, scStart: 0, seen: {}, stateNoted: false }
    S.machine = m
    try {
      if (!GTRegistries.MACHINES.get(rl(MACHINE_ID))) {
        check('PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      var desc = global.grindless.patterns.describe(MACHINE_ID)
      m.builtBefore = !!(desc && desc.built)
      m.plan = planOf(CONTROLLER.x, CONTROLLER.y, CONTROLLER.z)
      check('DESCRIPTION', true, 'registered at startup, ' + m.plan.blocks + ' blocks, ' + m.plan.size + ', pattern already built before placing: ' + m.builtBefore)
      if (!place(m.plan)) {
        m.phase = 'done'
        return
      }
      m.ctrl = m.plan.ctrl
      m.t0 = S.t
    } catch (e) {
      check('DESCRIPTION', false, 'exception while describing or placing: ' + e)
      m.phase = 'done'
    }
  }

  function observe(m, ctrl) {
    try {
      var last = ctrl.getRecipeLogic().getLastRecipe()
      if (last) {
        var id = String(last.id)
        var p = Number(last.parallels)
        if (m.seen[id] === undefined || p > m.seen[id]) m.seen[id] = p
      }
    } catch (e) { /* optional */ }
  }

  function nextScenario(m, ctrl) {
    m.sc++
    if (m.sc >= m.list.length) {
      try {
        runLookup(m, ctrl)
      } catch (e) {
        check('LOOKUP', false, 'exception: ' + e)
      }
      m.phase = 'done'
      return
    }
    var sc = m.list[m.sc]
    resetMachine(m, ctrl)
    m.seen = {}
    m.stateNoted = false
    fillInputs(m, sc)
    wake(ctrl)
    note('INPUT_' + sc.name, 'bus=[' + itemSummary(readBus(m.parts.inBus)) + '] circuit=' + (sc.circuit ? sc.circuit : 'none') +
      ' fluids=[' + (sc.fluids || []).map(function (f) { return 'hatch ' + f.hatch + ': ' + f.id + ' ' + f.mb + ' mB' }).join(' ; ') + ']')
    m.scStart = S.t
  }

  function partsProblem(P) {
    var problems = []
    if (P.energy.length !== TEST_PARTS.energy_input) problems.push('energy hatches ' + P.energy.length + ' (wanted ' + TEST_PARTS.energy_input + ')')
    if (P.inBus === null) problems.push('no input bus')
    if (P.outBuses.length !== TEST_PARTS.output_bus) problems.push('output buses ' + P.outBuses.length + ' (wanted ' + TEST_PARTS.output_bus + ')')
    if (P.inHatches.length !== TEST_PARTS.input_hatch) problems.push('input hatches ' + P.inHatches.length + ' (wanted ' + TEST_PARTS.input_hatch + ')')
    if (P.outHatches.length !== TEST_PARTS.output_hatch) problems.push('output hatches ' + P.outHatches.length + ' (wanted ' + TEST_PARTS.output_hatch + ')')
    return problems
  }

  function advance(m) {
    var ctrl = machineAt(m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check('FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }

    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        check('FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') +
          'parts=[' + partIds(ctrl).join(' ') + '] tier=' + (ctrl.getTier ? ctrl.getTier() : '?'))
        check('PATTERN', global.grindless.patterns.describe(MACHINE_ID).built,
          'built by GTM itself on the first structure check (already built before placing: ' + m.builtBefore + ')')
        m.parts = findParts(ctrl)
        var problems = partsProblem(m.parts)
        check('PARTS', problems.length === 0, problems.length > 0 ? problems.join('; ') :
          '1 energy hatch, 1 input bus, 1 output bus, 3 input hatches, 2 output hatches (all ZPM)')
        if (problems.length > 0) {
          m.phase = 'done'
          return
        }
        m.list = scenarios()
        m.sc = -1
        m.phase = 'running'
        topUpEnergy(m)
        nextScenario(m, ctrl)
        return
      }
      if (waited >= FORM_TIMEOUT) {
        if (!global.grindless.patterns.describe(MACHINE_ID).built) {
          check('FORMED', false, 'not formed after ' + waited + ' ticks and GTM never built the pattern')
          m.phase = 'done'
          return
        }
        if (!ctrl.checkPatternWithLock()) {
          check('FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
          m.phase = 'done'
          return
        }
        check('FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
        ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
        ctrl.onStructureFormed()
        m.forced = true
      }
      return
    }

    if (m.phase === 'running') {
      var sc = m.list[m.sc]
      var running = S.t - m.scStart
      observe(m, ctrl)
      if (!m.stateNoted && running >= 30) {
        m.stateNoted = true
        note('STATE_' + sc.name, 'after ' + running + ' ticks: ' + recipeState(ctrl) + ' ' + diagnose(ctrl))
      }
      if (running >= sc.ticks) {
        var verdict = null
        try {
          verdict = sc.verify(collect(m))
        } catch (e) {
          verdict = { ok: false, detail: 'exception while checking: ' + e }
        }
        check('PROCESS_' + sc.name, verdict.ok, verdict.detail + ' | ' + recipeState(ctrl))
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
    S.t = elapsed
    var m = S.machine
    if (m !== null && m.phase !== 'done') {
      try {
        advance(m)
      } catch (e) {
        check('STEP', false, 'exception in ' + m.phase + ': ' + e)
        m.phase = 'done'
      }
    }
    if (m === null || m.phase === 'done') finish()
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
      check('run', false, 'exception: ' + e)
      finish()
    }
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, level: server.overworld(), t: 0, tick0: now, nextAt: now + STEP, machine: null, finished: false }
    try {
      staticChecks()
    } catch (e) {
      check('static', false, 'exception: ' + e)
    }
    try {
      prepareWorld()
    } catch (e) {
      check('AREA', false, 'exception: ' + e)
    }
    startMachine()
    if (S.machine === null || S.machine.phase === 'done') finish()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_zpm_actinides', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_zpm_actinides run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
