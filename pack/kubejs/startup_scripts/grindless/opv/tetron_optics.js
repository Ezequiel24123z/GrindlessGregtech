// priority: -6831
// -----------------------------------------------------------------------------------------------
// OpV's tetron fab and gamma optics works (docs/eras/opv.md, machines 1 and 2, lines 19, 34 and 35; package OpV-B1): the multiblocks,
// their recipe types and the package's own items. The recipes come from data/grindless/tables/tetron_optics.json
// (server_scripts/grindless/opv/tetron_optics.js).
//
//   gtceu:tetron_fab           15 x 11 x 17 cleanroom bay round a dilution-fridge mast, OpV (two UXV energy hatches). Recipe type gtceu:tetron_assembly (circuit 1
//                              tetron dies, 2 tetron array). Between the two the dies are In-bumped (UXV MTJ c11), flip-chip bonded (UIV
//                              ion slicing c8) and parity-tested (UIV millikelvin c6); a die that fails the array's calibration goes to
//                              the EV extraction cascade (c25).
//   gtceu:gamma_optics_works   9 x 9 x 31 optical bench, OpV. Recipe type gtceu:gamma_optics (circuit 1 Laue lens, 2 gamma multilayer
//                              mirror). Line 35's tiles come from the UEV megabar (c8, bent Ge; c9 re-bends rejected tiles) and the UHV
//                              crystal growth furnace (c24, GaAs), the frame from the UV synchrotron (c11). Line 34's blank from the UEV
//                              CVI furnace (c10; c11 strips and re-coats a rejected mirror), the WC target from the UHV spark plasma
//                              sinterer (c14), the multilayer from the UXV MTJ cluster (c12), the metrology record from the synchrotron (c10).
//
// F1 ids (tetron_die, tetron_array, laue_lens, gamma_multilayer_mirror ...) are registered in opv/foundation.js; only the ids below are new.
// Textures: tools/assets/Build-OpVTetronOpticsTextures.ps1. Names: client_scripts/grindless/opv_tetron_optics_lang.js.
// Published for the recipe script: global.grindless.tetronOptics.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const TO = G.tetronOptics || (G.tetronOptics = {})
  const LOG = '[grindless/opv] '

  const PLASCRETE = 'gtceu:plascrete'
  const LAMINA = 'grindless:chain_lamina_casing'
  const LAMINA_TEXTURE = 'grindless:block/opv/chain_lamina_casing'
  const NEG = 'grindless:neg_xhv_casing'
  const SHIELD = 'grindless:annihilation_shield_casing'

  TO.table = 'kubejs/data/grindless/tables/tetron_optics.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  TO.items = {
    bumped_tetron_die: { stack: 64 },
    bonded_tetron_die: { stack: 64 },
    tested_tetron_die: { stack: 64 },
    failed_tetron_die: { stack: 64 },
    bent_ge_tile: { stack: 64 },
    gaas_laue_tile: { stack: 64 },
    aligned_laue_frame: { stack: 16 },
    rejected_laue_tile: { stack: 64 },
    superpolished_sic_blank: { stack: 16 },
    wc_sic_multilayer: { stack: 16 },
    mirror_metrology_record: { stack: 16 },
    wc_sputter_target: { stack: 16 },
    rejected_gamma_mirror: { stack: 16 }
  }

  function parts() {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 1 }),
      Pat.part('energy_input', { min: 1, max: 2 }),
      G.parallelHatch.part()
    ]
  }

  // items in include the programmed circuit; the superfluid He-3 bath of c2 is a charge (not consumed)
  TO.machines = [
    {
      name: 'tetron_fab', machine: 'gtceu:tetron_fab', type: 'tetron_assembly', dataKey: 'grindless_tetron_assembly',
      lang: 'Tetron Fab', maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 }, casing: LAMINA, texture: LAMINA_TEXTURE,
      width: 15, height: 11, depth: 17,
      pal: { F: LAMINA, D: PLASCRETE, L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil', P: 'gtceu:tungstensteel_pipe_casing', Q: 'stainless_steel', N: NEG },
      parts: parts
    },
    {
      name: 'gamma_optics_works', machine: 'gtceu:gamma_optics_works', type: 'gamma_optics', dataKey: 'grindless_gamma_optics',
      lang: 'Gamma Optics Works', maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 }, casing: LAMINA, texture: LAMINA_TEXTURE,
      width: 9, height: 9, depth: 31,
      pal: { F: LAMINA, L: 'gtceu:laminated_glass', G: 'gtceu:laminated_glass', Q: 'tungsten_steel', P: 'gtceu:tungstensteel_pipe_casing', N: NEG, A: SHIELD },
      parts: parts
    }
  ]

  // built in the machine registry callback: opv/shapes.js (G.opvShapes) may load after this file
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
    Object.keys(TO.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(TO.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    TO.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    TO.machines.forEach(function (m) {
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
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
