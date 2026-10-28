// priority: -7493
// -----------------------------------------------------------------------------------------------
// UEV's magnets and composites (docs/eras/uev.md, machines 8-10, lines 14-17 and 35; package UEV-A5): the nitride magnet works, the SiC fibre
// plant and the CVI furnace, their recipe types, the package's own items and the few GT materials GTM does not have. The recipes come from
// data/grindless/tables/composites.json (server_scripts/grindless/uev/composites.js).
//
//   gtceu:nitride_magnet_works   gtceu:nitride_magnet_synthesis   circuit 1 reduced iron powder + NH3 -> Fe16N2 powder (the only maker of
//                                gtceu:fe16n2_dust), 2 strain anneal, 3 bonded magnet (the polymer binder). The H2 goes on to the ZPM pyrolyser.
//   gtceu:sic_fibre_plant        gtceu:sic_fibre_spinning         circuit 1 polycarbosilane -> green fibre, 2 e-beam cure, 3 pyrolysis to SiC
//                                fibre (CH4 and H2 go to the ZPM pyrolyser). Refuses to void fluids.
//   gtceu:cvi_furnace            gtceu:chemical_vapour_infiltration   circuit 1 SiC preform + MTS -> grindless:sic_sic_plate (its only maker;
//                                the HCl goes to EV's extraction cascade), 2 W-fibre preform + WF6 -> grindless:wf_w_tile (the HF goes to the IV
//                                fluorspar kiln). Refuses to void fluids.
//
// F1's ids (uev/foundation.js) are not registered again. Geometry (lib/patterns.js): 5 wide x 5 high x 5 deep hollow shells.
// Textures: tools/assets/Build-UEVCompositesTextures.ps1. Names: client_scripts/grindless/uev_composites_lang.js.
// Published for the recipe script: global.grindless.composites.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const CO = G.composites || (G.composites = {})
  const LOG = '[grindless/uev] '

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const HEAT = 'gtceu:heatproof_machine_casing'
  const HEAT_TEXTURE = 'gtceu:block/casings/solid/machine_casing_heatproof'

  CO.table = 'kubejs/data/grindless/tables/composites.json'
  CO.noVoiding = 'grindless.machine.composites.no_voiding'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  CO.items = {
    tantalum_pentoxide_dust: { stack: 64 },
    hftac_blend_dust: { stack: 64 },
    hftac_dust: { stack: 64 },
    hftacn_crude_dust: { stack: 64 },
    hftacn_powder: { stack: 64 },
    hftacn_heating_element: { stack: 64 },
    carbonyl_iron_powder: { stack: 64 },
    reduced_iron_powder: { stack: 64 },
    strain_annealed_fe16n2_powder: { stack: 64 },
    polydimethylsilane_dust: { stack: 64 },
    polycarbosilane_dust: { stack: 64 },
    green_sic_fibre: { stack: 64 },
    cured_sic_fibre: { stack: 64 },
    sic_fibre: { stack: 64 },
    bn_coated_sic_fibre: { stack: 64 },
    sic_fibre_preform: { stack: 16 },
    coated_w_wire: { stack: 64 },
    w_fibre_preform: { stack: 16 },
    ffkm_seal: { stack: 64 }
  }

  // GT materials GTM does not have (checked against the native dump): name -> form, colour, formula
  CO.materials = {
    methyltrichlorosilane: { form: 'liquid', colour: 0xC8D8E8, formula: 'CH3SiCl3' },
    tungsten_hexafluoride: { form: 'gas', colour: 0xD8C8E0, formula: 'WF6' },
    chlorodifluoromethane: { form: 'gas', colour: 0xE0F0E0, formula: 'CHClF2' },
    pmve: { form: 'liquid', colour: 0xE8E8C8, formula: 'C3F6O' }
  }

  CO.machines = {
    works: {
      name: 'nitride_magnet_works', machine: 'gtceu:nitride_magnet_works', type: 'nitride_magnet_synthesis',
      dataKey: 'grindless_nitride_magnet_synthesis', lang: 'Nitride Magnet Works',
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 }, width: 5, height: 5, depth: 5
    },
    fibre: {
      name: 'sic_fibre_plant', machine: 'gtceu:sic_fibre_plant', type: 'sic_fibre_spinning',
      dataKey: 'grindless_sic_fibre_spinning', lang: 'SiC Fibre Plant',
      maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 2 }, width: 5, height: 5, depth: 5
    },
    cvi: {
      name: 'cvi_furnace', machine: 'gtceu:cvi_furnace', type: 'chemical_vapour_infiltration',
      dataKey: 'grindless_chemical_vapour_infiltration', lang: 'CVI Furnace',
      maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 2, fluidsOut: 2 }, width: 5, height: 5, depth: 5
    }
  }

  // A hollow shell: row 0 (X) takes the parts, the top row and the walls are casing (F), S is the controller (front wall, row 1, middle).
  function shell(m) {
    var slices = []
    var last = m.depth - 1
    var mid = (m.width - 1) / 2
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var row = ''
        for (var c = 0; c < m.width; c++) {
          var ch
          var isWall = si === 0 || si === last || c === 0 || c === m.width - 1
          if (r === 0) ch = 'X'
          else if (r === m.height - 1) ch = 'F'
          else if (si === last && r === 1 && c === mid) ch = 'S'
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

  function specOf(m, casing, parts) {
    return {
      slices: shell(m),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, [Pat.block(casing)].concat(parts)),
        F: Pat.block(casing),
        '#': Pat.air()
      }
    }
  }
  function parts(fluidIn, fluidOut) {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: fluidIn, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 1 }),
      Pat.part('output_hatch', { min: fluidOut, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ]
  }
  CO.machines.works.spec = specOf(CO.machines.works, HEAT, parts(0, 0))
  CO.machines.fibre.spec = specOf(CO.machines.fibre, CLEAN, parts(0, 1))
  CO.machines.cvi.spec = specOf(CO.machines.cvi, HEAT, parts(1, 1))

  // one EMI line per recipe, read from its data: what the circuit does
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
    Object.keys(CO.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(CO.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(CO.materials).forEach(function (name) {
      var spec = CO.materials[name]
      var material = event.create(name)
      if (spec.form === 'gas') material.gas()
      else material.liquid()
      material.color(spec.colour).formula(spec.formula)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var sounds = { works: GTSoundEntries.CHEMICAL, fibre: GTSoundEntries.ASSEMBLER, cvi: GTSoundEntries.FURNACE }
    Object.keys(CO.machines).forEach(function (k) {
      var m = CO.machines[k]
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(sounds[k])
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var casings = { works: [HEAT, HEAT_TEXTURE], fibre: [CLEAN, CLEAN_TEXTURE], cvi: [HEAT, HEAT_TEXTURE] }
    Object.keys(CO.machines).forEach(function (k) {
      var m = CO.machines[k]
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      Pat.register(m.machine, m.spec)
      var casing = casings[k][0]
      var builder = event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
      // the works lets its N2 go; the plant and the furnace hold HCl, HF, CH4 and H2 that have somewhere to go
      if (k === 'works') {
        builder.recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      } else {
        var opts = { which: 'fluids', reason: CO.noVoiding, name: m.name }
        builder.recipeModifier(G.noVoiding.modifier(opts, G.parallelHatch.overclock), true)
          .beforeWorking(G.noVoiding.beforeWorking(opts))
      }
      builder
        .appearanceBlock(function () { return Block.getBlock(casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('grindless.machine.composites.tooltip.parts')
        ])
        .workableCasingModel(casings[k][1], 'grindless:block/multiblock/' + m.name)
    })
  })
})()
