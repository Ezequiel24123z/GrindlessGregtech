// priority: -10600
// -----------------------------------------------------------------------------------------------
// UV's Starshot (docs/eras/uv.md, machines 18, 21 and 23, line 20; package UV-A12): three machines and their recipe types, the light
// sail's three carriers and the three gases of its line. The light sail, starchip, sail-chip, Starshot probe, hBN dust, heliopause data,
// fibre laser module and laser module block are F1's (global.grindless.uvFoundation); never registered here.
//
//   gtceu:light_sail_fab        machine 21, Earth orbit. A 7 x 7 x 7 box of station truss casing: the film deposition bay at the back
//                               (a 3 x 3 tungsten heater on the back wall), a wake shield wall (whipple shield casing) in front of it,
//                               parts in the floor.
//   gtceu:light_sail            its recipe type (EU in); circuits: 1 film, 2 pattern, 3 release.
//   gtceu:starchip_fab          machine 18, Earth. A 5 x 5 x 5 clean room box (clean machine casing, a filter casing ceiling for ISO 1)
//                               with the bonder (a stainless steel gearbox) in the middle of the floor.
//   gtceu:starchip              its recipe type (EU in); circuits: 1 chip, 2 sail-chip.
//   gtceu:laser_sail_launcher   machine 23, the Moon. A 15 x 15 x 3 phased array of UV machine casing: 64 laser module blocks in four
//                               4 x 4 quadrants, a cooling loop (tungstensteel pipe casing) round and between them, the beam director
//                               (a computer casing) in the centre, the roof open over the array.
//   gtceu:laser_sail_launch     its recipe type (EU in); one recipe, circuit 1.
//
//   grindless:epitaxial_silicon_wafer   the sail's carrier: a silicon wafer under a silane epitaxy (LuV wake shield facility, circuit 4)
//   grindless:nitride_coated_carrier    the carrier under 100 nm of silicon nitride (light sail fab, circuit 1)
//   grindless:patterned_sail_carrier    the film patterned into the hBN metasurface (light sail fab, circuit 2)
//   gtceu:silane / gtceu:xenon_difluoride / gtceu:silicon_tetrafluoride   gases (none exists in GTM 7.5.3)
//
// Textures: grindless:block/multiblock/<machine> and grindless:item/<item> (tools/assets/Build-UVStarshotTextures.ps1). Names:
// client_scripts/grindless/uv_starshot_lang.js. Published: global.grindless.starshot.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const S = G.starshot || (G.starshot = {})

  const SAIL_FAB = 'gtceu:light_sail_fab'
  const SAIL_TYPE = 'light_sail'
  const CHIP_FAB = 'gtceu:starchip_fab'
  const CHIP_TYPE = 'starchip'
  const LAUNCHER = 'gtceu:laser_sail_launcher'
  const LAUNCH_TYPE = 'laser_sail_launch'

  const TRUSS = 'grindless:station_truss_casing'
  const TRUSS_TEXTURE = 'grindless:block/luv/station_truss_casing'
  const SHIELD = 'grindless:whipple_shield_casing'
  const HEATER = 'gtceu:tungsten_block'
  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const FILTER = 'gtceu:filter_casing'
  const BONDER = 'gtceu:stainless_steel_gearbox'
  const UV_CASING = 'gtceu:uv_machine_casing'
  const UV_TEXTURE = 'gtceu:block/casings/voltage/uv/side'
  const MODULE_BLOCK = 'grindless:laser_module_block'
  const PIPE = 'gtceu:tungstensteel_pipe_casing'
  const DIRECTOR = 'gtceu:computer_casing'

  S.sailFab = SAIL_FAB
  S.chipFab = CHIP_FAB
  S.launcher = LAUNCHER
  S.sailType = 'gtceu:' + SAIL_TYPE
  S.chipType = 'gtceu:' + CHIP_TYPE
  S.launchType = 'gtceu:' + LAUNCH_TYPE
  // where each machine works: the server adds .dimension(...) to every recipe of the type ('earth_orbit' = G.orbits.earth)
  S.sites = { light_sail: 'earth_orbit', starchip: null, laser_sail_launch: 'gcyr:luna' }

  // sail fab: items in 4 (carrier, hBN, the kept mask, circuit), out 1; fluids in 2 (silane + ammonia; XeF2), out 2 (SiF4 + xenon).
  // Starchip fab: items in 5 (four parts + circuit), out 2 (chip + kerf). Launcher: items in 4 (sail-chip, the kept heliopause data,
  // a fibre laser module, circuit), out 2 (probe, a spent module); no fluids
  S.sailIO = { itemsIn: 4, itemsOut: 1, fluidsIn: 2, fluidsOut: 2 }
  S.chipIO = { itemsIn: 5, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 }
  S.launchIO = { itemsIn: 4, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 }
  S.sailParts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 1 },
    output_hatch: { min: 1, max: 2 }
  }
  S.chipParts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    output_bus: { min: 1, max: 1 }
  }
  // 16 A UV: one 16 A UV energy hatch, or two 4 A ones and more
  S.launchParts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 1 },
    output_bus: { min: 1, max: 1 }
  }
  S.minCasings = { sail: 25, chip: 12, launch: 150 }
  S.blocks = { truss: TRUSS, shield: SHIELD, heater: HEATER, clean: CLEAN, filter: FILTER, bonder: BONDER, uvCasing: UV_CASING,
    moduleBlock: MODULE_BLOCK, pipe: PIPE, director: DIRECTOR }
  S.laserModules = 64

  S.items = {
    epitaxial_silicon_wafer: { stack: 64 },
    nitride_coated_carrier: { stack: 64 },
    patterned_sail_carrier: { stack: 64 }
  }
  S.materials = {
    silane: { colour: 0xE8ECF0, formula: 'SiH4' },
    xenon_difluoride: { colour: 0xC8B8F0, formula: 'XeF2' },
    silicon_tetrafluoride: { colour: 0xD8E0D0, formula: 'SiF4' }
  }

  function cells(casing, min, parts) {
    var choices = [Pat.block(casing, { min: min })]
    Object.keys(parts).forEach(function (name) { choices.push(Pat.part(name, parts[name])) })
    return Pat.oneOf.apply(null, choices)
  }

  // ---------------------------------------------------------------- patterns
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front

  // light sail fab: 7 x 7 x 7. z 1..3 the deposition bay (heater on the back wall), z 4 the wake shield, z 5 the access side
  function sailSlice(z) {
    var rows = []
    for (var y = 0; y < 7; y++) {
      var row = ''
      for (var x = 0; x < 7; x++) {
        var c = '#'
        var wall = x === 0 || x === 6 || z === 0 || z === 6
        if (y === 0) c = 'X'
        else if (y === 6 || wall) c = (z === 6 && y === 1 && x === 3) ? 'S' : 'C'
        else if (z === 4) c = 'W'
        else if (z === 1 && x >= 2 && x <= 4 && y >= 2 && y <= 4) c = 'T'
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

  // the sail fab, a deposition vault: titanium frame posts and roof ring, fusion glass viewing bands, a tungstensteel pipe gas line round
  // the middle, a glass skylight over the sail bay
  function sailRule(x, y, z, W, H, D) {
    var cx = x === 0 || x === W - 1
    var cz = z === 0 || z === D - 1
    if (y === H - 1) {
      if (cx || cz) return 'R'
      return x >= 2 && x <= 4 && z >= 2 && z <= 4 ? 'G' : null
    }
    if (cx && cz) return 'R'
    if (y === 3) return 'N'
    if ((y === 2 || y === 4) && (cx ? z : x) >= 1 && (cx ? z : x) <= 5 && (cx ? z : x) !== 3) return 'G'
    return null
  }
  const SAIL_SPEC = {
    slices: dress([0, 1, 2, 3, 4, 5, 6].map(sailSlice), 'C', sailRule),
    symbols: {
      S: Pat.controller(),
      X: cells(TRUSS, S.minCasings.sail, S.sailParts),
      C: Pat.block(TRUSS),
      W: Pat.block(SHIELD),
      T: Pat.block(HEATER),
      R: Pat.frame(['titanium']),
      G: Pat.block('gtceu:fusion_glass'),
      N: Pat.block(PIPE),
      '#': Pat.air()
    }
  }
  S.sailSpec = SAIL_SPEC

  // starchip fab: 5 x 5 x 5; the ceiling's inner 3 x 3 is filter casing, the bonder sits in the middle of the floor
  function chipSlice(z) {
    var rows = []
    for (var y = 0; y < 5; y++) {
      var row = ''
      for (var x = 0; x < 5; x++) {
        var c = '#'
        var wall = x === 0 || x === 4 || z === 0 || z === 4
        if (y === 0) c = 'X'
        else if (z === 4 && y === 1 && x === 2) c = 'S'
        else if (y === 4) c = wall ? 'C' : 'F'
        else if (wall) c = 'C'
        else if (y === 1 && x === 2 && z === 2) c = 'B'
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  // the clean room: stainless steel frame posts and roof ring, a laminated glass window band, the filter ceiling stays
  function chipRule(x, y, z, W, H, D) {
    var cx = x === 0 || x === W - 1
    var cz = z === 0 || z === D - 1
    if (y === H - 1) return 'R'
    if (cx && cz) return 'R'
    if (y === 2) return 'G'
    return null
  }
  const CHIP_SPEC = {
    slices: dress([0, 1, 2, 3, 4].map(chipSlice), 'C', chipRule),
    symbols: {
      S: Pat.controller(),
      X: cells(CLEAN, S.minCasings.chip, S.chipParts),
      C: Pat.block(CLEAN),
      F: Pat.block(FILTER),
      B: Pat.block(BONDER),
      R: Pat.frame(['stainless_steel']),
      G: Pat.block('gtceu:laminated_glass'),
      '#': Pat.air()
    }
  }
  S.chipSpec = CHIP_SPEC

  // laser sail launcher: 15 x 15 x 3. Middle row: the casing rim, the four 4 x 4 module quadrants (x and z 2..5 and 9..12), the
  // cooling loop everywhere else inside, the beam director at the centre. The roof is the rim only, open over the array
  function quadrant(i) { return (i >= 2 && i <= 5) || (i >= 9 && i <= 12) }
  function launchSlice(z) {
    var rows = []
    for (var y = 0; y < 3; y++) {
      var row = ''
      for (var x = 0; x < 15; x++) {
        var rim = x === 0 || x === 14 || z === 0 || z === 14
        var c
        if (y === 0) c = 'X'
        else if (rim) c = (z === 14 && y === 1 && x === 7) ? 'S' : 'C'
        else if (y === 2) c = '#'
        else if (x === 7 && z === 7) c = 'D'
        else if (quadrant(x) && quadrant(z)) c = 'L'
        else c = 'P'
        row += c
      }
      rows.push(row)
    }
    return rows
  }
  var launchSlices = []
  for (var lz = 0; lz < 15; lz++) launchSlices.push(launchSlice(lz))
  const LAUNCH_SPEC = {
    slices: launchSlices,
    symbols: {
      S: Pat.controller(),
      X: cells(UV_CASING, S.minCasings.launch, S.launchParts),
      C: Pat.block(UV_CASING),
      L: Pat.block(MODULE_BLOCK),
      P: Pat.block(PIPE),
      D: Pat.block(DIRECTOR),
      '#': Pat.air()
    }
  }
  S.launchSpec = LAUNCH_SPEC

  // ---------------------------------------------------------------- items and materials

  StartupEvents.registry('item', function (event) {
    Object.keys(S.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(S.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(S.materials).forEach(function (name) {
      var spec = S.materials[name]
      event.create(name).gas().color(spec.colour).formula(spec.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var a = S.sailIO
    event.create(SAIL_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(a.itemsIn, a.itemsOut, a.fluidsIn, a.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
    var b = S.chipIO
    event.create(CHIP_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(b.itemsIn, b.itemsOut, b.fluidsIn, b.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ASSEMBLER)
    var c = S.launchIO
    event.create(LAUNCH_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(c.itemsIn, c.itemsOut, c.fluidsIn, c.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.DOWN_TO_UP)
      .setSound(GTSoundEntries.ARC)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(SAIL_FAB, SAIL_SPEC)
    Pat.register(CHIP_FAB, CHIP_SPEC)
    Pat.register(LAUNCHER, LAUNCH_SPEC)

    event.create('light_sail_fab', 'multiblock')
      .langValue('Light Sail Fab')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(SAIL_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(TRUSS) })
      .pattern(function (def) { return Pat.build(def, SAIL_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.light_sail_fab.tooltip.0'),
        Text.translate('grindless.machine.light_sail_fab.tooltip.1'),
        Text.translate('grindless.machine.light_sail_fab.tooltip.2'),
        Text.translate('grindless.machine.light_sail_fab.tooltip.3')
      ])
      .workableCasingModel(TRUSS_TEXTURE, 'grindless:block/multiblock/light_sail_fab')

    event.create('starchip_fab', 'multiblock')
      .langValue('Starchip Fab')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(CHIP_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CLEAN) })
      .pattern(function (def) { return Pat.build(def, CHIP_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.starchip_fab.tooltip.0'),
        Text.translate('grindless.machine.starchip_fab.tooltip.1'),
        Text.translate('grindless.machine.starchip_fab.tooltip.2'),
        Text.translate('grindless.machine.starchip_fab.tooltip.3')
      ])
      .workableCasingModel(CLEAN_TEXTURE, 'grindless:block/multiblock/starchip_fab')

    event.create('laser_sail_launcher', 'multiblock')
      .langValue('Laser Sail Launcher')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(LAUNCH_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(UV_CASING) })
      .pattern(function (def) { return Pat.build(def, LAUNCH_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.laser_sail_launcher.tooltip.0'),
        Text.translate('grindless.machine.laser_sail_launcher.tooltip.1'),
        Text.translate('grindless.machine.laser_sail_launcher.tooltip.2'),
        Text.translate('grindless.machine.laser_sail_launcher.tooltip.3')
      ])
      .workableCasingModel(UV_TEXTURE, 'grindless:block/multiblock/laser_sail_launcher')
  })
})()
