// Process audit (tools/analysis/process-audit.mjs): in-memory fixtures per finding kind, the baseline logic, and the real pack
// against its baseline when the shared dump and the cached registry exist (skipped otherwise).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditProcesses, eraOfFile, KINDS, newFindings } from '../lib/process_audit.mjs';
import { DEFAULT_BASELINE, DEFAULT_REGISTRY, runAudit } from '../process-audit.mjs';
import { gf, gi, gt, mkDump } from './helpers.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'out');

const file = (era) => `startup_scripts/grindless/${era}/x.js`;
const reg = ({ items = [], fluids = [], machines = [], types = [] } = {}) => ({
  items: items.map((id) => ({ id, kind: 'item', file: file('hv') })),
  blocks: new Map(),
  fluids: fluids.map((id) => ({ id, file: file('hv') })),
  machines: machines.map((m) => ({ id: m.id, kind: 'multiblock', recipeTypes: m.types || [], file: file('hv') })),
  recipeTypes: types.map((t) => ({ id: t, file: file('hv') })),
  materials: [],
  modifiedMaterials: [],
  lang: { en_us: {}, es_es: {} },
});
const kinds = (res) => new Set(res.findings.map((f) => f.kind));

test('eraOfFile reads the era from the script path', () => {
  assert.equal(eraOfFile(file('uv')), 'uv');
  assert.equal(eraOfFile(undefined), null);
});

test('a gain of the item the recipe consumes is a self_gain', () => {
  const dump = mkDump({
    recipes: [{ ...gt('grindless:dup/x', 'gtceu:mixer', { ins: [gi('grindless:a', 1)], outs: [gi('grindless:a', 2)] }), added: true }],
    recipeTypes: ['gtceu:mixer'],
  });
  const res = auditProcesses({ dump, registry: reg({ items: ['grindless:a'] }) });
  assert.ok(kinds(res).has('self_gain'), [...kinds(res)].join());
});

test('fluid-only gain through a mixer is not a self_gain', () => {
  const dump = mkDump({
    recipes: [{ ...gt('grindless:ok/x', 'gtceu:mixer', { ins: [gi('grindless:a', 2)], fouts: [gf('gtceu:water', 1000)] }), added: true }],
    recipeTypes: ['gtceu:mixer'],
  });
  const res = auditProcesses({ dump, registry: reg({ items: ['grindless:a'] }) });
  assert.ok(!kinds(res).has('self_gain'));
});

test('a registered item no recipe makes is uncraftable unless the world gives it', () => {
  const dump = mkDump({ items: ['grindless:orphan'] });
  const bad = auditProcesses({ dump, registry: reg({ items: ['grindless:orphan'] }) });
  assert.ok(bad.findings.some((f) => f.kind === 'uncraftable' && f.id.endsWith('grindless:orphan')));
  const ok = auditProcesses({ dump, registry: reg({ items: ['grindless:orphan'] }), worldItems: new Set(['grindless:orphan']) });
  assert.ok(!ok.findings.some((f) => f.kind === 'uncraftable' && f.id.endsWith('grindless:orphan')));
});

test('buckets and flowing fluids are never reported as uncraftable', () => {
  const dump = mkDump({ items: ['grindless:x_bucket'], fluids: ['grindless:flowing_x'] });
  const res = auditProcesses({ dump, registry: reg({ items: ['grindless:x_bucket'], fluids: ['grindless:flowing_x'] }) });
  assert.ok(!kinds(res).has('uncraftable'));
});

test('baseline: only keys absent from it are new', () => {
  const res = { findings: [{ key: 'uncraftable|a', id: 'a' }, { key: 'no_use|b', id: 'b' }] };
  const base = { format: 'gg-process-audit-1', keys: ['uncraftable|a'] };
  assert.deepEqual(newFindings(res, base).map((f) => f.id), ['b']);
  assert.equal(newFindings(res, { keys: ['uncraftable|a', 'no_use|b'] }).length, 0);
});

test('M-INFO: a multiblock needs an info page; special ones a page of their own', () => {
  const dump = mkDump({ recipes: [gt('t/r', 't:p', { ins: [gi('grindless:a')], outs: [gi('grindless:b')] })], recipeTypes: ['t:p'] });
  const registry = reg({ items: ['grindless:a', 'grindless:b'], machines: [{ id: 'gtceu:writer_chart', types: ['t:p'] }] });
  const page = (stacks) => ({ type: 'emi:info', stacks: stacks.map((id) => ({ kind: 'item', id })), inputs: [], outputs: [] });
  const run = (pages) => kinds(auditProcesses({ dump, registry, emi: { pages, disabled: [] } }));
  assert.ok(run([]).has('m_info_missing'));
  assert.ok(!run([page(['gtceu:writer_chart'])]).has('m_info_missing'));
  assert.ok(run([page(['gtceu:writer_chart', 'a:1', 'a:2', 'a:3'])]).has('m_info_generic'));
});

test('KINDS lists each finding kind once', () => {
  assert.equal(new Set(KINDS).size, KINDS.length);
});

const latest = path.join(out, 'latest.txt');
const real = fs.existsSync(latest) && fs.existsSync(DEFAULT_REGISTRY);
test('the real pack has no process finding beyond the baseline', { skip: real ? false : 'needs out/latest.txt and out/registry.json' }, () => {
  const dump = fs.readFileSync(latest, 'utf8').split(/\r?\n/)[0].trim();
  const { res } = runAudit({ dumpDir: dump, registryFile: DEFAULT_REGISTRY });
  const fresh = newFindings(res, JSON.parse(fs.readFileSync(DEFAULT_BASELINE, 'utf8')));
  assert.equal(fresh.length, 0, fresh.slice(0, 5).map((f) => f.key).join('\n'));
});
