// priority: -5403
// -----------------------------------------------------------------------------------------------
// MAX's horizon interferometer (docs/eras/max.md, machine 11, lines L47, L48, L49, L56 and L57; package MX-S1): the multiblock and its
// recipe type. No item of its own: every item it makes or takes is F1's (max/foundation.js). The recipes are in
// server_scripts/grindless/max/horizon_interferometer.js.
//
//   gtceu:horizon_interferometer   45 x 7 x 41 triangle of three test mass stations joined by laser link arms on truss trestles, on two OpV 4 A hatches.
//                                  Recipe type gtceu:horizon_interferometry: circuit 1 the cloud phase map (shell c2's final spin map is kept),
//                                  circuit 2 the calibrated oscillator banks (the map is kept), circuit 3 the map again from the used instruments.
//                                  All three run only at Sgr A* (gcyr:black_hole_orbit).
//
// Textures: the face is our own (ART-POLISH #298, Build-MaxHorizonInterferometerTextures.ps1), grindless:block/multiblock/horizon_interferometer.
// Names: client_scripts/grindless/max_horizon_interferometer_lang.js.
// Published for the recipe script: global.grindless.maxHorizonInterferometer.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MD = G.maxHorizonInterferometer || (G.maxHorizonInterferometer = {})
  const LOG = '[grindless/max] '

  const ENCLOSURE = 'grindless:test_mass_enclosure_casing'
  const LINK = 'grindless:laser_link_casing'

  // items in include the programmed circuit; no fluids
  MD.machines = [
    {
      name: 'horizon_interferometer', machine: 'gtceu:horizon_interferometer', type: 'horizon_interferometry', dataKey: 'grindless_horizon_interferometry',
      lang: 'Horizon Interferometer', maxIO: { itemsIn: 9, itemsOut: 4, fluidsIn: 0, fluidsOut: 0 }, casing: ENCLOSURE,
      texture: 'grindless:block/max/test_mass_enclosure_casing',
      width: 45, height: 7, depth: 41,
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

  // three 3 x 3 stations (back middle, front left, front right) five blocks tall, an arm of laser link casing along each side of the triangle at
  // row 2, the hatch row between the two front stations on the floor
  var STATIONS = [{ x: 9, z: 0 }, { x: 0, z: 18 }, { x: 18, z: 18 }]
  var CORNERS = [{ x: 10, z: 1 }, { x: 1, z: 19 }, { x: 19, z: 19 }]

  function stationAt(x, z) {
    for (var i = 0; i < STATIONS.length; i++) {
      var s = STATIONS[i]
      if (x >= s.x && x < s.x + 3 && z >= s.z && z < s.z + 3) return s
    }
    return null
  }

  function distToSegment(px, pz, a, b) {
    var dx = b.x - a.x
    var dz = b.z - a.z
    var t = ((px - a.x) * dx + (pz - a.z) * dz) / (dx * dx + dz * dz)
    t = Math.max(0, Math.min(1, t))
    var cx = a.x + t * dx
    var cz = a.z + t * dz
    return Math.sqrt((px - cx) * (px - cx) + (pz - cz) * (pz - cz))
  }

  function onArm(x, z) {
    return distToSegment(x, z, CORNERS[0], CORNERS[1]) <= 0.6 || distToSegment(x, z, CORNERS[0], CORNERS[2]) <= 0.6 ||
      distToSegment(x, z, CORNERS[1], CORNERS[2]) <= 0.6
  }

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
        .workableCasingModel(m.texture, 'grindless:block/multiblock/horizon_interferometer')
    })
  })
})()
