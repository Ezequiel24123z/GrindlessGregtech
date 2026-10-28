// priority: -8423
// TEST ONLY, UIV-A9. Command: kubejs custom_command gg_test_uiv_mk5
// Band ONLY: X 35456-35519, Z 0-63, Overworld Y 70-100.
//   a9_ring_*    gtceu:uiv_fusion_reactor (second registerFusionTier ring beside the Mk4) forms with 16 UIV 16 A hatches; its internal buffer
//                (read by reflection) is above the int maximum, and it starts and runs c1 (he3he3_fuel, start 4 G, above 2^31) and c2 (pli6_fuel)
//   a9_src_*     gtceu:polarised_proton_source forms and runs rf_dissociation (circuit 1) on detritiated protium
//   a9_dec_*     the converter's three Mk5 rows return 67,108,864, 50,331,648 and 100,663,296 EU/t at 128 parallels
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 35456
  var X1 = 35519
  var Y0 = 70
  var Y1 = 100
  var NAME = 'uiv_mk5'
  var HATCH16 = 'gtceu:uiv_energy_input_hatch_16a'
  var REQUEST = 'ggTestUivMk5Request'
  var RING = 'gtceu:uiv_fusion_reactor'
  var SOURCE = 'gtceu:polarised_proton_source'
  var RUNS = [
    { name: 'c1', fuel: 'gtceu:he3he3_fuel', recipe: 'uiv_he3he3', start: 4000000000, x: 35464 },
    { name: 'c2', fuel: 'gtceu:pli6_fuel', recipe: 'uiv_pli6', start: 3000000000, x: 35484 }
  ]
  var DEC = [
    { name: 'he3he3', id: 'grindless:direct_conversion/uiv_he3he3_plasma', total: 67108864 },
    { name: 'pli6', id: 'grindless:direct_conversion/uiv_pli6_plasma', total: 50331648 },
    { name: 'pn15', id: 'grindless:direct_conversion/uiv_pn15_plasma', total: 100663296 }
  ]

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
    }
    return C
  }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function errText(e) {
    var s = ''
    try { s = String(e.message || '') } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 4).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
  function command(text) { return S.server.runCommandSilent('execute in minecraft:overworld run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return command('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function machine(p) { return classes().Meta.getMachine(S.level, p) }
  function partsLike(ctrl, re) {
    var out = []
    array(ctrl.getParts()).forEach(function (p) { if (re.test(String(p.getDefinition().getId()))) out.push(p) })
    return out
  }
  function topUp(list) { list.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }) }
  // the ring's own NotifiableEnergyContainer, not the hatch list Rhino returns for m.energyContainer
  function ringBuffer(m) {
    var f = m.getClass().getDeclaredField('energyContainer')
    f.setAccessible(true)
    return f.get(m)
  }
  function chargeRing(m) { var b = ringBuffer(m); b.setEnergyStored(b.getEnergyCapacity()) }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) {
    try {
      var err = m.getMultiblockState().error
      var p = err.getPos()
      return String(err.getErrorInfo().getString()) + ' at ' + (p ? p.getX() + ',' + p.getY() + ',' + p.getZ() : '?')
    } catch (e) { return 'unknown ' + e }
  }
  function partIds(ctrl) {
    var out = {}
    array(ctrl.getParts()).forEach(function (p) { var k = String(p.getDefinition().getId()); out[k] = (out[k] || 0) + 1 })
    return JSON.stringify(out)
  }
  function snapshot(m) {
    var rec = m.getRecipeLogic().getLastRecipe()
    if (rec === null || rec === undefined) return null
    var eut = NaN
    try { eut = Number(classes().RecipeHelper.getRealEUtWithIO(rec).getTotalEU()) } catch (e) { }
    return { duration: Number(rec.duration), eut: eut, id: String(rec.id) }
  }

  var DEFAULT_PART = { energy_input: 'gtceu:mv_energy_input_hatch', input_bus: 'gtceu:hv_input_bus', output_bus: 'gtceu:hv_output_bus',
    input_hatch: 'gtceu:hv_input_hatch', output_hatch: 'gtceu:hv_output_hatch' }
  // placement from the pattern description (lib/patterns.js); ov(cell) returns a block id to replace the default, or null
  function placeMachine(id, cx, cy, cz, ov) {
    var desc = global.grindless.patterns.describe(id)
    if (!desc) throw new Error('no structure description for ' + id)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, ch: ch, sym: sym })
        }
      })
    })
    var controller = null
    var count = 0
    cells.forEach(function (c) {
      c.x = cx + (c.ci - ctrl.ci)
      c.y = cy + (c.ri - ctrl.ri)
      c.z = cz - (c.si - ctrl.si)
    })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = ov ? ov(c) : null
      if (!block) {
        if (sym.kind === 'controller') block = id
        else if (sym.kind === 'blocks') block = sym.blocks[0]
        else if (sym.kind === 'part') block = DEFAULT_PART[sym.ability]
        else if (sym.kind === 'oneOf') {
          sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
        }
      }
      if (!block) return
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      var props = /hatch|bus/.test(block) ? '[facing=north]' : ''
      put(c.x, c.y, c.z, block + props)
      count++
    })
    put(controller.x, controller.y, controller.z, id + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), blocks: count + 1 }
  }
  function placeCheck(u, placed) {
    u.pos = placed.pos
    u.phase = 'forming'
    u.started = S.tick
    note(u.name + '_placed', 'controller ' + placed.pos.getX() + ',' + placed.pos.getY() + ',' + placed.pos.getZ() + ', ' + placed.blocks + ' blocks')
  }
  function waitForm(u, m) {
    var waited = S.tick - u.started
    if (!m || !formCheck(m, waited)) {
      if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
      return false
    }
    return true
  }
  function setTank(h, id, amount) {
    h.tank.setFluidInTank(0, Fluid.of(id, amount).getFluidStack())
  }

  // ---------------------------------------------------------------- the ring
  function ringBuild(u) {
    var e = 0
    var i = 0
    var o = 0
    placeCheck(u, placeMachine(RING, u.x, 80, 30, function (c) {
      if (c.ch === 'E' && e < 16) { e++; return HATCH16 }
      if (c.ch === 'I' && i < 1) { i++; return 'gtceu:hv_input_hatch' }
      if (c.ch === 'O' && o < 1) { o++; return 'gtceu:hv_output_hatch' }
      return null
    }))
  }
  function ringTick(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!waitForm(u, m)) return
      u.m = m
      u.energy = partsLike(m, /uiv_energy_input_hatch_16a/)
      u.inHatches = partsLike(m, /input_hatch/).filter(function (p) { return !/energy/.test(String(p.getDefinition().getId())) })
      var cap = NaN
      try { cap = Number(ringBuffer(m).getEnergyCapacity()) } catch (x) { note(u.name + '_buffer', 'reflection failed: ' + errText(x)) }
      var tier = NaN
      try { tier = Number(m.getTier()) } catch (x) { }
      if (u.name === 'ring_c1') {
        check('a9_ring_formed', u.energy.length === 16 && tier === 11, 'class ' + m.getClass().getSimpleName() + ', tier ' + tier + ', UIV 16 A hatches ' + u.energy.length + ', parts ' + partIds(m))
        check('a9_ring_buffer_long', cap > 2147483647, 'internal buffer ' + cap + ' EU, int maximum 2147483647 (16 x 2^5 x 10,000,000 = 5,120,000,000 expected)')
      } else check(u.name + '_formed', u.energy.length === 16, 'parts ' + partIds(m) + ', buffer ' + cap)
      u.phase = 'start'
      return
    }
    if (u.phase === 'start') {
      try { setTank(u.inHatches[0], u.run.fuel, 4000) } catch (x) { note(u.name + '_fill', 'fill failed: ' + errText(x)) }
      topUp(u.energy)
      try { chargeRing(m) } catch (x) { note(u.name + '_charge', 'charge failed: ' + errText(x)) }
      m.getRecipeLogic().updateTickSubscription()
      u.phase = 'run'
      u.started = S.tick
      return
    }
    if (u.phase === 'run') {
      topUp(u.energy)
      var rlg = m.getRecipeLogic()
      if (!rlg.isWorking()) { try { chargeRing(m) } catch (x) { } }
      if (rlg.isWorking() || S.tick - u.started > 600) {
        var s = snapshot(m)
        var ok = rlg.isWorking() && s !== null && s.id.indexOf(u.run.recipe) >= 0
        check('a9_ring_' + u.run.name + '_runs', ok, 'working ' + rlg.isWorking() + ', start ' + u.run.start + ', recipe ' + (s ? s.id + ' ' + s.eut + ' EU/t ' + s.duration + ' t' : 'none') + ', reasons ' + String(rlg.getFailureReasons()))
        u.phase = 'done'
      }
    }
  }

  // ---------------------------------------------------------------- the proton source
  function srcBuild(u) {
    var inB = 0
    var outB = 0
    var inH = 0
    var en = 0
    var outH = 0
    placeCheck(u, placeMachine(SOURCE, 35500, 75, 40, function (c) {
      if (c.sym.kind !== 'oneOf' || c.ch !== 'X') return null
      if (en < 1) { en++; return 'gtceu:uiv_energy_input_hatch' }
      if (inB < 1) { inB++; return 'gtceu:hv_input_bus' }
      if (outB < 1) { outB++; return 'gtceu:hv_output_bus' }
      if (inH < 1) { inH++; return 'gtceu:hv_input_hatch' }
      if (outH < 2) { outH++; return 'gtceu:hv_output_hatch' }
      return null
    }))
  }
  function srcTick(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!waitForm(u, m)) return
      u.energy = partsLike(m, /energy_input_hatch/)
      u.inH = partsLike(m, /input_hatch/).filter(function (p) { return !/energy/.test(String(p.getDefinition().getId())) })[0]
      u.bus = partsLike(m, /input_bus/)[0]
      check('a9_src_formed', u.energy.length > 0 && !!u.inH, 'class ' + m.getClass().getSimpleName() + ', parts ' + partIds(m))
      try { setTank(u.inH, 'gtceu:detritiated_protium', 16000) } catch (x) { note('a9_src_fill', errText(x)) }
      try {
        var st = u.bus.getInventory().storage
        st.setStackInSlot(0, Item.of('gtceu:programmed_circuit', '{Configuration:1}'))
      } catch (x) { }
      topUp(u.energy)
      u.started = S.tick
      u.phase = 'run'
      return
    }
    topUp(u.energy)
    var rlg = m.getRecipeLogic()
    if (rlg.isWorking() || S.tick - u.started > 400) {
      var s = snapshot(m)
      check('a9_src_runs', rlg.isWorking() && s !== null && s.id.indexOf('rf_dissociation') >= 0, 'working ' + rlg.isWorking() + ', recipe ' + (s ? s.id + ' ' + s.eut + ' EU/t ' + s.duration + ' t' : 'none') + ', reasons ' + String(rlg.getFailureReasons()))
      u.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- the converter rows
  function decTick(u) {
    DEC.forEach(function (d) {
      var rec = null
      try {
        var opt = S.server.getRecipeManager().byKey(new (classes().RL)(d.id))
        rec = opt.isPresent() ? opt.get() : null
      } catch (x) { }
      if (rec === null) { check('a9_dec_' + d.name, false, 'recipe ' + d.id + ' not found'); return }
      var per = NaN
      try { per = Math.abs(Number(classes().RecipeHelper.getRealEUtWithIO(rec).getTotalEU())) } catch (x) { }
      check('a9_dec_' + d.name, per * 128 === d.total, 'row ' + per + ' EU/t x 128 = ' + (per * 128) + ', want ' + d.total)
    })
    u.phase = 'done'
  }

  // ---------------------------------------------------------------- driver
  function clear() {
    for (var z = 0; z < 64; z += 8) command('fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { clear() } catch (e) { }
    command('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, units: [] }
    S.level = server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    RUNS.forEach(function (r) {
      var u = { name: 'ring_' + r.name, x: r.x, run: r, tick: ringTick, phase: 'forming', started: 0 }
      try { ringBuild(u); S.units.push(u) } catch (e) { check('ring_' + r.name + '_build_exception', false, errText(e)) }
    })
    var p = { name: 'src', tick: srcTick, phase: 'forming', started: 0 }
    try { srcBuild(p); S.units.push(p) } catch (e) { check('src_build_exception', false, errText(e)) }
    S.units.push({ name: 'dec', tick: decTick, phase: 'dec', started: 0 })
  }
  ServerEvents.customCommand('gg_test_uiv_mk5', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var pending = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try { u.tick(u) } catch (e) { check(u.name + '_exception', false, 'phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
        if (u.phase !== 'done') pending++
      })
      if (pending === 0) finish()
      else if (S.tick > 2600) { check('deadline', false, '2600-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
