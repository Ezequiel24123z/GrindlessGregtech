// priority: -6801
// -----------------------------------------------------------------------------------------------
// OpV's magnetic pair converter (docs/eras/opv.md, machine 12, line 29; package OpV-E1): the only maker of dense_positron_cell's seed.
// Recipes come from data/grindless/tables/pair_converter.json (server_scripts/grindless/opv/pair_converter.js). One new item:
// grindless:unsealed_positron_cell (the cell before the UEV electron beam furnace seals it with a fresh getter, line 29 c23).
// Every other id is GTM-native (highTierContent, opv_ids.json) or F1's (opv/foundation.js).
//
//   gtceu:magnetic_pair_converter  13 x 17 x 13 open frame along the magnetar's field lines (opv/shapes.js): field-frozen pylons and hoops,
//                                  a NEG trap vessel on the axis in a lamina jacket with field coils. Recipe type
//                                  gtceu:magnetic_pair_production (circuit 1 boil the seed, 2 seal the cell). Only the boil is locked to SGR 1806-20 orbit.
//
// Geometry (lib/patterns.js: a slice has at most 64 rows): the controller sits in the front slice (z = depth - 1), forced by
// G.opvShapes.slices at (mid, 1, depth - 1); the hatch cells are the front of the base. Bootstrap: it holds field-frozen casing (made
// by the field-frozen press), lamina and NEG casing; none of their chains needs a positron cell.
// Textures: tools/assets/Build-OpVPairConverterTextures.ps1. Names: client_scripts/grindless/opv_pair_converter_lang.js.
// Published for the recipe script: global.grindless.pairConverter.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const PC = G.pairConverter || (G.pairConverter = {})
  const LOG = '[grindless/opv] '

  const CASING = 'grindless:chain_lamina_casing'
  const CASING_TEXTURE = 'grindless:block/opv/chain_lamina_casing'
  const FIELD_FROZEN = 'grindless:field_frozen_casing'
  const NEG = 'grindless:neg_xhv_casing'
  const COIL = 'gtceu:superconducting_coil'
  const GLASS = 'gtceu:fusion_glass'

  PC.table = 'kubejs/data/grindless/tables/pair_converter.json'
  PC.site = 'grindless:sgr1806_orbit'

  // items in include the programmed circuit
  PC.machines = [
    {
      name: 'magnetic_pair_converter', machine: 'gtceu:magnetic_pair_converter', type: 'magnetic_pair_production',
      dataKey: 'grindless_magnetic_pair_production', lang: 'Magnetic Pair Converter',
      maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 }, width: 13, height: 17, depth: 13, casing: CASING, texture: CASING_TEXTURE,
      pal: { F: CASING, K: FIELD_FROZEN, N: NEG, Q: 'tungsten_steel', C: COIL, G: GLASS },
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 1 }), Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('output_hatch', { min: 1, max: 1 }), Pat.part('energy_input', { min: 1, max: 2 })]
      }
    }
  ]

  // built in the machine registry callback: opv/shapes.js may load after this file
  function spec(m) {
    return G.opvShapes.build(Pat, m.name, m.pal, m.parts())
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
          Text.translate('grindless.machine.' + m.name + '.tooltip.2')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
