// priority: -27724
// -----------------------------------------------------------------------------------------------
// Recipes of LuV's helium refrigerator (machine and recipe type: startup_scripts/grindless/luv/helium_refrigerator.js; docs/eras/luv.md,
// "1. Helium refrigerator"; package LuV-A3), generated at every server load from the live vacuum freezer recipes that take liquid
// helium, and the recipe that makes the controller.
//
// Why generated from the live recipes, not from a table built from a dump: the hot strip mill (ev/combined_cycle_and_hot_mill.js) already
// reads the freezer's recipes this way, from their JSON in ServerEvents.recipes, and that route is proven on the bench. It needs neither
// RecipeHelper nor FluidIngredient#getStacks (unreachable from Rhino), it follows every addon and every script that changes a freezer
// recipe, and a stale table can never disagree with the pack. The figures that are ours (make-up, precooling, charge, the liquefaction
// rate's source and the precooling factor) live in data/grindless/tables/helium_refrigerator.json.
//
// Priority -200: like the hot strip mill, after the scripts that change the recipe set (integration/hidden.js, at -100, removes the
// junk recipes), so a removed freezer recipe gets no refrigerator recipe either. The dump (gg_dump.js, -100000) runs after it.
//
// gtceu:closed_loop_cooling, one recipe per source recipe of the table's source.type (gtceu:vacuum_freezer) whose fluid inputs hold
// exactly one whole content of the coolant (liquid helium, by id or by its forge: tag):
//   in         the source's hot ingot (GTM's cool_hot_<m>_ingot), or its molten metal and the ingot mold, not consumed (the casting
//              recipes, vacuum_freezer/<m>), as the source has them
//              + makeUp (25 mB of liquid helium) + precool.in (50 mB of liquid nitrogen)
//              + the charge (4,000 mB of liquid helium, GTM's notConsumableFluid: needed to start, never drained; with the make-up it
//              is one lookup key, see the startup script)
//   out        the source's ingot + precool.out (50 mB of nitrogen). The helium gas the source gives back stays in the loop.
//   energy     the source's EU/t x duration + (source coolant - makeUp) mB re-liquefied, at the live gtceu:vacuum_freezer/liquid_helium
//              recipe's EU per mB (GTM 7.5.3: 1,920 EU/t x 240 t per 1,000 mB = 460.8) x the precooling factor (0.5), spent at
//              max(source EU/t, minEUt = 1,920): duration = ceil(energy / EU/t). Naquadah alloy: 7,680 x 300 + 475 x 230.4 =
//              2,413,440 EU -> 7,680 EU/t x 315 t.
//   data       grindless_closed_loop = the source recipe's id (the EMI line)
//   id         grindless:closed_loop_cooling/<the source's path without vacuum_freezer/> (another namespace than gtceu and grindless goes
//              in front: <namespace>_<path>)
//   Lookup: each recipe has its own hot ingot or molten metal, so there is one recipe per lookup path; the shared keys (liquid helium,
//   liquid nitrogen, the mold) never make one recipe's keys a subset of another's.
//   Skipped (logged): a source with conditions, chanced or extra contents, more than one product, or outputs other than the ingot and
//   the returned helium.
//
// Controller (crafting table, luv.md "Controller"): LuV hull + 2 LuV electric pumps + 2 LuV electric motors (the expanders) + 4 LuV
// circuits, grindless:assembly_line/helium_refrigerator.
//
// Destinations: the nitrogen goes back to the EV cryogenic plant or into the air (voidable); the helium never leaves.
//
// Published for the smoke test: global.grindless.heliumRefrigerator.recipes [{ id, recipeId, name, source, kind: 'hot' | 'molten',
// hot: { tag | item }, molten: { tag | id, amount }, mold, output: { id, count }, coolant, circulating, sourceEnergy, reliquefaction,
// energy, eut, duration }], .skipped [{ source, reason }], .rate { euPerMb, from }, .craftingRecipe, .craftingParts.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/luv] '
  var G = global.grindless || (global.grindless = {})
  var HR = G.heliumRefrigerator || (G.heliumRefrigerator = {})

  var TYPE_PATH = 'closed_loop_cooling'
  var DATA_KEY = HR.dataKey || 'grindless_closed_loop'

  var CONTROLLER = 'gtceu:helium_refrigerator'
  var HULL = 'gtceu:luv_machine_hull'
  var PUMP = 'gtceu:luv_electric_pump'
  var MOTOR = 'gtceu:luv_electric_motor'
  var CONTROLLER_PARTS = [CONTROLLER, HULL, PUMP, MOTOR]
  HR.craftingRecipe = 'grindless:assembly_line/helium_refrigerator'
  HR.craftingParts = CONTROLLER_PARTS

  // the startup script's table (startup_scripts/grindless/luv/helium_refrigerator.js), or GTM 7.5.3's defaults
  function config() {
    if (HR.config) return HR.config
    return {
      source: { type: 'gtceu:vacuum_freezer', coolant: 'gtceu:liquid_helium', returned: 'gtceu:helium' },
      makeUp: { id: 'gtceu:liquid_helium', amount: 25 },
      precoolIn: { id: 'gtceu:liquid_nitrogen', amount: 50 },
      precoolOut: { id: 'gtceu:nitrogen', amount: 50 },
      charge: { id: 'gtceu:liquid_helium', amount: 4000 },
      reliquefaction: { recipe: 'gtceu:vacuum_freezer/liquid_helium', fallbackEuPerMb: 460.8, precoolFactor: 0.5 },
      minEUt: 1920
    }
  }

  // RecipeJS.toString() is "<id>[<type>]" (the type object cannot be read from scripts)
  var ID_TYPE = /^(.*)\[([^\[\]]*)\]$/

  function pathOf(id) {
    return id.substring(id.indexOf(':') + 1)
  }

  // the recipe's JSON; a recipe a script changed is serialized first (KubeJS only writes script changes into .json when it is built)
  function jsonOf(r) {
    if (typeof r.hasChanged === 'function' && r.hasChanged()) r.serialize()
    if (r.json === null || r.json === undefined) return null
    return JSON.parse(String(r.json))
  }

  function countOf(map) {
    if (!map) return 0
    var n = 0
    Object.keys(map).forEach(function (k) { n += (map[k] || []).length })
    return n
  }

  // a fully used input or a sure output: no chance field, or chance = maxChance
  function isWhole(entry) {
    if (entry.chance === undefined) return true
    var max = entry.maxChance !== undefined ? Number(entry.maxChance) : 10000
    return Number(entry.chance) >= max
  }

  // EU/t of one side: a plain number is voltage x 1 A, { voltage, amperage } is both
  function euOf(j, side) {
    var list = j[side] && j[side].eu
    if (!list || list.length !== 1) return null
    var c = list[0].content
    if (typeof c === 'number') return c
    if (c && c.voltage !== undefined) return Number(c.voltage) * Number(c.amperage || 1)
    return null
  }

  // { type: 'gtceu:sized', count, ingredient: { item | tag } } | { item | tag } -> { item | tag, count } or null
  function itemOf(content) {
    if (!content) return null
    var count = Number(content.count || 1)
    var source = content.ingredient ? content.ingredient : content
    if (source.type !== undefined && source.type !== 'gtceu:sized') return null
    if (source.item) return { item: String(source.item), count: count }
    if (source.tag) return { tag: String(source.tag), count: count }
    return null
  }

  // { amount, value: [{ fluid } | { tag }] } -> { id | tag, amount } or null
  function fluidOf(content) {
    if (!content || !content.value || content.value.length !== 1 || content.nbt !== undefined) return null
    var v = content.value[0]
    var amount = Number(content.amount)
    if (!(amount > 0)) return null
    if (v.fluid) return { id: String(v.fluid), amount: amount }
    if (v.tag) return { tag: String(v.tag), amount: amount }
    return null
  }

  // a fluid content is the fluid `id` itself or GTM's forge: tag of it (gtceu:liquid_helium <-> forge:liquid_helium)
  function isFluid(f, id) {
    if (f === null) return false
    if (f.id) return f.id === id
    return f.tag === 'forge:' + pathOf(id)
  }

  // the live liquefaction rate: EU per mB of liquid helium made by the reliquefaction recipe (GTM's vacuum_freezer/liquid_helium)
  function rateOf(event, cfg) {
    var rel = cfg.reliquefaction
    try {
      var read = G.compose.gather(event, [rel.recipe])
      var s = read.steps[rel.recipe]
      if (s && !s.error) {
        var made = s.v['f:' + cfg.source.coolant]
        if (made > 0) return { euPerMb: s.eut * s.duration / made, from: rel.recipe }
      }
      console.error(LOG + 'helium refrigerator: cannot read ' + rel.recipe + (s && s.error ? ' (' + s.error + ')' : '') +
        '; using the table\'s ' + rel.fallbackEuPerMb + ' EU per mB')
    } catch (e) {
      console.error(LOG + 'helium refrigerator: reading ' + rel.recipe + ' failed: ' + e + '; using the table\'s rate')
    }
    return { euPerMb: rel.fallbackEuPerMb, from: 'table' }
  }

  // a source freezer recipe -> its parts, or throws with the reason it is not taken
  function readSource(id, j, cfg) {
    if (j.recipeConditions && j.recipeConditions.length > 0) throw new Error('it has conditions')
    var inputs = j.inputs || {}
    var outputs = j.outputs || {}
    var otherIn = Object.keys(inputs).filter(function (k) { return k !== 'item' && k !== 'fluid' })
    var otherOut = Object.keys(outputs).filter(function (k) { return k !== 'item' && k !== 'fluid' })
    if (otherIn.length > 0 || otherOut.length > 0) throw new Error('unsupported contents ' + otherIn.concat(otherOut).join(','))
    if (countOf(j.tickOutputs) > 0 || countOf(j.tickInputs) !== 1) throw new Error('it uses or makes more than EU')
    var eut = euOf(j, 'tickInputs')
    var duration = Number(j.duration)
    if (!(eut > 0) || !(duration > 0)) throw new Error('unreadable energy')

    var coolant = null
    var molten = null
    ;(inputs.fluid || []).forEach(function (e) {
      var f = fluidOf(e.content)
      if (f === null || !isWhole(e)) throw new Error('unreadable or chanced fluid input ' + JSON.stringify(e.content))
      if (isFluid(f, cfg.source.coolant)) {
        if (coolant !== null) throw new Error('two coolant inputs')
        coolant = f
      } else {
        if (molten !== null) throw new Error('more than one fluid besides the coolant')
        molten = f
      }
    })
    if (coolant === null) throw new Error('no coolant')
    if (!(coolant.amount > cfg.makeUp.amount)) throw new Error('the coolant (' + coolant.amount + ' mB) is not more than the make-up')

    var items = inputs.item || []
    if (items.length !== 1) throw new Error(items.length + ' item inputs')
    var item = itemOf(items[0].content)
    if (item === null || item.count !== 1) throw new Error('unreadable item input ' + JSON.stringify(items[0].content))
    var kind
    if (items[0].chance === 0) {
      if (molten === null) throw new Error('a catalyst item and no molten metal')
      kind = 'molten'
    } else if (isWhole(items[0])) {
      if (molten !== null) throw new Error('a hot ingot and a molten metal')
      kind = 'hot'
    } else {
      throw new Error('a chanced item input')
    }

    var outs = outputs.item || []
    if (outs.length !== 1 || !isWhole(outs[0])) throw new Error('it makes more than one sure product')
    var out = itemOf(outs[0].content)
    if (out === null || !out.item) throw new Error('unreadable product ' + JSON.stringify(outs[0].content))
    ;(outputs.fluid || []).forEach(function (e) {
      if (!isFluid(fluidOf(e.content), cfg.source.returned)) throw new Error('a fluid output other than the returned helium')
    })

    delete item.count
    return {
      kind: kind,
      hot: kind === 'hot' ? item : null,
      mold: kind === 'molten' ? item : null,
      molten: molten,
      output: { id: out.item, count: out.count },
      coolant: coolant.amount,
      eut: eut,
      duration: duration
    }
  }

  function plan(id, src, cfg, rate) {
    var circulating = src.coolant - cfg.makeUp.amount
    var sourceEnergy = src.eut * src.duration
    var reliquefaction = circulating * rate.euPerMb * cfg.reliquefaction.precoolFactor
    var energy = sourceEnergy + reliquefaction
    var eut = Math.max(src.eut, cfg.minEUt)
    var duration = Math.ceil(energy / eut - 1e-9)
    var ns = id.substring(0, id.indexOf(':'))
    var name = (ns === 'gtceu' || ns === 'grindless' ? '' : ns + '_') + pathOf(id).replace(/^vacuum_freezer\//, '').replace(/[^a-z0-9_]/g, '_')
    return {
      id: 'grindless:' + name,
      recipeId: 'grindless:' + TYPE_PATH + '/' + name,
      name: name,
      source: id,
      kind: src.kind,
      hot: src.hot,
      mold: src.mold,
      molten: src.molten,
      output: src.output,
      coolant: src.coolant,
      circulating: circulating,
      sourceEnergy: sourceEnergy,
      reliquefaction: reliquefaction,
      energy: eut * duration,
      eut: eut,
      duration: duration
    }
  }

  function add(event, p, cfg) {
    var b = event.recipes.gtceu.closed_loop_cooling(p.id)
    if (p.kind === 'hot') {
      b.itemInputs(p.hot.tag ? '1x #' + p.hot.tag : '1x ' + p.hot.item)
    } else {
      b.notConsumable(p.mold.tag ? '1x #' + p.mold.tag : '1x ' + p.mold.item)
      if (p.molten.tag) b.inputFluids('#' + p.molten.tag + ' ' + p.molten.amount)
      else b.inputFluids(Fluid.of(p.molten.id, p.molten.amount))
    }
    b.inputFluids(Fluid.of(cfg.makeUp.id, cfg.makeUp.amount))
    b.inputFluids(Fluid.of(cfg.precoolIn.id, cfg.precoolIn.amount))
    b.notConsumableFluid(Fluid.of(cfg.charge.id, cfg.charge.amount))
    b.itemOutputs(p.output.count + 'x ' + p.output.id)
    b.outputFluids(Fluid.of(cfg.precoolOut.id, cfg.precoolOut.amount))
    b.addDataString(DATA_KEY, p.source)
    b.EUt(p.eut).duration(p.duration)
  }

  function generate(event) {
    var cfg = config()
    HR.recipes = []
    HR.skipped = []
    var missing = [cfg.makeUp.id, cfg.precoolIn.id, cfg.precoolOut.id, cfg.charge.id].filter(function (id) { return !Fluid.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'closed_loop_cooling recipes skipped, unknown fluid(s): ' + missing.join(', '))
      return
    }
    var rate = rateOf(event, cfg)
    HR.rate = rate
    var names = {}
    var seen = 0
    event.originalRecipes.values().forEach(function (r) {
      if (r.removed) return
      var m = ID_TYPE.exec(String(r))
      if (!m || m[2] !== cfg.source.type) return
      var id = m[1]
      var j = null
      try {
        j = jsonOf(r)
      } catch (e) {
        j = null
      }
      if (j === null) return
      // only the recipes that take the coolant
      var takesCoolant = ((j.inputs && j.inputs.fluid) || []).some(function (e) { return isFluid(fluidOf(e.content), cfg.source.coolant) })
      if (!takesCoolant) return
      seen++
      try {
        var p = plan(id, readSource(id, j, cfg), cfg, rate)
        if (names[p.name] !== undefined) throw new Error('its name ' + p.name + ' is taken by ' + names[p.name])
        if (!Item.exists(p.output.id)) throw new Error('unknown product ' + p.output.id)
        add(event, p, cfg)
        names[p.name] = id
        HR.recipes.push(p)
      } catch (e2) {
        HR.skipped.push({ source: id, reason: String(e2.message || e2) })
      }
    })
    var kinds = { hot: 0, molten: 0 }
    HR.recipes.forEach(function (p) { kinds[p.kind]++ })
    console.info(LOG + 'closed_loop_cooling recipes added: ' + HR.recipes.length + ' (' + kinds.hot + ' hot ingots, ' + kinds.molten +
      ' molten metals) from ' + seen + ' ' + cfg.source.type + ' recipes that take ' + cfg.source.coolant + '; liquefaction ' +
      rate.euPerMb + ' EU/mB (' + rate.from + ')' + (HR.skipped.length > 0 ? '; not taken: ' +
      HR.skipped.map(function (s) { return s.source + ' (' + s.reason + ')' }).join(', ') : ''))
  }

  // ---------------------------------------------------------------- crafting

  function addController(event) {
    var missing = CONTROLLER_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'helium refrigerator controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembly_line('grindless:helium_refrigerator')
      .itemInputs(HULL, '2x ' + MOTOR, '2x ' + PUMP, '4x #gtceu:circuits/luv', '2x grindless:platinum_gauze', '2x grindless:hermean_heat_shield_brick')
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 576), Fluid.of('gtceu:lubricant', 500))
      .itemOutputs(CONTROLLER)
      .EUt(30720).duration(600)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'closed_loop_cooling recipe generation failed: ' + e)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'helium refrigerator controller recipe failed: ' + e2)
    }
  })
})()
