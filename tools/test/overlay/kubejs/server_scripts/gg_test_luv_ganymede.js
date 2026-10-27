// priority: -4524
// TEST ONLY, LuV B9 (Ganymede). Integrated owner: kubejs custom_command gg_test_luv_ganymede
// Never launches a JVM. Band X 17664..17727, Z 0..63: the Overworld at Y 98..112; on Ganymede (G.places.surface('ganymede')) Y 198..214,
// or, where the ground under the two machines reaches Y 200, from one block above the highest ground (5 rows).
// Markers: GGTEST|luv_ganymede|<check>|PASS|FAIL|SKIPPED|NOTE|<detail>; the last line is GGTEST|luv_ganymede|DONE.
//
// Machines (startup_scripts/grindless/luv/ganymede.js), placed block by block from global.grindless.structures, controllers facing north:
//   gravitational_wave_detector  controller X 17700, Z 2; cells X 17670..17702, Z 2..34 (the L touches 5 chunks; its 3 x 3 chunk box is
//                                force-loaded); the cells it changes: the ice at X 17686, Z 4 (top row), the test mass at X 17672, Z 4
//   coilgun_launcher             controller X 17715, Z 2; cells X 17710..17717, Z 2..38 (12 chunks forced per world in all)
//   rows: Overworld Y 100..104; Ganymede Y 200..204 (or the 5 rows above the highest ground). The ice cells get packed ice.
// Checks:
//   static            the three Ganymede recipes (live, in GTM's lookup, dimension = G.places.surface('ganymede') only, circuit, EU/t,
//                     duration), the signal NOT consumed (chance 0) and the data orb consumed, 100 mB liquid helium, the probes'
//                     assembler recipes, the copies and the controllers; both structures published, ice symbol = exactly packed and
//                     blue ice (plain ice melts)
//   Overworld         detector_formed_overworld (spike S0-7: the buried L across chunk borders), detector_unformed_without_ice (one
//                     packed ice over the X arm -> air), detector_reformed_blue_ice (the same cell -> blue ice),
//                     detector_unformed_with_plain_ice (the same cell -> plain ice: unformed for 60 ticks), detector_reformed_packed_ice,
//                     detector_needs_test_mass (the X arm's end test mass -> frostproof casing: unformed for 100 ticks),
//                     detector_reformed_test_mass, detector_overworld_refused and coilgun_formed_overworld,
//                     coilgun_overworld_refused (site rule: inputs, energy, no progress, no output, inputs intact)
//   Ganymede          <kind>_formed_ganymede, <kind>_no_voiding_items (item voiding: refused, inputs intact, the no_voiding reason
//                     shown), then item voiding off and fluid voiding on: <kind>_fluid_voiding_allowed (the run starts; the machines
//                     only refuse item voiding), detector_catalogue_started (the Sagittarius A* signal is still in the bus, the orb and
//                     the helium spent), coilgun_survey_started and coilgun_survey_completed (the 400-tick run, still with fluid
//                     voiding on, exactly one survey).
//                     The 12,000-tick catalogue is only started. Without the dimension (before B1 registers it) these lines are
//                     SKIPPED with the reason: neither PASS nor FAIL; the integrated run after B1 covers them.
// Only owned cells are written (refusing to overwrite unowned blocks); cleanup empties the parts, removes every owned block in reverse
// order and releases every forced chunk this fixture added, on success, failure and timeout. Ceiling: 2900 ticks / 150 s from the command.
(function () {
  var S = null
  var J = null
  var LOADED = Date.now()
  var REQUEST = 'ggTestLuvGanymedeRequest'
  var REQUESTED = 0
  var TAG = 'GGTEST|luv_ganymede|'
  var BAND = { x0: 17664, x1: 17727, z0: 0, z1: 63 }
  var OVERWORLD = 'minecraft:overworld'
  var OW = { low: 98, high: 112, base: 100 }
  var GY = { low: 198, high: 214, base: 200 }
  var MAX_TICKS = 2900
  var MAX_MS = 150000
  var FORM_TICKS = 200
  var UNFORM_TICKS = 100
  var MASS_HOLD = 100
  var PLAIN_HOLD = 60
  var SITE_TICKS = 80
  var VOID_TICKS = 60
  var START_TICKS = 200
  var RUN_SLACK = 200
  // controller positions (X, Z); Y is the world's base row + the controller's row
  var SPOTS = { detector: { x: 17700, z: 2 }, launcher: { x: 17715, z: 2 } }
  // detector pattern cells the Overworld copy changes: [column, row, slice]
  var ARM_ICE = [16, 4, 30]
  var END_MASS = [30, 2, 30]
  var REASONS = {
    detector: /grindless\.machine\.gravitational_wave_detector\.no_voiding|keeps its catalogue/,
    launcher: /grindless\.machine\.coilgun_launcher\.no_voiding|keeps the probes/
  }
  var GANYMEDE_CHECKS = ['detector_formed_ganymede', 'coilgun_formed_ganymede', 'detector_no_voiding_items', 'detector_fluid_voiding_allowed',
    'coilgun_no_voiding_items', 'coilgun_fluid_voiding_allowed', 'detector_catalogue_started', 'coilgun_survey_started', 'coilgun_survey_completed']

  function lazy() {
    if (J === null) J = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      AL: Java.loadClass('java.util.ArrayList'),
      HM: Java.loadClass('java.util.HashMap'),
      Heightmap: Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types'),
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
  function clean(detail) { return String(detail === undefined || detail === null ? '' : detail).replace(/[\r\n|]+/g, ' ').substring(0, 1800) }
  function line(name, status, detail) { console.info(TAG + name + '|' + status + '|' + clean(detail)) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    line(name, ok ? 'PASS' : 'FAIL', detail)
    return ok
  }
  // a failed step ends its machine; the others go on
  function must(name, ok, detail) {
    if (check(name, ok, detail)) return
    var stop = new Error(name + ': ' + clean(detail))
    stop.reported = true
    throw stop
  }
  function note(name, detail) { line(name, 'NOTE', detail) }
  function skip(name, reason) { line(name, 'SKIPPED', reason) }
  function command(w, text) { return Number(S.server.runCommandSilent('execute in ' + w.dim + ' run ' + text)) }
  function key(p) { return p.x + ',' + p.y + ',' + p.z }
  function blockId(w, p) { return String(w.level.getBlock(p.x, p.y, p.z).id) }
  function at(w, p) { return lazy().Meta.getMachine(w.level, new (lazy().Pos)(p.x, p.y, p.z)) }
  function inside(w, p) {
    if (p.x < BAND.x0 || p.x > BAND.x1 || p.z < BAND.z0 || p.z > BAND.z1 || p.y < w.low || p.y > w.high) {
      throw new Error('out of the reserved B9 band: ' + w.dim + ' ' + key(p))
    }
  }
  function ticket(w, x, z) {
    var k = w.dim + ':' + (x >> 4) + ',' + (z >> 4)
    if (S.chunks[k]) return
    S.chunks[k] = true
    w.level.getChunk(x >> 4, z >> 4)
    if (command(w, 'forceload query ' + x + ' ' + z) < 1) {
      S.tickets.push({ w: w, x: x, z: z })
      command(w, 'forceload add ' + x + ' ' + z)
    }
  }
  function put(w, p, id) {
    inside(w, p)
    ticket(w, p.x, p.z)
    var k = w.dim + ':' + key(p)
    if (!S.owned[k]) {
      if (blockId(w, p) !== 'minecraft:air') throw new Error('refusing to overwrite unowned block at ' + k + ' (' + blockId(w, p) + ')')
      S.owned[k] = true
      S.blocks.push({ w: w, p: p })
    }
    command(w, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + ' replace')
    var expected = id.split('[')[0]
    if (blockId(w, p) !== expected) throw new Error('placement failed: ' + id + ' at ' + k)
  }

  // ---------------------------------------------------------------- structures

  function plain(sym) {
    if (sym.kind === 'oneOf') return plain(sym.options[0])
    if (sym.kind === 'blocks') return String(sym.blocks[0])
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    throw new Error('unsupported structure symbol ' + sym.kind)
  }
  function structure(id) {
    var d = S.G.structures[id]
    if (!d) throw new Error('no published structure for ' + id)
    var anchor = null
    d.slices.forEach(function (rows, s) {
      rows.forEach(function (row, y) {
        var x = row.indexOf('S')
        if (x >= 0) anchor = { x: x, y: y, s: s }
      })
    })
    if (anchor === null) throw new Error('no controller cell in ' + id)
    return { d: d, anchor: anchor, width: d.slices[0][0].length, height: d.slices[0].length, slices: d.slices.length }
  }
  // pattern (column, row, slice) -> world, controller facing north: columns run east -> west, slices back (south) -> front (north)
  function cell(m, x, y, s) {
    var a = m.shape.anchor
    return { x: m.p.x - x + a.x, y: m.p.y + y - a.y, z: m.p.z - s + a.s }
  }
  function box(m) {
    var lo = cell(m, m.shape.width - 1, 0, m.shape.slices - 1)
    var hi = cell(m, 0, m.shape.height - 1, 0)
    return { x0: lo.x, x1: hi.x, y0: lo.y, y1: hi.y, z0: lo.z, z1: hi.z }
  }
  function roles(kind) {
    var list = [['energy', 'gtceu:luv_energy_input_hatch'], ['inBus', 'gtceu:luv_input_bus'], ['outBus', 'gtceu:luv_output_bus']]
    if (kind === 'detector') list.push(['fluid', 'gtceu:luv_input_hatch'])
    list.push(['maintenance', 'gtceu:auto_maintenance_hatch'])
    return list
  }
  function place(m) {
    var d = m.shape.d
    var w = m.w
    var occupied = []
    var cells = []
    d.slices.forEach(function (rows, s) {
      rows.forEach(function (row, y) {
        for (var x = 0; x < row.length; x++) {
          var ch = row.charAt(x)
          if (ch === ' ') continue
          var sym = d.symbols[ch]
          if (!sym) throw new Error('unknown symbol ' + ch + ' in ' + m.id)
          var p = cell(m, x, y, s)
          inside(w, p)
          var here = blockId(w, p)
          if (here !== 'minecraft:air' && !S.owned[w.dim + ':' + key(p)]) occupied.push(key(p) + '=' + here)
          if (sym.kind === 'controller' || sym.kind === 'any' || sym.kind === 'air') continue
          cells.push({ ch: ch, sym: sym, p: p })
        }
      })
    })
    if (occupied.length > 0) {
      throw new Error('refusing to overwrite unowned block at ' + w.dim + ' ' + occupied.slice(0, 5).join(' ; ') + ' (' + occupied.length + ' occupied cells)')
    }
    var list = roles(m.kind)
    var next = 0
    m.positions = {}
    cells.forEach(function (c) {
      var id
      if (c.ch === 'X' && next < list.length) {
        m.positions[list[next][0]] = c.p
        id = list[next++][1] + '[facing=north]'
      } else id = plain(c.sym)
      put(w, c.p, id)
    })
    if (next !== list.length) throw new Error('not enough service cells for ' + m.id)
    put(w, m.p, m.id + '[facing=north]')
    m.phase = 'forming'
    m.at = S.tick
  }
  function patternCell(m, xys, expected) {
    var row = m.shape.d.slices[xys[2]][xys[1]]
    var ch = row.charAt(xys[0])
    if (ch !== expected) throw new Error(m.id + ' pattern cell ' + xys.join(',') + ' is "' + ch + '", expected "' + expected + '"')
    return cell(m, xys[0], xys[1], xys[2])
  }

  // ---------------------------------------------------------------- recipes

  function byId(id) {
    var result = S.server.getRecipeManager().byKey(new (lazy().RL)(id))
    return result.isPresent() ? result.get() : null
  }
  function itemName(st) { return String(lazy().Forge.ITEMS.getKey(st.getItem())) }
  function fluidName(fs) { return String(lazy().Forge.FLUIDS.getKey(fs.getFluid())) }
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
  function inputs(r) {
    var contents = array(r.getInputContents(lazy().ItemCap))
    return array(lazy().Helper.getInputItems(r)).map(function (st, i) {
      var circuit = lazy().Circuit.isIntegratedCircuit(st) ? Number(lazy().Circuit.getCircuitConfiguration(st)) : 0
      return { id: itemName(st), count: Number(st.getCount()), chance: Number(contents[i].chance), circuit: circuit }
    })
  }
  function staticChecks() {
    var GYD = S.G.ganymede
    check('published', !!(GYD && GYD.recipes && GYD.items && GYD.machines), 'global.grindless.ganymede (startup + server)')
    var gid = S.gid
    var expected = [
      { key: 'catalogue', type: 'gtceu:gravitational_wave_astronomy', circuit: 1, duration: 12000 },
      { key: 'survey', type: 'gtceu:probe_launch', circuit: 1, duration: 400 },
      { key: 'chart', type: 'gtceu:probe_launch', circuit: 2, duration: 12000 }
    ]
    expected.forEach(function (e) {
      var id = GYD.recipes[e.key]
      var r = byId(id)
      var type = lazy().Registry.RECIPE_TYPES.get(new (lazy().RL)(e.type))
      if (r === null || type === null) { check('recipe_' + e.key, false, id + ' live=' + (r !== null) + ' type=' + (type !== null)); return }
      var conditions = array(r.conditions)
      var dims = conditions.filter(function (c) { return String(c.getClass().getSimpleName()) === 'DimensionCondition' })
      var dimIds = dims.map(function (c) { return String(c.getDimension().location()) })
      var circuits = inputs(r).filter(function (x) { return x.circuit > 0 })
      var eut = Number(lazy().Helper.getRealEUt(r).getTotalEU())
      check('recipe_' + e.key, lookup(type, r) && Number(r.duration) === e.duration && eut === 30720 &&
        dimIds.length === 1 && dimIds[0] === gid && dims.every(function (c) { return !c.isReverse() }) &&
        circuits.length === 1 && circuits[0].circuit === e.circuit,
      id + ': lookup, ' + r.duration + ' t, ' + eut + ' EU/t, dimensions=' + dimIds.join(',') + ' (want ' + gid + '), circuit=' +
        circuits.map(function (x) { return x.circuit }).join(','))
    })
    var cat = byId(GYD.recipes.catalogue)
    if (cat !== null) {
      var ins = inputs(cat)
      var signal = ins.filter(function (x) { return x.id === GYD.items.signal })
      var orb = ins.filter(function (x) { return x.id === GYD.items.dataOrb })
      var fluids = array(lazy().Helper.getInputFluids(cat)).map(function (fs) { return fluidName(fs) + ' ' + Number(fs.getAmount()) })
      check('catalogue_signal_kept', signal.length === 1 && signal[0].chance === 0 && orb.length === 1 && orb[0].chance > 0 &&
        fluids.length === 1 && fluids[0] === GYD.items.helium + ' 100',
      'signal chance=' + signal.map(function (x) { return x.chance }).join(',') + ', data orb chance=' + orb.map(function (x) { return x.chance }).join(',') +
        ', fluids=' + fluids.join(','))
    }
    ;[GYD.recipes.jupiterProbe, GYD.recipes.saturnProbe, GYD.recipes.copy, GYD.recipes.chartCopy].concat(GYD.recipes.controllers)
      .forEach(function (id) { check('support_recipe', byId(id) !== null, id) })
    var det = S.G.structures[GYD.machines.detector]
    var ice = det && det.symbols.I ? det.symbols.I.blocks.map(String).sort().join(',') : 'none'
    check('structures', !!det && !!S.G.structures[GYD.machines.launcher] &&
      ice === 'minecraft:blue_ice,minecraft:packed_ice' && String(det.symbols.M.blocks[0]) === 'grindless:sapphire_test_mass',
    'detector ice=' + ice + '; launcher published=' + !!S.G.structures[GYD.machines.launcher])
  }

  // ---------------------------------------------------------------- machines

  function clearBus(bus) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
  }
  function items(bus) {
    var result = {}
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = itemName(st)
      result[id] = (result[id] || 0) + Number(st.getCount())
    }
    return result
  }
  function helium(m) {
    if (!m.fluid) return 0
    var fs = m.fluid.tank.getFluidInTank(0)
    return fs.isEmpty() ? 0 : Number(fs.getAmount())
  }
  function scenario(m) {
    var I = S.G.ganymede.items
    if (m.kind === 'detector') return { circuit: 1, items: [I.dataOrb, I.signal], fluid: [I.helium, 100], output: I.catalogue }
    return { circuit: 1, items: [I.jupiterProbe], fluid: null, output: I.survey }
  }
  function wake(m) { m.ctrl.getRecipeLogic().updateTickSubscription() }
  function parts(m) {
    m.ctrl = at(m.w, m.p)
    Object.keys(m.positions).forEach(function (role) {
      m[role] = at(m.w, m.positions[role])
      if (m[role] === null) throw new Error(m.key + ': no part ' + role)
    })
  }
  function feed(m) {
    var sc = scenario(m)
    clearBus(m.inBus)
    clearBus(m.outBus)
    m.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(sc.circuit))
    sc.items.forEach(function (id, slot) { m.inBus.getInventory().setStackInSlot(slot, Item.of(id, 1)) })
    if (m.fluid) m.fluid.tank.setFluidInTank(0, sc.fluid ? Fluid.of(sc.fluid[0], sc.fluid[1]).getFluidStack() : lazy().FluidStack.EMPTY)
    m.ctrl.getRecipeLogic().resetRecipeLogic()
    m.sc = sc
    m.at = S.tick
    wake(m)
  }
  function charge(m) {
    if (!m.energy) return
    var c = m.energy.energyContainer
    c.setEnergyStored(c.getEnergyCapacity())
  }
  function progress(m) { return Number(m.ctrl.getRecipeLogic().getProgress()) }
  function reasons(m) {
    try {
      return array(m.ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
    } catch (e) {
      return ['unreadable: ' + e]
    }
  }
  function state(m) {
    try {
      var logic = m.ctrl.getRecipeLogic()
      var last = logic.getLastRecipe()
      return 'status=' + logic.getStatus() + ' progress=' + logic.getProgress() + '/' + logic.getDuration() + ' last=' + (last ? last.id : 'none') +
        ' voiding=' + m.ctrl.getVoidingMode() + ' energy=' + (m.energy ? m.energy.energyContainer.getEnergyStored() : '?') +
        ' in=' + JSON.stringify(items(m.inBus)) + ' out=' + JSON.stringify(items(m.outBus)) + (m.fluid ? ' helium=' + helium(m) : '') +
        ' reasons=[' + reasons(m).join(' ; ') + ']'
    } catch (e) {
      return 'state unreadable: ' + e
    }
  }
  // the fed inputs are all still there and nothing came out
  function untouched(m) {
    var left = items(m.inBus)
    var whole = m.sc.items.every(function (id) { return left[id] === 1 })
    return progress(m) === 0 && Object.keys(items(m.outBus)).length === 0 && whole && (!m.sc.fluid || helium(m) === m.sc.fluid[1])
  }
  function voiding(m, mode) {
    m.ctrl.setVoidingMode(lazy().Voiding[mode])
    wake(m)
    m.at = S.tick
  }
  function formed(m) {
    var ctrl = at(m.w, m.p)
    return !!ctrl && ctrl.isFormed() === true
  }
  function waitFormed(m, name, detail) {
    if (!formed(m)) {
      if (S.tick - m.at > FORM_TICKS) must(name, false, 'not formed after ' + (S.tick - m.at) + ' ticks; ' + detail)
      return false
    }
    check(name, true, detail + ' (' + (S.tick - m.at) + ' ticks)')
    return true
  }

  // the Overworld detector: spike S0-7 (the buried L, ice and test masses), then the site rule
  function detectorOverworld(m) {
    var age = S.tick - m.at
    if (m.phase === 'forming') {
      if (!waitFormed(m, 'detector_formed_overworld', 'buried L ' + m.where + ', ' + m.chunkCount + ' chunks force-loaded')) return
      parts(m)
      m.ice = patternCell(m, ARM_ICE, 'I')
      m.mass = patternCell(m, END_MASS, 'M')
      put(m.w, m.ice, 'minecraft:air')
      m.phase = 'no_ice'
      m.at = S.tick
      return
    }
    if (m.phase === 'no_ice') {
      if (formed(m)) {
        if (age > UNFORM_TICKS) must('detector_unformed_without_ice', false, 'still formed ' + age + ' ticks after the ice at ' + key(m.ice) + ' became air')
        return
      }
      check('detector_unformed_without_ice', true, 'packed ice over the X arm at ' + key(m.ice) + ' -> air: unformed after ' + age + ' ticks')
      put(m.w, m.ice, 'minecraft:blue_ice')
      m.phase = 'blue_ice'
      m.at = S.tick
      return
    }
    if (m.phase === 'blue_ice') {
      if (!waitFormed(m, 'detector_reformed_blue_ice', 'blue ice at ' + key(m.ice))) return
      put(m.w, m.ice, 'minecraft:ice')
      m.phase = 'plain_ice'
      m.at = S.tick
      m.sawUnformed = false
      return
    }
    if (m.phase === 'plain_ice') {
      var cold = formed(m)
      if (!cold) m.sawUnformed = true
      if (age < PLAIN_HOLD) return
      must('detector_unformed_with_plain_ice', m.sawUnformed && !cold, 'plain ice (it melts) at ' + key(m.ice) + ': unformed=' + m.sawUnformed +
        ', formed after ' + age + ' ticks=' + cold)
      put(m.w, m.ice, 'minecraft:packed_ice')
      m.phase = 'packed_ice'
      m.at = S.tick
      return
    }
    if (m.phase === 'packed_ice') {
      if (!waitFormed(m, 'detector_reformed_packed_ice', 'packed ice back at ' + key(m.ice))) return
      put(m.w, m.mass, 'gtceu:frostproof_machine_casing')
      m.phase = 'no_mass'
      m.at = S.tick
      m.sawUnformed = false
      return
    }
    if (m.phase === 'no_mass') {
      var now = formed(m)
      if (!now) m.sawUnformed = true
      if (age < MASS_HOLD) return
      must('detector_needs_test_mass', m.sawUnformed && !now, 'the X arm end test mass at ' + key(m.mass) + ' -> frostproof casing: unformed=' +
        m.sawUnformed + ', formed after ' + age + ' ticks=' + now)
      put(m.w, m.mass, 'grindless:sapphire_test_mass')
      m.phase = 'mass_back'
      m.at = S.tick
      return
    }
    if (m.phase === 'mass_back') {
      if (!waitFormed(m, 'detector_reformed_test_mass', 'sapphire test mass back at ' + key(m.mass))) return
      parts(m)
      feed(m)
      m.phase = 'site'
      return
    }
    charge(m)
    if (m.phase === 'site') {
      if (age < SITE_TICKS) return
      must('detector_overworld_refused', untouched(m) && formed(m), 'circuit 1, data orb, signal, 100 mB helium and LuV energy for ' + age +
        ' ticks: ' + state(m))
      m.phase = 'done'
    }
  }

  function launcherOverworld(m) {
    var age = S.tick - m.at
    if (m.phase === 'forming') {
      if (!waitFormed(m, 'coilgun_formed_overworld', 'barrel and breech ' + m.where)) return
      parts(m)
      feed(m)
      m.phase = 'site'
      return
    }
    charge(m)
    if (m.phase === 'site') {
      if (age < SITE_TICKS) return
      must('coilgun_overworld_refused', untouched(m), 'circuit 1, Jupiter entry probe and LuV energy for ' + age + ' ticks: ' + state(m))
      m.phase = 'done'
    }
  }

  // both Ganymede copies: refusal while voiding, then the run starts (and the survey completes)
  function onGanymede(m) {
    var age = S.tick - m.at
    var name = m.kind === 'detector' ? 'detector' : 'coilgun'
    if (m.phase === 'forming') {
      if (!waitFormed(m, name + '_formed_ganymede', m.where)) return
      parts(m)
      feed(m)
      voiding(m, 'VOID_ITEMS')
      m.phase = 'void_items'
      return
    }
    charge(m)
    if (m.phase === 'void_items') {
      if (age < VOID_TICKS) return
      var shown = reasons(m).some(function (r) { return REASONS[m.kind].test(r) })
      must(name + '_no_voiding_items', untouched(m) && shown, 'voiding items for ' + age + ' ticks: refusal shown=' + shown + ', ' + state(m))
      // only item voiding is refused: with fluid voiding alone the run starts (and the survey completes) as usual
      voiding(m, 'VOID_FLUIDS')
      m.phase = 'resume'
      return
    }
    if (m.phase === 'resume') {
      if (progress(m) <= 0) {
        if (age > START_TICKS) must(name + '_fluid_voiding_allowed', false, 'item voiding off, fluid voiding on: no progress after ' + age +
          ' ticks: ' + state(m))
        return
      }
      check(name + '_fluid_voiding_allowed', String(m.ctrl.getVoidingMode()) === 'VOID_FLUIDS', 'started after ' + age +
        ' ticks with only fluid voiding on: ' + state(m))
      var left = items(m.inBus)
      var I = S.G.ganymede.items
      if (m.kind === 'detector') {
        must('detector_catalogue_started', left[I.signal] === 1 && !left[I.dataOrb] && helium(m) === 0,
          'started after ' + age + ' ticks; the signal stays in the bus, the orb and 100 mB helium spent: ' + state(m))
        m.phase = 'done'
        return
      }
      must('coilgun_survey_started', !left[I.jupiterProbe], 'started after ' + age + ' ticks, the probe loaded: ' + state(m))
      m.duration = Number(m.ctrl.getRecipeLogic().getDuration())
      m.phase = 'survey'
      m.at = S.tick
      return
    }
    if (m.phase === 'survey') {
      var out = items(m.outBus)
      if (!out[m.sc.output]) {
        if (age > m.duration + RUN_SLACK) must('coilgun_survey_completed', false, 'no survey after ' + age + ' ticks: ' + state(m))
        return
      }
      must('coilgun_survey_completed', out[m.sc.output] === 1 && Object.keys(out).length === 1, 'after ' + age + ' ticks (' + m.duration +
        '-tick run): ' + JSON.stringify(out))
      m.phase = 'done'
    }
  }

  function advance(m) {
    if (m.phase === 'done') return
    try {
      if (m.w.ground) {
        if (m.kind === 'detector') detectorOverworld(m)
        else launcherOverworld(m)
      } else onGanymede(m)
    } catch (e) {
      if (!e || e.reported !== true) check(m.key + '_exception', false, 'phase ' + m.phase + ': ' + e)
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- worlds

  function levelOf(id) {
    var keys = array(S.server.levelKeys())
    for (var i = 0; i < keys.length; i++) {
      // a dimension id string: KubeJS's getLevel(ResourceLocation) next to vanilla's getLevel(ResourceKey) makes a key ambiguous for Rhino
      if (String(keys[i].location()) === id) return S.server.getLevel(id)
    }
    return null
  }
  function machinesFor(w) {
    var GYD = S.G.ganymede
    return ['detector', 'launcher'].map(function (kind) {
      var shape = structure(GYD.machines[kind])
      var m = { kind: kind, id: GYD.machines[kind], shape: shape, w: w, key: (kind === 'detector' ? 'detector' : 'coilgun') + '_' + w.name,
        p: { x: SPOTS[kind].x, y: w.base + shape.anchor.y, z: SPOTS[kind].z }, phase: 'new', at: 0 }
      var b = box(m)
      m.box = b
      m.chunkCount = ((b.x1 >> 4) - (b.x0 >> 4) + 1) * ((b.z1 >> 4) - (b.z0 >> 4) + 1)
      m.where =  'X ' + b.x0 + '..' + b.x1 + ' Z ' + b.z0 + '..' + b.z1 + ' Y ' + b.y0 + '..' + b.y1 + ' in ' + w.dim
      return m
    })
  }
  function force(w, list) {
    var before = S.tickets.length
    var seen = {}
    list.forEach(function (m) {
      for (var cx = m.box.x0 >> 4; cx <= m.box.x1 >> 4; cx++) {
        for (var cz = m.box.z0 >> 4; cz <= m.box.z1 >> 4; cz++) {
          ticket(w, cx << 4, cz << 4)
          seen[cx + ',' + cz] = true
        }
      }
    })
    return { chunks: Object.keys(seen).length, added: S.tickets.length - before }
  }
  // the highest non-air block under the two footprints (heightmap of chunks already loaded and forced)
  function highestGround(w, list) {
    var top = -999
    var where = ''
    list.forEach(function (m) {
      for (var x = m.box.x0; x <= m.box.x1; x++) {
        for (var z = m.box.z0; z <= m.box.z1; z++) {
          var h = Number(w.level.getHeight(lazy().Heightmap.WORLD_SURFACE, x, z)) - 1
          if (h > top) { top = h; where = x + ',' + z }
        }
      }
    })
    return { y: top, at: where }
  }
  function build(w) {
    var list = machinesFor(w)
    var forced = force(w, list)
    var extra = ''
    if (!w.ground) {
      var ground = highestGround(w, list)
      if (ground.y + 1 > GY.base) {
        w.base = ground.y + 1
        w.low = w.base
        w.high = w.base + 4
        var maxY = 320
        try { maxY = Number(w.level.getMaxBuildHeight()) } catch (e) { /* vanilla default */ }
        if (w.high >= maxY) throw new Error('no room above the ground: highest ground Y ' + ground.y + ' at ' + ground.at)
        list = machinesFor(w)
      }
      extra = '; highest ground under both footprints Y ' + ground.y + ' at ' + ground.at
    }
    note('site_' + w.name, w.dim + ': rows Y ' + w.base + '..' + (w.base + 4) + ' (allowed ' + w.low + '..' + w.high + ')' + extra + '; ' +
      forced.chunks + ' chunks, ' + forced.added + ' tickets added; ' + list.map(function (m) { return m.key + ' ' + m.where }).join(' ; '))
    list.forEach(function (m) {
      place(m)
      S.machines.push(m)
    })
  }
  function run(server) {
    S = { server: server, G: global.grindless, started: REQUESTED, tick0: server.getTickCount(), tick: 0, failed: 0,
      chunks: {}, tickets: [], owned: {}, blocks: [], machines: [], finished: false, gid: null }
    S.gid = String(S.G.places.surface('ganymede'))
    note('ganymede_id', S.gid + ' (G.places.surface)')
    try { staticChecks() } catch (e) { check('static_exception', false, String(e)) }
    var overworld = levelOf(OVERWORLD)
    try {
      build({ name: 'overworld', dim: OVERWORLD, level: overworld, ground: true, low: OW.low, high: OW.high, base: OW.base })
    } catch (e) {
      check('setup_overworld', false, String(e))
    }
    var ganymede = levelOf(S.gid)
    if (ganymede === null) {
      var why = S.gid + ' is not a dimension of this server (LuV B1 registers it): the Ganymede processing checks wait for the integrated run after B1'
      GANYMEDE_CHECKS.forEach(function (name) { skip(name, why) })
    } else {
      try {
        build({ name: 'ganymede', dim: S.gid, level: ganymede, ground: false, low: GY.low, high: GY.high, base: GY.base })
      } catch (e) {
        check('setup_ganymede', false, String(e))
      }
    }
  }
  function finish() {
    if (!S || S.finished) return
    S.finished = true
    var errors = []
    S.machines.forEach(function (m) {
      try {
        if (m.outBus) clearBus(m.outBus)
        if (m.inBus) {
          clearBus(m.inBus)
          m.inBus.getCircuitInventory().setStackInSlot(0, Item.empty)
        }
        if (m.fluid) m.fluid.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
      } catch (e) { errors.push('empty ' + m.key + ': ' + e) }
    })
    S.blocks.slice().reverse().forEach(function (entry) {
      try { command(entry.w, 'setblock ' + key(entry.p).replace(/,/g, ' ') + ' air replace') } catch (e) { errors.push(String(e)) }
    })
    var left = S.blocks.filter(function (entry) {
      try { return blockId(entry.w, entry.p) !== 'minecraft:air' } catch (e) { return true }
    })
    if (left.length > 0) errors.push(left.length + ' owned cells not cleared, first ' + left[0].w.dim + ' ' + key(left[0].p))
    S.tickets.forEach(function (entry) {
      try { command(entry.w, 'forceload remove ' + entry.x + ' ' + entry.z) } catch (e) { errors.push(String(e)) }
    })
    line('cleanup', errors.length ? 'FAIL' : 'PASS', S.blocks.length + ' owned blocks removed, ' + S.tickets.length + ' forced chunks released' +
      (errors.length ? ': ' + errors.join(' ; ') : ''))
    console.info(TAG + 'DONE|failures=' + S.failed)
  }

  ServerEvents.tick(function (event) {
    if (global[REQUEST] === true && (!S || S.finished) && Date.now() - LOADED >= 10000) {
      global[REQUEST] = false
      try { run(event.server) } catch (e) {
        if (S === null) S = { server: event.server, failed: 0, machines: [], blocks: [], tickets: [], finished: false }
        check('setup', false, String(e))
        finish()
      }
      if (S && !S.finished && S.machines.length === 0) finish()
    }
    if (!S || S.finished) return
    try {
      S.tick = event.server.getTickCount() - S.tick0
      if (S.tick > MAX_TICKS || Date.now() - S.started > MAX_MS) {
        var open = S.machines.filter(function (m) { return m.phase !== 'done' }).map(function (m) { return m.key + '@' + m.phase })
        throw new Error('B9 fixture deadline (' + MAX_TICKS + ' ticks / ' + MAX_MS / 1000 + ' s); open: ' + open.join(', '))
      }
      S.machines.forEach(advance)
      if (S.machines.every(function (m) { return m.phase === 'done' })) finish()
    } catch (e) {
      check('execution', false, String(e))
      finish()
    }
  })
  ServerEvents.customCommand('gg_test_luv_ganymede', function () {
    if (S && !S.finished) return 0
    REQUESTED = Date.now()
    global[REQUEST] = true
    return 1
  })
})()
