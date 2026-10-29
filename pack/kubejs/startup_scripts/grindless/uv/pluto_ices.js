// priority: -10400
// -----------------------------------------------------------------------------------------------
// UV's Pluto ices (docs/eras/uv.md, machines 26 and 27; package UV-B3): two multiblocks of grindless:pluto_orbit and the penetrator.
//
//   gtceu:penetrator_probe_bay        type gtceu:penetrator_probe (new), DRILL FAMILY step 11. 7 x 7 x 9 station truss casing around a
//                                     hollow bay: a titanium frame probe rail down its middle, a tungstensteel gearbox (the ascent canister
//                                     catcher) on top of it. A penetrator falls into Sputnik Planitia or onto Charon, melts in on its
//                                     GPHS module (the probe stays in the ice) and sends a core up. The Triton ice core is kept: it
//                                     calibrates the probe for Kuiper ices.
//   gtceu:volatile_ice_fractionator   type gtceu:ice_fractionation (new). 7 x 7 x 7 station truss casing around a stepped cold finger:
//                                     a 3 x 3 steel pipe casing foot, then a column of titanium frames and pipe casings. Each ice sublimes
//                                     at its own temperature (N2 63 K, CO 68 K, CH4 91 K, the ammonia hydrate far above).
//
// Both keep every output (G.noVoiding in the modifier and in beforeWorking): the cores are the Plutonian seed's catalyst and the
// fractionator's only feed, and the ices feed the syngas shift, the pyrolyser and the tholin reformer.
// Parts: bay 1-2 energy hatches, 1-2 input buses, 1-2 output buses; fractionator 1-2 energy hatches, 1-2 input buses, 1-2 output buses,
// 1-3 output hatches (ME parts fit); at least 14 truss casings among the floor cells.
// Item: grindless:penetrator_probe (the printed frame, a GPHS module, the HPGe spectrometer and a LuV melt head; spent in each run).
// Textures: the station truss casing with ZPM's entry probe bay and EV's cryogenic plant overlays; item/penetrator_probe from
// tools/assets/Build-UVPlutoIcesTextures.ps1.
// Names / tooltips: client_scripts/grindless/uv_pluto_ices_lang.js. Recipes: server_scripts/grindless/uv/pluto_ices.js.
// Published: global.grindless.uvPlutoIces (.machines, .orbit, .penetratorType, .fractionType, .penetrator).
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const P = G.uvPlutoIces || (G.uvPlutoIces = {})

  const TRUSS = 'grindless:station_truss_casing'
  const TRUSS_TEXTURE = 'grindless:block/luv/station_truss_casing'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'
  const PIPE = 'gtceu:steel_pipe_casing'

  P.orbit = 'grindless:pluto_orbit'
  P.penetratorType = 'gtceu:penetrator_probe'
  P.fractionType = 'gtceu:ice_fractionation'
  P.penetrator = 'grindless:penetrator_probe'

  function parts(min, limits) {
    var choices = [Pat.block(TRUSS, { min: min })]
    Object.keys(limits).forEach(function (name) { choices.push(Pat.part(name, limits[name])) })
    return Pat.oneOf.apply(null, choices)
  }

  // A hollow shell, as uv/neptune.js: row 0 the floor (ports or casing), the top row the roof, the walls between, the controller at the
  // middle of the front wall's first row; centre(x, z, y) says what stands inside (' ' for air).
  function shellSlice(w, d, h, z, centre) {
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
        row += c
      }
      rows.push(row)
    }
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

  // ---------------------------------------------------------------- the penetrator probe bay: 7 wide, 7 deep, 9 high
  // rows bottom -> top: 0 floor, 1-6 the probe rail, 7 the canister catcher, 8 the roof
  // dressed as a drill derrick: titanium frame posts and roof ring, window bands, a steel pipe collar and a gearbox-lit skylight
  function bayRule(x, y, z, W, H, D) {
    var cx = x === 0 || x === W - 1
    var cz = z === 0 || z === D - 1
    if (y === H - 1) {
      if (cx || cz) return 'F'
      return Math.abs(x - 3) <= 1 && Math.abs(z - 3) <= 1 ? 'G' : null
    }
    if (cx && cz) return 'F'
    if (y === 3 || y === 4) return 'G'
    if (y === 6) return 'P'
    return null
  }
  const BAY_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 } }
  const BAY = {
    slices: dress([0, 1, 2, 3, 4, 5, 6].map(function (z) {
      return shellSlice(7, 7, 9, z, function (x, zz, y) { return x === 3 && zz === 3 ? (y === 7 ? 'D' : 'F') : ' ' })
    }), 'C', bayRule),
    symbols: {
      S: Pat.controller(),
      X: parts(14, BAY_PARTS),
      C: Pat.block(TRUSS),
      F: Pat.frame(['titanium']),
      D: Pat.block(GEARBOX),
      G: Pat.block('gtceu:laminated_glass'),
      P: Pat.block(PIPE)
    }
  }

  // ---------------------------------------------------------------- the fractionator: 7 wide, 7 deep, 7 high
  // rows bottom -> top: 0 floor, 1 the cold finger's 3 x 3 pipe foot, 2-5 its column (frame, pipe, frame, pipe), 6 the roof
  const FRACTION_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 3 } }
  // dressed as a cold tower: frame posts and roof ring, a frostproof condenser band round the middle, glass sight windows above and below
  // it on the middle three cells of each side, a pipe manifold under the roof and a skylight vent over the cold finger
  function fractionRule(x, y, z, W, H, D) {
    var cx = x === 0 || x === W - 1
    var cz = z === 0 || z === D - 1
    var along = cx ? z : x
    if (y === H - 1) {
      if (cx || cz) return 'F'
      return x === 3 && z === 3 ? 'P' : null
    }
    if (cx && cz) return 'F'
    if (y === 3) return 'Z'
    if (y === 5) return 'P'
    if ((y === 2 || y === 4) && along >= 2 && along <= 4) return 'G'
    return null
  }
  const FRACTIONATOR = {
    slices: dress([0, 1, 2, 3, 4, 5, 6].map(function (z) {
      return shellSlice(7, 7, 7, z, function (x, zz, y) {
        if (y === 1) return x >= 2 && x <= 4 && zz >= 2 && zz <= 4 ? 'P' : ' '
        if (x !== 3 || zz !== 3) return ' '
        return y % 2 === 0 ? 'F' : 'P'
      })
    }), 'C', fractionRule),
    symbols: {
      S: Pat.controller(),
      X: parts(14, FRACTION_PARTS),
      C: Pat.block(TRUSS),
      F: Pat.frame(['titanium']),
      P: Pat.block(PIPE),
      Z: Pat.block('gtceu:frostproof_machine_casing'),
      G: Pat.block('gtceu:laminated_glass')
    }
  }

  P.machines = [
    { name: 'penetrator_probe_bay', title: 'Penetrator Probe Bay', type: 'penetrator_probe', spec: BAY, parts: BAY_PARTS,
      overlay: 'grindless:block/multiblock/entry_probe_bay' },
    { name: 'volatile_ice_fractionator', title: 'Volatile Ice Fractionator', type: 'ice_fractionation', spec: FRACTIONATOR,
      parts: FRACTION_PARTS, overlay: 'grindless:block/multiblock/cryogenic_plant' }
  ]

  function keep(name) {
    return { which: 'both', name: name, reason: 'grindless.machine.' + name + '.no_voiding' }
  }

  StartupEvents.registry('item', function (event) {
    event.create(P.penetrator)
      .texture('grindless:item/penetrator_probe')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.penetrator_probe.0')))
      .tooltip(Text.darkGray(Text.translate('tooltip.grindless.penetrator_probe.1')))
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // the bay: 3 items in (the Triton ice core, the penetrator, the circuit), 1 item out
    event.create('penetrator_probe')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(3, 1, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.UP_TO_DOWN)
      .setSound(GTSoundEntries.MINER)
    // the fractionator: 2 items in (the core, the circuit), 1 item out (tholin or silicate), 3 fluids out
    event.create('ice_fractionation')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(2, 1, 0, 3)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.DOWN_TO_UP)
      .setSound(GTSoundEntries.COOLING)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    P.machines.forEach(function (m) {
      Pat.register('gtceu:' + m.name, m.spec)
      var tips = []
      for (var i = 0; i < 3; i++) tips.push(Text.translate('grindless.machine.' + m.name + '.tooltip.' + i))
      event.create(m.name, 'multiblock')
        .langValue(m.title)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.noVoiding.modifier(keep(m.name), G.parallelHatch.overclock), true)
        .beforeWorking(G.noVoiding.beforeWorking(keep(m.name)))
        .appearanceBlock(function () { return Block.getBlock(TRUSS) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        .allowExtendedFacing(false)
        ["tooltips(net.minecraft.network.chat.Component[])"](tips)
        .workableCasingModel(TRUSS_TEXTURE, m.overlay)
    })
  })
})()
