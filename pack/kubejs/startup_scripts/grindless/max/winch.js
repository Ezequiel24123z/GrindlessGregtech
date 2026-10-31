// priority: -5490
// -----------------------------------------------------------------------------------------------
// MAX's Geroch winch (docs/eras/max.md, machine 6; package MAX-D3): the multiblock and its generator recipe type. No item of its own: the
// canister, the tether and the worn segment are F1's (max/foundation.js). The recipes are in server_scripts/grindless/max/winch.js.
//
//   gtceu:geroch_winch   9 x 33 x 9 tower of geroch drum casing over a tether well, a GENERATOR (G.generators.configure) on one or two OpV
//                        dynamo hatches. Recipe type gtceu:geroch_power: circuit 1 lowers a canister (2^30 EU/t out, 2,400 t, a worn tether
//                        segment now and then), a worn segment is rebuilt into the tether in an assembler (a generator cannot run a consumer row).
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
      width: 9, height: 33, depth: 9,
      pal: { F: DRUM, A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil', L: 'gtceu:cleanroom_glass' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 1 }),
          Pat.part('output_bus', { min: 1, max: 1 }),
          Pat.part('energy_output', { min: 1, max: 2 })
        ]
      }
    }
  ]

  // x left to right, y bottom to top, z back to front. Row 0 the floor (hatches at the front), a hollow shaft for the tether in the middle,
  // accent bands every eighth row, a coil collar every sixteenth, a glass window in each wall between the bands, row 32 the roof.
  function winchCell(x, y, z) {
    var edgeX = x === 0 || x === 8
    var edgeZ = z === 0 || z === 8
    if (y === 0) return z === 8 && x >= 3 && x <= 5 ? 'X' : 'F'
    if (y === 32) return 'F'
    if (!edgeX && !edgeZ) {
      if (y % 16 === 0) return 'C'
      return '#'
    }
    if (y % 8 === 0) return 'A'
    if (edgeX && edgeZ) return y % 4 === 2 ? 'C' : 'F'
    var i = edgeX ? z : x
    if (i === 2 || i === 6) return 'A'
    if (i >= 3 && i <= 5 && y % 8 >= 3 && y % 8 <= 5) return 'L'
    if (y % 8 === 1 || y % 8 === 7) return 'A'
    return 'F'
  }

  var CELLS = { geroch_winch: winchCell }

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
