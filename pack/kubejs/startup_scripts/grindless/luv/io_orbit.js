// priority: -4300
// LuV B7, Io orbit (docs/eras/luv.md, sections 16 and 16b; decisions 3, 7 and 17). One slot, two designs; tables/stations.json picks one
// through lib/stations.js (G.stations.b7), and only that one is registered:
//
//   'tether'         gtceu:flux_tube_tether  generator type gtceu:electrodynamic_tether, in the second station's orbit (Io orbit). A 5x5x5
//                    deployer (station truss edges, radiation vault faces) with two reel cells, a hollow-cathode port on its roof and a
//                    1x1x10 stub of tether above it. Two reels, two parallel runs; it burns nothing, so it is not doubled.
//   'sulfur_iodine'  gtceu:sulfur_iodine_plant  type gtceu:thermochemical_hydrogen, on Io's surface: water -> hydrogen and oxygen on Io's
//                    heat. A 5x5 hot plate on magma, a vault room, a Bunsen reactor of PTFE inert casing and an HI column above it, and
//                    four 3x3x3 decomposer module slots (tungstensteel); one parallel per complete module. It keeps what it makes.
//   'pending'        spike S0-3 has not concluded: neither is registered (old saves never carry a machine the other outcome drops).
//
// Both specs are always built and published (G.ioOrbit) for the tests and the bench fixture; only the active machine and its type are
// registered. A1 owns the spool and the casings; magma is vanilla's. Io comes from G.places, the orbit from G.stations.second.
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right as seen from the front).
(function () {
  var G = global.grindless
  var Pat = G.patterns
  var Gen = G.generators
  var LOG = '[grindless/io_orbit] '

  var TRUSS = 'grindless:station_truss_casing'
  var VAULT = 'grindless:radiation_vault_casing'
  var GEARBOX = 'gtceu:tungstensteel_gearbox'
  var MAGMA = 'minecraft:magma_block'
  var FIREBOX = 'gtceu:tungstensteel_firebox_casing'
  var ROBUST = 'gtceu:robust_machine_casing'
  var INERT = 'gtceu:inert_machine_casing'
  var PTFE_PIPE = 'gtceu:ptfe_pipe_casing'

  // ---------------------------------------------------------------- flux-tube tether, 5 wide x 15 high x 5 deep
  //   T station truss casing (the cube's edges)   X vault face: vault casing or a part   S controller   H hollow-cathode port (input hatch)
  //   R reel cell (tungstensteel gearbox)   A air   L the tether (aluminium frame): the roof's centre and ten blocks above it
  var TETHER_PARTS = { energy_output: { min: 1, max: 4 }, input_bus: { exact: 1 }, input_hatch: { exact: 1 } }
  var TETHER_CONTROLLER = { slice: 4, row: 2, col: 2 }
  var REELS = 2
  function tetherCell(si, ri, ci) {
    if (ri > 4) return si === 2 && ci === 2 ? 'L' : ' '
    var outer = (si === 0 || si === 4 ? 1 : 0) + (ri === 0 || ri === 4 ? 1 : 0) + (ci === 0 || ci === 4 ? 1 : 0)
    if (outer >= 2) return 'T'
    if (outer === 1) {
      if (si === TETHER_CONTROLLER.slice && ri === TETHER_CONTROLLER.row && ci === TETHER_CONTROLLER.col) return 'S'
      if (ri === 4 && si === 2 && ci === 2) return 'L'
      if (ri === 4 && si === 1 && ci === 2) return 'H'
      return 'X'
    }
    // the two reels run front to back through the middle row, either side of the tether's path
    return ri === 2 && (ci === 1 || ci === 3) ? 'R' : 'A'
  }
  var tetherSlices = []
  for (var ts = 0; ts < 5; ts++) {
    var trows = []
    for (var tr = 0; tr < 15; tr++) {
      var row = ''
      for (var tc = 0; tc < 5; tc++) row += tetherCell(ts, tr, tc)
      trows.push(row)
    }
    tetherSlices.push(trows)
  }
  var TETHER_SPEC = {
    slices: tetherSlices,
    symbols: {
      S: Pat.controller(),
      // 51 vault-face cells: 2 to 5 are parts, the rest vault casing
      X: Pat.oneOf(
        Pat.block(VAULT, { min: 46 }),
        Pat.part('energy_output', TETHER_PARTS.energy_output),
        Pat.part('input_bus', TETHER_PARTS.input_bus)),
      H: Pat.part('input_hatch', TETHER_PARTS.input_hatch),
      T: Pat.block(TRUSS),
      R: Pat.block(GEARBOX),
      A: Pat.air(),
      L: Pat.frame(['aluminium'])
    }
  }

  // ---------------------------------------------------------------- sulfur-iodine plant, 11 wide x 14 high x 5 deep
  //   M magma (Io's crust)   P tungstensteel firebox (the hot plate)   X vault room: vault casing or a part   A air   S controller
  //   B PTFE inert casing (the Bunsen reactor, and the HI column's shell)   Q PTFE pipe casing (the HI column's packing)
  //   a the first decomposer module (robust tungstensteel casing, required); b, c, d three more slots: a whole module or air
  var PLANT_PARTS = {
    energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, input_hatch: { min: 1, max: 3 }, output_hatch: { min: 1, max: 3 }
  }
  var MODULES = [
    { sym: 'a', col: 0, row: 1 }, { sym: 'b', col: 8, row: 1 },
    { sym: 'c', col: 0, row: 4 }, { sym: 'd', col: 8, row: 4 }
  ]
  var PLANT_CONTROLLER = { slice: 4, row: 2, col: 5 }
  function coreRow(si, ri) {
    var edge = si === 0 || si === 4
    var inner = si >= 1 && si <= 3
    if (ri === 0) return 'MMMMM'
    if (ri === 1) return 'PPPPP'
    if (ri <= 3) {
      if (si === PLANT_CONTROLLER.slice && ri === PLANT_CONTROLLER.row) return 'XXSXX'
      return edge ? 'XXXXX' : 'XAAAX'
    }
    if (ri === 4) return 'XXXXX'
    if (!inner) return '     '
    if (ri <= 7) return ' BBB '
    return si === 2 ? ' BQB ' : ' BBB '
  }
  function moduleAt(si, ri, side) {
    if (si < 1 || si > 3) return '   '
    for (var m = 0; m < MODULES.length; m++) {
      var mod = MODULES[m]
      if ((mod.col === 0) === (side === 'left') && ri >= mod.row && ri < mod.row + 3) return mod.sym + mod.sym + mod.sym
    }
    return '   '
  }
  var plantSlices = []
  for (var ps = 0; ps < 5; ps++) {
    var prows = []
    for (var pr = 0; pr < 14; pr++) prows.push(moduleAt(ps, pr, 'left') + coreRow(ps, pr) + moduleAt(ps, pr, 'right'))
    plantSlices.push(prows)
  }
  function optionalModule() { return Pat.oneOf(Pat.block(ROBUST), Pat.air()) }
  var PLANT_SPEC = {
    slices: plantSlices,
    symbols: {
      S: Pat.controller(),
      // 56 vault-room cells: 4 to 10 are parts, the rest vault casing
      X: Pat.oneOf(
        Pat.block(VAULT, { min: 46 }),
        Pat.part('energy_input', PLANT_PARTS.energy_input),
        Pat.part('input_bus', PLANT_PARTS.input_bus),
        Pat.part('input_hatch', PLANT_PARTS.input_hatch),
        Pat.part('output_hatch', PLANT_PARTS.output_hatch)),
      M: Pat.block(MAGMA),
      P: Pat.block(FIREBOX),
      A: Pat.air(),
      B: Pat.block(INERT),
      Q: Pat.block(PTFE_PIPE),
      a: Pat.block(ROBUST),
      b: optionalModule(),
      c: optionalModule(),
      d: optionalModule()
    }
  }

  // every module's 27 cells relative to the controller: up, back (towards the back slice) and side (columns to the right)
  var moduleCells = MODULES.map(function (mod) {
    var cells = []
    plantSlices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          if (row.charAt(ci) === mod.sym) {
            cells.push({ up: ri - PLANT_CONTROLLER.row, back: PLANT_CONTROLLER.slice - si, side: ci - PLANT_CONTROLLER.col })
          }
        }
      })
    })
    if (cells.length !== 27) throw new Error(LOG + 'module ' + mod.sym + ' has ' + cells.length + ' cells, not 27')
    return cells
  })

  var steps = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] }
  var robustBlock = null
  // complete decomposer modules (1 to 4) in the world around a formed plant; the slots mirror each other, so facing does not matter
  function modules(machine) {
    var level = machine.getLevel()
    if (level == null) return 0
    var step = steps[String(machine.getFrontFacing()).toLowerCase()]
    if (!step) return 0
    if (robustBlock === null) robustBlock = Block.getBlock(ROBUST)
    var pos = machine.getPos()
    var complete = 0
    moduleCells.forEach(function (cells) {
      for (var i = 0; i < cells.length; i++) {
        var p = cells[i]
        var at = pos.offset(-step[0] * p.back + step[1] * p.side, p.up, -step[1] * p.back - step[0] * p.side)
        if (!level.getBlockState(at).is(robustBlock)) return
      }
      complete++
    })
    return complete
  }

  var LC = null
  function lazy() {
    if (LC === null) {
      LC = {
        ContentModifier: Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.ContentModifier'),
        ParallelLogic: Java.loadClass('com.gregtechceu.gtceu.api.recipe.modifier.ParallelLogic'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
      }
    }
    return LC
  }

  // one parallel run per complete module, no overclock (the decomposers are heat-limited, the pumps' EU is all the recipe asks):
  // the copies GTM's ParallelLogic allows (inputs and output room), capped by what the energy hatches carry. Non-consumed charges are
  // needed once (ContentModifier skips chance-0 contents).
  function moduleParallel(machine, recipe) {
    var c = lazy()
    var n = modules(machine)
    if (n < 1) return ModifierFunction.NULL
    var eut = 0
    var io = c.RecipeHelper.getRealEUtWithIO(recipe)
    if (!io.isEmpty() && io.isInput()) eut = Number(io.getTotalEU())
    if (eut > 0 && typeof machine.getOverclockVoltage === 'function') {
      var volts = Number(machine.getOverclockVoltage())
      if (volts > 0) n = Math.min(n, Math.floor(volts / eut))
    }
    if (n < 1) return ModifierFunction.NULL
    var runs = c.ParallelLogic.getParallelAmountWithoutEU(machine, recipe, n)
    if (runs < 1) return ModifierFunction.NULL
    return ModifierFunction.builder()
      .inputModifier(c.ContentModifier.multiplier(runs))
      .outputModifier(c.ContentModifier.multiplier(runs))
      .eutMultiplier(runs)
      .parallels(runs)
      .build()
  }
  function plantModifier() {
    var failed = false
    return function (machine, recipe) {
      try {
        return moduleParallel(machine, recipe)
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'sulfur-iodine plant recipe modifier failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }
  }

  function dimensionOf(level) {
    if (level === null || level === undefined) return ''
    try {
      return String(level.getDimension())
    } catch (e) {
      return String(level.getDimensionKey().location())
    }
  }

  // one controller line when the machine stands off its site (GTM's dimension condition shows nothing by itself)
  function siteLine(key, site, what) {
    var failed = false
    return function (controller, list) {
      try {
        if (!controller.isFormed()) return
        if (dimensionOf(controller.getLevel()) !== site) list.add(Text.translate(key))
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + what + ' controller display failed: ' + e)
        }
      }
    }
  }

  var mode = G.stations.b7
  var IOO = G.ioOrbit = {
    mode: mode,
    blocks: { truss: TRUSS, vault: VAULT, gearbox: GEARBOX, magma: MAGMA, firebox: FIREBOX, robust: ROBUST, inert: INERT, ptfePipe: PTFE_PIPE },
    tether: {
      machine: 'gtceu:flux_tube_tether',
      type: 'electrodynamic_tether',
      active: mode === 'tether',
      // the orbit of the second station (null when there is none: then the tether is never registered)
      site: G.stations.second,
      maxIO: { itemsIn: 2, itemsOut: 0, fluidsIn: 1, fluidsOut: 0 },
      parts: TETHER_PARTS,
      spec: TETHER_SPEC,
      controller: TETHER_CONTROLLER,
      reels: REELS,
      offSite: 'grindless.machine.flux_tube_tether.off_orbit'
    },
    plant: {
      machine: 'gtceu:sulfur_iodine_plant',
      type: 'thermochemical_hydrogen',
      active: mode === 'sulfur_iodine',
      place: 'io',
      site: G.places.surface('io'),
      maxIO: { itemsIn: 2, itemsOut: 0, fluidsIn: 2, fluidsOut: 2 },
      parts: PLANT_PARTS,
      spec: PLANT_SPEC,
      controller: PLANT_CONTROLLER,
      moduleCells: moduleCells,
      maxModules: MODULES.length,
      modules: modules,
      modifier: moduleParallel,
      noVoiding: 'grindless.machine.sulfur_iodine_plant.no_voiding',
      offSite: 'grindless.machine.sulfur_iodine_plant.off_io'
    }
  }

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    if (IOO.tether.active) {
      var t = IOO.tether.maxIO
      event.create(IOO.tether.type).category('multiblock').setEUIO('out')
        .setMaxIOSize(t.itemsIn, t.itemsOut, t.fluidsIn, t.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.DOWN_TO_UP)
        .setSound(GTSoundEntries.ELECTROLYZER)
    }
    if (IOO.plant.active) {
      var p = IOO.plant.maxIO
      event.create(IOO.plant.type).category('multiblock').setEUIO('in')
        .setMaxIOSize(p.itemsIn, p.itemsOut, p.fluidsIn, p.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_BOILER_HEAT, FillDirection.DOWN_TO_UP)
        .setSound(GTSoundEntries.CHEMICAL)
    }
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    console.info(LOG + 'Io-orbit slot: ' + mode + (IOO.tether.active ? ' (flux-tube tether in ' + IOO.tether.site + ')'
      : IOO.plant.active ? ' (sulfur-iodine plant on ' + IOO.plant.site + ')' : ' (neither machine registered)'))
    if (IOO.tether.active) {
      Pat.register(IOO.tether.machine, TETHER_SPEC)
      var genOpts = { maxParallels: REELS, name: 'flux_tube_tether' }
      var genDisplay = Gen.display(genOpts)
      var tetherSite = siteLine(IOO.tether.offSite, IOO.tether.site, 'flux-tube tether')
      // lib/generators.js's pieces (as the volcanic intake): no regress, so a waiting run never pays twice
      event.create('flux_tube_tether', 'multiblock')
        .langValue('Flux-Tube Tether')
        .rotationState(RotationState.NON_Y_AXIS)
        .allowExtendedFacing(false)
        .generator(true)
        .regressWhenWaiting(false)
        .recipeType(IOO.tether.type)
        .recipeModifier(Gen.modifier(genOpts), true)
        .afterWorking(G.freshRun.afterWorking('flux_tube_tether'))
        .additionalDisplay(function (controller, list) {
          genDisplay(controller, list)
          tetherSite(controller, list)
        })
        .appearanceBlock(function () { return Block.getBlock(TRUSS) })
        .pattern(function (def) { return Pat.build(def, TETHER_SPEC) })
        ['tooltips(net.minecraft.network.chat.Component[])']([
          Text.translate('grindless.machine.flux_tube_tether.tooltip.0'),
          Text.translate('grindless.machine.flux_tube_tether.tooltip.1'),
          Text.translate('grindless.machine.flux_tube_tether.tooltip.2'),
          Text.translate('grindless.machine.flux_tube_tether.tooltip.3')
        ])
        .workableCasingModel('grindless:block/luv/station_truss_casing', 'grindless:block/multiblock/flux_tube_tether')
    }
    if (IOO.plant.active) {
      Pat.register(IOO.plant.machine, PLANT_SPEC)
      var keep = { which: 'both', reason: IOO.plant.noVoiding, name: 'sulfur-iodine plant' }
      event.create('sulfur_iodine_plant', 'multiblock')
        .langValue('Sulfur-Iodine Plant')
        .rotationState(RotationState.NON_Y_AXIS)
        .allowExtendedFacing(false)
        .recipeType(IOO.plant.type)
        .recipeModifier(G.noVoiding.modifier(keep, plantModifier()), true)
        .beforeWorking(G.noVoiding.beforeWorking(keep))
        .afterWorking(G.freshRun.afterWorking('sulfur_iodine_plant'))
        .additionalDisplay(siteLine(IOO.plant.offSite, IOO.plant.site, 'sulfur-iodine plant'))
        .appearanceBlock(function () { return Block.getBlock(VAULT) })
        .pattern(function (def) { return Pat.build(def, PLANT_SPEC) })
        ['tooltips(net.minecraft.network.chat.Component[])']([
          Text.translate('grindless.machine.sulfur_iodine_plant.tooltip.0'),
          Text.translate('grindless.machine.sulfur_iodine_plant.tooltip.1'),
          Text.translate('grindless.machine.sulfur_iodine_plant.tooltip.2'),
          Text.translate('grindless.machine.sulfur_iodine_plant.tooltip.3')
        ])
        .workableCasingModel('grindless:block/luv/radiation_vault_casing', 'grindless:block/multiblock/sulfur_iodine_plant')
    }
  })
})()
