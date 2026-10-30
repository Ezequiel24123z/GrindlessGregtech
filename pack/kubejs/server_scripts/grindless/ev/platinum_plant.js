// priority: -12724
// -----------------------------------------------------------------------------------------------
// gtceu:pgm_refining recipes of the Platinum Plant (gtceu:platinum_plant), generated at server load from the LOOSE platinum-group line that
// is in the recipe set, and the recipes that make the plant and its electrode (EV era; mode 3 is IV's, mode 4 LuV's). Nothing of the line is typed by
// hand: the stage recipes are read (ServerEvents.recipes, original recipes, their JSON), chained, and the amounts and the energy come out
// of the chain, so the ratios are the line's by construction. The reading, the balance and the rounding are the composer library's,
// server_scripts/grindless/lib/compose.js (global.grindless.compose), which started as this file's own copy.
//
// WHICH LINE: in this pack GTM's own line (PlatGroupMetalsRecipes: pgs_separation, aqua regia, ...) is NOT the live one. GT-- (gtnn, in the
// pack for its kaolinite and wollastonite veins) empties those recipes and puts a GTNH-style platinum line in their place: nitration
// mixture, ammonium chloride, palladium-rich ammonia, sifters, blast furnaces, a ruthenium tetroxide cracker and distillation... The plant
// composes THAT line, whatever recipes are live under the ids below; if they go away (the line is restored or removed) the plans are
// skipped and the log says why (a warning per plan). integration/gtnn.js leaves every stage alone, and gg_test_addon_gates_misc.js guards
// that none is removed.
//
// The programmed circuit picks the mode:
//
//   circuit 1  attack      9 purified pentlandite (or chalcopyrite) -> 1 platinum group sludge + 18 nickel (copper) + 18 000 mB of oxygen +
//                          9 000 mB of sulfuric acid.   stages: the sulfuric attack (large chemical reactor: 9 ore + 9 000 mB acid -> sludge +
//                          18 000 mB of sulfuric nickel/copper solution) and the electrolysis of that solution, which gives the acid back
//                          (2 000 mB for each 1 000 mB it used): the line makes more acid than it eats, and that surplus is what leaves
//   circuit 2  separation  three recipes; the plant runs the one its inputs fit:
//       platinum           1 sludge + nitration mixture, ammonium chloride and calcium -> 6 platinum + gold + silicon dioxide + calcium
//                          chloride + 6 platinum slag + the leftovers of the line (palladium-rich ammonia, nitrogen dioxide, diluted sulfuric
//                          acid, palladium metal dust).  stages: sludge centrifuge -> dissolve the platinum powder in nitration mixture ->
//                          large reactor with ammonium chloride (salt + raw) -> sifter -> blast furnace (back to platinum powder: the loop,
//                          run to the end) -> raw platinum + calcium -> platinum
//       palladium          palladium-rich ammonia + palladium metal dust + ammonia + formic acid -> palladium.  stages: dust -> rich ammonia
//                          (ammonia), the large palladium reactor, the sifter (back to metal dust: the loop) and the formic acid step that
//                          gives the ammonia back
//       rhodium_ruthenium  platinum slag + potassium pyrosulfate, saltpeter, sodium nitrate, zinc, hydrochloric acid, salt water and steam ->
//                          rhodium + ruthenium + zinc sulfate + salt + chlorine + ammonia + water + potassium.
//                          stages: the leach, the rhodium sulfate, the rhodium salt / nitrate / filter cake / reprecipitated rhodium line, and
//                          the sodium rutheniate -> ruthenium tetroxide -> cracker -> distillation -> solid -> ruthenium line
//   Earth gives no iridium or osmium (docs/eras/iv.md decision 5): data/grindless/tables/offworld_only.json strips the iridium metal
//   residue and the rarest metal mixture from GT--'s sludge centrifuge and inert metal mixture leach (moon/offworld_only.js rebuilds the
//   loose recipes without them), and the plant reads every strip entry of its stages the same way (the library's patch hook), so modes
//   1 and 2 give none either.
//   circuit 3  iridosmine  (IV, docs/eras/iv.md "Family steps": Mercury's iridosmine -> iridium and osmium) 10 iridosmine + 10 saltpeter +
//                          3 calcium + salt water, hydrochloric acid and hydrogen -> 3 iridium + 1 osmium + 3 platinum sludge residue + 3
//                          metal sludge + 12 calcium chloride + water + steam. stages: the oxidative fusion (IV-B2's Mercury solar works step,
//                          read from global.grindless.mercury.fusion, the object its live recipe grindless:solar_processing/iridosmine_fusion
//                          is built from, so the Mercury and Earth routes cannot diverge: 10 iridosmine + 10 saltpeter + 1 000 mB salt water
//                          -> 6 rarest metal mixture + 700 mB osmium tetroxide + 1 000 mB steam), then GT--'s chain: rarest_metal_residue_ebf
//                          (iridium metal residue + acidic osmium solution), the distillation tower's acidic_osmium_solution_distill (the
//                          tetroxide), osmium_dust_completion (osmium + chlorine), iridium_metal_residue_process (IrO2 + platinum sludge
//                          residue), iridium_dioxide_dissolving, iridium_chloride and iridium_chloride_separation with calcium. The osmium
//                          tetroxide never leaves; the chlorine of the osmium step goes back into hydrochloric acid with hydrogen (GTM's
//                          chemical_reactor/hydrochloric_acid) and the ammonia of the iridium chloride step back into ammonium chloride with
//                          that acid (GTM's chemical_reactor/ammonium_chloride), so neither leaves. The calcium chloride leaves for GTM's
//                          electrolysis (calcium and chlorine), the platinum sludge residue for the centrifuge (gold, silicon dioxide); the
//                          metal sludge is GT--'s inert dross. Through the chain the fusion's 6 mixture give 3 iridium and 0.3 osmium, and
//                          its 700 mB of tetroxide 0.7 osmium: 3 Ir : 1 Os. Until LuV it is the only way the plant meets iridium and osmium:
//                          its first stage only runs on Mercury, and the stages after it only take what the fusion makes.
//   circuit 4  asteroid    (LuV, docs/eras/luv.md "Platinum plant, mode 4": the asteroid belt's platinum metals) 22 asteroid PGM concentrate
//                          (grindless:asteroid_pgm_concentrate, what the asteroid processor's Mond process leaves) + 15 saltpeter + 3 calcium
//                          + salt water, hydrochloric acid and hydrogen -> 1 platinum group sludge + 3 iridium + 3 osmium + 3 platinum sludge
//                          residue + 3 metal sludge + 12 calcium chloride + water + steam. stages: the asteroid opening, ours and virtual (no
//                          recipe of its own; data/grindless/tables/asteroid_pgm.json: 22 concentrate + 15 saltpeter + 1 500 mB salt water ->
//                          1 sludge + 6 rarest metal mixture + 2 700 mB osmium tetroxide + 1 500 mB steam, its energy read at load: 1.5 times
//                          the Mercury fusion's plus what one sludge costs through mode 1's attack_pentlandite), then mode 3's GT-- chain, the
//                          same stages and loops. The 6 mixture give 3 iridium and 0.3 osmium, the 2 700 mB of tetroxide 2.7 osmium: 3 Ir +
//                          3 Os; the sludge goes to circuit 2 (6 Pt + 4.20 Pd + 4.49 Ru + 1.35 Rh: 22.04 units of platinum metal per 22
//                          concentrate). With GT-- 1.3.10 it costs 1 920 EU/t x 1 106 t (2.12 M EU; the opening 138 720 of it: 36 000 of
//                          fusion and 102 720 of attack). Skipped with a warning if the concentrate is not registered (LuV A1 registers it;
//                          B5's asteroid processor makes it, and until B5 it is hidden from EMI with its recipes, this one included).
//   left out: the pgs_from_<ore> recipes of GT-- (ore + nitration mixture -> concentrated platinum, bypassing the sludge: removed by
//   integration/gtnn.js)
//
// What "the same as the loose line" means here:
//   ratios   every input and output has the proportion of the loose chain: the stages run for as much as the chain needs. Where the line
//            makes a product it also uses (the platinum powder, the palladium metal dust, the platinum slag, the chlorine of the
//            ruthenium...) the loop is run to the end: the linear system of the stages is solved (Gauss) so that every intermediate nets to
//            zero. A fraction of an item is a chance: of the output, or of the consumption of the input, so over many runs the totals are
//            exact. Fluids are whole millibuckets (inputs rounded up, outputs to the nearest). Of two variants of one step (a small reactor
//            and a large one, a single and a x9) the plant takes the one that gives more per unit, which is what a player with that machine
//            would run.
//   energy   the SUM of the energy of every stage (EU/t x ticks of each, scaled by how many times it runs). No discount, no coil or
//            blast-furnace temperature needed. It is spent as ceil(energy / 1 920) ticks at ceil(energy / ticks) EU/t: an EV recipe that
//            never costs less than the stages (a tick of power more at most). The one extra item is the electrode below.
//   outputs  nothing of the line is left half-made: the intermediates net out to zero and what the line lets go (acids, gases, byproduct
//            dusts) comes out through the hatches and the bus, each with its use in another recipe.
// Every recipe needs a platinum electrode (grindless:platinum_electrode) in the input bus: a chanced input, used up in 0.1 % of the runs.
// Policy: modes 1 to 3 may void (the controller's voiding mode); mode 4 keeps all it makes. Its recipe carries the recipe data boolean
// global.grindless.platinumPlant.keepKey (grindless_pgm_keep, set by the startup script), and the plant refuses to run it while the
// controller voids outputs (startup_scripts/grindless/ev/platinum_plant.js: lib/no_voiding.js in the modifier and the start check).
// Recipe ids (GTM's builder puts the type in front): grindless:pgm_refining/ev/<name>, name attack_pentlandite, attack_chalcopyrite,
// platinum, palladium, rhodium_ruthenium; grindless:pgm_refining/iv/iridosmine; and grindless:pgm_refining/luv/asteroid.
//
// Crafting (EV era):
//   Platinum Plant      ASSEMBLER: EV hull + EV chemical reactor + EV centrifuge + EV electrolyzer + EV sifter + EV mixer + 2 EV electric
//                       pumps + 4 EV circuits. The controller is the sum of what it replaces: the reactors of the attack, of the palladium
//                       line and of the rhodium line, the sludge centrifuge, the electrolyzer of the nickel and copper solutions, the sifters
//                       of the salt loops, the mixers of the rhodium solutions, and the pumps that feed the reagents. Twelve items do not fit
//                       the 3x3 of a crafting table, so it is made in an assembler: grindless:assembler/platinum_plant.
//   Platinum electrode  ASSEMBLER: 1 titanium rod + 4 platinum foil (one platinum plate) -> 1 electrode: grindless:assembler/platinum_electrode.
//                       The first platinum is the End's (the sheldonite vein of the HV drill); after that the plant pays for its own
//                       electrodes: one lasts about a thousand runs.
//
// Published in global.grindless.platinumPlant for the smoke test:
//   .recipes  [{ id (what the builder got), recipeId (the final id), name, mode, circuit, sources: [{ id, scale, eut, duration }] (stages and
//                how many times each runs), itemsIn: [{ id, count, chance }] (chance 10000 = used up), fluidsIn: [{ id, amount }], itemsOut:
//                [{ id, whole, chance }] (chance 0 = none), fluidsOut: [{ id, amount }], eut, duration, energy (what the recipe costs),
//                sourceEnergy (sum of the stages), keep (only on the recipes that refuse voiding, true: mode 4's) }]
//   .skipped  [{ name, reason }]      .stages  number of source recipes read from the live line      .stageIds  every live stage id the plans use
//   .stripped [{ stage, items: [ids], fluids: [ids] }] (what offworld_only.json's strip entries took out of the stages as the plant read them)
//   .fusion   { recipe, from, stage: { eut, duration, v } } (mode 3's first stage, as read from global.grindless.mercury.fusion)
//   .asteroid { table, concentrate, opening: { id, eut, duration, energy, v, fusionEnergy, attackSludgeEnergy, fusionTimes, attackSludge },
//               yields: { want, got, differ: [ids] }, error } (mode 4's first stage as built at load, null when it could not be; what the
//               composed recipe gives of each id of the table's yields, and the ids that differ, each a warning; error: why mode 4 was
//               skipped, null when it was built)
//   .keepKey (the data boolean of the recipes that refuse voiding), .fusionRecipe, .openingRecipe (the ids of the virtual first stages)
//   .craftingParts, .electrodeParts, .craftingRecipes { plant, electrode }
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  const G = global.grindless || (global.grindless = {})
  const PP = G.platinumPlant || (G.platinumPlant = {})

  const LOG = '[grindless/ev] '
  const ELECTRODE = 'grindless:platinum_electrode'
  const ELECTRODE_WEAR = 10            // of 10 000: 0.1 % of the runs
  const MAX_EUT = 1920                 // VA[EV]: the plant is an EV machine
  const TYPE_PATH = 'pgm_refining'
  const ATTACK_CIRCUIT = 1
  const SEPARATION_CIRCUIT = 2
  const IRIDOSMINE_CIRCUIT = 3
  const ASTEROID_CIRCUIT = 4
  // mode 3's first stage: IV-B2's Mercury solar works recipe, built from global.grindless.mercury.fusion (not an original recipe)
  const FUSION = 'grindless:solar_processing/iridosmine_fusion'
  // mode 4's first stage: ours and virtual (no recipe has this id), built from its table at load
  const OPENING = 'grindless:asteroid_pgm_opening'
  const ASTEROID_TABLE = 'kubejs/data/grindless/tables/asteroid_pgm.json'
  // the recipe data boolean of a recipe that refuses voiding (the startup script reads it in the modifier and the start check)
  const KEEP_KEY = String(PP.keepKey || 'grindless_pgm_keep')
  // the outputs moon/offworld_only.js strips from loose recipes (resources of other worlds): the plant reads its stages without them
  const OFFWORLD_TABLE = 'kubejs/data/grindless/tables/offworld_only.json'
  // what the recipe type holds (startup_scripts/grindless/ev/platinum_plant.js publishes it)
  const IO = PP.maxIO || { itemsIn: 8, itemsOut: 12, fluidsIn: 3, fluidsOut: 4 }

  function item(name) { return 'i:gtceu:' + name }
  function fluid(name) { return 'f:gtceu:' + name }
  function stage(path) { return 'gtceu:' + path }

  // what the attack makes and circuit 2 splits: mode 4's opening prices one at the attack's live energy
  const SLUDGE = item('platinum_group_sludge_dust')

  // bag(key, amount, key, amount, ...) -> { key: amount }
  function bag() {
    var out = {}
    for (var i = 0; i + 1 < arguments.length; i += 2) out[arguments[i]] = arguments[i + 1]
    return out
  }

  // GT--'s iridium and osmium chain after the first stage of modes 3 and 4 (the fusion, the opening), and the intermediates it closes
  const IRIDOSMINE_CHAIN = [
    stage('electric_blast_furnace/rarest_metal_residue_ebf'),
    stage('distillation_tower/acidic_osmium_solution_distill'),
    stage('chemical_reactor/osmium_dust_completion'),
    stage('electric_blast_furnace/iridium_metal_residue_process'),
    stage('chemical_reactor/iridium_dioxide_dissolving'),
    stage('chemical_reactor/iridium_chloride'),
    stage('chemical_reactor/iridium_chloride_separation'),
    stage('chemical_reactor/hydrochloric_acid'),
    stage('chemical_reactor/ammonium_chloride')
  ]
  const IRIDOSMINE_LINKED = [
    item('rarest_metal_mixture_dust'), item('iridium_metal_residue_dust'), fluid('acidic_osmium_solution'), fluid('osmium_tetroxide'),
    item('iridium_dioxide_dust'), fluid('acidic_iridium'), item('iridium_chloride_dust'), fluid('chlorine'), fluid('ammonium_chloride')
  ]

  // The plans. `stages`: the stage recipes of the loose line (recipe ids). `given`: what the batch takes in, all of it (the batch size).
  // `linked`: the intermediates that must net to zero. Given + linked must be as many as the stages: the system is square. Everything else
  // the stages touch is a free input or output of the recipe. `era` is the folder of the recipe id. Mode 3's `given` is the fusion's own
  // iridosmine (filled in from global.grindless.mercury.fusion when the recipes are built), mode 4's the opening's own concentrate (filled
  // in from its table). `keep`: the recipe refuses voiding (it carries KEEP_KEY).
  const PLANS = [
    {
      name: 'attack_pentlandite', mode: 'attack', circuit: ATTACK_CIRCUIT, era: 'ev',
      stages: [stage('large_chemical_reactor/platinum_group_sludge_dust1'), stage('electrolyzer/decomposition_electrolyzing_sulfuric_nickel_solution')],
      given: bag(item('purified_pentlandite_ore'), 9),
      linked: [fluid('sulfuric_nickel_solution')]
    },
    {
      name: 'attack_chalcopyrite', mode: 'attack', circuit: ATTACK_CIRCUIT, era: 'ev',
      stages: [stage('large_chemical_reactor/platinum_group_sludge_dust2'), stage('electrolyzer/decomposition_electrolyzing_sulfuric_copper_solution')],
      given: bag(item('purified_chalcopyrite_ore'), 9),
      linked: [fluid('sulfuric_copper_solution')]
    },
    {
      name: 'platinum', mode: 'separation', circuit: SEPARATION_CIRCUIT, era: 'ev',
      stages: [
        stage('centrifuge/platinum_group_sludge_dust'),
        stage('chemical_reactor/dissolve_platinum_metallic_powder9'),
        stage('large_chemical_reactor/large_platinum_dusts'),
        stage('sifter/refined_platinum_salt'),
        stage('electric_blast_furnace/refined_platinum_salt_dust_ebf'),
        stage('chemical_reactor/raw_platinum_separation')
      ],
      given: bag(item('platinum_group_sludge_dust'), 1),
      linked: [item('platinum_metal_dust'), fluid('concentrated_platinum'), item('platinum_salt_dust'), item('refined_platinum_salt_dust'), item('platinum_raw_dust')]
    },
    {
      // the batch is what one batch of the platinum recipe lets go: 10 800 mB of rich ammonia and 0.95 palladium metal dust
      name: 'palladium', mode: 'separation', circuit: SEPARATION_CIRCUIT, era: 'ev',
      stages: [
        stage('chemical_reactor/palladium_metallic_powder_conversion'),
        stage('chemical_reactor/large_palladium_dusts'),
        stage('sifter/salt_to_metallic_powder_palladium'),
        stage('chemical_reactor/raw_palladium_separation')
      ],
      given: bag(fluid('palladium_rich_ammonia'), 10800, item('palladium_metal_dust'), 0.95),
      linked: [item('palladium_salt_dust'), item('palladium_raw_dust')]
    },
    {
      // the batch is the 6 platinum slag of one batch of the platinum recipe
      name: 'rhodium_ruthenium', mode: 'separation', circuit: SEPARATION_CIRCUIT, era: 'ev',
      stages: [
        stage('electric_blast_furnace/leach_residue_one'),
        stage('large_chemical_reactor/rhodium_sulfate_to_solution_l'),
        stage('extractor/potassium_pyrosulfate_dust'),
        stage('chemical_reactor/crude_rhodium_metallic_powder'),
        stage('electric_blast_furnace/rhodium_salt_ebf'),
        stage('mixer/rhodium_salt_solution'),
        stage('chemical_reactor/rhodium_nitrate'),
        stage('sifter/rhodium_filter_cake'),
        stage('mixer/rhodium_filter_cake_solution'),
        stage('chemical_reactor/reprecipitated_rhodium'),
        stage('chemical_reactor/rhodium_dust'),
        stage('electric_blast_furnace/rarest_metal_residue'),
        stage('chemical_reactor/ruthenium_tetroxide'),
        stage('cracker/hot_ruthenium_tetroxide'),
        stage('distillation_tower/hot_ruthenium_tetroxide_distill'),
        stage('fluid_solidifier/ruthenium_tetroxide_dust'),
        stage('chemical_reactor/ruthenium_tetroxide_separation')
      ],
      given: bag(item('platinum_slag_dust'), 6),
      linked: [
        fluid('rhodium_sulfate_gas'), fluid('molten_potassium_pyrosulfate'), fluid('rhodium_sulfate'), item('roughly_rhodium_metal_dust'),
        item('rhodium_salt_dust'), fluid('rhodium_salt'), item('rhodium_nitrate_dust'), item('rhodium_filter_cake_dust'),
        fluid('rhodium_filter_cake'), item('reprecipitated_rhodium_dust'), item('inert_metal_mixture_dust'), item('sodium_rutheniate_dust'),
        fluid('ruthenium_tetroxide'), fluid('ruthenium_tetroxide_hot'), fluid('ruthenium_tetroxide_lq'), item('ruthenium_tetroxide_dust')
      ]
    },
    {
      // IV: Mercury's iridosmine (docs/eras/iv.md, "Family steps", platinum plant mode 3). The batch is the fusion's own iridosmine.
      name: 'iridosmine', mode: 'iridosmine', circuit: IRIDOSMINE_CIRCUIT, era: 'iv', fromFusion: item('iridosmine_dust'),
      stages: [FUSION].concat(IRIDOSMINE_CHAIN),
      given: {},
      linked: IRIDOSMINE_LINKED
    },
    {
      // LuV: the asteroid belt's platinum metals (docs/eras/luv.md, "Platinum plant, mode 4"). The batch is the opening's own concentrate.
      name: 'asteroid', mode: 'asteroid', circuit: ASTEROID_CIRCUIT, era: 'luv', fromOpening: true, keep: true,
      stages: [OPENING].concat(IRIDOSMINE_CHAIN),
      given: {},
      linked: IRIDOSMINE_LINKED
    }
  ]

  // the order of the outputs of a recipe: the metals first, then what the line lets go
  const ITEM_ORDER = ['gtceu:platinum_dust', 'gtceu:palladium_dust', 'gtceu:rhodium_dust', 'gtceu:ruthenium_dust', 'gtceu:iridium_dust', 'gtceu:osmium_dust',
    'gtceu:nickel_dust', 'gtceu:copper_dust', 'gtceu:platinum_group_sludge_dust', 'gtceu:gold_dust', 'gtceu:silicon_dioxide_dust', 'gtceu:platinum_slag_dust',
    'gtceu:palladium_metal_dust', 'gtceu:rarest_metal_mixture_dust', 'gtceu:iridium_metal_residue_dust', 'gtceu:platinum_sludge_residue_dust',
    'gtceu:metal_sludge_dust', 'gtceu:calcium_chloride_dust', 'gtceu:zinc_sulfate_dust', 'gtceu:salt_dust']
  const FLUID_ORDER = ['gtceu:oxygen', 'gtceu:sulfuric_acid', 'gtceu:palladium_rich_ammonia', 'gtceu:nitrogen_dioxide', 'gtceu:diluted_sulfuric_acid', 'gtceu:ammonia',
    'gtceu:chlorine', 'minecraft:water', 'gtceu:steam', 'gtceu:potassium']

  // the stages read from the live line (every stage id of every plan but the fusion, which is built from IV-B2's published object, and the
  // opening, which is built from its table)
  const STAGE_IDS = []
  PLANS.forEach(function (plan) {
    plan.stages.forEach(function (id) {
      if (id !== FUSION && id !== OPENING && STAGE_IDS.indexOf(id) < 0) STAGE_IDS.push(id)
    })
  })

  // crafting: the parts of the controller and of the electrode (the last id of each list is what the recipe makes)
  const HULL = 'gtceu:ev_machine_hull'
  const REACTOR = 'gtceu:ev_chemical_reactor'
  const CENTRIFUGE = 'gtceu:ev_centrifuge'
  const ELECTROLYZER = 'gtceu:ev_electrolyzer'
  const SIFTER = 'gtceu:ev_sifter'
  const MIXER = 'gtceu:ev_mixer'
  const PUMP = 'gtceu:ev_electric_pump'
  const FOIL = 'gtceu:platinum_foil'
  const ROD_TAG = '#forge:rods/titanium'
  const ROD = 'gtceu:titanium_rod'
  const PLANT_PARTS = [HULL, REACTOR, CENTRIFUGE, ELECTROLYZER, SIFTER, MIXER, PUMP, 'gtceu:platinum_plant']
  const ELECTRODE_PARTS = [ROD, FOIL, ELECTRODE]

  PP.electrode = ELECTRODE
  PP.electrodeWear = ELECTRODE_WEAR
  PP.maxEut = MAX_EUT
  PP.recipes = []
  PP.skipped = []
  PP.stages = 0
  PP.stageIds = STAGE_IDS
  PP.fusionRecipe = FUSION
  PP.openingRecipe = OPENING
  PP.keepKey = KEEP_KEY
  PP.modes = { 1: 'attack', 2: 'separation', 3: 'iridosmine', 4: 'asteroid' }
  PP.craftingParts = PLANT_PARTS
  PP.electrodeParts = ELECTRODE_PARTS
  PP.craftingRecipes = { plant: 'grindless:assembler/platinum_plant', electrode: 'grindless:assembler/platinum_electrode' }

  // ---------------------------------------------------------------- the virtual first stages (modes 3 and 4)

  // { id | tag, count } and { id, amount } -> the contents of a GT recipe's JSON, as the library reads them
  function sizedContent(x) {
    var ingredient = x.tag ? { tag: String(x.tag) } : { item: String(x.id) }
    return { content: { type: 'gtceu:sized', count: Number(x.count), ingredient: ingredient } }
  }
  function fluidContent(x) {
    return { content: { amount: Number(x.amount), value: [{ fluid: String(x.id) }] } }
  }

  // ---------------------------------------------------------------- mode 3's first stage: IV-B2's fusion

  // global.grindless.mercury.fusion (server_scripts/grindless/iv/mercury.js, set when that script loads, before any recipe event) -> the
  // JSON of a GT recipe, parsed by the library like every live stage: { id, eut, duration, v } or { id, error }
  function fusionStage(C) {
    var F = G.mercury && G.mercury.fusion
    if (!F || !F.inputs || !F.outputs) return { id: FUSION, error: 'global.grindless.mercury.fusion is missing (IV-B2, iv/mercury.js)' }
    var j = {
      type: 'gtceu:solar_processing',
      duration: Number(F.duration),
      tickInputs: { eu: [{ content: Number(F.eut) }] },
      inputs: { item: (F.inputs.items || []).map(sizedContent), fluid: (F.inputs.fluids || []).map(fluidContent) },
      outputs: { item: (F.outputs.items || []).map(sizedContent), fluid: (F.outputs.fluids || []).map(fluidContent) }
    }
    var s = C.parseStage(String(F.recipe || FUSION), j)
    PP.fusion = { recipe: String(F.recipe || FUSION), from: 'global.grindless.mercury.fusion', stage: s.error ? null : { eut: s.eut, duration: s.duration, v: s.v } }
    return s
  }

  // ---------------------------------------------------------------- mode 4's first stage: the asteroid opening

  // data/grindless/tables/asteroid_pgm.json -> the JSON of a GT recipe, parsed by the library like every live stage: { id, eut, duration,
  // v } or { id, error }. The table gives what the opening takes and makes; its energy is read from live data: energy.fusionTimes x the
  // fusion's (mode 3's first stage, as parsed) + energy.attackSludge x what one platinum group sludge costs through the plan
  // energy.attackPlan (composed from the live stages: its energy over the sludge it makes). It runs at the plant's EV rate: ceil(energy /
  // 1 920) ticks at energy / ticks EU/t, so the composer adds exactly that energy (no rounding before the recipe's own).
  function openingStage(C, steps, table) {
    function fail(reason) { return { id: OPENING, error: reason } }
    var o = table.opening
    var E = table.energy || {}
    if (!o || !o.inputs || !o.outputs) return fail(ASTEROID_TABLE + ' has no opening')
    var fusionTimes = Number(E.fusionTimes)
    var attackSludge = Number(E.attackSludge)
    if (!(fusionTimes >= 0) || !(attackSludge >= 0)) return fail(ASTEROID_TABLE + ': energy.fusionTimes and energy.attackSludge must be numbers >= 0')
    var fusion = steps[FUSION]
    if (!fusion || fusion.error) return fail('the fusion\'s energy is unknown: ' + (fusion ? fusion.error : 'no fusion stage'))
    var attackPlan = PLANS.filter(function (p) { return p.name === String(E.attackPlan) })[0]
    if (!attackPlan) return fail(ASTEROID_TABLE + ': energy.attackPlan ' + E.attackPlan + ' is not a plan of the plant')
    var attack
    try {
      attack = C.compose(attackPlan, steps)
    } catch (e) {
      attack = { error: String(e) }
    }
    if (attack.error) return fail('the sludge\'s energy is unknown: ' + attackPlan.name + ': ' + attack.error)
    var sludge = attack.net[SLUDGE] || 0
    if (!(sludge > 0)) return fail(attackPlan.name + ' makes no platinum group sludge')
    var fusionEnergy = fusionTimes * fusion.eut * fusion.duration
    var attackSludgeEnergy = attackSludge * attack.energy / sludge
    var energy = fusionEnergy + attackSludgeEnergy
    if (!(energy > 0)) return fail('the opening costs no energy')
    var duration = Math.max(1, Math.ceil(energy / MAX_EUT - 1e-9))
    var eut = energy / duration
    var j = {
      type: 'gtceu:' + TYPE_PATH,
      duration: duration,
      tickInputs: { eu: [{ content: eut }] },
      inputs: { item: (o.inputs.items || []).map(sizedContent), fluid: (o.inputs.fluids || []).map(fluidContent) },
      outputs: { item: (o.outputs.items || []).map(sizedContent), fluid: (o.outputs.fluids || []).map(fluidContent) }
    }
    var s = C.parseStage(OPENING, j)
    if (!s.error) {
      PP.asteroid.opening = {
        id: OPENING, eut: s.eut, duration: s.duration, energy: energy, v: s.v, fusionEnergy: fusionEnergy,
        attackSludgeEnergy: attackSludgeEnergy, fusionTimes: fusionTimes, attackSludge: attackSludge
      }
    }
    return s
  }

  // ---------------------------------------------------------------- the strips of the loose line

  // offworld_only.json's strip entries, by recipe id: { items: [ids], fluids: [ids] }
  function stripsOf() {
    var out = {}
    var t = G.readJsonTable(OFFWORLD_TABLE)
    ;(t.strip || []).forEach(function (s) {
      out[String(s.recipe)] = { items: (s.outputs || []).map(String), fluids: (s.fluids || []).map(String) }
    })
    return out
  }

  // the library's patch hook: a stage is read without the outputs moon/offworld_only.js strips from its loose recipe
  function stripPatch(strips, C) {
    return function (id, j) {
      var s = strips[id]
      if (!s || !j.outputs) return j
      var gone = { stage: id, items: [], fluids: [] }
      if (Array.isArray(j.outputs.item)) {
        j.outputs.item = j.outputs.item.filter(function (e) {
          var it = C.itemOf(e.content)
          if (it !== null && s.items.indexOf(it.id) >= 0) {
            gone.items.push(it.id)
            return false
          }
          return true
        })
      }
      if (Array.isArray(j.outputs.fluid)) {
        j.outputs.fluid = j.outputs.fluid.filter(function (e) {
          var f = C.fluidOf(e.content)
          if (f !== null && s.fluids.indexOf(f.id) >= 0) {
            gone.fluids.push(f.id)
            return false
          }
          return true
        })
      }
      PP.stripped.push(gone)
      return j
    }
  }

  // ---------------------------------------------------------------- from a balance to a recipe

  function recipeOf(plan, composed, C) {
    var rec = C.contents(composed, { maxEut: MAX_EUT, itemOrder: ITEM_ORDER, fluidOrder: FLUID_ORDER })
    rec.id = 'grindless:' + plan.era + '/' + plan.name
    rec.recipeId = 'grindless:' + TYPE_PATH + '/' + plan.era + '/' + plan.name
    rec.name = plan.name
    rec.mode = plan.mode
    rec.circuit = plan.circuit
    if (plan.keep) rec.keep = true
    // what is used up for certain first, the chanced inputs after it (the library's order), the electrode last
    rec.itemsIn.push({ id: ELECTRODE, count: 1, chance: ELECTRODE_WEAR })

    var entries = 0
    rec.itemsOut.forEach(function (o) {
      if (o.whole > 0) entries++
      if (o.chance > 0) entries++
    })
    // the programmed circuit is one more item input
    if (rec.itemsIn.length + 1 > IO.itemsIn) return { error: (rec.itemsIn.length + 1) + ' item inputs (the type holds ' + IO.itemsIn + ')' }
    if (entries > IO.itemsOut) return { error: entries + ' item outputs (the type holds ' + IO.itemsOut + ')' }
    if (rec.fluidsIn.length > IO.fluidsIn) return { error: rec.fluidsIn.length + ' fluid inputs (the type holds ' + IO.fluidsIn + ')' }
    if (rec.fluidsOut.length > IO.fluidsOut) return { error: rec.fluidsOut.length + ' fluid outputs (the type holds ' + IO.fluidsOut + ')' }
    return { recipe: rec }
  }

  // ---------------------------------------------------------------- generating

  // mode 4's yields against its table's promise: { want, got, differ: [ids] } (a warning when the live chain gives something else)
  function checkYields(composed, want) {
    var got = {}
    var differ = []
    Object.keys(want || {}).forEach(function (id) {
      var x = Math.round((composed.net['i:' + id] || 0) * 1e6) / 1e6
      got[id] = x
      if (Math.abs(x - Number(want[id])) > 1e-6) differ.push(id)
    })
    if (differ.length > 0) {
      console.warn(LOG + 'platinum plant asteroid: the live chain gives ' + differ.map(function (id) { return got[id] + ' ' + id }).join(', ') +
        ' a run; ' + ASTEROID_TABLE + ' promises ' + differ.map(function (id) { return want[id] + ' ' + id }).join(', '))
    }
    return { want: want, got: got, differ: differ }
  }

  function generate(event) {
    PP.recipes = []
    PP.skipped = []
    PP.stripped = []
    PP.fusion = null
    PP.asteroid = { table: ASTEROID_TABLE, concentrate: null, opening: null, yields: null, error: null }
    var C = G.compose
    if (!C) throw new Error('the composer library (server_scripts/grindless/lib/compose.js) is not loaded')
    var strips = {}
    try {
      strips = stripsOf()
    } catch (e0) {
      // without the table the plant would give what the loose line no longer gives: an error, so the release check sees it
      console.error(LOG + 'platinum plant: could not read ' + OFFWORLD_TABLE + ': ' + e0)
    }
    var read = C.gather(event, STAGE_IDS, { patch: stripPatch(strips, C) })
    var steps = read.steps
    PP.stages = read.read
    steps[FUSION] = fusionStage(C)
    var asteroidTable = null
    try {
      asteroidTable = G.readJsonTable(ASTEROID_TABLE)
      PP.asteroid.concentrate = String(asteroidTable.concentrate)
      steps[OPENING] = openingStage(C, steps, asteroidTable)
    } catch (e1) {
      steps[OPENING] = { id: OPENING, error: 'could not build the opening from ' + ASTEROID_TABLE + ': ' + e1 }
    }

    // a skipped plan means the plant lost a recipe (the loose line changed): a warning, so the log shows it
    function skip(name, reason) {
      PP.skipped.push({ name: name, reason: reason })
      console.warn(LOG + 'platinum plant skipped ' + name + ': ' + reason)
    }

    PLANS.forEach(function (plan) {
      var composed
      var p = plan
      if (plan.fromFusion) {
        // the batch is what the fusion takes of the key: its iridosmine
        var f = steps[FUSION]
        var amount = f && !f.error ? -(f.v[plan.fromFusion] || 0) : 0
        if (!(amount > 0)) {
          skip(plan.name, f && f.error ? f.error : 'the fusion takes no ' + plan.fromFusion)
          return
        }
        p = { name: plan.name, stages: plan.stages, given: bag(plan.fromFusion, amount), linked: plan.linked }
      }
      if (plan.fromOpening) {
        // the batch is what the opening takes of the table's concentrate; without the concentrate (LuV A1's) there is no mode 4
        var opening = steps[OPENING]
        var concentrate = PP.asteroid.concentrate
        if (opening.error) {
          skip(plan.name, opening.error)
          return
        }
        if (!Item.exists(concentrate)) {
          skip(plan.name, concentrate + ' is not registered (LuV A1 registers it: startup_scripts/grindless/luv/foundation.js)')
          return
        }
        var batch = -(opening.v['i:' + concentrate] || 0)
        if (!(batch > 0)) {
          skip(plan.name, 'the opening takes no ' + concentrate)
          return
        }
        p = { name: plan.name, stages: plan.stages, given: bag('i:' + concentrate, batch), linked: plan.linked }
      }
      try {
        composed = C.compose(p, steps)
      } catch (e) {
        composed = { error: String(e) }
      }
      if (composed.error) {
        skip(plan.name, composed.error)
        return
      }
      var made = recipeOf(plan, composed, C)
      if (made.error) {
        skip(plan.name, made.error)
        return
      }
      var rec = made.recipe
      var wanted = rec.itemsIn.map(function (x) { return x.id }).concat(rec.itemsOut.map(function (x) { return x.id }))
      var missing = wanted.filter(function (id) { return !Item.exists(id) })
        .concat(rec.fluidsIn.concat(rec.fluidsOut).map(function (x) { return x.id }).filter(function (id) { return !Fluid.exists(id) }))
      if (missing.length > 0) {
        skip(plan.name, 'unknown id(s): ' + missing.join(', '))
        return
      }

      var recipe = event.recipes.gtceu.pgm_refining(rec.id)
      rec.itemsIn.forEach(function (x) {
        if (x.chance >= 10000) recipe.itemInputs(x.count + 'x ' + x.id)
        else recipe.chancedInput(x.count + 'x ' + x.id, x.chance, 0)
      })
      recipe.circuit(rec.circuit)
      rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
      rec.itemsOut.forEach(function (o) {
        if (o.whole > 0) recipe.itemOutputs(o.whole + 'x ' + o.id)
        if (o.chance > 0) recipe.chancedOutput('1x ' + o.id, o.chance, 0)
      })
      rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
      recipe.EUt(rec.eut).duration(rec.duration)
      // the startup script's modifier and start check refuse voiding for the recipes that carry it (mode 4)
      if (rec.keep) recipe.addDataBool(KEEP_KEY, true)
      if (plan.fromOpening) PP.asteroid.yields = checkYields(composed, asteroidTable.yields)
      PP.recipes.push(rec)
      console.info(LOG + 'pgm_refining ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t = ' + rec.energy + ' EU from ' + rec.sources.length + ' stages' +
        (rec.keep ? '; refuses voiding' : ''))
    })
    PP.skipped.forEach(function (s) {
      if (s.name === 'asteroid') PP.asteroid.error = s.reason
    })

    var attack = PP.recipes.filter(function (r) { return r.mode === 'attack' }).length
    var iridosmine = PP.recipes.filter(function (r) { return r.mode === 'iridosmine' }).length
    var asteroid = PP.recipes.filter(function (r) { return r.mode === 'asteroid' }).length
    console.info(LOG + 'pgm_refining recipes added: ' + PP.recipes.length + ' (' + attack + ' attack, ' +
      (PP.recipes.length - attack - iridosmine - asteroid) + ' separation, ' + iridosmine + ' iridosmine, ' + asteroid + ' asteroid) from ' + PP.stages +
      ' stages; skipped ' + PP.skipped.length)
  }

  // UEV-A4 rows (circuits 7 and 8; 1-4 are the plans, 5 is UHV's iridium crucible, 6 its Proxima liquor; UEV-B3 adds circuit 9): the superalloy's dross gives its ruthenium and the
  // electron beam's skull gives its iridium. Same electrode wear and no voiding of the cargo, as the plans.
  var UEV_ROWS = [
    {
      name: 'sx_dross', circuit: 7,
      itemIn: 'grindless:sx_dross', fluidsIn: [['gtceu:chlorine', 3000], ['gtceu:hydrogen', 3000]],
      itemsOut: [['gtceu:ruthenium_dust', 1], ['gtceu:nickel_dust', 1]], fluidsOut: [['gtceu:hydrochloric_acid', 3000]],
      eut: 1920, duration: 200
    },
    {
      name: 'eb_skull', circuit: 8,
      itemIn: 'grindless:eb_skull', fluidsIn: [['gtceu:chlorine', 1000]],
      itemsOut: [['gtceu:iridium_dust', 1]], fluidsOut: [['gtceu:hydrochloric_acid', 1000]],
      eut: 1920, duration: 200
    },
    {
      // UEV-B3 (circuit 9): the Barnard residue of the carbonyl refinery (Re, Os, Ir, Pt, W) digested in aqua regia; the platinum metals and the
      // tungsten come out as dust, the rhenium as crude ammonium perrhenate (line 10 goes on in tables/barnard.json). Barnard b only.
      name: 'barnard_residue', circuit: 9, site: 'barnard_b',
      itemIn: 'grindless:barnard_residue', fluidsIn: [['gtceu:hydrochloric_acid', 3000], ['gtceu:nitric_acid', 1000], ['gtceu:ammonia', 1000]],
      itemsOut: [['gtceu:osmium_dust', 1], ['gtceu:iridium_dust', 1], ['gtceu:platinum_dust', 1], ['gtceu:tungsten_dust', 1],
        ['grindless:crude_ammonium_perrhenate', 1]],
      fluidsOut: [['minecraft:water', 2000]],
      eut: 1920, duration: 300
    }
  ]

  function addUevRows(event) {
    UEV_ROWS.forEach(function (r) {
      var missing = [r.itemIn].concat(r.itemsOut.map(function (o) { return o[0] })).filter(function (id) { return !Item.exists(id) })
        .concat(r.fluidsIn.concat(r.fluidsOut).map(function (f) { return f[0] }).filter(function (id) { return !Fluid.exists(id) }))
      if (missing.length > 0) {
        console.error(LOG + 'pgm_refining row ' + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu.pgm_refining('grindless:uev/' + r.name)
      recipe.itemInputs('1x ' + r.itemIn)
      recipe.chancedInput('1x ' + ELECTRODE, ELECTRODE_WEAR, 0)
      recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f[0], f[1])) })
      r.itemsOut.forEach(function (o) { recipe.itemOutputs(o[1] + 'x ' + o[0]) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f[0], f[1])) })
      recipe.EUt(r.eut).duration(r.duration)
      if (r.site && global.grindless.places) global.grindless.places.allow(recipe, r.site)
      recipe.addDataBool(KEEP_KEY, true)
    })
  }

  // UIV-B2 row (circuit 10; 1-4 plans, 5-6 UHV, 7-9 UEV): the r-process ash's platinum-group cut (line 31); same electrode wear, nothing voided
  var UIV_ROWS = [
    {
      name: 'r_process_ash', circuit: 10,
      itemIn: 'grindless:r_process_ash', fluidsIn: [['gtceu:hydrochloric_acid', 3000], ['gtceu:nitric_acid', 1000]],
      itemsOut: [['gtceu:osmium_dust', 1], ['gtceu:iridium_dust', 1], ['gtceu:platinum_dust', 1], ['gtceu:gold_dust', 1]],
      fluidsOut: [['minecraft:water', 2000]],
      eut: 1920, duration: 300
    }
  ]

  function addUivRows(event) {
    UIV_ROWS.forEach(function (r) {
      var missing = [r.itemIn].concat(r.itemsOut.map(function (o) { return o[0] })).filter(function (id) { return !Item.exists(id) })
        .concat(r.fluidsIn.concat(r.fluidsOut).map(function (f) { return f[0] }).filter(function (id) { return !Fluid.exists(id) }))
      if (missing.length > 0) {
        console.error(LOG + 'pgm_refining row ' + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu.pgm_refining('grindless:uiv/' + r.name)
      recipe.itemInputs('1x ' + r.itemIn)
      recipe.chancedInput('1x ' + ELECTRODE, ELECTRODE_WEAR, 0)
      recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f[0], f[1])) })
      r.itemsOut.forEach(function (o) { recipe.itemOutputs(o[1] + 'x ' + o[0]) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f[0], f[1])) })
      recipe.EUt(r.eut).duration(r.duration)
      recipe.addDataBool(KEEP_KEY, true)
    })
  }

  // UXV-A2 rows (circuits 11-14; 10 is UIV's r-process ash, so the design's 10-13 moved up by one): the 5N platinum metals of the spintronic
  // targets (lines 4 and 10) and the recovery of the etch residue and sputter redeposit (lines 4, 6-8, 10), which is GTM's platinum group
  // sludge. Same electrode wear and no voiding of the cargo, as the plans. The acid the metals are dissolved in comes back diluted.
  var UXV_ROWS = [
    {
      name: 'five_n_platinum', circuit: 11,
      itemIn: 'gtceu:platinum_dust', fluidsIn: [['gtceu:hydrochloric_acid', 2000], ['gtceu:chlorine', 1000]],
      itemsOut: [['grindless:five_n_platinum', 1]], fluidsOut: [['gtceu:diluted_hydrochloric_acid', 2000]],
      eut: 1920, duration: 300
    },
    {
      name: 'five_n_ruthenium', circuit: 12,
      itemIn: 'gtceu:ruthenium_dust', fluidsIn: [['gtceu:chlorine', 3000], ['gtceu:hydrogen', 3000]],
      itemsOut: [['grindless:five_n_ruthenium', 1]], fluidsOut: [['gtceu:hydrochloric_acid', 3000]],
      eut: 1920, duration: 300
    },
    {
      name: 'five_n_iridium', circuit: 13,
      itemIn: 'gtceu:iridium_dust', fluidsIn: [['gtceu:chlorine', 1000], ['gtceu:hydrogen', 1000]],
      itemsOut: [['grindless:five_n_iridium', 1]], fluidsOut: [['gtceu:hydrochloric_acid', 1000]],
      eut: 1920, duration: 300
    },
    {
      name: 'etch_residue', circuit: 14,
      itemIn: 'gtceu:platinum_group_sludge_dust', fluidsIn: [['gtceu:hydrochloric_acid', 3000], ['gtceu:nitric_acid', 1000]],
      itemsOut: [['gtceu:platinum_dust', 1], ['gtceu:ruthenium_dust', 1]], fluidsOut: [['minecraft:water', 2000]],
      eut: 1920, duration: 300
    }
  ]

  function addUxvRows(event) {
    UXV_ROWS.forEach(function (r) {
      var missing = [r.itemIn].concat(r.itemsOut.map(function (o) { return o[0] })).filter(function (id) { return !Item.exists(id) })
        .concat(r.fluidsIn.concat(r.fluidsOut).map(function (f) { return f[0] }).filter(function (id) { return !Fluid.exists(id) }))
      if (missing.length > 0) {
        console.error(LOG + 'pgm_refining row ' + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu.pgm_refining('grindless:uxv/' + r.name)
      recipe.itemInputs('1x ' + r.itemIn)
      recipe.chancedInput('1x ' + ELECTRODE, ELECTRODE_WEAR, 0)
      recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f[0], f[1])) })
      r.itemsOut.forEach(function (o) { recipe.itemOutputs(o[1] + 'x ' + o[0]) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f[0], f[1])) })
      recipe.EUt(r.eut).duration(r.duration)
      recipe.addDataBool(KEEP_KEY, true)
    })
  }

  // OpV-D1 rows (opv.md line 21; circuits 15-16): a spent spallation target's iridium core, declad in the hot cell (c18), dissolved and
  // reduced back to iridium dust (13 of the 16 that went in), which circuit 13 refines to 5N again (grindless:five_n_iridium stays
  // UXV-A2's alone); the 3 transmuted by spallation leave as a residue, whose aqua regia leach gives back the iridium left in it with
  // the osmium and tungsten it became (no rhenium: gtceu:rhenium_dust is Barnard's alone).
  // Same electrode wear and no voiding of the cargo.
  var OPV_ROWS = [
    {
      name: 'ir_core_recovery', circuit: 15,
      itemIn: 'grindless:decladded_ir_core', fluidsIn: [['gtceu:chlorine', 4000], ['gtceu:hydrogen', 4000]],
      itemsOut: [['gtceu:iridium_dust', 13], ['grindless:ir_spallation_residue', 1]], fluidsOut: [['gtceu:hydrochloric_acid', 4000]],
      eut: 1920, duration: 1200
    },
    {
      name: 'ir_spallation_residue', circuit: 16,
      itemIn: 'grindless:ir_spallation_residue', fluidsIn: [['gtceu:hydrochloric_acid', 3000], ['gtceu:nitric_acid', 1000]],
      itemsOut: [['gtceu:iridium_dust', 1], ['gtceu:osmium_dust', 1], ['gtceu:tungsten_dust', 1]],
      fluidsOut: [['minecraft:water', 2000]],
      eut: 1920, duration: 600
    }
  ]

  function addOpvRows(event) {
    OPV_ROWS.forEach(function (r) {
      var missing = [r.itemIn].concat(r.itemsOut.map(function (o) { return o[0] })).filter(function (id) { return !Item.exists(id) })
        .concat(r.fluidsIn.concat(r.fluidsOut).map(function (f) { return f[0] }).filter(function (id) { return !Fluid.exists(id) }))
      if (missing.length > 0) {
        console.error(LOG + 'pgm_refining row ' + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu.pgm_refining('grindless:opv/' + r.name)
      recipe.itemInputs('1x ' + r.itemIn)
      recipe.chancedInput('1x ' + ELECTRODE, ELECTRODE_WEAR, 0)
      recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f[0], f[1])) })
      r.itemsOut.forEach(function (o) { recipe.itemOutputs(o[1] + 'x ' + o[0]) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f[0], f[1])) })
      recipe.EUt(r.eut).duration(r.duration)
      recipe.addDataBool(KEEP_KEY, true)
    })
  }

  // ---------------------------------------------------------------- crafting

  function missingOf(ids) {
    return ids.filter(function (id) { return !Item.exists(id) })
  }

  function addCrafting(event) {
    var missingPlant = missingOf(PLANT_PARTS)
    if (missingPlant.length > 0) {
      console.error(LOG + 'Platinum Plant recipe skipped, unknown item(s): ' + missingPlant.join(', '))
    } else {
      event.recipes.gtceu.assembler('grindless:platinum_plant')
        .itemInputs(HULL, REACTOR, CENTRIFUGE, ELECTROLYZER, SIFTER, MIXER, '2x ' + PUMP, '4x #gtceu:circuits/ev', '2x ' + ELECTRODE, '2x grindless:reforming_catalyst')
        .inputFluids(Fluid.of('gtceu:hydrochloric_acid', 2000))
        .itemOutputs('gtceu:platinum_plant')
        .EUt(480).duration(600)
    }

    var missingElectrode = missingOf(ELECTRODE_PARTS)
    if (missingElectrode.length > 0) {
      console.error(LOG + 'platinum electrode recipe skipped, unknown item(s): ' + missingElectrode.join(', '))
    } else {
      event.recipes.gtceu.assembler('grindless:platinum_electrode')
        .itemInputs(ROD_TAG, '4x ' + FOIL)
        .itemOutputs(ELECTRODE)
        .EUt(120).duration(300)
    }
    console.info(LOG + 'platinum plant crafting recipes added')
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'platinum plant recipe generation failed: ' + e)
    }
    try {
      addUevRows(event)
    } catch (e3) {
      console.error(LOG + 'platinum plant UEV rows failed: ' + e3)
    }
    try {
      addUivRows(event)
    } catch (e4) {
      console.error(LOG + 'platinum plant UIV rows failed: ' + e4)
    }
    try {
      addUxvRows(event)
    } catch (e5) {
      console.error(LOG + 'platinum plant UXV rows failed: ' + e5)
    }
    try {
      addOpvRows(event)
    } catch (e6) {
      console.error(LOG + 'platinum plant OpV rows failed: ' + e6)
    }
    try {
      addCrafting(event)
    } catch (e2) {
      console.error(LOG + 'platinum plant crafting recipes failed: ' + e2)
    }
  })
})()
