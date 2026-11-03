// priority: -5468
// -----------------------------------------------------------------------------------------------
// MAX's Rydberg array works (docs/eras/max.md, machine 1, lines L19, L23, L29, L40, L43 and L46; package MAX-B3): the multiblock and its
// recipe type. No item of its own: every item it makes or takes is F1's (max/foundation.js). The recipes are in
// server_scripts/grindless/max/rydberg.js.
//
//   gtceu:rydberg_array_works   15 x 11 x 17 optical lab round a membrane-vacuum cell with Helmholtz coils, on two OpV 4 A hatches. Recipe type gtceu:rydberg_assembly: circuit 1 the
//                               Rydberg logic array (tweezer die, Rb-87 cartridge, laser die, squeezed-light chip, memory node, locked
//                               microcomb, UV fibre harness and crossed AOD pair in a superfluid He-3 bath; the spent cartridge comes back
//                               as getter scrap), circuit 2 refurbishes a spent array with a new cartridge.
//
// Shape: optical-table casing for the table and the walls, GTM atomic casing for the vacuum chamber, a ring of coils around it, a cleanroom
// glass window. Textures: tools/assets/Build-MaxRydbergTextures.ps1. Names: client_scripts/grindless/max_rydberg_lang.js.
// Published for the recipe script: global.grindless.maxRydberg.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MR = G.maxRydberg || (G.maxRydberg = {})
  const LOG = '[grindless/max] '

  const TABLE_CASING = 'grindless:max_optical_table_casing'
  const TABLE_TEXTURE = 'grindless:block/max/max_optical_table_casing'

  // items in include the programmed circuit; the superfluid He-3 of c1 is consumed
  MR.machines = [
    {
      name: 'rydberg_array_works', machine: 'gtceu:rydberg_array_works', type: 'rydberg_assembly', dataKey: 'grindless_rydberg_assembly',
      lang: 'Rydberg Array Works', maxIO: { itemsIn: 9, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 }, casing: TABLE_CASING, texture: TABLE_TEXTURE,
      width: 15, height: 11, depth: 17,
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
    MR.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.ARC)
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
