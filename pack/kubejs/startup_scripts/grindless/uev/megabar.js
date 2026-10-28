// priority: -7587
// -----------------------------------------------------------------------------------------------
// UEV's megabar press (docs/eras/uev.md, machine 5, lines 7, 8 and 9; package UEV-A3): the multi-anvil press, its recipe type and the
// package's own items. The recipes come from data/grindless/tables/megabar.json (server_scripts/grindless/uev/megabar.js).
//
//   gtceu:megabar_press       a 7 x 7 x 7 multi-anvil press (tungstensteel casing). The only maker of (La,Y)H10 superhydride
//                             (gtceu:lay_superhydride_ingot) and of nanotwinned diamond. Its anvils wear.
//   gtceu:megabar_synthesis   its recipe type (EU in). Circuit 1 superhydride (La-Y foil + pressed ammonia borane charge, a nanotwinned
//                             diamond anvil that wears); circuit 2 nanotwinned diamond (a pellet of onion carbon).
//
// Fiction, named as such in EMI and the quest: real (La,Y)H10 only exists above about 100 GPa and falls apart on release; here the
// press "quenches" it, so the ingot survives at one atmosphere. The hydrogen the charge gives up is not lost: it is voidable and goes
// to the network's hydrogen stock.
//
// New ids: the items below (grindless:). The F1 ones (gtceu:lay_superhydride, gtceu:ammonia_borane) are in uev/foundation.js.
// Textures: tools/assets/Build-UEVMegabarTextures.ps1. Names: client_scripts/grindless/uev_megabar_lang.js.
// Published for the recipe script: global.grindless.megabar.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MB = G.megabar || (G.megabar = {})
  const LOG = '[grindless/uev] '

  const ROBUST = 'gtceu:robust_machine_casing'
  const ROBUST_TEXTURE = 'gtceu:block/casings/solid/machine_casing_robust_tungstensteel'

  MB.table = 'kubejs/data/grindless/tables/megabar.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  MB.items = {
    la_y_alloy_ingot: { stack: 64 },
    la_y_foil: { stack: 64 },
    trimethyl_borate_ampoule: { stack: 16 },
    sodium_hydride_dust: { stack: 64 },
    sodium_borohydride_dust: { stack: 64 },
    sodium_methoxide_dust: { stack: 64 },
    ammonia_borane_charge: { stack: 64 },
    nanodiamond_dust: { stack: 64 },
    nanodiamond_pellet: { stack: 64 },
    nanotwinned_diamond: { stack: 64 },
    nanotwinned_diamond_anvil: { stack: 4 },
    nanotwinned_diamond_bit: { stack: 16 }
  }

  MB.machine = {
    name: 'megabar_press',
    machine: 'gtceu:megabar_press',
    type: 'megabar_synthesis',
    dataKey: 'grindless_megabar',
    lang: 'Megabar Press',
    // items in: the foil, the charge, the anvil and the circuit; out: the ingot; fluid out: the hydrogen
    maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
    width: 7, height: 7, depth: 7
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

  MB.machine.spec = {
    slices: shell(MB.machine),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf.apply(null, [Pat.block(ROBUST)].concat([
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 0, max: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 })
      ])),
      F: Pat.block(ROBUST),
      '#': Pat.air()
    }
  }

  // one EMI line per recipe, read from its data: what the circuit does (and the named fiction)
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
    Object.keys(MB.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(MB.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var m = MB.machine
    event.create(m.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_COMPRESS, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.MOTOR)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var m = MB.machine
    var type = GTRecipeTypes.get(m.type)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
    type.addDataInfo(infoOf(m.dataKey))
    Pat.register(m.machine, m.spec)

    event.create(m.name, 'multiblock')
      .langValue(m.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(m.type)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(ROBUST) })
      .pattern(function (def) { return Pat.build(def, m.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.megabar_press.tooltip.0'),
        Text.translate('grindless.machine.megabar_press.tooltip.1'),
        Text.translate('grindless.machine.megabar_press.tooltip.2')
      ])
      .workableCasingModel(ROBUST_TEXTURE, 'grindless:block/multiblock/megabar_press')
  })
})()
