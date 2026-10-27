# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.10.0 "UV: Neptune, Pluto and the edge". `playable` and `jugable` both point to it.
- **Active development branch:** `ezequiel24123z-gregtech-grindless-modpack`. `main` matches it (PR #4 merged); feature work still branches from the development branch.
- **Current milestone:** UHV build. Design accepted: `docs/eras/uhv.md` (queue in its *Build order*: S0 spikes, F1, F2, waves A and B, C1-C3), decisions in `DECISIONS.md` (2026-10-27, "UHV").
- **Last accepted integration batch:** UV era (v0.10.0): 31 machines, 22 lines, 24 crossings; `-Tier uv` PASS (20261027-142608-uv); UV-C3 T2 bench PASS (20261027-144119-server) and v0.9.0 save reopen PASS.
- **Approved packages in flight:** UHV waves A and B1-B6 done (S0, F1, F2, A1-A10, B1-B6; F1 ids held until uhv, one obtain rule per package). Order: B7 (running), INFRA-ORDER; C1-C3; v0.11.0; then the MEGA packages (design accepted: `docs/eras/mega.md`; MEGA-S spikes all PASS, so MEGA-0 is next, one mega per era LV-UHV incl. a coil-scaled LCR and a mega LCR; queue in its section 6.6) and UEV (era design on Opus). Postgame direction recorded (MAX+, Hyper Stargate; `DECISIONS.md` 2026-10-27). STEAM-X1 Horizon Collector integrated (ships with v0.11.0). INFRA-AZURE-CI integrated: `Invoke-GGTest.ps1` runs on the Linux VM (backend azure, 3 run slots, T1-T3 incl. the client) and falls back to the home PC only when the VM is unreachable or fails before the suite starts (`docs/testing/`); T0 also runs in GitHub Actions (`.github/workflows/t0.yml`). Home fallback smoke T1 PASS (run 20261027-220003-server). INFRA-ORDER (deterministic KubeJS script order; Linux loads scripts in a different order than Windows) must land before v0.11.0. At most 2 concurrent implementation workers (design sessions on Opus write docs only and may run alongside); bench runs share the VM's 3 slots.
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration.

## Open blockers and known issues
- `tools/test/places.mjs` resolves ${orbit:proxima_b} to the nonexistent gcyr:proxima_centauri_b_orbit (derives <surface>_orbit); no config uses the token. Fix in UHV-C3 (read the orbit from GCYR's orbit_world).
- GCYR's configured low gravity is not applied in game (menu only); the design no longer claims it.
- A same-save reopen in the headless test client deadlocks on our fixture's synchronous Rhino callback (not a persistence defect).
- The 4 GB test client is tight with EMI plus world generation; leave spark out of copied clients in EMI stages.
- `jugable` mirrors `playable` until the user switches the Prism pre-launch URL.

## Where details live (read one section, not the file)
- Era design: `docs/eras/<era>.md`. Complexity targets: `docs/research/complexity.md`.
- Decisions: `DECISIONS.md` (`git grep -n "<topic>" DECISIONS.md`). Credits: `CREDITS.md`.
- Quests: `docs/quests.md`. Validator: `tools/analysis/README.md`. Bench: `tools/test/README.md`. Textures: `tools/assets/README.md`.
- History (not read by default): `docs/sessions/`, `docs/migration/`.
