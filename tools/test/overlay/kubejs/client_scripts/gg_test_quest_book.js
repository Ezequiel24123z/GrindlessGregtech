// priority: 12000
// Gregtech Grindless - client half of the quest book test (TEST-ONLY overlay, never shipped). Partner of
// server_scripts/gg_test_quest_book.js; asleep unless that test sets 'hold' in the map both halves share (global.ggQuestBook:
// in the client suite both run in the same JVM).
//
// While the test runs it:
//   - keeps mc-runtime-test in the world (it quits once the player's tickCount reaches 100 with no screen open; KubeJS calls
//     the field `age`, so the counter is wound back 80 -> 20, as in gg_test_dimension_keys.js);
//   - on 'tooltipToken': reads the tooltips the client builds for the claimed toolbox tools (ItemStack#getTooltipLines, normal
//     flag) and checks them: the vanilla "Unbreakable" line is there, GregTech's durability lines ("Durability", "Total
//     Durability", "Crafting Uses", "Hold SHIFT to show Repair Info") are not, and the magnet / area-of-effect lines show on
//     the tools that have them;
//   - on 'bookToken': opens the quest book the way FTB Quests does. First ClientQuestFile.openGui(quest, focused) on The
//     Neutronium Toolbox (the quest window with its claimed rewards), then the chapter maps without a quest window
//     (openGui(), selectChapter, zoomed out, scrolled to the part to look at): Welcome, Steam Age, the rocket at the end of
//     HV, the End row of MV, the lunar base in EV, and IV's nuclear half and its planets. Toasts are cleared before each shot.
//     Screenshots go to kubejs/exported/
//     (collected with the results).
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggQuestBook) global.ggQuestBook = new CHM()
  var S = global.ggQuestBook
  var TAG = 'GGTEST|quest_book|'
  var HOLD_MAX_MS = 15 * 60 * 1000
  var TOOLS = [
    'gtceu:neutronium_hammer', 'gtceu:neutronium_wrench', 'gtceu:neutronium_file', 'gtceu:neutronium_saw',
    'gtceu:neutronium_screwdriver', 'gtceu:neutronium_wire_cutter', 'gtceu:neutronium_knife',
    'gtceu:neutronium_crowbar', 'gtceu:neutronium_butchery_knife', 'gtceu:neutronium_scythe',
    'gtceu:neutronium_pickaxe', 'gtceu:neutronium_shovel', 'gtceu:neutronium_axe', 'gtceu:neutronium_hoe',
    'gtceu:neutronium_sword', 'gtceu:neutronium_mining_hammer', 'gtceu:neutronium_spade',
    'gtceu:naquadah_mortar', 'gtceu:rubber_mallet', 'gtceu:rubber_plunger'
  ]
  var MAGNETIC = ['gtceu:neutronium_pickaxe', 'gtceu:neutronium_mining_hammer', 'gtceu:neutronium_axe', 'gtceu:neutronium_shovel', 'gtceu:neutronium_spade']
  var AOE = ['gtceu:neutronium_mining_hammer', 'gtceu:neutronium_spade']
  // quest: open that quest's window; chapter: the map of that chapter centred on (x, y), or on its middle without them
  var SHOTS = [
    { name: 'gg_quest_toolbox', quest: '047B55ED9C952BC9' },
    { name: 'gg_book_welcome', chapter: 'welcome' },
    { name: 'gg_book_steam_age', chapter: 'steam_age' },
    { name: 'gg_book_hv_rocket', chapter: 'hv_age', x: 20, y: 0 },
    { name: 'gg_book_mv_end', chapter: 'mv_age', x: 14, y: 6 },
    { name: 'gg_book_ev_age', chapter: 'ev_age' },
    { name: 'gg_book_iv_age', chapter: 'iv_age', x: 10, y: -1.5 },
    { name: 'gg_book_iv_planets', chapter: 'iv_age', x: 30, y: -2 },
    { name: 'gg_book_luv_home', chapter: 'luv_age', x: 6, y: 0 },
    { name: 'gg_book_luv_sites', chapter: 'luv_age', x: 18, y: 1 },
    { name: 'gg_book_zpm_home', chapter: 'zpm_age', x: 6, y: 0 },
    { name: 'gg_book_uv_home', chapter: 'uv_age', x: 6, y: 0 }
  ]
  var OPEN_TICKS = 60
  // the Processing Lines group: three of its charts, centred on their middles
  SHOTS.push({ name: 'gg_book_pl_lv', chapter: 'pl_lv' }, { name: 'gg_book_pl_ev', chapter: 'pl_ev' }, { name: 'gg_book_pl_iv', chapter: 'pl_iv' })
  // the Power tab: its Steam Age and LV rows, the IV rows, and the grid with the wireless network
  SHOTS.push({ name: 'gg_book_power_top', chapter: 'power', x: 16, y: 6 }, { name: 'gg_book_power_iv', chapter: 'power', x: 12, y: 43 },
    { name: 'gg_book_power_grid', chapter: 'power', x: 16, y: 65 })
  var c = { holding: false, since: 0, errors: 0, ageField: null, gaveUp: false, tipDone: '', book: null }

  function val(key) {
    var v = S.get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function log(check, status, detail) {
    var line = TAG + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
    console.info(line)
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

  function stackOf(p, id) {
    var inv = p.getInventory()
    for (var i = 0; i < inv.getContainerSize(); i++) {
      var s = inv.getItem(i)
      if (!s.isEmpty() && String(s.getId()) === id) return s
    }
    return null
  }

  function tooltips(p) {
    var TooltipFlag = Java.loadClass('net.minecraft.world.item.TooltipFlag')
    var normal = TooltipFlag.NORMAL
    if (normal === undefined || normal === null) normal = TooltipFlag.f_256752_
    var bad = []
    var sample = ''
    TOOLS.forEach(function (id) {
      var s = stackOf(p, id)
      if (s === null) { bad.push(id + ' not in the client inventory'); return }
      var lines = s.getTooltipLines(p, normal)
      var text = []
      for (var i = 0; i < lines.size(); i++) text.push(String(lines.get(i).getString()))
      var all = text.join(' / ')
      if (id === 'gtceu:neutronium_mining_hammer') sample = all
      if (all.indexOf('Unbreakable') < 0) bad.push(id + ': no "Unbreakable" line')
      ;['Total Durability', 'Durability', 'Crafting Uses', 'Repair Info'].forEach(function (w) {
        if (all.indexOf(w) >= 0) bad.push(id + ': shows "' + w + '"')
      })
      if (MAGNETIC.indexOf(id) >= 0 && all.indexOf('Magnetic') < 0) bad.push(id + ': no magnet line')
      if (AOE.indexOf(id) >= 0 && all.indexOf('Area-of-Effect') < 0) bad.push(id + ': no area-of-effect line')
    })
    log('client_tooltip_sample', 'NOTE', 'neutronium mining hammer: ' + sample)
    return bad.length === 0 ? 'PASS ' + TOOLS.length + ' tooltips: Unbreakable, no durability lines, magnet and AoE where expected' : 'FAIL ' + bad.join('; ')
  }

  function findClientQuest(code) {
    var CQF = Java.loadClass('dev.ftb.mods.ftbquests.client.ClientQuestFile')
    var file = CQF.INSTANCE
    if (file === null || file === undefined) return null
    var found = null
    var chs = file.getAllChapters()
    for (var i = 0; i < chs.size() && found === null; i++) {
      var qs = chs.get(i).getQuests()
      for (var j = 0; j < qs.size(); j++) {
        if (String(qs.get(j).getCodeString()) === code) { found = qs.get(j); break }
      }
    }
    return found
  }

  function findClientChapter(filename) {
    var CQF = Java.loadClass('dev.ftb.mods.ftbquests.client.ClientQuestFile')
    var file = CQF.INSTANCE
    if (file === null || file === undefined) return null
    var chs = file.getAllChapters()
    for (var i = 0; i < chs.size(); i++) if (String(chs.get(i).getFilename()) === filename) return chs.get(i)
    return null
  }

  function middle(ch) {
    var qs = ch.getQuests()
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9
    for (var i = 0; i < qs.size(); i++) {
      var q = qs.get(i)
      x0 = Math.min(x0, Number(q.getX())); x1 = Math.max(x1, Number(q.getX()))
      y0 = Math.min(y0, Number(q.getY())); y1 = Math.max(y1, Number(q.getY()))
    }
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 }
  }

  // chapter map without a quest window: zoom clamped to the minimum and one step up (8), so a whole era chapter fits on the
  // 854x480 test screen. Applied again a few ticks later in case the screen restores its saved view after opening.
  function showChapter(scr, ch, shot) {
    scr.selectChapter(ch)
    scr.addZoom(-10)
    scr.addZoom(1)
    var pos = shot.x !== undefined ? { x: shot.x, y: shot.y } : middle(ch)
    scr.questPanel.scrollTo(pos.x, pos.y)
  }

  // one screenshot per tick-driven step: open -> wait -> grab -> close -> next. Screenshot.grab(gameDir, name, ...) writes
  // <gameDir>/screenshots/<name>, so the name climbs into kubejs/exported (as gg_test_gcyr_flight.js does; no java.io here)
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

  function screenName(mc) {
    var scr = field(mc, ['screen', 'f_91080_'])
    if (scr === null || typeof scr === 'function') return 'none'
    var desc = String(scr)
    try { if (typeof scr.getGui === 'function') desc += ' ' + String(scr.getGui()) } catch (e) { }
    return desc
  }

  function book(mc) {
    if (c.book === null) c.book = { i: 0, t: 0, shots: [], errors: [] }
    var b = c.book
    if (b.i >= SHOTS.length) {
      mc.setScreen(null)
      S.put('bookResult', b.errors.length === 0 ? 'PASS book opened on ' + b.shots.join(', ') + ' (screenshots in kubejs/exported)' : 'FAIL ' + b.errors.join('; '))
      c.book = null
      return true
    }
    var shot = SHOTS[b.i]
    var CQF = Java.loadClass('dev.ftb.mods.ftbquests.client.ClientQuestFile')
    if (b.t === 0) {
      if (shot.quest) {
        var q = findClientQuest(shot.quest)
        if (q === null) {
          b.errors.push('quest ' + shot.quest + ' not in the client quest file')
          b.i++
          return false
        }
        CQF.openGui(q, true)
      } else {
        b.ch = findClientChapter(shot.chapter)
        b.scr = b.ch === null ? null : CQF.openGui()
        if (b.scr === null || b.scr === undefined) {
          b.errors.push(b.ch === null ? 'chapter ' + shot.chapter + ' not in the client quest file' : 'the book did not open for ' + shot.chapter)
          b.i++
          return false
        }
        showChapter(b.scr, b.ch, shot)
      }
    }
    if (!shot.quest && (b.t === 5 || b.t === 20)) showChapter(b.scr, b.ch, shot)
    if (b.t === OPEN_TICKS - 3) { try { mc.getToasts().clear() } catch (e) { } }
    b.t++
    if (b.t < OPEN_TICKS) return false
    var open = screenName(mc)
    try {
      var Screenshot = Java.loadClass('net.minecraft.client.Screenshot')
      Java.loadClass('dev.latvian.mods.kubejs.KubeJSPaths').dir('kubejs/exported')
      Screenshot.grab(field(mc, ['gameDirectory', 'f_91069_']), '../kubejs/exported/' + shot.name + '.png', method(mc, ['getMainRenderTarget', 'm_91385_']), function (msg) { })
      b.shots.push(shot.name)
      log('client_screenshot', 'NOTE', shot.name + '.png with screen ' + open)
    } catch (e) {
      b.errors.push(shot.name + ': ' + e)
    }
    if (open.indexOf('QuestScreen') < 0) b.errors.push(shot.name + ': open screen is ' + open)
    mc.setScreen(null)
    b.i++
    b.t = 0
    return false
  }

  function tick() {
    var mc = Client
    var p = mc.player
    if (p === null || p === undefined) return
    if (val('hold') !== 'true' || c.gaveUp) {
      if (c.holding) {
        c.holding = false
        log('client_hold', 'NOTE', 'released after ' + Math.round((Date.now() - c.since) / 1000) + ' s')
      }
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
      return
    }
    windBack(p)
    var tt = val('tooltipToken')
    if (tt !== '' && tt !== c.tipDone && val('tooltipResult') === '') {
      c.tipDone = tt
      S.put('tooltipResult', tooltips(p))
    }
    var bt = val('bookToken')
    if (bt !== '' && val('bookResult') === '') {
      if (c.book === null && c.bookDone === bt) return
      if (book(mc)) c.bookDone = bt
    }
  }

  ClientEvents.tick(function (event) {
    try {
      tick()
    } catch (e) {
      if (c.errors++ < 5) log('client_script', 'NOTE', 'exception: ' + e)
    }
  })
})()
