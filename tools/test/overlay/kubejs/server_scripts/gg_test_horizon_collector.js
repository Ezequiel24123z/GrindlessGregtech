// priority: -2474
// Gregtech Grindless - QR-F0 T1: the Horizon Collector runs a multi-output row and pushes every stack (TEST-ONLY overlay).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_horizon_collector' -WaitForLog 'GGTEST\|horizon_collector\|DONE@@300'
//
// Markers GGTEST|horizon_collector|<check>|PASS|FAIL|NOTE|<detail>
//   SHAPE      the machine has 4 output slots (the recipe type's setMaxIOSize)
//   RUN_<row>  shard + circuit -> every stack of the row in the output slots within 400 ticks; the shard is kept
// One machine at (36000, 101, 2), its energy filled every tick. var + function everywhere (Rhino).
(function () {
  var TAG = 'GGTEST|horizon_collector|'
  var POS = { x: 36000, y: 101, z: 2 }
  var CASES = [
    { circuit: 2, id: 'minecraft:cobblestone', n: 256 },
    { circuit: 1, id: 'minecraft:oak_log', n: 128 },
    { circuit: 10, id: 'minecraft:flint', n: 64 }
  ]
  var S = null

  function emit(check, status, detail) {
    console.info(TAG + check + '|' + status + (detail ? '|' + String(detail).replace(/[\r\n|]+/g, ' ').substring(0, 500) : ''))
  }
  function check(name, ok, detail) { emit(name, ok ? 'PASS' : 'FAIL', detail) }

  function machine() {
    var cls = Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
    return cls.getMachine(S.level, new BlockPos(POS.x, POS.y, POS.z))
  }

  function clear(h) {
    for (var i = 0; i < h.getSlots(); i++) h.setStackInSlot(i, Item.empty)
  }

  function out(mm, id) {
    var counts = {}
    var slots = 0
    for (var i = 0; i < mm.exportItems.getSlots(); i++) {
      var st = mm.exportItems.getStackInSlot(i)
      if (st.isEmpty()) continue
      counts[String(st.getId())] = (counts[String(st.getId())] || 0) + st.getCount()
      if (String(st.getId()) === id) slots++
    }
    return { counts: counts, slots: slots }
  }

  function finish() {
    if (S.finished) return
    S.finished = true
    emit('DONE', 'NOTE')
  }

  function begin(c) {
    var mm = machine()
    clear(mm.importItems)
    clear(mm.exportItems)
    clear(mm.getCircuitInventory())
    var circuitClass = Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour')
    mm.importItems.insertItem(0, Item.of('grindless:horizon_shard', 1), false)
    mm.getCircuitInventory().setStackInSlot(0, circuitClass.stack(c.circuit))
    S.t0 = S.server.getTickCount()
  }

  function advance() {
    var c = CASES[S.i]
    var mm = machine()
    var o = out(mm, c.id)
    var name = 'RUN_' + c.id.split(':')[1]
    var got = o.counts[c.id] || 0
    var elapsed = S.server.getTickCount() - S.t0
    if (got >= c.n) {
      var shard = mm.importItems.getStackInSlot(0)
      check(name, got === c.n && o.slots === Math.ceil(c.n / 64) && String(shard.getId()) === 'grindless:horizon_shard',
        got + 'x in ' + o.slots + ' slots after ' + elapsed + ' ticks, shard kept=' + String(shard.getId()))
      next()
    } else if (elapsed > 400) {
      var rl = mm.getRecipeLogic()
      check(name, false, 'got ' + got + '/' + c.n + ' after ' + elapsed + ' ticks, status=' + rl.getStatus() + ' progress=' + rl.getProgress() + '/' + rl.getDuration())
      next()
    }
  }

  function next() {
    S.i++
    if (S.i >= CASES.length) finish()
    else begin(CASES[S.i])
  }

  function onTick() {
    if (S === null || S.finished) return
    try {
      var mm = machine()
      if (mm === null || mm === undefined) {
        if (S.server.getTickCount() - S.tick0 > 100) { check('SETUP', false, 'no machine at the position'); finish() }
        return
      }
      mm.energyContainer.setEnergyStored(mm.energyContainer.getEnergyCapacity())
      if (S.i < 0) {
        if (S.server.getTickCount() - S.tick0 < 20) return
        var slots = mm.exportItems.getSlots()
        check('SHAPE', slots === 4, 'output slots=' + slots)
        S.i = 0
        begin(CASES[0])
        return
      }
      advance()
    } catch (e) {
      check('STEP', false, 'exception: ' + e)
      finish()
    }
  }

  ServerEvents.tick(function () { onTick() })

  ServerEvents.customCommand('gg_test_horizon_collector', function (event) {
    var server = event.getLevel().getServer()
    S = { server: server, level: server.overworld(), i: -1, t0: 0, tick0: server.getTickCount(), finished: false }
    S.level.getChunk(2250, 0)
    server.runCommandSilent('forceload add 36000 0 36015 15')
    server.runCommandSilent('fill 36000 98 0 36015 112 15 air')
    var res = server.runCommandSilent('setblock ' + POS.x + ' ' + POS.y + ' ' + POS.z + ' gtceu:lv_horizon_collector[facing=north] replace')
    if (res < 1) res = server.runCommandSilent('setblock ' + POS.x + ' ' + POS.y + ' ' + POS.z + ' gtceu:lv_horizon_collector replace')
    check('PLACED', res >= 1, 'setblock=' + res)
    return 1
  })
})()
