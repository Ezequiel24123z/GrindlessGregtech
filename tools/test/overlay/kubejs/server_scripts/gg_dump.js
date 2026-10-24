// priority: -100000
// Gregtech Grindless - dump for the static progression validator (tools/analysis/reachability.mjs).
// TEST-ONLY overlay: copied over the instance on the test PC, never shipped with the pack.
//
// This script loads LAST, so its ServerEvents.recipes handler sees the final recipe set (after the pack
// scripts removed, changed or added recipes). Trigger the export through RCON:
//   kubejs custom_command gg_dump
// Files written to kubejs/exported/: recipes.json tags.json items.json machines.json veins.json fluid_veins.json config.json
//   structures.json info.json
// Log markers (latest.log): GGTEST|dump|COLLECTED|..., GGTEST|dump|DONE|..., GGTEST|dump|FAIL|...
//
// recipes.json = {format, count, recipes:[ "<one JSON object per string>" ]}; each object is
//   {"i": recipe id, "t": recipe type, "a": 1 when a script added it, "j": the raw recipe JSON}
// Strings keep the file at one recipe per line (JsonIO pretty-prints every nested element otherwise).

(function () {
  'use strict';

  var TAG = 'GGTEST|dump|';
  var OUT_DIR = 'kubejs/exported';
  var state = { lines: null, stats: null, types: null };
  var gsonClasses = null;

  function info(msg) { console.info(TAG + msg); }
  function str(x) { return String(x); }
  function q(x) { return JSON.stringify(String(x)); }
  function num(x) { return Number(x); }

  // ---------------------------------------------------------------- recipes (ServerEvents.recipes)

  function collectRecipes(event) {
    var t0 = Date.now();
    var lines = [];
    var types = {};
    var st = {
      original: 0, added: 0, removed: 0, changed: 0, serializeFail: 0, errors: 0, noJson: 0,
      firstError: '', firstSerializeError: ''
    };

    // RecipeJS.toString() is "<id>[<type>]" (the type is a Rhino function object whose Java fields scripts cannot read).
    var ID_TYPE = /^(.*)\[([^\[\]]*)\]$/;

    function idAndType(r) {
      var id = '';
      var ty = '?';
      try {
        var m = ID_TYPE.exec(str(r));
        if (m) { id = m[1]; ty = m[2]; }
      } catch (e1) { /* fall through */ }
      if (!id) {
        try { id = str(r.getId()); } catch (e2) { id = ''; }
      }
      return { id: id, ty: ty };
    }

    function one(r, isAdded) {
      try {
        if (r.removed) { st.removed++; return; }
        // RecipeJS only copies script changes into .json when the recipe is created, so do it now.
        if (isAdded || r.hasChanged()) {
          if (!isAdded) st.changed++;
          try {
            r.serialize();
          } catch (e) {
            st.serializeFail++;
            if (!st.firstSerializeError) st.firstSerializeError = str(e);
          }
        }
        var j = r.json;
        if (j === null || j === undefined) { st.noJson++; return; }
        var it = idAndType(r);
        types[it.ty] = (types[it.ty] || 0) + 1;
        lines.push('{"i":' + q(it.id) + ',"t":' + q(it.ty) + (isAdded ? ',"a":1' : '') + ',"j":' + str(j) + '}');
        if (isAdded) st.added++; else st.original++;
      } catch (e) {
        st.errors++;
        if (!st.firstError) st.firstError = str(e);
      }
    }

    event.originalRecipes.values().forEach(function (r) { one(r, false); });
    event.addedRecipes.forEach(function (r) { one(r, true); });

    state.lines = lines;
    state.stats = st;
    state.types = types;
    info('COLLECTED|recipes=' + lines.length + '|original=' + st.original + '|added=' + st.added +
      '|removed=' + st.removed + '|changed=' + st.changed + '|serializeFail=' + st.serializeFail +
      '|errors=' + st.errors + '|noJson=' + st.noJson + '|ms=' + (Date.now() - t0));
    if (st.firstError) info('NOTE|firstError=' + st.firstError);
    if (st.firstSerializeError) info('NOTE|firstSerializeError=' + st.firstSerializeError);
  }

  // JDK-internal collection classes (unmodifiable views, streams, immutable lists...) are not callable from Rhino
  // (IllegalAccessException); copying into a public java.util.ArrayList first always works.
  function each(coll, fn) {
    var AL = Java.loadClass('java.util.ArrayList');
    var a = new AL(coll);
    for (var i = 0; i < a.size(); i++) fn(a.get(i));
  }

  // ---------------------------------------------------------------- registries

  function dumpItems() {
    var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries');
    var items = [];
    var fluids = [];
    each(BI.ITEM.keySet(), function (k) { items.push(str(k)); });
    each(BI.FLUID.keySet(), function (k) { fluids.push(str(k)); });
    items.sort();
    fluids.sort();
    return { format: 'gg-items-1', items: items, fluids: fluids };
  }

  // Tags that analysis configs commonly name even when no recipe references them. c:hidden_from_recipe_viewers is the pack's
  // "hidden in EMI" tag: the obtainability audit (tools/analysis, --pass obtain) uses it to tell what is already hidden;
  // grindless:hidden_with_recipes is the part of it whose recipes EMI hides too (integration/hidden.js).
  var SEED_TAGS = [
    'minecraft:logs', 'minecraft:logs_that_burn', 'minecraft:planks', 'minecraft:saplings', 'minecraft:leaves',
    'minecraft:sand', 'minecraft:coals', 'minecraft:flowers', 'minecraft:wool', 'minecraft:stone_crafting_materials',
    'minecraft:stone_tool_materials', 'minecraft:coal_ores', 'minecraft:iron_ores', 'minecraft:copper_ores',
    'forge:cobblestone', 'forge:stone', 'forge:sand', 'forge:gravel', 'forge:dirt', 'forge:ores', 'forge:raw_materials',
    'forge:seeds', 'forge:crops', 'forge:sugar_cane', 'forge:gems/coal', 'forge:rods/wooden', 'gtceu:fuels',
    'gtceu:tools/hammers', 'gtceu:tools/files', 'gtceu:tools/mortars', 'gtceu:tools/saws', 'c:hidden_from_recipe_viewers',
    'grindless:hidden_with_recipes'
  ];

  // Tag ids referenced by any collected recipe ("tag":"x" ingredients, "#x" fluid conditions) plus the seeds.
  function referencedTags() {
    var found = {};
    var re1 = /"tag":"([^"]+)"/g;
    var re2 = /"#([a-z0-9_.\/-]+:[a-z0-9_.\/-]+)"/g;
    var m;
    for (var i = 0; i < state.lines.length; i++) {
      var s = state.lines[i];
      re1.lastIndex = 0;
      while ((m = re1.exec(s)) !== null) found[m[1]] = 1;
      re2.lastIndex = 0;
      while ((m = re2.exec(s)) !== null) found[m[1]] = 1;
    }
    SEED_TAGS.forEach(function (t) { found[t] = 1; });
    return Object.keys(found).sort();
  }

  // Every item/fluid tag referenced by a recipe, with its flattened members (final state: after tag events and
  // datapacks). Registry.getTagNames() is a Stream and ItemStack.getTags() clashes with vanilla, so tags are
  // resolved one by one: items through Ingredient.of('#tag'), fluids through the fluid registry.
  function dumpTags() {
    var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries');
    var Lists = Java.loadClass('com.google.common.collect.Lists');
    var TagKey = Java.loadClass('net.minecraft.tags.TagKey');
    var Registries = Java.loadClass('net.minecraft.core.registries.Registries');
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation');
    var names = referencedTags();
    var itemTags = {};
    var fluidTags = {};
    var nonEmpty = 0;
    var itemErrors = 0;
    var fluidErrors = 0;
    var firstError = '';
    names.forEach(function (tag) {
      var ids = [];
      try {
        var ing = Ingredient.of('#' + tag);
        each(ing.getItemIds(), function (id) { ids.push(str(id)); });
      } catch (e1) {
        itemErrors++;
        if (!firstError) firstError = tag + ': ' + str(e1);
      }
      // vanilla fills an empty tag with a barrier named "Empty Tag: <tag>"
      if (ids.length === 1 && ids[0] === 'minecraft:barrier') ids = [];
      ids.sort();
      itemTags[tag] = ids;
      if (ids.length > 0) nonEmpty++;

      var fids = [];
      try {
        var tk = TagKey.create(Registries.FLUID, new RL(tag));
        each(Lists.newArrayList(BI.FLUID.getTagOrEmpty(tk)), function (h) { fids.push(str(BI.FLUID.getKey(h.value()))); });
      } catch (e2) {
        fluidErrors++;
        if (!firstError) firstError = tag + ': ' + str(e2);
      }
      fids.sort();
      if (fids.length > 0) fluidTags[tag] = fids;
    });
    info('TAGS|referenced=' + names.length + '|itemTagsWithMembers=' + nonEmpty + '|fluidTagsWithMembers=' +
      Object.keys(fluidTags).length + '|itemErrors=' + itemErrors + '|fluidErrors=' + fluidErrors);
    if (firstError) info('NOTE|tags first error: ' + firstError);
    if (nonEmpty === 0) throw new Error('no item tag has members (' + firstError + ')');
    return { format: 'gg-tags-2', item: itemTags, fluid: fluidTags };
  }

  // GT machine definitions (which machine runs which recipe types) and the GT recipe types.
  function dumpMachines() {
    var GTR = Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries');
    var MBD = null;
    try { MBD = Java.loadClass('com.gregtechceu.gtceu.api.machine.MultiblockMachineDefinition'); } catch (e) { /* optional */ }
    var machines = [];
    each(GTR.MACHINES.values(), function (md) {
      var rec = { id: str(md.getId()), tier: num(md.getTier()), types: [] };
      var rts = md.getRecipeTypes();
      for (var k = 0; k < rts.length; k++) rec.types.push(str(rts[k].registryName));
      if (MBD !== null && md instanceof MBD) rec.mb = 1;
      machines.push(rec);
    });
    machines.sort(function (a, b) { return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0); });
    var recipeTypes = [];
    each(GTR.RECIPE_TYPES.values(), function (rt) {
      var rec = { id: str(rt.registryName), group: str(rt.group), proxies: [] };
      try { each(rt.getProxyRecipes().keySet(), function (p) { rec.proxies.push(str(p)); }); } catch (e) { /* optional */ }
      recipeTypes.push(rec);
    });
    recipeTypes.sort(function (a, b) { return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0); });
    return { format: 'gg-machines-1', machines: machines, recipeTypes: recipeTypes };
  }

  // GT ore veins: layer (stone/deepslate/netherrack/endstone), dimensions and every material the vein can hold.
  function dumpVeins() {
    var GTR = Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries');
    var veins = [];
    each(GTR.ORE_VEINS.keys(), function (key) {
      var def = GTR.ORE_VEINS.get(key);
      var rec = { id: str(key), weight: 0, layer: '', dims: [], mats: [] };
      try { rec.weight = num(def.weight()); } catch (e1) { /* optional */ }
      try { rec.layer = str(def.layer().getSerializedName()); } catch (e2) { /* optional */ }
      try { each(def.dimensionFilter(), function (d) { rec.dims.push(str(d.location())); }); } catch (e3) { /* optional */ }
      try {
        each(def.veinGenerator().getAllMaterials(), function (m) { rec.mats.push(str(m.getResourceLocation())); });
      } catch (e4) {
        rec.matsError = str(e4);
      }
      veins.push(rec);
    });
    veins.sort(function (a, b) { return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0); });
    return { format: 'gg-veins-1', veins: veins };
  }

  // GT bedrock fluid deposits (what the fluid drilling rig pumps): fluid, weight, yields and the dimensions where each can
  // appear. GTM's rule is "dimension filter is null OR contains the dimension", so dims: null means every dimension and an
  // empty list means none.
  function dumpFluidVeins() {
    var GTR = Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries');
    var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries');
    var veins = [];
    each(GTR.BEDROCK_FLUID_DEFINITIONS.keys(), function (key) {
      var def = GTR.BEDROCK_FLUID_DEFINITIONS.get(key);
      var rec = { id: str(key), fluid: '', weight: 0, minYield: 0, maxYield: 0, depletedYield: 0, dims: null };
      try { rec.weight = num(def.getWeight()); } catch (e1) { /* optional */ }
      try { rec.minYield = num(def.getMinimumYield()); rec.maxYield = num(def.getMaximumYield()); } catch (e2) { /* optional */ }
      try { rec.depletedYield = num(def.getDepletedYield()); } catch (e3) { /* optional */ }
      try { rec.fluid = str(BI.FLUID.getKey(def.getStoredFluid().get())); } catch (e4) { rec.fluidError = str(e4); }
      try {
        var filter = def.getDimensionFilter();
        if (filter !== null && filter !== undefined) {
          rec.dims = [];
          each(filter, function (d) { rec.dims.push(str(d.location())); });
          rec.dims.sort();
        }
      } catch (e5) {
        rec.dimsError = str(e5);
      }
      veins.push(rec);
    });
    veins.sort(function (a, b) { return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0); });
    return { format: 'gg-fluid-veins-1', veins: veins };
  }

  // The GTM config switches that decide progression (the analyzer's "requires"/"sustainedIf" read these). A value that
  // cannot be read is null (unknown), never a guessed default.
  var CONFIG_KEYS = [
    ['worldgen.oreVeins.infiniteBedrockOresFluids', function (c) { return c.worldgen.oreVeins.infiniteBedrockOresFluids; }],
    ['machines.enableMaintenance', function (c) { return c.machines.enableMaintenance; }],
    ['machines.doBedrockOres', function (c) { return c.machines.doBedrockOres; }],
    ['gameplay.hazardsEnabled', function (c) { return c.gameplay.hazardsEnabled; }],
    ['compat.energy.enableFEConverters', function (c) { return c.compat.energy.enableFEConverters; }]
  ];

  // Rhino hands back a java.lang.Boolean/Number as an object (typeof 'object'), so JSON.stringify would turn it into a string.
  function plainValue(v) {
    if (v === null || v === undefined) return null;
    if (typeof v === 'boolean' || typeof v === 'number') return v;
    var s = String(v);
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (s !== '' && !isNaN(Number(s))) return Number(s);
    return s;
  }

  function dumpConfig() {
    var CH = Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder');
    var inst = CH.INSTANCE;
    var values = {};
    CONFIG_KEYS.forEach(function (entry) {
      try {
        values[entry[0]] = plainValue(entry[1](inst));
      } catch (e) {
        values[entry[0]] = null;
      }
    });
    return { format: 'gg-config-1', gtceu: values };
  }

  // Multiblock patterns of the pack: lib/patterns.js records a plain-data description of every pattern in
  // global.grindless.structures (shared by all script types). The analyzer reads the parts each multiblock needs from
  // here instead of keeping a hand-copied list.
  function dumpStructures() {
    var out = {};
    var G = null;
    try { G = global.grindless; } catch (e) { G = null; }
    var found = G !== null && G !== undefined && G.structures !== undefined && G.structures !== null;
    if (found) {
      Object.keys(G.structures).forEach(function (id) {
        out[id] = JSON.parse(JSON.stringify(G.structures[id]));
      });
    }
    info('STRUCTURES|found=' + found + '|count=' + Object.keys(out).length);
    return { format: 'gg-structures-1', structures: out };
  }

  // What integration/hidden.js hides (global.grindless.hidden): the analyzer's obtain pass checks the dump's
  // c:hidden_from_recipe_viewers against its audit up to this era. Absent on packs without hidden.js.
  function dumpHidden() {
    var H = null;
    try { H = global.grindless ? global.grindless.hidden : null; } catch (e) { H = null; }
    if (H === null || H === undefined || H.implementedEra === undefined) return null;
    var removed = H.removed || {};
    return {
      implementedEra: str(H.implementedEra),
      groups: Number(H.hidden ? H.hidden.groups : 0),
      items: Number(H.hidden && H.hidden.items ? H.hidden.items.length : 0),
      fluids: Number(H.hidden && H.hidden.fluids ? H.hidden.fluids.length : 0),
      removedRecipes: Number(removed.original || 0) + Number(removed.added || 0)
    };
  }

  function dumpInfo(counts, written) {
    var mods = [];
    try {
      var P = Java.loadClass('dev.architectury.platform.Platform');
      each(P.getMods(), function (m) { mods.push(str(m.getModId()) + '@' + str(m.getVersion())); });
      mods.sort();
    } catch (e) { /* optional */ }
    var out = {
      format: 'gg-info-1',
      counts: counts,
      recipeTypes: state.types || {},
      stats: state.stats || {},
      written: written,
      mods: mods
    };
    var hidden = null;
    try { hidden = dumpHidden(); } catch (e) { hidden = null; }
    if (hidden !== null) out.hidden = hidden;
    return out;
  }

  // ---------------------------------------------------------------- output

  function gson() {
    if (gsonClasses === null) {
      gsonClasses = {
        Obj: Java.loadClass('com.google.gson.JsonObject'),
        Arr: Java.loadClass('com.google.gson.JsonArray'),
        Prim: Java.loadClass('com.google.gson.JsonPrimitive'),
        Parser: null,
        Null: null
      };
      try { gsonClasses.Null = Java.loadClass('com.google.gson.JsonNull').INSTANCE; } catch (e) { /* falls back to "" */ }
      try { gsonClasses.Parser = Java.loadClass('com.google.gson.JsonParser'); } catch (e) { /* booleans fall back to Rhino's pick */ }
    }
    return gsonClasses;
  }

  // JS value -> Gson tree (JsonIO.write only takes a JsonObject).
  function toGson(x) {
    var G = gson();
    var t = typeof x;
    var i;
    if (t === 'string') return new G.Prim(x);
    if (t === 'number') return new G.Prim(x);
    if (t === 'boolean') {
      // Rhino resolves new JsonPrimitive(<boolean>) to the String overload ("true" with quotes); parsing the literal gives the
      // Boolean primitive. The analyzer reads either form.
      if (G.Parser !== null && G.Parser !== undefined) {
        try { return G.Parser.parseString(x ? 'true' : 'false'); } catch (e) { /* use the plain value */ }
      }
      return new G.Prim(x);
    }
    if (x === null || x === undefined) return G.Null !== null && G.Null !== undefined ? G.Null : new G.Prim('');
    if (Array.isArray(x)) {
      var a = new G.Arr();
      for (i = 0; i < x.length; i++) a.add(toGson(x[i]));
      return a;
    }
    var o = new G.Obj();
    var keys = Object.keys(x);
    for (i = 0; i < keys.length; i++) o.add(keys[i], toGson(x[keys[i]]));
    return o;
  }

  // kubejs/exported does not exist on a fresh instance; KubeJSPaths.dir() creates missing directories.
  function ensureDir() {
    var attempts = [
      function () { Java.loadClass('dev.latvian.mods.kubejs.KubeJSPaths').dir(OUT_DIR); },
      function () { Java.loadClass('net.minecraft.FileUtil').createDirectoriesSafe(OUT_DIR); }
    ];
    var errors = [];
    for (var i = 0; i < attempts.length; i++) {
      try {
        attempts[i]();
        return true;
      } catch (e) {
        errors.push(str(e));
      }
    }
    info('NOTE|could not create ' + OUT_DIR + ' (' + errors.join(' ; ') + '); relying on an existing directory');
    return false;
  }

  function writeJson(name, obj) {
    var path = OUT_DIR + '/' + name;
    try {
      JsonIO.write(path, toGson(obj));
      return null;
    } catch (e1) {
      try {
        JsonIO.write(path, obj);
        return null;
      } catch (e2) {
        return name + ': ' + str(e1) + ' / ' + str(e2);
      }
    }
  }

  function dumpAll() {
    var t0 = Date.now();
    if (state.lines === null) {
      console.error(TAG + 'FAIL|no recipes collected (the ServerEvents.recipes handler did not run in this load)');
      return;
    }
    ensureDir();

    var failures = [];
    var written = [];
    var counts = { recipes: state.lines.length };
    var types = state.types || {};

    function step(name, build) {
      try {
        var obj = build();
        var problem = writeJson(name, obj);
        if (problem === null) written.push(name); else failures.push(problem);
        return obj;
      } catch (e) {
        failures.push(name + ': ' + str(e));
        return null;
      }
    }

    step('recipes.json', function () {
      return { format: 'gg-recipes-1', count: state.lines.length, recipes: state.lines };
    });
    var tags = step('tags.json', dumpTags);
    var items = step('items.json', dumpItems);
    var machines = step('machines.json', dumpMachines);
    var veins = step('veins.json', dumpVeins);
    var fluidVeins = step('fluid_veins.json', dumpFluidVeins);
    var gtConfig = step('config.json', dumpConfig);
    var structures = step('structures.json', dumpStructures);

    if (tags) counts.itemTags = Object.keys(tags.item).length;
    if (tags) counts.fluidTags = Object.keys(tags.fluid).length;
    if (items) counts.items = items.items.length;
    if (items) counts.fluids = items.fluids.length;
    if (machines) counts.machines = machines.machines.length;
    if (machines) counts.recipeTypes = machines.recipeTypes.length;
    if (veins) counts.veins = veins.veins.length;
    if (fluidVeins) counts.fluidVeins = fluidVeins.veins.length;
    if (gtConfig) counts.config = Object.keys(gtConfig.gtceu).length;
    if (structures) counts.structures = Object.keys(structures.structures).length;
    counts.veinDrilling = types['gtceu:vein_drilling'] || 0;
    counts.greenhouse = types['gtceu:greenhouse'] || 0;

    var infoProblem = writeJson('info.json', dumpInfo(counts, written));
    if (infoProblem === null) written.push('info.json'); else failures.push(infoProblem);

    var summary = Object.keys(counts).map(function (k) { return k + '=' + counts[k]; }).join('|');
    var mandatory = ['recipes.json', 'tags.json', 'items.json'];
    var missing = mandatory.filter(function (n) { return written.indexOf(n) < 0; });
    failures.forEach(function (f) { info('WARN|write failed: ' + f); });
    if (missing.length > 0) {
      console.error(TAG + 'FAIL|missing ' + missing.join(',') + '|' + summary);
    } else {
      info('DONE|' + summary + '|files=' + written.join(',') + '|ms=' + (Date.now() - t0));
    }
  }

  ServerEvents.recipes(function (event) {
    try {
      collectRecipes(event);
    } catch (e) {
      state.lines = null;
      console.error(TAG + 'FAIL|collect: ' + str(e));
    }
  });

  ServerEvents.loaded(function () {
    info('READY|recipes=' + (state.lines === null ? -1 : state.lines.length));
  });

  ServerEvents.customCommand('gg_dump', function () {
    try {
      dumpAll();
    } catch (e) {
      console.error(TAG + 'FAIL|exception: ' + str(e));
    }
  });
})();
