// priority: -5579
// MAX+ machines 12 and 13, the multi-plasma blender and the horizon crystal furnace (docs/eras/maxplus.md "Machines" 12 and 13; package XP-H2): the
// multiblocks and their recipe types. Items, fluids and the casing are XP-F1's (maxplus/foundation.js); the recipes, with lines T8, T9 and T10's
// older-machine rows, are in server_scripts/grindless/maxplus/crystals.js. Names: client_scripts/grindless/maxplus_crystals_lang.js.
//
//   gtceu:multi_plasma_blender    11 x 11 x 11 hall of horizon machine casing around a coil column; eight fluid hatches feed one vortex.
//                                 Recipe type gtceu:multi_plasma_blender: c1 eight plasmas become the horizon crystal slurry.
//   gtceu:horizon_crystal_furnace 15 x 17 x 15 casing keep with four coil pillars and a core column; recipe type gtceu:horizon_crystal_furnace:
//                                 c1 core crystal boule, c2 controller crystal boule.
//
// Both run only at Sgr A* orbit (rows carry the dimension) on a 1,024 A MAX+ energy hatch. Rows run as written: the modifier is IDENTITY.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MC = G.maxPlusCrystals || (G.maxPlusCrystals = {})
  const LOG = '[grindless/maxplus] '

  const CASING = 'grindless:horizon_machine_casing'
  const PAL = { F: CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil' }

  function blenderParts() {
    return [
      Pat.part('input_hatch', { min: 8, max: 12 }),
      Pat.part('output_hatch', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ]
  }

  function furnaceParts() {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ]
  }

  MC.machines = {
    blender: {
      name: 'multi_plasma_blender', machine: 'gtceu:multi_plasma_blender', type: 'multi_plasma_blender', dataKey: 'grindless_multi_plasma_blender',
      lang: 'Multi-Plasma Blender', maxIO: { itemsIn: 0, itemsOut: 0, fluidsIn: 8, fluidsOut: 1 }, casing: CASING,
      texture: 'grindless:block/max/mirror_shell_segment', overlay: 'grindless:block/multiblock/positronium_condensate_lab',
      width: 11, height: 11, depth: 11, pal: PAL, parts: blenderParts
    },
    furnace: {
      name: 'horizon_crystal_furnace', machine: 'gtceu:horizon_crystal_furnace', type: 'horizon_crystal_furnace', dataKey: 'grindless_horizon_crystal_furnace',
      lang: 'Horizon Crystal Furnace', maxIO: { itemsIn: 5, itemsOut: 1, fluidsIn: 2, fluidsOut: 0 }, casing: CASING,
      texture: 'grindless:block/max/mirror_shell_segment', overlay: 'grindless:block/multiblock/positronium_condensate_lab',
      width: 15, height: 17, depth: 15, pal: PAL, parts: furnaceParts
    }
  }

  // x left to right, y bottom to top, z back to front. The floor carries the part cells at the front edge; the walls a glass band every
  // four layers; the axis holds a coil column (atomic casing at the foot and head).
  function blenderCell(x, y, z) {
    if (y === 0) return z <= 1 && x >= 1 && x <= 9 ? 'X' : 'B'
    if (y === 10) return 'B'
    if (x === 0 || x === 10 || z === 0 || z === 10) {
      var along = x === 0 || x === 10 ? z : x
      return y % 4 >= 1 && y % 4 <= 2 && along >= 3 && along <= 7 ? 'L' : 'F'
    }
    if (x === 5 && z === 5) return y <= 1 || y >= 9 ? 'A' : 'C'
    return '#'
  }

  function furnaceCell(x, y, z) {
    if (y === 0) return z === 0 && x >= 5 && x <= 9 ? 'X' : 'B'
    if (y === 16) return 'B'
    if (x === 0 || x === 14 || z === 0 || z === 14) {
      var along = x === 0 || x === 14 ? z : x
      return y % 6 >= 2 && y % 6 <= 4 && along >= 4 && along <= 10 ? 'L' : 'F'
    }
    var pillar = (x === 4 || x === 10) && (z === 4 || z === 10)
    if ((x === 7 && z === 7) || pillar) return y <= 2 || y >= 14 ? 'A' : 'C'
    return '#'
  }

  function spec(m, fn) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: fn })
  }

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

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    ;[MC.machines.blender, MC.machines.furnace].forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.ARC)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    ;[[MC.machines.blender, blenderCell], [MC.machines.furnace, furnaceCell]].forEach(function (pair) {
      var m = pair[0]
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m, pair[1])
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(function (machine, recipe) { return ModifierFunction.IDENTITY }, true)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type))
        ])
        .workableCasingModel(m.texture, m.overlay)
    })
  })
})()
