// priority: -12500
// -----------------------------------------------------------------------------------------------
// LuV B8, Europa (docs/eras/luv.md, machines 17 and 18): the only way to Europa's ocean, and the pack's only living matter.
// Every pattern goes through global.grindless.patterns (lib/patterns.js); Europa's dimension id comes from tables/places.json.
//
//   gtceu:cryobot            VEIN DRILL FAMILY, step 7b. Runs gtceu:vein_drilling, but only its own recipes,
//                            vein_drilling/luv/cryobot_* (the family's tier folders keep every lower drill off them, and each LuV drill
//                            runs only its own prefix, as IV's two drills do). A 5x5 base of sulfur concrete around a radiation-vault
//                            core on the ice, a 3x3x10 tungsten steel derrick (the hoist) under a vault head with the tether drum,
//                            and, in the pattern, a 1x1x5 shaft of packed or blue ice under the base (spike S0-7: the ice is the
//                            world's). The sample and the brine are kept: it refuses voiding (lib/no_voiding.js, in the modifier and
//                            in beforeWorking). GTM's overclock, no parallel.
//   gtceu:algae_bioreactor   GREENHOUSE FAMILY, step 5. Type gtceu:bioreactor: three 1x1x10 laminated-glass photobioreactor tubes with GT
//                            lamps between them, on a 5x5x3 sealed sulfur-concrete base with a vault roof. Algae anywhere; the
//                            Europan culture (gtceu:bacteria) only on Europa. Refuses voiding: the bacteria are the only living matter.
//
//   gtceu:magnesium_sulfate  dust, MgSO4 (Mg 1, S 1, O 4): the Europan brine's centrifuge gives it, and GTM's own decomposition electrolysis
//                            (6 dust -> magnesium + sulfur + 4,000 mB oxygen) takes it apart.
//
// The vein drilling type is widened (never narrowed) to 3 item inputs (the melt head, the RTG pellet and the circuit) and 2 fluid outputs
// (the brine and the meltwater). Published for the server script, the lang file and the tests: global.grindless.europa.
// Textures: overlay dirs grindless:block/multiblock/<machine> (tools/assets/Build-EuropaTextures.ps1) on A1's sulfur concrete casing.
(function () {
  var G = global.grindless
  var Pat = G.patterns
  var E = G.europa = {}
  var LOG = '[grindless/europa] '

  var CONCRETE = 'grindless:sulfur_concrete_casing'
  var VAULT = 'grindless:radiation_vault_casing'
  var CASING_TEXTURE = 'grindless:block/luv/sulfur_concrete_casing'
  var ICE = ['minecraft:packed_ice', 'minecraft:blue_ice']
  var COLORS = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown',
    'green', 'red', 'black']
  var LAMPS = COLORS.map(function (c) { return 'gtceu:' + c + '_lamp' }).concat(COLORS.map(function (c) { return 'gtceu:' + c + '_borderless_lamp' }))

  E.place = 'europa'
  E.cryobot = 'gtceu:cryobot'
  E.bioreactor = 'gtceu:algae_bioreactor'
  E.machines = [E.cryobot, E.bioreactor]
  E.bioreactorType = 'bioreactor'
  E.prefix = 'vein_drilling/luv/cryobot_'
  E.material = 'magnesium_sulfate'
  E.drillIO = { itemsIn: 3, itemsOut: 10, fluidsIn: 1, fluidsOut: 2 }
  E.bioreactorIO = { itemsIn: 3, itemsOut: 0, fluidsIn: 3, fluidsOut: 2 }
  E.ice = ICE
  E.lamps = LAMPS

  // the cryobot's own recipes: vein_drilling/luv/cryobot_<name>
  E.isCryobotRecipe = function (recipe) {
    return String(recipe.id.getPath()).indexOf(E.prefix) === 0
  }

  function parts(casing, min, limits) {
    var choices = [Pat.block(casing, { min: min })]
    Object.keys(limits).forEach(function (name) { choices.push(Pat.part(name, limits[name])) })
    return Pat.oneOf.apply(null, choices)
  }

  // ---------------------------------------------------------------- the cryobot: 5 wide, 5 deep, 16 high
  // rows bottom -> top: 0-4 the ice shaft, 5 the base, 6-14 the derrick, 15 the hoist head
  E.cryobotParts = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 2 } }
  function cryobotSlice(z) {
    var rows = []
    for (var y = 0; y < 16; y++) {
      if (y < 5) rows.push(z === 2 ? '  I  ' : '     ')
      else if (y === 5) rows.push(z === 0 ? 'XXXXX' : z === 4 ? 'XXSXX' : z === 2 ? 'XV#VX' : 'XVVVX')
      else if (y < 15) rows.push(z === 0 || z === 4 ? '     ' : z === 2 ? ' F#F ' : ' FFF ')
      else rows.push(z === 0 || z === 4 ? '     ' : z === 2 ? ' VDV ' : ' VVV ')
    }
    return rows
  }
  E.cryobotSpec = {
    slices: [0, 1, 2, 3, 4].map(cryobotSlice),
    symbols: { S: Pat.controller(), X: parts(CONCRETE, 6, E.cryobotParts), V: Pat.block(VAULT), F: Pat.frame(['tungsten_steel']),
      D: Pat.block('gtceu:tungstensteel_gearbox'), I: Pat.block(ICE), '#': Pat.air() }
  }

  // ---------------------------------------------------------------- the algae bioreactor: 5 wide, 5 deep, 13 high
  // rows bottom -> top: 0 floor, 1 the sealed hall, 2 the vault roof, 3-12 the tubes (T) and lamps (L) on the middle slice
  E.bioreactorParts = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, input_hatch: { min: 1, max: 3 },
    output_hatch: { min: 1, max: 2 } }
  function bioreactorSlice(z) {
    var rows = ['XXXXX', z === 0 ? 'XXXXX' : z === 4 ? 'XXSXX' : 'X###X', 'VVVVV']
    for (var y = 3; y < 13; y++) rows.push(z === 2 ? (y === 3 ? 'PPPPP' : y === 12 ? 'FPPPF' : 'TLTLT') : '     ')
    return rows
  }
  E.bioreactorSpec = {
    slices: [0, 1, 2, 3, 4].map(bioreactorSlice),
    symbols: { S: Pat.controller(), X: parts(CONCRETE, 8, E.bioreactorParts), V: Pat.block(VAULT), T: Pat.block('gtceu:laminated_glass'),
      L: Pat.block(LAMPS), P: Pat.block('gtceu:titanium_pipe_casing'), F: Pat.frame(['tungsten_steel']), '#': Pat.air() }
  }

  E.noVoiding = {
    cryobot: { which: 'both', name: 'cryobot', reason: 'grindless.machine.cryobot.no_voiding' },
    algae_bioreactor: { which: 'both', name: 'algae_bioreactor', reason: 'grindless.machine.algae_bioreactor.no_voiding' }
  }

  // ---------------------------------------------------------------- the brine's magnesium sulfate

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create(E.material)
      .dust()
      .color(0xE6EEF0).secondaryColor(0xA8BCC4)
      .iconSet(GTMaterialIconSet.FINE)
      .components('1x magnesium', '1x sulfur', '4x oxygen')
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var io = E.bioreactorIO
    event.create(E.bioreactorType).category('multiblock').setEUIO('in')
      .setMaxIOSize(io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_BATH, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.BATH)
  })

  // widens a type to at least these sizes: another package may have widened it further
  function widenAtLeast(name, io) {
    var type = GTRecipeTypes.get(name)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + name + ' is not registered')
    var sizes = [io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut]
    try {
      var ItemCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
      var FluidCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
      var now = [type.getMaxInputs(ItemCap), type.getMaxOutputs(ItemCap), type.getMaxInputs(FluidCap), type.getMaxOutputs(FluidCap)]
      sizes = sizes.map(function (n, i) { return Math.max(n, Number(now[i]) || 0) })
    } catch (e) {
      console.warn(LOG + 'could not read gtceu:' + name + '\'s sizes, setting ' + sizes.join('/') + ': ' + e)
    }
    type.setMaxIOSize(sizes[0], sizes[1], sizes[2], sizes[3])
  }

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    widenAtLeast('vein_drilling', E.drillIO)
    var rules = G.lv.rules
    var failed = false

    // only its own recipes, then GTM's overclock
    function cryobotRecipes(machine, recipe) {
      try {
        if (rules.recipeTier(recipe) !== 'luv' || !E.isCryobotRecipe(recipe)) return ModifierFunction.NULL
        return GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, recipe)
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'cryobot recipe modifier failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }
    function overclock(machine, recipe) {
      return GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, recipe)
    }

    var machines = [
      { name: 'cryobot', type: 'vein_drilling', spec: E.cryobotSpec, next: cryobotRecipes, tooltips: [
        Text.translate('grindless.machine.cryobot.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.vein_drilling')),
        Text.translate('grindless.tooltip.site', Text.translate('planet.grindless.europa'))
      ] },
      { name: 'algae_bioreactor', type: E.bioreactorType, spec: E.bioreactorSpec, next: overclock, tooltips: [
        Text.translate('grindless.machine.algae_bioreactor.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.bioreactor'))
      ] }
    ]
    machines.forEach(function (m) {
      var opts = E.noVoiding[m.name]
      Pat.register('gtceu:' + m.name, m.spec)
      var tips = m.tooltips
      event.create(m.name, 'multiblock')
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.noVoiding.modifier(opts, m.next), true)
        .beforeWorking(G.noVoiding.beforeWorking(opts))
        .appearanceBlock(function () { return Block.getBlock(CONCRETE) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        .allowExtendedFacing(false)
        ['tooltips(net.minecraft.network.chat.Component[])'](tips)
        .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
