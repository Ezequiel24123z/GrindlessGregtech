// priority: -10008
// TEST-ONLY, preparation for ONE fresh-world integrated client run via Invoke-GGTest.
// Enable ONLY gg_test_v071_integration.json in a scratch overlay, after the parent's
// final candidate/launch instruction. Individual player-fixture markers must be off.
// Final release client sequence: pending chest/furnace behavior, then read-only EMI coverage.
// Accepted starter/map/codec and wireless proofs are NOT rerun here.
;(function () {
  var MARKER = 'kubejs/config/gg_test_v071_integration.json'
  var TAG = 'GGTEST|v071_client|'
  var marker = JsonIO.read(MARKER)
  if (!marker || String(marker.enabled) !== 'true') return
  if (!global.ggV071Integration) global.ggV071Integration = new (Java.loadClass('java.util.concurrent.ConcurrentHashMap'))()
  var S = global.ggV071Integration
  var run = null
  var STAGES = [
    ['chest_furnace', 'ggChestFurnace', 'ggTestChestFurnaceStart'],
    ['emi_coverage', 'ggEmiCoverage', 'ggTestEmiCoverageStart']
  ]
  var OTHER_MARKERS = ['dimension_keys', 'gcyr_flight', 'hidden', 'quest_book', 'gallery', 'qbc', 'projector',
    'starter_equipment', 'chest_furnace', 'emi_coverage']

  function log(name, status, detail) {
    console.info(TAG + name + '|' + status + '|' + String(detail).replace(/[\r\n|]+/g, '/'))
  }

  function finish(ok, detail) {
    if (run.done) return
    run.done = true
    S.put('failed', !ok)
    log('all', ok ? 'PASS' : 'FAIL', detail)
    log('scope', 'NOTE', 'pending chest/furnace + EMI only; accepted starter/wireless proofs reused')
    S.put('hold', false)
    console.info(TAG + 'DONE')
  }

  PlayerEvents.loggedIn(function (event) {
    if (run !== null) return
    run = { player: event.player, index: 0, active: false, done: false, cancelling: false }
    S.put('hold', true) // Own the gap BEFORE either fixture starts and BETWEEN stages.
    for (var i = 0; i < OTHER_MARKERS.length; i++) {
      var m = JsonIO.read('kubejs/config/gg_test_' + OTHER_MARKERS[i] + '.json')
      if (m && String(m.enabled) === 'true') {
        finish(false, 'conflicting individual marker: ' + OTHER_MARKERS[i] + '; no integrated stage started')
        return
      }
    }
    log('armed', 'NOTE', 'final client scope; accepted starter/map/codec, wireless and projector proofs reused')
  })

  ServerEvents.tick(function () {
    if (run === null || run.done) return
    var stage = STAGES[run.index]
    try {
      if (!run.active) {
        if (typeof global[stage[2]] !== 'function') throw new Error('missing fixture start hook: ' + stage[2])
        S.put('active', stage[1])
        // 170s work + at most 10s cancellation cleanup: <=180s per stage.
        S.put('deadline', Date.now() + 170000)
        log(stage[0], 'NOTE', 'starting; waiting for BOTH serverDone and clientDone before any handoff')
        global[stage[2]](run.player)
        run.active = true
      }
      var F = global[stage[1]]
      if (!F) throw new Error('fixture did not create its shared state')
      var cancel = S.get('cancel')
      if ((cancel || Date.now() > Number(S.get('deadline'))) && !run.cancelling) {
        run.cancelling = true
        run.cleanupDeadline = Date.now() + 10000
        F.put('cancel', cancel ? String(cancel) : '170s integrated stage work deadline')
        log(stage[0] + '_deadline', 'FAIL', String(F.get('cancel')))
      }
      if (String(F.get('serverDone')) === 'true' && String(F.get('clientDone')) === 'true') {
        if (run.cancelling || String(F.get('failed')) === 'true') {
          finish(false, stage[0] + ' failed; cleanup acknowledged; later stages NOT started')
          return
        }
        log(stage[0], 'PASS', 'fixture assertions and both cleanup acknowledgements complete')
        S.put('deadline', 0) // No stale stage deadline while the next fixture is not armed yet.
        run.index++
        run.active = false
        if (run.index === STAGES.length) finish(true, 'both prepared client stages passed; NOT full v0.7.1 acceptance')
      } else if (run.cancelling && Date.now() > run.cleanupDeadline) {
        finish(false, stage[0] + ' did not acknowledge cleanup within 10s; later stages NOT started')
      }
    } catch (e) {
      if (global[stage[1]]) global[stage[1]].put('cancel', 'dispatcher exception: ' + e)
      finish(false, 'dispatcher exception: ' + e)
    }
  })
})()
