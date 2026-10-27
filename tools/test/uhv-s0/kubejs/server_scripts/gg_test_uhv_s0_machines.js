// TEST ONLY, UHV-S0. Command: kubejs custom_command gg_test_uhv_s0_machines
// Disposable spikes, never shipped. Reserved band ONLY: X 27904-27967, Z 0-63, Overworld Y 60-112 (and the same X/Z, Y 100, in
// grindless:proxima_b_orbit and minecraft:the_end for one wireless hatch each).
//   s0_2_*   the startup 'gcyr:rocket_motor' (tier 5) and 'gcyr:fuel_tank' (tier 13) builders: the block class and tier each one makes
//   s0_3_*   GCYR's Proxima b after the datapack override: orbit world, level, tier; the orbit level exists; G.orbits holds it
//   s0_4_*   G.stations.slots with the two extra `more` rows (deploy and disk save: the client test gg_test_uhv_s0_stations)
//   s0_5_*   the tier 9 (UHV) wireless row: hatches, cell, recipes with grindless:nuclear_clock; a four-UHV-cell tower, the store set to
//            62,914,560,000 EU, status and readout; one UHV 64 A hatch filled by a settlement (the per-window cap)
//   s0_6_*   a lib/generators.js multiblock (gtceu:s0_swarm_control): 4 consumed + 60 kept segments, oganesson, 8,388,608 EU/t written,
//            measured at the dynamo; worn segments out
//   s0_7_*   the wireless settlement fills a UV hatch in grindless:proxima_b_orbit and in minecraft:the_end (no planet pair)
//   s0_8_*   GTCA's space elevator (preview shape) forms and runs a KubeJS space_elevator recipe; an assembler module in its first slot
//            forms, is enabled and runs a KubeJS space_assembler recipe
// No changed clock: energy hatches are topped up, inputs put in buses and hatches.
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestUhvS0MachinesRequest'
  var LOADED = Date.now()
  var X0 = 27904
  var X1 = 27967
  var Y0 = 60
  var Y1 = 112
  var NAME = 'uhv_s0'
  var BIG = 62914560000
  var SWARM = 'gtceu:s0_swarm_control'
  var SWARM_C2 = 'grindless:s0_swarm_c2'
  var SWARM_C1 = 'grindless:s0_swarm_c1'
  var ELEV_RECIPE = 'grindless:s0_space_elevator'
  var ASM_RECIPE = 'grindless:s0_space_assembler'
  // GTM stores builder ids as <namespace>:<recipe type path>/<name>
  var SWARM_C2_REAL = 'grindless:s0_dyson_swarm/s0_swarm_c2'
  var SWARM_C1_REAL = 'grindless:s0_dyson_swarm/s0_swarm_c1'
  var ELEV_RECIPE_REAL = 'grindless:space_elevator/s0_space_elevator'
  var ASM_RECIPE_REAL = 'grindless:space_assembler/s0_space_assembler'
  var REMOTE = [{ dim: 'grindless:proxima_b_orbit', x: 27960, y: 100, z: 8 }, { dim: 'minecraft:the_end', x: 27960, y: 100, z: 8 }]

  ServerEvents.recipes(function (event) {
    event.recipes.gtceu.s0_dyson_swarm(SWARM_C2)
      .notConsumable('60x grindless:s0_segment')
      .itemInputs('4x grindless:s0_segment')
      .inputFluids('gtceu:oganesson 400')
      .itemOutputs('4x grindless:s0_worn_segment')
      .EUt(-8388608)
      .duration(20)
    event.recipes.gtceu.s0_dyson_swarm(SWARM_C1)
      .notConsumable('16x grindless:s0_segment')
      .itemInputs('1x grindless:s0_segment')
      .inputFluids('gtceu:krypton 100')
      .itemOutputs('1x grindless:s0_worn_segment')
      .EUt(-2097152)
      .duration(20)
    event.recipes.gtceu.space_elevator(ELEV_RECIPE)
      .itemInputs('minecraft:cobblestone')
      .itemOutputs('minecraft:stone')
      .EUt(7)
      .duration(20)
    event.recipes.gtceu.space_assembler(ASM_RECIPE)
      .itemInputs('minecraft:stone')
      .itemOutputs('minecraft:smooth_stone')
      .EUt(7)
      .duration(20)
  })

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Machines: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      PlanetData: Java.loadClass('argent_matter.gcyr.data.loader.PlanetData'),
      MotorBlock: Java.loadClass('argent_matter.gcyr.common.block.RocketMotorBlock'),
      TankBlock: Java.loadClass('argent_matter.gcyr.common.block.FuelTankBlock')
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
  function command(text, dim) { return S.server.runCommandSilent('execute in ' + (dim || 'minecraft:overworld') + ' run ' + text) }
  function fluidId(stack) { return String(classes().Registries.FLUIDS.getKey(stack.getFluid())) }
  function outEUt(r) { try { return Number(r.getOutputEUt().getTotalEU()) } catch (e) { return -1 } }
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
  function machine(level, p) { return classes().Meta.getMachine(level, p) }
  function partsById(ctrl) {
    var out = {}
    array(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (!out[pid]) out[pid] = []
      out[pid].push(p)
    })
    return out
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
  function busPut(p, id, count) { p.getInventory().storage.setStackInSlot(0, Item.of(id, count)) }
  function topUp(list) { list.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }) }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }

  // ---------------------------------------------------------------- static: S0-2, S0-3, S0-4, S0-5 registry, S0-6 recipe figures
  function statics() {
    var L = classes()
    ;[['grindless:s0_uhv_motor', 'gcyr:rocket_motor', 5], ['grindless:s0_uhv_tank', 'gcyr:fuel_tank', 13]].forEach(function (p) {
      var b = Block.getBlock(p[0])
      var cls = b === null || b === undefined ? 'absent' : String(b.getClass().getName())
      var isMotor = b instanceof L.MotorBlock
      var isTank = b instanceof L.TankBlock
      var tier = -1
      try { tier = Number(b.getTier()) } catch (e) { tier = -1 }
      var detail = p[1] + ' builder made ' + cls + ' (motor ' + isMotor + ', tank ' + isTank + ', getTier ' + tier + ')'
      if (p[1] === 'gcyr:rocket_motor') check('s0_2_motor_builder', isMotor && tier === p[2], detail)
      else check('s0_2_tank_builder', isTank && tier === p[2], detail)
    })
    ;['gcyr:basic_rocket_motor', 'gcyr:advanced_rocket_motor', 'gcyr:elite_rocket_motor', 'grindless:bnnt_fuel_tank', 'grindless:s0_motor6'].forEach(function (id) {
      var b = Block.getBlock(id)
      var t = -1
      try { t = Number(b.getTier()) } catch (e) { t = -1 }
      note('s0_2_tier_' + id.replace(/^[a-z]+:/, ''), id + ' ' + (b ? String(b.getClass().getSimpleName()) : 'absent') + ' tier ' + t)
    })

    var pl = L.PlanetData.getPlanet(rl('gcyr:proxima_centauri_b'))
    var text = String(pl)
    var orbit = ''
    var lvl = ''
    var tier = -1
    try { orbit = String(pl.orbitWorld().location()) } catch (e) { orbit = 'unreadable ' + e }
    try { lvl = String(pl.level().location()) } catch (e) { lvl = 'unreadable ' + e }
    try { tier = Number(pl.rocketTier()) } catch (e) { tier = -1 }
    check('s0_3_orbit_world', orbit === 'grindless:proxima_b_orbit', 'orbitWorld ' + orbit + ' / ' + text)
    check('s0_3_surface_kept', lvl === 'gcyr:proxima_centauri_b' && tier === 8, 'level ' + lvl + ', tier ' + tier)
    var ol = S.server.getLevel('grindless:proxima_b_orbit')
    check('s0_3_orbit_level', ol !== null && ol !== undefined, 'server level grindless:proxima_b_orbit ' + (ol ? 'exists' : 'missing'))
    var sl = S.server.getLevel('gcyr:proxima_centauri_b')
    check('s0_3_surface_level', sl !== null && sl !== undefined, 'server level gcyr:proxima_centauri_b ' + (sl ? 'exists' : 'missing'))
    try {
      var RK = Java.loadClass('net.minecraft.resources.ResourceKey')
      var DIM = Java.loadClass('net.minecraft.core.registries.Registries').DIMENSION
      var back = L.PlanetData.getPlanetFromOrbit(RK.create(DIM, rl('grindless:proxima_b_orbit')))
      note('s0_3_from_orbit', 'getPlanetFromOrbit ' + String(back && back.isPresent && back.isPresent() ? back.get().level().location() : back))
    } catch (e) { note('s0_3_from_orbit', 'unreadable ' + e) }
    var G = global.grindless
    check('s0_3_g_orbits', G.orbits.dimensions.indexOf('grindless:proxima_b_orbit') >= 0, 'G.orbits.dimensions ' + G.orbits.dimensions.join(' '))

    var slots = G.stations.slots.map(function (s) { return s.slot + '=' + s.orbit })
    check('s0_4_slots', slots.length === 8 && slots[6] === 'mercury=gcyr:mercury_orbit' && slots[7] === 'proxima=grindless:proxima_b_orbit',
      slots.length + ' slots: ' + slots.join(' '))

    var W = global.grindless.wireless
    var row = W.tierRow[9]
    check('s0_5_row', !!row && row.capacity === BIG && row.link === 'grindless:nuclear_clock', row ? JSON.stringify(row) : 'no tier 9 row')
    var cell = W.cells['grindless:uhv_smes_cell']
    check('s0_5_cell', !!cell && Number(cell.capacity) === BIG && !!Block.getBlock('grindless:uhv_smes_cell'),
      cell ? 'cell tier ' + cell.tier + ' capacity ' + cell.capacity : 'no cell entry')
    var hs = []
    W.hatchKindList.forEach(function (kind) { W.hatchAmps.forEach(function (amps) {
      var hid = W.hatchId(kind, 9, amps)
      hs.push(hid.replace('gtceu:', '') + '=' + (machineDef(hid) ? 'yes' : 'NO') + ' cap/window ' + (W.rate(9, amps) * W.settleTicks))
    }) })
    check('s0_5_uhv_hatches', hs.join(' ').indexOf('=NO') < 0, hs.join(', '))
    var rids = []
    var missing = []
    var withClock = 0
    W.recipes.filter(function (r) { return r.builderId.indexOf('grindless:uhv_') === 0 }).forEach(function (r) {
      rids.push(r.id)
      var real = byId(r.id)
      if (real === null) missing.push(r.id)
      if (r.inputs.join(' ').indexOf('grindless:nuclear_clock') >= 0) withClock++
    })
    check('s0_5_recipes', rids.length > 0 && missing.length === 0 && withClock > 0,
      rids.length + ' UHV recipes, ' + withClock + ' with the clock; missing ' + (missing.length ? missing.join(' ') : 'none'))

    var c2 = byId(SWARM_C2_REAL)
    var c1 = byId(SWARM_C1_REAL)
    check('s0_6_recipe_figures', c2 !== null && outEUt(c2) === 8388608 && c1 !== null && outEUt(c1) === 2097152,
      'c2 ' + (c2 ? outEUt(c2) + ' EU/t x ' + Number(c2.duration) : 'absent') + '; c1 ' + (c1 ? outEUt(c1) + ' EU/t x ' + Number(c1.duration) : 'absent'))
    ;[ELEV_RECIPE_REAL, ASM_RECIPE_REAL].forEach(function (id) { check('s0_8_recipe_' + id.replace(/^.*\//, ''), byId(id) !== null, id + (byId(id) ? ' loaded' : ' absent')) })
  }

  // ---------------------------------------------------------------- structures from lib/patterns.js descriptions
  function plan(desc, p) {
    var ctrl = null
    desc.slices.forEach(function (rows, si) { rows.forEach(function (row, ri) {
      for (var ci = 0; ci < row.length; ci++) { var s = desc.symbols[row.charAt(ci)]; if (s && s.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci } }
    }) })
    var out = []
    desc.slices.forEach(function (rows, si) { rows.forEach(function (row, ri) {
      for (var ci = 0; ci < row.length; ci++) {
        var ch = row.charAt(ci)
        if (ch === ' ') continue
        out.push({ x: p.x - (ci - ctrl.ci), y: p.y + (ri - ctrl.ri), z: p.z - (si - ctrl.si), ch: ch, sym: desc.symbols[ch] })
      }
    }) })
    return out
  }
  function defaultBlock(sym) {
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    if (sym.kind === 'blocks') return sym.blocks[0]
    if (sym.kind === 'oneOf') {
      for (var k = 0; k < sym.options.length; k++) if (sym.options[k].kind === 'blocks') return sym.options[k].blocks[0]
    }
    return null
  }

  // ---------------------------------------------------------------- S0-5 and S0-7: the UHV tower, the store, remote hatches
  function buildTower() {
    var W = global.grindless.wireless
    var cell = W.tierRow[9].cell
    var at = { x: 27958, y: Y0, z: 56 }
    var used = 0
    var slots = 0
    plan(global.grindless.structures[W.towerId], at).forEach(function (c) {
      var kind = c.sym.kind
      if (kind === 'controller' || kind === 'air' || kind === 'any') return
      var id = defaultBlock(c.sym)
      if (kind === 'oneOf') { slots++; id = used < 4 ? cell : W.casing; used++ }
      put(c.x, c.y, c.z, id)
    })
    put(at.x, at.y, at.z, W.towerId + '[facing=north]')
    note('s0_5_tower', 'cell ' + cell + ' x ' + Math.min(4, slots) + ' of ' + slots + ' slots')
    return { pos: pos(at.x, at.y, at.z), phase: 'forming', started: S.tick }
  }
  function placeHatch(dim, x, y, z, id) {
    if (x < X0 || x > X1 || z < 0 || z > 63) throw new Error('refused hatch outside the band')
    command('forceload add ' + x + ' ' + z, dim)
    command('setblock ' + x + ' ' + y + ' ' + z + ' ' + id + ' replace', dim)
    var level = S.server.getLevel(dim)
    var p = pos(x, y, z)
    var tracked = global.grindless.wireless.track(level, p)
    return { dim: dim, level: level, pos: p, id: id, tracked: tracked }
  }
  function hatchEnergy(h) {
    var m = machine(h.level, h.pos)
    if (!m) return { stored: -1, capacity: -1 }
    return { stored: Number(m.energyContainer.getEnergyStored()), capacity: Number(m.energyContainer.getEnergyCapacity()) }
  }
  function tickTower(t) {
    if (t.phase === 'done') return
    var m = machine(S.level, t.pos)
    var waited = S.tick - t.started
    if (!m) { if (waited > 600) { check('s0_5_formed', false, 'no controller'); t.phase = 'done' } return }
    if (!formCheck(m, waited)) {
      if (waited > 400) { check('s0_5_formed', false, 'not formed: ' + why(m)); t.phase = 'done' }
      return
    }
    var W = global.grindless.wireless
    W.dropCache()
    W.paused = false
    W.track(S.level, t.pos)
    var st = W.settle(S.server)
    check('s0_5_network', st.up && Number(st.tier) === 9 && Number(st.capacity) === 4 * BIG,
      'up ' + st.up + ', towers ' + st.towers + ', capacity ' + st.capacity + ', tier ' + st.tier)
    W.setStored(S.server, BIG)
    var stored = Number(W.stored(S.server))
    check('s0_5_stored', stored === BIG, 'set ' + BIG + ', read back ' + stored)
    var s2 = W.status(S.server)
    var comp = W.readout(S.server, 0, false)
    var cargs = comp.getContents().getArgs()
    var text = String(comp.getContents().getKey())
    for (var ai = 0; ai < cargs.length; ai++) text += ' / ' + String(cargs[ai])
    note('s0_5_status', 'stored ' + s2.stored + ' capacity ' + s2.capacity + ' up ' + s2.up)
    var digits = text.replace(/[^0-9]/g, '')
    check('s0_5_readout', digits.indexOf('62914560000') >= 0 || text.indexOf('62.91') >= 0, 'readout ' + text)

    // one UHV 64 A hatch here, one UV 2 A hatch in each remote dimension: a single settlement fills them
    var local = placeHatch('minecraft:overworld', 27950, Y0, 60, W.hatchId('hatch', 9, 64))
    var remotes = REMOTE.map(function (r) { return placeHatch(r.dim, r.x, r.y, r.z, W.hatchId('hatch', 8, 2)) })
    note('s0_5_hatch_tracked', JSON.stringify(local.tracked) + ' ' + remotes.map(function (r) { return JSON.stringify(r.tracked) }).join(' '))
    var before = Number(W.stored(S.server))
    var st2 = W.settle(S.server)
    var le = hatchEnergy(local)
    var cap = W.rate(9, 64) * W.settleTicks
    check('s0_5_hatch_window', le.stored === Math.min(cap, le.capacity),
      'UHV 64 A hatch got ' + le.stored + ' of capacity ' + le.capacity + ', window cap ' + cap + ' (2^31 = 2147483648); settle in ' + st2.in + ' out ' + st2.out)
    remotes.forEach(function (r) {
      var e = hatchEnergy(r)
      var want = Math.min(W.rate(8, 2) * W.settleTicks, e.capacity)
      check('s0_7_wireless_' + r.dim.replace(/^[a-z]+:/, ''), r.tracked !== null && e.stored === want,
        r.dim + ' UV 2 A hatch got ' + e.stored + ' (window ' + want + ', capacity ' + e.capacity + ')')
    })
    note('s0_5_store_after', 'store ' + before + ' -> ' + Number(W.stored(S.server)))
    t.phase = 'done'
  }

  // ---------------------------------------------------------------- S0-6: the swarm control generator
  function buildSwarm() {
    var at = { x: 27908, y: Y0 + 1, z: 56 }
    var map = { E: 'gtceu:uhv_energy_output_hatch_4a', I: 'gtceu:hv_input_hatch', B: 'gtceu:lv_input_bus', O: 'gtceu:lv_output_bus' }
    plan(global.grindless.structures[SWARM], at).forEach(function (c) {
      if (c.sym.kind === 'controller' || c.sym.kind === 'air') return
      put(c.x, c.y, c.z, map[c.ch] || defaultBlock(c.sym))
    })
    put(at.x, at.y, at.z, SWARM + '[facing=north]')
    return { pos: pos(at.x, at.y, at.z), phase: 'forming', started: S.tick, eu: 0, runs: [], idle: 0 }
  }
  function tickSwarm(g) {
    if (g.phase === 'done') return
    var m = machine(S.level, g.pos)
    var waited = S.tick - g.started
    if (!m) { if (waited > 600) { check('s0_6_formed', false, 'no controller'); g.phase = 'done' } return }
    if (g.phase === 'forming') {
      if (!formCheck(m, waited)) {
        if (waited > 400) { check('s0_6_formed', false, 'not formed: ' + why(m)); g.phase = 'done' }
        return
      }
      var P = partsById(m)
      g.dyn = P['gtceu:uhv_energy_output_hatch_4a'] || []
      g.bus = (P['gtceu:lv_input_bus'] || [])[0]
      g.out = (P['gtceu:lv_output_bus'] || [])[0]
      g.hatch = (P['gtceu:hv_input_hatch'] || [])[0]
      check('s0_6_formed', g.dyn.length === 1 && !!g.bus && !!g.out && !!g.hatch, 'parts ' + Object.keys(P).join(' '))
      if (!(g.dyn.length === 1 && g.bus && g.out && g.hatch)) { g.phase = 'done'; return }
      note('s0_6_dynamo', 'capacity ' + Number(g.dyn[0].energyContainer.getEnergyCapacity()) + ', output ' +
        Number(g.dyn[0].energyContainer.getOutputVoltage()) + ' V x ' + Number(g.dyn[0].energyContainer.getOutputAmperage()) + ' A; lib dynamoCapacity ' +
        global.grindless.generators.dynamoCapacity(m))
      busPut(g.bus, 'grindless:s0_segment', 64)
      g.hatch.tank.setFluidInTank(0, Fluid.of('gtceu:oganesson', 1000).getFluidStack())
      m.getRecipeLogic().updateTickSubscription()
      g.phase = 'running'
      g.started = S.tick
      return
    }
    var c = g.dyn[0].energyContainer
    var e = Number(c.getEnergyStored())
    if (e > 0) { g.eu += e; c.setEnergyStored(0) }
    var rlg = m.getRecipeLogic()
    var last = rlg.getLastRecipe()
    var status = String(rlg.getStatus())
    if (status === 'WORKING' && last !== null && last !== undefined && g.runs.length === 0) {
      g.runs.push({ id: String(last.id), out: outEUt(last), par: Number(last.parallels), dur: Number(rlg.getDuration()) })
    }
    g.idle = status === 'WORKING' ? 0 : g.idle + 1
    if ((g.eu > 0 && g.idle >= 60) || S.tick - g.started > 600) {
      var outItems = busItems(g.out)
      var inItems = busItems(g.bus)
      var fl = g.hatch.tank.getFluidInTank(0)
      var left = fl.isEmpty() ? 0 : Number(fl.getAmount())
      var worn = outItems['grindless:s0_worn_segment'] || 0
      var runs = worn / 4
      note('s0_6_run', JSON.stringify(g.runs) + '; reasons ' + String(rlg.getFailureReasons()))
      check('s0_6_written_rate', g.runs.length === 1 && g.runs[0].id === SWARM_C2_REAL && g.runs[0].out === 8388608 && g.runs[0].par === 1,
        'run ' + JSON.stringify(g.runs[0] || null) + ' (written 8388608 EU/t, 1 parallel = not doubled)')
      check('s0_6_measured_eu', runs >= 1 && g.eu === 167772160 * runs, 'drained ' + g.eu + ' EU at the dynamo over ' + runs + ' run(s); one run = 167772160')
      check('s0_6_wear', worn === 4 && (inItems['grindless:s0_segment'] || 0) === 60 && left === 600,
        'worn out ' + worn + ', segments left ' + (inItems['grindless:s0_segment'] || 0) + ', oganesson left ' + left + ' mB of 1000 (runs ' + runs + ')')
      g.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- S0-8: GTCA's space elevator and an assembler module
  function shapeOf(id) {
    var def = machineDef(id)
    if (!def) throw new Error('no machine ' + id)
    var shapes = array(def.getMatchingShapes())
    if (shapes.length === 0) throw new Error('no preview shape for ' + id)
    return shapes[0]
  }
  function blocksOf(shape) {
    var blocks = shape.getBlocks()
    var out = []
    for (var x = 0; x < blocks.length; x++) for (var y = 0; y < blocks[x].length; y++) for (var z = 0; z < blocks[x][y].length; z++) {
      var info = blocks[x][y][z]
      if (info === null || info === undefined) continue
      var state = info.getBlockState()
      out.push({ x: x, y: y, z: z, state: state, id: String(Block.getId(state.getBlock())) })
    }
    return out
  }
  function placePreview(id, ox, oy, oz, swap) {
    var cells = blocksOf(shapeOf(id))
    var ctrl = null
    cells.forEach(function (c) {
      if (c.id === 'minecraft:air') return
      var s = swap && swap[c.x + ',' + c.y + ',' + c.z]
      if (s) put(ox + c.x, oy + c.y, oz + c.z, s)
      else setState(ox + c.x, oy + c.y, oz + c.z, c.state)
      if (c.id === id) ctrl = pos(ox + c.x, oy + c.y, oz + c.z)
    })
    if (ctrl === null) throw new Error('no controller in the preview of ' + id)
    return ctrl
  }
  function controllerCell(id) {
    var cells = blocksOf(shapeOf(id))
    for (var i = 0; i < cells.length; i++) if (cells[i].id === id) return cells[i]
    return null
  }
  function slotText(si) {
    var t = String(si)
    if (t.indexOf('@') < 0) return t
    try {
      var fs = si.getClass().getDeclaredFields()
      var parts = []
      for (var i = 0; i < fs.length; i++) { fs[i].setAccessible(true); parts.push(String(fs[i].getName()) + '=' + String(fs[i].get(si))) }
      return parts.join(' ')
    } catch (e) { return t + ' (fields refused ' + e + ')' }
  }
  function slotField(si, name) {
    try { var f = si.getClass().getDeclaredField(name); f.setAccessible(true); return f.get(si) } catch (e) { }
    try { return si[name]() } catch (e2) { return null }
  }
  function buildElevator() {
    var ctrl = placePreview('gtca:space_elevator', 27915, Y0, 14, null)
    note('s0_8_elevator_placed', 'controller at ' + ctrl.getX() + ',' + ctrl.getY() + ',' + ctrl.getZ() + ' facing ' + String(S.level.getBlockState(ctrl)))
    return { pos: ctrl, phase: 'forming', started: S.tick }
  }
  function tickElevator(v) {
    if (v.phase === 'done') return
    var m = machine(S.level, v.pos)
    var waited = S.tick - v.started
    if (!m) { if (waited > 600) { check('s0_8_elevator_formed', false, 'no controller'); v.phase = 'done' } return }
    if (v.phase === 'forming') {
      if (!formCheck(m, waited)) {
        if (waited > 600) { check('s0_8_elevator_formed', false, 'not formed: ' + why(m)); v.phase = 'done' }
        return
      }
      v.m = m
      var P = partsById(m)
      check('s0_8_elevator_formed', true, 'class ' + m.getClass().getSimpleName() + ', parts ' + Object.keys(P).join(' '))
      var info = []
      ;['getMotorTier', 'getUnlockedModuleSlots', 'getModulesFound', 'getModulesValid', 'getModulesActive'].forEach(function (k) {
        try { info.push(k + ' ' + m[k]()) } catch (e) { info.push(k + ' ?') }
      })
      note('s0_8_elevator_info', info.join(', '))
      v.energy = partsLike(m, /energy_input_hatch/)
      v.inBus = partsLike(m, /input_bus/)[0]
      v.outBus = partsLike(m, /output_bus/)[0]
      try { m.rescanSlots() } catch (e) { }
      var slots = []
      try { slots = array(m.getSlotInfos()) } catch (e) { note('s0_8_slots', 'unreadable ' + e) }
      note('s0_8_slots', slots.length + ' slots: ' + slots.map(slotText).join(' ; '))
      v.slots = slots
      if (v.inBus) busPut(v.inBus, 'minecraft:cobblestone', 4)
      m.getRecipeLogic().updateTickSubscription()
      v.phase = 'running'
      v.started = S.tick
      v.module = null
      return
    }
    topUp(v.energy)
    if (v.phase === 'running') {
      var got = v.outBus ? (busItems(v.outBus)['minecraft:stone'] || 0) : 0
      if (got > 0 || S.tick - v.started > 300) {
        var rlg = v.m.getRecipeLogic()
        var last = rlg.getLastRecipe()
        check('s0_8_elevator_runs', got > 0, 'stone out ' + got + ', last ' + (last ? String(last.id) : 'none') + ', reasons ' + String(rlg.getFailureReasons()))
        v.phase = 'module'
        v.module = placeModule(v)
        v.started = S.tick
      }
      return
    }
    if (v.phase === 'module') tickModule(v)
  }
  function placeModule(v) {
    var id = 'gtca:space_assembler_mki'
    var slot = v.slots.length > 0 ? v.slots[0] : null
    var wp = slot === null ? null : (slotField(slot, 'pos') || slotField(slot, 'worldPos'))
    if (wp === null) { check('s0_8_module_formed', false, 'no slot world position: ' + (slot ? slotText(slot) : 'no slots')); return null }
    var cc = controllerCell(id)
    var ox = Number(wp.getX()) - cc.x
    var oy = Number(wp.getY()) - cc.y
    var oz = Number(wp.getZ()) - cc.z
    // variant A: the two highest casings become an LV input and output bus
    var casings = blocksOf(shapeOf(id)).filter(function (c) { return c.id === 'gtca:space_elevator_base_casing' })
    casings.sort(function (a, b) { return b.y - a.y })
    var swap = {}
    // GTCA 2.2.0 registers the modules as plain multiblocks (no ElevatorLinkedModuleMachine): they need their own energy hatch
    if (casings.length >= 3) {
      swap[casings[0].x + ',' + casings[0].y + ',' + casings[0].z] = 'gtceu:lv_input_bus'
      swap[casings[1].x + ',' + casings[1].y + ',' + casings[1].z] = 'gtceu:lv_output_bus'
      swap[casings[2].x + ',' + casings[2].y + ',' + casings[2].z] = 'gtceu:lv_energy_input_hatch'
    }
    var ctrl
    try { ctrl = placePreview(id, ox, oy, oz, swap) } catch (e) { check('s0_8_module_formed', false, 'placing at slot 0: ' + e); return null }
    note('s0_8_module_placed', id + ' controller at ' + ctrl.getX() + ',' + ctrl.getY() + ',' + ctrl.getZ() + ' (slot 0 ' + wp + '), ' +
      String(S.level.getBlockState(ctrl)) + '; buses at ' + Object.keys(swap).join(' '))
    return { id: id, pos: ctrl, ox: ox, oy: oy, oz: oz, swap: swap, variant: 'A', started: S.tick, phase: 'forming' }
  }
  function tickModule(v) {
    var d = v.module
    if (d === null) { v.phase = 'done'; return }
    var m = machine(S.level, d.pos)
    var waited = S.tick - d.started
    if (d.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 300) {
          if (d.variant === 'A') {
            note('s0_8_module_buses', 'did not form with buses in casing positions: ' + (m ? why(m) : 'no controller') + '; trying the plain preview')
            placePreview(d.id, d.ox, d.oy, d.oz, null)
            d.variant = 'B'
            d.started = S.tick
          } else {
            check('s0_8_module_formed', false, 'plain preview not formed: ' + (m ? why(m) : 'no controller'))
            v.phase = 'done'
          }
        }
        return
      }
      try { v.m.rescanSlots() } catch (e) { }
      var en = '?'
      try { en = String(m.isEnabledByElevator()) } catch (e) { }
      check('s0_8_module_formed', true, 'variant ' + d.variant + ', class ' + m.getClass().getSimpleName() + ', parts ' + Object.keys(partsById(m)).join(' ') +
        ', enabledByElevator ' + en + '; slot 0 ' + slotText(array(v.m.getSlotInfos())[0]))
      d.m = m
      d.inBus = partsLike(m, /input_bus/)[0]
      d.outBus = partsLike(m, /output_bus/)[0]
      d.energy = partsLike(m, /energy_input_hatch/)
      if (!d.inBus || !d.outBus) { note('s0_8_module_io', 'no item buses in the formed module: no item recipe can run'); check('s0_8_module_runs', false, 'no buses'); v.phase = 'done'; return }
      busPut(d.inBus, 'minecraft:stone', 4)
      m.getRecipeLogic().updateTickSubscription()
      d.phase = 'running'
      d.started = S.tick
      d.fed = false
      return
    }
    if (d.energy && d.energy.length > 0) topUp(d.energy)
    var got = busItems(d.outBus)['minecraft:smooth_stone'] || 0
    var wc = null
    try { wc = d.m.getWirelessEnergyContainer() } catch (e) { wc = null }
    if (waited === 100 && got === 0 && wc !== null) {
      note('s0_8_module_energy', 'after 100 t from the elevator: ' + Number(wc.getEnergyStored()) + ' of ' + Number(wc.getEnergyCapacity()) + ' EU; topping it up directly')
      d.fed = true
    }
    if (d.fed && wc !== null) wc.setEnergyStored(wc.getEnergyCapacity())
    if (got > 0 || waited > 400) {
      var rlg = d.m.getRecipeLogic()
      var last = rlg.getLastRecipe()
      var en2 = '?'
      try { en2 = String(d.m.isEnabledByElevator()) } catch (e) { }
      check('s0_8_module_runs', got > 0, 'smooth stone out ' + got + ', last ' + (last ? String(last.id) : 'none') + ', energy hatches ' + (d.energy ? d.energy.length : 0) + ', energy ' + (d.fed ? 'topped up directly' : 'own hatch') +
        ', enabledByElevator ' + en2 + ', reasons ' + String(rlg.getFailureReasons()))
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
    try {
      var W = global.grindless.wireless
      REMOTE.forEach(function (r) {
        command('setblock ' + r.x + ' ' + r.y + ' ' + r.z + ' minecraft:air', r.dim)
        command('forceload remove ' + r.x + ' ' + r.z, r.dim)
      })
      W.setStored(S.server, 0)
    } catch (e) { }
    clear()
    command('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function guarded(label, fn) {
    try { fn() } catch (e) { check(label + '_exception', false, String(e)) }
  }
  function step(label, obj, fn) {
    if (obj.phase === 'done') return
    try { fn(obj) } catch (e) { check(label + '_exception', false, 'phase ' + obj.phase + ': ' + e); obj.phase = 'done' }
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false }
    S.level = server.getLevel('minecraft:overworld')
    guarded('static', statics)
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    guarded('s0_5_place', function () { S.tower = buildTower() })
    guarded('s0_6_place', function () { S.swarm = buildSwarm() })
    guarded('s0_8_place', function () { S.elev = buildElevator() })
    if (!S.tower) S.tower = { phase: 'done' }
    if (!S.swarm) S.swarm = { phase: 'done' }
    if (!S.elev) S.elev = { phase: 'done' }
  }
  ServerEvents.customCommand('gg_test_uhv_s0_machines', function () {
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
      step('s0_5_tick', S.tower, tickTower)
      step('s0_6_tick', S.swarm, tickSwarm)
      step('s0_8_tick', S.elev, tickElevator)
      if (S.tower.phase === 'done' && S.swarm.phase === 'done' && S.elev.phase === 'done') finish()
      else if (S.tick > 3000) { check('deadline', false, '3000-tick fixture ceiling; phases ' + S.tower.phase + ' ' + S.swarm.phase + ' ' + S.elev.phase); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, String(e))
      finish()
    }
  })
})()
