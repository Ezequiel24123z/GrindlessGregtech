// XP-Z1b: the ending (docs/eras/maxplus.md "The ending"). The crossing through an open Hyperstargate plane, the arrival plaza (placed once per
// world), each player's first arrival (title, epilogue, the WIN_GAME credits) and the epilogue book's open signal. Game mode never changes and
// the player stays alive and in place (MAX-C3 proved the packet, DECISIONS.md:693). No quest code: the arrival quest is a dimension task.
// Reads global.grindless.hyperstargate (XP-G1): gates() -> [{ dimension, pos: { x, y, z }, facing, open, box }].
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

  // rec[key] = { run, open, used }: one record per gate. A new opening (closed -> open) starts a new run and clears `used`.
  E.update = function (gates, rec) {
    var changed = false
    var seen = {}
    gates.forEach(function (g) {
      if (!g.open || !g.box) return
      var k = gateKey(g)
      seen[k] = true
      var r = rec[k]
      if (!r) r = rec[k] = { run: 0, open: false, used: false }
      if (!r.open) {
        r.run++
        r.open = true
        r.used = false
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

  // the first player inside an open, unused gate's box (same dimension, not a spectator): { id, key } or null. players: [{ id, dim, x, y, z, ok }]
  E.claim = function (gates, players, rec) {
    var found = null
    gates.forEach(function (g) {
      if (found !== null || !g.open || !g.box) return
      var k = gateKey(g)
      var r = rec[k]
      if (!r || !r.open || r.used) return
      for (var i = 0; i < players.length; i++) {
        var p = players[i]
        if (p.ok === false || p.dim !== g.dimension) continue
        if (E.inside(g.box, p.x, p.y + 0.9, p.z)) {
          found = { id: p.id, key: k }
          return
        }
      }
    })
    return found
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

  function loadRec(server) {
    if (rec !== null) return
    rec = {}
    try {
      var raw = String(server.persistentData.getString(K_GATES) || '')
      if (raw.length > 0) rec = JSON.parse(raw)
    } catch (e) {
      console.error(LOG + 'gate records unreadable, starting empty: ' + e)
    }
    Object.keys(rec).forEach(function (k) {
      if (rec[k].open) recOpen = true
    })
  }

  function saveRec(server) {
    recOpen = false
    Object.keys(rec).forEach(function (k) {
      if (rec[k].open) recOpen = true
    })
    server.persistentData.putString(K_GATES, JSON.stringify(rec))
  }

  function players(server) {
    var list = server.getPlayerList().getPlayers()
    var out = []
    for (var i = 0; i < list.size(); i++) {
      var p = list.get(i)
      out.push({ id: String(p.getStringUuid()), dim: dimensionOf(p.getLevel()), x: p.getX(), y: p.getY(), z: p.getZ(), ok: !p.isSpectator() })
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
    if (c !== null) pending = { id: c.id, key: c.key, started: Number(server.getTickCount()), forced: false }
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
    rec[pending.key].used = true
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
