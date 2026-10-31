// priority: -5458
// -----------------------------------------------------------------------------------------------
// MAX's membrane line (docs/eras/max.md, machine 3, lines L2, L3 and L11; package MAX-B1): the multiblock and its recipe type. The
// recipes come from data/grindless/tables/membrane_line.json (server_scripts/grindless/max/membrane_line.js).
//
//   gtceu:membrane_line   21 x 5 x 5 roller line (grindless:membrane_roller_casing, MAX-F1), a CVD zone in the middle and a cold zone at
//                         the front, MAX. Recipe type gtceu:membrane_rolling (circuit 1 superconducting membrane, 2 albedo multilayer
//                         panel, 3 membrane belt). Two OpV 4 A energy hatches give VA[MAX]. The steps before each last step are rows of
//                         older machines, in their own files (see the server script).
//
// All ids (the casing and the products) are registered in max/foundation.js; this file registers no item. Textures:
// tools/assets/Build-MaxMembraneLineTextures.ps1. Names: client_scripts/grindless/max_membrane_line_lang.js.
// Published for the recipe script: global.grindless.membraneLine.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const ML = G.membraneLine || (G.membraneLine = {})
  const LOG = '[grindless/max] '

  const CASING = 'grindless:membrane_roller_casing'
  const CASING_TEXTURE = 'grindless:block/max/membrane_roller_casing'

  ML.table = 'kubejs/data/grindless/tables/membrane_line.json'

  function parts() {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 }),
      G.parallelHatch.part()
    ]
  }

  // items in include the programmed circuit; the cold zone's liquid nitrogen is a charge (not consumed)
  ML.machines = [
    {
      name: 'membrane_line', machine: 'gtceu:membrane_line', type: 'membrane_rolling', dataKey: 'grindless_membrane_rolling',
      lang: 'Membrane Line', maxIO: { itemsIn: 6, itemsOut: 3, fluidsIn: 2, fluidsOut: 0 }, casing: CASING, texture: CASING_TEXTURE,
      width: 5, height: 5, depth: 21,
      pal: { F: CASING, L: 'gtceu:laminated_glass', C: 'gtceu:cupronickel_coil_block', P: 'gtceu:tungstensteel_pipe_casing', Q: 'stainless_steel' },
      parts: parts
    }
  ]

  // x left to right, y bottom to top, z back (0) to front (20). The web runs through the middle of the bay at y 2: a roller pair (y 1 and
  // y 3) on every second slice, coil blocks either side of it in the CVD zone (z 7-13) and pipe casings in the cold zone (z 15-19); the
  // side walls are casing with glass windows and a frame post every fourth slice, the end walls and the roof casing, the floor casing
  // or part cells.
  function lineCell(x, y, z) {
    var side = x === 0 || x === 4
    if (y === 0) return 'X'
    if (y === 4) return x % 2 === 0 || z % 4 === 0 ? 'Q' : 'F'
    if (z === 0 || z === 20) return 'F'
    if (side) {
      if (z % 4 === 0) return 'Q'
      return y === 2 && z % 2 === 1 ? 'L' : 'F'
    }
    if (x === 2 && y === 2) return '#'
    if (x === 2 && z % 2 === 0) return 'F'
    if (y === 2 && z >= 7 && z <= 13) return 'C'
    if (y === 2 && z >= 15 && z <= 19) return 'P'
    return '#'
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: lineCell })
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
    ML.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    ML.machines.forEach(function (m) {
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
