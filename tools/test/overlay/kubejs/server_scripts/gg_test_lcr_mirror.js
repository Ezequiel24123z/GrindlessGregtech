// priority: -3074
// TEST ONLY, FIX-LCR (integration/lcr_mirror.js). Command: kubejs custom_command gg_test_lcr_mirror
// Band ONLY: X 49792-49855, Z 0-63, Overworld Y 98-115.
//   mirror     every chemical_reactor recipe of the live manager has its large_chemical_reactor copy (same duration, EU/t, entry counts)
//   bypasses   the orphan copies and N2O4 from ammonia are gone; the explicit nitric acid recipe, Kroll and EDC cracking are there
//   run        a formed HV Coil Chemical Plant (type gtceu:large_chemical_reactor) runs grindless:large_chemical_reactor/edc_cracking to its output
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 49792
  var X1 = 49855
  var Y0 = 98
  var Y1 = 115
  var NAME = 'lcr_mirror'
  var PLANT = 'gtceu:coil_chemical_plant'
  var EDC = 'grindless:large_chemical_reactor/edc_cracking'
  var GONE = [
    'gtceu:large_chemical_reactor/vinyl_chloride_from_chlorine',
    'gtceu:large_chemical_reactor/vinyl_chloride_from_ethane',
    'gtceu:large_chemical_reactor/tetrafluoroethylene_from_chloroform',
    'gtceu:chemical_reactor/dinitrogen_tetroxide_from_ammonia',
    'gtceu:large_chemical_reactor/dinitrogen_tetroxide_from_ammonia'
  ]
  var THERE = [
    EDC,
    'grindless:large_chemical_reactor/nitric_acid_from_ammonia',
    'grindless:large_chemical_reactor/kroll_chlorination_chemical_reactor',
    'gtceu:large_chemical_reactor/dinitrogen_tetroxide_from_dioxide'
  ]

  function classes() {
    if (C !== null) return C
    C = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Forge: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
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
  function put(x, y, z, block) {
    if (x < X0 || x > X1 || z < 0 || z > 63 || y < Y0 || y > Y1) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return command('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function machine(p) { return classes().Meta.getMachine(S.level, p) }
  function partsLike(ctrl, re) {
    var out = []
    array(ctrl.getParts()).forEach(function (p) { if (re.test(String(p.getDefinition().getId()))) out.push(p) })
    return out
  }
  function topUp(list) { list.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }) }
  function empty() { return Fluid.of('minecraft:water', 0).getFluidStack() }

  // ---------------------------------------------------------------- the recipe set

  function sig(r) {
    var K = classes()
    var eu = r.getInputEUt()
    var parts = [Number(r.duration), Number(eu.voltage()) * Number(eu.amperage())]
    ;[r.inputs, r.outputs].forEach(function (map) {
      ;[K.ItemCap, K.FluidCap].forEach(function (cap) {
        var l = map.get(cap)
        parts.push(l === null || l === undefined ? 0 : array(l).length)
      })
    })
    return parts.join('/')
  }

  function recipeChecks() {
    var all = {}
    array(S.server.getRecipeManager().getRecipes()).forEach(function (r) { all[String(r.getId())] = r })
    var cr = 0
    var missing = []
    var differ = []
    Object.keys(all).forEach(function (id) {
      var m = /^([^:]+):chemical_reactor\/(.+)$/.exec(id)
      if (!m) return
      cr++
      var twin = all[m[1] + ':large_chemical_reactor/' + m[2]]
      if (!twin) { missing.push(id); return }
      if (String(twin.getType()).indexOf('large_chemical_reactor') < 0) differ.push(id + ' type ' + twin.getType())
      else if (sig(twin) !== sig(all[id])) differ.push(id + ' ' + sig(all[id]) + ' vs ' + sig(twin))
    })
    check('mirror', cr > 0 && missing.length === 0 && differ.length === 0, cr + ' chemical reactor recipes; without a copy ' + missing.length + ' [' + missing.slice(0, 8).join(', ') + ']; different ' +
      differ.length + ' [' + differ.slice(0, 5).join('; ') + ']')
    var L = global.grindless.lcrMirror
    check('published', !!L && L.done === true && L.failed.length === 0, L ? 'added ' + L.added.length + ', replaced ' + L.replaced.length + ', removed ' + L.removed.length + ', kept ' + L.kept.length +
      ', explicit ' + L.explicit.length + ', failed ' + L.failed.length : 'global.grindless.lcrMirror missing')
    if (L) note('removed_ids', L.removed.join(', '))
    var stillThere = GONE.filter(function (id) { return !!all[id] })
    check('bypasses_gone', stillThere.length === 0, 'still live: ' + stillThere.join(', '))
    var absent = THERE.filter(function (id) { return !all[id] })
    check('routes_present', absent.length === 0, 'absent: ' + absent.join(', '))
  }

  // ---------------------------------------------------------------- the plant

  function placePlant() {
    var desc = global.grindless.patterns.describe(PLANT)
    if (!desc) throw new Error('no structure description for ' + PLANT)
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
    var front = ['gtceu:maintenance_hatch', 'gtceu:ev_energy_input_hatch', 'gtceu:hv_input_bus', 'gtceu:hv_output_bus']
    var behind = ['gtceu:hv_input_hatch', 'gtceu:hv_output_hatch']
    var controller = null
    cells.forEach(function (c) {
      c.x = 49824 - (c.ci - ctrl.ci)
      c.y = 101 + (c.ri - ctrl.ri)
      c.z = 12 - (c.si - ctrl.si)
    })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var isPart = false
      if (sym.kind === 'controller') block = PLANT
      else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      else if (sym.kind === 'blocks') block = c.ch === 'K' ? 'gtceu:cupronickel_coil_block' : sym.blocks[0]
      else if (sym.kind === 'oneOf') {
        var wanted = null
        if (c.ri === 0 && c.si === last) wanted = front[c.ci]
        else if (c.ri === 0 && c.si === last - 1) wanted = behind[c.ci]
        if (wanted) { block = wanted; isPart = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      put(c.x, c.y, c.z, block + (isPart ? '[facing=north]' : ''))
    })
    put(controller.x, controller.y, controller.z, PLANT + '[facing=north]')
    return pos(controller.x, controller.y, controller.z)
  }

  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }

  function fluidIn(hatches, id) {
    var n = 0
    hatches.forEach(function (h) {
      for (var i = 0; i < Number(h.tank.getTanks()); i++) {
        var fs = h.tank.getFluidInTank(i)
        if (!fs.isEmpty() && String(classes().Forge.FLUIDS.getKey(fs.getFluid())) === id) n += Number(fs.getAmount())
      }
    })
    return n
  }

  function tickPlant() {
    var m = machine(S.pos)
    var waited = S.tick - S.started
    if (S.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check('formed', false, m ? 'not formed: ' + why(m) : 'no controller'); S.phase = 'done' }
        return
      }
      S.energy = partsLike(m, /energy_input_hatch/)
      S.bus = partsLike(m, /input_bus/)[0]
      S.hin = partsLike(m, /:hv_input_hatch$/)
      S.hout = partsLike(m, /:hv_output_hatch$/)
      var types = String(m.getRecipeType().registryName)
      check('formed', !!S.bus && S.hin.length > 0 && S.hout.length > 0 && S.energy.length === 1 && types === 'gtceu:large_chemical_reactor',
        'type ' + types + ', input hatches ' + S.hin.length + ', output hatches ' + S.hout.length)
      if (!S.bus || S.hin.length === 0 || S.hout.length === 0 || S.energy.length !== 1) { S.phase = 'done'; return }
      m.setBatchEnabled(false)
      S.bus.getCircuitInventory().setStackInSlot(0, classes().Circuit.stack(1))
      S.hin[0].tank.setFluidInTank(0, Fluid.of('gtceu:dichloroethane', 8000).getFluidStack())
      topUp(S.energy)
      m.getRecipeLogic().updateTickSubscription()
      S.phase = 'run'
      S.started = S.tick
      return
    }
    topUp(S.energy)
    if (S.phase === 'run') {
      var rl = m.getRecipeLogic()
      if (S.seen === undefined && rl.isWorking()) {
        var rec = rl.getLastRecipe()
        S.seen = rec ? String(rec.id) : ''
      }
      var out = fluidIn(S.hout, 'gtceu:vinyl_chloride')
      if (out > 0 || waited > 900) {
        check('runs', out > 0 && S.seen === EDC, 'recipe run ' + S.seen + ', vinyl chloride in the output hatch ' + out + ' mB, dichloroethane left ' + fluidIn(S.hin, 'gtceu:dichloroethane') +
          '; reasons ' + String(rl.getFailureReasons()))
        S.phase = 'done'
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
    S = { server: server, tick: 0, failed: 0, finished: false, phase: 'done' }
    S.level = server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { recipeChecks() } catch (e) { check('recipes_exception', false, errText(e)) }
    try {
      S.pos = placePlant()
      S.phase = 'forming'
      S.started = 0
    } catch (e) { check('place_exception', false, errText(e)) }
  }
  ServerEvents.customCommand('gg_test_lcr_mirror', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestLcrMirrorRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestLcrMirrorRequest && Date.now() - LOADED >= 10000) {
        global.ggTestLcrMirrorRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      if (S.phase !== 'done') {
        try { tickPlant() } catch (e) { check('plant_exception', false, 'phase ' + S.phase + ': ' + errText(e)); S.phase = 'done' }
      }
      if (S.phase === 'done') finish()
      else if (S.tick > 1800) { check('deadline', false, '1800-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
