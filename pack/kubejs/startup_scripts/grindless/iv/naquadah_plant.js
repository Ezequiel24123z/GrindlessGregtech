// priority: -3000
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
//                                circuit 2  enriched_naquadah   (LuV, package A2; docs/eras/luv.md "Naquadah plant, mode 2") GT--'s
//                                                      enriched line with full recovery: 4 enriched naquadah oxide mixture + fluorine,
//                                                      hydrogen and sulfuric acid -> enriched naquadah sulfate, trinium sulfide, impure
//                                                      naquadria solution, titanium and HF. Xenon, HSbF6, AuF3 and the Pd/C catalyst are
//                                                      charges held in the hatches and the bus (the catalyst wears 1 % a batch).
//                                circuit 3  spent_naquadah      (LuV) reactor III's spent rods, macerated: 6 naquadah dust through GT--'s
//                                                      naquadah separation and the same line.
//                              Modes 2 and 3 refuse voiding (their recipes carry the data boolean grindless_naquadah_keep): the
//                              naquadria solution is contained and the trinium sulfide kept. Mode 1 may void.
//
// What it gains (rule 4): the hands-free neutron window and the superacid inside. GT--'s activator only turns the oxide into naquadah
// while its neutron energy sits in a 10 MeV window, which the player keeps with accelerator hatches, a sensor and moderator dust; out
// of the window a run turns its inputs into radioactive waste. Here a Pu-Be neutron source on the bus holds the window (used up in 1 %
// of the batches) and the accelerators' upkeep is paid as EU. The HSbF6, the strongest superacid known, never leaves the plant.
//
// Machine class: GTM's plain electric multiblock (WorkableElectricMultiblockMachine), so its overclock is GTM's, after a parallel hatch's
// copies when one sits in a part cell (lib/parallel_hatch.js, IV-B6's mechanism: the IV hatch runs up to 4 copies, each at the recipe's
// EU/t, so 4 at once need LuV voltage, two IV energy hatches. GTM sizes the copies by every consumed input, the chanced Pu-Be source
// included, so 4 copies want 4 sources in the bus; they are still used up only by chance). Nothing mode 1 makes must be contained
// (GTM's naquadah is not radioactive), so it may void; modes 2 and 3 refuse it (lib/no_voiding.js as the modifier, around the parallel
// hatch and the overclock, and in beforeWorking, only for the recipes that carry the keep key: the Venus acid works' precedent). The
// LuV parallel hatch (x16) fits the same cell; mode 2 at x4 runs on two LuV hatches (each copy pays its 30,720 EU/t).
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right seen from the front), 10 wide, 5 high,
// 6 deep (about 250 blocks, D2-SIZE-IV):
//   columns 0-5, the superacid hall, 6 deep: an inert casing floor, roof and corner posts; its other edges (`X`) take the parts; four
//   2x2x3 stacks of PTFE pipe casing vessels (P) inside, with the controller in the front wall, row 1, column 1.
//   columns 6-9, the activation chamber, slices 1-4: a radiation-proof casing (R) shell round a 2x2x3 hollow, with laminated glass
//   windows (G) in its front and outer side and a tungstensteel frame (F), the source holder, inside.
// The `X` cells take 1-2 energy hatches (two EV hatches give IV voltage: GTM raises it one tier with two hatches of the top tier, and
// IV hatches need Mercury's iridium), 1-2 input buses, 1-2 output buses, 1-6 input hatches, 1-4 output hatches and at most one parallel
// hatch; the parts' limits leave the rest inert casing, so the casing has no minimum of its own. ME buses and hatches have the same
// abilities, so they fit.
//// Textures: overlay dir grindless:block/multiblock/naquadah_plant (tools/assets/Build-NaquadahPlantTextures.ps1) on GTM's inert casing.
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
  // the data boolean of the recipes that refuse voiding (modes 2 and 3)
  const KEEP_KEY = 'grindless_naquadah_keep'
  const NO_VOIDING = 'grindless.machine.naquadah_plant.no_voiding'

  // ---------------------------------------------------------------- published for the recipe script and the smoke test

  NP.machine = MACHINE
  NP.recipeType = 'gtceu:' + TYPE
  NP.table = TABLE
  // items in: the oxide or the naquadah, the antimony trioxide (mode 1), the Pu-Be source, the AuF3 and Pd/C charges (modes 2 and 3) and
  // the programmed circuit; out: naquadah, enriched naquadah sulfate, trinium sulfide, titanium and gallium, each a whole amount and a
  // chanced remainder (6 is mode 2's 5 with room for one more remainder). Fluids in: HF (mode 1); fluorine, hydrogen, sulfuric acid and
  // the xenon and HSbF6 charges (modes 2 and 3); out: hydrogen and water (mode 1), impure naquadria solution and HF (modes 2 and 3)
  NP.maxIO = { itemsIn: 5, itemsOut: 6, fluidsIn: 5, fluidsOut: 2 }
  NP.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 6 },
    output_hatch: { min: 1, max: 4 }
  }
  NP.modes = { 1: 'naquadah', 2: 'enriched_naquadah', 3: 'spent_naquadah', 4: 'enriched_solution' }
  NP.dataKey = DATA_KEY
  NP.keepKey = KEEP_KEY
  NP.noVoiding = NO_VOIDING
  NP.blocks = { casing: INERT, vessel: VESSEL, shield: SHIELD, window: WINDOW, holder: HOLDER }

  // ---------------------------------------------------------------- pattern

  // 10 wide, 5 high, 6 deep: slices back -> front, rows bottom -> top, built cell by cell then written out as strings
  function naquadahSlices() {
    var W = 10, H = 5, D = 6
    var g = []
    for (var z = 0; z < D; z++) {
      g.push([])
      for (var y = 0; y < H; y++) {
        var row = []
        for (var x = 0; x < W; x++) row.push(' ')
        g[z].push(row)
      }
    }
    // the hall, columns 0-5: inert floor, roof and corner posts; the other edges are `X` (casing or a part), air inside
    for (var z1 = 0; z1 < D; z1++) {
      for (var x1 = 0; x1 <= 5; x1++) {
        var edge = z1 === 0 || z1 === D - 1 || x1 === 0 || x1 === 5
        var corner = (z1 === 0 || z1 === D - 1) && (x1 === 0 || x1 === 5)
        for (var y1 = 0; y1 < H; y1++) {
          if (y1 === 0 || y1 === H - 1 || corner) g[z1][y1][x1] = 'I'
          else g[z1][y1][x1] = edge ? 'X' : '#'
        }
      }
    }
    // four PTFE vessel stacks, 2x2x3
    ;[[1, 1], [3, 1], [1, 3], [3, 3]].forEach(function (c) {
      for (var y2 = 1; y2 <= 3; y2++) {
        for (var dz = 0; dz < 2; dz++) {
          for (var dx = 0; dx < 2; dx++) g[c[1] + dz][y2][c[0] + dx] = 'P'
        }
      }
    })
    // the activation chamber, columns 6-9: a shield shell round a 2x2x3 hollow with the source holder in it
    for (var z3 = 1; z3 <= 4; z3++) {
      for (var x3 = 6; x3 <= 9; x3++) {
        for (var y3 = 0; y3 < H; y3++) {
          var inner = x3 >= 7 && x3 <= 8 && z3 >= 2 && z3 <= 3 && y3 >= 1 && y3 <= 3
          g[z3][y3][x3] = inner ? '#' : 'R'
        }
      }
    }
    g[2][2][8] = 'F'
    g[4][2][7] = 'G'
    g[4][2][8] = 'G'
    g[3][2][9] = 'G'
    g[2][2][9] = 'G'
    g[D - 1][1][1] = 'S'
    return g.map(function (slice) {
      return slice.map(function (row) { return row.join('') })
    })
  }

  const SPEC = {
    slices: naquadahSlices(),
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
      F: Pat.frame([HOLDER]),
      '#': Pat.air()
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

  // true for the recipes that refuse voiding (modes 2 and 3)
  function keeps(recipe) {
    try {
      return recipe.data.getBoolean(KEEP_KEY) === true
    } catch (e) {
      return false
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

    // a parallel hatch's copies, then GTM's default overclock (IV-B6's helper; without a hatch, the overclock alone). Modes 2 and 3 refuse
    // voiding first; registered with alwaysTryModifyRecipe, so GTM re-applies it when each run ends, and beforeWorking refuses a cached
    // restart (AGENTS.md, "A modifier alone doesn't stop a run")
    var parallelThenOverclock = G.parallelHatch.modifier(G.parallelHatch.overclock)
    var keep = { which: 'both', reason: NO_VOIDING, name: 'naquadah plant' }
    var keepModifier = G.noVoiding.modifier(keep, parallelThenOverclock)
    var keepStart = G.noVoiding.beforeWorking(keep)

    event.create('naquadah_plant', 'multiblock')
      .langValue('Naquadah Plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      .recipeModifier(function (machine, recipe) {
        return keeps(recipe) ? keepModifier(machine, recipe) : parallelThenOverclock(machine, recipe)
      }, true)
      .beforeWorking(function (machine, recipe) {
        return keeps(recipe) ? keepStart(machine, recipe) : true
      })
      .appearanceBlock(GTBlocks.CASING_PTFE_INERT)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.naquadah_plant.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.naquadah_refining')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ])
      .workableCasingModel(INERT_TEXTURE, 'grindless:block/multiblock/naquadah_plant')
  })
})()
