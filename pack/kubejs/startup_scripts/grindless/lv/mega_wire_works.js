// priority: -4950
// -----------------------------------------------------------------------------------------------
// LV Wire Works, gtceu:wire_works (package MEGA-1, docs/eras/mega.md 4.3): the first mega of the family. A steel hall that runs GTM's
// own wiremill and bender recipes, one mode at a time (the player picks it in the controller's machine mode tab), with up to 8
// copies at once.
//
// How it works (lib/mega.js unchanged, proven by MEGA-0/0c; nothing new here):
// - Parallels: G.mega.chain({ parallel: 'fixed', cap: 8, oc: 'nonperfect', batch: true }): ceiling 8, cut to what the energy hatches
//   carry (floor(max voltage / recipe EU/t)), then to what the inputs and output room allow, then GTM's non-perfect overclock on the
//   voltage left over and batch mode (family rules 1, 3 and 4). With LV hatches (1 or 2 x 32 EU/t) only cheap recipes reach 8: the
//   ceiling grows with the hatches the player can feed, not with the machine. No parallel hatch, no discount, no new recipe.
// - Mode veto: GTM 7.5.3 does not mark the cached last recipe dirty when the mode changes, so a machine whose inputs still match the
//   old mode's recipe would keep running it. The first modifier rejects any recipe that is not of the active mode (same fix as the
//   MV universal factories, mv/leisure_factories.js).
//
// Structure (5 wide x 4 high x 5 deep, lib/patterns.js): steel solid casing floor and roof, steel casing walls, four steel frame
// posts in the corners, glass windows, two spool coils and a roof pipe line around a 3 x 3 x 2 hall; the controller sits in the middle of the front wall. Parts go in any casing
// cell: 1 maintenance, 1 or 2 energy hatches, 1 to 4 input buses, 1 or 2 output buses.
//
// Textures: overlay dir grindless:block/multiblock/wire_works (tools/assets/Build-MegaWireWorksTextures.ps1). Names / tooltips:
// client_scripts/grindless/lv_mega_wire_works_lang.js. Controller recipe: server_scripts/grindless/lv/mega_wire_works.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns

  const ID = 'wire_works'
  const CASING = 'gtceu:solid_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  const MAX_PARALLELS = 8
  // every recipeType() call appends one mode; the first one is the mode a new controller starts in
  const TYPES = ['wiremill', 'bender']

  // slices back -> front, rows bottom -> top; 56 casing-or-part cells, 8 frames, 14 glass, 2 coil spools, 3 pipe, 16 air, the controller
  // (QR-S1: glass sight windows into the mill hall, two cupronickel spool coils on the hall floor and a steel pipe line in the roof)
  const SPEC = {
    slices: [
      ['XXXXX', 'FGGGF', 'FGGGF', 'XXXXX'],
      ['XXXXX', 'G###G', 'G###G', 'XXPXX'],
      ['XXXXX', 'X#C#X', 'X#C#X', 'XXPXX'],
      ['XXXXX', 'G###G', 'G###G', 'XXPXX'],
      ['XXXXX', 'FXSXF', 'FXXXF', 'XXXXX']
    ],
    symbols: {
      S: Pat.controller(),
      // 56 cells: at most 9 are parts (1 + 2 + 4 + 2), the rest steel casing
      X: Pat.oneOf(
        Pat.block(CASING, { min: 47 }),
        Pat.part('maintenance', { exact: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { min: 1, max: 4 }),
        Pat.part('output_bus', { min: 1, max: 2 })
      ),
      F: Pat.frame(['steel']),
      G: Pat.block('minecraft:glass'),
      C: Pat.block('gtceu:cupronickel_coil_block'),
      P: Pat.block('gtceu:steel_pipe_casing'),
      '#': Pat.air()
    }
  }
  // true = the recipe belongs to another mode than the active one
  function otherMode(machine, recipe) {
    return String(recipe.getType().registryName) !== String(machine.getRecipeType().registryName)
  }

  // published for the crafting script, the lang file, the node test and the bench test
  const WW = G.megaWireWorks || (G.megaWireWorks = {})
  WW.id = 'gtceu:' + ID
  WW.types = TYPES.map(function (t) { return 'gtceu:' + t })
  WW.parallels = MAX_PARALLELS
  WW.casing = CASING

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register('gtceu:' + ID, SPEC)

    var veto = function (machine, recipe) {
      return otherMode(machine, recipe) ? ModifierFunction.NULL : ModifierFunction.IDENTITY
    }
    var chain = [veto].concat(G.mega.chain({ parallel: 'fixed', cap: MAX_PARALLELS, oc: 'nonperfect', batch: true }))

    var b = event.create(ID, 'multiblock')
      .langValue('Wire Works')
      .rotationState(RotationState.NON_Y_AXIS)
    TYPES.forEach(function (t) { b = b.recipeType(t) })
    G.mega.install(b, chain)
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.wire_works.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_2.tooltip', Text.translate('gtceu.wiremill'), Text.translate('gtceu.bender'))
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + ID)
  })
})()
