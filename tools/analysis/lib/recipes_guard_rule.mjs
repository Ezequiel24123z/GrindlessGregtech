// Guard rule for the pack's recipe handlers (AF-K3, audit M8-07). KubeJS 2001 posts ServerEvents.recipes without an exception handler, so one
// handler that throws ends the handlers of every script that loads after it. A handler is guarded when it is registered through
// global.grindless.recipes(name, fn) (server_scripts/grindless/lib/recipes_guard.js) or when its body holds a try block (a whole-body try/catch,
// or one per step as in uhv/gate.js).
// unguardedRecipeHandlers(source) -> [{ line }] for every ServerEvents.recipes( call that is neither. Text-based on the masked source
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

function isOneTryCatch(body) {
  const t = /^\s*try\s*\{/.exec(body);
  if (!t) return false;
  const tryEnd = closing(body, t[0].length - 1, '{', '}');
  if (tryEnd < 0) return false;
  const c = /^\s*catch\s*(\([^)]*\))?\s*\{/.exec(body.slice(tryEnd + 1));
  if (!c) return false;
  const catchOpen = tryEnd + 1 + c[0].length - 1;
  const catchEnd = closing(body, catchOpen, '{', '}');
  if (catchEnd < 0) return false;
  let rest = body.slice(catchEnd + 1);
  const f = /^\s*finally\s*\{/.exec(rest);
  if (f) {
    const fe = closing(rest, f[0].length - 1, '{', '}');
    rest = fe < 0 ? 'x' : rest.slice(fe + 1);
  }
  return /^\s*$/.test(rest);
}

export function unguardedRecipeHandlers(source) {
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
    if (end < 0 || !/\btry\s*\{/.test(m.slice(open + 1, end))) out.push({ line });
  }
  return out;
}
