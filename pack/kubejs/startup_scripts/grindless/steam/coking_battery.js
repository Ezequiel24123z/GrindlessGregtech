// priority: -6800
// -----------------------------------------------------------------------------------------------
// By-product Coke Battery (gtceu:coking_battery) and its recipe type gtceu:coking.
//
// A SteamParallelMultiblockMachine like the other steam multiblocks (4 parallels, duration x1.5, steam from a steam hatch,
// nothing above LV runs). A row of narrow coking chambers (coke oven bricks) between heating walls (bronze fireboxes), a gas
// collecting main on the roof and the pusher side in front. Unlike GTM's coke oven it keeps the gas: coke, creosote AND
// coal gas. Recipes: server_scripts/grindless/steam/coking_battery.js.
//
//   gtceu:coking   in : coal                  out: coke + creosote + coal gas      max IO 1 item in, 1 item out, 2 fluids out
//
// Structure (5 wide x 6 tall x 3 deep, QR-S1: bronze frame girders at the roof corners and a two-block pipe chimney), every pattern goes through global.grindless.patterns (lib/patterns.js):
//   y0      base: bronze plated bricks (gtceu:steam_machine_casing) with the steam hatch and 1-2 output buses (the coke)
//   y1-y2   three chambers of coke oven bricks between two heating walls of bronze firebox casings; the controller is the
//           middle chamber door on the front face
//   y3      roof: bronze plated bricks with the input bus (charging hole) and the two fluid output hatches (creosote, coal
//           gas) front and back, and the gas collecting main (bronze or steel pipe casings) along the middle
// The fluid output hatches are GTM's (any tier). The ULV one gets a crafting-table recipe in the Steam Age
// (server_scripts/grindless/steam/coking_battery.js), so the battery is buildable before the assembler.
//
// Textures: overlay dir grindless:block/multiblock/coking_battery (tools/assets/Build-SteamContentTextures.ps1) on GTM's coke
// oven bricks (the controller is a chamber door); the parts take the bronze plated bricks of base and roof (appearance block).
// Names / tooltips: client_scripts/grindless/steam_content_lang.js.
(function () {
  const Pat = global.grindless.patterns

  const MACHINE = 'gtceu:coking_battery'
  const CASING = 'gtceu:steam_machine_casing'
  const COKE_BRICKS = 'gtceu:coke_oven_bricks'
  const FIREBOX = 'gtceu:bronze_firebox_casing'
  const PIPES = ['gtceu:bronze_pipe_casing', 'gtceu:steel_pipe_casing']
  const COKE_BRICK_TEXTURE = 'gtceu:block/casings/solid/machine_coke_bricks'

  const SPEC = {
    slices: [
      // back: base, chambers and heating walls, roof with parts
      ['XXXXX', 'KWKWK', 'KWKWK', 'FRRRF', '     ', '     '],
      // middle: the gas collecting main runs along the roof
      ['XXXXX', 'KWKWK', 'KWKWK', 'PPPPP', '  P  ', '  P  '],
      // front (pusher side): the controller is the middle chamber door
      ['XXXXX', 'KWSWK', 'KWKWK', 'FRRRF', '     ', '     ']
    ],
    symbols: {
      S: Pat.controller(),
      // 15 base cells: 2 or 3 are parts, the rest bronze plated bricks
      X: Pat.oneOf(
        Pat.block(CASING, { min: 12 }),
        Pat.part('steam', { exact: 1 }),
        Pat.part('steam_output_bus', { min: 1, max: 2 })
      ),
      // 6 roof cells (the corners are frame girders): the charging bus and the two fluid outputs, the rest bronze plated bricks
      R: Pat.oneOf(
        Pat.block(CASING, { min: 3 }),
        Pat.part('steam_input_bus', { exact: 1 }),
        Pat.part('output_hatch', { exact: 2 })
      ),
      K: Pat.block(COKE_BRICKS),
      W: Pat.block(FIREBOX),
      P: Pat.block(PIPES),
      F: Pat.frame(['bronze'])
    }
  }

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create('coking')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(1, 1, 0, 2)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FIRE)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)

    event.create('coking_battery', 'multiblock')
      .langValue('By-product Coke Battery')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return MachineConstructors.createSteamMultiblock(holder, 4) })
      .recipeType('coking')
      .recipeModifier(MachineModifiers.STEAM_PARALLEL_MULTIBLOCK, true)
      .appearanceBlock(GTBlocks.CASING_BRONZE_BRICKS)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.coking_battery.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.coking')),
        Text.translate('grindless.tooltip.steam', '32')
      ])
      .workableCasingModel(COKE_BRICK_TEXTURE, 'grindless:block/multiblock/coking_battery')
  })
})()
