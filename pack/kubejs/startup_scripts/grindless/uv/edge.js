// -----------------------------------------------------------------------------------------------
// UV's edge (docs/eras/uv.md, "Machines 30-31"; package UV-B5): two multiblocks of Pluto orbit and their recipe types.
//
//   gtceu:precursor_probe_bay          type precursor_probe. 7 x 7 x 11 station truss casing around a hollow launch hall: a launch rail
//                                      (titanium frames) along its floor and a DSN relay (computer casing) at its far end. The probe
//                                      leaves Pluto's orbit with an ICAN kick and reaches the heliopause, as the Interstellar Probe study
//                                      (JHU/APL, 2021) planned after Voyager 1's crossing (2012).
//   gtceu:event_horizon_interferometer type event_horizon_imaging (the observatory family's step 8). 9 x 9 x 5 station truss casing
//                                      under a 7 x 7 dish (aluminium blocks) with a hydrogen maser clock (advanced computer casing) at
//                                      its core: a Pluto-Earth baseline resolves Sgr A*'s shadow (a fictional extrapolation of space VLBI).
//
// Also registered here: grindless:precursor_probe (2 probe RTGs, a thruster pod, the HPGe spectrometer, a printed frame). The heliopause
// data and the Sgr A* image are F1's (uv/foundation.js).
// Parts: both 1-2 energy hatches, 1-2 input buses, 1-2 output buses (ME parts fit).
// Textures: the controllers reuse the flyby probe bay's and the interferometer's faces on the station truss casing; the item icon by
// tools/assets/Build-UVEdgeTextures.ps1.
// Names / tooltips: client_scripts/grindless/uv_edge_lang.js. Published: global.grindless.uvEdge.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const E = G.uvEdge || (G.uvEdge = {})

  const STATION = 'grindless:station_truss_casing'
  const STATION_TEXTURE = 'grindless:block/luv/station_truss_casing'
  const RELAY = 'gtceu:computer_casing'
  const DISH = 'gtceu:aluminium_block'
  const MASER = 'gtceu:advanced_computer_casing'

  E.orbit = 'grindless:pluto_orbit'
  E.ids = { probe: 'grindless:precursor_probe' }
  const ITEMS = {
    precursor_probe: { stack: 4 }
  }
  E.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })

  function parts(casing, min, limits) {
    const choices = [Pat.block(casing, { min: min })]
    Object.keys(limits).forEach(function (name) { choices.push(Pat.part(name, limits[name])) })
    return Pat.oneOf.apply(null, choices)
  }

  // ---------------------------------------------------------------- the bay: 7 wide, 11 deep, 7 high
  // rows bottom -> top: 0 floor (ports or truss), 1-5 the walls around the hollow hall (rail along its floor, relay at its far end),
  // 6 the roof. The controller sits in the front wall (z 10).
  const BAY_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 } }
  function bayLayer(z) {
    const rows = []
    for (let y = 0; y < 7; y++) {
      let row = ''
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || x === 6 || z === 0 || z === 10
        let c = ' '
        if (y === 0) c = 'X'
        else if (y === 6) c = 'C'
        else if (edge) c = z === 10 && y === 1 ? (x === 3 ? 'S' : 'X') : 'C'
        else if (z === 1 && y <= 3 && x >= 2 && x <= 4) c = 'D'
        else if (y === 1 && x === 3) c = 'R'
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  const BAY_SPEC = {
    slices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(bayLayer),
    symbols: {
      S: Pat.controller(),
      X: parts(STATION, 16, BAY_PARTS),
      C: Pat.block(STATION),
      R: Pat.frame(['titanium']),
      D: Pat.block(RELAY)
    }
  }

  // ---------------------------------------------------------------- the interferometer: 9 wide, 9 deep, 5 high
  // rows bottom -> top: 0 the deck (ports or truss), 1-2 the truss walls around the receiver room (the maser clock at its centre),
  // 3 the 7 x 7 dish inside a truss ring, 4 the rim
  const EHI_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 } }
  function ehiLayer(z) {
    const rows = []
    for (let y = 0; y < 5; y++) {
      let row = ''
      for (let x = 0; x < 9; x++) {
        const edge = x === 0 || x === 8 || z === 0 || z === 8
        let c = ' '
        if (y === 0) c = 'X'
        else if (edge) c = z === 8 && y === 1 ? (x === 4 ? 'S' : 'X') : 'C'
        else if (y === 3) c = 'A'
        else if (y <= 2 && x === 4 && z === 4) c = 'M'
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  const EHI_SPEC = {
    slices: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(ehiLayer),
    symbols: {
      S: Pat.controller(),
      X: parts(STATION, 20, EHI_PARTS),
      C: Pat.block(STATION),
      A: Pat.block(DISH),
      M: Pat.block(MASER)
    }
  }

  // io: [items in, items out, fluids in, fluids out]; the programmed circuit and kept items count as item inputs
  E.machines = [
    { name: 'precursor_probe_bay', title: 'Precursor Probe Bay', type: 'precursor_probe', io: [3, 1, 0, 0], spec: BAY_SPEC,
      parts: BAY_PARTS, overlay: 'flyby_probe_bay', tooltips: 4 },
    { name: 'event_horizon_interferometer', title: 'Event Horizon Interferometer', type: 'event_horizon_imaging', io: [4, 1, 0, 0],
      spec: EHI_SPEC, parts: EHI_PARTS, overlay: 'interferometer', tooltips: 4 }
  ]

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      const item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    E.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.io[0], m.io[1], m.io[2], m.io[3])
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.COMPUTATION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    E.machines.forEach(function (m) {
      Pat.register('gtceu:' + m.name, m.spec)
      const tips = []
      for (let i = 0; i < m.tooltips; i++) tips.push(Text.translate('grindless.machine.' + m.name + '.tooltip.' + i))
      event.create(m.name, 'multiblock')
        .langValue(m.title)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(STATION) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        .allowExtendedFacing(false)
        ["tooltips(net.minecraft.network.chat.Component[])"](tips)
        .workableCasingModel(STATION_TEXTURE, 'grindless:block/multiblock/' + m.overlay)
    })
  })
})()
