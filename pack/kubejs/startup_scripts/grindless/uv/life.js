// priority: -10000
// -----------------------------------------------------------------------------------------------
// UV's life (docs/eras/uv.md, machines 19 and 20, line 19; package UV-A10): the greenhouse family's step 7 and the wetware batch vat.
//
//   gtceu:ark_biosphere      GREENHOUSE FAMILY, step 7 (machine 19). An 11 wide x 9 high x 11 deep dome: a UV machine casing floor
//                            (the parts) and footing ring, laminated glass walls stepping in to a 5 x 5 glass cap, a 7 x 7
//                            photobioreactor ring inside (three laminated glass tube courses under a ring of GT lamps) round a
//                            3 x 3 x 3 anaerobic core (inert machine casing).
//   gtceu:closed_ecosystem   its recipe type (EU in); circuits: 1 cycle, 2 seed, 3 inoculate.
//   gtceu:neural_culture_vat machine 20. A 7 x 7 x 7 sterile room: plascrete floor (the parts), walls and roof, cleanroom glass windows,
//                            a 3 x 3 filter casing ceiling, four incubator columns (heatproof machine casing) in the corners and the
//                            bioprinter (two robust machine casings) in the middle.
//   gtceu:neural_culture     its recipe type (EU in); circuits: 1 stem cells, 2 neuro processing units.
//
//   grindless:algae_culture  the ark's algae bank (an item, not consumed by the cycle). LuV's algae bioreactor has no item output, so
//                            the first culture is isolated in the ark itself (circuit 3, on agar) and copied by circuit 2.
//
// Everything else is GTM's or older: archaeal culture (ZPM-A8), neural organoid (LuV organoid lab), gelatin and agar (LuV biofoundry),
// growth media, biomass, stem cells, the wetware board and the NPU (GTM). No F1 id is needed.
// Textures: grindless:block/multiblock/<machine> and grindless:item/algae_culture (tools/assets/Build-UVLifeTextures.ps1). Names:
// client_scripts/grindless/uv_life_lang.js. Published: global.grindless.life.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const L = G.life || (G.life = {})

  const ARK = 'gtceu:ark_biosphere'
  const ARK_TYPE = 'closed_ecosystem'
  const VAT = 'gtceu:neural_culture_vat'
  const VAT_TYPE = 'neural_culture'

  const UV_CASING = 'gtceu:uv_machine_casing'
  const UV_TEXTURE = 'gtceu:block/casings/voltage/uv/side'
  const GLASS = 'gtceu:laminated_glass'
  const CORE = 'gtceu:inert_machine_casing'
  const PLASCRETE = 'gtceu:plascrete'
  const PLASCRETE_TEXTURE = 'gtceu:block/casings/cleanroom/plascrete'
  const WINDOW = 'gtceu:cleanroom_glass'
  const FILTER = 'gtceu:filter_casing'
  const INCUBATOR = 'gtceu:heatproof_machine_casing'
  const PRINTER = 'gtceu:robust_machine_casing'
  const COLORS = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue',
    'brown', 'green', 'red', 'black']
  const LAMPS = COLORS.map(function (c) { return 'gtceu:' + c + '_lamp' }).concat(COLORS.map(function (c) { return 'gtceu:' + c + '_borderless_lamp' }))

  L.ark = ARK
  L.vat = VAT
  L.arkType = 'gtceu:' + ARK_TYPE
  L.vatType = 'gtceu:' + VAT_TYPE
  L.algaeCulture = 'grindless:algae_culture'
  L.items = [L.algaeCulture]
  // ark: items in 3 (two cultures + circuit), out 2 (the copied cultures); fluids in 3 (CO2, ammonia, water), out 3 (O2, medium, biomass)
  // vat: items in 3 (gelatin + organoid or stem cells + board, + circuit), out 1; fluids in 1 (medium), out 1 (biomass)
  L.arkIO = { itemsIn: 3, itemsOut: 2, fluidsIn: 3, fluidsOut: 3 }
  L.vatIO = { itemsIn: 3, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 }
  L.arkParts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 3 },
    output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 3 }
  }
  L.vatParts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 1 },
    output_bus: { min: 1, max: 1 },
    output_hatch: { min: 1, max: 1 }
  }
  L.minCasings = { ark: 90, vat: 30 }
  L.blocks = { uvCasing: UV_CASING, glass: GLASS, core: CORE, plascrete: PLASCRETE, window: WINDOW, filter: FILTER, incubator: INCUBATOR, printer: PRINTER }
  L.lamps = LAMPS

  function cells(casing, min, parts) {
    var choices = [Pat.block(casing, { min: min })]
    Object.keys(parts).forEach(function (name) { choices.push(Pat.part(name, parts[name])) })
    return Pat.oneOf.apply(null, choices)
  }

  // ---------------------------------------------------------------- patterns
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front

  // the ark: 11 x 9 x 11. Row 0 the floor; rows 1-5 the wall (row 1 casing, 2-5 glass); rows 6-8 the dome steps in, row 8 a full cap.
  // Inside: the 7 x 7 photobioreactor ring (x, z 2..8) with tubes in rows 1-3 and lamps in row 4; the 3 x 3 x 3 core (x, z 4..6).
  function arkSlice(z) {
    var rows = []
    for (var y = 0; y < 9; y++) {
      var row = ''
      for (var x = 0; x < 11; x++) {
        var c = ' '
        var wall = x === 0 || x === 10 || z === 0 || z === 10
        var ringIn = x >= 2 && x <= 8 && z >= 2 && z <= 8
        var ring = ringIn && (x === 2 || x === 8 || z === 2 || z === 8)
        var core = x >= 4 && x <= 6 && z >= 4 && z <= 6
        if (y === 0) c = 'X'
        else if (y <= 5) {
          if (wall) c = (y === 1) ? ((z === 10 && x === 5) ? 'S' : 'U') : 'G'
          else if (ring && y <= 3) c = 'T'
          else if (ring && y === 4) c = 'L'
          else if (core && y <= 3) c = 'A'
        } else {
          var i = y - 5
          var inside = x >= i && x <= 10 - i && z >= i && z <= 10 - i
          var edge = inside && (x === i || x === 10 - i || z === i || z === 10 - i)
          if (edge || (inside && y === 8)) c = 'G'
        }
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  const ARK_SPEC = {
    slices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(arkSlice),
    symbols: {
      S: Pat.controller(),
      X: cells(UV_CASING, L.minCasings.ark, L.arkParts),
      U: Pat.block(UV_CASING),
      G: Pat.block(GLASS),
      T: Pat.block(GLASS),
      L: Pat.block(LAMPS),
      A: Pat.block(CORE)
    }
  }
  L.arkSpec = ARK_SPEC

  // the vat: 7 x 7 x 7. Row 0 the floor; rows 1-5 plascrete walls with 3 x 3 cleanroom glass windows in the middle of each side;
  // row 6 the roof with a 3 x 3 filter ceiling. Inside: incubator columns in the four corners (rows 1-3), the bioprinter in the
  // middle (rows 1-2).
  function vatSlice(z) {
    var rows = []
    for (var y = 0; y < 7; y++) {
      var row = ''
      for (var x = 0; x < 7; x++) {
        var c = ' '
        var sideX = x === 0 || x === 6
        var sideZ = z === 0 || z === 6
        if (y === 0) c = 'X'
        else if (y === 6) c = (x >= 2 && x <= 4 && z >= 2 && z <= 4) ? 'F' : ((sideX || sideZ) ? 'M' : 'P')
        else if (sideX || sideZ) {
          var along = sideZ ? x : z
          if (z === 6 && y === 1 && x === 3) c = 'S'
          else if (sideX && sideZ) c = 'M'
          else if (!(sideX && sideZ) && y >= 2 && y <= 4 && along >= 2 && along <= 4) c = 'W'
          else if (y === 5) c = 'M'
          else c = 'P'
        } else if ((x === 1 || x === 5) && (z === 1 || z === 5) && y <= 3) c = 'I'
        else if (x === 3 && z === 3 && y <= 2) c = 'B'
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  const VAT_SPEC = {
    slices: [0, 1, 2, 3, 4, 5, 6].map(vatSlice),
    symbols: {
      S: Pat.controller(),
      X: cells(PLASCRETE, L.minCasings.vat, L.vatParts),
      P: Pat.block(PLASCRETE),
      W: Pat.block(WINDOW),
      M: Pat.frame(['stainless_steel']),
      F: Pat.block(FILTER),
      I: Pat.block(INCUBATOR),
      B: Pat.block(PRINTER)
    }
  }
  L.vatSpec = VAT_SPEC

  // ---------------------------------------------------------------- the algae bank

  StartupEvents.registry('item', function (event) {
    event.create(L.algaeCulture)
      .texture('grindless:item/algae_culture')
      .maxStackSize(64)
      .tooltip(Text.gray(Text.translate('item.grindless.algae_culture.tooltip')))
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var a = L.arkIO
    event.create(ARK_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(a.itemsIn, a.itemsOut, a.fluidsIn, a.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_BATH, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.BATH)
    var v = L.vatIO
    event.create(VAT_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(v.itemsIn, v.itemsOut, v.fluidsIn, v.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_MIXER, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(ARK, ARK_SPEC)
    Pat.register(VAT, VAT_SPEC)

    event.create('ark_biosphere', 'multiblock')
      .langValue('Ark Biosphere')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(ARK_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(UV_CASING) })
      .pattern(function (def) { return Pat.build(def, ARK_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.ark_biosphere.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.closed_ecosystem'))
      ])
      .workableCasingModel(UV_TEXTURE, 'grindless:block/multiblock/ark_biosphere')

    event.create('neural_culture_vat', 'multiblock')
      .langValue('Neural Culture Vat')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(VAT_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(PLASCRETE) })
      .pattern(function (def) { return Pat.build(def, VAT_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.neural_culture_vat.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.neural_culture'))
      ])
      .workableCasingModel(PLASCRETE_TEXTURE, 'grindless:block/multiblock/neural_culture_vat')
  })
})()
