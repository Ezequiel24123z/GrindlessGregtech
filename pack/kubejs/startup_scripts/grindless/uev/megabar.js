// priority: -7582
// -----------------------------------------------------------------------------------------------
// UEV's megabar press (docs/eras/uev.md, machine 5, lines 7, 8 and 9; package UEV-A3): the multi-anvil press, its recipe type and the
// package's own items. The recipes come from data/grindless/tables/megabar.json (server_scripts/grindless/uev/megabar.js).
//
//   gtceu:megabar_press       a 9 x 9 x 9 multi-anvil press (tungstensteel casing). The only maker of (La,Y)H10 superhydride
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

  const ROBUST = 'grindless:sic_composite_casing'
  const ROBUST_TEXTURE = 'grindless:block/uev/sic_composite_casing'

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
    width: 15, height: 15, depth: 15
  }

  // A cubic multi-anvil frame (15 x 15 x 15): four 2 x 2 SiC posts joined by HfTaCN beams, six pipe rams reaching in from the six
  // faces of a central pressure vessel, laser ports (glass) on the diagonals and a SiC control booth at the front.
  function pressCell() {
    var s = G.uevShapes.scene(15, 15, 15)
    s.box(0, 0, 0, 14, 0, 14, 'X')
    ;[[0, 0], [13, 0], [0, 13], [13, 13]].forEach(function (p) {
      s.box(p[0], 1, p[1], p[0] + 1, 14, p[1] + 1, 'R')
    })
    ;[1, 13].forEach(function (y) {
      var t = y === 1 ? 0 : 1
      s.box(2, y, 0, 12, y + t, 1, 'H').box(2, y, 13, 12, y + t, 14, 'H')
      s.box(0, y, 2, 1, y + t, 12, 'H').box(13, y, 2, 14, y + t, 12, 'H')
    })
    s.cyl('y', 7, 7, 3, 5, 9, 'H', true)
    s.box(5, 5, 5, 9, 9, 9, 'M', true)
    s.box(6, 6, 6, 8, 8, 8, '#')
    s.box(2, 7, 7, 4, 7, 7, 'P').box(10, 7, 7, 12, 7, 7, 'P')
    s.box(7, 7, 2, 7, 7, 4, 'P').box(7, 7, 10, 7, 7, 12, 'P')
    s.box(7, 10, 7, 7, 12, 7, 'P').box(7, 2, 7, 7, 4, 7, 'P')
    s.box(6, 12, 6, 8, 12, 8, 'B').box(6, 2, 6, 8, 2, 8, 'B')
    s.set(3, 7, 7, 'C').set(11, 7, 7, 'C').set(7, 7, 3, 'C').set(7, 7, 11, 'C')
    ;[[4, 4], [10, 4], [4, 10], [10, 10]].forEach(function (p) { s.set(p[0], 7, p[1], 'L') })
    return s.booth('R', 3).fn()
  }

  function makeSpec(m) {
    return G.uevShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, fn: pressCell(),
      // bootstrap: the press makes the LaH10 of the superhydride magnet casing, so its field bands are HfTaCN lining
      pal: G.uevShapes.palette(ROBUST, { M: G.uevShapes.family.H }),
      parts: [
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 0, max: 1 }),
        Pat.part('output_hatch', { min: 0, max: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        G.parallelHatch.part()
      ]
    })
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
    m.spec = makeSpec(m)
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
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.megabar_synthesis')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ])
      .workableCasingModel(ROBUST_TEXTURE, 'grindless:block/multiblock/megabar_press')
  })
})()
