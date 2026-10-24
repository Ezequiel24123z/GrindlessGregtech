// Ejecuta los pasos de análisis y evalúa los objetivos.
//   Paso "gate"  : todo el mundo (manual + automático) -> ¿se puede fabricar la puerta sin comandos?
//   Paso "auto"  : sin recolección manual salvo el arranque declarado -> ¿existe generación automática sostenible?
import { blockCosts, groundedSustain, lfp } from './engine.mjs';
import { makeRootCost } from './explain.mjs';
import { asArray, makeGlobMatcher } from './util.mjs';

export const STATUS = {
  SUSTAINED: 'sustained', // se regenera sola
  FINITE: 'finite', // solo con una fuente que se agota (minero de vapor)
  BOOTSTRAP: 'bootstrap', // solo gracias al arranque manual, no se repone
  MANUAL: 'manual', // solo a mano
  UNREACHABLE: 'unreachable',
};
const RANK = [STATUS.UNREACHABLE, STATUS.MANUAL, STATUS.BOOTSTRAP, STATUS.FINITE, STATUS.SUSTAINED];

export function runPasses(model) {
  const { g } = model;
  const nR = g.rules.length;
  const nK = g.nKeys;
  const all = new Uint8Array(nR).fill(1);
  const gateFacts = [...model.facts.manual, ...model.facts.auto];
  const gate = lfp(g, { facts: gateFacts, enabled: all });

  const enAuto = new Uint8Array(nR).fill(1);
  const enAutoInf = new Uint8Array(nR).fill(1);
  // la recolección manual que exige un objeto (la llave del End) no es una fuente en automático: sus recursos valen como arranque
  // (una sola vez) si la puerta llega a ese objeto
  const dynBootstrap = [];
  g.rules.forEach((r, i) => {
    if (r.kind === 'machine-build') {
      enAuto[i] = 0;
      enAutoInf[i] = 0;
    } else if (r.kind === 'world-auto' && r.meta.finite) enAutoInf[i] = 0;
    else if (r.kind === 'world-manual') {
      enAuto[i] = 0;
      enAutoInf[i] = 0;
      if (r.meta.bootstrap && gate.fired[i] === 1) dynBootstrap.push(...r.outs);
    }
  });
  const seed = [...model.facts.auto, ...model.facts.bootstrap, ...dynBootstrap];
  const prod = lfp(g, { facts: seed, enabled: enAuto, capOk: gate.reached });
  const permanent = new Uint8Array(nK);
  for (const k of model.facts.auto) permanent[k] = 1;
  const sustain = (enabled) => {
    const r = groundedSustain(g, { universe: prod.reached, enabled, capOk: gate.reached, permanent });
    // inS = claves sostenidas, ruleLive = reglas que se pueden mantener, supportRule = la regla que las funda.
    return { inS: r.G.reached, ruleLive: r.G.fired, supportRule: r.G.via, level: r.G.level, G: r.G, S: r.S, rounds: r.rounds };
  };
  // Un objetivo puede pedir que se sostenga "sin" ciertas reglas (globs sobre sus nombres): su propia vista del paso auto.
  const views = new Map();
  const viewFor = (without) => {
    const list = [...(without || [])].sort();
    const sig = list.join('|');
    if (!views.has(sig)) {
      const match = makeGlobMatcher(list);
      const drop = (en) => {
        if (list.length === 0) return en;
        const e = Uint8Array.from(en);
        g.rules.forEach((r, i) => {
          if (match(r.name)) e[i] = 0;
        });
        return e;
      };
      const enInf = drop(enAutoInf);
      const enAll = drop(enAuto);
      views.set(sig, { sig, enAutoInf: enInf, enAuto: enAll, susInf: sustain(enInf), susAll: sustain(enAll) });
    }
    return views.get(sig);
  };
  const base = viewFor([]);
  // Lo mismo para la puerta: `without` en un objetivo de la puerta la recalcula sin esas reglas (p. ej. "el titanio no se
  // consigue sin el congelador de vacío": expect "unreachable" + without ["construir:gtceu:vacuum_freezer"]).
  const gateViews = new Map();
  const gateViewFor = (without) => {
    const list = [...(without || [])].sort();
    if (list.length === 0) return null;
    const sig = list.join('|');
    if (!gateViews.has(sig)) {
      const match = makeGlobMatcher(list);
      const en = Uint8Array.from(all);
      g.rules.forEach((r, i) => {
        if (match(r.name)) en[i] = 0;
      });
      gateViews.set(sig, { sig, all: en, gate: lfp(g, { facts: gateFacts, enabled: en }) });
    }
    return gateViews.get(sig);
  };
  return { gate, prod, susInf: base.susInf, susAll: base.susAll, enAuto, enAutoInf, all, viewFor, gateViewFor };
}

