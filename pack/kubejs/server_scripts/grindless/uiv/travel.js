// priority: -24680
// UIV-B1: the arrival platforms of the c4-c6 jumps (UIV-S0-2, S0-4). The gate's startup hook records every run but has no after-working hook, so this
// script polls the gate's runs at Sirius B's orbit, reads the running recipe's id, and when a hold_<place> jump has run its full time it places that
// place's platform in the far dimension: a pre-formed warp gate ring (wireless energy hatch, stocked input bus, output bus), a wireless dynamo
// hatch and an AE2 controller with a drive. Rows: tables/relay_platforms.json. The place is remembered in the world's persistent data and its chunks
// are force-loaded (S0-4), so the platform survives a save and a restart and nobody has to be there.
(function () {
  var G = global.grindless || (global.grindless = {})
  var LOG = '[grindless/uiv] '
  var TABLE = 'kubejs/data/grindless/tables/relay_platforms.json'
  var SOURCE = 'grindless:sirius_b_orbit'
  var PERIOD = 10
  var T = G.uivTravel || (G.uivTravel = {})
  T.pending = T.pending || {}
  T.placed = T.placed || {}
  var C = null

  function classes() {
    if (C !== null) return C
    C = { Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'), Pos: Java.loadClass('net.minecraft.core.BlockPos') }
    return C
  }

  function rows() {
    var t = G.readJsonTable(TABLE)
    return t && t.platforms ? t : null
  }

  function cmd(server, dim, text) {
    return Number(server.runCommandSilent('execute in ' + dim + ' run ' + text))
  }

  // getChunk loads the chunk now; the forceload ticket keeps it loaded afterwards
  function forceLoad(server, dim, x, z) {
    var level = server.getLevel(dim)
    for (var bx = Math.floor((x - 8) / 16) * 16; bx <= x + 14; bx += 16) {
      for (var bz = Math.floor(z / 16) * 16; bz <= z + 15; bz += 16) {
        level.getChunk(bx >> 4, bz >> 4)
        cmd(server, dim, 'forceload add ' + bx + ' ' + bz)
      }
    }
  }

  function allows(sym, ability) {
    return !!sym && sym.kind === 'oneOf' && sym.options.some(function (o) { return o.kind === 'part' && o.ability === ability })
  }

  function plain(sym) {
    if (sym.kind === 'blocks') return String(sym.blocks[0])
    if (sym.kind === 'oneOf') {
      for (var i = 0; i < sym.options.length; i++) if (sym.options[i].kind === 'blocks') return String(sym.options[i].blocks[0])
    }
    throw new Error('unsupported structural symbol ' + sym.kind)
  }

  // lib/patterns.js: slices back -> front, rows bottom -> top; the controller faces north and the body runs to +z. Parts go on the front wall's floor.
  function plan(def, ring, origin) {
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
    var out = { cells: [], at: {} }
    desc.slices.forEach(function (rowsOf, si) {
      rowsOf.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          if (!sym || sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') continue
          var p = { x: origin.x - (ci - ctl.ci), y: origin.y + ri - ctl.ri, z: origin.z - (si - ctl.si) }
          var id = null
          var facing = false
          if (si === ctl.si && next < parts.length && allows(sym, parts[next].ability)) {
            id = parts[next].id
            out.at[parts[next].key] = p
            facing = true
            next++
          }
          out.cells.push({ p: p, id: id || plain(sym), facing: facing })
        }
      })
    })
    if (next < parts.length) throw new Error('the front wall has no slot for ' + parts[next].ability)
    return out
  }

  function put(server, dim, p, id, facing) {
    cmd(server, dim, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + (facing ? '[facing=north]' : '') + ' replace')
  }

  function place(server, t, row) {
    var ring = t.ring
    var dim = String(row.dimension)
    var level = server.getLevel(dim)
    if (!level) throw new Error('no dimension ' + dim)
    var origin = { x: row.x, y: row.y, z: row.z }
    forceLoad(server, dim, row.x, row.z)
    var built = plan(row, ring, origin)
    built.cells.forEach(function (c) { put(server, dim, c.p, c.id, c.facing) })
    put(server, dim, origin, ring.machine, true)
    put(server, dim, { x: row.x + 9, y: row.y, z: row.z }, ring.dynamo, true)
    var ae2 = ring.ae2 || []
    ae2.forEach(function (id, i) { put(server, dim, { x: row.x + 12, y: row.y + i, z: row.z }, id, false) })
    var stocked = false
    try {
      var bus = classes().Meta.getMachine(level, new (classes().Pos)(built.at.bus.x, built.at.bus.y, built.at.bus.z))
      if (bus && ring.stock) {
        bus.getInventory().setStackInSlot(0, Item.of(ring.stock.id, ring.stock.count))
        stocked = true
      }
    } catch (e) {
      console.error(LOG + 'platform ' + row.place + ': could not stock the input bus: ' + e)
    }
    server.persistentData.putString('uivPlatform_' + row.place, dim + '@' + row.x + ',' + row.y + ',' + row.z)
    T.placed[row.place] = true
    console.info(LOG + 'platform placed: ' + row.place + ' in ' + dim + ' at ' + row.x + ',' + row.y + ',' + row.z + ', bus stocked ' + stocked)
  }

  function runName(level, rec) {
    var m = classes().Meta.getMachine(level, new (classes().Pos)(rec.x, rec.y, rec.z))
    if (!m) return null
    var r = m.getRecipeLogic().getLastRecipe()
    if (!r) return null
    var id = String(r.id)
    return id.substring(id.lastIndexOf('/') + 1)
  }

  function poll(server) {
    var t = rows()
    if (!t || !G.warpGate || !G.warpGate.gates) return
    var level = server.getLevel(SOURCE)
    if (!level) return
    var now = Number(level.getTime())
    Object.keys(G.warpGate.gates).forEach(function (k) {
      var rec = G.warpGate.gates[k]
      if (rec.dim !== SOURCE || rec.sustain) return
      var pk = k + '|' + rec.until
      if (T.pending[pk]) return
      var name = runName(level, rec)
      var row = null
      t.platforms.forEach(function (r) { if (r.jump === name) row = r })
      if (row) T.pending[pk] = { place: row.place, x: rec.x, y: rec.y, z: rec.z, until: rec.until }
    })
    Object.keys(T.pending).forEach(function (pk) {
      var p = T.pending[pk]
      if (now < p.until) return
      delete T.pending[pk]
      var m = classes().Meta.getMachine(level, new (classes().Pos)(p.x, p.y, p.z))
      if (!m || !m.isFormed()) { console.info(LOG + 'jump to ' + p.place + ' ended with the gate unformed: no platform'); return }
      if (server.persistentData.contains('uivPlatform_' + p.place)) return
      t.platforms.forEach(function (row) {
        if (row.place !== p.place) return
        try { place(server, t, row) } catch (e) { console.error(LOG + 'platform ' + row.place + ' failed: ' + e) }
      })
    })
  }

  ServerEvents.tick(function (event) {
    if (event.server.tickCount % PERIOD !== 0) return
    try { poll(event.server) } catch (e) { console.error(LOG + 'platform poll: ' + e) }
  })
})()
