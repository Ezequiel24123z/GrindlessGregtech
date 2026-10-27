// priority: -100100
// Gregtech Grindless - GTM recipe lookup guard (TEST-ONLY overlay: copied over the instance on the test PC, never shipped with the
// pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_recipe_lookup' -WaitForLog 'GGTEST\|lookup\|DONE@@900'
//
// GTM 7.5.3 keeps ONE recipe per ingredient path (api/recipe/lookup/RecipeDB.addRecursive; StagingRecipeDB sorts each recipe's
// item and fluid inputs by how many recipes of the type use the same one). A recipe whose path equals another's, or runs through a
// node where a shorter recipe ends, is not added ("failed to add recipe from staging into lookup DB: <id>" in latest.log), and one
// whose path ends where a longer recipe goes on is dropped without a word. Either way no machine can ever find it, though EMI
// shows it.
//
// This test reads the real lookup instead of emulating it. For every GT recipe type, every recipe of the type in the recipe manager
// (and the proxy recipes GTM converts into it, e.g. smelting for the electric furnace) is looked up in the type's own RecipeDB with
// RecipeDB#find(Map<RecipeCapability, List<Object>>, Predicate): the map holds the recipe's own raw input contents (inputs and
// tickInputs of every search-filter capability, the objects StagingRecipeDB#flattenedContent inserts, so the keys are built as at
// insertion) and the predicate is Predicate.isEqual(recipe) (GTRecipe#equals compares ids). Not found = unreachable. For each
// unreachable recipe it then reports what the lookup reaches instead with the same inputs (a second find that records every
// candidate) and the recipes in the tree that hold all of its lookup keys (when its path ends inside theirs; the case GTM does not
// log, e.g. GTM's large chemical reactor dynamite under GT--'s bomb).
// A recipe found through any alternative of an ingredient counts as reachable (a partial loss still shows as GTM's "failed to add"
// warning; on 2026-10-25 every GT ingredient had a single lookup key).
//
// Recipes with no item or fluid input are skipped and listed: addRecursive accepts an empty path without storing anything, and
// GTRecipeType#searchRecipe only walks the tree, so GTM's search never returns them (GT-- empties GTM's own platinum and naquadah
// separation steps that way; GCYR's Dyson sphere controller has two). An empty one of ours is a FAIL: no machine could run it.
//
// BASELINE below: the addon-vs-addon conflicts we accept, each with its reason. Which recipe of a conflicting group is the one left
// out depends on the order GTM stages them (hash order), so an entry lists the whole group: an unreachable recipe is accepted when
// it and a recipe it collides with are both in one entry. A recipe of ours (a grindless: id, or a recipe our scripts added or
// changed: ServerEvents.recipes below records them on every load) is never accepted, on either side: it gets fixed.
// First bench run (2026-10-25, lookup-guard-1): 13 unreachable recipes, the 12 GTM logs plus the silent large reactor dynamite, all
// addon against addon. The ones that lost a route or ran the wrong recipe are fixed by the pack
// (server_scripts/grindless/integration/lookup_collisions.js, data/grindless/tables/lookup_collisions.json): their rebuilt recipes
// and the ones they collided with are in MUST_REACH, and the `collisions` check reads what the script did. Only the same-result
// duplicates stay in the baseline.
// The scan runs over server ticks, SLICE_MS of work per tick (about 1.5 s of work over 6 ticks for 44 000 recipes).
//
// For tools/analysis: the unreachable recipes (id, type, what each collides with) are written to EXPORT
// (kubejs/exported/lookup_unreachable.json, the folder gg_dump.js fills and the bench collects as results/server/kubejs-exported)
// before DONE, so a run with this test and gg_dump gives the validator the recipes GTM's lookup never finds.
//
// Markers: GGTEST|lookup|<check>|PASS|FAIL|INFO (detail), last line GGTEST|lookup|DONE
//   start              INFO: how many types, recipes and proxy recipes the scan covers
//   <recipe id>        FAIL: unreachable and not in the baseline (with what it collides with); INFO: an accepted baseline conflict
//   must_reach:<id>    PASS when the recipe exists and the lookup finds it (gtceu:gas_collector/air: 59a9bd2's fix; the lookup
//                      collision fixes and the recipes they collided with)
//   collisions         PASS when integration/lookup_collisions.js applied its table with no failure and every recipe it removed or
//                      rebuilt under a new id is gone
//   empty_path         INFO: recipes skipped because they have no item or fluid input; empty_path_ours FAIL if one is ours
//   baseline_policy    PASS when no baseline entry names a recipe of ours
//   baseline_stale     INFO: a baseline entry whose recipes are all reachable now (or gone): it can be removed
//   script_recipes     INFO: how many recipes our scripts added or changed (what "ours" means beyond grindless: ids)
//   export             PASS when EXPORT is written
//   scan               PASS/FAIL summary: types, recipes, proxies, checked, skipped, unreachable, accepted, new, timings
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var SCOPE = 'lookup'
  var FIND = 'find(java.util.Map,java.util.function.Predicate)'
  var SLICE_MS = 250
  var MAX_LISTED = 8
  var EXPORT_DIR = 'kubejs/exported'
  var EXPORT = EXPORT_DIR + '/lookup_unreachable.json'
  var MUST_REACH = [
    'gtceu:gas_collector/air',
    // lookup_collisions.js: the recipes it rebuilt on their own circuit, and what each collided with
    'grindless:distillery/distill_coal_tar_to_anthracene', 'gtceu:distillery/distill_coal_tar_to_durene',
    'grindless:chemical_reactor/dynamite', 'gtceu:chemical_reactor/bomb',
    'grindless:large_chemical_reactor/dynamite', 'gtceu:large_chemical_reactor/bomb',
    'grindless:alloy_blast_smelter/trinium_naquadah_carbonite', 'gtceu:alloy_blast_smelter/trinaquadalloy',
    // the one LV pentlandite sulfuric attack it keeps in each reactor
    'gtceu:chemical_reactor/platinum_group_sludge_dust1_lv', 'gtceu:large_chemical_reactor/platinum_group_sludge_dust1_lv'
  ]

  var BASELINE = [
    {
      ids: ['gtceu:bender/bend_lanthanum_plate_to_dense_plate', 'gtceu:bender/dense_lanthanum'],
      reason: 'GTM\'s generated dense lanthanum plate and GT--\'s copy: same plates in, same plate out, same time'
    },
    {
      ids: ['gcyr:chemical_reactor/pyrometillic_dianhydride', 'gcyr:chemical_reactor/potassium_hydroxide'],
      reason: 'GCYR registers its pyromellitic dianhydride recipe twice, the second under a potassium hydroxide id: identical'
    },
    {
      ids: ['gcyr:large_chemical_reactor/pyrometillic_dianhydride', 'gcyr:large_chemical_reactor/potassium_hydroxide'],
      reason: 'GCYR registers its pyromellitic dianhydride recipe twice, the second under a potassium hydroxide id: identical'
    },
    {
      ids: ['gtceu:extractor/extract_potassium_pyrosulfate_dust', 'gtceu:extractor/potassium_pyrosulfate_dust'],
      reason: 'GTM\'s generated extraction and GT--\'s copy: same dust in, same molten potassium pyrosulfate out'
    },
    {
      ids: ['gtceu:large_chemical_reactor/raw_palladium_separation', 'gtceu:large_chemical_reactor/raw_palladium_separation_large'],
      reason: 'GT--: the large reactor copy of the raw palladium step and its _large variant share inputs (_large also gives ethylene and water)'
    }
  ]

  var touched = null // { ids: {id: 'added'|'changed'}, added, changed, error } from the last recipe load
  var S = null // scan state while the command runs
  var L = null // Java classes, loaded on the first run

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/')
  }

  // details never carry a pipe: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(check, status, detail) {
    var line = 'GGTEST|' + SCOPE + '|' + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += ' (' + clean(detail) + ')'
    console.info(line)
  }

  function listed(ids) {
    if (ids.length === 0) return 'none'
    return ids.slice(0, MAX_LISTED).join(', ') + (ids.length > MAX_LISTED ? ' and ' + (ids.length - MAX_LISTED) + ' more' : '')
  }

  function isOurs(id) {
    return id.indexOf('grindless:') === 0 || (touched !== null && touched.ids[id] !== undefined)
  }

  function lazy() {
    if (L !== null) return L
    L = {
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      MapIngredientTypeManager: Java.loadClass('com.gregtechceu.gtceu.api.recipe.lookup.ingredient.MapIngredientTypeManager'),
      ResourceLocation: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      HashMap: Java.loadClass('java.util.HashMap'),
      Predicate: null,
      predicate: 'isEqual'
    }
    try {
      L.Predicate = Java.loadClass('java.util.function.Predicate')
    } catch (e) {
      L.predicate = 'js (' + e + ')'
    }
    return L
  }

  function exists(id) {
    return S.rm.byKey(new L.ResourceLocation(id)).isPresent()
  }

  // true only for this recipe: Predicate.isEqual (pure Java, GTRecipe#equals compares ids), or a JS function if that is refused
  function onlyThis(recipe) {
    if (L.Predicate !== null) {
      try {
        return L.Predicate.isEqual(recipe)
      } catch (e) {
        L.Predicate = null
        L.predicate = 'js (' + e + ')'
      }
    }
    var id = String(recipe.id)
    return function (r) { return String(r.id) === id }
  }

  // ---------------------------------------------------------------- what our scripts added or changed

  var ID_TYPE = /^(.*)\[([^\[\]]*)\]$/

  // RecipeJS#toString is "<id>[<type>]" (as in gg_dump.js)
  function recipeJsId(r) {
    try {
      var m = ID_TYPE.exec(String(r))
      if (m) return m[1]
    } catch (e) { /* fall through */ }
    try {
      return String(r.getId())
    } catch (e2) {
      return ''
    }
  }

  ServerEvents.recipes(function (event) {
    var ids = {}
    var added = 0
    var changed = 0
    try {
      event.originalRecipes.values().forEach(function (r) {
        if (r.removed || !r.hasChanged()) return
        ids[recipeJsId(r)] = 'changed'
        changed++
      })
      event.addedRecipes.forEach(function (r) {
        if (r.removed) return
        ids[recipeJsId(r)] = 'added'
        added++
      })
      touched = { ids: ids, added: added, changed: changed, error: null }
    } catch (e) {
      touched = { ids: ids, added: added, changed: changed, error: String(e) }
    }
  })

  // ---------------------------------------------------------------- lookup inputs of a recipe

  // byCap (Map<RecipeCapability, List<Content>>) -> the raw contents of its search-filter capabilities, merged per capability into
  // `into` (a HashMap<RecipeCapability, ArrayList<Object>>). Copied into public classes first: JDK-internal maps and lists (Map.of,
  // unmodifiable views) are not callable from Rhino.
  function addContents(into, byCap) {
    if (byCap === null || byCap === undefined) return 0
    var copy = new L.HashMap(byCap)
    var caps = new L.ArrayList(copy.keySet())
    var n = 0
    for (var i = 0; i < caps.size(); i++) {
      var cap = caps.get(i)
      if (!cap.isRecipeSearchFilter()) continue
      var raw = copy.get(cap)
      if (raw === null || raw === undefined) continue
      var contents = new L.ArrayList(raw)
      if (contents.isEmpty()) continue
      var list = into.get(cap)
      if (list === null || list === undefined) {
        list = new L.ArrayList()
        into.put(cap, list)
      }
      for (var j = 0; j < contents.size(); j++) list.add(contents.get(j).getContent())
      n += contents.size()
    }
    return n
  }

  // the inputs GTM inserts the recipe with (StagingRecipeDB#flattenedContent), or null when it has none
  function searchInputs(recipe) {
    var map = new L.HashMap()
    var n = addContents(map, recipe.inputs) + addContents(map, recipe.tickInputs)
    return n > 0 ? map : null
  }

  // the lookup keys of each input (what RecipeDB inserts per ingredient): [ArrayList<AbstractMapIngredient>, ...]
  function keyGroups(recipe) {
    var groups = []
    var map = searchInputs(recipe)
    if (map === null) return groups
    var caps = new L.ArrayList(map.keySet())
    for (var i = 0; i < caps.size(); i++) {
      var cap = caps.get(i)
      var contents = map.get(cap)
      for (var j = 0; j < contents.size(); j++) groups.push(new L.ArrayList(L.MapIngredientTypeManager.getFrom(contents.get(j), cap)))
    }
    return groups
  }

  // ---------------------------------------------------------------- scan

  function start(server) {
    lazy()
    var rm = server.getRecipeManager()
    var types = []
    var recipes = 0
    var proxies = 0
    var all = new L.ArrayList(L.GTRegistries.RECIPE_TYPES.values())
    for (var i = 0; i < all.size(); i++) {
      var rt = all.get(i)
      var T = { id: String(rt.registryName), db: rt.db(), all: new L.ArrayList(), own: 0, empty: [], index: null }
      T.all.addAll(rm.getAllRecipesFor(rt))
      T.own = T.all.size()
      try {
        var lists = new L.ArrayList(rt.getProxyRecipes().values())
        for (var k = 0; k < lists.size(); k++) T.all.addAll(lists.get(k))
      } catch (e) {
        emit('proxies:' + T.id, 'INFO', 'proxy recipes not read: ' + e)
      }
      recipes += T.own
      proxies += T.all.size() - T.own
      if (T.all.size() > 0) types.push(T)
    }
    S = {
      server: server, rm: rm, types: types, typeCount: all.size(), recipes: recipes, proxies: proxies, ti: 0, ri: 0, n: 0,
      checked: 0, skipped: 0, unreachable: [], t0: Date.now(), busy: 0, ticks: 0
    }
    emit('start', 'INFO', 'GT recipe types=' + all.size() + ' (with recipes ' + types.length + ') recipes=' + recipes +
      ' proxies=' + proxies + '; ' + SLICE_MS + ' ms of work per tick')
  }

  function checkOne(T, recipe, index) {
    var map = searchInputs(recipe)
    if (map === null) {
      T.empty.push(String(recipe.id))
      S.skipped++
      return
    }
    S.checked++
    var found
    try {
      found = T.db[FIND](map, onlyThis(recipe))
    } catch (e) {
      if (L.Predicate === null) throw e
      // the Java predicate was refused at the call: go on with the JS one
      L.Predicate = null
      L.predicate = 'js (' + e + ')'
      found = T.db[FIND](map, onlyThis(recipe))
    }
    if (found === null || found === undefined) S.unreachable.push({ T: T, index: index, recipe: recipe, id: String(recipe.id), map: map })
  }

  function step() {
    var t0 = Date.now()
    S.ticks++
    while (S.ti < S.types.length) {
      var T = S.types[S.ti]
      if (S.ri >= T.all.size()) {
        S.ti++
        S.ri = 0
        continue
      }
      checkOne(T, T.all.get(S.ri), S.ri)
      S.ri++
      S.n++
      if ((S.n & 31) === 0 && Date.now() - t0 >= SLICE_MS) break
    }
    S.busy += Date.now() - t0
    return S.ti >= S.types.length
  }

  // ---------------------------------------------------------------- what an unreachable recipe collides with

  // every recipe the lookup reaches with the same inputs (the predicate records each candidate and refuses it, so the walk goes on)
  function reachedWith(u) {
    var seen = []
    u.T.db[FIND](u.map, function (r) {
      var rid = String(r.id)
      if (rid !== u.id && seen.indexOf(rid) < 0) seen.push(rid)
      return false
    })
    return seen.sort()
  }

  // key (Java equality, as in the lookup's own maps) -> ArrayList of the indices (in T.all) of the recipes that have it, built once
  // per type that has an unreachable recipe
  function keyIndex(T) {
    if (T.index !== null) return T.index
    var idx = new L.HashMap()
    for (var i = 0; i < T.all.size(); i++) {
      var groups = keyGroups(T.all.get(i))
      for (var g = 0; g < groups.length; g++) {
        for (var k = 0; k < groups[g].size(); k++) {
          var key = groups[g].get(k)
          var list = idx.get(key)
          if (list === null || list === undefined) {
            list = new L.ArrayList()
            idx.put(key, list)
          }
          if (list.isEmpty() || Number(list.get(list.size() - 1)) !== i) list.add(i)
        }
      }
    }
    T.index = idx
    return idx
  }

  // the other recipes of the type that hold a key of every input of u (u's path ends inside theirs, or they share it)
  function coveredBy(u) {
    var idx = keyIndex(u.T)
    var groups = keyGroups(u.recipe)
    var cand = null
    var keyless = 0
    for (var g = 0; g < groups.length; g++) {
      if (groups[g].size() === 0) keyless++
      var here = {}
      for (var k = 0; k < groups[g].size(); k++) {
        var list = idx.get(groups[g].get(k))
        if (list === null || list === undefined) continue
        for (var j = 0; j < list.size(); j++) here[Number(list.get(j))] = true
      }
      if (cand === null) {
        cand = here
      } else {
        var next = {}
        for (var c in cand) if (here[c]) next[c] = true
        cand = next
      }
    }
    var out = []
    if (cand === null) cand = {}
    for (var c2 in cand) {
      if (Number(c2) !== u.index) out.push(String(u.T.all.get(Number(c2)).id))
    }
    return { ids: out.sort(), keyless: keyless }
  }

  function baselineFor(id, partners) {
    for (var i = 0; i < BASELINE.length; i++) {
      var e = BASELINE[i]
      if (e.ids.indexOf(id) < 0) continue
      var hit = partners.filter(function (p) { return e.ids.indexOf(p) >= 0 })
      if (hit.length > 0) return { entry: e, with: hit }
    }
    return null
  }

  // ---------------------------------------------------------------- report

  // what integration/lookup_collisions.js published (global.grindless.lookupCollisions): no failure, and every recipe it removed or
  // rebuilt under a new id is gone from the recipe manager (the rebuilt ones are in MUST_REACH)
  function checkCollisions() {
    var report = global.grindless ? global.grindless.lookupCollisions : undefined
    if (report === undefined || report === null) {
      emit('collisions', 'FAIL', 'global.grindless.lookupCollisions is missing: integration/lookup_collisions.js did not run')
      return false
    }
    var still = report.removed.concat(report.rebuilt.map(function (r) { return r.from })).filter(function (id) { return exists(id) })
    var ok = report.failed.length === 0 && still.length === 0 && report.rebuilt.length > 0
    emit('collisions', ok ? 'PASS' : 'FAIL', 'removed ' + report.removed.length + ' (' + report.removed.join(', ') + ')' +
      '; rebuilt ' + report.rebuilt.map(function (r) { return r.from + ' as ' + r.to + ' on circuit ' + r.circuit }).join(', ') +
      (report.missing.length > 0 ? '; not in this pack: ' + report.missing.join(', ') : '') +
      (still.length > 0 ? '; still loaded: ' + still.join(', ') : '') +
      (report.failed.length > 0 ? '; failed: ' + report.failed.join('; ') : ''))
    return ok
  }

  // EXPORT for tools/analysis (lib/dump.mjs reads it next to recipes.json and drops these recipes from its model). JsonIO.write
  // takes a Gson object, so the JS document goes through Gson's parser.
  function exportUnreachable(rows, empty) {
    var doc = {
      format: 'gg-lookup-unreachable-1',
      source: 'gg_test_recipe_lookup (tools/test/overlay/kubejs/server_scripts)',
      time: new Date().toISOString(),
      note: 'GT recipes that GTM 7.5.3\'s recipe lookup never finds from their own inputs. A proxy recipe (proxy: true, e.g. smelting ' +
        'converted for the electric furnace) is only lost in that GT type; type is the GT recipe type that loses it.',
      types: S.typeCount, recipes: S.recipes, proxies: S.proxies, checked: S.checked, skipped: S.skipped,
      unreachable: rows,
      emptyPath: empty
    }
    try {
      var dirErrors = []
      var made = [
        function () { Java.loadClass('dev.latvian.mods.kubejs.KubeJSPaths').dir(EXPORT_DIR) },
        function () { Java.loadClass('net.minecraft.FileUtil').createDirectoriesSafe(EXPORT_DIR) }
      ].some(function (fn) {
        try {
          fn()
          return true
        } catch (e) {
          dirErrors.push(String(e))
          return false
        }
      })
      var json = Java.loadClass('com.google.gson.JsonParser').parseString(JSON.stringify(doc))
      JsonIO.write(EXPORT, json)
      emit('export', 'PASS', EXPORT + ': ' + rows.length + ' unreachable recipes and ' + empty.length + ' with no item or fluid input' +
        (made ? '' : ' (the directory was not created here: ' + dirErrors.join(' ; ') + ')'))
      return true
    } catch (e2) {
      emit('export', 'FAIL', 'could not write ' + EXPORT + ': ' + e2)
      return false
    }
  }

  function report() {
    var scanMs = Date.now() - S.t0
    var t0 = Date.now()
    var unreachableIds = S.unreachable.map(function (u) { return u.id })
    var accepted = 0
    var fresh = 0
    var hitEntries = []
    var rows = []

    S.unreachable.forEach(function (u) {
      var row = { id: u.id, type: u.T.id, proxy: u.index >= u.T.own, reaches: [], shadowedBy: [], alsoOut: [], verdict: 'new' }
      rows.push(row)
      try {
        var reached = reachedWith(u)
        var cover = coveredBy(u)
        var others = cover.ids.filter(function (id) { return reached.indexOf(id) < 0 })
        // a recipe that holds all of u's keys and is in the tree: u's path ends inside its path (or is the same)
        var shadow = others.filter(function (id) { return unreachableIds.indexOf(id) < 0 })
        var alsoOut = others.filter(function (id) { return unreachableIds.indexOf(id) >= 0 })
        row.reaches = reached
        row.shadowedBy = shadow
        row.alsoOut = alsoOut
        var partners = reached.concat(shadow)
        var how = 'type ' + u.T.id + (row.proxy ? ' (proxy recipe)' : '') + '; with its own inputs the lookup reaches ' + listed(reached)
        if (shadow.length > 0) how += '; recipes holding all of its keys (its path ends inside theirs): ' + listed(shadow)
        if (alsoOut.length > 0) how += '; also left out with all of its keys: ' + listed(alsoOut)
        if (cover.keyless > 0) how += '; ' + cover.keyless + ' of its inputs give no lookup key'
        var ours = [u.id].concat(partners).filter(isOurs)
        var base = baselineFor(u.id, partners)
        if (ours.length > 0) {
          fresh++
          row.verdict = 'ours'
          emit(u.id, 'FAIL', 'unreachable, recipes of ours involved (' + ours.join(', ') + '): fix them, never baseline them; ' + how)
        } else if (base !== null) {
          accepted++
          row.verdict = 'accepted'
          row.reason = base.entry.reason
          if (hitEntries.indexOf(base.entry) < 0) hitEntries.push(base.entry)
          emit(u.id, 'INFO', 'accepted, collides with ' + base.with.join(', ') + ': ' + base.entry.reason + '; ' + how)
        } else {
          fresh++
          emit(u.id, 'FAIL', 'unreachable, not in the baseline; ' + how)
        }
      } catch (e) {
        fresh++
        row.error = String(e)
        emit(u.id, 'FAIL', 'unreachable; the collision report failed: ' + e)
      }
    })

    var mustOk = 0
    MUST_REACH.forEach(function (id) {
      var present = exists(id)
      var ok = present && unreachableIds.indexOf(id) < 0
      if (ok) mustOk++
      emit('must_reach:' + id, ok ? 'PASS' : 'FAIL', !present ? 'the recipe is missing' : (ok ? 'the lookup finds it from its own inputs' : 'unreachable'))
    })
    var collisionsOk = checkCollisions()

    var empty = []
    S.types.forEach(function (T) { empty = empty.concat(T.empty) })
    empty.sort()
    emit('empty_path', 'INFO', empty.length + ' recipes with no item or fluid input: never in the lookup tree, GTM\'s search cannot return them ' +
      '(only a machine with its own recipe logic runs one): ' + (empty.length > 0 ? empty.join(', ') : 'none'))
    var emptyOurs = empty.filter(isOurs)
    if (emptyOurs.length > 0) emit('empty_path_ours', 'FAIL', 'recipes of ours with no item or fluid input, no machine can find them: ' + listed(emptyOurs))

    var policy = []
    BASELINE.forEach(function (e) {
      e.ids.forEach(function (id) { if (isOurs(id)) policy.push(id) })
    })
    emit('baseline_policy', policy.length === 0 ? 'PASS' : 'FAIL', policy.length === 0
      ? BASELINE.length + ' entries, none names a recipe of ours'
      : 'baseline entries name recipes of ours (fix them instead): ' + policy.join(', '))
    BASELINE.forEach(function (e) {
      if (hitEntries.indexOf(e) >= 0) return
      var missing = e.ids.filter(function (id) { return !exists(id) })
      emit('baseline_stale', 'INFO', e.ids.join(' + ') + ': ' + (missing.length > 0 ? 'missing ' + missing.join(', ') : 'all reachable now') +
        '; the entry can go')
    })

    if (touched === null) {
      emit('script_recipes', 'INFO', 'no recipe load seen by this script: only grindless: ids count as ours')
    } else {
      emit('script_recipes', 'INFO', 'our scripts added ' + touched.added + ' and changed ' + touched.changed + ' recipes' +
        (touched.error ? '; the record stopped early: ' + touched.error : ''))
    }

    var exported = exportUnreachable(rows, empty)

    var failed = fresh + (emptyOurs.length > 0 ? 1 : 0) + (policy.length > 0 ? 1 : 0) + (MUST_REACH.length - mustOk) +
      (collisionsOk ? 0 : 1) + (exported ? 0 : 1)
    emit('scan', failed === 0 ? 'PASS' : 'FAIL', 'types=' + S.typeCount + ' recipes=' + S.recipes + ' proxies=' + S.proxies + ' checked=' + S.checked +
      ' skipped=' + S.skipped + ' unreachable=' + S.unreachable.length + ' accepted=' + accepted + ' new=' + fresh +
      ' scanMs=' + scanMs + ' busyMs=' + S.busy + ' ticks=' + S.ticks + ' reportMs=' + (Date.now() - t0) + ' predicate=' + L.predicate)
  }

  function done() {
    console.info('GGTEST|' + SCOPE + '|DONE')
    S = null
  }

  ServerEvents.customCommand('gg_test_recipe_lookup', function (event) {
    if (S !== null) {
      emit('run', 'INFO', 'a scan is already running')
      return 1
    }
    try {
      start(event.getLevel().getServer())
    } catch (e) {
      emit('run', 'FAIL', 'exception while starting: ' + e)
      done()
    }
    return 1
  })

  ServerEvents.tick(function () {
    if (S === null) return
    try {
      if (!step()) return
      report()
    } catch (e) {
      emit('run', 'FAIL', 'exception: ' + e)
    }
    done()
  })
})()
