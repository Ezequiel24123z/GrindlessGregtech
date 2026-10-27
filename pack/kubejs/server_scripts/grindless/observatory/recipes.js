// priority: -21424
// -----------------------------------------------------------------------------------------------
// Recipes of the observatory family (machines: startup_scripts/grindless/observatory/machines.js, items: .../items.js). One chart per
// observatory, each made once: the chart of one step is a non-consumed input of the next, and every chart copies by hand.
//
//   gtceu:stargazing         (Clockwork Observatory, Steam)  4 paper + 1 coal dust (the ink) -> 1 Lunar Chart (Draft)
//                            8 EU/t of steam, 400 ticks (600 in the steam multiblock). Night, clear sky (rain level under 0.2), the
//                            controller at Y 100..319.
//   gtceu:astrophotography   (Optical Observatory, LV)  the draft, NOT consumed (the finder chart) + 4 photographic plates + 2 paper
//                            -> 1 Photographic Lunar Map + 1 Lunar Ephemeris. 30 EU/t, 600 ticks. Night, clear sky; any height.
//   gtceu:radio_astronomy    (Radio Telescope, MV)  the map and the ephemeris, NOT consumed + 2 paper -> 1 Lunar Landing-Site Chart.
//                            120 EU/t, 600 ticks. Night (the Moon is up) and no thunderstorm (thunder level under 0.2); rain is fine.
//   gtceu:assembler          (LV)  2 glass plates + 1 small pile of silver dust (the emulsion) -> 2 photographic plates, 16 EU/t, 100 t
//   crafting (copies)        draft + paper + coal dust -> 2 drafts; map + photographic plate -> 2 maps (a contact print);
//                            ephemeris + paper + coal dust -> 2; landing chart + paper + coal dust -> 2
// Every observation recipe carries the data key grindless_sky (steam, optical, radio): the EMI line of its type spells the sky rule out.
// No inflated times and no chance: an observation is 30 s and always gives its chart. Published for the test:
// global.grindless.observatory.recipes.
(function () {
  var LOG = '[grindless/observatory] '
  var G = global.grindless || (global.grindless = {})
  var OBS = G.observatory || (G.observatory = {})

  var PAPER = 'minecraft:paper'
  var INK = '#forge:dusts/coal'
  var NEEDED = [PAPER, 'gtceu:coal_dust', 'gtceu:glass_plate', 'gtceu:small_silver_dust']

  OBS.recipes = {
    draft: 'grindless:stargazing/lunar_chart_draft',
    map: 'grindless:astrophotography/lunar_map',
    landing: 'grindless:radio_astronomy/lunar_landing_chart',
    plate: 'grindless:assembler/photographic_plate',
    copies: ['grindless:crafting/lunar_chart_draft_copy', 'grindless:crafting/lunar_map_copy',
      'grindless:crafting/lunar_ephemeris_copy', 'grindless:crafting/lunar_landing_chart_copy'],
    // what the test checks: the sky rule of each observation (GTM condition type -> reverse flag, plus the pos_y range)
    sky: {
      draft: { night: true, rain: 0.2, posY: [100, 319] },
      map: { night: true, rain: 0.2 },
      landing: { night: true, thunder: 0.2 }
    }
  }

  ServerEvents.recipes(function (event) {
    try {
      var I = OBS.items
      if (!I) {
        console.error(LOG + 'no item table (startup_scripts/grindless/observatory/items.js did not run): recipes skipped')
        return
      }
      var missing = NEEDED.concat([I.draft, I.plate, I.map, I.ephemeris, I.landing]).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + 'observatory recipes skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var sky = OBS.recipes.sky
      var skyKey = OBS.skyKey || 'grindless_sky'

      // ---- Steam: the first look through a telescope
      event.recipes.gtceu.stargazing('grindless:lunar_chart_draft')
        .itemInputs('4x ' + PAPER, '1x ' + INK)
        .itemOutputs('1x ' + I.draft)
        .addDataString(skyKey, 'steam')
        .daytime(true)
        .rain(sky.draft.rain, true)
        .posY(sky.draft.posY[0], sky.draft.posY[1])
        .EUt(8).duration(400)

      // ---- LV: photographs and tables, the draft as the finder chart
      event.recipes.gtceu.astrophotography('grindless:lunar_map')
        .notConsumable(I.draft)
        .itemInputs('4x ' + I.plate, '2x ' + PAPER)
        .itemOutputs('1x ' + I.map, '1x ' + I.ephemeris)
        .addDataString(skyKey, 'optical')
        .daytime(true)
        .rain(sky.map.rain, true)
        .EUt(30).duration(600)

      // ---- MV: radar over the map, pointed by the ephemeris
      event.recipes.gtceu.radio_astronomy('grindless:lunar_landing_chart')
        .notConsumable(I.map)
        .notConsumable(I.ephemeris)
        .itemInputs('2x ' + PAPER)
        .itemOutputs('1x ' + I.landing)
        .addDataString(skyKey, 'radio')
        .daytime(true)
        .thunder(sky.landing.thunder, true)
        .EUt(120).duration(600)

      // ---- the photographic plate: glass with a silver emulsion
      event.recipes.gtceu.assembler('grindless:photographic_plate')
        .itemInputs('2x #forge:plates/glass', '1x #forge:small_dusts/silver')
        .itemOutputs('2x ' + I.plate)
        .EUt(16).duration(100)

      // ---- copies: the original + a blank -> two
      event.shapeless('2x ' + I.draft, [I.draft, PAPER, INK]).id('grindless:crafting/lunar_chart_draft_copy')
      event.shapeless('2x ' + I.map, [I.map, I.plate]).id('grindless:crafting/lunar_map_copy')
      event.shapeless('2x ' + I.ephemeris, [I.ephemeris, PAPER, INK]).id('grindless:crafting/lunar_ephemeris_copy')
      event.shapeless('2x ' + I.landing, [I.landing, PAPER, INK]).id('grindless:crafting/lunar_landing_chart_copy')

      console.info(LOG + 'observations (draft, map + ephemeris, landing chart), photographic plate and 4 copy recipes added')
    } catch (e) {
      console.error(LOG + 'observatory recipes failed: ' + e)
    }
  })
})()
