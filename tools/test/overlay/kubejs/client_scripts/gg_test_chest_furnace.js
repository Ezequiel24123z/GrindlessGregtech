// Gregtech Grindless - client half of the chest and furnace test (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack). Partner of server_scripts/gg_test_chest_furnace.js; asleep unless that test sets 'hold' in the map both halves
// share (global.ggChestFurnace: in the client suite both run in the same JVM).
//
// While the test runs it:
//   - keeps mc-runtime-test in the world (it quits once the player's tickCount reaches 100 with no screen open): the counter is wound back;
//   - tells the server half the folder name of the world being played (the game's own level list), so it can read the world's
//     serverconfig back from disk;
//   - on a click request: waits until the crosshair is on the requested block, then holds the use key for one client tick, so Minecraft
//     runs its own right-click (startUseItem -> useItemOn -> the chest's menu), as with the mouse;
//   - once a Sophisticated Storage screen is open: after 30 ticks reports what the CLIENT menu shows (storage slots, upgrade slots, rows,
//     the stacks and items in the storage slots and, apart, in the upgrade slots), whether the click was aimed at the requested block, and
//     takes a screenshot into kubejs/exported/ (its IO-thread callback reports whether the file was written);
//   - on a close request: closes the menu the way the player does (the close packet goes to the server).
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggChestFurnace) global.ggChestFurnace = new CHM()
  var S = global.ggChestFurnace
  var TAG = 'GGTEST|chest_furnace|'
  var HOLD_MAX_MS = 15 * 60 * 1000
  var c = { holding: false, since: 0, errors: 0, ageField: null, gaveUp: false, levels: false, pressed: '', releaseNext: false, waitAim: 0,
    clickedHow: '', aimOk: false, openTicks: 0, reported: '', closed: '' }

  function val(key) {
    var v = S.get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function log(check, status, detail) {
    var line = TAG + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
    console.info(line)
  }

  function field(obj, names) {
    for (var i = 0; i < names.length; i++) {
      var v = obj[names[i]]
      if (v !== undefined && v !== null) return v
    }
    return null
  }

  function method(obj, names) {
    for (var i = 0; i < names.length; i++) if (typeof obj[names[i]] === 'function') return obj[names[i]]()
    return null
  }

  function windBack(p) {
    if (c.ageField === null) {
      var names = ['age', 'tickCount', 'f_19797_']
      for (var i = 0; i < names.length; i++) {
        var v = p[names[i]]
        if (v !== undefined && v !== null && typeof v !== 'function') {
          c.ageField = names[i]
          break
        }
      }
      if (c.ageField === null) c.ageField = ''
    }
    if (c.ageField === '') return
    if (Number(p[c.ageField]) >= 80) p[c.ageField] = 20
  }

  function release(mc) {
    if (c.releaseNext) {
      mc.options.keyUse.setDown(false)
      c.releaseNext = false
    }
    if (c.holding) {
      c.holding = false
      log('client_hold', 'NOTE', 'released after ' + Math.round((Date.now() - c.since) / 1000) + ' s: mc-runtime-test may finish now')
    }
  }

  // the world folder(s) of this instance, from the game's own level list
  function levels(mc) {
    if (c.levels) return
    c.levels = true
    var names = []
    try {
      var list = mc.getLevelSource().findLevelCandidates().levels()
      for (var i = 0; i < list.size(); i++) names.push(String(list.get(i).directoryName()))
    } catch (e) {
      log('client_levels', 'NOTE', 'level list not readable: ' + e)
    }
    try {
      var srv = mc.getSingleplayerServer()
      if (srv !== null) {
        var n = String(srv.getWorldData().getLevelName())
        if (names.indexOf(n) < 0) names.push(n)
      }
    } catch (e) { }
    S.put('levelDirs', names.join(';'))
    log('client_levels', 'NOTE', 'world folders: ' + names.join(', '))
  }

  function aimedAt(mc) {
    var hit = mc.hitResult
    if (hit === null || hit === undefined || typeof hit.getBlockPos !== 'function') return ''
    var b = hit.getBlockPos()
    return b.getX() + ',' + b.getY() + ',' + b.getZ()
  }

  function storageMenu(mc) {
    var scr = field(mc, ['screen', 'f_91080_'])
    if (scr === null || typeof scr === 'function' || typeof scr.getMenu !== 'function') return null
    var menu = scr.getMenu()
    if (menu === null || typeof menu.getNumberOfStorageInventorySlots !== 'function') return null
    return { scr: scr, menu: menu }
  }

  function click(mc) {
    if (c.releaseNext) {
      mc.options.keyUse.setDown(false)
      c.releaseNext = false
    }
    var token = val('clickToken')
    if (token === '' || token === c.pressed) return
    if (field(mc, ['screen', 'f_91080_']) !== null) return
    var want = val('clickPos')
    var at = aimedAt(mc)
    if (at !== want && c.waitAim < 60) {
      c.waitAim++
      S.put('clickNote', 'waiting for the crosshair on ' + want + ' (now ' + (at || 'nothing') + ', ' + c.waitAim + ' ticks)')
      return
    }
    c.pressed = token
    c.waitAim = 0
    c.aimOk = at === want
    mc.options.keyUse.setDown(true)
    c.releaseNext = true
    c.clickedHow = 'a real right-click (use key held one tick) with the crosshair on ' + (at || 'nothing') + (c.aimOk ? '' : ' (wanted ' + want + ')')
    c.openTicks = 0
    S.put('clickNote', c.clickedHow)
  }

  // the screenshot is written on Minecraft's IO thread; its callback says whether the file was written
  function shoot(mc, token, name) {
    try {
      var Screenshot = Java.loadClass('net.minecraft.client.Screenshot')
      Java.loadClass('dev.latvian.mods.kubejs.KubeJSPaths').dir('kubejs/exported')
      Screenshot.grab(field(mc, ['gameDirectory', 'f_91069_']), '../kubejs/exported/' + name + '.png', method(mc, ['getMainRenderTarget', 'm_91385_']), function (msg) {
        var key = ''
        try { key = String(msg.getContents().getKey()) } catch (e) { key = String(msg.getString()) }
        S.put('shotResult', token + '|' + key + '|' + name + '.png')
      })
    } catch (e) {
      S.put('shotResult', token + '|exception ' + String(e).replace(/\|/g, '/') + '|' + name + '.png')
    }
  }

  function observe(mc, p) {
    var sm = storageMenu(mc)
    if (sm === null) {
      c.openTicks = 0
      return
    }
    var token = val('clickToken')
    if (token === '' || c.reported === token) return
    c.openTicks++
    if (c.openTicks < 30) return
    c.reported = token
    var menu = sm.menu
    var inv = p.getInventory()
    // menu.slots holds the storage and the player's slots; the upgrade slots sit past them (StorageContainerMenuBase#getSlot)
    var first = Number(menu.getInventorySlotsSize())
    var total = Number(menu.getTotalSlotsNumber())
    var stacks = 0
    var items = 0
    var upStacks = 0
    var upItems = 0
    for (var i = 0; i < total; i++) {
      var s = menu.getSlot(i)
      if (i < first && s.container.equals(inv)) continue
      var st = s.getItem()
      if (st.isEmpty()) continue
      if (i < first) {
        stacks++
        items += Number(st.getCount())
      } else {
        upStacks++
        upItems += Number(st.getCount())
      }
    }
    shoot(mc, token, val('screenshotName'))
    var rep = [token, String(sm.scr.getClass().getSimpleName()), Number(menu.getNumberOfStorageInventorySlots()), Number(menu.getNumberOfUpgradeSlots()),
      Number(menu.getNumberOfRows()), stacks, items, upStacks, upItems, c.clickedHow !== '' ? c.clickedHow : 'not by a click of this client', c.aimOk ? 'aim' : 'noaim'].join('|')
    S.put('report', rep)
    log('client_screen', 'NOTE', rep)
  }

  function close(mc, p) {
    var token = val('closeToken')
    if (token === '' || token === c.closed) return
    c.closed = token
    c.clickedHow = ''
    try {
      if (typeof p.closeMenu === 'function') p.closeMenu()
      else p.closeContainer()
    } catch (e) {
      mc.setScreen(null)
    }
  }

  function tick() {
    var mc = Client
    var p = mc.player
    if (p === null || p === undefined) return
    if (val('hold') !== 'true' || c.gaveUp) {
      release(mc)
      return
    }
    if (!c.holding) {
      c.holding = true
      c.since = Date.now()
      log('client_hold', 'NOTE', 'keeping mc-runtime-test in the world until the server half is done')
    }
    if (Date.now() - c.since > HOLD_MAX_MS) {
      c.gaveUp = true
      log('client_hold', 'NOTE', 'gave up holding after ' + (HOLD_MAX_MS / 60000) + ' min')
      release(mc)
      return
    }
    windBack(p)
    levels(mc)
    click(mc)
    observe(mc, p)
    close(mc, p)
  }

  ClientEvents.tick(function (event) {
    try {
      tick()
    } catch (e) {
      if (c.errors++ < 8) log('client_script', 'NOTE', 'exception: ' + e)
    }
  })
})()
