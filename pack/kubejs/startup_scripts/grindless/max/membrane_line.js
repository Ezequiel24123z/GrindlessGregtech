// priority: -5448
// -----------------------------------------------------------------------------------------------
// MAX's membrane line (docs/eras/max.md, machine 3, lines L2, L3 and L11; package MAX-B1): the multiblock and its recipe type. The
// recipes come from data/grindless/tables/membrane_line.json (server_scripts/grindless/max/membrane_line.js).
//
//   gtceu:membrane_line   9 x 9 x 45 roll-to-roll hall: truss ladder frame, glass panels, roller stations (grindless:membrane_roller_casing, MAX-F1), a CVD zone in the middle and a cold zone at
//                         the front, MAX. Recipe type gtceu:membrane_rolling (circuit 1 superconducting membrane, 2 albedo multilayer
//                         panel, 3 membrane belt). Two OpV 4 A energy hatches give VA[MAX]. The steps before each last step are rows of
//                         older machines, in their own files (see the server script).
//
// All ids (the casing and the products) are registered in max/foundation.js; this file registers no item. Textures:
// tools/assets/Build-MaxMembraneLineTextures.ps1. Names: client_scripts/grindless/max_membrane_line_lang.js.
// Published for the recipe script: global.grindless.membraneLine.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const ML = G.membraneLine || (G.membraneLine = {})
  const LOG = '[grindless/max] '

  const CASING = 'grindless:membrane_roller_casing'
  const CASING_TEXTURE = 'grindless:block/max/membrane_roller_casing'

  ML.table = 'kubejs/data/grindless/tables/membrane_line.json'

  function parts() {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 }),
      G.parallelHatch.part()
    ]
  }

  // items in include the programmed circuit; the cold zone's liquid nitrogen is a charge (not consumed)
  ML.machines = [
    {
      name: 'membrane_line', machine: 'gtceu:membrane_line', type: 'membrane_rolling', dataKey: 'grindless_membrane_rolling',
      lang: 'Membrane Line', maxIO: { itemsIn: 6, itemsOut: 3, fluidsIn: 2, fluidsOut: 0 }, casing: CASING, texture: CASING_TEXTURE,
      width: 9, height: 9, depth: 45,
      parts: parts
    }
  ]

  // built in the machine registry callback: max/shapes.js may load after this file
  function spec(m) {
    return G.maxShapes.build(Pat, m.name, m.casing, m.parts())
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

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    ML.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    ML.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
