// Gregtech Grindless - T1 fixture of the per-team wireless network (B13-WTEAM, #235; TEST-ONLY overlay: copied over the instance on the test
// PC, never shipped with the pack): server_scripts/grindless/lib/teams.js, lib/wireless_registry.js and lv/wireless_energy.js, against the
// real FTB Teams and FTB Chunks of the pack, and GTM's covers and hatches.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -PackDir <copy of pack> `
//     -Commands 'kubejs custom_command gg_test_wireless_team' -WaitForLog 'GGTEST\|wireless_team\|DONE@@600'
//
// Markers: GGTEST|wireless_team|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|wireless_team|DONE.
//   FTB_API       FTB Teams' and FTB Chunks' managers are loaded; teams.js reads them: a fake player has no team ('server'), a UUID without a
//                 team is its own id, an unclaimed chunk has no claimant
//   TOWERS        team A's tower (4 LV cells) and team B's (2 MV cells) form; each network is its own: tier, towers, capacity
//   STORES        two stores seeded apart; one settlement fills each team's hatch and cover from its own store only (the deltas equal the
//                 gains), a hatch above its team's tier gets nothing, and a team whose store is empty feeds nothing while the other goes on
//   CLAIM         a server team claims one chunk (FTB Chunks' own claim): a fake player's cover click on a machine there is refused (event
//                 cancelled, no cover, nothing tracked) and the same click one chunk away works; unclaimed again, it works; a hatch tracked
//                 with no player in a claimed chunk belongs to the claiming team
// TEST AREA: the Overworld X 48640-48703, Z 0-63, Y 98-112 (the zone wireless_team); the test force-loads, clears and releases it, drops its
// claim and its server team, and its persistent data keys. It waits its turn in the wireless queue (the wireless tests share the network).
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'wireless_team'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestWirelessTeamRequest'
  var QUEUE = 'ggTestWirelessQueue'
  var TEST_TIMEOUT = 1500

  var EARTH = 'minecraft:overworld'
  var BAND = { x0: 48640, x1: 48703, z0: 0, z1: 63 }
  var Y0 = 98
  var Y1 = 112
  var ROOF_Y = 112
  var EY = 100
  var TEAM_A = 'ggteam-a'
  var TEAM_B = 'ggteam-b'
  var CLAIM_TEAM_NAME = 'gg_wireless_claim'

  var TOWER_A = { x: BAND.x0 + 4, z: 20 }
  var TOWER_B = { x: BAND.x0 + 18, z: 52 }
  // chunk (X 3042, Z 0): the free machine and the A / B covered ones; chunk (X 3043, Z 0): the claimed one and a hatch
  var MAC_A = { x: BAND.x0 + 34, z: 4 }
  var MAC_B = { x: BAND.x0 + 36, z: 4 }
  var MAC_FREE = { x: BAND.x0 + 40, z: 4 }
  var MAC_CLAIMED = { x: BAND.x0 + 52, z: 4 }
  var HATCH_CLAIMED = { x: BAND.x0 + 54, z: 8 }
  var HATCH_A_LV = { x: BAND.x0 + 30, z: 40 }
  var HATCH_A_MV = { x: BAND.x0 + 32, z: 40 }
  var HATCH_B_MV = { x: BAND.x0 + 34, z: 40 }

  var LV_CELL = 'grindless:lv_capacitor_cell'
  var MV_CELL = 'grindless:mv_capacitor_cell'
  var HATCH_LV = 'gtceu:lv_wireless_energy_hatch'
  var HATCH_MV = 'gtceu:mv_wireless_energy_hatch'
  var MACERATOR = 'gtceu:lv_macerator'
  var STORE_A = 50000000
  var STORE_B = 30000000

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

  // the turn queue: test names joined by commas in `global` (a plain string survives the scripts' reloads)
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
  function myTurn(name) {
    return queueList()[0] === name
  }

  // ---------------------------------------------------------------- Java

  function lazy() {
    if (J !== null) return J
    J = {
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      Direction: Java.loadClass('net.minecraft.core.Direction'),
      AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
      Vec3: Java.loadClass('net.minecraft.world.phys.Vec3'),
      BHR: Java.loadClass('net.minecraft.world.phys.BlockHitResult'),
      Hand: Java.loadClass('net.minecraft.world.InteractionHand'),
      ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity'),
      UUID: Java.loadClass('java.util.UUID'),
      FPF: Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory'),
      FH: Java.loadClass('net.minecraftforge.common.ForgeHooks'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      TeamsAPI: Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI'),
      ChunksAPI: Java.loadClass('dev.ftb.mods.ftbchunks.api.FTBChunksAPI'),
      ChunkDimPos: Java.loadClass('dev.ftb.mods.ftblibrary.math.ChunkDimPos'),
      Color4I: Java.loadClass('dev.ftb.mods.ftblibrary.icon.Color4I')
    }
    return J
  }

  function W() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.settle !== 'function') throw new Error('global.grindless.wireless is incomplete (the server script did not load)')
    return w
  }
  function T() {
    var t = global.grindless && global.grindless.teams
    if (!t || typeof t.ofPlayer !== 'function') throw new Error('global.grindless.teams is missing (lib/teams.js did not run)')
    return t
  }

  function bp(x, y, z) { return new (lazy().BlockPos)(x, y, z) }
  function cmd(text) { return S.server.runCommandSilent('execute in ' + EARTH + ' run ' + text) }
  function machineAt(x, y, z) {
    var m = lazy().MetaMachine.getMachine(S.earth, bp(x, y, z))
    return m === null || m === undefined ? null : m
  }
  function stored(m) { return m === null ? -1 : Number(m.energyContainer.getEnergyStored()) }
  function fakePlayer() {
    if (!S.fake) S.fake = lazy().FPF.getMinecraft(S.earth)
    return S.fake
  }

  // ---------------------------------------------------------------- the world

  function fillBand(y0, y1, block) {
    var n = 0
    for (var z = BAND.z0; z <= BAND.z1; z += 16) {
      n += Number(cmd('fill ' + BAND.x0 + ' ' + y0 + ' ' + z + ' ' + BAND.x1 + ' ' + y1 + ' ' + Math.min(z + 15, BAND.z1) + ' ' + block))
    }
    return n
  }

  function prepareWorld() {
    S.areaTouched = true
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.earth.getChunk(cx, cz)
    }
    var loaded = cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = fillBand(Y0, Y1, 'air')
    fillBand(ROOF_Y, ROOF_Y, 'minecraft:smooth_stone')
    note('AREA', 'Overworld band X ' + BAND.x0 + '-' + BAND.x1 + ' Z ' + BAND.z0 + '-' + BAND.z1 + ': forceload add ' + loaded + ', cleared ' + cleared)
  }

  function dropClaim() {
    if (!S.claimTeam) return
    try {
      var data = lazy().ChunksAPI.api().getManager().getOrCreateData(S.claimTeam)
      var source = S.server.createCommandSourceStack()
      for (var dx = 3042; dx <= 3043; dx++) data.unclaim(source, new (lazy().ChunkDimPos)(S.earth, bp(dx * 16, EY, 0)), false)
      S.server.runCommandSilent('ftbteams server delete ' + CLAIM_TEAM_NAME)
      var gone = !lazy().TeamsAPI.api().getManager().getTeamByName(CLAIM_TEAM_NAME).isPresent()
      note('CLEANUP_claim', 'the claim is dropped and the server team ' + (gone ? 'deleted' : 'still exists (the next run reuses it)'))
    } catch (e) {
      note('CLEANUP_claim', 'could not drop the claim: ' + e)
    }
    S.claimTeam = null
  }

  function cleanup() {
    if (!S.areaTouched) return
    dropClaim()
    cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var items = S.earth.getEntitiesOfClass(lazy().ItemEntity, new (lazy().AABB)(BAND.x0, Y0, BAND.z0, BAND.x1 + 1, Y1 + 1, BAND.z1 + 1))
    for (var i = 0; i < items.size(); i++) items.get(i).discard()
    var cleared = fillBand(Y0, Y1, 'air')
    var released = cmd('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    note('CLEANUP', 'cleared ' + cleared + ' blocks, forceload remove ' + released + ', ' + items.size() + ' item entities removed')
    try {
      var w = W()
      S.server.persistentData.remove(w.blocksKey)
      S.server.persistentData.remove(w.storeKey)
      S.server.persistentData.remove(w.storesKey)
      w.dropCache()
    } catch (e) {
      note('CLEANUP_data', 'could not drop the network keys: ' + e)
    }
  }

  function setblock(x, y, z, block, failed) {
    if (Number(cmd('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')) >= 1) return
    var want = String(block).split('[')[0]
    if (want.indexOf(':') < 0) want = 'minecraft:' + want
    var have = String(S.earth.getBlock(x, y, z).id)
    if (have !== want) failed.push(x + ',' + y + ',' + z + ' ' + block + ' (is ' + have + ')')
  }

  // a structure from lib/patterns.js's description, the controller facing north at (cx, cy, cz), the structure behind it
  function placeStructure(machineId, cx, cy, cz, choose, failed) {
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
          var id = choose ? choose(sym) : null
          if (id === null || id === undefined) {
            if (sym.kind === 'frames') id = 'gtceu:' + sym.materials[0] + '_frame'
            else if (sym.kind === 'blocks') id = sym.blocks[0]
            else if (sym.kind === 'oneOf') {
              for (var k = 0; k < sym.options.length && !id; k++) if (sym.options[k].kind === 'blocks') id = sym.options[k].blocks[0]
            }
          }
          setblock(cx - (ci - ctrl.ci), cy + (ri - ctrl.ri), cz - (si - ctrl.si), id, failed)
          count++
        }
      })
    })
    setblock(cx, cy, cz, machineId + '[facing=north]', failed)
    return count + 1
  }

  // tower: the cell ids from the front of the cell slots, the casing (an empty slot) after them
  function placeTower(at, cellIds, failed) {
    var used = 0
    return placeStructure(W().towerId, at.x, EY, at.z, function (sym) {
      if (sym.kind !== 'oneOf') return null
      if (used < cellIds.length) return cellIds[used++]
      return W().casing
    }, failed)
  }

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

  // ---------------------------------------------------------------- static checks

  function checkApi() {
    var L = lazy()
    var t = T()
    var tm = L.TeamsAPI.api()
    var cm = L.ChunksAPI.api()
    var loaded = !!tm.isManagerLoaded() && !!cm.isManagerLoaded()
    var fp = fakePlayer()
    var fresh = String(L.UUID.randomUUID())
    var teamOfFake = String(t.ofPlayer(fp))
    var teamOfFresh = String(t.ofUuid(fresh))
    var unclaimed = t.claimOwner(S.earth, bp(MAC_FREE.x, EY, MAC_FREE.z))
    var freshId = L.UUID.fromString(fresh)
    var directTeam = tm.isManagerLoaded() ? tm.getManager().getTeamForPlayerID(freshId).isPresent() : null
    var noClaimant = cm.isManagerLoaded() ? cm.getManager().getChunk(new L.ChunkDimPos(S.earth, bp(MAC_FREE.x, EY, MAC_FREE.z))) : 'unavailable'
    var machine = machineAt(HATCH_A_LV.x, EY, HATCH_A_LV.z)
    check('FTB_API', loaded && teamOfFake === 'server' && teamOfFresh === fresh && (unclaimed === null || unclaimed === undefined) && directTeam === false && noClaimant === null,
      'managers loaded ' + loaded + '; a fake player\'s team ' + teamOfFake + ' (want server); a UUID with no team -> ' + teamOfFresh + ' (want ' + fresh + '); an unclaimed chunk\'s claimant ' +
      unclaimed + '; FTB Teams says the fresh UUID has a team: ' + directTeam + '; FTB Chunks\' chunk there: ' + noClaimant + '; teams.ofMachine of a hatch nobody placed ' + (machine === null ? '(no machine)' : t.ofMachine(machine)))
  }

  // ---------------------------------------------------------------- the build

  function startBuild() {
    var failed = []
    var a = placeTower(TOWER_A, [LV_CELL, LV_CELL, LV_CELL, LV_CELL], failed)
    var b = placeTower(TOWER_B, [MV_CELL, MV_CELL], failed)
    setblock(HATCH_A_LV.x, EY, HATCH_A_LV.z, HATCH_LV + '[facing=north]', failed)
    setblock(HATCH_A_MV.x, EY, HATCH_A_MV.z, HATCH_MV + '[facing=north]', failed)
    setblock(HATCH_B_MV.x, EY, HATCH_B_MV.z, HATCH_MV + '[facing=north]', failed)
    ;[MAC_A, MAC_B, MAC_FREE, MAC_CLAIMED].forEach(function (p) { setblock(p.x, EY, p.z, MACERATOR + '[facing=north]', failed) })
    setblock(HATCH_CLAIMED.x, EY, HATCH_CLAIMED.z, HATCH_LV + '[facing=north]', failed)
    note('PLACED', 'tower A ' + a + ' blocks, tower B ' + b + ' blocks' + (failed.length ? ' FAILED ' + failed.slice(0, 8).join('; ') : ''))
    return failed.length === 0
  }

  function trackTeams() {
    var w = W()
    var L = lazy()
    var fp = fakePlayer()
    var cover = w.coverItems[String(w.coverItemId('energy', 1))]
    w.track(S.earth, bp(TOWER_A.x, EY, TOWER_A.z), TEAM_A)
    w.track(S.earth, bp(TOWER_B.x, EY, TOWER_B.z), TEAM_B)
    w.track(S.earth, bp(HATCH_A_LV.x, EY, HATCH_A_LV.z), TEAM_A)
    w.track(S.earth, bp(HATCH_A_MV.x, EY, HATCH_A_MV.z), TEAM_A)
    w.track(S.earth, bp(HATCH_B_MV.x, EY, HATCH_B_MV.z), TEAM_B)
    // the covers go on through the network's own placing (a fake player: no team), then belong to a team as a placing player's would
    var ca = w.placeCover(S.earth, bp(MAC_A.x, EY, MAC_A.z), L.Direction.UP, Item.of(w.coverItemId('energy', 1)), fp)
    var cb = w.placeCover(S.earth, bp(MAC_B.x, EY, MAC_B.z), L.Direction.UP, Item.of(w.coverItemId('energy', 1)), fp)
    w.trackCover(S.earth, bp(MAC_A.x, EY, MAC_A.z), L.Direction.UP, cover, TEAM_A)
    w.trackCover(S.earth, bp(MAC_B.x, EY, MAC_B.z), L.Direction.UP, cover, TEAM_B)
    S.coverOk = ca.ok && cb.ok
    note('TRACKED', 'covers placed ' + ca.ok + '/' + cb.ok + '; owners ' + JSON.stringify(w.tracked(S.server).map(function (e) { return e.k + ':' + e.o })))
  }

  function reportTowers() {
    var w = W()
    w.paused = true
    w.setStored(S.server, 0, TEAM_A)
    w.setStored(S.server, 0, TEAM_B)
    w.settle(S.server)
    var a = w.status(S.server, TEAM_A)
    var b = w.status(S.server, TEAM_B)
    var ta = w.towerInfo(machineAt(TOWER_A.x, EY, TOWER_A.z))
    var tb = w.towerInfo(machineAt(TOWER_B.x, EY, TOWER_B.z))
    check('TOWERS', ta.formed && tb.formed && a.up && b.up && a.tier === 1 && b.tier === 2 && a.towers === 1 && b.towers === 1 && a.capacity === 4 * 720000 && b.capacity === 2 * 2520000 &&
      String(a.team) === TEAM_A && String(b.team) === TEAM_B,
      'A: ' + JSON.stringify(a) + '; B: ' + JSON.stringify(b) + '; want A tier 1 (4 x 720,000 EU), B tier 2 (2 x 2,520,000 EU)')
  }

  function reportStores() {
    var w = W()
    var hal = machineAt(HATCH_A_LV.x, EY, HATCH_A_LV.z)
    var ham = machineAt(HATCH_A_MV.x, EY, HATCH_A_MV.z)
    var hbm = machineAt(HATCH_B_MV.x, EY, HATCH_B_MV.z)
    var ma = machineAt(MAC_A.x, EY, MAC_A.z)
    var mb = machineAt(MAC_B.x, EY, MAC_B.z)
    w.setStored(S.server, STORE_A, TEAM_A)
    w.setStored(S.server, STORE_B, TEAM_B)
    var before = [stored(hal), stored(ham), stored(hbm), stored(ma), stored(mb)]
    w.settle(S.server)
    var gain = [stored(hal) - before[0], stored(ham) - before[1], stored(hbm) - before[2], stored(ma) - before[3], stored(mb) - before[4]]
    var dA = STORE_A - Number(w.stored(S.server, TEAM_A))
    var dB = STORE_B - Number(w.stored(S.server, TEAM_B))
    var skipped = w.lastByTeam[TEAM_A] ? w.lastByTeam[TEAM_A].skippedAbove : -1
    check('STORES', gain[0] > 0 && gain[2] > 0 && gain[3] > 0 && gain[4] > 0 && gain[1] === 0 && dA === gain[0] + gain[3] && dB === gain[2] + gain[4] && skipped === 1,
      'gains: A LV hatch ' + gain[0] + ', A MV hatch ' + gain[1] + ' (above A\'s tier: 0), B MV hatch ' + gain[2] + ', A cover macerator ' + gain[3] + ', B cover macerator ' + gain[4] +
      '; store A -' + dA + ' (want ' + (gain[0] + gain[3]) + '), store B -' + dB + ' (want ' + (gain[2] + gain[4]) + '); A skipped above tier ' + skipped)
    // team B out of EU: its hatch and cover get nothing while A's go on
    w.setStored(S.server, 0, TEAM_B)
    var mid = [stored(hal), stored(hbm), stored(ma), stored(mb)]
    hal.energyContainer.setEnergyStored(0)
    hbm.energyContainer.setEnergyStored(0)
    ma.energyContainer.setEnergyStored(0)
    mb.energyContainer.setEnergyStored(0)
    w.settle(S.server)
    var gotA = stored(hal) + stored(ma)
    var gotB = stored(hbm) + stored(mb)
    check('STORES_EMPTY', gotA > 0 && gotB === 0 && Number(w.stored(S.server, TEAM_B)) === 0,
      'B\'s store is empty: B\'s hatch + cover got ' + gotB + ' (want 0), A\'s got ' + gotA + ' (want > 0); B\'s store ' + w.stored(S.server, TEAM_B) + '; before reset ' + mid.join('/'))
  }

  // ---------------------------------------------------------------- the claim

  // a fake player's right click with an energy cover in hand on the machine at p
  function coverClick(p) {
    var L = lazy()
    var w = W()
    var fp = fakePlayer()
    fp.setShiftKeyDown(false)
    fp.setPositionAndRotation(p.x + 0.5, EY + 2.2, p.z + 0.5, 0, 90)
    fp.setItemInHand(L.Hand.MAIN_HAND, Item.of(w.coverItemId('energy', 1), 2))
    var pos = bp(p.x, EY, p.z)
    var ev = L.FH.onRightClickBlock(fp, L.Hand.MAIN_HAND, pos, new L.BHR(new L.Vec3(p.x + 0.5, EY + 1.0, p.z + 0.5), L.Direction.UP, pos, false))
    var on = machineAt(p.x, EY, p.z).getCoverContainer().getCoverAtSide(L.Direction.UP)
    var tracked = w.tracked(S.server).filter(function (e) { return e.k === 'cover' && e.x === p.x && e.z === p.z }).length
    fp.setItemInHand(L.Hand.MAIN_HAND, Item.empty)
    return { cancelled: ev.isCanceled(), placed: on !== null, tracked: tracked }
  }

  function claimChunk() {
    var L = lazy()
    var tm = L.TeamsAPI.api().getManager()
    var source = S.server.createCommandSourceStack()
    var existing = tm.getTeamByName(CLAIM_TEAM_NAME)
    S.claimTeam = existing.isPresent() ? existing.get() : tm.createServerTeam(source, CLAIM_TEAM_NAME, '', L.Color4I.rgb(0x2266aa))
    var data = L.ChunksAPI.api().getManager().getOrCreateData(S.claimTeam)
    var r = data.claim(source, new L.ChunkDimPos(S.earth, bp(MAC_CLAIMED.x, EY, MAC_CLAIMED.z)), false)
    return String(r.isSuccess()) + ' (' + r + ')'
  }

  function unclaimChunk() {
    var L = lazy()
    var data = L.ChunksAPI.api().getManager().getOrCreateData(S.claimTeam)
    return String(data.unclaim(S.server.createCommandSourceStack(), new L.ChunkDimPos(S.earth, bp(MAC_CLAIMED.x, EY, MAC_CLAIMED.z)), false).isSuccess())
  }

  function reportClaim() {
    var w = W()
    var t = T()
    var free = coverClick(MAC_FREE)
    var claim = claimChunk()
    var owner = t.claimOwner(S.earth, bp(MAC_CLAIMED.x, EY, MAC_CLAIMED.z))
    var refuses = t.claimRefuses(fakePlayer(), S.earth, bp(MAC_CLAIMED.x, EY, MAC_CLAIMED.z))
    var allows = !t.claimRefuses(fakePlayer(), S.earth, bp(MAC_FREE.x, EY, MAC_FREE.z))
    var refused = coverClick(MAC_CLAIMED)
    var hatch = w.track(S.earth, bp(HATCH_CLAIMED.x, EY, HATCH_CLAIMED.z))
    var claimId = String(S.claimTeam.getId())
    var unclaimed = unclaimChunk()
    var after = coverClick(MAC_CLAIMED)
    check('CLAIM', free.placed && free.tracked === 1 && owner !== null && String(owner) === claimId && refuses === true && allows === true &&
      refused.cancelled && !refused.placed && refused.tracked === 0 && after.placed && after.tracked === 1,
      'a cover click in an unclaimed chunk: placed ' + free.placed + ', tracked ' + free.tracked + '; claim ' + claim + '; claimOwner ' + owner + ' (want ' + claimId + '); claimRefuses there ' + refuses + ', here ' + !allows +
      '; the click in the claimed chunk: cancelled ' + refused.cancelled + ', placed ' + refused.placed + ', tracked ' + refused.tracked + '; unclaimed again (' + unclaimed + '): placed ' + after.placed + ', tracked ' + after.tracked)
    check('OWNER_BY_CLAIM', hatch !== null && String(hatch.o) === claimId, 'a hatch tracked with no player in a claimed chunk: owner ' + (hatch ? hatch.o : 'null') + ' (want the claiming team ' + claimId + ')')
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
    leaveQueue(SCOPE)
    console.info(TAG + SCOPE + '|DONE')
  }

  function step() {
    var since = S.t - S.phaseAt
    if (S.phase === 'forming') {
      var ta = formedOrForce('TOWER_A', machineAt(TOWER_A.x, EY, TOWER_A.z), since)
      var tb = formedOrForce('TOWER_B', machineAt(TOWER_B.x, EY, TOWER_B.z), since)
      if (ta === 'formed' && tb === 'formed') {
        guarded('TOWERS', reportTowers)
        guarded('STORES', reportStores)
        guarded('CLAIM', reportClaim)
        S.phase = 'end'
      } else if (ta.indexOf('failed') === 0 || tb.indexOf('failed') === 0 || since > 400) {
        check('TOWERS', false, 'tower A ' + ta + ', tower B ' + tb + ' after ' + since + ' ticks')
        S.phase = 'end'
      }
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    S.t = S.server.getTickCount() - S.tick0
    try {
      if (S.t % 5 === 0 && S.phase !== 'end') step()
    } catch (e) {
      check('step', false, 'exception in ' + S.phase + ': ' + e)
      S.phase = 'end'
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
    S = { server: server, earth: server.overworld(), tick0: server.getTickCount(), t: 0, phase: 'forming', phaseAt: 0, finished: false, areaTouched: false }
    var w = W()
    w.paused = true
    server.persistentData.remove(w.blocksKey)
    server.persistentData.remove(w.storeKey)
    server.persistentData.remove(w.storesKey)
    w.dropCache()
    guarded('AREA', prepareWorld)
    var built = false
    try {
      built = startBuild()
      guarded('FTB_API', checkApi)
      trackTeams()
    } catch (e) {
      check('PLACED', false, 'exception: ' + e)
    }
    if (!built) {
      check('PLACED', false, 'the structures were not placed')
      S.phase = 'end'
      finish()
    } else {
      S.phaseAt = S.t
    }
  }

  // The pack's Additional Placements mod reloads the datapacks (and these scripts) a couple of seconds after the server is up: the command
  // only leaves a request in `global` and the tick handler starts the test once these scripts have been loaded for QUIET_MS and it is this
  // test's turn on the wireless network.
  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS || !myTurn(SCOPE)) return
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

  ServerEvents.customCommand('gg_test_wireless_team', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous run is still in progress')
      return 0
    }
    global[REQUEST] = true
    joinQueue(SCOPE)
    note('requested', 'the test starts once these scripts have been loaded for ' + (QUIET_MS / 1000) + ' s and the wireless tests asked for before it are done (' + queueList().join(', ') + ')')
    return 1
  })
})()
