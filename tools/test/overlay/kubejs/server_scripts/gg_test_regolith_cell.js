// Gregtech Grindless - smoke test of the EV Regolith Cell (TEST-ONLY overlay: copied over the instance on the test PC, never shipped with
// the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_dump;;kubejs custom_command gg_test_regolith_cell' `
//     -WaitForLog 'GGTEST\|dump\|DONE@@900;;GGTEST\|regolith_cell\|DONE@@900'
//
// What is new and is proven here: the cell's structure (a hall of the KubeJS brick block, with the brick as the parts' look, a stable
// titanium crucible, nichrome coils, a glass roof and five output hatches) and its recipe type, run once per recipe on the Moon. The Moon
// condition itself is GTM's proven dimension condition (the Lunar Drill, the sintering furnace): only its presence is checked.
//   regolith_cell|registration    recipe type gtceu:regolith_processing with its IO sizes, the machine, the structure description
//   regolith_cell|recipes         the 4 recipes under their final ids (GTM's builder puts the type in front: grindless:regolith_processing/
//                                 ev/<name>), with their inputs, chances, circuit, outputs, duration and EU/t, and the gcyr:luna condition
//   regolith_cell|kroll_stages    the 4 GTM recipes the titanium mode replaces have the figures the cell's energy was summed from, and
//                                 the titanium recipe costs exactly their sum
//   regolith_cell|crafting        the controller recipe
//   regolith_cell@moon|DESCRIPTION / PLACED / FORMED / PATTERN / PARTS   the registered description placed block by block on the Moon,
//                                 formed by itself
//   regolith_cell@moon|PROCESS_<recipe>   one run of each recipe: volatiles (circuit 1), regolith electrolysis and titanium (circuit 2,
//                                 the anode used up whole or not at all, the salt charge never), sintering (circuit 3)
//   regolith_cell@moon|LOOKUP     GTM's recipe lookup reaches all four recipes from their inputs
//   regolith_cell|DONE            last line
//
// TEST AREA: this test builds, force-loads and clears ONLY its own band on the Moon (gcyr:luna): X 7168-7231, Y 198-214, Z 0-15 (tests
// run at the same time in one server; other bands belong to other tests). The cell faces north with its controller at (7178, 204, 8).
// Everything is driven by the structure description that lib/patterns.js records (global.grindless.structures). var + function everywhere
// (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'regolith_cell'
  var KEY = 'regolith_cell@moon'
  var STEP = 10
  var FORM_TIMEOUT = 600
  var LUNA = 'gcyr:luna'
  var BAND = { x0: 7168, x1: 7231, y0: 198, y1: 214, z0: 0, z1: 15 }
  var CONTROLLER = { x: 7178, y: 204, z: 8 }

  // The pack's Additional Placements mod reloads the datapacks (so these scripts too) a couple of seconds after the server is up; a test
  // that is running then is lost. The command therefore only leaves a request in `global` (it survives script reloads) and the tick handler
  // starts the test once these scripts have been loaded for QUIET_MS.
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestRegolithCellRequest'

  var CELL_ID = 'gtceu:regolith_cell'
  var TYPE_ID = 'gtceu:regolith_processing'

  // what each recipe must be (the script's own table is compared against this, so a silent change to the table shows up)
  var WANT = {
    volatiles: {
      circuit: 1, duration: 50, eut: 1920,
      itemsIn: { 'gtceu:lunar_regolith_dust': [16, 10000] },
      itemsOut: {},
      fluidsOut: { 'gtceu:hydrogen': 2000, 'gtceu:helium': 250, 'gtceu:nitrogen': 200, 'gtceu:helium_3': 1 }
    },
    regolith_electrolysis: {
      circuit: 2, duration: 200, eut: 1920,
      itemsIn: { 'gtceu:lunar_regolith_dust': [16, 10000], 'grindless:platinum_electrode': [1, 10] },
      itemsOut: { 'gtceu:silicon_dust': 3, 'gtceu:iron_dust': 1 },
      fluidsOut: { 'gtceu:oxygen': 7000 }
    },
    titanium_from_ilmenite: {
      circuit: 2, duration: 1408, eut: 1920,
      itemsIn: { 'gtceu:ilmenite_dust': [5, 10000], 'grindless:platinum_electrode': [1, 10], 'grindless:molten_salt_charge': [1, 0] },
      itemsOut: { 'gtceu:titanium_ingot': 3, 'gtceu:iron_dust': 1 },
      fluidsOut: { 'gtceu:oxygen': 3000 }
    },
    proxima_tailings: {
      circuit: 2, duration: 79, eut: 1920,
      itemsIn: { 'grindless:leached_tailings': [16, 10000], 'grindless:platinum_electrode': [1, 10] },
      itemsOut: { 'gtceu:silicon_dioxide_dust': 3, 'gtceu:iron_dust': 1 },
      fluidsOut: { 'gtceu:oxygen': 1000 }
    },
    sintering: {
      circuit: 3, duration: 100, eut: 1920,
      itemsIn: { 'gtceu:lunar_regolith_dust': [16, 10000] },
      itemsOut: { 'grindless:sintered_regolith': 4 },
      fluidsOut: {}
    }
  }

  var PART_BLOCKS = {
    energy_input: 'gtceu:ev_energy_input_hatch',
    input_bus: 'gtceu:ev_input_bus',
    output_bus: 'gtceu:ev_output_bus',
    output_hatch: 'gtceu:ev_output_hatch'
  }
  // parts placed: the lower limit of each, except the output hatches: all five (one per gas), the count the preview shows
  var NEED = { energy: 1, inBuses: 1, outBuses: 1, outHatches: 5 }
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
  function emit(scope, name, status, detail) {
    var line = TAG + scope + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(scope, name, ok, detail) {
    emit(scope, name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(scope, name, detail) {
    emit(scope, name, 'NOTE', detail)
  }

  function guarded(name, fn) {
    try {
      fn()
    } catch (e) {
      check(SCOPE, name, false, 'exception: ' + e)
    }
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

  function cmd(text) {
    return S.server.runCommandSilent('execute in ' + LUNA + ' run ' + text)
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

  function planNamed(name) {
    var list = global.grindless.regolithCell.recipes
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === name) return list[i]
    }
    throw new Error('no regolith_processing recipe ' + name + ' in the script\'s table')
  }

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  // ---------------------------------------------------------------- static checks

  // the JSON of every input or output content of one capability (item or fluid) of a live GT recipe, with its chance
  function contents(list) {
    return asArray(list).map(function (c) {
      var j = null
      try {
        j = JSON.parse(String(c.content.toJson()))
      } catch (e) {
        j = null
      }
      return { json: j, chance: Number(c.chance) }
    })
  }

  // { id: [count, chance] } of the item inputs; circuits apart (a KubeJS .circuit() is a sized ingredient around gtceu:circuit)
  function liveItemsIn(r) {
    var out = { items: {}, circuit: 0 }
    contents(r.getInputContents(lazy().ItemCap)).forEach(function (c) {
      var j = c.json
      if (j === null) return
      var ing = j.ingredient || j
      if (j.type === 'gtceu:circuit' || ing.type === 'gtceu:circuit') {
        out.circuit = Number(ing.configuration != null ? ing.configuration : j.configuration)
        return
      }
      var id = ing.item ? String(ing.item) : (ing.tag ? '#' + String(ing.tag) : '?')
      out.items[id] = [Number(j.count || 1), c.chance]
    })
    return out
  }

  function liveItemsOut(r) {
    var out = {}
    contents(r.getOutputContents(lazy().ItemCap)).forEach(function (c) {
      var j = c.json
      if (j === null) return
      var ing = j.ingredient || j
      out[String(ing.item)] = Number(j.count || 1)
    })
    return out
  }

  function liveFluidsOut(r) {
    var out = {}
    contents(r.getOutputContents(lazy().FluidCap)).forEach(function (c) {
      var j = c.json
      if (j === null || !j.value || j.value.length === 0) return
      out[String(j.value[0].fluid || ('#' + j.value[0].tag))] = Number(j.amount)
    })
    return out
  }

  function sameMap(a, b) {
    return JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b))
  }

  function sortKeys(m) {
    var out = {}
    Object.keys(m).sort().forEach(function (k) { out[k] = m[k] })
    return out
  }

  function dimensionsOf(r) {
    var dims = []
    asArray(r.conditions).forEach(function (c) {
      if (c.getDimension) dims.push(String(c.getDimension().location()) + (c.isReverse() ? ' (reversed)' : ''))
    })
    return dims
  }

  function planItemsIn(p) {
    var m = {}
    p.itemsIn.forEach(function (x) { m[x.id] = [x.count, x.chance] })
    return m
  }

  function planItemsOut(p) {
    var m = {}
    p.itemsOut.forEach(function (x) { m[x.id] = x.count })
    return m
  }

  function planFluidsOut(p) {
    var m = {}
    p.fluidsOut.forEach(function (x) { m[x.id] = x.amount })
    return m
  }

  function staticChecks() {
    var RC = global.grindless.regolithCell
    var ic = lazy().ItemCap
    var fc = lazy().FluidCap

    var type = GTRegistries.RECIPE_TYPES.get(rl(TYPE_ID))
    var machine = GTRegistries.MACHINES.get(rl(CELL_ID))
    var desc = global.grindless.patterns.describe(CELL_ID)
    var sizes = type ? [type.getMaxInputs(ic), type.getMaxOutputs(ic), type.getMaxInputs(fc), type.getMaxOutputs(fc)] : []
    var sizesOk = !!type && sizes.join(',') === [RC.maxIO.itemsIn, RC.maxIO.itemsOut, RC.maxIO.fluidsIn, RC.maxIO.fluidsOut].join(',')
    check(SCOPE, 'registration', sizesOk && !!machine && !!desc,
      'regolith_processing=' + (type ? 'registered (items in/out, fluids in/out: ' + sizes.join('/') + ')' : 'missing') +
      ' machine=' + (machine ? 'registered' : 'missing') + ' description=' + (desc ? desc.slices.length + ' slices' : 'missing'))

    var problems = []
    var have = type ? S.server.getRecipeManager().getAllRecipesFor(type).size() : -1
    if (have !== 5) problems.push('the type has ' + have + ' recipes, wanted 5')
    Object.keys(WANT).forEach(function (name) {
      var w = WANT[name]
      var p = null
      try {
        p = planNamed(name)
      } catch (e) {
        problems.push(String(e))
        return
      }
      // the script's table against what this test expects
      if (p.circuit !== w.circuit || p.duration !== w.duration || p.eut !== w.eut) {
        problems.push(name + ' table: circuit ' + p.circuit + ', ' + p.duration + ' t x ' + p.eut + ' EU/t; wanted ' + w.circuit + ', ' + w.duration + ' x ' + w.eut)
      }
      if (!sameMap(planItemsIn(p), w.itemsIn)) problems.push(name + ' table items in ' + JSON.stringify(planItemsIn(p)))
      if (!sameMap(planItemsOut(p), w.itemsOut)) problems.push(name + ' table items out ' + JSON.stringify(planItemsOut(p)))
      if (!sameMap(planFluidsOut(p), w.fluidsOut)) problems.push(name + ' table fluids out ' + JSON.stringify(planFluidsOut(p)))
      // the live recipe against the table
      var live = liveRecipe(p.recipeId)
      if (live === null) {
        problems.push(p.recipeId + ' is not in the recipe manager')
        return
      }
      var liveEut = Number(lazy().Helper.getRealEUt(live).getTotalEU())
      if (Number(live.duration) !== w.duration || liveEut !== w.eut) problems.push(name + ' live ' + live.duration + ' t x ' + liveEut + ' EU/t')
      var ins = liveItemsIn(live)
      if (ins.circuit !== w.circuit) problems.push(name + ' live circuit ' + ins.circuit)
      if (!sameMap(ins.items, w.itemsIn)) problems.push(name + ' live items in ' + JSON.stringify(ins.items))
      var outs = liveItemsOut(live)
      if (!sameMap(outs, w.itemsOut)) problems.push(name + ' live items out ' + JSON.stringify(outs))
      var fouts = liveFluidsOut(live)
      if (!sameMap(fouts, w.fluidsOut)) problems.push(name + ' live fluids out ' + JSON.stringify(fouts))
      var fins = contents(live.getInputContents(fc))
      if (fins.length > 0) problems.push(name + ' live has ' + fins.length + ' fluid input(s)')
      var dims = dimensionsOf(live)
      if (dims.length !== 1 || dims[0] !== LUNA) problems.push(name + ' dimension conditions: ' + (dims.join(', ') || 'none'))
    })
    check(SCOPE, 'recipes', problems.length === 0, 'ids=' + global.grindless.regolithCell.recipes.map(function (p) { return p.recipeId }).join(',') +
      ' (each with its inputs, chances, circuit, outputs, ticks, EU/t and the ' + LUNA + ' condition)' +
      (problems.length > 0 ? ' problems(' + problems.length + ')=' + problems.slice(0, 12).join(' ; ') : ''))

    // the energy of the titanium mode: the four GTM stages it replaces, read back from the recipe manager
    var stageProblems = []
    var sum = 0
    var parts = []
    RC.stages.forEach(function (s) {
      var live = liveRecipe(s.id)
      if (live === null) {
        stageProblems.push(s.id + ' missing')
        return
      }
      var eut = Number(lazy().Helper.getRealEUt(live).getTotalEU())
      var dur = Number(live.duration)
      if (eut !== s.eut || dur !== s.duration) stageProblems.push(s.name + ' live ' + dur + ' t x ' + eut + ' EU/t, the table says ' + s.duration + ' x ' + s.eut)
      sum += eut * dur * s.runs
      parts.push(s.name + ' ' + s.runs + 'x' + dur + 'tx' + eut)
    })
    var ti = planNamed('titanium_from_ilmenite')
    if (sum !== RC.krollEnergy) stageProblems.push('the live stages sum to ' + sum + ' EU, the script summed ' + RC.krollEnergy)
    if (ti.energy !== sum) stageProblems.push('the titanium recipe costs ' + ti.energy + ' EU, the stages ' + sum)
    check(SCOPE, 'kroll_stages', stageProblems.length === 0, parts.join(' + ') + ' = ' + sum + ' EU; titanium recipe ' + ti.duration + ' t x ' + ti.eut +
      ' EU/t = ' + ti.energy + ' EU' + (stageProblems.length > 0 ? ' problems=' + stageProblems.join(' ; ') : ''))

    // a crafting-table recipe, not a GT one: its result comes from the vanilla recipe
    var craft = liveRecipe(RC.craftingRecipes.cell)
    var craftOut = ''
    if (craft !== null) {
      var res = craft.getResultItem(S.server.registryAccess())
      craftOut = String(res.getId()) + ' x' + res.getCount()
    }
    check(SCOPE, 'crafting', craft !== null && craftOut === CELL_ID + ' x1', RC.craftingRecipes.cell + ' gives ' + (craftOut || 'nothing'))
  }

  // ---------------------------------------------------------------- structure (same technique as gg_test_ev_platinum_plant.js)

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

  // a "casing OR parts" cell: the parts the limits ask for (exact, else the preview count, else the lower limit) are spread evenly over the
  // cells, the rest is the plain block
  function assignOneOf(sym, list, machineId) {
    var filler = null
    var parts = []
    sym.options.forEach(function (o) {
      if (o.kind === 'part') {
        var lim = o.limits || {}
        var need = lim.exact != null ? lim.exact : (lim.preview != null ? lim.preview : (lim.min != null ? lim.min : 0))
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
      cells: placed,
      size: width + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)',
      blocks: placed.length
    }
  }

  function setBlock(c) {
    return cmd('setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
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
    check(KEY, 'PLACED', failed.length === 0 && wrong.length === 0,
      'blocks=' + plan.blocks + ' size=' + plan.size + ' controller=' + plan.ctrl.x + ',' + plan.ctrl.y + ',' + plan.ctrl.z + ' in ' + LUNA + ' parts=[' + parts.join(' ') + ']' +
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
    var P = { energy: [], inBuses: [], outBuses: [], outHatches: [] }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.energy_input) P.energy.push(p)
      else if (pid === PART_BLOCKS.input_bus) P.inBuses.push(p)
      else if (pid === PART_BLOCKS.output_bus) P.outBuses.push(p)
      else if (pid === PART_BLOCKS.output_hatch) P.outHatches.push(p)
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

  // an idle, freshly formed multiblock can stop ticking: wake its recipe logic after the inputs change
  function wake(ctrl) {
    try {
      ctrl.getRecipeLogic().updateTickSubscription()
    } catch (e) { /* the scenario reports what did not run */ }
  }

  function resetMachine(m, ctrl) {
    var P = m.parts
    P.inBuses.forEach(function (b) {
      clearInventory(b.getInventory())
      clearInventory(b.getCircuitInventory())
    })
    P.outBuses.forEach(function (b) { clearInventory(b.getInventory()) })
    P.outHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    ctrl.getRecipeLogic().resetRecipeLogic()
  }

  function fillInputs(m, sc) {
    var bus = m.parts.inBuses[0]
    var inv = bus.getInventory()
    ;(sc.items || []).forEach(function (input, slot) {
      var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
    })
    if (sc.circuit) {
      // the bus circuit slot refuses insertItem (its capability IO is NONE); players set it through the GUI
      bus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(sc.circuit))
    }
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
    var hatches = P.outHatches.map(tankInfo)
    return {
      items: counts,
      fluidOut: sumTanks(hatches),
      hatchesUsed: hatches.filter(function (h) { return h.amount > 0 }).length,
      leftover: readBus(P.inBuses[0]),
      seen: m.seen
    }
  }

  function seenIds(r) {
    return Object.keys(r.seen).map(function (id) { return id + '(x' + r.seen[id] + ')' }).join(',')
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

  // ---------------------------------------------------------------- scenarios

  // one run of a cell recipe: what it is used up for certain, all of it; a chanced input one run's worth and one more, so a worn anode is
  // seen; a never-used-up input once. Whole outputs exactly, every fluid exactly, one recipe and only that one
  function recipeScenario(name) {
    var plan = planNamed(name)
    var sc = { name: name, ticks: plan.duration + 60, circuit: plan.circuit, items: [] }
    plan.itemsIn.forEach(function (x) {
      sc.items.push({ id: x.id, n: x.count + (x.chance > 0 && x.chance < 10000 ? 1 : 0), count: x.count, chance: x.chance })
    })
    sc.verify = function (r) {
      var problems = []
      var have = []
      plan.itemsOut.forEach(function (o) {
        var got = r.items[o.id] || 0
        have.push(short(o.id) + ' ' + got)
        if (got !== o.count) problems.push(o.id + ' ' + got + ', wanted ' + o.count)
      })
      Object.keys(r.items).forEach(function (id) {
        if (!plan.itemsOut.some(function (o) { return o.id === id })) problems.push('unexpected item ' + id + ' x' + r.items[id])
      })
      plan.fluidsOut.forEach(function (f) {
        var got = r.fluidOut[f.id] || 0
        have.push(short(f.id) + ' ' + got + ' mB')
        if (got !== f.amount) problems.push(f.id + ' ' + got + ' mB, wanted ' + f.amount)
      })
      Object.keys(r.fluidOut).forEach(function (id) {
        if (!plan.fluidsOut.some(function (f) { return f.id === id })) problems.push('unexpected fluid ' + id + ' ' + r.fluidOut[id] + ' mB')
      })
      var used = []
      sc.items.forEach(function (x) {
        var spent = x.n - (r.leftover[x.id] || 0)
        if (x.chance >= 10000) {
          used.push(short(x.id) + ' used ' + spent)
          if (spent !== x.count) problems.push(x.id + ' used ' + spent + ', wanted ' + x.count)
        } else if (x.chance === 0) {
          used.push(short(x.id) + ' used ' + spent + ' (never used up)')
          if (spent !== 0) problems.push(x.id + ' used ' + spent + ', wanted 0')
        } else {
          used.push(short(x.id) + ' used ' + spent + ' (' + x.chance + '/10000)')
          if (spent !== 0 && spent !== x.count) problems.push(x.id + ' used ' + spent + ', wanted 0 or ' + x.count)
        }
      })
      if (r.seen[plan.recipeId] === undefined) problems.push('recipe ' + plan.recipeId + ' never ran')
      var others = Object.keys(r.seen).filter(function (id) { return id !== plan.recipeId })
      if (others.length > 0) problems.push('other recipes seen ' + others.join(','))
      if (plan.fluidsOut.length > 0 && r.hatchesUsed !== plan.fluidsOut.length) problems.push(r.hatchesUsed + ' hatches hold fluid, wanted ' + plan.fluidsOut.length)
      return {
        ok: problems.length === 0,
        detail: plan.recipeId + ' (circuit ' + plan.circuit + ', ' + plan.duration + ' t, ' + plan.eut + ' EU/t): ' + have.join(', ') + ' | ' + used.join(' ; ') +
          ' | recipes seen=[' + seenIds(r) + ']' + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '')
      }
    }
    return sc
  }

  function scenarios() {
    return ['volatiles', 'regolith_electrolysis', 'titanium_from_ilmenite', 'sintering'].map(recipeScenario)
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
    var list = global.grindless.regolithCell.recipes
    list.forEach(function (plan) {
      resetMachine(m, ctrl)
      fillInputs(m, {
        items: plan.itemsIn.map(function (x) { return { id: x.id, n: x.count } }),
        circuit: plan.circuit
      })
      var ids = candidateIds(ctrl)
      if (ids.indexOf(plan.recipeId) < 0) bad.push(plan.name + ' wanted ' + plan.recipeId + ' got [' + ids.slice(0, 6).join(',') + ']')
    })
    resetMachine(m, ctrl)
    check(KEY, 'LOOKUP', bad.length === 0, 'cases=' + list.length + (bad.length > 0 ? ' unreachable=' + bad.join('; ') : ''))
  }

  // ---------------------------------------------------------------- the machine

  // the chunks of the band are generated and force-loaded on the Moon, and the band (and only the band) is cleared
  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = cmd('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    note(SCOPE, 'AREA', LUNA + ' band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 +
      ' generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function startMachine() {
    var m = { phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false, parts: null, list: null, sc: -1, scStart: 0, seen: {}, stateNoted: false }
    S.machine = m
    try {
      if (!GTRegistries.MACHINES.get(rl(CELL_ID))) {
        check(KEY, 'PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      // the pattern is NOT built here: the structure is placed from the registered description and GTM builds the pattern itself,
      // lazily, when the controller first checks its structure (what happens in a real world)
      var desc = global.grindless.patterns.describe(CELL_ID)
      m.builtBefore = !!(desc && desc.built)
      m.plan = planOf(CELL_ID, CONTROLLER.x, CONTROLLER.y, CONTROLLER.z)
      check(KEY, 'DESCRIPTION', true, 'registered at startup, ' + m.plan.blocks + ' blocks, ' + m.plan.size + ', pattern already built before placing: ' + m.builtBefore)
      if (!place(m.plan)) {
        m.phase = 'done'
        return
      }
      m.ctrl = m.plan.ctrl
      m.t0 = S.t
    } catch (e) {
      check(KEY, 'DESCRIPTION', false, 'exception while describing or placing: ' + e)
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
        check(KEY, 'LOOKUP', false, 'exception: ' + e)
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
    note(KEY, 'INPUT_' + sc.name, 'bus=[' + itemSummary(readBus(m.parts.inBuses[0])) + '] circuit=' + sc.circuit)
    m.scStart = S.t
  }

  function partsProblem(P) {
    var problems = []
    if (P.energy.length !== NEED.energy) problems.push('energy hatches ' + P.energy.length + ' (wanted ' + NEED.energy + ')')
    if (P.inBuses.length !== NEED.inBuses) problems.push('input buses ' + P.inBuses.length + ' (wanted ' + NEED.inBuses + ')')
    if (P.outBuses.length !== NEED.outBuses) problems.push('output buses ' + P.outBuses.length + ' (wanted ' + NEED.outBuses + ')')
    if (P.outHatches.length !== NEED.outHatches) problems.push('output hatches ' + P.outHatches.length + ' (wanted ' + NEED.outHatches + ')')
    return problems
  }

  function advance(m) {
    var ctrl = machineAt(m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check(KEY, 'FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }

    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        check(KEY, 'FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') +
          'parts=[' + partIds(ctrl).join(' ') + '] tier=' + (ctrl.getTier ? ctrl.getTier() : '?'))
        check(KEY, 'PATTERN', global.grindless.patterns.describe(CELL_ID).built,
          'built by GTM itself on the first structure check (already built before placing: ' + m.builtBefore + ')')
        m.parts = findParts(ctrl)
        var problems = partsProblem(m.parts)
        check(KEY, 'PARTS', problems.length === 0, problems.length > 0 ? problems.join('; ') :
          '1 EV energy hatch, 1 input bus, 1 output bus, 5 output hatches in the brick floor and walls')
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
        if (!global.grindless.patterns.describe(CELL_ID).built) {
          check(KEY, 'FORMED', false, 'not formed after ' + waited + ' ticks and GTM never built the pattern')
          m.phase = 'done'
          return
        }
        if (!ctrl.checkPatternWithLock()) {
          check(KEY, 'FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
          m.phase = 'done'
          return
        }
        check(KEY, 'FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
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
        note(KEY, 'STATE_' + sc.name, 'after ' + running + ' ticks: ' + recipeState(ctrl) + ' ' + diagnose(ctrl))
      }
      if (running >= sc.ticks) {
        var verdict = null
        try {
          verdict = sc.verify(collect(m))
        } catch (e) {
          verdict = { ok: false, detail: 'exception while checking: ' + e }
        }
        check(KEY, 'PROCESS_' + sc.name, verdict.ok, verdict.detail + ' | ' + recipeState(ctrl))
        nextScenario(m, ctrl)
      }
    }
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      cmd('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    } catch (e) { /* the server stops after the test anyway */ }
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
        check(KEY, 'STEP', false, 'exception in ' + m.phase + ': ' + e)
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
      check(SCOPE, 'run', false, 'exception: ' + e)
      finish()
    }
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, level: server.getLevel(LUNA), t: 0, tick0: now, nextAt: now + STEP, machine: null, finished: false }
    guarded('static', staticChecks)
    if (S.level === null || S.level === undefined) {
      check(SCOPE, 'moon_level', false, LUNA + ' is not loaded')
      finish()
      return
    }
    guarded('AREA', prepareWorld)
    startMachine()
    if (S.machine === null || S.machine.phase === 'done') finish()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_regolith_cell', function (event) {
    if (S !== null && !S.finished) {
      note(SCOPE, 'run', 'a previous gg_test_regolith_cell run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
