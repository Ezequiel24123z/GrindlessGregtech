// priority: -5669
// MAX+ machine 10, the void crystal fab (docs/eras/maxplus.md "Machines" 10; package XP-B4): the multiblock and its recipe type. Items and the casing
// are XP-F1's (maxplus/foundation.js); the recipes, with line P14's older-machine rows, are in server_scripts/grindless/maxplus/void_fab.js.
// Names: client_scripts/grindless/maxplus_void_fab_lang.js.
//
//   gtceu:void_crystal_fab  19 x 19 x 19 open frame round a seed chamber (see fabShape). Recipe type gtceu:void_crystal_fab: c1 grows a seed plate into void-grown diamond; c2 belongs to line K2 (XP-K).
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
    overlay: 'grindless:block/multiblock/void_crystal_fab',
    width: 19, height: 19, depth: 19,
    pal: {
      F: CASING, B: 'grindless:bound_lattice_casing', R: 'grindless:cryostat_casing', E: 'gtceu:atomic_casing', A: 'gtceu:atomic_casing',
      C: 'gtceu:superconducting_coil', L: 'gtceu:cleanroom_glass'
    },
    parts: parts
  }

  // x left to right, y bottom to top, z back to front (docs/eras/lines-opv-maxplus.md 6.3): an open cube round a seed chamber. Lattice pylons
  // and a lattice drum hold the frame, cryostat beams ring it at two heights, an Fe-56 vessel wall closes the chamber and a coil-ringed atomic
  // casing seed post stands in it. There is no void window: this machine grows the diamond that feeds them.
  function fabShape() {
    var m = MV.machine
    var s = G.uevShapes.scene(m.width, m.height, m.depth)
    s.box(0, 0, 0, 18, 1, 18, 'B')
    s.edges(0, 0, 0, 18, 18, 18, 'F')
    s.box(0, 2, 0, 1, 17, 1, 'B').box(17, 2, 0, 18, 17, 1, 'B').box(0, 2, 17, 1, 17, 18, 'B').box(17, 2, 17, 18, 17, 18, 'B')
    s.cyl('y', 9, 9, 8, 2, 16, 'B', true)
    for (var y = 3; y <= 17; y += 6) s.room(0, y, 0, 18, y + 1, 18, 'R', 'bt', null)
    s.cyl('y', 9, 9, 6, 3, 15, 'E', true)
    s.cyl('y', 9, 9, 6, 16, 16, 'B')
    s.cyl('y', 9, 9, 0, 3, 15, 'A')
    for (var c = 4; c <= 14; c += 2) s.cyl('y', 9, 9, 3, c, c, 'C', true, null)
    s.booth('F', 3)
    return s.fn()
  }

  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: fabShape() })
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
