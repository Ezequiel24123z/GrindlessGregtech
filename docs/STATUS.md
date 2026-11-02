# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v1.1.0 (`docs/releases/v1.1.0.md`: the owner's first feedback round on v1.0.1; tag `v1.1.0` is `main`, `releases` and `playable`; GitHub releases with the pinned Prism zips). v1.0.0 needed a new world; v1.0.1 and v1.1.0 keep it (quest ids unchanged; Productive Bees items vanish). The player channel is `releases` (release `releases-channel`, `Gregtech-Grindless-releases.zip`); `playable` is mirrored to it during the transition.
- **Integration branch:** `ezequiel24123z-project-reforge`. Every package branches from it and is merged back with `--no-ff` by the integrator; `main` follows the released tags.
- **Current milestone:** Project Reforge, done: released as v1.0.0 on 2026-11-01 (DECISIONS.md:695), v0.17.0 to v1.0.0 in ten phases: 0 rules and diagnosis, 1 cost tooling, 2 cost rebalance, 3 era and line audit, 4 research, 5 quests, 6 assets and sounds, 7 MAX+ and the Hyperstargate, 8 cleanup, 9 release. No save compatibility (DECISIONS.md:701): v1.0.0 needs a new world.
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
    - Since v1.1.0 (QB-0 to QB-5) every era is one chapter with sections; the line below is the Phase 5 shape it replaced.
    - Welcome, the side tabs and every era from Steam to MAX in the Phase 5 shape: EV, IV and LuV in three chapters each (age, circuits, machines), ZPM to OpV in four (plus integration), MAX in five (plus `max_horizon`, the capstone), MAX+ in eight (three stages, circuits, machines, integration, creative items and the capstone *Building the Gate*, into which the tree folds; the arrival in `grindless:horizon_city` is the book's last quest); chapter groups per era (Early Ages for Steam to HV, then one per era). Left: the optional Power bands after LuV (RF-5P).
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
    - MAX+ build order rows 18 to 21 and 23 (first half) (batch 12): the crystals (XP-H2, machines 12 and 13), the creative cores (XP-K), the grid layer (XP-H4a: machine 16, the Hyperstargate's parts and the six creative stand-ins; XP-H4b: lines P19, T11 to T13 and T17), the exact wireless store and the MAX+ wireless hatches (XP-W2), the horizon capacitor bank (XP-H5, machine 15), the final dimension with its city and sky (XP-Z1a), and the MAX+ art (XP-V2: every MAX+ controller face, the gate's parts and the stand-ins). Every MAX+ machine but the Hyperstargate exists.
    - MAX+ build order rows 22 to 25 (batch 13): the Hyperstargate (XP-G1: machine 17, its dial and the open ring), the crossing and the arrival (XP-Z1b: the credits, the title and the epilogue book), the validator and tier 15 (XP-C1), the chart `pl_maxplus` (XP-PL) and the quests (XP-C2a to XP-C2c). Phase 7 is done.
  - Capacity: no known violation left (CAP-K).
  - English only (EN-1): no `es_es` anywhere under `pack/kubejs`; T0's english-only guard keeps it so.
  - Phase 9 so far: the release candidate passes T0 to T3 (batch 16); docs/releases/v1.0.0.md and the README are written.
  - Phase 8: the triage (`docs/reforge/08_cleanup.md`, P8-T) and P8-A to P8-H2 fixed the census and audit false positives, the old-save leftovers, GT--'s component assembly line, the orphan textures and their generators, the trivial steps and the culture seed's gain, the wrong-era quest and byproduct, the era docs' old rules, the MAX+ leftovers (machine info pages, a truthful process baseline) and the gate parts' quality. On the final dump nothing is open (`08_cleanup.md` section 11).
- **Last accepted integration batch:** the feedback batch of 2026-11-02 (issues #177 to #195), released as v1.1.0.
  - Packages:
    - QB-0 (the tools: one chapter per era, sections, the connectivity lint), QB-1 to QB-5: every era is one chapter, all quests connected;
    - SITE-A to SITE-E: dimension conditions only where the place is used (AGENTS.md principle 10), circuits by tier tag (principle 11);
    - PR-1: GTM's own prospector and map GUI; EMI-1: dimension markers, wrapped notes, the needs-air line; WL-1: the wireless network runs at its strongest cell;
    - BEE-1: Productive Bees removed; NANO-1 and NANO-1b: creative flight for the NanoMuscle and QuarkTech chestplates (proven in game);
    - VIZ-1: the cost tree and the Hyperstargate page; AUD-1: the Scanner page that shows a Nanoprocessor is GTM's display (no bad recipe).
  - Integrator fixes:
    - the Horizon Shard is a catalyst in two creative-core rows (the gate was unbuildable); the warp gate's held mainframes take tier tags;
    - tier site checks follow the opened rows (ev, uiv, uxv, max); the process audit counts generator recipes as power steps; three opened 1:1 steps got real second inputs and the crucible liner's lathe gives swarf;
    - lint role `era` (120 words) and `allowLayout`; the Power tab and the fixtures follow the merged chapters; the LuV covers and lunar seed fixtures follow WL-1 and SITE-A; the titanium and tungsten ore forms are hidden;
    - EMI's info boxes fit on the client's recipe sync (`RecipesUpdatedEvent`), before EMI builds its pages, instead of EMI-1's second EMI reload, which failed the client EMI audit on a null level; the AE2 fixture waits for the Earth network to boot.
  - T0: GitHub Actions green on the batch tip.
  - T2 on the VM (dumps e5e05227 and 613fbaa7): reachability PASS for all 16 tiers; the process audit has no new finding; the hide table hides what it must; capacity 0 known violations; charts 3,807 arrows, 0 failing; book lint 0/0. `gg_test_quests`, `gg_test_hidden`, `gg_test_maxplus_hyperstargate`, `gg_test_moon` and `gg_test_sealed_dome` PASS; `gg_test_wireless_energy` passes its new strongest-cell phase; `gg_test_luv_a4` LUV_COVERS PASS.
  - T3 on the VM's client: the client suite with the EMI audit PASS (vm-20261102-064729-613fbaa7-2947674); quest book 26/26 with 19 screenshots; suit flight 20/20; starter equipment 60/60.
  - Stale fixture checks that already failed on v1.0.1 (measured on 9e6e2622): `wireless_energy|recipes`, `luv_a4|mw_recipes`, `regolith_cell|recipes` and `|crafting`, `venus|controllers` and `|engine_recipe`.
- **In flight:** none.

- **Next:** the mega audit the owner asked for after this batch (best models, unsparing: progression, recipes and balance, multiblocks, quests, power, EMI and texts, code and performance, tools and tests, docs, licences), then its fixes. Waiting on the owner: the Hyperstargate's balance against the 10x GTNH target (the cost page: plates 6.33M against 15.7k, containment 59k against 6k, Kerr condensate 174G mB against 20G).
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
- **EMI:** 8 entries in `tools/analysis/emi_runtime_known.json`:
  - 8 previews, likely an audit false positive that the fixed fixture removes on the next 8 GB EMI run.
  - The client suite's EMI audit also reported acquisition and machine-info gaps on XP-Z1b's run; P8-H1 added the machine info pages, and P9-T3b reruns the audit.
  - EMI-1's wrapped notes: 8 era texts longer than 190 characters still end in "..." (baselined in its T0 check); the 854 x 480 test window clamps the tallest pages (Warp Gate, Black Hole Bomb), which fit at normal window sizes.
- **The `maxplus` stage** is a world persistentData flag (`grindless_stage_maxplus`, MX-E1): the pack has no stage mod, and MAX+ packages read the flag.
- **Assets:**
  - MAX+ has its own art (XP-V1, XP-V2), and the Hyperstargate wears its face;
  - 185 of our 310 multiblocks play their own loop (SND-1, #176); the rest run GTM's own recipe types or are not the signature of their line; loop seam and high-end flags need an in-game listen.
- **Quest generators:** run the Processing Lines writer (`processing-lines/run.ps1 -Write`) before `multiblocks/gen.mjs --write`, because the first rewrites `allowIsolated`. Every era chapter (`<era>_age`) sits in the one Progression group that `gen-chapters.mjs` writes into `chapter_groups.snbt` (QB-0). The LuV chapter's counts are recorded for the shipped stations mode (tether) only: after flipping `tables/stations.json`, regenerate and record the stations-off counts in `gg_test_quests.js`.
- **Test environment:**
  - GCYR's configured low gravity is not applied in game (menu only); the design no longer claims it.
  - A same-save reopen in the headless test client deadlocks on our fixture's synchronous Rhino callback (not a persistence defect).
  - The 4 GB test client is tight with EMI plus world generation; leave spark out of copied clients in EMI stages. The EMI audit needs an 8 GB client alone on the VM.
  - A batch dump for the validator comes from a minimal overlay (`gg_dump.js` only): the full test overlay adds probe recipes, the lava probe among them, that fail the `auto` checks. `--table` must target the existing hidden table so that its `removeRecipes` are kept. Commit a fresh pack index before any VM dump (the VM runs skip the refresh).
  - The bench waits at most 180 s for a marker: a T1 of a longer recipe skips to its end with `setProgress(duration - 20)` once the first output is measured.
  - On the VM, `uiv-compression_hall` fails its "lib/mega.js untouched" check (the VM compares against an older commit); it passes in Actions.
- **Mirror:** `playable` mirrors `releases` until old instances switch their Prism pre-launch URL to `/releases/`; then retire it.

## Where details live (read one section, not the file)
- **Reforge:** `docs/reforge/`:
  - 00 diagnosis;
  - 01 cost matrix;
  - 02 cost curve;
  - 03 line audit, chart passes and formed review;
  - 06 assets audit;
  - 08 cleanup triage.

  Package contracts are the GitHub issues labelled `work-package`.
- **Era design:** `docs/eras/<era>.md`, with MAX+ in `docs/eras/maxplus.md`; the journey in `docs/journey.md`. Complexity targets: `docs/research/complexity.md`.
- **Decisions:** `DECISIONS.md` (`git grep -n "<topic>" DECISIONS.md`; Reforge from :695). Credits: `CREDITS.md`.
- **Quests:** `docs/quests.md`; quest research in `docs/research/quest-books.md`.
- **Tools:**
  - the validator: `tools/analysis/README.md`;
  - the bench and the VM: `tools/test/README.md`, `docs/testing/` (`usage.md` for `gg-vm-exec.sh`);
  - textures and sounds: `tools/assets/README.md`.
- **History** (not read by default): `docs/sessions/`, `docs/migration/`.
