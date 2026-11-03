// priority: -6821
// -----------------------------------------------------------------------------------------------
// OpV's replication chain at Terzan 5 core (docs/eras/opv.md, machines 14, 15 and 16, process lines 38 and 39; package OpV-R2) and the recipe
// types. The recipes come from data/grindless/tables/replication.json (server_scripts/grindless/opv/replication.js). F1 registered the shared
// ids (bulge_debris, metal_feedstock, silicate_debris_fraction, si_alloy_powder, cluster_sinter_casing, probe_seed, vitamin_kit); this package
// registers only what no other package makes: metal_debris_fraction, carbonyl_iron_nickel, ffc_pellet, spent_graphite_anode and the fluid
// metal_carbonyl.
//
//   gtceu:debris_harvester       15 x 7 x 15 sweep frame round a sorter drum, OpV. Recipe type gtceu:debris_harvesting (c1 bulge debris, c2 the two fractions).
//   gtceu:replication_refinery   13 x 15 x 13 carbonyl column beside the field-frozen cells, OpV. Type gtceu:replication_refining (Mond carbonyl cell + FFC salt bath).
//   gtceu:von_neumann_foundry    17 x 13 x 17 replicator bay, OpV. Type gtceu:self_replication (c1 and c2: a probe copies itself).
//
// Only the debris harvester is locked to Terzan 5 core; all three run on two UXV 4 A energy hatches or OpV hatches. Textures: tools/assets/Build-OpVReplicationTextures.ps1.
// Names: client_scripts/grindless/opv_replication_lang.js. Published for the recipe script: global.grindless.replication.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const R = G.replication || (G.replication = {})
  const LOG = '[grindless/opv] '

  const LAMINA = 'grindless:chain_lamina_casing'
  const LAMINA_TEXTURE = 'grindless:block/opv/chain_lamina_casing'

  R.table = 'kubejs/data/grindless/tables/replication.json'
  R.site = 'grindless:terzan5_core'

  function parts(withHatches) {
    var list = [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 2 }), Pat.part('energy_input', { min: 1, max: 2 })]
    if (withHatches) list.splice(2, 0, Pat.part('input_hatch', { min: 1, max: 2 }), Pat.part('output_hatch', { min: 1, max: 2 }))
    list.push(G.parallelHatch.part())
    return list
  }

  // shapes: opv/shapes.js. Bootstrap: none of their casings (lamina, TPV wall, NEG, field-frozen) is made from a product of these machines.
  R.machines = [
    {
      name: 'debris_harvester', machine: 'gtceu:debris_harvester', type: 'debris_harvesting', dataKey: 'grindless_debris_harvesting', lang: 'Debris Harvester',
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 }, width: 15, height: 7, depth: 15, casing: LAMINA, texture: LAMINA_TEXTURE,
      pal: { F: LAMINA, R: 'gtceu:robust_machine_casing', Q: 'tungsten_steel', B: 'gtceu:steel_gearbox', G: 'gtceu:assembly_line_grating' },
      parts: function () { return parts(false) }
    },
    {
      name: 'replication_refinery', machine: 'gtceu:replication_refinery', type: 'replication_refining', dataKey: 'grindless_replication_refining', lang: 'Replication Refinery',
      maxIO: { itemsIn: 4, itemsOut: 3, fluidsIn: 2, fluidsOut: 2 }, width: 13, height: 15, depth: 13, casing: LAMINA, texture: LAMINA_TEXTURE,
      pal: { F: LAMINA, T: 'grindless:tpv_wall_casing', K: 'grindless:field_frozen_casing', N: 'grindless:neg_xhv_casing', P: 'gtceu:titanium_pipe_casing',
        V: 'gtceu:heat_vent', Q: 'tungsten_steel', G: 'gtceu:laminated_glass' },
      parts: function () { return parts(true) }
    },
    {
      name: 'von_neumann_foundry', machine: 'gtceu:von_neumann_foundry', type: 'self_replication', dataKey: 'grindless_self_replication', lang: 'Von Neumann Foundry',
      maxIO: { itemsIn: 5, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }, width: 17, height: 13, depth: 17, casing: LAMINA, texture: LAMINA_TEXTURE,
      pal: { F: LAMINA, K: 'grindless:field_frozen_casing', R: 'gtceu:robust_machine_casing', E: 'gtceu:assembly_line_grating', B: 'gtceu:steel_gearbox',
        Q: 'tungsten_steel', G: 'gtceu:laminated_glass' },
      parts: function () { return parts(false) }
    }
  ]

  R.items = ['metal_debris_fraction', 'carbonyl_iron_nickel', 'ffc_pellet', 'spent_graphite_anode']
  R.materials = { 'grindless:metal_carbonyl': { colour: 0xB8C4D8, formula: 'Fe(CO)5' } }

  // built in the machine registry callback: opv/shapes.js may load after this file
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
    R.items.forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(R.materials).forEach(function (key) {
      var spec = R.materials[key]
      var material = event.create(key)
      material.liquid()
      material.color(spec.colour).formula(spec.formula)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    R.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    R.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
