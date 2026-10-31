// priority: -6474
// Gregtech Grindless - native fixture of package OPV-C3 (TEST-ONLY overlay, never shipped): the "Save compatibility" list of docs/eras/opv.md
// (UXV ids kept, HT conversions, the two new dimensions, gate c1-c10 untouched, existing hatches and wireless caps) and a save mark built on
// v0.15.0 (main 0fad989b) and read back on the candidate. Pattern of gg_test_uxv_c3.js; the gate hold itself is proven by gg_test_opv_gate.
//
//   gg_test_opv_c3         GGTEST|opv_c3|...         registry, gate rows c1-c13 in the recipe manager, the two new dimensions load, the x262,144 hatch
//   gg_test_opv_c3_mark    GGTEST|opv_c3_save|...    a save mark built only from blocks v0.15.0 already had: a wireless tower with two UXV cells, a UXV 16 A
//                          hatch, the UIV and UXV hulls and 16 A input hatches, a chest with three items, a persistent key; in each arrival
//                          platform dimension the running version has, a force-loaded chunk and a chest; then save-all flush
//   gg_test_opv_c3_reopen  GGTEST|opv_c3_reopen|...  after a restart on the candidate: the mark's blocks, machine ids, chest, tower formed and on the
//                          network with its capacity, the key, the platform chunks and chests; the new dimensions load; then the mark is removed
// TEST AREA: only X 38912-38975, Z 0-63, Y 98-112 of the Overworld (and the same X/Z in the platform dimensions, at the mark's chest only).
// var + function everywhere (Rhino); only strings in persistentData.
(function () {
  var TAG = 'GGTEST|'
  var EARTH = 'minecraft:overworld'
  var B = { x0: 38912, x1: 38975, z0: 0, z1: 63, y0: 98, y1: 112 }
  var ROOF_Y = 112
  var Y = 100
  var UXV = 12
  var CELLS = 2
  var MARK_TOWER = { x: 38950, y: Y, z: 50 }
  var MARK_HATCH = { x: 38960, y: Y, z: 58 }
  var MARK_CHEST = { x: 38962, y: Y, z: 58 }
  var MARK_GTM = [
    { p: { x: 38940, y: Y, z: 58 }, id: 'gtceu:uiv_machine_hull' },
    { p: { x: 38942, y: Y, z: 58 }, id: 'gtceu:uxv_machine_hull' },
    { p: { x: 38944, y: Y, z: 58 }, id: 'gtceu:uiv_energy_input_hatch_16a' },
    { p: { x: 38946, y: Y, z: 58 }, id: 'gtceu:uxv_energy_input_hatch_16a' }
  ]
  var MARK_KEY = 'ggTestOpvC3Mark'
  var MARK_PLAT_KEY = 'ggTestOpvC3MarkPlatforms'
  var MARK_ITEMS = [{ id: 'grindless:uxv_smes_cell', count: 3 }, { id: 'gtceu:uxv_wireless_energy_hatch_16a', count: 1 }, { id: 'gtceu:neutronium_ingot', count: 5 }]
  var MARK_CELL_CAP = 4026531840000
  var PLAT_MARK = { x: 38968, y: Y, z: 60 }
  // the platform dimensions v0.15.0 has (UIV's three, UXV's two)
  var PLATFORMS = [
    { place: 'rx_j1856', dim: 'grindless:rx_j1856_orbit', key: 'uivPlatform_' },
    { place: 'psr_j0437', dim: 'grindless:psr_j0437_orbit', key: 'uivPlatform_' },
    { place: 'cygnus_x1', dim: 'grindless:cygnus_x1_orbit', key: 'uivPlatform_' },
    { place: 'vela_pulsar', dim: 'grindless:vela_pulsar_orbit', key: 'uxvPlatform_' },
    { place: 'cas_a', dim: 'grindless:cas_a_remnant', key: 'uxvPlatform_' }
  ]
  var NEW_DIMS = ['grindless:sgr1806_orbit', 'grindless:terzan5_core']
  // gate rows of v0.15.0 (tables/gate.json at 0fad989b), which OpV must leave as they were, and the three it adds
  var GATE_OLD = ['open', 'sustain', 'hold_rx_j1856', 'hold_psr_j0437', 'hold_cygnus_x1', 'hold_cygnus_ring', 'hold_vela_pulsar', 'hold_cas_a', 'hold_galactic_bulge']
  var GATE_NEW = ['hold_sgr1806', 'hold_terzan5', 'hold_sgr_a']

  var S = null
  var J = null
  var R = null

  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3500) }
  function emit(scope, name, status, detail) {
    console.info(TAG + scope + '|' + name + '|' + status + (detail === undefined || detail === null || String(detail) === '' ? '' : '|' + clean(detail)))
  }
  function check(scope, name, ok, detail) { emit(scope, name, ok ? 'PASS' : 'FAIL', detail) }

  function lazy() {
    if (J !== null) return J
    J = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity'),
      AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
    }
    return J
  }
  function rl(id) { return new (lazy().RL)(id) }
  function bp(x, y, z) { return new (lazy().BlockPos)(x, y, z) }
  function cmdIn(dim, text) { return S.server.runCommandSilent('execute in ' + dim + ' run ' + text) }
  function cmd(text) { return cmdIn(EARTH, text) }
  function num(x) { return Number(String(x)) }
  function short(id) { return String(id).replace(/^(gtceu|grindless|minecraft):/, '') }
  function north(id) { return id + '[facing=north]' }
  function machineAt(p) {
    var m = lazy().MetaMachine.getMachine(S.earth, bp(p.x, p.y, p.z))
    return m === null || m === undefined ? null : m
  }
  function state(server) { S = { server: server, earth: server.overworld() } }
  function levelOf(dim) {
    try {
      var level = S.server.getLevel(dim)
      return level === null || level === undefined ? null : level
    } catch (e) { return null }
  }
  function W() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.hatchId !== 'function' || typeof w.settle !== 'function') throw new Error('global.grindless.wireless is missing or incomplete')
    return w
  }
  function structure(id) {
    var s = global.grindless && global.grindless.structures && global.grindless.structures[id]
    if (!s) throw new Error('no plain-data structure for ' + id)
    return s
  }
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
  function loadBand() {
    for (var cx = B.x0 >> 4; cx <= B.x1 >> 4; cx++) {
      for (var cz = B.z0 >> 4; cz <= B.z1 >> 4; cz++) S.earth.getChunk(cx, cz)
    }
  }
  function trackAt(p) {
    var w = W()
    var e = w.track(S.earth, bp(p.x, p.y, p.z))
    if (e) delete w.faults[w.flowKey(e)]
    return e
  }
  function buildTower(failed, at, tier, cells) {
    var w = W()
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
  function markCells() {
    var w = W()
    var used = 0
    var out = []
    cellsOf(w.towerId, MARK_TOWER).forEach(function (c) {
      if (c.sym.kind === 'oneOf') { if (used < CELLS) out.push(c); used++ }
    })
    return { cell: w.tierRow[UXV].cell, at: out }
  }

  // ---------------------------------------------------------------- the static part of "Save compatibility"

  function statics(server) {
    var scope = 'opv_c3'
    state(server)
    var L = lazy()
    try {
      var w = W()
      var ids = ['gtceu:opv_wireless_energy_hatch_16a', 'gtceu:opv_wireless_energy_hatch_64a', 'gtceu:opv_parallel_hatch', 'gtceu:opv_energy_input_hatch_16a', 'gtceu:opv_machine_hull',
        'gtceu:uxv_wireless_energy_hatch_16a', 'gtceu:uxv_energy_input_hatch_16a', 'gtceu:uiv_energy_input_hatch_16a', 'gtceu:uxv_machine_hull', 'gtceu:uiv_machine_hull']
      var missing = []
      ids.forEach(function (id) {
        var d = L.GTRegistries.MACHINES.get(rl(id))
        if (d === null || d === undefined) missing.push(id)
      })
      ;['grindless:opv_smes_cell', 'grindless:uxv_smes_cell', 'grindless:uiv_smes_cell'].forEach(function (id) {
        if (!L.BI.BLOCK.containsKey(rl(id))) missing.push(id)
      })
      check(scope, 'registry', missing.length === 0, ids.length + ' machines and three SMES cells, the OpV ones and every v0.15.0 one still registered' + (missing.length ? ' MISSING ' + missing.join(', ') : ''))
      var caps = []
      var capBad = 0
      ;[{ t: 11, cell: 'grindless:uiv_smes_cell' }, { t: 12, cell: 'grindless:uxv_smes_cell' }].forEach(function (x) {
        var row = w.tierRow[x.t]
        var ok = row && row.cell === x.cell
        if (!ok) capBad++
        caps.push('tier ' + x.t + ' ' + (row ? row.cell + ' ' + row.capacity : 'NO ROW'))
      })
      var o = w.tierRow[13]
      if (!o || o.cell !== 'grindless:opv_smes_cell') capBad++
      caps.push('tier 13 ' + (o ? o.cell + ' ' + o.capacity : 'NO ROW'))
      check(scope, 'wireless_rows', capBad === 0 && num(w.tierRow[12].capacity) === MARK_CELL_CAP, 'existing tier rows keep their cells and caps, case 13 is the new row [' + caps.join('; ') + ']')
      var rm = server.getRecipeManager()
      var absent = []
      GATE_OLD.concat(GATE_NEW).forEach(function (n) {
        if (!rm.byKey(rl('grindless:warp_gate/' + n)).isPresent()) absent.push(n)
      })
      check(scope, 'gate_rows', absent.length === 0, GATE_OLD.length + ' v0.15.0 gate rows (c1-c10) and ' + GATE_NEW.length + ' new ones (c11-c13) are recipes' + (absent.length ? ' ABSENT ' + absent.join(', ') : ''))
      var dimRows = []
      var dimBad = 0
      NEW_DIMS.concat(PLATFORMS.map(function (p) { return p.dim })).forEach(function (dim) {
        var level = levelOf(dim)
        if (level === null) { dimBad++; dimRows.push(short(dim) + ' NO LEVEL'); return }
        level.getChunk(4, 4)
        dimRows.push(short(dim) + ' loaded')
      })
      check(scope, 'dimensions', dimBad === 0, NEW_DIMS.length + ' new and ' + PLATFORMS.length + ' older dimensions load [' + dimRows.join('; ') + ']')
    } catch (e) {
      check(scope, 'statics', false, 'exception: ' + e)
    }
    console.info(TAG + scope + '|DONE')
  }

  // ---------------------------------------------------------------- the save mark and its reopen

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
    var scope = 'opv_c3_save'
    state(server)
    try {
      var w = W()
      loadBand()
      cmd('forceload add ' + B.x0 + ' ' + B.z0 + ' ' + B.x1 + ' ' + B.z1)
      fillBand(B.y0, B.y1, 'minecraft:air')
      fillBand(ROOF_Y, ROOF_Y, 'minecraft:smooth_stone')
      var failed = []
      buildTower(failed, MARK_TOWER, UXV, CELLS)
      put(MARK_HATCH.x, MARK_HATCH.y, MARK_HATCH.z, north(w.hatchId('hatch', UXV, 16)), failed)
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
      check(scope, 'mark', failed.length === 0 && formed && tracked.join(';').indexOf('NOT TRACKED') < 0 && st.towers >= 1 && gtm.join(';').indexOf('NO MACHINE') < 0 && marked.length >= 3,
        'tower (2 x ' + w.tierRow[UXV].cell + ') ' + (formed ? 'formed' : 'NOT formed') + ', UXV 16 A hatch, hulls and hatches [' + gtm.join('; ') + '], chest, key ' + MARK_KEY +
        ', a chunk and a chest in ' + marked.length + ' of ' + PLATFORMS.length + ' platform dimensions [' + marked.join(', ') + ']; tracked [' + tracked.join('; ') + ']; network up ' + st.up + ', ' + st.towers + ' tower(s), ' + st.capacity + ' EU, tier ' + st.tier +
        (failed.length ? ' FAILED ' + failed.slice(0, 6).join('; ') : ''))
      emit(scope, 'save', 'NOTE', 'save-all flush: ' + server.runCommandSilent('save-all flush'))
    } catch (e) {
      check(scope, 'mark', false, 'exception: ' + e)
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
    var list = pd.contains(MARK_PLAT_KEY) ? String(pd.getString(MARK_PLAT_KEY)) : ''
    var marked = list === '' ? [] : list.split(',')
    PLATFORMS.forEach(function (p) {
      try {
        var level = levelOf(p.dim)
        if (level === null) { bad++; rows.push(p.place + ': NO LEVEL ' + p.dim); return }
        level.getChunk(PLAT_MARK.x >> 4, PLAT_MARK.z >> 4)
        if (marked.indexOf(p.place) < 0) { rows.push(p.place + ': loaded; not marked'); return }
        var forced = Number(level.getForcedChunks().size())
        var id = String(level.getBlock(PLAT_MARK.x, PLAT_MARK.y, PLAT_MARK.z).id)
        var r = id === 'minecraft:chest' ? chestRead(level, PLAT_MARK) : { got: [], missing: ['chest'] }
        if (id !== 'minecraft:chest' || r.missing.length > 0 || forced < 1) bad++
        rows.push(p.place + ': forced chunks ' + forced + ', block ' + id + ', chest [' + r.got.join(', ') + ']' + (r.missing.length ? ' MISSING ' + r.missing.join(', ') : ''))
        cmdIn(p.dim, 'setblock ' + PLAT_MARK.x + ' ' + PLAT_MARK.y + ' ' + PLAT_MARK.z + ' minecraft:air replace')
        cmdIn(p.dim, 'forceload remove ' + PLAT_MARK.x + ' ' + PLAT_MARK.z)
      } catch (e) {
        bad++
        rows.push(p.place + ': ' + e)
      }
    })
    check(scope, 'platforms', bad === 0 && marked.length >= 3, marked.length + ' marked platform dimension(s) [' + marked.join(', ') + '] read back [' + rows.join('; ') + ']')
    pd.remove(MARK_PLAT_KEY)
  }

  function reopenStart(server) {
    state(server)
    R = { t0: server.getTickCount(), done: false }
    loadBand()
  }
  function reopenTick(server) {
    if (R === null || R.done) return
    var waited = server.getTickCount() - R.t0
    var tower = machineAt(MARK_TOWER)
    if (!(tower !== null && tower.isFormed()) && waited < 200) return
    R.done = true
    var scope = 'opv_c3_reopen'
    try {
      var w = W()
      var pd = server.persistentData
      var key = pd.contains(MARK_KEY) ? String(pd.getString(MARK_KEY)) : null
      check(scope, 'key', key !== null, key === null ? 'persistent key ' + MARK_KEY + ' missing' : MARK_KEY + ' = ' + key)
      var mc = markCells()
      var want = [{ p: MARK_TOWER, id: w.towerId }, { p: MARK_HATCH, id: w.hatchId('hatch', UXV, 16) }, { p: MARK_CHEST, id: 'minecraft:chest' }]
      mc.at.forEach(function (c) { want.push({ p: c, id: mc.cell }) })
      var wrong = []
      want.forEach(function (x) {
        var have = String(S.earth.getBlock(x.p.x, x.p.y, x.p.z).id)
        if (have !== x.id) wrong.push(x.p.x + ',' + x.p.y + ',' + x.p.z + ' want ' + x.id + ' is ' + have)
      })
      check(scope, 'blocks', wrong.length === 0, want.length + ' marked blocks (tower controller, ' + mc.at.length + ' UXV cells, UXV 16 A hatch, chest)' + (wrong.length ? ' WRONG ' + wrong.join('; ') : ' all in place'))
      var gtmRows = []
      var gtmBad = 0
      MARK_GTM.forEach(function (g) {
        var have = String(S.earth.getBlock(g.p.x, g.p.y, g.p.z).id)
        var m = machineAt(g.p)
        var def = m === null ? 'none' : String(m.getDefinition().getId())
        if (have !== g.id || def !== g.id) gtmBad++
        gtmRows.push(g.id + ': block ' + have + ', machine ' + def)
      })
      check(scope, 'gtm_ids', gtmBad === 0, MARK_GTM.length + ' hulls and 16 A hatches keep their ids and load as GTM machines [' + gtmRows.join('; ') + ']')
      var cr = chestRead(S.earth, MARK_CHEST)
      check(scope, 'chest', cr.missing.length === 0, 'chest slots [' + cr.got.join(', ') + ']' + (cr.missing.length ? ' MISSING ' + cr.missing.join(', ') : ''))
      var formed = tower !== null && tower.isFormed()
      var e = trackAt(MARK_TOWER)
      var st = w.settle(server)
      check(scope, 'tower', formed && e !== null && e !== undefined && st.up && st.towers >= 1 && num(st.capacity) >= CELLS * MARK_CELL_CAP,
        'the tower ' + (formed ? 'formed again' : 'NOT formed') + ' after ' + waited + ' ticks, ' + (e ? 'on the network (' + e.k + ' t' + e.t + ')' : 'NOT on the network') +
        '; network up ' + st.up + ', ' + st.towers + ' tower(s), ' + st.capacity + ' EU (want at least ' + (CELLS * MARK_CELL_CAP) + '), tier ' + st.tier)
      platformReopen(scope)
      var newRows = []
      var newBad = 0
      NEW_DIMS.forEach(function (dim) {
        var level = levelOf(dim)
        if (level === null) { newBad++; newRows.push(short(dim) + ' NO LEVEL'); return }
        level.getChunk(4, 4)
        newRows.push(short(dim) + ' loaded (new since the saving version)')
      })
      check(scope, 'new_dimensions', newBad === 0, newRows.join('; '))
      var items = dropItems()
      var cleared = fillBand(B.y0, B.y1, 'minecraft:air')
      cmd('forceload remove ' + B.x0 + ' ' + B.z0 + ' ' + B.x1 + ' ' + B.z1)
      pd.remove(MARK_KEY)
      w.dropCache()
      Object.keys(w.faults).forEach(function (k) {
        var f = k.split('|')
        if (inBand(Number(f[1]), Number(f[2]), Number(f[3]))) delete w.faults[k]
      })
      emit(scope, 'cleanup', 'NOTE', 'cleared ' + cleared + ' blocks, ' + items + ' item entities, force-load released, ' + MARK_KEY + ' removed, platform stand-ins removed')
    } catch (ex) {
      check(scope, 'reopen', false, 'exception: ' + ex)
    }
    console.info(TAG + scope + '|DONE')
  }

  ServerEvents.tick(function (event) { reopenTick(event.server) })

  ServerEvents.customCommand('gg_test_opv_c3', function (event) {
    statics(event.server)
    return 1
  })
  ServerEvents.customCommand('gg_test_opv_c3_mark', function (event) {
    mark(event.server)
    return 1
  })
  ServerEvents.customCommand('gg_test_opv_c3_reopen', function (event) {
    if (R !== null && !R.done) { emit('opv_c3_reopen', 'run', 'NOTE', 'a reopen is in progress'); return 0 }
    reopenStart(event.server)
    return 1
  })
})()
