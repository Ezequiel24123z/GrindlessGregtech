// -----------------------------------------------------------------------------------------------
// Recipes of IV on Venus (machines and types: startup_scripts/grindless/iv/venus.js; package IV-B1), built from
// data/grindless/tables/venus.json at every load (/reload picks up a tune):
//
//   gtceu:vein_drilling (Pressurized Vein Drill), under vein_drilling/iv/pressurized_*: one recipe per 'ore' vein of each site of the
//     table, each with that site's dimension, 8 EU/t and 200 ticks a run like every drilling recipe of the family, the vein's stone and
//     5.625 raw ores a run, split like every vein table (global.grindless.lv.veinTools.oresOf); the Tungstensteel drill bit
//     (grindless:tungsten_steel_drill_bit, registered by IV-B2's tungsten_steel_drill_bit.js) wears 0.25 % a run:
//       Venus  global.grindless.ivFoundation.venusVeins() (the naquadah vein): bit + sample (never used up) + 200 mB of distilled water
//              (the heat tax, four times an Earth drill's drilling fluid) -> stone + ores + 1,600 mB of steam: at most the run's own
//              energy at the pack's 1 EU per mB of steam (the hot strip mill's cap), so the drill never makes energy. Inert: to a
//              turbine or voided.
//       Mars   global.grindless.mars.martianVeins() (scheelite, merrillite, ice): sample + bit, dry (the dust filters keep the bit clean).
//     Lookup note (GTM's RecipeDB keeps one recipe per ingredient path; a recipe whose list is a prefix of another's hides): the Venus
//     recipe lists the bit first, then the sample, then the water (like every cooled drilling recipe); the Mars ones the sample first,
//     then the bit (like every dry one). No other recipe starts with a Venus sample, and the Mars ones differ from the tripod's at the bit.
//   gtceu:venus_heat (Venus Heat Engine) grindless:venus_heat/ground_heat: 200 mB of distilled water (the makeup) -> 8,192 EU/t out for
//     400 ticks + 32,000 mB of steam (GTM's 160 mB of steam per mB of water: to a turbine or voided), Venus only. No day or night
//     condition: Venus is fixed at noon. Not in power/generators.js's list (no fuel to double; its condition would make that script skip
//     it anyway).
//   gtceu:acid_cracking (Venus Acid Works), Venus only, the platinum gauze as a chanced input (its wear), the circuit is the mode:
//     cloud_acid_vented  circuit 1: 1,000 mB sulfuric acid -> 1,000 mB distilled water + 1,000 mB oxygen; the SO2 goes back into the air
//     cloud_acid_kept    circuit 2: the same + 1,000 mB sulfur dioxide kept (recipe data grindless_keep_fluids: the works refuses
//                        fluid voiding for it), for home's sulfide roaster
//     Energy: GTM's electrolyzer/distilled_water_electrolysis (45,000 EU per 1,000 mB), spent at up to 7,680 EU/t (6 ticks at 7,500).
//   gtceu:gas_collector (GTM's single-block collector), Venus only, one programmed circuit each (GTM's lookup: 1-3 are taken):
//     venus_carbon_dioxide  circuit 4, below the cloud base (pos_y -64..239): 10,000 mB of carbon dioxide, 1,024 EU/t for 200 ticks
//     venus_sulfuric_acid   circuit 5, in the clouds (pos_y 240..319): 10,000 mB of sulfuric acid, 1,024 EU/t for 200 ticks
//   gtceu:forge_hammer grindless:forge_hammer/venusian_regolith: 1 Venus cobblestone (the drill's stone) -> 1 Venusian regolith (the
//     site casing), at GTM's cobblestone-to-gravel numbers (16 EU/t, 10 ticks), only on Venus.
//   crafting (GTM shaped): the three controllers.
//     Pressurized Vein Drill  EV Tripod Drill + IV hull + 2 IV motors + IV pump + 2 IV circuits + 2 PTFE plates (inert against acid)
//     Venus Heat Engine       IV hull + Heliostat Tower + Large Steam Turbine + 2 IV pumps + 4 IV circuits
//     Venus Acid Works        IV hull + IV chemical reactor + IV fluid heater + 2 platinum gauzes + 4 IV circuits
//
// Published for the smoke test: global.grindless.venus.recipes = { drilling: [{ id, site, vein, cooled, steam }], engine, works: [{ id,
// name, circuit, keep, energy, eut, duration, stages }], collector: [{ id, circuit, layer, minY, maxY }], casing, controllers, problems }.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  const G = global.grindless
  const V = G.venus || (G.venus = {})
  const LV = G.lv || (G.lv = {})
  const MARS = G.mars || (G.mars = {})
  const LOG = '[grindless/iv] '
  const TABLE = 'kubejs/data/grindless/tables/venus.json'
  const MAX_CHANCE = 10000
  const STEAM_PER_WATER = 160

  const CONTROLLER_PARTS = ['gtceu:ev_vein_drill', 'gtceu:iv_machine_hull', 'gtceu:iv_electric_motor', 'gtceu:iv_electric_pump',
    'gtceu:heliostat_tower', 'gtceu:steam_large_turbine', 'gtceu:iv_chemical_reactor', 'gtceu:iv_fluid_heater']

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  // expected amount per run -> whole items + one chanced item for the fraction (the family's maths)
  function addOre(recipe, item, expected) {
    var whole = Math.floor(expected + 1e-9)
    var chance = Math.round((expected - whole) * MAX_CHANCE)
    if (whole > 0) recipe.itemOutputs(whole + 'x ' + item)
    if (chance >= 1) recipe.chancedOutput('1x ' + item, Math.min(chance, MAX_CHANCE - 1), 0)
  }

  // the stages' energy spent at no more than maxEut: duration = ceil(energy / maxEut), EU/t = ceil(energy / duration) (the hot cell's rule)
  function price(stages, maxEut) {
    var energy = stages.reduce(function (s, e) { return s + e.eu }, 0)
    var duration = Math.max(1, Math.ceil(energy / maxEut))
    var eut = Math.ceil(energy / duration)
    return { stagesEnergy: energy, duration: duration, eut: eut, energy: eut * duration }
  }

  function veinsOf(site) {
    if (site.veins === 'venus') {
      if (!G.ivFoundation || typeof G.ivFoundation.venusVeins !== 'function') throw new Error('global.grindless.ivFoundation.venusVeins() is missing (IV-A1)')
      return G.ivFoundation.venusVeins()
    }
    if (site.veins === 'mars') {
      if (typeof MARS.martianVeins !== 'function') throw new Error('global.grindless.mars.martianVeins() is missing (mars/travel.js)')
      return MARS.martianVeins()
    }
    throw new Error('unknown vein set ' + site.veins)
  }

  // ---------------------------------------------------------------- the drill

  function addDrilling(event, T, out) {
    var D = T.drill
    var bit = G.ivDrillBit && G.ivDrillBit.item ? String(G.ivDrillBit.item) : String(D.bit)
    if (bit !== String(D.bit)) out.problems.push('drill: the IV bit is ' + bit + ', the table says ' + D.bit)
    if (!Item.exists(bit)) {
      console.error(LOG + 'Pressurized Vein Drill recipes skipped: the Tungstensteel drill bit ' + bit + ' (IV-B2) is not registered')
      return
    }
    var runEnergy = Number(D.eut) * Number(D.duration)
    list(D.sites).forEach(function (site) {
      var veins = veinsOf(site)
      var steam = site.steam ? { id: String(site.steam.id), amount: Number(site.steam.amount) } : null
      if (steam !== null && steam.amount > runEnergy) {
        out.problems.push('drill: ' + steam.amount + ' mB of steam a run on ' + site.dimension + ' is more than the run\'s ' + runEnergy + ' EU; capped')
        steam.amount = runEnergy
      }
      veins.forEach(function (vein) {
        if (vein.kind !== undefined && vein.kind !== 'ore') return
        var bad = []
        if (String(vein.dimension) !== String(site.dimension)) bad.push('dimension ' + vein.dimension)
        if (!Item.exists(vein.sample)) bad.push('sample ' + vein.sample + ' is not registered')
        var stone = vein.stone ? String(vein.stone) : null
        if (stone !== null && !Item.exists(stone)) bad.push('stone ' + stone + ' does not exist')
        var total = vein.ores.reduce(function (s, o) { return s + o.share }, 0)
        if (Math.abs(total - 1) > 1e-9) bad.push('shares add up to ' + total)
        vein.ores.forEach(function (o) { if (!Item.exists(o.item)) bad.push('raw ore ' + o.item + ' does not exist') })
        if (site.coolant && !Fluid.exists(site.coolant.id)) bad.push('coolant ' + site.coolant.id + ' does not exist')
        if (bad.length > 0) {
          out.problems.push('drill: ' + vein.id + ': ' + bad.join(', '))
          return
        }
        var id = 'grindless:' + D.tier + '/' + D.prefix + vein.id + '_' + D.bitName
        var recipe = event.recipes.gtceu.vein_drilling(id)
        if (site.coolant) {
          recipe.chancedInput(bit, Number(D.wear), 0)
            .notConsumable(vein.sample)
            .inputFluids(Fluid.of(String(site.coolant.id), Number(site.coolant.amount)))
        } else {
          recipe.notConsumable(vein.sample)
            .chancedInput(bit, Number(D.wear), 0)
        }
        if (stone !== null) recipe.itemOutputs('1x ' + stone)
        vein.ores.forEach(function (o) { addOre(recipe, o.item, o.share * Number(D.orePerRun)) })
        if (steam !== null) recipe.outputFluids(Fluid.of(steam.id, steam.amount))
        recipe.dimension(String(site.dimension)).EUt(Number(D.eut)).duration(Number(D.duration))
        out.drilling.push({
          id: 'grindless:vein_drilling/' + D.tier + '/' + D.prefix + vein.id + '_' + D.bitName,
          site: String(site.dimension),
          vein: vein.id,
          sample: vein.sample,
          cooled: !!site.coolant,
          steam: steam !== null ? steam.amount : 0
        })
      })
    })
  }

  // ---------------------------------------------------------------- the heat engine

  function addEngine(event, T, out) {
    var E = T.heatEngine
    var water = E.water
    var steam = E.steam
    if (Number(steam.amount) !== Number(water.amount) * STEAM_PER_WATER) {
      out.problems.push('heat engine: ' + steam.amount + ' mB of steam for ' + water.amount + ' mB of water, not GTM\'s ' + STEAM_PER_WATER + ':1')
    }
    if (String(E.type) !== 'venus_heat') throw new Error('the heat engine type is gtceu:venus_heat (startup), the table says ' + E.type)
    event.recipes.gtceu.venus_heat('grindless:' + E.name)
      .inputFluids(Fluid.of(String(water.id), Number(water.amount)))
      .outputFluids(Fluid.of(String(steam.id), Number(steam.amount)))
      .dimension(String(T.site.dimension))
      .EUt(-Number(E.eut))
      .duration(Number(E.duration))
    out.engine = 'grindless:' + E.type + '/' + E.name
  }

  // ---------------------------------------------------------------- the acid works

  function addWorks(event, T, out) {
    var W = T.acidWorks
    if (!Item.exists(W.gauze)) {
      console.error(LOG + 'Venus Acid Works recipes skipped: the platinum gauze ' + W.gauze + ' (IV-A1) is not registered')
      return
    }
    if (String(W.type) !== 'acid_cracking') throw new Error('the acid works type is gtceu:acid_cracking (startup), the table says ' + W.type)
    var circuits = {}
    list(W.recipes).forEach(function (rec) {
      var bad = []
      if (circuits[rec.circuit]) bad.push('circuit ' + rec.circuit + ' is also ' + circuits[rec.circuit])
      circuits[rec.circuit] = rec.name
      list(rec.fluidsIn).concat(list(rec.fluidsOut)).forEach(function (f) { if (!Fluid.exists(f.id)) bad.push('fluid ' + f.id + ' does not exist') })
      var stages = list(rec.energy).map(function (s) {
        return { stage: String(s.stage), from: String(s.from), eu: Number(s.euPer) * Number(s.amount) / Number(s.per) }
      })
      if (stages.length === 0 || stages.some(function (s) { return !(s.eu > 0) })) bad.push('energy ' + JSON.stringify(rec.energy))
      if (bad.length > 0) {
        out.problems.push('acid works: ' + rec.name + ': ' + bad.join(', '))
        return
      }
      var cost = price(stages, Number(rec.maxEUt))
      var recipe = event.recipes.gtceu.acid_cracking('grindless:' + rec.name)
        .chancedInput(String(W.gauze), Number(W.gauzeWear), 0)
        .circuit(Number(rec.circuit))
      list(rec.fluidsIn).forEach(function (f) { recipe.inputFluids(Fluid.of(String(f.id), Number(f.amount))) })
      list(rec.fluidsOut).forEach(function (f) { recipe.outputFluids(Fluid.of(String(f.id), Number(f.amount))) })
      if (rec.keep === true) recipe.addDataBool(String(W.keepKey), true)
      recipe.dimension(String(T.site.dimension)).EUt(cost.eut).duration(cost.duration)
      out.works.push({
        id: 'grindless:' + W.type + '/' + rec.name,
        name: String(rec.name),
        circuit: Number(rec.circuit),
        keep: rec.keep === true,
        energy: cost.energy,
        stagesEnergy: cost.stagesEnergy,
        eut: cost.eut,
        duration: cost.duration,
        stages: stages
      })
    })
  }

  // ---------------------------------------------------------------- the gas collector

  function addCollector(event, T, out) {
    var site = T.site
    var base = Number(site.cloudBase)
    list(T.gasCollector).forEach(function (g) {
      if (!Fluid.exists(g.fluid.id)) {
        out.problems.push('gas collector: ' + g.name + ': fluid ' + g.fluid.id + ' does not exist')
        return
      }
      var range = g.layer === 'clouds' ? [base, Number(site.skyTop)] : [Number(site.bottom), base - 1]
      event.recipes.gtceu.gas_collector('grindless:' + g.name)
        .circuit(Number(g.circuit))
        .outputFluids(Fluid.of(String(g.fluid.id), Number(g.fluid.amount)))
        .dimension(String(site.dimension))
        .posY(range[0], range[1])
        .EUt(Number(g.eut))
        .duration(Number(g.duration))
      out.collector.push({ id: 'grindless:gas_collector/' + g.name, circuit: Number(g.circuit), layer: String(g.layer), minY: range[0], maxY: range[1] })
    })
  }

  // ---------------------------------------------------------------- the site casing and the controllers

  function addCasing(event, T, out) {
    var C = T.siteCasing
    if (!Item.exists(C.input) || !Item.exists(C.output)) {
      out.problems.push('site casing: ' + C.input + ' or ' + C.output + ' does not exist')
      return
    }
    event.recipes.gtceu.forge_hammer('grindless:' + C.name)
      .itemInputs('1x ' + C.input)
      .itemOutputs('1x ' + C.output)
      .dimension(String(T.site.dimension))
      .EUt(Number(C.eut))
      .duration(Number(C.duration))
    out.casing = 'grindless:forge_hammer/' + C.name
  }

  function addControllers(event, T, out) {
    var missing = CONTROLLER_PARTS.concat([T.drill.machine, T.heatEngine.machine, T.acidWorks.machine, T.acidWorks.gauze])
      .filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'Venus controller recipes skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped(T.drill.machine, ['ALA', 'MHM', 'CPC'], {
      A: '#forge:plates/polytetrafluoroethylene',
      L: 'gtceu:ev_vein_drill',
      M: 'gtceu:iv_electric_motor',
      H: 'gtceu:iv_machine_hull',
      C: '#gtceu:circuits/iv',
      P: 'gtceu:iv_electric_pump'
    }).id('grindless:crafting/pressurized_vein_drill')

    event.recipes.gtceu.shaped(T.heatEngine.machine, ['CPC', 'THS', 'CPC'], {
      C: '#gtceu:circuits/iv',
      P: 'gtceu:iv_electric_pump',
      T: 'gtceu:heliostat_tower',
      H: 'gtceu:iv_machine_hull',
      S: 'gtceu:steam_large_turbine'
    }).id('grindless:crafting/venus_heat_engine')

    event.recipes.gtceu.shaped(T.acidWorks.machine, ['CGC', 'RHF', 'CGC'], {
      C: '#gtceu:circuits/iv',
      G: T.acidWorks.gauze,
      R: 'gtceu:iv_chemical_reactor',
      H: 'gtceu:iv_machine_hull',
      F: 'gtceu:iv_fluid_heater'
    }).id('grindless:crafting/venus_acid_works')

    out.controllers = ['grindless:crafting/pressurized_vein_drill', 'grindless:crafting/venus_heat_engine', 'grindless:crafting/venus_acid_works']
  }

  // ---------------------------------------------------------------- load

  ServerEvents.recipes(function (event) {
    var out = { drilling: [], engine: null, works: [], collector: [], casing: null, controllers: [], problems: [] }
    V.recipes = out
    var T = null
    try {
      T = G.readJsonTable(V.table || TABLE)
    } catch (e) {
      console.error(LOG + 'Venus recipes skipped: cannot read ' + TABLE + ': ' + e)
      return
    }
    function step(name, fn) {
      try {
        fn(event, T, out)
      } catch (e) {
        console.error(LOG + 'Venus ' + name + ' recipes failed: ' + e)
      }
    }
    step('drilling', addDrilling)
    step('heat engine', addEngine)
    step('acid works', addWorks)
    step('gas collector', addCollector)
    step('site casing', addCasing)
    step('controller', addControllers)
    out.problems.forEach(function (p) { console.error(LOG + 'Venus table: ' + p) })
    console.info(LOG + 'Venus: ' + out.drilling.length + ' pressurized drilling recipes (' + out.drilling.map(function (d) { return d.vein }).join(', ') + '), ' +
      (out.engine ? 'the heat engine, ' : 'no heat engine, ') + out.works.length + ' acid works recipes (' +
      out.works.map(function (w) { return w.name + ' ' + w.eut + ' EU/t x ' + w.duration + ' t' }).join(', ') + '), ' + out.collector.length +
      ' gas collector recipes (cloud base Y ' + T.site.cloudBase + '), ' + (out.casing ? 'the regolith hammer, ' : '') + out.controllers.length + ' controllers')
  })
})()
