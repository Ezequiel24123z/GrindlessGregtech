// priority: -9224
// TEST ONLY, UV-B3. Command: kubejs custom_command gg_test_uv_pluto_ices
// Reserved band ONLY: X26880-26943, Z0-15; Pluto orbit Y198-214, Overworld Y98-114.
// The doubt: two new dimension-locked types and a dimension-locked row added to an older HV type (the syngas plant's circuit 5).
//   Pluto orbit: the penetrator bay runs circuit 1 (penetrator + Triton ice core kept -> Sputnik ice core); the fractionator runs circuit 1
//     (Sputnik ice core -> nitrogen + CO + methane + tholin); the HV syngas plant runs circuit 5 (CO + water + catalyst -> hydrogen + CO2).
//   Overworld: the bay and the syngas plant's circuit 5 make nothing (dimension-locked).
// Also checks the live recipes: one dimension condition, one circuit, real EU/t; the older shift row has no dimension condition.
// No manual recipe execution, no changed clock.
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestUvPlutoIcesRequest'
  var LOADED = Date.now()
  var X0 = 26880
  var PLUTO = 'grindless:pluto_orbit'
  var UV_VA = 491520
  var ZPM_VA = 122880
  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
      Items: Java.loadClass('net.minecraft.world.item.ItemStack'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
    }
    return C
  }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|uv_pluto_ices|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
  }
  function byId(id) {
    var found = S.server.getRecipeManager().byKey(new (classes().RL)(id))
    return found.isPresent() ? found.get() : null
  }
  function command(dimension, text) {
    return S.server.runCommandSilent('execute in ' + dimension + ' run ' + text)
  }
  function machine(m, p) {
    return classes().Meta.getMachine(m.level, new (classes().Pos)(p.x, p.y, p.z))
  }
  function setBlock(m, p, id) {
    command(m.dimension, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + ' replace')
  }
  function itemId(stack) { return String(classes().Registries.ITEMS.getKey(stack.getItem())) }
  function inventory(bus) {
    var inv = bus.getInventory()
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var stack = inv.getStackInSlot(i)
      if (!stack.isEmpty()) counts[itemId(stack)] = (counts[itemId(stack)] || 0) + Number(stack.getCount())
    }
    return counts
  }
  function empty(bus) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, classes().Items.EMPTY)
  }
  function fluidsOf(hatches) {
    var out = {}
    hatches.forEach(function (h) {
      var fs = h.tank.getFluidInTank(0)
      if (!fs.isEmpty()) {
        var id = String(classes().Registries.FLUIDS.getKey(fs.getFluid()))
        out[id] = (out[id] || 0) + Number(fs.getAmount())
      }
    })
    return out
  }
  function plain(symbol) {
    if (symbol.kind === 'oneOf') return plain(symbol.options[0])
    if (symbol.kind === 'blocks') return symbol.blocks[0]
    if (symbol.kind === 'frames') return 'gtceu:' + symbol.materials[0] + '_frame'
    if (symbol.kind === 'air') return 'minecraft:air'
    throw new Error('unhandled structure symbol ' + symbol.kind)
  }
  var UV_ENERGY = 'gtceu:uv_energy_input_hatch'
  var BAY = { name: 'penetrator_probe_bay', duration: 200,
    roles: [['energy', UV_ENERGY], ['input', 'gtceu:uv_input_bus'], ['output', 'gtceu:uv_output_bus']] }
  var FRACTIONATOR = { name: 'volatile_ice_fractionator', duration: 600,
    roles: [['energy', UV_ENERGY], ['input', 'gtceu:uv_input_bus'], ['output', 'gtceu:uv_output_bus'], ['out1', 'gtceu:uv_output_hatch'],
      ['out2', 'gtceu:uv_output_hatch'], ['out3', 'gtceu:uv_output_hatch']] }
  var SYNGAS = { name: 'syngas_plant', duration: 80,
    roles: [['energy', 'gtceu:hv_energy_input_hatch'], ['input', 'gtceu:hv_input_bus'], ['output', 'gtceu:hv_output_bus'],
      ['in1', 'gtceu:hv_input_hatch'], ['in2', 'gtceu:hv_input_hatch'], ['out1', 'gtceu:hv_output_hatch'], ['out2', 'gtceu:hv_output_hatch']] }
  var PENETRATOR_FEED = ['grindless:triton_ice_core', 'grindless:penetrator_probe']
  var SHIFT_FLUIDS = { 'gtceu:carbon_monoxide': 2000, 'minecraft:water': 2000 }
  // expect: 'run' (outputs at least outFluids / outItems) or 'none' (no product, no progress after 80 ticks)
  var WORLDS = [
    { dimension: PLUTO, tag: 'pluto', y0: 198, y1: 214, y: 199, cases: [
      { m: BAY, x: X0 + 10, circuit: 1, items: PENETRATOR_FEED, fluids: {}, expect: 'run',
        outFluids: {}, outItems: { 'grindless:sputnik_ice_core': 1 } },
      { m: FRACTIONATOR, x: X0 + 25, circuit: 1, items: ['grindless:sputnik_ice_core'], fluids: {}, expect: 'run',
        outFluids: { 'gtceu:nitrogen': 16000, 'gtceu:carbon_monoxide': 2000, 'gtceu:methane': 1000 }, outItems: { 'grindless:tholin': 1 } },
      { m: SYNGAS, x: X0 + 45, circuit: 5, items: ['grindless:shift_catalyst'], fluids: SHIFT_FLUIDS, expect: 'run',
        outFluids: { 'gtceu:hydrogen': 4000, 'gtceu:carbon_dioxide': 2000 }, outItems: {} }
    ] },
    { dimension: 'minecraft:overworld', tag: 'overworld', y0: 98, y1: 114, y: 99, cases: [
      { m: BAY, x: X0 + 10, circuit: 1, items: PENETRATOR_FEED, fluids: {}, expect: 'none', why: 'dimension_locked' },
      { m: SYNGAS, x: X0 + 45, circuit: 5, items: ['grindless:shift_catalyst'], fluids: SHIFT_FLUIDS, expect: 'none',
        why: 'pluto_shift_dimension_locked' }
    ] }
  ]
  function place(m) {
    var desc = global.grindless.patterns.describe(m.id)
    var origin = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        var ci = row.indexOf('S')
        if (ci >= 0) origin = { si: si, ri: ri, ci: ci }
      })
    })
    if (origin === null) throw new Error('no controller: ' + m.id)
    var next = 0
    var roles = m.def.m.roles
    m.positions = {}
    var controller = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var p = { x: m.x - (ci - origin.ci), y: m.y + ri - origin.ri, z: 2 + origin.si - si }
          var id
          if (ch === 'S') { controller = p; continue }
          if (ch === 'X' && next < roles.length) {
            m.positions[roles[next][0]] = p
            id = roles[next++][1]
          } else id = plain(desc.symbols[ch])
          setBlock(m, p, id + (id.indexOf('_hatch') >= 0 || id.indexOf('_bus') >= 0 ? '[facing=north]' : ''))
        }
      })
    })
    m.positions.controller = controller
    setBlock(m, controller, m.id + '[facing=north]')
    m.phase = 'forming'
    m.started = S.tick
  }
  function parts(m) {
    m.ctrl = machine(m, m.positions.controller)
    m.parts = {}
    m.def.m.roles.forEach(function (role) {
      m.parts[role[0]] = machine(m, m.positions[role[0]])
      if (m.parts[role[0]] === null) throw new Error('missing part ' + role[0])
    })
    m.outHatches = ['out1', 'out2', 'out3'].filter(function (k) { return m.parts[k] }).map(function (k) { return m.parts[k] })
  }
  function feed(m) {
    var def = m.def
    empty(m.parts.input)
    if (m.parts.output) empty(m.parts.output)
    m.parts.input.getCircuitInventory().setStackInSlot(0, classes().Circuit.stack(def.circuit))
    def.items.forEach(function (id, slot) { m.parts.input.getInventory().setStackInSlot(slot, Item.of(id, 1)) })
    Object.keys(def.fluids).forEach(function (id, k) {
      m.parts['in' + (k + 1)].tank.setFluidInTank(0, Fluid.of(id, def.fluids[id]).getFluidStack())
    })
    m.started = S.tick
    m.ctrl.getRecipeLogic().updateTickSubscription()
  }
  function produced(m) {
    var items = m.parts.output ? inventory(m.parts.output) : {}
    var fluids = fluidsOf(m.outHatches)
    return { items: items, fluids: fluids }
  }
  function nothing(p) { return Object.keys(p.items).length === 0 && Object.keys(p.fluids).length === 0 }
  function complete(m, p) {
    var ok = true
    Object.keys(m.def.outFluids).forEach(function (id) { if ((p.fluids[id] || 0) < m.def.outFluids[id]) ok = false })
    Object.keys(m.def.outItems).forEach(function (id) { if ((p.items[id] || 0) < m.def.outItems[id]) ok = false })
    return ok
  }
  function dimsOf(recipe) {
    return array(recipe.conditions).filter(function (c) { return String(c.getClass().getSimpleName()) === 'DimensionCondition' })
  }
  function live(id, dim, circuitNo, eut) {
    var recipe = byId(id)
    if (recipe === null) { check('live', false, id + ' absent'); return }
    var dims = dimsOf(recipe)
    var dimIds = dims.map(function (c) { return String(c.getDimension().location()) })
    var circuit = array(classes().Helper.getInputItems(recipe)).filter(function (st) { return classes().Circuit.isIntegratedCircuit(st) })
    var real = Number(classes().Helper.getRealEUt(recipe).getTotalEU())
    check('live', JSON.stringify(dimIds) === JSON.stringify([dim]) && dims.every(function (c) { return !c.isReverse() }) &&
      circuit.length === 1 && Number(classes().Circuit.getCircuitConfiguration(circuit[0])) === circuitNo && real === eut,
    id + '; dims=' + dimIds.join(',') + '; circuits=' + circuit.length + '; eut=' + real)
  }
  function staticChecks() {
    live('grindless:penetrator_probe/sputnik_penetrator', PLUTO, 1, UV_VA)
    live('grindless:penetrator_probe/charon_penetrator', PLUTO, 2, UV_VA)
    live('grindless:ice_fractionation/sputnik_ice_fractionation', PLUTO, 1, ZPM_VA)
    live('grindless:ice_fractionation/charon_ice_fractionation', PLUTO, 2, ZPM_VA)
    live('grindless:syngas/hv/pluto_shift', PLUTO, 5, 480)
    var old = byId('grindless:syngas/hv/shift')
    check('old_shift_unlocked', old !== null && dimsOf(old).length === 0, 'grindless:syngas/hv/shift has no dimension condition')
    ;['grindless:crafting/penetrator_probe_bay', 'grindless:crafting/volatile_ice_fractionator', 'grindless:assembler/penetrator_probe']
      .forEach(function (id) { check('support_recipe', byId(id) !== null, id) })
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    S.worlds.forEach(function (world) {
      command(world.dimension, 'fill ' + X0 + ' ' + world.y0 + ' 0 ' + (X0 + 63) + ' ' + world.y1 + ' 15 minecraft:air')
      command(world.dimension, 'forceload remove ' + X0 + ' 0 ' + (X0 + 63) + ' 15')
    })
    console.info('GGTEST|uv_pluto_ices|DONE|failures=' + S.failed)
  }
  function start(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, copies: [], worlds: [] }
    staticChecks()
    S.worlds = WORLDS
    S.worlds.forEach(function (world) {
      var level = server.getLevel(world.dimension)
      if (level === null) throw new Error('missing dimension ' + world.dimension)
      command(world.dimension, 'forceload add ' + X0 + ' 0 ' + (X0 + 63) + ' 15')
      command(world.dimension, 'fill ' + X0 + ' ' + world.y0 + ' 0 ' + (X0 + 63) + ' ' + world.y1 + ' 15 minecraft:air')
      world.cases.forEach(function (def) {
        var m = { id: 'gtceu:' + def.m.name, def: def, key: def.m.name + '_' + world.tag, dimension: world.dimension,
          level: level, x: def.x, y: world.y }
        S.copies.push(m)
        place(m)
      })
    })
  }
  function tickCopy(m) {
    if (m.phase === 'done') return
    if (m.phase === 'forming') {
      var ctrl = machine(m, m.positions.controller)
      if (!ctrl || !ctrl.isFormed()) {
        if (S.tick - m.started > 600) { check('formed_' + m.key, false, 'formation timeout'); m.phase = 'done' }
        return
      }
      parts(m)
      check('formed_' + m.key, true, 'full design shape')
      m.phase = 'ready'
    }
    var energy = m.parts.energy.energyContainer
    energy.setEnergyStored(energy.getEnergyCapacity())
    if (m.phase === 'ready') {
      feed(m)
      m.phase = m.def.expect === 'none' ? 'idle' : 'running'
      return
    }
    if (m.phase === 'idle') {
      if (S.tick - m.started < 80) return
      check(m.def.why + '_' + m.key, nothing(produced(m)) && Number(m.ctrl.getRecipeLogic().getProgress()) === 0,
        'supplied the inputs and EU, no product and no progress; got ' + JSON.stringify(produced(m)))
      m.phase = 'done'
      return
    }
    if (m.phase === 'running') {
      var p = produced(m)
      if (complete(m, p)) {
        check('process_' + m.key, true, JSON.stringify(p))
        m.phase = 'done'
      } else if (S.tick - m.started > m.def.m.duration + 600) {
        check('process_' + m.key, false, 'timeout; got ' + JSON.stringify(p) + '; failures=' + String(m.ctrl.getRecipeLogic().getFailureReasons()))
        m.phase = 'done'
      }
    }
  }
  ServerEvents.customCommand('gg_test_uv_pluto_ices', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        start(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      S.copies.forEach(tickCopy)
      if (S.copies.every(function (m) { return m.phase === 'done' })) finish()
      else if (S.tick > 3400) { check('deadline', false, '3400-tick fixture ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, worlds: [], finished: false }
      check('exception', false, String(e))
      finish()
    }
  })
})()
