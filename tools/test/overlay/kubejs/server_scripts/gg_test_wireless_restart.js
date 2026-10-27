// priority: -10324
// Gregtech Grindless - the wireless network across a clean server restart (TEST-ONLY overlay: copied over the instance on the test
// PC, never shipped with the pack): lv/wireless_energy.js with its list in persistent data as an NBT list of compounds
// (lib/wireless_registry.js). Two commands, one each side of the harness's bounded restart (gg-server.ps1, @restart: the server's
// console `stop`, exit 0, then the same world started again in a new JVM):
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -Slots 1 `
//     -Commands 'kubejs custom_command gg_test_wireless_adapters;;kubejs custom_command gg_test_wireless_restart_1;;@restart:GGTEST\|wireless_restart\|PHASE1\|DONE;;kubejs custom_command gg_test_wireless_restart_2' `
//     -WaitForLog 'GGTEST\|wireless_restart\|DONE@@180'
// Native acceptance runs in the integrated validation of its batch, not in a run of its own (tools/test/README.md). There the restart
// goes after every other test's commands and its marker lists their DONE markers too (@restart:A&&B&&...): it ends whatever still runs.
// The wireless tests share their band and take turns in the order they were asked for (a queue in `global`; the restart empties it).
// The whole script also runs in a simulated server, the restart as a second sandbox, in tools/analysis/test/wireless_network.test.mjs.
//
// Markers: GGTEST|wireless_restart|<check>|PASS|FAIL|NOTE|<detail>; phase 1 ends with GGTEST|wireless_restart|PHASE1|DONE (the
// harness's restart marker), phase 2 with GGTEST|wireless_restart|DONE. The first boot's log is in results\server\phase1\.
//   TURN                a phase asked for that has no turn on the band within 120 s fails with the queue it saw and still ends with its
//                       marker (phase 1 leaves a record saying why: phase 2 reports it as RESTORED FAIL and cleans up)
//   phase 1 (before the restart), the Overworld X 13312-13375, Z 0-63, Y 98-112 (roof at Y 112), the Moon (gcyr:luna) same X and Z,
//   Y 198-214, both force-loaded (vanilla saves force-loaded chunks and loads them again at start):
//     the endpoints that really work: a tower with 4 LV cells; in the Overworld an LV battery buffer with 4 full sodium batteries and an
//     LV dynamo cover; on the Moon an EBF on two LV wireless energy hatches (steel, 120 EU/t), an LV battery buffer with 4 empty sodium
//     batteries and an LV energy cover, an LV 4x charger with a lithium battery at 10,000 EU and an LV energy cover, and one LV
//     wireless energy hatch on its own. Everything registered the normal way (track for the hatches and the tower, placeCover).
//     BEFORE            the network runs by itself for 100 ticks: every endpoint moves EU
//     SYNTHETIC         1,200 cover entries added to the list in one write, all in unloaded End chunks of the band (no blocks, no
//                       machines: metadata only, to make the list bigger than the old single string could be saved); the settlements
//                       keep them (unloaded) and the time one settlement takes with them is noted
//     SNAPSHOT          the network paused; the lone hatch emptied (a consumer drew it); the list (its JSON's length and hash), the store,
//                       the items' charge and a record of all of it written in persistent data
//     SAVED             save-all flush; kubejs_persistent_data.nbt read back (NBTIO): the same list (exact), store and record; the old
//                       format would have needed one string longer than 65,535 bytes
//   phase 2 (a new JVM on the same world; the network starts by itself, nothing is placed, clicked or tracked again):
//     RESTORED          the record is there; this is another JVM (a token phase 1 left in `global` is gone) on the same world (its game
//                       time went on); the list in persistent data is an NBT list with the same entries (a well-formed fingerprint of its
//                       JSON, and its length; a fingerprint that is not well formed fails), synthetic
//                       ones included (nothing could register those again); no backup key; the store = the saved store + what came in
//                       - what went out since this JVM started (the network's totals); settlements have run
//     AUTOMATIC         after 100 more ticks, with no action: the Overworld dynamo cover drained its batteries by exactly what it gave
//                       (19/20 reached the store), the Moon's buffer and charger items rose by exactly what their covers gave, the lone
//                       hatch is full again (refilled by the network: exactly its capacity), the EBF works and both its hatches were
//                       filled; nothing set aside; the store still balances
// TEST AREA: this test force-loads, clears and builds ONLY its band in each dimension (AGENTS.md: tests run at the same time in one
// server); phase 2 clears and releases both, with the network's keys and the test's record. The synthetic entries touch no world.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'wireless_restart'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = { 1: 'ggTestWirelessRestartRequest1', 2: 'ggTestWirelessRestartRequest2' }
  // a requested phase that has not had its turn after this long fails with the queue it saw (before the bench's 180 s restart barrier)
  var TURN_WAIT_MS = 120000
  // the wireless tests share their band: they take turns in the order they were asked for (gg_test_wireless_*.js)
  var QUEUE = 'ggTestWirelessQueue'
  var JVM_TOKEN = 'ggTestWirelessRestartJvm'
  var RECORD = 'gg_test_wireless_restart'
  var TIMEOUT = { 1: 4000, 2: 1600 }

  var EARTH = 'minecraft:overworld'
  var MOON = 'gcyr:luna'
  var END = 'minecraft:the_end'
  var BAND = { x0: 13312, x1: 13375, z0: 0, z1: 63 }
  var BAND_Y = {}
  BAND_Y[EARTH] = [98, 112]
  BAND_Y[MOON] = [198, 214]
  var ROOF_Y = 112
  var EY = 100
  var MY = 200

  var TOWER = { x: 13316, z: 20 }
  var DYN = { x: 13364, z: 2 }
  var EBF = { x: 13316, z: 6 }
  var MB = { x: 13326, z: 4 }
  var MC = { x: 13332, z: 4 }
  var SH = { x: 13338, z: 4 }

  var LV_CELL = 'grindless:lv_capacitor_cell'
  var HATCH_LV = 'gtceu:lv_wireless_energy_hatch'
  var CHARGER = 'gtceu:lv_charger_4x'
  var BUFFER = 'gtceu:lv_battery_buffer_4x'
  var LITHIUM = 'gtceu:lv_lithium_battery'
  var SODIUM = 'gtceu:lv_sodium_battery'
  var BANK0 = 2000000
  var SYNTHETIC = 1200
  var SYNTH_Y = 100

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
    if (!ok && S !== null && S.failed) S.failed.push(name)
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

  // the turn queue: test names joined by commas in `global` (a plain string survives the scripts' reloads; a restart empties it)
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
      LevelResource: Java.loadClass('net.minecraft.world.level.storage.LevelResource'),
      CompoundTag: Java.loadClass('net.minecraft.nbt.CompoundTag'),
      FPF: Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      GTCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.GTCapabilityHelper')
    }
    return J
  }

  function W() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.settle !== 'function' || typeof w.blocksFromTag !== 'function') {
      throw new Error('global.grindless.wireless is incomplete (the server script did not load)')
    }
    return w
  }

  function bp(x, y, z) { return new (lazy().BlockPos)(x, y, z) }
  function levelOf(dim) { return dim === MOON ? S.moon : S.earth }
  function cmd(dim, text) { return S.server.runCommandSilent('execute in ' + dim + ' run ' + text) }
  function machineAt(dim, x, y, z) {
    var m = lazy().MetaMachine.getMachine(levelOf(dim), bp(x, y, z))
    return m === null || m === undefined ? null : m
  }
  function textOf(c) {
    if (c === null || c === undefined) return ''
    return typeof c === 'string' ? c : (c.getString ? String(c.getString()) : String(c))
  }
  function flowKey(dim, x, y, z, side) { return dim + '|' + x + '|' + y + '|' + z + '|' + (side || '') }
  function flow(k) {
    var f = W().flows[k]
    return f || { drained: 0, in: 0, filled: 0 }
  }

  function electric(stack) {
    var e = stack.isEmpty() ? null : lazy().GTCap.getElectricItem(stack)
    return e === undefined ? null : e
  }
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
  // the real charge of the items in a charger or a battery buffer
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
  function storedIn(m) { return m === null ? -1 : Number(m.energyContainer.getEnergyStored()) }

  // the list's fingerprint: its length and two polynomial hashes of its characters, exact in doubles (each step stays below 2^53). A
  // character's code is its place in CODES (printable ASCII, what the list's JSON is made of; anything else counts as 96): this Rhino's
  // String#charCodeAt returns a java.lang.Character (NativeString, Id_charCodeAt: `return c`), which arithmetic turns into NaN
  // (ScriptRuntime#toNumber), so the first version printed NaN-NaN for every list and its comparison matched anything
  var CODES = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
  function hash(s) {
    var a = 0
    var b = 0
    for (var i = 0; i < s.length; i++) {
      var c = CODES.indexOf(s.charAt(i)) + 1
      if (c < 1) c = 96
      a = (a * 131 + c) % 1000000007
      b = (b * 137 + c) % 998244353
    }
    return s.length + ':' + a + '-' + b
  }

  // a fingerprint is only evidence if it is well formed and this runtime's hash tells two lists apart; otherwise the check fails
  function wellFormed(h) {
    return /^[0-9]+:[0-9]+-[0-9]+$/.test(String(h)) && hash('[{"ck":"energy"}]') !== hash('[{"ck":"dynamo"}]')
  }

  function listJson() { return JSON.stringify(W().tracked(S.server)) }
  function synthetic(list) {
    return list.filter(function (e) { return e.k === 'cover' && e.d === END && e.y === SYNTH_Y && e.x >= BAND.x0 && e.x <= BAND.x1 && e.z >= BAND.z0 && e.z <= BAND.z1 })
  }

  // ---------------------------------------------------------------- the world

  function fillBand(dim, y0, y1, block) {
    var n = 0
    for (var z = BAND.z0; z <= BAND.z1; z += 16) {
      n += Number(cmd(dim, 'fill ' + BAND.x0 + ' ' + y0 + ' ' + z + ' ' + BAND.x1 + ' ' + y1 + ' ' + Math.min(z + 15, BAND.z1) + ' ' + block))
    }
    return n
  }

  function prepareWorld() {
    S.areaTouched = true
    ;[MOON, EARTH].forEach(function (dim) {
      var level = levelOf(dim)
      for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
        for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) level.getChunk(cx, cz)
      }
      var loaded = cmd(dim, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      var cleared = fillBand(dim, BAND_Y[dim][0], BAND_Y[dim][1], 'air')
      if (dim === EARTH) fillBand(dim, ROOF_Y, ROOF_Y, 'minecraft:smooth_stone')
      note('AREA_' + (dim === MOON ? 'moon' : 'earth'), dim + ' band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND_Y[dim][0] + '-' + BAND_Y[dim][1] + ' Z ' +
        BAND.z0 + '-' + BAND.z1 + ': generated, forceload add ' + loaded + ', cleared ' + cleared + (dim === EARTH ? ', roof at Y ' + ROOF_Y : ''))
    })
  }

  function cleanup() {
    ;[MOON, EARTH].forEach(function (dim) {
      var level = levelOf(dim)
      cmd(dim, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      var cleared = fillBand(dim, BAND_Y[dim][0], BAND_Y[dim][1], 'air')
      // the machines drop their items and covers when they go: removed after the fill
      var list = level.getEntitiesOfClass(lazy().ItemEntity, new (lazy().AABB)(BAND.x0, BAND_Y[dim][0], BAND.z0, BAND.x1 + 1, BAND_Y[dim][1] + 1, BAND.z1 + 1))
      for (var i = 0; i < list.size(); i++) list.get(i).discard()
      var released = cmd(dim, 'forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      note('CLEANUP_' + (dim === MOON ? 'moon' : 'earth'), 'cleared ' + cleared + ' blocks, ' + list.size() + ' item entities removed, forceload remove ' + released)
    })
    var w = W()
    var pd = S.server.persistentData
    pd.remove(w.blocksKey)
    pd.remove(w.storeKey)
    pd.remove(w.legacyKey)
    pd.remove(RECORD)
    w.dropCache()
  }

  function setblock(dim, x, y, z, block, failed) {
    if (Number(cmd(dim, 'setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')) >= 1) return
    var want = String(block).split('[')[0]
    if (want.indexOf(':') < 0) want = 'minecraft:' + want
    var have = String(levelOf(dim).getBlock(x, y, z).id)
    if (have !== want) failed.push(dim + ' ' + x + ',' + y + ',' + z + ' ' + block + ' (is ' + have + ')')
  }

  // the tower from lib/patterns.js's description, the controller facing north at (x, EY, z), the structure behind it, 4 LV cells
  function placeTower(failed) {
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
          if (sym.kind === 'oneOf') id = used < 4 ? LV_CELL : w.casing
          else if (sym.kind === 'frames') id = 'gtceu:' + sym.materials[0] + '_frame'
          else if (sym.kind === 'blocks') id = sym.blocks[0]
          if (sym.kind === 'oneOf' && used < 4) used++
          setblock(EARTH, TOWER.x - (ci - ctrl.ci), EY + (ri - ctrl.ri), TOWER.z - (si - ctrl.si), id, failed)
        }
      })
    })
    setblock(EARTH, TOWER.x, EY, TOWER.z, w.towerId + '[facing=north]', failed)
    return used
  }

  // GTM's EBF, controller at (x, MY, z) facing north (gg_test_wireless_energy.js): bottom layer input bus front left, output bus front
  // right, the two LV wireless energy hatches back middle and back left; cupronickel coils; the muffler on top in the middle
  function placeEbf(failed) {
    var cx = EBF.x
    var cz = EBF.z
    var casing = 'gtceu:heatproof_machine_casing'
    var coil = 'gtceu:cupronickel_coil_block'
    for (var dz = 0; dz <= 2; dz++) {
      for (var dx = -1; dx <= 1; dx++) {
        var x = cx + dx
        var z = cz + dz
        setblock(MOON, x, MY, z, casing, failed)
        setblock(MOON, x, MY + 3, z, casing, failed)
        if (dz === 1 && dx === 0) {
          setblock(MOON, x, MY + 1, z, 'air', failed)
          setblock(MOON, x, MY + 2, z, 'air', failed)
        } else {
          setblock(MOON, x, MY + 1, z, coil, failed)
          setblock(MOON, x, MY + 2, z, coil, failed)
        }
      }
    }
    setblock(MOON, cx - 1, MY, cz, 'gtceu:lv_input_bus[facing=north]', failed)
    setblock(MOON, cx + 1, MY, cz, 'gtceu:lv_output_bus[facing=north]', failed)
    setblock(MOON, cx, MY, cz + 2, HATCH_LV + '[facing=south]', failed)
    setblock(MOON, cx - 1, MY, cz + 2, HATCH_LV + '[facing=south]', failed)
    setblock(MOON, cx, MY + 3, cz + 1, 'gtceu:lv_muffler_hatch[facing=up]', failed)
    setblock(MOON, cx, MY, cz, 'gtceu:electric_blast_furnace[facing=north]', failed)
  }

  function formedOrForce(name, m, waited) {
    if (m === null) return 'missing'
    if (m.isFormed()) return 'formed'
    if (waited < 100) return 'waiting'
    if (m.checkPatternWithLock()) {
      m.setFlipped(m.getMultiblockState().isNeededFlip())
      m.onStructureFormed()
      note(name + '_forced', 'not formed by itself after ' + waited + ' ticks; a synchronous check passes (forming it)')
      return 'formed'
    }
    return waited > 300 ? 'failed: ' + m.getMultiblockState().error : 'waiting'
  }

  // the endpoints that really work, and their flow keys
  function endpoints() {
    return {
      dyn: flowKey(EARTH, DYN.x, EY, DYN.z, 'up'),
      mb: flowKey(MOON, MB.x, MY, MB.z, 'up'),
      mc: flowKey(MOON, MC.x, MY, MC.z, 'up'),
      sh: flowKey(MOON, SH.x, MY, SH.z, ''),
      h1: flowKey(MOON, EBF.x, MY, EBF.z + 2, ''),
      h2: flowKey(MOON, EBF.x - 1, MY, EBF.z + 2, '')
    }
  }

  // ---------------------------------------------------------------- phase 1

  function build() {
    var w = W()
    var L = lazy()
    var failed = []
    S.cells = placeTower(failed)
    setblock(EARTH, DYN.x, EY, DYN.z, BUFFER + '[facing=north]', failed)
    placeEbf(failed)
    setblock(MOON, MB.x, MY, MB.z, BUFFER + '[facing=north]', failed)
    setblock(MOON, MC.x, MY, MC.z, CHARGER + '[facing=north]', failed)
    setblock(MOON, SH.x, MY, SH.z, HATCH_LV + '[facing=north]', failed)
    if (failed.length) {
      check('PLACED', false, failed.slice(0, 8).join('; '))
      return false
    }
    var sodiumMax = Number(electric(Item.of(SODIUM)).getMaxCharge())
    var dyn = machineAt(EARTH, DYN.x, EY, DYN.z)
    var mb = machineAt(MOON, MB.x, MY, MB.z)
    for (var i = 0; i < 4; i++) {
      dyn.getBatteryInventory().setStackInSlot(i, battery(SODIUM, sodiumMax))
      mb.getBatteryInventory().setStackInSlot(i, battery(SODIUM, 0))
    }
    machineAt(MOON, MC.x, MY, MC.z).getChargerInventory().setStackInSlot(0, battery(LITHIUM, 10000))
    var bus = machineAt(MOON, EBF.x - 1, MY, EBF.z)
    bus.getInventory().setStackInSlot(0, Item.of('gtceu:steel_dust', 64))
    // registered as a player's placing and clicking would: the tower and the hatches tracked, the covers through the network's placing
    var tracked = [
      w.track(S.earth, bp(TOWER.x, EY, TOWER.z)),
      w.track(S.moon, bp(EBF.x, MY, EBF.z + 2)),
      w.track(S.moon, bp(EBF.x - 1, MY, EBF.z + 2)),
      w.track(S.moon, bp(SH.x, MY, SH.z))
    ]
    var up = L.Direction.UP
    var covers = [
      w.placeCover(S.earth, bp(DYN.x, EY, DYN.z), up, Item.of(w.coverItemId('dynamo', 1)), L.FPF.getMinecraft(S.earth)),
      w.placeCover(S.moon, bp(MB.x, MY, MB.z), up, Item.of(w.coverItemId('energy', 1)), L.FPF.getMinecraft(S.moon)),
      w.placeCover(S.moon, bp(MC.x, MY, MC.z), up, Item.of(w.coverItemId('energy', 1)), L.FPF.getMinecraft(S.moon))
    ]
    w.setStored(S.server, BANK0)
    S.baseline = flowsNow()
    var ok = S.cells === 4 && tracked.every(function (e) { return e !== null }) && covers.every(function (c) { return c.ok })
    check('PLACED', ok, 'a tower with ' + S.cells + ' LV cells; tracked ' + tracked.map(function (e) { return e ? e.k + ' ' + e.d + ' ' + e.x + ',' + e.y + ',' + e.z : 'null' }).join(' ; ') +
      '; covers (Overworld dynamo, Moon buffer, Moon charger): ' + covers.map(function (c) { return c.ok + ' (' + textOf(c.message) + ')' }).join(', ') + '; the store set to ' + BANK0 + ' EU')
    return ok
  }

  // the flows of the endpoints now (the network moves nothing before the tower has formed: build() takes the baseline)
  function flowsNow() {
    var k = endpoints()
    var o = {}
    Object.keys(k).forEach(function (n) { o[n] = JSON.parse(JSON.stringify(flow(k[n]))) })
    return o
  }

  function startEbf() {
    machineAt(MOON, EBF.x, MY, EBF.z).getRecipeLogic().updateTickSubscription()
  }

  function reportBefore() {
    var k = endpoints()
    var now = flowsNow()
    var d = {}
    Object.keys(k).forEach(function (n) {
      d[n] = { drained: now[n].drained - S.baseline[n].drained, filled: now[n].filled - S.baseline[n].filled }
    })
    var ebf = machineAt(MOON, EBF.x, MY, EBF.z)
    var faults = Object.keys(k).filter(function (n) { return W().faults[k[n]] })
    check('BEFORE', d.dyn.drained > 0 && d.mb.filled > 0 && d.mc.filled > 0 && d.sh.filled > 0 && d.h1.filled + d.h2.filled > 0 && faults.length === 0,
      'the network by itself from the tower\'s forming to 100 ticks later: the Overworld dynamo cover drained ' + d.dyn.drained + ' EU; the Moon buffer cover filled ' + d.mb.filled + ', the charger cover ' +
      d.mc.filled + ', the lone hatch ' + d.sh.filled + ', the EBF hatches ' + d.h1.filled + ' + ' + d.h2.filled + ' (EBF ' + ebf.getRecipeLogic().getStatus() +
      '); set aside: ' + (faults.length ? faults.join(', ') : 'none') + '; the store ' + W().stored(S.server) + ' EU')
  }

  function addSynthetic() {
    var w = W()
    var R = global.grindless.wirelessRegistry
    var add = []
    for (var i = 0; i < SYNTHETIC; i++) {
      add.push(R.canon({ k: 'cover', d: END, x: BAND.x0 + (i % 64), y: SYNTH_Y, z: Math.floor(i / 64), s: 'up', ck: i % 2 ? 'dynamo' : 'energy', t: 1 }))
    }
    var list = w.tracked(S.server).concat(add)
    S.server.persistentData.put(w.blocksKey, R.write(list))
    w.dropCache()
    var t0 = Date.now()
    var st = w.settle(S.server)
    S.settleMs = Date.now() - t0
    S.synthAddedAt = S.t
    note('SYNTHETIC_added', SYNTHETIC + ' cover entries in unloaded End chunks of the band (' + END + ' X ' + BAND.x0 + '-' + BAND.x1 + ', Y ' + SYNTH_Y + ', Z 0-' +
      Math.floor((SYNTHETIC - 1) / 64) + '): metadata only, no blocks, never loaded; the list now ' + w.tracked(S.server).length + ' entries; one settlement with them took ' +
      S.settleMs + ' ms (tracked ' + st.tracked + ', loaded ' + st.loaded + ', forgotten ' + st.forgotten + ')')
  }

  function reportSynthetic() {
    var list = W().tracked(S.server)
    var n = synthetic(list).length
    var unloaded = !S.server.getLevel(END).isLoaded(bp(BAND.x0, SYNTH_Y, 0))
    check('SYNTHETIC', n === SYNTHETIC && unloaded,
      'after ' + (S.t - S.synthAddedAt) + ' ticks of settlements every ' + W().settleTicks + ' ticks: ' + n + ' of ' + SYNTHETIC + ' synthetic entries kept (their chunks unloaded: ' +
      unloaded + '); the list ' + list.length + ' entries')
  }

  function snapshot() {
    var w = W()
    var pd = S.server.persistentData
    w.paused = true
    var sh = machineAt(MOON, SH.x, MY, SH.z)
    S.hatchCap = Number(sh.energyContainer.getEnergyCapacity())
    // a consumer drew the lone hatch: after the restart only the network can fill it again
    sh.energyContainer.setEnergyStored(0)
    var json = listJson()
    S.snap = {
      json: json,
      hash: hash(json),
      count: w.tracked(S.server).length,
      bank: w.stored(S.server),
      dyn: items(machineAt(EARTH, DYN.x, EY, DYN.z)),
      mb: items(machineAt(MOON, MB.x, MY, MB.z)),
      mc: items(machineAt(MOON, MC.x, MY, MC.z)),
      time: Number(S.earth.getTime())
    }
    var rec = new (lazy().CompoundTag)()
    rec.putBoolean('ok', true)
    rec.putString('hash', S.snap.hash)
    rec.putInt('count', S.snap.count)
    rec.putInt('synthetic', SYNTHETIC)
    rec.putInt('jsonBytes', json.length)
    rec.putLong('bank', S.snap.bank)
    rec.putLong('dyn', S.snap.dyn)
    rec.putLong('mb', S.snap.mb)
    rec.putLong('mc', S.snap.mc)
    rec.putLong('hatchCap', S.hatchCap)
    rec.putLong('time', S.snap.time)
    rec.putLong('savedAt', Date.now())
    pd.put(RECORD, rec)
    global[JVM_TOKEN] = 'phase 1 at ' + Date.now()
    S.saveResult = S.server.runCommandSilent('save-all flush')
    S.savedAt = S.t
  }

  function reportSaved() {
    var w = W()
    var tag = NBTIO.read(S.server.getWorldPath(new (lazy().LevelResource)('kubejs_persistent_data.nbt')))
    var fileJson = tag ? JSON.stringify(w.blocksFromTag(tag)) : ''
    var type = tag ? Number(tag.getTagType(w.blocksKey)) : -1
    var rec = tag && tag.contains(RECORD) ? tag.getCompound(RECORD) : null
    var fileBank = tag ? Number(tag.getLong(w.storeKey)) : -1
    var same = fileJson === S.snap.json
    var recOk = rec !== null && String(rec.getString('hash')) === S.snap.hash && Number(rec.getLong('bank')) === S.snap.bank
    var printOk = wellFormed(S.snap.hash)
    check('SAVED', same && type === 9 && fileBank === S.snap.bank && recOk && printOk && S.snap.json.length > 65535,
      'save-all flush -> ' + S.saveResult + '; kubejs_persistent_data.nbt read back after ' + (S.t - S.savedAt) + ' ticks: ' + w.blocksKey + ' is NBT type ' + type +
      ' (9 = list) of ' + (tag ? Number(tag.getList(w.blocksKey, 10).size()) : -1) + ' compounds, the same list as in memory: ' + same + ' (' + S.snap.count + ' entries, ' +
      SYNTHETIC + ' synthetic); the store ' + fileBank + ' EU (in memory ' + S.snap.bank + '); the record written: ' + recOk + ', the list\'s fingerprint ' + S.snap.hash +
      ' (well formed: ' + printOk + '). The old format would have been one ' + S.snap.json.length + '-byte string (NbtIo\'s writeUTF stops at 65,535)')
  }

  // ---------------------------------------------------------------- phase 2

  function readRecord() {
    var pd = S.server.persistentData
    if (!pd.contains(RECORD)) return null
    var r = pd.getCompound(RECORD)
    return {
      ok: r.getBoolean('ok') === true,
      reason: String(r.getString('reason')),
      hash: String(r.getString('hash')),
      count: Number(r.getInt('count')),
      synthetic: Number(r.getInt('synthetic')),
      jsonBytes: Number(r.getInt('jsonBytes')),
      bank: Number(r.getLong('bank')),
      dyn: Number(r.getLong('dyn')),
      mb: Number(r.getLong('mb')),
      mc: Number(r.getLong('mc')),
      hatchCap: Number(r.getLong('hatchCap')),
      time: Number(r.getLong('time')),
      savedAt: Number(r.getLong('savedAt'))
    }
  }

  function reportRestored() {
    var w = W()
    var pd = S.server.persistentData
    var rec = S.rec
    var json = listJson()
    var list = w.tracked(S.server)
    var type = Number(pd.getTagType(w.blocksKey))
    var size = type === 9 ? Number(pd.getList(w.blocksKey, 10).size()) : -1
    var bank = w.stored(S.server)
    var balance = rec.bank + w.totals.in - w.totals.out
    var fresh = global[JVM_TOKEN] === undefined
    var time = Number(S.earth.getTime())
    var synth = synthetic(list).length
    var print = hash(json)
    var printOk = wellFormed(print) && wellFormed(rec.hash)
    check('RESTORED', fresh && time > rec.time && printOk && print === rec.hash && json.length === rec.jsonBytes && list.length === rec.count && type === 9 && size === rec.count &&
      synth === rec.synthetic && !pd.contains(w.legacyKey) && bank === balance && w.totals.settlements > 0 && w.lastReadout === undefined,
      'another JVM: ' + fresh + ' (phase 1\'s token in global is gone); the same world: its game time ' + rec.time + ' -> ' + time + ', ' + Math.round((Date.now() - rec.savedAt) / 1000) +
      ' s after the snapshot; ' + w.blocksKey + ' is NBT type ' + type + ' of ' + size + ' compounds: ' + list.length + ' entries, fingerprint ' + print + ' (saved ' + rec.hash +
      ', both well formed: ' + printOk + '), ' +
      json.length + ' characters as JSON (saved ' + rec.jsonBytes + '), ' + synth + ' synthetic entries (no placing, clicking or tracking could have made those again); ' +
      'a backup key: ' + pd.contains(w.legacyKey) + '; the store ' + bank + ' EU = the saved ' + rec.bank + ' + ' + w.totals.in + ' in - ' + w.totals.out + ' out since this JVM started (' +
      w.totals.settlements + ' settlements by itself): ' + (bank === balance) + '; a readout this JVM: ' + (w.lastReadout !== undefined))
  }

  function reportAutomatic() {
    var w = W()
    var rec = S.rec
    var k = endpoints()
    var f = {}
    Object.keys(k).forEach(function (n) { f[n] = flow(k[n]) })
    var dynNow = items(machineAt(EARTH, DYN.x, EY, DYN.z))
    var mbNow = items(machineAt(MOON, MB.x, MY, MB.z))
    var mcNow = items(machineAt(MOON, MC.x, MY, MC.z))
    var shNow = storedIn(machineAt(MOON, SH.x, MY, SH.z))
    var bank = w.stored(S.server)
    var balance = rec.bank + w.totals.in - w.totals.out
    var faults = Object.keys(k).filter(function (n) { return w.faults[k[n]] })
    // still moving now: what the observed ticks added
    var o = S.obs0
    var grew = { dyn: f.dyn.drained - o.dyn.drained, mb: f.mb.filled - o.mb.filled, mc: f.mc.filled - o.mc.filled, ebf: f.h1.filled + f.h2.filled - o.h1.filled - o.h2.filled }
    var ok = f.dyn.drained > 0 && rec.dyn - dynNow === f.dyn.drained && f.dyn.in * 20 === f.dyn.drained * 19 &&
      f.mb.filled > 0 && mbNow - rec.mb === f.mb.filled && f.mc.filled > 0 && mcNow - rec.mc === f.mc.filled &&
      shNow === rec.hatchCap && f.sh.filled === rec.hatchCap && f.h1.filled > 0 && f.h2.filled > 0 && S.ebfWorking > 0 && faults.length === 0 && bank === balance &&
      grew.dyn > 0 && grew.mb > 0 && grew.mc > 0 && grew.ebf > 0
    check('AUTOMATIC', ok,
      'since this JVM started, nothing placed or clicked: the Overworld dynamo cover drained ' + f.dyn.drained + ' EU and its batteries fell ' + rec.dyn + ' -> ' + dynNow + ' (' +
      (rec.dyn - dynNow) + '), ' + f.dyn.in + ' reached the store (19/20); on the Moon the buffer\'s cover filled ' + f.mb.filled + ' and its batteries rose ' + (mbNow - rec.mb) +
      ', the charger\'s cover filled ' + f.mc.filled + ' and its battery rose ' + rec.mc + ' -> ' + mcNow + ' (' + (mcNow - rec.mc) + '), the lone hatch (emptied at the snapshot) holds ' +
      shNow + ' of ' + rec.hatchCap + ' EU and was filled ' + f.sh.filled + ', the EBF hatches were filled ' + f.h1.filled + ' + ' + f.h2.filled + ' and the EBF worked ' + S.ebfWorking +
      ' of ' + S.observed + ' observed ticks; in those ticks the dynamo cover gave ' + grew.dyn + ', the buffer took ' + grew.mb + ', the charger ' + grew.mc + ', the EBF hatches ' + grew.ebf +
      '; set aside: ' + (faults.length ? faults.map(function (n) { return n + ' ' + w.faults[k[n]] }).join(', ') : 'none') + '; the store ' + bank +
      ' EU = ' + rec.bank + ' + ' + w.totals.in + ' - ' + w.totals.out + ': ' + (bank === balance) + ' (' + w.totals.settlements + ' settlements)')
  }

  // ---------------------------------------------------------------- driver

  // phase 1 ends here, the world and the network left for phase 2. With a snapshot the record stands (whatever else failed is already
  // reported, and phase 2 still checks what came back) and the network stays paused until the stop; without one, the record says why
  // and phase 2 only cleans up.
  function endPhase1(reason) {
    if (S.finished) return
    S.finished = true
    if (!S.snap) {
      try {
        var rec = new (lazy().CompoundTag)()
        rec.putBoolean('ok', false)
        rec.putString('reason', String(reason || 'no snapshot was taken'))
        S.server.persistentData.put(RECORD, rec)
        W().paused = false
      } catch (e) {
        check('record', false, 'exception: ' + e)
      }
    }
    leaveQueue(SCOPE + '_1')
    console.info(TAG + SCOPE + '|PHASE1|DONE')
  }

  function endPhase2() {
    if (S.finished) return
    S.finished = true
    try {
      W().paused = false
    } catch (e0) { /* nothing */ }
    try {
      cleanup()
    } catch (e) {
      check('cleanup', false, 'exception: ' + e)
    }
    leaveQueue(SCOPE + '_2')
    console.info(TAG + SCOPE + '|DONE')
  }

  function phase(next) {
    S.phase = next
    S.phaseAt = S.t
  }

  function step1() {
    var since = S.t - S.phaseAt
    if (S.phase === 'forming') {
      var t = formedOrForce('TOWER', machineAt(EARTH, TOWER.x, EY, TOWER.z), since)
      var e = formedOrForce('EBF', machineAt(MOON, EBF.x, MY, EBF.z), since)
      if (t === 'formed' && e === 'formed') {
        note('FORMED', 'the tower and the Moon EBF formed after ' + since + ' ticks')
        startEbf()
        phase('before')
      } else if (t.indexOf('failed') === 0 || e.indexOf('failed') === 0 || since > 400) {
        check('FORMED', false, 'tower ' + t + ', EBF ' + e + ' after ' + since + ' ticks')
        phase('end')
      }
      return
    }
    if (S.phase === 'before') {
      if (since >= 100) {
        guarded('BEFORE', reportBefore)
        guarded('SYNTHETIC', addSynthetic)
        phase('synthetic')
      }
      return
    }
    if (S.phase === 'synthetic') {
      if (since >= 40) {
        guarded('SYNTHETIC', reportSynthetic)
        guarded('SNAPSHOT', snapshot)
        phase('saved')
      }
      return
    }
    if (S.phase === 'saved') {
      if (since >= 60) {
        guarded('SAVED', reportSaved)
        phase('end')
      }
    }
  }

  function step2() {
    var since = S.t - S.phaseAt
    if (S.phase === 'observe') {
      if (since >= 100) {
        guarded('AUTOMATIC', reportAutomatic)
        phase('end')
      }
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    S.t = S.server.getTickCount() - S.tick0
    try {
      if (S.mode === 2 && S.phase === 'observe') {
        S.observed++
        var ebf = machineAt(MOON, EBF.x, MY, EBF.z)
        if (ebf !== null && String(ebf.getRecipeLogic().getStatus()) === 'WORKING') S.ebfWorking++
      }
      if (S.t % 5 === 0 && S.phase !== 'end') {
        if (S.mode === 1) step1()
        else step2()
      }
    } catch (e) {
      check('step', false, 'exception in ' + S.phase + ': ' + e)
      phase('end')
    }
    if (S.phase === 'end') {
      if (S.mode === 1) endPhase1(S.failed.length ? 'failed: ' + S.failed.join(', ') : '')
      else endPhase2()
      return
    }
    if (S.t > TIMEOUT[S.mode]) {
      check('timeout', false, 'phase ' + S.mode + ' still in ' + S.phase + ' after ' + S.t + ' ticks')
      if (S.mode === 1) endPhase1('timeout in ' + S.phase)
      else endPhase2()
    }
  }

  function start1() {
    var w = W()
    w.paused = false
    S.server.persistentData.remove(w.blocksKey)
    S.server.persistentData.remove(w.storeKey)
    S.server.persistentData.remove(RECORD)
    w.dropCache()
    prepareWorld()
    var built = false
    try {
      built = build()
    } catch (e) {
      check('PLACED', false, 'exception: ' + e)
    }
    phase(built ? 'forming' : 'end')
  }

  function newState(server, mode) {
    return { server: server, earth: server.overworld(), moon: server.getLevel(MOON), tick0: server.getTickCount(), t: 0, mode: mode, phase: 'start', phaseAt: 0,
      finished: false, areaTouched: false, failed: [], observed: 0, ebfWorking: 0 }
  }

  function run(server, mode) {
    S = newState(server, mode)
    if (S.moon === null || S.moon === undefined) {
      check('moon_level', false, MOON + ' is not loaded')
      if (mode === 1) endPhase1(MOON + ' is not loaded')
      else {
        S.finished = true
        leaveQueue(SCOPE + '_2')
        console.info(TAG + SCOPE + '|DONE')
      }
      return
    }
    if (mode === 1) {
      start1()
      return
    }
    S.rec = readRecord()
    if (S.rec === null || !S.rec.ok) {
      check('RESTORED', false, S.rec === null ? 'no record of phase 1 in persistent data (phase 1 did not run, or the persistent data did not survive the restart)' :
        'phase 1 did not finish: ' + S.rec.reason)
      endPhase2()
      return
    }
    guarded('RESTORED', reportRestored)
    S.obs0 = flowsNow()
    phase('observe')
  }

  // The pack's Additional Placements mod reloads the datapacks (and these scripts) a couple of seconds after the server is up: the
  // command only leaves a request in `global` and the tick handler starts the phase once these scripts have been loaded for QUIET_MS
  // and it is this phase's turn on the band. One boolean per phase: `global` is a Java HashMap (KubeJS's BuiltinKubeJSPlugin.GLOBAL),
  // so a number stored there comes back as a wrapped java.lang.Double, and Rhino's interpreter takes a wrapped value and a number
  // literal as unequal (Interpreter#doShallowEquals): the first version stored the phase as a number and never saw its request.
  function requestedMode() {
    if (global[REQUEST[1]] === true) return 1
    if (global[REQUEST[2]] === true) return 2
    return 0
  }

  // when this script instance first saw the pending request (a reload of the scripts starts the wait again)
  var waitingSince = 0

  // a request that never had its turn: a FAIL with the queue, the phase's end marker (phase 1 also leaves a record saying why, which
  // phase 2 reports), and nothing left waiting
  function gaveUp(server, mode, name) {
    var why = 'phase ' + mode + ' was asked for and had no turn on the band in ' + (TURN_WAIT_MS / 1000) + ' s: the queue is [' + queueList().join(', ') + ']'
    global[REQUEST[mode]] = false
    waitingSince = 0
    leaveQueue(name)
    S = newState(server, mode)
    check('TURN', false, why)
    if (mode === 1) endPhase1(why)
    else endPhase2()
  }

  function startIfRequested(server) {
    if (S !== null && !S.finished) return
    var mode = requestedMode()
    if (mode === 0) {
      waitingSince = 0
      return
    }
    var name = SCOPE + '_' + mode
    if (waitingSince === 0) waitingSince = Date.now()
    if (Date.now() - LOADED_AT < QUIET_MS || !myTurn(name)) {
      if (Date.now() - waitingSince > TURN_WAIT_MS) gaveUp(server, mode, name)
      return
    }
    global[REQUEST[mode]] = false
    waitingSince = 0
    try {
      run(server, mode)
    } catch (e) {
      check('run', false, 'exception: ' + e)
      if (mode === 1) endPhase1('exception: ' + e)
      else endPhase2()
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  function request(mode) {
    if (S !== null && !S.finished) {
      emit('run', 'NOTE', 'a phase is still in progress')
      return 0
    }
    global[REQUEST[mode]] = true
    waitingSince = Date.now()
    joinQueue(SCOPE + '_' + mode)
    emit('requested', 'NOTE', 'phase ' + mode + ' starts once these scripts have been loaded for ' + (QUIET_MS / 1000) + ' s and the wireless tests asked for before it are done (' +
      queueList().join(', ') + '); it fails after ' + (TURN_WAIT_MS / 1000) + ' s without its turn')
    return 1
  }

  ServerEvents.customCommand('gg_test_wireless_restart_1', function (event) { return request(1) })
  ServerEvents.customCommand('gg_test_wireless_restart_2', function (event) { return request(2) })
})()
