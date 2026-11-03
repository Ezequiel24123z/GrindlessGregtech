// priority: -5619
// -----------------------------------------------------------------------------------------------
// MAX+ machine 11, the meta-material loom (docs/eras/maxplus.md "Machines" 11; package XP-H1): the multiblock and its recipe type. Every item
// and casing it uses is XP-F1's (maxplus/foundation.js). The recipes, with lines T4 to T7's older-machine rows, are in
// server_scripts/grindless/maxplus/loom.js.
//
//   gtceu:meta_material_loom   33 x 13 x 15 loom hall (loomShape): a long warp beam of atomic casing and superconducting coils down the axis
//                              between heddle frames. Recipe type gtceu:meta_material_loom: c1 to c4 weave the four meta-materials
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
    width: 33, height: 13, depth: 15,
    pal: {
      F: CASING, B: 'grindless:bound_lattice_casing', K: 'grindless:kerr_coil_casing', R: 'grindless:primordial_cryostat_casing', L: 'gtceu:cleanroom_glass',
      A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil'
    },
    parts: parts
  }

  // x left to right, y bottom to top, z back to front (docs/eras/lines-opv-maxplus.md 6.3): a loom hall 33 long. A lattice shell with Kerr
  // rails and cryostat roof ribs round three cryostat heddle frames; the warp beam is an atomic casing bar on the axis with a coil every
  // fourth cell, and a cryostat cloth deck runs under it. The front face holds the controller and the part cells.
  function loomShape() {
    var m = ML.machine
    var s = G.uevShapes.scene(m.width, m.height, m.depth)
    s.room(0, 0, 0, 32, 12, 14, 'B')
    s.edges(0, 0, 0, 32, 12, 14, 'F')
    for (var x = 2; x <= 30; x += 4) {
      s.room(x, 1, 0, x, 11, 14, 'K', 'bt', null)
      s.box(x, 11, 0, x, 12, 14, 'R')
    }
    for (var h = 6; h <= 26; h += 10) {
      s.room(h, 1, 1, h + 1, 11, 13, 'R', 'bt', null)
      s.box(h, 6, 1, h + 1, 6, 13, 'B')
    }
    s.box(1, 3, 1, 31, 3, 13, 'R')
    s.box(1, 6, 7, 31, 6, 7, 'A')
    for (var c = 2; c <= 30; c += 4) s.set(c, 6, 7, 'C')
    s.box(1, 6, 1, 31, 6, 1, 'K').box(1, 6, 13, 31, 6, 13, 'K')
    s.box(0, 4, 4, 0, 9, 10, 'L')
    s.box(32, 4, 4, 32, 9, 10, 'L')
    s.booth('F', 3)
    return s.fn()
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: loomShape() })
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
