// priority: -5698
// TEST ONLY, UEV-M1 (gtceu:uev_parallel_hatch). Command: kubejs custom_command gg_test_uev_parallel_hatch
// Band ONLY: X 35072-35135, Z 0-63, Overworld Y 98-115.
//   T1 (named uncertainty: tier 10 registration of ParallelHatchPartMachine with highTierContent off):
//     registered  the three hatches exist and the UEV one is accepted by global.grindless.parallelHatch
//     reports     a placed UEV hatch reports 4,096 parallels (UHV 1,024 beside it)
(function () {
  var S = null
  var LOADED = Date.now()
  var X = 35100
  var Y = 100
  var Z = 10
  var NAME = 'uev_parallel_hatch'
  function errText(e) { try { return String(e.message || e) } catch (x) { return 'unprintable' } }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + String(detail).replace(/[\r\n|]+/g, ' ').substring(0, 1500))
  }
  function command(text) { return S.server.runCommandSilent('execute in minecraft:overworld run ' + text) }
  function run() {
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var Pos = Java.loadClass('net.minecraft.core.BlockPos')
    var Meta = Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
    var Regs = Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
    var ids = ['gtceu:uv_parallel_hatch', 'gtceu:uhv_parallel_hatch', 'gtceu:uev_parallel_hatch']
    var have = ids.filter(function (i) { return !!Regs.MACHINES.get(new RL(i)) })
    var list = global.grindless.parallelHatch.hatches
    var inList = list ? ids.every(function (i) { return String(list).indexOf(i) >= 0 }) : false
    check('registered', have.length === 3, 'registered: ' + have.join(', ') + '; hatch list known: ' + !!list + ', all three listed: ' + inList)
    command('setblock ' + X + ' ' + Y + ' ' + Z + ' gtceu:uev_parallel_hatch[facing=north] replace')
    command('setblock ' + (X + 2) + ' ' + Y + ' ' + Z + ' gtceu:uhv_parallel_hatch[facing=north] replace')
    S.level = S.server.getLevel('minecraft:overworld')
    S.pos = new Pos(X, Y, Z)
    S.pos2 = new Pos(X + 2, Y, Z)
    S.Meta = Meta
  }
  function measure() {
    var m = S.Meta.getMachine(S.level, S.pos)
    var m2 = S.Meta.getMachine(S.level, S.pos2)
    var uev = m ? Number(m.getCurrentParallel()) : NaN
    var uhv = m2 ? Number(m2.getCurrentParallel()) : NaN
    check('reports', uev === 4096 && uhv === 1024, 'UEV hatch reports ' + uev + ' (expected 4096), UHV ' + uhv + ' (expected 1024), class ' + (m ? m.getClass().getSimpleName() : 'none'))
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    command('fill ' + X + ' ' + Y + ' ' + Z + ' ' + (X + 2) + ' ' + Y + ' ' + Z + ' minecraft:air')
    command('forceload remove ' + (X - 8) + ' ' + (Z - 8) + ' ' + (X + 8) + ' ' + (Z + 8))
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  ServerEvents.customCommand('gg_test_uev_parallel_hatch', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestUevHatchRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUevHatchRequest && Date.now() - LOADED >= 10000) {
        global.ggTestUevHatchRequest = false
        S = { server: event.server, tick: 0, failed: 0, finished: false }
        command('forceload add ' + (X - 8) + ' ' + (Z - 8) + ' ' + (X + 8) + ' ' + (Z + 8))
        try { run() } catch (e) { check('setup_exception', false, errText(e)); finish() }
        return
      }
      if (S === null || S.finished) return
      S.tick++
      if (S.tick === 40) { try { measure() } catch (e) { check('measure_exception', false, errText(e)) } finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
