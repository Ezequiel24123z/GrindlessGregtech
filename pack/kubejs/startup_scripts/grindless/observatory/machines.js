// -----------------------------------------------------------------------------------------------
// The observatory family, Steam to MV (docs/viaje.md, "Observatorio (familia nueva, la que cuenta el viaje)"): the machines that tell
// the journey, because navigation data only comes from looking. Each step is its own multiblock with its own recipe type, so each
// observatory is the only machine that makes its chart (EMI lists only that machine for it). Every pattern goes through
// global.grindless.patterns (lib/patterns.js). The family changes shape and parts with the era, not only colour:
//
//   gtceu:steam_observatory    Clockwork Observatory (Steam). An open-air bronze telescope: a 3x5 platform of steam casing with
//                              the hatches, a stone brick pier, a bronze gearbox (the clock drive) between two bronze frame fork arms,
//                              and a tube of bronze pipe casings rising diagonally to the back, a glass objective at its top. 3 wide,
//                              6 high, 5 deep. GTM's steam multiblock (one run at a time).
//                              gtceu:stargazing: night, clear sky, controller at Y 100 or higher -> grindless:lunar_chart_draft
//   gtceu:optical_observatory  Optical Observatory (LV). A steel dome: a 5x5 ring of solid steel casing with the hatches, two courses
//                              of stone brick wall, a dome of steel casing whose shutter slit must be open (two air cells), and inside a
//                              refractor on a pier (stone brick, steel frame, steel gearbox drive, two steel pipe casings) pointing up
//                              through the slit, a glass objective on top. 5 wide, 6 high, 5 deep.
//                              gtceu:astrophotography: night, clear sky (any height) -> grindless:lunar_map + grindless:lunar_ephemeris
//   gtceu:radio_telescope      Radio Telescope (MV). An array of three aluminium dishes: each a 3x3 bowl of aluminium frames (the
//                              rim one block above the centre) on a frame pylon, a lightning rod as the feed antenna, a frame cable run
//                              along the front to a 5x2x2 hut of frost-proof aluminium casing with the controller and the hatches.
//                              11 wide, 3 high, 5 deep.
//                              gtceu:radio_astronomy: night (the Moon is up) and no thunderstorm; rain is fine -> the landing chart
// The sky rules are GTM recipe conditions (DaytimeCondition reversed = night, RainingCondition / ThunderCondition reversed = below
// that level, PositionYCondition = the controller's Y), set on the recipes (server_scripts/grindless/observatory/recipes.js) and
// checked every tick while a recipe runs: if dawn, rain or a storm comes mid-run, the machine waits and, with regressWhenWaiting(false),
// keeps its progress until the sky clears. Each type also gets one EMI line (GTRecipeType#addDataInfo) that spells the sky rule out
// in words, read from the recipe data key grindless_sky.
//
// Textures: overlay dirs grindless:block/multiblock/<machine> (tools/assets/Build-ObservatoryTextures.ps1). Names / tooltips:
// client_scripts/grindless/observatory_lang.js.
(function () {
  const Pat = global.grindless.patterns
  const G = global.grindless
  const OBS = G.observatory || (G.observatory = {})

  const STEAM = 'gtceu:steam_observatory'
  const OPTICAL = 'gtceu:optical_observatory'
  const RADIO = 'gtceu:radio_telescope'

  const STEAM_CASING = 'gtceu:steam_machine_casing'
  const STEAM_CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_bronze_plated_bricks'
  const STEEL_CASING = 'gtceu:solid_machine_casing'
  const STEEL_CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  const ALU_CASING = 'gtceu:frostproof_machine_casing'
  const ALU_CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_frost_proof'

  const DYES = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray',
    'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black']
  // the objective lens: any glass block
  const GLASS = ['minecraft:glass', 'minecraft:tinted_glass', 'gtceu:tempered_glass'].concat(
    DYES.map(function (dye) { return 'minecraft:' + dye + '_stained_glass' }))
  // piers and the walls of the dome building
  const MASONRY = ['minecraft:stone_bricks', 'minecraft:mossy_stone_bricks', 'minecraft:cracked_stone_bricks',
    'minecraft:chiseled_stone_bricks', 'minecraft:bricks']

  OBS.machines = { steam: STEAM, optical: OPTICAL, radio: RADIO }
  OBS.types = { steam: 'gtceu:stargazing', optical: 'gtceu:astrophotography', radio: 'gtceu:radio_astronomy' }
  // the recipe data key read by the EMI line of each type, and its values (gtceu.recipe.grindless_sky.<value> in the lang files)
  OBS.skyKey = 'grindless_sky'

  // ---------------------------------------------------------------- patterns (slices back -> front, rows bottom -> top)

  //   X platform: steam casing or a steam part   S controller   B stone brick pier   C bronze gearbox (clock drive)
  //   F bronze frame (fork arms)   T bronze pipe casing (the tube)   L glass (the objective)
  const STEAM_SPEC = {
    slices: [
      // back: the top of the tube and the objective
      ['XXX', '   ', '   ', '   ', ' T ', ' L '],
      ['XXX', '   ', '   ', ' T ', ' T ', '   '],
      // the mount: pier, clock drive between the fork arms, the tube's lower end on the drive
      ['XXX', ' B ', 'FCF', 'FTF', '   ', '   '],
      ['XXX', '   ', '   ', '   ', '   ', '   '],
      // front (controller)
      ['XSX', '   ', '   ', '   ', '   ', '   ']
    ],
    symbols: {
      S: Pat.controller(),
      // 14 platform cells: 3 are parts, the rest steam machine casing
      X: Pat.oneOf(
        Pat.block(STEAM_CASING, { min: 11 }),
        Pat.part('steam', { exact: 1 }),
        Pat.part('steam_input_bus', { exact: 1 }),
        Pat.part('steam_output_bus', { exact: 1 })
      ),
      B: Pat.block(MASONRY),
      C: Pat.block('gtceu:bronze_gearbox'),
      F: Pat.frame(['bronze']),
      T: Pat.block('gtceu:bronze_pipe_casing'),
      L: Pat.block(GLASS)
    }
  }

  //   X floor ring: steel casing or a part   M stone brick wall (and the pier's base)   S controller   D the dome (steel casing)
  //   F steel frame (pier)   C steel gearbox (the motor drive)   T steel pipe casing (the tube)   L glass (the objective)
  //   # the shutter slit: must be open (air)
  const OPTICAL_SPEC = {
    slices: [
      // back
      ['XXXXX', 'MMMMM', 'MMMMM', ' DDD ', '     ', '     '],
      ['X   X', 'M   M', 'M   M', 'D   D', ' D#D ', '     '],
      // middle: the pier and the refractor going up through the dome
      ['X M X', 'M F M', 'M C M', 'D T D', ' DTD ', '  L  '],
      ['X   X', 'M   M', 'M   M', 'D   D', ' D#D ', '     '],
      // front (controller in the wall, eye level)
      ['XXXXX', 'MMSMM', 'MMMMM', ' DDD ', '     ', '     ']
    ],
    symbols: {
      S: Pat.controller(),
      // 16 floor ring cells: 3 or 4 are parts, the rest solid steel casing
      X: Pat.oneOf(
        Pat.block(STEEL_CASING, { min: 12 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { exact: 1 })
      ),
      M: Pat.block(MASONRY),
      D: Pat.block(STEEL_CASING),
      F: Pat.frame(['steel']),
      C: Pat.block('gtceu:steel_gearbox'),
      T: Pat.block('gtceu:steel_pipe_casing'),
      L: Pat.block(GLASS),
      '#': Pat.air()
    }
  }

  //   F aluminium frame (dish rims and centres, pylons, the cable run)   H lightning rod (the feed antenna at each dish's focus)
  //   X hut: frost-proof aluminium casing or a part   S controller
  const RADIO_SPEC = {
    slices: [
      // back: the back rims of the three dishes
      ['           ', '           ', 'FFF FFF FFF'],
      // the dish centres one block below the rims, on their pylons, the feed antennas in the middle
      [' F   F   F ', ' F   F   F ', 'FHF FHF FHF'],
      // the front rims, and the cable run along the ground to the hut
      [' FFFFFFFFF ', '           ', 'FFF FFF FFF'],
      // the hut
      ['   XXXXX   ', '   XXXXX   ', '           '],
      // front (controller)
      ['   XXXXX   ', '   XXSXX   ', '           ']
    ],
    symbols: {
      S: Pat.controller(),
      // 19 hut cells: 3 or 4 are parts, the rest frost-proof casing
      X: Pat.oneOf(
        Pat.block(ALU_CASING, { min: 15 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { exact: 1 })
      ),
      F: Pat.frame(['aluminium']),
      H: Pat.block('minecraft:lightning_rod')
    }
  }

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // in: paper + ink; out: the draft
    event.create('stargazing')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(3, 2, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.MOTOR)

    // in: the draft (not consumed) + photographic plates + paper; out: map + ephemeris
    event.create('astrophotography')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(4, 2, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.MOTOR)

    // in: map + ephemeris (not consumed) + paper; out: the landing chart
    event.create('radio_astronomy')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(4, 2, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.SCIENCE)
  })

  // One EMI line per recipe: the sky rule in words (GTM's own condition lines only show numbers). Called on the client while EMI
  // draws a recipe, with the recipe's data tag; an empty string draws nothing.
  function skyInfo(data) {
    try {
      var sky = data.getString(OBS.skyKey)
      if (!sky) return ''
      return String(Text.translate('gtceu.recipe.' + OBS.skyKey + '.' + sky).getString())
    } catch (e) {
      return ''
    }
  }

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    ;['stargazing', 'astrophotography', 'radio_astronomy'].forEach(function (name) {
      var type = GTRecipeTypes.get(name)
      if (type == null) throw new Error('[grindless/observatory] recipe type gtceu:' + name + ' is not registered')
      type.addDataInfo(skyInfo)
    })

    Pat.register(STEAM, STEAM_SPEC)
    Pat.register(OPTICAL, OPTICAL_SPEC)
    Pat.register(RADIO, RADIO_SPEC)

    event.create('steam_observatory', 'multiblock')
      .langValue('Clockwork Observatory')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return MachineConstructors.createSteamMultiblock(holder, 1) })
      .recipeType('stargazing')
      .recipeModifier(MachineModifiers.STEAM_PARALLEL_MULTIBLOCK, true)
      .regressWhenWaiting(false)
      .appearanceBlock(GTBlocks.CASING_BRONZE_BRICKS)
      .pattern(function (def) { return Pat.build(def, STEAM_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.steam_observatory.tooltip.0'),
        Text.translate('grindless.machine.steam_observatory.tooltip.1'),
        Text.translate('grindless.machine.steam_observatory.tooltip.2'),
        Text.translate('grindless.machine.steam_observatory.tooltip.3')
      ])
      .workableCasingModel(STEAM_CASING_TEXTURE, 'grindless:block/multiblock/steam_observatory')

    event.create('optical_observatory', 'multiblock')
      .langValue('Optical Observatory')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('astrophotography')
      .regressWhenWaiting(false)
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, OPTICAL_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.optical_observatory.tooltip.0'),
        Text.translate('grindless.machine.optical_observatory.tooltip.1'),
        Text.translate('grindless.machine.optical_observatory.tooltip.2'),
        Text.translate('grindless.machine.optical_observatory.tooltip.3')
      ])
      .workableCasingModel(STEEL_CASING_TEXTURE, 'grindless:block/multiblock/optical_observatory')

    event.create('radio_telescope', 'multiblock')
      .langValue('Radio Telescope')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('radio_astronomy')
      .regressWhenWaiting(false)
      .appearanceBlock(GTBlocks.CASING_ALUMINIUM_FROSTPROOF)
      .pattern(function (def) { return Pat.build(def, RADIO_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.radio_telescope.tooltip.0'),
        Text.translate('grindless.machine.radio_telescope.tooltip.1'),
        Text.translate('grindless.machine.radio_telescope.tooltip.2'),
        Text.translate('grindless.machine.radio_telescope.tooltip.3')
      ])
      .workableCasingModel(ALU_CASING_TEXTURE, 'grindless:block/multiblock/radio_telescope')
  })
})()
