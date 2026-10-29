// priority: -9137
// -----------------------------------------------------------------------------------------------
// Cygnus X-1: the ergosphere probe bay and the Penrose engine (docs/eras/uiv.md, machines 21 and 22, line 35; package UIV-B4): the machines,
// their recipe types and the package's own items. The recipes come from data/grindless/tables/cygnus.json (server_scripts/grindless/uiv/cygnus.js).
// Both machines work only at grindless:cygnus_x1_orbit (UIV-B1's far place; the recipes carry recipe.dimension(...) like uiv/rx_j1856.js).
//
//   gtceu:ergosphere_probe_bay   9 x 7 x 9, UIV (31,457,280 EU/t). Type gtceu:ergosphere_probing (circuit 1 probe, 2 sled, 3 refit).
//   gtceu:penrose_engine         13 x 9 x 13, a generator written at its final figure (lib/generators.js; NOT in power/generators.js) that sends
//                                its EU out through wireless dynamo hatches only. Type gtceu:penrose_extraction (circuit 1 Penrose drop).
//                                The run makes 268,435,456 EU/t = 8 A at UIV (33,554,432 V), so the dynamo hatches must carry that: two
//                                gtceu:uiv_wireless_dynamo_hatch_4a (4 A each) or one gtceu:uiv_wireless_dynamo_hatch_16a.
//
// The silhouettes are this file's own (uiv/shapes.js is read-only for the package): a probe hall with a drop rail, and a catch ring around a
// central shaft. Built in the machine registry callback with G.uivShapes.spec.
//
// New ids: the items below. Textures: tools/assets/Build-UIVCygnusTextures.ps1. Names: client_scripts/grindless/uiv_cygnus_lang.js.
// Published for the recipe script: global.grindless.cygnus.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const CY = G.cygnus || (G.cygnus = {})
  const LOG = '[grindless/uiv] '

  const CASING = 'gtceu:uiv_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/voltage/uiv/side'
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
      width: 9, height: 7, depth: 9, casing: CASING, texture: CASING_TEXTURE, generator: false
    },
    {
      // written final: two 4 A UIV wireless dynamo hatches (or one 16 A) hold the engine's 268,435,456 EU/t
      name: 'penrose_engine', machine: 'gtceu:penrose_engine', type: 'penrose_extraction', dataKey: 'grindless_penrose_extraction',
      lang: 'Penrose Engine', maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      parts: [['input_bus', 1, 2], ['output_bus', 1, 2], ['energy_output', 1, 2]],
      width: 13, height: 9, depth: 13, casing: CASING, texture: CASING_TEXTURE, generator: true
    }
  ]

  var PAL = {
    A: 'gtceu:stable_machine_casing', L: 'gtceu:laminated_glass', P: 'gtceu:tungstensteel_pipe_casing',
    C: COIL, B: 'gtceu:tungstensteel_gearbox', Q: 'tungsten_steel'
  }

  function abs(n) { return n < 0 ? -n : n }
  function cheb(a, b) { return abs(a) > abs(b) ? abs(a) : abs(b) }

  // the probe bay: a framed hall (floor row of parts, glazed courses, a mast on the roof) with a drop rail down the middle, a coil gate on it
  // and a winch over the gate
  function bayFn() {
    var w = 9
    var d = 9
    var hh = 5
    var cx = 4
    var cz = 4
    return function (x, y, z) {
      var ex = x === 0 || x === w - 1
      var ez = z === 0 || z === d - 1
      var dx = x - cx
      var dz = z - cz
      if (y >= hh) {
        var k = y - hh
        if (z !== cz || k >= 2) return ' '
        if (dx === 0) return k === 1 ? 'C' : 'Q'
        return k === 0 && abs(dx) <= 2 ? 'Q' : ' '
      }
      if (y === 0) return ex && ez ? 'Q' : 'X'
      var top = y === hh - 1
      if (!(ex || ez || top)) {
        if (dx === 0 && y === 1 && abs(dz) <= 2) return dz === 0 ? 'C' : 'P'
        if (dx === 0 && dz === 0 && y === 3) return 'B'
        if (abs(dx) === 2 && abs(dz) === 2 && y <= 3) return 'Q'
        return '#'
      }
      if (ex && ez) return 'Q'
      if (top) return (ex || ez) ? 'A' : ((x + z) % 3 === 0 ? 'L' : 'F')
      if (y === 1) return 'A'
      return (ez ? x : z) % 2 === 0 ? 'F' : 'L'
    }
  }

  // the Penrose engine: a round hall, a shaft down the middle, a coil catch ring around it at mid height and a rail from the front to the ring
  function engineFn() {
    var w = 13
    var h = 9
    var c = 6
    return function (x, y, z) {
      var dx = x - c
      var dz = z - c
      var r = Math.sqrt(dx * dx + dz * dz)
      if (r > 6.4) return ' '
      if (y === 0) return 'X'
      var wall = r >= 5.5
      if (y === h - 1) {
        if (wall) return 'A'
        if (r >= 3.5) return 'L'
        return ' '
      }
      if (wall) {
        if (y === 1 || y === h - 2) return 'A'
        return ((x * 3 + z * 5) % 4 === 0) ? 'F' : 'L'
      }
      if (dx === 0 && dz === 0) return 'P'
      if (y === 4 && r >= 3.5 && r < 4.5) return 'C'
      if (y === 4 && dx === 0 && dz >= 2) return 'P'
      if (y === 2 && r >= 2.5 && r < 3.5 && cheb(dx, dz) === 2) return 'B'
      return '#'
    }
  }

  function spec(m) {
    var o = { w: m.width, h: m.height, d: m.depth, pal: {}, parts: m.parts.map(function (p) { return Pat.part(p[0], { min: p[1], max: p[2] }) }) }
    Object.keys(PAL).forEach(function (k) { o.pal[k] = PAL[k] })
    o.pal.F = m.casing
    o.fn = m.name === 'penrose_engine' ? engineFn() : bayFn()
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
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.2')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
