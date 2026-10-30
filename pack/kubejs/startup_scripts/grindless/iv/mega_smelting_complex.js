// priority: -2850
// -----------------------------------------------------------------------------------------------
// IV Smelting Complex, gtceu:smelting_complex (package MEGA-5, docs/eras/mega.md 4.7): a blast furnace and a vacuum freezer in one machine.
// Its own recipe type, gtceu:smelting_complex, holds one recipe per live electric blast furnace recipe that makes a hot ingot, composed
// at every server load with the vacuum freezer recipe that cools it (server_scripts/grindless/iv/mega_smelting_complex.js): dusts and gas
// in, ingot and byproducts out, the freezer's coolant in and its return gas out, the energy the sum of both stages.
//
// How it works (lib/mega.js unchanged, proven by MEGA-0/0c; nothing new here):
// - A coil machine (lib/coils.js, as MEGA-3): the coil sets the parallels and, through GTM's own EBF rule, which recipes run.
// - Modifiers, in this order: coil parallel (cap 64, ceiling 2^floor(K / 900), cut to what the energy hatches carry, family rule 1) ->
//   GTM's EBF overclock (GTRecipeModifiers.ebfOverclock: refuses a recipe whose ebf_temp is above the coil's temperature plus 100 K per
//   voltage tier above MV, gives GTM's EBF discount and its perfect overclock per 1800 K of excess; it is the EBF rule and the allowed
//   discount of family rule 2, so there is no G.mega discount) -> batch mode (rule 4). GTM 7.5.3 has no EBF_OVERCLOCK constant, so the
//   modifier is a function calling the static method (the pattern of the spike machines).
// - No parallel hatch, no new process recipe, no generator.
//
// Structure (9 wide x 9 high x 11 deep, lib/patterns.js): a coil chamber (three slices of heatproof invar casing, a ring of 16 heating coils
// in the first and third) at the front, a tungstensteel robust bulkhead as the bridge, and a cold chamber (six slices of frostproof
// aluminium casing, five of them hollow) behind it. The front wall is heatproof casing and holds the controller (row 4, middle) and every part:
// 1 maintenance, 1 muffler, 1 or 2 energy hatches, up to 2 input buses and 2 output buses, up to 4 fluid input and 4 fluid output hatches
// (the gases, the coolant in, its return gas out).
//
// Textures: overlay dir grindless:block/multiblock/smelting_complex (tools/assets/Build-MegaSmeltingComplexTextures.ps1). Names / tooltips:
// client_scripts/grindless/iv_mega_smelting_complex_lang.js. Controller recipe: server_scripts/grindless/iv/mega_smelting_complex.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Coils = G.coils

  const ID = 'smelting_complex'
  const TYPE = 'smelting_complex'
  const HEAT = 'gtceu:heatproof_machine_casing'
  const FROST = 'gtceu:frostproof_machine_casing'
  const ROBUST = 'gtceu:robust_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_heatproof'
  const MAX_PARALLELS = 64
  const HATCHES = { energy: [1, 2], inputBus: 2, outputBus: 2, inputHatch: 4, outputHatch: 4 }
  // the largest recipe of the live set (items in with the circuit and the mold: 3, item outputs: 2, fluids in 2, fluids out 2) with room to spare
  const MAX_IO = { itemsIn: 3, itemsOut: 4, fluidsIn: 2, fluidsOut: 2 }

  // slices back -> front, rows bottom -> top; 80 front-wall cells (casing or part), 241 frostproof, 96 heatproof, 32 robust, 32 coils,
  // 409 air, the controller
  const wall = (c) => c + c + c + c + c + c + c + c + c
  const side = (c) => c + '#######' + c
  const CAP = (c) => [wall(c), wall(c), wall(c), wall(c), wall(c), wall(c), wall(c), wall(c), wall(c)]
  const HOLLOW = (c) => [wall(c), side(c), side(c), side(c), side(c), side(c), side(c), side(c), wall(c)]
  const RING = [
    'HHHHHHHHH',
    'H#######H',
    'H#KKKKK#H',
    'H#K###K#H',
    'H#K###K#H',
    'H#K###K#H',
    'H#KKKKK#H',
    'H#######H',
    'HHHHHHHHH'
  ]
  const FRONT = [
    'XXXXXXXXX', 'XXXXXXXXX', 'XXXXXXXXX', 'XXXXXXXXX', 'XXXXSXXXX', 'XXXXXXXXX', 'XXXXXXXXX', 'XXXXXXXXX', 'XXXXXXXXX'
  ]
  const SPEC = {
    slices: [
      CAP('F'),
      HOLLOW('F'), HOLLOW('F'), HOLLOW('F'), HOLLOW('F'), HOLLOW('F'),
      HOLLOW('R'),
      RING, HOLLOW('H'), RING,
      FRONT
    ],
    symbols: {
      S: Pat.controller(),
      // 80 cells: at most 16 are parts (1 + 1 + 2 + 2 + 2 + 4 + 4), the rest heatproof casing
      X: Pat.oneOf(
        Pat.block(HEAT, { min: 64 }),
        Pat.part('maintenance', { exact: 1 }),
        Pat.part('muffler', { exact: 1 }),
        Pat.part('energy_input', { min: HATCHES.energy[0], max: HATCHES.energy[1] }),
        Pat.part('input_bus', { max: HATCHES.inputBus }),
        Pat.part('output_bus', { max: HATCHES.outputBus }),
        Pat.part('input_hatch', { max: HATCHES.inputHatch }),
        Pat.part('output_hatch', { max: HATCHES.outputHatch })
      ),
      H: Pat.block(HEAT),
      F: Pat.block(FROST),
      R: Pat.block(ROBUST),
      K: Coils.predicate(),
      '#': Pat.air()
    }
  }

  // published for the recipe script, the lang file, the node test and the bench test
  const SC = G.megaSmeltingComplex || (G.megaSmeltingComplex = {})
  SC.id = 'gtceu:' + ID
  SC.type = 'gtceu:' + TYPE
  SC.parallels = MAX_PARALLELS
  SC.casings = { heat: HEAT, frost: FROST, robust: ROBUST }
  SC.hatches = HATCHES
  SC.maxIO = MAX_IO

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(MAX_IO.itemsIn, MAX_IO.itemsOut, MAX_IO.fluidsIn, MAX_IO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register('gtceu:' + ID, SPEC)

    // GTM's EBF rule is a static method (no constant for it in GTM 7.5.3)
    var ebf = function (machine, recipe) { return GTRecipeModifiers.ebfOverclock(machine, recipe) }
    var list = G.mega.chain({ parallel: 'coil', cap: MAX_PARALLELS, oc: 'none', batch: false }).concat([ebf, GTRecipeModifiers.BATCH_MODE])

    var b = event.create(ID, 'multiblock')
      .langValue('Smelting Complex')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return Coils.create(holder) })
      .recipeType(TYPE)
    G.mega.install(b, list)
      .appearanceBlock(GTBlocks.CASING_INVAR_HEATPROOF)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.smelting_complex.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.smelting_complex'))
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + ID)
  })
})()
