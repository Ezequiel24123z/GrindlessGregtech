// Gregtech Grindless - smoke test of the AE2 network's EV step (package ae2-interplanetary). TEST-ONLY overlay: copied over the
// instance on the test PC, never shipped with the pack.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_ae2_interplanetary;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|ae2_interplanetary\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// What is new and tested in the world: power crossing the Earth-Moon quantum bridge at EV rates, with both ends force-loaded.
//   FE lane   Earth: a GTM 16 A EV energy converter in EU -> FE mode pushes into an AE2 FE P2P input; Moon: the FE P2P output feeds a
//             second converter in FE -> EU mode, whose front feeds a third one (EU -> FE mode, used as a 16 A EV sink the test empties
//             every tick). The source is refilled every tick (an EV power plant).
//   EU lane   the same with eup2p's EU P2P tunnel and no converter in between: a converter in FE -> EU mode (refilled every tick) pushes
//             EU into the EU P2P input; the output on the Moon feeds a sink converter directly.
//   tax       the only AE energy of the merged network is two dense energy cells on Earth: an idle window measures the network's own
//             drain (the bridge's 18 blocks at 22 AE/t, the tunnels...), then the AE energy each lane costs over its window is compared
//             with AE2's p2pTunnelEnergyTax x GTM's euToFeRatio x AE2's FE -> AE ratio.
//   the remote half needs no power: the Moon half has no energy source; it must be unpowered before the pair goes in, then link and
//             run on Earth's cells (the question ev.md leaves open for the Martian half: "an AE2 energy cell charged at home starts
//             that side (verify)").
// Proven before and not repeated: items and fluids over the bridge, AE2's explosion ritual and the lunar chamber's check (v0.5.0,
// gg_test_moon.js). The pair is made by hand here (AE2's assignFrequency + the moon mark), as gg_test_moon.js does when the explosion
// misses.
//
// Static checks (no world): registry; the converter's crafting recipe (GTM's, EV hull + EV circuit); the Martian seed recipe (only on
// Mars) and the Earth-Mars ritual (mark "mars"); the lunar seed recipe the base runs (only the Moon's condition, an HV recipe);
// planets.json and moon/quantum_bridge.js's allowed() for Mars, Moon and Earth pairs; the AE2 and GTM energy settings.
//
// Band: X 8448..8511, Z 0..15; Earth Y 98..112 (built at Y 100), Moon (gcyr:luna) Y 198..214 (built at Y 200).
// Markers: GGTEST|ae2_interplanetary|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|ae2_interplanetary|DONE.
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'ae2_interplanetary'
  var STEP = 10
  var TEST_TIMEOUT = 3000
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestAe2InterplanetaryRequest'

  var EARTH = 'minecraft:overworld'
  var LUNA = 'gcyr:luna'
  var MARS = 'gcyr:mars'
  var BAND = { x0: 8448, x1: 8511, z0: 0, z1: 15 }
  var EY = 100
  var MY = 200

  // layout (same X and Z on both planets): a flat 3x3 quantum bridge at X 8450..8452, Z 2..4, its link chamber in the middle
  var QX = 8450
  var QZ = 2
  var LINK = { x: 8451, z: 3 }
  var CELLS = [{ x: 8449, z: 3 }, { x: 8448, z: 3 }]          // Earth only: two dense energy cells west of the bridge
  var BUS_FE = { x: 8453, z: 3 }                               // cable bus east of the bridge, FE P2P on its east face
  var BUS_EU = { x: 8453, z: 4 }                               // cable bus south of it, EU P2P on its east face
  var SRC_FE = { x: 8454, z: 3 }                               // Earth: converter EU -> FE, facing west into the FE P2P input
  var SRC_EU = { x: 8454, z: 4 }                               // Earth: converter FE -> EU, facing west into the EU P2P input
  var CONV_MOON = { x: 8454, z: 3 }                            // Moon: converter FE -> EU, facing east into SINK_FE
  var SINK_FE = { x: 8455, z: 3 }                              // Moon: converter EU -> FE facing up: the FE lane's sink
  var SINK_EU = { x: 8454, z: 4 }                              // Moon: converter EU -> FE facing up: the EU lane's sink

  var CONVERTER = 'gtceu:ev_16a_energy_converter'
  var FE_P2P = 'ae2:fe_p2p_tunnel'
  var EU_P2P = 'eup2p:eu_p2p_tunnel'
  var ENTANGLED = 'ae2:quantum_entangled_singularity'
  var PAIR_KEY = 'grindless_planet'
  var EV_RATE = 2048 * 16
  var DENSE_CELL_AE = 1600000

  // measuring windows, in order: [name, ticks, which source is refilled]
  var WINDOWS = [['idle', 100, null], ['fe', 200, 'fe'], ['fe_tail', 30, null], ['eu', 200, 'eu'], ['eu_tail', 10, null]]
  var STEADY = 150

  var S = null
  var J = null
  var AE = null

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

  function round(x, n) {
    var k = Math.pow(10, n === undefined ? 1 : n)
    return Math.round(Number(x) * k) / k
  }

  // ---------------------------------------------------------------- Java

  function lazy() {
    if (J !== null) return J
    J = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      Direction: Java.loadClass('net.minecraft.core.Direction'),
      CompoundTag: Java.loadClass('net.minecraft.nbt.CompoundTag'),
      RecipeType: Java.loadClass('net.minecraft.world.item.crafting.RecipeType'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
      GTConfig: Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder')
    }
    return J
  }

  function ae() {
    if (AE !== null) return AE
    AE = {
      QBE: Java.loadClass('appeng.blockentity.qnb.QuantumBridgeBlockEntity'),
      PartHelper: Java.loadClass('appeng.api.parts.PartHelper'),
      P2PService: Java.loadClass('appeng.me.service.P2PService'),
      SettingsFrom: Java.loadClass('appeng.util.SettingsFrom'),
      AEConfig: Java.loadClass('appeng.core.AEConfig'),
      PowerUnits: Java.loadClass('appeng.api.config.PowerUnits')
    }
    return AE
  }

  function asArray(coll) {
    if (coll === null || coll === undefined) return []
    var list = new (lazy().ArrayList)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
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

  function cmd(dim, text) {
    return S.server.runCommandSilent('execute in ' + dim + ' run ' + text)
  }

  function itemIdOf(stack) {
    return String(lazy().BI.ITEM.getKey(stack.getItem()))
  }

  function byId(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  // ---------------------------------------------------------------- recipes

  function contentJson(list) {
    return asArray(list).map(function (c) {
      try {
        return String(c.content.toJson())
      } catch (e) {
        return '?'
      }
    })
  }

  function gtText(r) {
    var L = lazy()
    return {
      inItems: contentJson(r.getInputContents(L.ItemCap)).join(' '),
      inFluids: contentJson(r.getInputContents(L.FluidCap)).join(' '),
      outItems: contentJson(r.getOutputContents(L.ItemCap)).join(' ')
    }
  }

  // [{ dim, reverse }] of a GT recipe's dimension conditions, and the class names of every condition
  function conditionsOf(r) {
    var dims = []
    var kinds = []
    asArray(r.conditions).forEach(function (c) {
      kinds.push(String(c.getClass().getSimpleName()))
      try {
        if (c.getDimension) dims.push({ dim: String(c.getDimension().location()), reverse: !!c.isReverse() })
      } catch (e) { /* not a dimension condition */ }
    })
    return { dims: dims, kinds: kinds }
  }

  function eutOf(r) {
    return Number(lazy().RecipeHelper.getRealEUt(r).getTotalEU())
  }

  function resultOf(r) {
    return r.getResultItem(S.server.registryAccess())
  }

  function markOf(stack) {
    var tag = stack.getNbt()
    return tag !== null && tag.contains(PAIR_KEY) ? String(tag.getString(PAIR_KEY)) : ''
  }

  // ---------------------------------------------------------------- static checks

  function ids() {
    var AI = global.grindless && global.grindless.ae2Interplanetary
    if (!AI || !AI.ids || !AI.recipes) throw new Error('global.grindless.ae2Interplanetary is incomplete')
    return AI
  }

  function checkRegistry() {
    var AI = ids()
    var want = [AI.ids.marsSeed, AI.ids.lunarSeed, AI.ids.singularity, AI.ids.entangled, AI.ids.merrilliteDust, CONVERTER, FE_P2P, EU_P2P,
      AI.ids.meP2P, 'ae2:quantum_link', 'ae2:quantum_ring', 'ae2:dense_energy_cell', 'ae2:fluix_glass_cable']
    var missing = want.filter(function (id) { return !Item.exists(id) })
    if (!Fluid.exists(AI.ids.helium3)) missing.push('fluid ' + AI.ids.helium3)
    var machine = lazy().GTRegistries.MACHINES.get(rl(CONVERTER))
    if (!machine) missing.push('machine ' + CONVERTER)
    check('registry', missing.length === 0, missing.length > 0 ? 'missing: ' + missing.join(', ') :
      'Martian quantum seed, ' + CONVERTER + ' (GTM machine), ' + FE_P2P + ', ' + EU_P2P + ', ' + AI.ids.meP2P + ', the quantum bridge blocks')
  }

  // GTM's own shaped recipe for the converter: found by its result, whatever its id
  function checkConverterRecipe() {
    var L = lazy()
    var found = asArray(S.server.getRecipeManager().getAllRecipesFor(L.RecipeType.CRAFTING)).filter(function (r) {
      try {
        return itemIdOf(resultOf(r)) === CONVERTER
      } catch (e) {
        return false
      }
    })
    if (found.length === 0) {
      check('converter_recipe', false, 'no crafting recipe gives ' + CONVERTER)
      return
    }
    var r = found[0]
    var parts = asArray(r.getIngredients()).map(function (ing) {
      try {
        return String(ing.toJson())
      } catch (e) {
        return '?'
      }
    }).join(' ')
    var hull = parts.indexOf('gtceu:ev_machine_hull') >= 0
    var circuit = parts.indexOf('gtceu:circuits/ev') >= 0
    check('converter_recipe', hull && circuit, found.length + ' recipe(s), ' + String(r.getId()) + ': EV hull=' + hull + ' EV circuit=' + circuit +
      ' ingredients=' + parts)
  }

  function checkMarsRecipes() {
    var AI = ids()
    var seed = byId(AI.recipes.marsSeed)
    var problems = []
    var detail = ''
    if (seed === null) {
      problems.push('missing ' + AI.recipes.marsSeed)
    } else {
      var t = gtText(seed)
      var c = conditionsOf(seed)
      if (t.inItems.indexOf(AI.ids.merrilliteDust) < 0) problems.push('no merrillite dust in ' + t.inItems)
      if (t.inItems.indexOf('forge:ender_pearls') < 0) problems.push('no ender pearl in ' + t.inItems)
      if (t.inFluids.indexOf(AI.ids.helium3) < 0 || t.inFluids.indexOf('250') < 0) problems.push('fluids ' + t.inFluids)
      if (t.outItems.indexOf(AI.ids.marsSeed) < 0) problems.push('outputs ' + t.outItems)
      if (c.dims.length !== 1 || c.dims[0].dim !== MARS || c.dims[0].reverse) problems.push('dimension conditions ' + JSON.stringify(c.dims))
      // the merrillite must come first: the lunar recipe (ender pearl + helium-3) is then not a prefix of this one
      if (t.inItems.indexOf(AI.ids.merrilliteDust) > t.inItems.indexOf('forge:ender_pearls')) problems.push('merrillite is not the first ingredient')
      detail += AI.recipes.marsSeed + ': ' + t.inItems + ' + ' + t.inFluids + ' -> ' + t.outItems + ', ' + eutOf(seed) + ' EU/t, ' + seed.duration +
        ' t, conditions ' + JSON.stringify(c.dims)
    }
    var pair = byId(AI.recipes.marsPair)
    if (pair === null) {
      problems.push('missing ' + AI.recipes.marsPair)
    } else {
      var res = resultOf(pair)
      var ins = asArray(pair.getIngredients()).map(function (ing) { return String(ing.toJson()) }).join(' ')
      if (itemIdOf(res) !== ENTANGLED || res.getCount() !== 2 || markOf(res) !== 'mars') problems.push('ritual result ' + res.getCount() + 'x ' + itemIdOf(res) + ' ' + res.getNbt())
      if (ins.indexOf('ae2:singularity') < 0 || ins.indexOf(AI.ids.marsSeed) < 0) problems.push('ritual ingredients ' + ins)
      detail += '; ' + AI.recipes.marsPair + ': ' + ins + ' -> ' + res.getCount() + 'x ' + itemIdOf(res) + ' ' + res.getNbt()
    }
    check('mars_pair_recipes', problems.length === 0, (problems.length > 0 ? 'problems: ' + problems.join('; ') + ' | ' : '') + detail)
  }

  // the base makes the lunar half with the HV recipe: nothing in it asks for a player, only the Moon, at HV power
  function checkLunarSeedByBase() {
    var AI = ids()
    var seed = byId(AI.recipes.lunarSeed)
    if (seed === null) {
      check('lunar_seed_by_base', false, 'missing ' + AI.recipes.lunarSeed)
      return
    }
    var c = conditionsOf(seed)
    var eut = eutOf(seed)
    var ok = c.kinds.length === 1 && c.dims.length === 1 && c.dims[0].dim === LUNA && !c.dims[0].reverse && eut <= 512
    var t = gtText(seed)
    check('lunar_seed_by_base', ok, AI.recipes.lunarSeed + ': ' + t.inItems + ' + ' + t.inFluids + ', ' + eut + ' EU/t, conditions ' + c.kinds.join(',') +
      ' ' + JSON.stringify(c.dims) + ' (any chemical reactor on the Moon fed by the network runs it)')
    var large = byId('grindless:large_chemical_reactor/lunar_quantum_seed')
    note('lunar_seed_large_reactor', large !== null ? 'GTM also copied it to the large chemical reactor (grindless:large_chemical_reactor/lunar_quantum_seed)' :
      'no large chemical reactor copy: the base uses a single chemical reactor')
  }

  function checkPlanets() {
    var G = global.grindless
    var Q = G.moon && G.moon.quantum
    var mars = G.planets && G.planets.table.planets.mars
    if (!Q || !mars) {
      check('planets_mars', false, 'global.grindless.moon.quantum or planets.mars is missing')
      return
    }
    function pair(mark) {
      var s = Item.of(ENTANGLED, 1)
      ae().QBE.assignFrequency(s)
      if (mark !== '') s.getNbt().putString(PAIR_KEY, mark)
      return s
    }
    var marsPair = pair('mars')
    var moonPair = pair('moon')
    var earthPair = pair('')
    var cases = [
      ['mars pair on Mars', Q.allowed(marsPair, MARS), true],
      ['mars pair in Mars orbit', Q.allowed(marsPair, 'gcyr:mars_orbit'), true],
      ['moon pair on Mars', Q.allowed(moonPair, MARS), false],
      ['Earth pair on Mars', Q.allowed(earthPair, MARS), false],
      ['mars pair on the Moon', Q.allowed(marsPair, LUNA), false],
      ['moon pair on the Moon', Q.allowed(moonPair, LUNA), true],
      ['mars pair on Earth', Q.allowed(marsPair, EARTH), true]
    ]
    var wrong = cases.filter(function (c) { return !!c[1] !== c[2] })
    check('planets_mars', mars.pairTag === 'mars' && wrong.length === 0, 'planets.mars.pairTag=' + mars.pairTag + '; ' +
      cases.map(function (c) { return c[0] + '=' + (!!c[1]) }).join(', ') + (wrong.length > 0 ? ' WRONG: ' + wrong.map(function (c) { return c[0] }).join(', ') : ''))
  }

  // the numbers the tax check expects, read from the live configs
  function readConfigs() {
    var L = lazy()
    var A = ae()
    var energy = L.GTConfig.INSTANCE.compat.energy
    S.cfg = {
      tax: Number(A.AEConfig.instance().getP2PTunnelEnergyTax()),
      feToAe: Number(A.PowerUnits.FE.convertTo(A.PowerUnits.AE, 1.0)),
      euToFe: Number(energy.euToFeRatio),
      feToEu: Number(energy.feToEuRatio),
      converters: !!energy.enableFEConverters
    }
    S.cfg.aePerEu = S.cfg.tax * S.cfg.euToFe * S.cfg.feToAe
    note('configs', 'AE2 p2pTunnelEnergyTax=' + S.cfg.tax + ', 1 FE=' + S.cfg.feToAe + ' AE; GTM euToFeRatio=' + S.cfg.euToFe + ', feToEuRatio=' + S.cfg.feToEu +
      ', enableFEConverters=' + S.cfg.converters + ' -> expected tax ' + S.cfg.aePerEu + ' AE per EU carried (' + round(S.cfg.aePerEu * EV_RATE) +
      ' AE/t at ' + EV_RATE + ' EU/t)')
  }

  function staticChecks() {
    guarded('registry', checkRegistry)
    guarded('converter_recipe', checkConverterRecipe)
    guarded('mars_pair_recipes', checkMarsRecipes)
    guarded('lunar_seed_by_base', checkLunarSeedByBase)
    guarded('planets_mars', checkPlanets)
    guarded('configs', readConfigs)
  }

  // ---------------------------------------------------------------- the world

  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      S.earth.getChunk(cx, 0)
      S.moon.getChunk(cx, 0)
    }
    cmd(EARTH, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    cmd(LUNA, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var a = cmd(EARTH, 'fill ' + BAND.x0 + ' 98 ' + BAND.z0 + ' ' + BAND.x1 + ' 112 ' + BAND.z1 + ' air')
    var b = cmd(LUNA, 'fill ' + BAND.x0 + ' 198 ' + BAND.z0 + ' ' + BAND.x1 + ' 214 ' + BAND.z1 + ' air')
    note('AREA', 'chunks ' + (BAND.x0 >> 4) + '..' + (BAND.x1 >> 4) + ',0 of ' + EARTH + ' and ' + LUNA + ' generated and force-loaded; cleared ' + a +
      ' blocks on Earth (Y 98..112) and ' + b + ' on the Moon (Y 198..214)')
  }

  function setblock(dim, p, y, block, failed) {
    if (cmd(dim, 'setblock ' + p.x + ' ' + y + ' ' + p.z + ' ' + block + ' replace') < 1) failed.push(dim + ' ' + at(p, y) + ' ' + block)
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

  function converterAt(level, p, y) {
    var m = lazy().MetaMachine.getMachine(level, bp(p.x, y, p.z))
    if (m === null || m === undefined || typeof m.getConverterTrait !== 'function') throw new Error('no converter at ' + at(p, y))
    return m
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

  // the AE energy left in the network: the two dense cells hold all of it (nothing injects power, so AE2's own grid buffer stays empty)
  function cellsEnergy() {
    var total = 0
    S.cells.forEach(function (be) { total += Number(be.getAECurrentPower()) })
    return total
  }

  function build() {
    var A = ae()
    var L = lazy()
    var failed = []
    bridgeCells().forEach(function (c) {
      setblock(EARTH, c, EY, c.id, failed)
      setblock(LUNA, c, MY, c.id, failed)
    })
    CELLS.forEach(function (c) { setblock(EARTH, c, EY, 'ae2:dense_energy_cell{internalCurrentPower:' + DENSE_CELL_AE + '.0d}', failed) })
    setblock(EARTH, SRC_FE, EY, CONVERTER + '[facing=west]', failed)
    setblock(EARTH, SRC_EU, EY, CONVERTER + '[facing=west]', failed)
    setblock(LUNA, CONV_MOON, MY, CONVERTER + '[facing=east]', failed)
    setblock(LUNA, SINK_FE, MY, CONVERTER + '[facing=up]', failed)
    setblock(LUNA, SINK_EU, MY, CONVERTER + '[facing=up]', failed)

    var cable = Item.of('ae2:fluix_glass_cable').getItem()
    var fe = Item.of(FE_P2P).getItem()
    var eu = Item.of(EU_P2P).getItem()
    var E = L.Direction.EAST
    ;[[S.earth, EY], [S.moon, MY]].forEach(function (w) {
      A.PartHelper.setPart(w[0], bp(BUS_FE.x, w[1], BUS_FE.z), null, null, cable)
      A.PartHelper.setPart(w[0], bp(BUS_EU.x, w[1], BUS_EU.z), null, null, cable)
    })
    S.p2p = {
      feIn: A.PartHelper.setPart(S.earth, bp(BUS_FE.x, EY, BUS_FE.z), E, null, fe),
      euIn: A.PartHelper.setPart(S.earth, bp(BUS_EU.x, EY, BUS_EU.z), E, null, eu),
      feOut: A.PartHelper.setPart(S.moon, bp(BUS_FE.x, MY, BUS_FE.z), E, null, fe),
      euOut: A.PartHelper.setPart(S.moon, bp(BUS_EU.x, MY, BUS_EU.z), E, null, eu)
    }
    Object.keys(S.p2p).forEach(function (k) { if (S.p2p[k] === null || S.p2p[k] === undefined) failed.push('P2P part ' + k) })

    S.cells = CELLS.map(function (c) { return S.earth.getBlockEntity(bp(c.x, EY, c.z)) })
    var cellAe = 0
    S.cells.forEach(function (be, i) {
      if (be === null) { failed.push('energy cell ' + i); return }
      // setblock's NBT should have filled it (EnergyCellBlockEntity#loadTag reads internalCurrentPower); top it up by hand if not
      if (Number(be.getAECurrentPower()) < DENSE_CELL_AE * 0.99) {
        be.injectAEPower(DENSE_CELL_AE - Number(be.getAECurrentPower()), Java.loadClass('appeng.api.config.Actionable').MODULATE)
      }
      cellAe += Number(be.getAECurrentPower())
    })

    S.mach = {
      srcFe: converterAt(S.earth, SRC_FE, EY),
      srcEu: converterAt(S.earth, SRC_EU, EY),
      moonConv: converterAt(S.moon, CONV_MOON, MY),
      sinkFe: converterAt(S.moon, SINK_FE, MY),
      sinkEu: converterAt(S.moon, SINK_EU, MY)
    }
    // FE -> EU on the EU source and on the Moon converter; the rest stay in GTM's default EU -> FE mode
    S.mach.srcEu.setFeToEu(true)
    S.mach.moonConv.setFeToEu(true)
    Object.keys(S.mach).forEach(function (k) { S.mach[k].getConverterTrait().setEnergyStored(0) })
    var modes = Object.keys(S.mach).map(function (k) { return k + (S.mach[k].isFeToEu() ? ':FE->EU' : ':EU->FE') }).join(' ')
    var t = S.mach.srcFe.getConverterTrait()
    check('build', failed.length === 0, 'both planets: quantum bridge X ' + QX + '..' + (QX + 2) + ' Z ' + QZ + '..' + (QZ + 2) + ', cable buses at ' +
      at(BUS_FE, '*') + ' (FE P2P east) and ' + at(BUS_EU, '*') + ' (EU P2P east); Earth: 2 dense energy cells (' + cellAe + ' AE), converters ' +
      modes + '; converter: ' + Number(t.getAmps()) + ' A at ' + Number(t.getVoltage()) + ' V, buffer ' + Number(t.getEnergyCapacity()) + ' EU' +
      (failed.length > 0 ? ' FAILED: ' + failed.join(', ') : ''))
    return failed.length === 0
  }

  // ---------------------------------------------------------------- phases

  function startLink() {
    var A = ae()
    S.earthQbe = S.earth.getBlockEntity(bp(LINK.x, EY, LINK.z))
    S.moonQbe = S.moon.getBlockEntity(bp(LINK.x, MY, LINK.z))
    var formed = S.earthQbe !== null && S.moonQbe !== null && S.earthQbe.isFormed() && S.moonQbe.isFormed()
    var gE = gridOf(S.earthQbe)
    var gM = gridOf(S.moonQbe)
    S.moonPoweredBefore = powered(gM)
    check('bridge_formed', formed && gE !== null && gM !== null && !sameGrid(gE, gM) && powered(gE),
      'Earth formed=' + (S.earthQbe !== null && S.earthQbe.isFormed()) + ' Moon formed=' + (S.moonQbe !== null && S.moonQbe.isFormed()) +
      ', separate networks=' + !sameGrid(gE, gM) + ', Earth powered=' + powered(gE) + ' (' + round(cellsEnergy(), 0) + ' AE), Moon powered=' + S.moonPoweredBefore +
      ' (no energy source on the Moon)')
    if (!formed) return false
    // an Earth-Moon pair, as AE2's ritual with a lunar seed makes it (proven in v0.5.0): a frequency and the moon mark
    var pair = Item.of(ENTANGLED, 2)
    A.QBE.assignFrequency(pair)
    pair.getNbt().putString(PAIR_KEY, 'moon')
    var h1 = pair.copy()
    h1.setCount(1)
    var h2 = pair.copy()
    h2.setCount(1)
    S.earthQbe.getInternalInventory().setItemDirect(0, h1)
    S.moonQbe.getInternalInventory().setItemDirect(0, h2)
    global.grindless.moon.quantum.track(S.moon, bp(LINK.x, MY, LINK.z))
    return true
  }

  // a part's grid node: powered, booted and with its channel (AEBasePart#getMainNode is public, its isActive may not be)
  function partActive(part) {
    var node = part.getMainNode()
    return node !== null && node !== undefined && !!node.isActive()
  }

  // linked, powered and every tunnel active: ready for the frequencies
  function linkReady() {
    var gE = gridOf(S.earthQbe)
    var gM = gridOf(S.moonQbe)
    if (!sameGrid(gE, gM) || !powered(gE)) return false
    var parts = [S.p2p.feIn, S.p2p.euIn, S.p2p.feOut, S.p2p.euOut]
    return parts.every(partActive)
  }

  function reportLink(ok) {
    var gE = gridOf(S.earthQbe)
    var gM = gridOf(S.moonQbe)
    var kept = !S.moonQbe.getInternalInventory().getStackInSlot(0).isEmpty()
    var both = sameGrid(gE, gM)
    var es = gE !== null ? gE.getEnergyService() : null
    check('bridge_linked', ok && kept && both, 'the Earth-Moon pair: lunar chamber ' + (kept ? 'keeps' : 'PUSHED OUT') + ' its half, one network=' + both +
      ', powered=' + powered(gE) + ', tunnels active=' + [S.p2p.feIn, S.p2p.euIn, S.p2p.feOut, S.p2p.euOut].map(partActive).join('/') +
      (es !== null ? ', idle ' + round(es.getIdlePowerUsage()) + ' AE/t' : ''))
    check('unpowered_half_links', !S.moonPoweredBefore && both && powered(gM), 'the Moon half had no AE energy (powered=' + S.moonPoweredBefore +
      ' before the pair went in); after linking it is one network with Earth, powered=' + powered(gM) + ': a remote half starts on the home network\'s ' +
      'energy, no charged energy cell needed (AE2 QuantumCluster#isActive ignores power)')
  }

  function setFrequencies() {
    var A = ae()
    var L = lazy()
    var svc = A.P2PService.get(gridOf(S.earthQbe))
    function link(input, output) {
      var freq = svc.newFrequency()
      svc.updateFreq(input, freq)
      var tag = new L.CompoundTag()
      tag.putShort('p2pFreq', freq)
      output.importSettings(A.SettingsFrom.MEMORY_CARD, tag, null)
      return freq
    }
    S.freqs = { fe: link(S.p2p.feIn, S.p2p.feOut), eu: link(S.p2p.euIn, S.p2p.euOut) }
  }

  function tunnelsReady() {
    return asArray(S.p2p.feIn.getOutputs()).length === 1 && asArray(S.p2p.euIn.getOutputs()).length === 1 && S.p2p.feOut.isOutput() && S.p2p.euOut.isOutput()
  }

  function reportTunnels(ok) {
    check('p2p_linked', ok, 'FE P2P frequency ' + S.freqs.fe + ': outputs of the Earth input=' + asArray(S.p2p.feIn.getOutputs()).length +
      ', Moon tunnel output=' + S.p2p.feOut.isOutput() + '; EU P2P frequency ' + S.freqs.eu + ': outputs=' + asArray(S.p2p.euIn.getOutputs()).length +
      ', Moon tunnel output=' + S.p2p.euOut.isOutput())
  }

  // ---------------------------------------------------------------- metering (every tick while a window is open)

  function openWindow(i) {
    var w = WINDOWS[i]
    S.win = { index: i, name: w[0], length: w[1], source: w[2], ticks: 0, sent: 0, sentFrom: -1, fe: 0, eu: 0, feTail: 0, euTail: 0,
      aeStart: cellsEnergy(), aeEnd: 0, primed: false, poweredAll: true }
  }

  function sourceTrait(name) {
    if (name === 'fe') return S.mach.srcFe.getConverterTrait()
    if (name === 'eu') return S.mach.srcEu.getConverterTrait()
    return null
  }

  function drain(m) {
    var t = m.getConverterTrait()
    var got = Number(t.getEnergyStored())
    if (got > 0) t.setEnergyStored(0)
    return got
  }

  function meter() {
    var W = S.win
    W.ticks++
    var src = sourceTrait(W.source)
    if (src !== null) {
      // what the source pushed during the last tick (into its tunnel: nothing else touches it), then refill it
      var cap = Number(src.getEnergyCapacity())
      var before = Number(src.getEnergyStored())
      if (W.primed) W.sent += cap - before
      src.setEnergyStored(cap)
      W.primed = true
    }
    var fe = drain(S.mach.sinkFe)
    var eu = drain(S.mach.sinkEu)
    W.fe += fe
    W.eu += eu
    if (W.ticks > W.length - STEADY) {
      W.feTail += fe
      W.euTail += eu
    }
    if (!powered(gridOf(S.earthQbe))) W.poweredAll = false
    if (W.ticks < W.length) return
    // close the window: the last push is counted, the source goes dark at once
    W.aeEnd = cellsEnergy()
    if (src !== null) src.setEnergyStored(0)
    S.done[W.name] = W
    if (W.index + 1 < WINDOWS.length) openWindow(W.index + 1)
    else {
      S.win = null
      S.phase = 'report'
    }
  }

  // ---------------------------------------------------------------- results

  // A window's AE reading opens at the meter call before its first tick and closes at its last call: W.ticks ticks of idle drain in
  // between, and W.ticks - 1 pushes of its source (the first call only fills the source).
  function report() {
    var idle = S.done.idle
    var idleRate = (idle.aeStart - idle.aeEnd) / Math.max(1, idle.ticks)
    note('idle', 'the merged network alone: ' + round(idleRate) + ' AE/t from the cells over ' + idle.ticks + ' ticks (AE2 reports ' +
      round(gridOf(S.earthQbe).getEnergyService().getIdlePowerUsage()) + ' AE/t idle); sinks got ' + idle.fe + ' + ' + idle.eu + ' EU with no source')
    lane('fe', S.done.fe, S.done.fe_tail, idleRate, 'FE P2P with converters (EU -> FE on Earth, FE -> EU on the Moon)', function (w) { return w.fe }, function (w) { return w.feTail })
    lane('eu', S.done.eu, S.done.eu_tail, idleRate, 'EU P2P (eup2p), no converters', function (w) { return w.eu }, function (w) { return w.euTail })
    var moonLeft = Number(S.mach.moonConv.getConverterTrait().getEnergyStored())
    note('energy_left', 'Moon FE -> EU converter buffer at the end: ' + moonLeft + ' EU; cells: ' + round(cellsEnergy(), 0) + ' AE of ' + (2 * DENSE_CELL_AE))
  }

  function lane(key, w, tail, idleRate, label, got, gotTail) {
    var pushes = Math.max(1, w.ticks - 1)
    var sentRate = w.sent / pushes
    var steady = gotTail(w) / STEADY
    var received = got(w) + got(tail)
    var ok = steady >= EV_RATE * 0.99 && sentRate >= EV_RATE * 0.99 && w.poweredAll
    check('power_' + key + '_rate', ok, label + ': Earth sent ' + w.sent + ' EU in ' + pushes + ' ticks (' + round(sentRate) + ' EU/t), the Moon sink got ' +
      round(steady) + ' EU/t over the last ' + STEADY + ' ticks (target ' + EV_RATE + ' EU/t = 16 A EV), ' + received + ' EU in all with the tail' +
      ', network powered throughout=' + w.poweredAll)
    var drop = w.aeStart - w.aeEnd
    var taxAe = drop - idleRate * w.ticks
    var perEu = w.sent > 0 ? taxAe / w.sent : 0
    var expected = S.cfg ? S.cfg.aePerEu : 0
    var ratio = expected > 0 ? perEu / expected : 0
    check('power_' + key + '_tax', w.sent > 0 && ratio > 0.9 && ratio < 1.1, label + ': cells lost ' + round(drop, 0) + ' AE, minus idle ' + round(idleRate * w.ticks, 0) +
      ' = ' + round(taxAe, 0) + ' AE for ' + w.sent + ' EU carried: ' + round(perEu, 4) + ' AE per EU (expected ' + round(expected, 4) + ', ratio ' + round(ratio, 3) +
      ') = ' + round(perEu * sentRate) + ' AE/t at this rate; in EU at ' + (S.cfg ? S.cfg.euToFe : '?') + ' FE per EU and 2 FE per AE that is ' +
      round(perEu * 100 / (S.cfg ? S.cfg.feToAe * S.cfg.euToFe : 2), 2) + '% of the energy carried')
  }

  // ---------------------------------------------------------------- driver

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      cmd(EARTH, 'forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      cmd(LUNA, 'forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    } catch (e) { /* best effort */ }
    console.info(TAG + SCOPE + '|DONE')
  }

  function step(elapsed) {
    var since = elapsed - S.phaseAt
    if (S.phase === 'built') {
      // the bridges form and the Earth network boots (AE2 only calls a network powered after 30 ticks with power)
      if (since < 60) return
      S.phase = startLink() ? 'linking' : 'end'
      S.phaseAt = elapsed
      return
    }
    if (S.phase === 'linking') {
      var ready = linkReady()
      if (!ready && since < 300) return
      reportLink(ready)
      if (!ready) {
        S.phase = 'end'
        return
      }
      setFrequencies()
      S.phase = 'tunnels'
      S.phaseAt = elapsed
      return
    }
    if (S.phase === 'tunnels') {
      var ok = tunnelsReady()
      if (!ok && since < 100) return
      reportTunnels(ok)
      if (!ok) {
        S.phase = 'end'
        return
      }
      S.done = {}
      openWindow(0)
      S.phase = 'metering'
      return
    }
    if (S.phase === 'report') {
      guarded('report', report)
      S.phase = 'end'
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    if (S.phase === 'metering' && S.win !== null) {
      try {
        meter()
      } catch (e) {
        check('meter', false, 'exception in ' + S.win.name + ': ' + e)
        S.phase = 'end'
      }
    }
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    var elapsed = now - S.tick0
    try {
      if (S.phase !== 'end') step(elapsed)
    } catch (e) {
      check('step', false, 'exception in ' + S.phase + ': ' + e)
      S.phase = 'end'
    }
    if (S.phase === 'end') {
      finish()
      return
    }
    if (elapsed > TEST_TIMEOUT) {
      check('timeout', false, 'still in ' + S.phase + ' after ' + elapsed + ' ticks')
      finish()
    }
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, earth: server.overworld(), moon: server.getLevel(LUNA), t: 0, tick0: now, nextAt: now + STEP, phase: 'start', phaseAt: 0,
      win: null, done: null, cfg: null, finished: false }
    staticChecks()
    if (S.moon === null || S.moon === undefined) {
      check('moon_level', false, LUNA + ' is not loaded')
      finish()
      return
    }
    guarded('AREA', prepareWorld)
    var built = false
    try {
      built = build()
    } catch (e) {
      check('build', false, 'exception: ' + e)
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

  ServerEvents.customCommand('gg_test_ae2_interplanetary', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
