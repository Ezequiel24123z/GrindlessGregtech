// priority: -24
// -----------------------------------------------------------------------------------------------
// Vein data for recipes (server side). The canonical vein table is kubejs/data/grindless/tables/veins.json
// (GTM 7.5.3 Overworld veins, see that file for the format and the source); startup scripts load it into
// global.grindless.tables.veins (lib/tables.js) and the startup item script builds the vein samples from it.
// This file derives what recipes need from the very same object, so there is no second copy of the table:
//
//   global.grindless.veinTable()   normalized list of veins (memoized):
//     { id, gtm, layer, minY, maxY, spawnWeight, color,
//       steelOnly   true when maxY < 0 (deep veins only accept the steel drill bit),
//       stone       inert byproduct of the drill (cobblestone / cobbled deepslate),
//       sample      'grindless:vein_sample_<id>',
//       ores        [{ material, item, tag, share }] sorted by share (desc), shares add up to 1,
//       samplePair  [tag, tag] ingredient tags of the sample crafting recipe (the two most common ores) }
//   global.grindless.rawItem(material)   raw ore item id of a GTM material (vanilla raw iron/copper/gold included)
//   global.grindless.rawTag(material)    '#forge:raw_materials/<material>'
//   global.grindless.checkVeinTable()    returns a list of problems (empty = fine); also used by the test
//
// Electric drills of later tiers read the same list.
(function () {
  const G = global.grindless || (global.grindless = {})

  // GTM: rawOre.setIgnored(Iron|Copper|Gold, Items.RAW_*) - every other ore material has gtceu:raw_<name>
  const VANILLA_RAW = { iron: 'minecraft:raw_iron', copper: 'minecraft:raw_copper', gold: 'minecraft:raw_gold' }

  G.rawItem = function (material) {
    return VANILLA_RAW[material] || ('gtceu:raw_' + material)
  }

  G.rawTag = function (material) {
    return '#forge:raw_materials/' + material
  }

  // share of every material of a vein (adds up to 1). Veined veins: 'rare' materials appear with probability
  // rareChance, the rest shares the remainder by weight. Everything else: plain weights.
  function sharesOf(vein) {
    var rare = vein.materials.filter(function (m) { return m.rare })
    var common = vein.materials.filter(function (m) { return !m.rare })
    var rareChance = rare.length > 0 ? (vein.rareChance || 0) : 0
    var sum = function (list) { return list.reduce(function (s, m) { return s + m.weight }, 0) }
    var sumCommon = sum(common)
    var sumRare = sum(rare)
    var byMaterial = {}
    var order = []
    vein.materials.forEach(function (m) {
      var share = m.rare ? rareChance * m.weight / sumRare : (1 - rareChance) * m.weight / sumCommon
      if (byMaterial[m.id] === undefined) {
        byMaterial[m.id] = 0
        order.push(m.id)
      }
      byMaterial[m.id] += share
    })
    return order.map(function (id, index) { return { material: id, share: byMaterial[id], index: index } })
  }

  function normalize(vein) {
    var ores = sharesOf(vein)
      .sort(function (a, b) { return (b.share - a.share) || (a.index - b.index) })
      .map(function (o) {
        return { material: o.material, item: G.rawItem(o.material), tag: G.rawTag(o.material), share: o.share }
      })
    var pair = ores.length > 1 ? [ores[0].tag, ores[1].tag] : [ores[0].tag, ores[0].tag]
    return {
      id: vein.id,
      gtm: vein.gtm,
      layer: vein.layer,
      minY: vein.minY,
      maxY: vein.maxY,
      spawnWeight: vein.spawnWeight,
      color: vein.color,
      steelOnly: vein.maxY < 0,
      stone: vein.layer === 'deepslate' ? 'minecraft:cobbled_deepslate' : 'minecraft:cobblestone',
      sample: 'grindless:vein_sample_' + vein.id,
      ores: ores,
      samplePair: pair
    }
  }

  var cache = null
  G.veinTable = function () {
    if (cache === null) {
      cache = G.tables.veins.veins.map(normalize)
    }
    return cache
  }

  G.checkVeinTable = function () {
    var problems = []
    var ids = {}
    var pairs = {}
    G.veinTable().forEach(function (v) {
      if (ids[v.id]) problems.push('duplicate vein id ' + v.id)
      ids[v.id] = true
      var total = v.ores.reduce(function (s, o) { return s + o.share }, 0)
      if (Math.abs(total - 1) > 1e-9) problems.push(v.id + ': shares add up to ' + total)
      var key = v.samplePair.slice().sort().join(' + ')
      if (pairs[key]) problems.push('sample recipe of ' + v.id + ' is the same as the one of ' + pairs[key] + ' (' + key + ')')
      pairs[key] = v.id
      v.ores.forEach(function (o) {
        if (!Item.exists(o.item)) problems.push(v.id + ': raw ore item ' + o.item + ' does not exist')
      })
      if (!Item.exists(v.sample)) problems.push(v.id + ': sample item ' + v.sample + ' is not registered (startup table out of sync?)')
    })
    return problems
  }
})()
