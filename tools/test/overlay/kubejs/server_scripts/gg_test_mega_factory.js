// TEST ONLY, MEGA-8 (gtceu:mega_factory). Command: kubejs custom_command gg_test_mega_factory
// Band ONLY: X 34304-34367, Z 0-63, Overworld Y 98-115.
//   T1 of docs/eras/mega.md 6.4 (named uncertainty: the upkeep modifier adds a fluid input that the machine must still check and drain):
//     modes      the machine is registered on the 15 recipe types, in the order of the module table
//     formed     a real factory (15 x 12 x 21) forms with TWO modules (separation + forming; the other two sockets empty), one UV parallel
//                hatch (256) and one UV energy hatch
//     veto       a mixer recipe (mixing module absent): the machine does not start, the inputs stay untouched, the reasons are noted
//     centrifuge a centrifuge recipe (separation module present) runs; the PCB coolant drained at its start is 2 x 250 mB, once per run
//     nocoolant  the same recipe with the coolant tank empty does not start and its inputs stay untouched
//     bender     a bender recipe (forming module present) runs
//     figure     a probe recipe (8 EU/t, one non-consumed stick in the bus, no output) goes through the machine's modifiers: 256 x 256 =
//                65,536 copies at UV (energy cap floor(2,097,152 / 8) = 262,144 does not bind)
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 34304
  var X1 = 34367
  var Y0 = 98
  var Y1 = 115
  var NAME = 'mega_factory'
  var ID = 'gtceu:mega_factory'
  var TYPES = ['centrifuge', 'electrolyzer', 'sifter', 'bender', 'extruder', 'forming_press', 'wiremill', 'cutter', 'lathe', 'laser_engraver',
    'mixer', 'chemical_bath', 'autoclave', 'arc_furnace', 'alloy_smelter']
  var DANDELION = 'minecraft:dandelion'
  var YELLOW = 'minecraft:yellow_dye'
  var POPPY = 'minecraft:poppy'
  var RED = 'minecraft:red_dye'
  var SAPLING = 'minecraft:oak_sapling'
  var STICK = 'minecraft:stick'
  var PROBE_EUT = 8
  var UPKEEP_MB = 250
  var MODULES = 2
  var CX = 34336
  var CZ = 20
  var CY = 100
  // front slice floor row, by column
  var PARTS = {
    1: 'gtceu:hv_output_hatch',
    2: 'gtceu:maintenance_hatch',
    3: 'gtceu:uv_energy_input_hatch',
    4: 'gtceu:hv_input_bus',
    5: 'gtceu:hv_input_bus',
    6: 'gtceu:uv_parallel_hatch',
    8: 'gtceu:hv_output_bus',
    9: 'gtceu:hv_output_bus',
    10: 'gtceu:hv_input_hatch',
    11: 'gtceu:hv_input_hatch',
    12: 'gtceu:hv_output_hatch'
  }
  // module in each of the four sockets, in the order the pattern lists them (the empty ones stay air)
  var SOCKETS = ['grindless:separation_module', 'grindless:forming_module', null, null]

  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.centrifuge('gg_test_mega:mf_cent').itemInputs('1x ' + DANDELION).itemOutputs('1x ' + YELLOW).duration(20).EUt(8)
      event.recipes.gtceu.bender('gg_test_mega:mf_bend').itemInputs('1x ' + POPPY).itemOutputs('1x ' + RED).duration(20).EUt(8)
      event.recipes.gtceu.mixer('gg_test_mega:mf_mix').itemInputs('1x ' + SAPLING).itemOutputs('1x ' + STICK).duration(20).EUt(8)
      event.recipes.gtceu.centrifuge('gg_test_mega:mf_probe').notConsumable('1x ' + STICK).duration(200).EUt(PROBE_EUT)
    } catch (e) {
      console.error('[gg_test mega_factory] could not add the test recipes: ' + errText(e))
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
  function coolant(u, mb) {
    u.tankFluid.tank.setFluidInTank(0, mb > 0 ? Fluid.of('gtceu:pcb_coolant', mb).getFluidStack() : Java.loadClass('net.minecraftforge.fluids.FluidStack').EMPTY)
  }
  function coolantLeft(u) {
    try { return Number(u.tankFluid.tank.getFluidInTank(0).getAmount()) } catch (e) { return NaN }
  }
  function reasons(m) { return String(m.getRecipeLogic().getFailureReasons()) }
  function mode(u, type) {
    u.m.setActiveRecipeType(TYPES.indexOf(type))
    u.m.getRecipeLogic().updateTickSubscription()
  }

  function placeFactory(cx, cy, cz) {
    var desc = global.grindless.patterns.describe(ID)
    if (!desc) throw new Error('no structure description for ' + ID)
    var cells = []
    var ctrl = null
    var sockets = 0
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
      if (c.ch === 'M') {
        block = SOCKETS[sockets++]
        if (!block) return
      } else if (sym.kind === 'blocks') block = sym.blocks[0]
      else if (sym.kind === 'oneOf') {
        if (c.si === last && c.ri === 0 && PARTS[c.ci]) { block = PARTS[c.ci]; part = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(controller.x, controller.y, controller.z, ID + '[facing=north]')
    return pos(controller.x, controller.y, controller.z)
  }

  function registrationChecks() {
    var def = classes().GTRegistries.MACHINES.get(new (classes().RL)(ID))
    var types = []
    if (def) array(def.getRecipeTypes()).forEach(function (t) { types.push(String(t.registryName)) })
    var want = TYPES.map(function (t) { return 'gtceu:' + t }).join(',')
    check('modes', !!def && types.join(',') === want, 'machine ' + ID + ' registered=' + !!def + ' modes [' + types.join(',') + ']')
    var rm = S.server.getRecipeManager()
    var ids = ['centrifuge/mf_cent', 'bender/mf_bend', 'mixer/mf_mix', 'centrifuge/mf_probe']
    var found = ids.filter(function (i) { return rm.byKey(new (classes().RL)('gg_test_mega:' + i)).isPresent() })
    check('lookup', found.length === ids.length, 'test recipes found ' + found.join(', '))
    var mf = global.grindless.megaFactory
    var made = []
    array(rm.getRecipes()).forEach(function (r) {
      var rid = String(r.getId())
      if (rid.indexOf('mega_factory') >= 0 && rid.indexOf('gg_test') < 0) made.push(rid)
      else if (/grindless:.*_module$/.test(rid) || /grindless:assembler\/.*_module$/.test(rid)) made.push(rid)
    })
    check('crafting', !!mf && made.length >= 6, 'controller and module recipe ids: ' + made.join(', '))
  }

  function build() {
    var u = { name: 'factory', phase: 'forming', started: S.tick }
    u.pos = placeFactory(CX, CY, CZ)
    return [u]
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check('factory_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.energy = partsLike(m, /energy_input_hatch/)
      u.inBus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      u.tankFluid = partsLike(m, /^gtceu:hv_input_hatch$/)[0]
      var ph = m.getParallelHatch()
      var hatch = ph.isPresent() ? ph.get() : null
      var maint = partsLike(m, /maintenance/).length
      check('factory_formed', !!u.inBus && !!u.outBus && !!u.tankFluid && u.energy.length === 1 && maint === 1 && !!hatch,
        'class ' + m.getClass().getSimpleName() + ', two modules, parts ' + partIds(m).join(' '))
      if (!u.inBus || !u.outBus || !u.tankFluid || u.energy.length !== 1 || !hatch) { u.phase = 'done'; return }
      check('hatch_reports', Number(hatch.getCurrentParallel()) === 256, 'UV parallel hatch reports ' + hatch.getCurrentParallel())
      u.m = m
      topUp(u.energy)
      empty(u.outBus)
      // veto: the mixer's module is absent; coolant is present so only the module can stop it
      coolant(u, 4000)
      mode(u, 'mixer')
      fill(u.inBus, SAPLING, 8)
      u.phase = 'veto'
      u.started = S.tick
      return
    }
    topUp(u.energy)
    var rlg = m.getRecipeLogic()
    if (u.phase === 'veto') {
      if (waited < 80) return
      var left = items(u.inBus)[SAPLING] || 0
      var made = items(u.outBus)[STICK] || 0
      check('mixer_vetoed', made === 0 && left === 8 && !rlg.isWorking() && coolantLeft(u) === 4000,
        'mixing module absent: made ' + made + ', input left ' + left + '/8, coolant ' + coolantLeft(u) + ', working ' + rlg.isWorking() + ', reasons ' + reasons(m))
      empty(u.inBus)
      mode(u, 'centrifuge')
      fill(u.inBus, DANDELION, 64)
      u.before = coolantLeft(u)
      u.phase = 'cent'
      u.started = S.tick
      u.snap = null
      return
    }
    if (u.phase === 'cent') {
      if (u.snap === null && rlg.isWorking()) {
        var sn = snapshot(m)
        if (sn !== null && sn.id.indexOf('mf_cent') >= 0) {
          u.snap = sn
          u.drained = u.before - coolantLeft(u)
          u.consumed = 64 - (items(u.inBus)[DANDELION] || 0)
        }
      }
      var got = items(u.outBus)[YELLOW] || 0
      if (got > 0 || waited > 400) {
        note('cent_measured', fmt(u.snap) + '; consumed ' + u.consumed + ', out ' + got + ', coolant ' + u.before + ' -> ' + coolantLeft(u) + '; reasons ' + reasons(m))
        check('centrifuge_runs', got > 0 && u.snap !== null, 'separation module present: out ' + got + ' yellow dye, ' + fmt(u.snap))
        check('coolant_drained', u.drained === MODULES * UPKEEP_MB, 'drained at the start ' + u.drained + ' mB, expected ' + (MODULES * UPKEEP_MB) + ' (' + MODULES + ' modules x ' + UPKEEP_MB + ', once per run, not per copy: ' + (u.snap ? u.snap.parallels : '?') + ' copies)')
        u.phase = 'settle'
        u.started = S.tick
      }
      return
    }
    if (u.phase === 'settle') {
      // let the run finish, then take the coolant away and offer the same recipe again
      if (waited < 120 || rlg.isWorking()) { if (waited < 600) return }
      empty(u.outBus)
      empty(u.inBus)
      coolant(u, 0)
      fill(u.inBus, DANDELION, 64)
      u.phase = 'nocoolant'
      u.started = S.tick
      return
    }
    if (u.phase === 'nocoolant') {
      if (waited < 80) return
      var l2 = items(u.inBus)[DANDELION] || 0
      var o2 = items(u.outBus)[YELLOW] || 0
      check('no_run_without_coolant', !rlg.isWorking() && l2 === 64 && o2 === 0,
        'coolant tank empty: working ' + rlg.isWorking() + ', input left ' + l2 + '/64, out ' + o2 + ', reasons ' + reasons(m))
      empty(u.inBus)
      coolant(u, 4000)
      mode(u, 'bender')
      fill(u.inBus, POPPY, 64)
      u.phase = 'bender'
      u.started = S.tick
      return
    }
    if (u.phase === 'bender') {
      var red = items(u.outBus)[RED] || 0
      if (red > 0 || waited > 400) {
        check('bender_runs', red > 0, 'forming module present: out ' + red + ' red dye, ' + fmt(snapshot(m)) + '; reasons ' + reasons(m))
        empty(u.inBus)
        empty(u.outBus)
        coolant(u, 4000)
        mode(u, 'centrifuge')
        // one non-consumed stick: neither stock nor output space limits the copies
        var st = u.inBus.getInventory().storage
        st.setStackInSlot(0, Item.of(STICK, 1))
        u.phase = 'figure'
        u.started = S.tick
        u.snap = null
      }
      return
    }
    if (u.phase === 'figure') {
      if (u.snap === null && rlg.isWorking()) {
        var sp = snapshot(m)
        if (sp !== null && sp.id.indexOf('mf_probe') >= 0) u.snap = sp
      }
      if (u.snap !== null || waited > 300) {
        var s = u.snap
        note('figure_measured', fmt(s) + '; max voltage ' + m.getMaxVoltage() + '; reasons ' + reasons(m))
        check('parallel_figure', s !== null && s.parallels === 65536, 'expected 256 x 256 = 65536 copies at UV (8 EU/t each, energy cap 262144), got ' + fmt(s))
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
  ServerEvents.customCommand('gg_test_mega_factory', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMegaFactoryRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMegaFactoryRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMegaFactoryRequest = false
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
