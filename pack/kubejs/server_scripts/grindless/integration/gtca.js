// priority: -15124
// -----------------------------------------------------------------------------------------------
// GT Community Additions (gtca 2.2.0), audited against docs/eras (ev.md, "Decisions taken": no addon may process cheaper than
// GT in its era or undercut the pack's own multiblocks; GCYM-style parallel machines wait for IV). The mod has no config switch
// and builds its recipes in Java, so everything is done here. The numbers were read from the pack's recipe dump.
//
// Removed (every recipe of the type or the named recipes, every recipe that makes the item; the items are hidden in EMI):
//   Green House            gtceu:green_house: 64 logs / 32 crops per run for 40-60 EU/t from LV. Plant automation is our
//                          greenhouse family (gtceu:greenhouse, steam/greenhouse.js, lv/greenhouse.js).
//   Recyclers LV-UHV, scrap, scrap box, UU amplifiers
//                          an LV recycler turns stone, deepslate, netherrack, end stone or ash dust into scrap (7.25 %, 1 EU/t);
//                          9 scrap make a scrap box, and opening one drops a uniformly random item of the WHOLE item registry.
//                          The UU amplifiers only burn scrap; the fabricator's "amped" recipe goes with them (its amplifier only
//                          came from them).
//   UU matter -> nether star  chemical_reactor and large_chemical_reactor nether_star_from_pearl_dust (IV): 32 ender pearl dust +
//                          40 mB of UU matter -> 4 nether star dust, a star out of energy past the wither of our creature
//                          simulator. It was the only UU consumer below UV that hands out a line's product; the UU matter
//                          fabricators (IV, 8.4 M EU per mB) stay for the rest: strange crystal dust (IV, eats a nether star dust),
//                          nanites and lenses (UV), the nano forge (UEV) and the space elevator (UHV).
//   Polymerizer (EV)       PE, PVC, PTFE, PVA and PPS from the same monomers as GTM's reactors, 17-33 % more polymer.
//   Industrial Coke Oven (EV)  2 coke per coal, 3 charcoal per log, 3.4x the creosote and 3x the heavy oil of GTM's ovens.
//   Steam Pressurizer (HV) 6 400 mB of steam + 480 EU -> 640 mB of high pressure steam worth 8 000 EU in a steam turbine (the
//                          steam was worth 3 200): energy out of nothing. Its turbine recipe goes with it.
//   Chemical Generators (EV, IV)  burn common acids at 180-450 EU/mB (HCl 304, HF 448): 5-14x what the acid costs to make from
//                          brine, air and sulfur. An energy loop.
//   Extreme Heat Exchanger + SHD Turbine (IV / LuV parts)  fusion plasma -> supercritical steam -> 3.4-3.7x the EU of GTM's plasma
//                          turbine for the same plasma (helium: 305 000 EU/mB against 81 920). Its lava recipe ("pahoehoe")
//                          gives 12.8 M mB of superheated steam (about 427 M EU) and 160 000 mB of pahoehoe lava, which an EV
//                          centrifuge turns into copper, tin, silver, scheelite (the tungsten of the End vein), bauxite and
//                          phosphorus: metals and energy out of lava. Both types, the pahoehoe centrifuge recipes and the steam
//                          turbine recipes of the superheated and high pressure steams go; the GT-- spruce oil recipe that
//                          needs superheated steam goes too (its plain steam version stays).
//   E85 and dimethyl ether  chemical_plant/e85fuel_cp (HV, GT-- plant) makes 20 000 mB of E85 worth 28.8 M EU from fuels worth
//                          4.2 M (x6.8). Dimethyl ether (3 mB per mB of methanol, 960 EU/mB) burns for 45x the methanol it
//                          came from, and burning it is its only use: its two recipes (thermal reactor, GT-- dehydrator) go too.
// Re-gated (the recipe that makes the controller):
//   Mega Chemical Reactor, Mega Oil Cracking Unit   GTM's large chemical reactor / cracker with parallel hatches and batch mode:
//                          GCYM-style machines (ev.md decision 5: IV). Still 64 machines + 9 216 mB of soldering alloy, now in
//                          an IV assembler (7 680 EU/t) with an IV hull and 4 IV circuits; the one-hour timer is gone.
//   IsaMill, Flotation Cell Regulator (the froth line)  milled ore -> froth -> Thermal Reactor dusts: 8 Pt, 6 Pd, 4.75 Rh, 4 Ru
//                          and 2.5 Ir per raw platinum ore, several times the ore plant, past the platinum plant. A real
//                          multi-step line, but it skips our plants, so it moves two tiers past the platinum plant's Ir/Os stage
//                          (IV): ZPM hulls and ZPM circuits instead of LuV / IV ones and 122 880 EU/t in their assembly-line
//                          recipes; everything else, research included, stays.
// Kept: Thermal Reactor (EV: the GTNH-style rare-earth chain from bastnasite, a long line that gives less neodymium than the ore
// plant; its froth recipes need the ZPM flotation cell), Advanced EBF (LuV), Comet, Nano Forge, Tegmark Forge, PCB Factories
// (UV+), UU matter fabricators (plain recipe), GTCA's plasma recipes for GTM's plasma turbine, the materials and the rest of the
// chemistry.
// Space miners, pumps and assemblers and the purification units have no controller recipe.
// Era: never for the removed ones; IV for the mega machines; ZPM for the froth line; UV for anything new that eats UU matter.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/gtca] '
  var TIERS = ['lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv']

  // recipe types registered by GTCA (gtceu: namespace, no GTM machine uses them) whose every recipe goes
  var REMOVED_TYPES = ['green_house', 'recycler', 'uu_matter_amplificator', 'polymerizer', 'industrial_coke_oven', 'steam_pressurizer',
    'chemical_generator', 'extreme_heat_exchanger', 'shd_turbine']

  // single recipes of types that stay
  var REMOVED_IDS = [
    'gtceu:centrifuge/pahoehoe_ingot', 'gtceu:centrifuge/pahoehoe_nugget',
    'gtceu:steam_turbine/sh_steam', 'gtceu:steam_turbine/hp_steam', 'gtceu:chemical_plant/spruce_oil_shsteam',
    'gtceu:chemical_plant/e85fuel_cp', 'gtceu:combustion_generator/e85fuel',
    'gtceu:gas_turbine/dymethyl_ether', 'gtceu:dehydrator/dymethyl_ether', 'gtceu:thermal_reactor/dymethyl_ether',
    'gtceu:chemical_reactor/nether_star_from_pearl_dust', 'gtceu:large_chemical_reactor/nether_star_from_pearl_dust',
    'gtceu:uu_matter_fabricator/uumatter_amped',
    // GTCA's elevator module test recipes (UHV-S0-8: the modules are hidden until UEV)
    'gtceu:space_miner/ha', 'gtceu:space_pump/test'
  ]

  // items nothing may make any more: the controllers of the removed machines, scrap and the scrap box
  var REMOVED_ITEMS = ['green_house', 'polymerizer', 'industrial_coke_oven', 'steam_pressurizer', 'ev_chemical_generator',
    'iv_chemical_generator', 'extreme_heat_exchanger', 'shd_turbine', 'scrap', 'scrapbox']
  TIERS.forEach(function (t) { REMOVED_ITEMS.push(t + '_recycler') })
  TIERS.slice(3).forEach(function (t) { REMOVED_ITEMS.push(t + '_matter_amplificator') })

  // GCYM-style machines: GTCA's own recipe (64 machines + soldering alloy, HV assembler, 72 000 ticks) is replaced
  var MEGA = [
    { from: 'gtceu:assembler/mega_lcr', name: 'mega_lcr', machine: 'gtceu:large_chemical_reactor', output: 'gtca:mega_lcr' },
    { from: 'gtceu:assembler/mega_cracker', name: 'mega_oil_cracking_unit', machine: 'gtceu:cracker', output: 'gtca:mega_oil_cracking_unit' }
  ]
  var IV_EUT = 7680

  // the froth line: the assembly-line recipes of its two controllers move to ZPM (re-added as grindless:assembly_line/gtca/<name>)
  var FROTH = [
    { from: 'gtceu:assembly_line/isamill_controller', name: 'isamill_controller' },
    { from: 'gtceu:assembly_line/flcr_controller', name: 'flotation_cell_regulator_controller' }
  ]
  var ZPM_ITEMS = { 'gtceu:luv_machine_hull': 'gtceu:zpm_machine_hull', 'gtceu:iv_machine_hull': 'gtceu:zpm_machine_hull' }
  var ZPM_TAGS = { 'gtceu:circuits/luv': 'gtceu:circuits/zpm' }
  var ZPM_EUT = 122880

  function removedItems() {
    return REMOVED_ITEMS.map(function (n) { return 'gtca:' + n }).filter(function (id) { return Item.exists(id) })
  }

  // "<count>x <item>" / "<count>x #<tag>" for GTM's KubeJS builder from one item entry of a GT recipe JSON, the hulls and circuits
  // swapped to ZPM; null for a shape this script does not read (chanced, non-consumed, NBT, several items)
  function itemArg(entry, swaps) {
    var c = entry.content
    if (!c || (entry.chance !== undefined && entry.chance !== 10000)) return null
    var sized = c.type === 'gtceu:sized'
    if (c.type !== undefined && !sized) return null
    var ing = sized ? c.ingredient : c
    var count = sized ? (c.count || 1) : 1
    if (!ing || ing.type !== undefined) return null
    if (ing.item && !ing.nbt) {
      var item = ZPM_ITEMS[ing.item] || ing.item
      if (item !== ing.item) swaps.n++
      return Item.exists(item) ? count + 'x ' + item : null
    }
    if (ing.tag) {
      var tag = ZPM_TAGS[ing.tag] || ing.tag
      if (tag !== ing.tag) swaps.n++
      return count + 'x #' + tag
    }
    return null
  }

  // "<fluid> <amount>" / "#<tag> <amount>" from one fluid entry; null for anything else
  function fluidArg(entry) {
    var c = entry.content
    if (!c || (entry.chance !== undefined && entry.chance !== 10000) || !c.value || c.value.length !== 1 || !(c.amount > 0)) return null
    var v = c.value[0]
    if (v.tag && !v.nbt) return '#' + v.tag + ' ' + c.amount
    if (v.fluid && !v.nbt) return v.fluid + ' ' + c.amount
    return null
  }

  // the builder arguments of a froth controller recipe at ZPM, or a string saying why it cannot be read (then nothing changes)
  function zpmArgs(json) {
    var known = { type: true, duration: true, category: true, recipeConditions: true, tickInputs: true, inputs: true, outputs: true }
    var unknown = Object.keys(json).filter(function (k) { return !known[k] })
    if (unknown.length > 0) return 'unexpected keys ' + unknown.join(', ')
    var swaps = { n: 0 }
    var ins = json.inputs || {}
    var outs = json.outputs || {}
    var items = (ins.item || []).map(function (e) { return itemArg(e, swaps) })
    var fluids = (ins.fluid || []).map(fluidArg)
    var products = (outs.item || []).map(function (e) { return itemArg(e, { n: 0 }) })
    if (items.indexOf(null) >= 0 || fluids.indexOf(null) >= 0) return 'an input this script does not read'
    if (products.length !== 1 || products[0] === null || (outs.fluid && outs.fluid.length > 0)) return 'not one item output'
    if (Object.keys(ins).some(function (k) { return k !== 'item' && k !== 'fluid' })) return 'inputs other than items and fluids'
    if (swaps.n < 2) return 'no LuV / IV hull and LuV circuits to swap (' + swaps.n + ')'
    var research = []
    var conds = json.recipeConditions || []
    for (var i = 0; i < conds.length; i++) {
      if (conds[i].type !== 'research' || !conds[i].research) return 'a condition other than research'
      conds[i].research.forEach(function (r) { research.push(r.researchId) })
    }
    if (research.length !== 1 || !research[0]) return 'not one research entry'
    if (!(json.duration > 0)) return 'no duration'
    return { items: items, fluids: fluids, output: products[0].replace(/^1x /, ''), duration: json.duration, research: String(research[0]) }
  }

  // an uncaught error here would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    try {
      changeRecipes(event)
    } catch (e) {
      console.error(LOG + 'recipe changes failed: ' + e)
    }
  })

  function changeRecipes(event) {
    var removed = 0
    REMOVED_TYPES.forEach(function (name) {
      var type = 'gtceu:' + name
      event.forEachRecipe({ type: type }, function () { removed++ })
      event.remove({ type: type })
    })
    REMOVED_IDS.forEach(function (id) {
      event.forEachRecipe({ id: id }, function () { removed++ })
      event.remove({ id: id })
    })
    var items = removedItems()
    items.forEach(function (id) { event.remove({ output: id }) })

    var mega = 0
    MEGA.forEach(function (m) {
      event.remove({ id: m.from })
      if (!Item.exists(m.output) || !Item.exists(m.machine)) {
        console.warn(LOG + m.output + ' or ' + m.machine + ' does not exist; no IV recipe added')
        return
      }
      event.recipes.gtceu.assembler('grindless:gtca/' + m.name)
        .itemInputs('64x ' + m.machine, 'gtceu:iv_machine_hull', '4x #gtceu:circuits/iv', '2x grindless:platinum_electrode',
          '2x grindless:night_sky_radiator', '2x grindless:zircaloy_cladding_tube')
        .inputFluids(Fluid.of('gtceu:soldering_alloy', 9216), Fluid.of('gtceu:lubricant', 1000))
        .itemOutputs(m.output)
        .EUt(IV_EUT).duration(1200)
      mega++
    })

    var captured = []
    FROTH.forEach(function (f) {
      event.forEachRecipe({ id: f.from }, function (r) {
        try {
          captured.push({ from: f.from, name: f.name, json: JSON.parse(String(r.json)) })
        } catch (e) {
          console.error(LOG + 'cannot read ' + f.from + ': ' + e)
        }
      })
    })
    var froth = 0
    captured.forEach(function (c) {
      var args = zpmArgs(c.json)
      if (typeof args === 'string') {
        console.error(LOG + c.from + ' left as it is: ' + args)
        return
      }
      // GTM's builder with an explicit id: a GT recipe added from raw JSON (event.custom) gets a kjs/ id plus a second copy under
      // <type>/<name> from GTM's KubeJS plugin, and .id() is hidden on GT recipes. Ends up as grindless:assembly_line/gtca/<name>.
      // The addon's recipe only goes once the new one is in.
      try {
        var b = event.recipes.gtceu.assembly_line('grindless:gtca/' + c.name)
        args.items.forEach(function (s) { b.itemInputs(s) })
        args.fluids.forEach(function (s) { b.inputFluids(s) })
        b.itemOutputs(args.output).EUt(ZPM_EUT).duration(args.duration).researchWithoutRecipe(args.research)
      } catch (e) {
        console.error(LOG + c.from + ' could not be re-added at ZPM, the addon recipe stays: ' + e)
        return
      }
      event.remove({ id: c.from })
      froth++
    })

    console.info(LOG + 'removed ' + removed + ' recipes (' + REMOVED_TYPES.length + ' types, ' + REMOVED_IDS.length + ' ids); ' + items.length +
      ' items made uncraftable; mega machines at IV: ' + mega + '/' + MEGA.length + '; froth controllers at ZPM: ' + froth + '/' + FROTH.length)
  }

  ServerEvents.tags('item', function (event) {
    try {
      removedItems().forEach(function (id) { event.add('c:hidden_from_recipe_viewers', id) })
    } catch (e) {
      console.error(LOG + 'hidden tag failed: ' + e)
    }
  })
})()
