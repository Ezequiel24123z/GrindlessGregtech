// priority: -9124
// TEST ONLY, UV-B2. Command: kubejs custom_command gg_test_uv_neptune
// Reserved band ONLY: X26624-26687, Z0-15; Neptune orbit and Uranus orbit Y198-214, Overworld Y98-114.
// The doubt: one recipe type (ZPM's gtceu:ice_giant_siphon) shared by two machines with a split by dimension, circuit and recipe path.
//   Neptune orbit: the deep siphon runs circuit 4 (Neptune sample + scoop head -> Neptune hydrogen + helium); the sampler runs circuit 2
//     (recording + aerogel cartridge -> Triton ice core + nitrogen); ZPM's siphon, fed the same as the deep siphon, makes nothing (its veto).
//   Uranus orbit: the deep siphon, fed ZPM's circuit 1 inputs, makes nothing (it runs only the Neptune rows); ZPM's siphon still runs them.
//   Overworld: the deep siphon and the sampler make nothing (dimension-locked).
// Also checks the live recipes: one dimension condition, one circuit, real EU/t. No manual recipe execution, no changed clock.
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestUvNeptuneRequest'
  var LOADED = Date.now()
  var X0 = 26624
  var NEPTUNE = 'grindless:neptune_orbit'
  var URANUS = 'grindless:uranus_orbit'
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
    console.info('GGTEST|uv_neptune|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
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
  var ENERGY = 'gtceu:uv_energy_input_hatch'
  var SIPHON_ROLES = [['energy', ENERGY], ['input', 'gtceu:uv_input_bus'], ['out1', 'gtceu:uv_output_hatch'], ['out2', 'gtceu:uv_output_hatch']]
  var NEPTUNE_FEED = ['grindless:neptune_sample', 'grindless:scoop_head']
  var URANUS_FEED = ['grindless:saturn_interior_model', 'grindless:scoop_head']
  var DEEP = { name: 'neptune_deep_siphon', roles: SIPHON_ROLES, duration: 100 }
  var SAMPLER = { name: 'triton_geyser_sampler', duration: 200,
    roles: [['energy', ENERGY], ['input', 'gtceu:uv_input_bus'], ['output', 'gtceu:uv_output_bus'], ['out1', 'gtceu:uv_output_hatch']] }
  var ZPM_SIPHON = { name: 'ice_giant_siphon', roles: SIPHON_ROLES, duration: 100 }
  // expect: 'run' (outputs at least outFluids / outItems) or 'none' (no product, no progress after 80 ticks)
  var WORLDS = [
    { dimension: NEPTUNE, tag: 'neptune', y0: 198, y1: 214, y: 199, cases: [
      { m: DEEP, x: X0 + 10, circuit: 4, items: NEPTUNE_FEED, expect: 'run',
        outFluids: { 'gtceu:neptune_hydrogen': 16000, 'gtceu:neptune_helium': 4000 }, outItems: {} },
      { m: SAMPLER, x: X0 + 30, circuit: 2, items: ['grindless:triton_probe_recording', 'grindless:aerogel_cartridge'], expect: 'run',
        outFluids: { 'gtceu:triton_nitrogen': 2000 }, outItems: { 'grindless:triton_ice_core': 1 } },
      { m: ZPM_SIPHON, x: X0 + 50, circuit: 4, items: NEPTUNE_FEED, expect: 'none', why: 'zpm_siphon_refuses_neptune_rows' }
    ] },
    { dimension: URANUS, tag: 'uranus', y0: 198, y1: 214, y: 199, cases: [
      { m: DEEP, x: X0 + 10, circuit: 1, items: URANUS_FEED, expect: 'none', why: 'deep_siphon_refuses_uranus_rows' },
      { m: ZPM_SIPHON, x: X0 + 50, circuit: 1, items: URANUS_FEED, expect: 'run',
        outFluids: { 'gtceu:uranus_hydrogen': 8000, 'gtceu:helium': 2000 }, outItems: {} }
    ] },
    { dimension: 'minecraft:overworld', tag: 'overworld', y0: 98, y1: 114, y: 99, cases: [
      { m: DEEP, x: X0 + 10, circuit: 4, items: NEPTUNE_FEED, expect: 'none', why: 'dimension_locked' },
      { m: SAMPLER, x: X0 + 30, circuit: 2, items: ['grindless:triton_probe_recording', 'grindless:aerogel_cartridge'], expect: 'none',
        why: 'dimension_locked' }
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
    m.outHatches = ['out1', 'out2'].filter(function (k) { return m.parts[k] }).map(function (k) { return m.parts[k] })
  }
  function feed(m) {
    var def = m.def
    empty(m.parts.input)
    if (m.parts.output) empty(m.parts.output)
    m.parts.input.getCircuitInventory().setStackInSlot(0, classes().Circuit.stack(def.circuit))
    def.items.forEach(function (id, slot) { m.parts.input.getInventory().setStackInSlot(slot, Item.of(id, 1)) })
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
  function live(id, dim, circuitNo, eut) {
    var recipe = byId(id)
    if (recipe === null) { check('live', false, id + ' absent'); return }
    var conditions = array(recipe.conditions)
    var dims = conditions.filter(function (c) { return String(c.getClass().getSimpleName()) === 'DimensionCondition' })
    var dimIds = dims.map(function (c) { return String(c.getDimension().location()) })
    var circuit = array(classes().Helper.getInputItems(recipe)).filter(function (st) { return classes().Circuit.isIntegratedCircuit(st) })
    var real = Number(classes().Helper.getRealEUt(recipe).getTotalEU())
    check('live', JSON.stringify(dimIds) === JSON.stringify([dim]) && dims.every(function (c) { return !c.isReverse() }) &&
      circuit.length === 1 && Number(classes().Circuit.getCircuitConfiguration(circuit[0])) === circuitNo && real === eut,
    id + '; dims=' + dimIds.join(',') + '; circuits=' + circuit.length + '; eut=' + real)
  }
  function staticChecks() {
    live('grindless:ice_giant_siphon/neptune_deep_hydrogen', NEPTUNE, 4, UV_VA)
    live('grindless:ice_giant_siphon/neptune_deep_ices', NEPTUNE, 5, UV_VA)
    live('grindless:triton_plume/triton_geyser_nitrogen', NEPTUNE, 1, UV_VA)
    live('grindless:triton_plume/triton_geyser_ice_core', NEPTUNE, 2, UV_VA)
    live('grindless:cryogenic_isotope_separation/neptune_deuterium', 'grindless:saturn_orbit', 4, ZPM_VA)
    live('grindless:ice_giant_siphon/uranus_hydrogen', URANUS, 1, ZPM_VA)
    live('grindless:ice_giant_siphon/uranus_ices', URANUS, 2, ZPM_VA)
    live('grindless:ice_giant_siphon/diamond_rain', URANUS, 3, ZPM_VA)
    live('grindless:ice_giant_siphon/atmosphere_sample', URANUS, 4, ZPM_VA)
    ;['grindless:assembly_line/neptune_deep_siphon', 'grindless:assembly_line/triton_geyser_sampler'].forEach(function (id) {
      check('support_recipe', byId(id) !== null, id)
    })
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    S.worlds.forEach(function (world) {
      command(world.dimension, 'fill ' + X0 + ' ' + world.y0 + ' 0 ' + (X0 + 63) + ' ' + world.y1 + ' 15 minecraft:air')
      command(world.dimension, 'forceload remove ' + X0 + ' 0 ' + (X0 + 63) + ' 15')
    })
    console.info('GGTEST|uv_neptune|DONE|failures=' + S.failed)
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
  ServerEvents.customCommand('gg_test_uv_neptune', function () {
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
