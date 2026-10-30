// OpV-D2: a shielded neutron-growth vault and a Cygnus X-1 strangeness distiller.
(function () {
  var G = global.grindless
  var Pat = G.patterns
  var EM = G.exoticMatter || (G.exoticMatter = {})
  EM.table = 'kubejs/data/grindless/tables/exotic_matter.json'
  EM.site = 'grindless:cygnus_x1_orbit'
  EM.disposalId = 'grindless:strangelet_distillation/dispose_negative_strangelets'
  EM.items = ['lead_208_dust', 'pb208_ion_source', 'fed_strangelet', 'grown_strangelet', 'strangelet_tailings', 'negative_strangelet_residue']
  EM.machines = [
    { name: 'strangelet_vault', type: 'strangelet_growth', w: 9, h: 9, d: 9,
      casing: 'grindless:field_frozen_casing', texture: 'grindless:block/opv/field_frozen_casing',
      io: [5, 2, 1, 0], pal: { F: 'grindless:field_frozen_casing', A: 'grindless:annihilation_shield_casing',
        N: 'grindless:neg_xhv_casing', L: 'gtceu:fusion_glass', C: 'gtceu:superconducting_coil', W: 'minecraft:water' } },
    { name: 'strangelet_distiller', type: 'strangelet_distillation', w: 7, h: 7, d: 13,
      casing: 'grindless:field_frozen_casing', texture: 'grindless:block/opv/field_frozen_casing',
      io: [3, 2, 1, 0], pal: { F: 'grindless:field_frozen_casing', N: 'grindless:neg_xhv_casing',
        L: 'gtceu:fusion_glass', C: 'gtceu:superconducting_coil' } }
  ]

  function vaultCell(x, y, z) {
    var dx = Math.abs(x - 4)
    var dz = Math.abs(z - 4)
    var r = Math.max(dx, dz)
    if (r === 4 && (dx === 4 && dz === 4) && y > 0 && y < 8) return ' '
    if (y === 0) return r === 4 ? 'F' : 'A'
    if (y === 8) return r <= 2 ? 'L' : 'F'
    if (r === 4) {
      if (y === 1 && (x === 0 || x === 8 || z === 0 || z === 8)) return 'X'
      return y === 3 || y === 6 ? 'F' : 'A'
    }
    if (r === 3) return y === 7 ? 'L' : 'N'
    if (r === 1 && y >= 3 && y <= 6) return y % 2 === 0 ? 'C' : 'L'
    if (r === 0 && y >= 3) return '#'
    if (y === 1 || y === 2) return 'W'
    if (y === 3) return 'L'
    return '#'
  }

  function distillerCell(x, y, z) {
    var dx = Math.abs(x - 3)
    var dy = Math.abs(y - 3)
    if (dx + dy > 4) return ' '
    var edge = dx === 3 || dy === 3 || dx + dy === 4
    if (z === 0) return dx <= 1 && dy <= 1 ? 'L' : 'F'
    if (z === 12) return y === 1 ? 'X' : 'F'
    if (edge) {
      if (y === 0 && z >= 8) return 'X'
      return z % 3 === 1 ? 'C' : 'F'
    }
    if (z === 4 || z === 8) return dx <= 1 && dy <= 1 ? 'L' : 'N'
    if (z >= 9 && (dx === 2 || dy === 2)) return 'N'
    if (dx === 2 || dy === 2) return 'L'
    return '#'
  }

  StartupEvents.registry('item', function (event) {
    EM.items.forEach(function (name) {
      event.create('grindless:' + name).texture('grindless:item/' + name).maxStackSize(16)
        .tooltip(Text.translate('tooltip.grindless.' + name + '.0'))
    })
  })
  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create('grindless:fireball_distillate').liquid().color(0xDF8FBF).formula('uds(fireball)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
  })
  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    EM.machines.forEach(function (m) {
      event.create(m.type).category('multiblock').setEUIO('in')
        .setMaxIOSize(m.io[0], m.io[1], m.io[2], m.io[3])
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT).setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    EM.machines.forEach(function (m) {
      var parts = [Pat.part('input_bus', { min: 1, max: 1 }), Pat.part('output_bus', { min: 1, max: 1 }),
        Pat.part('input_hatch', { min: 1, max: 1 }), Pat.part('energy_input', { min: 1, max: 2 }), G.parallelHatch.part()]
      var spec = G.uivShapes.spec(Pat, { w: m.w, h: m.h, d: m.d, pal: m.pal, parts: parts,
        fn: m.name === 'strangelet_vault' ? vaultCell : distillerCell })
      Pat.register('gtceu:' + m.name, spec)
      var opts = { which: 'both', reason: 'grindless.machine.' + m.name + '.no_voiding', name: m.name }
      var guarded = G.noVoiding.modifier(opts, G.parallelHatch.modifier(G.parallelHatch.overclock))
      var before = G.noVoiding.beforeWorking(opts)
      function disposal(recipe) {
        return m.name === 'strangelet_distiller' && recipe !== null && recipe !== undefined &&
          String(recipe.id) === EM.disposalId
      }
      event.create(m.name, 'multiblock')
        .langValue(m.name === 'strangelet_vault' ? 'Strangelet Vault' : 'Strangelet Distiller')
        .rotationState(RotationState.NON_Y_AXIS).recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, spec) })
        .recipeModifier(function (machine, recipe) {
          return disposal(recipe) ? G.parallelHatch.overclock(machine, recipe) : guarded(machine, recipe)
        }, true)
        .beforeWorking(function (machine, recipe) { return disposal(recipe) || before(machine, recipe) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ].concat(m.name === 'strangelet_distiller' ? [
          Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.cygnus_x1_orbit')),
          Text.translate('grindless.machine.strangelet_distiller.tooltip.1')
        ] : []))
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
