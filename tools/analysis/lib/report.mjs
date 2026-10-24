// Informe de texto y JSON.
import { blockedRoots, blockedRuleTree, blockedTree, derivationTree, describeRule, keyName, machinelessTree, renderTree } from './explain.mjs';
import { blockerFor, evalTarget, STATUS } from './analyze.mjs';
import { asArray, sortedEntries } from './util.mjs';

const MARK = { PASS: 'PASS', FAIL: 'FAIL', WARN: 'WARN' };

const rootLabel = (g, k, why) => (keyName(g, k).startsWith('dead:') ? why.text : `${keyName(g, k)} (${why.text})`);

/** De varias recetas candidatas, la que está más cerca de poder hacerse (menor coste de desbloqueo). */
function closestRule(model, cache, res, mode, rules, view) {
  const bl = blockerFor(model, res, mode, cache, view);
  let best = rules[0];
  let bestCost = Infinity;
  for (const r of rules) {
    let c = 0;
    for (const slot of model.g.rules[r].slots) {
      if (slot.alts.some((a) => bl.mask[a] === 1)) continue;
      if (slot.cap && bl.capMask && slot.alts.some((a) => bl.capMask[a] === 1)) continue;
      let m = Infinity;
      for (const a of slot.alts) if (bl.cost[a] < m) m = bl.cost[a];
      c += m;
    }
    if (c < bestCost) {
      bestCost = c;
      best = r;
    }
  }
  return best;
}

function verdictOf(result, mode) {
  const allowFinite = !!result.target.allowFinite;
  if (result.ok) return MARK.PASS;
  // un objetivo opcional que no se cumple se avisa (WARN) pero no tumba el veredicto
  if (result.target.optional) return MARK.WARN;
  if (mode === 'auto' && result.status === STATUS.FINITE) return allowFinite ? MARK.PASS : MARK.WARN;
  return MARK.FAIL;
}

const blocking = (r) => r.verdict === MARK.FAIL || (r.verdict === MARK.WARN && !r.target.optional);

const STATUS_TEXT = {
  [STATUS.SUSTAINED]: 'se regenera sola',
  [STATUS.FINITE]: 'solo con una fuente finita (se agota)',
  [STATUS.BOOTSTRAP]: 'solo gracias al arranque manual; no se repone',
  [STATUS.MANUAL]: 'solo recogiéndolo a mano; ninguna máquina lo repone',
  [STATUS.UNREACHABLE]: 'no se puede conseguir',
};

function targetTitle(model, result) {
  const t = result.target;
  const keys = result.key !== null && result.key !== undefined && result.key >= 0 ? keyName(model.g, result.key) : '';
  const without = t.without && t.without.length > 0 ? `  [sin ${t.without.join(', ')}]` : '';
  return `${t.label || t.id}${keys && t.label !== keys ? ` (${keys})` : ''}${without}`;
}

const WHY_TEXT = {
  'sin-maquina': (n) => `${n} sin ninguna máquina registrada que las ejecute`,
  eut: (n, t) => `${n} por encima de ${t.maxEUt} EU/t`,
  entradas: (n) => `${n} con alguna entrada o condición inalcanzable`,
};

