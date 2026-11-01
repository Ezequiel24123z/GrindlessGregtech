// TEST ONLY, XP-D1 spike S0-11 (bench overlay, never shipped; needs the startup overlay on: kubejs/config/gg_test_xp_s0_dial.json {"enabled": true}).
// The Hyperstargate dial's power path (docs/eras/maxplus.md, the hatch table; results in docs/research/maxplus-s0.md, S0-11):
//
//   ssh grindless-vm 'bash /opt/grindless/tools/gg-vm-run.sh <pushed ref> -OverlayDir <overlay copy with the marker on> \
//     -Commands "kubejs custom_command gg_test_xp_s0_dial" -WaitForLog "GGTEST\|xp_s0_dial\|(DONE|FAIL)@@180"'
//
// A wireless tower of 32 MAX SMES cells holds the network's store; one 4,096 A wireless MAX+ hatch (gtceu:max_gg_xp_s0_dial_hatch_4096a, the
// startup overlay) sits in the energy_input cell of gtceu:gg_xp_s0_dial_plate. Two settlements fill the empty hatch, then the timed settlements run
// and a probe row at V[MAX] x 4,096 A = 2^43 EU/t runs RUN ticks on it. It takes its turn on the wireless network with the other wireless fixtures
// (the queue ggTestWirelessQueue in global), pauses the timed settlements while it sets up and puts the network's persistent data back at the end
// (as gg_test_maxplus_power does).
//   xp_s0_dial|book       the hatch is in the network's book (hatch, tier 14, 4,096 A) and its cap per settlement, V[MAX] x 4,096 x settleTicks,
//                         is the 4,096 A row of wireless_energy.json's maxplusCaps (87,960,930,222,080)
//   xp_s0_dial|PLACED, FORMED   the tower and the plate stand and form; the hatch is the plate's only energy part
//   xp_s0_dial|hatch      the hatch takes V[MAX] x 4,096 A and holds V x 16 x A = 2^47 (16 ticks of the dial) in GTM's NotifiableEnergyContainer
//   xp_s0_dial|prefill    two settlements fill the empty hatch: exactly the cap (10 ticks of the dial), then the rest of its buffer (6 ticks)
//   xp_s0_dial|eut        the running probe's EU/t reads 2^43 as a long
//   xp_s0_dial|draw       store + hatch fell by exactly 2^43 on every tick the probe drew, at least 20 ticks in a row, and never rose
//   xp_s0_dial|settle     the timed settlements while it ran handed out at most the cap each, the steady ones exactly the cap, never faulted,
//                         and the hatch never held less than one tick of the dial
//   xp_s0_dial|exact      every value read was a whole positive number at most 2^53, the books balance to the EU (store, hatch, draws,
//                         settlements) and the store's NBT long has the same digits
//   xp_s0_dial|completes  the probe's output reached the output bus
//   xp_s0_dial|long53     NOTE: a Java long above 2^53 through Rhino (BigInteger -> putLong -> the tag's digits) and through Number()
//   xp_s0_dial|DONE       last line, failures=N
//
// TEST AREA: ONLY the band X 47616-47679, Y 98-112, Z 0-63 (Overworld; zones.json xp_s0_dial). var + function everywhere (this Rhino throws
// "redeclaration of var" for const/let inside functions that run twice).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'xp_s0_dial'
  var REQUEST = 'ggTestXpS0DialRequest'
  var QUEUE = 'ggTestWirelessQueue'
  var QUIET_MS = 10000
  var TURN_TIMEOUT_MS = 120000
  var FORM_TIMEOUT = 600
  var LOADED_AT = Date.now()
  var BAND = { x0: 47616, x1: 47679, y0: 98, y1: 112, z0: 0, z1: 63 }
  var TOWER = { x: 47624, y: 100, z: 40 }
  var PLATE = { id: 'gtceu:gg_xp_s0_dial_plate', x: 47648, y: 100, z: 20 }
  var HATCH = 'gtceu:max_gg_xp_s0_dial_hatch_4096a'
  var CELL = 'grindless:max_smes_cell'
  var IN_BUS = 'gtceu:hv_input_bus'
  var OUT_BUS = 'gtceu:hv_output_bus'
  var MAXT = 14
  var AMPS = 4096
  // 2^43 = V[MAX] x 4,096; its cap per settlement (x 10); the hatch's buffer V x 16 x A = 2^47; the largest whole number a double holds exactly
  var DIAL = 8796093022208
  var CAP = 87960930222080
  var BUFFER = 140737488355328
  var SAFE = 9007199254740992
  // the store at the start: 120 ticks of the dial, more than 2^43 x 20 x 20/19 = 185,180,905,730,694.7
  var STORE0 = 1055531162664960
  var RUN = 60
  var CATALYST = 'minecraft:torchflower'
  var PRODUCT = 'minecraft:pitcher_plant'
  var marker = JsonIO.read('kubejs/config/gg_test_xp_s0_dial.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'

  var S = null
  var C = null

  function errText(e) {
    var s = ''
    try { s = String(e.message || e) } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 3).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }

  // the probe row: a catalyst in, a distinct item out (the output proves the run completed), 2^43 EU/t as a long
  ServerEvents.recipes(function (event) {
    if (!ON) return
    try {
      var Long = Java.loadClass('java.lang.Long')
      var eut = Number(GTValues.V[MAXT]) * AMPS
      event.recipes.gtceu.gg_xp_s0_dial('gg_test_xp_s0_dial:probe')
        .notConsumable('1x ' + CATALYST)
        .itemOutputs('1x ' + PRODUCT)
        .EUt(Long.valueOf(String(eut)))
        .duration(RUN)
    } catch (e) {
      console.error('[gg_test xp_s0_dial] could not add the probe row: ' + errText(e))
    }
  })

  function classes() {
    if (C === null) {
      C = {
        Pos: Java.loadClass('net.minecraft.core.BlockPos'),
        ArrayList: Java.loadClass('java.util.ArrayList'),
        Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        Long: Java.loadClass('java.lang.Long')
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
    if (!w || typeof w.settle !== 'function') throw new Error('global.grindless.wireless is missing or incomplete (lv/wireless_energy.js)')
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
  function exactPositive(n) { return whole(n) && n > 0 && n <= SAFE }
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

  // places a registered structure (lib/patterns.js description) with its controller at p facing north; pick(cell) names the block of a non-
  // controller cell. Returns the positions it placed, by symbol.
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

  function placeAll() {
    var w = W()
    var failed = []
    // the tower: every cell slot holds a MAX SMES cell (32 x 64,424,509,440,000 EU), so the network's tier is 14
    placeStructure(w.towerId, TOWER, function (c) {
      if (c.sym.kind === 'frames') return 'gtceu:' + c.sym.materials[0] + '_frame'
      if (c.sym.kind === 'blocks') return c.sym.blocks[0]
      if (c.sym.kind === 'oneOf') return CELL
      return null
    }, failed)
    // the plate: the energy_input cell takes the 4,096 A hatch; the two bus cells an input and an output bus
    var buses = 0
    var at = placeStructure(PLATE.id, PLATE, function (c) {
      if (c.ch === 'E') return HATCH
      if (c.ch === 'P') { buses++; return buses === 1 ? IN_BUS : OUT_BUS }
      if (c.sym.kind === 'blocks') return c.sym.blocks[0]
      return null
    }, failed)
    S.hatchPos = at.E && at.E.length === 1 ? at.E[0] : null
    // /setblock fires no BlockEvents.placed: the tower and the hatch are tracked by hand
    var te = w.track(S.level, pos(TOWER))
    var he = S.hatchPos === null ? null : w.track(S.level, pos(S.hatchPos))
    var ok = failed.length === 0 && S.hatchPos !== null && !!te && !!he && he.k === 'hatch' && Number(he.t) === MAXT && Number(he.a) === AMPS
    check('PLACED', ok, 'a tower of 32 ' + CELL + ' and the 3 x 3 x 3 plate with ' + HATCH + '; tracked tower ' + (te ? te.k : 'none') + ', hatch ' +
      (he ? he.k + ' tier ' + he.t + ' ' + he.a + ' A' : 'none') + (failed.length ? '; not placed: ' + failed.slice(0, 5).join('; ') : ''))
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
    var h = w.hatches[HATCH]
    var V = Number(GTValues.V[MAXT])
    var cap = w.rate(MAXT, AMPS) * w.settleTicks
    var rows = (w.table && w.table.maxplusCaps) || []
    var row = null
    for (var i = 0; i < rows.length; i++) if (Number(rows[i].amps) === AMPS) row = rows[i]
    var ok = Item.exists(HATCH) && !!h && h.kind === 'hatch' && Number(h.tier) === MAXT && Number(h.amps) === AMPS && w.hatchIds.indexOf(HATCH) >= 0 &&
      V * AMPS === DIAL && cap === CAP && row !== null && Number(row.cap) === cap && Number(row.tier) === MAXT
    check('book', ok, HATCH + ' in the book as ' + (h ? h.kind + ' tier ' + h.tier + ' ' + h.amps + ' A' : 'nothing') + '; V[MAX] x 4,096 = ' + (V * AMPS) +
      '; cap V x A x ' + w.settleTicks + ' = ' + cap + ', maxplusCaps 4,096 A row ' + (row ? row.cap + ' (tier ' + row.tier + ')' : 'missing') + ' (want ' + CAP + ')')
  }

  function examine() {
    var m = machineAt(PLATE)
    var hatches = partsLike(m, /gg_xp_s0_dial_hatch_4096a/)
    var energy = []
    array(m.getParts()).forEach(function (p) { if (p.energyContainer !== undefined && p.energyContainer !== null) energy.push(p) })
    S.bus = partsLike(m, /input_bus/)[0]
    S.out = partsLike(m, /output_bus/)[0]
    var ec = hatchContainer()
    var vin = Number(ec.getInputVoltage())
    var ain = Number(ec.getInputAmperage())
    var buf = Number(ec.getEnergyCapacity())
    var cls = String(ec.getClass().getName())
    var list = 'n/a'
    try { var lc = m.getEnergyContainer(); list = Number(lc.getInputVoltage()) + ' V x ' + Number(lc.getInputAmperage()) + ' A' } catch (e) { list = 'n/a (' + e + ')' }
    var mv = 'n/a'
    try { mv = String(m.getMaxVoltage()) } catch (e) { }
    check('hatch', hatches.length === 1 && energy.length === 1 && !!S.bus && !!S.out && vin === Number(GTValues.V[MAXT]) && ain === AMPS && buf === BUFFER &&
      cls === 'com.gregtechceu.gtceu.api.machine.trait.NotifiableEnergyContainer',
      'plate ' + m.getClass().getSimpleName() + ': the 4,096 A hatch is its energy part (' + hatches.length + ' of ' + energy.length + ' energy parts); hatch ' + vin + ' V x ' + ain +
      ' A, buffer ' + buf + ' (want 2^47 = ' + BUFFER + '), container ' + cls + '; the energy list reads ' + list + ', machine max voltage ' + mv)
  }

  function prefill() {
    var w = W()
    var h0 = hatchStored()
    if (h0 !== 0) hatchContainer().changeEnergy(-h0)
    w.setStored(S.server, STORE0)
    var s0 = w.stored(S.server)
    var st1 = w.settle(S.server)
    var h1 = hatchStored()
    var s1 = w.stored(S.server)
    var st2 = w.settle(S.server)
    var h2 = hatchStored()
    var s2 = w.stored(S.server)
    S.values = [s0, s1, s2, h1, h2, Number(st1.out), Number(st2.out)]
    S.prefilled = Number(st1.out) + Number(st2.out)
    var ok = !!st1.up && Number(st1.tier) === MAXT && s0 === STORE0 && Number(st1.out) === CAP && h1 === CAP && s0 - s1 === CAP &&
      Number(st2.out) === BUFFER - CAP && h2 === BUFFER && s1 - s2 === BUFFER - CAP && Number(st1.faulted) === 0 && Number(st2.faulted) === 0
    check('prefill', ok, 'network up ' + st1.up + ', tier ' + st1.tier + ', capacity ' + st1.capacity + ', store ' + s0 + '; settlement 1 handed out ' + st1.out +
      ' (want the cap ' + CAP + '), hatch ' + h1 + ', store ' + s1 + '; settlement 2 handed out ' + st2.out + ' (want ' + (BUFFER - CAP) + '), hatch ' + h2 +
      ' (want 2^47 = ' + BUFFER + '), store ' + s2 + '; faulted ' + st1.faulted + '/' + st2.faulted)
    return ok
  }

  function startRun() {
    var w = W()
    setBus(S.bus, CATALYST)
    S.samples = []
    S.settlements = []
    S.lastCount = Number(w.totals.settlements)
    S.storeStart = w.stored(S.server)
    S.hatchStart = hatchStored()
    S.T0 = S.storeStart + S.hatchStart
    S.prevT = S.T0
    S.runTick = 0
    S.eutDone = false
    S.doneAt = -1
    // from here on the pack's own timed settlement runs every settleTicks; the run is sampled every tick from the next one
    w.paused = false
    S.step = 1
    S.nextAt = S.server.getTickCount() + 1
    S.phase = 'run'
    note('RUN', 'catalyst in, timed settlements on; store ' + S.storeStart + ', hatch ' + S.hatchStart + ', store + hatch ' + S.T0)
  }

  function eutCheck(m) {
    var rec = m.getRecipeLogic().getLastRecipe()
    var eut = NaN
    var id = ''
    var dur = NaN
    try { eut = Number(classes().RecipeHelper.getRealEUtWithIO(rec).getTotalEU()) } catch (e) { }
    try { id = String(rec.id) } catch (e) { }
    try { dur = Number(rec.duration) } catch (e) { }
    var asInt = 'n/a'
    try { asInt = String(classes().Long.valueOf(String(eut)).intValue()) } catch (e) { }
    check('eut', eut === DIAL && /xp_s0_dial/.test(id), 'recipe ' + id + ': EU/t ' + eut + ' (want 2^43 = ' + DIAL + '; as an int it would read ' + asInt + '), duration ' + dur)
  }

  function runTick() {
    var w = W()
    var m = machineAt(PLATE)
    var s = w.stored(S.server)
    var h = hatchStored()
    var T = s + h
    var d = S.prevT - T
    S.prevT = T
    var logic = m.getRecipeLogic()
    var working = String(logic.getStatus()) === 'WORKING'
    S.samples.push({ t: S.runTick, s: s, h: h, d: d, w: working })
    var n = Number(w.totals.settlements)
    if (n !== S.lastCount) {
      var last = w.last || {}
      S.settlements.push({ t: S.runTick, n: n - S.lastCount, out: Number(last.out), stored: Number(last.stored), up: last.up === true, faulted: Number(last.faulted) })
      S.lastCount = n
    }
    if (working && !S.eutDone) {
      S.eutDone = true
      guarded('eut', function () { eutCheck(m) })
      // the catalyst is not consumed: take it out so the probe runs once
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
    w.paused = true
    var drops = S.samples.filter(function (x) { return x.d > 0 })
    var wrong = drops.filter(function (x) { return x.d !== DIAL })
    var rises = S.samples.filter(function (x) { return x.d < 0 })
    var streak = 0
    var best = 0
    S.samples.forEach(function (x) {
      streak = x.d === DIAL ? streak + 1 : 0
      if (streak > best) best = streak
    })
    check('draw', drops.length > 0 && wrong.length === 0 && rises.length === 0 && best >= 20,
      'store + hatch fell on ' + drops.length + ' ticks (the row lasts ' + RUN + '), by exactly 2^43 = ' + DIAL + ' on ' + (drops.length - wrong.length) + ', otherwise ' +
      wrong.slice(0, 3).map(function (x) { return 't' + x.t + ' ' + x.d }).join(', ') + '; longest run of 2^43 ticks ' + best + ' (want at least 20); rises ' + rises.length)

    var working = S.samples.filter(function (x) { return x.w })
    var minHatch = working.reduce(function (a, x) { return Math.min(a, x.h) }, Infinity)
    var outs = S.settlements.map(function (x) { return x.out })
    // the steady ones: after the first settlement of the run (it fills what the first ticks drew) and before the last working tick
    var during = S.settlements.filter(function (x) { return working.length > 0 && x.t > working[0].t + 11 && x.t < working[working.length - 1].t })
    var steady = during.filter(function (x) { return x.out === CAP })
    var badOut = S.settlements.filter(function (x) { return !whole(x.out) || x.out < 0 || x.out > CAP || !x.up || x.faulted !== 0 || x.n !== 1 })
    check('settle', S.settlements.length > 0 && badOut.length === 0 && during.length >= 2 && steady.length === during.length && minHatch >= DIAL,
      S.settlements.length + ' timed settlements handed out ' + outs.join(', ') + ' (cap ' + CAP + '); while it ran ' + during.length + ', ' + steady.length +
      ' of them exactly the cap; out of line ' + badOut.length + '; the lowest the hatch read while working ' + minHatch + ' (one tick of the dial ' + DIAL + ')')

    var sEnd = w.stored(S.server)
    var hEnd = hatchStored()
    var given = outs.reduce(function (a, b) { return a + b }, 0)
    var drawn = drops.reduce(function (a, x) { return a + x.d }, 0)
    var vals = S.values.slice()
    S.samples.forEach(function (x) { vals.push(x.s, x.h, x.s + x.h) })
    S.settlements.forEach(function (x) { if (x.out > 0) vals.push(x.out); vals.push(x.stored) })
    vals.push(sEnd, hEnd)
    var notExact = vals.filter(function (v) { return !exactPositive(v) })
    var tagDigits = ''
    try {
      tagDigits = digitsOf(S.server.persistentData.get(w.storeKey))
    } catch (e) { tagDigits = 'unreadable (' + e + ')' }
    var books = S.T0 - (sEnd + hEnd) === drawn && STORE0 - S.prefilled - given === sEnd && S.hatchStart + given - drawn === hEnd && drawn === drops.length * DIAL
    check('exact', notExact.length === 0 && books && tagDigits === String(sEnd),
      vals.length + ' values read, ' + notExact.length + ' not a whole positive number at most 2^53' + (notExact.length ? ' (' + notExact.slice(0, 3).join(', ') + ')' : '') +
      '; drawn ' + drawn + ' = ' + drops.length + ' x 2^43, handed out ' + S.prefilled + ' + ' + given + '; store ' + STORE0 + ' -> ' + sEnd + ', hatch ' + S.hatchStart + ' -> ' + hEnd +
      '; books balance ' + books + '; the store\'s NBT long reads ' + tagDigits)

    var made = countIn(S.out, PRODUCT)
    check('completes', made >= 1, 'the output bus holds ' + made + ' ' + PRODUCT + (S.doneAt >= 0 ? ' from tick ' + S.doneAt + ' of the run' : ''))
    note('ticks', 'ticks sampled ' + S.samples.length + ', working ' + working.length + ', drawing ' + drops.length + ' (the row lasts ' + RUN + ')')
  }

  // what XP-W2 needs to know before it keeps the store exact above 2^53 (1,200 ticks of the dial are 10,555,311,626,649,600 EU)
  function long53() {
    var pd = S.server.persistentData
    var KEY = 'gg_xp_s0_dial_long53'
    var parts = []
    try {
      var BI = Java.loadClass('java.math.BigInteger')
      var big = new BI('9007199254740993')
      parts.push('BigInteger ' + String(big.toString()))
      pd.putLong(KEY, big.longValue())
      var back = digitsOf(pd.get(KEY))
      parts.push('putLong(longValue()) stored ' + back + (back === '9007199254740993' ? ' (exact)' : ' (rounded)'))
      var js = Number(pd.getLong(KEY))
      parts.push('Number(getLong) reads ' + String(js) + (String(js) === '9007199254740993' ? ' (exact)' : ' (rounded: a double above 2^53 is even)'))
      var sum = new BI(back).add(BI.valueOf(CAP)).subtract(BI.valueOf(1))
      parts.push('BigInteger(tag digits) + cap - 1 = ' + String(sum.toString()))
    } catch (e) {
      parts.push('exception: ' + errText(e))
    }
    parts.push('in JS 2^53 + 1 === 2^53 is ' + String(SAFE + 1 === SAFE))
    try { pd.remove(KEY) } catch (e2) { }
    note('long53', parts.join('; '))
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
      var tower = formCheck(machineAt(TOWER), waited)
      var plate = formCheck(machineAt(PLATE), waited)
      if (!tower || !plate) {
        if (waited < FORM_TIMEOUT) return
        check('FORMED', false, 'after ' + waited + ' ticks: tower ' + (tower ? 'formed' : 'not formed, ' + why(machineAt(TOWER))) + '; plate ' +
          (plate ? 'formed' : 'not formed, ' + why(machineAt(PLATE))))
        finish()
        return
      }
      check('FORMED', true, 'the tower and the plate formed after ' + waited + ' ticks')
      guarded('hatch', examine)
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
      guarded('long53', long53)
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
      check('enabled', false, 'kubejs/config/gg_test_xp_s0_dial.json is not {"enabled": true}: the startup overlay registered nothing')
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

  ServerEvents.customCommand('gg_test_xp_s0_dial', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_xp_s0_dial run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
