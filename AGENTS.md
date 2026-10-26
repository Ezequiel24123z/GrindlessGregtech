# Gregtech Grindless: agent rules

GregTech Modern 7.5.3 pack (Minecraft 1.20.1, Forge): nothing is gathered by hand.

## Context
- Start with `docs/STATUS.md`. Do not read `DECISIONS.md`, `docs/sessions/`, `docs/migration/` or whole `docs/eras/*.md` by default; open one section (`git grep -n`) only when the work package cites it.
- Never read: `pack/index.toml`, `hidden_until.json`, textures, test logs, `**/out/`, `**/.work/`.
- Scoped rules load by path: `.github/instructions/{kubejs,tests,quests,release,assets}.instructions.md`.

## Product principles
1. Nothing progression needs repeatedly is gathered by hand; hand mining only starts the game.
2. Difficulty comes from complexity (steps, conditions, multiblocks, crossing lines), never raw quantity or inflated times.
3. Every byproduct has an honest destination: inert ones may be voided, dangerous ones contained, future uses stated. No silly recipes.
4. Each era has at least one of our multiblocks that gains something: speed, throughput, a recipe impossible at small scale, or several steps in one.
5. Quests are short, English, give a small reward and never block recipes.
6. Where these rules conflict with GTM 7.5.3, GTM wins.
7. Each era is clearly bigger: about x1.35 progression multiblocks per era from EV (EV 11, IV ~15, LuV ~20), more lines, more crossings with older lines. Convenience versions do not count; Steam to HV only gets small additions (`docs/research/complexity.md`).
8. Power is generous, never free: boilers x8 steam, generators x2 EU per fuel (GregTech Leisure style); later eras keep it with the same or better fuels and more complex plants. No energy from nothing.

## Map
`pack/kubejs/startup_scripts/grindless/<era>/` registrations; `server_scripts/grindless/<era>/`, `integration/` recipes; `data/grindless/tables/` tables; `client_scripts/grindless/*_lang.js` names; `pack/config/ftbquests/` quests; `tools/test/` bench; `tools/analysis/` validator; `tools/quests/`, `tools/assets/` generators; `docs/eras/` design.

## Invariants
- IDs: our items and blocks `grindless:`; machines and recipe types `gtceu:`.
- Names in `en_us` and `es_es`. Everything else in the repo is English (docs, comments, tool output, commits).
- Saves: a registered item, block or fluid is never removed (hidden in EMI, 1:1 conversion recipe); dimension ids never change; a changed multiblock shape goes in the release notes; vein and worldgen changes only affect new chunks or recipes.
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
- A subagent answers one bounded question and spawns none unless authorised. At most 3 concurrent workers; one bench JVM.

## Git
Personal account `Ezequiel24123z`, never the corporate one. Small commits, clear messages. No `git stash` (shared by every worktree): use a WIP commit.
