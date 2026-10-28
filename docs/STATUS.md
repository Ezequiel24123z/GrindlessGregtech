# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.12.0 "UEV: Three Stars". The player channel is `releases` (release `releases-channel`, `Gregtech-Grindless-releases.zip`); `playable` is mirrored to it during the transition; `jugable` is deleted.
- **Active development branch:** `ezequiel24123z-gregtech-grindless-modpack`. `main` matches it (PR #4 merged); feature work still branches from the development branch.
- **Current milestone:** UIV build (`docs/eras/uiv.md`, T11; queue in its *Build order* and *Parallel and serial*: S0 done, F1, then the F2 integrator step beside W, M1 (with S0-8's hatch half), waves A, B and C, then v0.13.0). UEV (`docs/eras/uev.md`) and the MEGA family through UEV (`docs/eras/mega.md`) are shipped.
- **Last accepted integration batch:** UEV era (v0.12.0): 40 lines, 295 steps, 56 crossings (C1 recount); `-Tier uev` PASS (20261028-115749-uev), `-Tier obtain -Implemented uev` PASS (20261028-134259-obtain); UEV-C3 T2 bench PASS (20261028-134635-server) and v0.11.0 save reopen PASS (20261028-135841). MEGA-0 to MEGA-9, MEGA-I and UEV-M (parallel hatch x4,096, Stellar Forge) ship with it.
- **Approved packages in flight:** UIV-S0 spikes integrated (`docs/research/uiv-s0.md`): S0-1 passes only with its fallback (the UIV hull and hatches come from UEV's builders, `.tiers(UEV, UIV)`), S0-2 forms the relay platform but the client jump is unproven (a T1 item for A2/A3), S0-8 was not run (M1 carries its hatch half, M2 its catalyst-bus half), the rest PASS. UIV-F1 (registrations: UIV hull and hatches, 8 components, MH coil, fusion and site casings, 27 materials, 34 items) done, merging after v0.12.0. Next: F2 (integrator) beside W, then M1. Carried UEV risks: B1 client flight legs never run; the UEV parallel hatch in a GCyM large machine untested (M1 checks it); `uev_parallel_hatch` and `stellar_forge` not modelled in `tiers/uev.json`. INFRA-AZURE-CI integrated: `Invoke-GGTest.ps1` runs on the Linux VM (backend azure, 3 run slots, T1-T3 incl. the client) and falls back to the home PC only when the VM is unreachable or fails before the suite starts (`docs/testing/`); T0 also runs in GitHub Actions (`.github/workflows/t0.yml`). INFRA-ORDER integrated: every script carries a stamped `// priority:` line 1 (bands in `tools/analysis/script_order.json`; never hand-edited). Postgame direction recorded (MAX+, Hyper Stargate; `DECISIONS.md` 2026-10-27). At most 2 concurrent implementation workers (design sessions on Opus write docs only and may run alongside); bench runs share the VM's 3 slots.
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration.

## Open blockers and known issues
- GCYR's configured low gravity is not applied in game (menu only); the design no longer claims it.
- A same-save reopen in the headless test client deadlocks on our fixture's synchronous Rhino callback (not a persistence defect).
- The 4 GB test client is tight with EMI plus world generation; leave spark out of copied clients in EMI stages.
- `playable` mirrors `releases` until old instances switch their Prism pre-launch URL to `/releases/`; then retire it.

## Where details live (read one section, not the file)
- Era design: `docs/eras/<era>.md`. Complexity targets: `docs/research/complexity.md`.
- Decisions: `DECISIONS.md` (`git grep -n "<topic>" DECISIONS.md`). Credits: `CREDITS.md`.
- Quests: `docs/quests.md`. Validator: `tools/analysis/README.md`. Bench: `tools/test/README.md`. Textures: `tools/assets/README.md`.
- History (not read by default): `docs/sessions/`, `docs/migration/`.
