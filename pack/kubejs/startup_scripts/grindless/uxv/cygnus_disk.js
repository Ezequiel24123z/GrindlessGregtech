// priority: -10766
// -----------------------------------------------------------------------------------------------
// UXV's Cygnus X-1 disk (docs/eras/uxv.md, machines 13-15, lines 30 and 31; package UXV-B3): the accretion disk skimmer, the FRC former and
// the BZ dynamo, their recipe types and one item (the strand coil). The recipes come from data/grindless/tables/cygnus_disk.json
// (server_scripts/grindless/uxv/cygnus_disk.js). Every other id is F1's (uxv/foundation.js).
//
//   gtceu:accretion_disk_skimmer   15 x 7 x 15 scoop dish, UXV. Recipe type gtceu:disk_skimming (circuit 1 skim); locked to the Cygnus X-1 orbit.
//   gtceu:frc_former               7 x 7 x 21 linear theta-pinch, UXV. Recipe type gtceu:frc_forming (circuit 1 cartridge, locked to the orbit;
//                                  2 flux loading).
//   gtceu:bz_dynamo                19 x 7 x 19 torus round a jet column, UXV. Recipe type gtceu:blandford_znajek, a GENERATOR written at its
//                                  final figure (2^30 EU/t through two UIV 16 A dynamo hatches), one run at a time, locked to the orbit. It is
//                                  not in power/generators.js.
//   grindless:strand_coil          the cartridge held in strand tape (ZPM magnet works c9, B3's older row); only the field generator uses it.
//
// Geometry (lib/patterns.js: a slice has at most 16 rows): the former is 21 long, so it lies on its side with the long axis as depth: the
// formation end at the back, the capture chamber and every output at the front. Orbit has no up.
// Textures: tools/assets/Build-UXVCygnusDiskTextures.ps1. Names: client_scripts/grindless/uxv_cygnus_disk_lang.js.
// Published for the recipe script: global.grindless.cygnusDisk.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const CD = G.cygnusDisk || (G.cygnusDisk = {})
  const LOG = '[grindless/uxv] '

  const UXV_CASING = 'gtceu:uxv_machine_casing'
  const UXV_TEXTURE = 'gtceu:block/casings/voltage/uxv/side'
  const HPC = 'gtceu:high_power_casing'
  const HPC_TEXTURE = 'gtceu:block/casings/hpca/high_power_casing'

  CD.table = 'kubejs/data/grindless/tables/cygnus_disk.json'
  CD.site = 'grindless:cygnus_x1_orbit'
  CD.items = { strand_coil: { stack: 16 } }

  // items in include the programmed circuit
  CD.machines = [
    {
      name: 'accretion_disk_skimmer', machine: 'gtceu:accretion_disk_skimmer', type: 'disk_skimming', dataKey: 'grindless_disk_skimming',
      lang: 'Accretion Disk Skimmer', maxIO: { itemsIn: 2, itemsOut: 0, fluidsIn: 0, fluidsOut: 1 }, casing: UXV_CASING, texture: UXV_TEXTURE,
      generator: false, width: 15, height: 7, depth: 15,
      pal: { F: UXV_CASING, C: 'gtceu:superconducting_coil', L: 'gtceu:fusion_glass', P: 'gtceu:tungstensteel_pipe_casing', Q: 'naquadah_alloy' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 1 }),
          Pat.part('output_hatch', { min: 1, max: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
    },
    {
      name: 'frc_former', machine: 'gtceu:frc_former', type: 'frc_forming', dataKey: 'grindless_frc_forming',
      lang: 'FRC Former', maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 2 }, casing: HPC, texture: HPC_TEXTURE,
      generator: false, width: 7, height: 7, depth: 21,
      pal: { F: HPC, C: 'gtceu:superconducting_coil', L: 'gtceu:fusion_glass', K: 'grindless:cryostat_casing', U: 'gtceu:uiv_machine_casing', Q: 'naquadah_alloy' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 1 }),
          Pat.part('output_bus', { min: 1, max: 1 }),
          Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('output_hatch', { min: 1, max: 2 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
    },
    {
      // written final: two UIV 16 A dynamo hatches (2^29 each) hold the dynamo's 2^30 EU/t
      name: 'bz_dynamo', machine: 'gtceu:bz_dynamo', type: 'blandford_znajek', dataKey: 'grindless_blandford_znajek',
      lang: 'BZ Dynamo', maxIO: { itemsIn: 1, itemsOut: 0, fluidsIn: 1, fluidsOut: 1 }, casing: UXV_CASING, texture: UXV_TEXTURE,
      generator: true, width: 19, height: 7, depth: 19,
      pal: { F: UXV_CASING, C: 'gtceu:superconducting_coil', L: 'gtceu:fusion_glass', P: 'gtceu:titanium_pipe_casing', Q: 'naquadah_alloy' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 1 }),
          Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('output_hatch', { min: 0, max: 1 }),
          Pat.part('energy_output', { min: 1, max: 2 })
        ]
      }
    }
  ]

  function abs(n) { return n < 0 ? -n : n }
  // inside the ellipse of half-axes (rx + 0.5, ry + 0.5)
  function ell(dx, dy, rx, ry) {
    if (rx < 0 || ry < 0) return false
    var a = rx + 0.5
    var b = ry + 0.5
    return dx * dx * b * b + dy * dy * a * a <= a * a * b * b
  }

  // x left to right, y bottom to top, z back (0) to front (14). The bowl faces the disk at the back: a coil rim of two rings round the open
  // mouth, the dish narrowing in x to a glass throat (z 11), a plasma chamber behind it and the front wall with the controller. Spokes of pipe
  // run on the four axes from the rim to the throat and frame rings brace the bowl. Winding bus and energy on the mouth's floor row, the
  // plasma output behind the throat.
  function skimmerCell(x, y, z) {
    var dx = x - 7
    var dy = y - 3
    var rx = z <= 11 ? 7 - Math.floor(z * 5 / 11) : 3
    if (!ell(dx, dy, rx, 3)) return ' '
    var inner = ell(dx, dy, rx - 1, 2)
    if (z === 14) return y === 0 && abs(dx) <= 2 ? 'X' : (abs(dx) === 3 || abs(dy) === 3 ? 'F' : (abs(dx) + abs(dy) === 4 ? 'Q' : 'F'))
    if (z === 11) return abs(dx) <= 1 && abs(dy) <= 1 ? 'L' : (inner ? 'L' : 'F')
    if (inner) return '#'
    if (z <= 1) return z === 0 && y === 0 && abs(dx) <= 2 ? 'X' : 'C'
    if (z >= 12) return y === 0 && abs(dx) <= 1 ? 'X' : 'F'
    if (z % 3 === 0) return 'Q'
    if (dx === 0 || dy === 0) return 'P'
    return 'F'
  }

  // a linear theta-pinch on its side: the back cap with the plasma input on the axis, the formation tube (r 1 air, r 2 glass, r 3 casing with a
  // coil ring every second layer), the capacitor bank (uiv casing, energy ports) and the capture chamber (cryostat casing) at the front
  function oct(dx, dy, r) { return abs(dx) <= r && abs(dy) <= r && abs(dx) + abs(dy) <= r + 1 }
  function formerCell(x, y, z) {
    var dx = x - 3
    var dy = y - 3
    if (!oct(dx, dy, 3)) return ' '
    if (z === 0) return dx === 0 && dy === 0 ? 'X' : 'F'
    if (z === 20) return y === 0 && abs(dx) <= 1 ? 'X' : (abs(dx) === 3 || abs(dy) === 3 ? 'K' : 'F')
    var ring = !oct(dx, dy, 2)
    if (z <= 11) {
      if (!ring) return oct(dx, dy, 1) ? '#' : 'L'
      return z % 2 === 0 ? 'C' : 'F'
    }
    if (z <= 14) {
      if (!ring) return oct(dx, dy, 1) ? '#' : 'L'
      return abs(dy) === 0 && abs(dx) === 3 && z === 13 ? 'X' : (z === 13 ? 'U' : 'Q')
    }
    if (!ring) return '#'
    return y === 0 && abs(dx) <= 1 && z >= 17 ? 'X' : 'K'
  }

  // a torus on its side round a jet column of glass: the tube (major radius 6, minor 3) is a casing skin round a flux loop of coils, with
  // air between; four pipe spokes feed the jet from the torus; the plasma input sits on the front spoke and the dynamo hatches on the outer rim
  // at the equator
  function bzCell(x, y, z) {
    var dx = x - 9
    var dz = z - 9
    var dy = y - 3
    var rr = Math.sqrt(dx * dx + dz * dz)
    if (rr <= 1.5) return 'L'
    if (rr > 1.5 && rr < 2.5 && y === 3 && (dx === 0 || dz === 0)) return 'P'
    var d2 = (rr - 6) * (rr - 6) + dy * dy
    if (d2 > 9.5) return ' '
    if (d2 <= 1.01) return 'C'
    if (d2 < 5) return '#'
    if (y === 3 && (dx === 0 || dz === 0)) {
      if (rr < 4) return dz === -3 ? 'X' : 'P'
      if (rr > 8) return 'X'
    }
    var ang = Math.atan2(dz, dx) / (Math.PI / 6)
    var near = Math.abs(ang - Math.round(ang))
    if (near < 0.16 && Math.abs(y - 3) !== 3) return 'Q'
    return 'F'
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(),
      fn: m.name === 'accretion_disk_skimmer' ? skimmerCell : m.name === 'frc_former' ? formerCell : bzCell
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
    Object.keys(CD.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(CD.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    CD.machines.forEach(function (m) {
      event.create(m.type)
        .category(m.generator ? 'generator' : 'multiblock')
        .setEUIO(m.generator ? 'out' : 'in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    CD.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      var builder = event.create(m.name, 'multiblock')
      if (m.generator) builder = G.generators.configure(builder, { maxParallels: 1, name: m.name })
      else builder = builder.recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      builder
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.cygnus_x1_orbit')),
          m.generator ? Text.translate('grindless.machine.' + m.name + '.tooltip.1') : Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
