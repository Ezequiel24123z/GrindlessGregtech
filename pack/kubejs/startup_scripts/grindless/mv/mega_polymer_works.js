// priority: -6250
// -----------------------------------------------------------------------------------------------
// MV Polymer Works, gtceu:polymer_works (package MEGA-2, docs/eras/mega.md 4.4): the second mega of the family. A steel hall around a
// coil that runs two whole plastic and rubber lines in one pass, with up to 16 copies at once. It has its own recipe type,
// gtceu:polymer_works, whose two recipes are COMPOSED from GTM's live recipes (server_scripts/grindless/mv/mega_polymer_works.js and
// data/grindless/tables/mega_polymer_works.json): the same ratios and the SAME energy, the sum of every stage, spent at MV's 128 EU/t.
//   polyethylene_plate  ethanol + sulfuric acid -> ethylene, + oxygen -> polyethylene, -> plate (the diluted acid is the byproduct)
//   rubber_plate        raw rubber dust + sulfur -> rubber -> plate
//
// How it works (lib/mega.js unchanged, proven by MEGA-0/0c; nothing new here):
// - Parallels: G.mega.chain({ parallel: 'fixed', cap: 16, oc: 'nonperfect', batch: true }): ceiling 16, cut to what the energy hatches
//   carry (floor(max voltage / recipe EU/t)), then to what the inputs and output room allow, then GTM's non-perfect overclock and
//   batch mode (family rules 1, 3 and 4). A composed recipe costs 128 EU/t or more, so an MV hatch pays for one copy: the ceiling grows
//   with the hatches the player feeds, not with the machine. No parallel hatch, no discount (the coil is a structure gate only).
// - One recipe type and one mode, so no mode veto (MEGA-1's modifier is only for several modes).
//
// Structure (5 wide x 5 high x 7 deep, lib/patterns.js): steel solid casing floor, roof and walls, aluminium frame posts at the four
// corners of both ends, tempered glass windows along both sides and a porthole in the back wall, a steel pipe run along the roof, a row of five heating coils on the floor of the hall (lib/coils.js:
// any coil, all of one type, Cupronickel or better; it changes nothing but the shape). The controller sits in the middle of the front wall.
// Parts go in any casing cell: 1 maintenance, 1 or 2 energy hatches, 1 or 2 input buses, 1 to 3 input hatches, 1 or 2 output buses,
// 1 or 2 output hatches.
//
// Textures: overlay dir grindless:block/multiblock/polymer_works (tools/assets/Build-MegaPolymerWorksTextures.ps1). Names / tooltips:
// client_scripts/grindless/mv_mega_polymer_works_lang.js. Controller recipe: server_scripts/grindless/mv/mega_polymer_works.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Coils = G.coils

  const ID = 'polymer_works'
  const TYPE = 'polymer_works'
  const CASING = 'gtceu:solid_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  const GLASS = 'gtceu:tempered_glass'
  const MAX_PARALLELS = 16
  // the lines' contents: items in (raw rubber, sulfur), items out (plates), fluids in (ethanol, sulfuric acid, oxygen), fluids out (diluted acid)
  const MAX_IO = { itemsIn: 2, itemsOut: 2, fluidsIn: 3, fluidsOut: 2 }

  // slices back -> front, rows bottom -> top; 89 casing-or-part cells, 12 frames, 23 glass, 5 steel pipes along the roof, 5 coils, 40 air, the controller
  const END = ['XXXXX', 'FXXXF', 'FXXXF', 'FXXXF', 'XXXXX']
  const BACK = ['XXXXX', 'FXXXF', 'FGGGF', 'FXXXF', 'XXXXX']
  const HALL = ['XXXXX', 'X#K#X', 'G###G', 'G###G', 'XXPXX']
  const SPEC = {
    slices: [
      BACK,
      HALL, HALL, HALL, HALL, HALL,
      ['XXXXX', 'FXSXF', 'FXXXF', 'FXXXF', 'XXXXX']
    ],
    symbols: {
      S: Pat.controller(),
      // 89 cells: at most 12 are parts (1 + 2 + 2 + 3 + 2 + 2), the rest steel casing
      X: Pat.oneOf(
        Pat.block(CASING, { min: 77 }),
        Pat.part('maintenance', { exact: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 3 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 1, max: 2 })
      ),
      F: Pat.frame(['aluminium']),
      G: Pat.block(GLASS),
      P: Pat.block('gtceu:steel_pipe_casing'),
      K: Coils.predicate(),
      '#': Pat.air()
    }
  }

  // published for the recipe script, the lang file, the node test and the bench test
  const PW = G.megaPolymerWorks || (G.megaPolymerWorks = {})
  PW.id = 'gtceu:' + ID
  PW.type = 'gtceu:' + TYPE
  PW.parallels = MAX_PARALLELS
  PW.casing = CASING
  PW.maxIO = MAX_IO

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(MAX_IO.itemsIn, MAX_IO.itemsOut, MAX_IO.fluidsIn, MAX_IO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register('gtceu:' + ID, SPEC)

    var chain = G.mega.chain({ parallel: 'fixed', cap: MAX_PARALLELS, oc: 'nonperfect', batch: true })

    var b = event.create(ID, 'multiblock')
      .langValue('Polymer Works')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return Coils.create(holder) })
      .recipeType(TYPE)
    G.mega.install(b, chain)
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.polymer_works.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.polymer_works'))
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + ID)
  })
})()
