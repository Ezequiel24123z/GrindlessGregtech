// priority: -6100
// -----------------------------------------------------------------------------------------------
// The four universal factories of the MV era (idea from GregTech Leisure's "Universal Processing / Assembly / Separation / Mixing
// Plant", docs/research/leisure.md 4.2; GTL credits GTNH for it). Only the idea is taken: GTL's licence does not allow copying, so the
// structure, the numbers, the code and the textures are ours. They are convenience multiblocks (rule 7 of AGENTS.md counts them apart):
// what they gain is many single-block machines in one structure with one set of buses and hatches, nothing else.
//
//   gtceu:universal_processing_factory   11 modes: bender, wiremill, lathe, cutter, extruder, compressor, forge hammer, forming press,
//                                        polarizer, laser engraver, fluid solidifier
//   gtceu:universal_assembly_factory      2 modes: assembler, circuit assembler
//   gtceu:universal_separation_factory    7 modes: centrifuge, electrolyzer, thermal centrifuge, macerator, sifter, extractor,
//                                        electromagnetic separator
//   gtceu:universal_mixing_factory        4 modes: mixer, chemical reactor, chemical bath, ore washer
//
// GTL's lists, minus what GTM 7.5.3 lacks (GTL's own dehydrator) and plus the electromagnetic separator (separation). Every mode is GTM's
// own recipe type, untouched: the recipes are the single blocks' recipes, so no line loses a step (docs/eras/mv.md had discarded a
// universal factory that "erases the lines": this one runs ONE mode at a time and never merges two steps into one recipe).
//
// How it works (all GTM, nothing new):
// - Modes: each `.recipeType(...)` call of GTM's MachineBuilder APPENDS a type, and a controller with more than one type gets GTM's
//   machine mode tab (MachineModeFancyConfigurator). The active mode is persisted (WorkableMultiblockMachine#activeRecipeType) and the
//   recipe lookup only searches that type.
// - Parallels: `bores` (global.grindless.lv.bores, startup_scripts/grindless/lv/multis.js, proven by the LV/MV/HV tests) with a cap of
//   4: GTM's ParallelLogic runs as many copies as the inputs, the output room and the voltage allow (hatch voltage / EU per copy), at
//   most 4, each copy paying its full EU/t; then GTM's standard (non-perfect) overclock uses whatever voltage is left.
// - Mode switch: GTM 7.5.3 does not mark the cached last recipe dirty when the mode changes (MachineModeFancyConfigurator only sets the
//   index), so a machine whose inputs still match the old mode's recipe would keep running it (iron ingots: still rods after switching
//   from lathe to polarizer). The veto below rejects any recipe that is not of the active mode; since the modifier is registered with
//   alwaysTryModifyRecipe, GTM re-applies it when each run ends (RecipeLogic#onRecipeFinish), so the run in progress finishes and the
//   next one is searched in the new mode.
// - Tier: the energy hatches. One MV hatch = MV; two hatches of a tier = one tier up (GTM's amperage rule). The cap of 4 keeps them
//   below our progression multiblocks (rule 2): no speed or energy bonus, no perfect overclock. Exception (LuV-A5, spike S0-4): GTM's
//   NPU recipe needs one ZPM hatch here; two LuV hatches do not run it (HATCH_VOLTAGE_LOCKED below).
// - Several input buses in distinct mode keep different circuits, molds or lenses apart (GTM's own distinct-bus logic).
//
// Structure: one hall for the four (5 wide x 3 high x 3 deep), aluminium frost-proof casing like the rest of the MV family, the
// controller in the middle of the front with a glass window on each side, and a 3-block core behind the windows that tells the four
// apart: steel gearboxes (processing), aluminium frames (assembly: the gantry of the arms), steel pipe casings (separation) and glass
// (mixing: the vats). Parts go in any casing cell (39 cells); the limits are per factory, see FACTORIES.
//
// Textures: overlay dirs grindless:block/multiblock/<machine> (tools/assets/Build-LeisureFactoriesTextures.ps1). Names / tooltips:
// client_scripts/grindless/mv_leisure_factories_lang.js. Controller recipes: server_scripts/grindless/mv/leisure_factories.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const UF = G.universalFactories || (G.universalFactories = {})

  const CASING = 'gtceu:frostproof_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_frost_proof'
  const MAX_PARALLELS = 4

  const DYES = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray',
    'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black']
  const GLASS = ['minecraft:glass', 'minecraft:tinted_glass', 'gtceu:tempered_glass'].concat(
    DYES.map(function (dye) { return 'minecraft:' + dye + '_stained_glass' }))

  // ---------------------------------------------------------------- the shared hall (lib/patterns.js: slices back -> front,
  // rows bottom -> top). 45 cells: 39 casing-or-part cells (X), the 3-block core (K), 2 windows (W) and the controller (S).
  const HALL = [
    // back
    ['XXXXX', 'XXXXX', 'XXXXX'],
    // middle: the core
    ['XXXXX', 'XKKKX', 'XXXXX'],
    // front: controller between two windows
    ['XXXXX', 'XWSWX', 'XXXXX']
  ]
  const PART_CELLS = 39

  // parts: [name, min, max]. Casing fills every other X cell, so its minimum is 39 minus the most parts the factory takes.
  const FACTORIES = [
    {
      id: 'universal_processing_factory',
      name: 'Universal Processing Factory',
      types: ['bender', 'wiremill', 'lathe', 'cutter', 'extruder', 'compressor', 'forge_hammer', 'forming_press', 'polarizer',
        'laser_engraver', 'fluid_solidifier'],
      core: function () { return Pat.block('gtceu:steel_gearbox') },
      coreBlock: 'gtceu:steel_gearbox',
      // the cutter's water or lubricant and the fluid solidifier's fluid go in the one input hatch
      parts: [['energy_input', 1, 2], ['input_bus', 1, 4], ['output_bus', 1, 2], ['input_hatch', 0, 1]]
    },
    {
      id: 'universal_assembly_factory',
      name: 'Universal Assembly Factory',
      types: ['assembler', 'circuit_assembler'],
      core: function () { return Pat.frame(['aluminium']) },
      coreBlock: 'gtceu:aluminium_frame',
      // solder, glue or plastic: one fluid per recipe, a second hatch keeps a second solder ready
      parts: [['energy_input', 1, 2], ['input_bus', 1, 4], ['output_bus', 1, 2], ['input_hatch', 0, 2]]
    },
    {
      id: 'universal_separation_factory',
      name: 'Universal Separation Factory',
      types: ['centrifuge', 'electrolyzer', 'thermal_centrifuge', 'macerator', 'sifter', 'extractor', 'electromagnetic_separator'],
      core: function () { return Pat.block('gtceu:steel_pipe_casing') },
      coreBlock: 'gtceu:steel_pipe_casing',
      // centrifuge and electrolyzer give up to 6 items and 6 fluids per recipe; each output hatch holds one fluid
      parts: [['energy_input', 1, 2], ['input_bus', 1, 2], ['output_bus', 1, 4], ['input_hatch', 0, 1], ['output_hatch', 0, 6]]
    },
    {
      id: 'universal_mixing_factory',
      name: 'Universal Mixing Factory',
      types: ['mixer', 'chemical_reactor', 'chemical_bath', 'ore_washer'],
      core: function () { return Pat.block(GLASS) },
      coreBlock: 'minecraft:glass',
      // the chemical reactor takes up to 3 fluids and gives up to 2; the dust-only mixer recipes need no hatch at all
      parts: [['energy_input', 1, 2], ['input_bus', 1, 4], ['output_bus', 1, 2], ['input_hatch', 0, 3], ['output_hatch', 0, 2]]
    }
  ]

  function specOf(f) {
    var maxParts = 0
    var options = []
    f.parts.forEach(function (p) {
      maxParts += p[2]
      options.push(Pat.part(p[0], { min: p[1], max: p[2] }))
    })
    options.unshift(Pat.block(CASING, { min: PART_CELLS - maxParts }))
    return {
      slices: HALL,
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, options),
        K: f.core(),
        W: Pat.block(GLASS)
      }
    }
  }

  // published for the crafting script, the lang file and the smoke test
  UF.parallels = MAX_PARALLELS
  UF.casing = CASING
  UF.factories = FACTORIES.map(function (f) {
    return {
      id: 'gtceu:' + f.id,
      name: f.name,
      types: f.types.map(function (t) { return 'gtceu:' + t }),
      coreBlock: f.coreBlock,
      parts: f.parts.map(function (p) { return { name: p[0], min: p[1], max: p[2] } })
    }
  })

  // true = skip: the recipe belongs to another mode than the active one (see "Mode switch" in the header)
  function otherMode(machine, recipe) {
    return String(recipe.getType().registryName) !== String(machine.getRecipeType().registryName)
  }

  // GTM recipes that run here only when ONE energy hatch reaches their voltage: two hatches of a lower tier (GTM's one-tier-up rule,
  // WorkableElectricMultiblockMachine#getMaxVoltage) do not count for them. GTM's NPU (80,000 EU/t) stays a ZPM recipe: from LuV the
  // biofoundry makes its stem cells and sterile medium, and two LuV hatches would otherwise run it here, while the LuV NPU comes only
  // from the organoid lab (docs/eras/luv.md, "Only from there, and the cuts"; spike S0-4). Recipe id -> the voltage one hatch needs.
  const HATCH_VOLTAGE_LOCKED = { 'gtceu:circuit_assembler/neuro_processor': 131072 }
  UF.hatchVoltageLocked = HATCH_VOLTAGE_LOCKED

  function recipeIdOf(recipe) {
    try {
      return String(recipe.getId())
    } catch (e) {
      return String(recipe.id)
    }
  }

  // true = skip: a locked recipe on hatches that each fall short of its voltage (refused too when the hatches cannot be read)
  function belowHatchVoltage(machine, recipe) {
    var need = HATCH_VOLTAGE_LOCKED[recipeIdOf(recipe)]
    if (need === undefined) return false
    try {
      return Number(machine.getEnergyContainer().getHighestInputVoltage()) < need
    } catch (e) {
      return true
    }
  }

  function assemblyVeto(machine, recipe) {
    return otherMode(machine, recipe) || belowHatchVoltage(machine, recipe)
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var bores = G.lv.bores

    FACTORIES.forEach(function (f) {
      var spec = specOf(f)
      Pat.register('gtceu:' + f.id, spec)

      var b = event.create(f.id, 'multiblock')
        .langValue(f.name)
        .rotationState(RotationState.NON_Y_AXIS)
      // every recipeType() call appends one mode; the first one is the mode a new controller starts in
      f.types.forEach(function (t) { b = b.recipeType(t) })
      b.recipeModifier(bores(f.id === 'universal_assembly_factory' ? assemblyVeto : otherMode, MAX_PARALLELS), true)
        .appearanceBlock(GTBlocks.CASING_ALUMINIUM_FROSTPROOF)
        .pattern(function (def) { return Pat.build(def, spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + f.id + '.tooltip.0'),
          Text.translate('grindless.machine.universal_factory.tooltip.1'),
          Text.translate('grindless.machine.' + f.id + '.tooltip.2'),
          Text.translate('grindless.machine.' + f.id + '.tooltip.3')
        ])
        .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + f.id)
    })
  })
})()
