// TEST ONLY, MEGA-1 (gtceu:wire_works). Command: kubejs custom_command gg_test_mega_wire_works
// Band ONLY: X 30720-30783, Z 0-63, Overworld Y 98-115.
//   Two real Wire Works are placed (maintenance, one energy hatch, input and output bus); test recipes at 8 EU/t, 200 ticks, batch off:
//     lv   one LV hatch (32 V): wiremill 1 poppy -> 1 red dye. energy cap floor(32/8)=4          4 copies, 32 EU/t, 200 ticks
//          then the bender mode: 1 dandelion -> 1 yellow dye, 4 copies again (the mode switch picks the other recipe type)
//     mv   one MV hatch (128 V): ceiling 8 binds (floor(128/8)=16)                                8 copies, 64 EU/t, 200 ticks
//   Also: the machine registers [wiremill, bender], and the controller recipe exists.
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 30720
  var X1 = 30783
  var Y0 = 98
  var Y1 = 115
  var NAME = 'mega_wire_works'
  var ID = 'gtceu:wire_works'
  var POPPY = 'minecraft:poppy'
  var RED = 'minecraft:red_dye'
  var DANDELION = 'minecraft:dandelion'
  var YELLOW = 'minecraft:yellow_dye'

  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.wiremill('gg_test_mega:ww_wire').itemInputs('1x ' + POPPY).itemOutputs('1x ' + RED).duration(200).EUt(8)
      event.recipes.gtceu.bender('gg_test_mega:ww_bend').itemInputs('1x ' + DANDELION).itemOutputs('1x ' + YELLOW).duration(200).EUt(8)
    } catch (e) {
      console.error('[gg_test mega_wire_works] could not add the test recipes: ' + errText(e))
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

  // front slice (the last one) floor row: maintenance, energy hatch, free, input bus, output bus
  function placeMachine(id, cx, cy, cz, hatch) {
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
    var last = desc.slices.length - 1
    var parts = ['gtceu:maintenance_hatch', hatch, null, 'gtceu:mv_input_bus', 'gtceu:mv_output_bus']
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
      var isPart = false
      if (sym.kind === 'controller') block = id
      else if (sym.kind === 'frames') block = 'gtceu:steel_frame'
      else if (sym.kind === 'oneOf') {
        if (c.si === last && c.ri === 0 && parts[c.ci]) { block = parts[c.ci]; isPart = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      put(c.x, c.y, c.z, block + (isPart ? '[facing=north]' : ''))
      count++
    })
    put(controller.x, controller.y, controller.z, id + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), blocks: count + 1 }
  }

  var UNITS = [
    { name: 'lv', hatch: 'gtceu:lv_energy_input_hatch', par: 4, eut: 32, dur: 200, x: 30730, bender: true },
    { name: 'mv', hatch: 'gtceu:mv_energy_input_hatch', par: 8, eut: 64, dur: 200, x: 30750 }
  ]

  function registrationChecks() {
    var def = classes().GTRegistries.MACHINES.get(new (classes().RL)(ID))
    var types = []
    if (def) array(def.getRecipeTypes()).forEach(function (t) { types.push(String(t.registryName)) })
    check('modes', !!def && types.join(',') === 'gtceu:wiremill,gtceu:bender', 'machine ' + ID + ' registered=' + !!def + ' modes [' + types.join(',') + ']')
    var rm = S.server.getRecipeManager()
    var wire = rm.byKey(new (classes().RL)('gg_test_mega:ww_wire'))
    var bend = rm.byKey(new (classes().RL)('gg_test_mega:ww_bend'))
    check('lookup', wire.isPresent() && bend.isPresent() &&
      String(wire.get().getType()).indexOf('wiremill') >= 0 && String(bend.get().getType()).indexOf('bender') >= 0,
      'wiremill recipe ' + wire.isPresent() + ' (' + (wire.isPresent() ? wire.get().getType() : '-') + '), bender recipe ' + bend.isPresent() +
      ' (' + (bend.isPresent() ? bend.get().getType() : '-') + ')')
    var ww = global.grindless.megaWireWorks
    var made = []
    array(rm.getRecipes()).forEach(function (r) {
      var rid = String(r.getId())
      if (rid.indexOf('wire_works') >= 0 && rid.indexOf('gg_test') < 0) made.push(rid)
    })
    check('crafting', !!ww && made.length > 0, 'controller recipe ids: ' + made.join(', ') + '; published ' + (ww ? ww.crafting : 'nothing'))
  }

  function build() {
    var out = []
    UNITS.forEach(function (u) {
      try {
        var placed = placeMachine(ID, u.x, 101, 8, u.hatch)
        u.pos = placed.pos
        u.phase = 'forming'
        u.mode = 'wiremill'
        u.started = S.tick
        out.push(u)
      } catch (e) { check(u.name + '_place_exception', false, errText(e)) }
    })
    return out
  }

  function startRun(u, m, input, amount) {
    m.setBatchEnabled(false)
    empty(u.outBus)
    empty(u.inBus)
    fill(u.inBus, input, amount)
    u.input = input
    u.initial = items(u.inBus)[input] || 0
    topUp(u.energy)
    m.getRecipeLogic().updateTickSubscription()
    u.phase = 'run'
    u.started = S.tick
    u.snap = null
  }

  function tick(u) {
    var m = machine(u.pos)
    var waited = S.tick - u.started
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.energy = partsLike(m, /energy_input_hatch/)
      u.inBus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var maint = partsLike(m, /maintenance/).length
      check(u.name + '_formed', !!u.inBus && !!u.outBus && u.energy.length === 1 && maint === 1,
        'class ' + m.getClass().getSimpleName() + ', parts ' + partIds(m).join(' '))
      if (!u.inBus || !u.outBus || u.energy.length !== 1) { u.phase = 'done'; return }
      var modes = array(m.getDefinition().getRecipeTypes())
      note(u.name + '_start', 'active mode ' + m.getRecipeType().registryName + ' of ' + modes.length)
      u.m = m
      startRun(u, m, POPPY, 64)
      return
    }
    topUp(u.energy)
    if (u.phase === 'run') {
      var rlg = m.getRecipeLogic()
      if (u.snap === null && rlg.isWorking()) {
        u.snap = snapshot(m)
        u.consumed = u.initial - (items(u.inBus)[u.input] || 0)
      }
      var out = u.mode === 'wiremill' ? RED : YELLOW
      var got = items(u.outBus)[out] || 0
      if (got > 0 || S.tick - u.started > 600) {
        var s = u.snap
        note(u.name + '_' + u.mode + '_measured', fmt(s) + '; consumed ' + u.consumed + ', out ' + got + '; max voltage ' + m.getMaxVoltage() + '; reasons ' + String(rlg.getFailureReasons()))
        var ok = s !== null && s.parallels === u.par && got === u.par && u.consumed === u.par && s.duration === u.dur && Math.abs(s.eut - u.eut) <= 1
        check(u.name + '_' + u.mode + '_parallels', ok, 'expected ' + u.par + ' copies, EU/t ' + u.eut + ', duration ' + u.dur + '; got ' + fmt(s) + ', out ' + got + ', consumed ' + u.consumed)
        if (u.bender && u.mode === 'wiremill') {
          u.mode = 'bender'
          m.setActiveRecipeType(1)
          note(u.name + '_switch', 'active mode now ' + m.getRecipeType().registryName)
          startRun(u, m, DANDELION, 64)
        } else u.phase = 'done'
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
  ServerEvents.customCommand('gg_test_mega_wire_works', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMegaWireWorksRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMegaWireWorksRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMegaWireWorksRequest = false
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
