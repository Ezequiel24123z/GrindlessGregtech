// priority: -6600
// -----------------------------------------------------------------------------------------------
// The LV Generator Array (idea from GregTech Leisure's generator_array, docs/research/leisure.md 4.2; our own structure, code and
// textures, nothing copied). A convenience multiblock: it counts apart from the x1.35 target of AGENTS.md rule 7.
//
//   gtceu:generator_array   up to 16 LV generators in one steel hall, with one fuel input and one power output. It runs GTM's own
//                           fuel recipe types, switched in the controller (machine mode): steam turbine, combustion generator, gas
//                           turbine. No new recipe type and no recipe of its own.
//
// What it gains: 16 generators in one structure, one fuel line and one set of dynamo hatches, instead of 16 machines each with its
// pipe and cable. It gives no extra energy: n parallel copies of the single block's own fuel recipe, the same duration, so the same
// EU per unit of fuel (the x2 of server_scripts/grindless/power/generators.js is already in those recipes; there is no other
// multiplier) and no overclock. GTM's Large Combustion Engine and Large Turbines stay the efficient route (oxygen boost, rotors).
//
// Parallels (lib/generators.js): n = min(16, what the dynamo hatches carry / 32 EU/t, the fuel in the input hatches). Every LV fuel
// of the three types is 32 EU/t per run, and each dynamo hatch counts its voltage x amperage. GTM 7.5.3's dynamo hatches are 2 A
// (GTMachines.ENERGY_OUTPUT_HATCH), so an LV hatch carries 2 generators, an MV hatch 8 and an HV hatch 32 (the array stops at 16).
// At LV the player reaches 16 with 8 LV dynamo hatches; at MV with 2. At the cap the array makes 512 EU/t, what one HV single-block
// generator makes (16 LV runs in parallel), so from HV on it gains nothing over GTM's own generators: it is an LV-MV convenience.
// The array is a generator (.generator(true)) and pauses, without losing progress, when its dynamo hatches are full.
//
// The steam turbine recipe gives back 4 mB of distilled water per 640 mB of steam (useful: it is the Heliostat Tower's water). It
// goes to the optional fluid output hatch; without one, steam mode needs the controller's voiding mode set to fluids.
//
// Geometry (slices back -> front, rows bottom -> top, 9 wide; the controller sits in the front face between the two rows of units):
//   row 0      the floor, the only place for parts (X): 1 to 16 dynamo hatches of any tier, 1 or 2 fluid input hatches (the fuel)
//              and 0 or 1 fluid output hatch; at least 8 cells stay casing
//   front      two rows of eight steel gearboxes, the 16 generator units, split by a casing column with the controller in it
//   middle     the shared shaft and fuel header, two rows of steel pipe casing
//   back, top  solid steel casing
//
// Textures: overlay dir grindless:block/multiblock/generator_array (tools/assets/Build-GeneratorArrayTextures.ps1), base casing GTM's
// solid steel machine casing. Names / tooltips: client_scripts/grindless/power_generator_array_lang.js. Controller recipe:
// server_scripts/grindless/power/generator_array.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Gen = G.generators
  const POWER = G.power || (G.power = {})

  const MACHINE = 'gtceu:generator_array'
  const CASING = 'gtceu:solid_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  const GEARBOX = 'gtceu:steel_gearbox'
  const PIPE = 'gtceu:steel_pipe_casing'
  const MAX_PARALLELS = 16
  // machine modes, in the controller's order (index = WorkableMultiblockMachine#setActiveRecipeType)
  const TYPES = ['steam_turbine', 'combustion_generator', 'gas_turbine']

  // published for the controller recipe and the smoke test
  POWER.generatorArray = {
    machine: MACHINE,
    types: TYPES.map(function (t) { return 'gtceu:' + t }),
    maxParallels: MAX_PARALLELS,
    eutPerGenerator: 32,
    parts: { energy_output: { min: 1, max: 16 }, input_hatch: { min: 1, max: 2 }, output_hatch: { min: 0, max: 1 } }
  }

  // ---------------------------------------------------------------- pattern

  const SPEC = {
    slices: [
      // back
      ['XXXXXXXXX', 'CCCCCCCCC', 'CCCCCCCCC', 'CCCCCCCCC'],
      // middle: shaft and fuel header
      ['XXXXXXXXX', 'PPPPPPPPP', 'PPPPPPPPP', 'CCCCCCCCC'],
      // front: 16 generator units, the controller between the two rows
      ['XXXXXXXXX', 'GGGGSGGGG', 'GGGGCGGGG', 'CCCCCCCCC']
    ],
    symbols: {
      S: Pat.controller(),
      // 27 floor cells: 2 to 19 are parts, the rest solid steel casing
      X: Pat.oneOf(
        Pat.block(CASING, { min: 8 }),
        Pat.part('energy_output', { min: 1, max: 16 }),
        Pat.part('input_hatch', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 0, max: 1 })
      ),
      G: Pat.block(GEARBOX),
      P: Pat.block(PIPE),
      C: Pat.block(CASING)
    }
  }

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)

    var types = TYPES.map(function (t) {
      var type = GTRecipeTypes.get(t)
      if (type == null) throw new Error('[grindless/power] recipe type gtceu:' + t + ' is not registered')
      return type
    })

    Gen.configure(event.create('generator_array', 'multiblock'), { maxParallels: MAX_PARALLELS, name: 'generator_array' })
      .langValue('Generator Array')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeTypes(types[0], types[1], types[2])
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.generator_array.tooltip.0'),
        Text.translate('grindless.machine.generator_array.tooltip.1'),
        Text.translate('grindless.machine.generator_array.tooltip.2'),
        Text.translate('grindless.machine.generator_array.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/generator_array')
  })
})()
