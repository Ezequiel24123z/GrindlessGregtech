// priority: -5725
// TEST ONLY, AUD3-PERF (#306). Command: kubejs custom_command gg_test_factory_load
// Band ONLY: X 50176-50239, Z 0-63, Overworld Y 98-150 (zone factory_load). Needs a dedicated server on the VM, one exclusive slot,
// never beside the EMI audit. Config: kubejs/config/gg_test_factory_load.json. Usage and baselines: docs/testing/usage.md.
// Named uncertainty: does a representative loaded factory sustain its stated production rate within the 50 ms tick budget, and does
// it leave no extra ongoing work (forced chunks, tracked wireless endpoints, entities, blocks) behind after cleanup?
//   profiles, run one after the other in the same band (cleared between them):
//     control   nothing built: only the forced band and this script's own bookkeeping (the fixture overhead)
//     midgame   an HV wireless tower (32 cells) and N HV centrifuges, each with an HV wireless energy cover, one test recipe each
//     endgame   a UV tower, N UV centrifuges with UV wireless covers and F Mega Factories (2 modules, UV parallel hatch) fed and
//               emptied by the fixture; the factories' UV energy hatch is topped up by the fixture (declared: not a wireless endpoint)
//   per profile, after warmup, a fixed window of real tick samples (the server's own tickTimes ring, ms), the output rate against
//   the requested one, the Java heap peak and the loaded and forced chunk counts; then (midgame) backpressure: every output slot
//   full, so nothing may run or accumulate; then the band is cleared and the tracked endpoints must go.
// Markers: GGTEST|factory_load|<check>|PASS|FAIL|NOTE|<detail>; one NOTE per profile `summary_<profile>` carries the compact JSON; the
//   same summaries go to kubejs/exported/factory_load.json; last line GGTEST|factory_load|DONE|failures=N.
// No gameplay change, no harness change. The 50 ms line is the 20 TPS budget; no regression threshold is claimed before the baselines.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var NAME = 'factory_load'
  var X0 = 50176
  var X1 = 50239
  var Z0 = 0
  var Z1 = 63
  var Y0 = 98
  var Y1 = 150
  var FLOOR = 100
  var CONFIG = 'kubejs/config/gg_test_factory_load.json'
  var EXPORT_DIR = 'kubejs/exported'
  var EXPORT = EXPORT_DIR + '/factory_load.json'
  var ORDER = ['control', 'midgame', 'endgame']
  var BUDGET_MS = 50
  var RATE_FLOOR = 0.9
  var FORM_TICKS = 600
  var DEADLINE = 6000
  var STORE = 1e13

  var FACTORY = 'gtceu:mega_factory'
  var CENTRIFUGE = 'gtceu:centrifuge'
  var COOLANT = 'gtceu:pcb_coolant'
  // one test recipe per tier of single machine (EUt = the tier's V: no overclock) and one for the factories
  var RECIPES = {
    3: { id: 'gg_test_factory:hv_cent', input: 'minecraft:allium', output: 'minecraft:magenta_dye', eut: 512 },
    8: { id: 'gg_test_factory:uv_cent', input: 'minecraft:pink_tulip', output: 'minecraft:pink_dye', eut: 524288 }
  }
  var FACTORY_RECIPE = { id: 'gg_test_factory:mf_cent', input: 'minecraft:azure_bluet', output: 'minecraft:light_gray_dye', eut: 8 }
  var DURATION = 20
  var TIER_NAMES = { 3: 'hv', 8: 'uv' }
  var PARTS = {
    1: 'gtceu:hv_output_hatch',
    2: 'gtceu:maintenance_hatch',
    3: 'gtceu:uv_energy_input_hatch',
    4: 'gtceu:hv_input_bus',
    5: 'gtceu:hv_input_bus',
    6: 'gtceu:uv_parallel_hatch',
    8: 'gtceu:hv_output_bus',
    9: 'gtceu:hv_output_bus',
    10: 'gtceu:hv_input_hatch',
    11: 'gtceu:hv_input_hatch',
    12: 'gtceu:hv_output_hatch'
  }
  var SOCKETS = ['grindless:separation_module', 'grindless:forming_module', null, null]

  ServerEvents.recipes(function (event) {
    try {
      Object.keys(RECIPES).forEach(function (t) {
        var r = RECIPES[t]
        event.recipes.gtceu.centrifuge(r.id).itemInputs('1x ' + r.input).itemOutputs('1x ' + r.output).duration(DURATION).EUt(r.eut)
      })
      event.recipes.gtceu.centrifuge(FACTORY_RECIPE.id).itemInputs('1x ' + FACTORY_RECIPE.input).itemOutputs('1x ' + FACTORY_RECIPE.output)
        .duration(DURATION).EUt(FACTORY_RECIPE.eut)
    } catch (e) {
      console.error('[gg_test factory_load] could not add the test recipes: ' + errText(e))
    }
  })

  // ---------------------------------------------------------------- pure helpers (also run by tools/analysis/test/factory-load.test.mjs)

  function percentile(sorted, p) {
    if (!sorted.length) return null
    var i = Math.ceil(p / 100 * sorted.length) - 1
    return sorted[Math.max(0, Math.min(sorted.length - 1, i))]
  }
  function round(v, d) {
    if (v === null || v === undefined || v !== v) return null
    var k = Math.pow(10, d)
    return Math.round(v * k) / k
  }
  function stats(samples) {
    var ok = samples.filter(function (v) { return typeof v === 'number' && v === v && v >= 0 })
    if (!ok.length) return { n: 0, meanMs: null, p95Ms: null, maxMs: null, over50: 0 }
    var sorted = ok.slice().sort(function (a, b) { return a - b })
    var sum = 0
    ok.forEach(function (v) { sum += v })
    return {
      n: ok.length,
      meanMs: round(sum / ok.length, 3),
      p95Ms: round(percentile(sorted, 95), 3),
      maxMs: round(sorted[sorted.length - 1], 3),
      over50: ok.filter(function (v) { return v > BUDGET_MS }).length
    }
  }
  // requested and actual are items per second; a missing request is reported as unavailable, never guessed
  function rate(actualItems, ticks, requested) {
    var per = ticks > 0 ? actualItems / (ticks / 20) : null
    return {
      items: actualItems,
      actualPerSec: round(per, 3),
      requestedPerSec: requested === null || requested === undefined ? null : round(requested, 3),
      ratio: requested > 0 && per !== null ? round(per / requested, 3) : null
    }
  }
  function summarize(p) {
    return {
      profile: p.name,
      tier: p.tier,
      machines: p.machines,
      factories: p.factories,
      endpoints: p.endpoints,
      recipe: p.recipe,
      warmupTicks: p.warmupTicks,
      windowTicks: p.windowTicks,
      tick: stats(p.samples),
      tickSource: p.tickSource,
      singles: rate(p.singleItems, p.windowTicks, p.requested),
      factoriesOut: rate(p.factoryItems, p.windowTicks, null),
      memory: { peakUsedMb: p.peakMb, maxMb: p.maxMb },
      chunks: p.chunks,
      backpressure: p.backpressure || null,
      cleanup: p.cleanup || null
    }
  }

  // ---------------------------------------------------------------- plumbing

  function classes() {
    if (C !== null) return C
    C = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      Direction: Java.loadClass('net.minecraft.core.Direction'),
      AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
      ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Runtime: Java.loadClass('java.lang.Runtime'),
      FPF: Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
    }
    return C
  }
  function errText(e) {
    var s = ''
    try { s = String(e.message || '') } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 4).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3500) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
  function command(text) { return S.server.runCommandSilent('execute in minecraft:overworld run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= Z0 && z <= Z1 && y >= Y0 && y <= Y1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return command('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function machine(p) { return classes().Meta.getMachine(S.level, p) }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function wireless() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.track !== 'function' || typeof w.placeCover !== 'function' || typeof w.setStored !== 'function') {
      throw new Error('global.grindless.wireless is incomplete (the server script did not load)')
    }
    return w
  }
  function storeOf(h) { return h.storage ? h.storage : h }
  function countOf(h, id) {
    var st = storeOf(h)
    var n = 0
    for (var i = 0; i < st.getSlots(); i++) {
      var s = st.getStackInSlot(i)
      if (!s.isEmpty() && String(classes().Registries.ITEMS.getKey(s.getItem())) === id) n += Number(s.getCount())
    }
    return n
  }
  function setAll(h, id, each) {
    var st = storeOf(h)
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, each > 0 ? Item.of(id, each) : Item.of('minecraft:air'))
  }
  function clearInv(h) { setAll(h, 'minecraft:air', 0) }
  function partsLike(ctrl, re) {
    var out = []
    array(ctrl.getParts()).forEach(function (p) { if (re.test(String(p.getDefinition().getId()))) out.push(p) })
    return out
  }
  function topUp(list) { list.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }) }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }

  // ---------------------------------------------------------------- measurements

  function tickMs() {
    try {
      var tt = S.server.tickTimes
      if (tt !== undefined && tt !== null && tt.length > 0) {
        var v = Number(tt[(Number(S.server.getTickCount()) - 1 + tt.length) % tt.length])
        if (v === v) return v / 1e6
      }
    } catch (e) { }
    return NaN
  }
  function usedMb() {
    var r = classes().Runtime.getRuntime()
    return (Number(r.totalMemory()) - Number(r.freeMemory())) / 1048576
  }
  function maxMb() { return Number(classes().Runtime.getRuntime().maxMemory()) / 1048576 }
  function loadedChunks() {
    try { return Number(S.level.getChunkSource().getLoadedChunksCount()) } catch (e) { return null }
  }
  function forcedChunks() {
    try { return Number(S.level.getForcedChunks().size()) } catch (e) { return null }
  }
  function trackedInBand() {
    var n = 0
    wireless().tracked(S.server).forEach(function (e) { if (Number(e.x) >= X0 && Number(e.x) <= X1 && Number(e.z) >= Z0 && Number(e.z) <= Z1) n++ })
    return n
  }
  function bandEntities() {
    var box = new (classes().AABB)(X0, Y0, Z0, X1 + 1, Y1 + 1, Z1 + 1)
    try { return Number(S.level.getEntities(null, box).size()) } catch (e) { return null }
  }
  function dropEntities() {
    var list = S.level.getEntitiesOfClass(classes().ItemEntity, new (classes().AABB)(X0, Y0, Z0, X1 + 1, Y1 + 1, Z1 + 1))
    var n = list.size()
    for (var i = 0; i < n; i++) list.get(i).discard()
    return n
  }

  // ---------------------------------------------------------------- structures

  // a structure's cells relative to its controller (the same offsets the proven fixtures use), and their bounds
  function layout(id) {
    var desc = global.grindless.patterns.describe(id)
    if (!desc) throw new Error('no structure description for ' + id)
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (ctrl === null) throw new Error('no controller in ' + id)
    var cells = []
    var b = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9, z0: 1e9, z1: -1e9 }
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var c = { si: si, ri: ri, ci: ci, ch: ch, sym: desc.symbols[ch], rx: -(ci - ctrl.ci), ry: ri - ctrl.ri, rz: -(si - ctrl.si) }
          cells.push(c)
          b.x0 = Math.min(b.x0, c.rx); b.x1 = Math.max(b.x1, c.rx)
          b.y0 = Math.min(b.y0, c.ry); b.y1 = Math.max(b.y1, c.ry)
          b.z0 = Math.min(b.z0, c.rz); b.z1 = Math.max(b.z1, c.rz)
        }
      })
    })
    return { cells: cells, bounds: b, last: desc.slices.length - 1, w: b.x1 - b.x0 + 1, h: b.y1 - b.y0 + 1, d: b.z1 - b.z0 + 1 }
  }
  // places a structure with the corner of its bounds at (ox, oy, oz); returns the controller position
  function placeStructure(id, lay, ox, oy, oz, blockFor) {
    var cx = ox - lay.bounds.x0
    var cy = oy - lay.bounds.y0
    var cz = oz - lay.bounds.z0
    var sockets = 0
    lay.cells.forEach(function (c) {
      var sym = c.sym
      if (sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') return
      var r = blockFor(c, function () { return sockets++ })
      if (!r) return
      put(cx + c.rx, cy + c.ry, cz + c.rz, r)
    })
    put(cx, cy, cz, id + '[facing=north]')
    return pos(cx, cy, cz)
  }
  function towerBlock(cell) {
    return function (c) {
      var sym = c.sym
      if (sym.kind === 'oneOf') return cell
      if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
      if (sym.kind === 'blocks') return sym.blocks[0]
      return null
    }
  }
  function factoryBlock(lay) {
    return function (c, nextSocket) {
      var sym = c.sym
      if (c.ch === 'M') return SOCKETS[nextSocket()] || null
      if (sym.kind === 'blocks') return sym.blocks[0]
      if (sym.kind === 'oneOf') {
        if (c.si === lay.last && c.ry === lay.bounds.y0 && PARTS[c.ci]) return PARTS[c.ci] + '[facing=north]'
        var found = null
        sym.options.forEach(function (o) { if (!found && o.kind === 'blocks') found = o.blocks[0] })
        return found
      }
      return null
    }
  }

  // ---------------------------------------------------------------- profile lifecycle

  function startProfile(name) {
    var cfg = S.cfg.profiles[name]
    var p = {
      name: name, cfg: cfg, tier: cfg.tier, machines: cfg.machines, factories: cfg.factories, endpoints: 0,
      phase: 'build', phaseAt: S.tick, units: [], facs: [], samples: [], tickSource: 'tickTimes', singleItems: 0, factoryItems: 0,
      requested: cfg.machines > 0 ? cfg.machines * (20 / DURATION) : null, peakMb: 0, maxMb: round(maxMb(), 0), counting: false,
      warmupTicks: S.cfg.warmupTicks, windowTicks: S.cfg.windowTicks, nanSamples: 0, recipe: null,
      chunks: { loadedBefore: loadedChunks(), forcedBefore: forcedChunks(), loadedPeak: null }
    }
    if (cfg.machines > 0) p.recipe = RECIPES[cfg.tier].id + ' (' + RECIPES[cfg.tier].input + ' -> ' + RECIPES[cfg.tier].output + ', ' + RECIPES[cfg.tier].eut + ' EU/t, ' + DURATION + ' ticks)'
    S.p = p
    note('profile_' + name, 'tier ' + cfg.tier + ', machines ' + cfg.machines + ', factories ' + cfg.factories + ', warmup ' + p.warmupTicks + ' ticks, window ' + p.windowTicks +
      ' ticks, requested ' + (p.requested === null ? 'none' : p.requested + ' items/s'))
    if (cfg.machines === 0 && cfg.factories === 0) { p.phase = 'warm'; p.phaseAt = S.tick; return }
    try {
      build(p)
    } catch (e) {
      check(name + '_built', false, errText(e))
      p.phase = 'abandon'
      p.phaseAt = S.tick
      return
    }
  }

  function build(p) {
    var w = wireless()
    var tierName = TIER_NAMES[p.tier]
    var row = w.tierRow[p.tier]
    if (!row || !tierName) throw new Error('no wireless tier row for tier ' + p.tier)
    var tl = layout(w.towerId)
    var tpos = placeStructure(w.towerId, tl, X0 + 1, FLOOR, Z0 + 1, towerBlock(row.cell))
    p.tower = tpos
    w.track(S.level, tpos)
    var lay = null
    if (p.factories > 0) {
      lay = layout(FACTORY)
      var fx0 = X0 + 1 + tl.w + 1
      var perRow = Math.floor((X1 + 1 - fx0) / (lay.w + 1))
      if (perRow < 1) throw new Error('layout: no room for a factory of width ' + lay.w + ' beside a tower of width ' + tl.w)
      for (var i = 0; i < p.factories; i++) {
        var ox = fx0 + (i % perRow) * (lay.w + 1)
        var oz = Z0 + 1 + Math.floor(i / perRow) * (lay.d + 1)
        p.facs.push({ pos: placeStructure(FACTORY, lay, ox, FLOOR, oz, factoryBlock(lay)), phase: 'forming', started: S.tick })
      }
      p.layout = 'tower ' + tl.w + 'x' + tl.h + 'x' + tl.d + ', factory ' + lay.w + 'x' + lay.h + 'x' + lay.d + ' x' + p.factories + ' (' + perRow + ' per row)'
    } else {
      p.layout = 'tower ' + tl.w + 'x' + tl.h + 'x' + tl.d
    }
    var fp = S.fake || (S.fake = classes().FPF.getMinecraft(S.level))
    var coverItem = w.coverItemId('energy', p.tier)
    var machineId = 'gtceu:' + tierName + '_centrifuge'
    var bad = []
    for (var k = 0; k < p.machines; k++) {
      var mx = X0 + 2 + (k % 30) * 2
      var mz = 50 + Math.floor(k / 30) * 4
      put(mx, FLOOR, mz, machineId + '[facing=north]')
      var r = w.placeCover(S.level, pos(mx, FLOOR, mz), classes().Direction.UP, Item.of(coverItem), fp)
      if (!r.ok) bad.push(mx + ',' + mz)
      p.units.push({ x: mx, z: mz, pos: pos(mx, FLOOR, mz), ok: !!r.ok })
    }
    p.endpoints = p.machines + 1
    p.built = true
    note('placed_' + p.name, p.layout + '; ' + p.machines + ' ' + machineId + ' with ' + coverItem + ' (' + bad.length + ' cover refusals ' + bad.slice(0, 4).join(' ') + ')')
    check(p.name + '_placed', bad.length === 0, 'covers placed on ' + (p.machines - bad.length) + '/' + p.machines + ' machines')
  }

  function stepForm(p) {
    var waited = S.tick - p.phaseAt
    var tm = machine(p.tower)
    var ready = !!tm && formCheck(tm, waited)
    var allMachines = true
    p.units.forEach(function (u) {
      if (!u.m) u.m = machine(u.pos)
      if (!u.m) allMachines = false
    })
    var facsReady = true
    p.facs.forEach(function (f) {
      var m = machine(f.pos)
      if (!m || !formCheck(m, S.tick - f.started)) { facsReady = false; return }
      if (!f.m) {
        f.m = m
        f.energy = partsLike(m, /energy_input_hatch/)
        f.inBus = partsLike(m, /input_bus/)[0]
        f.outBus = partsLike(m, /output_bus/)[0]
        f.tank = partsLike(m, /^gtceu:hv_input_hatch$/)[0]
        f.parts = !!f.inBus && !!f.outBus && !!f.tank && f.energy.length > 0
      }
    })
    if (ready && allMachines && facsReady) {
      var unformed = p.facs.filter(function (f) { return !f.parts }).length
      check(p.name + '_formed', unformed === 0, 'tower formed, ' + p.units.length + ' machines present, ' + p.facs.length + ' factories formed (' + unformed + ' without their parts)')
      if (unformed > 0) { p.phase = 'abandon'; p.phaseAt = S.tick; return }
      var w = wireless()
      w.paused = false
      w.setStored(S.server, STORE)
      p.facs.forEach(function (f) { f.m.setActiveRecipeType(0); f.m.getRecipeLogic().updateTickSubscription() })
      p.phase = 'warm'
      p.phaseAt = S.tick
      return
    }
    if (waited > FORM_TICKS) {
      check(p.name + '_formed', false, 'not ready after ' + waited + ' ticks: tower ' + ready + ', machines ' + allMachines + ', factories ' + facsReady +
        (tm && !ready ? ' (' + String(tm.getMultiblockState().error) + ')' : ''))
      p.phase = 'abandon'
      p.phaseAt = S.tick
    }
  }

  // feeds and empties every machine; counts the output only while `p.counting`
  function drive(p, empty) {
    var r = RECIPES[p.tier]
    p.units.forEach(function (u) {
      if (!u.m) return
      var out = countOf(u.m.exportItems, r.output)
      if (empty) {
        if (p.counting) p.singleItems += out
        clearInv(u.m.exportItems)
      }
      setAll(u.m.importItems, r.input, 64)
    })
    p.facs.forEach(function (f) {
      if (!f.m) return
      var out = countOf(f.outBus.getInventory(), FACTORY_RECIPE.output)
      if (empty) {
        if (p.counting) p.factoryItems += out
        clearInv(f.outBus.getInventory())
      }
      setAll(f.inBus.getInventory(), FACTORY_RECIPE.input, 64)
      f.tank.tank.setFluidInTank(0, Fluid.of(COOLANT, 4000).getFluidStack())
    })
  }
  function sampleOnce(p) {
    var v = tickMs()
    if (v !== v) { p.nanSamples++; return }
    p.samples.push(v)
  }

  function stepRun(p) {
    var el = S.tick - p.phaseAt
    p.facs.forEach(function (f) { if (f.m) topUp(f.energy) })
    var every = S.cfg.sampleEvery
    if (S.tick % 20 === 0 && p.built) wireless().setStored(S.server, STORE)
    if (S.tick % every === 0) {
      var mb = usedMb()
      if (mb > p.peakMb) p.peakMb = round(mb, 1)
      var lc = loadedChunks()
      if (lc !== null && (p.chunks.loadedPeak === null || lc > p.chunks.loadedPeak)) p.chunks.loadedPeak = lc
    }
    if (p.phase === 'warm') {
      if (S.tick % every === 0) drive(p, true)
      if (el >= p.warmupTicks) { p.phase = 'window'; p.phaseAt = S.tick; p.counting = true; p.singleItems = 0; p.factoryItems = 0 }
      return
    }
    if (p.phase === 'window') {
      sampleOnce(p)
      if (S.tick % every === 0) drive(p, true)
      if (el >= p.windowTicks) {
        drive(p, true)
        p.counting = false
        finishWindow(p)
      }
      return
    }
    if (p.phase === 'press') {
      sampleOnce(p)
      if (S.tick % every === 0) drive(p, false)
      if (el === Math.floor(p.pressTicks / 2)) p.pressMid = pressure(p)
      if (el >= p.pressTicks) finishPressure(p)
    }
  }

  function finishWindow(p) {
    var st = stats(p.samples)
    var src = p.tickSource
    if (st.n < p.windowTicks * 0.9) {
      src = 'unavailable'
      note(p.name + '_tick_samples', 'only ' + st.n + ' of ' + p.windowTicks + ' real tick samples (' + p.nanSamples + ' unreadable); the tickTimes ring is not readable here')
      try { p.avgTickMs = round(Number(S.server.getAverageTickTime()), 3) } catch (e) { p.avgTickMs = null }
    }
    p.tickSource = src
    check(p.name + '_samples', st.n >= p.windowTicks * 0.9, st.n + ' tick samples in a ' + p.windowTicks + '-tick window (source ' + src + ')')
    var singles = rate(p.singleItems, p.windowTicks, p.requested)
    if (p.machines > 0) {
      check(p.name + '_sustains', singles.ratio !== null && singles.ratio >= RATE_FLOOR,
        'actual ' + singles.actualPerSec + ' items/s of the requested ' + singles.requestedPerSec + ' (ratio ' + singles.ratio + ', floor ' + RATE_FLOOR + ')')
    }
    if (p.facs.length > 0) {
      check(p.name + '_factories_run', p.factoryItems > 0, p.factoryItems + ' items from ' + p.facs.length + ' factories in the window')
    }
    note(p.name + '_tick', 'mean ' + st.meanMs + ' ms, p95 ' + st.p95Ms + ' ms, max ' + st.maxMs + ' ms, ' + st.over50 + ' ticks over the ' + BUDGET_MS + ' ms budget (20 TPS); peak heap ' +
      p.peakMb + ' of ' + p.maxMb + ' MB; chunks loaded ' + p.chunks.loadedBefore + ' -> peak ' + p.chunks.loadedPeak + ', forced ' + p.chunks.forcedBefore)
    if (p.name === 'midgame') {
      p.phase = 'press'
      p.phaseAt = S.tick
      p.pressTicks = S.cfg.backpressureTicks
      p.windowStats = st
      p.pressSamples0 = p.samples.length
      // every output slot full: nothing may start, nothing may accumulate
      p.units.forEach(function (u) { if (u.m) setAll(u.m.exportItems, RECIPES[p.tier].output, 64) })
      return
    }
    p.phase = 'abandon'
    p.phaseAt = S.tick
  }

  function pressure(p) {
    var working = 0
    var items = 0
    p.units.forEach(function (u) {
      if (!u.m) return
      try { if (u.m.getRecipeLogic().isWorking()) working++ } catch (e) { }
      items += countOf(u.m.exportItems, RECIPES[p.tier].output)
    })
    return { working: working, items: items }
  }
  function finishPressure(p) {
    var end = pressure(p)
    var mid = p.pressMid || end
    var pressSamples = stats(p.samples.slice(p.pressSamples0))
    p.backpressure = {
      ticks: p.pressTicks, workingMid: mid.working, workingEnd: end.working, itemsMid: mid.items, itemsEnd: end.items,
      tick: pressSamples, meanVsWindowMs: round((pressSamples.meanMs || 0) - (p.windowStats.meanMs || 0), 3)
    }
    check('backpressure_stalled', end.working === 0 && end.items === mid.items && end.items === p.machines * 64,
      'outputs full: machines working ' + mid.working + ' -> ' + end.working + ', output items ' + mid.items + ' -> ' + end.items + ' (full: ' + (p.machines * 64) + '); mean tick ' +
      pressSamples.meanMs + ' ms stalled vs ' + p.windowStats.meanMs + ' ms running (difference ' + p.backpressure.meanVsWindowMs + ' ms)')
    p.samples = p.samples.slice(0, p.pressSamples0)
    p.phase = 'abandon'
    p.phaseAt = S.tick
  }

  // the abandoned endpoints: the band is cleared with the tower and every cover still in it; the network must forget them
  function abandon(p) {
    var el = S.tick - p.phaseAt
    if (el === 0) {
      clearBand()
      p.trackedAtClear = trackedInBand()
      return
    }
    if (el === 1) {
      dropEntities()
      p.entitiesAfterClear = bandEntities()
    }
    if (el < S.cfg.cleanupTicks) return
    var left = trackedInBand()
    p.cleanup = { trackedAtClear: p.trackedAtClear, trackedAfter: left, entitiesAfter: p.entitiesAfterClear, ticks: el }
    if (p.built) check(p.name + '_endpoints_dropped', left === 0, 'tracked wireless endpoints in the band: ' + p.trackedAtClear + ' at the clear, ' + left + ' after ' + el + ' ticks (settlements every ' +
      wireless().settleTicks + ' ticks)')
    finishProfile(p)
  }

  function finishProfile(p) {
    var sum = summarize(p)
    S.summaries.push(sum)
    note('summary_' + p.name, JSON.stringify(sum))
    p.phase = 'done'
  }

  function clearBand() {
    for (var z = Z0; z <= Z1; z += 16) {
      for (var y = Y0; y <= Y1; y += 8) command('fill ' + X0 + ' ' + y + ' ' + z + ' ' + X1 + ' ' + Math.min(y + 7, Y1) + ' ' + Math.min(z + 15, Z1) + ' minecraft:air')
    }
  }

  // ---------------------------------------------------------------- run

  function writeExport() {
    var doc = {
      format: 'gg-factory-load-1',
      source: 'gg_test_factory_load (tools/test/overlay/kubejs/server_scripts)',
      time: new Date().toISOString(),
      budgetMs: BUDGET_MS,
      config: S.cfg,
      jvm: { maxHeapMb: round(maxMb(), 0) },
      profiles: S.summaries,
      forced: { before: S.forcedBefore, after: S.forcedAfter },
      loaded: { before: S.loadedBefore, after: S.loadedAfter },
      note: 'Baselines of one host and commit: never compare runs from different machines or concurrent-load conditions as equivalent.'
    }
    try {
      try { Java.loadClass('dev.latvian.mods.kubejs.KubeJSPaths').dir(EXPORT_DIR) } catch (e0) { }
      JsonIO.write(EXPORT, Java.loadClass('com.google.gson.JsonParser').parseString(JSON.stringify(doc)))
      note('export', EXPORT + ': ' + S.summaries.length + ' profiles')
    } catch (e) {
      check('export', false, 'could not write ' + EXPORT + ': ' + errText(e))
    }
  }

  function finish() {
    if (S.finished) return
    S.finished = true
    try { clearBand() } catch (e) { }
    try { dropEntities() } catch (e) { }
    try { command('forceload remove ' + X0 + ' ' + Z0 + ' ' + X1 + ' ' + Z1) } catch (e) { }
    try {
      var w = wireless()
      w.setStored(S.server, S.storeBefore)
      w.paused = S.pausedBefore
    } catch (e) { }
    S.forcedAfter = forcedChunks()
    S.loadedAfter = loadedChunks()
    check('forced_chunks_released', S.forcedBefore !== null && S.forcedAfter === S.forcedBefore, 'forced chunks ' + S.forcedBefore + ' before, ' + S.forcedAfter + ' after cleanup')
    note('loaded_chunks', 'loaded ' + S.loadedBefore + ' before, ' + S.loadedAfter + ' right after cleanup (unloading is deferred by the server)')
    writeExport()
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }

  function readConfig() {
    var cfg = {
      warmupTicks: 60, windowTicks: 200, backpressureTicks: 120, cleanupTicks: 60, sampleEvery: 10,
      profiles: {
        control: { tier: 0, machines: 0, factories: 0 },
        midgame: { tier: 3, machines: 24, factories: 0 },
        endgame: { tier: 8, machines: 16, factories: 4 }
      }
    }
    try {
      var raw = JsonIO.read(CONFIG)
      if (raw !== null && raw !== undefined) {
        var o = JSON.parse(String(raw))
        ;['warmupTicks', 'windowTicks', 'backpressureTicks', 'cleanupTicks', 'sampleEvery'].forEach(function (k) {
          if (typeof o[k] === 'number' && o[k] > 0) cfg[k] = o[k]
        })
        if (o.profiles) ORDER.forEach(function (n) { if (o.profiles[n]) cfg.profiles[n] = o.profiles[n] })
      }
    } catch (e) {
      note('config', 'defaults used: ' + errText(e))
    }
    return cfg
  }

  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, summaries: [], idx: 0, p: null }
    S.level = server.getLevel('minecraft:overworld')
    S.cfg = readConfig()
    var w = wireless()
    S.pausedBefore = w.paused === true
    S.storeBefore = Number(w.stored(server))
    S.forcedBefore = forcedChunks()
    S.loadedBefore = loadedChunks()
    command('forceload add ' + X0 + ' ' + Z0 + ' ' + X1 + ' ' + Z1)
    clearBand()
    note('start', 'band X ' + X0 + '-' + X1 + ' Z ' + Z0 + '-' + Z1 + ' Y ' + Y0 + '-' + Y1 + ', ' + ORDER.join(', ') + '; window ' + S.cfg.windowTicks + ' ticks after ' + S.cfg.warmupTicks +
      '; max heap ' + round(maxMb(), 0) + ' MB; forced chunks (with the band ' + forcedChunks() + ')')
    startNext()
  }
  function startNext() {
    if (S.idx >= ORDER.length) { finish(); return }
    startProfile(ORDER[S.idx++])
  }

  ServerEvents.customCommand('gg_test_factory_load', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestFactoryLoadRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestFactoryLoadRequest && Date.now() - LOADED >= 10000) {
        global.ggTestFactoryLoadRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var p = S.p
      if (p === null) return
      if (p.phase === 'build') {
        p.phase = 'form'
        p.phaseAt = S.tick
      } else if (p.phase === 'form') stepForm(p)
      else if (p.phase === 'abandon') abandon(p)
      else if (p.phase === 'done') startNext()
      else stepRun(p)
      if (S.tick > DEADLINE) { check('deadline', false, DEADLINE + '-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false, summaries: [] }
      check('exception', false, errText(e))
      if (!S.finished) { try { if (S.level) finish() } catch (e2) { S.finished = true } }
    }
  })

  global.ggFactoryLoad = { percentile: percentile, stats: stats, rate: rate, summarize: summarize, order: ORDER, budgetMs: BUDGET_MS }
})()
