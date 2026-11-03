// priority: -9700
// -----------------------------------------------------------------------------------------------
// UV's laser fusion chamber (docs/eras/uv.md, machine 4; package UV-A3): the machine, its recipe type and the one item only it makes.
//
//   gtceu:laser_fusion_chamber   type gtceu:laser_fusion. A GENERATOR (lib/generators.js): one capsule (p-B11 or D-He-3, from the diamond
//                                lattice fab) per run for 2,621,440 EU/t (5 A UV), 400 or 600 ticks. 15 x 15 x 15 hall around a spherical
//                                target chamber of UV casing, twelve beamline arms of 44 laser module blocks (grindless:laser_module_block,
//                                F1's structure block) and a capsule injector (an input bus) in the floor. The chamber is hollow. Its EU
//                                figures are final (the type is not in power/generators.js's doubling list, S0-6).
//   gtceu:laser_fusion           its recipe type. The programmed circuit picks the capsule (server_scripts/grindless/uv/fusion.js):
//                                  1 p-B11 capsule   2 D-He-3 capsule
//
// Item: grindless:spent_laser_module (a run's 2 % wear; the fibre draw tower's refurbishing recipe is UV-A7's).
// Parts (floor cells): 1-8 dynamo hatches, 1 input bus (the injector), 1-2 output hatches (helium, hydrogen), 1 output bus; at least
// `minCasings` casings among the floor cells.
// Textures: the direct energy converter's overlay (grindless:block/multiblock/direct_energy_converter) on GTM's UV casing; the item from
// tools/assets/Build-UVFusionTextures.ps1. Published: global.grindless.laserFusion.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const Gen = G.generators
  const LF = G.laserFusion || (G.laserFusion = {})

  const TYPE = 'laser_fusion'
  const MACHINE = 'gtceu:laser_fusion_chamber'
  const CASING = 'gtceu:uv_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/voltage/uv/side'
  const OVERLAY = 'grindless:block/multiblock/direct_energy_converter'
  const BEAM = 'grindless:laser_module_block'
  const NO_VOIDING = 'grindless.machine.laser_fusion_chamber.no_voiding'

  const SIZE = 15
  const CAPACITOR = 'gtceu:computer_casing'
  const COIL = 'gtceu:superconducting_coil'

  LF.machine = MACHINE
  LF.recipeType = 'gtceu:' + TYPE
  LF.size = SIZE
  LF.beamCount = 12
  LF.eut = 2621440
  LF.items = ['grindless:spent_laser_module']
  // items in: the capsule and the circuit; out: the spent module. Fluids out: helium and hydrogen
  LF.maxIO = { itemsIn: 3, itemsOut: 1, fluidsIn: 0, fluidsOut: 2 }
  LF.parts = {
    energy_output: { min: 1, max: 8 },
    input_bus: { min: 1, max: 1 },
    output_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 1 },
    minCasings: 120
  }

  // ---------------------------------------------------------------- pattern (slices back -> front, rows bottom -> top)

  // A spherical target chamber (UV casing shell, radius 4) at the centre of a 15 x 15 x 15 hall, on a pedestal over the coil ring.
  // Twelve beamline arms (four directions x three heights, laser modules) meet it through fusion glass ports. The floor is a
  // capacitor bank (computer casing); four wall capacitor bands, frame posts and a roof lattice close the hall.
  function cell(x, y, z) {
    var last = SIZE - 1
    var dx = x - 7
    var dy = y - 8
    var dz = z - 7
    var d2 = dx * dx + dy * dy + dz * dz
    var wall = x === 0 || x === last || z === 0 || z === last
    var corner = (x === 0 || x === last) && (z === 0 || z === last)
    if (y === 0) return 'X'
    if (z === last && y === 1 && x === 7) return 'S'
    if (y === 1) return 'Q'
    var onXArm = dz === 0 && (dy === 0 || Math.abs(dy) === 2) && Math.abs(dx) >= 3
    var onZArm = dx === 0 && (dy === 0 || Math.abs(dy) === 2) && Math.abs(dz) >= 3
    if (onXArm || onZArm) {
      if (d2 > 16) return 'L'
      if (d2 > 8) return 'G'
      return '#'
    }
    if (d2 > 8 && d2 <= 16) return (dx === 0 && dz === 0 && dy === 4) ? 'G' : 'C'
    if (dx === 0 && dz === 0 && (y === 2 || y === 3)) return 'F'
    if (y === 2 && Math.max(Math.abs(dx), Math.abs(dz)) === 2) return 'K'
    if (y === 3 && Math.max(Math.abs(dx), Math.abs(dz)) === 2) return 'C'
    if (y === last) {
      if (wall) return 'F'
      return (x + z) % 2 === 0 ? 'C' : '#'
    }
    if (wall) {
      if (corner) return 'F'
      if (y <= 4) return (x + z) % 2 === 0 ? 'Q' : 'C'
      if (y === last - 1) return 'C'
      var along = (x === 0 || x === last) ? z : x
      if (along % 4 === 0) return 'F'
      if (y >= 6 && y <= 10 && along % 2 === 0) return 'G'
    }
    return '#'
  }

  function build() {
    var slices = []
    for (var z = 0; z < SIZE; z++) {
      var rows = []
      for (var y = 0; y < SIZE; y++) {
        var row = ''
        for (var x = 0; x < SIZE; x++) row += cell(x, y, z)
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  const SPEC = {
    slices: build(),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(
        Pat.block(CASING, { min: LF.parts.minCasings }),
        Pat.part('energy_output', LF.parts.energy_output),
        Pat.part('input_bus', LF.parts.input_bus),
        Pat.part('output_hatch', LF.parts.output_hatch),
        Pat.part('output_bus', LF.parts.output_bus)
      ),
      C: Pat.block(CASING),
      F: Pat.frame(['tungsten_steel']),
      K: Pat.block(COIL),
      G: Pat.block('gtceu:fusion_glass'),
      L: Pat.block(BEAM),
      Q: Pat.block(CAPACITOR),
      '#': Pat.air()
    }
  }
  LF.spec = SPEC

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var io = LF.maxIO
    event.create(TYPE)
      .category('generator')
      .setEUIO('out')
      .setMaxIOSize(io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var keep = { which: 'fluids', reason: NO_VOIDING, name: 'laser fusion chamber' }

    Pat.register(MACHINE, SPEC)

    Gen.configure(event.create('laser_fusion_chamber', 'multiblock'), { maxParallels: 1, name: 'laser_fusion_chamber' })
      .recipeModifier(G.noVoiding.modifier(keep, Gen.modifier({ maxParallels: 1, name: 'laser_fusion_chamber' })), true)
      .beforeWorking(G.noVoiding.beforeWorking(keep))
      .langValue('Laser Fusion Chamber')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.laser_fusion_chamber.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.laser_fusion'))
      ])
      .workableCasingModel(CASING_TEXTURE, OVERLAY)
  })

  // ---------------------------------------------------------------- items

  StartupEvents.registry('item', function (event) {
    event.create('grindless:spent_laser_module')
      .texture('grindless:item/spent_laser_module')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.spent_laser_module.0')))
      .tooltip(Text.darkGray(Text.translate('tooltip.grindless.spent_laser_module.1')))
  })
})()
