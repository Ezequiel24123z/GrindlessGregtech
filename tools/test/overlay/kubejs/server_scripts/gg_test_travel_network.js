// Gregtech Grindless - smoke test of package IV-B5, travel-and-network (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): startup_scripts/grindless/iv/travel_network.js and server_scripts/grindless/iv/travel_network.js.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_travel_network;;kubejs custom_command gg_test_recipe_lookup;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|travel_network\|DONE@@900;;GGTEST\|lookup\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|travel_network|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|travel_network|DONE.
//   static (no world)
//     registry            the new items, GTM's machine gtceu:ev_rtg (tier EV, type gtceu:radioisotope_decay, 1 item in, nothing out),
//                         the published ids; NOTE: no gtceu:rtg (GTM's KubeJS builders prefix a single block's tier)
//     rocket_parts        GCYR's ZPM recipes of the elite tank and motor are gone; ours are IV assembler recipes (7,680 EU/t, 300 t) with
//                         tungsten steel, Kapton K, IV pumps and advanced thrusters, the inner planets chart not used up; nothing else
//                         in the assembler makes them
//     rocket_rule         GCYR's own numbers, read live: the elite parts are tier 3, an elite tank holds 12,000 mB, the trip inside the
//                         solar system costs solarSystemFuelAmount (14,000): one elite tank is not enough, two are; GCYR's average rule
//                         (RocketEntity#addBlock, integer division) gives 3 for 3 elite motors + 2 elite tanks and 2 with one advanced tank
//     planets             GCYR's planet data after our datapack: Venus and Mercury 3, Proxima b 4 (the rest of its file unchanged), Mars 2,
//                         the Moon 1: a tier 3 rocket reaches the Moon, Mars, Venus and Mercury, not Proxima b
//     thermal_template    GCYR's template recipe is gone; ours: IV assembler (7,680 EU/t), 3 heat shielding + 3 insulating fabrics + 2
//                         titanium plates + 2 Kapton K plates; GCYR's eight smithing upgrades that use the template are still there
//     oxygen_spreader     a crafting recipe makes gcyr:iv_oxygen_spreader, with no part that needs Mercury (IV sensor, emitter, electrolyzer)
//     chart_recipe        grindless:deep_space_tracking/inner_planets_chart: the Mars chart not used up + a data stick -> the inner planets
//                         chart, 7,680 EU/t x 600 t, only on the Moon and only at night (one dimension condition, a reversed daytime one),
//                         its EMI sky line; the copy recipe; the antenna's EV recipe is untouched
//     rtg_recipe          grindless:radioisotope_decay/rtg_pellet: the pellet at 100 of 10,000, 2,048 EU/t OUT for 720 t (not doubled: the
//                         type is not one power/generators.js saw), the only recipe of its type: one pellet per hour, 147,456,000 EU each
//     rtg_crafting        grindless:assembler/ev_rtg: the EV assembler makes the cell from EV parts (1,920 EU/t)
//     seed_recipes        the Venusian and Hermean seeds: chemical reactor, the planet's material first + ender pearl + 250 mB helium-3,
//                         480 EU/t x 200 t, one dimension condition (the planet); the two explosion rituals mark venus / mercury
//     pair_rules          moon/quantum_bridge.js's allowed(): each pair is kept on its own planet (and its orbit) and on Earth, and pushed
//                         out anywhere else; Earth pairs and the other planets' pairs are pushed out on Venus and Mercury
//   in the world (band X 12288-12351, Z 0-15: the Overworld at Y 98-112 with a roof at Y 112; Venus at the same X and Z, Y 198-214, or
//   above its ground if that is higher)
//     AREA_*              the band generated, force-loaded and cleared; venus_ground NOTE: the highest ground under the Venus band
//     rtg_placed          an RTG cell facing east into an EV battery buffer (4 empty EV batteries), and a second cell with no pellets
//     RTG_RUN             with 4 pellets: it works, every tick it makes 2,048 EU, and the buffer's batteries take them through the cell's
//                         front: (charge + what the cell still holds) = 2,048 x working ticks; GTM's SimpleGeneratorMachine, EV out, 1 A,
//                         one parallel; NOTE: the pellets used in that time
//     RTG_NO_PELLET       the empty cell never runs and holds no EU
//     venus_bridge        a 3x3 quantum bridge on Earth (with a dense energy cell) and on Venus (no energy): both formed
//     VENUS_PAIR_LINKS    an Earth-Venus pair (AE2's frequency and the mark venus, as the ritual with the Venusian seed makes it): the
//                         Venus chamber keeps its half through three of the bridge script's checks, and both halves are one powered network
// TEST AREA: this test force-loads, clears and builds ONLY its band in each dimension (AGENTS.md: tests run at the same time in one
// server), and clears and releases it at the end.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'travel_network'
  var STEP = 10
  var TEST_TIMEOUT = 2400
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestTravelNetworkRequest'

  var EARTH = 'minecraft:overworld'
  var VENUS = 'gcyr:venus'
  var BAND = { x0: 12288, x1: 12351, z0: 0, z1: 15 }
  var BAND_Y = {}
  BAND_Y[EARTH] = [98, 112]
  BAND_Y[VENUS] = [198, 214]
  var ROOF_Y = 112
  var EY = 100
  var VY = 200

  // layout: the quantum bridge (same X and Z on both planets) at X 12290..12292, Z 2..4, the chamber in the middle; Earth's dense energy
  // cell west of it; the RTG cells at Z 8 and 11, facing east
  var QX = 12290
  var QZ = 2
  var LINK = { x: 12291, z: 3 }
  var CELL = { x: 12289, z: 3 }
  var RTG_POS = { x: 12300, z: 8 }
  var BUFFER_POS = { x: 12301, z: 8 }
  var RTG_EMPTY_POS = { x: 12300, z: 11 }

  var RTG = 'gtceu:ev_rtg'
  var RTG_TYPE = 'gtceu:radioisotope_decay'
  var BUFFER = 'gtceu:ev_battery_buffer_4x'
  var BATTERY = 'gtceu:ev_vanadium_battery'
  var PELLET = 'grindless:rtg_pellet'
  var PELLETS = 4
  var RTG_WINDOW = 300
  var LINK_HOLD = 60
  var LINK_TIMEOUT = 600
  var ENTANGLED = 'ae2:quantum_entangled_singularity'
  var PAIR_KEY = 'grindless_planet'
  var DENSE_CELL_AE = 1600000

  var WANT = { eliteTier: 3, eliteTank: 12000, advancedTank: 7000, tripFuel: 14000, rtgEut: 2048, rtgDuration: 720, rtgChance: 100, maxChance: 10000,
    euPerPellet: 147456000, ivEut: 7680, chartDuration: 600, seedEut: 480, seedDuration: 200, helium3: 250 }

  var S = null
  var J = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3500)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = TAG + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  function guarded(name, fn) {
    try {
      fn()
    } catch (e) {
      check(name, false, 'exception: ' + e)
    }
  }

  // ---------------------------------------------------------------- Java

  function lazy() {
    if (J !== null) return J
    J = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      RecipeType: Java.loadClass('net.minecraft.world.item.crafting.RecipeType'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
      QBE: Java.loadClass('appeng.blockentity.qnb.QuantumBridgeBlockEntity'),
      Actionable: Java.loadClass('appeng.api.config.Actionable')
    }
    return J
  }

  function asArray(coll) {
    if (coll === null || coll === undefined) return []
    var list = new (lazy().ArrayList)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  // a Java array (Rhino indexes it and gives its length)
  function fromJavaArray(a) {
    var out = []
    if (a === null || a === undefined) return out
    for (var i = 0; i < a.length; i++) out.push(a[i])
    return out
  }

  function rl(id) {
    return new (lazy().RL)(id)
  }

  function bp(x, y, z) {
    return new (lazy().BlockPos)(x, y, z)
  }

  function at(p, y) {
    return p.x + ',' + y + ',' + p.z
  }

  function itemIdOf(stack) {
    return String(lazy().BI.ITEM.getKey(stack.getItem()))
  }

  function byId(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  function recipesOfType(typeId) {
    var type = lazy().GTRegistries.RECIPE_TYPES.get(rl(typeId))
    return type ? asArray(S.server.getRecipeManager().getAllRecipesFor(type)) : []
  }

  function craftingResults(id) {
    var L = lazy()
    return asArray(S.server.getRecipeManager().getAllRecipesFor(L.RecipeType.CRAFTING)).filter(function (r) {
      try {
        return itemIdOf(r.getResultItem(S.server.registryAccess())) === id
      } catch (e) {
        return false
      }
    })
  }

  function ingredientsText(r) {
    return asArray(r.getIngredients()).map(function (ing) {
      try {
        return String(ing.toJson())
      } catch (e) {
        return '?'
      }
    }).join(' ')
  }

  // the item contents of one side of a GT recipe: [{ id: item or #tag, count, chance, maxChance }]
  function gtItems(list) {
    return asArray(list).map(function (c) {
      var j = null
      try {
        j = JSON.parse(String(c.content.toJson()))
      } catch (e) {
        return { id: '?', count: 0, chance: Number(c.chance), maxChance: Number(c.maxChance) }
      }
      var ing = j.ingredient || j
      var id = ing.item ? String(ing.item) : (ing.tag ? '#' + String(ing.tag) : '?')
      return { id: id, count: Number(j.count || 1), chance: Number(c.chance), maxChance: Number(c.maxChance) }
    })
  }

  function gtFluids(list) {
    return asArray(list).map(function (c) {
      try {
        return String(c.content.toJson())
      } catch (e) {
        return '?'
      }
    }).join(' ')
  }

  function describe(list) {
    return list.map(function (x) { return x.count + 'x ' + x.id + (x.chance === 0 ? ' (not consumed)' : '') }).sort().join(', ')
  }

  function wantList(spec) {
    var out = spec.itemsIn.map(function (e) { return e.n + 'x ' + e.id })
    if (spec.catalyst) out.push('1x ' + spec.catalyst + ' (not consumed)')
    return out.sort().join(', ')
  }

  // [{ kind, dim, reverse }] of a GT recipe's conditions
  function conditionsOf(r) {
    return asArray(r.conditions).map(function (c) {
      var o = { kind: String(c.getClass().getSimpleName()), dim: null, reverse: false }
      try {
        o.reverse = !!c.isReverse()
      } catch (e) { /* no reverse */ }
      try {
        if (c.getDimension) o.dim = String(c.getDimension().location())
      } catch (e2) { /* not a dimension condition */ }
      return o
    })
  }

  function eutIn(r) {
    return Number(lazy().RecipeHelper.getRealEUt(r).getTotalEU())
  }

  // EU/t a generator recipe makes (0 when it uses EU or none)
  function eutOut(r) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(r)
    if (io.isEmpty() || io.isInput()) return 0
    return Number(io.getTotalEU())
  }

  function markOf(stack) {
    var tag = stack.getNbt()
    return tag !== null && tag.contains(PAIR_KEY) ? String(tag.getString(PAIR_KEY)) : ''
  }

  function TN() {
    var t = global.grindless && global.grindless.travelNetwork
    if (!t || !t.ids || !t.rtg || !t.parts || !t.recipes || !t.seeds) throw new Error('global.grindless.travelNetwork is incomplete')
    return t
  }

  // ---------------------------------------------------------------- static checks

  function checkRegistry() {
    var T = TN()
    var L = lazy()
    var want = [T.ids.venusSeed, T.ids.mercurySeed, T.ids.rtg, T.ids.rtgPellet, T.ids.chart, T.ids.marsChart, T.ids.eliteTank, T.ids.eliteMotor,
      T.ids.template, T.ids.spreader, T.ids.singularity, T.ids.entangled, BUFFER, BATTERY, 'ae2:quantum_link', 'ae2:quantum_ring', 'ae2:dense_energy_cell']
    var problems = want.filter(function (id) { return !Item.exists(id) }).map(function (id) { return 'missing ' + id })
    var def = L.GTRegistries.MACHINES.get(rl(RTG))
    var types = []
    var tier = -1
    if (!def) problems.push('no GTM machine ' + RTG)
    else {
      types = fromJavaArray(def.getRecipeTypes()).map(function (t) { return String(t.registryName) })
      tier = Number(def.getTier())
      if (types.join(',') !== RTG_TYPE) problems.push('recipe types ' + types.join(','))
      if (tier !== 4) problems.push('tier ' + tier)
    }
    var type = L.GTRegistries.RECIPE_TYPES.get(rl(RTG_TYPE))
    var io = ''
    if (!type) problems.push('no recipe type ' + RTG_TYPE)
    else {
      io = 'items in ' + type.getMaxInputs(L.ItemCap) + ' out ' + type.getMaxOutputs(L.ItemCap) + ', fluids in ' + type.getMaxInputs(L.FluidCap) +
        ' out ' + type.getMaxOutputs(L.FluidCap)
      if (Number(type.getMaxInputs(L.ItemCap)) !== 1 || Number(type.getMaxOutputs(L.ItemCap)) !== 0 || Number(type.getMaxInputs(L.FluidCap)) !== 0) {
        problems.push('io ' + io)
      }
    }
    if (!Fluid.exists(T.ids.helium3)) problems.push('missing fluid ' + T.ids.helium3)
    check('registry', problems.length === 0, (problems.length > 0 ? 'problems: ' + problems.join('; ') + ' | ' : '') + RTG + ': tier ' + tier + ', types ' +
      types.join(',') + ', ' + io + '; seeds, chart, elite parts, template and spreader present')
    note('rtg_id', 'gtceu:rtg registered: ' + !!L.GTRegistries.MACHINES.get(rl('gtceu:rtg')) + ' (GTM 7.5.3 KubeJS names a single block <tier>_<name>; the cell is ' + RTG + ')')
  }

  function checkRocketParts() {
    var T = TN()
    var problems = []
    var details = []
    ;['tank', 'motor'].forEach(function (key) {
      var spec = T.parts[key]
      if (byId(spec.gcyrId) !== null) problems.push(spec.gcyrId + ' (GCYR, ZPM) still loaded')
      var r = byId(spec.id)
      if (r === null) {
        problems.push('missing ' + spec.id)
        return
      }
      var ins = gtItems(r.getInputContents(lazy().ItemCap))
      var outs = gtItems(r.getOutputContents(lazy().ItemCap))
      var eut = eutIn(r)
      if (describe(ins) !== wantList(spec)) problems.push(spec.id + ' inputs ' + describe(ins) + ' (wanted ' + wantList(spec) + ')')
      if (describe(outs) !== '1x ' + spec.itemsOut[0].id) problems.push(spec.id + ' outputs ' + describe(outs))
      if (eut !== WANT.ivEut) problems.push(spec.id + ' runs at ' + eut + ' EU/t')
      if (Number(r.duration) !== spec.duration) problems.push(spec.id + ' lasts ' + r.duration + ' t')
      details.push(spec.id + ': ' + describe(ins) + ' -> ' + describe(outs) + ', ' + eut + ' EU/t, ' + r.duration + ' t')
    })
    // ours are assembler recipes, and nothing else in the assembler makes the elite parts
    var makers = {}
    recipesOfType('gtceu:assembler').forEach(function (r) {
      gtItems(r.getOutputContents(lazy().ItemCap)).forEach(function (o) {
        if (o.id === T.ids.eliteTank || o.id === T.ids.eliteMotor) makers[o.id] = (makers[o.id] || []).concat([String(r.getId())])
      })
    })
    ;['tank', 'motor'].forEach(function (key) {
      var spec = T.parts[key]
      var list = makers[spec.itemsOut[0].id] || []
      if (list.length !== 1 || list[0] !== spec.id) problems.push(spec.itemsOut[0].id + ' made by ' + (list.join(', ') || 'nothing'))
    })
    check('rocket_parts', problems.length === 0, details.join(' ; ') + (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
  }

  // GCYR's own rule (RocketEntity#addBlock): tier = (motor tiers / motors + tank tiers / tanks) / 2, integer division at every step
  function rocketTier(motors, tanks) {
    var m = Math.floor(motors.reduce(function (a, b) { return a + b }, 0) / motors.length)
    var t = Math.floor(tanks.reduce(function (a, b) { return a + b }, 0) / tanks.length)
    return Math.floor((m + t) / 2)
  }

  function checkRocketRule() {
    var T = TN()
    var Cfg = Java.loadClass('argent_matter.gcyr.config.GCYRConfig')
    var tank = Block.getBlock(T.ids.eliteTank)
    var motor = Block.getBlock(T.ids.eliteMotor)
    var adv = Block.getBlock('gcyr:advanced_fuel_tank')
    var tankTier = Number(tank.getTier())
    var tankFuel = Number(tank.getTankProperties().getFuelStorage())
    var motorTier = Number(motor.getTier())
    var thrusters = Number(motor.getMotorType().getMotorCount())
    var advFuel = Number(adv.getTankProperties().getFuelStorage())
    var advTier = Number(adv.getTier())
    var rocket = Cfg.INSTANCE.rocket
    var trip = Number(rocket.solarSystemFuelAmount)
    var galaxy = Number(rocket.galaxyFuelAmount)
    var problems = []
    if (tankTier !== WANT.eliteTier || motorTier !== WANT.eliteTier) problems.push('elite tiers tank ' + tankTier + ' motor ' + motorTier)
    if (tankFuel !== WANT.eliteTank) problems.push('elite tank holds ' + tankFuel)
    if (trip !== WANT.tripFuel) problems.push('solarSystemFuelAmount ' + trip)
    if (!(tankFuel < trip && 2 * tankFuel >= trip)) problems.push('one elite tank ' + tankFuel + ' vs trip ' + trip)
    var allElite = rocketTier([3, 3, 3], [3, 3])
    var oneAdvanced = rocketTier([3, 3, 3], [3, advTier])
    if (allElite !== 3 || oneAdvanced !== 2) problems.push('rule gives ' + allElite + ' / ' + oneAdvanced)
    check('rocket_rule', problems.length === 0, 'elite tank tier ' + tankTier + ' holds ' + tankFuel + ' mB, elite motor tier ' + motorTier + ' (' + thrusters +
      ' thrusters), advanced tank tier ' + advTier + ' holds ' + advFuel + ' mB; a trip in the solar system costs ' + trip + ' mB, so 1 elite tank=' +
      (tankFuel >= trip) + ', 2 elite tanks=' + (2 * tankFuel >= trip) + ' (' + (2 * tankFuel) + ' mB); GCYR rule: 3 elite motors + 2 elite tanks -> tier ' +
      allElite + ', with one advanced tank -> ' + oneAdvanced + '; another star system costs ' + galaxy + ' mB (' + Math.ceil(galaxy / tankFuel) +
      ' elite tanks)' + (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
  }

  function checkPlanets() {
    var PlanetData = Java.loadClass('argent_matter.gcyr.data.loader.PlanetData')
    var tiers = {}
    var all = []
    asArray(PlanetData.planets().entrySet()).forEach(function (e) {
      var id = String(e.getKey())
      tiers[id] = Number(e.getValue().rocketTier())
      all.push(id + '=' + tiers[id])
    })
    var reach = Object.keys(tiers).filter(function (id) { return tiers[id] <= 3 && id !== 'gcyr:earth' }).sort()
    var prb = PlanetData.getPlanet(rl('gcyr:proxima_centauri_b'))
    var problems = []
    if (tiers['gcyr:venus'] !== 3) problems.push('venus ' + tiers['gcyr:venus'])
    if (tiers['gcyr:mercury'] !== 3) problems.push('mercury ' + tiers['gcyr:mercury'])
    if (tiers['gcyr:mars'] !== 2) problems.push('mars ' + tiers['gcyr:mars'])
    if (tiers['gcyr:luna'] !== 1) problems.push('luna ' + tiers['gcyr:luna'])
    if (tiers['gcyr:proxima_centauri_b'] !== 4) problems.push('proxima ' + tiers['gcyr:proxima_centauri_b'])
    if (reach.join(',') !== 'gcyr:luna,gcyr:mars,gcyr:mercury,gcyr:venus') problems.push('a tier 3 rocket reaches ' + reach.join(','))
    // the rest of GCYR's Proxima b file is unchanged
    if (prb === null || Number(prb.temperature()) !== 303 || !prb.hasOxygen() || String(prb.solarSystem()) !== 'gcyr:proxima_centauri' ||
      Math.abs(Number(prb.gravity()) - 9.806) > 0.001) problems.push('proxima data changed')
    check('planets', problems.length === 0, 'a tier 3 rocket reaches ' + reach.join(', ') + ' | rocket tiers: ' + all.sort().join(' ') +
      (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
  }

  function checkTemplate() {
    var T = TN()
    var spec = T.parts.template
    var problems = []
    if (byId(spec.gcyrId) !== null) problems.push(spec.gcyrId + ' (GCYR) still loaded')
    var r = byId(spec.id)
    var detail = ''
    if (r === null) problems.push('missing ' + spec.id)
    else {
      var ins = gtItems(r.getInputContents(lazy().ItemCap))
      var outs = gtItems(r.getOutputContents(lazy().ItemCap))
      if (describe(ins) !== wantList(spec)) problems.push('inputs ' + describe(ins) + ' (wanted ' + wantList(spec) + ')')
      if (describe(outs) !== '1x ' + T.ids.template) problems.push('outputs ' + describe(outs))
      if (eutIn(r) !== WANT.ivEut) problems.push(eutIn(r) + ' EU/t')
      detail = spec.id + ': ' + describe(ins) + ' -> ' + describe(outs) + ', ' + eutIn(r) + ' EU/t, ' + r.duration + ' t'
    }
    var makers = []
    recipesOfType('gtceu:assembler').forEach(function (a) {
      gtItems(a.getOutputContents(lazy().ItemCap)).forEach(function (o) { if (o.id === T.ids.template) makers.push(String(a.getId())) })
    })
    if (makers.length !== 1) problems.push('assembler makers: ' + makers.join(', '))
    var smithing = 0
    ;['helmet', 'chestplate', 'leggings', 'boots'].forEach(function (piece) {
      ;['heat_shielding', 'insulating'].forEach(function (kind) {
        if (byId('gcyr:' + kind + '_' + piece + '_smithing') !== null) smithing++
      })
    })
    if (smithing !== 8) problems.push(smithing + ' of GCYR\'s 8 smithing upgrades')
    check('thermal_template', problems.length === 0, detail + '; GCYR smithing upgrades with the template: ' + smithing +
      (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
  }

  function checkSpreader() {
    var T = TN()
    var found = craftingResults(T.ids.spreader)
    if (found.length === 0) {
      check('oxygen_spreader', false, 'no crafting recipe gives ' + T.ids.spreader)
      return
    }
    var text = found.map(function (r) { return String(r.getId()) + ': ' + ingredientsText(r) }).join(' ; ')
    var mercury = ['gtceu:iv_sensor', 'gtceu:iv_emitter', 'gtceu:iv_electrolyzer'].filter(function (id) { return text.indexOf(id) >= 0 })
    var parts = ['gtceu:iv_machine_hull', 'gtceu:iv_electric_pump', 'gtceu:fluid_filter', 'gtceu:circuits/iv'].filter(function (id) { return text.indexOf(id) < 0 })
    check('oxygen_spreader', mercury.length === 0 && parts.length === 0, found.length + ' recipe(s): ' + text +
      (mercury.length > 0 ? ' needs Mercury parts: ' + mercury.join(', ') : '') + (parts.length > 0 ? ' lacks ' + parts.join(', ') : ''))
  }

  function checkChart() {
    var T = TN()
    var c = T.chartSpec
    var r = byId(c.id)
    var problems = []
    var detail = ''
    if (r === null) problems.push('missing ' + c.id)
    else {
      var ins = gtItems(r.getInputContents(lazy().ItemCap))
      var outs = gtItems(r.getOutputContents(lazy().ItemCap))
      var want = ['1x ' + c.calibration + ' (not consumed)', '1x ' + c.medium].sort().join(', ')
      if (describe(ins) !== want) problems.push('inputs ' + describe(ins))
      if (describe(outs) !== '1x ' + c.output) problems.push('outputs ' + describe(outs))
      if (eutIn(r) !== WANT.ivEut || Number(r.duration) !== WANT.chartDuration) problems.push(eutIn(r) + ' EU/t x ' + r.duration + ' t')
      var conds = conditionsOf(r)
      var dims = conds.filter(function (k) { return k.dim !== null })
      var day = conds.filter(function (k) { return k.kind === 'DaytimeCondition' })
      if (dims.length !== 1 || dims[0].dim !== 'gcyr:luna' || dims[0].reverse) problems.push('dimension conditions ' + JSON.stringify(dims))
      if (day.length !== 1 || !day[0].reverse) problems.push('daytime conditions ' + JSON.stringify(day))
      if (conds.length !== 2) problems.push('conditions ' + JSON.stringify(conds))
      var sky = r.data ? String(r.data.getString('grindless_sky')) : ''
      if (sky !== c.sky) problems.push('sky data ' + sky)
      detail = c.id + ': ' + describe(ins) + ' -> ' + describe(outs) + ', ' + eutIn(r) + ' EU/t x ' + r.duration + ' t, conditions ' +
        conds.map(function (k) { return k.kind + (k.dim ? ' ' + k.dim : '') + (k.reverse ? ' (reversed)' : '') }).join(', ') + ', sky ' + sky
    }
    var copy = byId(c.copy)
    if (copy === null) problems.push('missing ' + c.copy)
    else {
      var res = copy.getResultItem(S.server.registryAccess())
      var ing = ingredientsText(copy)
      if (itemIdOf(res) !== c.output || res.getCount() !== 2 || ing.indexOf(c.output) < 0 || ing.indexOf(c.medium) < 0) problems.push('copy ' + ing + ' -> ' + res.getCount() + 'x ' + itemIdOf(res))
    }
    var ev = byId('grindless:deep_space_tracking/mars_chart')
    if (ev === null || describe(gtItems(ev.getInputContents(lazy().ItemCap))).indexOf('grindless:lunar_landing_chart (not consumed)') < 0) problems.push('the antenna\'s EV recipe changed')
    var all = recipesOfType('gtceu:deep_space_tracking').map(function (x) { return String(x.getId()) }).sort()
    check('chart_recipe', problems.length === 0, detail + '; copy ' + c.copy + '; deep_space_tracking recipes: ' + all.join(', ') +
      (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
  }

  function checkRtgRecipe() {
    var T = TN()
    var R = T.rtg
    var r = byId(R.recipe)
    var problems = []
    var detail = ''
    if (r === null) problems.push('missing ' + R.recipe)
    else {
      var ins = gtItems(r.getInputContents(lazy().ItemCap))
      var fluids = gtFluids(r.getInputContents(lazy().FluidCap))
      var outs = gtItems(r.getOutputContents(lazy().ItemCap))
      if (ins.length !== 1 || ins[0].id !== PELLET || ins[0].count !== 1 || ins[0].chance !== WANT.rtgChance || ins[0].maxChance !== WANT.maxChance) {
        problems.push('inputs ' + JSON.stringify(ins))
      }
      if (fluids !== '' || outs.length !== 0) problems.push('fluids ' + fluids + ' outputs ' + describe(outs))
      var out = eutOut(r)
      if (out !== WANT.rtgEut) problems.push('EU/t out ' + out)
      if (Number(r.duration) !== WANT.rtgDuration) problems.push('duration ' + r.duration + ' (doubled?)')
      if (conditionsOf(r).length !== 0) problems.push('conditions ' + JSON.stringify(conditionsOf(r)))
      var perHour = (72000 / Number(r.duration)) * (ins.length > 0 ? ins[0].chance / ins[0].maxChance : 0)
      var euPerPellet = out * Number(r.duration) * (ins.length > 0 ? ins[0].maxChance / ins[0].chance : 0)
      if (Math.abs(perHour - 1) > 0.0001 || euPerPellet !== WANT.euPerPellet) problems.push(perHour + ' pellets an hour, ' + euPerPellet + ' EU each')
      detail = R.recipe + ': ' + describe(ins) + ' at ' + (ins.length > 0 ? ins[0].chance : '?') + ' of ' + (ins.length > 0 ? ins[0].maxChance : '?') + ' -> ' +
        out + ' EU/t out x ' + r.duration + ' t: ' + perHour + ' pellet an hour, ' + euPerPellet + ' EU per pellet'
    }
    var all = recipesOfType(RTG_TYPE).map(function (x) { return String(x.getId()) })
    if (all.length !== 1) problems.push('type recipes ' + all.join(', '))
    var power = global.grindless.power && global.grindless.power.generators
    var seen = power && power.perType ? Object.keys(power.perType) : null
    if (seen === null) problems.push('power/generators.js published no perType')
    else if (seen.indexOf(RTG_TYPE) >= 0) problems.push('power/generators.js doubles ' + RTG_TYPE)
    check('rtg_recipe', problems.length === 0, detail + '; recipes of ' + RTG_TYPE + ': ' + all.join(', ') + '; power/generators.js types: ' +
      (seen ? seen.join(', ') : '?') + (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
  }

  function checkRtgCrafting() {
    var T = TN()
    var r = byId(T.rtg.crafting)
    if (r === null) {
      check('rtg_crafting', false, 'missing ' + T.rtg.crafting)
      return
    }
    var ins = gtItems(r.getInputContents(lazy().ItemCap))
    var outs = gtItems(r.getOutputContents(lazy().ItemCap))
    var want = T.rtgCrafting.itemsIn.map(function (e) { return e.n + 'x ' + e.id }).sort().join(', ')
    var problems = []
    if (describe(ins) !== want) problems.push('inputs ' + describe(ins) + ' (wanted ' + want + ')')
    if (describe(outs) !== '1x ' + RTG) problems.push('outputs ' + describe(outs))
    if (eutIn(r) !== T.rtgCrafting.eut) problems.push(eutIn(r) + ' EU/t')
    check('rtg_crafting', problems.length === 0, T.rtg.crafting + ': ' + describe(ins) + ' -> ' + describe(outs) + ', ' + eutIn(r) + ' EU/t x ' + r.duration + ' t' +
      (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
  }

  function checkSeeds() {
    var T = TN()
    var planets = global.grindless.planets.table.planets
    var problems = []
    var details = []
    T.seeds.forEach(function (s) {
      var def = planets[s.planet]
      var seed = byId(s.recipe)
      if (seed === null) {
        problems.push('missing ' + s.recipe)
      } else {
        var ins = gtItems(seed.getInputContents(lazy().ItemCap))
        var fl = gtFluids(seed.getInputContents(lazy().FluidCap))
        var outs = gtItems(seed.getOutputContents(lazy().ItemCap))
        var conds = conditionsOf(seed)
        var ids = ins.map(function (x) { return x.id })
        if (ids.join(',') !== s.local + ',#forge:ender_pearls') problems.push(s.recipe + ' inputs ' + ids.join(','))
        if (fl.indexOf(T.ids.helium3) < 0 || fl.indexOf(String(WANT.helium3)) < 0) problems.push(s.recipe + ' fluids ' + fl)
        if (describe(outs) !== '1x ' + s.seed) problems.push(s.recipe + ' outputs ' + describe(outs))
        if (conds.length !== 1 || conds[0].dim !== def.dimensions[0] || conds[0].reverse) problems.push(s.recipe + ' conditions ' + JSON.stringify(conds))
        if (eutIn(seed) !== WANT.seedEut || Number(seed.duration) !== WANT.seedDuration) problems.push(s.recipe + ' ' + eutIn(seed) + ' EU/t x ' + seed.duration)
        details.push(s.recipe + ': ' + ids.join(' + ') + ' + ' + fl + ', ' + eutIn(seed) + ' EU/t x ' + seed.duration + ' t, only in ' + (conds.length > 0 ? conds[0].dim : '?'))
      }
      var pair = byId(s.pair)
      if (pair === null) {
        problems.push('missing ' + s.pair)
      } else {
        var res = pair.getResultItem(S.server.registryAccess())
        var ing = ingredientsText(pair)
        if (itemIdOf(res) !== ENTANGLED || res.getCount() !== 2 || markOf(res) !== def.pairTag) problems.push(s.pair + ' result ' + res.getCount() + 'x ' + itemIdOf(res) + ' ' + res.getNbt())
        if (ing.indexOf('ae2:singularity') < 0 || ing.indexOf(s.seed) < 0) problems.push(s.pair + ' ingredients ' + ing)
        details.push(s.pair + ': ' + ing + ' -> ' + res.getCount() + 'x ' + itemIdOf(res) + ' ' + res.getNbt())
      }
    })
    check('seed_recipes', problems.length === 0, details.join(' ; ') + (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
  }

  function checkPairRules() {
    var Q = global.grindless.moon && global.grindless.moon.quantum
    if (!Q) {
      check('pair_rules', false, 'global.grindless.moon.quantum is missing')
      return
    }
    function pair(mark) {
      var s = Item.of(ENTANGLED, 1)
      lazy().QBE.assignFrequency(s)
      if (mark !== '') s.getNbt().putString(PAIR_KEY, mark)
      return s
    }
    var p = { venus: pair('venus'), mercury: pair('mercury'), mars: pair('mars'), moon: pair('moon'), earth: pair('') }
    var cases = [
      ['venus pair on Venus', Q.allowed(p.venus, VENUS), true],
      ['venus pair in Venus orbit', Q.allowed(p.venus, 'gcyr:venus_orbit'), true],
      ['venus pair on Earth', Q.allowed(p.venus, EARTH), true],
      ['venus pair on Mercury', Q.allowed(p.venus, 'gcyr:mercury'), false],
      ['venus pair on Mars', Q.allowed(p.venus, 'gcyr:mars'), false],
      ['mercury pair on Mercury', Q.allowed(p.mercury, 'gcyr:mercury'), true],
      ['mercury pair in Mercury orbit', Q.allowed(p.mercury, 'gcyr:mercury_orbit'), true],
      ['mercury pair on Venus', Q.allowed(p.mercury, VENUS), false],
      ['mercury pair on the Moon', Q.allowed(p.mercury, 'gcyr:luna'), false],
      ['mars pair on Venus', Q.allowed(p.mars, VENUS), false],
      ['moon pair on Mercury', Q.allowed(p.moon, 'gcyr:mercury'), false],
      ['Earth pair on Venus', Q.allowed(p.earth, VENUS), false],
      ['Earth pair on Mercury', Q.allowed(p.earth, 'gcyr:mercury'), false]
    ]
    var wrong = cases.filter(function (c) { return !!c[1] !== c[2] })
    check('pair_rules', wrong.length === 0, cases.map(function (c) { return c[0] + '=' + (!!c[1]) }).join(', ') +
      (wrong.length > 0 ? ' WRONG: ' + wrong.map(function (c) { return c[0] }).join(', ') : ''))
  }

  function staticChecks() {
    guarded('registry', checkRegistry)
    guarded('rocket_parts', checkRocketParts)
    guarded('rocket_rule', checkRocketRule)
    guarded('planets', checkPlanets)
    guarded('thermal_template', checkTemplate)
    guarded('oxygen_spreader', checkSpreader)
    guarded('chart_recipe', checkChart)
    guarded('rtg_recipe', checkRtgRecipe)
    guarded('rtg_crafting', checkRtgCrafting)
    guarded('seed_recipes', checkSeeds)
    guarded('pair_rules', checkPairRules)
  }

  // ---------------------------------------------------------------- the world

  function levelOf(dim) {
    return dim === VENUS ? S.venus : S.earth
  }

  // a command run in a dimension's level (setblock, fill and forceload act on the dimension they run in)
  function cmd(dim, text) {
    return S.server.runCommandSilent('execute in ' + dim + ' run ' + text)
  }

  function isAir(id) {
    return id === 'minecraft:air' || id === 'minecraft:void_air' || id === 'minecraft:cave_air'
  }

  // the highest ground under the Venus band: a grid of columns, from Y 319 down. The bridge goes on the band (Y 200) unless the ground
  // reaches it; then it goes two blocks above the ground, and the cleared range moves with it.
  function venusGround() {
    var top = -1
    var columns = 0
    var withGround = 0
    var lava = 0
    for (var x = BAND.x0; x <= BAND.x1; x += 7) {
      for (var z = BAND.z0; z <= BAND.z1; z += 5) {
        columns++
        for (var y = 319; y >= -64; y--) {
          var id = String(S.venus.getBlock(x, y, z).getId())
          if (!isAir(id)) {
            withGround++
            if (id === 'minecraft:lava') lava++
            if (y > top) top = y
            break
          }
        }
      }
    }
    if (top >= BAND_Y[VENUS][0]) {
      VY = top + 2
      BAND_Y[VENUS] = [top + 1, top + 17]
    }
    note('venus_ground', withGround + ' of ' + columns + ' columns under the Venus band have ground (' + lava + ' of them lava), the highest at Y ' + top +
      '; the bridge is built at Y ' + VY + ', cleared Y ' + BAND_Y[VENUS][0] + '-' + BAND_Y[VENUS][1] + (top >= 198 ? ': ABOVE the band, the ground is higher' : ': the band, above the ground'))
  }

  function prepareWorld() {
    S.areaTouched = true
    ;[VENUS, EARTH].forEach(function (dim) {
      var level = levelOf(dim)
      for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
        for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) level.getChunk(cx, cz)
      }
      if (dim === VENUS) venusGround()
      var loaded = cmd(dim, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      var cleared = cmd(dim, 'fill ' + BAND.x0 + ' ' + BAND_Y[dim][0] + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND_Y[dim][1] + ' ' + BAND.z1 + ' air')
      if (dim === EARTH) cmd(dim, 'fill ' + BAND.x0 + ' ' + ROOF_Y + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + ROOF_Y + ' ' + BAND.z1 + ' minecraft:smooth_stone')
      note('AREA_' + (dim === VENUS ? 'venus' : 'earth'), dim + ' band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND_Y[dim][0] + '-' + BAND_Y[dim][1] + ' Z ' +
        BAND.z0 + '-' + BAND.z1 + ': generated, forceload add result ' + loaded + ', changed ' + cleared + ' blocks while clearing' +
        (dim === EARTH ? ', roof at Y ' + ROOF_Y : ''))
    })
  }

  function cleanup() {
    if (!S.areaTouched) return
    ;[VENUS, EARTH].forEach(function (dim) {
      var cleared = cmd(dim, 'fill ' + BAND.x0 + ' ' + BAND_Y[dim][0] + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND_Y[dim][1] + ' ' + BAND.z1 + ' air')
      var released = cmd(dim, 'forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      note('CLEANUP_' + (dim === VENUS ? 'venus' : 'earth'), 'cleared ' + cleared + ' blocks of the band in ' + dim + ', forceload remove result ' + released)
    })
  }

  function setblock(dim, p, y, block, failed) {
    if (cmd(dim, 'setblock ' + p.x + ' ' + y + ' ' + p.z + ' ' + block + ' replace') < 1) failed.push(dim + ' ' + at(p, y) + ' ' + block)
  }

  function machineAt(level, p, y) {
    var m = lazy().MetaMachine.getMachine(level, bp(p.x, y, p.z))
    return m === null || m === undefined ? null : m
  }

  function gridOf(be) {
    if (be === null || be === undefined) return null
    var node = be.getMainNode()
    return node === null || node === undefined ? null : node.getGrid()
  }

  function sameGrid(a, b) {
    return a !== null && a !== undefined && b !== null && b !== undefined && a.equals(b)
  }

  function powered(grid) {
    return grid !== null && grid !== undefined && !!grid.getEnergyService().isNetworkPowered()
  }

  function bridgeCells() {
    var out = []
    for (var dx = 0; dx < 3; dx++) {
      for (var dz = 0; dz < 3; dz++) {
        out.push({ x: QX + dx, z: QZ + dz, id: dx === 1 && dz === 1 ? 'ae2:quantum_link' : 'ae2:quantum_ring' })
      }
    }
    return out
  }

  function build() {
    var failed = []
    // the RTG cells and the buffer
    setblock(EARTH, RTG_POS, EY, RTG + '[facing=east]', failed)
    setblock(EARTH, BUFFER_POS, EY, BUFFER + '[facing=east]', failed)
    setblock(EARTH, RTG_EMPTY_POS, EY, RTG + '[facing=east]', failed)
    // the quantum bridges and Earth's energy cell
    bridgeCells().forEach(function (c) {
      setblock(EARTH, c, EY, c.id, failed)
      setblock(VENUS, c, VY, c.id, failed)
    })
    setblock(EARTH, CELL, EY, 'ae2:dense_energy_cell{internalCurrentPower:' + DENSE_CELL_AE + '.0d}', failed)
    S.cell = S.earth.getBlockEntity(bp(CELL.x, EY, CELL.z))
    if (S.cell !== null && Number(S.cell.getAECurrentPower()) < DENSE_CELL_AE * 0.99) {
      S.cell.injectAEPower(DENSE_CELL_AE - Number(S.cell.getAECurrentPower()), lazy().Actionable.MODULATE)
    }
    S.rtg = machineAt(S.earth, RTG_POS, EY)
    S.rtgEmpty = machineAt(S.earth, RTG_EMPTY_POS, EY)
    S.buffer = machineAt(S.earth, BUFFER_POS, EY)
    if (S.rtg === null) failed.push('no machine at ' + at(RTG_POS, EY))
    if (S.rtgEmpty === null) failed.push('no machine at ' + at(RTG_EMPTY_POS, EY))
    if (S.buffer === null) failed.push('no buffer at ' + at(BUFFER_POS, EY))
    var detail = ''
    if (S.buffer !== null) {
      var inv = S.buffer.getBatteryInventory()
      for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.of(BATTERY))
      detail += 'buffer ' + inv.getSlots() + ' x ' + BATTERY + ', capacity ' + Number(S.buffer.energyContainer.getEnergyCapacity()) + ' EU; '
    }
    if (S.rtg !== null) {
      var ec = S.rtg.energyContainer
      detail += RTG + ': ' + S.rtg.getClass().getSimpleName() + ', out ' + Number(ec.getOutputVoltage()) + ' V x ' + Number(ec.getOutputAmperage()) + ' A, holds ' +
        Number(ec.getEnergyCapacity()) + ' EU, front ' + S.rtg.getFrontFacing() + ', ' + S.rtg.importItems.getSlots() + ' input slot(s)'
    }
    check('rtg_placed', failed.length === 0 && S.rtg !== null && String(S.rtg.getClass().getSimpleName()) === 'SimpleGeneratorMachine' &&
      Number(S.rtg.energyContainer.getOutputVoltage()) === 2048, detail + (failed.length > 0 ? ' FAILED: ' + failed.join(', ') : ''))
    return failed.length === 0
  }

  // ---------------------------------------------------------------- the RTG

  function stored(m) {
    return m === null ? 0 : Number(m.energyContainer.getEnergyStored())
  }

  function pelletsIn(m) {
    var inv = m.importItems
    var n = 0
    for (var i = 0; i < inv.getSlots(); i++) {
      var s = inv.getStackInSlot(i)
      if (!s.isEmpty() && itemIdOf(s) === PELLET) n += s.getCount()
    }
    return n
  }

  function startRtg() {
    var left = S.rtg.importItems.insertItem(0, Item.of(PELLET, PELLETS), false)
    if (!left.isEmpty()) S.rtg.importItems.setStackInSlot(0, Item.of(PELLET, PELLETS))
    S.rtg.getRecipeLogic().updateTickSubscription()
    S.rtgEmpty.getRecipeLogic().updateTickSubscription()
    S.rtgRun = { ticks: 0, working: 0, statuses: {}, emptyStatuses: {}, start: stored(S.buffer) + stored(S.rtg), pelletsStart: pelletsIn(S.rtg), last: null, emptyMax: 0 }
  }

  function measureRtg() {
    var R = S.rtgRun
    R.ticks++
    var rlg = S.rtg.getRecipeLogic()
    var status = String(rlg.getStatus())
    R.statuses[status] = (R.statuses[status] || 0) + 1
    if (status === 'WORKING') R.working++
    var last = rlg.getLastRecipe()
    if (last !== null && last !== undefined) R.last = last
    var es = String(S.rtgEmpty.getRecipeLogic().getStatus())
    R.emptyStatuses[es] = (R.emptyStatuses[es] || 0) + 1
    var e = stored(S.rtgEmpty)
    if (e > R.emptyMax) R.emptyMax = e
  }

  function histogram(h) {
    return Object.keys(h || {}).sort().map(function (k) { return k + ' x' + h[k] }).join(', ')
  }

  function reportRtg() {
    var R = S.rtgRun
    var charge = stored(S.buffer)
    var inCell = stored(S.rtg)
    var made = charge + inCell - R.start
    var expected = WANT.rtgEut * R.working
    var last = R.last
    var lastText = 'none'
    var par = 0
    var out = 0
    if (last !== null) {
      par = Number(last.parallels)
      out = eutOut(last)
      lastText = String(last.id) + ' parallels ' + par + ', ' + out + ' EU/t out'
    }
    var ok = R.working > 0 && charge > 0 && Math.abs(made - expected) <= 2 * WANT.rtgEut && (last === null || (par === 1 && out === WANT.rtgEut))
    check('RTG_RUN', ok, 'over ' + R.ticks + ' ticks (' + R.working + ' working): the buffer\'s batteries took ' + charge + ' EU, the cell still holds ' + inCell +
      ' EU: ' + made + ' EU made, expected ' + WANT.rtgEut + ' x ' + R.working + ' = ' + expected + '; last recipe ' + lastText + '; statuses ' + histogram(R.statuses))
    note('rtg_pellets', (R.pelletsStart - pelletsIn(S.rtg)) + ' of ' + R.pelletsStart + ' pellets used in ' + R.ticks + ' ticks (expected about ' +
      (Math.round(R.ticks / 72000 * 10000) / 10000) + ': one per 72,000 ticks of running, GTM\'s OR chance with a random start)')
    check('RTG_NO_PELLET', R.emptyMax === 0 && !R.emptyStatuses.WORKING, 'the cell with no pellet: statuses ' + histogram(R.emptyStatuses) + ', most EU held ' + R.emptyMax)
  }

  // ---------------------------------------------------------------- the Venus pair

  function startLink() {
    S.earthQbe = S.earth.getBlockEntity(bp(LINK.x, EY, LINK.z))
    S.venusQbe = S.venus.getBlockEntity(bp(LINK.x, VY, LINK.z))
    var formed = S.earthQbe !== null && S.venusQbe !== null && S.earthQbe.isFormed() && S.venusQbe.isFormed()
    var gE = gridOf(S.earthQbe)
    var gV = gridOf(S.venusQbe)
    S.venusPoweredBefore = powered(gV)
    check('venus_bridge', formed && gE !== null && gV !== null && !sameGrid(gE, gV) && powered(gE),
      'Earth formed=' + (S.earthQbe !== null && S.earthQbe.isFormed()) + ' at Y ' + EY + ', Venus formed=' + (S.venusQbe !== null && S.venusQbe.isFormed()) +
      ' at Y ' + VY + ', separate networks=' + !sameGrid(gE, gV) + ', Earth powered=' + powered(gE) + ', Venus powered=' + S.venusPoweredBefore + ' (no energy there)')
    if (!formed) return false
    // an Earth-Venus pair, as AE2's ritual with a Venusian seed makes it: a frequency and the venus mark
    var pair = Item.of(ENTANGLED, 2)
    lazy().QBE.assignFrequency(pair)
    pair.getNbt().putString(PAIR_KEY, 'venus')
    var h1 = pair.copy()
    h1.setCount(1)
    var h2 = pair.copy()
    h2.setCount(1)
    S.earthQbe.getInternalInventory().setItemDirect(0, h1)
    S.venusQbe.getInternalInventory().setItemDirect(0, h2)
    global.grindless.moon.quantum.track(S.venus, bp(LINK.x, VY, LINK.z))
    S.linkStart = S.t
    S.linkedAt = -1
    return true
  }

  function linkState() {
    var gE = gridOf(S.earthQbe)
    var gV = gridOf(S.venusQbe)
    return { both: sameGrid(gE, gV), powered: powered(gE) && powered(gV), kept: !S.venusQbe.getInternalInventory().getStackInSlot(0).isEmpty() }
  }

  function reportLink(st) {
    var tracked = global.grindless.moon.quantum.tracked(S.server).filter(function (e) { return e.d === VENUS }).length
    check('VENUS_PAIR_LINKS', st.both && st.powered && st.kept, 'the Earth-Venus pair: the Venus chamber ' + (st.kept ? 'keeps' : 'PUSHED OUT') + ' its half after ' +
      (S.t - S.linkStart) + ' ticks (the bridge script checks every 20), one network=' + st.both + ', powered on both sides=' + st.powered + ' (Venus had no AE energy: ' +
      !S.venusPoweredBefore + '), Venus chambers tracked=' + tracked + (S.linkedAt >= 0 ? ', linked after ' + (S.linkedAt - S.linkStart) + ' ticks' : ''))
  }

  // ---------------------------------------------------------------- driver

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      cleanup()
    } catch (e) {
      check('cleanup', false, 'exception: ' + e)
    }
    console.info(TAG + SCOPE + '|DONE')
  }

  function step() {
    var since = S.t - S.phaseAt
    if (S.phase === 'built') {
      // the bridges form and Earth's network boots (AE2 calls a network powered after 30 ticks with power)
      if (since < 60) return
      var linking = false
      try {
        linking = startLink()
      } catch (e) {
        check('venus_bridge', false, 'exception: ' + e)
      }
      S.linkDone = !linking
      startRtg()
      S.phase = 'running'
      S.phaseAt = S.t
      return
    }
    if (S.phase === 'running') {
      if (!S.linkDone) {
        var st = linkState()
        if (st.both && S.linkedAt < 0) S.linkedAt = S.t
        if ((S.linkedAt >= 0 && S.t - S.linkedAt >= LINK_HOLD && S.t - S.linkStart >= LINK_HOLD) || S.t - S.linkStart >= LINK_TIMEOUT) {
          reportLink(st)
          S.linkDone = true
        }
      }
      if (!S.rtgDone && S.rtgRun.ticks >= RTG_WINDOW) {
        guarded('RTG_RUN', reportRtg)
        S.rtgDone = true
      }
      if (S.linkDone && S.rtgDone) S.phase = 'end'
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    S.t = S.server.getTickCount() - S.tick0
    if (S.phase === 'running' && !S.rtgDone) {
      try {
        measureRtg()
      } catch (e) {
        check('RTG_RUN', false, 'exception while measuring: ' + e)
        S.rtgDone = true
      }
    }
    if (S.t < S.nextAt) return
    S.nextAt = S.t + STEP
    try {
      if (S.phase !== 'end') step()
    } catch (e2) {
      check('step', false, 'exception in ' + S.phase + ': ' + e2)
      S.phase = 'end'
    }
    if (S.phase === 'end') {
      finish()
      return
    }
    if (S.t > TEST_TIMEOUT) {
      check('timeout', false, 'still in ' + S.phase + ' after ' + S.t + ' ticks')
      finish()
    }
  }

  function run(server) {
    S = { server: server, earth: server.overworld(), venus: server.getLevel(VENUS), tick0: server.getTickCount(), t: 0, nextAt: STEP, phase: 'start', phaseAt: 0,
      finished: false, areaTouched: false, linkDone: false, rtgDone: false, rtgRun: null }
    staticChecks()
    if (S.venus === null || S.venus === undefined) {
      check('venus_level', false, VENUS + ' is not loaded')
      finish()
      return
    }
    guarded('AREA', prepareWorld)
    var built = false
    try {
      built = build()
    } catch (e) {
      check('rtg_placed', false, 'exception: ' + e)
    }
    S.phase = built ? 'built' : 'end'
    S.phaseAt = 0
    if (!built) finish()
  }

  // The pack's Additional Placements mod reloads the datapacks (and these scripts) a couple of seconds after the server is up: the
  // command only leaves a request in `global` and the tick handler starts the test once these scripts have been loaded for QUIET_MS.
  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    global[REQUEST] = false
    try {
      run(server)
    } catch (e) {
      check('run', false, 'exception: ' + e)
      finish()
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_travel_network', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
