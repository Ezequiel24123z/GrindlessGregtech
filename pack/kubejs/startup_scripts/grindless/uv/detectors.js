// priority: -9400
// -----------------------------------------------------------------------------------------------
// UV's detectors (docs/eras/uv.md, machines 11 and 12, lines 10 and 21; package UV-A7): two machines and their recipe types. No new
// item or fluid: the HPGe crystal, the SNSPD array, the Starshot probe and the Proxima approach data are F1's
// (global.grindless.uvFoundation); germanium tetrachloride is UV-A6's (startup_scripts/grindless/uv/photonics.js); the SNSPD array is
// made by the ZPM qubit fab's circuit 3 row (server_scripts/grindless/zpm/qubits.js).
//
//   gtceu:zone_refining_tower   high-purity germanium (machine 11). An 11 x 12 x 5 quartz tower and glovebox bench of clean room casing: three RF
//                               coil rings (cupronickel coil blocks) travel the germanium bar in the 5 x 5 tower, an open melt zone round
//                               them, and the Czochralski puller (a stainless gearbox) in the roof; a low argon glovebox beside it holds the
//                               chlorination column. Parts in the floor.
//   gtceu:zone_refining         its recipe type (EU in); circuits: 1 chlorinate, 2 reduce, 3 refine.
//   gtceu:optical_ground_station  the only reader of the Starshot (machine 12). A 9 x 9 x 9 dome of UV machine casing: a 5 x 5 primary
//                               mirror (aluminium blocks) on the floor, the adaptive optics bench (three computer casings) behind it and
//                               the aperture open in the roof. The SNSPD array sits in the recipe (not consumed), not in the structure.
//   gtceu:optical_downlink      its recipe type (EU in); one recipe, no circuit.
//
// Textures: grindless:block/multiblock/<machine> (tools/assets/Build-UVDetectorsTextures.ps1). Names:
// client_scripts/grindless/uv_detectors_lang.js. Published: global.grindless.detectors.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const D = G.detectors || (G.detectors = {})

  const TOWER = 'gtceu:zone_refining_tower'
  const TOWER_TYPE = 'zone_refining'
  const STATION = 'gtceu:optical_ground_station'
  const STATION_TYPE = 'optical_downlink'

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const UV_CASING = 'gtceu:uv_machine_casing'
  const UV_TEXTURE = 'gtceu:block/casings/voltage/uv/side'
  const COIL = 'gtceu:cupronickel_coil_block'
  const GEARBOX = 'gtceu:stainless_steel_gearbox'
  const MIRROR = 'gtceu:aluminium_block'
  const BENCH = 'gtceu:computer_casing'

  D.tower = TOWER
  D.station = STATION
  D.towerType = 'gtceu:' + TOWER_TYPE
  D.stationType = 'gtceu:' + STATION_TYPE
  // tower: items in 2 (germanium and the circuit), out 2 (crystal + impure ends); fluids in 3 (GeCl4, water, hydrogen; chlorine in c1),
  // out 2 (HCl and water; GeCl4 in c1). Station: items in 2 (probe, SNSPD array), out 1; fluids in 1, out 1
  D.towerIO = { itemsIn: 3, itemsOut: 2, fluidsIn: 3, fluidsOut: 2 }
  D.stationIO = { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 }
  D.towerParts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 3 },
    output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 2 }
  }
  D.stationParts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 1 },
    output_bus: { min: 1, max: 1 },
    output_hatch: { min: 1, max: 1 }
  }
  D.minCasings = { tower: 6, station: 50 }
  D.blocks = { clean: CLEAN, uvCasing: UV_CASING, coil: COIL, gearbox: GEARBOX, mirror: MIRROR, bench: BENCH }
  D.coils = 24

  function cells(casing, min, parts) {
    var choices = [Pat.block(casing, { min: min })]
    Object.keys(parts).forEach(function (name) { choices.push(Pat.part(name, parts[name])) })
    return Pat.oneOf.apply(null, choices)
  }

  // ---------------------------------------------------------------- patterns
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front

  // The zone refining tower, 11 x 12 x 5 (about 350 cells): a 5 x 5 quartz tower, 12 high, with three RF coil rings (cupronickel coil
  // blocks) that travel the germanium bar (a fusion glass column), a Czochralski puller (a stainless gearbox) in the roof and sight
  // windows, joined by a transfer port to a low argon glovebox bench holding the chlorination column (tungstensteel pipe casing),
  // the gas manifold and the loading gearboxes.
  function towerGrid() {
    var W = 11
    var H = 12
    var Dp = 5
    var g = []
    var x
    var y
    var z
    for (z = 0; z < Dp; z++) {
      var layer = []
      for (y = 0; y < H; y++) {
        var row = []
        for (x = 0; x < W; x++) row.push(' ')
        layer.push(row)
      }
      g.push(layer)
    }
    for (z = 0; z < Dp; z++) {
      for (y = 0; y < H; y++) {
        for (x = 0; x < W; x++) {
          var inTower = x <= 4
          var inBase = x >= 4 && y <= 4
          if (!inTower && !inBase) continue
          var x1 = inTower ? 4 : 10
          var y1 = inTower ? H - 1 : 4
          if (y === 0) g[z][y][x] = 'X'
          else if (y === y1) g[z][y][x] = 'R'
          else if (x === x1 || z === 0 || z === Dp - 1 || (inTower && x === 0) || (!inTower && x === 4)) g[z][y][x] = 'R'
          else g[z][y][x] = '#'
        }
      }
    }
    var rowIdx
    for (y = 1; y <= 10; y++) {
      g[0][y][0] = 'F'
      g[0][y][4] = 'F'
      g[4][y][0] = 'F'
      g[4][y][4] = 'F'
    }
    for (x = 0; x <= 4; x++) {
      g[0][11][x] = 'F'
      g[4][11][x] = 'F'
    }
    for (z = 0; z <= 4; z++) {
      g[z][11][0] = 'F'
      g[z][11][4] = 'F'
    }
    var winRows = [2, 4, 6, 8]
    var pipeRows = [3, 7]
    for (rowIdx = 0; rowIdx < winRows.length; rowIdx++) {
      y = winRows[rowIdx]
      for (x = 1; x <= 3; x++) {
        g[0][y][x] = 'W'
        g[4][y][x] = 'W'
      }
      for (z = 1; z <= 3; z++) g[z][y][0] = 'W'
    }
    for (rowIdx = 0; rowIdx < pipeRows.length; rowIdx++) {
      y = pipeRows[rowIdx]
      for (x = 1; x <= 3; x++) {
        g[0][y][x] = 'P'
        g[4][y][x] = 'P'
      }
      for (z = 1; z <= 3; z++) g[z][y][0] = 'P'
    }
    var coilRows = [3, 5, 7]
    for (rowIdx = 0; rowIdx < coilRows.length; rowIdx++) {
      y = coilRows[rowIdx]
      for (z = 1; z <= 3; z++) for (x = 1; x <= 3; x++) if (x !== 2 || z !== 2) g[z][y][x] = 'C'
    }
    for (y = 1; y <= 9; y++) g[2][y][2] = 'W'
    g[2][10][2] = 'G'
    g[2][1][4] = '#'
    g[2][2][4] = '#'
    // glovebox bench
    g[0][1][10] = 'F'
    g[0][2][10] = 'F'
    g[0][3][10] = 'F'
    g[4][1][10] = 'F'
    g[4][2][10] = 'F'
    g[4][3][10] = 'F'
    for (x = 5; x <= 9; x++) {
      if (x !== 7) g[4][2][x] = 'W'
      g[0][2][x] = 'W'
    }
    for (z = 1; z <= 3; z++) g[z][2][10] = 'W'
    for (y = 1; y <= 3; y++) g[2][y][8] = 'P'
    for (x = 5; x <= 9; x++) g[1][3][x] = 'P'
    g[2][1][6] = 'T'
    g[2][2][6] = 'T'
    g[3][1][9] = 'T'
    g[4][1][7] = 'S'
    return g
  }
  const TOWER_SPEC = {
    slices: towerGrid().map(function (layer) { return layer.map(function (row) { return row.join('') }) }),
    symbols: {
      S: Pat.controller(),
      X: cells(CLEAN, D.minCasings.tower, D.towerParts),
      R: Pat.block(CLEAN),
      F: Pat.frame(['tungsten_steel']),
      W: Pat.block('gtceu:fusion_glass'),
      P: Pat.block('gtceu:tungstensteel_pipe_casing'),
      C: Pat.block(COIL),
      G: Pat.block(GEARBOX),
      T: Pat.block('gtceu:tungstensteel_gearbox'),
      '#': Pat.air()
    }
  }
  D.towerSpec = TOWER_SPEC

  function dress(slices, wall, rule) {
    var D = slices.length
    var H = slices[0].length
    var W = slices[0][0].length
    return slices.map(function (rows, z) {
      return rows.map(function (row, y) {
        if (y === 0) return row
        var out = ''
        for (var x = 0; x < W; x++) {
          var ch = row.charAt(x)
          var r = ch === wall ? rule(x, y, z, W, H, D) : null
          out += r || ch
        }
        return out
      })
    })
  }

  // the station: a 9 x 9 x 9 dome; walls to row 5, the roof steps in to row 8, whose centre is the open aperture
  function stationSlice(z) {
    var rows = []
    for (var y = 0; y < 9; y++) {
      var row = ''
      for (var x = 0; x < 9; x++) {
        var c = ' '
        var edge = x === 0 || x === 8 || z === 0 || z === 8
        if (y === 0) c = 'X'
        else if (z === 8 && y === 1 && x === 4) c = 'S'
        else if (y <= 5) {
          if (edge) c = 'C'
          else if (y === 1 && x >= 2 && x <= 6 && z >= 2 && z <= 6) c = 'M'
          else if (y === 1 && z === 1 && x >= 3 && x <= 5) c = 'B'
          else c = '#'
        } else {
          var i = y - 5
          var inside = x >= i && x <= 8 - i && z >= i && z <= 8 - i
          var ring = inside && (x === i || x === 8 - i || z === i || z === 8 - i)
          if (ring) c = 'C'
          else if (inside) c = '#'
        }
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  // dome: frame ribs every four cells and a frame ring at the shoulder, a two-row glass aperture band, glass roof windows
  function stationRule(x, y, z, W, H, D) {
    if (y <= 5) {
      var corner = (x === 0 || x === 8) && (z === 0 || z === 8)
      var idx = (x === 0 || x === 8) ? z : x
      if (y === 5 || corner || idx % 4 === 0) return 'F'
      if (y === 3 || y === 4) return 'W'
      return null
    }
    if (y === 6) return 'F'
    if (y === 7) return ((x === 2 || x === 6) && (z === 2 || z === 6)) ? 'F' : 'W'
    return ((x === 3 || x === 5) && (z === 3 || z === 5)) ? 'F' : 'W'
  }
  const STATION_SPEC = {
    slices: dress([0, 1, 2, 3, 4, 5, 6, 7, 8].map(stationSlice), 'C', stationRule),
    symbols: {
      S: Pat.controller(),
      X: cells(UV_CASING, D.minCasings.station, D.stationParts),
      C: Pat.block(UV_CASING),
      F: Pat.frame(['tungsten_steel']),
      W: Pat.block('gtceu:fusion_glass'),
      M: Pat.block(MIRROR),
      B: Pat.block(BENCH),
      '#': Pat.air()
    }
  }
  D.stationSpec = STATION_SPEC

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var t = D.towerIO
    event.create(TOWER_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(t.itemsIn, t.itemsOut, t.fluidsIn, t.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.DOWN_TO_UP)
      .setSound(GTSoundEntries.FURNACE)
    var s = D.stationIO
    event.create(STATION_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(s.itemsIn, s.itemsOut, s.fluidsIn, s.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.COMPUTATION)
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
    GTRecipeTypes.get(TOWER_TYPE).addDataInfo(dataInfoOf('grindless_zone_refining'))
    Pat.register(TOWER, TOWER_SPEC)
    Pat.register(STATION, STATION_SPEC)

    event.create('zone_refining_tower', 'multiblock')
      .langValue('Zone Refining Tower')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TOWER_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CLEAN) })
      .pattern(function (def) { return Pat.build(def, TOWER_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.zone_refining_tower.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.zone_refining'))
      ])
      .workableCasingModel(CLEAN_TEXTURE, 'grindless:block/multiblock/zone_refining_tower')

    event.create('optical_ground_station', 'multiblock')
      .langValue('Optical Ground Station')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(STATION_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(UV_CASING) })
      .pattern(function (def) { return Pat.build(def, STATION_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.optical_ground_station.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.optical_downlink'))
      ])
      .workableCasingModel(UV_TEXTURE, 'grindless:block/multiblock/optical_ground_station')
  })
})()
