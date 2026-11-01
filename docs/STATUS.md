# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.17.0 "MAX" (`docs/releases/v0.17.0.md`; tag `v0.17.0` is `main`). The player channel is `releases` (release `releases-channel`, `Gregtech-Grindless-releases.zip`); `playable` is mirrored to it during the transition.
- **Integration branch:** `ezequiel24123z-project-reforge`. Every package branches from it and is merged back with `--no-ff` by the integrator; `main` stays at v0.17.0 until v1.0.0.
- **Current milestone:** Project Reforge (DECISIONS.md:695), v0.17.0 to v1.0.0 in ten phases: 0 rules and diagnosis, 1 cost tooling, 2 cost rebalance, 3 era and line audit, 4 research, 5 quests, 6 assets and sounds, 7 MAX+ and the Hyperstargate, 8 cleanup, 9 release. No save compatibility (DECISIONS.md:701): v1.0.0 needs a new world.
- **Done:**
  - Phases 0, 1 and 4.
  - Phase 2: the cost-curve pass; bands A (MV, HV) and B (EV, IV) on; era-aware pricing (`docs/reforge/02_cost_curve.md`).
  - Phase 3:
    - audits: retired items, formed shots, line audit by design line with era-aware skips;
    - every era's chart pass (`docs/reforge/03_charts_*.md`; UV and UHV still open in RF-3L);
    - UIV line fixes (39 keep, 0 fix);
    - the EV to ZPM line design (production lines and tested roles, `docs/eras/ev.md`);
    - the Expanded Assembly Line and Matrix Data Relay dropped and hidden.
  - Phase 6:
    - the audit;
    - the 50 missing textures and the 21 shared controller faces;
    - the era-style library, applied to OpV and MAX;
    - the sound pipeline: 36 missing and 8 silent sounds made, every loop mastered.
  - Phase 7: the MAX and MAX+ design (`docs/eras/max.md`, `maxplus.md`), the MAX routes and the MAX ids.
