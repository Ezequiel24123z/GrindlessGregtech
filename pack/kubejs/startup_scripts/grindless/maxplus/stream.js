// priority: -5639
// -----------------------------------------------------------------------------------------------
// MAX+ machines 7 and 8 at the Magellanic Stream (docs/eras/maxplus.md "Machines" 7-8; package XP-B2): two multiblocks and their recipe types. Every item
// they use is XP-F1's (maxplus/foundation.js). The recipes, with lines P9, P10, P11, P22 and P23's older-machine rows, are in
// server_scripts/grindless/maxplus/stream.js.
//
//   gtceu:pristine_gas_works        41 x 9 x 41 of bound lattice and Kerr coil casing (no cryostat: bootstrap), a scoop ring round a gas hall, running up to 64 copies of its row at once (B14-GAS), limited by what its
//                                   energy hatches carry, its inputs and the room for its output. c1 scoops 64,000 mB of pristine gas per run
//                                   (each run wears a magnetic scoop module 1 in 64, rolled per run)
//   gtceu:primordial_fusion_torus   35 x 11 x 35 of bound lattice, Kerr coil and Fe-56 shield casing, a GENERATOR (lib/generators.js; S0-4): c1 burns 1,000 mB deuterium and 1,000 mB helium-3 into helium-4 ash and
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

  const LATTICE = 'grindless:bound_lattice_casing'
  const LATTICE_TEXTURE = 'grindless:block/maxplus/bound_lattice_casing'
  const KERR = 'grindless:kerr_coil_casing'
  const FE56 = 'grindless:fe56_shield_casing'

  MS.works = {
    name: 'pristine_gas_works', machine: 'gtceu:pristine_gas_works', type: 'pristine_gas_works', dataKey: 'grindless_pristine_gas_works',
    lang: 'Pristine Gas Works', maxIO: { itemsIn: 2, itemsOut: 0, fluidsIn: 0, fluidsOut: 1 }, casing: LATTICE,
    texture: LATTICE_TEXTURE, overlay: 'grindless:block/multiblock/pristine_gas_works',
    width: 41, height: 9, depth: 41, generator: false, maxParallels: 64,
    pal: { F: LATTICE, K: KERR, E: FE56, P: 'gtceu:tungstensteel_pipe_casing', L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil' },
    parts: function () {
      return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_hatch', { min: 1, max: 2 }), Pat.part('energy_input', { min: 1, max: 2 })]
    }
  }
  MS.torus = {
    name: 'primordial_fusion_torus', machine: 'gtceu:primordial_fusion_torus', type: 'primordial_fusion_torus', dataKey: 'grindless_primordial_fusion_torus',
    lang: 'Primordial Fusion Torus', maxIO: { itemsIn: 3, itemsOut: 0, fluidsIn: 2, fluidsOut: 2 }, casing: LATTICE,
    texture: LATTICE_TEXTURE, overlay: 'grindless:block/multiblock/primordial_fusion_torus',
    width: 35, height: 11, depth: 35, generator: true,
    pal: {
      F: LATTICE, K: KERR, E: FE56, Y: 'grindless:primordial_cryostat_casing', A: 'gtceu:atomic_casing', L: 'gtceu:cleanroom_glass',
      C: 'gtceu:superconducting_coil'
    },
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

  var TWO_PI = 6.283185307179586

  // every cell of a shape function painted into a scene, then the front booth (controller wall, glass and the floor hatch cells) over them
  function paint(w, h, d, cell) {
    var s = G.uevShapes.scene(w, h, d)
    for (var z = 0; z < d; z++) for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var ch = cell(x, y, z)
      if (ch !== ' ') s.set(x, y, z, ch)
    }
    s.booth('F', 3)
    return s.fn()
  }

  // The gas works: a scoop ring (radius 16.5 about the centre, a duct 7 cells wide and 4 high) round a central compressor tower, joined by eight pipe
  // spokes. The duct is lattice with a Fe-56 outer lip, a glass-banded roof under Kerr coil funnel ribs, and a lattice floor; the tower holds three
  // superconducting compressor rings.
  function worksCell(x, y, z) {
    var dx = x - 20
    var dz = z - 20
    var r = Math.sqrt(dx * dx + dz * dz)
    var u = r - 16.5
    var ang = Math.atan2(dz, dx)
    var inDuct = Math.abs(u) <= 3.3
    var sp = Math.round(ang / (TWO_PI / 8)) * (TWO_PI / 8)
    var onSpoke = Math.abs(ang - sp) * r <= 1.6 && r > 5.5 && r < 13.2
    if (y === 0) return inDuct || r <= 6.5 || onSpoke ? 'F' : ' '
    if (inDuct && y <= 5) {
      if (y === 5) return Math.round(ang * 6) % 3 === 0 && Math.abs(u) <= 2.3 ? 'L' : (y % 2 === 1 && Math.abs(u) < 2.9 ? 'K' : 'F')
      if (Math.abs(u) >= 2.3) return u > 0 ? 'E' : (y % 2 === 0 ? 'K' : 'F')
      return '#'
    }
    if (inDuct && y <= 7 && Math.abs(u) <= 2.6) {
      var rib = Math.round(ang / (TWO_PI / 40)) * (TWO_PI / 40)
      return Math.abs(ang - rib) * r <= 0.9 ? 'K' : ' '
    }
    if (r <= 5.5) {
      if (y === 8) return 'F'
      if (r >= 4.4) return y === 4 ? 'E' : 'F'
      if (r >= 2.2 && r < 3.4 && (y === 2 || y === 4 || y === 6)) return 'C'
      return '#'
    }
    if (onSpoke && y <= 4) {
      var v = Math.abs(y - 2)
      var wall = Math.abs(ang - sp) * r >= 0.8 || v === 2
      return wall ? 'P' : '#'
    }
    return ' '
  }

  // The torus: a tokamak ring (major radius 11.5, minor 5.5) about the hall axis: the plasma in an atomic casing vessel, a Fe-56 blanket, Kerr coil shell
  // and 16 Kerr toroidal field hoops, cryostat pods outside, and a superconducting central solenoid in the hole. Lattice plinth and ring wall below.
  function torusCell(x, y, z) {
    var dx = x - 17
    var dz = z - 17
    var r = Math.sqrt(dx * dx + dz * dz)
    if (y === 0) return r <= 17.4 && (r >= 7 || r <= 3.5) ? 'F' : ' '
    var du = r - 10.8
    var dv = y - 5
    var u = Math.sqrt(du * du + dv * dv)
    var phi = Math.atan2(dz, dx)
    if (r <= 2.0 && y >= 1 && y <= 9) return 'C'
    if (r <= 3.0 && y >= 1 && y <= 9) return 'F'
    if (u < 2.3) return '#'
    if (u < 2.7) return 'A'
    if (u < 3.1) return 'E'
    if (u < 3.6) return y % 2 === 0 ? 'K' : 'F'
    if (u < 5.6) {
      var hoop = Math.round(phi / (TWO_PI / 16)) * (TWO_PI / 16)
      if (Math.abs(phi - hoop) * r <= 0.8 && u < 4.7) return 'K'
      if (u >= 5.0) {
        var pod = Math.round(phi / (TWO_PI / 8)) * (TWO_PI / 8)
        if (Math.abs(phi - pod - TWO_PI / 16) * r <= 1.6) return 'Y'
      }
    }
    if (r >= 16.4 && y <= 2) return 'F'
    return ' '
  }

  var CELLS = { pristine_gas_works: worksCell, primordial_fusion_torus: torusCell }

  MS.shapes = function () {
    var o = {}
    MS.machines.forEach(function (m) { o[m.name] = { w: m.width, h: m.height, d: m.depth, pal: m.pal, fn: paint(m.width, m.height, m.depth, CELLS[m.name]) } })
    return o
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: paint(m.width, m.height, m.depth, CELLS[m.name]) })
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
      } else {
        builder = builder.recipeModifier(parallelRuns(m.maxParallels), true)
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
