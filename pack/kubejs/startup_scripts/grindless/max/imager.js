// priority: -5415
// -----------------------------------------------------------------------------------------------
// MAX's photon ring imager (docs/eras/max.md, machine 5, lines L21, L22, L44 and L45; package MAX-D2): the multiblock and its recipe type.
// No item of its own: every item it makes or takes is F1's (max/foundation.js). The recipes are in server_scripts/grindless/max/imager.js.
//
//   gtceu:photon_ring_imager   25 x 11 x 25 optical-table dish with a ring of eight sub-dishes on a truss deck, on two OpV 4 A hatches. Recipe type
//                              gtceu:photon_ring_imaging: circuit 1 the Sgr A* spin map, circuit 2 the nuclear star cluster ephemeris
//                              (the map is kept). Both recipes run only at Sgr A* (gcyr:black_hole_orbit).
//
// Shape: optical-table casing for the floor, roof and truss, GTM atomic casing for the ring wall with cleanroom glass windows, a ring of
// superconducting coils around the core. Textures: tools/assets/Build-MaxImagerTextures.ps1. Names: client_scripts/grindless/max_imager_lang.js.
// Published for the recipe script: global.grindless.maxImager.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MD = G.maxImager || (G.maxImager = {})
  const LOG = '[grindless/max] '

  const TABLE_CASING = 'grindless:max_optical_table_casing'
  const TABLE_TEXTURE = 'grindless:block/max/max_optical_table_casing'

  // items in include the programmed circuit; the liquid helium of the core is consumed and boils off
  MD.machines = [
    {
      name: 'photon_ring_imager', machine: 'gtceu:photon_ring_imager', type: 'photon_ring_imaging', dataKey: 'grindless_photon_ring_imaging',
      lang: 'Photon Ring Imager', maxIO: { itemsIn: 9, itemsOut: 3, fluidsIn: 1, fluidsOut: 1 }, casing: TABLE_CASING, texture: TABLE_TEXTURE,
      width: 25, height: 11, depth: 25,
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
