// priority: -10200
// -----------------------------------------------------------------------------------------------
// UV's Neptune orbit (docs/eras/uv.md, machines 24 and 25; package UV-B2): two multiblocks of grindless:neptune_orbit.
//
//   gtceu:neptune_deep_siphon      ZPM's ice-giant siphon type (gtceu:ice_giant_siphon), drill step 10: the same scoop on a longer tether,
//                                  below Neptune's methane deck. 7 x 7 x 15 station truss casing around a hollow scoop bay, a titanium
//                                  frame winch topped by a tungstensteel gearbox in its middle. It runs only the type's Neptune rows
//                                  (recipe path ice_giant_siphon/neptune_*, circuits 4-5); ZPM's siphon refuses them
//                                  (startup_scripts/grindless/zpm/uranus.js), so Neptune helium and hydrogen come only from here.
//   gtceu:triton_geyser_sampler    type gtceu:triton_plume (new). 7 x 7 x 7 station truss casing around a probe hangar (a titanium frame
//                                  launch rail across its middle): an aerogel cartridge flown through Triton's nitrogen geysers.
//
// Both keep every output (G.noVoiding in the modifier and in beforeWorking): the gases are the UV He-3 and N-15 lines' only source.
// Parts: siphon 1-2 energy hatches, 1-2 input buses, 1-3 output hatches; sampler 1-2 energy hatches, 1-2 input buses, 1-2 output buses,
// 1-2 output hatches (ME parts fit); at least 14 truss casings among the floor cells.
// Textures: the station truss casing with the ZPM ice-giant siphon's and the Saturn plume sampler's overlays (no new texture).
// Names / tooltips: client_scripts/grindless/uv_neptune_lang.js. Recipes: server_scripts/grindless/uv/neptune.js.
// Published: global.grindless.uvNeptune (.machines, .siphonPrefix, .orbit, .plumeType).
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const N = G.uvNeptune || (G.uvNeptune = {})
  const LOG = '[grindless/uv] '

  const TRUSS = 'grindless:station_truss_casing'
  const TRUSS_TEXTURE = 'grindless:block/luv/station_truss_casing'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'

  N.orbit = 'grindless:neptune_orbit'
  N.siphonType = 'gtceu:ice_giant_siphon'
  N.plumeType = 'gtceu:triton_plume'
  // the deep siphon's rows of the shared type; zpm/uranus.js keeps the same literal (tools/analysis/test/uv-neptune.test.mjs checks both)
  N.siphonPrefix = 'ice_giant_siphon/neptune_'

  function parts(min, limits) {
    var choices = [Pat.block(TRUSS, { min: min })]
    Object.keys(limits).forEach(function (name) { choices.push(Pat.part(name, limits[name])) })
    return Pat.oneOf.apply(null, choices)
  }

  // A hollow shell, as zpm/uranus.js: row 0 the floor (ports or casing), the top row the roof, the walls between, the controller at the
  // middle of the front wall's first row; centre(x, z, y) says what stands inside (' ' for air).
  // wall(x, z, y, w, d, h) may swap a plain wall or roof cell (QR-S3 dress) for another char; null keeps the casing
  function shellSlice(w, d, h, z, centre, wall) {
    var rows = []
    for (var y = 0; y < h; y++) {
      var row = ''
      for (var x = 0; x < w; x++) {
        var edge = x === 0 || x === w - 1 || z === 0 || z === d - 1
        var c = ' '
        if (y === 0) c = 'X'
        else if (y === h - 1) c = 'C'
        else if (edge) c = z === d - 1 && y === 1 ? (x === (w - 1) / 2 ? 'S' : 'X') : 'C'
        else c = centre(x, z, y)
        if (c === 'C' && wall) c = wall(x, z, y, w, d, h) || c
        row += c
      }
      rows.push(row)
    }
    return rows
  }

  // posts on the four corners (and the roof edge), then bands by row
  function isPost(x, z, y, w, d, h) {
    var cx = x === 0 || x === w - 1
    var cz = z === 0 || z === d - 1
    return (cx && cz) || (y === h - 1 && (cx || cz))
  }

  // deep siphon: a derrick-like tower, glass over the scoop bay and a pipe collar at the intake
  function siphonWall(x, z, y, w, d, h) {
    if (isPost(x, z, y, w, d, h)) return 'F'
    if (y === h - 1) return (x + z) % 2 === 0 ? 'G' : null
    if (y >= 5 && y <= 9) return (x + z) % 3 === 0 ? null : 'G'
    if (y === 3 || y === 12) return 'P'
    if (y === 2 || y === 11) return (x + z) % 2 === 0 ? 'F' : null
    return null
  }

  // sampler: a launch hangar with glass slits, a pipe band and a heatproof sampler-pad band
  function samplerWall(x, z, y, w, d, h) {
    if (isPost(x, z, y, w, d, h)) return 'F'
    if (y === h - 1) return (x + z) % 2 === 0 ? 'G' : null
    if (y === 2) return 'H'
    if (y === 4 || y === 3) return (x + z) % 2 === 0 ? 'G' : null
    if (y === 5) return 'P'
    return null
  }

  // ---------------------------------------------------------------- the deep siphon: 7 wide, 7 deep, 15 high
  // rows bottom -> top: 0 floor, 1-13 the walls around the scoop bay and the winch (two blocks longer than ZPM's), 14 the roof
  const SIPHON_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_hatch: { min: 1, max: 3 } }
  const SIPHON = {
    slices: [0, 1, 2, 3, 4, 5, 6].map(function (z) {
      return shellSlice(7, 7, 15, z, function (x, zz, y) { return x === 3 && zz === 3 ? (y === 13 ? 'D' : 'F') : ' ' }, siphonWall)
    }),
    symbols: {
      S: Pat.controller(),
      X: parts(14, SIPHON_PARTS),
      C: Pat.block(TRUSS),
      F: Pat.frame(['titanium']),
      G: Pat.block('gtceu:laminated_glass'),
      P: Pat.block('gtceu:tungstensteel_pipe_casing'),
      D: Pat.block(GEARBOX)
    }
  }

  // ---------------------------------------------------------------- the sampler: 7 wide, 7 deep, 7 high
  // rows bottom -> top: 0 floor, 1-5 the hangar (a titanium launch rail across it at row 3), 6 the roof
  const SAMPLER_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 2 } }
  const SAMPLER = {
    slices: [0, 1, 2, 3, 4, 5, 6].map(function (z) {
      return shellSlice(7, 7, 7, z, function (x, zz, y) { return zz === 3 && y === 3 ? 'F' : ' ' }, samplerWall)
    }),
    symbols: {
      S: Pat.controller(),
      X: parts(14, SAMPLER_PARTS),
      C: Pat.block(TRUSS),
      F: Pat.frame(['titanium']),
      G: Pat.block('gtceu:laminated_glass'),
      H: Pat.block('gtceu:heatproof_machine_casing'),
      P: Pat.block('gtceu:tungstensteel_pipe_casing')
    }
  }

  // the siphon's type is ZPM's (registered by zpm/uranus.js, not here); the sampler's takes 3 items in (the recording, the cartridge, the
  // circuit), 1 item out and 1 fluid out
  N.machines = [
    { name: 'neptune_deep_siphon', title: 'Neptune Deep Siphon', type: 'ice_giant_siphon', spec: SIPHON, parts: SIPHON_PARTS,
      overlay: 'grindless:block/multiblock/ice_giant_siphon', ownRowsOnly: true },
    { name: 'triton_geyser_sampler', title: 'Triton Geyser Sampler', type: 'triton_plume', spec: SAMPLER, parts: SAMPLER_PARTS,
      overlay: 'grindless:block/multiblock/plume_sampler', ownRowsOnly: false }
  ]

  function keep(name) {
    return { which: 'both', name: name, reason: 'grindless.machine.' + name + '.no_voiding' }
  }

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create('triton_plume')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(3, 1, 0, 1)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var failed = false
    // the deep siphon: only the shared type's Neptune rows, then GTM's overclock
    function neptuneRows(machine, recipe) {
      try {
        if (String(recipe.id.getPath()).indexOf(N.siphonPrefix) !== 0) return ModifierFunction.NULL
        return G.parallelHatch.overclock(machine, recipe)
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'neptune deep siphon recipe modifier failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }

    N.machines.forEach(function (m) {
      Pat.register('gtceu:' + m.name, m.spec)
      var tips = []
      for (var i = 0; i < 3; i++) tips.push(Text.translate('grindless.machine.' + m.name + '.tooltip.' + i))
      event.create(m.name, 'multiblock')
        .langValue(m.title)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.noVoiding.modifier(keep(m.name), m.ownRowsOnly ? neptuneRows : G.parallelHatch.overclock), true)
        .beforeWorking(G.noVoiding.beforeWorking(keep(m.name)))
        .appearanceBlock(function () { return Block.getBlock(TRUSS) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        .allowExtendedFacing(false)
        ["tooltips(net.minecraft.network.chat.Component[])"](tips)
        .workableCasingModel(TRUSS_TEXTURE, m.overlay)
    })
  })
})()
