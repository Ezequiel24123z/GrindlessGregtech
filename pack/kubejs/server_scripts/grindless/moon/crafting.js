// priority: -20024
// -----------------------------------------------------------------------------------------------
// Crafting of the Moon (end of HV):
//
//   Lunar Drill                 crafting table (GT shaped): two daylight detectors (the solar wings), an HV sensor, HV motors, an HV
//                               hull, HV circuits and the HV drill bit. Built on Earth, carried up in the rocket.
//   lunar vein samples          empty vein probe + two things of the vein brought by hand on the first visit: the two most common
//                               raw ores of an 'ore' vein (ilmenite + olivine), or the two regolith blocks of the 'volatiles' one.
//   Lunar Quantum Seed          HV chemical reactor ON THE MOON (.dimension('gcyr:luna')): ender pearl + 250 mB of helium-3. It is the
//                               Moon's half of an Earth-Moon quantum pair.
//   Earth-Moon entangled pair   AE2's own ritual (ae2:transform, explosion): an AE2 singularity (the Earth half: the matter condenser
//                               of the home network) + a Lunar Quantum Seed -> 2 entangled singularities. AE2 gives the pair its
//                               frequency as always (TransformRecipe.assemble -> QuantumBridgeBlockEntity.assignFrequency, which only
//                               adds "freq" to the NBT), and the recipe adds grindless_planet: "moon" (data/grindless/tables/
//                               planets.json, pairTag), the mark that lets a quantum link chamber on the Moon keep it
//                               (server_scripts/grindless/moon/quantum_bridge.js). The
//                               LV ritual (singularity + ender dust or pearl) is untouched: its pairs keep working anywhere on Earth.
//
// event.recipes.gtceu.shaped: GTM's shaped recipe; keys of ingredients are uppercase on purpose (lowercase are GT tools).
(function () {
  const G = global.grindless
  const MOON = G.moon || (G.moon = {})

  const SEED = 'grindless:lunar_quantum_seed'
  const PAIR_NBT_KEY = 'grindless_planet'
  MOON.pair = { seed: SEED, nbtKey: PAIR_NBT_KEY, transformId: 'grindless:transform/lunar_entangled_singularity' }

  ServerEvents.recipes(function (event) {
    var dimension = G.tables.veins_moon.dimension
    var hv = MOON.lunarBit()

    var parts = ['gtceu:hv_machine_hull', 'gtceu:hv_electric_motor', 'gtceu:hv_sensor', 'minecraft:daylight_detector', 'grindless:empty_vein_probe']
    if (hv !== null) parts.push(hv.bit.item)
    var missing = parts.filter(function (id) { return !Item.exists(id) })
    if (hv === null || missing.length > 0) {
      console.error('[grindless/moon] Lunar Drill recipe skipped: ' + (hv === null ? 'no HV drill bit' : 'unknown item(s) ' + missing.join(', ')))
    } else {
      event.recipes.gtceu.assembler('grindless:lunar_drill')
        .itemInputs('gtceu:hv_machine_hull', '2x minecraft:daylight_detector', 'gtceu:hv_sensor', '2x gtceu:hv_electric_motor', '4x #gtceu:circuits/hv', '2x ' + hv.bit.item, 'grindless:empty_vein_probe')
        .inputFluids(Fluid.of('gtceu:lubricant', 500))
        .itemOutputs('gtceu:lunar_drill')
        .EUt(120).duration(400)
    }

    // ---- lunar vein samples
    var samples = 0
    MOON.lunarVeins().forEach(function (vein) {
      event.shapeless(vein.sample, ['grindless:empty_vein_probe', vein.samplePair[0], vein.samplePair[1]])
        .id('grindless:crafting/vein_sample/' + vein.id)
      samples++
    })

    // ---- the Moon's half of an Earth-Moon quantum pair
    event.recipes.gtceu.chemical_reactor('grindless:lunar_quantum_seed')
      .itemInputs('#forge:ender_pearls')
      .inputFluids(Fluid.of('gtceu:helium_3', 250))
      .itemOutputs(SEED)
      .dimension(dimension)
      .EUt(480)
      .duration(200)

    // ---- the Earth-Moon entangled pair: AE2's explosion ritual with the lunar seed
    var planets = G.readJsonTable('kubejs/data/grindless/tables/planets.json').planets
    var nbt = {}
    nbt[PAIR_NBT_KEY] = planets.moon.pairTag
    event.custom({
      type: 'ae2:transform',
      circumstance: { type: 'explosion' },
      ingredients: [{ item: 'ae2:singularity' }, { item: SEED }],
      result: { item: 'ae2:quantum_entangled_singularity', count: 2, nbt: nbt }
    }).id(MOON.pair.transformId)

    console.info('[grindless/moon] crafting: Lunar Drill, ' + samples + ' lunar samples, lunar quantum seed (only in ' + dimension + '), Earth-Moon pair')
  })
})()
