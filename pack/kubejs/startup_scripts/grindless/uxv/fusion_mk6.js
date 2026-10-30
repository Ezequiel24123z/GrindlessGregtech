// -----------------------------------------------------------------------------------------------
// UXV's Mk6 fusion ring, the stellar burning ring (docs/eras/uxv.md, machine 9 and "Fusion"; package UXV-A7): the machine and the ash gases.
// The recipes come from data/grindless/tables/fusion_mk6.json (server_scripts/grindless/uxv/fusion_mk6.js; the converter and quench rows
// from zpm/fusion.js). The casing block and the other F1 ids are uxv/foundation.js's.
//
//   gtceu:uxv_fusion_reactor   GTM's gtceu:fusion_reactor type at tier 12 (FusionReactorMachine.registerFusionTier, as the Mk4 and Mk5):
//                              16 energy hatches x 2^6 x 10,000,000 = 10,240,000,000 EU of storage, a long; a 15 x 7 x 17 octagonal annulus of
//                              grindless:uxv_fusion_casing lined with the Mk5's metallic hydrogen coil and fusion glass.
//
// New ids: the gases gtceu:helium_burning_ash, gtceu:carbon_burning_ash and gtceu:oxygen_burning_ash (the converter's ash, split by the
// quench caster). Textures: tools/assets/Build-UXVFusionMk6Textures.ps1. Names: client_scripts/grindless/uxv_fusion_mk6_lang.js.
// Published for the recipe script: global.grindless.fusionMk6.
(function () {
  var G = global.grindless
  var Pat = G.patterns
  var MK6 = G.fusionMk6 || (G.fusionMk6 = {})
  var LOG = '[grindless/uxv/fusion_mk6] '

  var UXV = 12
  var CASING = 'grindless:uxv_fusion_casing'
  var CASING_TEXTURE = 'grindless:block/uxv/uxv_fusion_casing'
  var COIL = 'grindless:metallic_hydrogen_coil_block'

  MK6.table = 'kubejs/data/grindless/tables/fusion_mk6.json'
  MK6.tier = UXV
  MK6.ring = { name: 'uxv_fusion_reactor', machine: 'gtceu:uxv_fusion_reactor', type: 'fusion_reactor', lang: 'Mk6 Fusion Reactor' }
  MK6.fluids = {
    'gtceu:helium_burning_ash': { colour: 0xE8C890, formula: '12C/16O' },
    'gtceu:carbon_burning_ash': { colour: 0xD89870, formula: 'Ne/Na/Mg' },
    'gtceu:oxygen_burning_ash': { colour: 0x88A8E0, formula: 'Si/S/P' }
  }

  var FRM = null
  try {
    FRM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.FusionReactorMachine')
    FRM.registerFusionTier(UXV, ' (UXV)')
  } catch (e) {
    FRM = null
    console.error(LOG + 'FusionReactorMachine.registerFusionTier(12) failed: ' + e)
  }

  // the Mk6 ring: an octagonal annulus 15 x 7 x 17 round an open plasma channel. Coils line the channel, energy cells and fusion glass
  // ports on the outer wall, a pipe course between, frame pylons on the cut corners.
  var W = 15
  var H = 7
  var D = 17

  function ringCell(x, y, z) {
    var ex = x < W - 1 - x ? x : W - 1 - x
    var ez = z < D - 1 - z ? z : D - 1 - z
    if (ex + ez < 3) return ' '
    var e = ex < ez ? ex : ez
    if (e > 2) return y >= 1 && y <= H - 2 ? '#' : ' '
    if (ex + ez === 3) return 'Q'
    if (x === 0 && z === (D - 1) / 2 && (y === 2 || y === 4)) return 'I'
    if (x === W - 1 && z === (D - 1) / 2 && y === 2) return 'O'
    if (y === 0) return e === 0 ? 'E' : 'C'
    if (y === H - 1) return e === 1 ? 'A' : 'C'
    if (e === 2) return 'K'
    if (e === 1) return y % 2 === 0 ? 'P' : 'C'
    if (y === 3) return (x + z) % 3 === 0 ? 'C' : 'L'
    return y === 1 || y === 5 ? 'E' : 'L'
  }

  function ringSlices() {
    var slices = []
    var mid = (W - 1) / 2
    for (var z = 0; z < D; z++) {
      var rows = []
      for (var y = 0; y < H; y++) {
        var row = ''
        for (var x = 0; x < W; x++) {
          var ch = ringCell(x, y, z)
          if (z === D - 1 && y === 1 && x === mid) ch = 'S'
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  function ringSpec() {
    return {
      slices: ringSlices(),
      symbols: {
        S: Pat.controller(),
        C: Pat.block(CASING),
        K: Pat.block(COIL),
        A: Pat.block('gtceu:high_power_casing'),
        L: Pat.block('gtceu:fusion_glass'),
        P: Pat.block('gtceu:tungstensteel_pipe_casing'),
        Q: Pat.frame(['tungsten_steel']),
        E: Pat.oneOf(Pat.block(CASING), Pat.part('energy_input', { min: 1, max: 16 })),
        I: Pat.oneOf(Pat.block(CASING), Pat.part('input_hatch', { min: 1, max: 3 })),
        O: Pat.oneOf(Pat.block(CASING), Pat.part('output_hatch', { min: 1, max: 3 })),
        '#': Pat.air()
      }
    }
  }

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MK6.fluids).forEach(function (key) {
      var s = MK6.fluids[key]
      event.create(key).gas().color(s.colour).formula(s.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    if (FRM == null) {
      console.error(LOG + 'the Mk6 fusion ring is not registered: the tier registration failed')
      return
    }
    var r = MK6.ring
    r.spec = ringSpec()
    Pat.register(r.machine, r.spec)
    event.create(r.name, 'multiblock')
      .langValue(r.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return new FRM(holder, UXV) })
      .recipeType(r.type)
      .recipeModifier(function (machine, recipe) { return FRM.recipeModifier(machine, recipe) }, true)
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, r.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.uxv_fusion_reactor.tooltip.0'),
        Text.translate('grindless.machine.uxv_fusion_reactor.tooltip.1'),
        Text.translate('grindless.machine.uxv_fusion_reactor.tooltip.2')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/uxv_fusion_reactor')
  })
})()
