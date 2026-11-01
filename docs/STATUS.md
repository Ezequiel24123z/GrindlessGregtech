# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.17.0 "MAX" (`docs/releases/v0.17.0.md`; tag `v0.17.0` is `main`). The player channel is `releases` (release `releases-channel`, `Gregtech-Grindless-releases.zip`); `playable` is mirrored to it during the transition.
- **Integration branch:** `ezequiel24123z-project-reforge`. Every package branches from it and is merged back with `--no-ff` by the integrator; `main` stays at v0.17.0 until v1.0.0.
- **Current milestone:** Project Reforge (DECISIONS.md:695), v0.17.0 to v1.0.0 in ten phases: 0 rules and diagnosis, 1 cost tooling, 2 cost rebalance, 3 era and line audit, 4 research, 5 quests, 6 assets and sounds, 7 MAX+ and the Hyperstargate, 8 cleanup, 9 release. No save compatibility (DECISIONS.md:701): v1.0.0 needs a new world.
- **Done:**
  - Phases 0, 1 and 4.
  - Phase 2, done: the cost-curve pass and era-aware pricing; bands A (MV, HV), B (EV, IV), C (LuV, ZPM, UV), D (UHV, UEV, UIV) and E (UXV, OpV, MAX); P2-Z's re-solve dithers each scaled count, so every era from MV to MAX lands within 10% of its target (`docs/reforge/02_cost_curve.md`); OpV and MAX components take their previous-tier counterpart (P2-E).
  - Phase 3:
    - every era's chart pass and the line design of EV to ZPM (RF-3S, with the role tests of LD-T1, LD-T2 and LD-T3);
    - the line audit has no fix row left in any era from Steam to OpV (MAX is judged by its own validator, MX-C1);
    - era-aware site checks: reachability passes for every tier from Steam to MAX.
  - Phase 5:
    - the design (`docs/reforge/05_quest_design.md`, RF-5A);
    - one shared chapter writer (`tools/quests/gen-chapters.mjs`, RF-5L1) and Steam to IV imported to data (RF-5L2);
    - Welcome, the side tabs and Steam to UEV in the Phase 5 shape: EV, IV and LuV in three chapters each (age, circuits, machines), ZPM to UEV in four (plus integration); chapter groups per era (Early Ages for Steam to HV, then one per era).
  - Phase 6:
    - the audit;
    - the 50 missing textures and the 21 shared controller faces;
    - the era-style library, applied to UV, UHV, UEV, UIV, UXV, OpV and MAX;
    - the sound pipeline.
  - Phase 7:
    - the MAX and MAX+ design (`docs/eras/max.md`, `maxplus.md`);
    - MAX after Reforge: the routes, the ids, machines 11 to 14 with lines L47 to L57, the chart (PL-MX) and the ending rework (the shell's c3 makes `grindless:horizon_lock` and grants `maxplus`; the credits move to the MAX+ arrival);
    - MAX+ spikes S0-1 to S0-10 (`maxplus.md` S0 table: wireless instead of a kerr cable; creative items are `grindless:` stand-ins);
    - the MAX+ foundation (XP-F1): the ids table, nine components, the 1,024 A hatch `gtceu:max_maxplus_energy_hatch_1024a`, four creative stand-ins and the four places; the ids without a recipe are hidden (XP-F2);
    - MAX+ build order rows 5 to 9, 16, 17 and 19 (first part): the power plumbing (XP-W, P18 and the 1,024 A hatch recipe), the condensate (XP-A1: the shell's c4, the condensate refinery and the bound-matter press), the horizon processor (XP-A3), the components and the horizon casing (XP-A2, C1 to C7), the AE2 top tier (XP-AE, A1 to A3), the meta-material loom (XP-H1, T4 to T7), the condensate assembler (XP-H3, machine 14; machine 15 waits for the dial's power mechanism) and the Hills slingshot with gate c16 to 30 Doradus (XP-T1, P15, P16). Every MAX+ machine runs on the 1,024 A hatch.
- **Last accepted integration batch:** Reforge batch 8 (issues #112-#125).
  - Packages: P2-Z, XP-A2, XP-H1, XP-AE, XP-H3, XP-T1, and the ZPM, UV, UHV and UEV quest pairs (RF-5Q-ZPMa to RF-5Q-UEVb).
  - Integrator fixes:
    - GTM's 64 A substation hatches do not fit a multiblock's energy slot, so MAX+ machines and gate rows use the 1,024 A hatch (`maxplus.md` hatch table);
    - an older machine's MAX+ rows keep its site: the cryogenic plant's run on the Moon; P25's mass-filter row at 30 Doradus is excepted from MAX's Cygnus rule;
    - `grindless:horizon_frame_part` registered; XP-H1's inverted gadolinium row fixed;
    - quest layout fixes on the merged UEV and UHV chapters;
    - older gate tests find c14 and c15 by name;
    - P16's nav core takes the thorium nav clock (XP-T1 had left the clock without a use).
  - T0: GitHub Actions on every merge.
  - T1 on the VM:
    - `gg_test_maxplus_loom` PASS (formed, ran at 2^33);
    - `gg_test_maxplus_assembler` PASS (one 1,024 A hatch, c1 at 2^39);
    - `gg_test_maxplus_slingshot` PASS (c2 at 2^35).

    Gate c16 has not been thrown in game: it reuses the c14 and c15 mechanism.
  - T2 on the VM, dump 82b206e8e4c9, confirmed on d883a6b82fb5 (`/var/lib/grindless/dumps/latest`):
    - reachability PASS for all 15 tiers, Steam to MAX;
    - obtain PASS: the 33 ids XP-H3 and XP-T1 gave a recipe left the class C row; the hidden table regenerated;
    - capacity lint: 8 known violations, no new one (snapshot rebuilt);
    - `gg_test_quests` PASS at d883a6b8 (56 chapters, 4,838 quests); quest lint 0 errors, the 6 known layout warnings (1 in `ev_machines`, 5 in `opv_age`).
- **In flight** (one nested session per package; no two share a file):

| Package | Issue | Content | Phase |
|---|---|---|---|
| XP-Q | #126 | MAX+ components on the recipe-quality ladder; MAX+ controllers on the design's base | 7 |
| RF-5Q-UIVa | #127 | Quests: UIV journey and integration chapters | 5 |
| RF-5Q-UIVb | #128 | Quests: UIV circuits and machines chapters | 5 |

- **Next** (queue; serial where packages share files):
  - Phase 5, in the order of `05_quest_design.md` §5.2: UXV and OpV in pairs (OpVa fixes its 5 warnings), PL-MX and MX-C2 (MAX), RF-5I3. The owner reviews the renders as they come (the integrator renders them with `tools/quests/render-book.mjs --compare`); they do not block.
  - Phase 7, `maxplus.md` *Build order*, after XP-Q:
    - XP-B1 (Tarantula; its T1 also throws gate c16), XP-T2 (gates c17 to c19, serial on `gate.json`), XP-B2 to XP-B4, XP-M1, XP-H2, XP-H4, XP-K;
    - the capacitor bank (machine 15) with XP-W2 and XP-G1, which settle how the dial is fed;
    - XP-Z1, XP-C1 (the `maxplus` era in the era lists and its validator tier), XP-PL, XP-C2a and XP-C2b.

    Each merge takes its ids out of the class C row.
  - A small capacity package: the six static overflows of `capacity_known.json` in other eras' scripts, and UHV's ZBLAN mixer row, whose 73,250 mB of fluorine no singleblock mixer holds after P2-Z.
  - Phase 6: the MAX+ assets package (textures for the MAX+ items, casings and controllers; XP-Z1's city structures), once the machine packages have landed.
  - Then Phase 8 and Phase 9.
- **Workstation rule** (owner, 2026-11-01): the workstation only edits; T0 runs in GitHub Actions on every push or on the VM, and the analysis suite, cost solves, dump-based tools and Minecraft run on the VM (`tools/vm/gg-vm-exec.sh`, `docs/testing/usage.md`). Up to 10 nested sessions at once (AGENTS.md:42); the workstation holds about 6 with headroom.
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration.

## Open questions for the owner (the defaults stand until answered)
- **Hand recipes:** remove the crafting-table recipes of the core components from MV up? A 3x3 grid cannot scale, so they bypass the curve. Default: yes (done for MV to UV; the MV and HV hulls stay as the bootstrap).
- **Art:** commission the genuine-art list (`06_assets_audit.md` section 8), or use generators only? Default: generators only.
- **Era style:** does the OpV and MAX look of RF-6D (brighter, more saturated, speckled) work? Default: yes; RF-6D-b extended it to UV to UXV.
- **MAX** (`max.md` open questions 1, 12, 13): accept 14 / 57 / 204, 12 horizon locks, and c3 gated on all four new machines? Default: yes.
- **MAX+** (`maxplus.md` open questions 1-9): one era in three stages; 58 lines plus a second pass after stage I; x5 per stage; creative items never placeable; one-way gate with a repeatable dial; the 2^39 x 19,200 t fallback; `horizon_city`; the archive crosses with the player; the ending text. Defaults as written.
- **EV to ZPM line design** (RF-3S, `docs/eras/ev.md`): only production lines count toward the guide; keep GTM's one-step nitric folds; gate tetrataenite; keep belt Ir/Os (P2-C: not worse than Mercury); gate the tritium store; ZPM's gap stays named. Defaults as written.
- **Logs at Steam and LV** (LD-T3): the Horizon Collector makes 960 oak logs a minute at 16 EU/t; the fertilized LV greenhouse makes 72. Keep the collector as the generous start, or cut its log row so the greenhouse is LV's log route? Default: keep (the start is generous by design, `steam.md`); the greenhouse line counts for its other outputs.
- **Phase 5** (`05_quest_design.md` §6, nine questions): era chapter groups; MAX+ in nine chapters; six roles, not six chapters; longer text for teaching quests; restore the merged wafer and circuit steps; Power after LuV optional; item rewards only from gated lines; Welcome's bread; before captures per batch. Defaults: yes to each, as written.
- **Phase 5 shape:** the before and after renders of batch 1 (Steam to EV) and of IV to UEV wait for the owner's review. They do not block: the owner asked for autonomous work.
- **OpV and MAX components** (P2-E): the OpV rule of 2026-10-29 (`opv.md` *Validator*) forbade lower components; P2-E's band E lets each core component take its previous-tier counterpart, as UXV's take UIV's, because the OpV core cost 310 against 71,526. Keep it? Default: yes (AGENTS.md principle 2 wins over pre-Reforge docs; machines, hatches and controllers keep the rule whole).
- **Save compatibility after v1.0.0?** Default: yes, from v1.0.0 on.

## Open blockers and known issues
- **Cost:**
  - LuV (0.912) and UIV (0.907) sit near the lower edge of the 10% band; changing one era's factor means re-solving every era above it. The OpV and UXV hulls are outliers (9 to 25 times their peers), explained in `02_cost_curve.md`, not fixed.
  - Some routes multiply matter: ash separation fed by diamond CVD and diamond electrolysis, and blue topaz ore at ZPM and later (`02_cost_curve.md`).
- **Capacity:** 8 known violations (`tools/analysis/capacity_known.json`); six are static overflows in other eras' scripts, for the small capacity package in *Next*.
- **EMI:** 9 entries in `tools/analysis/emi_runtime_known.json`:
  - 8 previews, likely an audit false positive that the fixed fixture removes on the next 8 GB EMI run;
  - `launched_belt_seed` without a consumer (a MAX package).
- **The `maxplus` stage** is a world persistentData flag (`grindless_stage_maxplus`, MX-E1): the pack has no stage mod, and MAX+ packages read the flag.
- **MAX+ until XP-C1:** the ids with no recipe yet are one class C row in `tools/analysis/tiers/obtain.json` (hidden) and carry EMI exception rows; the `maxplus` era is not yet in the era lists; the es_es names of XP-F1 are word-by-word (Phase 8 review). Until XP-Q lands, MAX+ controllers take MAX components (the quality ladder stops at MAX).
- **Assets:**
  - MAX+ has no textures yet: XP-F1's items and six casings point at files that do not exist, and the MAX+ machines (refinery, press, loom, condensate assembler, slingshot) wear MAX art until the MAX+ assets package;
  - the UEV, UIV and UXV foundation scripts still draw items that `foundation.js` no longer registers, so their self-check fails (Phase 8);
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