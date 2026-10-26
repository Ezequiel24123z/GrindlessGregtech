// priority: -10
// -----------------------------------------------------------------------------------------------
// LuV B5, the asteroid belt (docs/eras/luv.md, sections 11-13, "The belt and Jupiter's moons" and "Platinum plant, mode 4"): three
// multiblocks of ours, two recipe types, the belt's vein samples and its world gen layer. Every pattern goes through
// global.grindless.patterns (lib/patterns.js); the belt's dimension id comes only from tables/places.json (G.places, key asteroid_belt).
//
//   gtceu:harpoon_anchor_drill  VEIN DRILL FAMILY, step 7a. A low spider on the belt's rubble: a 5x6 pad of asteroid regolith casing,
//                               four HSS-S harpoon legs driven into the rock (Philae's harpoons), a 3x3x3 body with a Whipple shield on
//                               its sunward (back) face, and a short titanium derrick over the tungstensteel drill string. It runs
//                               gtceu:vein_drilling like every drill of the family, but only its own recipes, vein_drilling/luv/harpoon_*
//                               (the veto below; every lower drill skips the luv/ folder). Speed: `bores` (global.grindless.lv.bores)
//                               with a cap of 256 runs, then GTM's overclock. Wear per run: the HSS-S bit at 0.25 % and an anchor harpoon
//                               at 1 %. No fluid: it is vacuum.
//   gtceu:asteroid_processor    The Mond process, several steps in one (Clydach, 1902; Lewis, Mining the Sky). Type
//                               gtceu:asteroid_processing: circuit 1 carbonylates crushed meteoric iron under a CO charge (needed, never
//                               used up) into iron, nickel and cobalt, and leaves the platinum metals as the asteroid PGM concentrate;
//                               circuit 3 does the same with meteoric iron dust (what GTM's ore line and the magnetic split leave);
//                               circuit 2 splits crushed tetrataenite from its kamacite by magnet. A run that makes the concentrate
//                               refuses item voiding (lib/no_voiding.js, in the modifier and in beforeWorking). It takes the parallel
//                               hatch. Anywhere: no site rule.
//   gtceu:optical_miner         TransAstra's optical mining: eight heliostat mirrors (laminated glass on titanium posts) round a 3x3x3
//                               capture chamber of robust casing with a glass receiver on top, a five-block frostproof cold-trap column
//                               and a control hut of asteroid regolith casing. Type gtceu:optical_mining, belt only. Circuit 1 bags a
//                               C-type boulder and spalls it with sunlight: it starts only by day with the sun on the receiver
//                               (GTM's GTUtil.canSeeSunClearly) and every mirror under open sky (the Mercury solar works' check), read
//                               when a run starts and closed by lib/fresh_run.js. Circuit 2 (Boudouard) turns its CO2 and carbon into
//                               the asteroid processor's CO; no sun needed. It keeps everything it makes (no voiding, both places).
//
//   Items: grindless:vein_sample_<id> for every vein of data/grindless/tables/veins_belt.json (loaded here as
//   global.grindless.tables.veins_belt). A1 registers the bit, the harpoon, the concentrate, the bag, the extract and the casing.
//   World gen: GTM's KubeJS layer 'asteroid_belt' (targets minecraft:tuff, the belt's surface only); the server script adds the veins.
//   Textures: overlay dirs grindless:block/multiblock/<machine> (tools/assets/Build-AsteroidBeltTextures.ps1) on A1's asteroid regolith
//   casing (drill, miner) and GTM's steel solid casing (processor). Names: client_scripts/grindless/luv_asteroid_belt_lang.js.
// Published for the server script, the lang file and the tests: global.grindless.asteroidBelt.
(function () {
  var G = global.grindless
  var Pat = G.patterns
  var LOG = '[grindless/luv] '
  var B = G.asteroidBelt = {}

  var PLACE = 'asteroid_belt'
  var REGOLITH = 'grindless:asteroid_regolith_casing'
  var REGOLITH_TEXTURE = 'grindless:block/luv/asteroid_regolith_casing'
  var STEEL = 'gtceu:solid_machine_casing'
  var STEEL_TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  var WHIPPLE = 'grindless:whipple_shield_casing'
  var STRING = 'gtceu:tungstensteel_pipe_casing'
  var STEEL_PIPE = 'gtceu:steel_pipe_casing'
  var GLASS = 'gtceu:laminated_glass'
  var ROBUST = 'gtceu:robust_machine_casing'
  var FROSTPROOF = 'gtceu:frostproof_machine_casing'

  var DRILL = 'gtceu:harpoon_anchor_drill'
  var PROCESSOR = 'gtceu:asteroid_processor'
  var MINER = 'gtceu:optical_miner'
  var PROCESSOR_TYPE = 'asteroid_processing'
  var MINER_TYPE = 'optical_mining'
  var SUN_KEY = 'grindless_optical_sun'

  // ---------------------------------------------------------------- the vein table

  G.tables.veins_belt = G.readJsonTable('kubejs/data/grindless/tables/veins_belt.json')
  if (!G.tables.veins_belt || !G.tables.veins_belt.veins || G.tables.veins_belt.veins.length === 0) {
    throw new Error(LOG + 'veins_belt.json has no veins')
  }
  B.place = PLACE
  B.layer = G.tables.veins_belt.layer
  B.layerTarget = 'minecraft:tuff'
  B.samples = G.tables.veins_belt.veins.map(function (v) { return 'grindless:vein_sample_' + v.id })

  // ---------------------------------------------------------------- patterns (slices back -> front, rows bottom -> top)

  //   R asteroid regolith casing (the pad)   H HSS-S frame (harpoon feet and legs)   X body: regolith casing or a part
  //   W Whipple shield casing (sunward face)  P tungstensteel pipe casing (drill string)   D titanium frame (derrick)   S controller
  var drillSpec = {
    slices: [
      ['H     H', '       ', '       ', '       ', '       ', '       ', '       ', '       '],
      [' RRRRR ', ' H   H ', '       ', '       ', '       ', '       ', '       ', '       '],
      [' RRRRR ', '       ', '       ', '       ', '       ', '       ', '       ', '       '],
      [' RRRRR ', '  WWW  ', '  WWW  ', '  WWW  ', '       ', '       ', '       ', '       '],
      [' RRRRR ', '  XXX  ', '  XXX  ', '  XXX  ', '  D D  ', '  D D  ', '  D D  ', '       '],
      [' RRPRR ', ' HXPXH ', '  XPX  ', '  XPX  ', '   P   ', '   P   ', '   P   ', '   P   '],
      ['HRRRRRH', '  XSX  ', '  XXX  ', '  XXX  ', '  D D  ', '  D D  ', '  D D  ', '       ']
    ],
    symbols: {
      S: Pat.controller(),
      // 23 body cells: 3 to 6 are parts (energy, the bus for the sample, the bits and the harpoons, one or two output buses)
      X: Pat.oneOf(
        Pat.block(REGOLITH, { min: 15 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 })
      ),
      R: Pat.block(REGOLITH),
      H: Pat.frame(['hsss']),
      W: Pat.block(WHIPPLE),
      P: Pat.block(STRING),
      D: Pat.frame(['titanium'])
    }
  }

  //   C steel pipe casing (the carbonyl column: reactor below, decomposer above, hollow inside)   # air   X magnetic separator: steel
  //   casing or a part   G laminated glass (the CO gas holder)   S controller
  var processorSpec = {
    slices: [
      ['CCCCC GGG', 'CCCCC GGG', 'CCCCC GGG', 'CCCCC    ', 'CCCCC    ', 'CCCCC    '],
      ['CCCCC GGG', 'C###C GGG', 'C###C GGG', 'C###C    ', 'C###C    ', 'CCCCC    '],
      ['CCCCC XXX', 'C###CCXXX', 'C###C XXX', 'C###C    ', 'C###C    ', 'CCCCC    '],
      ['CCCCC XXX', 'C###C XXX', 'C###C XXX', 'C###C    ', 'C###C    ', 'CCCCC    '],
      ['CCCCC XXX', 'CCCCC XSX', 'CCCCC XXX', 'CCCCC    ', 'CCCCC    ', 'CCCCC    ']
    ],
    symbols: {
      S: Pat.controller(),
      // 26 separator cells: 4 to 9 are parts (energy, buses, the CO hatch and the parallel hatch), the rest steel casing
      X: Pat.oneOf(
        Pat.block(STEEL, { min: 14 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 2 }),
        G.parallelHatch.part()
      ),
      C: Pat.block(STEEL_PIPE),
      G: Pat.block(GLASS),
      '#': Pat.air()
    }
  }

  //   F titanium frame (mirror posts)   M laminated glass (heliostat mirrors)   K robust casing (the capture chamber)   G laminated glass
  //   (the receiver window)   T frostproof casing (the cold trap)   X control hut: regolith casing or a part   S controller
  var minerRows = []
  for (var mz = 0; mz < 13; mz++) {
    var rows = []
    for (var my = 0; my < 5; my++) rows.push('             ')
    minerRows.push(rows)
  }
  function put(x, y, z, ch) {
    var row = minerRows[z][y]
    minerRows[z][y] = row.substring(0, x) + ch + row.substring(x + 1)
  }
  var MIRRORS = [[1, 2], [4, 1], [8, 1], [11, 2], [1, 6], [11, 6], [2, 10], [10, 10]]
  MIRRORS.forEach(function (m) {
    put(m[0], 0, m[1], 'F')
    put(m[0], 1, m[1], 'M')
  })
  for (var cx = 5; cx <= 7; cx++) {
    for (var cz = 5; cz <= 7; cz++) {
      for (var cy = 0; cy <= 2; cy++) put(cx, cy, cz, cy === 2 && cx === 6 && cz === 6 ? 'G' : 'K')
      for (var hy = 0; hy <= 2; hy++) put(cx, hy, cz + 5, 'X')
    }
  }
  for (var ty = 0; ty <= 4; ty++) put(6, ty, 9, 'T')
  put(6, 0, 8, 'T')
  put(6, 1, 12, 'S')
  var minerSpec = {
    slices: minerRows,
    symbols: {
      S: Pat.controller(),
      // 26 hut cells: 4 to 9 are parts (energy, the bus for the bags, the carbon and the circuit, the output bus, the CO2 hatch and
      // the hatches for the water, the CO2 and the CO), the rest regolith casing
      X: Pat.oneOf(
        Pat.block(REGOLITH, { min: 14 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { max: 1 }),
        Pat.part('output_hatch', { min: 1, max: 3 })
      ),
      F: Pat.frame(['titanium']),
      M: Pat.block(GLASS),
      K: Pat.block(ROBUST),
      G: Pat.block(GLASS),
      T: Pat.block(FROSTPROOF)
    }
  }
  B.specs = { drill: drillSpec, processor: processorSpec, miner: minerSpec }

  // ---------------------------------------------------------------- geometry (the miner's sky check)

  // every cell of a symbol relative to the controller: up, back (away from the front face) and side (+ = towards the column index)
  function relativeCells(spec, ch) {
    var ctrl = null
    var cells = []
    spec.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var c = row.charAt(ci)
          if (c === 'S') ctrl = { si: si, ri: ri, ci: ci }
          if (c === ch) cells.push({ si: si, ri: ri, ci: ci })
        }
      })
    })
    return cells.map(function (c) { return { up: c.ri - ctrl.ri, back: ctrl.si - c.si, side: c.ci - ctrl.ci } })
  }
  var MIRROR_CELLS = relativeCells(minerSpec, 'M')
  var RECEIVER_CELL = relativeCells(minerSpec, 'G')[0]
  if (MIRROR_CELLS.length !== 8 || !RECEIVER_CELL) throw new Error(LOG + 'optical miner: expected 8 mirrors and a receiver')

  var STEPS = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] }

  // the Mercury solar works' mapping (iv/mercury.js): front (fx, fz), back = -front, +side = (fz, -fx); a mirrored build flips side
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

  var GTUtil = null
  // 'sun', 'night' or 'shaded' (n = the receiver and the mirrors that do not see the sky)
  function sunState(machine) {
    var level = machine.getLevel()
    if (level == null || level.isNight() === true) return { key: 'night', covered: 0 }
    var step = STEPS[String(machine.getFrontFacing()).toLowerCase()]
    if (!step) return { key: 'shaded', covered: MIRROR_CELLS.length + 1 }
    if (GTUtil === null) GTUtil = Java.loadClass('com.gregtechceu.gtceu.utils.GTUtil')
    var pos = machine.getPos()
    var sign = sideSign(machine)
    var covered = GTUtil.canSeeSunClearly(level, cellPos(pos, step[0], step[1], RECEIVER_CELL, sign)) ? 0 : 1
    MIRROR_CELLS.forEach(function (p) {
      if (!level.canSeeSky(cellPos(pos, step[0], step[1], p, sign).above())) covered++
    })
    return covered === 0 ? { key: 'sun', covered: 0 } : { key: 'shaded', covered: covered }
  }

  // ---------------------------------------------------------------- recipe rules

  var DRILL_TIER = 'luv'
  var DRILL_PREFIX = 'vein_drilling/luv/harpoon_'
  function recipePath(recipe) {
    return String(recipe.id.getPath())
  }
  function isHarpoonRecipe(recipe) {
    return String(recipe.id.getNamespace()) === 'grindless' && recipePath(recipe).indexOf(DRILL_PREFIX) === 0
  }
  // the optical mining runs that need the sun (circuit 1); Boudouard (circuit 2) does not
  function needsSun(recipe) {
    return recipePath(recipe).indexOf(MINER_TYPE + '/c_type_boulder') === 0
  }
  // the processor's runs that make the concentrate (circuits 1 and 3) keep their items
  function makesConcentrate(recipe) {
    return /^asteroid_processing\/mond_/.test(recipePath(recipe))
  }

  B.drill = {
    machine: DRILL,
    tier: DRILL_TIER,
    prefix: DRILL_PREFIX,
    cap: 256,
    eut: 8,
    duration: 200,
    perRun: 11.25,
    bit: { item: 'grindless:hss_s_drill_bit', wear: 25 },
    harpoon: { item: 'grindless:anchor_harpoon', wear: 100 },
    isHarpoonRecipe: isHarpoonRecipe
  }
  B.processor = { machine: PROCESSOR, type: 'gtceu:' + PROCESSOR_TYPE, makesConcentrate: makesConcentrate,
    noVoiding: 'grindless.machine.asteroid_processor.no_voiding' }
  B.miner = { machine: MINER, type: 'gtceu:' + MINER_TYPE, mirrorCells: MIRROR_CELLS, receiverCell: RECEIVER_CELL,
    sunState: sunState, needsSun: needsSun, sunKey: SUN_KEY, noVoiding: 'grindless.machine.optical_miner.no_voiding' }

  // ---------------------------------------------------------------- items: the vein samples

  function materialKey(id) {
    var i = id.indexOf(':')
    return i < 0 ? 'material.gtceu.' + id : 'material.' + id.substring(0, i) + '.' + id.substring(i + 1)
  }
  function joined(keys) {
    var text = Text.translate(keys[0])
    for (var i = 1; i < keys.length; i++) text = text.append(', ').append(Text.translate(keys[i]))
    return text
  }

  StartupEvents.registry('item', function (event) {
    G.tables.veins_belt.veins.forEach(function (vein) {
      event.create('grindless:vein_sample_' + vein.id)
        .texture('layer0', 'grindless:item/vein_sample_frame')
        .texture('layer1', 'grindless:item/vein_sample_core')
        .color(1, vein.color)
        .maxStackSize(16)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.vein_sample.drill_harpoon')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.contains',
          joined(vein.materials.map(function (m) { return materialKey(m.id) })))))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.depth', String(vein.minY), String(vein.maxY))))
        .tooltip(Text.red(Text.translate('tooltip.grindless.vein_sample.asteroid_belt')))
        .tag('grindless:vein_samples')
        .tag('grindless:belt_vein_samples')
    })
  })

  // ---------------------------------------------------------------- world gen layer (spike S0-6)

  GTCEuStartupEvents.registry('gtceu:world_gen_layer', function (event) {
    event.create('grindless:' + B.layer)
      .targets(B.layerTarget)
      .dimensions(G.places.surface(PLACE))
  })

  // ---------------------------------------------------------------- recipe types

  function sunInfo(data) {
    try {
      var sun = String(data.getString(SUN_KEY))
      if (sun === '') return ''
      return String(Text.translate('gtceu.recipe.' + SUN_KEY + '.' + sun).getString())
    } catch (e) {
      return ''
    }
  }

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // the Mond feed and the circuit in; iron, nickel, cobalt and the concentrate out; the CO charge in its own hatch
    event.create(PROCESSOR_TYPE).category('multiblock').setEUIO('in').setMaxIOSize(2, 4, 1, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
    // the bag (or the carbon) and the circuit in; carbon and the extract out; CO2 in; water, CO2 (or CO) out
    event.create(MINER_TYPE).category('multiblock').setEUIO('in').setMaxIOSize(2, 2, 1, 2)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)
  })

  // ---------------------------------------------------------------- machines

  var failed = {}
  function once(name, e) {
    if (!failed[name]) {
      failed[name] = true
      console.error(LOG + name + ': ' + e)
    }
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var IO = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO')
    var ItemCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
    var drilling = GTRecipeTypes.get('vein_drilling')
    if (drilling == null) throw new Error(LOG + 'recipe type gtceu:vein_drilling is not registered')
    // sample + bit + harpoon: three item inputs (lv/multis.js widened it to two); only ever raised
    if (drilling.getMaxInputs(ItemCap) < 3) drilling.setMaxSize(IO.IN, ItemCap, 3)
    GTRecipeTypes.get(MINER_TYPE).addDataInfo(sunInfo)

    Pat.register(DRILL, drillSpec)
    Pat.register(PROCESSOR, processorSpec)
    Pat.register(MINER, minerSpec)

    // ---- the drill: only its own recipes, then bores (cap 256) and GTM's overclock
    var bores = G.lv.bores(function (machine, recipe) {
      return G.lv.rules.recipeTier(recipe) !== DRILL_TIER || !isHarpoonRecipe(recipe)
    }, B.drill.cap)

    event.create('harpoon_anchor_drill', 'multiblock')
      .langValue('Harpoon Anchor Drill')
      .rotationState(RotationState.NON_Y_AXIS)
      .allowExtendedFacing(false)
      .recipeType('vein_drilling')
      .recipeModifier(bores, true)
      .appearanceBlock(function () { return Block.getBlock(REGOLITH) })
      .pattern(function (def) { return Pat.build(def, drillSpec) })
      ['tooltips(net.minecraft.network.chat.Component[])']([
        Text.translate('grindless.machine.harpoon_anchor_drill.tooltip.0'),
        Text.translate('grindless.machine.harpoon_anchor_drill.tooltip.1'),
        Text.translate('grindless.machine.harpoon_anchor_drill.tooltip.2')
      ])
      .workableCasingModel(REGOLITH_TEXTURE, 'grindless:block/multiblock/harpoon_anchor_drill')

    // ---- the processor: the hatch's copies and GTM's overclock; a concentrate run refuses item voiding
    var keep = { which: 'items', reason: B.processor.noVoiding, name: 'asteroid processor' }
    var plain = G.parallelHatch.modifier(G.parallelHatch.overclock)
    var kept = G.noVoiding.modifier(keep, plain)
    var keptStart = G.noVoiding.beforeWorking(keep)

    event.create('asteroid_processor', 'multiblock')
      .langValue('Asteroid Processor')
      .rotationState(RotationState.NON_Y_AXIS)
      .allowExtendedFacing(false)
      .recipeType(PROCESSOR_TYPE)
      .recipeModifier(function (machine, recipe) {
        return makesConcentrate(recipe) ? kept(machine, recipe) : plain(machine, recipe)
      }, true)
      .beforeWorking(function (machine, recipe) {
        return !makesConcentrate(recipe) || keptStart(machine, recipe)
      })
      .appearanceBlock(function () { return Block.getBlock(STEEL) })
      .pattern(function (def) { return Pat.build(def, processorSpec) })
      ['tooltips(net.minecraft.network.chat.Component[])']([
        Text.translate('grindless.machine.asteroid_processor.tooltip.0'),
        Text.translate('grindless.machine.asteroid_processor.tooltip.1'),
        Text.translate('grindless.machine.asteroid_processor.tooltip.2'),
        Text.translate('grindless.machine.parallel_hatch.tooltip')
      ])
      .workableCasingModel(STEEL_TEXTURE, 'grindless:block/multiblock/asteroid_processor')

    // ---- the miner: circuit 1 starts only in full sun; it keeps everything; a fresh start every run
    var minerKeep = { which: 'both', reason: B.miner.noVoiding, name: 'optical miner' }
    var noSun = null
    function sunGate(machine, recipe) {
      try {
        if (needsSun(recipe) && sunState(machine).key !== 'sun') {
          if (noSun === null) noSun = ModifierFunction.cancel(Text.translate('grindless.machine.optical_miner.no_sun'))
          return noSun
        }
        return GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, recipe)
      } catch (e) {
        once('optical miner sun check', e)
        return ModifierFunction.NULL
      }
    }

    event.create('optical_miner', 'multiblock')
      .langValue('Optical Miner')
      .rotationState(RotationState.NON_Y_AXIS)
      .allowExtendedFacing(false)
      .recipeType(MINER_TYPE)
      .recipeModifier(G.noVoiding.modifier(minerKeep, sunGate), true)
      .beforeWorking(G.noVoiding.beforeWorking(minerKeep))
      .afterWorking(G.freshRun.afterWorking('optical_miner'))
      .additionalDisplay(function (controller, list) {
        try {
          if (!controller.isFormed()) return
          var state = sunState(controller)
          list.add(Text.translate('grindless.machine.optical_miner.sun.' + state.key, String(state.covered)))
        } catch (e) {
          once('optical miner display', e)
        }
      })
      .appearanceBlock(function () { return Block.getBlock(REGOLITH) })
      .pattern(function (def) { return Pat.build(def, minerSpec) })
      ['tooltips(net.minecraft.network.chat.Component[])']([
        Text.translate('grindless.machine.optical_miner.tooltip.0'),
        Text.translate('grindless.machine.optical_miner.tooltip.1'),
        Text.translate('grindless.machine.optical_miner.tooltip.2')
      ])
      .workableCasingModel(REGOLITH_TEXTURE, 'grindless:block/multiblock/optical_miner')
  })

  if (G.parallelHatch && Array.isArray(G.parallelHatch.machines) && G.parallelHatch.machines.indexOf(PROCESSOR) < 0) {
    G.parallelHatch.machines.push(PROCESSOR)
  }
})()
