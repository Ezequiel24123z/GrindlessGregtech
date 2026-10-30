// priority: -10925
// -----------------------------------------------------------------------------------------------
// UXV's logic machines (docs/eras/uxv.md, machines 3, 4 and 5, lines 8, 12, 15 and 42; package UXV-A5): the vdW stacking cell, the
// racetrack fab and the YIG LPE furnace, their recipe types, and the package's own items. The recipes come from
// data/grindless/tables/spin_logic.json (server_scripts/grindless/uxv/spin_logic.js).
//
//   gtceu:vdw_stacking_cell   11 x 6 x 9 L-shaped glovebox, UXV (two UIV energy hatches). Recipe type gtceu:vdw_stacking
//                             (circuit 1 WTe2 flakes, 2 FGT flakes, 3 hBN flakes, 4 the SOT heterostack).
//   gtceu:racetrack_fab       13 x 7 x 9 lithography bay with an e-beam column and a wafer track, UXV. Recipe type gtceu:racetrack_patterning
//                             (circuit 1 patterned track wafer, 2 racetrack chip).
//   gtceu:yig_lpe_furnace     7 x 13 x 7 stepped tower with three coil bands and a dip head, UXV. Recipe type gtceu:liquid_phase_epitaxy
//                             (circuit 1 lead-borate flux, 2 YIG film wafer with the platinum crucible kept, 3 flux skim).
//
// F1 ids (sot_heterostack, racetrack_chip, magnonic_bus, pt_lpe_crucible, lpe_dross, lpe_flux ...) are registered in uxv/foundation.js;
// only the ids below are new. Textures: tools/assets/Build-UXVSpinLogicTextures.ps1. Names: client_scripts/grindless/uxv_spin_logic_lang.js.
// Published for the recipe script: global.grindless.spinLogic.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const SL = G.spinLogic || (G.spinLogic = {})
  const LOG = '[grindless/uxv] '

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const PLASCRETE = 'gtceu:plascrete'
  const PLASCRETE_TEXTURE = 'gtceu:block/casings/cleanroom/plascrete'
  const ROBUST = 'gtceu:robust_machine_casing'
  const ROBUST_TEXTURE = 'gtceu:block/casings/solid/machine_casing_robust_tungstensteel'

  SL.table = 'kubejs/data/grindless/tables/spin_logic.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  SL.items = {
    wte2_flake: { stack: 16 },
    fgt_flake: { stack: 16 },
    hbn_flake: { stack: 16 },
    patterned_track_wafer: { stack: 16 },
    pt_crucible_shell: { stack: 16 }
  }

  function basicParts(buses, hatches) {
    return function () {
      return [
        Pat.part('input_bus', { min: 1, max: buses }),
        Pat.part('output_bus', { min: 1, max: buses }),
        Pat.part('input_hatch', { min: 1, max: hatches }),
        Pat.part('output_hatch', { min: 0, max: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        G.parallelHatch.part()
      ]
    }
  }

  // items in include the programmed circuit and the kept crucible
  SL.machines = [
    {
      name: 'vdw_stacking_cell', machine: 'gtceu:vdw_stacking_cell', type: 'vdw_stacking', dataKey: 'grindless_vdw_stacking',
      lang: 'vdW Stacking Cell', maxIO: { itemsIn: 4, itemsOut: 3, fluidsIn: 1, fluidsOut: 0 },
      width: 11, height: 6, depth: 9, casing: CLEAN, texture: CLEAN_TEXTURE,
      pal: { F: CLEAN, L: 'gtceu:cleanroom_glass', P: 'gtceu:titanium_pipe_casing', N: 'gtceu:filter_casing', R: 'gtceu:computer_casing', Q: 'stainless_steel' },
      parts: basicParts(2, 1)
    },
    {
      name: 'racetrack_fab', machine: 'gtceu:racetrack_fab', type: 'racetrack_patterning', dataKey: 'grindless_racetrack_patterning',
      lang: 'Racetrack Fab', maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 },
      width: 13, height: 7, depth: 9, casing: PLASCRETE, texture: PLASCRETE_TEXTURE,
      pal: { F: PLASCRETE, L: 'gtceu:cleanroom_glass', N: 'gtceu:filter_casing', C: 'gtceu:superconducting_coil', Q: 'stainless_steel' },
      parts: basicParts(2, 1)
    },
    {
      name: 'yig_lpe_furnace', machine: 'gtceu:yig_lpe_furnace', type: 'liquid_phase_epitaxy', dataKey: 'grindless_liquid_phase_epitaxy',
      lang: 'YIG LPE Furnace', maxIO: { itemsIn: 5, itemsOut: 3, fluidsIn: 1, fluidsOut: 1 },
      width: 7, height: 13, depth: 7, casing: ROBUST, texture: ROBUST_TEXTURE,
      pal: { F: ROBUST, L: 'gtceu:laminated_glass', C: 'gtceu:tritanium_coil_block', G: 'gtceu:tungstensteel_gearbox', Q: 'tungsten_steel' },
      parts: basicParts(2, 2)
    }
  ]

  function abs(n) { return n < 0 ? -n : n }

  // x left to right, y bottom to top, z back to front. An L-shaped glovebox: the back right quarter (x >= 6, z <= 3) is cut away.
  function stackingCell(x, y, z) {
    if (x >= 6 && z <= 3) return ' '
    var wall = x === 0 || z === 8 || x === 10 || (z === 0 && x <= 5) || (x === 5 && z <= 4) || (z === 4 && x >= 5)
    var corner = (x === 0 && (z === 0 || z === 8)) || (x === 5 && (z === 0 || z === 4)) || (x === 10 && (z === 4 || z === 8))
    if (y === 0) return wall && x !== 0 && x !== 10 && (z === 8 || z === 0) ? 'X' : 'F'
    if (y === 5) {
      if (wall) return 'F'
      return x % 2 === 0 && z % 2 === 0 ? 'R' : 'N'
    }
    if (!wall) return '#'
    if (corner) return 'Q'
    if (z === 8) {
      if (y === 1) return x % 2 === 0 ? 'P' : 'L'
      if (y === 2) return 'L'
      if (y === 3) return x % 2 === 0 ? 'P' : 'N'
      return x % 2 === 0 ? 'F' : 'N'
    }
    if (x === 10 && z >= 5 && z <= 7 && y >= 1 && y <= 4) return y % 2 === 0 ? 'N' : 'L'
    if (x === 0 && z >= 1 && z <= 7 && y >= 1 && y <= 4) return y % 2 === 0 ? 'L' : 'N'
    if (z === 0 && x >= 1 && x <= 4 && y >= 2 && y <= 3) return 'L'
    if ((x === 5 || z === 4) && y >= 2 && y <= 3) return 'N'
    return 'F'
  }

  // a long bay: windows on every wall, a filter ceiling, an e-beam column at the back and a wafer track on a frame along the middle
  function racetrackBay(x, y, z) {
    var wall = x === 0 || x === 12 || z === 0 || z === 8
    var corner = (x === 0 || x === 12) && (z === 0 || z === 8)
    if (y === 0) return wall && !corner && (z === 8 || z === 0) && x !== 0 && x !== 12 ? 'X' : 'F'
    if (y === 6) return wall ? 'F' : 'N'
    if (wall) {
      if (corner) return 'Q'
      if (y >= 2 && y <= 4) {
        if ((z === 0 || z === 8) && x % 4 === 2) return 'L'
        if ((x === 0 || x === 12) && z >= 2 && z <= 6) return 'L'
      }
      if (y === 1 && !((z === 0 || z === 8) && x % 4 === 0)) return x % 2 === 0 ? 'N' : 'F'
      return 'F'
    }
    if (x === 6 && z === 2 && y <= 5) return 'C'
    if ((x === 3 || x === 9) && z === 2 && y >= 3 && y <= 5) return 'C'
    if (z === 5 && y === 1 && x >= 2 && x <= 10) return 'Q'
    return '#'
  }

  // a tower in three steps (7, 5 and 3 wide); a coil band on each step, a viewport in each wall, the dip head on top
  function lpeTower(x, y, z) {
    var dx = abs(x - 3)
    var dz = abs(z - 3)
    var r = dx > dz ? dx : dz
    if (y <= 3) {
      if (r > 3) return ' '
      if (y === 0) return (z === 0 || z === 6) && x !== 0 && x !== 6 ? 'X' : 'F'
      if (y === 3) return r === 3 ? 'C' : (r === 0 ? '#' : 'F')
      if (r < 3) return '#'
      if (dx === 3 && dz === 3) return 'Q'
      if (y === 2 && dz <= 1 && dx === 3) return 'L'
      return 'F'
    }
    if (y <= 8) {
      if (r > 2) return ' '
      if (y === 8) return r === 2 ? 'C' : (r === 0 ? '#' : 'F')
      if (r < 2) return '#'
      if (dx === 2 && dz === 2) return 'Q'
      if ((y === 5 || y === 6) && ((dx === 2 && dz <= 1) || (dz === 2 && dx <= 1))) return 'L'
      return 'F'
    }
    if (y <= 11) {
      if (r > 1) return ' '
      if (r === 0) return '#'
      if (dx === 1 && dz === 1) return 'Q'
      if (y === 10) return 'G'
      return 'F'
    }
    return r <= 1 ? 'G' : ' '
  }

  var CELLS = { vdw_stacking_cell: stackingCell, racetrack_fab: racetrackBay, yig_lpe_furnace: lpeTower }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: CELLS[m.name] })
  }

  // one EMI line per recipe, read from its data
  function infoOf(dataKey) {
    return function (data) {
      try {
        var name = String(data.getString(dataKey))
        if (name === '') return ''
        return String(Text.translate('gtceu.recipe.' + dataKey + '.' + name).getString())
      } catch (e) {
        return ''
      }
    }
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(SL.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(SL.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    SL.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SL.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
