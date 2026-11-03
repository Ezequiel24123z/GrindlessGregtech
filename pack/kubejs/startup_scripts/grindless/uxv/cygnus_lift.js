// priority: -10799
// -----------------------------------------------------------------------------------------------
// UXV's Cygnus X-1 lift (docs/eras/uxv.md, machines 10-12, line 26; package UXV-B2): the stellar elevator, the plasma mass filter and the
// stellar condensation tower, and their recipe types. The recipes come from data/grindless/tables/cygnus_lift.json
// (server_scripts/grindless/uxv/cygnus_lift.js). No new items: every id is F1's (uxv/foundation.js).
//
//   gtceu:stellar_elevator             23 x 57 x 23 ring-current lift tower, UXV (two UIV energy hatches). Recipe type gtceu:star_lifting
//                                      (circuit 1 lift, 2 elevator log); the lift is locked to the Cygnus X-1 orbit.
//   gtceu:plasma_mass_filter           15 x 15 x 37 Archimedes solenoid, UXV. Recipe type gtceu:plasma_mass_filtering (circuit 1 stellar cuts,
//                                      2 disk plasma); both run anywhere.
//   gtceu:stellar_condensation_tower   13 x 31 x 13 seven-stage column, UXV. Recipe type gtceu:stellar_condensation (circuit 1 condense);
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

  // the UXV family (uxv/casings.js): gum metal is the body of the filter and the tower, pulsed field their magnets. Neither product is an ancestor
  // of those casings' inputs (they sort and condense Cygnus plasma; the casing chains take foils, billets and UIV parts).
  const GUM = 'grindless:gum_metal_casing'
  const GUM_TEXTURE = 'grindless:block/uxv/gum_metal_casing'
  const PULSED = 'grindless:pulsed_field_casing'
  // The filter is on the uxv_machine_hull chain, so it cannot wear gum (bootstrap rule).
  const SIC = 'grindless:sic_composite_casing'
  const SIC_TEXTURE = 'grindless:block/uev/sic_composite_casing'

  CL.table = 'kubejs/data/grindless/tables/cygnus_lift.json'
  CL.site = 'grindless:cygnus_x1_orbit'

  // items in include the programmed circuit
  CL.machines = [
    {
      name: 'stellar_elevator', machine: 'gtceu:stellar_elevator', type: 'star_lifting', dataKey: 'grindless_star_lifting',
      lang: 'Stellar Elevator', maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 2 }, casing: SIC, texture: SIC_TEXTURE,
      // BOOTSTRAP (D4-SHAPE-UXV-B): the elevator is the first stage of the Cygnus chain that reaches the hull, so, as the filter, its F body is the UEV SiC
      // composite; the ring-current coils are pulsed-field.
      width: 23, height: 57, depth: 23,
      pal: { F: SIC, M: PULSED, C: 'gtceu:superconducting_coil', L: 'gtceu:fusion_glass', P: 'gtceu:titanium_pipe_casing', A: 'gtceu:stable_machine_casing', Q: 'naquadah_alloy' },
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
      lang: 'Plasma Mass Filter', maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 4 }, casing: SIC, texture: SIC_TEXTURE,
      width: 15, height: 15, depth: 37,
      pal: { F: SIC, M: PULSED, C: 'gtceu:superconducting_coil', L: 'gtceu:fusion_glass', P: 'gtceu:tungstensteel_pipe_casing', A: 'gtceu:stable_machine_casing', Q: 'naquadah_alloy' },
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
      maxIO: { itemsIn: 1, itemsOut: 3, fluidsIn: 2, fluidsOut: 1 }, casing: GUM, texture: GUM_TEXTURE,
      width: 13, height: 31, depth: 13,
      pal: { F: GUM, M: PULSED, A: 'gtceu:stable_machine_casing', L: 'gtceu:laminated_glass', P: 'gtceu:titanium_pipe_casing', Q: 'naquadah_alloy' },
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

  // The stellar elevator (23 x 57 x 23), D4-SHAPE-UXV-B: a lift tower of ring-current coils. A base hall with the control booth at the front,
  // a hollow lift shaft up the axis with a fusion-glass plasma core, pulsed-field ring-current coils round it every third course, three
  // superconducting coil rings, four frame pylons with ring beams, titanium risers on the axes and a crown disc and cone at the top.
  function liftTower() {
    var s = G.uevShapes.scene(23, 57, 23)
    s.room(0, 0, 0, 22, 5, 22, 'F', 't')
    s.box(1, 1, 1, 21, 4, 21, '#')
    s.box(0, 0, 0, 22, 0, 22, 'F')
    s.cyl('y', 11, 11, 4, 1, 52, 'F', true)
    s.cyl('y', 11, 11, 1, 6, 52, 'L')
    for (var y = 7; y <= 49; y += 3) s.cyl('y', 11, 11, 7, y, y, 'M', true, null)
    ;[14, 28, 42].forEach(function (y) { s.cyl('y', 11, 11, 5, y, y, 'C', true, null) })
    ;[[2, 2], [20, 2], [2, 20], [20, 20]].forEach(function (p) { s.box(p[0], 1, p[1], p[0], 50, p[1], 'Q') })
    ;[10, 20, 30, 40, 50].forEach(function (y) {
      s.box(2, y, 2, 20, y, 2, 'Q').box(2, y, 20, 20, y, 20, 'Q').box(2, y, 2, 2, y, 20, 'Q').box(20, y, 2, 20, y, 20, 'Q')
    })
    ;[9, 21, 33, 45].forEach(function (y) {
      s.box(11, y, 2, 11, y, 6, 'P').box(11, y, 16, 11, y, 20, 'P').box(2, y, 11, 6, y, 11, 'P').box(16, y, 11, 20, y, 11, 'P')
    })
    s.cyl('y', 11, 11, 6, 53, 53, 'A')
    s.cyl('y', 11, 11, 4, 54, 54, 'M', true)
    s.cyl('y', 11, 11, 2, 55, 55, 'F')
    s.set(11, 56, 11, 'L')
    s.box(1, 5, 11, 3, 5, 11, 'A').box(19, 5, 11, 21, 5, 11, 'A')
    return s.booth('F', 3).fn()
  }

  // built in the machine registry callback: uev/shapes.js may load after this file
  function spec(m) {
    return G.uevShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(),
      fn: m.name === 'stellar_elevator' ? liftTower() : m.name === 'plasma_mass_filter' ? filterSolenoid() : condensationColumn()
    })
  }

  // An Archimedes-type filter (15 x 15 x 37): a long gum-metal solenoid tube along the beam (z), pulsed-field winding rings round it every
  // fourth slice, one superconducting coil ring at the midplane over a fusion-glass viewing band, an end electrode plate at each end, radial
  // pipe ports on the axes where the cuts leave, a stable-casing bed on saddles and the control booth under the plasma input at the front.
  function filterSolenoid() {
    var s = G.uevShapes.scene(15, 15, 37)
    s.cyl('z', 7, 7, 4, 1, 35, 'F', true)
    for (var z = 3; z <= 33; z += 4) s.cyl('z', 7, 7, 6, z, z, 'M', true, null)
    s.cyl('z', 7, 7, 4, 18, 18, 'C', true)
    s.cyl('z', 7, 7, 4, 16, 16, 'L', true).cyl('z', 7, 7, 4, 20, 20, 'L', true)
    s.cyl('z', 7, 7, 3, 0, 0, 'A').cyl('z', 7, 7, 3, 36, 36, 'A')
    s.set(7, 7, 0, 'L').set(7, 7, 36, 'L')
    ;[10, 18, 26].forEach(function (z) {
      s.box(7, 11, z, 7, 13, z, 'P').box(7, 1, z, 7, 3, z, 'P').box(1, 7, z, 3, 7, z, 'P').box(11, 7, z, 13, 7, z, 'P')
    })
    s.box(5, 0, 0, 9, 0, 36, 'A')
    ;[5, 17, 29].forEach(function (z) { s.box(3, 0, z, 11, 0, z, 'A').box(3, 1, z, 3, 2, z, 'Q').box(11, 1, z, 11, 2, z, 'Q') })
    return s.booth('F', 3).fn()
  }

  // A condensation column (13 x 31 x 13), the hot base at the bottom: a plinth hall with the booth, a gum-metal column with stage trays
  // (stable-casing discs with a downcomer hole) every fourth course, pulsed-field belts at the column's thirds, sight windows and draw-off
  // pipes at each tray, a four-post frame cage with ring beams, and the volatile off the top through a pipe stack.
  function condensationColumn() {
    var s = G.uevShapes.scene(13, 31, 13)
    s.box(0, 0, 0, 12, 0, 12, 'F')
    s.room(0, 1, 0, 12, 2, 12, 'F', 'bt')
    s.cyl('y', 6, 6, 4, 3, 28, 'F', true)
    ;[5, 9, 13, 17, 21, 25].forEach(function (y) {
      s.cyl('y', 6, 6, 3, y, y, 'A').set(6, y, 6, '#')
      s.box(6, y + 1, 1, 6, y + 1, 1, 'P')
      s.set(2, y + 1, 6, 'L').set(10, y + 1, 6, 'L').set(6, y + 1, 10, 'L').set(6, y + 1, 2, 'L')
      s.box(6, y + 1, 0, 6, y + 1, 1, 'P').box(0, y + 1, 6, 1, y + 1, 6, 'P').box(11, y + 1, 6, 12, y + 1, 6, 'P')
    })
    ;[7, 12, 17, 22, 27].forEach(function (y) { s.cyl('y', 6, 6, 5, y, y, 'M', true, null) })
    s.room(0, 2, 0, 12, 2, 12, 'M', 'bt')
    s.cyl('y', 6, 6, 4, 29, 29, 'A')
    s.cyl('y', 6, 6, 2, 30, 30, 'F', true)
    s.box(6, 29, 6, 6, 30, 6, 'P')
    ;[[0, 0], [12, 0], [0, 12], [12, 12]].forEach(function (p) { s.box(p[0], 3, p[1], p[0], 27, p[1], 'Q') })
    return s.booth('F', 3).fn()
  }

  // built in the machine registry callback: uev/shapes.js may load after this file
  function spec(m) {
    return G.uevShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(),
      fn: m.name === 'stellar_elevator' ? liftTower() : m.name === 'plasma_mass_filter' ? filterSolenoid() : condensationColumn()
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
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          m.type === 'star_lifting' ? Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.cygnus_x1_orbit')) : null,
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ].filter(Boolean))
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
