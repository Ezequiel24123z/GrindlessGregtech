// Gregtech Grindless - smoke test of the wireless energy network (TEST-ONLY overlay: copied over the instance on the test PC, never shipped
// with the pack): startup_scripts/grindless/lv/wireless_energy.js, server_scripts/grindless/lv/wireless_energy.js and the table
// kubejs/data/grindless/tables/wireless_energy.json.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_wireless_energy;;kubejs custom_command gg_test_recipe_lookup;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|wireless_energy\|DONE@@1200;;GGTEST\|lookup\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|wireless_energy|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|wireless_energy|DONE.
//   static (no world)
//     registry          40 hatches (GTM's EnergyHatchPartMachine, 2/4/16/64 A, LV-IV) with GTM's INPUT_ENERGY / OUTPUT_ENERGY, the tower
//                       (dummy recipe type), 5 cells, 10 cover items, 10 cover definitions in GTM's own cover registry (marker class)
//     buffers           GTM's own buffer sizes: an energy hatch V x 16 x A, a dynamo hatch V x 64 x A (the settlement period's reason)
//     recipes           every recipe of the table's design exists, makes its block, at the tier's VA; the 4/16/64 A ones take the one below
//   in the world: the Overworld X 13312-13375, Z 0-63, Y 98-112 (roof at Y 112), the Moon (gcyr:luna) same X and Z, Y 198-214
//     ARRAY/EBF/...     the structures placed and formed (the LV generator array with one 64 A LV wireless dynamo hatch; on the Moon an
//                       EBF with two LV wireless energy hatches, an LV macerator with an LV energy cover, an MV wireless energy hatch)
//     NO_TOWER          before any tower: the generator array runs, its dynamo hatch backs up, nothing reaches the network, the readout
//                       (a fake player's shift-click on the dynamo hatch) says no tower
//     TOWERS            tower A (4 LV cells) and tower B (2 MV cells) form; the network adds them: 7,920,000 EU, tier LV (the weakest
//                       cell of every tower); the controller's lines
//     RUN_*             with exact EU: the 64 A dynamo hatch puts 19/20 of what it gives into the network (the generator array makes
//                       512 EU/t: its steam pays it), the dynamo cover drains a charged battery buffer at 95%, the Moon's EBF runs
//                       on its wireless hatches (120 EU/t of recipe progress, all from the network), the Moon's macerator runs on its
//                       cover, the MV hatch gets nothing (the network is LV; its readout says so), and the store's balance is in - out
//     UNLOADED          the whole Overworld band unloaded (a chunk next to a force-loaded one stays loaded), the Moon running: both
//                       towers still count (recorded), the far buffer's cover pauses; RESUMED: loaded again, the towers form again and
//                       the cover takes EU again
//     SWAP              tower A's LV cells swapped for MV ones: the tower unforms (its capacity leaves, the stored EU stays), reforms,
//                       the network turns MV (15,120,000 EU) and the MV hatch is filled
//     CAP               the store set just under its capacity: it never goes over, deposits only fill the room consumers make, the
//                       dynamo hatch backs up
//     COVER_CLICK       a fake player right-clicks an LV macerator holding two LV energy covers: one goes on (GTM's placeCoverOnSide),
//                       the event is cancelled, one is left; the shift-click readout on it; GTM's removeCover gives the item back
//     SAVE_RELOAD       save-all flush, the saved kubejs_persistent_data.nbt read back (NBTIO): the list and the store as they were;
//                       both keys dropped and merged back from the file (KubeJS's own load path): the network is the same
// TEST AREA: this test force-loads, clears and builds ONLY its band in each dimension (AGENTS.md: tests run at the same time in one server),
// and clears and releases it at the end, with its persistent data keys.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'wireless_energy'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestWirelessEnergyRequest'
  var TEST_TIMEOUT = 4000

  var EARTH = 'minecraft:overworld'
  var MOON = 'gcyr:luna'
  var BAND = { x0: 13312, x1: 13375, z0: 0, z1: 63 }
  var BAND_Y = {}
  BAND_Y[EARTH] = [98, 112]
  BAND_Y[MOON] = [198, 214]
  var ROOF_Y = 112
  var EY = 100
  var MY = 200

  // the Overworld: tower A, the generator array, the dynamo cover's battery buffer, the click macerator; the back rows: tower B, a buffer
  var TOWER_A = { x: 13316, z: 20 }
  var TOWER_B = { x: 13330, z: 52 }
  var ARRAY = { x: 13348, z: 4 }
  var DYN_BUFFER = { x: 13364, z: 2 }
  var FAR_BUFFER = { x: 13342, z: 52 }
  var CLICK_MAC = { x: 13370, z: 20 }
  // the Moon: the EBF, the covered macerator, the MV hatch
  var EBF = { x: 13316, z: 6 }
  var MOON_MAC = { x: 13326, z: 4 }
  var MV_HATCH = { x: 13332, z: 4 }

  var LV_CELL = 'grindless:lv_capacitor_cell'
  var MV_CELL = 'grindless:mv_capacitor_cell'
  var DYNAMO_64A = 'gtceu:lv_wireless_dynamo_hatch_64a'
  var HATCH_LV = 'gtceu:lv_wireless_energy_hatch'
  var HATCH_MV = 'gtceu:mv_wireless_energy_hatch'
  var ARRAY_ID = 'gtceu:generator_array'
  var STEAM = 'gtceu:steam'
  var BUFFER = 'gtceu:lv_battery_buffer_4x'
  var BATTERY = 'gtceu:lv_sodium_battery'
  var MACERATOR = 'gtceu:lv_macerator'

  var S = null
  var J = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3500)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = TAG + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  function guarded(name, fn) {
    try {
      fn()
    } catch (e) {
      check(name, false, 'exception: ' + e)
    }
  }

  // ---------------------------------------------------------------- Java

  function lazy() {
    if (J !== null) return J
    J = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      Direction: Java.loadClass('net.minecraft.core.Direction'),
      AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
      Vec3: Java.loadClass('net.minecraft.world.phys.Vec3'),
      BHR: Java.loadClass('net.minecraft.world.phys.BlockHitResult'),
      Hand: Java.loadClass('net.minecraft.world.InteractionHand'),
      ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity'),
      LevelResource: Java.loadClass('net.minecraft.world.level.storage.LevelResource'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
      FPF: Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory'),
      FH: Java.loadClass('net.minecraftforge.common.ForgeHooks'),
      AL: Java.loadClass('java.util.ArrayList'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      PartAbility: Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.PartAbility'),
      GTCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.GTCapabilityHelper'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      EHPM: Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.EnergyHatchPartMachine')
    }
    return J
  }

  function W() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.settle !== 'function') throw new Error('global.grindless.wireless is incomplete (the server script did not load)')
    return w
  }

  function rl(id) { return new (lazy().RL)(id) }
  function bp(x, y, z) { return new (lazy().BlockPos)(x, y, z) }
  function levelOf(dim) { return dim === MOON ? S.moon : S.earth }
  function cmd(dim, text) { return S.server.runCommandSilent('execute in ' + dim + ' run ' + text) }
  function asArray(coll) {
    var list = new (lazy().AL)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function machineAt(dim, x, y, z) {
    var m = lazy().MetaMachine.getMachine(levelOf(dim), bp(x, y, z))
    return m === null || m === undefined ? null : m
  }
  function stored(m) { return m === null ? -1 : Number(m.energyContainer.getEnergyStored()) }
  function fmt(n) { return String(Math.round(n)) }
  function flowOf(dim, p, y, side) {
    var f = W().flows[dim + '|' + p.x + '|' + y + '|' + p.z + '|' + (side || '')]
    return f || { drained: 0, in: 0, filled: 0 }
  }
  function textOf(c) {
    if (c === null || c === undefined) return ''
    return typeof c === 'string' ? c : (c.getString ? String(c.getString()) : String(c))
  }

  function charged(stack) {
    var e = lazy().GTCap.getElectricItem(stack)
    if (e !== null) e.charge(Number(e.getMaxCharge()), Number(e.getTier()), true, false)
    return stack
  }
  function chargeOf(buffer) {
    if (buffer === null) return -1
    var inv = buffer.getBatteryInventory()
    var n = 0
    for (var i = 0; i < inv.getSlots(); i++) {
      var s = inv.getStackInSlot(i)
      var e = s.isEmpty() ? null : lazy().GTCap.getElectricItem(s)
      if (e !== null) n += Number(e.getCharge())
    }
    return n
  }

  function fakePlayer(dim) {
    if (!S.fake) S.fake = {}
    if (!S.fake[dim]) S.fake[dim] = lazy().FPF.getMinecraft(levelOf(dim))
    return S.fake[dim]
  }

  // a fake player's shift-click with an empty hand on the block (the readout), from above it
  function shiftClick(dim, x, y, z, face) {
    var L = lazy()
    var fp = fakePlayer(dim)
    fp.setItemInHand(L.Hand.MAIN_HAND, Item.empty)
    fp.setShiftKeyDown(true)
    fp.setPositionAndRotation(x + 0.5, y + 2.2, z + 0.5, 0, 90)
    W().lastReadout = null
    var pos = bp(x, y, z)
    L.FH.onRightClickBlock(fp, L.Hand.MAIN_HAND, pos, new L.BHR(new L.Vec3(x + 0.5, y + 1.0, z + 0.5), face || L.Direction.UP, pos, false))
    fp.setShiftKeyDown(false)
    var r = W().lastReadout
    return r ? r.key + ' [' + r.args.join(', ') + ']' : '(no readout)'
  }

  // ---------------------------------------------------------------- static checks

  function checkRegistry() {
    var w = W()
    var L = lazy()
    var bad = []
    var ins = {}
    var outs = {}
    asArray(L.PartAbility.INPUT_ENERGY.getAllBlocks()).forEach(function (b) { ins[String(L.BI.BLOCK.getKey(b))] = true })
    asArray(L.PartAbility.OUTPUT_ENERGY.getAllBlocks()).forEach(function (b) { outs[String(L.BI.BLOCK.getKey(b))] = true })
    w.hatchIds.forEach(function (id) {
      var h = w.hatches[id]
      var def = L.GTRegistries.MACHINES.get(rl(id))
      if (!def) { bad.push('no machine ' + id); return }
      if (Number(def.getTier()) !== h.tier) bad.push(id + ' tier ' + def.getTier())
      if (h.kind === 'hatch' && !ins[id]) bad.push(id + ' lacks INPUT_ENERGY')
      if (h.kind === 'dynamo' && !outs[id]) bad.push(id + ' lacks OUTPUT_ENERGY')
    })
    var tower = L.GTRegistries.MACHINES.get(rl(w.towerId))
    var types = []
    if (!tower) bad.push('no ' + w.towerId)
    else {
      var arr = tower.getRecipeTypes()
      for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
      if (types.join(',') !== 'gtceu:dummy') bad.push('tower types ' + types.join(','))
    }
    w.cellIds.forEach(function (id) { if (!Item.exists(id)) bad.push('no cell ' + id) })
    var classes = {}
    w.coverList.forEach(function (c) {
      if (!Item.exists(c.item)) bad.push('no item ' + c.item)
      var def = L.GTRegistries.COVERS.get(rl(c.def))
      if (def === null || def === undefined) bad.push('no cover ' + c.def)
    })
    check('registry', bad.length === 0, w.hatchIds.length + ' hatches (2/4/16/64 A x LV-IV x energy/dynamo) in GTM\'s ability lists, ' + w.towerId + ' types ' +
      types.join(',') + ', ' + w.cellIds.length + ' cells, ' + w.coverList.length + ' covers in GTM\'s cover registry (marker ' + w.coverMarker + ')' +
      (bad.length ? ' BAD ' + bad.join('; ') : ''))
  }

  function checkBuffers() {
    var w = W()
    var L = lazy()
    var lines = []
    var bad = []
    // GTM 7.5.3's numbers for our hatches: what a placed one holds (the world part reads the live ones)
    ;[[1, 2], [1, 64], [5, 64]].forEach(function (ta) {
      var inCap = Number(GTValues.V[ta[0]]) * 16 * ta[1]
      var outCap = Number(L.EHPM.getHatchEnergyCapacity(ta[0], ta[1]))
      lines.push(w.tierNames[ta[0]].toUpperCase() + ' ' + ta[1] + ' A: energy hatch ' + inCap + ' EU (16 ticks), dynamo hatch ' + outCap + ' EU (64 ticks)')
      if (outCap !== Number(GTValues.V[ta[0]]) * 64 * ta[1]) bad.push('dynamo capacity ' + outCap)
    })
    if (w.settleTicks >= 16) bad.push('settlement every ' + w.settleTicks + ' ticks: an energy hatch at full draw would starve')
    check('buffers', bad.length === 0, lines.join('; ') + '; settlement every ' + w.settleTicks + ' ticks' + (bad.length ? ' BAD ' + bad.join('; ') : ''))
  }

  function checkRecipes() {
    var w = W()
    var L = lazy()
    var rm = S.server.getRecipeManager()
    var bad = []
    var n = 0
    w.recipes.forEach(function (r) {
      var opt = rm.byKey(rl(r.id))
      if (!opt.isPresent()) { bad.push('missing ' + r.id); return }
      var rec = opt.get()
      n++
      var outs = asArray(rec.getOutputContents(L.ItemCap)).map(function (c) {
        try { var j = JSON.parse(String(c.content.toJson())); return String((j.ingredient || j).item) } catch (e) { return '?' }
      })
      if (outs.join(',') !== r.output) bad.push(r.id + ' makes ' + outs.join(','))
      var eut = Number(L.RecipeHelper.getRealEUt(rec).getTotalEU())
      if (eut !== r.eut) bad.push(r.id + ' ' + eut + ' EU/t')
    })
    var amps = w.recipes.filter(function (r) { return /_(4|16|64)a$/.test(r.output) && r.output.indexOf('gtceu:lv_') === 0 })
      .map(function (r) { return r.output.replace('gtceu:', '') + ' <- ' + r.inputs.join(' + ') })
    check('recipes', bad.length === 0 && n === w.recipes.length, n + ' of ' + w.recipes.length + ' recipes (tower, 5 cells, 40 hatches, 10 covers) in the assembler at their tier\'s VA; LV amperage steps: ' +
      amps.join(' ; ') + (bad.length ? ' BAD ' + bad.join('; ') : ''))
  }

  // ---------------------------------------------------------------- the world

  // vanilla's fill takes at most 32,768 blocks: the band (64 x 64 x up to 17) goes in strips of 16 along Z
  function fillBand(dim, y0, y1, block) {
    var n = 0
    for (var z = BAND.z0; z <= BAND.z1; z += 16) {
      n += Number(cmd(dim, 'fill ' + BAND.x0 + ' ' + y0 + ' ' + z + ' ' + BAND.x1 + ' ' + y1 + ' ' + Math.min(z + 15, BAND.z1) + ' ' + block))
    }
    return n
  }

  function prepareWorld() {
    S.areaTouched = true
    ;[MOON, EARTH].forEach(function (dim) {
      var level = levelOf(dim)
      for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
        for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) level.getChunk(cx, cz)
      }
      var loaded = cmd(dim, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      var cleared = fillBand(dim, BAND_Y[dim][0], BAND_Y[dim][1], 'air')
      if (dim === EARTH) fillBand(dim, ROOF_Y, ROOF_Y, 'minecraft:smooth_stone')
      note('AREA_' + (dim === MOON ? 'moon' : 'earth'), dim + ' band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND_Y[dim][0] + '-' + BAND_Y[dim][1] + ' Z ' +
        BAND.z0 + '-' + BAND.z1 + ': generated, forceload add ' + loaded + ', cleared ' + cleared + (dim === EARTH ? ', roof at Y ' + ROOF_Y : ''))
    })
  }

  function cleanup() {
    if (!S.areaTouched) return
    ;[MOON, EARTH].forEach(function (dim) {
      var level = levelOf(dim)
      cmd(dim, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      var items = level.getEntitiesOfClass(lazy().ItemEntity, new (lazy().AABB)(BAND.x0, BAND_Y[dim][0], BAND.z0, BAND.x1 + 1, BAND_Y[dim][1] + 1, BAND.z1 + 1))
      for (var i = 0; i < items.size(); i++) items.get(i).discard()
      var cleared = fillBand(dim, BAND_Y[dim][0], BAND_Y[dim][1], 'air')
      var released = cmd(dim, 'forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      note('CLEANUP_' + (dim === MOON ? 'moon' : 'earth'), 'cleared ' + cleared + ' blocks, forceload remove ' + released + ', ' + items.size() + ' item entities removed')
    })
    try {
      var w = W()
      S.server.persistentData.remove(w.blocksKey)
      S.server.persistentData.remove(w.storeKey)
      w.dropCache()
    } catch (e) {
      note('CLEANUP_data', 'could not drop the network keys: ' + e)
    }
  }

  function setblock(dim, x, y, z, block, failed) {
    if (Number(cmd(dim, 'setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')) >= 1) return
    // setblock changes nothing (and returns 0) when that block is already there
    var want = String(block).split('[')[0]
    if (want.indexOf(':') < 0) want = 'minecraft:' + want
    var have = String(levelOf(dim).getBlock(x, y, z).id)
    if (have !== want) failed.push(dim + ' ' + x + ',' + y + ',' + z + ' ' + block + ' (is ' + have + ')')
  }

  // a structure from lib/patterns.js's description, the controller facing north at (cx, cy, cz), the structure behind it.
  // choose(sym, slice, row, col) -> a block id with its properties, or null for the description's own block
  function placeStructure(dim, machineId, cx, cy, cz, choose, failed) {
    var desc = global.grindless.patterns.describe(machineId)
    if (!desc) throw new Error('no structure description for ' + machineId)
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    var count = 0
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') continue
          var id = choose ? choose(sym, si, ri, ci, desc) : null
          if (id === null || id === undefined) {
            if (sym.kind === 'frames') id = 'gtceu:' + sym.materials[0] + '_frame'
            else if (sym.kind === 'blocks') id = sym.blocks[0]
            else if (sym.kind === 'oneOf') {
              for (var k = 0; k < sym.options.length && !id; k++) if (sym.options[k].kind === 'blocks') id = sym.options[k].blocks[0]
            }
          }
          setblock(dim, cx - (ci - ctrl.ci), cy + (ri - ctrl.ri), cz - (si - ctrl.si), id, failed)
          count++
        }
      })
    })
    setblock(dim, cx, cy, cz, machineId + '[facing=north]', failed)
    return { blocks: count + 1, ctrl: ctrl, slices: desc.slices.length }
  }

  // tower: `cells` cell ids from the front of the first cell slots, the casing (an empty slot) after them
  function placeTower(dim, at, cellIds) {
    var failed = []
    var used = 0
    var r = placeStructure(dim, W().towerId, at.x, EY, at.z, function (sym) {
      if (sym.kind !== 'oneOf') return null
      if (used < cellIds.length) return cellIds[used++]
      return W().casing
    }, failed)
    return { failed: failed, blocks: r.blocks, cells: used }
  }

  // the cells of a placed tower (same order as placeTower): their positions
  function towerCellPositions(at) {
    var desc = global.grindless.patterns.describe(W().towerId)
    var ctrl = null
    var cells = []
    desc.slices.forEach(function (rows, si) { rows.forEach(function (row, ri) { for (var ci = 0; ci < row.length; ci++) { var s = desc.symbols[row.charAt(ci)]; if (s && s.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci } } }) })
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'oneOf') cells.push({ x: at.x - (ci - ctrl.ci), y: EY + (ri - ctrl.ri), z: at.z - (si - ctrl.si) })
        }
      })
    })
    return cells
  }

  // the generator array, its front floor row: input hatch (col 0), the 64 A LV wireless dynamo hatch (col 4, under the controller),
  // output hatch (col 8)
  function placeArray(failed) {
    return placeStructure(EARTH, ARRAY_ID, ARRAY.x, EY, ARRAY.z, function (sym, si, ri, ci, desc) {
      if (si !== desc.slices.length - 1 || ri !== 0) return null
      if (ci === 0) return 'gtceu:hv_input_hatch[facing=north]'
      if (ci === 4) return DYNAMO_64A + '[facing=north]'
      if (ci === 8) return 'gtceu:lv_output_hatch[facing=north]'
      return null
    }, failed)
  }

  // GTM's EBF (GTMultiMachines: aisles back -> front, rows bottom -> top), controller at (x, MY, z) facing north. Bottom layer: front
  // left the input bus, front right the output bus, back middle and back left the two LV wireless energy hatches; coils on the two
  // middle layers (air in the middle), the muffler on top in the middle.
  function placeEbf(failed) {
    var cx = EBF.x
    var cz = EBF.z
    var casing = 'gtceu:heatproof_machine_casing'
    var coil = 'gtceu:cupronickel_coil_block'
    for (var dz = 0; dz <= 2; dz++) {
      for (var dx = -1; dx <= 1; dx++) {
        var x = cx + dx
        var z = cz + dz
        setblock(MOON, x, MY, z, casing, failed)
        setblock(MOON, x, MY + 3, z, casing, failed)
        if (dz === 1 && dx === 0) {
          setblock(MOON, x, MY + 1, z, 'air', failed)
          setblock(MOON, x, MY + 2, z, 'air', failed)
        } else {
          setblock(MOON, x, MY + 1, z, coil, failed)
          setblock(MOON, x, MY + 2, z, coil, failed)
        }
      }
    }
    setblock(MOON, cx - 1, MY, cz, 'gtceu:lv_input_bus[facing=north]', failed)
    setblock(MOON, cx + 1, MY, cz, 'gtceu:lv_output_bus[facing=north]', failed)
    setblock(MOON, cx, MY, cz + 2, HATCH_LV + '[facing=south]', failed)
    setblock(MOON, cx - 1, MY, cz + 2, HATCH_LV + '[facing=south]', failed)
    setblock(MOON, cx, MY + 3, cz + 1, 'gtceu:lv_muffler_hatch[facing=up]', failed)
    setblock(MOON, cx, MY, cz, 'gtceu:electric_blast_furnace[facing=north]', failed)
  }

  function buildFirst() {
    var w = W()
    var L = lazy()
    var failed = []
    // the Overworld: the generator array, the dynamo cover's charged buffer, the far buffer, the click macerator
    S.arrayPlan = placeArray(failed)
    setblock(EARTH, DYN_BUFFER.x, EY, DYN_BUFFER.z, BUFFER + '[facing=north]', failed)
    setblock(EARTH, FAR_BUFFER.x, EY, FAR_BUFFER.z, BUFFER + '[facing=north]', failed)
    setblock(EARTH, CLICK_MAC.x, EY, CLICK_MAC.z, MACERATOR + '[facing=north]', failed)
    // the Moon: the EBF, the covered macerator, the MV hatch
    placeEbf(failed)
    setblock(MOON, MOON_MAC.x, MY, MOON_MAC.z, MACERATOR + '[facing=north]', failed)
    setblock(MOON, MV_HATCH.x, MY, MV_HATCH.z, HATCH_MV + '[facing=north]', failed)

    S.dynBuffer = machineAt(EARTH, DYN_BUFFER.x, EY, DYN_BUFFER.z)
    S.farBuffer = machineAt(EARTH, FAR_BUFFER.x, EY, FAR_BUFFER.z)
    S.moonMac = machineAt(MOON, MOON_MAC.x, MY, MOON_MAC.z)
    S.mvHatch = machineAt(MOON, MV_HATCH.x, MY, MV_HATCH.z)
    var inv = S.dynBuffer.getBatteryInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, charged(Item.of(BATTERY)))
    var inv2 = S.farBuffer.getBatteryInventory()
    for (var j = 0; j < inv2.getSlots(); j++) inv2.setStackInSlot(j, Item.of(BATTERY))
    S.moonMac.importItems.setStackInSlot(0, Item.of('minecraft:iron_ingot', 64))

    // the network's blocks: the hatches tracked as a placing player would, the covers through the network's own placing
    var fp = fakePlayer(EARTH)
    var tracked = []
    tracked.push(w.track(S.earth, bp(ARRAY.x, EY - 1, ARRAY.z)))
    tracked.push(w.track(S.moon, bp(EBF.x, MY, EBF.z + 2)))
    tracked.push(w.track(S.moon, bp(EBF.x - 1, MY, EBF.z + 2)))
    tracked.push(w.track(S.moon, bp(MV_HATCH.x, MY, MV_HATCH.z)))
    var c1 = w.placeCover(S.earth, bp(DYN_BUFFER.x, EY, DYN_BUFFER.z), L.Direction.UP, Item.of(w.coverItemId('dynamo', 1)), fp)
    var c2 = w.placeCover(S.earth, bp(FAR_BUFFER.x, EY, FAR_BUFFER.z), L.Direction.UP, Item.of(w.coverItemId('energy', 1)), fp)
    var c3 = w.placeCover(S.moon, bp(MOON_MAC.x, MY, MOON_MAC.z), L.Direction.UP, Item.of(w.coverItemId('energy', 1)), fakePlayer(MOON))
    var lines = tracked.map(function (e) { return e ? e.k + ' ' + e.d + ' ' + e.x + ',' + e.y + ',' + e.z + ' t' + e.t + ' ' + e.a + 'A' : 'null' })
    var covers = [c1, c2, c3].map(function (c) { return c.ok + ' (' + textOf(c.message) + ')' })
    check('PLACED', failed.length === 0 && tracked.every(function (e) { return e !== null }) && c1.ok && c2.ok && c3.ok,
      'generator array ' + S.arrayPlan.blocks + ' blocks; tracked [' + lines.join(' ; ') + ']; covers: dynamo on the charged buffer ' + covers[0] +
      ', energy on the far buffer ' + covers[1] + ', energy on the Moon macerator ' + covers[2] + '; Moon macerator ' + S.moonMac.getClass().getSimpleName() +
      ' holds ' + stored(S.moonMac) + '/' + Number(S.moonMac.energyContainer.getEnergyCapacity()) + ' EU' + (failed.length ? ' FAILED ' + failed.slice(0, 8).join('; ') : ''))
    return failed.length === 0
  }

  // ---------------------------------------------------------------- formation

  function formedOrForce(name, m, waited) {
    if (m === null) return 'missing'
    if (m.isFormed()) return 'formed'
    if (waited < 100) return 'waiting'
    if (m.checkPatternWithLock()) {
      m.setFlipped(m.getMultiblockState().isNeededFlip())
      m.onStructureFormed()
      note(name + '_forced', 'not formed by itself after ' + waited + ' ticks; a synchronous check passes (forming it)')
      return 'formed'
    }
    return waited > 300 ? 'failed: ' + m.getMultiblockState().error : 'waiting'
  }

  // ---------------------------------------------------------------- the generator array

  function arrayParts() {
    var ctrl = machineAt(EARTH, ARRAY.x, EY, ARRAY.z)
    var P = { ctrl: ctrl, input: null, output: null, dynamo: null }
    asArray(ctrl.getParts()).forEach(function (p) {
      var id = String(p.getDefinition().getId())
      if (id === 'gtceu:hv_input_hatch') P.input = p
      else if (id === 'gtceu:lv_output_hatch') P.output = p
      else if (id === DYNAMO_64A) P.dynamo = p
    })
    return P
  }

  function steamIn(P) {
    var st = P.input.tank.getFluidInTank(0)
    return st.isEmpty() ? 0 : Number(st.getAmount())
  }

  // tops the steam up to 60,000 mB and counts what the test added
  function feedSteam() {
    var P = S.arrayP
    var now = steamIn(P)
    if (now >= 30000) return
    P.input.tank.setFluidInTank(0, Fluid.of(STEAM, 60000).getFluidStack())
    S.steamAdded += 60000 - now
  }

  // ---------------------------------------------------------------- phases

  function startNoTower() {
    var w = W()
    S.arrayP = arrayParts()
    S.steamAdded = 0
    S.arrayP.ctrl.setActiveRecipeType(0)
    feedSteam()
    var dirs = []
    S.ebf = machineAt(MOON, EBF.x, MY, EBF.z)
    S.ebfHatches = [machineAt(MOON, EBF.x, MY, EBF.z + 2), machineAt(MOON, EBF.x - 1, MY, EBF.z + 2)]
    var bus = machineAt(MOON, EBF.x - 1, MY, EBF.z)
    bus.getInventory().setStackInSlot(0, Item.of('gtceu:steel_dust', 8))
    S.arrayP.ctrl.getRecipeLogic().updateTickSubscription()
    S.ebf.getRecipeLogic().updateTickSubscription()
    S.moonMac.getRecipeLogic().updateTickSubscription()
    w.setStored(S.server, 0)
    S.noTower = { start: S.t, dynStart: stored(S.arrayP.dynamo), work: 0 }
    note('array_parts', 'input ' + (S.arrayP.input !== null) + ', output ' + (S.arrayP.output !== null) + ', dynamo ' + (S.arrayP.dynamo ? S.arrayP.dynamo.getDefinition().getId() +
      ' ' + Number(S.arrayP.dynamo.energyContainer.getOutputVoltage()) + ' V x ' + Number(S.arrayP.dynamo.energyContainer.getOutputAmperage()) + ' A, holds ' +
      Number(S.arrayP.dynamo.energyContainer.getEnergyCapacity()) : 'MISSING') + '; dynamo capacity read by lib/generators.js ' + global.grindless.generators.dynamoCapacity(S.arrayP.ctrl) + ' EU/t')
  }

  function reportNoTower() {
    var w = W()
    var st = w.status(S.server)
    var dyn = stored(S.arrayP.dynamo)
    var readout = shiftClick(EARTH, ARRAY.x, EY - 1, ARRAY.z, lazy().Direction.UP)
    check('NO_TOWER', !st.up && w.stored(S.server) === 0 && dyn > S.noTower.dynStart && w.totals.in === 0 && w.totals.out === 0 && /wireless\.no_tower/.test(readout),
      'over ' + (S.t - S.noTower.start) + ' ticks with no tower: the array worked ' + S.noTower.work + ' ticks, its dynamo hatch went ' + S.noTower.dynStart + ' -> ' + dyn +
      ' EU (backing up), the network ' + JSON.stringify(st) + ', in ' + w.totals.in + ' out ' + w.totals.out + '; readout: ' + readout)
  }

  function startTowers() {
    var failed = []
    var a = placeTower(EARTH, TOWER_A, [LV_CELL, LV_CELL, LV_CELL, LV_CELL])
    var b = placeTower(EARTH, TOWER_B, [MV_CELL, MV_CELL])
    failed = failed.concat(a.failed, b.failed)
    var w = W()
    // tracked when placed (BlockEvents.placed does it for a player; /setblock fires no event)
    S.towerA = w.track(S.earth, bp(TOWER_A.x, EY, TOWER_A.z))
    S.towerB = w.track(S.earth, bp(TOWER_B.x, EY, TOWER_B.z))
    note('towers_placed', 'tower A ' + a.blocks + ' blocks, ' + a.cells + ' LV cells; tower B ' + b.blocks + ' blocks, ' + b.cells + ' MV cells' + (failed.length ? ' FAILED ' + failed.join('; ') : ''))
    S.towersAt = S.t
  }

  function reportTowers() {
    var w = W()
    var st = w.settle(S.server)
    var a = w.towerInfo(machineAt(EARTH, TOWER_A.x, EY, TOWER_A.z))
    var b = w.towerInfo(machineAt(EARTH, TOWER_B.x, EY, TOWER_B.z))
    var want = 4 * 720000 + 2 * 2520000
    var ctrl = machineAt(EARTH, TOWER_A.x, EY, TOWER_A.z)
    var lines = new (lazy().AL)()
    try { ctrl.getDefinition().getAdditionalDisplay().accept(ctrl, lines) } catch (e) { lines.add(Text.of('display failed: ' + e)) }
    var texts = asArray(lines).map(function (c) { return String(c.getString()) })
    check('TOWERS', a.formed && b.formed && a.cells === 4 && a.tier === 1 && b.cells === 2 && b.tier === 2 && st.up && st.capacity === want && st.tier === 1 && st.towers === 2,
      'tower A ' + JSON.stringify(a) + '; tower B ' + JSON.stringify(b) + '; the network: up ' + st.up + ', ' + st.towers + ' towers, capacity ' + st.capacity + ' (want 4 x 720,000 + 2 x 2,520,000 = ' + want +
      '), tier ' + st.tier + ' (the weakest cell: LV); tower A\'s controller lines [' + texts.join(' / ') + ']')
  }

  // the EU a run in progress still owes (a generator) or will still use: its EU/t x the ticks it has left; 0 when no run is on
  function owed(m) {
    var logic = m.getRecipeLogic()
    var last = logic.getLastRecipe()
    if (!logic.isActive() || last === null || last === undefined) return 0
    var io = lazy().RecipeHelper.getRealEUtWithIO(last)
    return Number(io.getTotalEU()) * (Number(logic.getMaxProgress()) - Number(logic.getProgress()))
  }

  // the running phase: snapshots at the start, counts every tick
  function startRun() {
    var w = W()
    var P = S.arrayP
    S.run = {
      start: S.t,
      store: w.stored(S.server),
      totals: JSON.parse(JSON.stringify(w.totals)),
      dyn: stored(P.dynamo),
      dynFlow: JSON.parse(JSON.stringify(flowOf(EARTH, { x: ARRAY.x, z: ARRAY.z }, EY - 1))),
      steamAdded: S.steamAdded,
      steamNow: steamIn(P),
      arrayProgress: Number(P.ctrl.getRecipeLogic().getProgress()),
      arrayOwed: owed(P.ctrl),
      arrayWork: 0,
      cover: chargeOf(S.dynBuffer),
      coverFlow: JSON.parse(JSON.stringify(flowOf(EARTH, DYN_BUFFER, EY, 'up'))),
      ebfHatches: S.ebfHatches.map(stored),
      ebfFlows: S.ebfHatches.map(function (h, i) { return JSON.parse(JSON.stringify(flowOf(MOON, { x: EBF.x - i, z: EBF.z + 2 }, MY))) }),
      ebfProgress: Number(S.ebf.getRecipeLogic().getProgress()),
      ebfWork: 0,
      mac: stored(S.moonMac),
      macFlow: JSON.parse(JSON.stringify(flowOf(MOON, MOON_MAC, MY, 'up'))),
      macProgress: Number(S.moonMac.getRecipeLogic().getProgress()),
      macDust: countItem(S.moonMac.exportItems, 'gtceu:iron_dust'),
      macWork: 0,
      mvMax: 0
    }
  }

  function countItem(handler, id) {
    var n = 0
    for (var i = 0; i < handler.getSlots(); i++) {
      var s = handler.getStackInSlot(i)
      if (!s.isEmpty() && String(s.id) === id) n += s.getCount()
    }
    return n
  }

  function measureRun() {
    var R = S.run
    if (String(S.arrayP.ctrl.getRecipeLogic().getStatus()) === 'WORKING') R.arrayWork++
    if (String(S.ebf.getRecipeLogic().getStatus()) === 'WORKING') R.ebfWork++
    if (String(S.moonMac.getRecipeLogic().getStatus()) === 'WORKING') R.macWork++
    var mv = stored(S.mvHatch)
    if (mv > R.mvMax) R.mvMax = mv
  }

  function reportRun() {
    var w = W()
    var R = S.run
    var P = S.arrayP
    var L = lazy()
    var t = w.totals
    var dIn = t.in - R.totals.in
    var dOut = t.out - R.totals.out
    var dDrained = t.drained - R.totals.drained
    var store = w.stored(S.server)
    // the 5%: every drain is a whole multiple of 20, so in x 20 = drained x 19 exactly
    check('RUN_LOSS', dDrained > 0 && dIn * 20 === dDrained * 19 && t.lost - R.totals.lost === dDrained - dIn,
      'over ' + (S.t - R.start) + ' ticks the network drained ' + dDrained + ' EU from producers and stored ' + dIn + ' (= 19/20 exactly: ' + (dIn * 20) + ' = ' + (dDrained * 19) +
      '), lost ' + (t.lost - R.totals.lost))
    check('RUN_BALANCE', store - R.store === dIn - dOut, 'the store went ' + R.store + ' -> ' + store + ' = in ' + dIn + ' - out ' + dOut)
    // the generator array -> its 64 A dynamo hatch -> the network
    var df = flowOf(EARTH, { x: ARRAY.x, z: ARRAY.z }, EY - 1)
    var hatchDrained = df.drained - R.dynFlow.drained
    var hatchIn = df.in - R.dynFlow.in
    var dyn = stored(P.dynamo)
    var made = dyn - R.dyn + hatchDrained
    var steamUsed = (S.steamAdded - R.steamAdded) - (steamIn(P) - R.steamNow)
    var progress = Number(P.ctrl.getRecipeLogic().getProgress())
    // steam is taken when a run starts (16 parallel runs of 640 mB at once) and pays 1 EU per mB (32 EU/t x 20 ticks per 640 mB) over
    // the run: what the array made in the window = the steam its runs took + what the run on at the start still owed - what the run on
    // at the end still owes
    var owedEnd = owed(P.ctrl)
    var bySteam = steamUsed + R.arrayOwed - owedEnd
    check('RUN_DYNAMO_HATCH', made > 0 && hatchIn * 20 === hatchDrained * 19 && made === bySteam,
      'the generator array worked ' + R.arrayWork + ' ticks and made ' + made + ' EU into its 64 A LV wireless dynamo hatch (held ' + R.dyn + ' -> ' + dyn + ', the network drained ' +
      hatchDrained + ', put ' + hatchIn + ' in the store = 19/20); its steam: ' + steamUsed + ' mB taken, + ' + R.arrayOwed + ' owed by the run on at the start - ' + owedEnd +
      ' still owed at the end (progress ' + R.arrayProgress + ' -> ' + progress + ') = ' + bySteam + ' EU')
    // the dynamo cover on the charged battery buffer
    var cf = flowOf(EARTH, DYN_BUFFER, EY, 'up')
    var coverDrained = cf.drained - R.coverFlow.drained
    var coverIn = cf.in - R.coverFlow.in
    var batteries = R.cover - chargeOf(S.dynBuffer)
    var settlements = t.settlements - R.totals.settlements
    var limit = w.rate(1, w.coverAmps) * w.settleTicks
    check('RUN_DYNAMO_COVER', coverDrained > 0 && batteries === coverDrained && coverIn * 20 === coverDrained * 19 && coverDrained <= limit * settlements,
      'the LV dynamo cover took ' + coverDrained + ' EU out of the buffer\'s batteries (their charge fell ' + batteries + '), ' + coverIn + ' reached the store (19/20); at most ' + limit +
      ' EU per settlement (2 A x 32 V x ' + w.settleTicks + ' ticks), ' + settlements + ' settlements')
    // the Moon's EBF on its two LV wireless energy hatches
    var filled = 0
    var held = 0
    S.ebfHatches.forEach(function (h, i) {
      var f = flowOf(MOON, { x: EBF.x - i, z: EBF.z + 2 }, MY)
      filled += f.filled - R.ebfFlows[i].filled
      held += stored(h) - R.ebfHatches[i]
    })
    var used = filled - held
    var ebfProgress = Number(S.ebf.getRecipeLogic().getProgress()) - R.ebfProgress
    var last = S.ebf.getRecipeLogic().getLastRecipe()
    var eut = last ? Number(L.RecipeHelper.getRealEUt(last).getTotalEU()) : -1
    check('RUN_MOON_EBF', R.ebfWork > 0 && used === ebfProgress * 120 && eut === 120,
      'on the Moon the EBF worked ' + R.ebfWork + ' ticks (' + (last ? last.id : 'no recipe') + ', ' + eut + ' EU/t): progress +' + ebfProgress + ' = ' + (ebfProgress * 120) +
      ' EU, and the network filled its two LV wireless energy hatches with ' + filled + ' EU, ' + held + ' still in them: ' + used + ' EU used')
    // the Moon's macerator on its energy cover
    var mf = flowOf(MOON, MOON_MAC, MY, 'up')
    var macFilled = mf.filled - R.macFlow.filled
    var macUsed = macFilled - (stored(S.moonMac) - R.mac)
    var dust = countItem(S.moonMac.exportItems, 'gtceu:iron_dust') - R.macDust
    var macRecipe = S.moonMac.getRecipeLogic().getLastRecipe()
    var macDuration = macRecipe ? Number(macRecipe.duration) : 0
    var macEut = macRecipe ? Number(L.RecipeHelper.getRealEUt(macRecipe).getTotalEU()) : -1
    var macProgress = Number(S.moonMac.getRecipeLogic().getProgress())
    var byRuns = macEut * (dust * macDuration + macProgress - R.macProgress)
    check('RUN_MOON_COVER', R.macWork > 0 && dust > 0 && macUsed === byRuns && macEut > 0,
      'on the Moon the LV macerator worked ' + R.macWork + ' ticks on its LV energy cover: ' + dust + ' iron dust (' + macEut + ' EU/t x ' + macDuration + ' ticks each, progress ' +
      R.macProgress + ' -> ' + macProgress + ') = ' + byRuns + ' EU; the cover put ' + macFilled + ' EU in, its buffer went ' + R.mac + ' -> ' + stored(S.moonMac) + ': ' + macUsed + ' EU used')
    // the MV hatch: nothing, the network is LV
    var readout = shiftClick(MOON, MV_HATCH.x, MY, MV_HATCH.z, L.Direction.UP)
    check('RUN_TIER_GATE', R.mvMax === 0 && stored(S.mvHatch) === 0 && w.last.skippedAbove > 0 && readout === 'message.grindless.wireless.above_tier [MV, LV]',
      'the MV wireless energy hatch on the Moon held at most ' + R.mvMax + ' EU while the network was LV (skipped above the tier each settlement: ' + w.last.skippedAbove + '); readout: ' + readout)
  }

  // the Overworld band unloaded (every chunk of it: a chunk next to a force-loaded one stays loaded), the Moon still running: both towers
  // still count from what was recorded, the far buffer's cover pauses; loaded again, the towers form again and the cover resumes
  function startUnload() {
    S.unload = { at: S.t, charge: chargeOf(S.farBuffer), flow: JSON.parse(JSON.stringify(flowOf(EARTH, FAR_BUFFER, EY, 'up'))), phase: 'unloading' }
    var released = cmd(EARTH, 'forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    note('unload', 'forceload remove of the Overworld band: ' + released + '; the far buffer held ' + S.unload.charge + ' EU in its batteries; the Moon stays loaded')
  }

  function stepUnload() {
    var U = S.unload
    var w = W()
    var farPos = bp(FAR_BUFFER.x, EY, FAR_BUFFER.z)
    var towerPos = bp(TOWER_B.x, EY, TOWER_B.z)
    if (U.phase === 'unloading') {
      if (!S.earth.isLoaded(farPos) && !S.earth.isLoaded(towerPos) && !S.earth.isLoaded(bp(TOWER_A.x, EY, TOWER_A.z))) {
        U.phase = 'unloaded'
        U.unloadedAt = S.t
        U.flowUnloaded = JSON.parse(JSON.stringify(flowOf(EARTH, FAR_BUFFER, EY, 'up')))
        U.ebfFilled = flowOf(MOON, { x: EBF.x, z: EBF.z + 2 }, MY).filled
      } else if (S.t - U.at > 600) {
        check('UNLOADED', false, 'the Overworld band was still loaded ' + (S.t - U.at) + ' ticks after forceload remove (far buffer ' + S.earth.isLoaded(farPos) + ', tower B ' +
          S.earth.isLoaded(towerPos) + ')')
        cmd(EARTH, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
        U.phase = 'reloading'
        U.reloadAt = S.t
      }
      return
    }
    if (U.phase === 'unloaded' && S.t - U.unloadedAt >= 60) {
      var st = w.settle(S.server)
      var f = flowOf(EARTH, FAR_BUFFER, EY, 'up')
      var ebf = flowOf(MOON, { x: EBF.x, z: EBF.z + 2 }, MY).filled
      var entries = w.tracked(S.server).filter(function (e) { return e.k === 'tower' }).map(function (e) { return JSON.stringify(e) })
      check('UNLOADED', st.towers === 2 && st.capacity === 4 * 720000 + 2 * 2520000 && st.tier === 1 && f.filled === U.flowUnloaded.filled && ebf > U.ebfFilled,
        'with the Overworld band unloaded for ' + (S.t - U.unloadedAt) + ' ticks: the network still counts ' + st.towers + ' towers, ' + st.capacity + ' EU, tier ' + st.tier +
        ' (recorded: ' + entries.join(' ; ') + '); the far buffer\'s cover got nothing (filled ' + U.flowUnloaded.filled + ' -> ' + f.filled + '); the Moon\'s EBF hatch kept drawing (' +
        U.ebfFilled + ' -> ' + ebf + ')')
      cmd(EARTH, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      U.phase = 'reloading'
      U.reloadAt = S.t
      return
    }
    if (U.phase === 'reloading') {
      if (!S.earth.isLoaded(farPos) || !S.earth.isLoaded(towerPos)) {
        // force-loading brings the chunks back on the next ticks; ask for them now so the test does not wait on the chunk system
        S.earth.getChunk(FAR_BUFFER.x >> 4, FAR_BUFFER.z >> 4)
        S.earth.getChunk(TOWER_B.x >> 4, TOWER_B.z >> 4)
        return
      }
      // GTM saves isFormed: a controller comes back formed, and checks its structure again about a second later (its parts and its
      // structure cache are empty until then; the network keeps the towers' recorded cells meanwhile)
      var ctrlA = machineAt(EARTH, TOWER_A.x, EY, TOWER_A.z)
      var ctrlB = machineAt(EARTH, TOWER_B.x, EY, TOWER_B.z)
      var arr = machineAt(EARTH, ARRAY.x, EY, ARRAY.z)
      if (ctrlA !== null && w.towerInfo(ctrlA).pending) U.sawPending = true
      if (!checked(ctrlA) || !checked(ctrlB) || !checked(arr)) {
        if (!U.pendingStore && U.sawPending) {
          var sp = w.settle(S.server)
          U.pendingStore = { towers: sp.towers, capacity: sp.capacity, tier: sp.tier }
        }
        if (S.t - U.reloadAt > 500) {
          check('RESUMED', false, 'after the reload, ' + (S.t - U.reloadAt) + ' ticks: tower A checked ' + checked(ctrlA) + ', tower B ' + checked(ctrlB) + ', array ' + checked(arr))
          U.phase = 'done'
        }
        return
      }
      if (!U.loadedAt) {
        U.loadedAt = S.t
        U.flowLoaded = JSON.parse(JSON.stringify(flowOf(EARTH, FAR_BUFFER, EY, 'up')))
        // the machines were unloaded: fresh references
        S.farBuffer = machineAt(EARTH, FAR_BUFFER.x, EY, FAR_BUFFER.z)
        S.dynBuffer = machineAt(EARTH, DYN_BUFFER.x, EY, DYN_BUFFER.z)
        S.arrayP = arrayParts()
        return
      }
      if (S.t - U.loadedAt >= 60) {
        var f2 = flowOf(EARTH, FAR_BUFFER, EY, 'up')
        var charge = chargeOf(S.farBuffer)
        var st2 = w.settle(S.server)
        var a2 = w.towerInfo(ctrlA)
        var b2 = w.towerInfo(ctrlB)
        var want = 4 * 720000 + 2 * 2520000
        var ps = U.pendingStore
        check('RESUMED', f2.filled > U.flowLoaded.filled && charge > U.charge && st2.towers === 2 && st2.capacity === want && st2.tier === 1 && a2.cells === 4 &&
          b2.cells === 2 && (!ps || (ps.towers === 2 && ps.capacity === want && ps.tier === 1)),
          'loaded again: the towers and the array checked again by GTM ' + (U.loadedAt - U.reloadAt) + ' ticks after the reload' +
          (U.sawPending ? ' (until then the network kept their recorded cells: ' + (ps ? ps.towers + ' towers, ' + ps.capacity + ' EU, tier ' + ps.tier : 'no settlement read') + ')' : '') +
          '; read again: tower A ' + a2.cells + ' cells, tower B ' + b2.cells + ', the network ' + st2.towers + ' towers, ' + st2.capacity + ' EU, tier ' + st2.tier +
          '; the far buffer\'s cover took ' + (f2.filled - U.flowLoaded.filled) + ' EU in ' + (S.t - U.loadedAt) + ' ticks, its batteries ' + U.charge + ' -> ' + charge + ' EU')
        U.phase = 'done'
      }
    }
  }

  // a controller that is formed and has checked its structure since it was loaded (GTM's structure cache is there)
  function checked(m) {
    if (m === null || !m.isFormed()) return false
    var ms = m.getMultiblockState()
    return ms.cache !== null && ms.cache !== undefined
  }

  // tower A's LV cells swapped for MV ones, as a player does it: broken first (the hole unforms the tower: GTM refreshes a structure in
  // place only while every block still fits), then the MV cells placed (GTM's own check forms it again)
  function startSwap() {
    var w = W()
    var cells = towerCellPositions(TOWER_A).slice(0, 4)
    S.swap = { at: S.t, cells: cells, stage: 'broken', store: w.stored(S.server), totals: JSON.parse(JSON.stringify(w.totals)),
      mvFlow0: JSON.parse(JSON.stringify(flowOf(MOON, MV_HATCH, MY))) }
    var failed = []
    cells.forEach(function (c) { setblock(EARTH, c.x, c.y, c.z, 'air', failed) })
    note('swap', 'tower A: its 4 LV cells broken' + (failed.length ? ' FAILED ' + failed.join('; ') : ''))
  }

  function stepSwap() {
    var w = W()
    var Sw = S.swap
    var ctrl = machineAt(EARTH, TOWER_A.x, EY, TOWER_A.z)
    if (Sw.stage === 'broken') {
      if (ctrl.isFormed()) {
        if (S.t - Sw.at > 100) {
          check('SWAP', false, 'tower A still formed ' + (S.t - Sw.at) + ' ticks after its cells were broken')
          Sw.done = true
        }
        return
      }
      var st0 = w.settle(S.server)
      Sw.unformed = { towers: st0.towers, capacity: st0.capacity, tier: st0.tier, store: w.stored(S.server) }
      var failed = []
      Sw.cells.forEach(function (c) { setblock(EARTH, c.x, c.y, c.z, MV_CELL, failed) })
      note('swap_placed', 'tower A unformed; 4 MV cells placed in the holes' + (failed.length ? ' FAILED ' + failed.join('; ') : ''))
      Sw.stage = 'placed'
      Sw.placedAt = S.t
      return
    }
    if (Sw.stage === 'placed') {
      var r = formedOrForce('TOWER_A_reform', ctrl, S.t - Sw.placedAt)
      if (r === 'formed' && checked(ctrl)) {
        Sw.stage = 'formed'
        Sw.reformedAt = S.t
        // the MV hatch was already filled while tower B alone made the network MV: emptied, so its refill shows the formed network
        var held = stored(S.mvHatch)
        if (held > 0) S.mvHatch.energyContainer.changeEnergy(-held)
        Sw.mvFlow = JSON.parse(JSON.stringify(flowOf(MOON, MV_HATCH, MY)))
      } else if (r.indexOf('failed') === 0) {
        check('SWAP', false, 'tower A did not form again with MV cells: ' + r)
        Sw.done = true
      }
      return
    }
    if (S.t - Sw.reformedAt < 40) return
    var st = w.settle(S.server)
    var mvFlow = flowOf(MOON, MV_HATCH, MY)
    var info = w.towerInfo(ctrl)
    var want = 4 * 2520000 + 2 * 2520000
    var U = Sw.unformed
    var flows = (w.totals.in - Sw.totals.in) - (w.totals.out - Sw.totals.out)
    var kept = w.stored(S.server) - Sw.store === flows
    check('SWAP', U.towers === 1 && U.capacity === 2 * 2520000 && U.tier === 2 && kept && info.cells === 4 && info.tier === 2 && st.towers === 2 && st.capacity === want &&
      st.tier === 2 && mvFlow.filled > Sw.mvFlow.filled && stored(S.mvHatch) > 0 && Sw.mvFlow0.filled === 0,
      'breaking the cells unformed tower A: the network was tower B alone (' + U.towers + ' tower, ' + U.capacity + ' EU, tier ' + U.tier + '), the store ' + Sw.store + ' -> ' +
      U.store + ' EU; MV cells placed: formed again in ' + (Sw.reformedAt - Sw.placedAt) + ' ticks with ' + JSON.stringify(info) + '; the network: ' + st.towers + ' towers, ' +
      st.capacity + ' EU (want ' + want + '), tier ' + st.tier + '; the store moved only by its flows (' + Sw.store + ' -> ' + w.stored(S.server) + ', in - out ' + flows + '): ' +
      kept + '; the MV hatch on the Moon (nothing while the network was LV: ' + Sw.mvFlow0.filled + ') emptied at the re-form and filled again: ' + Sw.mvFlow.filled + ' -> ' +
      mvFlow.filled + ', holds ' + stored(S.mvHatch))
    Sw.done = true
  }

  // the store just under its capacity: it never goes over, deposits only fill the room the consumers make, the producers back up
  function startCap() {
    var w = W()
    var st = w.settle(S.server)
    w.setStored(S.server, st.capacity - 100)
    S.cap = { at: S.t, capacity: st.capacity, dyn: stored(S.arrayP.dynamo), totals: JSON.parse(JSON.stringify(w.totals)), max: st.capacity - 100 }
  }

  function measureCap() {
    var s = W().stored(S.server)
    if (s > S.cap.max) S.cap.max = s
  }

  function reportCap() {
    var w = W()
    var store = w.stored(S.server)
    var dyn = stored(S.arrayP.dynamo)
    var dIn = w.totals.in - S.cap.totals.in
    var dOut = w.totals.out - S.cap.totals.out
    check('CAP', S.cap.max <= S.cap.capacity && dIn <= dOut + 100 && dyn > S.cap.dyn,
      'the store set to capacity - 100 (' + (S.cap.capacity - 100) + ' of ' + S.cap.capacity + '): in ' + (S.t - S.cap.at) + ' ticks it reached at most ' + S.cap.max + ' (never over the capacity) and holds ' +
      store + '; in ' + dIn + ' EU <= out ' + dOut + ' + 100 (deposits only fill the room the consumers make); the dynamo hatch backs up: ' + S.cap.dyn + ' -> ' + dyn + ' EU')
  }

  // the right-click path: a fake player holding two LV energy covers clicks the top of an LV macerator
  function coverClick() {
    var w = W()
    var L = lazy()
    var fp = fakePlayer(EARTH)
    fp.setShiftKeyDown(false)
    fp.setPositionAndRotation(CLICK_MAC.x + 0.5, EY + 2.2, CLICK_MAC.z + 0.5, 0, 90)
    var item = w.coverItemId('energy', 1)
    fp.setItemInHand(L.Hand.MAIN_HAND, Item.of(item, 2))
    var pos = bp(CLICK_MAC.x, EY, CLICK_MAC.z)
    var ev = L.FH.onRightClickBlock(fp, L.Hand.MAIN_HAND, pos, new L.BHR(new L.Vec3(CLICK_MAC.x + 0.5, EY + 1.0, CLICK_MAC.z + 0.5), L.Direction.UP, pos, false))
    var mac = machineAt(EARTH, CLICK_MAC.x, EY, CLICK_MAC.z)
    var on = mac.getCoverContainer().getCoverAtSide(L.Direction.UP)
    var left = fp.getMainHandItem().getCount()
    var tracked = w.tracked(S.server).filter(function (e) { return e.k === 'cover' && e.x === CLICK_MAC.x && e.z === CLICK_MAC.z }).length
    fp.setItemInHand(L.Hand.MAIN_HAND, Item.empty)
    var readout = shiftClick(EARTH, CLICK_MAC.x, EY, CLICK_MAC.z, L.Direction.UP)
    var removed = mac.getCoverContainer().removeCover(true, L.Direction.UP, null)
    var drops = asArray(S.earth.getEntitiesOfClass(L.ItemEntity, new L.AABB(CLICK_MAC.x - 2, EY - 2, CLICK_MAC.z - 2, CLICK_MAC.x + 3, EY + 3, CLICK_MAC.z + 3)))
      .map(function (e) { return String(e.getItem().id) + ' x' + e.getItem().getCount() })
    var gotBack = drops.some(function (d) { return d.indexOf(item) === 0 })
    check('COVER_CLICK', ev.isCanceled() && on !== null && String(on.coverDefinition.getId()) === w.coverDefId('energy', 1) && left === 1 && tracked === 1 &&
      /^message\.grindless\.wireless\.readout \[/.test(readout) && removed && gotBack,
      'right-click with 2 covers: event cancelled ' + ev.isCanceled() + ', the cover ' + (on ? on.coverDefinition.getId() + ' (' + on.getClass().getSimpleName() + ')' : 'NONE') + ' on the top, ' + left +
      ' left in hand, tracked ' + tracked + '; readout ' + readout + '; GTM\'s removeCover -> ' + removed + ', dropped [' + drops.join(', ') + ']')
    S.server.runCommandSilent('kill @e[type=item,x=' + (CLICK_MAC.x - 2) + ',y=' + (EY - 2) + ',z=' + (CLICK_MAC.z - 2) + ',dx=5,dy=5,dz=5]')
  }

  // save-all flush, the file read back, the keys dropped and merged back from it
  function startSave() {
    var w = W()
    S.save = { at: S.t, list: JSON.stringify(w.tracked(S.server)), store: w.stored(S.server) }
    W().paused = true
    S.save.result = S.server.runCommandSilent('save-all flush')
  }

  function reportSave() {
    var w = W()
    var L = lazy()
    var tag = NBTIO.read(S.server.getWorldPath(new L.LevelResource('kubejs_persistent_data.nbt')))
    var fileList = tag ? String(tag.getString(w.blocksKey)) : ''
    var fileStore = tag ? Number(tag.getLong(w.storeKey)) : -1
    var sameFile = fileList === S.save.list && fileStore === S.save.store
    // the reload: KubeJS loads persistent data by merging the file into the server's tag (KubeJSServerEventHandler#serverBeforeStart)
    var pd = S.server.persistentData
    pd.remove(w.blocksKey)
    pd.remove(w.storeKey)
    w.dropCache()
    var emptied = w.tracked(S.server).length === 0 && w.stored(S.server) === 0
    pd.merge(tag)
    w.dropCache()
    var back = JSON.stringify(w.tracked(S.server)) === S.save.list && w.stored(S.server) === S.save.store
    W().paused = false
    var st = w.settle(S.server)
    var entries = JSON.parse(S.save.list)
    check('SAVE_RELOAD', sameFile && emptied && back && st.up && st.towers === 2,
      'save-all flush -> ' + S.save.result + '; kubejs_persistent_data.nbt read back after ' + (S.t - S.save.at) + ' ticks: ' + entries.length + ' entries (' +
      entries.map(function (e) { return e.k }).join(',') + ') and the store ' + fileStore + ' EU, the same as at the save: ' + sameFile + '; the keys dropped (empty: ' + emptied +
      ') and merged back from the file: the same list and store: ' + back + '; the next settlement: up ' + st.up + ', ' + st.towers + ' towers, ' + st.capacity + ' EU, tier ' + st.tier)
  }

  // ---------------------------------------------------------------- driver

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      W().paused = false
    } catch (e0) { /* nothing */ }
    try {
      cleanup()
    } catch (e) {
      check('cleanup', false, 'exception: ' + e)
    }
    console.info(TAG + SCOPE + '|DONE')
  }

  function phase(next) {
    S.phase = next
    S.phaseAt = S.t
  }

  function step() {
    var since = S.t - S.phaseAt
    var w = W()
    if (S.phase === 'forming') {
      var a = formedOrForce('ARRAY', machineAt(EARTH, ARRAY.x, EY, ARRAY.z), since)
      var e = formedOrForce('EBF', machineAt(MOON, EBF.x, MY, EBF.z), since)
      if (a === 'formed' && e === 'formed') {
        check('FORMED', true, 'the generator array and the Moon EBF formed after ' + since + ' ticks; EBF parts ' +
          asArray(machineAt(MOON, EBF.x, MY, EBF.z).getParts()).map(function (p) { return String(p.getDefinition().getId()).replace('gtceu:', '') }).join(','))
        startNoTower()
        phase('no_tower')
      } else if (a.indexOf('failed') === 0 || e.indexOf('failed') === 0 || since > 400) {
        check('FORMED', false, 'array ' + a + ', EBF ' + e + ' after ' + since + ' ticks')
        phase('end')
      }
      return
    }
    if (S.phase === 'no_tower') {
      if (since >= 160) {
        guarded('NO_TOWER', reportNoTower)
        startTowers()
        phase('towers')
      }
      return
    }
    if (S.phase === 'towers') {
      var ta = formedOrForce('TOWER_A', machineAt(EARTH, TOWER_A.x, EY, TOWER_A.z), since)
      var tb = formedOrForce('TOWER_B', machineAt(EARTH, TOWER_B.x, EY, TOWER_B.z), since)
      if (ta === 'formed' && tb === 'formed') {
        guarded('TOWERS', reportTowers)
        startRun()
        phase('run')
      } else if (ta.indexOf('failed') === 0 || tb.indexOf('failed') === 0 || since > 400) {
        check('TOWERS', false, 'tower A ' + ta + ', tower B ' + tb + ' after ' + since + ' ticks')
        phase('end')
      }
      return
    }
    if (S.phase === 'run') {
      if (since >= 400) {
        guarded('RUN', reportRun)
        startUnload()
        phase('unload')
      }
      return
    }
    if (S.phase === 'unload') {
      stepUnload()
      if (S.unload.phase === 'done') {
        startSwap()
        phase('swap')
      }
      return
    }
    if (S.phase === 'swap') {
      stepSwap()
      if (S.swap.done) {
        startCap()
        phase('cap')
      } else if (since > 600) {
        check('SWAP', false, 'tower A did not settle after the swap in ' + since + ' ticks')
        startCap()
        phase('cap')
      }
      return
    }
    if (S.phase === 'cap') {
      if (since >= 80) {
        guarded('CAP', reportCap)
        guarded('COVER_CLICK', coverClick)
        startSave()
        phase('save')
      }
      return
    }
    if (S.phase === 'save') {
      if (since >= 60) {
        guarded('SAVE_RELOAD', reportSave)
        phase('end')
      }
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    S.t = S.server.getTickCount() - S.tick0
    try {
      if (S.arrayP && S.arrayP.input && S.earth.isLoaded(bp(ARRAY.x, EY, ARRAY.z))) feedSteam()
      if (S.phase === 'no_tower' && String(S.arrayP.ctrl.getRecipeLogic().getStatus()) === 'WORKING') S.noTower.work++
      if (S.phase === 'run') measureRun()
      if (S.phase === 'cap') measureCap()
      if (S.t % 5 === 0 && S.phase !== 'end') step()
    } catch (e) {
      check('step', false, 'exception in ' + S.phase + ': ' + e)
      phase('end')
    }
    if (S.phase === 'end') {
      finish()
      return
    }
    if (S.t > TEST_TIMEOUT) {
      check('timeout', false, 'still in ' + S.phase + ' after ' + S.t + ' ticks')
      finish()
    }
  }

  function run(server) {
    S = { server: server, earth: server.overworld(), moon: server.getLevel(MOON), tick0: server.getTickCount(), t: 0, phase: 'start', phaseAt: 0, finished: false, areaTouched: false }
    guarded('registry', checkRegistry)
    guarded('buffers', checkBuffers)
    guarded('recipes', checkRecipes)
    if (S.moon === null || S.moon === undefined) {
      check('moon_level', false, MOON + ' is not loaded')
      finish()
      return
    }
    var w = W()
    w.totals.drained = 0
    w.totals.in = 0
    w.totals.lost = 0
    w.totals.out = 0
    w.totals.settlements = 0
    w.paused = false
    S.server.persistentData.remove(w.blocksKey)
    S.server.persistentData.remove(w.storeKey)
    w.dropCache()
    guarded('AREA', prepareWorld)
    var built = false
    try {
      built = buildFirst()
    } catch (e) {
      check('PLACED', false, 'exception: ' + e)
    }
    phase(built ? 'forming' : 'end')
    if (!built) finish()
  }

  // The pack's Additional Placements mod reloads the datapacks (and these scripts) a couple of seconds after the server is up: the
  // command only leaves a request in `global` and the tick handler starts the test once these scripts have been loaded for QUIET_MS.
  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    global[REQUEST] = false
    try {
      run(server)
    } catch (e) {
      check('run', false, 'exception: ' + e)
      finish()
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_wireless_energy', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous run is still in progress')
      return 0
    }
    global[REQUEST] = true
    note('requested', 'the test starts once these scripts have been loaded for ' + (QUIET_MS / 1000) + ' s')
    return 1
  })
})()
