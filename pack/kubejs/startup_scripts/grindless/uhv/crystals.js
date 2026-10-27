// priority: -7800
// -----------------------------------------------------------------------------------------------
// UHV's clock and crystals (docs/eras/uhv.md, machines 3 and 4, lines 3, 5, 7, 8 and 9; package UHV-A2): the nuclear clock lab and the
// crystal growth furnace, their recipe types, and the package's own items. The recipes come from data/grindless/tables/crystals.json
// (server_scripts/grindless/uhv/crystals.js).
//
//   gtceu:nuclear_clock_lab        JILA's 2024 nuclear clock: a VUV frequency comb locked to the 8.4 eV isomer of thorium-229 in a
//                                  Th:CaF2 crystal. A vibration-isolated clean room (ZPM's clean machine casing) round a vacuum
//                                  chamber on an optical table. The only maker of grindless:nuclear_clock.
//   gtceu:nuclear_clock            its recipe type (EU in). Circuit 1: the VUV comb (high harmonics in xenon, the gas never used up).
//                                  2: the clock (a Th:CaF2 crystal, a comb and a UHV circuit).
//   gtceu:crystal_growth_furnace   oxide, fluoride and III-V single crystals, which GTM cannot grow: Czochralski in an iridium
//                                  crucible (LiNbO3, Eu:YSO), vertical gradient freeze (CaF2, Th:CaF2) and liquid-encapsulated
//                                  Czochralski (InP) in one furnace. Robust casing round induction coils over a hearth, under argon.
//                                  It refuses to void (the worn iridium crucible goes back to EV's platinum plant).
//   gtceu:crystal_growth           its recipe type (EU in). Circuit 1: LiNbO3. 2: VUV CaF2. 3: Th:CaF2. 4: Eu:YSO. 5: InP. One
//                                  circuit per boule. The argon is a charge (never used up); the lead fluoride scavenger and the boron
//                                  oxide cap are never used up; the iridium crucible wears out in 1 run in 32 (a chanced input; the
//                                  worn crucible comes out at the same chance).
//
// New ids (the F1 ones are in uhv/foundation.js and are not registered again):
//   items vuv_frequency_comb (c1 of the lab), vuv_caf2_optic (line 8: the VUV CaF2 boule cut in GTM's cutter), iridium_crucible
//         (GTM's assembler, 8 iridium ingots), worn_iridium_crucible (back to iridium in EV's platinum plant, circuit 5)
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top): the lab is 7 wide x 5 high x 9 deep (clean casing; an optical
// table of computer casing, a tungstensteel vacuum chamber in the middle, a laminated-glass window in the front wall); the furnace
// 5 wide x 5 high x 9 deep (robust casing; a tungstensteel hearth on the floor, tritanium induction coils on both sides of the growth
// channel). The design's iridium hearth is the crucible itself (an input): no iridium block is verified in this pack.
// Textures: tools/assets/Build-UHVCrystalsTextures.ps1. Names: client_scripts/grindless/uhv_crystals_lang.js.
// Published for the recipe script: global.grindless.crystals.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const CR = G.crystals || (G.crystals = {})
  const LOG = '[grindless/uhv] '

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const ROBUST = 'gtceu:robust_machine_casing'
  const ROBUST_TEXTURE = 'gtceu:block/casings/solid/machine_casing_robust_tungstensteel'
  const TUNGSTEN_PIPE = 'gtceu:tungstensteel_pipe_casing'
  const BENCH = 'gtceu:computer_casing'
  const GLASS = 'gtceu:laminated_glass'
  const COIL = 'gtceu:tritanium_coil_block'

  CR.table = 'kubejs/data/grindless/tables/crystals.json'
  CR.furnaceNoVoiding = 'grindless.machine.crystal_growth_furnace.no_voiding'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  CR.items = {
    vuv_frequency_comb: { stack: 16 },
    vuv_caf2_optic: { stack: 64 },
    iridium_crucible: { stack: 16 },
    worn_iridium_crucible: { stack: 16 }
  }
  CR.ids = {
    vuvFrequencyComb: 'grindless:vuv_frequency_comb',
    vuvCaf2Optic: 'grindless:vuv_caf2_optic',
    iridiumCrucible: 'grindless:iridium_crucible',
    wornIridiumCrucible: 'grindless:worn_iridium_crucible'
  }

  CR.machines = {
    lab: {
      name: 'nuclear_clock_lab',
      machine: 'gtceu:nuclear_clock_lab',
      type: 'nuclear_clock',
      dataKey: 'grindless_nuclear_clock',
      lang: 'Nuclear Clock Lab',
      // items in: the crystal, the comb, the UHV circuit and the programmed circuit; out: the clock; fluid in: the xenon charge
      maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 },
      width: 7, height: 5, depth: 9
    },
    furnace: {
      name: 'crystal_growth_furnace',
      machine: 'gtceu:crystal_growth_furnace',
      type: 'crystal_growth',
      dataKey: 'grindless_crystal_growth',
      lang: 'Crystal Growth Furnace',
      // items in: three feeds or two and a kept one, the crucible and the circuit; out: the boule and the worn crucible;
      // fluids in: oxygen and the argon charge
      maxIO: { itemsIn: 5, itemsOut: 2, fluidsIn: 2, fluidsOut: 0 },
      width: 5, height: 5, depth: 9
    }
  }

  // A hollow shell: row 0 (X) takes the parts, the top row and the walls are casing (F), S is the controller (front wall, row 1, middle).
  function shell(m, inner, wall) {
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
          else if (isWall) ch = (wall && wall(r, si, c)) || 'F'
          else ch = inner(r, si, c)
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // the optical table (B) on the floor, the vacuum chamber (T) up the middle (column 3, slices 3-5); the rest is clean air
  function labInner(r, si, c) {
    if (c === 3 && si >= 3 && si <= 5) return 'T'
    if (r === 1) return 'B'
    return '#'
  }

  // a 3 x 2 window above the controller
  function labWall(r, si, c) {
    return si === 8 && (r === 2 || r === 3) && c >= 2 && c <= 4 ? 'L' : null
  }

  // the hearth (T) on the floor; induction coils (K) on both sides of the growth channel (column 2), which is argon
  function furnaceInner(r, si, c) {
    if (r === 1) return 'T'
    if (c === 2) return '#'
    return 'K'
  }

  function specOf(m, casing, inner, wall, parts) {
    return {
      slices: shell(m, inner, wall),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, [Pat.block(casing)].concat(parts)),
        F: Pat.block(casing),
        T: Pat.block(TUNGSTEN_PIPE),
        B: Pat.block(BENCH),
        K: Pat.block(COIL),
        L: Pat.block(GLASS),
        '#': Pat.air()
      }
    }
  }
  CR.machines.lab.spec = specOf(CR.machines.lab, CLEAN, labInner, labWall, [
    Pat.part('input_bus', { min: 1, max: 2 }),
    Pat.part('input_hatch', { min: 1, max: 1 }),
    Pat.part('output_bus', { min: 1, max: 1 }),
    Pat.part('energy_input', { min: 1, max: 2 })
  ])
  CR.machines.furnace.spec = specOf(CR.machines.furnace, ROBUST, furnaceInner, null, [
    Pat.part('input_bus', { min: 1, max: 2 }),
    Pat.part('input_hatch', { min: 1, max: 2 }),
    Pat.part('output_bus', { min: 1, max: 2 }),
    Pat.part('energy_input', { min: 1, max: 2 })
  ])

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

  // ---------------------------------------------------------------- items

  StartupEvents.registry('item', function (event) {
    Object.keys(CR.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(CR.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var lab = CR.machines.lab
    event.create(lab.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(lab.maxIO.itemsIn, lab.maxIO.itemsOut, lab.maxIO.fluidsIn, lab.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.SCIENCE)
    var furnace = CR.machines.furnace
    event.create(furnace.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(furnace.maxIO.itemsIn, furnace.maxIO.itemsOut, furnace.maxIO.fluidsIn, furnace.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var lab = CR.machines.lab
    var furnace = CR.machines.furnace
    var labType = GTRecipeTypes.get(lab.type)
    var furnaceType = GTRecipeTypes.get(furnace.type)
    if (labType == null) throw new Error(LOG + 'recipe type gtceu:' + lab.type + ' is not registered')
    if (furnaceType == null) throw new Error(LOG + 'recipe type gtceu:' + furnace.type + ' is not registered')
    labType.addDataInfo(infoOf(lab.dataKey))
    furnaceType.addDataInfo(infoOf(furnace.dataKey))
    Pat.register(lab.machine, lab.spec)
    Pat.register(furnace.machine, furnace.spec)

    event.create(lab.name, 'multiblock')
      .langValue(lab.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(lab.type)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CLEAN) })
      .pattern(function (def) { return Pat.build(def, lab.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.nuclear_clock_lab.tooltip.0'),
        Text.translate('grindless.machine.nuclear_clock_lab.tooltip.1'),
        Text.translate('grindless.machine.nuclear_clock_lab.tooltip.2')
      ])
      .workableCasingModel(CLEAN_TEXTURE, 'grindless:block/multiblock/nuclear_clock_lab')

    event.create(furnace.name, 'multiblock')
      .langValue(furnace.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(furnace.type)
      .recipeModifier(G.noVoiding.modifier({ which: 'items', reason: CR.furnaceNoVoiding, name: 'crystal growth furnace' }, G.parallelHatch.overclock), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'items', reason: CR.furnaceNoVoiding, name: 'crystal growth furnace' }))
      .appearanceBlock(function () { return Block.getBlock(ROBUST) })
      .pattern(function (def) { return Pat.build(def, furnace.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.crystal_growth_furnace.tooltip.0'),
        Text.translate('grindless.machine.crystal_growth_furnace.tooltip.1'),
        Text.translate('grindless.machine.crystal_growth_furnace.tooltip.2')
      ])
      .workableCasingModel(ROBUST_TEXTURE, 'grindless:block/multiblock/crystal_growth_furnace')
  })
})()
