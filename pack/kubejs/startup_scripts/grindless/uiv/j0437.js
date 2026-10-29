// priority: -9172
// -----------------------------------------------------------------------------------------------
// UIV's PSR J0437-4715 machines (docs/eras/uiv.md, machines 18 to 20, lines 34, 38 and 45; package UIV-B3): the machines, their recipe types,
// the package's own items and the pair-plasma fluids. The recipes come from data/grindless/tables/j0437.json
// (server_scripts/grindless/uiv/j0437.js); every one of them runs only at grindless:psr_j0437_orbit.
//
//   gtceu:pulsar_wind_trap            9 x 9 x 9 in UIV casing, side walls lined with metallic hydrogen coil blocks and tungsten blocks, UIV
//                                     (31,457,280 EU/t). Recipe type gtceu:pulsar_wind_trapping (circuit 1 pair plasma, the coil block kept).
//   gtceu:positronium_condensate_lab  7 x 5 x 7 in cryostat casing, UIV. Recipe type gtceu:positronium_condensation (circuit 1 Ps in
//                                     aerogel, 2 laser-cooled Ps, 3 gamma laser cavity).
//   gtceu:xray_pulse_profiler         7 x 7 x 5 in UIV casing, UIV. Recipe type gtceu:xray_pulse_profiling (circuit 1 raw J0437 profile,
//                                     2 navigation solution).
//
// The contract's sizes are kept (they are marked tune). New ids: the items below (grindless:) and the gases gtceu:pair_plasma,
// gtceu:wind_electrons, gtceu:neon_6n and gtceu:purified_neon. Textures: tools/assets/Build-UIVJ0437Textures.ps1.
// Names: client_scripts/grindless/uiv_j0437_lang.js. Published for the recipe script: global.grindless.j0437.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const J = G.j0437 || (G.j0437 = {})
  const LOG = '[grindless/uiv] '

  const CASING = 'gtceu:uiv_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/voltage/uiv/side'
  const CRYO = 'grindless:cryostat_casing'
  const CRYO_TEXTURE = 'grindless:block/zpm/cryostat_casing'
  const COIL = 'grindless:metallic_hydrogen_coil_block'
  const LINING = 'gtceu:tungsten_block'

  J.table = 'kubejs/data/grindless/tables/j0437.json'
  J.site = 'grindless:psr_j0437_orbit'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  J.items = {
    cooled_positron_bunch: { stack: 16 },
    ps_converter_aerogel: { stack: 16 },
    ps_in_aerogel: { stack: 16 },
    laser_cooled_ps: { stack: 16 },
    ps_bec: { stack: 16 },
    gamma_laser_cavity: { stack: 16 },
    c12_hpht_plate: { stack: 16 },
    c12_004_plate: { stack: 16 },
    c12_ion_milled_plate: { stack: 16 },
    gamma_bragg_mirror: { stack: 16 },
    solid_neon_cone: { stack: 16 },
    annealed_neon_cone: { stack: 16 },
    neon_moderator_cartridge: { stack: 16 }
  }

  J.fluids = {
    'gtceu:pair_plasma': { colour: 0xE8A0F8, formula: 'e-/e+' },
    'gtceu:wind_electrons': { colour: 0x90B8FF, formula: 'e-' },
    'gtceu:neon_6n': { colour: 0xFF9060, formula: 'Ne' },
    'gtceu:purified_neon': { colour: 0xFFA878, formula: 'Ne' }
  }

  // items in include the programmed circuit and the kept catalyst
  J.machines = [
    {
      name: 'pulsar_wind_trap', machine: 'gtceu:pulsar_wind_trap', type: 'pulsar_wind_trapping', dataKey: 'grindless_pulsar_wind_trapping',
      lang: 'Pulsar Wind Trap',
      maxIO: { itemsIn: 2, itemsOut: 0, fluidsIn: 0, fluidsOut: 2 },
      width: 9, height: 9, depth: 9, casing: CASING, texture: CASING_TEXTURE,
      rings: [COIL, COIL, LINING, LINING, COIL, COIL],
      parts: [['input_bus', 1, 1], ['output_hatch', 1, 2], ['energy_input', 1, 2]]
    },
    {
      name: 'positronium_condensate_lab', machine: 'gtceu:positronium_condensate_lab', type: 'positronium_condensation',
      dataKey: 'grindless_positronium_condensation',
      lang: 'Positronium Condensate Lab',
      maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      width: 7, height: 5, depth: 7, casing: CRYO, texture: CRYO_TEXTURE, rings: [],
      parts: [['input_bus', 1, 2], ['output_bus', 1, 1], ['energy_input', 1, 2]]
    },
    {
      name: 'xray_pulse_profiler', machine: 'gtceu:xray_pulse_profiler', type: 'xray_pulse_profiling', dataKey: 'grindless_xray_pulse_profiling',
      lang: 'X-ray Pulse Profiler',
      maxIO: { itemsIn: 6, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      width: 7, height: 7, depth: 5, casing: CASING, texture: CASING_TEXTURE, rings: [],
      parts: [['input_bus', 1, 2], ['output_bus', 1, 1], ['energy_input', 1, 2]]
    }
  ]

  // The PSR J0437 machines (uiv/shapes.js): a magnetic torus, a trap hall, an undulator. Built in the machine registry callback: shapes.js may
  // load after this file. The floor row (X) takes the parts.
  function spec(m) {
    return G.uivShapes.build(Pat, m.name, m.casing, m.parts.map(function (p) { return Pat.part(p[0], { min: p[1], max: p[2] }) }))
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
    Object.keys(J.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(J.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(J.fluids).forEach(function (key) {
      var s = J.fluids[key]
      var material = event.create(key)
      material.gas()
      material.color(s.colour).formula(s.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    J.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    J.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
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
