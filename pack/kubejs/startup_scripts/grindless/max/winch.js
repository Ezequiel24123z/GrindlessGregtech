// priority: -5518
// -----------------------------------------------------------------------------------------------
// MAX's Geroch winch (docs/eras/max.md, machine 6; package MAX-D3): the multiblock and its generator recipe type. No item of its own: the
// canister, the tether and the worn segment are F1's (max/foundation.js). The recipes are in server_scripts/grindless/max/winch.js.
//
//   gtceu:geroch_winch   13 x 45 x 13 truss tower with a clamp-coil tether well, radiator louvres, Geroch drum on top, a GENERATOR (G.generators.configure) on one or two OpV
//                        dynamo hatches. Recipe type gtceu:geroch_power: circuit 1 lowers a canister (2^30 EU/t out, 2,400 t, the horizon tether worn 1/128 in and a spent
//                        segment 1/128 out), a worn segment is rebuilt into the tether in an assembler (a generator cannot run a consumer row).
//
// Textures: tools/assets/Build-MaxWinchTextures.ps1. Names: client_scripts/grindless/max_winch_lang.js.
// Published for the recipe script: global.grindless.maxWinch.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MW = G.maxWinch || (G.maxWinch = {})
  const LOG = '[grindless/max] '

  const DRUM = 'grindless:geroch_drum_casing'
  const DRUM_TEXTURE = 'grindless:block/max/geroch_drum_casing'

  MW.machines = [
    {
      name: 'geroch_winch', machine: 'gtceu:geroch_winch', type: 'geroch_power', dataKey: 'grindless_geroch_power',
      lang: 'Geroch Winch', maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 }, casing: DRUM, texture: DRUM_TEXTURE,
      width: 13, height: 45, depth: 13,
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 1 }),
          Pat.part('output_bus', { min: 1, max: 1 }),
          Pat.part('energy_output', { min: 1, max: 2 })
        ]
      }
    }
  ]

  // built in the machine registry callback: max/shapes.js may load after this file
  function spec(m) {
    return G.maxShapes.build(Pat, m.name, m.casing, m.parts())
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
    MW.machines.forEach(function (m) {
      event.create(m.type)
        .category('generator')
        .setEUIO('out')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MW.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      G.generators.configure(event.create(m.name, 'multiblock'), { maxParallels: 1, name: m.name })
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type))
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
