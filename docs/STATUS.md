# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.11.0 "UHV: Proxima and the Swarm". The player channel is `releases` (release `releases-channel`, `Gregtech-Grindless-releases.zip`); `playable` is mirrored to it during the transition; `jugable` is deleted.
- **Active development branch:** `ezequiel24123z-gregtech-grindless-modpack`. `main` matches it (PR #4 merged); feature work still branches from the development branch.
- **Current milestone:** UEV build and the MEGA family. Designs accepted: `docs/eras/uev.md` (queue in its *Build order*: S0 spikes first; S0-10 and M1/M2 after MEGA) and `docs/eras/mega.md` (queue in its section 6.6).
- **Last accepted integration batch:** UHV era (v0.11.0): 63 machines, 32 lines, 40 crossings; `-Tier uhv` PASS (gate 916/917, auto 403/403, eras 98/100); UHV-C3 T2 bench PASS (20261028-010622-server) and v0.10.0 save reopen PASS (20261028-012139).
- **Approved packages in flight:** UEV-S0 spikes (10 of 11 answered, S0-8 FAIL; `docs/research/uev-s0.md`), UEV-F1 registrations and the F2 integrator step integrated (F1 ids hidden until uev, one obtain rule per package); W (UEV wireless tier 10, UEV SMES cell) integrated, its hatches, covers and cell held until A3, A6 and A8; Wave A: A1 (calutron, isotopes), A4 (electron beam furnace, single-crystal foundry), A2 (heavy-ion cyclotron, recoil separator, superheavy chemistry lab), A3 (megabar press, (La,Y)H10), A6 (SNSPD foundry, van der Waals stacker, photonic integration hall; the optical computer only from the hall), A5 (nitride magnet works, SiC fibre plant, CVI furnace; HfTaCN coil, UEV hull and energy hatches obtainable) and A7 (Mk4 fusion ring, GTM fusion tier 10, and the He-3 polariser; orchestrator repair) integrated, the SX blade chain and the Fe16N2 magnet and UEV motor held until B3 (rhenium from Barnard, iron pentacarbonyl); next A8, then B1. MEGA-0/0b/0c shared library, MEGA-1 (LV Wire Works), MEGA-2 (MV Polymer Works), MEGA-3 (HV Coil Chemical Plant) and MEGA-7 (ZPM Assembly Hall, in a cleanroom) integrated; their quest rows wait for MEGA-I. Postgame direction recorded (MAX+, Hyper Stargate; `DECISIONS.md` 2026-10-27). INFRA-AZURE-CI integrated: `Invoke-GGTest.ps1` runs on the Linux VM (backend azure, 3 run slots, T1-T3 incl. the client) and falls back to the home PC only when the VM is unreachable or fails before the suite starts (`docs/testing/`); T0 also runs in GitHub Actions (`.github/workflows/t0.yml`). INFRA-ORDER integrated: every script carries a stamped `// priority:` line 1 (bands in `tools/analysis/script_order.json`; never hand-edited). At most 2 concurrent implementation workers (design sessions on Opus write docs only and may run alongside); bench runs share the VM's 3 slots.
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
