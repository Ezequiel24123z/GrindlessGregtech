// priority: -9100
// -----------------------------------------------------------------------------------------------
// UHV's ZBLAN draw tower (docs/eras/uhv.md, machine 19 and line 31's ZrF4 row; package UHV-A10): the machine, its recipe type, the
// preform and the zirconium tetrafluoride it is melted from. The fibre is F1's (global.grindless.uhvFoundation: grindless:zblan_fibre)
// and so is zirconia (gtceu:zirconia, made by UHV-A8); neither is registered here.
//
//   gtceu:zblan_draw_tower   ZBLAN fluoride glass melted and drawn in microgravity (machine 19, Earth orbit only: the recipes carry
//                            .dimension(G.orbits.earth)). A 3 wide x 11 high x 3 deep tower of UV's draw tower casing (the clean room
//                            casing of startup_scripts/grindless/uv/photonics.js): the parts in the floor, the capstan (gearbox) above
//                            them, the empty draw path, the draw furnace (heatproof casing) under the preform feed, and the station
//                            module's truss bulkhead as the roof.
//   gtceu:zblan_draw         its recipe type (EU in); the programmed circuit picks the step: 1 glass (preform), 2 draw.
//
// Items (grindless:, names in client_scripts/grindless/uhv_zblan_lang.js): zblan_preform. Materials (GT dust): zirconium_tetrafluoride
// (ZrF4, line 31: GTM's chemical reactor makes it from zirconia and hydrogen fluoride).
//
// Parts: 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output buses, 1-2 output hatches in the floor cells, at least 3
// casings among them. Textures: the qubit fab's overlay dir on the clean casing, like UV's fibre draw tower; the preform icon from
// tools/assets/Build-UHVZblanTextures.ps1. Published: global.grindless.zblan.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const Z = G.zblan || (G.zblan = {})

  const TOWER = 'gtceu:zblan_draw_tower'
  const TOWER_TYPE = 'zblan_draw'

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const CLEAN_OVERLAY = 'grindless:block/multiblock/qubit_fab'
  const TRUSS = 'grindless:station_truss_casing'
  const GEARBOX = 'gtceu:stainless_steel_gearbox'
  const HEAT = 'gtceu:heatproof_machine_casing'

  // item name -> stack size; two tooltip lines each (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    zblan_preform: { stack: 16 }
  }

  // GT material name -> colour and formula (dusts)
  const MATERIALS = {
    zirconium_tetrafluoride: { colour: 0xE6ECF2, secondary: 0x8C9AA8, formula: 'ZrF4' }
  }

  Z.tower = TOWER
  Z.towerType = 'gtceu:' + TOWER_TYPE
  Z.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  Z.materials = Object.keys(MATERIALS).map(function (name) { return 'gtceu:' + name })
  Z.ids = { zblanPreform: 'grindless:zblan_preform', zirconiumTetrafluoride: 'gtceu:zirconium_tetrafluoride' }
  // glass: items in 7 (ZrF4, barium, lanthanum, aluminium, sodium, quicklime and the circuit), out 2 (preform + fluorite), fluids in 1
  // (hydrogen fluoride), out 2 (hydrogen, water)
  Z.towerIO = { itemsIn: 7, itemsOut: 2, fluidsIn: 1, fluidsOut: 2 }
  Z.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 2 }
  }
  Z.minCasings = 3
  Z.blocks = { casing: CLEAN, truss: TRUSS, gearbox: GEARBOX, heat: HEAT }

  // ---------------------------------------------------------------- pattern
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front

  function cells(min) {
    return Pat.oneOf(
      Pat.block(CLEAN, { min: min }),
      Pat.part('energy_input', Z.parts.energy_input),
      Pat.part('input_bus', Z.parts.input_bus),
      Pat.part('input_hatch', Z.parts.input_hatch),
      Pat.part('output_bus', Z.parts.output_bus),
      Pat.part('output_hatch', Z.parts.output_hatch)
    )
  }

  // 11 rows: the floor, nine tower rows, the truss roof; `over` replaces rows by index
  function towerSlice(fill, over) {
    var rows = ['XXX']
    for (var i = 1; i < 10; i++) rows.push(over[i] || fill)
    rows.push('TTT')
    return rows
  }
  const TOWER_SPEC = {
    slices: [
      towerSlice('RRR', {}),
      towerSlice('R#R', { 1: 'RGR', 8: 'RHR' }),
      towerSlice('RRR', { 1: 'RSR' })
    ],
    symbols: {
      S: Pat.controller(),
      X: cells(Z.minCasings),
      R: Pat.block(CLEAN),
      T: Pat.block(TRUSS),
      G: Pat.block(GEARBOX),
      H: Pat.block(HEAT),
      '#': Pat.air()
    }
  }
  Z.towerSpec = TOWER_SPEC

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var t = Z.towerIO
    event.create(TOWER_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(t.itemsIn, t.itemsOut, t.fluidsIn, t.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_WIREMILL, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(TOWER, TOWER_SPEC)

    event.create('zblan_draw_tower', 'multiblock')
      .langValue('ZBLAN Draw Tower')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TOWER_TYPE)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CLEAN) })
      .pattern(function (def) { return Pat.build(def, TOWER_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.zblan_draw_tower.tooltip.0'),
        Text.translate('grindless.machine.zblan_draw_tower.tooltip.1'),
        Text.translate('grindless.machine.zblan_draw_tower.tooltip.2'),
        Text.translate('grindless.machine.zblan_draw_tower.tooltip.3')
      ])
      .workableCasingModel(CLEAN_TEXTURE, CLEAN_OVERLAY)
  })

  // ---------------------------------------------------------------- items and materials

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
      var m = MATERIALS[name]
      event.create(name)
        .dust()
        .color(m.colour).secondaryColor(m.secondary)
        .formula(m.formula)
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
