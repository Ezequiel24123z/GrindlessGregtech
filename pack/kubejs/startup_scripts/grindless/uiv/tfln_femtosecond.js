// priority: -9314
// -----------------------------------------------------------------------------------------------
// UIV's TFLN fab and femtosecond writer (docs/eras/uiv.md, machines 3 and 4, lines 10, 12, 18, 36 and 40; package UIV-A4): the two machines,
// their recipe types, the package's own items and three fluids. The recipes come from data/grindless/tables/tfln_femtosecond.json
// (server_scripts/grindless/uiv/tfln_femtosecond.js).
//
//   gtceu:tfln_fab             7 x 5 x 7 in grindless:photonic_casing, UIV (31,457,280 EU/t). The only maker of LN-on-Si3N4 wafers, Si-28 SOI
//                              wafers, poled LNOI and the EO microcomb. Recipe type gtceu:ion_slicing (circuits 1 to 4).
//   gtceu:femtosecond_writer   5 x 5 x 7, UEV (7,864,320 EU/t). Writes interposers, 2PP lattices, orifice plates and 5D-crystal blanks.
//                              Recipe type gtceu:femtosecond_writing (circuits 1 to 4). Its air-bearing casing is not registered in the
//                              pack yet: it uses gtceu:uev_machine_casing until a dedicated casing exists.
//
// New ids: the items below (grindless:) and the fluids gtceu:spent_koh_etchant, gtceu:photoresin and gtceu:uncured_photoresin.
// Textures: tools/assets/Build-UIVTflnFemtosecondTextures.ps1. Names: client_scripts/grindless/uiv_tfln_femtosecond_lang.js.
// Published for the recipe script: global.grindless.tflnFemtosecond.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const TF = G.tflnFemtosecond || (G.tflnFemtosecond = {})
  const LOG = '[grindless/uiv] '

  const PHOTONIC = 'grindless:photonic_casing'
  const PHOTONIC_TEXTURE = 'grindless:block/uev/photonic_casing'
  const UEV = 'gtceu:uev_machine_casing'
  const UEV_TEXTURE = 'gtceu:block/casings/voltage/uev/side'

  TF.table = 'kubejs/data/grindless/tables/tfln_femtosecond.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  TF.items = {
    ln_on_sin_wafer: { stack: 16 },
    ln_on_sin_thinned: { stack: 16 },
    eo_transceiver: { stack: 16 },
    si28_soi_wafer: { stack: 16 },
    si28_donor_wafer: { stack: 16 },
    poled_lnoi_wafer: { stack: 16 },
    written_interposer_blank: { stack: 16 },
    etched_interposer_blank: { stack: 16 },
    glass_interposer: { stack: 16 },
    trenched_oxide_wafer: { stack: 16 },
    damascene_sin_wafer: { stack: 16 },
    annealed_damascene_ring: { stack: 16 },
    ppln_waveguide: { stack: 32 },
    shg_486_stage: { stack: 16 },
    lattice_2pp: { stack: 32 },
    orifice_plate: { stack: 32 },
    silica_storage_preform: { stack: 16 },
    written_crystal_blank: { stack: 16 },
    verified_crystal: { stack: 16 }
  }

  TF.fluids = {
    'gtceu:spent_koh_etchant': { form: 'liquid', colour: 0xB8C89A, formula: 'KOH(aq)' },
    'gtceu:photoresin': { form: 'liquid', colour: 0xE8B84A, formula: 'PR' },
    'gtceu:uncured_photoresin': { form: 'liquid', colour: 0xC89A3A, formula: 'PR(u)' }
  }

  // items in include the programmed circuit
  TF.machines = [
    {
      name: 'tfln_fab', machine: 'gtceu:tfln_fab', type: 'ion_slicing', dataKey: 'grindless_ion_slicing', lang: 'TFLN Fab',
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
      width: 7, height: 5, depth: 7, casing: PHOTONIC, texture: PHOTONIC_TEXTURE
    },
    {
      name: 'femtosecond_writer', machine: 'gtceu:femtosecond_writer', type: 'femtosecond_writing', dataKey: 'grindless_femtosecond_writing',
      lang: 'Femtosecond Writer',
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
      width: 5, height: 5, depth: 7, casing: UEV, texture: UEV_TEXTURE
    }
  ]

  // TFLN fab: a cleanroom hall with process bays; femtosecond writer: a long beamline (uiv/shapes.js). Built in the machine registry
  // callback: shapes.js may load after this file. The floor row (X) takes the parts.
  function spec(m) {
    return G.uivShapes.build(Pat, m.name, m.casing, [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 0, max: 1 }),
      Pat.part('output_hatch', { min: 0, max: 1 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ])
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
    Object.keys(TF.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(TF.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(TF.fluids).forEach(function (key) {
      var s = TF.fluids[key]
      var material = event.create(key)
      material.liquid()
      material.color(s.colour).formula(s.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    TF.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    TF.machines.forEach(function (m) {
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
