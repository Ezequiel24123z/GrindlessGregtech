// Regla de eras (decisión del 2026-10-24): nada de una era puede pedir un recurso que sale en una era posterior.
//
// Configuración (tiers/<tier>.json; se hereda y se combina por id, ver lib/config.mjs):
//   eraOrder        orden de las eras: ["steam", "lv", "mv", "hv", "ev", "iv", ...].
//   eraResources[]  lo que trae cada era: {id, era, label, items?, exclude?, dimensions?, onlyFrom?, note}
//     items         globs sobre claves de objeto y de fluido (`fluid:gtceu:titanium`): esas claves se quitan de TODA fuente
//                   (ninguna receta las da, aunque la receta siga dando lo demás; ningún hecho del mundo; ninguna veta, abeja
//                   ni receta de un addon). Así cuenta lo que es de ese material, venga de donde venga.
//     dimensions    se quitan las fuentes del mundo que se recogen allí (`origin` de la entrada de `world`, o las dimensiones
//                   de su `fromVeins`) y las recetas que solo valen allí (condición de dimensión).
//     onlyFrom      comprobación de exclusividad: [ids de otros recursos] (p. ej. ["luna"]); sin ellos, ninguna clave de este
//                   recurso debe alcanzarse ("el titanio solo sale de la Luna"). Si sale, FUGA con las fuentes por las que
//                   entra (reglas que lo dan sin gastarlo y cuyas entradas no lo llevan; el reciclaje no cuenta como fuente).
//   eraItems[]      lo que pertenece a cada era: {id, era, label, items?, exclude?, inputsOf?, optional?, note}
//     items         ids o globs (con * o ?) sobre el registro y el grafo (objetos, `fluid:`, máquinas construidas `m:<id>`).
//                   Un objeto que casa con un glob y que es él mismo de un recurso posterior (gtceu:hv_titanium_drill, la
//                   herramienta HV con cabezal de titanio) no cuenta como de la era: es de ese recurso. Uno explícito sí.
//     inputsOf      globs sobre ids de receta: cada entrada (ranura) de esas recetas es un objeto de la era; se cumple con
//                   cualquiera de sus alternativas (la broca y las muestras de la perforadora HV: grindless:vein_drilling/hv/*).
//     optional      si falla, WARN (lo que aún no ha llegado: el cohete de GCYR en inox).
// Comprobación: cada objeto de la era E se alcanza (como en la puerta: recoger a mano vale) con TODOS los recursos de las eras
// posteriores a E quitados. Los objetos de salida de una era (el casco EV que HV fabrica como puerta) son de la era siguiente.
// Una violación lleva la cadena más corta hasta el recurso posterior que tira de ella.
import { blockCosts, lfp } from './engine.mjs';
import { blockedRoots, blockedTree, derivationTree, describeRule, makeRootCost, renderTree } from './explain.mjs';
import { asArray, makeGlobMatcher } from './util.mjs';

// claves que no son material (máquinas, energía, ranuras muertas...): un recurso nunca las quita. Las salidas con NBT que el
// normalizador no reduce (los panales configurables de Productive Bees) quedan como claves que no son texto: tampoco cuentan.
const SPECIAL = /^(m|run|eu|ae|dead|cond):/;
const isName = (n) => typeof n === 'string';
const INPUT_ROLES = new Set(['item', 'fluid', 'tool', 'molde']);
const hasGlob = (s) => /[*?]/.test(s);
const MAX_DETAIL = 25;

function eraLabel(r) {
  return `${r.label || r.id} (${r.era})`;
}

