// priority: -11200
// -----------------------------------------------------------------------------------------------
// Two of ZPM's multiblocks (docs/eras/zpm.md, "Machines 7-8"; package ZPM-A7): the plasma quench caster and the direct energy converter.
//
//   gtceu:plasma_quench_caster      type gtceu:plasma_quench     5 x 5 x 7 of tungstensteel casing: a water-cooled mold (steel pipe
//                                   casing) in the middle of the pour, a steam drum (titanium pipe casing) in the roof. The Mk2's molten
//                                   duranium, tritanium and darmstadtium are cast into plate (circuit 1) or foil (circuit 2) in one step
//                                   under an argon shroud, and the run's heat leaves as steam. The argon comes back from the output hatch
//                                   (5 % make-up); the steam goes to a turbine. GTM's electric multiblock with a parallel hatch's copies.
//   gtceu:direct_energy_converter   type gtceu:direct_conversion 9 x 5 x 5 of cryostat casing with three grids of tungstensteel frame
//                                   posts across the beam path. A GENERATOR (lib/generators.js): helium plasma (our D + He-3) and tin
//                                   plasma (GTM's Ag + He-3) run at 1.25 x the plasma turbine's EU per mB, returning the cooled gas or
//                                   molten tin. Its EU figures are final (the type is not in power/generators.js's doubling list).
//
// Controllers sit in the middle of the front slice, one row up. Row 0 (the floor) takes the parts and at least `minCasings` casings.
// Textures: overlay dirs grindless:block/multiblock/plasma_quench_caster and .../direct_energy_converter
// (tools/assets/Build-ZPMFusionTextures.ps1). Names / tooltips: client_scripts/grindless/zpm_fusion_lang.js. Recipes: server_scripts/
// grindless/zpm/fusion.js. Published for the recipe script and the tests: global.grindless.zpmFusion.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Gen = G.generators
  const F = G.zpmFusion || (G.zpmFusion = {})
  const LOG = '[grindless/zpm] '

  const CASTER = 'gtceu:plasma_quench_caster'
  const CONVERTER = 'gtceu:direct_energy_converter'
  const CASTER_TYPE = 'plasma_quench'
  const CONVERTER_TYPE = 'direct_conversion'

  const TUNGSTENSTEEL = 'gtceu:robust_machine_casing'
  const TUNGSTENSTEEL_TEXTURE = 'gtceu:block/casings/solid/machine_casing_robust_tungstensteel'
  const CRYO = 'grindless:cryostat_casing'
  const CRYO_TEXTURE = 'grindless:block/zpm/cryostat_casing'
  const MOLD = 'gtceu:steel_pipe_casing'
  const DRUM = 'gtceu:titanium_pipe_casing'
  const FRAME = 'tungsten_steel'
  const GLASS = 'gtceu:laminated_glass'
  const COIL = 'gtceu:naquadah_coil_block'

  // 128 runs of 2,560 EU/t = 327,680 EU/t: two ZPM dynamo hatches (131,072 V x 2 A each)
  const CONVERTER_MAX_PARALLELS = 128
  const NO_VOIDING = 'grindless.steam_outputs.no_voiding'

  F.casterMachine = CASTER
  F.casterType = 'gtceu:' + CASTER_TYPE
  F.converterMachine = CONVERTER
  F.converterType = 'gtceu:' + CONVERTER_TYPE
  F.maxParallels = CONVERTER_MAX_PARALLELS
  // items in: the programmed circuit; out: plate or foils. Fluids in: metal and argon; out: argon and steam
  F.casterIO = { itemsIn: 1, itemsOut: 1, fluidsIn: 2, fluidsOut: 2 }
  // fluids in: the plasma; out: the cooled gas or molten tin
  F.converterIO = { itemsIn: 0, itemsOut: 0, fluidsIn: 1, fluidsOut: 1 }
  F.casterParts = { energy_input: { min: 1, max: 2 }, input_hatch: { min: 1, max: 3 }, output_hatch: { min: 1, max: 3 }, output_bus: { min: 1, max: 2 } }
  F.converterParts = { energy_output: { min: 1, max: 4 }, input_hatch: { min: 1, max: 2 }, output_hatch: { min: 1, max: 2 } }

  // ---------------------------------------------------------------- patterns (slices back -> front, rows bottom -> top)

  // QR-S2: both are built cell by cell. Frame posts (T), laminated glass sight windows (G), a casing shell, plus what each does:
  // the caster has a steel-pipe mold column and a titanium steam drum in its lid; the converter a naquadah coil nozzle at each end
  // (the magnetic nozzles), three collector grids of frame across the beam and a titanium heat-rejection manifold along the roof.
  function cellsOf(w, h, d, controllerX, fn) {
    var slices = []
    for (var z = 0; z < d; z++) {
      var rows = []
      for (var y = 0; y < h; y++) {
        var row = ''
        for (var x = 0; x < w; x++) row += (z === d - 1 && y === 1 && x === controllerX) ? 'S' : fn(x, y, z)
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // 5 wide, 7 high, 5 deep: x 0..4, y 0..6, z 0..4
  function casterCell(x, y, z) {
    var edge = x === 0 || x === 4 || z === 0 || z === 4
    var corner = (x === 0 || x === 4) && (z === 0 || z === 4)
    if (y === 0) return 'X'
    if (corner) return 'T'
    if (y === 6) return x === 2 && z === 2 ? 'P' : 'C'
    if (edge) return y === 3 || y === 4 ? 'G' : 'C'
    // the tundish (row 5) holds the steam drum; the mold column runs down from it
    if (y === 5) return x === 2 && z === 2 ? 'P' : '#'
    if (x === 2 && z === 2 && y <= 3) return 'M'
    return '#'
  }

  const CASTER_SPEC = {
    slices: cellsOf(5, 7, 5, 2, casterCell),
    symbols: {
      S: Pat.controller(),
      // 25 floor cells: 3 to 7 are parts, the rest casing
      X: Pat.oneOf(
        Pat.block(TUNGSTENSTEEL, { min: 14 }),
        Pat.part('energy_input', F.casterParts.energy_input),
        Pat.part('input_hatch', F.casterParts.input_hatch),
        Pat.part('output_hatch', F.casterParts.output_hatch),
        Pat.part('output_bus', F.casterParts.output_bus),
        G.parallelHatch.part()
      ),
      C: Pat.block(TUNGSTENSTEEL),
      M: Pat.block(MOLD),
      P: Pat.block(DRUM),
      G: Pat.block(GLASS),
      T: Pat.frame([FRAME]),
      '#': Pat.air()
    }
  }

  // 9 wide (the beam path), 6 high, 7 deep: x 0..8, y 0..5, z 0..6
  function converterCell(x, y, z) {
    var endWall = x === 0 || x === 8
    var longWall = z === 0 || z === 6
    var post = (x === 0 || x === 2 || x === 6 || x === 8) && longWall
    if (y === 0) return 'X'
    if (post) return 'T'
    if (y === 5) return z === 3 && x >= 1 && x <= 7 ? 'P' : 'C'
    if (endWall) return z >= 2 && z <= 4 && y >= 2 && y <= 3 ? 'K' : 'C'
    if (longWall) return y === 2 || y === 3 ? 'G' : 'C'
    // inside: a collector grid (a plus of frame across the beam) at x = 2, 4 and 6
    if ((x === 2 || x === 4 || x === 6) && (z === 3 || y === 2)) return 'T'
    return '#'
  }

  const CONVERTER_SPEC = {
    slices: cellsOf(9, 6, 7, 4, converterCell),
    symbols: {
      S: Pat.controller(),
      // 63 floor cells: 3 to 8 are parts (dynamo hatches, wireless ones included), the rest casing
      X: Pat.oneOf(
        Pat.block(CRYO, { min: 30 }),
        Pat.part('energy_output', F.converterParts.energy_output),
        Pat.part('input_hatch', F.converterParts.input_hatch),
        Pat.part('output_hatch', F.converterParts.output_hatch)
      ),
      C: Pat.block(CRYO),
      T: Pat.frame([FRAME]),
      K: Pat.block(COIL),
      G: Pat.block(GLASS),
      P: Pat.block(DRUM),
      '#': Pat.air()
    }
  }
  F.casterSpec = CASTER_SPEC
  F.converterSpec = CONVERTER_SPEC

  // the caster: the voiding refusal (its steam and argon), then a parallel hatch's copies and GTM's default overclock
  const casterModifier = function () {
    return G.noVoiding.modifier({ which: 'fluids', reason: NO_VOIDING, name: 'plasma quench caster' }, G.parallelHatch.modifier(G.parallelHatch.overclock))
  }

  // the converter: the helper's parallel copies (no overclock) behind the same refusal
  const converterModifier = function () {
    return G.noVoiding.modifier({ which: 'fluids', reason: NO_VOIDING, name: 'direct energy converter' }, Gen.modifier({ maxParallels: CONVERTER_MAX_PARALLELS, name: 'direct_energy_converter' }))
  }

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(CASTER_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(F.casterIO.itemsIn, F.casterIO.itemsOut, F.casterIO.fluidsIn, F.casterIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.COOLING)

    // a generator type (lib/generators.js): EU out, recipes at .EUt(-x)
    event.create(CONVERTER_TYPE)
      .category('generator')
      .setEUIO('out')
      .setMaxIOSize(F.converterIO.itemsIn, F.converterIO.itemsOut, F.converterIO.fluidsIn, F.converterIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_GAS_COLLECTOR, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ELECTROLYZER)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(CASTER, CASTER_SPEC)
    Pat.register(CONVERTER, CONVERTER_SPEC)

    event.create('plasma_quench_caster', 'multiblock')
      .langValue('Plasma Quench Caster')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(CASTER_TYPE)
      .recipeModifier(casterModifier(), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'fluids', reason: NO_VOIDING, name: 'plasma quench caster' }))
      .appearanceBlock(GTBlocks.CASING_TUNGSTENSTEEL_ROBUST)
      .pattern(function (def) { return Pat.build(def, CASTER_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.plasma_quench_caster.tooltip.0'),
        Text.translate('grindless.machine.plasma_quench_caster.tooltip.1'),
        Text.translate('grindless.machine.plasma_quench_caster.tooltip.2'),
        Text.translate('grindless.machine.parallel_hatch.tooltip')
      ])
      .workableCasingModel(TUNGSTENSTEEL_TEXTURE, 'grindless:block/multiblock/plasma_quench_caster')

    Gen.configure(event.create('direct_energy_converter', 'multiblock'), { maxParallels: CONVERTER_MAX_PARALLELS, name: 'direct_energy_converter' })
      .recipeModifier(converterModifier(), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'fluids', reason: NO_VOIDING, name: 'direct energy converter' }))
      .langValue('Direct Energy Converter')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(CONVERTER_TYPE)
      .appearanceBlock(function () { return Block.getBlock(CRYO) })
      .pattern(function (def) { return Pat.build(def, CONVERTER_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.direct_energy_converter.tooltip.0'),
        Text.translate('grindless.machine.direct_energy_converter.tooltip.1'),
        Text.translate('grindless.machine.direct_energy_converter.tooltip.2')
      ])
      .workableCasingModel(CRYO_TEXTURE, 'grindless:block/multiblock/direct_energy_converter')
  })

  // the caster takes the parallel hatch (the converter is a generator: nothing to copy but its own runs)
  if (G.parallelHatch && G.parallelHatch.machines && G.parallelHatch.machines.indexOf(CASTER) < 0) G.parallelHatch.machines.push(CASTER)
})()
