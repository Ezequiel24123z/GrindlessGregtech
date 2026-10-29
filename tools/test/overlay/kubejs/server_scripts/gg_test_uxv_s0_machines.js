// priority: -9931
// TEST ONLY, UXV-S0 (bench overlay, never shipped; needs the startup overlay on: kubejs/config/gg_test_uxv_s0.json {"enabled": true}, and a pack
// copy whose uev/foundation.js builders take .tiers(UEV, UIV, UXV)). Command: kubejs custom_command gg_test_uxv_s0_machines
// Band ONLY: X 36128-36191, Z 0-63, Overworld Y 70-100. Everything placed is cleared before DONE.
//   s0_1_*  the UXV hatches (2 A and 16 A) as placed blocks: voltage, amperage, a 16 A buffer above the int range (long); gtceu:gg_uxv_s0_frame forms with a
//           UXV hatch; GTM's own gtceu:assembly_line (preview shape, the energy hatches swapped for UXV ones) forms
//   s0_2_*  gtceu:warp_gate on two UXV 16 A input hatches runs a recipe at 2,147,483,648 EU/t (a long) for 1,200 ticks; the readings are formatted as EMI and Jade would
//   s0_4_*  gtceu:gg_uxv_s0_fusion (registerFusionTier(UXV)) forms with 16 UXV 16 A hatches, stores 10,240,000,000 EU and runs a recipe starting at 10 G
//   s0_6_*  a tier 12 ParallelHatchPartMachine reports 65,536, forms in gg_uxv_s0_frame and bounds a probe by its copies and the energy
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 36128
  var X1 = 36191
  var Y0 = 70
  var Y1 = 100
  var NAME = 'uxv_s0_machines'
  var REQUEST = 'ggTestUxvS0MachinesRequest'
  var HATCH16 = 'gtceu:uxv_energy_input_hatch_16a'
  var HATCH2 = 'gtceu:uxv_energy_input_hatch'
  var PARALLEL = 'gtceu:uxv_gg_uxv_s0_parallel_hatch'
  var FRAME = 'gtceu:gg_uxv_s0_frame'
  var RING = 'gtceu:gg_uxv_s0_fusion'
  var GATE = 'gtceu:warp_gate'
  var AL = 'gtceu:assembly_line'
  var DANDELION = 'minecraft:dandelion'
  var GATE_EUT = '2147483648'
  var GATE_TICKS = 1200

  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.macerator('gg_test_uxv_s0:ph_probe').notConsumable('1x ' + DANDELION).EUt(2048).duration(40)
    } catch (e) { console.error('[gg_test uxv_s0] could not add the macerator probe: ' + errText(e)) }
    try {
      var Long = Java.loadClass('java.lang.Long')
      event.recipes.gtceu.warp_gate('gg_test_uxv_s0:warp_gate/hold_probe').notConsumable('1x ' + DANDELION).EUt(Long.valueOf(GATE_EUT)).duration(GATE_TICKS)
    } catch (e) { console.error('[gg_test uxv_s0] could not add the warp gate probe: ' + errText(e)) }
    try {
      event.recipes.gtceu.fusion_reactor('gg_test_uxv_s0:ring_probe').inputFluids(Fluid.of('gtceu:neon', 10)).outputFluids(Fluid.of('gtceu:helium', 10))
        .EUt(134217728).duration(100).fusionStartEU(10000000000)
    } catch (e) { console.error('[gg_test uxv_s0] could not add the fusion probe: ' + errText(e)) }
  })

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Regs: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
      FU: Java.loadClass('com.gregtechceu.gtceu.utils.FormattingUtil')
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
  function ringBuffer(m) {
    var f = m.getClass().getDeclaredField('energyContainer')
    f.setAccessible(true)
    return f.get(m)
  }
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
    return { duration: Number(rec.duration), eut: eut, id: String(rec.id), parallels: par }
  }
  function setBus(p, id) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    if (id) st.setStackInSlot(0, Item.of(id, 1))
  }
  function setTank(h, id, amount) { h.tank.setFluidInTank(0, Fluid.of(id, amount).getFluidStack()) }
  function allows(sym, ability) {
    return sym.kind === 'oneOf' && sym.options.some(function (o) { return o.kind === 'part' && o.ability === ability })
  }

  var DEFAULT_PART = { energy_input: 'gtceu:mv_energy_input_hatch', input_bus: 'gtceu:hv_input_bus', output_bus: 'gtceu:hv_output_bus',
    input_hatch: 'gtceu:hv_input_hatch', output_hatch: 'gtceu:hv_output_hatch' }
  // placement from the pattern description (lib/patterns.js); ov(cell) returns a block id to replace the default, or null; cell.front = the controller's slice
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
      c.front = c.si === ctrl.si
    })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = ov ? ov(c) : null
      if (!block) {
        if (sym.kind === 'controller') block = id
        else if (sym.kind === 'blocks') block = sym.blocks[0]
        else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
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

  // ---------------------------------------------------------------- S0-1: the hatches as blocks
  function hatchesTick(u) {
    var ids = [['in2', 'gtceu:uxv_energy_input_hatch', 2], ['in16', 'gtceu:uxv_energy_input_hatch_16a', 16], ['out2', 'gtceu:uxv_energy_output_hatch', 2], ['out16', 'gtceu:uxv_energy_output_hatch_16a', 16]]
    if (u.phase === 'place') {
      ids.forEach(function (h, i) { put(36130 + i * 2, 75, 5, h[1] + '[facing=north]') })
      put(36140, 75, 5, 'gtceu:uxv_machine_hull[facing=north]')
      u.started = S.tick
      u.phase = 'read'
      return
    }
    if (S.tick - u.started < 20) return
    var V = Number(GTValues.V[12])
    ids.forEach(function (h, i) {
      var m = machine(pos(36130 + i * 2, 75, 5))
      if (!m) { check('s0_1_hatch_' + h[0], false, 'no machine at the placed ' + h[1]); return }
      var c = m.energyContainer
      var cap = Number(c.getEnergyCapacity())
      var volt = Number(h[0].indexOf('in') === 0 ? c.getInputVoltage() : c.getOutputVoltage())
      var amps = Number(h[0].indexOf('in') === 0 ? c.getInputAmperage() : c.getOutputAmperage())
      check('s0_1_hatch_' + h[0], volt === V && amps === h[2], h[1] + ' tier ' + m.getTier() + ', ' + volt + ' V (V[UXV] ' + V + ') x ' + amps + ' A, buffer ' + cap + ' EU, class ' + m.getClass().getSimpleName())
      if (h[0] === 'in16') {
        check('s0_1_buffer_long', cap > 2147483647, 'a 16 A UXV hatch holds ' + cap + ' EU (int maximum 2147483647; V x 16 x 16 = ' + (V * 256) + ')')
        c.setEnergyStored(c.getEnergyCapacity())
        check('s0_1_buffer_stored', Number(c.getEnergyStored()) === cap, 'stored back ' + c.getEnergyStored() + ' of ' + cap)
        note('s0_1_format', 'formatNumbers(buffer) = ' + classes().FU.formatNumbers(cap))
      }
    })
    var hull = machine(pos(36140, 75, 5))
    check('s0_1_hull', !!hull && Number(hull.getTier()) === 12, 'gtceu:uxv_machine_hull placed, tier ' + (hull ? hull.getTier() : 'none'))
    u.phase = 'done'
  }

  // ---------------------------------------------------------------- S0-1 and S0-6: our frame with a UXV hatch, optionally a tier 12 parallel hatch
  function frameBuild(u) {
    placeCheck(u, placeMachine(FRAME, 36132, 75, 14, function (c) {
      if (c.ch === 'E') return HATCH2
      if (c.ch === 'P') return PARALLEL
      return null
    }))
  }
  function frameTick(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!waitForm(u, m)) return
      u.m = m
      u.energy = partsLike(m, /uxv_energy_input_hatch/)
      u.bus = partsLike(m, /input_bus/)[0]
      var ph = m.getParallelHatch()
      var hatch = ph.isPresent() ? ph.get() : null
      check('s0_1_frame_formed', u.energy.length === 1, 'class ' + m.getClass().getSimpleName() + ', UXV hatches ' + u.energy.length + ', parts ' + partIds(m))
      var rep = hatch ? Number(hatch.getCurrentParallel()) : NaN
      check('s0_6_reports', rep === 65536, 'the tier 12 hatch reports ' + rep + ' (expected 65,536 = 4^8), formed in gtceu:gg_uxv_s0_frame with a UXV hatch')
      var hm = machine(pos(36140 - 8, 75, 14))
      topUp(u.energy)
      setBus(u.bus, DANDELION)
      u.started = S.tick
      u.phase = 'run'
      return
    }
    topUp(u.energy)
    if (u.phase === 'run') {
      var snap = m.getRecipeLogic().isWorking() ? snapshot(m) : null
      if (snap !== null || S.tick - u.started > 300) {
        var V = Number(GTValues.V[12])
        var want = Math.min(65536, Math.floor(V / 2048))
        note('s0_6_measured', 'probe 2,048 EU/t x ' + (snap ? snap.parallels : 'none') + ' copies = ' + (snap ? snap.parallels * 2048 : 'n/a') + ' EU/t; one UXV 2 A hatch carries ' + V + ' V; recipe ' + (snap ? snap.id : 'none'))
        check('s0_6_energy_bound', snap !== null && snap.parallels === want, 'copies ' + (snap ? snap.parallels : 'none') + ' (expected min(65,536, floor(V/2,048)) = ' + want + ')')
        u.phase = 'done'
      }
    }
  }

  // ---------------------------------------------------------------- S0-1: GTM's assembly line
  function placeAL(ox, oy, oz) {
    var def = classes().Regs.MACHINES.get(new (classes().RL)(AL))
    if (!def) throw new Error(AL + ' is not registered')
    var shapes = array(def.getMatchingShapes())
    if (shapes.length === 0) throw new Error('no preview shape for ' + AL)
    var grid = shapes[0].getBlocks()
    var cells = []
    var ctl = null
    var swapped = 0
    var i, j, k
    for (i = 0; i < grid.length; i++) {
      for (j = 0; j < grid[i].length; j++) {
        for (k = 0; k < grid[i][j].length; k++) {
          if (grid[i][j][k]) cells.push({ x: i, y: j, z: k, state: grid[i][j][k].getBlockState() })
        }
      }
    }
    cells.forEach(function (c) { if (c.state.getBlock() === def.getBlock()) ctl = c })
    if (ctl === null) throw new Error('no controller in the preview shape')
    cells.forEach(function (c) {
      var s = String(c.state)
      if (/Block\{minecraft:air\}/.test(s)) return
      var m = /Block\{([^}]+)\}(\[.*\])?/.exec(s)
      if (!m) return
      var id = m[1]
      if (/energy_input_hatch/.test(id) && swapped < 1) { swapped++; id = HATCH2 }
      put(ox + c.x - ctl.x, oy + c.y - ctl.y, oz + c.z - ctl.z, id + (m[2] || ''))
    })
    return { pos: pos(ox, oy, oz), swapped: swapped }
  }
  function alTick(u) {
    if (u.phase === 'build') {
      var g = placeAL(36185, 75, 30)
      u.pos = g.pos
      u.swapped = g.swapped
      u.started = S.tick
      u.phase = 'forming'
      note('s0_1_al_placed', 'preview shape placed, ' + g.swapped + ' energy hatch swapped for ' + HATCH2)
      return
    }
    var m = machine(u.pos)
    if (!waitForm(u, m)) return
    var uxv = partsLike(m, /uxv_energy_input_hatch/)
    check('s0_1_al_formed', uxv.length === u.swapped && u.swapped > 0, AL + ' class ' + m.getClass().getSimpleName() + ', UXV hatches seen ' + uxv.length + ' of ' + u.swapped + ' swapped')
    u.phase = 'done'
  }

  // ---------------------------------------------------------------- S0-4: the third fusion ring
  function ringBuild(u) {
    var e = 0
    var i = 0
    var o = 0
    placeCheck(u, placeMachine(RING, 36146, 80, 30, function (c) {
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
      u.energy = partsLike(m, /uxv_energy_input_hatch_16a/)
      u.inH = partsLike(m, /input_hatch/).filter(function (p) { return !/energy/.test(String(p.getDefinition().getId())) })[0]
      var cap = NaN
      try { cap = Number(ringBuffer(m).getEnergyCapacity()) } catch (x) { note('s0_4_buffer', 'reflection failed: ' + errText(x)) }
      var tier = NaN
      try { tier = Number(m.getTier()) } catch (x) { }
      check('s0_4_formed', u.energy.length === 16 && tier === 12, 'class ' + m.getClass().getSimpleName() + ', tier ' + tier + ', UXV 16 A hatches ' + u.energy.length + ', parts ' + partIds(m))
      check('s0_4_buffer_long', cap === 10240000000, 'internal buffer ' + cap + ' EU (expected 16 x 2^6 x 10,000,000 = 10,240,000,000; int maximum 2147483647)')
      u.phase = 'start'
      return
    }
    if (u.phase === 'start') {
      try { setTank(u.inH, 'gtceu:neon', 4000) } catch (x) { note('s0_4_fill', 'fill failed: ' + errText(x)) }
      topUp(u.energy)
      try { var b = ringBuffer(m); b.setEnergyStored(b.getEnergyCapacity()) } catch (x) { note('s0_4_charge', 'charge failed: ' + errText(x)) }
      m.getRecipeLogic().updateTickSubscription()
      u.phase = 'run'
      u.started = S.tick
      return
    }
    if (u.phase === 'run') {
      topUp(u.energy)
      var rlg = m.getRecipeLogic()
      if (!rlg.isWorking()) { try { var b2 = ringBuffer(m); b2.setEnergyStored(b2.getEnergyCapacity()) } catch (x) { } }
      if (rlg.isWorking() || S.tick - u.started > 600) {
        var s = snapshot(m)
        var ok = rlg.isWorking() && s !== null && s.id.indexOf('ring_probe') >= 0
        check('s0_4_runs', ok, 'working ' + rlg.isWorking() + ', start 10,000,000,000, recipe ' + (s ? s.id + ' ' + s.eut + ' EU/t ' + s.duration + ' t' : 'none') + ', reasons ' + String(rlg.getFailureReasons()))
        u.phase = 'done'
      }
    }
  }

  // ---------------------------------------------------------------- S0-2: the warp gate at 2^31 EU/t
  function gateBuild(u) {
    var step = 0
    placeCheck(u, placeMachine(GATE, 36166, 80, 47, function (c) {
      if (!c.front) return null
      if (step === 0 && allows(c.sym, 'input_bus')) { step++; return 'gtceu:uhv_input_bus' }
      if (step === 1 && allows(c.sym, 'output_bus')) { step++; return 'gtceu:uhv_output_bus' }
      if (step >= 2 && step < 4 && allows(c.sym, 'energy_input')) { step++; return HATCH16 }
      return null
    }))
  }
  function gateTick(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!waitForm(u, m)) return
      u.energy = partsLike(m, /uxv_energy_input_hatch_16a/)
      u.bus = partsLike(m, /input_bus/)[0]
      var ec = m.getEnergyContainer()
      var volt = NaN
      var amps = NaN
      try { volt = Number(ec.getInputVoltage()); amps = Number(ec.getInputAmperage()) } catch (x) { }
      check('s0_2_formed', u.energy.length === 2 && !!u.bus, 'class ' + m.getClass().getSimpleName() + ', UXV 16 A hatches ' + u.energy.length + ', list ' + volt + ' V x ' + amps + ' A, parts ' + partIds(m))
      setBus(u.bus, DANDELION)
      topUp(u.energy)
      m.getRecipeLogic().updateTickSubscription()
      u.started = S.tick
      u.phase = 'start'
      return
    }
    topUp(u.energy)
    var logic = m.getRecipeLogic()
    if (u.phase === 'start') {
      var last = logic.getLastRecipe()
      if (String(logic.getStatus()) === 'WORKING' && last && String(last.id).indexOf('hold_probe') >= 0) {
        var eut = NaN
        try { eut = Number(classes().RecipeHelper.getRealEUtWithIO(last).getTotalEU()) } catch (x) { }
        var shown = String(classes().FU.formatNumbers(eut))
        check('s0_2_eut_long', eut === 2147483648, 'recipe EU/t ' + eut + ' (expected 2,147,483,648; as an int it would read ' + (2147483648 | 0) + ')')
        check('s0_2_duration', Number(last.duration) === GATE_TICKS, 'recipe duration ' + last.duration + ' ticks')
        note('s0_2_readout', 'formatNumbers(EU/t) = ' + shown + '; total ' + classes().FU.formatNumbers(eut * GATE_TICKS) + ' EU; hatch buffer ' + classes().FU.formatNumbers(u.energy[0].energyContainer.getEnergyCapacity()))
        u.runStart = S.tick
        u.phase = 'long'
      } else if (S.tick - u.started > 400) {
        var why1 = ''
        try { why1 = String(logic.getFancyTooltip()) } catch (x) { why1 = 'tooltip: ' + x }
        check('s0_2_starts', false, 'the probe did not start: status ' + logic.getStatus() + ', reasons ' + String(logic.getFailureReasons()) + ', ' + why1 + ', last ' + (last ? last.id : 'none'))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'long') {
      if (S.tick - u.runStart >= 1000) {
        var live = String(logic.getStatus()) === 'WORKING'
        check('s0_2_runs_long', live, 'still ' + logic.getStatus() + ' ' + (S.tick - u.runStart) + ' ticks into the run of ' + GATE_TICKS)
        u.phase = 'done'
      } else if (String(logic.getStatus()) !== 'WORKING') {
        check('s0_2_runs_long', false, 'stopped after ' + (S.tick - u.runStart) + ' ticks, status ' + logic.getStatus() + ', ' + String(logic.getFailureReasons()))
        u.phase = 'done'
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
    add({ name: 'hatches', tick: hatchesTick, phase: 'place', started: 0 }, null)
    add({ name: 'frame', tick: frameTick, phase: 'forming', started: 0 }, frameBuild)
    add({ name: 'al', tick: alTick, phase: 'build', started: 0 }, null)
    add({ name: 'ring', tick: ringTick, phase: 'forming', started: 0 }, ringBuild)
    add({ name: 'gate', tick: gateTick, phase: 'forming', started: 0 }, gateBuild)
  }
  ServerEvents.customCommand('gg_test_uxv_s0_machines', function () {
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
      else if (S.tick > 2400) { check('deadline', false, '2400-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
