// priority: -5539
// MAX+ machine 9, the blueshift forge (docs/eras/maxplus.md "Machines" 9; package XP-B3): the multiblock and its recipe type. Items and the casing
// are XP-F1's (maxplus/foundation.js); the recipes, with lines P12, P13 and P24's older-machine rows, are in
// server_scripts/grindless/maxplus/blueshift.js. Names: client_scripts/grindless/maxplus_blueshift_lang.js.
//
//   gtceu:blueshift_forge   13 x 31 x 13 tower of horizon machine casing over a tether well: a superconducting coil spine climbs the axis inside
//                           glass-banded walls. Recipe type gtceu:blueshift_forge: c1 hangs the target in a falling-frame photonuclear beam.
//
// Runs only at the M31 nucleus (rows carry the dimension) at V[MAX] x 16 on a 1,024 A MAX+ energy hatch. Rows run as written: the modifier is IDENTITY.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MB = G.maxPlusBlueshift || (G.maxPlusBlueshift = {})
  const LOG = '[grindless/maxplus] '

  const CASING = 'grindless:horizon_machine_casing'

  function parts() {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 0, max: 2 }),
      Pat.part('output_hatch', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ]
  }

  MB.machine = {
    name: 'blueshift_forge', machine: 'gtceu:blueshift_forge', type: 'blueshift_forge', dataKey: 'grindless_blueshift_forge',
    lang: 'Blueshift Forge', maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 0, fluidsOut: 1 }, casing: CASING, texture: 'grindless:block/max/mirror_shell_segment',
    overlay: 'grindless:block/multiblock/blueshift_forge',
    width: 17, height: 51, depth: 17,
    pal: {
      F: CASING, B: 'grindless:bound_lattice_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil',
      E: 'gtceu:atomic_casing', K: 'grindless:kerr_coil_casing', W: 'gtceu:cleanroom_glass'
    },
    parts: parts
  }

  // x left to right, y bottom to top, z back to front (docs/eras/lines-opv-maxplus.md 6.3): a tower over a tether well. A lattice plinth holds
  // the well (a Kerr-lined shaft); the tower is a lattice tube banded with Fe-56 rings and Kerr bands, with four void-diamond window strips,
  // a Fe-56 core tube inside it joined by lattice spokes, and a coil spine up the axis. The front booth holds the controller and the hatches.
  function forgeShape() {
    var m = MB.machine
    var s = G.uevShapes.scene(m.width, m.height, m.depth)
    s.room(0, 0, 0, 16, 3, 16, 'B')
    s.edges(0, 0, 0, 16, 3, 16, 'F')
    s.cyl('y', 8, 8, 2, 1, 3, 'K', true)
    s.cyl('y', 8, 8, 7, 4, 49, 'B', true)
    for (var y = 4; y <= 49; y++) {
      if (y % 6 === 4) s.cyl('y', 8, 8, 7, y, y, 'E', true, null)
      else if (y % 12 === 7) s.cyl('y', 8, 8, 7, y, y, 'K', true, null)
    }
    for (var w = 6; w <= 47; w++) {
      if (w % 6 === 4 || w % 12 === 7) continue
      for (var o = 7; o <= 9; o++) {
        s.set(1, w, o, 'W').set(15, w, o, 'W').set(o, w, 1, 'W').set(o, w, 15, 'W')
      }
    }
    s.cyl('y', 8, 8, 4, 4, 45, 'E', true)
    for (var sp = 15; sp <= 45; sp += 15) {
      s.box(2, sp, 8, 14, sp, 8, 'B')
      s.box(8, sp, 2, 8, sp, 14, 'B')
    }
    s.cyl('y', 8, 8, 5, 50, 50, 'F')
    s.cyl('y', 8, 8, 0, 4, 46, 'A')
    for (var c = 4; c <= 46; c++) if (c % 4 === 2) s.set(8, c, 8, 'C')
    s.booth('F', 3)
    return s.fn()
  }

  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: forgeShape() })
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
    var m = MB.machine
    event.create(m.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var m = MB.machine
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
