# Gregtech Grindless: agent rules

GregTech Modern 7.5.3 pack (Minecraft 1.20.1, Forge): nothing is gathered by hand.

## Context
- Start with `docs/STATUS.md`. Do not read `DECISIONS.md`, `docs/sessions/`, `docs/migration/` or whole `docs/eras/*.md` by default; open one section (`git grep -n`) only when the work package cites it.
- Never read: `pack/index.toml`, `hidden_until.json`, textures, test logs, `**/out/`, `**/.work/`.
- Scoped rules load by path: `.github/instructions/{kubejs,tests,quests,release,assets}.instructions.md`.
- Docs written before Project Reforge (2026-10-31) may still state old rules: no raw quantity, short quests with small rewards, only small additions up to HV, save compatibility. Where they conflict, this file wins.

## Product principles
1. Nothing progression needs repeatedly is gathered by hand; hand mining only starts the game. Every basic resource has a renewable, automatable route.
2. Difficulty comes first from complexity (steps, conditions, multiblocks, crossing lines), and quantity is also high and expensive, for items and fluids alike, above all in key recipes and final items. Up to LV, costs are only reviewed (incoherent or absurdly cheap recipes get fixed); MV to MAX scale steeply per era; MAX+ goes far beyond MAX. Every input stays automatable, and recipe times are never inflated in place of cost.
3. Every byproduct has an honest destination: inert ones may be voided, dangerous ones contained, future uses stated. No silly recipes.
4. Each era has at least one of our multiblocks that gains something: speed, throughput, a recipe impossible at small scale, or several steps in one.
5. Quests are in English and never block recipes. Advanced eras get longer, more numerous chapters (Star Technology and GTNH style) that teach every new wafer, circuit generation, process and multiblock: what it is for, how it is made, what it needs, what it unlocks and how to automate it. Rewards are proportionate and never skip a production line.
6. Where these rules conflict with GTM 7.5.3, GTM wins.
7. Each era is clearly bigger: about x1.35 progression multiblocks per era from EV (EV 11, IV 15, LuV 20, ZPM 27, UV ~36). From UV on, growth is much faster, above all in process lines: as a guide, new lines and crossings with lines two or more eras back grow about x1.5 per era (ZPM 14 and 13, so UV about 21 and 20). These figures are guidance, not quotas: never pad to hit them. Each line is a real chain of at least 4 steps. Convenience versions do not count. Any era, Steam included, may be reworked when that makes the pack better (`docs/research/complexity.md`).
8. Power is generous, never free: boilers x8 steam, generators x2 EU per fuel (GregTech Leisure style); later eras keep it with the same or better fuels and more complex plants. No energy from nothing.
9. The pack stays huge and deeply industrial: remove pointless complexity, never meaningful complexity.

## Map
`pack/kubejs/startup_scripts/grindless/<era>/` registrations; `server_scripts/grindless/<era>/`, `integration/` recipes; `data/grindless/tables/` tables; `client_scripts/grindless/*_lang.js` names; `pack/config/ftbquests/` quests; `tools/test/` bench; `tools/analysis/` validator; `tools/quests/`, `tools/assets/` generators; `docs/eras/` design.

## Invariants
- IDs: our items and blocks `grindless:`; machines and recipe types `gtceu:`.
- Names in `en_us` and `es_es`. Everything else in the repo is English (docs, comments, tool output, commits).
- No save compatibility (nobody has played the pack yet): items, blocks, fluids, dimensions, multiblocks and quests may be removed, renamed, merged or reshaped whenever that makes the pack better. No conversion recipes or shape-change notices; a removed id takes its references with it (recipes, tables, quests, lang, tests).
- Licences: check `CREDITS.md` first. MIT or LGPL: with attribution. GPL, non-commercial or all rights reserved: ideas only.

## Work packages
- One package = one issue (template `work-package`) = one session = one branch from the integration branch. Write only the contract's allowed files. Packages never merge each other.
- T0 `tools/Check-Fast.ps1` before every commit; T1 only for a mechanism the contract names. At most 2 repairs, then stop and return the escalation evidence.
- Handoff in the PR or merge commit body (never a new doc), at most 15 lines: result, files, tests and run ids, proposed DECISIONS/CREDITS lines, risks.

## Ownership
Only the integrator writes, once per batch: generated `pack/index.toml`, `pack/pack.toml`, `hidden_until.json`, generated quest chapters; shared `AGENTS.md`, `docs/STATUS.md`, `DECISIONS.md`, `CREDITS.md`, `pack/kubejs/*/grindless/lib/**`. Tier JSONs, `lang/*.json`, `emi_info_lang.js`, `tools/test/zones.json`: only when the contract lists them. See `release.instructions.md`.

## Models
- Orchestrator, integrator, implementer: Claude Sonnet. Repetitive edits, translations, table rows: `mechanical` (Haiku); judgement goes to Sonnet. Failed runs: `triage` (Haiku, read-only).
- Opus only for era design, cross-system contradictions, or a package that failed 2 repairs (about 2 sessions per era).
- A subagent answers one bounded question and spawns none unless authorised. The orchestrator may run up to 6 nested sessions at once (owner, 2026-10-31); no two edit the same files. Bench: the Linux VM first (3 run slots), the home PC only as fallback (one JVM); `docs/testing/`.

## Git
Personal account `Ezequiel24123z`, never the corporate one. Small commits, clear messages. No `git stash` (shared by every worktree): use a WIP commit.
