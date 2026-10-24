// -----------------------------------------------------------------------------------------------
// gtceu:vein_drilling recipes of the MV Vein Drill (gtceu:mv_vein_drill) for the VANADIUM STEEL drill bit
// (grindless:vanadium_steel_drill_bit, listed with mv: true in the BITS table of server_scripts/grindless/lv/vein_drilling.js).
// The MV drill also runs every steam recipe and every LV drilling-fluid recipe; the LV drill skips the ones made here
// (their ids are grindless:vein_drilling/mv/...).
//
//   without fluid   Overworld veins only (the Nether ones need drilling fluid in every tier): the steel bit's yield, 3.75 raw
//                   ores per run, wear 1 % per run (steel: 4 %)
//   with fluid      every vein, Overworld and Nether: +50 % ore (5.625 per run) and wear 0.5 % per run (steel: 2 %), 50 mB of
//                   drilling fluid per run
//   Deep veins (maxY < 0) take it too: it is a steel bit that wears out slower. 200 ticks and 8 EU/t per run, like every
//   drilling recipe; the MV drill runs up to 16 at once.
//
// Lookup note (GTM's RecipeDB, see lv/vein_drilling.js): the steam recipes list [sample, bit], the LV fluid ones [bit, sample,
// fluid]. Here the base recipes use [sample, vanadium bit] (a new leaf next to the bronze and steel ones) and the fluid ones
// [vanadium bit, sample, fluid], so no ingredient list is a prefix of another.
(function () {
  const G = global.grindless
  const LV = G.lv || (G.lv = {})
  const MV = G.mv || (G.mv = {})

  // expected amount per run -> whole items + one chanced item for the fraction
  function addOre(recipe, item, expected) {
    var whole = Math.floor(expected + 1e-9)
    var chance = Math.round((expected - whole) * 10000)
    if (whole > 0) recipe.itemOutputs(whole + 'x ' + item)
    if (chance >= 1) recipe.chancedOutput('1x ' + item, Math.min(chance, 9999), 0)
  }

  ServerEvents.recipes(function (event) {
    var drilling = LV.drilling
    var bit = drilling && drilling.bits ? drilling.bits.vanadium_steel : null
    if (!bit) {
      console.error('[grindless/mv] vein_drilling: the vanadium steel bit is missing from the BITS table of lv/vein_drilling.js')
      return
    }
    if (!Item.exists(bit.item)) {
      console.error('[grindless/mv] vein_drilling recipes skipped, unknown item ' + bit.item)
      return
    }

    var base = 0
    var fluid = 0
    LV.allVeins().forEach(function (vein) {
      if (!vein.nether) {
        var plain = event.recipes.gtceu.vein_drilling('grindless:mv/' + vein.id + '_vanadium_steel')
          .notConsumable(vein.sample)
          .chancedInput(bit.item, bit.baseWear, 0)
          .itemOutputs('1x ' + vein.stone)
        vein.ores.forEach(function (ore) {
          if (Item.exists(ore.item)) addOre(plain, ore.item, ore.share * bit.basePerRun)
        })
        plain.EUt(drilling.eut).duration(drilling.duration)
        base++
      }

      var wet = event.recipes.gtceu.vein_drilling('grindless:mv/' + vein.id + '_vanadium_steel_fluid')
        .chancedInput(bit.item, bit.wear, 0)
        .notConsumable(vein.sample)
        .inputFluids(Fluid.of(drilling.fluid, drilling.fluidMb))
        .itemOutputs('1x ' + vein.stone)
      vein.ores.forEach(function (ore) {
        if (Item.exists(ore.item)) addOre(wet, ore.item, ore.share * bit.perRun)
      })
      wet.EUt(drilling.eut).duration(drilling.duration)
      fluid++
    })

    // published for the smoke test
    MV.drilling = { bit: bit.item, base: base, fluid: fluid, count: base + fluid }
    console.info('[grindless/mv] vein_drilling recipes with the vanadium steel bit: ' + base + ' without fluid, ' + fluid + ' with fluid')
  })
})()
