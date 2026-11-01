// priority: 12250
// TEST ONLY, XP-Z1b ending. Client half; partner of server_scripts/gg_test_maxplus_ending.js (asleep unless it sets 'hold' in global.ggMaxplusEnding).
// Keeps mc-runtime-test in the world, closes the first WinScreen like a player pressing Escape, flags a second one, and on the server's request
// right-clicks the epilogue with the real gameMode.useItem path and reports whether a BookViewScreen opened.
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var S = global.ggMaxplusEnding
  var c = { ticks: 0, seenAt: -1, closed: false, errors: 0, quiet: 0, used: 0, bookAt: -1, classes: '' }

  function log(check, status, detail) {
    console.info('GGTEST|maxplus_ending|' + check + '|' + status + (detail ? '|' + String(detail).replace(/[\r\n|]+/g, ' ') : ''))
  }

  ClientEvents.tick(function () {
    try {
      S = global.ggMaxplusEnding
      if (!S) return
      var mc = Client
      var p = mc.player
      if (p === null || p === undefined || String(S.get('hold') || '') !== 'true') return
      c.ticks++
      var scr = mc.screen
      if (scr === null || scr === undefined) {
        if (Number(p.age) >= 80) p.age = 20
        c.quiet++
        if (c.quiet >= 60) S.put('idle', 'true')
        if (String(S.get('bookReq') || '') === 'true' && String(S.get('bookSeen') || '') !== 'true' && c.used === 0) {
          c.used = 1
          var inv = p.getInventory()
          for (var i = 0; i < 9; i++) {
            if (String(inv.getItem(i).getItem().toString()).indexOf('epilogue') >= 0) inv.selected = i
          }
          var Hand = Java.loadClass('net.minecraft.world.InteractionHand')
          var res = Java.loadClass('net.minecraft.client.Minecraft').getInstance().gameMode.useItem(p, Hand.MAIN_HAND)
          log('use', 'NOTE', 'useItem ' + res + ' holding ' + inv.getItem(inv.selected).getItem().toString())
        }
        return
      }
      c.quiet = 0
      var cls = String(scr.getClass().getName())
      if (cls.indexOf('BookViewScreen') >= 0) {
        if (String(S.get('bookSeen') || '') !== 'true') {
          S.put('bookClass', cls)
          S.put('bookSeen', 'true')
          c.bookAt = c.ticks
        } else if (c.ticks - c.bookAt >= 20) {
          scr.onClose()
        }
        return
      }
      if (cls.indexOf('WinScreen') < 0) {
        if (c.classes.indexOf(cls) < 0) {
          c.classes += cls + ' '
          S.put('screenClass', c.classes)
        }
        return
      }
      if (String(S.get('phase2') || '') === 'true') {
        S.put('win2', 'true')
        scr.onClose()
        return
      }
      if (c.seenAt < 0) {
        c.seenAt = c.ticks
        S.put('seen', 'true')
        S.put('screenClass', cls)
        log('screen', 'PASS', cls)
      } else if (!c.closed && c.ticks - c.seenAt >= 40) {
        c.closed = true
        scr.onClose()
        S.put('closed', 'true')
        log('closed', 'NOTE', 'WinScreen closed')
      }
    } catch (e) {
      if (c.errors++ < 5) log('client_script', 'FAIL', 'exception: ' + e)
    }
  })
})()