- **Last accepted integration batch:** Reforge batch 3, rolling (issues #45-#64, #69-#71).
  - Packages: MX-R, P2-A, RF-3H, RF-3G, P2-T, MX-F1, Q-0, RF-6B to RF-6E, RF-3I to RF-3K, RF-3M to RF-3O, RF-3Q, RF-3S, P2-B, RF-3D, RF-3R.
  - T0: GitHub Actions on every merge (green on a7fccb23).
  - T2 on the VM, on the minimal-overlay dump of 4e217739 (`/var/lib/grindless/dumps/`):
    - reachability PASS for Steam to UV and for MAX;
    - UHV to OpV fail only their "Site" checks, as v0.17.0 already did (RF-3T);
    - pl-check 0 issues;
    - the obtain pass fails only on the 76 MX-F1 ids that wait for their MX-S routes.
- **In flight** (one nested session per package; no two share a file):

| Package | Issue | Content | Phase |
|---|---|---|---|
| RF-3L | #59 | UV and UHV charts | 3 |
| RF-3T | #72 | Reachability: era-aware site checks (release blocker) | 3 |
| MX-S1 | #68 | MAX machine 11: horizon interferometer and its lines | 7 |
| MX-S2 | #65 | MAX machine 12: ergoregion synchroniser and its lines | 7 |
| MX-S3 | #66 | MAX machine 13: horizon flux clamp (done; its textures pending) | 7 |
| MX-S4 | #67 | MAX machine 14: segment reclamation works and its lines | 7 |

- **Next** (queue; serial where packages share files):
  - Phase 3 content:
    - RF-3P1, then RF-3P2: UEV short and isolated lines;
    - from RF-3S: LD-T1 (audit roles), then LD-EV1, LD-IV1, LD-LV1, LD-ZP1 (charts), LD-EV2 (metal mixture row), LD-LV2 (tetrataenite gate), LD-ZP2 (tritium store at VA[UEV]);
    - the content problems listed in `03_charts_steam_hv.md`, `03_charts_uxv_opv.md` and, after RF-3L, UV and UHV.
  - Phase 2: P2-C (LuV to UV, after LD-LV2 and LD-ZP2), P2-D (UHV to UIV, reconciling the solver first), P2-E (UXV to MAX), P2-Z (final re-solve).
  - Phase 7:
    - after MX-S1 to MX-S4: MX-E1, then MX-C1 and MX-C2;
    - then MAX+ (XP-*).
  - Phase 6: RF-6D-b (era style for UV to UIV), after the owner's feedback on the OpV and MAX look.
  - Then Phase 5 quests (capture each chapter before changing it), Phase 8 and Phase 9.
- **Workstation rule** (owner, 2026-11-01): the workstation only edits; T0 runs in GitHub Actions on every push or on the VM, and the analysis suite, cost solves, dump-based tools and Minecraft run on the VM (`tools/vm/gg-vm-exec.sh`, `docs/testing/usage.md`). Up to 10 nested sessions at once (AGENTS.md:42); the workstation holds about 7 with headroom.
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration.

## Open questions for the owner (the defaults stand until answered)
- **Hand recipes:** remove the crafting-table recipes of the core components from MV up? A 3x3 grid cannot scale, so they bypass the curve. Default: yes (done for MV to IV; the MV and HV hulls stay as the bootstrap).
- **Art:** commission the genuine-art list (`06_assets_audit.md` section 8), or use generators only? Default: generators only.
- **Era style:** does the OpV and MAX look of RF-6D (brighter, more saturated, speckled) work? Default: yes, and RF-6D-b extends it to UV to UIV.
- **MAX** (`max.md` open questions 1, 12, 13): accept 14 / 57 / 204, 12 horizon locks, and c3 gated on all four new machines? Default: yes.
- **MAX+** (`maxplus.md` open questions 1-9): one era in three stages; 58 lines plus a second pass after stage I; x5 per stage; creative items never placeable; one-way gate with a repeatable dial; the 2^39 x 19,200 t fallback; `horizon_city`; the archive crosses with the player; the ending text. Defaults as written.
- **EV to ZPM line design** (RF-3S, `docs/eras/ev.md`): only production lines count toward the guide; keep GTM's one-step nitric folds; separate metal mixture; gate tetrataenite; keep belt Ir/Os with a P2-C rate check; gate the tritium store; ZPM's gap stays named. Defaults as written.
- **Save compatibility after v1.0.0?** Default: yes, from v1.0.0 on.

## Open blockers and known issues
- **Reachability:** the UHV to OpV tiers fail their "Site" checks on every dump since v0.17.0 (later eras add rows at new sites); RF-3T makes the checks era-aware. A gate FAIL blocks the release.
- **Obtain pass:** FAIL while the 76 MX-F1 ids have no route; MX-S1 to MX-S4 and MX-E1 give them routes and delete their `emi_coverage.json` exception rows.
- **Capacity:** 65 known violations (`tools/analysis/capacity_known.json`); the cost bands empty the list. Recipes that lose inputs past their type's slots: `docs/reforge/data/00_dropped_inputs.csv` (none from LV to IV).
- **Cost:**
  - EV's core index is 12.6% under the curve (one global factor is quantised); P2-Z re-solves.
  - UHV to UXV factors are unsolved: the solver loop and the `--table` check disagree.
  - OpV's core is anomalously cheap: one route skips earlier chains.
  - Some routes multiply matter: ash separation fed by diamond CVD and diamond electrolysis, and blue topaz ore at ZPM and later (`02_cost_curve.md`).
- **EMI:** 10 entries in `tools/analysis/emi_runtime_known.json`:
  - 8 previews, likely an audit false positive that the fixed fixture removes on the next 8 GB EMI run;
  - `launched_belt_seed` without a consumer (a MAX package);
  - `rejected_timing_head` (the route check must read every output).
- **Lines:** short and skippable lines are listed per era with their content files (`docs/reforge/03_charts_*.md`); LuV and ZPM are sorted into production lines and roles by RF-3S.
- **Assets:**
  - UEV to UIV items are tint swaps until RF-6D-b;
  - 24 textures of removed items are orphans (Phase 8);
  - sound loop-seam and harsh flags need an in-game listen at release.
- **Test environment:**
  - GCYR's configured low gravity is not applied in game (menu only); the design no longer claims it.
  - A same-save reopen in the headless test client deadlocks on our fixture's synchronous Rhino callback (not a persistence defect).
  - The 4 GB test client is tight with EMI plus world generation; leave spark out of copied clients in EMI stages. The EMI audit needs an 8 GB client alone on the VM.
  - A batch dump for the validator comes from a minimal overlay (`gg_dump.js` only): the full test overlay adds probe recipes, the lava probe among them, that fail the `auto` checks. `--table` must target the existing hidden table so that its `removeRecipes` are kept.
- **Mirror:** `playable` mirrors `releases` until old instances switch their Prism pre-launch URL to `/releases/`; then retire it.

## Where details live (read one section, not the file)
- **Reforge:** `docs/reforge/`:
  - 00 diagnosis;
  - 01 cost matrix;
  - 02 cost curve;
  - 03 line audit, chart passes and formed review;
  - 06 assets audit.

  Package contracts are the GitHub issues labelled `work-package`.
- **Era design:** `docs/eras/<era>.md`, with MAX+ in `docs/eras/maxplus.md`; the journey in `docs/journey.md`. Complexity targets: `docs/research/complexity.md`.
- **Decisions:** `DECISIONS.md` (`git grep -n "<topic>" DECISIONS.md`; Reforge from :695). Credits: `CREDITS.md`.
- **Quests:** `docs/quests.md`; quest research in `docs/research/quest-books.md`.
- **Tools:**
  - the validator: `tools/analysis/README.md`;
  - the bench and the VM: `tools/test/README.md`, `docs/testing/` (`usage.md` for `gg-vm-exec.sh`);
  - textures and sounds: `tools/assets/README.md`.
- **History** (not read by default): `docs/sessions/`, `docs/migration/`.
