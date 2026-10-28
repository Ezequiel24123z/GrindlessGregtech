// priority: -1250
// -----------------------------------------------------------------------------------------------
// EV Ore Refinery, gtceu:ore_refinery (package MEGA-4, docs/eras/mega.md 4.6): a titanium hall that takes a raw ore (what the drills and
// the vein drills deliver) through the whole ore line in one pass, up to 64 copies at once. It has its own recipe type, gtceu:ore_refinery,
// whose recipes are COMPOSED from GTM's live recipes (server_scripts/grindless/ev/mega_ore_refinery.js and
// data/grindless/tables/mega_ore_refinery.json): one recipe per ore with a live full chain, raw ore -> macerator -> ore washer ->
// thermal centrifuge -> macerator -> dust, the SUM of the four stages' energy, spent at EV's 512 EU/t.
//
// How it works (lib/mega.js unchanged, proven by MEGA-0/0c; nothing new here):
// - Parallels: G.mega.chain({ parallel: 'fixed', cap: 64, oc: 'nonperfect', batch: true }): ceiling 64, cut to what the energy hatches
//   carry (floor(max voltage / recipe EU/t)), then to what the inputs and output room allow, then GTM's non-perfect overclock and batch
//   mode (family rules 1, 3 and 4). No coil, no parallel hatch, no discount.
// - One recipe type and one mode, so no mode veto.
//
// Structure (7 wide x 7 high x 9 deep, lib/patterns.js): stable titanium casing floor, roof, walls and both ends, with steel gearbox casings
// along the floor of the hall (three rows of seven). The controller sits in the middle of the front wall. Parts go in any casing cell:
// 1 or 2 energy hatches, 1 or 2 input buses, 1 or 2 output buses, 1 input hatch (the water) and 1 muffler.
//
// Textures: overlay dir grindless:block/multiblock/ore_refinery (tools/assets/Build-MegaOreRefineryTextures.ps1). Names / tooltips:
// client_scripts/grindless/ev_mega_ore_refinery_lang.js. Controller recipe: server_scripts/grindless/ev/mega_ore_refinery.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns

  const ID = 'ore_refinery'
  const TYPE = 'ore_refinery'
  const CASING = 'gtceu:stable_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_stable_titanium'
  const GEARBOX = 'gtceu:steel_gearbox'
  const MAX_PARALLELS = 64
  // one raw ore + the water in; the dusts and up to eight byproducts out
  const MAX_IO = { itemsIn: 1, itemsOut: 9, fluidsIn: 1, fluidsOut: 0 }

  // slices back -> front, rows bottom -> top; 265 casing-or-part cells, 21 gearboxes, 154 air, the controller
  const END = ['XXXXXXX', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX']
  const HALL = ['XXXXXXX', 'X#BBB#X', 'X#####X', 'X#####X', 'X#####X', 'X#####X', 'XXXXXXX']
  const FRONT = ['XXXXXXX', 'XXXXXXX', 'XXXXXXX', 'XXXSXXX', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX']
  const SPEC = {
    slices: [END, HALL, HALL, HALL, HALL, HALL, HALL, HALL, FRONT],
    symbols: {
      S: Pat.controller(),
      // 265 cells: at most 8 are parts (2 + 2 + 2 + 1 + 1), the rest stable titanium casing
      X: Pat.oneOf(
        Pat.block(CASING, { min: 257 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { exact: 1 }),
        Pat.part('muffler', { exact: 1 })
      ),
      B: Pat.block(GEARBOX),
      '#': Pat.air()
    }
  }

  // published for the recipe script, the lang file, the node test and the bench test
  const OR = G.megaOreRefinery || (G.megaOreRefinery = {})
  OR.id = 'gtceu:' + ID
  OR.type = 'gtceu:' + TYPE
  OR.parallels = MAX_PARALLELS
  OR.casing = CASING
  OR.maxIO = MAX_IO

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(MAX_IO.itemsIn, MAX_IO.itemsOut, MAX_IO.fluidsIn, MAX_IO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.MACERATOR)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register('gtceu:' + ID, SPEC)

    var chain = G.mega.chain({ parallel: 'fixed', cap: MAX_PARALLELS, oc: 'nonperfect', batch: true })

    var b = event.create(ID, 'multiblock')
      .langValue('Ore Refinery')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
    G.mega.install(b, chain)
      .appearanceBlock(GTBlocks.CASING_TITANIUM_STABLE)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.ore_refinery.tooltip.0'),
        Text.translate('grindless.machine.ore_refinery.tooltip.1'),
        Text.translate('grindless.machine.ore_refinery.tooltip.2')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + ID)
  })
})()
