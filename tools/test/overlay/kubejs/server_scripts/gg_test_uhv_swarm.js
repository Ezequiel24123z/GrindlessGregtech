// priority: -8224
// TEST ONLY, UHV-B3. Command: kubejs custom_command gg_test_uhv_swarm
// Marker: GGTEST|uhv_swarm|DONE|failures=N (well within 180 seconds).
// Band ONLY: X 29184-29247, Z 0-63, gcyr:mercury_orbit Y 60-120. All blocks and chunk tickets are owned and removed before DONE.
// Doubt: a generator whose catalysts wear into an output, at its final figure. A real swarm control station (11 x 5 x 11) is built
// in Mercury orbit with two UHV dynamos (2 A each = 8,388,608 EU/t, c2's figure) and fed 64 segments, the coronal field map, four
// oganesson pods and circuit 2:
//   static_*   every published B3 row loads under its id, plus the film and oganesson rows; the station is a native generator
//   formed     GTM forms the structure with the chosen parts; dynamo capacity 8,388,608
//   full_swarm the run is grindless:dyson_swarm/full_swarm, 1 parallel, 8,388,608 EU/t measured for 40 ticks with nothing paid in;
//              at the start 4 segments and 4 pods leave the bus, 60 segments and the map stay
//   wear       fast-forwarded (RecipeLogic#setProgress, gg_test_leisure_utility's technique): the output bus holds 4 worn segments
//              and 4 tanks; the 60 kept segments are untouched, and with 60 left no new c2 run starts
(function () {
  var REQUEST = 'ggTestUhvSwarmRequest'
  var NAME = 'uhv_swarm'
  var LOADED_AT = Date.now()
  var S = null
  var J = null
  var BAND = { x0: 29184, x1: 29247, y0: 60, y1: 120, z0: 0, z1: 63 }
  var DIM = 'gcyr:mercury_orbit'
  var STATION = 'gtceu:swarm_control_station'
  var FULL = 'grindless:dyson_swarm/full_swarm'
  var EUT = 8388608
  var SEG = 'grindless:swarm_segment'
  var WORN = 'grindless:worn_swarm_segment'
  var MAP = 'grindless:coronal_field_map'
  var POD = 'grindless:oganesson_propellant_pod'
  var TANK = 'grindless:propellant_tank'
  var DYNAMO = 'gtceu:uhv_energy_output_hatch'
  var PARTS = [
    { ability: 'energy_output', id: DYNAMO, key: 'dyn0' },
    { ability: 'energy_output', id: DYNAMO, key: 'dyn1' },
    { ability: 'input_bus', id: 'gtceu:luv_input_bus', key: 'bus' },
    { ability: 'input_hatch', id: 'gtceu:luv_input_hatch', key: 'hatch' },
    { ability: 'output_bus', id: 'gtceu:luv_output_bus', key: 'out' }
  ]

  function emit(name, status, detail) {
    console.info('GGTEST|' + NAME + '|' + name + '|' + status + (detail ? '|' + String(detail).replace(/[\r\n|]+/g, ' ').substring(0, 1500) : ''))
  }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    emit(name, ok ? 'PASS' : 'FAIL', detail)
    return ok
  }
  function lazy() {
    if (J === null) J = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Machine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registry: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour')
    }
    return J
  }
  function rl(id) { return new (lazy().RL)(id) }
  function at(p) { return lazy().Machine.getMachine(S.level, new (lazy().Pos)(p.x, p.y, p.z)) }
  function cmd(text) { return Number(S.server.runCommandSilent('execute in ' + DIM + ' run ' + text)) }
  function byId(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }
  function inside(p) {
    if (p.x < BAND.x0 || p.x > BAND.x1 || p.y < BAND.y0 || p.y > BAND.y1 || p.z < BAND.z0 || p.z > BAND.z1) {
      throw new Error('out-of-band coordinate ' + JSON.stringify(p))
    }
  }
  function key(p) { return p.x + ',' + p.y + ',' + p.z }
  function block(p) { return String(S.level.getBlock(p.x, p.y, p.z).id) }
  function ticket(p) {
    var x = Math.floor(p.x / 16) * 16
    var z = Math.floor(p.z / 16) * 16
    var k = x + ',' + z
    if (S.chunks[k]) return
    S.chunks[k] = true
    S.level.getChunk(x >> 4, z >> 4)
    if (cmd('forceload query ' + x + ' ' + z) > 0) return
    S.tickets.push({ x: x, z: z })
    if (cmd('forceload add ' + x + ' ' + z) < 1) throw new Error('cannot acquire chunk ticket ' + k)
  }
  function put(p, id, facing) {
    inside(p)
    ticket(p)
    var k = key(p)
    if (!S.owned[k]) {
      if (block(p) !== 'minecraft:air') throw new Error('refusing to replace unowned block at ' + k)
      S.owned[k] = p
      S.order.push(p)
    }
    cmd('setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + (facing ? '[facing=north]' : '') + ' replace')
    if (block(p) !== id) throw new Error('setblock did not place ' + id + ' at ' + k)
  }
  function plain(sym) {
    if (sym.kind === 'blocks') return String(sym.blocks[0])
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    if (sym.kind === 'oneOf') {
      for (var i = 0; i < sym.options.length; i++) if (sym.options[i].kind === 'blocks') return String(sym.options[i].blocks[0])
    }
    throw new Error('unsupported structural symbol ' + sym.kind)
  }
  function allows(sym, ability) {
    return sym.kind === 'oneOf' && sym.options.some(function (o) { return o.kind === 'part' && o.ability === ability })
  }
  // lib/patterns.js's description: slices back -> front, rows bottom -> top; the controller faces north, the body runs to +z
  function build(id, origin) {
    var desc = S.G.structures[id]
    if (!desc) throw new Error('missing G.structures entry ' + id)
    var ctl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          if (sym && sym.kind === 'controller') ctl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (!ctl) throw new Error('no controller in ' + id)
    var plan = []
    var pos = {}
    var next = 0
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          var p = { x: origin.x - (ci - ctl.ci), y: origin.y + ri - ctl.ri, z: origin.z - (si - ctl.si) }
          inside(p)
          ticket(p)
          if (block(p) !== 'minecraft:air') throw new Error('structure footprint is occupied at ' + key(p))
          if (!sym || sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') continue
          var bid = null
          var facing = false
          if (si === ctl.si && next < PARTS.length && allows(sym, PARTS[next].ability)) {
            bid = PARTS[next].id
            pos[PARTS[next].key] = p
            facing = true
            next++
          }
          plan.push({ p: p, id: bid || plain(sym), facing: facing })
        }
      })
    })
    if (next < PARTS.length) throw new Error('front wall has no slot for ' + PARTS[next].ability)
    plan.forEach(function (c) { put(c.p, c.id, c.facing) })
    put(origin, id, true)
    return pos
  }
  function countIn(inv, id) {
    var n = 0
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (!st.isEmpty() && String(st.getId()) === id) n += Number(st.getCount())
    }
    return n
  }
  function contents(inv) {
    var out = []
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (!st.isEmpty()) out.push(String(st.getId()) + 'x' + st.getCount())
    }
    return out.join(' ') || 'empty'
  }
  function phase(name) {
    S.phase = name
    S.phaseAt = S.tick
    emit('stage', 'NOTE', name)
  }

  // ---------------------------------------------------------------- static
  function statics() {
    var SW = S.G.uhvSwarm
    if (!check('static_published', SW && SW.recipes && SW.recipes.length === 8, 'global.grindless.uhvSwarm recipes ' +
      (SW && SW.recipes ? SW.recipes.length : 'none'))) return
    var missing = []
    var ids = SW.recipes.map(function (r) { return String(r.recipeId) }).concat(SW.crafting.map(String))
      .concat(['grindless:light_sail/aluminium_reflector_film', 'grindless:cryogenic_processing/oganesson_propellant',
        'grindless:thruster_assembly/oganesson_propellant_pod', 'grindless:chemical_reactor/hermean_quantum_seed_orbit'])
    ids.forEach(function (id) { if (byId(id) === null) missing.push(id) })
    check('static_recipes', missing.length === 0 && (SW.skipped || []).length === 0 && (SW.clashes || []).length === 0,
      ids.length + ' ids; missing ' + (missing.join(' ') || 'none') + '; skipped ' + JSON.stringify(SW.skipped || []) +
      '; clashes ' + JSON.stringify(SW.clashes || []))
    var def = lazy().Registry.MACHINES.get(rl(STATION))
    check('static_generator', def && def.isGenerator() === true, STATION + ' generator=' + (def ? def.isGenerator() : 'missing'))
    ;['gtceu:swarm_segment_foundry', 'gtceu:solar_probe_bay'].forEach(function (m) {
      check('static_' + m.split(':')[1], !!lazy().Registry.MACHINES.get(rl(m)), m)
    })
    emit('static_4a_dynamo', 'NOTE', 'gtceu:uhv_energy_output_hatch_4a exists=' + Item.exists('gtceu:uhv_energy_output_hatch_4a'))
  }

  // ---------------------------------------------------------------- the run
  function setup() {
    var ctrl = at(S.origin)
    if (!ctrl || !ctrl.isFormed()) return false
    S.ctrl = ctrl
    S.dyn = [at(S.pos.dyn0), at(S.pos.dyn1)]
    S.bus = at(S.pos.bus)
    S.out = at(S.pos.out)
    var parts = ctrl.getParts()
    var cap = Number(S.G.generators.dynamoCapacity(ctrl))
    check('formed', S.dyn[0] && S.dyn[1] && S.bus && S.out && parts.contains(S.dyn[0]) && parts.contains(S.dyn[1]) &&
      parts.contains(S.bus) && parts.contains(S.out) && cap === EUT, 'GTM formed the station in ' + DIM + '; dynamo capacity ' + cap)
    S.bus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(2))
    var inv = S.bus.getInventory()
    for (var i = 0; i < 4; i++) inv.setStackInSlot(i, Item.of(SEG, 16))
    inv.setStackInSlot(4, Item.of(MAP, 1))
    inv.setStackInSlot(5, Item.of(POD, 4))
    check('loaded', countIn(inv, SEG) === 64 && countIn(inv, POD) === 4 && countIn(inv, MAP) === 1, contents(inv))
    ctrl.getRecipeLogic().updateTickSubscription()
    return true
  }
  function stored() {
    var n = 0
    S.dyn.forEach(function (d) { n += Number(d.energyContainer.getEnergyStored()) })
    return n
  }
  function drain() { S.dyn.forEach(function (d) { d.energyContainer.setEnergyStored(0) }) }
  function step() {
    if (!S || S.finished) return
    S.tick = Number(S.server.getTickCount()) - S.tick0
    if (S.tick > 2400) throw new Error('overall deadline in ' + S.phase)
    var elapsed = S.tick - S.phaseAt
    if (S.phase === 'form') {
      if (setup()) phase('start')
      else if (elapsed > 400) throw new Error('the station did not form')
      return
    }
    var logic = S.ctrl.getRecipeLogic()
    if (S.phase === 'start') {
      var last = logic.getLastRecipe()
      if (String(logic.getStatus()) === 'WORKING' && last) {
        var inv = S.bus.getInventory()
        check('full_swarm_recipe', String(last.id) === FULL && Number(last.parallels) === 1 &&
          Number(S.G.generators.recipeEUt(last)) === EUT, 'recipe ' + last.id + ', parallels ' + last.parallels + ', EU/t ' +
          S.G.generators.recipeEUt(last))
        check('full_swarm_inputs', countIn(inv, SEG) === 60 && countIn(inv, POD) === 0 && countIn(inv, MAP) === 1,
          'after the start: ' + contents(inv))
        drain()
        S.good = 0
        S.bad = 0
        phase('measure')
      } else if (elapsed > 200) throw new Error('no c2 run started; status ' + logic.getStatus() + ', bus ' + contents(S.bus.getInventory()))
      return
    }
    if (S.phase === 'measure') {
      var made = stored()
      drain()
      if (made === EUT) S.good++
      else S.bad++
      if (S.good + S.bad >= 40) {
        check('full_swarm_eut', S.bad === 0, S.good + ' ticks at ' + EUT + ' EU/t, ' + S.bad + ' other; nothing paid in')
        logic.setProgress(Number(logic.getDuration()) - 1)
        phase('wear')
      }
      return
    }
    if (S.phase === 'wear') {
      drain()
      var out = S.out.getInventory()
      if (countIn(out, WORN) >= 4 && countIn(out, TANK) >= 4) {
        if (elapsed < 40) return
        var bus = S.bus.getInventory()
        check('wear_outputs', countIn(out, WORN) === 4 && countIn(out, TANK) === 4, 'output bus ' + contents(out))
        check('wear_kept', countIn(bus, SEG) === 60 && countIn(bus, MAP) === 1 && String(logic.getStatus()) !== 'WORKING',
          '60 kept segments and the map stay; no new c2 run with 60: status ' + logic.getStatus() + ', bus ' + contents(bus))
        finish()
      } else if (elapsed > 200) throw new Error('the fast-forwarded run gave no worn segments: ' + contents(out))
    }
  }
  function finish() {
    if (!S || S.finished) return
    S.finished = true
    var problems = []
    try { if (S.ctrl) S.ctrl.setWorkingEnabled(false) } catch (e) { problems.push('disable: ' + e) }
    S.order.slice().reverse().forEach(function (p) {
      try {
        cmd('setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' minecraft:air replace')
        if (block(p) !== 'minecraft:air') problems.push('block remains ' + key(p))
      } catch (e) { problems.push('block ' + key(p) + ': ' + e) }
    })
    S.tickets.forEach(function (p) {
      try { cmd('forceload remove ' + p.x + ' ' + p.z) } catch (e) { problems.push('ticket: ' + e) }
    })
    check('cleanup', problems.length === 0, problems.length ? problems.join('; ') : S.order.length + ' blocks and ' + S.tickets.length +
      ' tickets removed')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function start(server) {
    S = { server: server, G: global.grindless, failed: 0, tick0: Number(server.getTickCount()), tick: 0, phaseAt: 0, phase: 'setup',
      owned: {}, order: [], chunks: {}, tickets: [], finished: false }
    S.level = server.getLevel(DIM)
    if (!check('orbit_loaded', S.level !== null && S.level !== undefined, DIM)) throw new Error('no level ' + DIM)
    statics()
    S.origin = { x: 29210, y: 80, z: 10 }
    S.pos = build(STATION, S.origin)
    phase('form')
  }
  ServerEvents.customCommand('gg_test_uhv_swarm', function () {
    if ((S && !S.finished) || global[REQUEST] === true) {
      emit('request', 'NOTE', 'already requested or running')
      return
    }
    global[REQUEST] = true
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && (!S || S.finished) && Date.now() - LOADED_AT >= 10000) {
        global[REQUEST] = false
        start(event.server)
      }
      step()
    } catch (e) {
      if (S === null) S = { failed: 0, order: [], tickets: [], finished: false }
      S.failed++
      emit('exception', 'FAIL', (S.phase || 'setup') + ': ' + e)
      if (S.server) finish()
      else console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    }
  })
})()