/** Líneas del resultado de una comprobación de fuga sobre recetas (expect + type/recipe, con o sin machineless). */
function negativeRecipeLines(model, res, r, mode, view) {
  const g = model.g;
  const t = r.target;
  const L = [];
  const scope = [t.type ? `de tipo ${t.type}` : '', t.recipe ? `con id ${asArray(t.recipe).join(' | ')}` : '', t.output ? `que producen ${t.output}` : '']
    .filter(Boolean).join(' ');
  if (r.verdict === MARK.PASS) {
    if (r.defined.length === 0) {
      L.push(`no hay ninguna receta ${scope} en el pack (quitada o nunca existió), como debe ser`);
      return L;
    }
    const why = Object.entries(r.why).map(([k, n]) => (WHY_TEXT[k] ? WHY_TEXT[k](n, t) : `${n} ${k}`));
    L.push(`${r.defined.length} receta(s) ${scope} existen pero ninguna se puede usar en este tier${why.length > 0 ? ` (${why.join('; ')})` : ''}, como debe ser`);
    return L;
  }
  L.push(`FUGA: ${r.hits.length} receta(s) ${scope} se pueden usar en este tier y no deberían: ${describeRule(g, r.hits[0])}${r.hits.length > 1 ? ` (+${r.hits.length - 1} más)` : ''}`);
  const lf = mode === 'gate' ? view.gate : view.susInf.G;
  const tree = t.machineless
    ? machinelessTree(model, lf, r.hits[0], mode === 'auto' ? res.gate.reached : null)
    : derivationTree(model, lf, null, undefined, r.hits[0]);
  L.push(...renderTree(model, tree, { prefix: '    ', levels: mode === 'gate' }).map((l) => '  ' + l));
  if (t.machineless) {
    const runners = model.runnersOf(g.rules[r.hits[0]].type);
    L.push(`  (solo lo impide que no se pueda construir ninguna de las máquinas registradas que la ejecutan: ${runners.slice(0, 4).join(', ')}${runners.length > 4 ? ' …' : ''})`);
  }
  return L;
}

