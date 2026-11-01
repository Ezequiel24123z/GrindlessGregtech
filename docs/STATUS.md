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
    - Welcome, the side tabs and every era from Steam to MAX in the Phase 5 shape: EV, IV and LuV in three chapters each (age, circuits, machines), ZPM to OpV in four (plus integration), MAX in five (plus `max_horizon`, the capstone); chapter groups per era (Early Ages for Steam to HV, then one per era). Left for Phase 5: the MAX+ chapters (XP-C2a and XP-C2b, after XP-C1) and the optional Power bands after LuV (RF-5P).
  - Phase 6:
    - the audit;
    - the 50 missing textures and the 21 shared controller faces;
    - the era-style library, applied to UV, UHV, UEV, UIV, UXV, OpV and MAX;
    - the sound pipeline.
  - Phase 7:
    - the MAX and MAX+ design (`docs/eras/max.md`, `maxplus.md`);
    - MAX after Reforge: the routes, the ids, machines 11 to 14 with lines L47 to L57, the chart (PL-MX) and the ending rework (the shell's c3 makes `grindless:horizon_lock` and grants `maxplus`; the credits move to the MAX+ arrival);
    - MAX+ spikes S0-1 to S0-11 (`maxplus.md` S0 table: wireless instead of a kerr cable; creative items are `grindless:` stand-ins; S0-11, the dial's 4,096 A wireless hatch);
    - the MAX+ foundation (XP-F1): the ids table, nine components, the 1,024 A hatch `gtceu:max_maxplus_energy_hatch_1024a`, four creative stand-ins and the four places; the ids without a recipe are hidden (XP-F2);
    - MAX+ build order rows 5 to 9, 16, 17 and 19 (first part): the power plumbing (XP-W, P18 and the 1,024 A hatch recipe), the condensate (XP-A1: the shell's c4, the condensate refinery and the bound-matter press), the horizon processor (XP-A3), the components and the horizon casing (XP-A2, C1 to C7), the AE2 top tier (XP-AE, A1 to A3), the meta-material loom (XP-H1, T4 to T7), the condensate assembler (XP-H3, machine 14) and the Hills slingshot with gate c16 to 30 Doradus (XP-T1, P15, P16). Every MAX+ machine runs on the 1,024 A hatch; the MAX+ components are tier 15 on the quality ladder and the controllers take the design's base (XP-Q);
    - MAX+ build order rows 10 to 15 (batch 11): the four MAX+ places all reached (gates c16 to c19), machines 4 to 10 (30 Doradus, the Stream, M31, the filament) with lines P6 to P14, P17 and P20 to P24, the Hyperfactory and the x4,194,304 parallel hatch, the MAX+ item and casing textures, and the dial's power design (XP-D1: the horizon capacitor bank, machine 15, feeds one 4,096 A wireless hatch).
  - Capacity: no known violation left (CAP-K).
- **Last accepted integration batch:** Reforge batch 11 (issues #134, #137, #138, #139, #140, #141, #142).
  - Packages:
    - XP-T2: gates c17 to c19 (the Magellanic Stream, the M31 nucleus, the Local Group filament);
    - XP-M1: the MAX+ parallel hatch (x4,194,304) and the Hyperfactory;
    - XP-B1: 30 Doradus (the stellar lift, the pair-instability crucible, the nickel-56 burner);
    - XP-B2: the Stream (the pristine gas works, the primordial fusion torus); the calutron and the jet beam line gained optional hatches;
    - XP-B3/B4: the blueshift forge at M31 and the void crystal fab in the filament;
    - XP-V1: MAX+ textures for 244 items and 6 casings in Era.Lib's MAX+ style, plus 72 RF-7A MAX items that had none;
    - XP-D1: the dial's power: one 4,096 A wireless MAX+ hatch fed by the horizon capacitor bank (S0-11). The 64-hatch path and the 19,200 t fallback are retired.
  - Integrator fixes:
    - the burner and torus T1s:
      - a generator takes no energy input;
      - GTM 7.5.3 reports a generator's EU/t as a positive amount, so the direction is read from the dynamo;
      - long runs skip to their end, because the bench waits at most 180 s;
      - a bare `/output_hatch/` also matched the dynamo;
    - `Build-MaxPlusTextures.ps1` shifted with `>>`, a PowerShell redirect, instead of `-shr`;
    - `maxplus.md`: 14 lines rejoined where a PowerShell backtick-n had eaten an id's leading n; open question 6 closed;
    - the validators know the four MAX+ places (warp gate ends; XP-B1's P6 rows excepted from the Cygnus-only rule), and the obtain audit reaches them, so 76 entries left the XP-F1 hide row (65 remain).
  - T0: GitHub Actions green at 4510a293.
  - T1 on the VM: `gg_test_maxplus_gates`, `gg_test_maxplus_hyperfactory`, `gg_test_maxplus_tarantula` (gate c16 thrown from Sgr A\*, burner at 2^34) and `gg_test_maxplus_stream` (torus at 2^34) PASS.
  - T2 on the VM, dump 72387188 (`/var/lib/grindless/dumps/latest`): reachability PASS for all 15 tiers, obtain PASS, capacity lint 0 known violations and 1 warning (UHV's ZBLAN mixer row).
  - Earlier T1, still current: `gg_test_maxplus_loom`, `gg_test_maxplus_assembler`, `gg_test_maxplus_slingshot` PASS.
- **In flight** (one nested session per package; no two share a file):

| Package | Issue | Content | Phase |
|---|---|---|---|
| XP-H2 | #143 | MAX+ crystals: the multi-plasma blender and the horizon crystal furnace, T8 to T10 | 7 |
| XP-K | #144 | MAX+ creative cores K1 to K4 (the six creative-item rows move to XP-H4, with the hyper assembly array) | 7 |
| XP-W2 | #145 | Wireless MAX+ hatches (1,024 A and 4,096 A) and an exact network store above 2^53; serial on `lib/**` | 7 |
| EN-1 | #146 | English only: every `es_es` text and check removed, and a guard that keeps Spanish out | 8 |
| XP-V1b | #147 | The horizon interferometer's two missing MAX casing textures and the MAX foundation generator's self-check | 6 |

- **Next** (queue; serial where packages share files):
  - Phase 7, `maxplus.md` *Build order*:
    - XP-H4 (the grid layer, the hyper assembly array and the six creative-item rows; after XP-H2 and XP-K);
    - the horizon capacitor bank (machine 15; after XP-W2 and XP-H4);
    - XP-G1 (the Hyperstargate and its dial; after the bank);
    - XP-Z1, XP-C1 (the `maxplus` era in the era lists, its validator tier, and tier 15's circuits, hull and voltage on the quality ladder), XP-PL, XP-C2a and XP-C2b.

    Each merge takes its ids out of the class C row.
  - Phase 6: XP-V2, the MAX+ controller faces, once the last MAX+ machine has landed; XP-Z1's city structures.
  - Then Phase 8 and Phase 9.
- **Workstation rule** (owner, 2026-11-01): the workstation only edits; T0 runs in GitHub Actions on every push or on the VM, and the analysis suite, cost solves, dump-based tools and Minecraft run on the VM (`tools/vm/gg-vm-exec.sh`, `docs/testing/usage.md`). Up to 10 nested sessions at once (AGENTS.md:42); the workstation holds about 6 with headroom. Package sessions use the default agent: the `implementer` agent has no cross-session messaging, so its handoffs never reach the orchestrator.
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration.

## Open questions for the owner (the defaults stand until answered)
- **Hand recipes:** remove the crafting-table recipes of the core components from MV up? A 3x3 grid cannot scale, so they bypass the curve. Default: yes (done for MV to UV; the MV and HV hulls stay as the bootstrap).
- **Art:** commission the genuine-art list (`06_assets_audit.md` section 8), or use generators only? Default: generators only.
- **Era style:** does the OpV and MAX look of RF-6D (brighter, more saturated, speckled) work? Default: yes; RF-6D-b extended it to UV to UXV.
- **MAX** (`max.md` open questions 1, 12, 13): accept 14 / 57 / 204, 12 horizon locks, and c3 gated on all four new machines? Default: yes.
- **MAX+** (`maxplus.md` open questions 1-8): one era in three stages; 58 lines plus a second pass after stage I; x5 per stage; creative items never placeable; one-way gate with a repeatable dial; `horizon_city`; the archive crosses with the player; the ending text. Defaults as written. Question 6 (the 19,200 t fallback) is closed: XP-D1 retired it.
- **EV to ZPM line design** (RF-3S, `docs/eras/ev.md`): only production lines count toward the guide; keep GTM's one-step nitric folds; gate tetrataenite; keep belt Ir/Os (P2-C: not worse than Mercury); gate the tritium store; ZPM's gap stays named. Defaults as written.
- **Logs at Steam and LV** (LD-T3): the Horizon Collector makes 960 oak logs a minute at 16 EU/t; the fertilized LV greenhouse makes 72. Keep the collector as the generous start, or cut its log row so the greenhouse is LV's log route? Default: keep (the start is generous by design, `steam.md`); the greenhouse line counts for its other outputs.
- **Phase 5** (`05_quest_design.md` §6, nine questions): era chapter groups; MAX+ in nine chapters; six roles, not six chapters; longer text for teaching quests; restore the merged wafer and circuit steps; Power after LuV optional; item rewards only from gated lines; Welcome's bread; before captures per batch. Defaults: yes to each, as written.
- **Phase 5 shape:** the before and after renders of every era (Steam to MAX; `tools/quests/render-book.mjs --compare` against the pre-Reforge book) wait for the owner's review. They do not block: the owner asked for autonomous work.
- **OpV and MAX components** (P2-E): the OpV rule of 2026-10-29 (`opv.md` *Validator*) forbade lower components; P2-E's band E lets each core component take its previous-tier counterpart, as UXV's take UIV's, because the OpV core cost 310 against 71,526. Keep it? Default: yes (AGENTS.md principle 2 wins over pre-Reforge docs; machines, hatches and controllers keep the rule whole).
- **Save compatibility after v1.0.0?** Default: yes, from v1.0.0 on.

## Open blockers and known issues
- **Cost:**
  - LuV (0.912) and UIV (0.907) sit near the lower edge of the 10% band; changing one era's factor means re-solving every era above it. The OpV and UXV hulls are outliers (9 to 25 times their peers), explained in `02_cost_curve.md`, not fixed.
  - Some routes multiply matter: ash separation fed by diamond CVD and diamond electrolysis, and blue topaz ore at ZPM and later (`02_cost_curve.md`).
- **Capacity:** no known violation (`tools/analysis/capacity_known.json` is empty since CAP-K); one warning: UHV's ZBLAN mixer row takes 73,250 mB of fluorine, more than a singleblock mixer holds (the large mixer runs it). The lint does not count programmed circuits, so it cannot see a circuit on a multiblock with no item input.
- **EMI:** 9 entries in `tools/analysis/emi_runtime_known.json`:
  - 8 previews, likely an audit false positive that the fixed fixture removes on the next 8 GB EMI run;
  - `launched_belt_seed` without a consumer (a MAX package).
- **The `maxplus` stage** is a world persistentData flag (`grindless_stage_maxplus`, MX-E1): the pack has no stage mod, and MAX+ packages read the flag.
- **MAX+ until XP-C1:** the ids with no recipe yet are one class C row in `tools/analysis/tiers/obtain.json` (hidden; 65 entries left) and carry EMI exception rows; the `maxplus` era is not yet in the era lists. Each MAX+ controller carries three baselined quality findings (T-CIRC, T-HULL, T-VOLT at tier 15) until XP-C1 decides tier 15's circuits, hull and voltage.
- **MAX+ outputs without a destination yet:** P12's `p_process_plasma` (XP-H2's blender takes it) and XP-B1's `electronic_grade_silicon` (XP-K is asked to use it as a K4 wafer substrate).
- **Assets:**
  - MAX+ items and casings have textures (XP-V1); the MAX+ controllers wear MAX art until XP-V2;
  - two MAX casings have no texture (`test_mass_enclosure_casing`, `laser_link_casing`: the missing-texture cube) and `Build-MaxFoundationTextures.ps1` fails its self-check (XP-V1b);
  - the UEV, UIV and UXV foundation scripts still draw items that `foundation.js` no longer registers, so their self-check fails (Phase 8);
  - textures of removed items are orphans (Phase 8);
  - sound loop-seam and harsh flags need an in-game listen at release.
- **Test environment:**
  - GCYR's configured low gravity is not applied in game (menu only); the design no longer claims it.
  - A same-save reopen in the headless test client deadlocks on our fixture's synchronous Rhino callback (not a persistence defect).
  - The 4 GB test client is tight with EMI plus world generation; leave spark out of copied clients in EMI stages. The EMI audit needs an 8 GB client alone on the VM.
  - A batch dump for the validator comes from a minimal overlay (`gg_dump.js` only): the full test overlay adds probe recipes, the lava probe among them, that fail the `auto` checks. `--table` must target the existing hidden table so that its `removeRecipes` are kept. Commit a fresh pack index before any VM dump (the VM runs skip the refresh).
  - The bench waits at most 180 s for a marker: a T1 of a longer recipe skips to its end with `setProgress(duration - 20)` once the first output is measured.
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