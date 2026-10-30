// -----------------------------------------------------------------------------------------------
// OpV's tetron fab (docs/eras/opv.md, machine 1, line 19; package OpV-B1): the multiblock, its recipe type and the package's own items.
// The recipes come from data/grindless/tables/tetron_optics.json (server_scripts/grindless/opv/tetron_optics.js).
//
//   gtceu:tetron_fab   9 x 7 x 11 cleanroom bay, OpV (two UXV energy hatches). Recipe type gtceu:tetron_assembly (circuit 1 tetron dies,
//                      2 tetron array). Between the two the dies are In-bumped (UXV MTJ c9), flip-chip bonded (UIV ion slicing c8) and
//                      parity-tested (UIV millikelvin c6); a die that fails the array's calibration goes to the EV extraction cascade (c25).
//
// F1 ids (tetron_die, tetron_array, gated_2deg_wafer, cryo_cmos_die ...) are registered in opv/foundation.js; only the ids below are new.
// Textures: tools/assets/Build-OpVTetronOpticsTextures.ps1. Names: client_scripts/grindless/opv_tetron_optics_lang.js.
// Published for the recipe script: global.grindless.tetronOptics.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const TO = G.tetronOptics || (G.tetronOptics = {})
  const LOG = '[grindless/opv] '

  const PLASCRETE = 'gtceu:plascrete'
  const PLASCRETE_TEXTURE = 'gtceu:block/casings/cleanroom/plascrete'

  TO.table = 'kubejs/data/grindless/tables/tetron_optics.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  TO.items = {
    bumped_tetron_die: { stack: 64 },
    bonded_tetron_die: { stack: 64 },
    tested_tetron_die: { stack: 64 },
    failed_tetron_die: { stack: 64 }
  }

  // items in include the programmed circuit; the superfluid He-3 bath of c2 is a charge (not consumed)
  TO.machines = [
    {
      name: 'tetron_fab', machine: 'gtceu:tetron_fab', type: 'tetron_assembly', dataKey: 'grindless_tetron_assembly',
      lang: 'Tetron Fab', maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 }, casing: PLASCRETE, texture: PLASCRETE_TEXTURE,
      width: 9, height: 7, depth: 11,
      pal: { F: PLASCRETE, L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil', P: 'gtceu:tungstensteel_pipe_casing', Q: 'stainless_steel' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
    }
  ]

  function abs(n) { return n < 0 ? -n : n }

  // x left to right, y bottom to top, z back to front. A cleanroom bay: plascrete shell with a cleanroom-glass band, stainless frame
  // posts in the corners, the dilution-fridge mast in the middle (pipe column in a superconducting ring), the wafer handlers on both
  // sides, the helium run from the mast to the back wall under a pipe cross in the roof, the energy row in the back wall and the
  // load lock (buses in its floor) at the front.
  function bayCell(x, y, z) {
    var edgeX = x === 0 || x === 8
    var edgeZ = z === 0 || z === 10
    var dx = x - 4
    var dz = z - 5
    if (y === 0) return z === 10 && x >= 2 && x <= 6 ? 'X' : 'F'
    if (y === 6) return x === 4 || z === 5 ? 'P' : 'F'
    if (edgeX && edgeZ) return 'Q'
    if (edgeX || edgeZ) {
      if (z === 0 && y === 1 && x >= 2 && x <= 6) return 'X'
      return y === 1 || y === 5 ? 'F' : 'L'
    }
    if (dx === 0 && dz === 0) return 'P'
    if (abs(dx) <= 1 && abs(dz) <= 1) {
      if (y === 3) return 'C'
      if ((y === 2 || y === 4) && (dx === 0 || dz === 0)) return 'C'
      return '#'
    }
    if ((x === 2 || x === 6) && z >= 3 && z <= 7 && y === 1) return 'Q'
    if ((x === 2 || x === 6) && (z === 3 || z === 7) && y === 2) return 'Q'
    if (x === 4 && y === 5 && z >= 1 && z <= 3) return 'P'
    if (z === 9 && (x === 3 || x === 5) && y <= 2) return 'L'
    if (z === 9 && x >= 3 && x <= 5 && y === 3) return 'F'
    return '#'
  }

  var CELLS = { tetron_fab: bayCell }

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
    Object.keys(TO.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(TO.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    TO.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    TO.machines.forEach(function (m) {
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
