// priority: -9800
// -----------------------------------------------------------------------------------------------
// UV's heat source works (docs/eras/uv.md, machine 3; package UV-A2): the machine, its recipe type and the four items only it makes.
//
//   gtceu:heat_source_works   curium-244 heat sources: the pellet, the GPHS clad, the probe RTG, the Am-241 micro source and the
//                             curium RTG pellet. 7 x 5 x 13 on the radiation vault casing (LuV, the previous era's casing for the job;
//                             GT--'s radiation-proof casing is the detail): three bays behind glass partitions, a press (frames), a
//                             sintering furnace (heatproof casing) and an RTG bench; parts on the back and the front floor rows.
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

  const VAULT = 'grindless:radiation_vault_casing'
  const VAULT_TEXTURE = 'grindless:block/luv/radiation_vault_casing'
  const SHIELD = 'gtnn:radiation_proof_machine_casing'
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
      Pat.block(VAULT, { min: HS.parts.minCasings }),
      Pat.part('energy_input', HS.parts.energy_input),
      Pat.part('input_bus', HS.parts.input_bus),
      Pat.part('output_bus', HS.parts.output_bus)
    )
  }

  // A glovebox line, 7 wide, 5 high and 13 deep, in the LuV radiation vault casing: three bays behind laminated glass partitions (the hot
  // press of tungsten steel frames at the back, the sintering furnace of heatproof casing, the RTG assembly bench at the front), a
  // radiation-proof band and lead glass windows in the walls. Slices run back -> front; the controller is in the front wall
  function cell(x, y, z) {
    var lastX = 6
    var lastY = 4
    var lastZ = 12
    var cx = x === 0 || x === lastX
    var cz = z === 0 || z === lastZ
    var wall = cx || cz
    if (y === 0) return 'X'
    if (y === lastY) {
      if (wall) return 'F'
      return z % 2 === 0 ? 'H' : 'R'
    }
    if (wall) {
      if (cx && cz) return 'F'
      if (z === lastZ && y === 1) return x === 3 ? 'S' : (x === 2 || x === 4 ? 'G' : 'R')
      if (y === 2) return 'Y'
      if (y === 3) return ((cx ? z : x) % 2 === 1) ? 'G' : 'R'
      return 'R'
    }
    if ((z === 4 || z === 8) && x !== 3 && y <= 3) return y === 1 ? 'R' : 'G'
    if (z <= 2 && x <= 2 && y <= 2) return 'M'
    if (z >= 5 && z <= 6 && x >= 4 && y <= 2) return 'H'
    if (z === 10 && x === 1 && y <= 3) return 'M'
    if (z >= 9 && z <= 10 && x >= 4 && y === 1) return 'Y'
    return '#'
  }
  var heatSlices = []
  for (var hz = 0; hz < 13; hz++) {
    var heatRows = []
    for (var hy = 0; hy < 5; hy++) {
      var heatRow = ''
      for (var hx = 0; hx < 7; hx++) heatRow += cell(hx, hy, hz)
      heatRows.push(heatRow)
    }
    heatSlices.push(heatRows)
  }

  const SPEC = {
    slices: heatSlices,
    symbols: {
      S: Pat.controller(),
      X: cells(),
      R: Pat.block(VAULT),
      Y: Pat.block(SHIELD),
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
      .appearanceBlock(function () { return Block.getBlock(VAULT) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.heat_source_works.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.heat_source'))
      ])
      .workableCasingModel(VAULT_TEXTURE, OVERLAY)
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
