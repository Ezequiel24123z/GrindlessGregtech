// TEST ONLY, ZPM-A7. Command: kubejs custom_command gg_test_zpm_fusion   Reserved band: X 20736-20799, Z 0-63, Overworld Y 98-112.
// Run: powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -Commands 'kubejs custom_command gg_test_zpm_fusion' `
//        -WaitForLog 'GGTEST\|zpm_fusion\|DONE'
// Markers: GGTEST|zpm_fusion|<check>|PASS|FAIL|NOTE|<detail>
//   a7_static_*     live recipe lookups: our D + He-3, the five plasma quench recipes, the two converter recipes (EU per mB = 1.25 x the turbine's)
//   a7_mk2_runs     a formed Mk2 runs our D + He-3 (200 M start) and makes helium plasma
//   a7_mk1_refuses  a formed Mk1 does not (its start limit is 160 M)
//   a7_conv_*       a formed direct energy converter (dynamo hatches swapped for ZPM ones) burns helium plasma: EU in the dynamo, helium out
// No changed clock, no accelerated recipe: energy hatches are topped up, fluids put in the hatches.
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestZpmFusionRequest'
  var LOADED = Date.now()
  var X0 = 20736
  var X1 = 20799
  var Y = 100
  var NAME = 'zpm_fusion'
  var OURS = 'grindless:fusion_reactor/d_he3_to_helium_plasma'
  var CONVERTER = 'gtceu:direct_energy_converter'
  var MKS = {
    mk1: { id: 'gtceu:luv_fusion_reactor', at: [20738, 4], parts: { energy: 'gtceu:luv_energy_input_hatch', input: 'gtceu:luv_input_hatch', output: 'gtceu:luv_output_hatch' } },
    mk2: { id: 'gtceu:zpm_fusion_reactor', at: [20738, 28], parts: { energy: 'gtceu:zpm_energy_input_hatch', input: 'gtceu:zpm_input_hatch', output: 'gtceu:zpm_output_hatch' } }
  }

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Machines: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
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
  function inEUt(r) { try { return Number(r.getInputEUt().getTotalEU()) } catch (e) { return -1 } }
  function outEUt(r) { try { return Number(r.getOutputEUt().getTotalEU()) } catch (e) { return -1 } }
  function start(r) { return r.data.contains('eu_to_start') ? Number(r.data.getLong('eu_to_start')) : -1 }
  function fluidMap(list) {
    var t = {}
    array(list).forEach(function (f) { t[fluidId(f)] = (t[fluidId(f)] || 0) + Number(f.getAmount()) })
    return t
  }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b) }
  function itemOut(r) {
    try {
      var list = r.outputs.get(classes().ItemCap)
      if (list === null || list === undefined) return ''
      return array(list).map(function (c) {
        var ing = c.content
        var stacks = ing.getItems()
        return Number(ing.getAmount()) + 'x ' + (stacks.length > 0 ? String(classes().Registries.ITEMS.getKey(stacks[0].getItem())) : '?')
      }).join(' + ')
    } catch (e) { return '(unreadable: ' + e + ')' }
  }

  // ---------------------------------------------------------------- static lookups
  function statics() {
    var d = byId(OURS)
    check('a7_static_d_he3', d !== null && start(d) === 200000000 && inEUt(d) === 16384 && Number(d.duration) === 16,
      d === null ? 'absent' : inEUt(d) + ' EU/t x ' + Number(d.duration) + ' t, start ' + start(d) +
        ', out ' + JSON.stringify(fluidMap(classes().Helper.getOutputFluids(d))))

    var metals = [['duranium', 'plate', 1], ['duranium', 'foil', 4], ['tritanium', 'plate', 1], ['tritanium', 'foil', 4], ['darmstadtium', 'plate', 1]]
    metals.forEach(function (m) {
      var r = byId('grindless:plasma_quench/' + m[0] + '_' + m[1])
      if (r === null) { check('a7_static_quench_' + m[0] + '_' + m[1], false, 'absent'); return }
      var fin = fluidMap(classes().Helper.getInputFluids(r))
      var fout = fluidMap(classes().Helper.getOutputFluids(r))
      var ok = inEUt(r) === 30720 && Number(r.duration) === 20 && fin['gtceu:' + m[0]] === 144 && fin['gtceu:argon'] === 1000 &&
        fout['gtceu:argon'] === 950 && fout['gtceu:steam'] === 2000 && itemOut(r) === m[2] + 'x gtceu:' + m[0] + '_' + m[1]
      check('a7_static_quench_' + m[0] + '_' + m[1], ok, inEUt(r) + ' EU/t x ' + Number(r.duration) + ' t in ' + JSON.stringify(fin) + ' out ' + JSON.stringify(fout) + ' + ' + itemOut(r))
    })
    check('a7_static_no_darmstadtium_foil', byId('grindless:plasma_quench/darmstadtium_foil') === null, 'GTM has no darmstadtium foil')

    ;[['helium_plasma', 'helium', 80], ['tin_plasma', 'tin', 256]].forEach(function (p) {
      var r = byId('grindless:direct_conversion/' + p[0])
      var g = byId('gtceu:plasma_generator/' + p[0])
      if (g === null) g = byId('gtceu:plasma_generator/' + p[0].replace('_plasma', ''))
      if (r === null || g === null) { check('a7_static_conv_' + p[0], false, 'converter ' + (r !== null) + ', turbine ' + (g !== null)); return }
      var gin = array(classes().Helper.getInputFluids(g))
      var turbine = outEUt(g) * Number(g.duration) / Number(gin[0].getAmount())
      var conv = outEUt(r) * Number(r.duration)
      var fin = fluidMap(classes().Helper.getInputFluids(r))
      var fout = fluidMap(classes().Helper.getOutputFluids(r))
      check('a7_static_conv_' + p[0], Number(r.duration) === p[2] && Math.abs(conv - 1.25 * turbine) < 0.5 && fin['gtceu:' + p[0]] === 1 && fout['gtceu:' + p[1]] === 1,
        outEUt(r) + ' EU/t x ' + Number(r.duration) + ' t = ' + conv + ' EU/mB; turbine ' + turbine + ' EU/mB (x1.25 = ' + (1.25 * turbine) + ')')
    })
    ;['grindless:crafting/plasma_quench_caster', 'grindless:crafting/direct_energy_converter'].forEach(function (id) {
      check('a7_static_' + id.replace('grindless:crafting/', 'crafting_'), byId(id) !== null, id)
    })
  }

  // ---------------------------------------------------------------- structures
  function shapeOf(id, wantBlock) {
    var def = classes().Machines.MACHINES.get(new (classes().RL)(id))
    if (!def) throw new Error('no machine ' + id)
    var shapes = array(def.getMatchingShapes())
    if (shapes.length === 0) throw new Error('no preview shape for ' + id)
    for (var i = 0; i < shapes.length; i++) {
      if (blocksOf(shapes[i]).some(function (b) { return b.id === wantBlock })) return shapes[i]
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
  // dynamo hatches of the preview are swapped for the ZPM one, keeping the facing, so the converter's 2,560 EU/t fits
  function place(id, ox, oz, wantBlock, swapDynamo) {
    var cells = blocksOf(shapeOf(id, wantBlock))
    var ctrl = null
    var size = { x: 0, y: 0, z: 0 }
    cells.forEach(function (c) { size.x = Math.max(size.x, c.x + 1); size.y = Math.max(size.y, c.y + 1); size.z = Math.max(size.z, c.z + 1) })
    if (ox + size.x - 1 > X1 || oz + size.z - 1 > 63 || Y + size.y - 1 > 112) throw new Error(id + ' does not fit the band: ' + JSON.stringify(size))
    cells.forEach(function (c) {
      if (c.id === 'minecraft:air') return
      var pos = new (classes().Pos)(ox + c.x, Y + c.y, oz + c.z)
      if (swapDynamo && /energy_output_hatch|dynamo/.test(c.id)) {
        var props = String(c.state).replace(/^[^\[]*/, '')
        command('setblock ' + (ox + c.x) + ' ' + (Y + c.y) + ' ' + (oz + c.z) + ' gtceu:zpm_energy_output_hatch' + props + ' replace')
      } else S.level.setBlock(pos, c.state, 3)
      if (c.id === id) ctrl = pos
    })
    if (ctrl === null) throw new Error('no controller in the preview of ' + id)
    note('a7_placed_' + id.replace(/^gtceu:/, ''), 'size ' + JSON.stringify(size) + ' at ' + ox + ',' + Y + ',' + oz)
    return ctrl
  }
  function setup(key) {
    var d = MKS[key]
    return { key: key, def: d, pos: place(d.id, d.at[0], d.at[1], 'gtceu:fusion_glass', false), phase: 'forming', started: S.tick, ctrl: null, P: null, run: null }
  }
  function parts(m) {
    m.P = { energy: [], input: [], output: [] }
    array(m.ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      Object.keys(m.def.parts).forEach(function (role) { if (pid === m.def.parts[role]) m.P[role].push(p) })
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
  function tickFusion(m) {
    if (m.phase === 'done') return
    if (m.phase === 'forming') {
      var ctrl = classes().Meta.getMachine(S.level, m.pos)
      if (!ctrl || !ctrl.isFormed()) {
        if (S.tick - m.started > 400) { check('a7_' + m.key + '_formed', false, 'not formed in 400 t'); m.phase = 'done' }
        return
      }
      m.ctrl = ctrl
      parts(m)
      check('a7_' + m.key + '_formed', m.P.energy.length > 0 && m.P.input.length >= 2 && m.P.output.length >= 1,
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
    if (m.run === null && String(rlg.getStatus()) === 'WORKING' && last !== null && last !== undefined) m.run = { id: String(last.id), eut: inEUt(last), duration: Number(rlg.getDuration()) }
    var out = outputs(m)
    var gotPlasma = (out['gtceu:helium_plasma'] || 0) > 0
    if (m.key === 'mk2') {
      if (gotPlasma) {
        check('a7_mk2_runs', m.run !== null && m.run.id === OURS, JSON.stringify(m.run) + '; ' + JSON.stringify(out))
        m.phase = 'done'
      } else if (S.tick - m.started > 600) {
        check('a7_mk2_runs', false, 'timeout; run ' + JSON.stringify(m.run) + '; reasons ' + String(rlg.getFailureReasons()))
        m.phase = 'done'
      }
    } else if (S.tick - m.started >= 160) {
      check('a7_mk1_refuses', !gotPlasma && (m.run === null || m.run.id !== OURS) && Number(rlg.getProgress()) === 0,
        'run ' + JSON.stringify(m.run) + '; ' + JSON.stringify(out) + '; reasons ' + String(rlg.getFailureReasons()))
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- the converter
  function setupConverter() {
    return { pos: place(CONVERTER, 20740, 50, 'grindless:cryostat_casing', true), phase: 'forming', started: S.tick, ctrl: null, dyn: [], inp: [], out: [], stored0: 0 }
  }
  function tickConverter(t) {
    if (t.phase === 'done') return
    var waited = S.tick - t.started
    if (t.phase === 'forming') {
      var m = classes().Meta.getMachine(S.level, t.pos)
      if (!m) { if (waited > 400) { check('a7_conv_formed', false, 'no controller'); t.phase = 'done' } return }
      if (!m.isFormed()) {
        if (waited < 60) return
        if (waited % 40 === 0 && m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
        else if (waited > 400) { check('a7_conv_formed', false, 'not formed: ' + m.getMultiblockState().error); t.phase = 'done' }
        return
      }
      t.ctrl = m
      array(m.getParts()).forEach(function (p) {
        var pid = String(p.getDefinition().getId())
        if (/energy_output_hatch/.test(pid)) t.dyn.push(p)
        else if (/input_hatch/.test(pid)) t.inp.push(p)
        else if (/output_hatch/.test(pid)) t.out.push(p)
      })
      check('a7_conv_formed', t.dyn.length > 0 && t.inp.length > 0 && t.out.length > 0, 'dynamo ' + t.dyn.length + ', input ' + t.inp.length + ', output ' + t.out.length)
      if (t.dyn.length === 0 || t.inp.length === 0 || t.out.length === 0) { t.phase = 'done'; return }
      t.inp[0].tank.setFluidInTank(0, Fluid.of('gtceu:helium_plasma', 1000).getFluidStack())
      t.ctrl.getRecipeLogic().updateTickSubscription()
      t.phase = 'running'
      t.started = S.tick
      return
    }
    var rlg = t.ctrl.getRecipeLogic()
    var eu = 0
    t.dyn.forEach(function (p) { eu += Number(p.energyContainer.getEnergyStored()) })
    var helium = 0
    t.out.forEach(function (h) {
      var st = h.tank.getFluidInTank(0)
      if (!st.isEmpty() && fluidId(st) === 'gtceu:helium') helium += Number(st.getAmount())
    })
    if (eu > 0 && helium > 0) {
      var last = rlg.getLastRecipe()
      check('a7_conv_runs', true, 'dynamo stored ' + eu + ' EU, helium out ' + helium + ' mB, last ' + (last ? String(last.id) : '?') + ', parallels ' + (last ? last.parallels : '?'))
      t.phase = 'done'
    } else if (waited > 600) {
      check('a7_conv_runs', false, 'timeout; EU ' + eu + ', helium ' + helium + ', status ' + String(rlg.getStatus()) + ', reasons ' + String(rlg.getFailureReasons()))
      t.phase = 'done'
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
    S = { server: server, tick: 0, failed: 0, finished: false }
    S.level = server.getLevel('minecraft:overworld')
    guarded('a7_static', statics)
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    guarded('a7_place_fusion', function () { S.mk1 = setup('mk1'); S.mk2 = setup('mk2') })
    guarded('a7_place_converter', function () { S.conv = setupConverter() })
    if (!S.mk1) S.mk1 = { phase: 'done' }
    if (!S.mk2) S.mk2 = { phase: 'done' }
    if (!S.conv) S.conv = { phase: 'done' }
  }
  ServerEvents.customCommand('gg_test_zpm_fusion', function () {
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
      tickFusion(S.mk1)
      tickFusion(S.mk2)
      tickConverter(S.conv)
      if (S.mk1.phase === 'done' && S.mk2.phase === 'done' && S.conv.phase === 'done') finish()
      else if (S.tick > 2400) { check('deadline', false, '2400-tick fixture ceiling'); finish() }
    } catch (e) {
      check('tick_exception', false, String(e))
      finish()
    }
  })
})()
