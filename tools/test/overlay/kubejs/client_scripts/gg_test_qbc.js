// priority: 12100
// Gregtech Grindless - client half of the quantum bridge card test (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack). Partner of server_scripts/gg_test_qbc.js; asleep unless that test sets 'hold' in the map both halves share
// (global.ggQbc: in the client suite both run in the same JVM).
//
// While the test runs it:
//   - keeps mc-runtime-test in the world: mc-runtime-test 5.0.1 (1.20.1) quits once the player's tickCount reaches 100 with no screen
//     open, so the counter is wound back (80 -> 20). KubeJS exposes Entity#tickCount to scripts as `age`;
//   - right-clicks with the held terminal when the server half asks for it: the "use" key binding (right mouse button) is held for one
//     client tick, so Minecraft runs its own right-click code (handleKeybinds -> startUseItem -> MultiPlayerGameMode.useItem ->
//     ServerboundUseItemPacket), like a mouse click; a second attempt calls MultiPlayerGameMode.useItem directly;
//   - after each click, counts the ticks the terminal screen (AE2WTLib's WCTScreen) is shown;
//   - reports what the client shows: dimension, held item, open screen, and in the terminal the network entries AE2 synced to it
//     (MEStorageMenu#getClientRepo) and the diamonds among them;
//   - when asked, shift-clicks the diamonds in the open terminal: MEStorageMenu#handleInteraction(serial, SHIFT_CLICK) on the client
//     sends AE2's MEInteractionPacket, what the screen sends for a shift-click on an entry;
//   - once EMI has loaded: the card, its parts and the pair's items are in EMI's index, and EMI shows the card's recipe.
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggQbc) global.ggQbc = new CHM()
  var S = global.ggQbc
  var TAG = 'GGTEST|qbc|'
  var HOLD_MAX_MS = 28 * 60 * 1000
  var KNOWN = 'minecraft:diamond'
  var CARD = 'ae2wtlib:quantum_bridge_card'
  var c = { holding: false, since: 0, pressed: '', releaseNext: false, errors: 0, lastState: '', ageField: null, gaveUp: false, obsToken: '', obsWct: 0,
    obsTicks: 0, extracted: '', emiDone: false }
  var J = null

  function cl() {
    if (J !== null) return J
    J = {
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Hand: Java.loadClass('net.minecraft.world.InteractionHand'),
      InventoryAction: Java.loadClass('appeng.helpers.InventoryAction')
    }
    return J
  }

  function val(key) {
    var v = S.get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function log(check, status, detail) {
    var line = TAG + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/')
    console.info(line)
  }

  function releaseKey(mc) {
    if (c.releaseNext) {
      mc.options.keyUse.setDown(false)
      c.releaseNext = false
    }
  }

  function release(mc) {
    releaseKey(mc)
    if (c.holding) {
      c.holding = false
      log('client_hold', 'NOTE', 'released after ' + Math.round((Date.now() - c.since) / 1000) + ' s: mc-runtime-test may finish now')
    }
  }

  // mc-runtime-test reads Entity#tickCount; KubeJS calls it `age`
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
      if (c.ageField === null) {
        c.ageField = ''
        log('client_hold_check', 'NOTE', 'no tick counter field found on ' + p + ': mc-runtime-test will quit after 100 ticks')
      }
    }
    if (c.ageField === '') return
    if (Number(p[c.ageField]) >= 80) p[c.ageField] = 20
  }

  // the network entries AE2 synced to the open terminal, and the diamonds among them
  function repoInfo(menu) {
    var out = { count: -1, serial: -1, amount: -1 }
    if (menu === null) return out
    var repo = null
    try {
      repo = menu.getClientRepo()
    } catch (e) {
      return out
    }
    if (repo === null || repo === undefined) return out
    var list = new (cl().ArrayList)(repo.getAllEntries())
    out.count = list.size()
    for (var i = 0; i < list.size(); i++) {
      var e = list.get(i)
      var what = e.getWhat()
      if (what !== null && String(what.getId()) === KNOWN) {
        out.serial = Number(e.getSerial())
        out.amount = Number(e.getStoredAmount())
      }
    }
    return out
  }

  function report(mc, p) {
    var dim = String(p.getLevel().getDimension())
    var item = String(p.getMainHandItem().getId())
    var scr = mc.screen
    var title = ''
    var klass = ''
    var menu = null
    if (scr !== null && scr !== undefined) {
      klass = String(scr.getClass().getName())
      try { title = String(scr.getTitle().getString()) } catch (e) { title = '' }
      if (title === '') title = klass
      try { if (typeof scr.getMenu === 'function') menu = scr.getMenu() } catch (e) { menu = null }
    }
    var wct = klass.indexOf('WCTScreen') >= 0
    var repo = wct ? repoInfo(menu) : { count: -1, serial: -1, amount: -1 }
    var power = ''
    if (wct && menu !== null) {
      try { power = String(menu.hasPower) } catch (e) { power = '?' }
    }
    S.put('clientDim', dim)
    S.put('clientY', Number(p.getY()).toFixed(2))
    S.put('clientItem', item)
    S.put('clientScreen', title)
    S.put('clientScreenClass', klass)
    S.put('clientRepo', String(repo.count))
    S.put('clientKnown', String(repo.amount))
    S.put('clientHasPower', power)
    var state = dim + '|' + klass + '|' + (wct ? repo.amount : '')
    if (state !== c.lastState) {
      c.lastState = state
      log('client_state', 'NOTE', 'dimension ' + dim + ', y ' + Number(p.getY()).toFixed(2) + ', holding ' + item + ', screen ' + (title || 'none') +
        (klass !== '' && klass !== title ? ' (' + klass + ')' : '') + (wct ? ', ' + repo.count + ' network entries, diamond x' + repo.amount + ', hasPower ' + power : ''))
    }
    return { dim: dim, item: item, screen: title, wct: wct, menu: menu, repo: repo }
  }

  // counts the ticks the terminal screen shows after the last click: 'token|terminal ticks|ticks|terminal now'
  function observe(seen) {
    if (c.obsToken === '') return
    c.obsTicks++
    if (seen.wct) c.obsWct++
    S.put('obs', c.obsToken + '|' + c.obsWct + '|' + c.obsTicks + '|' + (seen.wct ? '1' : '0'))
  }

  function click(mc, p, seen) {
    releaseKey(mc)
    var token = val('clickToken')
    if (token === '' || token === c.pressed) return
    if (seen.screen !== '' || mc.getOverlay() != null) return
    if (seen.dim !== val('clickDim') || seen.item !== val('clickItem')) return
    c.pressed = token
    c.obsToken = token
    c.obsWct = 0
    c.obsTicks = 0
    var how
    if (val('clickMode') === 'direct') {
      how = 'by MultiPlayerGameMode.useItem(player, MAIN_HAND) called directly -> ' + mc.gameMode.useItem(p, cl().Hand.MAIN_HAND)
    } else {
      // Minecraft's own handleKeybinds() sees the use key down on the next tick and runs startUseItem(), as for a mouse click
      mc.options.keyUse.setDown(true)
      c.releaseNext = true
      how = 'by the use key (right mouse button) held for one client tick'
    }
    S.put('clickedHow', how)
    S.put('clicked', token)
  }

  function extract(seen) {
    var token = val('extractToken')
    if (token === '' || token === c.extracted) return
    if (!seen.wct || seen.menu === null || seen.repo.serial < 0 || !(seen.repo.amount > 0)) return
    c.extracted = token
    seen.menu.handleInteraction(seen.repo.serial, cl().InventoryAction.SHIFT_CLICK)
    S.put('extractedHow', 'shift-click on ' + KNOWN + ' (serial ' + seen.repo.serial + ', ' + seen.repo.amount + ' shown) in the terminal, AE2\'s MEInteractionPacket ' +
      'sent by the client')
    S.put('extracted', token)
  }

  // EMI: the card, its parts and the pair in the index; the card's recipe and the recipes of its parts shown
  function emi() {
    if (c.emiDone) return
    var ERM = Java.loadClass('dev.emi.emi.runtime.EmiReloadManager')
    if (!ERM.isLoaded()) return
    c.emiDone = true
    try {
      var AL = cl().ArrayList
      var EmiApi = Java.loadClass('dev.emi.emi.api.EmiApi')
      var EmiStackList = Java.loadClass('dev.emi.emi.registry.EmiStackList')
      var ItemEmiStack = Java.loadClass('dev.emi.emi.api.stack.ItemEmiStack')
      // EMI hands out JDK immutable lists; Rhino cannot call their methods (module access): copy them
      var list = new AL(EmiStackList.stacks)
      var index = {}
      for (var i = 0; i < list.size(); i++) index[String(list.get(i).getId())] = true
      var want = [CARD, 'ae2:fluix_pearl', 'ae2:wireless_receiver', 'ae2:wireless_crafting_terminal', 'ae2:wireless_access_point', 'ae2:singularity',
        'ae2:quantum_entangled_singularity', 'ae2:quantum_ring', 'ae2:quantum_link']
      var missing = want.filter(function (id) { return index[id] !== true })
      var rm = EmiApi.getRecipeManager()
      var made = function (id) {
        var rs = new AL(rm.getRecipesByOutput(new ItemEmiStack(Item.of(id))))
        var out = []
        for (var k = 0; k < rs.size(); k++) {
          var rid = rs.get(k).getId()
          out.push(rid === null ? '(no id)' : String(rid))
        }
        return out
      }
      var card = made(CARD)
      var pearl = made('ae2:fluix_pearl')
      var receiver = made('ae2:wireless_receiver')
      var pair = made('ae2:quantum_entangled_singularity')
      var ok = missing.length === 0 && card.indexOf(CARD) >= 0 && pearl.length > 0 && receiver.length > 0 && pair.length > 0
      S.put('emi', (ok ? 'PASS ' : 'FAIL ') + 'EMI index of ' + list.size() + ' stacks, of ' + want.join(', ') + ' missing: ' + (missing.join(', ') || 'none') +
        '; EMI recipes making the card: ' + (card.join(', ') || 'none') + '; the fluix pearl: ' + (pearl.slice(0, 4).join(', ') || 'none') + '; the wireless receiver: ' +
        (receiver.slice(0, 4).join(', ') || 'none') + '; the entangled singularity: ' + (pair.slice(0, 6).join(', ') || 'none'))
    } catch (e) {
      S.put('emi', 'FAIL exception: ' + e)
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
    var seen = report(mc, p)
    observe(seen)
    click(mc, p, seen)
    extract(seen)
    emi()
  }

  ClientEvents.tick(function (event) {
    try {
      tick()
    } catch (e) {
      if (c.errors++ < 8) log('client_script', 'NOTE', 'exception: ' + e)
    }
  })
})()
