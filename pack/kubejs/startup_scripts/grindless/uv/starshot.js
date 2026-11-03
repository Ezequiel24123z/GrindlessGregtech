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
//   gtceu:starchip_fab          machine 18, Earth. A 9 x 6 x 9 clean room hall (clean machine casing, a filter casing ceiling for ISO 1),
//                               a glass partition, a bonding line of five stainless steel gearboxes, a dicing saw and a test bench.
//   gtceu:starchip              its recipe type (EU in); circuits: 1 chip, 2 sail-chip.
//   gtceu:laser_sail_launcher   machine 23, the Moon. A 21 x 7 x 21 phased array of UV machine casing: 228 laser module blocks on two
//                               tiers in a module/pipe checkerboard, radiator fences, and a glass-windowed tower with the beam director
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
  S.laserModules = 228

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

  // starchip fab: a 9 x 6 x 9 clean room hall under a filter ceiling. Behind the front wall (z 5..7) the loading bay; a laminated glass
  // partition at z = 4 (door gap at the middle) closes off the process bay behind it: the bonding line (stainless steel gearboxes) along
  // z = 2, the dicing saw (a tungstensteel gearbox) at the back wall, the test bench (a steel gearbox) beside it
  function chipCell(x, y, z) {
    var last = 8
    var cx = x === 0 || x === last
    var cz = z === 0 || z === last
    var wall = cx || cz
    if (y === 0) return 'X'
    if (y === 5) return wall ? 'R' : 'F'
    if (wall) {
      if (cx && cz) return 'R'
      if (z === last && y === 1 && x === 4) return 'S'
      if (y === 1) return 'W'
      if (y === 2 || y === 3) return ((cx ? z : x) % 2 === 1) ? 'G' : 'C'
      return 'C'
    }
    if (z === 4 && x >= 1 && x <= 7 && x !== 4 && y <= 3) return y === 1 ? 'C' : 'G'
    if (y === 1 && z === 2 && x >= 2 && x <= 6) return 'B'
    if (y === 1 && z === 1 && x === 2) return 'D'
    if (y === 1 && z === 1 && x === 6) return 'T'
    return '#'
  }
  var chipSlices = []
  for (var cz0 = 0; cz0 < 9; cz0++) {
    var chipRows = []
    for (var cy0 = 0; cy0 < 6; cy0++) {
      var chipRow = ''
      for (var cx0 = 0; cx0 < 9; cx0++) chipRow += chipCell(cx0, cy0, cz0)
      chipRows.push(chipRow)
    }
    chipSlices.push(chipRows)
  }
  const CHIP_SPEC = {
    slices: chipSlices,
    symbols: {
      S: Pat.controller(),
      X: cells(CLEAN, S.minCasings.chip, S.chipParts),
      C: Pat.block(CLEAN),
      F: Pat.block(FILTER),
      B: Pat.block(BONDER),
      D: Pat.block('gtceu:tungstensteel_gearbox'),
      T: Pat.block('gtceu:steel_gearbox'),
      W: Pat.block('gtceu:plascrete'),
      R: Pat.frame(['stainless_steel']),
      G: Pat.block('gtceu:laminated_glass'),
      '#': Pat.air()
    }
  }
  S.chipSpec = CHIP_SPEC

  // laser sail launcher: a 21 x 7 x 21 phased array on a UV casing deck. Row 1 is the array: laser modules on every other cell, the
  // tungstensteel cooling runs on the cells between them; a second tier of modules stands on every other module of the first. The rim
  // is a casing wall topped by a radiator fence, and the beam director tower (a hollow glass-windowed column round the computer
  // casing director) stands in the centre. The roof is open over the array
  function launchCell(x, y, z) {
    var last = 20
    var dx = Math.abs(x - 10)
    var dz = Math.abs(z - 10)
    var core = Math.max(dx, dz)
    var rim = x === 0 || x === last || z === 0 || z === last
    if (y === 0) return 'X'
    if (rim) {
      if (y === 1) return (z === last && x === 10) ? 'S' : 'C'
      if (y === 2) return 'C'
      if (y === 3) return (x + z) % 2 === 0 ? 'F' : 'P'
      if (y === 4) return (x + z) % 2 === 0 ? 'F' : '#'
      return '#'
    }
    if (core <= 2) {
      if (y === 1) return (dx === 0 && dz === 0) ? 'D' : 'P'
      if (core === 2) {
        if (y === 6) return 'F'
        return (y === 3 || y === 4) && (dx + dz) % 2 === 1 ? 'G' : 'C'
      }
      if (y === 6) return 'C'
      return '#'
    }
    if (y === 1) return (x + z) % 2 === 0 ? 'L' : 'P'
    if (y === 2 && x % 2 === 0 && z % 2 === 0 && (x % 4 !== 0 || z % 4 !== 0)) return 'L'
    return '#'
  }
  var launchSlices = []
  for (var lz = 0; lz < 21; lz++) {
    var launchRows = []
    for (var ly = 0; ly < 7; ly++) {
      var launchRow = ''
      for (var lx = 0; lx < 21; lx++) launchRow += launchCell(lx, ly, lz)
      launchRows.push(launchRow)
    }
    launchSlices.push(launchRows)
  }
  const LAUNCH_SPEC = {
    slices: launchSlices,
    symbols: {
      S: Pat.controller(),
      X: cells(UV_CASING, S.minCasings.launch, S.launchParts),
      C: Pat.block(UV_CASING),
      L: Pat.block(MODULE_BLOCK),
      P: Pat.block(PIPE),
      D: Pat.block(DIRECTOR),
      F: Pat.frame(['tungsten_steel']),
      G: Pat.block('gtceu:fusion_glass'),
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
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.light_sail')),
        Text.translate('grindless.machine.light_sail_fab.tooltip.1')
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
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.starchip'))
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
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.laser_sail_launch')),
        Text.translate('grindless.machine.laser_sail_launcher.tooltip.1')
      ])
      .workableCasingModel(UV_TEXTURE, 'grindless:block/multiblock/laser_sail_launcher')
  })
})()
