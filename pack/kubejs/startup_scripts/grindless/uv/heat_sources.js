// priority: -9800
// -----------------------------------------------------------------------------------------------
// UV's heat source works (docs/eras/uv.md, machine 3; package UV-A2): the machine, its recipe type and the four items only it makes.
//
//   gtceu:heat_source_works   curium-244 heat sources: the pellet, the GPHS clad, the probe RTG, the Am-241 micro source and the
//                             curium RTG pellet. 5 x 5 x 7 on GT--'s radiation-proof machine casing (the hot cell's family): a press
//                             (tungsten steel frame) left and back, a sintering furnace (heatproof casing) right and front, and a
//                             laminated glass welding window beside the controller; parts on the back and the front floor rows.
//   gtceu:heat_source         its recipe type (EU in). The programmed circuit picks the step (server_scripts/grindless/uv/heat_sources.js):
//                               1 pellet   2 clad   3 probe RTG   4 micro source   5 RTG pellet
//
// Items (grindless:, names in client_scripts/grindless/uv_heat_sources_lang.js; every other UV id is F1's, global.grindless.uvFoundation):
//   probe_rtg, americium_micro_source, curium_rtg_pellet, heavy_curium_oxide (curium-245/246, stored for UHV)
//
// Containment: the works refuses to run while its controller voids items (lib/no_voiding.js, as ZPM's actinide plants): the heavy
// curium fraction is kept. Parts: 1-2 energy hatches, 1-2 input buses, 1-2 output buses; at least 4 casings among the part cells.
// Textures: the hot cell's overlay dir (grindless:block/multiblock/hot_cell) on the radiation-proof casing; items from
// tools/assets/Build-UVHeatSourcesTextures.ps1. Published: global.grindless.heatSources.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const HS = G.heatSources || (G.heatSources = {})

  const TYPE = 'heat_source'
  const MACHINE = 'gtceu:heat_source_works'

  const SHIELD = 'gtnn:radiation_proof_machine_casing'
  const SHIELD_TEXTURE = 'gtnn:block/casings/solid/radiation_proof_machine_casing'
  const OVERLAY = 'grindless:block/multiblock/hot_cell'
  const HEAT = 'gtceu:heatproof_machine_casing'
  const GLASS = 'gtceu:laminated_glass'
  const PRESS = 'tungsten_steel'
  const NO_VOIDING = 'grindless.machine.heat_source_works.no_voiding'

  // item name -> stack size; two tooltip lines each (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    probe_rtg: { stack: 4 },
    americium_micro_source: { stack: 64 },
    curium_rtg_pellet: { stack: 16 },
    heavy_curium_oxide: { stack: 64 }
  }

  HS.machine = MACHINE
  HS.recipeType = 'gtceu:' + TYPE
  HS.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  HS.ids = {
    probeRtg: 'grindless:probe_rtg',
    americiumMicroSource: 'grindless:americium_micro_source',
    curiumRtgPellet: 'grindless:curium_rtg_pellet',
    heavyCuriumOxide: 'grindless:heavy_curium_oxide'
  }
  // items in 5 (four inputs and the circuit), out 3; no fluids
  HS.maxIO = { itemsIn: 5, itemsOut: 3, fluidsIn: 0, fluidsOut: 0 }
  HS.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    minCasings: 4
  }
  HS.noVoiding = NO_VOIDING

  // ---------------------------------------------------------------- pattern
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front

  function cells() {
    return Pat.oneOf(
      Pat.block(SHIELD, { min: HS.parts.minCasings }),
      Pat.part('energy_input', HS.parts.energy_input),
      Pat.part('input_bus', HS.parts.input_bus),
      Pat.part('output_bus', HS.parts.output_bus)
    )
  }

  const FLOOR_ROOF = 'RRRRR'

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
  // hot cell: frame posts and roof edges, a heatproof band, lead-glass windows, heatproof roof ribs
  function cellRule(x, y, z, W, H, D) {
    var onX = x === 0 || x === W - 1
    var onZ = z === 0 || z === D - 1
    if (onX && onZ) return 'F'
    if (y === H - 1) {
      if (onX || onZ) return 'F'
      return z % 2 === 0 ? 'H' : null
    }
    if (y === 2) return 'H'
    if (y === 3) return ((onX ? z : x) % 2 === 1) ? 'G' : null
    return null
  }

  function slice(interior) {
    return [FLOOR_ROOF].concat(interior.map(function (row) { return 'R' + row + 'R' }), [FLOOR_ROOF])
  }

  const SPEC = {
    slices: dress([
      ['XXXXX', 'RRRRR', 'RRRRR', 'RRRRR', 'RRRRR'],
      slice(['MM#', 'MM#', '###']),
      slice(['MM#', 'MM#', '###']),
      slice(['###', '###', '###']),
      slice(['#HH', '#HH', '###']),
      slice(['#HH', '#HH', '###']),
      ['XXXXX', 'RGSGR', 'RRRRR', 'RRRRR', 'RRRRR']
    ], 'R', cellRule),
    symbols: {
      S: Pat.controller(),
      X: cells(),
      R: Pat.block(SHIELD),
      F: Pat.frame([PRESS]),
      H: Pat.block(HEAT),
      G: Pat.block(GLASS),
      M: Pat.frame([PRESS]),
      '#': Pat.air()
    }
  }
  HS.spec = SPEC

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var io = HS.maxIO
    event.create(TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var keep = { which: 'items', reason: NO_VOIDING, name: 'heat source works' }

    Pat.register(MACHINE, SPEC)

    event.create('heat_source_works', 'multiblock')
      .langValue('Heat Source Works')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      .recipeModifier(G.noVoiding.modifier(keep, G.parallelHatch.modifier(G.parallelHatch.overclock)), true)
      .beforeWorking(G.noVoiding.beforeWorking(keep))
      .appearanceBlock(function () { return Block.getBlock(SHIELD) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.heat_source_works.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.heat_source'))
      ])
      .workableCasingModel(SHIELD_TEXTURE, OVERLAY)
  })

  // ---------------------------------------------------------------- items

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })
})()
