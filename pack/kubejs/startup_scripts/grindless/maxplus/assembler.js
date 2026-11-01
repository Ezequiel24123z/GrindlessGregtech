// priority: -5564
// -----------------------------------------------------------------------------------------------
// MAX+ machine 14, the condensate assembler (docs/eras/maxplus.md "Machines" 14; package XP-H3): the multiblock and its recipe type. Every item
// and casing it uses is XP-F1's (maxplus/foundation.js). The recipes, with lines T1 to T3, T14 to T16 and P25's older-machine rows, are in
// server_scripts/grindless/maxplus/assembler.js.
//
//   gtceu:condensate_assembler   19 x 13 x 19 of horizon machine casing: a vertical bar of atomic casing and superconducting coils down the
//                                axis inside four glass-banded walls. Recipe type gtceu:condensate_assembler: c1 to c4 assemble the horizon
//                                containment plate, the chevron core, the horizon mesh and the horizon frame part from the plate and mesh
//                                domain under a large condensate bath.
//
// It runs only at Sgr A* (rows carry the site dimension) at V[MAX] x 256 (2^39 EU/t) on one 1,024 A MAX+ hatch (GTM's 64 A substation hatches
// carry SUBSTATION_INPUT_ENERGY, which the energy_input slot does not take). Rows run as
// written: no overclock, no parallels, so the modifier returns IDENTITY like the condensate machines'. Names:
// client_scripts/grindless/maxplus_assembler_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MA = G.maxPlusAssembler || (G.maxPlusAssembler = {})
  const LOG = '[grindless/maxplus] '

  const CASING = 'grindless:horizon_machine_casing'

  function parts() {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 2 }),
      Pat.part('output_hatch', { min: 1, max: 1 }),
      Pat.part('energy_input', { min: 1, max: 4 })
    ]
  }

  // Textures: a bridge until the MAX+ assets package draws the casing and face. The formed machine wears MAX art meanwhile: the mirror shell's
  // segment with the positronium condensate lab's face. Then set texture to grindless:block/maxplus/<casing> and overlay to
  // grindless:block/multiblock/condensate_assembler.
  MA.machine = {
    name: 'condensate_assembler', machine: 'gtceu:condensate_assembler', type: 'condensate_assembler', dataKey: 'grindless_condensate_assembler',
    lang: 'Condensate Assembler', maxIO: { itemsIn: 9, itemsOut: 2, fluidsIn: 2, fluidsOut: 1 }, casing: CASING, texture: 'grindless:block/max/mirror_shell_segment',
    overlay: 'grindless:block/multiblock/positronium_condensate_lab',
    width: 19, height: 13, depth: 19,
    pal: { F: CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil' },
    parts: parts
  }

  // x left to right, y bottom to top, z back to front. Row 0 the floor (the part cells at the front), the last row the roof; the four walls carry
  // a glass band. A vertical bar of atomic casing stands on the axis, a coil every fourth cell.
  function assemblerCell(x, y, z) {
    if (y === 0) return z === 0 && x >= 5 && x <= 13 ? 'X' : 'B'
    if (y === 12) return 'B'
    if (x === 0 || x === 18 || z === 0 || z === 18) {
      var along = x === 0 || x === 18 ? z : x
      return y >= 4 && y <= 8 && along >= 3 && along <= 15 && along % 4 !== 1 ? 'L' : 'F'
    }
    if (x === 9 && z === 9 && y >= 2 && y <= 10) return y % 4 === 2 ? 'C' : 'A'
    return '#'
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: assemblerCell })
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
    var m = MA.machine
    event.create(m.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var m = MA.machine
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
