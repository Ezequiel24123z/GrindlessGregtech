// priority: -21324
// -----------------------------------------------------------------------------------------------
// Crafting-table recipes of the observatory controllers (made by hand from parts of their own era; nothing here needs a machine):
//
//   Clockwork Observatory (Steam)   glass, a bronze pipe (the tube), bronze gears, a bronze hull, bronze plates and a clock (the drive)
//   Optical Observatory (LV)        glass, an LV sensor (the plate holder), LV motors (the drive), an LV hull, LV circuits and a
//                                   photographic plate (the first one loaded)
//   Radio Telescope (MV)            aluminium frames, an MV emitter (the radar), MV sensors (the receivers), an MV hull, MV circuits and
//                                   a lunar ephemeris from the Optical Observatory (where to point the dish)
// The Steam one stays craftable in every later era (bronze, glass and a clock), so a world that is already past Steam builds it too.
//
// event.recipes.gtceu.shaped: GTM's shaped recipe; lowercase letters are GT tool symbols, so the keys of ingredients are uppercase.
(function () {
  var LOG = '[grindless/observatory] '
  var G = global.grindless || (global.grindless = {})
  var OBS = G.observatory || (G.observatory = {})

  var PARTS = ['gtceu:bronze_normal_fluid_pipe', 'gtceu:bronze_machine_casing', 'minecraft:clock', 'gtceu:lv_sensor',
    'gtceu:lv_electric_motor', 'gtceu:lv_machine_hull', 'gtceu:mv_emitter', 'gtceu:mv_sensor', 'gtceu:mv_machine_hull',
    'gtceu:aluminium_frame', 'grindless:photographic_plate', 'grindless:lunar_ephemeris']
  OBS.controllerRecipes = ['grindless:crafting/steam_observatory', 'grindless:crafting/optical_observatory',
    'grindless:crafting/radio_telescope']

  ServerEvents.recipes(function (event) {
    var missing = PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'observatory controller recipes skipped, unknown item(s): ' + missing.join(', '))
      return
    }

    event.recipes.gtceu.shaped('gtceu:steam_observatory', ['GTG', 'EHE', 'PKP'], {
      G: '#forge:glass',
      T: 'gtceu:bronze_normal_fluid_pipe',
      E: '#forge:gears/bronze',
      H: 'gtceu:bronze_machine_casing',
      P: '#forge:plates/bronze',
      K: 'minecraft:clock'
    }).id('grindless:crafting/steam_observatory')

    event.recipes.gtceu.shaped('gtceu:optical_observatory', ['GSG', 'MHM', 'CPC'], {
      G: '#forge:glass',
      S: 'gtceu:lv_sensor',
      M: 'gtceu:lv_electric_motor',
      H: 'gtceu:lv_machine_hull',
      C: '#gtceu:circuits/lv',
      P: 'grindless:photographic_plate'
    }).id('grindless:crafting/optical_observatory')

    event.recipes.gtceu.shaped('gtceu:radio_telescope', ['FEF', 'SHS', 'CAC'], {
      F: 'gtceu:aluminium_frame',
      E: 'gtceu:mv_emitter',
      S: 'gtceu:mv_sensor',
      H: 'gtceu:mv_machine_hull',
      C: '#gtceu:circuits/mv',
      A: 'grindless:lunar_ephemeris'
    }).id('grindless:crafting/radio_telescope')
  })
})()
