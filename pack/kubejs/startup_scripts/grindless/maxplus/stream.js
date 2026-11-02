// priority: -5639
// -----------------------------------------------------------------------------------------------
// MAX+ machines 7 and 8 at the Magellanic Stream (docs/eras/maxplus.md "Machines" 7-8; package XP-B2): two multiblocks and their recipe types. Every item
// they use is XP-F1's (maxplus/foundation.js). The recipes, with lines P9, P10, P11, P22 and P23's older-machine rows, are in
// server_scripts/grindless/maxplus/stream.js.
//
//   gtceu:pristine_gas_works        25 x 7 x 25, a scoop ring round a gas hall, running up to 64 copies of its row at once (B14-GAS), limited by what its
//                                   energy hatches carry, its inputs and the room for its output. c1 scoops 64,000 mB of pristine gas per run
//                                   (each run wears a magnetic scoop module 1 in 64, rolled per run)
//   gtceu:primordial_fusion_torus   23 x 9 x 23, a GENERATOR (lib/generators.js; S0-4): c1 burns 1,000 mB deuterium and 1,000 mB helium-3 into helium-4 ash and
//                                   hydrogen at 2^34 EU/t out, on one MAX 16 A dynamo hatch (V x A = 2^35). GTM's 64 A substation hatches do not fit the
//                                   multiblock's energy slot, so no 64 A hatch is used. Wears a neutral beam injector (1 in 64) and a direct converter stack (1 in 128)
//
// The gas works runs at V[MAX] x 4 (2^33 EU/t) per run on the 1,024 A MAX+ energy hatch (INPUT_ENERGY); 64 runs draw 2^39 EU/t. Rows run as written: no
// overclock, never a shorter run; the torus stays one run. Both machines run only at the Magellanic Stream (rows carry the dimension).
// Names: client_scripts/grindless/maxplus_stream_lang.js.
//
// The gas works' parallels (B14-GAS): GTM has no fixed-count parallel modifier for a consumer multiblock (GTRecipeModifiers has the parallel hatch's
// hatchParallel, :127-139, and the batch mode), so the recipe modifier is ours, in hatchParallel's shape (modifyAllContents x n, eutMultiplier n, parallels n) with
// a fixed cap of 64 on ParallelLogic.getParallelAmountWithoutEU: the limit by inputs and by room for the outputs, without the EU check. GTM's own EU check
// reads EnergyContainerList, which folds a 1,024 A hatch into a tier voltage (see lib/generators.js) and would allow no run at 2^33 EU/t; the energy limit here
// is the hatches' V x A, hatch by hatch. lib/mega.js's fixedParallel is not used: its energy limit is getMaxVoltage, one hatch's voltage, without the amperage.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MS = G.maxPlusStream || (G.maxPlusStream = {})
  const LOG = '[grindless/maxplus] '

  const WORKS_CASING = 'gtceu:atomic_casing'
  const TORUS_CASING = 'gtceu:atomic_casing'

  MS.works = {
    name: 'pristine_gas_works', machine: 'gtceu:pristine_gas_works', type: 'pristine_gas_works', dataKey: 'grindless_pristine_gas_works',
    lang: 'Pristine Gas Works', maxIO: { itemsIn: 2, itemsOut: 0, fluidsIn: 0, fluidsOut: 1 }, casing: WORKS_CASING,
    texture: 'gtceu:block/casings/gcym/atomic_casing', overlay: 'grindless:block/multiblock/pristine_gas_works',
    width: 25, height: 7, depth: 25, generator: false, maxParallels: 64,
    pal: { F: WORKS_CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil' },
    parts: function () {
      return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_hatch', { min: 1, max: 2 }), Pat.part('energy_input', { min: 1, max: 2 })]
    }
  }
  MS.torus = {
    name: 'primordial_fusion_torus', machine: 'gtceu:primordial_fusion_torus', type: 'primordial_fusion_torus', dataKey: 'grindless_primordial_fusion_torus',
    lang: 'Primordial Fusion Torus', maxIO: { itemsIn: 3, itemsOut: 0, fluidsIn: 2, fluidsOut: 2 }, casing: TORUS_CASING,
    texture: 'gtceu:block/casings/gcym/atomic_casing', overlay: 'grindless:block/multiblock/primordial_fusion_torus',
    width: 23, height: 9, depth: 23, generator: true,
    pal: { F: TORUS_CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil' },
    parts: function () {
      return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('input_hatch', { min: 1, max: 2 }), Pat.part('output_hatch', { min: 1, max: 2 }),
        Pat.part('energy_output', { min: 1, max: 2 })]
    }
  }
  MS.machines = [MS.works, MS.torus]

  function abs(n) { return n < 0 ? -n : n }

  // the EU/t the formed machine's energy hatches carry: voltage x amperage summed over every EU input handler
  function hatchCapacity(machine) {
    var IO = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO')
    var EUCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.EURecipeCapability').CAP
    var handlers = machine.getCapabilitiesFlat(IO.IN, EUCap)
    var total = 0
    for (var i = 0; i < handlers.size(); i++) {
      var h = handlers.get(i)
      if (typeof h.getInputVoltage !== 'function' || typeof h.getInputAmperage !== 'function') continue
      total += Number(h.getInputVoltage()) * Number(h.getInputAmperage())
    }
    return total
  }

  // up to `cap` runs of the row at once: each run keeps its EU/t, duration, inputs, outputs and chanced wear (GTM rolls a chanced input per parallel run, see
  // tools/test/overlay/kubejs/server_scripts/gg_test_maxplus_stellarator.js); fewer start when the hatches, the inputs or the room for the output run short
  function parallelRuns(cap) {
    var failed = false
    return function (machine, recipe) {
      try {
        var RH = Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
        var eut = abs(Number(RH.getRealEUt(recipe).getTotalEU()))
        var byHatch = eut > 0 ? Math.floor(hatchCapacity(machine) / eut) : cap
        if (byHatch < 1) return ModifierFunction.NULL
        var PL = Java.loadClass('com.gregtechceu.gtceu.api.recipe.modifier.ParallelLogic')
        var runs = PL.getParallelAmountWithoutEU(machine, recipe, Math.min(cap, byHatch))
        if (runs < 1) return ModifierFunction.NULL
        if (runs === 1) return ModifierFunction.IDENTITY
        var CM = Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.ContentModifier')
        return ModifierFunction.builder().modifyAllContents(CM.multiplier(runs)).eutMultiplier(runs).parallels(runs).build()
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'the gas works recipe modifier failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }
  }
  MS.parallelRuns = parallelRuns

  // x left to right, y bottom to top, z back to front; the floor carries the part cells at the front edge
  // the gas works: a glass-banded hall with a scoop ring of coils at mid height round an open gas well
  function worksCell(x, y, z) {
    var m = MS.works
    if (y === 0) return z === m.depth - 1 && abs(x - 12) <= 3 ? 'X' : 'B'
    if (y === m.height - 1) return 'B'
    if (x === 0 || x === m.width - 1 || z === 0 || z === m.depth - 1) {
      var along = x === 0 || x === m.width - 1 ? z : x
      return y >= 2 && y <= 4 && along >= 3 && along <= 21 && along % 4 !== 1 ? 'L' : 'F'
    }
    var dx = x - 12
    var dz = z - 12
    var r2 = dx * dx + dz * dz
    if (y === 3 && r2 >= 64 && r2 <= 100) return 'C'
    return '#'
  }

  // the torus: a low hall with a doughnut of coils round the fusion ring
  function torusCell(x, y, z) {
    var m = MS.torus
    if (y === 0) return z === m.depth - 1 && abs(x - 11) <= 3 ? 'X' : 'B'
    if (y === m.height - 1) return 'B'
    if (x === 0 || x === m.width - 1 || z === 0 || z === m.depth - 1) {
      var along = x === 0 || x === m.width - 1 ? z : x
      return y >= 3 && y <= 5 && along >= 3 && along <= 19 && along % 4 !== 1 ? 'L' : 'F'
    }
    var dx = x - 11
    var dz = z - 11
    var r2 = dx * dx + dz * dz
    if (y === 4 && r2 >= 49 && r2 <= 81) return 'C'
    return '#'
  }

  var CELLS = { pristine_gas_works: worksCell, primordial_fusion_torus: torusCell }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: CELLS[m.name] })
  }

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

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    MS.machines.forEach(function (m) {
      var t = event.create(m.type)
        .category(m.generator ? 'generator' : 'multiblock')
        .setEUIO(m.generator ? 'out' : 'in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      t.setSound(m.generator ? GTSoundEntries.TURBINE : GTSoundEntries.ARC)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MS.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      var builder = event.create(m.name, 'multiblock')
      if (m.generator) {
        // lib/generators.js: .generator(true), .regressWhenWaiting(false), the dynamo-limited modifier and the controller lines (one run at a time)
        builder = G.generators.configure(builder, { maxParallels: 1, name: m.name })
      } else if (m.maxParallels > 1) {
        builder = builder.recipeModifier(parallelRuns(m.maxParallels), true)
      } else {
      }
      builder
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type))
        ])
        .workableCasingModel(m.texture, m.overlay)
    })
  })
})()
