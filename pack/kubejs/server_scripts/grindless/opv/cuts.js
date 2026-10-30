// priority: -21457
// OpV cuts (OpV-F2, docs/eras/opv.md "Only from there and cuts"): GTM's recipes for the OpV components, hull, energy and dynamo
// hatches, parallel hatch and basic machines; every MAX recipe but the battery's; the chain strand's generic wiremill, extruder, bender,
// cable assembler, macerator and arc furnace rows; and GT--'s cosmic mainframe and SMDs (S0-4: GT-- registers no recipe for them,
// so those filters find none and stay as a guard). gtceu:max_battery is kept: GTM makes it at UHV and the released UHV battery cell
// is built from it. Removals spare our own recipes (not mod grindless), so no load-order band is needed.
;(function () {
  var LOG = '[grindless] '
  var NOT_OURS = { mod: 'grindless' }
  var OPV = ['electric_motor', 'electric_pump', 'conveyor_module', 'electric_piston', 'robot_arm', 'emitter', 'sensor',
    'field_generator', 'fluid_regulator', 'machine_hull', 'energy_input_hatch', 'energy_input_hatch_4a', 'energy_input_hatch_16a',
    'energy_output_hatch', 'energy_output_hatch_4a', 'energy_output_hatch_16a', 'parallel_hatch',
    'electric_furnace', 'alloy_smelter', 'arc_furnace', 'assembler', 'autoclave', 'bender', 'brewery', 'canner', 'centrifuge',
    'chemical_bath', 'chemical_reactor', 'compressor', 'cutter', 'distillery', 'electrolyzer', 'electromagnetic_separator', 'extractor',
    'extruder', 'fermenter', 'fluid_heater', 'fluid_solidifier', 'forge_hammer', 'forming_press', 'lathe', 'scanner', 'mixer',
    'ore_washer', 'packer', 'polarizer', 'laser_engraver', 'sifter', 'thermal_centrifuge', 'wiremill', 'circuit_assembler',
    'gas_collector', 'macerator', 'rock_crusher'].map(function (n) { return 'gtceu:opv_' + n })
  var MAX = ['machine_hull', 'machine_casing', 'energy_input_hatch', 'energy_input_hatch_4a', 'energy_input_hatch_16a',
    'energy_output_hatch', 'energy_output_hatch_4a', 'energy_output_hatch_16a', 'substation_input_hatch_64a',
    'substation_output_hatch_64a', '1a_energy_converter', '4a_energy_converter', '8a_energy_converter', '16a_energy_converter',
    'battery_buffer_4x', 'battery_buffer_8x', 'battery_buffer_16x', 'charger_4x', 'input_bus', 'output_bus', 'input_hatch',
    'input_hatch_4x', 'input_hatch_9x', 'output_hatch', 'output_hatch_4x', 'output_hatch_9x', 'dual_input_hatch',
    'dual_output_hatch'].map(function (n) { return 'gtceu:max_' + n })
  var GTNN = ['cosmic_mainframe', 'cosmic_smd_capacitor', 'cosmic_smd_diode', 'cosmic_smd_inductor', 'cosmic_smd_resistor',
    'cosmic_smd_transistor'].map(function (n) { return 'gtnn:' + n })
  var CHAIN = ['chain_strand_ingot', 'chain_strand_nugget', 'chain_strand_block', 'chain_strand_dust', 'small_chain_strand_dust',
    'tiny_chain_strand_dust', 'chain_strand_plate', 'double_chain_strand_plate', 'chain_strand_foil', 'chain_strand_single_wire',
    'chain_strand_double_wire', 'chain_strand_quadruple_wire', 'chain_strand_octal_wire', 'chain_strand_hex_wire',
    'chain_strand_single_cable', 'chain_strand_double_cable', 'chain_strand_quadruple_cable', 'chain_strand_octal_cable',
    'chain_strand_hex_cable'].map(function (n) { return 'gtceu:' + n })
  var CHAIN_CABLES = CHAIN.filter(function (id) { return /_cable$/.test(id) })
  var CHAIN_TYPES = ['wiremill', 'extruder', 'bender', 'macerator', 'arc_furnace'].map(function (t) { return 'gtceu:' + t })

  // an unknown id would turn into air and match far more than meant
  function known(id) { return Item.exists(id) }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      var removals = []
      OPV.concat(MAX, GTNN).filter(known).forEach(function (id) { removals.push({ output: id, not: NOT_OURS }) })
      CHAIN.filter(known).forEach(function (id) {
        CHAIN_TYPES.forEach(function (type) {
          removals.push({ type: type, input: id, not: NOT_OURS })
          removals.push({ type: type, output: id, not: NOT_OURS })
        })
      })
      CHAIN_CABLES.filter(known).forEach(function (id) { removals.push({ type: 'gtceu:assembler', output: id, not: NOT_OURS }) })
      var found = 0
      removals.forEach(function (f) { found += Number(event.countRecipes(f)) })
      removals.forEach(function (f) { event.remove(f) })
      console.info(LOG + 'opv cuts: removed ' + found + ' recipe matches (GTM OpV and MAX parts, generic chain strand rows, GT-- cosmic mainframe and SMDs)')
    } catch (e) {
      console.error(LOG + 'opv cuts failed: ' + e)
    }
  })
})()
