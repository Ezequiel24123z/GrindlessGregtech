// TEST ONLY, B4. Integrated owner: kubejs custom_command gg_test_luv_orbital_biology
// Never launches a JVM. Band X16640..16703, Z0..31; orbit Y198..214, Earth Y98..112.
// Live lookup (including the entire greenhouse family), all three shapes, actual recipe runs,
// ground/cleanroom rejection, both voiding modes, kept c5/c6 seeds, fluid destinations and LuV NPU.
// Uses native durations and a real cleaning maintenance hatch, no synthetic cleanroom or clock changes.
// One command, 150 s / 2900 tick ceiling including setup; cleanup only owns placed blocks/tickets.
(function () {
  var S = null
  var J = null
  var LOADED = Date.now()
  var REQUEST = 'ggTestLuvOrbitalBiologyRequest'
  var REQUESTED = 0
  var X0 = 16640
  var X1 = 16703
  var names = ['zero_g_crystal_grower', 'hydroponic_ring', 'organoid_lab']
  function lazy() {
    if (J === null) J = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      AL: Java.loadClass('java.util.ArrayList'),
      HM: Java.loadClass('java.util.HashMap'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registry: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      Forge: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
      FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
      Voiding: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode')
    }
    return J
  }
  function array(list) {
    var a = new (lazy().AL)(list)
    var out = []
    for (var i = 0; i < a.size(); i++) out.push(a.get(i))
    return out
  }
  function check(name, ok, detail) {
    console.info('GGTEST|luv_orbital_biology|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' +
      String(detail || '').replace(/[\r\n|]+/g, ' ').substring(0, 1800))
    if (!ok) throw new Error(name + ': ' + detail)
  }
  function command(m, text) { return Number(S.server.runCommandSilent('execute in ' + m.dim + ' run ' + text)) }
  function key(p) { return p.x + ',' + p.y + ',' + p.z }
  function at(m, p) { return lazy().Meta.getMachine(m.level, new (lazy().Pos)(p.x, p.y, p.z)) }
  function inside(m, p) {
    if (p.x < X0 || p.x > X1 || p.z < 0 || p.z > 31 || p.y < m.low || p.y > m.high) {
      throw new Error('out of reserved B4 band: ' + key(p))
    }
  }
  function put(m, p, id) {
    inside(m, p)
    var ticket = m.dim + ':' + (p.x >> 4) + ',' + (p.z >> 4)
    if (!S.chunks[ticket]) {
      S.chunks[ticket] = true
      m.level.getChunk(p.x >> 4, p.z >> 4)
      if (command(m, 'forceload query ' + p.x + ' ' + p.z) < 1) {
        S.tickets.push({ m: m, p: p })
        command(m, 'forceload add ' + p.x + ' ' + p.z)
      }
    }
    var k = m.dim + ':' + key(p)
    if (!S.owned[k]) {
      if (String(m.level.getBlock(p.x, p.y, p.z).id) !== 'minecraft:air') {
        throw new Error('refusing to overwrite unowned block at ' + k)
      }
      S.owned[k] = true
      S.blocks.push({ m: m, p: p })
    }
    command(m, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + ' replace')
    var expected = id.split('[')[0]
    if (String(m.level.getBlock(p.x, p.y, p.z).id) !== expected) throw new Error('placement failed: ' + id)
  }
  function plain(sym) {
    if (sym.kind === 'oneOf') return plain(sym.options[0])
    if (sym.kind === 'blocks') return String(sym.blocks[0])
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    throw new Error('unsupported structure symbol ' + sym.kind)
  }
  function place(m) {
    var d = S.G.structures[m.id]
    var anchor = null
    d.slices.forEach(function (rows, z) {
      rows.forEach(function (row, y) {
        var x = row.indexOf('S')
        if (x >= 0) anchor = { x: x, y: y, z: z }
      })
    })
    var roles = [
      ['energy', 'gtceu:luv_energy_input_hatch'], ['inBus', 'gtceu:luv_input_bus'],
      ['outBus', 'gtceu:luv_output_bus'], ['in1', 'gtceu:luv_input_hatch'],
      ['in2', 'gtceu:luv_input_hatch']
    ]
    if (m.index === 1) {
      roles.push(['out1', 'gtceu:luv_output_hatch'], ['out2', 'gtceu:luv_output_hatch'])
    } else roles.push(['maintenance', m.ground ? 'gtceu:cleaning_maintenance_hatch' : 'gtceu:auto_maintenance_hatch'])
    var next = 0
    m.positions = {}
    d.slices.forEach(function (rows, z) {
      rows.forEach(function (row, y) {
        for (var x = 0; x < row.length; x++) {
          var ch = row.charAt(x)
          var sym = d.symbols[ch]
          var p = { x: m.p.x - x + anchor.x, y: m.p.y + y - anchor.y, z: m.p.z - z + anchor.z }
          inside(m, p)
          if (!sym || sym.kind === 'controller' || sym.kind === 'any') continue
          if (sym.kind === 'air') {
            if (String(m.level.getBlock(p.x, p.y, p.z).id) !== 'minecraft:air') throw new Error('occupied core ' + key(p))
            continue
          }
          var id = null
          if (ch === 'X' && next < roles.length) {
            m.positions[roles[next][0]] = p
            id = roles[next++][1] + '[facing=north]'
          } else id = plain(sym)
          put(m, p, id)
        }
      })
    })
    if (next !== roles.length) throw new Error('not enough service cells for ' + m.id)
    put(m, m.p, m.id + '[facing=north]')
    m.phase = 'forming'
    m.at = S.tick
  }
  function byId(id) {
    var result = S.server.getRecipeManager().byKey(new (lazy().RL)(id))
    return result.isPresent() ? result.get() : null
  }
  function lookup(type, r) {
    var map = new (lazy().HM)()
    var items = new (lazy().AL)(lazy().Helper.getInputItems(r))
    var fluids = new (lazy().AL)(lazy().Helper.getInputFluids(r))
    if (items.size() > 0) map.put(lazy().ItemCap, items)
    if (fluids.size() > 0) map.put(lazy().FluidCap, fluids)
    return type.db()['find(java.util.Map,java.util.function.Predicate)'](map, function (candidate) {
      return String(candidate.id) === String(r.id)
    }) !== null
  }
  function staticChecks() {
    var expected = [
      ['microgravity_crystal_growth', ['raw_crystal_chip_1', 'raw_crystal_chip_2', 'raw_crystal_chip_3',
        'raw_crystal_chip_4', 'raw_crystal_chip_5', 'sapphire_test_mass']],
      ['greenhouse', ['neurotrophic_factor', 'plant_collagen']],
      ['organoid_assembly', ['neural_organoid', 'neuro_processing_unit']]
    ]
    expected.forEach(function (entry) {
      var type = lazy().Registry.RECIPE_TYPES.get(new (lazy().RL)('gtceu:' + entry[0]))
      check('type_' + entry[0], type !== null, 'native type')
      entry[1].forEach(function (suffix) {
        var id = 'grindless:' + entry[0] + '/luv/' + suffix
        var r = byId(id)
        check('recipe_' + suffix, r !== null && lookup(type, r), id + ' survives native lookup')
        var conditions = array(r.conditions).map(function (c) { return String(c.serialize()) }).join(',')
        check('orbits_' + suffix, S.G.orbits.dimensions.every(function (dim) {
          return conditions.indexOf(dim) >= 0
        }) && !/"reverse":true/.test(conditions), conditions)
      })
    })
    var greenhouse = lazy().Registry.RECIPE_TYPES.get(new (lazy().RL)('gtceu:greenhouse'))
    var all = array(S.server.getRecipeManager().getAllRecipesFor(greenhouse))
    var missing = all.filter(function (r) { return !lookup(greenhouse, r) })
    check('greenhouse_lookup', all.length > 2 && missing.length === 0,
      all.length + ' recipes; missing=' + missing.map(function (r) { return String(r.id) }).join(','))
    names.forEach(function (name) {
      check('crafting_' + name, byId('grindless:crafting/' + name) !== null, 'controller recipe')
      var d = S.G.structures['gtceu:' + name]
      check('parallel_' + name, d.symbols.X.options.some(function (o) {
        return o.ability === 'parallel_hatch' && Number(o.limits.max) === 1
      }), 'real shared parallel-hatch predicate')
    })
    var factor = byId('grindless:greenhouse/luv/neurotrophic_factor')
    check('lower_family_veto', ['lv', 'mv', 'hv', 'ev'].every(function (tier) {
      return S.G.lv.rules.isAboveTier(factor, tier)
    }), 'existing tier veto excludes LuV')
  }
  function clear(bus) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
  }
  function items(bus) {
    var result = {}
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = String(lazy().Forge.ITEMS.getKey(st.getItem()))
      result[id] = (result[id] || 0) + Number(st.getCount())
    }
    return result
  }
  function scenario(m, step) {
    if (m.index === 0) return { circuit: 1, items: ['gtceu:exquisite_emerald_gem'],
      fluids: [['gtceu:europium', 16]], output: 'gtceu:raw_crystal_chip', count: 1 }
    if (m.index === 1) return { circuit: step === 0 ? 5 : 6,
      items: [step === 0 ? 'grindless:engineered_barley_seed' : 'grindless:engineered_tobacco_seed'],
      fluids: [['minecraft:water', 1000], ['gtceu:carbon_dioxide', 500]],
      output: step === 0 ? 'grindless:neurotrophic_factor' : 'gtceu:collagen_dust', count: step === 0 ? 1 : 2 }
    return step === 0 ?
      { circuit: 1, items: ['16x gtceu:stem_cells', 'grindless:neurotrophic_factor'],
        fluids: [['gtceu:sterilized_growth_medium', 250]], output: 'grindless:neural_organoid', count: 1 } :
      { circuit: 2, items: ['gtceu:wetware_printed_circuit_board', 'grindless:neural_organoid',
        '8x gtceu:polybenzimidazole_small_fluid_pipe', '8x gtceu:electrum_plate',
        '16x gtceu:silicone_rubber_foil', '8x gtceu:hsse_bolt'],
        fluids: [['gtceu:sterilized_growth_medium', 250]], output: 'gtceu:neuro_processing_unit', count: 1 }
  }
  function wake(m) { m.ctrl.getRecipeLogic().updateTickSubscription() }
  function feed(m, sc) {
    clear(m.inBus)
    clear(m.outBus)
    m.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(sc.circuit))
    ;[m.in1, m.in2, m.out1, m.out2].forEach(function (h) {
      if (h) h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    })
    sc.items.forEach(function (text, slot) {
      var match = /^(\d+)x (.+)$/.exec(text)
      m.inBus.getInventory().setStackInSlot(slot, Item.of(match ? match[2] : text, match ? Number(match[1]) : 1))
    })
    sc.fluids.forEach(function (f, index) {
      m[index ? 'in2' : 'in1'].tank.setFluidInTank(0, Fluid.of(f[0], f[1]).getFluidStack())
    })
    m.ctrl.getRecipeLogic().resetRecipeLogic()
    m.sc = sc
    m.at = S.tick
    m.seen = false
    wake(m)
  }
  function blocked(m) {
    return Number(m.ctrl.getRecipeLogic().getProgress()) === 0 && Object.keys(items(m.outBus)).length === 0
  }
  function voiding(m, mode) {
    m.ctrl.setVoidingMode(lazy().Voiding[mode])
    wake(m)
    m.at = S.tick
  }
  function verify(m) {
    var got = items(m.outBus)
    check(m.key + '_process_' + m.next, m.seen && got[m.sc.output] === m.sc.count &&
      Object.keys(got).length === 1, JSON.stringify(got))
    if (m.index === 1) {
      var seed = m.sc.items[0]
      check(m.key + '_kept_seed_' + m.next, items(m.inBus)[seed] === 1, seed)
      var fluids = {}
      ;[m.out1, m.out2].forEach(function (h) {
        var stack = h.tank.getFluidInTank(0)
        if (!stack.isEmpty()) fluids[String(lazy().Forge.FLUIDS.getKey(stack.getFluid()))] = Number(stack.getAmount())
      })
      check(m.key + '_byproducts_' + m.next, fluids['gtceu:biomass'] === 250 &&
        fluids['gtceu:oxygen'] === 200, JSON.stringify(fluids))
    }
  }
  function advance(m) {
    if (m.phase === 'done') return
    if (m.phase === 'forming' || m.phase === 'reforming') {
      if (m.phase === 'reforming' && S.tick - m.at < 40) return
      m.ctrl = at(m, m.p)
      if (!m.ctrl || !m.ctrl.isFormed()) {
        if (S.tick - m.at > 200) throw new Error(m.key + ' did not form')
        return
      }
      Object.keys(m.positions).forEach(function (role) { m[role] = at(m, m.positions[role]) })
      check(m.key + '_formed', true, 'native complete pattern, service and maintenance cells')
      feed(m, scenario(m, 0))
      m.phase = m.ground ? 'ground' : m.index === 1 ? 'ordinary' :
        m.phase === 'forming' ? 'unclean' : m.index === 0 ? 'running' : 'void_items'
      if (m.phase === 'ordinary') feed(m, { circuit: 0, items: ['minecraft:carrot'], fluids: [] })
      if (m.phase === 'void_items') voiding(m, 'VOID_ITEMS')
      return
    }
    if (m.energy) {
      var container = m.energy.energyContainer
      container.setEnergyStored(container.getEnergyCapacity())
    }
    if (m.phase === 'ground' || m.phase === 'unclean' || m.phase === 'ordinary') {
      if (S.tick - m.at < 80) return
      check(m.key + '_' + m.phase + '_rejected', blocked(m), 'full native inputs/energy, no progress or product')
      if (m.phase === 'ground') { m.phase = 'done'; return }
      if (m.phase === 'unclean') {
        put(m, m.positions.maintenance, 'gtceu:cleaning_maintenance_hatch[facing=north]')
        m.phase = 'reforming'
        m.at = S.tick
        return
      }
      feed(m, scenario(m, 0))
      voiding(m, 'VOID_ITEMS')
      m.phase = 'void_items'
      return
    }
    if (m.phase === 'void_items' || m.phase === 'void_fluids') {
      if (S.tick - m.at < 40) return
      check(m.key + '_' + m.phase + '_rejected', blocked(m), 'no progress while voiding')
      if (m.phase === 'void_items') {
        voiding(m, 'VOID_FLUIDS')
        m.phase = 'void_fluids'
      } else {
        voiding(m, 'VOID_NONE')
        m.phase = 'running'
      }
      return
    }
    if (m.phase === 'running') {
      var logic = m.ctrl.getRecipeLogic()
      if (Number(logic.getProgress()) > 0) m.seen = true
      if ((items(m.outBus)[m.sc.output] || 0) < m.sc.count) return
      verify(m)
      m.next++
      if (m.index === 0 || m.next === 2) { m.phase = 'done'; return }
      feed(m, scenario(m, m.next))
    }
  }
  function finish() {
    if (!S || S.finished) return
    S.finished = true
    var errors = []
    S.blocks.slice().reverse().forEach(function (entry) {
      try { command(entry.m, 'setblock ' + key(entry.p).replace(/,/g, ' ') + ' air replace') } catch (e) { errors.push(String(e)) }
    })
    S.tickets.forEach(function (entry) {
      try { command(entry.m, 'forceload remove ' + entry.p.x + ' ' + entry.p.z) } catch (e) { errors.push(String(e)) }
    })
    console.info('GGTEST|luv_orbital_biology|cleanup|' + (errors.length ? 'FAIL' : 'PASS') + '|' + errors.join(';'))
    console.info('GGTEST|luv_orbital_biology|DONE')
  }
  function run(server) {
    S = { server: server, G: global.grindless, started: REQUESTED, tick0: server.getTickCount(), tick: 0,
      chunks: {}, tickets: [], owned: {}, blocks: [], machines: [], finished: false }
    staticChecks()
    ;[
      { dim: S.G.orbits.earth, ground: false, low: 198, high: 214, y: 202 },
      { dim: 'minecraft:overworld', ground: true, low: 98, high: 112, y: 102 }
    ].forEach(function (world) {
      var level = server.getLevel(world.dim)
      check('level_' + world.dim, level !== null, world.dim)
      names.forEach(function (name, index) {
        var m = { id: 'gtceu:' + name, index: index, dim: world.dim, ground: world.ground,
          low: world.low, high: world.high, level: level,
          p: { x: 16648 + index * 24, y: world.y, z: 2 },
          key: name + (world.ground ? '_ground' : '_orbit'), next: 0 }
        S.machines.push(m)
        place(m)
      })
    })
  }
  ServerEvents.tick(function (event) {
    if (global[REQUEST] === true && (!S || S.finished) && Date.now() - LOADED >= 10000) {
      global[REQUEST] = false
      try { run(event.server) } catch (e) {
        console.info('GGTEST|luv_orbital_biology|setup|FAIL|' + e)
        finish()
      }
    }
    if (!S || S.finished) return
    try {
      S.tick = event.server.getTickCount() - S.tick0
      if (S.tick > 2900 || Date.now() - S.started > 150000) throw new Error('B4 fixture deadline')
      S.machines.forEach(advance)
      if (S.machines.every(function (m) { return m.phase === 'done' })) finish()
    } catch (e) {
      console.info('GGTEST|luv_orbital_biology|execution|FAIL|' + e)
      finish()
    }
  })
  ServerEvents.customCommand('gg_test_luv_orbital_biology', function () {
    if (S && !S.finished) return 0
    REQUESTED = Date.now()
    global[REQUEST] = true
    return 1
  })
})()
