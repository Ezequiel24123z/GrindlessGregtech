// priority: -12000
// -----------------------------------------------------------------------------------------------
// ZPM's Titan probes (docs/eras/zpm.md, "Machines 21-22"; package ZPM-B3): two multiblocks of Saturn orbit and their recipe types.
// Titan itself is not registered (decision 2): it is a probe target, every sample a machine's product.
//
//   gtceu:entry_probe_bay   type titan_entry. 7 x 5 x 9 probe bay casing around a hollow bay: a launch rail (titanium frames) along the floor
//                           and a canister dock (laminated glass) at its end. A PICA-shielded probe goes down on a parachute, as Huygens did,
//                           or flies the lakes, as Dragonfly will.
//   gtceu:tholin_reformer   type tholin_reforming. 5 x 5 x 7 PTFE inert casing around a PTFE pipe core, on a station truss deck: tholins
//                           hydrolysed into nitriles, then polymers.
//
// Also registered here: the item grindless:titan_probe_recording (the probe's telemetry, decoded in the deep space network of ZPM-A9) and
// the GT material gtceu:titan_nitriles (the nitrile mix, a liquid).
// Parts: bay 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output buses, 1-3 output hatches; reformer 1-2 energy hatches, 1-2 input buses,
// 1-2 input hatches, 1-2 output buses, 1-2 output hatches (ME parts fit).
// Textures: grindless:block/multiblock/<machine> (tools/assets/Build-ZPMTitanProbesTextures.ps1).
// Names / tooltips: client_scripts/grindless/zpm_titan_probes_lang.js. Published: global.grindless.zpmTitanProbes.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const ZT = G.zpmTitanProbes || (G.zpmTitanProbes = {})

  const STATION = 'grindless:station_truss_casing'
  const STATION_TEXTURE = 'grindless:block/luv/station_truss_casing'
  const BAY = 'grindless:probe_bay_casing'
  const BAY_TEXTURE = 'grindless:block/zpm/probe_bay_casing'
  const INERT = 'gtceu:inert_machine_casing'
  const INERT_TEXTURE = 'gtceu:block/casings/solid/machine_casing_inert_ptfe'
  const PTFE_PIPE = 'gtceu:ptfe_pipe_casing'
  const GLASS = 'gtceu:laminated_glass'

  ZT.orbit = 'grindless:saturn_orbit'
  ZT.recording = 'grindless:titan_probe_recording'
  ZT.nitriles = 'titan_nitriles'

  function parts(casing, min, limits) {
    const choices = [Pat.block(casing, { min: min })]
    Object.keys(limits).forEach(function (name) { choices.push(Pat.part(name, limits[name])) })
    return Pat.oneOf.apply(null, choices)
  }

  // ---------------------------------------------------------------- the bay: 7 wide, 9 deep, 5 high
  // rows bottom -> top: 0 floor (ports or casing), 1-3 the walls around the hollow bay (rail along its floor, dock at its end), 4 the roof
  const BAY_PARTS = { energy_input: { min: 1, max: 2 },   input_bus: { min: 1, max: 2 }, input_hatch: { min: 1, max: 2 },
      output_bus: { min: 1, max: 2 }, output_hatch: { min: 1, max: 3 } }
  function bayLayer(z) {
    const rows = []
    for (let y = 0; y < 5; y++) {
      let row = ''
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || x === 6 || z === 0 || z === 8
        let c = ' '
        if (y === 0) c = 'X'
        else if (y === 4) c = 'C'
        else if (edge) c = z === 8 && y === 1 ? (x === 3 ? 'S' : 'X') : 'C'
        else if (y === 1 && x === 3) c = z === 7 ? 'D' : 'R'
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
      X: parts(BAY, 12, BAY_PARTS),
      C: Pat.block(BAY),
      R: Pat.frame(['titanium']),
      D: Pat.block(GLASS)
    }
  }

  // ---------------------------------------------------------------- the reformer: 5 wide, 5 deep, 7 high
  // rows bottom -> top: 0 the station truss deck (ports or truss), 1-5 the inert shell around the PTFE pipe core, 6 the roof
  const REFORMER_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, input_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 }, output_hatch: { min: 1, max: 2 } }
  function reformerLayer(z) {
    const rows = []
    for (let y = 0; y < 7; y++) {
      let row = ''
      for (let x = 0; x < 5; x++) {
        const edge = x === 0 || x === 4 || z === 0 || z === 4
        let c = ' '
        if (y === 0) c = 'X'
        else if (y === 6) c = 'C'
        else if (edge) c = z === 4 && y === 1 ? (x === 2 ? 'S' : 'X') : 'C'
        else if (x === 2 && z === 2) c = 'P'
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  const REFORMER_SPEC = {
    slices: [0, 1, 2, 3, 4].map(reformerLayer),
    symbols: {
      S: Pat.controller(),
      X: parts(STATION, 8, REFORMER_PARTS),
      C: Pat.block(INERT),
      P: Pat.block(PTFE_PIPE)
    }
  }

  // [items in, items out, fluids in, fluids out]
  ZT.machines = [
    { name: 'entry_probe_bay', title: 'Entry Probe Bay', type: 'titan_entry', io: [2, 2, 2, 2], spec: BAY_SPEC, parts: BAY_PARTS,
      casing: BAY, texture: BAY_TEXTURE, tooltips: 3 },
    { name: 'tholin_reformer', title: 'Tholin Reformer', type: 'tholin_reforming', io: [1, 1, 2, 1], spec: REFORMER_SPEC, parts: REFORMER_PARTS,
      casing: INERT, texture: INERT_TEXTURE, tooltips: 3 }
  ]

  StartupEvents.registry('item', function (event) {
    const item = event.create(ZT.recording)
      .texture('grindless:item/titan_probe_recording')
      .maxStackSize(16)
    item.tooltip(Text.gray(Text.translate('tooltip.grindless.titan_probe_recording.0')))
    item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.titan_probe_recording.1')))
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create(ZT.nitriles)
      .liquid()
      .color(0xC98A3C)
      .formula('C3H3N(C2H3N)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    ZT.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.io[0], m.io[1], m.io[2], m.io[3])
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.CHEMICAL)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    ZT.machines.forEach(function (m) {
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
