// priority: -7900
// -----------------------------------------------------------------------------------------------
// UHV's fibres and the space elevator (docs/eras/uhv.md, machines 14 and 15, line 24; package UHV-A7): the PBO plant, the tether ribbon
// works, their recipe types, line 24's intermediates and the GEO-assembled stage the elevator lifts. GTCA's space elevator
// (gtca:space_elevator, type gtceu:space_elevator) is GTCA's own machine; S0-8 proved it forms and runs a KubeJS recipe. Every other UHV id
// is F1's (global.grindless.uhvFoundation): the PBO fibre, the PBO dope, the ribbon segment, the climber.
//
//   gtceu:pbo_plant           poly(p-phenylene benzobisoxazole), Zylon (machine 14). 13 wide x 6 high x 15 deep of chemically inert
//                             casing: a reactor hall (nitration, hydrolysis, reduction, polymerisation vessels of PTFE pipe casing on
//                             gearbox plinths, a frame feed line) beside the 12 high spinneret tower (a PTFE column over the take-up gearbox).
//   gtceu:pbo_synthesis       its recipe type (EU in); the programmed circuit picks the step: 1 nitrate, 2 hydrolyse, 3 reduce,
//                             4 polymerise, 5 spin.
//   gtceu:tether_ribbon_works the ribbon braider and climber bench (machine 15). 19 wide x 6 high x 7 deep of robust tungsten steel
//                             casing: a braiding hall with a tension frame (tungsten steel frames) down the middle and a row of
//                             gearbox bobbin carousels along it and on either side.
//   gtceu:tether_ribbon       its recipe type (EU in); circuits: 1 ribbon, 2 climber.
//
// Items (grindless:, names in client_scripts/grindless/uhv_elevator_lang.js): geo_assembled_stage, the heavy stage put together at the
// top of the tether: the elevator's run recipe (server_scripts/grindless/uhv/elevator.js) makes it and UHV-A8's level 8 rocket takes it.
// Materials (GT materials): trichlorobenzene, dinitrotrichlorobenzene, polyphosphoric_acid (liquids); chlorodinitroresorcinol,
// diaminoresorcinol, terephthalic_acid (dusts).
//
// Parts: 1-2 energy hatches, 1-2 input buses, 1-2 output buses (both), 1-2 input and output hatches (the plant only) in the floor
// cells, at least 8 (plant) or 12 (works) casings among them. Textures: the methane pyrolyser's overlay on inert casing (plant), the composite autoclave's
// on robust tungsten steel (works); the stage's icon from tools/assets/Build-UHVElevatorTextures.ps1. Published: global.grindless.elevator.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const E = G.elevator || (G.elevator = {})

  const PLANT = 'gtceu:pbo_plant'
  const PLANT_TYPE = 'pbo_synthesis'
  const WORKS = 'gtceu:tether_ribbon_works'
  const WORKS_TYPE = 'tether_ribbon'

  const INERT = 'gtceu:inert_machine_casing'
  const INERT_TEXTURE = 'gtceu:block/casings/solid/machine_casing_inert_ptfe'
  const PLANT_OVERLAY = 'grindless:block/multiblock/methane_pyrolyser'
  const ROBUST = 'gtceu:robust_machine_casing'
  const ROBUST_TEXTURE = 'gtceu:block/casings/solid/machine_casing_robust_tungstensteel'
  const WORKS_OVERLAY = 'grindless:block/multiblock/composite_autoclave'
  const PIPE = 'gtceu:ptfe_pipe_casing'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'
  const FRAME = 'tungsten_steel'
  const GLASS = 'gtceu:laminated_glass'

  // item name -> stack size; two tooltip lines each (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    geo_assembled_stage: { stack: 16 }
  }

  // GT material name -> form, colour and formula; GTM colours the dusts and buckets the liquids
  const MATERIALS = {
    trichlorobenzene: { form: 'liquid', colour: 0xD8E0C0, formula: 'C6H3Cl3' },
    dinitrotrichlorobenzene: { form: 'liquid', colour: 0xE0D070, formula: 'C6HCl3N2O4' },
    polyphosphoric_acid: { form: 'liquid', colour: 0xE8E4C8, formula: 'H6P4O13' },
    chlorodinitroresorcinol: { form: 'dust', colour: 0xE8C040, formula: 'C6H3ClN2O6' },
    diaminoresorcinol: { form: 'dust', colour: 0xC8C0B0, formula: 'C6H8N2O2(HCl)2' },
    terephthalic_acid: { form: 'dust', colour: 0xF4F4F0, formula: 'C8H6O4' }
  }

  E.plant = PLANT
  E.works = WORKS
  E.plantType = 'gtceu:' + PLANT_TYPE
  E.worksType = 'gtceu:' + WORKS_TYPE
  E.elevator = 'gtca:space_elevator'
  E.elevatorType = 'gtceu:space_elevator'
  E.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  E.materials = Object.keys(MATERIALS).map(function (name) { return 'gtceu:' + name })
  E.ids = {}
  Object.keys(ITEMS).concat(Object.keys(MATERIALS)).forEach(function (name) {
    var key = name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() })
    E.ids[key] = (MATERIALS[name] ? 'gtceu:' : 'grindless:') + name
  })
  // plant: items in 3 (diaminoresorcinol, terephthalic acid and the circuit; or the reducer's palladium), out 2 (resorcinol + salt),
  // fluids in 2, out 2 (dope + HCl); works: items in 4 (three yarns or three parts, and the circuit), out 1, no fluids
  E.plantIO = { itemsIn: 3, itemsOut: 2, fluidsIn: 2, fluidsOut: 2 }
  E.worksIO = { itemsIn: 4, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }
  E.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 2 }
  }
  E.minCasings = { plant: 8, works: 12 }
  // the works handles no fluids: no hatches
  E.abilities = {
    plant: ['energy_input', 'input_bus', 'input_hatch', 'output_bus', 'output_hatch'],
    works: ['energy_input', 'input_bus', 'output_bus']
  }
  E.blocks = { inert: INERT, robust: ROBUST, pipe: PIPE, gearbox: GEARBOX, frame: FRAME }

  // ---------------------------------------------------------------- patterns
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front

  function cells(casing, min, abilities) {
    var options = [Pat.block(casing, { min: min })]
    abilities.forEach(function (a) { options.push(Pat.part(a, E.parts[a])) })
    options.push(G.parallelHatch.part())
    return Pat.oneOf.apply(null, options)
  }

  function build(width, height, depth, cell) {
    var slices = []
    for (var z = 0; z < depth; z++) {
      var rows = []
      for (var y = 0; y < height; y++) {
        var row = ''
        for (var x = 0; x < width; x++) row += cell(x, z, y)
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // the plant: a 13 x 6 x 15 reactor hall (four PTFE reactor vessels on gearbox plinths, a frame feed line between them) beside a 5 x 5
  // spinning tower 12 high at the back right corner (a PTFE spinneret column on a take-up gearbox). Inert casing walls with frame posts,
  // roof ribs, an accent course at the foot and laminated glass between casing mullions. ' ' is anything above the lower hall.
  function plantCell(x, z, y) {
    var W = 13
    var D = 15
    var TW = 5
    var tower = x >= W - TW && z <= TW - 1
    var h = tower ? 12 : 6
    if (y >= h) return ' '
    var ex = x === 0 || x === W - 1
    var ez = z === 0 || z === D - 1
    var rim = ex || ez || (tower && (x === W - TW || z === TW - 1) && x !== W - 1 && z !== 0)
    var top = y === h - 1
    if (y === 0) return tower && !rim ? 'R' : 'X'
    if (tower && !rim) {
      if (top) return 'A'
      if (x === W - 3 && z === 2) return y === 1 ? 'G' : 'P'
      return '#'
    }
    if (top) {
      if (rim) return 'Q'
      return (x + z) % 3 === 0 ? 'A' : 'R'
    }
    if (rim) {
      if (ex && ez) return 'Q'
      if (z === D - 1 && x === 6 && y === 1) return 'S'
      if (y === 1) return 'A'
      return (ez ? x : z) % 3 === 0 ? 'R' : 'L'
    }
    if ((x === 3 || x === 7) && (z === 4 || z === 8 || z === 12)) return y === 1 ? 'G' : 'P'
    if (x === 5 && z >= 3 && z <= D - 4 && y === 2) return 'F'
    return '#'
  }
  const PLANT_SPEC = {
    slices: build(13, 12, 15, plantCell),
    symbols: {
      S: Pat.controller(),
      X: cells(INERT, E.minCasings.plant, E.abilities.plant),
      R: Pat.block(INERT),
      A: Pat.block(ROBUST),
      L: Pat.block(GLASS),
      Q: Pat.frame([FRAME]),
      P: Pat.block(PIPE),
      G: Pat.block(GEARBOX),
      F: Pat.frame([FRAME]),
      '#': Pat.air()
    }
  }
  E.plantSpec = PLANT_SPEC

  // the works: a 19 x 6 x 7 braiding hall; a tension frame runs its length down the middle with a gearbox bobbin carousel on it every four
  // columns, and two more carousel rows stand on either side. Robust tungsten steel casing walls with frame posts, inert casing ribs and glass.
  function worksCell(x, z, y) {
    var W = 19
    var D = 7
    var ex = x === 0 || x === W - 1
    var ez = z === 0 || z === D - 1
    var rim = ex || ez
    if (y === 0) return 'X'
    if (y === 5) {
      if (rim) return 'Q'
      return x % 4 === 2 ? 'A' : 'R'
    }
    if (rim) {
      if (ex && ez) return 'Q'
      if (z === D - 1 && x === 9 && y === 1) return 'S'
      if (y === 1) return 'A'
      return (ez ? x : z) % 3 === 0 ? 'R' : 'L'
    }
    if (z === 3 && y === 2) return 'F'
    if (x % 4 === 2) {
      if (z === 3 && y === 1) return 'G'
      if ((z === 1 || z === 5) && y <= 2) return 'G'
    }
    return '#'
  }
  const WORKS_SPEC = {
    slices: build(19, 6, 7, worksCell),
    symbols: {
      S: Pat.controller(),
      X: cells(ROBUST, E.minCasings.works, E.abilities.works),
      R: Pat.block(ROBUST),
      A: Pat.block(INERT),
      L: Pat.block(GLASS),
      Q: Pat.frame([FRAME]),
      G: Pat.block(GEARBOX),
      F: Pat.frame([FRAME]),
      '#': Pat.air()
    }
  }
  E.worksSpec = WORKS_SPEC

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var p = E.plantIO
    event.create(PLANT_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(p.itemsIn, p.itemsOut, p.fluidsIn, p.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
    var w = E.worksIO
    event.create(WORKS_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(w.itemsIn, w.itemsOut, w.fluidsIn, w.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_WIREMILL, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ASSEMBLER)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(PLANT, PLANT_SPEC)
    Pat.register(WORKS, WORKS_SPEC)

    event.create('pbo_plant', 'multiblock')
      .langValue('PBO Plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(PLANT_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(INERT) })
      .pattern(function (def) { return Pat.build(def, PLANT_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.pbo_plant.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.pbo_synthesis')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ])
      .workableCasingModel(INERT_TEXTURE, PLANT_OVERLAY)

    event.create('tether_ribbon_works', 'multiblock')
      .langValue('Tether Ribbon Works')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(WORKS_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(ROBUST) })
      .pattern(function (def) { return Pat.build(def, WORKS_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.tether_ribbon_works.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.tether_ribbon')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ])
      .workableCasingModel(ROBUST_TEXTURE, WORKS_OVERLAY)
  })

  // ---------------------------------------------------------------- items and materials

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MATERIALS).forEach(function (name) {
      var spec = MATERIALS[name]
      var material = event.create(name)
      if (spec.form === 'liquid') material.liquid()
      else material.dust()
      material.color(spec.colour).formula(spec.formula)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
