// priority: -7606
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
    width: 9, height: 9, depth: 9
  }

  // A four-post press frame (9 x 9 x 9): a plinth (X: casing or a part) under the lower anvil (B) and a glass-caged press chamber; the
  // upper anvil hangs from a crosshead (F ring, P beams, C coil) with the ram (P) on top; S is the controller on the front console (A).
  function pressCell(x, y, z) {
    var dx = x - 4
    var dz = z - 4
    var m = G.uevShapes.cheb(dx, dz)
    var ax = dx < 0 ? -dx : dx
    var az = dz < 0 ? -dz : dz
    var post = ax === 3 && az === 3
    if (y === 0) return m <= 3 || (z === 8 && ax <= 1) ? 'X' : ' '
    if (z === 8) return y === 1 && ax <= 1 ? 'A' : ' '
    if (post) return y === 1 ? 'A' : (y === 7 ? 'Q' : (y === 8 ? 'P' : 'Q'))
    if (y === 1) return m <= 1 ? 'B' : (m === 2 ? 'A' : (m === 3 ? 'F' : ' '))
    if (y === 2) return m <= 1 ? 'B' : ' '
    if (y >= 3 && y <= 5) {
      if (m <= 1) return '#'
      if (m === 2 && (ax <= 1 || az <= 1)) return 'L'
      if (m === 3 && (ax === 0 || az === 0) && y === 4) return 'P'
      return ' '
    }
    if (y === 6) return m <= 1 ? 'B' : (m === 2 && (ax === 0 || az === 0) ? 'F' : ' ')
    if (y === 7) {
      if (m === 3) return 'F'
      if (m === 0) return 'C'
      return ax === 0 || az === 0 ? 'P' : ' '
    }
    return m === 0 ? 'P' : ' '
  }

  function makeSpec(m) {
    return G.uevShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, fn: pressCell,
      pal: {
        F: ROBUST, A: 'gtceu:stable_machine_casing', B: 'gtceu:tungstensteel_gearbox', L: 'gtceu:laminated_glass',
        P: 'gtceu:tungstensteel_pipe_casing', C: 'gtceu:naquadah_coil_block', Q: 'tungsten_steel'
      },
      parts: [
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 0, max: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 })
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
        Text.translate('grindless.machine.megabar_press.tooltip.1'),
        Text.translate('grindless.machine.megabar_press.tooltip.2')
      ])
      .workableCasingModel(ROBUST_TEXTURE, 'grindless:block/multiblock/megabar_press')
  })
})()
