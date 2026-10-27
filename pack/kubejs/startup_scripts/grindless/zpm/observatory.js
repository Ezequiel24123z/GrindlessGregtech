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
  function observatorySlice(z) {
    var rows = []
    for (var y = 0; y < 15; y++) {
      var row = ''
      for (var x = 0; x < 15; x++) {
        var shell = x === 0 || x === 14 || y === 0 || y === 14 || z === 0 || z === 14
        var inCore = x >= 5 && x <= 9 && y >= 5 && y <= 9 && z >= 5 && z <= 9
        var vessel = inCore && (x === 5 || x === 9 || y === 5 || y === 9 || z === 5 || z === 9)
        var c = ' '
        if (z === 14 && y === 1 && x === 7) c = 'S'
        else if (shell) c = (y === 0 || (z === 14 && y === 1)) ? 'X' : 'C'
        else if (vessel) c = 'L'
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
      L: Pat.block(GLASS)
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
  function telescopeSlice(z) {
    var rows = []
    for (var y = 0; y < 11; y++) {
      var row = ''
      for (var x = 0; x < 5; x++) {
        var edge = x === 0 || x === 4 || z === 0 || z === 4
        var c = ' '
        if (y === 0) c = 'X'
        else if (y === 10) c = 'C'
        else if (edge) c = z === 4 && y === 1 ? (x === 2 ? 'S' : 'X') : 'C'
        else if (x === 2 && z === 2 && y === 9) c = 'M'
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
      M: Pat.block(SAPPHIRE)
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
      var tips = []
      for (var i = 0; i < m.tooltips; i++) tips.push(Text.translate('grindless.machine.' + m.name + '.tooltip.' + i))
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
