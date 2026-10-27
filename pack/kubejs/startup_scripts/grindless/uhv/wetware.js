// priority: -9000
// -----------------------------------------------------------------------------------------------
// UHV's organoid array (docs/eras/uhv.md, machine 11 and line 12; package UHV-B6): the machine and its recipe type. The organoid
// processor, the chitosan scaffold, the SiC power module, ultrapure water and the sterilised growth medium are F1's
// (global.grindless.uhvFoundation); the optical assembly is A4's (global.grindless.photonics). None is registered here.
//
//   gtceu:organoid_array      cortical organoids grown on microelectrode arrays (Cortical Labs' CL1, FinalSpark's Neuroplatform),
//                             then wired into GTM's wetware mainframe four at a time. Earth only (the recipes carry
//                             .dimension('minecraft:overworld')). A 7 wide x 5 high x 7 deep sterile room in LuV's organoid lab
//                             casing (plascrete, cleanroom glass windows): the parts in the floor, two rows of perfusion racks
//                             inside (PTFE pipe casing, the microelectrode readout in a computer casing between them), a
//                             sterilizing filter ceiling over the racks.
//   gtceu:organoid_computing  its recipe type (EU in); the programmed circuit picks the step: 1 organoid, 2 mainframe.
//
// Also widens LuV's gtceu:organoid_assembly (startup_scripts/grindless/luv/orbital_biology.js, (7, 1, 1, 0)) to one fluid output:
// the organoid lab's UHV row (server_scripts/grindless/uhv/wetware.js) makes the sterilised growth medium as a fluid.
//
// Parts: 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output buses, 1-2 output hatches in the floor, at least 30
// plascrete among them. The controller refuses to void fluids: the spent medium goes to LuV's biofoundry. Textures: the plascrete
// casing with the overlay from tools/assets/Build-UHVWetwareTextures.ps1. Published: global.grindless.wetware.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const W = G.wetware || (G.wetware = {})

  const ARRAY = 'gtceu:organoid_array'
  const ARRAY_TYPE = 'organoid_computing'

  const PLASCRETE = 'gtceu:plascrete'
  const PLASCRETE_TEXTURE = 'gtceu:block/casings/cleanroom/plascrete'
  const OVERLAY = 'grindless:block/multiblock/organoid_array'
  const WINDOW = 'gtceu:cleanroom_glass'
  const FILTER = 'gtceu:sterilizing_filter_casing'
  const PERFUSION = 'gtceu:ptfe_pipe_casing'
  const READOUT = 'gtceu:computer_casing'

  W.machine = ARRAY
  W.type = 'gtceu:' + ARRAY_TYPE
  // c2: 4 inputs and the circuit; c1: ultrapure water + sterilised medium in, the spent medium out
  W.maxIO = { itemsIn: 5, itemsOut: 1, fluidsIn: 2, fluidsOut: 1 }
  W.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 2 }
  }
  W.minCasings = 30
  W.blocks = { casing: PLASCRETE, window: WINDOW, filter: FILTER, perfusion: PERFUSION, readout: READOUT }
  W.noVoiding = 'grindless.machine.organoid_array.no_voiding'
  // LuV's organoid lab type, given one fluid output for its UHV row
  W.labType = 'organoid_assembly'
  W.labIO = { itemsIn: 7, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 }

  // ---------------------------------------------------------------- pattern
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front

  function cells(min) {
    return Pat.oneOf(
      Pat.block(PLASCRETE, { min: min }),
      Pat.part('energy_input', W.parts.energy_input),
      Pat.part('input_bus', W.parts.input_bus),
      Pat.part('input_hatch', W.parts.input_hatch),
      Pat.part('output_bus', W.parts.output_bus),
      Pat.part('output_hatch', W.parts.output_hatch)
    )
  }

  const FLOOR = 'XXXXXXX'
  const WALL = 'PPPPPPP'
  const SPEC = {
    slices: [
      [FLOOR, WALL, 'PPWWWPP', WALL, WALL],
      [FLOOR, 'P#R#R#P', 'P#M#M#P', 'P#R#R#P', WALL],
      [FLOOR, 'P#R#R#P', 'W#M#M#W', 'P#R#R#P', 'PPFFFPP'],
      [FLOOR, 'P#R#R#P', 'W#M#M#W', 'P#R#R#P', 'PPFFFPP'],
      [FLOOR, 'P#R#R#P', 'W#M#M#W', 'P#R#R#P', 'PPFFFPP'],
      [FLOOR, 'P#####P', 'P#####P', 'P#####P', WALL],
      [FLOOR, 'PPPSPPP', 'PPWWWPP', WALL, WALL]
    ],
    symbols: {
      S: Pat.controller(),
      X: cells(W.minCasings),
      P: Pat.block(PLASCRETE),
      W: Pat.block(WINDOW),
      F: Pat.block(FILTER),
      R: Pat.block(PERFUSION),
      M: Pat.block(READOUT),
      '#': Pat.air()
    }
  }
  W.spec = SPEC

  function noVoiding() {
    return { which: 'fluids', reason: W.noVoiding, name: 'organoid array' }
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var t = W.maxIO
    event.create(ARRAY_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(t.itemsIn, t.itemsOut, t.fluidsIn, t.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_MIXER, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    // After LuV's recipe types (7, 1, 1, 0): the organoid lab's UHV row outputs the sterilised growth medium (a fluid). W.labIO.
    GTRecipeTypes.get('organoid_assembly').setMaxIOSize(7, 1, 1, 1)

    Pat.register(ARRAY, SPEC)

    event.create('organoid_array', 'multiblock')
      .langValue('Organoid Array')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(ARRAY_TYPE)
      .recipeModifier(G.noVoiding.modifier(noVoiding(), G.parallelHatch.overclock), true)
      .beforeWorking(G.noVoiding.beforeWorking(noVoiding()))
      .appearanceBlock(function () { return Block.getBlock(PLASCRETE) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.organoid_array.tooltip.0'),
        Text.translate('grindless.machine.organoid_array.tooltip.1'),
        Text.translate('grindless.machine.organoid_array.tooltip.2'),
        Text.translate('grindless.machine.organoid_array.tooltip.3')
      ])
      .workableCasingModel(PLASCRETE_TEXTURE, OVERLAY)
  })
})()
