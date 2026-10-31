// priority: -21889
// -----------------------------------------------------------------------------------------------
// Controller recipe of the LV Generator Array (startup_scripts/grindless/power/generator_array.js).
//
// No fuel recipes here: the array runs GTM's own steam_turbine, combustion_generator and gas_turbine recipes, already rebuilt at
// twice their duration by power/generators.js, so it needs nothing from that list (it adds no recipe type).
//
// The controller is made by hand from LV parts and holds one of each LV generator it can stand in for, so it costs more than the
// single blocks it replaces; the structure adds the 16 steel gearboxes (the generator units), the pipe casings and the steel hall.
// event.recipes.gtceu.shaped: GTM's shaped recipe (no tool needed here).
(function () {
  const G = global.grindless
  const POWER = G.power || (G.power = {})

  const RECIPE_ID = 'grindless:crafting/generator_array'
  const NEEDED = ['gtceu:generator_array', 'gtceu:lv_steam_turbine', 'gtceu:lv_combustion', 'gtceu:lv_gas_turbine',
    'gtceu:lv_machine_hull', 'gtceu:tin_quadruple_cable']

  // published for the smoke test (the machine data itself is POWER.generatorArray, set at startup)
  POWER.generatorArrayRecipe = { id: RECIPE_ID, needed: NEEDED }

  ServerEvents.recipes(function (event) {
    var missing = NEEDED.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error('[grindless/power] generator array controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped('gtceu:generator_array', ['CTC', 'GHB', 'EWC'], {
      E: 'grindless:graphite_electrode',
      C: '#gtceu:circuits/lv',
      T: 'gtceu:lv_steam_turbine',
      G: 'gtceu:lv_gas_turbine',
      B: 'gtceu:lv_combustion',
      H: 'gtceu:lv_machine_hull',
      W: 'gtceu:tin_quadruple_cable'
    }).id(RECIPE_ID)
    console.info('[grindless/power] generator array controller recipe added')
  })
})()
