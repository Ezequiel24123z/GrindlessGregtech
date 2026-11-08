// priority: -674
// GG test: Crafting Station fill path and restored vanilla crafting (TEST-ONLY overlay, never shipped).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_craftingstation' -WaitForLog 'GGTEST\|craftingstation\|DONE@@300'
//
// Server half only: a FakePlayer opens a real CraftingStationMenu (4-argument constructor, so the same slot layout, result
// recompute and SideContainerSlot code the player gets), and dev.emi.emi.network.FillRecipeC2SPacket#apply runs against it with the
// slot lists the patched EMI handler sends (crafting slots first, then side slots, then the player inventory). This proves the
// server mechanics (what lands where, nothing created or lost, result recomputed), not the client handler or the screen.
// Markers: GGTEST|craftingstation|<check>|PASS|FAIL|INFO (detail); last line GGTEST|craftingstation|DONE
;(function () {
  var NAME = 'craftingstation'
  function log(check, status, detail) {
    console.info('GGTEST|' + NAME + '|' + check + '|' + status + (detail ? '|' + String(detail).replace(/\|/g, '/') : ''))
  }
  function ms(t0) { return ((JSys.nanoTime() - t0) / 1e6).toFixed(2) }

  var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
  var AL = Java.loadClass('java.util.ArrayList')
  var JSys = { nanoTime: function () { return Date.now() * 1e6 } }
  var ClickType = Java.loadClass('net.minecraft.world.inventory.ClickType')

  var VANILLA = [
    'iron_block', 'iron_ingot_from_iron_block', 'gold_block', 'gold_ingot_from_gold_block', 'diamond_block',
    'diamond', 'redstone_block', 'redstone', 'emerald_block',
    'emerald', 'lapis_block', 'lapis_lazuli', 'coal_block', 'coal',
    'copper_block', 'netherite_block', 'clay', 'glass_pane', 'paper', 'bucket', 'hopper', 'tnt', 'flint_and_steel',
    'iron_pickaxe', 'iron_chestplate', 'shears', 'iron_door', 'iron_trapdoor', 'anvil', 'cauldron',
    'crafting_table', 'torch', 'stick', 'oak_planks'
  ]

  function checkRecipes() {
    var rm = srv.getRecipeManager()
    var missing = []
    VANILLA.forEach(function (id) {
      if (!rm.byKey(new RL('minecraft:' + id)).isPresent()) missing.push(id)
    })
    ;['minecraft:chest', 'minecraft:furnace'].forEach(function (out) {
      var ids = []
      rm.getAllRecipesFor(Java.loadClass('net.minecraft.world.item.crafting.RecipeType').CRAFTING).forEach(function (r) {
        if (String(r.getResultItem(srv.registryAccess()).id) === out) ids.push(String(r.getId()))
      })
      log('output_' + out.split(':')[1], ids.length ? 'PASS' : 'FAIL', out + ' crafting recipes: ' + ids.join(','))
    })
    log('vanilla_recipes', missing.length === 0 ? 'PASS' : 'FAIL',
      VANILLA.length + ' checked, missing: ' + (missing.length ? missing.join(',') : 'none'))
  }

  var srv, level, player, menu, chestPos, chest, grid
  var gridSlots = []
  var sideSlots = []
  var invSlots = []

  function itemCount(id) {
    var n = 0
    var inv = player.getInventory()
    for (var i = 0; i < inv.getContainerSize(); i++) if (String(inv.getItem(i).id) === id) n += inv.getItem(i).getCount()
    for (var g = 0; g < 9; g++) if (String(grid.getItem(g).id) === id) n += grid.getItem(g).getCount()
    for (var c = 0; c < chest.getContainerSize(); c++) if (String(chest.getItem(c).id) === id) n += chest.getItem(c).getCount()
    var carried = menu.getCarried()
    if (!carried.isEmpty() && String(carried.id) === id) n += carried.getCount()
    return n
  }
  function where(id) {
    var inv = 0, gr = 0, ch = 0
    var pi = player.getInventory()
    for (var i = 0; i < pi.getContainerSize(); i++) if (String(pi.getItem(i).id) === id) inv += pi.getItem(i).getCount()
    for (var g = 0; g < 9; g++) if (String(grid.getItem(g).id) === id) gr += grid.getItem(g).getCount()
    for (var c = 0; c < chest.getContainerSize(); c++) if (String(chest.getItem(c).id) === id) ch += chest.getItem(c).getCount()
    return 'inv=' + inv + ' grid=' + gr + ' chest=' + ch
  }

  function reset() {
    var pi = player.getInventory()
    pi.clearContent()
    for (var c = 0; c < chest.getContainerSize(); c++) chest.setItem(c, Item.empty)
    grid.clearContent()
    menu = new Menu(1, pi, grid, stationPos)
    player.containerMenu = menu
    gridSlots = []
    sideSlots = []
    invSlots = []
    for (var i = 0; i < menu.slots.size(); i++) {
      var s = menu.slots.get(i)
      var cls = String(s.getClass().getSimpleName())
      if (i >= 1 && i <= 9) gridSlots.push(s)
      else if (cls === 'SideContainerSlot') sideSlots.push(s)
      else if (i > 0 && s.container === pi) invSlots.push(s)
    }
  }

  var Menu, stationPos

  function newGrid() {
    var E = Item.empty
    return new (Java.loadClass('net.minecraft.world.SimpleContainer'))(E, E, E, E, E, E, E, E, E)
  }

  function sources() {
    var l = new AL()
    gridSlots.forEach(function (s) { l.add(s) })
    sideSlots.forEach(function (s) { l.add(s) })
    invSlots.forEach(function (s) { l.add(s) })
    return l
  }
  function craftSlots() {
    var l = new AL()
    gridSlots.forEach(function (s) { l.add(s) })
    return l
  }

  function fill(action, ingredientId, count) {
    var Packet = Java.loadClass('dev.emi.emi.network.FillRecipeC2SPacket')
    var stacks = new AL()
    for (var i = 0; i < count; i++) stacks.add(Item.of(ingredientId))
    for (var j = count; j < 9; j++) stacks.add(Item.empty)
    var t0 = JSys.nanoTime()
    var pkt = new Packet(menu, action, sources(), craftSlots(), menu.getSlot(0), stacks)
    pkt.apply(player)
    menu.flushCraftingGrid()
    return ms(t0)
  }

  function gridDump() {
    var o = []
    for (var g = 0; g < 9; g++) o.push(String(grid.getItem(g).id).replace('minecraft:', '') + 'x' + grid.getItem(g).getCount())
    return o.join(',')
  }
  function resultId() {
    menu.flushCraftingGrid()
    var r = menu.getSlot(0).getItem()
    return r.isEmpty() ? 'empty' : String(r.id) + 'x' + r.getCount()
  }

  function runMenuCases() {
    var IRON = 'minecraft:iron_ingot'
    var BLOCK = 'minecraft:iron_block'
    var pi = player.getInventory()

    // grid-only: nine ingots already in the grid, inventory empty (the reported bug)
    reset()
    for (var g = 0; g < 9; g++) grid.setItem(g, Item.of(IRON))
    var t = fill(0, IRON, 9)
    log('grid_only', itemCount(IRON) === 9 && gridDump().split('iron_ingotx1').length === 10 && resultId() === BLOCK + 'x1' ? 'PASS' : 'FAIL',
      'total=' + itemCount(IRON) + ' ' + where(IRON) + ' result=' + resultId() + ' ' + t + ' ms')

    // mixed: four in the grid, five in the inventory
    reset()
    for (var a = 0; a < 4; a++) grid.setItem(a, Item.of(IRON))
    pi.setItem(0, Item.of(IRON, 5))
    t = fill(0, IRON, 9)
    log('mixed', itemCount(IRON) === 9 && where(IRON) === 'inv=0 grid=9 chest=0' && resultId() === BLOCK + 'x1' ? 'PASS' : 'FAIL',
      where(IRON) + ' result=' + resultId() + ' ' + t + ' ms')

    // already filled: the same packet twice changes nothing
    t = fill(0, IRON, 9)
    log('already_filled', itemCount(IRON) === 9 && where(IRON) === 'inv=0 grid=9 chest=0' && resultId() === BLOCK + 'x1' ? 'PASS' : 'FAIL',
      where(IRON) + ' result=' + resultId() + ' ' + t + ' ms')

    // insufficient: three ingots total, recipe needs nine
    reset()
    pi.setItem(0, Item.of(IRON, 3))
    t = fill(0, IRON, 9)
    log('insufficient', itemCount(IRON) === 3 ? 'PASS' : 'FAIL', 'total=' + itemCount(IRON) + ' ' + where(IRON) + ' result=' + resultId() + ' ' + t + ' ms')

    // a wrong item in the grid is returned to the inventory, never lost
    reset()
    grid.setItem(4, Item.of('minecraft:cobblestone', 7))
    pi.setItem(0, Item.of(IRON, 9))
    t = fill(0, IRON, 9)
    log('wrong_item_returned', itemCount('minecraft:cobblestone') === 7 && itemCount(IRON) === 9 && resultId() === BLOCK + 'x1' ? 'PASS' : 'FAIL',
      'cobble ' + where('minecraft:cobblestone') + '; iron ' + where(IRON) + ' result=' + resultId() + ' ' + t + ' ms')

    // side slots: ingots in the adjacent chest only
    reset()
    var sideOk = sideSlots.length > 0
    if (sideOk) {
      for (var c = 0; c < 9; c++) chest.setItem(c, Item.of(IRON))
      t = fill(0, IRON, 9)
      log('side_slots', itemCount(IRON) === 9 && where(IRON) === 'inv=0 grid=9 chest=0' && resultId() === BLOCK + 'x1' ? 'PASS' : 'FAIL',
        'sideSlots=' + sideSlots.length + ' ' + where(IRON) + ' result=' + resultId() + ' ' + t + ' ms')
      // hidden side slot beyond the first visible rows
      reset()
      chest.setItem(26, Item.of(IRON, 9))
      t = fill(0, IRON, 9)
      log('side_slots_hidden', itemCount(IRON) === 9 ? 'PASS' : 'FAIL', where(IRON) + ' result=' + resultId() + ' ' + t + ' ms')
    } else {
      log('side_slots', 'FAIL', 'the menu built no SideContainerSlot: the chest was not detected')
    }

    // round trip: nine ingots -> block (craft action 1) -> nine ingots
    reset()
    pi.setItem(0, Item.of(IRON, 9))
    fill(1, IRON, 9)
    var carried = menu.getCarried()
    var blockOk = !carried.isEmpty() && String(carried.id) === BLOCK && carried.getCount() === 1 && itemCount(IRON) === 0
    log('craft_block', blockOk ? 'PASS' : 'FAIL', 'carried=' + carried + ' ingots left=' + itemCount(IRON) + ' grid=' + gridDump())
    grid.clearContent()
    menu.setCarried(Item.empty)
    menu.getSlot(5).set(Item.of(BLOCK))
    var r = resultId()
    log('uncraft_block', r === IRON + 'x9' ? 'PASS' : 'FAIL', 'result=' + r)

    // shift craft (action 2) leaves nothing behind and creates nothing extra
    reset()
    pi.setItem(0, Item.of(IRON, 9))
    fill(2, IRON, 9)
    log('shift_craft', itemCount(BLOCK) === 1 && itemCount(IRON) === 0 ? 'PASS' : 'FAIL', 'blocks=' + itemCount(BLOCK) + ' ingots=' + itemCount(IRON) + ' grid=' + gridDump())

    // clay 2x2 is a vanilla recipe again
    reset()
    menu.getSlot(1).set(Item.of('minecraft:clay_ball'))
    menu.getSlot(2).set(Item.of('minecraft:clay_ball'))
    menu.getSlot(4).set(Item.of('minecraft:clay_ball'))
    menu.getSlot(5).set(Item.of('minecraft:clay_ball'))
    log('clay_2x2', resultId() === 'minecraft:clayx1' ? 'PASS' : 'FAIL', 'result=' + resultId())
  }

  function runTimings() {
    reset()
    var rm = srv.getRecipeManager()
    var CT = Java.loadClass('net.minecraft.world.item.crafting.RecipeType').CRAFTING
    var hit = 0, miss = 0
    for (var g = 0; g < 9; g++) grid.setItem(g, Item.of('minecraft:iron_ingot'))
    var cm = menu.craftMatrix
    var t0 = JSys.nanoTime()
    for (var i = 0; i < 20; i++) rm.getRecipeFor(CT, cm, level)
    hit = (JSys.nanoTime() - t0) / 20 / 1e6
    grid.clearContent()
    grid.setItem(0, Item.of('minecraft:dirt'))
    grid.setItem(4, Item.of('minecraft:stick'))
    t0 = JSys.nanoTime()
    for (var j = 0; j < 20; j++) rm.getRecipeFor(CT, cm, level)
    miss = (JSys.nanoTime() - t0) / 20 / 1e6
    log('lookup_cost', 'INFO', 'getRecipeFor(CRAFTING): match ' + hit.toFixed(2) + ' ms, miss ' + miss.toFixed(2) + ' ms, crafting recipes ' +
      rm.getAllRecipesFor(CT).size())

    // one full craft by click: take the result of nine ingots from the output slot, as a player does
    reset()
    for (var k = 0; k < 9; k++) grid.setItem(k, Item.of('minecraft:iron_ingot'))
    t0 = JSys.nanoTime()
    menu.clicked(0, 0, ClickType.PICKUP, player)
    var tClick = ms(t0)
    log('craft_click', 'INFO', 'PICKUP on the result slot (nine ingots): ' + tClick + ' ms, carried=' + menu.getCarried() + ' grid=' + gridDump())
    reset()
    for (var m = 0; m < 9; m++) grid.setItem(m, Item.of('minecraft:iron_ingot'))
    t0 = JSys.nanoTime()
    menu.clicked(0, 0, ClickType.QUICK_MOVE, player)
    log('craft_shift_click', 'INFO', 'QUICK_MOVE on the result slot: ' + ms(t0) + ' ms, blocks=' + itemCount('minecraft:iron_block'))
  }

  ServerEvents.customCommand('gg_test_craftingstation', function (event) {
    try {
      srv = event.server
      checkRecipes()
      level = srv.overworld()
      var FPF = Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory')
      player = FPF.getMinecraft(level)
      Menu = Java.loadClass('com.leclowndu93150.craftingstationjei.menu.CraftingStationMenu')
      var BlockPos = Java.loadClass('net.minecraft.core.BlockPos')
      var spawn = level.getSharedSpawnPos()
      chestPos = new BlockPos(spawn.getX(), 200, spawn.getZ())
      stationPos = chestPos.west()
      player.setPos(chestPos.getX() + 0.5, chestPos.getY() + 1.0, chestPos.getZ() + 0.5)
      level.getChunkAt(chestPos)
      var Blocks = Java.loadClass('net.minecraft.world.level.block.Blocks')
      level.setBlockAndUpdate(chestPos, Blocks.CHEST.defaultBlockState())
      chest = level.getBlockEntity(chestPos)
      grid = newGrid()
      runMenuCases()
      runTimings()
      level.setBlockAndUpdate(chestPos, Blocks.AIR.defaultBlockState())
    } catch (e) {
      log('script', 'FAIL', 'exception: ' + e + (e.stack ? ' ' + e.stack : ''))
    }
    log('DONE', 'NOTE')
    return 1
  })
})()
