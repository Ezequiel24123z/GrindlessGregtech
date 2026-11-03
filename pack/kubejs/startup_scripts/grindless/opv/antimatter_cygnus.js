// priority: -6625
(function () {
  var G = global.grindless
  var Pat = G.patterns
  var A = G.antimatterCygnus = {
    table: 'kubejs/data/grindless/tables/antimatter_cygnus.json',
    site: 'grindless:cygnus_x1_orbit'
  }
  var LAMINA = 'grindless:chain_lamina_casing'
  var LAMINA_TEXTURE = 'grindless:block/opv/chain_lamina_casing'
  // The Antiproton Complex runs both of the old machines' recipe types: gtceu:antiproton_production (the target hall) and
  // gtceu:beam_cooling (the AD and ELENA rings). Their sizes are the largest of either.
  A.types = [
    { type: 'jet_beam_extraction', io: [3, 1, 1, 1] },
    { type: 'antiproton_production', io: [3, 2, 1, 1] },
    { type: 'beam_cooling', io: [4, 1, 1, 1] }
  ]
  A.machines = [
    { name: 'jet_beam_line', types: ['jet_beam_extraction'], w: 7, h: 7, d: 45, io: [3, 1, 1, 1],
      casing: LAMINA, texture: LAMINA_TEXTURE,
      pal: { F: LAMINA, C: 'gtceu:superconducting_coil', K: 'grindless:srf_cryomodule_block', G: 'gtceu:fusion_glass', N: 'grindless:neg_xhv_casing' } },
    { name: 'antiproton_decelerator', types: ['antiproton_production', 'beam_cooling'], w: 29, h: 7, d: 29, io: [4, 2, 1, 1],
      casing: LAMINA, texture: LAMINA_TEXTURE,
      pal: { F: LAMINA, C: 'gtceu:superconducting_coil', N: 'grindless:neg_xhv_casing', K: 'grindless:srf_cryomodule_block',
        A: 'grindless:annihilation_shield_casing', G: 'gtceu:fusion_glass' } }
  ]

  A.spec = function (m) {
    var parts = [Pat.part('input_bus', { min: 1, max: 1 }),
      Pat.part('input_hatch', { min: m.io[2] ? 1 : 0, max: 1 }),
      Pat.part('output_hatch', { min: 1, max: 1 }),
      Pat.part('energy_input', { min: 1, max: 2 }), G.parallelHatch.part()]
    if (m.io[1]) parts.push(Pat.part('output_bus', { min: m.name === 'jet_beam_line' ? 0 : 1, max: 1 }))
    return G.opvShapes.build(Pat, m.name, m.pal, parts)
  }
  StartupEvents.registry('item', function (event) {
    event.create('grindless:spent_li6_shield').maxStackSize(16).texture('grindless:item/spent_li6_shield')
      .tooltip(Text.translate('tooltip.grindless.spent_li6_shield.0'))
  })
  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    ;[['hot_antiproton_beam', 0xFF80C8], ['stochastically_cooled_beam', 0x809CFF], ['decelerated_antiproton_beam', 0xB090FF]].forEach(function (s) {
      event.create('grindless:' + s[0]).gas().color(s[1]).formula('p(-)')
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    A.types.forEach(function (t) {
      event.create(t.type).category('multiblock').setEUIO('in')
        .setMaxIOSize(t.io[0], t.io[1], t.io[2], t.io[3])
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT).setSound(GTSoundEntries.MOTOR)
    })
  })
  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    A.machines.forEach(function (m) {
      var spec = A.spec(m)
      Pat.register('gtceu:' + m.name, spec)
      var multi = m.types.length > 1
      var tips = [
        Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ]
      if (multi) tips.push(Text.translate('gtceu.machine.available_recipe_map_2.tooltip',
        Text.translate('gtceu.' + m.types[0]), Text.translate('gtceu.' + m.types[1])))
      if (m.name === 'jet_beam_line') tips.push(Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.cygnus_x1_orbit')))
      var types = m.types.map(function (t) {
        var rt = GTRecipeTypes.get(t)
        if (rt == null) throw new Error('[grindless/opv] recipe type gtceu:' + t + ' is not registered')
        return rt
      })
      var builder = event.create(m.name, 'multiblock').rotationState(RotationState.NON_Y_AXIS)
      builder = multi ? builder.recipeTypes(types[0], types[1]) : builder.recipeType(m.types[0])
      builder
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, spec) })
        ['tooltips(net.minecraft.network.chat.Component[])'](tips)
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
