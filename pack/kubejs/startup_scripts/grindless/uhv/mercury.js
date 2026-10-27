// -----------------------------------------------------------------------------------------------
// UHV on Mercury's ground (docs/eras/uhv.md, machines 20 and 21, lines 19 and 20; package UHV-B2): the regolith excavator and the
// solar vapour furnace, their recipe types and their items. Both stand on IV's Mercury site
// (gcyr:mercury, docs/eras/iv.md:32-50) on IV's Hermean heat-shield brick; every recipe carries .dimension('gcyr:mercury') (server script).
//
//   gtceu:regolith_excavator   VEIN DRILL FAMILY, step 12 (after IV's Mercury vein drill). NASA's RASSOR: two counter-rotating bucket
//                              drums (tungsten steel gearboxes) on tungsten steel frame arms either side of a brick chassis, so the
//                              digging has no net reaction force in Mercury's low gravity. 9 wide x 5 deep x 3 high.
//   gtceu:regolith_excavation  its recipe type (EU in): 1 bucket drum (worn by chance) + IV's iridosmine vein sample (never used up)
//                              -> 64 Mercury regolith. The only maker of Mercury regolith.
//   gtceu:solar_vapour_furnace Vacuum pyrolysis of regolith under 6.7 suns: two rows of five heliostat mirrors on tungsten steel posts
//                              throw the light onto a 5 x 5 tungsten steel firebox receiver over a brick vaporisation chamber; the
//                              condenser plates (IV's night-sky radiators) on its flanks catch each fraction at its own temperature,
//                              and the regolith crucible (heatproof casing) stands in the middle of the vacuum. 9 x 9 x 5.
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
    return Pat.oneOf.apply(null, options)
  }

  //   G bucket drum (tungsten steel gearbox)   F drum arm (tungsten steel frame)   B heat-shield brick   P the conveyor (pipe casing)
  //   X chassis: bricks or a part   S controller
  HM.machines.excavator.spec = {
    slices: [
      // back: the chassis' back wall
      ['  BBBBB  ', '  XXXXX  ', '  BBBBB  '],
      // the drums on their arms either side, the conveyor running through the chassis
      ['G BBBBB G', 'GFXPPPXFG', '  BBBBB  '],
      ['G BBBBB G', 'GFXPPPXFG', '  BBBBB  '],
      ['G BBBBB G', 'GFXPPPXFG', '  BBBBB  '],
      // front: the controller in the chassis' front wall
      ['  BBBBB  ', '  XXSXX  ', '  BBBBB  ']
    ],
    symbols: {
      S: Pat.controller(),
      // 15 chassis cells: 3 to 6 are parts, the rest bricks
      X: body(HM.machines.excavator),
      B: Pat.block(BRICK),
      G: Pat.block(GEARBOX),
      F: Pat.frame([FRAME]),
      P: Pat.block(PIPE)
    }
  }

  //   M heliostat mirror   F tungsten steel frame (posts)   B heat-shield brick   X chamber wall: bricks or a part   N condenser plate
  //   (night-sky radiator)   C receiver (tungsten steel firebox casing)   H the regolith crucible (heatproof casing)   # vacuum
  var EMPTY = ['         ', '         ', '         ', '         ', '         ']
  var CHAMBER = ['BBBBBBBBB', ' NX###XN ', ' NX###XN ', '  B###B  ', '  CCCCC  ']
  HM.machines.furnace.spec = {
    slices: [
      // back: the two rows of heliostats, with the light path in front of each
      ['F F F F F', 'M M M M M', '         ', '         ', '         '],
      EMPTY,
      ['F F F F F', 'M M M M M', '         ', '         ', '         '],
      EMPTY,
      // the vaporisation chamber: its back wall, three slices with the condenser plates and the crucible, the front wall
      ['  BBBBB  ', '  XXXXX  ', '  XXXXX  ', '  BBBBB  ', '  CCCCC  '],
      CHAMBER,
      ['BBBBBBBBB', ' NX#H#XN ', ' NX###XN ', '  B###B  ', '  CCCCC  '],
      CHAMBER,
      ['  BBBBB  ', '  XXSXX  ', '  XXXXX  ', '  BBBBB  ', '  CCCCC  ']
    ],
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
          Text.translate('grindless.machine.' + m.name + '.tooltip.2'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.3')
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
