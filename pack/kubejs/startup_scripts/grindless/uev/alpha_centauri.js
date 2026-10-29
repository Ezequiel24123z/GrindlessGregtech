// priority: -7446
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
// Geometry (lib/patterns.js): a dish, a long bench hall and an antenna hall (shapes in uev/shapes.js). Textures: tools/assets/Build-UEVAlphaCentauriTextures.ps1.
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

  // The collector is a dish (a glass hall under a big sky-facing bowl), the lab a long hall with benches under a pipe ridge, the timing
  // station a hall under an antenna mast. Built in the registry callback (shapes.js may load after this file).
  var SHAPES = {
    collector: { w: 11, h: 12, d: 11, fn: function () { return G.uevShapes.hall({ w: 11, d: 11, hh: 5, crown: G.uevShapes.dish(11, 11, 4) }) } },
    lab: {
      w: 9, h: 7, d: 13,
      fn: function () {
        return G.uevShapes.hall({
          w: 9, d: 13, hh: 5, crown: G.uevShapes.ridge(9, 13),
          inner: function (x, y, z) {
            var ax = x < 4 ? 4 - x : x - 4
            if (ax === 2 && z % 2 === 0 && z >= 2 && z <= 8) return y === 1 ? 'B' : (y === 2 ? 'L' : null)
            if (ax === 0 && z === 6 && y <= 3) return 'C'
            return null
          }
        })
      }
    },
    station: {
      w: 7, h: 11, d: 9,
      fn: function () {
        return G.uevShapes.hall({
          w: 7, d: 9, hh: 4, mull: 2, crown: G.uevShapes.mast(7, 9, 7),
          inner: function (x, y, z) { return x === 3 && z === 4 && y <= 2 ? 'C' : null }
        })
      }
    }
  }
  Object.keys(AC.machines).forEach(function (k) {
    var m = AC.machines[k]
    m.width = SHAPES[k].w
    m.height = SHAPES[k].h
    m.depth = SHAPES[k].d
  })

  function makeSpec(k) {
    var m = AC.machines[k]
    return G.uevShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, fn: SHAPES[k].fn(),
      pal: {
        F: m.casing, A: 'gtceu:stable_machine_casing', L: 'gtceu:laminated_glass', P: 'gtceu:tungstensteel_pipe_casing',
        C: 'gtceu:trinium_coil_block', B: 'gtceu:tungstensteel_gearbox', Q: 'tungsten_steel'
      },
      parts: [
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 0, max: 1 }),
        Pat.part('output_hatch', { min: 0, max: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('energy_input', { min: 1, max: 2 })
      ]
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
      m.spec = makeSpec(k)
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
