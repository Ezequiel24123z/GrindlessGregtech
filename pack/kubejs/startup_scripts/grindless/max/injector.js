// -----------------------------------------------------------------------------------------------
// MAX's mass stream injector (docs/eras/max.md, machine 7 and line L14; package MAX-D4): the multiblock and its recipe type. No item of its
// own: every item it makes or takes is F1's (max/foundation.js). The recipes are in server_scripts/grindless/max/injector.js.
//
//   gtceu:mass_stream_injector   15 x 7 x 15 of stream turn casing on two OpV 4 A hatches: a bore of superconducting coils along the middle
//                                with turn rings of atomic casing around it. Recipe type gtceu:mass_stream_injection: circuit 1 packs stream
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
      width: 15, height: 7, depth: 15,
      pal: { F: CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil' },
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

  // x left to right, y bottom to top, z back to front. Row 0 the floor (hatches front and back), row 6 the roof, rows 1-5 the casing wall, a coil
  // bore along the middle at row 3 and a turn ring of atomic casing around the bore every fourth slice.
  function injectorCell(x, y, z) {
    var dx = x - 7
    var wall = x === 0 || x === 14 || z === 0 || z === 14
    if (y === 0) return (z === 0 || z === 14) && x >= 6 && x <= 8 ? 'X' : 'B'
    if (y === 6) return 'F'
    if (wall) {
      var along = x === 0 || x === 14 ? z : x
      return y >= 2 && y <= 4 && along >= 3 && along <= 11 && along % 4 !== 2 ? 'L' : 'F'
    }
    if (y === 3 && dx === 0) return 'C'
    if (z % 4 === 2 && ((y === 2 || y === 4) && Math.abs(dx) <= 1 || y === 3 && Math.abs(dx) === 1)) return 'A'
    return '#'
  }

  var CELLS = { mass_stream_injector: injectorCell }

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