export function keyStatus(res, k, view = res) {
  if (view.susInf.inS[k]) return STATUS.SUSTAINED;
  if (view.susAll.inS[k]) return STATUS.FINITE;
  if (res.prod.reached[k]) return STATUS.BOOTSTRAP;
  if (res.gate.reached[k]) return STATUS.MANUAL;
  return STATUS.UNREACHABLE;
}

const betterThan = (a, b) => RANK.indexOf(a) > RANK.indexOf(b);

/** Una receta "sirve" en un paso si todas sus ranuras se cumplen. */
function recipeUsable(model, res, mode, r, view) {
  if (mode === 'gate') return (view && view.gate ? view.gate : res.gate).fired[r] === 1;
  return view.susInf.ruleLive[r] === 1;
}

function recipeMatches(model, rule, t, nameMatch) {
  const g = model.g;
  if (rule.kind !== 'recipe' || (t.type && rule.type !== t.type)) return false;
  if (nameMatch && !nameMatch(rule.name)) return false;
  if (t.output && !rule.outs.some((o) => g.keyNames[o] === t.output)) return false;
  if (t.input && !asArray(t.input).every((inp) => rule.slots.some((s) => s.alts.some((a) => g.keyNames[a] === inp)))) return false;
  if (t.dimension) {
    const dims = rule.meta.dims || [];
    if ((rule.meta.notDims || []).includes(t.dimension)) return false;
    if (dims.length > 0 && !dims.includes(t.dimension)) return false;
  }
  return true;
}

/**
 * `machineless` (comprobaciones de fuga de recetas de addons): ¿se podría completar la receta si su máquina existiera?
 * Se ignora la ranura de la máquina (el controlador de un addon puede no tener receta, o aparecer más tarde) y se exige lo demás:
 * que una máquina registrada la ejecute, que quepa en `maxEUt` y que todas sus entradas y condiciones se alcancen.
 * Devuelve 'usable' o el motivo: 'sin-maquina' | 'eut' | 'entradas'.
 */
function machinelessVerdict(model, res, mode, rule, view, t) {
  if (t.maxEUt !== undefined && rule.meta.eut > t.maxEUt) return 'eut';
  if (model.runnersOf(rule.type).length === 0) return 'sin-maquina';
  const sus = mode === 'auto' ? view.susInf : null;
  const gate = mode === 'gate' ? (view && view.gate ? view.gate : res.gate) : null;
  for (const slot of rule.slots) {
    if (slot.role === 'machine') continue;
    const ok = mode === 'gate'
      ? slot.alts.some((a) => gate.reached[a] === 1)
      : slot.alts.some((a) => sus.inS[a] === 1 || (slot.cap && res.gate.reached[a] === 1));
    if (!ok) return 'entradas';
  }
  return 'usable';
}

/**
 * Evalúa un objetivo en el modo 'gate' (alcanzable a mano) o 'auto' (sostenible).
 * Devuelve {target, ok, status, key, detail}.
 */
