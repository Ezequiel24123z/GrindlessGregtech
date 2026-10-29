// priority: -4450
// -----------------------------------------------------------------------------------------------
// LuV Mega Chemical Complex, gtceu:mega_chemical_complex (package MEGA-6, docs/eras/mega.md 4.8): the massive large chemical reactor,
// the coil chemical plant (MEGA-3) with the parallel hatch of the Assembly Hall (MEGA-7), in two modes the player picks in the
// controller's machine mode tab:
//   1. gtceu:large_chemical_reactor: every large chemical reactor and chemical reactor recipe of GTM, untouched.
//   2. gtceu:mega_chemical_complex (registered here): the composed lines of data/grindless/tables/mega_chemical_complex.json (PTFE, epoxy,
//      para-aramid), each a chain of live recipes in one step, made by server_scripts/grindless/luv/mega_chemical_complex.js.
//
// How it works (lib/mega.js unchanged, proven by MEGA-0/0c, MEGA-3 and MEGA-7; nothing new here):
// - Parallels: G.mega.chain({ parallel: 'coil', cap: null, hatch: true, discount: { rate: 0.95, floor: 0.80, baseK: 1800 }, oc: 'perfect',
//   batch: true }): ceiling coilParallel(K) x the formed parallel hatch's parallel (no hatch: x1), cut to what the energy hatches carry
//   (floor(max voltage / recipe EU/t)), then to what the inputs and output room allow (family rule 1: always energy-bound).
//   HSS-G coil 64 x LuV hatch 16 = 1024; Naquadah coil 256 x ZPM hatch 64 = 16384, each only while the energy hatches carry it.
// - Discount: GTM's EBF rate only (0.95 per coil step, never below 0.80), then GTM's perfect overclock and batch mode (rules 2, 3, 4).
// - Mode veto: the first modifier rejects a recipe that is not of the active mode (GTM 7.5.3 keeps the cached last recipe across a mode
//   switch; same fix as MEGA-1 and MEGA-7).
// - No generator, no energy from nothing, no new process recipe (the composed lines are sums of live recipes).
//
// Structure (15 wide x 15 high x 15 deep, lib/patterns.js): PTFE inert casing shell with HSS-S frames on the twelve edges; PTFE pipe
// casings in a central reaction column; four rings of 32 heating coils (any coil, the lowest one sets the tier) at heights 3, 6, 9 and
// 12 around it; a laminated glass band in the two side walls. The controller sits in the middle of the front wall, one row above the
// floor. Parts go in any casing cell: 1 maintenance, 1 or 2 energy hatches, 1 parallel hatch (optional), up to 2 input buses and 2
// output buses, up to 8 fluid input hatches and 6 fluid output hatches (the para-aramid line takes 7 fluids in).
//
// Textures: overlay dir grindless:block/multiblock/mega_chemical_complex (tools/assets/Build-MegaChemicalComplexTextures.ps1). Names /
// tooltips: client_scripts/grindless/luv_mega_chemical_complex_lang.js. Controller recipe and composed recipes:
// server_scripts/grindless/luv/mega_chemical_complex.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Coils = G.coils

  const ID = 'mega_chemical_complex'
  const COMPLEX_TYPE = 'mega_chemical_complex'
  // every recipeType() call appends one mode; the first one is the mode a new controller starts in
  const TYPES = ['large_chemical_reactor', COMPLEX_TYPE]
  const CASING = 'gtceu:inert_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_inert_ptfe'
  const PIPE = 'gtceu:ptfe_pipe_casing'
  const FRAME = 'gtceu:hsss_frame'
  const GLASS = 'gtceu:laminated_glass'
  const DISCOUNT = { rate: 0.95, floor: 0.80, baseK: 1800 }
  const HATCHES = { energy: [1, 2], inputBus: 2, outputBus: 2, inputHatch: 8, outputHatch: 6, parallelHatch: 1 }
  // the most the recipe type holds: the largest composed line (para-aramid: 7 fluids in, 3 out, 1 item out)
  const MAX_IO = { itemsIn: 3, itemsOut: 3, fluidsIn: 8, fluidsOut: 6 }
  const W = 15
  const H = 15
  const D = 15
  const CENTER = 7
  const RING_HEIGHTS = [3, 6, 9, 12]
  const RING_RADIUS = 4
  // 1 maintenance + 2 energy + 2 + 2 buses + 8 + 6 fluid hatches + 1 parallel hatch
  const PART_CELLS = 22

  function inRing(x, z) {
    return Math.max(Math.abs(x - CENTER), Math.abs(z - CENTER)) === RING_RADIUS
  }

  // slices back -> front, rows bottom -> top, one char per column
  function build() {
    var slices = []
    var casingCells = 0
    var coilCells = 0
    for (var z = 0; z < D; z++) {
      var rows = []
      for (var y = 0; y < H; y++) {
        var row = ''
        for (var x = 0; x < W; x++) {
          var ex = x === 0 || x === W - 1
          var ey = y === 0 || y === H - 1
          var ez = z === 0 || z === D - 1
          var edges = (ex ? 1 : 0) + (ey ? 1 : 0) + (ez ? 1 : 0)
          var ch = '#'
          if (z === D - 1 && x === CENTER && y === 1) ch = 'S'
          else if (edges >= 2) ch = 'F'
          else if (edges === 1) {
            if (ex && z >= 4 && z <= 10 && y >= 5 && y <= 9) ch = 'L'
            // girder bands of frames girdle the walls at the coil heights, so the shell reads as a tower of rings
            else if (ey === false && RING_HEIGHTS.indexOf(y) >= 0) ch = 'F'
            else ch = 'X'
          }
          else if (x === CENTER && z === CENTER) ch = 'P'
          else if (RING_HEIGHTS.indexOf(y) >= 0 && inRing(x, z)) ch = 'K'
          if (ch === 'X') casingCells++
          if (ch === 'K') coilCells++
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return { slices: slices, casingCells: casingCells, coilCells: coilCells }
  }
  const BUILT = build()

  // built when the machine registers: G.parallelHatch (lib/parallel_hatch.js) is not needed before that
  function makeSpec() {
    return {
      slices: BUILT.slices,
      symbols: {
        S: Pat.controller(),
        F: Pat.block(FRAME),
        L: Pat.block(GLASS),
        P: Pat.block(PIPE),
        K: Coils.predicate(),
        X: Pat.oneOf(
          Pat.block(CASING, { min: BUILT.casingCells - PART_CELLS }),
          Pat.part('maintenance', { exact: 1 }),
          Pat.part('energy_input', { min: HATCHES.energy[0], max: HATCHES.energy[1] }),
          Pat.part('input_bus', { max: HATCHES.inputBus }),
          Pat.part('output_bus', { max: HATCHES.outputBus }),
          Pat.part('input_hatch', { max: HATCHES.inputHatch }),
          Pat.part('output_hatch', { max: HATCHES.outputHatch }),
          G.parallelHatch.part()
        ),
        '#': Pat.air()
      }
    }
  }
  var SPEC = null

  // true = the recipe belongs to another mode than the active one
  function otherMode(machine, recipe) {
    return String(recipe.getType().registryName) !== String(machine.getRecipeType().registryName)
  }

  // published for the recipe script, the lang file, the node test and the bench test
  const MC = G.megaChemicalComplex || (G.megaChemicalComplex = {})
  MC.id = 'gtceu:' + ID
  MC.types = TYPES.map(function (t) { return 'gtceu:' + t })
  MC.type = 'gtceu:' + COMPLEX_TYPE
  MC.discount = DISCOUNT
  MC.casing = CASING
  MC.hatches = HATCHES
  MC.maxIO = MAX_IO
  MC.size = { width: W, height: H, depth: D }
  MC.coilCells = BUILT.coilCells
  MC.casingCells = BUILT.casingCells

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(COMPLEX_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(MAX_IO.itemsIn, MAX_IO.itemsOut, MAX_IO.fluidsIn, MAX_IO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SPEC = makeSpec()
    Pat.register('gtceu:' + ID, SPEC)

    var veto = function (machine, recipe) {
      return otherMode(machine, recipe) ? ModifierFunction.NULL : ModifierFunction.IDENTITY
    }
    var chain = [veto].concat(G.mega.chain({ parallel: 'coil', cap: null, hatch: true, discount: DISCOUNT, oc: 'perfect', batch: true }))

    var b = event.create(ID, 'multiblock')
      .langValue('Mega Chemical Complex')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return Coils.create(holder) })
    TYPES.forEach(function (t) { b = b.recipeType(t) })
    G.mega.install(b, chain)
      .appearanceBlock(GTBlocks.CASING_PTFE_INERT)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.mega_chemical_complex.tooltip.0'),
        Text.translate('grindless.machine.mega_chemical_complex.tooltip.1'),
        Text.translate('grindless.machine.mega_chemical_complex.tooltip.2'),
        Text.translate('grindless.machine.mega_chemical_complex.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + ID)
  })
})()
