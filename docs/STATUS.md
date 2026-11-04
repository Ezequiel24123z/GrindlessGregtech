# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v1.5.1 (`docs/releases/v1.5.1.md`: EMI shows every recipe again on dedicated servers, and the quest chapters follow the tier order; tag `v1.5.1` is `main`, `releases` and `playable`; GitHub releases with the pinned Prism zips). It keeps v1.5.0's world. The owner's play server (`docs/testing/vm.md`, `/srv/grindless-play`, port 25525) runs it; a test client joined it and passed the EMI audit (acquisition 2,830/2,830, use 2,372/2,372). v1.0.0 and v1.5.0 need a new world (v1.5.0 reshapes 157 structures, merges eight controllers into others and changes recipes throughout); v1.0.1 to v1.4.1 kept it (a Mirror Shell built before v1.2.0 needed its window-ring coils swapped; v1.3.0 emptied the wireless store and the gate records; in v1.4.0 and v1.4.1 machines set up for a changed recipe needed its new inputs). The player channel is `releases` (release `releases-channel`, `Gregtech-Grindless-releases.zip`, refreshed every release); `playable` is mirrored to it during the transition.
- **Integration branch:** `ezequiel24123z-project-reforge`. Every package branches from it and is merged back with `--no-ff` by the integrator; `main` follows the released tags; documentation-only commits may move it ahead, and its `pack/` always equals the latest release.
- **Current milestone:** the long-lines program (AGENTS.md principle 7) is implemented from Steam to MAX+: band D1 (Steam to HV, `docs/eras/lines-steam-hv.md`) shipped in v1.4.0; bands D2 (EV to ZPM), D3 (UV and UHV), D4 (UEV to UXV) and D5 (OpV to MAX+), with the multiblock scale and the era casing families (principle 4, `docs/quality/structures.md`), shipped in v1.5.0. Project Reforge (v0.17.0 to v1.0.0, DECISIONS.md:695) is done. Next: the owner's playthrough of v1.5.1.
- **Done:**
  - Project Reforge, phases 0 to 9: the rules; the cost tooling and the era-aware cost curve (every era from MV to MAX within 10% of its target, `docs/reforge/02_cost_curve.md`); the line audit and every era's chart; the research; the quest book (one chapter per era with sections since v1.1.0, plus the Processing Lines and Multiblocks chapters); assets and sounds; MAX and MAX+ with the Hyperstargate (`docs/eras/max.md`, `maxplus.md`); the cleanup (`docs/reforge/08_cleanup.md`); the release.
  - v1.0.1 to v1.3.0 (batches 10 to 13): the owner's feedback and his answers to the mega audit (#230): the MIT licence, the Hyperstargate at about 15.8k horizon plates, one wireless network and one dial per FTB team, and the polarized fusion stellarator (machine 18, line P26).
  - v1.4.0 (batch 14): band D1, the long lines from Steam to HV on real processes (#243 to #253, #258, #259, #273), the strict allowlist, relay platforms by the traveller's team, the UEV quest dependencies, live composers, and the first half of the second global audit with its fixes (#260 to #272). DECISIONS.md holds its records (2026-11-02 and 2026-11-03).
  - v1.5.0 (batch 16): bands D2 to D5 (#305 to #406, about a hundred packages): real-process lines from EV to MAX+, every structure sized by its use and era, a casing family per era from UEV up held to the era before (bootstrap), eight controllers merged into others, every chart and era chapter redrawn to teach them, and the third audit (ending, overflow, recipes, tools, factory-load baselines, rate cards). DECISIONS.md holds its records (2026-11-03, *Batch 16*).
  - v1.5.1 (2026-11-04): GTM Extended Features' disassembler logic aborted GTM's whole EMI plugin on clients joined to a dedicated server; a startup script removes it (DECISIONS.md, 2026-11-04) and the bench checks it. Also the chapter tier order, the EMI baseline refresh (#408), deterministic promotion T0 (#409), the two branch rulesets (#410, `docs/testing/ci.md`) and the #284 line-audit tool and LV-UHV charts (#413, #415).
  - Capacity: six known violations, all MAX+ chemical-bath rows with a circuit (`tools/analysis/capacity_known.json`), and one warning. English only (EN-1): T0's english-only guard keeps it so.
- **Last accepted integration batch:** batch 16, Project Reforge's long lines from EV to MAX+ (bands D2 to D5), released as v1.5.0. The owner asked on 2026-11-03 to fix everything except publishing on CurseForge, and to scale the multiblocks.
  - Design passes D2 (#288), D3 (#289), D4 (#290) and D5 (#291), then about a hundred packages (#305 to #406):
    - real-process lines from EV to MAX+;
    - structures sized by use and era;
    - a casing family for every era from UEV up, held to the era before;
    - eight controllers merged into others;
    - every chart and era chapter redrawn to teach them;
    - the third audit (#305, #306, #313, #326, #353, #360);
    - the native fixtures after the reshape (#399, #401 to #404, #406).
  - Integrator:
    - bootstrap fixes: the Superheavy Factory's controller, the mu-metal shield casing, the pasta containment casing;
    - machine@variant keys in the tier configs (`tier-machine-keys.test.mjs`);
    - the pl_opv and pl_maxplus chart links;
    - the cost curve's assembly-line stack split: no line asks for more than a stack per bus;
    - the Starchip Fab's note;
    - the Multiblocks chapter's Unlocks lists without recycling rows;
    - the bench's in-use checkout lock;
    - #230, #306 and #311 closed.
  - T0: green on every merge; the integration head 998396e88 (41708107449); the release commit b3ca394a3 (41722982484) and the tag (41723532478).
  - T2 on the VM: batch dump 84c44332278e (vm-20261103-191922-84c44332-1026943; post-dump exec-20261103-193631-1035523):
    - reachability PASS for all 16 tiers (MAX+ 1,112 of 1,112), the obtain pass, EMI 0 gaps;
    - 300 structures with 0 new violations, cycles 0, cost gate 0, no assembly-line input over 64;
    - charts: 4,315 arrows and 221 figures, 0 failing; strict book lint 0/0;
    - line audit: 258 keep, 26 fix, 1 merge (#284).
  - Native fixtures, strict:
    - A, quests, hidden and Steam (vm-20261103-201330-998396e8-1072091);
    - B, the observatory, and E, propellants, syngas, relay and wireless teams (vm-20261103-181940-5933e779-1004470);
    - C, the platinum plant, mega chemical complex and naquadah plant (-201529-998396e8-1072533);
    - D, the hot cell (-201829-998396e8-1073177);
    - F, the forming sweep, 300 of 300 (vm-20261103-183521-1efd55e3-1010833);
    - the fixture packages' runs at their heads (run ids in their merge commits);
    - the bulge relay across its restart (vm-20261103-202440-c0ab2ff9-1074723);
    - the era wireless fixtures (vm-20261103-202529-b017f169-1075183, -203319-d1192abe-1077474, -203641-7742c36b-1078107);
    - the endgame factory load (#399): mean 2.7 ms a tick, max 21 ms, none over 50 ms.
  - T3 on the release candidate c41635d9 (no runtime changes after): the quest book with the EMI audit (vm-20261103-212838-c41635d9-1083072) and the MAX+ ending (vm-20261103-212124-c41635d9-1082141).
- **In flight:** #414 LA-CHART-MAX-UXV (MAX feeder joins, Penrose inputs, X2 takes X1's MTJ die). After it lands, the integrator regenerates `docs/reforge/data/03_lines.csv` and the processing-line chapters once; not before, or the #284 hand-set verdicts revert.
- **Next:** the owner's playthrough of v1.5.1; #284's MAX destination rows 47, 48, 55 and 57, still unaudited; the owner's open question whether EV lunar titanium stays a 3-step keepShort resource head or gains the real FFC steps; a permanent bench audit with a client joined to a dedicated server; the GTM empty-input warnings for `gtceu:reactive_gas_cont_cas` and `gtceu:inert_filtration_casing` (pre-existing since at least 2026-11-03). Publishing on CurseForge waits for the owner (#231).
- **Workstation rule** (owner, 2026-11-01): the workstation only edits; T0 runs in GitHub Actions on every push or on the VM, and the analysis suite, cost solves, dump-based tools and Minecraft run on the VM (`tools/vm/gg-vm-exec.sh`, `docs/testing/usage.md`). Up to 10 nested sessions at once (AGENTS.md:42); the workstation holds about 6 with headroom. Package sessions that must report back use the default agent: the `implementer` agent has no cross-session messaging, so its handoff is only its task_complete summary in the session's `events.jsonl`.
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration. On 2026-11-02 the Copilot co-author lines were removed from the whole history, so every older hash changed: documentation references follow, dump and run names keep the old hashes.

## Owner questions (closed: the owner delegated every decision on 2026-11-03)
The owner asked the integrator to take the decisions that best fit the pack (DECISIONS.md, 2026-11-03, *Owner delegation*). Every default below stands as a decision, not a pending question.
- **The mega audit's decisions** (#230), answered by the owner on 2026-11-02: MIT licence; worlds may break when needed; no casing chain; the Hyperstargate's plates to about 10x; a denser MAX+ plant; per-team multiplayer (all built in batch 13); the minor items were not answered, so their defaults stand. Principle 7 answered the same day: depth first in every tier (AGENTS.md principle 7, DECISIONS.md).
- **Recycling** (#237): answered (owner, 2026-11-02): accepted as GTM computes it; no Java mod. Our tools keep treating recycling as noise.
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
- **Save compatibility after v1.0.0?** Answered (owner, 2026-11-02): no guarantee. A release may break worlds when a change needs it, and its notes say so.

## Open blockers and known issues
- **Cost:**
  - LuV (0.912) and UIV (0.907) sit near the lower edge of the 10% band; changing one era's factor means re-solving every era above it. The OpV and UXV hulls are outliers (9 to 25 times their peers), explained in `02_cost_curve.md`, not fixed.
  - Some routes multiply matter: ash separation fed by diamond CVD and diamond electrolysis, and blue topaz ore at ZPM and later (`02_cost_curve.md`).
  - Seven steps climb less than x1.3 at the x8 cap (machine casing HV and UV; hull MV, HV, EV and UV; 1 A hatch HV). The owner accepted them as they are (2026-11-02, no casing chain); the gate accepts them by name (B13-AN).
- **Recycling:** GTM 7.5.3 resolves crafted items' material info in hash order (ItemMaterialData.java:57, :175-214), so about 215 recycling rows differ in value between boots (41 cost-curve key rows over 23 items); KubeJS cannot reach it before it runs. Accepted by the owner (#237); the cost and line tools skip recycling rows.
- **Active blocks:** GTM 7.5.3 relights a working multiblock's active blocks one nested structure check per block when it breaks; keep them in the low hundreds per structure (the largest left is 264, the annihilation engine; a T0 check holds that ceiling, B13-AN).
- **Capacity:** six known violations (`tools/analysis/capacity_known.json`: MAX+ chemical-bath rows that take one item and a programmed circuit against the type's single item slot; they may only shrink); one warning: the UEV machine casing's assembler row takes 41,111 mB of helium plasma (D2-COSTBASE's keyFactor), more than a singleblock's 16,000 mB tank; GTM's large assembler and our assembly halls run it. The ZBLAN mixer warning left with D2-ZBLAN. The lint does not count programmed circuits, so it cannot see a circuit on a multiblock with no item input.
- **EMI:** 8 entries in `tools/analysis/emi_runtime_known.json`:
  - 8 previews, likely an audit false positive that the fixed fixture removes on the next 8 GB EMI run.
  - The client suite's EMI audit also reported acquisition and machine-info gaps on XP-Z1b's run; P8-H1 added the machine info pages, and P9-T3b reruns the audit.
  - EMI-1's wrapped notes: 8 era texts longer than 190 characters still end in "..." (baselined in its T0 check); the 854 x 480 test window clamps the tallest pages (Warp Gate, Black Hole Bomb), which fit at normal window sizes.
- **The `maxplus` stage** is gated by recipes alone: the shell's c3 makes `grindless:horizon_lock`, the only key to MAX+. The old world flag `grindless_stage_maxplus` was removed in AF-K2 (audit A1b-11, #266).
- **Assets:**
  - MAX+ has its own art (XP-V1, XP-V2), and the Hyperstargate wears its face;
  - 184 of our recipe types play their own loop (`sounds.js` WIRING; SND-1, #176), heard on whichever of the 300 multiblocks runs them; the eight controllers merged in batch 16 kept their loops in the machines that absorbed them. The rest run GTM's own recipe types or are not the signature of their line; loop seam and high-end flags need an in-game listen.
- **Quest generators:** the Processing Lines writer (`processing-lines/pl-gen.mjs`, `run.ps1 -Write`) and `multiblocks/gen.mjs --write` each rewrite only their own `allowIsolated` entries, so they run in either order (batch 16); a controller's Unlocks list skips GTM's recycling rows, whose counts change between boots. T0 lints the whole book with `--strict`: a warning fails it, so a justified exception goes in `lint-config.json` (`allowLayout`, `quantityOk`). Every era chapter (`<era>_age`) sits in the one Progression group that `gen-chapters.mjs` writes into `chapter_groups.snbt` (QB-0). The LuV chapter's counts are recorded for the shipped stations mode (tether) only: after flipping `tables/stations.json`, regenerate and record the stations-off counts in `gg_test_quests.js`.
- **Test environment:**
  - GCYR's configured low gravity is not applied in game (menu only); the design no longer claims it.
  - A same-save reopen in the headless test client deadlocks on our fixture's synchronous Rhino callback (not a persistence defect).
  - The 4 GB test client is tight with EMI plus world generation; leave spark out of copied clients in EMI stages. The EMI audit needs an 8 GB client alone on the VM. The quest book stage runs with the EMI audit's heap (8 GB, one slot; `gg_test_quest_book.js` has the command): every client run includes the mandatory EMI coverage audit, and since batch 14 the audit and the book's screenshots no longer fit the 4 GB test client.
  - A batch dump for the validator comes from a minimal overlay (`gg_dump.js` only): the full test overlay adds probe recipes, the lava probe among them, that fail the `auto` checks. `--table` must target the existing hidden table so that its `removeRecipes` are kept. Commit a fresh pack index before any VM dump (the VM runs skip the refresh).
  - The bench waits at most 180 s for a marker: a T1 of a longer recipe skips to its end with `setProgress(duration - 20)` once the first output is measured.
  - `gg-vm-run.sh` takes `-LockWaitMin` up to 15 (a larger value fails at once); a fixture that times out stops the rest of its run, so a suspect runs alone. Test bands stay 64 wide in X; a structure that outgrew its band widens Z and Y in its own row (batch 16 grew 157 structures).
  - With no player online, the bench's force-loaded chunks never tick entities (a TNT never explodes) and some do not even list their item entities: fixtures prove rituals and drops by direct calls in a chunk that lists them (vm-20261102-140925, -141453).
  - Fixtures that build a wireless tower take turns on `ggTestWirelessQueue`; two that clear the wireless registry never run at once.
  - `GG_STRICT=1` passes on a clean boot: the known harmless ERROR lines are allowlisted one message at a time in `tools/test/log-allowlist.txt` (FIX-ALLOW's 16, then vanilla's POI mismatch and allay lines), and the AE add-ons' conditional-recipe KubeJS warnings no longer count. A new ERROR line fails the run until it is fixed or allowlisted with its reason.
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
- **History:** the git log. The old session notes (`docs/sessions/`) and the AGENTS.md migration map (`docs/migration/`) left the tree on 2026-11-02 and stay in history.
