// priority: -8724
// Gregtech Grindless - native fixture of package UV-C3 (TEST-ONLY overlay, never shipped): the gate example of docs/eras/uv.md
// ("Power on the wireless network") on the wireless network at UV, the six stations, and a save mark read back after a restart.
//
//   powershell -NoProfile -ExecutionPolicy Bypass -File tools\test\Invoke-GGTest.ps1 -Suite server -Slots 1 `
//     -Commands 'kubejs custom_command gg_test_uv_c3' -WaitForLog 'GGTEST\|uv_c3\|DONE@@180'
// It takes its turn on the wireless network with the other wireless fixtures (queue `ggTestWirelessQueue` in `global`).
//
// Markers: GGTEST|uv_c3|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|uv_c3|DONE.
//   registry     the UV wireless hatches (W.hatchId: dynamo 64 A, energy 16 A = gtceu:uv_wireless_energy_hatch_16a), grindless:uv_smes_cell,
//                gtceu:power_substation; NOTE which source plants are registered (none is placed: their outputs are calibrated)
//   TOWER        a wireless tower with two grindless:uv_smes_cell forms; the network is tier 8 (UV), capacity 2 x 15,728,640,000 EU
//   SUBSTATION   GTM's own power substation (its highest-tier battery preview shape) with its first plain input hatch swapped for the
//                UV 16 A wireless energy hatch forms ("real" load); when it cannot be built the load is "calibrated": the hatch is
//                drained 8,388,608 EU/t by the fixture (the mode is stated in GATE_MODE)
//   GATE_IN      four UV 64 A wireless dynamo hatches, each given one source of the doc's example: the ZPM gate mix 2,620,464, two
//                accelerator-driven reactors 3,145,728, one laser fusion chamber 2,621,440, two muon fusion cells 1,572,864 EU/t; the
//                network drains at least 9,960,496 EU/t from them over the window
//   GATE_BANK    at least 95% of that reaches the bank (the network's 19/20): the doc's 9,462,471 EU/t
//   GATE_OUT     at least 8,388,608 EU/t (a 16 A UV hatch) leaves the bank through the hatch over the window; the substation's stored
//                energy rises by what the hatch gave (real mode)
// The window is WINDOW ticks (1,200 = 60 s at 20 TPS) after the network has settled; it is counted in ticks, not wall seconds.
//
// Other commands (each ends with its own DONE line):
//   gg_test_uv_c3_stations  GGTEST|uv_c3_stations|...  every station slot of G.stations.slots (six at UV): the orbit level exists, a
//                           chunk of its station plot loads and GCYR's station holder answers (its station count is reported)
//   gg_test_uv_c3_mark      GGTEST|uv_c3_save|...      a save mark built only from blocks v0.9.0 already had (so a v0.9.0 world can carry
//                           it): a wireless tower with two ZPM cells (tracked), a ZPM 16 A hatch, a chest with three items, a persistent
//                           key; then save-all flush
//   gg_test_uv_c3_reopen    GGTEST|uv_c3_reopen|...    after a restart (or on a world another pack version saved): what survived of the
//                           mark (blocks, chest, tower formed and on the network, the key) and the stations; then the mark is removed
// TEST AREA: only X 27648-27711, Z 0-63, Y 98-112 of the Overworld; every write goes through put / fillBand / forceload.
// var + function everywhere (Rhino); only booleans and strings in `global`.
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'uv_c3'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestUvC3Request'
  var QUEUE = 'ggTestWirelessQueue'
  var TURN_WAIT_MS = 120000
  var TEST_TIMEOUT = 3600

  var EARTH = 'minecraft:overworld'
  var B = { x0: 27648, x1: 27711, z0: 0, z1: 63, y0: 98, y1: 112 }
  var ROOF_Y = 112
  var Y = 100
  var UV = 8
  var ZPM = 7
  var TOWER_AT = { x: 27664, y: Y, z: 20 }
  var PSS_AT = { x: 27684, z: 30 }
  var SOURCES = [
    { name: 'the ZPM gate mix', eut: 2620464, plants: ['gtceu:large_naquadah_reactor'] },
    { name: 'two accelerator-driven reactors', eut: 3145728, plants: ['gtceu:accelerator_driven_reactor'] },
    { name: 'one laser fusion chamber', eut: 2621440, plants: ['gtceu:laser_fusion_chamber'] },
    { name: 'two muon fusion cells', eut: 1572864, plants: ['gtceu:muon_fusion_cell'] }
  ]
  var DYNAMO_AT = [{ x: 27654, y: Y, z: 5 }, { x: 27658, y: Y, z: 5 }, { x: 27662, y: Y, z: 5 }, { x: 27666, y: Y, z: 5 }]
  var NEED_IN = 9960496
  var NEED_BANK = 9462471
  var NEED_OUT = 8388608
  var WINDOW = 1200
  var SETTLE_WAIT = 60
  var CELLS = 2
  var CELL_CAP = 15728640000
  // the save mark (ZPM blocks only: v0.9.0 had them)
  var MARK_TOWER = { x: 27700, y: Y, z: 50 }
  var MARK_HATCH = { x: 27706, y: Y, z: 58 }
  var MARK_CHEST = { x: 27708, y: Y, z: 58 }
  var MARK_KEY = 'ggTestUvC3Mark'
  var MARK_ITEMS = [{ id: 'grindless:zpm_smes_cell', count: 3 }, { id: 'gtceu:zpm_wireless_energy_hatch_16a', count: 1 }, { id: 'gtceu:neutronium_ingot', count: 5 }]
  var MARK_CELL_CAP = 3932160000

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
  function cmd(text) { return S.server.runCommandSilent('execute in ' + EARTH + ' run ' + text) }
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
    var dyn = w.hatchId('dynamo', UV, 64)
    var hat = w.hatchId('hatch', UV, 16)
    ;[dyn, hat, 'gtceu:power_substation'].forEach(function (id) {
      if (L.GTRegistries.MACHINES.get(rl(id)) === null || L.GTRegistries.MACHINES.get(rl(id)) === undefined) missing.push(id)
    })
    var row = w.tierRow[UV]
    if (!row) missing.push('wireless tier row 8')
    else if (!L.BI.BLOCK.containsKey(rl(row.cell))) missing.push(row.cell)
    check('registry', missing.length === 0 && hat === 'gtceu:uv_wireless_energy_hatch_16a' && row && row.cell === 'grindless:uv_smes_cell' && num(row.capacity) === CELL_CAP,
      'dynamo ' + dyn + ', hatch ' + hat + ', cell ' + (row ? row.cell + ' ' + row.capacity + ' EU' : 'none') + (missing.length ? ' MISSING ' + missing.join(', ') : ''))
    note('sources', SOURCES.map(function (s) {
      var reg = s.plants.filter(function (id) {
        var d = L.GTRegistries.MACHINES.get(rl(id))
        return d !== null && d !== undefined
      })
      return s.name + ' ' + s.eut + ' EU/t (' + s.plants.join(', ') + (reg.length === s.plants.length ? ' registered' : ' NOT registered') + ')'
    }).join('; ') + ': none is placed, each figure is the doc\'s calibration, fed through one UV 64 A dynamo hatch')
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
    var w = W()
    w.paused = true
    S.pausedByUs = true
    saveNetwork()
    S.areaTouched = true
    note('AREA', prepareArea())
    var failed = []
    buildTower(failed, TOWER_AT, UV, CELLS)
    DYNAMO_AT.forEach(function (p) { put(p.x, p.y, p.z, north(w.hatchId('dynamo', UV, 64)), failed) })
    var hatchId = w.hatchId('hatch', UV, 16)
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
    check('PLACED', failed.length === 0 && bad.length === 0, 'tower (' + CELLS + ' x grindless:uv_smes_cell), 4 UV 64 A dynamo hatches, the ' + S.loadMode + ' load' +
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
    note('GATE_MODE', 'load ' + S.loadMode + (S.loadMode === 'real' ? ' (GTM power substation on the UV 16 A wireless hatch)' : ' (' + S.pssWhy + '): the hatch drained ' + NEED_OUT + ' EU/t by the fixture') +
      '; sources calibrated (' + SOURCES.map(function (s) { return s.eut }).join(' + ') + ' EU/t, the plants are not built); window ' + ticks + ' ticks = ' + (ticks / 20) + ' s' + (ticks < WINDOW ? ' (SHORTER than the 60 s asked)' : ''))
    check('GATE_IN', din >= NEED_IN, 'drained from the four dynamo hatches ' + Math.round(din) + ' EU/t over ' + ticks + ' ticks (need ' + NEED_IN + '); fed ' + Math.round((b.fed - a.fed) / ticks) + ' EU/t')
    check('GATE_BANK', bank >= NEED_BANK - 1 && bank >= 0.94 * din, 'into the bank ' + Math.round(bank) + ' EU/t (the doc\'s example ' + NEED_BANK + '; need ' + NEED_BANK + ', and at least ' + Math.ceil(NEED_OUT / 0.95) + ' to sustain the out figure); lost ' + Math.round((b.lost - a.lost) / ticks) + ' EU/t')
    var pssGain = b.pss >= 0 && a.pss >= 0 ? (b.pss - a.pss) / ticks : -1
    var cells = 0
    Object.keys(S.pss.batteries).forEach(function (k) { cells += S.pss.batteries[k] })
    var drainCap = 100000 * cells
    var implied = outRate - pssGain
    var ok = outRate >= NEED_OUT
    // the substation also bleeds passive drain (GTM: at most 100,000 EU/t per battery); the rest of the intake must show as stored energy
    if (S.loadMode === 'real') ok = ok && pssGain > 0 && implied <= drainCap * 1.001
    check('GATE_OUT', ok, 'out through the UV 16 A hatch ' + Math.round(outRate) + ' EU/t over ' + ticks + ' ticks (need ' + NEED_OUT + ')' + (pssGain >= 0 ? '; the substation\'s stored energy rose ' + Math.round(pssGain) + ' EU/t (' + Math.round(a.pss) + ' -> ' + Math.round(b.pss) + '), the rest ' + Math.round(implied) + ' EU/t is passive drain (cap ' + drainCap + ' for ' + cells + ' batteries)' : '; substation stored energy unreadable') +
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
      check('SUBSTATION', S.loadMode === 'calibrated' ? false : rp === 'formed' && ids.indexOf(w.hatchId('hatch', UV, 16)) >= 0,
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
      check('TOWER', st.up && st.towers === 1 && st.tier === UV && num(st.capacity) === CELLS * CELL_CAP,
        'the network: up ' + st.up + ', ' + st.towers + ' tower, ' + st.capacity + ' EU (want ' + (CELLS * CELL_CAP) + '), tier ' + st.tier + ' (want ' + UV + ')')
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

  // ---------------------------------------------------------------- stations, the save mark and its reopen (no wireless turn: they run
  // alone, after the gate; the mark's tower stays on the network until the reopen removes it)

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
    sideCheck(scope, 'stations', slots.length === 6 && bad === 0, slots.length + ' station slot(s) (want 6) [' + rows.join('; ') + ']')
  }

  function markCells() {
    var w = wireless()
    var cell = w.tierRow[ZPM].cell
    var used = 0
    var out = []
    cellsOf(w.towerId, MARK_TOWER).forEach(function (c) {
      if (c.sym.kind === 'oneOf') { if (used < CELLS) out.push(c); used++ }
    })
    return { cell: cell, at: out }
  }

  function mark(server) {
    var scope = 'uv_c3_save'
    sideState(server)
    try {
      var w = W()
      for (var cx = B.x0 >> 4; cx <= B.x1 >> 4; cx++) {
        for (var cz = B.z0 >> 4; cz <= B.z1 >> 4; cz++) S.earth.getChunk(cx, cz)
      }
      cmd('forceload add ' + B.x0 + ' ' + B.z0 + ' ' + B.x1 + ' ' + B.z1)
      var failed = []
      buildTower(failed, MARK_TOWER, ZPM, CELLS)
      put(MARK_HATCH.x, MARK_HATCH.y, MARK_HATCH.z, north(w.hatchId('hatch', ZPM, 16)), failed)
      put(MARK_CHEST.x, MARK_CHEST.y, MARK_CHEST.z, 'minecraft:chest[facing=north]', failed)
      MARK_ITEMS.forEach(function (it, i) {
        if (Number(cmd('item replace block ' + MARK_CHEST.x + ' ' + MARK_CHEST.y + ' ' + MARK_CHEST.z + ' container.' + i + ' with ' + it.id + ' ' + it.count)) < 1) failed.push('chest slot ' + i + ' ' + it.id)
      })
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
      sideCheck(scope, 'mark', failed.length === 0 && formed && tracked.join(';').indexOf('NOT TRACKED') < 0 && st.towers >= 1,
        'tower at ' + MARK_TOWER.x + ',' + MARK_TOWER.y + ',' + MARK_TOWER.z + ' (2 x ' + w.tierRow[ZPM].cell + ') ' + (formed ? 'formed' : 'NOT formed') + ', ZPM 16 A hatch, chest [' +
        MARK_ITEMS.map(function (it) { return it.count + ' ' + it.id }).join(', ') + '], key ' + MARK_KEY + '; tracked [' + tracked.join('; ') + ']; network up ' + st.up + ', ' + st.towers + ' tower(s), ' + st.capacity + ' EU, tier ' + st.tier +
        (failed.length ? ' FAILED ' + failed.slice(0, 6).join('; ') : ''))
      sideEmit(scope, 'save', 'NOTE', 'save-all flush: ' + server.runCommandSilent('save-all flush'))
    } catch (e) {
      sideCheck(scope, 'mark', false, 'exception: ' + e)
    }
    console.info(TAG + scope + '|DONE')
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
    var scope = 'uv_c3_reopen'
    try {
      var w = W()
      var pd = server.persistentData
      var key = pd.contains(MARK_KEY) ? String(pd.getString(MARK_KEY)) : null
      sideCheck(scope, 'key', key !== null, key === null ? 'persistent key ' + MARK_KEY + ' missing' : MARK_KEY + ' = ' + key)
      var mc = markCells()
      var want = [{ p: MARK_TOWER, id: w.towerId }, { p: MARK_HATCH, id: w.hatchId('hatch', ZPM, 16) }, { p: MARK_CHEST, id: 'minecraft:chest' }]
      mc.at.forEach(function (c) { want.push({ p: c, id: mc.cell }) })
      var wrong = []
      want.forEach(function (x) {
        var have = String(S.earth.getBlock(x.p.x, x.p.y, x.p.z).id)
        if (have !== x.id) wrong.push(x.p.x + ',' + x.p.y + ',' + x.p.z + ' want ' + x.id + ' is ' + have)
      })
      sideCheck(scope, 'blocks', wrong.length === 0, want.length + ' marked blocks (tower controller, ' + mc.at.length + ' ZPM cells, ZPM 16 A hatch, chest)' + (wrong.length ? ' WRONG ' + wrong.join('; ') : ' all in place'))
      var inv = S.earth.getBlock(MARK_CHEST.x, MARK_CHEST.y, MARK_CHEST.z).getInventory()
      var got = []
      var missing = []
      MARK_ITEMS.forEach(function (it, i) {
        var stack = inv === null || inv === undefined ? null : inv.getStackInSlot(i)
        var gid = stack === null || stack.isEmpty() ? 'none' : String(stack.id)
        var gn = stack === null || stack.isEmpty() ? 0 : Number(stack.count)
        got.push(gn + ' ' + gid)
        if (gid !== it.id || gn !== it.count) missing.push(it.count + ' ' + it.id)
      })
      sideCheck(scope, 'chest', missing.length === 0, 'chest slots [' + got.join(', ') + ']' + (missing.length ? ' MISSING ' + missing.join(', ') : ''))
      var formed = tower !== null && tower.isFormed()
      var e = trackAt(MARK_TOWER)
      var st = w.settle(server)
      sideCheck(scope, 'tower', formed && e !== null && e !== undefined && st.up && st.towers >= 1 && num(st.capacity) >= CELLS * MARK_CELL_CAP,
        'the tower ' + (formed ? 'formed again' : 'NOT formed') + ' after ' + waited + ' ticks, ' + (e ? 'on the network (' + e.k + ' t' + e.t + ')' : 'NOT on the network') +
        '; network up ' + st.up + ', ' + st.towers + ' tower(s), ' + st.capacity + ' EU (want at least ' + (CELLS * MARK_CELL_CAP) + '), tier ' + st.tier + ', stored ' + st.stored)
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
      sideEmit(scope, 'cleanup', 'NOTE', 'cleared ' + cleared + ' blocks, ' + items + ' item entities, force-load released, ' + MARK_KEY + ' removed')
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
      try { stationsCheck('uv_c3_stations') } catch (e) { sideCheck('uv_c3_stations', 'stations', false, 'exception: ' + e) }
      console.info(TAG + 'uv_c3_stations|DONE')
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

  ServerEvents.customCommand('gg_test_uv_c3', function (event) {
    if (busy()) {
      note('run', 'a previous run is still in progress')
      return 0
    }
    global[REQUEST] = true
    waitingSince = Date.now()
    joinQueue(SCOPE)
    return 1
  })

  ServerEvents.customCommand('gg_test_uv_c3_stations', function (event) {
    PENDING.stations = true
    return 1
  })

  ServerEvents.customCommand('gg_test_uv_c3_mark', function (event) {
    PENDING.mark = true
    return 1
  })

  ServerEvents.customCommand('gg_test_uv_c3_reopen', function (event) {
    if (busy()) { sideEmit('uv_c3_reopen', 'run', 'NOTE', 'another uv_c3 run is in progress'); return 0 }
    reopenStart(event.server)
    return 1
  })
})()
