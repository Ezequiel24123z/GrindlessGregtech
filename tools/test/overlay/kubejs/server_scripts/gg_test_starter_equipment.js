// priority: -7024
// TEST-ONLY, opt-in, FRESH DISPOSABLE CLIENT WORLD ONLY. Paired with the client script.
// Arrival rewards + the gifted GTM prospector: right-click opens GTM's prospecting GUI, the scan
// drains energy, and the veins it finds reach the map mod's cache (Xaero ore layer).
// One fixture vein is added to this disposable world's ServerCache; never clear the native cache.
;(function () {
  var MARKER = 'kubejs/config/gg_test_starter_equipment.json'
  var TAG = 'GGTEST|starter_equipment|'
  var LEGACY = ['21A6FB493B3D6DA8', '4FE190B37FB472CA']
  var TOOLS = ['pickaxe', 'axe', 'shovel', 'hoe']
  var GIFT = 'gtceu:prospector.hv'
  var FULL_CHARGE = 1600000
  var TICK_COST = 32 // GTM: V[HV] / 16 per GUI tick
  var request = null
  var serverTicks = 0

  function shared() {
    if (!global.ggStarterEquipment) global.ggStarterEquipment = new (Java.loadClass('java.util.concurrent.ConcurrentHashMap'))()
    return global.ggStarterEquipment
  }

  function check(name, ok, detail) {
    if (!ok) shared().put('failed', true)
    console.info(TAG + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
  }

  function requireProof(name, ok, detail) {
    check(name, ok, detail)
    if (!ok) throw new Error(name + ': ' + detail)
  }

  function finish() {
    request.done = true
    try {
      request.player.setYaw(request.yaw)
      request.player.setPitch(request.pitch)
      request.player.getInventory().selected = request.selected
    } catch (e) { check('server_cleanup', false, String(e)) }
    shared().put('hold', false)
    shared().put('serverDone', true)
    if (shared().putIfAbsent('doneLogged', true) === null) console.info(TAG + 'DONE')
  }

  function electric(stack) {
    return Java.loadClass('com.gregtechceu.gtceu.api.capability.GTCapabilityHelper').getElectricItem(stack)
  }

  function gift(player) {
    var inv = player.getInventory()
    for (var i = 0; i < inv.getContainerSize(); i++) {
      var stack = inv.getItem(i)
      if (!stack.isEmpty() && String(stack.getId()) === GIFT) return { stack: stack, slot: i }
    }
    throw new Error('native HV prospector gift missing')
  }

  function plain(stack) {
    var tag = stack.getNbt()
    return tag === null || (!tag.contains('grindless_starter_prospector') && !tag.contains('Infinite'))
  }

  function restoreGift(player) {
    var found = gift(player)
    var original = electric(found.stack)
    requireProof('gift_native_full', count(player, GIFT) === 1 && plain(found.stack) && original !== null &&
      Number(original.getCharge()) === FULL_CHARGE && Number(original.getMaxCharge()) === FULL_CHARGE &&
      Number(original.getTier()) === 3,
      'one ordinary GTM HV prospector, no marker or infinite flag, fully charged (' + FULL_CHARGE + ' EU)')
    var ItemStack = Java.loadClass('net.minecraft.world.item.ItemStack')
    var CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag')
    var restored = ItemStack.of(found.stack.save(new CompoundTag()))
    var cap = electric(restored)
    requireProof('gift_save_load', String(restored.getId()) === GIFT && restored.getCount() === 1 &&
      plain(restored) && cap !== null && Number(cap.getCharge()) === FULL_CHARGE,
      'ItemStack.of(save(NBT)) retains the full charge and stays ordinary')
    equipGift(player, found.slot, restored)
  }

  function equipGift(player, slot, stack) {
    var inv = player.getInventory()
    inv.setItem(slot, stack)
    var displaced = inv.getItem(0)
    inv.setItem(0, stack)
    if (slot !== 0) inv.setItem(slot, displaced)
    inv.selected = 0
    inv.setChanged()
    player.inventoryMenu.broadcastChanges()
    requireProof('gift_equipped', String(player.getMainHandItem().getId()) === GIFT &&
      count(player, GIFT) === 1, 'real reward equipped in hotbar slot zero')
  }

  function count(player, id) {
    var result = 0
    var inv = player.getInventory()
    for (var i = 0; i < inv.getContainerSize(); i++) {
      var stack = inv.getItem(i)
      if (!stack.isEmpty() && String(stack.getId()) === id) result += stack.getCount()
    }
    return result
  }

  function arrival() {
    var chapters = Java.loadClass('dev.ftb.mods.ftbquests.quest.ServerQuestFile').INSTANCE.getAllChapters()
    for (var i = 0; i < chapters.size(); i++) {
      var quests = chapters.get(i).getQuests()
      for (var j = 0; j < quests.size(); j++) {
        if (String(quests.get(j).getCodeString()) === '69BDA9FBB0EB66F2') return quests.get(j)
      }
    }
    throw new Error('Arrival quest is missing')
  }

  function claim(player) {
    var quest = arrival()
    var team = Java.loadClass('dev.ftb.mods.ftbquests.quest.TeamData').get(player)
    var rewards = quest.getRewards()
    var name = String(player.getName().getString())
    player.server.runCommandSilent('ftbquests change_progress ' + name + ' complete 69BDA9FBB0EB66F2')
    var bread = count(player, 'minecraft:bread')
    var torches = count(player, 'minecraft:torch')
    for (var i = 0; i < rewards.size(); i++) {
      var reward = rewards.get(i)
      if (LEGACY.indexOf(String(reward.getCodeString())) >= 0) team.claimReward(player, reward, true)
    }
    check('legacy_save', team.isCompleted(quest), 'Arrival completed; original bread and torches already claimed')
    team.saveIfChanged()
    team.deserializeNBT(team.serializeNBT())
    check('legacy_save_loaded', team.isCompleted(quest), 'completed Arrival survives the native FTB save/load path')
    for (var j = 0; j < rewards.size(); j++) team.claimReward(player, rewards.get(j), true)
    check('food_top_up', count(player, 'minecraft:bread') === bread + 64, 'bread=' + count(player, 'minecraft:bread'))
    check('torches_preserved', count(player, 'minecraft:torch') === torches + 16, 'torches=' + count(player, 'minecraft:torch'))
    var EnchantmentHelper = Java.loadClass('net.minecraft.world.item.enchantment.EnchantmentHelper')
    var efficiency = Java.loadClass('net.minecraft.world.item.enchantment.Enchantments').BLOCK_EFFICIENCY
    var inv = player.getInventory()
    TOOLS.forEach(function (tool) {
      var id = 'minecraft:diamond_' + tool
      var valid = count(player, id) === 1
      for (var k = 0; k < inv.getContainerSize(); k++) {
        var stack = inv.getItem(k)
        if (!stack.isEmpty() && String(stack.getId()) === id) {
          valid = valid && EnchantmentHelper.getItemEnchantmentLevel(efficiency, stack) === 5
          var restored = Java.loadClass('net.minecraft.world.item.ItemStack').of(stack.save(new (Java.loadClass('net.minecraft.nbt.CompoundTag'))()))
          valid = valid && EnchantmentHelper.getItemEnchantmentLevel(efficiency, restored) === 5
        }
      }
      check('diamond_' + tool, valid, 'one real enchanted reward, Efficiency V survives ItemStack save/load')
    })
    team.saveIfChanged()
    team.deserializeNBT(team.serializeNBT())
    for (var r = 0; r < rewards.size(); r++) {
      team.claimReward(player, rewards.get(r), true)
      check('claimed_' + rewards.get(r).getCodeString(), team.isRewardClaimed(player.getUuid(), rewards.get(r)), 'FTB claim flag retained')
    }
    check('no_duplicate_food', count(player, 'minecraft:bread') === bread + 64 &&
      count(player, 'minecraft:torch') === torches + 16, 'repeated claims do not duplicate food or torches')
    TOOLS.forEach(function (tool) {
      check('no_duplicate_' + tool, count(player, 'minecraft:diamond_' + tool) === 1, 'repeated claims do not duplicate tools')
    })
    check('no_duplicate_scanner', count(player, GIFT) === 1 && gift(player).stack.getCount() === 1,
      'native FTB serializeNBT/deserializeNBT and reclaim retain exactly one gift')
    shared().put('rewardsDone', true)
  }

  function describe(vein, name) {
    var pos = vein.center()
    return { name: name, id: String(vein.id()), x: pos.getX(), y: pos.getY(), z: pos.getZ() }
  }

  function prepare(player) {
    if (request.pendingOnly) {
      // Real FTB reward: claim only the gift needed for the GUI proof.
      var quest = arrival()
      var team = Java.loadClass('dev.ftb.mods.ftbquests.quest.TeamData').get(player)
      player.server.runCommandSilent('ftbquests change_progress ' + player.getName().getString() + ' complete 69BDA9FBB0EB66F2')
      var rewards = quest.getRewards()
      for (var r = 0; r < rewards.size(); r++) {
        if (String(rewards.get(r).getCodeString()) === '6325EC29C56BD824') team.claimReward(player, rewards.get(r), true)
      }
      var found = gift(player)
      requireProof('map_gift', count(player, GIFT) === 1 && plain(found.stack) &&
        Number(electric(found.stack).getCharge()) === FULL_CHARGE, 'actual full Arrival gift')
      equipGift(player, found.slot, found.stack)
    } else restoreGift(player)
    var ServerCache = Java.loadClass('com.gregtechceu.gtceu.integration.map.cache.server.ServerCache')
    var GridPos = Java.loadClass('com.gregtechceu.gtceu.integration.map.cache.GridPos')
    var Metadata = Java.loadClass('com.gregtechceu.gtceu.api.data.worldgen.ores.GeneratedVeinMetadata')
    var BlockPos = Java.loadClass('net.minecraft.core.BlockPos')
    var ChunkPos = Java.loadClass('net.minecraft.world.level.ChunkPos')
    var level = player.getLevel()
    var dim = level.getDimensionKey()
    var center = player.blockPosition()
    var nearby = ServerCache.instance.getNearbyVeins(dim, center, 256)
    requireProof('natural_cached_vein', !nearby.isEmpty(),
      'existing generated-terrain cache entries within 256 blocks=' + nearby.size())
    var natural = nearby.get(0)
    // The GUI scan calls prospectAllInChunk for the player's own chunk, so a vein stored there
    // must be revealed on the client map. Its centre stays inside the player's chunk.
    var cx = center.getX() >> 4
    var cz = center.getZ() >> 4
    var pos = new BlockPos((cx << 4) + 8, natural.center().getY() + 1, (cz << 4) + 8)
    var vein = new Metadata(natural.id(), new ChunkPos(cx, cz), pos, natural.definition(), false)
    var added = ServerCache.instance.addVein(dim, GridPos.blockToGridCoords(pos.getX()), GridPos.blockToGridCoords(pos.getZ()), vein)
    requireProof('fixture_metadata_inserted', added && ServerCache.instance.getNearbyVeins(dim, center, 64).contains(vein),
      'one fixture vein stored in the player chunk of this disposable world')
    request.center = center
    request.round = 1
    request.phase = 'scan'
    request.chargeBefore = Number(electric(player.getMainHandItem()).getCharge())
    shared().put('plan', JSON.stringify({ entries: [describe(vein, 'fixture')], dimension: String(dim.location()),
      center: { x: center.getX(), y: center.getY(), z: center.getZ() } }))
    nextScan()
  }

  function nextScan() {
    request.guiSeen = false
    shared().put('scanToken', String(request.round))
  }

  function verifyScan(player) {
    var token = String(request.round)
    if (String(shared().get('clicked')) !== token) return
    if (String(shared().get('scanResultToken')) !== token) return
    var result = JSON.parse(String(shared().get('scanResult')))
    requireProof('scan_' + token + '_client', result.ok, result.detail)
    var charge = Number(electric(player.getMainHandItem()).getCharge())
    var spent = request.chargeBefore - charge
    requireProof('scan_' + token + '_energy', String(player.getMainHandItem().getId()) === GIFT &&
      count(player, GIFT) === 1 && spent > 0 && spent % TICK_COST === 0 && charge > 0,
      'GTM drained ' + spent + ' EU (multiple of ' + TICK_COST + ' per GUI tick); ' + charge + ' EU left')
    request.chargeBefore = charge
    requireProof('scan_' + token + '_stationary', player.blockPosition().equals(request.center),
      'player did not move during the scan')
    request.phase = 'cooldown'
    request.completedAt = serverTicks
  }


  function arm(player, pendingOnly) {
    if (request !== null) throw new Error('starter fixture already armed')
    shared().clear()
    request = { player: player, at: Date.now() + 10000, deadline: Date.now() + 120000,
      phase: 'rewards', pendingOnly: pendingOnly, yaw: player.getYaw(), pitch: player.getPitch(),
      selected: player.getInventory().selected }
    shared().put('hold', true)
  }

  global.ggTestStarterEquipmentStart = function (player) { arm(player, true) }

  PlayerEvents.loggedIn(function (event) {
    var integrated = JsonIO.read('kubejs/config/gg_test_v071_integration.json')
    if (integrated && String(integrated.enabled) === 'true') return
    var marker = JsonIO.read(MARKER)
    if (!marker || String(marker.get('enabled')) !== 'true' || request !== null) return
    arm(event.player, false)
  })

  ServerEvents.tick(function () {
    serverTicks++
    if (request === null || request.done) return
    try {
      requireAlive()
      if (Date.now() < request.at) return
      if (request.phase === 'rewards') {
        if (!request.pendingOnly) claim(request.player)
        prepare(request.player)
      } else if (request.phase === 'scan') {
        verifyScan(request.player)
      } else if (request.phase === 'cooldown' && serverTicks - request.completedAt >= 12 &&
          !request.player.getCooldowns().isOnCooldown(request.player.getMainHandItem().getItem())) {
        if (!request.pendingOnly && request.round < 2) {
          request.round++
          request.phase = 'scan'
          nextScan()
        } else {
          shared().put('mapRequested', true)
          request.phase = 'map'
        }
      } else if (request.phase === 'map' && shared().get('mapDone')) {
        requireProof('gui_screenshot', String(shared().get('mapResult')) === 'PASS',
          String(shared().get('mapDetail')))
        requireProof('map_cache_complete', String(shared().get('codecDone')) === 'true',
          'client map cache and Xaero ore layer held the revealed vein after every scan')
        check('paired_proof', !shared().get('failed'),
          (request.pendingOnly ? 'one GUI scan' : 'reward claim + two GUI scans') +
          ' + GTM prospecting GUI screenshot + energy drained + vein on the map')
        finish()
      }
    } catch (e) {
      // The client already logged its terminal failure; acknowledge it without a second FAIL/DONE.
      if (!shared().get('clientAborted')) check('proof_exception', false, String(e))
      finish()
    }
  })

  function requireAlive() {
    if (shared().get('cancel')) throw new Error('integration cancelled: ' + shared().get('cancel'))
    if (shared().get('clientAborted')) throw new Error('client aborted: ' + shared().get('clientAborted'))
    if (Date.now() > request.deadline) throw new Error('120s paired proof timeout in phase ' + request.phase)
  }
})()