function evaluateAll(model, res, targets, mode, cache, opts) {
  const out = [];
  for (const t of targets) {
    const r = evalTarget(model, res, t, mode);
    r.verdict = verdictOf(r, mode);
    r.lines = [];
    const g = model.g;
    const view = r.view || res;
    if (r.negative && r.kind === 'recipe') {
      // fuga de una receta (o de un tipo de receta): PASS si ninguna coincidencia se puede usar en este tier
      r.lines.push(...negativeRecipeLines(model, res, r, mode, view));
      out.push(r);
      continue;
    }
    if (r.negative) {
      // comprobación de fuga (expect: "unreachable" en la puerta, "not-automatic" en automático)
      if (r.verdict === MARK.PASS) {
        r.lines.push(mode === 'gate'
          ? 'no se puede conseguir en este tier, como debe ser'
          : `no se produce sola, como debe ser (${STATUS_TEXT[r.status] || r.status})`);
      } else if (mode === 'gate') {
        r.lines.push('FUGA: se puede conseguir en este tier y no debería. Así:');
        const tree = derivationTree(model, view.gate, r.key);
        r.lines.push(...renderTree(model, tree, { prefix: '    ', levels: true }).map((l) => '  ' + l));
      } else {
        r.lines.push('FUGA: se produce sola y no debería. Así:');
        const tree = derivationTree(model, r.status === STATUS.SUSTAINED ? view.susInf.G : view.susAll.G, r.key);
        r.lines.push(...renderTree(model, tree, { prefix: '    ' }).map((l) => '  ' + l));
      }
      out.push(r);
      continue;
    }
    if (r.verdict === MARK.PASS) {
      if (r.kind === 'recipe') {
        const first = r.hits[0];
        r.lines.push(`receta usable: ${describeRule(g, first)}${r.hits.length > 1 ? ` (+${r.hits.length - 1} más)` : ''}`);
      } else if (r.key !== null && mode === 'gate' && view.gate.via[r.key] >= 0) {
        r.lines.push(`nivel ${view.gate.level[r.key]} · ${describeRule(g, view.gate.via[r.key])}`);
      } else if (r.key !== null && mode === 'auto') {
        const sr = view.susInf.supportRule[r.key];
        r.lines.push(sr >= 0 ? `se sostiene con ${describeRule(g, sr)}` : 'recurso permanente del mundo');
      } else if (r.key !== null) r.lines.push('recurso del mundo');
      if (opts.verbose || (opts.explain && matches(opts.explain, t, model, r))) {
        const G = mode === 'gate' ? view.gate : view.susInf.G;
        const tree = r.kind === 'recipe' ? derivationTree(model, G, null, undefined, r.hits[0]) : derivationTree(model, G, r.key);
        r.lines.push(...renderTree(model, tree, { prefix: '    ', levels: mode === 'gate' }).map((l) => '  ' + l));
      }
    } else {
      r.lines.push(STATUS_TEXT[r.status] || '');
      if (t.optional) r.lines.push('(objetivo opcional: se avisa pero no tumba el veredicto)');
      if (r.kind === 'recipe') {
        const near = r.defined.length > 0 ? closestRule(model, cache, res, mode, r.defined, view) : -1;
        if (r.defined.length === 0) {
          const withInput = t.input ? ' con entrada ' + asArray(t.input).join(' + ') : '';
          const inDim = t.dimension ? ` (válida en ${t.dimension})` : '';
          r.lines.push(`no hay ninguna receta ${t.type ? 'de tipo ' + t.type : 'con id ' + asArray(t.recipe).join(' | ')}${t.type && t.recipe ? ' con id ' + asArray(t.recipe).join(' | ') : ''}${t.output ? ' que produzca ' + t.output : ''}${withInput}${inDim} en el pack`);
        } else r.lines.push(`hay ${r.defined.length} receta(s) del tipo, pero ninguna se puede completar (la más cercana: ${describeRule(g, near)})`);
        if (near >= 0) {
          const bl = blockerFor(model, res, mode, cache, view);
          const tree = blockedRuleTree(model, bl, near);
          r.lines.push(...renderTree(model, tree, { prefix: '    ' }).map((l) => '  ' + l));
          const roots = [...blockedRoots(tree)].map(([k, why]) => rootLabel(g, k, why));
          if (roots.length > 0) r.lines.push('  raíces que faltan: ' + roots.slice(0, 6).join(' ; ') + (roots.length > 6 ? ' …' : ''));
        }
      } else if (r.key !== null && r.key !== undefined) {
        if (mode === 'auto' && r.status === STATUS.FINITE) {
          // Existe una ruta, pero depende de una fuente que se agota: se muestra la ruta y luego lo que falta para sostenerlo.
          const route = derivationTree(model, view.susAll.G, r.key);
          r.lines.push(...renderTree(model, route, { prefix: '    ' }).map((l) => '  ' + l));
        }
        const bl = blockerFor(model, res, mode, cache, view);
        const tree = blockedTree(model, bl, r.key);
        if (mode === 'auto' && r.status === STATUS.FINITE) r.lines.push('  para sostenerlo falta:');
        r.lines.push(...renderTree(model, tree, { prefix: '    ' }).map((l) => '  ' + l));
        const roots = [...blockedRoots(tree)].map(([k, why]) => rootLabel(g, k, why));
        if (roots.length > 0) r.lines.push('  raíces que faltan: ' + roots.slice(0, 6).join(' ; ') + (roots.length > 6 ? ' …' : ''));
      } else if (r.empty) {
        r.lines.push('el objetivo no resuelve a ningún objeto (¿id mal escrito o etiqueta vacía?)');
      }
    }
    out.push(r);
  }
  return out;
}

function matches(needle, t, model, r) {
  const n = needle.toLowerCase();
  return (t.id || '').toLowerCase().includes(n) || (t.label || '').toLowerCase().includes(n) ||
    (r.key !== null && r.key !== undefined && keyName(model.g, r.key).toLowerCase().includes(n));
}

export function analyze(model, res, opts = {}) {
  const cache = new Map();
  const pass = opts.pass || 'both';
  const gate = pass === 'auto' ? [] : evaluateAll(model, res, model.cfg.targets, 'gate', cache, opts);
  const auto = pass === 'gate' ? [] : evaluateAll(model, res, model.cfg.autoTargets, 'auto', cache, opts);
  const count = (arr, v) => arr.filter((x) => x.verdict === v).length;
  const verdict = gate.some(blocking) || auto.some(blocking) ? 'FAIL' : 'PASS';
  return {
    gate, auto, verdict,
    counts: {
      gate: { pass: count(gate, 'PASS'), warn: count(gate, 'WARN'), total: gate.length },
      auto: { pass: count(auto, 'PASS'), warn: count(auto, 'WARN'), total: auto.length },
    },
  };
}

