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
// Geometry (lib/patterns.js): the polariser 5 wide x 4 high x 5 deep (clean casing), the ring 5 x 3 x 5 of fusion casing, the spike's
// shape of docs/research/uev-s0.md (S0-6: every energy cell takes an energy input part).
// Textures: tools/assets/Build-UEVFusionTextures.ps1. Names: client_scripts/grindless/uev_fusion_lang.js.
// Published for the recipe script: global.grindless.uevFusion.
// -----------------------------------------------------------------------------------------------
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const UF = G.uevFusion || (G.uevFusion = {})
  const LOG = '[grindless/uev] '

  const UEV = 10
  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
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

  function polariserSlices() {
    var slices = []
    var W = 5, H = 4, D = 5
    for (var si = 0; si < D; si++) {
      var rows = []
      for (var r = 0; r < H; r++) {
        var row = ''
        for (var c = 0; c < W; c++) {
          var ch
          var isWall = si === 0 || si === D - 1 || c === 0 || c === W - 1
          if (r === 0) ch = 'X'
          else if (r === H - 1) ch = 'F'
          else if (si === D - 1 && r === 1 && c === 2) ch = 'S'
          else if (isWall) ch = 'F'
          else ch = '#'
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  UF.polariser.spec = {
    slices: polariserSlices(),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(Pat.block(CLEAN),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 1, max: 2 }),
        Pat.part('energy_input', { min: 1, max: 2 })),
      F: Pat.block(CLEAN),
      '#': Pat.air()
    }
  }

  // the spike of S0-6, slices back to front, three rows each: the HfTaCN coil (UEV-A5) wraps the plasma channel, energy cells around it,
  // the fuel in at the left and out at the right. At most 16 energy hatches, as GTM's rings: 16 x 160,000,000 = 2,560,000,000 EU buffer
  UF.ring.spec = {
    slices: [
      ['EEEEE', 'CKKKC', 'EEEEE'],
      ['EKKKE', 'I###C', 'EKKKE'],
      ['EKKKE', 'I###C', 'EKKKE'],
      ['EKKKE', 'C###O', 'EKKKE'],
      ['EEEEE', 'CCSCC', 'EEEEE']
    ],
    symbols: {
      S: Pat.controller(),
      C: Pat.block(CASING),
      K: Pat.block('grindless:hftacn_coil_block'),
      E: Pat.oneOf(Pat.block(CASING), Pat.part('energy_input', { min: 1, max: 16 })),
      I: Pat.oneOf(Pat.block(CASING), Pat.part('input_hatch', { min: 1, max: 3 })),
      O: Pat.oneOf(Pat.block(CASING), Pat.part('output_hatch', { min: 1, max: 3 })),
      '#': Pat.air()
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
    Pat.register(p.machine, p.spec)
    event.create(p.name, 'multiblock')
      .langValue(p.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(p.type)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CLEAN) })
      .pattern(function (def) { return Pat.build(def, p.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.helium3_polariser.tooltip.0'),
        Text.translate('grindless.machine.helium3_polariser.tooltip.1'),
        Text.translate('grindless.machine.helium3_polariser.tooltip.2')
      ])
      .workableCasingModel(CLEAN_TEXTURE, 'grindless:block/multiblock/helium3_polariser')

    if (FRM == null) {
      console.error(LOG + 'the Mk4 fusion ring is not registered: the tier registration failed')
      return
    }
    var r = UF.ring
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
        Text.translate('grindless.machine.uev_fusion_reactor.tooltip.1'),
        Text.translate('grindless.machine.uev_fusion_reactor.tooltip.2')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/uev_fusion_reactor')
  })
})()
