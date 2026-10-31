// -----------------------------------------------------------------------------------------------
// MAX's accretion feeder (docs/eras/max.md, machine 10; package MAX-E1): the multiblock and its generator recipe type. The items are F1's
// (max/foundation.js) and the older lines'. The recipes are in server_scripts/grindless/max/feeder.js.
//
//   gtceu:accretion_feeder   15 x 9 x 15 ring of feeder coil casing round an open well, a GENERATOR (G.generators.configure) on one or two
//                            OpV dynamo hatches. Recipe type gtceu:accretion_power: circuit 1 burns a slag pellet (2^30 EU/t out, 2,400 t,
//                            collector panel and Wolter module worn now and then), circuit 2 reworks a spent collector panel.
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
      width: 15, height: 9, depth: 15,
      pal: { F: COIL, A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil', L: 'gtceu:cleanroom_glass' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 1 }),
          Pat.part('output_bus', { min: 1, max: 1 }),
          Pat.part('energy_output', { min: 1, max: 2 })
        ]
      }
    }
  ]

  // x left to right, y bottom to top, z back to front. A square ring two blocks thick round an open well: floor and roof of casing, the
  // outer wall banded with accent casing, the inner face alternating coil blocks (the magnetic ring) and glass (the collector window).
  function ringCell(x, y, z) {
    var ex = x < 14 - x ? x : 14 - x
    var ez = z < 14 - z ? z : 14 - z
    var e = ex < ez ? ex : ez
    if (e > 1) return y >= 1 && y <= 7 ? '#' : ' '
    if (y === 0) return 'X'
    if (y === 8) return 'F'
    if (e === 0) return y % 2 === 0 ? 'A' : 'F'
    return y % 2 === 1 ? 'L' : 'C'
  }

  var CELLS = { accretion_feeder: ringCell }

  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: CELLS[m.name] })
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
