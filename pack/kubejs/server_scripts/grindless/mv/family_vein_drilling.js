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
//   with acid       every vein, Overworld, Nether and End (..._vanadium_steel_acid_fluid, the LEACHING variant): the same yield as the
//                   base recipe (3.75 per run, wear 1 %) plus one extra chance (5 %) of the vein's rarest ore, 50 mB of sulfuric
//                   acid per run (the sulfide roaster's acid). While acid is in the hatch the drill runs this one instead of the
//                   vanadium base recipe (startup_scripts/grindless/mv/family_multis.js).
//
// Lookup note (GTM's RecipeDB, see lv/vein_drilling.js): the steam recipes list [sample, bit], the LV fluid ones [bit, sample,
// fluid]. Here the base recipes use [sample, vanadium bit] (a new leaf next to the bronze and steel ones), the fluid ones
// [vanadium bit, sample, fluid] and the leaching ones [vanadium bit, sample, sulfuric acid], so no ingredient list is a prefix
// of another.
(function () {
  const G = global.grindless
  const LV = G.lv || (G.lv = {})
  const MV = G.mv || (G.mv = {})

  const ACID = 'gtceu:sulfuric_acid'
  const ACID_MB = 50
  // chance out of 10000 of one extra rarest ore per run (5 %)
  const LEACH_CHANCE = 500

  // expected amount per run -> whole items + one chanced item for the fraction
  function addOre(recipe, item, expected) {
    var whole = Math.floor(expected + 1e-9)
    var chance = Math.round((expected - whole) * 10000)
    if (whole > 0) recipe.itemOutputs(whole + 'x ' + item)
    if (chance >= 1) recipe.chancedOutput('1x ' + item, Math.min(chance, 9999), 0)
  }

  // the vein's rarest ore (lowest share) whose item exists, or null
  function rarestItemOf(vein) {
    var rarest = null
    vein.ores.forEach(function (ore) {
      if (!Item.exists(ore.item)) return
      if (rarest === null || ore.share < rarest.share) rarest = ore
    })
    return rarest === null ? null : rarest.item
  }

  // the leaching variant of one MV vein: the same yield as the base recipe plus one extra chance of the rarest ore
  function leachRecipe(event, vein, bit, drilling) {
    var leach = event.recipes.gtceu.vein_drilling('grindless:mv/' + vein.id + '_vanadium_steel_acid_fluid')
      .chancedInput(bit.item, bit.baseWear, 0)
      .notConsumable(vein.sample)
      .inputFluids(Fluid.of(ACID, ACID_MB))
      .itemOutputs('1x ' + vein.stone)
    vein.ores.forEach(function (ore) {
      if (Item.exists(ore.item)) addOre(leach, ore.item, ore.share * bit.basePerRun)
    })
    var rare = rarestItemOf(vein)
    if (rare !== null) leach.chancedOutput('1x ' + rare, LEACH_CHANCE, 0)
    leach.EUt(drilling.eut).duration(drilling.duration)
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
    var acidReady = Fluid.exists(ACID)
    if (!acidReady) console.error('[grindless/mv] vein_drilling leaching recipes skipped, unknown fluid ' + ACID)

    var base = 0
    var fluid = 0
    var acid = 0
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

      if (acidReady) {
        leachRecipe(event, vein, bit, drilling)
        acid++
      }
    })

    // the End veins are MV too: their vanadium steel fluid recipe comes from hv/family_vein_drilling.js, the leaching one from here
    if (acidReady && G.hv && typeof G.hv.endVeins === 'function') {
      G.hv.endVeins().forEach(function (vein) {
        leachRecipe(event, vein, bit, drilling)
        acid++
      })
    }

    // published for the smoke test
    MV.drilling = { bit: bit.item, base: base, fluid: fluid, acid: acid, count: base + fluid }
    console.info('[grindless/mv] vein_drilling recipes with the vanadium steel bit: ' + base + ' without fluid, ' + fluid +
      ' with fluid, ' + acid + ' with sulfuric acid')
  })
})()