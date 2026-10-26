// TEST ONLY, LuV B5 (the asteroid belt). Command: kubejs custom_command gg_test_luv_belt
// Prepared for LuV's single integrated run; never launches a JVM. Marker: GGTEST|luv_belt|DONE (wait at most 180 s).
// Covers only what B5 adds: startup_scripts/grindless/luv/asteroid_belt.js, server_scripts/grindless/luv/asteroid_belt.js and
// spike S0-6 (GTM's KubeJS world gen layer 'asteroid_belt' over minecraft:tuff, limited to the belt).
//
// Reserved band X 16896..16959, Z 0..63 (AGENTS.md):
//   the belt (grindless:asteroid_belt, from tables/places.json)  Y 198..214: the harpoon anchor drill (controller 16904,201,2) and the
//                                                                optical miner (controller 16936,201,2); the asteroid processor too
//                                                                (16920,201,2) when the Overworld cells are not all air
//   the Overworld                                                Y 98..112: the asteroid processor (controller 16920,101,2)
//   fresh world gen chunks, read only                            the belt X 16896..16959, Z 1024..1151 (32 chunks); the Overworld
//                                                                X 16896..16959, Z 1024..1087 (16 chunks)
// Every block it places is recorded and removed in reverse; it refuses to overwrite a block it did not place; it force-loads only
// the structure chunks it builds in (and only when they were not force-loaded already) and removes those tickets.
//
// THE BELT IS B1's REAL DIMENSION (pack/kubejs/data/grindless/dimension/asteroid_belt.json: tuff, terrain below Y 176). The
// test-only stand-in this fixture used before B1 (solid tuff Y 0..191 under the same id) was dropped for LuV's integrated run (C3),
// because an overlay file with that path overrides the shipped belt. The structures need air at Y 198..214.
//
// It sets the time of day (the belt reads the Overworld's clock) for the optical miner and puts it back when it ends (the original
// time plus the ticks it ran, when the daylight cycle is on). Do not run it alongside another fixture that needs a time of day:
// schedule it serially in the integrated run. It never changes the weather (space/airless_weather.js keeps the belt dry).
// Budget: 2,900 ticks and 150 s from the command, setup included (about 60 s of game time when the server keeps 20 TPS).
//
// Markers: GGTEST|luv_belt|<check>|PASS|FAIL|NOTE|<detail>, then GGTEST|luv_belt|all|PASS|FAIL and GGTEST|luv_belt|DONE.
//   static
//     types_registered            gtceu:asteroid_processing and gtceu:optical_mining exist; gtceu:vein_drilling takes 3 item inputs
//     made_recipes_live           every id the server script lists in global.grindless.asteroidBelt.made is a live recipe
//     harpoon_<vein>              each vein_drilling/luv/harpoon_<vein>_hss_s: live, found by GTM's own lookup with its own inputs,
//                                 the belt only (not reversed), the drill's rule accepts it and every lower drill's tier rule skips it
//     processor_<recipe>          the three asteroid_processing recipes: live, found by lookup, no dimension condition (anywhere)
//     miner_<recipe>              the two optical_mining recipes: live, found by lookup, the belt only
//     lower_candidate             a lower drilling recipe (not luv/, no fluid, no condition) that GTM's lookup finds
//     worldgen_layer              GTM's layer 'asteroid_belt' exists, applies to the belt and not to the Overworld
//     worldgen_veins              the three belt veins are in GTM's registry, on that layer, the belt only; the server script
//                                 published global.grindless.asteroidBelt.worldgen
//   in the world
//     <machine>_formed            the three structures, placed cell by cell from global.grindless.structures, form natively
//     drill_refuses_lower_recipe  the lower recipe's own inputs in the harpoon drill: no progress, no output (the drill's veto)
//     drill_harpoon_run_on_belt   the M-type sample + HSS-S bit + anchor harpoon: a run on the belt, tuff and the vein's raw ores
//                                 only, the sample kept
//     processor_mond              circuit 1: 16 crushed meteoric iron -> 24 iron, 4 nickel, 1 cobalt, 1 PGM concentrate; the 1,000 mB
//                                 CO charge still in its hatch
//     processor_mond_no_voiding   the cached Mond restart with item voiding on: no run (lib/no_voiding.js), the reason shown
//     processor_split_voids_allowed  circuit 2 with item voiding still on: 12 tetrataenite dust + 4 meteoric iron dust
//     miner_refuses_at_night      circuit 1 (a capture bag) at night: no run, sunState night, the no-sun reason shown
//     miner_refuses_covered_mirror  by day with a stone over one far mirror: no run, sunState shaded with 1 covered
//     miner_starts_in_full_sun    the stone away: the run starts with sunState sun
//     miner_run_completes_at_night  night falls during that run: it ends with 4,000 mB water, 1,000 mB CO2, 2 carbon, 1 extract
//     miner_sun_read_at_run_start   the next run does not start at night (the modifier and lib/fresh_run.js)
//     miner_boudouard_without_sun   circuit 2 at night: 1,000 mB CO2 + 1 carbon -> 2,000 mB CO
//     miner_no_voiding            fluid voiding on: Boudouard does not start, the reason shown
//   spike S0-6 (fresh chunks)
//     belt_dimension              the belt level exists (B1's real dimension)
//     belt_terrain_tuff           the scanned belt chunks hold tuff
//     belt_veins_generated        at least one tuff ore of a belt vein in the fresh belt chunks, confirmed block by block
//     belt_only_belt_ores         no other ore in them
//     overworld_tuff_sampled      the scanned fresh Overworld chunks hold tuff (so the next check is not empty)
//     overworld_no_belt_ores      no meteoric iron or tetrataenite ore in them
//     cleanup                     every placed block removed in reverse and every ticket it added removed
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var NAME = 'luv_belt'
  var S = null
  var J = null
  var LOADED = Date.now()
  var REQUEST = 'ggTestLuvBeltRequest'
  var REQUESTED = 0
  var X0 = 16896
  var X1 = 16959
  var EARTH = 'minecraft:overworld'
  var DAY = 6000
  var NIGHT = 18000
  var HOLD = 60
  var LIGHT_WAIT = 80
  var GEN_CX0 = X0 >> 4
  var GEN_CX1 = X1 >> 4
  var BELT_CZ = [1024 >> 4, 1151 >> 4]
  var EARTH_CZ = [1024 >> 4, 1087 >> 4]
  var CONFIRM_LIMIT = 6

  var CRUSHED_METEORIC = 'gtceu:crushed_meteoric_iron_ore'
  var CRUSHED_TETRATAENITE = 'gtceu:crushed_tetrataenite_ore'
  var CONCENTRATE = 'grindless:asteroid_pgm_concentrate'
  var BAG = 'grindless:capture_bag'
  var EXTRACT = 'grindless:chondritic_extract'
  var CARBON = 'gtceu:carbon_dust'
  var CO = 'gtceu:carbon_monoxide'
  var CO2 = 'gtceu:carbon_dioxide'
  var WATER = 'minecraft:water'
  var TUFF = 'minecraft:tuff'
  var COVER = 'minecraft:stone'
  var NO_VOIDING_PROCESSOR = /asteroid_processor\.no_voiding|keeps its PGM concentrate/
  var NO_VOIDING_MINER = /optical_miner\.no_voiding|keeps its water/
  var NO_SUN = /optical_miner\.no_sun|needs the sun/

  var PARTS = {
    energy: 'gtceu:luv_energy_input_hatch', inBus: 'gtceu:luv_input_bus', outBus: 'gtceu:luv_output_bus',
    inHatch: 'gtceu:luv_input_hatch', out1: 'gtceu:luv_output_hatch', out2: 'gtceu:luv_output_hatch'
  }
  var ROLES = {
    drill: ['energy', 'inBus', 'outBus'],
    processor: ['energy', 'inBus', 'outBus', 'inHatch'],
    miner: ['energy', 'inBus', 'outBus', 'inHatch', 'out1', 'out2']
  }

  function lazy() {
    if (J === null) J = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      AL: Java.loadClass('java.util.ArrayList'),
      HM: Java.loadClass('java.util.HashMap'),
      ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registry: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      WGU: Java.loadClass('com.gregtechceu.gtceu.api.data.worldgen.WorldGeneratorUtils'),
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
  function clean(detail) {
    return String(detail === undefined || detail === null ? '' : detail).replace(/[\r\n|]+/g, ' ').substring(0, 1800)
  }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
    return ok
  }
  function note(name, detail) {
    console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail))
  }
  function command(dim, text) { return Number(S.server.runCommandSilent('execute in ' + dim + ' run ' + text)) }
  function key(p) { return p.x + ',' + p.y + ',' + p.z }
  function blockAt(level, p) { return String(level.getBlock(p.x, p.y, p.z).id) }
  function at(w, p) { return lazy().Meta.getMachine(w.level, new (lazy().Pos)(p.x, p.y, p.z)) }
  function itemId(stack) { return String(lazy().Forge.ITEMS.getKey(stack.getItem())) }
  function blockId(state) { return String(lazy().Forge.BLOCKS.getKey(state.getBlock())) }

  // ---------------------------------------------------------------- placement (owned cells only)

  function inside(w, p) {
    if (p.x < X0 || p.x > X1 || p.z < 0 || p.z > 63 || p.y < w.low || p.y > w.high) {
      throw new Error('out of the reserved B5 band: ' + w.dim + ' ' + key(p))
    }
  }
  function put(w, p, id) {
    inside(w, p)
    var ticket = w.dim + ':' + (p.x >> 4) + ',' + (p.z >> 4)
    if (!S.chunks[ticket]) {
      S.chunks[ticket] = true
      w.level.getChunk(p.x >> 4, p.z >> 4)
      if (command(w.dim, 'forceload query ' + p.x + ' ' + p.z) < 1) {
        S.tickets.push({ w: w, p: p })
        command(w.dim, 'forceload add ' + p.x + ' ' + p.z)
      }
    }
    var k = w.dim + ':' + key(p)
    if (!S.owned[k]) {
      if (blockAt(w.level, p) !== 'minecraft:air') throw new Error('refusing to overwrite unowned block at ' + k)
      S.owned[k] = true
      S.blocks.push({ w: w, p: p })
    }
    command(w.dim, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + ' replace')
    var expected = id.split('[')[0]
    if (blockAt(w.level, p) !== expected) throw new Error('placement failed: ' + id + ' at ' + k)
  }
  function plain(sym) {
    if (sym.kind === 'oneOf') return plain(sym.options[0])
    if (sym.kind === 'blocks') return String(sym.blocks[0])
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    throw new Error('unsupported structure symbol ' + sym.kind)
  }
  // every cell of a structure in the world, the controller at m.p facing north (slices back -> front = +Z -> -Z, rows bottom -> top,
  // columns +X -> -X): the mapping of gg_test_luv_orbital_biology and of asteroid_belt.js's cellPos for a north-facing controller
  function cells(m) {
    var d = S.G.structures[m.id]
    if (!d) throw new Error('no structure description for ' + m.id)
    var anchor = null
    d.slices.forEach(function (rows, z) {
      rows.forEach(function (row, y) {
        var x = row.indexOf('S')
        if (x >= 0) anchor = { x: x, y: y, z: z }
      })
    })
    var out = []
    d.slices.forEach(function (rows, z) {
      rows.forEach(function (row, y) {
        for (var x = 0; x < row.length; x++) {
          var ch = row.charAt(x)
          out.push({ ch: ch, sym: d.symbols[ch], p: { x: m.p.x - x + anchor.x, y: m.p.y + y - anchor.y, z: m.p.z - z + anchor.z } })
        }
      })
    })
    return out
  }
  function footprintFree(m) {
    var busy = null
    cells(m).forEach(function (c) {
      if (busy === null && c.sym && blockAt(m.w.level, c.p) !== 'minecraft:air') busy = key(c.p) + '=' + blockAt(m.w.level, c.p)
    })
    return busy
  }
  function place(m) {
    var roles = ROLES[m.kind]
    var next = 0
    m.positions = {}
    m.mirrors = []
    cells(m).forEach(function (c) {
      inside(m.w, c.p)
      if (!c.sym || c.sym.kind === 'controller' || c.sym.kind === 'any') return
      if (c.sym.kind === 'air') {
        if (blockAt(m.w.level, c.p) !== 'minecraft:air') throw new Error('occupied hollow cell ' + key(c.p))
        return
      }
      var id = null
      if (c.ch === 'X' && next < roles.length) {
        m.positions[roles[next]] = c.p
        id = PARTS[roles[next++]] + '[facing=north]'
      } else id = plain(c.sym)
      if (c.ch === 'M') m.mirrors.push(c.p)
      put(m.w, c.p, id)
    })
    if (next !== roles.length) throw new Error('not enough part cells for ' + m.id)
    put(m.w, m.p, m.id + '[facing=north]')
    m.phase = 'forming'
    m.at = S.tick
  }

  // ---------------------------------------------------------------- recipes

  function byId(id) {
    var result = S.server.getRecipeManager().byKey(new (lazy().RL)(id))
    return result.isPresent() ? result.get() : null
  }
  function typeOf(id) { return lazy().Registry.RECIPE_TYPES.get(new (lazy().RL)(id)) }
  // GTM's own lookup with the recipe's own inputs (one recipe per ingredient path)
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
  function dimensionsOf(r) {
    var out = { dims: [], reversed: false, conditions: 0 }
    array(r.conditions).forEach(function (c) {
      out.conditions++
      if (String(c.getClass().getSimpleName()) !== 'DimensionCondition') return
      out.dims.push(String(c.getDimension().location()))
      if (c.isReverse()) out.reversed = true
    })
    return out
  }
  function beltOnly(r) {
    var d = dimensionsOf(r)
    return d.dims.length === 1 && d.dims[0] === S.belt && !d.reversed
  }

  function staticChecks() {
    var B = S.G.asteroidBelt
    var drilling = typeOf('gtceu:vein_drilling')
    var processing = typeOf(B.processor.type)
    var mining = typeOf(B.miner.type)
    check('types_registered', drilling !== null && processing !== null && mining !== null &&
      Number(drilling.getMaxInputs(lazy().ItemCap)) >= 3,
      'vein_drilling max item inputs ' + (drilling ? drilling.getMaxInputs(lazy().ItemCap) : 'none') + '; ' + B.processor.type + ' ' +
      (processing !== null) + '; ' + B.miner.type + ' ' + (mining !== null))
    var made = Array.isArray(B.made) ? B.made : []
    var absent = made.filter(function (id) { return byId(id) === null })
    check('made_recipes_live', made.length >= 20 && absent.length === 0, made.length + ' listed; absent=' + absent.join(','))

    S.harpoon = {}
    S.G.tables.veins_belt.veins.forEach(function (vein) {
      var id = 'grindless:vein_drilling/luv/harpoon_' + vein.id + '_hss_s'
      var r = byId(id)
      if (r === null) { check('harpoon_' + vein.id, false, id + ' absent'); return }
      S.harpoon[vein.id] = r
      var lower = ['lv', 'mv', 'hv', 'ev', 'iv'].every(function (tier) { return S.G.lv.rules.isAboveTier(r, tier) })
      var d = dimensionsOf(r)
      check('harpoon_' + vein.id, lookup(drilling, r) && beltOnly(r) && B.drill.isHarpoonRecipe(r) === true &&
        String(S.G.lv.rules.recipeTier(r)) === 'luv' && lower,
        id + '; lookup=' + lookup(drilling, r) + '; dims=' + d.dims.join(',') + ' reversed=' + d.reversed + '; lower tiers skip=' + lower)
    })
    ;['mond_crushed', 'magnetic_split', 'mond_dust'].forEach(function (name) {
      var id = 'grindless:asteroid_processing/' + name
      var r = byId(id)
      var d = r === null ? null : dimensionsOf(r)
      check('processor_' + name, r !== null && lookup(processing, r) && d.dims.length === 0,
        id + (r === null ? ' absent' : '; dims=' + d.dims.join(',') + '; concentrate run=' + B.processor.makesConcentrate(r)))
    })
    ;['c_type_boulder', 'boudouard'].forEach(function (name) {
      var id = 'grindless:optical_mining/' + name
      var r = byId(id)
      var d = r === null ? null : dimensionsOf(r)
      check('miner_' + name, r !== null && lookup(mining, r) && beltOnly(r) && B.miner.needsSun(r) === (name === 'c_type_boulder'),
        id + (r === null ? ' absent' : '; dims=' + d.dims.join(',') + ' reversed=' + d.reversed))
    })

    // a lower drill's recipe the harpoon drill must refuse: not luv/, no fluid, no condition (so only the veto can stop it)
    S.lower = null
    var all = array(S.server.getRecipeManager().getAllRecipesFor(drilling)).filter(function (r) {
      var path = String(r.id.getPath())
      return path.indexOf('/luv/') < 0 && array(r.conditions).length === 0 &&
        array(lazy().Helper.getInputFluids(r)).length === 0 && array(lazy().Helper.getInputItems(r)).length > 0
    })
    all.sort(function (a, b) { return String(a.id) < String(b.id) ? -1 : String(a.id) > String(b.id) ? 1 : 0 })
    for (var i = 0; i < all.length && S.lower === null; i++) {
      if (lookup(drilling, all[i]) && B.drill.isHarpoonRecipe(all[i]) !== true) S.lower = all[i]
    }
    check('lower_candidate', S.lower !== null, S.lower === null ? 'no plain lower drilling recipe found' :
      String(S.lower.id) + ' (' + all.length + ' candidates) inputs=' + array(lazy().Helper.getInputItems(S.lower)).map(function (st) {
        return st.getCount() + 'x ' + itemId(st)
      }).join(','))

    var layer = lazy().WGU.WORLD_GEN_LAYERS.get(String(B.layer))
    check('worldgen_layer', layer !== null && layer.isApplicableForLevel(new (lazy().RL)(S.belt)) === true &&
      layer.isApplicableForLevel(new (lazy().RL)(EARTH)) !== true,
      layer === null ? 'no layer ' + B.layer : String(layer))
    var bad = []
    S.G.tables.veins_belt.veins.forEach(function (vein) {
      var def = lazy().Registry.ORE_VEINS.get(new (lazy().RL)(vein.gtm))
      if (def === null) { bad.push(vein.gtm + ' absent'); return }
      var dims = array(def.dimensionFilter()).map(function (k) { return String(k.location()) })
      if (dims.length !== 1 || dims[0] !== S.belt) bad.push(vein.gtm + ' dims=' + dims.join(','))
      if (String(def.layer().getSerializedName()) !== String(B.layer)) bad.push(vein.gtm + ' layer=' + def.layer().getSerializedName())
    })
    var wg = B.worldgen || null
    if (wg === null || String(wg.dimension) !== S.belt || wg.added.length !== S.G.tables.veins_belt.veins.length) {
      bad.push('published worldgen=' + JSON.stringify(wg))
    }
    check('worldgen_veins', bad.length === 0, bad.length === 0 ? S.G.tables.veins_belt.veins.map(function (v) { return v.gtm }).join(',') +
      ' on ' + S.belt + ', layer ' + B.layer : bad.join('; '))
  }

  // ---------------------------------------------------------------- machine helpers

  function clear(bus) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, lazy().ItemStack.EMPTY)
  }
  function add(bus, list) {
    var inv = bus.getInventory()
    var slot = 0
    list.forEach(function (entry) {
      while (slot < inv.getSlots() && !inv.getStackInSlot(slot).isEmpty()) slot++
      if (slot >= inv.getSlots()) throw new Error('bus full')
      inv.setStackInSlot(slot, Item.of(entry[0], entry[1]))
    })
  }
  function items(bus) {
    var result = {}
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = itemId(st)
      result[id] = (result[id] || 0) + Number(st.getCount())
    }
    return result
  }
  function tank(h) {
    var st = h.tank.getFluidInTank(0)
    return st.isEmpty() ? { id: '', mb: 0 } : { id: String(lazy().Forge.FLUIDS.getKey(st.getFluid())), mb: Number(st.getAmount()) }
  }
  function setTank(h, id, mb) {
    // a FluidStack built by KubeJS: setFluidInTank ignores one built outside it
    h.tank.setFluidInTank(0, mb <= 0 ? lazy().FluidStack.EMPTY : Fluid.of(id, mb).getFluidStack())
  }
  function fluids(m, roles) {
    var out = {}
    roles.forEach(function (role) {
      var t = tank(m[role])
      if (t.mb > 0) out[t.id] = (out[t.id] || 0) + t.mb
    })
    return out
  }
  function circuit(m, n) { m.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(n)) }
  function logic(m) { return m.ctrl.getRecipeLogic() }
  // a fresh search: only while idle (it also drops the cached last recipe)
  function kick(m) {
    logic(m).resetRecipeLogic()
    logic(m).updateTickSubscription()
  }
  function voiding(m, mode) { m.ctrl.setVoidingMode(lazy().Voiding[mode]) }
  function reasons(m) {
    try {
      return array(logic(m).getFailureReasons()).map(function (c) { return String(c.getString()) })
    } catch (e) {
      return ['unreadable: ' + e]
    }
  }
  function shown(m, re) { return reasons(m).some(function (r) { return re.test(r) }) }
  function state(m) {
    try {
      var rl = logic(m)
      var last = rl.getLastRecipe()
      return 'status=' + rl.getStatus() + ' progress=' + rl.getProgress() + '/' + rl.getDuration() + ' last=' + (last ? last.id : 'none') +
        ' voiding=' + m.ctrl.getVoidingMode() + ' reasons=[' + reasons(m).join(' ; ') + ']'
    } catch (e) {
      return 'state unreadable: ' + e
    }
  }
  function mark(m, phase) {
    m.phase = phase
    m.at = S.tick
    m.seen = false
    m.lastId = ''
  }
  function age(m) { return S.tick - m.at }
  function watch(m) {
    var rl = logic(m)
    if (Number(rl.getProgress()) > 0) {
      m.seen = true
      var last = rl.getLastRecipe()
      if (last) m.lastId = String(last.id)
    }
  }
  // the run seen in progress, else the cached last recipe (an overclocked run can start and end between two samples)
  function ran(m) {
    if (m.lastId !== '') return m.lastId
    try {
      var last = logic(m).getLastRecipe()
      return last ? String(last.id) : ''
    } catch (e) {
      return ''
    }
  }
  function same(got, want) {
    var a = Object.keys(got).sort()
    var b = Object.keys(want).sort()
    return JSON.stringify(a) === JSON.stringify(b) && a.every(function (k) { return got[k] === want[k] })
  }

  // ---------------------------------------------------------------- the clock (one for every dimension)

  function setClock(time, why) {
    if (S.clock === null) {
      S.clock = { original: Number(S.earth.getDayTime()) % 24000, startTick: Number(S.server.getTickCount()),
        cycle: Number(S.server.runCommandSilent('gamerule doDaylightCycle')) }
    }
    S.server.runCommandSilent('time set ' + time)
    note('clock', 'time set ' + time + ' (' + why + ')')
  }
  function restoreClock() {
    if (S.clock === null) return
    var c = S.clock
    S.clock = null
    var elapsed = c.cycle === 1 ? Number(S.server.getTickCount()) - c.startTick : 0
    var back = (c.original + elapsed) % 24000
    S.server.runCommandSilent('time set ' + back)
    note('clock', 'restored to ' + back + ' (' + c.original + ' when the test first changed it, daylight cycle ' + (c.cycle === 1) + ')')
  }

  // ---------------------------------------------------------------- the harpoon anchor drill (the belt)

  function drillStep(m) {
    if (m.phase === 'ready') {
      clear(m.inBus)
      clear(m.outBus)
      if (S.lower === null) { m.phase = 'harpoon_feed'; return }
      add(m.inBus, array(lazy().Helper.getInputItems(S.lower)).map(function (st) { return [itemId(st), Number(st.getCount())] }))
      kick(m)
      mark(m, 'veto')
      return
    }
    if (m.phase === 'veto') {
      watch(m)
      if (age(m) < HOLD) return
      check('drill_refuses_lower_recipe', !m.seen && Object.keys(items(m.outBus)).length === 0,
        String(S.lower.id) + ' with its own inputs [' + JSON.stringify(items(m.inBus)) + ']: ' + state(m))
      m.phase = 'harpoon_feed'
      return
    }
    if (m.phase === 'harpoon_feed') {
      var D = S.G.asteroidBelt.drill
      clear(m.inBus)
      clear(m.outBus)
      add(m.inBus, [['grindless:vein_sample_m_type_belt', 1], [D.bit.item, 1], [D.harpoon.item, 1]])
      kick(m)
      mark(m, 'harpoon')
      return
    }
    if (m.phase === 'harpoon') {
      watch(m)
      var got = items(m.outBus)
      if (!got[TUFF]) {
        if (age(m) > 300) { check('drill_harpoon_run_on_belt', false, 'no output in 300 ticks: ' + state(m)); m.phase = 'done' }
        return
      }
      var kept = items(m.inBus)
      clear(m.inBus)
      var allowed = {}
      allowed[TUFF] = true
      var vein = null
      try {
        vein = S.G.asteroidBelt.veins().filter(function (v) { return v.id === 'm_type_belt' })[0]
        vein.ores.forEach(function (o) { allowed[String(o.item)] = true })
      } catch (e) {
        array(lazy().Helper.getOutputItems(S.harpoon.m_type_belt)).forEach(function (st) { allowed[itemId(st)] = true })
      }
      var stray = Object.keys(got).filter(function (id) { return !allowed[id] })
      var id = 'grindless:vein_drilling/luv/harpoon_m_type_belt_hss_s'
      var which = ran(m)
      check('drill_harpoon_run_on_belt', which === id && stray.length === 0 &&
        Object.keys(got).length >= 2 && kept['grindless:vein_sample_m_type_belt'] === 1,
        'on ' + S.belt + ': ran ' + which + ', out ' + JSON.stringify(got) + ', in ' + JSON.stringify(kept) +
        (stray.length ? '; stray=' + stray.join(',') : '') + '; ' + state(m))
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- the asteroid processor (the Overworld, or the belt)

  function processorStep(m) {
    var R = S.G.asteroidBelt.recipes
    if (m.phase === 'ready') {
      clear(m.inBus)
      clear(m.outBus)
      circuit(m, 1)
      add(m.inBus, [[CRUSHED_METEORIC, R.mond.count]])
      setTank(m.inHatch, CO, R.mond.charge)
      voiding(m, 'VOID_NONE')
      kick(m)
      mark(m, 'mond')
      return
    }
    if (m.phase === 'mond') {
      watch(m)
      var got = items(m.outBus)
      if (!got[CONCENTRATE]) {
        if (age(m) > 800) { check('processor_mond', false, 'no concentrate in 800 ticks: ' + state(m)); m.phase = 'done' }
        return
      }
      var want = {}
      R.mond.outputs.forEach(function (o) { want[o[0]] = o[1] })
      var charge = tank(m.inHatch)
      var mond = ran(m)
      check('processor_mond', same(got, want) && charge.id === CO && charge.mb === R.mond.charge && !items(m.inBus)[CRUSHED_METEORIC] &&
        mond === 'grindless:asteroid_processing/mond_crushed',
        'in ' + m.w.dim + ': out ' + JSON.stringify(got) + ', CO charge ' + charge.mb + ' mB ' + charge.id + ', ran ' + mond)
      m.made = got[CONCENTRATE]
      // GTM keeps the Mond run as the cached last recipe: the refill below restarts it without the modifier (beforeWorking refuses)
      add(m.inBus, [[CRUSHED_METEORIC, R.mond.count]])
      voiding(m, 'VOID_ITEMS')
      mark(m, 'mond_void')
      return
    }
    if (m.phase === 'mond_void') {
      watch(m)
      if (age(m) < HOLD) return
      check('processor_mond_no_voiding', !m.seen && items(m.inBus)[CRUSHED_METEORIC] === R.mond.count &&
        items(m.outBus)[CONCENTRATE] === m.made && shown(m, NO_VOIDING_PROCESSOR),
        'item voiding on, 16 crushed meteoric iron back in: ' + state(m))
      clear(m.inBus)
      clear(m.outBus)
      circuit(m, 2)
      add(m.inBus, [[CRUSHED_TETRATAENITE, R.split.count]])
      kick(m)
      mark(m, 'split')
      return
    }
    if (m.phase === 'split') {
      watch(m)
      var out = items(m.outBus)
      var first = R.split.outputs[0]
      if ((out[first[0]] || 0) < first[1]) {
        if (age(m) > 600) { check('processor_split_voids_allowed', false, 'no split in 600 ticks: ' + state(m)); m.phase = 'done' }
        return
      }
      var split = {}
      R.split.outputs.forEach(function (o) { split[o[0]] = o[1] })
      check('processor_split_voids_allowed', same(out, split) && String(m.ctrl.getVoidingMode()) === 'VOID_ITEMS',
        'circuit 2 with item voiding on: out ' + JSON.stringify(out) + '; ' + state(m))
      voiding(m, 'VOID_NONE')
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- the optical miner (the belt)

  function sun(m) {
    var st = S.G.asteroidBelt.miner.sunState(m.ctrl)
    return { key: String(st.key), covered: Number(st.covered) }
  }
  function minerOut(m) {
    var out = items(m.outBus)
    var f = fluids(m, ['out1', 'out2'])
    Object.keys(f).forEach(function (id) { out['fluid:' + id] = f[id] })
    return out
  }
  function minerStep(m) {
    var R = S.G.asteroidBelt.recipes
    var st = null
    if (m.phase === 'ready') {
      setClock(NIGHT, 'the optical miner at night')
      clear(m.inBus)
      clear(m.outBus)
      circuit(m, 1)
      add(m.inBus, [[BAG, 1]])
      kick(m)
      mark(m, 'night')
      return
    }
    if (m.phase === 'night') {
      watch(m)
      if (age(m) < HOLD) return
      st = sun(m)
      check('miner_refuses_at_night', !m.seen && Object.keys(minerOut(m)).length === 0 && st.key === 'night' && shown(m, NO_SUN),
        'sun=' + st.key + '; ' + state(m))
      // the bag out while the sky changes, so nothing can start before the light engine has seen the cover
      clear(m.inBus)
      setClock(DAY, 'the optical miner by day, one mirror covered')
      var far = m.mirrors.reduce(function (a, b) { return b.x < a.x ? b : a }, m.mirrors[0])
      m.cover = { x: far.x, y: far.y + 2, z: far.z }
      put(m.w, m.cover, COVER)
      mark(m, 'cover_wait')
      return
    }
    if (m.phase === 'cover_wait') {
      st = sun(m)
      if (st.key !== 'shaded' && age(m) < LIGHT_WAIT) return
      add(m.inBus, [[BAG, 1]])
      kick(m)
      mark(m, 'shaded')
      return
    }
    if (m.phase === 'shaded') {
      watch(m)
      if (age(m) < HOLD) return
      st = sun(m)
      check('miner_refuses_covered_mirror', !m.seen && Object.keys(minerOut(m)).length === 0 && st.key === 'shaded' && st.covered === 1,
        'stone over the mirror at ' + m.cover.x + ',' + (m.cover.y - 2) + ',' + m.cover.z + ': sun=' + st.key + ' covered=' + st.covered + '; ' +
        state(m))
      clear(m.inBus)
      put(m.w, m.cover, 'minecraft:air')
      mark(m, 'sun_wait')
      return
    }
    if (m.phase === 'sun_wait') {
      st = sun(m)
      if (st.key !== 'sun' && age(m) < LIGHT_WAIT) return
      add(m.inBus, [[BAG, 1]])
      kick(m)
      mark(m, 'sun')
      return
    }
    if (m.phase === 'sun') {
      watch(m)
      st = sun(m)
      if (!m.seen) {
        if (age(m) > 200) {
          check('miner_starts_in_full_sun', false, 'no run in 200 ticks: sun=' + st.key + ' covered=' + st.covered + '; ' + state(m))
          m.phase = 'boudouard_feed'
        }
        return
      }
      check('miner_starts_in_full_sun', st.key === 'sun' && m.lastId === 'grindless:optical_mining/c_type_boulder',
        'sun=' + st.key + ' covered=' + st.covered + '; ' + state(m))
      setClock(NIGHT, 'night falls during the run')
      m.phase = 'finish_at_night'
      return
    }
    if (m.phase === 'finish_at_night') {
      var out = minerOut(m)
      if (!out[EXTRACT]) {
        if (age(m) > 1000) { check('miner_run_completes_at_night', false, 'no extract: ' + state(m)); m.phase = 'boudouard_feed' }
        return
      }
      st = sun(m)
      var want = {}
      want[EXTRACT] = 1
      want[CARBON] = R.boulder.carbon
      want['fluid:' + WATER] = R.boulder.water
      want['fluid:' + CO2] = R.boulder.co2
      check('miner_run_completes_at_night', same(out, want) && st.key === 'night', 'sun=' + st.key + '; out ' + JSON.stringify(out))
      // the bag wears at 5 % a run: put one back if it went, so only the sun can stop the next run
      if (!items(m.inBus)[BAG]) add(m.inBus, [[BAG, 1]])
      mark(m, 'night_after')
      return
    }
    if (m.phase === 'night_after') {
      watch(m)
      if (age(m) < HOLD) return
      st = sun(m)
      check('miner_sun_read_at_run_start', !m.seen && minerOut(m)[EXTRACT] === 1 && items(m.inBus)[BAG] === 1 && st.key === 'night',
        'bag in, night: ' + state(m))
      m.phase = 'boudouard_feed'
      return
    }
    if (m.phase === 'boudouard_feed') {
      clear(m.inBus)
      clear(m.outBus)
      setTank(m.out1, '', 0)
      setTank(m.out2, '', 0)
      circuit(m, 2)
      add(m.inBus, [[CARBON, R.boudouard.carbon]])
      setTank(m.inHatch, CO2, R.boudouard.co2)
      kick(m)
      mark(m, 'boudouard')
      return
    }
    if (m.phase === 'boudouard') {
      watch(m)
      var made = fluids(m, ['out1', 'out2'])
      if ((made[CO] || 0) < R.boudouard.co) {
        if (age(m) > 400) { check('miner_boudouard_without_sun', false, 'no CO in 400 ticks: ' + state(m)); m.phase = 'done' }
        return
      }
      st = sun(m)
      check('miner_boudouard_without_sun', made[CO] === R.boudouard.co && Object.keys(made).length === 1 && tank(m.inHatch).mb === 0 &&
        !items(m.inBus)[CARBON] && st.key !== 'sun',
        'sun=' + st.key + '; out ' + JSON.stringify(made) + '; in ' + JSON.stringify(items(m.inBus)) + ' + ' + tank(m.inHatch).mb + ' mB CO2')
      add(m.inBus, [[CARBON, R.boudouard.carbon]])
      setTank(m.inHatch, CO2, R.boudouard.co2)
      voiding(m, 'VOID_FLUIDS')
      mark(m, 'void')
      return
    }
    if (m.phase === 'void') {
      watch(m)
      if (age(m) < HOLD) return
      var held = fluids(m, ['out1', 'out2'])
      check('miner_no_voiding', !m.seen && held[CO] === R.boudouard.co && tank(m.inHatch).mb === R.boudouard.co2 &&
        items(m.inBus)[CARBON] === R.boudouard.carbon && shown(m, NO_VOIDING_MINER),
        'fluid voiding on: ' + state(m))
      voiding(m, 'VOID_NONE')
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- the copies

  function advance(m) {
    if (m.phase === 'done') return
    if (m.phase === 'forming') {
      m.ctrl = at(m.w, m.p)
      if (!m.ctrl || !m.ctrl.isFormed()) {
        if (age(m) > 300) {
          check(m.kind + '_formed', false, m.id + ' did not form in 300 ticks at ' + m.w.dim + ' ' + key(m.p))
          m.phase = 'done'
        }
        return
      }
      Object.keys(m.positions).forEach(function (role) { m[role] = at(m.w, m.positions[role]) })
      check(m.kind + '_formed', true, m.id + ' at ' + m.w.dim + ' ' + key(m.p) + ' after ' + age(m) + ' ticks')
      m.phase = 'ready'
    }
    var container = m.energy.energyContainer
    container.setEnergyStored(container.getEnergyCapacity())
    if (m.kind === 'drill') drillStep(m)
    else if (m.kind === 'processor') processorStep(m)
    else minerStep(m)
  }

  // ---------------------------------------------------------------- spike S0-6: fresh chunks, read only

  function scanChunk(job) {
    var rec = S.scan[job.world]
    var chunk = job.level.getChunk(job.cx, job.cz)
    var sections = chunk.getSections()
    var bottom = Number(chunk.getMinBuildHeight())
    rec.chunks++
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i]
      if (section.hasOnlyAir()) continue
      var y0 = bottom + i * 16
      var ids = {}
      var everything = false
      try {
        everything = section.maybeHas(function (blockState) {
          ids[blockId(blockState)] = true
          return false
        }) === true
      } catch (e) {
        everything = true
        if (!rec.paletteError) rec.paletteError = String(e)
      }
      if (everything) {
        // a global palette (or no palette access): every second block of the section instead
        ids = {}
        rec.sampled++
        for (var x = 0; x < 16; x += 2) for (var y = 0; y < 16; y += 2) for (var z = 0; z < 16; z += 2) {
          ids[blockId(section.getBlockState(x, y, z))] = true
        }
      }
      Object.keys(ids).forEach(function (id) {
        if (id === TUFF) rec.tuff++
        if (!/_ore$/.test(id)) return
        rec.ores[id] = (rec.ores[id] || 0) + 1
        if (rec.where[id] || rec.confirmed >= CONFIRM_LIMIT) return
        rec.confirmed++
        rec.where[id] = confirm(job, section, y0, id)
      })
    }
  }
  // one real block of that ore in the section, read back through the level
  function confirm(job, section, y0, id) {
    for (var x = 0; x < 16; x++) for (var y = 0; y < 16; y++) for (var z = 0; z < 16; z++) {
      if (blockId(section.getBlockState(x, y, z)) !== id) continue
      var p = { x: job.cx * 16 + x, y: y0 + y, z: job.cz * 16 + z }
      return key(p) + (blockAt(job.level, p) === id ? '' : ' (level reads ' + blockAt(job.level, p) + ')')
    }
    return 'palette only (section at Y ' + y0 + ')'
  }
  function scanJobs() {
    var jobs = []
    var cx = 0
    var cz = 0
    if (S.beltLevel !== null) {
      for (cz = BELT_CZ[0]; cz <= BELT_CZ[1]; cz++) for (cx = GEN_CX0; cx <= GEN_CX1; cx++) {
        jobs.push({ world: 'belt', level: S.beltLevel, cx: cx, cz: cz })
      }
    }
    for (cz = EARTH_CZ[0]; cz <= EARTH_CZ[1]; cz++) for (cx = GEN_CX0; cx <= GEN_CX1; cx++) {
      jobs.push({ world: 'earth', level: S.earth, cx: cx, cz: cz })
    }
    return jobs
  }
  function scanResults() {
    var belt = S.scan.belt
    var earth = S.scan.earth
    var allowed = {}
    S.G.tables.veins_belt.veins.forEach(function (vein) {
      vein.materials.forEach(function (mat) { allowed['gtceu:tuff_' + mat.id + '_ore'] = vein.id })
    })
    var found = Object.keys(belt.ores).filter(function (id) { return allowed[id] })
    var foreign = Object.keys(belt.ores).filter(function (id) { return !allowed[id] })
    var real = found.filter(function (id) { return belt.where[id] && /^-?\d+,-?\d+,-?\d+$/.test(belt.where[id]) })
    var veins = {}
    found.forEach(function (id) { veins[allowed[id]] = true })
    var detail = function (rec) {
      return rec.chunks + ' chunks; ores (sections) ' + JSON.stringify(rec.ores) + '; at ' + JSON.stringify(rec.where) + '; tuff sections ' +
        rec.tuff + (rec.sampled ? '; sampled sections ' + rec.sampled : '') + (rec.paletteError ? '; palette error ' + rec.paletteError : '')
    }
    if (S.beltLevel !== null) {
      check('belt_terrain_tuff', belt.tuff > 0, detail(belt))
      check('belt_veins_generated', real.length > 0, 'belt ores ' + found.join(',') + ' of veins ' + Object.keys(veins).join(',') + '; ' +
        detail(belt))
      check('belt_only_belt_ores', foreign.length === 0, foreign.length ? 'foreign ' + foreign.join(',') : 'only belt veins')
      S.G.tables.veins_belt.veins.forEach(function (vein) {
        if (!veins[vein.id]) note('belt_vein_' + vein.id, 'not in this sample (the vein is picked by weight per grid cell)')
      })
    }
    var leaked = Object.keys(earth.ores).filter(function (id) { return /meteoric_iron|tetrataenite/.test(id) })
    check('overworld_tuff_sampled', earth.tuff > 0, detail(earth))
    check('overworld_no_belt_ores', leaked.length === 0, leaked.length ? 'belt ores in the Overworld: ' + leaked.join(',') :
      'no meteoric iron or tetrataenite ore; Overworld tuff ores seen: ' + Object.keys(earth.ores).filter(function (id) {
        return id.indexOf('gtceu:tuff_') === 0
      }).join(','))
  }

  // ---------------------------------------------------------------- run

  function finish() {
    if (!S || S.finished) return
    S.finished = true
    var errors = []
    try { restoreClock() } catch (e) { errors.push('clock: ' + e) }
    S.machines.forEach(function (m) {
      ;['inBus', 'outBus'].forEach(function (role) {
        try { if (m[role]) clear(m[role]) } catch (e) { errors.push(role + ': ' + e) }
      })
      ;['inHatch', 'out1', 'out2'].forEach(function (role) {
        try { if (m[role]) setTank(m[role], '', 0) } catch (e) { errors.push(role + ': ' + e) }
      })
    })
    S.blocks.slice().reverse().forEach(function (entry) {
      try { command(entry.w.dim, 'setblock ' + key(entry.p).replace(/,/g, ' ') + ' air replace') } catch (e) { errors.push(String(e)) }
    })
    S.tickets.forEach(function (entry) {
      try { command(entry.w.dim, 'forceload remove ' + entry.p.x + ' ' + entry.p.z) } catch (e) { errors.push(String(e)) }
    })
    console.info('GGTEST|' + NAME + '|cleanup|' + (errors.length ? 'FAIL' : 'PASS') + '|' + clean(S.blocks.length + ' blocks, ' +
      S.tickets.length + ' tickets' + (errors.length ? '; ' + errors.join(';') : '')))
    console.info('GGTEST|' + NAME + '|all|' + (S.failed === 0 && errors.length === 0 ? 'PASS' : 'FAIL') + '|failures=' + S.failed)
    console.info('GGTEST|' + NAME + '|DONE')
  }
  function world(dim, low, high) {
    var level = S.server.getLevel(dim)
    return level === null ? null : { dim: dim, level: level, low: low, high: high }
  }
  function run(server) {
    S = { server: server, G: global.grindless, started: REQUESTED, tick0: server.getTickCount(), tick: 0, failed: 0,
      chunks: {}, tickets: [], owned: {}, blocks: [], machines: [], finished: false, clock: null, jobs: [], scanned: false,
      scan: { belt: { chunks: 0, ores: {}, where: {}, confirmed: 0, tuff: 0, sampled: 0 },
        earth: { chunks: 0, ores: {}, where: {}, confirmed: 0, tuff: 0, sampled: 0 } } }
    var B = S.G.asteroidBelt
    S.belt = String(S.G.places.surface(B.place))
    S.earth = server.getLevel(EARTH)
    var belt = world(S.belt, 198, 214)
    var earth = world(EARTH, 98, 112)
    S.beltLevel = belt === null ? null : belt.level
    check('belt_dimension', belt !== null, S.belt + (belt === null ? ' is not loaded (B1\'s ' +
      'kubejs/data/grindless/dimension/asteroid_belt.json is missing?)' : ' loaded (B1\'s real belt)'))
    staticChecks()
    S.jobs = scanJobs()
    if (belt === null) return
    var processor = { kind: 'processor', id: B.processor.machine, w: earth, p: { x: 16920, y: 101, z: 2 } }
    var busy = footprintFree(processor)
    if (busy !== null) {
      note('processor_world', 'the Overworld cell ' + busy + ' is not air: the processor is built on the belt instead')
      processor.w = belt
      processor.p = { x: 16920, y: 201, z: 2 }
    }
    ;[
      { kind: 'drill', id: B.drill.machine, w: belt, p: { x: 16904, y: 201, z: 2 } },
      processor,
      { kind: 'miner', id: B.miner.machine, w: belt, p: { x: 16936, y: 201, z: 2 } }
    ].forEach(function (m) {
      S.machines.push(m)
      place(m)
    })
  }
  ServerEvents.tick(function (event) {
    if (global[REQUEST] === true && (!S || S.finished) && Date.now() - LOADED >= 10000) {
      global[REQUEST] = false
      try { run(event.server) } catch (e) {
        if (S === null) S = { server: event.server, failed: 0, machines: [], blocks: [], tickets: [], clock: null, finished: false }
        console.info('GGTEST|' + NAME + '|setup|FAIL|' + clean(e))
        S.failed++
        finish()
      }
    }
    if (!S || S.finished) return
    try {
      S.tick = event.server.getTickCount() - S.tick0
      if (S.tick > 2900 || Date.now() - S.started > 150000) throw new Error('B5 fixture deadline (2900 ticks / 150 s)')
      if (S.jobs.length > 0) scanChunk(S.jobs.shift())
      else if (!S.scanned) {
        S.scanned = true
        scanResults()
      }
      S.machines.forEach(advance)
      if (S.scanned && S.machines.every(function (m) { return m.phase === 'done' })) finish()
    } catch (e) {
      console.info('GGTEST|' + NAME + '|execution|FAIL|' + clean(e))
      S.failed++
      finish()
    }
  })
  ServerEvents.customCommand('gg_test_luv_belt', function () {
    if (S && !S.finished) return 0
    REQUESTED = Date.now()
    global[REQUEST] = true
    return 1
  })
})()
