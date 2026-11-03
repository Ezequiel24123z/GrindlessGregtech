// priority: -6687
// -----------------------------------------------------------------------------------------------
// OpV's collector nodes and the bulge collector at Terzan 5 core (docs/eras/opv.md, machines 17 and 18, process line 40; package OpV-R3) and the
// recipe types. The recipes come from data/grindless/tables/bulge_collector.json (server_scripts/grindless/opv/bulge_collector.js). F1 registered
// the shared ids (collector_node, spent_collector_node, deployed_node_pack, bulge_light_census, node_power_transmitter...); this package registers
// only si_ribbon and pv_collector_film.
//
//   gtceu:collector_node_works   13 x 9 x 21 node assembly line, OpV. Type gtceu:collector_node_assembly (c1 ribbon, c2 film, c3 node, c4 deployed pack).
//   gtceu:bulge_collector        31 x 9 x 31 collector field, OpV, a GENERATOR on one OpV 4 A dynamo hatch. Type gtceu:bulge_light_collection
//                                (c1 / c2 / c3: 1, 4, 16 packs -> 2^26, 2^28, 2^30 EU/t for one shared duration; the packs are consumed).
//
// The collector and the node deploy row are locked to Terzan 5 core; the rest runs anywhere. Textures: tools/assets/Build-OpVBulgeCollectorTextures.ps1. Names: client_scripts/grindless/opv_bulge_collector_lang.js.
// Published for the recipe script: global.grindless.bulgeCollector.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const B = G.bulgeCollector || (G.bulgeCollector = {})
  const LOG = '[grindless/opv] '

  const LAMINA = 'grindless:chain_lamina_casing'
  const LAMINA_TEXTURE = 'grindless:block/opv/chain_lamina_casing'

  B.table = 'kubejs/data/grindless/tables/bulge_collector.json'
  B.site = 'grindless:terzan5_core'

  B.machines = [
    {
      name: 'collector_node_works', machine: 'gtceu:collector_node_works', type: 'collector_node_assembly', dataKey: 'grindless_collector_node_assembly',
      lang: 'Collector Node Works', generator: false,
      maxIO: { itemsIn: 5, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },       width: 13, height: 9, depth: 21, casing: LAMINA, texture: LAMINA_TEXTURE,
            pal: { F: LAMINA, T: 'grindless:tpv_wall_casing', D: 'gtceu:plascrete', Q: 'tungsten_steel', P: 'gtceu:tungstensteel_pipe_casing', G: 'gtceu:cleanroom_glass' },
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 2 }), Pat.part('energy_input', { min: 1, max: 2 }), G.parallelHatch.part()]
      }
    },
    {
      name: 'bulge_collector', machine: 'gtceu:bulge_collector', type: 'bulge_light_collection', dataKey: 'grindless_bulge_light_collection',
      lang: 'Bulge Collector', generator: true,
      maxIO: { itemsIn: 2, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 },       width: 31, height: 9, depth: 31, casing: LAMINA, texture: LAMINA_TEXTURE,
            pal: { F: LAMINA, T: 'grindless:tpv_wall_casing', Q: 'tungsten_steel', G: 'gtceu:laminated_glass', C: 'gtceu:superconducting_coil' },
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 1 }), Pat.part('output_bus', { min: 1, max: 1 }), Pat.part('energy_output', { min: 1, max: 1 })]
      }
    }
  ]

  B.items = {
    si_ribbon: { stack: 64 },
    pv_collector_film: { stack: 64 }
  }

  // built in the machine registry callback:   opv/shapes.js may load after this file
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
    Object.keys(B.items).forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(B.items[name].stack)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    B.machines.forEach(function (m) {
      event.create(m.type)
        .category(m.generator ? 'generator' : 'multiblock')
        .setEUIO(m.generator ? 'out' : 'in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    B.machines.forEach(function (m) {
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
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          m.generator ? Text.translate('grindless.machine.' + m.name + '.tooltip.1') : Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ].concat(m.generator ? [Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.terzan5_core'))] : []))
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
