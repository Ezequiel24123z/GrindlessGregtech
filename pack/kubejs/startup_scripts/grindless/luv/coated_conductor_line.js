// priority: -3900
// -----------------------------------------------------------------------------------------------
// One of LuV's multiblocks (docs/eras/luv.md, "2. Coated conductor line"; package LuV-A3): the coated conductor line and its recipe
// type.
//
//   gtceu:coated_conductor_line   a reel-to-reel line for second-generation superconducting tape (RABiTS), 21 long, 3 deep, 4 high, on a
//                                 bed of clean stainless steel casing. From left to right, seen from the front: the payoff reel
//                                 (titanium gearboxes round a stainless steel frame hub), the 4-high rolling stand (robust tungstensteel
//                                 housings, two tungstensteel gearbox rolls), the annealing furnace (HSS-G coil blocks, or better, round
//                                 the tape's path), the 3x3x3 deposition chamber of PTFE inert casing with a tempered glass laser window
//                                 on top (the controller is its front face), the oxygen anneal tube (titanium pipe casing), the silver
//                                 sputter cell (PTFE inert casing) and the take-up reel. The parts go in the bed's front and back rows.
//   gtceu:coated_conductor        its recipe type (EU in). The programmed circuit picks the step; the recipes come from
//                                 data/grindless/tables/coated_conductor_line.json (server_scripts/grindless/luv/coated_conductor_line.js):
//                                   circuit 1  substrate  19 nickel dust + 1 tungsten dust (Mars) -> 20 nickel-tungsten tape,
//                                                         7,680 EU/t x 400 t
//                                   circuit 2  tape       16 nickel-tungsten tape + 1 ITBTC dust + 1,000 mB oxygen + 36 mB molten silver
//                                                         (the cap layer) -> 16 ITBTC coated conductor, 30,720 EU/t x 300 t
//
// What it gains (rule 4): ITBTC as deposited tape, with no 6,000 K blast furnace and no liquid helium (GTM's ITBTC wire is cast metal: a
// 6,000 K EBF, then a 30,720 EU/t freezer step with liquid helium). A tape takes an eighth of a cast single wire's superconductor. The
// tape feeds the HTS magnet works (LuV-A4): HTS coils and the wireless network's SMES cells. The tape is its own item with no GTM
// material info (LuV-A1), so GTM makes no recycling for it: the eighth cannot be undone into ITBTC.
//
// Byproducts: none. Voidable (luv.md's policy). Machine class: GTM's plain electric multiblock (WorkableElectricMultiblockMachine) with
// GTM's default overclock (non-perfect), after a parallel hatch's copies (lib/parallel_hatch.js).
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right seen from the front; 21 wide, 4 high,
// 3 deep):
//   row 0           the bed: casing or parts in the front and back slices (X, 42 cells), casing in the middle slice
//   columns 0-2     the payoff reel: a 3x3 ring of titanium gearboxes round a stainless steel frame, in the middle slice (rows 1-3)
//   column 4        the rolling stand: robust casing housings in the front and back slices (rows 1-3), two tungstensteel gearbox rolls
//                   (rows 1-2) under a robust casing crossbar (row 3) in the middle slice
//   columns 6-8     the annealing furnace: coils in the front and back slices (rows 1-2) and over the tape's path (middle slice, row 2);
//                   the path itself (middle slice, row 1) is air
//   columns 10-12   the deposition chamber (rows 1-3): PTFE casing round one block of air, the laser window on top of it, the controller
//                   in the middle of its front face
//   columns 14-15   the oxygen anneal tube: titanium pipe casing (middle slice, row 1)
//   column 16       the silver sputter cell: PTFE casing (all three slices, rows 1-2)
//   columns 18-20   the take-up reel, as the payoff reel
// Parts (X): 1-2 energy hatches, 1-3 input buses, 1-2 input hatches (oxygen and silver), 1-2 output buses and at most one parallel
// hatch. ME buses and hatches, and the quadruple and nonuple hatches, have the same abilities, so they fit.
//
// Textures: overlay dir grindless:block/multiblock/coated_conductor_line (tools/assets/Build-LuVCryogenicsTextures.ps1) on GTM's clean
// stainless steel casing. Names / tooltips: client_scripts/grindless/luv_cryogenics_lang.js. Published for the recipe script and the
// smoke test: global.grindless.coatedConductorLine.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const CCL = G.coatedConductorLine || (G.coatedConductorLine = {})
  const LOG = '[grindless/luv] '

  const MACHINE = 'gtceu:coated_conductor_line'
  const TYPE = 'coated_conductor'
  const TABLE = 'kubejs/data/grindless/tables/coated_conductor_line.json'

  const BED = 'gtceu:clean_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const REEL = 'gtceu:titanium_gearbox'
  const HUB = 'stainless_steel'
  const HOUSING = 'gtceu:robust_machine_casing'
  const ROLL = 'gtceu:tungstensteel_gearbox'
  // HSS-G or better (luv.md asks for HSS-G; a better coil anneals as well)
  const COILS = ['gtceu:hssg_coil_block', 'gtceu:naquadah_coil_block', 'gtceu:trinium_coil_block', 'gtceu:tritanium_coil_block']
  const CHAMBER = 'gtceu:inert_machine_casing'
  const WINDOW = 'gtceu:tempered_glass'
  const TUBE = 'gtceu:titanium_pipe_casing'

  // the recipe data key: the EMI line gtceu.recipe.grindless_coated_conductor.<recipe name>
  const DATA_KEY = 'grindless_coated_conductor'

  // ---------------------------------------------------------------- published for the recipe script and the smoke test

  CCL.machine = MACHINE
  CCL.recipeType = 'gtceu:' + TYPE
  CCL.table = TABLE
  CCL.dataKey = DATA_KEY
  CCL.steps = { 1: 'substrate', 2: 'tape' }
  // items in: two solids and the programmed circuit; out: the tape. Fluids in: oxygen and silver
  CCL.maxIO = { itemsIn: 3, itemsOut: 1, fluidsIn: 2, fluidsOut: 0 }
  CCL.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 3 },
    input_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 }
  }
  CCL.blocks = { bed: BED, reel: REEL, hub: HUB, housing: HOUSING, roll: ROLL, coils: COILS, chamber: CHAMBER, window: WINDOW, tube: TUBE }

  // ---------------------------------------------------------------- pattern

  const SPEC = {
    slices: [
      // back: the bed's back row, the stand's back housing, the furnace's back wall, the chamber's back, the sputter cell
      ['XXXXXXXXXXXXXXXXXXXXX',
        '    R KKK PPP   P    ',
        '    R KKK PPP   P    ',
        '    R     PPP        '],
      // middle: the reels, the rolls, the tape's path through the furnace, the chamber's air and window, the anneal tube
      ['BBBBBBBBBBBBBBBBBBBBB',
        'GGG W ### PPP OOP GGG',
        'GFG W KKK P#P   P GFG',
        'GGG R     PVP     GGG'],
      // front: the controller in the middle of the chamber's front face
      ['XXXXXXXXXXXXXXXXXXXXX',
        '    R KKK PPP   P    ',
        '    R KKK PSP   P    ',
        '    R     PPP        ']
    ],
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(
        Pat.block(BED),
        Pat.part('energy_input', CCL.parts.energy_input),
        Pat.part('input_bus', CCL.parts.input_bus),
        Pat.part('input_hatch', CCL.parts.input_hatch),
        Pat.part('output_bus', CCL.parts.output_bus),
        G.parallelHatch.part()
      ),
      B: Pat.block(BED),
      G: Pat.block(REEL),
      F: Pat.frame([HUB]),
      R: Pat.block(HOUSING),
      W: Pat.block(ROLL),
      K: Pat.block(COILS),
      P: Pat.block(CHAMBER),
      V: Pat.block(WINDOW),
      O: Pat.block(TUBE),
      '#': Pat.air()
    }
  }
  CCL.spec = SPEC

  // the plants that take a parallel hatch (lib/parallel_hatch.js keeps the list for the smoke test and the dump)
  if (G.parallelHatch && Array.isArray(G.parallelHatch.machines) && G.parallelHatch.machines.indexOf(MACHINE) < 0) {
    G.parallelHatch.machines.push(MACHINE)
  }

  // One EMI line per recipe, read from its data: what the step does
  function stepInfo(data) {
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
      .setMaxIOSize(CCL.maxIO.itemsIn, CCL.maxIO.itemsOut, CCL.maxIO.fluidsIn, CCL.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var type = GTRecipeTypes.get(TYPE)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + TYPE + ' is not registered')
    type.addDataInfo(stepInfo)

    Pat.register(MACHINE, SPEC)

    event.create('coated_conductor_line', 'multiblock')
      .langValue('Coated Conductor Line')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      // a parallel hatch's copies, then GTM's default overclock (without a hatch, the overclock alone)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(GTBlocks.CASING_STAINLESS_CLEAN)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.coated_conductor_line.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.coated_conductor')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/coated_conductor_line')
  })
})()
