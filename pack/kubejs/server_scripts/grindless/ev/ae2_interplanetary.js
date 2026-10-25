// -----------------------------------------------------------------------------------------------
// The AE2 network between planets, EV step (docs/eras/ev.md, "The AE2 network: EV step"; the item is registered in
// startup_scripts/grindless/ev/ae2_interplanetary.js). AE2 itself is not changed: every piece below is stock AE2, stock GTM or the
// HV pairs of moon/crafting.js and moon/quantum_bridge.js.
//
//   Earth-Mars pair          the Martian half is made on Mars, the way the lunar one is made on the Moon (moon/crafting.js):
//     Martian Quantum Seed   CHEMICAL REACTOR only on Mars (.dimension: the first dimension of planets.mars in data/grindless/tables/
//                            planets.json, gcyr:mars): 1 merrillite dust + 1 ender pearl + 250 mB helium-3 -> 1, 480 EU/t, 10 s, the
//                            HV numbers of the lunar seed. Merrillite is the rare-earth phosphate only Mars has (ev/foundation.js);
//                            rare-earth ions in a crystal are what real quantum memories hold their states in. It is the first
//                            ingredient so that the lunar recipe (ender pearl + helium-3) is not a prefix of this one (GTM's lookup
//                            prefix rule, lv/multis.js).
//     the pair               AE2's own explosion ritual (ae2:transform): an AE2 singularity (the Earth half) + a Martian Quantum Seed
//                            -> 2 entangled singularities. AE2 gives them their frequency as always, and the recipe adds
//                            grindless_planet: "mars" (planets.json, planets.mars.pairTag), the mark that lets a quantum link
//                            chamber on Mars keep its half (moon/quantum_bridge.js ejects any other singularity off Earth).
//                            The Martian half links with no AE2 power of its own: AE2's QuantumCluster#isActive does not ask for
//                            power, and once linked both halves are one grid that runs on the home network's energy cells.
//   lunar halves by the base the Lunar Quantum Seed keeps its HV recipe (moon/crafting.js: chemical reactor on the Moon, ender pearl +
//                            250 mB helium-3). In EV the base makes it without anyone travelling: a chemical reactor on the Moon fed by
//                            the network (ender pearls from home, helium-3 from the drill's regolith vein or the regolith cell) sends
//                            each new seed home over the first bridge.
//   power over the bridge    no recipe of ours: FE P2P tunnels (ae2:fe_p2p_tunnel) over the bridge between two GTM 16 A EV energy
//                            converters (gtceu:ev_16a_energy_converter, GTM's own crafting recipe; enableFEConverters is on in
//                            config/gtceu.yaml): EU -> FE on one planet, FE -> EU on the other, 32,768 EU/t per pair. AE2 charges
//                            2.5% of the energy it carries (PowerRatios.p2pTunnelEnergyTax), taken from the grid's AE energy at
//                            2 FE = 1 AE: 1,638.4 AE/t per pair at full rate. The EU P2P tunnel (eup2p, already in the pack) does the
//                            same with no converters and the same tax (EUP2PTunnelPart charges total EU x euToFeRatio as FE).
//   trunk                    ME P2P tunnels over the bridge (32 channels each, 1 channel of the bridge each): no recipe of ours.
//
// The final recipe ids (GTM's builder puts the type in front) are published in global.grindless.ae2Interplanetary.recipes for the test.
(function () {
  const G = global.grindless || (global.grindless = {})
  const AI = G.ae2Interplanetary || (G.ae2Interplanetary = {})
  const PAIR_NBT_KEY = 'grindless_planet'
  const PLANETS = 'kubejs/data/grindless/tables/planets.json'

  AI.pairNbtKey = PAIR_NBT_KEY
  AI.recipes = {
    marsSeed: 'grindless:chemical_reactor/martian_quantum_seed',
    marsPair: 'grindless:transform/martian_entangled_singularity',
    lunarSeed: 'grindless:chemical_reactor/lunar_quantum_seed',
    lunarPair: 'grindless:transform/lunar_entangled_singularity'
  }

  function marsTable() {
    var table = G.planets && G.planets.table ? G.planets.table : G.readJsonTable(PLANETS)
    return table && table.planets ? table.planets.mars : null
  }

  // one thrown error would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    try {
      addRecipes(event)
    } catch (e) {
      console.error('[grindless/ev] AE2 interplanetary recipes failed: ' + e)
    }
  })

  function addRecipes(event) {
    var ids = AI.ids
    var mars = marsTable()
    if (!mars || !mars.pairTag || !mars.dimensions || mars.dimensions.length === 0) {
      console.error('[grindless/ev] Earth-Mars pair skipped: planets.json has no mars pairTag or dimension')
      return
    }
    var dimension = mars.dimensions[0]
    var missing = [ids.marsSeed, ids.merrilliteDust, ids.singularity, ids.entangled, 'minecraft:ender_pearl'].filter(function (id) { return !Item.exists(id) })
    if (!Fluid.exists(ids.helium3)) missing.push(ids.helium3)
    if (missing.length > 0) {
      console.error('[grindless/ev] Earth-Mars pair skipped, unknown: ' + missing.join(', '))
      return
    }

    // ---- the Martian half of an Earth-Mars pair, only on Mars
    event.recipes.gtceu.chemical_reactor('grindless:martian_quantum_seed')
      .itemInputs(ids.merrilliteDust, '#forge:ender_pearls')
      .inputFluids(Fluid.of(ids.helium3, 250))
      .itemOutputs(ids.marsSeed)
      .dimension(dimension)
      .EUt(480)
      .duration(200)

    // ---- the Earth-Mars entangled pair: AE2's explosion ritual with the Martian seed
    var nbt = {}
    nbt[PAIR_NBT_KEY] = mars.pairTag
    event.custom({
      type: 'ae2:transform',
      circumstance: { type: 'explosion' },
      ingredients: [{ item: ids.singularity }, { item: ids.marsSeed }],
      result: { item: ids.entangled, count: 2, nbt: nbt }
    }).id(AI.recipes.marsPair)

    console.info('[grindless/ev] AE2 interplanetary: Martian quantum seed (only in ' + dimension + '), Earth-Mars pair (' +
      PAIR_NBT_KEY + ': ' + mars.pairTag + ')')
  }
})()
