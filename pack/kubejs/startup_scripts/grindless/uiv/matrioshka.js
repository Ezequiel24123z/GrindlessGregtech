// priority: -9212
// -----------------------------------------------------------------------------------------------
// UIV's Matrioshka computer and droplet radiator works (docs/eras/uiv.md, machines 11 and 12, lines 19, 20, 21, 37, 41, 43 and 46; package UIV-A10):
// the machines, their recipe types, the five structure blocks and the package's own items. The recipes come from
// data/grindless/tables/matrioshka.json (server_scripts/grindless/uiv/matrioshka.js).
//
//   gtceu:matrioshka_computer     11 x 9 x 11 in UIV casing with rings of the four structure blocks (logic tile, node, emitter shell, TPV
//                                 shell) and the radiator module, UIV (31,457,280 EU/t). Recipe type gtceu:matrioshka_computing (circuit 1
//                                 research write, 2 neutron-star EOS chart, 3 Kerr chart). Works only at gcyr:mercury_orbit.
//   gtceu:droplet_radiator_works  9 x 5 x 13 in UIV casing, one wall open to vacuum, UIV. Recipe type gtceu:droplet_radiator_assembly
//                                 (circuit 1 droplet radiator module, 2 TPV tile). Works only at gcyr:mercury_orbit.
//
// The contract's 15 x 15 x 11 for the computer is tuned down to 11 x 9 x 11 (the figures are marked tune).
// New ids: the items and blocks below (grindless:) and the gas gtceu:stibine. Textures: tools/assets/Build-UIVMatrioshkaTextures.ps1.
// Names: client_scripts/grindless/uiv_matrioshka_lang.js. Published for the recipe script: global.grindless.matrioshka.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MA = G.matrioshka || (G.matrioshka = {})
  const LOG = '[grindless/uiv] '

  const CASING = 'gtceu:uiv_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/voltage/uiv/side'

  MA.table = 'kubejs/data/grindless/tables/matrioshka.json'
  MA.site = 'gcyr:mercury_orbit'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  MA.items = {
    eb_distilled_tin: { stack: 64 },
    glassy_carbon_lattice: { stack: 16 },
    sic_coated_lattice: { stack: 16 },
    droplet_wick: { stack: 16 },
    droplet_collector: { stack: 16 },
    ingaasb_epi_wafer: { stack: 16 },
    air_bridge_wafer: { stack: 16 },
    ingaasb_tpv_cell: { stack: 32 },
    tpv_tile: { stack: 16 },
    tpv_segment: { stack: 16 },
    tipt_au_stack: { stack: 32 },
    nb_target: { stack: 16 },
    w_target: { stack: 16 },
    nb_trilayer: { stack: 16 },
    nb_jj_wafer: { stack: 16 },
    aqfp_die: { stack: 16 },
    aqfp_module: { stack: 16 },
    c12_cvd_plate: { stack: 16 },
    c12_polished_plate: { stack: 16 },
    c12_metallised_plate: { stack: 16 },
    c12_boron_diamond: { stack: 16 },
    diamond_contact_wafer: { stack: 16 },
    diamond_schottky_die: { stack: 16 },
    sputtered_w_wafer: { stack: 16 },
    w_photonic_crystal: { stack: 16 },
    hfo2_passivated_crystal: { stack: 16 },
    selective_emitter: { stack: 16 },
    rad_hard_controller: { stack: 16 }
  }

  // block name -> texture; every block carries two tooltip lines like the items
  MA.blocks = {
    matrioshka_logic_tile: { texture: 'grindless:block/uiv/matrioshka_logic_tile' },
    matrioshka_node: { texture: 'grindless:block/uiv/matrioshka_node' },
    matrioshka_emitter_shell: { texture: 'grindless:block/uiv/matrioshka_emitter_shell' },
    matrioshka_tpv_shell: { texture: 'grindless:block/uiv/matrioshka_tpv_shell' },
    droplet_radiator_module: { texture: 'grindless:block/uiv/droplet_radiator_module' }
  }

  MA.fluids = {
    'gtceu:stibine': { colour: 0xC8C0D8, formula: 'SbH3', gas: true }
  }

  // items in include the programmed circuit
  MA.machines = [
    {
      name: 'matrioshka_computer', machine: 'gtceu:matrioshka_computer', type: 'matrioshka_computing', dataKey: 'grindless_matrioshka_computing',
      lang: 'Matrioshka Computer',
      maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      width: 11, height: 9, depth: 11, casing: CASING, texture: CASING_TEXTURE, vacuum: false,
      rings: ['grindless:matrioshka_logic_tile', 'grindless:matrioshka_node', 'grindless:matrioshka_emitter_shell', 'grindless:matrioshka_tpv_shell',
        'grindless:droplet_radiator_module']
    },
    {
      name: 'droplet_radiator_works', machine: 'gtceu:droplet_radiator_works', type: 'droplet_radiator_assembly', dataKey: 'grindless_droplet_radiator_assembly',
      lang: 'Droplet Radiator Works',
      maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 },
      width: 9, height: 5, depth: 13, casing: CASING, texture: CASING_TEXTURE, vacuum: true, rings: []
    }
  ]

  // Matrioshka computer: nested lattice shells round a node core; droplet radiator works: a fin array (uiv/shapes.js). Built in the machine
  // registry callback: shapes.js may load after this file. The floor row (X) takes the parts.
  function spec(m) {
    return G.uivShapes.build(Pat, m.name, m.casing, [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ])
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

  function tooltips(item, name) {
    item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
    item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(MA.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(MA.items[name].stack)
      tooltips(item, name)
    })
  })

  StartupEvents.registry('block', function (event) {
    Object.keys(MA.blocks).forEach(function (name) {
      event.create('grindless:' + name)
        .stoneSoundType()
        .hardness(5)
        .resistance(6)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .textureAll(MA.blocks[name].texture)
        .item(function (item) { tooltips(item, name) })
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MA.fluids).forEach(function (key) {
      var s = MA.fluids[key]
      var material = event.create(key)
      if (s.gas) material.gas()
      else material.liquid()
      material.color(s.colour).formula(s.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    MA.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MA.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
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
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('grindless.tooltip.site', Text.translate('planet.grindless.mercury')),
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
