// priority: -5663
// Gregtech Grindless - smoke test of MAX's wireless tier (package MAX-W; TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): the MAX row of tables/wireless_energy.json (registered by lv/wireless_energy.js, withTiers case 14), max/wireless.js
// and line L27's rows on the older machines.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -Commands 'kubejs custom_command gg_test_max_wireless' `
//     -WaitForLog 'GGTEST\|max_wireless\|DONE@@180'
//
// It takes its turn on the wireless network with the other wireless fixtures (the queue `ggTestWirelessQueue` in `global`), pauses the timed
// settlements while it runs and settles by hand, and puts the network's persistent data back at the end. The cell's recipe waits on A2, so
// the network's energy is set directly (W.setStored).
//
// The doubt it settles (docs/eras/max.md W; S0-5): a 64 A MAX wireless hatch draws 2^37 EU/t (64 A x V[MAX] = 137,438,953,472) for one tick
// from a case 14 network, every buffer a long with no int wrap; the cap is 1,374,389,534,720 EU per 10-tick settlement. If any CAP/DRAW line
// fails, the S0-5 fallback applies (the 64 A hatch is dropped, 16 A is the top amperage).
//   max_wireless|registration  the eight MAX hatches and two covers exist; W.cells: tier 14, 64,424,509,440,000 EU, made by gtceu:max_assembler
//   max_wireless|recipes       the L27 rows are in the recipe manager (smes_buffered_tape, thick_rebco_tape, smes_toroid_winding,
//                              braced_smes_toroid, cold_smes_toroid); the cell and repeater recipes exist at VA[MAX] or are reported pending
//   max_wireless|PLACED        a tower with one MAX cell, a MAX 2 A, 16 A and 64 A wireless energy hatch
//   max_wireless|STORED        the network is set to 3 x 64,424,509,440,000 EU and reports the same figure back (a long all the way)
//   max_wireless|CAP           on a settlement each MAX hatch gets exactly V[MAX] x amps x the settlement's ticks (W.rate; 64 A: 1,374,389,534,720)
//   max_wireless|DRAW          the 64 A hatch, full, gives up 2^37 EU in one tick and the next settlement refills exactly that
//   max_wireless|DONE          last line
//
// TEST AREA: ONLY the band X 39128-39191, Y 98-112, Z 0-63 (force-loaded and cleared); the tower's controller at (39136, 100, 40), the
// hatches at X 39160-39164, Z 20. var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that
// run twice).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'max_wireless'
  var STEP = 10
  var FORM_TIMEOUT = 600
  var TURN_TIMEOUT_MS = 120000
  var BAND = { x0: 39128, x1: 39191, y0: 98, y1: 112, z0: 0, z1: 63 }
  var TOWER = { x: 39136, y: 100, z: 40 }
  var HATCHES = [
    { key: 'max2', id: 'gtceu:max_wireless_energy_hatch', amps: 2, x: 39160, y: 100, z: 20 },
    { key: 'max16', id: 'gtceu:max_wireless_energy_hatch_16a', amps: 16, x: 39162, y: 100, z: 20 },
    { key: 'max64', id: 'gtceu:max_wireless_energy_hatch_64a', amps: 64, x: 39164, y: 100, z: 20 }
  ]
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestMaxWirelessRequest'
  var QUEUE = 'ggTestWirelessQueue'

  var MAXT = 14
  var CELL_ID = 'grindless:max_smes_cell'
  var CELL_EU = 64424509440000
  var MADE_BY = 'gtceu:max_assembler'
  var DRAW = 137438953472
  var MAX_IDS = ['gtceu:max_wireless_energy_hatch', 'gtceu:max_wireless_energy_hatch_4a', 'gtceu:max_wireless_energy_hatch_16a', 'gtceu:max_wireless_energy_hatch_64a',
    'gtceu:max_wireless_dynamo_hatch', 'gtceu:max_wireless_dynamo_hatch_4a', 'gtceu:max_wireless_dynamo_hatch_16a', 'gtceu:max_wireless_dynamo_hatch_64a',
    'grindless:max_wireless_energy_cover', 'grindless:max_wireless_dynamo_cover']
  var L27 = [
    { id: 'grindless:coated_conductor/smes_buffered_tape', out: 'grindless:smes_buffered_tape' },
    { id: 'grindless:pulsed_laser_deposition/thick_rebco_tape', out: 'grindless:thick_rebco_tape' },
    { id: 'grindless:magnet_winding/smes_toroid_winding', out: 'grindless:smes_toroid_winding' },
    { id: 'grindless:naquadria_magnets/braced_smes_toroid', out: 'grindless:braced_smes_toroid' },
    { id: 'grindless:closed_loop_cooling/cold_smes_toroid', out: 'grindless:cold_smes_toroid' }
  ]

  var S = null
  var classes = null

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
  }
  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = TAG + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }
  function check(name, ok, detail) { emit(name, ok ? 'PASS' : 'FAIL', detail) }
  function note(name, detail) { emit(name, 'NOTE', detail) }
  function guarded(name, fn) {
    try { fn() } catch (e) { check(name, false, 'exception: ' + e) }
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
  function leaveQueue() {
    global[QUEUE] = queueList().filter(function (n) { return n !== SCOPE }).join(',')
  }
  function myTurn() { return queueList()[0] === SCOPE }

  function lazy() {
    if (classes === null) {
      classes = { MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine') }
    }
    return classes
  }
  function W() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.settle !== 'function') throw new Error('global.grindless.wireless is missing or incomplete (lv/wireless_energy.js)')
    return w
  }
  function V(tier) { return Number(GTValues.V[tier]) }
  function machineAt(p) {
    var m = lazy().MetaMachine.getMachine(S.level, new BlockPos(p.x, p.y, p.z))
    return m === null || m === undefined ? null : m
  }
  function blockIdAt(x, y, z) { return String(S.level.getBlock(x, y, z).getId()) }
  function storedIn(p) {
    var m = machineAt(p)
    return m === null ? -1 : Number(m.energyContainer.getEnergyStored())
  }
  function bufferOf(p) {
    var m = machineAt(p)
    return m === null ? -1 : Number(m.energyContainer.getEnergyCapacity())
  }
  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(new ResourceLocation(id))
    return found.isPresent() ? found.get() : null
  }

  function staticChecks() {
    var w = W()
    var problems = []
    ;[CELL_ID].concat(MAX_IDS).forEach(function (id) {
      if (!Item.exists(id)) problems.push('item ' + id + ' missing')
    })
    var cell = w.cells[CELL_ID]
    if (!cell || Number(cell.tier) !== MAXT || Number(cell.capacity) !== CELL_EU || String(cell.madeBy) !== MADE_BY) problems.push('W.cells[' + CELL_ID + '] is ' + JSON.stringify(cell || null))
    if (!w.tiers.some(function (t) { return Number(t) === MAXT })) problems.push('no tier 14 in ' + w.tiers.join(','))
    if (w.recipes.some(function (r) { return String(r.output) === CELL_ID })) problems.push('the MAX cell has a table assembler recipe')
    check('registration', problems.length === 0, problems.join(' ; ') || 'the MAX cell, eight hatches and two covers exist; W.cells: tier 14, ' + CELL_EU + ' EU, made by ' + MADE_BY + '; V[MAX] ' + V(MAXT))

    var bad = []
    L27.forEach(function (o) {
      if (liveRecipe(o.id) === null) bad.push(o.id + ' not in the recipe manager')
    })
    var notes = []
    var mw = global.grindless.maxWireless
    ;['grindless:assembler/horizon_strand_repeater', 'grindless:assembler/max_smes_cell'].forEach(function (id) {
      var r = liveRecipe(id)
      if (r === null) notes.push(id + ' pending (' + (mw && mw.pendingRoutes ? mw.pendingRoutes.join(',') : 'no pendingRoutes list') + ')')
      else notes.push(id + ' live at ' + Number(r.duration) + ' t')
    })
    check('recipes', bad.length === 0, notes.join(' ; ') + (bad.length > 0 ? ' | problems: ' + bad.join(' ; ') : ''))
  }

  function saveNetwork() {
    var w = W()
    var pd = S.server.persistentData
    S.savedKeys = {}
    ;[w.blocksKey, w.storeKey, w.legacyKey].forEach(function (k) {
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
    var back = []
    Object.keys(S.savedKeys || {}).forEach(function (k) {
      pd.remove(k)
      var t = S.savedKeys[k]
      if (t !== null) { pd.put(k, t); back.push(k) }
    })
    w.dropCache()
    w.paused = S.wasPaused === true
    return 'the network\'s keys put back as they were before the test: ' + (back.length > 0 ? back.join(', ') : 'none existed, all removed')
  }

  // vanilla's fill takes at most 32,768 blocks: the band goes in strips of 16 along Z
  function fillBand() {
    var n = 0
    for (var z = BAND.z0; z <= BAND.z1; z += 16) {
      n += Number(S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + z + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + Math.min(z + 15, BAND.z1) + ' air'))
    }
    return n
  }
  function inBand(x, y, z) {
    return x >= BAND.x0 && x <= BAND.x1 && y >= BAND.y0 && y <= BAND.y1 && z >= BAND.z0 && z <= BAND.z1
  }
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

  // a tower whose controller stands at p facing north, its first slot holding `cell`, the rest casing
  function towerPlace(p, cell, failed) {
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
    var used = 0
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
          else if (sym.kind === 'oneOf') id = used < 1 ? cell : w.casing
          if (id === null) continue
          if (sym.kind === 'oneOf') used++
          put(p.x - (ci - ctrl.ci), p.y + (ri - ctrl.ri), p.z - (si - ctrl.si), id, failed)
        }
      })
    })
    put(p.x, p.y, p.z, w.towerId + '[facing=north]', failed)
    // /setblock fires no BlockEvents.placed: the tower is tracked by hand
    w.track(S.level, new BlockPos(p.x, p.y, p.z))
  }

  function placeAll() {
    var w = W()
    var failed = []
    towerPlace(TOWER, CELL_ID, failed)
    HATCHES.forEach(function (h) {
      put(h.x, h.y, h.z, h.id + '[facing=north]', failed)
      w.track(S.level, new BlockPos(h.x, h.y, h.z))
    })
    check('PLACED', failed.length === 0, 'a tower with one MAX cell, hatches ' + HATCHES.map(function (h) { return h.id }).join(', ') + (failed.length ? ' FAILED ' + failed.slice(0, 5).join('; ') : ''))
    return failed.length === 0
  }
  function formed(p) {
    var m = machineAt(p)
    return m !== null && m.isFormed()
  }
  function cleanup() {
    try {
      fillBand()
      S.server.runCommandSilent('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      note('CLEANUP', 'band cleared, force-load released; ' + restoreNetwork())
    } catch (e) {
      note('CLEANUP', 'could not clean up: ' + e)
    }
  }

  function snapshot() {
    var out = {}
    HATCHES.forEach(function (h) { out[h.key] = storedIn(h) })
    return out
  }
  function hatch(key) { return HATCHES.filter(function (x) { return x.key === key })[0] }

  function capAndDraw() {
    var w = W()
    var want = 3 * CELL_EU
    // a long all the way: set three cells' worth, read it back before any settlement moves it
    w.setStored(S.server, want)
    var full = w.status(S.server)
    check('STORED', Number(full.stored) === want && want > Math.pow(2, 43), 'set ' + want + ' EU (3 x ' + CELL_EU + ', above 2^43), the network reports stored ' + full.stored)
    var before = snapshot()
    var st = w.settle(S.server)
    var after = snapshot()
    var lines = []
    var ok = !!st.up && Number(st.tier) === MAXT && Number(st.capacity) === CELL_EU
    var first = {}
    HATCHES.forEach(function (h) {
      var cap = w.rate(MAXT, h.amps) * w.settleTicks
      var got = after[h.key] - before[h.key]
      first[h.key] = { cap: cap, buffer: bufferOf(h) }
      if (got !== cap) ok = false
      lines.push(h.id + ' got ' + got + ' EU (want V[MAX] ' + V(MAXT) + ' x ' + h.amps + ' A x ' + w.settleTicks + ' ticks = ' + cap + ')')
    })
    var st2 = w.settle(S.server)
    var again = snapshot()
    HATCHES.forEach(function (h) {
      var f = first[h.key]
      var got = again[h.key] - after[h.key]
      var want2 = Math.min(f.cap, f.buffer - after[h.key])
      if (got !== want2 || again[h.key] > f.buffer) ok = false
      lines.push('next settlement ' + got + ' EU (want ' + want2 + ')')
    })
    check('CAP', ok && !!st2.up && first.max2.cap === 42949672960 && first.max16.cap === 343597383680 && first.max64.cap === 1374389534720,
      'network: up ' + st.up + ', tier ' + st.tier + ' (want ' + MAXT + '), capacity ' + st.capacity + ' (want ' + CELL_EU + '); ' + lines.join('; '))
    guarded('DRAW', draw)
  }

  // the 64 A hatch, filled to its buffer, gives up one tick of its input (V[MAX] x 64 A = 2^37 EU); the next settlement puts exactly that
  // back from the network: every figure past 2^32 and read back exact (a wrap to int would show here as 0 or a negative)
  function draw() {
    var w = W()
    var h = hatch('max64')
    var ec = machineAt(h).energyContainer
    var perTick = Number(ec.getInputVoltage()) * Number(ec.getInputAmperage())
    var buffer = bufferOf(h)
    HATCHES.forEach(function (x) { machineAt(x).energyContainer.changeEnergy(bufferOf(x) - storedIn(x)) })
    var full = storedIn(h)
    w.setStored(S.server, 3 * CELL_EU)
    var net0 = w.stored(S.server)
    var changed = Number(ec.changeEnergy(-DRAW))
    var held = storedIn(h)
    var st = w.settle(S.server)
    var refill = storedIn(h) - held
    var paid = net0 - w.stored(S.server)
    check('DRAW', perTick === DRAW && V(MAXT) * 64 === DRAW && full === buffer && buffer > DRAW && buffer > Math.pow(2, 32) && changed === -DRAW && full - held === DRAW &&
          !!st.up && Number(st.tier) === MAXT && refill === DRAW && paid === DRAW && storedIn(h) === buffer,
      h.id + ': input ' + ec.getInputVoltage() + ' EU/t x ' + ec.getInputAmperage() + ' A = ' + perTick + ' (want 2^37 = ' + DRAW + '); buffer ' + buffer + ', filled to ' + full +
      '; one tick drew ' + (full - held) + ' (changeEnergy ' + changed + '); the next settlement refilled ' + refill + ' and the network paid ' + paid + ' (want ' + DRAW + ' each)')
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    if (S.started) cleanup()
    leaveQueue()
    console.info(TAG + SCOPE + '|DONE')
  }

  // setTimeout is not bound in the scripts of this server, so a server-tick handler drives the steps
  function step(elapsed) {
    if (S.phase === 'turn') {
      if (!myTurn()) {
        if (Date.now() - S.queuedAt > TURN_TIMEOUT_MS) {
          check('TURN', false, 'no turn on the wireless network in ' + (TURN_TIMEOUT_MS / 1000) + ' s; queue ' + queueList().join(','))
          finish()
        }
        return
      }
      S.started = true
      guarded('static', staticChecks)
      try {
        saveNetwork()
        prepareWorld()
        if (!placeAll()) { finish(); return }
      } catch (e) {
        check('PLACED', false, 'exception placing: ' + e)
        finish()
        return
      }
      S.phase = 'forming'
      S.t0 = elapsed
      return
    }
    if (S.phase === 'forming') {
      if (!formed(TOWER)) {
        if (elapsed - S.t0 < FORM_TIMEOUT) return
        check('CAP', false, 'the tower is not formed after ' + (elapsed - S.t0) + ' ticks')
        finish()
        return
      }
      note('FORMED', 'the tower formed after ' + (elapsed - S.t0) + ' ticks')
      guarded('CAP', capAndDraw)
      finish()
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    try {
      step(now - S.tick0)
    } catch (e) {
      check('STEP', false, 'exception in ' + S.phase + ': ' + e)
      finish()
    }
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, level: server.overworld(), t0: 0, tick0: now, nextAt: now + STEP, phase: 'turn', queuedAt: Date.now(), started: false, finished: false }
    joinQueue()
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

  ServerEvents.customCommand('gg_test_max_wireless', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_max_wireless run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
