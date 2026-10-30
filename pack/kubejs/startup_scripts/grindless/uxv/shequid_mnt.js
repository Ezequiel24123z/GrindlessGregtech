// priority: -10881
// -----------------------------------------------------------------------------------------------
// UXV's SHeQUID works and MNT collider (docs/eras/uxv.md, machines 6 and 7, lines 18, 24 and 43; package UXV-A6): the two multiblocks, their
// recipe types and the package's own items. The recipes come from data/grindless/tables/shequid_mnt.json
// (server_scripts/grindless/uxv/shequid_mnt.js).
//
//   gtceu:shequid_works   9 x 11 x 9 octagonal cryostat tower, UXV (two UIV energy hatches). Recipe type gtceu:shequid_assembly
//                         (circuit 1 weak-link cell, 2 SHeQUID gyro).
//   gtceu:mnt_collider    9 x 7 x 23 beamline, UXV. Recipe type gtceu:multinucleon_transfer (circuit 1 collision, 2 gas catcher, 3 MR-TOF,
//                         4 island chart); the gas stopping cell is not consumed.
//
// F1 ids (uxv_sensor, shequid_gyro, gas_stopping_cell, island_nuclide ...) are registered in uxv/foundation.js; only the ids below are new.
// Textures: tools/assets/Build-UXVShequidMntTextures.ps1. Names: client_scripts/grindless/uxv_shequid_mnt_lang.js.
// Published for the recipe script: global.grindless.shequidMnt.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const SM = G.shequidMnt || (G.shequidMnt = {})
  const LOG = '[grindless/uxv] '

  const CRYO = 'grindless:cryostat_casing'
  const CRYO_TEXTURE = 'grindless:block/zpm/cryostat_casing'
  const HPC = 'gtceu:high_power_casing'
  const HPC_TEXTURE = 'gtceu:block/casings/hpca/high_power_casing'

  SM.table = 'kubejs/data/grindless/tables/shequid_mnt.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  SM.items = {
    weak_link_cell: { stack: 16 },
    mnt_thermal_ions: { stack: 16 }
  }

  // items in include the programmed circuit; the collider holds the gas stopping cell (not consumed)
  SM.machines = [
    {
      name: 'shequid_works', machine: 'gtceu:shequid_works', type: 'shequid_assembly', dataKey: 'grindless_shequid_assembly',
      lang: 'SHeQUID Works', maxIO: { itemsIn: 5, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 }, casing: CRYO, texture: CRYO_TEXTURE,
      width: 9, height: 11, depth: 9,
      pal: { F: CRYO, C: 'gtceu:superconducting_coil', P: 'gtceu:titanium_pipe_casing', G: 'gtceu:tungstensteel_gearbox', R: 'gtceu:computer_casing' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('output_hatch', { min: 1, max: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
    },
    {
      name: 'mnt_collider', machine: 'gtceu:mnt_collider', type: 'multinucleon_transfer', dataKey: 'grindless_multinucleon_transfer',
      lang: 'MNT Collider', maxIO: { itemsIn: 5, itemsOut: 2, fluidsIn: 2, fluidsOut: 2 }, casing: HPC, texture: HPC_TEXTURE,
      width: 9, height: 7, depth: 23,
      pal: { F: HPC, C: 'gtceu:superconducting_coil', P: 'gtceu:tungstensteel_pipe_casing', K: CRYO, R: 'gtceu:computer_casing', Q: 'naquadah_alloy' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { min: 1, max: 2 }),
          Pat.part('output_hatch', { min: 1, max: 2 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
    }
  ]

  function abs(n) { return n < 0 ? -n : n }
  // an octagon: inside the square of half-width r and the diamond of radius s
  function oct(dx, dz, r, s) { return abs(dx) <= r && abs(dz) <= r && abs(dx) + abs(dz) <= s }

  // x left to right, y bottom to top, z back to front. A cryostat tower on a turntable: shield rings every second course, the fill line up
  // the back, the readout rack beside the controller and a necked roof.
  function towerCell(x, y, z) {
    var dx = x - 4
    var dz = z - 4
    if (!oct(dx, dz, 4, 6)) return ' '
    var wall = !oct(dx, dz, 3, 5)
    if (y === 0) {
      if (!wall) return oct(dx, dz, 1, 2) ? 'G' : 'F'
      return dz === 4 || dz === -4 ? (abs(dx) <= 2 ? 'X' : 'F') : 'F'
    }
    if (y === 10) {
      if (oct(dx, dz, 1, 1)) return 'P'
      return oct(dx, dz, 2, 3) ? 'F' : ' '
    }
    if (y === 9 && !wall && !oct(dx, dz, 2, 3)) return 'F'
    if (!wall) return '#'
    if (dz === -4 && dx === 0) return 'P'
    if (dz === 4 && abs(dx) <= 2 && y <= 3) return 'R'
    if (y === 3 || y === 5 || y === 7) return 'C'
    if (y === 2 || y === 4 || y === 8) return 'R'
    return 'F'
  }

  // a beamline from the injector (z 0) to the MR-TOF readout at the front: the beam pipe runs through the bore, quadrupole rings every four
  // slices, the gas catcher in cryostat casing round the middle and the spectrometer racks on the last slices
  function beamCell(x, y, z) {
    var edgeX = x === 0 || x === 8
    var edgeY = y === 0 || y === 6
    if (!edgeX && !edgeY) {
      if (z === 0 || z === 22) return 'F'
      return x === 4 && y === 3 && z >= 2 && z <= 17 ? 'P' : '#'
    }
    if (edgeX && edgeY) return 'Q'
    if (y === 0 && x >= 2 && x <= 6 && (z <= 1 || z >= 21)) return 'X'
    if (z % 4 === 1 && ((x === 4 && y === 6) || (edgeX && y === 3) || (x === 4 && y === 0))) return 'C'
    if (z % 4 === 3 && ((x === 4 && y === 6) || (edgeX && y === 3) || (x === 4 && y === 0))) return 'P'
    if (edgeY && z % 4 === 0 && z > 0 && z < 22) return 'R'
    if (z >= 7 && z <= 10) return 'K'
    if (z >= 15 && z <= 19 && edgeX && y >= 2 && y <= 4) return 'R'
    return 'F'
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(),
      fn: m.name === 'shequid_works' ? towerCell : beamCell
    })
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
    Object.keys(SM.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(SM.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    SM.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SM.machines.forEach(function (m) {
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
