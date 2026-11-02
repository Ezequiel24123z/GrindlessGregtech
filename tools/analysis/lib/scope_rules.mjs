// Scope rules for the pack's KubeJS scripts (AF-K2, audit M8-15). Rhino shares one scope per script type, so:
//   topLevel   a var/let/const/function/class declared outside any function leaks into every other script of that type.
//   callbackLexical  a const/let inside a callback (a function passed to a call, or an arrow) throws "redeclaration" when the
//              event runs it twice in this Rhino; the pack's rule is var + function there.
// scopeFindings(source) -> { topLevel: [{line, name}], callbackLexical: [{line, name}] }. Text-based: comments, strings,
// templates and regex literals are masked first, then braces are tracked.

const WORD = /\b(var|let|const|function|class)\b/g;

export function mask(src) {
  let out = '';
  let i = 0;
  let last = '';
  const n = src.length;
  const keep = (c) => (c === '\n' ? '\n' : ' ');
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === '/' && d === '/') {
      while (i < n && src[i] !== '\n') { out += ' '; i++; }
    } else if (c === '/' && d === '*') {
      out += '  ';
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { out += keep(src[i]); i++; }
      out += '  ';
      i += 2;
    } else if (c === '\'' || c === '"' || c === '`') {
      out += ' ';
      i++;
      while (i < n && src[i] !== c) {
        if (src[i] === '\\') { out += ' '; i++; }
        if (i < n) { out += keep(src[i]); i++; }
        if (c !== '`' && src[i] === '\n') break;
      }
      out += ' ';
      i++;
      last = 'a';
    } else if (c === '/' && (last === '' || /[(,=:[!&|?{};+\-*%<>~^]/.test(last) || last === 'r')) {
      out += ' ';
      i++;
      let cls = false;
      while (i < n && src[i] !== '\n' && (cls || src[i] !== '/')) {
        if (src[i] === '\\') { out += ' '; i++; } else if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false;
        if (i < n) { out += ' '; i++; }
      }
      out += ' ';
      i++;
      while (i < n && /[a-z]/.test(src[i])) { out += ' '; i++; }
      last = 'a';
    } else {
      out += c;
      if (!/\s/.test(c)) last = /[\w$]/.test(c) ? 'a' : c;
      if (/[\w$]/.test(c) && /^return\b/.test(src.slice(Math.max(0, i - 5), i + 1))) last = 'r';
      i++;
    }
  }
  return out;
}

const prevSolid = (s, i) => {
  let k = i - 1;
  while (k >= 0 && /[ \t\r]/.test(s[k])) k--;
  return k;
};

export function scopeFindings(source) {
  const s = mask(String(source));
  const lineOf = (idx) => s.slice(0, idx).split('\n').length;
  const stack = [];
  const topLevel = [];
  const callbackLexical = [];
  const words = [...s.matchAll(WORD)].map((m) => ({ idx: m.index, kw: m[1] }));
  let w = 0;
  const nearestFn = () => { for (let k = stack.length - 1; k >= 0; k--) if (stack[k].fn) return stack[k]; return null; };
  for (let i = 0; i < s.length; i++) {
    while (w < words.length && words[w].idx < i) w++;
    if (w < words.length && words[w].idx === i) {
      const { kw } = words[w];
      const before = prevSolid(s, i);
      const startsStatement = before < 0 || /[\n;{}]/.test(s[before]);
      const name = /^\s*([A-Za-z_$][\w$]*)/.exec(s.slice(i + kw.length, i + kw.length + 80));
      if (startsStatement && name && stack.length === 0 && (kw !== 'function' || name)) topLevel.push({ line: lineOf(i), name: name[1] });
      if ((kw === 'const' || kw === 'let') && name) {
        const fn = nearestFn();
        if (fn && fn.cb) callbackLexical.push({ line: lineOf(i), name: name[1] });
      }
    }
    const c = s[i];
    if (c === '{') {
      const head = s.slice(Math.max(0, i - 400), i);
      let fn = false;
      let cb = false;
      let start = -1;
      const f = /function\b\s*[\w$]*\s*\([^()]*\)\s*$/.exec(head);
      const a = /(?:\([^()]*\)|[\w$]+)\s*=>\s*$/.exec(head);
      if (f) { fn = true; start = head.length - f[0].length; } else if (a) { fn = true; cb = true; start = head.length - a[0].length; }
      if (fn && f) {
        const abs = i - head.length + start;
        const p = prevSolid(s, abs);
        const pc = s[p];
        if (pc === ',') cb = true;
        else if (pc === '(') {
          const q = prevSolid(s, p);
          cb = q >= 0 && /[\w$\])]/.test(s[q]);
        }
      }
      stack.push({ fn, cb });
    } else if (c === '}') stack.pop();
  }
  return { topLevel, callbackLexical };
}
