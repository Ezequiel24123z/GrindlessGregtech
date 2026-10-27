# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.9.0 "ZPM: Saturn and Uranus" (`049fc96`). `playable` and `jugable` both point to it.
- **Active development branch:** `ezequiel24123z-gregtech-grindless-modpack`. `main` matches it (PR #4 merged); feature work still branches from the development branch.
- **Current milestone:** UV build. Design accepted: `docs/eras/uv.md` (queue in its *Build order*: S0 spikes, F1, F2, waves A and B, C1-C3), decisions in `DECISIONS.md` (2026-10-27, "UV").
- **Last accepted integration batch:** UV era design (`docs/eras/uv.md`): 31 machines, 22 new lines, 24 crossings; Neptune and Pluto from orbit, the Mk3, the Starshot; the space elevator stays hidden until UHV.
- **Approved packages in flight:** UV-F1 registrations (S0 done: `docs/research/uv-s0.md`; F2 elevator part done).
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration.

## Open blockers and known issues
- GCYR's configured low gravity is not applied in game (menu only); the design no longer claims it.
- A same-save reopen in the headless test client deadlocks on our fixture's synchronous Rhino callback (not a persistence defect).
- The 4 GB test client is tight with EMI plus world generation; leave spark out of copied clients in EMI stages.
- `jugable` mirrors `playable` until the user switches the Prism pre-launch URL.

## Where details live (read one section, not the file)
- Era design: `docs/eras/<era>.md`. Complexity targets: `docs/research/complexity.md`.
- Decisions: `DECISIONS.md` (`git grep -n "<topic>" DECISIONS.md`). Credits: `CREDITS.md`.
- Quests: `docs/quests.md`. Validator: `tools/analysis/README.md`. Bench: `tools/test/README.md`. Textures: `tools/assets/README.md`.
- History (not read by default): `docs/sessions/`, `docs/migration/`.
