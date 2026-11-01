// -----------------------------------------------------------------------------------------------
// MAX's horizon flux clamp (docs/eras/max.md, machine 13 and line L54; package MX-S3): the multiblock and its recipe type. Every item it makes
// or takes is F1's (max/foundation.js). The recipes are in server_scripts/grindless/max/flux_clamp.js.
//
//   gtceu:horizon_flux_clamp   23 x 7 x 23 of clamp coil casing on two OpV 4 A hatches: a ring of casing coils held off the floor on stream
//                              bundle block supports round a cold superconducting core. Recipe type gtceu:horizon_flux_clamp: circuit 1 winds
//                              four HTS flux pumps, eight field coils and four stream bundles into the clamp winding under flux-loaded
//                              FRC; the flares the winding suppresses come out as a reconnection plasmoid (the UXV mass filter takes it
//                              back). Runs only at Sgr A* (gcyr:black_hole_orbit).
//
// Textures: left for a later package (the face and the loop sound). Names: client_scripts/grindless/max_flux_clamp_lang.js.
// Published for the recipe script: global.grindless.maxFluxClamp.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MD = G.maxFluxClamp || (G.maxFluxClamp = {})
  const LOG = '[grindless/max] '

  const CASING = 'grindless:clamp_coil_casing'
  const CASING_TEXTURE = 'grindless:block/max/clamp_coil_casing'

  MD.machines = [
    {
      name: 'horizon_flux_clamp', machine: 'gtceu:horizon_flux_clamp', type: 'horizon_flux_clamp', dataKey: 'grindless_horizon_flux_clamp',
      lang: 'Horizon Flux Clamp', maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 }, casing: CASING, texture: CASING_TEXTURE,
      width: 23, height: 7, depth: 23,
      pal: { F: CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil', V: 'grindless:stream_bundle_block' },
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

  // x left to right, y bottom to top, z back to front. Row 0 the floor (hatches front and back), row 6 the roof, rows 1-5 the casing wall with a
  // glass band, a superconducting core on the axis in an atomic casing sleeve, and at row 3 the clamp ring (radius 6 to 7) lifted on four
  // stream bundle block supports (rows 1-2 and 4-5 at radius 6, on the axes).
  function clampCell(x, y, z) {
    var dx = x - 11
    var dz = z - 11
    var r2 = dx * dx + dz * dz
    var wall = x === 0 || x === 22 || z === 0 || z === 22
    if (y === 0) return (z === 0 || z === 22) && x >= 10 && x <= 12 ? 'X' : 'B'
    if (y === 6) return 'F'
    if (wall) {
      var along = x === 0 || x === 22 ? z : x
      return y >= 2 && y <= 4 && along >= 4 && along <= 18 && along % 5 !== 2 ? 'L' : 'F'
    }
    if (dx === 0 && dz === 0) return 'C'
    if (r2 <= 2 && y >= 2 && y <= 4) return 'A'
    if (y === 3 && r2 >= 36 && r2 <= 49) return 'F'
    if ((y === 1 || y === 2 || y === 4 || y === 5) && ((dx === 0 && (dz === 6 || dz === -6)) || (dz === 0 && (dx === 6 || dx === -6)))) return 'V'
    return '#'
  }

  var CELLS = { horizon_flux_clamp: clampCell }

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
