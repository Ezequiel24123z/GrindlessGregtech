// priority: -6761
// -----------------------------------------------------------------------------------------------
// OpV's field-frozen press (docs/eras/opv.md, machine 13, process lines 3 and 45; package OpV-A3) and its recipe type. The recipes come
// from data/grindless/tables/field_press.json (server_scripts/grindless/opv/field_press.js). The package's own items: the W-Re canned
// stack, the billet and the spent can of line 3, and the AlN to AlGaN wafers of line 45; field_frozen_plate, field_frozen_casing and
// aln_power_die are F1's (opv/foundation.js).
//
//   gtceu:field_frozen_press  11 x 15 x 11 hydraulic press along the field (opv/shapes.js), OpV. Recipe type gtceu:field_freezing (circuit 1 billet,
//                             2 plate, 3 casing); locked to SGR 1806-20's orbit. It runs on two UXV 4 A energy hatches (bootstrap: OpV hatches need its plate).
//
// Geometry (lib/patterns.js: a slice has at most 64 rows): the controller sits in the front slice (z = 10), the front of the bed takes the
// parts. Bootstrap machine: it is built of lamina casing, GTM high-power casing, frames, pipe and coils only, never field-frozen casing,
// because it makes the plate that casing needs. Textures: tools/assets/Build-OpVFieldPressTextures.ps1. Names: client_scripts/grindless/opv_field_press_lang.js.
// Published for the recipe script: global.grindless.fieldPress.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const FP = G.fieldPress || (G.fieldPress = {})
  const LOG = '[grindless/opv] '

  const LAMINA = 'grindless:chain_lamina_casing'
  const LAMINA_TEXTURE = 'grindless:block/opv/chain_lamina_casing'
  const HPC = 'gtceu:high_power_casing'
  const COIL = 'gtceu:superconducting_coil'

  FP.table = 'kubejs/data/grindless/tables/field_press.json'
  FP.site = 'grindless:sgr1806_orbit'

  // items in include the programmed circuit
  FP.machines = [
    {
      name: 'field_frozen_press', machine: 'gtceu:field_frozen_press', type: 'field_freezing', dataKey: 'grindless_field_freezing', lang: 'Field-Frozen Press',
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 }, width: 11, height: 15, depth: 11, casing: LAMINA, texture: LAMINA_TEXTURE,
      pal: { F: LAMINA, H: HPC, C: COIL, Q: 'tungsten_steel', P: 'gtceu:tungstensteel_pipe_casing', G: 'gtceu:laminated_glass' },
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 2 }), Pat.part('energy_input', { min: 1, max: 2 }), G.parallelHatch.part()]
      }
    }
  ]

  // line 3 (W-Re can, billet, spent can) and line 45 (AlN powder to the patterned AlGaN wafer)
  FP.items = ['field_canned_stack', 'field_frozen_billet', 'spent_field_can', 'aln_powder', 'aln_kerf', 'aln_boule', 'aln_wafer', 'algan_epi_wafer',
    'algan_patterned_wafer']

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
    FP.items.forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    FP.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    FP.machines.forEach(function (m) {
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
          Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.sgr1806_orbit'))
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
