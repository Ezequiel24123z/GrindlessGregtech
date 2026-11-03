// priority: -10980
// -----------------------------------------------------------------------------------------------
// UXV's Vela pasta works (docs/eras/uxv.md, machines 16-20, lines 32, 33 and 48; package UXV-B4): the pasta extractor, the phase sorter, the
// draw bench, the laminator and the polar cap tap, and their recipe types. The recipes come from data/grindless/tables/vela_pasta.json
// (server_scripts/grindless/uxv/vela_pasta.js). One new item, grindless:lasagna_electrode (the tap's fuel); every other id is F1's (uxv/foundation.js).
//
//   gtceu:pasta_extractor     11 x 11 x 21 crust-tap funnel, UXV. Recipe type gtceu:pasta_extraction (circuit 1 raw pasta); locked to Vela pulsar orbit.
//   gtceu:pasta_phase_sorter  19 x 13 x 55 Pasta Mill, UXV: sorter drum, draw line and press hall in one body. Recipe types gtceu:pasta_sorting
//                             (circuit 1 phases, 2 core sample), gtceu:pasta_drawing (circuit 1 strand wire) and gtceu:pasta_lamination
//                             (circuit 1 plate, 2 lasagna electrode). The draw bench and the laminator are absorbed: their types stay, no controllers.
//   gtceu:polar_cap_tap       13 x 17 x 13 electrode mast, a generator at its final figure (lib/generators.js) through one UIV 16 A dynamo hatch.
//                             Recipe type gtceu:polar_cap_tapping (circuit 1 tap).
//
// Geometry (lib/patterns.js: a slice has at most 16 rows): the extractor, the sorter and the draw bench lie on their side with the long
// axis as depth. Orbit has no up. The controller sits in the front slice, the floor row of it takes the parts.
// Textures: tools/assets/Build-UXVVelaPastaTextures.ps1. Names: client_scripts/grindless/uxv_vela_pasta_lang.js.
// Published for the recipe script: global.grindless.velaPasta.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const VP = G.velaPasta || (G.velaPasta = {})
  const LOG = '[grindless/uxv] '

  const SITE_CASING = 'grindless:neutron_star_site_casing'
  const SITE_TEXTURE = 'grindless:block/uiv/neutron_star_site_casing'
  const CRYO = 'grindless:cryostat_casing'
  const COIL = 'gtceu:superconducting_coil'
  const GLASS = 'gtceu:fusion_glass'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'
  const ROBUST = 'gtceu:robust_machine_casing'
  const VENT = 'gtceu:computer_heat_vent'
  const HSSS = 'gtceu:hsss_frame'
  // pasta_extractor and polar_cap_tap wear the UXV gum-metal body with pulsed-field magnets (uxv/casings.js); the pasta containment casing is
  // NOT used (its inputs frc_cartridge and cage_part come from the former and the extractor chain)
  const GUM = 'grindless:gum_metal_casing'
  const GUM_TEXTURE = 'grindless:block/uxv/gum_metal_casing'
  const PULSED = 'grindless:pulsed_field_casing'
  // The extractor is on the lasagna chain feeding uxv_machine_hull, so it cannot wear gum.
  const SIC = 'grindless:sic_composite_casing'
  const SIC_TEXTURE = 'grindless:block/uev/sic_composite_casing'

  VP.table = 'kubejs/data/grindless/tables/vela_pasta.json'
  VP.site = 'grindless:vela_pulsar_orbit'
  VP.dynamo = 'gtceu:uiv_energy_output_hatch_16a'

  // items in include the programmed circuit
  VP.machines = [
    {
      name: 'pasta_extractor', machine: 'gtceu:pasta_extractor', type: 'pasta_extraction', dataKey: 'grindless_pasta_extraction', lang: 'Pasta Extractor',
      maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }, generator: false, width: 11, height: 11, depth: 21,
      casing: SIC, texture: SIC_TEXTURE,
      pal: { F: SIC, M: PULSED, A: 'gtceu:stable_machine_casing', C: COIL, L: GLASS, Q: 'naquadah_alloy' },
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 1 }), Pat.part('energy_input', { min: 1, max: 2 }), G.parallelHatch.part()]
      }
    },
    {
      // the Pasta Mill: sorting, drawing and lamination in one body (the draw bench and the laminator are absorbed; their recipe types stay)
      name: 'pasta_phase_sorter', machine: 'gtceu:pasta_phase_sorter', type: 'pasta_sorting', extraTypes: ['pasta_drawing', 'pasta_lamination'],
      dataKey: 'grindless_pasta_sorting', lang: 'Pasta Mill',
      maxIO: { itemsIn: 4, itemsOut: 5, fluidsIn: 0, fluidsOut: 0 }, generator: false, width: 19, height: 13, depth: 55,
      casing: GUM, texture: GUM_TEXTURE,
      pal: { F: GUM, M: PULSED, C: COIL, K: CRYO, B: GEARBOX, L: GLASS, R: ROBUST, Q: 'naquadah_alloy' },
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 5 }), Pat.part('energy_input', { min: 1, max: 2 }), G.parallelHatch.part()]
      }
    },
    { name: 'pasta_draw_bench', type: 'pasta_drawing', dataKey: 'grindless_pasta_drawing', typeOnly: true, maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 } },
    { name: 'pasta_laminator', type: 'pasta_lamination', dataKey: 'grindless_pasta_lamination', typeOnly: true, maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 } },
    {
      // written final: one UIV 16 A dynamo hatch (16 A x V[UIV] = 536,870,912 EU/t) carries the tap's 4 A x V[UXV]
      name: 'polar_cap_tap', machine: 'gtceu:polar_cap_tap', type: 'polar_cap_tapping', dataKey: 'grindless_polar_cap_tapping', lang: 'Polar Cap Tap',
      maxIO: { itemsIn: 2, itemsOut: 0, fluidsIn: 0, fluidsOut: 0 }, generator: true, width: 13, height: 17, depth: 13,
      casing: GUM, texture: GUM_TEXTURE,
      pal: { F: GUM, M: PULSED, A: 'gtceu:stable_machine_casing', C: COIL, L: GLASS, P: 'gtceu:titanium_pipe_casing', Q: 'naquadah_alloy' },
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 1 }), Pat.part('energy_output', { min: 1, max: 1 })]
      }
    }
  ]

  // The crust tap (11 x 11 x 21): a gum-metal funnel on the z axis, five slices wide at the receiver (front, under the booth) and narrowing in
  // steps of four slices to the tip; pulsed-field winding rings every fourth slice, superconducting coil rings between them, a fusion-glass
  // window at the tip and frame struts along the bed. BOOTSTRAP-safe: no pasta containment casing (its inputs are frc_cartridge and cage_part).
  function crustTap() {
    var s = G.uevShapes.scene(11, 11, 21)
    for (var z = 0; z <= 20; z++) {
      var r = z >= 17 ? 5 : z >= 13 ? 4 : z >= 9 ? 3 : z >= 5 ? 2 : 1
      var ch = z % 4 === 0 ? 'M' : (z === 6 || z === 10) ? 'C' : 'F'
      if (z === 0) ch = 'F'
      s.cyl('z', 5, 5, r, z, z, ch, r > 1)
    }
    s.set(5, 5, 0, 'L')
    s.box(3, 0, 0, 7, 0, 20, 'A')
    ;[4, 8, 12, 16].forEach(function (zz) { s.box(5, 1, zz, 5, 1, zz, 'Q') })
    return s.booth('F', 3).fn()
  }

  // The polar cap tap (13 x 17 x 13): a round gum-metal plinth, a tall electrode mast (a ring of gum metal round a superconducting core, pulsed-field
  // collars, glass insulator rings) and a crown that steps up to a point, with four frame guys from the plinth and the booth on the front edge.
  function capMast() {
    var s = G.uevShapes.scene(13, 17, 13)
    s.cyl('y', 6, 6, 5, 0, 0, 'F')
    s.cyl('y', 6, 6, 5, 1, 2, 'A', true)
    s.cyl('y', 6, 6, 4, 1, 1, 'M', true, null)
    s.cyl('y', 6, 6, 4, 3, 3, 'A', true, null)
    for (var y = 3; y <= 13; y++) {
      s.cyl('y', 6, 6, 2, y, y, y % 4 === 1 ? 'L' : 'F', true)
      s.set(6, y, 6, 'C')
    }
    ;[5, 9, 13].forEach(function (yy) { s.cyl('y', 6, 6, 3, yy, yy, 'M', true, null) })
    s.cyl('y', 6, 6, 1, 14, 15, 'F')
    s.set(6, 16, 6, 'C')
    ;[[3, 6], [9, 6], [6, 3], [6, 9]].forEach(function (p) { s.box(p[0], 3, p[1], p[0], 7, p[1], 'Q') })
    return s.booth('F', 3).fn()
  }

  // The Pasta Mill (19 x 13 x 55), z from the back (0) to the front (54, under the booth): a round sorter drum (cryostat bins and a coil
  // deflector ring), then a narrow draw line (coil sheath, gearbox capstans) and a press hall (robust platen, gearbox rams) at the front.
  function pastaMill() {
    var s = G.uevShapes.scene(19, 13, 55)
    var z
    for (z = 0; z <= 20; z++) {
      var ch = z % 2 === 0 ? 'M' : 'F'
      s.cyl('z', 9, 6, 6, z, z, ch, true)
    }
    s.cyl('z', 9, 6, 6, 0, 0, 'F')
    s.cyl('z', 9, 6, 6, 10, 10, 'C', true, null)
    for (z = 1; z <= 19; z += 2) { s.set(5, 1, z, 'K'); s.set(13, 1, z, 'K') }
    s.box(6, 0, 1, 12, 0, 20, 'M')
    for (z = 21; z <= 38; z++) {
      s.cyl('z', 9, 6, 3, z, z, z % 2 === 0 ? 'M' : 'F', true)
      if (z % 6 === 3) s.cyl('z', 9, 6, 2, z, z, 'C', true, null)
    }
    ;[24, 30, 36].forEach(function (zz) { s.box(5, 1, zz, 5, 3, zz, 'B'); s.box(13, 1, zz, 13, 3, zz, 'B') })
    s.box(3, 0, 21, 15, 0, 38, 'M')
    s.room(0, 0, 39, 18, 9, 54, 'F', '', null)
    s.box(6, 1, 44, 12, 2, 50, 'R')
    s.box(9, 3, 44, 9, 8, 44, 'B'); s.box(9, 3, 50, 9, 8, 50, 'B')
    s.box(2, 5, 41, 16, 5, 41, 'L')
    for (z = 41; z <= 53; z += 4) s.box(0, 1, z, 0, 8, z, 'M')
    for (var rx = 0; rx <= 18; rx += 3) s.box(rx, 10, 39, rx, 10, 54, 'Q')
    return s.booth('F', 3).fn()
  }

  // built in the machine registry callback: uiv/shapes.js and uev/shapes.js may load after this file
  function spec(m) {
    if (m.name === 'pasta_phase_sorter') {
      return G.uevShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: pastaMill() })
    }
    if (m.name === 'pasta_extractor' || m.name === 'polar_cap_tap') {
      return G.uevShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: m.name === 'pasta_extractor' ? crustTap() : capMast() })
    }
    throw new Error(LOG + 'no shape for ' + m.name)
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

  // the tap's own fuel: UIV's polar_cap_electrode is not spent here
  StartupEvents.registry('item', function (event) {
    event.create('grindless:lasagna_electrode')
      .texture('grindless:item/lasagna_electrode')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.lasagna_electrode.0')))
      .tooltip(Text.darkGray(Text.translate('tooltip.grindless.lasagna_electrode.1')))
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    VP.machines.forEach(function (m) {
      event.create(m.type)
        .category(m.generator ? 'generator' : 'multiblock')
        .setEUIO(m.generator ? 'out' : 'in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    VP.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      if (m.typeOnly) return
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      var types = [m.type].concat(m.extraTypes || [])
      var builder = event.create(m.name, 'multiblock')
      if (m.generator) builder = G.generators.configure(builder, { maxParallels: 1, name: m.name })
      else builder = builder.recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      builder
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
      types.forEach(function (t) { builder = builder.recipeType(t) })
      builder
        .appearanceBlock(function () { return Block.getBlock(m.casing || SITE_CASING) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          types.length === 1
            ? Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type))
            : Text.translate('gtceu.machine.available_recipe_map_3.tooltip', Text.translate('gtceu.' + types[0]), Text.translate('gtceu.' + types[1]), Text.translate('gtceu.' + types[2])),
          ['pasta_extraction', 'polar_cap_tapping'].indexOf(m.type) >= 0 ? Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.vela_pulsar_orbit')) : null,
          m.generator ? Text.translate('grindless.machine.' + m.name + '.tooltip.1') : Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ].filter(Boolean))
        .workableCasingModel(m.texture || SITE_TEXTURE, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
