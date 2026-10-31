// priority: -26180
// UXV-B1, the Kerr sling (docs/eras/uxv.md "B1. The Kerr sling"). Two parts:
//
//   1. The Whipple shield, the jump item of c9: an assembly line row (never crafting) that fits a bumper weave and a RHEA plate on a Whipple shield
//      casing. It is a part, so it needs no research.
//   2. The arrival platforms of the c8 and c9 jumps from Cygnus X-1's orbit. UIV-B1's script polls only the gates at Sirius B, so this one polls
//      the gates at Cygnus X-1 and, when a hold_vela_pulsar or hold_cas_a run has lasted its full time, places that place's platform from
//      tables/relay_platforms.json (rows with a "source"): a pre-formed warp gate ring, a wireless dynamo hatch and an AE2 controller with a drive,
//      its chunks force-loaded and the place remembered in the world's persistent data (uxvPlatform_<place>). It is UIV-B1's kit, compacted.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var G = global.grindless || (global.grindless = {})
  var LOG = '[grindless/uxv] '
  var TABLE = 'kubejs/data/grindless/tables/relay_platforms.json'
  var PERIOD = 10
  var K = G.uxvKerrSling || (G.uxvKerrSling = {})
  K.pending = K.pending || {}
  K.placed = K.placed || {}
  K.skipped = K.skipped || []
  var C = null

  // ------------------------------------------------------------ the Whipple shield

  var SHIELD_PARTS = ['grindless:whipple_shield_casing', 'gtceu:rhea_plate', 'grindless:cnt_bumper_weave', 'grindless:cnt_whipple_shield']

  ServerEvents.recipes(function (event) {
    var missing = SHIELD_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      K.skipped.push({ name: 'whipple_shield', reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'whipple shield skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:whipple_shield')
    b.itemInputs('grindless:whipple_shield_casing')
    b.itemInputs('2x gtceu:rhea_plate')
    b.itemInputs('4x grindless:cnt_bumper_weave')
    b.inputFluids(Fluid.of('gtceu:soldering_alloy', 144))
    b.itemOutputs('grindless:cnt_whipple_shield')
    b.EUt(1966080).duration(600)
  })

  // ------------------------------------------------------------ the platforms

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
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    if (sym.kind === 'oneOf') {
      for (var i = 0; i < sym.options.length; i++) if (sym.options[i].kind === 'blocks') return String(sym.options[i].blocks[0])
    }
    throw new Error('unsupported structural symbol ' + sym.kind)
  }

  // lib/patterns.js: slices back -> front, rows bottom -> top; the controller faces north and the body runs to +z. Parts go on the front wall's floor.
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
    var built = plan(ring, origin)
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
    server.persistentData.putString('uxvPlatform_' + row.place, dim + '@' + row.x + ',' + row.y + ',' + row.z)
    K.placed[row.place] = true
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
    var mine = t.platforms.filter(function (r) { return !!r.source })
    var sources = []
    mine.forEach(function (r) { if (sources.indexOf(String(r.source)) < 0) sources.push(String(r.source)) })
    sources.forEach(function (src) { pollSource(server, t, mine, src) })
  }

  // MAX-T2 (S0-11): each source place resolves its own rows, so the belt row (source Sgr A*) is served like the Cygnus X-1 rows
  function pollSource(server, t, rows0, source) {
    var mine = rows0.filter(function (r) { return String(r.source) === source })
    var level = server.getLevel(source)
    if (!level) return
    var now = Number(level.getTime())
    Object.keys(G.warpGate.gates).forEach(function (k) {
      var rec = G.warpGate.gates[k]
      if (rec.dim !== source || rec.sustain) return
      var pk = k + '|' + rec.until
      if (K.pending[pk]) return
      var name = runName(level, rec)
      var row = null
      mine.forEach(function (r) { if (r.jump === name) row = r })
      if (row) K.pending[pk] = { place: row.place, x: rec.x, y: rec.y, z: rec.z, until: rec.until, source: source }
    })
    Object.keys(K.pending).forEach(function (pk) {
      var p = K.pending[pk]
      if (p.source !== source || now < p.until) return
      delete K.pending[pk]
      var m = classes().Meta.getMachine(level, new (classes().Pos)(p.x, p.y, p.z))
      if (!m || !m.isFormed()) { console.info(LOG + 'jump to ' + p.place + ' ended with the gate unformed: no platform'); return }
      if (server.persistentData.contains('uxvPlatform_' + p.place)) return
      mine.forEach(function (row) {
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
