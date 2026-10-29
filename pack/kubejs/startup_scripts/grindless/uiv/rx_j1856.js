// priority: -9280
// -----------------------------------------------------------------------------------------------
// RX J1856.5-3754: the crust lift, the neutron drip separator, the neutronium cage, the r-process decompressor and the decay heat vault
// (docs/eras/uiv.md, machines 13-17, lines 30-33; package UIV-B2): the machines, their recipe types and the package's own items and fluids.
// The recipes come from data/grindless/tables/rx_j1856.json (server_scripts/grindless/uiv/rx_j1856.js). Every machine works only at
// grindless:rx_j1856_orbit (UIV-B1's far place; the recipes carry recipe.dimension(...) like uev/sirius.js).
//
//   gtceu:crust_lift               9 x 9 x 15, UIV (31,457,280 EU/t). Type gtceu:crust_lifting (circuit 1 crust lift).
//   gtceu:neutron_drip_separator   7 x 7 x 9.  Type gtceu:neutron_drip_separation (circuit 1 inner crust, 2 drip neutrons).
//   gtceu:neutronium_cage          7 x 7 x 7 in metallic-hydrogen coil blocks. Type gtceu:neutronium_caging (circuit 1 neutron superfluid, 2 pellet).
//   gtceu:r_process_decompressor   9 x 7 x 9.  Type gtceu:r_process_decompression (circuit 1 hot r-process mix, 2 flashed target).
//   gtceu:decay_heat_vault         7 x 7 x 7, a generator written at its final figure (lib/generators.js; NOT in power/generators.js) that sends
//                                  its EU out through its own UIV dynamo hatch only. Type gtceu:decay_heat (circuit 1 sealed capsule, 2 opened ash).
//
// New ids: the items and fluids below (grindless: items, gtceu: fluids). Textures: tools/assets/Build-UIVRx_j1856Textures.ps1.
// Names: client_scripts/grindless/uiv_rx_j1856_lang.js. Published for the recipe script: global.grindless.rxJ1856.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const RX = G.rxJ1856 || (G.rxJ1856 = {})
  const LOG = '[grindless/uiv] '

  const CASING = 'gtceu:uiv_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/voltage/uiv/side'
  const SITE_CASING = 'grindless:neutron_star_site_casing'
  const COIL = 'grindless:metallic_hydrogen_coil_block'

  RX.table = 'kubejs/data/grindless/tables/rx_j1856.json'
  RX.site = 'grindless:rx_j1856_orbit'
  RX.dynamo = 'gtceu:uiv_energy_output_hatch'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  RX.items = {
    neutron_star_crust: { stack: 16 },
    inner_crust_matter: { stack: 16 },
    crust_nuclei: { stack: 16 },
    outer_crust_ions: { stack: 16 },
    bn_coated_cnt_yarn: { stack: 32 },
    mh_laminated_yarn: { stack: 32 },
    braided_mh_tether: { stack: 16 },
    mh_tether: { stack: 16 },
    polar_cap_electrode: { stack: 1 },
    crust_lift_tether: { stack: 1 },
    worn_crust_lift_tether: { stack: 1 },
    fission_fragments: { stack: 16 },
    kilonova_capsule: { stack: 1 },
    aged_kilonova_capsule: { stack: 1 },
    r_process_ash: { stack: 16 },
    flashed_target: { stack: 1 },
    es254_target: { stack: 1 }
  }

  RX.fluids = {
    'gtceu:drip_neutrons': { colour: 0x9AF0FF, formula: 'n', gas: true },
    'gtceu:neutron_superfluid': { colour: 0xE8F8FF, formula: 'n(sf)', gas: false },
    'gtceu:hot_r_process_mix': { colour: 0xFF8A30, formula: 'r', gas: false },
    'gtceu:element_119_recoil_gas': { colour: 0x70D8A0, formula: 'Uue', gas: true },
    'gtceu:es_fm_liquor': { colour: 0x80C8A8, formula: 'EsFm', gas: false },
    'gtceu:es_254_solution': { colour: 0x60E0A0, formula: 'Es', gas: false }
  }

  // parts: [ability, min, max]; items in include the programmed circuit
  RX.machines = [
    {
      name: 'crust_lift', machine: 'gtceu:crust_lift', type: 'crust_lifting', dataKey: 'grindless_crust_lifting', lang: 'Crust Lift',
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 },
      parts: [['input_bus', 1, 2], ['output_bus', 1, 2], ['energy_input', 1, 2]],
      width: 9, height: 9, depth: 15, casing: CASING, texture: CASING_TEXTURE, vacuum: true, rings: [SITE_CASING, SITE_CASING], generator: false
    },
    {
      name: 'neutron_drip_separator', machine: 'gtceu:neutron_drip_separator', type: 'neutron_drip_separation',
      dataKey: 'grindless_neutron_drip_separation', lang: 'Neutron Drip Separator',
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 0, fluidsOut: 1 },
      parts: [['input_bus', 1, 2], ['output_bus', 1, 2], ['output_hatch', 1, 2], ['energy_input', 1, 2]],
      width: 7, height: 7, depth: 9, casing: CASING, texture: CASING_TEXTURE, vacuum: false, rings: [SITE_CASING, SITE_CASING], generator: false
    },
    {
      name: 'neutronium_cage', machine: 'gtceu:neutronium_cage', type: 'neutronium_caging', dataKey: 'grindless_neutronium_caging', lang: 'Neutronium Cage',
      maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 2, fluidsOut: 2 },
      parts: [['input_bus', 1, 2], ['output_bus', 1, 2], ['input_hatch', 1, 2], ['output_hatch', 1, 2], ['energy_input', 1, 2]],
      width: 7, height: 7, depth: 7, casing: CASING, texture: CASING_TEXTURE, vacuum: false, rings: [COIL, COIL, COIL, COIL], generator: false
          },
          {
            name: 'r_process_decompressor', machine: 'gtceu:r_process_decompressor', type: 'r_process_decompression',
            dataKey: 'grindless_r_process_decompression', lang: 'R-Process Decompressor',
            maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
            parts: [['input_bus', 1, 2], ['output_bus', 1, 2], ['input_hatch', 1, 2], ['output_hatch', 1, 2], ['energy_input', 1, 2]],
            width: 9, height: 7, depth: 9, casing: CASING, texture: CASING_TEXTURE, vacuum: false, rings: [SITE_CASING, SITE_CASING], generator: false
          },
          {
            // written final: a UIV dynamo hatch (2 A, 62.9M EU/t) holds the vault's 33,554,432 EU/t
            name: 'decay_heat_vault', machine: 'gtceu:decay_heat_vault', type: 'decay_heat', dataKey: 'grindless_decay_heat', lang: 'Decay Heat Vault',
            maxIO: { itemsIn: 2, itemsOut: 4, fluidsIn: 0, fluidsOut: 1 },
            parts: [['input_bus', 1, 2], ['output_bus', 1, 2], ['output_hatch', 1, 2], ['energy_output', 1, 2]],
            width: 7, height: 7, depth: 7, casing: CASING, texture: CASING_TEXTURE, vacuum: false, rings: [SITE_CASING, SITE_CASING], generator: true
          }
        ]

  // The RX J1856 machines (uiv/shapes.js): shaft, separator hall, cage, ziggurat, vault. Built in the machine registry callback: shapes.js
  // may load after this file. The floor row (X) takes the parts.
  function spec(m) {
    return G.uivShapes.build(Pat, m.name, m.casing, m.parts.map(function (p) { return Pat.part(p[0], { min: p[1], max: p[2] }) }))
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
    Object.keys(RX.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(RX.items[name].stack)
      tooltips(item, name)
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(RX.fluids).forEach(function (key) {
      var s = RX.fluids[key]
      var material = event.create(key)
      if (s.gas) material.gas()
      else material.liquid()
      material.color(s.colour).formula(s.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    RX.machines.forEach(function (m) {
      event.create(m.type)
        .category(m.generator ? 'generator' : 'multiblock')
        .setEUIO(m.generator ? 'out' : 'in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    RX.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      var builder = event.create(m.name, 'multiblock')
      // the vault: written at its final figure, one run at a time, through its dynamo hatch only (lib/generators.js)
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
          Text.translate('grindless.machine.' + m.name + '.tooltip.2')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
