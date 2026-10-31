// priority: -5444
// TEST ONLY, MAX-R1 (gtceu:cluster_light_furnace). Command: kubejs custom_command gg_test_max_furnace
// Band ONLY: X 40152-40215, Z 0-63, grindless:nsc_belt Y 98-115 (zones.json row max_furnace).
//   T1 (named uncertainty: the 13x9x13 furnace forms in the belt on two OpV 4 A hatches and runs c1 and c5 at VA[MAX] = 2,013,265,920 EU/t, dimension lock satisfied):
//     lookup   every recipe id of the package (belt harvest and processor rows, c1-c5, the controller line, the older rows) is in the recipe manager
//     static   nothing skipped
//     formed   the furnace forms with two OpV 4 A hatches, an input bus and an output bus
//     c1       sixteen nsc_planetesimal become a metal_rich_bloom at VA[MAX]
//     c5       a sealed_hearth_liner is relined into tantalum dust
// The older rows (cascade c30, platinum plant c18, carbonyl c2, melter c19, composites c15 and c20, SPS c20, helium loop) change only data
// on mechanisms proven by their own packages, so they are looked up, not run.
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 40152
  var X1 = 40215
  var Y0 = 98
  var Y1 = 115
  var NAME = 'max_furnace'
  var DIM = 'grindless:nsc_belt'
  var CX = 40184
  var CY = 100
  var CZ = 32
  var VA_MAX = 2013265920
  var HATCH = 'gtceu:opv_energy_input_hatch_4a'
  var CIRCUIT = 'gtceu:programmed_circuit'
  var MACHINE = 'gtceu:cluster_light_furnace'
  var PARTS = [HATCH, HATCH, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus']
  var JOBS = [
    { name: 'c1', inputs: [['grindless:nsc_planetesimal', 16]], circuit: 1, out: 'grindless:metal_rich_bloom' },
    { name: 'c5', inputs: [['grindless:sealed_hearth_liner', 1]], circuit: 5, out: 'gtceu:tantalum_dust' }
  ]
  var IDS = [
    'debris_harvesting/nsc_planetesimal_harvest', 'asteroid_processing/iron_core_fragment', 'closed_loop_cooling/cryo_milled_core',
    'cluster_light_smelting/metal_rich_bloom', 'cluster_light_smelting/segment_truss_billet', 'cluster_light_smelting/pellet_blank',
    'cluster_light_smelting/mirror_scrap_billet', 'cluster_light_smelting/hearth_relining', 'assembly_line/cluster_light_furnace',
    'levitation_melting/segment_alloy_ingot', 'carbonyl_refining/bloom_carbonyl', 'chemical_vapour_infiltration/sealed_hearth_liner',
    'nitride_magnet_synthesis/halbach_segment_coupler'
  ]

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
    list.forEach(function (e) { st.setStackInSlot(slot++, e.length > 2 ? Item.of(e[0], e[1], e[2]) : Item.of(e[0], e[1])) })
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

  // the structure: the template walk; the 'X' oneOf cells take the parts, spread evenly over the sorted cells
  function place() {
    var desc = global.grindless.patterns.describe(MACHINE)
    if (!desc) throw new Error('no structure description for ' + MACHINE)
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
      c.x = CX - (c.ci - ctrl.ci)
      c.y = CY + (c.ri - ctrl.ri)
      c.z = CZ - (c.si - ctrl.si)
      if (c.sym.kind === 'oneOf') xs.push(c)
    })
    xs.sort(function (a, b) { return a.z - b.z || a.x - b.x })
    var chosen = {}
    var n = xs.length
    PARTS.forEach(function (id, i) { chosen[Math.floor(i * (n - 1) / (PARTS.length - 1))] = id })
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
    put(controller.x, controller.y, controller.z, MACHINE + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), height: maxY - minY + 1 }
  }

  function registrationChecks() {
    var rm = S.server.getRecipeManager()
    var missing = IDS.filter(function (i) { return !rm.byKey(new (classes().RL)('grindless:' + i)).isPresent() })
    check('lookup', missing.length === 0, IDS.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
    var MF = global.grindless.maxFurnace
    check('static', !!MF && MF.skipped.length === 0, 'recipes ' + (MF ? MF.recipes.length : null) + ', skipped ' + JSON.stringify(MF ? MF.skipped : null))
  }

  function load(u) {
    var job = JOBS[u.job]
    var list = job.inputs.map(function (e) { return [e[0], e[1]] })
    list.push([CIRCUIT, 1, '{Configuration:' + job.circuit + '}'])
    setBus(u.bus, list)
    u.last = u.m.getRecipeLogic().getLastRecipe()
    u.started = S.tick
    u.phase = 'run'
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 700) { check('formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.energy = partsLike(m, /opv_energy_input_hatch_4a/)
      u.bus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var ok = !!u.bus && !!u.outBus && u.energy.length === 2
      check('formed', ok, 'class ' + m.getClass().getSimpleName() + ', height ' + u.height + ', OpV 4 A hatches ' + u.energy.length + ', parts ' + array(m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      topUp(u.energy)
      load(u)
      return
    }
    topUp(u.energy)
    var rlg = m.getRecipeLogic()
    var job = JOBS[u.job]
    if (u.phase === 'run') {
      var rec = rlg.getLastRecipe()
      if (rec !== null && rec !== undefined && rec !== u.last) {
        var eut = NaN
        try { var io = classes().RecipeHelper.getRealEUtWithIO(rec); eut = io.isEmpty() ? 0 : Number(io.getTotalEU()) } catch (e) { }
        note(job.name + '_measured', 'recipe ' + String(rec.id) + ', EU/t ' + eut + ', max voltage ' + m.getMaxVoltage())
        check(job.name + '_eut', eut >= VA_MAX, 'expected at least ' + VA_MAX + ' EU/t, got ' + eut + '; reasons ' + reasons(m))
        u.phase = 'wait'
        u.started = S.tick
      } else if (waited > 300) {
        check(job.name + '_eut', false, 'no recipe started in 300 ticks; reasons ' + reasons(m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'wait') {
      var got = count(u.outBus, job.out)
      if (got >= 1) {
        check(job.name + '_output', true, job.out + ' x' + got)
        u.job++
        if (u.job >= JOBS.length) u.phase = 'done'
        else { setBus(u.outBus, []); load(u) }
      } else if (waited > 1500) {
        check(job.name + '_output', false, 'no ' + job.out + ' in 1500 ticks; reasons ' + reasons(m))
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
    S = { server: server, tick: 0, failed: 0, finished: false, unit: null }
    S.level = server.getLevel(DIM)
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    try {
      var r = place()
      S.unit = { pos: r.pos, height: r.height, phase: 'forming', started: S.tick, job: 0 }
    } catch (e) { check('build_exception', false, errText(e)) }
  }
  ServerEvents.customCommand('gg_test_max_furnace', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMaxFurnaceRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMaxFurnaceRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMaxFurnaceRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      if (S.unit !== null && S.unit.phase !== 'done') {
        try { tick(S.unit) } catch (e) { check('exception', false, 'phase ' + S.unit.phase + ': ' + errText(e)); S.unit.phase = 'done' }
      }
      if (S.unit === null || S.unit.phase === 'done') finish()
      else if (S.tick > 6000) { check('deadline', false, '6000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
