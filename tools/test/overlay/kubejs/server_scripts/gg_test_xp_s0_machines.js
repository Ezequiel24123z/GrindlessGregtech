// priority: -10374
// TEST ONLY, XP-S0a (bench overlay, never shipped; needs the startup overlay on: kubejs/config/gg_test_xp_s0.json {"enabled": true}).
// Command: kubejs custom_command gg_test_xp_s0_machines. Band ONLY: X 43520-43583, Z 0-63, Overworld Y 70-85. Everything placed is cleared before DONE.
//   s0_1a/1b/1c  1, 4 and 64 gtceu:max_substation_input_hatch_64a in gtceu:gg_xp_s0_plate run a macerator row at 2^37, 2^39 and 2^43 EU/t, fed through the energy-net path (64 A at V[MAX] per hatch per tick)
//   s0_2         one gtceu:max_gg_xp_s0_in1024 (1,024 A) runs a row at 2^41 EU/t
//   s0_3         gg_xp_s0_kerr cable (V[MAX], 256 A, loss 0) between a 256 A dynamo hatch and a 256 A input hatch; a 1,024 A pair on the same cable is the control
//   s0_4a-d      gtceu:gg_xp_s0_genplate: generation recipes above 2^30 EU/t on 16 A, 64 A (one and four) and 1,024 A dynamo hatches; a row above the hatches' V x A is a control
//   s0_5         a tier 14 parallel hatch that reports 4,194,304 copies (private field raised by reflection, and a Java.extend subclass), light and heavy probes
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 43520
  var X1 = 43583
  var Y0 = 70
  var Y1 = 85
  var NAME = 'xp_s0_machines'
  var REQUEST = 'ggTestXpS0MachinesRequest'
  var MAXT = 14
  var SUB_IN = 'gtceu:max_substation_input_hatch_64a'
  var SUB_OUT = 'gtceu:max_substation_output_hatch_64a'
  var HATCH16 = 'gtceu:max_energy_input_hatch_16a'
  var DYNAMO16 = 'gtceu:max_energy_output_hatch_16a'
  var IN1024 = 'gtceu:max_gg_xp_s0_in1024'
  var OUT1024 = 'gtceu:max_gg_xp_s0_out1024'
  var IN256 = 'gtceu:max_gg_xp_s0_in256'
  var OUT256 = 'gtceu:max_gg_xp_s0_out256'
  var PH_REFL = 'gtceu:max_gg_xp_s0_ph_refl'
  var PH_EXT = 'gtceu:max_gg_xp_s0_ph_ext'
  var PLATE = 'gtceu:gg_xp_s0_plate'
  var GENPLATE = 'gtceu:gg_xp_s0_genplate'
  var CABLE = 'gtceu:gg_xp_s0_kerr_single_cable'
  var COPIES = 4194304
  var RUN_TICKS = 200

  function pow2(n) { return String(Math.pow(2, n)) }

  // macerator probes: a catalyst in, a distinct item out (the output proves the run completed); an EU/t above 2^31 is a long
  var MACER = [
    { key: 's1a', inp: 'minecraft:allium', out: 'minecraft:azure_bluet', eut: pow2(37) },
    { key: 's1b', inp: 'minecraft:blue_orchid', out: 'minecraft:oxeye_daisy', eut: pow2(39) },
    { key: 's1c', inp: 'minecraft:cornflower', out: 'minecraft:lily_of_the_valley', eut: pow2(43) },
    { key: 's2', inp: 'minecraft:poppy', out: 'minecraft:dandelion', eut: pow2(41) },
    { key: 's5l', inp: 'minecraft:red_tulip', out: null, eut: '2048' },
    { key: 's5h', inp: 'minecraft:orange_tulip', out: null, eut: '6144' }
  ]
  var GENS = [
    { key: 'g33', inp: 'minecraft:iron_nugget', eut: pow2(33) },
    { key: 'g35', inp: 'minecraft:gold_nugget', eut: pow2(35) },
    { key: 'g36a', inp: 'minecraft:copper_ingot', eut: pow2(36) },
    { key: 'g36b', inp: 'minecraft:iron_ingot', eut: pow2(36) },
    { key: 'g37', inp: 'minecraft:gold_ingot', eut: pow2(37) },
    { key: 'g38', inp: 'minecraft:amethyst_shard', eut: pow2(38) },
    { key: 'g39', inp: 'minecraft:diamond', eut: pow2(39) },
    { key: 'g41', inp: 'minecraft:emerald', eut: pow2(41) }
  ]
  function macer(key) { return MACER.filter(function (m) { return m.key === key })[0] }
  function gen(key) { return GENS.filter(function (g) { return g.key === key })[0] }

  var marker = JsonIO.read('kubejs/config/gg_test_xp_s0.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'

  ServerEvents.recipes(function (event) {
    if (!ON) return
    var Long = Java.loadClass('java.lang.Long')
    MACER.forEach(function (m) {
      try {
        var b = event.recipes.gtceu.macerator('gg_test_xp_s0:' + m.key).notConsumable('1x ' + m.inp)
        if (m.out) b = b.itemOutputs('1x ' + m.out)
        b.EUt(Long.valueOf(m.eut)).duration(RUN_TICKS)
      } catch (e) { console.error('[gg_test xp_s0] could not add the macerator probe ' + m.key + ': ' + errText(e)) }
    })
    GENS.forEach(function (g) {
      try {
        event.recipes.gtceu.gg_xp_s0_gen('gg_test_xp_s0:' + g.key).itemInputs('1x ' + g.inp).EUt(Long.valueOf('-' + g.eut)).duration(RUN_TICKS)
      } catch (e) { console.error('[gg_test xp_s0] could not add the generator probe ' + g.key + ': ' + errText(e)) }
    })
  })

  function classes() {
    if (C !== null) return C
    C = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      FU: Java.loadClass('com.gregtechceu.gtceu.utils.FormattingUtil'),
      GTUtil: Java.loadClass('com.gregtechceu.gtceu.utils.GTUtil'),
      Long: Java.loadClass('java.lang.Long')
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
  function stored(list) {
    var n = 0
    list.forEach(function (p) { n += Number(p.energyContainer.getEnergyStored()) })
    return n
  }
  function topUp(list) { list.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }) }
  // one tick of the hatch's own inflow (V x A): the recipe can start, but no spare buffer hides a shortfall
  function leanFill(list, amps) { var V = Number(GTValues.V[MAXT]); list.forEach(function (p) { p.energyContainer.setEnergyStored(V * amps) }) }
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
    var par = NaN
    try { par = Number(rec.parallels) } catch (e) { }
    return { duration: Number(rec.duration), eut: eut, id: String(rec.id), parallels: par, rec: rec }
  }
  function status(m) { return String(m.getRecipeLogic().getStatus()) }
  function reasons(m) { return String(m.getRecipeLogic().getFailureReasons()) }
  function setSlots(p, list) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    list.forEach(function (e, i) { st.setStackInSlot(i, Item.of(e[0], e[1])) })
  }
  function setBus(p, id) { setSlots(p, id ? [[id, 1]] : []) }
  function countIn(p, id) {
    var st = p.getInventory().storage
    var n = 0
    for (var i = 0; i < st.getSlots(); i++) { var s = st.getStackInSlot(i); if (String(s.getId()) === id) n += Number(s.getCount()) }
    return n
  }

  var DEFAULT_PART = { input_bus: 'gtceu:hv_input_bus', output_bus: 'gtceu:hv_output_bus' }
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
  // the first u.count cells of the roof take the hatch, the rest stay casing; P takes the parallel hatch
  function overrides(u) {
    var n = 0
    return function (c) {
      if (c.ch === 'H') { if (n < u.count) { n++; return u.hatch } return null }
      if (c.ch === 'P' && u.ph) return u.ph
      return null
    }
  }
  function tierReadout(u, rec) {
    var G = classes().GTUtil
    var L = classes().Long
    var out = []
    try { out.push('V[14]=' + GTValues.V[MAXT] + ' VN=' + GTValues.VN[MAXT] + ' MAX=' + GTValues.MAX) } catch (e) { out.push('V: ' + e) }
    try { out.push('getTierByVoltage(' + u.eutStr + ')=' + G.getTierByVoltage(L.valueOf(u.eutStr))) } catch (e) { out.push('getTierByVoltage: ' + e) }
    try { out.push('getFloorTierByVoltage=' + G.getFloorTierByVoltage(L.valueOf(u.eutStr))) } catch (e) { out.push('getFloorTierByVoltage: ' + e) }
    try { out.push('getRecipeEUtTier=' + classes().RecipeHelper.getRecipeEUtTier(rec)) } catch (e) { out.push('getRecipeEUtTier: ' + e) }
    try { out.push('formatNumbers(EU/t)=' + classes().FU.formatNumbers(L.valueOf(u.eutStr))) } catch (e) { out.push('formatNumbers: ' + e) }
    return out.join('; ')
  }
  function raise(hatch, n) {
    var k = hatch.getClass()
    var last = ''
    while (k !== null) {
      try {
        var f = k.getDeclaredField('currentParallel')
        f.setAccessible(true)
        f.setInt(hatch, n)
        return 'currentParallel set on ' + String(k.getSimpleName())
      } catch (e) { last = errText(e); k = k.getSuperclass() }
    }
    throw new Error('no settable currentParallel field: ' + last)
  }

  // ---------------------------------------------------------------- S0-1, S0-2, S0-5: the plate on input hatches
  function plateBuild(u) { placeCheck(u, placeMachine(PLATE, u.cx, 75, u.cz, overrides(u))) }
  function feedTick(u) {
    var before = stored(u.energy)
    var drain = u.after === null ? 0 : u.after - before
    var fed = 0
    if (u.amps) {
      var V = Number(GTValues.V[MAXT])
      u.energy.forEach(function (p) { fed += Number(p.energyContainer.acceptEnergyFromNetwork(null, V, u.amps)) * V })
    } else {
      topUp(u.energy)
      fed = drain
    }
    u.after = stored(u.energy)
    return { drain: drain, fed: fed }
  }
  function plateTick(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!waitForm(u, m)) return
      u.energy = partsLike(m, u.re)
      u.bus = partsLike(m, /input_bus/)[0]
      u.out = partsLike(m, /output_bus/)[0]
      var ec = m.getEnergyContainer()
      var volt = NaN
      var amps = NaN
      try { volt = Number(ec.getInputVoltage()); amps = Number(ec.getInputAmperage()) } catch (x) { }
      var cap = u.energy.length ? Number(u.energy[0].energyContainer.getEnergyCapacity()) : NaN
      var hv = u.energy.length ? Number(u.energy[0].energyContainer.getInputVoltage()) : NaN
      var ha = u.energy.length ? Number(u.energy[0].energyContainer.getInputAmperage()) : NaN
      var mv = 'n/a'
      try { mv = String(m.getMaxVoltage()) } catch (x) { }
      check(u.name + '_formed', u.energy.length === u.count && !!u.bus && !!u.out,
        'class ' + m.getClass().getSimpleName() + ', hatches ' + u.energy.length + ' of ' + u.count + ', hatch ' + hv + ' V x ' + ha + ' A, buffer ' + cap + ', list ' + volt + ' V x ' + amps + ' A, machine max voltage ' + mv + ', parts ' + partIds(m))
      if (u.ph) {
        var ph = m.getParallelHatch()
        var hatch = ph.isPresent() ? ph.get() : null
        var how = 'none'
        if (hatch && u.reflect) { try { how = raise(hatch, COPIES) } catch (x) { how = 'reflection failed: ' + errText(x) } }
        var rep = hatch ? Number(hatch.getCurrentParallel()) : NaN
        check(u.name + '_reports', rep === COPIES, 'hatch ' + (hatch ? hatch.getClass().getName() : 'none') + ' reports ' + rep + ' (expected 4,194,304 = 4^11); ' + how)
      }
      setBus(u.bus, u.inp)
      if (u.amps) leanFill(u.energy, u.amps)
      else topUp(u.energy)
      u.after = null
      u.started = S.tick
      u.phase = 'start'
      return
    }
    var e = feedTick(u)
    var logic = m.getRecipeLogic()
    if (u.phase === 'start') {
      var snap = String(logic.getStatus()) === 'WORKING' ? snapshot(m) : null
      if (snap !== null && snap.id.indexOf(u.key) >= 0) {
        var want = Number(u.eutStr) * u.copies
        var factor = snap.eut / want
        var okEut = snap.eut === want
        if (!okEut && u.ph && snap.eut > 0 && factor === Math.floor(factor)) {
          var r = factor
          while (r > 1 && r % 4 === 0) r = r / 4
          okEut = r === 1
        }
        check(u.name + '_eut_long', okEut, 'recipe EU/t ' + snap.eut + ' (copies x probe = ' + want + ', factor ' + factor + (u.ph ? ', a power of 4 is the overclock' : '') + '; as an int it would read ' + (classes().Long.valueOf(String(snap.eut)).intValue()) + '), copies ' + snap.parallels + ', duration ' + snap.duration)
        if (u.ph) check(u.name + '_copies', snap.parallels === u.copies, 'copies ' + snap.parallels + ' (expected ' + u.copies + ')')
        note(u.name + '_tier', tierReadout(u, snap.rec))
        u.want = want
        u.runStart = S.tick
        u.sum = 0
        u.fed = 0
        u.n = 0
        u.min = Infinity
        u.max = 0
        u.neg = 0
        u.first = u.after
        u.phase = u.ticks > 0 ? 'long' : 'done'
      } else if (S.tick - u.started > 400) {
        var why1 = ''
        try { why1 = String(logic.getFancyTooltip()) } catch (x) { why1 = 'tooltip: ' + x }
        check(u.name + '_starts', false, 'the probe did not start: status ' + logic.getStatus() + ', reasons ' + String(logic.getFailureReasons()) + ', ' + why1 + ', last ' + (snap ? snap.id : 'none'))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'long') {
      var run = S.tick - u.runStart
      if (run > 2) {
        u.sum += e.drain
        u.fed += e.fed
        u.n++
        if (run > 12) { u.fedS = (u.fedS || 0) + e.fed; u.nS = (u.nS || 0) + 1 }
        if (e.drain < u.min) u.min = e.drain
        if (e.drain > u.max) u.max = e.drain
        if (e.drain < 0) u.neg++
      }
      if (run >= u.ticks + 40) {
        var made = u.outItem ? countIn(u.out, u.outItem) : -1
        var avg = u.sum / u.n
        var avgFed = u.fed / u.n
        var drift = u.after - u.first
        check(u.name + '_draw', u.neg === 0 && u.n > 0 && Math.abs(avg - u.want) < u.want * 0.01, 'per-tick draw over ' + u.n + ' ticks: avg ' + Math.round(avg) + ', min ' + u.min + ', max ' + u.max + ', negative samples ' + u.neg + ' (expected ' + u.want + ')')
        var avgFedS = u.nS > 0 ? u.fedS / u.nS : 0
        check(u.name + '_sustained', avgFedS >= u.want * 0.99, 'energy-net inflow after the 12-tick start-up: avg ' + Math.round(avgFedS) + ' EU/t (whole run ' + Math.round(avgFed) + ', ' + u.energy.length + ' hatches x ' + u.amps + ' A x V[MAX]) against a draw of ' + u.want + '; stored drift over the run ' + drift + ' EU')
        check(u.name + '_completes', made >= 1, 'the output bus holds ' + made + ' ' + u.outItem + ' ' + run + ' ticks after the start (a ' + u.ticks + ' t recipe completed); status ' + status(m))
        u.phase = 'done'
      }
    }
  }

  // ---------------------------------------------------------------- S0-3: the cable
  function cableBuild(u) {
    var z = 60
    put(u.x, 75, z, u.srcId + '[facing=north]')
    for (var i = 1; i <= 3; i++) put(u.x, 75, z - i, u.cable || CABLE)
    put(u.x, 75, z - 4, u.sinkId + '[facing=south]')
    u.src = pos(u.x, 75, z)
    u.wire = [pos(u.x, 75, z - 1), pos(u.x, 75, z - 2), pos(u.x, 75, z - 3)]
    u.sink = pos(u.x, 75, z - 4)
    try {
      var north = Direction.NORTH
      var south = Direction.SOUTH
      u.wire.forEach(function (p) {
        var be = S.level.getBlockEntity(p)
        be.setConnection(north, true, false)
        be.setConnection(south, true, false)
      })
    } catch (e) { check(u.name + '_build', false, errText(e)) }
    u.phase = 'warm'
    u.started = S.tick
  }
  function cableAlive(u) {
    return u.wire.every(function (p) { return String(S.level.getBlock(p.getX(), p.getY(), p.getZ()).getId()) === (u.cable || CABLE) })
  }
  function cableTick(u) {
    var src = machine(u.src)
    var sink = machine(u.sink)
    if (!src || !sink) { check(u.name + '_machines', false, 'hatches missing: source ' + !!src + ', sink ' + !!sink); u.phase = 'done'; return }
    var sc = src.energyContainer
    var kc = sink.energyContainer
    var V = Number(GTValues.V[MAXT])
    if (u.phase === 'warm') {
      if (S.tick - u.started === 1) {
        var ok = Number(sc.getOutputVoltage()) === V && Number(sc.getOutputAmperage()) === u.amps && Number(kc.getInputAmperage()) === u.amps
        var detail = 'dynamo ' + sc.getOutputVoltage() + ' V x ' + sc.getOutputAmperage() + ' A, sink ' + kc.getInputVoltage() + ' V x ' + kc.getInputAmperage() + ' A, buffers ' + sc.getEnergyCapacity() + ' / ' + kc.getEnergyCapacity() + ', V[14] ' + V
        try { detail += '; source front ' + src.getFrontFacing() + ' outputs north ' + sc.outputsEnergy(Direction.NORTH) + ', sink front ' + sink.getFrontFacing() + ' inputs south ' + kc.inputsEnergy(Direction.SOUTH) } catch (x) { detail += '; facing unreadable: ' + errText(x) }
        if (u.strict) check(u.name + '_hatches', ok, detail)
        else note(u.name + '_hatches', detail)
        try {
          var be = S.level.getBlockEntity(u.wire[0])
          var nd = be.getNodeData()
          note(u.name + '_wire_property', 'voltage ' + nd.getVoltage() + ', amperage ' + nd.getAmperage() + ', loss per block ' + nd.getLossPerBlock() + ', block ' + CABLE)
        } catch (e) { note(u.name + '_wire_property', 'unreadable: ' + errText(e)) }
      }
      if (S.tick - u.started === 2) {
        // the cable registers in its energy net from a scheduled block tick; force it in case that tick never fires here
        u.wire.forEach(function (p) {
          try {
            var st = S.level.getBlockState(p)
            st.getBlock().tick(st, S.level, p, S.level.getRandom())
          } catch (x) { note(u.name + '_force_tick', errText(x)) }
        })
      }
      if (S.tick - u.started >= 20) { u.phase = 'sample'; u.gain = []; u.draw = []; u.started = S.tick }
      u.warmGain = (u.warmGain || []).concat([Number(kc.getEnergyStored())])
      sc.setEnergyStored(sc.getEnergyCapacity())
      kc.setEnergyStored(0)
      return
    }
    if (u.phase === 'sample') {
      u.gain.push(Number(kc.getEnergyStored()))
      u.draw.push(Number(sc.getEnergyCapacity()) - Number(sc.getEnergyStored()))
      sc.setEnergyStored(sc.getEnergyCapacity())
      kc.setEnergyStored(0)
      if (S.tick - u.started >= 40) {
        var alive = cableAlive(u)
        var steady = u.gain.slice(5)
        var want = V * u.amps
        var allWant = steady.length > 0 && steady.every(function (g) { return g === want })
        var equal = steady.every(function (g, i) { return u.draw.slice(5)[i] - g === 0 })
        var netInfo = ''
        try {
          var be0 = S.level.getBlockEntity(u.wire[1])
          var pn = be0.getPipeNet()
          netInfo = '; pipe net ' + (pn === null ? 'null' : 'present')
          if (pn !== null) netInfo += ', ' + String(pn.getAllNodes().size()) + ' nodes'
        } catch (x) { netInfo = '; net unreadable: ' + errText(x) }
        note(u.name + '_samples', 'warm-up sink gain ' + (u.warmGain || []).slice(0, 12).join(',') + '; sample sink gain ' + steady.slice(0, 6).join(',') + ' ...; source draw ' + u.draw.slice(5, 11).join(',') + ' ...; cable intact ' + alive + netInfo)
        if (u.strict) {
          check(u.name + '_flow', alive && allWant, 'sink gained ' + (steady.length ? steady[0] : 'none') + ' EU/t (expected ' + want + ' = ' + u.amps + ' A x V[MAX], loss 0) on every one of ' + steady.length + ' ticks: ' + allWant + '; cable intact ' + alive)
          check(u.name + '_loss_zero', equal, 'source draw minus sink gain is exactly 0 EU/t on every tick: ' + equal)
        }
        u.phase = 'done'
      }
    }
  }

  // ---------------------------------------------------------------- S0-4: generation recipes on dynamo hatches
  function genBuild(u) {
    var n = 0
    placeCheck(u, placeMachine(GENPLATE, u.cx, 75, 40, function (c) {
      if (c.ch === 'H') { if (n < u.count) { n++; return u.hatch } return null }
      return null
    }))
  }
  function genTick(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!waitForm(u, m)) return
      u.bus = partsLike(m, /input_bus/)[0]
      u.dyn = partsLike(m, u.re)
      var isGen = 'unknown'
      try { isGen = String(m.getDefinition().isGenerator()) } catch (x) { }
      var cap = u.dyn.length ? u.dyn[0].energyContainer.getEnergyCapacity() : 'none'
      var oa = u.dyn.length ? u.dyn[0].energyContainer.getOutputVoltage() + ' V x ' + u.dyn[0].energyContainer.getOutputAmperage() + ' A' : 'none'
      check(u.name + '_formed', !!u.bus && u.dyn.length === u.count, 'class ' + m.getClass().getSimpleName() + ', generator ' + isGen + ', dynamo hatches ' + u.dyn.length + ' of ' + u.count + ' (' + oa + ', buffer ' + cap + '), parts ' + partIds(m))
      u.ti = 0
      u.phase = 'load'
      return
    }
    if (u.phase === 'load') {
      if (u.ti >= u.trials.length) { u.phase = 'done'; return }
      setSlots(u.bus, [[gen(u.trials[u.ti].key).inp, 1]])
      u.started = S.tick
      u.phase = 'wait'
      return
    }
    var t = u.trials[u.ti]
    var g = t ? gen(t.key) : null
    if (u.phase === 'wait') {
      var snap = m.getRecipeLogic().isWorking() ? snapshot(m) : null
      if (snap !== null && String(snap.id).indexOf('/' + t.key) < 0) snap = null
      if (snap !== null) {
        u.snap = snap
        u.started = S.tick
        u.phase = 'stored'
      } else if (S.tick - u.started > 200) {
        if (t.run) check(u.name + '_' + t.key, false, g.inp + ': no start; status ' + status(m) + ', reasons ' + reasons(m) + ' (expected a run at ' + g.eut + ' EU/t)')
        else note(u.name + '_' + t.key, g.inp + ' at ' + g.eut + ' EU/t, above the hatches\' V x A: did not start, as the capacity predicts; status ' + status(m))
        setSlots(u.bus, [])
        u.started = S.tick
        u.phase = 'idle'
      }
      return
    }
    if (u.phase === 'stored') {
      if (S.tick - u.started >= 10) {
        var snap2 = u.snap
        var held = stored(u.dyn)
        var detail = g.inp + ': ' + snap2.id + ', ' + snap2.eut + ' EU/t (expected magnitude ' + g.eut + '), copies ' + snap2.parallels + '; dynamo stored ' + held + ' EU after 10 ticks (10 x EU/t = ' + (10 * Number(g.eut)) + ')'
        var generated = held >= 9 * Number(g.eut) && held <= 11 * Number(g.eut)
        if (t.run) check(u.name + '_' + t.key, Math.abs(snap2.eut) === Number(g.eut) && generated, detail)
        else note(u.name + '_' + t.key, 'ran although above the hatches\' V x A: ' + detail)
        setSlots(u.bus, [])
        try { m.getRecipeLogic().resetRecipeLogic() } catch (x) { note(u.name + '_reset', errText(x)) }
        u.started = S.tick
        u.phase = 'idle'
      }
      return
    }
    if (u.phase === 'idle') {
      if (status(m) !== 'WORKING' || S.tick - u.started > 400) {
        u.dyn.forEach(function (p) { p.energyContainer.setEnergyStored(0) })
        u.ti++
        u.phase = 'load'
      }
    }
  }

  // ---------------------------------------------------------------- driver
  function clear() {
    for (var z = 0; z < 64; z += 8) command('fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    global.ggTestXpS0Busy = false
    try { clear() } catch (e) { }
    command('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, units: [] }
    S.level = server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    function add(u, build) {
      try { if (build) build(u); S.units.push(u) } catch (e) { check(u.name + '_build_exception', false, errText(e)) }
    }
    function plate(name, k, row, key, hatch, re, count, amps, ph, reflect, copies) {
      var m = macer(key)
      add({ name: name, tick: plateTick, phase: 'forming', started: 0, cx: X0 + 6 + 10 * k, cz: row, key: key, hatch: hatch, re: re, count: count, amps: amps,
        ph: ph, reflect: reflect, copies: copies, inp: m.inp, outItem: m.out, eutStr: m.eut, ticks: m.out ? RUN_TICKS : 0 }, plateBuild)
    }
    var subRe = /max_substation_input_hatch_64a/
    plate('s0_1a_x1', 0, 12, 's1a', SUB_IN, subRe, 1, 64, null, false, 1)
    plate('s0_1b_x4', 1, 12, 's1b', SUB_IN, subRe, 4, 64, null, false, 1)
    plate('s0_1c_x64', 2, 12, 's1c', SUB_IN, subRe, 64, 64, null, false, 1)
    plate('s0_2_in1024', 3, 12, 's2', IN1024, /max_gg_xp_s0_in1024/, 1, 1024, null, false, 1)
    var h16 = /max_energy_input_hatch_16a/
    plate('s0_5_refl_light', 0, 26, 's5l', HATCH16, h16, 2, 0, PH_REFL, true, COPIES)
    plate('s0_5_refl_heavy', 1, 26, 's5h', HATCH16, h16, 2, 0, PH_REFL, true, COPIES)
    if (Item.exists(PH_EXT)) plate('s0_5_ext_light', 2, 26, 's5l', HATCH16, h16, 2, 0, PH_EXT, false, COPIES)
    else note('s0_5_ext_absent', PH_EXT + ' is not registered: Java.extend of ParallelHatchPartMachine failed at startup (see the startup log)')
    function genUnit(name, k, hatch, re, count, trials) {
      add({ name: name, tick: genTick, phase: 'forming', started: 0, cx: X0 + 4 + 8 * k, hatch: hatch, re: re, count: count, trials: trials }, genBuild)
    }
    genUnit('s0_4a_16a', 0, DYNAMO16, /max_energy_output_hatch_16a/, 1, [{ key: 'g33', run: true }, { key: 'g35', run: true }, { key: 'g36a', run: false }])
    genUnit('s0_4b_sub1', 1, SUB_OUT, /max_substation_output_hatch_64a/, 1, [{ key: 'g36b', run: true }, { key: 'g37', run: true }, { key: 'g38', run: false }])
    genUnit('s0_4c_sub4', 2, SUB_OUT, /max_substation_output_hatch_64a/, 4, [{ key: 'g39', run: true }])
    genUnit('s0_4d_out1024', 3, OUT1024, /max_gg_xp_s0_out1024/, 1, [{ key: 'g41', run: true }])
    add({ name: 's0_3_cable256', tick: cableTick, phase: 'warm', started: 0, x: X0 + 4, srcId: OUT256, sinkId: IN256, amps: 256, strict: true }, cableBuild)
    add({ name: 's0_3_control1024', tick: cableTick, phase: 'warm', started: 0, x: X0 + 12, srcId: OUT1024, sinkId: IN1024, amps: 1024, strict: false }, cableBuild)
    add({ name: 's0_3_stock16', tick: cableTick, phase: 'warm', started: 0, x: X0 + 20, srcId: DYNAMO16, sinkId: HATCH16, amps: 16, strict: false }, cableBuild)
    add({ name: 's0_3_lossy16', tick: cableTick, phase: 'warm', started: 0, x: X0 + 28, srcId: DYNAMO16, sinkId: HATCH16, amps: 16, strict: false, cable: 'gtceu:gg_xp_s0_kerr_lossy_single_cable' }, cableBuild)
  }
  ServerEvents.customCommand('gg_test_xp_s0_machines', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    global.ggTestXpS0Busy = true
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
      else if (S.tick > 4000) { check('deadline', false, '4000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
