// -----------------------------------------------------------------------------------------------
// gtceu:pgm_refining recipes of the Platinum Plant (gtceu:platinum_plant), generated at server load from the LOOSE platinum-group line that
// is in the recipe set, and the recipes that make the plant and its electrode (EV era). Nothing of the line is typed by hand: the stage
// recipes are read (ServerEvents.recipes, original recipes, their JSON), chained, and the amounts and the energy come out of the chain, so
// the ratios are the line's by construction.
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
//   left out: the iridium and osmium line (rarest metal mixture and iridium metal residue come out of the plant: an IV job, ev.md) and the
//   pgs_from_<ore> recipes of GT-- (ore + nitration mixture -> concentrated platinum, bypassing the sludge: removed by integration/gtnn.js)
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
// platinum, palladium, rhodium_ruthenium.
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
//   .recipes  [{ id (what the builder got), recipeId (the final id), name, mode, circuit, sources: [{ id, scale }] (stages and how many times
//                each runs), itemsIn: [{ id, count, chance }] (chance 10000 = used up), fluidsIn: [{ id, amount }], itemsOut: [{ id, whole,
//                chance }] (chance 0 = none), fluidsOut: [{ id, amount }], eut, duration, energy (what the recipe costs), sourceEnergy (sum
//                of the stages) }]
//   .skipped  [{ name, reason }]      .stages  number of source recipes read      .stageIds  every stage id the plans use
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
  const ID_PREFIX = 'grindless:ev/'
  const TYPE_PATH = 'pgm_refining'
  const ATTACK_CIRCUIT = 1
  const SEPARATION_CIRCUIT = 2
  // what the recipe type holds (startup_scripts/grindless/ev/platinum_plant.js publishes it)
  const IO = PP.maxIO || { itemsIn: 8, itemsOut: 12, fluidsIn: 3, fluidsOut: 4 }
  const EPS = 1e-6

  function item(name) { return 'i:gtceu:' + name }
  function fluid(name) { return 'f:gtceu:' + name }

  // bag(key, amount, key, amount, ...) -> { key: amount }
  function bag() {
    var out = {}
    for (var i = 0; i + 1 < arguments.length; i += 2) out[arguments[i]] = arguments[i + 1]
    return out
  }

  // The plans. `stages`: the stage recipes of the loose line (gtceu: ids). `given`: what the batch takes in, all of it (the batch size).
  // `linked`: the intermediates that must net to zero. Given + linked must be as many as the stages: the system is square. Everything else
  // the stages touch is a free input or output of the recipe.
  const PLANS = [
    {
      name: 'attack_pentlandite', mode: 'attack', circuit: ATTACK_CIRCUIT,
      stages: ['large_chemical_reactor/platinum_group_sludge_dust1', 'electrolyzer/decomposition_electrolyzing_sulfuric_nickel_solution'],
      given: bag(item('purified_pentlandite_ore'), 9),
      linked: [fluid('sulfuric_nickel_solution')]
    },
    {
      name: 'attack_chalcopyrite', mode: 'attack', circuit: ATTACK_CIRCUIT,
      stages: ['large_chemical_reactor/platinum_group_sludge_dust2', 'electrolyzer/decomposition_electrolyzing_sulfuric_copper_solution'],
      given: bag(item('purified_chalcopyrite_ore'), 9),
      linked: [fluid('sulfuric_copper_solution')]
    },
    {
      name: 'platinum', mode: 'separation', circuit: SEPARATION_CIRCUIT,
      stages: [
        'centrifuge/platinum_group_sludge_dust',
        'chemical_reactor/dissolve_platinum_metallic_powder9',
        'large_chemical_reactor/large_platinum_dusts',
        'sifter/refined_platinum_salt',
        'electric_blast_furnace/refined_platinum_salt_dust_ebf',
        'chemical_reactor/raw_platinum_separation'
      ],
      given: bag(item('platinum_group_sludge_dust'), 1),
      linked: [item('platinum_metal_dust'), fluid('concentrated_platinum'), item('platinum_salt_dust'), item('refined_platinum_salt_dust'), item('platinum_raw_dust')]
    },
    {
      // the batch is what one batch of the platinum recipe lets go: 10 800 mB of rich ammonia and 0.95 palladium metal dust
      name: 'palladium', mode: 'separation', circuit: SEPARATION_CIRCUIT,
      stages: [
        'chemical_reactor/palladium_metallic_powder_conversion',
        'chemical_reactor/large_palladium_dusts',
        'sifter/salt_to_metallic_powder_palladium',
        'chemical_reactor/raw_palladium_separation'
      ],
      given: bag(fluid('palladium_rich_ammonia'), 10800, item('palladium_metal_dust'), 0.95),
      linked: [item('palladium_salt_dust'), item('palladium_raw_dust')]
    },
    {
      // the batch is the 6 platinum slag of one batch of the platinum recipe
      name: 'rhodium_ruthenium', mode: 'separation', circuit: SEPARATION_CIRCUIT,
      stages: [
        'electric_blast_furnace/leach_residue_one',
        'large_chemical_reactor/rhodium_sulfate_to_solution_l',
        'extractor/potassium_pyrosulfate_dust',
        'chemical_reactor/crude_rhodium_metallic_powder',
        'electric_blast_furnace/rhodium_salt_ebf',
        'mixer/rhodium_salt_solution',
        'chemical_reactor/rhodium_nitrate',
        'sifter/rhodium_filter_cake',
        'mixer/rhodium_filter_cake_solution',
        'chemical_reactor/reprecipitated_rhodium',
        'chemical_reactor/rhodium_dust',
        'electric_blast_furnace/rarest_metal_residue',
        'chemical_reactor/ruthenium_tetroxide',
        'cracker/hot_ruthenium_tetroxide',
        'distillation_tower/hot_ruthenium_tetroxide_distill',
        'fluid_solidifier/ruthenium_tetroxide_dust',
        'chemical_reactor/ruthenium_tetroxide_separation'
      ],
      given: bag(item('platinum_slag_dust'), 6),
      linked: [
        fluid('rhodium_sulfate_gas'), fluid('molten_potassium_pyrosulfate'), fluid('rhodium_sulfate'), item('roughly_rhodium_metal_dust'),
        item('rhodium_salt_dust'), fluid('rhodium_salt'), item('rhodium_nitrate_dust'), item('rhodium_filter_cake_dust'),
        fluid('rhodium_filter_cake'), item('reprecipitated_rhodium_dust'), item('inert_metal_mixture_dust'), item('sodium_rutheniate_dust'),
        fluid('ruthenium_tetroxide'), fluid('ruthenium_tetroxide_hot'), fluid('ruthenium_tetroxide_lq'), item('ruthenium_tetroxide_dust')
      ]
    }
  ]

  // the order of the outputs of a recipe: the metals first, then what the line lets go
  const ITEM_ORDER = ['gtceu:platinum_dust', 'gtceu:palladium_dust', 'gtceu:rhodium_dust', 'gtceu:ruthenium_dust', 'gtceu:nickel_dust', 'gtceu:copper_dust',
    'gtceu:platinum_group_sludge_dust', 'gtceu:gold_dust', 'gtceu:silicon_dioxide_dust', 'gtceu:platinum_slag_dust', 'gtceu:palladium_metal_dust',
    'gtceu:rarest_metal_mixture_dust', 'gtceu:iridium_metal_residue_dust', 'gtceu:calcium_chloride_dust', 'gtceu:zinc_sulfate_dust', 'gtceu:salt_dust']
  const FLUID_ORDER = ['gtceu:oxygen', 'gtceu:sulfuric_acid', 'gtceu:palladium_rich_ammonia', 'gtceu:nitrogen_dioxide', 'gtceu:diluted_sulfuric_acid', 'gtceu:ammonia',
    'gtceu:chlorine', 'minecraft:water', 'gtceu:potassium']

  const STAGE_IDS = []
  PLANS.forEach(function (plan) {
    plan.stages.forEach(function (id) {
      if (STAGE_IDS.indexOf('gtceu:' + id) < 0) STAGE_IDS.push('gtceu:' + id)
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
  PP.craftingParts = PLANT_PARTS
  PP.electrodeParts = ELECTRODE_PARTS
  PP.craftingRecipes = { plant: 'grindless:assembler/platinum_plant', electrode: 'grindless:assembler/platinum_electrode' }

  // ---------------------------------------------------------------- reading the loose line's recipes

  // RecipeJS.toString() is "<id>[<type>]" (the type object cannot be read from scripts); getId() is the fallback
  function recipeId(r) {
    var m = /^(.*)\[([^\[\]]*)\]$/.exec(String(r))
    if (m) return m[1]
    try {
      return String(r.getId())
    } catch (e) {
      return ''
    }
  }

  // { amount, value: [{ fluid } | { tag }] } -> { id, amount } (a tag is a GTM material tag: forge:<name> is the fluid gtceu:<name>)
  function fluidOf(content) {
    if (!content || !content.value || content.value.length === 0) return null
    var v = content.value[0]
    var id = null
    if (v.fluid) {
      id = String(v.fluid)
    } else if (v.tag) {
      var name = String(v.tag).replace(/^[^:]*:/, '')
      var candidates = ['gtceu:' + name, 'minecraft:' + name]
      for (var i = 0; i < candidates.length; i++) {
        if (Fluid.exists(candidates[i])) {
          id = candidates[i]
          break
        }
      }
    }
    return id === null ? null : { id: id, amount: Number(content.amount) }
  }

  // an item tag of GTM -> its item: forge:dusts/<name> is gtceu:<name>_dust, forge:purified_ores/<name> is gtceu:purified_<name>_ore
  function itemOfTag(tag) {
    var m = /^[^:]*:dusts\/(.+)$/.exec(tag)
    if (m && Item.exists('gtceu:' + m[1] + '_dust')) return 'gtceu:' + m[1] + '_dust'
    m = /^[^:]*:purified_ores\/(.+)$/.exec(tag)
    if (m && Item.exists('gtceu:purified_' + m[1] + '_ore')) return 'gtceu:purified_' + m[1] + '_ore'
    return null
  }

  // { item } | { tag } | { type: 'gtceu:sized', count, ingredient: { item | tag } } -> { id, count } or null
  function itemOf(content) {
    if (!content) return null
    var count = Number(content.count || 1)
    var source = content.ingredient ? content.ingredient : content
    if (source.item) return { id: String(source.item), count: count }
    if (source.tag) {
      var id = itemOfTag(String(source.tag))
      return id === null ? null : { id: id, count: count }
    }
    return null
  }

  function isCircuit(content) {
    if (!content) return false
    if (content.ingredient && content.ingredient.type === 'gtceu:circuit') return true
    return content.type === 'gtceu:circuit'
  }

  // total EU/t of a recipe: a plain number is voltage x 1 A, { voltage, amperage } is both
  function energyOf(j) {
    var eu = j.tickInputs && j.tickInputs.eu && j.tickInputs.eu[0] ? j.tickInputs.eu[0].content : null
    if (typeof eu === 'number') return eu
    if (eu && eu.voltage !== undefined) return Number(eu.voltage) * Number(eu.amperage || 1)
    return null
  }

  // the share of the content that is used / made in a run: chance / maxChance (a chance of 0 is a catalyst that is not used up)
  function shareOf(entry) {
    var max = entry.maxChance !== undefined ? Number(entry.maxChance) : 10000
    var chance = entry.chance !== undefined ? Number(entry.chance) : max
    return chance / max
  }

  // one stage recipe -> { id, eut, duration, v: { 'i:<item>' | 'f:<fluid>': net amount of one run } } or { id, error }. The programmed
  // circuit is left out.
  function parseStage(id, j) {
    if (!j.inputs && !j.outputs) return { id: id, error: 'an empty recipe (a line that was emptied)' }
    var eut = energyOf(j)
    if (eut === null) return { id: id, error: 'unreadable energy' }
    var duration = Number(j.duration)
    if (!(duration > 0)) return { id: id, error: 'no duration' }
    var v = {}
    function add(key, x) {
      v[key] = (v[key] || 0) + x
    }
    var i
    var inputs = j.inputs && j.inputs.item ? j.inputs.item : []
    for (i = 0; i < inputs.length; i++) {
      if (isCircuit(inputs[i].content)) continue
      var it = itemOf(inputs[i].content)
      if (it === null) return { id: id, error: 'unreadable item input ' + i }
      add('i:' + it.id, -it.count * shareOf(inputs[i]))
    }
    var fluidsIn = j.inputs && j.inputs.fluid ? j.inputs.fluid : []
    for (i = 0; i < fluidsIn.length; i++) {
      var fi = fluidOf(fluidsIn[i].content)
      if (fi === null) return { id: id, error: 'unreadable fluid input ' + i }
      add('f:' + fi.id, -fi.amount)
    }
    var outputs = j.outputs && j.outputs.item ? j.outputs.item : []
    for (i = 0; i < outputs.length; i++) {
      var io = itemOf(outputs[i].content)
      if (io === null) return { id: id, error: 'unreadable item output ' + i }
      add('i:' + io.id, io.count * shareOf(outputs[i]))
    }
    var fluidsOut = j.outputs && j.outputs.fluid ? j.outputs.fluid : []
    for (i = 0; i < fluidsOut.length; i++) {
      var fo = fluidOf(fluidsOut[i].content)
      if (fo === null) return { id: id, error: 'unreadable fluid output ' + i }
      add('f:' + fo.id, fo.amount)
    }
    if (Object.keys(v).length === 0) return { id: id, error: 'an empty recipe (a line that was emptied)' }
    return { id: id, eut: eut, duration: duration, v: v }
  }

  // every stage the plans need, by id (GTM recipe ids)
  function gather(event) {
    var steps = {}
    var wanted = {}
    STAGE_IDS.forEach(function (id) { wanted[id] = true })
    var read = 0
    event.originalRecipes.values().forEach(function (r) {
      var id = recipeId(r)
      if (wanted[id] !== true) return
      try {
        if (r.json === null || r.json === undefined) return
        var s = parseStage(id, JSON.parse(String(r.json)))
        steps[id] = s
        if (!s.error) read++
      } catch (e) {
        steps[id] = { id: id, error: 'unreadable recipe: ' + e }
      }
    })
    PP.stages = read
    return steps
  }

  // ---------------------------------------------------------------- the balance of a plan

  // Gauss with partial pivoting on a square system (the rows are scaled first); null when it is singular
  function solve(A, b) {
    var n = A.length
    var M = []
    var i
    var j
    for (i = 0; i < n; i++) {
      var biggest = 0
      for (j = 0; j < n; j++) biggest = Math.max(biggest, Math.abs(A[i][j]))
      if (biggest === 0) return null
      var row = []
      for (j = 0; j < n; j++) row.push(A[i][j] / biggest)
      row.push(b[i] / biggest)
      M.push(row)
    }
    for (var c = 0; c < n; c++) {
      var p = c
      for (var r = c + 1; r < n; r++) {
        if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
      }
      if (Math.abs(M[p][c]) < 1e-12) return null
      var swap = M[c]
      M[c] = M[p]
      M[p] = swap
      for (var q = 0; q < n; q++) {
        if (q === c) continue
        var f = M[q][c] / M[c][c]
        if (f === 0) continue
        for (var k = c; k <= n; k++) M[q][k] -= f * M[c][k]
      }
    }
    var x = []
    for (i = 0; i < n; i++) x.push(M[i][n] / M[i][i])
    return x
  }

  // how often every stage runs, and what the whole chain takes and gives: { net, order, energy, sources } or { error }
  function compose(plan, steps) {
    var stages = []
    for (var i = 0; i < plan.stages.length; i++) {
      var id = 'gtceu:' + plan.stages[i]
      var s = steps[id]
      if (!s) return { error: 'no source recipe ' + id }
      if (s.error) return { error: id + ': ' + s.error }
      stages.push(s)
    }
    var keys = Object.keys(plan.given).concat(plan.linked)
    if (keys.length !== stages.length) return { error: keys.length + ' balance equations for ' + stages.length + ' stages' }
    var A = keys.map(function (key) { return stages.map(function (s) { return s.v[key] || 0 }) })
    var b = keys.map(function (key) { return -(plan.given[key] || 0) })
    var x = solve(A, b)
    if (x === null) return { error: 'the stages do not close (singular)' }

    var net = {}
    var gross = {}
    var order = []
    var energy = 0
    var sources = []
    for (var k = 0; k < stages.length; k++) {
      if (!(x[k] > -1e-9)) return { error: stages[k].id + ' would have to run ' + x[k] + ' times' }
      var scale = Math.max(0, x[k])
      sources.push({ id: stages[k].id, scale: scale })
      energy += scale * stages[k].eut * stages[k].duration
      Object.keys(stages[k].v).forEach(function (key) {
        if (net[key] === undefined) {
          net[key] = 0
          gross[key] = 0
          order.push(key)
        }
        net[key] += scale * stages[k].v[key]
        gross[key] += Math.abs(scale * stages[k].v[key])
      })
    }
    // the linked intermediates must net out and the given inputs must be used up entirely (to the rounding of the solver)
    for (var g = 0; g < plan.linked.length; g++) {
      var left = net[plan.linked[g]] || 0
      if (Math.abs(left) > 1e-7 * (gross[plan.linked[g]] || 0) + 1e-9) return { error: plan.linked[g] + ' does not net out (' + left + ')' }
    }
    var givenKeys = Object.keys(plan.given)
    for (var h = 0; h < givenKeys.length; h++) {
      var used = -(net[givenKeys[h]] || 0)
      if (Math.abs(used - plan.given[givenKeys[h]]) > 1e-7 * (gross[givenKeys[h]] || 0) + 1e-9) return { error: givenKeys[h] + ' is used ' + used + ', not ' + plan.given[givenKeys[h]] }
    }
    return { net: net, order: order, energy: energy, sources: sources }
  }

  // ---------------------------------------------------------------- from a balance to a recipe

  function rank(list, id) {
    var i = list.indexOf(id)
    return i < 0 ? list.length : i
  }

  function wholeAndChance(x) {
    var whole = Math.floor(x + 1e-9)
    var chance = Math.round((x - whole) * 10000)
    if (chance >= 10000) {
      whole++
      chance = 0
    }
    return { whole: whole, chance: Math.max(0, chance) }
  }

  // ceil(energy / MAX_EUT) ticks, ceil(energy / ticks) EU/t: the energy never drops and the surplus is under one EU/t over the ticks
  function costOf(energy) {
    var ticks = Math.max(1, Math.ceil(energy / MAX_EUT - 1e-9))
    var eut = Math.max(1, Math.ceil(energy / ticks - 1e-9))
    ticks = Math.max(1, Math.ceil(energy / eut - 1e-9))
    return { eut: eut, ticks: ticks }
  }

  function recipeOf(plan, composed) {
    var rec = {
      id: ID_PREFIX + plan.name, recipeId: 'grindless:' + TYPE_PATH + '/' + ID_PREFIX.substring('grindless:'.length) + plan.name,
      name: plan.name, mode: plan.mode, circuit: plan.circuit, sources: composed.sources, itemsIn: [], fluidsIn: [], itemsOut: [], fluidsOut: []
    }
    var outItems = []
    composed.order.forEach(function (key) {
      var x = composed.net[key]
      if (Math.abs(x) < EPS) return
      var isItem = key.indexOf('i:') === 0
      var id = key.substring(2)
      if (isItem && x < 0) {
        var need = -x
        if (Math.abs(need - Math.round(need)) < EPS) {
          rec.itemsIn.push({ id: id, count: Math.round(need), chance: 10000 })
        } else {
          // a fraction of an item: the whole stack, used up in `chance` of 10 000 runs (the expected use is what the chain needs)
          var count = Math.max(1, Math.ceil(need))
          rec.itemsIn.push({ id: id, count: count, chance: Math.round(need / count * 10000) })
        }
      } else if (isItem) {
        var wc = wholeAndChance(x)
        outItems.push({ id: id, whole: wc.whole, chance: wc.chance })
      } else if (x < 0) {
        rec.fluidsIn.push({ id: id, amount: Math.ceil(-x - 1e-6) })
      } else if (Math.round(x) > 0) {
        rec.fluidsOut.push({ id: id, amount: Math.round(x) })
      }
    })
    outItems.sort(function (a, b) { return rank(ITEM_ORDER, a.id) - rank(ITEM_ORDER, b.id) })
    rec.itemsOut = outItems.filter(function (o) { return o.whole > 0 || o.chance > 0 })
    rec.fluidsOut.sort(function (a, b) { return rank(FLUID_ORDER, a.id) - rank(FLUID_ORDER, b.id) })
    // what is used up for certain first, the chanced inputs after it, the electrode last
    rec.itemsIn.sort(function (a, b) { return (b.chance >= 10000 ? 1 : 0) - (a.chance >= 10000 ? 1 : 0) })
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
    var cost = costOf(composed.energy)
    rec.eut = cost.eut
    rec.duration = cost.ticks
    rec.energy = cost.eut * cost.ticks
    rec.sourceEnergy = Math.round(composed.energy * 1e6) / 1e6
    return { recipe: rec }
  }

  // ---------------------------------------------------------------- generating

  function generate(event) {
    PP.recipes = []
    PP.skipped = []
    var steps = gather(event)

    // a skipped plan means the plant lost a recipe (the loose line changed): a warning, so the log shows it
    function skip(name, reason) {
      PP.skipped.push({ name: name, reason: reason })
      console.warn(LOG + 'platinum plant skipped ' + name + ': ' + reason)
    }

    PLANS.forEach(function (plan) {
      var composed
      try {
        composed = compose(plan, steps)
      } catch (e) {
        composed = { error: String(e) }
      }
      if (composed.error) {
        skip(plan.name, composed.error)
        return
      }
      var made = recipeOf(plan, composed)
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
    console.info(LOG + 'pgm_refining recipes added: ' + PP.recipes.length + ' (' + attack + ' attack, ' +
      (PP.recipes.length - attack) + ' separation) from ' + PP.stages + ' stages; skipped ' + PP.skipped.length)
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
