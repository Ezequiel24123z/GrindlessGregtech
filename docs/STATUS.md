# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.17.0 "MAX" (`docs/releases/v0.17.0.md`; tag `v0.17.0` is `main`). The player channel is `releases` (release `releases-channel`, `Gregtech-Grindless-releases.zip`); `playable` is mirrored to it during the transition.
- **Integration branch:** `ezequiel24123z-project-reforge`. Every package branches from it and is merged back with `--no-ff` by the integrator; `main` stays at v0.17.0 until v1.0.0.
- **Current milestone:** Project Reforge (DECISIONS.md:695), v0.17.0 to v1.0.0 in ten phases: 0 rules and diagnosis, 1 cost tooling, 2 cost rebalance, 3 era and line audit, 4 research, 5 quests, 6 assets and sounds, 7 MAX+ and the Hyperstargate, 8 cleanup, 9 release. No save compatibility (DECISIONS.md:701): v1.0.0 needs a new world.
- **Done:**
  - Phases 0, 1 and 4.
  - Phase 2's mechanism: the cost-curve pass and its tables (`docs/reforge/02_cost_curve.md`).
  - Phase 3's audits:
    - the retired items are removed and the obtain pass is PASS;
    - 430 of 430 multiblocks are screenshot formed (`docs/reforge/03_formed_review.md`);
    - the line audit (`docs/reforge/03_line_audit.md`).
  - Phase 6's audit (`docs/reforge/06_assets_audit.md`).
  - Phase 7's design: `docs/eras/max.md` (shortfall and ending), the new `docs/eras/maxplus.md` and `docs/journey.md`.
