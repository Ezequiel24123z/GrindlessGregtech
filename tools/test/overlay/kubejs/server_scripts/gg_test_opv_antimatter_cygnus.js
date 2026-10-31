// priority: -6172
// TEST ONLY: machines 6-8 form and run line 30 at Cygnus X-1, including the UV trap's stacking row.
// Other packages' inputs are fixture stacks; their production mechanisms are not re-tested.
(function () {
  var S = null
  var C = null
  var NAME = 'opv_antimatter_cygnus'
  var DIM = 'grindless:cygnus_x1_orbit'
  var X0 = 38784
  var X1 = 38847
  var Y0 = 98
  var Y1 = 115
  var CY = 106
  var ENERGY = 'gtceu:uxv_energy_input_hatch'
  var INPUT = 'gtceu:hv_input_bus'
  var OUTPUT = 'gtceu:hv_output_bus'
  var FIN = 'gtceu:hv_input_hatch'
  var FOUT = 'gtceu:hv_output_hatch'
  var UNITS = [
    { id: 'gtceu:jet_beam_line', cx: 38788, z: 2, parts: [ENERGY, ENERGY, INPUT, FIN, FOUT],
      steps: [
        { recipe: 'jet_beam_extraction/jet_proton_beam', circuit: 1, items: [['grindless:srf_cavity', 1], ['grindless:be_beam_window', 1]], fluidOut: ['grindless:jet_proton_beam', 1000], duration: 200 },
        { recipe: 'jet_beam_extraction/flux_boosted_jet_beam', circuit: 2, items: [['grindless:srf_cavity', 1], ['grindless:be_beam_window', 1]], fluid: ['gtceu:flux_loaded_plasma', 100], fluidOut: ['grindless:jet_proton_beam', 2000], duration: 200 }
      ] },
    { id: 'gtceu:spallation_target_station', cx: 38805, z: 2, parts: [ENERGY, ENERGY, INPUT, OUTPUT, FIN, FOUT],
      steps: [
        { recipe: 'antiproton_production/hot_antiproton_beam', circuit: 1, items: [['grindless:ir_spallation_target', 1], ['grindless:li6_hydride_shield', 1]],
          fluid: ['grindless:jet_proton_beam', 4000], fluidOut: ['grindless:hot_antiproton_beam', 1000], duration: 400 }
      ] },
    { id: 'gtceu:antiproton_decelerator', cx: 38824, z: 2, parts: [ENERGY, ENERGY, INPUT, OUTPUT, FIN, FOUT],
      steps: [
        { recipe: 'beam_cooling/stochastic_cooling', circuit: 1, items: [['grindless:stochastic_cooling_pickup', 1]],
          fluid: ['grindless:hot_antiproton_beam', 1000], fluidOut: ['grindless:stochastically_cooled_beam', 1000], duration: 800 },
        { recipe: 'beam_cooling/cold_antiproton_cell', circuit: 2, items: [['grindless:electron_cooler', 1], ['grindless:empty_penning_trap', 1], ['grindless:octupole_trap_magnet', 1]],
          fluid: ['grindless:stochastically_cooled_beam', 1000], itemOut: ['grindless:cold_antiproton_cell', 1], duration: 1200 }
      ] },
    { id: 'gtceu:antimatter_trap', cx: 38840, z: 2, parts: [ENERGY, ENERGY, INPUT, OUTPUT, FIN, FOUT],
      steps: [
        { recipe: 'antimatter_storage/antiproton_stack_opv', circuit: 6, items: [['grindless:cold_antiproton_cell', 8], ['grindless:octupole_trap_magnet', 1]],
          itemOut: ['grindless:antiproton_stack_opv', 1], duration: 400 }
      ] }
  ]
  function classes() {
    if (C) return C
    C = { Pos: Java.loadClass('net.minecraft.core.BlockPos'), RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      List: Java.loadClass('java.util.ArrayList'), Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries') }
    return C
  }
  function array(c) {
    var a = new (classes().List)(c)
    var out = []
    for (var i = 0; i < a.size(); i++) out.push(a.get(i))
    return out
  }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + String(detail).replace(/[\r\n|]/g, ' ').substring(0, 1400))
  }
  function command(s) { return S.server.runCommandSilent('execute in ' + DIM + ' run ' + s) }
  function put(x, y, z, block) {
    if (x < X0 || x > X1 || y < Y0 || y > Y1 || z < 0 || z > 63) throw new Error('outside reserved band: ' + x + ',' + y + ',' + z)
    command('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function place(u) {
    var desc = global.grindless.patterns.describe(u.id)
    if (!desc) throw new Error('no structure for ' + u.id)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, sym: sym })
        }
      })
    })
    var xs = []
    cells.forEach(function (c) {
      c.x = u.cx - (c.ci - ctrl.ci)
      c.y = CY + (c.ri - ctrl.ri)
      c.z = u.z - (c.si - ctrl.si)
      if (c.sym.kind === 'oneOf') xs.push(c)
    })
    xs.sort(function (a, b) { return a.z - b.z || a.x - b.x })
    u.parts.forEach(function (id, i) { xs[Math.floor(i * (xs.length - 1) / (u.parts.length - 1))].part = id })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = c.part
      if (sym.kind === 'controller') return
      if (!block && sym.kind === 'blocks') block = sym.blocks[0]
      if (!block && sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      if (!block && sym.kind === 'oneOf') sym.options.forEach(function (s) { if (!block && s.kind === 'blocks') block = s.blocks[0] })
      if (sym.kind === 'air') block = 'minecraft:air'
      if (block) put(c.x, c.y, c.z, block + (c.part ? '[facing=north]' : ''))
    })
    put(u.cx, CY, u.z, u.id + '[facing=north]')
    u.pos = new (classes().Pos)(u.cx, CY, u.z)
    u.phase = 'forming'
    u.started = S.tick
    u.step = 0
  }
  function parts(m, re) { return array(m.getParts()).filter(function (p) { return re.test(String(p.getDefinition().getId())) }) }
  function inventory(bus, stacks) {
    var st = bus.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    stacks.forEach(function (s, i) { st.setStackInSlot(i, s.length > 2 ? Item.of(s[0], s[1], s[2]) : Item.of(s[0], s[1])) })
  }
  function start(u) {
    var r = u.steps[u.step]
    inventory(u.bus, [['gtceu:programmed_circuit', 1, '{Configuration:' + r.circuit + '}']].concat(r.items))
    if (u.out) inventory(u.out, [])
    if (u.fin) u.fin.tank.setFluidInTank(0, r.fluid ? Fluid.of(r.fluid[0], r.fluid[1]).getFluidStack() : Fluid.of('minecraft:empty', 0).getFluidStack())
    if (u.fout) u.fout.tank.setFluidInTank(0, Fluid.of('minecraft:empty', 0).getFluidStack())
    u.phase = 'running'
    u.started = S.tick
  }
  function output(u, r) {
    if (r.itemOut) {
      var st = u.out.getInventory().storage
      var count = 0
      for (var i = 0; i < st.getSlots(); i++) {
        var s = st.getStackInSlot(i)
        if (s && !s.isEmpty() && String(s.id) === r.itemOut[0]) count += Number(s.count)
      }
      return count === r.itemOut[1]
    }
    var f = u.fout.tank.getFluidInTank(0)
    return !f.isEmpty() && String(classes().Registries.FLUIDS.getKey(f.getFluid())) === r.fluidOut[0] && Number(f.getAmount()) === r.fluidOut[1]
  }
  function tick(u) {
    var m = classes().Meta.getMachine(S.level, u.pos)
    var waited = S.tick - u.started
    if (u.phase === 'forming') {
      if (m && !m.isFormed() && waited >= 100 && waited % 50 === 0 && m.checkPatternWithLock()) {
        m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed()
      }
      if (!m || !m.isFormed()) {
        if (waited > 600) { check(u.id + '_formed', false, m ? String(m.getMultiblockState().error) : 'no machine'); u.phase = 'done' }
        return
      }
      u.m = m
      u.energy = parts(m, /uxv_energy_input_hatch/)
      u.bus = parts(m, /input_bus/)[0]
      u.out = parts(m, /output_bus/)[0]
      u.fin = parts(m, /^(?!.*energy).*input_hatch/)[0]
      u.fout = parts(m, /^(?!.*energy).*output_hatch/)[0]
      check(u.id + '_formed', u.energy.length === 2 && !!u.bus, 'Cygnus formation with two UXV energy hatches')
      start(u)
      return
    }
    if (u.phase === 'settling') {
      if (waited >= 10) start(u)
      return
    }
    var r = u.steps[u.step]
    if (output(u, r)) {
      var rec = m.getRecipeLogic().getLastRecipe()
      check(r.recipe, !!rec && String(rec.id) === 'grindless:' + r.recipe, 'exact output obtained at Cygnus, recipe ' + (rec ? String(rec.id) : 'none'))
      inventory(u.bus, [])
      u.step++
      if (u.step === u.steps.length) u.phase = 'done'
      else { u.phase = 'settling'; u.started = S.tick }
    } else if (waited > r.duration + 300) {
      check(r.recipe, false, 'missing output: ' + String(m.getRecipeLogic().getFailureReasons()))
      u.phase = 'done'
    }
  }
  function clear() {
    for (var z = 0; z < 64; z += 8) command('fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
  }
  function finish() {
    try { clear(); command('forceload remove ' + X0 + ' 0 ' + X1 + ' 63') }
    catch (e) { check('cleanup', false, e) }
    S.finished = true
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  ServerEvents.customCommand('gg_test_opv_antimatter_cygnus', function () {
    global.ggTestOpvAntimatterCygnusRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    if (global.ggTestOpvAntimatterCygnusRequest) {
      global.ggTestOpvAntimatterCygnusRequest = false
      S = { server: event.server, level: event.server.getLevel(DIM), failed: 0, tick: 0, finished: false }
      try {
        command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
        clear()
        var A = global.grindless.antimatterCygnus
        check('registration', !!A && A.errors.length === 0 && A.recipes.length === 5 && !!A.trap, A ? JSON.stringify(A.errors) : 'no package global')
        var ids = A.controllers.concat(A.recipes.map(function (r) { return 'grindless:' + r.type + '/' + r.name }), ['grindless:antimatter_storage/antiproton_stack_opv'])
        var missing = ids.filter(function (id) { return !S.server.getRecipeManager().byKey(new (classes().RL)(id)).isPresent() })
        check('lookup', missing.length === 0, '9 recipe ids; missing ' + missing.join(','))
        UNITS.forEach(place)
      } catch (e) { check('setup', false, e); finish() }
    }
    if (!S || S.finished) return
    S.tick++
    UNITS.forEach(function (u) {
      if (u.phase === 'done') return
      try {
        if (u.energy) u.energy.forEach(function (p) { p.energyContainer.setEnergyStored(p.energyContainer.getEnergyCapacity()) })
        tick(u)
      } catch (e) { check(u.id + '_exception', false, e); u.phase = 'done' }
    })
    if (UNITS.every(function (u) { return u.phase === 'done' })) finish()
    else if (S.tick > 3600) { check('deadline', false, '3600 ticks'); finish() }
  })
})()
