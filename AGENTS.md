# Gregtech Grindless: agent rules

GregTech Modern 7.5.3 pack (Minecraft 1.20.1, Forge): nothing is gathered by hand.

## Context
- Start with `docs/STATUS.md`. Do not read `DECISIONS.md` or whole `docs/eras/*.md` by default; open one section (`git grep -n`) only when the work package cites it.
- Never read: `pack/index.toml`, `hidden_until.json`, textures, test logs, `**/out/`, `**/.work/`.
- Scoped rules load by path: `.github/instructions/{kubejs,tests,quests,release,assets}.instructions.md`.
- Docs may still state old rules: before Project Reforge (2026-10-31), no raw quantity, short quests with small rewards, only small additions up to HV, save compatibility; before 2026-11-02, principle 7's x1.35 multiblock and x1.5 line growth figures. Where they conflict, this file wins.

## Product principles
1. Nothing progression needs repeatedly is gathered by hand; hand mining only starts the game. Every basic resource has a renewable, automatable route.
2. Difficulty comes first from complexity (steps, conditions, multiblocks, crossing lines), and quantity is also high and expensive, for items and fluids alike, above all in key recipes and final items. Up to LV, costs are only reviewed (incoherent or absurdly cheap recipes get fixed); MV to MAX scale steeply per era; MAX+ goes far beyond MAX. Every input stays automatable, and recipe times are never inflated in place of cost.
3. Every byproduct has an honest destination: inert ones may be voided, dangerous ones contained, future uses stated. No silly recipes.
4. Each era has at least one of our multiblocks that gains something: speed, throughput, a recipe impossible at small scale, or several steps in one.
5. Quests are in English and never block recipes. Each era is one chapter, however large (owner, 2026-11-02). Every quest in it is reachable from its single start through real dependencies, with nothing loose. Advanced eras get longer chapters (Star Technology and GTNH style) that teach every new wafer, circuit generation, process and multiblock: what it is for, how it is made, what it needs, what it unlocks and how to automate it. Rewards are proportionate and never skip a production line.
6. Where these rules conflict with GTM 7.5.3, GTM wins.
7. Each era is deeper (owner, 2026-11-02). What grows is the length of real process lines, in every tier. Lines follow real processes, as Technological Journey's do (more futuristic in late eras): long and complex, never artificially hard; platinum-group processing is one of the pack's massive lines. As a guide the longest lines grow about 2 steps per era (Steam 6, LV 8, MV 10, HV 12-13 with several that long, then about +2 per era), shaped to the progression rather than exact: never pad. A line is a real chain of at least 4 steps; shorter chains are not lines and count nowhere (questbook, charts, audits). Split chains are merged; convenience versions do not count; multiblock counts have no target. Long lines may change how basic materials are obtained and at what rate. Lines from other packs may be imported where the licence allows, adapted to be more realistic or more futuristic. Any era, Steam included, may be reworked when that makes the pack better (`docs/research/complexity.md`).
8. Power is generous, never free: boilers x8 steam, generators x2 EU per fuel (GregTech Leisure style); later eras keep it with the same or better fuels and more complex plants. No energy from nothing.
9. The pack stays huge and deeply industrial: remove pointless complexity, never meaningful complexity.
10. A recipe needs a dimension only when it uses that place (owner, 2026-11-02):
    - its ground, air, ice or fields;
    - its microgravity, heat, light or radiation;
    - a gravity well or phenomenon;
    - air for combustion;
    - or it is a launch, gate or relay there.

    Anything made from shippable inputs is made anywhere: the Venusian Quantum Seed anywhere, the Hyperstargate at the black hole.
11. Every recipe accepts any circuit of its tier (`#gtceu:circuits/<tier>`, universal circuits included) (owner, 2026-11-02). Only a circuit's own chain and research name a specific circuit.

## Map
`pack/kubejs/startup_scripts/grindless/<era>/` registrations; `server_scripts/grindless/<era>/`, `integration/` recipes; `data/grindless/tables/` tables; `client_scripts/grindless/*_lang.js` names; `pack/config/ftbquests/` quests; `tools/test/` bench; `tools/analysis/` validator; `tools/quests/`, `tools/assets/` generators; `docs/eras/` design.

## Invariants
- IDs: our items and blocks `grindless:`; machines and recipe types `gtceu:`.
- Everything is English only: names and tooltips (`en_us`), quests, docs, comments, tool output, commits. No `es_es` (owner, 2026-11-01): T0 fails on any `es_es` key, block or file under `pack/kubejs` (EN-1's `english-only` check).
- No save compatibility (nobody has played the pack yet): items, blocks, fluids, dimensions, multiblocks and quests may be removed, renamed, merged or reshaped whenever that makes the pack better. No conversion recipes or shape-change notices; a removed id takes its references with it (recipes, tables, quests, lang, tests).
- Licences: check `CREDITS.md` first. MIT or LGPL: with attribution. GPL, non-commercial or all rights reserved: ideas only.

## Work packages
- One package = one issue (template `work-package`) = one session = one branch from the integration branch. Write only the contract's allowed files. Packages never merge each other.
- T0 (`tools/Check-Fast.ps1`) before every handoff: push the branch and read GitHub Actions' T0 run, or run it on the VM (`tools/vm/gg-vm-exec.sh`). T1 only for a mechanism the contract names. At most 2 repairs, then stop and return the escalation evidence.
- Handoff in the PR or merge commit body (never a new doc), at most 15 lines: result, files, tests and run ids, proposed DECISIONS/CREDITS lines, risks.

## Ownership
Only the integrator writes, once per batch: generated `pack/index.toml`, `pack/pack.toml`, `hidden_until.json`, generated quest chapters; shared `AGENTS.md`, `docs/STATUS.md`, `DECISIONS.md`, `CREDITS.md`, `pack/kubejs/*/grindless/lib/**`. Tier JSONs, `lang/*.json`, `emi_info_lang.js`, `tools/test/zones.json`: only when the contract lists them. See `release.instructions.md`.

## Models
- Orchestrator, integrator, implementer: Claude Sonnet. Repetitive edits, translations, table rows: `mechanical` (Haiku); judgement goes to Sonnet. Failed runs: `triage` (Haiku, read-only).
- Opus only for era design, cross-system contradictions, or a package that failed 2 repairs (about 2 sessions per era).
- A subagent answers one bounded question and spawns none unless authorised. The orchestrator may run up to 10 nested sessions at once (owner, 2026-11-01; was 6); no two edit the same files. Bench: the Linux VM first (3 run slots), the home PC only as fallback (one JVM); `docs/testing/`. The workstation (4 cores, 12.5 GB) only edits: T0, the Node analysis suite, dump-based tools and Minecraft run in Actions or on the VM, and locally at most one quick Node command runs at a time (owner, 2026-11-01).

## Git
Personal account `Ezequiel24123z`, never the corporate one. Small commits, clear messages. No `git stash` (shared by every worktree): use a WIP commit.
