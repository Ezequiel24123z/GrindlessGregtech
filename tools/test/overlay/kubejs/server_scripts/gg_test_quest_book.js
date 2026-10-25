// Gregtech Grindless - test overlay (not shipped with the pack)
//
// REAL-CLIENT test of the quest book (welcome + steam_age) and of the Neutronium Toolbox rewards, with a real player:
//   - the book: both chapters load with their quest counts; Arrival and The Neutronium Toolbox are completed with FTB Quests'
//     own command (ftbquests change_progress ... complete) and every reward is claimed through TeamData#claimReward, the
//     method the "claim" button's packet (ClaimRewardMessage) ends in; the items must reach the inventory;
//   - the tools, server side: each claimed tool carries the NBT GTM's IGTTool#get() gives a crafted one plus the root
//     "Unbreakable" tag GTM reads (ToolHelper.UNBREAKABLE_KEY); the neutronium pickaxe mines a block through
//     ServerPlayerGameMode#destroyBlock (the path a real left-click ends in) without losing durability and its magnet puts the
//     drop in the inventory; the neutronium mining hammer breaks a 3x3 wall in one go; the hammer comes back undamaged from
//     a crafting grid (getCraftingRemainingItem);
//   - the client half (client_scripts/gg_test_quest_book.js): tooltips of the claimed tools (vanilla "Unbreakable" line, no GT
//     durability lines), then opens the book on Welcome and on Steam Age and takes screenshots into
//     kubejs/exported/ (collected with the results) so the dependency lines can be looked at.
//
// HOW TO RUN (client suite only). Copy tools\test\overlay to a scratch folder, add kubejs\config\gg_test_quest_book.json =
// {"enabled": true} to it, then
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite client -OverlayDir <that folder> [-PackDir <copy of pack>]
// One marker per run: the tests drive the same player.
//
// MARKERS: GGTEST|quest_book|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|quest_book|DONE.
// TEST AREA: Overworld band X 4608-4671, Y 98-112, Z 0-15 (it clears X 4636-4652 Z 4-12 Y 98-112, floor at Y 98).
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var TAG = 'GGTEST|quest_book|'
  var MARKER = 'kubejs/config/gg_test_quest_book.json'
  var REQ = 'ggTestQuestBookRequest'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var AREA = { x0: 4636, x1: 4652, y0: 98, y1: 112, z0: 4, z1: 12 }
  var START = { x: 4640.5, y: 99, z: 8.5 }
  var PICK_TARGET = { x: 4642, y: 99, z: 8 }
  var WALL = { x: 4646, y0: 99, y1: 101, z0: 7, z1: 9 }
  var WALL_SPOT = { x: 4644.5, y: 99, z: 8.5 }
  var EXPECTED = { welcome: 15, steam_age: 44 }
  var ARRIVAL = '69BDA9FBB0EB66F2'
  var TOOLBOX = '047B55ED9C952BC9'
  var TOOLS = [
    'gtceu:neutronium_hammer', 'gtceu:neutronium_wrench', 'gtceu:neutronium_file', 'gtceu:neutronium_saw',
    'gtceu:neutronium_screwdriver', 'gtceu:neutronium_wire_cutter', 'gtceu:neutronium_knife',
    'gtceu:neutronium_crowbar', 'gtceu:neutronium_butchery_knife', 'gtceu:neutronium_scythe',
    'gtceu:neutronium_pickaxe', 'gtceu:neutronium_shovel', 'gtceu:neutronium_axe', 'gtceu:neutronium_hoe',
    'gtceu:neutronium_sword', 'gtceu:neutronium_mining_hammer', 'gtceu:neutronium_spade',
    'gtceu:naquadah_mortar', 'gtceu:rubber_mallet', 'gtceu:rubber_plunger'
  ]
  var START_TICKS = 100
  var CLIENT_TIMEOUT = 1200
  var TEST_TIMEOUT = 9000

  var T = null

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
  }

  function emit(check, status, detail) {
    var line = TAG + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    if (!ok) T.failed.push(name)
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  function shared() {
    if (!global.ggQuestBook) global.ggQuestBook = new (Java.loadClass('java.util.concurrent.ConcurrentHashMap'))()
    return global.ggQuestBook
  }

  function sval(key) {
    var v = shared().get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function enabledByMarker() {
    try {
      var m = JsonIO.read(MARKER)
      return m !== null && m !== undefined && String(m.get('enabled')) === 'true'
    } catch (e) {
      return false
    }
  }

  function testPlayer(server) {
    var list = new (Java.loadClass('java.util.ArrayList'))(server.getPlayerList().getPlayers())
    for (var i = 0; i < list.size(); i++) {
      var p = list.get(i)
      if (T.playerName === '' || String(p.getName().getString()) === T.playerName) return p
    }
    return null
  }

  function iterate(collection, fn) {
    var it = collection.iterator()
    while (it.hasNext()) fn(it.next())
  }

  // quest ids are 64-bit: compare hex code strings, a JS number would lose precision
  function findQuest(file, code) {
    var found = null
    iterate(file.getAllChapters(), function (ch) {
      iterate(ch.getQuests(), function (q) { if (found === null && String(q.getCodeString()) === code) found = q })
    })
    return found
  }

  function invCount(p, id) {
    var inv = p.getInventory()
    var n = 0
    for (var i = 0; i < inv.getContainerSize(); i++) {
      var s = inv.getItem(i)
      if (!s.isEmpty() && String(s.getId()) === id) n += s.getCount()
    }
    return n
  }

  function invSlot(p, id) {
    var inv = p.getInventory()
    for (var i = 0; i < inv.getContainerSize(); i++) {
      var s = inv.getItem(i)
      if (!s.isEmpty() && String(s.getId()) === id) return i
    }
    return -1
  }

  // puts the tool in the selected hotbar slot and returns the stack the player now holds
  function hold(p, id) {
    var inv = p.getInventory()
    var slot = invSlot(p, id)
    if (slot < 0) return null
    var sel = inv.selected
    if (slot !== sel) {
      var cur = inv.getItem(sel)
      inv.setItem(sel, inv.getItem(slot))
      inv.setItem(slot, cur)
    }
    return p.getMainHandItem()
  }

  function setBlock(level, x, y, z, id) {
    level.getBlock(x, y, z).set(id)
  }

  function buildArea(level) {
    for (var x = AREA.x0; x <= AREA.x1; x++) {
      for (var z = AREA.z0; z <= AREA.z1; z++) {
        for (var y = AREA.y0; y <= AREA.y1; y++) setBlock(level, x, y, z, y === AREA.y0 ? 'minecraft:smooth_stone' : 'minecraft:air')
      }
    }
    setBlock(level, PICK_TARGET.x, PICK_TARGET.y, PICK_TARGET.z, 'minecraft:stone')
    for (var wy = WALL.y0; wy <= WALL.y1; wy++) {
      for (var wz = WALL.z0; wz <= WALL.z1; wz++) setBlock(level, WALL.x, wy, wz, 'minecraft:stone')
    }
  }

  function wallLeft(level) {
    var n = 0
    for (var wy = WALL.y0; wy <= WALL.y1; wy++) {
      for (var wz = WALL.z0; wz <= WALL.z1; wz++) if (!level.getBlock(WALL.x, wy, wz).getBlockState().isAir()) n++
    }
    return n
  }

  function go(phase) {
    T.phase = phase
    T.since = T.t
    T.once = false
  }

  function stepQuests(server, p) {
    var $SQF = Java.loadClass('dev.ftb.mods.ftbquests.quest.ServerQuestFile')
    var file = $SQF.INSTANCE
    var counts = {}
    iterate(file.getAllChapters(), function (ch) { counts[String(ch.getFilename())] = ch.getQuests().size() })
    Object.keys(EXPECTED).forEach(function (name) {
      check('chapter_' + name, counts[name] === EXPECTED[name], name + ': ' + counts[name] + ' quests loaded, expected ' + EXPECTED[name])
    })
    // TeamData.get(Player): BaseQuestFile#getOrCreateTeamData has UUID/Team/Entity overloads that Rhino can't choose between
    var team = Java.loadClass('dev.ftb.mods.ftbquests.quest.TeamData').get(p)
    var bread0 = invCount(p, 'minecraft:bread')
    ;[ARRIVAL, TOOLBOX].forEach(function (code) {
      var quest = findQuest(file, code)
      if (quest === null) {
        check('quest_' + code, false, 'quest ' + code + ' not found')
        return
      }
      server.runCommandSilent('ftbquests change_progress ' + T.playerName + ' complete ' + code)
      var done = team.isCompleted(quest)
      var claimed = 0
      iterate(quest.getRewards(), function (reward) {
        team.claimReward(p, reward, true)
        if (team.isRewardClaimed(p.getUuid(), reward)) claimed++
      })
      check('claim_' + code, done && claimed === quest.getRewards().size(), '"' + quest.getTitle().getString() + '": completed=' + done +
        ', rewards claimed ' + claimed + '/' + quest.getRewards().size())
    })
    check('arrival_items', invCount(p, 'minecraft:bread') >= bread0 + 64 && invCount(p, 'minecraft:torch') >= 16,
      'bread ' + invCount(p, 'minecraft:bread') + ', torches ' + invCount(p, 'minecraft:torch') + ' in the inventory')
    var missing = TOOLS.filter(function (id) { return invSlot(p, id) < 0 })
    check('toolbox_items', missing.length === 0, missing.length === 0 ? 'all ' + TOOLS.length + ' tools in the inventory' : 'missing ' + missing.join(', '))
  }

  function stepNbt(p) {
    var $ToolHelper = Java.loadClass('com.gregtechceu.gtceu.api.item.tool.ToolHelper')
    var bad = []
    TOOLS.forEach(function (id) {
      var slot = invSlot(p, id)
      if (slot < 0) return
      var stack = p.getInventory().getItem(slot)
      var expected = stack.getItem().get().getNbt()
      expected.putBoolean('Unbreakable', true)
      var tag = stack.getNbt()
      if (tag === null || !expected.equals(tag)) bad.push(id + ' has ' + tag + ', crafted+Unbreakable is ' + expected)
      if (stack.isDamageableItem()) bad.push(id + ' is damageable')
      var copy = stack.copy()
      $ToolHelper.damageItem(copy, p, 100)
      if (copy.getDamageValue() !== 0) bad.push(id + ' took ' + copy.getDamageValue() + ' damage')
    })
    check('toolbox_nbt', bad.length === 0, bad.length === 0 ? 'every tool: the NBT of a crafted GTM tool + Unbreakable, no damage from ToolHelper.damageItem' : bad.join('; '))
  }

  // ServerPlayer#gameMode (SRG f_8941_): the path a real left-click ends in
  function gameMode(p) {
    var gm = p.gameMode
    if (gm === undefined || gm === null || typeof gm.destroyBlock !== 'function') gm = p.f_8941_
    return gm
  }

  function stepPickaxe(p, level) {
    var BlockPos = Java.loadClass('net.minecraft.core.BlockPos')
    var pick = hold(p, 'gtceu:neutronium_pickaxe')
    if (pick === null) { check('pickaxe_mines', false, 'no neutronium pickaxe in the inventory'); return }
    var cobble0 = invCount(p, 'minecraft:cobblestone')
    var ok = gameMode(p).destroyBlock(new BlockPos(PICK_TARGET.x, PICK_TARGET.y, PICK_TARGET.z))
    var gone = level.getBlock(PICK_TARGET.x, PICK_TARGET.y, PICK_TARGET.z).getBlockState().isAir()
    var held = p.getMainHandItem()
    check('pickaxe_mines', ok && gone && String(held.getId()) === 'gtceu:neutronium_pickaxe' && held.getDamageValue() === 0,
      'destroyBlock=' + ok + ', stone gone=' + gone + ', pickaxe damage ' + held.getDamageValue())
    check('pickaxe_magnet', invCount(p, 'minecraft:cobblestone') > cobble0, 'cobblestone in the inventory ' + cobble0 + ' -> ' + invCount(p, 'minecraft:cobblestone'))
  }

  function stepHammer(p, level) {
    var BlockPos = Java.loadClass('net.minecraft.core.BlockPos')
    var hammer = hold(p, 'gtceu:neutronium_mining_hammer')
    if (hammer === null) { check('mining_hammer_aoe', false, 'no neutronium mining hammer in the inventory'); return }
    var before = wallLeft(level)
    var ok = gameMode(p).destroyBlock(new BlockPos(WALL.x, WALL.y0 + 1, WALL.z0 + 1))
    var after = wallLeft(level)
    var held = p.getMainHandItem()
    check('mining_hammer_aoe', ok && before === 9 && after === 0 && held.getDamageValue() === 0,
      'wall blocks ' + before + ' -> ' + after + ' with one break (destroyBlock=' + ok + '), mining hammer damage ' + held.getDamageValue())
  }

  function stepCraft(p) {
    var slot = invSlot(p, 'gtceu:neutronium_hammer')
    if (slot < 0) { check('hammer_crafting', false, 'no neutronium hammer'); return }
    var stack = p.getInventory().getItem(slot)
    var rem = stack.getItem().getCraftingRemainingItem(stack)
    check('hammer_crafting', !rem.isEmpty() && String(rem.getId()) === 'gtceu:neutronium_hammer' && rem.getDamageValue() === 0,
      'crafting remainder ' + rem + ' with damage ' + rem.getDamageValue())
  }

  function step(server) {
    var p = testPlayer(server)
    if (p === null) {
      check('player_present', false, 'the test player left during ' + T.phase)
      finish(server)
      return
    }
    var level = p.getLevel()
    var age = T.t - T.since

    if (T.phase === 'setup') {
      T.playerName = String(p.getName().getString())
      buildArea(level)
      p.teleportTo('minecraft:overworld', START.x, START.y, START.z, -90, 0)
      note('setup', 'player ' + T.playerName + ' at ' + START.x + ' ' + START.y + ' ' + START.z)
      go('settle')
      return
    }
    if (T.phase === 'settle') {
      if (age < START_TICKS) return
      stepQuests(server, p)
      go('nbt')
      return
    }
    if (T.phase === 'nbt') {
      if (age < 20) return
      stepNbt(p)
      shared().put('tooltipResult', '')
      shared().put('tooltipToken', 't' + T.t)
      go('tooltips')
      return
    }
    if (T.phase === 'tooltips') {
      var r = sval('tooltipResult')
      if (r === '' && age < CLIENT_TIMEOUT) return
      check('client_tooltips', r.indexOf('PASS') === 0, r === '' ? 'the client never answered' : r)
      go('pickaxe')
      return
    }
    if (T.phase === 'pickaxe') {
      if (age < 10) return
      stepPickaxe(p, level)
      p.teleportTo('minecraft:overworld', WALL_SPOT.x, WALL_SPOT.y, WALL_SPOT.z, -90, 0)
      go('hammer')
      return
    }
    if (T.phase === 'hammer') {
      if (age < 20) return
      stepHammer(p, level)
      stepCraft(p)
      shared().put('bookResult', '')
      shared().put('bookToken', 'b' + T.t)
      go('book')
      return
    }
    if (T.phase === 'book') {
      var b = sval('bookResult')
      if (b === '' && age < CLIENT_TIMEOUT) return
      check('client_book', b.indexOf('PASS') === 0, b === '' ? 'the client never answered' : b)
      finish(server)
    }
  }

  function finish(server) {
    if (T === null || T.finished) return
    T.finished = true
    check('all', T.failed.length === 0, T.failed.length === 0 ? 'book loads, rewards claimed, toolbox tools unbreakable and working' : 'failed: ' + T.failed.join(', '))
    shared().put('hold', false)
    global[REQ + 'Done'] = true
    console.info(TAG + 'DONE')
  }

  function onTick(server) {
    if (global[REQ] && T === null && Date.now() - LOADED_AT >= QUIET_MS && Date.now() >= Number(global[REQ + 'At'] || 0)) {
      global[REQ] = false
      T = { t: 0, tick0: server.getTickCount(), phase: 'setup', since: 0, failed: [], finished: false, playerName: '' }
    }
    if (T === null || T.finished) return
    T.t = server.getTickCount() - T.tick0
    if (T.t > TEST_TIMEOUT) {
      check('timeout', false, 'the test ran ' + T.t + ' ticks; phase ' + T.phase)
      finish(server)
      return
    }
    try {
      step(server)
    } catch (e) {
      check('step', false, 'exception in ' + T.phase + ': ' + e)
      finish(server)
    }
  }

  ServerEvents.tick(function (event) {
    onTick(event.server)
  })

  PlayerEvents.loggedIn(function (event) {
    if (global[REQ + 'Done'] || T !== null || !enabledByMarker()) return
    global[REQ + 'At'] = Date.now() + 5000
    global[REQ] = true
    shared().put('hold', true)
    shared().put('tooltipToken', '')
    shared().put('bookToken', '')
    note('armed', 'player ' + event.player.getName().getString() + ' joined and ' + MARKER + ' is present: the quest book test starts in a few seconds')
  })
})()
