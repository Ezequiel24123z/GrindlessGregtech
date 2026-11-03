// priority: -7562
// -----------------------------------------------------------------------------------------------
// UEV's fusion (docs/eras/uev.md, machines 14 and 15, lines 23, 24 and 25; package UEV-A7): the helium-3 polariser and the Mk4 fusion
// ring, their recipe type, the fuels' chemistry and the package's own items. The recipes are in server_scripts/grindless/uev/fusion.js
// and data/grindless/tables/fusion_mk4.json.
//
//   gtceu:helium3_polariser   metastability-exchange optical pumping: a 1,083 nm laser (the Yb fibre's line) spin-polarises helium-3.
//                             The only maker of grindless polarised helium-3 and of gtceu:polarised_dhe3_fuel. Parallel hatch.
//   gtceu:spin_polarisation   its recipe type (EU in). Circuit 1 polarise helium-3, 2 mix polarised helium-3 with deuterium.
//   gtceu:uev_fusion_reactor  the Mk4 ring: tier 10 on GTM's gtceu:fusion_reactor type (FusionReactorMachine.registerFusionTier), storage
//                             above the int maximum (a long), runs c1 D-He-3, c2 p-11B, c3 polarised D-He-3. Premixed fuels: one fluid
//                             per recipe, mixed upstream. GTM's three rings and their recipes are untouched.
//
// F1 registered the casing grindless:uev_fusion_casing and the fluids dhe3_fuel_mix, pb11_fuel and polarised_dhe3_fuel (uev/foundation.js):
// they are used here, never registered again. New here: the 6N helium-3, the polarised helium-3, the ash of the helium plasma, the three
// Mk4 plasma grades the direct energy converter eats, and plain boron trifluoride (GTM has only the two isotope forms).
// Geometry (lib/patterns.js): the polariser 13 x 9 x 17, the Mk4 ring a torus 33 x 9 x 33 (SiC composite wall, six fusion casing bands, HfTaCN
// lining and a lit central solenoid; docs/research/uev-s0.md S0-6: every energy cell takes an energy input part).
// Textures: tools/assets/Build-UEVFusionTextures.ps1. Names: client_scripts/grindless/uev_fusion_lang.js.
// Published for the recipe script: global.grindless.uevFusion.
// -----------------------------------------------------------------------------------------------
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const UF = G.uevFusion || (G.uevFusion = {})
  const LOG = '[grindless/uev] '

  const UEV = 10
  const POLARISER = 'grindless:superhydride_magnet_casing'
  const POLARISER_TEXTURE = 'grindless:block/uev/superhydride_magnet_casing'
  const CASING = 'grindless:uev_fusion_casing'
  const CASING_TEXTURE = 'grindless:block/uev/uev_fusion_casing'

  UF.table = 'kubejs/data/grindless/tables/fusion_mk4.json'
  UF.tier = UEV
  UF.polariser = { name: 'helium3_polariser', machine: 'gtceu:helium3_polariser', type: 'spin_polarisation', lang: 'Helium-3 Polariser' }
  UF.ring = { name: 'uev_fusion_reactor', machine: 'gtceu:uev_fusion_reactor', type: 'fusion_reactor', lang: 'Mk4 Fusion Reactor' }
  UF.items = { boron_11_powder: { stack: 64 }, laser_1083nm: { stack: 16 } }
  // name -> { colour, formula }; every one a gas. The three plasma grades differ so that each Mk4 recipe has its own converter row.
  UF.materials = {
    helium_3_6n: { colour: 0xF8F0B0, formula: '3He' },
    polarised_helium_3: { colour: 0xFFB0E0, formula: '3He(pol)' },
    helium_4_ash: { colour: 0xE8E0A8, formula: '4He' },
    uev_dhe3_plasma: { colour: 0xFF5AB0, formula: '4He(+)' },
    uev_pb11_plasma: { colour: 0x5A9AFF, formula: '3 4He(+)' },
    uev_polarised_plasma: { colour: 0xFF8AE8, formula: '4He(+)(pol)' },
    boron_trifluoride: { colour: 0xC8E8D0, formula: 'BF3' }
  }

  // ---------------------------------------------------------------- the ring's tier (S0-6: registerFusionTier from KubeJS)

  var FRM = null
  try {
    FRM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.FusionReactorMachine')
    FRM.registerFusionTier(UEV, ' (UEV)')
  } catch (e) {
    FRM = null
    console.error(LOG + 'FusionReactorMachine.registerFusionTier(10) failed: ' + e)
  }

  // ---------------------------------------------------------------- geometry

  // The polariser is a holding-field solenoid: a long superhydride coil barrel (M) over a gallery of photonic optical-pumping cells
  // (O) with glass windows, a 1,083 nm laser bench (O) on the left and a SiC compressor room on the right. Built in the registry
  // callback (shapes.js may load after this file).
  UF.polariser.width = 13
  UF.polariser.height = 9
  UF.polariser.depth = 17
  function polariserShape() {
    var s = G.uevShapes.scene(13, 9, 17)
    s.box(0, 0, 0, 12, 0, 16, 'X')
    s.cyl('z', 6, 4, 3, 2, 13, 'M', true, '#')
    ;[2, 13].forEach(function (z) { s.cyl('z', 6, 4, 3, z, z, 'R') })
    ;[4, 7, 10].forEach(function (z) { s.cyl('z', 6, 4, 3, z, z, 'H', true, null) })
    s.set(3, 4, 7, 'C').set(9, 4, 7, 'C').set(6, 1, 7, 'C').set(6, 7, 7, 'C')
    s.cyl('z', 6, 4, 1, 4, 11, 'O', true, null)
    s.box(6, 4, 3, 6, 4, 12, 'P')
    ;[5, 8, 11].forEach(function (z) { s.set(6, 6, z, 'L').set(6, 2, z, 'L') })
    s.room(0, 1, 3, 2, 4, 10, 'O').box(1, 2, 4, 1, 3, 9, 'L')
    s.room(10, 1, 3, 12, 4, 10, 'R').box(11, 1, 5, 11, 2, 8, 'B')
    s.box(0, 1, 11, 12, 1, 12, 'H')
    return s.booth('R', 3).fn()
  }
  function polariserSpec() {
    return G.uevShapes.spec(Pat, {
      w: 13, h: 9, d: 17, parts: [
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 1, max: 2 }),
        Pat.part('energy_input', { min: 1, max: 2 })
      ],
      fn: polariserShape(),
      pal: G.uevShapes.palette(POLARISER)
    })
  }

  // the Mk4 ring: a torus 33 x 9 x 33. The wall is two layers thick round a plasma channel of radius 2: the outer layer is SiC composite
  // with six fusion casing bands (the energy cells E sit on their outer equator), glass-windowed sectors and passive toroidal magnets
  // (superhydride) above and below; the inner layer is the HfTaCN lining and a lit HfTaCN central solenoid stands in the hole. The fuel
  // goes in at the left (I) and out at the right (O). At most 16 energy hatches, as GTM's rings: 16 x 160,000,000 = 2,560,000,000 EU
  // buffer. GTM's fusion_reactor type and FusionReactorMachine are unchanged: only the cells moved.
  UF.ring.width = 33
  UF.ring.height = 9
  UF.ring.depth = 33
  function ringCell() {
    var s = G.uevShapes.scene(33, 9, 33)
    var R = 11
    var sector = 3.141592653589793 / 12
    for (var z = 0; z < 33; z++) for (var x = 0; x < 33; x++) for (var y = 0; y < 9; y++) {
      var rho = Math.sqrt((x - 16) * (x - 16) + (z - 16) * (z - 16))
      var dr = rho - R
      var dy = y - 4
      var d = Math.sqrt(dr * dr + dy * dy)
      if (d > 4.2 || d <= 2.2) continue
      var k = Math.floor((Math.atan2(z - 16, x - 16) + 3.141592653589793) / sector) % 4
      var ch
      if (d <= 3.2) {
        if (dy < -1 || dy > 1) continue
        ch = 'H'
      }
      else if (k === 0) ch = (dy === 0 && dr > 0 && rho > 14.5) ? 'E' : 'C'
      else if (k === 2) ch = (dy >= -1 && dy <= 1 && dr > 0) ? 'L' : 'R'
      else ch = (dr > -1.5 && dr < 1.5 && (dy > 2 || dy < -2)) ? 'M' : 'R'
      s.set(x, y, z, ch)
    }
    s.set(1, 4, 16, 'I').set(31, 4, 16, 'O')
    s.cyl('y', 16, 16, 2, 1, 7, 'K', true, '#').box(16, 1, 16, 16, 7, 16, 'Q')
    s.cyl('y', 16, 16, 2, 0, 0, 'M').cyl('y', 16, 16, 2, 8, 8, 'M')
    ;[[3, 3], [29, 3], [3, 29], [29, 29]].forEach(function (p) { s.box(p[0], 0, p[1], p[0] + 1, 2, p[1] + 1, 'Q') })
    return s.booth('R', 3).fn()
  }
  function ringSpec() {
    var F = G.uevShapes.family
    var parts = Pat.oneOf(Pat.block(CASING), Pat.part('energy_input', { min: 1, max: 16 }))
    return {
      slices: G.uevShapes.slices(33, 9, 33, ringCell()),
      symbols: {
        S: Pat.controller(),
        C: Pat.block(CASING),
        R: Pat.block(F.R),
        H: Pat.block(F.H),
        M: Pat.block(F.M),
        K: Pat.block('grindless:hftacn_coil_block'),
        L: Pat.block('gtceu:laminated_glass'),
        Q: Pat.frame(['tungsten_steel']),
        X: Pat.oneOf(Pat.block(F.R), Pat.part('energy_input', { min: 1, max: 16 })),
        E: parts,
        I: Pat.oneOf(Pat.block(CASING), Pat.part('input_hatch', { min: 1, max: 3 })),
        O: Pat.oneOf(Pat.block(CASING), Pat.part('output_hatch', { min: 1, max: 3 })),
        '#': Pat.air()
      }
    }
  }
  // ---------------------------------------------------------------- materials (gases)

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(UF.materials).forEach(function (name) {
      var spec = UF.materials[name]
      event.create(name).gas().color(spec.colour).formula(spec.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  // ---------------------------------------------------------------- items

  StartupEvents.registry('item', function (event) {
    Object.keys(UF.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(UF.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // items in: the laser (not consumed) and the circuit; fluids in: the gas and the second gas; fluids out: the gas and what is returned
    event.create(UF.polariser.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(2, 0, 2, 2)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var p = UF.polariser
    var pType = GTRecipeTypes.get(p.type)
    if (pType == null) throw new Error(LOG + 'recipe type gtceu:' + p.type + ' is not registered')
    p.spec = polariserSpec()
    Pat.register(p.machine, p.spec)
    event.create(p.name, 'multiblock')
      .langValue(p.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(p.type)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(POLARISER) })
      .pattern(function (def) { return Pat.build(def, p.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.helium3_polariser.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.spin_polarisation'))
      ])
      .workableCasingModel(POLARISER_TEXTURE, 'grindless:block/multiblock/helium3_polariser')

    if (FRM == null) {
      console.error(LOG + 'the Mk4 fusion ring is not registered: the tier registration failed')
      return
    }
    var r = UF.ring
    r.spec = ringSpec()
    Pat.register(r.machine, r.spec)
    event.create(r.name, 'multiblock')
      .langValue(r.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return new FRM(holder, UEV) })
      .recipeType(r.type)
      .recipeModifier(function (machine, recipe) { return FRM.recipeModifier(machine, recipe) }, true)
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, r.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.uev_fusion_reactor.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.fusion_reactor'))
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/uev_fusion_reactor')
  })
})()
