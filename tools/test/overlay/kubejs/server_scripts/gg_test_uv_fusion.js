// TEST ONLY, UV-A3. Command: kubejs custom_command gg_test_uv_fusion   Reserved band: X 23808-23871, Z 0-63, Overworld Y 98-112.
// Run: powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -Commands 'kubejs custom_command gg_test_uv_fusion' `
//        -WaitForLog 'GGTEST\|uv_fusion\|DONE'
// Markers: GGTEST|uv_fusion|<check>|PASS|FAIL|NOTE|<detail>
// The one named doubt: a recipe that needs the table's real 640 M start (fusion_mk3.json mk3.maxStart) runs on a formed Mk3.
//   a3_mk3_runs     a formed Mk3 (UV hatches) starts that recipe and makes helium plasma
//   a3_static_*     live lookups: the audit published by the script, the two chamber recipes, the hot cell row, the decaborane row,
//                   the two capsule rows, the chamber's crafting recipe
// The 13 x 13 x 13 chamber itself is not formed here (the structure is proved by tools/analysis/test/uv-fusion.test.mjs).
// No changed clock, no accelerated recipe: energy hatches are topped up, fluids put in the hatches.
ServerEvents.recipes(function (event) {
  try {
    var table = global.grindless.readJsonTable('kubejs/data/grindless/tables/fusion_mk3.json')
    global.ggTestUvFusionStart = Number(table.mk3.maxStart)
    event.recipes.gtceu.fusion_reactor('grindless:gg_test_uv_fusion_640m')
      .inputFluids(Fluid.of('gtceu:deuterium', 125))
      .inputFluids(Fluid.of('gtceu:helium_3', 125))
      .outputFluids(Fluid.of('gtceu:helium_plasma', 125))
      .EUt(131072).duration(16).fusionStartEU(global.ggTestUvFusionStart)
  } catch (e) {
    global.ggTestUvFusionStart = -1
    console.info('GGTEST|uv_fusion|a3_recipe_builder|FAIL|' + e)
  }
})

