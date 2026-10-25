// priority: 100
// Gregtech Grindless - recipe gates of the GT addons other than Extended Features: GT Community Additions, GT--, GregTech Modern
// Utilities, Gregtech Terminals, GregTech Storage Drawers, greg paintings, GregTech 7.5.3 Performance Fixes, Gregicality Rocketry
// and the client-only GTM QoL / Calculator Board (TEST-ONLY overlay: copied over the instance on the test PC, never shipped with
// the pack). Scripts under test: pack/kubejs/server_scripts/grindless/integration/gtca.js and gtnn.js.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_addon_gates_misc' -WaitForLog 'GGTEST\|addon_gates_misc\|DONE@@900'
//
// Markers: GGTEST|addon_gates_misc|<check>|PASS|FAIL|NOTE|<detail>, last line GGTEST|addon_gates_misc|DONE. Recipe checks only, no
// world building. Everything is read from the live recipe manager, except what the addons brought before the pack's scripts ran:
// this file has priority 100, so its recipes handler runs before gtca.js / gtnn.js and counts the addons' own recipes.
//   addons_loaded       the audited mods are loaded and their recipe types and machines registered
//   addon_shipped       the removed types and ids and the re-gated recipes came from the addons (a zero below is our removal, not
//                       a missing mod)
//   scan                one pass over every recipe of the manager (item outputs of GT and crafting recipes)
//   removed_types       0 recipes in each removed GTCA type (green house, recycler, UU amplifier, polymerizer, industrial coke oven,
//                       steam pressurizer, chemical generator, extreme heat exchanger, SHD turbine)
//   removed_ids         the named recipes are gone (pahoehoe lava, superheated and high pressure steam, E85, dimethyl ether, the
//                       replaced controller recipes)
//   removed_pgs_taps    no GT-- pgs_from_<ore> recipe (ore + nitration mixture -> concentrated platinum) is left
//   platline_stages     every stage recipe of GT--'s platinum line that the EV platinum plant composes is still there
//   removed_items       no recipe of any type makes a removed controller, scrap or the scrap box
//   hidden              the removed items are in #c:hidden_from_recipe_viewers (hidden in EMI)
//   regate_mega         Mega Chemical Reactor / Mega Oil Cracking Unit: one recipe each, IV hull + IV circuits + the 64 machines,
//                       7 680 EU/t or more
//   regate_froth        IsaMill / Flotation Cell Regulator: ZPM hull + ZPM circuits at 122 880 EU/t, research kept, no LuV / IV left
//   regate_maceration   Maceration Stack: IV macerators, tungsten steel plates and an IV circuit, no EV macerator
//   uncraftable         what has no recipe today stays without one (GTCA space miners / pumps / assemblers and purification units,
//                       GT-- component assembly line, stone bedrock ore machine and UV naquadah reactor (GT-- ships no recipe for
//                       it), GCYR drone hangar and satellites)
//   craftable_machines  every craftable machine of gtca, gtnn, gcyr and gtmutils is in the audited list, and none of it was lost
//   uu_consumers        every recipe that eats UU matter runs at UV (491 520 EU/t) or more, or is audited (GTCA's strange crystal
//                       dust, which eats a nether star dust; placeholder recipes of machines without a controller recipe)
//   kept                sample recipes that stay (thermal reactor rare-earth step and froth recipes, UU fabricator, plasma for GTM's
//                       turbine, GT-- chemical plant and rocket fuels, gtmutils, terminals, GT drawers, GCYR rocket parts, GTM fuels)
//   gtnn_harder_lines   NOTE: GT--'s platinum / naquadah lines are live (kept: our plants compose them) and the config still to set
//   gcyr_first_rocket   NOTE: what the rocket scanner (the first rocket) and the basic rocket parts ask for
//   small_addons        NOTE: recipes of the small addons, painting variants, client-only mods
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'addon_gates_misc'

  // Scripts can be reloaded right after the server is up; the command only leaves a request in `global` (it survives reloads) and
  // the tick handler starts the checks once these scripts have been loaded for QUIET_MS.
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestAddonGatesMiscRequest'

  var MODS = ['gtca', 'gtnn', 'gcyr', 'gtmutils', 'gtceuterminal', 'gtstoragedrawers', 'greg_paintings', 'gtopt']
  var CLIENT_ONLY = ['gtmqol', 'gtcalcboard']
  var SCAN_NS = { gtca: true, gtnn: true, gcyr: true, gtmutils: true, gtceuterminal: true, gtstoragedrawers: true }
  var MACHINE_NS = { gtca: true, gtnn: true, gcyr: true, gtmutils: true }

  var REMOVED_TYPES = ['green_house', 'recycler', 'uu_matter_amplificator', 'polymerizer', 'industrial_coke_oven', 'steam_pressurizer',
    'chemical_generator', 'extreme_heat_exchanger', 'shd_turbine']
  var REMOVED_IDS = [
    'gtceu:extreme_heat_exchanger/pahoehoe', 'gtceu:extreme_heat_exchanger/helium', 'gtceu:centrifuge/pahoehoe_ingot',
    'gtceu:centrifuge/pahoehoe_nugget', 'gtceu:steam_turbine/sh_steam', 'gtceu:steam_turbine/hp_steam',
    'gtceu:chemical_plant/spruce_oil_shsteam',
    'gtceu:chemical_plant/e85fuel_cp', 'gtceu:combustion_generator/e85fuel',
    'gtceu:gas_turbine/dymethyl_ether', 'gtceu:dehydrator/dymethyl_ether', 'gtceu:thermal_reactor/dymethyl_ether',
    'gtceu:chemical_reactor/nether_star_from_pearl_dust', 'gtceu:large_chemical_reactor/nether_star_from_pearl_dust',
    'gtceu:uu_matter_fabricator/uumatter_amped',
    'gtceu:assembler/mega_lcr', 'gtceu:assembler/mega_cracker', 'gtceu:shaped/maceration_stack_controller',
    'gtceu:assembly_line/isamill_controller', 'gtceu:assembly_line/flcr_controller',
    'gtceu:shaped/scrapbox', 'gtceu:packer/scrapbox_in_packer', 'gtceu:shaped/extreme_heat_exchanger'
  ]
  // GT--'s pgs_from taps (its version outputs concentrated platinum; GTM's own pgs_from, if the harder line is off, stays)
  var TAP_ORES = ['bornite', 'chalcocite', 'chalcopyrite', 'cooperite', 'pentlandite', 'tetrahedrite']
  var TAP_IDS = []
  ;['chemical_reactor', 'large_chemical_reactor'].forEach(function (m) {
    TAP_ORES.forEach(function (ore) { TAP_IDS.push('gtceu:' + m + '/pgs_from_' + ore, 'gtceu:' + m + '/pgs_from_' + ore + '_p') })
  })
  // the stage recipes of GT--'s platinum line the EV platinum plant composes (server_scripts/grindless/ev/platinum_plant.js): none may be removed
  var PLATLINE_STAGES = ['centrifuge/platinum_group_sludge_dust', 'chemical_reactor/crude_rhodium_metallic_powder',
    'chemical_reactor/dissolve_platinum_metallic_powder9', 'chemical_reactor/large_palladium_dusts',
    'chemical_reactor/palladium_metallic_powder_conversion', 'chemical_reactor/raw_palladium_separation',
    'chemical_reactor/raw_platinum_separation', 'chemical_reactor/reprecipitated_rhodium', 'chemical_reactor/rhodium_dust',
    'chemical_reactor/rhodium_nitrate', 'chemical_reactor/ruthenium_tetroxide', 'chemical_reactor/ruthenium_tetroxide_separation',
    'cracker/hot_ruthenium_tetroxide', 'distillation_tower/hot_ruthenium_tetroxide_distill', 'electric_blast_furnace/leach_residue_one',
    'electric_blast_furnace/rarest_metal_residue', 'electric_blast_furnace/refined_platinum_salt_dust_ebf',
    'electric_blast_furnace/rhodium_salt_ebf', 'electrolyzer/decomposition_electrolyzing_sulfuric_copper_solution',
    'electrolyzer/decomposition_electrolyzing_sulfuric_nickel_solution', 'extractor/potassium_pyrosulfate_dust',
    'fluid_solidifier/ruthenium_tetroxide_dust', 'large_chemical_reactor/large_platinum_dusts',
    'large_chemical_reactor/platinum_group_sludge_dust1', 'large_chemical_reactor/platinum_group_sludge_dust2',
    'large_chemical_reactor/rhodium_sulfate_to_solution_l', 'mixer/rhodium_filter_cake_solution', 'mixer/rhodium_salt_solution',
    'sifter/refined_platinum_salt', 'sifter/rhodium_filter_cake', 'sifter/salt_to_metallic_powder_palladium'
  ].map(function (p) { return 'gtceu:' + p })

  var TIERS = ['lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv']
  var REMOVED_ITEMS = ['gtca:green_house', 'gtca:polymerizer', 'gtca:industrial_coke_oven', 'gtca:steam_pressurizer',
    'gtca:ev_chemical_generator', 'gtca:iv_chemical_generator', 'gtca:extreme_heat_exchanger', 'gtca:shd_turbine', 'gtca:scrap',
    'gtca:scrapbox']
  TIERS.forEach(function (t) { REMOVED_ITEMS.push('gtca:' + t + '_recycler') })
  TIERS.slice(3).forEach(function (t) { REMOVED_ITEMS.push('gtca:' + t + '_matter_amplificator') })

  var MEGA = [
    { output: 'gtca:mega_lcr', machine: 'gtceu:large_chemical_reactor', id: 'grindless:assembler/gtca/mega_lcr' },
    { output: 'gtca:mega_oil_cracking_unit', machine: 'gtceu:cracker', id: 'grindless:assembler/gtca/mega_oil_cracking_unit' }
  ]
  var FROTH = [
    { output: 'gtca:isamill', from: 'gtceu:assembly_line/isamill_controller' },
    { output: 'gtca:flotation_cell_regulator', from: 'gtceu:assembly_line/flcr_controller' }
  ]
  var STACK = 'gtnn:maceration_stack_controller'
  var VA_IV = 7680
  var VA_ZPM = 122880

  var NEVER = ['gtca:space_miner_mki', 'gtca:space_miner_mkii', 'gtca:space_miner_mkiii', 'gtca:space_pump_mki', 'gtca:space_pump_mkii',
    'gtca:space_pump_mkiii', 'gtca:space_assembler_mki', 'gtca:space_assembler_mkii', 'gtca:space_assembler_mkiii',
    'gtca:clarifier_purification_unit', 'gtca:flocculation_purification_unit', 'gtca:ozonation_purification_unit',
    'gtca:ph_neutralization_purification_unit', 'gtca:extreme_temperature_purification_unit',
    'gtca:high_energy_laser_purification_unit', 'gtca:residual_decontamiant_degasser_purification_unit',
    'gtnn:component_assembly_line', 'gtnn:homemade_bedrock_ore_machine', 'gtnn:uv_naquadah_reactor',
    'gcyr:drone_hangar', 'gcyr:empty_satellite', 'gcyr:gps_satellite', 'gcyr:laser_satellite', 'gcyr:ore_finder_satellite',
    'gcyr:dyson_swarm_satellite']
  var UV_NAQ = 'gtnn:uv_naquadah_reactor'

  // UU matter consumers allowed below UV: GTCA's strange crystal dust (IV, it eats a nether star dust) and the placeholder recipes
  // of machines that have no controller recipe (purification units, space pump: in NEVER above)
  var UU_FLUID = 'gtceu:uu_matter'
  var UU_OK_IDS = ['gtceu:chemical_bath/strange_dust']
  var UU_OK_TYPES = ['gtceu:clarifier_purification_unit', 'gtceu:flocculation_purification_unit', 'gtceu:ozonation_purification_unit',
    'gtceu:ph_neutralization_purification_unit', 'gtceu:extreme_temperature_purification_unit',
    'gtceu:high_energy_laser_purification_unit', 'gtceu:space_pump']
  var VA_UV = 491520

  // the machines of the four addons that may be crafted after the audit
  var AUDITED = {}
  function audit(ns, names) { names.forEach(function (n) { AUDITED[ns + ':' + n] = true }) }
  // gtca:space_elevator is not here since v0.5.0: its controller recipe takes piko wafer ICs, which nothing in the pack makes, so
  // hidden.js removes that dead recipe and the elevator stays hidden until ZPM (hidden_until.json)
  audit('gtca', ['advanced_ebf', 'comet', 'isamill', 'flotation_cell_regulator', 'thermal_reactor', 'mega_lcr', 'mega_oil_cracking_unit',
    'nano_forge', 'pcb_factory_mki', 'pcb_factory_mkii', 'pcb_factory_mkiii', 'tegmark_forge'])
  ;['ev', 'iv', 'luv', 'zpm', 'uv', 'uhv'].forEach(function (t) { audit('gtca', [t + '_matter_fabricator']) })
  audit('gtnn', ['catalyst_hatch', 'circuit_assembly_line', 'large_dehydrator', 'large_naquadah_reactor', 'exxonmobil_chemical_plant',
    'maceration_stack_controller', 'neutron_activator', 'neutron_sensor'])
  ;['mv', 'hv', 'ev', 'iv', 'luv', 'zpm'].forEach(function (t) { audit('gtnn', [t + '_dehydrator']) })
  ;['ev', 'iv', 'luv', 'zpm'].forEach(function (t) { audit('gtnn', [t + '_naquadah_reactor']) })
  ;['ulv', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv'].forEach(function (t) { audit('gtnn', [t + '_neutron_accelerator']) })
  ;['ev', 'iv', 'luv'].forEach(function (t) { audit('gtnn', [t + '_rocket_engine']) })
  audit('gcyr', ['dyson_system_controller', 'rocket_scanner', 'space_elevator', 'space_station_packager'])
  ;['iv', 'luv', 'zpm', 'uv', 'uhv'].forEach(function (t) { audit('gcyr', [t + '_oxygen_spreader']) })
  ;['ulv', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv'].forEach(function (t) { audit('gtmutils', [t + '_64a_energy_converter']) })
  audit('gtmutils', ['expanded_me_pattern_buffer', 'expanded_me_pattern_buffer_proxy', 'me_tag_stocking_input_bus',
    'me_tag_stocking_input_hatch', 'web_hub', 'web_receiver'])

  var KEPT_IDS = [
    'gtceu:shaped/thermal_reactor', 'gtceu:thermal_reactor/crushed_to_muddy', 'gtceu:thermal_reactor/platinum_froth',
    'gtceu:isamill/platinum_crushed_tcball', 'gtceu:flotation_cell_regulator/platinum', 'gtceu:electrolyzer/neodox_to_neod',
    'gtceu:chemical_plant/spruce_oil_steam', 'gtceu:uu_matter_fabricator/uumatter_std', 'gtceu:plasma_generator/calcium_plasma',
    'gtceu:plasma_generator/helium', 'gtceu:shaped/advanced_ebf', 'gtceu:assembler/comet_controller',
    'gtceu:assembler/chemical_plant', 'gtceu:chemical_plant/hydrazine', 'gtceu:rocket_engine/rp_1_mixed_fuel', 'gtceu:shaped/rocket_engine_ev',
    'gtceu:shaped/dehydrator_mv', 'gtnn:assembly_line/circuit_assembly_line', 'gtceu:precision_assembly/neutron_activator',
    'gtceu:assembler/converter_64_a_lv', 'gtceu:assembler/omnibreaker', 'gtceu:assembler/me_tag_stocking_input_bus',
    'gtceuterminal:multi_structure_manager', 'gtceuterminal:dismantler', 'gtceuterminal:schematic_interface',
    'gtstoragedrawers:gtceu_rubber_full_drawers_1', 'gtstoragedrawers:gtceu_treated_trim',
    'grindless:static_fire/gcyr/basic_rocket_motor', 'grindless:assembler/gcyr/basic_fuel_tank', 'grindless:gcyr/rocket_scanner', 'gcyr:chemical_reactor/kapton_k',
    'gcyr:assembler/launch_pad', 'grindless:assembler/gcyr/space_fabric',
    'gtceu:steam_turbine/steam', 'gtceu:combustion_generator/diesel', 'gtceu:gas_turbine/methane',
    'gtceu:large_chemical_reactor/polyethylene_from_tetrachloride_oxygen', 'gtceu:pyrolyse_oven/log_to_creosote',
    'gtceu:coke_oven/coal_to_coke', 'gtceu:shaped/large_chemical_reactor',
    // rebuilt without its samarium (moon/offworld_only.js, offworld_only.json: samarium is Martian)
    'grindless:centrifuge/offworld_only/rare_earth_separation'
  ]

  var shipped = null
  var running = false
  var classes = null

  // ---------------------------------------------------------------- what the addons ship (before gtca.js / gtnn.js run)

  // This handler runs early (priority 100) in EVERY bench run that zips the overlay: an uncaught error here would abort the whole
  // recipes event (no pack script would change any recipe), so nothing may escape it.
  ServerEvents.recipes(function (event) {
    try {
      var types = {}
      REMOVED_TYPES.forEach(function (name) {
        var n = 0
        event.forEachRecipe({ type: 'gtceu:' + name }, function () { n++ })
        types[name] = n
      })
      var ids = {}
      REMOVED_IDS.forEach(function (id) {
        var found = false
        event.forEachRecipe({ id: id }, function () { found = true })
        ids[id] = found
      })
      var taps = 0
      event.forEachRecipe({ id: /^gtceu:(large_)?chemical_reactor\/pgs_from_[a-z]+(_p)?$/ }, function (r) {
        if (TAP_IDS.indexOf(String(r.getId())) >= 0 && String(r.json).indexOf('concentrated_platinum') >= 0) taps++
      })
      var uvNaq = 0
      event.forEachRecipe({ output: UV_NAQ }, function () { uvNaq++ })
      shipped = { types: types, ids: ids, taps: taps, uvNaq: uvNaq }
    } catch (e) {
      shipped = null
      console.error('[gg_test addon_gates_misc] could not count the addon recipes: ' + e)
    }
  })

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = TAG + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  // ---------------------------------------------------------------- helpers

  function lazy() {
    if (classes === null) {
      var Forge = Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      classes = {
        RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
        ArrayList: Java.loadClass('java.util.ArrayList'),
        GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
        GTRecipe: Java.loadClass('com.gregtechceu.gtceu.api.recipe.GTRecipe'),
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        Items: Forge.ITEMS,
        Fluids: Forge.FLUIDS,
        RecipeTypes: Forge.RECIPE_TYPES,
        Paintings: Forge.PAINTING_VARIANTS
      }
    }
    return classes
  }

  function rl(id) {
    return new (lazy().RL)(id)
  }

  function asArray(coll) {
    var list = new (lazy().ArrayList)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function tagItems(tag) {
    var set = {}
    asArray(Ingredient.of('#' + tag).getItemIds()).forEach(function (id) { set[String(id)] = true })
    return set
  }

  function itemId(stack) {
    return String(lazy().Items.getKey(stack.getItem()))
  }

  // item ids of an ingredient (a vanilla Ingredient or a GT SizedIngredient); this KubeJS hides Ingredient.getItems(), its own
  // getItemIds() works on every ingredient
  function ingredientIds(ing) {
    if (ing === null || ing === undefined) return []
    return asArray(ing.getItemIds()).map(function (id) { return String(id) }).filter(function (id) { return id !== 'minecraft:air' })
  }

  function amountOf(ing) {
    return ing.getAmount !== undefined ? Number(ing.getAmount()) : 1
  }

  function isGt(r) {
    return r instanceof lazy().GTRecipe
  }

  function outputIds(r, access) {
    var L = lazy()
    var out = []
    if (isGt(r)) {
      var contents = r.getOutputContents(L.ItemCap)
      for (var i = 0; i < contents.size(); i++) {
        var ids = ingredientIds(L.ItemCap.of(contents.get(i).content))
        for (var k = 0; k < ids.length; k++) out.push(ids[k])
      }
    } else {
      var res = r.getResultItem(access)
      if (res !== null && !res.isEmpty()) out.push(itemId(res))
    }
    return out
  }

  // the item inputs of a recipe: { ids, amount } per ingredient (GT: one per content; crafting: one per grid slot)
  function inputs(r) {
    var L = lazy()
    var out = []
    if (isGt(r)) {
      asArray(r.getInputContents(L.ItemCap)).forEach(function (c) {
        var ing = L.ItemCap.of(c.content)
        out.push({ ids: ingredientIds(ing), amount: amountOf(ing), chance: Number(c.chance) })
      })
    } else {
      asArray(r.getIngredients()).forEach(function (ing) { out.push({ ids: ingredientIds(ing), amount: 1, chance: 10000 }) })
    }
    return out.filter(function (e) { return e.ids.length > 0 })
  }

  function recipeEut(r) {
    if (!isGt(r)) return 0
    var eu = r.getInputEUt()
    return Number(eu.voltage()) * Number(eu.amperage())
  }

  // fluid ids of the fluid inputs of a GT recipe (a tag input gives every fluid of the tag)
  function fluidInputIds(r) {
    var L = lazy()
    var out = []
    asArray(r.getInputContents(L.FluidCap)).forEach(function (c) {
      var stacks = L.FluidCap.of(c.content).getStacks()
      for (var k = 0; k < stacks.length; k++) out.push(String(L.Fluids.getKey(stacks[k].getFluid())))
    })
    return out
  }

  function hasResearch(r) {
    var conds = r.conditions
    if (conds === null || conds === undefined) return false
    for (var i = 0; i < conds.size(); i++) {
      if (String(conds.get(i).getClass().getSimpleName()).indexOf('Research') >= 0) return true
    }
    return false
  }

  function present(rm, id) {
    return rm.byKey(rl(id)).isPresent()
  }

  function nsOf(id) {
    return String(id).split(':')[0]
  }

  // an ingredient whose every item is in the set (a tag of circuits of one tier)
  function within(entry, set) {
    if (entry.ids.length === 0) return false
    for (var i = 0; i < entry.ids.length; i++) if (!set[entry.ids[i]]) return false
    return true
  }

  function hasItem(list, id) {
    return list.some(function (e) { return e.ids.indexOf(id) >= 0 })
  }

  function describe(list) {
    return list.map(function (e) {
      var label = e.ids.length === 1 ? e.ids[0] : e.ids[0] + ' (+' + (e.ids.length - 1) + ')'
      return (e.amount > 1 ? e.amount + 'x ' : '') + label
    }).join(', ')
  }

  // ---------------------------------------------------------------- one pass over the live recipe manager

  function scan(server) {
    var L = lazy()
    var rm = server.getRecipeManager()
    var access = server.registryAccess()
    var result = { total: 0, byType: {}, byNs: {}, out: {}, uu: [], errors: 0, critical: 0, firstError: '' }
    var it = rm.getRecipes().iterator()
    while (it.hasNext()) {
      var r = it.next()
      var type = '?'
      result.total++
      try {
        type = String(L.RecipeTypes.getKey(r.getType()))
        result.byType[type] = (result.byType[type] || 0) + 1
        var ns = nsOf(r.getId())
        result.byNs[ns] = (result.byNs[ns] || 0) + 1
        var outs = outputIds(r, access)
        for (var i = 0; i < outs.length; i++) {
          if (!SCAN_NS[nsOf(outs[i])]) continue
          if (!result.out[outs[i]]) result.out[outs[i]] = []
          if (result.out[outs[i]].indexOf(r) < 0) result.out[outs[i]].push(r)
        }
        if (isGt(r) && fluidInputIds(r).indexOf(UU_FLUID) >= 0) result.uu.push({ r: r, type: type })
      } catch (e) {
        result.errors++
        if (type === 'minecraft:crafting' || isGt(r)) result.critical++
        if (result.firstError === '') result.firstError = String(r.getId()) + ': ' + e
      }
    }
    return result
  }

  function recipeIds(list) {
    return (list || []).map(function (r) { return String(r.getId()) })
  }

  function typeCount(rm, sc, id) {
    var type = lazy().GTRegistries.RECIPE_TYPES.get(rl(id))
    var viaType = type ? Number(rm.getAllRecipesFor(type).size()) : 0
    return Math.max(sc.byType[id] || 0, viaType)
  }

  // ---------------------------------------------------------------- checks

  function checkLoaded() {
    var L = lazy()
    var missingMods = MODS.filter(function (m) { return !Platform.isLoaded(m) })
    var types = REMOVED_TYPES.concat(['isamill', 'flotation_cell_regulator', 'thermal_reactor', 'chemical_plant'])
    var missingTypes = types.filter(function (t) { return !L.GTRegistries.RECIPE_TYPES.get(rl('gtceu:' + t)) })
    var machines = ['gtca:mega_lcr', 'gtca:mega_oil_cracking_unit', 'gtca:isamill', 'gtca:flotation_cell_regulator', 'gtca:thermal_reactor',
      STACK, 'gcyr:rocket_scanner', 'gtmutils:lv_64a_energy_converter']
    var missingMachines = machines.filter(function (m) { return !L.GTRegistries.MACHINES.get(rl(m)) })
    check('addons_loaded', missingMods.length === 0 && missingTypes.length === 0 && missingMachines.length === 0,
      'mods ' + (MODS.length - missingMods.length) + '/' + MODS.length + (missingMods.length > 0 ? ' (missing ' + missingMods.join(', ') + ')' : '') +
      '; recipe types ' + (types.length - missingTypes.length) + '/' + types.length + (missingTypes.length > 0 ? ' (missing ' + missingTypes.join(', ') + ')' : '') +
      '; machines ' + (machines.length - missingMachines.length) + '/' + machines.length + (missingMachines.length > 0 ? ' (missing ' + missingMachines.join(', ') + ')' : ''))
  }

  function checkShipped() {
    if (shipped === null) {
      check('addon_shipped', false, 'the recipes event of this script did not run')
      return
    }
    var emptyTypes = REMOVED_TYPES.filter(function (t) { return !(shipped.types[t] > 0) })
    var missingIds = REMOVED_IDS.filter(function (id) { return shipped.ids[id] !== true })
    check('addon_shipped', emptyTypes.length === 0 && missingIds.length === 0,
      'before the pack scripts: ' + REMOVED_TYPES.map(function (t) { return t + '=' + shipped.types[t] }).join(', ') + '; ids found ' +
      (REMOVED_IDS.length - missingIds.length) + '/' + REMOVED_IDS.length + '; GT-- pgs_from taps=' + shipped.taps + '/' + TAP_IDS.length +
      (shipped.taps === 0 ? ' (harder platinum line off?)' : '') +
      (emptyTypes.length > 0 ? ' | types without recipes: ' + emptyTypes.join(', ') : '') +
      (missingIds.length > 0 ? ' | ids not shipped: ' + missingIds.join(', ') : ''))
  }

  // a recipe of the manager that makes concentrated platinum (GT--'s version of a pgs_from id)
  function makesConcentratedPlatinum(r) {
    var L = lazy()
    var outs = asArray(r.getOutputContents(L.FluidCap))
    for (var i = 0; i < outs.length; i++) {
      var stacks = L.FluidCap.of(outs[i].content).getStacks()
      for (var k = 0; k < stacks.length; k++) {
        if (String(L.Fluids.getKey(stacks[k].getFluid())) === 'gtceu:concentrated_platinum') return true
      }
    }
    return false
  }

  function checkTaps(rm) {
    var still = []
    var gtm = []
    TAP_IDS.forEach(function (id) {
      var found = rm.byKey(rl(id))
      if (!found.isPresent()) return
      if (makesConcentratedPlatinum(found.get())) still.push(id)
      else gtm.push(id)
    })
    check('removed_pgs_taps', still.length === 0, 'GT-- taps before the pack scripts=' + (shipped !== null ? shipped.taps : '?') + ', in the manager now=' +
      still.length + ' (of ' + TAP_IDS.length + ' ids: ' + TAP_ORES.join(', ') + ', plain and _p, small and large reactor)' +
      (gtm.length > 0 ? '; GTM versions present (harder line off): ' + gtm.length : '') + (still.length > 0 ? ' | still there: ' + still.join(', ') : ''))
  }

  function checkStages(rm) {
    var missing = PLATLINE_STAGES.filter(function (id) { return !present(rm, id) })
    check('platline_stages', missing.length === 0, 'stage recipes of the platinum plant present ' + (PLATLINE_STAGES.length - missing.length) + '/' +
      PLATLINE_STAGES.length + ' (PGS centrifuge, sulfuric attack, dissolve, NH4Cl reactor, sifters, EBFs, Rh / Ru / Pd steps)' +
      (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
  }

  function checkRemovedTypes(rm, sc) {
    var bad = []
    var parts = []
    REMOVED_TYPES.forEach(function (name) {
      var n = typeCount(rm, sc, 'gtceu:' + name)
      parts.push(name + ' ' + (shipped !== null ? shipped.types[name] : '?') + ' -> ' + n)
      if (n !== 0) bad.push(name + '=' + n)
    })
    check('removed_types', bad.length === 0, parts.join(', ') + (bad.length > 0 ? ' | still there: ' + bad.join(', ') : ''))
  }

  function checkRemovedIds(rm) {
    var still = REMOVED_IDS.filter(function (id) { return present(rm, id) })
    check('removed_ids', still.length === 0, 'checked ' + REMOVED_IDS.length + ' ids (pahoehoe x3, plasma heat exchange, sh/hp steam, E85 x2, ' +
      'dimethyl ether x3, UU nether star x2 and amped UU, original mega / froth / maceration stack / scrap box / heat exchanger recipes)' +
      (still.length > 0 ? ' | still present: ' + still.join(', ') : ''))
  }

  function checkRemovedItems(sc) {
    var registered = REMOVED_ITEMS.filter(function (id) { return Item.exists(id) })
    var bad = []
    registered.forEach(function (id) {
      var list = sc.out[id]
      if (list && list.length > 0) bad.push(id + ' <= ' + recipeIds(list).join(', '))
    })
    check('removed_items', bad.length === 0 && registered.length === REMOVED_ITEMS.length, 'items checked=' + registered.length + '/' +
      REMOVED_ITEMS.length + ' registered' + (bad.length > 0 ? ' | still craftable: ' + bad.join(' ; ') : '; none is the output of any recipe'))
  }

  function checkHidden() {
    var hidden = tagItems('c:hidden_from_recipe_viewers')
    var registered = REMOVED_ITEMS.filter(function (id) { return Item.exists(id) })
    var missing = registered.filter(function (id) { return !hidden[id] })
    check('hidden', missing.length === 0, 'removed items in #c:hidden_from_recipe_viewers: ' + (registered.length - missing.length) + '/' +
      registered.length + (missing.length > 0 ? ' | not hidden: ' + missing.join(', ') : ''))
  }

  function checkMega(sc) {
    var iv = tagItems('gtceu:circuits/iv')
    var bad = []
    var parts = []
    MEGA.forEach(function (m) {
      var list = sc.out[m.output] || []
      if (list.length !== 1) {
        bad.push(m.output + ': ' + list.length + ' recipes (' + recipeIds(list).join(', ') + ')')
        return
      }
      var r = list[0]
      var ins = inputs(r)
      var eut = recipeEut(r)
      var problems = []
      if (!isGt(r)) problems.push('not a GT recipe')
      if (eut < VA_IV) problems.push(eut + ' EU/t')
      if (!hasItem(ins, 'gtceu:iv_machine_hull')) problems.push('no IV hull')
      if (!ins.some(function (e) { return within(e, iv) && e.amount >= 4 })) problems.push('no 4 IV circuits')
      if (!ins.some(function (e) { return e.ids.indexOf(m.machine) >= 0 && e.amount === 64 })) problems.push('not 64x ' + m.machine)
      parts.push(m.output + ' <= ' + r.getId() + ' (' + eut + ' EU/t: ' + describe(ins) + ')')
      if (problems.length > 0) bad.push(m.output + ': ' + problems.join(', '))
    })
    check('regate_mega', bad.length === 0, parts.join(' ; ') + (bad.length > 0 ? ' | ' + bad.join(' ; ') : ''))
  }

  function checkFroth(sc) {
    var zpm = tagItems('gtceu:circuits/zpm')
    var luv = tagItems('gtceu:circuits/luv')
    var bad = []
    var parts = []
    FROTH.forEach(function (f) {
      var list = sc.out[f.output] || []
      if (list.length !== 1) {
        bad.push(f.output + ': ' + list.length + ' recipes (' + recipeIds(list).join(', ') + ')')
        return
      }
      var r = list[0]
      var ins = inputs(r)
      var eut = recipeEut(r)
      var problems = []
      if (String(r.getId()) === f.from) problems.push('still the addon recipe ' + f.from)
      if (eut < VA_ZPM) problems.push(eut + ' EU/t')
      if (!hasItem(ins, 'gtceu:zpm_machine_hull')) problems.push('no ZPM hull')
      if (!ins.some(function (e) { return within(e, zpm) })) problems.push('no ZPM circuits')
      if (hasItem(ins, 'gtceu:luv_machine_hull') || hasItem(ins, 'gtceu:iv_machine_hull')) problems.push('LuV / IV hull left')
      if (ins.some(function (e) { return within(e, luv) })) problems.push('LuV circuits left')
      if (!hasResearch(r)) problems.push('research condition lost')
      parts.push(f.output + ' <= ' + r.getId() + ' (' + eut + ' EU/t, research ' + hasResearch(r) + ')')
      if (problems.length > 0) bad.push(f.output + ': ' + problems.join(', '))
    })
    check('regate_froth', bad.length === 0, parts.join(' ; ') + (bad.length > 0 ? ' | ' + bad.join(' ; ') : ''))
  }

  function checkMaceration(sc) {
    var iv = tagItems('gtceu:circuits/iv')
    var list = sc.out[STACK] || []
    if (list.length !== 1) {
      check('regate_maceration', false, STACK + ': ' + list.length + ' recipes (' + recipeIds(list).join(', ') + ')')
      return
    }
    var r = list[0]
    var ins = inputs(r)
    var problems = []
    if (!hasItem(ins, 'gtceu:iv_macerator')) problems.push('no IV macerator')
    if (!ins.some(function (e) { return within(e, iv) })) problems.push('no IV circuit')
    if (!hasItem(ins, 'gtceu:tungsten_steel_plate')) problems.push('no tungsten steel plate')
    if (hasItem(ins, 'gtceu:ev_macerator')) problems.push('EV macerator left')
    check('regate_maceration', problems.length === 0, STACK + ' <= ' + r.getId() + ' (' + describe(ins) + ')' +
      (problems.length > 0 ? ' | ' + problems.join(', ') : ''))
  }

  function checkUncraftable(sc) {
    var missing = NEVER.filter(function (id) { return !Item.exists(id) })
    var bad = []
    NEVER.forEach(function (id) {
      var list = sc.out[id]
      if (list && list.length > 0) bad.push(id + ' <= ' + recipeIds(list).join(', '))
    })
    check('uncraftable', bad.length === 0, 'items checked=' + (NEVER.length - missing.length) + '/' + NEVER.length + ' registered' +
      (missing.length > 0 ? ' (not registered: ' + missing.join(', ') + ')' : '') + '; ' + UV_NAQ + ' recipes before the pack scripts=' +
      (shipped !== null ? shipped.uvNaq : '?') +
      (bad.length > 0 ? ' | now craftable, audit first: ' + bad.join(' ; ') : '; none is the output of any recipe'))
  }

  function checkUu(rm, sc) {
    var bad = []
    var low = []
    sc.uu.forEach(function (e) {
      var id = String(e.r.getId())
      var eut = recipeEut(e.r)
      if (eut >= VA_UV) return
      if (UU_OK_IDS.indexOf(id) >= 0 || UU_OK_TYPES.indexOf(e.type) >= 0) {
        low.push(id + ' ' + eut)
        return
      }
      bad.push(id + ' (' + eut + ' EU/t)')
    })
    var fabricator = present(rm, 'gtceu:uu_matter_fabricator/uumatter_std')
    check('uu_consumers', bad.length === 0 && fabricator, 'recipes that eat UU matter=' + sc.uu.length + ', at UV or more=' +
      (sc.uu.length - low.length - bad.length) + ', audited below UV: ' + low.join(', ') + '; fabricator recipe kept=' + fabricator +
      (bad.length > 0 ? ' | below UV and not audited: ' + bad.join(', ') : ''))
  }

  function checkCraftableMachines(sc) {
    var L = lazy()
    var craftable = {}
    Object.keys(sc.out).forEach(function (id) {
      if (!MACHINE_NS[nsOf(id)]) return
      if (!L.GTRegistries.MACHINES.get(rl(id))) return
      craftable[id] = true
    })
    var extra = Object.keys(craftable).filter(function (id) { return !AUDITED[id] }).sort()
    var lost = Object.keys(AUDITED).filter(function (id) { return !craftable[id] }).sort()
    check('craftable_machines', extra.length === 0 && lost.length === 0, 'craftable addon machines=' + Object.keys(craftable).length +
      ' (audited ' + Object.keys(AUDITED).length + ')' + (extra.length > 0 ? ' | not audited: ' + extra.map(function (id) {
        return id + ' <= ' + recipeIds(sc.out[id]).slice(0, 2).join(', ')
      }).join(' ; ') : '') + (lost.length > 0 ? ' | no longer craftable: ' + lost.join(', ') : ''))
  }

  function checkKept(rm) {
    var missing = KEPT_IDS.filter(function (id) { return !present(rm, id) })
    check('kept', missing.length === 0, 'present ' + (KEPT_IDS.length - missing.length) + '/' + KEPT_IDS.length +
      ' (thermal reactor, froth line, UU fabricator, plasma for GTM turbine, GT-- plant / rocket fuel, gtmutils, terminals, GT drawers, GCYR, GTM fuels)' +
      (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
  }

  function noteHarderLines(rm, access) {
    var parts = []
    var ore = rm.byKey(rl('grindless:ore_processing/mv/platinum_water'))
    if (ore.isPresent()) {
      var outs = outputIds(ore.get(), access)
      var metal = outs.indexOf('gtceu:platinum_metal_dust') >= 0
      parts.push('grindless:ore_processing/mv/platinum_water -> ' + outs.join(', ') + (metal ? ' (GT-- OreReplace ACTIVE: platinum dust swapped for platinum metal dust)' : ''))
    } else {
      parts.push('grindless:ore_processing/mv/platinum_water not found')
    }
    var pgs = rm.byKey(rl('gtceu:centrifuge/pgs_separation'))
    if (pgs.isPresent()) parts.push('GTM pgs_separation item inputs=' + inputs(pgs.get()).length + ' (0 = emptied by GT--)')
    parts.push('kept on purpose: the EV platinum plant composes the live GT-- stages; config/gtnn.json still to set: makesEMIBetter=false, banCreateFanBlasting=true (with Create)')
    note('gtnn_harder_lines', parts.join(' ; '))
  }

  function noteRocket(rm) {
    var parts = []
    ;['grindless:gcyr/rocket_scanner', 'grindless:static_fire/gcyr/basic_rocket_motor', 'grindless:assembler/gcyr/basic_fuel_tank', 'gcyr:assembler/advanced_rocket_motor',
      'gcyr:assembler/advanced_fuel_tank', 'gcyr:assembler/elite_rocket_motor', 'grindless:assembler/gcyr/space_fabric',
      'gcyr:shaped/space_station_packager'].forEach(function (id) {
      var r = rm.byKey(rl(id))
      if (!r.isPresent()) {
        parts.push(id + ' missing')
        return
      }
      parts.push(id + (isGt(r.get()) ? ' ' + recipeEut(r.get()) + ' EU/t' : '') + ': ' + describe(inputs(r.get())))
    })
    note('gcyr_first_rocket', parts.join(' ; '))
  }

  function noteSmallAddons(sc) {
    var parts = ['gtmutils', 'gtceuterminal', 'gtstoragedrawers', 'greg_paintings', 'gtopt'].map(function (ns) { return ns + ' recipes=' + (sc.byNs[ns] || 0) })
    try {
      var paintings = asArray(lazy().Paintings.getKeys()).filter(function (k) { return String(k.getNamespace()) === 'greg_paintings' }).length
      parts.push('greg_paintings painting variants=' + paintings)
    } catch (e) {
      parts.push('painting variants unreadable: ' + e)
    }
    parts.push('client-only on this server: ' + CLIENT_ONLY.map(function (m) { return m + (Platform.isLoaded(m) ? ' loaded' : ' absent') }).join(', '))
    note('small_addons', parts.join('; '))
  }

  // ---------------------------------------------------------------- driver

  function step(name, fn) {
    try {
      fn()
    } catch (e) {
      check(name, false, 'exception: ' + e)
    }
  }

  function run(server) {
    var rm = server.getRecipeManager()
    var access = server.registryAccess()
    var t0 = Date.now()
    var sc = null
    step('addons_loaded', checkLoaded)
    step('addon_shipped', checkShipped)
    step('scan', function () {
      sc = scan(server)
      check('scan', sc.critical === 0, 'recipes=' + sc.total + ' read in ' + (Date.now() - t0) + ' ms; addon items made by some recipe=' +
        Object.keys(sc.out).length + '; unreadable=' + sc.errors + ' (GT or crafting: ' + sc.critical + ')' +
        (sc.errors > 0 ? '; first ' + sc.firstError : ''))
    })
    if (sc === null) return
    step('removed_types', function () { checkRemovedTypes(rm, sc) })
    step('removed_ids', function () { checkRemovedIds(rm) })
    step('removed_pgs_taps', function () { checkTaps(rm) })
    step('platline_stages', function () { checkStages(rm) })
    step('removed_items', function () { checkRemovedItems(sc) })
    step('hidden', checkHidden)
    step('regate_mega', function () { checkMega(sc) })
    step('regate_froth', function () { checkFroth(sc) })
    step('regate_maceration', function () { checkMaceration(sc) })
    step('uncraftable', function () { checkUncraftable(sc) })
    step('craftable_machines', function () { checkCraftableMachines(sc) })
    step('uu_consumers', function () { checkUu(rm, sc) })
    step('kept', function () { checkKept(rm) })
    step('gtnn_harder_lines', function () { noteHarderLines(rm, access) })
    step('gcyr_first_rocket', function () { noteRocket(rm) })
    step('small_addons', function () { noteSmallAddons(sc) })
  }

  function startIfRequested(server) {
    if (global[REQUEST] !== true || running) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    global[REQUEST] = false
    running = true
    try {
      run(server)
    } catch (e) {
      check('run', false, 'exception: ' + e)
    } finally {
      running = false
      console.info(TAG + SCOPE + '|DONE')
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
  })

  ServerEvents.customCommand('gg_test_addon_gates_misc', function (event) {
    if (running) {
      note('run', 'a previous gg_test_addon_gates_misc run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
