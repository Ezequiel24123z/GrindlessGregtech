// TEST ONLY, ZPM-S0. Command: kubejs custom_command gg_test_zpm_s0
// Disposable spikes, never shipped. Reserved band ONLY: X 18944-19007, Z 0-63, Overworld Y 98-112.
//   s0_1_registry   the startup 'gcyr:rocket_motor' and 'gcyr:fuel_tank' builders: which block class each one really creates
//   s0_2_planets    every GCYR planet's rocket tier, parentless-ness, and the datapack Saturn (5) and Uranus (6)
//   s0_5_*          the naquadah figures read from the live recipes (printed as NOTE lines)
//   s0_6_*          plasma EU/mB, then the custom 250 M start D + He-3 recipe on a formed Mk2 (must run) and a Mk1 (must refuse)
//   s0_7_*          a four-LuV-cell wireless tower, the store set to 3.93 G EU (> 2^31): status and readout
// No changed clock, no accelerated recipe: energy hatches are topped up, fluids put in the hatches.
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestZpmS0Request'
  var LOADED = Date.now()
  var X0 = 18944
  var X1 = 19007
  var Y = 100
  var NAME = 'zpm_s0'
  var BIG = 3932160000
  var CUSTOM = 'grindless:fusion_reactor/s0_d_he3'
  var MKS = {
    mk1: { id: 'gtceu:luv_fusion_reactor', at: [18946, 4], parts: { energy: 'gtceu:luv_energy_input_hatch', input: 'gtceu:luv_input_hatch', output: 'gtceu:luv_output_hatch' } },
    mk2: { id: 'gtceu:zpm_fusion_reactor', at: [18946, 28], parts: { energy: 'gtceu:zpm_energy_input_hatch', input: 'gtceu:zpm_input_hatch', output: 'gtceu:zpm_output_hatch' } }
  }

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
  function fluids(list) {
    return array(list).map(function (f) { return fluidId(f) + ' ' + Number(f.getAmount()) }).join(' + ')
  }
  function items(r, io) {
    try {
      var cap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
      var map = io === 'in' ? r.inputs : r.outputs
      var list = map.get(cap)
      if (list === null || list === undefined) return ''
      return array(list).map(function (c) {
        try {
          var ing = c.content
          var n = ing.getAmount ? Number(ing.getAmount()) : 1
          var stacks = ing.getItems()
          return n + 'x ' + (stacks.length > 0 ? String(classes().Registries.ITEMS.getKey(stacks[0].getItem())) : '?') + (stacks.length > 1 ? '(+' + (stacks.length - 1) + ')' : '')
        } catch (e2) { return String(c.content) }
      }).join(' + ')
    } catch (e) { return '(items unreadable: ' + e + ')' }
  }

  // ---------------------------------------------------------------- S0-1 and S0-2 (registries)
  function registries() {
    ;[['grindless:s0_naquadah_motor', 'gcyr:rocket_motor'], ['grindless:s0_aerogel_tank', 'gcyr:fuel_tank']].forEach(function (p) {
      var block = Block.getBlock(p[0])
      var cls = block === null || block === undefined ? 'absent' : String(block.getClass().getName())
      var motor = cls.indexOf('RocketMotorBlock') >= 0
      var tank = cls.indexOf('FuelTankBlock') >= 0
      var detail = p[1] + ' builder made ' + cls
      if (p[1] === 'gcyr:rocket_motor') check('s0_1_motor_builder', motor, detail + (tank ? ' (a fuel tank, not a motor)' : ''))
      else check('s0_1_tank_builder', tank, detail)
    })
    try {
      var PD = Java.loadClass('argent_matter.gcyr.data.loader.PlanetData')
      var keys = array(PD.planets().keySet())
      var seen = {}
      keys.forEach(function (k) {
        var pl = PD.getPlanet(k)
        seen[String(k)] = Number(pl.rocketTier())
        var parent = ''
        try { parent = String(pl.parentWorld()) } catch (e) { parent = '?' }
        note('s0_2_planet', String(k) + ' rocket_tier ' + Number(pl.rocketTier()) + ' parent ' + parent)
      })
      check('s0_2_saturn', seen['grindless:s0_saturn'] === 5, 'tier ' + seen['grindless:s0_saturn'])
      check('s0_2_uranus', seen['grindless:s0_uranus'] === 6, 'tier ' + seen['grindless:s0_uranus'])
      var above = Object.keys(seen).filter(function (k) { return seen[k] >= 7 })
      note('s0_2_tier7plus', above.length === 0 ? 'none' : above.map(function (k) { return k + '=' + seen[k] }).join(', '))
      check('s0_2_proxima_unreachable', seen['gcyr:proxima_centauri_b'] === undefined || seen['gcyr:proxima_centauri_b'] >= 7,
        'proxima_centauri_b tier ' + seen['gcyr:proxima_centauri_b'] + ' (a level 6 rocket reaches tier <= 6)')
    } catch (e) { check('s0_2_registry', false, 'PlanetData: ' + e) }
  }

  // ---------------------------------------------------------------- S0-5 (naquadah balance, printed)
  function naquadah() {
    var re = /naquadah_reactor|naquadah_based_liquid_fuel|naquadria|large_naquadah|naquadah_refining|naquadah_plant|plasma_generator\/(helium|tin)_plasma/
    var n = 0
    array(S.server.getRecipeManager().getRecipes()).forEach(function (r) {
      var id = String(r.getId())
      if (!re.test(id)) return
      n++
      var gt = null
      try { gt = r.getInputEUt ? r : null } catch (e) { gt = null }
      if (gt === null) { note('s0_5_recipe', id + ' (not a GT recipe)'); return }
      note('s0_5_recipe', id + ' | in ' + inEUt(r) + ' out ' + outEUt(r) + ' EU/t x ' + Number(r.duration) + ' t | fluids in [' +
        fluids(classes().Helper.getInputFluids(r)) + '] out [' + fluids(classes().Helper.getOutputFluids(r)) + '] | items in [' + items(r, 'in') +
        '] out [' + items(r, 'out') + ']' + (start(r) > 0 ? ' | start ' + start(r) : ''))
    })
    check('s0_5_recipes_found', n > 0, n + ' recipes matched')
  }

  // ---------------------------------------------------------------- S0-6
  function plasma() {
    ;['helium_plasma', 'tin_plasma'].forEach(function (p) {
      var g = byId('gtceu:plasma_generator/' + p)
      if (g === null) g = byId('gtceu:plasma_generator/' + p.replace('_plasma', ''))
      if (g === null) { note('s0_6_plasma_' + p, 'generator recipe absent'); return }
      var gin = array(classes().Helper.getInputFluids(g))
      var mb = Number(gin[0].getAmount())
      note('s0_6_plasma_' + p, outEUt(g) + ' EU/t x ' + Number(g.duration) + ' t per ' + mb + ' mB = ' + (outEUt(g) * Number(g.duration) / mb) + ' EU/mB (generators.js x2 included)')
    })
    var r = byId(CUSTOM)
    check('s0_6_custom_recipe', r !== null && start(r) === 250000000, r === null ? 'absent' : inEUt(r) + ' EU/t x ' + Number(r.duration) + ' t, start ' + start(r))
  }
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
  function place(id, ox, oz) {
    var cells = blocksOf(shapeOf(id, 'gtceu:fusion_glass'))
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
    note('s0_6_placed_' + id.replace(/^gtceu:/, ''), 'size ' + JSON.stringify(size) + ' at ' + ox + ',' + Y + ',' + oz)
    return ctrl
  }
  function setup(key) {
    var d = MKS[key]
    return { key: key, def: d, pos: place(d.id, d.at[0], d.at[1]), phase: 'forming', started: S.tick, ctrl: null, P: null, run: null }
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
        if (S.tick - m.started > 400) { check('s0_6_' + m.key + '_formed', false, 'not formed in 400 t'); m.phase = 'done' }
        return
      }
      m.ctrl = ctrl
      parts(m)
      var cap = -1
      try { cap = Number(classes().Fusion.calculateEnergyStorageFactor(m.ctrl.getTier(), m.P.energy.length)) } catch (e) { cap = -1 }
      check('s0_6_' + m.key + '_formed', m.P.energy.length > 0 && m.P.input.length >= 2 && m.P.output.length >= 1,
        'tier ' + m.ctrl.getTier() + ', energy ' + m.P.energy.length + ', input ' + m.P.input.length + ', output ' + m.P.output.length + ', buffer ' + cap + ' EU')
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
        check('s0_6_mk2_runs_custom', m.run !== null && m.run.id === CUSTOM, JSON.stringify(m.run) + '; ' + JSON.stringify(out))
        m.phase = 'done'
      } else if (S.tick - m.started > 600) {
        check('s0_6_mk2_runs_custom', false, 'timeout; run ' + JSON.stringify(m.run) + '; reasons ' + String(rlg.getFailureReasons()))
        m.phase = 'done'
      }
    } else if (S.tick - m.started >= 160) {
      check('s0_6_mk1_refuses_custom', !gotPlasma && (m.run === null || m.run.id !== CUSTOM) && Number(rlg.getProgress()) === 0,
        'run ' + JSON.stringify(m.run) + '; ' + JSON.stringify(out) + '; reasons ' + String(rlg.getFailureReasons()))
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- S0-7
  function wireless() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.settle !== 'function' || typeof w.setStored !== 'function') throw new Error('global.grindless.wireless is incomplete')
    return w
  }
  function towerPlan(w, p) {
    var desc = global.grindless.structures[w.towerId]
    var ctrl = null
    desc.slices.forEach(function (rows, si) { rows.forEach(function (row, ri) {
      for (var ci = 0; ci < row.length; ci++) { var s = desc.symbols[row.charAt(ci)]; if (s && s.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci } }
    }) })
    var out = []
    desc.slices.forEach(function (rows, si) { rows.forEach(function (row, ri) {
      for (var ci = 0; ci < row.length; ci++) {
        var ch = row.charAt(ci)
        if (ch === ' ') continue
        out.push({ x: p.x - (ci - ctrl.ci), y: p.y + (ri - ctrl.ri), z: p.z - (si - ctrl.si), sym: desc.symbols[ch] })
      }
    }) })
    return out
  }
  function defaultBlock(sym) {
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    if (sym.kind === 'blocks') return sym.blocks[0]
    if (sym.kind === 'oneOf') {
      for (var k = 0; k < sym.options.length; k++) if (sym.options[k].kind === 'blocks') return sym.options[k].blocks[0]
    }
    return null
  }
  function put(x, y, z, block) {
    if (x < X0 || x > X1 || z < 0 || z > 63 || y < 98 || y > 112) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    command('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function buildTower() {
    var w = wireless()
    var cell = w.tierRow[6].cell
    var at = { x: 18985, y: Y, z: 50 }
    var used = 0
    var slots = 0
    towerPlan(w, at).forEach(function (c) {
      var kind = c.sym.kind
      if (kind === 'controller' || kind === 'air' || kind === 'any') return
      var id = defaultBlock(c.sym)
      if (kind === 'oneOf') { slots++; id = used < 4 ? cell : w.casing; used++ }
      put(c.x, c.y, c.z, id)
    })
    put(at.x, at.y, at.z, w.towerId + '[facing=north]')
    note('s0_7_tower', 'cell ' + cell + ' x ' + Math.min(4, slots) + ' of ' + slots + ' slots; LuV cell ' + w.tierRow[6].capacity + ' EU')
    return { pos: new (classes().Pos)(at.x, at.y, at.z), phase: 'forming', started: S.tick }
  }
  function tickTower(t) {
    if (t.phase === 'done') return
    var m = classes().Meta.getMachine(S.level, t.pos)
    var waited = S.tick - t.started
    if (!m) { if (waited > 600) { check('s0_7_formed', false, 'no controller'); t.phase = 'done' } return }
    if (!m.isFormed()) {
      if (waited < 100) return
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
      else if (waited > 400) { check('s0_7_formed', false, 'not formed: ' + m.getMultiblockState().error); t.phase = 'done' }
      return
    }
    var w = wireless()
    w.dropCache()
    w.paused = false
    var tracked = w.track(S.level, t.pos)
    note('s0_7_tracked', JSON.stringify(tracked))
    var st = w.settle(S.server)
    note('s0_7_before', 'up ' + st.up + ', towers ' + st.towers + ', capacity ' + st.capacity + ', tier ' + st.tier)
    check('s0_7_capacity', Number(st.capacity) > 2147483647, 'reported capacity ' + st.capacity + ' (2^31 = 2147483648)')
    w.setStored(S.server, BIG)
    st = w.settle(S.server)
    var stored = Number(w.stored(S.server))
    check('s0_7_stored', stored === BIG, 'set ' + BIG + ', read back ' + stored)
    var s2 = w.status(S.server)
    var comp = w.readout(S.server, 0, false)
    var cargs = comp.getContents().getArgs()
    var text = String(comp.getContents().getKey())
    for (var ai = 0; ai < cargs.length; ai++) text += ' | ' + String(cargs[ai])
    note('s0_7_status', 'stored ' + s2.stored + ' capacity ' + s2.capacity + ' up ' + s2.up)
    note('s0_7_readout', text)
    var digits = text.replace(/[^0-9]/g, '')
    check('s0_7_readout_whole', digits.indexOf('3932160000') >= 0 || text.indexOf('3,932,160,000') >= 0 || text.indexOf('3.93') >= 0,
      'readout text: ' + text)
    t.phase = 'done'
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
    guarded('s0_1_2', registries)
    guarded('s0_5', naquadah)
    guarded('s0_6_static', plasma)
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    guarded('s0_6_place', function () { S.mk1 = setup('mk1'); S.mk2 = setup('mk2') })
    guarded('s0_7_place', function () { S.tower = buildTower() })
    if (!S.mk1) S.mk1 = { phase: 'done' }
    if (!S.mk2) S.mk2 = { phase: 'done' }
    if (!S.tower) S.tower = { phase: 'done' }
  }
  ServerEvents.customCommand('gg_test_zpm_s0', function () {
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
      tickTower(S.tower)
      if (S.mk1.phase === 'done' && S.mk2.phase === 'done' && S.tower.phase === 'done') finish()
      else if (S.tick > 2400) { check('deadline', false, '2400-tick fixture ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, String(e))
      finish()
    }
  })
})()