/** Recursos y grupos de objetos de la configuración, resueltos sobre el grafo y el registro del volcado. */
export function prepareEras(model) {
  const { cfg, g, dump, warnings } = model;
  const order = cfg.eraOrder || [];
  const idx = new Map(order.map((e, i) => [e, i]));
  const active = cfg.eraItems.length > 0 || cfg.eraResources.length > 0;
  if (active && order.length === 0) warnings.push('regla de eras: hay eraResources/eraItems pero falta eraOrder; no se comprueba');
  const known = (what, id, era) => {
    if (idx.has(era)) return true;
    warnings.push(`regla de eras: ${what} ${id} tiene la era «${era}», que no está en eraOrder; se ignora`);
    return false;
  };

  const resources = [];
  for (const r of cfg.eraResources) {
    if (!known('el recurso', r.id, r.era)) continue;
    const match = makeGlobMatcher(asArray(r.items));
    const excl = makeGlobMatcher(asArray(r.exclude));
    const keys = [];
    if (r.items) {
      for (let k = 0; k < g.nKeys; k++) {
        const n = g.keyNames[k];
        if (isName(n) && !SPECIAL.test(n) && match(n) && !excl(n)) keys.push(k);
      }
      if (keys.length === 0) warnings.push(`regla de eras: el recurso ${r.id} (${asArray(r.items).join(', ')}) no casa con ningún objeto ni fluido del pack`);
    }
    const dims = asArray(r.dimensions);
    resources.push({ ...r, label: r.label || r.id, keys, dims, rank: idx.get(r.era), onlyFrom: asArray(r.onlyFrom) });
  }
  const resById = new Map(resources.map((r) => [r.id, r]));

  const graphKeyOf = (name) => g.keyIndex.get(name);
  // ¿existe en el pack? Para objetos y fluidos manda el registro del volcado: un objetivo que nombra algo que aún no existe crea
  // su clave en el grafo, así que tener clave no basta.
  const exists = (name) => {
    if (name.startsWith('fluid:')) return dump.fluids.has(name.slice(6));
    if (name.startsWith('m:') || name.startsWith('run:')) return model.entriesById.has(name.slice(name.indexOf(':') + 1));
    if (SPECIAL.test(name)) return graphKeyOf(name) !== undefined;
    return dump.items.has(name);
  };
  let universe = null;
  const candidates = () => {
    if (!universe) {
      // objetos y fluidos del registro, más las claves que no son material (máquinas construidas m:, energía...)
      universe = new Set();
      for (const i of dump.items) universe.add(i);
      for (const f of dump.fluids) universe.add('fluid:' + f);
      for (const n of g.keyNames) if (isName(n) && /^(m|run|eu|ae):/.test(n)) universe.add(n);
    }
    return universe;
  };

  const groups = [];
  for (const grp of cfg.eraItems) {
    if (!known('el grupo de objetos', grp.id, grp.era)) continue;
    const excl = makeGlobMatcher(asArray(grp.exclude));
    const items = [];
    const seen = new Set();
    for (const s of asArray(grp.items)) {
      if (hasGlob(s)) {
        const m = makeGlobMatcher([s]);
        let n = 0;
        for (const name of candidates()) {
          if (!m(name) || excl(name) || seen.has(name)) continue;
          seen.add(name);
          items.push({ name, pattern: true, key: graphKeyOf(name) });
          n++;
        }
        if (n === 0) warnings.push(`regla de eras: el patrón ${s} del grupo ${grp.id} no casa con nada`);
      } else if (!seen.has(s)) {
        seen.add(s);
        items.push({ name: s, pattern: false, key: graphKeyOf(s), missing: !exists(s) });
      }
    }
    if (grp.inputsOf) {
      const rm = makeGlobMatcher(asArray(grp.inputsOf));
      const slots = new Map();
      let recipes = 0;
      for (const rule of g.rules) {
        if (rule.kind !== 'recipe' || !rm(rule.name)) continue;
        recipes++;
        for (const slot of rule.slots) {
          if (!INPUT_ROLES.has(slot.role) || slot.dead) continue;
          const sig = [...slot.alts].sort((a, b) => a - b).join(',');
          if (!slots.has(sig)) slots.set(sig, { name: slot.label, pattern: false, alts: [...slot.alts], recipes: 0, example: rule.name });
          slots.get(sig).recipes++;
        }
      }
      if (recipes === 0) warnings.push(`regla de eras: inputsOf ${asArray(grp.inputsOf).join(', ')} del grupo ${grp.id} no casa con ninguna receta`);
      for (const s of slots.values()) if (!seen.has(s.name)) items.push(s);
    }
    groups.push({ ...grp, label: grp.label || grp.id, rank: idx.get(grp.era), items });
  }
  for (const r of resources) {
    for (const id of r.onlyFrom) if (!resById.has(id)) warnings.push(`regla de eras: onlyFrom de ${r.id} nombra el recurso ${id}, que no está en eraResources`);
  }
  return { order, idx, resources, resById, groups, active: active && order.length > 0 };
}

/**
 * Vista "sin estos recursos": alcance de la puerta con sus claves quitadas de toda fuente, sin las fuentes del mundo de sus
 * dimensiones y sin las recetas que solo valen allí.
 */
