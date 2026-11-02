// priority: -20212
// XP-Z1b: the ending (docs/eras/maxplus.md "The ending"). The crossing through an open Hyperstargate plane (one dial admits the whole team, once each:
// B13-DIAL, #238), the arrival plaza (placed once per
// world), each player's first arrival (title, epilogue, the WIN_GAME credits) and the epilogue book's open signal. Game mode never changes and
// the player stays alive and in place (MAX-C3 proved the packet, DECISIONS.md:693). No quest code: the arrival quest is a dimension task.
// Reads global.grindless.hyperstargate (XP-G1): gates() -> [{ dimension, pos: { x, y, z }, facing, open, run, team, box }]; team is the team id of the
// controller's owner (lib/teams.js), 'server' when it has none. Players' teams come from global.grindless.teams.ofPlayer.
;(function () {
  var LOG = '[grindless/ending] '
  var G = global.grindless || (global.grindless = {})
  var E = (G.ending = {})

  // mirrors data/grindless/tables/horizon_city.json (checked by tools/analysis/test/maxplus-ending.test.mjs)
  var DIM = 'grindless:horizon_city'
  var ARRIVAL = { x: 0.5, y: 4, z: 0.5, yaw: 0, pitch: 0 }
  var PLAZA = { template: 'grindless:horizon_city/arrival_plaza', origin: [-16, 3, -16], size: [32, 6, 32] }
  var CHECK = 5 // ticks between gate checks: a player inside an open plane crosses within this
  var PLACE_TIMEOUT = 200
  var CREDITS_DELAY = 110 // the title (fade 10, stay 80, fade 20) has shown and the client is past the level-loading screen
  var CHANNEL = 'grindless_epilogue_open'
  var K_GATES = 'grindless_ending_gates'
  var K_PLAZA = 'grindless_ending_plaza'
  var K_ARRIVED = 'grindless_ending_arrived'
  var K_CREDITS = 'grindless_ending_credits'
  E.constants = { dimension: DIM, arrival: ARRIVAL, plaza: PLAZA, check: CHECK, channel: CHANNEL }

  // ---------------------------------------------------------------- pure logic (tested without a game)
  function gateKey(g) {
    return g.dimension + '|' + g.pos.x + ',' + g.pos.y + ',' + g.pos.z
  }
  E.gateKey = gateKey

  // rec[key] = { run, open, team, used }: one record per gate. A run is the gate's recipe-start counter (g.run, kept in the world's persistent data
  // by the startup script), so a pause and resume or a restart of the same dial is the same run and a new dial is a new one: it clears `used`.
  // One dial admits a whole team (B13-DIAL, #238): `team` is the team that may cross (the gate's, g.team: the team of the controller's owner) and
  // `used` lists the players of that team who have crossed in this run. A gate whose controller has no owner ('server') has no team until the
  // first player crosses: that player's team is the run's team. A new run clears both.
  var SERVER = 'server'
  function usedOf(r) {
    if (!Array.isArray(r.used)) r.used = []
    return r.used
  }
  function teamOfGate(g) {
    return g.team === undefined || g.team === null || String(g.team) === '' ? SERVER : String(g.team)
  }
  function teamOfPlayer(p) {
    return p.team === undefined || p.team === null || String(p.team) === '' ? String(p.id) : String(p.team)
  }

  E.update = function (gates, rec) {
    var changed = false
    var seen = {}
    gates.forEach(function (g) {
      if (!g.open || !g.box) return
      var k = gateKey(g)
      seen[k] = true
      var run = Number(g.run) || 0
      var r = rec[k]
      if (!r) r = rec[k] = { run: run, open: false, team: '', used: [] }
      if (typeof r.team !== 'string') r.team = ''
      usedOf(r)
      if (r.run !== run) {
        r.run = run
        r.used = []
        r.team = ''
        changed = true
      }
      var owner = teamOfGate(g)
      if (owner !== SERVER && r.team !== owner) {
        r.team = owner
        changed = true
      }
      if (!r.open) {
        r.open = true
        changed = true
      }
    })
    Object.keys(rec).forEach(function (k) {
      if (rec[k].open && !seen[k]) {
        rec[k].open = false
        changed = true
      }
    })
    return changed
  }
  E.inside = function (box, x, y, z) {
    return x >= box.minX && x < box.maxX + 1 && y >= box.minY && y < box.maxY + 1 && z >= box.minZ && z < box.maxZ + 1
  }

  // the first player inside an open gate's box (same dimension, not a spectator) who belongs to the gate's team and has not crossed in this run:
  // { id, key, team } or null. A run with no team yet takes the first player's. players: [{ id, team, dim, x, y, z, ok }] (no team: a team of one)
  E.claim = function (gates, players, rec) {
    var found = null
    gates.forEach(function (g) {
      if (found !== null || !g.open || !g.box) return
      var k = gateKey(g)
      var r = rec[k]
      if (!r || !r.open) return
      var used = usedOf(r)
      for (var i = 0; i < players.length; i++) {
        var p = players[i]
        if (p.ok === false || p.dim !== g.dimension) continue
        if (!E.inside(g.box, p.x, p.y + 0.9, p.z)) continue
        var team = teamOfPlayer(p)
        if (used.indexOf(String(p.id)) >= 0) continue
        if (r.team !== '' && team !== r.team) continue
        found = { id: p.id, key: k, team: team }
        return
      }
    })
    return found
  }

  // a crossing is done: the player is used in this run, and a run with no team takes theirs
  E.cross = function (rec, key, id, team) {
    var r = rec[key]
    if (!r) return
    var used = usedOf(r)
    if (used.indexOf(String(id)) < 0) used.push(String(id))
    if (r.team === '' && team) r.team = String(team)
  }

  // ---------------------------------------------------------------- game side
  var rec = null
  var recOpen = false
  var pending = null
  var queue = []
  var failed = false

  function dimensionOf(level) {
    var d = level.dimension
    return String(typeof d === 'function' ? level.dimension().location() : d)
  }

  // one compound per gate under K_GATES: { run, open, team, used: [player uuids] } (the v1.1.0 single JSON string is read once and rewritten; a
  // record from before per-team dials has a boolean `used` and no team, which usedOf and E.update make a fresh run's)
  function loadRec(server) {
    if (rec !== null) return
    rec = {}
    try {
      var pd = server.persistentData
      if (pd.contains(K_GATES, 8)) {
        var raw = String(pd.getString(K_GATES) || '')
        if (raw.length > 0) rec = JSON.parse(raw)
      } else {
        var tag = pd.getCompound(K_GATES)
        var keys = tag.getAllKeys().toArray()
        for (var i = 0; i < keys.length; i++) {
          var c = tag.getCompound(String(keys[i]))
          var list = c.getList('used', 8)
          var used = []
          for (var j = 0; j < list.size(); j++) used.push(String(list.getString(j)))
          rec[String(keys[i])] = { run: Number(c.getInt('run')), open: c.getBoolean('open'), team: String(c.getString('team') || ''), used: used }
        }
      }
    } catch (e) {
      console.error(LOG + 'gate records unreadable, starting empty: ' + e)
    }
    Object.keys(rec).forEach(function (k) {
      if (rec[k].open) recOpen = true
    })
  }

  function saveRec(server) {
    var CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag')
    var ListTag = Java.loadClass('net.minecraft.nbt.ListTag')
    var StringTag = Java.loadClass('net.minecraft.nbt.StringTag')
    var tag = new CompoundTag()
    recOpen = false
    Object.keys(rec).forEach(function (k) {
      if (rec[k].open) recOpen = true
      var c = new CompoundTag()
      c.putInt('run', rec[k].run)
      c.putBoolean('open', rec[k].open === true)
      c.putString('team', typeof rec[k].team === 'string' ? rec[k].team : '')
      var list = new ListTag()
      usedOf(rec[k]).forEach(function (id) { list.add(StringTag.valueOf(String(id))) })
      c.put('used', list)
      tag.put(k, c)
    })
    server.persistentData.remove(K_GATES)
    server.persistentData.put(K_GATES, tag)
  }
  // the records as loaded from, and written to, persistent data (the T1 fixture's cold-read check)
  E.load = function (server) {
    loadRec(server)
    return rec
  }
  E.save = saveRec

  function teamOf(p) {
    var T = G.teams
    return T && typeof T.ofPlayer === 'function' ? String(T.ofPlayer(p)) : String(p.getStringUuid())
  }

  function players(server) {
    var list = server.getPlayerList().getPlayers()
    var out = []
    for (var i = 0; i < list.size(); i++) {
      var p = list.get(i)
      out.push({ id: String(p.getStringUuid()), team: teamOf(p), dim: dimensionOf(p.getLevel()), x: p.getX(), y: p.getY(), z: p.getZ(), ok: !p.isSpectator() })
    }
    return out
  }

  function playerById(server, id) {
    var list = server.getPlayerList().getPlayers()
    for (var i = 0; i < list.size(); i++) {
      if (String(list.get(i).getStringUuid()) === id) return list.get(i)
    }
    return null
  }

  function scan(server) {
    var HS = G.hyperstargate
    if (!HS || typeof HS.gates !== 'function') return
    if (server.getPlayerList().getPlayerCount() === 0) return
    loadRec(server)
    var gates = HS.gates()
    var anyOpen = false
    gates.forEach(function (g) {
      if (g.open && g.box) anyOpen = true
    })
    if (!anyOpen && !recOpen) return
    if (E.update(gates, rec)) saveRec(server)
    if (!anyOpen) return
    var c = E.claim(gates, players(server), rec)
    if (c !== null) pending = { id: c.id, key: c.key, team: c.team, started: Number(server.getTickCount()), forced: false }
  }

  function inDim(server, text) {
    return Number(server.runCommandSilent('execute in ' + DIM + ' run ' + text))
  }

  function corners() {
    var o = PLAZA.origin
    return [o[0], o[2], o[0] + PLAZA.size[0] - 1, o[2] + PLAZA.size[2] - 1]
  }

  function advance(server) {
    var n = Number(server.getTickCount())
    var p = playerById(server, pending.id)
    if (p === null) {
      pending = null
      return
    }
    var c = corners()
    if (!server.persistentData.getBoolean(K_PLAZA)) {
      if (!pending.forced) {
        pending.forced = true
        inDim(server, 'forceload add ' + c[0] + ' ' + c[1] + ' ' + c[2] + ' ' + c[3])
      }
      var o = PLAZA.origin
      if (inDim(server, 'place template ' + PLAZA.template + ' ' + o[0] + ' ' + o[1] + ' ' + o[2]) > 0) {
        server.persistentData.putBoolean(K_PLAZA, true)
      } else if (n - pending.started > PLACE_TIMEOUT) {
        console.error(LOG + 'the arrival plaza could not be placed in ' + PLACE_TIMEOUT + ' ticks; the crossing is cancelled')
        inDim(server, 'forceload remove ' + c[0] + ' ' + c[1] + ' ' + c[2] + ' ' + c[3])
        pending = null
        return
      } else return
    }
    p.teleportTo(DIM, ARRIVAL.x, ARRIVAL.y, ARRIVAL.z, ARRIVAL.yaw, ARRIVAL.pitch)
    E.cross(rec, pending.key, pending.id, pending.team)
    saveRec(server)
    inDim(server, 'forceload remove ' + c[0] + ' ' + c[1] + ' ' + c[2] + ' ' + c[3])
    pending = null
    arrive(server, p, n)
  }

  // title, epilogue and credits happen once per player; later arrivals only teleport
  function arrive(server, p, n) {
    var saved = p.persistentData
    if (saved.getBoolean(K_ARRIVED)) return
    saved.putBoolean(K_ARRIVED, true)
    var name = String(p.getGameProfile().getName())
    server.runCommandSilent('title ' + name + ' times 10 80 20')
    server.runCommandSilent('title ' + name + ' subtitle {"translate":"grindless.ending.subtitle"}')
    server.runCommandSilent('title ' + name + ' title {"translate":"grindless.ending.title"}')
    p.give(Item.of('grindless:epilogue'))
    queue.push({ id: String(p.getStringUuid()), due: n + CREDITS_DELAY })
  }

  function rollCredits(server, n) {
    var keep = []
    for (var i = 0; i < queue.length; i++) {
      var q = queue[i]
      if (q.due > n) {
        keep.push(q)
        continue
      }
      var p = playerById(server, q.id)
      if (p === null || p.persistentData.getBoolean(K_CREDITS)) continue
      p.persistentData.putBoolean(K_CREDITS, true)
      var Packet = Java.loadClass('net.minecraft.network.protocol.game.ClientboundGameEventPacket')
      p.connection.send(new Packet(Packet.WIN_GAME, 1.0))
    }
    queue = keep
  }

  ServerEvents.tick(function (event) {
    var server = event.server
    try {
      if (pending === null && queue.length === 0 && Number(server.getTickCount()) % CHECK !== 0) return
      var n = Number(server.getTickCount())
      if (pending !== null) advance(server)
      if (queue.length > 0) rollCredits(server, n)
      if (pending === null && n % CHECK === 0) scan(server)
    } catch (e) {
      pending = null
      if (!failed) {
        failed = true
        console.error(LOG + 'ending tick failed: ' + e)
      }
    }
  })

  // a player who arrived but left before the credits rolled gets them on the next login
  PlayerEvents.loggedIn(function (event) {
    var p = event.player
    if (!p.persistentData.getBoolean(K_ARRIVED) || p.persistentData.getBoolean(K_CREDITS)) return
    queue.push({ id: String(p.getStringUuid()), due: Number(event.server.getTickCount()) + 40 })
  })

  // the book itself is a client screen (client_scripts/grindless/maxplus_epilogue_book.js)
  ItemEvents.rightClicked('grindless:epilogue', function (event) {
    event.player.sendData(CHANNEL, {})
  })
})()
