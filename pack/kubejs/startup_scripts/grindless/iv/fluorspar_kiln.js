// -----------------------------------------------------------------------------------------------
// One of IV's multiblocks (docs/eras/iv.md, "Fluorspar kiln"; package IV-A6): the fluorspar kiln and its recipe type.
//
//   gtceu:fluorspar_kiln        a 3x3x13 rotary kiln of heatproof machine casing on three roller stands (steel frames), turned by a
//                               gearbox beside it, with a 3x3x6 HF scrubber and condenser of inert machine casing (PTFE packing inside)
//                               at its hot end. The feed (fluorspar, sulfuric acid and the quench water) goes in at the cold end, where
//                               the controller is; the anhydrite is quenched into gypsum and drops out under the hot end, and the HF
//                               leaves the scrubber.
//   gtceu:fluorspar_digestion   its recipe type (EU in). One recipe, one charge (server_scripts/grindless/iv/fluorspar_kiln.js):
//                               3 fluorite dust (gcyr:fluorite, CaF2) + 1,000 mB sulfuric acid + 2,000 mB water -> 2,000 mB hydrofluoric
//                               acid + 8 gypsum dust (CaSO4.2H2O), at GTM's own acid attack on a calcium mineral
//                               (phosphoric_acid_from_apatite: 30 EU/t, 64 ticks, 2,000 mB water and 8 gypsum dust per 1,000 mB of
//                               acid, 1,920 EU). The unreacted fluorite goes back to the feed inside the kiln, so a charge gives the
//                               full 2,000 mB.
//
// What it gains (rule 4): the pack's only fluorine route that is not silicate electrolysis (decision 10, the fluorine budget). GCYR's
// fluorite has no decomposition (IV-A1), so the kiln is the only way from fluorite to fluorine: about 61 fluorite give the 40,500 mB of
// fluorine the naquadah plant uses per 2 naquadah, against about 385 mica dust by electrolysis.
//
// Charges: the kiln runs many charges at once, each paying GTM's EU/t: up to MAX_CHARGES (256) copies of the recipe, as many as the
// inputs, the room for the outputs and the energy hatches allow (GTM's ParallelLogic: hatch voltage / 30 EU/t), and NO overclock, so a
// charge always costs 1,920 EU and takes 64 ticks. One IV energy hatch runs 256 charges at 7,680 EU/t: IV voltage at full feed. It is
// the parallel of our drills' `bores` (the EV tripod's) without the overclock step; the fluorite supply is the real limit.
//
// Containment: the scrubber keeps the HF. The recipe modifier cancels a run with grindless.machine.fluorspar_kiln.no_voiding while the
// controller voids fluids (the hot cell's mechanism). Voiding items stays allowed: gypsum is inert (rule 3).
//
// Machine class: GTM's plain electric multiblock (WorkableElectricMultiblockMachine) with the charge modifier above.
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right seen from the front):
//   slices 0-2    the scrubber, 3 wide x 6 high: inert casing (I) with a column of PTFE pipe packing (P) in the middle slice; its ports
//                 (Y) are the two lower rows of the back wall and the bottom row of the front wall, under the kiln's hot end
//   slices 3-14   the kiln body: a ring of heatproof casing (K) round an air bore (#) on rows 1-3; roller stands of steel frames (T) under
//                 slices 5, 9 and 13; the drive gearbox (G) beside slice 11 on its own frame
//   slice 15      the feed head: the controller (S) in the middle of the kiln's end, 8 heatproof casing cells (F) round it
// The 8 `F` cells take 1-2 energy hatches, 1-2 input buses and 1-4 input hatches (the acid and the water; at full feed one IV hatch of
// acid and two of water), and at least 2 stay casing; the 9 `Y` cells take 1-2 output buses and 1-2 output hatches (at least 5 stay
// casing). ME buses and hatches have the same abilities, so they fit.
//
// Textures: overlay dir grindless:block/multiblock/fluorspar_kiln (tools/assets/Build-FluorsparKilnTextures.ps1) on GTM's heatproof
// casing. Names / tooltips: client_scripts/grindless/iv_fluorspar_kiln_lang.js. Published for the recipe script and the smoke test:
// global.grindless.fluorsparKiln.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const FK = G.fluorsparKiln || (G.fluorsparKiln = {})
  const LOG = '[grindless/iv] '

  const MACHINE = 'gtceu:fluorspar_kiln'
  const TYPE = 'fluorspar_digestion'
  const MAX_CHARGES = 256

  const SHELL = 'gtceu:heatproof_machine_casing'
  const SHELL_TEXTURE = 'gtceu:block/casings/solid/machine_casing_heatproof'
  const SCRUBBER = 'gtceu:inert_machine_casing'
  const PACKING = 'gtceu:ptfe_pipe_casing'
  const DRIVE = 'gtceu:steel_gearbox'
  const STAND = 'steel'

  const NO_VOIDING = 'grindless.machine.fluorspar_kiln.no_voiding'
  // the recipe data key: the EMI line gtceu.recipe.grindless_fluorspar_kiln.<recipe name>
  const DATA_KEY = 'grindless_fluorspar_kiln'

  // ---------------------------------------------------------------- published for the recipe script and the smoke test

  FK.machine = MACHINE
  FK.recipeType = 'gtceu:' + TYPE
  FK.maxCharges = MAX_CHARGES
  // one charge: fluorite in; acid and water in; HF out; gypsum out
  FK.maxIO = { itemsIn: 1, itemsOut: 1, fluidsIn: 2, fluidsOut: 1 }
  FK.feedParts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 4 }
  }
  FK.scrubberParts = {
    output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 2 }
  }
  FK.minFeedCasing = 2
  FK.minScrubberCasing = 5
  FK.noVoiding = NO_VOIDING
  FK.dataKey = DATA_KEY
  FK.blocks = { shell: SHELL, scrubber: SCRUBBER, packing: PACKING, drive: DRIVE, stand: STAND }

  // ---------------------------------------------------------------- pattern

  // the kiln body: a ring of shell round the bore; `stand` puts a roller stand under it, `drive` the gearbox and its frame beside it
  function kilnSlice(stand, drive) {
    return [
      (stand ? 'TTT' : '   ') + (drive ? 'T' : ' '),
      'KKK' + (drive ? 'G' : ' '),
      'K#K ',
      'KKK ',
      '    ',
      '    '
    ]
  }

  const SLICES = [
    // the scrubber's back wall: its lower rows are the HF ports
    ['YYY ', 'YYY ', 'III ', 'III ', 'III ', 'III '],
    // the scrubber's middle: the PTFE packing between the sump and the top
    ['III ', 'IPI ', 'IPI ', 'IPI ', 'IPI ', 'III '],
    // the scrubber's front wall: the kiln's hot end opens into it, and the discharge under it
    ['YYY ', 'III ', 'III ', 'III ', 'III ', 'III ']
  ]
  for (var s = 3; s <= 14; s++) SLICES.push(kilnSlice(s === 5 || s === 9 || s === 13, s === 11))
  // the feed head: the controller in the middle of the kiln's cold end
  SLICES.push(['    ', 'FFF ', 'FSF ', 'FFF ', '    ', '    '])

  const SPEC = {
    slices: SLICES,
    symbols: {
      S: Pat.controller(),
      F: Pat.oneOf(
        Pat.block(SHELL, { min: FK.minFeedCasing }),
        Pat.part('energy_input', FK.feedParts.energy_input),
        Pat.part('input_bus', FK.feedParts.input_bus),
        Pat.part('input_hatch', FK.feedParts.input_hatch)
      ),
      Y: Pat.oneOf(
        Pat.block(SCRUBBER, { min: FK.minScrubberCasing }),
        Pat.part('output_bus', FK.scrubberParts.output_bus),
        Pat.part('output_hatch', FK.scrubberParts.output_hatch)
      ),
      K: Pat.block(SHELL),
      I: Pat.block(SCRUBBER),
      P: Pat.block(PACKING),
      G: Pat.block(DRIVE),
      T: Pat.frame([STAND]),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- charges and containment

  var LC = null
  function lazy() {
    if (LC === null) {
      LC = {
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        ContentModifier: Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.ContentModifier'),
        ParallelLogic: Java.loadClass('com.gregtechceu.gtceu.api.recipe.modifier.ParallelLogic')
      }
    }
    return LC
  }

  // true while the controller is set to void fluids (GTM's IVoidable): the HF would be thrown away
  function voidsFluids(machine) {
    return machine.canVoidRecipeOutputs(lazy().FluidCap) === true
  }
  FK.voidsFluids = voidsFluids

  var noVoiding = null

  // before every run (alwaysTryModifyRecipe): fluid voiding refused, then as many charges as the inputs, the room and the energy hatches
  // allow (GTM's ParallelLogic), each at the recipe's own EU/t and duration: no overclock
  function kilnModifier() {
    var failed = false
    return function (machine, recipe) {
      try {
        if (voidsFluids(machine)) {
          if (noVoiding === null) noVoiding = ModifierFunction.cancel(Text.translate(NO_VOIDING))
          return noVoiding
        }
        var c = lazy()
        var charges = c.ParallelLogic.getParallelAmount(machine, recipe, MAX_CHARGES)
        if (charges < 1) return ModifierFunction.NULL
        if (charges === 1) return ModifierFunction.IDENTITY
        return ModifierFunction.builder()
          .modifyAllContents(c.ContentModifier.multiplier(charges))
          .eutMultiplier(charges)
          .parallels(charges)
          .build()
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'fluorspar kiln recipe modifier failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }
  }

  // the EMI line of a recipe, read from its data
  function chargeInfo(data) {
    try {
      var name = String(data.getString(DATA_KEY))
      if (name === '') return ''
      return String(Text.translate('gtceu.recipe.' + DATA_KEY + '.' + name).getString())
    } catch (e) {
      return ''
    }
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(FK.maxIO.itemsIn, FK.maxIO.itemsOut, FK.maxIO.fluidsIn, FK.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_MIXER, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var type = GTRecipeTypes.get(TYPE)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + TYPE + ' is not registered')
    type.addDataInfo(chargeInfo)

    Pat.register(MACHINE, SPEC)

    event.create('fluorspar_kiln', 'multiblock')
      .langValue('Fluorspar Kiln')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      .recipeModifier(kilnModifier(), true)
      .appearanceBlock(function () { return Block.getBlock(SHELL) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.fluorspar_kiln.tooltip.0'),
        Text.translate('grindless.machine.fluorspar_kiln.tooltip.1'),
        Text.translate('grindless.machine.fluorspar_kiln.tooltip.2'),
        Text.translate('grindless.machine.fluorspar_kiln.tooltip.3')
      ])
      .workableCasingModel(SHELL_TEXTURE, 'grindless:block/multiblock/fluorspar_kiln')
  })
})()