;(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestUvFusionRequest'
  var LOADED = Date.now()
  var X0 = 23808
  var X1 = 23871
  var Y = 100
  var NAME = 'uv_fusion'
  var CUSTOM = 'grindless:gg_test_uv_fusion_640m'
  var MK3 = { id: 'gtceu:uv_fusion_reactor', at: [23810, 4], parts: { energy: 'gtceu:uv_energy_input_hatch', input: 'gtceu:uv_input_hatch', output: 'gtceu:uv_output_hatch' } }

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Machines: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
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
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + detail) }
  function byId(id) {
    var found = S.server.getRecipeManager().byKey(new (classes().RL)(id))
    return found.isPresent() ? found.get() : null
  }
  function command(text) { return S.server.runCommandSilent('execute in minecraft:overworld run ' + text) }
  function fluidId(stack) { return String(classes().Registries.FLUIDS.getKey(stack.getFluid())) }
  // EU/t reads never throw: -1 means "could not read", reported as a NOTE rather than failing the run
  function eut(r, side) {
    var attempts = [
      function () { return side === 'out' ? r.getOutputEUt().getTotalEU() : r.getInputEUt().getTotalEU() },
      function () { return side === 'out' ? classes().Helper.getOutputEUt(r).getTotalEU() : classes().Helper.getInputEUt(r).getTotalEU() }
    ]
    for (var i = 0; i < attempts.length; i++) {
      try {
        var v = Number(attempts[i]())
        if (!isNaN(v)) return Math.abs(v)
      } catch (e) { /* try the next reader */ }
    }
    note('eut_unparsed', String(r.id) + ' ' + side)
    return -1
  }
  function startOf(r) {
    try { return r.data.contains('eu_to_start') ? Number(r.data.getLong('eu_to_start')) : -1 } catch (e) { return -1 }
  }
  function fluidMap(list) {
    var t = {}
    array(list).forEach(function (f) { t[fluidId(f)] = (t[fluidId(f)] || 0) + Number(f.getAmount()) })
    return t
  }
  function outputsOf(r) { try { return fluidMap(classes().Helper.getOutputFluids(r)) } catch (e) { return {} } }

  // ---------------------------------------------------------------- static lookups
  function statics() {
    var A = global.grindless.uvFusion
    check('a3_static_audit', !!A && A.errors.length === 0 && A.unaudited.length === 0 && A.missing.length === 0 && A.luvCutsLive.length === 0,
      A ? 'audited ' + A.audited.length + ', unaudited ' + JSON.stringify(A.unaudited) + ', missing ' + JSON.stringify(A.missing) + ', luvCutsLive ' + JSON.stringify(A.luvCutsLive) + ', errors ' + JSON.stringify(A.errors) : 'not published')

    ;[['pb11', 400, { 'gtceu:helium': 3000 }], ['d_he3', 600, { 'gtceu:helium': 1000, 'gtceu:hydrogen': 1000 }]].forEach(function (c) {
      var r = byId('grindless:laser_fusion/' + c[0])
      if (r === null) { check('a3_static_chamber_' + c[0], false, 'absent'); return }
      var out = outputsOf(r)
      var ok = eut(r, 'out') === 2621440 && Number(r.duration) === c[1] && JSON.stringify(out) === JSON.stringify(c[2])
      check('a3_static_chamber_' + c[0], ok, eut(r, 'out') + ' EU/t out x ' + Number(r.duration) + ' t, ' + JSON.stringify(out))
    })

    var hc = byId('grindless:hot_cell/boron_11_enrichment')
    var hout = hc === null ? {} : outputsOf(hc)
    check('a3_static_hot_cell', hc !== null && hout['gtceu:boron_11_trifluoride'] === 3000 && hout['gtceu:boron_10_trifluoride'] === 1000,
      hc === null ? 'absent' : JSON.stringify(hout))

    var dec = byId('grindless:chemical_reactor/decaborane')
    var dout = dec === null ? {} : outputsOf(dec)
    check('a3_static_decaborane', dec !== null && dout['gtceu:decaborane'] === 1000, dec === null ? 'absent' : JSON.stringify(dout))

    ;['pb11_capsule', 'd_he3_capsule'].forEach(function (n) {
      var r = byId('grindless:diamond_cvd/' + n)
      check('a3_static_' + n, r !== null, r === null ? 'absent' : eut(r, 'in') + ' EU/t x ' + Number(r.duration) + ' t')
    })
    check('a3_static_crafting', byId('grindless:crafting/laser_fusion_chamber') !== null, 'grindless:crafting/laser_fusion_chamber')
    check('a3_static_machine', !!classes().Machines.MACHINES.get(new (classes().RL)('gtceu:laser_fusion_chamber')), 'gtceu:laser_fusion_chamber registered')
    var mine = byId(CUSTOM)
    check('a3_static_640m', mine !== null && startOf(mine) === 640000000, mine === null ? 'absent' : 'start ' + startOf(mine) + ', ' + eut(mine, 'in') + ' EU/t')
  }

  // ---------------------------------------------------------------- the Mk3
  function shapeOf(id) {
    var def = classes().Machines.MACHINES.get(new (classes().RL)(id))
    if (!def) throw new Error('no machine ' + id)
    var shapes = array(def.getMatchingShapes())
    if (shapes.length === 0) throw new Error('no preview shape for ' + id)
    for (var i = 0; i < shapes.length; i++) {
      if (blocksOf(shapes[i]).some(function (b) { return b.id === 'gtceu:fusion_glass' })) return shapes[i]
    }
    return shapes[0]
  }
  function blocksOf(shape) {
    var blocks = shape.getBlocks()
    var out = []
    for (var x = 0; x < blocks.length; x++) for (var y = 0; y < blocks[x].length; y++) for (var z = 0; z < blocks[x][y].length; z++) {
      var info = blocks[x][y][z]
      if (info === null || info === undefined) continue
      var state = info.getBlockState()
      out.push({ x: x, y: y, z: z, state: state, id: String(Block.getId(state.getBlock())) })
    }
    return out
  }
  function place(id, ox, oz) {
    var cells = blocksOf(shapeOf(id))
    var ctrl = null
    var size = { x: 0, y: 0, z: 0 }
    cells.forEach(function (c) { size.x = Math.max(size.x, c.x + 1); size.y = Math.max(size.y, c.y + 1); size.z = Math.max(size.z, c.z + 1) })
    if (ox + size.x - 1 > X1 || oz + size.z - 1 > 63 || Y + size.y - 1 > 112) throw new Error(id + ' does not fit the band: ' + JSON.stringify(size))
    cells.forEach(function (c) {
      if (c.id === 'minecraft:air') return
      var pos = new (classes().Pos)(ox + c.x, Y + c.y, oz + c.z)
      S.level.setBlock(pos, c.state, 3)
      if (c.id === id) ctrl = pos
    })
    if (ctrl === null) throw new Error('no controller in the preview of ' + id)
    note('a3_placed', 'size ' + JSON.stringify(size) + ' at ' + ox + ',' + Y + ',' + oz)
    return ctrl
  }
  function parts(m) {
    m.P = { energy: [], input: [], output: [] }
    array(m.ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      Object.keys(MK3.parts).forEach(function (role) { if (pid === MK3.parts[role]) m.P[role].push(p) })
    })
  }
  function topUp(m) {
    m.P.energy.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) })
  }
  function outputs(m) {
    var t = {}
    m.P.output.forEach(function (h) {
      var st = h.tank.getFluidInTank(0)
      if (!st.isEmpty()) t[fluidId(st)] = (t[fluidId(st)] || 0) + Number(st.getAmount())
    })
    return t
  }
  function tickMk3(m) {
    if (m.phase === 'done') return
    if (m.phase === 'forming') {
      var ctrl = classes().Meta.getMachine(S.level, m.pos)
      if (!ctrl || !ctrl.isFormed()) {
        if (S.tick - m.started > 400) { check('a3_mk3_formed', false, 'not formed in 400 t'); m.phase = 'done' }
        return
      }
      m.ctrl = ctrl
      parts(m)
      check('a3_mk3_formed', m.P.energy.length > 0 && m.P.input.length >= 2 && m.P.output.length >= 1,
        'tier ' + m.ctrl.getTier() + ', energy ' + m.P.energy.length + ', input ' + m.P.input.length + ', output ' + m.P.output.length)
      m.P.input[0].tank.setFluidInTank(0, Fluid.of('gtceu:deuterium', 4000).getFluidStack())
      m.P.input[1].tank.setFluidInTank(0, Fluid.of('gtceu:helium_3', 4000).getFluidStack())
      m.ctrl.getRecipeLogic().updateTickSubscription()
      m.phase = 'running'
      m.started = S.tick
      return
    }
    topUp(m)
    var rlg = m.ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    if (m.run === null && String(rlg.getStatus()) === 'WORKING' && last !== null && last !== undefined) m.run = { id: String(last.id), start: startOf(last) }
    var out = outputs(m)
    if ((out['gtceu:helium_plasma'] || 0) > 0) {
      check('a3_mk3_runs', m.run !== null && m.run.id === CUSTOM && m.run.start === 640000000, JSON.stringify(m.run) + '; ' + JSON.stringify(out))
      m.phase = 'done'
    } else if (S.tick - m.started > 900) {
      check('a3_mk3_runs', false, 'timeout; run ' + JSON.stringify(m.run) + '; reasons ' + String(rlg.getFailureReasons()))
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- driver
  function clear() {
    for (var z = 0; z < 64; z += 16) command('fill ' + X0 + ' 98 ' + z + ' ' + X1 + ' 112 ' + (z + 15) + ' minecraft:air')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    clear()
    command('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function guarded(label, fn) {
    try { fn() } catch (e) { check(label + '_exception', false, String(e)) }
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, mk3: null }
    S.level = server.getLevel('minecraft:overworld')
    guarded('a3_static', statics)
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    guarded('a3_place', function () {
      S.mk3 = { pos: place(MK3.id, MK3.at[0], MK3.at[1]), phase: 'forming', started: S.tick, ctrl: null, P: null, run: null }
    })
    if (!S.mk3) S.mk3 = { phase: 'done' }
  }
  ServerEvents.customCommand('gg_test_uv_fusion', function () {
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
      tickMk3(S.mk3)
      if (S.mk3.phase === 'done') finish()
      else if (S.tick > 1800) { check('deadline', false, '1800-tick fixture ceiling'); finish() }
    } catch (e) {
      check('tick_exception', false, String(e))
      finish()
    }
  })
})()
