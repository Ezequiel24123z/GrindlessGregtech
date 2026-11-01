// priority: -5629
// -----------------------------------------------------------------------------------------------
// MAX+ machine 3, the Hills slingshot (docs/eras/maxplus.md "Machines" 3; package XP-T1): the multiblock and its recipe type. The casing and every
// item it uses are XP-F1's (maxplus/foundation.js). The recipes, with lines P15 and P16's older-machine rows, are in
// server_scripts/grindless/maxplus/slingshot.js.
//
//   gtceu:hills_slingshot   17 x 9 x 17 of slingshot coil casing: glass-banded walls round a capture ring of superconducting coils with an atomic
//                           casing post at the axis. Recipe type gtceu:hills_slingshot: c1 binds a relay probe to a canned counterweight, c2
//                           releases the pair as a launched probe (the counterweight falls into the hole).
//
// It runs only at Sgr A* (rows carry the site dimension) at V[MAX] x 16 (2^35 EU/t) on a 1,024 A MAX+ energy hatch (INPUT_ENERGY, like the other MAX+
// machines'). Rows run as written: no overclock, no parallels, so the modifier returns IDENTITY. Names: client_scripts/grindless/maxplus_slingshot_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MS = G.maxPlusSlingshot || (G.maxPlusSlingshot = {})
  const LOG = '[grindless/maxplus] '

  const CASING = 'grindless:slingshot_coil_casing'

  function parts() {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ]
  }

  // Textures: a bridge until the MAX+ assets package draws the casing and face (see maxplus/assembler.js).
  MS.machine = {
    name: 'hills_slingshot', machine: 'gtceu:hills_slingshot', type: 'hills_slingshot', dataKey: 'grindless_hills_slingshot',
    lang: 'Hills Slingshot', maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }, casing: CASING, texture: 'grindless:block/max/mirror_shell_segment',
    overlay: 'grindless:block/multiblock/hills_slingshot',
    width: 17, height: 9, depth: 17,
    pal: { F: CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil' },
    parts: parts
  }

  // x left to right, y bottom to top, z back to front. The floor carries the part cells at the front edge; the walls a glass band; a ring of coils
  // (radius 5 to 6 from the axis) circles the middle layer round an atomic casing post.
  function slingCell(x, y, z) {
    if (y === 0) return z === 0 && x >= 5 && x <= 11 ? 'X' : 'B'
    if (y === 8) return 'B'
    if (x === 0 || x === 16 || z === 0 || z === 16) {
      var along = x === 0 || x === 16 ? z : x
      return y >= 3 && y <= 5 && along >= 3 && along <= 13 && along % 4 !== 1 ? 'L' : 'F'
    }
    var dx = x - 8
    var dz = z - 8
    var r2 = dx * dx + dz * dz
    if (y === 4 && r2 >= 25 && r2 <= 42) return 'C'
    if (dx === 0 && dz === 0 && y >= 2 && y <= 6) return 'A'
    return '#'
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: slingCell })
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
    var m = MS.machine
    event.create(m.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var m = MS.machine
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
