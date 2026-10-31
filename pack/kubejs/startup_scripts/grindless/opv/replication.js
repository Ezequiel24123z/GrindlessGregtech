// -----------------------------------------------------------------------------------------------
// OpV's replication chain at Terzan 5 core (docs/eras/opv.md, machines 14, 15 and 16, process lines 38 and 39; package OpV-R2) and the recipe
// types. The recipes come from data/grindless/tables/replication.json (server_scripts/grindless/opv/replication.js). F1 registered the shared
// ids (bulge_debris, metal_feedstock, silicate_debris_fraction, si_alloy_powder, cluster_sinter_casing, probe_seed, vitamin_kit); this package
// registers only what no other package makes: metal_debris_fraction, carbonyl_iron_nickel, ffc_pellet, spent_graphite_anode and the fluid
// metal_carbonyl.
//
//   gtceu:debris_harvester       11 x 5 x 11 robust hall, OpV. Recipe type gtceu:debris_harvesting (c1 bulge debris, c2 the two fractions).
//   gtceu:replication_refinery    9 x 9 x 9 clean two-cell plant, OpV. Type gtceu:replication_refining (Mond carbonyl cell + FFC salt bath).
//   gtceu:von_neumann_foundry    11 x 11 x 11 gantry hall, OpV. Type gtceu:self_replication (c1 and c2: a probe copies itself).
//
// All three are locked to Terzan 5 core and run on two UXV 4 A energy hatches or OpV hatches. Textures: tools/assets/Build-OpVReplicationTextures.ps1.
// Names: client_scripts/grindless/opv_replication_lang.js. Published for the recipe script: global.grindless.replication.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const R = G.replication || (G.replication = {})
  const LOG = '[grindless/opv] '

  const ROBUST = 'gtceu:robust_machine_casing'
  const ROBUST_TEXTURE = 'gtceu:block/casings/solid/machine_casing_robust_tungstensteel'
  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'

  R.table = 'kubejs/data/grindless/tables/replication.json'
  R.site = 'grindless:terzan5_core'

  function abs(n) { return n < 0 ? -n : n }
  function max(a, b) { return a > b ? a : b }

  // x left to right, y bottom to top, z back to front; 'X' floor (casing or a part), F casing, Q frame, '#' air, ' ' anything
  // 14: a robust hall, frame posts at the corners, gearbox towers at the ring r = 2 and a gear course around the walls
  function harvesterCell(x, y, z) {
    var dx = x - 5
    var dz = z - 5
    var r = max(abs(dx), abs(dz))
    if (y === 0) return 'X'
    if (y === 4) return r === 5 ? (abs(dx) === 5 && abs(dz) === 5 ? 'Q' : ((x + z) % 2 === 0 ? 'G' : 'F')) : (r <= 1 ? 'F' : ' ')
    if (r === 5) return abs(dx) === 5 && abs(dz) === 5 ? 'Q' : (y === 2 ? ((x + z) % 2 === 0 ? 'B' : 'F') : ((x + z) % 3 !== 0 ? 'G' : 'F'))
    if (r === 2 && abs(dx) === 2 && abs(dz) === 2) return 'B'
    return '#'
  }

  R.machines = [
    {
      name: 'debris_harvester', machine: 'gtceu:debris_harvester', type: 'debris_harvesting', dataKey: 'grindless_debris_harvesting', lang: 'Debris Harvester',
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 }, width: 11, height: 5, depth: 11, casing: ROBUST, texture: ROBUST_TEXTURE,
      pal: { F: ROBUST, Q: 'tungsten_steel', B: 'gtceu:steel_gearbox', G: 'gtceu:assembly_line_grating' }, fn: harvesterCell,
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 2 }), Pat.part('energy_input', { min: 1, max: 2 }), G.parallelHatch.part()]
      }
    }
  ]

  R.items = ['metal_debris_fraction']
  R.materials = {}

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
          Text.translate('gtceu.multiblock.parallelizable.tooltip'),
          Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.terzan5_core'))
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
