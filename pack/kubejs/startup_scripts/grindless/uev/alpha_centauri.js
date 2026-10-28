// priority: -7664
// -----------------------------------------------------------------------------------------------
// UEV's Alpha Centauri machines (docs/eras/uev.md, machines 18, 19 and 20, lines 26 and 37; package UEV-B2): the nebula collector, the
// interstellar dust lab, the pulsar timing station, their recipe types and the package's own items. The recipes come from
// data/grindless/tables/alpha_centauri.json (server_scripts/grindless/uev/alpha_centauri.js); the three types run in the orbit of
// Alpha Centauri AB only (the recipes carry the dimension grindless:alpha_centauri_orbit).
//
//   gtceu:nebula_collector         type gtceu:nebula_collection: circuit 1 interstellar gas (the superhydride scoop coil is not used up),
//                                  2 dust-laden aerogel (a silica aerogel tile exposed to the gas, like Stardust's trap).
//   gtceu:interstellar_dust_lab    type gtceu:interstellar_dust_analysis: circuit 1 extracted grains, 2 demineralised grains (HF),
//                                  3 the Fe-60 record (accelerator mass spectrometry), 4 silicate residue (to GTM's electrolyser).
//   gtceu:pulsar_timing_station    type gtceu:pulsar_timing (observatory step 10): circuit 1 pulsar timing data, 2 the pulsar navigation chart
//                                  (grindless:pulsar_navigation_chart, F1's id, consumed by UIV's casing research).
//
// Voltage: UEV. New ids: the items below; the F1 ids (aerogel_tile, pulsar_navigation_chart, sdd, lobster_eye_mcp, uev_* parts, nuclear_clock,
// photonic_casing) are not registered again.
// Geometry (lib/patterns.js): 5 wide x 5 high x 7 deep, hollow shells. Textures: tools/assets/Build-UEVAlphaCentauriTextures.ps1.
// Names: client_scripts/grindless/uev_alpha_centauri_lang.js. Published for the recipe script: global.grindless.uevAlphaCentauri.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const AC = G.uevAlphaCentauri || (G.uevAlphaCentauri = {})
  const LOG = '[grindless/uev] '

  const PHOTONIC = 'grindless:photonic_casing'
  const PHOTONIC_TEXTURE = 'grindless:block/uev/photonic_casing'

  AC.table = 'kubejs/data/grindless/tables/alpha_centauri.json'
  AC.site = 'grindless:alpha_centauri_orbit'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  AC.items = {
    superhydride_scoop_coil: { stack: 16 }, dust_laden_aerogel: { stack: 16 }, extracted_grains: { stack: 64 }, demineralised_grains: { stack: 64 },
    fe60_record: { stack: 16 }, silicate_residue: { stack: 64 }, pulsar_timing_data: { stack: 16 }, alpha_coronal_field_map: { stack: 16 },
    teos_flask: { stack: 64 }, silica_sol: { stack: 64 }, silica_wet_gel: { stack: 64 }, silica_aged_gel: { stack: 64 }
  }

  AC.machines = {
    collector: {
      name: 'nebula_collector',
      machine: 'gtceu:nebula_collector',
      type: 'nebula_collection',
      dataKey: 'grindless_nebula_collection',
      lang: 'Nebula Collector',
      casing: PHOTONIC, texture: PHOTONIC_TEXTURE,
      // items in: an aerogel tile, the kept coil, the circuit; out: the exposed tile; fluids in: liquid helium for the coil; out: the gas
      maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 },
      width: 5, height: 5, depth: 7
    },
    lab: {
      name: 'interstellar_dust_lab',
      machine: 'gtceu:interstellar_dust_lab',
      type: 'interstellar_dust_analysis',
      dataKey: 'grindless_interstellar_dust_analysis',
      lang: 'Interstellar Dust Lab',
      casing: PHOTONIC, texture: PHOTONIC_TEXTURE,
      // items in: aerogel, grains or the record's grains, the kept sensor, the circuit; out: grains, residue, the record
      maxIO: { itemsIn: 4, itemsOut: 3, fluidsIn: 2, fluidsOut: 1 },
      width: 5, height: 5, depth: 7
    },
    station: {
      name: 'pulsar_timing_station',
      machine: 'gtceu:pulsar_timing_station',
      type: 'pulsar_timing',
      dataKey: 'grindless_pulsar_timing',
      lang: 'Pulsar Timing Station',
      casing: PHOTONIC, texture: PHOTONIC_TEXTURE,
      // items in: MCP optics, detectors, the kept clock, the circuit (or the data and the record); out: the data or the chart
      maxIO: { itemsIn: 5, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      width: 5, height: 5, depth: 7
    }
  }

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

  Object.keys(AC.machines).forEach(function (k) {
    var m = AC.machines[k]
    m.spec = {
      slices: shell(m),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, [Pat.block(m.casing)].concat([
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { min: 0, max: 1 }),
          Pat.part('output_hatch', { min: 0, max: 1 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('energy_input', { min: 1, max: 2 })
        ])),
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

  // ---------------------------------------------------------------- items

  StartupEvents.registry('item', function (event) {
    Object.keys(AC.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(AC.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    Object.keys(AC.machines).forEach(function (k) {
      var m = AC.machines[k]
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
    Object.keys(AC.machines).forEach(function (k) {
      var m = AC.machines[k]
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
