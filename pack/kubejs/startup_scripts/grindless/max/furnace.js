// -----------------------------------------------------------------------------------------------
// MAX's cluster-light furnace (docs/eras/max.md, machine 9, lines L13, L14, L25, L36, L37; package MAX-R1): the item nsc_planetesimal.
// F1's id list missed it (max.md:847), so R1 registers it here: the only source is the OpV debris harvester row at the NSC belt
// (server_scripts/grindless/max/furnace.js), nothing by hand. Texture: tools/assets/Build-MaxFurnaceTextures.ps1. Names: client_scripts/
// grindless/max_furnace_lang.js. Published for the recipe script: global.grindless.maxFurnace.
(function () {
  const G = global.grindless || (global.grindless = {})
  const MF = G.maxFurnace || (G.maxFurnace = {})

  MF.items = { nsc_planetesimal: { stack: 64 } }
  MF.ids = { nscPlanetesimal: 'grindless:nsc_planetesimal' }

  var Pat = null // G.patterns, read in the registry callback: its file may load after this one
  const LOG = '[grindless/max] '
  const SHELL = 'grindless:field_frozen_casing'
  const SHELL_TEXTURE = 'grindless:block/opv/field_frozen_casing'

  // items in include the programmed circuit
  MF.machines = [
    {
      name: 'cluster_light_furnace', machine: 'gtceu:cluster_light_furnace', type: 'cluster_light_smelting', dataKey: 'grindless_cluster_light_smelting',
      lang: 'Cluster-Light Furnace', maxIO: { itemsIn: 3, itemsOut: 3, fluidsIn: 0, fluidsOut: 0 }, casing: SHELL, texture: SHELL_TEXTURE,
      width: 13, height: 9, depth: 13,
      pal: { F: SHELL, H: 'grindless:max_optical_table_casing', M: 'grindless:annihilation_shield_casing', C: 'gtceu:superconducting_coil', Q: 'stainless_steel' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
    }
  ]

  // x left to right, y bottom to top, z back to front. Row 0 the floor with the hatches at front and back, rows 1-2 the hearth bowl of
  // mirror segments, rows 3-6 the shielded chamber, row 7 a casing collar, row 8 the roof with the focusing coil over the bowl.
  function furnaceCell(x, y, z) {
    var edgeX = x === 0 || x === 12
    var edgeZ = z === 0 || z === 12
    if (y === 0) return (z === 12 || z === 0) && x >= 4 && x <= 8 ? 'X' : 'F'
    if (y === 8) return x === 6 && z === 6 ? 'C' : 'F'
    if (!edgeX && !edgeZ) {
      var d2 = (x - 6) * (x - 6) + (z - 6) * (z - 6)
      if (y === 1) return d2 <= 25 ? 'H' : 'F'
      if (y === 2) return d2 > 16 && d2 <= 36 ? 'H' : '#'
      return '#'
    }
    if (edgeX && edgeZ) return 'Q'
    if (y <= 2 || y === 7) return 'F'
    return 'M'
  }

  var CELLS = { cluster_light_furnace: furnaceCell }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: CELLS[m.name] })
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
    MF.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat = G.patterns
    MF.machines.forEach(function (m) {
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

  StartupEvents.registry('item', function (event) {
    Object.keys(MF.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(MF.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })
})()
