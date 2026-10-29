// priority: -11900
// -----------------------------------------------------------------------------------------------
// ZPM's Saturn siphon (docs/eras/zpm.md, "Machines 18-20"; package ZPM-B2): three multiblocks of Saturn orbit and their recipe types.
//
//   gtceu:gas_giant_siphon   type gas_giant_siphon. A tethered probe dipped into the upper cloud deck: 7 x 7 x 11 station truss shell around a
//                            hollow scoop bay, a tether winch (frame column topped by a gearbox) in its middle. Drill family step 8: the Jovian
//                            survey (LuV) is the catalyst, the scoop head the worn bit, the programmed circuit the depth.
//   gtceu:isotope_column     type cryogenic_isotope_separation. 5 x 5 x 15 frostproof casing around a titanium pipe heat exchanger: Saturn's
//                            helium gives its helium-3 (the heat-flush method) and the hydrogen its deuterium (cryogenic distillation).
//   gtceu:ring_harvester     type ring_harvesting. 9 x 3 x 9 station truss deck with two frame net booms and a melt tank (laminated glass):
//                            the rings' ice and silicate dust, and the ring ice sample the Saturn AE2 pair is made from.
//
// Parts: siphon 1-2 energy hatches, 1-2 input buses, 1-3 output hatches; column 1-2 energy hatches, 1-2 input buses, 1-2 input hatches,
// 1-3 output hatches; harvester 1-2 energy hatches, 1-2 input buses, 1-2 output buses, 1-3 output hatches (ME parts fit).
// Textures: grindless:block/multiblock/<machine> (tools/assets/Build-ZPMSaturnSiphonTextures.ps1) on the station truss or frostproof casing.
// Names / tooltips: client_scripts/grindless/zpm_saturn_siphon_lang.js. Published: global.grindless.saturnSiphon.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const SS = G.saturnSiphon || (G.saturnSiphon = {})

  const STATION = 'grindless:station_truss_casing'
  const STATION_TEXTURE = 'grindless:block/luv/station_truss_casing'
  const FROST = 'gtceu:frostproof_machine_casing'
  const FROST_TEXTURE = 'gtceu:block/casings/solid/machine_casing_frost_proof'
  const PIPE = 'gtceu:titanium_pipe_casing'
  const GLASS = 'gtceu:laminated_glass'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'

  SS.orbit = 'grindless:saturn_orbit'

  function parts(casing, min, limits) {
    const choices = [Pat.block(casing, { min: min })]
    Object.keys(limits).forEach(function (name) { choices.push(Pat.part(name, limits[name])) })
    return Pat.oneOf.apply(null, choices)
  }

  // ---------------------------------------------------------------- the siphon: 7 wide, 7 deep, 11 high
  // rows bottom -> top: 0 floor (ports or truss), 1-9 the walls around the scoop bay and the winch, 10 the roof
  const SIPHON_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_hatch: { min: 1, max: 3 } }
  // QR-S2: a tether station. Titanium frame posts, glass window rings between truss and probe bay casing bands, the winch (frame column
  // topped by a gearbox) in the middle, a probe bay casing deck and roof.
  function siphonSlice(z) {
    var rows = []
    for (var y = 0; y < 11; y++) {
      var row = ''
      for (var x = 0; x < 7; x++) {
        var edge = x === 0 || x === 6 || z === 0 || z === 6
        var post = (x === 0 || x === 6) && (z === 0 || z === 6)
        var c = ' '
        if (y === 0) c = edge ? 'X' : 'B'
        else if (y === 10) c = edge ? 'C' : 'B'
        else if (post) c = 'F'
        else if (edge) {
          if (z === 6 && y === 1) c = x === 3 ? 'S' : 'X'
          else if (y === 1 || y === 5 || y === 9) c = 'C'
          else if (y === 3 || y === 7) c = 'B'
          else c = 'L'
        } else if (x === 3 && z === 3) c = y === 9 ? 'D' : 'F'
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  const SIPHON = {
    slices: [0, 1, 2, 3, 4, 5, 6].map(siphonSlice),
    symbols: {
      S: Pat.controller(),
      X: parts(STATION, 12, SIPHON_PARTS),
      C: Pat.block(STATION),
      B: Pat.block('grindless:probe_bay_casing'),
      L: Pat.block(GLASS),
      F: Pat.frame(['titanium']),
      D: Pat.block(GEARBOX)
    }
  }

  // ---------------------------------------------------------------- the column: 5 wide, 5 deep, 15 high
  // rows bottom -> top: 0 floor, 1-13 the frostproof shell around the titanium pipe heat exchanger, 14 the roof
  const COLUMN_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, input_hatch: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 3 } }
  // QR-S2: a cryogenic distillation tower. Frame posts, pressure hull bands at rows 5, 9 and 13, laminated glass sight rings at rows 3, 7 and 11,
  // the titanium pipe heat exchanger up the middle and out of the roof.
  function columnSlice(z) {
    var rows = []
    for (var y = 0; y < 15; y++) {
      var row = ''
      for (var x = 0; x < 5; x++) {
        var edge = x === 0 || x === 4 || z === 0 || z === 4
        var post = (x === 0 || x === 4) && (z === 0 || z === 4)
        var c = ' '
        if (y === 0) c = edge ? 'X' : 'H'
        else if (y === 14) c = edge ? 'F' : (x === 2 && z === 2 ? 'P' : 'H')
        else if (post) c = 'R'
        else if (edge) {
          if (y === 1) c = z === 4 ? (x === 2 ? 'S' : 'X') : 'F'
          else if (y % 4 === 1) c = 'H'
          else if (y % 4 === 3) c = 'L'
          else c = 'F'
        } else if (x === 2 && z === 2) c = 'P'
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  const COLUMN = {
    slices: [0, 1, 2, 3, 4].map(columnSlice),
    symbols: {
      S: Pat.controller(),
      X: parts(FROST, 8, COLUMN_PARTS),
      F: Pat.block(FROST),
      H: Pat.block('grindless:pressure_hull_casing'),
      L: Pat.block(GLASS),
      R: Pat.frame(['titanium']),
      P: Pat.block(PIPE)
    }
  }

  // ---------------------------------------------------------------- the harvester: 9 wide, 9 deep, 3 high
  // rows bottom -> top: 0 the deck, 1 the net booms (frames, left and right) and the melt tank (glass), 2 the roof edge and tank cover
  const HARVESTER_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 3 } }
  // QR-S2: a ring skimmer. Truss rim and probe bay casing deck, a pressure hull plinth under the glass melt tank, pipe vents on its cover.
  function harvesterSlice(z) {
    var rows = []
    for (var y = 0; y < 3; y++) {
      var row = ''
      for (var x = 0; x < 9; x++) {
        var tank = x >= 3 && x <= 5 && z >= 3 && z <= 5
        var edge = x === 0 || x === 8 || z === 0 || z === 8
        var c = ' '
        if (y === 0) c = edge ? 'X' : (tank ? 'H' : 'B')
        else if (y === 1) {
          if (z === 8 && x === 4) c = 'S'
          else if (x === 0 || x === 8) c = 'F'
          else if (z === 8) c = 'X'
          else if (tank) c = 'L'
        } else if (tank) c = 'P'
        else if (edge) c = 'B'
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  const HARVESTER = {
    slices: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(harvesterSlice),
    symbols: {
      S: Pat.controller(),
      X: parts(STATION, 10, HARVESTER_PARTS),
      B: Pat.block('grindless:probe_bay_casing'),
      H: Pat.block('grindless:pressure_hull_casing'),
      F: Pat.frame(['titanium']),
      L: Pat.block(GLASS),
      P: Pat.block(PIPE)
    }
  }

  // [items in, items out, fluids in, fluids out]
  SS.machines = [
    { name: 'gas_giant_siphon', title: 'Gas Giant Siphon', type: 'gas_giant_siphon', io: [3, 0, 1, 2], spec: SIPHON, parts: SIPHON_PARTS,
      casing: STATION, texture: STATION_TEXTURE, tooltips: 3 },
    { name: 'isotope_column', title: 'Isotope Column', type: 'cryogenic_isotope_separation', io: [1, 0, 1, 2], spec: COLUMN, parts: COLUMN_PARTS,
      casing: FROST, texture: FROST_TEXTURE, tooltips: 3 },
    { name: 'ring_harvester', title: 'Ring Harvester', type: 'ring_harvesting', io: [3, 2, 1, 1], spec: HARVESTER, parts: HARVESTER_PARTS,
      casing: STATION, texture: STATION_TEXTURE, tooltips: 3 }
  ]

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    SS.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.io[0], m.io[1], m.io[2], m.io[3])
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.CHEMICAL)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SS.machines.forEach(function (m) {
      Pat.register('gtceu:' + m.name, m.spec)
      const tips = []
      for (let i = 0; i < m.tooltips; i++) tips.push(Text.translate('grindless.machine.' + m.name + '.tooltip.' + i))
      event.create(m.name, 'multiblock')
        .langValue(m.title)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        .allowExtendedFacing(false)
        ["tooltips(net.minecraft.network.chat.Component[])"](tips)
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