export function eraView(model, resList) {
  const g = model.g;
  const blocked = new Uint8Array(g.nKeys);
  const keyRes = new Map();
  for (const r of resList) {
    for (const k of r.keys) {
      blocked[k] = 1;
      if (!keyRes.has(k)) keyRes.set(k, r);
    }
  }
  const dims = new Set(resList.flatMap((r) => r.dims));
  const dimRes = (d) => resList.find((r) => r.dims.includes(d));
  const enabled = new Uint8Array(g.rules.length).fill(1);
  const lostWorld = new Map();
  const facts = [];
  for (const s of model.worldSources) {
    const off = s.origin.length > 0 && s.origin.every((d) => dims.has(d));
    if (off) {
      if (s.rule !== undefined) enabled[s.rule] = 0;
      for (const k of s.keys) if (!lostWorld.has(k)) lostWorld.set(k, { source: s, resource: dimRes(s.origin[0]) });
    } else if (s.kind === 'manual' || s.kind === 'auto') facts.push(...s.keys);
  }
  if (dims.size > 0) {
    g.rules.forEach((rule, i) => {
      const ds = rule.meta && rule.meta.dims;
      if (rule.kind === 'recipe' && ds && ds.length > 0 && ds.every((d) => dims.has(d))) enabled[i] = 0;
    });
  }
  const lf = lfp(g, { facts, enabled, blocked });
  const reasonOf = (k) => {
    if (blocked[k]) {
      const r = keyRes.get(k);
      return { code: 'later-era', resource: r, text: `recurso de una era posterior: ${eraLabel(r)}` };
    }
    if (!lf.reached[k] && lostWorld.has(k)) {
      const { source, resource } = lostWorld.get(k);
      return { code: 'later-era', resource, text: `solo sale de ${source.origin.join(', ')} (fuente «${source.id}»): recurso de una era posterior, ${eraLabel(resource)}` };
    }
    return null;
  };
  const view = { resList, blocked, enabled, facts, lf, reasonOf, blocker: null };
  view.blockerOf = () => {
    if (!view.blocker) {
      const base = makeRootCost(model, enabled);
      const rootCost = (k) => (reasonOf(k) ? 1 : base(k));
      const bc = blockCosts(g, { mask: lf.reached, enabled, rootCost, blocked });
      view.blocker = { ...bc, mask: lf.reached, capMask: null, reasonOf };
    }
    return view.blocker;
  };
  return view;
}

/** Recursos posteriores que nombra un árbol de bloqueo. */
function laterIn(tree) {
  const out = new Map();
  for (const why of blockedRoots(tree).values()) if (why.code === 'later-era' && why.resource) out.set(why.resource.id, why.resource);
  return [...out.values()];
}

function itemTree(model, view, it) {
  const bl = view.blockerOf();
  const keys = it.alts || (it.key !== undefined ? [it.key] : []);
  if (keys.length === 0) return null;
  let pick = keys[0];
  for (const k of keys) if (bl.cost[k] < bl.cost[pick]) pick = k;
  return blockedTree(model, bl, pick);
}

function itemName(it) {
  return it.alts && it.recipes ? `${it.name}  (entrada de ${it.recipes} receta(s), p. ej. ${it.example})` : it.name;
}

/** Corta los nodos que ya se desplegaron en una cadena anterior del grupo (se pintan como "ya expandido arriba"). */
function pruneSeen(tree, seen) {
  const walk = (n, depth) => {
    if (!n || n.ruleRoot) return;
    if (depth > 0 && n.kids && n.kids.length > 0 && seen.has(n.key)) {
      n.kids = [];
      n.seen = true;
      return;
    }
    if (n.kids && n.kids.length > 0) seen.add(n.key);
    for (const k of n.kids || []) walk(k.child, depth + 1);
  };
  walk(tree, 0);
  return tree;
}

