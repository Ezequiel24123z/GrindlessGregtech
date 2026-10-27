// -----------------------------------------------------------------------------------------------
// UV's laser fusion chamber (docs/eras/uv.md, machine 4; package UV-A3): the machine, its recipe type and the one item only it makes.
//
//   gtceu:laser_fusion_chamber   type gtceu:laser_fusion. A GENERATOR (lib/generators.js): one capsule (p-B11 or D-He-3, from the diamond
//                                lattice fab) per run for 2,621,440 EU/t (5 A UV), 400 or 600 ticks. 13 x 13 x 13 target chamber of UV
//                                casing, a ring of 32 laser module beamlines (grindless:laser_module_block, F1's structure block) round the
//                                waist of the chamber and a capsule injector (an input bus) in the floor. The chamber is hollow. Its EU
//                                figures are final (the type is not in power/generators.js's doubling list, S0-6).
//   gtceu:laser_fusion           its recipe type. The programmed circuit picks the capsule (server_scripts/grindless/uv/fusion.js):
//                                  1 p-B11 capsule   2 D-He-3 capsule
//
// Item: grindless:spent_laser_module (a run's 2 % wear; the fibre draw tower's refurbishing recipe is UV-A7's).
// Parts (floor cells): 1-8 dynamo hatches, 1 input bus (the injector), 1-2 output hatches (helium, hydrogen), 1 output bus; at least
// `minCasings` casings among the 169 floor cells.
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

  const SIZE = 13
  // one beamline edge, corner to corner: 8 laser modules a side, 32 round the ring
  const EDGE = 'CLLLLCCCLLLLC'
  const RING_Y = 6

  LF.machine = MACHINE
  LF.recipeType = 'gtceu:' + TYPE
  LF.size = SIZE
  LF.beamCount = 32
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

  function build() {
    var slices = []
    for (var z = 0; z < SIZE; z++) {
      var rows = []
      for (var y = 0; y < SIZE; y++) {
        var row = ''
        for (var x = 0; x < SIZE; x++) {
          var edge = x === 0 || x === SIZE - 1 || z === 0 || z === SIZE - 1
          var c
          if (y === 0) c = 'X'
          else if (z === SIZE - 1 && y === 1 && x === (SIZE - 1) / 2) c = 'S'
          else if (y === SIZE - 1 || edge) {
            c = 'C'
            if (y === RING_Y && edge) c = (z === 0 || z === SIZE - 1) ? EDGE.charAt(x) : EDGE.charAt(z)
          } else c = '#'
          row += c
        }
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
      L: Pat.block(BEAM),
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
        Text.translate('grindless.machine.laser_fusion_chamber.tooltip.1'),
        Text.translate('grindless.machine.laser_fusion_chamber.tooltip.2')
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
