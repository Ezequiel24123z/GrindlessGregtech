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
// table of computer casing, a tungstensteel vacuum chamber in the middle, framed glass walls); the furnace
// 5 wide x 9 high x 5 deep, a puller tower (robust casing; a tungstensteel hearth on the floor, a ring of tritanium induction coils round
// the growth channel, pull-head gearboxes at the top). The design's iridium hearth is the crucible itself (an input): no iridium block is
// verified in this pack.
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
  const GEARBOX = 'gtceu:tungstensteel_gearbox'
  const HEATPROOF = 'gtceu:heatproof_machine_casing'
  const SHIELD = 'gtnn:radiation_proof_machine_casing'

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
      casing: CLEAN, accent: ROBUST, frame: 'stainless_steel',
      // items in: the crystal, the comb, the UHV circuit and the programmed circuit; out: the clock; fluid in: the xenon charge
      maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 },
      width: 11, height: 7, depth: 9
    },
    furnace: {
      name: 'crystal_growth_furnace',
      machine: 'gtceu:crystal_growth_furnace',
      type: 'crystal_growth',
      dataKey: 'grindless_crystal_growth',
      lang: 'Crystal Growth Furnace',
      casing: ROBUST, accent: HEATPROOF, hall: CLEAN, frame: 'tungsten_steel',
      // items in: three feeds or two and a kept one, the crucible and the circuit; out: the boule and the worn crucible;
      // fluids in: oxygen and the argon charge
      maxIO: { itemsIn: 5, itemsOut: 2, fluidsIn: 2, fluidsOut: 0 },
      width: 17, height: 9, depth: 7
    }
  }

  // The wall skin: frame posts (Q) on the corners and the roof edges, an accent course (A) at the foot and ribs across the roof,
  // and glass (L) between casing mullions (F) in the rows above.
  function skin(m, r, si, c) {
    var ex = c === 0 || c === m.width - 1
    var ez = si === 0 || si === m.depth - 1
    var top = r === m.height - 1
    if ((ex && ez) || (top && (ex || ez))) return 'Q'
    if (top) return si % 3 === 1 ? 'A' : 'F'
    if (r === 1) return 'A'
    return (ez ? c : si) % 3 === 0 ? 'F' : 'L'
  }

  // A shell: row 0 (X) takes the parts (frame feet on the corners), the walls are skinned, S is the controller (front wall, row 1, middle).
  function shell(m, inner) {
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
          if (r === 0) ch = (si === 0 || si === last) && (c === 0 || c === m.width - 1) ? 'Q' : 'X'
          else if (si === last && r === 1 && c === mid) ch = 'S'
          else if (r === m.height - 1 || isWall) ch = skin(m, r, si, c)
          else ch = inner(r, si, c)
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // an optical hall on an isolated slab: the optical table (B) with a vacuum chamber (T) along it on flanged gearbox mounts (G), the
  // comb enclosure (a glass cage, back left) and the shielded clock cell (radiation-proof casing, front right) at its two ends
  function labInner(r, si, c) {
    if (r === 1) return c >= 2 && c <= 8 && si >= 1 && si <= 7 ? 'B' : '#'
    if (c === 5 && r === 2 && si >= 2 && si <= 6) return 'T'
    if (r === 2 && si === 4 && (c === 4 || c === 6)) return 'G'
    if (r <= 4 && c >= 2 && c <= 4 && si >= 1 && si <= 3) {
      if (r === 4) return 'L'
      return c === 3 && si === 2 ? '#' : 'L'
    }
    if (r <= 4 && c >= 6 && c <= 8 && si >= 5 && si <= 7) {
      if (r === 4) return 'R'
      return c === 7 && si === 6 ? '#' : 'R'
    }
    return '#'
  }

  // three Czochralski pullers (tall pull towers, five wide, one gap apart) on a shared argon manifold hall at their feet. A tower: the
  // hearth (T) on the floor, two rings of induction coils (K) round the growth channel (the centre), the pull head (G) at the top.
  function furnaceChar(m, si, r, c) {
    var last = m.width - 1
    if (si >= 5) {
      var corner = (c === 0 || c === last) && si === m.depth - 1
      if (corner) return 'Q'
      if (r === 0) return 'X'
      if (r === 3) return c % 4 === 0 ? 'A' : 'H'
      if (r > 3) return ' '
      if (si === m.depth - 1) {
        if (r === 1 && c === (last / 2)) return 'S'
        return r === 1 ? 'A' : (c % 4 === 0 ? 'H' : 'L')
      }
      if (c === 0 || c === last) return 'H'
      return r === 1 ? 'T' : '#'
    }
    var tc = c % 6
    if (tc === 5) return ' '
    var edgeX = tc === 0 || tc === 4
    var edgeZ = si === 0 || si === 4
    var top = m.height - 1
    if (edgeX && edgeZ && r > 0) return 'Q'
    if (r === 0) return edgeX && edgeZ ? 'Q' : 'X'
    if (r === top) return edgeX || edgeZ ? 'Q' : (si % 2 === 1 ? 'A' : 'F')
    if (edgeX || edgeZ) {
      if (r === 1) return 'A'
      return (edgeZ ? tc : si) % 2 === 0 ? 'F' : 'L'
    }
    var ring = Math.max(Math.abs(tc - 2), Math.abs(si - 2))
    if (r === 1) return 'T'
    if (ring === 1 && (r === 3 || r === 5)) return 'K'
    if (ring === 0 && r === top - 1) return 'G'
    return '#'
  }

  function furnaceSlices(m) {
    var slices = []
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var row = ''
        for (var c = 0; c < m.width; c++) row += furnaceChar(m, si, r, c)
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }
  function specOf(m, inner, parts) {
    return {
      slices: inner === null ? furnaceSlices(m) : shell(m, inner),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, [Pat.block(m.casing)].concat(parts)),
        F: Pat.block(m.casing),
        Q: Pat.frame([m.frame]),
        A: Pat.block(m.accent),
        H: Pat.block(m.hall || m.accent),
        R: Pat.block(SHIELD),
        T: Pat.block(TUNGSTEN_PIPE),
        B: Pat.block(BENCH),
        K: Pat.block(COIL),
        L: Pat.block(GLASS),
        G: Pat.block(GEARBOX),
        '#': Pat.air()
      }
    }
  }
  CR.machines.lab.spec = specOf(CR.machines.lab, labInner, [
    Pat.part('input_bus', { min: 1, max: 2 }),
    Pat.part('input_hatch', { min: 1, max: 1 }),
    Pat.part('output_bus', { min: 1, max: 1 }),
    Pat.part('energy_input', { min: 1, max: 2 }),
    G.parallelHatch.part()
  ])
  CR.machines.furnace.spec = specOf(CR.machines.furnace, null, [
    Pat.part('input_bus', { min: 1, max: 2 }),
    Pat.part('input_hatch', { min: 1, max: 2 }),
    Pat.part('output_bus', { min: 1, max: 2 }),
    Pat.part('energy_input', { min: 1, max: 2 }),
    G.parallelHatch.part()
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
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.nuclear_clock')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ])
      .workableCasingModel(CLEAN_TEXTURE, 'grindless:block/multiblock/nuclear_clock_lab')

    event.create(furnace.name, 'multiblock')
      .langValue(furnace.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(furnace.type)
      .recipeModifier(G.noVoiding.modifier({ which: 'items', reason: CR.furnaceNoVoiding, name: 'crystal growth furnace' }, G.parallelHatch.modifier(G.parallelHatch.overclock)), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'items', reason: CR.furnaceNoVoiding, name: 'crystal growth furnace' }))
      .appearanceBlock(function () { return Block.getBlock(ROBUST) })
      .pattern(function (def) { return Pat.build(def, furnace.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.crystal_growth_furnace.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.crystal_growth')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ])
      .workableCasingModel(ROBUST_TEXTURE, 'grindless:block/multiblock/crystal_growth_furnace')
  })
})()
