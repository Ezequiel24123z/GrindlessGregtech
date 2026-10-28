// priority: -7628
// -----------------------------------------------------------------------------------------------
// UEV's Sirius B machines (docs/eras/uev.md, machines 23-25 and line 28; package UEV-B4): the white dwarf spectrograph, the degenerate harvester,
// the containment works and their recipe types. The recipes come from data/grindless/tables/sirius.json (server_scripts/grindless/uev/sirius.js);
// all three types run in Sirius B orbit only (grindless:sirius_b_orbit, B1's dimension; the recipes carry it).
//
//   gtceu:white_dwarf_spectrograph   type gtceu:gravitational_redshift: ULE cavity + SNSPDs (nuclear clock kept) -> the mass-radius chart.
//   gtceu:degenerate_harvester       type gtceu:degenerate_harvesting: the EOS model (consumed), the chart (kept), liquid helium (kept) -> degenerate matter.
//   gtceu:containment_works          type gtceu:degenerate_containment: degenerate matter + the Casimir array's exotic matter cell (the stasis field)
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
  const CONTAIN = 'grindless:degenerate_containment_casing'
  const CONTAIN_TEXTURE = 'grindless:block/uev/degenerate_containment_casing'

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
      lang: 'Degenerate Harvester',
      casing: CONTAIN, texture: CONTAIN_TEXTURE,
      // items in: the EOS model, the kept chart, the circuit; fluids in: the kept liquid helium; out: degenerate matter
      maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 },
      width: 5, height: 5, depth: 7
    },
    works: {
      name: 'containment_works',
      machine: 'gtceu:containment_works',
      type: 'degenerate_containment',
      dataKey: 'grindless_degenerate_containment',
      lang: 'Containment Works',
      casing: CONTAIN, texture: CONTAIN_TEXTURE,
      // items in: degenerate matter, the stasis field cell, the circuit; out: the sealed pellet
      maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      width: 5, height: 5, depth: 7
    }
  }
  SI.order = ['spectrograph', 'harvester', 'works']

  // A hollow shell: row 0 (X) takes the parts, the top row and the walls are casing (F), S is the controller (front wall, row 1, middle).
  function shell(m) {
    var slices = []
    var last = m.depth - 1
    var mid = (m.width - 1) / 2
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var row = ''
        for (var c = 0; c < m.width; c++) {
          var ch
          var isWall = si === 0 || si === last || c === 0 || c === m.width - 1
          if (r === 0) ch = 'X'
          else if (r === m.height - 1) ch = 'F'
          else if (si === last && r === 1 && c === mid) ch = 'S'
          else if (isWall) ch = 'F'
          else ch = '#'
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  SI.order.forEach(function (k) {
    var m = SI.machines[k]
    var fluids = m.maxIO.fluidsIn > 0
    var parts = [
      Pat.block(m.casing),
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ]
    if (fluids) parts.push(Pat.part('input_hatch', { min: 0, max: 1 }))
    m.spec = {
      slices: shell(m),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, parts),
        F: Pat.block(m.casing),
        '#': Pat.air()
      }
    }
  })

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
    SI.order.forEach(function (k) {
      var m = SI.machines[k]
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
    SI.order.forEach(function (k) {
      var m = SI.machines[k]
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
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
