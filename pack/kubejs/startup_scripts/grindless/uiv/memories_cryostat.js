// priority: -9215
// -----------------------------------------------------------------------------------------------
// UIV's spectral hole burner and millikelvin cryostat works (docs/eras/uiv.md, machines 6 and 8, lines 11, 15, 16, 42 and 44; package UIV-A6):
// the machines, their recipe types and the package's own items. The recipes come from data/grindless/tables/memories_cryostat.json
// (server_scripts/grindless/uiv/memories_cryostat.js).
//
//   gtceu:spectral_hole_burner   5 x 5 x 5 in grindless:cryostat_casing, UIV (31,457,280 EU/t). Burns atomic-frequency combs into rare-earth
//                                YSO slabs held in superfluid helium. Recipe type gtceu:spectral_hole_burning (circuit 1 six-hour
//                                memory slab, 2 telecom memory slab).
//   gtceu:millikelvin_cryostat_works   5 x 7 x 5 in cryostat casing with a belt of grindless:metallic_hydrogen_coil_block, UIV. Recipe type
//                                gtceu:nuclear_demagnetisation (circuit 1 nuclear stage, 2 mK cryostat module, 3 characterised P:Si processor).
//
// New ids: the items below (grindless:) and the fluids gtceu:he3_he4_mixture and gtceu:erbium_chloride_solution. Textures: tools/assets/Build-UIVMemoriesCryostatTextures.ps1.
// Names: client_scripts/grindless/uiv_memories_cryostat_lang.js. Published for the recipe script: global.grindless.memoriesCryostat.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MC = G.memoriesCryostat || (G.memoriesCryostat = {})
  const LOG = '[grindless/uiv] '

  const CRYO = 'grindless:cryostat_casing'
  const CRYO_TEXTURE = 'grindless:block/zpm/cryostat_casing'

  MC.table = 'kubejs/data/grindless/tables/memories_cryostat.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  MC.items = {
    eu151_yso_boule: { stack: 16 },
    er_yso_boule: { stack: 16 },
    eu151_yso_slab: { stack: 32 },
    er_yso_slab: { stack: 32 },
    six_hour_memory_slab: { stack: 16 },
    telecom_memory_slab: { stack: 16 },
    six_hour_memory: { stack: 16 },
    nuclear_stage: { stack: 16 },
    cold_plate: { stack: 32 },
    p_si_processor: { stack: 16 },
    er_preform: { stack: 16 },
    er_fibre: { stack: 32 },
    er_fibre_coil: { stack: 16 },
    pumped_edfa: { stack: 16 }
  }

  MC.fluids = {
    'gtceu:he3_he4_mixture': { colour: 0xC8E8F8, formula: '3He/4He' },
    'gtceu:erbium_chloride_solution': { colour: 0xF0A8C0, formula: 'ErCl3(aq)' }
  }

  // items in include the programmed circuit
  MC.machines = [
    {
      name: 'spectral_hole_burner', machine: 'gtceu:spectral_hole_burner', type: 'spectral_hole_burning', dataKey: 'grindless_spectral_hole_burning',
      lang: 'Spectral Hole Burner',
      maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 },
      width: 5, height: 5, depth: 5, casing: CRYO, texture: CRYO_TEXTURE, magnet: null
    },
    {
      name: 'millikelvin_cryostat_works', machine: 'gtceu:millikelvin_cryostat_works', type: 'nuclear_demagnetisation', dataKey: 'grindless_nuclear_demagnetisation',
      lang: 'Millikelvin Cryostat Works',
      maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 },
      width: 5, height: 7, depth: 5, casing: CRYO, texture: CRYO_TEXTURE, magnet: 'grindless:metallic_hydrogen_coil_block'
    }
  ]

  // A hollow box: casing on every face, the floor row (X) takes the parts, S is the controller (front wall, row 1, middle), # is air;
  // a machine with a magnet has a belt of it on row 3 of the side walls (M)
  function spec(m) {
    var slices = []
    var last = m.depth - 1
    var mid = (m.width - 1) / 2
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var row = ''
        for (var c = 0; c < m.width; c++) {
          var edge = si === 0 || si === last || c === 0 || c === m.width - 1
          var ch
          if (r === m.height - 1) ch = 'F'
          else if (edge) ch = (si === last && r === 1 && c === mid) ? 'S' : ((m.magnet && r === 3) ? 'M' : 'F')
          else if (r === 0) ch = 'X'
          else ch = '#'
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    var symbols = {
      S: Pat.controller(),
      X: Pat.oneOf.apply(null, [Pat.block(m.casing)].concat([
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 0, max: 1 }),
        Pat.part('output_hatch', { min: 0, max: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 })
      ])),
      F: Pat.block(m.casing),
      '#': Pat.air()
    }
    if (m.magnet) symbols.M = Pat.block(m.magnet)
    return { slices: slices, symbols: symbols }
  }
  MC.machines.forEach(function (m) { m.spec = spec(m) })

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
    Object.keys(MC.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(MC.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MC.fluids).forEach(function (key) {
      var s = MC.fluids[key]
      var material = event.create(key)
      material.liquid()
      material.color(s.colour).formula(s.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    MC.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MC.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
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
