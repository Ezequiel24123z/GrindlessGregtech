# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.8.0 "LuV, the outer system" (`15a7f85`). `playable` and `jugable` both point to it.
- **Active development branch:** `ezequiel24123z-gregtech-grindless-modpack`. `main` matches it (PR #4 merged); feature work still branches from the development branch.
- **Current milestone:** ZPM build. Design accepted: `docs/eras/zpm.md` (queue in its *Build order*), decisions in `DECISIONS.md` (2026-10-26, "ZPM").
- **Last accepted integration batch:** ZPM-A9 the survey network (#15): the neutrino observatory, deep space network and Kuiper survey telescope, and the UV energy hatch with the solar-core survey (T1 passed; the namespace fix that restores the LV observatory recipes and the decodes, pending until B5, go to C3). Before it: ZPM-A7 fusion (#13): the Mk2 audit, D+He-3 fusion (Mk2 only), the plasma quench caster and the direct energy converter (T1 mechanisms passed; the quench item-output reads go to C3 after the fixture fix). Before it: ZPM-A8 outer chemistry (#14): the methane pyrolyser, vent bioreactor and aerogel works (graphene, nanotube yarn, archaeal culture, growth-medium broth, silica aerogel; T1 passed; the brine, tholin and nanograin routes stay pending until B3 and B4). Before it: ZPM-A5 the naquadria magnet works (#11) and ZPM-A6 qubits (#12): the magnet works (URhNq2 wire, HTS insert, the ZPM SMES cell and the ZPM wireless tier), and the diamond lattice fab, ion implanter and qubit fab (NV and donor qubits, Si-28, HPCA alternatives); both T1 passed. The CVD diamond routes stay pending until B5. Earlier: A4 actinides (#10), B2 the Saturn siphon (#17), B1 travel (#16; Uranus arrival, the orbit seeds, station deployment and skies go to C3), A2 naquadria (#8), A3 europium (#9), S0 (#6), F1 (#7), F2.
- **Approved packages in flight:** B3. Then B4 with B5, C1-C3, v0.9.0.
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
