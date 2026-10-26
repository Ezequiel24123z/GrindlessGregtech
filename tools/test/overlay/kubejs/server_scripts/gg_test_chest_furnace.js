// Gregtech Grindless - test overlay (not shipped with the pack)
//
// REAL-PLAYER test of the stronger chest and furnace tiers (client suite only; table kubejs/data/grindless/tables/chest_furnace_tiers.json).
// What it settles that the static contract (tools/analysis/test/chest-furnace-tiers.test.mjs) cannot:
//   migration     startup_scripts/grindless/integration/sophisticatedstorage_tiers.js ran on Forge's ServerAboutToStartEvent in the real
//                 runtime (Rhino's boxing, the correcting guard, ForgeEvents): the world's sophisticatedstorage-server.toml, created with
//                 the mod's stock values like every pre-update world, holds the pack values as java.lang.Integer, live and on disk (read
//                 back with NightConfig, and Forge's own spec accepts it as is: the next start loads it without a correction); a second
//                 run changes nothing.
//   old_world     an iron chest, an iron barrel and a limited iron barrel built and filled under the STOCK values (the live config is
//                 set back to them first, the way v0.7.0 had it), serialized; the migration raises the config; native block entities are
//                 recreated from that NBT in the already loaded chunk: they grow to the pack's size, keep every stack (NBT
//                 included) and their upgrade; a second native block-entity NBT reload keeps the new size. Automation sees the new slots (Forge's item
//                 handler capability puts items in a slot past the old size and extracts them from it; Sophisticated Core honours the slot index of
//                 a simulated insert only, a real insert goes to matching stacks, then the first empty slot) and the limited barrel takes twice as many.
//   tier_upgrade  iron_to_gold_tier_upgrade used on the full, migrated chest: a gold chest of 162 slots / 6 upgrade slots with everything
//                 still inside. The item acts in Forge's onItemUseFirst, which a real right-click runs before the chest's own use (no sneaking).
//   gui           real right-clicks (the client holds the use key, crosshair on the chest; no server fallback) on the gold chest (162 slots)
//                 and a netherite chest (180): the client's menu shows the pack's slot and upgrade counts, every item and the upgrade; one
//                 screenshot each, confirmed written by its callback (kubejs/exported/gg_chest_*.png).
//   furnaces      Iron Furnaces' live config is the shipped file (which Forge's spec accepts as is: it is never rewritten); an iron and a
//                 netherite furnace smelt one coal's worth of an ordinary 200-tick smelting recipe at 80 and 2 ticks per item, with
//                 exactly one coal; an iron furnace holding items and a speed augment becomes a gold furnace with upgrade_gold and keeps
//                 them, cooking at 60 / 2 = 30 ticks; the FE augments, the heater and the Million furnace have no recipe and are hidden.
//
// HOW TO RUN (client suite only). Copy tools\test\overlay to a scratch folder, add kubejs\config\gg_test_chest_furnace.json =
// {"enabled": true} to it, then
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite client -OverlayDir <that folder> -Slots 1
// Partner: client_scripts/gg_test_chest_furnace.js (world folder name, clicks, the open screen, screenshots).
// MARKERS: GGTEST|chest_furnace|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|chest_furnace|DONE.
// TEST AREA: verified air high above an ALREADY loaded/generated chunk next to the player. No chunk loads, generation or tickets.
// Only recorded fixture placements are removed. Storage reloads use native saveWithFullMetadata/loadStatic in that loaded chunk,
// not chunk unloading or disk/reconnect proof; the inventory growth/retention assertions are unchanged.
// The client keeps its own copy of a reloaded storage: a data packet makes Sophisticated Storage rebuild that copy's inventory handler but
// not its upgrade handler (StorageWrapper#load), so a reloaded iron chest would show 2 upgrade slots on screen while the server has 4. A real
// world never shows this (the client builds every storage from the chunk data after the server start). The GUI checks therefore use storages
// whose client copy is new: the tier-upgraded gold chest (its block is replaced) and a new netherite chest.
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var TAG = 'GGTEST|chest_furnace|'
  var MARKER = 'kubejs/config/gg_test_chest_furnace.json'
  var REQ = 'ggTestChestFurnaceRequest'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var EARTH = 'minecraft:overworld'
  var AREA = null
  // Keep these objects: guiStep closes over their references before the layout is chosen.
  var A = {}, B = {}, C = {}, D = {}, F1 = {}, F2 = {}, F3 = {}
  var OLD_KEYS = ['server.IronChest.inventorySlotCount', 'server.IronChest.upgradeSlotCount', 'server.IronBarrel.inventorySlotCount',
    'server.IronBarrel.upgradeSlotCount', 'server.LimitedIronBarrelI.baseSlotLimitMultiplier', 'server.LimitedIronBarrelI.upgradeSlotCount']
  var FILL_IDS = ['stone', 'granite', 'diorite', 'andesite', 'dirt', 'cobblestone', 'oak_planks', 'spruce_planks', 'birch_planks', 'jungle_planks',
    'acacia_planks', 'dark_oak_planks', 'sand', 'red_sand', 'gravel', 'oak_log', 'spruce_log', 'birch_log', 'jungle_log', 'acacia_log', 'glass',
    'white_wool', 'orange_wool', 'magenta_wool', 'light_blue_wool', 'yellow_wool', 'lime_wool', 'pink_wool', 'gray_wool', 'cyan_wool',
    'purple_wool', 'blue_wool', 'brown_wool', 'green_wool', 'red_wool', 'black_wool', 'bricks', 'bookshelf', 'mossy_cobblestone', 'obsidian',
    'torch', 'ladder', 'rail', 'lever', 'snowball', 'clay_ball', 'sugar_cane', 'paper', 'book', 'slime_ball', 'egg', 'string', 'feather',
    'gunpowder', 'wheat_seeds', 'wheat', 'bread', 'flint', 'apple', 'bone', 'arrow', 'coal', 'charcoal', 'iron_nugget', 'gold_nugget']
  var SMELT_CANDIDATES = ['minecraft:cobblestone', 'minecraft:sand', 'minecraft:cactus', 'minecraft:clay_ball']
  var STEP_TIMEOUT = 2400
  var TEST_TIMEOUT = 12000

  var T = null
  var J = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3500)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = TAG + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    if (!ok) {
      T.failed.push(name)
      shared().put('failed', true)
    }
    T.table.push(name)
    emit(name, ok ? 'PASS' : 'FAIL', detail)
    return ok
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  // ---------------------------------------------------------------- Java

  function cls() {
    if (J !== null) return J
    J = {
      ArrayList: Java.loadClass('java.util.ArrayList'),
      CHM: Java.loadClass('java.util.concurrent.ConcurrentHashMap'),
      Integer: Java.loadClass('java.lang.Integer'),
      IntStream: Java.loadClass('java.util.stream.IntStream'),
      Stream: Java.loadClass('java.util.stream.Stream'),
      Collectors: Java.loadClass('java.util.stream.Collectors'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      BlockEntity: Java.loadClass('net.minecraft.world.level.block.entity.BlockEntity'),
      Direction: Java.loadClass('net.minecraft.core.Direction'),
      Vec3: Java.loadClass('net.minecraft.world.phys.Vec3'),
      BlockHitResult: Java.loadClass('net.minecraft.world.phys.BlockHitResult'),
      UseOnContext: Java.loadClass('net.minecraft.world.item.context.UseOnContext'),
      Hand: Java.loadClass('net.minecraft.world.InteractionHand'),
      ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
      SimpleContainer: Java.loadClass('net.minecraft.world.SimpleContainer'),
      RecipeType: Java.loadClass('net.minecraft.world.item.crafting.RecipeType'),
      ForgeHooks: Java.loadClass('net.minecraftforge.common.ForgeHooks'),
      Caps: Java.loadClass('net.minecraftforge.common.capabilities.ForgeCapabilities'),
      LevelResource: Java.loadClass('net.minecraft.world.level.storage.LevelResource'),
      CommentedConfig: Java.loadClass('com.electronwill.nightconfig.core.CommentedConfig'),
      CommentedFileConfig: Java.loadClass('com.electronwill.nightconfig.core.file.CommentedFileConfig'),
      FileNotFoundAction: Java.loadClass('com.electronwill.nightconfig.core.file.FileNotFoundAction'),
      SSConfig: Java.loadClass('net.p3pp3rf1y.sophisticatedstorage.Config'),
      IFConfig: Java.loadClass('ironfurnaces.Config')
    }
    return J
  }

  function shared() {
    if (!global.ggChestFurnace) global.ggChestFurnace = new (cls().CHM)()
    return global.ggChestFurnace
  }

  function sval(key) {
    var v = shared().get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function bp(p) {
    return new (cls().BlockPos)(p.x, p.y, p.z)
  }

  function cmd(text) {
    return Number(T.server.runCommandSilent('execute in ' + EARTH + ' run ' + text))
  }

  function sid(stack) {
    return stack.isEmpty() ? 'empty' : String(stack.getId()) + ' x' + stack.getCount()
  }

  // a List<Integer> made entirely in Java, and the Java-side comparisons built on it (see the pack's migration script)
  function javaInts(n) {
    return cls().IntStream['of(int)'](n).boxed().collect(cls().Collectors.toList())
  }

  function liveHoldsInteger(cv, n) {
    return cls().Stream.generate(cv).limit(1).collect(cls().Collectors.toList()).equals(javaInts(n))
  }

  function fileHoldsInteger(cfg, path, n) {
    return cfg['getOptional(java.lang.String)'](path).equals(cls().IntStream['of(int)'](n).boxed().findFirst())
  }

  function configEntry(cfg, path) {
    return cfg['get(java.lang.String)'](path)
  }

  // a fresh NightConfig reader (no autosave, no watcher). builder(String|Path|File) is overloaded and Rhino can't choose for a JS string
  function openToml(where) {
    var F = cls().CommentedFileConfig
    var b = typeof where === 'string' ? F['builder(java.lang.String)'](String(where)) : F['builder(java.nio.file.Path)'](where)
    var c = b.onFileNotFound(cls().FileNotFoundAction.THROW_ERROR).build()
    c.load()
    return c
  }

  function guardedSet(spec, pairs) {
    var ran = false
    var error = null
    spec.correct(cls().CommentedConfig.inMemory(), function () {
      if (ran) return
      ran = true
      try {
        pairs.forEach(function (x) { x.cv.set(cls().Integer['valueOf(int)'](x.v)) })
        spec.save()
      } catch (e) {
        error = e
      }
    })
    if (error !== null) throw error
  }

  function targetsByPath() {
    var out = {}
    global.grindless.storageTiers.targets.forEach(function (t) { out[t.path] = t })
    return out
  }

  function testPlayer(server) {
    var list = new (cls().ArrayList)(server.getPlayerList().getPlayers())
    return list.size() > 0 ? list.get(0) : null
  }

  function be(pos) {
    loadedChunk(pos)
    return T.level.getBlockEntity(bp(pos))
  }

  function blockId(pos) {
    loadedChunk(pos)
    return String(T.level.getBlockState(bp(pos)).getBlock().getId ? T.level.getBlockState(bp(pos)).getBlock().getId() : T.level.getBlockState(bp(pos)).getBlock())
  }

  function wrapper(pos) {
    var e = be(pos)
    return e === null ? null : e.getStorageWrapper()
  }

  function slotsOf(pos) {
    var w = wrapper(pos)
    return w === null ? { inv: -1, upg: -1 } : { inv: Number(w.getInventoryHandler().getSlots()), upg: Number(w.getUpgradeHandler().getSlots()) }
  }

  function snapshot(pos) {
    var h = wrapper(pos).getInventoryHandler()
    var out = []
    for (var i = 0; i < h.getSlots(); i++) out.push(h.getStackInSlot(i).copy())
    return out
  }

  // every saved stack is in the same slot (item, count and NBT); the slots past the old size are empty
  function compareContents(pos, saved) {
    var h = wrapper(pos).getInventoryHandler()
    var bad = []
    var extra = 0
    for (var i = 0; i < h.getSlots(); i++) {
      var now = h.getStackInSlot(i)
      if (i < saved.length) {
        if (!cls().ItemStack.matches(now, saved[i])) bad.push('slot ' + i + ': ' + sid(saved[i]) + ' -> ' + sid(now))
      } else if (!now.isEmpty()) extra++
    }
    return { ok: bad.length === 0 && extra === 0 && h.getSlots() >= saved.length, text: bad.length + ' slot(s) changed' + (bad.length ? ' (' + bad.slice(0, 4).join('; ') + ')' : '') +
      ', ' + extra + ' unexpected stack(s) in the new slots' }
  }

  function fillStack(i) {
    var s = Item.of('minecraft:' + FILL_IDS[i % FILL_IDS.length])
    s.setCount(Math.min(Number(s.getMaxStackSize()), (i % 13) + 1))
    return s
  }

  function totalItems(pos) {
    var h = wrapper(pos).getInventoryHandler()
    var n = 0
    var stacks = 0
    for (var i = 0; i < h.getSlots(); i++) {
      var s = h.getStackInSlot(i)
      if (!s.isEmpty()) {
        n += Number(s.getCount())
        stacks++
      }
    }
    return { items: n, stacks: stacks }
  }

  // Forge's item handler of a grown storage uses the new slots: the named slot past the old size accepts a simulated insert, the real insert
  // lands past the old size and extractItem gives the items back from that slot. Sophisticated Core honours the slot index of a simulated
  // insert only; a real one goes to matching stacks, then the first empty slot (InventoryHandlerSlotTracker), and the old slots are full here.
  // An empty ItemStack can read as null in KubeJS: emptiness is isEmpty() and only the capability is null-checked.
  function automationRoundTrip(cap, hint, oldSize, wantSlots) {
    if (cap === null) return { ok: false, text: 'no item handler capability' }
    var slots = Number(cap.getSlots())
    var sim = cap.insertItem(hint, Item.of('minecraft:diamond', 5), true)
    var left = cap.insertItem(hint, Item.of('minecraft:diamond', 5), false)
    var at = -1
    for (var i = 0; i < slots && at < 0; i++) {
      var s = cap.getStackInSlot(i)
      if (!s.isEmpty() && String(s.getId()) === 'minecraft:diamond') at = i
    }
    var back = at < 0 ? null : cap.extractItem(at, 5, false)
    var gotBack = at >= 0 && !back.isEmpty() && String(back.getId()) === 'minecraft:diamond' && Number(back.getCount()) === 5 && cap.getStackInSlot(at).isEmpty()
    return { ok: slots === wantSlots && sim.isEmpty() && left.isEmpty() && at >= oldSize && gotBack,
      text: 'item handler: ' + slots + ' slots; slot ' + hint + ' accepts 5 diamonds (simulated: ' + (sim.isEmpty() ? 'all' : sid(sim) + ' left') + '); the real insert (' +
        (left.isEmpty() ? 'all in' : sid(left) + ' refused') + ') landed in slot ' + at + ' (old size ' + oldSize + ') and extractItem(' + at + ') gave back ' +
        (at < 0 ? 'nothing' : sid(back)) }
  }

  // the item's part of a right-click on a block, in Forge's order (ServerPlayerGameMode#useItemOn): onItemUseFirst, then useOn only if that
  // passed. Sophisticated Storage's tier upgrades act in onItemUseFirst (their useOn is Item's PASS); Iron Furnaces' upgrades in useOn.
  function useItemOn(p, itemId, pos) {
    p.setItemInHand(cls().Hand.MAIN_HAND, Item.of(itemId))
    var hit = new (cls().BlockHitResult)(new (cls().Vec3)(pos.x + 0.5, pos.y + 1, pos.z + 0.5), cls().Direction.UP, bp(pos), false)
    var ctx = new (cls().UseOnContext)(p, cls().Hand.MAIN_HAND, hit)
    var r = 'onItemUseFirst ' + String(p.getMainHandItem().onItemUseFirst(ctx))
    if (r === 'onItemUseFirst PASS') r = 'useOn ' + String(p.getMainHandItem().useOn(ctx))
    p.setItemInHand(cls().Hand.MAIN_HAND, Item.of('minecraft:air'))
    return r
  }

  function loadedChunk(pos) {
    if (AREA === null || pos.x < AREA.x0 || pos.x > AREA.x1 || pos.z < AREA.z0 || pos.z > AREA.z1 ||
        pos.y < AREA.y0 || pos.y > AREA.y1) throw new Error('position outside the verified nearby fixture footprint')
    var chunk = T.level.getChunkSource().getChunkNow(Math.floor(pos.x / 16), Math.floor(pos.z / 16))
    if (chunk === null || chunk === undefined) throw new Error('fixture chunk is no longer fully loaded; no loading fallback')
    return chunk
  }

  function selectArea(p) {
    var cx = Math.floor(p.getX() / 16)
    var cz = Math.floor(p.getZ() / 16)
    var y0 = Number(T.level.getMaxBuildHeight()) - 20
    var near = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]
    for (var i = 0; i < near.length; i++) {
      var x0 = (cx + near[i][0]) * 16
      var z0 = (cz + near[i][1]) * 16
      // getChunkNow returns only an existing full chunk; it never requests/generates one.
      var chunk = T.level.getChunkSource().getChunkNow(cx + near[i][0], cz + near[i][1])
      if (chunk === null || chunk === undefined) continue
      var air = true
      for (var x = x0; x < x0 + 16 && air; x++) {
        for (var z = z0; z < z0 + 16 && air; z++) {
          for (var y = y0; y <= y0 + 14; y++) {
            if (!chunk.getBlockState(bp({ x: x, y: y, z: z })).isAir()) { air = false; break }
          }
        }
      }
      if (air) return { x0: x0, x1: x0 + 15, y0: y0, y1: y0 + 14, z0: z0, z1: z0 + 15 }
    }
    throw new Error('no verified-air platform in the five nearby fully loaded chunks; nothing placed')
  }

  function layout(area) {
    AREA = area
    ;[[A, 2, 4], [B, 5, 4], [C, 8, 4], [D, 11, 4], [F1, 2, 10], [F2, 5, 10], [F3, 8, 10]].forEach(function (v) {
      v[0].x = area.x0 + v[1]
      v[0].y = area.y0 + 1
      v[0].z = area.z0 + v[2]
    })
  }

  function place(pos, state) {
    loadedChunk(pos)
    var key = pos.x + ',' + pos.y + ',' + pos.z
    if (!T.placedKeys[key]) {
      T.placedKeys[key] = true
      T.placed.push({ x: pos.x, y: pos.y, z: pos.z })
    }
    T.level.setBlockAndUpdate(bp(pos), state)
  }

  function saveStorages() {
    return [A, B, C].map(function (pos) {
      loadedChunk(pos)
      return { pos: pos, state: T.level.getBlockState(bp(pos)), tag: be(pos).saveWithFullMetadata() }
    })
  }

  function reloadStorages(saved) {
    saved.forEach(function (s) {
      loadedChunk(s.pos)
      T.level.removeBlockEntity(bp(s.pos))
      var next = cls().BlockEntity.loadStatic(bp(s.pos), s.state, s.tag.copy())
      if (next === null) throw new Error('native block-entity NBT load returned null')
      T.level.setBlockEntity(next)
      next.setChanged()
    })
  }

  function cleanupPlaced() {
    var errors = []
    var air = Block.getBlock('minecraft:air').defaultBlockState()
    for (var i = T.placed.length - 1; i >= 0; i--) {
      var pos = T.placed[i]
      try {
        loadedChunk(pos)
        // Removing the BE first prevents container contents being dropped by onRemove.
        T.level.removeBlockEntity(bp(pos))
        T.level.setBlockAndUpdate(bp(pos), air)
      } catch (e) { errors.push(pos.x + ',' + pos.y + ',' + pos.z + ': ' + e) }
    }
    if (errors.length) throw new Error(errors.join('; '))
  }

  // ---------------------------------------------------------------- steps

  function stepBoot(p, age, st) {
    if (age === 0) {
      T.level = T.server.overworld()
      layout(selectArea(p)) // Verify the WHOLE volume before changing the player or placing anything.
      T.placed = []
      T.placedKeys = {}
      T.playerName = String(p.getName().getString())
      T.spawn = { x: p.getX(), y: p.getY(), z: p.getZ() }
      T.yaw = p.getYaw()
      T.pitch = p.getPitch()
      T.selected = p.getInventory().selected
      T.hand = p.getMainHandItem().copy()
      T.mode = String(p.gameMode.getGameModeForPlayer().getName())
      cmd('gamemode survival ' + T.playerName)
      return false
    }
    if (age < 20) return false
    T.touched = true
    var floor = Block.getBlock('minecraft:smooth_stone').defaultBlockState()
    for (var x = AREA.x0; x <= AREA.x1; x++) {
      for (var z = AREA.z0; z <= AREA.z1; z++) place({ x: x, y: AREA.y0, z: z }, floor)
    }
    note('area', 'X ' + AREA.x0 + '-' + AREA.x1 + ' Z ' + AREA.z0 + '-' + AREA.z1 + ' Y ' + AREA.y0 + '-' + AREA.y1 +
      ' verified air in an existing full nearby chunk; recorded placements only; player ' + T.playerName)
    return true
  }

  // the migration of this world's server config (created with the stock values by Forge, as every pre-update world has it)
  function stepMigration(p, age, st) {
    var S = global.grindless.storageTiers
    var last = S.last
    check('migration_ran', last !== null && last.ok && last.reason === 'server about to start' && last.raised.length === S.targets.length,
      last === null ? 'no run recorded' : 'reason "' + last.reason + '", ok ' + last.ok + ', raised ' + last.raised.length + '/' + S.targets.length +
      ', already ' + last.already + ', kept ' + last.kept.length + ', missing ' + last.missing.length + (last.error ? ', error ' + last.error : ''))
    var spec = cls().SSConfig.SERVER_SPEC
    var values = spec.getValues()
    var bad = []
    S.targets.forEach(function (t) {
      var cv = configEntry(values, t.path)
      if (cv === null || !liveHoldsInteger(cv, t.pack)) bad.push(t.path + '=' + (cv === null ? 'missing' : cv.get()))
    })
    check('live_integers', bad.length === 0, bad.length === 0 ? 'all ' + S.targets.length + ' live values are java.lang.Integer at the pack value (IronChest ' +
      configEntry(values, 'server.IronChest.inventorySlotCount').get() + ' slots, NetheriteChest ' + configEntry(values, 'server.NetheriteChest.inventorySlotCount').get() + ')' :
      bad.length + ' wrong: ' + bad.slice(0, 6).join(', '))
    // the saved file, read back from disk with a fresh NightConfig reader (no autosave, no watcher)
    var cfg = null
    var where = ''
    var tries = []
    try {
      // Path#resolve(String|Path) is overloaded too
      var root = T.server.getWorldPath(cls().LevelResource.ROOT)
      tries.push(root['resolve(java.lang.String)']('serverconfig')['resolve(java.lang.String)']('sophisticatedstorage-server.toml'))
    } catch (e) {
      note('world_path', 'MinecraftServer#getWorldPath not usable from the script (' + e + '); using the client\'s world folder name')
    }
    sval('levelDirs').split(';').filter(function (d) { return d !== '' }).forEach(function (d) { tries.push('saves/' + d + '/serverconfig/sophisticatedstorage-server.toml') })
    for (var i = 0; i < tries.length && cfg === null; i++) {
      try {
        cfg = openToml(tries[i])
        where = String(tries[i])
      } catch (e) {
        note('config_file_try', String(tries[i]) + ': ' + e)
      }
    }
    if (cfg === null) {
      check('disk_integers', false, 'the world\'s sophisticatedstorage-server.toml could not be read (tried ' + tries.length + ' paths; client world folders "' + sval('levelDirs') + '")')
    } else {
      var badDisk = []
      S.targets.forEach(function (t) { if (!fileHoldsInteger(cfg, t.path, t.pack)) badDisk.push(t.path + '=' + configEntry(cfg, t.path)) })
      check('disk_integers', badDisk.length === 0, where + ': ' + (badDisk.length === 0 ? 'all ' + S.targets.length + ' keys saved as integers at the pack value' :
        badDisk.length + ' wrong: ' + badDisk.slice(0, 6).join(', ')))
      check('disk_spec_correct', !!spec.isCorrect(cfg), 'Forge\'s spec ' + (spec.isCorrect(cfg) ? 'accepts the saved file as is: the next start loads these values without a correction' :
        'would CORRECT the saved file on the next start'))
      cfg.close()
    }
    var again = S.apply('test: second start')
    check('migration_idempotent', again.ok && again.raised.length === 0 && again.already === S.targets.length, 'a second run raised ' + again.raised.length +
      ', found ' + again.already + ' already at the pack value')
    return true
  }

  function stepFurnaceConfig(p, age, st) {
    var IF = cls().IFConfig
    var speeds = { iron: IF.ironFurnaceSpeed, gold: IF.goldFurnaceSpeed, diamond: IF.diamondFurnaceSpeed, emerald: IF.emeraldFurnaceSpeed,
      obsidian: IF.obsidianFurnaceSpeed, crystal: IF.crystalFurnaceSpeed, netherite: IF.netheriteFurnaceSpeed, copper: IF.copperFurnaceSpeed,
      silver: IF.silverFurnaceSpeed }
    var table = global.grindless.readJsonTable('kubejs/data/grindless/tables/chest_furnace_tiers.json')
    var bad = []
    var shown = []
    Object.keys(speeds).forEach(function (k) {
      var expect = Number(table.ironfurnaces.speed[k + '_furnace'][1])
      var got = Number(speeds[k].get())
      shown.push(k + ' ' + got)
      if (got !== expect) bad.push(k + ' ' + got + ' (want ' + expect + ')')
    })
    check('furnace_speeds_live', bad.length === 0, 'ticks per 200-tick recipe: ' + shown.join(', ') + (bad.length ? '; wrong: ' + bad.join(', ') : ''))
    var rainbow = String(IF.enableRainbowContent.get())
    var webOff = String(IF.disableWebContent.get())
    var updates = String(IF.checkUpdates.get())
    check('furnace_switches_live', rainbow === 'false' && webOff === 'true' && updates === 'false', 'rainbow content ' + rainbow + ', web content disabled ' + webOff +
      ', update check ' + updates)
    try {
      var c = openToml('config/ironfurnaces-client.toml')
      var fixes = []
      var ok = !!IF.CLIENT_CONFIG.isCorrect(c)
      if (!ok) {
        IF.CLIENT_CONFIG.correct(c, function (action, path, before, after) { fixes.push('value ' + String(action) + ' ' + String(path)) },
          function (action, path, before, after) { fixes.push('comment ' + String(path)) })
      }
      // Startup may normalize comments; the live values and this post-load spec check remain mandatory.
      check('furnace_file_correct', ok, ok ? 'config/ironfurnaces-client.toml on disk is what the mod\'s spec expects (values and comments)' :
        'the spec would still rewrite it: ' + fixes.slice(0, 8).join(', '))
      c.close()
    } catch (e) {
      check('furnace_file_correct', false, 'config/ironfurnaces-client.toml could not be read: ' + e)
    }
    // recipes and hiding
    var rm = T.server.getRecipeManager()
    var made = {}
    var gen = 0
    var all = new (cls().ArrayList)(rm.getRecipes())
    for (var i = 0; i < all.size(); i++) {
      var r = all.get(i)
      if (String(r.getType()) === 'ironfurnaces:generator_blasting') gen++
      var out = null
      try { out = r.getResultItem(T.server.registryAccess()) } catch (e) { out = null }
      if (out !== null && !out.isEmpty()) {
        var id = String(out.getId())
        if (id.indexOf('ironfurnaces:') === 0) made[id] = (made[id] || 0) + 1
      }
    }
    var gone = ['augment_generator', 'augment_factory', 'heater', 'item_heater', 'million_furnace', 'rainbow_core', 'rainbow_plating']
    var kept = ['iron_furnace', 'gold_furnace', 'netherite_furnace', 'upgrade_iron', 'upgrade_gold', 'upgrade_netherite', 'augment_speed', 'augment_fuel',
      'augment_blasting', 'augment_smoking']
    var leaks = gone.filter(function (n) { return made['ironfurnaces:' + n] })
    var missing = kept.filter(function (n) { return !made['ironfurnaces:' + n] })
    check('furnace_recipes', leaks.length === 0 && missing.length === 0 && gen === 0, 'no recipe makes ' + (leaks.length ? 'ALL BUT ' + leaks.join(', ') : gone.join(', ')) +
      '; ' + gen + ' generator fuel recipes; recipes kept for ' + kept.filter(function (n) { return made['ironfurnaces:' + n] }).join(', ') +
      (missing.length ? '; missing: ' + missing.join(', ') : ''))
    var hidden = Ingredient.of('#c:hidden_from_recipe_viewers')
    var notHidden = gone.concat(['rainbow_coal']).filter(function (n) { return !hidden.test(Item.of('ironfurnaces:' + n)) })
    check('furnace_hidden', notHidden.length === 0 && !hidden.test(Item.of('ironfurnaces:iron_furnace')), notHidden.length === 0 ? 'removed and unobtainable items hidden in EMI; the furnaces stay visible' :
      'not hidden: ' + notHidden.join(', '))
    return true
  }

  function smeltInput() {
    var rm = T.server.getRecipeManager()
    for (var i = 0; i < SMELT_CANDIDATES.length; i++) {
      var s = Item.of(SMELT_CANDIDATES[i])
      var r = rm.getRecipeFor(cls().RecipeType.SMELTING, new (cls().SimpleContainer)(s), T.level)
      if (r.isPresent() && Number(r.get().getCookingTime()) === 200) return { id: SMELT_CANDIDATES[i], out: String(r.get().getResultItem(T.server.registryAccess()).getId()) }
    }
    return null
  }

  function stepFurnaces(p, age, st) {
    if (age === 0) {
      st.input = smeltInput()
      if (st.input === null) {
        check('furnace_run', false, 'no 200-tick smelting recipe among ' + SMELT_CANDIDATES.join(', '))
        return true
      }
      st.burn = Number(cls().ForgeHooks.getBurnTime(Item.of('minecraft:coal'), cls().RecipeType.SMELTING))
      st.perFuel = Math.floor(st.burn / 200)
      st.runs = [{ name: 'iron', pos: F1, block: 'ironfurnaces:iron_furnace', want: 80 }, { name: 'netherite', pos: F2, block: 'ironfurnaces:netherite_furnace', want: 2 }]
      st.runs.forEach(function (r) {
        place(r.pos, Block.getBlock(r.block).defaultBlockState())
        var e = be(r.pos)
        var inp = Item.of(st.input.id)
        inp.setCount(st.perFuel)
        e.setItem(0, inp)
        e.setItem(1, Item.of('minecraft:coal'))
        r.start = T.t
        r.done = -1
        r.total = -1
        r.first = -1
      })
      note('furnace_setup', 'each furnace: ' + st.perFuel + ' x ' + st.input.id + ' (200-tick smelting into ' + st.input.out + ') and 1 coal (burn time ' + st.burn + ')')
      return false
    }
    var pending = 0
    st.runs.forEach(function (r) {
      var e = be(r.pos)
      if (r.total < 0 && Number(e.totalCookTime) > 0) r.total = Number(e.totalCookTime)
      var out = e.getItem(2)
      if (r.first < 0 && !out.isEmpty()) r.first = T.t - r.start
      if (r.done < 0 && !out.isEmpty() && Number(out.getCount()) >= st.perFuel) {
        r.done = T.t - r.start
        r.burnLeft = Number(e.furnaceBurnTime)
        r.fuelLeft = Number(e.getItem(1).getCount())
        r.inputLeft = Number(e.getItem(0).getCount())
        r.out = sid(out)
      }
      if (r.done < 0) pending++
    })
    if (pending > 0 && age < 1500) return false
    st.runs.forEach(function (r) {
      var per = r.done > 0 ? r.done / st.perFuel : -1
      check('furnace_' + r.name, r.total === r.want && r.done > 0 && per >= r.want && per <= r.want + 2 && r.fuelLeft === 0 && r.inputLeft === 0 &&
        r.burnLeft <= r.want, r.name + ' furnace: cook time ' + r.total + ' ticks per item (want ' + r.want + '; the mod\'s stock ' + (r.name === 'iron' ? 160 : 5) +
        '), ' + st.perFuel + ' items in ' + r.done + ' ticks (' + (per > 0 ? per.toFixed(2) : '-') + ' per item), output ' + (r.out || 'none') + ', 1 coal used (' +
        r.fuelLeft + ' left), ' + r.burnLeft + ' burn ticks left: ' + st.perFuel + ' items per coal, as a vanilla furnace')
    })
    return true
  }

  function stepFurnaceUpgrade(p, age, st) {
    if (age === 0) {
      place(F3, Block.getBlock('ironfurnaces:iron_furnace').defaultBlockState())
      var e = be(F3)
      e.setItem(0, Item.of('minecraft:dirt', 3))
      e.setItem(1, Item.of('minecraft:coal', 2))
      e.setItem(2, Item.of('minecraft:stone', 5))
      e.setItem(4, Item.of('ironfurnaces:augment_speed'))
      st.before = [0, 1, 2, 3, 4, 5].map(function (i) { return e.getItem(i).copy() })
      st.result = useItemOn(p, 'ironfurnaces:upgrade_gold', F3)
      return false
    }
    if (age === 2) {
      var e2 = be(F3)
      var bad = []
      st.before.forEach(function (s, i) { if (!cls().ItemStack.matches(s, e2.getItem(i))) bad.push('slot ' + i + ': ' + sid(s) + ' -> ' + sid(e2.getItem(i))) })
      st.block = blockId(F3)
      check('furnace_upgrade_keeps', st.block.indexOf('gold_furnace') >= 0 && bad.length === 0, 'upgrade_gold on an iron furnace (' + st.result + '): now ' + st.block +
        '; ' + (bad.length === 0 ? 'input, fuel, output and the speed augment all kept' : bad.join('; ')))
      var inp = Item.of('minecraft:cobblestone', 4)
      e2.setItem(0, inp)
      return false
    }
    if (age < 12) return false
    var t = Number(be(F3).totalCookTime)
    check('furnace_upgraded_speed', t === 30, 'the gold furnace with the speed augment cooks a 200-tick recipe in ' + t + ' ticks (gold 60, halved by the augment)')
    return true
  }

  // the old world: the live config set back to the stock values for the iron storages, as v0.7.0 had them
  function stepOldWorld(p, age, st) {
    if (age === 0) {
      var spec = cls().SSConfig.SERVER_SPEC
      var values = spec.getValues()
      var byPath = targetsByPath()
      T.oldConfig = OLD_KEYS.map(function (k) { return { cv: configEntry(values, k), v: Number(configEntry(values, k).get()) } })
      guardedSet(spec, OLD_KEYS.map(function (k) { return { cv: configEntry(values, k), v: byPath[k].stock } }))
      note('old_config', OLD_KEYS.map(function (k) { return k + '=' + configEntry(values, k).get() }).join(', '))
      place(A, Block.getBlock('sophisticatedstorage:iron_chest').defaultBlockState())
      place(B, Block.getBlock('sophisticatedstorage:iron_barrel').defaultBlockState())
      place(C, Block.getBlock('sophisticatedstorage:limited_iron_barrel_1').defaultBlockState())
      return false
    }
    if (age < 3) return false
    var a = slotsOf(A)
    var b = slotsOf(B)
    var w = wrapper(C)
    st.oldLimit = Number(w.getInventoryHandler().getSlotLimit(0))
    check('old_sizes', a.inv === 54 && a.upg === 2 && b.inv === 54 && b.upg === 2 && st.oldLimit === 64 * 64, 'built under the stock values: iron chest ' + a.inv + ' slots / ' +
      a.upg + ' upgrade slots, iron barrel ' + b.inv + ' / ' + b.upg + ', limited iron barrel I ' + st.oldLimit + ' items per slot')
    var ha = wrapper(A).getInventoryHandler()
    var hb = wrapper(B).getInventoryHandler()
    for (var i = 0; i < 54; i++) {
      ha.setStackInSlot(i, fillStack(i))
      hb.setStackInSlot(i, fillStack(i + 7))
    }
    var named = Item.of('minecraft:diamond_sword')
    named.setHoverName(Text.of('Keepsake'))
    named.enchant(Java.loadClass('net.minecraft.world.item.enchantment.Enchantments').SHARPNESS, 3)
    ha.setStackInSlot(53, named)
    wrapper(A).getUpgradeHandler().setStackInSlot(0, Item.of('sophisticatedstorage:pickup_upgrade'))
    var cob = Item.of('minecraft:cobblestone')
    cob.setCount(4000)
    w.getInventoryHandler().setStackInSlot(0, cob)
    be(A).setChanged()
    be(B).setChanged()
    be(C).setChanged()
    st.savedA = snapshot(A)
    st.savedB = snapshot(B)
    st.oldBE = be(A)
    st.savedBlocks = saveStorages()
    st.cobble = Number(w.getInventoryHandler().getStackInSlot(0).getCount())
    note('old_contents', 'iron chest: 54 stacks (slot 53 a named, enchanted sword) and a pickup upgrade; iron barrel: 54 stacks; limited barrel: ' + st.cobble + ' cobblestone')
    return true
  }

  // Reload the real storage BEs from their stock-sized native NBT without loading/unloading any chunk.
  function stepUpdate(p, age, st) {
    if (age === 0) {
      var r = global.grindless.storageTiers.apply('test: the update on an old world')
      check('update_raises_old_keys', r.ok && r.raised.length === OLD_KEYS.length, 'raised: ' + r.raised.join(', '))
      reloadStorages(st.savedBlocks)
      return false
    }
    if (age < 5) return false
    var fresh = be(A) !== null && !st.oldBE.equals(be(A)) && !!st.oldBE.isRemoved()
    check('block_entities_reloaded', fresh, 'native NBT save/load in the existing loaded chunk; the chest is ' +
      (fresh ? 'a new block entity read from its saved data' : 'the SAME block entity (no reload)') + '; not chunk/disk/reconnect proof')
    var a = slotsOf(A)
    var b = slotsOf(B)
    var ca = compareContents(A, st.savedA)
    var cb = compareContents(B, st.savedB)
    var up = wrapper(A).getUpgradeHandler().getStackInSlot(0)
    check('old_chest_grows', a.inv === 108 && a.upg === 4 && ca.ok && String(up.getId()) === 'sophisticatedstorage:pickup_upgrade', 'iron chest saved at 54 / 2 now ' + a.inv +
      ' slots / ' + a.upg + ' upgrade slots; ' + ca.text + '; upgrade slot 0 ' + sid(up))
    check('old_barrel_grows', b.inv === 108 && b.upg === 4 && cb.ok, 'iron barrel saved at 54 / 2 now ' + b.inv + ' / ' + b.upg + '; ' + cb.text)
    var hc = wrapper(C).getInventoryHandler()
    var limit = Number(hc.getSlotLimit(0))
    var kept = Number(hc.getStackInSlot(0).getCount())
    var cap = be(C).getCapability(cls().Caps.ITEM_HANDLER, null).orElse(null)
    var more = Item.of('minecraft:cobblestone')
    more.setCount(4000)
    var rest = cap === null ? more : cap.insertItem(0, more, false)
    var after = Number(hc.getStackInSlot(0).getCount())
    check('old_limited_barrel', limit === 128 * 64 && kept === st.cobble && after === st.cobble + 4000 && Number(slotsOf(C).upg) === 4, 'limited iron barrel I: ' + limit +
      ' items per slot (stock ' + st.oldLimit + '), kept ' + kept + ' cobblestone, took 4,000 more through the item handler (' + after + ' now, ' +
      (rest.isEmpty() ? 'nothing' : sid(rest)) + ' refused), ' + slotsOf(C).upg + ' upgrade slots')
    var auto = automationRoundTrip(be(A).getCapability(cls().Caps.ITEM_HANDLER, null).orElse(null), 100, 54, 108)
    check('automation_new_slots', auto.ok, auto.text)
    st.savedA2 = snapshot(A)
    return true
  }

  // A second native NBT save/load: the grown size was serialized, not merely left in the old object.
  function stepPersist(p, age, st) {
    if (age === 0) {
      st.oldBE = be(A)
      reloadStorages(saveStorages())
      return false
    }
    if (age < 5) return false
    var a = slotsOf(A)
    var ca = compareContents(A, st.savedA2)
    check('grown_size_saved', a.inv === 108 && a.upg === 4 && ca.ok && !st.oldBE.equals(be(A)), 'after a second native block-entity NBT save/load: ' + a.inv + ' / ' + a.upg + '; ' + ca.text)
    return true
  }

  function stepTierUpgrade(p, age, st) {
    if (age === 0) {
      var h = wrapper(A).getInventoryHandler()
      for (var i = 54; i < 108; i++) h.setStackInSlot(i, fillStack(i))
      st.saved = snapshot(A)
      st.total = totalItems(A)
      st.result = useItemOn(p, 'sophisticatedstorage:iron_to_gold_tier_upgrade', A)
      return false
    }
    if (age < 3) return false
    var a = slotsOf(A)
    var ca = compareContents(A, st.saved)
    var up = wrapper(A).getUpgradeHandler().getStackInSlot(0)
    check('tier_upgrade_full_chest', st.result === 'onItemUseFirst SUCCESS' && blockId(A).indexOf('gold_chest') >= 0 && a.inv === 162 && a.upg === 6 && ca.ok &&
      String(up.getId()) === 'sophisticatedstorage:pickup_upgrade',
      'iron_to_gold_tier_upgrade on the full migrated chest (' + st.result + '): ' + blockId(A) + ', ' + a.inv + ' slots / ' + a.upg + ' upgrade slots (stock gold: 81 / 3); ' +
      ca.text + '; ' + st.total.stacks + ' stacks, ' + st.total.items + ' items; upgrade ' + sid(up))
    place(D, Block.getBlock('sophisticatedstorage:netherite_chest').defaultBlockState())
    return true
  }

  function stepNetherite(p, age, st) {
    if (age < 2) return false
    var d = slotsOf(D)
    var h = wrapper(D).getInventoryHandler()
    h.setStackInSlot(0, Item.of('minecraft:emerald', 7))
    h.setStackInSlot(179, Item.of('minecraft:diamond', 3))
    check('netherite_new', d.inv === 180 && d.upg === 10, 'a new netherite chest: ' + d.inv + ' slots / ' + d.upg + ' upgrade slots (stock 132 / 5)')
    return true
  }

  // real right-click: the player stands two blocks south of the chest looking at it; the client holds the use key for a tick. No server
  // fallback: if the real click does not open the chest, the check fails
  function guiStep(name, pos, wantSlots, wantUpg) {
    return function (p, age, st) {
      if (age === 0) {
        T.server.runCommandSilent('execute in ' + EARTH + ' run tp ' + T.playerName + ' ' + (pos.x + 0.5) + ' ' + pos.y + ' ' + (pos.z + 2.5) + ' 180 33')
        st.token = name + '-' + T.t
        st.expect = totalItems(pos)
        shared().put('screenshotName', 'gg_chest_' + name)
        shared().put('clickPos', pos.x + ',' + pos.y + ',' + pos.z)
        shared().put('report', '')
        shared().put('shotResult', '')
        return false
      }
      if (age === 10) shared().put('clickToken', st.token)
      var menu = p.containerMenu
      var open = menu !== null && typeof menu.getNumberOfStorageInventorySlots === 'function'
      if (open && st.serverSlots === undefined) {
        st.serverSlots = Number(menu.getNumberOfStorageInventorySlots())
        st.serverUpg = Number(menu.getNumberOfUpgradeSlots())
      }
      var rep = sval('report')
      var shot = sval('shotResult')
      var haveRep = rep !== '' && rep.indexOf(st.token + '|') === 0
      var haveShot = shot !== '' && shot.indexOf(st.token + '|') === 0
      if (haveRep && haveShot) return finishGui(name, pos, st, wantSlots, wantUpg, rep, shot)
      if (age > 600) return finishGui(name, pos, st, wantSlots, wantUpg, haveRep ? rep : null, haveShot ? shot : null)
      return false
    }
  }

  function finishGui(name, pos, st, wantSlots, wantUpg, rep, shot) {
    if (rep === null) {
      check('gui_' + name, false, 'the client never reported an open storage screen (server menu ' + (st.serverSlots === undefined ? 'not open' : st.serverSlots + ' slots') +
        '; client: ' + sval('clickNote') + ')')
      return true
    }
    // token|screen class|storage slots|upgrade slots|rows|storage stacks|storage items|upgrade stacks|upgrade items|how|aim
    var f = rep.split('|')
    var cSlots = Number(f[2])
    var cUpg = Number(f[3])
    var cStacks = Number(f[5])
    var cItems = Number(f[6])
    var cUpStacks = Number(f[7])
    var cUpItems = Number(f[8])
    var aimed = f[10] === 'aim'
    var upStacks = 0
    var upItems = 0
    var w = wrapper(pos).getUpgradeHandler()
    for (var i = 0; i < w.getSlots(); i++) if (!w.getStackInSlot(i).isEmpty()) { upStacks++; upItems += Number(w.getStackInSlot(i).getCount()) }
    check('gui_' + name, aimed && cSlots === wantSlots && cUpg === wantUpg && st.serverSlots === wantSlots && cStacks === st.expect.stacks && cItems === st.expect.items &&
      cUpStacks === upStacks && cUpItems === upItems,
      'screen ' + f[1] + ' opened by ' + f[9] + ': the client menu shows ' + cSlots + ' storage slots (want ' + wantSlots + ') in ' + f[4] + ' rows and ' + cUpg + ' upgrade slots (want ' +
      wantUpg + '); ' + cStacks + ' stacks / ' + cItems + ' items in the storage slots (the chest holds ' + st.expect.stacks + ' / ' + st.expect.items + ') and ' + cUpStacks +
      ' / ' + cUpItems + ' in the upgrade slots (the chest holds ' + upStacks + ' / ' + upItems + ')')
    // Screenshot.grab's callback: screenshot.success once the PNG is written, screenshot.failure otherwise
    var s = shot === null ? [] : shot.split('|')
    check('screenshot_' + name, shot !== null && s[1] === 'screenshot.success', shot === null ? 'no screenshot result from the client in 600 ticks' :
      s[2] + ': ' + s[1] + ' (kubejs/exported)')
    return true
  }

  function stepCloseGui(p, age, st) {
    if (age === 0) shared().put('closeToken', 'close-' + T.t)
    if (age < 20) return false
    if (p.containerMenu !== null && typeof p.containerMenu.getNumberOfStorageInventorySlots === 'function') p.closeMenu()
    return true
  }

  var STEPS = [
    ['boot', stepBoot],
    ['migration', stepMigration],
    ['furnace_config', stepFurnaceConfig],
    ['furnaces', stepFurnaces],
    ['furnace_upgrade', stepFurnaceUpgrade],
    ['old_world', stepOldWorld],
    ['update', stepUpdate],
    ['persist', stepPersist],
    ['tier_upgrade', stepTierUpgrade],
    ['netherite', stepNetherite],
    ['gui_gold', guiStep('gold', A, 162, 6)],
    ['close_gold', stepCloseGui],
    ['gui_netherite', guiStep('netherite', D, 180, 10)],
    ['close_netherite', stepCloseGui],
    ['finish', function (p, age, st) { finish(T.server); return true }]
  ]

  function indexOf(name) {
    for (var i = 0; i < STEPS.length; i++) if (STEPS[i][0] === name) return i
    return -1
  }

  // ---------------------------------------------------------------- driver

  function finish(server) {
    if (T === null || T.finished) return
    T.finished = true
    shared().put('clickToken', '')
    try {
      var p = testPlayer(server)
      if (T.spawn) {
        if (p === null) throw new Error('player unavailable for restoration')
        p.closeMenu()
        p.getInventory().setItem(T.selected, T.hand)
        p.getInventory().selected = T.selected
        p.getInventory().setChanged()
        p.inventoryMenu.broadcastChanges()
        if (server.runCommandSilent('execute in ' + EARTH + ' run tp ' + T.playerName + ' ' + T.spawn.x + ' ' + T.spawn.y + ' ' + T.spawn.z + ' ' + T.yaw + ' ' + T.pitch) < 1) {
          throw new Error('return-to-spawn command failed')
        }
        cmd('gamemode ' + T.mode + ' ' + T.playerName)
      }
    } catch (e) { check('restore', false, String(e)) }
    if (T.oldConfig) {
      try { guardedSet(cls().SSConfig.SERVER_SPEC, T.oldConfig) } catch (e) { check('config_cleanup', false, String(e)) }
    }
    if (T.touched) {
      try { cleanupPlaced() } catch (e) { check('cleanup', false, String(e)) }
    }
    var failed = T.failed.filter(function (f, i) { return T.failed.indexOf(f) === i })
    check('all', failed.length === 0, failed.length === 0 ? 'every check passed: ' + T.table.join(', ') : 'failed: ' + failed.join(', '))
    shared().put('hold', false)
    shared().put('serverDone', true)
    global[REQ + 'Done'] = true
    console.info(TAG + 'DONE')
  }

  function onTick(server) {
    if (global[REQ] && T === null && Date.now() - LOADED_AT >= QUIET_MS && Date.now() >= Number(global[REQ + 'At'] || 0)) {
      global[REQ] = false
      T = { t: 0, tick0: server.getTickCount(), step: 0, since: 0, st: {}, failed: [], table: [], finished: false, server: server, level: null, touched: false }
    }
    if (T === null || T.finished) return
    T.server = server
    if (sval('cancel') !== '') {
      check('cancelled', false, sval('cancel'))
      finish(server)
      return
    }
    T.t = server.getTickCount() - T.tick0
    if (T.t > TEST_TIMEOUT) {
      check('timeout', false, 'the test ran ' + T.t + ' ticks; step ' + STEPS[T.step][0])
      finish(server)
      return
    }
    var p = testPlayer(server)
    if (p === null) {
      check('player_present', false, 'the test player left during ' + STEPS[T.step][0])
      finish(server)
      return
    }
    var step = STEPS[T.step]
    if (T.since === null) T.since = T.t
    var age = T.t - T.since
    var done = false
    try {
      done = step[1](p, age, T.st)
    } catch (e) {
      check('step_' + step[0], false, 'exception: ' + e + (T.st && T.st.phase ? ' (phase ' + T.st.phase + ')' : ''))
      done = true
      if (step[0] === 'boot') { finish(server); return }
    }
    if (!done && age > STEP_TIMEOUT) {
      check('step_' + step[0], false, 'timed out after ' + age + ' ticks' + (T.st && T.st.phase ? ' in phase ' + T.st.phase : ''))
      done = true
    }
    if (T.finished) return
    if (done) {
      T.step++
      // The next callback MUST see age 0, even if server tick counts skip.
      T.since = null
      // These three steps share the actual saved inventory/BE baselines.
      // Clearing st after old_world/update loses the evidence before comparison.
      if (step[0] !== 'old_world' && step[0] !== 'update') T.st = {}
    }
  }

  function enabledByMarker() {
    try {
      var m = JsonIO.read(MARKER)
      return m !== null && m !== undefined && String(m.enabled) === 'true'
    } catch (e) {
      return false
    }
  }

  ServerEvents.tick(function (event) {
    onTick(event.server)
  })

  function arm(player) {
    if (global[REQ + 'Done'] || T !== null || global[REQ]) throw new Error('chest/furnace fixture already armed')
    global[REQ + 'At'] = Date.now() + 5000
    global[REQ] = true
    var S = shared()
    S.clear()
    S.put('hold', true)
    S.put('clickToken', '')
    S.put('closeToken', '')
    S.put('report', '')
    note('armed', 'chest and furnace fixture starts in a few seconds; exclusive player ownership')
  }

  global.ggTestChestFurnaceStart = arm

  // An integrated marker takes precedence: only the dispatcher may arm this fixture.
  PlayerEvents.loggedIn(function (event) {
    var integrated = JsonIO.read('kubejs/config/gg_test_v071_integration.json')
    if (integrated && String(integrated.enabled) === 'true') return
    if (global[REQ + 'Done'] || T !== null || !enabledByMarker()) return
    arm(event.player)
  })
})()
