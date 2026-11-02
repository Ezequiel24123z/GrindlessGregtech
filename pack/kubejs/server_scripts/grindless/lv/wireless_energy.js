// priority: -19738
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
//   - the network's tier is the strongest cell in any formed tower (a formed horizon bank at its site counts as tier 14, MAX): every wireless
//     energy hatch and cover at or below it is fed, so a MAX cell feeds every tier (their readout says why when one is above it); energy going in is not tier-limited. Swapping a cell unforms its tower (GTM's own structure
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
// compounds (lib/wireless_registry.js: no size limit; an unreadable value under the key is kept aside, never converted).
//
// Per-tick work is bounded (#224 M8-13): the settlement is a job advanced W.slice (400) entries per tick, see startJob and step.
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
    if (W.bankId && id === W.bankId) {
      var binfo = bankInfo(machineAt(level, pos))
      if (binfo.pending) {
        var bknown = blocks(level.server).filter(function (e) { return !e.bad && e.k === 'bank' && same(e, base.d, base.x, base.y, base.z) })[0]
        if (bknown) return bknown
        binfo = { formed: false, capacitors: 0 }
      }
      base.k = 'bank'
      base.f = binfo.formed
      base.n = binfo.capacitors
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

  // Exact whole numbers above 2^53 (XP-W2): a value is a JS Number while it is at most 2^53 - 1 (every value the network held before
  // Project Reforge, and the same code path), and a java.math.BigInteger above that, as GTNH's WirelessNetworkManager and GTM's power
  // substation hold theirs. Number(getLong(...)) rounds a long above 2^53 (S0-11), so the store is read from the tag's digits and
  // written with putLong(big.longValue()). BigInteger is loaded only when a value passes 2^53.
  const SAFE = 9007199254740991
  var BIG = null
  function bi() {
    if (BIG === null) BIG = Java.loadClass('java.math.BigInteger')
    return BIG
  }
  function isNum(x) { return typeof x === 'number' }
  // a Number, a digit string (exact values above 2^53 that a caller writes as text, such as the dial's 1,200 x 2^43) or a BigInteger
  function toBig(x) {
    if (isNum(x)) return new (bi())(String(x))
    if (typeof x === 'string') return new (bi())(x)
    return typeof x.subtract === 'function' ? x : new (bi())(String(x))
  }
  function norm(b) { return b.abs().compareTo(toBig(SAFE)) <= 0 ? Number(String(b.toString())) : b }
  function add(a, b) {
    if (isNum(a) && isNum(b)) {
      var s = a + b
      if (s <= SAFE && s >= -SAFE) return s
    }
    return norm(toBig(a).add(toBig(b)))
  }
  function sub(a, b) {
    if (isNum(a) && isNum(b)) {
      var s = a - b
      if (s <= SAFE && s >= -SAFE) return s
    }
    return norm(toBig(a).subtract(toBig(b)))
  }
  function cmp(a, b) {
    if (isNum(a) && isNum(b)) return a < b ? -1 : a > b ? 1 : 0
    return Number(toBig(a).compareTo(toBig(b)))
  }
  function minOf(a, b) { return cmp(a, b) <= 0 ? a : b }
  W.big = { add: add, sub: sub, cmp: cmp, toBig: toBig, norm: norm, SAFE: SAFE }

  function stored(server) {
    var pd = server.persistentData
    var n = Number(pd.getLong(STORE_KEY))
    if (n <= SAFE) return n
    var digits = String(pd.get(STORE_KEY).getAsString()).replace(/L$/, '')
    return /^[0-9]+$/.test(digits) ? norm(new (bi())(digits)) : n
  }

  function setStored(server, eu) {
    if (isNum(eu)) {
      server.persistentData.putLong(STORE_KEY, Math.max(0, Math.floor(eu)))
      return
    }
    var big = eu.signum() < 0 ? toBig(0) : eu
    var top = new (bi())('9223372036854775807')
    if (big.compareTo(top) > 0) big = top
    server.persistentData.putLong(STORE_KEY, big.longValue())
  }

  // ---------------------------------------------------------------- towers

  // a tower's cells, read from GTM's formed structure: { formed, cells, capacity, tier (the strongest, 0 = none), byTier }. pending: the
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
    var best = 0
    while (it.hasNext()) {
      var cell = W.cells[String(level.getBlock(it.next()).id)]
      if (!cell) continue
      out.cells++
      out.capacity += cell.capacity
      if (cell.tier > best) best = cell.tier
      out.byTier[cell.tier] = (out.byTier[cell.tier] || 0) + 1
    }
    out.tier = out.cells > 0 ? best : 0
    return out
  }

  // ---------------------------------------------------------------- the horizon capacitor bank (XP-H5)

  function bankCapacityOf(n) {
    return norm(toBig(W.bankCells[0].capacity).multiply(toBig(n)))
  }

  // a bank's capacitors, read from GTM's formed structure (the same pending rule as a tower's): { formed, capacitors, capacity, atSite }
  function bankInfo(ctrl) {
    var out = { formed: false, capacitors: 0, capacity: 0, atSite: false }
    if (ctrl === null || ctrl === undefined || typeof ctrl.isFormed !== 'function' || !ctrl.isFormed() || !W.bank) return out
    out.formed = true
    var ms = ctrl.getMultiblockState()
    if (ms.cache === null || ms.cache === undefined) {
      out.pending = true
      return out
    }
    var level = ctrl.getLevel()
    var it = ms.getCache().iterator()
    while (it.hasNext()) {
      if (String(level.getBlock(it.next()).id) === W.bankCells[0].cell) out.capacitors++
    }
    out.capacity = out.capacitors > 0 ? bankCapacityOf(out.capacitors) : 0
    out.atSite = dimensionOf(level) === W.bank.site
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

  // AF-W (#199 M8-13): an info cache keyed on GTM's structure cache missed in-place cell swaps (native STRONGEST_TIER), so info is read every cycle.
  function cachedInfo(kind, e, ctrl, read) { return read(ctrl) }

  // #224 M8-13: the settlement is a job that step() advances by a budget of entries per tick (SLICE), so a large network never costs one
  // long tick in interpreted Rhino. Phases, each in the order the list had: scan (reads every entry once: prunes what is gone, refreshes
  // towers and banks, collects the covers and hatches that move EU), deposit, needs (what each taker has room for), fill, finish.
  // settle(server) runs a whole job at once. The store is read at the start of each slice and written at its end, so nothing else that
  // changes it between two slices is overwritten; a job that outlasts one period makes the next start when it ends, and its limits
  // grow with the ticks since the previous job began. The info is still read from the machine every cycle (see cachedInfo).
  var SLICE = 400

  function entryKey(e) {
    return e.k + '|' + e.d + '|' + e.x + '|' + e.y + '|' + e.z + '|' + (e.s || '')
  }

  function startJob(server, ticks) {
    var list = blocks(server)
    return { server: server, ticks: ticks, ad: adapter(), list: list, i: 0, phase: 'scan', changes: {}, nChanges: 0, deposits: [], withdrawals: [],
      takers: [], needs: [], plan: null, best: 0, anyBank: false,
      out: { tracked: list.length, loaded: 0, forgotten: 0, faulted: 0, up: false, tier: 0, capacity: 0, stored: 0, in: 0, out: 0, lost: 0,
        drained: 0, towers: 0, skippedAbove: 0, banks: 0, bankCapacity: 0 } }
  }

  // a tower or bank (loaded or not) joins the network's tally
  function tally(job, e) {
    var out = job.out
    if (e.k === 'tower') {
      if (!e.f || !(e.n > 0)) return
      out.towers++
      out.capacity = add(out.capacity, e.c)
      if (e.t > job.best) job.best = e.t
    } else if (e.k === 'bank') {
      if (!e.f || !(e.n > 0) || !W.bank || e.d !== W.bank.site) return
      out.banks++
      out.bankCapacity = add(out.bankCapacity, bankCapacityOf(e.n))
      job.anyBank = true
    }
  }

  function scan(job, e) {
    var server = job.server
    var L = lazy()
    var ad = job.ad
    var ticks = job.ticks
    var out = job.out
    var deposits = job.deposits
    var withdrawals = job.withdrawals
    var orig = e
    function forgotten() { job.changes[entryKey(orig)] = null; job.nChanges++; out.forgotten++ }
    function refreshed(ne) { job.changes[entryKey(orig)] = ne; job.nChanges++ }
    {
      // an entry the list could not read is kept as it was and never used
      if (e.bad) return
      var level = server.getLevel(e.d)
      var pos = new L.BlockPos(e.x, e.y, e.z)
      if (level === null || level === undefined || !level.isLoaded(pos)) {
        tally(job, e)
        return
      }
      var id = String(level.getBlock(pos).id)
      if (e.k === 'bank') {
        if (id !== W.bankId) { forgotten(); return }
        var binfo = cachedInfo('bank', e, machineAt(level, pos), bankInfo)
        if (!binfo.pending && (binfo.formed !== e.f || binfo.capacitors !== e.n)) {
          e = R.canon({ k: 'bank', d: e.d, x: e.x, y: e.y, z: e.z, f: binfo.formed, n: binfo.capacitors })
          refreshed(e)
        }
        tally(job, e)
        out.loaded++
        return
      }
      if (e.k === 'tower') {
        if (id !== W.towerId) { forgotten(); return }
        var info = cachedInfo('tower', e, machineAt(level, pos), towerInfo)
        if (!info.pending && (info.formed !== e.f || info.capacity !== e.c || info.tier !== e.t || info.cells !== e.n)) {
          e = R.canon({ k: 'tower', d: e.d, x: e.x, y: e.y, z: e.z, f: info.formed, c: info.capacity, t: info.tier, n: info.cells })
          refreshed(e)
        }
        tally(job, e)
        out.loaded++
        return
      }
      var m = machineAt(level, pos)
      if (e.k === 'cover') {
        var cover = W.covers[W.coverDefId(e.ck, e.t)]
        var side = L.Direction.byName(e.s)
        var on = m === null || side === null ? null : m.getCoverContainer().getCoverAtSide(side)
        if (!cover || on === null || on === undefined || String(on.coverDefinition.getId()) !== cover.def) {
          forgotten()
          return
        }
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
        forgotten()
        return
      }
      out.loaded++
      if (W.faults[flowKey(e)]) { out.faulted++; return }
      var ha = ad.classify(m)
      if (ha.kind !== 'plain') { fault(e, 'the hatch\'s energy container is ' + (ha.cls || 'missing') + ', not GTM\'s NotifiableEnergyContainer'); out.faulted++; return }
      var hlimit = W.rate(e.t, h.amps) * ticks
      if (h.kind === 'dynamo') deposits.push({ a: ha, limit: hlimit, e: e })
      else withdrawals.push({ a: ha, limit: hlimit, tier: e.t, e: e })
    }
  }

  // applies the scan's prunes and refreshes to the list as it is now (a block placed while the job ran is kept)
  function commitScan(job) {
    if (job.nChanges === 0) return
    var next = []
    blocks(job.server).forEach(function (e) {
      if (e.bad) { next.push(e); return }
      var k = entryKey(e)
      if (!Object.prototype.hasOwnProperty.call(job.changes, k)) next.push(e)
      else if (job.changes[k] !== null) next.push(job.changes[k])
    })
    saveBlocks(job.server, next)
  }

  // deposits: whole multiples of 20 EU, as far as the network has room; any tier. A move that fails its check counts what the
  // machine really gave (`measured`), or nothing when that is not a sane number: a failure can lose EU, never make it.
  function depositOne(job, d, bank) {
    var out = job.out
    var ad = job.ad
    var ticks = job.ticks
    var room = sub(out.capacity, bank)
    if (cmp(room, 0) <= 0) return bank
    var gave = 0
    var take = 0
    try {
      var fits = isNum(room) && room * W.lossDenominator <= SAFE ? Math.floor(room * W.lossDenominator / W.lossNumerator)
        : norm(toBig(room).multiply(toBig(W.lossDenominator)).divide(toBig(W.lossNumerator)))
      take = minOf(ad.available(d.a, d.limit, ticks), fits)
      take -= take % W.lossDenominator
      if (take <= 0) return bank
      gave = ad.drain(d.a, take, ticks)
    } catch (err) {
      fault(d.e, err.message || err)
      out.faulted++
      gave = sane(err.measured, take) ? err.measured : 0
    }
    var put = Math.floor(gave * W.lossNumerator / W.lossDenominator)
    bank = add(bank, put)
    out.drained = add(out.drained, gave)
    out.in = add(out.in, put)
    out.lost = add(out.lost, gave - put)
    var fd = flow(d.e)
    fd.drained += gave
    fd.in += put
    return bank
  }

  function fillOne(job, w, give, bank) {
    var out = job.out
    var got = 0
    try {
      got = job.ad.fill(w.a, give, job.ticks)
    } catch (err) {
      fault(w.e, err.message || err)
      out.faulted++
      // what the machine really took; when that is not a sane number, all of it is charged (the network never gives more than it pays)
      got = sane(err.measured, give) ? err.measured : give
    }
    bank = sub(bank, got)
    out.out = add(out.out, got)
    flow(w.e).filled += got
    return bank
  }

  // advances the job by up to `budget` entries; true when it is finished
  function step(job, budget) {
    var server = job.server
    var out = job.out
    while (budget > 0 && job.phase !== 'done') {
      var n = 0
      if (job.phase === 'scan') {
        var end = Math.min(job.list.length, job.i + budget)
        n = end - job.i
        for (; job.i < end; job.i++) scan(job, job.list[job.i])
        if (job.i >= job.list.length) {
          commitScan(job)
          // the network: the formed towers with cells, and the banks at their site (XP-H5: a bank counts as tier 14: it raises the network's
          // tier to MAX); loss, cadence and caps stay as they are
          out.up = out.towers > 0
          out.tier = out.up ? job.best : 0
          if (out.up && job.anyBank) out.tier = 14
          out.capacity = add(out.capacity, out.bankCapacity)
          job.phase = out.up ? 'deposit' : 'finish'
          job.i = 0
        }
      } else if (job.phase === 'finish') {
        finish(job)
      } else {
        var bank = stored(server)
        var start = bank
        var lim = Math.min(job.phase === 'deposit' ? job.deposits.length : job.phase === 'needs' ? job.withdrawals.length : job.takers.length, job.i + budget)
        n = lim - job.i
        if (job.phase === 'deposit') {
          for (; job.i < lim; job.i++) bank = depositOne(job, job.deposits[job.i], bank)
          if (job.i >= job.deposits.length) { job.phase = 'needs'; job.i = 0 }
        } else if (job.phase === 'needs') {
          // withdrawals at or below the network's tier: topped up, shared in proportion when the store is short
          for (; job.i < lim; job.i++) {
            var w = job.withdrawals[job.i]
            if (w.tier > out.tier) { out.skippedAbove++; continue }
            try {
              job.needs.push(job.ad.room(w.a, w.limit, job.ticks))
              job.takers.push(w)
            } catch (err) {
              fault(w.e, err.message || err)
              out.faulted++
            }
          }
          if (job.i >= job.withdrawals.length) { job.phase = 'fill'; job.i = 0; job.plan = null }
        } else {
          if (job.plan === null) {
            var total = job.needs.reduce(function (a, b) { return add(a, b) }, 0)
            if (cmp(total, 0) > 0 && cmp(bank, 0) > 0) {
              var enough = cmp(bank, total) >= 0
              // while both are exact Numbers the share is the float it always was; above 2^53 it is exact: floor(need x budget / total)
              var plainShare = isNum(bank) && isNum(total)
              // every share is cut from the budget the cycle opened with (frozen here); the store shrinks as takers are served (AF-W, #200 M6-03)
              job.plan = { total: total, budget: bank, enough: enough, plain: plainShare, share: enough ? 1 : plainShare ? bank / total : 0 }
            } else {
              job.plan = false
            }
          }
          if (job.plan === false) {
            job.i = job.takers.length
          } else {
            var plan = job.plan
            for (; job.i < lim; job.i++) {
              var t = job.takers[job.i]
              var need = job.needs[job.i]
              var give = plan.enough ? need : plan.plain ? Math.floor(need * plan.share) : norm(toBig(need).multiply(toBig(plan.budget)).divide(toBig(plan.total)))
              if (give <= 0) continue
              bank = fillOne(job, t, give, bank)
            }
          }
          if (job.i >= job.takers.length) job.phase = 'finish'
        }
        if (cmp(bank, start) !== 0) setStored(server, bank)
      }
      budget -= Math.max(n, 1)
    }
    return job.phase === 'done'
  }

  function finish(job) {
    var server = job.server
    var out = job.out
    out.stored = stored(server)
    W.totals.drained = add(W.totals.drained, out.drained)
    W.totals.in = add(W.totals.in, out.in)
    W.totals.lost = add(W.totals.lost, out.lost)
    W.totals.out = add(W.totals.out, out.out)
    W.totals.settlements++
    windowIn.push(out.in)
    windowOut.push(out.out)
    while (windowIn.length > WINDOW) windowIn.shift()
    while (windowOut.length > WINDOW) windowOut.shift()
    W.last = out
    job.phase = 'done'
  }

  function settle(server) {
    var job = startJob(server, W.settleTicks)
    step(job, Infinity)
    return job.out
  }

  // the network now: { up, tier, capacity, stored, towers, inPerSecond, outPerSecond } (EU over the last second)
  function status(server) {
    var last = W.last || { up: false, tier: 0, capacity: 0, towers: 0, banks: 0, bankCapacity: 0 }
    var sumIn = windowIn.reduce(function (a, b) { return add(a, b) }, 0)
    var sumOut = windowOut.reduce(function (a, b) { return add(a, b) }, 0)
    return { up: !!last.up, tier: last.tier, capacity: last.capacity, towers: last.towers, banks: last.banks || 0, bankCapacity: last.bankCapacity || 0,
      stored: stored(server), inPerSecond: sumIn, outPerSecond: sumOut }
  }

  // what the Hyperstargate's dial may draw on (XP-G1): the banks' exact capacity and the exact store
  function dialCharge(server) {
    var st = status(server)
    return { bankCapacity: st.bankCapacity, stored: st.stored }
  }

  // ---------------------------------------------------------------- the readout

  function fmt(n) {
    if (!isNum(n)) return String(n.toString()).replace(/\B(?=([0-9]{3})+(?![0-9]))/g, ',')
    return String(lazy().FU.formatNumbers(Math.floor(n)))
  }
  W.fmt = fmt

  // EU per tick from EU per second, one decimal
  function perTick(euPerSecond) {
    if (!isNum(euPerSecond)) {
      // exact above 2^53: tenths = round(x / 2), half up as Math.round
      var tenths = euPerSecond.add(toBig(1)).divide(toBig(2))
      var wholeBig = tenths.divide(toBig(10))
      var tenthBig = Number(String(tenths.mod(toBig(10)).toString()))
      return fmt(wholeBig) + (tenthBig > 0 ? '.' + tenthBig : '')
    }
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
    if (id === W.towerId || (W.bankId && id === W.bankId)) {
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

  // AF-W (#199 M8-05): a cover is a change to someone else's machine, so a claim (spawn protection, FTB Chunks and the like, which cancel
  // Forge's RightClickBlock or answer mayInteract) must be able to refuse it. KubeJS' own listener would see the event we post, hence the guard.
  var posting = false
  function claimAllows(player, level, pos, side) {
    if (posting) return true
    try {
      if (!level.mayInteract(player, pos)) return false
      var Hit = Java.loadClass('net.minecraft.world.phys.BlockHitResult')
      var Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3')
      var Ev = Java.loadClass('net.minecraftforge.event.entity.player.PlayerInteractEvent$RightClickBlock')
      var Hand = Java.loadClass('net.minecraft.world.InteractionHand')
      var Forge = Java.loadClass('net.minecraftforge.common.MinecraftForge')
      var hit = new Hit(new Vec3(pos.x + 0.5, pos.y + 0.5, pos.z + 0.5), side, pos, false)
      var ev = new Ev(player, Hand.MAIN_HAND, pos, hit)
      posting = true
      try {
        Forge.EVENT_BUS.post(ev)
      } finally {
        posting = false
      }
      return !ev.isCanceled() && String(ev.getUseBlock()) !== 'DENY'
    } catch (err) {
      console.error(LOG + 'claim check failed, falling back to mayInteract only: ' + err)
      return true
    }
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
    if (!claimAllows(p, level, pos, side)) return true
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

  W.hatchIds.concat(W.maxplusHatchIds, [W.towerId], W.bankId ? [W.bankId] : []).forEach(function (id) {
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
  var job = null
  var lastStart = null
  W.slice = SLICE
  ServerEvents.tick(function (event) {
    var server = event.server
    if (W.paused) { job = null; lastStart = null; return }
    var now = server.getTickCount()
    if (job === null) {
      if (now % W.settleTicks !== 0) return
      var period = lastStart === null ? W.settleTicks : Math.max(W.settleTicks, now - lastStart)
      job = startJob(server, period)
      lastStart = now
    }
    try {
      if (step(job, W.slice)) job = null
      failedTick = false
    } catch (e) {
      job = null
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
  W.dropInfoCache = function () {}
  W.status = status
  W.towerInfo = towerInfo
  W.bankInfo = bankInfo
  W.dialCharge = dialCharge
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
