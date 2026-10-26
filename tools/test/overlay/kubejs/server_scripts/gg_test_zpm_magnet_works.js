// Gregtech Grindless - smoke test of ZPM's Naquadria Magnet Works and the ZPM wireless tier (package ZPM-A5; TEST-ONLY overlay:
// copied over the instance on the test PC, never shipped with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -Commands 'kubejs custom_command gg_test_zpm_magnet_works' `
//     -WaitForLog 'GGTEST\|zpm_magnet_works\|DONE@@180'
//
// What it proves:
//   zpm_magnet_works|registration   the recipe type with its IO sizes, the machine, the HTS insert, the cryostat casing, the ZPM cell and its
//                                   hatches and covers
//   zpm_magnet_works|recipes        the three recipes under their final ids with the script's duration, EU/t and ids; no clash of lookup
//                                   paths; the controller's and the casing's crafting recipes
//   zpm_magnet_works|TOWER          a Wireless Energy Tower with ONE ZPM SMES cell forms, is tracked, and the network reports its capacity
//                                   exactly: 3,932,160,000 EU, above 2^31 (S0-7), tier ZPM
//   zpm_magnet_works|DESCRIPTION / PLACED / FORMED / PARTS   the magnet works placed block by block and formed by itself
//   zpm_magnet_works|DONE           last line
//
// TEST AREA: ONLY the band X 20224-20287, Y 98-112, Z 0-63 (force-loaded and cleared); the works faces north with its controller at
// (20240, 100, 40), the tower with its controller at (20272, 100, 40). var + function everywhere (this Rhino throws "redeclaration of var"
// for const/let inside functions that run twice).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'zpm_magnet_works'
  var STEP = 10
  var FORM_TIMEOUT = 600
  var BAND = { x0: 20224, x1: 20287, y0: 98, y1: 112, z0: 0, z1: 63 }
  var WORKS = { x: 20240, y: 100, z: 40 }
  var TOWER = { x: 20272, y: 100, z: 40 }

  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestZpmMagnetWorksRequest'

  var MACHINE_ID = 'gtceu:naquadria_magnet_works'
  var TYPE_ID = 'gtceu:naquadria_magnets'
  var CELL_ID = 'grindless:zpm_smes_cell'
  var WANT_CAPACITY = 3932160000

  var PART_BLOCKS = {
    energy_input: 'gtceu:zpm_energy_input_hatch',
    input_bus: 'gtceu:zpm_input_bus',
    output_bus: 'gtceu:zpm_output_bus',
    input_hatch: 'gtceu:zpm_input_hatch'
  }
  var TEST_PARTS = { energy_input: 1, input_bus: 1, output_bus: 1, input_hatch: 1 }
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

  function MW() {
    return global.grindless.magnetWorks
  }

  function W() {
    return global.grindless.wireless
  }

  function fluidName(stack) {
    try {
      return String(lazy().Registries.FLUIDS.getKey(stack.getFluid()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
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

  function ids(list) {
    return list.map(function (x) { return x.id }).sort().join(',')
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var mw = MW()
    var ic = lazy().ItemCap
    var fc = lazy().FluidCap
    var type = GTRegistries.RECIPE_TYPES.get(rl(TYPE_ID))
    var machine = GTRegistries.MACHINES.get(rl(MACHINE_ID))
    var io = mw.maxIO
    var sizes = type ? [type.getMaxInputs(ic), type.getMaxOutputs(ic), type.getMaxInputs(fc), type.getMaxOutputs(fc)] : []
    check('registration_type', !!type && !!machine && sizes.join(',') === [io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut].join(','),
      TYPE_ID + '=' + (type ? 'registered (' + sizes.join('/') + ')' : 'missing') + ' machine=' + (machine ? 'registered' : 'missing'))

    var w = W()
    var problems = []
    ;[CELL_ID, 'grindless:hts_insert', 'grindless:cryostat_casing', 'grindless:zpm_wireless_energy_cover', 'grindless:zpm_wireless_dynamo_cover',
      'gtceu:zpm_wireless_energy_hatch', 'gtceu:zpm_wireless_dynamo_hatch_64a'].forEach(function (id) {
      if (!Item.exists(id)) problems.push('item ' + id + ' missing')
    })
    if (!Fluid.exists(mw.charge.id)) problems.push('fluid ' + mw.charge.id + ' missing')
    var cell = w.cells[CELL_ID]
    if (!cell || Number(cell.tier) !== 7 || Number(cell.capacity) !== WANT_CAPACITY || String(cell.madeBy) !== MACHINE_ID) {
      problems.push('W.cells[' + CELL_ID + '] is ' + JSON.stringify(cell || null))
    }
    if (Number(w.tiers[w.tiers.length - 1]) !== 7) problems.push('the last wireless tier is ' + w.tiers[w.tiers.length - 1])
    if (w.recipes.some(function (r) { return String(r.output) === CELL_ID })) problems.push('the ZPM cell has an assembler recipe')
    check('registration_items', problems.length === 0, problems.join(' ; ') || 'cell, insert, casing, covers and hatches exist; the ZPM row: tier 7, ' + WANT_CAPACITY + ' EU, made by ' + MACHINE_ID)

    var bad = []
    var notes = []
    mw.recipes.forEach(function (p) {
      var live = liveRecipe(p.recipeId)
      if (live === null) {
        bad.push(p.recipeId + ' not in the recipe manager')
        return
      }
      var eut = Number(lazy().Helper.getRealEUt(live).getTotalEU())
      if (Number(live.duration) !== p.duration || eut !== p.eut) bad.push(p.name + ' is ' + live.duration + ' t x ' + eut + ' EU/t, the script wanted ' + p.duration + ' x ' + p.eut)
      var lio = liveIO(live)
      var wantFluids = p.fluidsIn.concat(p.charge ? [mw.charge] : [])
      if (ids(lio.itemsIn) !== ids(p.itemsIn)) bad.push(p.name + ' itemsIn ' + ids(lio.itemsIn))
      if (ids(lio.fluidsIn) !== ids(wantFluids)) bad.push(p.name + ' fluidsIn ' + ids(lio.fluidsIn))
      if (ids(lio.itemsOut) !== ids(p.itemsOut)) bad.push(p.name + ' itemsOut ' + ids(lio.itemsOut))
      notes.push(p.recipeId + ' ' + live.duration + ' t x ' + eut + ' EU/t')
    })
    var have = recipeCount(TYPE_ID)
    check('recipes', have === mw.recipes.length && bad.length === 0, TYPE_ID + '=' + have + ' ; ' + notes.join(' ; ') + (bad.length > 0 ? ' | problems: ' + bad.join(' ; ') : ''))
    if (mw.skipped.length > 0) check('skipped', false, JSON.stringify(mw.skipped))
    check('clashes', mw.clashes.length === 0, mw.clashes.length === 0 ? 'no recipe\'s ingredients are a subset of another\'s (one recipe per lookup path)' : mw.clashes.join(', '))

    var craftBad = []
    var cr = liveRecipe(mw.craftingRecipe)
    if (cr === null) craftBad.push(mw.craftingRecipe + ' missing')
    else {
      var res = cr.getResultItem(S.server.registryAccess())
      if (String(res.getId()) !== MACHINE_ID) craftBad.push(mw.craftingRecipe + ' gives ' + res.getId())
    }
    var kr = liveRecipe(mw.casingRecipe)
    if (kr === null) craftBad.push(mw.casingRecipe + ' missing')
    else {
      var kio = liveIO(kr)
      if (ids(kio.itemsOut) !== 'grindless:cryostat_casing') craftBad.push(mw.casingRecipe + ' gives ' + ids(kio.itemsOut))
    }
    check('crafting', craftBad.length === 0, craftBad.join(' ; ') || 'the controller is craftable and the casing is made in the assembler')
  }

  // ---------------------------------------------------------------- the wireless tower with one ZPM cell

  function towerPlace() {
    var w = W()
    var desc = global.grindless.patterns.describe(w.towerId)
    if (!desc) throw new Error('no structure description for ' + w.towerId)
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    var failed = []
    var cells = 0
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') continue
          var id = null
          if (sym.kind === 'frames') id = 'gtceu:' + sym.materials[0] + '_frame'
          else if (sym.kind === 'blocks') id = sym.blocks[0]
          else if (sym.kind === 'oneOf') {
            if (cells === 0) id = CELL_ID
            else id = w.casing
            cells++
          }
          if (id === null) continue
          var x = TOWER.x - (ci - ctrl.ci)
          var y = TOWER.y + (ri - ctrl.ri)
          var z = TOWER.z - (si - ctrl.si)
          S.server.runCommandSilent('setblock ' + x + ' ' + y + ' ' + z + ' ' + id + ' replace')
          if (blockIdAt(x, y, z) !== id) failed.push(x + ',' + y + ',' + z + ' ' + id)
        }
      })
    })
    S.server.runCommandSilent('setblock ' + TOWER.x + ' ' + TOWER.y + ' ' + TOWER.z + ' ' + w.towerId + '[facing=north] replace')
    // /setblock fires no BlockEvents.placed: the tower is tracked by hand
    w.track(S.level, new BlockPos(TOWER.x, TOWER.y, TOWER.z))
    note('TOWER_PLACED', 'the tower with one ZPM cell and ' + (cells - 1) + ' casing blocks in its other slots' + (failed.length ? ' FAILED ' + failed.slice(0, 5).join('; ') : ''))
  }

  function towerReport() {
    var w = W()
    var st = w.settle(S.server)
    var info = w.towerInfo(machineAt(TOWER))
    var tierOk = Number(st.tier) === 7
    check('TOWER', !!info.formed && Number(info.cells) === 1 && !!st.up && Number(st.capacity) === WANT_CAPACITY && Number(st.capacity) > 2147483647 && tierOk,
      'tower ' + JSON.stringify(info) + '; the network: up ' + st.up + ', ' + st.towers + ' towers, capacity ' + st.capacity + ' EU (want ' + WANT_CAPACITY +
      ', above 2^31), tier ' + st.tier + ' (want 7)')
  }

  // ---------------------------------------------------------------- the works

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
        var n = TEST_PARTS[o.ability]
        if (n === undefined) return
        for (var k = 0; k < n; k++) parts.push(simpleBlock(o))
      } else if (filler === null) {
        filler = simpleBlock(o)
      }
    })
    if (filler === null) throw new Error('a oneOf symbol has no plain block option')
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
    return { cells: placed, size: desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)', blocks: placed.length }
  }

  function setBlock(c) {
    return S.server.runCommandSilent('setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
  }

  function placeWorks(plan) {
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
    check('PLACED', failed.length === 0 && wrong.length === 0,
      'blocks=' + plan.blocks + ' size=' + plan.size + ' controller=' + plan.ctrl.x + ',' + plan.ctrl.y + ',' + plan.ctrl.z +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') + (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
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

  // ---------------------------------------------------------------- the run

  // vanilla's fill takes at most 32,768 blocks: the band goes in strips of 16 along Z
  function fillBand() {
    var n = 0
    for (var z = BAND.z0; z <= BAND.z1; z += 16) {
      n += Number(S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + z + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + Math.min(z + 15, BAND.z1) + ' air'))
    }
    return n
  }

  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = fillBand()
    note('AREA', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 + ' force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function cleanup() {
    try {
      fillBand()
      S.server.runCommandSilent('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      var w = W()
      S.server.persistentData.remove(w.blocksKey)
      S.server.persistentData.remove(w.storeKey)
      w.dropCache()
    } catch (e) {
      note('CLEANUP', 'could not clean up: ' + e)
    }
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    cleanup()
    console.info(TAG + SCOPE + '|DONE')
  }

  function startWorks() {
    var m = { phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false }
    S.machine = m
    try {
      var desc = global.grindless.patterns.describe(MACHINE_ID)
      m.plan = planOf(WORKS.x, WORKS.y, WORKS.z)
      check('DESCRIPTION', !!desc, 'registered at startup, ' + m.plan.blocks + ' blocks, ' + m.plan.size)
      if (!placeWorks(m.plan)) {
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

  function advance(m) {
    var ctrl = machineAt(m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check('FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }
    var waited = S.t - m.t0
    if (ctrl.isFormed()) {
      var parts = partIds(ctrl)
      check('FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') + 'parts=[' + parts.join(' ') + ']')
      var want = ['zpm_energy_input_hatch', 'zpm_input_bus', 'zpm_output_bus', 'zpm_input_hatch']
      var missing = want.filter(function (id) { return parts.indexOf(id) < 0 })
      check('PARTS', missing.length === 0, missing.length === 0 ? 'energy hatch, input bus, input hatch and output bus found' : 'missing ' + missing.join(', '))
      m.phase = 'done'
      return
    }
    if (waited >= FORM_TIMEOUT) {
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
  }

  // setTimeout is not bound in the scripts of this server, so a server-tick handler drives the steps
  function step(elapsed) {
    S.t = elapsed
    var m = S.machine
    if (S.towerAt === null && elapsed >= 100) {
      try { towerReport() } catch (e) { check('TOWER', false, 'exception: ' + e) }
      S.towerAt = elapsed
    }
    if (m !== null && m.phase !== 'done') {
      try {
        advance(m)
      } catch (e) {
        check('STEP', false, 'exception in ' + m.phase + ': ' + e)
        m.phase = 'done'
      }
    }
    if ((m === null || m.phase === 'done') && S.towerAt !== null) finish()
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
    S = { server: server, level: server.overworld(), t: 0, tick0: now, nextAt: now + STEP, machine: null, towerAt: null, finished: false }
    try {
      staticChecks()
    } catch (e) {
      check('static', false, 'exception: ' + e)
    }
    try {
      prepareWorld()
      towerPlace()
    } catch (e) {
      check('TOWER', false, 'exception placing: ' + e)
      S.towerAt = 0
    }
    startWorks()
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

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_zpm_magnet_works', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_zpm_magnet_works run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