export function renderText(model, res, out, opts = {}) {
  const { cfg, dump, g } = model;
  const L = [];
  const modInfo = (dump.info && dump.info.mods ? dump.info.mods : []).filter((m) => /^(gtceu|kubejs|rhino|ae2)@/.test(m)).join(' ');
  L.push(`=== Validación estática de progresión · tier "${cfg.tier}"${cfg.title ? ' (' + cfg.title + ')' : ''} ===`);
  L.push(`Volcado : ${dump.dir}`);
  L.push(`          ${dump.recipes.size} recetas · ${dump.items.size} objetos · ${dump.fluids.size} fluidos · ${dump.tags.itemTags.size} etiquetas de objeto${modInfo ? ' · ' + modInfo : ''}`);
  L.push(`Modelo  : ${g.rules.length} reglas · ${g.nKeys} recursos · mundo: ${model.facts.manual.length} a mano, ${model.facts.auto.length} fijos, ${model.facts.bootstrap.length} de arranque`);
  const added = [...dump.recipes.values()].filter((r) => r.added).length;
  const OUR_TYPES = ['gtceu:vein_drilling', 'gtceu:greenhouse', 'gtceu:ore_processing', 'gtceu:bio_distillation', 'gtceu:refining', 'gtceu:reforming', 'gtceu:pgm_refining'];
  const typesWithRecipes = new Set([...dump.recipes.values()].map((r) => r.type));
  L.push(`          ${added} recetas añadidas por scripts del pack · tipos propios del pack con recetas: ${OUR_TYPES.filter((t) => typesWithRecipes.has(t)).join(', ') || '(ninguno: ni vein_drilling ni greenhouse)'}`);
  L.push(`Contexto: la fábrica está en la dimensión ${cfg.contextDimension}`);
  if (model.warnings.length > 0) {
    L.push('');
    L.push(`AVISOS DE CONFIGURACIÓN (${model.warnings.length})`);
    for (const w of model.warnings.slice(0, opts.maxWarnings || 20)) L.push('  - ' + w);
    if (model.warnings.length > (opts.maxWarnings || 20)) L.push(`  … +${model.warnings.length - (opts.maxWarnings || 20)} más`);
  }
  const section = (title, list, counts) => {
    L.push('');
    L.push(`${title}   [${counts}]`);
    for (const r of list) {
      L.push(`  ${r.verdict}  ${targetTitle(model, r)}${r.verdict === 'PASS' && r.lines.length > 0 ? '  ·  ' + r.lines[0] : ''}`);
      const rest = r.verdict === 'PASS' ? r.lines.slice(1) : r.lines;
      for (const l of rest) L.push('        ' + l);
    }
  };
  if (opts.pass !== 'auto') {
    section('PASO 1 · PUERTA — se permite recoger a mano para arrancar', out.gate,
      `${out.counts.gate.pass}/${out.counts.gate.total} PASS${out.counts.gate.warn ? `, ${out.counts.gate.warn} avisos` : ''}`);
  }
  if (opts.pass !== 'gate') {
    section('PASO 2 · AUTOMÁTICO — sin recoger a mano salvo el arranque declarado', out.auto,
      `${out.counts.auto.pass}/${out.counts.auto.total} PASS${out.counts.auto.warn ? `, ${out.counts.auto.warn} avisos (fuente finita u opcional)` : ''}`);
  }
  L.push('');
  L.push('NOTAS');
  const dead = sortedEntries(model.stats.deadByType).slice(0, 8);
  if (dead.length > 0) L.push('  - tipos de receta sin máquina utilizable en este tier (recetas): ' + dead.map(([t, n]) => `${t} ${n}`).join(', '));
  if (model.stats.emptyIngredient > 0) L.push(`  - ${model.stats.emptyIngredient} entradas de receta sin ningún miembro (etiqueta vacía o forma desconocida; esas recetas no cuentan)`);
  if (model.unresolved.length > 0) L.push('  - formas de ingrediente sin resolver: ' + model.unresolved.slice(0, 6).join(', '));
  if (dump.tags.missing.size > 0) L.push(`  - ${dump.tags.missing.size} etiquetas usadas por recetas no están en el volcado (se tratan como vacías)`);
  if (dump.tags.empty.size > 0) L.push(`  - ${dump.tags.empty.size} etiquetas existen pero están vacías en este pack`);
  if (model.stats.structureMachines > 0) L.push(`  - piezas de multibloque leídas del patrón real del pack (structures.json): ${model.stats.structureMachineIds.join(', ')}`);
  if (model.stats.rolledMachines.length > 0) {
    const rolled = model.stats.rolledMachines.map((m) => `${m.machine} (${Number.isFinite(m.hatches) ? m.hatches : '2+'} escotilla(s) de ${m.voltage} V -> ${m.maxEUt} V)`);
    L.push(`  - tensión máxima de multibloques (GTM 7.5.3: 2 o más escotillas del mismo nivel suben un escalón): ${rolled.join(', ')}`);
  }
  if (model.stats.fluidVeins && model.stats.fluidVeins.length > 0) {
    const fv = model.stats.fluidVeins.map((v) => `${v.fluid} (${v.deposits.join(', ')})`);
    L.push(`  - yacimientos de fluidos que admiten ${cfg.contextDimension}: ${fv.join(', ')}`);
  }
  if (model.stats.configRead && model.stats.configRead.length > 0) {
    L.push(`  - config de GTM leída del volcado: ${model.stats.configRead.map((c) => `${c.key}=${c.value}`).join(', ')}`);
  }
  if (model.stats.partsNotRequired.length > 0) {
    const byWhy = new Map();
    for (const p of model.stats.partsNotRequired) {
      const k = `${p.part} (${p.why})`;
      byWhy.set(k, [...(byWhy.get(k) || []), p.machine]);
    }
    for (const [k, machines] of byWhy) L.push(`  - pieza que la config de GTM no exige: ${k} en ${machines.join(', ')}`);
  }
  if (model.stats.veinsWithoutItem.length > 0) {
    L.push(`  - vetas del registro sin objeto de la tabla de la perforadora (de otros mods o que el pack aún no ofrece, p. ej. las radiactivas del End; no se comprueban): ${model.stats.veinsWithoutItem.join(', ')}`);
  }
  L.push('  - análisis cualitativo: ignora cantidades, tiempos y rendimientos; las salidas con probabilidad cuentan como producidas.');
  L.push('');
  const parts = [];
  if (opts.pass !== 'auto') parts.push(`puerta ${out.counts.gate.pass}/${out.counts.gate.total}${out.counts.gate.warn ? ` (+${out.counts.gate.warn} avisos)` : ''}`);
  if (opts.pass !== 'gate') parts.push(`automático ${out.counts.auto.pass}/${out.counts.auto.total}${out.counts.auto.warn ? ` (+${out.counts.auto.warn} avisos)` : ''}`);
  L.push(`VEREDICTO: ${out.verdict}  (${parts.join(' · ')})`);
  return L.join('\n') + '\n';
}

export function toJson(model, res, out) {
  const g = model.g;
  const row = (r) => ({
    id: r.target.id, label: r.target.label || r.target.id, verdict: r.verdict, status: r.status,
    key: r.key !== null && r.key !== undefined ? keyName(g, r.key) : null, without: r.target.without || null, detail: r.lines,
  });
  return {
    tier: model.cfg.tier, verdict: out.verdict, counts: out.counts, warnings: model.warnings,
    gate: out.gate.map(row), auto: out.auto.map(row),
    stats: {
      rules: g.rules.length, recipes: model.stats.recipes, deadByType: model.stats.deadByType, ignoredByType: model.stats.ignoredByType,
      structureMachines: model.stats.structureMachineIds, rolledMachines: model.stats.rolledMachines,
      fluidVeins: model.stats.fluidVeins, configRead: model.stats.configRead, veinsWithoutItem: model.stats.veinsWithoutItem,
      partsNotRequired: model.stats.partsNotRequired,
    },
  };
}
