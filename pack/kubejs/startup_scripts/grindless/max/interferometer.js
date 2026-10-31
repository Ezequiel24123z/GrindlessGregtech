// -----------------------------------------------------------------------------------------------
// MAX's atom interferometer works (docs/eras/max.md, machine 2, lines L4 and L33; package MAX-B2): the multiblock and its recipe type. No
// item of its own: every item it makes or takes is F1's (max/foundation.js). The recipes are in server_scripts/grindless/max/interferometer.js.
//
//   gtceu:atom_interferometer_works   5 x 15 x 5 drop tower on two OpV 4 A hatches. Recipe type gtceu:atom_interferometry: circuit 1 the
//                                     matter-wave gradiometer (L4 last step; the degenerate Sr cartridge is spent, a fluid bath of
//                                     superfluid He-3 is used up), circuit 2 the shell gradient map (the gradiometer calibrated on the
//                                     Sgr A* spin map).
//
// Shape: the tower is the point (drop time). Optical-table casing, a magnetic shield of field-frozen casing (the chain lamina stack is an
// item, not a block), stainless frame posts, a coil at the top of the shaft. Textures: tools/assets/Build-MaxInterferometerTextures.ps1.
// Names: client_scripts/grindless/max_interferometer_lang.js. Published for the recipe script: global.grindless.maxInterferometer.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MI = G.maxInterferometer || (G.maxInterferometer = {})
  const LOG = '[grindless/max] '

  const TABLE_CASING = 'grindless:max_optical_table_casing'
  const TABLE_TEXTURE = 'grindless:block/max/max_optical_table_casing'

  // items in include the programmed circuit; the superfluid He-3 of c1 is consumed
  MI.machines = [
    {
      name: 'atom_interferometer_works', machine: 'gtceu:atom_interferometer_works', type: 'atom_interferometry', dataKey: 'grindless_atom_interferometry',
      lang: 'Atom Interferometer Works', maxIO: { itemsIn: 6, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 }, casing: TABLE_CASING, texture: TABLE_TEXTURE,
      width: 5, height: 15, depth: 5,
      pal: { F: TABLE_CASING, M: 'grindless:field_frozen_casing', L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil', Q: 'stainless_steel' },
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

  // x left to right, y bottom to top, z back to front. Rows 0-2 the optical table (floor with the hatches at front and back, a casing
  // plinth), rows 3-11 the shielded drop shaft (a glass window at row 7), row 12 a casing collar, row 13 the open top of the shaft, row 14
  // the roof with the cooling-laser coil over the middle of the shaft.
  function towerCell(x, y, z) {
    var edgeX = x === 0 || x === 4
    var edgeZ = z === 0 || z === 4
    if (y === 0) return (z === 4 || z === 0) && x >= 1 && x <= 3 ? 'X' : 'F'
    if (y === 14) return x === 2 && z === 2 ? 'C' : 'F'
    if (!edgeX && !edgeZ) return y === 1 && x === 2 && z === 2 ? 'C' : '#'
    if (edgeX && edgeZ) return 'Q'
    if (y <= 2 || y === 12 || y === 13) return 'F'
    if (y === 7) return x === 2 || z === 2 ? 'L' : 'M'
    return 'M'
  }

  var CELLS = { atom_interferometer_works: towerCell }

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
    MI.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MI.machines.forEach(function (m) {
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
