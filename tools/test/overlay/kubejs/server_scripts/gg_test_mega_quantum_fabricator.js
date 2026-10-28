// TEST ONLY, MEGA-9 (gtceu:quantum_fabricator). Command: kubejs custom_command gg_test_mega_quantum_fabricator
// Band ONLY: X 34560-34623, Z 0-63, Overworld Y 98-115.
//   Two real GTM cleanrooms (15 x 15 x 12: plascrete shell, filter casing ceiling, EV energy hatch, maintenance hatch, controller in the
//   ceiling) at X 34585-34599, Z 10-24 (unit A, UHV parallel hatch) and Z 40-54 (unit B, UV parallel hatch), floor Y 100, ceiling Y 111.
//   A Quantum Fabricator (11 x 10 x 12) stands inside each on the floor, its front one block off the cleanroom wall. The only shortcut:
//   once a cleanroom has formed, adjustCleanAmount(100) skips the wait for GTM's own cleaning cycle.
//   Checks: the machine registers the five modes; the lookup finds all five types; each cleanroom forms and the fabricator is its
//   receiver; each fabricator forms with its hatch (UHV reports 1024, UV 256); a probe recipe (2 EU/t, one non-consumed poppy, no
//   output) goes through fullModifyRecipe: UHV hatch ceiling 1,048,576, UV hatch ceiling 262,144, each cut by the energy of one UHV
//   energy hatch (floor(2,097,152 / 2) = 1,048,576); unit A also runs a cheap assembler recipe (2,048 EU/t: the energy cap 1,024 binds,
//   stock 2,048) and a cleanroom-conditioned circuit assembler recipe (1 poppy + GTM's molten tin -> 1 red dye, 1,024 EU/t, 200 ticks,
//   64 in stock: 64 copies, then GTM's perfect overclock on the voltage left over).
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 34560
  var X1 = 34623
  var Y0 = 98
  var Y1 = 115
  var NAME = 'mega_quantum_fabricator'
  var ID = 'gtceu:quantum_fabricator'
  var TYPES = ['gtceu:assembler', 'gtceu:circuit_assembler', 'gtceu:forming_press', 'gtceu:laser_engraver', 'gtceu:cutter']
  var POPPY = 'minecraft:poppy'
  var RED = 'minecraft:red_dye'
  var DANDELION = 'minecraft:lily_of_the_valley'
  var YELLOW = 'minecraft:white_dye'
  var PROBE_EUT = 2
  var ASM_EUT = 2048
  var CIRCUIT_EUT = 1024
  var CIRCUIT_DURATION = 200
  var CIRCUIT_STOCK = 64
  var CX = 34592
  var FLOOR = 100
  var CEIL = 111

  ServerEvents.recipes(function (event) {
    try {
      var CT = Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.CleanroomType')
      event.recipes.gtceu.assembler('gg_test_mega:qf_asm').itemInputs('1x ' + DANDELION).itemOutputs('1x ' + YELLOW).duration(200).EUt(ASM_EUT)
      event.recipes.gtceu.assembler('gg_test_mega:qf_probe').notConsumable('1x ' + POPPY).duration(200).EUt(PROBE_EUT)
      event.recipes.gtceu.circuit_assembler('gg_test_mega:qf_circuit').itemInputs('1x ' + POPPY).itemOutputs('1x ' + RED).duration(CIRCUIT_DURATION).EUt(CIRCUIT_EUT).cleanroom(CT.CLEANROOM)
    } catch (e) {
      console.error('[gg_test mega_quantum_fabricator] could not add the test recipes: ' + errText(e))
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
  function box(x1, y1, z1, x2, y2, z2, block) {
    if (!inBand(x1, y1, z1) || !inBand(x2, y2, z2)) throw new Error('refused: box outside the band')
    return command('fill ' + x1 + ' ' + y1 + ' ' + z1 + ' ' + x2 + ' ' + y2 + ' ' + z2 + ' ' + block + ' replace')
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
  function sumItems(list, id) {
    var n = 0
    list.forEach(function (p) { n += items(p)[id] || 0 })
    return n
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
  function diagFind(m) {
    try {
      var ids = []
      var it = m.getRecipeType().searchRecipe(m, function (r) { return true })
      while (it.hasNext() && ids.length < 6) { var r = it.next(); ids.push(r ? String(r.id) : 'null') }
      return '[' + ids.join(',') + ']'
    } catch (e) { return 'err ' + errText(e) }
  }
  function snapshot(m) {
    var rec = m.getRecipeLogic().getLastRecipe()
    if (rec === null || rec === undefined) return null
    var eut = NaN
    try { var es = classes().RecipeHelper.getRealEUt(rec); eut = Number(es.getTotalEU()) } catch (e) { }
    return { parallels: field(rec, 'parallels'), oc: field(rec, 'ocLevel'), duration: Number(rec.duration), eut: eut, id: String(rec.id) }
  }
  function fmt(s) {
    return s === null ? 'no recipe' : 'recipe ' + s.id + ' parallels ' + s.parallels + ' ocLevel ' + s.oc + ' duration ' + s.duration + ' EU/t ' + s.eut
  }

  // front slice (the last one) floor row, by column: 1 and 6 output buses, 2 maintenance, 3 UHV energy hatch, 4 and 5 input buses,
  // 7 parallel hatch, 8 input hatch
  function partsFor(hatch) {
    return {
      1: 'gtceu:uv_output_bus',
      2: 'gtceu:maintenance_hatch',
      3: 'gtceu:uhv_energy_input_hatch',
      4: 'gtceu:uv_input_bus',
      5: 'gtceu:uv_input_bus',
      6: 'gtceu:uv_output_bus',
      7: hatch,
      8: 'gtceu:uv_input_hatch'
    }
  }
  function placeFabricator(cx, cy, cz, parts) {
    var desc = global.grindless.patterns.describe(ID)
    if (!desc) throw new Error('no structure description for ' + ID)
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
    var last = desc.slices.length - 1
    var controller = null
    var count = 0
    cells.forEach(function (c) {
      c.x = cx - (c.ci - ctrl.ci)
      c.y = cy + (c.ri - ctrl.ri)
      c.z = cz - (c.si - ctrl.si)
    })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var part = false
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      if (sym.kind === 'blocks') block = sym.blocks[0]
      else if (sym.kind === 'oneOf') {
        if (c.si === last && c.ri === 0 && parts[c.ci]) { block = parts[c.ci]; part = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
      count++
    })
    put(controller.x, controller.y, controller.z, ID + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), blocks: count + 1 }
  }

  function placeCleanroom(cz) {
    var x1 = CX - 7
    var x2 = CX + 7
    var z1 = cz - 7
    var z2 = cz + 7
    box(x1, FLOOR, z1, x2, CEIL, z2, 'gtceu:plascrete')
    box(x1 + 1, FLOOR + 1, z1 + 1, x2 - 1, CEIL - 1, z2 - 1, 'minecraft:air')
    box(x1 + 1, CEIL, z1 + 1, x2 - 1, CEIL, z2 - 1, 'gtceu:filter_casing')
    put(x1, FLOOR + 2, cz, 'gtceu:ev_energy_input_hatch[facing=north]')
    put(x2, FLOOR + 2, cz, 'gtceu:maintenance_hatch[facing=north]')
    put(CX, CEIL, cz, 'gtceu:cleanroom')
  }

  function registrationChecks() {
    var def = classes().GTRegistries.MACHINES.get(new (classes().RL)(ID))
    var types = []
    if (def) array(def.getRecipeTypes()).forEach(function (t) { types.push(String(t.registryName)) })
    check('modes', !!def && types.join(',') === TYPES.join(','), 'machine ' + ID + ' registered=' + !!def + ' modes [' + types.join(',') + ']')
    var rm = S.server.getRecipeManager()
    var counts = {}
    TYPES.forEach(function (t) { counts[t] = 0 })
    var sterile = 0
    var plain = 0
    array(rm.getRecipes()).forEach(function (r) {
      var t = String(r.getType())
      if (counts[t] !== undefined) counts[t]++
      if (t === 'gtceu:circuit_assembler') {
        var c = ''
        try { c = String(r.conditions).toLowerCase() } catch (e) { }
        if (c.indexOf('sterile') >= 0) sterile++
        else if (c.indexOf('cleanroom') >= 0) plain++
      }
    })
    var missing = TYPES.filter(function (t) { return !(counts[t] > 0) })
    check('lookup', missing.length === 0, 'recipes per type ' + JSON.stringify(counts) + (missing.length ? '; missing ' + missing.join(',') : ''))
    note('circuit_cleanrooms', 'circuit assembler recipes needing a plain cleanroom ' + plain + ', a sterile one ' + sterile)
    var asm = rm.byKey(new (classes().RL)('gg_test_mega:assembler/qf_asm'))
    var probe = rm.byKey(new (classes().RL)('gg_test_mega:assembler/qf_probe'))
    var circ = rm.byKey(new (classes().RL)('gg_test_mega:circuit_assembler/qf_circuit'))
    check('test_recipes', asm.isPresent() && probe.isPresent() && circ.isPresent(), 'assembler ' + asm.isPresent() + ', probe ' + probe.isPresent() + ', circuit assembler ' + circ.isPresent())
    var cond = ''
    try { cond = String(circ.get().conditions) } catch (e) { }
    check('cleanroom_condition', cond.toLowerCase().indexOf('cleanroom') >= 0, 'test recipe conditions ' + cond)
    var qf = global.grindless.megaQuantumFabricator
    var made = []
    array(rm.getRecipes()).forEach(function (r) {
      var rid = String(r.getId())
      if (rid.indexOf('quantum_fabricator') >= 0 || rid.indexOf('field_ring_casing') >= 0) made.push(rid)
    })
    check('crafting', !!qf && made.length === 2, 'recipe ids: ' + made.join(', '))
  }

  function build() {
    var units = []
    var defs = [
      { name: 'uhv', cz: 17, hatch: 'gtceu:uhv_parallel_hatch', hatchPar: 1024, ceiling: 1048576, full: true },
      { name: 'uv', cz: 47, hatch: 'gtceu:uv_parallel_hatch', hatchPar: 256, ceiling: 262144, full: false }
    ]
    defs.forEach(function (d) {
      var u = { name: d.name, def: d, phase: 'cleanroom', started: S.tick }
      placeCleanroom(d.cz)
      u.crPos = pos(CX, CEIL, d.cz)
      var placed = placeFabricator(CX, FLOOR + 2, d.cz - 5, partsFor(d.hatch))
      u.fabPos = placed.pos
      u.blocks = placed.blocks
      units.push(u)
    })
    return units
  }

  function probeFigure(u, m) {
    var rm = S.server.getRecipeManager()
    var probe = rm.byKey(new (classes().RL)('gg_test_mega:assembler/qf_probe'))
    if (!probe.isPresent()) { check(u.name + '_parallels', false, 'probe recipe is not loaded'); return }
    m.setActiveRecipeType(0)
    topUp(u.energy)
    u.inBus[0].getInventory().storage.setStackInSlot(0, Item.of(POPPY, 1))
    var volt = Number(m.getMaxVoltage())
    var cap = Math.floor(volt / PROBE_EUT)
    var want = Math.min(u.def.ceiling, cap)
    var full = m.fullModifyRecipe(probe.get())
    var got = full === null || full === undefined ? 0 : field(full, 'parallels')
    note(u.name + '_measured', 'max voltage ' + volt + ', energy cap ' + cap + ', ceiling 1024 x ' + u.def.hatchPar + ' = ' + u.def.ceiling + ', modified recipe ' + (full ? 'parallels ' + got + ' duration ' + field(full, 'duration') : 'NULL'))
    check(u.name + '_parallels', got === want && want === u.def.ceiling,
      'probe ' + PROBE_EUT + ' EU/t, hatch ' + u.def.hatchPar + ' at ' + volt + ' V: expected ' + u.def.ceiling + ' copies, formula ' + want + ', machine ' + got)
    u.inBus[0].getInventory().storage.setStackInSlot(0, Item.of('minecraft:air'))
  }

  function tick(u) {
    var waited = S.tick - u.started
    if (u.phase === 'cleanroom') {
      var cr = machine(u.crPos)
      if (!cr || !formCheck(cr, waited)) {
        if (waited > 600) {
          var bid = ''
          try { bid = String(S.level.getBlockState(u.crPos)) } catch (e) { bid = errText(e) }
          check(u.name + '_cleanroom_formed', false, cr ? 'not formed: ' + why(cr) : 'no controller; block there ' + bid)
          u.phase = 'done'
        }
        return
      }
      u.crEnergy = partsLike(cr, /energy_input_hatch/)
      topUp(u.crEnergy)
      cr.adjustCleanAmount(100)
      u.cr = cr
      check(u.name + '_cleanroom_formed', true, 'class ' + cr.getClass().getSimpleName() + ', clean ' + cr.isClean() + ', parts ' + partIds(cr).join(' '))
      u.phase = 'forming'
      u.started = S.tick
      return
    }
    var m = machine(u.fabPos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.energy = partsLike(m, /energy_input_hatch/)
      u.inBus = partsLike(m, /input_bus/)
      u.outBus = partsLike(m, /output_bus/)
      var ph = m.getParallelHatch()
      var hatch = ph.isPresent() ? ph.get() : null
      var maint = partsLike(m, /maintenance/).length
      var hatchPar = hatch ? Number(hatch.getCurrentParallel()) : 0
      check(u.name + '_formed', u.inBus.length === 2 && u.outBus.length === 2 && u.energy.length === 1 && maint === 1 && !!hatch,
        'class ' + m.getClass().getSimpleName() + ', ' + u.blocks + ' blocks, parts ' + partIds(m).join(' '))
      if (!u.inBus.length || !u.outBus.length || u.energy.length !== 1 || !hatch) { u.phase = 'done'; return }
      var room = null
      try { room = m.getCleanroom() } catch (e) { }
      check(u.name + '_in_cleanroom', room !== null && room !== undefined && room.isClean(), 'receiver cleanroom ' + (room ? room.getClass().getSimpleName() + ' clean ' + room.isClean() : 'none'))
      check(u.name + '_hatch_reports', hatchPar === u.def.hatchPar, 'parallel hatch reports ' + hatchPar + ', expected ' + u.def.hatchPar)
      u.m = m
      try { probeFigure(u, m) } catch (e) { check(u.name + '_probe_exception', false, errText(e)) }
      if (!u.def.full) { u.phase = 'done'; return }
      m.setBatchEnabled(false)
      u.outBus.forEach(empty)
      u.inBus.forEach(empty)
      u.phase = 'run_asm'
      u.started = S.tick
      u.snap = null
      u.started2 = false
      return
    }
    topUp(u.energy)
    topUp(u.crEnergy)
    var rlg = m.getRecipeLogic()
    if (u.phase === 'run_asm') {
      if (!u.started2) {
        u.started2 = true
        m.setActiveRecipeType(0)
        fill(u.inBus[0], DANDELION, 2048)
        u.initial = sumItems(u.inBus, DANDELION)
        topUp(u.energy)
        rlg.updateTickSubscription()
        u.started = S.tick
      }
      if (u.snap === null) {
        var sn = snapshot(m)
        if (sn !== null) {
          u.snap = sn
          u.consumed = u.initial - sumItems(u.inBus, DANDELION)
          u.snapTick = S.tick - u.started
        }
      }
      var yel = sumItems(u.outBus, YELLOW)
      if (yel > 0 && S.tick - u.started < 3) note('asm_early', 'output ' + yel + ' at tick ' + (S.tick - u.started) + '; snap ' + fmt(u.snap))
      if (yel > 0 || S.tick - u.started > 600) {
        var volt = Number(m.getMaxVoltage())
        var want = Math.min(u.def.ceiling, Math.floor(volt / ASM_EUT), u.initial)
        var s = u.snap
        note('asm_measured', fmt(s) + '; consumed ' + u.consumed + ', out ' + yel + '; max voltage ' + volt + '; status ' + String(rlg.getStatus()) + '; reasons ' + String(rlg.getFailureReasons()) + '; found ' + diagFind(m))
        var ok = s !== null && s.parallels === want && yel === want && u.consumed === want
        check('asm_parallels', ok, 'min(ceiling ' + u.def.ceiling + ', energy cap ' + Math.floor(volt / ASM_EUT) + ', inputs ' + u.initial + ') = ' + want + ' copies; got ' + fmt(s) + ', out ' + yel + ', consumed ' + u.consumed)
        u.outBus.forEach(empty)
        u.inBus.forEach(empty)
        u.phase = 'run_circuit'
        u.started2 = false
      }
      return
    }
    if (u.phase === 'run_circuit') {
      if (!u.started2) {
        u.started2 = true
        m.setActiveRecipeType(1)
        fill(u.inBus[0], POPPY, CIRCUIT_STOCK)
        u.initial = sumItems(u.inBus, POPPY)
        // GTM's circuit_assembler onRecipeBuild adds 144 mB molten tin to every fluid-less recipe (and a _soldering_alloy copy)
        u.inHatch = partsLike(m, /input_hatch$/).filter(function (p) { return !/energy/.test(String(p.getDefinition().getId())) })[0]
        if (u.inHatch) u.inHatch.tank.setFluidInTank(0, Fluid.of('gtceu:tin', 32000).getFluidStack())
        topUp(u.energy)
        rlg.updateTickSubscription()
        u.started = S.tick
        u.snap = null
      }
      if (u.snap === null && rlg.isWorking()) {
        var sc = snapshot(m)
        if (sc !== null && sc.id.indexOf('qf_circuit') >= 0) {
          u.snap = sc
          u.consumed = u.initial - sumItems(u.inBus, POPPY)
        }
      }
      var got = sumItems(u.outBus, RED)
      if (got > 0 || S.tick - u.started > 800) {
        var s2 = u.snap
        var v2 = Number(m.getMaxVoltage())
        note('circuit_measured', fmt(s2) + '; consumed ' + u.consumed + ', out ' + got + '; max voltage ' + v2 + '; clean ' + (m.getCleanroom() ? m.getCleanroom().isClean() : 'none') + '; status ' + String(rlg.getStatus()) + '; reasons ' + String(rlg.getFailureReasons()) + '; found ' + diagFind(m))
        var base = CIRCUIT_STOCK * CIRCUIT_EUT * CIRCUIT_DURATION
        var neutral = s2 !== null && Math.abs(s2.eut * s2.duration - base) / base < 0.1
        var ok2 = s2 !== null && s2.parallels === CIRCUIT_STOCK && got === CIRCUIT_STOCK && u.consumed === CIRCUIT_STOCK &&
          s2.duration < CIRCUIT_DURATION && s2.duration >= 1 && s2.eut <= v2 && s2.eut > CIRCUIT_STOCK * CIRCUIT_EUT && neutral
        check('circuit_perfect_oc', ok2, 'expected ' + CIRCUIT_STOCK + ' copies (inputs), perfect overclock: duration below ' + CIRCUIT_DURATION + ', EU/t above ' + (CIRCUIT_STOCK * CIRCUIT_EUT) + ' up to ' + v2 + ', EU x ticks within 10% of ' + base + '; got ' + fmt(s2) + ', out ' + got + ', consumed ' + u.consumed)
        u.phase = 'done'
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
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false }
    S.level = server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    try { S.units = build() } catch (e) { check('build_exception', false, errText(e)); S.units = [] }
  }
  ServerEvents.customCommand('gg_test_mega_quantum_fabricator', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMegaQuantumFabricatorRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMegaQuantumFabricatorRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMegaQuantumFabricatorRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var pending = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try { tick(u) } catch (e) { check(u.name + '_exception', false, 'phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
        if (u.phase !== 'done') pending++
      })
      if (pending === 0) finish()
      else if (S.tick > 3000) { check('deadline', false, '3000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
