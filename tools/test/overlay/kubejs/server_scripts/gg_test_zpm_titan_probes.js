// priority: -11524
// TEST ONLY, ZPM-B3. Command: kubejs custom_command gg_test_zpm_titan_probes
// Reserved band ONLY: X22016-22079, Z0-63; Saturn orbit Y198-214, Overworld Y98-112.
// Builds the entry probe bay and the tholin reformer in Saturn orbit and runs one real recipe in each (bay circuit 1: the haze descent,
// reformer circuit 1: tholin hydrolysis), then builds both in the Overworld and checks the same inputs make nothing
// (dimension-locked). Also checks the live recipes: one dimension condition (saturn_orbit), one circuit each.
// No manual recipe execution, no changed clock.
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestZpmTitanProbesRequest'
  var LOADED = Date.now()
  var X0 = 22016
  var ORBIT = 'grindless:saturn_orbit'
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
      Fluids: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
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
    console.info('GGTEST|zpm_titan_probes|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
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
  var ENERGY = 'gtceu:zpm_energy_input_hatch'
  var CASES = [
    { name: 'entry_probe_bay', x: X0 + 10, recipe: 'grindless:titan_entry/haze_descent', circuit: 1,
      roles: [['energy', ENERGY], ['input', 'gtceu:zpm_input_bus'], ['fluid', 'gtceu:zpm_input_hatch'], ['output', 'gtceu:zpm_output_bus'],
        ['out1', 'gtceu:zpm_output_hatch']],
      items: [['grindless:titan_entry_probe', 1]], fluidIn: ['gtceu:nitrogen', 8000],
      outFluids: {}, outItems: { 'grindless:tholin': 8, 'grindless:titan_probe_recording': 1 }, duration: 200 },
    { name: 'tholin_reformer', x: X0 + 40, recipe: 'grindless:tholin_reforming/tholin_hydrolysis', circuit: 1,
      roles: [['energy', ENERGY], ['input', 'gtceu:zpm_input_bus'], ['fluid', 'gtceu:zpm_input_hatch'], ['output', 'gtceu:zpm_output_bus'],
        ['out1', 'gtceu:zpm_output_hatch']],
      items: [['grindless:tholin', 4]], fluidIn: ['minecraft:water', 1000],
      outFluids: { 'gtceu:titan_nitriles': 1000 }, outItems: {}, duration: 200 }
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
    var roles = m.def.roles
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
    m.def.roles.forEach(function (role) {
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
    def.items.forEach(function (it, slot) { m.parts.input.getInventory().setStackInSlot(slot, Item.of(it[0], it[1])) })
    if (def.fluidIn) m.parts.fluid.tank.setFluidInTank(0, Fluid.of(def.fluidIn[0], def.fluidIn[1]).getFluidStack())
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
  function staticChecks() {
    CASES.forEach(function (def) {
      var recipe = byId(def.recipe)
      if (recipe === null) { check('live_' + def.name, false, def.recipe + ' absent'); return }
      var conditions = array(recipe.conditions)
      var dims = conditions.filter(function (c) { return String(c.getClass().getSimpleName()) === 'DimensionCondition' })
      var dimIds = dims.map(function (c) { return String(c.getDimension().location()) })
      var circuit = array(classes().Helper.getInputItems(recipe)).filter(function (st) { return classes().Circuit.isIntegratedCircuit(st) })
      check('live_' + def.name, JSON.stringify(dimIds) === JSON.stringify([ORBIT]) && dims.every(function (c) { return !c.isReverse() }) &&
        circuit.length === 1 && Number(classes().Circuit.getCircuitConfiguration(circuit[0])) === def.circuit &&
        Number(classes().Helper.getRealEUt(recipe).getTotalEU()) === 122880,
      def.recipe + '; dims=' + dimIds.join(',') + '; circuits=' + circuit.length)
    })
    ;['grindless:titan_entry/lake_sampling', 'grindless:tholin_reforming/nitrile_fibres', 'grindless:tholin_reforming/nitrile_diaminobenzidine',
      'grindless:telemetry_decoding/titan_lake_sampler', 'grindless:assembler/titan_entry_probe', 'grindless:assembler/probe_bay_casing',
      'grindless:assembly_line/entry_probe_bay', 'grindless:assembly_line/tholin_reformer'].forEach(function (id) {
      check('support_recipe', byId(id) !== null, id)
    })
  }  function finish() {
    if (S.finished) return
    S.finished = true
    S.worlds.forEach(function (world) {
      command(world.dimension, 'fill ' + X0 + ' ' + world.y0 + ' 0 ' + (X0 + 63) + ' ' + world.y1 + ' 15 minecraft:air')
      command(world.dimension, 'forceload remove ' + X0 + ' 0 ' + (X0 + 63) + ' 15')
    })
    console.info('GGTEST|zpm_titan_probes|DONE|failures=' + S.failed)
  }
  function start(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, copies: [], worlds: [] }
    staticChecks()
    S.worlds = [
      { dimension: ORBIT, y0: 198, y1: 214, y: 199, ground: false },
      { dimension: 'minecraft:overworld', y0: 98, y1: 112, y: 99, ground: true }
    ]
    S.worlds.forEach(function (world) {
      var level = server.getLevel(world.dimension)
      if (level === null) throw new Error('missing dimension ' + world.dimension)
      command(world.dimension, 'forceload add ' + X0 + ' 0 ' + (X0 + 63) + ' 15')
      command(world.dimension, 'fill ' + X0 + ' ' + world.y0 + ' 0 ' + (X0 + 63) + ' ' + world.y1 + ' 15 minecraft:air')
      CASES.forEach(function (def) {
        var m = { id: 'gtceu:' + def.name, def: def, key: def.name + (world.ground ? '_ground' : '_orbit'), dimension: world.dimension,
          level: level, x: def.x, y: world.y, ground: world.ground }
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
      m.phase = m.ground ? 'ground' : 'running'
      return
    }
    if (m.phase === 'ground') {
      if (S.tick - m.started < 80) return
      check('dimension_locked_' + m.key, nothing(produced(m)) && Number(m.ctrl.getRecipeLogic().getProgress()) === 0,
        'supplied all inputs and EU in the Overworld, no product and no progress')
      m.phase = 'done'
      return
    }
    if (m.phase === 'running') {
      var p = produced(m)
      if (complete(m, p)) {
        check('process_' + m.def.name, true, JSON.stringify(p))
        m.phase = 'done'
      } else if (S.tick - m.started > m.def.duration + 400) {
        check('process_' + m.def.name, false, 'timeout; got ' + JSON.stringify(p) + '; failures=' + String(m.ctrl.getRecipeLogic().getFailureReasons()))
        m.phase = 'done'
      }
    }
  }
  ServerEvents.customCommand('gg_test_zpm_titan_probes', function () {
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
