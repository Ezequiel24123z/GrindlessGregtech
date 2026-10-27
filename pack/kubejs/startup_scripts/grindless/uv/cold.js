// priority: -9300
// -----------------------------------------------------------------------------------------------
// UV's cold works (docs/eras/uv.md, machines 5 and 6; package UV-A4): two machines, their recipe types, the five items and the two
// fluids only they make. Every other UV id is F1's (global.grindless.uvFoundation).
//
//   gtceu:superfluid_helium_plant   helium II at 1.9 K, below the lambda point (machine 5). 7 wide x 7 high x 9 deep on LuV's frostproof
//                                   cryostat casing: stainless gearboxes (the cold compressors) at both ends of the floor, a PTFE
//                                   pipe casing column (the superleak stage) in the middle; parts on the back and front floor rows.
//   gtceu:superfluid_helium         its recipe type (EU in): the cryostat's fluid recipes (server_scripts/grindless/uv/cold.js).
//   gtceu:srf_cavity_works          the superconducting radio-frequency cryomodule's six-step chain (machine 6), 7 x 7 x 9 on clean room
//                                   casing: an electron-beam furnace (heatproof casing), a press (tungsten steel frame), an electropolish
//                                   bath (PTFE pipe casing) and a vacuum furnace (stainless gearbox rotor).
//   gtceu:srf_cavity                its recipe type (EU in); the programmed circuit picks the step: 1 RRR, 2 cavity, 3 surface, 4 cryomodule.
//
// Items (grindless:, names in client_scripts/grindless/uv_cold_lang.js): rrr_niobium_sheet, niobium_scrap, bare_srf_cavity, srf_cavity,
// mu_metal_shield. Fluids (GT materials): gtceu:electropolish_acid (HF + sulfuric acid), gtceu:spent_electropolish_acid.
//
// Parts (both): 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output buses, 1-2 output hatches (the plant: no buses), at least
// 8 casings among the part cells. Textures: the helium refrigerator's overlay dir on the frostproof casing, the qubit fab's on the clean
// casing; item icons from tools/assets/Build-UVColdTextures.ps1. Published: global.grindless.cold.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const C = G.cold || (G.cold = {})

  const PLANT = 'gtceu:superfluid_helium_plant'
  const PLANT_TYPE = 'superfluid_helium'
  const WORKS = 'gtceu:srf_cavity_works'
  const WORKS_TYPE = 'srf_cavity'

  const FROST = 'gtceu:frostproof_machine_casing'
  const FROST_TEXTURE = 'gtceu:block/casings/solid/machine_casing_frost_proof'
  const FROST_OVERLAY = 'grindless:block/multiblock/helium_refrigerator'
  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const CLEAN_OVERLAY = 'grindless:block/multiblock/qubit_fab'
  const GEARBOX = 'gtceu:stainless_steel_gearbox'
  const PIPE = 'gtceu:ptfe_pipe_casing'
  const HEAT = 'gtceu:heatproof_machine_casing'
  const PRESS = 'tungsten_steel'

  // item name -> stack size; two tooltip lines each (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    rrr_niobium_sheet: { stack: 64 },
    niobium_scrap: { stack: 64 },
    bare_srf_cavity: { stack: 16 },
    srf_cavity: { stack: 16 },
    mu_metal_shield: { stack: 16 }
  }

  // GT material name -> colour and formula (liquids; GTM colours and buckets them)
  const MATERIALS = {
    electropolish_acid: { colour: 0xC9D6A0, formula: 'HF(H2SO4)' },
    spent_electropolish_acid: { colour: 0x8E9A70, formula: 'HF(H2SO4)(NbF5)' }
  }

  C.plant = PLANT
  C.works = WORKS
  C.plantType = 'gtceu:' + PLANT_TYPE
  C.worksType = 'gtceu:' + WORKS_TYPE
  C.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  C.materials = Object.keys(MATERIALS).map(function (name) { return 'gtceu:' + name })
  C.ids = {
    rrrNiobiumSheet: 'grindless:rrr_niobium_sheet',
    niobiumScrap: 'grindless:niobium_scrap',
    bareSrfCavity: 'grindless:bare_srf_cavity',
    srfCavity: 'grindless:srf_cavity',
    muMetalShield: 'grindless:mu_metal_shield',
    electropolishAcid: 'gtceu:electropolish_acid',
    spentElectropolishAcid: 'gtceu:spent_electropolish_acid'
  }
  // plant: fluid in 1, out 2 (superfluid helium + helium-3 concentrate), no items;
  // works: items in 4 (three inputs and the circuit), out 2 (sheets and scrap), fluids in 2, out 1 (the spent acid)
  C.plantIO = { itemsIn: 0, itemsOut: 0, fluidsIn: 1, fluidsOut: 2 }
  C.worksIO = { itemsIn: 4, itemsOut: 2, fluidsIn: 2, fluidsOut: 1 }
  C.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 2 },
    minCasings: 8
  }

  // ---------------------------------------------------------------- patterns
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front; 7 wide, 7 high, 9 deep

  function cells(casing, ability) {
    var options = [
      Pat.block(casing, { min: C.parts.minCasings }),
      Pat.part('energy_input', C.parts.energy_input),
      Pat.part('input_hatch', C.parts.input_hatch),
      Pat.part('output_hatch', C.parts.output_hatch)
    ]
    if (ability) {
      options.push(Pat.part('input_bus', C.parts.input_bus))
      options.push(Pat.part('output_bus', C.parts.output_bus))
    }
    return Pat.oneOf.apply(null, options)
  }

  // a wall slice with a floor row of parts, a ring slice with its five interior rows (bottom -> top)
  function wall(floor) { return [floor, 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR'] }
  function ring(interior) {
    var rows = ['RRRRRRR']
    interior.forEach(function (row) { rows.push('R' + row + 'R') })
    rows.push('RRRRRRR')
    return rows
  }
  function front() {
    return ['XXXXXXX', 'RRRSRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR']
  }
  const EMPTY = '#####'

  const PLANT_SPEC = {
    slices: [
      wall('XXXXXXX'),
      ring([EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]),
      ring(['G###G', EMPTY, EMPTY, EMPTY, EMPTY]),
      ring([EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]),
      ring(['##P##', '##P##', '##P##', EMPTY, EMPTY]),
      ring([EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]),
      ring(['G###G', EMPTY, EMPTY, EMPTY, EMPTY]),
      ring([EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]),
      front()
    ],
    symbols: {
      S: Pat.controller(),
      X: cells(FROST, false),
      R: Pat.block(FROST),
      G: Pat.block(GEARBOX),
      P: Pat.block(PIPE),
      '#': Pat.air()
    }
  }
  C.plantSpec = PLANT_SPEC

  const WORKS_SPEC = {
    slices: [
      wall('XXXXXXX'),
      ring([EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]),
      ring(['MM###', 'MM###', '#####', '#####', '#####']),
      ring(['MM###', 'MM###', '#####', '###PP', '###PP']),
      ring(['#####', '#####', '#####', '###PP', '###PP']),
      ring(['###HH', '###HH', '#####', '#####', '#####']),
      ring(['###HH', '###HH', '#####', '##GG#', '#####']),
      ring([EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]),
      front()
    ],
    symbols: {
      S: Pat.controller(),
      X: cells(CLEAN, true),
      R: Pat.block(CLEAN),
      G: Pat.block(GEARBOX),
      H: Pat.block(HEAT),
      P: Pat.block(PIPE),
      M: Pat.frame([PRESS]),
      '#': Pat.air()
    }
  }
  C.worksSpec = WORKS_SPEC

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var p = C.plantIO
    event.create(PLANT_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(p.itemsIn, p.itemsOut, p.fluidsIn, p.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.COOLING)
    var w = C.worksIO
    event.create(WORKS_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(w.itemsIn, w.itemsOut, w.fluidsIn, w.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ELECTROLYZER)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(PLANT, PLANT_SPEC)
    Pat.register(WORKS, WORKS_SPEC)

    event.create('superfluid_helium_plant', 'multiblock')
      .langValue('Superfluid Helium Plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(PLANT_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(FROST) })
      .pattern(function (def) { return Pat.build(def, PLANT_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.superfluid_helium_plant.tooltip.0'),
        Text.translate('grindless.machine.superfluid_helium_plant.tooltip.1'),
        Text.translate('grindless.machine.superfluid_helium_plant.tooltip.2'),
        Text.translate('grindless.machine.superfluid_helium_plant.tooltip.3')
      ])
      .workableCasingModel(FROST_TEXTURE, FROST_OVERLAY)

    event.create('srf_cavity_works', 'multiblock')
      .langValue('SRF Cavity Works')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(WORKS_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CLEAN) })
      .pattern(function (def) { return Pat.build(def, WORKS_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.srf_cavity_works.tooltip.0'),
        Text.translate('grindless.machine.srf_cavity_works.tooltip.1'),
        Text.translate('grindless.machine.srf_cavity_works.tooltip.2'),
        Text.translate('grindless.machine.srf_cavity_works.tooltip.3')
      ])
      .workableCasingModel(CLEAN_TEXTURE, CLEAN_OVERLAY)
  })

  // ---------------------------------------------------------------- items and fluids

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
      event.create(name)
        .liquid()
        .color(MATERIALS[name].colour)
        .formula(MATERIALS[name].formula)
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
