// priority: -1850
// -----------------------------------------------------------------------------------------------
// HV Coil Chemical Plant, gtceu:coil_chemical_plant (package MEGA-3, docs/eras/mega.md 4.5): the coil-scaled parallel large chemical
// reactor. It runs GTM's gtceu:large_chemical_reactor recipe type (which already holds every chemical_reactor recipe) and is better
// than GTM's single LCR in exactly these ways: parallels that grow with the heating coil, a coil energy discount, perfect overclock
// kept, and more hatches.
//
// How it works (lib/mega.js unchanged, proven by MEGA-0/0c; nothing new here):
// - Parallels: G.mega.chain({ parallel: 'coil', cap: 64, discount: { rate: 0.95, floor: 0.80, baseK: 1800 }, oc: 'perfect', batch: true }).
//   Ceiling 2^floor(K / 900) up to 64 (Cupronickel 4, Kanthal 8, Nichrome 16, RTM alloy 32, HSS-G 64), cut to what the energy hatches
//   carry (floor(max voltage / recipe EU/t)), then to what the inputs and output room allow (family rule 1: always energy-bound).
// - Discount: the EU/t times 0.95 per coil step above Cupronickel, never below 0.80, GTM's EBF rate (Kanthal 0.95, Nichrome 0.90,
//   RTM alloy 0.857, HSS-G 0.815). Then GTM's perfect subtick overclock (GTM's LCR rule, family rule 3) and batch mode (rule 4).
// - No parallel hatch (the LuV Mega Chemical Complex takes it), no new recipe, no generator.
//
// Structure (5 wide x 6 high x 7 deep, lib/patterns.js): PTFE inert casing shell with steel frame posts at the corners of both end walls and a glass window band in each; five PTFE pipe casings down the core; two full
// rings of 8 heating coils (16) in the 2nd and 4th core slices; tempered glass windows in the three slices between. The controller
// sits in the middle of the front wall, one row above the floor. Parts go in any casing cell: 1 maintenance, 1 or 2 energy hatches,
// up to 4 fluid input and 4 fluid output hatches, up to 2 input buses and 2 output buses.
//
// Textures: overlay dir grindless:block/multiblock/coil_chemical_plant (tools/assets/Build-MegaCoilChemicalPlantTextures.ps1). Names /
// tooltips: client_scripts/grindless/hv_mega_coil_chemical_plant_lang.js. Controller recipe: server_scripts/grindless/hv/mega_coil_chemical_plant.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Coils = G.coils

  const ID = 'coil_chemical_plant'
  const TYPE = 'large_chemical_reactor'
  const CASING = 'gtceu:inert_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_inert_ptfe'
  const PIPE = 'gtceu:ptfe_pipe_casing'
  const GLASS = 'gtceu:tempered_glass'
  const MAX_PARALLELS = 64
  const DISCOUNT = { rate: 0.95, floor: 0.80, baseK: 1800 }
  const HATCHES = { energy: [1, 2], inputBus: 2, outputBus: 2, inputHatch: 4, outputHatch: 4 }

  // slices back -> front, rows bottom -> top; 121 casing-or-part cells, 16 steel frames, 27 glass, 5 pipe casings, 16 coils, 24 air, the controller
  const WALL = ['XXXXX', 'FXXXF', 'FGGGF', 'FGGGF', 'FXXXF', 'XXXXX']
  const RING = ['XXXXX', 'XKKKX', 'XKPKX', 'XKKKX', 'XXXXX', 'XXXXX']
  const MID = ['XXXXX', 'G###G', 'G#P#G', 'G###G', 'XXXXX', 'XXXXX']
  const FRONT = ['XXXXX', 'FXSXF', 'FXXXF', 'FGGGF', 'FXXXF', 'XXXXX']
  const SPEC = {
    slices: [
      WALL,
      MID, RING, MID, RING, MID,
      FRONT
    ],
    symbols: {
      S: Pat.controller(),
      // 121 cells: at most 15 are parts (1 + 2 + 2 + 2 + 4 + 4), the rest PTFE casing
      X: Pat.oneOf(
        Pat.block(CASING, { min: 106 }),
        Pat.part('maintenance', { exact: 1 }),
        Pat.part('energy_input', { min: HATCHES.energy[0], max: HATCHES.energy[1] }),
        Pat.part('input_bus', { max: HATCHES.inputBus }),
        Pat.part('output_bus', { max: HATCHES.outputBus }),
        Pat.part('input_hatch', { max: HATCHES.inputHatch }),
        Pat.part('output_hatch', { max: HATCHES.outputHatch })
      ),
      P: Pat.block(PIPE),
      F: Pat.frame(['steel']),
      G: Pat.block(GLASS),
      K: Coils.predicate(),
      '#': Pat.air()
    }
  }

  // published for the recipe script, the lang file, the node test and the bench test
  const CP = G.megaCoilChemicalPlant || (G.megaCoilChemicalPlant = {})
  CP.id = 'gtceu:' + ID
  CP.type = 'gtceu:' + TYPE
  CP.parallels = MAX_PARALLELS
  CP.discount = DISCOUNT
  CP.casing = CASING
  CP.hatches = HATCHES

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register('gtceu:' + ID, SPEC)

    var chain = G.mega.chain({ parallel: 'coil', cap: MAX_PARALLELS, discount: DISCOUNT, oc: 'perfect', batch: true })

    var b = event.create(ID, 'multiblock')
      .langValue('Coil Chemical Plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return Coils.create(holder) })
      .recipeType(TYPE)
    G.mega.install(b, chain)
      .appearanceBlock(GTBlocks.CASING_PTFE_INERT)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.coil_chemical_plant.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.large_chemical_reactor')),
        Text.translate('gtceu.machine.perfect_oc'),
        Text.translate('grindless.machine.coil_chemical_plant.tooltip.1')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + ID)
  })
})()
