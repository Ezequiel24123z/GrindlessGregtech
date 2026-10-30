// priority: -11500
// -----------------------------------------------------------------------------------------------
// ZPM's survey network (docs/eras/zpm.md, "Machines 15-17"; package ZPM-A9): three multiblocks of the UV gate's surveys.
//
//   gtceu:neutrino_observatory     type neutrino_detection. 15 x 15 x 15 shell of photomultiplier casing around a water shield, a laminated glass
//                                  vessel 5 x 5 x 5 in its middle: the solar-core survey and the multi-messenger catalogue.
//   gtceu:deep_space_network       type telemetry_decoding. A 15-wide dish (aluminium frame rings, heat-proof deck) over a frostproof cryo-cabin:
//                                  decodes the Neptune and Triton probe recordings and cross-matches them into the Pluto-Kuiper chart.
//   gtceu:kuiper_survey_telescope  type kuiper_survey. 5 x 5 x 11 station truss tube with a sapphire secondary mirror; Earth orbit only.
//
// Parts: observatory 1-2 energy hatches, 1-2 input buses, 1-2 output buses, 1-2 input hatches; network 1-2 energy hatches, 1-2 input buses,
// 1-2 output buses, 1-2 input hatches; telescope 1-2 energy hatches, 1-2 input buses, 1-2 output buses (ME parts fit).
// Textures: grindless:block/multiblock/<machine> (tools/assets/Build-ZPMObservatoryTextures.ps1). Names / tooltips:
// client_scripts/grindless/zpm_observatory_lang.js. Published: global.grindless.zpmObservatory.
(function () {
  var G = global.grindless || (global.grindless = {})
  var Pat = G.patterns
  var OB = G.zpmObservatory || (G.zpmObservatory = {})

  var PMT = 'grindless:photomultiplier_casing'
  var PMT_TEXTURE = 'grindless:block/zpm/photomultiplier_casing'
  var HEAT = 'gtceu:heatproof_machine_casing'
  var HEAT_TEXTURE = 'gtceu:block/casings/solid/machine_casing_heatproof'
  var FROST = 'gtceu:frostproof_machine_casing'
  var STATION = 'grindless:station_truss_casing'
  var STATION_TEXTURE = 'grindless:block/luv/station_truss_casing'
  var GLASS = 'gtceu:laminated_glass'
  var SAPPHIRE = 'gtceu:sapphire_block'

  OB.orbit = G.orbits.earth // the telescope's recipe is limited to it in the server script

  function parts(casing, min, limits) {
    var choices = [Pat.block(casing, { min: min })]
    Object.keys(limits).forEach(function (name) { choices.push(Pat.part(name, limits[name])) })
    return Pat.oneOf.apply(null, choices)
  }

  // ---------------------------------------------------------------- the observatory: 15 x 15 x 15
  // rows bottom -> top; the shell is the photomultiplier casing (ports in the floor and the front wall), the water shield is any block
  var OBS_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 }, input_hatch: { min: 1, max: 2 } }
  // QR-S2: an octagonal drum. The footprint is a 15 x 15 square with its corners cut (|dx| + |dz| <= 10 from the middle), frame posts at the eight
  // vertices, stable casing hoops at rows 4 and 10 and a glass window band at row 7 between the photomultiplier walls, stable casing slabs
  // inside the floor and the roof, the 5 x 5 x 5 glass vessel in the middle. The front wall (controller side) stays flat.
  function observatorySlice(z) {
    var rows = []
    for (var y = 0; y < 15; y++) {
      var row = ''
      for (var x = 0; x < 15; x++) {
        var dx = Math.abs(x - 7)
        var dz = Math.abs(z - 7)
        var d = dx + dz
        var inFoot = d <= 10
        var rim = inFoot && (d === 10 || dx === 7 || dz === 7)
        var vertex = rim && ((dx === 7 && dz === 3) || (dx === 3 && dz === 7))
        var inCore = x >= 5 && x <= 9 && y >= 5 && y <= 9 && z >= 5 && z <= 9
        var vessel = inCore && (x === 5 || x === 9 || y === 5 || y === 9 || z === 5 || z === 9)
        var c = ' '
        if (!inFoot) c = ' '
        else if (z === 14 && y === 1 && x === 7) c = 'S'
        else if (y === 0) c = 'X'
        else if (y === 1 && !rim && d <= 8) c = 'H'
        else if (y === 14) c = rim ? 'R' : 'H'
        else if (vertex) c = 'R'
        else if (rim) {
          if (z === 14 && y === 1) c = 'X'
          else if (y === 4 || y === 10) c = 'H'
          else if (y === 7) c = 'L'
          else c = 'C'
        } else if (vessel) c = 'L'
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  var OBSERVATORY = {
    slices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(observatorySlice),
    symbols: {
      S: Pat.controller(),
      X: parts(PMT, 60, OBS_PARTS),
      C: Pat.block(PMT),
      L: Pat.block(GLASS),
      H: Pat.block('gtceu:stable_machine_casing'),
      R: Pat.frame(['titanium'])
    }
  }

  // ---------------------------------------------------------------- the network: 15 wide, 15 deep, 7 high
  // rows bottom -> top: 0 the heat-proof deck, 1-6 aluminium frame rings widening to the rim; a 3 x 3 x 3 frostproof cryo-cabin in the middle
  var DSN_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 }, input_hatch: { min: 1, max: 2 } }
  function dishSlice(z) {
    var rows = []
    for (var y = 0; y < 7; y++) {
      var row = ''
      for (var x = 0; x < 15; x++) {
        var c = ' '
        if (y === 0) c = (z === 14 && x === 7) ? 'S' : 'X'
        else {
          var inset = 6 - y
          var inside = x >= inset && x <= 14 - inset && z >= inset && z <= 14 - inset
          var ring = inside && (x === inset || x === 14 - inset || z === inset || z === 14 - inset)
          var cabin = y <= 3 && x >= 6 && x <= 8 && z >= 6 && z <= 8
          if (cabin) c = 'K'
          else if (ring) c = 'F'
        }
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  var DSN = {
    slices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(dishSlice),
    symbols: {
      S: Pat.controller(),
      X: parts(HEAT, 100, DSN_PARTS),
      F: Pat.frame(['aluminium']),
      K: Pat.block(FROST)
    }
  }

  // ---------------------------------------------------------------- the telescope: 5 x 5 x 11
  // rows bottom -> top: 0 the base (ports or truss), 1-9 the tube around the open light path, a sapphire secondary mirror at row 9, 10 the cap
  var TEL_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 } }
  // QR-S2: a survey tube. Frame posts, glass sight rings at rows 3 and 6, frostproof hoops at rows 5 and 8, a frame spider at row 9 holding the
  // sapphire secondary mirror, a gearbox pointing mount at the base and a glass cap.
  function telescopeSlice(z) {
    var rows = []
    for (var y = 0; y < 11; y++) {
      var row = ''
      for (var x = 0; x < 5; x++) {
        var edge = x === 0 || x === 4 || z === 0 || z === 4
        var post = (x === 0 || x === 4) && (z === 0 || z === 4)
        var c = ' '
        if (y === 0) c = edge ? 'X' : (x === 2 && z === 2 ? 'D' : 'C')
        else if (y === 10) c = edge ? 'C' : 'L'
        else if (post) c = 'R'
        else if (edge) {
          if (z === 4 && y === 1) c = x === 2 ? 'S' : 'X'
          else if (y === 3 || y === 6) c = 'L'
          else if (y === 5 || y === 8) c = 'K'
          else c = 'C'
        } else if (y === 9) c = (x === 2 && z === 2) ? 'M' : ((x === 2 || z === 2) ? 'R' : ' ')
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  var TELESCOPE = {
    slices: [0, 1, 2, 3, 4].map(telescopeSlice),
    symbols: {
      S: Pat.controller(),
      X: parts(STATION, 10, TEL_PARTS),
      C: Pat.block(STATION),
      M: Pat.block(SAPPHIRE),
      L: Pat.block(GLASS),
      K: Pat.block(FROST),
      R: Pat.frame(['titanium']),
      D: Pat.block('gtceu:tungstensteel_gearbox')
    }
  }

  // [items in, items out, fluids in, fluids out]
  OB.machines = [
    { name: 'neutrino_observatory', title: 'Neutrino Observatory', type: 'neutrino_detection', io: [3, 1, 1, 0], spec: OBSERVATORY, parts: OBS_PARTS,
      casing: PMT, texture: PMT_TEXTURE, tooltips: 3 },
    { name: 'deep_space_network', title: 'Deep Space Network', type: 'telemetry_decoding', io: [5, 1, 1, 0], spec: DSN, parts: DSN_PARTS,
      casing: HEAT, texture: HEAT_TEXTURE, tooltips: 3 },
    { name: 'kuiper_survey_telescope', title: 'Kuiper Survey Telescope', type: 'kuiper_survey', io: [3, 1, 0, 0], spec: TELESCOPE, parts: TEL_PARTS,
      casing: STATION, texture: STATION_TEXTURE, tooltips: 3 }
  ]

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    OB.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.io[0], m.io[1], m.io[2], m.io[3])
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.COMPUTATION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    OB.machines.forEach(function (m) {
      Pat.register('gtceu:' + m.name, m.spec)
      var tips = [
        Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + String(m.type).replace('gtceu:', '')))
      ]
      if (m.name === 'kuiper_survey_telescope') tips.push(Text.translate('grindless.machine.kuiper_survey_telescope.tooltip.1'))
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
