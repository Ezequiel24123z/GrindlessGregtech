// -----------------------------------------------------------------------------------------------
// The Platinum Plant, the flagship multiblock of the EV era (docs/eras/ev.md), the recipe type it runs and its electrode.
//
//   gtceu:platinum_plant           5x5x7 hall (5 wide, 5 high, 7 deep) of inert casing, tempered glass and titanium pipes, runs the new
//                                  gtceu:pgm_refining
//   grindless:platinum_electrode   platinum on titanium, the plant's condition. Goes in the input bus; every recipe needs one and uses it up
//                                  by chance (0.1 % of the runs). Assembled from a titanium rod and platinum foil: the first platinum is the
//                                  End's (the sheldonite vein of the HV drill), after that the plant pays for its own electrodes
//
// What it wins: SEVERAL STEPS IN ONE and CLOSED LOOPS. The loose platinum-group line of this pack is GT--'s (a GTNH-style chain that
// replaces GTM's; server_scripts/grindless/ev/platinum_plant.js has the details): some forty recipes in a dozen kinds of machine, a sludge
// centrifuge, a nitration-mixture dissolver, large reactors, sifters and blast furnaces that send the platinum powder round a loop for
// dozens of passes, a palladium loop that eats ammonia, a rhodium line with a potassium pyrosulfate leach and a ruthenium tetroxide
// cracker and distillation (toxic, and carried from one machine to the next). The plant runs each family of it in one pass, with the
// loops closed inside, and hands out the metals and the leftovers. The programmed circuit picks the mode:
//   1  attack      9 purified pentlandite or chalcopyrite -> 1 platinum group sludge + 18 nickel or copper dust + oxygen + sulfuric acid
//                  (the solution of the attack is electrolyzed inside and gives the acid back, with a surplus)
//   2  separation  three recipes; the plant runs the one its inputs fit:
//                    platinum           1 sludge + nitration mixture, ammonium chloride and calcium -> 6 platinum, gold, silicon dioxide,
//                                       calcium chloride, 6 platinum slag and the leftovers (palladium-rich ammonia, nitrogen dioxide,
//                                       diluted sulfuric acid, a little palladium metal dust)
//                    palladium          palladium-rich ammonia, palladium metal dust, ammonia and formic acid -> palladium
//                    rhodium_ruthenium  platinum slag and the reagents of the rhodium and the ruthenium lines -> rhodium, ruthenium and
//                                       the leftovers (zinc sulfate, salt, chlorine, ammonia, water, potassium)
//   3  iridosmine  (IV) Mercury's iridosmine -> iridium and osmium, 3 : 1: IV-B2's oxidative fusion and GT--'s iridium and osmium chain,
//                  with the osmium tetroxide, the chlorine and the ammonia kept inside (docs/eras/iv.md, "Family steps")
//   4  asteroid    (LuV) the asteroid belt's platinum metals: 22 asteroid PGM concentrate (the asteroid processor's Mond residue) -> 1
//                  platinum group sludge (for circuit 2) + 3 iridium + 3 osmium, through an opening of ours (data/grindless/tables/
//                  asteroid_pgm.json) and mode 3's GT-- chain (docs/eras/luv.md, "Platinum plant, mode 4")
// Every recipe is generated from the loose line's own recipes (server_scripts/grindless/ev/platinum_plant.js): the same ratios and the
// SAME ENERGY, the sum of the stages it replaces, with the loops run to the end. No discount and no parallels of its own. Its condition
// is the electrode in the input bus and a destination for every output: if a bus or a hatch is full, the plant stops. Earth's platinum line
// gives no iridium or osmium (docs/eras/iv.md decision 5: data/grindless/tables/offworld_only.json strips the iridium metal residue and
// the rarest metal mixture from it), so modes 1 and 2 give none; mode 3 refines Mercury's iridosmine and mode 4 the belt's concentrate.
// Policy: modes 1 to 3 may void (the controller's voiding mode); mode 4 keeps all it makes: its recipe carries the data boolean
// grindless_pgm_keep (PP.keepKey), and the plant refuses to run it while the controller voids items or fluids (lib/no_voiding.js as the
// modifier, around the parallel hatch and the overclock, and in beforeWorking; the Venus acid works' and the naquadah plant's precedent).
//
// Machine class: GTM's plain electric multiblock (WorkableElectricMultiblockMachine), so its overclock is GTM's, after a parallel hatch's
// copies when one sits in a part cell (lib/parallel_hatch.js; IV-B6's mechanism, added by IV-B3: the IV hatch runs up to 4 copies, each
// at the recipe's EU/t, so 4 EV recipes at once need IV voltage. GTM sizes the copies by every consumed input, the chanced electrode
// included, so 4 copies want 4 electrodes in the bus; they are still used up only by chance). The modifier is registered with
// alwaysTryModifyRecipe, so GTM re-applies it when each run ends (AGENTS.md, "A modifier alone doesn't stop a run").
//
// Geometry (slices back -> front, rows bottom -> top; the controller is in the front slice, middle column, row 1):
//   row 0   floor: the 20 cells of its edge are `X` (inert casing or a part), the 15 of the middle are inert casing
//   row 1   ground ring: 15 `X` cells and the controller; a titanium pipe column at each corner, rising to row 3
//   row 2   ring of tempered glass
//   row 3   ring of tempered glass
//   row 4   roof of tempered glass
// The 35 `X` cells are casing or parts: 1-2 EV energy hatches, 1 input bus, 1 output bus, 3 input hatches and 4 output hatches (the most
// fluids one recipe takes in or gives out: three input hatches serve every recipe, and the rhodium-ruthenium one fills the four output
// hatches), and at most one parallel hatch. That is 10 to 12 parts, so at least 23 cells are inert casing. The parts' limits set that
// floor, so the casing has no minimum of its own (it had 24, the floor of 11 parts, until IV-B3 added the parallel hatch; every build
// that formed still forms). ME buses and hatches have the same abilities as the plain ones and fit the same cells.
//
// Textures: overlay dir grindless:block/multiblock/platinum_plant, base casing GTM's inert (PTFE) machine casing; item/platinum_electrode.
// Names / tooltips: client_scripts/grindless/ev_platinum_plant_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const PP = G.platinumPlant || (G.platinumPlant = {})

  const MACHINE = 'gtceu:platinum_plant'
  const TYPE = 'gtceu:pgm_refining'
  const ELECTRODE = 'grindless:platinum_electrode'
  // the data boolean of the recipes that refuse voiding (mode 4), and the failure reason GTM shows while the controller voids
  const KEEP_KEY = 'grindless_pgm_keep'
  const NO_VOIDING = 'grindless.machine.platinum_plant.no_voiding'

  const INERT = 'gtceu:inert_machine_casing'
  const INERT_TEXTURE = 'gtceu:block/casings/solid/machine_casing_inert_ptfe'
  const PIPE = 'gtceu:titanium_pipe_casing'
  const GLASS = 'gtceu:tempered_glass'

  // published for the recipe script and the smoke test
  PP.machine = MACHINE
  PP.recipeType = TYPE
  PP.electrode = ELECTRODE
  // items in: the ore, the sludge or the slag, the reagent dusts, the electrode and the programmed circuit (the rhodium-ruthenium recipe
  // takes 7); items out: the metals and the byproduct dusts, a whole amount plus a chanced remainder (up to 10); fluids in: the reagents
  // (3); fluids out: the acids, gases and solutions the line lets go (4). Mode 4 fits: 5 items in, 6 out, 3 fluids in (salt water,
  // hydrochloric acid, hydrogen), 2 out
  PP.maxIO = { itemsIn: 8, itemsOut: 12, fluidsIn: 3, fluidsOut: 4 }
  PP.hatches = { energy: [1, 2], inputBus: 1, outputBus: 1, inputHatches: 3, outputHatches: 4, parallelHatch: [0, 1] }
  PP.modes = { 1: 'attack', 2: 'separation', 3: 'iridosmine', 4: 'asteroid' }
  PP.keepKey = KEEP_KEY
  PP.noVoiding = NO_VOIDING

  // ---------------------------------------------------------------- pattern

  // 5 wide (columns, left to right as seen from the front), 5 high, 7 deep. 35 cells are `X`: the 20 of the edge of the floor and the
  // 15 of the ground ring (corners and controller excluded)
  const BACK = ['XXXXX', 'PXXXP', 'PGGGP', 'PGGGP', 'GGGGG']
  const HALL = ['XIIIX', 'X###X', 'G###G', 'G###G', 'GGGGG']
  const FRONT = ['XXXXX', 'PXSXP', 'PGGGP', 'PGGGP', 'GGGGG']
  const SPEC = {
    slices: [BACK, HALL, HALL, HALL, HALL, HALL, FRONT],
    symbols: {
      S: Pat.controller(),
      // the casing fills the cells the parts leave; a minimum on it would make tools/analysis model the optional parallel hatch as
      // the only filler, so the EV plant would seem to need an IV hatch to form
      X: Pat.oneOf(
        Pat.block(INERT),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { exact: 1 }),
        Pat.part('input_hatch', { exact: 3 }),
        Pat.part('output_hatch', { exact: 4 }),
        G.parallelHatch.part()
      ),
      I: Pat.block(INERT),
      P: Pat.block(PIPE),
      G: Pat.block(GLASS),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- electrode

  StartupEvents.registry('item', function (event) {
    event.create(ELECTRODE)
      .texture('grindless:item/platinum_electrode')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.platinum_electrode')))
  })

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create('pgm_refining')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(PP.maxIO.itemsIn, PP.maxIO.itemsOut, PP.maxIO.fluidsIn, PP.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machine

  // true for the recipes that refuse voiding (mode 4)
  function keeps(recipe) {
    try {
      return recipe.data.getBoolean(KEEP_KEY) === true
    } catch (e) {
      return false
    }
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)

    // a parallel hatch's copies, then GTM's default overclock (IV-B6's helper; without a hatch, the overclock alone, as before). Mode 4
    // refuses voiding first; registered with alwaysTryModifyRecipe, so GTM re-applies it when each run ends, and beforeWorking refuses a
    // cached restart (AGENTS.md, "A modifier alone doesn't stop a run")
    var parallelThenOverclock = G.parallelHatch.modifier(G.parallelHatch.overclock)
    var keep = { which: 'both', reason: NO_VOIDING, name: 'platinum plant' }
    var keepModifier = G.noVoiding.modifier(keep, parallelThenOverclock)
    var keepStart = G.noVoiding.beforeWorking(keep)

    event.create('platinum_plant', 'multiblock')
      .langValue('Platinum Plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('pgm_refining')
      .recipeModifier(function (machine, recipe) {
        return keeps(recipe) ? keepModifier(machine, recipe) : parallelThenOverclock(machine, recipe)
      }, true)
      .beforeWorking(function (machine, recipe) {
        return keeps(recipe) ? keepStart(machine, recipe) : true
      })
      .appearanceBlock(GTBlocks.CASING_PTFE_INERT)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.platinum_plant.tooltip.0'),
        Text.translate('grindless.machine.platinum_plant.tooltip.1'),
        Text.translate('grindless.machine.platinum_plant.tooltip.2'),
        Text.translate('grindless.machine.platinum_plant.tooltip.4'),
        Text.translate('grindless.machine.platinum_plant.tooltip.5'),
        Text.translate('grindless.machine.platinum_plant.tooltip.3'),
        Text.translate('grindless.machine.parallel_hatch.tooltip')
      ])
      .workableCasingModel(INERT_TEXTURE, 'grindless:block/multiblock/platinum_plant')
  })
})()
