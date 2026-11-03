// priority: -10881
// -----------------------------------------------------------------------------------------------
// UXV's SHeQUID works and MNT collider (docs/eras/uxv.md, machines 6 and 7, lines 18, 24 and 43; package UXV-A6): the two multiblocks, their
// recipe types and the package's own items. The recipes come from data/grindless/tables/shequid_mnt.json
// (server_scripts/grindless/uxv/shequid_mnt.js).
//
//   gtceu:shequid_works   15 x 19 x 15 He-II cryostat in a nested room, UXV (two UIV energy hatches). Recipe type gtceu:shequid_assembly
//                         (circuit 1 weak-link cell, 2 SHeQUID gyro).
//   gtceu:mnt_collider    15 x 13 x 91 beamline, UXV. Recipe type gtceu:multinucleon_transfer (circuit 1 collision, 2 gas catcher, 3 MR-TOF,
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
  // UXV family (uxv/casings.js): the collider makes no product its casings need
  const GUM = 'grindless:gum_metal_casing'
  const GUM_TEXTURE = 'grindless:block/uxv/gum_metal_casing'
  const PULSED = 'grindless:pulsed_field_casing'

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
      // BOOTSTRAP MACHINE (D4-SHAPE-UXV-A): it makes the SHeQUID gyro, which is an ancestor of the UXV sensor that the mu-metal shield casing takes, so
      // its body stays the ZPM cryostat casing with the UEV SiC composite for the inner shield room; no UXV family casing.
      width: 15, height: 19, depth: 15,
      pal: { F: CRYO, R: 'grindless:sic_composite_casing', A: 'gtceu:stable_machine_casing', C: 'gtceu:superconducting_coil', L: 'gtceu:laminated_glass',
        P: 'gtceu:titanium_pipe_casing', G: 'gtceu:tungstensteel_gearbox' },
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
      lang: 'MNT Collider', maxIO: { itemsIn: 5, itemsOut: 2, fluidsIn: 2, fluidsOut: 2 }, casing: GUM, texture: GUM_TEXTURE,
      width: 15, height: 13, depth: 91,
      pal: { F: GUM, M: PULSED, C: 'gtceu:superconducting_coil', L: 'gtceu:fusion_glass', P: 'gtceu:tungstensteel_pipe_casing', A: 'gtceu:stable_machine_casing', Q: 'naquadah_alloy' },
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

  // A He-II cryostat in a nested room on an isolation pier (15 x 19 x 15): four-legged pier slab, a cryostat-casing outer room with sight
  // windows, an inner shield room of SiC composite, the vessel at the centre with its fill column up through the roof to a gearbox turntable
  // and a capped neck, eight superconducting coils round the vessel and two transfer lines out through the walls.
  function cryostatRoom() {
    var s = G.uevShapes.scene(15, 19, 15)
    s.room(0, 0, 0, 14, 0, 14, 'A', 'bt').box(7, 0, 0, 7, 0, 14, 'A').box(0, 0, 7, 14, 0, 7, 'A')
    ;[[3, 3], [11, 3], [3, 11], [11, 11], [7, 7]].forEach(function (p) { s.box(p[0] - 1, 1, p[1] - 1, p[0] + 1, 2, p[1] + 1, 'A') })
    s.room(0, 3, 0, 14, 3, 14, 'F', 'bt')
    s.room(0, 4, 0, 14, 11, 14, 'F', 'bt')
    ;[4, 10].forEach(function (p) {
      s.box(p, 7, 0, p + 0, 8, 0, 'L').box(p + 1, 7, 0, p + 1, 8, 0, 'L')
      s.box(p, 7, 14, p + 1, 8, 14, 'L').box(0, 7, p, 0, 8, p + 1, 'L').box(14, 7, p, 14, 8, p + 1, 'L')
    })
    s.room(0, 12, 0, 14, 12, 14, 'A', 'bt').box(7, 12, 0, 7, 12, 14, 'A').box(0, 12, 7, 14, 12, 7, 'A')
    s.room(3, 5, 3, 11, 10, 11, 'R', 'bt').box(3, 4, 3, 11, 4, 11, 'R').room(3, 11, 3, 11, 11, 11, 'R', 'bt')
    s.cyl('y', 7, 7, 2, 5, 10, 'F', true)
    s.cyl('y', 7, 7, 2, 11, 17, 'F', true)
    s.cyl('y', 7, 7, 2, 18, 18, 'F')
    s.box(7, 5, 7, 7, 17, 7, 'P').box(6, 12, 6, 8, 12, 8, 'G')
    s.box(0, 8, 7, 4, 8, 7, 'P').box(10, 8, 7, 14, 8, 7, 'P')
    ;[[3, 0], [-3, 0], [0, 3], [0, -3], [2, 2], [-2, 2], [2, -2], [-2, -2]].forEach(function (d) { s.set(7 + d[0], 8, 7 + d[1], 'C') })
    return s.booth('F', 3).fn()
  }

  // The collider (15 x 13 x 91) from the injector (z 0) to the MR-TOF readout at the front: a gum-metal linac tube with pulsed-field rings
  // every fourth slice and superconducting coil rings every twelfth, the target hall (a gum room with sight windows round the target), the
  // gas-stopping cell (a pulsed-field cylinder with a glass viewing band) and the MR-TOF racetrack loop, with the control booth at the front.
  function colliderBeam() {
    var s = G.uevShapes.scene(15, 13, 91)
    s.box(6, 0, 0, 8, 0, 48, 'F')
    s.cyl('z', 7, 6, 3, 1, 48, 'F', true)
    for (var z = 3; z <= 47; z += 4) s.cyl('z', 7, 6, 4, z, z, 'M', true, null)
    for (var k = 6; k <= 42; k += 12) s.cyl('z', 7, 6, 3, k, k, 'C', true)
    ;[8, 24, 40].forEach(function (z) { s.box(3, 0, z, 11, 0, z, 'A').box(3, 1, z, 3, 3, z, 'Q').box(11, 1, z, 11, 3, z, 'Q') })
    s.room(0, 0, 49, 14, 12, 65, 'F', 'f')
    s.room(0, 0, 49, 14, 12, 49, 'F')
    s.cyl('z', 7, 6, 3, 49, 49, '#')
    ;[53, 59].forEach(function (z) { s.box(0, 5, z, 0, 7, z + 2, 'L').box(14, 5, z, 14, 7, z + 2, 'L') })
    s.cyl('z', 7, 6, 2, 50, 64, 'P', true)
    s.box(5, 12, 55, 9, 12, 59, 'A')
    s.cyl('z', 7, 6, 4, 66, 75, 'M', true)
    s.cyl('z', 7, 6, 4, 70, 71, 'L', true)
    s.cyl('z', 7, 6, 4, 66, 66, 'A').cyl('z', 7, 6, 4, 75, 75, 'A')
    s.cyl('z', 7, 6, 1, 66, 75, 'P')
    s.cyl('z', 7, 6, 2, 76, 77, 'P', true)
    s.room(1, 3, 78, 13, 8, 89, 'M', 'bt')
    s.room(3, 3, 80, 11, 8, 87, 'M', 'bt', ' ')
    s.box(2, 4, 79, 12, 7, 79, 'F').box(2, 4, 88, 12, 7, 88, 'F')
    s.box(1, 4, 79, 1, 7, 88, 'L').box(13, 4, 79, 13, 7, 88, 'L')
    s.box(3, 0, 78, 11, 0, 89, 'F')
    s.box(2, 1, 78, 2, 2, 78, 'Q').box(12, 1, 78, 12, 2, 78, 'Q').box(2, 1, 89, 2, 2, 89, 'Q').box(12, 1, 89, 12, 2, 89, 'Q')
    return s.booth('F', 3).fn()
  }

  // built in the machine registry callback: uiv/shapes.js and uev/shapes.js may load after this file
  function spec(m) {
    if (m.name === 'shequid_works') {
      return G.uevShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: cryostatRoom() })
    }
    return G.uevShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: colliderBeam() })
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
