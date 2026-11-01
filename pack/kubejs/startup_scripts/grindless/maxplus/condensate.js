// priority: -5580
// -----------------------------------------------------------------------------------------------
// MAX+ machines 1 and 2 (docs/eras/maxplus.md "Machines" 1 and 2; package XP-A1): the multiblocks and their recipe types. Every item, fluid
// and casing they use is XP-F1's (maxplus/foundation.js). The recipes are in server_scripts/grindless/maxplus/condensate.js.
//
//   gtceu:condensate_refinery   15 x 11 x 15 of condensate vessel casing round a superconducting core in an atomic casing sleeve. Recipe type
//                               gtceu:condensate_refinery: c1 settles the shell's condensate, c2 to c5 bind it into the P2 to P5 forms.
//   gtceu:bound_matter_press    13 x 13 x 13 of bound press casing round an anvil, a ram and its column. Recipe type gtceu:bound_matter_press:
//                               c1 presses bound neutronium, c2 the Kerr strange ingot.
//
// Both run only at Sgr A* (gcyr:black_hole_orbit, the recipes carry the dimension). Rows run as written: no overclock, no parallels (they sit
// at VA[MAX] up to V[MAX] x 16 A on 1,024 A or 64 A substation hatches), so the modifier returns IDENTITY like the mirror shell's.
// Names: client_scripts/grindless/maxplus_condensate_lang.js. Published for the recipe script: global.grindless.maxPlusCondensate.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MC = G.maxPlusCondensate || (G.maxPlusCondensate = {})
  const LOG = '[grindless/maxplus] '

  const VESSEL = 'grindless:condensate_vessel_casing'
  const PRESS = 'grindless:bound_press_casing'

  function parts() {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 2 }),
      Pat.part('output_hatch', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ]
  }

  // Textures: a bridge until the MAX+ assets package (Phase 6, maxplus.md 'Build order') draws the two casings and faces. The formed
  // machines wear MAX art meanwhile: the mirror shell's segment with the positronium condensate lab's face, and the clamp coil casing with
  // the flux clamp's face. Then set texture to grindless:block/maxplus/<casing> and overlay to grindless:block/multiblock/<name>.
  MC.machines = [
    {
      name: 'condensate_refinery', machine: 'gtceu:condensate_refinery', type: 'condensate_refinery', dataKey: 'grindless_condensate_refinery',
      lang: 'Condensate Refinery', maxIO: { itemsIn: 4, itemsOut: 3, fluidsIn: 2, fluidsOut: 2 }, casing: VESSEL, texture: 'grindless:block/max/mirror_shell_segment',
      overlay: 'grindless:block/multiblock/positronium_condensate_lab',
      width: 15, height: 11, depth: 15,
      pal: { F: VESSEL, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil' },
      parts: parts
    },
    {
      name: 'bound_matter_press', machine: 'gtceu:bound_matter_press', type: 'bound_matter_press', dataKey: 'grindless_bound_matter_press',
      lang: 'Bound-Matter Press', maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 0, fluidsOut: 1 }, casing: PRESS, texture: 'grindless:block/max/clamp_coil_casing',
      overlay: 'grindless:block/multiblock/horizon_flux_clamp',
      width: 13, height: 13, depth: 13,
      pal: { F: PRESS, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing' },
      parts: parts
    }
  ]

  // x left to right, y bottom to top, z back to front. Row 0 the floor (the part cells front and back), the last row the roof; the walls carry a
  // glass band. The refinery has a superconducting core on the axis in an atomic casing sleeve; the press an anvil plate, a ram head and the
  // ram column between them.
  function wallOf(x, y, z, w, d, lo, hi) {
    var wall = x === 0 || x === w - 1 || z === 0 || z === d - 1
    if (!wall) return null
    var along = x === 0 || x === w - 1 ? z : x
    return y >= lo && y <= hi && along >= 3 && along <= w - 4 && along % 4 !== 1 ? 'L' : 'F'
  }

  function vesselCell(x, y, z) {
    var dx = x - 7
    var dz = z - 7
    if (y === 0) return (z === 0 || z === 14) && x >= 5 && x <= 9 ? 'X' : 'B'
    if (y === 10) return 'B'
    var w = wallOf(x, y, z, 15, 15, 4, 6)
    if (w !== null) return w
    if (dx === 0 && dz === 0) return 'C'
    if (dx * dx + dz * dz <= 2 && y >= 2 && y <= 8) return 'A'
    return '#'
  }

  function pressCell(x, y, z) {
    var dx = x - 6
    var dz = z - 6
    var cheb = Math.max(Math.abs(dx), Math.abs(dz))
    if (y === 0) return (z === 0 || z === 12) && x >= 4 && x <= 8 ? 'X' : 'B'
    if (y === 12) return 'B'
    var w = wallOf(x, y, z, 13, 13, 5, 8)
    if (w !== null) return w
    if (y === 3 && cheb <= 4) return 'A'
    if (y === 9 && cheb <= 4) return 'A'
    if (cheb === 0 && (y <= 2 || (y >= 4 && y <= 8) || y >= 10)) return 'B'
    return '#'
  }

  var CELLS = { condensate_refinery: vesselCell, bound_matter_press: pressCell }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: CELLS[m.name] })
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
    MC.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.ARC)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MC.machines.forEach(function (m) {
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
  })
})()
