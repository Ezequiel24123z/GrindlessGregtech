// -----------------------------------------------------------------------------------------------
// The EV step of the Vein Drill family (docs/eras/ev.md, "EV tripod"): a lander that stays. It replaces the HV Lunar Drill on the
// Moon and is the drill of Mars.
//
//   gtceu:ev_vein_drill          the EV Tripod Drill, 9 wide, 9 high and 6 deep. Three titanium frame legs splay down from a raised
//                                3x3x3 body of stable titanium casing onto footings of Sintered Regolith Bricks (grindless:sintered_regolith,
//                                only baked on the Moon, ev/foundation.js); a titanium pipe drill string runs from the body down between
//                                the legs into a collar of the same bricks; two 3x3 solar wings stick out of the top of the body and a
//                                frame mast stands on it. The controller is the middle of the body's front face.
//   grindless:solar_wing_panel   the block of the wings: a thin panel of silicon cells on a titanium frame
//
// It runs gtceu:vein_drilling like the LV, MV and HV drills, but only its own recipes, the ones under vein_drilling/ev/
// (server_scripts/grindless/ev/tripod.js). They come from every vein table whose dimension is the Moon or Mars, and each carries
// that dimension's condition. No Earth vein (the HV drill keeps those, docs/eras/ev.md) and nothing of a higher tier: the veto below
// refuses every recipe whose tier folder is not ev (rules.recipeTier, lv/multis.js). The lower drills skip the ev/ folder by the
// same rule (rules.isAboveTier).
//
//   titanium bit, dry                 3.75 raw ores per run, the bit wears out in about 1 % of the runs (no water to cool it)
//   + 50 mB of liquid nitrogen a run  5.625 raw ores per run (+50 %, like drilling fluid on Earth), about 0.25 % wear
//   A dry recipe waits while the fluid hatch holds at least one run of liquid nitrogen, so the cooled one runs; with less than
//   that the drill goes back to dry drilling instead of stalling.
//
// Speed: `bores` (global.grindless.lv.bores, lv/multis.js) with a cap of 64 runs. 64 runs of 8 EU/t are 512 EU/t, an HV-tier
// recipe, so one EV energy hatch already overclocks once (64 runs in 100 ticks at 2 048 EU/t), two are IV (50 ticks). Like every
// drill of the family it needs one bit per run in the input bus: 64 bits for a full cycle (GTM rolls the wear once per run, so
// they wear out one at a time).
//
// Solar wings: by day (GTM's own day test, !level.isNight(), the one of its daytime condition) the wings pay part of the energy:
// half on the Moon (light x1.4), about 15 % on Mars (light x0.43: 0.5 x 0.43 / 1.4). The modifier multiplies the EU/t of the run
// after the overclock, so the wings make a run cheaper, never faster. At night, or anywhere else, the grid pays all of it.
//
// Textures: overlay dir grindless:block/multiblock/ev_tripod and block/ev_tripod/* (tools/assets/Build-EVTripodTextures.ps1; the
// ev_vein_drill overlay that Build-EVTextures.ps1 draws belongs to the discarded Earth drill and is not used), wing model
// assets/grindless/models/block/ev_tripod/solar_wing_panel.json. Names / tooltips: client_scripts/grindless/ev_tripod_lang.js.
(function () {
  const Pat = global.grindless.patterns
  const G = global.grindless
  const EV = G.ev || (G.ev = {})

  const MACHINE = 'gtceu:ev_vein_drill'
  const PANEL = 'grindless:solar_wing_panel'
  const BRICK = 'grindless:sintered_regolith'
  const CASING = 'gtceu:stable_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_stable_titanium'
  const PIPE = 'gtceu:titanium_pipe_casing'

  const TIER = 'ev'
  const MAX_PARALLELS = 64
  const COOLANT = 'gtceu:liquid_nitrogen'
  const COOLANT_PER_RUN = 50
  const COOLED_SUFFIX = '_cryo'
  // the share of a run's EU/t the grid still pays by day, per dimension (the wings pay the rest)
  const SOLAR = { 'gcyr:luna': 0.5, 'gcyr:mars': 0.85 }

  // the titanium bit: chance of 10 000 that a run uses it up and raw ores per run, dry (base*) and cooled with liquid nitrogen
  const BIT = { item: 'grindless:titanium_drill_bit', baseWear: 100, basePerRun: 3.75, wear: 25, perRun: 5.625 }

  // ---------------------------------------------------------------- pattern (lib/patterns.js: slices back -> front, rows bottom -> top)
  //
  //   R Sintered Regolith Bricks (footings, collar)   F titanium frame (legs, mast)   P titanium pipe casing (drill string)
  //   X body: stable titanium casing or a part        W solar wing panel              S controller
  const B = '         '
  const SPEC = {
    slices: [
      // back: the foot of the back leg
      ['    R    ', '    F    ', B, B, B, B, B, B, B],
      // the back leg climbs to the body
      [B, B, '    F    ', B, B, B, B, B, B],
      [B, B, B, '    F    ', B, B, B, B, B],
      // body, back row; the collar behind the drill string; the wings
      ['    R    ', B, B, B, '   XXX   ', '   XXX   ', 'WWWXXXWWW', B, B],
      // body, middle row: the drill string comes down through it into the collar; the mast on top
      ['   RPR   ', '    P    ', '    P    ', '    P    ', '   XPX   ', '   XPX   ', 'WWWXXXWWW', '    F    ', '    F    '],
      // front: the two front legs splay out to their footings, the collar in front of the string, the controller, the wings
      ['R   R   R', 'F       F', ' F     F ', '  F   F  ', '   XXX   ', '   XSX   ', 'WWWXXXWWW', B, B]
    ],
    symbols: {
      S: Pat.controller(),
      // 24 body cells: 4 to 6 are parts (energy, one input bus for the sample and the bits, one or two output buses, the coolant
      // hatch), the rest stable titanium casing. ME buses and hatches have the same abilities, so they fit too.
      X: Pat.oneOf(
        Pat.block(CASING, { min: 18 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { exact: 1 })
      ),
      P: Pat.block(PIPE),
      F: Pat.frame(['titanium']),
      R: Pat.block(BRICK),
      W: Pat.block(PANEL)
    }
  }

  // ---------------------------------------------------------------- helpers (also published for the smoke test)

  var LC = null
  function lazy() {
    if (LC === null) {
      LC = {
        IO: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO'),
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      }
    }
    return LC
  }

  // 'gcyr:luna' for a level (KubeJS shows Level#dimension() as getDimension(), the location)
  function dimensionOf(level) {
    if (level === null || level === undefined) return ''
    try {
      return String(level.getDimension())
    } catch (e) {
      return String(level.getDimensionKey().location())
    }
  }

  // the share of the EU/t the grid pays in that level right now (1 = all of it)
  function solarFactor(level) {
    var share = SOLAR[dimensionOf(level)]
    if (share === undefined) return 1
    return level.isNight() ? 1 : share
  }

  // mB of a fluid in the machine's input hatches
  function fluidAmount(machine, fluidId) {
    var c = lazy()
    var total = 0
    var handlers = machine.getCapabilitiesFlat(c.IO.IN, c.FluidCap)
    for (var i = 0; i < handlers.size(); i++) {
      var contents = handlers.get(i).getContents()
      for (var j = 0; j < contents.size(); j++) {
        var stack = contents.get(j)
        if (stack.getAmount() > 0 && String(c.Registries.FLUIDS.getKey(stack.getFluid())) === fluidId) total += Number(stack.getAmount())
      }
    }
    return total
  }

  function isCooledRecipe(recipe) {
    return String(recipe.id.getPath()).slice(-COOLED_SUFFIX.length) === COOLED_SUFFIX
  }

  EV.tripod = {
    machine: MACHINE,
    panel: PANEL,
    brick: BRICK,
    tier: TIER,
    cap: MAX_PARALLELS,
    coolant: COOLANT,
    coolantPerRun: COOLANT_PER_RUN,
    cooledSuffix: COOLED_SUFFIX,
    solar: SOLAR,
    bit: BIT,
    dimensionOf: dimensionOf,
    solarFactor: solarFactor,
    fluidAmount: fluidAmount,
    isCooledRecipe: isCooledRecipe
  }

  // ---------------------------------------------------------------- the wing panel block

  StartupEvents.registry('block', function (event) {
    event.create(PANEL)
      .glassSoundType()
      .hardness(3)
      .resistance(6)
      .requiresTool(true)
      .tagBlock('minecraft:mineable/pickaxe')
      .box(0, 6, 0, 16, 9, 16, true)
      .notSolid()
      .textureAll('grindless:block/ev_tripod/wing_cells')
      .model('grindless:block/ev_tripod/solar_wing_panel')
      .item(function (item) {
        item.tooltip(Text.gray(Text.translate('tooltip.grindless.solar_wing_panel')))
      })
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var lv = G.lv
    var rules = lv.rules

    // only its own recipes (no Earth vein, nothing of a higher tier); a dry run waits while a cooled one can run
    function tripodVeto(machine, recipe) {
      if (rules.recipeTier(recipe) !== TIER) return true
      return !isCooledRecipe(recipe) && fluidAmount(machine, COOLANT) >= COOLANT_PER_RUN
    }

    var drill = lv.bores(tripodVeto, MAX_PARALLELS)

    // bores (parallel runs + GTM's overclock), then the solar wings: a lower EU/t, same duration
    function modifier(machine, recipe) {
      var base = drill(machine, recipe)
      var share = 1
      try {
        share = solarFactor(machine.getLevel())
      } catch (e) {
        console.error('[grindless/ev] EV Tripod Drill solar wings: ' + e)
      }
      if (share >= 1) return base
      return base.andThen(ModifierFunction.builder().eutMultiplier(share).build())
    }

    Pat.register(MACHINE, SPEC)

    event.create('ev_vein_drill', 'multiblock')
      .langValue('EV Tripod Drill')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('vein_drilling')
      .recipeModifier(modifier, true)
      // the wings' price is set when a run starts: refresh it when GTM would restart a cached run (lib/fresh_run.js, IV-B2's finding)
      .afterWorking(G.freshRun.afterWorking('EV tripod drill'))
      .appearanceBlock(GTBlocks.CASING_TITANIUM_STABLE)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.ev_vein_drill.tooltip.0'),
        Text.translate('grindless.machine.ev_vein_drill.tooltip.1'),
        Text.translate('grindless.machine.ev_vein_drill.tooltip.2'),
        Text.translate('grindless.machine.ev_vein_drill.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/ev_tripod')
  })
})()
