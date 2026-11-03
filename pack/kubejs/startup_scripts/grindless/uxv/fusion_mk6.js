// priority: -10849
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
  var GUM = 'grindless:gum_metal_casing'
  var PULSED = 'grindless:pulsed_field_casing'

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

  // the Mk6 ring (D4-SHAPE-UXV-B): a 45 x 11 x 45 torus round a lit central solenoid, one cell of wall. The Mk6 fusion casing, the
  // signature, is the outer port band only; gum metal is the body, pulsed-field toroidal magnets stand every third sector over the top and
  // bottom, and a spoked base carries it. The controller stands on a pier at the front. Math.PI is undefined in Rhino: a literal.
  var PI = 3.141592653589793
  var N = 45
  var H = 11
  var CEN = 22
  var RR = 17
  var TY = 5

  function ringCell(x, y, z) {
    var dx = x - CEN
    var dz = z - CEN
    var r = Math.sqrt(dx * dx + dz * dz)
    if (z >= 40 && x >= 20 && x <= 24 && y <= 2) return 'G'
    if (r < 2.5) return y === 0 || y === H - 1 ? 'G' : 'K'
    var dr = r - RR
    var dy = y - TY
    var dd = Math.sqrt(dr * dr + dy * dy)
    var bin = Math.floor((Math.atan2(dz, dx) + PI) / (PI / 8)) % 16
    if (dd >= 4 && dd < 5) {
      var phi = Math.abs(Math.atan2(dy, dr))
      if (phi < 0.5) {
        if (y === TY) {
          if (bin === 4 || bin === 8 || bin === 12) return 'I'
          if (bin === 0 || bin === 14) return 'O'
          return bin % 2 === 1 ? 'E' : 'C'
        }
        return bin % 2 === 0 && y !== TY ? 'L' : 'C'
      }
      if (phi > 2.4) return 'G'
      return bin % 3 === 0 ? 'M' : 'G'
    }
    if (dd < 4) return '#'
    if (dd < 6 && bin % 3 === 0 && dd >= 5) {
      var ph = Math.abs(Math.atan2(dy, dr))
      if (ph > 0.8 && ph < 2.3) return 'M'
    }
    if (y === 0) {
      if (Math.abs(dr) < 0.5) return 'G'
      if ((dx === 0 || dz === 0) && r < 22) return 'G'
    }
    if (y === TY && r < 12 && (dx === 0 || dz === 0)) return 'Q'
    return ' '
  }

  function ringSlices() {
    return G.uevShapes.slices(N, H, N, ringCell)
  }

  function ringSpec() {
    return {
      slices: ringSlices(),
      symbols: {
        S: Pat.controller(),
        C: Pat.block(CASING),
        G: Pat.block(GUM),
        M: Pat.block(PULSED),
        K: Pat.block(COIL),
        L: Pat.block('gtceu:fusion_glass'),
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
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.fusion_reactor'))
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/uxv_fusion_reactor')
  })
})()
