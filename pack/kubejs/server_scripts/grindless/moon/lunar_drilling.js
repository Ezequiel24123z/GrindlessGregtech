// priority: -20124
// -----------------------------------------------------------------------------------------------
// gtceu:lunar_drilling recipes of the Lunar Drill (gtceu:lunar_drill, startup_scripts/grindless/moon/lunar_drill.js), generated from
// data/grindless/tables/veins_moon.json (global.grindless.tables.veins_moon, loaded by startup_scripts/grindless/moon/items.js).
// Every recipe carries .dimension('gcyr:luna'): the drill only works on the Moon (GTM's DimensionCondition, shown in EMI).
//
//   'ore' veins (ilmenite_moon)      the HV drill bit (the BITS entry of server_scripts/grindless/lv/vein_drilling.js marked hv: true),
//                                    dry drilling: there is no water on the Moon, so the numbers are the ones of that bit without
//                                    drilling fluid (3.75 raw ores per run split by the vein's shares, wear 0.5 % per run), plus the
//                                    inert stone of the vein (gcyr:moon_cobblestone). Recipe ids grindless:lunar_drilling/<vein>_<bit>.
//   'volatiles' veins (regolith_moon) the same bit and wear; no item comes out (the spent regolith goes back to the ground), the
//                                    volatiles of the table come out as fluids, and only by lunar day (GTM's daytime condition): the
//                                    solar wings heat the regolith. Recipe ids grindless:lunar_drilling/<vein>_<bit>.
//   8 EU/t and 200 ticks per run like every drilling recipe; the drill runs up to 32 at once (one HV energy hatch).
//
// Besides the recipes this file publishes global.grindless.moon.lunarVeins() (normalized: ores and sample pair like the Earth tables,
// the sample pair unique among ALL veins), .checkTables() and, for the smoke test, .drilling.
(function () {
  const G = global.grindless
  const LV = G.lv || (G.lv = {})
  const HV = G.hv || (G.hv = {})
  const MOON = G.moon || (G.moon = {})

  // ---------------------------------------------------------------- lunar table (same maths as the Earth ones)

  var lunar = null
  MOON.lunarVeins = function () {
    if (lunar === null) {
      var tools = LV.veinTools
      var taken = {}
      var earth = typeof HV.allVeins === 'function' ? HV.allVeins() : LV.allVeins()
      earth.forEach(function (v) { taken[tools.pairKey(v.samplePair[0], v.samplePair[1])] = v.id })
      var table = G.tables.veins_moon
      lunar = table.veins.map(function (vein) {
        var base = {
          id: vein.id,
          kind: vein.kind,
          gtm: vein.gtm || null,
          color: vein.color,
          dimension: table.dimension,
          sample: 'grindless:vein_sample_' + vein.id
        }
        if (vein.kind === 'volatiles') {
          base.ores = []
          base.volatiles = vein.volatiles.map(function (v) { return { fluid: v.fluid, mb: v.mb } })
          base.samplePair = vein.sampleBlocks.slice(0, 2)
          base.stone = null
        } else {
          var ores = tools.oresOf(vein)
          var pair = tools.samplePairOf(ores, taken)
          taken[tools.pairKey(pair[0], pair[1])] = vein.id
          base.ores = ores
          base.volatiles = []
          base.samplePair = pair
          base.stone = vein.stone
          base.minY = vein.minY
          base.maxY = vein.maxY
        }
        return base
      })
    }
    return lunar
  }

  // the HV bit of the BITS table (the stainless steel one; whatever its key is)
  MOON.lunarBit = function () {
    var bits = LV.drilling && LV.drilling.bits ? LV.drilling.bits : {}
    var keys = Object.keys(bits).filter(function (k) { return bits[k].hv === true })
    return keys.length === 1 ? { key: keys[0], bit: bits[keys[0]] } : null
  }

  // problems of the lunar table (empty list = fine); also used by the smoke test
  MOON.checkTables = function () {
    var tools = LV.veinTools
    var problems = []
    var ids = {}
    var pairs = {}
    var earth = typeof HV.allVeins === 'function' ? HV.allVeins() : LV.allVeins()
    earth.forEach(function (v) {
      ids[v.id] = true
      pairs[tools.pairKey(v.samplePair[0], v.samplePair[1])] = v.id
    })
    MOON.lunarVeins().forEach(function (v) {
      if (ids[v.id]) problems.push('lunar vein id ' + v.id + ' is already an Earth vein')
      ids[v.id] = true
      if (v.kind === 'volatiles') {
        if (v.volatiles.length === 0) problems.push(v.id + ': no volatiles')
        v.volatiles.forEach(function (f) {
          if (!Fluid.exists(f.fluid)) problems.push(v.id + ': fluid ' + f.fluid + ' does not exist')
        })
        v.samplePair.forEach(function (b) {
          if (!Item.exists(b)) problems.push(v.id + ': sample block ' + b + ' does not exist')
        })
      } else {
        var total = v.ores.reduce(function (s, o) { return s + o.share }, 0)
        if (Math.abs(total - 1) > 1e-9) problems.push(v.id + ': shares add up to ' + total)
        v.ores.forEach(function (o) {
          if (!Item.exists(o.item)) problems.push(v.id + ': raw ore item ' + o.item + ' does not exist')
        })
        if (!Item.exists(v.stone)) problems.push(v.id + ': stone ' + v.stone + ' does not exist')
      }
      var key = tools.pairKey(v.samplePair[0], v.samplePair[1])
      if (pairs[key]) problems.push('sample recipe of ' + v.id + ' is the same as the one of ' + pairs[key] + ' (' + key + ')')
      pairs[key] = v.id
      if (!Item.exists(v.sample)) problems.push(v.id + ': sample item ' + v.sample + ' is not registered (startup table out of sync?)')
    })
    if (MOON.lunarBit() === null) problems.push('the BITS table of lv/vein_drilling.js has no single HV bit (hv: true)')
    return problems
  }

  // ---------------------------------------------------------------- recipes

  // expected amount per run -> whole items + one chanced item for the fraction
  function addOre(recipe, item, expected) {
    var whole = Math.floor(expected + 1e-9)
    var chance = Math.round((expected - whole) * 10000)
    if (whole > 0) recipe.itemOutputs(whole + 'x ' + item)
    if (chance >= 1) recipe.chancedOutput('1x ' + item, Math.min(chance, 9999), 0)
  }

  ServerEvents.recipes(function (event) {
    MOON.checkTables().forEach(function (problem) {
      console.error('[grindless/moon] lunar vein table: ' + problem)
    })
    var hv = MOON.lunarBit()
    var drilling = LV.drilling
    if (hv === null || !drilling || !Item.exists(hv.bit.item)) {
      console.error('[grindless/moon] lunar_drilling recipes skipped: no HV drill bit in the BITS table')
      return
    }
    var dimension = G.tables.veins_moon.dimension

    var ore = 0
    var volatiles = 0
    MOON.lunarVeins().forEach(function (vein) {
      var recipe = event.recipes.gtceu.lunar_drilling('grindless:' + vein.id + '_' + hv.key)
        .notConsumable(vein.sample)
        .chancedInput(hv.bit.item, hv.bit.baseWear, 0)
      if (vein.kind === 'volatiles') {
        vein.volatiles.forEach(function (f) { recipe.outputFluids(Fluid.of(f.fluid, f.mb)) })
        recipe.daytime()
        volatiles++
      } else {
        recipe.itemOutputs('1x ' + vein.stone)
        vein.ores.forEach(function (o) {
          if (Item.exists(o.item)) addOre(recipe, o.item, o.share * hv.bit.basePerRun)
        })
        ore++
      }
      recipe.dimension(dimension)
      recipe.EUt(drilling.eut).duration(drilling.duration)
    })

    // published for the smoke test
    MOON.drilling = { bit: hv.bit.item, bitKey: hv.key, ore: ore, volatiles: volatiles, count: ore + volatiles, dimension: dimension }
    console.info('[grindless/moon] lunar_drilling recipes: ' + ore + ' ore, ' + volatiles + ' volatiles (bit ' + hv.bit.item + ', only in ' + dimension + ')')
  })
})()
