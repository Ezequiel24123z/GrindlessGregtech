// -----------------------------------------------------------------------------------------------
// gtceu:pgm_refining recipes of the Platinum Plant (gtceu:platinum_plant), generated at server load from the LOOSE platinum-group line that
// is in the recipe set, and the recipes that make the plant and its electrode (EV era; mode 3 is IV's). Nothing of the line is typed by
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
//                          acid, palladium metal dust, iridium metal residue, rarest metal mixture).  stages: sludge centrifuge -> dissolve the
//                          platinum powder in nitration mixture -> large reactor with ammonium chloride (salt + raw) -> sifter -> blast
//                          furnace (back to platinum powder: the loop, run to the end) -> raw platinum + calcium -> platinum
//       palladium          palladium-rich ammonia + palladium metal dust + ammonia + formic acid -> palladium.  stages: dust -> rich ammonia
//                          (ammonia), the large palladium reactor, the sifter (back to metal dust: the loop) and the formic acid step that
//                          gives the ammonia back
//       rhodium_ruthenium  platinum slag + potassium pyrosulfate, saltpeter, sodium nitrate, zinc, hydrochloric acid, salt water and steam ->
//                          rhodium + ruthenium + rarest metal mixture + zinc sulfate + salt + chlorine + ammonia + water + potassium.
//                          stages: the leach, the rhodium sulfate, the rhodium salt / nitrate / filter cake / reprecipitated rhodium line, and
//                          the sodium rutheniate -> ruthenium tetroxide -> cracker -> distillation -> solid -> ruthenium line
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
//                          its 700 mB of tetroxide 0.7 osmium: 3 Ir : 1 Os.
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
// Recipe ids (GTM's builder puts the type in front): grindless:pgm_refining/ev/<name>, name attack_pentlandite, attack_chalcopyrite,
// platinum, palladium, rhodium_ruthenium; and grindless:pgm_refining/iv/iridosmine.
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
//                sourceEnergy (sum of the stages) }]
//   .skipped  [{ name, reason }]      .stages  number of source recipes read from the live line      .stageIds  every live stage id the plans use
//   .fusion   { recipe, from, stage: { eut, duration, v } } (mode 3's first stage, as read from global.grindless.mercury.fusion)
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
  // mode 3's first stage: IV-B2's Mercury solar works recipe, built from global.grindless.mercury.fusion (not an original recipe)
  const FUSION = 'grindless:solar_processing/iridosmine_fusion'
  // what the recipe type holds (startup_scripts/grindless/ev/platinum_plant.js publishes it)
  const IO = PP.maxIO || { itemsIn: 8, itemsOut: 12, fluidsIn: 3, fluidsOut: 4 }

  function item(name) { return 'i:gtceu:' + name }
  function fluid(name) { return 'f:gtceu:' + name }
  function stage(path) { return 'gtceu:' + path }

  // bag(key, amount, key, amount, ...) -> { key: amount }
  function bag() {
    var out = {}
    for (var i = 0; i + 1 < arguments.length; i += 2) out[arguments[i]] = arguments[i + 1]
    return out
  }

  // The plans. `stages`: the stage recipes of the loose line (recipe ids). `given`: what the batch takes in, all of it (the batch size).
  // `linked`: the intermediates that must net to zero. Given + linked must be as many as the stages: the system is square. Everything else
  // the stages touch is a free input or output of the recipe. `era` is the folder of the recipe id. Mode 3's `given` is the fusion's own
  // iridosmine (filled in from global.grindless.mercury.fusion when the recipes are built).
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
      stages: [
        FUSION,
        stage('electric_blast_furnace/rarest_metal_residue_ebf'),
        stage('distillation_tower/acidic_osmium_solution_distill'),
        stage('chemical_reactor/osmium_dust_completion'),
        stage('electric_blast_furnace/iridium_metal_residue_process'),
        stage('chemical_reactor/iridium_dioxide_dissolving'),
        stage('chemical_reactor/iridium_chloride'),
        stage('chemical_reactor/iridium_chloride_separation'),
        stage('chemical_reactor/hydrochloric_acid'),
        stage('chemical_reactor/ammonium_chloride')
      ],
      given: {},
      linked: [
        item('rarest_metal_mixture_dust'), item('iridium_metal_residue_dust'), fluid('acidic_osmium_solution'), fluid('osmium_tetroxide'),
        item('iridium_dioxide_dust'), fluid('acidic_iridium'), item('iridium_chloride_dust'), fluid('chlorine'), fluid('ammonium_chloride')
      ]
    }
  ]

  // the order of the outputs of a recipe: the metals first, then what the line lets go
  const ITEM_ORDER = ['gtceu:platinum_dust', 'gtceu:palladium_dust', 'gtceu:rhodium_dust', 'gtceu:ruthenium_dust', 'gtceu:iridium_dust', 'gtceu:osmium_dust',
    'gtceu:nickel_dust', 'gtceu:copper_dust', 'gtceu:platinum_group_sludge_dust', 'gtceu:gold_dust', 'gtceu:silicon_dioxide_dust', 'gtceu:platinum_slag_dust',
    'gtceu:palladium_metal_dust', 'gtceu:rarest_metal_mixture_dust', 'gtceu:iridium_metal_residue_dust', 'gtceu:platinum_sludge_residue_dust',
    'gtceu:metal_sludge_dust', 'gtceu:calcium_chloride_dust', 'gtceu:zinc_sulfate_dust', 'gtceu:salt_dust']
  const FLUID_ORDER = ['gtceu:oxygen', 'gtceu:sulfuric_acid', 'gtceu:palladium_rich_ammonia', 'gtceu:nitrogen_dioxide', 'gtceu:diluted_sulfuric_acid', 'gtceu:ammonia',
    'gtceu:chlorine', 'minecraft:water', 'gtceu:steam', 'gtceu:potassium']

  // the stages read from the live line (every stage id of every plan but the fusion, which is built from IV-B2's published object)
  const STAGE_IDS = []
  PLANS.forEach(function (plan) {
    plan.stages.forEach(function (id) {
      if (id !== FUSION && STAGE_IDS.indexOf(id) < 0) STAGE_IDS.push(id)
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
  PP.modes = { 1: 'attack', 2: 'separation', 3: 'iridosmine' }
  PP.craftingParts = PLANT_PARTS
  PP.electrodeParts = ELECTRODE_PARTS
  PP.craftingRecipes = { plant: 'grindless:assembler/platinum_plant', electrode: 'grindless:assembler/platinum_electrode' }

  // ---------------------------------------------------------------- mode 3's first stage: IV-B2's fusion

  // global.grindless.mercury.fusion (server_scripts/grindless/iv/mercury.js, set when that script loads, before any recipe event) -> the
  // JSON of a GT recipe, parsed by the library like every live stage: { id, eut, duration, v } or { id, error }
  function fusionStage(C) {
    var F = G.mercury && G.mercury.fusion
    if (!F || !F.inputs || !F.outputs) return { id: FUSION, error: 'global.grindless.mercury.fusion is missing (IV-B2, iv/mercury.js)' }
    function sized(x) {
      var ingredient = x.tag ? { tag: String(x.tag) } : { item: String(x.id) }
      return { content: { type: 'gtceu:sized', count: Number(x.count), ingredient: ingredient } }
    }
    function fluidContent(x) {
      return { content: { amount: Number(x.amount), value: [{ fluid: String(x.id) }] } }
    }
    var j = {
      type: 'gtceu:solar_processing',
      duration: Number(F.duration),
      tickInputs: { eu: [{ content: Number(F.eut) }] },
      inputs: { item: (F.inputs.items || []).map(sized), fluid: (F.inputs.fluids || []).map(fluidContent) },
      outputs: { item: (F.outputs.items || []).map(sized), fluid: (F.outputs.fluids || []).map(fluidContent) }
    }
    var s = C.parseStage(String(F.recipe || FUSION), j)
    PP.fusion = { recipe: String(F.recipe || FUSION), from: 'global.grindless.mercury.fusion', stage: s.error ? null : { eut: s.eut, duration: s.duration, v: s.v } }
    return s
  }

  // ---------------------------------------------------------------- from a balance to a recipe

  function recipeOf(plan, composed, C) {
    var rec = C.contents(composed, { maxEut: MAX_EUT, itemOrder: ITEM_ORDER, fluidOrder: FLUID_ORDER })
    rec.id = 'grindless:' + plan.era + '/' + plan.name
    rec.recipeId = 'grindless:' + TYPE_PATH + '/' + plan.era + '/' + plan.name
    rec.name = plan.name
    rec.mode = plan.mode
    rec.circuit = plan.circuit
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

  function generate(event) {
    PP.recipes = []
    PP.skipped = []
    PP.fusion = null
    var C = G.compose
    if (!C) throw new Error('the composer library (server_scripts/grindless/lib/compose.js) is not loaded')
    var read = C.gather(event, STAGE_IDS)
    var steps = read.steps
    PP.stages = read.read
    steps[FUSION] = fusionStage(C)

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
      PP.recipes.push(rec)
      console.info(LOG + 'pgm_refining ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t = ' + rec.energy + ' EU from ' + rec.sources.length + ' stages')
    })

    var attack = PP.recipes.filter(function (r) { return r.mode === 'attack' }).length
    var iridosmine = PP.recipes.filter(function (r) { return r.mode === 'iridosmine' }).length
    console.info(LOG + 'pgm_refining recipes added: ' + PP.recipes.length + ' (' + attack + ' attack, ' +
      (PP.recipes.length - attack - iridosmine) + ' separation, ' + iridosmine + ' iridosmine) from ' + PP.stages + ' stages; skipped ' + PP.skipped.length)
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
        .itemInputs(HULL, REACTOR, CENTRIFUGE, ELECTROLYZER, SIFTER, MIXER, '2x ' + PUMP, '4x #gtceu:circuits/ev')
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
      addCrafting(event)
    } catch (e2) {
      console.error(LOG + 'platinum plant crafting recipes failed: ' + e2)
    }
  })
})()
