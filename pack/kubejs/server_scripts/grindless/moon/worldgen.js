// priority: -20424
// -----------------------------------------------------------------------------------------------
// Ore veins of the Moon and the End (GTCEuServerEvents.oreVeins; it only changes chunks generated from now on):
//
//   GCYR's own veins (12: Moon bauxite, Mars, Venus, Mercury) are removed. They were Earth materials (the Moon one even had ilmenite
//   and aluminium); our drills are the only source of what a planet gives, and every planet gets its own veins when its era comes.
//   The 'ore' veins of data/grindless/tables/veins_moon.json are added to the Moon (gcyr:luna, GCYR's 'moon' layer: they replace its
//   moon stone), so the first visit finds the raw ores of the lunar samples (raw ilmenite and raw olivine).
//   GTM's End bauxite vein loses its ilmenite layer (the same pattern otherwise: end stone 2, bauxite 2, aluminium 1) and the veins
//   that data/grindless/tables/veins_excluded.json marks removeFromWorld (scheelite, gone to Mars) stop generating: titanium and
//   tungsten do not come from Earth.
//
// The event can run more than once per server session (GTM re-registers): var + function only.
(function () {
  const G = global.grindless
  const LOG = '[grindless/moon] '

  function material(name) {
    var m = GTMaterials.get(name)
    if (m == null || m.isNull()) throw new Error('unknown GT material ' + name)
    return m
  }

  function addLunarVein(event, vein, dimension) {
    event.add(vein.gtm, function (def) {
      def.weight(vein.spawnWeight)
      def.clusterSize(vein.clusterSize)
      def.density(vein.density)
      // the layer first: the layer pattern reads its target block (moon stone)
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
    var report = { removed: [], added: [], changed: [] }

    // GCYR's veins: every id of its namespace
    var gcyr = []
    event.removeAll(function (id, vein) {
      var isGcyr = String(id.getNamespace()) === 'gcyr'
      if (isGcyr) gcyr.push(String(id))
      return isGcyr
    })
    report.removed = report.removed.concat(gcyr)

    var moon = G.tables.veins_moon
    moon.veins.forEach(function (vein) {
      if (vein.kind !== 'ore') return
      addLunarVein(event, vein, moon.dimension)
      report.added.push(vein.gtm)
    })

    // the End bauxite vein without ilmenite
    event.modify('gtceu:bauxite_vein_end', function (def) {
      def.layeredVeinGenerator(function (generator) {
        generator.buildLayerPattern(function (pattern) {
          pattern.layer(function (l) { l.weight(2).block(function () { return Block.getBlock('minecraft:end_stone') }).size(1, 6) })
          pattern.layer(function (l) { l.weight(2).mat(material('bauxite')).size(1, 4) })
          pattern.layer(function (l) { l.weight(1).mat(material('aluminium')).size(1, 1) })
        })
      })
    })
    report.changed.push('gtceu:bauxite_vein_end')

    ;(G.readJsonTable('kubejs/data/grindless/tables/veins_excluded.json').veins || []).forEach(function (vein) {
      if (vein.removeFromWorld !== true) return
      event.remove(vein.id)
      report.removed.push(vein.id)
    })

    G.moon = G.moon || {}
    G.moon.worldgen = report
    console.info(LOG + 'ore veins: removed ' + report.removed.join(', ') + '; added ' + report.added.join(', ') + '; changed ' + report.changed.join(', '))
  }

  GTCEuServerEvents.oreVeins(function (event) {
    try {
      changeVeins(event)
    } catch (e) {
      console.error(LOG + 'ore vein changes failed: ' + e)
    }
  })
})()
