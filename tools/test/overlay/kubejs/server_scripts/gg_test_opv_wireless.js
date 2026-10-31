// priority: -6934
// Gregtech Grindless - smoke test of OpV's wireless tier (package OpV-W; TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): the OpV row of tables/wireless_energy.json (registered by lv/wireless_energy.js, withTiers case 13) and
// opv/wireless.js, which makes the OpV cell and the chain strand repeater in the assembler.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -Commands 'kubejs custom_command gg_test_opv_wireless' `
//     -WaitForLog 'GGTEST\|opv_wireless\|DONE@@180'
//
// It takes its turn on the wireless network with the other wireless fixtures (the queue `ggTestWirelessQueue` in `global`: the network is
// one per server), pauses the timed settlements while it runs and settles by hand, and puts the network's persistent data back at the end.
// The cell's recipe waits on A packages, so the network's energy is set directly (W.setStored).
//
// The doubt it settles (docs/eras/opv.md, W): a 64 A OpV wireless hatch draws 2^35 EU/t (64 A x V[OpV] = 34,359,738,368) for one tick
// from a case 13 network, with every buffer a long, and the cell stores and reports 16,106,127,360,000 EU (tier 13).
// What it proves:
//   opv_wireless|registration  grindless:opv_smes_cell (a block), the eight OpV hatches and the two OpV covers exist; W.cells: tier 13,
//                              16,106,127,360,000 EU, made by gtceu:opv_assembler (a GTM machine); no table assembler recipe for it
//   opv_wireless|recipes       opv/wireless.js's repeater and cell live in the assembler at VA[OpV] with their items; the OpV hatches' and
//                              covers' assembler recipes live at VA[OpV] (the 2 A hatches and the covers with the chain strand repeater
//                              and one OpV sensor / emitter)
//   opv_wireless|PLACED        tower A (two OpV cells), tower B (one UXV SMES cell), an OpV 2 A, an OpV 16 A, an OpV 64 A and a UXV 2 A wireless energy hatch
//   opv_wireless|MIXED         both towers formed: the network is UXV (the weakest cell of every formed tower), its capacity exactly
//                              2 x OpV + 1 x UXV cell; the OpV hatches get nothing (above the network's tier), the UXV one is filled
//   opv_wireless|JUMP          tower B's UXV cell replaced by an OpV cell: the network is OpV, its capacity exactly 3 x 16,106,127,360,000 EU,
//                              tower B alone reports one cell of 16,106,127,360,000 EU
//   opv_wireless|STORED        the network is set to the full 3 cells and reports the same figure back (a long all the way)
//   opv_wireless|CAP           on that settlement each OpV hatch gets exactly V[OpV] x amps x the settlement's ticks (W.rate; 64 A:
//                              343,597,383,680), and on the next no more than that again, never past its buffer
//   opv_wireless|DRAW          the 64 A OpV hatch, full, gives up 2^35 EU in one tick (its input voltage x amps), and the next settlement
//                              refills exactly 2^35 from the network, which drops by exactly 2^35; its buffer is a long past 2^35
//   opv_wireless|DONE          last line
//
// TEST AREA: ONLY the band X 37696-37759, Y 98-112, Z 0-63 (force-loaded and cleared); the towers face north with their controllers at
// (37704, 100, 40) and (37720, 100, 40), the hatches at X 37736-37742, Z 20. var + function everywhere (this Rhino throws "redeclaration
// of var" for const/let inside functions that run twice).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'opv_wireless'
  var STEP = 10
  var FORM_TIMEOUT = 600
  var SWAP_WAIT = 40
  var TURN_TIMEOUT_MS = 120000
  var BAND = { x0: 37696, x1: 37759, y0: 98, y1: 112, z0: 0, z1: 63 }
  var TOWER_A = { x: 37704, y: 100, z: 40 }
  var TOWER_B = { x: 37720, y: 100, z: 40 }
  var HATCHES = [
    { key: 'opv2', id: 'gtceu:opv_wireless_energy_hatch', tier: 13, amps: 2, x: 37736, y: 100, z: 20 },
    { key: 'opv64', id: 'gtceu:opv_wireless_energy_hatch_64a', tier: 13, amps: 64, x: 37738, y: 100, z: 20 },
    { key: 'uxv2', id: 'gtceu:uxv_wireless_energy_hatch', tier: 12, amps: 2, x: 37740, y: 100, z: 20 },
    { key: 'opv16', id: 'gtceu:opv_wireless_energy_hatch_16a', tier: 13, amps: 16, x: 37742, y: 100, z: 20 }
  ]
  var STORE = 20000000000

  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestOpvWirelessRequest'
  var QUEUE = 'ggTestWirelessQueue'

  var OPV = 13
  var UXV = 12
  var CELL_ID = 'grindless:opv_smes_cell'
  var UXV_CELL = 'grindless:uxv_smes_cell'
  var CELL_EU = 16106127360000
  var MADE_BY = 'gtceu:opv_assembler'
  var LINK = 'grindless:chain_strand_repeater'
  var DRAW = 34359738368
  var OWN = [
    { id: 'grindless:assembler/chain_strand_repeater', out: LINK, items: 'gtceu:chain_strand_single_wire,grindless:pasta_strand_repeater,grindless:tetron_die' },
    { id: 'grindless:assembler/opv_smes_cell', out: CELL_ID, items: 'gtceu:chain_strand_single_wire,gtceu:opv_field_generator,grindless:chain_lamina_stack' }
  ]
  var OPV_IDS = ['gtceu:opv_wireless_energy_hatch', 'gtceu:opv_wireless_energy_hatch_4a', 'gtceu:opv_wireless_energy_hatch_16a', 'gtceu:opv_wireless_energy_hatch_64a',
    'gtceu:opv_wireless_dynamo_hatch', 'gtceu:opv_wireless_dynamo_hatch_4a', 'gtceu:opv_wireless_dynamo_hatch_16a', 'gtceu:opv_wireless_dynamo_hatch_64a',
    'grindless:opv_wireless_energy_cover', 'grindless:opv_wireless_dynamo_cover']

  var S = null
  var classes = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
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

  // ---------------------------------------------------------------- the turn queue (shared with the other wireless fixtures)

  function queueList() {
    var s = global[QUEUE]
    s = s === undefined || s === null ? '' : String(s)
    return s === '' ? [] : s.split(',')
  }
  function joinQueue() {
    var q = queueList()
    if (q.indexOf(SCOPE) < 0) q.push(SCOPE)
    global[QUEUE] = q.join(',')
  }
  function leaveQueue() {
    global[QUEUE] = queueList().filter(function (n) { return n !== SCOPE }).join(',')
  }
  function myTurn() {
    return queueList()[0] === SCOPE
  }

  // ---------------------------------------------------------------- Java and the pack's objects

  function lazy() {
    if (classes === null) {
      classes = {
        AL: Java.loadClass('java.util.ArrayList'),
        MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
      }
    }
    return classes
  }

  function W() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.settle !== 'function') throw new Error('global.grindless.wireless is missing or incomplete (lv/wireless_energy.js)')
    return w
  }

  function V(tier) {
    return Number(GTValues.V[tier])
  }

  function asArray(coll) {
    var list = new (lazy().AL)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function rl(id) {
    return new ResourceLocation(id)
  }

  function machineAt(p) {
    var m = lazy().MetaMachine.getMachine(S.level, new BlockPos(p.x, p.y, p.z))
    return m === null || m === undefined ? null : m
  }

  function blockIdAt(x, y, z) {
    return String(S.level.getBlock(x, y, z).getId())
  }

  function storedIn(p) {
    var m = machineAt(p)
    return m === null ? -1 : Number(m.energyContainer.getEnergyStored())
  }

  function bufferOf(p) {
    var m = machineAt(p)
    return m === null ? -1 : Number(m.energyContainer.getEnergyCapacity())
  }

  function fluidName(stack) {
    try {
      return String(lazy().Registries.FLUIDS.getKey(stack.getFluid()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  function liveIO(r) {
    var H = lazy().Helper
    function items(list) {
      return asArray(list).map(function (st) { return { id: String(st.getId()), n: Number(st.getCount()) } })
    }
    return {
      itemsIn: items(H.getInputItems(r)).filter(function (x) { return x.id !== 'gtceu:programmed_circuit' }),
      fluidsIn: asArray(H.getInputFluids(r)).map(function (st) { return { id: fluidName(st), n: Number(st.getAmount()) } }),
      itemsOut: items(H.getOutputItems(r))
    }
  }

  function eutOf(r) {
    return Number(lazy().Helper.getRealEUt(r).getTotalEU())
  }

  function ids(list) {
    return list.map(function (x) { return x.id }).sort().join(',')
  }

  // ---------------------------------------------------------------- static checks

  function counted(list) {
    return list.map(function (x) { return x.id + ' x' + x.n }).sort().join(',')
  }

  function staticChecks() {
    var w = W()
    var problems = []
    ;[CELL_ID, MADE_BY].concat(OPV_IDS).forEach(function (id) {
      if (!Item.exists(id)) problems.push('item ' + id + ' missing')
    })
    var cell = w.cells[CELL_ID]
    if (!cell || Number(cell.tier) !== OPV || Number(cell.capacity) !== CELL_EU || String(cell.madeBy) !== MADE_BY) problems.push('W.cells[' + CELL_ID + '] is ' + JSON.stringify(cell || null))
    if (!w.tiers.some(function (t) { return Number(t) === OPV })) problems.push('no tier 13 in ' + w.tiers.join(','))
    if (w.recipes.some(function (r) { return String(r.output) === CELL_ID })) problems.push('the OpV cell has a table assembler recipe')
    check('registration', problems.length === 0, problems.join(' ; ') || 'the OpV cell, eight hatches and two covers exist; W.cells: tier 13, ' + CELL_EU + ' EU, made by ' + MADE_BY + '; V[OpV] ' + V(OPV))

    var bad = []
    var notes = []
    var va = Number(GTValues.VA[OPV])
    var want = {}
    want[LINK] = { items: ['gtceu:chain_strand_single_wire x2', 'grindless:pasta_strand_repeater x1', 'grindless:tetron_die x1'].sort().join(','),
      fluids: ['gtceu:soldering_alloy x144', 'gtceu:lubricant x100'].sort().join(',') }
    want[CELL_ID] = { items: ['gtceu:chain_strand_single_wire x16', 'grindless:chain_lamina_stack x4', 'gtceu:opv_field_generator x2'].sort().join(','), fluids: '' }
    OWN.forEach(function (o) {
      var live = liveRecipe(o.id)
      if (live === null) { bad.push(o.id + ' not in the recipe manager'); return }
      var io = liveIO(live)
      var type = live.recipeType ? String(live.recipeType.registryName) : String(live.getType())
      if (type !== 'gtceu:assembler') bad.push(o.id + ' is a ' + type + ' recipe')
      if (eutOf(live) !== va) bad.push(o.id + ' at ' + eutOf(live) + ' EU/t')
      if (ids(io.itemsOut) !== o.out) bad.push(o.id + ' gives ' + ids(io.itemsOut))
      if (counted(io.itemsIn) !== want[o.out].items) bad.push(o.id + ' takes ' + counted(io.itemsIn))
      if (counted(io.fluidsIn) !== want[o.out].fluids) bad.push(o.id + ' takes fluids ' + counted(io.fluidsIn))
      notes.push(o.id + ' ' + live.duration + ' t x ' + eutOf(live) + ' EU/t: ' + counted(io.itemsIn) + ' -> ' + ids(io.itemsOut))
    })
    var opv = w.recipes.filter(function (r) { return /^(gtceu|grindless):opv_wireless_/.test(String(r.output)) })
    if (opv.length !== OPV_IDS.length) bad.push(opv.length + ' OpV assembler recipes in W.recipes, want ' + OPV_IDS.length)
    var linked = 0
    opv.forEach(function (r) {
      var lr = liveRecipe(String(r.id))
      if (lr === null) { bad.push(r.id + ' not in the recipe manager'); return }
      if (eutOf(lr) !== va) bad.push(r.id + ' at ' + eutOf(lr) + ' EU/t')
      var io = liveIO(lr)
      if (ids(io.itemsOut) !== String(r.output)) bad.push(r.id + ' gives ' + ids(io.itemsOut))
      var wantsLink = !/_\d+a$/.test(String(r.output))
      var hasLink = io.itemsIn.some(function (x) { return x.id === LINK })
      if (wantsLink !== hasLink) bad.push(r.id + (hasLink ? ' takes' : ' lacks') + ' the chain strand repeater')
      if (hasLink) {
        linked++
        var signal = 0
        io.itemsIn.forEach(function (x) { if (x.id === 'gtceu:opv_sensor' || x.id === 'gtceu:opv_emitter') signal += x.n })
        if (signal !== 1) bad.push(r.id + ' takes ' + signal + ' OpV sensors / emitters, want 1')
      }
    })
    notes.push(opv.length + ' OpV hatch and cover recipes at ' + va + ' EU/t, ' + linked + ' with ' + LINK + ' and one OpV sensor / emitter')
    check('recipes', bad.length === 0, notes.join(' ; ') + (bad.length > 0 ? ' | problems: ' + bad.join(' ; ') : ''))
  }

  // ---------------------------------------------------------------- the network's persistent data (put back as it was at the end)

  function saveNetwork() {
    var w = W()
    var pd = S.server.persistentData
    S.savedKeys = {}
    ;[w.blocksKey, w.storeKey, w.legacyKey].forEach(function (k) {
      if (k === undefined || k === null) return
      var t = pd.get(k)
      S.savedKeys[k] = t === null || t === undefined ? null : t.copy()
      pd.remove(k)
    })
    w.dropCache()
    S.wasPaused = w.paused === true
    w.paused = true
  }

  function restoreNetwork() {
    var w = W()
    var pd = S.server.persistentData
    var back = []
    Object.keys(S.savedKeys || {}).forEach(function (k) {
      pd.remove(k)
      var t = S.savedKeys[k]
      if (t !== null) {
        pd.put(k, t)
        back.push(k)
      }
    })
    w.dropCache()
    w.paused = S.wasPaused === true
    return 'the network\'s keys put back as they were before the test: ' + (back.length > 0 ? back.join(', ') : 'none existed, all removed')
  }

  // ---------------------------------------------------------------- the world

  // vanilla's fill takes at most 32,768 blocks: the band goes in strips of 16 along Z
  function fillBand() {
    var n = 0
    for (var z = BAND.z0; z <= BAND.z1; z += 16) {
      n += Number(S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + z + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + Math.min(z + 15, BAND.z1) + ' air'))
    }
    return n
  }

  function inBand(x, y, z) {
    return x >= BAND.x0 && x <= BAND.x1 && y >= BAND.y0 && y <= BAND.y1 && z >= BAND.z0 && z <= BAND.z1
  }

  function put(x, y, z, block, failed) {
    if (!inBand(x, y, z)) throw new Error('refusing to write outside the band: ' + x + ',' + y + ',' + z)
    S.server.runCommandSilent('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
    var id = block.replace(/\[.*$/, '')
    if (blockIdAt(x, y, z) !== id) failed.push(x + ',' + y + ',' + z + ' ' + id)
  }

  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = fillBand()
    note('AREA', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 + ' force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  // a tower whose controller stands at p facing north, its first `cells.length` cell slots holding those cells, the rest casing; returns
  // the positions of the slots that hold a cell
  function towerPlace(p, cells, failed) {
    var w = W()
    var desc = global.grindless.patterns.describe(w.towerId)
    if (!desc) throw new Error('no structure description for ' + w.towerId)
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    var used = 0
    var at = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') continue
          var id = null
          if (sym.kind === 'frames') id = 'gtceu:' + sym.materials[0] + '_frame'
          else if (sym.kind === 'blocks') id = sym.blocks[0]
          else if (sym.kind === 'oneOf') id = used < cells.length ? cells[used] : w.casing
          if (id === null) continue
          var x = p.x - (ci - ctrl.ci)
          var y = p.y + (ri - ctrl.ri)
          var z = p.z - (si - ctrl.si)
          put(x, y, z, id, failed)
          if (sym.kind === 'oneOf') {
            if (used < cells.length) at.push({ x: x, y: y, z: z })
            used++
          }
        }
      })
    })
    put(p.x, p.y, p.z, w.towerId + '[facing=north]', failed)
    // /setblock fires no BlockEvents.placed: the tower is tracked by hand
    w.track(S.level, new BlockPos(p.x, p.y, p.z))
    return at
  }

  function placeAll() {
    var w = W()
    var failed = []
    S.cellsA = towerPlace(TOWER_A, [CELL_ID, CELL_ID], failed)
    S.cellsB = towerPlace(TOWER_B, [UXV_CELL], failed)
    HATCHES.forEach(function (h) {
      put(h.x, h.y, h.z, h.id + '[facing=north]', failed)
      w.track(S.level, new BlockPos(h.x, h.y, h.z))
    })
    check('PLACED', failed.length === 0 && S.cellsA.length === 2 && S.cellsB.length === 1,
      'tower A with ' + S.cellsA.length + ' OpV cells, tower B with ' + S.cellsB.length + ' UXV cell, hatches ' + HATCHES.map(function (h) { return h.id }).join(', ') +
      (failed.length ? ' FAILED ' + failed.slice(0, 5).join('; ') : ''))
    return failed.length === 0
  }

  function formed(p) {
    var m = machineAt(p)
    return m !== null && m.isFormed()
  }

  function cleanup() {
    try {
      fillBand()
      S.server.runCommandSilent('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      note('CLEANUP', 'band cleared, force-load released; ' + restoreNetwork())
    } catch (e) {
      note('CLEANUP', 'could not clean up: ' + e)
    }
  }

  // ---------------------------------------------------------------- the checks in the world

  function snapshot() {
    var out = {}
    HATCHES.forEach(function (h) { out[h.key] = storedIn(h) })
    return out
  }

  function hatch(key) {
    return HATCHES.filter(function (x) { return x.key === key })[0]
  }

  function mixed() {
    var w = W()
    w.setStored(S.server, STORE)
    var before = snapshot()
    var st = w.settle(S.server)
    var after = snapshot()
    var want = 2 * CELL_EU + w.cells[UXV_CELL].capacity
    var uxvGot = after.uxv2 - before.uxv2
    var uxvCap = w.rate(UXV, 2) * w.settleTicks
    check('MIXED', !!st.up && Number(st.towers) === 2 && Number(st.tier) === UXV && Number(st.capacity) === want &&
          after.opv2 === 0 && after.opv16 === 0 && after.opv64 === 0 && Number(st.skippedAbove) === 3 && uxvGot === uxvCap,
      'the network: up ' + st.up + ', ' + st.towers + ' towers, capacity ' + st.capacity + ' EU (want ' + want + '), tier ' + st.tier + ' (want ' + UXV +
      '); ' + st.skippedAbove + ' hatches above it skipped (want 3), the OpV hatches hold ' + after.opv2 + ', ' + after.opv16 + ' and ' + after.opv64 + ' EU (want 0); the UXV hatch got ' + uxvGot +
      ' EU (want ' + uxvCap + ')')
  }

  function swapB() {
    var failed = []
    var c = S.cellsB[0]
    put(c.x, c.y, c.z, CELL_ID, failed)
    note('SWAP', 'tower B\'s UXV cell replaced by an OpV cell' + (failed.length ? ' FAILED ' + failed.join('; ') : ''))
  }

  function jumpAndCap() {
    var w = W()
    var info = [w.towerInfo(machineAt(TOWER_A)), w.towerInfo(machineAt(TOWER_B))]
    var want = 3 * CELL_EU
    // a long all the way: set the whole three cells, read it back from the status before any settlement moves it
    w.setStored(S.server, want)
    var full = w.status(S.server)
    // the capacity in status() is the last settlement's: JUMP checks it after the next one
    check('STORED', Number(full.stored) === want && want > Math.pow(2, 43),
      'set ' + want + ' EU (3 x ' + CELL_EU + ', above 2^43), the network reports stored ' + full.stored)
    var before = snapshot()
    var st = w.settle(S.server)
    var after = snapshot()
    var b = info[1]
    check('JUMP', !!st.up && Number(st.towers) === 2 && Number(st.tier) === OPV && Number(st.capacity) === want && Number(st.skippedAbove) === 0 &&
          b.formed && Number(b.cells) === 1 && Number(b.capacity) === CELL_EU && Number(b.tier) === OPV,
      'towers ' + JSON.stringify(info) + ' (tower B: one cell of ' + CELL_EU + ' EU); the network: up ' + st.up + ', ' + st.towers + ' towers, capacity ' + st.capacity +
      ' EU (want 3 x ' + CELL_EU + ' = ' + want + '), tier ' + st.tier + ' (want ' + OPV + '), ' + st.skippedAbove + ' hatches skipped')

    var lines = []
    var ok = true
    var first = {}
    ;['opv2', 'opv16', 'opv64'].forEach(function (k) {
      var h = hatch(k)
      var cap = w.rate(OPV, h.amps) * w.settleTicks
      var got = after[k] - before[k]
      first[k] = { cap: cap, buffer: bufferOf(h) }
      if (got !== cap) ok = false
      lines.push(h.id + ' got ' + got + ' EU on the jump (want V[OpV] ' + V(OPV) + ' x ' + h.amps + ' A x ' + w.settleTicks + ' ticks = ' + cap + ')')
    })
    var st2 = w.settle(S.server)
    var again = snapshot()
    ;['opv2', 'opv16', 'opv64'].forEach(function (k) {
      var f = first[k]
      var got = again[k] - after[k]
      var want2 = Math.min(f.cap, f.buffer - after[k])
      if (got !== want2 || again[k] > f.buffer) ok = false
      lines.push('next settlement ' + got + ' EU (want min(' + f.cap + ', buffer ' + f.buffer + ' - ' + after[k] + ') = ' + want2 + ')')
    })
    check('CAP', ok && !!st2.up && Number(st2.tier) === OPV && first.opv2.cap === 10737418240 && first.opv16.cap === 85899345920 && first.opv64.cap === 343597383680, lines.join('; '))
    guarded('DRAW', draw)
  }

  // the 64 A OpV hatch, filled to its buffer, gives up one tick of its input (V[OpV] x 64 A = 2^35 EU); the next settlement puts exactly that
  // back from the network: every figure past 2^31 and read back exact (longs through the hatch, the store and the settlement). The other
  // hatches are filled to their buffers first, so the 64 A one is the settlement's only taker.
  function draw() {
    var w = W()
    var h = hatch('opv64')
    var m = machineAt(h)
    var ec = m.energyContainer
    var perTick = Number(ec.getInputVoltage()) * Number(ec.getInputAmperage())
    var buffer = bufferOf(h)
    HATCHES.forEach(function (x) { machineAt(x).energyContainer.changeEnergy(bufferOf(x) - storedIn(x)) })
    var full = storedIn(h)
    var others = HATCHES.filter(function (x) { return x.key !== 'opv64' && storedIn(x) !== bufferOf(x) }).map(function (x) { return x.key })
    w.setStored(S.server, 3 * CELL_EU)
    var net0 = w.stored(S.server)
    var changed = Number(ec.changeEnergy(-DRAW))
    var drawn = full - storedIn(h)
    var held = storedIn(h)
    var st = w.settle(S.server)
    var refill = storedIn(h) - held
    var paid = net0 - w.stored(S.server)
    check('DRAW', perTick === DRAW && V(OPV) * 64 === DRAW && full === buffer && others.length === 0 && buffer > DRAW && buffer > Math.pow(2, 31) && changed === -DRAW && drawn === DRAW &&
          !!st.up && Number(st.tier) === OPV && refill === DRAW && paid === DRAW && storedIn(h) === buffer,
      h.id + ': input ' + ec.getInputVoltage() + ' EU/t x ' + ec.getInputAmperage() + ' A = ' + perTick + ' EU/t (want 2^35 = ' + DRAW + '); buffer ' + buffer +
      ' EU, filled to ' + full + (others.length ? ' (not full: ' + others.join(', ') + ')' : ', every hatch full') + '; one tick drew ' + drawn + ' EU (changeEnergy ' + changed +
      '); the next settlement (tier ' + st.tier + ') refilled ' + refill + ' EU and the network paid ' + paid + ' EU (want ' + DRAW + ' each), the hatch back at ' + storedIn(h))
  }

  // ---------------------------------------------------------------- the run

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    if (S.started) cleanup()
    leaveQueue()
    console.info(TAG + SCOPE + '|DONE')
  }

  // setTimeout is not bound in the scripts of this server, so a server-tick handler drives the steps
  function step(elapsed) {
    S.t = elapsed
    if (S.phase === 'turn') {
      if (!myTurn()) {
        if (Date.now() - S.queuedAt > TURN_TIMEOUT_MS) {
          check('TURN', false, 'no turn on the wireless network in ' + (TURN_TIMEOUT_MS / 1000) + ' s; queue ' + queueList().join(','))
          finish()
        }
        return
      }
      S.started = true
      guarded('static', staticChecks)
      try {
        saveNetwork()
        prepareWorld()
        if (!placeAll()) { finish(); return }
      } catch (e) {
        check('PLACED', false, 'exception placing: ' + e)
        finish()
        return
      }
      S.phase = 'forming'
      S.t0 = elapsed
      return
    }
    if (S.phase === 'forming') {
      if (!(formed(TOWER_A) && formed(TOWER_B))) {
        if (elapsed - S.t0 < FORM_TIMEOUT) return
        check('MIXED', false, 'the towers are not formed after ' + (elapsed - S.t0) + ' ticks: A ' + formed(TOWER_A) + ', B ' + formed(TOWER_B))
        finish()
        return
      }
      note('FORMED', 'both towers formed after ' + (elapsed - S.t0) + ' ticks')
      guarded('MIXED', mixed)
      guarded('SWAP', swapB)
      S.phase = 'swapped'
      S.t0 = elapsed
      return
    }
    if (S.phase === 'swapped') {
      if (elapsed - S.t0 < SWAP_WAIT) return
      if (!(formed(TOWER_A) && formed(TOWER_B)) && elapsed - S.t0 < FORM_TIMEOUT) return
      guarded('JUMP', jumpAndCap)
      finish()
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    try {
      step(now - S.tick0)
    } catch (e) {
      check('STEP', false, 'exception in ' + S.phase + ': ' + e)
      finish()
    }
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, level: server.overworld(), t: 0, t0: 0, tick0: now, nextAt: now + STEP, phase: 'turn', queuedAt: Date.now(), started: false, finished: false }
    joinQueue()
  }

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

  ServerEvents.customCommand('gg_test_opv_wireless', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_opv_wireless run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
