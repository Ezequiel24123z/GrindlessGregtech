// priority: -5697
// TEST ONLY, UEV-M2 (gtceu:stellar_forge). Command: kubejs custom_command gg_test_uev_stellar_forge
// Band ONLY: X 35136-35199, Z 0-63, Overworld Y 98-115.
//   T1 (named uncertainty: the forge's modifier chain on 7.5.3: ebf_temp read, plasma added by the last modifier, veto, clamp):
//     formed     forge A (no hatch) and forge B (UEV parallel hatch) form <= 16 tall with HfTaCN coils (12,600 K)
//     noplasma   a 9,000 K probe (8 EU/t, non-consumed stick) runs 256 copies, nothing drained
//     plasma     with 1,000 mB uev_dhe3_plasma the same probe runs 1,024 copies, 250 mB drained once, 250 mB helium_4_ash out
//     short      with 100 mB plasma it runs 256 copies and the tank is untouched
//     hot        a 14,000 K recipe is refused even with plasma
//     hatch      forge B: the UEV hatch ceiling (256 x 4,096) against the energy cap of one UEV hatch (8,388,608 V / 8 EU/t); the figure is reported
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 35136
  var X1 = 35199
  var Y0 = 98
  var Y1 = 115
  var NAME = 'uev_stellar_forge'
  var ID = 'gtceu:stellar_forge'
  var STICK = 'minecraft:stick'
  var POPPY = 'minecraft:poppy'
  var PLASMA = 'gtceu:uev_dhe3_plasma'
  var ASH = 'gtceu:helium_4_ash'
  var CX = 35168
  var CY = 100
  var COIL = 'grindless:hftacn_coil_block'
  var PARTS_A = { 0: 'gtceu:maintenance_hatch', 1: 'gtceu:uev_energy_input_hatch', 2: 'gtceu:hv_input_bus', 4: 'gtceu:hv_input_hatch', 5: 'gtceu:hv_output_hatch' }
  var PARTS_B = { 0: 'gtceu:maintenance_hatch', 1: 'gtceu:uev_energy_input_hatch', 2: 'gtceu:hv_input_bus', 4: 'gtceu:hv_input_hatch', 5: 'gtceu:hv_output_hatch', 6: 'gtceu:uev_parallel_hatch' }

  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.electric_blast_furnace('gg_test_uev:sf_probe9').notConsumable('1x ' + STICK).blastFurnaceTemp(9000).duration(40).EUt(8)
      event.recipes.gtceu.electric_blast_furnace('gg_test_uev:sf_hot').notConsumable('1x ' + POPPY).blastFurnaceTemp(14000).duration(40).EUt(8)
    } catch (e) {
      console.error('[gg_test uev_stellar_forge] could not add the test recipes: ' + errText(e))
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
      FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
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
  function setBus(p, id) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    if (id) st.setStackInSlot(0, Item.of(id, 1))
  }
  function setFluid(p, id, mb) {
    p.tank.setFluidInTank(0, mb > 0 ? Fluid.of(id, mb).getFluidStack() : classes().FluidStack.EMPTY)
  }
  function fluidAmount(p) { try { return Number(p.tank.getFluidInTank(0).getAmount()) } catch (e) { return NaN } }
  function fluidName(p) { try { return String(classes().Registries.FLUIDS.getKey(p.tank.getFluidInTank(0).getFluid())) } catch (e) { return '?' } }
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
    return { parallels: field(rec, 'parallels'), id: String(rec.id) }
  }
  function reasons(m) { return String(m.getRecipeLogic().getFailureReasons()) }

  function placeForge(cx, cy, cz, parts) {
    var desc = global.grindless.patterns.describe(ID)
    if (!desc) throw new Error('no structure description for ' + ID)
    var cells = []
    var ctrl = null
    var minY = 1e9
    var maxY = -1e9
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
      if (sym.kind === 'blocks') block = sym.blocks.length > 1 ? COIL : sym.blocks[0]
      else if (sym.kind === 'oneOf') {
        if (c.si === last && c.ri === ctrl.ri && parts[c.ci]) { block = parts[c.ci]; part = true }
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
    var def = classes().Registries.FLUIDS.getValue(new (classes().RL)(PLASMA))
    var ash = classes().Registries.FLUIDS.getValue(new (classes().RL)(ASH))
    check('fluids', !!def && !!ash && String(def.getFluidType()).length > 0, 'plasma fluid registered ' + !!def + ', ash fluid registered ' + !!ash)
    var rm = S.server.getRecipeManager()
    var found = ['electric_blast_furnace/sf_probe9', 'electric_blast_furnace/sf_hot'].filter(function (i) { return rm.byKey(new (classes().RL)('gg_test_uev:' + i)).isPresent() })
    check('lookup', found.length === 2, 'probe recipes found ' + found.join(', '))
    var made = []
    array(rm.getRecipes()).forEach(function (r) { var rid = String(r.getId()); if (rid.indexOf('stellar_forge') >= 0) made.push(rid) })
    check('crafting', made.length >= 1, 'controller recipe ids: ' + made.join(', '))
  }

  function build() {
    var a = { name: 'forgeA', phase: 'forming', started: S.tick, z: 20, parts: PARTS_A, hatch: false }
    var b = { name: 'forgeB', phase: 'forming', started: S.tick, z: 50, parts: PARTS_B, hatch: true }
    var us = [a, b]
    us.forEach(function (u) {
      var r = placeForge(CX, CY, u.z, u.parts)
      u.pos = r.pos
      u.height = r.height
    })
    return us
  }

  function begin1(u, m) {
    u.m = m
    u.energy = partsLike(m, /energy_input_hatch/)
    u.bus = partsLike(m, /input_bus/)[0]
    u.inH = partsLike(m, /input_hatch/).filter(function (p) { return !/energy/.test(String(p.getDefinition().getId())) })[0]
    u.outH = partsLike(m, /output_hatch/)[0]
    var kelvin = global.grindless.coils.temperature(m)
    var ph = m.getParallelHatch()
    var hatch = ph.isPresent() ? ph.get() : null
    var ok = !!u.bus && !!u.inH && !!u.outH && u.energy.length === 1 && u.height <= 16 && kelvin === 12600 && (u.hatch ? !!hatch : !hatch)
    check(u.name + '_formed', ok, 'class ' + m.getClass().getSimpleName() + ', height ' + u.height + ', coil ' + kelvin + ' K, hatch ' + (hatch ? hatch.getCurrentParallel() : 'none'))
    return ok
  }

  function startRun(u, recipeStick, plasmaMb) {
    topUp(u.energy)
    setFluid(u.outH, ASH, 0)
    setFluid(u.inH, PLASMA, plasmaMb)
    setBus(u.bus, recipeStick)
    u.before = plasmaMb
    u.snap = null
    u.started = S.tick
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
      if (u.hatch) { startRun(u, STICK, 0); u.phase = 'hatch'; return }
      startRun(u, STICK, 0)
      u.phase = 'noplasma'
      return
    }
    topUp(u.energy)
    var rlg = m.getRecipeLogic()
    var s
    if (u.phase === 'hatch') {
      if (u.snap === null && rlg.isWorking()) u.snap = snapshot(m)
      if (u.snap !== null || waited > 300) {
        var cap = Math.floor(Number(m.getMaxVoltage()) / 8)
        var want = Math.min(256 * 4096, cap)
        note('hatch_measured', 'copies ' + (u.snap ? u.snap.parallels : 'none') + ', ceiling ' + (256 * 4096) + ', energy cap ' + cap + ', max voltage ' + m.getMaxVoltage() + '; reasons ' + reasons(m))
        check('hatch_ceiling', u.snap !== null && u.snap.parallels === want, 'UEV hatch: expected min(256 x 4096, cap ' + cap + ') = ' + want + ', got ' + (u.snap ? u.snap.parallels : 'none'))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'noplasma') {
      if (u.snap === null && rlg.isWorking()) u.snap = snapshot(m)
      if (u.snap !== null || waited > 300) {
        check('noplasma', u.snap !== null && u.snap.parallels === 256 && u.snap.id.indexOf('sf_probe9') >= 0, 'no plasma: copies ' + (u.snap ? u.snap.parallels : 'none') + ' (expected 256); reasons ' + reasons(m))
        setBus(u.bus, null)
        u.phase = 'settle1'
        u.started = S.tick
      }
      return
    }
    if (u.phase === 'settle1') {
      if (waited < 60 || (rlg.isWorking() && waited < 600)) return
      startRun(u, STICK, 1000)
      u.phase = 'plasma'
      return
    }
    if (u.phase === 'plasma') {
      if (u.snap === null && rlg.isWorking()) {
        s = snapshot(m)
        if (s !== null && s.id.indexOf('sf_probe9') >= 0) { u.snap = s; u.drained = u.before - fluidAmount(u.inH); setBus(u.bus, null) }
      }
      if (u.snap !== null && !rlg.isWorking() && waited > 40 || waited > 400) {
        var ashOut = fluidName(u.outH) === ASH ? fluidAmount(u.outH) : 0
        note('plasma_measured', 'copies ' + (u.snap ? u.snap.parallels : 'none') + ', plasma ' + u.before + ' -> ' + fluidAmount(u.inH) + ', ash ' + ashOut + '; reasons ' + reasons(m))
        check('plasma', u.snap !== null && u.snap.parallels === 1024, 'plasma: copies ' + (u.snap ? u.snap.parallels : 'none') + ' (expected 1024)')
        check('plasma_once', u.drained === 250 && fluidAmount(u.inH) === 750, 'drained at start ' + u.drained + ' mB (expected 250, once per run), left ' + fluidAmount(u.inH))
        check('ash_out', ashOut === 250, 'helium_4_ash in the output hatch ' + ashOut + ' mB (expected 250)')
        startRun(u, STICK, 100)
        u.phase = 'short'
      }
      return
    }
    if (u.phase === 'short') {
      if (u.snap === null && rlg.isWorking()) u.snap = snapshot(m)
      if (u.snap !== null || waited > 300) {
        check('short', u.snap !== null && u.snap.parallels === 256 && fluidAmount(u.inH) === 100, 'short tank: copies ' + (u.snap ? u.snap.parallels : 'none') + ' (expected 256), plasma left ' + fluidAmount(u.inH) + ' (expected 100)')
        setBus(u.bus, null)
        u.phase = 'settle2'
        u.started = S.tick
      }
      return
    }
    if (u.phase === 'settle2') {
      if (waited < 60 || (rlg.isWorking() && waited < 600)) return
      startRun(u, POPPY, 1000)
      u.phase = 'hot'
      return
    }
    if (u.phase === 'hot') {
      if (waited < 100) return
      check('hot_refused', !rlg.isWorking() && fluidAmount(u.inH) === 1000, '14,000 K recipe with plasma: working ' + rlg.isWorking() + ', plasma left ' + fluidAmount(u.inH) + ' (expected 1000); reasons ' + reasons(m))
      u.phase = 'done'
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
  ServerEvents.customCommand('gg_test_uev_stellar_forge', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestUevForgeRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestUevForgeRequest && Date.now() - LOADED >= 10000) {
        global.ggTestUevForgeRequest = false
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
