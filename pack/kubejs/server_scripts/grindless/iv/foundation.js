// -----------------------------------------------------------------------------------------------
// IV foundation on the server (the registrations are in startup_scripts/grindless/iv/foundation.js; docs/eras/iv.md, "Raising IV
// to the target"):
//
//   heavy water electrolysis  ELECTROLYZER: 1,000 mB gtceu:heavy_water -> 2,000 mB deuterium + 1,000 mB oxygen at GTM's own water
//                             electrolysis numbers (electrolyzer/water_electrolysis: 30 EU/t, 1,500 ticks). GTM's automatic
//                             decomposition of a fluid would charge 1,800 EU, 25 times less than water; splitting D2O costs what
//                             splitting H2O costs. The pack's first deuterium since EV cut every Earth source.
//   zircaloy                  MIXER, EV: 63 zirconium dust + 1 tin dust -> 64 zircaloy dust (1.5 % tin in atoms, Zircaloy-4), 1,920
//                             EU/t for 20 s, like GTM's HSS-G. GTM itself makes the rest from the material (blast temperature 2,100 K
//                             with argon): electric_blast_furnace/blast_zircaloy (and _gas) -> hot ingot -> vacuum_freezer/
//                             cool_hot_zircaloy_ingot. Zirconium comes from the End's zircon vein (GT Community Additions), tin from
//                             the steam age.
//   ion exchange resin        CHEMICAL REACTOR: 1,000 mB styrene + 1,000 mB sulfuric acid -> 4 grindless:ion_exchange_resin + 1,000 mB
//                             diluted sulfuric acid (sulfonated polystyrene beads; the water the sulfonation gives dilutes the rest of
//                             the acid, which GTM's distillery concentrates again). 480 EU/t for 20 s. The leach field wears it.
//   platinum gauze            ASSEMBLER, EV: 16 fine platinum wire + 2 fine rhodium wire -> 1 grindless:platinum_gauze (woven
//                             platinum-rhodium, 90:10 like real catalyst gauze), 1,920 EU/t for 10 s. Pt and Rh come from the platinum
//                             plant.
//   Hermean regolith dust     MACERATOR, anywhere: 1 Mercury rock or Mercury cobblestone (the stone the Mercury drill brings up) -> 1
//                             gtceu:hermean_regolith_dust, with GTM's numbers for stone (2 EU/t, 98 ticks), like the lunar regolith.
//                             GCYR gives these blocks no maceration.
//   radiation-proof casing    GT--'s own recipe stays (gtceu:assembler/radiation_proof_machine_casing, IV assembler: 6 dense lead
//                             plates + a tungsten steel frame + 1,296 mB concrete, 7,680 EU/t): it is already what iv.md asks for.
//   vein samples              crafting table: empty vein probe + the two most common raw ores of the vein, for every vein of
//                             veins_venus.json, veins_mercury.json and veins_leach.json (the pair is unique among every vein of the
//                             pack). Recipe ids grindless:crafting/vein_sample/<vein>.
//
//   world generation          GTCEuServerEvents.oreVeins (it only changes chunks generated from now on):
//                               - Venus (gcyr:venus, GCYR's 'venus' layer) gets veins_venus.json: GTM's naquadah vein, moved from the End
//                                 (moon/worldgen.js removes gtceu:naquadah_vein, veins_excluded.json removeFromWorld);
//                               - Mercury (gcyr:mercury, 'mercury' layer) gets veins_mercury.json: the iridosmine vein;
//                               - the Overworld (and grindless:flat, like every Overworld vein) gets our fluorite vein, the 'fluorite'
//                                 entry of veins_overworld_extra.json (its drilling recipes come from lv/vein_drilling.js like the
//                                 other veins of that table);
//                               - any vein of another mod that would generate only on Venus or Mercury is taken out (GCYR's are
//                                 already gone: moon/worldgen.js runs after this file and removes every gcyr: vein).
//                             The End's pitchblende vein is GTM's and stays as it is (veins_leach.json only gives it its sample).
//
// Published in global.grindless.ivFoundation for the other IV packages and the test: .recipes (final ids), .venusVeins(),
// .mercuryVeins(), .leachVeins() (normalized like global.grindless.mars.martianVeins()), .checkTables() and .worldgen.
// The first ingredient of each GT recipe is one no other recipe of its type starts with (GTM's lookup prefix rule, lv/multis.js).
// var + function inside every callback (this Rhino throws "redeclaration of var" for const/let in functions that run more than once).
(function () {
  const G = global.grindless
  const IVF = G.ivFoundation || (G.ivFoundation = {})
  const LV = G.lv || (G.lv = {})
  const HV = G.hv || (G.hv = {})
  const MOON = G.moon || (G.moon = {})
  const MARS = G.mars || (G.mars = {})
  const LOG = '[grindless/iv] '
  const PROBE = 'grindless:empty_vein_probe'
  const MERCURY_STONES = ['gcyr:mercury_cobblestone', 'gcyr:mercury_rock']
  const FLUORITE_VEIN = 'fluorite'
  const OVERWORLD_DIMENSIONS = ['minecraft:overworld', 'grindless:flat']

  // the ore block prefix of each table's stone: GCYR's planet prefixes, GTM's endstone one
  const TABLES = [
    { name: 'veins_venus', prefix: 'venus' },
    { name: 'veins_mercury', prefix: 'mercury' },
    { name: 'veins_leach', prefix: 'endstone' }
  ]

  function pathOf(id) {
    return id.substring(id.indexOf(':') + 1)
  }

  IVF.recipes = {
    heavyWaterElectrolysis: 'grindless:electrolyzer/heavy_water_electrolysis',
    zircaloyMixer: 'grindless:mixer/zircaloy',
    zircaloyBlast: 'gtceu:electric_blast_furnace/blast_zircaloy',
    zircaloyBlastGas: 'gtceu:electric_blast_furnace/blast_zircaloy_gas',
    zircaloyCooling: 'gtceu:vacuum_freezer/cool_hot_zircaloy_ingot',
    ionExchangeResin: 'grindless:chemical_reactor/ion_exchange_resin',
    platinumGauze: 'grindless:assembler/platinum_gauze',
    hermeanRegolith: MERCURY_STONES.map(function (id) { return 'grindless:macerator/hermean_regolith_from_' + pathOf(id) }),
    radiationProofCasing: 'gtceu:assembler/radiation_proof_machine_casing',
    samples: []
  }

  // ---------------------------------------------------------------- the vein tables (same maths as the Earth, Moon and Mars ones)

  // every vein of the pack that has a sample and is not one of these tables (called when the recipes load: every table is there)
  function otherVeins() {
    var earth = typeof HV.allVeins === 'function' ? HV.allVeins() : LV.allVeins()
    var moon = typeof MOON.lunarVeins === 'function' ? MOON.lunarVeins() : []
    var mars = typeof MARS.martianVeins === 'function' ? MARS.martianVeins() : []
    return earth.concat(moon).concat(mars)
  }

  var normalized = null
  function allTables() {
    if (normalized === null) {
      var tools = LV.veinTools
      var taken = {}
      otherVeins().forEach(function (v) { taken[tools.pairKey(v.samplePair[0], v.samplePair[1])] = v.id })
      normalized = {}
      TABLES.forEach(function (t) {
        var table = G.tables[t.name]
        normalized[t.name] = table.veins.map(function (vein) {
          var ores = tools.oresOf(vein)
          var pair = tools.samplePairOf(ores, taken)
          taken[tools.pairKey(pair[0], pair[1])] = vein.id
          return {
            id: vein.id,
            kind: vein.kind,
            gtm: vein.gtm,
            layer: vein.layer,
            color: vein.color,
            dimension: table.dimension,
            sample: 'grindless:vein_sample_' + vein.id,
            ores: ores,
            volatiles: [],
            samplePair: pair,
            stone: vein.stone,
            minY: vein.minY,
            maxY: vein.maxY,
            spawnWeight: vein.spawnWeight,
            prefix: t.prefix
          }
        })
      })
    }
    return normalized
  }

  IVF.venusVeins = function () { return allTables().veins_venus }
  IVF.mercuryVeins = function () { return allTables().veins_mercury }
  IVF.leachVeins = function () { return allTables().veins_leach }

  // problems of the three tables and of the fluorite entry (empty list = fine); also used by the test
  IVF.checkTables = function () {
    var tools = LV.veinTools
    var problems = []
    var ids = {}
    var pairs = {}
    otherVeins().forEach(function (v) {
      ids[v.id] = true
      pairs[tools.pairKey(v.samplePair[0], v.samplePair[1])] = v.id
    })
    var wanted = { veins_venus: IVF.dimensions.venus, veins_mercury: IVF.dimensions.mercury, veins_leach: IVF.dimensions.end }
    TABLES.forEach(function (t) {
      var table = G.tables[t.name]
      if (table.dimension !== wanted[t.name]) problems.push(t.name + ': dimension is ' + table.dimension)
      allTables()[t.name].forEach(function (v) {
        if (ids[v.id]) problems.push(t.name + ' vein id ' + v.id + ' is already a vein of another table')
        ids[v.id] = true
        if (v.kind !== 'ore') problems.push(v.id + ': kind ' + v.kind)
        if (v.layer !== t.prefix) problems.push(v.id + ': layer ' + v.layer)
        var total = v.ores.reduce(function (s, o) { return s + o.share }, 0)
        if (Math.abs(total - 1) > 1e-9) problems.push(v.id + ': shares add up to ' + total)
        v.ores.forEach(function (o) {
          if (!Item.exists(o.item)) problems.push(v.id + ': raw ore item ' + o.item + ' does not exist')
          var ore = 'gtceu:' + t.prefix + '_' + o.material + '_ore'
          if (!Item.exists(ore)) problems.push(v.id + ': no ' + t.prefix + ' ore block ' + ore)
        })
        if (!Item.exists(v.stone)) problems.push(v.id + ': stone ' + v.stone + ' does not exist')
        var key = tools.pairKey(v.samplePair[0], v.samplePair[1])
        if (pairs[key]) problems.push('sample recipe of ' + v.id + ' is the same as the one of ' + pairs[key] + ' (' + key + ')')
        pairs[key] = v.id
        if (!Item.exists(v.sample)) problems.push(v.id + ': sample item ' + v.sample + ' is not registered (startup table out of sync?)')
      })
    })
    var fluorite = fluoriteEntry()
    if (fluorite === null) problems.push('veins_overworld_extra.json has no ' + FLUORITE_VEIN + ' entry')
    else if (!LV.extraVeins().some(function (v) { return v.id === FLUORITE_VEIN })) problems.push('the fluorite vein is not one of the extra Overworld veins')
    if (!Item.exists(PROBE)) problems.push('the empty vein probe ' + PROBE + ' does not exist')
    return problems
  }

  function fluoriteEntry() {
    var list = (G.tables.veins_overworld_extra && G.tables.veins_overworld_extra.veins) || []
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === FLUORITE_VEIN) return list[i]
    }
    return null
  }

  // ---------------------------------------------------------------- recipes

  function missingItems(ids) {
    return ids.filter(function (id) { return !Item.exists(id) })
  }

  function missingFluids(ids) {
    return ids.filter(function (id) { return !Fluid.exists(id) })
  }

  // one thrown error would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    try {
      addRecipes(event)
    } catch (e) {
      console.error(LOG + 'foundation recipes failed: ' + e)
    }
    try {
      addSamples(event)
    } catch (e) {
      console.error(LOG + 'vein sample recipes failed: ' + e)
    }
  })

  function addRecipes(event) {
    var ids = IVF.ids
    var added = []

    // ---- heavy water -> deuterium + oxygen
    var waterFluids = missingFluids([ids.heavyWater, 'gtceu:deuterium', 'gtceu:oxygen'])
    if (waterFluids.length > 0) {
      console.error(LOG + 'heavy water electrolysis skipped, unknown fluid(s): ' + waterFluids.join(', '))
    } else {
      event.recipes.gtceu.electrolyzer('grindless:heavy_water_electrolysis')
        .inputFluids(Fluid.of(ids.heavyWater, 1000))
        .outputFluids(Fluid.of('gtceu:deuterium', 2000), Fluid.of('gtceu:oxygen', 1000))
        .EUt(30).duration(1500)
      added.push('heavy water electrolysis')
    }

    // ---- zircaloy dust (GTM's material handlers make the EBF and vacuum freezer steps)
    var zircaloyItems = missingItems(['gtceu:zirconium_dust', 'gtceu:tin_dust', ids.zircaloyDust])
    if (zircaloyItems.length > 0) {
      console.error(LOG + 'zircaloy mixer skipped, unknown item(s): ' + zircaloyItems.join(', '))
    } else {
      event.recipes.gtceu.mixer('grindless:zircaloy')
        .itemInputs('63x gtceu:zirconium_dust', '1x gtceu:tin_dust')
        .itemOutputs('64x ' + ids.zircaloyDust)
        .EUt(1920).duration(400)
      added.push('zircaloy')
    }

    // ---- the leach field's ion-exchange resin
    var resinFluids = missingFluids(['gtceu:styrene', 'gtceu:sulfuric_acid', 'gtceu:diluted_sulfuric_acid'])
    if (resinFluids.length > 0 || !Item.exists(ids.ionExchangeResin)) {
      console.error(LOG + 'ion exchange resin skipped, unknown fluid(s) or item: ' + resinFluids.concat(Item.exists(ids.ionExchangeResin) ? [] : [ids.ionExchangeResin]).join(', '))
    } else {
      event.recipes.gtceu.chemical_reactor('grindless:ion_exchange_resin')
        .inputFluids(Fluid.of('gtceu:styrene', 1000), Fluid.of('gtceu:sulfuric_acid', 1000))
        .itemOutputs('4x ' + ids.ionExchangeResin)
        .outputFluids(Fluid.of('gtceu:diluted_sulfuric_acid', 1000))
        .EUt(480).duration(400)
      added.push('ion exchange resin')
    }

    // ---- the acid works' platinum gauze
    var gauzeItems = missingItems(['gtceu:fine_platinum_wire', 'gtceu:fine_rhodium_wire', ids.platinumGauze])
    if (gauzeItems.length > 0) {
      console.error(LOG + 'platinum gauze skipped, unknown item(s): ' + gauzeItems.join(', '))
    } else {
      event.recipes.gtceu.assembler('grindless:platinum_gauze')
        .itemInputs('16x gtceu:fine_platinum_wire', '2x gtceu:fine_rhodium_wire')
        .itemOutputs(ids.platinumGauze)
        .EUt(1920).duration(200)
      added.push('platinum gauze')
    }

    // ---- Hermean regolith dust from Mercury's ground
    if (!Item.exists(ids.hermeanRegolithDust)) {
      console.error(LOG + 'Hermean regolith recipes skipped, unknown item ' + ids.hermeanRegolithDust)
    } else {
      MERCURY_STONES.forEach(function (block) {
        if (!Item.exists(block)) {
          console.error(LOG + 'Hermean regolith from ' + block + ' skipped: unknown item')
          return
        }
        event.recipes.gtceu.macerator('grindless:hermean_regolith_from_' + pathOf(block))
          .itemInputs(block)
          .itemOutputs(ids.hermeanRegolithDust)
          .EUt(2).duration(98)
      })
      added.push('Hermean regolith x' + MERCURY_STONES.length)
    }

    console.info(LOG + 'foundation recipes: ' + added.join(', '))
  }

  function addSamples(event) {
    IVF.checkTables().forEach(function (problem) {
      console.error(LOG + 'IV vein tables: ' + problem)
    })
    var made = []
    var pairs = []
    TABLES.forEach(function (t) {
      allTables()[t.name].forEach(function (vein) {
        var id = 'grindless:crafting/vein_sample/' + vein.id
        event.shapeless(vein.sample, [PROBE, vein.samplePair[0], vein.samplePair[1]]).id(id)
        made.push(id)
        pairs.push(vein.id + ' = ' + vein.samplePair.join(' + '))
      })
    })
    IVF.recipes.samples = made
    console.info(LOG + 'vein samples: ' + made.length + ' recipes (' + pairs.join('; ') + ')')
  }

  // ---------------------------------------------------------------- world generation

  function material(name) {
    var m = GTMaterials.get(name)
    if (m == null || m.isNull()) throw new Error('unknown GT material ' + name)
    return m
  }

  // the dimension ids of a vein's filter (GTM fills it from the layer when a vein only names its layer)
  function dimensionsOf(def) {
    var out = []
    var set = def.dimensionFilter()
    if (set == null) return out
    var it = set.iterator()
    while (it.hasNext()) out.push(String(it.next().location()))
    return out
  }

  // GTOreDefinition#dimensions(ResourceLocation...): the strings one by one, so Rhino converts each of them
  function setDimensions(def, dims) {
    if (dims.length === 1) def.dimensions(dims[0])
    else if (dims.length === 2) def.dimensions(dims[0], dims[1])
    else throw new Error('unexpected dimension list ' + dims.join(', '))
  }

  function addVein(event, vein, gtm, dimensions) {
    event.add(gtm, function (def) {
      def.weight(vein.spawnWeight)
      def.clusterSize(vein.clusterSize)
      def.density(vein.density)
      // the layer first: the layer pattern reads its target block
      def.layer(vein.layer)
      setDimensions(def, dimensions)
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
  }

  function changeVeins(event) {
    var report = { removed: [], added: [], mixed: [] }
    var planets = [IVF.dimensions.venus, IVF.dimensions.mercury]

    // every vein of another mod that would generate only on Venus or only on Mercury
    event.removeAll(function (id, def) {
      if (String(id.getNamespace()) === 'grindless') return false
      var dims = dimensionsOf(def)
      var onPlanet = dims.filter(function (d) { return planets.indexOf(d) >= 0 })
      if (onPlanet.length === 0) return false
      if (onPlanet.length < dims.length) {
        report.mixed.push(String(id))
        return false
      }
      report.removed.push(String(id))
      return true
    })

    ;[G.tables.veins_venus, G.tables.veins_mercury].forEach(function (table) {
      table.veins.forEach(function (vein) {
        addVein(event, vein, vein.gtm, [table.dimension])
        report.added.push(vein.gtm)
      })
    })

    var fluorite = fluoriteEntry()
    if (fluorite === null) {
      console.error(LOG + 'fluorite vein not added: veins_overworld_extra.json has no ' + FLUORITE_VEIN + ' entry')
    } else {
      addVein(event, fluorite, fluorite.gtm, OVERWORLD_DIMENSIONS)
      report.added.push(fluorite.gtm)
    }

    IVF.worldgen = report
    console.info(LOG + 'ore veins: added ' + report.added.join(', ') + '; removed ' + (report.removed.join(', ') || 'none (GCYR\'s go in moon/worldgen.js)'))
    if (report.mixed.length > 0) {
      console.warn(LOG + 'veins that generate on Venus or Mercury and in other dimensions too, left as they are: ' + report.mixed.join(', '))
    }
  }

  GTCEuServerEvents.oreVeins(function (event) {
    try {
      changeVeins(event)
    } catch (e) {
      console.error(LOG + 'IV ore vein changes failed: ' + e)
    }
  })
})()
