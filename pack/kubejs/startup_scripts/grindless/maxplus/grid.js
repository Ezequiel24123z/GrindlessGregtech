// priority: -5589
// -----------------------------------------------------------------------------------------------
// MAX+ machine 16, the hyper assembly array (docs/eras/maxplus.md "Machines" 16; package XP-H4a) and the Hyperstargate's parts. This file
// registers: the six Hyperstargate blocks and two items the grid builds, the six creative-item stand-ins (S0-7: the creative items are
// grindless: items that cannot be placed, never the GTM or AE2 blocks), and the array with its recipe type. Rows are in server_scripts/
// grindless/maxplus/grid.js; names in client_scripts/grindless/maxplus_grid_lang.js. The sixteenth controller (gtceu:hyper_assembly_array)
// is a shape only: foundation.js lists it as a MAX+ controller and XP-H4a registers the machine here.
(function () {
  const G = global.grindless
  const GRID = G.maxPlusGrid || (G.maxPlusGrid = {})

  // block id -> an existing MAX+ casing texture (no missing-texture cube before the asset phase)
  GRID.blocks = {
    hyperstargate_ring_block: 'bound_press_casing',
    hyperstargate_chevron_block: 'slingshot_coil_casing',
    hyperstargate_locked_chevron: 'lift_nozzle_casing',
    hyperstargate_power_unit: 'crucible_liner_casing',
    horizon_iris: 'condensate_vessel_casing',
    hyperstargate_base: 'horizon_machine_casing'
  }

  // item id -> existing item art
  GRID.items = {
    hyperstargate_chevron_upgrade: 'chevron_core',
    hyperstargate_interface: 'horizon_lock'
  }

  // the six creative-item stand-ins the creative rows output; item art is borrowed until the asset phase
  GRID.creativeItems = {
    creative_energy: 'horizon_capacitor',
    creative_chest: 'chevron_core',
    creative_tank: 'coated_iris_blade',
    creative_computation_provider: 'horizon_lock',
    creative_data_access_hatch: 'iris_blade',
    creative_energy_cell: 'horizon_capacitor'
  }

  StartupEvents.registry('block', function (event) {
    Object.keys(GRID.blocks).forEach(function (name) {
      event.create('grindless:' + name)
        .stoneSoundType()
        .hardness(5)
        .resistance(6)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .textureAll('grindless:block/maxplus/' + GRID.blocks[name])
    })
  })

  StartupEvents.registry('item', function (event) {
    Object.keys(GRID.items).forEach(function (name) {
      event.create('grindless:' + name).texture('grindless:item/' + GRID.items[name]).maxStackSize(64)
    })
    Object.keys(GRID.creativeItems).forEach(function (name) {
      event.create('grindless:' + name).texture('grindless:item/' + GRID.creativeItems[name]).maxStackSize(1)
    })
  })
})()
