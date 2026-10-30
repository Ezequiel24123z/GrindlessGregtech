// -----------------------------------------------------------------------------------------------
// OpV's field-frozen press (docs/eras/opv.md, machine 13, process lines 3 and 45; package OpV-A3) and its recipe type. The recipes come
// from data/grindless/tables/field_press.json (server_scripts/grindless/opv/field_press.js). The package's own items: the W-Re canned
// stack, the billet and the spent can of line 3, and the AlN to AlGaN wafers of line 45; field_frozen_plate, field_frozen_casing and
// aln_power_die are F1's (opv/foundation.js).
//
//   gtceu:field_frozen_press  7 x 9 x 7 hydraulic press, OpV. Recipe type gtceu:field_freezing (circuit 1 billet, 2 plate, 3 casing);
//                             locked to SGR 1806-20's orbit. It runs on two UXV 4 A energy hatches (bootstrap: OpV hatches need its plate).
//
// Geometry (lib/patterns.js: a slice has at most 16 rows): the controller sits in the front slice (z = 6), the floor takes the parts.
// Four frame posts carry a crosshead; a three-high superconducting coil ring holds the field around the press gap, the ram hangs over it.
// The front is the open can bay. Textures: tools/assets/Build-OpVFieldPressTextures.ps1. Names: client_scripts/grindless/opv_field_press_lang.js.
// Published for the recipe script: global.grindless.fieldPress.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const FP = G.fieldPress || (G.fieldPress = {})
  const LOG = '[grindless/opv] '

  const HPC = 'gtceu:high_power_casing'
  const HPC_TEXTURE = 'gtceu:block/casings/hpca/high_power_casing'
  const COIL = 'gtceu:superconducting_coil'

  FP.table = 'kubejs/data/grindless/tables/field_press.json'
  FP.site = 'grindless:sgr1806_orbit'

  // items in include the programmed circuit
  FP.machines = [
    {
      name: 'field_frozen_press', machine: 'gtceu:field_frozen_press', type: 'field_freezing', dataKey: 'grindless_field_freezing', lang: 'Field-Frozen Press',
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 }, width: 7, height: 9, depth: 7, casing: HPC, texture: HPC_TEXTURE,
      pal: { F: HPC, C: COIL, Q: 'tungsten_steel' },
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 2 }), Pat.part('energy_input', { min: 1, max: 2 }), G.parallelHatch.part()]
      }
    }
  ]

  // line 3 (W-Re can, billet, spent can) and line 45 (AlN powder to the patterned AlGaN wafer)
  FP.items = ['field_canned_stack', 'field_frozen_billet', 'spent_field_can']

  function abs(n) { return n < 0 ? -n : n }
  function max(a, b) { return a > b ? a : b }

  // x left to right, y bottom to top, z back (0) to front (6). Floor of parts; r = 3 is the frame (corner posts, a girdle at y 4, a low
  // skirt), open above the skirt and at the front bay; r = 2 is the field ring (coil y 3-5); r <= 1 is the platen (y 1), the press gap and
  // the ram (y 7) on its rod; the crosshead beam runs across the top.
  function pressCell(x, y, z) {
    var dx = x - 3
    var dz = z - 3
    var r = max(abs(dx), abs(dz))
    var corner = abs(dx) === 3 && abs(dz) === 3
    if (y === 0) return 'X'
    if (y === 8) {
      if (corner) return 'Q'
      return abs(dz) <= 1 ? 'F' : ' '
    }
    if (r === 3) {
      if (corner) return 'Q'
      if (y <= 2) return 'F'
      if (z === 6) return ' '
      return y === 4 ? 'Q' : ' '
    }
    if (r === 2) return y >= 3 && y <= 5 ? 'C' : 'F'
    if (y === 1 || y === 7) return 'F'
    if (y === 6 && r === 0) return 'Q'
    return '#'
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: pressCell })
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
    FP.items.forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    FP.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    FP.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('gtceu.multiblock.parallelizable.tooltip'),
          Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.sgr1806_orbit'))
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
