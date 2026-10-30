// priority: -7668
// -----------------------------------------------------------------------------------------------
// UHV's antimatter and Casimir machines (docs/eras/uhv.md, machines 13 and 17, lines 27 and 28; package UHV-A6): the positron
// accumulator and the Casimir array, their recipe types, the package's own items and the 99.999 % neon. The recipes come from
// data/grindless/tables/antimatter.json (server_scripts/grindless/uhv/antimatter.js), which also holds two GTM assembler rows (the
// magnesium-24 target, the empty Penning trap). The synchrotron's sodium-22 row and the antimatter trap's antihydrogen row are in
// server_scripts/grindless/uv/accelerators.js; the cryogenic plant's neon row in server_scripts/grindless/ev/cryogenic_plant.js.
//
//   gtceu:positron_accumulator   sodium-22 emits positrons; a film of solid neon slows them and a Surko buffer-gas trap stacks them by
//                                the billion into a Penning trap (CERN's ALPHA and AEgIS). A beamline of UV casing with a
//                                superconducting solenoid round the bore, the source end in tungstensteel pipe.
//   gtceu:positron_accumulation  its recipe type (EU in). Circuit 1: the moderated source (sodium-22 target + 99.999 % neon).
//                                2: accumulate (the source wears 1 in 16 runs; nitrogen buffer gas, never used up). 3: strip a spent
//                                source: the neon back, the sodium-22 as radioactive waste for ZPM's waste retrieval plant. The
//                                machine refuses to void (lib/no_voiding.js). The only maker of grindless:positron_cartridge.
//   gtceu:casimir_array          the Casimir effect between plates nanometres apart is real (Lamoreaux, 1997); harvesting it as
//                                "exotic matter" is fiction, said on its EMI page. Station truss round a cryostat, in Earth orbit.
//   gtceu:casimir_cavity         its recipe type (EU in), every recipe in Earth orbit. Circuit 1: a cavity stack (7 NbN-coated SiC
//                                plates under helium II, the helium back). 2: harvest (16 stacks worn together 1 in 32 runs, a nuclear
//                                clock for the phase lock). 3: strip a worn stack back to its 7 mirror blanks (re-coated by UV's
//                                MOCVD reactor). The only maker of grindless:exotic_matter_cell.
//
// New ids (the F1 ones are in uhv/foundation.js and are not registered again: positron_cartridge, antihydrogen_cartridge,
// exotic_matter_cell; A2 makes nuclear_clock, A5 nbn_coated_sic_plate):
//   items     magnesium_target (GTM assembler), sodium_22_target (synchrotron c5), moderated_positron_source (accumulator c1),
//             spent_positron_source (accumulator c2), empty_penning_trap (GTM assembler), casimir_cavity_stack (array c1),
//             worn_casimir_cavity_stack (array c2)
//   material  high_purity_neon (gas; the cryogenic plant's neon row)
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top): the accumulator is 11 wide x 5 high x 7 deep, the array 9 x 9 x 9.
// Textures: tools/assets/Build-UHVAntimatterTextures.ps1. Names: client_scripts/grindless/uhv_antimatter_lang.js.
// Published for the recipe script: global.grindless.uhvAntimatter.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const AM = G.uhvAntimatter || (G.uhvAntimatter = {})
  const LOG = '[grindless/uhv] '

  const UV_CASING = 'gtceu:uv_machine_casing'
  const UV_TEXTURE = 'gtceu:block/casings/voltage/uv/side'
  const TRUSS = 'grindless:station_truss_casing'
  const TRUSS_TEXTURE = 'grindless:block/luv/station_truss_casing'
  const CRYOSTAT = 'grindless:cryostat_casing'
  const COIL = 'gtceu:superconducting_coil'
  const PIPE = 'gtceu:tungstensteel_pipe_casing'
  const ROBUST = 'gtceu:robust_machine_casing'
  const GLASS = 'gtceu:laminated_glass'
  const FUSION_GLASS = 'gtceu:fusion_glass'

  AM.table = 'kubejs/data/grindless/tables/antimatter.json'
  AM.accumulatorNoVoiding = 'grindless.machine.positron_accumulator.no_voiding'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  AM.items = {
    magnesium_target: { stack: 16 },
    sodium_22_target: { stack: 16 },
    moderated_positron_source: { stack: 1 },
    spent_positron_source: { stack: 16 },
    empty_penning_trap: { stack: 16 },
    casimir_cavity_stack: { stack: 16 },
    worn_casimir_cavity_stack: { stack: 16 }
  }
  AM.materials = {
    high_purity_neon: { colour: 0xFF9AA8, formula: 'Ne' }
  }

  AM.machines = {
    accumulator: {
      name: 'positron_accumulator',
      machine: 'gtceu:positron_accumulator',
      type: 'positron_accumulation',
      dataKey: 'grindless_positron_accumulation',
      lang: 'Positron Accumulator',
      // c2: the source (chanced), the empty Penning trap and the circuit; out: the cartridge and the spent source (chanced), or the
      // waste; fluid in: neon (c1) or the nitrogen charge (c2); out: the neon (c3)
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
      width: 11, height: 5, depth: 7
    },
    array: {
      name: 'casimir_array',
      machine: 'gtceu:casimir_array',
      type: 'casimir_cavity',
      dataKey: 'grindless_casimir_cavity',
      lang: 'Casimir Array',
      // c2: the 16 stacks (chanced), the nuclear clock (kept) and the circuit; out: the cell and the worn stacks (chanced);
      // fluid in: helium II (c1); out: the helium
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
      width: 9, height: 9, depth: 9
    }
  }

  // The wall skin: frame posts (Q) on the corners and the roof edges, an accent course (A) at the foot and ribs across the roof,
  // and glass (N) between casing mullions (F) in the rows above.
  function skin(m, r, si, c) {
    var ex = c === 0 || c === m.width - 1
    var ez = si === 0 || si === m.depth - 1
    var top = r === m.height - 1
    if ((ex && ez) || (top && (ex || ez))) return 'Q'
    if (top) return si % 3 === 1 ? 'A' : 'F'
    if (r === 1) return 'A'
    return (ez ? c : si) % 3 === 0 ? 'F' : 'N'
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
          if (r === 0) ch = isWall && (si === 0 || si === last) && (c === 0 || c === m.width - 1) ? 'Q' : 'X'
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

  // the beamline runs across the machine on the middle slice and middle row: the source end (T, tungstensteel pipe cage) at the left, the
  // bore (air) through the solenoid, whose coils (M) wrap it on the slices before and behind and the rows above and below, a cryostat
  // detector (K) at the far end
  function accumulatorInner(r, si, c) {
    var w = AM.machines.accumulator.width
    if (si === 3 && c === 1) return 'T'
    if (si === 3 && c === w - 2) return 'K'
    if (c >= 2 && c <= w - 3 && si >= 2 && si <= 4 && r >= 1 && r <= 3) return si === 3 && r === 2 ? '#' : 'M'
    return '#'
  }

  // the cryostat (K): a 3 x 3 x 3 core in the middle of the station's vacuum, a helium riser (T) above and below it and a ring of
  // solenoid coils (M) around its waist
  function arrayInner(r, si, c) {
    var core = r >= 3 && r <= 5 && si >= 3 && si <= 5 && c >= 3 && c <= 5
    if (core) return 'K'
    if (si === 4 && c === 4 && r !== 4) return 'T'
    if (r === 4 && si >= 2 && si <= 6 && c >= 2 && c <= 6 && (si === 2 || si === 6 || c === 2 || c === 6)) return 'M'
    return '#'
  }

  AM.machines.accumulator.spec = {
    slices: shell(AM.machines.accumulator, accumulatorInner),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf.apply(null, [Pat.block(UV_CASING)].concat([
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 1, max: 1 })
      ])),
      F: Pat.block(UV_CASING),
      Q: Pat.frame(['tungsten_steel']),
      A: Pat.block(ROBUST),
      N: Pat.block(GLASS),
      K: Pat.block(CRYOSTAT),
      M: Pat.block(COIL),
      T: Pat.block(PIPE),
      '#': Pat.air()
    }
  }
  AM.machines.array.spec = {
    slices: shell(AM.machines.array, arrayInner),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf.apply(null, [Pat.block(TRUSS)].concat([
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 1 }),
        Pat.part('output_bus', { min: 1, max: 1 }),
        Pat.part('output_hatch', { min: 1, max: 1 })
      ])),
      F: Pat.block(TRUSS),
      Q: Pat.frame(['stainless_steel']),
      A: Pat.block(ROBUST),
      N: Pat.block(FUSION_GLASS),
      M: Pat.block(COIL),
      T: Pat.block(PIPE),
      K: Pat.block(CRYOSTAT),
      '#': Pat.air()
    }
  }

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

  // ---------------------------------------------------------------- items and materials

  StartupEvents.registry('item', function (event) {
    Object.keys(AM.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(AM.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(AM.materials).forEach(function (name) {
      var spec = AM.materials[name]
      event.create(name).gas().color(spec.colour).formula(spec.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var acc = AM.machines.accumulator
    event.create(acc.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(acc.maxIO.itemsIn, acc.maxIO.itemsOut, acc.maxIO.fluidsIn, acc.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ELECTROLYZER)
    var arr = AM.machines.array
    event.create(arr.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(arr.maxIO.itemsIn, arr.maxIO.itemsOut, arr.maxIO.fluidsIn, arr.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ELECTROLYZER)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var acc = AM.machines.accumulator
    var arr = AM.machines.array
    var accType = GTRecipeTypes.get(acc.type)
    var arrType = GTRecipeTypes.get(arr.type)
    if (accType == null) throw new Error(LOG + 'recipe type gtceu:' + acc.type + ' is not registered')
    if (arrType == null) throw new Error(LOG + 'recipe type gtceu:' + arr.type + ' is not registered')
    accType.addDataInfo(infoOf(acc.dataKey))
    arrType.addDataInfo(infoOf(arr.dataKey))
    Pat.register(acc.machine, acc.spec)
    Pat.register(arr.machine, arr.spec)

    // the spent source leaves as radioactive waste: the accumulator never voids it
    var accOpts = { which: 'both', reason: AM.accumulatorNoVoiding, name: 'positron accumulator' }
    event.create(acc.name, 'multiblock')
      .langValue(acc.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(acc.type)
      .recipeModifier(G.noVoiding.modifier(accOpts, G.parallelHatch.overclock), true)
      .beforeWorking(G.noVoiding.beforeWorking(accOpts))
      .appearanceBlock(function () { return Block.getBlock(UV_CASING) })
      .pattern(function (def) { return Pat.build(def, acc.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.positron_accumulator.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.positron_accumulation')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ])
      .workableCasingModel(UV_TEXTURE, 'grindless:block/multiblock/positron_accumulator')

    event.create(arr.name, 'multiblock')
      .langValue(arr.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(arr.type)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(TRUSS) })
      .pattern(function (def) { return Pat.build(def, arr.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.casimir_array.tooltip.0'),
        Text.translate('grindless.machine.casimir_array.tooltip.1'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.casimir_cavity')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ])
      .workableCasingModel(TRUSS_TEXTURE, 'grindless:block/multiblock/casimir_array')
  })
})()
