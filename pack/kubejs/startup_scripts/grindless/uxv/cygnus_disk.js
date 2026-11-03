// priority: -10766
// -----------------------------------------------------------------------------------------------
// UXV's Cygnus X-1 disk (docs/eras/uxv.md, machines 13-15, lines 30 and 31; package UXV-B3): the accretion disk skimmer, the FRC former and
// the BZ dynamo, their recipe types and one item (the strand coil). The recipes come from data/grindless/tables/cygnus_disk.json
// (server_scripts/grindless/uxv/cygnus_disk.js). Every other id is F1's (uxv/foundation.js).
//
//   gtceu:accretion_disk_skimmer   19 x 9 x 19 magnetic scoop ring, UXV. Recipe type gtceu:disk_skimming (circuit 1 skim); locked to the Cygnus X-1 orbit.
//   gtceu:frc_former               13 x 13 x 41 linear theta-pinch, UXV. Recipe type gtceu:frc_forming (circuit 1 cartridge, runs anywhere;
//                                  2 flux loading).
//   gtceu:bz_dynamo                19 x 7 x 19 torus round a jet column, UXV. Recipe type gtceu:blandford_znajek, a GENERATOR written at its
//                                  final figure (2^30 EU/t through two UIV 16 A dynamo hatches), one run at a time, locked to the orbit (the skimmer's hot-flow row too). It is
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
  // the UXV family (uxv/casings.js): gum metal is the body of the skimmer and the former, pulsed field their magnets. The pasta containment casing
  // is NOT used: it takes frc_cartridge, which this file's former makes. Neither machine's output is an ancestor of the gum-metal or
  // pulsed-field recipes (the former makes cartridges and strand coils for the field generators; the skimmer scoops disk plasma).
  const GUM = 'grindless:gum_metal_casing'
  const GUM_TEXTURE = 'grindless:block/uxv/gum_metal_casing'
  const PULSED = 'grindless:pulsed_field_casing'

  CD.table = 'kubejs/data/grindless/tables/cygnus_disk.json'
  CD.site = 'grindless:cygnus_x1_orbit'
  CD.items = { strand_coil: { stack: 16 } }

  // items in include the programmed circuit
  CD.machines = [
    {
      name: 'accretion_disk_skimmer', machine: 'gtceu:accretion_disk_skimmer', type: 'disk_skimming', dataKey: 'grindless_disk_skimming',
      lang: 'Accretion Disk Skimmer', maxIO: { itemsIn: 2, itemsOut: 0, fluidsIn: 0, fluidsOut: 1 }, casing: GUM, texture: GUM_TEXTURE,
      generator: false, width: 19, height: 9, depth: 19,
      pal: { F: GUM, M: PULSED, C: 'gtceu:superconducting_coil', L: 'gtceu:fusion_glass', P: 'gtceu:tungstensteel_pipe_casing', Q: 'naquadah_alloy' },
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
      lang: 'FRC Former', maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 2 }, casing: GUM, texture: GUM_TEXTURE,
      generator: false, width: 13, height: 13, depth: 41,
      pal: { F: GUM, M: PULSED, C: 'gtceu:superconducting_coil', L: 'gtceu:fusion_glass', K: 'grindless:cryostat_casing', A: 'gtceu:stable_machine_casing', Q: 'naquadah_alloy' },
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

  // A magnetic scoop ring (19 x 9 x 19), a horizontal torus (major radius 6.5, minor about 2.5) with a hollow tube: a gum-metal skin striped with
  // pulsed-field winding bands, superconducting coils at the four axis spokes, pipe spokes into a fusion-glass collector hub, frame struts under
  // the ring and the control booth on its front arc.
  function scoopRing() {
    var s = G.uevShapes.scene(19, 9, 19)
    for (var z = 0; z < 19; z++) for (var y = 0; y < 9; y++) for (var x = 0; x < 19; x++) {
      var dx = x - 9
      var dz = z - 9
      var rr = Math.sqrt(dx * dx + dz * dz)
      var d2 = (rr - 6.5) * (rr - 6.5) + (y - 4) * (y - 4)
      if (d2 > 6.5) continue
      if (d2 <= 3.2) {
        if (d2 <= 1.01 && (dx === 0 || dz === 0 || dx === dz || dx === -dz)) s.set(x, y, z, 'C')
        else s.set(x, y, z, '#')
        continue
      }
      s.set(x, y, z, (x + z) % 5 < 2 ? 'M' : 'F')
    }
    s.cyl('y', 9, 9, 1, 2, 6, 'L', true)
    ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
      for (var k = 2; k <= 4; k++) s.set(9 + d[0] * k, 4, 9 + d[1] * k, 'P')
    })
    ;[[4, 4], [14, 4], [4, 14], [14, 14]].forEach(function (p) { s.box(p[0], 0, p[1], p[0], 1, p[1], 'Q') })
    return s.booth('F', 3).fn()
  }

  // A linear theta-pinch (13 x 13 x 41) lying along z: the formation tube (fusion-glass and gum-metal courses) wound by pulsed-field coil rings
  // with three superconducting compression rings, the translation section (a narrow gum-metal tube with pulsed-field belts), the capture
  // chamber (a wider gum-metal vessel with cryostat rings) at the front under the controller booth, a stable-casing bed and a capacitor bank along each flank.
  function pinchTube() {
    var s = G.uevShapes.scene(13, 13, 41)
    s.box(5, 0, 0, 7, 0, 40, 'A')
    for (var z = 1; z <= 22; z++) s.cyl('z', 6, 6, 3, z, z, z % 2 === 0 ? 'L' : 'F', true)
    for (var w = 2; w <= 22; w += 3) s.cyl('z', 6, 6, 5, w, w, 'M', true, null)
    ;[12, 16].forEach(function (zz) { s.cyl('z', 6, 6, 4, zz, zz, 'C', true, null) })
    for (var t = 23; t <= 32; t++) s.cyl('z', 6, 6, 3, t, t, 'F', true)
    ;[25, 28, 31].forEach(function (zz) { s.cyl('z', 6, 6, 4, zz, zz, 'M', true, null) })
    for (var c = 33; c <= 39; c++) s.cyl('z', 6, 6, 5, c, c, 'F', true)
    ;[34, 38].forEach(function (zz) { s.cyl('z', 6, 6, 5, zz, zz, 'K', true) })
    s.cyl('z', 6, 6, 5, 40, 40, 'F')
    s.cyl('z', 6, 6, 5, 0, 0, 'F').set(6, 6, 0, 'L')
    s.room(0, 0, 3, 2, 2, 20, 'M', 'rt').room(10, 0, 3, 12, 2, 20, 'M', 'lt')
    return s.booth('F', 3).fn()
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
    // integer spoke test (8 axes and diagonals plus the 2:1 lines): the Rhino Math.atan2/Math.round angle test vanished in game (static model and dump disagreed)
    var adx = Math.abs(dx)
    var adz = Math.abs(dz)
    if ((adx === 0 || adz === 0 || adx === adz || adx === 2 * adz || adz === 2 * adx) && Math.abs(y - 3) !== 3) return 'Q'
    return 'F'
  }

  // built in the machine registry callback: uiv/shapes.js and uev/shapes.js may load after this file
  function spec(m) {
    if (m.name === 'bz_dynamo') {
      return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: bzCell })
    }
    return G.uevShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(),
      fn: m.name === 'accretion_disk_skimmer' ? scoopRing() : pinchTube()
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
          ['disk_skimming', 'blandford_znajek'].indexOf(m.type) >= 0 ? Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.cygnus_x1_orbit')) : null,
          m.generator ? Text.translate('grindless.machine.' + m.name + '.tooltip.1') : Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ].filter(Boolean))
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
