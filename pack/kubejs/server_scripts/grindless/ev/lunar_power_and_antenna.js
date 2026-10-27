// -----------------------------------------------------------------------------------------------
// Recipes of the EV Moon base's family steps (machines: startup_scripts/grindless/ev/lunar_power_and_antenna.js):
//
//   gtceu:lunar_solar          (Lunar Solar Array) one recipe per site, no input but the programmed circuit that picks it, nothing
//                              used up, only by day (GTM's daytime condition):
//                                grindless:lunar_solar/moon  circuit 1, gcyr:luna   420 EU/t per panel, 20 ticks a run
//                                grindless:lunar_solar/mars  circuit 2, gcyr:mars   129 EU/t per panel
//                                grindless:lunar_solar/proxima  a red-tuned solar array (UHV, not used up), gcyr:proxima_centauri_b's
//                                  star-side biome (GCYR fixes its time at midnight), 273 EU/t per panel (x0.65 of the Moon's)
//                              The array runs one copy per panel under open sky (36 at most), limited by its dynamo hatches. These
//                              recipes are NOT in power/generators.js's list: they burn no fuel, so there is nothing to double, and
//                              their conditions would make that script skip them anyway.
//   gtceu:deep_space_tracking  (Deep Space Antenna) grindless:deep_space_tracking/mars_chart: the lunar landing-site chart, NOT
//                              consumed (it calibrates the dish) + 1 data stick -> 1 Mars Transfer Chart. On the Moon, at night.
//                              1 920 EU/t (an EV amp), 600 ticks: 30 s, like every observation of the family.
//   crafting                   the two controllers (GTM shaped recipes) and the chart copy, the observatory family's rule:
//                              Mars chart + data stick -> 2 Mars charts.
//
// The field's 36 panels are the EV Tripod Drill's Solar Wing Panels (grindless:solar_wing_panel; their assembler recipe is in
// server_scripts/grindless/ev/tripod.js: a titanium frame, 2 silicon wafers and tempered glass).
// Controllers: the array from 3 solar wing panels, 2 EV circuits, an EV hull, 2 titanium frames and an EV cable; the antenna from
// titanium frames, an HV emitter (the uplink), 2 HV sensors (the receivers), an EV hull, 2 EV circuits and titanium plates. No EV
// emitter or sensor: they stay in IV (ev.md, "Validator").
// Published for the smoke test: global.grindless.lunarPower.recipes.
(function () {
  var LOG = '[grindless/ev] '
  var G = global.grindless || (global.grindless = {})
  var LP = G.lunarPower || (G.lunarPower = {})

  var PANEL = 'grindless:solar_wing_panel'
  var CHART = 'grindless:mars_chart'
  var LANDING = 'grindless:lunar_landing_chart'
  var STICK = 'gtceu:data_stick'
  var NEEDED = [PANEL, CHART, LANDING, STICK, 'gtceu:titanium_plate', 'gtceu:titanium_frame', 'gtceu:ev_machine_hull',
    'gtceu:aluminium_single_cable', 'gtceu:hv_emitter', 'gtceu:hv_sensor', 'gtceu:lunar_solar_array', 'gtceu:deep_space_antenna']

  LP.recipes = {
    solar: ['grindless:lunar_solar/moon', 'grindless:lunar_solar/mars'],
    chart: 'grindless:deep_space_tracking/mars_chart',
    copy: 'grindless:crafting/mars_chart_copy',
    controllers: ['grindless:crafting/lunar_solar_array', 'grindless:crafting/deep_space_antenna']
  }

  // the Proxima b row (package UHV-B1): 0.65 x the Moon's 420 EU/t per panel (tables/sunlight.json, gcyr:proxima_centauri_b 0.91)
  LP.proxima = {
    recipe: 'grindless:lunar_solar/proxima',
    builderId: 'grindless:proxima',
    array: 'grindless:red_tuned_solar_array',
    dimension: 'gcyr:proxima_centauri_b',
    biome: 'gcyr:proxima_centauri_b_star_side',
    sky: 'proxima_day',
    euPerPanel: 273
  }

  ServerEvents.recipes(function (event) {
    try {
      var A = LP.array
      var N = LP.antenna
      if (!A || !N) {
        console.error(LOG + 'no machine table (startup_scripts/grindless/ev/lunar_power_and_antenna.js did not run): recipes skipped')
        return
      }
      var missing = NEEDED.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + 'lunar power and antenna recipes skipped, unknown item(s): ' + missing.join(', '))
        return
      }

      // ---- the array: one recipe per site, the circuit as the only (never used) input; EU out per lit panel
      ;['moon', 'mars'].forEach(function (key) {
        var site = A.sites[key]
        event.recipes.gtceu.lunar_solar('grindless:' + key)
          .circuit(site.circuit)
          .addDataString(A.skyKey, key === 'moon' ? 'lunar_day' : 'martian_day')
          .addData(A.panelEuKey, site.euPerPanel)
          .dimension(site.dimension)
          .daytime(false)
          .EUt(-site.euPerPanel)
          .duration(A.duration)
      })

      // ---- UHV-B1, the Proxima b row (docs/eras/uhv.md "Sunlight", "Older machines"): x0.65 of the Moon's figure, a red-tuned array
      // in the bus (not used up) instead of a circuit. GCYR fixes Proxima b's time at midnight (it is tidally locked), so the day
      // side is its star-side biome (GTM's biome condition at the controller), not GTM's daytime check
      var PX = LP.proxima
      try {
        if (Item.exists(PX.array)) {
          event.recipes.gtceu.lunar_solar(PX.builderId)
            .notConsumable(PX.array)
            .addDataString(A.skyKey, PX.sky)
            .addData(A.panelEuKey, PX.euPerPanel)
            .dimension(PX.dimension)
            .biome(PX.biome)
            .EUt(-PX.euPerPanel)
            .duration(A.duration)
          if (LP.recipes.solar.indexOf(PX.recipe) < 0) LP.recipes.solar.push(PX.recipe)
        } else {
          console.error(LOG + 'lunar solar Proxima row skipped, unknown item: ' + PX.array)
        }
      } catch (e) {
        console.error(LOG + 'lunar solar Proxima row failed: ' + e)
      }

      // ---- the antenna: the landing-site chart calibrates the dish, a data stick takes the radio fixes of Mars
      event.recipes.gtceu.deep_space_tracking('grindless:mars_chart')
        .notConsumable(LANDING)
        .itemInputs('1x ' + STICK)
        .itemOutputs('1x ' + CHART)
        .addDataString(A.skyKey, 'deep_space')
        .dimension('gcyr:luna')
        .daytime(true)
        .EUt(N.eut)
        .duration(N.duration)

      // ---- the chart copies by hand, like every chart of the family
      event.shapeless('2x ' + CHART, [CHART, STICK]).id(LP.recipes.copy)

      // ---- controllers (GTM shaped: lowercase letters are tool symbols, so ingredient keys are uppercase)
      event.recipes.gtceu.shaped(A.machine, ['PPP', 'CHC', 'FWF'], {
        P: PANEL,
        C: '#gtceu:circuits/ev',
        H: 'gtceu:ev_machine_hull',
        F: 'gtceu:titanium_frame',
        W: 'gtceu:aluminium_single_cable'
      }).id(LP.recipes.controllers[0])

      event.recipes.gtceu.shaped(N.machine, ['FEF', 'SHS', 'CAC'], {
        F: 'gtceu:titanium_frame',
        E: 'gtceu:hv_emitter',
        S: 'gtceu:hv_sensor',
        H: 'gtceu:ev_machine_hull',
        C: '#gtceu:circuits/ev',
        A: '#forge:plates/titanium'
      }).id(LP.recipes.controllers[1])

      console.info(LOG + 'lunar power and antenna: 2 solar site recipes, the Mars chart observation, the chart copy and 2 controllers added')
    } catch (e) {
      console.error(LOG + 'lunar power and antenna recipes failed: ' + e)
    }
  })
})()
