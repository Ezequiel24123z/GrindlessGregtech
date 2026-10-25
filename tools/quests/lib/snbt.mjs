// SNBT reader and writer for FTB Quests files (no dependencies).
//
// parse(text, { typed })   typed=false (default): numbers come back as plain JS numbers.
//                          typed=true: numbers come back as { $n: value, $t: suffix } so they can be written back
//                          with the same type ('b', 's', 'i', 'l', 'f', 'd').
// stringify(value)         writes FTB Quests style: tabs, keys sorted, one entry per line, short flat compounds and
//                          short lists of plain values on one line. Plain JS numbers: integers are written as int,
//                          the rest as double ('d'). Use num(v, 'd' | 'L' | 'b' | 'f' ...) to force a type.

export class SnbtError extends Error {
  constructor(message, text, pos) {
    const before = text.slice(0, pos);
    const line = before.split('\n').length;
    const col = pos - before.lastIndexOf('\n');
    super(`${message} (line ${line}, column ${col})`);
    this.line = line;
    this.column = col;
  }
}

const BARE = /[A-Za-z0-9_\-.+]/;

export function parse(text, options = {}) {
  const typed = !!options.typed;
  let i = 0;
  if (text.charCodeAt(0) === 0xfeff) i = 1;

  function skip() {
    for (;;) {
      const c = text[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === ',') { i++; continue; }
      if (c === '/' && text[i + 1] === '/') { while (i < text.length && text[i] !== '\n') i++; continue; }
      return;
    }
  }

  function fail(msg) { throw new SnbtError(msg, text, i); }

  function readQuoted() {
    const q = text[i++];
    let out = '';
    for (;;) {
      if (i >= text.length) fail('unterminated string');
      const c = text[i++];
      if (c === q) return out;
      if (c === '\\') {
        const e = text[i++];
        if (e === 'n') out += '\n';
        else if (e === 't') out += '\t';
        else if (e === 'r') out += '\r';
        else if (e === 'u') { out += String.fromCharCode(parseInt(text.substr(i, 4), 16)); i += 4; }
        else out += e;
      } else out += c;
    }
  }

  function readBare() {
    const start = i;
    while (i < text.length && BARE.test(text[i])) i++;
    if (i === start) fail(`unexpected character '${text[i]}'`);
    return text.slice(start, i);
  }

  function bareToValue(word) {
    if (word === 'true') return true;
    if (word === 'false') return false;
    const m = /^([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)([bBsSlLfFdD]?)$/.exec(word);
    if (m) {
      const v = Number(m[1]);
      let t = m[2].toLowerCase();
      if (!t) t = /[.eE]/.test(m[1]) ? 'd' : 'i';
      return typed ? { $n: v, $t: t } : v;
    }
    return word;
  }

  function readValue() {
    skip();
    const c = text[i];
    if (c === '{') return readCompound();
    if (c === '[') return readList();
    if (c === '"' || c === "'") return readQuoted();
    return bareToValue(readBare());
  }

  function readCompound() {
    i++;
    const obj = {};
    for (;;) {
      skip();
      if (text[i] === '}') { i++; return obj; }
      if (i >= text.length) fail('unterminated compound');
      const key = text[i] === '"' || text[i] === "'" ? readQuoted() : readBare();
      skip();
      if (text[i] !== ':') fail(`expected ':' after key '${key}'`);
      i++;
      obj[key] = readValue();
    }
  }

  function readList() {
    i++;
    const arr = [];
    skip();
    if (/[BIL]/.test(text[i] || '') && text[i + 1] === ';') i += 2;
    for (;;) {
      skip();
      if (text[i] === ']') { i++; return arr; }
      if (i >= text.length) fail('unterminated list');
      arr.push(readValue());
    }
  }

  const value = readValue();
  skip();
  if (i < text.length) fail('trailing data after the root value');
  return value;
}

export function num(v, t) { return { $n: v, $t: t }; }

function isNum(v) { return v !== null && typeof v === 'object' && Object.prototype.hasOwnProperty.call(v, '$n'); }
function isPlain(v) { return v === null || typeof v !== 'object' || isNum(v); }

function quote(s) {
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
}

function writeKey(k) { return /^[A-Za-z0-9_\-.+]+$/.test(k) ? k : quote(k); }

function writeNum(v) {
  if (isNum(v)) {
    const t = v.$t;
    if (t === 'd' || t === 'f') {
      const s = Number.isInteger(v.$n) ? v.$n.toFixed(1) : String(v.$n);
      return s + t;
    }
    if (t === 'i') return String(Math.trunc(v.$n));
    return String(Math.trunc(v.$n)) + (t === 'l' ? 'L' : t);
  }
  if (Number.isInteger(v)) return String(v);
  return String(v) + 'd';
}

function writePlain(v) {
  if (typeof v === 'string') return quote(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return writeNum(v);
}

const INLINE_MAX = 110;

function inlineOf(v) {
  if (isPlain(v)) return writePlain(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return '[ ]';
    const parts = [];
    for (const e of v) { const s = inlineOf(e); if (s === null) return null; parts.push(s); }
    return '[' + parts.join(', ') + ']';
  }
  const keys = Object.keys(v).sort();
  if (keys.length === 0) return '{ }';
  const parts = [];
  for (const k of keys) {
    if (!isPlain(v[k])) return null;
    parts.push(writeKey(k) + ': ' + writePlain(v[k]));
  }
  return '{ ' + parts.join(', ') + ' }';
}

function write(v, indent) {
  if (isPlain(v)) return writePlain(v);
  const pad = '\t'.repeat(indent + 1);
  const end = '\t'.repeat(indent);
  if (Array.isArray(v)) {
    if (v.length === 0) return '[ ]';
    const inline = inlineOf(v);
    const allPlain = v.every(isPlain);
    if (inline !== null && (v.length === 1 || allPlain) && inline.length <= INLINE_MAX && !(allPlain && v.length > 1 && v.some((e) => typeof e === 'string' && e.length > 40))) return inline;
    return '[\n' + v.map((e) => pad + write(e, indent + 1)).join('\n') + '\n' + end + ']';
  }
  const keys = Object.keys(v).sort();
  if (keys.length === 0) return '{ }';
  const flat = keys.every((k) => isPlain(v[k]));
  if (flat && indent > 0) {
    const inline = inlineOf(v);
    if (inline.length <= INLINE_MAX) return inline;
  }
  return '{\n' + keys.map((k) => pad + writeKey(k) + ': ' + write(v[k], indent + 1)).join('\n') + '\n' + end + '}';
}

export function stringify(value) {
  return write(value, 0) + '\n';
}
