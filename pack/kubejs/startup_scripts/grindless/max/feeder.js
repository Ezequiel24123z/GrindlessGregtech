// priority: -5334
// -----------------------------------------------------------------------------------------------
// MAX's accretion feeder (docs/eras/max.md, machine 10; package MAX-E1): the multiblock and its generator recipe type. The items are F1's
// (max/foundation.js) and the older lines'. The recipes are in server_scripts/grindless/max/feeder.js.
//
//   gtceu:accretion_feeder   27 x 9 x 27 feeder coil torus on truss pylons round a glass funnel, radiator fins, a GENERATOR (G.generators.configure) on one or two
//                            OpV dynamo hatches. Recipe type gtceu:accretion_power: circuit 1 burns a slag pellet (2^30 EU/t out, 2,400 t,
//                            collector panel and Wolter module worn now and then), a spent collector panel is rebuilt on the solar array fab (c5).
//
// Textures: tools/assets/Build-MaxFeederTextures.ps1. Names: client_scripts/grindless/max_feeder_lang.js.
// Published for the recipe script: global.grindless.maxFeeder.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MF = G.maxFeeder || (G.maxFeeder = {})
  const LOG = '[grindless/max] '

  const COIL = 'grindless:feeder_coil_casing'
  const COIL_TEXTURE = 'grindless:block/max/feeder_coil_casing'

  MF.machines = [
    {
      name: 'accretion_feeder', machine: 'gtceu:accretion_feeder', type: 'accretion_power', dataKey: 'grindless_accretion_power',
      lang: 'Accretion Feeder', maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 }, casing: COIL, texture: COIL_TEXTURE,
      width: 27, height: 9, depth: 27,
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
    MF.machines.forEach(function (m) {
      event.create(m.type)
        .category('generator')
        .setEUIO('out')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MF.machines.forEach(function (m) {
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