export function evalTarget(model, res, t, mode) {
  const g = model.g;
  // `without` (globs sobre nombres de regla): en automático, una vista del paso auto; en la puerta, el alcance recalculado sin esas reglas
  const view = mode === 'auto' ? res.viewFor(t.without) : res.gateViewFor(t.without);
  const gateOf = view && view.gate ? view.gate : res.gate;
  // Comprobaciones de fuga: en la puerta (expect "unreachable") no debe poder conseguirse ni a mano; en automático
  // (expect "not-automatic") no debe poder sostenerse solo (puede existir como bloque puesto una vez, no como recurso repuesto).
  const neg = (mode === 'gate' && t.expect === 'unreachable') || (mode === 'auto' && t.expect === 'not-automatic');
  const resolveKeys = (x) => asArray(x).flatMap((s) => model.resolve(s, `objetivo ${t.id}`));
  const statusOf = (k) => {
    if (mode === 'gate') return gateOf.reached[k] ? STATUS.MANUAL : STATUS.UNREACHABLE;
    return keyStatus(res, k, view);
  };
  const okStatus = (s) => (mode === 'gate' ? s !== STATUS.UNREACHABLE : s === STATUS.SUSTAINED);

  if ((t.type || t.recipe) && (t.kind === 'recipe' || !t.item)) {
    // `recipe`: globs sobre el id de la receta (solo o junto a `type`). `expect` vale aquí también: una comprobación de fuga
    // de una receta concreta ("la línea de platino de un addon no se puede usar") es PASS si ninguna coincidencia se puede usar.
    const nameMatch = t.recipe ? makeGlobMatcher(asArray(t.recipe)) : null;
    const hits = [];
    const defined = [];
    const why = {};
    for (const rule of g.rules) {
      if (!recipeMatches(model, rule, t, nameMatch)) continue;
      defined.push(rule.id);
      if (t.machineless) {
        const v = machinelessVerdict(model, res, mode, rule, view, t);
        if (v === 'usable') hits.push(rule.id);
        else why[v] = (why[v] || 0) + 1;
      } else if (recipeUsable(model, res, mode, rule.id, view)) hits.push(rule.id);
    }
    const used = hits.length > 0;
    return {
      target: t, view, kind: 'recipe', ok: neg ? !used : used, negative: !!neg,
      status: used ? (mode === 'gate' ? STATUS.MANUAL : STATUS.SUSTAINED) : STATUS.UNREACHABLE,
      hits, defined, why, key: null,
    };
  }

  const items = resolveKeys(t.item || t.fluid || t.anyOf);
  if (t.allOf) {
    const keys = resolveKeys(t.allOf).filter((n) => g.has(n)).map((n) => g.key(n));
    const st = keys.map(statusOf);
    const worst = st.reduce((w, s) => (betterThan(w, s) ? s : w), STATUS.SUSTAINED);
    const bad = keys.filter((k, i) => !okStatus(st[i]));
    return { target: t, view, kind: 'allOf', ok: bad.length === 0, status: worst, keys, badKeys: bad, key: bad[0] ?? keys[0] };
  }
  if (items.length === 0) {
    return { target: t, view, kind: 'item', ok: !!neg, status: STATUS.UNREACHABLE, key: null, empty: true, negative: neg };
  }
  let bestKey = null;
  let bestStatus = STATUS.UNREACHABLE;
  let bestLevel = Infinity;
  for (const n of items) {
    if (!g.has(n)) continue;
    const k = g.key(n);
    const s = statusOf(k);
    const lvl = mode === 'gate' ? gateOf.level[k] : res.prod.level[k];
    if (bestKey === null || betterThan(s, bestStatus) || (s === bestStatus && lvl < bestLevel)) {
      bestKey = k;
      bestStatus = s;
      bestLevel = lvl;
    }
  }
  if (neg) {
    // Comprobación de fuga: el objeto NO debe poder conseguirse en este tier (p. ej. el silicio de GT antes de MV) o,
    // en automático, no debe poder producirse solo (p. ej. la lava: es combustible de caldera, sería un bucle de energía).
    const leaked = bestKey !== null && (mode === 'gate'
      ? bestStatus !== STATUS.UNREACHABLE
      : bestStatus === STATUS.SUSTAINED || bestStatus === STATUS.FINITE);
    return { target: t, view, kind: 'item', ok: !leaked, status: bestStatus, key: bestKey, negative: true, candidates: items.length };
  }
  return { target: t, view, kind: t.fluid ? 'fluid' : 'item', ok: bestKey !== null && okStatus(bestStatus), status: bestStatus, key: bestKey, candidates: items.length };
}

/** Costes de bloqueo para una máscara (gate: alcance manual; auto: lo sostenible). Se calculan bajo demanda. */
export function blockerFor(model, res, mode, cache, view = res) {
  const ck = mode === 'gate' ? `gate|${view.sig || ''}` : `auto|${view.sig || ''}`;
  if (cache.has(ck)) return cache.get(ck);
  let out;
  if (mode === 'gate') {
    // `view` es la propia `res` (puerta completa) o una vista de la puerta sin ciertas reglas (`all` = reglas activas)
    out = {
      ...blockCosts(model.g, { mask: view.gate.reached, enabled: view.all, rootCost: makeRootCost(model, view.all) }),
      mask: view.gate.reached, capMask: null,
    };
  } else {
    out = {
      ...blockCosts(model.g, {
        mask: view.susInf.inS, capMask: res.gate.reached, enabled: view.enAutoInf, rootCost: makeRootCost(model, view.enAutoInf),
      }),
      mask: view.susInf.inS, capMask: res.gate.reached,
    };
  }
  cache.set(ck, out);
  return out;
}
