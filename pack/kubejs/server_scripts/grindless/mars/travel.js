// -----------------------------------------------------------------------------------------------
// Mars, end of EV (docs/eras/ev.md, "Mars, end of EV"): the Mars vein table on the server.
//
//   world generation   GTCEuServerEvents.oreVeins (it only changes chunks generated from now on): the three veins of
//                      data/grindless/tables/veins_mars.json are added to Mars (gcyr:mars, GCYR's 'mars' layer: they replace its Martian
//                      rock), so the first visit finds them: scheelite (tungsten), merrillite (rare earths) and deuterium-rich ice. Only
//                      they generate there. GCYR's six Mars veins (tungstate, iron, nickel, copper, zinc, and monazite, molybdenite,
//                      bastnasite and neodymium) are Earth materials: this file takes out every vein, of any mod, that would generate
//                      only on Mars (scripts load in path order, so it runs before moon/worldgen.js, which then takes out the remaining
//                      GCYR veins of the Moon, Venus and Mercury). A vein that generates on Mars and in other dimensions too is left
//                      alone and logged (there is none in this pack).
//   vein samples       crafting table: empty vein probe + the two most common raw ores of the vein, the ones the first visit brings
//                      back by hand (the pair is unique among every vein of the pack). Recipe ids grindless:crafting/vein_sample/<vein>.
//                      The samples select the vein in the EV tripod (gtceu:ev_vein_drill), which reads the same table.
//
// Published for the EV tripod and the test: global.grindless.mars.martianVeins() (normalized like global.grindless.moon.lunarVeins():
// ores with their shares, the sample pair, the stone, the depth), .checkTables(), .worldgen (what the vein event did) and .samples.
// The event can run more than once per server session (GTM re-registers): var + function only.
(function () {
  const G = global.grindless
  const LV = G.lv || (G.lv = {})
  const HV = G.hv || (G.hv = {})
  const MOON = G.moon || (G.moon = {})
  const MARS = G.mars || (G.mars = {})
  const LOG = '[grindless/mars] '
  const PROBE = 'grindless:empty_vein_probe'

  // ---------------------------------------------------------------- the Mars table (same maths as the Earth and Moon ones)

  // every vein of the pack that has a sample, Earth first, then the Moon (called when the recipes load: every table is there by then)
  function otherVeins() {
    var earth = typeof HV.allVeins === 'function' ? HV.allVeins() : LV.allVeins()
    var moon = typeof MOON.lunarVeins === 'function' ? MOON.lunarVeins() : []
    return earth.concat(moon)
  }

  var martian = null
  MARS.martianVeins = function () {
    if (martian === null) {
      var tools = LV.veinTools
      var taken = {}
      otherVeins().forEach(function (v) { taken[tools.pairKey(v.samplePair[0], v.samplePair[1])] = v.id })
      var table = G.tables.veins_mars
      martian = table.veins.map(function (vein) {
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
          spawnWeight: vein.spawnWeight
        }
      })
    }
    return martian
  }

  // problems of the Mars table (empty list = fine); also used by the test
  MARS.checkTables = function () {
    var tools = LV.veinTools
    var problems = []
    var ids = {}
    var pairs = {}
    otherVeins().forEach(function (v) {
      ids[v.id] = true
      pairs[tools.pairKey(v.samplePair[0], v.samplePair[1])] = v.id
    })
    var table = G.tables.veins_mars
    if (table.dimension !== 'gcyr:mars') problems.push('dimension is ' + table.dimension)
    MARS.martianVeins().forEach(function (v) {
      if (ids[v.id]) problems.push('Mars vein id ' + v.id + ' is already a vein of another table')
      ids[v.id] = true
      if (v.kind !== 'ore') problems.push(v.id + ': kind ' + v.kind + ' (Mars only has ore veins)')
      if (v.layer !== 'mars') problems.push(v.id + ': layer ' + v.layer)
      var total = v.ores.reduce(function (s, o) { return s + o.share }, 0)
      if (Math.abs(total - 1) > 1e-9) problems.push(v.id + ': shares add up to ' + total)
      v.ores.forEach(function (o) {
        if (!Item.exists(o.item)) problems.push(v.id + ': raw ore item ' + o.item + ' does not exist')
        var ore = 'gtceu:mars_' + o.material + '_ore'
        if (!Item.exists(ore)) problems.push(v.id + ': no Mars ore block ' + ore)
      })
      if (!Item.exists(v.stone)) problems.push(v.id + ': stone ' + v.stone + ' does not exist')
      var key = tools.pairKey(v.samplePair[0], v.samplePair[1])
      if (pairs[key]) problems.push('sample recipe of ' + v.id + ' is the same as the one of ' + pairs[key] + ' (' + key + ')')
      pairs[key] = v.id
      if (!Item.exists(v.sample)) problems.push(v.id + ': sample item ' + v.sample + ' is not registered (startup table out of sync?)')
    })
    if (!Item.exists(PROBE)) problems.push('the empty vein probe ' + PROBE + ' does not exist')
    return problems
  }

  // ---------------------------------------------------------------- sample recipes

  ServerEvents.recipes(function (event) {
    try {
      MARS.checkTables().forEach(function (problem) {
        console.error(LOG + 'Mars vein table: ' + problem)
      })
      var made = []
      MARS.martianVeins().forEach(function (vein) {
        var id = 'grindless:crafting/vein_sample/' + vein.id
        event.shapeless(vein.sample, [PROBE, vein.samplePair[0], vein.samplePair[1]]).id(id)
        made.push(id)
      })
      MARS.samples = made
      console.info(LOG + 'Mars vein samples: ' + made.length + ' recipes (' + MARS.martianVeins().map(function (v) {
        return v.id + ' = ' + v.samplePair.join(' + ')
      }).join('; ') + ')')
    } catch (e) {
      console.error(LOG + 'Mars sample recipes failed: ' + e)
    }
  })

  // ---------------------------------------------------------------- world generation

  function material(name) {
    var m = GTMaterials.get(name)
    if (m == null || m.isNull()) throw new Error('unknown GT material ' + name)
    return m
  }

  // the dimension ids of a vein's filter (GTM fills it from the layer when a vein only names its layer, as GCYR's do)
  function dimensionsOf(def) {
    var out = []
    var set = def.dimensionFilter()
    if (set == null) return out
    var it = set.iterator()
    while (it.hasNext()) out.push(String(it.next().location()))
    return out
  }

  function addMartianVein(event, vein, dimension) {
    event.add(vein.gtm, function (def) {
      def.weight(vein.spawnWeight)
      def.clusterSize(vein.clusterSize)
      def.density(vein.density)
      // the layer first: the layer pattern reads its target block (Martian rock)
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
  }

  function changeVeins(event) {
    var table = G.tables.veins_mars
    var report = { removed: [], added: [], mixed: [] }

    // every vein that would generate only on Mars: GCYR's six (this handler runs before moon/worldgen.js) or any other mod's
    event.removeAll(function (id, def) {
      if (String(id.getNamespace()) === 'grindless') return false
      var dims = dimensionsOf(def)
      if (dims.indexOf(table.dimension) < 0) return false
      if (dims.length > 1) {
        report.mixed.push(String(id))
        return false
      }
      report.removed.push(String(id))
      return true
    })

    table.veins.forEach(function (vein) {
      addMartianVein(event, vein, table.dimension)
      report.added.push(vein.gtm)
    })

    MARS.worldgen = report
    console.info(LOG + 'Mars ore veins: added ' + report.added.join(', ') + '; removed ' + (report.removed.join(', ') || 'none (GCYR\'s were already gone)'))
    if (report.mixed.length > 0) {
      console.warn(LOG + 'veins that generate on Mars and in other dimensions too, left as they are: ' + report.mixed.join(', '))
    }
  }

  GTCEuServerEvents.oreVeins(function (event) {
    try {
      changeVeins(event)
    } catch (e) {
      console.error(LOG + 'Mars ore vein changes failed: ' + e)
    }
  })
})()
