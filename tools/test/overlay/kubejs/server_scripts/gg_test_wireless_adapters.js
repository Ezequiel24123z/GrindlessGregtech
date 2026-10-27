// priority: -10124
// Gregtech Grindless - focused test of how the wireless network moves EU into and out of GTM machines (TEST-ONLY overlay: copied over
// the instance on the test PC, never shipped with the pack): server_scripts/grindless/lib/wireless_adapters.js and
// lib/wireless_registry.js, as lv/wireless_energy.js uses them. The network itself (towers, hatches, covers, unloading, saving) is
// gg_test_wireless_energy.js; this test only covers what the review of 2026-10-26 found: GTM's charger (and battery buffer) report their
// items' charge while the changeEnergy they inherit writes a hidden buffer, and the old one-string list.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -Slots 1 `
//     -Commands 'kubejs custom_command gg_test_wireless_adapters' -WaitForLog 'GGTEST\|wireless_adapters\|DONE@@180'
// Native acceptance runs in the integrated validation of its batch, not in a run of its own (tools/test/README.md). The wireless tests
// share their band and take turns in the order they were asked for (a queue in `global`), so they can be asked for in one run; the
// whole script also runs in a simulated server in tools/analysis/test/wireless_network.test.mjs.
//
// Markers: GGTEST|wireless_adapters|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|wireless_adapters|DONE.
//   LEGACY            an old-format list (one JSON string) under the network's key: read once, converted to an NBT list of
//                     compounds with the same entries, the string kept aside under the backup key (real NBT classes, not stand-ins)
//   CLASSIFY          the energy adapter's view: a charger and a battery buffer through their items, a macerator plain, GTM's
//                     converter unsupported; an energy cover on the converter is refused (cover_unsupported) and nothing goes on
//   CHARGER_OLD_PATH  the review's repro, on GTM itself: changeEnergy(640) on an LV 4x charger holding a lithium battery at 60,000 EU
//                     returns -55,904 and the battery keeps 60,000; on an empty battery it returns 640 and the battery stays empty
//                     (what the old network booked)
//   in the world: the Overworld X 13312-13375, Z 0-63, Y 98-112 (roof at Y 112); a tower with 4 LV cells (the network is LV) and a
//   row of machines with LV covers; the network's own settlement paused, the test settles 3 times itself and reads every item:
//     CHARGER_EMPTY     an empty LV lithium battery in an LV 4x charger: +640 EU per settlement (2 A x 32 V x 10 ticks), 1,920
//     CHARGER_PARTIAL   the review's case through the adapter: the battery at 60,000 EU gets +640 per settlement, 61,920
//     CHARGER_NEAR_FULL a battery 100 EU short of full: +100, then nothing
//     CHARGER_DISABLED  a charger turned off (soft mallet): nothing, and nothing booked
//     BUFFER_FILL       an energy cover on a battery buffer with empty batteries: +640 per settlement into its items
//     BUFFER_DRAIN      a dynamo cover on a battery buffer with charged batteries: -640 per settlement from its items, 608 into the
//                       network (19/20)
//     BANK              per settlement the store changes by exactly what went in minus what the items took; the flows, the
//                       settlement's own numbers and the items agree; nothing set aside
// TEST AREA: this test force-loads, clears and builds ONLY its band of the Overworld (AGENTS.md: tests run at the same time in one
// server), and clears and releases it at the end, with the network's persistent data keys.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'wireless_adapters'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestWirelessAdaptersRequest'
  // the wireless tests share their band: they take turns in the order they were asked for (gg_test_wireless_*.js)
  var QUEUE = 'ggTestWirelessQueue'
  var TEST_TIMEOUT = 2400

  var EARTH = 'minecraft:overworld'
  var END = 'minecraft:the_end'
  var BAND = { x0: 13312, x1: 13375, z0: 0, z1: 63 }
  var BAND_Y = [98, 112]
  var ROOF_Y = 112
  var EY = 100
  var ROW_Z = 4

  var TOWER = { x: 13316, z: 20 }
  // the row of machines (every one facing north, nothing next to it: a battery buffer gives EU out of its front)
  var AT = {
    oldFull: 13340, oldEmpty: 13343, empty: 13346, partial: 13349, near: 13352, off: 13355, drain: 13358, fill: 13361, conv: 13364, mac: 13367
  }

  var LV_CELL = 'grindless:lv_capacitor_cell'
  var CHARGER = 'gtceu:lv_charger_4x'
  var BUFFER = 'gtceu:lv_battery_buffer_4x'
  var CONVERTER = 'gtceu:lv_1a_energy_converter'
  var MACERATOR = 'gtceu:lv_macerator'
  var LITHIUM = 'gtceu:lv_lithium_battery'
  var SODIUM = 'gtceu:lv_sodium_battery'
  var BANK0 = 100000
  var SETTLEMENTS = 3

  var S = null
  var J = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3500)
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

  function guarded(name, fn) {
    try {
      fn()
    } catch (e) {
      check(name, false, 'exception: ' + e)
    }
  }

  // the turn queue: test names joined by commas in `global` (a plain string survives the scripts' reloads)
  function queueList() {
    var s = global[QUEUE]
    s = s === undefined || s === null ? '' : String(s)
    return s === '' ? [] : s.split(',')
  }
  function joinQueue(name) {
    var q = queueList()
    if (q.indexOf(name) < 0) q.push(name)
    global[QUEUE] = q.join(',')
  }
  function leaveQueue(name) {
    global[QUEUE] = queueList().filter(function (n) { return n !== name }).join(',')
  }
  function myTurn(name) {
    return queueList()[0] === name
  }

  // ---------------------------------------------------------------- Java

  function lazy() {
    if (J !== null) return J
    J = {
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      Direction: Java.loadClass('net.minecraft.core.Direction'),
      AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
      ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity'),
      FPF: Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      GTCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.GTCapabilityHelper')
    }
    return J
  }

  function W() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.settle !== 'function' || typeof w.classify !== 'function') {
      throw new Error('global.grindless.wireless is incomplete (the server script did not load)')
    }
    return w
  }

  function bp(x, y, z) { return new (lazy().BlockPos)(x, y, z) }
  function cmd(text) { return S.server.runCommandSilent('execute in ' + EARTH + ' run ' + text) }
  function machineAt(x, y, z) {
    var m = lazy().MetaMachine.getMachine(S.earth, bp(x, y, z))
    return m === null || m === undefined ? null : m
  }
  function textOf(c) {
    if (c === null || c === undefined) return ''
    return typeof c === 'string' ? c : (c.getString ? String(c.getString()) : String(c))
  }
  function keyOf(c) {
    try { return String(c.getContents().getKey()) } catch (e) { return '' }
  }
  function flowOf(x, side) {
    var f = W().flows[EARTH + '|' + x + '|' + EY + '|' + ROW_Z + '|' + side]
    return f || { drained: 0, in: 0, filled: 0 }
  }

  function electric(stack) {
    var e = stack.isEmpty() ? null : lazy().GTCap.getElectricItem(stack)
    return e === undefined ? null : e
  }
  // a new battery holding `eu` (GTM's own charge call, transfer limit ignored)
  function battery(id, eu) {
    var stack = Item.of(id)
    var e = electric(stack)
    if (e === null) throw new Error(id + ' has no GTM electric item')
    if (eu > 0) {
      var got = Number(e.charge(eu, Number(e.getTier()), true, false))
      if (got !== eu) throw new Error(id + ' took ' + got + ' of ' + eu + ' EU')
    }
    return stack
  }
  function maxOf(id) {
    return Number(electric(Item.of(id)).getMaxCharge())
  }
  // the real charge of the items in a charger or a battery buffer (GTM's electric item of each slot)
  function items(m) {
    if (m === null) return -1
    var inv = typeof m.getChargerInventory === 'function' ? m.getChargerInventory() : m.getBatteryInventory()
    var n = 0
    for (var i = 0; i < inv.getSlots(); i++) {
      var e = electric(inv.getStackInSlot(i))
      if (e !== null) n += Number(e.getCharge())
    }
    return n
  }

  function fakePlayer() {
    if (!S.fake) S.fake = lazy().FPF.getMinecraft(S.earth)
    return S.fake
  }

  // ---------------------------------------------------------------- the world

  // vanilla's fill takes at most 32,768 blocks: the band (64 x 64 x up to 17) goes in strips of 16 along Z
  function fillBand(y0, y1, block) {
    var n = 0
    for (var z = BAND.z0; z <= BAND.z1; z += 16) {
      n += Number(cmd('fill ' + BAND.x0 + ' ' + y0 + ' ' + z + ' ' + BAND.x1 + ' ' + y1 + ' ' + Math.min(z + 15, BAND.z1) + ' ' + block))
    }
    return n
  }

  function prepareWorld() {
    S.areaTouched = true
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.earth.getChunk(cx, cz)
    }
    var loaded = cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = fillBand(BAND_Y[0], BAND_Y[1], 'air')
    fillBand(ROOF_Y, ROOF_Y, 'minecraft:smooth_stone')
    note('AREA', EARTH + ' band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND_Y[0] + '-' + BAND_Y[1] + ' Z ' + BAND.z0 + '-' + BAND.z1 +
      ': generated, forceload add ' + loaded + ', cleared ' + cleared + ', roof at Y ' + ROOF_Y)
  }

  function dropItems() {
    var list = S.earth.getEntitiesOfClass(lazy().ItemEntity, new (lazy().AABB)(BAND.x0, BAND_Y[0], BAND.z0, BAND.x1 + 1, BAND_Y[1] + 1, BAND.z1 + 1))
    for (var i = 0; i < list.size(); i++) list.get(i).discard()
    return list.size()
  }

  function cleanup() {
    if (S.areaTouched) {
      cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      var cleared = fillBand(BAND_Y[0], BAND_Y[1], 'air')
      // the machines drop their batteries and covers when they go: removed after the fill
      var items = dropItems()
      var released = cmd('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      note('CLEANUP', 'cleared ' + cleared + ' blocks, ' + items + ' item entities removed, forceload remove ' + released)
    }
    var w = W()
    var pd = S.server.persistentData
    pd.remove(w.blocksKey)
    pd.remove(w.storeKey)
    pd.remove(w.legacyKey)
    w.dropCache()
  }

  function setblock(x, y, z, block, failed) {
    if (Number(cmd('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')) >= 1) return
    // setblock changes nothing (and returns 0) when that block is already there
    var want = String(block).split('[')[0]
    if (want.indexOf(':') < 0) want = 'minecraft:' + want
    var have = String(S.earth.getBlock(x, y, z).id)
    if (have !== want) failed.push(x + ',' + y + ',' + z + ' ' + block + ' (is ' + have + ')')
  }

  // the tower from lib/patterns.js's description, the controller facing north at (x, EY, z), the structure behind it; the first
  // `cells` cell slots take a cell, the rest the casing (an empty slot)
  function placeTower(at, cells, failed) {
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
          if (sym.kind === 'oneOf') id = used < cells ? LV_CELL : w.casing
          else if (sym.kind === 'frames') id = 'gtceu:' + sym.materials[0] + '_frame'
          else if (sym.kind === 'blocks') id = sym.blocks[0]
          if (sym.kind === 'oneOf' && used < cells) used++
          setblock(at.x - (ci - ctrl.ci), EY + (ri - ctrl.ri), at.z - (si - ctrl.si), id, failed)
        }
      })
    })
    setblock(at.x, EY, at.z, w.towerId + '[facing=north]', failed)
    return used
  }

  function formedOrForce(m, waited) {
    if (m === null) return 'missing'
    if (m.isFormed()) return 'formed'
    if (waited < 100) return 'waiting'
    if (m.checkPatternWithLock()) {
      m.setFlipped(m.getMultiblockState().isNeededFlip())
      m.onStructureFormed()
      note('TOWER_forced', 'not formed by itself after ' + waited + ' ticks; a synchronous check passes (forming it)')
      return 'formed'
    }
    return waited > 300 ? 'failed: ' + m.getMultiblockState().error : 'waiting'
  }

  // ---------------------------------------------------------------- checks without the world

  // an old-format list (one JSON string) read through the network: converted, the string kept aside
  function checkLegacy() {
    var w = W()
    var R = global.grindless.wirelessRegistry
    var pd = S.server.persistentData
    pd.remove(w.blocksKey)
    pd.remove(w.legacyKey)
    w.dropCache()
    // entries in unloaded End chunks of the band (nothing there): the conversion only, no settlement uses them
    var old = [
      { k: 'cover', d: END, x: 13312, y: 100, z: 0, s: 'up', ck: 'energy', t: 1 },
      { k: 'hatch', d: END, x: 13313, y: 100, z: 0, t: 2, a: 4 },
      { k: 'tower', d: END, x: 13314, y: 100, z: 0, f: true, c: 2880000, t: 1, n: 4 }
    ]
    var json = JSON.stringify(old)
    pd.putString(w.blocksKey, json)
    w.dropCache()
    note('LEGACY_expected_log', 'the next [ERROR] lines of [grindless/wireless] about "the list of wireless blocks" are this check\'s deliberate conversion')
    var got = w.tracked(S.server)
    var typeAfter = Number(pd.getTagType(w.blocksKey))
    var size = typeAfter === 9 ? Number(pd.getList(w.blocksKey, 10).size()) : -1
    var backupType = Number(pd.getTagType(w.legacyKey))
    var backup = backupType === 8 ? String(pd.getString(w.legacyKey)) : ''
    var want = JSON.stringify(old.map(function (e) { return R.canon(e) }))
    // read again from the written list, not the cache
    w.dropCache()
    var again = JSON.stringify(w.tracked(S.server))
    check('LEGACY', JSON.stringify(got) === want && again === want && typeAfter === 9 && size === 3 && backupType === 8 && backup === json,
      'a ' + json.length + '-character JSON string under ' + w.blocksKey + ': read as ' + got.length + ' entries (the same as written: ' + (JSON.stringify(got) === want) +
      '); the key now holds NBT type ' + typeAfter + ' (9 = list) of ' + size + ' compounds, read back the same: ' + (again === want) + '; the string kept under ' +
      w.legacyKey + ' (type ' + backupType + ', unchanged: ' + (backup === json) + ')')
    pd.remove(w.blocksKey)
    pd.remove(w.legacyKey)
    w.dropCache()
  }

  // ---------------------------------------------------------------- build

  function build() {
    var w = W()
    var L = lazy()
    var failed = []
    S.cells = placeTower(TOWER, 4, failed)
    // tracked as a placing player's BlockEvents.placed would (a /setblock fires no event)
    S.towerEntry = w.track(S.earth, bp(TOWER.x, EY, TOWER.z))
    ;['oldFull', 'oldEmpty', 'empty', 'partial', 'near', 'off'].forEach(function (k) { setblock(AT[k], EY, ROW_Z, CHARGER + '[facing=north]', failed) })
    setblock(AT.drain, EY, ROW_Z, BUFFER + '[facing=north]', failed)
    setblock(AT.fill, EY, ROW_Z, BUFFER + '[facing=north]', failed)
    setblock(AT.conv, EY, ROW_Z, CONVERTER + '[facing=north]', failed)
    setblock(AT.mac, EY, ROW_Z, MACERATOR + '[facing=north]', failed)
    if (failed.length) {
      check('PLACED', false, failed.slice(0, 8).join('; '))
      return false
    }
    S.m = {}
    Object.keys(AT).forEach(function (k) { S.m[k] = machineAt(AT[k], EY, ROW_Z) })
    S.lithiumMax = maxOf(LITHIUM)
    var charger = function (k, eu) { S.m[k].getChargerInventory().setStackInSlot(0, battery(LITHIUM, eu)) }
    charger('oldFull', 60000)
    charger('oldEmpty', 0)
    charger('empty', 0)
    charger('partial', 60000)
    charger('near', S.lithiumMax - 100)
    charger('off', 0)
    var sodiumMax = maxOf(SODIUM)
    for (var i = 0; i < 4; i++) {
      S.m.drain.getBatteryInventory().setStackInSlot(i, battery(SODIUM, sodiumMax))
      S.m.fill.getBatteryInventory().setStackInSlot(i, battery(SODIUM, 0))
    }
    var fp = fakePlayer()
    var up = L.Direction.UP
    S.covers = {}
    ;['empty', 'partial', 'near', 'off', 'fill'].forEach(function (k) {
      S.covers[k] = w.placeCover(S.earth, bp(AT[k], EY, ROW_Z), up, Item.of(w.coverItemId('energy', 1)), fp)
    })
    S.covers.drain = w.placeCover(S.earth, bp(AT.drain, EY, ROW_Z), up, Item.of(w.coverItemId('dynamo', 1)), fp)
    S.covers.conv = w.placeCover(S.earth, bp(AT.conv, EY, ROW_Z), up, Item.of(w.coverItemId('energy', 1)), fp)
    // the charger turned off after its cover went on (a soft mallet: GTM's IControllable)
    S.m.off.setWorkingEnabled(false)
    var bad = []
    Object.keys(S.covers).forEach(function (k) {
      if (k !== 'conv' && !S.covers[k].ok) bad.push(k + ': ' + textOf(S.covers[k].message))
    })
    check('PLACED', bad.length === 0 && S.cells === 4,
      'a tower with ' + S.cells + ' LV cells; 6 LV 4x chargers (lithium batteries of ' + S.lithiumMax + ' EU: 60,000 / empty / empty / 60,000 / 100 short / empty, the last ' +
      'turned off), 2 LV 4x battery buffers (4 sodium batteries of ' + sodiumMax + ' EU, full / empty), an LV converter, an LV macerator; LV covers on top: ' +
      Object.keys(S.covers).map(function (k) { return k + ' ' + S.covers[k].ok }).join(', ') + (bad.length ? ' BAD ' + bad.join('; ') : ''))
    return bad.length === 0
  }

  // ---------------------------------------------------------------- checks in the world

  function checkClassify() {
    var w = W()
    var c = {}
    ;['empty', 'drain', 'conv', 'mac'].forEach(function (k) { c[k] = w.classify(S.m[k]) })
    var conv = S.covers.conv
    var onConv = S.m.conv.getCoverContainer().getCoverAtSide(lazy().Direction.UP)
    var tracked = w.tracked(S.server).filter(function (e) { return e.k === 'cover' && e.x === AT.conv })
    var plainOk = c.mac.kind === 'plain' && /RecipeAmperageEnergyContainer$|NotifiableEnergyContainer$/.test(c.mac.cls)
    check('CLASSIFY', c.empty.kind === 'items' && /ChargerMachine\$EnergyBatteryTrait$/.test(c.empty.cls) && c.drain.kind === 'items' &&
      /BatteryBufferMachine\$EnergyBatteryTrait$/.test(c.drain.cls) && plainOk && c.conv.kind === 'unsupported' && /ConverterTrait$/.test(c.conv.cls) &&
      !conv.ok && keyOf(conv.message) === 'message.grindless.wireless.cover_unsupported' && (onConv === null || onConv === undefined) && tracked.length === 0,
      'charger ' + c.empty.kind + ' (' + c.empty.cls + '); battery buffer ' + c.drain.kind + ' (' + c.drain.cls + '); macerator ' + c.mac.kind + ' (' + c.mac.cls +
      '); converter ' + c.conv.kind + ' (' + c.conv.cls + '); an energy cover on the converter: placed ' + conv.ok + ', ' + keyOf(conv.message) + ' "' + textOf(conv.message) +
      '", a cover on its top ' + (onConv !== null && onConv !== undefined) + ', tracked ' + tracked.length)
  }

  // the review's repro on GTM itself: what the inherited changeEnergy did on a charger (machines the network never touches)
  function checkOldPath() {
    var full = S.m.oldFull
    var empty = S.m.oldEmpty
    var fullBefore = items(full)
    var emptyBefore = items(empty)
    var storedBefore = Number(full.energyContainer.getEnergyStored())
    var r1 = Number(full.energyContainer.changeEnergy(640))
    var r2 = Number(empty.energyContainer.changeEnergy(640))
    var fullAfter = items(full)
    var emptyAfter = items(empty)
    check('CHARGER_OLD_PATH', storedBefore === 60000 && r1 === -55904 && fullAfter === fullBefore && r2 === 640 && emptyAfter === emptyBefore && emptyAfter === 0,
      'GTM 7.5.3\'s inherited NotifiableEnergyContainer#changeEnergy(640) on an LV 4x charger: with a battery at ' + fullBefore + ' EU (getEnergyStored ' + storedBefore +
      ') it returns ' + r1 + ' and the battery holds ' + fullAfter + ' (the old network took that as 55,904 EU given back to the store); with an empty battery it returns ' +
      r2 + ' and the battery holds ' + emptyAfter + ' (the old network booked 640 EU that charged nothing). The network no longer calls it on these classes')
  }

  // ---------------------------------------------------------------- the settlements

  var ROWS = ['empty', 'partial', 'near', 'off', 'fill', 'drain']

  function snapshot() {
    var w = W()
    var o = { bank: w.stored(S.server), items: {}, flows: {}, totals: JSON.parse(JSON.stringify(w.totals)) }
    ROWS.forEach(function (k) {
      o.items[k] = items(S.m[k])
      o.flows[k] = JSON.parse(JSON.stringify(flowOf(AT[k], 'up')))
    })
    return o
  }

  function startSettlements() {
    var w = W()
    // the network's own settlement has been paused since the test started; the first settlement below also brings the tower's entry
    // up to date (it was tracked before it formed)
    w.setStored(S.server, BANK0)
    S.limit = w.rate(1, w.coverAmps) * w.settleTicks
    S.rows = []
    S.before = snapshot()
    note('settlements', 'the network\'s own settlement paused; the store set to ' + BANK0 + ' EU; an LV cover moves at most ' + S.limit + ' EU per settlement (' +
      w.coverAmps + ' A x 32 V x ' + w.settleTicks + ' ticks); the test settles ' + SETTLEMENTS + ' times and reads every item')
  }

  function settleOnce() {
    var w = W()
    var st = w.settle(S.server)
    var after = snapshot()
    var d = { st: st, bank: after.bank - S.before.bank, items: {}, flows: {} }
    ROWS.forEach(function (k) {
      d.items[k] = after.items[k] - S.before.items[k]
      var fa = after.flows[k]
      var fb = S.before.flows[k]
      d.flows[k] = { drained: fa.drained - fb.drained, in: fa.in - fb.in, filled: fa.filled - fb.filled }
    })
    S.rows.push(d)
    S.before = after
  }

  function reportSettlements() {
    var w = W()
    var L = S.limit
    var rows = S.rows
    var near = [100, 0, 0]
    var line = function (k) { return rows.map(function (r) { return r.items[k] }).join(',') }
    var fills = function (r) { return r.items.empty + r.items.partial + r.items.near + r.items.off + r.items.fill }
    var flowsAgree = rows.every(function (r) {
      return ['empty', 'partial', 'near', 'off', 'fill'].every(function (k) { return r.flows[k].filled === r.items[k] && r.flows[k].drained === 0 }) &&
        r.flows.drain.drained === -r.items.drain && r.flows.drain.in === r.st.in && r.flows.drain.filled === 0
    })
    var faults = ROWS.map(function (k) { return EARTH + '|' + AT[k] + '|' + EY + '|' + ROW_Z + '|up' }).filter(function (k) { return w.faults[k] })
    var last = S.before
    check('CHARGER_EMPTY', rows.every(function (r) { return r.items.empty === L }) && last.items.empty === SETTLEMENTS * L,
      'an empty LV lithium battery in an LV 4x charger with an LV energy cover: +' + line('empty') + ' EU per settlement (the cover\'s ' + L +
      '), the battery now ' + last.items.empty + ' EU (real item charge)')
    check('CHARGER_PARTIAL', rows.every(function (r) { return r.items.partial === L }) && last.items.partial === 60000 + SETTLEMENTS * L,
      'the review\'s case through the adapter, a battery at 60,000 EU: +' + line('partial') + ' EU per settlement, now ' + last.items.partial +
      ' EU (real item charge; the inherited changeEnergy would have returned -55,904)')
    check('CHARGER_NEAR_FULL', rows.every(function (r, i) { return r.items.near === near[i] }) && last.items.near === S.lithiumMax,
      'a battery 100 EU short of full: +' + line('near') + ' EU per settlement, now ' + last.items.near + ' of ' + S.lithiumMax + ' EU (finite: what it has room for, then nothing)')
    check('CHARGER_DISABLED', rows.every(function (r) { return r.items.off === 0 && r.flows.off.filled === 0 }) && last.items.off === 0,
      'a charger turned off (isWorkingEnabled false): +' + line('off') + ' EU per settlement, nothing booked')
    check('BUFFER_FILL', rows.every(function (r) { return r.items.fill === L }),
      'an LV energy cover on an LV battery buffer with 4 empty sodium batteries: +' + line('fill') + ' EU per settlement into its items, now ' + last.items.fill + ' EU')
    check('BUFFER_DRAIN', rows.every(function (r) { return r.items.drain === -L && r.st.drained === L && r.st.in === L * 19 / 20 && r.st.lost === L / 20 }),
      'an LV dynamo cover on an LV battery buffer with 4 full sodium batteries: ' + line('drain') + ' EU per settlement out of its items; into the network ' +
      rows.map(function (r) { return r.st.in }).join(',') + ' (19/20), lost ' + rows.map(function (r) { return r.st.lost }).join(','))
    check('BANK', rows.every(function (r) { return r.bank === r.st.in - fills(r) && r.st.out === fills(r) && r.st.faulted === 0 && r.st.up && r.st.tier === 1 }) &&
      flowsAgree && faults.length === 0 && last.bank === BANK0 + rows.reduce(function (a, r) { return a + r.st.in - fills(r) }, 0),
      'per settlement the store moved ' + rows.map(function (r) { return r.bank }).join(',') + ' EU = in ' + rows.map(function (r) { return r.st.in }).join(',') +
      ' - what the items took ' + rows.map(function (r) { return fills(r) }).join(',') + ' (the settlement\'s out: ' + rows.map(function (r) { return r.st.out }).join(',') +
      '); ' + BANK0 + ' -> ' + last.bank + ' EU; the per-block flows agree with the items: ' + flowsAgree + '; set aside: ' + (faults.length ? faults.map(function (k) { return k + ' ' + w.faults[k] }).join(', ') : 'none') +
      '; the network up, tier ' + rows[0].st.tier + ', ' + rows[0].st.towers + ' tower, ' + rows[0].st.capacity + ' EU')
  }

  // ---------------------------------------------------------------- driver

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      W().paused = false
    } catch (e0) { /* nothing */ }
    try {
      cleanup()
    } catch (e) {
      check('cleanup', false, 'exception: ' + e)
    }
    leaveQueue(SCOPE)
    console.info(TAG + SCOPE + '|DONE')
  }

  function phase(next) {
    S.phase = next
    S.phaseAt = S.t
  }

  function step() {
    var since = S.t - S.phaseAt
    if (S.phase === 'forming') {
      var f = formedOrForce(machineAt(TOWER.x, EY, TOWER.z), since)
      if (f === 'formed') {
        guarded('CLASSIFY', checkClassify)
        guarded('CHARGER_OLD_PATH', checkOldPath)
        startSettlements()
        phase('settle')
      } else if (f.indexOf('failed') === 0 || f === 'missing' || since > 400) {
        check('TOWER', false, 'the tower ' + f + ' after ' + since + ' ticks')
        phase('end')
      }
      return
    }
    if (S.phase === 'settle') {
      settleOnce()
      if (S.rows.length >= SETTLEMENTS) {
        guarded('settlements', reportSettlements)
        phase('end')
      }
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    S.t = S.server.getTickCount() - S.tick0
    try {
      if (S.t % 5 === 0 && S.phase !== 'end') step()
    } catch (e) {
      check('step', false, 'exception in ' + S.phase + ': ' + e)
      phase('end')
    }
    if (S.phase === 'end') {
      finish()
      return
    }
    if (S.t > TEST_TIMEOUT) {
      check('timeout', false, 'still in ' + S.phase + ' after ' + S.t + ' ticks')
      finish()
    }
  }

  function run(server) {
    S = { server: server, earth: server.overworld(), tick0: server.getTickCount(), t: 0, phase: 'start', phaseAt: 0, finished: false, areaTouched: false }
    var w = W()
    // the test does every settlement itself: none may run on its own between the tower forming and the first measured one
    w.paused = true
    w.totals.drained = 0
    w.totals.in = 0
    w.totals.lost = 0
    w.totals.out = 0
    w.totals.settlements = 0
    S.server.persistentData.remove(w.blocksKey)
    S.server.persistentData.remove(w.storeKey)
    w.dropCache()
    guarded('LEGACY', checkLegacy)
    guarded('AREA', prepareWorld)
    var built = false
    try {
      built = build()
    } catch (e) {
      check('PLACED', false, 'exception: ' + e)
    }
    phase(built ? 'forming' : 'end')
    if (!built) finish()
  }

  // The pack's Additional Placements mod reloads the datapacks (and these scripts) a couple of seconds after the server is up: the
  // command only leaves a request in `global` and the tick handler starts the test once these scripts have been loaded for QUIET_MS
  // and it is this test's turn on the band.
  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS || !myTurn(SCOPE)) return
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

  ServerEvents.customCommand('gg_test_wireless_adapters', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous run is still in progress')
      return 0
    }
    global[REQUEST] = true
    joinQueue(SCOPE)
    note('requested', 'the test starts once these scripts have been loaded for ' + (QUIET_MS / 1000) + ' s and the wireless tests asked for before it are done (' +
      queueList().join(', ') + ')')
    return 1
  })
})()
