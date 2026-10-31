// priority: 12250
// TEST ONLY, MAX-C3 credits leg. Client half; partner of server_scripts/gg_test_max_credits.js (asleep unless it sets 'hold' in global.ggMaxCredits;
// the client suite runs both in one JVM). Keeps mc-runtime-test in the world (it quits at tickCount 100 with no screen), watches for the
// win screen after the server's WIN_GAME packet, then closes it like a player pressing Escape: vanilla sends PERFORM_RESPAWN.
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var S = global.ggMaxCredits
  var c = { seenAt: -1, ticks: 0, closed: false, errors: 0, quiet: 0, classes: '' }

  function log(check, status, detail) {
    console.info('GGTEST|max_credits|' + check + '|' + status + (detail ? '|' + String(detail).replace(/[\r\n|]+/g, ' ') : ''))
  }

  ClientEvents.tick(function () {
    try {
      S = global.ggMaxCredits
      if (!S) return
      var mc = Client
      var p = mc.player
      if (p === null || p === undefined || String(S.get('hold') || '') !== 'true') return
      c.ticks++
      var scr = mc.screen
      var sent = String(S.get('sent') || '') === 'true'
      if (scr === null || scr === undefined) {
        if (Number(p.age) >= 80) p.age = 20
        c.quiet++
        if (!sent && c.quiet >= 60) S.put('idle', 'true')
        return
      }
      c.quiet = 0
      if (!sent) return
      var cls = String(scr.getClass().getName())
      if (c.classes.indexOf(cls) < 0) {
        c.classes += cls + ' '
        S.put('screenClass', c.classes)
        log('screen', cls.indexOf('WinScreen') >= 0 ? 'PASS' : 'NOTE', cls)
      }
      if (cls.indexOf('WinScreen') >= 0 && c.seenAt < 0) {
        c.seenAt = c.ticks
        S.put('seen', 'true')
      } else if (c.seenAt >= 0 && !c.closed && c.ticks - c.seenAt >= 40) {
        c.closed = true
        scr.onClose()
        S.put('closed', 'true')
        log('closed', 'NOTE', 'screen closed; screen now ' + (mc.screen === null ? 'none' : String(mc.screen.getClass().getName())))
      }
    } catch (e) {
      if (c.errors++ < 5) log('client_script', 'FAIL', 'exception: ' + e)
    }
  })
})()
