// priority: -8100
// -----------------------------------------------------------------------------------------------
// UHV on Mercury's ground (docs/eras/uhv.md, machines 20 and 21, lines 19 and 20; package UHV-B2): the regolith excavator and the
// solar vapour furnace, their recipe types and their items. Both stand on IV's Mercury site
// (gcyr:mercury, docs/eras/iv.md:32-50) on IV's Hermean heat-shield brick; every recipe carries .dimension('gcyr:mercury') (server script).
//
//   gtceu:regolith_excavator   VEIN DRILL FAMILY, step 12 (after IV's Mercury vein drill). NASA's RASSOR: two counter-rotating bucket
//                              drums (tungsten steel gearboxes) on tungsten steel frame arms either side of a brick chassis, so the
//                              digging has no net reaction force in Mercury's low gravity. Here a bucket-wheel excavator on crawler
//                              tracks (a gearbox wheel on a frame boom with a pipe conveyor, a cab and a counterweight), 9 x 8 x 17.
//   gtceu:regolith_excavation  its recipe type (EU in): 1 bucket drum (worn by chance) + IV's iridosmine vein sample (never used up)
//                              -> 64 Mercury regolith. The only maker of Mercury regolith.
//   gtceu:solar_vapour_furnace Vacuum pyrolysis of regolith under 6.7 suns: seven rows of seven heliostat mirrors on tungsten steel posts
//                              throw the light onto a 5 x 5 tungsten steel firebox receiver over a brick vaporisation chamber; the
//                              condenser plates (IV's night-sky radiators) on its flanks catch each fraction at its own temperature,
//                              and the regolith crucible (heatproof casing) stands in the middle of the vacuum. 15 x 11 x 21.
//   gtceu:solar_vaporisation   its recipe type (EU in), Mercury's day side only (.daytime(false), IV's solar field rule). Circuit 1
//                              low (1,400 K), 2 high (2,300 K), 3 sinter a crucible lining from the residue.
//
// Items (grindless:, names in client_scripts/grindless/uhv_mercury_lang.js): mercury_regolith, stripped_mercury_regolith,
// excavator_bucket_drum, regolith_crucible_lining, silicon_monoxide_dust (SiO), alumina_calcia_residue (CaAl2O4), iron_tube (the MgB2
// powder-in-tube sheath, uv/materials.js circuit 5). Plain items, not GT materials: each has exactly one maker and one user.
// F1's ids (uhv/foundation.js) are not registered again; none is needed here.
// Textures: tools/assets/Build-UHVMercuryTextures.ps1 (the items and the overlay dirs grindless:block/multiblock/<machine>, on IV's brick).
// Published: global.grindless.uhvMercury.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const HM = G.uhvMercury || (G.uhvMercury = {})

  const BRICK = 'grindless:hermean_heat_shield_brick'
  const BRICK_TEXTURE = 'grindless:block/hermean_heat_shield_brick'
  const RADIATOR = 'grindless:night_sky_radiator'
  const MIRROR = 'grindless:heliostat_mirror'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'
  const PIPE = 'gtceu:tungstensteel_pipe_casing'
  const FIREBOX = 'gtceu:tungstensteel_firebox_casing'
  const HEAT = 'gtceu:heatproof_machine_casing'
  const FRAME = 'tungsten_steel'

  // item name -> stack size; two tooltip lines each (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    mercury_regolith: { stack: 64 },
    stripped_mercury_regolith: { stack: 64 },
    excavator_bucket_drum: { stack: 16 },
    regolith_crucible_lining: { stack: 16 },
    silicon_monoxide_dust: { stack: 64 },
    alumina_calcia_residue: { stack: 64 },
    iron_tube: { stack: 64 }
  }

  HM.site = (G.ivFoundation && G.ivFoundation.dimensions && G.ivFoundation.dimensions.mercury) || 'gcyr:mercury'
  HM.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  HM.ids = {
    regolith: 'grindless:mercury_regolith',
    stripped: 'grindless:stripped_mercury_regolith',
    drum: 'grindless:excavator_bucket_drum',
    lining: 'grindless:regolith_crucible_lining',
    ironTube: 'grindless:iron_tube',
    siliconMonoxide: 'grindless:silicon_monoxide_dust',
    aluminaCalcia: 'grindless:alumina_calcia_residue',
    sample: (G.ivFoundation && G.ivFoundation.samples && G.ivFoundation.samples.iridosmineMercury) || 'grindless:vein_sample_iridosmine_mercury'
  }
  HM.blocks = { brick: BRICK, radiator: RADIATOR, mirror: MIRROR, gearbox: GEARBOX, pipe: PIPE, firebox: FIREBOX, heat: HEAT }

  HM.machines = {
    excavator: {
      name: 'regolith_excavator',
      machine: 'gtceu:regolith_excavator',
      type: 'regolith_excavation',
      lang: 'Regolith Excavator',
      overlay: 'grindless:block/multiblock/regolith_excavator',
      // items in: the drum and the sample; out: the regolith
      maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      parts: { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 } },
      minBricks: 9
    },
    furnace: {
      name: 'solar_vapour_furnace',
      machine: 'gtceu:solar_vapour_furnace',
      type: 'solar_vaporisation',
      lang: 'Solar Vapour Furnace',
      overlay: 'grindless:block/multiblock/solar_vapour_furnace',
      // items in: the regolith (or residue), the lining and the circuit; out: up to five fractions; fluid out: the sodium-potassium
      maxIO: { itemsIn: 3, itemsOut: 5, fluidsIn: 0, fluidsOut: 1 },
      parts: { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 3 }, output_hatch: { exact: 1 } },
      minBricks: 23
    }
  }

  // ---------------------------------------------------------------- patterns (lib/patterns.js: slices back -> front, rows bottom -> top)

  function body(m) {
    var options = [Pat.block(BRICK, { min: m.minBricks })]
    Object.keys(m.parts).forEach(function (ability) { options.push(Pat.part(ability, m.parts[ability])) })
    options.push(G.parallelHatch.part())
    return Pat.oneOf.apply(null, options)
  }

  //   G bucket-wheel ring (tungsten steel gearbox)   F frame (spokes, slewing tower, boom, stays)   B heat-shield brick (tracks, cab)
  //   P the boom conveyor (pipe casing)   H heatproof counterweight   X chassis deck: bricks or a part   S controller
  // A bucket-wheel excavator, 9 wide x 8 high x 17 long: a crawler track either side, a chassis deck, an operator cab in front, a
  // slewing tower carrying the boom, a conveyor on the boom, the bucket wheel at the back and a counterweight behind the tower.
  function excavatorCell(r, z, c) {
    var dx = c - 4
    var ch = ' '
    if (z === 0) {
      var d = Math.round(Math.sqrt(dx * dx + (r - 4) * (r - 4)))
      if (d === 3) return 'G'
      if ((r === 4 && Math.abs(dx) <= 2) || (dx === 0 && Math.abs(r - 4) <= 2)) return 'F'
      return ' '
    }
    if (c === 4 && r === 4 && z <= 8) return 'F'
    if (c === 4 && r === 3 && z >= 1 && z <= 8) return 'P'
    if (z === 8 && r >= 2 && r <= 4 && (c === 3 || c === 5)) return 'F'
    if (z === 8 && c === 4 && r === 2) return 'F'
    if (c === 4 && z >= 9 && z <= 11 && r === 13 - z) return 'F'
    if (z >= 14 && c >= 3 && c <= 5 && r >= 1 && r <= 3) {
      if (z === 16 || c !== 4 || r === 3) return 'B'
      return ' '
    }
    if (r === 1 && c >= 3 && c <= 5 && z >= 5 && z <= 13) return 'X'
    if (r >= 2 && r <= 3 && c >= 3 && c <= 5 && z >= 10 && z <= 12) return 'H'
    if ((c === 1 || c === 7) && z >= 2 && z <= 14) {
      if (r === 0) return 'B'
      if (r === 1 && z >= 4 && z <= 12) return 'B'
    }
    if (r === 0 && c >= 2 && c <= 6 && (z === 5 || z === 11)) return 'B'
    return ch
  }

  function layMercury(width, height, depth, f) {
    var slices = []
    var mid = (width - 1) / 2
    for (var z = 0; z < depth; z++) {
      var rows = []
      for (var r = 0; r < height; r++) {
        var line = ''
        for (var c = 0; c < width; c++) {
          line += z === depth - 1 && r === 1 && c === mid ? 'S' : f(r, z, c)
        }
        rows.push(line)
      }
      slices.push(rows)
    }
    return slices
  }

  HM.machines.excavator.spec = {
    slices: layMercury(9, 8, 17, excavatorCell),
    symbols: {
      S: Pat.controller(),
      X: body(HM.machines.excavator),
      B: Pat.block(BRICK),
      G: Pat.block(GEARBOX),
      F: Pat.frame([FRAME]),
      P: Pat.block(PIPE),
      H: Pat.block(HEAT)
    }
  }

  //   M heliostat mirror   F tungsten steel frame (posts)   B heat-shield brick   X chamber wall: bricks or a part   N condenser plate
  //   (night-sky radiator)   C receiver (tungsten steel firebox casing)   H the regolith crucible (heatproof casing)   # vacuum
  var CHAMBER = ['BBBBBBBBB', ' NX###XN ', ' NX###XN ', '  B###B  ', '  CCCCC  ']
  var CHAMBER_SLICES = [
    ['  BBBBB  ', '  XXXXX  ', '  XXXXX  ', '  BBBBB  ', '  CCCCC  '],
    CHAMBER,
    ['BBBBBBBBB', ' NX#H#XN ', ' NX###XN ', '  B###B  ', '  CCCCC  '],
    CHAMBER,
    ['  BBBBB  ', '  XXSXX  ', '  XXXXX  ', '  BBBBB  ', '  CCCCC  ']
  ]

  // 15 wide x 11 high x 21 deep: a heliostat bed (seven rows of seven mirrors on frame posts) throws the light over a brick shield onto
  // the 5 x 5 firebox receiver of the 9 x 5 x 5 vaporisation chamber (the crucible inside, condenser plates on its flanks and wings),
  // under a firebox concentrator tower with a frame crown.
  function furnaceCell(r, z, c) {
    if (z <= 12 && z % 2 === 0) {
      if (c % 2 === 1 && c >= 1 && c <= 13) return r <= 1 ? 'F' : (r === 2 ? 'M' : ' ')
      return ' '
    }
    if (z === 15 && c >= 3 && c <= 11 && r <= 2) return 'B'
    if ((c === 0 || c === 14) && z <= 14 && r === 0) return 'B'
    if ((c === 3 || c === 11) && (z === 16 || z === 20) && r >= 5 && r <= 8) return 'F'
    if (z >= 16) {
      var cc = c - 3
      if (cc >= 0 && cc <= 8 && r <= 4) return CHAMBER_SLICES[z - 16][r].charAt(cc)
      if ((c === 2 || c === 12) && z >= 17 && z <= 19 && r >= 1 && r <= 3) return 'N'
      var dx = Math.abs(c - 7)
      var dz = Math.abs(z - 18)
      if (dx <= 1 && dz <= 1) {
        if (r >= 5 && r <= 9) return dx === 0 && dz === 0 ? ' ' : 'C'
        if (r === 10) return 'F'
      }
    }
    return ' '
  }

  HM.machines.furnace.spec = {
    slices: layMercury(15, 11, 21, furnaceCell),
    symbols: {
      S: Pat.controller(),
      // 31 wall cells: 4 to 8 are parts, the rest bricks
      X: body(HM.machines.furnace),
      B: Pat.block(BRICK),
      M: Pat.block(MIRROR),
      F: Pat.frame([FRAME]),
      N: Pat.block(RADIATOR),
      C: Pat.block(FIREBOX),
      H: Pat.block(HEAT),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var ex = HM.machines.excavator
    event.create(ex.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(ex.maxIO.itemsIn, ex.maxIO.itemsOut, ex.maxIO.fluidsIn, ex.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_MACERATE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.MACERATOR)
    var fu = HM.machines.furnace
    event.create(fu.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(fu.maxIO.itemsIn, fu.maxIO.itemsOut, fu.maxIO.fluidsIn, fu.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Object.keys(HM.machines).forEach(function (key) {
      var m = HM.machines[key]
      Pat.register(m.machine, m.spec)
      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(BRICK) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(BRICK_TEXTURE, m.overlay)
    })
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
