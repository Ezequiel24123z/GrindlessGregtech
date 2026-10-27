// TEST ONLY, MEGA-S spikes (docs/eras/mega.md 3.1). Commands: kubejs custom_command gg_test_mega_spike_m1 | _m2 | _m3
// Band ONLY: X 29952-30015, Z 0-63, Overworld Y 98-115 (the mega EBF is 17 high).
//   m1  S-M1: the chain coil parallel -> OC_PERFECT_SUBTICK -> BATCH_MODE on gtceu:large_chemical_reactor, three coil tiers
//   m2  S-M2: module sockets read from the pattern match context; a modifier vetoes the type whose module is absent
//   m3  S-M3: a UHV ParallelHatchPartMachine (tier 9) reports 1024 and forms in gtceu:mega_blast_furnace and in a machine of ours
// Machines and the hatch come from startup_scripts/gg_test_mega_spike_machines.js. No changed clock: energy hatches are topped up every tick.
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 29952
  var X1 = 30015
  var Y0 = 98
  var Y1 = 115
  var NAME = ''
  var HATCH = 'gtceu:uhv_gg_spike_parallel_hatch'
  var POPPY = 'minecraft:poppy'
  var RED = 'minecraft:red_dye'
  var PICKLE = 'minecraft:sea_pickle'
  var GREEN = 'minecraft:green_dye'
  var KELP = 'minecraft:kelp'
  var DRIED = 'minecraft:dried_kelp'
  var CANE = 'minecraft:sugar_cane'
  var PAPER = 'minecraft:paper'
  var A = 'gtceu:heatproof_machine_casing'
  var B = 'gtceu:stable_machine_casing'

  // the test-only recipes: items nothing else in GTM consumes, so the lookup is unambiguous
  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.large_chemical_reactor('gg_test_mega:m1_lcr').itemInputs('2x ' + POPPY).itemOutputs('1x ' + RED).duration(200).EUt(30)
      event.recipes.gtceu.macerator('gg_test_mega:m2_macerator').itemInputs('1x ' + PICKLE).itemOutputs('1x ' + GREEN).duration(40).EUt(8)
      event.recipes.gtceu.compressor('gg_test_mega:m2_compressor').itemInputs('2x ' + KELP).itemOutputs('1x ' + DRIED).duration(40).EUt(8)
      event.recipes.gtceu.electric_blast_furnace('gg_test_mega:m3_ebf').itemInputs('1x ' + CANE).itemOutputs('1x ' + PAPER).duration(100).EUt(30).blastFurnaceTemp(1000)
    } catch (e) {
      console.error('[gg_test mega_spike] could not add the test recipes: ' + errText(e))
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
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      Config: Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder')
    }
    return C
  }
  function rl(id) { return new (classes().RL)(id) }
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
  function setState(x, y, z, state) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    S.level.setBlock(pos(x, y, z), state, 3)
  }
  function machine(p) { return classes().Meta.getMachine(S.level, p) }
  function partsLike(ctrl, re) {
    var out = []
    array(ctrl.getParts()).forEach(function (p) { if (re.test(String(p.getDefinition().getId()))) out.push(p) })
    return out
  }
  function partIds(ctrl) {
    var out = {}
    array(ctrl.getParts()).forEach(function (p) { out[String(p.getDefinition().getId())] = true })
    return Object.keys(out)
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
  // total of one item over 64-stacks, spread over the bus slots
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
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }
  function field(o, name) {
    try {
      var v = o[name]
      if (v !== undefined && v !== null && typeof v !== 'function') return Number(v)
      var g = o['get' + name.charAt(0).toUpperCase() + name.substring(1)]
      if (typeof g === 'function') return Number(g.call(o))
    } catch (e) { }
    return NaN
  }
  // what the running recipe looks like after every modifier: copies, overclocks, EU/t, duration
  function snapshot(m) {
    var rec = m.getRecipeLogic().getLastRecipe()
    if (rec === null || rec === undefined) return null
    var eut = NaN
    try { var es = classes().RecipeHelper.getRealEUt(rec); eut = Number(es.getTotalEU()) } catch (e) { }
    return { parallels: field(rec, 'parallels'), oc: field(rec, 'ocLevel'), batch: field(rec, 'batchParallels'), duration: Number(rec.duration), eut: eut, id: String(rec.id) }
  }
  function fmt(s) {
    return s === null ? 'no recipe' : 'recipe ' + s.id + ' parallels ' + s.parallels + ' ocLevel ' + s.oc + ' batchParallels ' + s.batch + ' duration ' + s.duration + ' EU/t ' + s.eut
  }

  // ---------------------------------------------------------------- placement from the pattern description
  var DEFAULT_PART = { energy_input: 'gtceu:mv_energy_input_hatch', input_bus: 'gtceu:hv_input_bus', output_bus: 'gtceu:hv_output_bus' }
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
      c.x = cx - (c.ci - ctrl.ci)
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
      var props = (sym.kind === 'part' || sym.kind === 'oneOf') ? '[facing=north]' : ''
      put(c.x, c.y, c.z, block + props)
      count++
    })
    put(controller.x, controller.y, controller.z, id + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), blocks: count + 1 }
  }

  function shapeCells(id) {
    var def = classes().GTRegistries.MACHINES.get(rl(id))
    if (!def) throw new Error('no machine ' + id)
    var shapes = array(def.getMatchingShapes())
    if (shapes.length === 0) throw new Error('no preview shape for ' + id)
    var blocks = shapes[0].getBlocks()
    var out = []
    for (var x = 0; x < blocks.length; x++) for (var y = 0; y < blocks[x].length; y++) for (var z = 0; z < blocks[x][y].length; z++) {
      var info = blocks[x][y][z]
      if (info === null || info === undefined) continue
      var state = info.getBlockState()
      out.push({ x: x, y: y, z: z, state: state, id: String(Block.getId(state.getBlock())) })
    }
    return out
  }

  // ---------------------------------------------------------------- S-M1
  var M1_UNITS = [
    { name: 'cupronickel', coil: 'gtceu:cupronickel_coil_block', hatch: 'gtceu:hv_energy_input_hatch', par: 4, x: 29957 },
    { name: 'nichrome', coil: 'gtceu:nichrome_coil_block', hatch: 'gtceu:ev_energy_input_hatch', par: 16, x: 29965 },
    { name: 'tritanium', coil: 'gtceu:tritanium_coil_block', hatch: 'gtceu:iv_energy_input_hatch', par: 64, x: 29973 }
  ]
  function m1Build(u) {
    var placed = placeMachine('gtceu:gg_spike_lcr_chain', u.x, 101, 8, function (c) {
      if (c.ch === 'K') return u.coil
      if (c.ch === 'E') return u.hatch
      return null
    })
    u.pos = placed.pos
    u.phase = 'forming'
    u.started = S.tick
    u.batchAllowed = Number(classes().Config.INSTANCE.machines.batchDuration)
    note(u.name + '_placed', 'controller ' + placed.pos.getX() + ',' + placed.pos.getY() + ',' + placed.pos.getZ() + ', ' + placed.blocks + ' blocks, batchDuration config ' + u.batchAllowed)
  }
  function m1Tick(u) {
    var m = machine(u.pos)
    var waited = S.tick - u.started
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.energy = partsLike(m, /energy_input_hatch/)
      u.inBus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var temp = global.grindless.coils.temperature(m)
      check(u.name + '_formed', !!u.inBus && !!u.outBus && u.energy.length === 1, 'class ' + m.getClass().getSimpleName() + ', coil ' + temp + ' K, parts ' + partIds(m).join(' '))
      if (!u.inBus || !u.outBus || u.energy.length !== 1) { u.phase = 'done'; return }
      try {
        var mods = m.getDefinition().getRecipeModifier()
        note(u.name + '_modifier_list', 'definition modifier ' + mods.getClass().getSimpleName() + ': ' + String(mods))
      } catch (e) { note(u.name + '_modifier_list', 'unreadable: ' + errText(e)) }
      u.batch = false
      u.phase = 'start'
      return
    }
    topUp(u.energy)
    if (u.phase === 'start') {
      empty(u.inBus)
      empty(u.outBus)
      m.setBatchEnabled(u.batch)
      var left = fill(u.inBus, POPPY, 2 * u.par * (u.batch ? 4 : 1))
      u.initial = items(u.inBus)[POPPY] || 0
      note(u.name + '_fill_' + (u.batch ? 'batch' : 'plain'), 'batch enabled ' + m.isBatchEnabled() + ', poppies in the bus ' + u.initial + ', not placed ' + left)
      m.getRecipeLogic().updateTickSubscription()
      u.phase = 'run'
      u.started = S.tick
      u.snap = null
      return
    }
    if (u.phase === 'run') {
      var rlg = m.getRecipeLogic()
      if (u.snap === null && rlg.isWorking()) {
        u.snap = snapshot(m)
        u.consumed = u.initial - (items(u.inBus)[POPPY] || 0)
        u.runStart = S.tick
      }
      var got = items(u.outBus)[RED] || 0
      if (got > 0 || S.tick - u.started > 500) {
        var tag = u.name + (u.batch ? '_batch' : '_plain')
        var dur = S.tick - (u.runStart || u.started)
        note(tag + '_measured', fmt(u.snap) + '; consumed ' + u.consumed + ' poppy, out ' + got + ' dye after ' + dur + ' ticks; reasons ' + String(rlg.getFailureReasons()))
        var s = u.snap
        if (!u.batch) {
          var okPar = s !== null && s.parallels === u.par && got === u.par && u.consumed === 2 * u.par
          check(tag + '_parallels', okPar, 'expected ' + u.par + ' (2^floor(K/900) capped at 64), got ' + (s ? s.parallels : 'none') + ', out ' + got + ', consumed ' + u.consumed)
          var okOc = s !== null && s.duration === 50 && s.eut === 30 * u.par * 4
          check(tag + '_perfect_oc', okOc, 'one perfect overclock: expected duration 50 and EU/t ' + (30 * u.par * 4) + ', got ' + (s ? s.duration + ' / ' + s.eut : 'none'))
          u.plain = s
          u.batch = true
          u.phase = 'start'
        } else {
          var okBatch = s !== null && s.parallels === u.par && got > u.par && got % u.par === 0 && s.duration > 50
          check(tag + '_batched', okBatch, 'expected more than ' + u.par + ' dye in one run with a longer duration; got out ' + got + ', ' + fmt(s) +
            '; plain run was ' + (u.plain ? u.plain.duration + ' ticks / ' + u.plain.eut + ' EU/t' : 'none'))
          u.phase = 'done'
        }
      }
    }
  }

  // ---------------------------------------------------------------- S-M2
  var M2_UNITS = [
    { name: 'aa', mods: [A, A], x: 29957 },
    { name: 'ab', mods: [A, B], x: 29965 },
    { name: 'bb', mods: [B, B], x: 29973 }
  ]
  function m2Build(u) {
    var placed = placeMachine('gtceu:gg_spike_modules', u.x, 101, 20, function (c) {
      if (c.ch === 'M') return u.mods[c.ci === 0 ? 0 : 1]
      return null
    })
    u.pos = placed.pos
    u.phase = 'forming'
    u.started = S.tick
    note(u.name + '_placed', 'controller ' + placed.pos.getX() + ',' + placed.pos.getY() + ',' + placed.pos.getZ() + ', sockets ' + u.mods.join(' + '))
  }
  function m2Detected(m) {
    var map = m.getMultiblockState().getMatchContext().get('GGModules')
    var out = []
    if (map === null || map === undefined) return out
    var it = map.values().iterator()
    while (it.hasNext()) out.push(String(it.next()))
    return out.sort()
  }
  function m2Tick(u) {
    var m = machine(u.pos)
    var waited = S.tick - u.started
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.energy = partsLike(m, /energy_input_hatch/)
      u.inBus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var types = array(m.getDefinition().getRecipeTypes()).map(function (t) { return String(t.registryName) })
      check(u.name + '_formed', !!u.inBus && !!u.outBus && u.energy.length === 1 && types.length === 2,
        'class ' + m.getClass().getSimpleName() + ', recipe types ' + types.join(' ') + ', parts ' + partIds(m).join(' '))
      var seen = m2Detected(m)
      var want = u.mods.slice().sort()
      check(u.name + '_modules_detected', JSON.stringify(seen) === JSON.stringify(want), 'match context GGModules ' + seen.join(' + ') + '; built ' + want.join(' + '))
      u.phase = 'mac'
      u.started = S.tick
      u.stage = 0
      return
    }
    topUp(u.energy)
    if (u.phase === 'mac' || u.phase === 'comp') {
      var mac = u.phase === 'mac'
      var stageTick = S.tick - u.started
      if (u.stage === 0) {
        empty(u.inBus)
        empty(u.outBus)
        m.setActiveRecipeType(mac ? 0 : 1)
        fill(u.inBus, mac ? PICKLE : KELP, 8)
        m.getRecipeLogic().updateTickSubscription()
        u.stage = 1
        u.started = S.tick
        return
      }
      var made = items(u.outBus)[mac ? GREEN : DRIED] || 0
      var left = items(u.inBus)[mac ? PICKLE : KELP] || 0
      var expectRun = u.mods.indexOf(mac ? A : B) >= 0
      var rlg = m.getRecipeLogic()
      if (expectRun ? made > 0 : stageTick >= 160) {
        var tag = u.name + (mac ? '_macerator' : '_compressor')
        var type = String(m.getRecipeType().registryName)
        if (expectRun) check(tag + '_runs', made > 0, 'module present: ' + type + ' made ' + made + ' of ' + (mac ? GREEN : DRIED))
        else check(tag + '_vetoed', made === 0 && left === 8 && !rlg.isWorking(), 'module absent: ' + type + ' made ' + made + ', input left ' + left + '/8, working ' +
          rlg.isWorking() + ', status ' + String(rlg.getStatus()) + ', reasons ' + String(rlg.getFailureReasons()))
        if (mac) { u.phase = 'comp'; u.stage = 0; u.started = S.tick } else u.phase = 'done'
      } else if (expectRun && stageTick > 400) {
        check(u.name + (mac ? '_macerator' : '_compressor') + '_runs', false, 'no output after ' + stageTick + ' ticks; reasons ' + String(rlg.getFailureReasons()))
        if (mac) { u.phase = 'comp'; u.stage = 0; u.started = S.tick } else u.phase = 'done'
      }
    }
  }

  // ---------------------------------------------------------------- S-M3
  function m3Build() {
    var out = []
    try {
      put(29953, 100, 56, HATCH)
      out.push({ kind: 'alone', pos: pos(29953, 100, 56), phase: 'alone', started: S.tick })
    } catch (e) { check('hatch_place_exception', false, errText(e)) }
    try {
      var placed = placeMachine('gtceu:gg_spike_ebf', 29958, 101, 8, function (c) {
        if (c.ch === 'K') return 'gtceu:cupronickel_coil_block'
        if (c.ch === 'H') return HATCH
        if (c.ch === 'E') return 'gtceu:ev_energy_input_hatch'
        return null
      })
      out.push({ kind: 'ours', name: 'ours', pos: placed.pos, phase: 'forming', started: S.tick })
    } catch (e) { check('ours_place_exception', false, errText(e)) }
    try {
      var cells = shapeCells('gtceu:mega_blast_furnace')
      var ox = 29970
      var oz = 20
      var ctrl = null
      var swapped = []
      cells.forEach(function (c) {
        if (c.id === 'minecraft:air') return
        var x = ox + c.x
        var y = Y0 + c.y
        var z = oz + c.z
        if (/lv_output_hatch/.test(c.id)) { put(x, y, z, HATCH); swapped.push(c.id + '>spike UHV parallel hatch') }
        else if (/lv_energy_input_hatch/.test(c.id)) { put(x, y, z, 'gtceu:ev_energy_input_hatch'); swapped.push(c.id + '>ev energy hatch') }
        else if (/lv_input_bus/.test(c.id)) { put(x, y, z, 'gtceu:hv_input_bus'); swapped.push(c.id + '>hv bus') }
        else if (/lv_output_bus/.test(c.id)) { put(x, y, z, 'gtceu:hv_output_bus'); swapped.push(c.id + '>hv bus') }
        else setState(x, y, z, c.state)
        if (c.id === 'gtceu:mega_blast_furnace') ctrl = pos(x, y, z)
      })
      if (ctrl === null) throw new Error('no controller in the preview')
      note('mega_placed', 'controller ' + ctrl.getX() + ',' + ctrl.getY() + ',' + ctrl.getZ() + '; swapped ' + swapped.join(' '))
      out.push({ kind: 'mega', name: 'mega', pos: ctrl, phase: 'forming', started: S.tick })
    } catch (e) { check('mega_place_exception', false, errText(e)) }
    return out
  }
  function m3Tick(u) {
    var m = machine(u.pos)
    var waited = S.tick - u.started
    if (u.phase === 'alone') {
      var cls = m ? String(m.getClass().getSimpleName()) : 'none'
      var par = -1
      try { par = Number(m.getCurrentParallel()) } catch (e) { }
      check('hatch_reports', cls === 'ParallelHatchPartMachine' && par === 1024, 'class ' + cls + ', current parallel ' + par + ', definition ' + (m ? String(m.getDefinition().getId()) : 'none'))
      u.phase = 'done'
      return
    }
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      var hatch = m.getParallelHatch()
      var has = hatch.isPresent()
      u.hatch = has ? hatch.get() : null
      u.energy = partsLike(m, /energy_input_hatch/)
      u.inBus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      check(u.name + '_formed', has && !!u.inBus && !!u.outBus && u.energy.length >= 1,
        'class ' + m.getClass().getSimpleName() + ', parallel hatch ' + (has ? String(u.hatch.getDefinition().getId()) + ' reports ' + u.hatch.getCurrentParallel() : 'none') + ', parts ' + partIds(m).join(' '))
      if (!has || !u.inBus || !u.outBus || u.energy.length === 0) { u.phase = 'done'; return }
      u.hatch.setCurrentParallel(64)
      fill(u.inBus, CANE, 64)
      topUp(u.energy)
      m.getRecipeLogic().updateTickSubscription()
      u.phase = 'run'
      u.started = S.tick
      u.snap = null
      return
    }
    topUp(u.energy)
    if (u.phase === 'run') {
      var rlg = m.getRecipeLogic()
      if (u.snap === null && rlg.isWorking()) u.snap = snapshot(m)
      var got = items(u.outBus)[PAPER] || 0
      if (got > 0 || S.tick - u.started > 600) {
        var s = u.snap
        check(u.name + '_runs_with_hatch', got === 64 && s !== null && s.parallels === 64, 'hatch set to 64 of 1024: out ' + got + ' paper, ' + fmt(s) + '; reasons ' + String(rlg.getFailureReasons()))
        u.phase = 'done'
      }
    }
  }

  // ---------------------------------------------------------------- driver
  var TESTS = {
    m1: { units: function () { M1_UNITS.forEach(m1Build); return M1_UNITS }, tick: m1Tick, limit: 2600 },
    m2: { units: function () { M2_UNITS.forEach(m2Build); return M2_UNITS }, tick: m2Tick, limit: 2600 },
    m3: { units: m3Build, tick: m3Tick, limit: 2600 }
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
  function begin(server, key) {
    NAME = 'mega_spike_' + key
    S = { server: server, tick: 0, failed: 0, finished: false, key: key, test: TESTS[key] }
    S.level = server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { S.units = S.test.units() } catch (e) { check('build_exception', false, errText(e)); S.units = [] }
  }
  Object.keys(TESTS).forEach(function (key) {
    ServerEvents.customCommand('gg_test_mega_spike_' + key, function () {
      if (S !== null && !S.finished) return 0
      global.ggTestMegaSpikeRequest = key
      return 1
    })
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMegaSpikeRequest && Date.now() - LOADED >= 10000) {
        var key = global.ggTestMegaSpikeRequest
        global.ggTestMegaSpikeRequest = ''
        begin(event.server, key)
      }
      if (S === null || S.finished) return
      S.tick++
      var pending = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try { S.test.tick(u) } catch (e) { check((u.name || u.kind) + '_exception', false, 'phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
        if (u.phase !== 'done') pending++
      })
      if (pending === 0) finish()
      else if (S.tick > S.test.limit) { check('deadline', false, S.test.limit + '-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
