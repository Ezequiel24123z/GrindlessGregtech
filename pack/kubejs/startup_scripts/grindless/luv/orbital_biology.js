// priority: -12700
// LuV B4: crystal growth, molecular farming and scaffold-free neural culture.
(function () {
  var G = global.grindless
  var Pat = G.patterns
  var TRUSS = 'grindless:station_truss_casing'
  var B = G.orbitalBiology = {}
  var names = ['zero_g_crystal_grower', 'hydroponic_ring', 'organoid_lab']
  B.machines = names.map(function (n) { return 'gtceu:' + n })
  B.types = ['microgravity_crystal_growth', 'greenhouse', 'organoid_assembly']
  B.isRingRecipe = function (recipe) {
    return String(recipe.id.getNamespace()) === 'grindless' &&
      /^greenhouse\/luv\/(neurotrophic_factor|plant_collagen)$/.test(String(recipe.id.getPath()))
  }
  function parts(casing, maintenance) {
    var choices = [Pat.block(casing, { min: 4 }),
      Pat.part('energy_input', { min: 1, max: 2 }),
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 2 }),
      Pat.part('output_hatch', { min: maintenance ? 0 : 2, max: 2 }), G.parallelHatch.part()]
    if (maintenance) choices.push(Pat.part('maintenance', { exact: 1 }))
    return Pat.oneOf.apply(null, choices)
  }
  // A titanium cage (frames on the twelve edges) around the growth chamber: the inert-lined bore is the melt, glass windows look in
  // from every side, and every other shell cell takes the truss casing or a part.
  var grower = {
    slices: [
      ['FFFFF', 'FXXXF', 'FXGXF', 'FXXXF', 'FFFFF'],
      ['FXXXF', 'XIIIX', 'XI#IX', 'XIIIX', 'FXXXF'],
      ['FXXXF', 'XI#IX', 'G###G', 'XI#IX', 'FXXXF'],
      ['FXXXF', 'XIIIX', 'XI#IX', 'XIIIX', 'FXXXF'],
      ['FFFFF', 'FGGGF', 'FGSGF', 'FGGGF', 'FFFFF']
    ],
    symbols: { S: Pat.controller(), X: parts(TRUSS, true), F: Pat.frame(['titanium']),
      I: Pat.block('gtceu:inert_machine_casing'), G: Pat.block('gtceu:laminated_glass'), '#': Pat.air() }
  }
  // The annular bed uses squared-radius bounds: no floating-point geometry or Rhino Math.PI.
  // The docking controller sits on the near rim; four titanium spokes join the bearing hub.
  var ringSlices = []
  for (var z = 0; z < 15; z++) {
    var rows = ['', '', '']
    for (var x = 0; x < 15; x++) {
      var dx = x - 7
      var dz = z - 7
      var r2 = dx * dx + dz * dz
      var bed = r2 >= 20 && r2 <= 56
      var hub = Math.abs(dx) <= 1 && Math.abs(dz) <= 1
      var spoke = (dx === 0 || dz === 0) && r2 < 20
      rows[0] += hub ? 'X' : bed ? 'D' : spoke ? 'F' : ' '
      rows[1] += hub ? (Math.abs(dx) === 1 && Math.abs(dz) === 1 ? 'B' : 'X') :
        bed ? (r2 >= 40 || r2 <= 29 ? 'G' : '#') : spoke ? 'F' : ' '
      rows[2] += hub ? 'X' : bed ? 'G' : ' '
    }
    ringSlices.push(rows)
  }
  ringSlices[14][1] = ringSlices[14][1].substring(0, 7) + 'S' + ringSlices[14][1].substring(8)
  var ring = {
    slices: ringSlices,
    symbols: { S: Pat.controller(), X: parts(TRUSS, false), B: Pat.block('grindless:magnetic_bearing'),
      D: Pat.block('minecraft:dirt'), G: Pat.block('gtceu:tempered_glass'), F: Pat.frame(['titanium']), '#': Pat.air() }
  }
  var lab = {
    slices: [
      ['XXXXX', 'XXXXX', 'XXTXX', 'XXXXX', 'XXXXX'],
      ['PPPPP', 'PLLLP', 'CL#LC', 'PFLFP', 'PPPPP'],
      ['PPPPP', 'PL#LP', 'C###C', 'PL#LP', 'PPPPP'],
      ['PPPPP', 'PLLLP', 'CL#LC', 'PFLFP', 'PPPPP'],
      ['TTTTT', 'PCCCP', 'PCSCP', 'PCCCP', 'PPPPP']
    ],
    symbols: { S: Pat.controller(), X: parts(TRUSS, true), T: Pat.block(TRUSS),
      P: Pat.block('gtceu:plascrete'), C: Pat.block('gtceu:cleanroom_glass'),
      L: Pat.block('gtceu:laminated_glass'), F: Pat.block('gtceu:filter_casing'), '#': Pat.air() }
  }
  B.specs = [grower, ring, lab]
  function modifier(index) {
    var next = G.parallelHatch.modifier(G.parallelHatch.overclock)
    if (index === 1) {
      var parallel = next
      next = function (machine, recipe) {
        return B.isRingRecipe(recipe) ? parallel(machine, recipe) : ModifierFunction.NULL
      }
    }
    return index === 0 ? next : G.noVoiding.modifier(options(index), next)
  }
  function options(index) {
    return { which: 'both', name: names[index], reason: 'grindless.machine.' + names[index] + '.no_voiding' }
  }
  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(B.types[0]).category('multiblock').setEUIO('in').setMaxIOSize(3, 1, 1, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
    event.create(B.types[2]).category('multiblock').setEUIO('in').setMaxIOSize(7, 1, 1, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
  })
  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    // After LV's widening: molecular farming retains two distinct fluid outputs in EMI.
    GTRecipeTypes.get('greenhouse').setMaxIOSize(3, 6, 2, 2)
    names.forEach(function (name, i) {
      Pat.register(B.machines[i], B.specs[i])
      var builder = event.create(name, 'multiblock')
        .rotationState(RotationState.NON_Y_AXIS).recipeType(B.types[i])
        .recipeModifier(modifier(i), true)
        .appearanceBlock(function () { return Block.getBlock(TRUSS) })
        .pattern(function (def) { return Pat.build(def, B.specs[i]) })
        ['tooltips(net.minecraft.network.chat.Component[])'](({
          zero_g_crystal_grower: [
            Text.translate('grindless.machine.zero_g_crystal_grower.tooltip.0'),
            Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.microgravity_crystal_growth')),
            Text.translate('gtceu.multiblock.parallelizable.tooltip')
          ],
          hydroponic_ring: [
            Text.translate('grindless.machine.hydroponic_ring.tooltip.0'),
            Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.greenhouse')),
            Text.translate('gtceu.multiblock.parallelizable.tooltip')
          ],
          organoid_lab: [
            Text.translate('grindless.machine.organoid_lab.tooltip.0'),
            Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.organoid_assembly')),
            Text.translate('gtceu.multiblock.parallelizable.tooltip')
          ]
        })[name])
        .workableCasingModel('grindless:block/luv/station_truss_casing', 'grindless:block/multiblock/' + name)
      if (i !== 0) builder.beforeWorking(G.noVoiding.beforeWorking(options(i)))
    })
  })
})()
