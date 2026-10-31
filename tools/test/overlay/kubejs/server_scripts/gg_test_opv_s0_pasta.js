// priority: -6890
// TEST ONLY, OpV-S0 S0-12. Command: kubejs custom_command gg_test_opv_s0_pasta
// UXV's four pasta machines (gtceu:pasta_extractor, pasta_phase_sorter, pasta_draw_bench, pasta_laminator) built in the throwaway place
// grindless:s0_sgr1806_orbit, band X 37376-37439, Z 0-63, Y 70-100. Named uncertainty: do they form away from Vela's orbit, and does a recipe with a
// STRING site (recipe.dimension('grindless:s0_sgr1806_orbit'), the way vela_pasta.js writes a string "site") run there while one locked to Vela's orbit is refused?
//   formed     each machine forms with HV hatches and buses
//   site_run   a throwaway SGR-site recipe (dandelion -> poppy) completes
//   site_lock  a throwaway Vela-site recipe on the same machine (cornflower -> allium) never starts
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 37376
  var X1 = 37439
  var Y0 = 70
  var Y1 = 100
  var NAME = 'opv_s0_pasta'
  var DIM = 'grindless:s0_sgr1806_orbit'
  var VELA = 'grindless:vela_pulsar_orbit'
  var CY = 80
  var ENERGY = 'gtceu:hv_energy_input_hatch'
  var HV = ['gtceu:hv_input_bus', 'gtceu:hv_output_bus']
  var TYPES = ['pasta_extraction', 'pasta_sorting', 'pasta_drawing', 'pasta_lamination']
  var marker = JsonIO.read('kubejs/config/gg_test_opv_s0.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'

  ServerEvents.recipes(function (event) {
    if (!ON) return
    TYPES.forEach(function (t) {
      event.recipes.gtceu[t]('gg_test_opv_s0:' + t + '/sgr_probe').itemInputs('1x minecraft:dandelion').itemOutputs('1x minecraft:poppy').EUt(32).duration(20).dimension(DIM)
      event.recipes.gtceu[t]('gg_test_opv_s0:' + t + '/vela_probe').itemInputs('1x minecraft:cornflower').itemOutputs('1x minecraft:allium').EUt(32).duration(20).dimension(VELA)
    })
  })

  var UNITS = [
    { name: 'extractor', id: 'gtceu:pasta_extractor', cx: 37382, z: 8 },
    { name: 'sorter', id: 'gtceu:pasta_phase_sorter', cx: 37394, z: 8 },
    { name: 'draw_bench', id: 'gtceu:pasta_draw_bench', cx: 37404, z: 8 },
    { name: 'laminator', id: 'gtceu:pasta_laminator', cx: 37414, z: 8 }
  ]

  function classes() {
    if (C !== null) return C
    C = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
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
  function slots(inv) {
    var out = []
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (!st.isEmpty()) out.push(String(st.getId()) + 'x' + st.getCount())
    }
    return out.join(' ') || 'empty'
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
  function reasons(m) { return String(m.getRecipeLogic().getFailureReasons()) }

  function place(u) {
    var desc = global.grindless.patterns.describe(u.id)
    if (!desc) throw new Error('no structure description for ' + u.id)
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
    var xs = []
    var parts = [ENERGY].concat(HV)
    cells.forEach(function (c) {
      c.x = u.cx - (c.ci - ctrl.ci)
      c.y = CY + (c.ri - ctrl.ri)
      c.z = u.z - (c.si - ctrl.si)
      if (c.sym.kind === 'oneOf') xs.push(c)
    })
    xs.sort(function (a, b) { return a.z - b.z || a.x - b.x })
    var chosen = {}
    var n = xs.length
    parts.forEach(function (id, i) { chosen[Math.floor(i * (n - 1) / (parts.length - 1))] = id })
    var idx = {}
    xs.forEach(function (c, i) { idx[c.x + ',' + c.y + ',' + c.z] = i })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var part = false
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      if (sym.kind === 'blocks') block = sym.blocks[0]
      else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      else if (sym.kind === 'oneOf') {
        var pid = chosen[idx[c.x + ',' + c.y + ',' + c.z]]
        if (pid) { block = pid; part = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(controller.x, controller.y, controller.z, u.id + '[facing=north]')
    return pos(controller.x, controller.y, controller.z)
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.energy = partsLike(m, /energy_input/)
      u.bus = partsLike(m, /input_bus/)[0]
      u.out = partsLike(m, /output_bus/)[0]
      var ok = !!u.bus && !!u.out && u.energy.length === 1
      check(u.name + '_formed', ok, 'class ' + m.getClass().getSimpleName() + ', energy hatches ' + u.energy.length + ', parts ' + array(m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      var inv = u.bus.getInventory().storage
      for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
      inv.setStackInSlot(0, Item.of('minecraft:dandelion', 4))
      inv.setStackInSlot(1, Item.of('minecraft:cornflower', 4))
      m.getRecipeLogic().updateTickSubscription()
      u.phase = 'run'
      u.started = S.tick
      return
    }
    if (u.phase === 'run') {
      topUp(u.energy)
      var out = slots(u.out.getInventory().storage)
      if (out.indexOf('poppy') >= 0) {
        check(u.name + '_site_run', true, 'SGR-site recipe completed, output bus ' + out + ', input bus ' + slots(u.bus.getInventory().storage))
        u.phase = 'lock'
        u.started = S.tick
      } else if (waited > 400) {
        check(u.name + '_site_run', false, 'no poppy in 400 ticks; reasons ' + reasons(m) + '; output ' + out)
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'lock') {
      topUp(u.energy)
      if (waited >= 120) {
        var after = slots(u.out.getInventory().storage)
        check(u.name + '_site_lock', after.indexOf('allium') < 0, 'output bus after 120 more ticks: ' + after + '; input bus ' + slots(u.bus.getInventory().storage))
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
    S.level = server.getLevel(DIM)
    if (!S.level) { check('level', false, DIM + ' is not a loaded level'); finish(); return }
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    var rm = S.server.getRecipeManager()
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var missing = []
    TYPES.forEach(function (t) {
      ;['sgr_probe', 'vela_probe'].forEach(function (k) {
        if (!rm.byKey(new RL('gg_test_opv_s0:' + t + '/' + t + '/' + k)).isPresent()) missing.push(t + '/' + k)
      })
    })
    check('lookup', missing.length === 0, 'throwaway recipes missing: ' + (missing.length ? missing.join(', ') : 'none'))
    S.units = []
    UNITS.forEach(function (def) {
      var u = { name: def.name, id: def.id, cx: def.cx, z: def.z, phase: 'forming', started: S.tick }
      try {
        u.pos = place(u)
        S.units.push(u)
      } catch (e) { check(def.name + '_build_exception', false, errText(e)) }
    })
  }
  ServerEvents.customCommand('gg_test_opv_s0_pasta', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestOpvS0PastaRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvS0PastaRequest && Date.now() - LOADED >= 10000) {
        global.ggTestOpvS0PastaRequest = false
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
      else if (S.tick > 4000) { check('deadline', false, '4000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
