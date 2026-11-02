// Guard rule for the pack's recipe handlers (AF-K3, audit M8-07). KubeJS 2001 posts ServerEvents.recipes without an exception handler, so one
// handler that throws ends the handlers of every script that loads after it. A handler is guarded when it is registered through
// global.grindless.recipes(name, fn) (server_scripts/grindless/lib/recipes_guard.js) or when its body holds a try block (a whole-body try/catch,
// or one per step as in uhv/gate.js). With { strict: true } a handler is guarded only when every call of its body sits inside a try block:
// one that tries a call and makes another outside the try can still throw (#230, AF-K3's partial try). check-static keeps the lenient rule
// until the pack's partial handlers are fixed (tests/recipes-guard.test.mjs pins how many there are).
// unguardedRecipeHandlers(source, {strict}) -> [{ line }] for every ServerEvents.recipes( call that is neither. Text-based on the masked source
// (lib/scope_rules.mjs mask: comments, strings and regex literals blanked), so a comment that names the event is not a handler.
import { mask } from './scope_rules.mjs';

const CALL = /\bServerEvents\s*\.\s*recipes\s*\(/g;

function closing(m, open, o, c) {
  let depth = 0;
  for (let i = open; i < m.length; i++) {
    if (m[i] === o) depth++;
    else if (m[i] === c && --depth === 0) return i;
  }
  return -1;
}

const KEYWORDS = new Set(['if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'typeof', 'void', 'delete', 'else', 'do', 'in', 'of', 'case', 'throw']);

// Removes every try { } catch { } finally { } statement, outermost first.
function removeTries(m) {
  let out = m;
  for (;;) {
    const t = /\btry\s*\{/.exec(out);
    if (!t) return out;
    const open = t.index + t[0].length - 1;
    const end = closing(out, open, '{', '}');
    if (end < 0) return out.slice(0, t.index);
    let stop = end + 1;
    const c = /^\s*catch\s*(\([^)]*\))?\s*\{/.exec(out.slice(stop));
    if (c) {
      const ce = closing(out, stop + c[0].length - 1, '{', '}');
      stop = ce < 0 ? out.length : ce + 1;
    }
    const f = /^\s*finally\s*\{/.exec(out.slice(stop));
    if (f) {
      const fe = closing(out, stop + f[0].length - 1, '{', '}');
      stop = fe < 0 ? out.length : fe + 1;
    }
    out = out.slice(0, t.index) + ' ' + out.slice(stop);
  }
}

// A call left once the try statements are gone sits outside every try: a partial try leaves the handler unguarded (#230, AF-K3).
// `.forEach(` is the one call allowed: the per-step form wraps each step's call in a try inside the callback (uhv/gate.js).
function hasBareCall(m) {
  const re = /([\w$]+|\)|\])\s*\(/g;
  let hit;
  while ((hit = re.exec(m))) {
    const w = hit[1];
    if (/^[\w$]+$/.test(w)) {
      if (KEYWORDS.has(w)) continue;
      if (/\bfunction\s+$/.test(m.slice(0, hit.index))) continue;
      if (w === 'forEach' && m[hit.index - 1] === '.') continue;
    }
    return true;
  }
  return false;
}

export function unguardedRecipeHandlers(source, { strict = false } = {}) {
  const m = mask(source);
  const out = [];
  let hit;
  CALL.lastIndex = 0;
  while ((hit = CALL.exec(m))) {
    const line = m.slice(0, hit.index).split('\n').length;
    const afterParen = hit.index + hit[0].length;
    const fn = /^\s*function\s*[\w$]*\s*\([^)]*\)\s*\{/.exec(m.slice(afterParen));
    if (!fn) {
      out.push({ line });
      continue;
    }
    const open = afterParen + fn[0].length - 1;
    const end = closing(m, open, '{', '}');
    const body = m.slice(open + 1, end < 0 ? m.length : end);
    if (end < 0 || !/\btry\s*\{/.test(body) || (strict && hasBareCall(removeTries(body)))) out.push({ line });
  }
  return out;
}
