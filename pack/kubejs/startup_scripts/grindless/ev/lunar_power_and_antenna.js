// -----------------------------------------------------------------------------------------------
// EV family steps of the Moon base (docs/eras/ev.md, "Family steps"): the power family's lunar solar array and the observatory
// family's deep space antenna.
//
//   gtceu:lunar_solar_array    POWER, the step after LV's heliostat tower: no mirrors, no boiler, no water. 36 solar panels on
//                              titanium frame posts over sintered regolith footings, a radiator wing at the back (the coolant
//                              manifold and its fins) and a control hut of sintered regolith with the parts. A generator with no
//                              fuel (lib/generators.js): it only works by day, on the Moon (x1.4 sunlight) or on Mars (x0.43).
//   gtceu:lunar_solar          its recipe type (EU out). Two recipes (server_scripts/grindless/ev/lunar_power_and_antenna.js), one
//                              per site, each with its dimension and GTM's day condition:
//                                circuit 1, gcyr:luna   420 EU/t per panel (an Earth-equivalent 300 EU/t per panel x 1.4)
//                                circuit 2, gcyr:mars   129 EU/t per panel (300 x 0.43)
//                              The programmed circuit in the input bus picks the site recipe, as GTM's gas collector does for its
//                              air of each dimension: GTM 7.5.3's recipe lookup (RecipeDB.fromHolder) only finds a recipe through
//                              an item or fluid in an input part, so a recipe with no input at all would never run. TFG's large
//                              solar panel, the idea behind this machine, keys its recipes on circuits too. Nothing is used up.
//   The panels are the EV Tripod Drill's Solar Wing Panel (grindless:solar_wing_panel, registered by ev/tripod.js: silicon cells on
//   a titanium frame), so the Moon base makes one kind of panel for the tripod's wings and the array's field.
//
//   gtceu:deep_space_antenna   OBSERVATORY, the step after MV's radio telescope: one 7x7 titanium dish on a sintered regolith
//                              pedestal (azimuth drive, yoke, a feed horn at the focus), a cable run to a control hut of sintered
//                              regolith. On the Moon, at night (the lunar night hides the Sun's radio noise), it writes the Mars
//                              Transfer Chart (grindless:mars_chart, registered by ev/foundation.js) onto a data stick; the lunar
//                              landing-site chart calibrates the dish and is never used up.
//   gtceu:deep_space_tracking  its recipe type (EU in). One recipe, 1 920 EU/t, 600 ticks (30 s like every observation).
//
// What the array gains: power where there is no fuel at all (nothing burns on the Moon, ev.md "Moon rules"), from the light of the
// site. How much: runs = the fewest of the panels whose top sees the open sky (checked before every run, like the heliostat's sun
// check) and what the dynamo hatches carry (lib/generators.js: voltage x amperage summed per hatch). 36 lit panels on the Moon give
// 15 120 EU/t by day, 7.4 EV amps: the base runs on it by day and its surplus fills buffers or goes home through the bridge; at
// night it gives nothing (buffers, or Earth over the bridge). On Mars the same field gives 4 644 EU/t. Power from light, never
// from nothing: no light, no EU (AGENTS.md rule 8); no fuel is doubled, so its type is NOT in power/generators.js's list.
// What the antenna gains: the only source of the Mars chart, the catalyst of the tier 2 rocket parts (the route to Mars).
//
// The day rule is GTM's own (DaytimeCondition: !level.isNight(); GCYR's Moon and Mars follow the Overworld's clock), checked every
// tick while a recipe runs: at dusk the array waits and, with regressWhenWaiting(false), keeps its progress until dawn. Earth's
// weather: GCYR's planets have a sky light and share the Overworld's weather data, so a thunderstorm at home darkens their sky like
// Earth's (vanilla skyDarken); with regular rain the panels still see the sun.
//
// Patterns (lib/patterns.js: slices back -> front, rows bottom -> top), both symmetric left-right, both with a horizontal front only:
//   array    9 wide, 3 high, 7 deep
//     R sintered regolith (footings and the manifold's bed)   T titanium pipe casing (coolant manifold, the DC bus under the panels)
//     F titanium frame (fins, posts)   P solar wing panel   X control hut: sintered regolith or a part   S controller
//   antenna  7 wide, 8 high, 9 deep
//     R sintered regolith (pedestal)   G titanium gearbox (azimuth drive)   F titanium frame (yoke, dish, feed support)
//     H lightning rod (the feed horn)   T titanium pipe casing (cable run)   X control hut: sintered regolith or a part   S controller
//
// Textures: overlay dirs grindless:block/multiblock/lunar_solar_array and .../deep_space_antenna on A1's sintered regolith texture
// (the lunar casing), tools/assets/Build-LunarPowerAntennaTextures.ps1. Names / tooltips:
// client_scripts/grindless/ev_lunar_power_and_antenna_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Gen = G.generators
  const LP = G.lunarPower || (G.lunarPower = {})

  const ARRAY = 'gtceu:lunar_solar_array'
  const ANTENNA = 'gtceu:deep_space_antenna'
  const SOLAR_TYPE = 'lunar_solar'
  const ANTENNA_TYPE = 'deep_space_tracking'
  const PANEL = 'grindless:solar_wing_panel'
  const SINTERED = 'grindless:sintered_regolith'
  const SINTERED_TEXTURE = 'grindless:block/sintered_regolith'
  const FRAME = 'titanium'
  const PIPE = 'gtceu:titanium_pipe_casing'
  const GEARBOX = 'gtceu:titanium_gearbox'
  const FEED = 'minecraft:lightning_rod'
  // the recipe data keys read by the EMI lines (gtceu.recipe.grindless_sky.<value>), the same key as the observatories'
  const SKY_KEY = 'grindless_sky'
  const PANEL_EU_KEY = 'grindless_panel_eu'

  // ---------------------------------------------------------------- patterns

  const ARRAY_SPEC = {
    slices: [
      // back: the radiator wing, a coolant manifold on its bed with five fins standing on it
      ['RRRRRRRRR', 'TTTTTTTTT', 'F F F F F'],
      // four rows of nine panels on posts: frame posts at the edges, the DC bus in the middle, footings under them
      ['R   R   R', 'F   T   F', 'PPPPPPPPP'],
      ['R   R   R', 'F   T   F', 'PPPPPPPPP'],
      ['R   R   R', 'F   T   F', 'PPPPPPPPP'],
      ['R   R   R', 'F   T   F', 'PPPPPPPPP'],
      // the control hut, the DC bus coming in at the back; front: the controller
      ['  XXXXX  ', '  XXTXX  ', '         '],
      ['  XXXXX  ', '  XXSXX  ', '         ']
    ],
    symbols: {
      S: Pat.controller(),
      // 18 hut cells: 2 to 5 are parts (the circuit's input bus and 1 to 4 dynamo hatches), the rest sintered regolith
      X: Pat.oneOf(
        Pat.block(SINTERED, { min: 13 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('energy_output', { min: 1, max: 4 })
      ),
      R: Pat.block(SINTERED),
      T: Pat.block(PIPE),
      F: Pat.frame([FRAME]),
      P: Pat.block(PANEL)
    }
  }

  const ANTENNA_SPEC = {
    slices: [
      // back: the far rim of the dish
      ['       ', '       ', '       ', '       ', '       ', '       ', 'FFFFFFF', '       '],
      ['       ', '       ', '       ', '       ', '       ', ' FFFFF ', 'F     F', '       '],
      // the pedestal under the dish: footing, azimuth drive, yoke, the bowl, the feed support and the feed horn at the focus
      ['  RRR  ', '  RRR  ', '       ', '       ', '  FFF  ', ' F   F ', 'F     F', '       '],
      ['  RRR  ', '  RRR  ', '   G   ', '   F   ', '  FFF  ', ' F F F ', 'F  F  F', '   H   '],
      ['  RRR  ', '  RRR  ', '       ', '       ', '  FFF  ', ' F   F ', 'F     F', '       '],
      // the cable run from the pedestal to the hut, under the near half of the dish
      ['   T   ', '       ', '       ', '       ', '       ', ' FFFFF ', 'F     F', '       '],
      ['   T   ', '       ', '       ', '       ', '       ', '       ', 'FFFFFFF', '       '],
      // the control hut; front: the controller
      [' XXXXX ', ' XXXXX ', '       ', '       ', '       ', '       ', '       ', '       '],
      [' XXXXX ', ' XXSXX ', '       ', '       ', '       ', '       ', '       ', '       ']
    ],
    symbols: {
      S: Pat.controller(),
      // 19 hut cells: 3 or 4 are parts, the rest sintered regolith
      X: Pat.oneOf(
        Pat.block(SINTERED, { min: 15 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { exact: 1 })
      ),
      R: Pat.block(SINTERED),
      G: Pat.block(GEARBOX),
      F: Pat.frame([FRAME]),
      H: Pat.block(FEED),
      T: Pat.block(PIPE)
    }
  }

  // ---------------------------------------------------------------- the sky over the panels

  // every panel cell relative to the controller: up, back (away from the front face) and side (+ = towards the column index)
  function relativeCells(spec, ch) {
    var ctrl = null
    var cells = []
    spec.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var c = row.charAt(ci)
          if (spec.symbols[c] && spec.symbols[c].kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          if (c === ch) cells.push({ si: si, ri: ri, ci: ci })
        }
      })
    })
    return cells.map(function (c) { return { up: c.ri - ctrl.ri, back: ctrl.si - c.si, side: c.ci - ctrl.ci } })
  }

  const PANEL_CELLS = relativeCells(ARRAY_SPEC, 'P')
  const PANELS = PANEL_CELLS.length
  if (PANELS !== 36) throw new Error('[grindless/ev] lunar solar array: expected 36 panel cells, found ' + PANELS)

  // horizontal step of each facing (by name: no Direction method whose script name KubeJS may have changed)
  const STEPS = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] }

  // world position of a cell: front (fx, fz) is the direction the controller faces; back = -front, +side = counter-clockwise of
  // front = (fz, -fx) (the mapping of the heliostat tower's sun check and of the structure placement in the tests)
  function cellPos(pos, fx, fz, p) {
    return pos.offset(-fx * p.back + fz * p.side, p.up, -fz * p.back - fx * p.side)
  }

  var skyFailed = false

  // how many panels have the open sky over them (0 when the machine has no level or no horizontal facing)
  function litPanels(machine) {
    try {
      var level = machine.getLevel()
      if (level == null) return 0
      var step = STEPS[String(machine.getFrontFacing()).toLowerCase()]
      if (!step) return 0
      var pos = machine.getPos()
      var lit = 0
      for (var i = 0; i < PANEL_CELLS.length; i++) {
        if (level.canSeeSky(cellPos(pos, step[0], step[1], PANEL_CELLS[i]).above())) lit++
      }
      return lit
    } catch (e) {
      if (!skyFailed) {
        skyFailed = true
        console.error('[grindless/ev] lunar solar array sky check failed: ' + e)
      }
      return 0
    }
  }

  // ---------------------------------------------------------------- published for the recipe script and the smoke test

  LP.array = {
    machine: ARRAY,
    type: 'gtceu:' + SOLAR_TYPE,
    panel: PANEL,
    panels: PANELS,
    panelCells: PANEL_CELLS,
    // EU/t per lit panel; the Earth-equivalent base times the site's sunlight (ev.md: Moon x1.4, Mars x0.43)
    baseEuPerPanel: 300,
    sites: {
      moon: { dimension: 'gcyr:luna', circuit: 1, light: 1.4, euPerPanel: 420, recipe: 'grindless:lunar_solar/moon' },
      mars: { dimension: 'gcyr:mars', circuit: 2, light: 0.43, euPerPanel: 129, recipe: 'grindless:lunar_solar/mars' }
    },
    duration: 20,
    skyKey: SKY_KEY,
    panelEuKey: PANEL_EU_KEY,
    litPanels: litPanels,
    parts: { input_bus: { exact: 1 }, energy_output: { min: 1, max: 4 } }
  }
  LP.antenna = {
    machine: ANTENNA,
    type: 'gtceu:' + ANTENNA_TYPE,
    recipe: 'grindless:deep_space_tracking/mars_chart',
    eut: 1920,
    duration: 600,
    parts: { energy_input: { min: 1, max: 2 }, input_bus: { exact: 1 }, output_bus: { exact: 1 } }
  }

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // no fuel: the programmed circuit picks the site; EU out
    event.create(SOLAR_TYPE)
      .category('multiblock')
      .setEUIO('out')
      .setMaxIOSize(1, 0, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)

    // in: the landing-site chart (not consumed) + a data stick; out: the Mars chart
    event.create(ANTENNA_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(2, 1, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.SCIENCE)
  })

  // One EMI line per recipe, read from its data (the observatories' approach): the sky rule in words and, for the array, the power of
  // a whole field. Called on the client while EMI draws a recipe; an empty string draws nothing.
  function skyInfo(data) {
    try {
      var sky = data.getString(SKY_KEY)
      if (!sky) return ''
      var perPanel = data.getInt(PANEL_EU_KEY)
      if (perPanel > 0) {
        return String(Text.translate('gtceu.recipe.' + SKY_KEY + '.' + sky, String(perPanel), String(PANELS),
          String(perPanel * PANELS)).getString())
      }
      return String(Text.translate('gtceu.recipe.' + SKY_KEY + '.' + sky).getString())
    } catch (e) {
      return ''
    }
  }

  // ---------------------------------------------------------------- the array's modifier and controller lines

  const genOpts = { maxParallels: litPanels, name: 'lunar_solar_array' }
  const genModifier = Gen.modifier(genOpts)
  const genDisplay = Gen.display(genOpts)
  var noSky = null
  var displayFailed = false

  // before every run (alwaysTryModifyRecipe): no lit panel, no run (with the reason in the controller); otherwise lib/generators.js's
  // modifier runs one copy per lit panel, limited by the dynamo hatches
  function arrayModifier(machine, recipe) {
    if (litPanels(machine) < 1) {
      if (noSky === null) noSky = ModifierFunction.cancel(Text.translate('grindless.machine.lunar_solar_array.no_sky'))
      return noSky
    }
    return genModifier(machine, recipe)
  }

  function arrayDisplay(controller, list) {
    genDisplay(controller, list)
    try {
      if (!controller.isFormed()) return
      list.add(Text.translate('grindless.machine.lunar_solar_array.panels', String(litPanels(controller)), String(PANELS)))
      if (!controller.getRecipeLogic().isActive()) list.add(Text.translate('grindless.machine.lunar_solar_array.hint'))
    } catch (e) {
      if (!displayFailed) {
        displayFailed = true
        console.error('[grindless/ev] lunar solar array controller display failed: ' + e)
      }
    }
  }

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    ;[SOLAR_TYPE, ANTENNA_TYPE].forEach(function (name) {
      var type = GTRecipeTypes.get(name)
      if (type == null) throw new Error('[grindless/ev] recipe type gtceu:' + name + ' is not registered')
      type.addDataInfo(skyInfo)
    })

    Pat.register(ARRAY, ARRAY_SPEC)
    Pat.register(ANTENNA, ANTENNA_SPEC)

    // a generator through lib/generators.js's pieces: generator(true), no regress (a waiting run never pays twice), its modifier
    // behind the sky check, its controller lines plus the panel count
    event.create('lunar_solar_array', 'multiblock')
      .langValue('Lunar Solar Array')
      .rotationState(RotationState.NON_Y_AXIS)
      .generator(true)
      .regressWhenWaiting(false)
      .recipeType(SOLAR_TYPE)
      .recipeModifier(arrayModifier, true)
      .additionalDisplay(arrayDisplay)
      .appearanceBlock(function () { return Block.getBlock(SINTERED) })
      .pattern(function (def) { return Pat.build(def, ARRAY_SPEC) })
      .allowExtendedFacing(false)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.lunar_solar_array.tooltip.0'),
        Text.translate('grindless.machine.lunar_solar_array.tooltip.1'),
        Text.translate('grindless.machine.lunar_solar_array.tooltip.2'),
        Text.translate('grindless.machine.lunar_solar_array.tooltip.3')
      ])
      .workableCasingModel(SINTERED_TEXTURE, 'grindless:block/multiblock/lunar_solar_array')

    event.create('deep_space_antenna', 'multiblock')
      .langValue('Deep Space Antenna')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(ANTENNA_TYPE)
      .regressWhenWaiting(false)
      .appearanceBlock(function () { return Block.getBlock(SINTERED) })
      .pattern(function (def) { return Pat.build(def, ANTENNA_SPEC) })
      .allowExtendedFacing(false)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.deep_space_antenna.tooltip.0'),
        Text.translate('grindless.machine.deep_space_antenna.tooltip.1'),
        Text.translate('grindless.machine.deep_space_antenna.tooltip.2'),
        Text.translate('grindless.machine.deep_space_antenna.tooltip.3')
      ])
      .workableCasingModel(SINTERED_TEXTURE, 'grindless:block/multiblock/deep_space_antenna')
  })
})()
