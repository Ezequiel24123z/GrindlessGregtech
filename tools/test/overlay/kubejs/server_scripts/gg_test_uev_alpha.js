// priority: -7790
// TEST ONLY, UEV-B2. Command: kubejs custom_command gg_test_uev_alpha
// Marker: GGTEST|uev_alpha|DONE|failures=N
// Band ONLY: X 33280-33343, Z 0-63, grindless:alpha_centauri_orbit Y 60-120. All blocks and chunk tickets are owned and removed before DONE.
// Doubts: (1) the swarm and probe rows carry the Alpha Centauri dimension while the Mercury rows keep theirs (the allowlist is widened,
// never narrowed); (2) the nebula collector forms and runs in the Alpha Centauri orbit:
//   static_*    registration of the three machines, every published row loads under its id, controllers and the cryogenic row
//   dim_*       dimension condition of the Alpha rows, the Mercury rows unchanged
//   formed      GTM forms the collector with the chosen parts
//   run         circuit 1 starts grindless:nebula_collection/interstellar_gas with the scoop coil in the bus; the coil stays after the start
(function () {
  var REQUEST = 'ggTestUevAlphaRequest'
  var NAME = 'uev_alpha'
  var LOADED_AT = Date.now()
  var S = null
  var J = null
  var BAND = { x0: 33280, x1: 33343, y0: 60, y1: 120, z0: 0, z1: 63 }
  var DIM = 'grindless:alpha_centauri_orbit'
  var MACHINE = 'gtceu:nebula_collector'
  var RUN = 'grindless:nebula_collection/interstellar_gas'
  var COIL = 'grindless:superhydride_scoop_coil'
  var HELIUM = 'gtceu:liquid_helium'
  var PARTS = [
    { ability: 'energy_input', id: 'gtceu:uev_energy_input_hatch', key: 'energy' },
    { ability: 'input_bus', id: 'gtceu:luv_input_bus', key: 'bus' },
    { ability: 'input_hatch', id: 'gtceu:luv_input_hatch', key: 'hatch' },
    { ability: 'output_bus', id: 'gtceu:luv_output_bus', key: 'out' },
    { ability: 'output_hatch', id: 'gtceu:luv_output_hatch', key: 'fout' }
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
  function conditionsOf(recipe) {
    var out = []
    var list = recipe.conditions
    for (var i = 0; i < list.size(); i++) {
      var c = list.get(i)
      var text
      try { text = String(c.serialize()) } catch (e) { text = String(c) }
      out.push(text)
    }
    return out.join(' ')
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
    var desc = S.G.patterns.describe(id)
    if (!desc) throw new Error('missing pattern description ' + id)
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
  function phase(name) {
    S.phase = name
    S.phaseAt = S.tick
    emit('stage', 'NOTE', name)
  }

  function statics() {
    var AC = S.G.uevAlphaCentauri
    check('static_published', AC && AC.recipes && AC.recipes.length === 19, 'global.grindless.uevAlphaCentauri recipes ' + (AC && AC.recipes ? AC.recipes.length : 'none'))
    if (!AC || !AC.recipes) return
    var missing = []
    AC.recipes.forEach(function (r) { if (byId('grindless:' + r.type + '/' + r.name) === null) missing.push(r.type + '/' + r.name) })
    check('static_recipes', missing.length === 0 && (AC.skipped || []).length === 0 && (AC.clashes || []).length === 0,
      AC.recipes.length + ' rows; missing ' + (missing.join(' ') || 'none') + '; skipped ' + JSON.stringify(AC.skipped || []) + '; clashes ' + JSON.stringify(AC.clashes || []))
    var ctl = []
    ;(AC.controllerRecipes || []).forEach(function (id) { if (S.server.getRecipeManager().byKey(rl(id)).isPresent() === false) ctl.push(id) })
    check('static_controllers', (AC.controllerRecipes || []).length === 3 && ctl.length === 0, 'controller recipes ' + (AC.controllerRecipes || []).length + ', missing ' + (ctl.join(' ') || 'none'))
    ;['nebula_collector', 'interstellar_dust_lab', 'pulsar_timing_station'].forEach(function (m) {
      check('static_' + m, !!lazy().Registry.MACHINES.get(rl('gtceu:' + m)), 'gtceu:' + m)
    })
    check('static_cryogenic_row', byId('grindless:cryogenic_processing/interstellar_gas') !== null, 'cryogenic_processing/interstellar_gas')
  }

  function dimensions() {
    var rows = [
      ['grindless:dyson_swarm/alpha_full_swarm', 'alpha_centauri_orbit', 'mercury_orbit'],
      ['grindless:solar_probe/alpha_corona', 'alpha_centauri_orbit', 'mercury_orbit'],
      ['grindless:dyson_swarm/full_swarm', 'mercury_orbit', 'alpha_centauri_orbit'],
      ['grindless:solar_probe/corona', 'mercury_orbit', 'alpha_centauri_orbit']
    ]
    rows.forEach(function (r) {
      var recipe = byId(r[0])
      if (recipe === null) { check('dim_' + r[0].split('/')[1], false, r[0] + ' missing'); return }
      var text = conditionsOf(recipe)
      check('dim_' + r[0].split('/')[1], text.indexOf(r[1]) >= 0 && text.indexOf(r[2]) < 0, r[0] + ' conditions ' + text)
    })
    ;['nebula_collection/interstellar_gas', 'interstellar_dust_analysis/fe60_record', 'pulsar_timing/pulsar_navigation_chart'].forEach(function (id) {
      var recipe = byId('grindless:' + id)
      var text = recipe === null ? 'missing' : conditionsOf(recipe)
      check('dim_' + id.split('/')[1], text.indexOf('alpha_centauri_orbit') >= 0, id + ' conditions ' + text)
    })
  }

  function setup() {
    var ctrl = at(S.origin)
    if (!ctrl || !ctrl.isFormed()) return false
    S.ctrl = ctrl
    S.energy = at(S.pos.energy)
    S.bus = at(S.pos.bus)
    S.hatch = at(S.pos.hatch)
    var parts = ctrl.getParts()
    check('formed', parts.contains(S.energy) && parts.contains(S.bus) && parts.contains(S.hatch) && parts.contains(at(S.pos.out)) && parts.contains(at(S.pos.fout)),
      'GTM formed the collector in ' + DIM)
    S.bus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(1))
    S.bus.getInventory().setStackInSlot(0, Item.of(COIL, 1))
    var Action = Java.loadClass('net.minecraftforge.fluids.capability.IFluidHandler$FluidAction')
    S.hatch.tank.fill(Fluid.of(HELIUM, 4000).getFluidStack(), Action.EXECUTE)
    S.ctrl.getRecipeLogic().updateTickSubscription()
    return true
  }
  function power() {
    var c = S.energy.energyContainer
    c.setEnergyStored(c.getEnergyCapacity())
  }
  function step() {
    if (!S || S.finished) return
    S.tick = Number(S.server.getTickCount()) - S.tick0
    if (S.tick > 1800) throw new Error('overall deadline in ' + S.phase)
    var elapsed = S.tick - S.phaseAt
    if (S.phase === 'form') {
      if (setup()) phase('run')
      else if (elapsed > 400) throw new Error('the collector did not form')
      return
    }
    power()
    var logic = S.ctrl.getRecipeLogic()
    if (S.phase === 'run') {
      var last = logic.getLastRecipe()
      if (String(logic.getStatus()) === 'WORKING' && last) {
        check('run', String(last.id) === RUN, 'recipe ' + last.id + ', status ' + logic.getStatus())
        check('run_coil_kept', countIn(S.bus.getInventory(), COIL) === 1, 'scoop coil in the bus after the start: ' + countIn(S.bus.getInventory(), COIL))
        finish()
      } else if (elapsed > 300) throw new Error('no run started; status ' + logic.getStatus())
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
    check('cleanup', problems.length === 0, problems.length ? problems.join('; ') : S.order.length + ' blocks and ' + S.tickets.length + ' tickets removed')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function start(server) {
    S = { server: server, G: global.grindless, failed: 0, tick0: Number(server.getTickCount()), tick: 0, phaseAt: 0, phase: 'setup',
      owned: {}, order: [], chunks: {}, tickets: [], finished: false }
    S.level = server.getLevel(DIM)
    if (!check('orbit_loaded', S.level !== null && S.level !== undefined, DIM)) throw new Error('no level ' + DIM)
    statics()
    dimensions()
    S.origin = { x: 33300, y: 80, z: 30 }
    S.pos = build(MACHINE, S.origin)
    phase('form')
  }
  ServerEvents.customCommand('gg_test_uev_alpha', function () {
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
