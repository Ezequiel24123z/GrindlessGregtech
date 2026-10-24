// -----------------------------------------------------------------------------------------------
// The Ore Plant, the MV era's flagship multiblock, and the recipe type it runs.
//
//   gtceu:ore_plant    7x3x4 hall with three bays (crusher, washer, furnace), runs the new gtceu:ore_processing
//
// What it wins: SEVERAL STEPS IN ONE, none skipped. GTM's ore chain is macerator -> ore washer -> thermal centrifuge -> macerator,
// with a different byproduct at every step. The plant does all four in one pass and hands over every byproduct: 1 raw ore + water ->
// 2 dust + the three byproducts of the chain with their chances + the rubble. It saves steps, buses and room; it does NOT save energy
// (each recipe costs exactly what the loose machines cost, see server_scripts/grindless/mv/ore_plant.js) and it asks for conditions
// (water or distilled water, a reagent for the chemical bath, somewhere for the rubble) instead of raw quantity.
//
// Parallel runs: `bores` of the LV multiblocks (global.grindless.lv.bores, startup_scripts/grindless/lv/multis.js) with a cap of 6. It runs as
// many ores at once as the energy hatches pay at 40 EU/t each, GTM's own limit (ParallelLogic.getParallelAmount: hatch voltage / EU per run):
// one MV hatch (128 V) pays 3, two of them count as a tier up (512 V) and reach the cap of 6.
//
// Which recipe wins when several fit the inputs (GTM's lookup returns the first it meets): the modifier makes the better one the only one.
//   circuit 2 + distilled water in a hatch   -> the distilled variant (washing is twice as fast, no reagent)
//   else the reagent of the ore in a hatch    -> the chemical bath variant (its extra byproduct)
//   else                                      -> the water variant
// Recipe ids are grindless:ore_processing/mv/<material>_<water|distilled|bath>; the reagent of every ore that has one is published in
// global.grindless.orePlant.reagents by the recipe script.
//
// Textures: overlay dir grindless:block/multiblock/ore_plant (drawn separately), base casing GTM's steel solid machine casing.
// Names / tooltips: client_scripts/grindless/mv_plant_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const OP = G.orePlant || (G.orePlant = {})

  const MACHINE = 'gtceu:ore_plant'
  const TYPE = 'gtceu:ore_processing'
  const MAX_PARALLELS = 6
  const EUT = 40

  const STEEL_CASING = 'gtceu:solid_machine_casing'
  const STEEL_CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  const HEAT_CASING = 'gtceu:heatproof_machine_casing'
  const GEARBOX = 'gtceu:steel_gearbox'
  const DISTILLED_WATER = 'gtceu:distilled_water'

  const DYES = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray',
    'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black']
  const GLASS = ['minecraft:glass', 'minecraft:tinted_glass', 'gtceu:tempered_glass'].concat(
    DYES.map(function (dye) { return 'minecraft:' + dye + '_stained_glass' }))

  // published for the recipe script and the smoke test
  OP.machine = MACHINE
  OP.recipeType = TYPE
  OP.maxParallels = MAX_PARALLELS
  OP.eut = EUT
  OP.reagents = OP.reagents || {}

  // ---------------------------------------------------------------- pattern
  // 7 wide (columns, left to right as seen from the front), 3 deep, 4 high. Slices are listed back -> front, rows bottom -> top.
  //   crusher bay (columns 0-1)  two steel gearbox casings on the floor of the hall
  //   washer bay  (columns 2-3)  glass windows in the front wall
  //   furnace bay (columns 4-6)  floor, roof and walls of heat-proof machine casing
  // 36 cells are `X`: steel casing or a part. Parts: 1 or 2 energy hatches, 1 input bus, 2 output buses, 2 input hatches (water and reagent,
  // or distilled water): 6 or 7 cells, so 29 to 30 of them are steel casing (the limit asks for 28).
  const PLANT_SPEC = {
    slices: [
      // back wall
      ['XXXXHHH', 'XXXXHHH', 'XXXXHHH', 'XXXXHHH'],
      // middle: floor, the hall itself (empty, gearboxes in the crusher bay) and roof
      ['XXXXHHH', 'BB#####', '#######', 'XXXXHHH'],
      // front wall (controller): windows over the washer bay
      ['XXXXHHH', 'XXXSHHH', 'XGGGHHH', 'XXXXHHH']
    ],
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(
        Pat.block(STEEL_CASING, { min: 28 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { exact: 2 }),
        Pat.part('input_hatch', { exact: 2 })
      ),
      H: Pat.block(HEAT_CASING),
      B: Pat.block(GEARBOX),
      G: Pat.block(GLASS),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- recipe rules (see the header)

  var LC = null
  function lazy() {
    if (LC === null) {
      LC = {
        IO: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO'),
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      }
    }
    return LC
  }

  function machineHasFluid(machine, fluidId) {
    var c = lazy()
    var handlers = machine.getCapabilitiesFlat(c.IO.IN, c.FluidCap)
    for (var i = 0; i < handlers.size(); i++) {
      var contents = handlers.get(i).getContents()
      for (var j = 0; j < contents.size(); j++) {
        var stack = contents.get(j)
        if (stack.getAmount() > 0 && String(c.Registries.FLUIDS.getKey(stack.getFluid())) === fluidId) return true
      }
    }
    return false
  }

  // highest programmed-circuit configuration found in the machine's item inputs (0 = no circuit)
  function machineCircuit(machine) {
    var c = lazy()
    var best = 0
    var handlers = machine.getCapabilitiesFlat(c.IO.IN, c.ItemCap)
    for (var i = 0; i < handlers.size(); i++) {
      var contents = handlers.get(i).getContents()
      for (var j = 0; j < contents.size(); j++) {
        var stack = contents.get(j)
        if (c.Circuit.isIntegratedCircuit(stack)) {
          var config = c.Circuit.getCircuitConfiguration(stack)
          if (config > best) best = config
        }
      }
    }
    return best
  }

  // ore_processing/mv/<material>_<variant>  ->  { material, variant } (null for any other recipe)
  function variantOf(recipe) {
    var m = /\/mv\/(.+)_(water|distilled|bath)$/.exec(String(recipe.id.getPath()))
    return m ? { material: m[1], variant: m[2] } : null
  }

  // true = this recipe waits because a better one fits the inputs
  function plantVeto(machine, recipe) {
    var v = variantOf(recipe)
    if (v === null || v.variant === 'distilled') return false
    if (machineCircuit(machine) === 2 && machineHasFluid(machine, DISTILLED_WATER)) return true
    if (v.variant === 'water') {
      var reagent = OP.reagents[v.material]
      return !!reagent && machineHasFluid(machine, reagent)
    }
    return false
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // inputs: raw ore + programmed circuit, one fluid (water, distilled water or the reagent of the chemical bath).
    // outputs: up to 9 items (dust, byproducts as a whole amount plus a chanced remainder, rubble; redstone, with an ore multiplier of 5, needs
    // all 9 and no other ore of GTM 7.5.3 more than 7). Nine fill the three rows of three slots the recipe viewers draw, so no more room is taken
    // than for 7; no fluid comes out.
    event.create('ore_processing')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(2, 9, 1, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_MACERATE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.MACERATOR)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    // read here, not at the top: the registry callbacks run after every startup script has been evaluated
    var lv = global.grindless.lv
    if (!lv || !lv.bores) throw new Error('[grindless/mv] the ore plant needs global.grindless.lv.bores (startup_scripts/grindless/lv/multis.js)')
    Pat.register(MACHINE, PLANT_SPEC)

    event.create('ore_plant', 'multiblock')
      .langValue('Ore Plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('ore_processing')
      .recipeModifier(lv.bores(plantVeto, MAX_PARALLELS), true)
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, PLANT_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.ore_plant.tooltip.0'),
        Text.translate('grindless.machine.ore_plant.tooltip.1'),
        Text.translate('grindless.machine.ore_plant.tooltip.2'),
        Text.translate('grindless.machine.ore_plant.tooltip.3')
      ])
      .workableCasingModel(STEEL_CASING_TEXTURE, 'grindless:block/multiblock/ore_plant')
  })
})()
