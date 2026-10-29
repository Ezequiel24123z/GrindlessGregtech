// priority: -9400
// -----------------------------------------------------------------------------------------------
// UV's detectors (docs/eras/uv.md, machines 11 and 12, lines 10 and 21; package UV-A7): two machines and their recipe types. No new
// item or fluid: the HPGe crystal, the SNSPD array, the Starshot probe and the Proxima approach data are F1's
// (global.grindless.uvFoundation); germanium tetrachloride is UV-A6's (startup_scripts/grindless/uv/photonics.js); the SNSPD array is
// made by the ZPM qubit fab's circuit 3 row (server_scripts/grindless/zpm/qubits.js).
//
//   gtceu:zone_refining_tower   high-purity germanium (machine 11). A 3 wide x 13 high x 3 deep tower of clean room casing: eight RF
//                               coils (naquadah coil blocks) stacked in the core round the germanium bar, an open melt zone under and over
//                               them, and the Czochralski puller (a stainless gearbox) at the top. Parts in the floor and the back wall's
//                               two lowest rows.
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
  const COIL = 'gtceu:naquadah_coil_block'
  const GEARBOX = 'gtceu:stainless_steel_gearbox'
  const MIRROR = 'gtceu:aluminium_block'
  const BENCH = 'gtceu:computer_casing'

  D.tower = TOWER
  D.station = STATION
  D.towerType = 'gtceu:' + TOWER_TYPE
  D.stationType = 'gtceu:' + STATION_TYPE
  // tower: items in 2 (germanium and the circuit), out 2 (crystal + impure ends); fluids in 3 (GeCl4, water, hydrogen; chlorine in c1),
  // out 2 (HCl and water; GeCl4 in c1). Station: items in 2 (probe, SNSPD array), out 1; fluids in 1, out 1
  D.towerIO = { itemsIn: 2, itemsOut: 2, fluidsIn: 3, fluidsOut: 2 }
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
  D.coils = 8

  function cells(casing, min, parts) {
    var choices = [Pat.block(casing, { min: min })]
    Object.keys(parts).forEach(function (name) { choices.push(Pat.part(name, parts[name])) })
    return Pat.oneOf.apply(null, choices)
  }

  // ---------------------------------------------------------------- patterns
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front

  // the tower: 13 rows; the core column: 1-2 melt zone (air), 3-10 the eight RF coils, 11 air, 12 the puller
  function towerSlice(floor, row1, row2, core) {
    var rows = [floor, row1, row2]
    for (var y = 3; y < 13; y++) rows.push(core ? (y <= 10 ? 'RCR' : (y === 12 ? 'RGR' : 'R#R')) : 'RRR')
    if (core) { rows[1] = 'R#R'; rows[2] = 'R#R' }
    return rows
  }
  // QR-S3: dress(slices, wall, rule) rewrites plain wall cells (char `wall`) through rule(x, y, z, W, H, D) -> char or null. Row 0 is never touched.
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
  // tower: frame posts on the four edges, then glass sight windows, tungstensteel pipe runs and clean casing in turn
  function towerRule(x, y, z, W, H, D) {
    if ((x === 0 || x === W - 1) && (z === 0 || z === D - 1)) return 'F'
    var m = y % 3
    if (m === 0) return 'W'
    if (m === 1) return 'P'
    return null
  }
  const TOWER_SPEC = {
    slices: dress([
      towerSlice('XXX', 'XXX', 'XXX', false),
      towerSlice('XRX', null, null, true),
      towerSlice('XXX', 'RSR', 'RRR', false)
    ], 'R', towerRule),
    symbols: {
      S: Pat.controller(),
      X: cells(CLEAN, D.minCasings.tower, D.towerParts),
      R: Pat.block(CLEAN),
      F: Pat.frame(['tungsten_steel']),
      W: Pat.block('gtceu:fusion_glass'),
      P: Pat.block('gtceu:tungstensteel_pipe_casing'),
      C: Pat.block(COIL),
      G: Pat.block(GEARBOX),
      '#': Pat.air()
    }
  }
  D.towerSpec = TOWER_SPEC

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

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
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
        Text.translate('grindless.machine.zone_refining_tower.tooltip.1'),
        Text.translate('grindless.machine.zone_refining_tower.tooltip.2'),
        Text.translate('grindless.machine.zone_refining_tower.tooltip.3')
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
        Text.translate('grindless.machine.optical_ground_station.tooltip.1'),
        Text.translate('grindless.machine.optical_ground_station.tooltip.2'),
        Text.translate('grindless.machine.optical_ground_station.tooltip.3')
      ])
      .workableCasingModel(UV_TEXTURE, 'grindless:block/multiblock/optical_ground_station')
  })
})()
