// priority: -9183
// -----------------------------------------------------------------------------------------------
// UIV's levitation melter (docs/eras/uiv.md, machine 2, lines 2, 4, 5, 7, 8, 9 and 39; package UIV-A3): the machine, its recipe type and the
// package's own items. The recipes come from data/grindless/tables/levitation_melter.json (server_scripts/grindless/uiv/levitation_melter.js).
//
//   gtceu:levitation_melter   a 7 x 7 x 9 box, UEV (7,864,320 EU/t): the melt floats in a cold-crucible coil and never touches a wall. The only
//                             maker of the WMoNbTaHf RHEA ingot, the Wf/RHEA billet, melted Ti-50, the Zr-Ti-Cu-Ni-Be glass and PrNi5.
//   gtceu:levitation_melting  its recipe type (EU in). Circuit 1 RHEA, 2 Wf/RHEA, 3 Ti-50, 4 bulk metallic glass, 5 PrNi5.
//
// The melts run under helium. The oxide dross of every melt goes to EV's extraction cascade; the beryllium fume of the glass is captured as BeO
// (contained) and electrolysed back to metal.
//
// New ids: the items below (grindless:). The F1 ids (RHEA, Wf/RHEA, Ti-50, the glass, PrNi5, the coil block, the sled charge) are in
// uiv/foundation.js. Textures: tools/assets/Build-UIVLevitationMelterTextures.ps1. Names: client_scripts/grindless/uiv_levitation_melter_lang.js.
// Published for the recipe script: global.grindless.levitationMelter.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const LM = G.levitationMelter || (G.levitationMelter = {})
  const LOG = '[grindless/uiv] '

  const CASING = 'gtceu:uev_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/voltage/uev/side'
  const COIL = 'grindless:hftacn_coil_block'

  LM.table = 'kubejs/data/grindless/tables/levitation_melter.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  LM.items = {
    melter_dross: { stack: 64 },
    nb_ta_button: { stack: 64 },
    densified_w_preform: { stack: 16 },
    zr_master_alloy: { stack: 64 },
    beryllium_oxide_dust: { stack: 64 },
    rhea_slab: { stack: 16 },
    rhea_former: { stack: 16 },
    wound_rhea_former: { stack: 16 },
    impregnated_mh_coil: { stack: 16 },
    rhea_cased_charge: { stack: 16 },
    halbach_array: { stack: 16 },
    rhea_cased_halbach: { stack: 16 },
    potted_mh_stator: { stack: 16 },
    maglev_stator: { stack: 16 }
  }

  LM.machine = {
    name: 'levitation_melter',
    machine: 'gtceu:levitation_melter',
    type: 'levitation_melting',
    dataKey: 'grindless_levitation_melting',
    lang: 'Levitation Melter',
    // items in: up to four feeds plus the circuit; out: the product, the BeO and the dross; one helium in
    maxIO: { itemsIn: 5, itemsOut: 3, fluidsIn: 1, fluidsOut: 1 },
    width: 7, height: 7, depth: 9
  }

  // An induction tower (uiv/shapes.js): a base hall under a glazed tube banded by levitation coils, the crucible on its axis. Built in the
  // machine registry callback: shapes.js may load after this file. Row 0 (X) takes the parts.
  function spec(m) {
    return G.uivShapes.build(Pat, m.name, CASING, [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 1 }),
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
    Object.keys(LM.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(LM.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var m = LM.machine
    event.create(m.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARC_FURNACE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var m = LM.machine
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
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, m.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.levitation_melter.tooltip.0'),
        Text.translate('grindless.machine.levitation_melter.tooltip.1'),
        Text.translate('grindless.machine.levitation_melter.tooltip.2')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/levitation_melter')
  })
})()
