// priority: -8502
// TEST ONLY, FIX-RELAY (#255; lib/relay_platforms.js). Command: kubejs custom_command gg_test_relay_team. Band: the Overworld, X 49920-49983, Z 0-63,
// Y 98-112 (a jump ring controller at X 49975, Y 100, Z 40; the platform it queues is placed with a test row at X 49950, Z 10).
// Doubt it settles: the team a relay platform's hatches are tracked under is the team of the player standing in the ring that ran the jump.
//   party     a fake player with a known UUID joins a new FTB party; a stand-in player of that UUID is the traveller (a headless server has no player)
//   queue     R.onFinished of a real warp gate controller (its server answers the stand-in and a player elsewhere) queues the party's team id;
//             with only the player elsewhere it queues 'server'
//   place     R.place with the queued team places the platform and the network counts both its hatches under that party's team
// The queue is put back as found, the band cleared and the forceloads, the tracked hatches and the platform's save key dropped; the party stays in the save.
(function () {
  var SCOPE = 'relay_team'
  var TAG = 'GGTEST|'
  var REQUEST = 'ggTestRelayTeamRequest'
  var LOADED_AT = Date.now()
  var DIM = 'minecraft:overworld'
  var X0 = 49920
  var X1 = 49983
  var Y0 = 98
  var Y1 = 112
  var CTL = { x: 49975, y: 100, z: 40 }
  var ROW = { place: 'gg_relay_team', jump: 'hold_gg_relay_team', dimension: DIM, x: 49950, y: 100, z: 10 }
  var DUE = 'grindless_relay_due'
  var C = null
  var failed = 0

  function classes() {
    if (C !== null) return C
    C = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      UUID: Java.loadClass('java.util.UUID'),
      Profile: Java.loadClass('com.mojang.authlib.GameProfile'),
      FPF: Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory'),
      TeamsAPI: Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI'),
      Color4I: Java.loadClass('dev.ftb.mods.ftblibrary.icon.Color4I')
    }
    return C
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function emit(name, kind, detail) { console.info(TAG + SCOPE + '|' + name + '|' + kind + '|' + clean(detail)) }
  function check(name, ok, detail) {
    if (!ok) failed++
    emit(name, ok ? 'PASS' : 'FAIL', detail)
    return ok
  }
  function pos(p) { return new (classes().Pos)(p.x, p.y, p.z) }
  function run(server, text) { return Number(server.runCommandSilent('execute in ' + DIM + ' run ' + text)) }
  function errText(e) {
    var s = ''
    try { s = String(e.message || e) } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }

  function standIn(uuid, x, z) {
    return {
      uuid: uuid,
      getLevel: function () { return { getDimension: function () { return DIM } } },
      getX: function () { return x },
      getY: function () { return CTL.y },
      getZ: function () { return z }
    }
  }

  function begin(server) {
    var G = global.grindless
    var R = G && G.relayPlatforms
    var W = G && G.wireless
    var T = G && G.teams
    var level = server.getLevel(DIM)
    var K = classes()
    var savedDue = server.persistentData.contains(DUE) ? String(server.persistentData.getString(DUE)) : null
    var party = null
    var hatches = []
    try {
      if (!R || !W || !T || typeof R.onFinished !== 'function' || typeof R.place !== 'function') throw new Error('relayPlatforms, wireless or teams is not published')
      server.persistentData.remove(DUE)
      var uuid = K.UUID.randomUUID()
      var tm = K.TeamsAPI.api().getManager()
      var fp = K.FPF.get(level, new K.Profile(uuid, 'gg_relay_owner'))
      tm.playerLoggedIn(fp, uuid, 'gg_relay_owner')
      tm.createPartyTeam(fp, 'gg_relay_party_' + String(uuid).substring(0, 8), '', K.Color4I.rgb(0x2266aa))
      var t = tm.getTeamForPlayerID(uuid)
      party = t.isPresent() && t.get().isPartyTeam() ? String(t.get().getId()) : null
      check('party', party !== null && party !== String(uuid), 'fake player ' + uuid + ' -> FTB party team ' + party)
      if (party === null) throw new Error('no party team')

      run(server, 'forceload add ' + CTL.x + ' ' + CTL.z)
      level.getChunk(CTL.x >> 4, CTL.z >> 4)
      run(server, 'setblock ' + CTL.x + ' ' + CTL.y + ' ' + CTL.z + ' gtceu:warp_gate[facing=north] replace')
      var real = K.Meta.getMachine(level, pos(CTL))
      if (!real) throw new Error('no warp gate controller at ' + CTL.x + ',' + CTL.y + ',' + CTL.z)
      var cx = CTL.x + 0.5
      var cz = CTL.z + 7.5
      var elsewhere = standIn('00000000-0000-0000-0000-00000000dead', cx + 30, cz)
      var traveller = standIn(String(uuid), cx, cz)
      var players = [elsewhere, traveller]
      var wrapped = {
        getLevel: function () { return { dimension: real.getLevel().dimension, getServer: function () { return { getPlayers: function () { return players }, persistentData: server.persistentData } } } },
        getPos: function () { return real.getPos() },
        getFrontFacing: function () { return real.getFrontFacing() }
      }
      T.using({ teamOfPlayer: function (p) { return T.ofUuid(p.uuid) } })
      var jump = 'grindless:warp_gate/' + (R.rows()[0] ? R.rows()[0].jump : ROW.jump)
      R.onFinished(wrapped, jump)
      var queued = R.due(server)
      check('queue_traveller', queued.length === 1 && queued[0].t === party, 'queued ' + JSON.stringify(queued.map(function (e) { return { p: e.p, t: e.t } })) + ', want team ' + party)
      server.persistentData.remove(DUE)
      players = [elsewhere]
      R.onFinished(wrapped, jump)
      var none = R.due(server)
      check('queue_nobody', none.length === 1 && none[0].t === 'server', 'nobody in the ring queued ' + JSON.stringify(none.map(function (e) { return e.t })) + ', want server')
      server.persistentData.remove(DUE)

      var built = R.place(server, ROW, null, party)
      hatches = [built.at.energy, { x: ROW.x + 9, y: ROW.y, z: ROW.z }]
      var teams = hatches.map(function (h) { return String(W.teamAt(level, pos(h))) })
      check('place', teams[0] === party && teams[1] === party, 'energy hatch ' + teams[0] + ', dynamo hatch ' + teams[1] + ', want team ' + party)
    } catch (e) {
      check('exception', false, errText(e))
    }
    try {
      T.using(null)
      hatches.forEach(function (h) { W.forget(level, pos(h)) })
      server.persistentData.remove(R.keyOf(ROW))
      delete R.placed[ROW.place]
      run(server, 'fill ' + X0 + ' ' + Y0 + ' 0 ' + X1 + ' ' + Y1 + ' 63 minecraft:air replace')
      run(server, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
      server.persistentData.remove(DUE)
      if (savedDue !== null) server.persistentData.putString(DUE, savedDue)
    } catch (e) {
      emit('cleanup', 'NOTE', errText(e))
    }
    console.info(TAG + SCOPE + '|DONE|failures=' + failed)
  }

  ServerEvents.customCommand('gg_test_relay_team', function () {
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    if (!global[REQUEST] || Date.now() - LOADED_AT < 10000) return
    global[REQUEST] = false
    try {
      begin(event.server)
    } catch (e) {
      check('exception', false, errText(e))
      console.info(TAG + SCOPE + '|DONE|failures=' + failed)
    }
  })
})()
