// priority: -5529
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
    overlay: 'grindless:block/multiblock/condensate_assembler',
    width: 25, height: 15, depth: 25,
    pal: {
      F: CASING, B: 'grindless:bound_lattice_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil',
      R: 'grindless:primordial_cryostat_casing', K: 'grindless:kerr_coil_casing', V: 'grindless:condensate_vessel_casing'
    },
    parts: parts
  }

  // x left to right, y bottom to top, z back to front (docs/eras/lines-opv-maxplus.md 6.3): a condensate bath hall. Cryostat and lattice make
  // the hall; in its middle a sunken condensate vessel (the bath) is ringed by Kerr coils, with a coil spine over it and cryostat pillars
  // round the walls. The front booth holds the controller and the hatches.
  function assemblerShape() {
    var m = MA.machine
    var s = G.uevShapes.scene(m.width, m.height, m.depth)
    s.room(0, 0, 0, 24, 14, 24, 'R')
    for (var z = 0; z < 25; z++) for (var x = 0; x < 25; x++) {
      if ((x + z) % 3 === 0) s.set(x, 0, z, 'B')
      if (x % 4 === 0 && z % 4 === 0) s.set(x, 14, z, 'B')
    }
    for (var y = 1; y <= 13; y++) {
      for (var e = 0; e <= 24; e++) {
        var band = y >= 4 && y <= 9 && e >= 3 && e <= 21
        var cell = band ? (e % 4 === 0 ? 'B' : (y === 6 ? 'K' : 'L')) : (y % 4 === 0 ? 'B' : 'R')
        s.set(0, y, e, cell).set(24, y, e, cell).set(e, y, 0, cell)
        if (e > 0) s.set(e, y, 24, cell)
      }
    }
    // the bath: a vessel pit sunk in the floor of the hall, a lattice rim, and Kerr coil rings over it
    s.room(6, 1, 6, 18, 7, 18, 'V', 't')
    s.edges(5, 1, 5, 19, 8, 19, 'B')
    s.room(7, 8, 7, 17, 8, 17, 'K', 't')
    s.box(8, 8, 8, 16, 8, 16, '#')
    s.box(9, 9, 9, 15, 9, 15, '#')
    for (var k = 2; k <= 11; k++) s.set(12, k, 12, k % 4 === 3 ? 'C' : 'A')
    // cryostat pillars and a lattice gallery
    for (var p = 0; p < 4; p++) {
      var px = p % 2 === 0 ? 2 : 22
      var pz = p < 2 ? 2 : 22
      s.box(px - 1, 1, pz - 1, px + 1, 12, pz + 1, 'R')
      s.box(px, 1, pz, px, 12, pz, '#')
    }
    for (var g = 1; g <= 23; g++) {
      s.set(g, 10, 1, 'B').set(g, 10, 23, 'B').set(1, 10, g, 'B').set(23, 10, g, 'B')
    }
    for (var rz = 1; rz <= 23; rz++) for (var rx = 1; rx <= 23; rx++) {
      if (rx % 4 === 0 || rz % 4 === 0) s.set(rx, 13, rz, 'B')
    }
    s.booth('F', 3)
    return s.fn()
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: assemblerShape() })
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
