// priority: -6791
// -----------------------------------------------------------------------------------------------
// OpV's Kugelblitz forge and Hawking collector (docs/eras/opv.md, machines 10 and 11, process line 37; package OpV-D3): two multiblocks at
// Cygnus X-1 orbit, their recipe types and the three intermediates that only they use. The recipes come from
// data/grindless/tables/kugelblitz.json (server_scripts/grindless/opv/kugelblitz.js). Every cross-package id (kugelblitz_core,
// hawking_drive, the gamma optics, dense positron cells, absorber tiles) is F1's (opv/foundation.js) or older.
//
//   gtceu:kugelblitz_forge     23 x 23 x 23 two-shell sphere on a lamina cradle (D5-SHAPE-OPV-A), OpV. Recipe type gtceu:kugelblitz_forming: gamma pulses pumped by positron annihilation are
//                              focused by Laue lenses and mirrors in an FRC cartridge into a Kugelblitz (Crane & Westmoreland 2009: named
//                              fiction). The hole never spins (Schwarzschild); it is charged with positrons and held electrostatically in the
//                              absorber shell. Runs anywhere.
//   gtceu:hawking_collector    17 x 17 x 17 sphere (core cage, absorber ring, TPV wall), OpV, a GENERATOR (Gen.configure) on OpV dynamo hatches (two 1 A or one 4 A), one run at a
//                              time. Recipe type gtceu:hawking_power: a Kugelblitz core is fed and its Hawking radiation collected (Hawking 1974,
//                              Page 1976; the feed rate is named fiction). Runs anywhere.
//   grindless:gamma_pump_charge, kugelblitz_seed, evaporated_core_shell   the forge's intermediates and the collector's spent core.
//
// Geometry (lib/patterns.js: a slice has at most 16 rows): a sphere clipped by the front and back plates, so the controller sits in the middle
// of the front disc, with the hatches in a ring round it. Orbit has no up.
// Textures: tools/assets/Build-OpVKugelblitzTextures.ps1. Names: client_scripts/grindless/opv_kugelblitz_lang.js.
// Published for the recipe script: global.grindless.kugelblitz.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const KB = G.kugelblitz || (G.kugelblitz = {})
  const LOG = '[grindless/opv] '

  const FIELD_FROZEN = 'grindless:field_frozen_casing'
  const SHIELD = 'grindless:annihilation_shield_casing'
  const CAVITY = 'grindless:kugelblitz_cavity_casing'
  const LAMINA = 'grindless:chain_lamina_casing'
  const TPV_WALL = 'grindless:tpv_wall_casing'
  const FIELD_TEXTURE = 'grindless:block/opv/field_frozen_casing'
  const SHIELD_TEXTURE = 'grindless:block/opv/annihilation_shield_casing'

  KB.table = 'kubejs/data/grindless/tables/kugelblitz.json'
  KB.site = 'grindless:cygnus_x1_orbit'
  KB.items = { gamma_pump_charge: { stack: 16 }, kugelblitz_seed: { stack: 16 }, evaporated_core_shell: { stack: 16 } }

  // items in include the programmed circuit
  KB.machines = [
    {
      name: 'kugelblitz_forge', machine: 'gtceu:kugelblitz_forge', type: 'kugelblitz_forming', dataKey: 'grindless_kugelblitz_forming',
      lang: 'Kugelblitz Forge', maxIO: { itemsIn: 6, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }, casing: FIELD_FROZEN, texture: FIELD_TEXTURE,
      generator: false, size: 23,
      pal: { F: FIELD_FROZEN, K: CAVITY, A: SHIELD, Y: LAMINA, G: 'gtceu:fusion_glass', C: 'gtceu:fusion_coil', P: 'gtceu:tungstensteel_pipe_casing' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 1 }),
          Pat.part('output_bus', { min: 1, max: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
    },
    {
      // written final: two OpV 1 A dynamo hatches (2^29 each) hold c1's 2^30 EU/t; one 4 A hatch holds it alone
      name: 'hawking_collector', machine: 'gtceu:hawking_collector', type: 'hawking_power', dataKey: 'grindless_hawking_power',
      lang: 'Hawking Collector', maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 }, casing: SHIELD, texture: SHIELD_TEXTURE,
      generator: true, size: 17,
      pal: { F: SHIELD, K: FIELD_FROZEN, Y: LAMINA, T: TPV_WALL, G: 'gtceu:fusion_glass', C: 'gtceu:superconducting_coil' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 1 }),
          Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('output_bus', { min: 1, max: 1 }),
          Pat.part('energy_output', { min: 1, max: 2 })
        ]
      }
    }
  ]

  // built in the machine registry callback; the silhouettes are opv/shapes.js (G.opvShapes)
  function spec(m) {
    return G.opvShapes.build(Pat, m.name, m.pal, m.parts())
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

  StartupEvents.registry('item', function (event) {
    Object.keys(KB.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(KB.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    KB.machines.forEach(function (m) {
      event.create(m.type)
        .category(m.generator ? 'generator' : 'multiblock')
        .setEUIO(m.generator ? 'out' : 'in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    KB.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      var builder = event.create(m.name, 'multiblock')
      if (m.generator) builder = G.generators.configure(builder, { maxParallels: 1, name: m.name })
      else builder = builder.recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      builder
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
            Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type))
        ].concat(m.generator ? [] : [Text.translate('gtceu.multiblock.parallelizable.tooltip')]))
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