function evalGroup(model, res, eras, grp, viewFor) {
  const view = viewFor(grp.rank);
  const later = eras.resources.filter((r) => r.rank > grp.rank);
  const buckets = { ok: [], violation: [], unreachable: [], missing: [], later: [] };
  for (const it of grp.items) {
    const keys = it.alts || (it.key !== undefined ? [it.key] : []);
    if (it.missing) buckets.missing.push(it);
    else if (it.pattern && keys.length > 0 && keys.every((k) => view.blocked[k])) buckets.later.push(it);
    else if (keys.some((k) => view.lf.reached[k])) buckets.ok.push(it);
    else if (keys.some((k) => res.gate.reached[k])) buckets.violation.push(it);
    else if (it.pattern) buckets.unreachable.push(it);
    else buckets.unreachable.push({ ...it, explicit: true });
  }
  const explicitUnreachable = buckets.unreachable.filter((it) => it.explicit);
  const checked = buckets.ok.length + buckets.violation.length;
  let verdict = 'PASS';
  if (buckets.violation.length > 0 || buckets.missing.length > 0) verdict = grp.optional ? 'WARN' : 'FAIL';
  else if (explicitUnreachable.length > 0) verdict = 'WARN';
  const after = `posteriores a ${grp.era}${later.length > 0 ? '' : ' (no hay ninguno declarado)'}`;
  const extras = [];
  if (buckets.later.length > 0) extras.push(`${buckets.later.length} son ya de un recurso posterior y no cuentan`);
  if (buckets.unreachable.length > 0) extras.push(`${buckets.unreachable.length} no se fabrican en este tier`);
  if (buckets.missing.length > 0) extras.push(`${buckets.missing.length} no existen en el registro`);
  const summary = buckets.violation.length > 0
    ? `${buckets.violation.length} de ${checked} piden un recurso de una era posterior a ${grp.era}`
    : `${buckets.ok.length}/${checked} sin recursos de eras ${after}`;
  const lines = [`${summary}${extras.length > 0 ? ` (${extras.join('; ')})` : ''}`];
  if (grp.optional && verdict !== 'PASS') lines.push('(grupo opcional: se avisa pero no tumba el veredicto)');
  // las cadenas de un mismo grupo comparten tramos (las cuatro piezas del traje piden la misma tela): cada tramo se despliega una vez
  const seen = new Set();
  const violations = [];
  for (const it of buckets.violation) {
    const tree = itemTree(model, view, it);
    const res2 = tree ? laterIn(tree) : [];
    violations.push({ item: it.name, resources: res2.map((r) => ({ id: r.id, era: r.era, label: r.label })), tree });
  }
  violations.slice(0, MAX_DETAIL).forEach((v, i) => {
    const it = buckets.violation[i];
    lines.push(`  ✗ ${itemName(it)} — pide ${v.resources.length > 0 ? v.resources.map(eraLabel).join(', ') : 'un recurso posterior'}`);
    if (v.tree) lines.push(...renderTree(model, pruneSeen(v.tree, seen), { prefix: '      ' }));
  });
  if (violations.length > MAX_DETAIL) lines.push(`  … +${violations.length - MAX_DETAIL} violaciones más (todas en el JSON)`);
  for (const it of buckets.missing) lines.push(`  ? ${it.name} — no existe en el registro${grp.optional ? ' (aún no ha llegado)' : ' (¿id mal escrito?)'}`);
  for (const it of explicitUnreachable.slice(0, MAX_DETAIL)) {
    const tree = itemTree(model, view, it);
    const res2 = tree ? laterIn(tree) : [];
    const why = tree ? 'no se fabrica en este tier ni con todos los recursos' : 'está en el registro, pero ninguna receta ni fuente del modelo lo da';
    lines.push(`  ? ${itemName(it)} — ${why} (la regla no se puede comprobar)${res2.length > 0 ? `; además pide ${res2.map(eraLabel).join(', ')}` : ''}`);
    if (tree) lines.push(...renderTree(model, pruneSeen(tree, seen), { prefix: '      ' }));
  }
  const list = (arr) => arr.slice(0, 8).map((it) => it.name).join(', ') + (arr.length > 8 ? ` … +${arr.length - 8}` : '');
  if (buckets.later.length > 0) lines.push(`  · de un recurso posterior (no cuentan como de esta era): ${list(buckets.later)}`);
  const patternUnreachable = buckets.unreachable.filter((it) => !it.explicit);
  if (patternUnreachable.length > 0) lines.push(`  · no se fabrican en este tier (no se comprueban): ${list(patternUnreachable)}`);
  return {
    group: grp, verdict, lines,
    counts: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])),
    violations: violations.map((v) => ({ item: v.item, resources: v.resources })),
    unreachable: buckets.unreachable.map((it) => it.name),
    missing: buckets.missing.map((it) => it.name),
    later: buckets.later.map((it) => it.name),
  };
}

