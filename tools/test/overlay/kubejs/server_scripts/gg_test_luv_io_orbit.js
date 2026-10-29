// priority: -4624
// TEST-ONLY B7 fixture (the Io-orbit slot: the flux-tube tether or its fallback, the Io sulfur-iodine plant); prepared for the single
// integrated LuV validation owner, not a standalone launch.
// Command: kubejs custom_command gg_test_luv_io_orbit
// Marker: GGTEST|luv_io_orbit|DONE (owner's marker wait: at most 180 seconds). Run gg_test_recipe_lookup in the same boot (new types).
// Requires A1/B7 registrations: G.stations (lib/stations.js, tables/stations.json), G.ioOrbit (startup and server luv/io_orbit.js, with
// IOO.recipes), G.hidden (integration/hidden.js), G.places, G.structures, G.generators. Never changes any clock or weather.
// Band: X 18432..18495, Z 0..63: the Overworld at Y 98..112; Io orbit (G.stations.second) and Io's surface (G.places.surface('io'))
// at the same X/Z, Y 198..214. Every controller faces north at Z 2, its structure behind it (Z 2..6).
//   tether mode         Io orbit: a 4 A tether at X 18440 (X 18438..18442) and a 2 A tether at X 18456 (X 18454..18458), each on a
//                       5x5 station truss pad at Y 198, the tether at Y 199..213; the Overworld: a 2 A tether at X 18472 (X 18470..18474),
//                       Y 98..112 (its dynamo never holds EU there, so rain is harmless)
//   sulfur_iodine mode  Io: a plant with module a only at X 18440 (X 18435..18445) and one with all four modules at X 18460
//                       (X 18455..18465), magma at Y 199, top at Y 212; the Overworld: module a only at X 18480 (X 18475..18485),
//                       magma at Y 98, top at Y 111, under a radiation vault roof at Y 112 (X 18474..18486, Z 1..7): its energy hatch is
//                       kept full and a powered hatch in the rain may explode
//   pending mode        nothing is built
// Checks (GGTEST|luv_io_orbit|<check>|PASS|FAIL|INFO|NOTE|SKIPPED|<detail>):
//   mode                    INFO: G.stations.b7 and the table it comes from
//   shared_registrations    the globals above are published; G.ioOrbit.mode is G.stations.b7
//   registry                GTRegistries: exactly the active machine and its recipe type exist; the inactive ones (both while pending) do not
//   hiding                  grindless:tether_spool carries #c:hidden_from_recipe_viewers and #grindless:hidden_with_recipes and is not in
//                           G.hidden.shownBySwitch unless the mode is tether (then: no tag, listed)
//   recipes                 the active mode's recipe ids are live, the other mode's are not (none while pending)
//   recipe_site             the active GT recipe has one dimension condition, its site; its EU/t and 400 ticks
//   tether_formed           the 4 A tether forms in Io orbit (dynamo 32768 V x 4 A = 131072 EU/t)
//   tether_run              circuit 1, 2 spools, argon: a run of 2 parallels at 131072 EU/t (the last recipe's RecipeHelper total EU)
//                           paid into the hatch tick by tick for 20 ticks, 50 mB of argon taken
//   tether_formed_2a        the 2 A tether forms beside it (65536 EU/t)
//   tether_one_reel_dynamo  the same charge with one 2 A hatch: 1 parallel at 65536 EU/t, 25 mB of argon taken
//   tether_no_regress       the definition is a generator with regressWhenWaiting false; the 2 A hatch, no longer drained, fills, the
//                           run WAITs and for 40 ticks keeps its progress and pays nothing more
//   tether_off_site         the same structure in the Overworld forms, 80 ticks with the charge: never WORKING, 0 EU, charge intact
//   plant_formed            the plant forms on Io over magma with module a only; IOO.plant.modules = 1
//   plant_run               water + kept sulfuric acid + 8 iodine dust + circuit 1, one run (fast-forwarded with RecipeLogic#setProgress,
//                           the outputs stay GTM's): 1 parallel at 30 EU/t, 2000 mB hydrogen + 1000 mB oxygen, the acid and iodine kept
//   plant_modules           four modules: IOO.plant.modules = 4, one run of 4 parallels: 8000 mB hydrogen + 4000 mB oxygen from 4000 mB water
//   plant_no_voiding        the first plant, voiding items and fluids, with water again: 60 ticks, never WORKING, inputs kept, the
//                           no_voiding reason shown
//   plant_off_site          the same plant in the Overworld forms and is powered, 80 ticks: never WORKING, nothing made, inputs intact
//   other_design            INFO: the inactive design's stages do not apply in this mode
//   cleanup                 every owned block and ticket removed, preexisting tickets kept
// While pending every machine stage (and recipe_site) is SKIPPED with the reason 'S0-3 pending: tables/stations.json', never PASS.
// All blocks/tickets are owned, bounded to the band, and removed before DONE. Deadlines: 2800 ticks and 150 seconds from the command
// (including the reload quiet period); no retries.
(function () {
  var REQUEST = 'ggTestLuvIoOrbitRequest'
  var LOADED_AT = Date.now()
  var REQUESTED_AT = 0
  var S = null
  var J = null
  var W = null
  var BAND = { x0: 18432, x1: 18495, z0: 0, z1: 63 }
  var OVERWORLD_Y = { y0: 98, y1: 112 }
  var OFFWORLD_Y = { y0: 198, y1: 214 }
  var ORIGIN_Z = 2
  var PENDING = 'S0-3 pending: tables/stations.json'
  var TETHER = 'gtceu:flux_tube_tether'
  var PLANT = 'gtceu:sulfur_iodine_plant'
  var TETHER_TYPE = 'gtceu:electrodynamic_tether'
  var PLANT_TYPE = 'gtceu:thermochemical_hydrogen'
  var TORUS = 'grindless:electrodynamic_tether/plasma_torus'
  var SULFUR_IODINE = 'grindless:thermochemical_hydrogen/sulfur_iodine'
  var SPOOL = 'grindless:tether_spool'
  var HIDDEN_TAG = 'c:hidden_from_recipe_viewers'
  var RECIPES_TAG = 'grindless:hidden_with_recipes'
  var RECIPES = {
    tether: [TORUS, 'grindless:assembly_line/luv/tether_spool', 'grindless:assembly_line/flux_tube_tether'],
    sulfur_iodine: [SULFUR_IODINE, 'grindless:assembly_line/sulfur_iodine_plant']
  }
  var STAGES = {
    tether: ['tether_formed', 'tether_run', 'tether_formed_2a', 'tether_one_reel_dynamo', 'tether_no_regress', 'tether_off_site'],
    sulfur_iodine: ['plant_formed', 'plant_run', 'plant_modules', 'plant_no_voiding', 'plant_off_site']
  }
  var LUV_V = 32768
  var REEL_EU = 65536
  var TWO_REELS = 131072
  var REELS = 2
  var ARGON = 1000
  var MEASURED = 20
  var FORM_TICKS = 400
  var RUN_TICKS = 300
  var FILL_TICKS = 300
  var HOLD_TICKS = 40
  var IDLE_TICKS = 80
  var VOID_TICKS = 60
  var NO_VOIDING = /sulfur_iodine_plant\.no_voiding|[Vv]oid/
  var TETHER_4A = [
    ['dynamo', 'energy_output', 'gtceu:luv_energy_output_hatch_4a'],
    ['inBus', 'input_bus', 'gtceu:luv_input_bus'],
    ['inHatch', 'input_hatch', 'gtceu:luv_input_hatch']
  ]
  var TETHER_2A = [
    ['dynamo', 'energy_output', 'gtceu:luv_energy_output_hatch'],
    ['inBus', 'input_bus', 'gtceu:luv_input_bus'],
    ['inHatch', 'input_hatch', 'gtceu:luv_input_hatch']
  ]
  var PLANT_ROLES = [
    ['energy', 'energy_input', 'gtceu:luv_energy_input_hatch'],
    ['inBus', 'input_bus', 'gtceu:luv_input_bus'],
    ['in1', 'input_hatch', 'gtceu:luv_input_hatch'],
    ['in2', 'input_hatch', 'gtceu:luv_input_hatch'],
    ['out1', 'output_hatch', 'gtceu:luv_output_hatch'],
    ['out2', 'output_hatch', 'gtceu:luv_output_hatch']
  ]

  function emit(name, status, detail) {
    console.info('GGTEST|luv_io_orbit|' + name + '|' + status +
      (detail ? '|' + String(detail).replace(/[\r\n|]+/g, ' ').substring(0, 2200) : ''))
  }
  function check(name, ok, detail) {
    emit(name, ok ? 'PASS' : 'FAIL', detail)
    if (!ok) throw new Error(name + ': ' + detail)
  }
  // the classes the registry stage needs (the pending mode loads nothing else)
  function core() {
    if (J === null) J = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      AL: Java.loadClass('java.util.ArrayList'),
      Registry: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
    }
    return J
  }
  function world() {
    if (W === null) W = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
      FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Machine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
      VoidingMode: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
    }
    return W
  }
  function rl(id) { return new (core().RL)(id) }
  function present(v) { return v !== null && v !== undefined }
  function array(coll) {
    var list = new (core().AL)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function contains(list, x) {
    if (!present(list)) return false
    var n = typeof list.length === 'number' ? list.length : Number(list.size())
    for (var i = 0; i < n; i++) {
      var v = typeof list.length === 'number' ? list[i] : list.get(i)
      if (String(v) === x) return true
    }
    return false
  }
  function pos(p) { return new (world().Pos)(p.x, p.y, p.z) }
  function at(site, p) { return world().Machine.getMachine(site.level, pos(p)) }
  function cmd(site, text) { return Number(S.server.runCommandSilent('execute in ' + site.dim + ' run ' + text)) }
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
  // the first remaining role a cell takes: a part cell (the tether's roof hatch) anywhere, a casing-or-part cell only on the front wall
  function roleFor(c, roles) {
    for (var r = 0; r < roles.length; r++) {
      if (c.sym.kind === 'part' && c.sym.ability === roles[r][1]) return r
      if (c.front && allows(c.sym, roles[r][1])) return r
    }
    return -1
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
  // a horizontal slab of one block (the tether's pad, the plant's roof), outside the pattern's cells
  function slab(x0, x1, y, z0, z1, id) {
    var out = []
    for (var x = x0; x <= x1; x++) {
      for (var z = z0; z <= z1; z++) out.push({ p: { x: x, y: y, z: z }, id: id })
    }
    return out
  }
  // opts: name, stage (the check a failure of this machine reports), roles [[role, ability, block id]], skip { symbol: true } cells left
  // as air, extra [{ p, id }] blocks placed first (pad, roof)
  function build(site, id, origin, opts) {
    var cells = cellsOf(id, origin)
    var extra = opts.extra || []
    var m = { name: opts.name, stage: opts.stage, site: site, id: id, origin: origin, pos: {}, cells: {}, roles: opts.roles,
      phase: 'form', at: S.tick, done: false, off: false, P: null }
    var roles = opts.roles.slice()
    var plan = []
    extra.forEach(function (e) {
      inside(site, e.p)
      ticket(site, e.p)
      if (block(site, e.p) !== 'minecraft:air') throw new Error(opts.name + ': footprint is occupied at ' + key(site, e.p))
    })
    cells.forEach(function (c) {
      inside(site, c.p)
      ticket(site, c.p)
      if (block(site, c.p) !== 'minecraft:air') throw new Error(opts.name + ': footprint is occupied at ' + key(site, c.p))
      if (!c.sym || c.sym.kind === 'controller' || c.sym.kind === 'air' || c.sym.kind === 'any') return
      ;(m.cells[c.ch] = m.cells[c.ch] || []).push(c.p)
      if (opts.skip && opts.skip[c.ch]) return
      var r = roleFor(c, roles)
      if (r >= 0) {
        var role = roles.splice(r, 1)[0]
        m.pos[role[0]] = c.p
        plan.push({ p: c.p, id: role[2], facing: true })
        return
      }
      if (c.sym.kind === 'part') throw new Error(opts.name + ': part cell ' + c.ch + ' (' + c.sym.ability + ') has no role')
      plan.push({ p: c.p, id: plain(c.sym), facing: false })
    })
    if (roles.length > 0) throw new Error(opts.name + ': no slot for ' + roles.map(function (r) { return r[0] }).join(', '))
    extra.forEach(function (e) { put(site, e.p, e.id, false) })
    plan.forEach(function (c) { put(site, c.p, c.id, c.facing) })
    put(site, origin, id, true)
    return m
  }
  function itemName(st) { return String(world().Registries.ITEMS.getKey(st.getItem())) }
  function fluidName(st) { return String(world().Registries.FLUIDS.getKey(st.getFluid())) }
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
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, world().ItemStack.EMPTY)
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
    bus.getCircuitInventory().setStackInSlot(0, world().Circuit.stack(n))
    if (bus.getCircuitInventory().getStackInSlot(0).isEmpty()) throw new Error('circuit ' + n + ' not accepted by the bus')
  }
  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return { id: st.isEmpty() ? 'none' : fluidName(st), amount: st.isEmpty() ? 0 : Number(st.getAmount()) }
  }
  function setTank(hatch, id, amount) {
    // a FluidStack built by KubeJS: setFluidInTank ignores one built outside it
    if (amount <= 0) hatch.tank.setFluidInTank(0, world().FluidStack.EMPTY)
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
      return m.name + ': status=' + logic.getStatus() + ' progress=' + logic.getProgress() + '/' + logic.getDuration() +
        ' last=' + (last ? last.id + ' x' + last.parallels : 'none') + ' voiding=' + m.ctrl.getVoidingMode()
    } catch (e) {
      return m.name + ': state unreadable: ' + e
    }
  }
  function wake(m) { m.ctrl.getRecipeLogic().updateTickSubscription() }
  function power(m) {
    if (!m || !m.P || !m.P.energy || m.off) return
    var c = m.P.energy.energyContainer
    c.setEnergyStored(c.getEnergyCapacity())
  }
  // EU/t a generator recipe makes (all its parallels), and EU/t a consumer recipe takes: RecipeHelper's total, never getRealEUt
  function recipeEU(recipe) { return Number(S.G.generators.recipeEUt(recipe)) }
  function inputEU(recipe) {
    var io = world().RecipeHelper.getRealEUtWithIO(recipe)
    return !io.isEmpty() && io.isInput() ? Number(io.getTotalEU()) : 0
  }
  function go(m, phase) {
    m.phase = phase
    m.at = S.tick
    emit('stage', 'NOTE', m.name + ': ' + phase)
  }
  function age(m) { return S.tick - m.at }
  function dimensionsOf(recipe) {
    return array(recipe.conditions).map(function (c) {
      try { return String(c.getDimension().location()) + (c.isReverse() ? '(reversed)' : '') } catch (e) {
        return String(c.getClass().getSimpleName())
      }
    })
  }
  function liveRecipe(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }
  function formed(m) {
    var c = at(m.site, m.origin)
    return present(c) && c.isFormed()
  }
  // the controller and its parts; the roles a formed structure did not take
  function setup(m) {
    m.ctrl = at(m.site, m.origin)
    m.P = {}
    var parts = m.ctrl.getParts()
    var missing = []
    m.roles.forEach(function (r) {
      m.P[r[0]] = at(m.site, m.pos[r[0]])
      if (!m.P[r[0]] || !parts.contains(m.P[r[0]])) missing.push(r[0])
    })
    return missing
  }
  function waitFormed(m) {
    if (formed(m)) return true
    if (age(m) > FORM_TICKS) check(m.stage, false, m.name + ' did not form in ' + FORM_TICKS + ' ticks in ' + m.site.dim)
    return false
  }
  function where(m) { return m.site.dim + ' at ' + m.origin.x + ',' + m.origin.y + ',' + m.origin.z }

  // ---------------------------------------------------------------- every mode: registry, hiding, recipes
  function staticChecks() {
    var mode = S.mode
    var reg = core().Registry
    var want = { tether: mode === 'tether', plant: mode === 'sulfur_iodine' }
    var got = {
      tether: present(reg.MACHINES.get(rl(TETHER))),
      tetherType: present(reg.RECIPE_TYPES.get(rl(TETHER_TYPE))),
      plant: present(reg.MACHINES.get(rl(PLANT))),
      plantType: present(reg.RECIPE_TYPES.get(rl(PLANT_TYPE)))
    }
    var ids = S.IOO.tether.machine === TETHER && 'gtceu:' + S.IOO.tether.type === TETHER_TYPE &&
      S.IOO.plant.machine === PLANT && 'gtceu:' + S.IOO.plant.type === PLANT_TYPE
    check('registry', ids && got.tether === want.tether && got.tetherType === want.tether &&
      got.plant === want.plant && got.plantType === want.plant,
      'mode ' + mode + ': ' + TETHER + ' ' + got.tether + ', ' + TETHER_TYPE + ' ' + got.tetherType + ' (want ' + want.tether + '); ' +
      PLANT + ' ' + got.plant + ', ' + PLANT_TYPE + ' ' + got.plantType + ' (want ' + want.plant + '); G.ioOrbit ids match=' + ids)
    var spool = Item.of(SPOOL)
    var tagged = spool.hasTag(HIDDEN_TAG) === true
    var withRecipes = spool.hasTag(RECIPES_TAG) === true
    var shown = contains(S.G.hidden.shownBySwitch, SPOOL)
    var hide = mode !== 'tether'
    var sw = S.G.stations.switches
    check('hiding', Item.exists(SPOOL) && tagged === hide && withRecipes === hide && shown === !hide && sw.tether === !hide,
      SPOOL + ': #' + HIDDEN_TAG + ' ' + tagged + ', #' + RECIPES_TAG + ' ' + withRecipes + ', in G.hidden.shownBySwitch ' + shown +
      ', switches.tether ' + sw.tether + ' (want hidden=' + hide + ' in mode ' + mode + ')')
    var wrong = []
    var live = []
    ;['tether', 'sulfur_iodine'].forEach(function (k) {
      RECIPES[k].forEach(function (id) {
        var isLive = liveRecipe(id) !== null
        if (isLive) live.push(id)
        if (isLive !== (k === mode)) wrong.push(id + (isLive ? ' live' : ' missing'))
      })
    })
    check('recipes', wrong.length === 0, 'mode ' + mode + ': live [' + live.join(', ') + ']' +
      (wrong.length ? '; wrong: ' + wrong.join(', ') : '; the other mode has none'))
  }
  function recipeSite() {
    var tether = S.mode === 'tether'
    var id = tether ? TORUS : SULFUR_IODINE
    var site = tether ? S.orbitDim : S.ioDim
    var r = liveRecipe(id)
    var dims = dimensionsOf(r)
    var eu = tether ? recipeEU(r) : inputEU(r)
    var want = tether ? S.R.tether.eut : S.R.plant.eut
    check('recipe_site', dims.length === 1 && dims[0] === site && eu === want && Number(r.duration) === 400,
      id + ': conditions [' + dims.join(', ') + '] (want ' + site + '), ' + eu + ' EU/t ' + (tether ? 'made' : 'used') + ' (want ' + want +
      ') for ' + r.duration + ' ticks')
  }

  // ---------------------------------------------------------------- tether mode
  function chargeTether(m) {
    var t = S.R.tether
    circuit(m.P.inBus, t.circuit)
    insert(m.P.inBus, t.spool, REELS)
    setTank(m.P.inHatch, 'gtceu:argon', ARGON)
    m.dynamo = m.P.dynamo.energyContainer
    m.removed = 0
    m.previous = 0
    m.total = 0
    m.good = 0
    m.bad = 0
    m.paid = 0
    m.drain = true
    wake(m)
  }
  // EU paid into the dynamo hatch since the charge (drained every tick while m.drain), checked tick by tick against the run
  function measure(m, want, parallels) {
    var energy = Number(m.dynamo.getEnergyStored())
    m.total = m.removed + energy
    m.delta = m.total - m.previous
    m.previous = m.total
    var logic = m.ctrl.getRecipeLogic()
    var r = logic.getLastRecipe()
    m.status = String(logic.getStatus())
    m.progress = Number(logic.getProgress())
    m.parallels = r ? Number(r.parallels) : 0
    m.eut = r ? recipeEU(r) : 0
    m.rid = r ? String(r.id) : 'none'
    if (m.delta > 0) {
      m.paid++
      if (m.delta === want && m.parallels === parallels && m.eut === want && Number(r.duration) === 400 && m.rid === TORUS) m.good++
      else m.bad++
    } else if (m.delta < 0) m.bad++
    if (m.drain && energy > 0) {
      m.removed += energy
      m.dynamo.setEnergyStored(0)
    }
  }
  function runText(m) {
    return m.paid + ' paid ticks (' + m.good + ' good, ' + m.bad + ' bad), last delta ' + m.delta + ' EU, total ' + m.total + ' EU; ' +
      m.rid + ' x' + m.parallels + ' at ' + m.eut + ' EU/t; argon ' + tankInfo(m.P.inHatch).amount + ' mB, spools ' +
      count(m.P.inBus, SPOOL) + '; ' + state(m)
  }
  function tetherReels(m) {
    if (m.phase === 'form') {
      if (!waitFormed(m)) return
      var missing = setup(m)
      var cap = Number(S.G.generators.dynamoCapacity(m.ctrl))
      check('tether_formed', missing.length === 0 && cap === TWO_REELS && Number(m.P.dynamo.energyContainer.getOutputAmperage()) === 4,
        'Io orbit on a station truss pad, ' + where(m) + '; dynamo, input bus and roof hatch in place' +
        (missing.length ? ' (missing: ' + missing.join(', ') + ')' : '') + '; one LuV 4 A dynamo carries ' + cap + ' EU/t (want ' + TWO_REELS + ')')
      chargeTether(m)
      go(m, 'run')
    } else if (m.phase === 'run') {
      measure(m, TWO_REELS, REELS)
      if (m.bad > 0) check('tether_run', false, 'unexpected payment: ' + runText(m))
      if (m.good >= MEASURED) {
        var argon = tankInfo(m.P.inHatch).amount
        check('tether_run', m.parallels === REELS && m.total === m.paid * TWO_REELS && m.status === 'WORKING' &&
          argon === ARGON - REELS * S.R.tether.argon,
          'circuit 1, ' + REELS + ' spools, ' + ARGON + ' mB argon: ' + REELS + ' parallels at ' + TWO_REELS + ' EU/t reached the hatch; ' + runText(m))
        m.ctrl.setWorkingEnabled(false)
        m.done = true
      } else if (age(m) > RUN_TICKS) check('tether_run', false, 'no sustained run: ' + runText(m))
    }
  }
  function tetherOneReel(m) {
    if (m.phase === 'form') {
      if (!waitFormed(m)) return
      var missing = setup(m)
      var cap = Number(S.G.generators.dynamoCapacity(m.ctrl))
      check('tether_formed_2a', missing.length === 0 && cap === REEL_EU, where(m) + ' with one LuV 2 A dynamo: ' + cap + ' EU/t' +
        (missing.length ? ' (missing: ' + missing.join(', ') + ')' : ''))
      chargeTether(m)
      go(m, 'run')
    } else if (m.phase === 'run') {
      measure(m, REEL_EU, 1)
      if (m.bad > 0) check('tether_one_reel_dynamo', false, 'unexpected payment: ' + runText(m))
      if (m.good >= MEASURED) {
        var argon = tankInfo(m.P.inHatch).amount
        check('tether_one_reel_dynamo', m.parallels === 1 && m.total === m.paid * REEL_EU && argon === ARGON - S.R.tether.argon,
          'the same charge (' + REELS + ' spools) with one 2 A hatch (' + LUV_V + ' V x 2 A): 1 parallel at ' + REEL_EU + ' EU/t; ' + runText(m))
        m.drain = false
        go(m, 'fill')
      } else if (age(m) > RUN_TICKS) check('tether_one_reel_dynamo', false, 'no sustained run: ' + runText(m))
    } else if (m.phase === 'fill') {
      // the last payment before the hatch is full may be partial: only an overpayment is wrong here
      measure(m, REEL_EU, 1)
      if (m.delta > REEL_EU || m.delta < 0) check('tether_no_regress', false, 'unexpected payment while filling: ' + runText(m))
      if (m.status === 'WAITING') {
        m.wait = { progress: m.progress, total: m.total, stored: Number(m.dynamo.getEnergyStored()) }
        go(m, 'hold')
      } else if (age(m) > FILL_TICKS) {
        check('tether_no_regress', false, 'the hatch (' + m.dynamo.getEnergyStored() + ' of ' + m.dynamo.getEnergyCapacity() +
          ' EU) never backed the run up: ' + runText(m))
      }
    } else if (m.phase === 'hold') {
      measure(m, REEL_EU, 1)
      if (m.status !== 'WAITING' || m.progress !== m.wait.progress || m.total !== m.wait.total) {
        check('tether_no_regress', false, 'blocked run moved: progress ' + m.wait.progress + ' -> ' + m.progress + ', total ' +
          m.wait.total + ' -> ' + m.total + ' EU; ' + runText(m))
      }
      if (age(m) >= HOLD_TICKS) {
        var def = core().Registry.MACHINES.get(rl(TETHER))
        check('tether_no_regress', def.isGenerator() === true && def.isRegressWhenWaiting() === false && m.progress > 0 && m.progress < 400,
          'definition: generator ' + def.isGenerator() + ', regressWhenWaiting ' + def.isRegressWhenWaiting() + '; the full hatch (' +
          m.wait.stored + ' of ' + m.dynamo.getEnergyCapacity() + ' EU) held the run WAITING ' + HOLD_TICKS + ' ticks at progress ' +
          m.progress + '/400, total EU unchanged at ' + m.total)
        m.ctrl.setWorkingEnabled(false)
        m.done = true
      }
    }
  }
  function tetherOffSite(m) {
    if (m.phase === 'form') {
      if (!waitFormed(m)) return
      var missing = setup(m)
      if (missing.length) check('tether_off_site', false, where(m) + ' formed without ' + missing.join(', '))
      chargeTether(m)
      go(m, 'idle')
    } else if (m.phase === 'idle') {
      measure(m, REEL_EU, 1)
      if (m.status === 'WORKING' || m.total > 0) check('tether_off_site', false, 'started off its site: ' + runText(m))
      if (age(m) >= IDLE_TICKS) {
        var argon = tankInfo(m.P.inHatch).amount
        check('tether_off_site', m.ctrl.isFormed() && m.total === 0 && argon === ARGON && count(m.P.inBus, SPOOL) === REELS,
          'formed in the Overworld (' + where(m) + '), ' + IDLE_TICKS + ' ticks with circuit 1, ' + REELS + ' spools and ' + ARGON +
          ' mB argon: 0 EU, charge intact (dimension condition); reasons [' + failureReasons(m.ctrl).join('; ') + ']; ' + state(m))
        m.ctrl.setWorkingEnabled(false)
        m.done = true
      }
    }
  }

  // ---------------------------------------------------------------- sulfur-iodine mode
  function chargePlant(m, water) {
    var p = S.R.plant
    circuit(m.P.inBus, p.circuit)
    insert(m.P.inBus, 'gtceu:iodine_dust', p.iodine)
    setTank(m.P.in1, 'minecraft:water', water)
    setTank(m.P.in2, 'gtceu:sulfuric_acid', p.acid)
    m.ff = false
    m.run = null
    wake(m)
  }
  function modules(m) { return Number(S.IOO.plant.modules(m.ctrl)) }
  // the run under way: its copies and EU/t, then its waiting skipped (GTM finishes it on its next tick with its real outputs)
  function watch(m) {
    var logic = m.ctrl.getRecipeLogic()
    if (String(logic.getStatus()) !== 'WORKING') return
    var last = logic.getLastRecipe()
    if (last && m.run === null) {
      m.run = { id: String(last.id), parallels: Number(last.parallels), eut: inputEU(last), duration: Number(last.duration) }
    }
    if (m.run !== null && !m.ff && Number(logic.getProgress()) >= 1 && Number(logic.getDuration()) > 3) {
      logic.setProgress(logic.getDuration() - 1)
      m.ff = true
    }
  }
  function plantText(m) {
    var r = m.run
    return (r ? r.id + ' x' + r.parallels + ' at ' + r.eut + ' EU/t x ' + r.duration + ' t' : 'no run') + '; out ' + summary(outFluids(m)) +
      '; water ' + tankInfo(m.P.in1).amount + ' mB, acid ' + tankInfo(m.P.in2).amount + ' mB, iodine ' + count(m.P.inBus, 'gtceu:iodine_dust') +
      ', circuit ' + !m.P.inBus.getCircuitInventory().getStackInSlot(0).isEmpty() + '; ' + state(m)
  }
  // one finished run of n parallels: n x the outputs, the water used up, the acid and the iodine still there
  function ranOnce(m, n) {
    var p = S.R.plant
    var out = outFluids(m)
    return m.run !== null && m.run.id === SULFUR_IODINE && m.run.parallels === n && m.run.eut === n * p.eut && m.run.duration === 400 &&
      out['gtceu:hydrogen'] === n * p.hydrogen && out['gtceu:oxygen'] === n * p.oxygen && Object.keys(out).length === 2 &&
      tankInfo(m.P.in1).amount === 0 && tankInfo(m.P.in2).amount === p.acid && tankInfo(m.P.in2).id === 'gtceu:sulfuric_acid' &&
      count(m.P.inBus, 'gtceu:iodine_dust') === p.iodine
  }
  function finishedRun(m) { return m.ff && (outFluids(m)['gtceu:hydrogen'] || 0) > 0 }
  function plantOne(m) {
    var p = S.R.plant
    if (m.phase === 'form') {
      if (!waitFormed(m)) return
      var missing = setup(m)
      var n = modules(m)
      check('plant_formed', missing.length === 0 && n === 1, 'on Io over magma, ' + where(m) + '; every part in the vault wall' +
        (missing.length ? ' (missing: ' + missing.join(', ') + ')' : '') + '; module a only: IOO.plant.modules = ' + n)
      chargePlant(m, p.water)
      go(m, 'run')
    } else if (m.phase === 'run') {
      watch(m)
      if (finishedRun(m)) {
        check('plant_run', ranOnce(m, 1), 'circuit 1, ' + p.water + ' mB water, ' + p.acid + ' mB sulfuric acid and ' + p.iodine +
          ' iodine dust kept: ' + plantText(m))
        m.before = outFluids(m)
        m.ctrl.setVoidingMode(world().VoidingMode.VOID_ITEMS_FLUIDS)
        setTank(m.P.in1, 'minecraft:water', p.water)
        wake(m)
        go(m, 'voiding')
      } else if (age(m) > RUN_TICKS) check('plant_run', false, 'the run did not finish: ' + plantText(m))
    } else if (m.phase === 'voiding') {
      if (status(m) === 'WORKING') check('plant_no_voiding', false, 'started while voiding: ' + plantText(m))
      if (age(m) >= VOID_TICKS) {
        var reasons = failureReasons(m.ctrl)
        var shown = reasons.some(function (x) { return NO_VOIDING.test(x) })
        var out = outFluids(m)
        var kept = tankInfo(m.P.in1).amount === p.water && tankInfo(m.P.in2).amount === p.acid &&
          count(m.P.inBus, 'gtceu:iodine_dust') === p.iodine && out['gtceu:hydrogen'] === m.before['gtceu:hydrogen'] &&
          out['gtceu:oxygen'] === m.before['gtceu:oxygen']
        check('plant_no_voiding', kept && shown, 'voiding items and fluids, ' + p.water + ' mB water again, ' + VOID_TICKS +
          ' ticks: inputs and outputs untouched=' + kept + ', refusal shown=' + shown + ' [' + reasons.join('; ') + ']; ' + plantText(m))
        m.ctrl.setWorkingEnabled(false)
        m.ctrl.setVoidingMode(world().VoidingMode.VOID_NONE)
        m.off = true
        m.done = true
      }
    }
  }
  function plantFour(m) {
    var p = S.R.plant
    var n = S.IOO.plant.maxModules
    if (m.phase === 'form') {
      if (!waitFormed(m)) return
      var missing = setup(m)
      m.modules = modules(m)
      if (missing.length || m.modules !== n) {
        check('plant_modules', false, where(m) + ': missing parts [' + missing.join(', ') + '], IOO.plant.modules = ' + m.modules + ' (want ' + n + ')')
      }
      chargePlant(m, n * p.water)
      go(m, 'run')
    } else if (m.phase === 'run') {
      watch(m)
      if (finishedRun(m)) {
        check('plant_modules', ranOnce(m, n), 'four modules (IOO.plant.modules = ' + m.modules + '), ' + n * p.water +
          ' mB water: one run of ' + n + ' parallels: ' + plantText(m))
        m.ctrl.setWorkingEnabled(false)
        m.off = true
        m.done = true
      } else if (age(m) > RUN_TICKS) check('plant_modules', false, 'the run did not finish: ' + plantText(m))
    }
  }
  function plantOffSite(m) {
    var p = S.R.plant
    if (m.phase === 'form') {
      if (!waitFormed(m)) return
      var missing = setup(m)
      if (missing.length) check('plant_off_site', false, where(m) + ' formed without ' + missing.join(', '))
      chargePlant(m, p.water)
      go(m, 'idle')
    } else if (m.phase === 'idle') {
      if (status(m) === 'WORKING') check('plant_off_site', false, 'started off Io: ' + plantText(m))
      if (age(m) >= IDLE_TICKS) {
        check('plant_off_site', m.ctrl.isFormed() && Object.keys(outFluids(m)).length === 0 && tankInfo(m.P.in1).amount === p.water &&
          tankInfo(m.P.in2).amount === p.acid && count(m.P.inBus, 'gtceu:iodine_dust') === p.iodine,
          'formed in the Overworld (' + where(m) + ') and powered, ' + IDLE_TICKS + ' ticks: nothing made (dimension condition); reasons [' +
          failureReasons(m.ctrl).join('; ') + ']; ' + plantText(m))
        m.ctrl.setWorkingEnabled(false)
        m.off = true
        m.done = true
      }
    }
  }

  // ---------------------------------------------------------------- the machines of the active mode
  function levelOf(dim) {
    try { return S.server.getLevel(dim) } catch (e) { return null }
  }
  function site(dim, y) {
    var level = levelOf(dim)
    return present(level) ? { dim: dim, level: level, y0: y.y0, y1: y.y1 } : null
  }
  function startTether() {
    var orbit = site(S.orbitDim, OFFWORLD_Y)
    if (!orbit) check('tether_formed', false, 'Io orbit ' + S.orbitDim + ' (G.stations.second) has no level on this server')
    var ow = site('minecraft:overworld', OVERWORLD_Y)
    var truss = S.IOO.blocks.truss
    // the controller sits in row 2: an orbit tether at Y 199..213 on a pad at Y 198, an Overworld one at Y 98..112
    var a = build(orbit, TETHER, { x: 18440, y: 201, z: ORIGIN_Z }, { name: 'tether 4 A', stage: 'tether_formed', roles: TETHER_4A,
      extra: slab(18438, 18442, 198, ORIGIN_Z, ORIGIN_Z + 4, truss) })
    a.step = tetherReels
    var b = build(orbit, TETHER, { x: 18456, y: 201, z: ORIGIN_Z }, { name: 'tether 2 A', stage: 'tether_formed_2a', roles: TETHER_2A,
      extra: slab(18454, 18458, 198, ORIGIN_Z, ORIGIN_Z + 4, truss) })
    b.step = tetherOneReel
    var c = build(ow, TETHER, { x: 18472, y: 100, z: ORIGIN_Z }, { name: 'tether Overworld', stage: 'tether_off_site', roles: TETHER_2A })
    c.step = tetherOffSite
    S.jobs = [a, b, c]
  }
  function startPlant() {
    var io = site(S.ioDim, OFFWORLD_Y)
    if (!io) check('plant_formed', false, 'Io ' + S.ioDim + ' (G.places.surface(\'io\')) has no level on this server')
    var ow = site('minecraft:overworld', OVERWORLD_Y)
    var oneModule = { b: true, c: true, d: true }
    // the controller sits in row 2: on Io magma at Y 199 (top Y 212), in the Overworld magma at Y 98 (top Y 111) under a roof at Y 112
    var one = build(io, PLANT, { x: 18440, y: 201, z: ORIGIN_Z }, { name: 'plant a', stage: 'plant_formed', roles: PLANT_ROLES, skip: oneModule })
    one.step = plantOne
    var four = build(io, PLANT, { x: 18460, y: 201, z: ORIGIN_Z }, { name: 'plant abcd', stage: 'plant_modules', roles: PLANT_ROLES })
    four.step = plantFour
    var off = build(ow, PLANT, { x: 18480, y: 100, z: ORIGIN_Z }, { name: 'plant Overworld', stage: 'plant_off_site', roles: PLANT_ROLES,
      skip: oneModule, extra: slab(18474, 18486, 112, ORIGIN_Z - 1, ORIGIN_Z + 5, S.IOO.blocks.vault) })
    off.step = plantOffSite
    S.jobs = [one, four, off]
  }

  function step() {
    if (!S || S.finished || S.jobs.length === 0) return
    S.tick = Number(S.server.getTickCount()) - S.tick0
    if (Date.now() - S.requestedAt > 150000 || S.tick > 2800) {
      throw new Error('overall deadline: ' + S.jobs.map(function (m) { return m.name + ' ' + m.phase }).join(', '))
    }
    S.jobs.forEach(power)
    var left = 0
    for (var i = 0; i < S.jobs.length; i++) {
      var m = S.jobs[i]
      if (m.done) continue
      m.step(m)
      if (!m.done) left++
    }
    if (left === 0) finish()
  }
  function finish() {
    if (!S || S.finished) return
    S.finished = true
    var problems = []
    S.jobs.forEach(function (m) {
      try {
        var ctrl = m.ctrl || at(m.site, m.origin)
        if (ctrl) ctrl.setWorkingEnabled(false)
      } catch (e) { problems.push('disable ' + m.name + ': ' + e) }
      m.off = true
      // empty what the parts hold so nothing drops when they are removed
      Object.keys(m.pos).forEach(function (role) {
        try {
          var part = at(m.site, m.pos[role])
          if (!part) return
          if (typeof part.getInventory === 'function') emptyBus(part)
          if (typeof part.getCircuitInventory === 'function' && Number(part.getCircuitInventory().getSlots()) > 0) {
            part.getCircuitInventory().setStackInSlot(0, world().ItemStack.EMPTY)
          }
          if (part.tank) setTank(part, '', 0)
          if (part.energyContainer) part.energyContainer.setEnergyStored(0)
        } catch (e) { problems.push('empty ' + m.name + ' ' + role + ': ' + e) }
      })
    })
    S.order.slice().reverse().forEach(function (o) {
      try {
        cmd(o.site, 'setblock ' + o.p.x + ' ' + o.p.y + ' ' + o.p.z + ' minecraft:air replace')
        if (block(o.site, o.p) !== 'minecraft:air') problems.push('block remains ' + key(o.site, o.p))
      } catch (e) { problems.push('block ' + key(o.site, o.p) + ': ' + e) }
    })
    S.sites.forEach(function (st) {
      try {
        cmd(st, 'kill @e[type=minecraft:item,x=' + BAND.x0 + ',y=' + st.y0 + ',z=' + BAND.z0 + ',dx=' + (BAND.x1 - BAND.x0) +
          ',dy=' + (st.y1 - st.y0) + ',dz=' + (BAND.z1 - BAND.z0) + ']')
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
    console.info('GGTEST|luv_io_orbit|DONE')
  }
  function start(server) {
    var G = global.grindless
    S = { server: server, G: G, requestedAt: REQUESTED_AT || Date.now(),
      tick0: Number(server.getTickCount()), tick: 0, mode: 'unknown',
      owned: {}, order: [], chunks: {}, tickets: [], sites: [], jobs: [], finished: false }
    var ready = G && G.stations && G.ioOrbit && G.ioOrbit.recipes && G.ioOrbit.tether && G.ioOrbit.plant && G.hidden && G.places &&
      G.structures && G.generators
    if (ready) {
      S.mode = String(G.stations.b7)
      emit('mode', 'INFO', 'G.stations.b7=' + S.mode + ' (tables/stations.json: enabled=' + G.stations.enabled + ', second=' +
        G.stations.second + '); G.ioOrbit.mode=' + G.ioOrbit.mode)
    }
    check('shared_registrations', ready && String(G.ioOrbit.mode) === S.mode && (S.mode === 'pending' || S.mode === 'tether' ||
      S.mode === 'sulfur_iodine'), 'A1/B7 shared registrations required (stations, ioOrbit with recipes, hidden, places, structures, ' +
      'generators); G.ioOrbit.mode is G.stations.b7, one of pending, tether, sulfur_iodine; no fixture substitutions')
    S.IOO = G.ioOrbit
    S.R = G.ioOrbit.recipes
    staticChecks()
    if (S.mode === 'pending') {
      ;['recipe_site'].concat(STAGES.tether, STAGES.sulfur_iodine).forEach(function (name) { emit(name, 'SKIPPED', PENDING) })
      finish()
      return
    }
    var other = S.mode === 'tether' ? 'sulfur_iodine' : 'tether'
    emit('other_design', 'INFO', STAGES[other].join(', ') + ': not this mode\'s design (mode ' + S.mode + ')')
    if (S.mode === 'tether') {
      S.orbitDim = String(G.stations.second)
      check('site', S.orbitDim === String(S.IOO.tether.site), 'Io orbit ' + S.orbitDim + ' (G.stations.second) is G.ioOrbit.tether.site')
      recipeSite()
      startTether()
    } else {
      S.ioDim = String(G.places.surface('io'))
      check('site', S.ioDim === String(S.IOO.plant.site), 'Io ' + S.ioDim + ' (G.places.surface(\'io\')) is G.ioOrbit.plant.site')
      recipeSite()
      startPlant()
    }
  }
  ServerEvents.customCommand('gg_test_luv_io_orbit', function () {
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
      emit('exception', 'FAIL', (S ? S.mode : 'setup') + ': ' + e)
      if (S) finish()
      else {
        global[REQUEST] = false
        console.info('GGTEST|luv_io_orbit|DONE')
      }
    }
  })
})()
