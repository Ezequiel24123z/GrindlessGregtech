// Gregtech Grindless - smoke test of the EV Rare Earth Extraction Cascade (TEST-ONLY overlay: copied over the instance on the test PC,
// never shipped with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_extraction_cascade;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|extraction_cascade\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// What it proves (the new mechanisms of package B9; the exact amounts of every recipe are also checked offline in the dump):
//   extraction_cascade|registration   recipe type gtceu:solvent_extraction with its IO sizes, and the machine
//   extraction_cascade|materials      the four GT materials: items, fluid and bucket, formulas, components; the solution is an acid with
//                                     no decomposition, the chlorides have two components each
//   extraction_cascade|recipes        the two recipes under their final ids (grindless:solvent_extraction/ev/<name>), with the script's
//                                     duration and EU/t and the expected input and output ids
//   extraction_cascade|decomposition  GTM generated the electrolyzer decomposition of the three chlorides (metal + chlorine) and none for
//                                     the solution or the merrillite
//   extraction_cascade|crafting       the cascade's crafting recipe under its final id
//   extraction_cascade|DESCRIPTION / PLACED / FORMED / PATTERN / PARTS   the registered description placed block by block, formed by
//                                     itself (the test places 1 energy hatch, 1 input bus, 1 output bus, 3 input and 4 output hatches)
//   extraction_cascade|PROCESS_merrillite_leach       circuit 1: 4 merrillite + HCl -> solution + phosphoric acid + 3 tricalcium phosphate
//   extraction_cascade|PROCESS_leach_inputs_circuit_2 the leach inputs with circuit 2: nothing runs (the circuit picks the mode)
//   extraction_cascade|PROCESS_rare_earth_extraction  circuit 2: solution + HCl + kerosene -> the three chlorides + kerosene back +
//                                                     diluted HCl
//   extraction_cascade|LOOKUP                         GTM's recipe lookup reaches both recipes from their inputs
//   extraction_cascade|DONE                           last line
//
// TEST AREA: this test builds, force-loads and clears ONLY its own band of the overworld, X 9216-9279, Y 98-112, Z 0-15 (tests run at the
// same time in one server; other bands belong to other tests). The cascade faces north with its controller at (9226, 102, 8) and runs
// back to Z 14. Everything is driven by the structure description that lib/patterns.js records (global.grindless.structures). var +
// function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'extraction_cascade'
  var STEP = 10
  var FORM_TIMEOUT = 600
  var BAND = { x0: 9216, x1: 9279, y0: 98, y1: 112, z0: 0, z1: 15 }
  var CONTROLLER = { x: 9226, y: 102, z: 8 }

  // The pack's Additional Placements mod reloads the datapacks (so these scripts too) a couple of seconds after the server is up; a test
  // that is running then is lost. The command therefore only leaves a request in `global` (it survives script reloads) and the tick handler
  // starts the test once these scripts have been loaded for QUIET_MS.
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestExtractionCascadeRequest'

  var MACHINE_ID = 'gtceu:extraction_cascade'
  var TYPE_ID = 'gtceu:solvent_extraction'
  var MERRILLITE = 'gtceu:merrillite_dust'
  var HCL = 'gtceu:hydrochloric_acid'

  var PART_BLOCKS = {
    energy_input: 'gtceu:ev_energy_input_hatch',
    input_bus: 'gtceu:ev_input_bus',
    output_bus: 'gtceu:ev_output_bus',
    input_hatch: 'gtceu:ev_input_hatch',
    output_hatch: 'gtceu:ev_output_hatch'
  }
  // what the test builds: every fluid of the line gets its own hatch (the pattern allows 1-3 in and 1-4 out)
  var TEST_PARTS = { energy_input: 1, input_bus: 1, output_bus: 1, input_hatch: 3, output_hatch: 4 }
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

  function EC() {
    return global.grindless.extractionCascade
  }

  function planNamed(name) {
    var list = EC().recipes
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === name) return list[i]
    }
    throw new Error('no solvent_extraction recipe ' + name)
  }

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  // ---------------------------------------------------------------- static checks

  function recipeCount(typeId) {
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    return type ? S.server.getRecipeManager().getAllRecipesFor(type).size() : -1
  }

  // the ids (and amounts, for the detail) a live GT recipe takes and gives, read through RecipeHelper (the ingredient getters are not
  // reachable from Rhino)
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

  function ioText(io) {
    function list(l) { return l.map(function (x) { return x.n + ' ' + short(x.id) }).join(' + ') }
    return '[' + list(io.itemsIn) + (io.fluidsIn.length ? ' | ' + list(io.fluidsIn) : '') + '] -> [' + list(io.itemsOut) +
      (io.fluidsOut.length ? ' | ' + list(io.fluidsOut) : '') + ']'
  }

  function sameIds(have, want) {
    var a = have.map(function (x) { return x.id }).sort().join(',')
    var b = want.map(function (x) { return x.id }).sort().join(',')
    return a === b ? null : 'ids ' + a + ', wanted ' + b
  }

  function staticChecks() {
    var ic = lazy().ItemCap
    var fc = lazy().FluidCap

    var type = GTRegistries.RECIPE_TYPES.get(rl(TYPE_ID))
    var machine = GTRegistries.MACHINES.get(rl(MACHINE_ID))
    var io = EC().maxIO
    var sizes = type ? [type.getMaxInputs(ic), type.getMaxOutputs(ic), type.getMaxInputs(fc), type.getMaxOutputs(fc)] : []
    var sizesOk = !!type && sizes.join(',') === [io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut].join(',')
    check('registration', sizesOk && !!machine,
      'solvent_extraction=' + (type ? 'registered (items in/out, fluids in/out: ' + sizes.join('/') + ')' : 'missing') + ' machine=' + (machine ? 'registered' : 'missing'))

    // ---- materials
    var problems = []
    var notes = []
    var ids = EC().ids
    ;[ids.samariumChloride, ids.neodymiumChloride, ids.mixedChloride, ids.solution + '_bucket'].forEach(function (id) {
      if (!Item.exists(id)) problems.push('item ' + id + ' missing')
    })
    if (!Fluid.exists(ids.solution)) problems.push('fluid ' + ids.solution + ' missing')
    var M = EC().materials
    var wantComponents = {}
    wantComponents[M.solution] = 0
    wantComponents[M.samarium] = 2
    wantComponents[M.neodymium] = 2
    wantComponents[M.mixed] = 2
    Object.keys(wantComponents).forEach(function (name) {
      var mat = GTMaterials.get(name)
      if (mat === null || mat.isNull()) {
        problems.push('material ' + name + ' missing')
        return
      }
      var comps = asArray(mat.getMaterialComponents()).map(function (s) { return String(s.material().getName()) + ' x' + s.amount() })
      notes.push(name + ' formula=' + mat.getChemicalFormula() + ' components=[' + comps.join(' ') + ']')
      if (comps.length !== wantComponents[name]) problems.push(name + ' has ' + comps.length + ' components, wanted ' + wantComponents[name])
    })
    var solution = GTMaterials.get(M.solution)
    if (solution !== null && !solution.isNull()) {
      if (!solution.hasFlag(GTMaterialFlags.DISABLE_DECOMPOSITION)) problems.push('the solution can be decomposed')
      try {
        var attrs = asArray(solution.getFluid().getAttributes()).map(function (a) { return String(a.getResourceLocation()) })
        notes.push('solution fluid attributes=[' + attrs.join(',') + ']')
        if (attrs.indexOf('gtceu:acid') < 0) problems.push('the solution is not an acid')
      } catch (e) {
        problems.push('solution attributes unreadable: ' + e)
      }
    }
    check('materials', problems.length === 0, notes.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : ''))

    // ---- the two recipes
    problems = []
    notes = []
    var have = recipeCount(TYPE_ID)
    EC().recipes.forEach(function (p) {
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
      var want = {
        itemsIn: p.itemsIn,
        fluidsIn: p.fluidsIn,
        itemsOut: p.itemsOut,
        fluidsOut: p.fluidsOut
      }
      ;['itemsIn', 'fluidsIn', 'itemsOut', 'fluidsOut'].forEach(function (k) {
        var d = sameIds(lio[k], want[k])
        if (d !== null) problems.push(p.name + ' ' + k + ' ' + d)
      })
      notes.push(p.recipeId + ' ' + live.duration + ' t x ' + eut + ' EU/t ' + ioText(lio))
    })
    check('recipes', have === EC().recipes.length && problems.length === 0, 'solvent_extraction=' + have + ' ; ' + notes.join(' ; ') +
      (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : ''))

    // ---- GTM's decomposition of the chlorides (and none of the solution or the merrillite)
    problems = []
    notes = []
    EC().decomposition.forEach(function (d) {
      var live = liveRecipe(d.id)
      if (live === null) {
        problems.push(d.id + ' missing')
        return
      }
      var lio = liveIO(live)
      var inOk = lio.itemsIn.length === 1 && lio.itemsIn[0].id === d.input.id
      var outOk = lio.itemsOut.length === 1 && lio.itemsOut[0].id === d.outputs.item.id &&
        lio.fluidsOut.length === 1 && lio.fluidsOut[0].id === d.outputs.fluid.id
      if (!inOk || !outOk) problems.push(d.id + ' is ' + ioText(lio))
      notes.push(d.id.replace('gtceu:electrolyzer/', '') + ' ' + live.duration + ' t ' + ioText(lio))
    })
    ;['gtceu:electrolyzer/decomposition_electrolyzing_rare_earth_chloride_solution',
      'gtceu:centrifuge/decomposition_centrifuging__rare_earth_chloride_solution',
      'gtceu:electrolyzer/decomposition_electrolyzing_merrillite',
      'gtceu:centrifuge/decomposition_centrifuging__merrillite'].forEach(function (id) {
      if (liveRecipe(id) !== null) problems.push(id + ' exists')
    })
    check('decomposition', problems.length === 0, notes.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : ''))

    // ---- crafting (a crafting-table recipe, not a GT recipe: read through the vanilla result, as gg_test_syngas.js does)
    var craft = liveRecipe(EC().craftingRecipe)
    var out = ''
    if (craft !== null) {
      var res = craft.getResultItem(S.server.registryAccess())
      out = String(res.getId()) + ' x' + res.getCount()
    }
    check('crafting', out === MACHINE_ID + ' x1', 'id=' + EC().craftingRecipe + ' gives ' + (craft === null ? 'nothing (missing)' : out))
  }

  // ---------------------------------------------------------------- structure (same technique as gg_test_ev_platinum_plant.js)

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

  // a "casing OR parts" cell: TEST_PARTS of each part (checked against the pattern's limits) spread evenly over the cells, the rest
  // is the plain block
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

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing
  // north: x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
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

  function fillScenario(m, ctrl, sc) {
    var P = m.parts
    var leftIn = P.inHatches.map(tankInfo).filter(function (t) { return t.amount > 0 }).length
    var leftOut = P.outHatches.map(tankInfo).filter(function (t) { return t.amount > 0 }).length
    fillInputs(m, sc)
    wake(ctrl)
    note('INPUT_' + sc.name, 'bus=[' + itemSummary(readBus(P.inBus)) + '] circuit=' + (sc.circuit ? sc.circuit : 'none') +
      ' fluids=[' + (sc.fluids || []).map(function (f) { return 'hatch ' + f.hatch + ': ' + f.id + ' ' + f.mb + ' mB' }).join(' ; ') + ']' +
      ' hatches still holding fluid after the reset: ' + leftIn + ' in, ' + leftOut + ' out')
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

  // a run of a cascade recipe: the items and fluids that come out, the fluids that go in and the items that are used up, all exact;
  // each output fluid in a hatch of its own
  function judgeRun(plan, r, input) {
    var problems = []
    var have = []
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
    var filled = r.outHatches.filter(function (t) { return t.amount > 0 }).length
    if (filled !== plan.fluidsOut.length) problems.push(filled + ' output hatches hold fluid, wanted ' + plan.fluidsOut.length)
    var used = []
    plan.fluidsIn.forEach(function (f, i) {
      var left = r.fluidIn[i] ? r.fluidIn[i].amount : -1
      var spent = input.fluidStart[i] - left
      used.push(short(f.id) + ' used ' + spent + ' of ' + f.amount)
      if (spent !== f.amount) problems.push(f.id + ' used ' + spent + ' mB, wanted ' + f.amount)
    })
    plan.itemsIn.forEach(function (x) {
      var spent = (input.itemStart[x.id] || 0) - (r.leftover[x.id] || 0)
      used.push(short(x.id) + ' used ' + spent)
      if (spent !== x.count) problems.push(x.id + ' used ' + spent + ', wanted ' + x.count)
    })
    return { problems: problems, have: have, used: used }
  }

  // one run of a cascade recipe (no parallels): the items one run's worth, every fluid with 300 mB to spare (not enough for a second run)
  function recipeScenario(plan) {
    var sc = { name: plan.name, ticks: plan.duration + 60, circuit: plan.circuit, items: [], fluids: [] }
    plan.itemsIn.forEach(function (x) { sc.items.push({ id: x.id, n: x.count }) })
    sc.fluids = plan.fluidsIn.map(function (f, i) { return { hatch: i, id: f.id, mb: f.amount + 300 } })
    sc.verify = function (r) {
      var itemStart = {}
      sc.items.forEach(function (x) { itemStart[x.id] = (itemStart[x.id] || 0) + x.n })
      var judged = judgeRun(plan, r, { fluidStart: sc.fluids.map(function (f) { return f.mb }), itemStart: itemStart })
      if (r.seen[plan.recipeId] === undefined) judged.problems.push('recipe ' + plan.recipeId + ' never ran')
      var others = Object.keys(r.seen).filter(function (id) { return id !== plan.recipeId })
      if (others.length > 0) judged.problems.push('other recipes seen ' + others.join(','))
      return {
        ok: judged.problems.length === 0,
        detail: plan.recipeId + ' (' + plan.duration + ' t, ' + plan.eut + ' EU/t before overclock): ' + judged.have.join(', ') + ' | ' + judged.used.join(' ; ') +
          ' | recipes seen=[' + seenIds(r) + ']' + (judged.problems.length > 0 ? ' | problems: ' + judged.problems.join(' ; ') : '')
      }
    }
    return sc
  }

  // a scenario that must NOT run anything: what is in the bus and the hatches stays there
  function idleScenario(name, items, circuit, fluids, why) {
    var itemStart = {}
    items.forEach(function (x) { itemStart[x.id] = x.n })
    return {
      name: name,
      ticks: 80,
      items: items,
      circuit: circuit,
      fluids: fluids,
      verify: function (r) {
        var problems = []
        if (Object.keys(r.seen).length > 0) problems.push('recipes ran: ' + seenIds(r))
        if (Object.keys(r.items).length > 0) problems.push('items came out: ' + itemSummary(r.items))
        if (Object.keys(r.fluidOut).length > 0) problems.push('fluids came out: ' + Object.keys(r.fluidOut).join(','))
        Object.keys(itemStart).forEach(function (id) {
          if ((r.leftover[id] || 0) !== itemStart[id]) problems.push(id + ' left ' + (r.leftover[id] || 0) + ' of ' + itemStart[id])
        })
        fluids.forEach(function (f) {
          var left = r.fluidIn[f.hatch] ? r.fluidIn[f.hatch].amount : -1
          if (left !== f.mb) problems.push(f.id + ' left ' + left + ' of ' + f.mb)
        })
        return {
          ok: problems.length === 0,
          detail: why + ' | nothing ran and nothing was used' + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '')
        }
      }
    }
  }

  function scenarios() {
    return [
      recipeScenario(planNamed('merrillite_leach')),
      idleScenario('leach_inputs_circuit_2', [{ id: MERRILLITE, n: 4 }], 2, [{ hatch: 0, id: HCL, mb: 3300 }],
        'circuit 2 (the extraction) with the leach inputs, 4 merrillite and 3,300 mB of hydrochloric acid'),
      recipeScenario(planNamed('rare_earth_extraction'))
    ]
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
    EC().recipes.forEach(function (plan) {
      clearInventory(P.inBus.getInventory())
      clearInventory(P.inBus.getCircuitInventory())
      P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
      fillInputs(m, {
        items: plan.itemsIn.map(function (x) { return { id: x.id, n: x.count } }),
        circuit: plan.circuit,
        fluids: plan.fluidsIn.map(function (f, i) { return { hatch: i, id: f.id, mb: f.amount } })
      })
      var ids = candidateIds(ctrl)
      if (ids.indexOf(plan.recipeId) < 0) bad.push(plan.name + ' wanted ' + plan.recipeId + ' got [' + ids.slice(0, 6).join(',') + ']')
    })
    resetMachine(m, ctrl)
    check('LOOKUP', bad.length === 0, 'cases=' + EC().recipes.length + (bad.length > 0 ? ' unreachable=' + bad.join('; ') : ''))
  }

  // ---------------------------------------------------------------- the machine

  // the chunks of the band are generated and force-loaded, and the band (and only the band) is cleared
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
      // the pattern is NOT built here: the structure is placed from the registered description and GTM builds the pattern itself,
      // lazily, when the controller first checks its structure (what happens in a real world)
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
    fillScenario(m, ctrl, sc)
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
          '1 energy hatch, 1 input bus, 1 output bus, 3 input hatches, 4 output hatches')
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

  ServerEvents.customCommand('gg_test_extraction_cascade', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_extraction_cascade run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
