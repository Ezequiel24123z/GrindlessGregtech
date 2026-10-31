// priority: -27624
// -----------------------------------------------------------------------------------------------
// Recipes of the EV Combined-Cycle Plant (gtceu:combined_cycle_plant, type gtceu:combined_cycle) and Hot Strip Mill (gtceu:hot_strip_mill,
// type gtceu:hot_rolling), generated at server load from the live recipes they stand in for, and the recipes of both controllers. The
// machines are in startup_scripts/grindless/ev/combined_cycle_and_hot_mill.js.
//
// Priority -200: this handler runs after the scripts that change the recipes it reads (power/generators.js rebuilds every gas turbine
// recipe at twice its duration; integration/hidden.js, at -100, removes the junk recipes), so it reads the FINAL recipe set: the datapack
// recipes no script removed, plus the ones scripts added (serialized first: KubeJS only writes script changes into .json when the recipe
// is built). The dump (gg_dump.js, -100000) still runs after it.
//
// COMBINED CYCLE (gtceu:combined_cycle), one recipe per live gas turbine fuel (gtceu:gas_turbine):
//   fuel in        the gas turbine recipe's own fluid ingredient and amount
//   EU/t, ticks    the gas turbine recipe's own (it makes 32 EU/t; its duration is already doubled by power/generators.js), so the plant
//                  gives exactly the gas turbine's EU per mB of fuel
//   steam out      round(0.4 x the run's EU) mB: 40 % more energy at the pack's 1 EU per mB of steam (GTM's steam turbine, doubled: 640 mB
//                  of steam give 640 EU), more with a good rotor in a large steam turbine
//   water in       ceil(steam / 160) mB of distilled water: GTM's 160 mB of steam per mB of water (steamPerWater, left at GTM's value);
//                  the rounding up is the boiler's blowdown, so no run makes water
//   conditions     the site rules (ev.md; power/generators.js and data/grindless/tables/site_fuels.json): a fuel burns in the plant where
//                  it burns in the gas turbine. A fuel that needs air gets one dimension condition per dimension with air, an allowlist
//                  (GTM ORs the dimension conditions of one recipe, DimensionCondition.isOr, so reversed ones cannot say "not the Moon and
//                  not Mars"), so it is dead on the Moon, on Mars and in orbit. A fuel that carries its own oxidizer (methalox, the
//                  rocket fuels: the table's burnAnywhere) gets none and burns anywhere, in the plant too. In order:
//                    - the gas turbine recipe has dimension conditions: they are copied as they are (generators.js put them there, or the
//                      recipe was placed on purpose);
//                    - it has none and the fuel is in burnAnywhere: none;
//                    - it has none otherwise (a fuel some script added after generators.js without them): global.grindless.power.
//                      burnsInAir(builder), the same allowlist.
//                  A gas turbine recipe with any other kind of condition is not taken
//   id             grindless:combined_cycle/ev/<the gas turbine recipe's path> (another namespace than gtceu and grindless goes in front:
//                  <namespace>_<path>)
//   Example: methane, 2 mB per run, 32 EU/t for 14 ticks (448 EU, 224 EU per mB like the gas turbine) + 2 mB of distilled water ->
//   179 mB of steam, only where there is air.
//
// HOT ROLLING (gtceu:hot_rolling), from every vacuum freezer recipe cool_hot_<material>_ingot that asks only for EU (the ones that also
// need liquid helium, 5 000 K and up, keep the freezer) whose hot ingot an electric blast furnace makes (addon materials whose hot ingot
// nothing makes get no recipe). The programmed circuit picks the product, at the bender's and extruder's ratios:
//   circuit 1  plate   bender bend_<m>_to_plate (or, for materials that cannot be bent, extruder extrude_<m>_to_plate)    1 ingot -> 1 plate
//   circuit 2  rods    extruder extrude_<m>_to_rod                                                                       1 ingot -> 2 rods
//   circuit 3  foil    bender bend_<m>_ingot_to_foil (or extruder extrude_<m>_ingot_to_foil)                             1 ingot -> 4 foil
//   input      the freezer's own hot ingot ingredient (forge:hot_ingots/<m>)
//   energy     the freezer's EU + the bender's (or extruder's) EU, no discount: max of the two EU/t, for ceil(energy / EU/t) ticks
//   steam      2 mB per kelvin of the blast temperature (the lowest temperature an EBF recipe of that hot ingot asks for), in whole
//              160 mB (1 mB of water each): titanium (1 941 K) gives 3 840 mB of steam for 24 mB of water. Never more steam (at 1 EU per
//              mB) than the run's own EU, so the mill alone can never make energy; the blast furnace spent far more on that ingot
//   water in   steam / 160 mB of water
//   id         grindless:hot_rolling/ev/<material>_<plate | rods | foil>
//
// Controllers (crafting table, docs/eras/ev.md):
//   Combined-Cycle Plant   EV hull + Large Gas Turbine controller + 2 EV electric pumps + 4 EV circuits  grindless:crafting/combined_cycle_plant
//   Hot Strip Mill         EV hull + EV bender + Vacuum Freezer controller + 2 EV electric pumps + 4 EV circuits  grindless:crafting/hot_strip_mill
//
// Destinations of the byproducts: the steam of both goes to a (large) steam turbine, or the machine stops; the blowdown water is gone.
//
// Published for the smoke test:
//   global.grindless.combinedCycle.recipes  [{ id, source, fuel: { tag | fluid, amount }, eut, duration, energy, steam, water,
//                                              site: 'copied' | 'anywhere' | 'air' | 'unknown', dims: [{ dimension, reverse }] }]
//                                  .skipped  [{ source, reason }]   .craftingRecipe, .craftingParts
//   global.grindless.hotStripMill.recipes   [{ id, material, product, circuit, hot: { tag | item }, temperature, output: { id, count },
//                                              freezer: { id, eut, duration }, shaping: { id, eut, duration }, energy, eut, duration,
//                                              steam, water }]
//                                  .skipped  [{ material, reason }]  .materials  .craftingRecipe, .craftingParts
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  const G = global.grindless || (global.grindless = {})
  const CC = G.combinedCycle || (G.combinedCycle = {})
  const HM = G.hotStripMill || (G.hotStripMill = {})

  const LOG = '[grindless/ev] '
  const ID_PREFIX = 'grindless:ev/'

  const STEAM = 'gtceu:steam'
  const DISTILLED_WATER = 'gtceu:distilled_water'
  const WATER = 'minecraft:water'
  const STEAM_SHARE = 0.4
  const STEAM_PER_WATER = 160
  const STEAM_PER_KELVIN = 2

  const GAS_TURBINE = 'gtceu:gas_turbine'
  const FREEZER = 'gtceu:vacuum_freezer'
  const BENDER = 'gtceu:bender'
  const EXTRUDER = 'gtceu:extruder'
  const EBF = 'gtceu:electric_blast_furnace'

  // the products of the mill: circuit and the recipe paths (first one found wins) they come from; % is the material
  const PRODUCTS = [
    { name: 'plate', circuit: 1, sources: ['bender/bend_%_to_plate', 'extruder/extrude_%_to_plate'] },
    { name: 'rods', circuit: 2, sources: ['extruder/extrude_%_to_rod'] },
    { name: 'foil', circuit: 3, sources: ['bender/bend_%_ingot_to_foil', 'extruder/extrude_%_ingot_to_foil'] }
  ]
  // MAX-B1 (docs/eras/max.md, L34): the cathode copper is hot rolled into the growth foil blank; circuit 14 is the first free of the mill (OpV's be_window_foil holds 13)
  const MAX_B1_ROWS = [
    { name: 'cathode_copper_foil', input: 'grindless:cathode_copper', output: 'grindless:rolled_cu_foil', count: 4, circuit: 14, water: 4,
      eut: 1966080, duration: 400 }
  ]
  HM.extraRows = []
  const FREEZER_PATH = /^vacuum_freezer\/cool_hot_(.+)_ingot$/
  const SHAPING_PATH = /^(bender\/bend_.+_(to_plate|ingot_to_foil)|extruder\/extrude_.+_(to_plate|to_rod|ingot_to_foil))$/

  const PLANT_PARTS = ['gtceu:combined_cycle_plant', 'gtceu:ev_machine_hull', 'gtceu:gas_large_turbine', 'gtceu:ev_electric_pump', 'grindless:night_sky_radiator', 'grindless:platinum_electrode']
  const MILL_PARTS = ['gtceu:hot_strip_mill', 'gtceu:ev_machine_hull', 'gtceu:ev_bender', 'gtceu:vacuum_freezer', 'gtceu:ev_electric_pump', 'grindless:night_sky_radiator', 'grindless:graphite_electrode']
  CC.craftingRecipe = 'grindless:assembler/combined_cycle_plant'
  CC.craftingParts = PLANT_PARTS
  HM.craftingRecipe = 'grindless:assembler/hot_strip_mill'
  HM.craftingParts = MILL_PARTS
  CC.steamShare = STEAM_SHARE
  CC.steamPerWater = STEAM_PER_WATER
  HM.steamPerKelvin = STEAM_PER_KELVIN
  HM.steamPerWater = STEAM_PER_WATER

  // ---------------------------------------------------------------- reading the final recipe set

  // RecipeJS.toString() is "<id>[<type>]" (the type object cannot be read from scripts)
  const ID_TYPE = /^(.*)\[([^\[\]]*)\]$/

  function pathOf(id) {
    return id.substring(id.indexOf(':') + 1)
  }

  // the recipes of the types below that are still in the set, by type: [{ id, recipe }]. JSON is read later, only where needed
  function gather(event) {
    var wanted = {}
    ;[GAS_TURBINE, FREEZER, BENDER, EXTRUDER, EBF].forEach(function (t) { wanted[t] = [] })
    function take(r, added) {
      if (r.removed) return
      var m = ID_TYPE.exec(String(r))
      if (!m || !wanted[m[2]]) return
      wanted[m[2]].push({ id: m[1], recipe: r, added: added })
    }
    event.originalRecipes.values().forEach(function (r) { take(r, false) })
    event.addedRecipes.forEach(function (r) { take(r, true) })
    return wanted
  }

  function jsonOf(entry) {
    if (entry.json !== undefined) return entry.json
    var r = entry.recipe
    entry.json = null
    try {
      if (entry.added || r.hasChanged()) r.serialize()
      if (r.json !== null && r.json !== undefined) entry.json = JSON.parse(String(r.json))
    } catch (e) {
      entry.error = String(e)
    }
    return entry.json
  }

  // EU/t of a recipe on one side ('tickInputs' or 'tickOutputs'): a plain number is voltage x 1 A, { voltage, amperage } is both
  function euOf(j, side) {
    var list = j[side] && j[side].eu
    if (!list || list.length !== 1) return null
    var c = list[0].content
    if (typeof c === 'number') return c
    if (c && c.voltage !== undefined) return Number(c.voltage) * Number(c.amperage || 1)
    return null
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

  // { amount, value: [{ fluid } | { tag }] } -> { fluid | tag, amount } or null
  function fluidOf(content) {
    if (!content || !content.value || content.value.length !== 1) return null
    var v = content.value[0]
    var amount = Number(content.amount)
    if (!(amount > 0)) return null
    if (v.fluid) return { fluid: String(v.fluid), amount: amount }
    if (v.tag) return { tag: String(v.tag), amount: amount }
    return null
  }

  // ---------------------------------------------------------------- combined cycle

  // the dimension conditions of a gas turbine recipe, as they are: [{ dimension, reverse }]; throws on any other kind of condition
  function dimensionConditions(j) {
    var dims = []
    ;(j.recipeConditions || []).forEach(function (c) {
      if ((c.type === 'dimension' || c.type === 'gtceu:dimension') && c.dimension) {
        dims.push({ dimension: String(c.dimension), reverse: c.reverse === true })
      } else {
        throw new Error('condition ' + JSON.stringify(c))
      }
    })
    return dims
  }

  // the site table of power/generators.js (global.grindless.power.site), or null without one
  function siteTable() {
    var power = G.power
    if (!power || !power.site || power.site.loaded !== true || typeof power.burnsInAir !== 'function') return null
    return power.site
  }

  // the fuel carries its own oxidizer (the table's burnAnywhere: a fluid, matched by id or by its forge: tag, as generators.js does)
  function burnsAnywhere(site, fuel) {
    return (site.burnAnywhere || []).some(function (f) {
      var id = String(f.fluid)
      return fuel.fluid === id || fuel.tag === 'forge:' + id.substring(id.indexOf(':') + 1)
    })
  }

  // where the fuel burns: the source's dimension conditions, none (burns anywhere) or the air allowlist (see the header)
  function siteOf(j, fuel) {
    var dims = dimensionConditions(j)
    if (dims.length > 0) return { site: 'copied', dims: dims }
    var site = siteTable()
    if (site === null) return { site: 'unknown', dims: [] }
    if (burnsAnywhere(site, fuel)) return { site: 'anywhere', dims: [] }
    return { site: 'air', dims: site.airDimensions.map(function (d) { return { dimension: String(d), reverse: false } }) }
  }

  function planCombinedCycle(id, j) {
    var inputs = j.inputs || {}
    var fuels = inputs.fluid || []
    if (fuels.length !== 1) throw new Error(fuels.length + ' fluid inputs')
    if (countOf(inputs) !== 1) throw new Error('inputs other than one fluid')
    if (countOf(j.outputs) > 0) throw new Error('it has outputs')
    if (countOf(j.tickInputs) > 0) throw new Error('it uses something per tick')
    if (countOf(j.tickOutputs) !== 1) throw new Error('it makes more than EU per tick')
    if (!isWhole(fuels[0])) throw new Error('a chanced fuel')
    var fuel = fluidOf(fuels[0].content)
    if (fuel === null) throw new Error('unreadable fuel ' + JSON.stringify(fuels[0].content))
    var eut = euOf(j, 'tickOutputs')
    if (!(eut > 0)) throw new Error('no EU out')
    var duration = Number(j.duration)
    if (!(duration > 0)) throw new Error('no duration')
    var where = siteOf(j, fuel)
    var energy = eut * duration
    var steam = Math.round(STEAM_SHARE * energy)
    if (steam < 1) throw new Error('too little energy per run for steam')
    var ns = id.substring(0, id.indexOf(':'))
    var name = (ns === 'gtceu' || ns === 'grindless' ? '' : ns + '_') + pathOf(id).replace(/^gas_turbine\//, '').replace(/[^a-z0-9_]/g, '_')
    return {
      id: 'grindless:combined_cycle/ev/' + name,
      builderId: ID_PREFIX + name,
      source: id,
      fuel: fuel,
      eut: eut,
      duration: duration,
      energy: energy,
      steam: steam,
      water: Math.ceil(steam / STEAM_PER_WATER),
      site: where.site,
      dims: where.dims
    }
  }

  function addCombinedCycle(event, sets) {
    var plans = []
    var skipped = []
    var ids = {}
    sets[GAS_TURBINE].forEach(function (entry) {
      var j = jsonOf(entry)
      if (j === null) {
        skipped.push({ source: entry.id, reason: 'unreadable recipe' + (entry.error ? ': ' + entry.error : '') })
        return
      }
      try {
        var p = planCombinedCycle(entry.id, j)
        if (ids[p.id] !== undefined) throw new Error('its id ' + p.id + ' is taken by ' + ids[p.id])
        ids[p.id] = entry.id
        plans.push(p)
      } catch (e) {
        skipped.push({ source: entry.id, reason: String(e.message || e) })
      }
    })
    var missing = [STEAM, DISTILLED_WATER].filter(function (id) { return !Fluid.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'combined-cycle recipes skipped, unknown fluid(s): ' + missing.join(', '))
      return
    }
    var added = []
    plans.forEach(function (p) {
      var b = event.recipes.gtceu.combined_cycle(p.builderId)
      if (p.fuel.tag) b.inputFluids('#' + p.fuel.tag + ' ' + p.fuel.amount)
      else b.inputFluids(Fluid.of(p.fuel.fluid, p.fuel.amount))
      b.inputFluids(Fluid.of(DISTILLED_WATER, p.water))
      b.outputFluids(Fluid.of(STEAM, p.steam))
      if (p.site === 'air') G.power.burnsInAir(b)
      else p.dims.forEach(function (d) { b.dimension(d.dimension, d.reverse) })
      b.EUt(-p.eut).duration(p.duration)
      added.push(p)
    })
    CC.recipes = added
    CC.skipped = skipped
    var sites = {}
    added.forEach(function (p) { sites[p.site] = (sites[p.site] || 0) + 1 })
    console.info(LOG + 'combined_cycle recipes added: ' + added.length + ' from ' + sets[GAS_TURBINE].length + ' gas turbine recipes, sites ' +
      JSON.stringify(sites) + (skipped.length > 0 ? '; not taken: ' + skipped.map(function (s) { return s.source + ' (' + s.reason + ')' }).join(', ') : ''))
    // without the site table every fuel would burn on the Moon and Mars: that is a broken pack, not a choice
    if (sites.unknown > 0) console.error(LOG + 'no site table (global.grindless.power.site): ' + sites.unknown + ' combined_cycle fuels burn anywhere')
  }

  // ---------------------------------------------------------------- hot rolling

  // item id -> the lowest blast temperature of the EBF recipes that make it
  function blastTemperatures(sets) {
    var temps = {}
    sets[EBF].forEach(function (entry) {
      var j = jsonOf(entry)
      if (j === null || !j.data || typeof j.data.ebf_temp !== 'number') return
      var t = j.data.ebf_temp
      ;((j.outputs && j.outputs.item) || []).forEach(function (o) {
        var it = itemOf(o.content)
        if (it === null || !it.item) return
        if (temps[it.item] === undefined || t < temps[it.item]) temps[it.item] = t
      })
    })
    return temps
  }

  // the items of the hot ingot ingredient: the item, or the items of the tag (GTM's forge:hot_ingots/<m> holds gtceu:hot_<m>_ingot)
  function hotItems(hot) {
    if (hot.item) return [hot.item]
    var out = []
    try {
      Ingredient.of('#' + hot.tag).getItemIds().forEach(function (id) { out.push(String(id)) })
    } catch (e) {
      out = []
    }
    var m = /hot_ingots\/(.+)$/.exec(hot.tag)
    if (out.length === 0 && m && Item.exists('gtceu:hot_' + m[1] + '_ingot')) out.push('gtceu:hot_' + m[1] + '_ingot')
    return out
  }

  // the freezer's hot ingot -> ingot recipe, if it asks only for EU: { id, eut, duration, energy, hot: { tag | item } }
  function readFreezer(id, j) {
    if (j.recipeConditions && j.recipeConditions.length > 0) throw new Error('the freezer recipe has conditions')
    var inputs = j.inputs || {}
    if (inputs.fluid && inputs.fluid.length > 0) throw new Error('the freezer needs a coolant (liquid helium)')
    var items = inputs.item || []
    if (items.length !== 1 || countOf(inputs) !== 1 || !isWhole(items[0])) throw new Error('the freezer recipe takes more than the hot ingot')
    var hot = itemOf(items[0].content)
    if (hot === null || hot.count !== 1) throw new Error('unreadable hot ingot ' + JSON.stringify(items[0].content))
    if (countOf(j.outputs) !== 1 || !j.outputs.item) throw new Error('the freezer recipe makes more than the ingot')
    if (countOf(j.tickOutputs) > 0 || countOf(j.tickInputs) !== 1) throw new Error('the freezer recipe uses more than EU')
    var eut = euOf(j, 'tickInputs')
    var duration = Number(j.duration)
    if (!(eut > 0) || !(duration > 0)) throw new Error('unreadable freezer energy')
    delete hot.count
    return { id: id, eut: eut, duration: duration, energy: eut * duration, hot: hot }
  }

  // a bender or extruder recipe ingot -> product: { id, eut, duration, energy, output: { id, count } }. The programmed circuit and the
  // extruder's mold (not used up) are left out; the ingot must be the only thing used up
  function readShaping(id, j) {
    if (j.recipeConditions && j.recipeConditions.length > 0) throw new Error(id + ' has conditions')
    var used = ((j.inputs && j.inputs.item) || []).filter(function (e) {
      if (e.content && e.content.type === 'gtceu:circuit') return false
      if (e.chance !== undefined && Number(e.chance) === 0) return false
      return true
    })
    if (used.length !== 1 || countOf(j.inputs) !== ((j.inputs && j.inputs.item) || []).length) throw new Error(id + ' uses more than the ingot')
    var ingot = itemOf(used[0].content)
    if (ingot === null || ingot.count !== 1 || !isWhole(used[0])) throw new Error(id + ' does not take one ingot')
    var outs = (j.outputs && j.outputs.item) || []
    if (outs.length !== 1 || countOf(j.outputs) !== 1 || !isWhole(outs[0])) throw new Error(id + ' makes more than one product')
    var out = itemOf(outs[0].content)
    if (out === null || !out.item) throw new Error(id + ' has an unreadable product')
    if (countOf(j.tickOutputs) > 0 || countOf(j.tickInputs) !== 1) throw new Error(id + ' uses more than EU')
    var eut = euOf(j, 'tickInputs')
    var duration = Number(j.duration)
    if (!(eut > 0) || !(duration > 0)) throw new Error(id + ' has unreadable energy')
    return { id: id, eut: eut, duration: duration, energy: eut * duration, output: { id: out.item, count: out.count } }
  }

  function planHotRolling(material, freezer, shaping, product, temperature) {
    var energy = freezer.energy + shaping.energy
    var eut = Math.max(freezer.eut, shaping.eut)
    var duration = Math.ceil(energy / eut)
    var steam = STEAM_PER_WATER * Math.round(STEAM_PER_KELVIN * temperature / STEAM_PER_WATER)
    if (steam > energy) steam = STEAM_PER_WATER * Math.floor(energy / STEAM_PER_WATER)
    if (steam < STEAM_PER_WATER) throw new Error('too little steam')
    return {
      id: 'grindless:hot_rolling/ev/' + material + '_' + product.name,
      builderId: ID_PREFIX + material + '_' + product.name,
      material: material,
      product: product.name,
      circuit: product.circuit,
      hot: freezer.hot,
      temperature: temperature,
      output: shaping.output,
      freezer: { id: freezer.id, eut: freezer.eut, duration: freezer.duration },
      shaping: { id: shaping.id, eut: shaping.eut, duration: shaping.duration },
      energy: energy,
      eut: eut,
      duration: duration,
      steam: steam,
      water: steam / STEAM_PER_WATER
    }
  }

  function addHotRolling(event, sets) {
    var temps = blastTemperatures(sets)
    var shapingById = {}
    sets[BENDER].concat(sets[EXTRUDER]).forEach(function (entry) {
      if (SHAPING_PATH.test(pathOf(entry.id))) shapingById[entry.id] = entry
    })
    var plans = []
    var skipped = []
    var materials = []
    sets[FREEZER].forEach(function (entry) {
      var m = FREEZER_PATH.exec(pathOf(entry.id))
      if (!m) return
      var material = m[1]
      var ns = entry.id.substring(0, entry.id.indexOf(':'))
      try {
        var j = jsonOf(entry)
        if (j === null) throw new Error('unreadable freezer recipe' + (entry.error ? ': ' + entry.error : ''))
        var freezer = readFreezer(entry.id, j)
        var temperature = null
        hotItems(freezer.hot).forEach(function (it) {
          if (temps[it] !== undefined && (temperature === null || temps[it] < temperature)) temperature = temps[it]
        })
        if (temperature === null) throw new Error('no blast furnace recipe makes the hot ingot')
        var made = 0
        PRODUCTS.forEach(function (product) {
          var source = null
          for (var i = 0; i < product.sources.length && source === null; i++) {
            var sid = ns + ':' + product.sources[i].replace('%', material)
            if (shapingById[sid]) source = shapingById[sid]
          }
          if (source === null) return
          var sj = jsonOf(source)
          if (sj === null) throw new Error('unreadable ' + source.id)
          plans.push(planHotRolling(material, freezer, readShaping(source.id, sj), product, temperature))
          made++
        })
        if (made === 0) throw new Error('no plate, rod or foil recipe')
        materials.push(material)
      } catch (e) {
        skipped.push({ material: material, reason: String(e.message || e) })
      }
    })
    var missing = [STEAM, WATER].filter(function (id) { return !Fluid.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'hot_rolling recipes skipped, unknown fluid(s): ' + missing.join(', '))
      return
    }
    var added = []
    plans.forEach(function (p) {
      if (!Item.exists(p.output.id)) {
        skipped.push({ material: p.material, reason: p.product + ': unknown item ' + p.output.id })
        return
      }
      var b = event.recipes.gtceu.hot_rolling(p.builderId)
      b.itemInputs(p.hot.tag ? '1x #' + p.hot.tag : '1x ' + p.hot.item)
      b.circuit(p.circuit)
      b.inputFluids(Fluid.of(WATER, p.water))
      b.itemOutputs(p.output.count + 'x ' + p.output.id)
      b.outputFluids(Fluid.of(STEAM, p.steam))
      b.EUt(p.eut).duration(p.duration)
      added.push(p)
    })
    // MAX-B1 (docs/eras/max.md, L34): rows that are not derived from a GTM shaping recipe; circuit 14 is the first free of the mill (OpV's be_window_foil holds 13)
    MAX_B1_ROWS.forEach(function (row) {
      var rowMissing = [row.input, row.output].filter(function (id) { return !Item.exists(id) })
      if (rowMissing.length > 0) {
        skipped.push({ material: row.name, reason: 'unknown item ' + rowMissing.join(', ') })
        return
      }
      var rb = event.recipes.gtceu.hot_rolling(ID_PREFIX + row.name)
      rb.itemInputs(row.count + 'x ' + row.input)
      rb.circuit(row.circuit)
      rb.inputFluids(Fluid.of(WATER, row.water))
      rb.itemOutputs(row.count + 'x ' + row.output)
      rb.outputFluids(Fluid.of(STEAM, row.water * STEAM_PER_WATER))
      rb.EUt(row.eut).duration(row.duration)
      HM.extraRows.push(row)
    })
    HM.recipes = added
    HM.skipped = skipped
    HM.materials = materials
    console.info(LOG + 'hot_rolling recipes added: ' + added.length + ' for ' + materials.length + ' materials; ' + skipped.length +
      ' freezer recipes not taken (liquid helium, or no blast furnace makes the hot ingot, or nothing to roll)')
  }

  // ---------------------------------------------------------------- controllers

  function addCrafting(event) {
    var missing = PLANT_PARTS.concat(MILL_PARTS).filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'combined-cycle plant and hot strip mill controller recipes skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:combined_cycle_plant')
      .itemInputs('gtceu:ev_machine_hull', 'gtceu:gas_large_turbine', '2x gtceu:ev_electric_pump', '4x #gtceu:circuits/ev', '2x grindless:night_sky_radiator', '2x grindless:platinum_electrode')
      .inputFluids(Fluid.of('gtceu:lubricant', 1000))
      .itemOutputs('gtceu:combined_cycle_plant')
      .EUt(120).duration(400)
    event.recipes.gtceu.assembler('grindless:hot_strip_mill')
      .itemInputs('gtceu:ev_machine_hull', 'gtceu:ev_bender', 'gtceu:vacuum_freezer', '2x gtceu:ev_electric_pump', '4x #gtceu:circuits/ev', '2x grindless:night_sky_radiator', '2x grindless:graphite_electrode')
      .inputFluids(Fluid.of('gtceu:lubricant', 1000))
      .itemOutputs('gtceu:hot_strip_mill')
      .EUt(120).duration(400)
    console.info(LOG + 'combined-cycle plant and hot strip mill controller recipes added')
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var started = Date.now()
    var sets = null
    try {
      sets = gather(event)
    } catch (e) {
      console.error(LOG + 'combined-cycle and hot rolling recipes skipped, reading the recipe set failed: ' + e)
    }
    if (sets !== null) {
      try {
        addCombinedCycle(event, sets)
      } catch (e1) {
        console.error(LOG + 'combined_cycle recipes failed: ' + e1)
      }
      try {
        addHotRolling(event, sets)
      } catch (e2) {
        console.error(LOG + 'hot_rolling recipes failed: ' + e2)
      }
    }
    try {
      addCrafting(event)
    } catch (e3) {
      console.error(LOG + 'combined-cycle plant and hot strip mill controller recipes failed: ' + e3)
    }
    console.info(LOG + 'combined-cycle and hot strip mill recipes done in ' + (Date.now() - started) + ' ms')
  })
})()