- **Last accepted integration batch:** Reforge batch 2: RF-2A, RF-3A, RF-3B with its follow-up, RF-3C, RF-6A and RF-7A (issues #39-#44). T0 PASS on the batch-close commit (399 s; analysis 2475 pass, 0 fail).
  - Runs:
    - RF-2A: T1 20261101-012051-server-42f.
    - RF-3A: two MAX dumps, the obtain pass PASS and the EMI client 20261101-015612-client.
    - RF-3B: shots 20261101-012650-client-fbc; EAL run 20261101-020719-client-23b.
  - No batch T2. The only content change is RF-3A's removals, which its own reachability, obtain and EMI runs proved. The cost-curve pass lands at factor 1.0, which RF-2A's T1 proved leaves recipes identical.
- **Batch 3 in flight** (one nested session per package; no two packages share a file):

| Package | Issue | Content | Phase |
|---|---|---|---|
| P2-A | #46 | Cost band A: LV review, MV and HV switched on, hand-recipe bypasses removed | 2 |
| MX-R | #45 | MAX routes: the matrix's molten-metal rule, a `horizon_strand_ingot` route, dead `gtnn` circuits out of the key set | 2, 3 |

- **Next:** up to 10 nested sessions at once (owner, 2026-11-01; AGENTS.md:42), on disjoint files; the bench limits still apply.
  - **Worker 1, cost bands (serial):**
    - P2-B: EV and IV;
    - P2-C: LuV to UV;
    - P2-D: UHV to UIV, reconciling the solver first;
    - P2-E: UXV to MAX;
    - P2-Z: a final re-solve.
  - **Worker 2:** after MX-R, the Phase 3 line fixes from the top down, so they never share eras with worker 1:
    - RF-3H: UXV and OpV, with the era-aware skip check;
    - RF-3G, RF-3F, RF-3E, then RF-3D.

    Phase 6 packages (RF-6B to RF-6F) fill the gaps.
  - **Then:**
    - Phase 5 quests, capturing each chapter before changing it;
    - Phase 7, MAX (MX-*) and MAX+ (XP-*);
    - Phase 8 and Phase 9.
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration.

## Open questions for the owner (the defaults stand until answered)
- **Hand recipes:** remove the 50 crafting-table recipes of the MV to IV core components? A 3x3 grid cannot scale, so they bypass the curve. Default: yes.
- **Expanded Assembly Line and Matrix Data Relay:** keep them with the README note, or drop them? Default: keep. A debug package must prove an EAL recipe run before v1.0.0.
- **Art:** commission the genuine-art list (`06_assets_audit.md` section 8), or use generators only? Default: generators only.
- **MAX** (`max.md` open questions 1, 12, 13): accept 14 / 57 / 204, 12 horizon locks, and c3 gated on all four new machines? Default: yes.
- **MAX+** (`maxplus.md` open questions 1-9): one era in three stages; 58 lines plus a second pass after stage I; x5 per stage; creative items never placeable; one-way gate with a repeatable dial; the 2^39 x 19,200 t fallback; `horizon_city`; the archive crosses with the player; the ending text. Defaults as written.
- **Save compatibility after v1.0.0?** Default: yes, from v1.0.0 on.
- **Parallelism:** answered (owner, 2026-11-01): up to 10 nested sessions at once.

## Open blockers and known issues
- **Capacity:** 87 known violations (`tools/analysis/capacity_known.json`); the Phase 2 bands empty the list. 67 recipes also lose inputs or outputs past their recipe type's slots (`docs/reforge/data/00_dropped_inputs.csv`; none from LV to HV).
- **Cost:**
  - UHV to UXV factors are unsolved: the solver loop and the `--table` check disagree.
  - OpV's core is anomalously cheap: one route skips earlier chains.
  - Some routes multiply matter: ash separation fed by diamond CVD and diamond electrolysis, and blue topaz ore at ZPM and later (`02_cost_curve.md`).
- **MAX:** four machines and eleven lines are designed but not built (MX-F1 to MX-C2). MAX is priceable only after MX-R.
- **EMI:** 12 entries in `tools/analysis/emi_runtime_known.json`.
  - 10 are likely an audit false positive (preview lookup by bare id). A fixture fix plus one 8 GB EMI run removes them.
  - `launched_belt_seed` has no consumer (a MAX package).
  - `rejected_timing_head` needs the route check to read every output.
- **EAL:** it forms, but no recipe run has completed on the bench. On a dedicated server neither the EAL nor the Matrix Data Relay can form (an extendedfeatures 3.0.0 defect).
- **Lines:** chart lines sit far below the guide from ZPM, and UHV to OpV lines have no crossings in the charts (`03_line_audit.md`).
- **Assets:** 50 textures and 36 sound files are missing; UEV to MAX items are tint swaps; 24 textures of removed items are orphans (Phase 6 or 8).
- **Test environment:**
  - GCYR's configured low gravity is not applied in game (menu only); the design no longer claims it.
  - A same-save reopen in the headless test client deadlocks on our fixture's synchronous Rhino callback (not a persistence defect).
  - The 4 GB test client is tight with EMI plus world generation; leave spark out of copied clients in EMI stages. The EMI audit needs an 8 GB client alone on the VM.
- **Mirror:** `playable` mirrors `releases` until old instances switch their Prism pre-launch URL to `/releases/`; then retire it.

## Where details live (read one section, not the file)
- **Reforge:** `docs/reforge/`:
  - 00 diagnosis;
  - 01 cost matrix;
  - 02 cost curve;
  - 03 line audit and formed review;
  - 06 assets audit.

  Package contracts are the GitHub issues labelled `work-package`.
- **Era design:** `docs/eras/<era>.md`, with MAX+ in `docs/eras/maxplus.md`; the journey in `docs/journey.md`. Complexity targets: `docs/research/complexity.md`.
- **Decisions:** `DECISIONS.md` (`git grep -n "<topic>" DECISIONS.md`; Reforge from :695). Credits: `CREDITS.md`.
- **Quests:** `docs/quests.md`; quest research in `docs/research/quest-books.md`.
- **Tools:** the validator in `tools/analysis/README.md`, the bench in `tools/test/README.md`, textures in `tools/assets/README.md`.
- **History** (not read by default): `docs/sessions/`, `docs/migration/`.
