// priority: 100
// Gregtech Grindless - recipe gates of GTM Extended Features (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack). Script under test: pack/kubejs/server_scripts/grindless/integration/extendedfeatures.js.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_addon_gates_ef' -WaitForLog 'GGTEST\|addon_gates_ef\|DONE@@900'
//
// Markers: GGTEST|addon_gates_ef|<check>|PASS|FAIL|<detail>, last line GGTEST|addon_gates_ef|DONE. Recipe checks only, no world
// building. Everything is read from the live recipe manager, except what the addon brought before the pack's scripts ran: this
// file has priority 100, so its recipes handler runs before extendedfeatures.js and counts the addon's own recipes.
//   addon_loaded         the addon's recipe types, Large Gas Collector and universal circuits are registered (else every "0 recipes"
//                        below would mean nothing); the other machines may be switched off in config/extendedfeatures.yaml
//   addon_shipped        the removed types came with recipes from the addon (so the zeros below are our removal, not a missing mod)
//   scan                 one pass over every recipe of the manager (item outputs of GT and crafting recipes) could read them all
//   removed_types        0 recipes of each removed type in the recipe manager
//   removed_ids          the named recipes are gone (platinum_processing_line, end_stone_processing, ...)
//   removed_controllers  no recipe of any type makes a removed controller
//   hidden               the removed controllers are in #c:hidden_from_recipe_viewers (hidden in EMI)
//   iv_gate              every recipe that makes a large machine (cracking, pyrolysis, expanded assembly line, gas collector) needs
//                        an IV-or-higher ingredient or runs at 7 680 EU/t or more
//   craftable_set        the only craftable items of the addon are the Large Gas Collector and the universal circuits: anything else
//                        that becomes craftable (a mod update, another script) has to be audited first
//   kept_universal_circuits, kept_large_gas_collector   what stays still exists and works as audited
//   gtm_intact           the GTM recipe types shared with the addon's machines and GTM's own rock / naquadah recipes are untouched
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'addon_gates_ef'
  var NS = 'extendedfeatures:'

  // Scripts can be reloaded right after the server is up; the command only leaves a request in `global` (it survives reloads) and
  // the tick handler starts the checks once these scripts have been loaded for QUIET_MS.
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestAddonGatesEfRequest'

  var REMOVED_TYPES = ['greenhouse_crop_recipes', 'greenhouse_wood_recipes', 'rock_processing_plant', 'chemical_skips',
    'component_disassembly', 'machine_disassembly']
  // recipes the addon ships for each removed type (machine_disassembly is built in Java on the fly and has none)
  var SHIPPED = { greenhouse_crop_recipes: 26, greenhouse_wood_recipes: 16, rock_processing_plant: 7, chemical_skips: 2, component_disassembly: 4 }
  var REMOVED_IDS = [
    'gtceu:chemical_skips/platinum_processing_line', 'gtceu:chemical_skips/naquadah_processing_line',
    'gtceu:rock_processing_plant/end_stone_processing', 'gtceu:rock_processing_plant/netherrack_processing',
    'gtceu:rock_processing_plant/deepslate_processing', 'gtceu:rock_processing_plant/obsidian_processing',
    'gtceu:rock_processing_plant/granite_processing', 'gtceu:rock_processing_plant/diorite_processing',
    'gtceu:rock_processing_plant/andesite_processing',
    'gtceu:component_disassembly/mk1_casing', 'gtceu:component_disassembly/mk2_casing', 'gtceu:component_disassembly/mk3_casing',
    'gtceu:component_disassembly/fusion_coil',
    'gtceu:greenhouse_crop_recipes/wheat', 'gtceu:greenhouse_crop_recipes/sugar_cane_boosted',
    'gtceu:greenhouse_wood_recipes/oak_sapling', 'gtceu:greenhouse_wood_recipes/rubber_sapling_boosted'
  ]
  var REMOVED_CONTROLLERS = ['industrial_greenhouse', 'advanced_conservatory', 'rock_processing_plant', 'synthesis_vessel',
    'universal_disassembly_machine', 'robust_alloy_materializer']
  var IV_GATED = ['large_cracking_machine', 'large_pyrolysis_oven', 'expanded_assembly_line', 'large_gas_collector']
  // the Large Gas Collector must be there; the other machines may be switched off in config/extendedfeatures.yaml (MultiblocksConfig)
  var OPTIONAL_MACHINES = ['large_cracking_machine', 'large_pyrolysis_oven', 'expanded_assembly_line', 'matrix_data_relay', 'power_transformer']
  var CIRCUIT_TIERS = ['ulv', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv']
  var IV_UP = ['iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv']
  var IV_PART = /^gtceu:(iv|luv|zpm|uv|uhv|uev|uiv|uxv|opv)_/
  var VA_IV = 7680
  var GTM_TYPES = ['gtceu:cracker', 'gtceu:pyrolyse_oven', 'gtceu:alloy_blast_smelter', 'gtceu:assembly_line', 'gtceu:gas_collector']
  // v0.5.0: GTM's end stone dust separation is replaced by grindless:centrifuge/offworld_only/endstone_separation (no tungstate
  // until Mars, moon/offworld_only.js); netherrack separation is still GTM's own
  var GTM_IDS = ['grindless:centrifuge/offworld_only/endstone_separation', 'gtceu:centrifuge/netherrack_separation',
    'gtceu:large_chemical_reactor/naquadah_separation', 'gtceu:shaped/blast_alloy_smelter', 'gtceu:shaped/cracking_unit']

  var shipped = null
  var running = false
  var classes = null

  // ---------------------------------------------------------------- what the addon ships (before extendedfeatures.js runs)

  ServerEvents.recipes(function (event) {
    var counts = {}
    REMOVED_TYPES.forEach(function (name) {
      var n = 0
      event.forEachRecipe({ type: NS + name }, function () { n++ })
      counts[name] = n
    })
    shipped = counts
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
        Items: Forge.ITEMS,
        RecipeTypes: Forge.RECIPE_TYPES
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

  // item ids of an ingredient (a vanilla Ingredient or a GT SizedIngredient). This KubeJS hides Ingredient.getItems() ("Cannot find
  // function getItems"); its own getItemIds() works on every ingredient.
  function ingredientIds(ing) {
    if (ing === null || ing === undefined) return []
    return asArray(ing.getItemIds()).map(function (id) { return String(id) }).filter(function (id) { return id !== 'minecraft:air' })
  }

  // the count of a GT SizedIngredient (1 for anything else)
  function amountOf(ing) {
    return ing.getAmount !== undefined ? Number(ing.getAmount()) : 1
  }

  function isGt(r) {
    return r instanceof lazy().GTRecipe
  }

  // item ids a recipe makes (GT recipes: the item outputs; everything else: the result item). Hot path of the scan: the Java
  // lists are read in place.
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

  // the item inputs of a recipe as lists of item ids (one list per ingredient)
  function inputLists(r) {
    var L = lazy()
    var out = []
    if (isGt(r)) {
      asArray(r.getInputContents(L.ItemCap)).forEach(function (c) { out.push(ingredientIds(L.ItemCap.of(c.content))) })
    } else {
      asArray(r.getIngredients()).forEach(function (ing) { out.push(ingredientIds(ing)) })
    }
    return out.filter(function (ids) { return ids.length > 0 })
  }

  function recipeEut(r) {
    if (!isGt(r)) return 0
    var eu = r.getInputEUt()
    return Number(eu.voltage()) * Number(eu.amperage())
  }

  function present(rm, id) {
    return rm.byKey(rl(id)).isPresent()
  }

  // ---------------------------------------------------------------- one pass over the live recipe manager

  // Every recipe is read; one that cannot be read is counted by type. Unreadable GT or crafting recipes (the two kinds that make
  // machine controllers) make the `scan` check fail, since an addon output could hide in them.
  function scan(server) {
    var L = lazy()
    var rm = server.getRecipeManager()
    var access = server.registryAccess()
    var result = { total: 0, byType: {}, efOut: {}, errors: 0, critical: 0, errTypes: {}, firstError: '' }
    var it = rm.getRecipes().iterator()
    while (it.hasNext()) {
      var r = it.next()
      var type = '?'
      result.total++
      try {
        type = String(L.RecipeTypes.getKey(r.getType()))
        result.byType[type] = (result.byType[type] || 0) + 1
        var outs = outputIds(r, access)
        for (var i = 0; i < outs.length; i++) {
          if (outs[i].indexOf(NS) !== 0) continue
          if (!result.efOut[outs[i]]) result.efOut[outs[i]] = []
          if (result.efOut[outs[i]].indexOf(r) < 0) result.efOut[outs[i]].push(r)
        }
      } catch (e) {
        result.errors++
        result.errTypes[type] = (result.errTypes[type] || 0) + 1
        if (type === 'minecraft:crafting' || isGt(r)) result.critical++
        if (result.firstError === '') result.firstError = String(r.getId()) + ': ' + e
      }
    }
    return result
  }

  function recipeIds(list) {
    return (list || []).map(function (r) { return String(r.getId()) })
  }

  // recipes of a type: the larger of the scan count and GTM's own lookup (two independent readings of the same manager)
  function typeCount(rm, sc, id) {
    var type = lazy().GTRegistries.RECIPE_TYPES.get(rl(id))
    var viaType = type ? Number(rm.getAllRecipesFor(type).size()) : 0
    return Math.max(sc.byType[id] || 0, viaType)
  }

  // ---------------------------------------------------------------- checks

  function checkLoaded() {
    var L = lazy()
    var types = REMOVED_TYPES.concat(['gas_collection'])
    var missingTypes = types.filter(function (t) { return !L.GTRegistries.RECIPE_TYPES.get(rl(NS + t)) })
    var collector = !!L.GTRegistries.MACHINES.get(rl(NS + 'large_gas_collector'))
    var missingCircuits = CIRCUIT_TIERS.filter(function (t) { return !Item.exists(NS + t + '_universal_circuit') })
    var optional = OPTIONAL_MACHINES.filter(function (m) { return !!L.GTRegistries.MACHINES.get(rl(NS + m)) })
    var registeredRemoved = REMOVED_CONTROLLERS.filter(function (m) { return !!L.GTRegistries.MACHINES.get(rl(NS + m)) })
    check('addon_loaded', missingTypes.length === 0 && collector && missingCircuits.length === 0,
      'recipe types ' + (types.length - missingTypes.length) + '/' + types.length + ' registered' +
      (missingTypes.length > 0 ? ' (missing ' + missingTypes.join(', ') + ')' : '') +
      '; large_gas_collector ' + (collector ? 'registered' : 'missing') +
      '; universal circuits ' + (CIRCUIT_TIERS.length - missingCircuits.length) + '/' + CIRCUIT_TIERS.length +
      '; registered (config/extendedfeatures.yaml can switch them off): other machines ' + optional.length + '/' + OPTIONAL_MACHINES.length +
      ', removed controllers ' + registeredRemoved.length + '/' + REMOVED_CONTROLLERS.length)
  }

  function checkShipped() {
    if (shipped === null) {
      check('addon_shipped', false, 'the recipes event of this script did not run')
      return
    }
    var fewer = []
    var parts = []
    Object.keys(SHIPPED).forEach(function (name) {
      var n = shipped[name] || 0
      parts.push(name + '=' + n)
      if (n < SHIPPED[name]) fewer.push(name + ' ' + n + ' < ' + SHIPPED[name])
    })
    parts.push('machine_disassembly=' + (shipped.machine_disassembly || 0) + ' (built in Java)')
    check('addon_shipped', fewer.length === 0, 'addon recipes before extendedfeatures.js: ' + parts.join(', ') +
      (fewer.length > 0 ? ' | fewer than audited: ' + fewer.join(', ') : ''))
  }

  function checkRemovedTypes(rm, sc) {
    var bad = []
    var parts = []
    REMOVED_TYPES.forEach(function (name) {
      var n = typeCount(rm, sc, NS + name)
      parts.push(name + ' ' + (shipped !== null ? (shipped[name] || 0) : '?') + ' -> ' + n)
      if (n !== 0) bad.push(name + '=' + n)
    })
    check('removed_types', bad.length === 0, parts.join(', ') + (bad.length > 0 ? ' | still there: ' + bad.join(', ') : ''))
  }

  function checkRemovedIds(rm) {
    var still = REMOVED_IDS.filter(function (id) { return present(rm, id) })
    check('removed_ids', still.length === 0, 'checked ' + REMOVED_IDS.length + ' ids (platinum_processing_line, naquadah_processing_line, ' +
      'end_stone_processing and the other rock recipes, fusion disassembly, greenhouse samples)' +
      (still.length > 0 ? ' | still present: ' + still.join(', ') : ''))
  }

  function checkRemovedControllers(sc) {
    var bad = []
    REMOVED_CONTROLLERS.forEach(function (name) {
      var list = sc.efOut[NS + name]
      if (list && list.length > 0) bad.push(name + ' <= ' + recipeIds(list).join(', '))
    })
    check('removed_controllers', bad.length === 0, 'controllers checked=' + REMOVED_CONTROLLERS.length + ' (' + REMOVED_CONTROLLERS.join(', ') + ')' +
      (bad.length > 0 ? ' | still craftable: ' + bad.join(' ; ') : ' none is the output of any recipe'))
  }

  function checkHidden() {
    var hidden = tagItems('c:hidden_from_recipe_viewers')
    var registered = REMOVED_CONTROLLERS.filter(function (name) { return Item.exists(NS + name) })
    var missing = registered.filter(function (name) { return !hidden[NS + name] })
    check('hidden', missing.length === 0, 'removed controllers in #c:hidden_from_recipe_viewers: ' + (registered.length - missing.length) + '/' +
      registered.length + (missing.length > 0 ? ' | not hidden: ' + missing.join(', ') : ''))
  }

  function checkIvGate(sc) {
    var ivSet = {}
    IV_UP.forEach(function (t) {
      var s = tagItems('gtceu:circuits/' + t)
      Object.keys(s).forEach(function (id) { ivSet[id] = true })
    })
    function ivIngredient(ids) {
      for (var i = 0; i < ids.length; i++) {
        if (!ivSet[ids[i]] && !IV_PART.test(ids[i])) return false
      }
      return ids.length > 0
    }
    var bad = []
    var parts = []
    IV_GATED.forEach(function (name) {
      var list = sc.efOut[NS + name] || []
      if (list.length === 0) {
        parts.push(name + ': uncraftable')
        return
      }
      list.forEach(function (r) {
        var lists = inputLists(r)
        var gates = []
        lists.forEach(function (ids) {
          if (!ivIngredient(ids)) return
          var label = ids.length === 1 ? ids[0] : ids[0] + ' (+' + (ids.length - 1) + ' of the same tag)'
          if (gates.indexOf(label) < 0) gates.push(label)
        })
        var eut = recipeEut(r)
        var ok = gates.length > 0 || eut >= VA_IV
        parts.push(name + ' <= ' + r.getId() + ': ' + (ok ? 'IV via ' + (gates.length > 0 ? gates.join(', ') : eut + ' EU/t') : 'no IV ingredient'))
        if (!ok) bad.push(name + ' <= ' + r.getId())
      })
    })
    check('iv_gate', bad.length === 0, parts.join(' ; ') + (bad.length > 0 ? ' | below IV: ' + bad.join(', ') : ''))
  }

  function checkCraftableSet(sc) {
    var expected = {}
    expected[NS + 'large_gas_collector'] = true
    CIRCUIT_TIERS.forEach(function (t) { expected[NS + t + '_universal_circuit'] = true })
    var extra = []
    Object.keys(sc.efOut).sort().forEach(function (id) {
      if (!expected[id]) extra.push(id + ' <= ' + recipeIds(sc.efOut[id]).slice(0, 3).join(', '))
    })
    var lost = Object.keys(expected).filter(function (id) { return !sc.efOut[id] })
    check('craftable_set', extra.length === 0 && lost.length === 0, 'craftable addon items=' + Object.keys(sc.efOut).length +
      ' (expected ' + Object.keys(expected).length + ': large_gas_collector + ' + CIRCUIT_TIERS.length + ' universal circuits)' +
      (extra.length > 0 ? ' | not audited: ' + extra.join(' ; ') : '') + (lost.length > 0 ? ' | no longer craftable: ' + lost.join(', ') : ''))
  }

  function checkUniversalCircuits(rm) {
    var L = lazy()
    var bad = []
    CIRCUIT_TIERS.forEach(function (t) {
      var item = NS + t + '_universal_circuit'
      var tag = 'gtceu:circuits/' + t
      if (!Item.exists(item)) { bad.push(item + ' missing'); return }
      var inTag = tagItems(tag)
      if (!inTag[item]) bad.push(item + ' not in #' + tag)
      var found = rm.byKey(rl('gtceu:assembler/' + t + '_universal_circuit'))
      if (!found.isPresent()) { bad.push('gtceu:assembler/' + t + '_universal_circuit missing'); return }
      var r = found.get()
      // the recipe also holds programmed circuit 16, which is not consumed (chance 0): only consumed inputs count
      var ins = asArray(r.getInputContents(L.ItemCap)).filter(function (c) { return Number(c.chance) !== 0 })
      var outs = asArray(r.getOutputContents(L.ItemCap))
      var inIng = ins.length === 1 ? L.ItemCap.of(ins[0].content) : null
      var outIng = outs.length === 1 ? L.ItemCap.of(outs[0].content) : null
      var inIds = ingredientIds(inIng)
      var outIds = ingredientIds(outIng)
      var inOk = inIds.length > 0 && amountOf(inIng) === 1 && inIds.every(function (id) { return inTag[id] === true })
      var outOk = outIds.length === 1 && outIds[0] === item && amountOf(outIng) === 1
      if (!inOk || !outOk) {
        bad.push(t + ': recipe is not 1 #' + tag + ' -> 1 ' + item + ' (in ' + inIds.length + ' ids x' + (inIng ? amountOf(inIng) : 0) +
          ', out ' + outIds.join('/') + ' x' + (outIng ? amountOf(outIng) : 0) + ')')
      }
    })
    check('kept_universal_circuits', bad.length === 0, CIRCUIT_TIERS.length + ' tiers: item, #gtceu:circuits/<tier> tag and a 1:1 assembler recipe' +
      (bad.length > 0 ? ' | ' + bad.join(' ; ') : ''))
  }

  function checkLargeGasCollector(rm, sc) {
    var L = lazy()
    var problems = []
    if (!L.GTRegistries.MACHINES.get(rl(NS + 'large_gas_collector'))) problems.push('machine not registered')
    if (!present(rm, 'gtceu:shaped/large_gas_collector')) problems.push('gtceu:shaped/large_gas_collector missing')
    var gas = typeCount(rm, sc, NS + 'gas_collection')
    if (gas !== 3) problems.push('gas_collection recipes=' + gas + ' (expected 3: air, nether air, ender air)')
    check('kept_large_gas_collector', problems.length === 0, 'controller recipe gtceu:shaped/large_gas_collector, gas_collection recipes=' + gas +
      (problems.length > 0 ? ' | ' + problems.join(' ; ') : ''))
  }

  // the scan must see GTM's types under their own ids too, or every "0 recipes" of removed_types could be a reading problem
  function checkGtmIntact(rm, sc) {
    var empty = GTM_TYPES.filter(function (t) { return !(sc.byType[t] > 0) || !(typeCount(rm, sc, t) > 0) })
    var missing = GTM_IDS.filter(function (id) { return !present(rm, id) })
    check('gtm_intact', empty.length === 0 && missing.length === 0,
      GTM_TYPES.map(function (t) { return t.replace('gtceu:', '') + '=' + (sc.byType[t] || 0) }).join(', ') + '; ' + GTM_IDS.length + ' GTM recipe ids present' +
      (empty.length > 0 ? ' | empty types: ' + empty.join(', ') : '') + (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
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
    var t0 = Date.now()
    var sc = null
    step('addon_loaded', checkLoaded)
    step('addon_shipped', checkShipped)
    step('scan', function () {
      sc = scan(server)
      var errTypes = Object.keys(sc.errTypes).sort(function (a, b) { return sc.errTypes[b] - sc.errTypes[a] })
        .slice(0, 6).map(function (t) { return t + '=' + sc.errTypes[t] })
      check('scan', sc.critical === 0, 'recipes=' + sc.total + ' read in ' + (Date.now() - t0) + ' ms; addon items made by some recipe=' +
        Object.keys(sc.efOut).length + '; unreadable=' + sc.errors + ' (GT or crafting: ' + sc.critical + ')' +
        (sc.errors > 0 ? ' by type ' + errTypes.join(', ') + '; first ' + sc.firstError : ''))
    })
    if (sc === null) return
    step('removed_types', function () { checkRemovedTypes(rm, sc) })
    step('removed_ids', function () { checkRemovedIds(rm) })
    step('removed_controllers', function () { checkRemovedControllers(sc) })
    step('hidden', checkHidden)
    step('iv_gate', function () { checkIvGate(sc) })
    step('craftable_set', function () { checkCraftableSet(sc) })
    step('kept_universal_circuits', function () { checkUniversalCircuits(rm) })
    step('kept_large_gas_collector', function () { checkLargeGasCollector(rm, sc) })
    step('gtm_intact', function () { checkGtmIntact(rm, sc) })
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

  ServerEvents.customCommand('gg_test_addon_gates_ef', function (event) {
    global[REQUEST] = true
    return 1
  })
})()
