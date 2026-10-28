// priority: -7748
// TEST ONLY, UEV-S0. Command: kubejs custom_command gg_test_uev_s0_machines
// Band ONLY: X 30464-30527, Z 0-63, Overworld Y 70-100. Machines come from startup_scripts/gg_test_uev_s0_parts.js (gated by its marker).
//   s0_1_*  the UEV hull and hatches form in gtceu:gg_uev_s0_frame (2 A and 16 A) and in gtceu:assembly_line; the hull is placed and read
//   s0_6_*  gtceu:gg_uev_s0_fusion with 16 UEV 16 A hatches forms and runs a start-1.2 G fusion recipe
//   s0_7_*  GTM's EBF logic reads the 12,600 K coil; MEGA-S's coilParallel reads it (gtceu:gg_spike_lcr_chain, 2^14 capped at 64)
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 30464
  var X1 = 30527
  var Y0 = 70
  var Y1 = 100
  var NAME = 'uev_s0_machines'
  var COIL = 'grindless:s0_coil_12600'
  var HATCH2 = 'gtceu:uev_energy_input_hatch'
  var HATCH16 = 'gtceu:uev_energy_input_hatch_16a'
  var REQUEST = 'ggTestUevS0MachinesRequest'
  var POPPY = 'minecraft:poppy'
  var RED = 'minecraft:red_dye'
  var CANE = 'minecraft:sugar_cane'
  var PAPER = 'minecraft:paper'
  var FUSION_START = 1200000000

  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.macerator('gg_test_uev_s0:frame').itemInputs('1x minecraft:cobblestone').itemOutputs('1x minecraft:gravel').duration(20).EUt(8)
      event.recipes.gtceu.electric_blast_furnace('gg_test_uev_s0:ebf_12000').itemInputs('1x ' + CANE).itemOutputs('1x ' + PAPER).duration(100).EUt(30).blastFurnaceTemp(12000)
      event.recipes.gtceu.fusion_reactor('gg_test_uev_s0:fusion').inputFluids('minecraft:water 100', 'minecraft:lava 100').outputFluids('gtceu:helium 100')
        .EUt(8000000).duration(200).fusionStartEU(FUSION_START)
    } catch (e) {
      console.error('[gg_test uev_s0] could not add the test recipes: ' + errText(e))
    }
  })

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
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
  function partIds(ctrl) {
    var out = {}
    array(ctrl.getParts()).forEach(function (p) { out[String(p.getDefinition().getId())] = (out[String(p.getDefinition().getId())] || 0) + 1 })
    return JSON.stringify(out)
  }
  function items(p) {
    var st = p.getInventory().storage
    var t = {}
    for (var i = 0; i < st.getSlots(); i++) {
      var s = st.getStackInSlot(i)
      if (s.isEmpty()) continue
      var id = String(classes().Registries.ITEMS.getKey(s.getItem()))
      t[id] = (t[id] || 0) + Number(s.getCount())
    }
    return t
  }
  function fill(p, id, total) {
    var st = p.getInventory().storage
    var left = total
    for (var i = 0; i < st.getSlots(); i++) {
      var n = Math.min(64, left)
      st.setStackInSlot(i, n > 0 ? Item.of(id, n) : Item.of('minecraft:air'))
      left -= n
    }
    return left
  }
  function empty(p) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
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
      var err = m.getMultiblockState().error
      var p = err.getPos()
      return String(err.getErrorInfo().getString()) + ' at ' + (p ? p.getX() + ',' + p.getY() + ',' + p.getZ() : '?')
    } catch (e) { return 'unknown ' + e }
  }
  function field(o, name) {
    try {
      var v = o[name]
      if (v !== undefined && v !== null && typeof v !== 'function') return Number(v)
      var g = o['get' + name.charAt(0).toUpperCase() + name.substring(1)]
      if (typeof g === 'function') return Number(g.call(o))
    } catch (e) { }
    return NaN
  }
  function snapshot(m) {
    var rec = m.getRecipeLogic().getLastRecipe()
    if (rec === null || rec === undefined) return null
    var eut = NaN
    try { eut = Number(classes().RecipeHelper.getRealEUtWithIO(rec).getTotalEU()) } catch (e) { }
    return { parallels: field(rec, 'parallels'), duration: Number(rec.duration), eut: eut, id: String(rec.id) }
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
      var props = (sym.kind === 'part' || sym.kind === 'oneOf' || /hatch|bus/.test(block)) ? '[facing=north]' : ''
      put(c.x, c.y, c.z, block + props)
      count++
    })
    put(controller.x, controller.y, controller.z, id + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), blocks: count + 1 }
  }

  // placement from the preview shape (GTM machines without a lib/patterns description); hatchFor(cellId) returns a replacement block id or null
  function placeShape(id, cx, cy, cz, hatchFor) {
    var def = Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries').MACHINES.get(new (classes().RL)(id))
    var blocks = array(def.getMatchingShapes())[0].getBlocks()
    var cells = []
    var ctrl = null
    for (var x = 0; x < blocks.length; x++) for (var y = 0; y < blocks[x].length; y++) for (var z = 0; z < blocks[x][y].length; z++) {
      var info = blocks[x][y][z]
      if (info === null || info === undefined) continue
      var state = info.getBlockState()
      var bid = String(Block.getId(state.getBlock()))
      if (bid === 'minecraft:air') continue
      var cell = { x: x, y: y, z: z, state: state, id: bid }
      if (bid === id) ctrl = cell
      cells.push(cell)
    }
    var count = 0
    var out = null
    cells.forEach(function (c) {
      var px = cx + c.x - ctrl.x, py = cy + c.y - ctrl.y, pz = cz + c.z - ctrl.z
      if (!inBand(px, py, pz)) throw new Error('refused: ' + px + ',' + py + ',' + pz + ' is outside the band')
      var rep = c === ctrl ? null : hatchFor(c.id)
      if (rep) put(px, py, pz, rep + '[facing=north]')
      else S.level.setBlock(pos(px, py, pz), c.state, 3)
      count++
      if (c === ctrl) out = pos(px, py, pz)
    })
    return { pos: out, blocks: count }
  }

  function placeCheck(u, placed) {
    u.pos = placed.pos
    u.phase = 'forming'
    u.started = S.tick
    note(u.name + '_placed', 'controller ' + placed.pos.getX() + ',' + placed.pos.getY() + ',' + placed.pos.getZ() + ', ' + placed.blocks + ' blocks')
  }
  // returns false while waiting; true once formed
  function waitForm(u, m) {
    var waited = S.tick - u.started
    if (!m || !formCheck(m, waited)) {
      if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
      return false
    }
    return true
  }

  // ---------------------------------------------------------------- S0-1: the hatches in one of ours and in the assembly line
  var S1_UNITS = [
    { name: 'frame_2a', machine: 'gtceu:gg_uev_s0_frame', hatch: HATCH2, ampsWant: 2, x: 30470, z: 8 },
    { name: 'frame_16a', machine: 'gtceu:gg_uev_s0_frame', hatch: HATCH16, ampsWant: 16, x: 30480, z: 8 },
    { name: 'assembly_line', machine: 'gtceu:assembly_line', hatch: HATCH2, ampsWant: 2, x: 30495, z: 20 }
  ]
  function s1Build(u) {
    if (u.machine === 'gtceu:assembly_line') {
      placeCheck(u, placeShape(u.machine, u.x, 74, u.z, function (id) { return /energy_input_hatch/.test(id) ? u.hatch : null }))
      return
    }
    placeCheck(u, placeMachine(u.machine, u.x, 74, u.z, function (c) {
      if (c.sym.kind === 'part' && c.sym.ability === 'energy_input') return u.hatch
      return null
    }))
  }
  function s1Tick(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!waitForm(u, m)) return
      var hatches = partsLike(m, /uev_energy_input_hatch/)
      var cap = hatches.length > 0 ? Number(hatches[0].energyContainer.getEnergyCapacity()) : -1
      var amps = hatches.length > 0 ? Number(hatches[0].energyContainer.getInputAmperage()) : -1
      check(u.name + '_formed', hatches.length >= 1, 'class ' + m.getClass().getSimpleName() + ', parts ' + partIds(m) + ', UEV hatch capacity ' + cap + ', input amperage ' + amps)
      if (hatches.length > 0) check(u.name + '_amps', amps === u.ampsWant, 'input amperage ' + amps + ', want ' + u.ampsWant)
      u.phase = 'done'
    }
  }
  function hullUnit() {
    return { name: 'hull', phase: 'forming', started: 0, hull: true }
  }
  function hullBuild(u) {
    put(30490, 74, 40, 'gtceu:uev_machine_hull[facing=north]')
    u.pos = pos(30490, 74, 40)
    u.started = S.tick
  }
  function hullTick(u) {
    if (S.tick - u.started < 20) return
    var m = machine(u.pos)
    check('hull_machine', !!m, m ? 'class ' + m.getClass().getSimpleName() + ', tier ' + field(m, 'tier') + ', id ' + String(m.getDefinition().getId()) : 'no machine at the hull block')
    u.phase = 'done'
  }

  // ---------------------------------------------------------------- S0-6: a fusion ring on 16 UEV 16 A hatches
  var S6_UNITS = [{ name: 'fusion', x: 30490, z: 30 }]
  function s6Build(u) {
    var n = 0
    placeCheck(u, placeMachine('gtceu:gg_uev_s0_fusion', u.x, 80, u.z, function (c) {
      if (c.ch === 'E') { n++; return HATCH16 }
      return null
    }))
    u.hatchesPlaced = n
  }
  function s6Tick(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!waitForm(u, m)) return
      u.m = m
      u.energy = partsLike(m, /uev_energy_input_hatch_16a/)
      u.inHatches = partsLike(m, /input_hatch/).filter(function (p) { return !/energy/.test(String(p.getDefinition().getId())) })
      var cap = NaN
      try { cap = Number(m.energyContainer.getEnergyCapacity()) } catch (e) { }
      var tier = field(m, 'tier')
      check('s0_6_formed', u.energy.length > 0, 'class ' + m.getClass().getSimpleName() + ', tier ' + tier + ', UEV 16 A hatches ' + u.energy.length + '/' + u.hatchesPlaced + ', parts ' + partIds(m) + ', buffer ' + cap + ' EU')
      u.phase = 'start'
      return
    }
    if (u.phase === 'start') {
      var set = 0
      u.inHatches.forEach(function (h, i) {
        try { h.tank.setFluidInTank(0, (i === 0 ? Fluid.of('minecraft:water', 4000) : Fluid.of('minecraft:lava', 4000)).getFluidStack()); set++ } catch (e) { }
      })
      note('s0_6_fill', 'fluid input hatches filled ' + set + ' of ' + u.inHatches.length)
      topUp(u.energy)
      var buf = null
      try { buf = m.energyContainer; buf.setEnergyStored(buf.getEnergyCapacity()) } catch (e) { }
      u.stored = buf ? Number(buf.getEnergyStored()) : NaN
      m.getRecipeLogic().updateTickSubscription()
      u.phase = 'run'
      u.started = S.tick
      return
    }
    if (u.phase === 'run') {
      var rlg = m.getRecipeLogic()
      if (rlg.isWorking() || S.tick - u.started > 400) {
        var s = snapshot(m)
        var buffer = NaN
        try { buffer = Number(m.energyContainer.getEnergyCapacity()) } catch (e) { }
        check('s0_6_fusion_runs', rlg.isWorking() && s !== null, 'working ' + rlg.isWorking() + ', stored before ' + u.stored + ' of ' + buffer + ' (start ' + FUSION_START + '), recipe ' + (s ? s.id + ' ' + s.eut + ' EU/t ' + s.duration + ' t' : 'none') + ', reasons ' + String(rlg.getFailureReasons()))
        u.phase = 'done'
      }
    }
  }

  // ---------------------------------------------------------------- S0-7: the 12,600 K coil in GTM's EBF logic and in coilParallel
  var S7_UNITS = [
    { name: 'ebf', kind: 'ebf', x: 30475, z: 45 },
    { name: 'chain', kind: 'chain', x: 30505, z: 45 }
  ]
  function s7Build(u) {
    placeCheck(u, placeMachine(u.kind === 'ebf' ? 'gtceu:gg_uev_s0_ebf' : 'gtceu:gg_spike_lcr_chain', u.x, 74, u.z, function (c) {
      if (c.ch === 'K') return COIL
      if (c.sym.kind === 'part' && c.sym.ability === 'energy_input') return HATCH16
      return null
    }))
  }
  function s7Tick(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!waitForm(u, m)) return
      u.m = m
      u.energy = partsLike(m, /energy_input_hatch/)
      u.inBus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var temp = global.grindless.coils.temperature(m)
      check(u.name + '_coil_reads', Number(temp) === 12600, 'lib/coils.js temperature(m) = ' + temp + ', class ' + m.getClass().getSimpleName() + ', parts ' + partIds(m))
      u.phase = 'start'
      return
    }
    topUp(u.energy)
    if (u.phase === 'start') {
      var m2 = u.m
      empty(u.inBus)
      empty(u.outBus)
      if (u.kind === 'ebf') fill(u.inBus, CANE, 1)
      else fill(u.inBus, POPPY, 128)
      m2.getRecipeLogic().updateTickSubscription()
      u.phase = 'run'
      u.started = S.tick
      u.snap = null
      return
    }
    if (u.phase === 'run') {
      var rlg = u.m.getRecipeLogic()
      if (u.snap === null && rlg.isWorking()) u.snap = snapshot(u.m)
      var out = u.outBus ? items(u.outBus) : {}
      var got = u.kind === 'ebf' ? (out[PAPER] || 0) : (out[RED] || 0)
      if (got > 0 || S.tick - u.started > 600) {
        var s = u.snap
        if (u.kind === 'ebf') {
          check('s0_7_ebf_12000', got >= 1, 'a blastFurnaceTemp 12000 recipe on the 12,600 K coil: out ' + got + ' paper, recipe ' + (s ? s.id + ' ' + s.eut + ' EU/t ' + s.duration + ' t' : 'none') + ', reasons ' + String(rlg.getFailureReasons()))
        } else {
          check('s0_7_coil_parallel', s !== null && s.parallels === 64 && got === 64, 'expected 2^floor(12600/900) = 2^14 capped at 64: parallels ' + (s ? s.parallels : 'none') + ', out ' + got + ' dye, ' + (s ? s.duration + ' t / ' + s.eut + ' EU/t' : '') + ', reasons ' + String(rlg.getFailureReasons()))
        }
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
    var groups = [[S1_UNITS, s1Build, s1Tick], [S6_UNITS, s6Build, s6Tick], [S7_UNITS, s7Build, s7Tick]]
    groups.forEach(function (g) {
      g[0].forEach(function (u) {
        u.tick = g[2]
        try { g[1](u) } catch (e) { check(u.name + '_build_exception', false, errText(e)); u.phase = 'done'; return }
        S.units.push(u)
      })
    })
    var h = hullUnit()
    try { hullBuild(h); h.tick = hullTick; S.units.push(h) } catch (e) { check('hull_build_exception', false, errText(e)) }
  }
  ServerEvents.customCommand('gg_test_uev_s0_machines', function () {
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
