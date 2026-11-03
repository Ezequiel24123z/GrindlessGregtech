// priority: -9136
// -----------------------------------------------------------------------------------------------
// Cygnus X-1: the ergosphere probe bay and the Penrose engine (docs/eras/uiv.md, machines 21 and 22, line 35; package UIV-B4): the machines,
// their recipe types and the package's own items. The recipes come from data/grindless/tables/cygnus.json (server_scripts/grindless/uiv/cygnus.js).
// Both machines work only at grindless:cygnus_x1_orbit (UIV-B1's far place; the recipes carry recipe.dimension(...) like uiv/rx_j1856.js).
//
//   gtceu:ergosphere_probe_bay   9 x 7 x 9, UIV (31,457,280 EU/t). Type gtceu:ergosphere_probing (circuit 1 probe, 2 sled, 3 refit).
//   gtceu:penrose_engine         39 x 11 x 39, a generator written at its final figure (lib/generators.js; NOT in power/generators.js) that sends
//                                its EU out through wireless dynamo hatches only. Type gtceu:penrose_extraction (circuit 1 Penrose drop).
//                                The run makes 268,435,456 EU/t = 8 A at UIV (33,554,432 V), so the dynamo hatches must carry that: two
//                                gtceu:uiv_wireless_dynamo_hatch_4a (4 A each) or one gtceu:uiv_wireless_dynamo_hatch_16a.
//
// The bay's silhouette is this file's own: a probe hall with a drop rail. The Penrose engine's is uiv/shapes_halls.js: a central shaft with a
// catch ring, twelve release rails and dynamo houses, in metallic-hydrogen field casing. Built in the machine registry callback with G.uivShapes.spec.
//
// New ids: the items below. Textures: tools/assets/Build-UIVCygnusTextures.ps1. Names: client_scripts/grindless/uiv_cygnus_lang.js.
// Published for the recipe script: global.grindless.cygnus.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const CY = G.cygnus || (G.cygnus = {})
  const LOG = '[grindless/uiv] '

  const CASING = 'grindless:mh_field_casing'
  const CASING_TEXTURE = 'grindless:block/uiv/mh_field_casing'
  const BAY_CASING = 'grindless:rhea_casing'
  const BAY_TEXTURE = 'grindless:block/uiv/rhea_casing'
  const COIL = 'grindless:metallic_hydrogen_coil_block'

  CY.table = 'kubejs/data/grindless/tables/cygnus.json'
  CY.site = 'grindless:cygnus_x1_orbit'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  CY.items = {
    kerr_ringdown_record: { stack: 16 },
    synroc_liner: { stack: 16 },
    filled_waste_canister: { stack: 16 },
    compacted_waste_canister: { stack: 16 },
    sled_hull: { stack: 16 },
    split_charge_sled: { stack: 1 }
  }

  // parts: [ability, min, max]; items in include the programmed circuit
  CY.machines = [
    {
      name: 'ergosphere_probe_bay', machine: 'gtceu:ergosphere_probe_bay', type: 'ergosphere_probing', dataKey: 'grindless_ergosphere_probing',
      lang: 'Ergosphere Probe Bay', maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      parts: [['input_bus', 1, 2], ['output_bus', 1, 2], ['energy_input', 1, 2]],
      width: 15, height: 9, depth: 15, casing: BAY_CASING, texture: BAY_TEXTURE, generator: false
    },
    {
      // written final: two 4 A UIV wireless dynamo hatches (or one 16 A) hold the engine's 268,435,456 EU/t
      name: 'penrose_engine', machine: 'gtceu:penrose_engine', type: 'penrose_extraction', dataKey: 'grindless_penrose_extraction',
      lang: 'Penrose Engine', maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      parts: [['input_bus', 1, 2], ['output_bus', 1, 2], ['energy_output', 1, 2]],
      width: 39, height: 11, depth: 39, casing: CASING, texture: CASING_TEXTURE, generator: true
    }
  ]

  var PAL = {
    A: 'gtceu:stable_machine_casing', L: 'gtceu:laminated_glass', P: 'gtceu:tungstensteel_pipe_casing',
    C: COIL, B: 'gtceu:tungstensteel_gearbox', Q: 'tungsten_steel', M: 'grindless:mh_field_casing'
  }

  function abs(n) { return n < 0 ? -n : n }
  function cheb(a, b) { return abs(a) > abs(b) ? abs(a) : abs(b) }

  // the probe bay: a framed hall (floor row of parts, glazed courses, a mast on the roof) with a drop rail down the middle, a coil gate on it
  // and a winch over the gate
  function bayFn() {
    var w = 15
    var d = 15
    var cx = 7
    return function (x, y, z) {
      var dx = x - cx
      var ex = x === 0 || x === w - 1
      var frame = z === 0 || z === 7 || z === d - 1
      if (y === 0) return abs(dx) <= 2 ? 'X' : ' '
      if (y === 8) return z === 7 && abs(dx) <= 1 ? (dx === 0 ? 'Q' : 'M') : ' '
      if (y === 7) {
        if (frame) return 'M'
        return ex ? 'F' : ' '
      }
      if (ex) {
        if (frame) return 'M'
        if (y === 1) return 'F'
        return z % 3 === 1 ? 'L' : 'F'
      }
      if (frame && abs(dx) <= 2 && y <= 2 && z === d - 1) return 'F'
      if (dx === 0 && z === 7 && y >= 4 && y <= 5) return 'C'
      if (dx === 0 && y === 1 && abs(z - 7) <= 3) return 'P'
      if (dx === 0 && z === 7 && y === 6) return 'B'
      if (abs(dx) === 2 && z === 7 && y <= 5) return 'Q'
      if (frame && abs(dx) === 6 && y <= 6) return 'M'
      if (abs(dx) <= 2 || (z === 7 && abs(dx) <= 3)) return '#'
      return ' '
    }
  }

  function spec(m) {
    var parts = m.parts.map(function (p) { return Pat.part(p[0], { min: p[1], max: p[2] }) })
    if (m.name === 'penrose_engine') return G.uivShapes.build(Pat, m.name, m.casing, parts)
    var o = { w: m.width, h: m.height, d: m.depth, pal: {}, parts: parts.concat(m.generator ? [] : [G.parallelHatch.part()]) }
    Object.keys(PAL).forEach(function (k) { o.pal[k] = PAL[k] })
    o.pal.F = m.casing
    o.fn = bayFn()
    return G.uivShapes.spec(Pat, o)
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

  function tooltips(item, name) {
    item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
    item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(CY.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(CY.items[name].stack)
      tooltips(item, name)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    CY.machines.forEach(function (m) {
      event.create(m.type)
        .category(m.generator ? 'generator' : 'multiblock')
        .setEUIO(m.generator ? 'out' : 'in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    CY.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      var builder = event.create(m.name, 'multiblock')
      // the engine: written at its final figure, one run at a time, through its dynamo hatches only (lib/generators.js)
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
