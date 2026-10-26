// TEST ONLY, LuV B3. Command: kubejs custom_command gg_test_luv_orbital_industry
// The integrated validation owner runs this with gg_test_recipe_lookup and a fresh gg_dump.
// Reserved band ONLY: X16128-16191, Z0-15; Earth orbit Y198-214, Overworld Y98-112.
// Builds both complete shapes in each world. Checks live recipes/recycling, formation, ground
// rejection, cleanroom rejection followed by a real cleaning hatch, and all six orbital outputs.
// No synthetic cleanroom, manual recipe execution, changed clock, or accelerated recipe duration.
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestLuvOrbitalIndustryRequest'
  var LOADED = Date.now()
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
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      MaterialData: Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.material.ItemMaterialData')
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
    console.info('GGTEST|luv_orbital_industry|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
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
  function parseItem(text) {
    var match = /^(\d+)x (.+)$/.exec(text)
    return { id: match ? match[2] : text, count: match ? Number(match[1]) : 1 }
  }
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
  function plain(symbol) {
    if (symbol.kind === 'oneOf') return plain(symbol.options[0])
    if (symbol.kind === 'blocks') return symbol.blocks[0]
    if (symbol.kind === 'frames') return 'gtceu:' + symbol.materials[0] + '_frame'
    if (symbol.kind === 'air') return 'minecraft:air'
    throw new Error('unhandled structure symbol ' + symbol.kind)
  }
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
    var roles = [
      ['energy', 'gtceu:luv_energy_input_hatch'], ['input', 'gtceu:luv_input_bus'],
      ['output', 'gtceu:luv_output_bus'], ['fluid', 'gtceu:luv_input_hatch']
    ]
    var next = 0
    m.positions = {}
    var controller = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var p = { x: m.x - (ci - origin.ci), y: m.y + ri - origin.ri, z: 2 + origin.si - si }
          var symbol = desc.symbols[ch]
          var id
          if (ch === 'S') { controller = p; continue }
          if (ch === 'M') {
            m.positions.maintenance = p
            id = m.cleanroomProbe ? 'gtceu:auto_maintenance_hatch' : 'gtceu:cleaning_maintenance_hatch'
          } else if (ch === 'X' && next < roles.length) {
            m.positions[roles[next][0]] = p
            id = roles[next++][1]
          } else id = plain(symbol)
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
    ;['energy', 'input', 'output', 'fluid'].forEach(function (role) {
      m.parts[role] = machine(m, m.positions[role])
      if (m.parts[role] === null) throw new Error('missing part ' + role)
    })
  }
  function feed(m, recipe) {
    empty(m.parts.input)
    empty(m.parts.output)
    m.parts.input.getCircuitInventory().setStackInSlot(0, classes().Circuit.stack(recipe.circuit))
    recipe.items.forEach(function (text, slot) {
      var item = parseItem(text)
      m.parts.input.getInventory().setStackInSlot(slot, Item.of(item.id, item.count))
    })
    m.parts.fluid.tank.setFluidInTank(0, recipe.fluids.length === 0 ? classes().Fluids.EMPTY :
      Fluid.of(recipe.fluids[0][0], recipe.fluids[0][1]).getFluidStack())
    m.current = recipe
    m.started = S.tick
    m.ctrl.getRecipeLogic().updateTickSubscription()
  }
  function staticChecks() {
    var B = global.grindless.orbitalIndustry
    B.pipeRecycling.forEach(function (id) { check('recycling_removed', byId(id) === null, id) })
    var material = classes().MaterialData.getMaterialInfo(Item.of('gtceu:normal_optical_pipe').getItem())
    check('pipe_material_info_removed', material === null, 'late recycling has no pipe material info')
    B.recipes.forEach(function (r) {
      var id = 'grindless:' + r.type + '/' + r.name
      var recipe = byId(id)
      if (recipe === null) { check('live_' + r.name, false, id + ' absent'); return }
      var conditions = array(recipe.conditions)
      var dims = conditions.filter(function (c) { return String(c.getClass().getSimpleName()) === 'DimensionCondition' })
      var dimIds = dims.map(function (c) { return String(c.getDimension().location()) }).sort()
      var allow = global.grindless.orbits.dimensions.slice().sort()
      var clean = conditions.filter(function (c) { return String(c.getClass().getSimpleName()) === 'CleanroomCondition' })
      var items = array(classes().Helper.getInputItems(recipe))
      var circuit = items.filter(function (st) { return classes().Circuit.isIntegratedCircuit(st) })
      var out = array(classes().Helper.getOutputItems(recipe))
      var expected = parseItem(r.output)
      check('live_' + r.name, Number(recipe.duration) === r.duration &&
        Number(classes().Helper.getRealEUt(recipe).getTotalEU()) === r.eut &&
        JSON.stringify(dimIds) === JSON.stringify(allow) && dims.every(function (c) { return !c.isReverse() }) &&
        clean.length === (r.cleanroom ? 1 : 0) && circuit.length === 1 &&
        Number(classes().Circuit.getCircuitConfiguration(circuit[0])) === r.circuit &&
        out.length === 1 && itemId(out[0]) === expected.id && Number(out[0].getCount()) === expected.count,
      id + '; orbits=' + dimIds.join(',') + '; cleanroom=' + clean.length)
    })
    ;['grindless:mixer/zblan', 'grindless:cutter/triple_junction_cells',
      'grindless:crafting/microgravity_smelter', 'grindless:crafting/wake_shield_facility'].forEach(function (id) {
      check('support_recipe', byId(id) !== null, id)
    })
    var glass = GTMaterials.get('zblan')
    check('zblan_no_decomposition', glass.hasFlag(GTMaterialFlags.DISABLE_DECOMPOSITION), 'glass blend must not decompose into extra elements')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    S.worlds.forEach(function (world) {
      command(world.dimension, 'fill 16128 ' + world.y0 + ' 0 16191 ' + world.y1 + ' 15 minecraft:air')
      command(world.dimension, 'forceload remove 16128 0 16191 15')
    })
    console.info('GGTEST|luv_orbital_industry|DONE|failures=' + S.failed)
  }
  function start(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, copies: [], worlds: [] }
    staticChecks()
    S.worlds = [
      { dimension: global.grindless.orbits.earth, y0: 198, y1: 214, y: 200, ground: false },
      { dimension: 'minecraft:overworld', y0: 98, y1: 112, y: 100, ground: true }
    ]
    S.worlds.forEach(function (world) {
      var level = server.getLevel(world.dimension)
      if (level === null) throw new Error('missing dimension ' + world.dimension)
      command(world.dimension, 'forceload add 16128 0 16191 15')
      command(world.dimension, 'fill 16128 ' + world.y0 + ' 0 16191 ' + world.y1 + ' 15 minecraft:air')
      global.grindless.orbitalIndustry.machines.forEach(function (def, index) {
        var m = { id: 'gtceu:' + def.name, key: def.name + (world.ground ? '_ground' : '_orbit'),
          dimension: world.dimension, level: level, x: index === 0 ? 16140 : 16172, y: world.y + (index === 0 ? 0 : 2),
          ground: world.ground, cleanroomProbe: !world.ground && index === 0, next: 0,
          recipes: global.grindless.orbitalIndustry.recipes.filter(function (r) { return r.type === def.type }) }
        S.copies.push(m)
        place(m)
      })
    })
  }
  function tickCopy(m) {
    if (m.phase === 'done') return
    if (m.phase === 'forming' || m.phase === 'reforming') {
      var ctrl = machine(m, m.positions.controller)
      if (!ctrl || !ctrl.isFormed()) {
        if (S.tick - m.started > 600) {
          check('formed_' + m.key, false, 'formation timeout'); m.phase = 'done'
        }
        return
      }
      var wasReforming = m.phase === 'reforming'
      parts(m)
      if (!wasReforming) check('formed_' + m.key, true, 'full design shape')
      // Let GTM rebuild the cleaning provider after its hatch joins the formed controller.
      m.phase = wasReforming ? 'cleaning' : 'ready'
      m.started = S.tick
    }
    var energy = m.parts.energy.energyContainer
    energy.setEnergyStored(energy.getEnergyCapacity())
    if (m.phase === 'cleaning') {
      if (S.tick - m.started < 80) return
      m.cleanroomProbe = false
      m.phase = 'ready'
    }
    if (m.phase === 'ready') {
      feed(m, m.recipes[m.ground ? 1 : m.next])
      m.phase = m.ground ? 'ground' : m.cleanroomProbe ? 'unclean' : 'running'
      return
    }
    if (m.phase === 'ground' || m.phase === 'unclean') {
      if (S.tick - m.started < 80) return
      check((m.ground ? 'ground_rejected_' : 'cleanroom_required_') + m.key,
        Object.keys(inventory(m.parts.output)).length === 0 &&
          Number(m.ctrl.getRecipeLogic().getProgress()) === 0,
        'supplied all inputs and EU, no product and no progress')
      if (m.ground) { m.phase = 'done'; return }
      // Withdraw the rejected batch: once the cleaning hatch joins, GTM would start it during the cleaning
      // wait, and the refeed would then queue a second run whose output lands in the next recipe's check.
      empty(m.parts.input)
      m.parts.fluid.tank.setFluidInTank(0, classes().Fluids.EMPTY)
      setBlock(m, m.positions.maintenance, 'gtceu:cleaning_maintenance_hatch[facing=north]')
      m.phase = 'reforming'
      m.started = S.tick
      return
    }
    if (m.phase === 'running') {
      var expected = parseItem(m.current.output)
      var outputs = inventory(m.parts.output)
      if ((outputs[expected.id] || 0) >= expected.count) {
        check('process_' + m.current.name,
          outputs[expected.id] === expected.count && Object.keys(outputs).length === 1 &&
            Object.keys(inventory(m.parts.input)).length === 0 &&
            m.parts.fluid.tank.getFluidInTank(0).isEmpty(),
          JSON.stringify(outputs) + '; all reagents consumed')
        m.next++
        m.phase = m.next === m.recipes.length ? 'done' : 'ready'
      } else if (S.tick - m.started > m.current.duration + 400) {
        check('process_' + m.current.name, false,
          'timeout; failures=' + String(m.ctrl.getRecipeLogic().getFailureReasons()))
        m.phase = 'done'
      }
    }
  }
  ServerEvents.customCommand('gg_test_luv_orbital_industry', function () {
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
