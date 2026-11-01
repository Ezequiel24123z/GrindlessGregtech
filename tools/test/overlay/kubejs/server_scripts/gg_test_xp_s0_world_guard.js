// TEST ONLY, XP-S0b spike S0-7 (docs/eras/maxplus.md S0 table). Command: kubejs custom_command gg_test_xp_s0_world_guard
// Band ONLY: X 44032-44095, Z 0-63, gg_test:s0_flat Y 0-12 (zones.json row xp_s0_world_guard). Never shipped.
//   Question: does a BlockEvents.placed cancel stop every creative block outside creative mode, and do AE2 drives refuse the creative energy cell?
//   The fixture installs the guard maxplus.md proposes (cancel unless the placer is a creative-mode player) on the six blocks and then tries every
//   placement path of the pack with a Forge FakePlayer and a dispenser. Outcomes are NOTE lines (the answers); PASS/FAIL only check the fixture itself.
//     hand_survival   ItemStack#useOn in survival: the path of a player's right click (Forge's onPlaceItemIntoWorld fires the event)
//     hand_creative   the same in creative: must still place (control for the guard)
//     plane_path      Item#useOn called directly, exactly as AE2's ItemPlacementStrategy does for a formation plane (source: ItemPlacementStrategy#placeInWorld)
//     dispenser       a powered vanilla dispenser holding the item
//     drive           AE2 drive and ExtendedAE ex_drive slots offered the creative cells
(function () {
  var NAME = 'xp_s0_world_guard'
  var CMD = 'gg_test_xp_s0_world_guard'
  var DIM = 'gg_test:s0_flat'
  var QUEUE = 'ggXpS0Queue'
  var X0 = 44032
  var X1 = 44095
  var Y0 = 0
  var Y1 = 12
  var LOADED = Date.now()
  var S = null
  var C = null
  var CONTROL = 'minecraft:gold_block'
  var GUARDED = ['gtceu:creative_energy', 'gtceu:creative_chest', 'gtceu:creative_tank', 'gtceu:creative_computation_provider',
    'gtceu:creative_data_access_hatch', 'ae2:creative_energy_cell']
  var CELLS = ['ae2:creative_energy_cell', 'ae2:creative_item_cell', 'ae2:creative_fluid_cell', 'appflux:fe_creative_cell', 'ae2:item_storage_cell_1k']
  var DRIVES = ['ae2:drive', 'expatternprovider:ex_drive']

  function classes() {
    if (C !== null) return C
    C = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      Vec3: Java.loadClass('net.minecraft.world.phys.Vec3'),
      Direction: Java.loadClass('net.minecraft.core.Direction'),
      BHR: Java.loadClass('net.minecraft.world.phys.BlockHitResult'),
      UseOnContext: Java.loadClass('net.minecraft.world.item.context.UseOnContext'),
      Hand: Java.loadClass('net.minecraft.world.InteractionHand'),
      GameType: Java.loadClass('net.minecraft.world.level.GameType'),
      FPF: Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory')
    }
    return C
  }
  function errText(e) {
    var s = ''
    try { s = String(e.message || '') } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 4).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
  function cmd(text) { return S.server.runCommandSilent('execute in ' + DIM + ' run ' + text) }
  function bp(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return cmd('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function blockId(x, y, z) { return String(S.level.getBlock(x, y, z).id) }
  function short(id) { return String(id).replace(/^[a-z0-9_]+:/, '') }

  // the guard maxplus.md proposes: cancel unless the placer is a creative-mode player
  function onPlaced(event) {
    if (S === null || S.finished) return
    var id = String(event.block.id)
    var who = 'none'
    var creative = false
    try {
      var ent = event.entity
      if (ent !== null && ent !== undefined) {
        who = String(ent.type)
        creative = !!(ent.isPlayer() && ent.isCreative())
      }
    } catch (e) { who = 'unreadable' }
    S.events.push({ id: id, who: who, creative: creative })
    if (id !== CONTROL && !creative) event.cancel()
  }
  GUARDED.concat([CONTROL]).forEach(function (id) { BlockEvents.placed(id, onPlaced) })

  function setMode(fp, creative) {
    var gt = classes().GameType
    var mode = creative ? gt.CREATIVE : gt.SURVIVAL
    var gm = fp.gameMode
    if (gm === undefined || gm === null || typeof gm.changeGameModeForPlayer !== 'function') gm = fp.f_8941_
    gm.changeGameModeForPlayer(mode)
    return !!fp.isCreative() === creative
  }

  function hand(path, id, i, creative, direct) {
    var j = classes()
    var x = X0 + 4 + i * 3
    var z = path === 'hand_survival' ? 8 : path === 'hand_creative' ? 12 : 16
    var fp = S.fp
    if (!setMode(fp, creative)) check(path + '.gamemode', false, 'could not switch the fake player to ' + (creative ? 'creative' : 'survival'))
    fp.setPositionAndRotation(x + 0.5, 0, z + 2.5, 180, 0)
    fp.setItemInHand(j.Hand.MAIN_HAND, Item.of(id))
    var pos = bp(x, -1, z)
    var hit = new j.BHR(new j.Vec3(x + 0.5, 0, z + 0.5), j.Direction.UP, pos, false)
    var ctx = new j.UseOnContext(fp, j.Hand.MAIN_HAND, hit)
    var before = S.events.length
    var res = direct ? fp.getMainHandItem().getItem().useOn(ctx) : fp.getMainHandItem().useOn(ctx)
    var placed = blockId(x, 0, z)
    var evs = S.events.slice(before).map(function (e) { return e.who + '/' + (e.creative ? 'creative' : 'not-creative') })
    var ok = placed === id
    S.matrix[path] = S.matrix[path] || {}
    S.matrix[path][id] = ok
    note(path + '.' + short(id), 'block ' + placed + ' after useOn -> ' + res + '; placed ' + ok + '; BlockEvents.placed fired ' + evs.length + ' time(s) [' + evs.join(',') + ']')
    fp.setItemInHand(j.Hand.MAIN_HAND, Item.empty)
    put(x, 0, z, 'minecraft:air')
    return { placed: ok, fired: evs.length }
  }

  function dispenseSet() {
    GUARDED.forEach(function (id, i) {
      var x = X0 + 4 + i * 3
      put(x, 0, 24, 'minecraft:dispenser[facing=east]{Items:[{Slot:0b,id:"' + id + '",Count:1b}]}')
      S.beforeDisp = S.events.length
    })
    GUARDED.forEach(function (id, i) { put(X0 + 4 + i * 3, 1, 24, 'minecraft:redstone_block') })
  }
  function dispenseRead() {
    GUARDED.forEach(function (id, i) {
      var x = X0 + 4 + i * 3
      var front = blockId(x + 1, 0, 24)
      var drop = cmd('execute if entity @e[type=item,x=' + (x + 1) + ',y=0,z=24,distance=..3]')
      var held = cmd('execute if data block ' + x + ' 0 24 Items[0]')
      note('dispenser.' + short(id), 'front block ' + front + '; item entity near the front ' + (drop > 0) + '; item still in the dispenser ' + (held > 0) +
        '; BlockEvents.placed events since the dispenser was set ' + (S.events.length - S.beforeDisp))
      S.matrix.dispenser = S.matrix.dispenser || {}
      S.matrix.dispenser[id] = front === id
    })
  }

  function drive(blockId2, z) {
    var x = X0 + 4
    put(x, 0, z, blockId2)
    var be = S.level.getBlockEntity(bp(x, 0, z))
    if (be === null || be === undefined) { note('drive.' + short(blockId2), 'inconclusive: no block entity at the drive'); return }
    var inv = be.getInternalInventory()
    var out = []
    CELLS.forEach(function (id, slot) {
      var valid = String(inv.isItemValid(slot, Item.of(id)))
      var rem = inv.insertItem(slot, Item.of(id), false)
      var held = !inv.getStackInSlot(slot).isEmpty()
      out.push(short(id) + ': valid ' + valid + ', held ' + held + (rem.isEmpty() ? '' : ' (remainder returned)'))
      S.matrix.drive = S.matrix.drive || {}
      S.matrix.drive[blockId2 + '|' + id] = held
    })
    note('drive.' + short(blockId2), 'slots of ' + blockId2 + ' ' + inv.size() + '; ' + out.join('; '))
  }

  function buildCases() {
    var q = []
    q.push({ run: function () {
      var r = hand('hand_creative', CONTROL, 0, true, false)
      check('control_event', r.fired >= 1 && r.placed, 'a creative fake player placed ' + CONTROL + ': BlockEvents.placed fired ' + r.fired + ' time(s), placed ' + r.placed)
    } })
    ;[['hand_survival', false, false], ['hand_creative', true, false], ['plane_path', false, true]].forEach(function (p) {
      GUARDED.forEach(function (id, i) { q.push({ run: function () { hand(p[0], id, i, p[1], p[2]) } }) })
    })
    q.push({ run: dispenseSet, wait: 40 })
    q.push({ run: dispenseRead })
    DRIVES.forEach(function (d, k) { q.push({ run: function () { drive(d, 36 + k * 4) } }) })
    q.push({ run: summary })
    return q
  }

  function summary() {
    var m = S.matrix
    var leaks = []
    ;['hand_survival', 'plane_path', 'dispenser'].forEach(function (p) {
      var ids = GUARDED.filter(function (id) { return m[p] && m[p][id] === true })
      leaks.push(p + ' ' + ids.length + '/' + GUARDED.length + (ids.length ? ' (' + ids.map(short).join(',') + ')' : ''))
    })
    var ok = GUARDED.filter(function (id) { return m.hand_creative && m.hand_creative[id] === true }).length
    note('summary', 'creative blocks placed outside creative mode, per path: ' + leaks.join('; ') + '; creative-mode hand placement still works for ' + ok + '/' + GUARDED.length)
    var refused = DRIVES.map(function (d) { return d + ' holds the creative energy cell ' + (m.drive && m.drive[d + '|ae2:creative_energy_cell'] === true) })
    note('summary_drive', refused.join('; '))
  }

  function clear() {
    cmd('fill ' + X0 + ' 0 0 ' + X1 + ' 3 63 minecraft:air')
    cmd('kill @e[type=item,x=' + X0 + ',y=0,z=0,dx=64,dy=4,dz=64]')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { clear() } catch (e) { }
    cmd('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    var q = global[QUEUE]
    if (q && q[0] === NAME) q.shift()
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, events: [], matrix: {}, cases: null, wait: 0, loadStart: 0 }
    S.level = server.getLevel(DIM)
    if (S.level === null || S.level === undefined) { check('dimension', false, DIM + ' is not loaded'); finish(); return }
    cmd('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    S.fp = classes().FPF.getMinecraft(S.level)
    S.fp.getInventory().clearContent()
    S.fp.setShiftKeyDown(false)
  }
  function ready() {
    for (var cx = X0 >> 4; cx <= X1 >> 4; cx++) for (var cz = 0; cz <= 3; cz++) if (!S.level.hasChunk(cx, cz)) return false
    return true
  }

  ServerEvents.customCommand(CMD, function () {
    if (!global[QUEUE]) global[QUEUE] = []
    if (global[QUEUE].indexOf(NAME) >= 0) return 0
    global[QUEUE].push(NAME)
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      var q = global[QUEUE]
      if (S === null && q && q[0] === NAME && Date.now() - LOADED >= 10000) begin(event.server)
      if (S === null || S.finished) return
      S.tick++
      if (S.cases === null) {
        if (ready()) { S.cases = buildCases(); S.wait = S.tick + 5 }
        else if (S.tick > 600) { check('chunks', false, 'band chunks not loaded in 600 ticks'); finish() }
        return
      }
      if (S.tick < S.wait) return
      var c = S.cases.shift()
      if (!c) { finish(); return }
      try { c.run() } catch (e) { check('exception', false, errText(e)); finish(); return }
      S.wait = S.tick + (c.wait || 2)
      if (S.tick > 3000) { check('deadline', false, '3000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false, events: [], matrix: {} }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
