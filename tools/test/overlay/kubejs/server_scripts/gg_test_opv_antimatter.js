// priority: -6249
// TEST ONLY, OpV-B3a. Command: kubejs custom_command gg_test_opv_antimatter.
// Band: X 38848-38911, Z 0-63, Y 98-115, Overworld and Nether.
// Observe the first 1200 ticks of the real pellet row, not its full priced duration.
// A separate one-tick copy tests native 1/16 tile wear over 16 starts without
// changing the shipped fuel row. The integrator runs this in the grouped OpV set.
(function () {
  var NAME = 'opv_antimatter'
  var X0 = 38848
  var X1 = 38911
  var HOME = 'minecraft:overworld'
  var AWAY = 'minecraft:the_nether'
  var EUT = 1073741824
  var REAL = 'grindless:annihilation_power/burn_pellet'
  var S = null
  var C = null
  var LOADED = Date.now()
  var UNITS = [
    { name: 'engine', dim: HOME, cx: 38216, dynamo: 'gtceu:opv_energy_output_hatch_4a', mode: 'run' },
    { name: 'wear', dim: HOME, cx: 38236, dynamo: 'gtceu:opv_energy_output_hatch_4a', mode: 'wear' },
    { name: 'lower_hatch', dim: HOME, cx: 38256, dynamo: 'gtceu:uxv_energy_output_hatch_16a', mode: 'refuse' },
    { name: 'away', dim: AWAY, cx: 38216, dynamo: 'gtceu:opv_energy_output_hatch_4a', mode: 'refuse' }
  ]
  function classes() {
    if (C === null) C = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      List: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
    }
    return C
  }
  function array(xs) {
    var list = new (classes().List)(xs)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' +
      String(detail).replace(/[\r\n|]/g, ' ').substring(0, 1400))
  }
  function command(dim, text) { return S.server.runCommandSilent('execute in ' + dim + ' run ' + text) }
  function put(dim, x, y, z, block) {
    if (x < X0 || x > X1 || y < 98 || y > 115 || z < 0 || z > 63) throw new Error('outside assigned band: ' + x + ',' + y + ',' + z)
    command(dim, 'setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function parts(ctrl, re) {
    return array(ctrl.getParts()).filter(function (p) { return re.test(String(p.getDefinition().getId())) })
  }
  function count(bus, id) {
    var inv = bus.getInventory().storage
    var n = 0
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (!st.isEmpty() && String(classes().Registries.ITEMS.getKey(st.getItem())) === id) n += Number(st.getCount())
    }
    return n
  }
  function fillBus(u) {
    var inv = u.bus.getInventory().storage
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.of('minecraft:air'))
    u.bus.getCircuitInventory().setStackInSlot(0, classes().Circuit.stack(u.mode === 'wear' ? 32 : 2))
    if (u.mode === 'wear') {
      inv.setStackInSlot(0, Item.of('minecraft:paper', 16))
      inv.setStackInSlot(1, Item.of('grindless:gamma_absorber_tile', 2))
    } else {
      inv.setStackInSlot(0, Item.of('grindless:acmf_pellet'))
      inv.setStackInSlot(1, Item.of('grindless:antiproton_stack_opv'))
      inv.setStackInSlot(2, Item.of('grindless:gamma_absorber_tile', 2))
    }
    u.m.getRecipeLogic().updateTickSubscription()
  }
  function place(u) {
    var d = global.grindless.patterns.describe('gtceu:annihilation_engine')
    if (!d) throw new Error('no annihilation engine pattern')
    var cells = []
    var ctrl = null
    d.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = d.symbols[row.charAt(ci)]
          if (!sym) continue
          var c = { si: si, ri: ri, ci: ci, sym: sym }
          if (sym.kind === 'controller') ctrl = c
          cells.push(c)
        }
      })
    })
    if (!ctrl) throw new Error('no controller in description')
    var xs = []
    cells.forEach(function (c) {
      c.x = u.cx - (c.ci - ctrl.ci)
      c.y = 104 + c.ri - ctrl.ri
      c.z = 8 - (c.si - ctrl.si)
      if (c.sym.kind === 'oneOf') xs.push(c)
    })
    xs.sort(function (a, b) { return a.z - b.z || a.x - b.x })
    var ids = [u.dynamo, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus', 'gtceu:hv_input_hatch']
    var chosen = {}
    ids.forEach(function (id, i) { chosen[Math.floor(i * (xs.length - 1) / (ids.length - 1))] = id })
    xs.forEach(function (c, i) { c.part = chosen[i] || null })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = c.part
      if (sym.kind === 'controller') return
      if (sym.kind === 'blocks') block = sym.blocks[0]
      else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      else if (sym.kind === 'oneOf' && !block) {
        sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (block) put(u.dim, c.x, c.y, c.z, block + (c.part ? '[facing=north]' : ''))
    })
    put(u.dim, u.cx, 104, 8, 'gtceu:annihilation_engine[facing=north]')
    return new (classes().Pos)(u.cx, 104, 8)
  }
  function nativeWear(recipe, input, id) {
    var c = classes()
    var content = array(input ? recipe.getInputContents(c.ItemCap) : recipe.getOutputContents(c.ItemCap))
    var stacks = array(input ? c.Helper.getInputItems(recipe) : c.Helper.getOutputItems(recipe))
    var result = []
    stacks.forEach(function (st, i) {
      if (String(c.Registries.ITEMS.getKey(st.getItem())) === id) result.push(Number(content[i].chance))
    })
    return result
  }
  function tick(u) {
    var elapsed = S.tick - u.started
    if (u.phase === 'forming') {
      var m = classes().Meta.getMachine(S.server.getLevel(u.dim), u.pos)
      if (m && !m.isFormed() && elapsed >= 100 && elapsed % 50 === 0 && m.checkPatternWithLock()) {
        m.setFlipped(m.getMultiblockState().isNeededFlip())
        m.onStructureFormed()
      }
      if (!m || !m.isFormed()) {
        if (elapsed > 400) throw new Error('engine did not form in ' + u.dim)
        return
      }
      u.m = m
      u.bus = parts(m, /input_bus/)[0]
      u.out = parts(m, /output_bus/)[0]
      u.dynamoPart = parts(m, /energy_output_hatch/)[0]
      if (!u.bus || !u.out || !u.dynamoPart) throw new Error('missing engine bus or dynamo')
      check(u.name + '_formed', true, u.dim + ' with ' + u.dynamo)
      u.sum = 0
      u.max = 0
      u.started = S.tick
      u.phase = 'working'
      fillBus(u)
      return
    }
    var logic = u.m.getRecipeLogic()
    if (u.mode === 'refuse') {
      if (S.tick - u.started < 120) return
      var real = S.server.getRecipeManager().byKey(new (classes().RL)(REAL)).get()
      check(u.name + '_cached_start', !global.grindless.opvAntimatter.engineBeforeWorking(u.m, real),
        'beforeWorking rejects the real recipe, including the cached-start path')
      check(u.name + '_refused', String(logic.getStatus()) !== 'WORKING' &&
        count(u.bus, 'grindless:acmf_pellet') === 1 && count(u.bus, 'grindless:antiproton_stack_opv') === 1,
        'status ' + logic.getStatus() + '; no fuel consumed')
      u.phase = 'done'
      return
    }
    var energy = u.dynamoPart.energyContainer
    var stored = Number(energy.getEnergyStored())
    u.max = Math.max(u.max, stored)
    var progress = Number(logic.getProgress())
    if (u.mode === 'wear' || progress >= 5) {
      u.sum += stored
      energy.setEnergyStored(0)
    }
    if (u.mode === 'wear') {
      if (count(u.bus, 'minecraft:paper') === 0 && String(logic.getStatus()) !== 'WORKING') {
        check('wear_16_starts', count(u.bus, 'grindless:gamma_absorber_tile') === 1 &&
          count(u.out, 'grindless:activated_absorber_tile') === 1,
          'one tile consumed and one activated over 16 native one-tick copies of the real wear entries')
        u.phase = 'done'
      } else if (S.tick - u.started > 400) throw new Error('wear probe did not finish 16 starts')
      return
    }
    if (String(logic.getStatus()) === 'WORKING') {
      var last = logic.getLastRecipe()
      if (!u.checked) {
        u.checked = true
        var expected = global.grindless.opvAntimatter.recipes.filter(function (r) { return r.name === 'burn_pellet' })[0]
        check('real_row', String(last.id) === REAL && Number(last.duration) === expected.duration && Number(last.parallels) === 1 &&
          Number(classes().Helper.getRealEUtWithIO(last).getTotalEU()) === EUT,
          last.id + ': ' + last.duration + ' ticks at ' + EUT + ' EU/t')
        check('real_wear', String(nativeWear(last, true, 'grindless:gamma_absorber_tile')) === '625' &&
          String(nativeWear(last, false, 'grindless:activated_absorber_tile')) === '625',
          'native input and output wear both 625/10000')
      }
      if (progress >= 1200) {
        check('long_output_1200', u.max > 2147483647 && u.sum >= EUT * 1199 && u.sum <= EUT * 1202,
          'first 1200 ticks: drained ' + u.sum + ' EU; maximum stored ' + u.max + '; progress ' + progress)
        u.m.setWorkingEnabled(false)
        u.phase = 'done'
      }
    } else if (u.checked || S.tick - u.started > 300) throw new Error('real row stopped or never started: ' + logic.getStatus())
  }
  function clear(dim) {
    for (var z = 0; z < 64; z += 8) command(dim, 'fill ' + X0 + ' 98 ' + z + ' ' + X1 + ' 115 ' + (z + 7) + ' minecraft:air')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    ;[HOME, AWAY].forEach(function (dim) {
      try {
        clear(dim)
        command(dim, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
      } catch (e) { check('cleanup', false, String(e)) }
    })
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, units: [] }
    var real = server.getRecipeManager().byKey(new (classes().RL)(REAL))
    check('lookup', real.isPresent(), REAL)
    ;[HOME, AWAY].forEach(function (dim) {
      if (!server.getLevel(dim)) throw new Error('missing test level ' + dim)
      command(dim, 'forceload add ' + X0 + ' 0 ' + X1 + ' 63')
      clear(dim)
    })
    UNITS.forEach(function (def) {
      var u = { name: def.name, dim: def.dim, cx: def.cx, dynamo: def.dynamo, mode: def.mode, phase: 'forming', started: 0 }
      u.pos = place(u)
      S.units.push(u)
    })
  }
  ServerEvents.recipes(function (event) {
    var row = global.grindless.opvAntimatter.recipes.filter(function (r) { return r.name === 'burn_pellet' })[0]
    if (!row) throw new Error('OpV antimatter wear probe needs the real pellet row')
    var input = row.wear[0]
    var output = row.chanceOut.filter(function (r) { return r.id === 'grindless:activated_absorber_tile' })[0]
    event.recipes.gtceu.annihilation_power('gg_test:opv_tile_wear')
      .itemInputs('minecraft:paper').circuit(32)
      .chancedInput(input.count + 'x ' + input.id, input.chance, 0)
      .chancedOutput(output.count + 'x ' + output.id, output.chance, 0)
      .dimension(HOME).EUt(-row.eut).duration(1)
  })
  ServerEvents.customCommand('gg_test_opv_antimatter', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestOpvAntimatterRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvAntimatterRequest && Date.now() - LOADED >= 10000) {
        global.ggTestOpvAntimatterRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var pending = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try { tick(u) } catch (e) { check(u.name + '_exception', false, String(e)); u.phase = 'done' }
        if (u.phase !== 'done') pending++
      })
      if (!pending) finish()
      else if (S.tick > 2200) { check('deadline', false, '2200-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, String(e))
      finish()
    }
  })
})()
