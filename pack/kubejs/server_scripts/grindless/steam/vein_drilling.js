// -----------------------------------------------------------------------------------------------
// gtceu:vein_drilling recipes of the Steam Vein Drill, generated from the vein table
// (kubejs/data/grindless/tables/veins.json via global.grindless.veinTable()).
//
// Per vein and per drill bit (bronze, steel; deep veins - maxY < 0 - only take the steel bit):
//   inputs   the vein sample              NOT consumed (it selects the vein)
//            the drill bit                consumed by CHANCE: bronze 10 %, steel 4 % of the runs
//            (no water: a fluid hatch cannot be made without electricity in GTM 7.5.3, see recipe_types.js)
//   outputs  the raw ores of the vein in the proportion of the GTM weights, 2.5 per run with the bronze bit and
//            3.75 with the steel bit, as whole items + one chanced item for the remainder
//            1 inert stone per run (cobblestone, cobbled deepslate in deepslate veins): free to void
//   200 ticks, 8 EU/t. The steam multiblock runs up to 4 in parallel (x1.5 duration): ~40 ores/min bronze,
//   ~60 ores/min steel and ~57 mB/t of steam.
//
// GTM notes verified in source: a recipe needs EVERY chanced content to be present to start; a chanced input is
// consumed with its chance per parallel run; chanced contents are not multiplied by the parallels but GTM rolls
// them once per run. With 4 parallels the totals are almost deterministic.
(function () {
  const G = global.grindless

  // wear: chance out of 10000 that the bit is used up in one run; perRun: raw ores per run
  const BITS = {
    bronze: { item: 'grindless:bronze_drill_bit', wear: 1000, perRun: 2.5 },
    steel: { item: 'grindless:steel_drill_bit', wear: 400, perRun: 3.75 }
  }
  const DURATION = 200
  const EUT = 8

  // expected amount per run -> whole items + one chanced item for the fraction
  function addOre(recipe, item, expected) {
    var whole = Math.floor(expected + 1e-9)
    var chance = Math.round((expected - whole) * 10000)
    if (whole > 0) recipe.itemOutputs(whole + 'x ' + item)
    if (chance >= 1) recipe.chancedOutput('1x ' + item, Math.min(chance, 9999), 0)
  }

  ServerEvents.recipes(function (event) {
    G.checkVeinTable().forEach(function (problem) {
      console.error('[grindless/steam] vein table: ' + problem)
    })

    var count = 0
    G.veinTable().forEach(function (vein) {
      Object.keys(BITS).forEach(function (kind) {
        if (kind === 'bronze' && vein.steelOnly) return
        var bit = BITS[kind]
        var recipe = event.recipes.gtceu.vein_drilling('grindless:' + vein.id + '_' + kind)
          .notConsumable(vein.sample)
          .chancedInput(bit.item, bit.wear, 0)
          .itemOutputs('1x ' + vein.stone)
        vein.ores.forEach(function (ore) {
          if (Item.exists(ore.item)) addOre(recipe, ore.item, ore.share * bit.perRun)
        })
        recipe.EUt(EUT).duration(DURATION)
        count++
      })
    })
    console.info('[grindless/steam] vein_drilling recipes: ' + count)
  })
})()
