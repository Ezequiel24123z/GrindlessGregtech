// -----------------------------------------------------------------------------------------------
// Earth ore byproducts without titanium (DECISIONS.md 2026-10-24: titanium comes only from the Moon) or uraninite (2026-10-25:
// radioactives wait for IV). GTM's aluminium ore gave ilmenite and rutile, its bauxite gave rutile and its thorium (the Nether's
// beryllium vein) gave uraninite (common/data/materials/MaterialFlagAddition.java); data/grindless/tables/offworld_only.json
// ("byproducts") says what they give instead. GTM builds every ore-processing recipe of a material from these lists
// when the server loads (macerator, ore washer, thermal centrifuge, chemical bath, sifter) and the MV Ore Plant reads those
// recipes, so the change reaches all of them from here.
// GTCEuStartupEvents.materialModification runs after GTM's own materials and after every addon's MaterialEvent, so nothing
// overwrites it later.
(function () {
  const G = global.grindless

  GTCEuStartupEvents.materialModification(function (event) {
    var table = G.readJsonTable('kubejs/data/grindless/tables/offworld_only.json')
    var List = Java.loadClass('java.util.ArrayList')
    var changed = []
    Object.keys(table.byproducts).forEach(function (name) {
      var material = GTMaterials.get(name)
      if (material == null || material.isNull()) {
        console.error('[grindless/moon] byproducts: unknown material ' + name)
        return
      }
      var ore = material.getProperty(PropertyKey.ORE)
      if (ore == null) {
        console.error('[grindless/moon] byproducts: ' + name + ' has no ore property')
        return
      }
      var list = new List()
      var ok = true
      table.byproducts[name].forEach(function (b) {
        var m = GTMaterials.get(b)
        if (m == null || m.isNull()) {
          console.error('[grindless/moon] byproducts of ' + name + ': unknown material ' + b)
          ok = false
          return
        }
        list.add(m)
      })
      if (!ok) return
      // the Collection overload: Rhino cannot choose between it and the Material... one for a Java list
      ore['setOreByProducts(java.util.Collection)'](list)
      changed.push(name + ' -> ' + table.byproducts[name].join(', '))
    })
    console.info('[grindless/moon] Earth ore byproducts (no titanium, no uraninite): ' + changed.join('; '))
  })
})()
