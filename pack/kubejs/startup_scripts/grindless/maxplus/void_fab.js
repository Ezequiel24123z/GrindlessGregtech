// priority: -5659
// MAX+ machine 10, the void crystal fab (docs/eras/maxplus.md "Machines" 10; package XP-B4): the multiblock and its recipe type. Items and the casing
// are XP-F1's (maxplus/foundation.js); the recipes, with line P14's older-machine rows, are in server_scripts/grindless/maxplus/void_fab.js.
// Names: client_scripts/grindless/maxplus_void_fab_lang.js.
//
//   gtceu:void_crystal_fab  15 x 15 x 15 open frame of horizon machine casing round a seed chamber: glass faces, coil ribs and an atomic casing seed
//                           post. Recipe type gtceu:void_crystal_fab: c1 grows a seed plate into void-grown diamond; c2 belongs to line K2 (XP-K).
//
// Runs only at the Local Group filament (rows carry the dimension) at VA[MAX] on a 1,024 A MAX+ energy hatch. Rows run as written: the modifier is IDENTITY.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MV = G.maxPlusVoidFab || (G.maxPlusVoidFab = {})
  const LOG = '[grindless/maxplus] '

  const CASING = 'grindless:horizon_machine_casing'

  function parts() {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 2 }),
      Pat.part('output_hatch', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ]
  }

  MV.machine = {
    name: 'void_crystal_fab', machine: 'gtceu:void_crystal_fab', type: 'void_crystal_fab', dataKey: 'grindless_void_crystal_fab',
    lang: 'Void Crystal Fab', maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 2, fluidsOut: 1 }, casing: CASING, texture: 'grindless:block/max/mirror_shell_segment',
    overlay: 'grindless:block/multiblock/positronium_condensate_lab',
    width: 15, height: 15, depth: 15,
    pal: { F: CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil' },
    parts: parts
  }

  // x left to right, y bottom to top, z back to front. The floor carries the part cells at the front edge; the edges are casing ribs, the faces glass,
  // with a coil ring at mid height round the atomic casing seed post.
  function fabCell(x, y, z) {
    if (y === 0) return z === 0 && x >= 5 && x <= 9 ? 'X' : 'B'
    var ex = x === 0 || x === 14
    var ez = z === 0 || z === 14
    if (y === 14) return 'B'
    if (ex || ez) return (ex && ez) || y % 7 === 0 ? 'F' : 'L'
    var dx = x - 7
    var dz = z - 7
    var r2 = dx * dx + dz * dz
    if (y === 7 && r2 >= 16 && r2 <= 25) return 'C'
    if (dx === 0 && dz === 0 && y >= 5 && y <= 9) return 'A'
    return '#'
  }

  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: fabCell })
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
    var m = MV.machine
    event.create(m.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var m = MV.machine
    var type = GTRecipeTypes.get(m.type)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
    type.addDataInfo(infoOf(m.dataKey))
    m.spec = spec(m)
    Pat.register(m.machine, m.spec)

    event.create(m.name, 'multiblock')
      .langValue(m.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(m.type)
      .recipeModifier(function (machine, recipe) { return ModifierFunction.IDENTITY }, true)
      .appearanceBlock(function () { return Block.getBlock(m.casing) })
      .pattern(function (def) { return Pat.build(def, m.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type))
      ])
      .workableCasingModel(m.texture, m.overlay)
  })
})()
