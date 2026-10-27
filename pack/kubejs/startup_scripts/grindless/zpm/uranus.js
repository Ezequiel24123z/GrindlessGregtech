// -----------------------------------------------------------------------------------------------
// ZPM's Uranus orbit (docs/eras/zpm.md, "Machines 25-27"; package ZPM-B5): three multiblocks of Uranus orbit and their recipe types.
//
//   gtceu:ice_giant_siphon   type ice_giant_siphon. 7 x 7 x 13 pressure hull around a hollow scoop bay, a tether winch (frame column topped by
//                            a gearbox) in its middle. Drill family step 9: Saturn's interior model is the catalyst, the scoop head the worn bit,
//                            the programmed circuit the depth (hydrogen, the ices, the diamond rain).
//   gtceu:slurry_separator   type slurry_separation. 5 x 5 x 7 pressure hull around a tungstensteel pipe cyclone cascade: the slurry decompressed
//                            in steps into diamond, a seed crystal, sulfur and ammonia water.
//   gtceu:flyby_probe_bay    type outer_flyby. 7 x 5 x 9 probe bay casing around a launch rail (a titanium frame beam): Voyager 2's gravity assist
//                            to Neptune and Triton, flown from Uranus orbit.
//
// The separator and the bay keep every output (G.noVoiding in the modifier and in beforeWorking): a seed, a recording or a sample lost to a full
// bus would be a lost run. The siphon keeps its outputs too (the H2S is dangerous and must go to the separator).
// Parts: siphon 1-2 energy hatches, 1-2 input buses, 1-3 output hatches; separator 1-2 energy hatches, 1-2 input buses, 1-2 input hatches,
// 1-2 output buses, 1-2 output hatches; bay 1-2 energy hatches, 1-2 input buses, 1-2 output buses, 1-2 output hatches (ME parts fit).
// Textures: grindless:block/multiblock/<machine> (tools/assets/Build-ZPMUranusTextures.ps1) on the pressure hull or the probe bay casing.
// Names / tooltips: client_scripts/grindless/zpm_uranus_lang.js. Published: global.grindless.zpmUranus.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const UR = G.zpmUranus || (G.zpmUranus = {})

  const HULL = 'grindless:pressure_hull_casing'
  const HULL_TEXTURE = 'grindless:block/zpm/pressure_hull_casing'
  const BAY = 'grindless:probe_bay_casing'
  const BAY_TEXTURE = 'grindless:block/zpm/probe_bay_casing'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'
  const CYCLONE = 'gtceu:tungstensteel_pipe_casing'

  UR.orbit = 'grindless:uranus_orbit'

  function parts(casing, min, limits) {
    const choices = [Pat.block(casing, { min: min })]
    Object.keys(limits).forEach(function (name) { choices.push(Pat.part(name, limits[name])) })
    return Pat.oneOf.apply(null, choices)
  }

  // A hollow shell: row 0 the floor (ports or casing), the top row the roof, the walls between, the controller at the middle of the front wall's
  // first row; centre(x, z, y) says what stands inside (' ' for air).
  function shellSlice(w, d, h, z, centre) {
    const rows = []
    for (let y = 0; y < h; y++) {
      let row = ''
      for (let x = 0; x < w; x++) {
        const edge = x === 0 || x === w - 1 || z === 0 || z === d - 1
        let c = ' '
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

  // ---------------------------------------------------------------- the siphon: 7 wide, 7 deep, 13 high
  // rows bottom -> top: 0 floor, 1-11 the walls around the scoop bay and the winch, 12 the roof
  const SIPHON_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_hatch: { min: 1, max: 3 } }
  const SIPHON = {
    slices: [0, 1, 2, 3, 4, 5, 6].map(function (z) {
      return shellSlice(7, 7, 13, z, function (x, zz, y) { return x === 3 && zz === 3 ? (y === 11 ? 'D' : 'F') : ' ' })
    }),
    symbols: {
      S: Pat.controller(),
      X: parts(HULL, 14, SIPHON_PARTS),
      C: Pat.block(HULL),
      F: Pat.frame(['titanium']),
      D: Pat.block(GEARBOX)
    }
  }

  // ---------------------------------------------------------------- the separator: 5 wide, 5 deep, 7 high
  // rows bottom -> top: 0 floor, 1-5 the hull around the cyclone cascade, 6 the roof
  const SEPARATOR_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, input_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 }, output_hatch: { min: 1, max: 2 } }
  const SEPARATOR = {
    slices: [0, 1, 2, 3, 4].map(function (z) {
      return shellSlice(5, 5, 7, z, function (x, zz) { return x === 2 && zz === 2 ? 'P' : ' ' })
    }),
    symbols: {
      S: Pat.controller(),
      X: parts(HULL, 10, SEPARATOR_PARTS),
      C: Pat.block(HULL),
      P: Pat.block(CYCLONE)
    }
  }

  // ---------------------------------------------------------------- the bay: 7 wide, 5 deep, 9 high
  // rows bottom -> top: 0 floor, 1-7 the casing around the launch rail (a titanium frame beam along the bay, row 4), 8 the roof
  const BAY_PARTS = { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 2 } }
  const PROBE_BAY = {
    slices: [0, 1, 2, 3, 4].map(function (z) {
      return shellSlice(7, 5, 9, z, function (x, zz, y) { return zz === 2 && y === 4 ? 'F' : ' ' })
    }),
    symbols: {
      S: Pat.controller(),
      X: parts(BAY, 14, BAY_PARTS),
      C: Pat.block(BAY),
      F: Pat.frame(['titanium'])
    }
  }

  // [items in, items out, fluids in, fluids out]
  UR.machines = [
    { name: 'ice_giant_siphon', title: 'Ice-Giant Siphon', type: 'ice_giant_siphon', io: [3, 1, 0, 2], spec: SIPHON, parts: SIPHON_PARTS,
      casing: HULL, texture: HULL_TEXTURE },
    { name: 'slurry_separator', title: 'Slurry Separator', type: 'slurry_separation', io: [1, 3, 2, 2], spec: SEPARATOR, parts: SEPARATOR_PARTS,
      casing: HULL, texture: HULL_TEXTURE },
    { name: 'flyby_probe_bay', title: 'Flyby Probe Bay', type: 'outer_flyby', io: [4, 2, 0, 1], spec: PROBE_BAY, parts: BAY_PARTS,
      casing: BAY, texture: BAY_TEXTURE }
  ]

  function keep(name) {
    return { which: 'both', name: name, reason: 'grindless.machine.' + name + '.no_voiding' }
  }

  // UV-B2: the type's Neptune rows (recipe path ice_giant_siphon/neptune_*) belong to UV's deep siphon (uv/neptune.js, N.siphonPrefix);
  // this siphon refuses them even when carried to Neptune orbit
  const NEPTUNE_ROWS = 'ice_giant_siphon/neptune_'
  function next(m) {
    if (m.name !== 'ice_giant_siphon') return G.parallelHatch.overclock
    return function (machine, recipe) {
      if (String(recipe.id.getPath()).indexOf(NEPTUNE_ROWS) === 0) return ModifierFunction.NULL
      return G.parallelHatch.overclock(machine, recipe)
    }
  }

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    UR.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.io[0], m.io[1], m.io[2], m.io[3])
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.CHEMICAL)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    UR.machines.forEach(function (m) {
      Pat.register('gtceu:' + m.name, m.spec)
      const tips = []
      for (let i = 0; i < 3; i++) tips.push(Text.translate('grindless.machine.' + m.name + '.tooltip.' + i))
      event.create(m.name, 'multiblock')
        .langValue(m.title)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.noVoiding.modifier(keep(m.name), next(m)), true)
        .beforeWorking(G.noVoiding.beforeWorking(keep(m.name)))
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        .allowExtendedFacing(false)
        ["tooltips(net.minecraft.network.chat.Component[])"](tips)
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
