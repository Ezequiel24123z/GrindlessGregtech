// priority: -10300
// -----------------------------------------------------------------------------------------------
// UV's photonics (docs/eras/uv.md, machines 9 and 10, lines 8 and 9; package UV-A6): two machines, their recipe types, the items and
// fluids only they make. Every other UV id is F1's (global.grindless.uvFoundation): the fibre laser module, the ytterbium fibre, the
// InGaAs pump module, arsine and ytterbium. Ytterbium oxide is the extraction cascade's (startup_scripts/grindless/ev/extraction_cascade.js),
// made only by its Yb strip.
//
//   gtceu:fibre_draw_tower   ytterbium-doped double-clad fibre and the fibre laser module (machine 9). A 19 x 15 x 7 hall: a 5 x 5 draw tower
//                            beside a long MCVD lathe hall (two lathes on tungsten steel frame beds with stainless gearbox head and tail
//                            stocks and heatproof burners, a gas cabinet row, a scrubber box, a preform hoist), and in the tower the
//                            capstan (gearbox), the coating cup (PTFE pipe casing), the draw furnace (heatproof) and the preform feed
//                            in the roof, all in clean room casing.
//   gtceu:fibre_draw         its recipe type (EU in); the programmed circuit picks the step: 1 preform, 2 draw, 3 module, 4 refurbish,
//                            12 MCVD soot, 13 MCVD doping.
//   gtceu:mocvd_reactor      compound semiconductors grown atom layer by atom layer (machine 10). 13 x 6 x 9 cluster tool on clean room casing: four
//                            growth chambers (gearbox susceptor under a heatproof heater, PTFE showerhead, filter hood) round a transfer
//                            hub, the gas cabinets (inert casing) along the back and the arsine scrubber box (heatproof casing).
//   gtceu:mocvd              its recipe type (EU in); circuits: 1 organometallics, 2 epi, 3 bars, 4 NbN, 5 pump module, 6 scrub.
//
// Items (grindless:, names in client_scripts/grindless/uv_photonics_lang.js): yb_doped_preform, fibre_bragg_grating,
// gallium_arsenide_boule, gallium_arsenide_wafer, sapphire_boule, sapphire_wafer, ingaas_epi_wafer, ingaas_diode_bar, nbn_film_wafer
// (the NbN-coated wafer; UV-A7's SNSPD takes it). Fluids (GT materials, liquids): germanium_tetrachloride (GeCl4: UV-A7's germanium
// refinery makes it and must reuse this id), trimethylgallium, trimethylindium, acrylate_coating, ytterbium_chloride_solution. D3-STARSHOT
// adds the items mcvd_soot_tube, doped_soot_tube and coated_diode_bar (mocvd circuit 31).
//
// Parts (both): 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output buses, 1-2 output hatches in the floor cells, at least
// 6 (tower) or 8 (reactor) casings among them. Textures: the qubit fab's overlay dir on the clean casing; item icons from
// tools/assets/Build-UVPhotonicsTextures.ps1. Published: global.grindless.photonics.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const P = G.photonics || (G.photonics = {})

  const TOWER = 'gtceu:fibre_draw_tower'
  const TOWER_TYPE = 'fibre_draw'
  const REACTOR = 'gtceu:mocvd_reactor'
  const REACTOR_TYPE = 'mocvd'

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const CLEAN_OVERLAY = 'grindless:block/multiblock/qubit_fab'
  const GEARBOX = 'gtceu:stainless_steel_gearbox'
  const PIPE = 'gtceu:ptfe_pipe_casing'
  const HEAT = 'gtceu:heatproof_machine_casing'
  const CABINET = 'gtceu:inert_machine_casing'
  const BED = 'tungsten_steel'

  // item name -> stack size; two tooltip lines each (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    yb_doped_preform: { stack: 16 },
    fibre_bragg_grating: { stack: 64 },
    gallium_arsenide_boule: { stack: 16 },
    gallium_arsenide_wafer: { stack: 64 },
    sapphire_boule: { stack: 16 },
    sapphire_wafer: { stack: 64 },
    ingaas_epi_wafer: { stack: 64 },
    ingaas_diode_bar: { stack: 64 },
    coated_diode_bar: { stack: 64 },
    mcvd_soot_tube: { stack: 16 },
    doped_soot_tube: { stack: 16 },
    nbn_film_wafer: { stack: 64 }
  }

  // GT material name -> colour and formula (liquids; GTM colours and buckets them)
  const MATERIALS = {
    germanium_tetrachloride: { colour: 0xD8DCE0, formula: 'GeCl4' },
    trimethylgallium: { colour: 0xC8D0B8, formula: 'Ga(CH3)3' },
    trimethylindium: { colour: 0xB8C0D8, formula: 'In(CH3)3' },
    acrylate_coating: { colour: 0xE8E2C8, formula: 'C3H4O2' },
    ytterbium_chloride_solution: { colour: 0xC8E8D0, formula: 'YbCl3(aq)' }
  }

  P.tower = TOWER
  P.reactor = REACTOR
  P.towerType = 'gtceu:' + TOWER_TYPE
  P.reactorType = 'gtceu:' + REACTOR_TYPE
  P.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  P.materials = Object.keys(MATERIALS).map(function (name) { return 'gtceu:' + name })
  P.ids = {}
  Object.keys(ITEMS).concat(Object.keys(MATERIALS)).forEach(function (name) {
    var key = name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() })
    P.ids[key] = (MATERIALS[name] ? 'gtceu:' : 'grindless:') + name
  })
  // tower: items in 4 (preform: SiCl4, Yb2O3, aluminium and the circuit), out 2 (preform + glass dust), fluids in 2 (GeCl4, oxygen),
  // out 1 (chlorine); reactor: items in 4 (gallium, indium, sodium and the circuit), out 1, fluids in 3 (TMGa, TMIn, arsine), out 2
  P.towerIO = { itemsIn: 4, itemsOut: 2, fluidsIn: 2, fluidsOut: 1 }
  P.reactorIO = { itemsIn: 4, itemsOut: 1, fluidsIn: 3, fluidsOut: 2 }
  P.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 2 }
  }
  P.minCasings = { tower: 6, reactor: 8 }
  P.blocks = { casing: CLEAN, gearbox: GEARBOX, pipe: PIPE, heat: HEAT, cabinet: CABINET, bed: BED }

  // ---------------------------------------------------------------- patterns
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front

  function cells(min) {
    return Pat.oneOf(
      Pat.block(CLEAN, { min: min }),
      Pat.part('energy_input', P.parts.energy_input),
      Pat.part('input_bus', P.parts.input_bus),
      Pat.part('input_hatch', P.parts.input_hatch),
      Pat.part('output_bus', P.parts.output_bus),
      Pat.part('output_hatch', P.parts.output_hatch)
    )
  }

  // Both structures are voxel-built: grid[z][y][x] (z back -> front, y bottom -> top), ' ' outside the footprint, '#' enclosed air.
  function vGrid(W, H, D) {
    var g = []
    for (var z = 0; z < D; z++) {
      var layer = []
      for (var y = 0; y < H; y++) {
        var row = []
        for (var x = 0; x < W; x++) row.push(' ')
        layer.push(row)
      }
      g.push(layer)
    }
    return g
  }
  function vFill(g, x0, y0, z0, x1, y1, z1, ch) {
    for (var z = z0; z <= z1; z++) for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) g[z][y][x] = ch
  }
  // a hollow room: X floor, `roof` on top, `wall` round, air inside
  function vRoom(g, x0, y0, z0, x1, y1, z1, wall, roof) {
    for (var z = z0; z <= z1; z++) {
      for (var y = y0; y <= y1; y++) {
        for (var x = x0; x <= x1; x++) {
          if (y === y0) g[z][y][x] = 'X'
          else if (y === y1) g[z][y][x] = roof
          else if (x === x0 || x === x1 || z === z0 || z === z1) g[z][y][x] = wall
          else g[z][y][x] = '#'
        }
      }
    }
  }
  function vSlices(g) {
    return g.map(function (layer) { return layer.map(function (row) { return row.join('') }) })
  }

  // The fibre draw tower and its MCVD lathe hall, 19 x 15 x 7 (about 650 cells): a 5 x 5 draw tower, 15 high (preform column, coating
  // cup, capstan, a heatproof draw furnace under the roof) opening on a long lathe hall: two MCVD lathes on frame beds (gearbox head
  // and tail stocks, a burner carriage, a quartz tube), a gas cabinet and manifold row, a scrubber box and a preform hoist rail that
  // runs through the passage into the tower. Clean room casing, no UEV photonic casing: the hall makes the hollow-core fibre that
  // casing needs.
  function towerGrid() {
    var g = vGrid(19, 15, 7)
    vRoom(g, 0, 0, 1, 4, 14, 5, 'R', 'R')
    vRoom(g, 4, 0, 0, 18, 5, 6, 'R', 'R')
    vFill(g, 4, 1, 2, 4, 4, 4, '#')
    var y
    var i
    for (y = 1; y <= 13; y++) {
      vFill(g, 0, y, 1, 0, y, 1, 'M')
      vFill(g, 0, y, 5, 0, y, 5, 'M')
      if (y > 5) {
        vFill(g, 4, y, 1, 4, y, 1, 'M')
        vFill(g, 4, y, 5, 4, y, 5, 'M')
      }
    }
    vFill(g, 0, 14, 1, 4, 14, 1, 'M')
    vFill(g, 0, 14, 5, 4, 14, 5, 'M')
    vFill(g, 0, 14, 2, 0, 14, 4, 'M')
    vFill(g, 4, 14, 2, 4, 14, 4, 'M')
    vFill(g, 2, 14, 3, 2, 14, 3, '#')
    var ringRows = [6, 10, 12, 13]
    var ringBlock = ['P', 'P', 'H', 'H']
    for (i = 0; i < ringRows.length; i++) {
      y = ringRows[i]
      vFill(g, 1, y, 1, 3, y, 1, ringBlock[i])
      vFill(g, 1, y, 5, 3, y, 5, ringBlock[i])
      vFill(g, 0, y, 2, 0, y, 4, ringBlock[i])
      vFill(g, 4, y, 2, 4, y, 4, ringBlock[i])
    }
    var wins = [3, 4, 8, 9]
    for (i = 0; i < wins.length; i++) {
      vFill(g, 1, wins[i], 1, 3, wins[i], 1, 'W')
      vFill(g, 1, wins[i], 5, 3, wins[i], 5, 'W')
      vFill(g, 0, wins[i], 2, 0, wins[i], 4, 'W')
      if (wins[i] > 5) vFill(g, 4, wins[i], 2, 4, wins[i], 4, 'W')
    }
    vFill(g, 2, 1, 3, 2, 11, 3, 'Q')
    vFill(g, 1, 2, 3, 1, 2, 3, 'G')
    vFill(g, 3, 2, 3, 3, 2, 3, 'G')
    vFill(g, 1, 6, 2, 3, 6, 4, 'P')
    vFill(g, 2, 6, 3, 2, 6, 3, 'Q')
    vFill(g, 1, 12, 2, 3, 13, 4, 'H')
    vFill(g, 2, 12, 3, 2, 13, 3, '#')
    var posts = [4, 9, 14, 18]
    for (i = 0; i < posts.length; i++) {
      vFill(g, posts[i], 1, 0, posts[i], 5, 0, 'M')
      vFill(g, posts[i], 1, 6, posts[i], 5, 6, 'M')
    }
    var spans = [[5, 8], [10, 13], [15, 17]]
    for (i = 0; i < spans.length; i++) {
      vFill(g, spans[i][0], 2, 0, spans[i][1], 3, 0, 'W')
      vFill(g, spans[i][0], 2, 6, spans[i][1], 3, 6, 'W')
    }
    vFill(g, 18, 2, 2, 18, 3, 4, 'W')
    vFill(g, 5, 5, 3, 17, 5, 3, 'P')
    var lathes = [2, 4]
    for (i = 0; i < lathes.length; i++) {
      var lz = lathes[i]
      vFill(g, 5, 1, lz, 17, 1, lz, 'M')
      vFill(g, 5, 2, lz, 5, 2, lz, 'G')
      vFill(g, 17, 2, lz, 17, 2, lz, 'G')
      vFill(g, 6, 2, lz, 16, 2, lz, 'Q')
      vFill(g, 9, 2, lz, 11, 2, lz, 'H')
    }
    vFill(g, 6, 1, 1, 16, 2, 1, 'C')
    vFill(g, 6, 3, 1, 16, 3, 1, 'P')
    vFill(g, 15, 1, 5, 17, 3, 5, 'H')
    vFill(g, 5, 4, 3, 17, 4, 3, 'M')
    g[6][1][11] = 'S'
    return g
  }
  const TOWER_SPEC = {
    slices: vSlices(towerGrid()),
    symbols: {
      S: Pat.controller(),
      X: cells(P.minCasings.tower),
      R: Pat.block(CLEAN),
      G: Pat.block(GEARBOX),
      H: Pat.block(HEAT),
      P: Pat.block(PIPE),
      C: Pat.block(CABINET),
      M: Pat.frame([BED]),
      W: Pat.block('gtceu:laminated_glass'),
      Q: Pat.block('gtceu:fusion_glass'),
      '#': Pat.air()
    }
  }
  P.towerSpec = TOWER_SPEC

  // The MOCVD reactor, a cluster tool, 13 x 6 x 9 (about 450 cells): four growth chambers (a gearbox susceptor under a heatproof heater,
  // a PTFE showerhead and a filter hood in the roof) round a central transfer hub joined by glass transfer tubes, a row of inert gas
  // cabinets along the back with their manifold, and a heatproof arsine scrubber box in the corner. Clean room casing, stainless frame.
  function reactorGrid() {
    var g = vGrid(13, 6, 9)
    vRoom(g, 0, 0, 0, 12, 5, 8, 'R', 'R')
    var y
    var i
    var cxs = [3, 9]
    var czs = [3, 6]
    for (y = 1; y <= 4; y++) {
      vFill(g, 0, y, 0, 0, y, 0, 'F')
      vFill(g, 12, y, 0, 12, y, 0, 'F')
      vFill(g, 0, y, 8, 0, y, 8, 'F')
      vFill(g, 12, y, 8, 12, y, 8, 'F')
    }
    vFill(g, 0, 5, 0, 12, 5, 0, 'F')
    vFill(g, 0, 5, 8, 12, 5, 8, 'F')
    vFill(g, 0, 5, 0, 0, 5, 8, 'F')
    vFill(g, 12, 5, 0, 12, 5, 8, 'F')
    for (i = 0; i < 2; i++) {
      for (var j = 0; j < 2; j++) {
        var cx = cxs[i]
        var cz = czs[j]
        g[cz][1][cx] = 'G'
        g[cz][2][cx] = 'H'
        g[cz][3][cx] = 'P'
        g[cz][4][cx] = 'P'
        g[cz][5][cx] = 'Y'
        g[cz][1][cx - 1] = 'H'
        g[cz][1][cx + 1] = 'H'
      }
    }
    vFill(g, 6, 1, 4, 6, 4, 5, 'F')
    vFill(g, 4, 3, 4, 5, 3, 4, 'W')
    vFill(g, 7, 3, 4, 8, 3, 4, 'W')
    vFill(g, 4, 3, 5, 5, 3, 5, 'W')
    vFill(g, 7, 3, 5, 8, 3, 5, 'W')
    vFill(g, 2, 2, 8, 4, 3, 8, 'W')
    vFill(g, 8, 2, 8, 10, 3, 8, 'W')
    vFill(g, 2, 2, 0, 10, 3, 0, 'W')
    vFill(g, 1, 1, 1, 11, 2, 1, 'C')
    vFill(g, 1, 3, 1, 11, 3, 1, 'P')
    vFill(g, 10, 1, 7, 11, 3, 7, 'H')
    vFill(g, 1, 4, 3, 11, 4, 3, 'P')
    g[8][1][6] = 'S'
    return g
  }
  const REACTOR_SPEC = {
    slices: vSlices(reactorGrid()),
    symbols: {
      S: Pat.controller(),
      X: cells(P.minCasings.reactor),
      R: Pat.block(CLEAN),
      C: Pat.block(CABINET),
      G: Pat.block(GEARBOX),
      H: Pat.block(HEAT),
      P: Pat.block(PIPE),
      F: Pat.frame(['stainless_steel']),
      W: Pat.block('gtceu:laminated_glass'),
      Y: Pat.block('gtceu:filter_casing'),
      '#': Pat.air()
    }
  }
  P.reactorSpec = REACTOR_SPEC
  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var t = P.towerIO
    event.create(TOWER_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(t.itemsIn, t.itemsOut, t.fluidsIn, t.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_WIREMILL, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)
    var r = P.reactorIO
    event.create(REACTOR_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(r.itemsIn, r.itemsOut, r.fluidsIn, r.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machines

  // one EMI line per recipe, read from its data; a name with no text draws nothing
  function dataInfoOf(dataKey) {
    return function (data) {
      try {
        var name = String(data.getString(dataKey))
        if (name === '') return ''
        var key = 'gtceu.recipe.' + dataKey + '.' + name
        var text = String(Text.translate(key).getString())
        return text === key ? '' : text
      } catch (e) {
        return ''
      }
    }
  }
  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    GTRecipeTypes.get(REACTOR_TYPE).addDataInfo(dataInfoOf('grindless_mocvd'))
    Pat.register(TOWER, TOWER_SPEC)
    Pat.register(REACTOR, REACTOR_SPEC)

    event.create('fibre_draw_tower', 'multiblock')
      .langValue('Fibre Draw Tower')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TOWER_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CLEAN) })
      .pattern(function (def) { return Pat.build(def, TOWER_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.fibre_draw_tower.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.fibre_draw'))
      ])
      .workableCasingModel(CLEAN_TEXTURE, CLEAN_OVERLAY)

    event.create('mocvd_reactor', 'multiblock')
      .langValue('MOCVD Reactor')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(REACTOR_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CLEAN) })
      .pattern(function (def) { return Pat.build(def, REACTOR_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.mocvd_reactor.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.mocvd'))
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
