// TEST ONLY, MEGA-7 (gtceu:assembly_hall). Command: kubejs custom_command gg_test_mega_assembly_hall
// Band ONLY: X 31488-31551, Z 0-63, Overworld Y 98-115.
//   Option (b) of the contract: a real GTM cleanroom (15 x 15 x 11: plascrete shell, filter casing ceiling, EV energy hatch, maintenance
//   hatch, controller in the ceiling) is built at X 31513-31527, Z 25-39, Y 100-110, and the Assembly Hall (11 x 9 x 12) stands inside it
//   on the floor, its front one block off the cleanroom wall. Nothing else here is synthetic except one shortcut: once the cleanroom has
//   formed, adjustCleanAmount(100) skips the wait for GTM's own cleaning cycle (the cleanroom is formed and powered all the same).
//   Checks: the machine registers [assembler, circuit_assembler]; the lookup finds both types and the controller recipe; the cleanroom
//   forms and the hall is its receiver; the hall forms; in the circuit assembler mode a cleanroom-conditioned recipe (1 poppy -> 1 red dye,
//   1,024 EU/t, 200 ticks, batch off) runs with one LuV parallel hatch (ceiling 64 x 16 = 1,024) and one ZPM hatch (524,288 V):
//   the energy cap floor(524288/1024) = 512 binds, so 512 copies, 524,288 EU/t, 200 ticks.
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 31488
  var X1 = 31551
  var Y0 = 98
  var Y1 = 115
  var NAME = 'mega_assembly_hall'
  var ID = 'gtceu:assembly_hall'
  var POPPY = 'minecraft:poppy'
  var RED = 'minecraft:red_dye'
  var DANDELION = 'minecraft:dandelion'
  var YELLOW = 'minecraft:yellow_dye'
  var CX = 31520
  var CZ = 32
  var FLOOR = 100
  var CEIL = 110

  ServerEvents.recipes(function (event) {
    try {
      var CT = Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.CleanroomType')
      event.recipes.gtceu.assembler('gg_test_mega:ah_asm').itemInputs('1x ' + DANDELION).itemOutputs('1x ' + YELLOW).duration(200).EUt(8)
      event.recipes.gtceu.circuit_assembler('gg_test_mega:ah_circuit').itemInputs('1x ' + POPPY).itemOutputs('1x ' + RED).duration(200).EUt(1024).cleanroom(CT.CLEANROOM)
    } catch (e) {
      console.error('[gg_test mega_assembly_hall] could not add the test recipes: ' + errText(e))
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

  // front slice (the last one) floor row, by column: 2 maintenance, 3 ZPM energy, 4 input bus, 6 output bus, 7 LuV parallel hatch, 8 input hatch
  var HALL_PARTS = {
    2: 'gtceu:maintenance_hatch',
    3: 'gtceu:zpm_energy_input_hatch',
    4: 'gtceu:hv_input_bus',
    6: 'gtceu:hv_output_bus',
    7: 'gtceu:luv_parallel_hatch',
    8: 'gtceu:hv_input_hatch'
  }
  function placeHall(cx, cy, cz) {
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
        if (c.si === last && c.ri === 0 && HALL_PARTS[c.ci]) { block = HALL_PARTS[c.ci]; part = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
      count++
    })
    put(controller.x, controller.y, controller.z, ID + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), blocks: count + 1 }
  }

  function placeCleanroom() {
    var x1 = CX - 7
    var x2 = CX + 7
    var z1 = CZ - 7
    var z2 = CZ + 7
    box(x1, FLOOR, z1, x2, CEIL, z2, 'gtceu:plascrete')
    box(x1 + 1, FLOOR + 1, z1 + 1, x2 - 1, CEIL - 1, z2 - 1, 'minecraft:air')
    box(x1 + 1, CEIL, z1 + 1, x2 - 1, CEIL, z2 - 1, 'gtceu:filter_casing')
    put(x1, FLOOR + 2, CZ, 'gtceu:ev_energy_input_hatch[facing=north]')
    put(x2, FLOOR + 2, CZ, 'gtceu:maintenance_hatch[facing=north]')
  }
  function placeCleanroomController() { put(CX, CEIL, CZ, 'gtceu:cleanroom[facing=north]') }

  function registrationChecks() {
    var def = classes().GTRegistries.MACHINES.get(new (classes().RL)(ID))
    var types = []
    if (def) array(def.getRecipeTypes()).forEach(function (t) { types.push(String(t.registryName)) })
    check('modes', !!def && types.join(',') === 'gtceu:assembler,gtceu:circuit_assembler', 'machine ' + ID + ' registered=' + !!def + ' modes [' + types.join(',') + ']')
    var rm = S.server.getRecipeManager()
    var asm = rm.byKey(new (classes().RL)('gg_test_mega:assembler/ah_asm'))
    var circ = rm.byKey(new (classes().RL)('gg_test_mega:circuit_assembler/ah_circuit'))
    check('lookup', asm.isPresent() && circ.isPresent() &&
      String(asm.get().getType()).indexOf('assembler') >= 0 && String(circ.get().getType()).indexOf('circuit_assembler') >= 0,
      'assembler recipe ' + asm.isPresent() + ' (' + (asm.isPresent() ? asm.get().getType() : '-') + '), circuit assembler recipe ' + circ.isPresent() +
      ' (' + (circ.isPresent() ? circ.get().getType() : '-') + ')')
    var cond = ''
    try { cond = String(circ.get().conditions) } catch (e) { }
    check('cleanroom_condition', cond.toLowerCase().indexOf('cleanroom') >= 0, 'test recipe conditions ' + cond)
    var ah = global.grindless.megaAssemblyHall
    var made = []
    array(rm.getRecipes()).forEach(function (r) {
      var rid = String(r.getId())
      if (rid.indexOf('assembly_hall') >= 0 && rid.indexOf('gg_test') < 0) made.push(rid)
    })
    check('crafting', !!ah && made.length > 0, 'controller recipe ids: ' + made.join(', ') + '; published ' + (ah ? ah.crafting : 'nothing'))
  }

  function build() {
    var u = { name: 'hall', phase: 'forming', started: S.tick }
    placeCleanroom()
    u.hallPos = placeHall(CX, 102, CZ - 5).pos
    placeCleanroomController()
    u.crPos = pos(CX, CEIL, CZ)
    u.phase = 'cleanroom'
    return [u]
  }

  function tick(u) {
    var waited = S.tick - u.started
    if (u.phase === 'cleanroom') {
      var cr = machine(u.crPos)
      if (!cr || !formCheck(cr, waited)) {
        if (waited > 600) { check('cleanroom_formed', false, cr ? 'not formed: ' + why(cr) : 'no controller'); u.phase = 'done' }
        return
      }
      u.crEnergy = partsLike(cr, /energy_input_hatch/)
      topUp(u.crEnergy)
      cr.adjustCleanAmount(100)
      u.cr = cr
      check('cleanroom_formed', true, 'class ' + cr.getClass().getSimpleName() + ', clean ' + cr.isClean() + ', parts ' + partIds(cr).join(' '))
      u.phase = 'forming'
      u.started = S.tick
      return
    }
    var m = machine(u.hallPos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check('hall_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.energy = partsLike(m, /energy_input_hatch/)
      u.inBus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var ph = m.getParallelHatch()
      var hatch = ph.isPresent() ? ph.get() : null
      var maint = partsLike(m, /maintenance/).length
      check('hall_formed', !!u.inBus && !!u.outBus && u.energy.length === 1 && maint === 1 && !!hatch,
        'class ' + m.getClass().getSimpleName() + ', parts ' + partIds(m).join(' '))
      if (!u.inBus || !u.outBus || u.energy.length !== 1 || !hatch) { u.phase = 'done'; return }
      var room = null
      try { room = m.getCleanroom() } catch (e) { }
      check('hall_in_cleanroom', room !== null && room !== undefined && room.isClean(), 'receiver cleanroom ' + (room ? room.getClass().getSimpleName() + ' clean ' + room.isClean() : 'none'))
      check('hatch_reports', Number(hatch.getCurrentParallel()) === 16, 'LuV parallel hatch reports ' + hatch.getCurrentParallel())
      u.m = m
      m.setActiveRecipeType(1)
      note('mode', 'active mode now ' + m.getRecipeType().registryName)
      m.setBatchEnabled(false)
      empty(u.outBus)
      fill(u.inBus, POPPY, 576)
      u.initial = items(u.inBus)[POPPY] || 0
      topUp(u.energy)
      m.getRecipeLogic().updateTickSubscription()
      u.phase = 'run'
      u.started = S.tick
      u.snap = null
      return
    }
    topUp(u.energy)
    topUp(u.crEnergy)
    if (u.phase === 'run') {
      var rlg = m.getRecipeLogic()
      if (u.snap === null && rlg.isWorking()) {
        var sn = snapshot(m)
        if (sn !== null && sn.id.indexOf('ah_circuit') >= 0) {
          u.snap = sn
          u.consumed = u.initial - (items(u.inBus)[POPPY] || 0)
        }
      }
      var got = items(u.outBus)[RED] || 0
      if (got > 0 || S.tick - u.started > 600) {
        var s = u.snap
        note('measured', fmt(s) + '; consumed ' + u.consumed + ', out ' + got + '; max voltage ' + m.getMaxVoltage() + '; reasons ' + String(rlg.getFailureReasons()))
        var ok = s !== null && s.parallels === 512 && got === 512 && u.consumed === 512 && s.duration === 200 && Math.abs(s.eut - 524288) <= 1
        check('cleanroom_recipe_parallels', ok, 'expected 512 copies (ceiling 1024, energy cap 512), EU/t 524288, duration 200; got ' + fmt(s) + ', out ' + got + ', consumed ' + u.consumed)
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
  ServerEvents.customCommand('gg_test_mega_assembly_hall', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMegaAssemblyHallRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMegaAssemblyHallRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMegaAssemblyHallRequest = false
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
      else if (S.tick > 2600) { check('deadline', false, '2600-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
