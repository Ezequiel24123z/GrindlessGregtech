// priority: -5619
// -----------------------------------------------------------------------------------------------
// MAX+ machine 11, the meta-material loom (docs/eras/maxplus.md "Machines" 11; package XP-H1): the multiblock and its recipe type. Every item
// and casing it uses is XP-F1's (maxplus/foundation.js). The recipes, with lines T4 to T7's older-machine rows, are in
// server_scripts/grindless/maxplus/loom.js.
//
//   gtceu:meta_material_loom   21 x 9 x 9 of horizon machine casing: a long warp beam of atomic casing and superconducting coils down the axis
//                              between two glass-banded walls. Recipe type gtceu:meta_material_loom: c1 to c4 weave the four meta-materials
//                              (horizon shielding, waveguide, conduit, valve body) from bound plates, Kerr strand and condensate.
//
// It runs at home (no site), at V[MAX] x 4 A on hatches that can carry it. Rows run as written: no overclock, no parallels, so the modifier
// returns IDENTITY like the condensate machines'. Names: client_scripts/grindless/maxplus_loom_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const ML = G.maxPlusLoom || (G.maxPlusLoom = {})
  const LOG = '[grindless/maxplus] '

  const CASING = 'grindless:horizon_machine_casing'

  function parts() {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 2 }),
      Pat.part('output_hatch', { min: 1, max: 1 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ]
  }

  // Textures: a bridge until the MAX+ assets package draws the casing and face. The formed machine wears MAX art meanwhile: the mirror shell's
  // segment with the positronium condensate lab's face. Then set texture to grindless:block/maxplus/<casing> and overlay to
  // grindless:block/multiblock/meta_material_loom.
  ML.machine = {
    name: 'meta_material_loom', machine: 'gtceu:meta_material_loom', type: 'meta_material_loom', dataKey: 'grindless_meta_material_loom',
    lang: 'Meta-Material Loom', maxIO: { itemsIn: 6, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 }, casing: CASING, texture: 'grindless:block/max/mirror_shell_segment',
    overlay: 'grindless:block/multiblock/meta_material_loom',
    width: 21, height: 9, depth: 9,
    pal: { F: CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil' },
    parts: parts
  }

  // x left to right, y bottom to top, z back to front. Row 0 the floor (the part cells at the front), the last row the roof; the two long walls
  // carry a glass band. The warp beam is an atomic casing bar on the axis at y = 4 with a coil every fourth cell.
  function loomCell(x, y, z) {
    if (y === 0) return z === 0 && x >= 8 && x <= 12 ? 'X' : 'B'
    if (y === 8) return 'B'
    if (x === 0 || x === 20 || z === 0 || z === 8) {
      var along = x === 0 || x === 20 ? z : x
      return y >= 3 && y <= 5 && along >= 3 && (x === 0 || x === 20 ? along <= 5 : along <= 17) && along % 4 !== 1 ? 'L' : 'F'
    }
    if (y === 4 && z === 4 && x >= 2 && x <= 18) return x % 4 === 2 ? 'C' : 'A'
    return '#'
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: loomCell })
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
    var m = ML.machine
    event.create(m.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var m = ML.machine
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
