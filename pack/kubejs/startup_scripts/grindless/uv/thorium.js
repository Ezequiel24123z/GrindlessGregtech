// priority: -10700
// -----------------------------------------------------------------------------------------------
// UV's thorium line (docs/eras/uv.md, machines 1 and 2, line 3; package UV-A1): the pyroprocessing cell and the accelerator-driven reactor,
// their recipe types, and the few ids UV-F1 did not register. The recipes come from data/grindless/tables/thorium.json
// (server_scripts/grindless/uv/thorium.js); the three thorium rows of IV's fuel fabrication plant from thorium_fabrication.json.
//
//   gtceu:pyroprocessing_cell        the molten-salt pyroprocess (EBR-II at Argonne): spent thorium fuel in, U-233 and thorium out, the
//                                    LiCl salt kept in a loop. Electric multiblock with a parallel hatch, in radiation-proof casing; it
//                                    refuses to void (the radioactive waste goes to ZPM's waste retrieval plant).
//   gtceu:pyroprocessing             its recipe type (EU in). Circuit 1: spent oxide fuel -> thorium-uranium metal. 2: the metal -> U-233
//                                    and thorium. 3: spent nitride fuel -> U-233, thorium and the 15N back. 4: the loaded salt cleaned.
//   gtceu:accelerator_driven_reactor a subcritical core driven by a proton beam on a lead-bismuth target (MYRRHA, Rubbia's energy
//                                    amplifier): a generator multiblock fed by an assembly, giving 1,572,864 EU/t (3 A UV).
//   gtceu:accelerator_driven         its recipe type (generator, EU out). One recipe per assembly; polonium-210 is the target's
//                                    byproduct, held in the output hatch as a contained fluid.
//   The type stays out of the TYPES list of server_scripts/grindless/power/generators.js: the figure written is the final one
//   (docs/research/uv-s0.md, S0-6).
//
// New ids (the F1 ones are in uv/foundation.js and are not registered again):
//   items     grindless:u233_fuel_rod (the thorium cycle's rod; burnt by IV's fission reactor once tables/fission_cores.json lists it)
//   materials triton_nitric_oxide (the NO of Triton nitrogen), lead_bismuth_eutectic, polonium_210, thorium_uranium_metal,
//             licl_salt, loaded_licl_salt
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top): the cell is 7 x 7 x 7 (a PTFE column in a heatproof and glass
// vessel), the reactor 11 x 13 x 11 (a UV-casing pool ring, a pipe column up the core, the 4 SRF cryomodules in the back wall).
// Textures: tools/assets/Build-UVThoriumTextures.ps1. Names: client_scripts/grindless/uv_thorium_lang.js.
// Published for the recipe script and the smoke test: global.grindless.thorium.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Gen = G.generators
  const TH = G.thorium || (G.thorium = {})
  const LOG = '[grindless/uv] '

  const SHIELD = 'gtnn:radiation_proof_machine_casing'
  const SHIELD_TEXTURE = 'gtnn:block/casings/solid/radiation_proof_machine_casing'
  const ROBUST = 'gtceu:robust_machine_casing'
  const ROBUST_TEXTURE = 'gtceu:block/casings/solid/machine_casing_robust_tungstensteel'
  const PIPE = 'gtceu:ptfe_pipe_casing'
  const GLASS = 'gtceu:laminated_glass'
  const HEAT = 'gtceu:heatproof_machine_casing'
  const POOL = 'gtceu:uv_machine_casing'
  const CRYO = 'grindless:srf_cryomodule_block'
  const TUNGSTEN_PIPE = 'gtceu:tungstensteel_pipe_casing'
  const COIL = 'gtceu:superconducting_coil'

  TH.table = 'kubejs/data/grindless/tables/thorium.json'
  TH.fabricationTable = 'kubejs/data/grindless/tables/thorium_fabrication.json'
  TH.noVoiding = 'grindless.machine.pyroprocessing_cell.no_voiding'
  TH.reactorNoVoiding = 'grindless.machine.accelerator_driven_reactor.no_voiding'
  TH.reactorEUt = 1572864
  TH.items = {
    u233_fuel_rod: { stack: 16 }
  }
  TH.materials = {
    triton_nitric_oxide: { form: 'gas', colour: 0xE0A8C8, formula: '15NO(T)' },
    lead_bismuth_eutectic: { form: 'liquid', colour: 0x8A8F9E, formula: 'PbBi' },
    polonium_210: { form: 'liquid', colour: 0x9EE08A, formula: 'Po-210', radioactive: true },
    thorium_uranium_metal: { form: 'dust', colour: 0x7A8A6E, formula: 'ThU' },
    licl_salt: { form: 'liquid', colour: 0xC8E0F0, formula: 'LiCl' },
    loaded_licl_salt: { form: 'liquid', colour: 0xA8C0A0, formula: 'LiCl(UCl3)' }
  }

  // one definition per machine; the recipe script reads machine, type, dataKey and maxIO
  TH.machines = {
    cell: {
      name: 'pyroprocessing_cell',
      machine: 'gtceu:pyroprocessing_cell',
      type: 'pyroprocessing',
      dataKey: 'grindless_pyroprocessing',
      lang: 'Pyroprocessing Cell',
      generator: false,
      // items in: spent fuel, the lithium charge and the circuit; out: metal, U-233, thorium; fluids in: the salt charge and the nitrogen
      maxIO: { itemsIn: 3, itemsOut: 3, fluidsIn: 2, fluidsOut: 2 },
      width: 7, depth: 7, height: 7
    },
    reactor: {
      name: 'accelerator_driven_reactor',
      machine: 'gtceu:accelerator_driven_reactor',
      type: 'accelerator_driven',
      dataKey: 'grindless_accelerator_driven',
      lang: 'Accelerator-Driven Reactor',
      generator: true,
      // the assembly in, the spent assembly out; the lead-bismuth charge in, the polonium out
      maxIO: { itemsIn: 1, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 },
      width: 11, depth: 11, height: 13
    }
  }

  // A hollow shell: row 0 (X) takes the parts, the top row and the walls are casing (F), S is the controller (front wall, row 1, middle).
  // inner(row, back-front index, column) gives the interior; wall(row, index, column) may replace a wall block (or return null).
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

  function cellInner(r, si, c) {
    var dx = Math.abs(c - 3)
    var dz = Math.abs(si - 3)
    if (dx === 0 && dz === 0) return 'P'
    if (dx <= 1 && dz <= 1) return r === 1 ? 'H' : (r <= 4 ? 'L' : '#')
    return '#'
  }

  function reactorInner(r, si, c) {
    var dx = Math.abs(c - 5)
    var dz = Math.abs(si - 5)
    if (dx === 0 && dz === 0) return r <= 11 ? 'T' : '#'
    // the pool: a ring of UV casing at the foot of the vessel
    if (r === 1 && Math.max(dx, dz) === 4) return 'U'
    return '#'
  }

  // the SRF cryomodules: four blocks in the back wall at row 6
  function reactorWall(r, si, c) {
    return si === 0 && r === 6 && c >= 4 && c <= 7 ? 'C' : null
  }

  // QR-S3: dress(slices, wall, rule) rewrites plain wall cells (char `wall`) through rule(x, y, z, W, H, D) -> char or null. Row 0 is never touched.
  function dress(slices, wall, rule) {
    var D = slices.length
    var H = slices[0].length
    var W = slices[0][0].length
    return slices.map(function (rows, z) {
      return rows.map(function (row, y) {
        if (y === 0) return row
        var out = ''
        for (var x = 0; x < W; x++) {
          var ch = row.charAt(x)
          var r = ch === wall ? rule(x, y, z, W, H, D) : null
          out += r || ch
        }
        return out
      })
    })
  }

  // the pyroprocessing cell, an electrorefiner vessel: tungsten steel posts and roof ring, a heatproof furnace band at the foot and
  // under the roof, glass sight windows between, a PTFE salt duct on the roof
  function cellRule(x, y, z, W, H, D) {
    var cx = x === 0 || x === W - 1
    var cz = z === 0 || z === D - 1
    if (y === H - 1) {
      if (cx || cz) return 'M'
      return Math.abs(x - 3) <= 1 && Math.abs(z - 3) <= 1 ? 'P' : null
    }
    if (cx && cz) return 'M'
    if (y === 1 || y === 5) return 'H'
    if ((y === 2 || y === 3 || y === 4) && (cx ? z : x) >= 2 && (cx ? z : x) <= 4) return 'L'
    return null
  }

  // the reactor, a subcritical drum: tungsten steel posts and roof ring, a stack of heatproof blanket bands, two superconducting beam-ring
  // coil bands, fusion glass viewing windows between them, a coil ring on the roof round the beam entry
  function reactorRule(x, y, z, W, H, D) {
    var cx = x === 0 || x === W - 1
    var cz = z === 0 || z === D - 1
    var along = cx ? z : x
    if (y === H - 1) {
      if (cx || cz) return 'M'
      return Math.max(Math.abs(x - 5), Math.abs(z - 5)) === 3 ? 'K' : null
    }
    if (cx && cz) return 'M'
    if (y === 2 || y === 3 || y === 9 || y === 10) return 'H'
    if (y === 4 || y === 8) return 'K'
    if (y >= 5 && y <= 7 && along >= 2 && along <= 8) return 'G'
    return null
  }

  function specOf(m, casing, inner, wall, extraParts, rule) {
    var parts = [
      Pat.block(casing),
      Pat.part('input_bus', { min: 1, max: 1 }),
      Pat.part('input_hatch', { min: 1, max: m.generator ? 1 : 2 }),
      Pat.part('output_bus', { min: 1, max: m.generator ? 1 : 2 }),
      Pat.part('output_hatch', { min: 1, max: m.generator ? 1 : 2 })
    ].concat(extraParts)
    return {
      slices: dress(shell(m, inner, wall), 'F', rule),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, parts),
        F: Pat.block(casing),
        P: Pat.block(PIPE),
        T: Pat.block(TUNGSTEN_PIPE),
        L: Pat.block(GLASS),
        H: Pat.block(HEAT),
        U: Pat.block(POOL),
        M: Pat.frame(['tungsten_steel']),
        K: Pat.block(COIL),
        G: Pat.block('gtceu:fusion_glass'),
        C: Pat.block(CRYO, { min: 4 }),
        '#': Pat.air()
      }
    }
  }
  TH.machines.cell.spec = specOf(TH.machines.cell, SHIELD, cellInner, null, [Pat.part('energy_input', { min: 1, max: 2 }), G.parallelHatch.part()], cellRule)
  TH.machines.reactor.spec = specOf(TH.machines.reactor, ROBUST, reactorInner, reactorWall, [Pat.part('energy_output', { min: 1, max: 4 })], reactorRule)

  // ---------------------------------------------------------------- containment

  var LC = null
  function lazy() {
    if (LC === null) {
      LC = {
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
      }
    }
    return LC
  }

  // true while the controller is set to void items or fluids (GTM's IVoidable): the waste or the polonium would be thrown away
  function voids(machine) {
    var c = lazy()
    return machine.canVoidRecipeOutputs(c.ItemCap) === true || machine.canVoidRecipeOutputs(c.FluidCap) === true
  }
  TH.voids = voids

  var cellNoVoiding = null
  var reactorNoVoiding = null

  function cellModifier() {
    var failed = false
    var parallelThenOverclock = G.parallelHatch.modifier(G.parallelHatch.overclock)
    return function (machine, recipe) {
      try {
        if (voids(machine)) {
          if (cellNoVoiding === null) cellNoVoiding = ModifierFunction.cancel(Text.translate(TH.noVoiding))
          return cellNoVoiding
        }
        return parallelThenOverclock(machine, recipe)
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'pyroprocessing cell recipe modifier failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }
  }

  const GEN_OPTS = { maxParallels: 1, name: 'accelerator_driven_reactor' }

  function reactorModifier() {
    var generator = Gen.modifier(GEN_OPTS)
    var failed = false
    return function (machine, recipe) {
      try {
        if (voids(machine)) {
          if (reactorNoVoiding === null) reactorNoVoiding = ModifierFunction.cancel(Text.translate(TH.reactorNoVoiding))
          return reactorNoVoiding
        }
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'accelerator-driven reactor voiding check failed: ' + e)
        }
        return ModifierFunction.NULL
      }
      return generator(machine, recipe)
    }
  }

  // one EMI line per recipe, read from its data: what the circuit or the assembly does
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

  function tooltips(item, name) {
    item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
    item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(TH.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(TH.items[name].stack)
      tooltips(item, name)
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(TH.materials).forEach(function (name) {
      var spec = TH.materials[name]
      var material = event.create(name)
      if (spec.form === 'gas') material.gas()
      else if (spec.form === 'liquid') material.liquid()
      else material.dust()
      material.color(spec.colour).formula(spec.formula)
      if (spec.radioactive) material.radioactiveHazard(1)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var cell = TH.machines.cell
    event.create(cell.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(cell.maxIO.itemsIn, cell.maxIO.itemsOut, cell.maxIO.fluidsIn, cell.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
    var reactor = TH.machines.reactor
    event.create(reactor.type)
      .category('generator')
      .setEUIO('out')
      .setMaxIOSize(reactor.maxIO.itemsIn, reactor.maxIO.itemsOut, reactor.maxIO.fluidsIn, reactor.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_FUSION, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.TURBINE)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var cell = TH.machines.cell
    var reactor = TH.machines.reactor
    var cellType = GTRecipeTypes.get(cell.type)
    var reactorType = GTRecipeTypes.get(reactor.type)
    if (cellType == null) throw new Error(LOG + 'recipe type gtceu:' + cell.type + ' is not registered')
    if (reactorType == null) throw new Error(LOG + 'recipe type gtceu:' + reactor.type + ' is not registered')
    cellType.addDataInfo(infoOf(cell.dataKey))
    reactorType.addDataInfo(infoOf(reactor.dataKey))
    Pat.register(cell.machine, cell.spec)
    Pat.register(reactor.machine, reactor.spec)

    event.create(cell.name, 'multiblock')
      .langValue(cell.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(cell.type)
      .recipeModifier(cellModifier(), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'both', reason: TH.noVoiding, name: 'pyroprocessing cell' }))
      .appearanceBlock(function () { return Block.getBlock(SHIELD) })
      .pattern(function (def) { return Pat.build(def, cell.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.pyroprocessing_cell.tooltip.0'),
        Text.translate('grindless.machine.pyroprocessing_cell.tooltip.1'),
        Text.translate('grindless.machine.pyroprocessing_cell.tooltip.2'),
        Text.translate('grindless.machine.parallel_hatch.tooltip')
      ])
      .workableCasingModel(SHIELD_TEXTURE, 'grindless:block/multiblock/pyroprocessing_cell')

    Gen.configure(event.create(reactor.name, 'multiblock'), GEN_OPTS)
      .recipeModifier(reactorModifier(), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'both', reason: TH.reactorNoVoiding, name: 'accelerator-driven reactor' }))
      .langValue(reactor.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(reactor.type)
      .appearanceBlock(GTBlocks.CASING_TUNGSTENSTEEL_ROBUST)
      .pattern(function (def) { return Pat.build(def, reactor.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.accelerator_driven_reactor.tooltip.0'),
        Text.translate('grindless.machine.accelerator_driven_reactor.tooltip.1'),
        Text.translate('grindless.machine.accelerator_driven_reactor.tooltip.2')
      ])
      .workableCasingModel(ROBUST_TEXTURE, 'grindless:block/multiblock/accelerator_driven_reactor')

    if (G.parallelHatch && G.parallelHatch.machines && G.parallelHatch.machines.indexOf(cell.machine) < 0) G.parallelHatch.machines.push(cell.machine)
  })
})()
