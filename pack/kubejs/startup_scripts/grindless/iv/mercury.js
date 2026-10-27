// priority: -2900
// -----------------------------------------------------------------------------------------------
// IV on Mercury (docs/eras/iv.md: "Venus and Mercury", "Family steps", "Mercury solar works"; package IV-B2): four multiblocks of ours,
// all on GCYR's Mercury (gcyr:mercury), which keeps the Overworld's clock: a 24,000-tick day and night (night 12,541 to 23,459,
// Level#isNight). Every pattern goes through global.grindless.patterns (lib/patterns.js).
//
//   gtceu:mercury_vein_drill    VEIN DRILL FAMILY, IV step. A low-profile drill under a sunshade of Hermean heat-shield bricks on four
//                               tungsten steel posts, with night-sky radiators hanging under the shade's edges. It runs gtceu:vein_drilling
//                               like every drill of the family, but only its own recipes: vein_drilling/iv/mercury_* (server script),
//                               generated from global.grindless.ivFoundation.mercuryVeins() (the iridosmine vein). Speed is `bores`
//                               (global.grindless.lv.bores) with a cap of 128 runs; one tungsten steel bit per run in the bus.
//                                 by day    only with liquid nitrogen (10 mB a run): Mercury's sun would burn a dry bit out
//                                 at night  dry: the bit wears twice as fast, and the liquid nitrogen in the hatch is kept for the day
//                               The shift is read when a run starts (the recipe modifier runs again before every run, and every start
//                               goes through it, see freshEveryRun below): a run is never stopped halfway by dawn or dusk, as a recipe
//                               condition would do (GTM checks those every tick).
//   gtceu:mercury_solar_works   Mercury's site workshop, type gtceu:solar_processing: 8 heliostat mirrors on tungsten steel posts behind
//                               a 3x3x3 focal furnace of robust tungsten steel casing (its top is a tungsten steel firebox receiver that
//                               glows while it works), and a 3x3 laminated glass evaporation bell beside it, on a pad of Mercury rock.
//                               It makes the heat-shield bricks, so it cannot stand on them: the pad is GCYR's Mercury rock (smelted
//                               Mercury cobblestone). The bell may stand on either side: GTM forms a mirrored build too, and the sky
//                               checks follow its flip. Sun rule: a run that starts with the sun on the receiver (GTM's own solar test,
//                               GTUtil.canSeeSunClearly) and all 8 mirrors under open sky pays a quarter of the EU/t; at night or shaded
//                               it pays all of it. The quarter is applied after GTM's overclock, so the sun makes a run cheaper, never
//                               faster (the cryogenic plant's run-start pricing, alwaysTryModifyRecipe; and, unlike there, every run goes
//                               through the modifier, see freshEveryRun below). A recipe with fluid outputs does not run while the
//                               controller voids fluids (lib/no_voiding.js, in the modifier and in beforeWorking): the iridosmine
//                               fusion's osmium tetroxide stays contained.
//   gtceu:mercury_solar_field   POWER FAMILY, IV step (after LV's heliostat tower and EV's lunar solar array): 36 Hermean thin-film
//                               panels (the solar works makes them, iv.md decision 8) on tungsten steel posts over brick footings, a
//                               radiator bank at the back and a control hut under a brick sunshade. A generator (lib/generators.js) of
//                               type gtceu:mercury_solar: by day, 2,010 EU/t per panel under open sky (300 Earth-equivalent x 6.7,
//                               Mercury's sunlight); at night nothing. Its own type, so the lunar array never runs on Mercury's sun.
//   gtceu:interferometer        OBSERVATORY FAMILY, step 5 (after the EV deep space antenna): three 5x5 tungsten steel dishes on brick
//                               pedestals with tungsten steel azimuth drives, joined by a cable run to a correlator hut of bricks. Type
//                               gtceu:interferometry, at night on Mercury: it adds its half to a Lunar VLBI Recording (written by the
//                               Deep Space Antenna at night on the Moon) and writes the Outer System Chart (calibrated by the Inner
//                               Planets Chart) or, calibrated by the Outer System Chart, the first Sagittarius A* signal.
//
//   Items (grindless:): lunar_vlbi_recording, outer_system_chart, sagittarius_a_star_signal (data orbs; names and tooltips in
//   client_scripts/grindless/iv_mercury_lang.js). The tungsten steel bit is startup_scripts/grindless/iv/tungsten_steel_drill_bit.js.
//
// Published for the server script, the lang file and the test: global.grindless.mercury.
// Textures: overlay dirs grindless:block/multiblock/<machine> (tools/assets/Build-IVMercuryTextures.ps1) on A1's brick
// (grindless:block/hermean_heat_shield_brick) for the drill, the field and the interferometer, on GTM's robust tungsten steel casing for
// the solar works.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Gen = G.generators
  const M = G.mercury || (G.mercury = {})
  const LOG = '[grindless/iv] '

  const MERCURY = 'gcyr:mercury'
  const BRICK = 'grindless:hermean_heat_shield_brick'
  const BRICK_TEXTURE = 'grindless:block/hermean_heat_shield_brick'
  const PANEL = 'grindless:hermean_thin_film_panel'
  const RADIATOR = 'grindless:night_sky_radiator'
  const MIRROR = 'grindless:heliostat_mirror'
  const ROCK = 'gcyr:mercury_rock'
  const ROBUST = 'gtceu:robust_machine_casing'
  const ROBUST_TEXTURE = 'gtceu:block/casings/solid/machine_casing_robust_tungstensteel'
  const FIREBOX = 'gtceu:tungstensteel_firebox_casing'
  const GLASS = 'gtceu:laminated_glass'
  const PIPE = 'gtceu:tungstensteel_pipe_casing'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'
  const FEED = 'minecraft:lightning_rod'
  const FRAME = 'tungsten_steel'

  const DRILL = 'gtceu:mercury_vein_drill'
  const WORKS = 'gtceu:mercury_solar_works'
  const FIELD = 'gtceu:mercury_solar_field'
  const INTERFEROMETER = 'gtceu:interferometer'
  const WORKS_TYPE = 'solar_processing'
  const FIELD_TYPE = 'mercury_solar'
  const INTERFEROMETER_TYPE = 'interferometry'

  // recipe data keys read by the EMI lines (the observatories' grindless_sky, and two of ours)
  const SKY_KEY = 'grindless_sky'
  const PANEL_EU_KEY = 'grindless_panel_eu'
  const SUN_KEY = 'grindless_sun_eut'
  const SHIFT_KEY = 'grindless_mercury_shift'

  const NO_VOIDING = 'grindless.machine.mercury_solar_works.no_voiding'

  // ---------------------------------------------------------------- patterns (lib/patterns.js: slices back -> front, rows bottom -> top)

  //   B heat-shield bricks (footings, collar, sunshade)   F tungsten steel frame (posts)   P tungsten steel pipe casing (drill string, mast)
  //   N night-sky radiator   X body: bricks or a part   S controller
  const DRILL_SPEC = {
    slices: [
      // back: the two back posts on their footings, the sunshade
      ['B     B', 'F     F', 'F     F', 'F     F', 'BBBBBBB'],
      // the radiators hang under the shade's edges, between the posts
      ['       ', '       ', '       ', 'N     N', 'BBBBBBB'],
      // the body's back row on the collar
      ['  BBB  ', '  XXX  ', '  XXX  ', 'N     N', 'BBBBBBB'],
      // the drill string from the collar up through the body and the shade
      ['  BPB  ', '  XPX  ', '  XPX  ', 'N  P  N', 'BBBPBBB'],
      // front: the front posts, the collar and the body with the controller
      ['B BBB B', 'F XSX F', 'F XXX F', 'F     F', 'BBBBBBB']
    ],
    symbols: {
      S: Pat.controller(),
      // 15 body cells: 4 to 6 are parts (energy, the bus for the sample and the bits, one or two output buses, the liquid nitrogen
      // hatch), the rest bricks. ME buses and hatches have the same abilities, so they fit too.
      X: Pat.oneOf(
        Pat.block(BRICK, { min: 9 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { exact: 1 })
      ),
      B: Pat.block(BRICK),
      F: Pat.frame([FRAME]),
      P: Pat.block(PIPE),
      N: Pat.block(RADIATOR)
    }
  }

  //   M heliostat mirror   F tungsten steel frame (mirror posts, the substrate holder in the bell)   D Mercury rock (the pad)
  //   X focal furnace: robust tungsten steel casing or a part   C tungsten steel firebox (the receiver)   G laminated glass (the bell)
  const WORKS_SPEC = {
    slices: [
      // back: four heliostat mirrors on posts
      [' F F F F ', ' M M M M ', '         ', '         '],
      ['         ', '         ', '         ', '         '],
      // the second row of mirrors
      [' F F F F ', ' M M M M ', '         ', '         '],
      // the light path
      ['         ', '         ', '         ', '         '],
      // the furnace (left) and the bell (right) on the pad; the receiver on top of the furnace, the substrate holder in the bell
      [' DDDDDDD ', ' XXX GGG ', ' XXX GGG ', ' CCC     '],
      [' DDDDDDD ', ' XXX GFG ', ' XXX GGG ', ' CCC     '],
      // front: the controller in the furnace's front face
      [' DDDDDDD ', ' XSX GGG ', ' XXX GGG ', ' CCC     ']
    ],
    symbols: {
      S: Pat.controller(),
      // 17 furnace cells: 3 to 9 are parts (energy, input buses, output buses, the salt water hatch, the steam and osmium
      // tetroxide hatches), the rest robust tungsten steel casing
      X: Pat.oneOf(
        Pat.block(ROBUST, { min: 8 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { max: 1 }),
        Pat.part('output_hatch', { max: 2 })
      ),
      M: Pat.block(MIRROR),
      F: Pat.frame([FRAME]),
      D: Pat.block(ROCK),
      C: Pat.block(FIREBOX),
      G: Pat.block(GLASS)
    }
  }

  //   B heat-shield bricks (the manifold's bed, the footings, the hut's sunshade)   T tungsten steel pipe casing (manifold, DC bus)
  //   N night-sky radiator (fins)   F tungsten steel frame (posts)   P Hermean thin-film panel   X control hut: bricks or a part
  const FIELD_SPEC = {
    slices: [
      // back: the radiator bank, a coolant manifold on its bed with five radiator fins standing on it
      ['BBBBBBBBB', 'TTTTTTTTT', 'N N N N N'],
      // four rows of nine panels on posts: frame posts at the edges, the DC bus in the middle, footings under them
      ['B   B   B', 'F   T   F', 'PPPPPPPPP'],
      ['B   B   B', 'F   T   F', 'PPPPPPPPP'],
      ['B   B   B', 'F   T   F', 'PPPPPPPPP'],
      ['B   B   B', 'F   T   F', 'PPPPPPPPP'],
      // the control hut under its sunshade, the DC bus coming in at the back; front: the controller
      ['  XXXXX  ', '  XXTXX  ', ' BBBBBBB '],
      ['  XXXXX  ', '  XXSXX  ', ' BBBBBBB ']
    ],
    symbols: {
      S: Pat.controller(),
      // 18 hut cells: 2 to 5 are parts (the circuit's input bus and 1 to 4 dynamo hatches), the rest bricks
      X: Pat.oneOf(
        Pat.block(BRICK, { min: 13 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('energy_output', { min: 1, max: 4 })
      ),
      B: Pat.block(BRICK),
      T: Pat.block(PIPE),
      N: Pat.block(RADIATOR),
      F: Pat.frame([FRAME]),
      P: Pat.block(PANEL)
    }
  }

  //   three dishes, each: B brick pedestal, G tungsten steel gearbox (azimuth drive), F a 3x3 bowl and a 5x5 rim of tungsten steel
  //   frames with the feed support in the middle, H lightning rod (the feed horn); T tungsten steel pipe casing (the cable run);
  //   X correlator hut: bricks or a part; S controller
  const INTERFEROMETER_SPEC = {
    slices: [
      // back: the far rims
      ['                 ', '                 ', '                 ', 'FFFFF FFFFF FFFFF', '                 '],
      ['                 ', '                 ', ' FFF   FFF   FFF ', 'F   F F   F F   F', '                 '],
      // the middle of each dish: pedestal, drive, bowl, rim and feed support, feed horn
      ['  B     B     B  ', '  G     G     G  ', ' FFF   FFF   FFF ', 'F F F F F F F F F', '  H     H     H  '],
      ['  T     T     T  ', '                 ', ' FFF   FFF   FFF ', 'F   F F   F F   F', '                 '],
      // the near rims, the cables running forward under them
      ['  T     T     T  ', '                 ', '                 ', 'FFFFF FFFFF FFFFF', '                 '],
      // the cable run along the front of the dishes
      ['  TTTTTTTTTTTTT  ', '                 ', '                 ', '                 ', '                 '],
      // the correlator hut, the cable run coming in at the back; front: the controller
      ['      XXTXX      ', '      XXXXX      ', '                 ', '                 ', '                 '],
      ['      XXXXX      ', '      XXSXX      ', '                 ', '                 ', '                 ']
    ],
    symbols: {
      S: Pat.controller(),
      // 18 hut cells: 3 or 4 are parts, the rest bricks
      X: Pat.oneOf(
        Pat.block(BRICK, { min: 14 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { exact: 1 })
      ),
      B: Pat.block(BRICK),
      G: Pat.block(GEARBOX),
      F: Pat.frame([FRAME]),
      H: Pat.block(FEED),
      T: Pat.block(PIPE)
    }
  }

  // ---------------------------------------------------------------- geometry (the sky checks)

  // every cell of a symbol relative to the controller: up, back (away from the front face) and side (+ = towards the column index)
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

  // horizontal step of each facing (by name: no Direction method whose script name KubeJS may have changed)
  const STEPS = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] }

  // world position of a cell: front (fx, fz) is the direction the controller faces; back = -front, +side = (fz, -fx) (the mapping of
  // the heliostat tower's sun check, the lunar array's sky count and the structure placement of the tests). A mirrored build (GTM lets
  // every multiblock form flipped: BlockPattern negates the axis across the facing) has its cells on the other side: sign -1.
  function cellPos(pos, fx, fz, p, sign) {
    var side = p.side * (sign === -1 ? -1 : 1)
    return pos.offset(-fx * p.back + fz * side, p.up, -fz * p.back - fx * side)
  }

  function sideSign(machine) {
    try {
      return machine.isFlipped() === true ? -1 : 1
    } catch (e) {
      return 1
    }
  }

  // how many of the cells have the open sky above them (-1 when the machine has no level or no horizontal facing)
  function cellsUnderSky(machine, cells) {
    var level = machine.getLevel()
    if (level == null) return -1
    var step = STEPS[String(machine.getFrontFacing()).toLowerCase()]
    if (!step) return -1
    var pos = machine.getPos()
    var sign = sideSign(machine)
    var lit = 0
    for (var i = 0; i < cells.length; i++) {
      if (level.canSeeSky(cellPos(pos, step[0], step[1], cells[i], sign).above())) lit++
    }
    return lit
  }

  // GTM's day test (DaytimeCondition: !Level#isNight()); Mercury follows the Overworld's clock and is kept dry (space/airless_weather.js)
  function isNight(level) {
    return level != null && level.isNight() === true
  }

  var LC = null
  function lazy() {
    if (LC === null) {
      LC = {
        IO: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO'),
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        GTUtil: Java.loadClass('com.gregtechceu.gtceu.utils.GTUtil'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        ContentModifier: Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.ContentModifier')
      }
    }
    return LC
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

  // GTM 7.5.3 keeps an idle machine's last recipe for one tick and restarts it without its modifier if it can run then
  // (RecipeLogic#findAndHandleRecipe: "try to execute last recipe if possible"): the shift or the price of the tick before. Across a jump
  // of the clock, or a sunset in that very tick, a dry run could start by day or a night run at the sun's price. So when a run ends and
  // the next one may not start at once, the logic is marked dirty and the next start is a fresh search through the modifier. afterWorking
  // runs before GTM puts this run's outputs away, so the check is GTM's own match on a copy of the run with its outputs doubled: inputs
  // for one more run, room for this run's outputs and the next one's (a copy, because the match writes the recipe's bus group). A machine
  // that keeps running is not touched: GTM re-applies the modifier when each run ends (alwaysTryModifyRecipe). Used by the drill and the
  // solar works (afterWorking).
  var dirtyFailed = false
  var DOUBLE_OUTPUTS = null
  function freshEveryRun(machine) {
    try {
      var logic = machine.getRecipeLogic()
      var last = logic.getLastRecipe()
      if (last != null) {
        if (DOUBLE_OUTPUTS === null) DOUBLE_OUTPUTS = ModifierFunction.builder().outputModifier(lazy().ContentModifier.multiplier(2)).build()
        var probe = DOUBLE_OUTPUTS.apply(last)
        if (probe != null && lazy().RecipeHelper.matchRecipe(machine, probe).isSuccess()) return
      }
      logic.markLastRecipeDirty()
    } catch (e) {
      if (!dirtyFailed) {
        dirtyFailed = true
        console.error(LOG + 'could not mark a Mercury machine\'s last recipe dirty: ' + e)
      }
    }
  }
  M.freshEveryRun = freshEveryRun

  // ---------------------------------------------------------------- the drill

  const DRILL_TIER = 'iv'
  const DRILL_PREFIX = 'vein_drilling/iv/mercury_'
  const DRILL_CAP = 128
  const COOLANT = 'gtceu:liquid_nitrogen'
  const COOLANT_PER_RUN = 10
  const COOLED_SUFFIX = '_cryo'

  function recipePath(recipe) {
    return String(recipe.id.getPath())
  }

  // the Mercury drill's own recipes: vein_drilling/iv/mercury_<vein>_tungsten_steel[_cryo]
  function isMercuryRecipe(recipe) {
    return recipePath(recipe).indexOf(DRILL_PREFIX) === 0
  }

  function isCooledRecipe(recipe) {
    var path = recipePath(recipe)
    return path.slice(-COOLED_SUFFIX.length) === COOLED_SUFFIX
  }

  M.drill = {
    machine: DRILL,
    tier: DRILL_TIER,
    prefix: DRILL_PREFIX,
    cap: DRILL_CAP,
    coolant: COOLANT,
    coolantPerRun: COOLANT_PER_RUN,
    cooledSuffix: COOLED_SUFFIX,
    shiftKey: SHIFT_KEY,
    // the tungsten steel bit: chance of 10,000 that a run uses it up (day with liquid nitrogen / night dry), raw ores per run
    bit: { item: 'grindless:tungsten_steel_drill_bit', dayWear: 25, nightWear: 50, perRun: 5.625 },
    eut: 8,
    duration: 200,
    isNight: isNight,
    isMercuryRecipe: isMercuryRecipe,
    isCooledRecipe: isCooledRecipe,
    fluidAmount: fluidAmount,
    parts: { energy_input: { min: 1, max: 2 }, input_bus: { exact: 1 }, output_bus: { min: 1, max: 2 }, input_hatch: { exact: 1 } }
  }

  var needsNitrogen = null
  var keepsNitrogen = null
  var drillFailed = false

  // ---------------------------------------------------------------- the solar works

  const SUN_FACTOR = 0.25
  const MIRROR_CELLS = relativeCells(WORKS_SPEC, 'M')
  if (MIRROR_CELLS.length !== 8) throw new Error(LOG + 'mercury solar works: expected 8 mirror cells, found ' + MIRROR_CELLS.length)
  // the receiver's middle cell (the top of the focal furnace): GTM's solar test runs on it
  const RECEIVER_CELL = (function () {
    var cells = relativeCells(WORKS_SPEC, 'C')
    var top = cells.reduce(function (a, b) { return b.up > a.up ? b : a }, cells[0])
    var mid = cells.filter(function (c) { return c.up === top.up && c.back === 1 && c.side === 0 })[0]
    if (!mid) throw new Error(LOG + 'mercury solar works: no receiver cell above the furnace middle')
    return mid
  })()

  // 'sun' (a quarter of the EU/t), 'night' or 'shaded' (the receiver or n mirrors do not see the sky)
  function sunState(machine) {
    var level = machine.getLevel()
    if (level == null) return { key: 'night', covered: 0 }
    if (isNight(level)) return { key: 'night', covered: 0 }
    var step = STEPS[String(machine.getFrontFacing()).toLowerCase()]
    if (!step) return { key: 'shaded', covered: MIRROR_CELLS.length + 1 }
    var pos = machine.getPos()
    var covered = 0
    if (!lazy().GTUtil.canSeeSunClearly(level, cellPos(pos, step[0], step[1], RECEIVER_CELL, sideSign(machine)))) covered++
    var lit = cellsUnderSky(machine, MIRROR_CELLS)
    covered += lit < 0 ? MIRROR_CELLS.length : MIRROR_CELLS.length - lit
    return covered === 0 ? { key: 'sun', covered: 0 } : { key: 'shaded', covered: covered }
  }

  M.works = {
    machine: WORKS,
    type: 'gtceu:' + WORKS_TYPE,
    sunFactor: SUN_FACTOR,
    sunKey: SUN_KEY,
    mirrorCells: MIRROR_CELLS,
    receiverCell: RECEIVER_CELL,
    sunState: sunState,
    noVoiding: NO_VOIDING,
    maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 1, fluidsOut: 2 },
    parts: { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 }, input_hatch: { max: 1 }, output_hatch: { max: 2 } }
  }

  var SUN = null
  var worksFailed = false

  // the works keeps what it makes: while the controller voids fluids, a recipe with fluid outputs (the fusion's osmium tetroxide and steam)
  // does not run (lib/no_voiding.js, in the modifier and before every start); the bricks and the panels make no fluid and are not held up
  const KEEP = { which: 'fluids', reason: NO_VOIDING, name: 'Mercury solar works' }

  function hasFluidOutputs(recipe) {
    try {
      var outs = recipe.getOutputContents(lazy().FluidCap)
      return outs != null && outs.size() > 0
    } catch (e) {
      return true
    }
  }

  // ---------------------------------------------------------------- the solar field

  const PANEL_CELLS = relativeCells(FIELD_SPEC, 'P')
  const PANELS = PANEL_CELLS.length
  if (PANELS !== 36) throw new Error(LOG + 'mercury solar field: expected 36 panel cells, found ' + PANELS)

  var fieldSkyFailed = false

  function litPanels(machine) {
    try {
      var lit = cellsUnderSky(machine, PANEL_CELLS)
      return lit < 0 ? 0 : lit
    } catch (e) {
      if (!fieldSkyFailed) {
        fieldSkyFailed = true
        console.error(LOG + 'mercury solar field sky check failed: ' + e)
      }
      return 0
    }
  }

  M.field = {
    machine: FIELD,
    type: 'gtceu:' + FIELD_TYPE,
    panel: PANEL,
    panels: PANELS,
    panelCells: PANEL_CELLS,
    // EU/t per lit panel: the Earth-equivalent 300 EU/t of the lunar array times Mercury's sunlight (iv.md: x6.7)
    baseEuPerPanel: 300,
    light: 6.7,
    euPerPanel: 2010,
    circuit: 1,
    duration: 20,
    recipe: 'grindless:mercury_solar/mercury',
    skyKey: SKY_KEY,
    panelEuKey: PANEL_EU_KEY,
    litPanels: litPanels,
    parts: { input_bus: { exact: 1 }, energy_output: { min: 1, max: 4 } }
  }

  // ---------------------------------------------------------------- the interferometer

  M.interferometer = {
    machine: INTERFEROMETER,
    type: 'gtceu:' + INTERFEROMETER_TYPE,
    eut: 7680,
    duration: 600,
    skyKey: SKY_KEY,
    parts: { energy_input: { min: 1, max: 2 }, input_bus: { exact: 1 }, output_bus: { exact: 1 } }
  }

  M.items = {
    recording: 'grindless:lunar_vlbi_recording',
    outerChart: 'grindless:outer_system_chart',
    sgrSignal: 'grindless:sagittarius_a_star_signal'
  }
  M.dimension = MERCURY
  M.brick = BRICK
  M.structures = { drill: DRILL, works: WORKS, field: FIELD, interferometer: INTERFEROMETER }

  // ---------------------------------------------------------------- items

  // the three data orbs; one description line each, plus one for how it is made and used
  const ITEMS = ['lunar_vlbi_recording', 'outer_system_chart', 'sagittarius_a_star_signal']

  StartupEvents.registry('item', function (event) {
    ITEMS.forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(16)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // sintering, thin-film panels and the iridosmine fusion: up to 4 items in, 1 out, 1 fluid in, 2 out
    event.create(WORKS_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(M.works.maxIO.itemsIn, M.works.maxIO.itemsOut, M.works.maxIO.fluidsIn, M.works.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)

    // no fuel: the programmed circuit is the only input (GTM's lookup needs one); EU out
    event.create(FIELD_TYPE)
      .category('multiblock')
      .setEUIO('out')
      .setMaxIOSize(1, 0, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)

    // in: the calibrating chart (not consumed) + the lunar recording; out: the chart or the signal
    event.create(INTERFEROMETER_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(2, 1, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.SCIENCE)
  })

  // ---------------------------------------------------------------- EMI lines (read from the recipe data; '' draws nothing)

  function sunInfo(data) {
    try {
      var eut = data.getInt(SUN_KEY)
      if (!(eut > 0)) return ''
      return String(Text.translate('gtceu.recipe.' + SUN_KEY, String(eut)).getString())
    } catch (e) {
      return ''
    }
  }

  function skyInfo(data) {
    try {
      var sky = data.getString(SKY_KEY)
      if (!sky) return ''
      var perPanel = data.getInt(PANEL_EU_KEY)
      if (perPanel > 0) {
        return String(Text.translate('gtceu.recipe.' + SKY_KEY + '.' + sky, String(perPanel), String(PANELS), String(perPanel * PANELS)).getString())
      }
      return String(Text.translate('gtceu.recipe.' + SKY_KEY + '.' + sky).getString())
    } catch (e) {
      return ''
    }
  }

  function shiftInfo(data) {
    try {
      var shift = data.getString(SHIFT_KEY)
      if (!shift) return ''
      return String(Text.translate('gtceu.recipe.' + SHIFT_KEY + '.' + shift).getString())
    } catch (e) {
      return ''
    }
  }

  // ---------------------------------------------------------------- controller lines

  var displayFailed = {}
  function guarded(name, fn) {
    return function (controller, list) {
      try {
        if (!controller.isFormed()) return
        fn(controller, list)
      } catch (e) {
        if (!displayFailed[name]) {
          displayFailed[name] = true
          console.error(LOG + name + ' controller display failed: ' + e)
        }
      }
    }
  }

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var lv = G.lv
    var rules = lv.rules

    var worksType = GTRecipeTypes.get(WORKS_TYPE)
    var fieldType = GTRecipeTypes.get(FIELD_TYPE)
    var interferometerType = GTRecipeTypes.get(INTERFEROMETER_TYPE)
    var drillingType = GTRecipeTypes.get('vein_drilling')
    if (worksType == null || fieldType == null || interferometerType == null || drillingType == null) {
      throw new Error(LOG + 'a recipe type of the Mercury machines is not registered')
    }
    worksType.addDataInfo(sunInfo)
    fieldType.addDataInfo(skyInfo)
    interferometerType.addDataInfo(skyInfo)
    drillingType.addDataInfo(shiftInfo)

    // ---- the drill: only its own recipes; by day the cooled ones, at night the dry ones; then bores (cap 128) and GTM's overclock
    var drill = lv.bores(null, DRILL_CAP)

    function drillModifier(machine, recipe) {
      try {
        if (rules.recipeTier(recipe) !== DRILL_TIER || !isMercuryRecipe(recipe)) return ModifierFunction.NULL
        var night = isNight(machine.getLevel())
        var cooled = isCooledRecipe(recipe)
        if (!night && !cooled) {
          if (needsNitrogen === null) needsNitrogen = ModifierFunction.cancel(Text.translate('grindless.machine.mercury_vein_drill.needs_nitrogen'))
          return needsNitrogen
        }
        if (night && cooled) {
          if (keepsNitrogen === null) keepsNitrogen = ModifierFunction.cancel(Text.translate('grindless.machine.mercury_vein_drill.keeps_nitrogen'))
          return keepsNitrogen
        }
      } catch (e) {
        if (!drillFailed) {
          drillFailed = true
          console.error(LOG + 'Mercury vein drill shift check failed: ' + e)
        }
        return ModifierFunction.NULL
      }
      return drill(machine, recipe)
    }

    var drillDisplay = guarded('Mercury vein drill', function (controller, list) {
      var night = isNight(controller.getLevel())
      list.add(Text.translate('grindless.machine.mercury_vein_drill.shift.' + (night ? 'night' : 'day'),
        String(fluidAmount(controller, COOLANT))))
    })

    Pat.register(DRILL, DRILL_SPEC)

    event.create('mercury_vein_drill', 'multiblock')
      .langValue('Mercury Vein Drill')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('vein_drilling')
      .recipeModifier(drillModifier, true)
      .afterWorking(freshEveryRun)
      .additionalDisplay(drillDisplay)
      .appearanceBlock(function () { return Block.getBlock(BRICK) })
      .pattern(function (def) { return Pat.build(def, DRILL_SPEC) })
      .allowExtendedFacing(false)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.mercury_vein_drill.tooltip.0'),
        Text.translate('grindless.machine.mercury_vein_drill.tooltip.1'),
        Text.translate('grindless.machine.mercury_vein_drill.tooltip.2'),
        Text.translate('grindless.machine.mercury_vein_drill.tooltip.3')
      ])
      .workableCasingModel(BRICK_TEXTURE, 'grindless:block/multiblock/mercury_vein_drill')

    // ---- the solar works: GTM's overclock, then the sun's quarter (cheaper, never faster); recipes with fluid outputs refuse voiding
    function sunPricing(machine, recipe) {
      try {
        var oc = GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, recipe)
        if (sunState(machine).key !== 'sun') return oc
        if (SUN === null) SUN = ModifierFunction.builder().eutMultiplier(SUN_FACTOR).build()
        return oc.andThen(SUN)
      } catch (e) {
        if (!worksFailed) {
          worksFailed = true
          console.error(LOG + 'Mercury solar works recipe modifier failed: ' + e)
        }
        return ModifierFunction.IDENTITY
      }
    }

    var keepModifier = G.noVoiding.modifier(KEEP, sunPricing)
    var keepBeforeWorking = G.noVoiding.beforeWorking(KEEP)

    function worksModifier(machine, recipe) {
      return hasFluidOutputs(recipe) ? keepModifier(machine, recipe) : sunPricing(machine, recipe)
    }

    function worksBeforeWorking(machine, recipe) {
      return !hasFluidOutputs(recipe) || keepBeforeWorking(machine, recipe)
    }

    var worksDisplay = guarded('Mercury solar works', function (controller, list) {
      var state = sunState(controller)
      list.add(Text.translate('grindless.machine.mercury_solar_works.sun.' + state.key, String(state.covered)))
    })

    Pat.register(WORKS, WORKS_SPEC)

    event.create('mercury_solar_works', 'multiblock')
      .langValue('Mercury Solar Works')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(WORKS_TYPE)
      .recipeModifier(worksModifier, true)
      .beforeWorking(worksBeforeWorking)
      .afterWorking(freshEveryRun)
      .additionalDisplay(worksDisplay)
      .appearanceBlock(GTBlocks.CASING_TUNGSTENSTEEL_ROBUST)
      .pattern(function (def) { return Pat.build(def, WORKS_SPEC) })
      .allowExtendedFacing(false)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.mercury_solar_works.tooltip.0'),
        Text.translate('grindless.machine.mercury_solar_works.tooltip.1'),
        Text.translate('grindless.machine.mercury_solar_works.tooltip.2'),
        Text.translate('grindless.machine.mercury_solar_works.tooltip.3')
      ])
      .workableCasingModel(ROBUST_TEXTURE, 'grindless:block/multiblock/mercury_solar_works')

    // ---- the solar field: lib/generators.js's pieces (generator, no regress, its modifier and lines) behind the sky count
    var genOpts = { maxParallels: litPanels, name: 'mercury_solar_field' }
    var genModifier = Gen.modifier(genOpts)
    var genDisplay = Gen.display(genOpts)
    var noSky = null

    function fieldModifier(machine, recipe) {
      if (litPanels(machine) < 1) {
        if (noSky === null) noSky = ModifierFunction.cancel(Text.translate('grindless.machine.mercury_solar_field.no_sky'))
        return noSky
      }
      return genModifier(machine, recipe)
    }

    var fieldDisplay = guarded('Mercury solar field', function (controller, list) {
      genDisplay(controller, list)
      list.add(Text.translate('grindless.machine.mercury_solar_field.panels', String(litPanels(controller)), String(PANELS)))
      if (!controller.getRecipeLogic().isActive()) list.add(Text.translate('grindless.machine.mercury_solar_field.hint'))
    })

    Pat.register(FIELD, FIELD_SPEC)

    event.create('mercury_solar_field', 'multiblock')
      .langValue('Mercury Solar Field')
      .rotationState(RotationState.NON_Y_AXIS)
      .generator(true)
      .regressWhenWaiting(false)
      .recipeType(FIELD_TYPE)
      .recipeModifier(fieldModifier, true)
      .additionalDisplay(fieldDisplay)
      .appearanceBlock(function () { return Block.getBlock(BRICK) })
      .pattern(function (def) { return Pat.build(def, FIELD_SPEC) })
      .allowExtendedFacing(false)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.mercury_solar_field.tooltip.0'),
        Text.translate('grindless.machine.mercury_solar_field.tooltip.1'),
        Text.translate('grindless.machine.mercury_solar_field.tooltip.2'),
        Text.translate('grindless.machine.mercury_solar_field.tooltip.3')
      ])
      .workableCasingModel(BRICK_TEXTURE, 'grindless:block/multiblock/mercury_solar_field')

    // ---- the interferometer: an observation, like the deep space antenna (no regress: a run caught by dawn waits for the next night)
    Pat.register(INTERFEROMETER, INTERFEROMETER_SPEC)

    event.create('interferometer', 'multiblock')
      .langValue('Interferometer')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(INTERFEROMETER_TYPE)
      .regressWhenWaiting(false)
      .appearanceBlock(function () { return Block.getBlock(BRICK) })
      .pattern(function (def) { return Pat.build(def, INTERFEROMETER_SPEC) })
      .allowExtendedFacing(false)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.interferometer.tooltip.0'),
        Text.translate('grindless.machine.interferometer.tooltip.1'),
        Text.translate('grindless.machine.interferometer.tooltip.2'),
        Text.translate('grindless.machine.interferometer.tooltip.3')
      ])
      .workableCasingModel(BRICK_TEXTURE, 'grindless:block/multiblock/interferometer')
  })
})()
