// priority: -5522
// -----------------------------------------------------------------------------------------------
// MAX's ergoregion synchroniser (docs/eras/max.md, machine 12, lines L50 L51 L55; package MX-S2): the multiblock and its recipe type. No item
// of its own: every item it makes or takes is F1's (max/foundation.js). The recipes are in server_scripts/grindless/max/synchroniser.js.
//
//   gtceu:ergoregion_synchroniser   19 x 7 x 19 of driver ring casing on two MAX hatches: rings of casing round a cold core, a superconducting
//                                   coil column of sapphire oscillators along the axis in an atomic casing sleeve. Recipe type
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
      width: 19, height: 7, depth: 19,
      pal: { F: CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil' },
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

  // x left to right, y bottom to top, z back to front. Row 0 the floor (hatches front and back), row 6 the roof, rows 1-5 the casing wall with
  // a glass band, a column of superconducting coil along the axis in an atomic casing sleeve (the cold core) and two rings of driver casing at
  // rows 2 and 4 round it, radius 6 to 7: the ring of RF drivers.
  function synchroniserCell(x, y, z) {
    var dx = x - 9
    var dz = z - 9
    var r2 = dx * dx + dz * dz
    var wall = x === 0 || x === 18 || z === 0 || z === 18
    if (y === 0) return (z === 0 || z === 18) && x >= 8 && x <= 10 ? 'X' : 'B'
    if (y === 6) return 'F'
    if (wall) {
      var along = x === 0 || x === 18 ? z : x
      return y >= 2 && y <= 4 && along >= 4 && along <= 14 && along % 5 !== 2 ? 'L' : 'F'
    }
    if (dx === 0 && dz === 0) return 'C'
    if (r2 <= 2 && y >= 2 && y <= 4) return 'A'
    if ((y === 2 || y === 4) && r2 >= 36 && r2 <= 49) return 'F'
    return '#'
  }

  var CELLS = { ergoregion_synchroniser: synchroniserCell }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: CELLS[m.name] })
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
