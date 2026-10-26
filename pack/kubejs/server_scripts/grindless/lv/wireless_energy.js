// -----------------------------------------------------------------------------------------------
// LV: the wireless energy network (DECISIONS.md 2026-10-25, "Wireless energy"; docs/eras/lv.md, "Wireless energy"). The blocks, covers
// and the tower are registered in startup_scripts/grindless/lv/wireless_energy.js (global.grindless.wireless); the numbers are in
// kubejs/data/grindless/tables/wireless_energy.json. This script is the network: its store, the settlement, the readout, the covers'
// placing and the recipes.
//
// One network for the whole server, no teams and no frequencies: its stored EU is a long in the server's persistent data, so every
// world (the Overworld, the void, the Nether, the End, the Moon, Mars, Venus, Mercury) puts EU into and takes EU out of the same store.
// The store is the Wireless Energy Towers:
//   - a formed tower adds the capacity of its capacitor cells (read from the formed structure, MultiblockState#getCache), and several
//     towers add up. An unloaded tower keeps counting (what it had the last time it was loaded is recorded); a broken or unformed one
//     stops. With no formed tower with cells the network does nothing: producers back up and the readout says "no tower".
//   - the network's tier is the lowest tier among the cells of every formed tower: wireless energy hatches and covers above it get
//     nothing (their readout says why); energy going in is not tier-limited. Swapping a cell unforms its tower (GTM's own structure
//     check); the stored EU stays, and if it is above the new capacity deposits stop until it drains. Nothing is destroyed.
// The loss: 5% on the way in. A dynamo hatch or cover that gives X EU puts 19/20 X in the network; X is taken in whole multiples of 20
// EU (the rest waits in the hatch for the next settlement) so the store gets whole EU.
// The settlement: every 10 ticks (GTM 7.5.3's energy input hatch holds 16 ticks of its full rate, EnergyHatchPartMachine) this script
// walks the tracked blocks once (GTNH's WirelessEnergyHatchManager pattern: one central list, one pass, prune what is gone): towers
// first, then deposits (wireless dynamo hatches and dynamo covers, as far as the network has room), then withdrawals (wireless energy
// hatches and energy covers at or below the network's tier, topped up; when the store is short it is shared in proportion to what each
// one lacks). Blocks in unloaded chunks are skipped and pick up where they left off. The hatches are GTM's EnergyHatchPartMachine; a
// cover moves at most 2 A of its voltage per tick. How EU goes into and out of a machine is lib/wireless_adapters.js: by the exact
// class of its energy container, plain containers (NotifiableEnergyContainer, RecipeAmperageEnergyContainer) through changeEnergy, a
// battery buffer's or charger's items through GTM's own charge and discharge calls (their containers report the items' charge, and the
// changeEnergy they inherit writes a separate buffer), anything else not at all (a cover is refused on it). Every move is checked
// against the stored EU; a block whose move fails is set aside with an error in the log, and a failure can lose EU, never make it.
// The covers: a cover item right-clicked on a single-block machine goes on through GTM's own ICoverable#placeCoverOnSide (the side
// GTM's own cover items pick, ICoverable#rayTraceCoverableSide); an energy cover needs a machine that takes EU at its tier or above, a
// dynamo cover a machine that gives EU at its tier or below. A crowbar takes it off and GTM gives the item back.
// The readout: shift + right-click a wireless hatch, a tower or a covered machine with an empty hand: the network's stored EU,
// capacity and tier, and the last second's flow in and out, in the action bar.
// Tracking: BlockEvents.placed (hatches, towers), the covers' placing, the shift-click (a block the list does not have yet); a block
// that is gone, a cover that is off, and BlockEvents.broken are forgotten. The list lives in persistent data as an NBT list of
// compounds (lib/wireless_registry.js: no size limit; the first version's single JSON string is converted once, and kept aside).
//
// Published on global.grindless.wireless (the startup object) for the tower's display and the smoke tests
// (tools/test/overlay/kubejs/server_scripts/gg_test_wireless_*.js): track, trackCover, placeCover, forget, tracked, settle, status,
// towerInfo, stored, setStored, totals, flows, faults, perTick, readout, recipes, classify, blocksFromTag, dropCache, and the keys
// blocksKey, storeKey, legacyKey.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  const G = global.grindless || (global.grindless = {})
  const W = G.wireless
  if (!W || !W.table || !W.hatches || !W.covers) throw new Error('[grindless/wireless] startup_scripts/grindless/lv/wireless_energy.js did not run')
  const LOG = '[grindless/wireless] '
  const BLOCKS_KEY = 'grindless_wireless_blocks'
  const STORE_KEY = 'grindless_wireless_stored'
  const WINDOW = Math.max(1, Math.round(20 / W.settleTicks))

  W.blocksKey = BLOCKS_KEY
  W.storeKey = STORE_KEY
  // running totals since the server started (or the smoke test reset them): EU drained from producers, EU that reached the store, the
  // 5% lost, EU handed to consumers; flows: the same per tracked block (key d|x|y|z|side)
  W.totals = W.totals || { drained: 0, in: 0, lost: 0, out: 0, settlements: 0 }
  W.flows = W.flows || {}

  function flowKey(e) {
    return e.d + '|' + e.x + '|' + e.y + '|' + e.z + '|' + (e.s || '')
  }

  function flow(e) {
    var k = flowKey(e)
    if (!W.flows[k]) W.flows[k] = { drained: 0, in: 0, filled: 0 }
    return W.flows[k]
  }
  W.flowKey = flowKey

  var C = null
  function lazy() {
    if (C === null) {
      C = {
        BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
        Direction: Java.loadClass('net.minecraft.core.Direction'),
        RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
        MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
        ICoverable: Java.loadClass('com.gregtechceu.gtceu.api.capability.ICoverable'),
        GTUtil: Java.loadClass('com.gregtechceu.gtceu.utils.GTUtil'),
        FU: Java.loadClass('com.gregtechceu.gtceu.utils.FormattingUtil'),
        UUID: Java.loadClass('java.util.UUID')
      }
    }
    return C
  }

  function dimensionOf(level) {
    var d = level.dimension
    return String(typeof d === 'function' ? level.dimension().location() : d)
  }

  function machineAt(level, pos) {
    var m = lazy().MetaMachine.getMachine(level, pos)
    return m === null || m === undefined ? null : m
  }

  function tierName(tier) {
    return String((W.tierLabels && W.tierLabels[tier]) || String(W.tierNames[tier] || '?').toUpperCase())
  }

  function tierOfVoltage(v) {
    return Number(lazy().GTUtil.getTierByVoltage(v))
  }

  // ---------------------------------------------------------------- the list
  // lib/wireless_registry.js keeps it in persistent data as an NBT list of compounds (no size limit) and gives every entry its field
  // order: towers { k: 'tower', d, x, y, z, f: formed, c: capacity, t: tier (0 = no cells), n: cells }; hatches { k: 'hatch' | 'dynamo',
  // d, x, y, z, t: tier, a: amps }; covers { k: 'cover', d, x, y, z, s: side, ck: 'energy' | 'dynamo', t: tier }. An entry it cannot use
  // is kept as { bad, tag } and written back unchanged; the network skips it.

  const R = G.wirelessRegistry
  if (!R) throw new Error('[grindless/wireless] server_scripts/grindless/lib/wireless_registry.js did not run')
  const LEGACY_KEY = 'grindless_wireless_blocks_legacy'
  W.legacyKey = LEGACY_KEY

  // the parsed list and the persistent-data tag it was read from or written as
  var cache = { tag: null, list: null }

  function blocks(server) {
    var pd = server.persistentData
    if (cache.list !== null && pd.get(BLOCKS_KEY) === cache.tag) return cache.list
    var r = R.read(pd, BLOCKS_KEY, LEGACY_KEY)
    r.notes.forEach(function (n) { console.error(LOG + 'the list of wireless blocks: ' + n) })
    cache.tag = pd.get(BLOCKS_KEY)
    cache.list = r.list
    return r.list
  }

  function saveBlocks(server, list) {
    var tag = R.write(list)
    server.persistentData.put(BLOCKS_KEY, tag)
    cache.tag = tag
    cache.list = list
  }

  function same(e, d, x, y, z, s) {
    return e.d === d && e.x === x && e.y === y && e.z === z && (s === undefined || e.s === s)
  }

  // adds or updates one entry (matched by place, and by side for covers); the entry is checked and put in its field order first
  function upsert(server, entry) {
    entry = R.canon(entry)
    var list = blocks(server).slice()
    for (var i = 0; i < list.length; i++) {
      var e = list[i]
      if (e.bad) continue
      if (same(e, entry.d, entry.x, entry.y, entry.z, entry.k === 'cover' ? entry.s : undefined) && (e.k === 'cover') === (entry.k === 'cover')) {
        if (JSON.stringify(e) === JSON.stringify(entry)) return e
        list[i] = entry
        saveBlocks(server, list)
        return entry
      }
    }
    list.push(entry)
    saveBlocks(server, list)
    return entry
  }

  // the block at pos (a wireless hatch or a tower controller): adds it. Returns the entry, or null when it is neither.
  function track(level, pos) {
    var id = String(level.getBlock(pos).id)
    var base = { d: dimensionOf(level), x: Number(pos.getX()), y: Number(pos.getY()), z: Number(pos.getZ()) }
    if (id === W.towerId) {
      var info = towerInfo(machineAt(level, pos))
      if (info.pending) {
        // loaded formed, not checked again yet: what was recorded stands (the settlement reads it once GTM has checked it)
        var known = blocks(level.server).filter(function (e) { return !e.bad && e.k === 'tower' && same(e, base.d, base.x, base.y, base.z) })[0]
        if (known) return known
        info = { formed: false, cells: 0, capacity: 0, tier: 0 }
      }
      base.k = 'tower'
      base.f = info.formed
      base.c = info.capacity
      base.t = info.tier
      base.n = info.cells
      return upsert(level.server, base)
    }
    var h = W.hatches[id]
    if (!h) return null
    base.k = h.kind
    base.t = h.tier
    base.a = h.amps
    return upsert(level.server, base)
  }

  function trackCover(level, pos, side, cover) {
    return upsert(level.server, { k: 'cover', d: dimensionOf(level), x: Number(pos.getX()), y: Number(pos.getY()), z: Number(pos.getZ()),
      s: String(side.getName()), ck: cover.kind, t: cover.tier })
  }

  // forgets what is at pos (every side's cover too)
  function forget(level, pos) {
    var server = level.server
    var d = dimensionOf(level)
    var x = Number(pos.getX())
    var y = Number(pos.getY())
    var z = Number(pos.getZ())
    var list = blocks(server)
    var keep = list.filter(function (e) { return e.bad || !same(e, d, x, y, z) })
    if (keep.length === list.length) return false
    saveBlocks(server, keep)
    return true
  }

  // ---------------------------------------------------------------- the store

  function stored(server) {
    return Number(server.persistentData.getLong(STORE_KEY))
  }

  function setStored(server, eu) {
    server.persistentData.putLong(STORE_KEY, Math.max(0, Math.floor(eu)))
  }

  // ---------------------------------------------------------------- towers

  // a tower's cells, read from GTM's formed structure: { formed, cells, capacity, tier (the weakest, 0 = none), byTier }. pending: the
  // controller was loaded formed (GTM saves isFormed) but has not checked its structure again yet (its MultiblockState has no cache
  // until GTM's async check, about a second after the load): its cells are unknown, so the recorded ones still count
  function towerInfo(ctrl) {
    var out = { formed: false, cells: 0, capacity: 0, tier: 0, byTier: {} }
    if (ctrl === null || ctrl === undefined || typeof ctrl.isFormed !== 'function' || !ctrl.isFormed()) return out
    out.formed = true
    var ms = ctrl.getMultiblockState()
    if (ms.cache === null || ms.cache === undefined) {
      out.pending = true
      return out
    }
    var level = ctrl.getLevel()
    var it = ms.getCache().iterator()
    var weakest = 99
    while (it.hasNext()) {
      var cell = W.cells[String(level.getBlock(it.next()).id)]
      if (!cell) continue
      out.cells++
      out.capacity += cell.capacity
      if (cell.tier < weakest) weakest = cell.tier
      out.byTier[cell.tier] = (out.byTier[cell.tier] || 0) + 1
    }
    out.tier = out.cells > 0 ? weakest : 0
    return out
  }

  // ---------------------------------------------------------------- energy access
  // lib/wireless_adapters.js: the container's exact class picks how EU moves (plain containers through changeEnergy, battery buffers and
  // chargers through their items with GTM's own calls, anything else not at all), and every move is checked against the stored EU.
  // A block whose move fails a check is set aside until the server restarts or it (or its cover) is placed again: W.faults[flow key]
  // holds why, the log has the numbers and its readout says so. The store counts what the machine really moved (the error's measured
  // change), never more: a failure can lose EU, never make it.

  const A = G.wirelessAdapters
  if (!A) throw new Error('[grindless/wireless] server_scripts/grindless/lib/wireless_adapters.js did not run')
  var adapters = null
  function adapter() {
    if (adapters === null) adapters = A.create(A.gtmDeps())
    return adapters
  }
  W.faults = W.faults || {}

  function fault(e, message) {
    var k = flowKey(e)
    if (!W.faults[k]) console.error(LOG + e.k + (e.ck ? ' (' + e.ck + ')' : '') + ' at ' + e.d + ' ' + e.x + ',' + e.y + ',' + e.z + (e.s ? ' ' + e.s : '') +
      ' set aside until the server restarts or the cover is placed again: ' + message)
    W.faults[k] = String(message)
  }

  function shortClass(cls) {
    var parts = String(cls).split('.')
    return parts[parts.length - 1]
  }

  // why a cover can't go (or work) on this machine: '' when it can, else a message key and its arguments
  function coverMisfit(m, cover) {
    var a = adapter().classify(m)
    if (a.kind === 'none') return ['message.grindless.wireless.cover_no_energy']
    if (a.kind === 'unsupported') return ['message.grindless.wireless.cover_unsupported', shortClass(a.cls)]
    var c = a.c
    if (cover.kind === 'energy') {
      var vin = Number(c.getInputVoltage())
      if (!(vin > 0)) return ['message.grindless.wireless.cover_no_input']
      if (cover.tier > tierOfVoltage(vin)) return ['message.grindless.wireless.cover_too_strong', tierName(cover.tier), tierName(tierOfVoltage(vin))]
    } else {
      var vout = Number(c.getOutputVoltage())
      if (!(vout > 0) || (a.kind === 'items' && !a.spec.gives)) return ['message.grindless.wireless.cover_no_output']
      if (cover.tier < tierOfVoltage(vout)) return ['message.grindless.wireless.cover_too_weak', tierName(cover.tier), tierName(tierOfVoltage(vout))]
    }
    return ''
  }

  function coverDefinition(cover) {
    var def = lazy().GTRegistries.COVERS.get(new (lazy().RL)(cover.def))
    if (def === null || def === undefined) def = W.coverDefinitions[cover.def]
    return def === undefined ? null : def
  }

  // a message key and up to two arguments -> the component
  function tr(parts) {
    if (parts.length >= 3) return Text.translate(parts[0], parts[1], parts[2])
    if (parts.length === 2) return Text.translate(parts[0], parts[1])
    return Text.translate(parts[0])
  }

  // ---------------------------------------------------------------- the settlement

  var windowIn = []
  var windowOut = []

  // returns what it did: { tracked, loaded, forgotten, faulted, up, tier, capacity, stored, in, out, lost, drained, towers, skippedAbove }
  function sane(n, max) {
    return typeof n === 'number' && n % 1 === 0 && n >= 0 && n <= max
  }

  function settle(server) {
    var L = lazy()
    var ad = adapter()
    var ticks = W.settleTicks
    var list = blocks(server)
    var keep = []
    var changed = false
    var out = { tracked: list.length, loaded: 0, forgotten: 0, faulted: 0, up: false, tier: 0, capacity: 0, stored: 0, in: 0, out: 0, lost: 0,
      drained: 0, towers: 0, skippedAbove: 0 }
    var deposits = []
    var withdrawals = []
    var towers = []
    list.forEach(function (e) {
      // an entry the list could not read is kept as it was and never used
      if (e.bad) { keep.push(e); return }
      var level = server.getLevel(e.d)
      var pos = new L.BlockPos(e.x, e.y, e.z)
      if (level === null || level === undefined || !level.isLoaded(pos)) {
        keep.push(e)
        if (e.k === 'tower') towers.push(e)
        return
      }
      var id = String(level.getBlock(pos).id)
      if (e.k === 'tower') {
        if (id !== W.towerId) { changed = true; out.forgotten++; return }
        var info = towerInfo(machineAt(level, pos))
        if (!info.pending && (info.formed !== e.f || info.capacity !== e.c || info.tier !== e.t || info.cells !== e.n)) {
          e = R.canon({ k: 'tower', d: e.d, x: e.x, y: e.y, z: e.z, f: info.formed, c: info.capacity, t: info.tier, n: info.cells })
          changed = true
        }
        keep.push(e)
        towers.push(e)
        out.loaded++
        return
      }
      var m = machineAt(level, pos)
      if (e.k === 'cover') {
        var cover = W.covers[W.coverDefId(e.ck, e.t)]
        var side = L.Direction.byName(e.s)
        var on = m === null || side === null ? null : m.getCoverContainer().getCoverAtSide(side)
        if (!cover || on === null || on === undefined || String(on.coverDefinition.getId()) !== cover.def) {
          changed = true
          out.forgotten++
          return
        }
        keep.push(e)
        out.loaded++
        if (W.faults[flowKey(e)]) { out.faulted++; return }
        var misfit = coverMisfit(m, cover)
        if (misfit !== '') {
          // a machine whose energy storage the network cannot use (it was placed before this check, or it changed): set aside
          if (misfit[0] === 'message.grindless.wireless.cover_unsupported') { fault(e, 'unsupported energy container ' + misfit[1]); out.faulted++ }
          return
        }
        var limit = W.rate(e.t, W.coverAmps) * ticks
        if (cover.kind === 'dynamo') deposits.push({ a: ad.classify(m), limit: limit, e: e })
        else withdrawals.push({ a: ad.classify(m), limit: limit, tier: e.t, e: e })
        return
      }
      var h = W.hatches[id]
      if (!h || h.kind !== e.k || h.tier !== e.t || h.amps !== e.a || m === null) {
        changed = true
        out.forgotten++
        return
      }
      keep.push(e)
      out.loaded++
      if (W.faults[flowKey(e)]) { out.faulted++; return }
      var ha = ad.classify(m)
      if (ha.kind !== 'plain') { fault(e, 'the hatch\'s energy container is ' + (ha.cls || 'missing') + ', not GTM\'s NotifiableEnergyContainer'); out.faulted++; return }
      if (h.kind === 'dynamo') deposits.push({ a: ha, limit: Number.MAX_SAFE_INTEGER, e: e })
      else withdrawals.push({ a: ha, limit: Number.MAX_SAFE_INTEGER, tier: e.t, e: e })
    })
    if (changed) saveBlocks(server, keep)

    // the network: the formed towers with cells
    var weakest = 99
    towers.forEach(function (t) {
      if (!t.f || !(t.n > 0)) return
      out.towers++
      out.capacity += t.c
      if (t.t < weakest) weakest = t.t
    })
    out.up = out.towers > 0
    out.tier = out.up ? weakest : 0
    var bank = stored(server)
    var before = bank
    if (out.up) {
      // deposits: whole multiples of 20 EU, as far as the network has room; any tier. A move that fails its check counts what the
      // machine really gave (`measured`), or nothing when that is not a sane number: a failure can lose EU, never make it.
      deposits.forEach(function (d) {
        var room = out.capacity - bank
        if (room <= 0) return
        var gave = 0
        var take = 0
        try {
          take = Math.min(ad.available(d.a, d.limit, ticks), Math.floor(room * W.lossDenominator / W.lossNumerator))
          take -= take % W.lossDenominator
          if (take <= 0) return
          gave = ad.drain(d.a, take, ticks)
        } catch (err) {
          fault(d.e, err.message || err)
          out.faulted++
          gave = sane(err.measured, take) ? err.measured : 0
        }
        var put = Math.floor(gave * W.lossNumerator / W.lossDenominator)
        bank += put
        out.drained += gave
        out.in += put
        out.lost += gave - put
        var fd = flow(d.e)
        fd.drained += gave
        fd.in += put
      })
      // withdrawals at or below the network's tier: topped up, shared in proportion when the store is short
      var takers = []
      var needs = []
      withdrawals.forEach(function (w) {
        if (w.tier > out.tier) { out.skippedAbove++; return }
        try {
          needs.push(ad.room(w.a, w.limit, ticks))
          takers.push(w)
        } catch (err) {
          fault(w.e, err.message || err)
          out.faulted++
        }
      })
      var total = needs.reduce(function (a, b) { return a + b }, 0)
      if (total > 0 && bank > 0) {
        var share = bank >= total ? 1 : bank / total
        takers.forEach(function (w, i) {
          var give = share >= 1 ? needs[i] : Math.floor(needs[i] * share)
          if (give <= 0) return
          var got = 0
          try {
            got = ad.fill(w.a, give, ticks)
          } catch (err) {
            fault(w.e, err.message || err)
            out.faulted++
            // what the machine really took; when that is not a sane number, all of it is charged (the network never gives more than it pays)
            got = sane(err.measured, give) ? err.measured : give
          }
          bank -= got
          out.out += got
          flow(w.e).filled += got
        })
      }
    }
    if (bank !== before) setStored(server, bank)
    out.stored = bank
    W.totals.drained += out.drained
    W.totals.in += out.in
    W.totals.lost += out.lost
    W.totals.out += out.out
    W.totals.settlements++
    windowIn.push(out.in)
    windowOut.push(out.out)
    while (windowIn.length > WINDOW) windowIn.shift()
    while (windowOut.length > WINDOW) windowOut.shift()
    W.last = out
    return out
  }

  // the network now: { up, tier, capacity, stored, towers, inPerSecond, outPerSecond } (EU over the last second)
  function status(server) {
    var last = W.last || { up: false, tier: 0, capacity: 0, towers: 0 }
    var sumIn = windowIn.reduce(function (a, b) { return a + b }, 0)
    var sumOut = windowOut.reduce(function (a, b) { return a + b }, 0)
    return { up: !!last.up, tier: last.tier, capacity: last.capacity, towers: last.towers, stored: stored(server), inPerSecond: sumIn, outPerSecond: sumOut }
  }

  // ---------------------------------------------------------------- the readout

  function fmt(n) {
    return String(lazy().FU.formatNumbers(Math.floor(n)))
  }

  // EU per tick from EU per second, one decimal
  function perTick(euPerSecond) {
    var v = Math.round(euPerSecond / 20 * 10) / 10
    var whole = Math.floor(v)
    var tenth = Math.round((v - whole) * 10)
    return fmt(whole) + (tenth > 0 ? '.' + tenth : '')
  }

  // the action bar line; tier: the tier of the block asked about (0 = none), withdraws: whether it takes from the network
  function readout(server, tier, withdraws) {
    var st = status(server)
    if (!st.up) return Text.translate('message.grindless.wireless.no_tower').gold()
    if (withdraws && tier > st.tier) return Text.translate('message.grindless.wireless.above_tier', tierName(tier), tierName(st.tier)).gold()
    return Text.translate('message.grindless.wireless.readout', tierName(st.tier), fmt(st.stored), fmt(st.capacity), perTick(st.inPerSecond),
      perTick(st.outPerSecond)).aqua()
  }

  // what a shift-click on this block reads: { tier, withdraws, fault } or null when it is no wireless block
  function readoutTarget(level, pos, side) {
    var id = String(level.getBlock(pos).id)
    if (id === W.towerId) {
      track(level, pos)
      return { tier: 0, withdraws: false, fault: '' }
    }
    var h = W.hatches[id]
    if (h) {
      var he = track(level, pos)
      return { tier: h.tier, withdraws: h.kind === 'hatch', fault: he ? (W.faults[flowKey(he)] || '') : '' }
    }
    var m = machineAt(level, pos)
    if (m === null) return null
    var found = null
    var dirs = lazy().Direction.values()
    for (var i = 0; i < dirs.length; i++) {
      var on = m.getCoverContainer().getCoverAtSide(dirs[i])
      if (on === null || on === undefined) continue
      var cover = W.covers[String(on.coverDefinition.getId())]
      if (!cover) continue
      var ce = trackCover(level, pos, dirs[i], cover)
      if (found === null || dirs[i] === side) found = { tier: cover.tier, withdraws: cover.kind === 'energy', fault: W.faults[flowKey(ce)] || '' }
    }
    return found
  }

  function onShiftClick(event) {
    var p = event.player
    var target = readoutTarget(event.level, event.block.pos, event.facing)
    if (target === null) return
    var text = target.fault ? Text.translate('message.grindless.wireless.fault').red() : readout(event.level.server, target.tier, target.withdraws)
    p.setStatusMessage(text)
    var key = ''
    var args = []
    var contents = text.getContents()
    key = String(contents.getKey())
    var a = contents.getArgs()
    for (var i = 0; i < a.length; i++) args.push(String(a[i]))
    W.lastReadout = { player: String(p.getStringUuid()), text: String(text.getString()), key: key, args: args }
  }

  // ---------------------------------------------------------------- the covers

  // puts a cover on a machine's side (the click below, and the smoke test). Returns { ok, message }; the item is used up only by the click.
  function placeCover(level, pos, side, stack, player) {
    var cover = W.coverItems[String(stack.id)]
    if (!cover) return { ok: false, message: 'not a wireless cover' }
    var m = machineAt(level, pos)
    if (m === null) return { ok: false, message: Text.translate('message.grindless.wireless.cover_no_machine') }
    var misfit = coverMisfit(m, cover)
    if (misfit !== '') return { ok: false, message: tr(misfit) }
    var def = coverDefinition(cover)
    if (def === null) return { ok: false, message: 'cover definition ' + cover.def + ' is not registered' }
    var holder = m.getCoverContainer()
    if (holder.getCoverAtSide(side) !== null) return { ok: false, message: Text.translate('message.grindless.wireless.cover_side_taken') }
    if (!holder.placeCoverOnSide(side, stack, def, player)) return { ok: false, message: Text.translate('message.grindless.wireless.cover_cannot') }
    var placed = trackCover(level, pos, side, cover)
    // a cover placed again starts over: whatever set the old one aside is forgiven
    delete W.faults[flowKey(placed)]
    return { ok: true, message: Text.translate('message.grindless.wireless.cover_placed', tierName(cover.tier)) }
  }

  function onCoverClick(event, cover) {
    var p = event.player
    var level = event.level
    var pos = event.block.pos
    if (machineAt(level, pos) === null) return false
    var holder = machineAt(level, pos).getCoverContainer()
    // GTM's own cover items pick the side the player looks at; with no such side, the clicked face
    var side = lazy().ICoverable.rayTraceCoverableSide(holder, p)
    if (side === null || side === undefined) side = event.facing
    var stack = event.item
    var r = placeCover(level, pos, side, stack, p)
    if (r.ok && !p.isCreative()) stack.shrink(1)
    if (r.message) p.setStatusMessage(typeof r.message === 'string' ? Text.of(r.message) : r.message)
    return true
  }

  BlockEvents.rightClicked(function (event) {
    var cancel = false
    try {
      var p = event.player
      if (p === null || p === undefined || String(event.hand) !== 'MAIN_HAND') return
      var item = event.item
      var cover = W.coverItems[String(item.id)]
      if (cover) cancel = onCoverClick(event, cover)
      else if (p.isShiftKeyDown() && item.isEmpty()) onShiftClick(event)
    } catch (e) {
      console.error(LOG + 'right-click failed: ' + e)
    }
    // a cover click never reaches the machine (no GUI opens); event.cancel() ends the handler, so it comes last
    if (cancel) event.cancel()
  })

  // ---------------------------------------------------------------- tracking

  W.hatchIds.concat([W.towerId]).forEach(function (id) {
    BlockEvents.placed(id, function (event) {
      try {
        // a block placed again starts over: whatever set the old one aside is forgiven
        var e = track(event.level, event.block.pos)
        if (e) delete W.faults[flowKey(e)]
      } catch (err) {
        console.error(LOG + 'could not track a placed ' + id + ': ' + err)
      }
    })
    BlockEvents.broken(id, function (event) {
      try {
        forget(event.level, event.block.pos)
      } catch (e) {
        console.error(LOG + 'could not forget a broken ' + id + ': ' + e)
      }
    })
  })

  var failedTick = false
  ServerEvents.tick(function (event) {
    var server = event.server
    if (W.paused || server.getTickCount() % W.settleTicks !== 0) return
    try {
      settle(server)
      failedTick = false
    } catch (e) {
      if (!failedTick) {
        failedTick = true
        console.error(LOG + 'settlement failed: ' + e)
      }
    }
  })

  // ---------------------------------------------------------------- recipes
  // GTM's style, every part from its own tier (the table): the tower is LV (an LV hull, two LV emitters and sensors, LV circuits, ender
  // pearls); a capacitor cell takes six of its tier's batteries (any battery of GTM's tag), a frame, plates and circuits; the 2 A hatches
  // start from GTM's energy or dynamo hatch of the tier with its sensor (energy) or emitter (dynamo), two circuits and the tier's link
  // (ender pearl LV-MV, ender eye HV-EV, quantum eye IV, quantum star LuV); the 4, 16 and 64 A ones from the one below, with two of the
  // tier's quadruple, octal or hex wires and 2, 4 or 6 plates (GTM's energy_input_hatch_4a / 16a recipes); the covers are a sensor
  // (energy) or emitter (dynamo), a plate, a circuit and the link. GTM's EV emitter and sensor need a quantum eye (radon, IV), so EV
  // takes two HV ones (as the pack's EV circuit assembler does); IV takes IV ones, after Mercury (iridium), like GTM's IV hatches.
  // A row with cellMadeBy gets no cell recipe here: its cell is made by that machine (the LuV SMES cell: the HTS magnet works,
  // server_scripts/grindless/luv/hts_magnet_works.js).
  const WIRE = { 4: 'quadruple', 16: 'octal', 64: 'hex' }
  const PLATES = { 4: 2, 16: 4, 64: 6 }

  function recipeList() {
    var out = []
    var lv = W.tierRow[1]
    out.push({ id: 'grindless:assembler/wireless_energy_tower', builderId: 'grindless:wireless_energy_tower', output: W.towerId,
      inputs: ['1x gtceu:lv_machine_hull', '2x ' + lv.emitter, '2x ' + lv.sensor, '4x #gtceu:circuits/lv', '2x ' + lv.link, '4x ' + lv.plate],
      eut: Number(GTValues.VA[1]), duration: 600 })
    W.table.tiers.forEach(function (r) {
      var va = Number(GTValues.VA[r.tier])
      if (!r.cellMadeBy) {
        out.push({ id: 'grindless:assembler/' + r.name + '_capacitor_cell', builderId: 'grindless:' + r.name + '_capacitor_cell', output: r.cell,
          inputs: ['6x ' + r.batteries, '1x ' + r.frame, '4x ' + r.plate, '2x #gtceu:circuits/' + r.name], eut: va, duration: 400 })
      }
      W.hatchKindList.forEach(function (kind) {
        var k = W.hatchKinds[kind]
        var signal = (k.role === 'deposit' ? r.emitter : r.sensor)
        W.hatchAmps.forEach(function (amps) {
          var name = r.name + '_' + W.hatchName(kind, amps)
          var inputs
          if (amps === 2) {
            var gtm = 'gtceu:' + r.name + (kind === 'hatch' ? '_energy_input_hatch' : '_energy_output_hatch')
            inputs = [r.signalParts + 'x ' + signal, '1x ' + gtm, '2x #gtceu:circuits/' + r.name, '1x ' + r.link]
          } else {
            var below = W.hatchAmps[W.hatchAmps.indexOf(amps) - 1]
            inputs = ['1x ' + W.hatchId(kind, r.tier, below), '2x gtceu:' + r.wire + '_' + WIRE[amps] + '_wire', PLATES[amps] + 'x ' + r.plate]
          }
          out.push({ id: 'grindless:assembler/' + name, builderId: 'grindless:' + name, output: W.hatchId(kind, r.tier, amps), inputs: inputs,
            eut: va, duration: amps === 2 ? 200 : 100 * (W.hatchAmps.indexOf(amps) + 1) })
        })
      })
      W.coverKindList.forEach(function (kind) {
        var signal = (W.coverKinds[kind].role === 'deposit' ? r.emitter : r.sensor)
        var item = W.coverItemId(kind, r.tier)
        out.push({ id: 'grindless:assembler/' + r.name + '_' + W.coverKinds[kind].base, builderId: 'grindless:' + r.name + '_' + W.coverKinds[kind].base,
          output: item, inputs: [r.signalParts + 'x ' + signal, '1x ' + r.plate, '1x #gtceu:circuits/' + r.name, '1x ' + r.link], eut: va, duration: 200 })
      })
    })
    return out
  }

  W.recipes = recipeList()

  ServerEvents.recipes(function (event) {
    W.recipes.forEach(function (r) {
      event.recipes.gtceu.assembler(r.builderId)
        .itemInputs(r.inputs)
        .itemOutputs(r.output)
        .duration(r.duration)
        .EUt(r.eut)
    })
  })

  W.track = track
  W.trackCover = trackCover
  W.placeCover = placeCover
  W.forget = forget
  W.tracked = function (server) { return blocks(server).slice() }
  W.settle = settle
  W.status = status
  W.towerInfo = towerInfo
  W.stored = stored
  W.setStored = setStored
  W.perTick = perTick
  W.readout = readout
  W.coverMisfit = coverMisfit
  // the energy adapter's view of a machine (kind, container class), for the smoke tests
  W.classify = function (m) { var a = adapter().classify(m); return { kind: a.kind, cls: a.cls } }
  // a saved persistent-data compound -> its list of blocks (the save-and-reload checks read kubejs_persistent_data.nbt with it)
  W.blocksFromTag = function (tag) {
    var list = tag.getList(BLOCKS_KEY, 10)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(R.fromTag(list.getCompound(i)))
    return out
  }
  // drops the parsed list (the next settlement reads persistent data again): the smoke test's reload
  W.dropCache = function () { cache.tag = null; cache.list = null }
})()
