// priority: -6687
// -----------------------------------------------------------------------------------------------
// OpV's collector nodes and the bulge collector at Terzan 5 core (docs/eras/opv.md, machines 17 and 18, process line 40; package OpV-R3) and the
// recipe types. The recipes come from data/grindless/tables/bulge_collector.json (server_scripts/grindless/opv/bulge_collector.js). F1 registered
// the shared ids (collector_node, spent_collector_node, deployed_node_pack, bulge_light_census, node_power_transmitter...); this package registers
// only si_ribbon and pv_collector_film.
//
//   gtceu:collector_node_works   9 x 5 x 13 clean line, OpV. Type gtceu:collector_node_assembly (c1 ribbon, c2 film, c3 node, c4 deployed pack).
//   gtceu:bulge_collector        13 x 7 x 13 dish hall, OpV, a GENERATOR on one OpV 4 A dynamo hatch. Type gtceu:bulge_light_collection
//                                (c1 / c2 / c3: 1, 4, 16 packs -> 2^26, 2^28, 2^30 EU/t for one shared duration; the packs are consumed).
//
// Both are locked to Terzan 5 core. Textures: tools/assets/Build-OpVBulgeCollectorTextures.ps1. Names: client_scripts/grindless/opv_bulge_collector_lang.js.
// Published for the recipe script: global.grindless.bulgeCollector.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const B = G.bulgeCollector || (G.bulgeCollector = {})
  const LOG = '[grindless/opv] '

  const PLASCRETE = 'gtceu:plascrete'
  const PLASCRETE_TEXTURE = 'gtceu:block/casings/cleanroom/plascrete'
  const HPC = 'gtceu:high_power_casing'
  const HPC_TEXTURE = 'gtceu:block/casings/hpca/high_power_casing'

  B.table = 'kubejs/data/grindless/tables/bulge_collector.json'
  B.site = 'grindless:terzan5_core'

  function abs(n) { return n < 0 ? -n : n }
  function max(a, b) { return a > b ? a : b }

  // x left to right, y bottom to top, z back to front; 'X' floor (casing or a part), F casing, L glass, G grating, C coil, '#' air, ' ' anything
  // 17: a plascrete line, cleanroom-glass windows on the long walls, a grating roof strip over every second bay
  function worksCell(x, y, z) {
    var dx = x - 4
    if (y === 0) return 'X'
    if (abs(dx) === 4 && (z === 0 || z === 12)) return 'Q'
    if (abs(dx) === 4 || z === 0 || z === 12) {
      if (y === 4) return 'F'
      if (y === 2 && abs(dx) === 4 && z % 2 === 1) return 'L'
      if (y === 1 && z % 2 === 0) return 'N'
      if (y === 3 && z % 4 === 2 && abs(dx) === 4) return 'P'
      return 'F'
    }
    if (y === 4) return 'G'
    return '#'
  }

  // 18: a 13 x 13 dish hall: high power casing wall with laminated-glass windows, a coil spine in the middle and four coil pylons at (+-3, +-3)
  function bulgeCell(x, y, z) {
    var dx = x - 6
    var dz = z - 6
    var r = max(abs(dx), abs(dz))
    if (y === 0) return 'X'
    if (r === 6) {
      if (y === 6) return 'F'
      if (abs(dx) === 6 && abs(dz) === 6) return 'Q'
      if (y >= 2 && y <= 4) return (x + z) % 3 === 0 ? 'F' : 'L'
      if (y === 1 && (x + z) % 2 === 0) return 'N'
      return 'F'
    }
    if (y === 6) return ' '
    if (dx === 0 && dz === 0 && y <= 5) return 'C'
    if (abs(dx) === 3 && abs(dz) === 3 && y <= 4) return 'C'
    return '#'
  }

  B.machines = [
    {
      name: 'collector_node_works', machine: 'gtceu:collector_node_works', type: 'collector_node_assembly', dataKey: 'grindless_collector_node_assembly',
      lang: 'Collector Node Works', generator: false,
      maxIO: { itemsIn: 5, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }, width: 9, height: 5, depth: 13, casing: PLASCRETE, texture: PLASCRETE_TEXTURE,
      pal: { F: PLASCRETE, L: 'gtceu:cleanroom_glass', G: 'gtceu:assembly_line_grating', N: 'gtceu:filter_casing', P: 'gtceu:tungstensteel_pipe_casing', Q: 'stainless_steel' }, fn: worksCell,
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 2 }), Pat.part('energy_input', { min: 1, max: 2 }), G.parallelHatch.part()]
      }
    },
    {
      name: 'bulge_collector', machine: 'gtceu:bulge_collector', type: 'bulge_light_collection', dataKey: 'grindless_bulge_light_collection',
      lang: 'Bulge Collector', generator: true,
      maxIO: { itemsIn: 2, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 }, width: 13, height: 7, depth: 13, casing: HPC, texture: HPC_TEXTURE,
      pal: { F: HPC, L: 'gtceu:laminated_glass', C: 'gtceu:superconducting_coil', N: 'gtceu:filter_casing', Q: 'stainless_steel' }, fn: bulgeCell,
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 1 }), Pat.part('output_bus', { min: 1, max: 1 }), Pat.part('energy_output', { min: 1, max: 1 })]
      }
    }
  ]

  B.items = {
    si_ribbon: { stack: 64 },
    pv_collector_film: { stack: 64 }
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: m.fn })
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
          Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.terzan5_core')),
          m.generator ? Text.translate('grindless.machine.' + m.name + '.tooltip.1') : Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
