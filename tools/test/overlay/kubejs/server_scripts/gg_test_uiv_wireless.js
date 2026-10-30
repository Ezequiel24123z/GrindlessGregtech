// priority: -8514
// Gregtech Grindless - smoke test of UIV's wireless tier (package UIV-W; TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): the UIV row of tables/wireless_energy.json (registered by lv/wireless_energy.js, withTiers case 11) and the nitride
// magnet works' circuit 4 (tables/composites.json), which makes the UIV cell from four UEV cells.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -Commands 'kubejs custom_command gg_test_uiv_wireless' `
//     -WaitForLog 'GGTEST\|uiv_wireless\|DONE@@180'
//
// It takes its turn on the wireless network with the other wireless fixtures (the queue `ggTestWirelessQueue` in `global`: the network is
// one per server), pauses the timed settlements while it runs and settles by hand, and puts the network's persistent data back at the end.
//
// The doubt it settles (docs/eras/uiv.md, W): the 64 A cap (V[UIV] x 64 x 10 = 21,474,836,480, past an int) and a cell above 2^39 EU, held as
// a long through the table loader, the hatch and the network's sum (tier 11, V[UIV] = 33,554,432).
// What it proves:
//   uiv_wireless|registration  grindless:uiv_smes_cell (a block), the eight UIV hatches and the two UIV covers exist; W.cells: tier 11,
//                              1,006,632,960,000 EU, made by gtceu:nitride_magnet_works; no assembler recipe for it
//   uiv_wireless|recipes       circuit 4 (grindless:nitride_magnet_synthesis/uiv_smes_cell) live with the table's EU/t, duration, items and the helium
//                              charge; the UIV hatches' and covers' assembler recipes live at VA[UIV], the 2 A hatches and the covers with
//                              the pulsar-timed repeater and one UIV sensor / emitter
//   uiv_wireless|PLACED        tower A (two UIV cells), tower B (one UEV SMES cell), a UIV 2 A, a UIV 16 A, a UIV 64 A and a UEV 2 A wireless energy hatch
//   uiv_wireless|MIXED         both towers formed: the network is UEV (the weakest cell of every formed tower), its capacity exactly
//                              2 x UIV + 1 x UEV cell; the UIV hatches get nothing (above the network's tier), the UEV one is filled
//   uiv_wireless|JUMP          tower B's UEV cell replaced by a UIV cell: the network is UIV, its capacity exactly 3 x 1,006,632,960,000 EU
//   uiv_wireless|STORED        the network is set to the full 3 cells and reports the same figure back (a long all the way)
//   uiv_wireless|CAP           on that settlement each UIV hatch gets exactly V[UIV] x amps x the settlement's ticks (W.rate), and on the next
//                              no more than that again, never past its buffer
//   uiv_wireless|SIXTY         a 16 A UIV draw (536,870,912 EU/t) is served for 60 s (1,200 ticks)
//   uiv_wireless|DONE          last line
//
// TEST AREA: ONLY the band X 35328-35391, Y 98-112, Z 0-63 (force-loaded and cleared); the towers face north with their controllers at
// (35336, 100, 40) and (35352, 100, 40), the hatches at X 35368-35374, Z 20. var + function everywhere (this Rhino throws "redeclaration
// of var" for const/let inside functions that run twice).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'uiv_wireless'
  var STEP = 10
  var FORM_TIMEOUT = 600
  var SWAP_WAIT = 40
  var TURN_TIMEOUT_MS = 120000
  var BAND = { x0: 35328, x1: 35391, y0: 98, y1: 112, z0: 0, z1: 63 }
  var TOWER_A = { x: 35336, y: 100, z: 40 }
  var TOWER_B = { x: 35352, y: 100, z: 40 }
  var HATCHES = [
    { key: 'uiv2', id: 'gtceu:uiv_wireless_energy_hatch', tier: 11, amps: 2, x: 35368, y: 100, z: 20 },
    { key: 'uiv64', id: 'gtceu:uiv_wireless_energy_hatch_64a', tier: 11, amps: 64, x: 35370, y: 100, z: 20 },
    { key: 'uev2', id: 'gtceu:uev_wireless_energy_hatch', tier: 10, amps: 2, x: 35372, y: 100, z: 20 },
    { key: 'uiv16', id: 'gtceu:uiv_wireless_energy_hatch_16a', tier: 11, amps: 16, x: 35374, y: 100, z: 20 }
  ]
  var STORE = 20000000000

  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestUivWirelessRequest'
  var QUEUE = 'ggTestWirelessQueue'

  var UIV = 11
  var UEV = 10
  var CELL_ID = 'grindless:uiv_smes_cell'
  var UEV_CELL = 'grindless:uev_smes_cell'
  var CELL_EU = 1006632960000
  var MADE_BY = 'gtceu:nitride_magnet_works'
  var C4 = 'grindless:nitride_magnet_synthesis/uiv_smes_cell'
  var LINK = 'grindless:pulsar_timed_repeater'
  var UIV_IDS = ['gtceu:uiv_wireless_energy_hatch', 'gtceu:uiv_wireless_energy_hatch_4a', 'gtceu:uiv_wireless_energy_hatch_16a', 'gtceu:uiv_wireless_energy_hatch_64a',
    'gtceu:uiv_wireless_dynamo_hatch', 'gtceu:uiv_wireless_dynamo_hatch_4a', 'gtceu:uiv_wireless_dynamo_hatch_16a', 'gtceu:uiv_wireless_dynamo_hatch_64a',
    'grindless:uiv_wireless_energy_cover', 'grindless:uiv_wireless_dynamo_cover']

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

  function staticChecks() {
    var w = W()
    var problems = []
    ;[CELL_ID].concat(UIV_IDS).forEach(function (id) {
      if (!Item.exists(id)) problems.push('item ' + id + ' missing')
    })
    var cell = w.cells[CELL_ID]
    if (!cell || Number(cell.tier) !== UIV || Number(cell.capacity) !== CELL_EU || String(cell.madeBy) !== MADE_BY) problems.push('W.cells[' + CELL_ID + '] is ' + JSON.stringify(cell || null))
    if (!w.tiers.some(function (t) { return Number(t) === UIV })) problems.push('no tier 11 in ' + w.tiers.join(','))
    if (w.recipes.some(function (r) { return String(r.output) === CELL_ID })) problems.push('the UIV cell has an assembler recipe')
    check('registration', problems.length === 0, problems.join(' ; ') || 'the UIV cell, eight hatches and two covers exist; W.cells: tier 11, ' + CELL_EU + ' EU, made by ' + MADE_BY + '; V[UIV] ' + V(UIV))

    var bad = []
    var notes = []
    var CO = global.grindless.composites
    var p = CO && CO.recipes ? CO.recipes.filter(function (x) { return String(x.name) === 'uiv_smes_cell' })[0] : null
    var live = liveRecipe(C4)
    if (!p) bad.push('uiv_smes_cell not published by the composites script')
    else if (live === null) bad.push(C4 + ' not in the recipe manager')
    else {
      var lio = liveIO(live)
      if (Number(live.duration) !== Number(p.duration) || eutOf(live) !== Number(p.eut)) bad.push('c4 is ' + live.duration + ' t x ' + eutOf(live) + ' EU/t, the script wanted ' + p.duration + ' x ' + p.eut)
      if (ids(lio.itemsIn) !== ids(p.itemsIn)) bad.push('c4 itemsIn ' + ids(lio.itemsIn))
      if (ids(lio.itemsOut) !== CELL_ID) bad.push('c4 itemsOut ' + ids(lio.itemsOut))
      if (ids(lio.fluidsIn) !== 'gtceu:liquid_helium') bad.push('c4 fluidsIn ' + ids(lio.fluidsIn) + ' (want the helium charge)')
      notes.push('c4 ' + live.duration + ' t x ' + eutOf(live) + ' EU/t -> ' + ids(lio.itemsOut))
    }
    var va = Number(GTValues.VA[UIV])
    var uiv = w.recipes.filter(function (r) { return /^(gtceu|grindless):uiv_wireless_/.test(String(r.output)) })
    if (uiv.length !== UIV_IDS.length) bad.push(uiv.length + ' UIV assembler recipes in W.recipes, want ' + UIV_IDS.length)
    var linked = 0
    uiv.forEach(function (r) {
      var lr = liveRecipe(String(r.id))
      if (lr === null) { bad.push(r.id + ' not in the recipe manager'); return }
      if (eutOf(lr) !== va) bad.push(r.id + ' at ' + eutOf(lr) + ' EU/t')
      var io = liveIO(lr)
      if (ids(io.itemsOut) !== String(r.output)) bad.push(r.id + ' gives ' + ids(io.itemsOut))
      var wantsLink = !/_\d+a$/.test(String(r.output))
      var hasLink = io.itemsIn.some(function (x) { return x.id === LINK })
      if (wantsLink !== hasLink) bad.push(r.id + (hasLink ? ' takes' : ' lacks') + ' the pulsar-timed repeater')
      if (hasLink) {
        linked++
        var signal = 0
        io.itemsIn.forEach(function (x) { if (x.id === 'gtceu:uiv_sensor' || x.id === 'gtceu:uiv_emitter') signal += x.n })
        if (signal !== 1) bad.push(r.id + ' takes ' + signal + ' UIV sensors / emitters, want 1')
      }
    })
    notes.push(uiv.length + ' UIV hatch and cover recipes at ' + va + ' EU/t, ' + linked + ' with ' + LINK + ' and one UIV sensor / emitter')
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
    S.cellsB = towerPlace(TOWER_B, [UEV_CELL], failed)
    HATCHES.forEach(function (h) {
      put(h.x, h.y, h.z, h.id + '[facing=north]', failed)
      w.track(S.level, new BlockPos(h.x, h.y, h.z))
    })
    check('PLACED', failed.length === 0 && S.cellsA.length === 2 && S.cellsB.length === 1,
      'tower A with ' + S.cellsA.length + ' UIV cells, tower B with ' + S.cellsB.length + ' UEV cell, hatches ' + HATCHES.map(function (h) { return h.id }).join(', ') +
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
    var want = 2 * CELL_EU + w.cells[UEV_CELL].capacity
    var uevGot = after.uev2 - before.uev2
    var uevCap = w.rate(UEV, 2) * w.settleTicks
    check('MIXED', !!st.up && Number(st.towers) === 2 && Number(st.tier) === UEV && Number(st.capacity) === want &&
          after.uiv2 === 0 && after.uiv16 === 0 && after.uiv64 === 0 && Number(st.skippedAbove) === 3 && uevGot === uevCap,
      'the network: up ' + st.up + ', ' + st.towers + ' towers, capacity ' + st.capacity + ' EU (want ' + want + '), tier ' + st.tier + ' (want ' + UEV +
      '); ' + st.skippedAbove + ' hatches above it skipped (want 3), the UIV hatches hold ' + after.uiv2 + ', ' + after.uiv16 + ' and ' + after.uiv64 + ' EU (want 0); the UEV hatch got ' + uevGot +
      ' EU (want ' + uevCap + ')')
  }

  function swapB() {
    var failed = []
    var c = S.cellsB[0]
    put(c.x, c.y, c.z, CELL_ID, failed)
    note('SWAP', 'tower B\'s UEV cell replaced by a UIV cell' + (failed.length ? ' FAILED ' + failed.join('; ') : ''))
  }

  function jumpAndCap() {
    var w = W()
    var info = [w.towerInfo(machineAt(TOWER_A)), w.towerInfo(machineAt(TOWER_B))]
    var want = 3 * CELL_EU
    // a long all the way: set the whole three cells, read it back from the status before any settlement moves it
    w.setStored(S.server, want)
    var full = w.status(S.server)
    // the capacity in status() is the last settlement's: JUMP checks it after the next one
    check('STORED', Number(full.stored) === want && want > Math.pow(2, 39),
      'set ' + want + ' EU (3 x ' + CELL_EU + ', above 2^39), the network reports stored ' + full.stored)
    var before = snapshot()
    var st = w.settle(S.server)
    var after = snapshot()
    check('JUMP', !!st.up && Number(st.towers) === 2 && Number(st.tier) === UIV && Number(st.capacity) === want && Number(st.skippedAbove) === 0,
      'towers ' + JSON.stringify(info) + '; the network: up ' + st.up + ', ' + st.towers + ' towers, capacity ' + st.capacity + ' EU (want 3 x ' + CELL_EU + ' = ' + want +
      '), tier ' + st.tier + ' (want ' + UIV + '), ' + st.skippedAbove + ' hatches skipped')

    var lines = []
    var ok = true
    var first = {}
    ;['uiv2', 'uiv16', 'uiv64'].forEach(function (k) {
      var h = hatch(k)
      var cap = w.rate(UIV, h.amps) * w.settleTicks
      var got = after[k] - before[k]
      first[k] = { cap: cap, buffer: bufferOf(h) }
      if (got !== cap) ok = false
      lines.push(h.id + ' got ' + got + ' EU on the jump (want V[UIV] ' + V(UIV) + ' x ' + h.amps + ' A x ' + w.settleTicks + ' ticks = ' + cap + ')')
    })
    var st2 = w.settle(S.server)
    var again = snapshot()
    ;['uiv2', 'uiv16', 'uiv64'].forEach(function (k) {
      var h = hatch(k)
      var f = first[k]
      var got = again[k] - after[k]
      var want2 = Math.min(f.cap, f.buffer - after[k])
      if (got !== want2 || again[k] > f.buffer) ok = false
      lines.push('next settlement ' + got + ' EU (want min(' + f.cap + ', buffer ' + f.buffer + ' - ' + after[k] + ') = ' + want2 + ')')
    })
    check('CAP', ok && !!st2.up && Number(st2.tier) === UIV && first.uiv64.cap === 21474836480, lines.join('; '))
    guarded('SIXTY', sixty)
  }

  // a 16 A UIV hatch emptied before each window for 60 s (1,200 ticks): every window serves V[UIV] x 16 A x settleTicks, no int overflow
  function sixty() {
    var w = W()
    var h = hatch('uiv16')
    var m = machineAt(h)
    var windows = Math.round(1200 / w.settleTicks)
    var per = w.rate(UIV, 16) * w.settleTicks
    var perTick = V(UIV) * 16
    w.setStored(S.server, 3 * CELL_EU)
    var bad = []
    var total = 0
    for (var i = 0; i < windows; i++) {
      m.energyContainer.changeEnergy(-Number(m.energyContainer.getEnergyStored()))
      var b = storedIn(h)
      w.settle(S.server)
      var got = storedIn(h) - b
      total += got
      if (got !== per && bad.length < 3) bad.push('window ' + i + ' served ' + got + ' (want ' + per + ')')
    }
    var want = perTick * 1200
    check('SIXTY', bad.length === 0 && total === want && perTick === 536870912,
      windows + ' windows of ' + w.settleTicks + ' ticks: served ' + total + ' EU (want ' + want + ' = 16 A x ' + V(UIV) + ' x 1200 ticks), ' + perTick + ' EU/t' +
      (bad.length ? ' | ' + bad.join('; ') : ''))
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

  ServerEvents.customCommand('gg_test_uiv_wireless', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_uiv_wireless run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
