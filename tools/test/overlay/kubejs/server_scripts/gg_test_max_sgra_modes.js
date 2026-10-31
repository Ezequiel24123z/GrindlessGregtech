// priority: -5652
// TEST ONLY, MAX-D1 (docs/eras/max.md, D1 "Sgr A* modes on older machines"). Command: kubejs custom_command gg_test_max_sgra_modes
// Copied over the instance on the test bench, never shipped. NOT run by the package worker: the MAX integrator runs it in its grouped set.
// Band ONLY: X 39704-39767, Z 0-63, Y 98-115, in gcyr:black_hole_orbit (the Sgr A* level; zones.json row max_sgra_modes).
// Doubts (max.md D1, S0-10): the six older machines form there on string-site rows and run their Sgr A* row; the BZ dynamo puts cooled_exhaust
// into a fluid OUTPUT hatch and droplet works takes sn_li_eutectic from a fluid INPUT hatch (no bucket); both generators run on two OpV 16 A
// wireless dynamo hatches.
//   lookup        every row of the package (eleven recipe ids) is in the recipe manager; static: nothing skipped
//   formed_<m>    the machine built from its preview shape forms
//   run_<m>       the machine's Sgr A* row is the last recipe and the machine is working
//   fluid_in      droplet works: the eutectic left the fluid input hatch (no bucket)
//   fluid_out     BZ dynamo: cooled_exhaust arrives in a fluid output hatch
//   dynamo_<m>    the generator has two OpV 16 A dynamo hatches and works
// Markers: GGTEST|max_sgra_modes|<check>|PASS/FAIL/NOTE|..., then GGTEST|max_sgra_modes|DONE|failures=N.
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 39704
  var X1 = 39767
  var Y0 = 98
  var Y1 = 115
  var NAME = 'max_sgra_modes'
  var DIM = 'gcyr:black_hole_orbit'
  var HATCH = 'gtceu:opv_energy_input_hatch_4a'
  var DYNAMO = 'gtceu:opv_wireless_dynamo_hatch_16a'
  var CIRCUIT = 'gtceu:programmed_circuit'

  var LOOKUP = [
    'grindless:solvent_extraction/ev/sn_li_eutectic', 'grindless:femtosecond_writing/droplet_nozzle_plate',
    'grindless:spark_plasma_sintering/radiator_collector_shell', 'grindless:droplet_radiator_assembly/shell_droplet_radiator',
    'grindless:disk_skimming/skim_hot_flow', 'grindless:plasma_mass_filtering/hot_flow_filter', 'grindless:frc_forming/load_flux_frc',
    'grindless:blandford_znajek/frc_spin_down', 'grindless:plasma_mass_filtering/cooled_exhaust_return',
    'grindless:degenerate_harvesting/degenerate_slug', 'grindless:megabar_synthesis/payload_core_press',
    'grindless:spark_plasma_sintering/payload_casing', 'grindless:lathe/turned_payload_core', 'grindless:assembler/max_penrose_payload',
    'grindless:penrose_extraction/payload_penrose'
  ]
  // one unit per older machine run at Sgr A*: the row's recipe id, circuit, inputs, and what it must show
  var UNITS = [
    { m: 'accretion_disk_skimmer', id: 'grindless:disk_skimming/skim_hot_flow', circuit: 3, items: [['grindless:mh_winding', 4]], fluids: [] },
    { m: 'plasma_mass_filter', id: 'grindless:plasma_mass_filtering/hot_flow_filter', circuit: 3, items: [], fluids: [['gtceu:hot_flow_plasma', 3000]] },
    { m: 'frc_former', id: 'grindless:frc_forming/load_flux_frc', circuit: 3, items: [['grindless:mh_winding', 4]], fluids: [['gtceu:filtered_hot_flow', 2700]] },
    { m: 'bz_dynamo', id: 'grindless:blandford_znajek/frc_spin_down', circuit: 3, items: [], fluids: [['gtceu:flux_loaded_frc', 2000]], gen: true, out: ['gtceu:cooled_exhaust', 800] },
    { m: 'droplet_radiator_works', id: 'grindless:droplet_radiator_assembly/shell_droplet_radiator', circuit: 5,
      items: [['grindless:droplet_nozzle_plate', 2], ['grindless:radiator_collector_shell', 2]], fluids: [['gtceu:sn_li_eutectic', 2000]], take: 'gtceu:sn_li_eutectic' },
    { m: 'penrose_engine', id: 'grindless:penrose_extraction/payload_penrose', circuit: 6, items: [['grindless:max_penrose_payload', 2]], fluids: [], gen: true }
  ]

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Regs: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
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
  function command(text) { return S.server.runCommandSilent('execute in ' + DIM + ' run ' + text) }
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
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) {
    try {
      var er = m.getMultiblockState().error
      var info = ''
      try { info = ' | ' + String(er.getErrorInfo().getString()) + ' @ ' + String(er.getPos()) } catch (x) { }
      return String(er) + info
    } catch (e) { return 'unknown' }
  }
  function clearBus(part) {
    var st = part.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
  }
  function tankAmount(hatch, id) {
    var t = hatch.tank
    var n = 0
    for (var i = 0; i < t.getTanks(); i++) {
      var f = t.getFluidInTank(i)
      if (!f.isEmpty() && String(classes().BI.FLUID.getKey(f.getFluid())) === id) n += Number(f.getAmount())
    }
    return n
  }

  function checkRecipes(server) {
    var rm = server.getRecipeManager()
    var missing = LOOKUP.filter(function (i) { return !rm.byKey(new (classes().RL)(i)).isPresent() })
    check('lookup', missing.length === 0, LOOKUP.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
    var SM = global.grindless.sgraModes
    check('static', !!SM && SM.skipped.length === 0 && SM.recipes.length === 2, 'recipes ' + (SM ? SM.recipes.length : null) + ', skipped ' + JSON.stringify(SM ? SM.skipped : null))
  }

  // the machine's own preview shape, placed block by block at (ox, oy, oz): the energy cells become OpV hatches (4 A input, or two 16 A wireless
  // dynamo hatches for a generator), buses become HV ones, and for the two fluid-slot machines one casing cell beside the input bus
  // becomes the new fluid hatch
  function placeShape(u, ox, oy, oz) {
    var def = classes().Regs.MACHINES.get(new (classes().RL)('gtceu:' + u.m))
    if (!def) throw new Error('gtceu:' + u.m + ' is not registered')
    var shapes = array(def.getMatchingShapes())
    if (shapes.length === 0) throw new Error('no preview shape for ' + u.m)
    var grid = shapes[0].getBlocks()
    var cells = []
    var ctl = null
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
    var parsed = []
    var census = {}
    cells.forEach(function (c) {
      var s = String(c.state)
      if (/Block\{minecraft:air\}/.test(s)) return
      var m = /Block\{([^}]+)\}(\[.*\])?/.exec(s)
      if (!m) return
      parsed.push({ x: c.x, y: c.y, z: c.z, id: m[1], props: m[2] || '' })
      census[m[1]] = (census[m[1]] || 0) + 1
    })
    var byCount = Object.keys(census).sort(function (a, b) { return census[b] - census[a] })
    var casing = byCount.filter(function (id) { return /casing/.test(id) })[0] || byCount[0]
    var energy = 0
    var wantE = u.gen ? 2 : 1
    var energyRe = u.gen ? /energy_output_hatch|dynamo_hatch/ : /energy_input_hatch/
    var busCell = null
    parsed.forEach(function (c) {
      if (energyRe.test(c.id)) {
        if (energy < wantE) { c.id = u.gen ? DYNAMO : HATCH; energy++ } else { c.id = casing; c.props = '' }
      } else if (/input_bus/.test(c.id)) { c.id = 'gtceu:hv_input_bus'; busCell = c }
      else if (/output_bus/.test(c.id)) c.id = 'gtceu:hv_output_bus'
    })
    var fluidKind = u.out ? 'gtceu:hv_output_hatch' : (u.take ? 'gtceu:hv_input_hatch' : null)
    var hasFluidHatch = parsed.some(function (c) { return /^gtceu:[a-z0-9]+_(input|output)_hatch$/.test(c.id) && (u.out ? /output/.test(c.id) : /input/.test(c.id)) })
    if (fluidKind !== null && !hasFluidHatch && busCell !== null) {
      var swapped = false
      parsed.forEach(function (c) {
        if (!swapped && c.id === casing && c.z === busCell.z && c.y === busCell.y && Math.abs(c.x - busCell.x) === 1) { c.id = fluidKind; c.props = ''; swapped = true }
      })
      note('fluid_hatch_' + u.m, swapped ? 'a casing cell beside the input bus became ' + fluidKind : 'no free casing cell beside the input bus')
    }
    var placed = 0
    var refused = []
    parsed.forEach(function (c) {
      var x = ox + c.x - ctl.x
      var y = oy + c.y - ctl.y
      var z = oz + c.z - ctl.z
      var ok = put(x, y, z, c.id + c.props)
      if (!ok && c.props !== '') ok = put(x, y, z, c.id)
      if (ok) placed++
      else refused.push(c.id + '@' + x + ',' + y + ',' + z)
    })
    u.pos = pos(ox, oy, oz)
    return { placed: placed, energy: energy, refused: refused }
  }

  function fill(u) {
    clearBus(u.inBus)
    if (u.outBus) clearBus(u.outBus)
    var st = u.inBus.getInventory().storage
    var n = 0
    st.setStackInSlot(n++, Item.of(CIRCUIT, '{Configuration:' + u.circuit + '}'))
    u.items.forEach(function (e) { st.setStackInSlot(n++, Item.of(e[0], e[1])) })
    u.fluidIns.forEach(function (h, i) { if (u.fluids[i]) h.tank.setFluidInTank(0, Fluid.of(u.fluids[i][0], u.fluids[i][1]).getFluidStack()) })
  }

  function begin() {
    S.level = S.server.getLevel(DIM)
    if (!S.level) { check('dimension', false, DIM + ' is not loaded'); S.units = []; return }
    try { checkRecipes(S.server) } catch (e) { check('recipes_exception', false, errText(e)) }
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    command('fill ' + X0 + ' ' + Y0 + ' 0 ' + X1 + ' ' + Y1 + ' 63 minecraft:air')
    S.units = UNITS.map(function (u) { return { spec: u, phase: 'forming', started: 0 } })
    S.units.forEach(function (w, n) {
      try {
        var g = placeShape(w.spec, X0 + 20 + (n % 2) * 0, 100, 4 + n * 10)
        note('placed_' + w.spec.m, g.placed + ' blocks, ' + g.energy + ' energy cell(s); refused: ' + (g.refused.join(', ') || 'none'))
      } catch (e) { check('build_' + w.spec.m, false, errText(e)); w.phase = 'done' }
    })
    S.cur = 0
  }

  function tickUnit(w) {
    var u = w.spec
    var m = machine(u.pos)
    if (w.phase === 'forming') {
      if (!m || !formCheck(m, S.tick - w.t0)) {
        if (S.tick - w.t0 > 700) { check('formed_' + u.m, false, m ? 'not formed: ' + why(m) : 'no controller'); w.phase = 'done' }
        return
      }
      u.ctl = m
      u.energy = partsLike(m, u.gen ? /energy_output_hatch|dynamo_hatch/ : /energy_input_hatch/)
      u.inBus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      u.fluidIns = partsLike(m, /^gtceu:[a-z0-9]+_input_hatch$/)
      u.fluidOuts = partsLike(m, /^gtceu:[a-z0-9]+_output_hatch$/)
      var ok = !!u.inBus && u.energy.length === (u.gen ? 2 : 1) && (!u.take || u.fluidIns.length > 0) && (!u.out || u.fluidOuts.length > 0)
      check('formed_' + u.m, ok, u.m + ' formed; energy ' + u.energy.length + ', fluid in hatches ' + u.fluidIns.length + ', fluid out hatches ' + u.fluidOuts.length)
      if (u.gen) check('dynamo_' + u.m, u.energy.length === 2 && u.energy.every(function (p) { return String(p.getDefinition().getId()) === DYNAMO }),
        'dynamo hatches ' + u.energy.map(function (p) { return String(p.getDefinition().getId()) }).join(', '))
      if (!ok) { w.phase = 'done'; return }
      fill(u)
      w.started = S.tick
      w.phase = 'run'
      return
    }
    if (!u.gen) topUp(u.energy)
    var logic = u.ctl.getRecipeLogic()
    if (w.phase === 'run') {
      var last = logic.getLastRecipe()
      var id = last ? String(last.id) : 'none'
      if ((logic.isWorking() && id === u.id) || S.tick - w.started > 300) {
        var okr = logic.isWorking() && id === u.id
        check('run_' + u.m, okr, 'working ' + logic.isWorking() + ', recipe ' + id + ' (expected ' + u.id + '), status ' + String(logic.getStatus()))
        if (u.take) {
          var left = tankAmount(u.fluidIns[0], u.take)
          check('fluid_in', okr && left < u.fluids[0][1], u.take + ' left in the fluid input hatch: ' + left + ' of ' + u.fluids[0][1])
        }
        w.phase = okr && u.out ? 'out' : 'done'
        w.started = S.tick
      }
      return
    }
    if (w.phase === 'out') {
      var made = tankAmount(u.fluidOuts[0], u.out[0])
      if (made >= u.out[1] || S.tick - w.started > 1500) {
        check('fluid_out', made >= u.out[1], made + ' mB ' + u.out[0] + ' in the fluid output hatch after ' + (S.tick - w.started) + ' ticks (no bucket)')
        w.phase = 'done'
      }
    }
  }

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
  ServerEvents.customCommand('gg_test_max_sgra_modes', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMaxSgraModesRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMaxSgraModesRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMaxSgraModesRequest = false
        S = { server: event.server, tick: 0, failed: 0, finished: false, units: [], cur: 0 }
        try { begin() } catch (e) { check('setup_exception', false, errText(e)) }
        S.units.forEach(function (w) { w.t0 = 0 })
        return
      }
      if (S === null || S.finished) return
      S.tick++
      var w = S.units[S.cur]
      if (w) {
        if (w.t0 === 0 && w.phase === 'forming') w.t0 = S.tick
        try { tickUnit(w) } catch (e) { check('exception_' + w.spec.m, false, 'phase ' + w.phase + ': ' + errText(e)); w.phase = 'done' }
        if (w.phase === 'done') S.cur++
      }
      if (S.cur >= S.units.length) finish()
      else if (S.tick > 14000) { check('deadline', false, '14000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
