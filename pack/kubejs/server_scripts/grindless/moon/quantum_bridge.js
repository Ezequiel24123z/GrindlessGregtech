// -----------------------------------------------------------------------------------------------
// The Earth-Moon quantum bridge (DECISIONS.md 2026-10-24: one half made at each end; you go once, then it works by itself).
// AE2's quantum bridges link two chambers whose entangled singularities share a frequency, in any dimension. Two kinds of pairs:
//   Earth pairs     AE2's LV ritual (singularity + ender dust or pearl, explosion): they keep working anywhere on Earth, as before.
//   Earth-Moon pairs the same ritual with a Lunar Quantum Seed (made only on the Moon) instead of the ender dust (moon/crafting.js):
//                   AE2 gives them their frequency and the recipe marks them grindless_planet: "moon".
// A quantum link chamber outside Earth (data/grindless/tables/planets.json) only keeps a singularity marked for its own planet:
// every PERIOD ticks (one second) this script looks at the chambers placed outside Earth and pushes any other singularity out (it
// drops on top of the chamber) with a message to the players nearby. Until then (at most a second) AE2 links the pair as usual.
// The Earth chamber of an Earth-Moon pair is a normal chamber.
// Chambers are found from their placement (BlockEvents.placed, kept in the server's persistent data, so they survive restarts);
// a chamber that is gone is forgotten. Chunks that are not loaded are skipped (an unloaded bridge does not link either).
// Published as global.grindless.moon.quantum for the smoke test: { track(level, pos), check(server), allowed(stack, dimension), tracked(server) }.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  const G = global.grindless
  const MOON = G.moon || (G.moon = {})
  const KEY = 'grindless_off_earth_quantum_links'
  const NBT_KEY = 'grindless_planet'
  const PERIOD = 20
  const CHAMBER = 'ae2:quantum_link'

  function list(server) {
    var raw = server.persistentData.getString(KEY)
    if (!raw) return []
    try {
      return JSON.parse(String(raw))
    } catch (e) {
      return []
    }
  }

  function save(server, entries) {
    server.persistentData.putString(KEY, JSON.stringify(entries))
  }

  function track(level, pos) {
    var dim = G.planets.dimensionOf(level)
    if (G.planets.isEarth(dim)) return false
    var server = level.server
    var entries = list(server)
    var x = pos.getX()
    var y = pos.getY()
    var z = pos.getZ()
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i]
      if (e.d === dim && e.x === x && e.y === y && e.z === z) return true
    }
    entries.push({ d: dim, x: x, y: y, z: z })
    save(server, entries)
    return true
  }

  // the planet a singularity is entangled for ('' = an Earth pair). KubeJS hides ItemStack#getTag from scripts: getNbt() is the same tag
  function markOf(stack) {
    var tag = stack.getNbt()
    if (tag == null || !tag.contains(NBT_KEY)) return ''
    return String(tag.getString(NBT_KEY))
  }

  function allowed(stack, dimension) {
    var planet = G.planets.planetOf(dimension)
    if (planet === 'earth') return true
    var def = G.planets.table.planets[planet]
    var mark = markOf(stack)
    return !!def && !!def.pairTag && mark === def.pairTag
  }

  function tell(level, pos, planet) {
    var def = G.planets.table.planets[planet]
    var where = def && def.name ? Text.translate('planet.grindless.' + planet) : Text.of(planet)
    level.getPlayers().forEach(function (p) {
      if (p.blockPosition().distSqr(pos) <= 32 * 32) {
        p.tell(Text.translate('message.grindless.quantum_link_earth_pair', where).gold())
      }
    })
  }

  // returns what it did: { checked, ejected, forgotten }
  function check(server) {
    var entries = list(server)
    var keep = []
    var out = { checked: 0, ejected: 0, forgotten: 0 }
    var BlockPos = Java.loadClass('net.minecraft.core.BlockPos')
    entries.forEach(function (e) {
      var level = server.getLevel(e.d)
      if (level == null) { keep.push(e); return }
      var pos = new BlockPos(e.x, e.y, e.z)
      if (!level.isLoaded(pos)) { keep.push(e); return }
      if (String(level.getBlock(pos).id) !== CHAMBER) { out.forgotten++; return }
      keep.push(e)
      out.checked++
      var be = level.getBlockEntity(pos)
      if (be == null) return
      var inv = be.getInternalInventory()
      var stack = inv.getStackInSlot(0)
      if (stack.isEmpty() || allowed(stack, e.d)) return
      var copy = stack.copy()
      inv.setItemDirect(0, Item.empty)
      level.getBlock(pos.above()).popItem(copy)
      out.ejected++
      tell(level, pos, G.planets.planetOf(e.d))
    })
    if (out.forgotten > 0) save(server, keep)
    return out
  }

  MOON.quantum = {
    nbtKey: NBT_KEY,
    period: PERIOD,
    track: track,
    check: check,
    allowed: allowed,
    tracked: function (server) { return list(server) }
  }

  BlockEvents.placed(CHAMBER, function (event) {
    track(event.level, event.block.pos)
  })

  ServerEvents.tick(function (event) {
    var server = event.server
    if (server.getTickCount() % PERIOD !== 0) return
    try {
      check(server)
    } catch (e) {
      console.error('[grindless/moon] quantum link check failed: ' + e)
    }
  })
})()
