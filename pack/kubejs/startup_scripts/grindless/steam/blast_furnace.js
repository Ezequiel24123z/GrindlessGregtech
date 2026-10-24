// -----------------------------------------------------------------------------------------------
// Steam Blast Furnace (gtceu:steam_blast_furnace) and its recipe type gtceu:steelmaking.
//
// A SteamParallelMultiblockMachine like the steam drill and greenhouse (GTM's steam multiblock logic: 4 parallels, duration
// x1.5, steam from a steam hatch, nothing above LV runs). It charges iron ore, coke and a calcite flux at the throat, blows
// steam-driven hot blast through the tuyeres and taps steel and slag (GTM's ash) at the hearth: the furnace step and the
// Primitive Blast Furnace in one machine. Recipes: server_scripts/grindless/steam/blast_furnace.js.
//
//   gtceu:steelmaking   in : 4 iron feed (raw or crushed ore, iron ingot or dust) + 4 coke + 1 flux (calcite)
//                       out: 4 steel ingots + 1 ash dust                      max IO 3 items in, 2 items out, no fluids
//
// Structure (3 wide x 7 tall x 3 deep), every pattern goes through global.grindless.patterns (lib/patterns.js):
//   y0      hearth: bronze plated bricks (gtceu:steam_machine_casing) with the steam hatch, the input bus and 1-2 output buses
//   y1      bosh: firebricks, three tuyeres (bronze or steel pipe casings) around the hearth chamber, the controller in front
//   y2-y4   stack: firebricks around a hollow shaft (air)
//   y5-y6   headframe: four bronze or steel frame posts and the downcomer (two pipe casings) in the middle
//
// Textures: overlay dir grindless:block/multiblock/steam_blast_furnace (tools/assets/Build-SteamContentTextures.ps1) on GTM's
// firebricks (the controller sits in the firebrick bosh); the parts take the bronze plated bricks of the hearth (appearance
// block). Names / tooltips: client_scripts/grindless/steam_content_lang.js.
(function () {
  const Pat = global.grindless.patterns

  const MACHINE = 'gtceu:steam_blast_furnace'
  const CASING = 'gtceu:steam_machine_casing'
  const FIREBRICKS = 'gtceu:firebricks'
  const PIPES = ['gtceu:bronze_pipe_casing', 'gtceu:steel_pipe_casing']
  const FIREBRICK_TEXTURE = 'gtceu:block/casings/solid/machine_primitive_bricks'

  const SPEC = {
    slices: [
      // back: hearth, bosh with a tuyere, stack, headframe posts
      ['HHH', 'BTB', 'BBB', 'BBB', 'BBB', 'F F', 'F F'],
      // middle: two side tuyeres, the hollow chamber and shaft, the downcomer on top
      ['HHH', 'T#T', 'B#B', 'B#B', 'B#B', ' P ', ' P '],
      // front: the controller in the bosh
      ['HHH', 'BSB', 'BBB', 'BBB', 'BBB', 'F F', 'F F']
    ],
    symbols: {
      S: Pat.controller(),
      // 9 hearth cells: 3 or 4 are parts, the rest bronze plated bricks
      H: Pat.oneOf(
        Pat.block(CASING, { min: 5 }),
        Pat.part('steam', { exact: 1 }),
        Pat.part('steam_input_bus', { exact: 1 }),
        Pat.part('steam_output_bus', { min: 1, max: 2 })
      ),
      B: Pat.block(FIREBRICKS),
      T: Pat.block(PIPES),
      P: Pat.block(PIPES),
      F: Pat.frame(['bronze', 'steel']),
      '#': Pat.air()
    }
  }

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create('steelmaking')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(3, 2, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)

    event.create('steam_blast_furnace', 'multiblock')
      .langValue('Steam Blast Furnace')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return MachineConstructors.createSteamMultiblock(holder, 4) })
      .recipeType('steelmaking')
      .recipeModifier(MachineModifiers.STEAM_PARALLEL_MULTIBLOCK, true)
      .appearanceBlock(GTBlocks.CASING_BRONZE_BRICKS)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.steam_blast_furnace.tooltip.0'),
        Text.translate('grindless.machine.steam_blast_furnace.tooltip.1'),
        Text.translate('grindless.machine.steam_blast_furnace.tooltip.2'),
        Text.translate('grindless.machine.steam_blast_furnace.tooltip.3')
      ])
      .workableCasingModel(FIREBRICK_TEXTURE, 'grindless:block/multiblock/steam_blast_furnace')
  })
})()
