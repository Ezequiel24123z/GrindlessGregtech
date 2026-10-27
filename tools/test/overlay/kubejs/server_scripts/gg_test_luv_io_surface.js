// priority: -4724
// TEST-ONLY B6 fixture (spike S0-7 and B6's mechanism checks); prepared for the single integrated LuV validation owner, not a standalone launch.
// Command: kubejs custom_command gg_test_luv_io_surface
// Marker: GGTEST|luv_io_surface|DONE (owner's marker wait: at most 180 seconds).
// Requires A1/B6 registrations (G.ioSurface with IO.recipes, G.places, G.structures, G.generators). Never changes any clock or weather.
// Band: X 17152..17215, Z 0..63; the Overworld at Y 98..113 and Io (G.places.surface('io')) at Y 198..214.
//   fumarole condenser  controller facing north at X 17160, Z 2 (X 17158..17162, Z 2..6); Overworld Y 99..113, Io Y 199..213,
//                       each fumarole cell on a brimstone block one below (Y 98 / Y 198): BOP's fumarole only survives on
//                       #biomesoplenty:brimstone_decoration_placeable with a sturdy top, as it stands on Io's ground
//   volcanic intake     controller facing north at X 17190, Z 2 (X 17185..17195, Z 2..6); Overworld Y 98..109, Io Y 198..209
// Overworld (S0-7): the condenser does not form with biomesoplenty:brimstone in one fumarole cell and forms with three
// brimstone fumaroles; the intake does not form with basalt in one magma cell and forms on magma with module a only;
// IO.intake.modules() counts 1, then 2 with slot b, and still 2 with slot c half built; off Io, circuit 1 collect and the
// intake's charge never start; the condenser refuses to start while voiding; circuit 2 separation runs anywhere.
// Io is optional until package B1 adds its world: when its level exists (and the footprint is air) both machines are built
// there; collect gives 4000 mB SO2 + 8 sulfur + 1 sublimate, and an intake with two modules and one LuV dynamo hatch
// (32768 V x 2 A) pays 2 x 32768 = 65536 EU/t, never more EU than its paid ticks.
// Set global.ggTestLuvIoSurfaceRequireIo = true BEFORE the command to make a missing Io stage a failure; otherwise it emits
// REQUIRED/NOTE, never PASS. The outstanding requirement is exported as global.ggTestLuvIoSurfaceCoverage (a string).
// All blocks/tickets are owned, bounded to the band, and removed before DONE. Deadlines: 2800 ticks and 150 seconds from
// the command (including the reload quiet period); no retries.
(function () {
  var REQUEST = 'ggTestLuvIoSurfaceRequest'
  var COVERAGE = 'ggTestLuvIoSurfaceCoverage'
  var LOADED_AT = Date.now()
  var REQUESTED_AT = 0
  var S = null
  var J = null
  var BAND = { x0: 17152, x1: 17215, z0: 0, z1: 63 }
  var OVERWORLD_Y = { y0: 98, y1: 113 }
  var OFFWORLD_Y = { y0: 198, y1: 214 }
  var CONDENSER_X = 17160
  var INTAKE_X = 17190
  var ORIGIN_Z = 2
  var MODULE_EU = 32768
  var IO_EU = 2 * MODULE_EU
  var SUBLIMATE = 'grindless:ionian_sublimate'
  var BRIMSTONE = 'biomesoplenty:brimstone'
  // BOP's BrimstoneFumaroleBlock#canSurvive: brimstone or netherrack below with a sturdy top, else it breaks on the next shape update
  var FUMAROLE_GROUND = { ch: 'F', id: BRIMSTONE }
  var BASALT = 'minecraft:basalt'
  var NO_VOIDING = /fumarole_condenser\.no_voiding|[Vv]oid/
  var REQUIRED = 'B1: Io surface level present; Io collect (4000 mB SO2 + 8 sulfur + 1 sublimate) and a 2-module intake at 65536 EU/t'
  var CONDENSER_ROLES = [
    ['energy', 'energy_input', 'gtceu:luv_energy_input_hatch'],
    ['inBus', 'input_bus', 'gtceu:luv_input_bus'],
    ['outBus', 'output_bus', 'gtceu:luv_output_bus'],
    ['in1', 'input_hatch', 'gtceu:luv_input_hatch'],
    ['in2', 'input_hatch', 'gtceu:luv_input_hatch'],
    ['out1', 'output_hatch', 'gtceu:luv_output_hatch'],
    ['out2', 'output_hatch', 'gtceu:luv_output_hatch']
  ]
  var INTAKE_ROLES = [
    ['dynamo', 'energy_output', 'gtceu:luv_energy_output_hatch'],
    ['inBus', 'input_bus', 'gtceu:luv_input_bus'],
    ['inHatch', 'input_hatch', 'gtceu:luv_input_hatch']
  ]

  function emit(name, status, detail) {
    console.info('GGTEST|luv_io_surface|' + name + '|' + status +
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
      ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
      FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Machine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registry: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
      VoidingMode: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode')
    }
    return J
  }
  function pos(p) { return new (lazy().Pos)(p.x, p.y, p.z) }
  function at(site, p) { return lazy().Machine.getMachine(site.level, pos(p)) }
  function cmd(site, text) { return Number(S.server.runCommandSilent('execute in ' + site.dim + ' run ' + text)) }
  function array(coll) {
    var list = new (lazy().AL)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function inside(site, p) {
    if (p.x < BAND.x0 || p.x > BAND.x1 || p.y < site.y0 || p.y > site.y1 || p.z < BAND.z0 || p.z > BAND.z1) {
      throw new Error('out-of-band coordinate in ' + site.dim + ' ' + JSON.stringify(p))
    }
  }
  function key(site, p) { return site.dim + '|' + p.x + ',' + p.y + ',' + p.z }
  function block(site, p) { return String(site.level.getBlock(p.x, p.y, p.z).id) }
  function ticket(site, p) {
    inside(site, p)
    // every site that gets a ticket also gets the item sweep at cleanup
    if (S.sites.indexOf(site) < 0) S.sites.push(site)
    var x = Math.floor(p.x / 16) * 16
    var z = Math.floor(p.z / 16) * 16
    var k = site.dim + '|' + x + ',' + z
    if (S.chunks[k]) return
    S.chunks[k] = true
    site.level.getChunk(x >> 4, z >> 4)
    if (cmd(site, 'forceload query ' + x + ' ' + z) > 0) return
    // Record before acquiring so exceptional setup still has a cleanup path.
    S.tickets.push({ site: site, x: x, z: z })
    if (cmd(site, 'forceload add ' + x + ' ' + z) < 1) throw new Error('cannot acquire chunk ticket ' + k)
  }
  function put(site, p, id, facing) {
    inside(site, p)
    ticket(site, p)
    var k = key(site, p)
    if (!S.owned[k]) {
      if (block(site, p) !== 'minecraft:air') throw new Error('refusing to replace unowned block at ' + k)
      S.owned[k] = true
      S.order.push({ site: site, p: p })
    }
    cmd(site, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + (facing ? '[facing=north]' : '') + ' replace')
    if (block(site, p) !== id) throw new Error('setblock did not place ' + id + ' at ' + k)
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
  // every cell of a registered structure, mapped for a controller facing north at origin (slices back -> front = south -> north)
  function cellsOf(id, origin) {
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
    var cells = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          cells.push({ ch: row.charAt(ci), sym: desc.symbols[row.charAt(ci)], front: si === controller.si,
            p: { x: origin.x - (ci - controller.ci), y: origin.y + ri - controller.ri, z: origin.z - (si - controller.si) } })
        }
      })
    })
    return cells
  }
  // the ground under every cell of symbol ch (the fumaroles' brimstone): below the pattern, so outside its cells
  function groundOf(cells, ground) {
    if (!ground) return []
    return cells.filter(function (c) { return c.ch === ground.ch }).map(function (c) {
      return { p: { x: c.p.x, y: c.p.y - 1, z: c.p.z }, id: ground.id }
    })
  }
  function footprintClear(site, id, origin, ground) {
    var cells = cellsOf(id, origin)
    var all = cells.map(function (c) { return c.p }).concat(groundOf(cells, ground).map(function (g) { return g.p }))
    for (var i = 0; i < all.length; i++) {
      inside(site, all[i])
      ticket(site, all[i])
      if (block(site, all[i]) !== 'minecraft:air') return 'occupied at ' + key(site, all[i])
    }
    return ''
  }
  // opts.roles: [[role, ability, block id]] for the first free front-wall cells allowing that ability
  // opts.skip: { symbol: true } cells left as air; opts.swap: { ch, id } the first cell of that symbol gets that block instead
  // opts.ground: { ch, id } placed one below every cell of that symbol, before the structure
  function build(site, id, origin, opts) {
    var cells = cellsOf(id, origin)
    var ground = groundOf(cells, opts.ground)
    ground.forEach(function (g) {
      inside(site, g.p)
      ticket(site, g.p)
      if (block(site, g.p) !== 'minecraft:air') throw new Error('ground cell is occupied at ' + key(site, g.p))
    })
    var result = { site: site, id: id, origin: origin, pos: {}, cells: {}, swapped: null, removed: 0, total: 0, previous: 0 }
    var roles = (opts.roles || []).slice()
    var plan = []
    cells.forEach(function (c) {
      inside(site, c.p)
      ticket(site, c.p)
      if (block(site, c.p) !== 'minecraft:air') throw new Error('structure footprint is occupied at ' + key(site, c.p))
      if (!c.sym || c.sym.kind === 'controller' || c.sym.kind === 'air' || c.sym.kind === 'any') return
      ;(result.cells[c.ch] = result.cells[c.ch] || []).push(c.p)
      if (opts.skip && opts.skip[c.ch]) return
      var bid = null
      var facing = false
      if (c.front && roles.length > 0 && allows(c.sym, roles[0][1])) {
        var r = roles.shift()
        bid = r[2]
        facing = true
        result.pos[r[0]] = c.p
      } else if (opts.swap && opts.swap.ch === c.ch && result.swapped === null) {
        bid = opts.swap.id
        result.swapped = c.p
      }
      plan.push({ p: c.p, id: bid || plain(c.sym), facing: facing })
    })
    if (roles.length > 0) throw new Error(id + ': no front-wall slot for ' + roles.map(function (r) { return r[0] }).join(', '))
    if (opts.swap && result.swapped === null) throw new Error(id + ': no ' + opts.swap.ch + ' cell to swap')
    ground.forEach(function (g) { put(site, g.p, g.id, false) })
    plan.forEach(function (c) { put(site, c.p, c.id, c.facing) })
    put(site, origin, id, true)
    return result
  }
  function itemName(st) { return String(lazy().Registries.ITEMS.getKey(st.getItem())) }
  function fluidName(st) { return String(lazy().Registries.FLUIDS.getKey(st.getFluid())) }
  function readBus(bus) {
    var inv = bus.getInventory()
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = itemName(st)
      counts[id] = (counts[id] || 0) + Number(st.getCount())
    }
    return counts
  }
  function count(bus, id) { return readBus(bus)[id] || 0 }
  function emptyBus(bus) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, lazy().ItemStack.EMPTY)
  }
  function insert(bus, id, n) {
    var inv = bus.getInventory()
    var left = n
    for (var s = 0; s < inv.getSlots() && left > 0; s++) {
      var rest = inv.insertItem(s, Item.of(id, left), false)
      left = rest.isEmpty() ? 0 : Number(rest.getCount())
    }
    if (left > 0) throw new Error('could only insert ' + (n - left) + ' of ' + n + ' ' + id)
  }
  function circuit(bus, n) {
    bus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(n))
    if (bus.getCircuitInventory().getStackInSlot(0).isEmpty()) throw new Error('circuit ' + n + ' not accepted by the bus')
  }
  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return { id: st.isEmpty() ? 'none' : fluidName(st), amount: st.isEmpty() ? 0 : Number(st.getAmount()) }
  }
  function setTank(hatch, id, amount) {
    // a FluidStack built by KubeJS: setFluidInTank ignores one built outside it
    if (amount <= 0) hatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    else hatch.tank.setFluidInTank(0, Fluid.of(id, amount).getFluidStack())
  }
  function outFluids(m) {
    var t = {}
    ;['out1', 'out2'].forEach(function (role) {
      var info = tankInfo(m.P[role])
      if (info.amount > 0) t[info.id] = (t[info.id] || 0) + info.amount
    })
    return t
  }
  function summary(o) {
    var keys = Object.keys(o)
    return keys.length === 0 ? 'empty' : keys.map(function (k) { return k + ' x' + o[k] }).join(', ')
  }
  function failureReasons(ctrl) {
    try {
      return array(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
    } catch (e) {
      return ['unreadable: ' + e]
    }
  }
  function status(m) { return String(m.ctrl.getRecipeLogic().getStatus()) }
  function state(m) {
    try {
      var logic = m.ctrl.getRecipeLogic()
      var last = logic.getLastRecipe()
      return 'status=' + logic.getStatus() + ' progress=' + logic.getProgress() + '/' + logic.getDuration() +
        ' last=' + (last ? last.id + ' x' + last.parallels : 'none') + ' voiding=' + m.ctrl.getVoidingMode()
    } catch (e) {
      return 'state unreadable: ' + e
    }
  }
  function wake(m) { m.ctrl.getRecipeLogic().updateTickSubscription() }
  function power(m) {
    if (!m || !m.P || !m.P.energy || m.off) return
    var c = m.P.energy.energyContainer
    c.setEnergyStored(c.getEnergyCapacity())
  }
  function recipeEU(recipe) { return Number(S.G.generators.recipeEUt(recipe)) }
  function phase(name) {
    S.phase = name
    S.phaseAt = S.tick
    emit('stage', 'NOTE', name)
  }
  function dimensionsOf(recipe) {
    return array(recipe.conditions).map(function (c) {
      try { return String(c.getDimension().location()) + (c.isReverse() ? '(reversed)' : '') } catch (e) {
        return String(c.getClass().getSimpleName())
      }
    })
  }
  function liveRecipe(id) {
    var opt = S.server.getRecipeManager().byKey(new (lazy().RL)(id))
    return opt.isPresent() ? opt.get() : null
  }
  function staticChecks() {
    var IO = S.IO
    var defs = lazy().Registry.MACHINES
    var cond = defs.get(new (lazy().RL)(IO.condenser.machine))
    var intake = defs.get(new (lazy().RL)(IO.intake.machine))
    check('definitions', cond && intake && cond.isGenerator() === false && intake.isGenerator() === true &&
      intake.isRegressWhenWaiting() === false && S.G.structures[IO.condenser.machine] && S.G.structures[IO.intake.machine],
      IO.condenser.machine + ' consumer; ' + IO.intake.machine + ' native generator, regressWhenWaiting=false; both patterns published')
    var collect = liveRecipe('grindless:fumarole_condensing/collect')
    var separate = liveRecipe('grindless:fumarole_condensing/separate')
    var patera = liveRecipe('grindless:volcanic_heat/patera')
    check('recipes_exist', collect && separate && patera,
      'collect=' + !!collect + ', separate=' + !!separate + ', volcanic_heat/patera=' + !!patera)
    var dc = dimensionsOf(collect)
    var ds = dimensionsOf(separate)
    var dp = dimensionsOf(patera)
    check('recipe_sites', dc.length === 1 && dc[0] === S.ioDim && ds.length === 0 && dp.length === 1 && dp[0] === S.ioDim,
      'collect [' + dc.join(', ') + '], separate [' + ds.join(', ') + '], patera [' + dp.join(', ') + ']; Io = ' + S.ioDim)
    check('patera_price', recipeEU(patera) === MODULE_EU && Number(patera.duration) === 400,
      'volcanic_heat/patera makes ' + recipeEU(patera) + ' EU/t for ' + patera.duration + ' ticks per module (want 32768 x 400)')
  }

  // ---------------------------------------------------------------- Overworld (S0-7)
  function setupCondenser(m, label) {
    m.ctrl = at(m.site, m.origin)
    m.P = {}
    var parts = m.ctrl.getParts()
    var missing = []
    CONDENSER_ROLES.forEach(function (r) {
      m.P[r[0]] = at(m.site, m.pos[r[0]])
      if (!m.P[r[0]] || !parts.contains(m.P[r[0]])) missing.push(r[0])
    })
    check(label + '_condenser_FORMED', missing.length === 0, 'formed with three ' + S.IO.blocks.fumarole + ' and ' +
      CONDENSER_ROLES.length + ' front-wall parts' + (missing.length ? '; missing: ' + missing.join(', ') : ''))
  }
  function setupIntake(m, label) {
    m.ctrl = at(m.site, m.origin)
    m.P = {}
    var parts = m.ctrl.getParts()
    var missing = []
    INTAKE_ROLES.forEach(function (r) {
      m.P[r[0]] = at(m.site, m.pos[r[0]])
      if (!m.P[r[0]] || !parts.contains(m.P[r[0]])) missing.push(r[0])
    })
    check(label + '_intake_FORMED', missing.length === 0, 'formed on ' + S.IO.blocks.magma +
      (missing.length ? '; missing: ' + missing.join(', ') : '; dynamo, input bus and input hatch in the vault wall'))
    var cap = Number(S.G.generators.dynamoCapacity(m.ctrl))
    check(label + '_intake_capacity', cap === IO_EU, 'one LuV dynamo hatch carries ' + cap + ' EU/t (want 32768 V x 2 A)')
  }
  function modules(m) { return Number(S.IO.intake.modules(m.ctrl)) }
  function chargeIntake(m, bundles) {
    circuit(m.P.inBus, S.IO.recipes.intake.circuit)
    insert(m.P.inBus, S.IO.recipes.intake.bundle, bundles)
    setTank(m.P.inHatch, 'gtceu:sulfur_dioxide', S.IO.recipes.intake.so2)
    m.dynamo = m.P.dynamo.energyContainer
    m.removed = 0
    m.previous = 0
    m.good = 0
    m.bad = 0
    m.paid = 0
    wake(m)
  }
  // EU paid into the dynamo hatch since the charge, drained every tick
  function measure(m) {
    var c = m.dynamo
    var energy = Number(c.getEnergyStored())
    m.total = m.removed + energy
    m.delta = m.total - m.previous
    m.previous = m.total
    var logic = m.ctrl.getRecipeLogic()
    var r = logic.getLastRecipe()
    m.progress = Number(logic.getProgress())
    m.parallels = r ? Number(r.parallels) : 0
    if (m.delta > 0) {
      m.paid++
      if (m.delta === IO_EU && r && m.parallels === 2 && recipeEU(r) === IO_EU && Number(r.duration) === 400) m.good++
      else m.bad++
    } else if (m.delta < 0) m.bad++
    if (energy > 0) {
      m.removed += energy
      c.setEnergyStored(0)
    }
  }
  function negatives() {
    var C = S.ow.condenser
    var T = S.ow.intake
    var cf = at(C.site, C.origin)
    var tf = at(T.site, T.origin)
    check('condenser_needs_fumaroles', cf && !cf.isFormed(), '100 ticks with ' + BRIMSTONE + ' in one fumarole cell: not formed')
    check('intake_needs_magma', tf && !tf.isFormed(), '100 ticks with ' + BASALT + ' in one magma cell: not formed')
    put(C.site, C.swapped, S.IO.blocks.fumarole, false)
    put(T.site, T.swapped, S.IO.blocks.magma, false)
  }
  function formedOverworld() {
    var C = S.ow.condenser
    var T = S.ow.intake
    var cf = at(C.site, C.origin)
    var tf = at(T.site, T.origin)
    if (!cf || !tf || !cf.isFormed() || !tf.isFormed()) return false
    setupCondenser(C, 'ow')
    setupIntake(T, 'ow')
    var one = modules(T)
    check('modules_1', one === 1, 'module a only: IO.intake.modules = ' + one)
    T.cells.b.forEach(function (p) { put(T.site, p, S.IO.blocks.turbine, false) })
    var two = modules(T)
    check('modules_2', two === 2 && T.cells.b.length === 27, 'slot b filled (' + T.cells.b.length + ' turbine casings): ' + two)
    T.cells.c.slice(0, 13).forEach(function (p) { put(T.site, p, S.IO.blocks.turbine, false) })
    var partial = modules(T)
    check('modules_partial_c', partial === 2, '13 of 27 cells of slot c: still ' + partial)
    circuit(C.P.inBus, S.IO.recipes.collect.circuit)
    wake(C)
    chargeIntake(T, 1)
    return true
  }
  function offSite() {
    var C = S.ow.condenser
    var T = S.ow.intake
    measure(T)
    if (status(C) === 'WORKING' || status(T) === 'WORKING') {
      throw new Error('a machine started off Io: condenser ' + state(C) + '; intake ' + state(T))
    }
    if (S.tick - S.phaseAt < 80) return
    check('formed_after_modules', C.ctrl.isFormed() && T.ctrl.isFormed(), 'both controllers still formed after slots b and c changed')
    var made = outFluids(C)
    check('collect_off_io', Object.keys(made).length === 0 && Object.keys(readBus(C.P.outBus)).length === 0,
      '80 powered ticks, circuit 1, Overworld: nothing started or made (dimension condition); ' + state(C))
    var so2 = tankInfo(T.P.inHatch)
    check('intake_off_io', T.total === 0 && T.paid === 0 && so2.amount === S.IO.recipes.intake.so2 &&
      count(T.P.inBus, S.IO.recipes.intake.bundle) === 1,
      '80 ticks with circuit 1, ' + so2.amount + ' mB ' + so2.id + ' and one bundle, Overworld: 0 EU paid; ' + state(T))
    T.ctrl.setWorkingEnabled(false)
    C.ctrl.setVoidingMode(lazy().VoidingMode.VOID_ITEMS_FLUIDS)
    var s = S.IO.recipes.separate
    circuit(C.P.inBus, s.circuit)
    insert(C.P.inBus, SUBLIMATE, s.sublimate)
    setTank(C.P.in1, 'gtceu:hydrogen', s.hydrogen)
    setTank(C.P.in2, 'gtceu:hydrochloric_acid', s.hcl)
    wake(C)
    phase('voiding')
  }
  function voiding() {
    var C = S.ow.condenser
    if (status(C) === 'WORKING') throw new Error('condenser started while voiding: ' + state(C))
    if (S.tick - S.phaseAt < 60) return
    var s = S.IO.recipes.separate
    var reasons = failureReasons(C.ctrl)
    var shown = reasons.some(function (x) { return NO_VOIDING.test(x) })
    var kept = count(C.P.inBus, SUBLIMATE) === s.sublimate && tankInfo(C.P.in1).amount === s.hydrogen &&
      tankInfo(C.P.in2).amount === s.hcl && Object.keys(readBus(C.P.outBus)).length === 0
    check('no_voiding', kept && shown, 'circuit 2 inputs, controller voiding items and fluids, 60 ticks: inputs kept=' + kept +
      ', refusal shown=' + shown + ' [' + reasons.join('; ') + ']; ' + state(C))
    C.ctrl.setVoidingMode(lazy().VoidingMode.VOID_NONE)
    wake(C)
    phase('separate')
  }
  function separate() {
    var C = S.ow.condenser
    var s = S.IO.recipes.separate
    var out = readBus(C.P.outBus)
    if ((out['gtceu:germanium_dust'] || 0) > 0 && status(C) !== 'WORKING') {
      var fluids = outFluids(C)
      var h2 = tankInfo(C.P.in1)
      var hcl = tankInfo(C.P.in2)
      check('separate_anywhere', out['gtceu:germanium_dust'] === s.germanium && out['gtceu:indium_dust'] === s.indium &&
        Object.keys(out).length === 2 && fluids['minecraft:water'] === s.water && Object.keys(fluids).length === 1 &&
        count(C.P.inBus, SUBLIMATE) === 0 && h2.amount === 0 && hcl.id === 'gtceu:hydrochloric_acid' && hcl.amount === s.hcl,
        'Overworld circuit 2: ' + s.sublimate + ' sublimates + ' + s.hydrogen + ' mB hydrogen -> ' + summary(out) + ', fluids ' +
        summary(fluids) + '; hydrogen left ' + h2.amount + ' mB, HCl kept ' + hcl.amount + ' mB')
      C.ctrl.setWorkingEnabled(false)
      C.off = true
      optionalIo()
    } else if (S.tick - S.phaseAt > 400) throw new Error('separation did not finish: ' + state(C) + ' out=' + summary(out))
  }

  // ---------------------------------------------------------------- Io (optional until B1)
  function unavailable(reason) {
    global[COVERAGE] = REQUIRED + '; unresolved: ' + reason
    emit('io_REQUIRED', S.requireIo ? 'FAIL' : 'NOTE', REQUIRED + '; ' + reason + '; no Io proof claimed')
    finish()
  }
  function optionalIo() {
    var level = null
    try { level = S.server.getLevel(S.ioDim) } catch (e) { level = null }
    if (level === null || level === undefined) {
      unavailable('level ' + S.ioDim + ' not loaded on this server (package B1 adds Io)')
      return
    }
    var site = { dim: S.ioDim, level: level, y0: OFFWORLD_Y.y0, y1: OFFWORLD_Y.y1 }
    var cOrigin = { x: CONDENSER_X, y: 200, z: ORIGIN_Z }
    var tOrigin = { x: INTAKE_X, y: 200, z: ORIGIN_Z }
    var busy = footprintClear(site, S.IO.condenser.machine, cOrigin, FUMAROLE_GROUND) ||
      footprintClear(site, S.IO.intake.machine, tOrigin)
    if (busy) {
      unavailable('Io footprint at Y 198..214 not air (' + busy + ')')
      return
    }
    S.io = {
      condenser: build(site, S.IO.condenser.machine, cOrigin, { roles: CONDENSER_ROLES, ground: FUMAROLE_GROUND }),
      intake: build(site, S.IO.intake.machine, tOrigin, { roles: INTAKE_ROLES, skip: { c: true, d: true } })
    }
    phase('io_form')
  }
  function ioForm() {
    var C = S.io.condenser
    var T = S.io.intake
    var cf = at(C.site, C.origin)
    var tf = at(T.site, T.origin)
    if (!cf || !tf || !cf.isFormed() || !tf.isFormed()) {
      if (S.tick - S.phaseAt > 400) throw new Error('Io structures did not form')
      return
    }
    setupCondenser(C, 'io')
    setupIntake(T, 'io')
    check('io_modules_2', modules(T) === 2, 'slots a and b built on Io: IO.intake.modules = ' + modules(T))
    circuit(C.P.inBus, S.IO.recipes.collect.circuit)
    wake(C)
    chargeIntake(T, 4)
    phase('io_run')
  }
  function ioRun() {
    var C = S.io.condenser
    var T = S.io.intake
    var k = S.IO.recipes.collect
    if (!T.done) {
      measure(T)
      if (T.paid > 0 && T.bad > 0) {
        throw new Error('intake paid an unexpected amount: delta=' + T.delta + ', parallels=' + T.parallels + '; ' + state(T))
      }
      if (T.good >= 40) {
        var so2 = tankInfo(T.P.inHatch)
        check('io_intake_65536', T.bad === 0 && T.parallels === 2 && T.total === T.paid * IO_EU,
          '2 modules, LuV dynamo 2 A: ' + T.good + ' measured ticks at ' + IO_EU + ' EU/t (2 x 32768), total ' + T.total + ' EU')
        check('io_intake_paid_ticks', T.total <= T.progress * IO_EU && T.total >= (T.progress - 1) * IO_EU &&
          so2.amount === S.IO.recipes.intake.so2,
          'total ' + T.total + ' EU against progress ' + T.progress + ' x ' + IO_EU + ' (never more than paid ticks); SO2 kept ' +
          so2.amount + ' mB; bundles left ' + count(T.P.inBus, S.IO.recipes.intake.bundle) + ' of 4')
        T.ctrl.setWorkingEnabled(false)
        T.done = true
      }
    }
    if (!C.done) {
      var out = readBus(C.P.outBus)
      if ((out[SUBLIMATE] || 0) > 0) {
        var fluids = outFluids(C)
        check('io_collect', out[SUBLIMATE] === k.sublimate && out['gtceu:sulfur_dust'] === k.sulfur && Object.keys(out).length === 2 &&
          fluids['gtceu:sulfur_dioxide'] === k.so2 && Object.keys(fluids).length === 1,
          'one Io collect run (circuit 1, no inputs): ' + summary(out) + ', fluids ' + summary(fluids))
        C.ctrl.setWorkingEnabled(false)
        C.off = true
        C.done = true
      }
    }
    if (T.done && C.done) {
      global[COVERAGE] = 'Overworld S0-7 and Io stages completed; see native PASS markers'
      finish()
    } else if (S.tick - S.phaseAt > 800) throw new Error('Io run deadline: condenser ' + state(C) + '; intake ' + state(T))
  }

  function step() {
    if (!S || S.finished) return
    S.tick = Number(S.server.getTickCount()) - S.tick0
    if (Date.now() - S.requestedAt > 150000 || S.tick > 2800) throw new Error('overall deadline in ' + S.phase)
    ;[S.ow && S.ow.condenser, S.io && S.io.condenser].forEach(power)
    var elapsed = S.tick - S.phaseAt
    if (S.phase === 'negative') {
      if (elapsed >= 100) {
        negatives()
        phase('form')
      }
    } else if (S.phase === 'form') {
      if (formedOverworld()) phase('off_site')
      else if (elapsed > 400) throw new Error('Overworld structures did not form after the swap')
    } else if (S.phase === 'off_site') offSite()
    else if (S.phase === 'voiding') voiding()
    else if (S.phase === 'separate') separate()
    else if (S.phase === 'io_form') ioForm()
    else if (S.phase === 'io_run') ioRun()
  }
  function finish() {
    if (!S || S.finished) return
    S.finished = true
    var problems = []
    ;[S.ow, S.io].forEach(function (g) {
      if (!g) return
      ;[g.condenser, g.intake].forEach(function (m) {
        if (!m) return
        try {
          var ctrl = m.ctrl || at(m.site, m.origin)
          if (ctrl) ctrl.setWorkingEnabled(false)
        } catch (e) { problems.push('disable: ' + e) }
        // empty what the parts hold so nothing drops when they are removed
        Object.keys(m.pos).forEach(function (role) {
          try {
            var part = at(m.site, m.pos[role])
            if (!part) return
            if (typeof part.getInventory === 'function') emptyBus(part)
            if (typeof part.getCircuitInventory === 'function' && Number(part.getCircuitInventory().getSlots()) > 0) {
              part.getCircuitInventory().setStackInSlot(0, lazy().ItemStack.EMPTY)
            }
            if (part.tank) setTank(part, '', 0)
          } catch (e) { problems.push('empty ' + role + ': ' + e) }
        })
      })
    })
    S.order.slice().reverse().forEach(function (o) {
      try {
        cmd(o.site, 'setblock ' + o.p.x + ' ' + o.p.y + ' ' + o.p.z + ' minecraft:air replace')
        if (block(o.site, o.p) !== 'minecraft:air') problems.push('block remains ' + key(o.site, o.p))
      } catch (e) { problems.push('block ' + key(o.site, o.p) + ': ' + e) }
    })
    S.sites.forEach(function (site) {
      try {
        cmd(site, 'kill @e[type=minecraft:item,x=' + BAND.x0 + ',y=' + site.y0 + ',z=' + BAND.z0 + ',dx=' + (BAND.x1 - BAND.x0) +
          ',dy=' + (site.y1 - site.y0) + ',dz=' + (BAND.z1 - BAND.z0) + ']')
      } catch (e) { problems.push('items: ' + e) }
    })
    S.tickets.forEach(function (t) {
      try {
        cmd(t.site, 'forceload remove ' + t.x + ' ' + t.z)
        if (cmd(t.site, 'forceload query ' + t.x + ' ' + t.z) > 0) problems.push('ticket remains ' + t.site.dim + ' ' + t.x + ',' + t.z)
      } catch (e) { problems.push('ticket: ' + e) }
    })
    emit('cleanup', problems.length === 0 ? 'PASS' : 'FAIL',
      problems.length ? problems.join('; ') : S.order.length + ' owned blocks and ' + S.tickets.length + ' owned tickets removed; preexisting tickets retained')
    console.info('GGTEST|luv_io_surface|DONE')
  }
  function start(server) {
    var G = global.grindless
    S = { server: server, G: G, requestedAt: REQUESTED_AT || Date.now(),
      tick0: Number(server.getTickCount()), tick: 0, phaseAt: 0, phase: 'setup',
      owned: {}, order: [], chunks: {}, tickets: [], sites: [], finished: false, ow: null, io: null,
      requireIo: global.ggTestLuvIoSurfaceRequireIo === true }
    global[COVERAGE] = REQUIRED + '; not yet exercised'
    check('shared_registrations', G && G.ioSurface && G.ioSurface.recipes && G.places && G.structures && G.generators,
      'A1/B6 shared registrations required; no fixture substitutions')
    S.IO = G.ioSurface
    S.ioDim = String(G.places.surface(S.IO.place))
    var level = server.getLevel('minecraft:overworld')
    check('overworld_loaded', level !== null && level !== undefined, 'minecraft:overworld')
    var ow = { dim: 'minecraft:overworld', level: level, y0: OVERWORLD_Y.y0, y1: OVERWORLD_Y.y1 }
    staticChecks()
    S.ow = {
      condenser: build(ow, S.IO.condenser.machine, { x: CONDENSER_X, y: 100, z: ORIGIN_Z },
        { roles: CONDENSER_ROLES, swap: { ch: 'F', id: BRIMSTONE }, ground: FUMAROLE_GROUND }),
      intake: build(ow, S.IO.intake.machine, { x: INTAKE_X, y: 100, z: ORIGIN_Z },
        { roles: INTAKE_ROLES, skip: { b: true, c: true, d: true }, swap: { ch: 'M', id: BASALT } })
    }
    phase('negative')
  }
  ServerEvents.customCommand('gg_test_luv_io_surface', function () {
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
        console.info('GGTEST|luv_io_surface|DONE')
      }
    }
  })
})()
