// -----------------------------------------------------------------------------------------------
// UXV's Cygnus X-1 lift (docs/eras/uxv.md, machines 10-12, line 26; package UXV-B2): the stellar elevator, the plasma mass filter and the
// stellar condensation tower, and their recipe types. The recipes come from data/grindless/tables/cygnus_lift.json
// (server_scripts/grindless/uxv/cygnus_lift.js). No new items: every id is F1's (uxv/foundation.js).
//
//   gtceu:stellar_elevator             11 x 11 x 25 funnel and boom, UXV (two UIV energy hatches). Recipe type gtceu:star_lifting
//                                      (circuit 1 lift, 2 elevator log); the lift is locked to the Cygnus X-1 orbit.
//   gtceu:plasma_mass_filter           9 x 9 x 15 octagonal solenoid, UXV. Recipe type gtceu:plasma_mass_filtering (circuit 1 stellar cuts,
//                                      2 disk plasma); c1 is locked to the Cygnus X-1 orbit.
//   gtceu:stellar_condensation_tower   7 x 7 x 23 seven-stage column, UXV. Recipe type gtceu:stellar_condensation (circuit 1 condense);
//                                      locked to the Cygnus X-1 orbit.
//
// Geometry (lib/patterns.js: a slice has at most 16 rows): the elevator and the tower are 25 and 23 long, so they lie on their side with the
// long axis as depth: the base and every hatch at the front, the crown or the top of the column at the back. Orbit has no up.
// Textures: tools/assets/Build-UXVCygnusLiftTextures.ps1. Names: client_scripts/grindless/uxv_cygnus_lift_lang.js.
// Published for the recipe script: global.grindless.cygnusLift.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const CL = G.cygnusLift || (G.cygnusLift = {})
  const LOG = '[grindless/uxv] '

  const UXV_CASING = 'gtceu:uxv_machine_casing'
  const UXV_TEXTURE = 'gtceu:block/casings/voltage/uxv/side'
  const HPC = 'gtceu:high_power_casing'
  const HPC_TEXTURE = 'gtceu:block/casings/hpca/high_power_casing'

  CL.table = 'kubejs/data/grindless/tables/cygnus_lift.json'
  CL.site = 'grindless:cygnus_x1_orbit'

  // items in include the programmed circuit
  CL.machines = [
    {
      name: 'stellar_elevator', machine: 'gtceu:stellar_elevator', type: 'star_lifting', dataKey: 'grindless_star_lifting',
      lang: 'Stellar Elevator', maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 2 }, casing: UXV_CASING, texture: UXV_TEXTURE,
      width: 11, height: 11, depth: 25,
      pal: { F: UXV_CASING, C: 'gtceu:superconducting_coil', L: 'gtceu:fusion_glass', P: 'gtceu:titanium_pipe_casing', Q: 'naquadah_alloy' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 1 }),
          Pat.part('output_bus', { min: 1, max: 1 }),
          Pat.part('input_hatch', { min: 1, max: 2 }),
          Pat.part('output_hatch', { min: 1, max: 2 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
    },
    {
      name: 'plasma_mass_filter', machine: 'gtceu:plasma_mass_filter', type: 'plasma_mass_filtering', dataKey: 'grindless_plasma_mass_filtering',
      lang: 'Plasma Mass Filter', maxIO: { itemsIn: 1, itemsOut: 1, fluidsIn: 1, fluidsOut: 4 }, casing: HPC, texture: HPC_TEXTURE,
      width: 9, height: 9, depth: 15,
      pal: { F: HPC, C: 'gtceu:superconducting_coil', L: 'gtceu:fusion_glass', P: 'gtceu:tungstensteel_pipe_casing' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 1 }),
          Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('output_hatch', { min: 1, max: 6 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
    },
    {
      name: 'stellar_condensation_tower', machine: 'gtceu:stellar_condensation_tower', type: 'stellar_condensation',
      dataKey: 'grindless_stellar_condensation', lang: 'Stellar Condensation Tower',
      maxIO: { itemsIn: 1, itemsOut: 3, fluidsIn: 2, fluidsOut: 1 }, casing: UXV_CASING, texture: UXV_TEXTURE,
      width: 7, height: 7, depth: 23,
      pal: { F: UXV_CASING, L: 'gtceu:laminated_glass', P: 'gtceu:titanium_pipe_casing', Q: 'naquadah_alloy', V: 'gtceu:computer_heat_vent' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 1 }),
          Pat.part('output_bus', { min: 1, max: 3 }),
          Pat.part('input_hatch', { min: 1, max: 2 }),
          Pat.part('output_hatch', { min: 1, max: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
    }
  ]

  function abs(n) { return n < 0 ? -n : n }
  // an octagon: inside the square of half-width r and the diamond of radius r + r/2
  function oct(dx, dy, r) { return r >= 0 && abs(dx) <= r && abs(dy) <= r && abs(dx) + abs(dy) <= r + Math.floor(r / 2) }

  // x left to right, y bottom to top, z back (0) to front (24). The crown is at the back: an outer ring of frame round four hatch ports and
  // a glass core; the boom narrows to the funnel in three steps, the wide base chamber at the front. Coil rings every fourth layer, titanium
  // risers along the four axes, frame lattice on the diagonals and a fusion-glass plasma core up the axis.
  function liftCell(x, y, z) {
    var dx = x - 5
    var dy = y - 5
    var r = z >= 17 ? 5 : z >= 14 ? 4 : z >= 11 ? 3 : 2
    if (!oct(dx, dy, r)) return ' '
    var inner = oct(dx, dy, r - 1)
    if (z === 24) {
      if (y === 0) return abs(dx) <= 2 ? 'X' : 'F'
      if (y === 1 && (abs(dx) === 2 || abs(dx) === 3)) return 'X'
      return abs(dx) <= 1 && y >= 3 && y <= 5 ? 'L' : 'F'
    }
    if (z === 0) {
      if (!inner) return 'Q'
      return dx === 0 && dy === 0 ? 'L' : 'X'
    }
    if (inner) return dx === 0 && dy === 0 && z <= 16 ? 'L' : '#'
    if (z % 4 === 0) return 'C'
    if (dx === 0 || dy === 0) return 'P'
    if (abs(dx) + abs(dy) === r + Math.floor(r / 2)) return 'Q'
    return 'F'
  }

  // a solenoid along the beam: coil rings on the odd slices round a fusion-glass midplane band, radial ports on the axes (the heavy cut
  // leaves at the two side ports), plasma in at the front floor and the light cuts out through the far cap
  function filterCell(x, y, z) {
    var dx = x - 4
    var dy = y - 4
    if (!oct(dx, dy, 4)) return ' '
    var inner = oct(dx, dy, 3)
    if (z === 14) {
      if (y === 0) return abs(dx) <= 2 ? 'X' : 'F'
      if (y === 1 && (abs(dx) === 2 || abs(dx) === 3)) return 'X'
      return abs(dx) <= 1 && y >= 3 && y <= 5 ? 'L' : 'F'
    }
    if (z === 0) {
      if (!inner) return 'F'
      if (dx === 0 && dy === 0) return 'L'
      return abs(dx) + abs(dy) === 2 ? 'X' : 'F'
    }
    if (inner) return '#'
    if (z % 2 === 1) return z === 7 ? 'L' : 'C'
    if (abs(dx) === 4 && dy === 0 && (z === 4 || z === 8 || z === 12)) return 'X'
    if (dx === 0 && abs(dy) === 4 && z % 4 === 0) return 'P'
    return 'F'
  }

  // seven stages of three slices, the hot base at the front: tray rings of frame, sight windows and draw-off pipes at the middle of each stage,
  // item buses on the two lowest draw-offs, a vent jacket on the cold stages at the back and the volatile off the top
  function towerCell(x, y, z) {
    var dx = x - 3
    var dy = y - 3
    if (!oct(dx, dy, 3)) return ' '
    var inner = oct(dx, dy, 2)
    if (z === 22) {
      if (y === 0) return abs(dx) <= 1 ? 'X' : 'F'
      if (y === 1 && abs(dx) >= 1 && abs(dx) <= 2) return 'X'
      return 'F'
    }
    if (z === 0) {
      if (dx === 0 && dy === 0) return 'V'
      return abs(dx) + abs(dy) === 1 ? 'X' : 'F'
    }
    if (inner) return '#'
    if (z % 3 === 0) return 'Q'
    if (z % 3 === 2) {
      if (abs(dx) === 3 && dy === 0) return z >= 17 ? 'X' : 'L'
      if (dx === 0 && abs(dy) === 3) return 'P'
    }
    return z <= 9 ? 'V' : 'F'
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(),
      fn: m.name === 'stellar_elevator' ? liftCell : m.name === 'plasma_mass_filter' ? filterCell : towerCell
    })
  }

  // one EMI line per recipe, read from its data
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
    CL.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    CL.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.2')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
