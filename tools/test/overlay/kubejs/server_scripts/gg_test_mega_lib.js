// priority: -5724
// TEST ONLY, MEGA-0 (lib/mega.js). Command: kubejs custom_command gg_test_mega_lib
// Band ONLY: X 30208-30271, Z 0-63, Overworld Y 98-115.
//   Throwaway machines come from startup_scripts/gg_test_mega_lib_machines.js; one recipe, 2 poppy -> 1 red dye (30 EU/t, 200 ticks) on
//   gtceu:large_chemical_reactor, 128 poppies in the bus, batch off, energy hatches topped up every tick. parallels = min(coil, inputs, energy).
//     cupro   cupronickel (1800 K -> 4), EV hatch                       4 copies, 480 EU/t, 50 ticks (one perfect overclock)
//     trit    tritanium (10800 K -> 4096), IV hatch                     64 copies (the inputs), 7680 EU/t, 50 ticks
//     small   tritanium, HV hatch (512 V): energy cap floor(512/30)=17   17 copies, 510 EU/t, 200 ticks (no room to overclock)
//     disc    nichrome (3600 K -> 16), EV hatch, discount 0.95^2         16 copies, about 1733 EU/t, 50 ticks
//     plant   a coil-less plant: the UHV parallel hatch set to 64 (reports 1024 at rest), IV hatch   64 copies, 7680 EU/t, 50 ticks
//     hatch   the UHV hatch alone reports 1024
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 30208
  var X1 = 30271
  var Y0 = 98
  var Y1 = 115
  var NAME = 'mega_lib'
  var HATCH = 'gtceu:uhv_parallel_hatch'
  var POPPY = 'minecraft:poppy'
  var RED = 'minecraft:red_dye'

  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.large_chemical_reactor('gg_test_mega:lib_lcr').itemInputs('2x ' + POPPY).itemOutputs('1x ' + RED).duration(200).EUt(30)
    } catch (e) {
      console.error('[gg_test mega_lib] could not add the test recipe: ' + errText(e))
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

  var UNITS = [
    { name: 'cupro', id: 'gtceu:gg_lib_coil', coil: 'gtceu:cupronickel_coil_block', hatch: 'gtceu:ev_energy_input_hatch', par: 4, eut: 480, dur: 50, x: 30213 },
    { name: 'trit', id: 'gtceu:gg_lib_coil', coil: 'gtceu:tritanium_coil_block', hatch: 'gtceu:iv_energy_input_hatch', par: 64, eut: 7680, dur: 50, x: 30221 },
    { name: 'small', id: 'gtceu:gg_lib_coil', coil: 'gtceu:tritanium_coil_block', hatch: 'gtceu:hv_energy_input_hatch', par: 17, eut: 510, dur: 200, x: 30229 },
    { name: 'disc', id: 'gtceu:gg_lib_disc', coil: 'gtceu:nichrome_coil_block', hatch: 'gtceu:ev_energy_input_hatch', par: 16, eut: 1733, tol: 6, dur: 50, x: 30237 },
    { name: 'plant', id: 'gtceu:gg_lib_plant', hatch: 'gtceu:iv_energy_input_hatch', par: 64, eut: 7680, dur: 50, x: 30245, setPar: 64 }
  ]

  function build() {
    var out = []
    try {
      put(30209, 100, 56, HATCH)
      out.push({ kind: 'alone', name: 'hatch', pos: pos(30209, 100, 56), phase: 'alone', started: S.tick })
    } catch (e) { check('hatch_place_exception', false, errText(e)) }
    UNITS.forEach(function (u) {
      try {
        var placed = placeMachine(u.id, u.x, 101, 8, function (c) {
          if (c.ch === 'K') return u.coil
          if (c.ch === 'E') return u.hatch
          if (c.ch === 'H') return HATCH
          return null
        })
        u.pos = placed.pos
        u.phase = 'forming'
        u.started = S.tick
        out.push(u)
      } catch (e) { check(u.name + '_place_exception', false, errText(e)) }
    })
    return out
  }

  function tick(u) {
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
      u.energy = partsLike(m, /energy_input_hatch/)
      u.inBus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var extra = ''
      if (u.coil) extra = ', coil ' + global.grindless.coils.temperature(m) + ' K'
      var ph = null
      if (u.setPar) {
        var h = m.getParallelHatch()
        ph = h.isPresent() ? h.get() : null
        extra += ', parallel hatch ' + (ph ? String(ph.getDefinition().getId()) + ' reports ' + ph.getCurrentParallel() : 'none')
      }
      check(u.name + '_formed', !!u.inBus && !!u.outBus && u.energy.length === 1 && (!u.setPar || !!ph), 'class ' + m.getClass().getSimpleName() + extra + ', parts ' + partIds(m).join(' '))
      if (!u.inBus || !u.outBus || u.energy.length !== 1 || (u.setPar && !ph)) { u.phase = 'done'; return }
      if (ph) {
        check('plant_hatch_reports', Number(ph.getCurrentParallel()) === 1024, 'at rest ' + ph.getCurrentParallel())
        ph.setCurrentParallel(u.setPar)
      }
      u.m = m
      m.setBatchEnabled(false)
      empty(u.outBus)
      fill(u.inBus, POPPY, 128)
      u.initial = items(u.inBus)[POPPY] || 0
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
      if (u.snap === null && rlg.isWorking()) {
        u.snap = snapshot(m)
        u.consumed = u.initial - (items(u.inBus)[POPPY] || 0)
      }
      var got = items(u.outBus)[RED] || 0
      if (got > 0 || S.tick - u.started > 500) {
        var s = u.snap
        note(u.name + '_measured', fmt(s) + '; consumed ' + u.consumed + ' poppy, out ' + got + ' dye; reasons ' + String(rlg.getFailureReasons()))
        var tol = u.tol || 0
        var ok = s !== null && s.parallels === u.par && got === u.par && u.consumed === 2 * u.par && Math.abs(s.eut - u.eut) <= tol && s.duration === u.dur
        check(u.name + '_parallels', ok, 'expected ' + u.par + ' copies, EU/t ' + u.eut + (tol ? ' +-' + tol : '') + ', duration ' + u.dur + '; got ' + fmt(s) + ', out ' + got + ', consumed ' + u.consumed)
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
    try { S.units = build() } catch (e) { check('build_exception', false, errText(e)); S.units = [] }
  }
  ServerEvents.customCommand('gg_test_mega_lib', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMegaLibRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMegaLibRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMegaLibRequest = false
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
