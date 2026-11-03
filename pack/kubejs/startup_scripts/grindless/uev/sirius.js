// priority: -7622
// -----------------------------------------------------------------------------------------------
// UEV's Sirius B machines (docs/eras/uev.md, machines 23-25 and line 28; package UEV-B4): the white dwarf spectrograph and the Degenerate Works
// (the degenerate harvester, which also seals the pellet: the containment works is merged into it; package D4-SHAPE-UEV-B) and their recipe types. The recipes come from data/grindless/tables/sirius.json (server_scripts/grindless/uev/sirius.js);
// all three types run in Sirius B orbit only (grindless:sirius_b_orbit, B1's dimension; the recipes carry it).
//
//   gtceu:white_dwarf_spectrograph   type gtceu:gravitational_redshift: ULE cavity + SNSPDs (nuclear clock kept) -> the mass-radius chart.
//   gtceu:degenerate_harvester       types gtceu:degenerate_harvesting: the EOS model (consumed), the chart (kept), liquid helium (kept) -> degenerate matter;
//                                    and gtceu:degenerate_containment: degenerate matter + the Casimir array's exotic matter cell (the stasis field)
//                                    -> the sealed degenerate pellet. Nothing is voided.
//
// Voltage: UEV. No item is registered here: degenerate_matter, degenerate_pellet, mass_radius_chart, degenerate_eos_model, sx_pump_impeller,
// uev_field_generator and the degenerate containment casing are F1's / A8's / A4's (global.grindless.uevFoundation.ids).
// Geometry (lib/patterns.js): 5 wide x 5 high x 7 deep, hollow shells. Textures: tools/assets/Build-UEVSiriusTextures.ps1.
// Names: client_scripts/grindless/uev_sirius_lang.js. Published for the recipe script: global.grindless.uevSirius.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const SI = G.uevSirius || (G.uevSirius = {})
  const LOG = '[grindless/uev] '

  const PHOTONIC = 'grindless:photonic_casing'
  const PHOTONIC_TEXTURE = 'grindless:block/uev/photonic_casing'
  const ROBUST = 'grindless:sic_composite_casing'
  const ROBUST_TEXTURE = 'grindless:block/uev/sic_composite_casing'

  SI.table = 'kubejs/data/grindless/tables/sirius.json'
  SI.orbit = 'grindless:sirius_b_orbit'

  SI.machines = {
    spectrograph: {
      name: 'white_dwarf_spectrograph',
      machine: 'gtceu:white_dwarf_spectrograph',
      type: 'gravitational_redshift',
      dataKey: 'grindless_gravitational_redshift',
      lang: 'White Dwarf Spectrograph',
      casing: PHOTONIC, texture: PHOTONIC_TEXTURE,
      // items in: ULE cavity, SNSPDs, the kept nuclear clock, the circuit; out: the chart
      maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      width: 5, height: 5, depth: 7
    },
    harvester: {
      name: 'degenerate_harvester',
      machine: 'gtceu:degenerate_harvester',
      type: 'degenerate_harvesting',
      dataKey: 'grindless_degenerate_harvesting',
      lang: 'Degenerate Works',
      // bootstrap: the works seals the pellet the degenerate containment casing needs, so its body is the SiC composite and magnet family
      casing: ROBUST, texture: ROBUST_TEXTURE,
      // items in: the EOS model, the kept chart, the circuit; fluids in: the kept liquid helium; out: degenerate matter
      maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 },
      width: 5, height: 5, depth: 7
    }
  }
  // The harvester is the Degenerate Works: it also runs the containment type (the old containment works is merged into it).
  // items in: degenerate matter, the stasis field cell, the circuit; out: the sealed pellet
  SI.typeOnly = [{ type: 'degenerate_containment', dataKey: 'grindless_degenerate_containment', maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 } }]
  SI.machines.harvester.types = ['degenerate_harvesting', 'degenerate_containment']
  SI.order = ['spectrograph', 'harvester']

  // The spectrograph is a telescope: a glass hall under a dish on a mast. The Degenerate Works (21 x 15 x 29) is a harvester boom out of a
  // stasis vault: at the front a SiC vault with six magnet-ringed stasis pods (coil caps) and the control booth; behind it a truss boom
  // rising to a scoop, three magnet rings narrowing toward the mouth at the back, a pipe run down its axis.
  function worksCell() {
    var s = G.uevShapes.scene(21, 15, 29)
    s.box(0, 0, 15, 20, 0, 28, 'X').box(7, 0, 0, 13, 0, 15, 'X')
    s.room(0, 1, 16, 20, 7, 28, 'R', 'bt', '#')
    s.edges(0, 1, 16, 20, 7, 28, 'Q')
    ;[20, 26].forEach(function (z) { s.box(0, 7, z, 20, 7, z, 'M') })
    ;[6, 14].forEach(function (x) {
      ;[20, 25].forEach(function (z) {
        s.cyl('y', x, z, 2, 2, 6, 'M', true, '#')
        s.cyl('y', x, z, 1, 2, 2, 'B')
        s.set(x, 7, z, 'C').set(x, 6, z, 'C')
        s.set(x - 2, 4, z, 'L').set(x + 2, 4, z, 'L')
      })
    })
    s.box(8, 2, 16, 12, 5, 16, 'M')
    // the boom: a spine of SiC from the vault roof back to the scoop, truss posts every four slices
    s.box(9, 9, 0, 11, 9, 15, 'R')
    s.box(10, 10, 0, 10, 10, 15, 'R')
    for (var z = 1; z < 15; z += 5) {
      s.edges(8, 1, z, 12, 8, z, 'R')
      s.box(8, 1, z, 8, 9, z, 'Q').box(12, 1, z, 12, 9, z, 'Q')
    }
    s.box(10, 4, 0, 10, 4, 14, 'P')
    // the scoop: three field rings, narrowing from the mouth
    var rings = [[2, 5], [7, 4], [12, 3]]
    rings.forEach(function (rr) {
      s.cyl('z', 10, 8, rr[1], rr[0], rr[0] + 1, 'M', true, '#')
      s.cyl('z', 10, 8, rr[1] - 1, rr[0] + 1, rr[0] + 1, 'H', true, '#')
    })
    s.box(10, 8, 0, 10, 8, 1, 'C').set(10, 12, 3, 'C')
    return s.booth('R', 3).fn()
  }

  var SHAPES = {
    spectrograph: {
      w: 9, h: 13, d: 9,
      fn: function () {
        var s = G.uevShapes.scene(9, 13, 9)
        s.box(0, 0, 0, 8, 0, 8, 'X')
        s.room(0, 1, 0, 8, 3, 8, 'R', 't')
        s.room(0, 2, 0, 8, 3, 8, 'O', 't')
        s.cyl('y', 4, 4, 2, 4, 4, 'F', true, null)
        s.cyl('y', 4, 4, 1, 5, 8, 'M', true, '#')
        s.set(2, 6, 4, 'L').set(6, 6, 4, 'L')
        s.cone(4, 4, 4, 9, 11, 1, 'M', true)
        s.set(4, 12, 4, 'C').box(4, 5, 4, 4, 8, 4, 'Q')
        s.box(1, 1, 1, 2, 1, 4, 'B')
        return s.booth('R', 3).fn()
      }
    },
    harvester: { w: 21, h: 15, d: 29, fn: worksCell }
  }
  SI.order.forEach(function (k) {
    var m = SI.machines[k]
    m.width = SHAPES[k].w
    m.height = SHAPES[k].h
    m.depth = SHAPES[k].d
  })

  function makeSpec(k) {
    var m = SI.machines[k]
    var parts = [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 }),
      G.parallelHatch.part()
    ]
    if (m.maxIO.fluidsIn > 0) parts.push(Pat.part('input_hatch', { min: 0, max: 1 }))
    return G.uevShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, fn: SHAPES[k].fn(), parts: parts,
      pal: k === 'spectrograph' ? G.uevShapes.palette(m.casing) : G.uevShapes.palette(ROBUST, G.uevShapes.bootstrap(ROBUST, 'H'))
    })
  }
  // one EMI line per recipe, read from its data: what the circuit does
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

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    SI.order.map(function (k) { return SI.machines[k] }).concat(SI.typeOnly).forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.ARC)
    })
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SI.typeOnly.forEach(function (t) {
      var type = GTRecipeTypes.get(t.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + t.type + ' is not registered')
      type.addDataInfo(infoOf(t.dataKey))
    })
    SI.order.forEach(function (k) {
      var m = SI.machines[k]
      var types = m.types || [m.type]
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = makeSpec(k)
      Pat.register(m.machine, m.spec)
      var builder = event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
      builder = types.length > 1 ? builder.recipeTypes(types[0], types[1]) : builder.recipeType(m.type)
      builder
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          types.length > 1
            ? Text.translate('gtceu.machine.available_recipe_map_2.tooltip', Text.translate('gtceu.' + types[0]), Text.translate('gtceu.' + types[1]))
            : Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
