// Informe de texto y JSON.
import { blockedRoots, blockedRuleTree, blockedTree, derivationTree, describeRule, keyName, renderTree } from './explain.mjs';
import { blockerFor, evalTarget, STATUS } from './analyze.mjs';
import { sortedEntries } from './util.mjs';

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
  if (mode === 'auto' && result.status === STATUS.FINITE) return allowFinite ? MARK.PASS : MARK.WARN;
  return MARK.FAIL;
}

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

function evaluateAll(model, res, targets, mode, cache, opts) {
  const out = [];
  for (const t of targets) {
    const r = evalTarget(model, res, t, mode);
    r.verdict = verdictOf(r, mode);
    r.lines = [];
    const g = model.g;
    const view = r.view || res;
    if (r.verdict === MARK.PASS) {
      if (r.kind === 'recipe') {
        const first = r.hits[0];
        r.lines.push(`receta usable: ${describeRule(g, first)}${r.hits.length > 1 ? ` (+${r.hits.length - 1} más)` : ''}`);
      } else if (r.key !== null && mode === 'gate' && res.gate.via[r.key] >= 0) {
        r.lines.push(`nivel ${res.gate.level[r.key]} · ${describeRule(g, res.gate.via[r.key])}`);
      } else if (r.key !== null && mode === 'auto') {
        const sr = view.susInf.supportRule[r.key];
        r.lines.push(sr >= 0 ? `se sostiene con ${describeRule(g, sr)}` : 'recurso permanente del mundo');
      } else if (r.key !== null) r.lines.push('recurso del mundo');
      if (opts.verbose || (opts.explain && matches(opts.explain, t, model, r))) {
        const tree = derivationTree(model, mode === 'gate' ? res.gate : view.susInf.G, r.key);
        r.lines.push(...renderTree(model, tree, { prefix: '    ', levels: mode === 'gate' }).map((l) => '  ' + l));
      }
    } else {
      r.lines.push(STATUS_TEXT[r.status] || '');
      if (r.kind === 'recipe') {
        const near = r.defined.length > 0 ? closestRule(model, cache, res, mode, r.defined, view) : -1;
        if (r.defined.length === 0) r.lines.push(`no hay ninguna receta de tipo ${t.type}${t.output ? ' que produzca ' + t.output : ''} en el pack`);
        else r.lines.push(`hay ${r.defined.length} receta(s) del tipo, pero ninguna se puede completar (la más cercana: ${describeRule(g, near)})`);
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
  const verdict = gate.every((r) => r.verdict === MARK.PASS) && auto.every((r) => r.verdict === MARK.PASS) ? 'PASS' : 'FAIL';
  return {
    gate, auto, verdict,
    counts: { gate: { pass: count(gate, 'PASS'), total: gate.length }, auto: { pass: count(auto, 'PASS'), warn: count(auto, 'WARN'), total: auto.length } },
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
  L.push(`          ${added} recetas añadidas por scripts del pack · tipos GT con recetas: ${[...new Set([...dump.recipes.values()].map((r) => r.type))].filter((t) => t === 'gtceu:vein_drilling' || t === 'gtceu:greenhouse').join(', ') || '(ni vein_drilling ni greenhouse)'}`);
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
    section('PASO 1 · PUERTA — se permite recoger a mano para arrancar', out.gate, `${out.counts.gate.pass}/${out.counts.gate.total} PASS`);
  }
  if (opts.pass !== 'gate') {
    section('PASO 2 · AUTOMÁTICO — sin recoger a mano salvo el arranque declarado', out.auto,
      `${out.counts.auto.pass}/${out.counts.auto.total} PASS${out.counts.auto.warn ? `, ${out.counts.auto.warn} solo finitos` : ''}`);
  }
  L.push('');
  L.push('NOTAS');
  const dead = sortedEntries(model.stats.deadByType).slice(0, 8);
  if (dead.length > 0) L.push('  - tipos de receta sin máquina utilizable en este tier (recetas): ' + dead.map(([t, n]) => `${t} ${n}`).join(', '));
  if (model.stats.emptyIngredient > 0) L.push(`  - ${model.stats.emptyIngredient} entradas de receta sin ningún miembro (etiqueta vacía o forma desconocida; esas recetas no cuentan)`);
  if (model.unresolved.length > 0) L.push('  - formas de ingrediente sin resolver: ' + model.unresolved.slice(0, 6).join(', '));
  if (dump.tags.missing.size > 0) L.push(`  - ${dump.tags.missing.size} etiquetas usadas por recetas no están en el volcado (se tratan como vacías)`);
  if (dump.tags.empty.size > 0) L.push(`  - ${dump.tags.empty.size} etiquetas existen pero están vacías en este pack`);
  L.push('  - análisis cualitativo: ignora cantidades, tiempos y rendimientos; las salidas con probabilidad cuentan como producidas.');
  L.push('');
  const parts = [];
  if (opts.pass !== 'auto') parts.push(`puerta ${out.counts.gate.pass}/${out.counts.gate.total}`);
  if (opts.pass !== 'gate') parts.push(`automático ${out.counts.auto.pass}/${out.counts.auto.total}${out.counts.auto.warn ? ` (+${out.counts.auto.warn} finitos)` : ''}`);
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
    stats: { rules: g.rules.length, recipes: model.stats.recipes, deadByType: model.stats.deadByType, ignoredByType: model.stats.ignoredByType },
  };
}
