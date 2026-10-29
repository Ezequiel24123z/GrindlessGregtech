// priority: -10300
// -----------------------------------------------------------------------------------------------
// UV's photonics (docs/eras/uv.md, machines 9 and 10, lines 8 and 9; package UV-A6): two machines, their recipe types, the items and
// fluids only they make. Every other UV id is F1's (global.grindless.uvFoundation): the fibre laser module, the ytterbium fibre, the
// InGaAs pump module, arsine and ytterbium. Ytterbium oxide is the extraction cascade's (startup_scripts/grindless/ev/extraction_cascade.js),
// made only by its Yb strip.
//
//   gtceu:fibre_draw_tower   ytterbium-doped double-clad fibre and the fibre laser module (machine 9). A 5 wide x 15 high x 5 deep tower
//                            of clean room casing: the MCVD lathe at its base (stainless gearbox head and tail stocks, a tungsten steel
//                            frame bed, a heatproof oxy-hydrogen burner), above it the capstan (gearbox), the coating cup (PTFE pipe
//                            casing), the draw furnace (a heatproof ring with the preform's hole) and the preform feed in the roof.
//   gtceu:fibre_draw         its recipe type (EU in); the programmed circuit picks the step: 1 preform, 2 draw, 3 module, 4 refurbish.
//   gtceu:mocvd_reactor      compound semiconductors grown atom layer by atom layer (machine 10). 7 x 7 x 7 on clean room casing: the gas
//                            cabinet (inert casing, back left), the arsine burn box beside it (heatproof casing: the exhaust scrubber),
//                            the rotating susceptor (gearbox under a heatproof heater) under the PTFE showerhead.
//   gtceu:mocvd              its recipe type (EU in); circuits: 1 organometallics, 2 epi, 3 bars, 4 NbN, 5 pump module, 6 scrub.
//
// Items (grindless:, names in client_scripts/grindless/uv_photonics_lang.js): yb_doped_preform, fibre_bragg_grating,
// gallium_arsenide_boule, gallium_arsenide_wafer, sapphire_boule, sapphire_wafer, ingaas_epi_wafer, ingaas_diode_bar, nbn_film_wafer
// (the NbN-coated wafer; UV-A7's SNSPD takes it). Fluids (GT materials, liquids): germanium_tetrachloride (GeCl4: UV-A7's germanium
// refinery makes it and must reuse this id), trimethylgallium, trimethylindium, acrylate_coating.
//
// Parts (both): 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output buses, 1-2 output hatches in the floor cells, at least
// 6 (tower) or 8 (reactor) casings among them. Textures: the qubit fab's overlay dir on the clean casing; item icons from
// tools/assets/Build-UVPhotonicsTextures.ps1. Published: global.grindless.photonics.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const P = G.photonics || (G.photonics = {})

  const TOWER = 'gtceu:fibre_draw_tower'
  const TOWER_TYPE = 'fibre_draw'
  const REACTOR = 'gtceu:mocvd_reactor'
  const REACTOR_TYPE = 'mocvd'

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const CLEAN_OVERLAY = 'grindless:block/multiblock/qubit_fab'
  const GEARBOX = 'gtceu:stainless_steel_gearbox'
  const PIPE = 'gtceu:ptfe_pipe_casing'
  const HEAT = 'gtceu:heatproof_machine_casing'
  const CABINET = 'gtceu:inert_machine_casing'
  const BED = 'tungsten_steel'

  // item name -> stack size; two tooltip lines each (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    yb_doped_preform: { stack: 16 },
    fibre_bragg_grating: { stack: 64 },
    gallium_arsenide_boule: { stack: 16 },
    gallium_arsenide_wafer: { stack: 64 },
    sapphire_boule: { stack: 16 },
    sapphire_wafer: { stack: 64 },
    ingaas_epi_wafer: { stack: 64 },
    ingaas_diode_bar: { stack: 64 },
    nbn_film_wafer: { stack: 64 }
  }

  // GT material name -> colour and formula (liquids; GTM colours and buckets them)
  const MATERIALS = {
    germanium_tetrachloride: { colour: 0xD8DCE0, formula: 'GeCl4' },
    trimethylgallium: { colour: 0xC8D0B8, formula: 'Ga(CH3)3' },
    trimethylindium: { colour: 0xB8C0D8, formula: 'In(CH3)3' },
    acrylate_coating: { colour: 0xE8E2C8, formula: 'C3H4O2' }
  }

  P.tower = TOWER
  P.reactor = REACTOR
  P.towerType = 'gtceu:' + TOWER_TYPE
  P.reactorType = 'gtceu:' + REACTOR_TYPE
  P.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  P.materials = Object.keys(MATERIALS).map(function (name) { return 'gtceu:' + name })
  P.ids = {}
  Object.keys(ITEMS).concat(Object.keys(MATERIALS)).forEach(function (name) {
    var key = name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() })
    P.ids[key] = (MATERIALS[name] ? 'gtceu:' : 'grindless:') + name
  })
  // tower: items in 4 (preform: SiCl4, Yb2O3, aluminium and the circuit), out 2 (preform + glass dust), fluids in 2 (GeCl4, oxygen),
  // out 1 (chlorine); reactor: items in 4 (gallium, indium, sodium and the circuit), out 1, fluids in 3 (TMGa, TMIn, arsine), out 2
  P.towerIO = { itemsIn: 4, itemsOut: 2, fluidsIn: 2, fluidsOut: 1 }
  P.reactorIO = { itemsIn: 4, itemsOut: 1, fluidsIn: 3, fluidsOut: 2 }
  P.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 2 }
  }
  P.minCasings = { tower: 6, reactor: 8 }
  P.blocks = { casing: CLEAN, gearbox: GEARBOX, pipe: PIPE, heat: HEAT, cabinet: CABINET, bed: BED }

  // ---------------------------------------------------------------- patterns
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front

  function cells(min) {
    return Pat.oneOf(
      Pat.block(CLEAN, { min: min }),
      Pat.part('energy_input', P.parts.energy_input),
      Pat.part('input_bus', P.parts.input_bus),
      Pat.part('input_hatch', P.parts.input_hatch),
      Pat.part('output_bus', P.parts.output_bus),
      Pat.part('output_hatch', P.parts.output_hatch)
    )
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

  // the draw tower: tungsten steel posts the whole height and a frame cap, a heatproof furnace section at the top, glass inspection
  // windows between a PTFE cooling jacket and the coating stage, clean casing in between
  function towerRule(x, y, z, W, H, D) {
    var cx = x === 0 || x === W - 1
    var cz = z === 0 || z === D - 1
    if (y === H - 1) return cx || cz ? 'M' : null
    if (cx && cz) return 'M'
    if (y === 12 || y === 13) return 'H'
    if (y === 10 || y === 6 || y === 2) return 'P'
    if (y === 3 || y === 4 || y === 8 || y === 9) return 'W'
    return null
  }

  // the tower: 15 rows; `over` replaces rows by index
  function towerSlice(floor, fill, over) {
    var rows = [floor]
    for (var i = 1; i < 15; i++) rows.push(over[i] || fill)
    return rows
  }
  const STOCK = towerSlice('XRRRX', 'R###R', { 1: 'R#G#R', 12: 'RHHHR', 14: 'RRRRR' })
  const TOWER_SPEC = {
    slices: dress([
      towerSlice('XXXXX', 'RRRRR', {}),
      STOCK,
      towerSlice('XRRRX', 'R###R', { 1: 'RHM#R', 3: 'R#G#R', 6: 'R#P#R', 12: 'RH#HR', 14: 'RRGRR' }),
      STOCK,
      towerSlice('XXXXX', 'RRRRR', { 1: 'RRSRR' })
    ], 'R', towerRule),
    symbols: {
      S: Pat.controller(),
      X: cells(P.minCasings.tower),
      R: Pat.block(CLEAN),
      G: Pat.block(GEARBOX),
      H: Pat.block(HEAT),
      P: Pat.block(PIPE),
      M: Pat.frame([BED]),
      W: Pat.block('gtceu:laminated_glass'),
      '#': Pat.air()
    }
  }
  P.towerSpec = TOWER_SPEC

  // the reactor: 7 x 7 x 7, a wall slice with a floor row of parts, ring slices with five interior rows (bottom -> top)
  function wall(floor) { return [floor, 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR'] }
  function ring(interior) {
    var rows = ['RRRRRRR']
    interior.forEach(function (row) { rows.push('R' + row + 'R') })
    rows.push('RRRRRRR')
    return rows
  }
  // the reactor, a growth chamber: stainless steel posts and roof ring, a heatproof susceptor band at the foot, glass windows into the
  // chamber, a PTFE gas manifold under the roof and a filter casing hood
  function reactorRule(x, y, z, W, H, D) {
    var cx = x === 0 || x === W - 1
    var cz = z === 0 || z === D - 1
    if (y === H - 1) {
      if (cx || cz) return 'F'
      return Math.abs(x - 3) <= 1 && Math.abs(z - 3) <= 1 ? 'Y' : null
    }
    if (cx && cz) return 'F'
    if (y === 1) return 'H'
    if (y === 5) return 'P'
    if ((y === 2 || y === 3 || y === 4) && (cx ? z : x) >= 2 && (cx ? z : x) <= 4) return 'W'
    return null
  }
  const EMPTY = '#####'
  const REACTOR_SPEC = {
    slices: dress([
      wall('XXXXXXX'),
      ring(['CC#HH', 'CC#HH', 'CC###', EMPTY, EMPTY]),
      ring(['CC###', 'CC###', 'CC###', '#PPP#', EMPTY]),
      ring(['##G##', '##H##', EMPTY, '#PPP#', EMPTY]),
      ring([EMPTY, EMPTY, EMPTY, '#PPP#', EMPTY]),
      ring([EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]),
      ['XXXXXXX', 'RRRSRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR']
    ], 'R', reactorRule),
    symbols: {
      S: Pat.controller(),
      X: cells(P.minCasings.reactor),
      R: Pat.block(CLEAN),
      C: Pat.block(CABINET),
      G: Pat.block(GEARBOX),
      H: Pat.block(HEAT),
      P: Pat.block(PIPE),
      F: Pat.frame(['stainless_steel']),
      W: Pat.block('gtceu:laminated_glass'),
      Y: Pat.block('gtceu:filter_casing'),
      '#': Pat.air()
    }
  }
  P.reactorSpec = REACTOR_SPEC

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var t = P.towerIO
    event.create(TOWER_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(t.itemsIn, t.itemsOut, t.fluidsIn, t.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_WIREMILL, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)
    var r = P.reactorIO
    event.create(REACTOR_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(r.itemsIn, r.itemsOut, r.fluidsIn, r.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(TOWER, TOWER_SPEC)
    Pat.register(REACTOR, REACTOR_SPEC)

    event.create('fibre_draw_tower', 'multiblock')
      .langValue('Fibre Draw Tower')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TOWER_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CLEAN) })
      .pattern(function (def) { return Pat.build(def, TOWER_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.fibre_draw_tower.tooltip.0'),
        Text.translate('grindless.machine.fibre_draw_tower.tooltip.1'),
        Text.translate('grindless.machine.fibre_draw_tower.tooltip.2'),
        Text.translate('grindless.machine.fibre_draw_tower.tooltip.3')
      ])
      .workableCasingModel(CLEAN_TEXTURE, CLEAN_OVERLAY)

    event.create('mocvd_reactor', 'multiblock')
      .langValue('MOCVD Reactor')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(REACTOR_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CLEAN) })
      .pattern(function (def) { return Pat.build(def, REACTOR_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.mocvd_reactor.tooltip.0'),
        Text.translate('grindless.machine.mocvd_reactor.tooltip.1'),
        Text.translate('grindless.machine.mocvd_reactor.tooltip.2'),
        Text.translate('grindless.machine.mocvd_reactor.tooltip.3')
      ])
      .workableCasingModel(CLEAN_TEXTURE, CLEAN_OVERLAY)
  })

  // ---------------------------------------------------------------- items and fluids

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MATERIALS).forEach(function (name) {
      event.create(name)
        .liquid()
        .color(MATERIALS[name].colour)
        .formula(MATERIALS[name].formula)
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
