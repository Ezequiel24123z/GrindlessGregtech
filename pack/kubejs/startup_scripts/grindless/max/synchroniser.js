// priority: -5498
// -----------------------------------------------------------------------------------------------
// MAX's ergoregion synchroniser (docs/eras/max.md, machine 12, lines L50 L51 L55; package MX-S2): the multiblock and its recipe type. No item
// of its own: every item it makes or takes is F1's (max/foundation.js). The recipes are in server_scripts/grindless/max/synchroniser.js.
//
//   gtceu:ergoregion_synchroniser   27 x 9 x 27 driver ring on a truss floor, clamp coil RF spokes to a membrane-vacuum hub, on two MAX hatches.
//                                   Recipe type
//                                   gtceu:ergoregion_synchronisation: circuit 1 builds a horizon phase lock (a fatigued VO2 sheet may
//                                   come out), circuit 2 re-locks a spent one on a fresh oscillator bank. Both run only at Sgr A*.
//
// Textures: tools/assets/Build-MaxSynchroniserTextures.ps1 (the loop sound is left for RF-6E). Names: client_scripts/grindless/max_synchroniser_lang.js.
// Published for the recipe script: global.grindless.maxSynchroniser.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MD = G.maxSynchroniser || (G.maxSynchroniser = {})
  const LOG = '[grindless/max] '

  const CASING = 'grindless:driver_ring_casing'
  const CASING_TEXTURE = 'grindless:block/max/driver_ring_casing'

  MD.machines = [
    {
      name: 'ergoregion_synchroniser', machine: 'gtceu:ergoregion_synchroniser', type: 'ergoregion_synchronisation',
      dataKey: 'grindless_ergoregion_synchronisation',
      lang: 'Ergoregion Synchroniser', maxIO: { itemsIn: 6, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 }, casing: CASING, texture: CASING_TEXTURE,
      width: 27, height: 9, depth: 27,
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
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
    MD.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.ARC)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MD.machines.forEach(function (m) {
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
