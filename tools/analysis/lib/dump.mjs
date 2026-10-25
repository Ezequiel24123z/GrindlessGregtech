// Loads the dump written by tools/test/overlay/kubejs/server_scripts/gg_dump.js
// (recipes.json, tags.json, items.json and, optionally, machines.json, veins.json, info.json).
import fs from 'node:fs';
import path from 'node:path';

/** Tag members. An empty vanilla tag shows up as [minecraft:barrier]: treated as empty. */
export class TagIndex {
  constructor(tagsDoc) {
    this.itemTags = new Map(Object.entries((tagsDoc && tagsDoc.item) || {}));
    this.fluidTags = new Map(Object.entries((tagsDoc && tagsDoc.fluid) || {}));
    this.missing = new Set();
    this.empty = new Set();
  }

  items(tag) {
    const v = this.itemTags.get(tag);
    if (v === undefined) {
      this.missing.add(tag);
      return [];
    }
    if (v.length === 0 || (v.length === 1 && v[0] === 'minecraft:barrier')) {
      this.empty.add(tag);
      return [];
    }
    return v;
  }

  fluids(tag) {
    const v = this.fluidTags.get(tag);
    if (v === undefined || v.length === 0) {
      // Fluid tags are only saved if they have members; a "forge:xyz" that doesn't appear doesn't exist as a fluid.
      this.missing.add('fluid:' + tag);
      return [];
    }
    return v;
  }
}

function readIfExists(dir, name, required) {
  const p = path.join(dir, name);
  if (!fs.existsSync(p)) {
    if (required) throw new Error(`${name} is missing in ${dir} (did the gg_dump run?)`);
    return null;
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function loadDump(dir) {
  const docs = {
    recipes: readIfExists(dir, 'recipes.json', true),
    items: readIfExists(dir, 'items.json', true),
    tags: readIfExists(dir, 'tags.json', true),
    machines: readIfExists(dir, 'machines.json', false),
    veins: readIfExists(dir, 'veins.json', false),
    fluidVeins: readIfExists(dir, 'fluid_veins.json', false),
    config: readIfExists(dir, 'config.json', false),
    structures: readIfExists(dir, 'structures.json', false),
    info: readIfExists(dir, 'info.json', false),
  };
  return makeDump(dir, docs);
}

function normalizeConfig(values) {
  const out = {};
  for (const [k, v] of Object.entries(values)) out[k] = v === 'true' ? true : v === 'false' ? false : v;
  return out;
}

/** Builds the dump from already-read documents (also used by tests, with no disk access). */
export function makeDump(dir, docs) {
  const recipesDoc = docs.recipes;
  const itemsDoc = docs.items;
  const machinesDoc = docs.machines || null;
  const veinsDoc = docs.veins || null;

  const recipes = new Map();
  let parseErrors = 0;
  for (const entry of recipesDoc.recipes || []) {
    try {
      const r = typeof entry === 'string' ? JSON.parse(entry) : entry;
      // Ones added by scripts go last and replace a recipe with the same id (same as KubeJS does).
      recipes.set(r.i, { id: r.i, type: r.t, added: !!r.a, json: r.j });
    } catch {
      parseErrors++;
    }
  }

  const machines = new Map();
  const recipeTypes = new Map();
  if (machinesDoc) {
    for (const m of machinesDoc.machines || []) machines.set(m.id, m);
    for (const t of machinesDoc.recipeTypes || []) recipeTypes.set(t.id, t);
  }

  return {
    dir,
    info: docs.info || null,
    recipes,
    parseErrors,
    items: new Set(itemsDoc.items || []),
    fluids: new Set(itemsDoc.fluids || []),
    tags: new TagIndex(docs.tags),
    machines,
    recipeTypes,
    veins: veinsDoc ? veinsDoc.veins || [] : null,
    // GT fluid deposits (fluid drilling rig): [{id, fluid, weight, dims: [..] | null}]; null if not dumped
    fluidVeins: docs.fluidVeins ? docs.fluidVeins.veins || [] : null,
    // GTM config switches that matter for progression: {"worldgen.oreVeins...": true|false|null}; null with no config.json
    // (early dumps wrote "true"/"false" as text: normalized here)
    config: docs.config ? normalizeConfig(docs.config.gtceu || {}) : null,
    // data description of the pack's multiblock patterns (global.grindless.structures); empty if not dumped
    structures: new Map(Object.entries((docs.structures && docs.structures.structures) || {})),
  };
}
