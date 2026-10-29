// priority: -22824
// -----------------------------------------------------------------------------------------------
// Crafting-table recipes of the Large Steam family (startup_scripts/grindless/steam/large_family.js). Every
// controller is steel-tier and expensive on purpose (AGENTS.md rule 4 / the brief: "the controllers are expensive
// and steel-tier - they are the reward for finishing Steam"), but still pure Vapor-era materials: steel plates and
// frames (steel exists from the Steam Blast Furnace, docs/eras/steam.md step 6), bronze pipes, and the steel solid
// casing the family's shell is built from (gtceu:solid_machine_casing - a crafting-table recipe already, plates
// around a hammer/wrench, see GTM's MetaTileEntityLoader; no assembler or LV electricity needed). Era rule: nothing
// here needs an LV-or-later resource.
//
// Shared shape (['PFP', 'FBF', 'CwC']): 2 steel plates, 3 steel frames, 1 "core" item that gives each controller
// its own identity (see below), 2 solid machine casings and a wrench (tool, not consumed).
//
//   Large Steam Macerator            core: gtceu:steam_grinder          (GTM's own simple steam macerator, upgraded)
//   Large Steam Centrifuge           core: #forge:gears/steel           (the spinning drum)
//   Large Steam Thermal Centrifuge   core: #forge:rods/steel            (the heated spindle)
//   Large Steam Chemical Bath        core: gtceu:bronze_normal_fluid_pipe  (the liquid plumbing)
//   Large Steam Ore Washer           core: gtceu:primitive_pump         (GTM's own water pump, upgraded)
//
// No new process recipes: every one of the five runs GTM's OWN macerator / centrifuge / thermal_centrifuge /
// chemical_bath / ore_washer recipes unmodified (see the startup script's header). This file only adds the five
// crafting recipes and publishes global.grindless.largeSteamFamily for the test overlay
// (tools/test/overlay/kubejs/server_scripts/gg_test_steam_large_family.js) to read.
(function () {
  const G = global.grindless

  const PLATE = '#forge:plates/steel'
  const FRAME = '#forge:frames/steel'
  const CASING = 'gtceu:solid_machine_casing'

  const SPECS = [
    { id: 'large_steam_macerator', core: 'gtceu:steam_grinder', type: 'gtceu:macerator' },
    { id: 'large_steam_centrifuge', core: '#forge:gears/steel', type: 'gtceu:centrifuge' },
    { id: 'large_steam_thermal_centrifuge', core: '#forge:rods/steel', type: 'gtceu:thermal_centrifuge' },
    { id: 'large_steam_chemical_bath', core: 'gtceu:bronze_normal_fluid_pipe', type: 'gtceu:chemical_bath' },
    { id: 'large_steam_ore_washer', core: 'gtceu:primitive_pump', type: 'gtceu:ore_washer' }
  ]

  ServerEvents.recipes(function (event) {
    var family = {}
    SPECS.forEach(function (spec) {
      var machineId = 'gtceu:' + spec.id
      var recipeId = 'grindless:crafting/' + spec.id
      event.recipes.gtceu.shaped(machineId, ['DFP', 'FBF', 'CwC'], {
        D: 'grindless:steel_drill_bit',
        P: PLATE,
        F: FRAME,
        B: spec.core,
        C: CASING
      }).id(recipeId)
      family[spec.id] = { machine: machineId, type: spec.type, recipe: recipeId, core: spec.core }
    })
    G.largeSteamFamily = family
    console.info('[grindless/steam] large steam family crafting recipes: ' + SPECS.length)
  })
})()