/** "El titanio solo sale de la Luna": sin los recursos de `onlyFrom`, ninguna clave del recurso se alcanza. */
function evalExclusive(model, eras, r) {
  const g = model.g;
  const sources = r.onlyFrom.map((id) => eras.resById.get(id)).filter(Boolean);
  const view = eraView(model, sources);
  const own = new Uint8Array(g.nKeys);
  for (const k of r.keys) own[k] = 1;
  const leaked = r.keys.filter((k) => view.lf.reached[k]);
  const from = sources.map((s) => s.label || s.id).join(', ') || '(ningún recurso conocido)';
  const lines = [];
  if (leaked.length === 0) {
    lines.push(`ninguno de sus ${r.keys.length} objetos y fluidos sale sin ${from}, como debe ser`);
    return { resource: r, verdict: 'PASS', lines, leaked: [], entries: [] };
  }
  // puntos de entrada: reglas que dan una clave del recurso sin gastar ninguna. Solo es una fuente si sus entradas se alcanzan
  // también sin el propio recurso; si no, recicla lo que ya lleva el recurso (macerar un motor EV da titanio) y no cuenta.
  const pure = eraView(model, [...sources, r]);
  const isSource = (i) => g.rules[i].slots.every((slot) => slot.alts.some((a) => pure.lf.reached[a] === 1));
  const entries = [];
  let recycled = 0;
  g.rules.forEach((rule, i) => {
    if (!view.lf.fired[i] || !rule.outs.some((o) => own[o])) return;
    const so = g.slotOffset[i];
    for (let s = 0; s < rule.slots.length; s++) {
      const by = view.lf.satBy[so + s] >= 0 ? view.lf.satBy[so + s] : view.lf.capPick[so + s];
      if (by >= 0 && own[by]) return;
    }
    if (!isSource(i)) {
      recycled++;
      return;
    }
    entries.push({ rule: i, level: view.lf.ruleLevel[i], outs: rule.outs.filter((o) => own[o]) });
  });
  const factEntries = view.facts.filter((k) => own[k]);
  entries.sort((a, b) => a.level - b.level);
  // agrupados por la clave del recurso que meten: «gtceu:rutile_dust ← 8 reglas: ...»
  const byKey = new Map();
  for (const k of factEntries) byKey.set(k, ['del mundo (una fuente de world que no es de ' + from + ')']);
  for (const e of entries) {
    for (const o of e.outs) {
      if (!byKey.has(o)) byKey.set(o, []);
      byKey.get(o).push(describeRule(g, e.rule));
    }
  }
  lines.push(`FUGA: ${leaked.length} de sus ${r.keys.length} objetos y fluidos salen sin ${from}. Entran por ${entries.length + factEntries.length} fuente(s) en ${byKey.size} clave(s)${recycled > 0 ? ` (y ${recycled} receta(s) que reciclan lo que ya lo lleva, que no cuentan)` : ''}:`);
  const keyList = [...byKey.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [k, how] of keyList.slice(0, 12)) {
    lines.push(`  · ${g.keyNames[k]}  ← ${how.length > 1 ? `${how.length} fuentes: ` : ''}${how.slice(0, 3).join(' ; ')}${how.length > 3 ? ' …' : ''}`);
  }
  if (keyList.length > 12) lines.push(`  … +${keyList.length - 12} claves más (todas en el JSON)`);
  const first = entries.length > 0 ? entries[0].outs[0] : factEntries[0];
  if (first !== undefined) {
    lines.push(`  la primera que se alcanza (${g.keyNames[first]}):`);
    lines.push(...renderTree(model, derivationTree(model, view.lf, first, { depth: 2, kids: 4 }), { prefix: '      ', maxKids: 4 }));
  }
  return {
    resource: r, verdict: r.optional ? 'WARN' : 'FAIL', lines, recycled,
    leaked: leaked.map((k) => g.keyNames[k]),
    entries: [...factEntries.map((k) => `mundo → ${g.keyNames[k]}`), ...entries.map((e) => `${describeRule(g, e.rule)} → ${e.outs.map((o) => g.keyNames[o]).join(', ')}`)],
  };
}

/** Evalúa la regla de eras: grupos de objetos y comprobaciones de exclusividad. */
export function evaluateEras(model, res) {
  const eras = prepareEras(model);
  const out = { active: eras.active, resources: [], groups: [], exclusive: [], counts: { pass: 0, warn: 0, total: 0 }, verdict: 'PASS' };
  if (!eras.active) return out;
  const views = new Map();
  const viewFor = (rank) => {
    if (!views.has(rank)) views.set(rank, eraView(model, eras.resources.filter((r) => r.rank > rank)));
    return views.get(rank);
  };
  out.resources = eras.resources.map((r) => {
    const sources = model.worldSources.filter((s) => s.origin.length > 0 && s.origin.every((d) => r.dims.includes(d))).map((s) => s.id);
    return { id: r.id, era: r.era, label: r.label, keys: r.keys.length, dims: r.dims, sources, onlyFrom: r.onlyFrom };
  });
  for (const grp of eras.groups) out.groups.push(evalGroup(model, res, eras, grp, viewFor));
  for (const r of eras.resources) if (r.onlyFrom.length > 0) out.exclusive.push(evalExclusive(model, eras, r));
  const all = [...out.groups, ...out.exclusive];
  out.counts = {
    pass: all.filter((x) => x.verdict === 'PASS').length,
    warn: all.filter((x) => x.verdict === 'WARN').length,
    total: all.length,
  };
  out.verdict = all.some((x) => x.verdict === 'FAIL') ? 'FAIL' : 'PASS';
  return out;
}
