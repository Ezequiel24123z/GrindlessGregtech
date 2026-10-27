// priority: -4424
// TEST ONLY, LuV B10. Command: kubejs custom_command gg_test_luv_fusion
// The integrated validation owner runs this with gg_test_recipe_lookup and a fresh gg_dump.
// Reserved band ONLY: X 17920-17983, Z 0-63, Overworld Y 98-112 (the Mk1 at X 17925-17939, Z 4-18; the HPCA and the research station
// at X 17950-17983).
//
// Static (live recipe manager):
//   cuts_removed        Ag + Cu -> Os, Hg + Mg -> U-235 and Au + Al -> U-238 are gone
//   kept_<name>         Nd + H -> Eu, D + T, La + Si -> Lu, H + V -> Cr and GTCA's calcium plasma keep GTM's EU/t, duration and start
//   duranium_mk2        Ga + Rn -> duranium keeps GTM's id, fluids, EU/t and duration with a 200 M EU start
//   fusion_report       global.grindless.fusion: 3 cut, 1 moved, nothing unaudited, missing or failed
//   plasma_generator    gtceu:plasma_generator/calcium_plasma gives 2,048 EU/t x 184 t per mB (already doubled by generators.js)
//   research_<id>       the research chain the design makes explicit is live with GTM's EU/t (computer casings, data bank, HPCA,
//                       research station, URhNq2, the ZPM energy hatch's research and its data orb condition)
// Native:
//   mk1_formed          GTM's own Mk1 preview shape (fusion glass, 16 LuV energy hatches, GTM's superconducting coil = the HTS coil)
//   mk1_capacity        the internal buffer is 160 M EU
//   run_europium        16 mB Nd + 375 mB H -> 16 mB europium (24,576 EU/t x 64 t: LuV recipe, no overclock)
//   run_calcium         128 mB Mg + 128 mB O2 -> 16 mB calcium plasma; the run's EU/t x duration is GTM's 983,040 EU
//   calcium_net_power   net EU per run = 16 mB x the plasma turbine's EU per mB - the run's EU; reports it per tick (design: about
//                       39,400 EU/t without overclock; the static prediction is 78,848 EU/t: one fusion overclock, 15,360 EU/t x 64 t,
//                       because the Mk1 caps its voltage at LuV and the recipe is IV)
//   duranium_refused    Ga + Rn with every input and full energy: no progress and no duranium (200 M > 160 M)
//   cut_refused         Ag + Cu: no osmium
//   hpca_formed, research_station_formed   GTM's preview shapes form (the data orb run itself needs >= 4,000 t and is the gate's)
// No changed clock, accelerated duration or manual recipe execution: energy hatches are topped up, fluids put in the hatches.
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestLuvFusionRequest'
  var LOADED = Date.now()
  var X0 = 17920
  var X1 = 17983
  var Y = 100
  var NAME = 'luv_fusion'
  var MK1 = 'gtceu:luv_fusion_reactor'
  var PARTS = { energy: 'gtceu:luv_energy_input_hatch', input: 'gtceu:luv_input_hatch', output: 'gtceu:luv_output_hatch' }
  var CUTS = ['gtceu:fusion_reactor/silver_and_copper_to_osmium_plasma',
    'gtceu:fusion_reactor/mercury_and_magnesium_to_uranium_235_plasma',
    'gtceu:fusion_reactor/gold_and_aluminium_to_uranium_238_plasma']
  var KEPT = [
    { id: 'gtceu:fusion_reactor/neodymium_and_hydrogen_to_europium_plasma', eut: 24576, duration: 64, start: 150000000 },
    { id: 'gtceu:fusion_reactor/deuterium_and_tritium_to_helium_plasma', eut: 4096, duration: 16, start: 40000000 },
    { id: 'gtceu:fusion_reactor/lantanum_and_silicon_to_lutetium_plasma', eut: 7680, duration: 16, start: 80000000 },
    { id: 'gtceu:fusion_reactor/hydrogen_and_vanadium_to_chromium_plasma', eut: 24576, duration: 64, start: 140000000 },
    { id: 'gtceu:fusion_reactor/calcium_plasma', eut: 7680, duration: 128, start: 120000000 }
  ]
  var DURANIUM = { id: 'gtceu:fusion_reactor/gallium_and_radon_to_duranium_plasma', eut: 16384, duration: 32, start: 200000000,
    inputs: { 'gtceu:gallium': 16, 'gtceu:radon': 125 }, output: 'gtceu:duranium' }
  var PLASMA_GEN = { id: 'gtceu:plasma_generator/calcium_plasma', eut: 2048, duration: 184, mb: 1 }
  var RESEARCH = [
    { id: 'gtceu:assembler/computer_casing', eut: 30720 },
    { id: 'gtceu:assembler/advanced_computer_casing', eut: 30720 },
    { id: 'gtceu:assembly_line/data_bank', eut: 6000 },
    { id: 'gtceu:assembler/hpca_empty_component', eut: 7680 },
    { id: 'gtceu:assembler/hpca_heat_sink_component', eut: 7680 },
    { id: 'gtceu:assembler/hpca_active_cooler_component', eut: 7680 },
    { id: 'gtceu:assembler/hpca_computation_component', eut: 30720 },
    { id: 'gtceu:assembly_line/high_performance_computing_array', eut: 100000 },
    { id: 'gtceu:assembly_line/research_station', eut: 100000 },
    { id: 'gtceu:mixer/uranium_rhodium_dinaquadide', eut: 122880 },
    { id: 'gtceu:research_station/1x_gtceu_luv_energy_input_hatch', eut: 30720 },
    { id: 'gtceu:assembly_line/energy_hatch_zpm', eut: 122880, research: '1x_gtceu_luv_energy_input_hatch' }
  ]
  var SCENARIOS = [
    { name: 'run_europium', fluids: [['gtceu:neodymium', 16], ['gtceu:hydrogen', 375]], expect: ['gtceu:europium', 16],
      eut: 24576, duration: 64 },
    { name: 'run_calcium', fluids: [['gtceu:magnesium', 128], ['gtceu:oxygen', 128]], expect: ['gtca:calcium_plasma_plasma', 16],
      eut: 15360, duration: 64, energy: 983040 },
    { name: 'duranium_refused', fluids: [['gtceu:gallium', 16], ['gtceu:radon', 125]], refuse: 'gtceu:duranium' },
    { name: 'cut_refused', fluids: [['gtceu:silver', 16], ['gtceu:copper', 16]], refuse: 'gtceu:osmium' }
  ]

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      Fluids: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Machines: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      Fusion: Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.FusionReactorMachine')
    }
    return C
  }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
  }
  function note(name, detail) {
    console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + detail)
  }
  function byId(id) {
    var found = S.server.getRecipeManager().byKey(new (classes().RL)(id))
    return found.isPresent() ? found.get() : null
  }
  function command(text) {
    return S.server.runCommandSilent('execute in minecraft:overworld run ' + text)
  }
  function fluidId(stack) { return String(classes().Registries.FLUIDS.getKey(stack.getFluid())) }
  function inEUt(r) { try { return Number(r.getInputEUt().getTotalEU()) } catch (e) { return -1 } }
  function outEUt(r) { try { return Number(r.getOutputEUt().getTotalEU()) } catch (e) { return -1 } }
  function start(r) { return r.data.contains('eu_to_start') ? Number(r.data.getLong('eu_to_start')) : -1 }
  // GTM's ResearchCondition keeps its ResearchData (entries with a research id) in a public field
  function researchText(c) {
    try {
      var ids = []
      var it = c.data.iterator()
      while (it.hasNext()) ids.push(String(it.next().getResearchId()))
      return ids.join(' ')
    } catch (e1) { /* next */ }
    try { return String(c.serialize()) } catch (e2) { return String(c) }
  }

  // ---------------------------------------------------------------- static
  function staticChecks() {
    var gone = CUTS.filter(function (id) { return byId(id) === null })
    check('cuts_removed', gone.length === CUTS.length, gone.length + '/' + CUTS.length + ' absent: ' + CUTS.join(', '))
    KEPT.forEach(function (k) {
      var r = byId(k.id)
      var name = 'kept_' + k.id.replace(/^.*\//, '')
      if (r === null) { check(name, false, k.id + ' absent'); return }
      check(name, inEUt(r) === k.eut && Number(r.duration) === k.duration && start(r) === k.start,
        inEUt(r) + ' EU/t x ' + Number(r.duration) + ' t, start ' + start(r))
    })
    var d = byId(DURANIUM.id)
    if (d === null) check('duranium_mk2', false, DURANIUM.id + ' absent')
    else {
      var fin = array(classes().Helper.getInputFluids(d)).map(function (f) { return fluidId(f) + '=' + Number(f.getAmount()) }).sort()
      var fout = array(classes().Helper.getOutputFluids(d)).map(function (f) { return fluidId(f) + '=' + Number(f.getAmount()) })
      var want = Object.keys(DURANIUM.inputs).map(function (k) { return k + '=' + DURANIUM.inputs[k] }).sort()
      check('duranium_mk2', inEUt(d) === DURANIUM.eut && Number(d.duration) === DURANIUM.duration && start(d) === DURANIUM.start &&
        JSON.stringify(fin) === JSON.stringify(want) && JSON.stringify(fout) === JSON.stringify([DURANIUM.output + '=16']),
      inEUt(d) + ' EU/t x ' + Number(d.duration) + ' t, start ' + start(d) + ', in ' + fin.join(' ') + ', out ' + fout.join(' '))
    }
    var F = global.grindless.fusion || {}
    check('fusion_report', (F.removed || []).length === 3 && (F.rebuilt || []).length === 1 && (F.unaudited || []).length === 0 &&
      (F.missing || []).length === 0 && (F.errors || []).length === 0,
    'removed ' + JSON.stringify(F.removed) + ' rebuilt ' + JSON.stringify(F.rebuilt) + ' unaudited ' + JSON.stringify(F.unaudited) +
      ' missing ' + JSON.stringify(F.missing) + ' errors ' + JSON.stringify(F.errors))
    var g = byId(PLASMA_GEN.id)
    var gin = g === null ? [] : array(classes().Helper.getInputFluids(g))
    S.plasmaEuPerMb = g === null ? 0 : outEUt(g) * Number(g.duration) / Number(gin[0].getAmount())
    check('plasma_generator', g !== null && outEUt(g) === PLASMA_GEN.eut && Number(g.duration) === PLASMA_GEN.duration &&
      gin.length === 1 && Number(gin[0].getAmount()) === PLASMA_GEN.mb,
    g === null ? 'absent' : outEUt(g) + ' EU/t x ' + Number(g.duration) + ' t per ' + Number(gin[0].getAmount()) + ' mB = ' + S.plasmaEuPerMb + ' EU/mB')
    RESEARCH.forEach(function (x) {
      var r = byId(x.id)
      var ok = r !== null && inEUt(r) === x.eut
      var detail = r === null ? 'absent' : inEUt(r) + ' EU/t'
      if (ok && x.research) {
        var text = array(r.conditions).map(researchText).join(' ')
        ok = text.indexOf(x.research) >= 0
        detail += '; research ' + (ok ? x.research : 'missing in ' + text)
      }
      check('research_' + x.id.replace(/^.*\//, ''), ok, x.id + ': ' + detail)
    })
  }

  // ---------------------------------------------------------------- GTM's preview shapes
  function shapeOf(id, wantBlock) {
    var def = classes().Machines.MACHINES.get(new (classes().RL)(id))
    if (!def) throw new Error('no machine ' + id)
    var shapes = array(def.getMatchingShapes())
    if (shapes.length === 0) throw new Error('no preview shape for ' + id)
    if (!wantBlock) return shapes[0]
    for (var i = 0; i < shapes.length; i++) {
      if (blocksOf(shapes[i]).some(function (b) { return b.id === wantBlock })) return shapes[i]
    }
    return shapes[0]
  }
  function blocksOf(shape) {
    var blocks = shape.getBlocks()
    var out = []
    for (var x = 0; x < blocks.length; x++) {
      for (var y = 0; y < blocks[x].length; y++) {
        for (var z = 0; z < blocks[x][y].length; z++) {
          var info = blocks[x][y][z]
          if (info === null || info === undefined) continue
          var state = info.getBlockState()
          out.push({ x: x, y: y, z: z, state: state, id: String(Block.getId(state.getBlock())) })
        }
      }
    }
    return out
  }
  // places a preview shape at its own coordinates from (ox, Y, oz); returns the controller's position
  function place(id, ox, oz, wantBlock) {
    var cells = blocksOf(shapeOf(id, wantBlock))
    var ctrl = null
    var size = { x: 0, y: 0, z: 0 }
    cells.forEach(function (c) {
      size.x = Math.max(size.x, c.x + 1); size.y = Math.max(size.y, c.y + 1); size.z = Math.max(size.z, c.z + 1)
    })
    if (ox + size.x - 1 > X1 || oz + size.z - 1 > 63 || Y + size.y - 1 > 112) throw new Error(id + ' does not fit the band: ' + JSON.stringify(size))
    cells.forEach(function (c) {
      if (c.id === 'minecraft:air') return
      var pos = new (classes().Pos)(ox + c.x, Y + c.y, oz + c.z)
      S.level.setBlock(pos, c.state, 3)
      if (c.id === id) ctrl = pos
    })
    if (ctrl === null) throw new Error('no controller in the preview of ' + id)
    note('placed_' + id.replace(/^gtceu:/, ''), cells.filter(function (c) { return c.id !== 'minecraft:air' }).length + ' blocks, size ' +
      JSON.stringify(size) + ' at ' + ox + ',' + Y + ',' + oz)
    return { id: id, pos: ctrl, started: S.tick, ctrl: null }
  }

  // ---------------------------------------------------------------- the Mk1
  function parts(m) {
    m.P = { energy: [], input: [], output: [] }
    array(m.ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      Object.keys(PARTS).forEach(function (role) { if (pid === PARTS[role]) m.P[role].push(p) })
    })
  }
  function topUp(m) {
    m.P.energy.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) })
  }
  function clearHatches(m) {
    m.P.input.concat(m.P.output).forEach(function (h) { h.tank.setFluidInTank(0, classes().Fluids.EMPTY) })
  }
  function outputs(m) {
    var t = {}
    m.P.output.forEach(function (h) {
      var st = h.tank.getFluidInTank(0)
      if (!st.isEmpty()) t[fluidId(st)] = (t[fluidId(st)] || 0) + Number(st.getAmount())
    })
    return t
  }
  function feed(m, sc) {
    clearHatches(m)
    sc.fluids.forEach(function (f, i) { m.P.input[i].tank.setFluidInTank(0, Fluid.of(f[0], f[1]).getFluidStack()) })
    m.sc = sc
    m.run = null
    m.started = S.tick
    m.ctrl.getRecipeLogic().updateTickSubscription()
  }
  function watchRun(m) {
    var rlg = m.ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    if (m.run === null && String(rlg.getStatus()) === 'WORKING' && last !== null && last !== undefined) {
      m.run = { id: String(last.id), eut: inEUt(last), duration: Number(rlg.getDuration()) }
    }
  }
  function tickMk1(m) {
    if (m.phase === 'done') return
    if (m.phase === 'forming') {
      var ctrl = classes().Meta.getMachine(S.level, m.pos)
      if (!ctrl || !ctrl.isFormed()) {
        if (S.tick - m.started > 400) { check('mk1_formed', false, 'not formed in 400 t'); m.phase = 'done' }
        return
      }
      m.ctrl = ctrl
      parts(m)
      check('mk1_formed', m.P.energy.length === 16 && m.P.input.length >= 2 && m.P.output.length >= 1,
        'energy ' + m.P.energy.length + ', input ' + m.P.input.length + ', output ' + m.P.output.length)
      m.next = 0
      m.phase = 'ready'
    }
    topUp(m)
    if (m.phase === 'ready') {
      if (m.next === 0) {
        // the internal buffer is protected; GTM's own formula on the formed tier and the native hatch count
        var cap = -1
        try { cap = Number(classes().Fusion.calculateEnergyStorageFactor(m.ctrl.getTier(), m.P.energy.length)) } catch (e) { cap = -1 }
        check('mk1_capacity', cap === 160000000, cap + ' EU (' + m.P.energy.length + ' hatches, tier ' + m.ctrl.getTier() + ')')
      }
      feed(m, SCENARIOS[m.next])
      m.phase = 'running'
      return
    }
    var sc = m.sc
    watchRun(m)
    var out = outputs(m)
    if (sc.expect) {
      if ((out[sc.expect[0]] || 0) >= sc.expect[1]) {
        var r = m.run || { eut: -1, duration: -1 }
        check(sc.name, out[sc.expect[0]] === sc.expect[1] && r.eut === sc.eut && r.duration === sc.duration,
          JSON.stringify(out) + '; run ' + r.eut + ' EU/t x ' + r.duration + ' t (expected ' + sc.eut + ' x ' + sc.duration + ')')
        if (sc.energy) {
          var runEu = r.eut * r.duration
          var net = sc.expect[1] * S.plasmaEuPerMb - runEu
          check('calcium_net_power', runEu === sc.energy && net > 0,
            'run ' + runEu + ' EU; plasma ' + sc.expect[1] + ' mB x ' + S.plasmaEuPerMb + ' EU/mB; net ' + net + ' EU per run = ' +
            (r.duration > 0 ? Math.round(net / r.duration) : NaN) + ' EU/t per Mk1 running back to back (design 39,400 without overclock)')
        }
        next(m)
      } else if (S.tick - m.started > 600) {
        check(sc.name, false, 'timeout; outputs ' + JSON.stringify(out) + '; failures ' + String(m.ctrl.getRecipeLogic().getFailureReasons()))
        next(m)
      }
      return
    }
    if (S.tick - m.started >= 120) {
      check(sc.name, !out[sc.refuse] && m.run === null && Number(m.ctrl.getRecipeLogic().getProgress()) === 0,
        'outputs ' + JSON.stringify(out) + '; run ' + JSON.stringify(m.run) + '; reasons ' + String(m.ctrl.getRecipeLogic().getFailureReasons()))
      next(m)
    }
  }
  function next(m) {
    clearHatches(m)
    m.next++
    m.phase = m.next >= SCENARIOS.length ? 'done' : 'ready'
  }
  function tickFormation(m) {
    if (m.phase === 'done') return
    var ctrl = classes().Meta.getMachine(S.level, m.pos)
    if (ctrl && ctrl.isFormed()) {
      check(m.check, true, 'formed from GTM\'s preview shape')
      m.phase = 'done'
    } else if (S.tick - m.started > 400) {
      check(m.check, false, 'not formed in 400 t')
      m.phase = 'done'
    }
  }

  function clear() {
    command('fill ' + X0 + ' 98 0 ' + X1 + ' 112 31 minecraft:air')
    command('fill ' + X0 + ' 98 32 ' + X1 + ' 112 63 minecraft:air')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    clear()
    command('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, plasmaEuPerMb: 0 }
    staticChecks()
    S.level = server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    S.mk1 = place(MK1, 17925, 4, 'gtceu:fusion_glass')
    S.mk1.phase = 'forming'
    S.hpca = place('gtceu:high_performance_computation_array', 17950, 4)
    S.hpca.check = 'hpca_formed'
    S.station = place('gtceu:research_station', 17950, 32)
    S.station.check = 'research_station_formed'
  }
  ServerEvents.customCommand('gg_test_luv_fusion', function () {
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
      tickMk1(S.mk1)
      tickFormation(S.hpca)
      tickFormation(S.station)
      if (S.mk1.phase === 'done' && S.hpca.phase === 'done' && S.station.phase === 'done') finish()
      else if (S.tick > 2400) { check('deadline', false, '2400-tick fixture ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, String(e))
      finish()
    }
  })
})()
