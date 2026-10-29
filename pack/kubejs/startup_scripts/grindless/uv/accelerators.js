// priority: -9285
// -----------------------------------------------------------------------------------------------
// UV's accelerators (docs/eras/uv.md, machines 7, 8 and 22, lines 5, 18 and 22; package UV-A5): the synchrotron, the muon fusion cell and
// the antimatter trap, their recipe types, and the ids UV-F1 did not register. The recipes come from data/grindless/tables/accelerators.json
// (server_scripts/grindless/uv/accelerators.js).
//
//   gtceu:synchrotron        a 23 x 23 x 5 electron/proton ring (KIT's LIGA beamline, CERN's antiproton decelerator). Type gtceu:synchrotron
//                            (EU in). Circuit 1: X-ray exposure of a PMMA-coated wafer under a gold mask. 2: LIGA development. 3: the
//                            photonic chip. 4: antiprotons from GTCA's COMET protons on a tungsten target (the only antimatter in the pack).
//                            It refuses to void: the activated target must leave through the output bus.
//   gtceu:muon_fusion_cell   muon-catalysed fusion of liquid deuterium-tritium (Alvarez 1956, LAMPF, J-PARC). A generator, type
//                            gtceu:muon_catalysed_fusion (EU out): 786,432 EU/t (1.5 A UV). The game figure assumes a far better sticking
//                            fraction than the real one (still below break-even): an extrapolation, said in its tooltip. The lithium blanket
//                            is a kept charge and breeds back 60 % of the tritium; the other 40 % is make-up from IV. The figure written is
//                            final and the type stays out of server_scripts/grindless/power/generators.js TYPES (docs/research/uv-s0.md, S0-6).
//   gtceu:antimatter_trap    a Penning trap on a station (CERN's AD/ELENA and BASE, Penn State's ICAN-II). Type gtceu:antimatter_storage
//                            (EU in). Every recipe carries a dimension condition: Earth orbit only (G.orbits.earth, lib/orbits.js).
//                            Circuit 1: four cartridges stacked into a charged trap. 2: the ICAN pellet.
//
// New ids (the F1 ones, antiproton_cartridge, srf_cryomodule_block, liquid_deuterium_tritium and superfluid_helium, are in uv/foundation.js):
//   items     pmma_coated_wafer, x_ray_mask, exposed_wafer, patterned_wafer, photonic_chip, silicon_nitride_film, tungsten_target,
//             activated_tungsten_target, empty_antiproton_cartridge, empty_antiproton_trap, antiproton_trap, ican_pellet,
//             lithium_breeder_blanket
//   materials pmma_resist (PMMA dissolved for coating), liga_developer (the GG developer's amine-alcohol-water mix)
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top): the synchrotron is a square ring 23 x 23 x 5 (a 3-wide band of UV
// casing round a hollow centre, the beam pipe at row 2, 16 superconducting coil dipoles, 2 SRF cryomodules and 2 extraction beamlines);
// the cell 9 x 9 x 11 (cryostat casing, a tungsten pion target, a muon decay channel up the axis, 2 cryomodules in the back wall); the trap
// 5 wide, 9 long, 5 high (station truss, an HTS solenoid of superconducting coils round the bore, an electron cooler at the back).
// Textures: tools/assets/Build-UVAcceleratorsTextures.ps1. Names: client_scripts/grindless/uv_accelerators_lang.js.
// Published for the recipe script and the smoke test: global.grindless.accelerators.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Gen = G.generators
  const AC = G.accelerators || (G.accelerators = {})
  const LOG = '[grindless/uv] '

  const UV_CASING = 'gtceu:uv_machine_casing'
  const UV_TEXTURE = 'gtceu:block/casings/voltage/uv/side'
  const CRYOSTAT = 'grindless:cryostat_casing'
  const CRYOSTAT_TEXTURE = 'grindless:block/zpm/cryostat_casing'
  const TRUSS = 'grindless:station_truss_casing'
  const TRUSS_TEXTURE = 'grindless:block/luv/station_truss_casing'
  const COIL = 'gtceu:superconducting_coil'
  const CRYO = 'grindless:srf_cryomodule_block'
  const PIPE = 'gtceu:tungstensteel_pipe_casing'
  const TARGET = 'gtceu:tungsten_block'

  AC.table = 'kubejs/data/grindless/tables/accelerators.json'
  AC.cellEUt = 786432
  AC.items = {
    pmma_coated_wafer: { stack: 64 },
    x_ray_mask: { stack: 1 },
    exposed_wafer: { stack: 64 },
    patterned_wafer: { stack: 64 },
    photonic_chip: { stack: 64 },
    silicon_nitride_film: { stack: 64 },
    tungsten_target: { stack: 16 },
    activated_tungsten_target: { stack: 16 },
    empty_antiproton_cartridge: { stack: 16 },
    empty_antiproton_trap: { stack: 1 },
    antiproton_trap: { stack: 1 },
    ican_pellet: { stack: 16 },
    lithium_breeder_blanket: { stack: 1 }
  }
  AC.materials = {
    pmma_resist: { form: 'liquid', colour: 0xE8F0F4, formula: '(C5O2H8)n' },
    liga_developer: { form: 'liquid', colour: 0xC8D8A0, formula: 'C2H5OH(NH3)(H2O)' }
  }

  AC.machines = {
    synchrotron: {
      name: 'synchrotron',
      machine: 'gtceu:synchrotron',
      type: 'synchrotron',
      dataKey: 'grindless_synchrotron',
      lang: 'Synchrotron',
      generator: false,
      // c4: protons, the empty cartridge, the target (chanced) and the circuit; out: the cartridge and the activated target
      maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
      noVoiding: 'grindless.machine.synchrotron.no_voiding'
    },
    cell: {
      name: 'muon_fusion_cell',
      machine: 'gtceu:muon_fusion_cell',
      type: 'muon_catalysed_fusion',
      dataKey: 'grindless_muon_catalysed_fusion',
      lang: 'Muon Fusion Cell',
      generator: true,
      // the blanket (kept) in; liquid D-T in; helium and the bred tritium out
      maxIO: { itemsIn: 1, itemsOut: 0, fluidsIn: 1, fluidsOut: 2 },
      noVoiding: 'grindless.machine.muon_fusion_cell.no_voiding',
      width: 9, depth: 9, height: 11
    },
    trap: {
      name: 'antimatter_trap',
      machine: 'gtceu:antimatter_trap',
      type: 'antimatter_storage',
      dataKey: 'grindless_antimatter_storage',
      lang: 'Antimatter Trap',
      generator: false,
      // c1: 4 cartridges, the empty trap, the circuit; c2: the charged trap, uranium, the circuit
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
      width: 5, depth: 9, height: 5
    }
  }

  // ---------------------------------------------------------------- structures

  // The ring: a 3-wide band (Chebyshev distance 9-11 from the centre) round a free centre. Row 0 of the band takes the parts (X), row 4
  // is casing; on the middle line of the band (distance 10) row 2 is the beam pipe (air) with the 2 cryomodules at the left and right
  // midpoints, and rows 1 and 3 are casing except the 16 dipoles (8 places x above and below the beam: the corners and the side
  // midpoints). Two extraction beamlines (tungstensteel pipe casing on a casing sill) run inward from the back and front midpoints.
  function synchrotronSlices() {
    var N = 23
    var M = 11
    var slices = []
    for (var si = 0; si < N; si++) {
      var rows = []
      for (var r = 0; r < 5; r++) {
        var row = ''
        for (var c = 0; c < N; c++) {
          var dx = c - M
          var dz = si - M
          var d = Math.max(Math.abs(dx), Math.abs(dz))
          var ch = ' '
          if (d >= 9) {
            var corner = Math.abs(dx) === 10 && Math.abs(dz) === 10
            var midpoint = d === 10 && (dx === 0 || dz === 0)
            if (r === 0) ch = 'X'
            else if (r === 4) ch = d === 10 ? 'R' : ((c + si) % 2 === 0 ? 'G' : 'F')
            else if (si === N - 1 && c === M && r === 2) ch = 'S'
            else if (d === 10 && r === 2) ch = (dz === 0 && dx !== 0) ? 'C' : '#'
            else if (d === 10 && (r === 1 || r === 3) && (corner || midpoint)) ch = 'D'
            else if (r === 2) ch = (c + si) % 2 === 0 ? 'G' : 'F'
            else ch = (c + si) % 3 === 0 ? 'R' : 'F'
          } else if (dx === 0 && Math.abs(dz) >= 5) {
            ch = r === 2 ? 'T' : (r === 1 ? 'F' : ' ')
          }
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // A hollow shell (the thorium pattern): row 0 (X) takes the parts, the top row and the walls are casing (F), S is the controller
  // (front wall, row 1, middle). inner(r, si, c) gives the interior; wall(r, si, c) may replace a wall block (or return null).
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
          else if (r === m.height - 1) ch = (wall && wall(r, si, c, m)) || 'F'
          else if (si === last && r === 1 && c === mid) ch = 'S'
          else if (isWall) ch = (wall && wall(r, si, c, m)) || 'F'
          else ch = inner(r, si, c)
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // the cell: the pion target on the floor at the axis, the muon decay channel above it, the cryomodules' linac in the back wall
  function cellInner(r, si, c) {
    if (c === 4 && si === 4) return r === 1 ? 'W' : (r <= 9 ? 'T' : '#')
    return '#'
  }
  function cellWall(r, si, c, m) {
    if (si === 0 && c === 4 && (r === 5 || r === 6)) return 'C'
    var cx = c === 0 || c === m.width - 1
    var cz = si === 0 || si === m.depth - 1
    if (cx && cz) return 'R'
    if (r === m.height - 1) return (cx || cz) ? 'R' : ((c + si) % 2 === 0 ? 'G' : null)
    if (r === 2 || r === 8) return 'R'
    if (r >= 4 && r <= 6) return (c + si) % 2 === 0 ? 'G' : null
    if (r === 3 || r === 7) return (c + si) % 4 === 1 ? 'T' : null
    return null
  }

  // the trap: the bore along the axis (row 2, column 2) is free; the HTS solenoid rings it for slices 3-5, the electron cooler at slice 1
  function trapInner(r, si, c) {
    if (r === 2 && c === 2) return '#'
    if (si >= 3 && si <= 5) return 'M'
    if (si === 1) return 'T'
    return 'F'
  }

  function trapWall(r, si, c, m) {
    var cx = c === 0 || c === m.width - 1
    var cz = si === 0 || si === m.depth - 1
    if (cx && cz) return 'R'
    if (r === m.height - 1) return (cx || cz) ? 'R' : (si % 2 === 1 ? 'G' : null)
    if (si % 4 === 0) return 'R'
    if (r === 2) return 'G'
    if (r === 3 && si % 2 === 1) return 'K'
    return null
  }

  function partsOf(casing, extra) {
    return [Pat.block(casing)].concat(extra)
  }

  AC.machines.synchrotron.spec = {
    slices: synchrotronSlices(),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf.apply(null, partsOf(UV_CASING, [
        Pat.part('energy_input', { min: 1, max: 4 }),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 1, max: 1 })
      ])),
      F: Pat.block(UV_CASING),
      R: Pat.frame(['tungsten_steel']),
      G: Pat.block('gtceu:fusion_glass'),
      D: Pat.block(COIL),
      C: Pat.block(CRYO, { min: 2 }),
      T: Pat.block(PIPE),
      '#': Pat.air()
    }
  }
  AC.machines.cell.spec = {
    slices: shell(AC.machines.cell, cellInner, cellWall),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf.apply(null, partsOf(CRYOSTAT, [
        Pat.part('energy_output', { min: 1, max: 2 }),
        Pat.part('input_bus', { min: 1, max: 1 }),
        Pat.part('input_hatch', { min: 1, max: 1 }),
        Pat.part('output_hatch', { min: 1, max: 2 })
      ])),
      F: Pat.block(CRYOSTAT),
      R: Pat.frame(['tungsten_steel']),
      G: Pat.block('gtceu:fusion_glass'),
      W: Pat.block(TARGET),
      T: Pat.block(PIPE),
      C: Pat.block(CRYO, { min: 2 }),
      '#': Pat.air()
    }
  }
  AC.machines.trap.spec = {
    slices: shell(AC.machines.trap, trapInner, trapWall),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf.apply(null, partsOf(TRUSS, [
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 1, max: 1 })
      ])),
      F: Pat.block(TRUSS),
      M: Pat.block(COIL),
      R: Pat.frame(['tungsten_steel']),
      G: Pat.block('gtceu:fusion_glass'),
      K: Pat.block('gtceu:heatproof_machine_casing'),
      T: Pat.block(PIPE),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- containment

  var LC = null
  function voids(machine) {
    if (LC === null) {
      LC = {
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
      }
    }
    return machine.canVoidRecipeOutputs(LC.ItemCap) === true || machine.canVoidRecipeOutputs(LC.FluidCap) === true
  }
  AC.voids = voids

  var refusals = {}
  function refuse(key) {
    if (!refusals[key]) refusals[key] = ModifierFunction.cancel(Text.translate(key))
    return refusals[key]
  }

  // the synchrotron: refuses to void (the activated target), then GTM's default overclock
  function synchrotronModifier() {
    var failed = false
    var key = AC.machines.synchrotron.noVoiding
    return function (machine, recipe) {
      try {
        if (voids(machine)) return refuse(key)
        return G.parallelHatch.overclock(machine, recipe)
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'synchrotron recipe modifier failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }
  }

  const GEN_OPTS = { maxParallels: 1, name: 'muon_fusion_cell' }

  function cellModifier() {
    var generator = Gen.modifier(GEN_OPTS)
    var failed = false
    var key = AC.machines.cell.noVoiding
    return function (machine, recipe) {
      try {
        if (voids(machine)) return refuse(key)
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'muon fusion cell voiding check failed: ' + e)
        }
        return ModifierFunction.NULL
      }
      return generator(machine, recipe)
    }
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

  // ---------------------------------------------------------------- items and materials

  StartupEvents.registry('item', function (event) {
    Object.keys(AC.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(AC.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(AC.materials).forEach(function (name) {
      var spec = AC.materials[name]
      event.create(name).liquid().color(spec.colour).formula(spec.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var s = AC.machines.synchrotron
    event.create(s.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(s.maxIO.itemsIn, s.maxIO.itemsOut, s.maxIO.fluidsIn, s.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ELECTROLYZER)
    var cell = AC.machines.cell
    event.create(cell.type)
      .category('generator')
      .setEUIO('out')
      .setMaxIOSize(cell.maxIO.itemsIn, cell.maxIO.itemsOut, cell.maxIO.fluidsIn, cell.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_FUSION, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.TURBINE)
    var trap = AC.machines.trap
    event.create(trap.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(trap.maxIO.itemsIn, trap.maxIO.itemsOut, trap.maxIO.fluidsIn, trap.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ELECTROLYZER)
  })

  // ---------------------------------------------------------------- machines

  function tips(name, n) {
    var out = []
    for (var i = 0; i < n; i++) out.push(Text.translate('grindless.machine.' + name + '.tooltip.' + i))
    return out
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var s = AC.machines.synchrotron
    var cell = AC.machines.cell
    var trap = AC.machines.trap
    ;[s, cell, trap].forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      Pat.register(m.machine, m.spec)
    })

    event.create(s.name, 'multiblock')
      .langValue(s.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(s.type)
      .recipeModifier(synchrotronModifier(), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'both', reason: s.noVoiding, name: 'synchrotron' }))
      .appearanceBlock(function () { return Block.getBlock(UV_CASING) })
      .pattern(function (def) { return Pat.build(def, s.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"](tips(s.name, 3))
      .workableCasingModel(UV_TEXTURE, 'grindless:block/multiblock/synchrotron')

    Gen.configure(event.create(cell.name, 'multiblock'), GEN_OPTS)
      .recipeModifier(cellModifier(), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'both', reason: cell.noVoiding, name: 'muon fusion cell' }))
      .langValue(cell.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(cell.type)
      .appearanceBlock(function () { return Block.getBlock(CRYOSTAT) })
      .pattern(function (def) { return Pat.build(def, cell.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"](tips(cell.name, 3))
      .workableCasingModel(CRYOSTAT_TEXTURE, 'grindless:block/multiblock/muon_fusion_cell')

    event.create(trap.name, 'multiblock')
      .langValue(trap.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(trap.type)
      .recipeModifier(function (machine, recipe) { return G.parallelHatch.overclock(machine, recipe) }, true)
      .appearanceBlock(function () { return Block.getBlock(TRUSS) })
      .pattern(function (def) { return Pat.build(def, trap.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"](tips(trap.name, 3))
      .workableCasingModel(TRUSS_TEXTURE, 'grindless:block/multiblock/antimatter_trap')
  })
})()
