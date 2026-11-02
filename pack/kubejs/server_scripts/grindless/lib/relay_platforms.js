// priority: -17474
// AF-1 (issue #203): the relay places. One placer for every row of tables/relay_platforms.json (the UIV rows and the rows with a source), the
// queue that turns a completed jump into its platform, and the relay coordinates the warp gate's transit (server uhv/gate.js) reads.
//
//   1. A jump completes: the gate's afterWorking (startup uhv/gate.js finishRun, only for a run that reached its full duration) calls
//      WG.onFinished with the recipe id. A row's jump queues { place, the ring that ran it } in the world's persistent data (DUE_KEY), so a
//      restart between the jump and the placing loses nothing. A paused, starved or broken jump never completes, so it never pays out.
//   2. Every PERIOD ticks the first ready entry is served: a place with no platform yet gets one (once per world: the mark uivPlatform_<place>,
//      uxvPlatform_<place> for rows with a source), then that place's relay coordinates go into the jump ring's output bus (else its input
//      bus, else on the ground in front of its controller) and the entry is dropped. A repeated jump only gives the coordinates again. A
//      placing that throws is logged and retried after RETRY ticks.
//   3. The platform: the warp gate ring with every structure symbol lib/patterns.js emits (frames included), a floor under it and its kit, the
//      wireless dynamo hatch and an AE2 controller with a drive beside it, its chunks force-loaded. Its input bus holds the circuit of the
//      sustain, the stocked exotic matter cells and the coordinates of the ring that sent the jump (the way back). Both wireless hatches are
//      tracked by the network (global.grindless.wireless.track) under the team of the ring's owner, the player whose travel built the platform
//      ('server' when the ring has none; the queue entry carries it as `t`: B13-DIAL, #238). The ring starts paused, so its cells wait for a traveller: the transit wakes
//      it for one sustain when a player steps into it.
// Relay coordinates: the table's selector item (GTM's data stick, no new item) with NBT grindless_relay = "dim|x|y|z|fx|fz" (the controller
// of the ring it names) and a display name. A sustaining ring with coordinates in an input bus carries a player standing in it there.
// Published in global.grindless.relayPlatforms: rows, ring, rowOf, rowOfJump, keyOf, ringOfRow, placedRings, due, enqueue, onFinished, step, place,
// plan, coordinates, coordinatesOf, selectorIn, placed, retryAt, reset, dueKey, tag.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var G = global.grindless || (global.grindless = {})
  var WG = G.warpGate || (G.warpGate = {})
  var LOG = '[grindless/relay] '
  var TABLE = 'kubejs/data/grindless/tables/relay_platforms.json'
  var DUE_KEY = 'grindless_relay_due'
  var TAG = 'grindless_relay'
  var PERIOD = 10
  var RETRY = 600
  var PART_FIELDS = { energy_input: 'energy', input_bus: 'inputBus', output_bus: 'outputBus' }
  var R = G.relayPlatforms || (G.relayPlatforms = {})
  R.placed = R.placed || {}
  R.retryAt = {}
  R.tableData = null
  R.dueKey = DUE_KEY
  R.tag = TAG
  var C = null

  function cls() {
    if (C !== null) return C
    C = {
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
      Compound: Java.loadClass('net.minecraft.nbt.CompoundTag'),
      List: Java.loadClass('net.minecraft.nbt.ListTag'),
      Str: Java.loadClass('net.minecraft.nbt.StringTag'),
      Block: Java.loadClass('net.minecraft.world.level.block.Block')
    }
    return C
  }

  function blockPos(p) {
    return new (cls().Pos)(p.x, p.y, p.z)
  }

  // ------------------------------------------------------------ the table (read once per script load)

  function table() {
    if (R.tableData === null) {
      var t = G.readJsonTable(TABLE)
      R.tableData = t && t.ring && Array.isArray(t.platforms) ? t : false
      if (!R.tableData) console.error(LOG + TABLE + ': no ring or no platforms')
    }
    return R.tableData || null
  }

  function rows() {
    var t = table()
    return t ? t.platforms : []
  }

  function rowOf(place) {
    var out = null
    rows().forEach(function (r) { if (out === null && String(r.place) === String(place)) out = r })
    return out
  }

  function rowOfJump(name) {
    var out = null
    rows().forEach(function (r) { if (out === null && String(r.jump) === String(name)) out = r })
    return out
  }

  function keyOf(row) {
    return (row.source ? 'uxvPlatform_' : 'uivPlatform_') + row.place
  }

  // the platform's ring: its controller at the row's position, facing north (the body runs to +z)
  function ringOfRow(row) {
    return { dim: String(row.dimension), x: Number(row.x), y: Number(row.y), z: Number(row.z), fx: 0, fz: -1, platform: String(row.place) }
  }

  function placedRings(server) {
    var data = server && server.persistentData
    if (!data) return []
    return rows().filter(function (r) { return data.contains(keyOf(r)) }).map(ringOfRow)
  }

  function ringText(ring) {
    return ring.dim + '|' + ring.x + '|' + ring.y + '|' + ring.z + '|' + ring.fx + '|' + ring.fz
  }

  function plainRing(ring) {
    return { dim: String(ring.dim), x: Number(ring.x), y: Number(ring.y), z: Number(ring.z), fx: Number(ring.fx), fz: Number(ring.fz) }
  }

  // ------------------------------------------------------------ relay coordinates

  // label: a place (its name in uhv_gate_lang.js) or 'home' (the ring that sent the jump)
  function coordinates(label, ring) {
    var c = cls()
    var t = table()
    var tag = new c.Compound()
    tag.putString(TAG, ringText(ring))
    var display = new c.Compound()
    display.putString('Name', JSON.stringify({ translate: 'grindless.relay_coordinates.name', 'with': [{ translate: 'grindless.relay_coordinates.' + label }],
      italic: false }))
    var lore = new c.List()
    lore.add(c.Str.valueOf(JSON.stringify({ text: ring.dim + ' ' + ring.x + ' ' + ring.y + ' ' + ring.z, color: 'gray', italic: false })))
    display.put('Lore', lore)
    tag.put('display', display)
    return Item.of(String((t && t.ring.selector) || 'gtceu:data_stick'), 1, tag)
  }

  // the ring a stack's coordinates name, or null
  function coordinatesOf(stack) {
    if (!stack || stack.isEmpty()) return null
    var tag = stack.getNbt()
    if (!tag || !tag.contains(TAG)) return null
    var p = String(tag.getString(TAG)).split('|')
    if (p.length !== 6) return null
    var ring = { dim: p[0], x: Number(p[1]), y: Number(p[2]), z: Number(p[3]), fx: Number(p[4]), fz: Number(p[5]) }
    return isNaN(ring.x + ring.y + ring.z + ring.fx + ring.fz) ? null : ring
  }

  // the formed machine's buses of one kind ('input_bus', 'output_bus'), in position order
  function busesOf(m, kind) {
    var out = []
    m.getParts().forEach(function (p) {
      if (String(p.getDefinition().getId()).indexOf(kind) >= 0) out.push(p)
    })
    out.sort(function (a, b) {
      var pa = a.getPos()
      var pb = b.getPos()
      return (pa.getX() - pb.getX()) || (pa.getY() - pb.getY()) || (pa.getZ() - pb.getZ())
    })
    return out
  }

  // the first coordinates in a gate's input buses (bus order, then slot order), or null
  function selectorIn(m) {
    var buses = busesOf(m, 'input_bus')
    for (var b = 0; b < buses.length; b++) {
      var inv = buses[b].getInventory()
      for (var i = 0; i < inv.getSlots(); i++) {
        var ring = coordinatesOf(inv.getStackInSlot(i))
        if (ring !== null) return ring
      }
    }
    return null
  }

  function putIn(buses, stack) {
    for (var b = 0; b < buses.length; b++) {
      var inv = buses[b].getInventory()
      for (var i = 0; i < inv.getSlots(); i++) {
        if (inv.getStackInSlot(i).isEmpty()) {
          inv.setStackInSlot(i, stack)
          return true
        }
      }
    }
    return false
  }

  // the jump ring's output bus, else its input bus, else the ground in front of its controller
  function deliver(server, ring, stack, what) {
    if (!ring) {
      console.error(LOG + what + ': the jump ring is unknown, coordinates not given')
      return 'nowhere'
    }
    var level = server.getLevel(ring.dim)
    if (!level) {
      console.error(LOG + what + ': no dimension ' + ring.dim + ', coordinates not given')
      return 'nowhere'
    }
    level.getChunk(ring.x >> 4, ring.z >> 4)
    var m = cls().Meta.getMachine(level, blockPos(ring))
    if (m && m.isFormed()) {
      if (putIn(busesOf(m, 'output_bus'), stack)) return 'output bus'
      if (putIn(busesOf(m, 'input_bus'), stack)) return 'input bus'
    }
    cls().Block.popResource(level, blockPos({ x: ring.x + ring.fx, y: ring.y, z: ring.z + ring.fz }), stack)
    return 'ground'
  }

  // ------------------------------------------------------------ the placer

  function cmd(server, dim, text) {
    return Number(server.runCommandSilent('execute in ' + dim + ' run ' + text))
  }

  // getChunk loads the chunk now; the forceload ticket keeps it loaded afterwards
  function forceLoad(server, level, dim, x0, x1, z0, z1) {
    for (var bx = Math.floor(x0 / 16) * 16; bx <= x1; bx += 16) {
      for (var bz = Math.floor(z0 / 16) * 16; bz <= z1; bz += 16) {
        level.getChunk(bx >> 4, bz >> 4)
        cmd(server, dim, 'forceload add ' + bx + ' ' + bz)
      }
    }
  }

  function allows(sym, ability) {
    return !!sym && sym.kind === 'oneOf' && sym.options.some(function (o) { return o.kind === 'part' && o.ability === ability })
  }

  // the block a structure symbol stands for (lib/patterns.js kinds: blocks, frames, air, part, oneOf; controller and any are not placed here)
  function plain(sym, ring) {
    if (sym.kind === 'blocks') return String(sym.blocks[0])
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    if (sym.kind === 'air') return 'minecraft:air'
    if (sym.kind === 'part' && PART_FIELDS[sym.ability] && ring[PART_FIELDS[sym.ability]]) return String(ring[PART_FIELDS[sym.ability]])
    if (sym.kind === 'oneOf') {
      for (var i = 0; i < sym.options.length; i++) {
        var k = sym.options[i].kind
        if (k === 'blocks' || k === 'frames') return plain(sym.options[i], ring)
      }
    }
    throw new Error('unsupported structure symbol ' + sym.kind + (sym.ability ? ' ' + sym.ability : ''))
  }

  // lib/patterns.js: slices back -> front, rows bottom -> top; the controller faces north and the body runs to +z. The ring's energy hatch, input
  // bus and output bus take the first front-wall cells (the controller's slice) that allow them.
  function plan(ring, origin) {
    var desc = (G.structures && G.structures[ring.machine]) || (G.patterns && G.patterns.describe(ring.machine))
    if (!desc) throw new Error('no structure description for ' + ring.machine)
    var ctl = null
    desc.slices.forEach(function (rowsOf, si) {
      rowsOf.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'controller') ctl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (!ctl) throw new Error('no controller in ' + ring.machine)
    var parts = [{ ability: 'energy_input', id: ring.energy, key: 'energy' }, { ability: 'input_bus', id: ring.inputBus, key: 'bus' },
      { ability: 'output_bus', id: ring.outputBus, key: 'out' }]
    var next = 0
    var out = { cells: [], at: {}, min: null, max: null }
    desc.slices.forEach(function (rowsOf, si) {
      rowsOf.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          if (!sym || sym.kind === 'controller' || sym.kind === 'any') continue
          var p = { x: origin.x - (ci - ctl.ci), y: origin.y + ri - ctl.ri, z: origin.z - (si - ctl.si) }
          if (out.min === null) { out.min = { x: p.x, y: p.y, z: p.z }; out.max = { x: p.x, y: p.y, z: p.z } }
          out.min = { x: Math.min(out.min.x, p.x), y: Math.min(out.min.y, p.y), z: Math.min(out.min.z, p.z) }
          out.max = { x: Math.max(out.max.x, p.x), y: Math.max(out.max.y, p.y), z: Math.max(out.max.z, p.z) }
          var id = null
          var facing = false
          if (si === ctl.si && next < parts.length && allows(sym, parts[next].ability)) {
            id = parts[next].id
            out.at[parts[next].key] = p
            facing = true
            next++
          }
          out.cells.push({ p: p, id: id || plain(sym, ring), facing: facing })
        }
      })
    })
    if (next < parts.length) throw new Error('the front wall has no slot for ' + parts[next].ability)
    return out
  }

  function put(server, dim, p, id, facing) {
    cmd(server, dim, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + (facing ? '[facing=north]' : '') + ' replace')
  }

  // the team a platform's hatches are tracked under (B13-DIAL, #238): the team of the player whose travel built it, which is the owner of the warp
  // gate ring that ran the jump (GTM records the placing player), 'server' when the ring has none
  function teamOfRing(machine) {
    try {
      var T = G.teams
      return T && typeof T.ofMachine === 'function' ? String(T.ofMachine(machine)) : 'server'
    } catch (e) {
      return 'server'
    }
  }

  function track(level, list, team) {
    var W = G.wireless
    if (!W || typeof W.track !== 'function') {
      console.error(LOG + 'the wireless network is not loaded: the platform hatches are not tracked')
      return 0
    }
    var n = 0
    list.forEach(function (p) {
      try {
        if (W.track(level, blockPos(p), team ? String(team) : 'server')) n++
      } catch (e) {
        console.error(LOG + 'could not track the hatch at ' + p.x + ',' + p.y + ',' + p.z + ': ' + e)
      }
    })
    return n
  }

  function place(server, row, home, team) {
    var t = table()
    if (!t) throw new Error('no table')
    var ring = t.ring
    var dim = String(row.dimension)
    var level = server.getLevel(dim)
    if (!level) throw new Error('no dimension ' + dim)
    var origin = { x: Number(row.x), y: Number(row.y), z: Number(row.z) }
    var built = plan(ring, origin)
    var dynamo = { x: origin.x + 9, y: origin.y, z: origin.z }
    var kitX = origin.x + 9 + 3
    forceLoad(server, level, dim, built.min.x, Math.max(built.max.x, kitX), built.min.z, built.max.z)
    if (ring.floor) {
      cmd(server, dim, 'fill ' + built.min.x + ' ' + (built.min.y - 1) + ' ' + built.min.z + ' ' + Math.max(built.max.x, kitX) + ' ' + (built.min.y - 1) + ' ' +
        built.max.z + ' ' + ring.floor + ' keep')
    }
    // one fill clears the ring's box (its air cells included), then every other cell is set
    cmd(server, dim, 'fill ' + built.min.x + ' ' + built.min.y + ' ' + built.min.z + ' ' + built.max.x + ' ' + built.max.y + ' ' + built.max.z + ' minecraft:air replace')
    built.cells.forEach(function (c) { if (c.id !== 'minecraft:air') put(server, dim, c.p, c.id, c.facing) })
    put(server, dim, origin, ring.machine, true)
    put(server, dim, dynamo, ring.dynamo, true)
    var ae2 = ring.ae2 || []
    ae2.forEach(function (id, i) { put(server, dim, { x: kitX, y: origin.y + i, z: origin.z }, id, false) })
    var tracked = track(level, [built.at.energy, dynamo], team)
    var bus = cls().Meta.getMachine(level, blockPos(built.at.bus))
    if (!bus) throw new Error('no input bus at ' + built.at.bus.x + ',' + built.at.bus.y + ',' + built.at.bus.z)
    var inv = bus.getInventory()
    if (ring.stock) inv.setStackInSlot(0, Item.of(ring.stock.id, ring.stock.count))
    if (home) inv.setStackInSlot(1, coordinates('home', home))
    bus.getCircuitInventory().setStackInSlot(0, cls().Circuit.stack(Number(ring.circuit || 2)))
    var ctrl = cls().Meta.getMachine(level, blockPos(origin))
    if (!ctrl) throw new Error('no controller at ' + origin.x + ',' + origin.y + ',' + origin.z)
    ctrl.getRecipeLogic().setWorkingEnabled(false)
    server.persistentData.putString(keyOf(row), dim + '@' + origin.x + ',' + origin.y + ',' + origin.z)
    R.placed[row.place] = true
    console.info(LOG + 'platform placed: ' + row.place + ' in ' + dim + ' at ' + origin.x + ',' + origin.y + ',' + origin.z + ', ' + built.cells.length +
      ' cells, hatches tracked ' + tracked + ', way back ' + (home ? ringText(home) : 'none') + ', paused')
    return built
  }

  // ------------------------------------------------------------ the queue

  function due(server) {
    var data = server.persistentData
    if (!data || !data.contains(DUE_KEY)) return []
    try {
      var list = JSON.parse(String(data.getString(DUE_KEY)))
      return Array.isArray(list) ? list : []
    } catch (e) {
      console.error(LOG + DUE_KEY + ' is not a list: ' + e)
      return []
    }
  }

  function saveDue(server, list) {
    var data = server.persistentData
    if (list.length === 0) {
      if (data.contains(DUE_KEY)) data.remove(DUE_KEY)
      return
    }
    data.putString(DUE_KEY, JSON.stringify(list))
  }

  function enqueue(server, place, ring, team) {
    var list = due(server)
    list.push({ p: String(place), r: ring ? plainRing(ring) : null, t: team ? String(team) : 'server' })
    saveDue(server, list)
  }

  // WG.onFinished: a completed warp gate run (startup uhv/gate.js finishRun)
  function onFinished(machine, id) {
    var name = String(id).substring(String(id).lastIndexOf('/') + 1)
    var row = rowOfJump(name)
    if (row === null) return
    var ring = typeof WG.ringOf === 'function' ? WG.ringOf(machine) : null
    enqueue(machine.getLevel().getServer(), row.place, ring, teamOfRing(machine))
    console.info(LOG + 'jump ' + name + ' completed' + (ring ? ' at ' + ringText(ring) : '') + ': ' + row.place + ' queued')
  }
  WG.onFinished = onFinished

  // one queued jump: the platform once, then the coordinates
  function serve(server, e) {
    var row = rowOf(e.p)
    if (row === null) {
      console.error(LOG + 'queued place ' + e.p + ' has no row in ' + TABLE + ': dropped')
      return
    }
    var fresh = !server.persistentData.contains(keyOf(row))
    if (fresh) place(server, row, e.r, e.t)
    var where = deliver(server, e.r, coordinates(String(row.place), ringOfRow(row)), row.place)
    console.info(LOG + row.place + (fresh ? '' : ' already has its platform') + ': coordinates to the ' + where)
  }

  function step(server) {
    var list = due(server)
    if (list.length === 0) return
    var now = Number(server.getTickCount())
    for (var i = 0; i < list.length; i++) {
      var e = list[i]
      var wait = R.retryAt[String(e.p)]
      if (wait !== undefined && now < Number(wait)) continue
      try {
        serve(server, e)
        delete R.retryAt[String(e.p)]
        list.splice(i, 1)
        saveDue(server, list)
      } catch (err) {
        R.retryAt[String(e.p)] = now + RETRY
        console.error(LOG + 'platform ' + e.p + ' failed, retried in ' + RETRY + ' ticks: ' + err)
      }
      return
    }
  }

  // a fresh boot's memory (the tests' restart case): what is kept is in persistent data
  function reset() {
    Object.keys(R.placed).forEach(function (k) { delete R.placed[k] })
    R.retryAt = {}
    R.tableData = null
  }

  R.rows = rows
  R.ring = function () {
    var t = table()
    return t ? t.ring : null
  }
  R.rowOf = rowOf
  R.rowOfJump = rowOfJump
  R.keyOf = keyOf
  R.ringOfRow = ringOfRow
  R.placedRings = placedRings
  R.due = due
  R.enqueue = enqueue
  R.onFinished = onFinished
  R.step = step
  R.place = place
  R.plan = plan
  R.coordinates = coordinates
  R.coordinatesOf = coordinatesOf
  R.selectorIn = selectorIn
  R.reset = reset

  ServerEvents.tick(function (event) {
    var server = event.server
    if (Number(server.getTickCount()) % PERIOD !== 0) return
    try {
      step(server)
    } catch (e) {
      console.error(LOG + 'relay step: ' + e)
    }
  })
})()
