// priority: -2200
// -----------------------------------------------------------------------------------------------
// The Syngas and Shift Plant, an HV multiblock of the journey plan (docs/journey.md), the recipe type it runs and its catalyst.
//
//   gtceu:syngas_plant          9x3x7 plant: a coil-heated gasifier, two stacked shift reactors and a CO2 absorber column on one floor,
//                               runs the new gtceu:syngas
//   grindless:shift_catalyst    iron-chromium oxide (magnetite + chromium), the high-temperature shift catalyst. Goes in the input bus;
//                               used up by chance (0.05 % of the runs) in the recipes that shift
//
// What it wins: SEVERAL STEPS IN ONE and A REACTION NO SMALL MACHINE DOES. GTM has no steam gasification and no water-gas shift: its
// carbon monoxide only goes to methanol, acetic acid, a few syntheses or the electrolyzer, and coal only becomes CO by burning it with
// oxygen. The plant gasifies pulverized carbon (coal, coke, charcoal or carbon dust) or the Refinery's heavy fuel with steam (C + H2O ->
// CO + H2), shifts the CO with more steam over the catalyst (CO + H2O -> CO2 + H2) and separates the gases, each into its own hatch. It also
// takes the spare CO of the HV era (the silicon of the arc furnace and the EBF, wood gas, nether air) and turns it into hydrogen. Methane
// is not here: GTM's own chemical reactor already reforms it (carbon_dioxide_from_methane). The numbers, the hydrogen balance and the
// difference with the Catalytic Reformer are in server_scripts/grindless/hv/syngas_plant.js and docs/eras/hv.md.
//
// Machine class: GTM's plain electric multiblock (WorkableElectricMultiblockMachine), so its overclock is GTM's. Each output hatch holds one
// fluid: a recipe only starts when every gas it makes has room, so nothing is voided and nothing mixes.
//
// Geometry (slices back -> front, rows bottom -> top, columns left -> right as seen from the front; the controller is in the front slice,
// middle column, row 1):
//   row 0       floor, 9x3, the only place for parts (symbol X)
//   columns 0-2 GASIFIER: heat-proof shell around a hollow core, a ring of Kanthal coils in the middle, a cap with the gas outlet
//   columns 3-5 SHIFT: two clean stainless drums (rows 1-2 and row 4) on a pipe core, held apart by four stainless frames (row 3)
//   columns 6-8 ABSORBER: a clean stainless column six blocks tall with a tempered glass sight window on the front
//   row 5       the header: a steel pipe from the gasifier outlet over the shift drums into the absorber
//
// Textures: overlay dir grindless:block/multiblock/syngas_plant, base casing GTM's clean stainless steel casing; item/shift_catalyst.
// Names / tooltips: client_scripts/grindless/syngas_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const SYN = G.syngas || (G.syngas = {})

  const MACHINE = 'gtceu:syngas_plant'
  const TYPE = 'gtceu:syngas'
  const CATALYST = 'grindless:shift_catalyst'

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const HEATPROOF = 'gtceu:heatproof_machine_casing'
  const COIL = 'gtceu:kanthal_coil_block'
  const PIPE = 'gtceu:steel_pipe_casing'
  const GLASS = 'gtceu:tempered_glass'

  // published for the recipe script and the smoke test
  SYN.machine = MACHINE
  SYN.recipeType = TYPE
  SYN.catalyst = CATALYST
  SYN.catalystWear = 5
  SYN.maxIO = { itemsIn: 3, itemsOut: 1, fluidsIn: 2, fluidsOut: 3 }

  // ---------------------------------------------------------------- pattern

  const SPEC = {
    slices: [
      // back
      [
        'XXXXXXXXX',
        'HHHCCCCCC',
        'KKKCCCCCC',
        'HHHF FCCC',
        'HHHCCCCCC',
        '      CCC',
        '      CCC'
      ],
      // middle: the gasifier's hollow core and outlet, the pipe core of the shift drums and the absorber, the header on row 5
      [
        'XXXXXXXXX',
        'H#HCPCCPC',
        'K#KCPCCPC',
        'H#H P CPC',
        'HPHCPCCPC',
        ' PPPPPPPC',
        '      CCC'
      ],
      // front (controller under the shift drums, sight window on the absorber)
      [
        'XXXXXXXXX',
        'HHHCSCCCC',
        'KKKCCCCGC',
        'HHHF FCGC',
        'HHHCCCCGC',
        '      CCC',
        '      CCC'
      ]
    ],
    symbols: {
      S: Pat.controller(),
      // 27 floor cells: 6 to 9 are parts, the rest clean stainless casing
      X: Pat.oneOf(
        Pat.block(CLEAN, { min: 18 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { exact: 1 }),
        Pat.part('input_hatch', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 2, max: 3 })
      ),
      H: Pat.block(HEATPROOF),
      K: Pat.block(COIL),
      C: Pat.block(CLEAN),
      P: Pat.block(PIPE),
      F: Pat.frame(['stainless_steel']),
      G: Pat.block(GLASS),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- catalyst

  StartupEvents.registry('item', function (event) {
    event.create(CATALYST)
      .texture('grindless:item/shift_catalyst')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.shift_catalyst')))
  })

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // items in: the feed (pulverized carbon), the catalyst and the programmed circuit (the mode); item out: the ash.
    // Fluids in: steam and, by mode, carbon monoxide or heavy fuel. Fluids out: carbon monoxide, hydrogen, carbon dioxide
    event.create('syngas')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(SYN.maxIO.itemsIn, SYN.maxIO.itemsOut, SYN.maxIO.fluidsIn, SYN.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_CRACKING, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FIRE)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)

    event.create('syngas_plant', 'multiblock')
      .langValue('Syngas and Shift Plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('syngas')
      .appearanceBlock(GTBlocks.CASING_STAINLESS_CLEAN)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.syngas_plant.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.syngas')),
        Text.translate('grindless.machine.syngas_plant.tooltip.1')
      ])
      .workableCasingModel(CLEAN_TEXTURE, 'grindless:block/multiblock/syngas_plant')
  })
})()
