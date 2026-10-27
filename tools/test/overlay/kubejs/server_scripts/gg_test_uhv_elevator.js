// priority: -7824
// TEST ONLY, UHV-A7. Command: kubejs custom_command gg_test_uhv_elevator
// Band ONLY: X 28160-28223, Z 0-63, Overworld Y 60-104.
// Doubt: GTCA's space elevator (a GTCA machine, highTierContent off) runs our real recipe, the GEO lift
// (grindless:space_elevator/geo_lift) at UHV: the climber stays, one ribbon segment is worn, the stage comes out.
//   static_*    every published A7 recipe loads under its GTM id; the GTCA test recipes stay removed; machines and the stage exist
//   elevator_*  the preview shape with a UHV energy hatch and an HV input bus forms as SpaceElevatorMachine and runs the GEO lift
// No changed clock: the energy hatch is topped up every tick.
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestUhvElevatorRequest'
  var LOADED = Date.now()
  var X0 = 28160
  var X1 = 28223
  var Y0 = 60
  var Y1 = 104
  var NAME = 'uhv_elevator'
  var ELEVATOR = 'gtca:space_elevator'
  var RUN_ID = 'grindless:space_elevator/geo_lift'
  var STAGE = 'grindless:geo_assembled_stage'
  var CLIMBER = 'grindless:tether_climber'
  var SEGMENT = 'grindless:tether_ribbon_segment'

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Machines: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
    }
    return C
  }
  function rl(id) { return new (classes().RL)(id) }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function clean(s) { return String(s).replace(/\|/g, '/').replace(/\s+/g, ' ') }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
  function byId(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }
  function command(text) { return S.server.runCommandSilent('execute in minecraft:overworld run ' + text) }
  function machineDef(id) { return classes().Machines.MACHINES.get(rl(id)) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    command('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function setState(x, y, z, state) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    S.level.setBlock(pos(x, y, z), state, 3)
  }
  function machine(p) { return classes().Meta.getMachine(S.level, p) }
  function partIds(ctrl) {
    var out = {}
    array(ctrl.getParts()).forEach(function (p) { out[String(p.getDefinition().getId())] = true })
    return Object.keys(out)
  }
  function partsLike(ctrl, re) {
    var out = []
    array(ctrl.getParts()).forEach(function (p) { if (re.test(String(p.getDefinition().getId()))) out.push(p) })
    return out
  }
  function busItems(p) {
    var st = p.getInventory().storage
    var t = {}
    for (var i = 0; i < st.getSlots(); i++) {
      var s = st.getStackInSlot(i)
      if (s.isEmpty()) continue
      var id = String(classes().Registries.ITEMS.getKey(s.getItem()))
      t[id] = (t[id] || 0) + Number(s.getCount())
    }
    return t
  }
  function busFill(p, list) {
    var st = p.getInventory().storage
    list.forEach(function (x, i) { st.setStackInSlot(i, Item.of(x.id, x.count)) })
  }
  function topUp(list) { list.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }) }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }

  // ---------------------------------------------------------------- static
  function statics() {
    var E = global.grindless && global.grindless.elevator
    if (!E || !E.run) { check('static_published', false, 'global.grindless.elevator has no recipes'); return }
    var skipped = {}
    ;(E.skipped || []).forEach(function (s) { skipped[String(s.name || s)] = true })
    var all = E.recipes.concat(E.side, E.blockRecipes, E.run)
    var missing = []
    var present = 0
    all.forEach(function (r) {
      if (skipped[r.name]) return
      if (byId(r.recipeId) === null) missing.push(r.recipeId)
      else present++
    })
    ;['plant', 'works', 'elevator'].forEach(function (k) {
      if (byId(E.crafting[k]) === null) missing.push(E.crafting[k])
      else present++
    })
    check('static_recipes', missing.length === 0, present + ' present; missing ' + (missing.join(' ') || 'none') +
      '; skipped ' + (Object.keys(skipped).join(' ') || 'none') + '; clashes ' + ((E.clashes || []).length))
    check('static_clashes', (E.clashes || []).length === 0, JSON.stringify(E.clashes || []))
    var gtcaTest = ['gtceu:space_miner/ha', 'gtceu:space_pump/test'].filter(function (id) { return byId(id) !== null })
    check('static_gtca_test_recipes_removed', gtcaTest.length === 0, 'still present: ' + (gtcaTest.join(' ') || 'none'))
    var defs = ['gtceu:pbo_plant', 'gtceu:tether_ribbon_works', ELEVATOR].filter(function (id) { return !machineDef(id) })
    check('static_machines', defs.length === 0, 'missing ' + (defs.join(' ') || 'none'))
    check('static_stage_item', Item.exists(STAGE), STAGE)
    var run = byId(RUN_ID)
    if (run !== null) note('static_geo_lift', 'type ' + String(run.getType()) + ', duration ' + run.duration)
  }

  // ---------------------------------------------------------------- the elevator
  function shapeCells(id) {
    var def = machineDef(id)
    if (!def) throw new Error('no machine ' + id)
    var shapes = array(def.getMatchingShapes())
    if (shapes.length === 0) throw new Error('no preview shape for ' + id)
    var blocks = shapes[0].getBlocks()
    var out = []
    for (var x = 0; x < blocks.length; x++) for (var y = 0; y < blocks[x].length; y++) for (var z = 0; z < blocks[x][y].length; z++) {
      var info = blocks[x][y][z]
      if (info === null || info === undefined) continue
      var state = info.getBlockState()
      out.push({ x: x, y: y, z: z, state: state, id: String(Block.getId(state.getBlock())) })
    }
    return out
  }
  function buildElevator() {
    var cells = shapeCells(ELEVATOR)
    var ox = 28171
    var oz = 14
    var ctrl = null
    var swapped = []
    cells.forEach(function (c) {
      if (c.id === 'minecraft:air') return
      var x = ox + c.x
      var y = Y0 + c.y
      var z = oz + c.z
      if (/energy_input_hatch/.test(c.id)) { put(x, y, z, 'gtceu:uhv_energy_input_hatch'); swapped.push(c.id + '>uhv hatch') }
      else if (/input_bus/.test(c.id)) { put(x, y, z, 'gtceu:hv_input_bus'); swapped.push(c.id + '>hv bus') }
      else setState(x, y, z, c.state)
      if (c.id === ELEVATOR) ctrl = pos(x, y, z)
    })
    if (ctrl === null) throw new Error('no controller in the preview')
    note('elevator_placed', 'controller at ' + ctrl.getX() + ',' + ctrl.getY() + ',' + ctrl.getZ() + '; swapped ' + swapped.join(' '))
    return { pos: ctrl, phase: 'forming', started: S.tick }
  }
  function tickElevator(v) {
    var m = machine(v.pos)
    var waited = S.tick - v.started
    if (v.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check('elevator_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); v.phase = 'done' }
        return
      }
      v.m = m
      var cls = String(m.getClass().getSimpleName())
      check('elevator_formed', cls === 'SpaceElevatorMachine', 'class ' + cls + ', parts ' + partIds(m).join(' '))
      v.energy = partsLike(m, /energy_input_hatch/)
      v.inBus = partsLike(m, /input_bus/)[0]
      v.outBus = partsLike(m, /output_bus/)[0]
      if (!v.inBus || !v.outBus || v.energy.length === 0) {
        check('elevator_io', false, 'input bus ' + !!v.inBus + ', output bus ' + !!v.outBus + ', energy hatches ' + v.energy.length)
        v.phase = 'done'
        return
      }
      busFill(v.inBus, [
        { id: CLIMBER, count: 1 }, { id: SEGMENT, count: 1 }, { id: 'grindless:thruster_pod', count: 1 },
        { id: 'grindless:sic_power_module', count: 2 }, { id: 'gtceu:neutronium_plate', count: 8 }
      ])
      topUp(v.energy)
      m.getRecipeLogic().updateTickSubscription()
      v.phase = 'running'
      v.started = S.tick
      return
    }
    topUp(v.energy)
    var got = busItems(v.outBus)[STAGE] || 0
    if (got > 0 || waited > 1200) {
      var rlg = v.m.getRecipeLogic()
      var last = rlg.getLastRecipe()
      var lastId = last ? String(last.id) : 'none'
      var left = busItems(v.inBus)
      check('elevator_geo_lift', got === 1 && lastId === RUN_ID, 'stage out ' + got + ' after ' + waited + ' t, last ' + lastId +
        ', reasons ' + String(rlg.getFailureReasons()))
      check('elevator_wear', (left[CLIMBER] || 0) === 1 && !left[SEGMENT] && !left['grindless:thruster_pod'] &&
        !left['grindless:sic_power_module'] && !left['gtceu:neutronium_plate'], 'input bus after the run ' + JSON.stringify(left))
      v.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- driver
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
    S = { server: server, tick: 0, failed: 0, finished: false }
    S.level = server.getLevel('minecraft:overworld')
    try { statics() } catch (e) { check('static_exception', false, String(e)) }
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { S.elev = buildElevator() } catch (e) { check('elevator_place_exception', false, String(e)); S.elev = { phase: 'done' } }
  }
  ServerEvents.customCommand('gg_test_uhv_elevator', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      if (S.elev.phase !== 'done') {
        try { tickElevator(S.elev) } catch (e) { check('elevator_exception', false, 'phase ' + S.elev.phase + ': ' + e); S.elev.phase = 'done' }
      }
      if (S.elev.phase === 'done') finish()
      else if (S.tick > 2400) { check('deadline', false, '2400-tick ceiling; phase ' + S.elev.phase); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, String(e))
      finish()
    }
  })
})()
