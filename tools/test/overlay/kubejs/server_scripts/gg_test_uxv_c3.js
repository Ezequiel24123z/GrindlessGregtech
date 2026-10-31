// priority: -9756
// Gregtech Grindless - native fixture of package UXV-C3 (TEST-ONLY overlay, never shipped): the gate example of docs/eras/uxv.md
// (Power, "Gate example": 16 A x V[UXV] = 2^31 EU/t, the c10 row) on the wireless network at UXV, the station slots, the five arrival
// platforms' dimensions (UIV's three, Vela and Cas A) and a save mark read back after a restart.
//
//   powershell -NoProfile -ExecutionPolicy Bypass -File tools\test\Invoke-GGTest.ps1 -Suite server -Slots 1 `
//     -Commands 'kubejs custom_command gg_test_uxv_c3' -WaitForLog 'GGTEST\|uxv_c3\|DONE@@180'
// It takes its turn on the wireless network with the other wireless fixtures (queue `ggTestWirelessQueue` in `global`).
//
// Markers: GGTEST|uxv_c3|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|uxv_c3|DONE.
//   registry     the UXV wireless hatches (W.hatchId: dynamo 64 A, energy 16 A = gtceu:uxv_wireless_energy_hatch_16a), grindless:uxv_smes_cell,
//                gtceu:power_substation; NOTE which source plants are registered (none is placed: their outputs are calibrated)
//   high_tier_content  GTM's machines.highTierContent is true (TP-S0F)
//   TOWER        a wireless tower with two grindless:uxv_smes_cell forms; the network is tier 12 (UXV), capacity 2 x 4,026,531,840,000 EU
//   SUBSTATION   GTM's own power substation (its highest-tier battery preview shape) with its first plain input hatch swapped for the
//                UXV 16 A wireless energy hatch forms ("real" load); when it cannot be built the load is "calibrated": the hatch is
//                drained 2,147,483,648 EU/t by the fixture (the mode is stated in GATE_MODE)
//   GATE_IN      four UXV 64 A wireless dynamo hatches, each given one source of the doc's example (uxv.md, Power): one BZ dynamo at
//                1,073,741,824, two polar cap taps at 536,870,912 and, for the network's 1/20, the Penrose engine as built at 268,435,456 EU/t
//                (2,415,919,104 EU/t); the network drains at least 2,260,508,051 EU/t (2^31 / 0.95) from them over the window
//   GATE_BANK    at least 2,295,123,149 EU/t (the intake's 19/20, within 0.1 %) and at least 94% of the intake reach the bank
//   GATE_OUT     at least 2,147,483,648 EU/t (2^31, a 16 A UXV hatch, the c10 row) leaves the bank through the hatch over the window; the
//                substation's stored energy rises by what the hatch gave (real mode)
// The window is WINDOW ticks (1,200 = 60 s at 20 TPS, the c10 row's duration) after the network has settled; it is counted in ticks.
//
// Other commands (each ends with its own DONE line):
//   gg_test_uxv_c3_stations  GGTEST|uxv_c3_stations|...  every station slot of G.stations.slots (at least ten): the orbit level exists, a chunk
//                            of its station plot loads and GCYR's station holder answers; the Barnard b surface level loads; the five arrival
//                            platforms' dimensions load (a chunk each), and the platform rows the jumps wrote are reported
//   gg_test_uxv_c3_mark      GGTEST|uxv_c3_save|...      a save mark built only from blocks v0.14.0 already had (so a v0.14.0 world can carry
//                            it): a wireless tower with two UIV cells (tracked), a UIV 16 A hatch, the UEV and UIV hulls and 16 A input hatches
//                            (KubeJS-built in v0.14.0, GTM's own since TP-S0F), a chest with three items, a persistent key; in each arrival
//                            platform dimension the running version has, a force-loaded chunk and a chest with items; then save-all flush
//   gg_test_uxv_c3_reopen    GGTEST|uxv_c3_reopen|...    after a restart (or on a world another pack version saved): what survived of the
//                            mark (blocks, the machines behind the hull and hatch ids, chest, tower formed and on the network, the key), the
//                            platform chunks and chests (every platform dimension must load; one the saving version lacked is a NOTE), the
//                            platform rows and the stations; then the mark is removed
// TEST AREA: only X 37184-37247, Z 0-63, Y 98-112 of the Overworld (and the same X/Z in the five platform dimensions, at the mark's chest
// only); every write goes through put / fillBand / forceload.
// var + function everywhere (Rhino); only booleans and strings in `global`.
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'uxv_c3'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestUxvC3Request'
  var QUEUE = 'ggTestWirelessQueue'
  var TURN_WAIT_MS = 120000
  var TEST_TIMEOUT = 3600

  var EARTH = 'minecraft:overworld'
  var B = { x0: 37184, x1: 37247, z0: 0, z1: 63, y0: 98, y1: 112 }
  var ROOF_Y = 112
  var Y = 100
  var UXV = 12
  var UIV = 11
  var TOWER_AT = { x: 37200, y: Y, z: 20 }
  var PSS_AT = { x: 37220, z: 30 }
  var SOURCES = [
    { name: 'BZ dynamo (c1)', eut: 1073741824, plants: ['gtceu:bz_dynamo'] },
    { name: 'polar cap tap 1', eut: 536870912, plants: ['gtceu:polar_cap_tap'] },
    { name: 'polar cap tap 2', eut: 536870912, plants: ['gtceu:polar_cap_tap'] },
    { name: 'Penrose engine, as built (the network\'s 1/20)', eut: 268435456, plants: ['gtceu:penrose_engine'] }
  ]
  var DYNAMO_AT = [{ x: 37190, y: Y, z: 5 }, { x: 37194, y: Y, z: 5 }, { x: 37198, y: Y, z: 5 }, { x: 37202, y: Y, z: 5 }]
  var NEED_IN = 2260508051
  var NEED_BANK = 2295123149
  var NEED_OUT = 2147483648
  var EXAMPLE_IN = 2415919104
  var WINDOW = 1200
  var SETTLE_WAIT = 60
  var CELLS = 2
  var CELL_CAP = 4026531840000
  // the save mark (UIV blocks and the hull/hatch ids TP-S0F moved to GTM: v0.14.0 had them all)
  var MARK_TOWER = { x: 37236, y: Y, z: 50 }
  var MARK_HATCH = { x: 37242, y: Y, z: 58 }
  var MARK_CHEST = { x: 37244, y: Y, z: 58 }
  var MARK_GTM = [
    { p: { x: 37232, y: Y, z: 58 }, id: 'gtceu:uev_machine_hull' },
    { p: { x: 37234, y: Y, z: 58 }, id: 'gtceu:uiv_machine_hull' },
    { p: { x: 37236, y: Y, z: 58 }, id: 'gtceu:uev_energy_input_hatch_16a' },
    { p: { x: 37238, y: Y, z: 58 }, id: 'gtceu:uiv_energy_input_hatch_16a' }
  ]
  var MARK_KEY = 'ggTestUxvC3Mark'
  var MARK_PLAT_KEY = 'ggTestUxvC3MarkPlatforms'
  var MARK_ITEMS = [{ id: 'grindless:uiv_smes_cell', count: 3 }, { id: 'gtceu:uiv_wireless_energy_hatch_16a', count: 1 }, { id: 'gtceu:neutronium_ingot', count: 5 }]
  var MARK_CELL_CAP = 1006632960000
  // the arrival platforms' dimensions (UIV's three, UXV's two); the stand-in mark sits beside, never on, the platform at 64,100,64
  var PLATFORMS = [
    { place: 'rx_j1856', dim: 'grindless:rx_j1856_orbit', key: 'uivPlatform_' },
    { place: 'psr_j0437', dim: 'grindless:psr_j0437_orbit', key: 'uivPlatform_' },
    { place: 'cygnus_x1', dim: 'grindless:cygnus_x1_orbit', key: 'uivPlatform_' },
    { place: 'vela_pulsar', dim: 'grindless:vela_pulsar_orbit', key: 'uxvPlatform_' },
    { place: 'cas_a', dim: 'grindless:cas_a_remnant', key: 'uxvPlatform_' }
  ]
  var PLAT_MARK = { x: 37240, y: Y, z: 60 }

  var S = null
  var J = null

  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3500) }
  function emit(name, status, detail) {
    var line = TAG + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }
  function check(name, ok, detail) {
    if (S !== null && S.reported) S.reported[name] = true
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }
  function note(name, detail) { emit(name, 'NOTE', detail) }
  function guarded(name, fn) {
    try { fn() } catch (e) { check(name, false, 'exception: ' + e) }
  }

  function queueList() {
    var s = global[QUEUE]
    s = s === undefined || s === null ? '' : String(s)
    return s === '' ? [] : s.split(',')
  }
  function joinQueue(name) {
    var q = queueList()
    if (q.indexOf(name) < 0) q.push(name)
    global[QUEUE] = q.join(',')
  }
  function leaveQueue(name) {
    global[QUEUE] = queueList().filter(function (n) { return n !== name }).join(',')
  }
  function myTurn(name) { return queueList()[0] === name }

  function lazy() {
    if (J !== null) return J
    J = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      AL: Java.loadClass('java.util.ArrayList'),
      ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity'),
      AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      Machines: Java.loadClass('com.gregtechceu.gtceu.common.data.GTMachines')
    }
    return J
  }
  function rl(id) { return new (lazy().RL)(id) }
  function bp(x, y, z) { return new (lazy().BlockPos)(x, y, z) }
  function cmdIn(dim, text) { return S.server.runCommandSilent('execute in ' + dim + ' run ' + text) }
  function cmd(text) { return cmdIn(EARTH, text) }
  function short(id) { return String(id).replace(/^(gtceu|grindless|minecraft):/, '') }
  function num(x) { return Number(String(x)) }
  function asArray(coll) {
    var list = new (lazy().AL)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function machineAt(p) {
    var m = lazy().MetaMachine.getMachine(S.earth, bp(p.x, p.y, p.z))
    return m === null || m === undefined ? null : m
  }
  function north(id) { return id + '[facing=north]' }

  function wireless() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.hatchId !== 'function') throw new Error('global.grindless.wireless is missing')
    return w
  }
  function W() {
    var w = wireless()
    if (typeof w.settle !== 'function' || typeof w.setStored !== 'function') throw new Error('global.grindless.wireless is incomplete (the server script did not load)')
    return w
  }
  function structure(id) {
    var s = global.grindless && global.grindless.structures && global.grindless.structures[id]
    if (!s) throw new Error('no plain-data structure for ' + id)
    return s
  }

  // every cell of a registered structure whose controller stands at p facing north (the structure behind it, to the south)
  function cellsOf(id, p) {
    var desc = structure(id)
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (ctrl === null) throw new Error(id + ' has no controller cell')
    var out = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          out.push({ x: p.x - (ci - ctrl.ci), y: p.y + (ri - ctrl.ri), z: p.z - (si - ctrl.si), sym: desc.symbols[ch] })
        }
      })
    })
    return out
  }
  function defaultBlock(sym) {
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    if (sym.kind === 'blocks') return sym.blocks[0]
    if (sym.kind === 'oneOf') {
      for (var k = 0; k < sym.options.length; k++) if (sym.options[k].kind === 'blocks') return sym.options[k].blocks[0]
    }
    return null
  }

  // ---------------------------------------------------------------- world writes (refused outside the band)

  function inBand(x, y, z) { return x >= B.x0 && x <= B.x1 && z >= B.z0 && z <= B.z1 && y >= B.y0 && y <= B.y1 }
  function put(x, y, z, block, failed) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside this test\'s band')
    if (Number(cmd('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')) >= 1) return
    var want = String(block).split('[')[0]
    var have = String(S.earth.getBlock(x, y, z).id)
    if (have !== want) failed.push(x + ',' + y + ',' + z + ' ' + block + ' (is ' + have + ')')
  }
  function fillBand(y0, y1, block) {
    var n = 0
    for (var z = B.z0; z <= B.z1; z += 16) {
      n += Number(cmd('fill ' + B.x0 + ' ' + y0 + ' ' + z + ' ' + B.x1 + ' ' + y1 + ' ' + Math.min(z + 15, B.z1) + ' ' + block))
    }
    return n
  }
  function dropItems() {
    var list = S.earth.getEntitiesOfClass(lazy().ItemEntity, new (lazy().AABB)(B.x0, B.y0, B.z0, B.x1 + 1, B.y1 + 1, B.z1 + 1))
    for (var i = 0; i < list.size(); i++) list.get(i).discard()
    return Number(list.size())
  }
  function prepareArea() {
    for (var cx = B.x0 >> 4; cx <= B.x1 >> 4; cx++) {
      for (var cz = B.z0 >> 4; cz <= B.z1 >> 4; cz++) S.earth.getChunk(cx, cz)
    }
    cmd('forceload add ' + B.x0 + ' ' + B.z0 + ' ' + B.x1 + ' ' + B.z1)
    var cleared = fillBand(B.y0, B.y1, 'minecraft:air')
    fillBand(ROOF_Y, ROOF_Y, 'minecraft:smooth_stone')
    return 'X ' + B.x0 + '-' + B.x1 + ' Z ' + B.z0 + '-' + B.z1 + ' Y ' + B.y0 + '-' + B.y1 + ': generated, force-loaded, cleared ' + cleared + ', roof at Y ' + ROOF_Y
  }
  function clearArea() {
    var items = dropItems()
    var cleared = fillBand(B.y0, B.y1, 'minecraft:air')
    items += dropItems()
    cmd('forceload remove ' + B.x0 + ' ' + B.z0 + ' ' + B.x1 + ' ' + B.z1)
    return 'cleared ' + cleared + ' blocks, ' + items + ' item entities removed, force-load released'
  }

  // ---------------------------------------------------------------- the network's persistent data (put back at the end)

  function saveNetwork() {
    var w = W()
    var pd = S.server.persistentData
    S.savedKeys = {}
    ;[w.blocksKey, w.storeKey, w.legacyKey].forEach(function (k) {
      var t = pd.get(k)
      S.savedKeys[k] = t === null || t === undefined ? null : t.copy()
      pd.remove(k)
    })
    w.dropCache()
    Object.keys(w.faults).forEach(function (k) {
      var f = k.split('|')
      if (inBand(Number(f[1]), Number(f[2]), Number(f[3]))) delete w.faults[k]
    })
  }
  function restoreNetwork() {
    var w = W()
    var pd = S.server.persistentData
    var back = []
    Object.keys(S.savedKeys || {}).forEach(function (k) {
      pd.remove(k)
      var t = S.savedKeys[k]
      if (t !== null) { pd.put(k, t); back.push(k) }
    })
    w.dropCache()
    return 'the network\'s keys put back: ' + (back.length > 0 ? back.join(', ') : 'none existed, all removed')
  }

  function trackAt(p) {
    var w = W()
    var e = w.track(S.earth, bp(p.x, p.y, p.z))
    if (e) delete w.faults[w.flowKey(e)]
    return e
  }

  // ---------------------------------------------------------------- GTM's power substation from its preview shapes

  function shapeCells(shape) {
    var blocks = shape.getBlocks()
    var out = []
    for (var x = 0; x < blocks.length; x++) {
      for (var y = 0; y < blocks[x].length; y++) {
        for (var z = 0; z < blocks[x][y].length; z++) {
          var info = blocks[x][y][z]
          if (info === null || info === undefined) continue
          var state = info.getBlockState()
          out.push({ x: x, y: y, z: z, state: state, id: String(Block.getId(state.getBlock())) })
        }
      }
    }
    return out
  }

  // the substation with the most battery layers' highest-tier battery (the last preview shape); its input hatch swapped for `hatch`
  function buildSubstation(hatch, failed) {
    var def = lazy().GTRegistries.MACHINES.get(rl('gtceu:power_substation'))
    if (def === null || def === undefined) throw new Error('gtceu:power_substation is not registered')
    var shapes = asArray(def.getMatchingShapes())
    if (shapes.length === 0) throw new Error('no preview shape for the power substation')
    var cells = shapeCells(shapes[shapes.length - 1])
    var size = { x: 0, y: 0, z: 0 }
    cells.forEach(function (c) {
      size.x = Math.max(size.x, c.x + 1)
      size.y = Math.max(size.y, c.y + 1)
      size.z = Math.max(size.z, c.z + 1)
    })
    var ox = PSS_AT.x
    var oz = PSS_AT.z
    if (!inBand(ox + size.x - 1, Y + size.y - 1, oz + size.z - 1)) throw new Error('the substation does not fit the band: ' + JSON.stringify(size))
    var ctrl = null
    var swapped = null
    var batteries = {}
    cells.forEach(function (c) {
      if (c.id === 'minecraft:air') return
      var pos = bp(ox + c.x, Y + c.y, oz + c.z)
      if (/_battery|lapotron|_energy_cluster|_ultimate|_cluster/.test(c.id)) batteries[c.id] = (batteries[c.id] || 0) + 1
      // the first plain (non-substation) energy input hatch is the one swapped
      if (swapped === null && /energy_input_hatch$/.test(c.id) && c.id.indexOf('substation') < 0) {
        swapped = { x: ox + c.x, y: Y + c.y, z: oz + c.z, was: c.id }
        return
      }
      S.earth.setBlock(pos, c.state, 3)
      if (c.id === 'gtceu:power_substation') ctrl = { x: ox + c.x, y: Y + c.y, z: oz + c.z }
    })
    if (ctrl === null) throw new Error('no controller in the preview of the power substation')
    if (swapped === null) throw new Error('no plain energy input hatch in the substation preview')
    put(swapped.x, swapped.y, swapped.z, north(hatch), failed)
    return { ctrl: ctrl, hatch: swapped, size: size, batteries: batteries, shapes: shapes.length }
  }

  function bigStored(ctrl) {
    var tries = [
      function () { return ctrl.energyBank.getStored() },
      function () { return ctrl.getEnergyInfo().stored() },
      function () { return ctrl.getEnergyInfo().stored },
      function () { return ctrl.getEnergyInfo().getStored() },
      function () { return ctrl.getStored() },
      function () { return ctrl.energyBank.stored }
    ]
    for (var i = 0; i < tries.length; i++) {
      try {
        var v = tries[i]()
        if (v !== null && v !== undefined) {
          var n = num(v)
          if (!isNaN(n)) return n
        }
      } catch (e) { /* the next one */ }
    }
    try {
      var names = []
      var ms = ctrl.getClass().getMethods()
      for (var k = 0; k < ms.length; k++) { var nm = String(ms[k].getName()); if (/nergy|tored|apacity/.test(nm)) names.push(nm) }
      note('pss_api', ctrl.getClass().getName() + ': ' + names.join(','))
    } catch (e2) { note('pss_api', 'reflection unavailable: ' + e2) }
    return -1
  }

  function formedOrForce(name, m, waited, after) {
    if (m === null) return 'missing'
    if (m.isFormed()) return 'formed'
    if (waited < after) return 'waiting'
    if (m.checkPatternWithLock()) {
      m.setFlipped(m.getMultiblockState().isNeededFlip())
      m.onStructureFormed()
      note(name + '_forced', 'not formed by itself after ' + waited + ' ticks; a synchronous check passes (forming it)')
      return 'formed'
    }
    return waited > after + 200 ? 'failed: ' + m.getMultiblockState().error : 'waiting'
  }
  function checked(m) {
    if (m === null || !m.isFormed()) return false
    var ms = m.getMultiblockState()
    return ms.cache !== null && ms.cache !== undefined
  }
  function partIds(ctrl) {
    return asArray(ctrl.getParts()).map(function (p) { return String(p.getDefinition().getId()) })
  }

  // ---------------------------------------------------------------- checks

  function checkRegistry() {
    var w = wireless()
    var L = lazy()
    var missing = []
    var dyn = w.hatchId('dynamo', UXV, 64)
    var hat = w.hatchId('hatch', UXV, 16)
    ;[dyn, hat, 'gtceu:power_substation'].forEach(function (id) {
      if (L.GTRegistries.MACHINES.get(rl(id)) === null || L.GTRegistries.MACHINES.get(rl(id)) === undefined) missing.push(id)
    })
    var row = w.tierRow[UXV]
    if (!row) missing.push('wireless tier row 12')
    else if (!L.BI.BLOCK.containsKey(rl(row.cell))) missing.push(row.cell)
    check('registry', missing.length === 0 && hat === 'gtceu:uxv_wireless_energy_hatch_16a' && row && row.cell === 'grindless:uxv_smes_cell' && num(row.capacity) === CELL_CAP,
      'dynamo ' + dyn + ', hatch ' + hat + ', cell ' + (row ? row.cell + ' ' + row.capacity + ' EU' : 'none') + (missing.length ? ' MISSING ' + missing.join(', ') : ''))
    note('sources', SOURCES.map(function (s) {
      var reg = s.plants.filter(function (id) {
        var d = L.GTRegistries.MACHINES.get(rl(id))
        return d !== null && d !== undefined
      })
      return s.name + ' ' + s.eut + ' EU/t (' + s.plants.join(', ') + (reg.length === s.plants.length ? ' registered' : ' NOT registered') + ')'
    }).join('; ') + ': none is placed, each figure is the doc\'s calibration, fed through one UXV 64 A dynamo hatch')
  }

  function buildTower(failed, at, tier, cells) {
    var w = wireless()
    var cell = w.tierRow[tier].cell
    var used = 0
    cellsOf(w.towerId, at).forEach(function (c) {
      var kind = c.sym.kind
      if (kind === 'controller' || kind === 'air' || kind === 'any') return
      var id = defaultBlock(c.sym)
      if (kind === 'oneOf') {
        id = used < cells ? cell : w.casing
        used++
      }
      put(c.x, c.y, c.z, id, failed)
    })
    put(at.x, at.y, at.z, north(w.towerId), failed)
  }

  function run(server) {
    S = { server: server, earth: server.overworld(), tick0: server.getTickCount(), t: 0, phase: 'start', phaseAt: 0, finished: false, areaTouched: false,
      reported: {}, stopReason: '', dynamo: [], loadMode: 'real' }
    guarded('registry', checkRegistry)
    guarded('high_tier_content', function () {
      var v = Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder').INSTANCE.machines.highTierContent
      check('high_tier_content', String(v) === 'true', 'machines.highTierContent = ' + v + ' (pack/config/gtceu.yaml turns it on since TP-S0F; want true)')
    })
    var w = W()
    w.paused = true
    S.pausedByUs = true
    saveNetwork()
    S.areaTouched = true
    note('AREA', prepareArea())
    var failed = []
    buildTower(failed, TOWER_AT, UXV, CELLS)
    DYNAMO_AT.forEach(function (p) { put(p.x, p.y, p.z, north(w.hatchId('dynamo', UXV, 64)), failed) })
    var hatchId = w.hatchId('hatch', UXV, 16)
    try {
      S.pss = buildSubstation(hatchId, failed)
    } catch (e) {
      S.pss = null
      S.pssWhy = String(e)
      S.loadMode = 'calibrated'
      // the calibrated load's own hatch, alone
      S.pss = { ctrl: null, hatch: { x: PSS_AT.x, y: Y, z: PSS_AT.z }, size: null, batteries: {}, shapes: 0 }
      put(PSS_AT.x, Y, PSS_AT.z, north(hatchId), failed)
    }
    var tracked = []
    ;[TOWER_AT].concat(DYNAMO_AT).concat([S.pss.hatch]).forEach(function (p) {
      var e = trackAt(p)
      tracked.push(e ? e.k + ' t' + e.t + (e.a ? ' ' + e.a + 'A' : '') : 'NOT TRACKED ' + p.x + ',' + p.z)
    })
    var bad = tracked.filter(function (s) { return s.indexOf('NOT TRACKED') === 0 })
    check('PLACED', failed.length === 0 && bad.length === 0, 'tower (' + CELLS + ' x grindless:uxv_smes_cell), ' + DYNAMO_AT.length + ' UXV 64 A dynamo hatches, the ' + S.loadMode + ' load' +
      (S.pss.size ? ' (the substation ' + JSON.stringify(S.pss.size) + ', ' + S.pss.shapes + ' preview shapes, batteries ' + JSON.stringify(S.pss.batteries) + ', hatch swapped for ' + short(hatchId) + ' was ' + S.pss.hatch.was + ')' : ' (' + S.pssWhy + ')') +
      '; tracked [' + tracked.join('; ') + ']' + (failed.length ? ' FAILED ' + failed.slice(0, 8).join('; ') : ''))
    if (failed.length > 0) { S.stopReason = 'placing failed'; S.phase = 'end'; return }
    S.phase = 'forming'
  }

  function feedDynamos() {
    S.dynamo.forEach(function (c, i) {
      var before = num(c.getEnergyStored())
      c.changeEnergy(SOURCES[i].eut)
      S.fed += num(c.getEnergyStored()) - before
    })
  }

  function snapshot() {
    var w = W()
    var tot = w.totals
    var hatchFlow = w.flows[EARTH + '|' + S.pss.hatch.x + '|' + S.pss.hatch.y + '|' + S.pss.hatch.z + '|'] || { filled: 0 }
    return { t: S.t, drained: num(tot.drained), inn: num(tot.in), out: num(tot.out), lost: num(tot.lost), filled: num(hatchFlow.filled), bank: num(w.stored(S.server)),
      pss: S.pss.ctrl === null ? -1 : bigStored(machineAt(S.pss.ctrl)), fed: S.fed }
  }

  function report() {
    var a = S.w0
    var b = S.w1
    var ticks = b.t - a.t
    var din = (b.drained - a.drained) / ticks
    var bank = (b.inn - a.inn) / ticks
    var outRate = (b.filled - a.filled) / ticks
    var st = W().status(S.server)
    note('GATE_MODE', 'load ' + S.loadMode + (S.loadMode === 'real' ? ' (GTM power substation on the UXV 16 A wireless hatch)' : ' (' + S.pssWhy + '): the hatch drained ' + NEED_OUT + ' EU/t by the fixture') +
      '; sources calibrated (' + SOURCES.map(function (s) { return s.eut }).join(' + ') + ' EU/t, the plants are not built); window ' + ticks + ' ticks = ' + (ticks / 20) + ' s' + (ticks < WINDOW ? ' (SHORTER than the 60 s asked)' : ''))
    check('GATE_IN', din >= NEED_IN && din >= EXAMPLE_IN * 0.999, 'drained from the dynamo hatches ' + Math.round(din) + ' EU/t over ' + ticks + ' ticks (need ' + NEED_IN + '); fed ' + Math.round((b.fed - a.fed) / ticks) + ' EU/t')
    check('GATE_BANK', bank >= NEED_BANK * 0.999 && bank >= 0.94 * din, 'into the bank ' + Math.round(bank) + ' EU/t (the example\'s 19/20 ' + NEED_BANK + '; need 0.999 of it, and at least ' + NEED_OUT + ' to sustain the out figure); lost ' + Math.round((b.lost - a.lost) / ticks) + ' EU/t')
    var pssGain = b.pss >= 0 && a.pss >= 0 ? (b.pss - a.pss) / ticks : -1
    var cells = 0
    Object.keys(S.pss.batteries).forEach(function (k) { cells += S.pss.batteries[k] })
    var drainCap = 100000 * cells
    var implied = outRate - pssGain
    var ok = outRate >= NEED_OUT
    // the substation also bleeds passive drain (GTM: at most 100,000 EU/t per battery); the rest of the intake must show as stored energy
    if (S.loadMode === 'real') ok = ok && pssGain > 0 && implied <= drainCap * 1.001
    check('GATE_OUT', ok, 'out through the UXV 16 A hatch ' + Math.round(outRate) + ' EU/t over ' + ticks + ' ticks (need ' + NEED_OUT + ', the c10 row; ' + Math.round(outRate * ticks) + ' EU in the window, the row takes 2,576,980,377,600)' + (pssGain >= 0 ? '; the substation\'s stored energy rose ' + Math.round(pssGain) + ' EU/t (' + Math.round(a.pss) + ' -> ' + Math.round(b.pss) + '), the rest ' + Math.round(implied) + ' EU/t is passive drain (cap ' + drainCap + ' for ' + cells + ' batteries)' : '; substation stored energy unreadable') +
      '; the bank ' + Math.round(a.bank) + ' -> ' + Math.round(b.bank) + ' EU')
    note('network', 'up ' + st.up + ', ' + st.towers + ' tower, ' + st.capacity + ' EU, tier ' + st.tier + ', stored ' + st.stored + ', faults ' + JSON.stringify(Object.keys(W().faults).filter(function (k) { return inBand(Number(k.split('|')[1]), Number(k.split('|')[2]), Number(k.split('|')[3])) })))
  }

  function step() {
    var since = S.t - S.phaseAt
    var w = W()
    if (S.phase === 'forming') {
      var tower = machineAt(TOWER_AT)
      var rt = formedOrForce('TOWER', tower, since, 100)
      var rp = S.pss.ctrl === null ? 'none' : formedOrForce('SUBSTATION', machineAt(S.pss.ctrl), since, 100)
      var ready = rt !== 'waiting' && rp !== 'waiting' && checked(tower) && (rp === 'none' || checked(machineAt(S.pss.ctrl)))
      if (!ready && since <= 400) return
      var ids = rp === 'formed' ? partIds(machineAt(S.pss.ctrl)) : []
      check('SUBSTATION', S.loadMode === 'calibrated' ? false : rp === 'formed' && ids.indexOf(w.hatchId('hatch', UXV, 16)) >= 0,
        'the power substation ' + rp + ' after ' + since + ' ticks, parts [' + ids.map(short).join(', ') + ']' + (S.loadMode === 'calibrated' ? '; not built, so the load below is calibrated: ' + S.pssWhy : ''))
      if (rp !== 'formed' && S.loadMode === 'real') {
        S.loadMode = 'calibrated'
        S.pssWhy = 'the substation did not form: ' + rp
      }
      if (rt !== 'formed') {
        check('TOWER', false, 'the tower ' + rt)
        S.stopReason = 'the tower ' + rt
        S.phase = 'end'
        return
      }
      w.paused = false
      var st = w.settle(S.server)
      S.dynamo = DYNAMO_AT.map(function (p) { return machineAt(p).energyContainer })
      S.fed = 0
      check('TOWER', st.up && st.towers === 1 && st.tier === UXV && num(st.capacity) === CELLS * CELL_CAP,
        'the network: up ' + st.up + ', ' + st.towers + ' tower, ' + st.capacity + ' EU (want ' + (CELLS * CELL_CAP) + '), tier ' + st.tier + ' (want ' + UXV + ')')
      w.setStored(S.server, 0)
      S.phase = 'settle'
      S.phaseAt = S.t
      return
    }
    if (S.phase === 'settle') {
      if (since < SETTLE_WAIT) return
      S.w0 = snapshot()
      S.phase = 'window'
      S.phaseAt = S.t
      return
    }
    if (S.phase === 'window') {
      if (since < WINDOW) return
      S.w1 = snapshot()
      guarded('GATES', report)
      S.phase = 'end'
    }
  }

  function perTick() {
    if (S.phase === 'settle' || S.phase === 'window') {
      feedDynamos()
      if (S.loadMode === 'calibrated') {
        var hc = machineAt(S.pss.hatch).energyContainer
        hc.changeEnergy(-Math.min(NEED_OUT, num(hc.getEnergyStored())))
      }
    }
  }

  function cleanup() {
    var lines = []
    if (S.areaTouched) lines.push(clearArea())
    if (S.savedKeys) lines.push(restoreNetwork())
    note('cleanup', lines.join('; '))
  }

  var MAIN_CHECKS = ['registry', 'PLACED', 'SUBSTATION', 'TOWER', 'GATE_IN', 'GATE_BANK', 'GATE_OUT']

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    MAIN_CHECKS.forEach(function (n) { if (!S.reported[n]) check(n, false, 'not reached: ' + (S.stopReason || 'the run ended early')) })
    try { if (S.pausedByUs) W().paused = false } catch (e0) { /* nothing */ }
    try { cleanup() } catch (e) { check('cleanup', false, 'exception: ' + e) }
    leaveQueue(SCOPE)
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick() {
    if (S === null || S.finished) return
    S.t = S.server.getTickCount() - S.tick0
    try {
      perTick()
      if (S.phase !== 'end' && S.t % 5 === 0) step()
    } catch (e) {
      check('step', false, 'exception in ' + S.phase + ': ' + e)
      S.stopReason = 'an exception in ' + S.phase
      S.phase = 'end'
    }
    if (S.phase === 'end') { finish(); return }
    if (S.t > TEST_TIMEOUT) {
      check('timeout', false, 'still in ' + S.phase + ' after ' + S.t + ' ticks')
      S.stopReason = 'the timeout in ' + S.phase
      finish()
    }
  }

  // ---------------------------------------------------------------- stations, platforms, the save mark and its reopen (no wireless turn:
  // they run alone, after the gate; the mark's tower stays on the network until the reopen removes it)

  function sideEmit(scope, name, status, detail) { console.info(TAG + scope + '|' + name + '|' + status + (detail === undefined || detail === '' ? '' : '|' + clean(detail))) }
  function sideCheck(scope, name, ok, detail) { sideEmit(scope, name, ok ? 'PASS' : 'FAIL', detail) }
  function sideState(server) {
    S = { server: server, earth: server.overworld(), finished: true, reported: {}, stopReason: '', areaTouched: false }
  }

  function stationsCheck(scope) {
    var G = global.grindless
    var slots = G && G.stations && G.stations.slots ? G.stations.slots : []
    var Helper = Java.loadClass('argent_matter.gcyr.api.capability.GCYRCapabilityHelper')
    var rows = []
    var bad = 0
    slots.forEach(function (s) {
      var orbit = String(s.orbit)
      try {
        var level = S.server.getLevel(orbit)
        if (level === null || level === undefined) { bad++; rows.push(s.slot + ' ' + orbit + ': NO LEVEL'); return }
        level.getChunk(0, 0)
        var holder = Helper.getSpaceStations(level)
        if (holder === null || holder === undefined) { bad++; rows.push(s.slot + ' ' + orbit + ': level loaded, NO station holder'); return }
        rows.push(s.slot + ' ' + orbit + ': loaded, ' + Number(holder.getFreeStationId()) + ' station(s)')
      } catch (e) {
        bad++
        rows.push(s.slot + ' ' + orbit + ': ' + e)
      }
    })
    var base = true
    try {
      var surf = S.server.getLevel('grindless:barnard_b')
      if (surf === null || surf === undefined) { base = false; rows.push('barnard base: NO grindless:barnard_b level') }
      else { surf.getChunk(0, 0); rows.push('barnard base: grindless:barnard_b loaded') }
    } catch (e) { base = false; rows.push('barnard base: ' + e) }
    sideCheck(scope, 'stations', slots.length >= 10 && bad === 0 && base, slots.length + ' station slot(s) (want at least 10) [' + rows.join('; ') + ']')
  }

  function platformsCheck(scope) {
    var rows = []
    var bad = 0
    PLATFORMS.forEach(function (p) {
      try {
        var level = S.server.getLevel(p.dim)
        if (level === null || level === undefined) { bad++; rows.push(p.place + ': NO LEVEL ' + p.dim); return }
        level.getChunk(4, 4)
        var pd = S.server.persistentData
        var key = p.key + p.place
        rows.push(p.place + ': loaded, platform row ' + (pd.contains(key) ? String(pd.getString(key)) : 'none (no jump has run in this world)'))
      } catch (e) {
        bad++
        rows.push(p.place + ': ' + e)
      }
    })
    sideCheck(scope, 'platforms', bad === 0, PLATFORMS.length + ' arrival platform dimension(s) [' + rows.join('; ') + ']')
  }

  function markCells() {
    var w = wireless()
    var cell = w.tierRow[UIV].cell
    var used = 0
    var out = []
    cellsOf(w.towerId, MARK_TOWER).forEach(function (c) {
      if (c.sym.kind === 'oneOf') { if (used < CELLS) out.push(c); used++ }
    })
    return { cell: cell, at: out }
  }

  function levelOf(dim) {
    try {
      var level = S.server.getLevel(dim)
      return level === null || level === undefined ? null : level
    } catch (e) { return null }
  }

  // marks every platform dimension the running version has; returns the places marked (a v0.14.0 world has no Vela or Cas A level)
  function platformMark(failed) {
    var marked = []
    PLATFORMS.forEach(function (p) {
      var level = levelOf(p.dim)
      if (level === null) return
      level.getChunk(PLAT_MARK.x >> 4, PLAT_MARK.z >> 4)
      cmdIn(p.dim, 'forceload add ' + PLAT_MARK.x + ' ' + PLAT_MARK.z)
      if (Number(cmdIn(p.dim, 'setblock ' + PLAT_MARK.x + ' ' + PLAT_MARK.y + ' ' + PLAT_MARK.z + ' minecraft:chest[facing=north] replace')) < 1 &&
        String(level.getBlock(PLAT_MARK.x, PLAT_MARK.y, PLAT_MARK.z).id) !== 'minecraft:chest') failed.push(p.place + ' chest')
      MARK_ITEMS.forEach(function (it, i) {
        if (Number(cmdIn(p.dim, 'item replace block ' + PLAT_MARK.x + ' ' + PLAT_MARK.y + ' ' + PLAT_MARK.z + ' container.' + i + ' with ' + it.id + ' ' + it.count)) < 1) failed.push(p.place + ' slot ' + i)
      })
      marked.push(p.place)
    })
    return marked
  }

  function mark(server) {
    var scope = 'uxv_c3_save'
    sideState(server)
    try {
      var w = W()
      for (var cx = B.x0 >> 4; cx <= B.x1 >> 4; cx++) {
        for (var cz = B.z0 >> 4; cz <= B.z1 >> 4; cz++) S.earth.getChunk(cx, cz)
      }
      cmd('forceload add ' + B.x0 + ' ' + B.z0 + ' ' + B.x1 + ' ' + B.z1)
      var failed = []
      buildTower(failed, MARK_TOWER, UIV, CELLS)
      put(MARK_HATCH.x, MARK_HATCH.y, MARK_HATCH.z, north(w.hatchId('hatch', UIV, 16)), failed)
      MARK_GTM.forEach(function (g) { put(g.p.x, g.p.y, g.p.z, g.id, failed) })
      put(MARK_CHEST.x, MARK_CHEST.y, MARK_CHEST.z, 'minecraft:chest[facing=north]', failed)
      MARK_ITEMS.forEach(function (it, i) {
        if (Number(cmd('item replace block ' + MARK_CHEST.x + ' ' + MARK_CHEST.y + ' ' + MARK_CHEST.z + ' container.' + i + ' with ' + it.id + ' ' + it.count)) < 1) failed.push('chest slot ' + i + ' ' + it.id)
      })
      var gtm = MARK_GTM.map(function (g) {
        var m = machineAt(g.p)
        return short(g.id) + (m === null ? ' NO MACHINE' : ' ' + m.getDefinition().getId())
      })
      var marked = platformMark(failed)
      var tower = machineAt(MARK_TOWER)
      var formed = tower !== null && tower.isFormed()
      if (tower !== null && !formed && tower.checkPatternWithLock()) {
        tower.setFlipped(tower.getMultiblockState().isNeededFlip())
        tower.onStructureFormed()
        formed = true
      }
      var tracked = [MARK_TOWER, MARK_HATCH].map(function (p) {
        var e = trackAt(p)
        return e ? e.k + ' t' + e.t : 'NOT TRACKED ' + p.x + ',' + p.z
      })
      var st = w.settle(server)
      server.persistentData.putString(MARK_KEY, 'marked at tick ' + server.getTickCount() + ', ' + new Date().toISOString())
      server.persistentData.putString(MARK_PLAT_KEY, marked.join(','))
      sideCheck(scope, 'mark', failed.length === 0 && formed && tracked.join(';').indexOf('NOT TRACKED') < 0 && st.towers >= 1 && gtm.join(';').indexOf('NO MACHINE') < 0 && marked.length >= 3,
        'tower at ' + MARK_TOWER.x + ',' + MARK_TOWER.y + ',' + MARK_TOWER.z + ' (2 x ' + w.tierRow[UIV].cell + ') ' + (formed ? 'formed' : 'NOT formed') + ', UIV 16 A hatch, hulls and hatches [' + gtm.join('; ') + '], chest [' +
        MARK_ITEMS.map(function (it) { return it.count + ' ' + it.id }).join(', ') + '], key ' + MARK_KEY + ', a force-loaded chunk and a chest in ' + marked.length + ' of ' + PLATFORMS.length + ' platform dimensions [' + marked.join(', ') + ']; tracked [' + tracked.join('; ') + ']; network up ' + st.up + ', ' + st.towers + ' tower(s), ' + st.capacity + ' EU, tier ' + st.tier +
        (failed.length ? ' FAILED ' + failed.slice(0, 6).join('; ') : ''))
      sideEmit(scope, 'save', 'NOTE', 'save-all flush: ' + server.runCommandSilent('save-all flush'))
    } catch (e) {
      sideCheck(scope, 'mark', false, 'exception: ' + e)
    }
    console.info(TAG + scope + '|DONE')
  }

  function chestRead(level, p) {
    var inv = level.getBlock(p.x, p.y, p.z).getInventory()
    var got = []
    var missing = []
    MARK_ITEMS.forEach(function (it, i) {
      var stack = inv === null || inv === undefined ? null : inv.getStackInSlot(i)
      var gid = stack === null || stack.isEmpty() ? 'none' : String(stack.id)
      var gn = stack === null || stack.isEmpty() ? 0 : Number(stack.count)
      got.push(gn + ' ' + gid)
      if (gid !== it.id || gn !== it.count) missing.push(it.count + ' ' + it.id)
    })
    return { got: got, missing: missing }
  }

  function platformReopen(scope) {
    var rows = []
    var bad = 0
    var pd = S.server.persistentData
    var markedList = pd.contains(MARK_PLAT_KEY) ? String(pd.getString(MARK_PLAT_KEY)) : ''
    var marked = markedList === '' ? [] : markedList.split(',')
    var unmarked = []
    PLATFORMS.forEach(function (p) {
      try {
        var level = levelOf(p.dim)
        if (level === null) { bad++; rows.push(p.place + ': NO LEVEL ' + p.dim); return }
        level.getChunk(PLAT_MARK.x >> 4, PLAT_MARK.z >> 4)
        if (marked.indexOf(p.place) < 0) {
          unmarked.push(p.place)
          rows.push(p.place + ': loaded; not marked (the saving version had no ' + p.dim + ')')
        } else {
          var forced = Number(level.getForcedChunks().size())
          var id = String(level.getBlock(PLAT_MARK.x, PLAT_MARK.y, PLAT_MARK.z).id)
          var r = id === 'minecraft:chest' ? chestRead(level, PLAT_MARK) : { got: [], missing: ['chest'] }
          if (id !== 'minecraft:chest' || r.missing.length > 0 || forced < 1) bad++
          rows.push(p.place + ': forced chunks ' + forced + ', block ' + id + ', chest [' + r.got.join(', ') + ']' + (r.missing.length ? ' MISSING ' + r.missing.join(', ') : ''))
          cmdIn(p.dim, 'setblock ' + PLAT_MARK.x + ' ' + PLAT_MARK.y + ' ' + PLAT_MARK.z + ' minecraft:air replace')
          cmdIn(p.dim, 'forceload remove ' + PLAT_MARK.x + ' ' + PLAT_MARK.z)
        }
        var key = p.key + p.place
        if (pd.contains(key)) {
          var parts = String(pd.getString(key)).split('@')
          var xyz = parts.length > 1 ? parts[1].split(',') : []
          var ring = xyz.length === 3 ? lazy().MetaMachine.getMachine(level, bp(Number(xyz[0]), Number(xyz[1]), Number(xyz[2]))) : null
          rows.push(p.place + ' platform row ' + parts.join('@') + ': ring ' + (ring === null || ring === undefined ? 'NOT loaded' : 'loaded, formed ' + ring.isFormed()))
          if (ring === null || ring === undefined) bad++
        }
      } catch (e) {
        bad++
        rows.push(p.place + ': ' + e)
      }
    })
    sideCheck(scope, 'platforms', bad === 0 && marked.length >= 3, PLATFORMS.length + ' platform dimension(s) load, ' + marked.length + ' marked [' + marked.join(', ') + ']' +
      (unmarked.length ? ', ' + unmarked.length + ' new since the saving version [' + unmarked.join(', ') + ']' : '') + '; the stand-in marks and any placed platform read back [' + rows.join('; ') + ']')
    pd.remove(MARK_PLAT_KEY)
  }

  var R = null
  function reopenStart(server) {
    sideState(server)
    R = { t0: server.getTickCount(), done: false }
    for (var cx = B.x0 >> 4; cx <= B.x1 >> 4; cx++) {
      for (var cz = B.z0 >> 4; cz <= B.z1 >> 4; cz++) S.earth.getChunk(cx, cz)
    }
  }
  function reopenTick(server) {
    if (R === null || R.done) return
    var waited = server.getTickCount() - R.t0
    var tower = machineAt(MARK_TOWER)
    if (!(tower !== null && tower.isFormed()) && waited < 200) return
    R.done = true
    var scope = 'uxv_c3_reopen'
    try {
      var w = W()
      var pd = server.persistentData
      var key = pd.contains(MARK_KEY) ? String(pd.getString(MARK_KEY)) : null
      sideCheck(scope, 'key', key !== null, key === null ? 'persistent key ' + MARK_KEY + ' missing' : MARK_KEY + ' = ' + key)
      var mc = markCells()
      var want = [{ p: MARK_TOWER, id: w.towerId }, { p: MARK_HATCH, id: w.hatchId('hatch', UIV, 16) }, { p: MARK_CHEST, id: 'minecraft:chest' }]
      mc.at.forEach(function (c) { want.push({ p: c, id: mc.cell }) })
      var wrong = []
      want.forEach(function (x) {
        var have = String(S.earth.getBlock(x.p.x, x.p.y, x.p.z).id)
        if (have !== x.id) wrong.push(x.p.x + ',' + x.p.y + ',' + x.p.z + ' want ' + x.id + ' is ' + have)
      })
      sideCheck(scope, 'blocks', wrong.length === 0, want.length + ' marked blocks (tower controller, ' + mc.at.length + ' UIV cells, UIV 16 A hatch, chest)' + (wrong.length ? ' WRONG ' + wrong.join('; ') : ' all in place'))
      var gtmRows = []
      var gtmBad = 0
      MARK_GTM.forEach(function (g) {
        var have = String(S.earth.getBlock(g.p.x, g.p.y, g.p.z).id)
        var m = machineAt(g.p)
        var def = m === null ? 'none' : String(m.getDefinition().getId())
        if (have !== g.id || def !== g.id) gtmBad++
        gtmRows.push(g.id + ': block ' + have + ', machine ' + def)
      })
      sideCheck(scope, 'gtm_ids', gtmBad === 0, MARK_GTM.length + ' hulls and 16 A hatches keep their ids and load as GTM machines [' + gtmRows.join('; ') + ']')
      var cr = chestRead(S.earth, MARK_CHEST)
      sideCheck(scope, 'chest', cr.missing.length === 0, 'chest slots [' + cr.got.join(', ') + ']' + (cr.missing.length ? ' MISSING ' + cr.missing.join(', ') : ''))
      var formed = tower !== null && tower.isFormed()
      var e = trackAt(MARK_TOWER)
      var st = w.settle(server)
      sideCheck(scope, 'tower', formed && e !== null && e !== undefined && st.up && st.towers >= 1 && num(st.capacity) >= CELLS * MARK_CELL_CAP,
        'the tower ' + (formed ? 'formed again' : 'NOT formed') + ' after ' + waited + ' ticks, ' + (e ? 'on the network (' + e.k + ' t' + e.t + ')' : 'NOT on the network') +
        '; network up ' + st.up + ', ' + st.towers + ' tower(s), ' + st.capacity + ' EU (want at least ' + (CELLS * MARK_CELL_CAP) + '), tier ' + st.tier + ', stored ' + st.stored)
      platformReopen(scope)
      stationsCheck(scope)
      var items = dropItems()
      var cleared = fillBand(B.y0, B.y1, 'minecraft:air')
      cmd('forceload remove ' + B.x0 + ' ' + B.z0 + ' ' + B.x1 + ' ' + B.z1)
      pd.remove(MARK_KEY)
      w.dropCache()
      Object.keys(w.faults).forEach(function (k) {
        var f = k.split('|')
        if (inBand(Number(f[1]), Number(f[2]), Number(f[3]))) delete w.faults[k]
      })
      sideEmit(scope, 'cleanup', 'NOTE', 'cleared ' + cleared + ' blocks, ' + items + ' item entities, force-load released, ' + MARK_KEY + ' removed, platform stand-ins removed')
    } catch (ex) {
      sideCheck(scope, 'reopen', false, 'exception: ' + ex)
    }
    console.info(TAG + scope + '|DONE')
  }

  var waitingSince = 0
  function gaveUp(server) {
    global[REQUEST] = false
    waitingSince = 0
    S = { server: server, finished: false, reported: {}, stopReason: 'no turn', areaTouched: false }
    check('TURN', false, 'asked for and had no turn on the wireless network in ' + (TURN_WAIT_MS / 1000) + ' s: the queue is [' + queueList().join(', ') + ']')
    finish()
  }

  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) {
      if (global[REQUEST] !== true) waitingSince = 0
      return
    }
    if (waitingSince === 0) waitingSince = Date.now()
    if (Date.now() - LOADED_AT < QUIET_MS || !myTurn(SCOPE)) {
      if (Date.now() - waitingSince > TURN_WAIT_MS) gaveUp(server)
      return
    }
    global[REQUEST] = false
    waitingSince = 0
    try {
      run(server)
    } catch (e) {
      check('run', false, 'exception: ' + e)
      if (S !== null) { S.stopReason = 'an exception at the start'; finish() }
    }
  }

  // the harness sends every command at once: the station check and the save mark wait until the gate (same band) has finished
  var PENDING = { stations: false, mark: false }
  function runPending(server) {
    if (busy() || global[REQUEST] === true) return
    if (PENDING.stations) {
      PENDING.stations = false
      sideState(server)
      try { stationsCheck('uxv_c3_stations') } catch (e) { sideCheck('uxv_c3_stations', 'stations', false, 'exception: ' + e) }
      try { platformsCheck('uxv_c3_stations') } catch (e2) { sideCheck('uxv_c3_stations', 'platforms', false, 'exception: ' + e2) }
      console.info(TAG + 'uxv_c3_stations|DONE')
    }
    if (PENDING.mark) {
      PENDING.mark = false
      mark(server)
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
    reopenTick(event.server)
    runPending(event.server)
  })

  function busy() { return (S !== null && !S.finished) || (R !== null && !R.done) }

  ServerEvents.customCommand('gg_test_uxv_c3', function (event) {
    if (busy()) {
      note('run', 'a previous run is still in progress')
      return 0
    }
    global[REQUEST] = true
    waitingSince = Date.now()
    joinQueue(SCOPE)
    return 1
  })

  ServerEvents.customCommand('gg_test_uxv_c3_stations', function (event) {
    PENDING.stations = true
    return 1
  })

  ServerEvents.customCommand('gg_test_uxv_c3_mark', function (event) {
    PENDING.mark = true
    return 1
  })

  ServerEvents.customCommand('gg_test_uxv_c3_reopen', function (event) {
    if (busy()) { sideEmit('uxv_c3_reopen', 'run', 'NOTE', 'another uxv_c3 run is in progress'); return 0 }
    reopenStart(event.server)
    return 1
  })
})()
