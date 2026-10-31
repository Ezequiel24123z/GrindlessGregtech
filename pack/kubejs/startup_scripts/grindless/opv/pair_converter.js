// priority: -6790
// -----------------------------------------------------------------------------------------------
// OpV's magnetic pair converter (docs/eras/opv.md, machine 12, line 29; package OpV-E1): the only maker of dense_positron_cell's seed.
// Recipes come from data/grindless/tables/pair_converter.json (server_scripts/grindless/opv/pair_converter.js). One new item:
// grindless:unsealed_positron_cell (the cell before the UEV electron beam furnace seals it with a fresh getter, line 29 c23).
// Every other id is GTM-native (highTierContent, opv_ids.json) or F1's (opv/foundation.js).
//
//   gtceu:magnetic_pair_converter  9 x 9 x 9 open frame, field-aligned along the magnetar's lines, a trap on its axis. Recipe type
//                                  gtceu:magnetic_pair_production (circuit 1 boil the seed, 2 seal the cell). SGR 1806-20 orbit.
//
// Geometry (lib/patterns.js: a slice has at most 16 rows): the controller sits in the front slice (z = depth - 1), forced by
// G.uivShapes.T.slices at (mid, 1, depth - 1). The structure is a cube wireframe (edges where 2 of the 3 axes are at their extreme),
// alternating frame post and casing along it so no single block dominates; the beam axis (dead centre) is a coil at each end and glass
// between; the bottom front and back edges give floor cells to the buses, hatches and energy hatch.
// Textures: tools/assets/Build-OpVPairConverterTextures.ps1. Names: client_scripts/grindless/opv_pair_converter_lang.js.
// Published for the recipe script: global.grindless.pairConverter.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const PC = G.pairConverter || (G.pairConverter = {})
  const LOG = '[grindless/opv] '

  const CASING = 'grindless:field_frozen_casing'
  const CASING_TEXTURE = 'grindless:block/opv/field_frozen_casing'
  const COIL = 'gtceu:superconducting_coil'
  const GLASS = 'gtceu:fusion_glass'

  PC.table = 'kubejs/data/grindless/tables/pair_converter.json'
  PC.site = 'grindless:sgr1806_orbit'

  // items in include the programmed circuit
  PC.machines = [
    {
      name: 'magnetic_pair_converter', machine: 'gtceu:magnetic_pair_converter', type: 'magnetic_pair_production',
      dataKey: 'grindless_magnetic_pair_production', lang: 'Magnetic Pair Converter',
      maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 }, width: 9, height: 9, depth: 9, casing: CASING, texture: CASING_TEXTURE,
      pal: { F: CASING, Q: 'tungsten_steel', C: COIL, L: GLASS },
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 1 }), Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('output_hatch', { min: 1, max: 1 }), Pat.part('energy_input', { min: 1, max: 2 })]
      }
    }
  ]

  function abs(n) { return n < 0 ? -n : n }

  // x, y, z 9 x 9 x 9, centred on (4, 4, 4); z back (0) to front (8, the controller's slice). A cube wireframe (two of the three
  // axes at their extreme), alternating frame post and casing by coordinate parity so neither block dominates; the beam axis
  // (x = 4, y = 4) is a coil at each end (the trap) and glass between (the plasma line); the bottom front and back rows (y = 0,
  // z = 0 or 8, excluding the two true corners) are floor cells for the parts.
  function cell(x, y, z) {
    var dx = x - 4
    var dy = y - 4
    var dz = z - 4
    if (dx === 0 && dy === 0) return (z === 0 || z === 8) ? 'C' : 'L'
    var ex = abs(dx) === 4 ? 1 : 0
    var ey = abs(dy) === 4 ? 1 : 0
    var ez = abs(dz) === 4 ? 1 : 0
    var extreme = ex + ey + ez
    if (y === 0 && (z === 0 || z === 8) && abs(dx) <= 3) return 'X'
    if (extreme >= 2) return (x + y + z) % 2 === 0 ? 'Q' : 'F'
    return '#'
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: cell })
  }

  // one EMI line per recipe, read from its data
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

  StartupEvents.registry('item', function (event) {
    event.create('grindless:unsealed_positron_cell')
      .texture('grindless:item/unsealed_positron_cell')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.unsealed_positron_cell.0')))
      .tooltip(Text.darkGray(Text.translate('tooltip.grindless.unsealed_positron_cell.1')))
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    PC.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    PC.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.2'),
          Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.sgr1806_orbit'))
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
