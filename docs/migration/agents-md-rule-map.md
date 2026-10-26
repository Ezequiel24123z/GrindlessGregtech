# AGENTS.md rule map (efficiency migration, 2026-10-26)

One-time checklist written before `AGENTS.md` was replaced. Every rule of the old file (`15a7f85:AGENTS.md`, 23 KB) and where it lives now. To recover the old file: `git show 15a7f85:AGENTS.md`.

| Old heading / rule | New destination |
|---|---|
| Intro: "read this file, `DECISIONS.md` and the latest session note" | Replaced: `AGENTS.md` "Context" (read `docs/STATUS.md`; DECISIONS, session notes and era histories not by default) |
| Structure table | `AGENTS.md` "Map" |
| Pack rules 1–6, 8 | `AGENTS.md` "Product principles" (compressed, same content) |
| Pack rule 7 (×1.35, what counts, Steam–HV not redone) | `AGENTS.md` principle 7 (short) + `docs/research/complexity.md` (targets, counting rules) |
| KubeJS: IDs | `AGENTS.md` "Invariants" |
| KubeJS: Patterns, Data, Integration | `kubejs.instructions.md` "Structure" |
| KubeJS: Text (en_us + es_es; quests English) | `AGENTS.md` "Invariants" + `kubejs.instructions.md` |
| KubeJS: Repository language | `AGENTS.md` "Invariants" |
| KubeJS: EMI coverage | `kubejs.instructions.md` "EMI" |
| KubeJS: Rhino `var`, vanilla names, empty stacks | `kubejs.instructions.md` "Rhino and KubeJS 2001.6.5" |
| GTM 7.5.3 traps (recipe ids … electric furnace, all 16) | `kubejs.instructions.md` "GTM 7.5.3 traps" (same rules, one bullet each) |
| packwiz (binary, adding a mod, index, CurseForge) | `release.instructions.md` "packwiz" |
| Testing: bench, home PC, JVM, heap, budgets, sound | `tests.instructions.md` "Bench and home PC" |
| Testing: integrated run, coverage, retest policy, failures | `tests.instructions.md` "When to run what" (+ T0 `tools/Check-Fast.ps1`) |
| Testing: test scripts location | `tests.instructions.md` |
| Test zones table (68 rows) | `tools/test/zones.json` + `tools/test/Get-GGTestZone.ps1` (duplicate biofoundry row merged) |
| Licenses | `AGENTS.md` "Invariants" + `assets.instructions.md` / `quests.instructions.md` |
| Project memory: DECISIONS, CREDITS | `AGENTS.md` "Ownership" (integrator only; packages propose lines in the handoff) |
| Project memory: session notes | Stopped. `docs/STATUS.md` (integrator) + handoff in the PR/merge commit |
| Git: account, small commits, no `git stash` | `AGENTS.md` "Git" |
| Git: versions and tagging | `release.instructions.md` "Versions" |
| Playable channel (playable/jugable, release, Prism) | `release.instructions.md` "Playable channel" |
| Compatible saves (4 rules) | `AGENTS.md` "Invariants" (compressed) + `release.instructions.md` (release-note duty) |
