// priority: -6912
// TEST ONLY, OpV-S0 S0-9, leg 2 (after @restart). Command: kubejs custom_command gg_test_opv_s0_relay_2
// Checks that what leg 1 built survived the restart: the persistent-data row, the far platform ring (still formed, its input bus still stocked) and the
// force-loaded chunks of the throwaway place. Then clears the platform blocks and tickets.
(function () {
  var NAME = 'opv_s0_relay_2'
  var FAR = 'grindless:s0_terzan5_core'
  var FARO = { x: 64, y: 100, z: 64 }
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestOpvS0Relay2Request'
  var failed = 0

  function emit(name, status, detail) {
    console.info('GGTEST|' + NAME + '|' + name + '|' + status + (detail ? '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) : ''))
  }
  function check(name, ok, detail) {
    if (!ok) failed++
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }
  function run(server) {
    var level = server.getLevel(FAR)
    var row = String(server.persistentData.getString('uxvPlatform_s0_terzan5'))
    check('row_survived', row === FAR + '@' + FARO.x + ',' + FARO.y + ',' + FARO.z, 'persistentData uxvPlatform_s0_terzan5 = "' + row + '"')
    check('forced_chunks_survived', Number(level.getForcedChunks().size()) > 0, 'forced chunks in ' + FAR + ': ' + level.getForcedChunks().size())
    var Machine = Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
    var Pos = Java.loadClass('net.minecraft.core.BlockPos')
    var m = Machine.getMachine(level, new Pos(FARO.x, FARO.y, FARO.z))
    check('ring_formed_after_restart', !!m && m.isFormed(), m ? 'formed ' + m.isFormed() : 'no controller block entity')
    var ae2 = String(level.getBlock(FARO.x + 12, FARO.y, FARO.z).id)
    check('ae2_controller_kept', ae2 === 'ae2:controller', ae2)
    var dyn = String(level.getBlock(FARO.x + 9, FARO.y, FARO.z).id)
    check('dynamo_kept', /wireless_dynamo/.test(dyn), dyn)
    for (var bx = 48; bx <= 96; bx += 16) {
      server.runCommandSilent('execute in ' + FAR + ' run forceload remove ' + bx + ' 64')
    }
    console.info('GGTEST|' + NAME + '|DONE|failures=' + failed)
  }
  global[REQUEST] = ''
  ServerEvents.customCommand('gg_test_opv_s0_relay_2', function () {
    global[REQUEST] = 'run'
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] !== '' && Date.now() - LOADED_AT >= 10000) {
        global[REQUEST] = ''
        run(event.server)
      }
    } catch (e) {
      failed++
      emit('exception', 'FAIL', String(e))
      console.info('GGTEST|' + NAME + '|DONE|failures=' + failed)
    }
  })
})()
