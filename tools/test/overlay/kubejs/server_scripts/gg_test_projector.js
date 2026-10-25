// Gregtech Grindless - test of the Hologram Projector (TEST-ONLY overlay: copied over the instance on the test PC, never shipped).
//
// SERVER suite, through the published API (global.grindless.projector) with a test inventory (a vanilla SimpleContainer), and
// through a Forge FakePlayer for the click wiring:
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_projector' -WaitForLog 'GGTEST\|projector\|DONE@@600'
//
//   registry / recipe / terminal_recipe / reflection   the item, its Steam recipe, GTM's Terminal recipe kept, Gregtech Terminals'
//                       BlockPatternReflection reachable from KubeJS
//   survey              every multiblock definition of the pack (GTM, GCYM, GTCA, GT--, GCYR, ours) read cell by cell without a world
//   <case>.*            four machines: the By-product Coke Battery (Steam, ours), GTM's EBF (coils, a muffler cell that only takes
//                       parts), the Steam Blast Furnace (ours, oneOf cells and cells with two default options: pipe casings, frames)
//                       and GTM's distillation tower (repeating aisles, built at the minimum). In survival: a wrong block in a cell
//                       stays as it is, a snow layer is filled, hatches in the inventory are never used, the exact counts are taken
//                       from the inventory, the missing blocks are reported with their counts; a second build with the rest finishes
//                       it. In creative: everything is placed without items; the test then adds the parts and the structure forms
//                       (four facings for the battery, the EBF on its side and facing up, the tower turned)
//   fake.*              a FakePlayer's real interaction path (ServerPlayerGameMode#useItemOn -> Forge's RightClickBlock -> KubeJS):
//                       GTM's Terminal with sneak builds like the projector (no hatch placed: GTM's autoBuild would place them), a
//                       plain click sends the hologram and places nothing, a click on a formed controller only says so
//   DONE                last line
//
// CLIENT suite (one real player, real clicks): copy tools\test\overlay to a scratch folder, add kubejs\config\gg_test_projector.json
// = {"enabled": true} and run -Suite client -OverlayDir <that folder>. The client half (client_scripts/gg_test_projector.js)
// right-clicks an unformed coke battery controller with the projector (the use key held one tick): the hologram shows (screenshot
// before and after, the difference counted); sneak + right-click builds it from the player's inventory; a last click hides the
// hologram. Screenshots: kubejs/exported/gg_projector_{before,hologram,built,hidden}.png.
//
// Band (AGENTS.md): Overworld X 16384-16447, Z 0-63, Y 98-112: force-loaded, cleared and floored at the start, cleared at the end.
// The server suite uses Z 0-35, the client run X 16416-16447 Z 40-55.
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var TAG = 'GGTEST|projector|'
  var X0 = 16384
  var X1 = 16447
  var Z0 = 0
  var Z1 = 63
  var FLOOR = 98
  var STEP = 5
  var FORM_TIMEOUT = 400
  var TEST_TIMEOUT = 2400
  var DEFICIT = 3
  var FLOOR_BLOCK = 'minecraft:smooth_stone'

  var MACHINES = {
    coke: {
      id: 'gtceu:coking_battery', casing: 'gtceu:steam_machine_casing',
      parts: [['gtceu:steam_input_hatch', 1], ['gtceu:steam_output_bus', 1], ['gtceu:steam_input_bus', 1], ['gtceu:ulv_output_hatch', 2]],
      needs: 5, extra: ['gtceu:steam_input_hatch', 'gtceu:steam_output_bus']
    },
    ebf: {
      id: 'gtceu:electric_blast_furnace', casing: 'gtceu:heatproof_machine_casing',
      parts: [['gtceu:lv_muffler_hatch', 1], ['gtceu:lv_energy_input_hatch', 1]],
      needs: 1, partCells: 1, partLabel: 'gtceu:lv_muffler_hatch', extra: ['gtceu:lv_muffler_hatch', 'gtceu:lv_energy_input_hatch', 'gtceu:lv_input_bus'],
      coil: 'gtceu:cupronickel_coil_block'
    },
    sbf: {
      id: 'gtceu:steam_blast_furnace', casing: 'gtceu:steam_machine_casing',
      parts: [['gtceu:steam_input_hatch', 1], ['gtceu:steam_input_bus', 1], ['gtceu:steam_output_bus', 1]],
      needs: 3, extra: ['gtceu:steam_input_bus']
    },
    dt: {
      id: 'gtceu:distillation_tower', casing: 'gtceu:clean_machine_casing',
      // GTM's DistillationTowerMachine#onStructureFormed undoes the structure without a fluid output hatch (machine logic, not the
      // pattern's counts), so the test adds one on the first layer
      parts: [['gtceu:hv_energy_input_hatch', 1], ['gtceu:hv_input_hatch', 1], ['gtceu:hv_output_hatch', 1]],
      needs: 2, extra: ['gtceu:hv_energy_input_hatch', 'gtceu:hv_input_hatch'], height: 3
    }
  }

  // sites of the server suite: controller positions (the structures reach at most 3 blocks around and 7 up)
  function site(i, j) { return { x: X0 + 6 + 9 * i, y: 100, z: Z0 + 5 + 10 * j } }

  var CASES = [
    { key: 'coke.survival', m: 'coke', mode: 'survival', facing: 'north', at: site(0, 0) },
    { key: 'coke.creative.north', m: 'coke', mode: 'creative', facing: 'north', at: site(1, 0) },
    { key: 'coke.creative.east', m: 'coke', mode: 'creative', facing: 'east', at: site(2, 0) },
    { key: 'coke.creative.south', m: 'coke', mode: 'creative', facing: 'south', at: site(3, 0) },
    { key: 'coke.creative.west', m: 'coke', mode: 'creative', facing: 'west', at: site(4, 0) },
    { key: 'ebf.survival', m: 'ebf', mode: 'survival', facing: 'east', at: site(0, 1) },
    { key: 'ebf.creative', m: 'ebf', mode: 'creative', facing: 'south', at: site(1, 1) },
    { key: 'ebf.creative.side', m: 'ebf', mode: 'creative', facing: 'south', up: 'east', at: site(2, 1) },
    { key: 'ebf.creative.up', m: 'ebf', mode: 'creative', facing: 'up', at: { x: site(3, 1).x, y: 106, z: site(3, 1).z } },
    { key: 'sbf.survival', m: 'sbf', mode: 'survival', facing: 'west', at: site(0, 2), options: true },
    { key: 'sbf.creative', m: 'sbf', mode: 'creative', facing: 'north', at: site(1, 2) },
    { key: 'dt.survival', m: 'dt', mode: 'survival', facing: 'north', at: site(2, 2) },
    { key: 'dt.creative', m: 'dt', mode: 'creative', facing: 'east', at: site(3, 2) }
  ]
  var FAKE_SITES = { terminal: site(4, 1), hologram: site(5, 1) }

  var S = null
  var LC = null

  function lazy() {
    if (LC === null) {
      LC = {
        MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        IMachineBlock: Java.loadClass('com.gregtechceu.gtceu.api.block.IMachineBlock'),
        MultiDef: Java.loadClass('com.gregtechceu.gtceu.api.machine.MultiblockMachineDefinition'),
        Blocks: Java.loadClass('net.minecraftforge.registries.ForgeRegistries').BLOCKS,
        FakePlayerFactory: Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory'),
        Hand: Java.loadClass('net.minecraft.world.InteractionHand'),
        Direction: Java.loadClass('net.minecraft.core.Direction'),
        BlockHitResult: Java.loadClass('net.minecraft.world.phys.BlockHitResult'),
        Vec3: Java.loadClass('net.minecraft.world.phys.Vec3'),
        AL: Java.loadClass('java.util.ArrayList')
      }
    }
    return LC
  }

  // ---------------------------------------------------------------- output
  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 900)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(check, status, detail) {
    var line = TAG + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    if (!ok && S !== null) S.failed.push(name)
    emit(name, ok ? 'PASS' : 'FAIL', detail)
    return ok
  }

  function note(name, detail) { emit(name, 'NOTE', detail) }

  function P() { return global.grindless.projector }

  // a Java collection or a Java array -> JS array
  function asArray(coll) {
    var out = []
    if (coll === null || coll === undefined) return out
    if (typeof coll.size === 'function') {
      var list = new (lazy().AL)(coll)
      for (var i = 0; i < list.size(); i++) out.push(list.get(i))
      return out
    }
    for (var j = 0; j < coll.length; j++) out.push(coll[j])
    return out
  }

  function rl(id) { return new ResourceLocation(id) }

  function counts(map) {
    return Object.keys(map).sort().map(function (k) { return k.replace('gtceu:', '') + ' x' + map[k] }).join(', ')
  }

  function sum(map) {
    var n = 0
    Object.keys(map).forEach(function (k) { n += map[k] })
    return n
  }

  // ---------------------------------------------------------------- world
  function run(cmd) { return S.server.runCommandSilent(cmd) }

  function blockAt(level, x, y, z) { return String(level.getBlock(x, y, z).getId()) }

  function isMachine(id) {
    var b = lazy().Blocks.getValue(rl(id))
    return b !== null && b !== undefined && b instanceof lazy().IMachineBlock
  }

  function setBlock(x, y, z, id) { return run('setblock ' + x + ' ' + y + ' ' + z + ' ' + id + ' replace') }

  // clears a box of the band in fill-sized slabs (fill takes at most 32 768 blocks)
  function clearBox(x0, x1, z0, z1, floor) {
    for (var z = z0; z <= z1; z += 16) {
      var zz = Math.min(z1, z + 15)
      run('fill ' + x0 + ' ' + FLOOR + ' ' + z + ' ' + x1 + ' 112 ' + zz + ' air')
      if (floor) run('fill ' + x0 + ' ' + FLOOR + ' ' + z + ' ' + x1 + ' ' + FLOOR + ' ' + zz + ' ' + FLOOR_BLOCK)
    }
  }

  function prepareWorld(level) {
    for (var cx = X0 >> 4; cx <= X1 >> 4; cx++) for (var cz = Z0 >> 4; cz <= Z1 >> 4; cz++) level.getChunk(cx, cz)
    run('forceload add ' + X0 + ' ' + Z0 + ' ' + X1 + ' ' + Z1)
    clearBox(X0, X1, Z0, Z1, true)
  }

  function controllerState(c) {
    var props = 'facing=' + c.facing
    if (c.up) props += ',upwards_facing=' + c.up
    return MACHINES[c.m].id + '[' + props + ']'
  }

  function placeController(c) {
    var ok = setBlock(c.at.x, c.at.y, c.at.z, controllerState(c)) > 0
    c.pos = new BlockPos(c.at.x, c.at.y, c.at.z)
    return ok && blockAt(S.level, c.at.x, c.at.y, c.at.z) === MACHINES[c.m].id
  }

  function machineAt(pos) { return lazy().MetaMachine.getMachine(S.level, pos) }

  // ---------------------------------------------------------------- inventories
  // a test inventory with a vanilla Container's methods (Rhino picks SimpleContainer's ItemStack... constructor for a number, so
  // the slots live in a JS array): what the projector's containerSource reads and takes from
  function container(items) {
    var slots = []
    for (var i = 0; i < 54; i++) slots.push(Item.empty)
    var slot = 0
    items.forEach(function (it) {
      var left = it[1]
      while (left > 0 && slot < 54) {
        var n = Math.min(64, left)
        slots[slot++] = Item.of(it[0], n)
        left -= n
      }
    })
    return {
      getContainerSize: function () { return slots.length },
      getItem: function (k) { return slots[k] },
      setItem: function (k, st) { slots[k] = st },
      setChanged: function () { }
    }
  }

  function contents(cont) {
    var m = {}
    for (var i = 0; i < cont.getContainerSize(); i++) {
      var st = cont.getItem(i)
      if (st.isEmpty()) continue
      var id = String(st.getId())
      m[id] = (m[id] || 0) + Number(st.getCount())
    }
    return m
  }

  // ---------------------------------------------------------------- shared checks
  function placesOf(plan) {
    var want = {}
    plan.cells.forEach(function (cell) { if (cell.kind === 'place') want[cell.block] = (want[cell.block] || 0) + 1 })
    return want
  }

  // no GT machine in any cell of the structure but the controller (and the parts the test put there itself)
  function noParts(c, res, allowed) {
    var bad = []
    res.cells.forEach(function (cell) {
      if (cell.kind === 'controller') return
      var key = cell.x + ',' + cell.y + ',' + cell.z
      if (allowed && allowed[key]) return
      var id = blockAt(S.level, cell.x, cell.y, cell.z)
      if (isMachine(id)) bad.push(id + '@' + key)
    })
    return check(c.key + '.no_parts', bad.length === 0, bad.length === 0 ? 'no GT machine block in any of the ' + res.cells.length +
      ' cells but the controller' : 'parts placed: ' + bad.join(', '))
  }

  function describeError(ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = String(err)
      try {
        var pos = err.getPos()
        text += ' at ' + pos.getX() + ',' + pos.getY() + ',' + pos.getZ() + ' found ' + blockAt(S.level, pos.getX(), pos.getY(), pos.getZ())
      } catch (e1) { /* no position */ }
      return text
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  // ---------------------------------------------------------------- survival
  function survival(c) {
    var M = MACHINES[c.m]
    var p0 = P().plan(S.level, c.pos)
    if (!check(c.key + '.plan', p0.ok, p0.ok ? p0.cells.length + ' cells, ' + p0.placedTotal + ' to place: ' + counts(placesOf(p0)) +
      ', ' + p0.parts.length + ' part-only, facing ' + p0.facing + ' up ' + p0.up : 'plan failed: ' + p0.error)) return
    var places = p0.cells.filter(function (cell) { return cell.kind === 'place' })
    var casings = places.filter(function (cell) { return cell.block === M.casing })
    // the snow layer: the first casing cell (in the pattern's order, so it is filled before the stock runs out) on the lowest row
    var lowY = Math.min.apply(null, casings.map(function (cell) { return cell.y }))
    var snow = casings.filter(function (cell) { return cell.y === lowY })[0]
    var dirt = casings.filter(function (cell) { return cell !== snow })[1]
    // a floor right under the structure, so the snow layer has something to stand on
    var xs = p0.cells.map(function (cell) { return cell.x })
    var zs = p0.cells.map(function (cell) { return cell.z })
    var minY = Math.min.apply(null, p0.cells.map(function (cell) { return cell.y }))
    run('fill ' + Math.min.apply(null, xs) + ' ' + (minY - 1) + ' ' + Math.min.apply(null, zs) + ' ' + Math.max.apply(null, xs) + ' ' + (minY - 1) + ' ' +
      Math.max.apply(null, zs) + ' ' + FLOOR_BLOCK)
    setBlock(snow.x, snow.y, snow.z, 'minecraft:snow')
    setBlock(dirt.x, dirt.y, dirt.z, 'minecraft:dirt')
    if (blockAt(S.level, snow.x, snow.y, snow.z) !== 'minecraft:snow') note(c.key + '.snow', 'the snow layer did not stay: ' + blockAt(S.level, snow.x, snow.y, snow.z))
    var want = placesOf(p0)
    var give = []
    var expectPlaced = {}
    Object.keys(want).forEach(function (id) {
      var n = want[id]
      if (id === M.casing) n = n - 1 - DEFICIT
      if (c.options && id === 'gtceu:bronze_pipe_casing') {
        give.push(['gtceu:steel_pipe_casing', n])
        expectPlaced['gtceu:steel_pipe_casing'] = n
        return
      }
      if (c.options && id === 'gtceu:bronze_frame') {
        // 3 bronze frames are not enough for every frame cell: the group takes the steel ones, all of them
        give.push(['gtceu:bronze_frame', 3])
        give.push(['gtceu:steel_frame', n])
        expectPlaced['gtceu:steel_frame'] = n
        return
      }
      give.push([id, n])
      expectPlaced[id] = n
    })
    M.extra.forEach(function (id) { give.push([id, 2]) })
    give.push(['minecraft:cobblestone', 16])
    if (M.coil) give.push(['gtceu:kanthal_coil_block', 64])
    var cont = container(give)
    var before = contents(cont)
    var res = P().build(S.level, c.pos, P().containerSource(cont, null, false, null))
    if (!check(c.key + '.build', res.ok, res.ok ? 'placed ' + res.placedTotal + ' (' + counts(res.placed) + '), missing ' + res.missingTotal +
      ' (' + counts(res.missing) + '), parts ' + res.parts.length + ', needs ' + res.needs.map(function (n) { return n.id + ' x' + n.n }).join(' ') +
      ', blocked ' + res.blocked.map(function (b) { return b.block + '@' + b.x + ',' + b.y + ',' + b.z + ' ' + b.reason }).join(' ') : res.error)) return
    var after = contents(cont)
    // exact counts: what left the inventory is what was placed, item by item; nothing else moved
    var diff = []
    Object.keys(before).forEach(function (id) {
      var used = before[id] - (after[id] || 0)
      if (used !== (res.placed[id] || 0)) diff.push(id + ' used ' + used + ', placed ' + (res.placed[id] || 0))
    })
    var expectSum = sum(expectPlaced)
    check(c.key + '.counts', diff.length === 0 && res.placedTotal === expectSum && sum(res.placed) === expectSum,
      'one item per block placed: ' + counts(res.placed) + ' (expected ' + counts(expectPlaced) + ')' + (diff.length > 0 ? '; mismatch ' + diff.join('; ') : ''))
    check(c.key + '.missing', res.missingTotal === DEFICIT && res.missing[M.casing] === DEFICIT,
      'report "Missing: ' + DEFICIT + ' x ' + M.casing + '" -> ' + counts(res.missing))
    var keptParts = M.extra.filter(function (id) { return (after[id] || 0) === 2 })
    check(c.key + '.parts_kept', keptParts.length === M.extra.length && (after['minecraft:cobblestone'] || 0) === 16,
      'hatches and buses in the inventory are never used: ' + M.extra.map(function (id) { return id.replace('gtceu:', '') + ' ' + (after[id] || 0) + '/2' }).join(', '))
    var dirtNow = blockAt(S.level, dirt.x, dirt.y, dirt.z)
    var listed = res.blocked.some(function (b) { return b.x === dirt.x && b.y === dirt.y && b.z === dirt.z && b.reason === 'wrong' })
    check(c.key + '.wrong_block', dirtNow === 'minecraft:dirt' && listed, 'dirt in a casing cell: still ' + dirtNow + ', listed as left as it is: ' + listed)
    var snowNow = blockAt(S.level, snow.x, snow.y, snow.z)
    check(c.key + '.replaceable', snowNow === M.casing, 'a snow layer in a casing cell is filled: now ' + snowNow)
    noParts(c, res)
    check(c.key + '.needs', sum(needMap(res)) === M.needs, 'parts it still needs to form: ' + res.needs.map(function (n) { return n.id + ' x' + n.n }).join(', ') +
      ' (expected ' + M.needs + ')')
    if (M.partCells) {
      var cellsOk = res.parts.length === M.partCells && res.parts.every(function (p) { return blockAt(S.level, p.x, p.y, p.z) === 'minecraft:air' })
      var labelOk = !M.partLabel || res.parts.every(function (p) { return p.id === M.partLabel })
      check(c.key + '.part_cell', cellsOk && labelOk, 'part-only cells left empty and listed under their lowest tier: ' + res.parts.map(function (p) {
        return p.id + ' (' + p.options + ' options)@' + p.x + ',' + p.y + ',' + p.z + ' now ' + blockAt(S.level, p.x, p.y, p.z)
      }).join(', ') + (M.partLabel ? ' (expected ' + M.partLabel + ')' : ''))
    }
    if (M.coil) {
      var coils = res.cells.filter(function (cell) { return cell.kind === 'place' && /coil/.test(cell.block) })
      var allFirst = coils.length > 0 && coils.every(function (cell) { return blockAt(S.level, cell.x, cell.y, cell.z) === M.coil })
      check(c.key + '.coil_choice', allFirst, coils.length + ' coil cells, all ' + M.coil + ' (the first option, which the inventory has enough of; 64 kanthal were there too): ' + allFirst)
    }
    if (c.options) {
      var pipes = res.cells.filter(function (cell) { return cell.kind === 'place' && /pipe_casing/.test(cell.block) }).map(function (cell) { return cell.block })
      var frames = res.cells.filter(function (cell) { return cell.kind === 'place' && /_frame$/.test(cell.block) }).map(function (cell) { return cell.block })
      var pipesOk = pipes.length > 0 && pipes.every(function (b) { return b === 'gtceu:steel_pipe_casing' })
      var framesOk = frames.length > 0 && frames.every(function (b) { return b === 'gtceu:steel_frame' })
      check(c.key + '.options', pipesOk && framesOk, 'pipe casings: only steel in the inventory -> ' + pipes.length + ' steel (' + pipesOk + '); frames: 3 bronze + ' +
        frames.length + ' steel -> ' + frames.join(',').replace(/gtceu:/g, '') + ' (one option per group: ' + framesOk + ')')
    }
    if (M.height) {
      var ys = {}
      res.cells.forEach(function (cell) { ys[cell.y] = true })
      check(c.key + '.minimum', Object.keys(ys).length === M.height, 'repeating aisles at their minimum: ' + Object.keys(ys).length + ' layers (expected ' + M.height + ')')
    }
    // a second click with the missing blocks: only those are placed, then it reports complete
    for (var i = 0; i < cont.getContainerSize(); i++) {
      if (cont.getItem(i).isEmpty()) {
        cont.setItem(i, Item.of(M.casing, DEFICIT))
        break
      }
    }
    var res2 = P().build(S.level, c.pos, P().containerSource(cont, null, false, null))
    check(c.key + '.rebuild', res2.ok && res2.placedTotal === DEFICIT && res2.missingTotal === 0 && res2.blocked.length === 1,
      'second build with ' + DEFICIT + ' more casings: placed ' + res2.placedTotal + ', missing ' + res2.missingTotal + ', still left as it is ' + res2.blocked.length)
  }

  function needMap(res) {
    var m = {}
    res.needs.forEach(function (n) { m[n.id] = n.n })
    return m
  }

  // ---------------------------------------------------------------- creative, then the parts, then it forms
  function creative(c) {
    var M = MACHINES[c.m]
    var p0 = P().plan(S.level, c.pos)
    if (!check(c.key + '.plan', p0.ok, p0.ok ? p0.cells.length + ' cells, facing ' + p0.facing + ' up ' + p0.up : 'plan failed: ' + p0.error)) return false
    var src = { creative: true, player: null, counts: function () { return {} }, take: function () { throw new Error('creative took an item') } }
    var res = P().build(S.level, c.pos, src)
    if (!check(c.key + '.build', res.ok && res.missingTotal === 0 && res.placedTotal === p0.placedTotal && res.placedTotal > 0,
      res.ok ? 'creative placed ' + res.placedTotal + ' of ' + p0.placedTotal + ' without items: ' + counts(res.placed) + ', missing ' + res.missingTotal : res.error)) return false
    noParts(c, res)
    if (M.coil) {
      var coils = res.cells.filter(function (cell) { return /coil/.test(cell.block) })
      check(c.key + '.coil_first', coils.length > 0 && coils.every(function (cell) { return blockAt(S.level, cell.x, cell.y, cell.z) === M.coil }),
        'creative takes the first option: ' + coils.length + ' x ' + M.coil)
    }
    // the parts, each in a cell that takes it (the cells GTM's preview would show): the structure must then form
    var p1 = P().plan(S.level, c.pos)
    var used = {}
    var put = []
    var missing = []
    M.parts.forEach(function (pr) {
      for (var k = 0; k < pr[1]; k++) {
        var cell = null
        for (var i = 0; i < p1.cells.length && cell === null; i++) {
          var cc = p1.cells[i]
          var key = cc.x + ',' + cc.y + ',' + cc.z
          if (used[key] || (cc.kind !== 'ok' && cc.kind !== 'parts') || cc.accepts.indexOf(pr[0]) < 0) continue
          if (cc.kind === 'ok' && isMachine(blockAt(S.level, cc.x, cc.y, cc.z))) continue
          cell = cc
          used[key] = true
        }
        if (cell === null) {
          missing.push(pr[0])
          continue
        }
        setBlock(cell.x, cell.y, cell.z, pr[0])
        put.push(pr[0].replace('gtceu:', '') + '@' + cell.x + ',' + cell.y + ',' + cell.z)
      }
    })
    c.partsPut = used
    note(c.key + '.parts', 'the test adds ' + put.join(' ') + (missing.length > 0 ? '; no cell for ' + missing.join(',') : ''))
    return missing.length === 0
  }

  // ---------------------------------------------------------------- FakePlayer: the real click path
  function fakePlayer() {
    var j = lazy()
    var fp = j.FakePlayerFactory.getMinecraft(S.level)
    fp.getInventory().clearContent()
    fp.setShiftKeyDown(false)
    return fp
  }

  function clickAs(fp, pos, face) {
    var j = lazy()
    var dir = j.Direction.byName(face)
    var hit = new j.BlockHitResult(new j.Vec3(pos.getX() + 0.5, pos.getY() + 0.5, pos.getZ() + 0.5), dir, pos, false)
    var gm = fp.gameMode
    if (gm === undefined || gm === null || typeof gm.useItemOn !== 'function') gm = fp.f_8941_
    P().last = null
    // one FakePlayer for every click: the projector ignores a click within 8 ticks of the last one (a held button), so the test spaces them
    S.lastFakeTick = Number(S.server.getTickCount())
    return String(gm.useItemOn(fp, S.level, fp.getMainHandItem(), j.Hand.MAIN_HAND, hit))
  }

  function fakeTerminal() {
    var c = { key: 'fake.terminal', m: 'ebf', facing: 'north', at: FAKE_SITES.terminal }
    if (!check(c.key + '.controller', placeController(c), 'EBF controller placed')) return
    var plan = P().plan(S.level, c.pos)
    var want = placesOf(plan)
    var fp = fakePlayer()
    fp.setItemInHand(lazy().Hand.MAIN_HAND, Item.of(P().terminal))
    var inv = fp.getInventory()
    var slot = 1
    Object.keys(want).forEach(function (id) { inv.setItem(slot++, Item.of(id, want[id])) })
    inv.setItem(slot++, Item.of('gtceu:lv_muffler_hatch', 1))
    inv.setItem(slot++, Item.of('gtceu:lv_energy_input_hatch', 1))
    fp.setShiftKeyDown(true)
    var result = clickAs(fp, c.pos, 'north')
    fp.setShiftKeyDown(false)
    var last = P().last
    var res = last && last.result
    var hatches = 0
    for (var i = 0; i < inv.getContainerSize(); i++) {
      var id = String(inv.getItem(i).getId())
      if (id === 'gtceu:lv_muffler_hatch' || id === 'gtceu:lv_energy_input_hatch') hatches += Number(inv.getItem(i).getCount())
    }
    check(c.key + '.build', last !== null && last.kind === 'build' && last.item === P().terminal && res && res.placedTotal === sum(want) && hatches === 2,
      "GTM's Terminal, sneak + use on the controller (ServerPlayerGameMode#useItemOn -> RightClickBlock): " + (last === null ? 'the projector never ran' :
        last.kind + ' with ' + last.item + ', placed ' + (res ? res.placedTotal + ' of ' + sum(want) + ' (' + counts(res.placed) + ')' : '-')) +
      '; muffler and energy hatch still in the inventory: ' + hatches + '/2; interaction result ' + result)
    if (res) noParts(c, res)
    note(c.key + '.gtm', "GTM's TerminalBehavior would call BlockPattern#autoBuild here: the muffler cell takes the muffler and the energy hatch's minimum of 1 takes the first casing cell")
  }

  function fakeHologram() {
    var c = { key: 'fake.hologram', m: 'ebf', facing: 'north', at: FAKE_SITES.hologram }
    if (!check(c.key + '.controller', placeController(c), 'EBF controller placed')) return
    var fp = fakePlayer()
    fp.setItemInHand(lazy().Hand.MAIN_HAND, Item.of(P().item))
    fp.getInventory().setItem(1, Item.of(MACHINES.ebf.casing, 64))
    var before = P().plan(S.level, c.pos)
    var result = clickAs(fp, c.pos, 'north')
    var last = P().last
    var plan = P().plan(S.level, c.pos)
    check(c.key + '.click', last !== null && last.kind === 'hologram' && plan.present === before.present && plan.placedTotal === before.placedTotal &&
      Number(contents(fp.getInventory())[MACHINES.ebf.casing] || 0) === 64,
      'plain use with the projector: ' + (last === null ? 'nothing' : last.kind) + ' (the hologram packet goes to the player); the structure is as it was: ' +
      plan.present + ' cells done (the air ones), ' + plan.placedTotal + ' to place (' + before.placedTotal + ' before), no casing used; interaction result ' + result)
  }

  function fakeFormed(c) {
    var fp = fakePlayer()
    fp.setItemInHand(lazy().Hand.MAIN_HAND, Item.of(P().item))
    fp.getInventory().setItem(1, Item.of(MACHINES.ebf.casing, 64))
    fp.setShiftKeyDown(true)
    var result = clickAs(fp, c.pos, c.facing)
    fp.setShiftKeyDown(false)
    var last = P().last
    check('fake.formed', last !== null && last.kind === 'formed' && Number(contents(fp.getInventory())[MACHINES.ebf.casing] || 0) === 64,
      'sneak + use on the formed ' + c.key + ': ' + (last === null ? 'nothing' : last.kind) + ', no casing used, interaction result ' + result)
  }

  // ---------------------------------------------------------------- static checks
  function staticChecks() {
    var p = P()
    var rm = S.server.getRecipeManager()
    check('registry', !!p && Item.exists(p.item), 'item ' + (p ? p.item : '?') + ' registered: ' + (p ? Item.exists(p.item) : false))
    var recipe = rm.byKey(rl(p.recipe))
    var ingredients = []
    if (recipe.isPresent()) {
      asArray(recipe.get().getIngredients()).forEach(function (ing) {
        var ids = []
        try { ids = asArray(ing.getItemIds()).map(String) } catch (e) { ids = ['?'] }
        if (ids.length > 0) ingredients.push(ids[0] + (ids.length > 1 ? ' (+' + (ids.length - 1) + ')' : ''))
      })
    }
    var out = ''
    try { out = String(recipe.get().getResultItem(S.server.registryAccess()).getId()) } catch (e2) { out = 'unreadable (' + e2 + ')' }
    check('recipe', recipe.isPresent() && out === p.item, p.recipe + ' -> ' + out + ': ' + ingredients.join(', '))
    check('terminal_recipe', rm.byKey(rl('gtceu:shaped/basic_terminal')).isPresent(), "GTM's Terminal keeps its recipe (it works like the projector)")
    check('reflection', p.available(), "Gregtech Terminals' BlockPatternReflection is reachable from KubeJS: " + p.available())
  }

  function survey() {
    var j = lazy()
    var ours = Object.keys(global.grindless.structures || {})
    var oursSet = {}
    ours.forEach(function (id) { oursSet[id] = true })
    var all = asArray(GTRegistries.MACHINES.values()).filter(function (d) { return d instanceof j.MultiDef })
    var ok = 0
    var bad = []
    var badOurs = []
    var ns = {}
    var withParts = 0
    var withMulti = 0
    var cells = 0
    all.forEach(function (def) {
      var s = P().survey(def)
      var space = s.id.split(':')[0]
      var mine = oursSet[s.id] === true
      var group = mine ? 'ours' : (space === 'gtceu' ? 'gtceu' : space)
      ns[group] = (ns[group] || 0) + 1
      if (s.ok) {
        ok++
        cells += s.cells
        if (s.parts > 0) withParts++
        if (s.multi > 0) withMulti++
      } else {
        bad.push(s.id + ' (' + s.error + ')')
        if (mine) badOurs.push(s.id)
      }
    })
    var missingOurs = ours.filter(function (id) { return !all.some(function (d) { return String(d.getId()) === id }) })
    check('survey', bad.length === 0 && missingOurs.length === 0 && all.length > 100,
      all.length + ' multiblock definitions (' + Object.keys(ns).sort().map(function (k) { return k + ' ' + ns[k] }).join(', ') + ') read: ' + ok +
      ', ' + cells + ' cells; ' + withParts + ' have cells that only take parts, ' + withMulti + ' have cells with several default options' +
      (bad.length > 0 ? '; unreadable: ' + bad.slice(0, 12).join(', ') : '') + (missingOurs.length > 0 ? '; ours not registered: ' + missingOurs.join(', ') : ''))
  }

  // ---------------------------------------------------------------- the run
  function startCases() {
    CASES.forEach(function (c) {
      c.phase = 'done'
      try {
        if (!check(c.key + '.controller', placeController(c), MACHINES[c.m].id + ' at ' + c.at.x + ',' + c.at.y + ',' + c.at.z + ' ' + controllerState(c))) return
        if (c.mode === 'survival') {
          survival(c)
        } else if (creative(c)) {
          c.phase = 'forming'
          c.t0 = S.t
        }
      } catch (e) {
        check(c.key + '.step', false, 'exception: ' + e)
      }
    })
  }

  function advance(c) {
    var ctrl = machineAt(c.pos)
    var waited = S.t - c.t0
    if (ctrl !== null && ctrl !== undefined && ctrl.isFormed()) {
      check(c.key + '.formed', true, 'formed by itself after ' + waited + ' ticks with the default blocks the projector placed and the parts the test added (facing ' +
        c.facing + (c.up ? ', upwards ' + c.up : '') + ', parts ' + asArray(ctrl.getParts()).length + ')')
      c.phase = 'done'
      if (c.key === 'ebf.creative' && S.formedCase === null) S.formedCase = c
      return
    }
    if (waited >= FORM_TIMEOUT) {
      var sync = false
      try { sync = ctrl.checkPatternWithLock() } catch (e2) { sync = false }
      check(c.key + '.formed', false, 'not formed after ' + waited + ' ticks (a synchronous check ' + (sync ? 'passes' : 'fails: ' + describeError(ctrl)) + ')')
      c.phase = 'done'
    }
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try { clearBox(X0, X1, Z0, 35, false) } catch (e) { note('cleanup', 'exception: ' + e) }
    run('forceload remove ' + X0 + ' ' + Z0 + ' ' + X1 + ' ' + Z1)
    check('all', S.failed.length === 0, S.failed.length === 0 ? 'every check passed' : 'failed: ' + S.failed.join(', '))
    console.info(TAG + 'DONE')
  }

  function step() {
    var now = Number(S.server.getTickCount())
    S.t = now - S.tick0
    var spaced = now - S.lastFakeTick >= 12
    if (!S.hologramDone && S.t >= 20 && spaced) {
      S.hologramDone = true
      spaced = false
      try { fakeHologram() } catch (e) { check('fake.hologram', false, 'exception: ' + e) }
    }
    if (S.formedCase !== null && !S.formedChecked && S.hologramDone && spaced) {
      S.formedChecked = true
      try { fakeFormed(S.formedCase) } catch (e1) { check('fake.formed', false, 'exception: ' + e1) }
    }
    var pending = 0
    CASES.forEach(function (c) {
      if (c.phase !== 'forming') return
      pending++
      try { advance(c) } catch (e) {
        check(c.key + '.step', false, 'exception: ' + e)
        c.phase = 'done'
      }
    })
    if (pending === 0 && S.hologramDone && (S.formedChecked || S.formedCase === null)) {
      if (!S.formedChecked) check('fake.formed', false, 'the creative EBF never formed, so the click on a formed controller was not tried')
      finish()
    } else if (S.t > TEST_TIMEOUT) {
      check('timeout', false, 'still running after ' + S.t + ' ticks')
      finish()
    }
  }

  ServerEvents.tick(function (event) {
    if (S === null || S.finished) return
    var now = event.server.getTickCount()
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    try { step() } catch (e) {
      check('step', false, 'exception: ' + e)
      finish()
    }
  })

  ServerEvents.customCommand('gg_test_projector', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_projector run is still in progress')
      return 0
    }
    var server = event.getLevel().getServer()
    S = { server: server, level: server.overworld(), t: 0, tick0: server.getTickCount(), nextAt: server.getTickCount() + STEP, failed: [], finished: false,
      hologramDone: false, formedChecked: false, formedCase: null, lastFakeTick: -1000 }
    try {
      try { staticChecks() } catch (e1) { check('static', false, 'exception: ' + e1) }
      try { survey() } catch (e2) { check('survey', false, 'exception: ' + e2) }
      prepareWorld(S.level)
      startCases()
      try { fakeTerminal() } catch (e3) { check('fake.terminal', false, 'exception: ' + e3) }
    } catch (e) {
      check('run', false, 'exception: ' + e)
      finish()
    }
    return 1
  })

  // ================================================================ CLIENT suite: the server half of the real-click test
  var MARKER = 'kubejs/config/gg_test_projector.json'
  var REQ = 'ggTestProjectorRequest'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var CLIENT_AREA = { x0: 16416, x1: 16447, z0: 40, z1: 55 }
  var CLIENT_CTRL = { x: 16431, y: 100, z: 46 }
  var CLIENT_EYE = { x: 16431.5, y: 99, z: 50.5 }
  var CLIENT_TIMEOUT = 900
  var T = null

  function shared() {
    if (!global.ggProjector) global.ggProjector = new (Java.loadClass('java.util.concurrent.ConcurrentHashMap'))()
    return global.ggProjector
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

  function ccheck(name, ok, detail) {
    if (!ok) T.failed.push(name)
    emit('client.' + name, ok ? 'PASS' : 'FAIL', detail)
  }

  function testPlayer(server) {
    var list = asArray(server.getPlayerList().getPlayers())
    for (var i = 0; i < list.length; i++) {
      if (T.playerName === '' || String(list[i].getName().getString()) === T.playerName) return list[i]
    }
    return null
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

  function ask(kind) {
    shared().put('result', '')
    shared().put('request', kind)
    shared().put('token', kind + '-' + T.t)
  }

  function cgo(phase) {
    T.phase = phase
    T.since = T.t
  }

  function cstep(server) {
    var p = testPlayer(server)
    if (p === null) {
      ccheck('player', false, 'the test player left during ' + T.phase)
      cfinish(server)
      return
    }
    var level = p.getLevel()
    var age = T.t - T.since
    var pos = new BlockPos(CLIENT_CTRL.x, CLIENT_CTRL.y, CLIENT_CTRL.z)
    if (T.phase === 'setup') {
      T.playerName = String(p.getName().getString())
      S = S || { server: server, level: server.overworld(), failed: [], finished: true }
      S.server = server
      S.level = level
      run('forceload add ' + CLIENT_AREA.x0 + ' ' + CLIENT_AREA.z0 + ' ' + CLIENT_AREA.x1 + ' ' + CLIENT_AREA.z1)
      clearBox(CLIENT_AREA.x0, CLIENT_AREA.x1, CLIENT_AREA.z0, CLIENT_AREA.z1, true)
      setBlock(CLIENT_CTRL.x, CLIENT_CTRL.y, CLIENT_CTRL.z, 'gtceu:coking_battery[facing=south]')
      shared().put('ctrl', CLIENT_CTRL.x + ',' + CLIENT_CTRL.y + ',' + CLIENT_CTRL.z)
      run('gamemode survival ' + T.playerName)
      p.teleportTo('minecraft:overworld', CLIENT_EYE.x, CLIENT_EYE.y, CLIENT_EYE.z, 180, 2)
      cgo('stock')
      return
    }
    if (T.phase === 'stock') {
      if (age < 40) return
      var plan = P().plan(level, pos)
      T.want = placesOf(plan)
      T.plan0 = { present: plan.present, total: plan.placedTotal }
      var inv = p.getInventory()
      inv.clearContent()
      // the selected hotbar slot is the client's: the projector goes into whichever slot it holds
      inv.setItem(inv.selected, Item.of(P().item))
      var slot = 9
      Object.keys(T.want).forEach(function (id) { inv.setItem(slot++, Item.of(id, T.want[id])) })
      inv.setItem(slot++, Item.of('gtceu:steam_input_hatch', 1))
      inv.setItem(slot++, Item.of('gtceu:steam_output_bus', 1))
      inv.setChanged()
      ccheck('setup', plan.ok && plan.placedTotal > 0, 'coke battery controller facing south at ' + CLIENT_CTRL.x + ',' + CLIENT_CTRL.y + ',' + CLIENT_CTRL.z +
        ', player ' + T.playerName + ' 4 blocks in front of it with the projector and ' + counts(T.want))
      cgo('wait-stock')
      return
    }
    if (T.phase === 'wait-stock') {
      if (age < 40) return
      ask('hologram')
      cgo('hologram')
      return
    }
    if (T.phase === 'hologram') {
      var r = sval('result')
      if (r === '' && age < CLIENT_TIMEOUT) return
      var last = P().last
      var p1 = P().plan(level, pos)
      ccheck('hologram', r.indexOf('PASS') === 0 && last !== null && last.kind === 'hologram' && p1.present === T.plan0.present && p1.placedTotal === T.plan0.total,
        (r === '' ? 'the client never answered' : r) + '; server: ' + (last === null ? 'no click' : last.kind) + ', nothing built by the plain click: ' +
        p1.placedTotal + ' blocks still to place (' + T.plan0.total + ' before)')
      ask('build')
      cgo('build')
      return
    }
    if (T.phase === 'build') {
      var b = sval('result')
      if (b === '' && age < CLIENT_TIMEOUT) return
      var lastB = P().last
      var res = lastB && lastB.result
      var used = Object.keys(T.want).map(function (id) { return id.replace('gtceu:', '') + ' ' + invCount(p, id) + ' left' })
      var empty = Object.keys(T.want).every(function (id) { return invCount(p, id) === 0 })
      var hatches = invCount(p, 'gtceu:steam_input_hatch') + invCount(p, 'gtceu:steam_output_bus')
      ccheck('build', b.indexOf('PASS') === 0 && lastB !== null && lastB.kind === 'build' && res && res.placedTotal === sum(T.want) && empty && hatches === 2,
        (b === '' ? 'the client never answered' : b) + '; server: ' + (lastB === null ? 'no click' : lastB.kind + ' sneaking=' + lastB.sneaking) +
        (res ? ', placed ' + res.placedTotal + ' of ' + sum(T.want) + ' (' + counts(res.placed) + '), missing ' + res.missingTotal : '') + '; inventory: ' + used.join(', ') +
        '; steam hatch and bus kept: ' + hatches + '/2')
      if (res) {
        var bad = res.cells.filter(function (cell) { return cell.kind !== 'controller' && isMachine(blockAt(level, cell.x, cell.y, cell.z)) })
        ccheck('no_parts', bad.length === 0, bad.length === 0 ? 'no hatch or bus placed' : bad.length + ' parts placed')
      }
      ask('hide')
      cgo('hide')
      return
    }
    if (T.phase === 'hide') {
      var h = sval('result')
      if (h === '' && age < CLIENT_TIMEOUT) return
      ccheck('hide', h.indexOf('PASS') === 0, h === '' ? 'the client never answered' : h)
      cfinish(server)
    }
  }

  function cfinish(server) {
    if (T === null || T.finished) return
    T.finished = true
    try {
      run('fill ' + CLIENT_AREA.x0 + ' ' + FLOOR + ' ' + CLIENT_AREA.z0 + ' ' + CLIENT_AREA.x1 + ' 112 ' + CLIENT_AREA.z1 + ' air')
      run('forceload remove ' + CLIENT_AREA.x0 + ' ' + CLIENT_AREA.z0 + ' ' + CLIENT_AREA.x1 + ' ' + CLIENT_AREA.z1)
    } catch (e) { note('client.cleanup', 'exception: ' + e) }
    emit('client.all', T.failed.length === 0 ? 'PASS' : 'FAIL', T.failed.length === 0 ? 'hologram on a real click, built on sneak + click, hidden on the next click' : 'failed: ' + T.failed.join(', '))
    shared().put('hold', false)
    global[REQ + 'Done'] = true
    console.info(TAG + 'DONE')
  }

  ServerEvents.tick(function (event) {
    var server = event.server
    if (global[REQ] && T === null && Date.now() - LOADED_AT >= QUIET_MS && Date.now() >= Number(global[REQ + 'At'] || 0)) {
      global[REQ] = false
      T = { t: 0, tick0: server.getTickCount(), phase: 'setup', since: 0, failed: [], finished: false, playerName: '', want: {} }
    }
    if (T === null || T.finished) return
    T.t = server.getTickCount() - T.tick0
    if (T.t > TEST_TIMEOUT * 2) {
      ccheck('timeout', false, 'the client test ran ' + T.t + ' ticks; phase ' + T.phase)
      cfinish(server)
      return
    }
    try {
      cstep(server)
    } catch (e) {
      ccheck('step', false, 'exception in ' + T.phase + ': ' + e)
      cfinish(server)
    }
  })

  PlayerEvents.loggedIn(function (event) {
    if (global[REQ + 'Done'] || T !== null || !enabledByMarker()) return
    global[REQ + 'At'] = Date.now() + 5000
    global[REQ] = true
    shared().put('hold', true)
    shared().put('token', '')
    note('client.armed', 'player ' + event.player.getName().getString() + ' joined and ' + MARKER + ' is present: the projector test starts in a few seconds')
  })
})()
