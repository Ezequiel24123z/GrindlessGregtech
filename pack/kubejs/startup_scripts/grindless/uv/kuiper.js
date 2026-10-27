// priority: -9900
// -----------------------------------------------------------------------------------------------
// UV's Kuiper belt (docs/eras/uv.md, "Machines 28-29" and line 17; package UV-B4): two multiblocks of Pluto orbit and their recipe types.
//
//   gtceu:kuiper_interceptor_bay   type kuiper_intercept. 7 x 9 x 7 station truss casing around a hollow probe hangar: a launch rail
//                                  (titanium frames) along its floor and a sample airlock (laminated glass) at its far end. An
//                                  ion-propelled interceptor visits a cold classical Kuiper Belt object (Arrokoth's kind) and brings a
//                                  sample back, as Hayabusa2 did from Ryugu.
//   gtceu:amorphous_ice_annealer   type ice_annealing. 5 x 5 x 7 station truss casing around a cryostat (the sample warms through its
//                                  crystallisation at about 140 K) under a gas collection manifold (tungsten steel pipe casing).
//
// Also registered here: grindless:kuiper_interceptor (a thruster pod, a probe RTG and a sample canister) and grindless:sample_canister
// (the sealed return capsule; the bay gives it back empty). The planetesimal sample and the Kuiper noble gas are F1's (uv/foundation.js).
// Parts: bay 1-2 energy hatches, 1-2 input buses, 1-2 output buses; annealer 1-2 energy hatches, 1-2 input buses, 1-4 output hatches
// (ME parts fit). The annealer has no output bus: the refractory dust is inert silicate and carbon and stays in the machine.
// Textures: the controllers reuse the entry probe bay's and the helium refrigerator's faces on the station truss casing; item icons by
// tools/assets/Build-UVKuiperTextures.ps1.
// Names / tooltips: client_scripts/grindless/uv_kuiper_lang.js. Published: global.grindless.uvKuiper.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const K = G.uvKuiper || (G.uvKuiper = {})

  const STATION = 'grindless:station_truss_casing'
  const STATION_TEXTURE = 'grindless:block/luv/station_truss_casing'
  const CRYOSTAT = 'grindless:cryostat_casing'
  const MANIFOLD = 'gtceu:tungstensteel_pipe_casing'
  const GLASS = 'gtceu:laminated_glass'

  K.orbit = 'grindless:pluto_orbit'
  K.ids = {
    interceptor: 'grindless:kuiper_interceptor',
    canister: 'grindless:sample_canister'
  }
  const ITEMS = {
    kuiper_interceptor: { stack: 4 },
    sample_canister: { stack: 16 }
  }
  K.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })

  function parts(casing, min, limits) {
    const choices = [Pat.block(casing, { min: min })]
    Object.keys(limits).forEach(function (name) { choices.push(Pat.part(name, limits[name])) })
    return Pat.oneOf.apply(null, choices)
  }

  // ---------------------------------------------------------------- the bay: 7 wide, 9 deep, 7 high
  // rows bottom -> top: 0 floor (ports or truss), 1-5 the walls around the hollow hangar (rail along its floor, airlock at its far end),
  // 6 the roof. The controller sits in the front wall (z 8).
  const BAY_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 } }
  function bayLayer(z) {
    const rows = []
    for (let y = 0; y < 7; y++) {
      let row = ''
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || x === 6 || z === 0 || z === 8
        let c = ' '
        if (y === 0) c = 'X'
        else if (y === 6) c = 'C'
        else if (edge) c = z === 8 && y === 1 ? (x === 3 ? 'S' : 'X') : 'C'
        else if (z === 1 && y <= 3 && x >= 2 && x <= 4) c = 'D'
        else if (y === 1 && x === 3) c = 'R'
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  const BAY_SPEC = {
    slices: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(bayLayer),
    symbols: {
      S: Pat.controller(),
      X: parts(STATION, 12, BAY_PARTS),
      C: Pat.block(STATION),
      R: Pat.frame(['titanium']),
      D: Pat.block(GLASS)
    }
  }

  // ---------------------------------------------------------------- the annealer: 5 wide, 5 deep, 7 high
  // rows bottom -> top: 0 the deck (ports or truss), 1-5 the truss shell around the core (cryostat in rows 1-3, manifold in rows 4-5),
  // 6 the roof
  const ANNEALER_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_hatch: { min: 1, max: 4 } }
  function annealerLayer(z) {
    const rows = []
    for (let y = 0; y < 7; y++) {
      let row = ''
      for (let x = 0; x < 5; x++) {
        const edge = x === 0 || x === 4 || z === 0 || z === 4
        let c = ' '
        if (y === 0) c = 'X'
        else if (y === 6) c = 'C'
        else if (edge) c = z === 4 && y === 1 ? (x === 2 ? 'S' : 'X') : 'C'
        else if (x === 2 && z === 2) c = y <= 3 ? 'K' : 'M'
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  const ANNEALER_SPEC = {
    slices: [0, 1, 2, 3, 4].map(annealerLayer),
    symbols: {
      S: Pat.controller(),
      X: parts(STATION, 8, ANNEALER_PARTS),
      C: Pat.block(STATION),
      K: Pat.block(CRYOSTAT),
      M: Pat.block(MANIFOLD)
    }
  }

  // io: [items in, items out, fluids in, fluids out]; the programmed circuit counts as an item input
  K.machines = [
    { name: 'kuiper_interceptor_bay', title: 'Kuiper Interceptor Bay', type: 'kuiper_intercept', io: [3, 2, 0, 0], spec: BAY_SPEC,
      parts: BAY_PARTS, overlay: 'entry_probe_bay', tooltips: 4 },
    { name: 'amorphous_ice_annealer', title: 'Amorphous Ice Annealer', type: 'ice_annealing', io: [2, 0, 0, 4], spec: ANNEALER_SPEC,
      parts: ANNEALER_PARTS, overlay: 'helium_refrigerator', tooltips: 4 }
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
    K.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.io[0], m.io[1], m.io[2], m.io[3])
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.CHEMICAL)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    K.machines.forEach(function (m) {
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
