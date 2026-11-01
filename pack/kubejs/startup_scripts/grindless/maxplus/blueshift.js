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
    overlay: 'grindless:block/multiblock/positronium_condensate_lab',
    width: 13, height: 31, depth: 13,
    pal: { F: CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil' },
    parts: parts
  }

  // x left to right, y bottom to top, z back to front. The floor carries the part cells at the front edge; the walls a glass band every eight layers;
  // the axis holds the coil spine (atomic casing at the foot and head).
  function forgeCell(x, y, z) {
    if (y === 0) return z === 0 && x >= 4 && x <= 8 ? 'X' : 'B'
    if (y === 30) return 'B'
    if (x === 0 || x === 12 || z === 0 || z === 12) {
      var along = x === 0 || x === 12 ? z : x
      return y % 8 >= 3 && y % 8 <= 5 && along >= 3 && along <= 9 ? 'L' : 'F'
    }
    if (x === 6 && z === 6) return y <= 2 || y >= 28 ? 'A' : 'C'
    return '#'
  }

  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: forgeCell })
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
