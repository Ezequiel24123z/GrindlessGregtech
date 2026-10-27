// priority: -19424
// -----------------------------------------------------------------------------------------------
// gtceu:solar_steam recipes of the Heliostat Tower (gtceu:heliostat_tower), its mirror and its controller.
//
//   water            50 mB of water -> 8 000 mB of steam every 10 ticks = 800 mB/t, only by day (GTM's daytime condition; the
//                    machine's sun check also wants open sky over the tower and its field and no rain falling on it)
//   distilled_water  the same with the distilled water an LV steam turbine gives back (4 mB per 640 mB of steam = exactly the
//                    water a run needs): the water loop of a real power block can be closed
// 16 EU/t (half an LV amp) for the mirror drives and the feed pump. No overclock, no parallels: the field sets the output.
//
// Balance (docs/eras/lv.md): by day it gives what a Large Bronze Boiler gives at full fire (800 mB/t, GTM 7.5.3 default
// bronzeBoilerMaxTemperature, 12.5 LV turbines) with no fuel and no fuel line; at night and in the rain nothing, so over a whole
// Minecraft day it averages a bit less than half a boiler, and the night needs the day's steam stored in GTM multiblock tanks
// (a Steel Multiblock Tank holds 1 000 000 mB). It costs 28 silvered mirrors, the tower and the turbines.
//
// Water to steam is GTM's 1:160 (largeBoilers.steamPerWater, and the LV steam turbine's 640 mB of steam -> 4 mB of distilled water).
//
// The mirror (assembler, LV): a steel plate as backing, two silver foils for the silvering (silver: the galena vein, or the galena
// roast of the Sulfide Roaster), a glass pane and a small steel gear for the drive.
(function () {
  const G = global.grindless
  const LVC = G.lvContent || (G.lvContent = {})

  const MIRROR = 'grindless:heliostat_mirror'
  const STEAM_PER_RUN = 8000
  const WATER_PER_RUN = 50
  const DURATION = 10
  const EUT = 16

  // published for the smoke test
  LVC.heliostat = {
    mirror: MIRROR,
    steamPerRun: STEAM_PER_RUN,
    waterPerRun: WATER_PER_RUN,
    duration: DURATION,
    eut: EUT,
    recipes: ['grindless:solar_steam/water', 'grindless:solar_steam/distilled_water'],
    mirrorRecipe: 'grindless:assembler/heliostat_mirror',
    controllerRecipe: 'grindless:crafting/heliostat_tower'
  }

  const NEEDED_ITEMS = [MIRROR, 'gtceu:small_steel_gear', 'gtceu:silver_foil', 'minecraft:glass_pane', 'gtceu:lv_electric_motor',
    'gtceu:lv_electric_pump', 'gtceu:lv_machine_hull', 'gtceu:steel_firebox_casing']
  const NEEDED_FLUIDS = ['minecraft:water', 'gtceu:distilled_water', 'gtceu:steam']
  LVC.heliostat.neededItems = NEEDED_ITEMS
  LVC.heliostat.neededFluids = NEEDED_FLUIDS

  ServerEvents.recipes(function (event) {
    var missing = NEEDED_ITEMS.filter(function (id) { return !Item.exists(id) })
      .concat(NEEDED_FLUIDS.filter(function (id) { return !Fluid.exists(id) }))
    if (missing.length > 0) {
      console.error('[grindless/lv] heliostat tower recipes skipped, unknown id(s): ' + missing.join(', '))
      return
    }

    ;[['water', 'minecraft:water'], ['distilled_water', 'gtceu:distilled_water']].forEach(function (pair) {
      event.recipes.gtceu.solar_steam('grindless:' + pair[0])
        .inputFluids(Fluid.of(pair[1], WATER_PER_RUN))
        .outputFluids(Fluid.of('gtceu:steam', STEAM_PER_RUN))
        .daytime(false)
        .EUt(EUT).duration(DURATION)
    })

    event.recipes.gtceu.assembler('grindless:heliostat_mirror')
      .itemInputs('1x #forge:plates/steel', '2x #forge:foils/silver', '1x minecraft:glass_pane', '1x #forge:small_gears/steel')
      .itemOutputs('1x ' + MIRROR)
      .EUt(16).duration(100)

    // the controller: two mirrors, the field computer (LV circuits), a drive motor, the feed pump and the receiver casings
    event.recipes.gtceu.shaped('gtceu:heliostat_tower', ['MCM', 'RHP', 'FCF'], {
      M: MIRROR,
      C: '#gtceu:circuits/lv',
      R: 'gtceu:lv_electric_motor',
      H: 'gtceu:lv_machine_hull',
      P: 'gtceu:lv_electric_pump',
      F: 'gtceu:steel_firebox_casing'
    }).id('grindless:crafting/heliostat_tower')

    console.info('[grindless/lv] solar_steam recipes added: 2, heliostat mirror and controller recipes added')
  })
})()
