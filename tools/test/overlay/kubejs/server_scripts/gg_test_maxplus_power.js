// priority: -5683
// Gregtech Grindless - smoke test of MAX+ power plumbing (package XP-W; TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): line P18, the hatch recipes of maxplus/power.js and the case 14 feed of one MAX 64 A substation hatch.
//
//   ssh grindless-vm 'bash /opt/grindless/tools/gg-vm-run.sh <pushed ref> -Commands "kubejs custom_command gg_test_maxplus_power" \
//     -WaitForLog "GGTEST\|maxplus_power\|(DONE|FAIL)@@180"'
//
// It takes its turn on the wireless network with the other wireless fixtures (the queue `ggTestWirelessQueue` in `global`), pauses the timed
// settlements while it runs and puts the network's persistent data back at the end (as gg_test_max_wireless does).
//   maxplus_power|recipes   the P18 rows, the three hatch recipes (input and output 64 A, the 1,024 A hatch) are in the recipe manager
//   maxplus_power|CAP       a case 14 64 A wireless hatch gets V[MAX] x 64 x 10 = 1,374,389,534,720 EU on a settlement
//   maxplus_power|ROW       one MAX 64 A substation hatch takes 2^37 EU/t (V[MAX] x 64 A) and the wireless hatch beside it refills exactly that,
//                           so a 2^37 row has its feed; every figure a long
//   maxplus_power|DONE      last line
//
// TEST AREA: ONLY the band X 46080-46143, Y 98-112, Z 0-63. var + function everywhere (this Rhino throws "redeclaration of var" for const/let
// inside functions that run twice).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'maxplus_power'
  var STEP = 10
  var FORM_TIMEOUT = 600
  var TURN_TIMEOUT_MS = 120000
  var BAND = { x0: 46080, x1: 46143, y0: 98, y1: 112, z0: 0, z1: 63 }
  var TOWER = { x: 46088, y: 100, z: 40 }
  var WHATCH = { id: 'gtceu:max_wireless_energy_hatch_64a', x: 46112, y: 100, z: 20 }
  var SHATCH = { id: 'gtceu:max_substation_input_hatch_64a', x: 46114, y: 100, z: 20 }
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestMaxplusPowerRequest'
  var QUEUE = 'ggTestWirelessQueue'
  var MAXT = 14
  var CELL_ID = 'grindless:max_smes_cell'
  var CELL_EU = 64424509440000
  var DRAW = 137438953472
  var RECIPES = [
    'grindless:coated_conductor/kerr_fcl_buffer_tape', 'grindless:pulsed_laser_deposition/thick_kerr_fcl_tape',
    'grindless:magnet_winding/kerr_fcl_coil', 'grindless:closed_loop_cooling/cold_kerr_fcl',
    'grindless:assembly_line/maxplus_substation_input_hatch_64a', 'grindless:assembly_line/maxplus_substation_output_hatch_64a',
    'grindless:assembly_line/max_maxplus_energy_hatch_1024a'
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
    if (classes === null) classes = { MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine') }
    return classes
  }
  function W() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.settle !== 'function') throw new Error('global.grindless.wireless is missing or incomplete (lv/wireless_energy.js)')
    return w
  }
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
    var bad = []
    RECIPES.forEach(function (id) {
      if (liveRecipe(id) === null) bad.push(id + ' not in the recipe manager')
    })
    ;['grindless:cold_kerr_fcl', 'gtceu:max_maxplus_energy_hatch_1024a', SHATCH.id, WHATCH.id].forEach(function (id) {
      if (!Item.exists(id)) bad.push('item ' + id + ' missing')
    })
    var mp = global.grindless.maxplusPower
    if (mp && mp.skipped && mp.skipped.length > 0) bad.push('power.js skipped ' + JSON.stringify(mp.skipped))
    check('recipes', bad.length === 0, bad.join(' ; ') || RECIPES.length + ' recipes live; P18 ends in grindless:cold_kerr_fcl and three hatch recipes take it')
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
    Object.keys(S.savedKeys || {}).forEach(function (k) {
      pd.remove(k)
      var t = S.savedKeys[k]
      if (t !== null) pd.put(k, t)
    })
    w.dropCache()
    w.paused = S.wasPaused === true
    return 'the network\'s keys put back as they were before the test'
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
    put(WHATCH.x, WHATCH.y, WHATCH.z, WHATCH.id + '[facing=north]', failed)
    w.track(S.level, new BlockPos(WHATCH.x, WHATCH.y, WHATCH.z))
    put(SHATCH.x, SHATCH.y, SHATCH.z, SHATCH.id + '[facing=north]', failed)
    check('PLACED', failed.length === 0, 'a tower with one MAX cell, ' + WHATCH.id + ' and ' + SHATCH.id + (failed.length ? ' FAILED ' + failed.slice(0, 5).join('; ') : ''))
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

  function capAndRow() {
    var w = W()
    w.setStored(S.server, 3 * CELL_EU)
    var before = storedIn(WHATCH)
    var st = w.settle(S.server)
    var got = storedIn(WHATCH) - before
    var cap = w.rate(MAXT, 64) * w.settleTicks
    check('CAP', !!st.up && Number(st.tier) === MAXT && got === cap && cap === 1374389534720,
      'network up ' + st.up + ', tier ' + st.tier + '; the 64 A hatch got ' + got + ' EU (want V[MAX] x 64 x ' + w.settleTicks + ' = ' + cap + ')')
    guarded('ROW', row)
  }

  function row() {
    var w = W()
    var ec = machineAt(SHATCH).energyContainer
    var perTick = Number(ec.getInputVoltage()) * Number(ec.getInputAmperage())
    var buffer = bufferOf(SHATCH)
    var wb = bufferOf(WHATCH)
    ec.changeEnergy(buffer - storedIn(SHATCH))
    machineAt(WHATCH).energyContainer.changeEnergy(wb - storedIn(WHATCH))
    var full = storedIn(WHATCH)
    w.setStored(S.server, 3 * CELL_EU)
    var changed = Number(machineAt(WHATCH).energyContainer.changeEnergy(-DRAW))
    var held = storedIn(WHATCH)
    var st = w.settle(S.server)
    var refill = storedIn(WHATCH) - held
    check('ROW', perTick === DRAW && buffer >= DRAW && Math.abs(changed) === DRAW && full - held === DRAW && !!st.up && refill === DRAW,
      SHATCH.id + ': input ' + ec.getInputVoltage() + ' EU/t x ' + ec.getInputAmperage() + ' A = ' + perTick + ' (want 2^37 = ' + DRAW + '), buffer ' + buffer +
      '; the wireless hatch gave up ' + (full - held) + ' in one tick and the next settlement refilled ' + refill)
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
      guarded('CAP', capAndRow)
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

  ServerEvents.customCommand('gg_test_maxplus_power', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_maxplus_power run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
