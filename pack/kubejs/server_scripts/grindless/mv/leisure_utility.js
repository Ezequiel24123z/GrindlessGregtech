// priority: -21024
// -----------------------------------------------------------------------------------------------
// Recipes of the Leisure utility package (startup_scripts/grindless/mv/leisure_utility.js; ideas from GregTech Leisure, our own
// recipes and numbers, docs/research/leisure.md 4.2-4.3):
//
//   controllers (crafting table, MV):
//     gtceu:advanced_multi_smelter   4 MV circuits, 2 MV electric furnaces, 2 cupronickel coils, an MV hull
//     gtceu:lava_furnace             4 steel firebox casings, an MV circuit, 2 MV electric pumps (the lava), a furnace, an MV hull
//     gtceu:weather_controller       2 lightning rods, an MV sensor (the sky), 3 MV circuits, 2 MV electric pumps (the sprayers),
//                                    an MV hull
//   gtceu:weather_control (the controller's own type), one recipe per mode from global.grindless.leisureUtility.weather, all in the
//   Overworld only (GTM's dimension condition): the weather is set on the controller's level when the run ends.
//     circuit 1  clear sky, 24,000 ticks (a whole day)   4 calcium chloride: strongly hygroscopic, it overseeds the clouds upwind so
//                                                        they rain out before they arrive (fog and cloud dispersal); it is the
//                                                        Solvay byproduct of GTM's soda ash (calcite + salt in the EBF)
//     circuit 2  rain, 12,000 ticks (half a day)         2 salt: hygroscopic seeding of warm clouds (salt flares)
//     circuit 3  thunderstorm, 6,000 ticks (5 minutes)   2 salt + 4 fine copper wire: rocket-triggered lightning, a rocket trails
//                                                        a thin grounded copper wire into the cloud and the strike vaporizes it
//     120 EU/t (MV): 200 ticks, the storm 400. Silver iodide, the classic seeding agent, is HV here (GTM's iodine needs hydrogen
//     peroxide at 240 EU/t), so the MV station seeds with salts.
//   gtceu:cleaning_maintenance_hatch (GTM's own part: a cleanroom inside one multiblock) gets an HV assembler recipe of ours: an auto
//     maintenance hatch, 4 filter casings (the HEPA ceiling of the cleanroom), 2 HV motors and 2 stainless steel rotors (its fans),
//     2 HV circuits; 480 EU/t x 30 s. That is about a cleanroom controller plus a hatch: the room itself is what it saves. GTM's UV
//     crafting recipe goes. GTM's recycling of the hatch (macerator, arc furnace) was computed from the UV recipe and would turn an
//     HV hatch into americium and tritanium: its datapack copy is removed, and our recipe replaces the hatch's material info, so the
//     copy GTM writes after the recipe event is rebuilt from the HV parts (see HATCH_RECYCLING below).
//   wildcard_pattern:wildcard_pattern (the MIT mod Wildcard Pattern, if installed; it ships no recipe): assembler, LV: an AE2 blank
//     pattern, a logic processor and an MV circuit.
//
// Ids: crafting grindless:crafting/<machine>; GT recipes get the type in front (grindless:weather_control/clear_sky...).
// Rhino: var + function inside every callback that runs more than once.
(function () {
  const G = global.grindless
  const U = G.leisureUtility || (G.leisureUtility = {})
  const LOG = '[grindless/mv] '

  const HATCH = 'gtceu:cleaning_maintenance_hatch'
  const WILDCARD = 'wildcard_pattern:wildcard_pattern'

  const CRAFTING = {
    smelter: 'grindless:crafting/advanced_multi_smelter',
    furnace: 'grindless:crafting/lava_furnace',
    weather: 'grindless:crafting/weather_controller'
  }
  const CRAFTING_PARTS = [
    'gtceu:mv_machine_hull', 'gtceu:mv_electric_furnace', 'gtceu:cupronickel_coil_block', 'gtceu:steel_firebox_casing',
    'gtceu:mv_electric_pump', 'minecraft:furnace', 'minecraft:lightning_rod', 'gtceu:mv_sensor'
  ]
  const HATCH_RECIPE = 'grindless:assembler/cleaning_maintenance_hatch'
  const HATCH_PARTS = ['gtceu:auto_maintenance_hatch', 'gtceu:filter_casing', 'gtceu:hv_electric_motor', HATCH]
  // GTM's recycling of the hatch was computed from its UV recipe (americium, tritanium). Two copies exist: the one the KubeJS recipe
  // event sees (the datapack phase: removed here, so the recipe dump and the validator never see it), and the one GTM writes again
  // after the event from each item's material info (GregTechKubeJSPlugin#injectRuntimeRecipes: "must run recycling recipes very
  // last"), which no script can remove. Our recipe replaces the hatch's material info (removePreviousMaterialInfo +
  // addMaterialInfo), so that second copy is rebuilt from the HV parts.
  const HATCH_RECYCLING = ['gtceu:macerator/macerate_cleaning_maintenance_hatch', 'gtceu:arc_furnace/arc_cleaning_maintenance_hatch']
  // GTM's UV crafting of the hatch goes too
  const HATCH_REMOVED = ['gtceu:shaped/maintenance_hatch_cleaning'].concat(HATCH_RECYCLING)
  const WILDCARD_RECIPE = 'grindless:assembler/wildcard_pattern'

  U.craftingRecipes = CRAFTING
  U.hatchRecipe = HATCH_RECIPE
  U.hatchRemoved = HATCH_REMOVED
  U.hatchRecycling = HATCH_RECYCLING
  U.wildcardRecipe = WILDCARD_RECIPE
  U.weatherRecipes = {}

  ServerEvents.recipes(function (event) {
    try {
      addControllers(event)
    } catch (e) {
      console.error(LOG + 'leisure utility controller recipes failed: ' + e)
    }
    try {
      addWeather(event)
    } catch (e2) {
      console.error(LOG + 'weather controller recipes failed: ' + e2)
    }
    try {
      addHatch(event)
    } catch (e3) {
      console.error(LOG + 'cleaning maintenance hatch recipe failed: ' + e3)
    }
    try {
      addWildcard(event)
    } catch (e4) {
      console.error(LOG + 'wildcard pattern recipe failed: ' + e4)
    }
  })

  function addControllers(event) {
    var missing = CRAFTING_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'leisure utility controllers skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped('gtceu:advanced_multi_smelter', ['CFC', 'KHK', 'CFC'], {
      C: '#gtceu:circuits/mv',
      F: 'gtceu:mv_electric_furnace',
      K: 'gtceu:cupronickel_coil_block',
      H: 'gtceu:mv_machine_hull'
    }).id(CRAFTING.smelter)

    event.recipes.gtceu.shaped('gtceu:lava_furnace', ['BCB', 'PHP', 'BFB'], {
      B: 'gtceu:steel_firebox_casing',
      C: '#gtceu:circuits/mv',
      P: 'gtceu:mv_electric_pump',
      H: 'gtceu:mv_machine_hull',
      F: 'minecraft:furnace'
    }).id(CRAFTING.furnace)

    event.recipes.gtceu.shaped('gtceu:weather_controller', ['RSR', 'CHC', 'PCP'], {
      R: 'minecraft:lightning_rod',
      S: 'gtceu:mv_sensor',
      C: '#gtceu:circuits/mv',
      H: 'gtceu:mv_machine_hull',
      P: 'gtceu:mv_electric_pump'
    }).id(CRAFTING.weather)
    console.info(LOG + 'leisure utility controller recipes added: 3')
  }

  function addWeather(event) {
    var W = U.weather
    if (!W) {
      console.error(LOG + 'weather recipes skipped: the startup script did not publish global.grindless.leisureUtility.weather')
      return
    }
    var count = 0
    W.modes.forEach(function (m) {
      var name = m.mode === 'clear' ? 'clear_sky' : m.mode
      var recipe = event.recipes.gtceu.weather_control('grindless:' + name)
        .circuit(m.circuit)
      m.inputs.forEach(function (input) { recipe.itemInputs(input) })
      recipe.dimension('minecraft:overworld')
        .addDataString(W.key, m.mode)
        .addDataNumber(W.ticksKey, m.ticks)
        .EUt(m.eut)
        .duration(m.duration)
      U.weatherRecipes[m.mode] = 'grindless:weather_control/' + name
      count++
    })
    console.info(LOG + 'weather controller recipes added: ' + count)
  }

  function addHatch(event) {
    var missing = HATCH_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'cleaning maintenance hatch recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    HATCH_REMOVED.forEach(function (id) { event.remove({ id: id }) })
    event.recipes.gtceu.assembler('grindless:cleaning_maintenance_hatch')
      .itemInputs('gtceu:auto_maintenance_hatch', '4x gtceu:filter_casing', '2x gtceu:hv_electric_motor',
        '2x #forge:rotors/stainless_steel', '2x #gtceu:circuits/hv')
      .itemOutputs(HATCH)
      .EUt(480)
      .duration(600)
      .removePreviousMaterialInfo()
      .addMaterialInfo(true)
    console.info(LOG + 'cleaning maintenance hatch: HV assembler recipe added (its material info replaces the UV one), ' +
      HATCH_REMOVED.length + ' GTM recipes removed (UV crafting, UV recycling)')
  }

  // the mod is optional: no mod, no recipe and no log noise
  function addWildcard(event) {
    if (!Item.exists(WILDCARD)) return
    event.recipes.gtceu.assembler('grindless:wildcard_pattern')
      .itemInputs('ae2:blank_pattern', 'ae2:logic_processor', '#gtceu:circuits/mv')
      .itemOutputs(WILDCARD)
      .EUt(30)
      .duration(200)
    console.info(LOG + 'wildcard pattern recipe added')
  }
})()
