// priority: -5458
// -----------------------------------------------------------------------------------------------
// MAX's segment reclamation works (docs/eras/max.md, machine 14, lines L52 and L53; package MX-S4): the multiblock and its recipe type. No
// item of its own: every item it makes or takes is F1's (max/foundation.js). The recipes are in server_scripts/grindless/max/reclamation.js.
//
//   gtceu:segment_reclamation_works   19 x 11 x 23 bay hall with truss gantry crane and four membrane-vacuum strip tanks a side, on two OpV 4 A hatches. Recipe type gtceu:segment_reclamation: circuit 1 opens one
//                                     ablated mirror-shell segment into its seven part streams (truss, membrane, cryocooler, coupler,
//                                     Sn-Li dross, electronics, VO2 sheet). It runs at Sgr A* orbit only: nothing else can open the part.
//
// Shape: a docking bay of reclamation bay casing (a walled hall, a glass strip window on each side, frame posts at the corners) around a
// floor of field-frozen casing. A cold strip line runs down the middle of the bay: a bed of field-frozen casing and a superconducting coil
// rail under the roof, whose ribs are steel. The hatches sit in the front row of the floor. Textures: reclamation bay casing is F1's.
// Names: client_scripts/grindless/max_reclamation_lang.js. Published for the recipe script: global.grindless.maxReclamation.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MR = G.maxReclamation || (G.maxReclamation = {})
  const LOG = '[grindless/max] '

  const BAY_CASING = 'grindless:reclamation_bay_casing'
  const BAY_TEXTURE = 'grindless:block/max/reclamation_bay_casing'

  // items in include the programmed circuit; one segment in, seven streams out
  MR.machines = [
    {
      name: 'segment_reclamation_works', machine: 'gtceu:segment_reclamation_works', type: 'segment_reclamation', dataKey: 'grindless_segment_reclamation',
      lang: 'Segment Reclamation Works', maxIO: { itemsIn: 2, itemsOut: 7, fluidsIn: 0, fluidsOut: 0 }, casing: BAY_CASING, texture: BAY_TEXTURE,
      width: 19, height: 11, depth: 23,
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
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
    MR.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MR.machines.forEach(function (m) {
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
