// priority: -7900
// -----------------------------------------------------------------------------------------------
// UHV's fibres and the space elevator (docs/eras/uhv.md, machines 14 and 15, line 24; package UHV-A7): the PBO plant, the tether ribbon
// works, their recipe types, line 24's intermediates and the GEO-assembled stage the elevator lifts. GTCA's space elevator
// (gtca:space_elevator, type gtceu:space_elevator) is GTCA's own machine; S0-8 proved it forms and runs a KubeJS recipe. Every other UHV id
// is F1's (global.grindless.uhvFoundation): the PBO fibre, the PBO dope, the ribbon segment, the climber.
//
//   gtceu:pbo_plant           poly(p-phenylene benzobisoxazole), Zylon (machine 14). 7 wide x 5 high x 9 deep of chemically inert
//                             casing: two pairs of PTFE-lined reactor trains (nitration, hydrolysis; reduction, polymerisation), the
//                             spinneret tower (a PTFE column through the middle) and the take-up gearbox before the front wall.
//   gtceu:pbo_synthesis       its recipe type (EU in); the programmed circuit picks the step: 1 nitrate, 2 hydrolyse, 3 reduce,
//                             4 polymerise, 5 spin.
//   gtceu:tether_ribbon_works the ribbon braider and climber bench (machine 15). 11 wide x 5 high x 5 deep of robust tungsten steel
//                             casing: a tension frame (tungsten steel frames) runs the length of the middle slice between the bobbin
//                             gearboxes of the two outer slices.
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
    return Pat.oneOf.apply(null, options)
  }

  // the plant: 7 x 5 rings with three interior rows (bottom -> top) between a floor and a roof
  function ring(interior) {
    var rows = ['RRRRRRR']
    interior.forEach(function (row) { rows.push('R' + row + 'R') })
    rows.push('RRRRRRR')
    return rows
  }
  // dress the casing walls: frame posts (Q) on the corners and roof edges, accent ribs (A) on the roof and an accent course at the foot,
  // glass (L) between casing mullions in the rows above
  function dress(slices) {
    var depth = slices.length
    var height = slices[0].length
    var width = slices[0][0].length
    return slices.map(function (rows, si) {
      return rows.map(function (row, r) {
        var out = ''
        for (var c = 0; c < width; c++) {
          var ch = row.charAt(c)
          if (ch === 'R' && r > 0) {
            var ex = c === 0 || c === width - 1
            var ez = si === 0 || si === depth - 1
            var top = r === height - 1
            if ((ex && ez) || (top && (ex || ez))) ch = 'Q'
            else if (top) ch = si % 3 === 1 ? 'A' : 'R'
            else if (r === 1) ch = 'A'
            else if ((ez ? c : si) % 3 !== 0) ch = 'L'
          }
          out += ch
        }
        return out
      })
    })
  }
  const EMPTY = '#####'
  const TRAIN = ring(['PP#PP', 'PP#PP', EMPTY])
  const HALL = ring([EMPTY, EMPTY, EMPTY])
  const PLANT_SPEC = {
    slices: dress([
      ['XXXXXXX', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR'],
      TRAIN,
      HALL,
      TRAIN,
      HALL,
      ring(['##P##', '##P##', '##P##']),
      ring(['##G##', EMPTY, EMPTY]),
      HALL,
      ['XXXXXXX', 'RRRSRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR']
    ]),
    symbols: {
      S: Pat.controller(),
      X: cells(INERT, E.minCasings.plant, E.abilities.plant),
      R: Pat.block(INERT),
      A: Pat.block(ROBUST),
      L: Pat.block(GLASS),
      Q: Pat.frame([FRAME]),
      P: Pat.block(PIPE),
      G: Pat.block(GEARBOX),
      '#': Pat.air()
    }
  }
  E.plantSpec = PLANT_SPEC

  // the works: 11 x 5 x 5; the bobbin gearboxes in the outer slices, the tension frame along the middle one
  const BOBBINS = ['RRRRRRRRRRR', 'RG#######GR', 'RG#######GR', 'R#########R', 'RRRRRRRRRRR']
  const WORKS_SPEC = {
    slices: dress([
      ['XXXXXXXXXXX', 'RRRRRRRRRRR', 'RRRRRRRRRRR', 'RRRRRRRRRRR', 'RRRRRRRRRRR'],
      BOBBINS,
      ['RRRRRRRRRRR', 'R#########R', 'RFFFFFFFFFR', 'R#########R', 'RRRRRRRRRRR'],
      BOBBINS,
      ['XXXXXXXXXXX', 'RRRRRSRRRRR', 'RRRRRRRRRRR', 'RRRRRRRRRRR', 'RRRRRRRRRRR']
    ]),
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
