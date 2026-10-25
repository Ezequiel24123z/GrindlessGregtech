// priority: -10
// -----------------------------------------------------------------------------------------------
// IV on Venus (docs/eras/iv.md: "Venus and Mercury", "Family steps", "On-site power", "Venus acid works"; package IV-B1): three
// multiblocks of ours and two recipe types. Every number is in data/grindless/tables/venus.json; the recipes are built from it by
// server_scripts/grindless/iv/venus.js. Every pattern goes through global.grindless.patterns (lib/patterns.js).
//
//   gtceu:pressurized_vein_drill   VEIN DRILL FAMILY, IV step for Venus and Mars: a closed shaft against 92 bar, its drill string a
//                                  tungstensteel pipe jacket, a pressure housing of inert casing against the acid, a deck of dust
//                                  filters on the intake and a pad of Venusian regolith (the site casing) on the ground. It runs
//                                  gtceu:vein_drilling like every drill of the family, but only its own recipes,
//                                  vein_drilling/iv/pressurized_* (the veto below; the Mercury drill takes only vein_drilling/iv/mercury_*,
//                                  and every lower drill skips the iv/ folder). Speed: `bores` (global.grindless.lv.bores) with a cap of
//                                  128 runs, then GTM's overclock; one Tungstensteel drill bit per run in the bus.
//                                    Venus  the naquadah vein, cooled by distilled water (the heat tax), which leaves as steam: inert,
//                                           to a turbine or voided (the drill allows voiding)
//                                    Mars   its three veins, dry: the dust filters keep the bit clean
//   gtceu:venus_heat_engine        POWER FAMILY, IV step (after LV's heliostat tower and EV's lunar solar array): a hot plate of
//                                  tungstensteel fireboxes on the ground under an engine house, and an 11-block radiator chimney of
//                                  night-sky radiators round a tungstensteel pipe riser, up towards the clouds (the cold side). A
//                                  generator (lib/generators.js) of type gtceu:venus_heat: makeup water in, 8,192 EU/t out, the water
//                                  leaving as steam. Venus only, and always on: GCYR's Venus is fixed at noon (fixed_time 6000).
//   gtceu:venus_acid_works         a 5x5 plate on Venusian regolith, a 3x3x6 bayonet decomposer of titanium pipe casings round a PTFE
//                                  core, and a 3x3x10 condenser stack of inert casing with heat vents beside it, joined by a PTFE
//                                  duct. Type gtceu:acid_cracking: the clouds' sulfuric acid -> distilled water + oxygen over a
//                                  platinum gauze (a wear part), Venus only. The circuit is the mode (iv.md, decision 6): 1 vents the
//                                  sulfur dioxide back into Venus's air, 2 keeps it in a hatch for chemistry at home (GTM's sulfur
//                                  trioxide and sulfuric acid) and refuses fluid voiding
//                                  (lib/no_voiding.js, in the modifier and in beforeWorking).
//
// What they gain (rule 4): naquadah only comes from the drill (the only recipe of the naquadah vein), with the IV bit and 128 runs
// also on Mars; the engine is Venus's own power (its heat, no fuel); the acid works makes water and oxygen from the clouds, a recipe
// that exists only on Venus.
//
// The drill's steam needs a fluid output on gtceu:vein_drilling, which lv/multis.js widens to 0 fluid outputs: this file widens it
// again to at least 1 in the machine event. Priority -10 loads it after every priority-0 script, so its registry callback runs after
// lv/multis.js's; the widening only ever raises the sizes (they only lay out EMI and GTM's auto abilities).
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right as seen from the front):
//   drill, 5 wide x 9 high x 4 deep: row 0 a 5x4 pad of Venusian regolith with the tungstensteel pipe drill string in its middle;
//     rows 1-3 the 3x3x3 pressure housing (X: inert casing or a part) round the string, the controller in the middle of its front face;
//     row 4 a 3x3 deck of filter casings (the dust filters) round the string; rows 5-7 the jacketed string; row 8 a tungsten steel
//     frame. X: 1-2 energy hatches, 1 input bus (the sample and the bits), 1-2 output buses, up to 1 input hatch (Venus's water) and
//     up to 1 output hatch (Venus's steam), the rest inert casing.
//   engine, 5 wide x 16 high x 5 deep: row 0 a 5x5 footing of Venusian regolith; rows 1-3 the engine house, its walls X (robust
//     tungstensteel casing or a part: 1-2 dynamo hatches, 1 input hatch for the water, up to 1 output hatch for the steam), inside a
//     3x3 hot plate of tungstensteel fireboxes (row 1) and a tungstensteel gearbox (the engine, row 2) in air; row 4 the roof of robust
//     casing with the riser in its middle; rows 5-15 the riser of tungstensteel pipe casing with four night-sky radiator fins on every
//     row. The controller is in the middle of the front wall, row 2.
//   acid works, 8 wide x 11 high x 5 deep: row 0 the 5x5 plate of Venusian regolith (columns 0-4) and the condenser's 3x3 footing
//     (columns 5-7, slices 1-3); row 1 the plate's edge (X: inert casing or a part: 1-2 energy hatches, 1 input bus for the gauze and
//     the circuit, 1 input hatch for the acid, 1-3 output hatches, one per gas, or an ME one); rows 1-6 the decomposer (titanium pipe
//     casing round a PTFE pipe casing core); a two-block desk of inert casing in front with the controller (row 2); the condenser
//     stack rows 1-10 (inert casing round a PTFE core, heat vents at rows 4 and 8) and a PTFE duct from the decomposer to it at row 6.
//
// The Venusian regolith (gcyr:venusian_regolith, the site casing) is a falling block, so it only stands in ground rows: build the
// three on solid ground.
//
// Textures: overlay dirs grindless:block/multiblock/<machine> (tools/assets/Build-VenusTextures.ps1) on GTM's inert PTFE casing (the
// drill and the acid works) and robust tungstensteel casing (the engine). Names / tooltips: client_scripts/grindless/iv_venus_lang.js.
// Published for the recipe script, the lang file and the smoke test: global.grindless.venus.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Gen = G.generators
  const V = G.venus || (G.venus = {})
  const LOG = '[grindless/iv] '

  const TABLE = 'kubejs/data/grindless/tables/venus.json'
  const T = G.readJsonTable(TABLE)

  const VENUS = String(T.site.dimension)
  const MARS = 'gcyr:mars'

  const DRILL = String(T.drill.machine)
  const ENGINE = String(T.heatEngine.machine)
  const WORKS = String(T.acidWorks.machine)
  const ENGINE_TYPE = String(T.heatEngine.type)
  const WORKS_TYPE = String(T.acidWorks.type)

  const REGOLITH = 'gcyr:venusian_regolith'
  const INERT = 'gtceu:inert_machine_casing'
  const INERT_TEXTURE = 'gtceu:block/casings/solid/machine_casing_inert_ptfe'
  const ROBUST = 'gtceu:robust_machine_casing'
  const ROBUST_TEXTURE = 'gtceu:block/casings/solid/machine_casing_robust_tungstensteel'
  const TS_PIPE = 'gtceu:tungstensteel_pipe_casing'
  const TI_PIPE = 'gtceu:titanium_pipe_casing'
  const PTFE_PIPE = 'gtceu:ptfe_pipe_casing'
  const FILTER = 'gtceu:filter_casing'
  const FIREBOX = 'gtceu:tungstensteel_firebox_casing'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'
  const RADIATOR = 'grindless:night_sky_radiator'
  const HEAT_VENT = 'gtceu:heat_vent'
  const FRAME = 'tungsten_steel'

  const DRILL_TIER = String(T.drill.tier)
  const DRILL_PREFIX = 'vein_drilling/' + DRILL_TIER + '/' + String(T.drill.prefix)
  const DRILL_CAP = Number(T.drill.cap)
  const ENGINE_PARALLELS = Number(T.heatEngine.maxParallels)
  const KEEP_KEY = String(T.acidWorks.keepKey)

  const DRILL_OFF_SITE = 'grindless.machine.pressurized_vein_drill.off_site'
  const ENGINE_NOT_VENUS = 'grindless.machine.venus_heat_engine.not_venus'
  const WORKS_NOT_VENUS = 'grindless.machine.venus_acid_works.not_venus'
  const WORKS_NO_VOIDING = 'grindless.machine.venus_acid_works.no_voiding'

  // ---------------------------------------------------------------- patterns

  const DRILL_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { exact: 1 }, output_bus: { min: 1, max: 2 }, input_hatch: { max: 1 }, output_hatch: { max: 1 } }

  const NONE9 = '     '
  //   R Venusian regolith (the pad)   J tungstensteel pipe casing (the jacketed drill string)   X housing: inert casing or a part
  //   D filter casing (the dust filters)   F tungsten steel frame   S controller
  const DRILL_SPEC = {
    slices: [
      // back: the pad behind the housing
      ['RRRRR', NONE9, NONE9, NONE9, NONE9, NONE9, NONE9, NONE9, NONE9],
      // the housing's back row and the filter deck
      ['RRRRR', ' XXX ', ' XXX ', ' XXX ', ' DDD ', NONE9, NONE9, NONE9, NONE9],
      // the drill string from the pad up through the housing, the deck and above it, capped by a frame
      ['RRJRR', ' XJX ', ' XJX ', ' XJX ', ' DJD ', '  J  ', '  J  ', '  J  ', '  F  '],
      // front: the housing's front face with the controller
      ['RRRRR', ' XXX ', ' XSX ', ' XXX ', ' DDD ', NONE9, NONE9, NONE9, NONE9]
    ],
    symbols: {
      S: Pat.controller(),
      // 23 housing cells: 3 to 7 are parts, the rest inert casing. ME buses and hatches have the same abilities, so they fit too.
      X: Pat.oneOf(
        Pat.block(INERT, { min: 12 }),
        Pat.part('energy_input', DRILL_PARTS.energy_input),
        Pat.part('input_bus', DRILL_PARTS.input_bus),
        Pat.part('output_bus', DRILL_PARTS.output_bus),
        Pat.part('input_hatch', DRILL_PARTS.input_hatch),
        Pat.part('output_hatch', DRILL_PARTS.output_hatch)
      ),
      R: Pat.block(REGOLITH),
      J: Pat.block(TS_PIPE),
      D: Pat.block(FILTER),
      F: Pat.frame([FRAME])
    }
  }

  const ENGINE_PARTS = { energy_output: { min: 1, max: 2 }, input_hatch: { exact: 1 }, output_hatch: { max: 1 } }

  const NONE5 = '     '
  const FOOT = 'RRRRR'
  const ROOF = 'CCCCC'
  function chimney(row) {
    var out = []
    for (var i = 0; i < 11; i++) out.push(row)
    return out
  }
  //   R Venusian regolith (the footing)   X house wall: robust tungstensteel casing or a part   H tungstensteel firebox (the hot plate)
  //   G tungstensteel gearbox (the engine)   C robust tungstensteel casing (the roof)   J tungstensteel pipe casing (the riser)
  //   N night-sky radiator (the chimney's fins)   # air   S controller
  const ENGINE_SPEC = {
    slices: [
      [FOOT, 'XXXXX', 'XXXXX', 'XXXXX', ROOF].concat(chimney(NONE5)),
      [FOOT, 'XHHHX', 'X###X', 'X###X', ROOF].concat(chimney('  N  ')),
      [FOOT, 'XHHHX', 'X#G#X', 'X###X', 'CCJCC'].concat(chimney(' NJN ')),
      [FOOT, 'XHHHX', 'X###X', 'X###X', ROOF].concat(chimney('  N  ')),
      [FOOT, 'XXXXX', 'XXSXX', 'XXXXX', ROOF].concat(chimney(NONE5))
    ],
    symbols: {
      S: Pat.controller(),
      // 47 wall cells: 2 to 4 are parts, the rest robust tungstensteel casing
      X: Pat.oneOf(
        Pat.block(ROBUST, { min: 30 }),
        Pat.part('energy_output', ENGINE_PARTS.energy_output),
        Pat.part('input_hatch', ENGINE_PARTS.input_hatch),
        Pat.part('output_hatch', ENGINE_PARTS.output_hatch)
      ),
      R: Pat.block(REGOLITH),
      H: Pat.block(FIREBOX),
      G: Pat.block(GEARBOX),
      C: Pat.block(ROBUST),
      J: Pat.block(TS_PIPE),
      N: Pat.block(RADIATOR),
      '#': Pat.air()
    }
  }

  const WORKS_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { exact: 1 }, input_hatch: { exact: 1 }, output_hatch: { min: 1, max: 3 } }

  const BLANK = '        '
  //   R Venusian regolith (the plate and the condenser's footing)   X the plate's edge: inert casing or a part
  //   T titanium pipe casing (the decomposer)   K PTFE pipe casing (the decomposer's core, the duct, the condenser's core)
  //   C inert casing (the condenser stack, the desk)   V heat vent   S controller
  const WORKS_SPEC = {
    slices: [
      // back: the plate's back edge
      ['RRRRR   ', 'XXXXX   ', BLANK, BLANK, BLANK, BLANK, BLANK, BLANK, BLANK, BLANK, BLANK],
      ['RRRRRRRR', 'XTTTXCCC', ' TTT CCC', ' TTT CCC', ' TTT CVC', ' TTT CCC', ' TTT CCC', '     CCC', '     CVC', '     CCC', '     CCC'],
      // the cores: the decomposer's, the duct at row 6, the condenser's
      ['RRRRRRRR', 'XTKTXCKC', ' TKT CKC', ' TKT CKC', ' TKT VKV', ' TKT CKC', ' TKTKCKC', '     CKC', '     VKV', '     CKC', '     CKC'],
      ['RRRRRRRR', 'XTTTXCCC', ' TTT CCC', ' TTT CCC', ' TTT CVC', ' TTT CCC', ' TTT CCC', '     CCC', '     CVC', '     CCC', '     CCC'],
      // front: the plate's front edge and the desk with the controller
      ['RRRRR   ', 'XXXXX   ', ' CSC    ', BLANK, BLANK, BLANK, BLANK, BLANK, BLANK, BLANK, BLANK]
    ],
    symbols: {
      S: Pat.controller(),
      // 16 edge cells: 4 to 7 are parts, the rest inert casing
      X: Pat.oneOf(
        Pat.block(INERT, { min: 8 }),
        Pat.part('energy_input', WORKS_PARTS.energy_input),
        Pat.part('input_bus', WORKS_PARTS.input_bus),
        Pat.part('input_hatch', WORKS_PARTS.input_hatch),
        Pat.part('output_hatch', WORKS_PARTS.output_hatch)
      ),
      R: Pat.block(REGOLITH),
      T: Pat.block(TI_PIPE),
      K: Pat.block(PTFE_PIPE),
      C: Pat.block(INERT),
      V: Pat.block(HEAT_VENT)
    }
  }

  // ---------------------------------------------------------------- helpers

  // 'gcyr:venus' for a level (KubeJS shows Level#dimension() as getDimension(), the location; ev/tripod.js)
  function dimensionOf(level) {
    if (level === null || level === undefined) return ''
    try {
      return String(level.getDimension())
    } catch (e) {
      return String(level.getDimensionKey().location())
    }
  }

  // the drill's own recipes: vein_drilling/iv/pressurized_<vein>_tungsten_steel (the Mercury drill's are vein_drilling/iv/mercury_*)
  function isDrillRecipe(recipe) {
    var rules = G.lv.rules
    return rules.recipeTier(recipe) === DRILL_TIER && rules.recipePath(recipe).indexOf(DRILL_PREFIX) === 0
  }

  // the acid works' recipes that keep every fluid they make (circuit 2: the sulfur dioxide goes home)
  function keepsFluids(recipe) {
    try {
      return recipe.data.getBoolean(KEEP_KEY) === true
    } catch (e) {
      return false
    }
  }

  // one controller line per machine when it stands where its recipes never run (GTM's dimension condition shows nothing by itself)
  function siteLine(key, sites, what) {
    var failed = false
    return function (controller, list) {
      try {
        if (!controller.isFormed()) return
        if (sites.indexOf(dimensionOf(controller.getLevel())) < 0) list.add(Text.translate(key))
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + what + ' controller display failed: ' + e)
        }
      }
    }
  }

  // GTM's own overclock (the default of an electric multiblock), after a refusal
  function overclock(what) {
    var failed = false
    return function (machine, recipe) {
      try {
        return GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, recipe)
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + what + ' recipe modifier failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }
  }

  // ---------------------------------------------------------------- published for the recipe script, the lang file and the smoke test

  V.table = TABLE
  V.data = T
  V.dimension = VENUS
  V.cloudBase = Number(T.site.cloudBase)
  V.dimensionOf = dimensionOf
  V.drill = {
    machine: DRILL,
    tier: DRILL_TIER,
    prefix: DRILL_PREFIX,
    cap: DRILL_CAP,
    sites: [VENUS, MARS],
    parts: DRILL_PARTS,
    offSite: DRILL_OFF_SITE,
    isDrillRecipe: isDrillRecipe
  }
  V.engine = {
    machine: ENGINE,
    recipeType: 'gtceu:' + ENGINE_TYPE,
    maxParallels: ENGINE_PARALLELS,
    // fluids: the makeup water in, the steam out; EU out
    maxIO: { itemsIn: 0, itemsOut: 0, fluidsIn: 1, fluidsOut: 1 },
    parts: ENGINE_PARTS,
    notVenus: ENGINE_NOT_VENUS
  }
  V.works = {
    machine: WORKS,
    recipeType: 'gtceu:' + WORKS_TYPE,
    // items in: the gauze and the programmed circuit; fluids in: the acid; out: water, oxygen and (circuit 2) sulfur dioxide
    maxIO: { itemsIn: 2, itemsOut: 0, fluidsIn: 1, fluidsOut: 3 },
    parts: WORKS_PARTS,
    keepKey: KEEP_KEY,
    noVoiding: WORKS_NO_VOIDING,
    notVenus: WORKS_NOT_VENUS,
    keepsFluids: keepsFluids
  }
  V.blocks = { regolith: REGOLITH, radiator: RADIATOR, heatVent: HEAT_VENT, filter: FILTER }

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // the acid works: gauze + circuit + acid in, water, oxygen and maybe sulfur dioxide out
    event.create(WORKS_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(V.works.maxIO.itemsIn, V.works.maxIO.itemsOut, V.works.maxIO.fluidsIn, V.works.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_CRACKING, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)

    // the heat engine: no fuel, Venus's heat; the makeup water in, its steam out, EU out
    event.create(ENGINE_TYPE)
      .category('multiblock')
      .setEUIO('out')
      .setMaxIOSize(V.engine.maxIO.itemsIn, V.engine.maxIO.itemsOut, V.engine.maxIO.fluidsIn, V.engine.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_BOILER_HEAT, FillDirection.DOWN_TO_UP)
      .setSound(GTSoundEntries.TURBINE)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    // the drill's steam: one fluid output on gtceu:vein_drilling (lv/multis.js widened it to 0 fluid outputs); only ever raised
    var IO = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO')
    var FluidCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
    var drilling = GTRecipeTypes.get('vein_drilling')
    if (drilling == null) throw new Error(LOG + 'recipe type gtceu:vein_drilling is not registered')
    if (drilling.getMaxOutputs(FluidCap) < 1) drilling.setMaxSize(IO.OUT, FluidCap, 1)

    Pat.register(DRILL, DRILL_SPEC)
    Pat.register(ENGINE, ENGINE_SPEC)
    Pat.register(WORKS, WORKS_SPEC)

    // ---- the drill: bores (parallel runs + GTM's overclock) on its own recipes only
    var drill = G.lv.bores(function (machine, recipe) { return !isDrillRecipe(recipe) }, DRILL_CAP)

    event.create('pressurized_vein_drill', 'multiblock')
      .langValue('Pressurized Vein Drill')
      .rotationState(RotationState.NON_Y_AXIS)
      .allowExtendedFacing(false)
      .recipeType('vein_drilling')
      .recipeModifier(drill, true)
      .appearanceBlock(GTBlocks.CASING_PTFE_INERT)
      .pattern(function (def) { return Pat.build(def, DRILL_SPEC) })
      .additionalDisplay(siteLine(DRILL_OFF_SITE, V.drill.sites, 'pressurized vein drill'))
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.pressurized_vein_drill.tooltip.0'),
        Text.translate('grindless.machine.pressurized_vein_drill.tooltip.1'),
        Text.translate('grindless.machine.pressurized_vein_drill.tooltip.2'),
        Text.translate('grindless.machine.pressurized_vein_drill.tooltip.3')
      ])
      .workableCasingModel(INERT_TEXTURE, 'grindless:block/multiblock/pressurized_vein_drill')

    // ---- the heat engine: a generator through lib/generators.js's pieces (no regress: a waiting run never pays twice)
    var genOpts = { maxParallels: ENGINE_PARALLELS, name: 'venus_heat_engine' }
    var genDisplay = Gen.display(genOpts)
    var engineSite = siteLine(ENGINE_NOT_VENUS, [VENUS], 'Venus heat engine')

    event.create('venus_heat_engine', 'multiblock')
      .langValue('Venus Heat Engine')
      .rotationState(RotationState.NON_Y_AXIS)
      .allowExtendedFacing(false)
      .generator(true)
      .regressWhenWaiting(false)
      .recipeType(ENGINE_TYPE)
      .recipeModifier(Gen.modifier(genOpts), true)
      .additionalDisplay(function (controller, list) {
        genDisplay(controller, list)
        engineSite(controller, list)
      })
      .appearanceBlock(GTBlocks.CASING_TUNGSTENSTEEL_ROBUST)
      .pattern(function (def) { return Pat.build(def, ENGINE_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.venus_heat_engine.tooltip.0'),
        Text.translate('grindless.machine.venus_heat_engine.tooltip.1'),
        Text.translate('grindless.machine.venus_heat_engine.tooltip.2'),
        Text.translate('grindless.machine.venus_heat_engine.tooltip.3')
      ])
      .workableCasingModel(ROBUST_TEXTURE, 'grindless:block/multiblock/venus_heat_engine')

    // ---- the acid works: circuit 2 keeps its sulfur dioxide, so those runs refuse fluid voiding (lib/no_voiding.js: the modifier and
    // the start check, because GTM 7.5.3 restarts an idle machine's cached recipe without its modifier); circuit 1 may void
    var keep = { which: 'fluids', reason: WORKS_NO_VOIDING, name: 'Venus acid works' }
    var oc = overclock('Venus acid works')
    var keepModifier = G.noVoiding.modifier(keep, oc)
    var keepStart = G.noVoiding.beforeWorking(keep)

    event.create('venus_acid_works', 'multiblock')
      .langValue('Venus Acid Works')
      .rotationState(RotationState.NON_Y_AXIS)
      .allowExtendedFacing(false)
      .recipeType(WORKS_TYPE)
      .recipeModifier(function (machine, recipe) {
        return keepsFluids(recipe) ? keepModifier(machine, recipe) : oc(machine, recipe)
      }, true)
      .beforeWorking(function (machine, recipe) {
        return keepsFluids(recipe) ? keepStart(machine, recipe) : true
      })
      .appearanceBlock(GTBlocks.CASING_PTFE_INERT)
      .pattern(function (def) { return Pat.build(def, WORKS_SPEC) })
      .additionalDisplay(siteLine(WORKS_NOT_VENUS, [VENUS], 'Venus acid works'))
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.venus_acid_works.tooltip.0'),
        Text.translate('grindless.machine.venus_acid_works.tooltip.1'),
        Text.translate('grindless.machine.venus_acid_works.tooltip.2'),
        Text.translate('grindless.machine.venus_acid_works.tooltip.3')
      ])
      .workableCasingModel(INERT_TEXTURE, 'grindless:block/multiblock/venus_acid_works')
  })

  console.info(LOG + 'Venus: ' + DRILL + ' (vein_drilling, ' + DRILL_PREFIX + '*, cap ' + DRILL_CAP + '), ' + ENGINE + ' (' + ENGINE_TYPE + ', generator) and ' +
    WORKS + ' (' + WORKS_TYPE + ')')
})()
