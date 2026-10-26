// Package metrics from the local Copilot session store (read-only). Used by tools/metrics/Measure-Package.ps1.
//   node --no-warnings tools/metrics/measure.mjs --db <session-store.db> --sessions <id,id...>
// Prints one JSON object: per-model and total API calls, input/cache/output tokens, the largest single input (context size),
// AIU (total_nano_aiu / 1e9), subagent calls and model time. Needs Node >= 22.13 (node:sqlite).
import { DatabaseSync } from 'node:sqlite';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const db = arg('--db');
const sessions = String(arg('--sessions') || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!db || sessions.length === 0) { console.error('usage: measure.mjs --db <file> --sessions <id,...>'); process.exit(2); }

const conn = new DatabaseSync(db, { readOnly: true });
const marks = sessions.map(() => '?').join(',');
const rows = conn.prepare(`SELECT model, count(*) AS calls,
    sum(CASE WHEN agent_id IS NULL OR agent_id = '' THEN 0 ELSE 1 END) AS subagentCalls,
    coalesce(sum(input_tokens), 0) AS input, coalesce(sum(cache_read_tokens), 0) AS cacheRead,
    coalesce(sum(output_tokens), 0) AS output, coalesce(max(input_tokens), 0) AS maxInput,
    coalesce(sum(total_nano_aiu), 0) / 1e9 AS aiu, coalesce(sum(duration_ms), 0) AS ms
  FROM assistant_usage_events WHERE session_id IN (${marks}) GROUP BY model ORDER BY aiu DESC`).all(...sessions);
conn.close();

const total = { calls: 0, subagentCalls: 0, input: 0, cacheRead: 0, output: 0, maxInput: 0, aiu: 0, ms: 0 };
for (const r of rows) {
  for (const k of Object.keys(total)) total[k] = k === 'maxInput' ? Math.max(total[k], Number(r[k])) : total[k] + Number(r[k]);
}
total.aiu = Math.round(total.aiu * 1000) / 1000;
console.log(JSON.stringify({ sessions, models: rows.map((r) => r.model), total, perModel: rows }));
