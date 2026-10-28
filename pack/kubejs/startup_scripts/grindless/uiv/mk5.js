// priority: -9235
// -----------------------------------------------------------------------------------------------
// UIV's polarised proton source and Mk5 fusion ring (docs/eras/uiv.md, machines 9 and 10, lines 7 and 25-29; package UIV-A9): the machines, the
// recipe type of the first and the package's own items and gases. The recipes come from data/grindless/tables/mk5.json
// (server_scripts/grindless/uiv/mk5.js); the direct energy converter's three Mk5 rows from tables/fusion_mk5.json (zpm/fusion.js).
//
//   gtceu:polarised_proton_source   7 x 5 x 7 in grindless:cryostat_casing with a belt of grindless:metallic_hydrogen_coil_block (the polarising
//                                   magnet), UIV (31,457,280 EU/t). Recipe type gtceu:proton_polarisation (circuit 1 detritiated protium, 2 Li-6H,
//                                   3 15NH3).
//   gtceu:uiv_fusion_reactor        the Mk5 ring, GTM's gtceu:fusion_reactor type at tier 11 (FusionReactorMachine.registerFusionTier, as the Mk4):
//                                   16 energy hatches x 2^5 x 10,000,000 = 5,120,000,000 EU of storage, a long; our own spike of
//                                   grindless:uiv_fusion_casing and metallic hydrogen coil blocks.
//
// New ids: the items below (grindless:) and the gases gtceu:detritiated_protium, gtceu:polarised_h_gas and gtceu:nitrogen_15_ammonia.
// Textures: tools/assets/Build-UIVMk5Textures.ps1. Names: client_scripts/grindless/uiv_mk5_lang.js. Published for the recipe script: global.grindless.mk5.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MK = G.mk5 || (G.mk5 = {})
  const LOG = '[grindless/uiv] '

  const UIV = 11
  const CRYO = 'grindless:cryostat_casing'
  const CRYO_TEXTURE = 'grindless:block/zpm/cryostat_casing'
  const CASING = 'grindless:uiv_fusion_casing'
  const CASING_TEXTURE = 'grindless:block/uiv/uiv_fusion_casing'
  const COIL = 'grindless:metallic_hydrogen_coil_block'

  MK.table = 'kubejs/data/grindless/tables/mk5.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  MK.items = {
    li6_hydride: { stack: 64 },
    polarised_li6h: { stack: 16 },
    polarised_h_ice: { stack: 16 },
    polarised_15nh3_ice: { stack: 16 },
    polarised_h_pellet: { stack: 64 },
    polarised_li6h_pellet: { stack: 64 },
    polarised_15nh3_pellet: { stack: 64 },
    polarised_he3_cell: { stack: 16 },
    plasma_sprayed_tile: { stack: 16 },
    first_wall_tile: { stack: 16 },
    li_sn_armoured_tile: { stack: 16 },
    near_net_w_mesh: { stack: 16 },
    w_mesh: { stack: 16 },
    cps_wetted_mesh: { stack: 16 },
    divertor_cassette: { stack: 16 },
    divertor: { stack: 16 }
  }

  MK.fluids = {
    'gtceu:detritiated_protium': { colour: 0xE8F0FF, formula: 'H2' },
    'gtceu:polarised_h_gas': { colour: 0xFFC8F0, formula: 'H(pol)' },
    'gtceu:nitrogen_15_ammonia': { colour: 0xC8F0E0, formula: '15NH3' }
  }

  MK.source = {
    name: 'polarised_proton_source', machine: 'gtceu:polarised_proton_source', type: 'proton_polarisation', dataKey: 'grindless_proton_polarisation',
    lang: 'Polarised Proton Source', maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 2 },
    width: 7, height: 5, depth: 7
  }
  MK.ring = { name: 'uiv_fusion_reactor', machine: 'gtceu:uiv_fusion_reactor', type: 'fusion_reactor', lang: 'Mk5 Fusion Reactor' }
  MK.tier = UIV

  // ---------------------------------------------------------------- the ring's tier (S0-6: registerFusionTier from KubeJS)

  var FRM = null
  try {
    FRM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.FusionReactorMachine')
    FRM.registerFusionTier(UIV, ' (UIV)')
  } catch (e) {
    FRM = null
    console.error(LOG + 'FusionReactorMachine.registerFusionTier(11) failed: ' + e)
  }

  // ---------------------------------------------------------------- geometry

  // A hollow box of cryostat casing; the floor row (X) takes the parts, S is the controller (front wall, row 1, middle), # is air; a belt of
  // coil blocks (M) runs on row 3 of the walls
  function sourceSpec(m) {
    var slices = []
    var last = m.depth - 1
    var mid = (m.width - 1) / 2
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var row = ''
        for (var c = 0; c < m.width; c++) {
          var edge = si === 0 || si === last || c === 0 || c === m.width - 1
          var ch
          if (r === m.height - 1) ch = 'F'
          else if (edge) ch = (si === last && r === 1 && c === mid) ? 'S' : (r === 3 ? 'M' : 'F')
          else if (r === 0) ch = 'X'
          else ch = '#'
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return {
      slices: slices,
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf(Pat.block(CRYO),
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { min: 0, max: 1 }),
          Pat.part('output_hatch', { min: 0, max: 2 }),
          Pat.part('energy_input', { min: 1, max: 2 })),
        F: Pat.block(CRYO),
        M: Pat.block(COIL),
        '#': Pat.air()
      }
    }
  }
  MK.source.spec = sourceSpec(MK.source)

  // the Mk4's spike with our casing and the metallic hydrogen coil; at most 16 energy hatches: 16 x 2^5 x 10,000,000 = 5,120,000,000 EU
  MK.ring.spec = {
    slices: [
      ['EEEEE', 'CKKKC', 'EEEEE'],
      ['EKKKE', 'I###C', 'EKKKE'],
      ['EKKKE', 'I###C', 'EKKKE'],
      ['EKKKE', 'C###O', 'EKKKE'],
      ['EEEEE', 'CCSCC', 'EEEEE']
    ],
    symbols: {
      S: Pat.controller(),
      C: Pat.block(CASING),
      K: Pat.block(COIL),
      E: Pat.oneOf(Pat.block(CASING), Pat.part('energy_input', { min: 1, max: 16 })),
      I: Pat.oneOf(Pat.block(CASING), Pat.part('input_hatch', { min: 1, max: 3 })),
      O: Pat.oneOf(Pat.block(CASING), Pat.part('output_hatch', { min: 1, max: 3 })),
      '#': Pat.air()
    }
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
    Object.keys(MK.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(MK.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MK.fluids).forEach(function (key) {
      var s = MK.fluids[key]
      event.create(key).gas().color(s.colour).formula(s.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var m = MK.source
    event.create(m.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var m = MK.source
    var type = GTRecipeTypes.get(m.type)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
    type.addDataInfo(infoOf(m.dataKey))
    Pat.register(m.machine, m.spec)
    event.create(m.name, 'multiblock')
      .langValue(m.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(m.type)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CRYO) })
      .pattern(function (def) { return Pat.build(def, m.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
        Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
        Text.translate('grindless.machine.' + m.name + '.tooltip.2')
      ])
      .workableCasingModel(CRYO_TEXTURE, 'grindless:block/multiblock/' + m.name)

    if (FRM == null) {
      console.error(LOG + 'the Mk5 fusion ring is not registered: the tier registration failed')
      return
    }
    var r = MK.ring
    Pat.register(r.machine, r.spec)
    event.create(r.name, 'multiblock')
      .langValue(r.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return new FRM(holder, UIV) })
      .recipeType(r.type)
      .recipeModifier(function (machine, recipe) { return FRM.recipeModifier(machine, recipe) }, true)
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, r.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.uiv_fusion_reactor.tooltip.0'),
        Text.translate('grindless.machine.uiv_fusion_reactor.tooltip.1'),
        Text.translate('grindless.machine.uiv_fusion_reactor.tooltip.2')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/uiv_fusion_reactor')
  })
})()
