// priority: -224
// Gregtech Grindless - AE2 integration test (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped in the pack). Checks the final recipe set through the recipe manager.
//
//   powershell -NoProfile -ExecutionPolicy Bypass -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_ae2' -WaitForLog 'GGTEST\|ae2\|DONE@@300'
//
// Markers: GGTEST|ae2|<check>|PASS|FAIL|PENDING|NOTE|<detail>
//   items            every item id the integration uses is registered
//   config_ae2       AE2 config: no presses in meteorites
//   config_gtm       GTM config: EU<->FE converters enabled
//   converter        the LV 1A energy converter has a recipe
//   tag              #grindless:ae2/certus_quartz = AE2 crystal + GT gem, never the charged crystal
//   removed:<id>     a shortcut / replaced AE2 recipe is gone
//   no_cooking_silicon  no smelting/blasting/smoking/campfire recipe makes ae2:silicon
//   keeps            the conversion recipes (cable part <-> block) and a sample of untouched AE2 recipes remain
//   entry:<item>     the item has exactly ONE way to be made (+ allowed conversions), made by a GT machine of LV or
//                    lower: type, EU/t, machine, ingredients (listed). Ingredients must not ask for MV+ parts.
//   press:<name>     each of the four presses has a gtceu:forming_press recipe (steel plate + certus/diamond/gold/silicon)
//   silicon, sky_dust  PENDING until the Submerged Arc Furnace (gtceu:arc_smelting) recipes exist, then LV is checked
//   sky_stone        sky dust -> sky stone -> smooth sky stone are smelting recipes and the LV electric furnace reads them
//   charged_certus   AE2 charger (LV assembler) + LV polarizer
//   certus_crystal   the GT autoclave makes the AE2 crystal; GT's own gem recipes from the autoclave are gone
//   fluix            AE2's transform (Nether quartz) + LV mixer (quartzite dust)
//   quartz_tag, annihilation_core   the quartzite gem is in #ae2:all_nether_quartz, so AE2's annihilation core (needed
//                    by interface, pattern provider, molecular assembler...) has an LV way: sand -> quartzite
//   components_lv    the GT parts the recipes ask for are made at LV or lower
//   vibration_fuel   coke burns (ForgeHooks.getBurnTime > 0, what AE2's vibration chamber uses) and the chamber has an LV recipe
//   probe:<recipe>   a placed LV machine (setblock) finds every new GT recipe with GTM's own lookup (RecipeDB.find),
//                    also when a tag slot holds another member of its tag (AE2 crystal / GT gem, other circuits...)
//   ae2_unmade       NOTE: ae2 items nobody makes (creative / debug items, loot only)
//   DONE             last line
//
// Rhino: var + function everywhere (this Rhino throws "redeclaration of var" for const/let in repeated functions).
(function () {
  var TAG = 'GGTEST|ae2|'
  var LV_VOLTAGE = 32
  var TIER_RX = /(^|[:\/_])(mv|hv|ev|iv|luv|zpm|uv|uhv|uev|uiv|uxv|opv|max)([_\/]|$)/
  var COOKING = ['minecraft:smelting', 'minecraft:blasting', 'minecraft:smoking', 'minecraft:campfire_cooking']

  // item -> the recipe that must be its ONLY way (besides the conversions listed in ALLOWED_EXTRA)
  var ENTRIES = [
    { item: 'ae2:inscriber', type: 'gtceu:assembler', id: 'grindless:assembler/ae2/inscriber' },
    { item: 'ae2:charger', type: 'gtceu:assembler', id: 'grindless:assembler/ae2/charger' },
    { item: 'ae2:controller', type: 'gtceu:assembler', id: 'grindless:assembler/ae2/controller' },
    { item: 'ae2:drive', type: 'gtceu:assembler', id: 'grindless:assembler/ae2/drive' },
    { item: 'ae2:energy_acceptor', type: 'gtceu:assembler', id: 'grindless:assembler/ae2/energy_acceptor' },
    { item: 'ae2:molecular_assembler', type: 'gtceu:assembler', id: 'grindless:assembler/ae2/molecular_assembler' },
    { item: 'ae2:interface', type: 'gtceu:assembler', id: 'grindless:assembler/ae2/interface' },
    { item: 'ae2:pattern_provider', type: 'gtceu:assembler', id: 'grindless:assembler/ae2/pattern_provider' }
  ]
  var PRESSES = [
    { name: 'calculation_processor_press', id: 'grindless:forming_press/ae2/calculation_processor_press', needs: ['#forge:plates/steel', '#grindless:ae2/certus_quartz'] },
    { name: 'engineering_processor_press', id: 'grindless:forming_press/ae2/engineering_processor_press', needs: ['#forge:plates/steel', '#forge:gems/diamond'] },
    { name: 'logic_processor_press', id: 'grindless:forming_press/ae2/logic_processor_press', needs: ['#forge:plates/steel', '#forge:ingots/gold'] },
    { name: 'silicon_press', id: 'grindless:forming_press/ae2/silicon_press', needs: ['#forge:plates/steel', '#forge:silicon'] }
  ]
  // block recipes that are NOT a second way to make the block: converting the cable part back into the block
  var ALLOWED_EXTRA = {
    'ae2:energy_acceptor': ['ae2:network/blocks/energy_energy_acceptor_alt'],
    'ae2:interface': ['ae2:network/blocks/interfaces_interface_alt'],
    'ae2:pattern_provider': ['ae2:network/blocks/pattern_providers_interface_alt']
  }
  var REMOVED = [
    'ae2:smelting/silicon_from_certus_quartz_dust', 'ae2:blasting/silicon_from_certus_quartz_dust',
    'ae2:inscriber/silicon_press', 'ae2:inscriber/calculation_processor_press',
    'ae2:inscriber/engineering_processor_press', 'ae2:inscriber/logic_processor_press',
    'ae2:network/blocks/inscribers', 'ae2:network/blocks/crystal_processing_charger', 'ae2:network/blocks/controller',
    'ae2:network/blocks/storage_drive', 'ae2:network/blocks/energy_energy_acceptor',
    'ae2:network/crafting/molecular_assembler', 'ae2:network/blocks/interfaces_interface',
    'ae2:network/blocks/pattern_providers_interface',
    'ae2:inscriber/calculation_processor_print', 'ae2:charger/charged_certus_quartz_crystal', 'ae2:decorative/quartz_block',
    'gtceu:autoclave/autoclave_dust_certus_quartz_water', 'gtceu:autoclave/autoclave_dust_certus_quartz_distilled'
  ]
  var KEPT = [
    'ae2:network/blocks/energy_energy_acceptor_alt', 'ae2:network/blocks/interfaces_interface_alt',
    'ae2:network/blocks/interfaces_interface_part', 'ae2:network/blocks/pattern_providers_interface_alt',
    'ae2:network/blocks/pattern_providers_interface_part',
    // a sample of the AE2 recipes that must stay exactly as AE2 ships them
    'ae2:inscriber/silicon_print', 'ae2:inscriber/logic_processor', 'ae2:inscriber/engineering_processor',
    'ae2:inscriber/calculation_processor', 'ae2:inscriber/sky_stone_dust', 'ae2:inscriber/certus_quartz_dust',
    'ae2:blasting/sky_stone_block', 'ae2:smelting/smooth_sky_stone_block', 'ae2:transform/fluix_crystals',
    'ae2:network/cells/item_storage_cell_1k', 'ae2:network/cells/item_storage_components_cell_1k_part',
    'ae2:network/cables/glass_fluix', 'ae2:network/blocks/io_port', 'ae2:network/blocks/energy_vibration_chamber',
    'ae2:network/crafting/cpu_crafting_unit', 'ae2:network/parts/export_bus', 'ae2:materials/formationcore'
  ]
  // GT parts used by the new recipes: each needs at least one maker at LV or lower
  var GT_PARTS = ['gtceu:lv_machine_hull', 'gtceu:lv_electric_motor', 'gtceu:lv_electric_piston', 'gtceu:lv_robot_arm',
    'gtceu:tin_single_cable', 'gtceu:steel_plate', 'gtceu:basic_electronic_circuit']
  var ITEMS_USED = [
    'ae2:inscriber', 'ae2:charger', 'ae2:controller', 'ae2:drive', 'ae2:energy_acceptor', 'ae2:molecular_assembler',
    'ae2:interface', 'ae2:pattern_provider', 'ae2:calculation_processor_press', 'ae2:engineering_processor_press',
    'ae2:logic_processor_press', 'ae2:silicon_press', 'ae2:silicon', 'ae2:sky_dust', 'ae2:sky_stone_block',
    'ae2:smooth_sky_stone_block', 'ae2:certus_quartz_crystal', 'ae2:charged_certus_quartz_crystal',
    'ae2:fluix_crystal', 'ae2:engineering_processor', 'ae2:annihilation_core', 'ae2:formation_core',
    'ae2:fluix_glass_cable', 'ae2:quartz_glass', 'ae2:quartz_block', 'ae2:printed_calculation_processor',
    'gtceu:lv_machine_hull', 'gtceu:lv_electric_motor', 'gtceu:lv_electric_piston', 'gtceu:lv_robot_arm',
    'gtceu:tin_single_cable', 'gtceu:steel_plate', 'gtceu:certus_quartz_gem', 'gtceu:certus_quartz_dust',
    'gtceu:quartzite_dust', 'gtceu:quartzite_gem', 'gtceu:lv_assembler', 'gtceu:lv_forming_press', 'gtceu:lv_polarizer', 'gtceu:lv_mixer',
    'gtceu:lv_autoclave', 'gtceu:lv_electric_furnace', 'gtceu:lv_1a_energy_converter', 'minecraft:crafting_table',
    'minecraft:redstone', 'minecraft:diamond', 'minecraft:gold_ingot'
  ]

  var S = null
  var BI = null
  var ITEM_CAP = null
  var FLUID_CAP = null
  var GT_RECIPE = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 700)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(check, status, detail) {
    var line = TAG + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  function pending(name, detail) {
    emit(name, 'PENDING', detail)
  }

  function guarded(name, fn) {
    try {
      fn()
    } catch (e) {
      emit(name, 'FAIL', 'exception: ' + e)
    }
  }

  // ---------------------------------------------------------------- helpers

  function rl(id) {
    return new ResourceLocation(id)
  }

  function asArray(coll) {
    var AL = Java.loadClass('java.util.ArrayList')
    var list = new AL(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function hasRecipe(id) {
    return S.rm.byKey(rl(id)).isPresent()
  }

  function isGT(r) {
    return r instanceof GT_RECIPE
  }

  // Recipe type shown to people: GT recipes use the GT recipe type; everything else the serializer id (= the "type"
  // field of the recipe JSON: minecraft:smelting, ae2:inscriber...)
  function typeId(r) {
    if (isGT(r)) return String(r.recipeType.registryName)
    var key = BI.RECIPE_SERIALIZER.getKey(r.getSerializer())
    if (key !== null && key !== undefined) return String(key)
    var t = String(r.getType())
    return t.indexOf(':') < 0 ? 'minecraft:' + t : t
  }

  function itemId(stack) {
    return String(BI.ITEM.getKey(stack.getItem()))
  }

  // Ingredient -> the parsed JSON text of its description: "2x #forge:plates/steel", "gtceu:lv_machine_hull"...
  function ingText(j) {
    if (j === null || j === undefined) return '?'
    if (Array.isArray(j)) return '(' + j.map(ingText).join(' | ') + ')'
    if (j.type === 'gtceu:sized') return (j.count > 1 ? j.count + 'x ' : '') + ingText(j.ingredient)
    if (j.type === 'gtceu:circuit') return 'circuit(' + j.configuration + ')'
    if (j.item) return j.item
    if (j.tag) return '#' + j.tag
    return JSON.stringify(j)
  }

  // vanilla ingredient -> parsed JSON (null when this Ingredient subclass cannot be read from a script)
  function ingJson(ingredient) {
    try {
      return JSON.parse(String(ingredient.toJson()))
    } catch (e) {
      return null
    }
  }

  // GT recipe content -> parsed JSON through GTM's own serializer. SizedIngredient overrides Ingredient#getItems /
  // #toJson, and scripts cannot see those overrides (SRG names), so they are never called from here.
  function contentJson(cap, content) {
    return JSON.parse(String(cap.serializer.toJson(cap.of(content))))
  }

  function fluidText(j) {
    if (j === null || j === undefined) return 'fluid:?'
    var values = j.value
    var names = []
    if (Array.isArray(values)) {
      values.forEach(function (v) { names.push(v.tag ? '#' + v.tag : String(v.fluid)) })
    } else if (values) {
      names.push(values.tag ? '#' + values.tag : String(values.fluid))
    }
    return 'fluid:' + names.join('|') + ' ' + j.amount + 'mB'
  }

  // ---------------------------------------------------------------- recipe index and description

  function outputIds(r) {
    var ids = []
    if (isGT(r)) {
      var outs = asArray(r.getOutputContents(ITEM_CAP))
      for (var i = 0; i < outs.length; i++) {
        var found = String(ITEM_CAP.serializer.toJson(ITEM_CAP.of(outs[i].content))).match(/"item":"[^"]+"/g) || []
        for (var k = 0; k < found.length; k++) ids.push(found[k].substring(8, found[k].length - 1))
      }
    } else {
      var res = r.getResultItem(S.access)
      if (res !== null && !res.isEmpty()) ids.push(itemId(res))
    }
    return ids
  }

  function buildIndex() {
    var index = {}
    var all = asArray(S.rm.getRecipes())
    var errors = 0
    var firstError = ''
    for (var i = 0; i < all.length; i++) {
      try {
        var ids = outputIds(all[i])
        for (var k = 0; k < ids.length; k++) {
          if (!index[ids[k]]) index[ids[k]] = []
          index[ids[k]].push(all[i])
        }
      } catch (e) {
        errors++
        if (firstError === '') firstError = String(all[i].getId()) + ': ' + e
      }
    }
    S.index = index
    note('index', 'recipes=' + all.length + ' outputItems=' + Object.keys(index).length + ' unreadable=' + errors +
      (firstError !== '' ? ' first=' + firstError : ''))
  }

  function producersOf(item) {
    return S.index[item] || []
  }

  // { id, type, gt, voltage, amps, inputs[], fluids[], outputs[], machine }
  function describe(r) {
    var d = { id: String(r.getId()), type: typeId(r), gt: isGT(r), voltage: -1, amps: 0, inputs: [], fluids: [], outputs: [], machine: 'vanilla' }
    if (d.gt) {
      var ins = asArray(r.getInputContents(ITEM_CAP))
      for (var i = 0; i < ins.length; i++) {
        var text = ingText(contentJson(ITEM_CAP, ins[i].content))
        if (ins[i].chance === 0) text += ' (not consumed)'
        else if (ins[i].chance < 10000) text += ' @' + ins[i].chance
        d.inputs.push(text)
      }
      var fl = asArray(r.getInputContents(FLUID_CAP))
      for (var f = 0; f < fl.length; f++) d.fluids.push(fluidText(contentJson(FLUID_CAP, fl[f].content)))
      var outs = asArray(r.getOutputContents(ITEM_CAP))
      for (var o = 0; o < outs.length; o++) {
        var otext = ingText(contentJson(ITEM_CAP, outs[o].content))
        if (outs[o].chance < 10000) otext += ' @' + outs[o].chance
        d.outputs.push(otext)
      }
      var eu = r.getInputEUt()
      if (eu.isEmpty()) eu = r.getOutputEUt()
      d.voltage = Number(eu.voltage())
      d.amps = Number(eu.amperage())
      d.machine = machineFor(d.type)
    } else {
      var ings = asArray(r.getIngredients())
      for (var n = 0; n < ings.length; n++) d.inputs.push(ingText(ingJson(ings[n])))
      d.outputs = outputIds(r)
      d.machine = d.type === 'minecraft:crafting' || d.type.indexOf('crafting') >= 0 ? 'crafting table' : d.type
    }
    return d
  }

  // the LV (or lower) machine that runs a GT recipe type, or null
  function machineFor(type) {
    if (type.indexOf('gtceu:') !== 0) return null
    var name = type.substring(6)
    var candidates = ['gtceu:lv_' + name, 'gtceu:ulv_' + name, 'gtceu:' + name]
    if (name === 'arc_smelting') candidates = ['gtceu:submerged_arc_furnace']
    for (var i = 0; i < candidates.length; i++) {
      if (GTRegistries.MACHINES.get(rl(candidates[i])) !== null) return candidates[i]
    }
    return null
  }

  // the ingredient texts of a description that ask for an MV+ part
  function tierViolations(d) {
    var bad = []
    var tokens = d.inputs.join(' ').match(/#?[a-z0-9_.\-]+:[a-z0-9_.\-\/]+/g) || []
    tokens.forEach(function (t) {
      var path = t.substring(t.indexOf(':') + 1)
      if (TIER_RX.test(path)) bad.push(t)
    })
    return bad
  }

  // LV-or-lower: GT recipes need voltage <= 32 (any amperage) and an LV machine; every ingredient is LV or lower
  function lvProblems(d) {
    var problems = []
    if (d.gt) {
      if (d.voltage > LV_VOLTAGE) problems.push('voltage ' + d.voltage + ' EU/t is above LV')
      if (d.machine === null) problems.push('no LV machine runs ' + d.type)
    }
    tierViolations(d).forEach(function (t) { problems.push('MV+ ingredient ' + t) })
    return problems
  }

  function summary(d) {
    var s = d.type + ' ' + d.id
    if (d.gt) s += ' EUt=' + d.voltage + (d.amps > 1 ? 'x' + d.amps + 'A' : '') + ' machine=' + d.machine
    s += ' in=[' + d.inputs.join(', ') + ']'
    if (d.fluids.length > 0) s += ' fluids=[' + d.fluids.join(', ') + ']'
    s += ' out=[' + d.outputs.join(', ') + ']'
    return s
  }

  // ---------------------------------------------------------------- checks

  function checkItems() {
    var missing = ITEMS_USED.filter(function (id) { return !Item.exists(id) })
    check('items', missing.length === 0, 'count=' + ITEMS_USED.length + (missing.length > 0 ? ' missing=' + missing.join(',') : ''))
  }

  function checkConfigs() {
    guarded('config_ae2', function () {
      var AEConfig = Java.loadClass('appeng.core.AEConfig')
      var on = AEConfig.instance().isSpawnPressesInMeteoritesEnabled()
      check('config_ae2', on === false, 'spawnPressesInMeteorites=' + on)
    })
    guarded('config_gtm', function () {
      var Holder = Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder')
      var on = Holder.INSTANCE.compat.energy.enableFEConverters
      check('config_gtm', on === true, 'compat.energy.enableFEConverters=' + on + ' nativeEUToFE=' + Holder.INSTANCE.compat.energy.nativeEUToFE)
    })
    guarded('converter', function () {
      var list = producersOf('gtceu:lv_1a_energy_converter').map(describe)
      var ok = list.length > 0 && list.every(function (d) { return lvProblems(d).length === 0 })
      check('converter', ok, list.length === 0 ? 'no recipe for gtceu:lv_1a_energy_converter' : list.map(summary).join(' ;; '))
    })
  }

  function checkTag() {
    var ids = asArray(Ingredient.of('#grindless:ae2/certus_quartz').getItemIds()).map(String).sort()
    var want = ['ae2:certus_quartz_crystal', 'gtceu:certus_quartz_gem']
    check('tag', JSON.stringify(ids) === JSON.stringify(want), '#grindless:ae2/certus_quartz=' + ids.join(','))
  }

  function checkRemoved() {
    REMOVED.forEach(function (id) {
      var present = hasRecipe(id)
      check('removed:' + id, !present, present ? 'still present' : 'gone')
    })
    var cooking = producersOf('ae2:silicon').filter(function (r) { return COOKING.indexOf(typeId(r)) >= 0 })
    check('no_cooking_silicon', cooking.length === 0,
      cooking.length === 0 ? 'no cooking recipe makes ae2:silicon' : cooking.map(function (r) { return String(r.getId()) }).join(','))
  }

  function checkKept() {
    var missing = KEPT.filter(function (id) { return !hasRecipe(id) })
    check('keeps', missing.length === 0, 'checked=' + KEPT.length + (missing.length > 0 ? ' missing=' + missing.join(',') : ''))
  }

  // the item has exactly one way to be made (besides the allowed part -> block conversions): the expected GT recipe
  function checkEntry(e) {
    var name = 'entry:' + e.item
    guarded(name, function () {
      var extras = ALLOWED_EXTRA[e.item] || []
      var all = producersOf(e.item).map(describe)
      var main = all.filter(function (d) { return extras.indexOf(d.id) < 0 })
      var conv = all.filter(function (d) { return extras.indexOf(d.id) >= 0 })
      if (main.length !== 1) {
        emit(name, 'FAIL', 'expected exactly one recipe, found ' + main.length + ': ' + main.map(summary).join(' ;; '))
        return
      }
      var d = main[0]
      var problems = lvProblems(d)
      if (d.id !== e.id) problems.push('expected ' + e.id)
      if (d.type !== e.type) problems.push('expected type ' + e.type)
      var detail = summary(d) + (conv.length > 0 ? ' | conversions kept: ' + conv.map(function (c) { return c.id }).join(',') : '')
      if (problems.length > 0) emit(name, 'FAIL', problems.join('; ') + ' -> ' + detail)
      else emit(name, 'PASS', detail)
    })
  }

  function checkPress(p) {
    var name = 'press:' + p.name
    guarded(name, function () {
      var item = 'ae2:' + p.name
      var all = producersOf(item).map(describe)
      if (all.length !== 1) {
        emit(name, 'FAIL', 'expected exactly one recipe (no meteorite / copy recipe), found ' + all.length + ': ' + all.map(summary).join(' ;; '))
        return
      }
      var d = all[0]
      var problems = lvProblems(d)
      if (d.id !== p.id) problems.push('expected ' + p.id)
      if (d.type !== 'gtceu:forming_press') problems.push('not a forming press recipe')
      p.needs.forEach(function (need) {
        if (d.inputs.join(' ').indexOf(need) < 0) problems.push('missing input ' + need)
      })
      if (problems.length > 0) emit(name, 'FAIL', problems.join('; ') + ' -> ' + summary(d))
      else emit(name, 'PASS', summary(d))
    })
  }

  // arc furnace products: PENDING while the Submerged Arc Furnace recipes do not exist yet
  function checkArcProduct(item, label, allowedTypes) {
    guarded(label, function () {
      var all = producersOf(item).map(describe)
      var arc = all.filter(function (d) { return d.type === 'gtceu:arc_smelting' })
      var shortcuts = all.filter(function (d) { return COOKING.indexOf(d.type) >= 0 })
      if (shortcuts.length > 0) {
        emit(label, 'FAIL', 'shortcut recipes make ' + item + ': ' + shortcuts.map(summary).join(' ;; '))
        return
      }
      var others = all.filter(function (d) { return d.type !== 'gtceu:arc_smelting' && allowedTypes.indexOf(d.type) < 0 })
      if (others.length > 0) note(label, 'other makers of ' + item + ': ' + others.map(function (d) { return d.type + ' ' + d.id }).join(' ;; '))
      if (arc.length === 0) {
        var registered = GTRegistries.RECIPE_TYPES.get(rl('gtceu:arc_smelting')) !== null
        pending(label, (registered ? 'gtceu:arc_smelting is registered but has no recipe making ' : 'gtceu:arc_smelting is not registered yet; waiting for ') + item)
        return
      }
      var problems = []
      arc.forEach(function (d) { lvProblems(d).forEach(function (p) { problems.push(d.id + ': ' + p) }) })
      if (problems.length > 0) emit(label, 'FAIL', problems.join('; '))
      else emit(label, 'PASS', arc.map(summary).join(' ;; '))
    })
  }

  function checkSkyStone() {
    guarded('sky_stone', function () {
      var stone = producersOf('ae2:sky_stone_block').map(describe)
      var smooth = producersOf('ae2:smooth_sky_stone_block').map(describe)
      var okStone = stone.length === 1 && stone[0].type === 'minecraft:smelting' && stone[0].inputs.join(' ') === 'ae2:sky_dust'
      var okSmooth = smooth.length === 1 && smooth[0].type === 'minecraft:smelting' && smooth[0].inputs.join(' ') === 'ae2:sky_stone_block'
      var furnace = GTRegistries.RECIPE_TYPES.get(rl('gtceu:electric_furnace'))
      var proxies = []
      asArray(furnace.getProxyRecipes().keySet()).forEach(function (p) {
        var name = String(p)
        proxies.push(name.indexOf(':') < 0 ? 'minecraft:' + name : name)
      })
      var okFurnace = proxies.indexOf('minecraft:smelting') >= 0 && GTRegistries.MACHINES.get(rl('gtceu:lv_electric_furnace')) !== null
      var detail = 'sky_stone=[' + stone.map(function (d) { return d.id + ' ' + d.inputs.join(',') }).join(';') + '] smooth=[' +
        smooth.map(function (d) { return d.id + ' ' + d.inputs.join(',') }).join(';') + '] electric_furnace proxies=[' + proxies.join(',') + ']'
      check('sky_stone', okStone && okSmooth && okFurnace, detail)
    })
  }

  function checkChargedCertus() {
    guarded('charged_certus', function () {
      var all = producersOf('ae2:charged_certus_quartz_crystal').map(describe)
      var charger = all.filter(function (d) { return d.type === 'ae2:charger' })
      var polarizer = all.filter(function (d) { return d.type === 'gtceu:polarizer' })
      var problems = []
      if (charger.length !== 1) problems.push('AE2 charger recipes=' + charger.length)
      else if (charger[0].inputs.join(' ').indexOf('#grindless:ae2/certus_quartz') < 0) problems.push('charger recipe does not take the unified certus tag')
      if (polarizer.length !== 1) problems.push('polarizer recipes=' + polarizer.length)
      polarizer.forEach(function (d) { lvProblems(d).forEach(function (p) { problems.push(d.id + ': ' + p) }) })
      var chargerBlock = producersOf('ae2:charger').map(describe)
      if (chargerBlock.length !== 1 || lvProblems(chargerBlock[0]).length > 0) problems.push('the AE2 charger block is not made at LV')
      check('charged_certus', problems.length === 0,
        problems.length > 0 ? problems.join('; ') : 'ae2 charger: ' + summary(charger[0]) + ' ;; polarizer: ' + summary(polarizer[0]))
    })
  }

  function checkCertusCrystal() {
    guarded('certus_crystal', function () {
      var all = producersOf('ae2:certus_quartz_crystal').map(describe)
      var autoclave = all.filter(function (d) { return d.type === 'gtceu:autoclave' })
      var problems = []
      if (autoclave.length !== 2) problems.push('autoclave recipes making the AE2 crystal=' + autoclave.length + ' (expected water + distilled)')
      autoclave.forEach(function (d) { lvProblems(d).forEach(function (p) { problems.push(d.id + ': ' + p) }) })
      var gtGem = producersOf('gtceu:certus_quartz_gem').filter(function (r) { return typeId(r) === 'gtceu:autoclave' })
      if (gtGem.length > 0) problems.push('autoclave still makes the GT gem: ' + gtGem.map(function (r) { return String(r.getId()) }).join(','))
      check('certus_crystal', problems.length === 0,
        problems.length > 0 ? problems.join('; ') : autoclave.map(summary).join(' ;; '))
      var other = all.filter(function (d) { return d.type !== 'gtceu:autoclave' })
      if (other.length > 0) note('certus_crystal', 'other makers: ' + other.map(function (d) { return d.type + ' ' + d.id }).join(' ;; '))
    })
  }

  function checkFluix() {
    guarded('fluix', function () {
      var all = producersOf('ae2:fluix_crystal').map(describe)
      var mixer = all.filter(function (d) { return d.type === 'gtceu:mixer' })
      var transform = all.filter(function (d) { return d.type === 'ae2:transform' })
      var problems = []
      if (mixer.length !== 1) problems.push('mixer recipes=' + mixer.length)
      mixer.forEach(function (d) { lvProblems(d).forEach(function (p) { problems.push(d.id + ': ' + p) }) })
      check('fluix', problems.length === 0,
        problems.length > 0 ? problems.join('; ') : 'mixer: ' + summary(mixer[0]) + ' ;; AE2 in-world (needs Nether quartz): ' + transform.map(function (d) { return d.id }).join(','))
    })
  }

  // AE2's annihilation core (interface, pattern provider, molecular assembler, buses...) asks for #ae2:all_nether_quartz:
  // the quartzite gem joins that tag, and quartzite comes from sand (quartz sand -> centrifuge -> autoclave) at LV
  function checkQuartz() {
    guarded('quartz_tag', function () {
      var ids = asArray(Ingredient.of('#ae2:all_nether_quartz').getItemIds()).map(String).sort()
      var ok = ids.indexOf('gtceu:quartzite_gem') >= 0 && ids.indexOf('minecraft:quartz') >= 0
      check('quartz_tag', ok, '#ae2:all_nether_quartz=' + ids.join(','))
    })
    guarded('annihilation_core', function () {
      var cores = producersOf('ae2:annihilation_core').map(describe)
      var gem = producersOf('gtceu:quartzite_gem').map(describe).filter(function (d) { return d.type === 'gtceu:autoclave' && lvProblems(d).length === 0 })
      var dust = producersOf('gtceu:quartzite_dust').map(describe).filter(function (d) { return d.type === 'gtceu:centrifuge' && lvProblems(d).length === 0 })
      var problems = []
      if (cores.length !== 1) problems.push('recipes making the core=' + cores.length)
      else if (cores[0].inputs.join(' ').indexOf('#ae2:all_nether_quartz') < 0) problems.push('the core recipe does not take #ae2:all_nether_quartz')
      if (gem.length === 0) problems.push('no LV autoclave recipe makes the quartzite gem')
      if (dust.length === 0) problems.push('no LV centrifuge recipe makes quartzite dust')
      check('annihilation_core', problems.length === 0,
        problems.length > 0 ? problems.join('; ') : summary(cores[0]) + ' | gem: ' + gem[0].id + ' | dust: ' + dust[0].id)
    })
  }

  // every GT part the recipes ask for must have a maker at LV or lower (a crafting recipe or a GT recipe <= 32 V)
  function checkComponents() {
    guarded('components_lv', function () {
      var bad = []
      var lines = []
      GT_PARTS.forEach(function (item) {
        var made = producersOf(item).map(describe)
        var lv = made.filter(function (d) { return lvProblems(d).length === 0 })
        lines.push(item + '(' + lv.length + '/' + made.length + ')')
        if (lv.length === 0) bad.push(item)
      })
      check('components_lv', bad.length === 0, bad.length > 0 ? 'no LV maker for ' + bad.join(',') : lines.join(' '))
    })
  }

  // AE2 power at LV: the vibration chamber burns whatever ForgeHooks.getBurnTime accepts (coke from the coke oven line)
  function checkVibrationFuel() {
    guarded('vibration_fuel', function () {
      var Hooks = Java.loadClass('net.minecraftforge.common.ForgeHooks')
      var coke = Number(Hooks.getBurnTime(Item.of('gtceu:coke_gem'), null))
      var coal = Number(Hooks.getBurnTime(Item.of('minecraft:coal'), null))
      var chamber = producersOf('ae2:vibration_chamber').map(describe)
      var ok = coke > 0 && chamber.length === 1 && lvProblems(chamber[0]).length === 0
      check('vibration_fuel', ok, 'burn time coke=' + coke + ' coal=' + coal + (chamber.length > 0 ? ' chamber=' + chamber[0].id : ' no chamber recipe'))
    })
  }

  // ae2 items with no recipe at all (creative / debug / loot only): information for EMI orphans
  function listUnmade() {
    guarded('ae2_unmade', function () {
      var ids = []
      asArray(BI.ITEM.keySet()).forEach(function (k) {
        var id = String(k)
        if (id.indexOf('ae2:') === 0 && producersOf(id).length === 0) ids.push(id.substring(4))
      })
      ids.sort()
      note('ae2_unmade', ids.length + ' items: ' + ids.join(','))
    })
  }

  // ---------------------------------------------------------------- machine probes
  // The recipe lookup a placed LV machine really uses (RecipeDB.find on the machine) finds each new GT recipe from the
  // inputs the machine would hold, also when a tag slot holds another of its members (AE2 crystal / GT gem, AE2 / GT
  // certus dust, any LV circuit...). Blocks are placed in a loaded corner of the overworld and removed afterwards.

  var PROBE_IDS = [
    'grindless:autoclave/ae2/certus_quartz_crystal_water', 'grindless:autoclave/ae2/certus_quartz_crystal_distilled',
    'grindless:polarizer/ae2/charged_certus_quartz_crystal', 'grindless:mixer/ae2/fluix_crystal'
  ]
  var PROBE = { x: 64, y: 101, z: 64 }

  function machineAt(x, y, z) {
    return Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine').getMachine(S.level, new BlockPos(x, y, z))
  }

  // ingredient JSON -> { count, ids[] }: "2x #forge:plates/steel" -> the members of that tag
  function itemAlternatives(j) {
    var count = 1
    var inner = j
    if (j.type === 'gtceu:sized') {
      count = j.count
      inner = j.ingredient
    }
    var ids = []
    var options = Array.isArray(inner) ? inner : [inner]
    options.forEach(function (o) {
      if (o.item) ids.push(String(o.item))
      else if (o.tag) asArray(Ingredient.of('#' + o.tag).getItemIds()).forEach(function (id) { ids.push(String(id)) })
    })
    ids.sort()
    return { count: count, ids: ids }
  }

  function fluidAlternatives(j) {
    var ids = []
    var values = Array.isArray(j.value) ? j.value : [j.value]
    var Lists = Java.loadClass('com.google.common.collect.Lists')
    var TagKey = Java.loadClass('net.minecraft.tags.TagKey')
    var Registries = Java.loadClass('net.minecraft.core.registries.Registries')
    values.forEach(function (v) {
      if (v.fluid) {
        ids.push(String(v.fluid))
      } else if (v.tag) {
        var holders = asArray(Lists.newArrayList(BI.FLUID.getTagOrEmpty(TagKey.create(Registries.FLUID, rl(v.tag)))))
        holders.forEach(function (h) { ids.push(String(BI.FLUID.getKey(h.value()))) })
      }
    })
    ids.sort()
    return { amount: j.amount, ids: ids }
  }

  function clearInventory(inv) {
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
  }

  function probeRecipe(index, id) {
    var name = 'probe:' + id
    guarded(name, function () {
      var r = S.rm.byKey(rl(id)).get()
      var type = id.split(':')[1].split('/')[0]
      var machineId = 'gtceu:lv_' + type
      var x = PROBE.x + index
      var placed = S.server.runCommandSilent('setblock ' + x + ' ' + PROBE.y + ' ' + PROBE.z + ' ' + machineId + ' replace')
      var m = machineAt(x, PROBE.y, PROBE.z)
      if (placed < 1 || m === null || m === undefined) {
        emit(name, 'FAIL', 'could not place ' + machineId + ' (setblock=' + placed + ')')
        return
      }
      var items = asArray(r.getInputContents(ITEM_CAP)).map(function (c) { return itemAlternatives(contentJson(ITEM_CAP, c.content)) })
      var fluids = asArray(r.getInputContents(FLUID_CAP)).map(function (c) { return fluidAlternatives(contentJson(FLUID_CAP, c.content)) })
      var Action = Java.loadClass('net.minecraftforge.fluids.capability.IFluidHandler$FluidAction')
      fluids.forEach(function (f) {
        var filled = m.importFluids.fill(Fluid.of(f.ids[0], f.amount).getFluidStack(), Action.EXECUTE)
        if (filled < f.amount) throw new Error('only ' + filled + '/' + f.amount + ' mB of ' + f.ids[0] + ' fit the machine')
      })

      // case 0: the first member of every tag; then one case per slot with several members (that slot takes its last)
      var cases = [{ label: 'first', slot: -1 }]
      items.forEach(function (it, slot) {
        if (it.ids.length > 1) cases.push({ label: 'slot' + slot + '=' + it.ids[it.ids.length - 1], slot: slot })
      })
      var db = m.getRecipeType().db()
      var bad = []
      var inv = m.importItems
      cases.forEach(function (c) {
        clearInventory(inv)
        items.forEach(function (it, slot) {
          var pick = c.slot === slot ? it.ids[it.ids.length - 1] : it.ids[0]
          var left = inv.insertItem(slot, Item.of(pick, it.count), false)
          if (!left.isEmpty()) throw new Error('could not insert ' + pick + ' x' + it.count + ' into slot ' + slot)
        })
        var found = db.find(m)
        var got = found ? String(found.id) : 'none'
        if (got !== id) bad.push(c.label + ' -> ' + got)
      })
      clearInventory(inv)
      S.server.runCommandSilent('setblock ' + x + ' ' + PROBE.y + ' ' + PROBE.z + ' minecraft:air replace')
      check(name, bad.length === 0, machineId + ' cases=' + cases.length + (bad.length > 0 ? ' mismatches: ' + bad.join('; ') : ' all found'))
    })
  }

  function runProbes() {
    S.level = S.server.overworld()
    S.level.getChunk(4, 4)
    S.server.runCommandSilent('forceload add 64 64 79 79')
    S.server.runCommandSilent('fill 64 100 64 79 104 79 air')
    var ids = ENTRIES.map(function (e) { return e.id }).concat(PRESSES.map(function (p) { return p.id })).concat(PROBE_IDS)
    ids.forEach(function (id, index) { probeRecipe(index, id) })
    S.server.runCommandSilent('forceload remove 64 64 79 79')
  }

  function run(server) {
    S = { server: server, rm: server.getRecipeManager(), access: server.registryAccess(), index: {} }
    BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    ITEM_CAP = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
    FLUID_CAP = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
    GT_RECIPE = Java.loadClass('com.gregtechceu.gtceu.api.recipe.GTRecipe')

    guarded('items', checkItems)
    guarded('index', buildIndex)
    checkConfigs()
    guarded('tag', checkTag)
    guarded('removed', checkRemoved)
    guarded('keeps', checkKept)
    ENTRIES.forEach(checkEntry)
    PRESSES.forEach(checkPress)
    checkArcProduct('ae2:silicon', 'silicon', [])
    checkArcProduct('ae2:sky_dust', 'sky_dust', ['ae2:inscriber'])
    checkSkyStone()
    checkChargedCertus()
    checkCertusCrystal()
    checkFluix()
    checkQuartz()
    checkComponents()
    checkVibrationFuel()
    listUnmade()
    guarded('probes', runProbes)
    console.info(TAG + 'DONE')
  }

  ServerEvents.customCommand('gg_test_ae2', function (event) {
    try {
      run(event.server)
    } catch (e) {
      console.error(TAG + 'run|FAIL|exception: ' + e)
      console.info(TAG + 'DONE')
    }
    return 1
  })
})()
