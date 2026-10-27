// priority: -5024
// TEST-ONLY B2 fixture; prepared for the single integrated LuV validation owner, not a standalone launch.
// Command: kubejs custom_command gg_test_luv_orbital_solar
// Marker: GGTEST|luv_orbital_solar|DONE (owner's marker wait: at most 180 seconds).
// Requires A1/B2 registrations and G.orbits.earth with fixed_time 18000. Never changes any world's clock or weather.
// Ordinary LuV 2 A: 65536 EU/t capacity, 64 x 630 = 40320 EU/t, 400 paid ticks per run.
// Fill the real hatch, hold WAITING, drain and finish exactly one run under a completely covered field.
// No subsequent payment is allowed; uncovering restores 64 panels, then one covered panel gives 63 x 630 = 39690 EU/t.
// A4 is optional until integrated: if its LuV hatch/cell and an otherwise empty wireless network are present,
// also form a separate wireless station and real tower; automatic settlement must deposit 38304 EU/t (5% entry loss).
// Set global.ggTestLuvOrbitalSolarRequireWireless = true BEFORE the command to make missing A4 coverage a failure.
// Otherwise an unavailable wireless stage emits REQUIRED/NOTE, never PASS; the outstanding requirement is exported
// as global.ggTestLuvOrbitalSolarCoverage (a string, not numeric state in KubeJS's Java HashMap).
// All blocks/tickets are owned, bounded to X15872..15935, Z0..63, orbital Y198..214, and removed before DONE.
// Deadlines: 2800 ticks and 150 seconds from the command (including the reload quiet period); no retries.
(function () {
  var REQUEST = 'ggTestLuvOrbitalSolarRequest'
  var COVERAGE = 'ggTestLuvOrbitalSolarCoverage'
  var LOADED_AT = Date.now()
  var REQUESTED_AT = 0
  var S = null
  var J = null
  var BAND = { x0: 15872, x1: 15935, y0: 198, y1: 214, z0: 0, z1: 63 }
  var FULL = 40320
  var PARTIAL = 39690
  var RUN_EU = FULL * 400
  var LIGHT_TICKS = 20
  var WIRELESS_ID = 'gtceu:luv_wireless_dynamo_hatch'
  var REQUIRED = 'A4: separate formed LuV wireless dynamo station + LuV tower; automatic entry 38304 EU/t at 5% loss'

  function emit(name, status, detail) {
    console.info('GGTEST|luv_orbital_solar|' + name + '|' + status +
      (detail ? '|' + String(detail).replace(/[\r\n|]+/g, ' ').substring(0, 2200) : ''))
  }
  function check(name, ok, detail) {
    emit(name, ok ? 'PASS' : 'FAIL', detail)
    if (!ok) throw new Error(name + ': ' + detail)
  }
  function lazy() {
    if (J === null) J = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      AL: Java.loadClass('java.util.ArrayList'),
      Machine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registry: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
    }
    return J
  }
  function pos(p) { return new (lazy().Pos)(p.x, p.y, p.z) }
  function at(p) { return lazy().Machine.getMachine(S.level, pos(p)) }
  function cmd(text) { return Number(S.server.runCommandSilent('execute in ' + S.dim + ' run ' + text)) }
  function array(coll) {
    var list = new (lazy().AL)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function inside(p) {
    if (p.x < BAND.x0 || p.x > BAND.x1 || p.y < BAND.y0 || p.y > BAND.y1 || p.z < BAND.z0 || p.z > BAND.z1) {
      throw new Error('out-of-band coordinate ' + JSON.stringify(p))
    }
  }
  function key(p) { return p.x + ',' + p.y + ',' + p.z }
  function block(p) { return String(S.level.getBlock(p.x, p.y, p.z).id) }
  function ticket(p) {
    inside(p)
    var x = Math.floor(p.x / 16) * 16
    var z = Math.floor(p.z / 16) * 16
    var k = x + ',' + z
    if (S.chunks[k]) return
    S.chunks[k] = true
    S.level.getChunk(x >> 4, z >> 4)
    if (cmd('forceload query ' + x + ' ' + z) > 0) return
    // Record before acquiring so exceptional setup still has a cleanup path.
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
      for (var i = 0; i < sym.options.length; i++) {
        if (sym.options[i].kind === 'blocks') return String(sym.options[i].blocks[0])
      }
    }
    throw new Error('unsupported structural symbol ' + sym.kind)
  }
  function allows(sym, ability) {
    return sym.kind === 'oneOf' && sym.options.some(function (o) { return o.kind === 'part' && o.ability === ability })
  }
  function build(id, origin, dynamo, towerCell) {
    var desc = S.G.structures[id]
    if (!desc) throw new Error('missing G.structures entry ' + id)
    var controller = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          if (sym && sym.kind === 'controller') controller = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (!controller) throw new Error('no controller in ' + id)
    var plan = []
    var result = { origin: origin, drain: true, removed: 0, total: 0, previous: 0, good: 0, bad: 0 }
    var usedCell = false
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          var p = { x: origin.x - (ci - controller.ci), y: origin.y + ri - controller.ri,
            z: origin.z - (si - controller.si) }
          inside(p)
          ticket(p)
          if (block(p) !== 'minecraft:air') throw new Error('structure footprint is occupied at ' + key(p))
          if (!sym || sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') continue
          var bid = null
          var facing = false
          // Use actual front-wall part predicates, not hard-coded slice/row coordinates.
          if (dynamo && si === controller.si && !result.dynamoPos && allows(sym, 'energy_output')) {
            bid = dynamo
            result.dynamoPos = p
            facing = true
          } else if (dynamo && si === controller.si && !result.busPos && allows(sym, 'input_bus')) {
            bid = 'gtceu:luv_input_bus'
            result.busPos = p
            facing = true
          } else if (towerCell && sym.kind === 'oneOf') {
            bid = usedCell ? S.W.casing : towerCell
            usedCell = true
          }
          plan.push({ p: p, id: bid || plain(sym), facing: facing })
        }
      })
    })
    if (dynamo && (!result.dynamoPos || !result.busPos)) throw new Error('missing front-wall bus/dynamo slots')
    if (towerCell && !usedCell) throw new Error('no capacitor cell slot')
    plan.forEach(function (c) { put(c.p, c.id, c.facing) })
    put(origin, id, true)
    return result
  }
  function panels(m) {
    return S.A.panelCells.map(function (p) {
      return { x: m.origin.x - Number(p.side), y: m.origin.y + Number(p.up) + 1, z: m.origin.z + Number(p.back) }
    })
  }
  // Level#canSeeSky reads sky light, which follows a placed or removed block once the light engine runs
  // (a tick or two, docs/eras/iv.md). The count is checked from the next tick, LIGHT_TICKS at most.
  function cover(m, count) {
    panels(m).forEach(function (p, i) {
      if (i < count) put(p, 'minecraft:stone', false)
      else if (S.owned[key(p)]) put(p, 'minecraft:air', false)
    })
    m.cover = { count: count, at: S.tick }
  }
  function coverSettled(m) {
    if (!m.cover) return true
    var lit = Number(S.A.litPanels(m.ctrl))
    var waited = S.tick - m.cover.at
    if (waited < 1 || (lit !== 64 - m.cover.count && waited < LIGHT_TICKS)) return false
    check('lit_' + m.cover.count + '_covered', lit === 64 - m.cover.count,
      'lit=' + lit + ', covered=' + m.cover.count + ' after ' + waited + ' ticks of light updates')
    m.cover = null
    return true
  }
  function recipeEU(recipe) { return Number(S.G.generators.recipeEUt(recipe)) }
  function phase(name) {
    S.phase = name
    S.phaseAt = S.tick
    emit('stage', 'NOTE', name)
  }
  function setup(m, wireless) {
    var ctrl = at(m.origin)
    if (!ctrl || !ctrl.isFormed()) return false
    m.ctrl = ctrl
    m.dynamo = at(m.dynamoPos)
    var bus = at(m.busPos)
    var parts = ctrl.getParts()
    check((wireless ? 'wireless' : 'ordinary') + '_FORMED', m.dynamo && bus &&
      parts.contains(m.dynamo) && parts.contains(bus), 'real GTM formed structure with selected parts')
    bus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(1))
    check('circuit_1', !bus.getCircuitInventory().getStackInSlot(0).isEmpty(), 'programmed circuit 1 in native bus')
    check((wireless ? 'wireless' : 'ordinary') + '_capacity',
      Number(S.G.generators.dynamoCapacity(ctrl)) === 65536 &&
      Number(m.dynamo.energyContainer.getOutputVoltage()) === 32768 &&
      Number(m.dynamo.energyContainer.getOutputAmperage()) === 2,
      'LuV 32768 V x 2 A = ' + S.G.generators.dynamoCapacity(ctrl) + ' EU/t')
    check('open_panels', Number(S.A.litPanels(ctrl)) === 64, 'all 64 panel sky checks open at fixed midnight')
    ctrl.getRecipeLogic().updateTickSubscription()
    return true
  }
  function measure(m) {
    var c = m.dynamo.energyContainer
    var energy = Number(c.getEnergyStored())
    m.total = m.removed + energy
    m.delta = m.total - m.previous
    m.previous = m.total
    var logic = m.ctrl.getRecipeLogic()
    var r = logic.getLastRecipe()
    m.status = String(logic.getStatus())
    m.progress = Number(logic.getProgress())
    m.parallels = r ? Number(r.parallels) : 0
    if (m.delta > 0) {
      var want = m.parallels === 63 ? PARTIAL : FULL
      if (m.delta === want && r && recipeEU(r) === want && Number(r.duration) === 400) m.good++
      else if (m.boundary === 0 && m.parallels === 63 && m.delta === FULL) m.boundary = 1 // the 64-panel run's last tick, read after the 63-panel run started
      else m.bad++
    } else if (m.delta < 0) m.bad++
    if (m.drain && energy > 0) {
      m.removed += energy
      c.setEnergyStored(0)
    }
  }
  function staticChecks() {
    var A = S.A
    check('api', A && A.machine && A.panelCells.length === 64 && Number(A.panels) === 64 && Number(A.duration) === 400,
      'published B2 machine, 64 panelCells and 400-tick run')
    var def = lazy().Registry.MACHINES.get(new (lazy().RL)(A.machine))
    check('generator', def && def.isGenerator() === true && def.isRegressWhenWaiting() === false,
      'native generator definition, regressWhenWaiting=false')
    var fixed = S.level.dimensionType().fixedTime()
    check('fixed_midnight', fixed.isPresent() && Number(fixed.getAsLong()) === 18000,
      S.dim + ' dimension fixed_time must be 18000; no clock mutation')
    var opt = S.server.getRecipeManager().byKey(new (lazy().RL)('grindless:orbital_solar/earth'))
    check('recipe_exists', opt.isPresent(), 'grindless:orbital_solar/earth')
    var r = opt.get()
    var contents = array(r.getInputContents(lazy().ItemCap))
    var circuit = contents.length === 1 && Number(contents[0].chance) === 0 &&
      String(lazy().ItemCap.serializer.toJson(lazy().ItemCap.of(contents[0].content))).indexOf('"configuration":1') >= 0
    var conditions = array(r.conditions)
    var dimensions = conditions.filter(function (c) {
      try { return String(c.getDimension().location()) === S.dim && c.isReverse() === false } catch (e) { return false }
    })
    check('recipe_contract', circuit && recipeEU(r) === 630 && Number(r.duration) === 400 &&
      conditions.length === 1 && dimensions.length === 1,
      'circuit 1 not consumed; orbit only, no day/night condition; 630 EU/t per panel for 400 ticks')
  }
  function optionalWireless() {
    var W = S.G.wireless
    var row = W && W.tierRow ? W.tierRow[6] : null
    var reason = ''
    if (!W || !row || !W.hatches || !W.hatches[WIRELESS_ID] || !Item.exists(WIRELESS_ID) ||
        !Item.exists(String(row.cell))) reason = 'A4 LuV wireless hatch/cell not integrated'
    else if (typeof W.track !== 'function' || typeof W.towerInfo !== 'function' || !S.G.structures[W.towerId]) {
      reason = 'wireless native tower/settlement API not available'
    } else if (W.paused || W.tracked(S.server).length !== 0 || Number(W.stored(S.server)) !== 0) {
      reason = 'requires an unpaused, empty shared network; run serially after other fixtures clean up'
    }
    if (reason) {
      global[COVERAGE] = REQUIRED + '; unresolved: ' + reason
      emit('wireless_REQUIRED', S.requireWireless ? 'FAIL' : 'NOTE', REQUIRED + '; ' + reason + '; no wireless proof claimed')
      finish()
      return
    }
    S.W = W
    S.networkOwned = true
    S.wireless = build(S.A.machine, { x: 15916, y: 200, z: 2 }, WIRELESS_ID, null)
    S.tower = build(W.towerId, { x: 15880, y: 200, z: 32 }, null, String(row.cell))
    phase('wireless_form')
  }
  function wirelessStep() {
    var m = S.wireless
    var W = S.W
    var elapsed = S.tick - S.phaseAt
    if (S.phase === 'wireless_form') {
      var tower = at(S.tower.origin)
      if (tower && tower.isFormed() && setup(m, true)) {
        var info = W.towerInfo(tower)
        check('wireless_tower', info.formed && Number(info.tier) === 6 && Number(info.cells) === 1,
          'real tower formed with one A4 LuV cell')
        S.tracked = [m.dynamoPos, S.tower.origin]
        S.tracked.forEach(function (p) {
          if (!W.track(S.level, pos(p))) throw new Error('native track refused fixture endpoint')
        })
        S.flow = S.dim + '|' + m.dynamoPos.x + '|' + m.dynamoPos.y + '|' + m.dynamoPos.z + '|'
        m.drain = false
        m.lastMade = 0
        m.lastIn = 0
        m.steady = 0
        m.good = 0
        phase('wireless_pay')
      } else if (elapsed > 400) throw new Error('wireless station/tower formation deadline')
      return
    }
    var flow = W.flows[S.flow] || { drained: 0, in: 0 }
    var drained = Number(flow.drained)
    var received = Number(flow.in)
    var made = drained + Number(m.dynamo.energyContainer.getEnergyStored())
    var delta = made - m.lastMade
    if (delta === FULL) m.good++
    else if (delta !== 0) m.bad++
    var last = m.ctrl.getRecipeLogic().getLastRecipe()
    if (last && (recipeEU(last) !== FULL || Number(last.parallels) !== 64)) m.bad++
    if (received - m.lastIn === 38304 * Number(W.settleTicks)) m.steady++
    m.lastIn = received
    m.lastMade = made
    if (m.good >= 60 && m.steady >= 3) {
      check('wireless_entry_5_percent', m.bad === 0 && drained > 0 && received * 20 === drained * 19 &&
        Number(W.stored(S.server)) === received && Number(W.status(S.server).tier) === 6,
        'automatic native settlement: generated=' + made + ', buffered=' + m.dynamo.energyContainer.getEnergyStored() +
        ', drained=' + drained + ', bank=' + received + '; ' + m.steady + ' windows at 38304 EU/t')
      global[COVERAGE] = 'ordinary and A4 wireless stages completed; see native PASS markers'
      finish()
    } else if (elapsed > 160) throw new Error('wireless automatic-settlement deadline; no manual settlement substitution')
  }
  function step() {
    if (!S || S.finished) return
    S.tick = Number(S.server.getTickCount()) - S.tick0
    if (Date.now() - S.requestedAt > 150000 || S.tick > 2800) throw new Error('overall deadline in ' + S.phase)
    if (S.phase.indexOf('wireless_') === 0) { wirelessStep(); return }
    var m = S.ordinary
    var elapsed = S.tick - S.phaseAt
    if (S.phase === 'form') {
      if (setup(m, false)) phase('full')
      else if (elapsed > 400) throw new Error('ordinary station formation deadline')
      return
    }
    measure(m)
    if (!coverSettled(m)) return
    if (S.phase === 'full') {
      if (m.good >= 40) {
        check('midnight_64', m.bad === 0 && m.parallels === 64, '40 measured working ticks at 40320 EU/t; no day/time commands')
        m.drain = false
        phase('fill')
      } else if (elapsed > 160) throw new Error('no sustained 64-panel orbital generation')
    } else if (S.phase === 'fill') {
      if (m.status === 'WAITING') {
        m.waitProgress = m.progress
        m.waitTotal = m.total
        check('backpressure_reached', m.progress > 0 && m.progress < 400, 'WAITING at ' + m.progress + '/400 with a backed-up native hatch')
        phase('hold')
      } else if (elapsed > 320) throw new Error('native dynamo never backed up')
    } else if (S.phase === 'hold') {
      if (m.status !== 'WAITING' || m.progress !== m.waitProgress || m.total !== m.waitTotal) {
        throw new Error('backpressure regressed progress or paid EU while blocked')
      }
      if (elapsed >= 60) {
        check('no_regress', true, '60 WAITING ticks; progress=' + m.progress + ', total EU unchanged=' + m.total)
        cover(m, 64)
        m.drain = true
        m.quiet = 0
        phase('covered_finish')
      }
    } else if (S.phase === 'covered_finish') {
      if (m.total > RUN_EU) throw new Error('covered field restarted or repaid progress: ' + m.total + ' > ' + RUN_EU)
      m.quiet = m.delta === 0 ? m.quiet + 1 : 0
      if (m.total === RUN_EU && m.quiet >= 60) {
        check('one_run_exact_payment', m.bad === 0, 'after backpressure, exactly 40320 x 400 = ' + m.total + ' EU, no duplicate payment')
        check('covered_refuses_next_run', m.status !== 'WORKING' && Number(S.A.litPanels(m.ctrl)) === 0,
          'all panels covered; completed cached run then 60 ticks without another EU payment')
        cover(m, 0)
        m.good = 0
        phase('restored')
      } else if (elapsed > 520) throw new Error('covered run did not finish with its exact original payment')
    } else if (S.phase === 'restored') {
      if (m.good >= 40) {
        check('restored_64', m.bad === 0 && m.parallels === 64, 'uncovering restarts generation at 40320 EU/t')
        cover(m, 1)
        m.partialGood = 0
        m.boundary = 0
        phase('partial')
      } else if (elapsed > 160) throw new Error('restoring panels did not resume generation')
    } else if (S.phase === 'partial') {
      if (m.parallels === 63 && m.delta === PARTIAL) m.partialGood++
      else if (m.partialGood > 0 && m.delta > 0) throw new Error('partial field did not remain at 63 panels')
      if (m.partialGood >= 40) {
        check('partial_63', m.bad === 0 && Number(S.A.litPanels(m.ctrl)) === 63,
          'next run repriced to 63 x 630 = 39690 EU/t for 40 measured ticks; run boundary ticks ' + m.boundary + ', bad ticks ' + m.bad)
        m.ctrl.setWorkingEnabled(false)
        optionalWireless()
      } else if (elapsed > 520) throw new Error('next run did not adopt the 63-panel price')
    }
  }
  function finish() {
    if (!S || S.finished) return
    S.finished = true
    var problems = []
    ;[S.ordinary, S.wireless].forEach(function (m) {
      try { if (m && m.ctrl) m.ctrl.setWorkingEnabled(false) } catch (e) { problems.push('disable: ' + e) }
    })
    if (S.W && S.tracked) S.tracked.forEach(function (p) {
      try { S.W.forget(S.level, pos(p)) } catch (e) { problems.push('forget: ' + e) }
    })
    if (S.networkOwned) {
      try {
        if (S.W.tracked(S.server).length === 0) S.W.setStored(S.server, 0)
        else problems.push('foreign wireless endpoint appeared; shared bank left untouched')
        if (S.flow) delete S.W.flows[S.flow]
      } catch (e) { problems.push('bank cleanup: ' + e) }
    }
    S.order.slice().reverse().forEach(function (p) {
      try {
        cmd('setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' minecraft:air replace')
        if (block(p) !== 'minecraft:air') problems.push('block remains ' + key(p))
      } catch (e) { problems.push('block ' + key(p) + ': ' + e) }
    })
    S.tickets.forEach(function (p) {
      try {
        cmd('forceload remove ' + p.x + ' ' + p.z)
        if (cmd('forceload query ' + p.x + ' ' + p.z) > 0) problems.push('ticket remains ' + p.x + ',' + p.z)
      } catch (e) { problems.push('ticket: ' + e) }
    })
    emit('cleanup', problems.length === 0 ? 'PASS' : 'FAIL',
      problems.length ? problems.join('; ') : S.order.length + ' owned blocks and ' + S.tickets.length + ' owned tickets removed; preexisting tickets retained')
    console.info('GGTEST|luv_orbital_solar|DONE')
  }
  function start(server) {
    var G = global.grindless
    S = { server: server, G: G, requestedAt: REQUESTED_AT || Date.now(),
      tick0: Number(server.getTickCount()), tick: 0, phaseAt: 0, phase: 'form',
      owned: {}, order: [], chunks: {}, tickets: [], finished: false,
      requireWireless: global.ggTestLuvOrbitalSolarRequireWireless === true }
    global[COVERAGE] = REQUIRED + '; not yet exercised'
    check('shared_registrations', G && G.orbits && G.orbits.earth && G.orbitalSolar && G.structures,
      'A1/B2 shared registrations required; no fixture substitutions')
    S.A = G.orbitalSolar
    S.dim = String(G.orbits.earth)
    S.level = server.getLevel(S.dim)
    check('orbit_loaded', S.level !== null && S.level !== undefined, S.dim)
    staticChecks()
    S.ordinary = build(S.A.machine, { x: 15888, y: 200, z: 2 }, 'gtceu:luv_energy_output_hatch', null)
    phase('form')
  }
  ServerEvents.customCommand('gg_test_luv_orbital_solar', function () {
    if ((S && !S.finished) || global[REQUEST] === true) {
      emit('request', 'NOTE', 'already requested/running; no second instance')
      return
    }
    REQUESTED_AT = Date.now()
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
      emit('exception', 'FAIL', (S ? S.phase : 'setup') + ': ' + e)
      if (S) finish()
      else {
        global[REQUEST] = false
        console.info('GGTEST|luv_orbital_solar|DONE')
      }
    }
  })
})()
