// -----------------------------------------------------------------------------------------------
// The two custom Steam Age multiblocks. Both are SteamParallelMultiblockMachine (GTM's steam multiblock logic:
// 4 parallels, duration x1.5, steam drawn from a steam hatch; nothing above LV can run) and every pattern is
// built through global.grindless.patterns (lib/patterns.js), never through FactoryBlockPattern directly.
//
//   gtceu:steam_vein_drill  3x3x6 derrick: a casing house (2 layers) with the controller, a central pipe
//                           mast and four frame posts. Parts: 1 steam hatch, 1 steam input bus,
//                           2 steam output buses (a vein of 4 ores + the stone byproduct is 5 different items
//                           and a steam bus only has 4 slots; with 2 buses every vein fits).
//   gtceu:steam_greenhouse  5x5x5 glass house: casing posts + floor ring, dirt floor, glass walls and roof.
//                           Parts: 1 steam hatch, 1 steam input bus, 1-2 steam output buses.
//
// Textures: overlay dirs grindless:block/multiblock/<machine> (overlay_front*.png), base casing
// gtceu:block/casings/solid/machine_casing_bronze_plated_bricks (GTM's steam machine casing).
// Names: assets/grindless/lang/*.json (block.gtceu.<machine>).
(function () {
  const Pat = global.grindless.patterns

  const CASING = 'gtceu:steam_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_bronze_plated_bricks'

  const DYES = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray',
    'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black']
  const GLASS = ['minecraft:glass', 'minecraft:tinted_glass'].concat(
    DYES.map(function (dye) { return 'minecraft:' + dye + '_stained_glass' }))
  const SOIL = ['minecraft:dirt', 'minecraft:grass_block', 'minecraft:coarse_dirt', 'minecraft:podzol',
    'minecraft:rooted_dirt', 'minecraft:farmland', 'minecraft:moss_block', 'minecraft:mud']

  const DRILL = 'gtceu:steam_vein_drill'
  const GREENHOUSE = 'gtceu:steam_greenhouse'

  // Specs are plain data + predicate descriptors (nothing of GTM runs until a pattern is built, which GTM does
  // lazily the first time a controller checks its structure). They are registered at startup so the structure
  // description (global.grindless.structures) exists without building anything.
  const DRILL_SPEC = {
    slices: [
      // back
      ['XXX', 'XXX', 'F F', 'F F', 'F F', '   '],
      // middle: the pipe goes through the house and ends in a frame mast
      ['XPX', 'XPX', ' F ', ' F ', ' F ', ' F '],
      // front (controller)
      ['XXX', 'XSX', 'F F', 'F F', 'F F', '   ']
    ],
    symbols: {
      S: Pat.controller(),
      // 15 house cells: 4 are parts, the rest steam machine casing
      X: Pat.oneOf(
        Pat.block(CASING, { min: 11 }),
        Pat.part('steam', { exact: 1 }),
        Pat.part('steam_input_bus', { exact: 1 }),
        Pat.part('steam_output_bus', { exact: 2 })
      ),
      P: Pat.block(['gtceu:bronze_pipe_casing', 'gtceu:steel_pipe_casing']),
      F: Pat.frame(['bronze', 'steel'])
    }
  }

  const GREENHOUSE_SPEC = {
    slices: [
      // back wall
      ['XXXXX', 'XGGGX', 'XGGGX', 'XGGGX', 'XGGGX'],
      // three slices: floor ring + soil, glass walls on both sides, empty interior, glass roof
      ['XDDDX', 'G   G', 'G   G', 'G   G', 'GGGGG'],
      ['XDDDX', 'G   G', 'G   G', 'G   G', 'GGGGG'],
      ['XDDDX', 'G   G', 'G   G', 'G   G', 'GGGGG'],
      // front wall (controller in the middle, eye level)
      ['XXXXX', 'XGGGX', 'XGSGX', 'XGGGX', 'XGGGX']
    ],
    symbols: {
      S: Pat.controller(),
      // 32 skeleton cells (4 corner posts + floor ring): 3 or 4 are parts, the rest steam machine casing
      X: Pat.oneOf(
        Pat.block(CASING, { min: 28 }),
        Pat.part('steam', { exact: 1 }),
        Pat.part('steam_input_bus', { exact: 1 }),
        Pat.part('steam_output_bus', { min: 1, max: 2 })
      ),
      G: Pat.block(GLASS),
      D: Pat.block(SOIL)
    }
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(DRILL, DRILL_SPEC)
    Pat.register(GREENHOUSE, GREENHOUSE_SPEC)

    event.create('steam_vein_drill', 'multiblock')
      .langValue('Steam Vein Drill')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return MachineConstructors.createSteamMultiblock(holder, 4) })
      .recipeType('vein_drilling')
      .recipeModifier(MachineModifiers.STEAM_PARALLEL_MULTIBLOCK, true)
      .appearanceBlock(GTBlocks.CASING_BRONZE_BRICKS)
      .pattern(function (def) { return Pat.build(def, DRILL_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.steam_vein_drill.tooltip.0'),
        Text.translate('grindless.machine.steam_vein_drill.tooltip.1'),
        Text.translate('grindless.machine.steam_vein_drill.tooltip.2')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/steam_vein_drill')

    event.create('steam_greenhouse', 'multiblock')
      .langValue('Steam Greenhouse')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return MachineConstructors.createSteamMultiblock(holder, 4) })
      .recipeType('greenhouse')
      .recipeModifier(MachineModifiers.STEAM_PARALLEL_MULTIBLOCK, true)
      .appearanceBlock(GTBlocks.CASING_BRONZE_BRICKS)
      .pattern(function (def) { return Pat.build(def, GREENHOUSE_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.steam_greenhouse.tooltip.0'),
        Text.translate('grindless.machine.steam_greenhouse.tooltip.1'),
        Text.translate('grindless.machine.steam_greenhouse.tooltip.2')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/steam_greenhouse')
  })
})()
