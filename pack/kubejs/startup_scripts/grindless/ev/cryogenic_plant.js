// -----------------------------------------------------------------------------------------------
// The Cryogenic Plant, a Moon multiblock of the EV era (docs/eras/ev.md, "Cryogenic plant"), the recipe type it runs and its radiator.
//
//   gtceu:cryogenic_plant          a 3x3x7 tower of frost-proof casing (the cold box) on sintered regolith footings, with a titanium pipe
//                                  core (its heat exchanger) and two wings of night-sky radiators near the top, on aluminium frame legs.
//                                  Runs the new gtceu:cryogenic_processing
//   gtceu:cryogenic_processing     gas -> liquid, 1,000 mB -> 1,000 mB: oxygen -> liquid oxygen, helium -> liquid helium, nitrogen ->
//                                  liquid nitrogen (GTM makes no liquid nitrogen; ev/foundation.js gave GTM's nitrogen the fluid).
//                                  Every recipe carries .dimension('gcyr:luna') (server_scripts/grindless/ev/cryogenic_plant.js)
//   grindless:night_sky_radiator   the radiator panel of the wings: white-coated aluminium with copper heat pipes
//
// What it wins: A LIQUID GTM DOES NOT MAKE and THE SITE'S COLD. By day each run costs what GTM's vacuum freezer costs (1,920 EU/t for
// 240 ticks per 1,000 mB, the freezer's liquid oxygen and liquid helium recipes). During the lunar night, with every radiator open to
// the sky, the plant dumps its heat into a black sky and the run costs half (960 EU/t, the same 240 ticks). Recipe time is never
// changed. No catalyst and no parallels: the advantage is the cold, and the plant only works on the Moon.
//
// Why a modifier and not a night recipe: GTM 7.5.3 checks recipe conditions on every tick of a run (RecipeLogic#handleRecipeWorking),
// so a run of a night-only recipe caught by the dawn would wait, idle, until the next night; and GTM's recipe lookup keeps only one of
// two recipes with the same ingredients (see the lookup note in lv/multis.js). So there is one recipe per gas at the freezer's price,
// and the modifier below halves its EU/t when a run starts at night with the wings open to the sky. It is registered with
// alwaysTryModifyRecipe, so GTM re-applies it when each run ends (RecipeLogic#onRecipeFinish): the price follows the sky run by run,
// and a run keeps the price it started with. After that, GTM's standard overclock (non-perfect) uses whatever voltage is left.
//
// Night: the sun below the horizon, read from the level's day time: vanilla's own time-of-day curve (DimensionType#timeOfDay: 0 noon,
// 0.25 sunset, 0.5 midnight, 0.75 sunrise) puts it down from day time 12,786 to 23,214, about 10,400 of the 24,000 ticks (the bounds
// are kept as integers, see sunIsDown). GCYR's Moon (dimension type gcyr:luna) has no fixed time and runs on the Overworld's clock.
// Level#isNight is not used, because a thunderstorm also turns it true (vanilla darkens the sky with the rain and thunder levels).
// Sky: every radiator must see the sky (Level#canSeeSky on the block above it, like the heliostat mirrors of lv/heliostat_tower.js). A
// covered wing just gives the day price. The two wings are symmetric, so a mirrored structure has its radiators on the same cells.
//
// Geometry (slices back -> front, rows bottom -> top, columns left -> right as seen from the front; 7 wide, 8 high, 3 deep):
//   row 0      sintered regolith: 3x3 under the tower and one footing under each leg
//   rows 1-2   the tower's two lowest rings: casing or parts (X, 15 cells), the controller in the front ring at row 1
//   rows 1-6   the titanium pipe core in the middle of the tower; an aluminium frame leg at each side, under the tip of its wing
//   rows 3-7   frost-proof casing; row 7 is the tower's cap
//   row 6      the radiator wings: 2x3 radiators on each side of the tower (12)
// Parts (X): 1-2 EV energy hatches, 1-2 input hatches (the gases), 1-4 output hatches (each holds one liquid). ME hatches have the same
// abilities as the plain ones and fit the same cells, so the plant can request gas from and deliver liquid to the home network.
//
// Textures: overlay dir grindless:block/multiblock/cryogenic_plant, base casing GTM's frost-proof casing; block/night_sky_radiator_*
// (tools/assets/Build-CryogenicPlantTextures.ps1). Names / tooltips: client_scripts/grindless/ev_cryogenic_plant_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const CRYO = G.cryogenicPlant || (G.cryogenicPlant = {})

  const MACHINE = 'gtceu:cryogenic_plant'
  const TYPE = 'gtceu:cryogenic_processing'
  const RADIATOR = 'grindless:night_sky_radiator'

  const CASING = 'gtceu:frostproof_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_frost_proof'
  const PIPE = 'gtceu:titanium_pipe_casing'
  const BRICK = 'grindless:sintered_regolith'
  const NIGHT_FACTOR = 0.5
  const NIGHT_KEY = 'grindless_night_eut'

  // published for the recipe script, the lang file and the smoke test
  CRYO.machine = MACHINE
  CRYO.recipeType = TYPE
  CRYO.radiator = RADIATOR
  CRYO.casing = CASING
  CRYO.pipe = PIPE
  CRYO.brick = BRICK
  CRYO.nightFactor = NIGHT_FACTOR
  // recipe data key: the night EU/t, read by the EMI line of the type
  CRYO.nightKey = NIGHT_KEY
  CRYO.dimension = 'gcyr:luna'
  CRYO.maxIO = { itemsIn: 0, itemsOut: 0, fluidsIn: 1, fluidsOut: 1 }
  CRYO.hatches = { energy: [1, 2], inputHatches: [1, 2], outputHatches: [1, 4] }

  // ---------------------------------------------------------------- pattern

  const SPEC = {
    slices: [
      // back
      ['  BBB  ', '  XXX  ', '  XXX  ', '  CCC  ', '  CCC  ', '  CCC  ', 'RRCCCRR', '  CCC  '],
      // middle: the pipe core, and a leg on its footing under the tip of each wing
      ['B BBB B', 'F XPX F', 'F XPX F', 'F CPC F', 'F CPC F', 'F CPC F', 'RRCPCRR', '  CCC  '],
      // front (controller in the lowest ring)
      ['  BBB  ', '  XSX  ', '  XXX  ', '  CCC  ', '  CCC  ', '  CCC  ', 'RRCCCRR', '  CCC  ']
    ],
    symbols: {
      S: Pat.controller(),
      // 15 cells in the two lowest rings: 3 to 8 are parts, the rest frost-proof casing
      X: Pat.oneOf(
        Pat.block(CASING, { min: 7 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 1, max: 4 })
      ),
      C: Pat.block(CASING),
      P: Pat.block(PIPE),
      B: Pat.block(BRICK),
      F: Pat.frame(['aluminium']),
      R: Pat.block(RADIATOR)
    }
  }

  // ---------------------------------------------------------------- night and sky

  // the radiator cells relative to the controller: up, back (away from the front face), side (+ = towards the column index)
  function radiatorCells() {
    var ctrl = null
    var cells = []
    SPEC.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === 'S') ctrl = { si: si, ri: ri, ci: ci }
          if (ch === 'R') cells.push({ si: si, ri: ri, ci: ci })
        }
      })
    })
    return cells.map(function (c) { return { up: c.ri - ctrl.ri, back: ctrl.si - c.si, side: c.ci - ctrl.ci } })
  }
  const CELLS = radiatorCells()
  if (CELLS.length !== 12) throw new Error('[grindless/ev] cryogenic plant: expected 12 radiator cells, found ' + CELLS.length)
  CRYO.radiatorCells = CELLS

  // horizontal step of each facing (by name: no Direction method whose script name KubeJS may have changed)
  const STEPS = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] }

  // world position of a cell: front (fx, fz) is the direction the controller faces; back = -front, +side = (fz, -fx) (the mapping of
  // lv/heliostat_tower.js; the wings are symmetric, so its sign does not matter here)
  function cellPos(pos, fx, fz, c) {
    return pos.offset(-fx * c.back + fz * c.side, c.up, -fz * c.back - fx * c.side)
  }

  // Vanilla's time-of-day curve (DimensionType#timeOfDay without a fixed time: 0 noon, 0.25 sunset, 0.5 midnight, 0.75 sunrise) passes
  // 0.25 between day time 12,785 and 12,786 and 0.75 between 23,214 and 23,215, so the sun is down from 12,786 to 23,214 of every
  // 24,000. The bounds are worked out once (with Node) and kept as integers: in this Rhino (KubeJS 2001.6.5) Math.PI is undefined, so
  // the curve itself came out NaN on the bench and the sun never set; integer comparisons leave nothing to evaluate.
  const SUNSET = 12786
  const SUNRISE = 23214
  CRYO.night = { from: SUNSET, to: SUNRISE }

  function sunIsDown(dayTime) {
    var t = Number(dayTime) % 24000
    if (t < 0) t += 24000
    return t >= SUNSET && t <= SUNRISE
  }
  CRYO.sunIsDown = sunIsDown

  // how many radiators do not see the sky (-1 when the facing is unknown)
  function coveredRadiators(machine) {
    var level = machine.getLevel()
    var step = STEPS[String(machine.getFrontFacing()).toLowerCase()]
    if (level == null || !step) return -1
    var pos = machine.getPos()
    var covered = 0
    for (var i = 0; i < CELLS.length; i++) {
      if (!level.canSeeSky(cellPos(pos, step[0], step[1], CELLS[i]).above())) covered++
    }
    return covered
  }

  // 'night' (half price), 'day' (the sun is up) or 'covered' (night, but radiators that do not see the sky)
  function skyState(machine) {
    var level = machine.getLevel()
    if (level == null) return { key: 'day', covered: 0 }
    if (!sunIsDown(Number(level.getDayTime()))) return { key: 'day', covered: 0 }
    var covered = coveredRadiators(machine)
    if (covered !== 0) return { key: 'covered', covered: covered < 0 ? CELLS.length : covered }
    return { key: 'night', covered: 0 }
  }

  var NIGHT = null
  var failed = false
  var displayFailed = false

  // the recipe modifier: half the EU/t when the run starts in the lunar night with the wings open, then GTM's standard overclock
  function coldModifier(machine, recipe) {
    try {
      var cheap = ModifierFunction.IDENTITY
      var scaled = recipe
      if (skyState(machine).key === 'night') {
        if (NIGHT === null) NIGHT = ModifierFunction.builder().eutMultiplier(NIGHT_FACTOR).build()
        cheap = NIGHT
        scaled = cheap.apply(recipe)
        if (scaled == null) return ModifierFunction.NULL
      }
      return cheap.andThen(GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, scaled))
    } catch (e) {
      if (!failed) {
        failed = true
        console.error('[grindless/ev] cryogenic plant recipe modifier failed: ' + e)
      }
      return ModifierFunction.IDENTITY
    }
  }

  // one controller line: what the sky gives the next run
  function display(controller, list) {
    try {
      if (!controller.isFormed()) return
      var state = skyState(controller)
      list.add(Text.translate('grindless.machine.cryogenic_plant.sky.' + state.key, String(state.covered)))
    } catch (e) {
      if (!displayFailed) {
        displayFailed = true
        console.error('[grindless/ev] cryogenic plant controller display failed: ' + e)
      }
    }
  }

  // One EMI line per recipe: the night price in words. Called on the client while EMI draws a recipe, with the recipe's data tag; an
  // empty string draws nothing.
  function nightInfo(data) {
    try {
      var eut = data.getInt(NIGHT_KEY)
      if (!(eut > 0)) return ''
      return String(Text.translate('gtceu.recipe.' + NIGHT_KEY, String(eut)).getString())
    } catch (e) {
      return ''
    }
  }

  // ---------------------------------------------------------------- the radiator

  StartupEvents.registry('block', function (event) {
    event.create(RADIATOR)
      .soundType('metal')
      .hardness(3)
      .resistance(6)
      .requiresTool(true)
      .tagBlock('minecraft:mineable/pickaxe')
      .textureAll('grindless:block/night_sky_radiator_side')
      .texture('up', 'grindless:block/night_sky_radiator_top')
      .texture('down', 'grindless:block/night_sky_radiator_bottom')
      .item(function (item) {
        item.tooltip(Text.gray(Text.translate('tooltip.grindless.night_sky_radiator.0')))
        item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.night_sky_radiator.1')))
      })
  })

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // fluid in: the gas; fluid out: its liquid
    event.create('cryogenic_processing')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(CRYO.maxIO.itemsIn, CRYO.maxIO.itemsOut, CRYO.maxIO.fluidsIn, CRYO.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.COOLING)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var type = GTRecipeTypes.get('cryogenic_processing')
    if (type == null) throw new Error('[grindless/ev] recipe type ' + TYPE + ' is not registered')
    type.addDataInfo(nightInfo)

    Pat.register(MACHINE, SPEC)

    event.create('cryogenic_plant', 'multiblock')
      .langValue('Cryogenic Plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('cryogenic_processing')
      .recipeModifier(coldModifier, true)
      // the night price is set when a run starts: refresh it when GTM would restart a cached run (lib/fresh_run.js, IV-B2's finding)
      .afterWorking(G.freshRun.afterWorking('cryogenic plant'))
      .appearanceBlock(GTBlocks.CASING_ALUMINIUM_FROSTPROOF)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      .allowExtendedFacing(false)
      .additionalDisplay(display)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.cryogenic_plant.tooltip.0'),
        Text.translate('grindless.machine.cryogenic_plant.tooltip.1'),
        Text.translate('grindless.machine.cryogenic_plant.tooltip.2'),
        Text.translate('grindless.machine.cryogenic_plant.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/cryogenic_plant')
  })
})()
