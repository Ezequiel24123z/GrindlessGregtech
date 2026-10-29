// priority: -5824
// Gregtech Grindless - smoke test of the Moon (v0.5.0). TEST-ONLY overlay: copied over the instance on the test PC, never shipped.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_moon' -WaitForLog 'GGTEST\|moon\|DONE@@900'
//
// Markers: GGTEST|<scope>|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|moon|DONE. Scopes: moon, lunar_drill@moon,
// lunar_drill@earth.
//   static (no world)
//     registry, tables, lunar_recipes, crafting   the Lunar Drill, gtceu:lunar_drilling, the lunar samples and seed and their recipes
//     worldgen          GTM's live vein registry: no GCYR vein, the lunar vein only in gcyr:luna, the End bauxite vein without
//                       ilmenite, the removeFromWorld veins of veins_excluded.json gone
//     offworld          data/grindless/tables/offworld_only.json applied (stripped recipes rebuilt without the outputs, removed ones gone)
//     earth_titanium, earth_helium3, earth_mars   every loaded recipe that gives a watched resource of another world
//                       (offworld_only.json worlds.<world>.watched: titanium-bearing items and helium-3 for the Moon; tungsten,
//                       samarium and deuterium for Mars) takes one, or only runs off Earth (dimension condition), or is recycling,
//                       or is a late line of allowedLate
//     byproducts        no ore but ilmenite, rutile and titanium has a titanium byproduct (GTM builds every ore chain from them)
//     end_mv            the End is MV: vanadium steel bit recipes under mv/, no titanium or tungsten ore, the eye bath and the blaze at MV
//     bees, bees_mars   Productive Bees combs of the Moon's (titanium, ilmenite) and Mars' (tungsten, scheelite, tungstate)
//                       materials only process in their own world
//     planets           GCYR: a tier 1 rocket reaches the Moon and nothing else
//     travel_config     Waystones and FTB Essentials: crossing dimensions allowed and free, 10 homes
//   in the world: the Earth band X 2816..2879, Y 98..112, Z 0..15 and, on the Moon, the same X and Z at Y 198..214
//     moon_ores         generated lunar chunks hold the lunar vein's ores and no other ore
//     lunar_drill@moon  DESCRIPTION / PLACED / FORMED / PATTERN / PREVIEW, then PROCESS_ilmenite, PROCESS_regolith (helium-3, by day)
//                       and PROCESS_earth_power: the same ilmenite run with no energy but what comes from Earth through the bridge
//     lunar_drill@earth the same drill on Earth: forms, never runs (gcyr:luna condition)
//     bridge_*          AE2 quantum bridges on Earth and on the Moon: an Earth pair is pushed out of the lunar chamber, the Earth-Moon
//                       pair comes out of AE2's explosion ritual with the lunar seed, items and fluids cross, an EU P2P carries Earth
//                       power to the lunar drill, and after unlinking the items stay on the Moon
//     waystone_*        a waystone on each side: a living entity crosses to the Moon and back
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'moon'
  var STEP = 10
  var FORM_TIMEOUT = 300
  var TEST_TIMEOUT = 6000
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestMoonRequest'

  var EARTH = 'minecraft:overworld'
  var LUNA = 'gcyr:luna'
  var BAND = { x0: 2816, x1: 2879, z0: 0, z1: 15 }

  var PART_BLOCKS = {
    energy_input: 'gtceu:hv_energy_input_hatch',
    input_bus: 'gtceu:hv_input_bus',
    output_bus: 'gtceu:hv_output_bus',
    input_hatch: 'gtceu:hv_input_hatch',
    output_hatch: 'gtceu:hv_output_hatch'
  }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var DRILL = 'gtceu:lunar_drill'
  var BIT = 'grindless:stainless_steel_drill_bit'
  var SAMPLE_ILMENITE = 'grindless:vein_sample_ilmenite_moon'
  var SAMPLE_REGOLITH = 'grindless:vein_sample_regolith_moon'
  var SEED = 'grindless:lunar_quantum_seed'
  var HE3 = 'gtceu:helium_3'
  var SINGULARITY = 'ae2:singularity'
  var ENTANGLED = 'ae2:quantum_entangled_singularity'
  var PAIR_KEY = 'grindless_planet'

  var S = null
  var J = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3500)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(scope, name, status, detail) {
    var line = TAG + scope + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(scope, name, ok, detail) {
    emit(scope, name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(scope, name, detail) {
    emit(scope, name, 'NOTE', detail)
  }

  function guarded(name, fn) {
    try {
      fn()
    } catch (e) {
      check(SCOPE, name, false, 'exception: ' + e)
    }
  }

  // ---------------------------------------------------------------- Java

  function lazy() {
    if (J !== null) return J
    J = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      Direction: Java.loadClass('net.minecraft.core.Direction'),
      AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
      Vec3: Java.loadClass('net.minecraft.world.phys.Vec3'),
      BlockHitResult: Java.loadClass('net.minecraft.world.phys.BlockHitResult'),
      Hand: Java.loadClass('net.minecraft.world.InteractionHand'),
      UseOnContext: Java.loadClass('net.minecraft.world.item.context.UseOnContext'),
      ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity'),
      ArmorStand: Java.loadClass('net.minecraft.world.entity.decoration.ArmorStand'),
      EntityType: Java.loadClass('net.minecraft.world.entity.EntityType'),
      CompoundTag: Java.loadClass('net.minecraft.nbt.CompoundTag'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      FakePlayers: Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      GTRecipe: Java.loadClass('com.gregtechceu.gtceu.api.recipe.GTRecipe'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
      FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
      GTCEuAPI: Java.loadClass('com.gregtechceu.gtceu.api.GTCEuAPI'),
      PropertyKey: Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.material.properties.PropertyKey'),
      GTCaps: Java.loadClass('com.gregtechceu.gtceu.api.capability.GTCapabilityHelper')
    }
    return J
  }

  // AE2 and GCYR classes, loaded on first use (a missing class only fails the checks that need it)
  var AE = null
  function ae() {
    if (AE !== null) return AE
    AE = {
      QBE: Java.loadClass('appeng.blockentity.qnb.QuantumBridgeBlockEntity'),
      PartHelper: Java.loadClass('appeng.api.parts.PartHelper'),
      P2PService: Java.loadClass('appeng.me.service.P2PService'),
      SettingsFrom: Java.loadClass('appeng.util.SettingsFrom'),
      AEItemKey: Java.loadClass('appeng.api.stacks.AEItemKey'),
      AEFluidKey: Java.loadClass('appeng.api.stacks.AEFluidKey'),
      Actionable: Java.loadClass('appeng.api.config.Actionable'),
      ActionSource: Java.loadClass('appeng.api.networking.security.IActionSource'),
      TransformLogic: Java.loadClass('appeng.recipes.transform.TransformLogic')
    }
    return AE
  }

  function asArray(coll) {
    if (coll === null || coll === undefined) return []
    var list = new (lazy().ArrayList)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function rl(id) {
    return new (lazy().RL)(id)
  }

  function bp(x, y, z) {
    return new (lazy().BlockPos)(x, y, z)
  }

  function levelOf(id) {
    return S.server.getLevel(String(id))
  }

  function cmd(dim, text) {
    return S.server.runCommandSilent('execute in ' + dim + ' run ' + text)
  }

  function blockIdAt(level, x, y, z) {
    return String(level.getBlock(x, y, z).getId())
  }

  function machineAt(level, p) {
    return lazy().MetaMachine.getMachine(level, bp(p.x, p.y, p.z))
  }

  function itemIdOf(stack) {
    return String(lazy().BI.ITEM.getKey(stack.getItem()))
  }

  // KubeJS shows getLevel() / getDimension() as the properties entity.level and level.dimension
  function dimOf(entity) {
    var l = entity.level
    var level = typeof l === 'function' ? entity.level() : l
    var d = level.dimension
    return String(typeof d === 'function' ? level.dimension().location() : d)
  }

  function itemSummary(counts) {
    return Object.keys(counts).map(function (k) { return k.replace(/^[a-z_]+:/, '') + 'x' + counts[k] }).join(' ')
  }

  // ---------------------------------------------------------------- recipes

  function byId(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  function isGT(r) {
    return r instanceof lazy().GTRecipe
  }

  // GT recipe content -> JSON text through GTM's own serializer (scripts cannot see the overrides of SizedIngredient)
  function contentText(cap, content) {
    return String(cap.serializer.toJson(cap.of(content)))
  }

  function gtTexts(r, cap, output) {
    var list = output ? asArray(r.getOutputContents(cap)) : asArray(r.getInputContents(cap))
    return list.map(function (c) { return contentText(cap, c.content) })
  }

  function gtItemsOut(r) {
    return gtTexts(r, lazy().ItemCap, true)
  }

  function gtFluidsOut(r) {
    return gtTexts(r, lazy().FluidCap, true)
  }

  function gtInputsText(r) {
    return gtTexts(r, lazy().ItemCap, false).concat(gtTexts(r, lazy().FluidCap, false)).join(' ')
  }

  function ingredientsText(r) {
    var out = []
    asArray(r.getIngredients()).forEach(function (ing) {
      try {
        out.push(String(ing.toJson()))
      } catch (e) {
        out.push('?')
      }
    })
    return out.join(' ')
  }

  function conditionsText(r) {
    var out = []
    asArray(r.conditions).forEach(function (c) {
      try {
        out.push(String(c.serialize()))
      } catch (e) {
        var t = String(c.getClass().getSimpleName())
        try {
          t += ':"' + c.getDimension().location() + '"'
        } catch (e2) { /* not a dimension condition */ }
        out.push(t)
      }
    })
    return out.join(',')
  }

  function eutOf(r) {
    var eu = r.getInputEUt()
    return Number(eu.voltage()) * Number(eu.amperage())
  }

  function recipesOfType(typeId) {
    var type = lazy().GTRegistries.RECIPE_TYPES.get(rl(typeId))
    return type ? asArray(S.server.getRecipeManager().getAllRecipesFor(type)) : []
  }

  // ---------------------------------------------------------------- static checks

  function lunarVeins() {
    var M = global.grindless.moon
    return M && typeof M.lunarVeins === 'function' ? M.lunarVeins() : []
  }

  function lunarVein(id) {
    var list = lunarVeins().filter(function (v) { return v.id === id })
    if (list.length === 0) throw new Error('no lunar vein ' + id)
    return list[0]
  }

  function lunarRecipeId(veinId) {
    var M = global.grindless.moon
    var key = M && M.drilling ? M.drilling.bitKey : 'stainless_steel'
    return 'grindless:lunar_drilling/' + veinId + '_' + key
  }

  function checkRegistry() {
    var L = lazy()
    var missing = []
    ;[SAMPLE_ILMENITE, SAMPLE_REGOLITH, SEED, BIT, 'grindless:empty_vein_probe'].forEach(function (id) {
      if (!Item.exists(id)) missing.push('item ' + id)
    })
    if (!L.GTRegistries.MACHINES.get(rl(DRILL))) missing.push('machine ' + DRILL)
    if (!L.GTRegistries.RECIPE_TYPES.get(rl('gtceu:lunar_drilling'))) missing.push('recipe type gtceu:lunar_drilling')
    if (!Fluid.exists(HE3)) missing.push('fluid ' + HE3)
    var lunarTag = asArray(Ingredient.of('#grindless:lunar_vein_samples').getItemIds()).map(String)
    var sampleTag = asArray(Ingredient.of('#grindless:vein_samples').getItemIds()).map(String)
    ;[SAMPLE_ILMENITE, SAMPLE_REGOLITH].forEach(function (id) {
      if (lunarTag.indexOf(id) < 0) missing.push(id + ' not in #grindless:lunar_vein_samples')
      if (sampleTag.indexOf(id) < 0) missing.push(id + ' not in #grindless:vein_samples')
    })
    check(SCOPE, 'registry', missing.length === 0, missing.length > 0 ? 'missing: ' + missing.join(', ') :
      'Lunar Drill, gtceu:lunar_drilling, 2 lunar samples (both tags), lunar quantum seed, helium-3')
  }

  function checkTables() {
    var M = global.grindless.moon || {}
    var problems = typeof M.checkTables === 'function' ? M.checkTables() : ['global.grindless.moon.checkTables is missing']
    var veins = lunarVeins()
    check(SCOPE, 'tables', problems.length === 0 && veins.length === 2,
      veins.map(function (v) { return v.id + ' (' + v.kind + ') sample ' + v.samplePair.join('+').replace(/#forge:raw_materials\//g, 'raw ') }).join('; ') +
      (problems.length > 0 ? ' problems=' + problems.join(' | ') : ''))
  }

  function checkLunarRecipes() {
    var all = recipesOfType('gtceu:lunar_drilling')
    var bad = []
    var details = []
    lunarVeins().forEach(function (v) {
      var id = lunarRecipeId(v.id)
      var r = byId(id)
      if (r === null) {
        bad.push('missing ' + id)
        return
      }
      var conds = conditionsText(r)
      if (conds.indexOf('"' + LUNA + '"') < 0) bad.push(id + ' has no ' + LUNA + ' condition')
      if (v.kind === 'volatiles') {
        if (!/daytime/i.test(conds)) bad.push(id + ' has no daytime condition')
        if (gtFluidsOut(r).join(' ').indexOf('"' + HE3 + '"') < 0) bad.push(id + ' gives no helium-3')
      } else if (gtItemsOut(r).join(' ').indexOf('"gtceu:raw_ilmenite"') < 0) {
        bad.push(id + ' gives no raw ilmenite')
      }
      details.push(id + ' ' + eutOf(r) + ' EU/t ' + r.duration + ' t conditions=' + conds)
    })
    check(SCOPE, 'lunar_recipes', all.length === lunarVeins().length && bad.length === 0,
      'recipes of the type=' + all.length + ' ' + details.join(' ; ') + (bad.length > 0 ? ' problems=' + bad.join(' | ') : ''))
  }

  function checkCrafting() {
    var ids = ['grindless:assembler/lunar_drill', 'grindless:crafting/vein_sample/ilmenite_moon', 'grindless:crafting/vein_sample/regolith_moon',
      'grindless:chemical_reactor/lunar_quantum_seed', 'grindless:transform/lunar_entangled_singularity']
    var missing = ids.filter(function (id) { return byId(id) === null })
    var seed = byId('grindless:chemical_reactor/lunar_quantum_seed')
    var seedConds = seed !== null ? conditionsText(seed) : ''
    var seedIn = seed !== null ? gtInputsText(seed) : ''
    var transform = byId('grindless:transform/lunar_entangled_singularity')
    var result = transform !== null ? transform.getResultItem(S.server.registryAccess()) : null
    var tag = result !== null ? result.getNbt() : null
    var mark = tag !== null && tag.contains(PAIR_KEY) ? String(tag.getString(PAIR_KEY)) : ''
    var ok = missing.length === 0 && seedConds.indexOf('"' + LUNA + '"') >= 0 && seedIn.indexOf(HE3) >= 0 && mark === 'moon' &&
      result.getCount() === 2 && itemIdOf(result) === ENTANGLED
    check(SCOPE, 'crafting', ok, 'recipes=' + (ids.length - missing.length) + '/' + ids.length +
      (missing.length > 0 ? ' missing=' + missing.join(',') : '') + ' seed conditions=' + seedConds + ' seed inputs=' + seedIn +
      ' ritual result=' + (result !== null ? result.getCount() + 'x ' + itemIdOf(result) + ' ' + tag : 'none'))
  }

  function checkWorldgen() {
    var L = lazy()
    var G = global.grindless
    var keys = asArray(L.GTRegistries.ORE_VEINS.keys()).map(String)
    var gcyr = keys.filter(function (k) { return k.indexOf('gcyr:') === 0 })
    var ours = lunarVeins().filter(function (v) { return v.kind === 'ore' }).map(function (v) { return v.gtm })
    var inLuna = []
    var details = []
    keys.forEach(function (k) {
      var def = L.GTRegistries.ORE_VEINS.get(rl(k))
      var dims = asArray(def.dimensionFilter()).map(function (d) { return String(d.location()) })
      if (dims.indexOf(LUNA) < 0) return
      inLuna.push(k)
      var mats = []
      try {
        mats = asArray(def.veinGenerator().getAllMaterials()).map(function (m) { return String(m.getName()) })
      } catch (e) { /* no generator */ }
      details.push(k + ' dims=' + dims.join(',') + ' layer=' + def.layer().getSerializedName() + ' materials=' + mats.join(','))
    })
    var strangers = inLuna.filter(function (k) { return ours.indexOf(k) < 0 })
    var missingOurs = ours.filter(function (k) { return inLuna.indexOf(k) < 0 })
    var bauxite = L.GTRegistries.ORE_VEINS.get(rl('gtceu:bauxite_vein_end'))
    var bauxiteMats = []
    try {
      bauxiteMats = asArray(bauxite.veinGenerator().getAllMaterials()).map(function (m) { return String(m.getName()) })
    } catch (e) { /* missing */ }
    var gone = (G.readJsonTable('kubejs/data/grindless/tables/veins_excluded.json').veins || [])
      .filter(function (v) { return v.removeFromWorld === true }).map(function (v) { return v.id })
    var still = gone.filter(function (id) { return keys.indexOf(id) >= 0 })
    var ok = gcyr.length === 0 && strangers.length === 0 && missingOurs.length === 0 && bauxiteMats.length > 0 &&
      bauxiteMats.indexOf('ilmenite') < 0 && still.length === 0
    check(SCOPE, 'worldgen', ok, details.join(' ; ') + ' | gcyr veins=' + (gcyr.length > 0 ? gcyr.join(',') : 'none') +
      (strangers.length > 0 ? ' other veins in luna=' + strangers.join(',') : '') +
      (missingOurs.length > 0 ? ' missing=' + missingOurs.join(',') : '') +
      ' | gtceu:bauxite_vein_end materials=' + bauxiteMats.join(',') + ' | removed from the world: ' + gone.join(',') +
      (still.length > 0 ? ' still registered: ' + still.join(',') : ''))
  }

  function checkOffworld() {
    var G = global.grindless
    var report = G.moon ? G.moon.offworldOnly : null
    var table = G.readJsonTable('kubejs/data/grindless/tables/offworld_only.json')
    var bad = []
    var notes = []
    if (!report) {
      check(SCOPE, 'offworld', false, 'global.grindless.moon.offworldOnly is missing (moon/offworld_only.js did not run)')
      return
    }
    table.strip.forEach(function (s) {
      if (report.missing.indexOf(s.recipe) >= 0) {
        notes.push(s.recipe + ' not in this pack')
        return
      }
      if (byId(s.recipe) !== null) bad.push(s.recipe + ' still there')
      var entry = report.stripped.filter(function (e) { return e.from === s.recipe })[0]
      if (!entry) {
        bad.push(s.recipe + ' not rebuilt')
        return
      }
      var rebuilt = byId(entry.to)
      if (rebuilt === null) {
        bad.push(entry.to + ' missing')
        return
      }
      var outs = gtItemsOut(rebuilt).join(' ') + ' ' + gtFluidsOut(rebuilt).join(' ')
      ;(s.outputs || []).concat(s.fluids || []).forEach(function (o) {
        if (outs.indexOf('"' + o + '"') >= 0) bad.push(entry.to + ' still gives ' + o)
      })
      notes.push(entry.to + ' (-' + (s.outputs || []).concat(s.fluids || []).join(',') + ')')
    })
    table.remove.forEach(function (x) {
      if (byId(x.recipe) !== null) bad.push(x.recipe + ' still there')
    })
    if (report.failed.length > 0) bad.push('could not rebuild: ' + report.failed.join('; '))
    check(SCOPE, 'offworld', bad.length === 0, 'stripped ' + report.stripped.length + '/' + table.strip.length + ', removed ' +
      report.removed.length + '/' + table.remove.length + ': ' + notes.join(' ; ') + (bad.length > 0 ? ' problems=' + bad.join(' | ') : ''))
  }

  // every loaded recipe that gives a watched output of another world (offworld_only.json worlds.<world>.watched: the Moon's
  // titanium-bearing items and helium-3; Mars' tungsten, samarium and deuterium) without one going in and without a condition that
  // keeps it off Earth is a leak, unless allowedLate names it
  function earthScan() {
    var L = lazy()
    var G = global.grindless
    var table = G.readJsonTable('kubejs/data/grindless/tables/offworld_only.json')
    var planets = G.readJsonTable('kubejs/data/grindless/tables/planets.json').planets
    var offEarth = []
    Object.keys(planets).forEach(function (k) {
      if (k !== 'earth') planets[k].dimensions.forEach(function (d) { offEarth.push('"' + d + '"') })
    })
    var worlds = Object.keys(table.worlds).map(function (name) {
      var w = table.worlds[name].watched
      return {
        name: name,
        idRe: new RegExp('"(' + w.items.concat(w.fluids).map(function (x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }).join('|') + ')"', 'g'),
        inputRe: new RegExp(w.inputPattern),
        count: { watched: 0, offEarth: 0, processing: 0, recycling: 0, late: 0 },
        leaks: []
      }
    })
    var late = table.allowedLate.map(function (a) { return new RegExp(a.pattern) })
    var access = S.server.registryAccess()
    var all = asArray(S.server.getRecipeManager().getRecipes())
    var count = { recipes: all.length, gt: 0, unreadable: 0 }
    var firstError = ''
    var materials = {}
    asArray(L.GTCEuAPI.materialManager.getRegisteredMaterials()).forEach(function (m) { materials[String(m.getName())] = m })
    var recyclingId = /^gtceu:(macerator\/macerate_|arc_furnace\/arc_|extractor\/extract_)/
    // GT's own recycling (a part or a machine back to its materials) and the decomposition of an alloy (a material with no ore) give
    // back what went in: not a source. GTM names decompositions decomposition_<kind>__<material>, GT Community Additions with one
    // underscore (decomposition_electrolyzing_end_steel: End Steel is mixed from tungsten dust)
    function recycling(r, id) {
      var cat = ''
      try {
        cat = String(r.recipeCategory)
      } catch (e) { /* no category */ }
      if (/recycling/.test(cat) || recyclingId.test(id)) return true
      var dec = id.match(/decomposition_(?:centrifuging|electrolyzing)__?([a-z0-9_]+)$/)
      if (dec === null) return false
      var mat = materials[dec[1]]
      return mat !== undefined && !mat.hasProperty(L.PropertyKey.ORE)
    }
    for (var i = 0; i < all.length; i++) {
      var r = all[i]
      var id = String(r.getId())
      try {
        var gt = isGT(r)
        var outText = ''
        if (gt) {
          count.gt++
          outText = gtItemsOut(r).join(' ') + ' ' + gtFluidsOut(r).join(' ')
        } else {
          var res = r.getResultItem(access)
          if (res !== null && !res.isEmpty()) outText = '"' + itemIdOf(res) + '"'
        }
        // read lazily, at most once per recipe, and only for a recipe with a watched output
        var conds = null
        var inputs = null
        var isRecycling = null
        var isLate = null
        for (var w = 0; w < worlds.length; w++) {
          var W = worlds[w]
          var found = outText.match(W.idRe)
          if (!found) continue
          W.count.watched++
          if (gt) {
            if (conds === null) conds = conditionsText(r)
            if (offEarth.some(function (d) { return conds.indexOf(d) >= 0 })) {
              W.count.offEarth++
              continue
            }
          }
          if (inputs === null) inputs = gt ? gtInputsText(r) : ingredientsText(r)
          if (W.inputRe.test(inputs)) {
            W.count.processing++
            continue
          }
          if (gt) {
            if (isRecycling === null) isRecycling = recycling(r, id)
            if (isRecycling) {
              W.count.recycling++
              continue
            }
          }
          if (isLate === null) isLate = late.some(function (re) { return re.test(id) })
          if (isLate) {
            W.count.late++
            continue
          }
          W.leaks.push({ id: id, what: found.map(function (f) { return f.replace(/"/g, '') }).filter(function (v, k, a) { return a.indexOf(v) === k }) })
        }
      } catch (e) {
        count.unreadable++
        if (firstError === '') firstError = id + ': ' + e
      }
    }
    var head = 'recipes=' + count.recipes + ' (GT ' + count.gt + '), unreadable=' + count.unreadable + (firstError !== '' ? ' first=' + firstError : '')
    function countsOf(W) {
      return W.name + ' with a watched output=' + W.count.watched + ': off Earth ' + W.count.offEarth + ', processing ' + W.count.processing +
        ', recycling ' + W.count.recycling + ', late ' + W.count.late
    }
    function lines(list) {
      return list.map(function (l) { return l.id + ' -> ' + l.what.join(',') })
    }
    worlds.forEach(function (W) {
      if (W.name === 'moon') {
        // the Moon keeps its two checks: titanium-bearing outputs and helium-3
        var helium = W.leaks.filter(function (l) { return l.what.some(function (x) { return x === HE3 }) })
        var titanium = W.leaks.filter(function (l) { return l.what.some(function (x) { return x !== HE3 }) })
        check(SCOPE, 'earth_titanium', titanium.length === 0, head + ' | ' + countsOf(W) + (titanium.length > 0 ? ' LEAKS (' + titanium.length + '): ' +
          lines(titanium).slice(0, 25).join(' ; ') : ''))
        check(SCOPE, 'earth_helium3', helium.length === 0, helium.length > 0 ? 'LEAKS: ' + lines(helium).join(' ; ') :
          'no Earth recipe gives helium-3 (the Moon\'s regolith and the late lines only)')
        return
      }
      check(SCOPE, 'earth_' + W.name, W.leaks.length === 0, countsOf(W) + (W.leaks.length > 0 ? ' LEAKS (' + W.leaks.length + '): ' +
        lines(W.leaks).slice(0, 25).join(' ; ') : ' | no Earth recipe gives a resource of ' + W.name + ' (' + table.worlds[W.name].dimension +
        ', recycling and the late lines only)'))
    })
  }

  function checkByproducts() {
    var L = lazy()
    var ti = { ilmenite: true, rutile: true, titanium: true }
    var offenders = []
    var seen = {}
    asArray(L.GTCEuAPI.materialManager.getRegisteredMaterials()).forEach(function (m) {
      if (!m.hasProperty(L.PropertyKey.ORE)) return
      var name = String(m.getName())
      var list = asArray(m.getProperty(L.PropertyKey.ORE).getOreByProducts()).map(function (b) { return String(b.getName()) })
      seen[name] = list.join(',')
      if (ti[name]) return
      var hits = list.filter(function (b) { return ti[b] === true })
      if (hits.length > 0) offenders.push(name + '->' + hits.join('+'))
    })
    check(SCOPE, 'byproducts', offenders.length === 0 && seen.aluminium === 'bauxite,bauxite,gallium' && seen.bauxite === 'grossular,hematite,gallium',
      'aluminium=' + seen.aluminium + ' bauxite=' + seen.bauxite + ' ilmenite=' + seen.ilmenite +
      (offenders.length > 0 ? ' titanium byproducts of Earth ores: ' + offenders.join(' ') : ' no other ore has a titanium byproduct'))
  }

  function checkEndMv() {
    var HV = global.grindless.hv
    var ends = HV.endVeins()
    var bad = []
    ends.forEach(function (v) {
      if (byId('grindless:vein_drilling/mv/' + v.id + '_vanadium_steel_fluid') === null) bad.push(v.id + ': no mv/ vanadium steel recipe')
      if (byId('grindless:vein_drilling/hv/' + v.id + '_vanadium_steel_fluid') !== null) bad.push(v.id + ': the hv/ vanadium steel recipe is still there')
      if (byId('grindless:vein_drilling/hv/' + v.id + '_stainless_steel_fluid') === null) bad.push(v.id + ': no hv/ stainless steel recipe')
      v.ores.forEach(function (o) {
        if (/ilmenite|rutile|titanium|scheelite|tungstate/.test(String(o.item))) bad.push(v.id + ' drills ' + o.item)
      })
    })
    var bath = byId('gtceu:chemical_bath/eye_of_ender')
    var bathEut = bath !== null ? eutOf(bath) : -1
    var bathIo = bath !== null ? gtInputsText(bath) + ' -> ' + gtItemsOut(bath).join(' ') + ' in ' + bath.duration + ' t' : 'missing'
    if (bath !== null && !(bathIo.indexOf('"tag":"forge:gems/ender_pearl"') >= 0 && bathIo.indexOf('"amount":144') >= 0 &&
      bathIo.indexOf('forge:blaze') >= 0 && bathIo.indexOf('"minecraft:ender_eye"') >= 0 && Number(bath.duration) === 50)) {
      bad.push('eye bath is not GTM\'s recipe at MV: ' + bathIo)
    }
    var blaze = recipesOfType('gtceu:creature_simulation').filter(function (r) {
      return gtItemsOut(r).join(' ').indexOf('"minecraft:blaze_rod"') >= 0
    }).map(eutOf)
    var ok = bad.length === 0 && ends.length >= 4 && bathEut === 120 && blaze.length > 0 && blaze.every(function (e) { return e <= 128 }) &&
      HV.drilling.endMv === ends.length
    check(SCOPE, 'end_mv', ok, 'End veins=' + ends.map(function (v) { return v.id }).join(',') + ' mv/ End recipes=' + HV.drilling.endMv +
      ' eye bath=' + bathEut + ' EU/t blaze rods at ' + blaze.join(',') + ' EU/t' + (bad.length > 0 ? ' problems=' + bad.join(' | ') : ''))
  }

  // Productive Bees combs of another world's materials only process in that world (offworld_only.json worlds.<world>.combs):
  // 'bees' for the Moon (titanium, ilmenite), 'bees_<world>' for the others
  function checkBees() {
    var table = global.grindless.readJsonTable('kubejs/data/grindless/tables/offworld_only.json')
    var pb = recipesOfType('gtceu:centrifuge').filter(function (r) { return String(r.getId()).indexOf('grindless:centrifuge/pb/') === 0 })
    Object.keys(table.worlds).forEach(function (name) {
      var world = table.worlds[name]
      var key = name === 'moon' ? 'bees' : 'bees_' + name
      var re = new RegExp('"gtceu:[a-z_]*(' + world.watched.inputPattern + ')[a-z_]*"')
      var mine = pb.filter(function (r) { return re.test(gtItemsOut(r).join(' ')) })
      var earthly = mine.filter(function (r) { return conditionsText(r).indexOf('"' + world.dimension + '"') < 0 }).map(function (r) { return String(r.getId()) })
      if (mine.length === 0) {
        note(SCOPE, key, 'no Productive Bees comb gives an output of ' + name + ' (' + pb.length + ' comb recipes)')
        return
      }
      check(SCOPE, key, earthly.length === 0, mine.length + ' comb recipes of ' + pb.length + ' give an output of ' + name + ': ' +
        mine.map(function (r) { return String(r.getId()).replace('grindless:centrifuge/pb/', '') + '@' + eutOf(r) }).join(',') +
        (earthly.length > 0 ? ' without the ' + world.dimension + ' condition: ' + earthly.join(',') : ', all only in ' + world.dimension))
    })
  }

  function checkPlanets() {
    var PlanetData = Java.loadClass('argent_matter.gcyr.data.loader.PlanetData')
    var reach = []
    var all = []
    asArray(PlanetData.planets().entrySet()).forEach(function (e) {
      var tier = Number(e.getValue().rocketTier())
      var id = String(e.getKey())
      all.push(id + '=' + tier)
      if (tier <= 1 && id !== 'gcyr:earth') reach.push(id)
    })
    var luna = PlanetData.getPlanet(rl(LUNA))
    check(SCOPE, 'planets', luna !== null && Number(luna.rocketTier()) === 1 && reach.length === 1 && reach[0] === LUNA,
      'a tier 1 rocket reaches ' + reach.join(',') + ' | rocket tiers: ' + all.sort().join(' '))
  }

  function checkTravelConfig() {
    var bad = []
    var text = []
    try {
      var W = Java.loadClass('net.blay09.mods.waystones.config.WaystonesConfig').getActive()
      var warp = String(W.restrictions.dimensionalWarp)
      var allow = asArray(W.restrictions.dimensionalWarpAllowList).map(String)
      var deny = asArray(W.restrictions.dimensionalWarpDenyList).map(String)
      var cost = [Number(W.xpCost.minimumBaseXpCost), Number(W.xpCost.maximumBaseXpCost), Number(W.xpCost.dimensionalWarpXpCost)]
      if (warp !== 'ALLOW') bad.push('dimensionalWarp=' + warp)
      if (allow.length > 0 && (allow.indexOf(LUNA) < 0 || allow.indexOf(EARTH) < 0)) bad.push('allow list ' + allow.join(','))
      if (deny.indexOf(LUNA) >= 0 || deny.indexOf(EARTH) >= 0) bad.push('deny list ' + deny.join(','))
      if (cost.some(function (c) { return c !== 0 })) bad.push('xp costs ' + cost.join('/'))
      text.push('waystones dimensionalWarp=' + warp + ' allow=[' + allow.join(',') + '] deny=[' + deny.join(',') + '] xp min/max/dimensional=' + cost.join('/'))
    } catch (e) {
      bad.push('waystones config unreadable: ' + e)
    }
    try {
      var F = Java.loadClass('dev.ftb.mods.ftbessentials.config.FTBEConfig')
      var homes = Number(F.MAX_HOMES.value.get())
      var on = F.HOME.isEnabled()
      var from = asArray(F.TELEPORTATION_BLACKLIST_FROM.get()).map(String)
      var to = asArray(F.TELEPORTATION_BLACKLIST_TO.get()).map(String)
      if (!on) bad.push('/home disabled')
      if (homes < 2) bad.push('max homes ' + homes)
      ;[LUNA, EARTH].forEach(function (d) {
        if (from.indexOf(d) >= 0 || to.indexOf(d) >= 0 || from.indexOf('gcyr:*') >= 0 || to.indexOf('gcyr:*') >= 0) bad.push(d + ' blacklisted')
      })
      text.push('ftb essentials home=' + on + ' max homes=' + homes + ' blacklist from=[' + from.join(',') + '] to=[' + to.join(',') + ']')
    } catch (e) {
      bad.push('ftb essentials config unreadable: ' + e)
    }
    check(SCOPE, 'travel_config', bad.length === 0, text.join(' ; ') + (bad.length > 0 ? ' problems=' + bad.join(' | ') : ''))
  }

  function staticChecks() {
    guarded('registry', checkRegistry)
    guarded('tables', checkTables)
    guarded('lunar_recipes', checkLunarRecipes)
    guarded('crafting', checkCrafting)
    guarded('worldgen', checkWorldgen)
    guarded('offworld', checkOffworld)
    guarded('earth_scan', earthScan)
    guarded('byproducts', checkByproducts)
    guarded('end_mv', checkEndMv)
    guarded('bees', checkBees)
    guarded('planets', checkPlanets)
    guarded('travel_config', checkTravelConfig)
  }

  // ---------------------------------------------------------------- structures (same technique as gg_test_hv_multis.js)

  function simpleBlock(sym, machineId) {
    switch (sym.kind) {
      case 'blocks':
        return { id: sym.blocks[0] }
      case 'frames':
        return { id: 'gtceu:' + sym.materials[0] + '_frame' }
      case 'part':
        if (!PART_BLOCKS[sym.ability]) throw new Error('the test does not know the part ability ' + sym.ability)
        return { id: PART_BLOCKS[sym.ability], ability: sym.ability }
      case 'controller':
        return { id: machineId, controller: true }
      case 'air':
      case 'any':
        return null
      default:
        throw new Error('unsupported symbol kind ' + sym.kind)
    }
  }

  function assignOneOf(sym, list, machineId, counts) {
    var filler = null
    var parts = []
    sym.options.forEach(function (o) {
      if (o.kind === 'part') {
        var lim = o.limits || {}
        var need = lim.exact != null ? lim.exact : (lim.min != null ? lim.min : 0)
        if (counts && counts[o.ability] != null) need = counts[o.ability]
        for (var k = 0; k < need; k++) parts.push(simpleBlock(o, machineId))
      } else if (filler === null) {
        filler = simpleBlock(o, machineId)
      }
    })
    if (filler === null) throw new Error('a oneOf symbol has no plain block option')
    if (parts.length > list.length) throw new Error('more required parts (' + parts.length + ') than cells (' + list.length + ')')
    list.forEach(function (c) { c.block = filler })
    parts.forEach(function (p, i) {
      list[Math.floor((i + 0.5) * list.length / parts.length)].block = p
    })
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing north:
  // x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(machineId, cx, cy, cz, counts) {
    var desc = global.grindless.patterns.describe(machineId)
    if (!desc) throw new Error('no structure description recorded for ' + machineId)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, ch: ch, sym: sym, block: null, props: '' })
        }
      })
    })
    if (ctrl === null) throw new Error('the description has no controller cell')
    cells.forEach(function (c) {
      c.x = cx - (c.ci - ctrl.ci)
      c.y = cy + (c.ri - ctrl.ri)
      c.z = cz - (c.si - ctrl.si)
    })
    var byChar = {}
    cells.forEach(function (c) {
      if (!byChar[c.ch]) byChar[c.ch] = []
      byChar[c.ch].push(c)
    })
    Object.keys(byChar).forEach(function (ch) {
      var sym = desc.symbols[ch]
      var list = byChar[ch]
      if (sym.kind === 'oneOf') {
        assignOneOf(sym, list, machineId, counts)
      } else {
        var b = simpleBlock(sym, machineId)
        list.forEach(function (c) { c.block = b })
      }
    })
    var occupied = {}
    cells.forEach(function (c) {
      if (c.block) occupied[c.x + ',' + c.y + ',' + c.z] = true
    })
    cells.forEach(function (c) {
      if (!c.block) return
      if (c.block.controller) {
        c.props = '[facing=north]'
      } else if (c.block.ability) {
        for (var i = 0; i < SIDES.length; i++) {
          var s = SIDES[i]
          if (!occupied[(c.x + s[1]) + ',' + (c.y + s[2]) + ',' + (c.z + s[3])]) {
            c.facing = s
            c.props = '[facing=' + s[0] + ']'
            break
          }
        }
      }
    })
    var placed = cells.filter(function (c) { return c.block !== null })
    return {
      id: machineId,
      cells: placed,
      occupied: occupied,
      desc: desc,
      size: desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)',
      blocks: placed.length
    }
  }

  function place(m) {
    var plan = m.plan
    var failed = []
    var ctrlCell = null
    function put(c) {
      return cmd(m.dim, 'setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
    }
    plan.cells.forEach(function (c) {
      if (c.block.controller) {
        ctrlCell = c
        return
      }
      if (put(c) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.block.id + c.props)
    })
    if (put(ctrlCell) < 1) failed.push('controller ' + ctrlCell.block.id)
    plan.ctrl = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(m.level, c.x, c.y, c.z)
      if (got !== c.block.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.block.id + ' got ' + got)
    })
    var parts = plan.cells.filter(function (c) { return c.block.ability }).map(function (c) {
      return c.block.ability + '@' + c.x + ',' + c.y + ',' + c.z + c.props
    })
    check(m.scope, 'PLACED', failed.length === 0 && wrong.length === 0,
      'in ' + m.dim + ' blocks=' + plan.blocks + ' size=' + plan.size + ' controller=' + plan.ctrl.x + ',' + plan.ctrl.y + ',' + plan.ctrl.z +
      ' parts=[' + parts.join(' ') + ']' + (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function describeError(m, ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = 'pattern error ' + String(err)
      try {
        var p = err.getPos()
        text += ' at ' + p.getX() + ',' + p.getY() + ',' + p.getZ() + ' found ' + blockIdAt(m.level, p.getX(), p.getY(), p.getZ())
      } catch (e1) { /* no position */ }
      return text
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  function partIds(ctrl) {
    return asArray(ctrl.getParts()).map(function (p) { return String(p.getDefinition().getId()).replace('gtceu:', '') })
  }

  function previewCheck(m) {
    var shapes = asArray(m.def.getMatchingShapes())
    var blocks = shapes[0].getBlocks()
    var counts = {}
    var total = 0
    for (var x = 0; x < blocks.length; x++) {
      for (var y = 0; y < blocks[x].length; y++) {
        for (var z = 0; z < blocks[x][y].length; z++) {
          var info = blocks[x][y][z]
          if (info === null || info === undefined) continue
          var bid = String(Block.getId(info.getBlockState().getBlock()))
          if (bid === 'minecraft:air') continue
          counts[bid] = (counts[bid] || 0) + 1
          total++
        }
      }
    }
    var want = ['gcyr:lunar_mare_regolith', 'minecraft:daylight_detector', 'gtceu:steel_pipe_casing', 'gtceu:stainless_steel_frame', DRILL]
    var missing = want.filter(function (id) { return !counts[id] })
    check(m.scope, 'PREVIEW', shapes.length >= 1 && missing.length === 0, 'shapes=' + shapes.length + ' blocks=' + total +
      ' (placed: ' + m.plan.blocks + ')' + (missing.length > 0 ? ' missing=' + missing.join(',') : ''))
  }

  // ---------------------------------------------------------------- the drills: inputs, outputs, scenarios

  function readBus(bus) {
    var inv = bus.getInventory()
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = itemIdOf(st)
      counts[id] = (counts[id] || 0) + st.getCount()
    }
    return counts
  }

  function clearInventory(inv) {
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
  }

  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    if (st.isEmpty()) return { id: 'none', amount: 0 }
    return { id: String(lazy().BI.FLUID.getKey(st.getFluid())), amount: Number(st.getAmount()) }
  }

  function findParts(ctrl) {
    var P = { energy: [], inBus: null, outBuses: [], outHatch: null }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.energy_input) P.energy.push(p)
      else if (pid === PART_BLOCKS.input_bus) P.inBus = p
      else if (pid === PART_BLOCKS.output_bus) P.outBuses.push(p)
      else if (pid === PART_BLOCKS.output_hatch) P.outHatch = p
    })
    return P
  }

  function topUpEnergy(m) {
    if (m.parts === null || m.noTopUp) return
    m.parts.energy.forEach(function (p) {
      var c = p.energyContainer
      c.setEnergyStored(c.getEnergyCapacity())
    })
  }

  function resetMachine(m, ctrl) {
    var P = m.parts
    clearInventory(P.inBus.getInventory())
    P.outBuses.forEach(function (b) { clearInventory(b.getInventory()) })
    if (P.outHatch !== null) P.outHatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    ctrl.getRecipeLogic().resetRecipeLogic()
  }

  function fillScenario(m, sc) {
    var inv = m.parts.inBus.getInventory()
    sc.items.forEach(function (input, slot) {
      var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
    })
  }

  function recipeState(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() +
        ' lastRecipe=' + (last ? last.id + ' parallels=' + last.parallels : 'none')
    } catch (e) {
      return 'recipe state unreadable: ' + e
    }
  }

  // what GTM's own lookup and matching say (used when a machine stays idle)
  function diagnose(ctrl) {
    var out = []
    try {
      var match = ctrl.getRecipeType().db().find(ctrl)
      if (!match) {
        out.push('lookup=none')
      } else {
        var helper = Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
        out.push('lookup=' + match.id)
        try { out.push('matchRecipe=' + helper.matchRecipe(ctrl, match).isSuccess()) } catch (e1) { out.push('matchRecipe threw ' + e1) }
        try { out.push('conditions=' + match.checkConditions(ctrl.getRecipeLogic()).isSuccess()) } catch (e2) { /* optional */ }
      }
      var fails = asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
      if (fails.length > 0) out.push('failureReasons=[' + fails.join(' ; ') + ']')
    } catch (e) {
      out.push('diagnose threw ' + e)
    }
    return out.join(' ')
  }

  function collect(m) {
    var P = m.parts
    var counts = {}
    P.outBuses.forEach(function (b) {
      var c = readBus(b)
      Object.keys(c).forEach(function (id) { counts[id] = (counts[id] || 0) + c[id] })
    })
    return { items: counts, fluidOut: P.outHatch !== null ? tankInfo(P.outHatch) : { id: 'none', amount: 0 }, seen: m.seen, maxPar: m.maxPar,
      energyMax: m.energyMax, inputPerSec: m.inputPerSec }
  }

  function total(counts, ids) {
    var n = 0
    ids.forEach(function (id) { n += counts[id] || 0 })
    return n
  }

  function seenIds(r) {
    return Object.keys(r.seen).join(',')
  }

  // a bit stack is 16: the 32 bits of 32 runs at once are two stacks
  function drillItems(sample) {
    return [{ id: sample, n: 1 }, { id: BIT, n: 16 }, { id: BIT, n: 16 }]
  }

  function oreVerify(veinId, runs) {
    return function (r) {
      var vein = lunarVein(veinId)
      var ores = vein.ores.map(function (o) { return o.item })
      var oreTotal = total(r.items, ores)
      var stone = r.items[vein.stone] || 0
      var recipe = lunarRecipeId(veinId)
      var unexpected = Object.keys(r.items).filter(function (id) { return ores.indexOf(id) < 0 && id !== vein.stone })
      var ok = stone >= runs && stone % runs === 0 && oreTotal >= stone * 3 && unexpected.length === 0 && r.seen[recipe] === true && r.maxPar === runs
      return { ok: ok, detail: veinId + ': runs(stone)=' + stone + ' at once=' + r.maxPar + '/' + runs + ' ores=' + oreTotal +
        ' recipes seen=[' + seenIds(r) + '] items=[' + itemSummary(r.items) + ']' + (unexpected.length > 0 ? ' unexpected=' + unexpected.join(',') : '') }
    }
  }

  function volatilesVerify(veinId, runs) {
    return function (r) {
      var vein = lunarVein(veinId)
      var f = vein.volatiles[0]
      var amount = r.fluidOut.id === f.fluid ? r.fluidOut.amount : 0
      var recipe = lunarRecipeId(veinId)
      var ok = amount >= f.mb * runs && amount % (f.mb * runs) === 0 && Object.keys(r.items).length === 0 && r.seen[recipe] === true && r.maxPar === runs
      return { ok: ok, detail: veinId + ': ' + r.fluidOut.id + ' ' + r.fluidOut.amount + ' mB (' + f.mb + ' mB per run, ' + runs + ' at once; seen ' +
        r.maxPar + ') items=[' + itemSummary(r.items) + '] recipes seen=[' + seenIds(r) + ']' }
    }
  }

  function noRecipe(r) {
    var n = Object.keys(r.items).length
    return { ok: n === 0 && r.fluidOut.amount === 0, detail: 'no recipe expected: items=[' + itemSummary(r.items) + '] fluid=' + r.fluidOut.id +
      ' ' + r.fluidOut.amount + ' mB recipes seen=[' + seenIds(r) + ']' }
  }

  function earthPowerVerify(r) {
    var base = oreVerify('ilmenite_moon', 32)(r)
    var ok = base.ok && S.bridge !== null && S.bridge.ready && S.bridge.genOut > 0
    return { ok: ok, detail: 'only Earth power (no top-up): ' + base.detail + ' | the hatch held up to ' + r.energyMax + ' EU; the Earth turbine sent ' +
      (S.bridge ? S.bridge.genOut : '?') + ' EU into the EU P2P input during the test' }
  }

  function ensureDay(m) {
    if (m.level.isNight()) {
      S.server.runCommandSilent('time set 1000')
      note(m.scope, 'DAY', 'it was night: time set 1000 (the regolith only bakes by day)')
    }
  }

  function bridgeReady() {
    return S.bridge !== null && (S.bridge.ready || S.bridge.phase === 'done')
  }

  function moonScenarios() {
    return [
      { name: 'ilmenite', ticks: 260, items: drillItems(SAMPLE_ILMENITE), verify: oreVerify('ilmenite_moon', 32) },
      { name: 'regolith', ticks: 260, items: drillItems(SAMPLE_REGOLITH), before: ensureDay, verify: volatilesVerify('regolith_moon', 32) },
      { name: 'earth_power', ticks: 300, items: drillItems(SAMPLE_ILMENITE), waitFor: bridgeReady, earthPower: true, verify: earthPowerVerify }
    ]
  }

  function earthScenarios() {
    return [
      { name: 'ilmenite_refused', ticks: 100, items: drillItems(SAMPLE_ILMENITE), verify: noRecipe },
      { name: 'regolith_refused', ticks: 100, items: drillItems(SAMPLE_REGOLITH), before: ensureDay, verify: noRecipe }
    ]
  }

  // ---------------------------------------------------------------- the drills: state machine

  var MACHINES = [
    { key: 'moon', dim: LUNA, x: 2824, y: 204, z: 2, counts: { output_hatch: 1 }, scenarios: moonScenarios, preview: true },
    { key: 'earth', dim: EARTH, x: 2824, y: 102, z: 2, counts: { output_hatch: 1 }, scenarios: earthScenarios, preview: false }
  ]

  function startMachine(spec) {
    var m = { key: spec.key, id: DRILL, scope: 'lunar_drill@' + spec.key, spec: spec, dim: spec.dim, level: levelOf(spec.dim), phase: 'forming',
      t0: S.t, plan: null, ctrl: null, forced: false, parts: null, scenarios: null, sc: -1, scStart: 0, seen: {}, stateNoted: false,
      maxPar: 0, noTopUp: false, energyMax: 0, inputPerSec: 0, waitSince: 0 }
    S.machines.push(m)
    try {
      m.def = lazy().GTRegistries.MACHINES.get(rl(DRILL))
      if (m.def === null || m.def === undefined) {
        check(m.scope, 'PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return m
      }
      var desc = global.grindless.patterns.describe(DRILL)
      m.builtBefore = !!(desc && desc.built)
      m.plan = planOf(DRILL, spec.x, spec.y, spec.z, spec.counts)
      check(m.scope, 'DESCRIPTION', true, 'registered at startup, ' + m.plan.blocks + ' blocks, ' + m.plan.size)
      // the ground under the regolith pads (lunar mare regolith falls like sand)
      cmd(m.dim, 'fill ' + (spec.x - 3) + ' ' + (spec.y - 4) + ' ' + spec.z + ' ' + (spec.x + 3) + ' ' + (spec.y - 4) + ' ' + (spec.z + 4) + ' ' +
        (spec.dim === LUNA ? 'gcyr:moon_stone' : 'minecraft:stone') + ' replace')
      if (!place(m)) {
        m.phase = 'done'
        return m
      }
      m.ctrl = m.plan.ctrl
      m.t0 = S.t
    } catch (e) {
      check(m.scope, 'DESCRIPTION', false, 'exception while describing/placing: ' + e)
      m.phase = 'done'
    }
    return m
  }

  function observe(m, ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      if (last) {
        m.seen[String(last.id)] = true
        var par = Number(last.parallels)
        if (par > m.maxPar) m.maxPar = par
      }
    } catch (e) { /* optional */ }
    if (m.noTopUp && m.parts !== null) {
      m.parts.energy.forEach(function (p) {
        var c = p.energyContainer
        var stored = Number(c.getEnergyStored())
        if (stored > m.energyMax) m.energyMax = stored
        try {
          var inSec = Number(c.getInputPerSec())
          if (inSec > m.inputPerSec) m.inputPerSec = inSec
        } catch (e2) { /* optional */ }
      })
    }
  }

  function beginScenario(m, ctrl, sc) {
    resetMachine(m, ctrl)
    m.seen = {}
    m.maxPar = 0
    m.stateNoted = false
    m.energyMax = 0
    m.inputPerSec = 0
    m.noTopUp = sc.earthPower === true
    if (m.noTopUp) {
      m.parts.energy.forEach(function (p) { p.energyContainer.setEnergyStored(0) })
    }
    if (sc.before) sc.before(m)
    fillScenario(m, sc)
    note(m.scope, 'INPUT_' + sc.name, 'bus=[' + itemSummary(readBus(m.parts.inBus)) + '] energy=' +
      (m.noTopUp ? 'none of its own (Earth through the bridge)' : 'topped up every tick'))
    m.scStart = S.t
    m.phase = 'running'
  }

  function nextScenario(m, ctrl) {
    m.sc++
    if (m.sc >= m.scenarios.length) {
      m.noTopUp = false
      m.phase = 'done'
      return
    }
    var sc = m.scenarios[m.sc]
    if (sc.waitFor && !sc.waitFor()) {
      m.phase = 'waiting'
      m.waitSince = S.t
      return
    }
    beginScenario(m, ctrl, sc)
  }

  function advance(m) {
    var ctrl = machineAt(m.level, m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check(m.scope, 'FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }

    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        check(m.scope, 'FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') +
          'in ' + m.dim + ' parts=[' + partIds(ctrl).join(' ') + ']')
        check(m.scope, 'PATTERN', global.grindless.patterns.describe(DRILL).built, 'built by GTM on the first structure check')
        if (m.spec.preview) {
          try {
            previewCheck(m)
          } catch (e3) {
            check(m.scope, 'PREVIEW', false, 'exception: ' + e3)
          }
        }
        m.parts = findParts(ctrl)
        if (m.parts.inBus === null || m.parts.outBuses.length === 0 || m.parts.energy.length === 0 || m.parts.outHatch === null) {
          check(m.scope, 'PARTS', false, 'missing parts: input bus=' + (m.parts.inBus !== null) + ' output buses=' + m.parts.outBuses.length +
            ' energy hatches=' + m.parts.energy.length + ' output hatch=' + (m.parts.outHatch !== null))
          m.phase = 'done'
          return
        }
        m.scenarios = m.spec.scenarios()
        m.sc = -1
        topUpEnergy(m)
        nextScenario(m, ctrl)
        return
      }
      if (waited >= FORM_TIMEOUT) {
        var syncOk = false
        try {
          syncOk = ctrl.checkPatternWithLock()
        } catch (e) { /* reported below */ }
        if (!syncOk) {
          check(m.scope, 'FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(m, ctrl))
          m.phase = 'done'
          return
        }
        check(m.scope, 'FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
        ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
        ctrl.onStructureFormed()
        m.forced = true
      }
      return
    }

    if (m.phase === 'waiting') {
      var sc0 = m.scenarios[m.sc]
      if (sc0.waitFor()) {
        beginScenario(m, ctrl, sc0)
      } else if (S.t - m.waitSince > 2400) {
        check(m.scope, 'PROCESS_' + sc0.name, false, 'waited ' + (S.t - m.waitSince) + ' ticks for its precondition (the Earth-Moon bridge)')
        nextScenario(m, ctrl)
      }
      return
    }

    if (m.phase === 'running') {
      var sc = m.scenarios[m.sc]
      var running = S.t - m.scStart
      observe(m, ctrl)
      if (!m.stateNoted && running >= 60) {
        m.stateNoted = true
        note(m.scope, 'STATE_' + sc.name, 'after ' + running + ' ticks: ' + recipeState(ctrl) + ' ' + diagnose(ctrl))
      }
      if (running >= sc.ticks) {
        var verdict = null
        try {
          verdict = sc.verify(collect(m))
        } catch (e) {
          verdict = { ok: false, detail: 'exception while checking: ' + e }
        }
        check(m.scope, 'PROCESS_' + sc.name, verdict.ok, verdict.detail + ' | ' + recipeState(ctrl))
        nextScenario(m, ctrl)
      }
    }
  }

  function machineByKey(key) {
    for (var i = 0; i < S.machines.length; i++) {
      if (S.machines[i].key === key) return S.machines[i]
    }
    return null
  }

  // ---------------------------------------------------------------- the Earth-Moon quantum bridge (AE2 + EU P2P)

  // Earth end: a flat 3x3 quantum bridge (link chamber at 2851,100,3), a creative energy cell west of it, a cable bus east of it with
  // the EU P2P input on its east face and an HV steam turbine facing it (the test keeps the turbine's buffer full: a power plant).
  // Moon end: laid out from the lunar drill's energy hatch (it faces south): a cable bus in front of the hatch with the EU P2P output
  // on its north face, two cables south to a flat quantum bridge, and an ME drive (one item cell, one fluid cell) west of it.
  var EARTH_BRIDGE = { qx: 2850, qy: 100, qz: 2, link: { x: 2851, y: 100, z: 3 }, cell: { x: 2849, y: 100, z: 3 }, bus: { x: 2853, y: 100, z: 3 },
    gen: { x: 2854, y: 100, z: 3 } }
  var RITUAL = { x: 2870, y: 101, z: 12 }

  function qnbCells(x0, y, z0) {
    var out = []
    for (var dx = 0; dx < 3; dx++) {
      for (var dz = 0; dz < 3; dz++) {
        out.push({ x: x0 + dx, y: y, z: z0 + dz, id: dx === 1 && dz === 1 ? 'ae2:quantum_link' : 'ae2:quantum_ring' })
      }
    }
    return out
  }

  function bpOf(p) {
    return bp(p.x, p.y, p.z)
  }

  function at(p) {
    return p.x + ',' + p.y + ',' + p.z
  }

  function gridOf(be) {
    if (be === null || be === undefined) return null
    var node = be.getMainNode()
    return node === null || node === undefined ? null : node.getGrid()
  }

  function sameGrid(a, b) {
    return a !== null && a !== undefined && b !== null && b !== undefined && a.equals(b)
  }

  function itemKey(id) {
    return ae().AEItemKey['of(net.minecraft.world.level.ItemLike)'](Item.of(id).getItem())
  }

  function fluidKey(id) {
    return ae().AEFluidKey['of(net.minecraft.world.level.material.Fluid)'](lazy().BI.FLUID.get(rl(id)))
  }

  function move(grid, key, amount, insert) {
    var A = ae()
    var inv = grid.getStorageService().getInventory()
    var src = A.ActionSource.empty()
    return Number(insert ? inv.insert(key, amount, A.Actionable.MODULATE, src) : inv.extract(key, amount, A.Actionable.MODULATE, src))
  }

  function stored(grid, key) {
    if (grid === null || grid === undefined) return -1
    return Number(grid.getStorageService().getInventory().getAvailableStacks().get(key))
  }

  function itemsNear(level, p, r, id) {
    var L = lazy()
    var box = new L.AABB(p.x - r, p.y - r, p.z - r, p.x + r + 1, p.y + r + 1, p.z + r + 1)
    return asArray(level.getEntitiesOfClass(L.ItemEntity, box)).filter(function (e) { return !e.isRemoved() && itemIdOf(e.getItem()) === id })
  }

  function buildBridge() {
    var L = lazy()
    var A = ae()
    var B = { phase: 'build', t0: S.t, ready: false, genOut: 0, gen: null }
    S.bridge = B
    try {
      var drill = machineByKey('moon')
      if (drill === null || drill.plan === null) throw new Error('the lunar drill was not placed')
      var hatch = drill.plan.cells.filter(function (c) { return c.block && c.block.ability === 'energy_input' })[0]
      if (!hatch || !hatch.facing || hatch.facing[0] !== 'south') throw new Error('the lunar drill energy hatch does not face south: ' + (hatch ? hatch.props : 'none'))
      var E = { x: hatch.x, y: hatch.y, z: hatch.z }
      B.moonBus = { x: E.x, y: E.y, z: E.z + 1 }
      B.moonCables = [{ x: E.x, y: E.y, z: E.z + 2 }, { x: E.x, y: E.y, z: E.z + 3 }]
      B.moonQnb = qnbCells(E.x - 3, E.y, E.z + 2)
      B.moonLink = { x: E.x - 2, y: E.y, z: E.z + 3 }
      B.moonDrive = { x: E.x - 4, y: E.y, z: E.z + 3 }
      B.hatch = E
      var clash = [B.moonBus, B.moonDrive].concat(B.moonCables).concat(B.moonQnb).filter(function (p) { return drill.plan.occupied[at(p)] === true })
      if (clash.length > 0) throw new Error('the Moon end would sit in the drill at ' + clash.map(at).join(' '))

      var failed = []
      qnbCells(EARTH_BRIDGE.qx, EARTH_BRIDGE.qy, EARTH_BRIDGE.qz).forEach(function (c) {
        if (cmd(EARTH, 'setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.id + ' replace') < 1) failed.push('earth ' + at(c))
      })
      B.moonQnb.forEach(function (c) {
        if (cmd(LUNA, 'setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.id + ' replace') < 1) failed.push('moon ' + at(c))
      })
      var cell = EARTH_BRIDGE.cell
      var gen = EARTH_BRIDGE.gen
      if (cmd(EARTH, 'setblock ' + cell.x + ' ' + cell.y + ' ' + cell.z + ' ae2:creative_energy_cell replace') < 1) failed.push('energy cell')
      if (cmd(EARTH, 'setblock ' + gen.x + ' ' + gen.y + ' ' + gen.z + ' gtceu:hv_steam_turbine[facing=west] replace') < 1) failed.push('turbine')
      if (cmd(LUNA, 'setblock ' + B.moonDrive.x + ' ' + B.moonDrive.y + ' ' + B.moonDrive.z + ' ae2:drive replace') < 1) failed.push('drive')

      var cable = Item.of('ae2:fluix_glass_cable').getItem()
      var p2p = Item.of('eup2p:eu_p2p_tunnel').getItem()
      A.PartHelper.setPart(S.earth, bpOf(EARTH_BRIDGE.bus), null, null, cable)
      B.p2pIn = A.PartHelper.setPart(S.earth, bpOf(EARTH_BRIDGE.bus), L.Direction.EAST, null, p2p)
      A.PartHelper.setPart(S.moon, bpOf(B.moonBus), null, null, cable)
      B.p2pOut = A.PartHelper.setPart(S.moon, bpOf(B.moonBus), L.Direction.NORTH, null, p2p)
      B.moonCables.forEach(function (c) { A.PartHelper.setPart(S.moon, bpOf(c), null, null, cable) })
      if (B.p2pIn === null || B.p2pOut === null) failed.push('EU P2P parts')

      var drive = S.moon.getBlockEntity(bpOf(B.moonDrive))
      drive.getInternalInventory().setItemDirect(0, Item.of('ae2:item_storage_cell_1k'))
      drive.getInternalInventory().setItemDirect(1, Item.of('ae2:fluid_storage_cell_1k'))
      global.grindless.moon.quantum.track(S.moon, bpOf(B.moonLink))
      B.gen = machineAt(S.earth, gen)
      check(SCOPE, 'bridge_build', failed.length === 0 && B.gen !== null, 'Earth: quantum bridge (chamber ' + at(EARTH_BRIDGE.link) +
        '), creative energy cell, EU P2P input at ' + at(EARTH_BRIDGE.bus) + ' fed by an HV steam turbine; Moon: quantum bridge (chamber ' +
        at(B.moonLink) + '), ME drive at ' + at(B.moonDrive) + ', EU P2P output at ' + at(B.moonBus) + ' against the drill energy hatch ' + at(E) +
        (failed.length > 0 ? ' FAILED: ' + failed.join(', ') : ''))
      if (failed.length > 0) B.phase = 'done'
    } catch (e) {
      check(SCOPE, 'bridge_build', false, 'exception: ' + e)
      B.phase = 'done'
    }
  }

  function startRitual(B) {
    var L = lazy()
    cmd(EARTH, 'setblock ' + RITUAL.x + ' ' + (RITUAL.y - 1) + ' ' + RITUAL.z + ' minecraft:obsidian replace')
    var a = new L.ItemEntity(S.earth, RITUAL.x + 0.5, RITUAL.y + 0.05, RITUAL.z + 0.5, Item.of(SINGULARITY))
    var b = new L.ItemEntity(S.earth, RITUAL.x + 0.5, RITUAL.y + 0.05, RITUAL.z + 0.5, Item.of(SEED))
    a.setDeltaMovement(L.Vec3.ZERO)
    b.setDeltaMovement(L.Vec3.ZERO)
    S.earth.addFreshEntity(a)
    S.earth.addFreshEntity(b)
    B.ritualItems = [a, b]
    cmd(EARTH, 'summon minecraft:tnt ' + (RITUAL.x + 0.5) + ' ' + RITUAL.y + ' ' + (RITUAL.z + 0.5) + ' {Fuse:1s}')
  }

  // the pair the ritual made: { ok, how, stack, entities }
  function ritualResult(B) {
    var A = ae()
    var how = 'the explosion (AE2 transform)'
    var found = itemsNear(S.earth, RITUAL, 6, ENTANGLED)
    if (found.length === 0) {
      var alive = B.ritualItems.filter(function (e) { return !e.isRemoved() })
      if (alive.length === 2) {
        A.TransformLogic.tryTransform(alive[0], function (c) { return c.isExplosion() })
        found = itemsNear(S.earth, RITUAL, 6, ENTANGLED)
        how = 'AE2 TransformLogic called directly (the explosion did not transform)'
      } else {
        how = 'the explosion destroyed ' + (2 - alive.length) + ' input(s)'
      }
    }
    if (found.length === 0) return { ok: false, how: how, stack: null, entities: [] }
    var stack = found[0].getItem().copy()
    var tag = stack.getNbt()
    var mark = tag !== null && tag.contains(PAIR_KEY) ? String(tag.getString(PAIR_KEY)) : ''
    var freq = tag !== null && tag.contains('freq') ? Number(tag.getLong('freq')) : 0
    return { ok: stack.getCount() === 2 && mark === 'moon' && freq !== 0, how: how, stack: stack, entities: found, mark: mark, freq: freq }
  }

  function advanceBridge() {
    var B = S.bridge
    if (B === null || B.phase === 'done') return
    var L = lazy()
    var A = ae()
    var since = S.t - B.t0

    if (B.phase === 'build') {
      if (since < 40) return
      B.earthQbe = S.earth.getBlockEntity(bpOf(EARTH_BRIDGE.link))
      B.moonQbe = S.moon.getBlockEntity(bpOf(B.moonLink))
      var formed = B.earthQbe !== null && B.moonQbe !== null && B.earthQbe.isFormed() && B.moonQbe.isFormed()
      var gE = gridOf(B.earthQbe)
      var gM = gridOf(B.moonQbe)
      var took = gE !== null ? move(gE, itemKey('minecraft:iron_ingot'), 8, true) : -1
      check(SCOPE, 'bridge_formed', formed && gE !== null && gM !== null && !sameGrid(gE, gM) && took === 0,
        'Earth formed=' + (B.earthQbe !== null && B.earthQbe.isFormed()) + ' Moon formed=' + (B.moonQbe !== null && B.moonQbe.isFormed()) +
        ' separate networks=' + !sameGrid(gE, gM) + ' (an insert at the Earth end took ' + took + ': no storage on Earth)')
      if (!formed) {
        B.phase = 'done'
        return
      }
      // an Earth pair (the LV ritual's kind: a frequency, no planet mark) in both chambers
      var pair = Item.of(ENTANGLED, 2)
      A.QBE.assignFrequency(pair)
      B.earthPairFreq = Number(pair.getNbt().getLong('freq'))
      var one = pair.copy()
      one.setCount(1)
      var two = pair.copy()
      two.setCount(1)
      B.earthQbe.getInternalInventory().setItemDirect(0, one)
      B.moonQbe.getInternalInventory().setItemDirect(0, two)
      B.phase = 'earth_pair'
      B.t0 = S.t
      return
    }

    if (B.phase === 'earth_pair') {
      if (since < 50) return
      var left = B.moonQbe.getInternalInventory().getStackInSlot(0)
      var popped = itemsNear(S.moon, B.moonLink, 3, ENTANGLED)
      var linked = sameGrid(gridOf(B.earthQbe), gridOf(B.moonQbe))
      check(SCOPE, 'bridge_earth_pair_refused', left.isEmpty() && popped.length > 0 && !linked,
        'an Earth pair (frequency ' + B.earthPairFreq + ', no ' + PAIR_KEY + ') in both chambers: the lunar chamber ' +
        (left.isEmpty() ? 'is empty' : 'still holds it') + ', pushed out on top: ' + popped.length + ', networks ' + (linked ? 'STILL LINKED' : 'separate'))
      popped.forEach(function (e) { e.discard() })
      B.moonQbe.getInternalInventory().setItemDirect(0, Item.empty)
      B.earthQbe.getInternalInventory().setItemDirect(0, Item.empty)
      startRitual(B)
      B.phase = 'ritual'
      B.t0 = S.t
      return
    }

    if (B.phase === 'ritual') {
      if (since < 20) return
      var res = ritualResult(B)
      check(SCOPE, 'bridge_ritual', res.ok, 'AE2 singularity + lunar quantum seed in an explosion on Earth, by ' + res.how + ': ' +
        (res.stack !== null ? res.stack.getCount() + 'x ' + itemIdOf(res.stack) + ' ' + PAIR_KEY + '=' + res.mark + ' freq=' + res.freq : 'no entangled singularity'))
      var stack = res.stack
      if (!res.ok) {
        // keep going with a pair made by hand, so the rest of the bridge is still tested
        stack = Item.of(ENTANGLED, 2)
        A.QBE.assignFrequency(stack)
        stack.getNbt().putString(PAIR_KEY, 'moon')
      }
      res.entities.forEach(function (e) { e.discard() })
      var h1 = stack.copy()
      h1.setCount(1)
      var h2 = stack.copy()
      h2.setCount(1)
      B.earthQbe.getInternalInventory().setItemDirect(0, h1)
      B.moonQbe.getInternalInventory().setItemDirect(0, h2)
      B.phase = 'link'
      B.t0 = S.t
      return
    }

    if (B.phase === 'link') {
      if (since < 60) return
      var kept = !B.moonQbe.getInternalInventory().getStackInSlot(0).isEmpty()
      var gE2 = gridOf(B.earthQbe)
      var gM2 = gridOf(B.moonQbe)
      var both = sameGrid(gE2, gM2)
      check(SCOPE, 'bridge_linked', kept && both, 'the Earth-Moon pair: the lunar chamber ' + (kept ? 'keeps' : 'PUSHED OUT') + ' its half, one network=' + both)
      if (!both) {
        B.phase = 'done'
        return
      }
      var iron = move(gE2, itemKey('minecraft:iron_ingot'), 64, true)
      var ironBack = move(gE2, itemKey('minecraft:iron_ingot'), 16, false)
      var he3 = move(gE2, fluidKey(HE3), 4000, true)
      var he3Back = move(gE2, fluidKey(HE3), 1000, false)
      B.ironLeft = iron - ironBack
      B.he3Left = he3 - he3Back
      check(SCOPE, 'bridge_storage', iron === 64 && ironBack === 16 && he3 === 4000 && he3Back === 1000,
        'at the Earth end (no storage there): 64 iron ingots in -> ' + iron + ', 16 back -> ' + ironBack + '; 4000 mB helium-3 in -> ' + he3 +
        ', 1000 back -> ' + he3Back + ' (they live in the ME drive on the Moon)')
      try {
        var svc = A.P2PService.get(gE2)
        var freq = svc.newFrequency()
        svc.updateFreq(B.p2pIn, freq)
        var tag = new L.CompoundTag()
        tag.putShort('p2pFreq', freq)
        B.p2pOut.importSettings(A.SettingsFrom.MEMORY_CARD, tag, null)
        var outs = asArray(B.p2pIn.getOutputs())
        var cap = L.GTCaps.getEnergyContainer(S.earth, bpOf(EARTH_BRIDGE.bus), L.Direction.EAST)
        B.ready = outs.length === 1 && B.p2pOut.isOutput()
        check(SCOPE, 'bridge_p2p', B.ready && cap !== null, 'EU P2P on frequency ' + freq + ': outputs of the Earth input=' + outs.length +
          ', the Moon tunnel is an output=' + B.p2pOut.isOutput() + ', GT energy capability on the Earth tunnel=' + (cap !== null))
      } catch (e) {
        check(SCOPE, 'bridge_p2p', false, 'exception: ' + e)
      }
      B.phase = 'hold'
      B.t0 = S.t
      return
    }

    if (B.phase === 'hold') {
      var drill = machineByKey('moon')
      if (drill !== null && drill.phase !== 'done') return
      B.earthQbe.getInternalInventory().setItemDirect(0, Item.empty)
      // while linked the Moon end ran on Earth's AE power (the only energy cell is on Earth); alone it needs its own, or its drive sleeps
      B.moonCell = { x: B.moonLink.x, y: B.moonLink.y, z: B.moonLink.z + 2 }
      cmd(LUNA, 'setblock ' + B.moonCell.x + ' ' + B.moonCell.y + ' ' + B.moonCell.z + ' ae2:creative_energy_cell replace')
      B.phase = 'unlink'
      B.t0 = S.t
      return
    }

    if (B.phase === 'unlink') {
      if (since < 40) return
      var gE3 = gridOf(B.earthQbe)
      var gM3 = gridOf(B.moonQbe)
      var ironMoon = stored(gM3, itemKey('minecraft:iron_ingot'))
      var ironEarth = stored(gE3, itemKey('minecraft:iron_ingot'))
      var he3Moon = stored(gM3, fluidKey(HE3))
      var he3Earth = stored(gE3, fluidKey(HE3))
      check(SCOPE, 'bridge_unlinked', !sameGrid(gE3, gM3) && ironMoon === B.ironLeft && ironEarth === 0 && he3Moon === B.he3Left && he3Earth === 0,
        'Earth half taken out: networks separate=' + !sameGrid(gE3, gM3) + '; the Moon network (an energy cell of its own at ' + at(B.moonCell) +
        ': while linked it ran on Earth\'s AE power) holds ' + ironMoon + ' iron ingots and ' + he3Moon + ' mB helium-3 (expected ' + B.ironLeft + ' and ' +
        B.he3Left + '), the Earth one ' + ironEarth + ' and ' + he3Earth)
      B.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- the world: areas, lunar ores, waystones

  function prepareWorld() {
    for (var cx = 176; cx < 180; cx++) {
      S.earth.getChunk(cx, 0)
      S.moon.getChunk(cx, 0)
    }
    cmd(EARTH, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    cmd(LUNA, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var a = cmd(EARTH, 'fill 2816 98 0 2879 112 15 air')
    var b = cmd(LUNA, 'fill 2816 198 0 2879 214 15 air')
    note(SCOPE, 'AREA', 'chunks 176..179,0 of ' + EARTH + ' and ' + LUNA + ' generated and force-loaded; cleared ' + a + ' blocks on Earth (Y 98..112) and ' +
      b + ' on the Moon (Y 198..214)')
  }

  // the ores of 48 freshly generated lunar chunks (block counts from the section palettes)
  function moonOres() {
    var L = lazy()
    var counts = {}
    var chunks = 0
    var t0 = Date.now()
    for (var cx = 174; cx <= 181; cx++) {
      for (var cz = -2; cz <= 3; cz++) {
        var chunk = S.moon.getChunk(cx, cz)
        chunks++
        var secs = chunk.getSections()
        for (var i = 0; i < secs.length; i++) {
          var sec = secs[i]
          if (sec.hasOnlyAir()) continue
          sec.getStates().count(function (state, n) {
            var id = String(L.BI.BLOCK.getKey(state.getBlock()))
            if (/_ore$/.test(id)) counts[id] = (counts[id] || 0) + Number(n)
          })
        }
      }
    }
    var allowed = {}
    lunarVeins().forEach(function (v) {
      v.ores.forEach(function (o) { allowed['gtceu:moon_' + o.material + '_ore'] = true })
    })
    var others = Object.keys(counts).filter(function (id) { return allowed[id] !== true })
    var ilmenite = counts['gtceu:moon_ilmenite_ore'] || 0
    check(SCOPE, 'moon_ores', ilmenite > 0 && others.length === 0, chunks + ' lunar chunks in ' + (Date.now() - t0) + ' ms: ' +
      (Object.keys(counts).length > 0 ? itemSummary(counts) : 'no ore at all') + (others.length > 0 ? ' | ores of no lunar vein: ' + others.join(',') : ''))
  }

  function errText(err) {
    var t = String(err.getClass().getName())
    t = t.substring(t.lastIndexOf('.') + 1)
    try {
      t += ' (' + err.getTranslationKey() + ')'
    } catch (e) { /* no key */ }
    return t
  }

  function waystoneTeleport(API, entity, waystone) {
    var ctx = API.createCustomTeleportContext(entity, waystone)
    if (!ctx.left().isPresent()) return { ok: false, text: 'no teleport context: ' + errText(ctx.right().get()), dims: [], entities: [] }
    var res = API['tryTeleport(net.blay09.mods.waystones.api.IWaystoneTeleportContext)'](ctx.left().get())
    if (res.left().isPresent()) {
      var list = asArray(res.left().get())
      var dims = list.map(dimOf)
      return { ok: true, text: 'teleported ' + list.length + ' entity(ies) to ' + dims.join(','), dims: dims, entities: list }
    }
    return { ok: false, text: 'refused: ' + errText(res.right().get()), dims: [], entities: [] }
  }

  function waystoneTests() {
    var L = lazy()
    var API = Java.loadClass('net.blay09.mods.waystones.api.WaystonesAPI')
    var Styles = Java.loadClass('net.blay09.mods.waystones.api.WaystoneStyles')
    var earthWs = API.placeWaystone(S.earth, bp(2872, 101, 2), Styles.DEFAULT)
    var moonWs = API.placeWaystone(S.moon, bp(2872, 201, 2), Styles.DEFAULT)
    check(SCOPE, 'waystone_place', earthWs.isPresent() && moonWs.isPresent(), 'Earth ' + earthWs.isPresent() + ' at 2872,101,2, Moon ' +
      moonWs.isPresent() + ' at 2872,201,2 (WaystonesAPI.placeWaystone)')
    if (!earthWs.isPresent() || !moonWs.isPresent()) return
    var stand = new L.ArmorStand(L.EntityType.ARMOR_STAND, S.earth)
    stand.setPos(2869.5, 101, 5.5)
    S.earth.addFreshEntity(stand)
    var a = waystoneTeleport(API, stand, moonWs.get())
    check(SCOPE, 'waystone_living', a.ok && a.dims.indexOf(LUNA) >= 0, 'an armor stand on Earth to the Moon waystone: ' + a.text)
    if (a.ok && a.entities.length > 0) {
      var back = waystoneTeleport(API, a.entities[0], earthWs.get())
      check(SCOPE, 'waystone_back', back.ok && back.dims.indexOf(EARTH) >= 0, 'and back to the Earth waystone: ' + back.text)
      back.entities.forEach(function (e) { e.discard() })
    }
  }

  // ---------------------------------------------------------------- driver

  function allDone() {
    for (var i = 0; i < S.machines.length; i++) {
      if (S.machines[i].phase !== 'done') return false
    }
    return S.bridge === null || S.bridge.phase === 'done'
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      cmd(LUNA, 'forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    } catch (e) { /* best effort */ }
    console.info(TAG + SCOPE + '|DONE')
  }

  // setTimeout is not bound in the scripts of this server, so a server-tick handler drives the steps
  function step(elapsed) {
    try {
      S.t = elapsed
      S.machines.forEach(function (m) {
        if (m.phase === 'done') return
        try {
          advance(m)
        } catch (e) {
          check(m.scope, 'STEP', false, 'exception in ' + m.phase + ': ' + e)
          m.phase = 'done'
        }
      })
      try {
        advanceBridge()
      } catch (e2) {
        check(SCOPE, 'bridge_step', false, 'exception in ' + (S.bridge ? S.bridge.phase : '?') + ': ' + e2)
        if (S.bridge) S.bridge.phase = 'done'
      }
      if (S.t > TEST_TIMEOUT) {
        check(SCOPE, 'timeout', false, 'still running after ' + S.t + ' ticks: machines=' +
          S.machines.map(function (m) { return m.key + ':' + m.phase }).join(',') + ' bridge=' + (S.bridge ? S.bridge.phase : 'none'))
        finish()
        return
      }
      if (allDone()) finish()
    } catch (e) {
      check(SCOPE, 'STEP', false, 'exception: ' + e)
      finish()
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    S.machines.forEach(function (m) {
      if (m.phase === 'running') {
        try {
          topUpEnergy(m)
        } catch (e) { /* the next step reports problems */ }
      }
    })
    if (S.bridge !== null && S.bridge.gen) {
      try {
        // what the turbine pushed out since the last tick (into the EU P2P input: nothing else touches it), then refill it
        var c = S.bridge.gen.energyContainer
        var cap = Number(c.getEnergyCapacity())
        var before = Number(c.getEnergyStored())
        if (S.bridge.genPrimed && before < cap) S.bridge.genOut += cap - before
        c.setEnergyStored(cap)
        S.bridge.genPrimed = true
      } catch (e2) { /* reported by the earth_power scenario */ }
    }
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    step(now - S.tick0)
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, earth: server.overworld(), moon: null, t: 0, tick0: now, nextAt: now + STEP, machines: [], bridge: null, finished: false }
    S.moon = levelOf(LUNA)
    staticChecks()
    if (S.moon === null || S.moon === undefined) {
      check(SCOPE, 'moon_level', false, LUNA + ' is not loaded')
      finish()
      return
    }
    guarded('AREA', prepareWorld)
    guarded('moon_ores', moonOres)
    guarded('waystones', waystoneTests)
    MACHINES.forEach(startMachine)
    buildBridge()
    if (allDone()) finish()
  }

  // The pack's Additional Placements mod reloads the datapacks (and these scripts) a couple of seconds after the server is up: the
  // command only leaves a request in `global` and the tick handler starts the test once these scripts have been loaded for QUIET_MS.
  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    global[REQUEST] = false
    try {
      run(server)
    } catch (e) {
      check(SCOPE, 'run', false, 'exception: ' + e)
      finish()
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_moon', function (event) {
    if (S !== null && !S.finished) {
      note(SCOPE, 'run', 'a previous gg_test_moon run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
