// priority: -5589
// -----------------------------------------------------------------------------------------------
// MAX+ machine 16, the hyper assembly array (docs/eras/maxplus.md "Machines" 16; package XP-H4a) and the Hyperstargate's parts. This file
// registers: the six Hyperstargate blocks and two items the grid builds, the six creative-item stand-ins (S0-7: the creative items are
// grindless: items that cannot be placed, never the GTM or AE2 blocks), and the array with its recipe type. Rows are in server_scripts/
// grindless/maxplus/grid.js; names in client_scripts/grindless/maxplus_grid_lang.js. The sixteenth controller (gtceu:hyper_assembly_array)
// is a shape only: foundation.js lists it as a MAX+ controller and XP-H4a registers the machine here.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const GRID = G.maxPlusGrid || (G.maxPlusGrid = {})

  // block id -> its block/maxplus texture (XP-V2)
  GRID.blocks = {
    hyperstargate_ring_block: 'hyperstargate_ring_block',
    hyperstargate_chevron_block: 'hyperstargate_chevron_block',
    hyperstargate_locked_chevron: 'hyperstargate_locked_chevron',
    hyperstargate_power_unit: 'hyperstargate_power_unit',
    horizon_iris: 'horizon_iris',
    hyperstargate_base: 'hyperstargate_base'
  }

  // item id -> its item texture (XP-V2)
  GRID.items = {
    hyperstargate_chevron_upgrade: 'hyperstargate_chevron_upgrade',
    hyperstargate_interface: 'hyperstargate_interface'
  }

  // the six creative-item stand-ins the creative rows output; each has its own token texture (XP-V2)
  GRID.creativeItems = {
    creative_energy: 'creative_energy',
    creative_chest: 'creative_chest',
    creative_tank: 'creative_tank',
    creative_computation_provider: 'creative_computation_provider',
    creative_data_access_hatch: 'creative_data_access_hatch',
    creative_energy_cell: 'creative_energy_cell'
  }

  // ---------------------------------------------------------------- the array's rows (docs/eras/maxplus.md "Hyperstargate" grid table)
  // name, circuit (unique, 1-32: the lookup path), items [id, n], bath fluids, output, EU/t as V[MAX] x amps, ticks. The server script adds them;
  // the maximum item inputs of the recipe type is computed from these rows, never padded.
  const KERR = 'gtceu:kerr_condensate'
  const HE3 = 'gtceu:superfluid_helium_3'
  const HATCH_ITEM = 'gtceu:max_maxplus_energy_hatch_1024a'
  const g = function (id) { return 'grindless:' + id }
  const MEGA_ITEM_CELL = 'megacells:item_storage_cell_256m'
  const MEGA_FLUID_CELL = 'megacells:fluid_storage_cell_256m'
  const RING = g('hyperstargate_ring_block')
  const UPGRADE = g('hyperstargate_chevron_upgrade')
  const CHEVRON = g('hyperstargate_chevron_block')

  GRID.rows = [
    // the grid: parts of the Hyperstargate (docs/eras/maxplus.md :420-435)
    { name: 'hyperstargate_ring_block', circuit: 1, amps: 64, duration: 1200, line: 'Ring block',
      items: [[g('horizon_frame_part'), 20], [g('horizon_containment_plate'), 10], [g('maxplus_field_generator'), 6], [g('horizon_compressed_plate'), 8],
        [g('flux_absorber_casing'), 8], [g('kerr_strange_plate'), 4], [g('chevron_core'), 2], [g('horizon_waveguide'), 4], [g('horizon_frame_truss'), 2]],
      fluids: [[KERR, 250000]], out: [RING, 1] },
    { name: 'hyperstargate_chevron_upgrade', circuit: 2, amps: 64, duration: 1200, line: 'Chevron upgrade',
      items: [[g('horizon_compressed_plate'), 24], [g('horizon_frame_part'), 8], [g('chevron_core'), 4], [g('maxplus_field_generator'), 2],
        [g('maxplus_electric_piston'), 2], [g('maxplus_sensor'), 1], [g('maxplus_emitter'), 1], [g('cold_kerr_gyro'), 2]],
      fluids: [[KERR, 250000]], out: [UPGRADE, 1] },
    { name: 'hyperstargate_chevron_block', circuit: 3, amps: 128, duration: 1800, line: 'Chevron block',
      items: [[RING, 4], [UPGRADE, 9], [g('horizon_containment_plate'), 16], [g('maxplus_field_generator'), 4], [g('horizon_shielding'), 16],
        [g('horizon_waveguide'), 16], [g('horizon_conduit'), 16], [g('horizon_valve'), 16]],
      fluids: [[KERR, 500000]], out: [CHEVRON, 1] },
    { name: 'hyperstargate_locked_chevron', circuit: 4, amps: 128, duration: 1800, line: 'Locked chevron',
      items: [[RING, 4], [UPGRADE, 9], [g('horizon_containment_plate'), 16], [g('maxplus_field_generator'), 4], [g('horizon_shielding'), 16],
        [g('horizon_waveguide'), 16], [g('horizon_conduit'), 16], [g('horizon_valve'), 16], [g('horizon_lock'), 1]],
      fluids: [[KERR, 500000]], out: [g('hyperstargate_locked_chevron'), 1] },
    { name: 'iris_blade', circuit: 5, amps: 64, duration: 1200, line: 'Iris blade (line T11, last step)',
      items: [[g('coated_iris_blade'), 1], [g('horizon_compressed_plate'), 12], [g('kerr_strange_plate'), 8], [g('maxplus_electric_piston'), 2],
        [g('maxplus_conveyor_module'), 1]],
      fluids: [[KERR, 100000]], out: [g('iris_blade'), 1] },
    { name: 'horizon_iris', circuit: 6, amps: 128, duration: 2400, line: 'Horizon iris',
      items: [[g('iris_blade'), 240], [g('horizon_shielding'), 12], [g('condensate_field_cell'), 12]],
      fluids: [[KERR, 500000]], out: [g('horizon_iris'), 1] },
    { name: 'horizon_capacitor', circuit: 7, amps: 64, duration: 1800, line: 'Horizon capacitor',
      items: [[g('cold_kerr_toroid'), 4], [g('maxplus_field_generator'), 4], [g('cold_kerr_fcl'), 2], [g('creative_energy_cell'), 1]],
      fluids: [[KERR, 250000]], out: [g('horizon_capacitor'), 1] },
    { name: 'hyperstargate_power_unit', circuit: 8, amps: 128, duration: 2400, line: 'Power unit',
      items: [[RING, 16], [g('resonance_chamber'), 8], [g('horizon_conduit'), 640], [g('creative_energy'), 1]],
      fluids: [[KERR, 500000]], out: [g('hyperstargate_power_unit'), 1] },
    { name: 'hyperstargate_base', circuit: 9, amps: 256, duration: 2400, line: 'Base',
      items: [[CHEVRON, 27], [RING, 144], [UPGRADE, 36], [g('horizon_alignment_matrix'), 4], [g('creative_chest'), 1], [g('creative_tank'), 1],
        [MEGA_ITEM_CELL, 1], [MEGA_FLUID_CELL, 1], [HATCH_ITEM, 4]],
      fluids: [[KERR, 1000000]], out: [g('hyperstargate_base'), 1] },
    { name: 'hyperstargate_interface', circuit: 10, amps: 128, duration: 1800, line: 'Interface',
      items: [[RING, 8], [g('creative_data_access_hatch'), 1], [g('horizon_comm_terminal'), 4], [g('pattern_memory_unit'), 64]],
      fluids: [[KERR, 250000]], out: [g('hyperstargate_interface'), 1] },
    // line T12, last step (docs/eras/maxplus.md :353)
    { name: 'horizon_alignment_matrix', circuit: 11, amps: 64, duration: 1800, line: 'Alignment matrix (line T12, last step)',
      items: [[g('cold_reference_assembly'), 4], [g('horizon_compressed_plate'), 8], [g('kerr_strange_plate'), 4], [g('maxplus_sensor'), 2],
        [g('horizon_waveguide'), 4]],
      fluids: [[KERR, 100000]], out: [g('horizon_alignment_matrix'), 1] }
  ]

  // the six creative rows (docs/eras/maxplus.md :397-412): each K core plus extras, 2^39 EU/t for 2,400 t. The 64 substation hatches stay ingredients.
  GRID.creative = [
    { name: 'creative_energy', circuit: 12, amps: 256, duration: 2400, line: 'Creative energy',
      items: [[g('horizon_cloud_core'), 1], [g('maxplus_field_generator'), 64], [g('kerr_field_coil'), 64], [g('cold_kerr_toroid'), 16],
        [g('horizon_processor'), 256], [g('horizon_containment_plate'), 64], [g('horizon_conduit'), 64], ['gtceu:max_substation_input_hatch_64a', 64]],
      fluids: [[KERR, 1000000], [HE3, 250000]], out: [g('creative_energy'), 1] },
    { name: 'creative_chest', circuit: 13, amps: 256, duration: 2400, line: 'Creative chest',
      items: [[g('bottomless_store_core'), 1], [g('horizon_processor'), 64], [g('horizon_containment_plate'), 16], [g('maxplus_field_generator'), 16]],
      fluids: [[KERR, 500000]], out: [g('creative_chest'), 1] },
    { name: 'creative_tank', circuit: 14, amps: 256, duration: 2400, line: 'Creative tank',
      items: [[g('bottomless_tank_core'), 1], [g('horizon_processor'), 64], [g('horizon_containment_plate'), 16], [g('maxplus_field_generator'), 16]],
      fluids: [[KERR, 500000]], out: [g('creative_tank'), 1] },
    { name: 'creative_computation_provider', circuit: 15, amps: 256, duration: 2400, line: 'Creative computation provider',
      items: [[g('horizon_computation_core'), 1], [g('horizon_processor'), 128], [g('horizon_comm_terminal'), 8], [g('maxplus_field_generator'), 16]],
      fluids: [[KERR, 500000]], out: [g('creative_computation_provider'), 1] },
    { name: 'creative_data_access_hatch', circuit: 16, amps: 256, duration: 2400, line: 'Creative data access hatch',
      items: [[g('horizon_computation_core'), 1], [g('pattern_memory_unit'), 16], [g('horizon_processor'), 64], [g('maxplus_field_generator'), 8]],
      fluids: [[KERR, 500000]], out: [g('creative_data_access_hatch'), 1] },
    { name: 'creative_energy_cell', circuit: 17, amps: 256, duration: 2400, line: 'Creative energy cell',
      items: [[g('horizon_cloud_core'), 1], [g('maxplus_field_generator'), 6], [g('kerr_field_coil'), 6], [g('cold_kerr_toroid'), 2],
        [g('horizon_processor'), 24], [g('horizon_containment_plate'), 6]],
      fluids: [[KERR, 100000], [HE3, 25000]], out: [g('creative_energy_cell'), 1] }
  ]

  // inputs of the recipe type: the largest row's distinct items (a programmed circuit takes a slot) and fluids
  GRID.maxItems = GRID.rows.concat(GRID.creative).reduce(function (n, r) { return Math.max(n, r.items.length + 1) }, 0)
  GRID.maxFluids = GRID.rows.concat(GRID.creative).reduce(function (n, r) { return Math.max(n, r.fluids.length) }, 0)

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
  const CASING = 'grindless:horizon_machine_casing'
  const LOG = '[grindless/maxplus_grid] '

  // 27 x 11 x 27 of horizon machine casing: four glass-banded walls round a vertical bar of atomic casing and coils. The front face (z = 26)
  // carries a block of part cells, five rows by 25 columns less the controller: up to 81 input buses and one 1,024 A hatch, buses and hatches.
  GRID.machine = {
    name: 'hyper_assembly_array', machine: 'gtceu:hyper_assembly_array', type: 'hyper_assembly_array', dataKey: 'grindless_hyper_assembly_array',
    lang: 'Hyper Assembly Array', casing: CASING, texture: 'grindless:block/maxplus/horizon_machine_casing', overlay: 'grindless:block/multiblock/hyper_assembly_array',
    width: 27, height: 11, depth: 27,
    pal: { F: CASING, L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil' },
    parts: function () {
      return [
        Pat.part('input_bus', { min: 1, max: 81 }),
        Pat.part('output_bus', { min: 1, max: 8 }),
        Pat.part('input_hatch', { min: 1, max: 4 }),
        Pat.part('energy_input', { min: 1, max: 1 })
      ]
    }
  }

  // x left to right, y bottom to top, z back to front
  function arrayCell(x, y, z) {
    if (y === 0 || y === 10) {
      var m5 = (x + z) % 5
      return m5 < 2 ? 'A' : m5 === 3 && z % 2 === 0 ? 'C' : 'F'
    }
    if (z === 26) return y >= 1 && y <= 5 && x >= 1 && x <= 25 ? 'X' : 'F'
    if (x === 0 || x === 26 || z === 0) {
      var along = x === 0 || x === 26 ? z : x
      return y >= 4 && y <= 7 && along >= 3 && along <= 23 && along % 4 !== 1 ? 'L' : 'F'
    }
    if (x === 13 && z === 13 && y >= 2 && y <= 8) return y % 4 === 2 ? 'C' : 'A'
    return '#'
  }

  function infoOf(dataKey) {
    return function (data) {
      try {
        var name = String(data.getString(dataKey))
        if (name === '') return ''
        return String(Text.translate('gtceu.recipe.' + dataKey + '.' + name).getString())
      } catch (e) {
        return ''
      }
    }
  }

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var m = GRID.machine
    event.create(m.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(GRID.maxItems, 1, GRID.maxFluids, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var m = GRID.machine
    var type = GTRecipeTypes.get(m.type)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
    type.addDataInfo(infoOf(m.dataKey))
    m.spec = G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: arrayCell })
    Pat.register(m.machine, m.spec)

    event.create(m.name, 'multiblock')
      .langValue(m.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(m.type)
      .recipeModifier(function (machine, recipe) { return ModifierFunction.IDENTITY }, true)
      .appearanceBlock(function () { return Block.getBlock(m.casing) })
      .pattern(function (def) { return Pat.build(def, m.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type))
      ])
      .workableCasingModel(m.texture, m.overlay)
  })
})()
