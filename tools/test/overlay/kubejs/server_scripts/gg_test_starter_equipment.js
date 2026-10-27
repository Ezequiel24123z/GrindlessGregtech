// priority: -7024
// TEST-ONLY, opt-in, FRESH DISPOSABLE CLIENT WORLD ONLY. Paired with the client script.
// Arrival migration + native gift right-click -> native Xaero markers (not the block-scanning GUI).
// Fixtures are metadata only and intentionally persist in this disposable world's ServerCache.
// Never removeAllInChunk/clear the native cache: that would also destroy natural vein entries.
;(function () {
  var MARKER = 'kubejs/config/gg_test_starter_equipment.json'
  var TAG = 'GGTEST|starter_equipment|'
  var LEGACY = ['21A6FB493B3D6DA8', '4FE190B37FB472CA']
  var TOOLS = ['pickaxe', 'axe', 'shovel', 'hoe']
  var GIFT = 'gtceu:prospector.hv'
  var GIFT_TAG = 'grindless_starter_prospector'
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
      if (!stack.isEmpty() && String(stack.getId()) === GIFT &&
          stack.getNbt() !== null && stack.getNbt().getBoolean(GIFT_TAG)) return { stack: stack, slot: i }
    }
    throw new Error('marked native HV gift missing')
  }

  function restoreGift(player) {
    var found = gift(player)
    var original = electric(found.stack)
    requireProof('gift_native_empty', count(player, GIFT) === 1 && original !== null &&
      Number(original.getCharge()) === 0 && Number(original.getTier()) === 3 &&
      Number(original.getMaxCharge()) > 0 && !original.canProvideChargeExternally(),
      'one native HV scanner; zero EU; native capability is not a battery')
    var ItemStack = Java.loadClass('net.minecraft.world.item.ItemStack')
    var CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag')
    var restored = ItemStack.of(found.stack.save(new CompoundTag()))
    var cap = electric(restored)
    requireProof('gift_save_load', String(restored.getId()) === GIFT && restored.getCount() === 1 &&
      restored.getNbt().getBoolean(GIFT_TAG) && cap !== null && Number(cap.getCharge()) === 0 &&
      Number(cap.getMaxCharge()) === Number(original.getMaxCharge()) &&
      Number(cap.getTier()) === Number(original.getTier()) &&
      Number(cap.getTransferLimit()) === Number(original.getTransferLimit()) && !cap.canProvideChargeExternally(),
      'ItemStack.of(save(NBT)) retains marker, empty charge and native capability parameters')
    // Refusal on zero EU alone is vacuous: energize a COPY, never the actual gift.
    var probe = restored.copy()
    var probeCap = electric(probe)
    var charged = Number(probeCap.charge(10000, 3, true, false))
    var before = Number(probeCap.getCharge())
    var simulated = Number(probeCap.discharge(1, 3, true, true, true))
    var extracted = Number(probeCap.discharge(1, 3, true, true, false))
    requireProof('gift_external_discharge', charged > 0 && before > 0 &&
      Number(probeCap.discharge(1, 3, true, false, true)) === 1 &&
      !probeCap.canProvideChargeExternally() && simulated === 0 && extracted === 0 &&
      Number(probeCap.getCharge()) === before,
      'charged saved-copy internal discharge works; simulated and actual external discharge refuse')
    // Replace, do not duplicate, the actual reward with its native save/load result.
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
    requireProof('gift_equipped', player.getMainHandItem().getNbt().getBoolean(GIFT_TAG) &&
      count(player, GIFT) === 1, 'real marked reward equipped in hotbar slot zero')
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
    check('legacy_save', team.isCompleted(quest) && count(player, 'minecraft:bread') === bread + 8 &&
      count(player, 'minecraft:torch') === torches + 16, 'Arrival completed; original bread and torches already claimed')
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
      'native FTB serializeNBT/deserializeNBT and reclaim retain exactly one marked gift')
    shared().put('rewardsDone', true)
  }

  function describe(vein, name, included) {
    var pos = vein.center()
    return { name: name, included: included, id: String(vein.id()),
      x: pos.getX(), y: pos.getY(), z: pos.getZ(), depleted: vein.depleted() }
  }

  function prepare(player) {
    if (request.pendingOnly) {
      // Real FTB reward, not a synthetic scanner. Prior 77-check migration/range
      // proof is reused: claim only the gift needed for the pending native map proof.
      var quest = arrival()
      var team = Java.loadClass('dev.ftb.mods.ftbquests.quest.TeamData').get(player)
      player.server.runCommandSilent('ftbquests change_progress ' + player.getName().getString() + ' complete 69BDA9FBB0EB66F2')
      var rewards = quest.getRewards()
      for (var r = 0; r < rewards.size(); r++) {
        if (String(rewards.get(r).getCodeString()) === '6325EC29C56BD824') team.claimReward(player, rewards.get(r), true)
      }
      var found = gift(player)
      requireProof('map_gift', count(player, GIFT) === 1 && Number(electric(found.stack).getCharge()) === 0,
        'actual marked empty Arrival gift; prior reward/save-load/external-energy proof reused')
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
    // Cache lookup at the real settled spawn. Do not construct terrain or search by loading chunks.
    var nearby = ServerCache.instance.getNearbyVeins(dim, center, 256)
    requireProof('natural_cached_vein', !nearby.isEmpty(),
      'spawn radius=256 existing generated-terrain cache entries=' + nearby.size() + '; no forced worldgen fallback')
    var natural = null
    for (var n = 0; n < nearby.size(); n++) {
      if (!nearby.get(n).depleted()) {
        natural = nearby.get(n)
        break
      }
    }
    requireProof('natural_usable_vein', natural !== null, 'at least one undepleted natural cache entry required')
    var foreignLevel = player.server.getLevel('grindless:void')
    requireProof('foreign_dimension', foreignLevel !== null, 'existing native grindless:void level required')
    var foreignDim = foreignLevel.getDimensionKey()
    var entries = [describe(natural, 'natural', true)]
    var offsets = request.pendingOnly ? [] : [[256, 0], [-256, 0], [0, 256], [0, -256],
      [256, 256], [256, -256], [-256, 256], [-256, -256],
      [257, 0], [-257, 0], [0, 257], [0, -257],
      [257, 257], [257, -257], [-257, 257], [-257, -257]]
    request.chunks = []
    var fixtures = []
    var inserted = true
    var seenChunks = {}
    var unloaded = 0
    for (var i = 0; i < offsets.length; i++) {
      var x = center.getX() + offsets[i][0]
      var z = center.getZ() + offsets[i][1]
      // Distinct centers, even where a natural vein occupies the same x/z.
      var pos = new BlockPos(x, natural.center().getY() + i + 1, z)
      var vein = new Metadata(natural.id(), new ChunkPos(x >> 4, z >> 4), pos, natural.definition(), false)
      var added = ServerCache.instance.addVein(dim, GridPos.blockToGridCoords(x), GridPos.blockToGridCoords(z), vein)
      inserted = inserted && added
      fixtures.push(vein)
      entries.push(describe(vein, 'boundary_' + offsets[i][0] + '_' + offsets[i][1], i < 8))
      var chunkKey = (x >> 4) + ',' + (z >> 4)
      if (!seenChunks[chunkKey]) {
        seenChunks[chunkKey] = true
        var absent = level.getChunkSource().getChunkNow(x >> 4, z >> 4) === null
        request.chunks.push({ x: x >> 4, z: z >> 4, absent: absent })
        if (absent) unloaded++
      }
    }
    // Same horizontal scan coordinates in another dimension, unique Y so leakage is observable.
    var foreignPos = new BlockPos(center.getX() + 256, natural.center().getY() - 1, center.getZ())
    var foreign = new Metadata(natural.id(), new ChunkPos(foreignPos.getX() >> 4, foreignPos.getZ() >> 4),
      foreignPos, natural.definition(), false)
    var foreignAdded = ServerCache.instance.addVein(foreignDim, GridPos.blockToGridCoords(foreignPos.getX()),
      GridPos.blockToGridCoords(foreignPos.getZ()), foreign)
    var foreignEntry = describe(foreign, 'foreign_dimension', false)
    // Negative client assertions must not pass because their fixture was never inserted.
    var allFixtures = ServerCache.instance.getNearbyVeins(dim, center, 257)
    for (var f = 0; f < fixtures.length; f++) inserted = inserted && allFixtures.contains(fixtures[f])
    requireProof('fixture_metadata_inserted', inserted && foreignAdded && allFixtures.contains(natural) &&
      ServerCache.instance.getNearbyVeins(foreignDim, center, 256).contains(foreign),
      (request.pendingOnly ? 'natural entry and foreign codec-isolation fixture' : 'all 16 boundary entries (including excluded 257s) and foreign-only entry') + ' exist in native cache')
    if (!request.pendingOnly) requireProof('unloaded_boundary_before', unloaded > 0,
      'getChunkNow-only boundary probe: ' + unloaded + '/' + request.chunks.length + ' chunks initially unloaded')
    console.info(TAG + 'fixture_lifetime|NOTE|metadata persists ONLY in this fresh disposable world; no broad native cache cleanup')
    request.center = center
    request.level = level
    request.round = 1
    request.phase = 'scan'
    shared().put('plan', JSON.stringify({ entries: entries, foreign: foreignEntry,
      dimension: String(dim.location()), foreignDimension: String(foreignDim.location()),
      center: { x: center.getX(), y: center.getY(), z: center.getZ() } }))
    nextScan()
  }

  function nextScan() {
    request.sawCooldown = false
    shared().put('scanToken', String(request.round))
  }

  function verifyScan(player) {
    var token = String(request.round)
    if (String(shared().get('clicked')) !== token) return
    if (player.getCooldowns().isOnCooldown(player.getMainHandItem().getItem())) request.sawCooldown = true
    if (String(shared().get('scanResultToken')) !== token) return
    var result = JSON.parse(String(shared().get('scanResult')))
    requireProof('scan_' + token + '_client', result.ok, result.detail)
    requireProof('scan_' + token + '_latency', result.ms <= 2000 && result.ticks <= 10,
      'actual keyUse -> all expected visible Xaero records: wall_ms=' + result.ms + ', client_ticks=' + result.ticks)
    requireProof('scan_' + token + '_native_empty', request.sawCooldown &&
      String(player.getMainHandItem().getId()) === GIFT &&
      player.getMainHandItem().getNbt().getBoolean(GIFT_TAG) &&
      Number(electric(player.getMainHandItem()).getCharge()) === 0 && count(player, GIFT) === 1,
      'real production 10-tick cooldown observed; restored gift still empty and unique')
    requireProof('scan_' + token + '_stationary', player.blockPosition().equals(request.center),
      'all boundary coordinates remain relative to actual click origin')
    var stillUnloaded = true
    var probes = []
    request.chunks.forEach(function (chunk) {
      if (chunk.absent) {
        var absent = request.level.getChunkSource().getChunkNow(chunk.x, chunk.z) === null
        stillUnloaded = stillUnloaded && absent
        probes.push(chunk.x + ',' + chunk.z + '=' + (absent ? 'unloaded' : 'LOADED'))
      }
    })
    if (!request.pendingOnly) requireProof('scan_' + token + '_no_chunk_load', stillUnloaded, probes.join(';'))
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
        if (!request.pendingOnly && request.round < 3) {
          request.round++
          request.phase = 'scan'
          nextScan()
        } else {
          shared().put('mapRequested', true)
          request.phase = 'map'
        }
      } else if (request.phase === 'map' && shared().get('mapDone')) {
        requireProof('real_map_screenshot', String(shared().get('mapResult')) === 'PASS',
          String(shared().get('mapDetail')))
        requireProof('native_cache_codec_complete', String(shared().get('codecDone')) === 'true',
          'client native in-memory codec/marker rehydration assertions completed after map capture')
        check('paired_proof', !shared().get('failed'),
          (request.pendingOnly ? 'one natural reveal; prior reward/boundary proof reused' : 'reward migration + three zero-charge native clicks') +
          ' + actual map PNG + native IN-MEMORY codec/marker rehydration (not disk/reconnect)')
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
