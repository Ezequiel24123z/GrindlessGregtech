# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.17.0 "MAX" (`docs/releases/v0.17.0.md`; tag `v0.17.0` is `main`). The player channel is `releases` (release `releases-channel`, `Gregtech-Grindless-releases.zip`); `playable` is mirrored to it during the transition.
- **Integration branch:** `ezequiel24123z-project-reforge`. Every package branches from it and is merged back with `--no-ff` by the integrator; `main` stays at v0.17.0 until v1.0.0.
- **Current milestone:** Project Reforge (DECISIONS.md:695), v0.17.0 to v1.0.0 in ten phases: 0 rules and diagnosis, 1 cost tooling, 2 cost rebalance, 3 era and line audit, 4 research, 5 quests, 6 assets and sounds, 7 MAX+ and the Hyperstargate, 8 cleanup, 9 release. No save compatibility (DECISIONS.md:701): v1.0.0 needs a new world.
- **Done:**
  - Phases 0, 1 and 4.
  - Phase 2: the cost-curve pass and era-aware pricing; bands A (MV, HV), B (EV, IV) and C (LuV, ZPM, UV) on (`docs/reforge/02_cost_curve.md`).
  - Phase 3:
    - every era's chart pass and the line design of EV to ZPM (RF-3S, with the role tests of LD-T1 and LD-T2);
    - Steam to HV, MV, HV, IV, UEV, UXV and OpV: no fix row left in the line audit;
    - era-aware site checks: reachability passes for every tier from Steam to MAX.
  - Phase 6:
    - the audit;
    - the 50 missing textures and the 21 shared controller faces;
    - the era-style library, applied to OpV and MAX;
    - the sound pipeline.
  - Phase 7:
    - the MAX and MAX+ design (`docs/eras/max.md`, `maxplus.md`);
    - MAX after Reforge: the routes, the ids, machines 11 to 14 with lines L47 to L57, and the ending rework (the shell's c3 makes `grindless:horizon_lock` and grants `maxplus`; the credits move to the MAX+ arrival).
- **Last accepted integration batch:** Reforge batch 4, rolling (issues #59, #65-#68, #72-#87).
  - Packages: RF-3T, MX-S1 to MX-S4, MX-E1, LD-T1, LD-T2, LD-ZP1, LD-ZP2, LD-LV1, LD-LV2, LD-EV1, LD-IV1, RF-3P1, RF-3P2, RF-3L, RF-3U, RF-3V (partial), P2-C; LD-EV2 closed with no change (its row already existed).
  - T0: GitHub Actions on every merge.
  - T2 on the VM, on the minimal-overlay dump of 4d2cd154 (`/var/lib/grindless/dumps/latest`):
    - reachability PASS for all 15 tiers, Steam to MAX;
    - obtain: only `grindless:epilogue` was visible, and the regenerated hidden table (f01d80ed) hides it;
    - pl-check 0 issues;
    - line audit: 34 fix rows left (Steam 1, LV 1, EV 1, LuV 4, ZPM 19, UV 5, UHV 1, UIV 1), all in the packages below.
- **In flight** (one nested session per package; no two share a file):

| Package | Issue | Content | Phase |
|---|---|---|---|
| P2-D | #88 | Cost band D: UHV, UEV and UIV on, after reconciling the solver's two paths | 2 |
| MX-C1 | #89 | MAX validator: RF-7A counts and checks | 7 |
| LD-ZP3 | #90 | ZPM lines: the waste and qubits chains, a destination for ring ice, the network and chart roles | 3 |
| LD-LV3 | #91 | LuV lines: gate GTM's crystal chips and optical pipe (default), the asteroid ends, the Kerr ringdown slot | 3 |
| RF-3W | #92 | UV to UIV lines: Pluto, starshot, UHV life and UIV light; the closed ecosystem slot | 3 |
| XP-S0a | #93 | MAX+ spikes S0-1 to S0-5: amperage, hatches, cable, generators, parallels | 7 |

- **Next** (queue; serial where packages share files):
  - Phase 3: LD-LO1 (Steam glass, LV fertilizer, EV dome: the last low-tier fix rows).
  - Phase 2: P2-E (UXV to MAX, the OpV anomaly) after P2-D; P2-Z (final re-solve) after Phase 3.
  - Phase 7: XP-S0b (S0-6 to S0-10: registry ids, the placement guard, structure size, dimension teleport, city size); then XP-F1 and the MAX+ build order (`maxplus.md` *Build order*).
  - Phase 6: RF-6D-b (era style for UV to UIV).
  - Phase 5: a quest design pass first (it takes MX-C2's MAX quest data); capture each chapter before changing it.
  - Then Phase 8 and Phase 9.
- **Workstation rule** (owner, 2026-11-01): the workstation only edits; T0 runs in GitHub Actions on every push or on the VM, and the analysis suite, cost solves, dump-based tools and Minecraft run on the VM (`tools/vm/gg-vm-exec.sh`, `docs/testing/usage.md`). Up to 10 nested sessions at once (AGENTS.md:42); the workstation holds about 6 with headroom.
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration.

## Open questions for the owner (the defaults stand until answered)
- **Hand recipes:** remove the crafting-table recipes of the core components from MV up? A 3x3 grid cannot scale, so they bypass the curve. Default: yes (done for MV to UV; the MV and HV hulls stay as the bootstrap).
- **Art:** commission the genuine-art list (`06_assets_audit.md` section 8), or use generators only? Default: generators only.
- **Era style:** does the OpV and MAX look of RF-6D (brighter, more saturated, speckled) work? Default: yes, and RF-6D-b extends it to UV to UIV.
- **MAX** (`max.md` open questions 1, 12, 13): accept 14 / 57 / 204, 12 horizon locks, and c3 gated on all four new machines? Default: yes.
- **MAX+** (`maxplus.md` open questions 1-9): one era in three stages; 58 lines plus a second pass after stage I; x5 per stage; creative items never placeable; one-way gate with a repeatable dial; the 2^39 x 19,200 t fallback; `horizon_city`; the archive crosses with the player; the ending text. Defaults as written.
- **EV to ZPM line design** (RF-3S, `docs/eras/ev.md`): only production lines count toward the guide; keep GTM's one-step nitric folds; gate tetrataenite; keep belt Ir/Os (P2-C: not worse than Mercury); gate the tritium store; ZPM's gap stays named. Defaults as written.
- **LuV orbital lines** (LD-LV3): GTM's autoclave crystal chips and assembler optical pipe make the zero-g grower and the microgravity smelter optional. Default: remove them (the orbital routes become the only ones, as for tetrataenite), unless something before LuV needs them. The alternative keeps them and counts the two machines as folds, not lines.
- **Save compatibility after v1.0.0?** Default: yes, from v1.0.0 on.

## Open blockers and known issues
- **Cost:**
  - EV's core index is 12.6% and LuV's 8.5% under the curve (one global factor is quantised); P2-Z re-solves.
  - UHV to UXV factors wait for P2-D, which first reconciles the solver loop with the `--table` check.
  - OpV's core is anomalously cheap: one route skips earlier chains (P2-E).
  - Some routes multiply matter: ash separation fed by diamond CVD and diamond electrolysis, and blue topaz ore at ZPM and later (`02_cost_curve.md`).
- **Capacity:** 48 known violations (`tools/analysis/capacity_known.json`); the cost bands empty the list. P2-C escalated two dropped circuits (`kerr_ringdown_record`, `culture_seed`), now in LD-LV3 and RF-3W.
- **EMI:** 10 entries in `tools/analysis/emi_runtime_known.json`:
  - 8 previews, likely an audit false positive that the fixed fixture removes on the next 8 GB EMI run;
  - `launched_belt_seed` without a consumer (a MAX package);
  - `rejected_timing_head` (the route check must read every output).
- **The `maxplus` stage** is a world persistentData flag (`grindless_stage_maxplus`, MX-E1): the pack has no stage mod, and MAX+ packages read the flag.
- **Assets:**
  - UEV to UIV items are tint swaps until RF-6D-b;
  - textures of removed items are orphans (Phase 8);
  - sound loop-seam and harsh flags need an in-game listen at release.
- **Test environment:**
  - GCYR's configured low gravity is not applied in game (menu only); the design no longer claims it.
  - A same-save reopen in the headless test client deadlocks on our fixture's synchronous Rhino callback (not a persistence defect).
  - The 4 GB test client is tight with EMI plus world generation; leave spark out of copied clients in EMI stages. The EMI audit needs an 8 GB client alone on the VM.
  - A batch dump for the validator comes from a minimal overlay (`gg_dump.js` only): the full test overlay adds probe recipes, the lava probe among them, that fail the `auto` checks. `--table` must target the existing hidden table so that its `removeRecipes` are kept. Commit a fresh pack index before any VM dump (the VM runs skip the refresh).
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