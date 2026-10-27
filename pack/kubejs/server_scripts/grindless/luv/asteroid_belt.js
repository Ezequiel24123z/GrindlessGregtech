// priority: -17524
// -----------------------------------------------------------------------------------------------
// LuV B5 on the server (registrations: startup_scripts/grindless/luv/asteroid_belt.js; docs/eras/luv.md, sections 11-13). The belt's
// dimension comes only from tables/places.json (G.places, key asteroid_belt). Every number marked (tune) in the design is in
// global.grindless.asteroidBelt.recipes so the tests and the dump read the same figures.
//
//   world generation   GTCEuServerEvents.oreVeins: the veins of data/grindless/tables/veins_belt.json on the belt's surface, in GTM's
//                      layer 'asteroid_belt' (tuff). Only chunks generated from now on.
//   vein samples       crafting: the empty vein probe + the two most common raw ores of the vein (a pair no other vein of the pack uses),
//                      brought back by hand on the first visit. grindless:crafting/vein_sample/<vein>.
//   drilling           gtceu:vein_drilling, vein_drilling/luv/harpoon_<vein>_hss_s, one per vein: the sample (never used up), the HSS-S
//                      bit at 0.25 % a run and an anchor harpoon at 1 %, the belt only, 8 EU/t x 200 t like every drilling recipe; a tuff
//                      and 11.25 raw ores a run (twice IV's 5.625), split by the vein's weights (the family's maths). The sample is the
//                      first ingredient: no other drilling recipe starts with a belt sample.
//   asteroid processor gtceu:asteroid_processing, anywhere:
//                        mond_crushed   c1: 16 crushed meteoric iron + the CO charge (1,000 mB, never used up) -> 24 iron + 4 nickel +
//                                       1 cobalt dust + 1 asteroid PGM concentrate, 1,920 EU/t x 400 t
//                        magnetic_split c2: 16 crushed tetrataenite -> 12 tetrataenite dust + 4 meteoric iron dust, 1,920 EU/t x 200 t
//                        mond_dust      c3: the same Mond as c1 from 16 meteoric iron dust (what GTM's ore line and the magnetic split
//                                       leave; meteoric iron has no other use)
//   optical miner      gtceu:optical_mining, the belt only:
//                        c_type_boulder c1: a capture bag (used up at 5 % a run) -> 4,000 mB water + 1,000 mB CO2 + 2 carbon dust + 1
//                                       chondritic extract, 1,920 EU/t x 1,200 t; only in full sun (the startup's run-start check)
//                        boudouard      c2: 1,000 mB CO2 + 1 carbon dust -> 2,000 mB CO, 480 EU/t x 200 t: the processor's CO charge
//   parts              LuV lathe: long HSS-S rod -> HSS-S drill bit (30,720 EU/t x 200 t, like IV's bit one tier up); IV assembler:
//                      2 HSS-S rods + a tungsten carbide plate -> 2 anchor harpoons; IV assembler: 8 para-aramid foils + 4 Kapton K plates
//                      + 2 titanium rods -> 1 capture bag; alloy smelter on the belt only: 4 tuff (what the drill brings up) + 1 titanium
//                      dust -> 2 asteroid regolith casings.
//   the belt's seed    the far half of the Earth-belt AE2 pair (the IV travel network's rule): chemical reactor on the belt, raw meteoric
//                      iron + an ender pearl + 250 mB helium-3 -> asteroid quantum seed, 480 EU/t x 200 t; AE2's explosion ritual marks
//                      the pair with planets.json's pairTag 'belt'.
//   controllers        GTM shaped, LuV hull and 4 LuV circuits each.
// Published for the tests: global.grindless.asteroidBelt.recipes, .made, .worldgen.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/luv] '
  var G = global.grindless
  var B = G.asteroidBelt || (G.asteroidBelt = {})
  var PROBE = 'grindless:empty_vein_probe'
  var CO = 'gtceu:carbon_monoxide'
  var CO2 = 'gtceu:carbon_dioxide'

  B.recipes = {
    mond: { crushed: 'gtceu:crushed_meteoric_iron_ore', dust: 'gtceu:meteoric_iron_dust', count: 16, charge: 1000,
      outputs: [['gtceu:iron_dust', 24], ['gtceu:nickel_dust', 4], ['gtceu:cobalt_dust', 1], ['grindless:asteroid_pgm_concentrate', 1]],
      eut: 1920, duration: 400 },
    split: { input: 'gtceu:crushed_tetrataenite_ore', count: 16,
      outputs: [['gtceu:tetrataenite_dust', 12], ['gtceu:meteoric_iron_dust', 4]], eut: 1920, duration: 200 },
    boulder: { bag: 'grindless:capture_bag', wear: 500, water: 4000, co2: 1000, carbon: 2, extract: 'grindless:chondritic_extract',
      eut: 1920, duration: 1200 },
    boudouard: { co2: 1000, carbon: 1, co: 2000, eut: 480, duration: 200 },
    bit: { rod: 'gtceu:long_hsss_rod', eut: 30720, duration: 200 },
    harpoon: { rods: 2, tip: 'gtceu:tungsten_carbide_plate', out: 2, eut: 7680, duration: 100 },
    bag: { foils: 8, plates: 4, rods: 2, eut: 7680, duration: 200 },
    casing: { stone: 'minecraft:tuff', count: 4, binder: 'gtceu:titanium_dust', out: 2, eut: 1920, duration: 100 },
    seed: { local: 'gtceu:raw_meteoric_iron', helium3: 250, eut: 480, duration: 200, pairTag: 'belt',
      pair: 'grindless:transform/asteroid_entangled_singularity' }
  }

  function belt(recipe) {
    return G.places.allow(recipe, B.place)
  }

  // expected amount per run -> whole items + one chanced item for the fraction (the family's maths)
  function addOre(recipe, item, expected) {
    var whole = Math.floor(expected + 1e-9)
    var chance = Math.round((expected - whole) * 10000)
    if (whole > 0) recipe.itemOutputs(whole + 'x ' + item)
    if (chance >= 1) recipe.chancedOutput('1x ' + item, Math.min(chance, 9999), 0)
  }

  // ---------------------------------------------------------------- the belt's veins, normalized like the IV tables

  var normalized = null
  function beltVeins() {
    if (normalized !== null) return normalized
    var LV = G.lv
    var tools = LV.veinTools
    var taken = {}
    var HV = G.hv || {}
    var others = typeof HV.allVeins === 'function' ? HV.allVeins() : LV.allVeins()
    if (G.moon && typeof G.moon.lunarVeins === 'function') others = others.concat(G.moon.lunarVeins())
    if (G.mars && typeof G.mars.martianVeins === 'function') others = others.concat(G.mars.martianVeins())
    var IVF = G.ivFoundation
    if (IVF) others = others.concat(IVF.venusVeins(), IVF.mercuryVeins(), IVF.leachVeins())
    others.forEach(function (v) { taken[tools.pairKey(v.samplePair[0], v.samplePair[1])] = v.id })
    normalized = G.tables.veins_belt.veins.map(function (vein) {
      var ores = tools.oresOf(vein)
      var pair = tools.samplePairOf(ores, taken)
      taken[tools.pairKey(pair[0], pair[1])] = vein.id
      return { id: vein.id, gtm: vein.gtm, layer: vein.layer, kind: vein.kind, sample: 'grindless:vein_sample_' + vein.id,
        ores: ores, samplePair: pair, stone: vein.stone, minY: vein.minY, maxY: vein.maxY }
    })
    return normalized
  }
  B.veins = beltVeins

  function missing(ids) {
    return ids.filter(function (id) { return !Item.exists(id) })
  }

  // ---------------------------------------------------------------- recipes

  function addDrilling(event) {
    var D = B.drill
    var made = []
    beltVeins().forEach(function (vein) {
      var bad = missing([vein.sample, vein.stone, D.bit.item, D.harpoon.item].concat(vein.ores.map(function (o) { return o.item })))
      if (bad.length > 0) {
        console.error(LOG + 'belt vein ' + vein.id + ' skipped, unknown item(s): ' + bad.join(', '))
        return
      }
      var r = event.recipes.gtceu.vein_drilling('grindless:luv/harpoon_' + vein.id + '_hss_s')
        .notConsumable(vein.sample)
        .chancedInput(D.bit.item, D.bit.wear, 0)
        .chancedInput(D.harpoon.item, D.harpoon.wear, 0)
        .itemOutputs('1x ' + vein.stone)
      vein.ores.forEach(function (o) { addOre(r, o.item, o.share * D.perRun) })
      belt(r).EUt(D.eut).duration(D.duration)
      made.push('grindless:vein_drilling/luv/harpoon_' + vein.id + '_hss_s')
    })
    return made
  }

  function addSamples(event) {
    var made = []
    beltVeins().forEach(function (vein) {
      var id = 'grindless:crafting/vein_sample/' + vein.id
      event.shapeless(vein.sample, [PROBE, vein.samplePair[0], vein.samplePair[1]]).id(id)
      made.push(id)
    })
    return made
  }

  function addProcessor(event) {
    var R = B.recipes
    var feeds = [['mond_crushed', R.mond.crushed, 1], ['mond_dust', R.mond.dust, 3]]
    feeds.forEach(function (f) {
      var r = event.recipes.gtceu.asteroid_processing('grindless:' + f[0])
        .circuit(f[2])
        .itemInputs(R.mond.count + 'x ' + f[1])
        .notConsumableFluid(Fluid.of(CO, R.mond.charge))
      R.mond.outputs.forEach(function (o) { r.itemOutputs(o[1] + 'x ' + o[0]) })
      r.EUt(R.mond.eut).duration(R.mond.duration)
    })
    var s = event.recipes.gtceu.asteroid_processing('grindless:magnetic_split')
      .circuit(2)
      .itemInputs(R.split.count + 'x ' + R.split.input)
    R.split.outputs.forEach(function (o) { s.itemOutputs(o[1] + 'x ' + o[0]) })
    s.EUt(R.split.eut).duration(R.split.duration)
    return ['grindless:asteroid_processing/mond_crushed', 'grindless:asteroid_processing/magnetic_split', 'grindless:asteroid_processing/mond_dust']
  }

  function addMiner(event) {
    var R = B.recipes
    belt(event.recipes.gtceu.optical_mining('grindless:c_type_boulder')
      .circuit(1)
      .chancedInput(R.boulder.bag, R.boulder.wear, 0)
      .itemOutputs(R.boulder.carbon + 'x gtceu:carbon_dust', '1x ' + R.boulder.extract)
      .outputFluids(Fluid.of('minecraft:water', R.boulder.water), Fluid.of(CO2, R.boulder.co2))
      .addDataString(B.miner.sunKey, 'boulder'))
      .EUt(R.boulder.eut).duration(R.boulder.duration)
    belt(event.recipes.gtceu.optical_mining('grindless:boudouard')
      .circuit(2)
      .itemInputs(R.boudouard.carbon + 'x gtceu:carbon_dust')
      .inputFluids(Fluid.of(CO2, R.boudouard.co2))
      .outputFluids(Fluid.of(CO, R.boudouard.co)))
      .EUt(R.boudouard.eut).duration(R.boudouard.duration)
    return ['grindless:optical_mining/c_type_boulder', 'grindless:optical_mining/boudouard']
  }

  function addParts(event) {
    var R = B.recipes
    event.recipes.gtceu.lathe('grindless:hss_s_drill_bit')
      .itemInputs(R.bit.rod)
      .itemOutputs(B.drill.bit.item)
      .EUt(R.bit.eut).duration(R.bit.duration)
    event.recipes.gtceu.assembler('grindless:anchor_harpoon')
      .itemInputs(R.harpoon.rods + 'x gtceu:hsss_rod', '1x ' + R.harpoon.tip)
      .itemOutputs(R.harpoon.out + 'x ' + B.drill.harpoon.item)
      .EUt(R.harpoon.eut).duration(R.harpoon.duration)
    event.recipes.gtceu.assembler('grindless:capture_bag')
      .itemInputs(R.bag.foils + 'x gcyr:para_aramid_foil', R.bag.plates + 'x gcyr:kapton_k_plate', R.bag.rods + 'x gtceu:titanium_rod')
      .itemOutputs('1x ' + R.boulder.bag)
      .EUt(R.bag.eut).duration(R.bag.duration)
    belt(event.recipes.gtceu.alloy_smelter('grindless:asteroid_regolith_casing')
      .itemInputs(R.casing.count + 'x ' + R.casing.stone, '1x ' + R.casing.binder)
      .itemOutputs(R.casing.out + 'x grindless:asteroid_regolith_casing'))
      .EUt(R.casing.eut).duration(R.casing.duration)
    return ['grindless:lathe/hss_s_drill_bit', 'grindless:assembler/anchor_harpoon', 'grindless:assembler/capture_bag',
      'grindless:alloy_smelter/asteroid_regolith_casing']
  }

  function addSeed(event) {
    var S = B.recipes.seed
    var seed = 'grindless:asteroid_quantum_seed'
    var bad = missing([seed, S.local, 'ae2:singularity', 'ae2:quantum_entangled_singularity', 'minecraft:ender_pearl'])
    if (!Fluid.exists('gtceu:helium_3')) bad.push('gtceu:helium_3')
    if (bad.length > 0) {
      console.error(LOG + 'belt seed skipped, unknown: ' + bad.join(', '))
      return []
    }
    belt(event.recipes.gtceu.chemical_reactor('grindless:asteroid_quantum_seed')
      .itemInputs(S.local, '#forge:ender_pearls')
      .inputFluids(Fluid.of('gtceu:helium_3', S.helium3))
      .itemOutputs(seed))
      .EUt(S.eut).duration(S.duration)
    event.custom({
      type: 'ae2:transform',
      circumstance: { type: 'explosion' },
      ingredients: [{ item: 'ae2:singularity' }, { item: seed }],
      result: { item: 'ae2:quantum_entangled_singularity', count: 2, nbt: { grindless_planet: S.pairTag } }
    }).id(S.pair)
    return ['grindless:chemical_reactor/asteroid_quantum_seed', S.pair]
  }

  function addControllers(event) {
    event.recipes.gtceu.shaped(B.drill.machine, ['CMC', 'PHP', 'C C'], {
      C: '#gtceu:circuits/luv', M: 'gtceu:luv_electric_motor', P: 'gtceu:luv_electric_piston', H: 'gtceu:luv_machine_hull'
    }).id('grindless:crafting/harpoon_anchor_drill')
    event.recipes.gtceu.shaped(B.processor.machine, ['CRC', 'PHP', 'C C'], {
      C: '#gtceu:circuits/luv', R: 'gtceu:luv_robot_arm', P: 'gtceu:luv_electric_pump', H: 'gtceu:luv_machine_hull'
    }).id('grindless:crafting/asteroid_processor')
    event.recipes.gtceu.shaped(B.miner.machine, ['CUC', 'SHS', 'C C'], {
      C: '#gtceu:circuits/luv', U: 'gtceu:luv_electric_pump', S: 'gtceu:luv_sensor', H: 'gtceu:luv_machine_hull'
    }).id('grindless:crafting/optical_miner')
    return ['grindless:crafting/harpoon_anchor_drill', 'grindless:crafting/asteroid_processor', 'grindless:crafting/optical_miner']
  }

  // one thrown error would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    var made = []
    var steps = [['drilling', addDrilling], ['samples', addSamples], ['processor', addProcessor], ['miner', addMiner],
      ['parts', addParts], ['seed', addSeed], ['controllers', addControllers]]
    steps.forEach(function (step) {
      try {
        made = made.concat(step[1](event))
      } catch (e) {
        console.error(LOG + 'asteroid belt ' + step[0] + ' recipes failed: ' + e)
      }
    })
    B.made = made
    console.info(LOG + 'asteroid belt: ' + made.length + ' recipes')
  })

  // ---------------------------------------------------------------- world generation

  function material(name) {
    var m = GTMaterials.get(name)
    if (m == null || m.isNull()) throw new Error('unknown GT material ' + name)
    return m
  }

  GTCEuServerEvents.oreVeins(function (event) {
    try {
      var dimension = G.places.surface(B.place)
      var added = []
      G.tables.veins_belt.veins.forEach(function (vein) {
        event.add(vein.gtm, function (def) {
          def.weight(vein.spawnWeight)
          def.clusterSize(vein.clusterSize)
          def.density(vein.density)
          // the layer first: the layer pattern reads its target block (tuff)
          def.layer(vein.layer)
          def.dimensions(dimension)
          def.heightRangeUniform(vein.minY, vein.maxY)
          def.layeredVeinGenerator(function (generator) {
            generator.buildLayerPattern(function (pattern) {
              vein.materials.forEach(function (m) {
                pattern.layer(function (l) { l.weight(m.weight).mat(material(m.id)).size(m.size[0], m.size[1]) })
              })
            })
          })
          def.surfaceIndicatorGenerator(function (indicator) { indicator.surfaceRock(material(vein.colorMaterial)) })
        })
        added.push(vein.gtm)
      })
      B.worldgen = { dimension: dimension, layer: G.tables.veins_belt.layer, added: added }
      console.info(LOG + 'belt ore veins on ' + dimension + ': ' + added.join(', '))
    } catch (e) {
      console.error(LOG + 'belt ore veins failed: ' + e)
    }
  })
})()
