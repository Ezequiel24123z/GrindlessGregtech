// LuV B6, Io's surface (docs/eras/luv.md, sections 14 and 15; decision 7). A1 owns the sublimate, the bundle and both casings; the
// world blocks are Biomes O' Plenty's fumarole and vanilla magma, by id. Io's dimension comes only from G.places (tables/places.json).
//
//   gtceu:fumarole_condenser  type gtceu:fumarole_condensing. A 5x5x2 vault housing over a 3x3 fumarole field (three
//                             biomesoplenty:brimstone_fumarole in the floor, under the column) and a 3x3 column of four condenser zones,
//                             hot to cold: robust tungstensteel, clean stainless steel, aluminium frames, frostproof casing. Circuit 1
//                             collects (only on Io), 2 separates the sublimate (anywhere), 3 casts sulfur concrete (only on Io). It keeps
//                             everything it makes (lib/no_voiding.js in the modifier and in beforeWorking) and takes the parallel hatch.
//   gtceu:volcanic_intake     generator type gtceu:volcanic_heat. A 3x3 hot plate on magma, a 5x5x10 heat-exchanger tower of sulfur
//                             concrete with a vault room at its foot, radiator fins on top and four 3x3x3 titanium turbine module slots.
//                             One parallel per complete module (1 to 4), counted in the world at every run start (fresh_run). It burns
//                             nothing, so it is not doubled; only on Io.
//
// Radiation (decision 7) is a machine rule: every cell that may hold a hatch, a bus or the controller's neighbours is a vault cell, so
// the electronics of both machines sit behind grindless:radiation_vault_casing.
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right as seen from the front).
(function () {
  var G = global.grindless
  var Pat = G.patterns
  var PH = G.parallelHatch
  var Gen = G.generators
  var LOG = '[grindless/io_surface] '

  var VAULT = 'grindless:radiation_vault_casing'
  var CONCRETE = 'grindless:sulfur_concrete_casing'
  var FUMAROLE = 'biomesoplenty:brimstone_fumarole'
  var MAGMA = 'minecraft:magma_block'
  var ROBUST = 'gtceu:robust_machine_casing'
  var CLEAN = 'gtceu:clean_machine_casing'
  var FROSTPROOF = 'gtceu:frostproof_machine_casing'
  var FIREBOX = 'gtceu:tungstensteel_firebox_casing'
  var TS_PIPE = 'gtceu:tungstensteel_pipe_casing'
  var TURBINE = 'gtceu:titanium_turbine_casing'
  var RADIATOR = 'grindless:night_sky_radiator'

  // ---------------------------------------------------------------- fumarole condenser, 5 wide x 15 high x 5 deep
  //   F fumarole (the field, under the column)   X vault housing: vault casing or a part   A air   T robust tungstensteel casing
  //   N clean stainless steel casing   L aluminium frame   K frostproof casing   S controller
  var CONDENSER_PARTS = {
    energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 3 }, output_hatch: { min: 1, max: 2 }
  }
  var CONDENSER_ZONES = ['T', 'N', 'L', 'K']
  function condenserSlice(si) {
    var edge = si === 0 || si === 4
    var middle = si === 2
    var rows = []
    rows.push(edge ? '     ' : '  F  ')
    rows.push(si === 4 ? 'XXSXX' : edge ? 'XXXXX' : 'XAAAX')
    // the housing's roof, with the column's gas hole in the middle
    rows.push(middle ? 'XXAXX' : 'XXXXX')
    CONDENSER_ZONES.forEach(function (z) {
      for (var i = 0; i < 3; i++) rows.push(edge ? '     ' : middle ? ' ' + z + 'A' + z + ' ' : ' ' + z + z + z + ' ')
    })
    return rows
  }
  var condenserSlices = []
  for (var cs = 0; cs < 5; cs++) condenserSlices.push(condenserSlice(cs))
  var CONDENSER_SPEC = {
    slices: condenserSlices,
    symbols: {
      S: Pat.controller(),
      // 39 housing cells: 5 to 11 hatches and buses and an optional parallel hatch, the rest vault casing
      X: Pat.oneOf(
        Pat.block(VAULT, { min: 24 }),
        Pat.part('energy_input', CONDENSER_PARTS.energy_input),
        Pat.part('input_bus', CONDENSER_PARTS.input_bus),
        Pat.part('output_bus', CONDENSER_PARTS.output_bus),
        Pat.part('input_hatch', CONDENSER_PARTS.input_hatch),
        Pat.part('output_hatch', CONDENSER_PARTS.output_hatch),
        PH.part()),
      F: Pat.block(FUMAROLE),
      A: Pat.air(),
      T: Pat.block(ROBUST),
      N: Pat.block(CLEAN),
      L: Pat.frame(['aluminium']),
      K: Pat.block(FROSTPROOF)
    }
  }

  // ---------------------------------------------------------------- volcanic intake, 11 wide x 12 high x 5 deep
  //   C sulfur concrete   M magma (the patera's crust)   P tungstensteel firebox (the hot plate)   X vault room: vault casing or a part
  //   A air   J tungstensteel pipe casing (the exchanger's riser)   R night-sky radiator (the fins)   S controller
  //   a the first turbine module (titanium turbine casing, required); b, c, d three more slots: a whole module or air
  var INTAKE_PARTS = { energy_output: { min: 1, max: 4 }, input_bus: { exact: 1 }, input_hatch: { exact: 1 } }
  var MODULES = [
    { sym: 'a', col: 0, row: 1 }, { sym: 'b', col: 8, row: 1 },
    { sym: 'c', col: 0, row: 4 }, { sym: 'd', col: 8, row: 4 }
  ]
  var INTAKE_CONTROLLER = { slice: 4, row: 2, col: 5 }
  function towerRow(si, ri) {
    var edge = si === 0 || si === 4
    var middle = si === 2
    if (ri === 0) return edge ? 'CCCCC' : 'CMMMC'
    if (ri === 1) return edge ? 'XXXXX' : 'XPPPX'
    if (ri <= 3) {
      if (si === 4 && ri === 2) return 'XXSXX'
      return edge ? 'XXXXX' : middle ? 'XAJAX' : 'XAAAX'
    }
    if (ri <= 9) return edge ? 'CCCCC' : middle ? 'CAJAC' : 'CAAAC'
    if (ri === 10) return middle ? 'CCJCC' : 'CCCCC'
    return 'R R R'
  }
  function moduleAt(si, ri, side) {
    if (si < 1 || si > 3) return '   '
    for (var m = 0; m < MODULES.length; m++) {
      var mod = MODULES[m]
      if ((mod.col === 0) === (side === 'left') && ri >= mod.row && ri < mod.row + 3) return mod.sym + mod.sym + mod.sym
    }
    return '   '
  }
  var intakeSlices = []
  for (var is = 0; is < 5; is++) {
    var rows = []
    for (var ir = 0; ir < 12; ir++) rows.push(moduleAt(is, ir, 'left') + towerRow(is, ir) + moduleAt(is, ir, 'right'))
    intakeSlices.push(rows)
  }
  function optionalModule() { return Pat.oneOf(Pat.block(TURBINE), Pat.air()) }
  var INTAKE_SPEC = {
    slices: intakeSlices,
    symbols: {
      S: Pat.controller(),
      // 47 vault-room cells: 3 to 6 are parts, the rest vault casing
      X: Pat.oneOf(
        Pat.block(VAULT, { min: 30 }),
        Pat.part('energy_output', INTAKE_PARTS.energy_output),
        Pat.part('input_bus', INTAKE_PARTS.input_bus),
        Pat.part('input_hatch', INTAKE_PARTS.input_hatch)),
      C: Pat.block(CONCRETE),
      M: Pat.block(MAGMA),
      P: Pat.block(FIREBOX),
      A: Pat.air(),
      J: Pat.block(TS_PIPE),
      R: Pat.block(RADIATOR),
      a: Pat.block(TURBINE),
      b: optionalModule(),
      c: optionalModule(),
      d: optionalModule()
    }
  }

  // every module's 27 cells relative to the controller: up, back (towards the back slice) and side (columns to the right)
  var moduleCells = MODULES.map(function (mod) {
    var cells = []
    intakeSlices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          if (row.charAt(ci) === mod.sym) {
            cells.push({ up: ri - INTAKE_CONTROLLER.row, back: INTAKE_CONTROLLER.slice - si, side: ci - INTAKE_CONTROLLER.col })
          }
        }
      })
    })
    if (cells.length !== 27) throw new Error(LOG + 'module ' + mod.sym + ' has ' + cells.length + ' cells, not 27')
    return cells
  })

  var steps = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] }
  var turbineBlock = null
  // complete turbine modules (1 to 4) in the world around a formed intake. The four slots are mirror images of each other, so the count
  // does not depend on which way the columns run.
  function modules(machine) {
    var level = machine.getLevel()
    if (level == null) return 0
    var step = steps[String(machine.getFrontFacing()).toLowerCase()]
    if (!step) return 0
    if (turbineBlock === null) turbineBlock = Block.getBlock(TURBINE)
    var pos = machine.getPos()
    var complete = 0
    moduleCells.forEach(function (cells) {
      for (var i = 0; i < cells.length; i++) {
        var p = cells[i]
        var at = pos.offset(-step[0] * p.back + step[1] * p.side, p.up, -step[1] * p.back - step[0] * p.side)
        if (!level.getBlockState(at).is(turbineBlock)) return
      }
      complete++
    })
    return complete
  }

  function dimensionOf(level) {
    if (level === null || level === undefined) return ''
    try {
      return String(level.getDimension())
    } catch (e) {
      return String(level.getDimensionKey().location())
    }
  }

  // one controller line when the machine stands off Io (GTM's dimension condition shows nothing by itself)
  function siteLine(key, what) {
    var failed = false
    return function (controller, list) {
      try {
        if (!controller.isFormed()) return
        if (dimensionOf(controller.getLevel()) !== G.places.surface('io')) list.add(Text.translate(key))
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + what + ' controller display failed: ' + e)
        }
      }
    }
  }

  var IO = G.ioSurface = {
    place: 'io',
    blocks: { vault: VAULT, concrete: CONCRETE, fumarole: FUMAROLE, magma: MAGMA, turbine: TURBINE },
    condenser: {
      machine: 'gtceu:fumarole_condenser',
      type: 'fumarole_condensing',
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 2, fluidsOut: 1 },
      parts: CONDENSER_PARTS,
      spec: CONDENSER_SPEC,
      fumaroles: 3,
      noVoiding: 'grindless.machine.fumarole_condenser.no_voiding',
      offSite: 'grindless.machine.fumarole_condenser.off_io'
    },
    intake: {
      machine: 'gtceu:volcanic_intake',
      type: 'volcanic_heat',
      maxIO: { itemsIn: 2, itemsOut: 0, fluidsIn: 1, fluidsOut: 0 },
      parts: INTAKE_PARTS,
      spec: INTAKE_SPEC,
      controller: INTAKE_CONTROLLER,
      moduleCells: moduleCells,
      maxModules: MODULES.length,
      modules: modules,
      offSite: 'grindless.machine.volcanic_intake.off_io'
    }
  }

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var c = IO.condenser.maxIO
    event.create(IO.condenser.type).category('multiblock').setEUIO('in')
      .setMaxIOSize(c.itemsIn, c.itemsOut, c.fluidsIn, c.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.DOWN_TO_UP)
      .setSound(GTSoundEntries.CHEMICAL)
    var t = IO.intake.maxIO
    event.create(IO.intake.type).category('multiblock').setEUIO('out')
      .setMaxIOSize(t.itemsIn, t.itemsOut, t.fluidsIn, t.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_BOILER_HEAT, FillDirection.DOWN_TO_UP)
      .setSound(GTSoundEntries.TURBINE)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(IO.condenser.machine, CONDENSER_SPEC)
    Pat.register(IO.intake.machine, INTAKE_SPEC)

    var keep = { which: 'both', reason: IO.condenser.noVoiding, name: 'fumarole condenser' }
    event.create('fumarole_condenser', 'multiblock')
      .langValue('Fumarole Condenser')
      .rotationState(RotationState.NON_Y_AXIS)
      .allowExtendedFacing(false)
      .recipeType(IO.condenser.type)
      .recipeModifier(G.noVoiding.modifier(keep, PH.modifier(PH.overclock)), true)
      .beforeWorking(G.noVoiding.beforeWorking(keep))
      .additionalDisplay(siteLine(IO.condenser.offSite, 'fumarole condenser'))
      .appearanceBlock(function () { return Block.getBlock(VAULT) })
      .pattern(function (def) { return Pat.build(def, CONDENSER_SPEC) })
      ['tooltips(net.minecraft.network.chat.Component[])']([
        Text.translate('grindless.machine.fumarole_condenser.tooltip.0'),
        Text.translate('grindless.machine.fumarole_condenser.tooltip.1'),
        Text.translate('grindless.machine.fumarole_condenser.tooltip.2'),
        Text.translate('grindless.machine.fumarole_condenser.tooltip.3')
      ])
      .workableCasingModel('grindless:block/luv/radiation_vault_casing', 'grindless:block/multiblock/fumarole_condenser')

    var genOpts = { maxParallels: modules, name: 'volcanic_intake' }
    var genDisplay = Gen.display(genOpts)
    var intakeSite = siteLine(IO.intake.offSite, 'volcanic intake')
    // lib/generators.js's pieces (as the Venus heat engine): no regress, so a waiting run never pays twice
    event.create('volcanic_intake', 'multiblock')
      .langValue('Volcanic Intake')
      .rotationState(RotationState.NON_Y_AXIS)
      .allowExtendedFacing(false)
      .generator(true)
      .regressWhenWaiting(false)
      .recipeType(IO.intake.type)
      .recipeModifier(Gen.modifier(genOpts), true)
      .afterWorking(G.freshRun.afterWorking('volcanic_intake'))
      .additionalDisplay(function (controller, list) {
        genDisplay(controller, list)
        intakeSite(controller, list)
      })
      .appearanceBlock(function () { return Block.getBlock(CONCRETE) })
      .pattern(function (def) { return Pat.build(def, INTAKE_SPEC) })
      ['tooltips(net.minecraft.network.chat.Component[])']([
        Text.translate('grindless.machine.volcanic_intake.tooltip.0'),
        Text.translate('grindless.machine.volcanic_intake.tooltip.1'),
        Text.translate('grindless.machine.volcanic_intake.tooltip.2'),
        Text.translate('grindless.machine.volcanic_intake.tooltip.3')
      ])
      .workableCasingModel('grindless:block/luv/sulfur_concrete_casing', 'grindless:block/multiblock/volcanic_intake')
  })
})()
