// -----------------------------------------------------------------------------------------------
// One of IV's multiblocks (docs/eras/iv.md, "Naquadah plant"; package IV-B3): the naquadah plant and its recipe type.
//
//   gtceu:naquadah_plant       a 7x4x5 plant: a superacid hall of inert (PTFE) machine casing around a block of PTFE pipe vessels,
//                              joined at its side to a 3x3x3 activation chamber of radiation-proof machine casing (GT--'s: dense
//                              lead, a tungstensteel frame and concrete) with two laminated glass windows onto the source holder,
//                              a tungstensteel frame at the chamber's heart.
//   gtceu:naquadah_refining    its recipe type (EU in). The programmed circuit picks the mode; the recipes come from
//                              data/grindless/tables/naquadah_plant.json (server_scripts/grindless/iv/naquadah_plant.js):
//                                circuit 1  naquadah   GT--'s naquadah line composed in one pass: the neutron activator's run with
//                                                      the fluoroantimonic acid made inside from antimony trioxide and HF, and the
//                                                      titanium trifluoride reduced to titanium with the HF back. 4 naquadah oxide
//                                                      mixture + 15 antimony trioxide + 40,500 mB HF -> 2 naquadah dust, half a
//                                                      titanium ingot and half a gallium dust (chanced), hydrogen and water.
//                              Mode 2 (enriched naquadah, circuit 2) is LuV and not built here.
//
// What it gains (rule 4): the hands-free neutron window and the superacid inside. GT--'s activator only turns the oxide into naquadah
// while its neutron energy sits in a 10 MeV window, which the player keeps with accelerator hatches, a sensor and moderator dust; out
// of the window a run turns its inputs into radioactive waste. Here a Pu-Be neutron source on the bus holds the window (used up in 1 %
// of the batches) and the accelerators' upkeep is paid as EU. The HSbF6, the strongest superacid known, never leaves the plant.
//
// Machine class: GTM's plain electric multiblock (WorkableElectricMultiblockMachine), so its overclock is GTM's, after a parallel hatch's
// copies when one sits in a part cell (lib/parallel_hatch.js, IV-B6's mechanism: the IV hatch runs up to 4 copies, each at the recipe's
// EU/t, so 4 at once need LuV voltage, two IV energy hatches; the Pu-Be source, a chanced input, is not multiplied). Nothing it makes in
// IV must be contained (GTM's naquadah is not radioactive), so it does not refuse voiding; mode 2's naquadria solution (LuV) will.
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right seen from the front):
//   columns 0-3, the superacid hall, 4 high and 5 deep: a floor, walls and a roof of inert casing; its edges (`X`) take the parts; a
//   2x2x3 block of PTFE pipe casing vessels (P) inside, between the back and front walls.
//   columns 4-6, the activation chamber, rows 0-2 of slices 1-3, against the hall's side: radiation-proof casing (R) with a laminated
//   glass window (G) in its front and in its outer side, onto a tungstensteel frame (F), the source holder, at its centre.
//   The controller is in the hall's front wall, row 1, column 1.
// The 39 `X` cells take 1-2 energy hatches (two EV hatches give IV voltage: GTM raises it one tier with two hatches of the top tier, and
// IV hatches need Mercury's iridium), 1-2 input buses, 1-2 output buses, 1-6 input hatches, 1-4 output hatches and at most one parallel
// hatch. That is at most 17 parts, so at least 22 stay inert casing and the plant holds at least 50 inert casings; the parts' limits set
// that floor, so the casing has no minimum of its own. ME buses and hatches have the same abilities, so they fit.
//
// Textures: overlay dir grindless:block/multiblock/naquadah_plant (tools/assets/Build-NaquadahPlantTextures.ps1) on GTM's inert casing.
// Names / tooltips: client_scripts/grindless/iv_naquadah_plant_lang.js. Published for the recipe script and the smoke test:
// global.grindless.naquadahPlant.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const NP = G.naquadahPlant || (G.naquadahPlant = {})

  const MACHINE = 'gtceu:naquadah_plant'
  const TYPE = 'naquadah_refining'
  const TABLE = 'kubejs/data/grindless/tables/naquadah_plant.json'

  const INERT = 'gtceu:inert_machine_casing'
  const INERT_TEXTURE = 'gtceu:block/casings/solid/machine_casing_inert_ptfe'
  const VESSEL = 'gtceu:ptfe_pipe_casing'
  const SHIELD = 'gtnn:radiation_proof_machine_casing'
  const WINDOW = 'gtceu:laminated_glass'
  const HOLDER = 'tungsten_steel'

  // the recipe data key: the EMI line gtceu.recipe.grindless_naquadah_plant.<recipe name>
  const DATA_KEY = 'grindless_naquadah_plant'

  // ---------------------------------------------------------------- published for the recipe script and the smoke test

  NP.machine = MACHINE
  NP.recipeType = 'gtceu:' + TYPE
  NP.table = TABLE
  // items in: the oxide, the antimony trioxide, the Pu-Be source and the programmed circuit; out: naquadah, titanium and gallium.
  // Fluids in: the HF; out: the hydrogen and the water
  NP.maxIO = { itemsIn: 4, itemsOut: 3, fluidsIn: 1, fluidsOut: 2 }
  NP.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 6 },
    output_hatch: { min: 1, max: 4 }
  }
  NP.modes = { 1: 'naquadah' }
  NP.dataKey = DATA_KEY
  NP.blocks = { casing: INERT, vessel: VESSEL, shield: SHIELD, window: WINDOW, holder: HOLDER }

  // ---------------------------------------------------------------- pattern

  const SPEC = {
    slices: [
      // the hall's back wall
      ['XXXX   ', 'XXXX   ', 'XIIX   ', 'IIII   '],
      // the hall with its PTFE vessels; the chamber's back wall
      ['XIIXRRR', 'XPPXRRR', 'XPPXRRR', 'IIII   '],
      // the chamber's middle: the source holder, seen through the side window
      ['XIIXRRR', 'XPPXRFG', 'XPPXRRR', 'IIII   '],
      // the chamber's front: its window
      ['XIIXRRR', 'XPPXRGR', 'XPPXRRR', 'IIII   '],
      // the hall's front wall with the controller
      ['XXXX   ', 'XSXX   ', 'XXXX   ', 'IIII   ']
    ],
    symbols: {
      S: Pat.controller(),
      // the casing fills the cells the parts leave (no minimum: with one, tools/analysis would model the optional parallel hatch as
      // the only filler)
      X: Pat.oneOf(
        Pat.block(INERT),
        Pat.part('energy_input', NP.parts.energy_input),
        Pat.part('input_bus', NP.parts.input_bus),
        Pat.part('output_bus', NP.parts.output_bus),
        Pat.part('input_hatch', NP.parts.input_hatch),
        Pat.part('output_hatch', NP.parts.output_hatch),
        G.parallelHatch.part()
      ),
      I: Pat.block(INERT),
      P: Pat.block(VESSEL),
      R: Pat.block(SHIELD),
      G: Pat.block(WINDOW),
      F: Pat.frame([HOLDER])
    }
  }

  // One EMI line per recipe, read from its data: what the mode does
  function modeInfo(data) {
    try {
      var name = String(data.getString(DATA_KEY))
      if (name === '') return ''
      return String(Text.translate('gtceu.recipe.' + DATA_KEY + '.' + name).getString())
    } catch (e) {
      return ''
    }
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(NP.maxIO.itemsIn, NP.maxIO.itemsOut, NP.maxIO.fluidsIn, NP.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var type = GTRecipeTypes.get(TYPE)
    if (type == null) throw new Error('[grindless/iv] recipe type gtceu:' + TYPE + ' is not registered')
    type.addDataInfo(modeInfo)

    Pat.register(MACHINE, SPEC)

    event.create('naquadah_plant', 'multiblock')
      .langValue('Naquadah Plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      // a parallel hatch's copies, then GTM's default overclock (IV-B6's helper; without a hatch, the overclock alone)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(GTBlocks.CASING_PTFE_INERT)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.naquadah_plant.tooltip.0'),
        Text.translate('grindless.machine.naquadah_plant.tooltip.1'),
        Text.translate('grindless.machine.naquadah_plant.tooltip.2'),
        Text.translate('grindless.machine.naquadah_plant.tooltip.3'),
        Text.translate('grindless.machine.parallel_hatch.tooltip')
      ])
      .workableCasingModel(INERT_TEXTURE, 'grindless:block/multiblock/naquadah_plant')
  })
})()
