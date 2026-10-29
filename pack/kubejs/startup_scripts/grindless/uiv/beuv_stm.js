// priority: -9112
// -----------------------------------------------------------------------------------------------
// UIV's BEUV scanner and STM lithography cell (docs/eras/uiv.md, machines 5 and 7, lines 11 (up to the overgrown P:Si die), 13 and 14;
// package UIV-A5): the two machines, their recipe types, the package's own items and the phosphine gas. The recipes come from
// data/grindless/tables/beuv_stm.json (server_scripts/grindless/uiv/beuv_stm.js).
//
//   gtceu:beuv_scanner           9 x 5 x 7 in grindless:photonic_casing, UIV (31,457,280 EU/t). Recipe type gtceu:beuv_lithography
//                                (circuit 1 exposure, 2 driver ASIC, 3 mirror cleaning).
//   gtceu:stm_lithography_cell   5 x 5 x 5 in gtceu:uev_machine_casing (no dedicated casing yet, as for UEV's femtosecond writer), UIV.
//                                Recipe type gtceu:stm_lithography (circuit 1 H termination, 2 STM patterning, 3 phosphine dosing).
//
// New ids: the items below (grindless:) and the gas gtceu:phosphine (GTM has none; the STM cell dopes with it, a chemical reactor row
// makes it and another scrubs the excess to phosphoric acid).
// Textures: tools/assets/Build-UIVBeuvStmTextures.ps1. Names: client_scripts/grindless/uiv_beuv_stm_lang.js.
// Published for the recipe script: global.grindless.beuvStm.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const BS = G.beuvStm || (G.beuvStm = {})
  const LOG = '[grindless/uiv] '

  const PHOTONIC = 'grindless:photonic_casing'
  const PHOTONIC_TEXTURE = 'grindless:block/uev/photonic_casing'
  const UEV = 'gtceu:uev_machine_casing'
  const UEV_TEXTURE = 'gtceu:block/casings/voltage/uev/side'

  BS.table = 'kubejs/data/grindless/tables/beuv_stm.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  BS.items = {
    tb_droplet_target: { stack: 32 },
    hfo2_resist_wafer: { stack: 16 },
    beuv_exposed_wafer: { stack: 16 },
    fouled_beuv_mirror: { stack: 16 },
    beuv_driver_asic: { stack: 32 },
    b4c_target: { stack: 32 },
    la_b4c_multilayer: { stack: 16 },
    lan_barrier_mirror: { stack: 16 },
    beuv_mirror: { stack: 16 },
    si28_fz_ingot: { stack: 16 },
    si28_fz_wafer: { stack: 16 },
    h_terminated_wafer: { stack: 16 },
    stm_patterned_wafer: { stack: 16 },
    ph3_dosed_wafer: { stack: 16 }
  }

  BS.gases = {
    'gtceu:phosphine': { colour: 0xC8D8A0, formula: 'PH3' }
  }

  // items in include the programmed circuit
  BS.machines = [
    {
      name: 'beuv_scanner', machine: 'gtceu:beuv_scanner', type: 'beuv_lithography', dataKey: 'grindless_beuv_lithography', lang: 'BEUV Scanner',
      maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 },
      width: 9, height: 5, depth: 7, casing: PHOTONIC, texture: PHOTONIC_TEXTURE
    },
    {
      name: 'stm_lithography_cell', machine: 'gtceu:stm_lithography_cell', type: 'stm_lithography', dataKey: 'grindless_stm_lithography',
      lang: 'STM Lithography Cell',
      maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 },
      width: 5, height: 5, depth: 5, casing: UEV, texture: UEV_TEXTURE
    }
  ]

  // BEUV scanner: a lithography hall with its mirror train; STM cell: a glazed bay with the scan tower (uiv/shapes.js). Built in the
  // machine registry callback: shapes.js may load after this file. The floor row (X) takes the parts.
  function spec(m) {
    return G.uivShapes.build(Pat, m.name, m.casing, [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 0, max: 1 }),
      Pat.part('output_hatch', { min: 0, max: 1 }),
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

  StartupEvents.registry('item', function (event) {
    Object.keys(BS.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(BS.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(BS.gases).forEach(function (key) {
      var s = BS.gases[key]
      var material = event.create(key)
      material.gas()
      material.color(s.colour).formula(s.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    BS.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    BS.machines.forEach(function (m) {
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
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.2')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
