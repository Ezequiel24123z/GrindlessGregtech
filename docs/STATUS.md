# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.9.0 "ZPM: Saturn and Uranus" (`049fc96`). `playable` and `jugable` both point to it.
- **Active development branch:** `ezequiel24123z-gregtech-grindless-modpack`. `main` matches it (PR #4 merged); feature work still branches from the development branch.
- **Current milestone:** UV design. The era doc `docs/eras/uv.md` is being written by the architecture session; ZPM is complete (`docs/eras/zpm.md`).
- **Last accepted integration batch:** ZPM-C3 integrated validation (#23) and ZPM-D1 release blockers (#24): every C3 stage passed (home 169, sites 82, power gate, book, EMI, travel); D1 fixed the naquadria casing loop, the Uranus deuterium dimension, the implanter gate and the wireless hatch rating; `-Tier zpm`, `-Tier luv` and `pl-check --strict --era zpm` pass, and the space elevator moved to UV. T0 passes (622).
- **Approved packages in flight:** UV era architecture (Opus design session).
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
