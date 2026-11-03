// priority: -5428
// -----------------------------------------------------------------------------------------------
// MAX's mass stream injector (docs/eras/max.md, machine 7 and line L14; package MAX-D4): the multiblock and its recipe type. No item of its
// own: every item it makes or takes is F1's (max/foundation.js). The recipes are in server_scripts/grindless/max/injector.js.
//
//   gtceu:mass_stream_injector   21 x 9 x 21 truss and clamp-coil injector ring with eight stream turn magnets and a beam line, on two OpV 4 A hatches.
//                                Recipe type gtceu:mass_stream_injection: circuit 1 packs stream
//                                pellets into a stream bundle (the spent pellets come out), circuit 2 re-casts the spent pellets (7 in 8
//                                come back). Both recipes run only at Sgr A* (gcyr:black_hole_orbit).
//
// Textures: tools/assets/Build-MaxInjectorTextures.ps1. Names: client_scripts/grindless/max_injector_lang.js.
// Published for the recipe script: global.grindless.maxInjector.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MD = G.maxInjector || (G.maxInjector = {})
  const LOG = '[grindless/max] '

  const CASING = 'grindless:stream_turn_casing'
  const CASING_TEXTURE = 'grindless:block/max/stream_turn_casing'

  // items in include the programmed circuit; the flux-loaded FRC is consumed and its cooled exhaust leaves through the output hatch
  MD.machines = [
    {
      name: 'mass_stream_injector', machine: 'gtceu:mass_stream_injector', type: 'mass_stream_injection', dataKey: 'grindless_mass_stream_injection',
      lang: 'Mass Stream Injector', maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 }, casing: CASING, texture: CASING_TEXTURE,
      width: 21, height: 9, depth: 21,
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('output_hatch', { min: 1, max: 1 }),
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
