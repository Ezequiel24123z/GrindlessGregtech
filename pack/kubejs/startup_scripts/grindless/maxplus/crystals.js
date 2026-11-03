// priority: -5569
// MAX+ machine 13, the horizon crystal furnace (docs/eras/maxplus.md "Machines" 13; package XP-H2; it absorbed the multi-plasma blender, Decision S-3): the
// multiblock and its recipe type. Items, fluids and the casing are XP-F1's (maxplus/foundation.js); the recipes, with lines T8, T9 and T10's
// older-machine rows, are in server_scripts/grindless/maxplus/crystals.js. Names: client_scripts/grindless/maxplus_crystals_lang.js.
//
//   gtceu:horizon_crystal_furnace 21 x 23 x 21 crystal puller tower: a lattice plinth, a cryostat growth chamber in a Fe-56 shield tube, four pylons
//                                 and a coil puller rod; eight plasma inlets at its foot. Recipe type gtceu:horizon_crystal_furnace:
//                                 c0 eight plasmas become the horizon crystal slurry, c1 core crystal boule, c2 controller crystal boule.
//
// It runs only at Sgr A* orbit (rows carry the dimension) on a 1,024 A MAX+ energy hatch. Rows run as written: the modifier is IDENTITY.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MC = G.maxPlusCrystals || (G.maxPlusCrystals = {})
  const LOG = '[grindless/maxplus] '

  const CASING = 'grindless:horizon_machine_casing'
  const PAL = {
    F: CASING, B: 'grindless:bound_lattice_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil',
    R: 'grindless:primordial_cryostat_casing', E: 'grindless:fe56_shield_casing', K: 'grindless:kerr_coil_casing', W: 'grindless:void_diamond_window'
  }

  // Eight plasmas feed the slurry row (c0), so the furnace takes up to twelve input hatches; the slurry leaves by an output hatch.
  function furnaceParts() {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 12 }),
      Pat.part('output_hatch', { min: 0, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ]
  }

  MC.machines = {
    furnace: {
      name: 'horizon_crystal_furnace', machine: 'gtceu:horizon_crystal_furnace', type: 'horizon_crystal_furnace', dataKey: 'grindless_horizon_crystal_furnace',
      lang: 'Horizon Crystal Furnace', maxIO: { itemsIn: 5, itemsOut: 1, fluidsIn: 8, fluidsOut: 1 }, casing: CASING,
      texture: 'grindless:block/max/mirror_shell_segment', overlay: 'grindless:block/multiblock/horizon_crystal_furnace',
      width: 21, height: 23, depth: 21, pal: PAL, parts: furnaceParts
    }
  }

  // x left to right, y bottom to top, z back to front (docs/eras/lines-opv-maxplus.md 6.3): a crystal puller tower with eight plasma inlets at
  // its foot. A lattice plinth carries a cryostat growth chamber ringed with Kerr bands, a Fe-56 shield tube round it with four void-diamond
  // window strips, four lattice pylons and a coil puller rod up the axis. The inlets are part cells in the plinth's front face.
  function furnaceShape() {
    var m = MC.machines.furnace
    var s = G.uevShapes.scene(m.width, m.height, m.depth)
    s.room(0, 0, 0, 20, 3, 20, 'B')
    s.edges(0, 0, 0, 20, 3, 20, 'F')
    s.cyl('y', 10, 10, 9, 4, 6, 'B', true, null)
    s.cyl('y', 10, 10, 7, 4, 20, 'E', true)
    for (var wy = 6; wy <= 19; wy++) {
      for (var o = -1; o <= 1; o++) {
        s.set(5 + o, wy, 5, 'W').set(15 + o, wy, 5, 'W').set(5 + o, wy, 15, 'W').set(15 + o, wy, 15, 'W')
        s.set(5, wy, 5 + o, 'W').set(15, wy, 5 + o, 'W').set(5, wy, 15 + o, 'W').set(15, wy, 15 + o, 'W')
      }
    }
    s.cyl('y', 10, 10, 4, 4, 20, 'R', true)
    for (var y = 4; y <= 20; y += 4) s.cyl('y', 10, 10, 4, y, y, 'K', true, null)
    s.box(1, 4, 9, 3, 21, 11, 'B')
    s.box(17, 4, 9, 19, 21, 11, 'B')
    s.box(9, 4, 1, 11, 21, 3, 'B')
    s.box(9, 4, 17, 11, 21, 19, 'B')
    s.box(0, 4, 0, 1, 21, 1, 'B').box(19, 4, 0, 20, 21, 1, 'B').box(0, 4, 19, 1, 21, 20, 'B').box(19, 4, 19, 20, 21, 20, 'B')
    s.room(0, 8, 0, 20, 8, 20, 'R', 'bt', null)
    s.room(0, 12, 0, 20, 12, 20, 'K', 'bt', null)
    s.room(0, 16, 0, 20, 16, 20, 'R', 'bt', null)
    s.room(0, 14, 0, 20, 14, 20, 'B', 'bt', null)
    s.room(0, 20, 0, 20, 21, 20, 'B', 'bt', null)
    s.box(0, 22, 0, 20, 22, 20, 'K')
    s.cyl('y', 10, 10, 7, 22, 22, 'B')
    s.cyl('y', 10, 10, 0, 4, 22, 'A')
    for (var c = 4; c <= 22; c++) if (c % 3 === 1) s.set(10, c, 10, 'C')
    s.booth('F', 3)
    for (var i = 0; i < 5; i++) s.set(3 + i, 1, 20, 'X').set(13 + i, 1, 20, 'X')
    return s.fn()
  }

  function spec(m, fn) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: fn })
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
    ;[MC.machines.furnace].forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.ARC)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    ;[[MC.machines.furnace, furnaceShape]].forEach(function (pair) {
      var m = pair[0]
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m, pair[1]())
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
  })
})()
