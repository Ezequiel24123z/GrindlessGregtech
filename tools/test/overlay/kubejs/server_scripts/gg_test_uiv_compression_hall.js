// priority: -8360
// TEST ONLY, UIV-M2 (gtceu:neutronium_compression_hall). Command: kubejs custom_command gg_test_uiv_compression_hall
// Band ONLY: X 35840-35903, Z 0-63, Overworld Y 98-112.
//   T1 (named uncertainty: the pellet count read from an input bus inside a modifier; the implosion recipe keeps its explosive):
//     formed     hall A (no hatch) and hall B (UIV parallel hatch) form
//     c4         4 pellets + a compressor probe (30 EU/t): 256 copies
//     imp4       4 pellets + an implosion probe with 256 TNT in the bus: 256 copies, the TNT is a run input
//     p1         1 pellet: 4 copies
//     p0         no pellet: refused
//     hatch      hall B with 4 pellets: min(256 x 16,384, UIV energy cap / 30); the figure is reported (the hatch multiplies the ceiling)
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 35840
  var X1 = 35903
  var Y0 = 98
  var Y1 = 112
  var NAME = 'uiv_compression_hall'
  var ID = 'gtceu:neutronium_compression_hall'
  var PELLET = 'grindless:neutronium_pellet'
  var POPPY = 'minecraft:poppy'
  var STICK = 'minecraft:stick'
  var CX = 35872
  var CY = 100
  var PARTS = ['gtceu:maintenance_hatch', 'gtceu:uiv_energy_input_hatch', 'gtceu:hv_input_bus', 'gtceu:hv_output_bus']
  var HATCH = 'gtceu:uiv_parallel_hatch'

  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.implosion_compressor('gg_test_uiv_m2:probe_implosion').notConsumable('1x ' + POPPY).itemInputs('1x minecraft:tnt').duration(20).EUt(30)
      event.recipes.gtceu.compressor('gg_test_uiv_m2:probe_compress').notConsumable('1x ' + STICK).duration(20).EUt(30)
    } catch (e) {
      console.error('[gg_test uiv_compression_hall] could not add the test recipes: ' + errText(e))
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
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
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
  function itemId(s) { return String(classes().Registries.ITEMS.getKey(s.getItem())) }
  function count(p, id) {
    var st = p.getInventory().storage
    var n = 0
    for (var i = 0; i < st.getSlots(); i++) {
      var s = st.getStackInSlot(i)
      if (!s.isEmpty() && itemId(s) === id) n += Number(s.getCount())
    }
    return n
  }
  function setBus(p, list) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    var slot = 0
    list.forEach(function (e) { st.setStackInSlot(slot++, Item.of(e[0], e[1])) })
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
  function reasons(m) { return String(m.getRecipeLogic().getFailureReasons()) }

  // the run: copies, EU/t, the item inputs of the modified recipe (explosive gone? pellet chanced?)
  function snapshot(m) {
    var rec = m.getRecipeLogic().getLastRecipe()
    if (rec === null || rec === undefined) return null
    var snap = { parallels: field(rec, 'parallels'), id: String(rec.id), eut: NaN, tnt: false, pellet: '' }
    try { snap.eut = Number(classes().RecipeHelper.getInputEUt(rec)) } catch (e) { }
    try {
      var list = rec.inputs.get(classes().ItemCap)
      if (list !== null && list !== undefined) {
        array(list).forEach(function (c) {
          var ids = []
          try { ids = array(c.content.getItemIds()).map(String) } catch (e) { ids = ['unreadable'] }
          if (ids.indexOf('minecraft:tnt') >= 0) snap.tnt = true
          if (ids.indexOf(PELLET) >= 0) snap.pellet = field(c, 'chance') + '/' + field(c, 'maxChance')
        })
      }
    } catch (e) { snap.pellet = 'unreadable: ' + errText(e) }
    return snap
  }

  // the structure: the template walk, the floor cells (the 'X' oneOf cells) take the parts
  function placeHall(cx, cy, cz, withHatch) {
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
    var controller = null
    var xs = []
    cells.forEach(function (c) {
      c.x = cx - (c.ci - ctrl.ci)
      c.y = cy + (c.ri - ctrl.ri)
      c.z = cz - (c.si - ctrl.si)
      if (c.sym.kind === 'oneOf') xs.push(c)
    })
    xs.sort(function (a, b) { return a.z - b.z || a.x - b.x })
    var wanted = PARTS.slice()
    if (withHatch) wanted.push(HATCH)
    var chosen = {}
    var n = xs.length
    wanted.forEach(function (id, i) { chosen[Math.floor(i * (n - 1) / (wanted.length - 1))] = id })
    var idx = {}
    xs.forEach(function (c, i) { idx[c.x + ',' + c.y + ',' + c.z] = i })
    var minY = 1e9
    var maxY = -1e9
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
      if (c.y < minY) minY = c.y
      if (c.y > maxY) maxY = c.y
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(controller.x, controller.y, controller.z, ID + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), height: maxY - minY + 1 }
  }

  function registrationChecks() {
    var rm = S.server.getRecipeManager()
    var found = ['implosion_compressor/probe_implosion', 'compressor/probe_compress'].filter(function (i) { return rm.byKey(new (classes().RL)('gg_test_uiv_m2:' + i)).isPresent() })
    check('lookup', found.length === 2, 'probe recipes found ' + found.join(', '))
    var made = []
    array(rm.getRecipes()).forEach(function (r) { var rid = String(r.getId()); if (rid.indexOf('neutronium_compression_hall') >= 0) made.push(rid) })
    check('crafting', made.length >= 1, 'controller recipe ids: ' + made.join(', '))
  }

  var STEPS_A = [
    { name: 'c4', pellets: 4, probe: STICK, expect: 256, wear: false },
    { name: 'imp4', pellets: 4, probe: POPPY, tnt: 256, expect: 256, wear: false },
    { name: 'p1', pellets: 1, probe: STICK, expect: 4, wear: false },
    { name: 'p0', pellets: 0, probe: STICK, expect: 0, wear: false }
  ]
  var STEPS_B = [
    { name: 'hatch', pellets: 4, probe: STICK, expect: -1, wear: false }
  ]

  function build() {
    var a = { name: 'hallA', phase: 'forming', started: S.tick, z: 20, hatch: false, steps: STEPS_A.slice(), step: -1, left0: 0 }
    var b = { name: 'hallB', phase: 'forming', started: S.tick, z: 50, hatch: true, steps: STEPS_B.slice(), step: -1, left0: 0 }
    var us = [a, b]
    us.forEach(function (u) {
      var r = placeHall(CX, CY, u.z, u.hatch)
      u.pos = r.pos
      u.height = r.height
    })
    return us
  }

  function begin1(u, m) {
    u.m = m
    u.energy = partsLike(m, /energy_input_hatch/)
    u.bus = partsLike(m, /input_bus/)[0]
    var ph = m.getParallelHatch()
    var hatch = ph.isPresent() ? ph.get() : null
    var ok = !!u.bus && u.energy.length === 1 && u.height <= 16 && (u.hatch ? !!hatch : !hatch)
    check(u.name + '_formed', ok, 'class ' + m.getClass().getSimpleName() + ', height ' + u.height + ', energy hatches ' + u.energy.length + ', hatch ' + (hatch ? hatch.getCurrentParallel() : 'none') + ', parts ' + array(m.getParts()).length)
    return ok
  }

  function startStep(u) {
    u.step++
    if (u.step >= u.steps.length) { u.phase = 'done'; return }
    var s = u.steps[u.step]
    try { u.m.setActiveRecipeType(s.tnt ? 1 : 0) } catch (e) { note('type_switch', 'setActiveRecipeType failed: ' + errText(e)) }
    topUp(u.energy)
    var list = []
    if (s.pellets > 0) list.push([PELLET, s.pellets])
    list.push([s.probe, 1])
    for (var t = 0; t < (s.tnt || 0); t += 64) list.push(['minecraft:tnt', Math.min(64, s.tnt - t)])
    setBus(u.bus, list)
    u.snap = null
    u.last = u.m.getRecipeLogic().getLastRecipe()
    u.started = S.tick
    u.phase = 'run'
  }
  // a recipe started since this step began (subtick overclock: a run may end within one tick, so isWorking is not enough)
  function fresh(u, m) {
    var r = m.getRecipeLogic().getLastRecipe()
    return r !== null && r !== undefined && r !== u.last
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      if (!begin1(u, m)) { u.phase = 'done'; return }
      startStep(u)
      return
    }
    topUp(u.energy)
    var rlg = m.getRecipeLogic()
    var s = u.steps[u.step]
    if (u.phase === 'run') {
      if (u.snap === null && fresh(u, m)) u.snap = snapshot(m)
      var refused = s.expect === 0
      if (u.snap !== null || waited > (refused ? 120 : 300)) {
        var sn = u.snap
        if (s.name === 'hatch') {
          var cap = Math.floor(Number(m.getMaxVoltage()) / 30)
          var want = Math.min(256 * 16384, cap)
          note('hatch_measured', 'copies ' + (sn ? sn.parallels : 'none') + ', ceiling ' + (256 * 16384) + ', energy cap ' + cap + ', max voltage ' + m.getMaxVoltage() + ', EU/t ' + (sn ? sn.eut : 'none') + '; reasons ' + reasons(m))
          check('hatch_ceiling', sn !== null && sn.parallels === want, 'UIV hatch: expected min(256 x 16384, cap ' + cap + ') = ' + want + ', got ' + (sn ? sn.parallels : 'none'))
        } else if (refused) {
          check(s.name, sn === null && !rlg.isWorking(), 'no pellet: working ' + rlg.isWorking() + ' (expected refused); reasons ' + reasons(m))
        } else {
          note(s.name + '_measured', 'copies ' + (sn ? sn.parallels : 'none') + ', EU/t ' + (sn ? sn.eut : 'none') + ', id ' + (sn ? sn.id : '-') + ', tnt in run ' + (sn ? sn.tnt : '-') + ', pellet chance ' + (sn ? sn.pellet : '-') + '; reasons ' + reasons(m))
          var ok = sn !== null && sn.parallels === s.expect
          if (s.name === 'imp4') ok = ok && sn.tnt === true && sn.id.indexOf('implosion') >= 0
          check(s.name, ok, s.pellets + ' pellet(s): copies ' + (sn ? sn.parallels : 'none') + ' (expected ' + s.expect + '), explosive in the run ' + (sn ? sn.tnt : '-') + ', pellet chance ' + (sn ? sn.pellet : '-'))
        }
        u.left0 = count(u.bus, PELLET)
        setBus(u.bus, [])
        u.phase = 'settle'
        u.started = S.tick
      }
      return
    }
    if (u.phase === 'settle') {
      if (waited < 60 || (rlg.isWorking() && waited < 600)) return
      if (u.step === u.steps.length - 1) note('pellets_left', u.name + ': pellets in the bus when the last probe was read ' + u.left0)
      startStep(u)
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
  ServerEvents.customCommand('gg_test_uiv_compression_hall', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestUivCompressionHallRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUivCompressionHallRequest && Date.now() - LOADED >= 10000) {
        global.ggTestUivCompressionHallRequest = false
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
      else if (S.tick > 3600) { check('deadline', false, '3600-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
