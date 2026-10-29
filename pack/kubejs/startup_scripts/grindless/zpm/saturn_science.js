// priority: -11800
// -----------------------------------------------------------------------------------------------
// ZPM's Saturn science (docs/eras/zpm.md, "Machines 23-24"; package ZPM-B4): two multiblocks of Saturn orbit and their recipe types.
//
//   gtceu:plume_sampler     type plume_sampling. 7 x 5 x 7 probe bay casing around a capture bay, a titanium frame boom ending in a gearbox
//                           hinge in its middle: an aerogel capture cartridge flown through Enceladus's plume (Cassini's E21 pass).
//   gtceu:ring_seismometer  type kronoseismology. 5 x 5 x 5 station truss with a laminated glass photometer column in its middle: a run of
//                           stellar occultations through the C ring, read as Saturn's oscillations.
//
// Both keep every output (G.noVoiding in the modifier and in beforeWorking): a cartridge's grains, a model or a chart lost to a full bus
// would be a lost run. No parallel hatch: one flyby is one sample, one model is one observing run.
// Parts: sampler 1-2 energy hatches, 1-2 input buses, 1-2 output buses, 1-3 output hatches; seismometer 1-2 energy hatches, 1-2 input
// buses, 1-2 input hatches, 1-2 output buses (ME parts fit).
// Textures: grindless:block/multiblock/<machine> (tools/assets/Build-ZPMSaturnScienceTextures.ps1).
// Names / tooltips: client_scripts/grindless/zpm_saturn_science_lang.js. Published: global.grindless.zpmSaturnScience.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const SC = G.zpmSaturnScience || (G.zpmSaturnScience = {})

  const BAY = 'grindless:probe_bay_casing'
  const BAY_TEXTURE = 'grindless:block/zpm/probe_bay_casing'
  const STATION = 'grindless:station_truss_casing'
  const STATION_TEXTURE = 'grindless:block/luv/station_truss_casing'
  const GLASS = 'gtceu:laminated_glass'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'

  SC.orbit = 'grindless:saturn_orbit'

  function parts(casing, min, limits) {
    const choices = [Pat.block(casing, { min: min })]
    Object.keys(limits).forEach(function (name) { choices.push(Pat.part(name, limits[name])) })
    return Pat.oneOf.apply(null, choices)
  }

  // ---------------------------------------------------------------- the plume sampler: 7 wide, 7 deep, 5 high
  // rows bottom -> top: 0 floor (ports or casing), 1-3 the walls around the capture bay and the boom, 4 the roof
  const SAMPLER_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 3 } }
  function samplerSlice(z) {
    var rows = []
    for (var y = 0; y < 5; y++) {
      var row = ''
      for (var x = 0; x < 7; x++) {
        var edge = x === 0 || x === 6 || z === 0 || z === 6
        var post = (x === 0 || x === 6) && (z === 0 || z === 6)
        var c = ' '
        if (y === 0) c = edge ? 'X' : 'T'
        else if (y === 4) c = edge ? 'T' : 'L'
        else if (post) c = 'F'
        else if (edge) {
          if (z === 6 && y === 1) c = x === 3 ? 'S' : 'X'
          else c = y === 2 ? 'L' : 'C'
        } else if (x === 3 && z === 3) c = y === 3 ? 'D' : 'F'
        else if (x === 3 && y === 3 && z < 3) c = 'F'
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  const SAMPLER = {
    slices: [0, 1, 2, 3, 4, 5, 6].map(samplerSlice),
    symbols: {
      S: Pat.controller(),
      X: parts(BAY, 14, SAMPLER_PARTS),
      C: Pat.block(BAY),
      T: Pat.block(STATION),
      L: Pat.block(GLASS),
      F: Pat.frame(['titanium']),
      D: Pat.block(GEARBOX)
    }
  }

  // ---------------------------------------------------------------- the seismometer: 5 wide, 5 deep, 5 high
  // rows bottom -> top: 0 floor, 1-3 the truss walls around the photometer column, 4 the roof
  const SEISMOMETER_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, input_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 } }
  function seismometerSlice(z) {
    var rows = []
    for (var y = 0; y < 5; y++) {
      var row = ''
      for (var x = 0; x < 5; x++) {
        var edge = x === 0 || x === 4 || z === 0 || z === 4
        var post = (x === 0 || x === 4) && (z === 0 || z === 4)
        var c = ' '
        if (y === 0) c = edge ? 'X' : 'B'
        else if (y === 4) c = edge ? 'C' : 'B'
        else if (post) c = 'F'
        else if (edge) {
          if (z === 4 && y === 1) c = x === 2 ? 'S' : 'X'
          else if (y === 2) c = 'L'
          else c = y === 3 ? 'B' : 'C'
        } else if (x === 2 && z === 2) c = 'L'
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  const SEISMOMETER = {
    slices: [0, 1, 2, 3, 4].map(seismometerSlice),
    symbols: {
      S: Pat.controller(),
      X: parts(STATION, 10, SEISMOMETER_PARTS),
      C: Pat.block(STATION),
      B: Pat.block(BAY),
      L: Pat.block(GLASS),
      F: Pat.frame(['titanium'])
    }
  }

  // [items in, items out, fluids in, fluids out]
  SC.machines = [
    { name: 'plume_sampler', title: 'Plume Sampler', type: 'plume_sampling', io: [2, 1, 0, 2], spec: SAMPLER, parts: SAMPLER_PARTS,
      casing: BAY, texture: BAY_TEXTURE },
    { name: 'ring_seismometer', title: 'Ring Seismometer', type: 'kronoseismology', io: [3, 1, 1, 0], spec: SEISMOMETER,
      parts: SEISMOMETER_PARTS, casing: STATION, texture: STATION_TEXTURE }
  ]

  function keep(name) {
    return { which: 'both', name: name, reason: 'grindless.machine.' + name + '.no_voiding' }
  }

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    SC.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.io[0], m.io[1], m.io[2], m.io[3])
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.CHEMICAL)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SC.machines.forEach(function (m) {
      Pat.register('gtceu:' + m.name, m.spec)
      const tips = []
      for (let i = 0; i < 3; i++) tips.push(Text.translate('grindless.machine.' + m.name + '.tooltip.' + i))
      event.create(m.name, 'multiblock')
        .langValue(m.title)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.noVoiding.modifier(keep(m.name), G.parallelHatch.overclock), true)
        .beforeWorking(G.noVoiding.beforeWorking(keep(m.name)))
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        .allowExtendedFacing(false)
        ["tooltips(net.minecraft.network.chat.Component[])"](tips)
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
