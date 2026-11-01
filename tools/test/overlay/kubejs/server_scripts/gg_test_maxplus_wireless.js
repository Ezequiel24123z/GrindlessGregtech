// priority: -10350
// TEST ONLY, XP-W2 (bench overlay, never shipped; needs the startup overlay on: kubejs/config/gg_test_maxplus_wireless.json {"enabled": true}).
// The exact wireless store and the 4,096 A MAX+ hatch:
//
//   ssh grindless-vm 'bash /opt/grindless/tools/gg-vm-run.sh <ref> -OverlayDir <overlay copy with the marker on> \
//     -Commands "kubejs custom_command gg_test_maxplus_wireless" -WaitForLog "GGTEST\|maxplus_wireless\|(DONE|FAIL)@@180"'
//
// Five wireless towers of 32 MAX SMES cells (1.03e16 EU, above 2^53), a wireless dynamo hatch fed by hand, and a 3 x 3 x 3 plate whose energy_input
// cell holds the pack's gtceu:max_wireless_energy_hatch_4096a. It takes its turn on the wireless network with the other wireless fixtures
// (ggTestWirelessQueue), pauses the timed settlements while it sets up and puts the network's persistent data back at the end.
//   maxplus_wireless|book      both hatches are in the network's book (W.hatches, W.maxplusHatchIds), not in W.hatchIds; caps are the maxplusCaps rows
//   maxplus_wireless|PLACED, FORMED
//   maxplus_wireless|exact     a store seeded at 2^53 + 1 reads back as 9007199254740993, takes an odd deposit and a cap withdrawal in one settlement,
//                              and the result equals BigInteger arithmetic on the digits
//   maxplus_wireless|saved     after a forced save and a cache drop the store reads back the same digits
//   maxplus_wireless|hatch     the 4,096 A hatch is an energy part at V[MAX] x 4,096 A with a 2^47 buffer
//   maxplus_wireless|prefill   two settlements fill the empty hatch (the cap, then the rest) with the store above 2^53
//   maxplus_wireless|eut       the running probe's EU/t reads 2^43 as a long
//   maxplus_wireless|draw      store + hatch fell by exactly 2^43 on every tick the probe drew, at least 60 ticks, crossing 2^53 on the way
//   maxplus_wireless|settle    timed settlements handed out the cap each; never faulted
//   maxplus_wireless|books     start total - end total = what the probe drew, as exact digits; the tag's digits equal the store
//   maxplus_wireless|DONE      last line, failures=N
//
// TEST AREA: ONLY the band X 46656-46719, Y 98-112, Z 0-63 (Overworld; zones.json maxplus_wireless). var + function everywhere.
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'maxplus_wireless'
  var REQUEST = 'ggTestMaxplusWirelessRequest'
  var QUEUE = 'ggTestWirelessQueue'
  var QUIET_MS = 10000
  var TURN_TIMEOUT_MS = 180000
  var FORM_TIMEOUT = 800
  var LOADED_AT = Date.now()
  var BAND = { x0: 46656, x1: 46719, y0: 98, y1: 112, z0: 0, z1: 63 }
  var TOWER_X0 = 46662
  var TOWER_STEP = 8
  var TOWERS = 5
  var TOWER = { y: 100, z: 40 }
  var PLATE = { id: 'gtceu:gg_maxplus_wireless_plate', x: 46690, y: 100, z: 20 }
  var DYNAMO_POS = { x: 46706, y: 100, z: 30 }
  var HATCH = 'gtceu:max_wireless_energy_hatch_4096a'
  var HATCH_1K = 'gtceu:max_wireless_energy_hatch_1024a'
  var DYNAMO = 'gtceu:max_wireless_dynamo_hatch_64a'
  var CELL = 'grindless:max_smes_cell'
  var IN_BUS = 'gtceu:hv_input_bus'
  var OUT_BUS = 'gtceu:hv_output_bus'
  var MAXT = 14
  var AMPS = 4096
  var DIAL = 8796093022208
  var CAP = 87960930222080
  var BUFFER = 140737488355328
  // 2^53 + 1; the run's store: 3e14 above it, so 60 ticks of the dial (5.28e14) carry it back below 2^53
  var ODD = '9007199254740993'
  var STORE_RUN = '9307199254740993'
  var DEPOSIT_GAVE = 12345678900
  var RUN = 60
  var CATALYST = 'minecraft:torchflower'
  var PRODUCT = 'minecraft:pitcher_plant'
  var marker = JsonIO.read('kubejs/config/gg_test_maxplus_wireless.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'

  var S = null
  var C = null

  function errText(e) {
    var s = ''
    try { s = String(e.message || e) } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 3).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }

  ServerEvents.recipes(function (event) {
    if (!ON) return
    try {
      var Long = Java.loadClass('java.lang.Long')
      var eut = Number(GTValues.V[MAXT]) * AMPS
      event.recipes.gtceu.gg_maxplus_wireless('gg_test_maxplus_wireless:probe')
        .notConsumable('1x ' + CATALYST)
        .itemOutputs('1x ' + PRODUCT)
        .EUt(Long.valueOf(String(eut)))
        .duration(RUN)
    } catch (e) {
      console.error('[gg_test maxplus_wireless] could not add the probe row: ' + errText(e))
    }
  })

  function classes() {
    if (C === null) {
      C = {
        Pos: Java.loadClass('net.minecraft.core.BlockPos'),
        ArrayList: Java.loadClass('java.util.ArrayList'),
        Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        Long: Java.loadClass('java.lang.Long'),
        BI: Java.loadClass('java.math.BigInteger')
      }
    }
    return C
  }
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
  function leaveQueue() {
    global[QUEUE] = queueList().filter(function (n) { return n !== SCOPE }).join(',')
  }
  function myTurn() { return queueList()[0] === SCOPE }

  function W() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.settle !== 'function' || !w.big) throw new Error('global.grindless.wireless is missing or has no exact store (lv/wireless_energy.js)')
    return w
  }
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
  function hatchContainer() {
    var m = machineAt(S.hatchPos)
    if (m === null) throw new Error('no machine at the hatch position')
    return m.energyContainer
  }
  function hatchStored() { return Number(hatchContainer().getEnergyStored()) }
  function whole(n) { return typeof n === 'number' && n % 1 === 0 }
  // a long tag's digits: getAsString gives the SNBT form, 123L
  function digitsOf(tag) {
    var s = ''
    try { s = String(tag.getAsString()) } catch (e) { s = String(tag) }
    return s.replace(/L$/, '')
  }
  function tagDigits() {
    var w = W()
    try { return digitsOf(S.server.persistentData.get(w.storeKey)) } catch (e) { return 'unreadable (' + e + ')' }
  }
  function bi(s) { return new (classes().BI)(String(s)) }
  function setBus(p, id) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    if (id) st.setStackInSlot(0, Item.of(id, 1))
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

  // ---------------------------------------------------------------- the network's persistent data, kept aside while the test runs
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

  // ---------------------------------------------------------------- the band
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

  function placeStructure(id, p, pick, failed) {
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
    var at = {}
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') continue
          var block = pick({ ch: ch, sym: sym })
          if (!block) continue
          var x = p.x - (ci - ctrl.ci)
          var y = p.y + (ri - ctrl.ri)
          var z = p.z - (si - ctrl.si)
          put(x, y, z, block + (/hatch|bus/.test(block) ? '[facing=north]' : ''), failed)
          if (!at[ch]) at[ch] = []
          at[ch].push({ x: x, y: y, z: z })
        }
      })
    })
    put(p.x, p.y, p.z, id + '[facing=north]', failed)
    return at
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
    var buses = 0
    var at = placeStructure(PLATE.id, PLATE, function (c) {
      if (c.ch === 'E') return HATCH
      if (c.ch === 'P') { buses++; return buses === 1 ? IN_BUS : OUT_BUS }
      if (c.sym.kind === 'blocks') return c.sym.blocks[0]
      return null
    }, failed)
    S.hatchPos = at.E && at.E.length === 1 ? at.E[0] : null
    put(DYNAMO_POS.x, DYNAMO_POS.y, DYNAMO_POS.z, DYNAMO + '[facing=north]', failed)
    var he = S.hatchPos === null ? null : w.track(S.level, pos(S.hatchPos))
    var de = w.track(S.level, pos(DYNAMO_POS))
    var ok = failed.length === 0 && S.hatchPos !== null && tracked === TOWERS && !!he && !!de && he.k === 'hatch' && Number(he.t) === MAXT && Number(he.a) === AMPS
    check('PLACED', ok, TOWERS + ' towers of 32 ' + CELL + ' (' + tracked + ' tracked), the plate with ' + HATCH + ' (' + (he ? he.k + ' tier ' + he.t + ' ' + he.a + ' A' : 'not tracked') +
      ') and ' + DYNAMO + (failed.length ? '; not placed: ' + failed.slice(0, 5).join('; ') : ''))
    return ok
  }

  function formCheck(m, waited) {
    if (m === null) return false
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) {
    try {
      var err = m.getMultiblockState().error
      var p = err.getPos()
      return String(err.getErrorInfo().getString()) + ' at ' + (p ? p.getX() + ',' + p.getY() + ',' + p.getZ() : '?')
    } catch (e) { return 'unknown (' + e + ')' }
  }

  // ---------------------------------------------------------------- the checks
  function book() {
    var w = W()
    var V = Number(GTValues.V[MAXT])
    var rows = (w.table && w.table.maxplusCaps) || []
    var bad = []
    ;[[HATCH_1K, 1024], [HATCH, 4096]].forEach(function (p) {
      var h = w.hatches[p[0]]
      var row = null
      for (var i = 0; i < rows.length; i++) if (Number(rows[i].amps) === p[1]) row = rows[i]
      var cap = w.rate(MAXT, p[1]) * w.settleTicks
      if (!Item.exists(p[0]) || !h || h.kind !== 'hatch' || Number(h.tier) !== MAXT || Number(h.amps) !== p[1]) bad.push(p[0] + ' not in the book')
      else if (w.hatchIds.indexOf(p[0]) >= 0) bad.push(p[0] + ' is in hatchIds')
      else if (w.maxplusHatchIds.indexOf(p[0]) < 0) bad.push(p[0] + ' is not in maxplusHatchIds')
      else if (V * p[1] * w.settleTicks !== cap || row === null || Number(row.cap) !== cap) bad.push(p[0] + ' cap ' + cap + ' vs row ' + (row ? row.cap : 'missing'))
    })
    check('book', bad.length === 0 && Number(w.maxplusHatchIds.length) === 2, bad.length ? bad.join('; ') : 'both MAX+ hatches in W.hatches and W.maxplusHatchIds, caps equal the maxplusCaps rows')
  }

  // the exact store: seeded above 2^53, one odd deposit and one cap withdrawal in a single settlement, then a forced save
  function exactStore() {
    var w = W()
    var big = w.big
    var BI = classes().BI
    w.setStored(S.server, bi(ODD))
    var seeded = String(w.stored(S.server))
    var seededTag = tagDigits()
    var dyn = machineAt(DYNAMO_POS).energyContainer
    dyn.changeEnergy(DEPOSIT_GAVE)
    var hatch0 = hatchStored()
    if (hatch0 !== 0) hatchContainer().changeEnergy(-hatch0)
    var st = w.settle(S.server)
    var after = String(w.stored(S.server))
    var want = bi(ODD).add(bi(String(st.in))).subtract(bi(String(st.out))).toString()
    var odd = Number(st.in) % 2 === 1
    check('exact', seeded === ODD && seededTag === ODD && Number(st.faulted) === 0 && Number(st.out) === CAP && Number(st.in) > 0 && odd &&
      Number(st.in) + Number(st.lost) === Number(st.drained) && after === want && tagDigits() === want && String(big.cmp(w.stored(S.server), big.SAFE)) === '1',
      'seeded ' + seeded + ' (tag ' + seededTag + '); the settlement took ' + st.drained + ' from the dynamo, stored ' + st.in + ' (lost ' + st.lost + '), handed out ' + st.out +
      ' (cap ' + CAP + '); store ' + after + ', BigInteger says ' + want + ', tag ' + tagDigits() + ', faulted ' + st.faulted)
    S.hatchAfterExact = hatchStored()
    // the hatch got the cap: the prefill below starts from an empty one
    var back = hatchStored()
    if (back !== 0) hatchContainer().changeEnergy(-back)
    S.server.runCommandSilent('save-all flush')
    w.dropCache()
    var reread = String(w.stored(S.server))
    check('saved', reread === want && tagDigits() === want, 'after save-all flush and a cache drop the store reads ' + reread + ' (want ' + want + '), tag ' + tagDigits())
  }

  function examine() {
    var m = machineAt(PLATE)
    var hatches = partsLike(m, /max_wireless_energy_hatch_4096a/)
    var energy = []
    array(m.getParts()).forEach(function (p) { if (p.energyContainer !== undefined && p.energyContainer !== null) energy.push(p) })
    S.bus = partsLike(m, /input_bus/)[0]
    S.out = partsLike(m, /output_bus/)[0]
    var ec = hatchContainer()
    var vin = Number(ec.getInputVoltage())
    var ain = Number(ec.getInputAmperage())
    var buf = Number(ec.getEnergyCapacity())
    check('hatch', hatches.length === 1 && energy.length === 1 && !!S.bus && !!S.out && vin === Number(GTValues.V[MAXT]) && ain === AMPS && buf === BUFFER,
      'the 4,096 A hatch is the plate\'s only energy part (' + hatches.length + ' of ' + energy.length + '); ' + vin + ' V x ' + ain + ' A, buffer ' + buf + ' (want 2^47 = ' + BUFFER + ')')
  }

  function prefill() {
    var w = W()
    var big = w.big
    var h0 = hatchStored()
    if (h0 !== 0) hatchContainer().changeEnergy(-h0)
    w.setStored(S.server, bi(STORE_RUN))
    var s0 = w.stored(S.server)
    var st1 = w.settle(S.server)
    var h1 = hatchStored()
    var s1 = w.stored(S.server)
    var st2 = w.settle(S.server)
    var h2 = hatchStored()
    var s2 = w.stored(S.server)
    S.prefilled = Number(st1.out) + Number(st2.out)
    var ok = !!st1.up && Number(st1.tier) === MAXT && String(s0) === STORE_RUN && Number(st1.out) === CAP && h1 === CAP && big.sub(s0, s1) === CAP &&
      Number(st2.out) === BUFFER - CAP && h2 === BUFFER && big.sub(s1, s2) === BUFFER - CAP && Number(st1.faulted) === 0 && Number(st2.faulted) === 0
    check('prefill', ok, 'network up ' + st1.up + ', tier ' + st1.tier + ', capacity ' + st1.capacity + ', towers ' + st1.towers + ', store ' + s0 + '; settlement 1 handed out ' + st1.out +
      ' (want ' + CAP + '), hatch ' + h1 + ', store ' + s1 + '; settlement 2 handed out ' + st2.out + ' (want ' + (BUFFER - CAP) + '), hatch ' + h2 + ', store ' + s2)
    return ok
  }

  function startRun() {
    var w = W()
    setBus(S.bus, CATALYST)
    S.samples = []
    S.settlements = []
    S.lastCount = Number(w.totals.settlements)
    S.hatchStart = hatchStored()
    S.T0 = w.big.add(w.stored(S.server), S.hatchStart)
    S.prevT = S.T0
    S.crossed = false
    S.runTick = 0
    S.eutDone = false
    S.doneAt = -1
    w.paused = false
    S.step = 1
    S.nextAt = S.server.getTickCount() + 1
    S.phase = 'run'
    note('RUN', 'catalyst in, timed settlements on; store + hatch ' + S.T0)
  }

  function eutCheck(m) {
    var rec = m.getRecipeLogic().getLastRecipe()
    var eut = NaN
    var id = ''
    var dur = NaN
    try { eut = Number(classes().RecipeHelper.getRealEUtWithIO(rec).getTotalEU()) } catch (e) { }
    try { id = String(rec.id) } catch (e) { }
    try { dur = Number(rec.duration) } catch (e) { }
    check('eut', eut === DIAL && /maxplus_wireless/.test(id), 'recipe ' + id + ': EU/t ' + eut + ' (want 2^43 = ' + DIAL + '), duration ' + dur)
  }

  function runTick() {
    var w = W()
    var big = w.big
    var m = machineAt(PLATE)
    var s = w.stored(S.server)
    var h = hatchStored()
    var T = big.add(s, h)
    var d = big.sub(S.prevT, T)
    S.prevT = T
    if (big.cmp(s, big.SAFE) <= 0) S.crossed = true
    var logic = m.getRecipeLogic()
    var working = String(logic.getStatus()) === 'WORKING'
    S.samples.push({ t: S.runTick, h: h, d: d, w: working })
    var n = Number(w.totals.settlements)
    if (n !== S.lastCount) {
      var last = w.last || {}
      S.settlements.push({ t: S.runTick, n: n - S.lastCount, out: Number(last.out), up: last.up === true, faulted: Number(last.faulted) })
      S.lastCount = n
    }
    if (working && !S.eutDone) {
      S.eutDone = true
      guarded('eut', function () { eutCheck(m) })
      setBus(S.bus, null)
    }
    if (S.doneAt < 0 && countIn(S.out, PRODUCT) >= 1) S.doneAt = S.runTick
    S.runTick++
    if (S.doneAt >= 0 && S.runTick >= S.doneAt + 12) return true
    if (!S.eutDone && S.runTick > 200) {
      var reasons = ''
      try { reasons = String(logic.getFailureReasons()) } catch (e) { reasons = 'n/a' }
      check('starts', false, 'the probe did not start in 200 ticks: status ' + logic.getStatus() + ', reasons ' + reasons)
      return true
    }
    return S.runTick > RUN + 260
  }

  function evaluate() {
    var w = W()
    var big = w.big
    w.paused = true
    var drops = S.samples.filter(function (x) { return x.d > 0 })
    var wrong = drops.filter(function (x) { return x.d !== DIAL })
    var rises = S.samples.filter(function (x) { return x.d < 0 })
    check('draw', drops.length >= RUN && wrong.length === 0 && rises.length === 0 && S.crossed,
      'store + hatch fell on ' + drops.length + ' ticks (want at least ' + RUN + '), by exactly 2^43 = ' + DIAL + ' on ' + (drops.length - wrong.length) + ', otherwise ' +
      wrong.slice(0, 3).map(function (x) { return 't' + x.t + ' ' + x.d }).join(', ') + '; rises ' + rises.length + '; the store crossed 2^53 on the way: ' + S.crossed)

    var working = S.samples.filter(function (x) { return x.w })
    var minHatch = working.reduce(function (a, x) { return Math.min(a, x.h) }, Infinity)
    var outs = S.settlements.map(function (x) { return x.out })
    var during = S.settlements.filter(function (x) { return working.length > 0 && x.t > working[0].t + 11 && x.t < working[working.length - 1].t })
    var steady = during.filter(function (x) { return x.out === CAP })
    var badOut = S.settlements.filter(function (x) { return !whole(x.out) || x.out < 0 || x.out > CAP || !x.up || x.faulted !== 0 || x.n !== 1 })
    check('settle', S.settlements.length > 0 && badOut.length === 0 && during.length >= 2 && steady.length === during.length && minHatch >= DIAL,
      S.settlements.length + ' timed settlements handed out ' + outs.join(', ') + ' (cap ' + CAP + '); while it ran ' + during.length + ', ' + steady.length +
      ' exactly the cap; out of line ' + badOut.length + '; the hatch never read less than ' + minHatch + ' while working (one tick ' + DIAL + ')')

    var sEnd = w.stored(S.server)
    var hEnd = hatchStored()
    var given = outs.reduce(function (a, b) { return a + b }, 0)
    var drawn = drops.reduce(function (a, x) { return a + x.d }, 0)
    var spent = String(big.sub(S.T0, big.add(sEnd, hEnd)))
    var want = bi(STORE_RUN).subtract(bi(String(S.prefilled))).subtract(bi(String(given))).toString()
    var digits = tagDigits()
    check('books', spent === String(drawn) && String(sEnd) === want && digits === String(sEnd) && drawn === drops.length * DIAL,
      'total fell by ' + spent + ' = drawn ' + drawn + ' (' + drops.length + ' x 2^43); store ' + STORE_RUN + ' - ' + S.prefilled + ' - ' + given + ' = ' + want + ', store reads ' + sEnd + ', tag ' + digits)
    var made = countIn(S.out, PRODUCT)
    check('completes', made >= 1, 'the output bus holds ' + made + ' ' + PRODUCT)
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
      guarded('book', book)
      try {
        saveNetwork()
        prepareWorld()
        if (!placeAll()) { finish(); return }
      } catch (e) {
        check('PLACED', false, 'exception placing: ' + errText(e))
        finish()
        return
      }
      S.phase = 'forming'
      S.t0 = elapsed
      return
    }
    if (S.phase === 'forming') {
      var waited = elapsed - S.t0
      var bad = []
      for (var i = 0; i < TOWERS; i++) if (!formCheck(machineAt(towerPos(i)), waited)) bad.push(i)
      var plate = formCheck(machineAt(PLATE), waited)
      if (bad.length > 0 || !plate) {
        if (waited < FORM_TIMEOUT) return
        check('FORMED', false, 'after ' + waited + ' ticks: towers not formed ' + bad.join(',') + (bad.length ? ' (' + why(machineAt(towerPos(bad[0]))) + ')' : '') +
          '; plate ' + (plate ? 'formed' : 'not formed, ' + why(machineAt(PLATE))))
        finish()
        return
      }
      check('FORMED', true, 'the ' + TOWERS + ' towers and the plate formed after ' + waited + ' ticks')
      guarded('hatch', examine)
      guarded('exact', exactStore)
      var filled = false
      guarded('prefill', function () { filled = prefill() })
      if (!filled) { finish(); return }
      startRun()
      return
    }
    if (S.phase === 'run') {
      var over = false
      try {
        over = runTick()
      } catch (e) {
        check('run', false, 'exception at tick ' + S.runTick + ': ' + errText(e))
        over = true
      }
      if (!over) return
      guarded('evaluate', evaluate)
      finish()
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    if (now < S.nextAt) return
    S.nextAt = now + S.step
    try {
      step(now - S.tick0)
    } catch (e) {
      check('STEP', false, 'exception in ' + S.phase + ': ' + errText(e))
      finish()
    }
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, level: server.overworld(), t0: 0, tick0: now, nextAt: now + 10, step: 10, phase: 'turn', queuedAt: Date.now(), started: false,
      finished: false, failed: 0, hatchPos: null }
    if (!ON) {
      check('enabled', false, 'kubejs/config/gg_test_maxplus_wireless.json is not {"enabled": true}: the startup overlay registered nothing')
      finish()
      return
    }
    joinQueue()
  }

  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    global[REQUEST] = false
    try {
      run(server)
    } catch (e) {
      if (S === null) S = { server: server, failed: 0, finished: false, started: false }
      check('run', false, 'exception: ' + errText(e))
      finish()
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_maxplus_wireless', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_maxplus_wireless run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
