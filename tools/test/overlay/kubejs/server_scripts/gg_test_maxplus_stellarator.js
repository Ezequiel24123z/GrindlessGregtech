// priority: -5283
// TEST ONLY, B13-STEL (gtceu:polarized_fusion_stellarator). Command: kubejs custom_command gg_test_maxplus_stellarator
// Band ONLY: X 48896-48959, Z 0-63, Y 98-125 in the Overworld; zones.json row maxplus_stellarator.
//   T1 (named uncertainties):
//     formed      the stellarator (31 x 11 x 31) forms on a bus, an input hatch, two output hatches and eight 64 A MAX wireless dynamo hatches
//     wear        a fixture row (50% chanced input, 64 parallels) consumes between 16 and 48 of the chanced item: GTM rolls a chanced input per parallel,
//                 not once for the multiplied stack (0 or 64 would mean the wear of the real row is all or nothing)
//     parallels   the real row c1 with fuel for 80 runs starts 64: 2^40 EU/t out, 256 pellets and 64,000 mB of polarized helium-3 taken, the rest left
//     steady      from the first working tick the hatches plus what the settlements took rise by exactly 2^40 EU every tick
//     gain        once every hatch is full each settlement drains exactly 2^40 x 10 EU and puts 19/20 of it into the store; the store equals the sum
//                 of the settlements' deposits as exact digits (BigInteger) and the saved tag's digits equal the store
//     one_hatch   a second stellarator with one dynamo hatch starts 8 runs: 2^37 EU/t, 32 pellets, 8,000 mB
// It takes its turn on the wireless network with the other wireless fixtures (ggTestWirelessQueue), pauses the timed settlements while it runs
// and puts the network's persistent data back at the end. var + function everywhere (this Rhino throws "redeclaration of var" for const/let).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'maxplus_stellarator'
  var REQUEST = 'ggTestMaxplusStellaratorRequest'
  var QUEUE = 'ggTestWirelessQueue'
  var QUIET_MS = 10000
  var TURN_TIMEOUT_MS = 180000
  var FORM_TIMEOUT = 900
  var DEADLINE = 4000
  var LOADED_AT = Date.now()
  var BAND = { x0: 48896, x1: 48959, y0: 98, y1: 125, z0: 0, z1: 63 }
  var BOX_X = 48897
  var BOX_Y = 98
  var BOX_Y_B = 112
  var BOX_Z_A = 1
  var BOX_Z_B = 1
  var TOWER_X0 = 48936
  var TOWER_STEP = 10
  var TOWERS = 2
  var TOWER = { y: 100, z: 40 }
  var STELLARATOR = 'gtceu:polarized_fusion_stellarator'
  var DYNAMO = 'gtceu:max_wireless_dynamo_hatch_64a'
  var CELL = 'grindless:max_smes_cell'
  var CIRCUIT = 'gtceu:programmed_circuit'
  var PELLET = 'grindless:polarized_hd_pellet'
  var HE3 = 'gtceu:polarized_helium_3'
  var WEAR = ['grindless:neutral_beam_injector', 'grindless:direct_converter_stack', 'grindless:sco2_turbine_module']
  var POPPY = 'minecraft:poppy'
  var CHANCED = 'minecraft:torchflower'
  var RUNS = 64
  var OUT_EUT = 1099511627776
  var ONE_EUT = 137438953472
  var SETTLE = 10
  var MEASURE_TICKS = 400

  var S = null
  var C = null

  function errText(e) {
    var s = ''
    try { s = String(e.message || e) } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 3).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }

  // the fixture row of the wear check: the same type, circuit 2, the same 2^34 EU/t, a sure poppy and a 50% torchflower per run
  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.polarized_fusion('gg_test_maxplus_stellarator:wear')
        .circuit(2)
        .itemInputs('1x ' + POPPY)
        .chancedInput('1x ' + CHANCED, 5000, 0)
        .EUt(-Math.pow(2, 34))
        .duration(20)
    } catch (e) {
      console.error('[gg_test maxplus_stellarator] could not add the fixture row: ' + errText(e))
    }
  })

  function classes() {
    if (C === null) {
      C = {
        Pos: Java.loadClass('net.minecraft.core.BlockPos'),
        ArrayList: Java.loadClass('java.util.ArrayList'),
        Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        BI: Java.loadClass('java.math.BigInteger')
      }
    }
    return C
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000) }
  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = TAG + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }
  function note(name, detail) { emit(name, 'NOTE', detail) }
  function guarded(name, fn) {
    try { fn() } catch (e) { check(name, false, 'exception: ' + errText(e)) }
  }

  function queueList() {
    var s = global[QUEUE]
    s = s === undefined || s === null ? '' : String(s)
    return s === '' ? [] : s.split(',')
  }
  function joinQueue() {
    var q = queueList()
    if (q.indexOf(SCOPE) < 0) q.push(SCOPE)
    global[QUEUE] = q.join(',')
  }
  function leaveQueue() { global[QUEUE] = queueList().filter(function (n) { return n !== SCOPE }).join(',') }
  function myTurn() { return queueList()[0] === SCOPE }

  function W() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.settle !== 'function' || !w.big) throw new Error('global.grindless.wireless is missing or has no exact store (lv/wireless_energy.js)')
    return w
  }
  function bi(s) { return new (classes().BI)(String(s)) }
  function pos(p) { return new (classes().Pos)(p.x, p.y, p.z) }
  function machineAt(p) {
    var m = classes().Meta.getMachine(S.level, pos(p))
    return m === null || m === undefined ? null : m
  }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function partsLike(ctrl, re) {
    var out = []
    array(ctrl.getParts()).forEach(function (p) { if (re.test(String(p.getDefinition().getId()))) out.push(p) })
    return out
  }
  function blockIdAt(x, y, z) { return String(S.level.getBlock(x, y, z).getId()) }
  function digitsOf(tag) {
    var s = ''
    try { s = String(tag.getAsString()) } catch (e) { s = String(tag) }
    return s.replace(/L$/, '')
  }
  function tagDigits() {
    try { return digitsOf(S.server.persistentData.get(W().storeKey)) } catch (e) { return 'unreadable (' + e + ')' }
  }
  function stacksOf(id, n) {
    var out = []
    while (n > 0) { out.push([id, Math.min(64, n)]); n -= 64 }
    return out
  }
  function setBus(p, list) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    var slot = 0
    list.forEach(function (e) { st.setStackInSlot(slot++, e.length > 2 ? Item.of(e[0], e[1], e[2]) : Item.of(e[0], e[1])) })
  }
  function countIn(p, id) {
    var st = p.getInventory().storage
    var n = 0
    for (var i = 0; i < st.getSlots(); i++) {
      var s = st.getStackInSlot(i)
      if (!s.isEmpty() && String(s.getId()) === id) n += Number(s.getCount())
    }
    return n
  }
  function fill(hatch, id, mb) { hatch.tank.setFluidInTank(0, Fluid.of(id, mb).getFluidStack()) }
  function tankMb(hatch) { return Number(hatch.tank.getFluidInTank(0).getAmount()) }
  function eutOf(rec) {
    try { return Math.abs(Number(classes().RecipeHelper.getRealEUtWithIO(rec).getTotalEU())) } catch (e) { return NaN }
  }
  function why(m) {
    try {
      var err = m.getMultiblockState().error
      var p = err.getPos()
      return String(err.getErrorInfo().getString()) + ' at ' + (p ? p.getX() + ',' + p.getY() + ',' + p.getZ() : '?')
    } catch (e) { return 'unknown (' + e + ')' }
  }
  function reasons(m) { try { return String(m.getRecipeLogic().getFailureReasons()) } catch (e) { return 'n/a' } }
  function formCheck(m, waited) {
    if (m === null) return false
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }

  // ---------------------------------------------------------------- the network's persistent data, kept aside while the test runs
  function saveNetwork() {
    var w = W()
    var pd = S.server.persistentData
    S.savedKeys = {}
    ;[w.blocksKey, w.storeKey, w.storesKey, w.legacyKey].forEach(function (k) {
      if (k === undefined || k === null) return
      var t = pd.get(k)
      S.savedKeys[k] = t === null || t === undefined ? null : t.copy()
      pd.remove(k)
    })
    w.dropCache()
    S.wasPaused = w.paused === true
    w.paused = true
  }
  function restoreNetwork() {
    var w = W()
    var pd = S.server.persistentData
    Object.keys(S.savedKeys || {}).forEach(function (k) {
      pd.remove(k)
      var t = S.savedKeys[k]
      if (t !== null) pd.put(k, t)
    })
    w.dropCache()
    w.paused = S.wasPaused === true
    return 'the network\'s keys put back as they were before the test'
  }

  // ---------------------------------------------------------------- the band
  function fillBand() {
    var n = 0
    for (var y = BAND.y0; y <= BAND.y1; y += 14) {
      for (var z = BAND.z0; z <= BAND.z1; z += 16) {
        n += Number(S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + y + ' ' + z + ' ' + BAND.x1 + ' ' + Math.min(y + 13, BAND.y1) + ' ' + Math.min(z + 15, BAND.z1) + ' air'))
      }
    }
    return n
  }
  function inBand(x, y, z) { return x >= BAND.x0 && x <= BAND.x1 && y >= BAND.y0 && y <= BAND.y1 && z >= BAND.z0 && z <= BAND.z1 }
  function put(x, y, z, block, failed) {
    if (!inBand(x, y, z)) throw new Error('refusing to write outside the band: ' + x + ',' + y + ',' + z)
    S.server.runCommandSilent('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
    var id = block.replace(/\[.*$/, '')
    if (blockIdAt(x, y, z) !== id) failed.push(x + ',' + y + ',' + z + ' ' + id)
  }
  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    note('AREA', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 + ' force-loaded, changed ' + fillBand() + ' blocks while clearing')
  }

  // every cell of a structure with its world position when the controller sits at p, facing north
  function cellsOf(id, p) {
    var desc = global.grindless.patterns.describe(id)
    if (!desc) throw new Error('no structure description for ' + id)
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (ctrl === null) throw new Error(id + ' has no controller cell')
    var cells = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          cells.push({ ch: ch, sym: sym, x: p.x - (ci - ctrl.ci), y: p.y + (ri - ctrl.ri), z: p.z - (si - ctrl.si) })
        }
      })
    })
    return { cells: cells, ctrl: ctrl, slices: desc.slices.length, width: desc.slices[0][0].length }
  }
  // the controller position that puts the structure's lowest, leftmost, backmost corner at (bx, by, bz)
  function anchorFor(id, bx, by, bz) {
    var probe = cellsOf(id, { x: 0, y: 0, z: 0 })
    var maxCi = probe.width - 1
    return { x: bx + (maxCi - probe.ctrl.ci), y: by + probe.ctrl.ri, z: bz + (probe.slices - 1 - probe.ctrl.si) }
  }
  function placeStructure(id, p, pick, failed) {
    var at = {}
    cellsOf(id, p).cells.forEach(function (c) {
      var sym = c.sym
      if (sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') return
      var block = pick(c)
      if (!block) return
      put(c.x, c.y, c.z, block + (/hatch|bus/.test(block) ? '[facing=north]' : ''), failed)
      if (!at[c.ch]) at[c.ch] = []
      at[c.ch].push({ x: c.x, y: c.y, z: c.z, block: block })
    })
    put(p.x, p.y, p.z, id + '[facing=north]', failed)
    return at
  }
  // the 'X' part cells take the parts, spread evenly over the cells sorted by z then x; the rest take their first plain block
  function placeStellarator(p, dynamos, failed) {
    var parts = ['gtceu:max_input_bus', 'gtceu:max_input_hatch', 'gtceu:max_output_hatch', 'gtceu:max_output_hatch']
    for (var i = 0; i < dynamos; i++) parts.push(DYNAMO)
    var xs = cellsOf(STELLARATOR, p).cells.filter(function (c) { return c.sym.kind === 'oneOf' })
    xs.sort(function (a, b) { return a.z - b.z || a.x - b.x })
    var chosen = {}
    xs.forEach(function (c, i) { chosen[c.x + ',' + c.y + ',' + c.z] = i })
    var spread = {}
    parts.forEach(function (id, i) { spread[Math.floor(i * (xs.length - 1) / (parts.length - 1))] = id })
    var dyn = []
    placeStructure(STELLARATOR, p, function (c) {
      var sym = c.sym
      if (sym.kind === 'blocks') return sym.blocks[0]
      if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
      if (sym.kind === 'oneOf') {
        var id = spread[chosen[c.x + ',' + c.y + ',' + c.z]]
        if (id) {
          if (id === DYNAMO) dyn.push({ x: c.x, y: c.y, z: c.z })
          return id
        }
        var plain = null
        sym.options.forEach(function (o) { if (!plain && o.kind === 'blocks') plain = o.blocks[0] })
        return plain
      }
      return null
    }, failed)
    return dyn
  }
  function towerPos(i) { return { x: TOWER_X0 + i * TOWER_STEP, y: TOWER.y, z: TOWER.z } }

  function placeAll() {
    var w = W()
    var failed = []
    var tracked = 0
    for (var i = 0; i < TOWERS; i++) {
      placeStructure(w.towerId, towerPos(i), function (c) {
        if (c.sym.kind === 'frames') return 'gtceu:' + c.sym.materials[0] + '_frame'
        if (c.sym.kind === 'blocks') return c.sym.blocks[0]
        if (c.sym.kind === 'oneOf') return CELL
        return null
      }, failed)
      if (w.track(S.level, pos(towerPos(i)))) tracked++
    }
    S.posA = anchorFor(STELLARATOR, BOX_X, BOX_Y, BOX_Z_A)
    S.posB = anchorFor(STELLARATOR, BOX_X, BOX_Y_B, BOX_Z_B)
    S.dynA = placeStellarator(S.posA, 8, failed)
    S.dynB = placeStellarator(S.posB, 1, failed)
    var trackedDyn = 0
    S.dynA.forEach(function (d) { if (w.track(S.level, pos(d))) trackedDyn++ })
    var ok = failed.length === 0 && tracked === TOWERS && S.dynA.length === 8 && S.dynB.length === 1 && trackedDyn === 8
    check('PLACED', ok, TOWERS + ' towers (' + tracked + ' tracked), the stellarator at ' + JSON.stringify(S.posA) + ' with ' + S.dynA.length + ' dynamo hatches (' + trackedDyn +
      ' tracked) and a second at ' + JSON.stringify(S.posB) + ' with ' + S.dynB.length + (failed.length ? '; not placed: ' + failed.slice(0, 5).join('; ') : ''))
    return ok
  }

  // ---------------------------------------------------------------- a stellarator under test
  function grab(u) {
    var m = machineAt(u.pos)
    u.m = m
    u.bus = partsLike(m, /:max_input_bus$/)[0]
    u.fin = partsLike(m, /:max_input_hatch$/)[0]
    u.fout = partsLike(m, /:max_output_hatch$/)
    u.dyn = partsLike(m, /max_wireless_dynamo_hatch_64a/)
    return !!u.bus && !!u.fin && u.fout.length === 2 && u.dyn.length === u.expectDyn
  }
  // the chanced wear inputs must all be present for every parallel run, so the bus holds one wear part per run it may start
  function feedMain(u, runs) {
    var list = [[CIRCUIT, 1, '{Configuration:1}']].concat(stacksOf(PELLET, 320))
    WEAR.forEach(function (id) { list.push([id, runs]) })
    setBus(u.bus, list)
    fill(u.fin, HE3, 80000)
  }
  function hatchSum(u) {
    var t = 0
    u.dyn.forEach(function (d) { t += Number(d.energyContainer.getEnergyStored()) })
    return t
  }
  function emptyHatches(u) {
    u.dyn.forEach(function (d) {
      var e = Number(d.energyContainer.getEnergyStored())
      if (e !== 0) d.energyContainer.changeEnergy(-e)
    })
  }
  function newRecipe(u) {
    var rec = u.m.getRecipeLogic().getLastRecipe()
    return rec !== null && rec !== undefined && rec !== u.last ? rec : null
  }

  function tickA(u, waited) {
    var w = W()
    var big = w.big
    if (u.phase === 'forming') {
      if (!formCheck(machineAt(u.pos), waited)) {
        if (waited > FORM_TIMEOUT) { check('formed', false, 'stellarator A not formed after ' + waited + ' ticks: ' + (machineAt(u.pos) ? why(machineAt(u.pos)) : 'no controller')); u.phase = 'done' }
        return
      }
      var ok = grab(u)
      check('formed', ok, 'stellarator A formed: class ' + u.m.getClass().getSimpleName() + ', dynamo hatches ' + u.dyn.length + ', output hatches ' + u.fout.length + ', parts ' + array(u.m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      note('CAPACITY', 'output hatch tanks ' + u.fout.map(function (h) { return Number(h.tank.getTankCapacity(0)) }).join(',') + ' mB, input hatch ' + Number(u.fin.tank.getTankCapacity(0))       + ' mB')
      // the wear fixture: 100 poppies, 100 torchflowers, circuit 2
      setBus(u.bus, [[CIRCUIT, 1, '{Configuration:2}'], [POPPY, 64], [POPPY, 36], [CHANCED, 64], [CHANCED, 36]])
      u.last = u.m.getRecipeLogic().getLastRecipe()
      u.t0 = S.tick
      u.phase = 'wear'
      return
    }
    if (u.phase === 'wear') {
      var rec = newRecipe(u)
      if (rec !== null) {
        var poppy = 100 - countIn(u.bus, POPPY)
        var flower = 100 - countIn(u.bus, CHANCED)
        note('wear_measured', 'recipe ' + String(rec.id) + ', EU/t ' + eutOf(rec) + ', poppies taken ' + poppy + ', torchflowers taken ' + flower)
        check('wear_parallels', poppy === RUNS && eutOf(rec) === OUT_EUT, 'the fixture row took ' + poppy + ' poppies (want ' + RUNS + ') at ' + eutOf(rec) + ' EU/t (want ' + OUT_EUT + ')')
        check('wear', flower >= 16 && flower <= 48, 'a 50% chanced input under 64 parallels took ' + flower + ' of 64 (between 16 and 48 means it is rolled per run; 0 or 64 means once for the stack)')
        u.last = rec
        u.phase = 'wear_wait'
        u.t0 = S.tick
      } else if (S.tick - u.t0 > 300) {
        check('wear', false, 'the fixture row did not start in 300 ticks; reasons ' + reasons(u.m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'wear_wait') {
      var st = String(u.m.getRecipeLogic().getStatus())
      if (st !== 'WORKING' || S.tick - u.t0 > 100) {
        emptyHatches(u)
        w.setStored(S.server, bi('0'))
        feedMain(u, RUNS)
        u.last = u.m.getRecipeLogic().getLastRecipe()
        u.t0 = S.tick
        u.phase = 'main'
      }
      return
    }
    if (u.phase === 'main') {
      var r = newRecipe(u)
      if (r !== null) {
        var eut = eutOf(r)
        var pellets = countIn(u.bus, PELLET)
        var he3 = tankMb(u.fin)
        var worn = WEAR.map(function (id) { return RUNS - countIn(u.bus, id) })
        note('main_measured', 'recipe ' + String(r.id) + ', EU/t ' + eut + ', pellets left ' + pellets + ', helium-3 left ' + he3 + ' mB, wear parts taken ' + worn.join('/'))
        check('parallels', eut === OUT_EUT && pellets === 320 - 4 * RUNS && he3 === 80000 - 1000 * RUNS,
          'the real row started with EU/t ' + eut + ' (want 2^40 = ' + OUT_EUT + '), pellets left ' + pellets + ' (want ' + (320 - 4 * RUNS) + '), helium-3 left ' + he3 + ' (want ' + (80000 - 1000 * RUNS) + ')')
        check('wear_real', worn.every(function (n) { return n >= 0 && n <= 8 }), 'wear parts taken (injector/stack/turbine) ' + worn.join('/') + ' of 64 runs; expected about 1/0.5/0.5')
        u.last = r
        u.sumDrained = 0
        u.sumIn = 0
        u.sumOut = 0
        u.settlements = []
        u.steady = 0
        u.bad = []
        u.prevT = hatchSum(u)
        u.n = 0
        u.phase = 'measure'
      } else if (S.tick - u.t0 > 300) {
        check('parallels', false, 'the real row did not start in 300 ticks; reasons ' + reasons(u.m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'measure') {
      var t = hatchSum(u) + u.sumDrained
      var delta = t - u.prevT
      u.prevT = t
      if (u.n > 0) {
        if (delta === OUT_EUT) u.steady++
        else u.bad.push('t' + u.n + ' ' + delta)
      }
      u.n++
      if (u.n % SETTLE === 0) {
        var before = w.stored(S.server)
        var s = w.settle(S.server)
        var after = w.stored(S.server)
        u.sumDrained += Number(s.drained)
        u.sumIn += Number(s.in)
        u.sumOut += Number(s.out)
        u.settlements.push({ n: u.n, drained: Number(s.drained), in: Number(s.in), out: Number(s.out), lost: Number(s.lost), up: s.up === true, faulted: Number(s.faulted),
          delta: String(big.sub(after, before)) })
        u.prevT = hatchSum(u) + u.sumDrained
      }
      if (u.n >= MEASURE_TICKS) {
        guarded('gain', function () { evaluateGain(u) })
        u.phase = 'done'
      }
    }
  }

  function evaluateGain(u) {
    var w = W()
    var full = OUT_EUT * SETTLE
    // the generator fills the dynamo hatches in order, so the settlements drain more each time until every hatch is full: that warm-up is measured, not judged
    var firstFull = -1
    u.settlements.forEach(function (x, i) { if (firstFull < 0 && x.drained === full) firstFull = i })
    var whole = firstFull < 0 ? [] : u.settlements.slice(firstFull)
    var off = u.settlements.filter(function (x) {
      return x.in * 20 !== x.drained * 19 || x.out !== 0 || x.delta !== String(x.in) || !x.up || x.faulted !== 0
    }).concat(whole.filter(function (x) { return x.drained !== full }))
    var want = String(full)
    check('steady', u.steady >= MEASURE_TICKS - 5 && u.bad.length === 0, u.steady + ' of ' + (MEASURE_TICKS - 1) + ' ticks rose by exactly 2^40 = ' + OUT_EUT + '; off: ' + u.bad.slice(0, 4).join(', '))
    check('gain', whole.length >= 8 && off.length === 0,
      u.settlements.length + ' settlements, every hatch full from settlement ' + firstFull + ': drained ' + u.settlements.map(function (x) { return x.drained }).join(',') + ' (want ' + want + ' each from then on), deposits ' +
      u.settlements.map(function (x) { return x.in }).join(',') + ', store deltas ' + u.settlements.map(function (x) { return x.delta }).join(',') + '; out of line ' + off.length)
    var sum = bi('0')
    u.settlements.forEach(function (x) { sum = sum.add(bi(String(x.in))).subtract(bi(String(x.out))) })
    var store = String(w.stored(S.server))
    check('store', store === sum.toString() && tagDigits() === store && u.sumIn * 20 === u.sumDrained * 19,
      'store ' + store + ', sum of deposits ' + sum + ', tag ' + tagDigits() + '; deposited ' + u.sumIn + ' of ' + u.sumDrained + ' drained (19/20 is ' + (u.sumDrained * 19 / 20) + ')')
  }

  function tickB(u, waited) {
    if (u.phase === 'forming') {
      if (!formCheck(machineAt(u.pos), waited)) {
        if (waited > FORM_TIMEOUT) { check('one_hatch', false, 'stellarator B not formed after ' + waited + ' ticks: ' + (machineAt(u.pos) ? why(machineAt(u.pos)) : 'no controller')); u.phase = 'done' }
        return
      }
      if (!grab(u)) { check('one_hatch', false, 'stellarator B formed with dynamo hatches ' + u.dyn.length); u.phase = 'done'; return }
      u.phase = 'idle'
      return
    }
    if (u.phase === 'go') {
      feedMain(u, 8)
      u.last = u.m.getRecipeLogic().getLastRecipe()
      u.t0 = S.tick
      u.phase = 'main'
      return
    }
    if (u.phase === 'main') {
      var r = newRecipe(u)
      if (r !== null) {
        var eut = eutOf(r)
        var pellets = countIn(u.bus, PELLET)
        var he3 = tankMb(u.fin)
        check('one_hatch', eut === ONE_EUT && pellets === 320 - 4 * 8 && he3 === 80000 - 1000 * 8,
          'one 64 A dynamo hatch: EU/t ' + eut + ' (want 2^37 = ' + ONE_EUT + '), pellets left ' + pellets + ' (want ' + (320 - 32) + '), helium-3 left ' + he3 + ' (want ' + (80000 - 8000) + ')')
        u.phase = 'done'
      } else if (S.tick - u.t0 > 300) {
        check('one_hatch', false, 'no recipe in 300 ticks; reasons ' + reasons(u.m))
        u.phase = 'done'
      }
    }
  }

  function cleanup() {
    try {
      W().paused = true
      fillBand()
      S.server.runCommandSilent('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      note('CLEANUP', 'band cleared, force-load released; ' + restoreNetwork())
    } catch (e) {
      note('CLEANUP', 'could not clean up: ' + errText(e))
    }
  }
  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    if (S.started) cleanup()
    leaveQueue()
    console.info(TAG + SCOPE + '|DONE|failures=' + S.failed)
  }

  function step() {
    if (S.phase === 'turn') {
      if (!myTurn()) {
        if (Date.now() - S.queuedAt > TURN_TIMEOUT_MS) {
          check('TURN', false, 'no turn on the wireless network in ' + (TURN_TIMEOUT_MS / 1000) + ' s; queue ' + queueList().join(','))
          finish()
        }
        return
      }
      S.started = true
      try {
        saveNetwork()
        prepareWorld()
        if (!placeAll()) { finish(); return }
      } catch (e) {
        check('PLACED', false, 'exception placing: ' + errText(e))
        finish()
        return
      }
      S.a = { pos: S.posA, phase: 'forming', expectDyn: 8 }
      S.b = { pos: S.posB, phase: 'forming', expectDyn: 1 }
      S.phase = 'run'
      S.t0 = S.tick
      return
    }
    var waited = S.tick - S.t0
    if (S.a.phase !== 'done') {
      try { tickA(S.a, waited) } catch (e) { check('a_exception', false, 'phase ' + S.a.phase + ': ' + errText(e)); S.a.phase = 'done' }
    }
    if (S.b.phase === 'idle' && S.a.phase === 'done') S.b.phase = 'go'
    if (S.b.phase !== 'done' && S.b.phase !== 'idle') {
      try { tickB(S.b, waited) } catch (e) { check('b_exception', false, 'phase ' + S.b.phase + ': ' + errText(e)); S.b.phase = 'done' }
    }
    if (S.a.phase === 'done' && S.b.phase === 'done') finish()
    else if (waited > DEADLINE) { check('deadline', false, DEADLINE + '-tick ceiling: A ' + S.a.phase + ', B ' + S.b.phase); finish() }
  }

  function run(server) {
    S = { server: server, level: server.overworld(), tick: 0, phase: 'turn', queuedAt: Date.now(), started: false, finished: false, failed: 0 }
    joinQueue()
  }

  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && (S === null || S.finished) && Date.now() - LOADED_AT >= QUIET_MS) {
        global[REQUEST] = false
        run(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      step()
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false, started: false }
      check('exception', false, errText(e))
      finish()
    }
  })

  ServerEvents.customCommand('gg_test_maxplus_stellarator', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
})()
