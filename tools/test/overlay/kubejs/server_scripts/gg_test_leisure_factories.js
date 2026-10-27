// priority: -3224
// Gregtech Grindless - smoke test of the four MV universal factories (TEST-ONLY overlay: copied over the instance on the test PC,
// never shipped with the pack): startup_scripts/grindless/mv/leisure_factories.js (machines, modes, the `bores` cap and the mode
// veto) and server_scripts/grindless/mv/leisure_factories.js (controller recipes).
//
//   powershell -NoProfile -ExecutionPolicy Bypass -File tools\test\Invoke-GGTest.ps1 -Suite server -Commands 'kubejs custom_command gg_test_leisure_factories;;kubejs custom_command gg_dump' -WaitForLog 'GGTEST\|leisure_factories\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|<scope>|<check>|PASS|FAIL|NOTE|<detail>   (scope = leisure_factories or a machine id)
//   leisure_factories|registry      the four machines of global.grindless.universalFactories are registered
//   leisure_factories|modes         each definition's recipe types, in order, are the published `types`
//   leisure_factories|crafting      the published controller recipes exist and make their machine (a NOTE if the result is unreadable)
//   leisure_factories|structures    lib/patterns.js recorded a description of each factory
//   leisure_factories|AREA          NOTE: the band is generated, force-loaded and cleared
//   <machine>|DESCRIPTION / PLACED / FORMED / PATTERN / PREVIEW   the registered description is placed block by block (with the
//                                   published casing, core block and minimum of each part), forms, GTM builds the pattern and
//                                   previews it
//   <machine>|TIER                  NOTE: tier and overclock voltage once formed (one MV energy hatch: 2 / 128)
//   <processing>|MODE_INDEX         the lathe and polarizer modes are among the controller's recipe types
//   <processing>|RECIPES            NOTE: the live GTM recipes the scenarios use (EU/t, duration, outputs)
//   <processing>|INPUT_<s>, STATE_<s>, SWITCH   NOTE: what went in, the recipe logic after 60 ticks, when the mode was switched
//   <processing>|PROCESS_LATHE      8 iron ingots in lathe mode -> 8 rods + 16 small iron dust at 4 parallels (the cap binds), each
//                                   parallel paying its full EU/t, no overclock
//   <processing>|PROCESS_SWITCH     16 iron ingots in lathe mode, switched to polarizer (exactly what the GUI mode tab does) while the
//                                   first lathe run works -> that run finishes (4 rods + 8 small dust), the other 12 ingots are
//                                   polarized; without the veto GTM 7.5.3 keeps reusing its cached lathe recipe
//   leisure_factories|DONE          last line
// (<processing> = gtceu:universal_processing_factory)
//
// Machines (all facing north in the overworld; the test only uses its own band, X 6400..6463, Y 98..112, Z 0..15 = chunks
// 400..403,0, which is generated, force-loaded and cleared first - other tests use other bands of the same server). Each factory is
// one 5 x 3 x 3 hall behind its controller (z 2..4) with the minimum parts: one MV energy hatch, one input bus, one output bus.
//   processing (6404, 100, 2)   assembly (6420, 100, 2)   separation (6436, 100, 2)   mixing (6452, 100, 2)
// The assembly, separation and mixing factories only have to form (same hall, parts and modifier). The processing scenarios run
// one after the other (buses and recipe logic reset in between); the recipe logic is watched and the energy hatch refilled every
// tick. Expected numbers come from global.grindless.universalFactories (cap, types, casing, core blocks, parts, crafting ids) and
// from the live GTM recipes (EU/t, duration). var + function everywhere (this Rhino throws "redeclaration of var" for const/let
// inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'leisure_factories'
  var STEP = 10
  var FORM_TIMEOUT = 300

  // The pack's Additional Placements mod rebuilds its block tags and reloads the datapacks (so these scripts too) a couple of
  // seconds after the server is up; a test that is running then is lost and its static checks can see empty tags. The command
  // therefore only leaves a request in `global` (it survives script reloads) and the tick handler starts the test once these scripts
  // have been loaded for QUIET_MS.
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestLeisureFactoriesRequest'

  // this test's band of the overworld: X 6400..6463, Y 98..112, Z 0..15
  var X0 = 6400
  var X1 = 6463
  // one controller per published factory, in the order of global.grindless.universalFactories.factories
  var CONTROLLERS = [
    { x: 6404, y: 100, z: 2 },
    { x: 6420, y: 100, z: 2 },
    { x: 6436, y: 100, z: 2 },
    { x: 6452, y: 100, z: 2 }
  ]

  var PART_BLOCKS = {
    energy_input: 'gtceu:mv_energy_input_hatch',
    input_bus: 'gtceu:mv_input_bus',
    output_bus: 'gtceu:mv_output_bus',
    input_hatch: 'gtceu:mv_input_hatch',
    output_hatch: 'gtceu:mv_output_hatch'
  }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  // the processing scenarios: two modes of the factory and their GTM iron recipes (EU/t and duration are read live)
  var PROCESSING = 'gtceu:universal_processing_factory'
  var LATHE_TYPE = 'gtceu:lathe'
  var POLARIZER_TYPE = 'gtceu:polarizer'
  var LATHE_RECIPE = 'gtceu:lathe/lathe_iron_to_rod'
  var POLARIZER_RECIPE = 'gtceu:polarizer/polarize_iron_ingot'
  // what GTM 7.5.3's sources give, only quoted in the RECIPES note (the checks use the live values)
  var LATHE_SOURCE = '16 EU/t, 112 ticks'
  var POLARIZER_SOURCE = '16 EU/t, 56 ticks'
  var INGOT = 'minecraft:iron_ingot'
  var ROD = 'gtceu:iron_rod'
  var SMALL_DUST = 'gtceu:small_iron_dust'
  var MAGNETIC = 'gtceu:magnetic_iron_ingot'
  // per ingot: the lathe makes 1 rod + 2 small piles of dust (GTM's harderRods, on by default), the polarizer 1 magnetic ingot
  var RODS_PER_INGOT = 1
  var DUST_PER_INGOT = 2
  var MAGNETIC_PER_INGOT = 1
  var LATHE_INGOTS = 8
  var SWITCH_INGOTS = 16
  var LATHE_LIMIT = 600
  var SWITCH_LIMIT = 900

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
        Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack')
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

  // gtceu:universal_processing_factory -> processing
  function shortName(id) {
    return String(id).replace('gtceu:universal_', '').replace('_factory', '')
  }

  // GTRecipeType[] -> their registry names, in order
  function typeNames(types) {
    var out = []
    for (var i = 0; i < types.length; i++) out.push(String(types[i].registryName))
    return out
  }

  function factories() {
    return S.uf && S.uf.factories ? S.uf.factories : []
  }

  // ---------------------------------------------------------------- static checks

  function safely(name, fn) {
    try {
      fn()
    } catch (e) {
      check(SCOPE, name, false, 'exception: ' + e)
    }
  }

  function staticChecks() {
    var list = factories()

    safely('registry', function () {
      var missing = list.filter(function (f) { return !GTRegistries.MACHINES.get(rl(f.id)) }).map(function (f) { return f.id })
      check(SCOPE, 'registry', !!S.uf && list.length === CONTROLLERS.length && missing.length === 0,
        (S.uf ? 'published factories=' + list.length + '/' + CONTROLLERS.length + ' parallels=' + S.uf.parallels + ' casing=' + S.uf.casing
          : 'global.grindless.universalFactories is not published') +
        ' registered=' + (list.length - missing.length) + (missing.length > 0 ? ' missing=' + missing.join(',') : ''))
    })

    safely('modes', function () {
      var counts = []
      var bad = []
      list.forEach(function (f) {
        var def = GTRegistries.MACHINES.get(rl(f.id))
        if (!def) {
          bad.push(shortName(f.id) + ' is not registered')
          return
        }
        var got = typeNames(def.getRecipeTypes())
        var want = f.types.map(function (t) { return String(t) })
        counts.push(shortName(f.id) + '=' + got.length)
        if (got.join(',') !== want.join(',')) {
          bad.push(shortName(f.id) + ' registered [' + got.join(',') + '] published [' + want.join(',') + ']')
        }
      })
      check(SCOPE, 'modes', list.length > 0 && bad.length === 0,
        (list.length === 0 ? 'no published factories' : counts.join(' ')) + (bad.length > 0 ? ' mismatch: ' + bad.join('; ') : ''))
    })

    safely('crafting', function () {
      var rm = S.server.getRecipeManager()
      var craft = S.uf ? S.uf.crafting : null
      var made = []
      var problems = []
      var unreadable = []
      list.forEach(function (f) {
        var id = craft ? craft[f.id] : null
        if (!id) {
          problems.push(f.id + ' has no published recipe id')
          return
        }
        var opt = rm.byKey(rl(id))
        if (!opt.isPresent()) {
          problems.push('no recipe ' + id)
          return
        }
        try {
          var res = opt.get().getResultItem(S.server.registryAccess())
          var resId = String(res.getId())
          made.push(id + ' -> ' + resId + ' x' + res.getCount())
          if (resId !== f.id) problems.push(id + ' makes ' + resId + ' instead of ' + f.id)
        } catch (e) {
          unreadable.push(id + ' (' + e + ')')
        }
      })
      check(SCOPE, 'crafting', !!craft && list.length > 0 && problems.length === 0,
        'recipes=' + (made.length + unreadable.length) + '/' + list.length + (made.length > 0 ? ' [' + made.join('; ') + ']' : '') +
        (problems.length > 0 ? ' problems: ' + problems.join('; ') : ''))
      if (unreadable.length > 0) {
        note(SCOPE, 'crafting', 'result not readable from the script, only the existence was checked: ' + unreadable.join('; '))
      }
    })

    safely('structures', function () {
      var found = []
      var missing = []
      list.forEach(function (f) {
        var d = global.grindless.patterns.describe(f.id)
        if (!d) {
          missing.push(f.id)
          return
        }
        found.push(shortName(f.id) + ' ' + d.slices[0][0].length + 'x' + d.slices[0].length + 'x' + d.slices.length +
          ' symbols=' + Object.keys(d.symbols).sort().join(''))
      })
      check(SCOPE, 'structures', list.length > 0 && missing.length === 0,
        'described=' + found.length + '/' + list.length + (found.length > 0 ? ' [' + found.join('; ') + ']' : '') +
        (missing.length > 0 ? ' no description: ' + missing.join(',') : ''))
    })
  }

  // ---------------------------------------------------------------- structures (same technique as gg_test_mv_multis.js)

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

  // a "casing OR parts" cell: the parts the limits ask for (exact, else min) are spread evenly over the cells, the rest is the
  // plain block
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

  // the published casing and core block are placed, and every part as many times as its published minimum
  function publishedCheck(plan, f) {
    var byId = {}
    var parts = {}
    plan.cells.forEach(function (c) {
      byId[c.block.id] = (byId[c.block.id] || 0) + 1
      if (c.block.ability) parts[c.block.ability] = (parts[c.block.ability] || 0) + 1
    })
    var problems = []
    if (!byId[S.uf.casing]) problems.push('no ' + S.uf.casing)
    if (!byId[f.coreBlock]) problems.push('no ' + f.coreBlock)
    f.parts.forEach(function (p) {
      var placed = parts[p.name] || 0
      if (placed !== Number(p.min)) problems.push(p.name + ' x' + placed + ' (published min ' + p.min + ')')
    })
    return {
      ok: problems.length === 0,
      detail: 'casing ' + S.uf.casing + ' x' + (byId[S.uf.casing] || 0) + ', core ' + f.coreBlock + ' x' + (byId[f.coreBlock] || 0) +
        ', parts ' + Object.keys(parts).sort().map(function (k) { return k + ' x' + parts[k] }).join(' ') +
        (problems.length > 0 ? ', mismatch: ' + problems.join('; ') : '')
    }
  }

  function setBlock(c) {
    return S.server.runCommandSilent('setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
  }

  // everything but the controller first, the controller last
  function place(plan, scope) {
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

  // the parts the preview must show: those with a published minimum of one or more
  function previewParts(f) {
    return f.parts.filter(function (p) { return Number(p.min) >= 1 }).map(function (p) { return String(p.name) })
  }

  // the structure preview EMI / JEI draw: size and the parts it contains
  function previewCheck(scope, id, def, plan, wantParts) {
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
    check(scope, 'PREVIEW', shapes.length >= 1 && missing.length === 0,
      'shapes=' + shapes.length + ' blocks=' + total + ' (placed structure: ' + plan.blocks + ') parts wanted=' + wantParts.join(',') +
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

  function busCount(bus) {
    var counts = readBus(bus)
    var n = 0
    Object.keys(counts).forEach(function (id) { n += counts[id] })
    return n
  }

  function clearInventory(inv) {
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
  }

  function findParts(ctrl) {
    var P = { energy: [], inBus: null, outBuses: [], inHatches: [], outHatch: null }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.energy_input) P.energy.push(p)
      else if (pid === PART_BLOCKS.input_bus) P.inBus = p
      else if (pid === PART_BLOCKS.output_bus) P.outBuses.push(p)
      else if (pid === PART_BLOCKS.input_hatch) P.inHatches.push(p)
      else if (pid === PART_BLOCKS.output_hatch) P.outHatch = p
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
    P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    if (P.outHatch !== null) P.outHatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
  }

  function resetMachine(m, ctrl) {
    var P = m.parts
    clearInventory(P.inBus.getInventory())
    clearInventory(P.inBus.getCircuitInventory())
    P.outBuses.forEach(function (b) { clearInventory(b.getInventory()) })
    emptyHatches(P)
    ctrl.getRecipeLogic().resetRecipeLogic()
  }

  function unexpectedItems(counts, allowed) {
    return Object.keys(counts).filter(function (id) { return allowed.indexOf(id) < 0 })
  }

  function seenAny(r, id) {
    return r.seen[id] === true
  }

  // ---------------------------------------------------------------- recipe logic

  function recipeState(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() +
        ' lastRecipe=' + (last ? last.id + ' parallels=' + last.parallels : 'none') +
        ' mode=' + ctrl.getActiveRecipeType() + ' (' + ctrl.getRecipeType().registryName + ')'
    } catch (e) {
      return 'recipe state unreadable: ' + e
    }
  }

  // what GTM's own recipe lookup and matching say about the machine right now (added to a failing scenario)
  function diagnose(ctrl) {
    var out = []
    try {
      var match = ctrl.getRecipeType().db().find(ctrl)
      if (!match) {
        out.push('lookup=none')
      } else {
        var helper = lazy().Helper
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

  // every tick: the recipes seen (in order), the most parallels, and per recipe the EU/t and durations seen while WORKING
  function observe(m, ctrl) {
    var rlg = ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    if (last === null || last === undefined) return
    var id = String(last.id)
    if (!m.seen[id]) {
      m.seen[id] = true
      m.order.push(id)
    }
    var par = Number(last.parallels)
    if (par > m.maxPar) m.maxPar = par
    if (!rlg.isWorking()) return
    var run = m.runs[id]
    if (!run) {
      run = { eut: {}, minDur: 0, maxPar: 0 }
      m.runs[id] = run
    }
    run.eut[String(Number(lazy().Helper.getRealEUt(last).getTotalEU()))] = true
    var dur = Number(rlg.getDuration())
    if (dur > 0 && (run.minDur === 0 || dur < run.minDur)) run.minDur = dur
    if (par > run.maxPar) run.maxPar = par
  }

  function tierText(ctrl) {
    try {
      return 'tier=' + ctrl.getTier() + ' overclock voltage=' + ctrl.getOverclockVoltage() + ' V (expected with one MV energy hatch: MV = 2 / 128)'
    } catch (e) {
      return 'tier unreadable: ' + e
    }
  }

  // ---------------------------------------------------------------- processing scenarios (the processing factory only)

  // a GTM recipe as the recipe manager holds it: EU/t (RecipeHelper, GTRecipe#getInputEUt is not reachable from here), duration
  // and outputs
  function readRecipe(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    if (!opt.isPresent()) return null
    var r = opt.get()
    var info = { id: id, type: 'unknown', eut: Number(lazy().Helper.getRealEUt(r).getTotalEU()), dur: Number(r.duration), outputs: 'unreadable' }
    try {
      info.type = String(r.getType().registryName)
    } catch (e1) { /* only for the note */ }
    try {
      info.outputs = asArray(lazy().Helper.getOutputItems(r)).map(function (st) { return String(st.getId()) + ' x' + st.getCount() }).join(', ')
    } catch (e2) {
      info.outputs = 'unreadable (' + e2 + ')'
    }
    return info
  }

  function recipeText(info, source) {
    return info.id + ' (' + info.type + '): ' + info.eut + ' EU/t, ' + info.dur + ' ticks (GTM source: ' + source + '), outputs [' + info.outputs + ']'
  }

  // the two modes, looked up by registry name in the controller's own list, and the two live recipes
  function prepareProcessing(m, ctrl) {
    var names = typeNames(ctrl.getRecipeTypes())
    var latheIdx = names.indexOf(LATHE_TYPE)
    var polIdx = names.indexOf(POLARIZER_TYPE)
    check(m.scope, 'MODE_INDEX', latheIdx >= 0 && polIdx >= 0,
      'modes=' + names.length + ' ' + LATHE_TYPE + '=' + latheIdx + ' ' + POLARIZER_TYPE + '=' + polIdx +
      ' active=' + ctrl.getActiveRecipeType() + ' (' + ctrl.getRecipeType().registryName + ')')
    if (latheIdx < 0 || polIdx < 0) return null

    var lathe = readRecipe(LATHE_RECIPE)
    var pol = readRecipe(POLARIZER_RECIPE)
    var bad = []
    if (lathe === null || !(lathe.eut > 0 && lathe.dur > 0)) bad.push(LATHE_RECIPE + (lathe === null ? ' missing' : ' unreadable'))
    if (pol === null || !(pol.eut > 0 && pol.dur > 0)) bad.push(POLARIZER_RECIPE + (pol === null ? ' missing' : ' unreadable'))
    if (bad.length > 0) {
      check(m.scope, 'RECIPES', false, 'cannot run the scenarios: ' + bad.join(', '))
      return null
    }
    note(m.scope, 'RECIPES', recipeText(lathe, LATHE_SOURCE) + '; ' + recipeText(pol, POLARIZER_SOURCE))
    return { latheIdx: latheIdx, polIdx: polIdx, lathe: lathe, pol: pol, voltage: Number(ctrl.getOverclockVoltage()) }
  }

  function processScenarios() {
    return [
      { name: 'LATHE', ingots: LATHE_INGOTS, limit: LATHE_LIMIT, onTick: null, verify: verifyLathe },
      { name: 'SWITCH', ingots: SWITCH_INGOTS, limit: SWITCH_LIMIT, onTick: switchToPolarizer, verify: verifySwitch }
    ]
  }

  // both scenarios start the same way: clean machine, lathe mode, the ingots in slot 0 of the input bus
  function startScenario(m, ctrl, sc) {
    resetMachine(m, ctrl)
    m.seen = {}
    m.order = []
    m.runs = {}
    m.maxPar = 0
    m.stateNoted = false
    m.switched = null
    m.tickError = null
    var rlg = ctrl.getRecipeLogic()
    ctrl.setActiveRecipeType(m.proc.latheIdx)
    rlg.updateTickSubscription()
    var left = m.parts.inBus.getInventory().insertItem(0, Item.of(INGOT, sc.ingots), false)
    if (!left.isEmpty()) throw new Error('could not insert ' + INGOT + ' x' + sc.ingots + ' into slot 0 (' + left.getCount() + ' left over)')
    rlg.updateTickSubscription()
    m.scTick0 = S.server.getTickCount()
    note(m.scope, 'INPUT_' + sc.name, 'mode ' + ctrl.getActiveRecipeType() + ' (' + ctrl.getRecipeType().registryName + ') input bus=[' +
      itemSummary(readBus(m.parts.inBus)) + '] circuit=none energy hatches=' + m.parts.energy.length + ' output buses=' + m.parts.outBuses.length +
      ' cap=' + S.uf.parallels + ' overclock voltage=' + m.proc.voltage + ' V')
  }

  function nextScenario(m, ctrl) {
    while (true) {
      m.sc++
      if (m.sc >= m.scenarios.length) {
        m.phase = 'done'
        return
      }
      var sc = m.scenarios[m.sc]
      try {
        startScenario(m, ctrl, sc)
        return
      } catch (e) {
        check(m.scope, 'PROCESS_' + sc.name, false, 'could not start the scenario: ' + e)
      }
    }
  }

  // everything the scenario checks look at: the output buses, what is left in the input bus, the recipes seen, the most parallels,
  // the EU/t and durations seen while working, the switch and the mode at the end
  function collect(m, ctrl, running, settled) {
    var counts = {}
    m.parts.outBuses.forEach(function (b) {
      var c = readBus(b)
      Object.keys(c).forEach(function (id) { counts[id] = (counts[id] || 0) + c[id] })
    })
    return {
      items: counts, leftover: readBus(m.parts.inBus), seen: m.seen, order: m.order.slice(), maxPar: m.maxPar, runs: m.runs,
      running: running, settled: settled, switched: m.switched, activeIdx: ctrl.getActiveRecipeType(),
      finalType: String(ctrl.getRecipeType().registryName)
    }
  }

  function ending(r) {
    return (r.settled ? 'done (bus empty, logic idle) after ' : 'still busy after ') + r.running + ' ticks'
  }

  // 8 ingots in lathe mode: two runs of `parallels` copies each (the cap binds: the ingots and the voltage would allow 8); every copy
  // pays its full EU/t, so nothing is left for an overclock
  function verifyLathe(m, r) {
    var P = m.proc
    var L = P.lathe
    var cap = Number(S.uf.parallels)
    var n = LATHE_INGOTS
    var rods = r.items[ROD] || 0
    var dust = r.items[SMALL_DUST] || 0
    var mag = r.items[MAGNETIC] || 0
    var unexpected = unexpectedItems(r.items, [ROD, SMALL_DUST])
    var run = r.runs[L.id] || { eut: {}, minDur: 0, maxPar: 0 }
    var eutSeen = Object.keys(run.eut).map(Number).sort(function (a, b) { return a - b })
    var wantEut = cap * L.eut
    var ok = rods === n * RODS_PER_INGOT && dust === n * DUST_PER_INGOT && mag === 0 && unexpected.length === 0 &&
      r.maxPar === cap && eutSeen.length === 1 && eutSeen[0] === wantEut && run.minDur === L.dur
    return {
      ok: ok,
      detail: n + ' iron ingots in lathe mode, ' + ending(r) + ': rods=' + rods + '/' + (n * RODS_PER_INGOT) +
        ' small dust=' + dust + '/' + (n * DUST_PER_INGOT) + ' magnetic=' + mag + '/0' +
        ' parallels max=' + r.maxPar + '/' + cap + ' (the ' + n + ' ingots allow ' + n + ', ' + P.voltage + ' V / ' + L.eut + ' EU/t allows ' +
        Math.floor(P.voltage / L.eut) + ')' +
        ' EU/t while working=[' + eutSeen.join(',') + '] want ' + wantEut + ' (' + cap + ' x ' + L.eut + ')' +
        ' shortest duration=' + run.minDur + ' want ' + L.dur + ' (no overclock: one would need 4 x ' + wantEut + ' = ' + (4 * wantEut) +
        ' EU/t, the hatch gives ' + P.voltage + ' V)' +
        ' recipes seen=[' + r.order.join(',') + '] left in the bus=[' + itemSummary(r.leftover) + ']' +
        (unexpected.length > 0 ? ' unexpected=' + unexpected.join(',') + ' outputs=[' + itemSummary(r.items) + ']' : '')
    }
  }

  // 16 ingots, lathe -> polarizer while the first lathe run works: that run finishes (one run of `parallels` copies), the next runs
  // are searched in the new mode and polarize the rest
  function verifySwitch(m, r) {
    var P = m.proc
    var cap = Number(S.uf.parallels)
    var n = SWITCH_INGOTS
    var wantRods = cap * RODS_PER_INGOT
    var wantDust = cap * DUST_PER_INGOT
    var wantMag = (n - cap) * MAGNETIC_PER_INGOT
    var rods = r.items[ROD] || 0
    var dust = r.items[SMALL_DUST] || 0
    var mag = r.items[MAGNETIC] || 0
    var unexpected = unexpectedItems(r.items, [ROD, SMALL_DUST, MAGNETIC])
    var ok = r.switched !== null && rods === wantRods && dust === wantDust && mag === wantMag && unexpected.length === 0 &&
      r.maxPar === cap && seenAny(r, P.lathe.id) && seenAny(r, P.pol.id) && r.finalType === POLARIZER_TYPE
    var when = r.switched === null ? 'no switch (the lathe recipe was never seen WORKING)' :
      'switched at scenario tick ' + r.switched.tick + ' (lathe run ' + r.switched.progress + '/' + r.switched.duration + ' at ' +
      r.switched.parallels + ' parallels)'
    return {
      ok: ok,
      detail: (r.switched !== null && rods > wantRods ? 'mode switch ignored: the cached lathe recipe kept running; ' : '') +
        n + ' iron ingots, ' + when + ', ' + ending(r) + ': rods=' + rods + '/' + wantRods + ' small dust=' + dust + '/' + wantDust +
        ' magnetic=' + mag + '/' + wantMag + ' parallels max=' + r.maxPar + '/' + cap + ' recipes seen=[' + r.order.join(',') + ']' +
        ' mode at the end=' + r.activeIdx + ' (' + r.finalType + ', want ' + POLARIZER_TYPE + ') left in the bus=[' + itemSummary(r.leftover) + ']' +
        (unexpected.length > 0 ? ' unexpected=' + unexpected.join(',') + ' outputs=[' + itemSummary(r.items) + ']' : '')
    }
  }

  // GTM's GUI mode tab (MachineModeFancyConfigurator) does exactly this: setActiveRecipeType + updateTickSubscription, nothing else.
  // Called every tick; switches the first tick the lathe recipe is WORKING.
  function switchToPolarizer(m, ctrl, t) {
    if (m.switched !== null) return
    var rlg = ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    if (!rlg.isWorking() || last === null || last === undefined || String(last.id) !== m.proc.lathe.id) return
    m.switched = { tick: t, progress: Number(rlg.getProgress()), duration: Number(rlg.getDuration()), parallels: Number(last.parallels),
      left: busCount(m.parts.inBus) }
    ctrl.setActiveRecipeType(m.proc.polIdx)
    ctrl.getRecipeLogic().updateTickSubscription()
    note(m.scope, 'SWITCH', 'mode ' + m.proc.latheIdx + ' -> ' + ctrl.getActiveRecipeType() + ' (' + ctrl.getRecipeType().registryName +
      ') at scenario tick ' + t + ' while the lathe run was at ' + m.switched.progress + '/' + m.switched.duration + ' with ' +
      m.switched.parallels + ' parallels and ' + m.switched.left + ' ingots in the bus (setActiveRecipeType + updateTickSubscription only)')
  }

  function finishScenario(m, ctrl, sc, running, settled) {
    var verdict = null
    try {
      verdict = sc.verify(m, collect(m, ctrl, running, settled))
    } catch (e) {
      verdict = { ok: false, detail: 'exception while checking: ' + e }
    }
    if (m.tickError !== null) {
      verdict.ok = false
      verdict.detail += '; the tick watcher threw: ' + m.tickError
    }
    check(m.scope, 'PROCESS_' + sc.name, verdict.ok, verdict.detail + ' / ' + recipeState(ctrl) + (verdict.ok ? '' : ' / ' + diagnose(ctrl)))
  }

  // every tick, while a scenario runs: observe the recipe logic and give the scenario its tick hook
  function watchTick(m, now) {
    if (m.scenarios === null || m.sc < 0 || m.sc >= m.scenarios.length) return
    var ctrl = machineAt(m.ctrl)
    if (ctrl === null || ctrl === undefined) return
    observe(m, ctrl)
    var sc = m.scenarios[m.sc]
    if (sc.onTick) sc.onTick(m, ctrl, now - m.scTick0)
  }

  function startProcessing(m, ctrl) {
    m.parts = findParts(ctrl)
    if (m.parts.inBus === null || m.parts.outBuses.length === 0 || m.parts.energy.length === 0) {
      check(m.scope, 'PARTS', false, 'missing parts: input bus=' + (m.parts.inBus !== null) + ' output buses=' + m.parts.outBuses.length +
        ' energy hatches=' + m.parts.energy.length)
      m.phase = 'done'
      return
    }
    try {
      m.proc = prepareProcessing(m, ctrl)
    } catch (e) {
      check(m.scope, 'RECIPES', false, 'exception while reading the modes and recipes: ' + e)
      m.proc = null
    }
    if (m.proc === null) {
      m.phase = 'done'
      return
    }
    m.scenarios = processScenarios()
    m.sc = -1
    m.phase = 'running'
    topUpEnergy(m)
    nextScenario(m, ctrl)
  }

  // ---------------------------------------------------------------- machines

  // this test's own band of the overworld: X 6400..6463, Y 98..112, Z 0..15 (chunks 400..403,0)
  function prepareWorld() {
    for (var cx = X0 >> 4; cx <= X1 >> 4; cx++) S.level.getChunk(cx, 0)
    S.server.runCommandSilent('forceload add ' + X0 + ' 0 ' + X1 + ' 15')
    var cleared = S.server.runCommandSilent('fill ' + X0 + ' 98 0 ' + X1 + ' 112 15 air')
    note(SCOPE, 'AREA', 'chunks ' + (X0 >> 4) + '..' + (X1 >> 4) + ',0 (X ' + X0 + '..' + X1 + ') generated and force-loaded, changed ' +
      cleared + ' blocks while clearing')
  }

  function startMachine(f, pos) {
    var scope = String(f.id)
    var m = { id: scope, scope: scope, f: f, phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false, parts: null,
      process: scope === PROCESSING, proc: null, scenarios: null, sc: -1, scTick0: 0, seen: {}, order: [], runs: {}, maxPar: 0,
      stateNoted: false, switched: null, tickError: null }
    S.machines.push(m)
    try {
      var def = GTRegistries.MACHINES.get(rl(scope))
      if (def === null || def === undefined) {
        check(scope, 'PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      // the pattern is NOT built here: the structure is placed from the registered description and GTM builds the
      // pattern itself, lazily, when the controller first checks its structure (what happens in a real world)
      var desc = global.grindless.patterns.describe(scope)
      m.builtBefore = !!(desc && desc.built)
      m.def = def
      m.plan = planOf(scope, pos.x, pos.y, pos.z)
      var pub = publishedCheck(m.plan, f)
      check(scope, 'DESCRIPTION', pub.ok, 'registered at startup, ' + m.plan.blocks + ' blocks, ' + m.plan.size + ', ' + pub.detail +
        ', pattern already built before placing: ' + m.builtBefore)
      if (!place(m.plan, scope)) {
        m.phase = 'done'
        return
      }
      m.ctrl = m.plan.ctrl
      m.t0 = S.t
    } catch (e) {
      check(scope, 'DESCRIPTION', false, 'exception while describing/placing: ' + e)
      m.phase = 'done'
    }
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
          'parts=[' + partIds(ctrl).join(' ') + '] flipped=' + ctrl.isFlipped() + ' tier=' + (ctrl.getTier ? ctrl.getTier() : '?'))
        check(m.scope, 'PATTERN', global.grindless.patterns.describe(m.id).built,
          'built by GTM itself on the first structure check (already built before placing: ' + m.builtBefore + ')')
        try {
          previewCheck(m.scope, m.id, m.def, m.plan, previewParts(m.f))
        } catch (e3) {
          check(m.scope, 'PREVIEW', false, 'exception: ' + e3)
        }
        note(m.scope, 'TIER', tierText(ctrl))
        if (!m.process) {
          m.phase = 'done'
          return
        }
        startProcessing(m, ctrl)
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
      var running = S.server.getTickCount() - m.scTick0
      if (!m.stateNoted && running >= 60) {
        m.stateNoted = true
        note(m.scope, 'STATE_' + sc.name, 'after ' + running + ' ticks: ' + recipeState(ctrl) + ' input bus=[' + itemSummary(readBus(m.parts.inBus)) + ']')
      }
      // done as soon as every ingot went in and the logic is idle again (the outputs of the last run are out by then)
      var settled = m.order.length > 0 && busCount(m.parts.inBus) === 0 && ctrl.getRecipeLogic().isIdle()
      if (settled || running >= sc.limit) {
        finishScenario(m, ctrl, sc, running, settled)
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

  // every tick: refill the energy hatches and watch the running scenario (the mode switch must happen on the right tick); every
  // STEP ticks: advance the machines
  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    S.machines.forEach(function (m) {
      if (m.phase !== 'running') return
      try {
        topUpEnergy(m)
      } catch (e) { /* the next step reports problems */ }
      try {
        watchTick(m, now)
      } catch (e2) {
        if (m.tickError === null) m.tickError = String(e2)
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
    var G = global.grindless
    S = { server: server, level: server.overworld(), t: 0, tick0: now, nextAt: now + STEP, machines: [], finished: false,
      uf: G && G.universalFactories ? G.universalFactories : null }
    try {
      staticChecks()
    } catch (e) {
      check(SCOPE, 'static', false, 'exception: ' + e)
    }
    try {
      prepareWorld()
    } catch (e1) {
      check(SCOPE, 'AREA', false, 'exception: ' + e1)
    }
    var list = factories()
    for (var i = 0; i < list.length && i < CONTROLLERS.length; i++) startMachine(list[i], CONTROLLERS[i])
    if (allDone()) finish()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_leisure_factories', function (event) {
    if (S !== null && !S.finished) {
      note(SCOPE, 'run', 'a previous gg_test_leisure_factories run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
