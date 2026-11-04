# RF-3C: Line audit, Steam to OpV

Read-only audit of every process line in the quest chart (`tools/quests/processing-lines/pl-data-*.mjs`, one cluster = one line), measured against the `v0.17.0-max` dump. Reproduce with:

`node tools/analysis/line-audit.mjs --dump <dump> --out docs/reforge/data` (writes `03_lines.csv`; about 3 s).

No pack content changed. MAX rows (8 lines, 5 to 7 steps) are data only: RF-7A decides.

## Method

- **Steps:** the longest chain of machine steps (machine or `ours` node, or an item crafted straight from items). Machine outputs add no step. A *real* line has at least 4 (AGENTS.md:18).
- **Reuse:** chart crossings are link nodes into another era's chapter. Content crossings (RF-3H) are measured from the dump: an older multiblock (2+ eras back) that a recipe of the line runs on, or an end product of an earlier chart line that it consumes. Era of a multiblock or dimension = first era whose startup scripts name it; era of a recipe = max of its voltage tier, dimension and multiblock. `reach_back` is the largest era distance of either kind.
- **Destination:** consumers of each end product in the dump (recycling, decomposition and repacking recipes ignored). Travel keys (`grindless:*_key`) are consumed by use and count as having a sink.
- **Skip route:** a recipe, usable at or below the line's era (RF-3H), outside the line, not of a type the line owns, producing the end product with fewer steps from base than the line, from obtainable non-same-material inputs. It is a lower-bound depth heuristic, not a price comparison, so it can only produce `fix`, never `remove`.
- **Duplicate:** at least 4 shared intermediates covering 75% of the smaller line (or the same products and at least 2 shared).
- **Verdicts:** `keep`, `fix`, `merge`, `remove`; rules in `judge()`. Short-line and isolation rules apply from EV on, the reach-back rule from LuV on. Once #413 lands, keepShort exempts a short line at any era.
- **Roles (LD-T1):** implements the line rule of `docs/eras/ev.md:481-500`. A declared `role` (power, resource, infrastructure, research, travel) is tested against the dump and, if it holds, the line is not judged as production; a failed role is judged as production with the failure in the reason. `line` joins clusters of one chapter into one line, `extends` (3 steps or fewer) makes a branch end that needs a consumer, `keepShort` lets a short production line stay with its reason listed, and a short line of ours that replaces a stock chain is a fold. The skip route also drops ores with no vein, same-material loops, parallel sources of earlier lines and fold chains. The role, fold and resource tests are approximations; the audit prints each failed role. **LD-T2:** the role tests follow RF-3S's intent: infrastructure follows consumers up to three hops to a machine, structure, casing or suit part, and a machine or structure block placed in the world needs no consumer; research and travel accept consumption as a material when the recipe's output is a research item, a travel part or a site machine; resource also accepts site fluids, air and consumable capture gear beside wear parts, and still needs an end product that feeds a line. Recycling, packing and decomposition are never uses.

Limits: the chart covers chart lines, not every multiblock; the cost matrix lists key items only; skippability ignores recipe cost. Verdicts are leads for the packages below, to be confirmed against `docs/eras/<era>.md`.

## Current state (#284 design pass, 2026-11-04)

The batch 16 regeneration against dump `84c44332278e` (`data/03_lines.csv`, 285 rows) gave 258 keep, 26 fix, 1 merge and 0 remove. A cluster gives one row per end product, and `line` joins clusters into one line. For comparison, batch 3 had 190 keep and 157 fix out of 395 rows.

The #284 design pass checked every one of the 27 non-keep rows against the scripts and that dump. It needs no recipe change:
- 26 rows are reclassified `keep`.
- The UXV X2 merge stands.
- The CSV now reads 284 keep, 0 fix, 1 merge and 0 remove.

These 27 verdicts are set by hand in `data/03_lines.csv`, each with its evidence in the reason column, until the three packages below land:
- #413 changes the audit tool;
- #414 and #415 change only the charts.

**Do not regenerate the CSV before then**: a regeneration reverts the 26 hand-set verdicts. After the packages, the integrator regenerates it once, and some of the 27 rows leave the CSV. A row can leave because it folds into its trunk, because it is a feeder that is now consumed, or because it is now drawn as a `by` or `ret` node.

Rows, Lines, Real and Longest below are the batch 16 figures.

| Era | Rows | Lines | Real (4+) | Longest | Keep | Fix | Merge |
|---|---|---|---|---|---|---|---|
| steam | 4 | 4 | 3 | 6 | 4 | 0 | 0 |
| lv | 10 | 9 | 4 | 10 | 10 | 0 | 0 |
| mv | 11 | 7 | 6 | 10 | 11 | 0 | 0 |
| hv | 14 | 7 | 8 | 20 | 14 | 0 | 0 |
| ev | 20 | 8 | 16 | 24 | 20 | 0 | 0 |
| iv | 15 | 9 | 9 | 12 | 15 | 0 | 0 |
| luv | 32 | 13 | 12 | 13 | 32 | 0 | 0 |
| zpm | 25 | 11 | 8 | 24 | 25 | 0 | 0 |
| uv | 12 | 6 | 11 | 18 | 12 | 0 | 0 |
| uhv | 14 | 10 | 12 | 23 | 14 | 0 | 0 |
| uev | 13 | 11 | 10 | 19 | 13 | 0 | 0 |
| uiv | 29 | 10 | 27 | 11 | 29 | 0 | 0 |
| uxv | 22 | 10 | 19 | 27 | 21 | 0 | 1 |
| opv | 21 | 9 | 21 | 23 | 21 | 0 | 0 |
| max | 32 | 21 | 22 | 33 | 32 | 0 | 0 |
| maxplus | 11 | 11 | 11 | 39 | 11 | 0 | 0 |

### #284 decisions

Dump facts below are from `84c44332278e`.

| Rows | Was | Decision and evidence | Package |
|---|---|---|---|
| UIV I2 L9, I9 L39 | fix (isolated) | **Split artefact.** The numbered split (`line-audit.mjs:77-82`) groups nodes by row number only and drops links another node consumes (`:80`). With L9's links x9_cav and x9_cf (`pl-data-uiv.mjs:247-248`) and L39's link x39_cc (`:500`), L9 crosses UHV and L39 crosses LuV. | #413 |
| UIV I2 L32, I9 L23; UXV X6 L39, X7 L49 | fix (short) | **Spurs and continuations.** Each row continues or branches from a trunk in another row, which the split ignores. Counted with its ancestors, each is 4 or 5 steps. | #413 |
| UXV X5 L31 | fix (short) | **Not a row.** It heads the L30 trunk (`pl-data-uxv.mjs:447-448`), so it is part of L30. | #413 |
| UXV X2 L6 | merge | **Merge confirmed.** L6 repeats X1's MTJ chain, and `grindless:mtj_die` has one producer. X2 takes the die as one raw node sourced from X1; a link may not target its own chapter (`pl-model.mjs:133`). X2 L18 keeps 4 steps and its content reach. | #414 |
| MAX M3 sapphire_web_wafer, stabilised_npro_laser; M4 sn_li_eutectic, droplet_nozzle_plate, iridium_target; M5 degenerate_sr_cartridge, atom_optics_modulator, fe16n2_ring_magnet; M8 rydberg_laser_die | fix (short) | **Feeders, not line ends.** In the dump, each is an input of another row's recipe in the same cluster; the chart lacks the join. The joins are listed below. | #414 |
| MAX Penrose payload | fix (short) | **Chart omission.** max_penrose_payload also takes turned_payload_core and payload_casing (row 24, indexes 5 and 8), which makes the line 4 steps. | #414 |
| LV fertilizer | fix (bypass) | **Not a line** (2 steps; AGENTS.md principle 7). Fertilizer only boosts the stock greenhouse, and LV costs are only reviewed (principle 2). keepShort currently works only from EV on (`line-audit.mjs:621,636`). | #413, #415 |
| MV silicon (ILC chip) | fix (bypass) | **False positive.** The cutter's cut_ilc recipes from ilc_wafer are ilc_chip's only producers, so the "bypass" is the line's own last step. The node lacks its `by`. | #415 |
| EV lunar titanium | fix (short) | **Resource head**, 3 steps: tripod drill, ore plant, regolith cell. Kroll (`pl_hv:kroll`) is the counted titanium line. Gets keepShort. Open question below. | #415 |
| EV nano circuits | fix (isolated) | **Chart omission.** cpu_wafer is made by engrave_cpu_silicon from the MV silicon wafer. The epoxy board comes from the HV epoxy: solidify_epoxy_to_plate, then epoxy_board, then advanced_circuit_board_iron3. Both are drawn as raw. | #415 |
| LuV Mond iridium, osmium | fix (short) | **By-products** of platinum plant mode 4 (principle 3), like the sludge node beside them (`pl-data-luv.mjs:133`). They end in the IV iridium line. | #415 |
| UV superfluid helium | fix (bypass) | **Fusion ash.** The helium comes out of D-He3 laser fusion, a power plant. The other helium node (`pl-data-uv.mjs:142`) is already `by`. | #415 |
| UV spent laser module | fix (reach) | **Returnable wear part.** Its only consumer is fibre_draw/refurbish, and the sail node already marks it `ret` (`:355`). | #415 |
| UHV betavoltaic cell | fix (reach) | **Reach under-recorded.** nickel_62_target is made only by hot_cell/nickel_62_enrichment (IV), and diamond_diode only from the ZPM cvd_diamond_plate. Both are drawn as raw. | #415 |

MAX joins for #414, in `pl-data-max.mjs` refs (`row.index`):
- lock: `50.3` from `50.16`; `48.9` from `56.5`.
- m4: `15.9` from `15.2`, `15.5` and `15.8`; `42.8` from `42.4`.
- m5: `4.11` from `4.4`, `4.7` and `4.10`; `32.7` from `31.2`.
- m8: `19.8` from `19.2`.
- penrose: `24.9` from `24.5` and `24.8`.

Packages, all for the implementer (Sonnet) with at most 2 repairs:
- **#413 LA-TOOL** (`tools/analysis/line-audit.mjs`, its test and its README section). Numbered rows walk their ancestors and consumed links. A row under 4 steps that another row consumes folds into that row. keepShort applies at every era; the short rule stays EV+.
- **#414 LA-CHART-MAX-UXV** (`pl-data-max.mjs`, `pl-data-uxv.mjs`): the joins above, the Penrose inputs, and X2's raw MTJ die. Depends on #413.
- **#415 LA-CHART-LOWER** (`pl-data-{lv,mv,ev,luv,uv,uhv}.mjs`): the nine lower rows. Its LV fertilizer change depends on #413.

None of these packages changes a recipe or an item.

**Open question (owner, non-blocking):** EV lunar titanium could stay a 3-step resource head with keepShort (this design), or gain the real FFC steps: salt-leaching the cathode sponge, then electron-beam or vacuum-arc melting. The risk of the longer route is that it becomes worse than Kroll, which removes its reason to exist.

**Risks:**
- The numbered-row change makes trunk rows include their feeders, so steps, inner items and Longest change. Cross-cluster duplicate or skip verdicts may also change. Each package lists every verdict change against this CSV, and a new non-keep verdict is an escalation.
- MAX dest rows 47, 48, 55 and 57 remain outside this pass.

## Batch 3 close (2026-11-01, history)

After the chart passes (RF-3K UEV/UIV, RF-3M LuV/ZPM, RF-3N UXV/OpV, RF-3O EV/IV; RF-3L UV/UHV and RF-3D Steam to HV still open), regenerated against the band A dump. Lines are design lines (RF-3G) where the era doc numbers them, chart lines otherwise. Missing = design lines no chart shows (count; then the name heuristic and how many of those the dump has; per-era checks in `03_charts_*.md` found most named ones to be false positives). The tables further down are history.

| Era | Design | Chart | Real (4+) | Missing (count / named / in dump) | Chart crossings | Content crossings | Keep | Fix | Merge | Remove | Guide |
|---|---|---|---|---|---|---|---|---|---|---|---|
| steam | | 8 | 2 | | 0 | 0 | 6 | 2 | 0 | 0 | |
| lv | | 15 | 3 | | 5 | 0 | 11 | 4 | 0 | 0 | |
| mv | | 12 | 5 | | 11 | 0 | 10 | 1 | 1 | 0 | |
| hv | | 16 | 2 | | 8 | 0 | 13 | 3 | 0 | 0 | |
| ev | | 16 | 10 | | 4 | 13 | 10 | 6 | 0 | 0 | 11 |
| iv | | 16 | 5 | | 12 | 12 | 4 | 12 | 0 | 0 | 15 |
| luv | | 38 | 7 | | 34 | 11 | 6 | 31 | 0 | 1 | 20 |
| zpm | 14 | 16 | 1 | 0 / 8 / 2 | 2 | 5 | 1 | 15 | 0 | 0 | 27 |
| uv | 22 | 17 | 3 | 5 / 16 / 10 | 4 | 10 | 3 | 14 | 0 | 0 | 36 |
| uhv | 32 | 27 | 9 | 5 / 23 / 14 | 0 | 10 | 6 | 21 | 0 | 0 | |
| uev | 40 | 35 | 22 | 5 / 23 / 10 | 3 | 11 | 10 | 25 | 0 | 0 | |
| uiv | 46 | 39 | 38 | 7 / 17 / 11 | 0 | 53 | 29 | 10 | 0 | 0 | |
| uxv | 49 | 49 | 45 | 0 / 30 / 16 | 37 | 122 | 44 | 5 | 0 | 0 | |
| opv | 45 | 45 | 37 | 0 / 4 / 3 | 107 | 127 | 37 | 8 | 0 | 0 | |
| max | 46 | 46 | 40 | 0 / 46 / 0 | 0 | 205 | data only | | | | |

The remaining fix verdicts are content problems (short or single-machine chains, bypasses), listed per line with the content files to touch in `03_charts_uev_uiv.md`, `03_charts_luv_zpm.md`, `03_charts_ev_iv.md` and `03_charts_uxv_opv.md`; RF-3S designs the EV to ZPM content packages.

## Per era (guide: AGENTS.md:18)

Verdicts are `keep/fix/merge` after RF-3H, with the RF-3C count in brackets where it changed. Chart = link nodes; content = older multiblocks and products the line's recipes really use (2+ eras back).

| Era | Lines | Real (4+) | Chart | Content | Keep | Fix | Merge | Guide |
|---|---|---|---|---|---|---|---|---|
| steam | 7 | 2 | 0 | 0 | 6 (5) | 1 (2) | 0 | |
| lv | 12 | 3 | 4 | 0 | 8 (5) | 4 (7) | 0 | |
| mv | 9 | 4 | 8 | 0 | 7 | 1 | 1 | |
| hv | 8 | 2 | 5 | 0 | 6 | 2 | 0 | |
| ev | 9 | 3 | 2 | 10 | 3 | 6 | 0 | 11 |
| iv | 10 | 4 | 7 | 11 | 4 | 6 | 0 | 15 |
| luv | 18 | 5 | 16 | 13 | 3 | 15 | 0 | 20 |
| zpm | 6 | 1 | 1 | 6 | 1 (0) | 5 (6) | 0 | 27 |
| uv | 8 | 3 | 4 | 17 | 3 (2) | 5 (6) | 0 | 36 |
| uhv | 9 | 7 | 0 | 11 | 7 (3) | 2 (6) | 0 | |
| uev | 4 | 2 | 0 | 0 | 0 | 4 | 0 | |
| uiv | 5 | 5 | 0 | 41 | 5 | 0 | 0 | |
| uxv | 8 | 8 | 8 | 67 | 8 (6) | 0 (2) | 0 | |
| opv | 8 | 8 | 17 | 91 | 8 (4) | 0 (4) | 0 | |
| max | 8 | 8 | 0 | 160 | data only | | | |
Findings:

- **Guide gap.** The guide counts progression multiblocks (EV 11 to UV ~36) and, from ZPM, lines (14, 21). Chart lines are far fewer from ZPM (6) and UV (8). The chart is either incomplete there or the lines do not exist. Needs the era docs plus the multiblock registry to settle; do not pad.
- **Real lines are scarce.** Only 3 of 9 EV and 1 of 6 ZPM lines have 4 steps. Most ZPM to UV lines are 1 to 3 steps, which are conversions, not chains.
- **Reach back.** LuV has 16 crossings, but ZPM has 1, UV 4 and UHV to OpV none: the late era lines are isolated and nothing reuses earlier infrastructure.
- **Isolation (RF-3C, superseded).** UHV to OpV: 11 lines of 4 to 6 steps have no crossing and no consumer line (uhv.isotopes, optics, life, antimatter; uev.light, stars; uxv.pasta, chips; opv.strand, beam, antimatter, bulge).

## Remove and merge

- **Remove: none.** The first pass flagged lv.aluminium, iv.iridium and mv.end. On inspection: lv.aluminium is skippable (`hull_mv_annealed`) but feeds the MV hull; iv.iridium's bypass was a re-cooling recipe; mv.end's key is consumed by use (travel key). None is decorative.
- **Merge: mv.plant into steam.ore.** 5 shared intermediates (copper dust path). Fold the plant line's extra step into the ore line.
- **Candidate overlaps, judgement needed (not merges):** lv.roaster and lv.acid both make sulfuric acid, but the roaster is ore-based with byproducts (hematite, silver, lead) and the acid line is from sulfur. Keep both if each has a distinct honest byproduct; otherwise merge.

## Skippable end products (fix: make the line the better route)

steam.ore (copper via `pgm_refining`), lv.acid and lv.roaster (venus gas collector), lv.aluminium (hull assembler), lv.diodes, lv.fertilizer (horizon oak log), mv.wood (methanol from carbon), hv.syngas (hydrogen distillery), luv.belt (tetrataenite, iridium, osmium via `pgm_refining`). Full bypass ids are in the CSV `skip_route` column.

## Proposed fix packages (one Sonnet session each, serial where they share files)

| Id | Lines | Work | Acceptance |
|---|---|---|---|
| RF-3D | steam.drill; lv.heliostat, lv.coalgas; hv.gasoline (no end marked); lv/mv/hv skippable lines; mv.plant merge | mark end products, make the line the cheaper or only route, merge mv.plant | each line has an end product, no cheaper bypass |
| RF-3E | ev.platinum, mars, nitric, cascade, power, dome; iv.fuel, plutonium, radon, venus, mercury, far | lengthen to 4+ steps or merge into a sibling | 4+ steps or removed with references |
| RF-3F | luv (15 of 18 lines), zpm, uv | same, add crossings reaching two or more eras back (zpm.naquadria, uv.fuel), settle the line count with the multiblock registry | reach back 2+ or merged; count matches the guide or is justified |
| RF-3G | uhv, uev, uiv | connect isolated lines to earlier eras (crossings) or merge | each line crosses or is used |
| RF-3H (done) | uxv, opv | chart links, see below | no UXV/OpV fix verdict left |

Each package needs era docs by section, may touch the pl-data, recipes, quests, lang and tests, and is for the integrator to scope into contracts. MAX stays with RF-7A.

## UXV and OpV resolutions (RF-3H)

All six fix verdicts were chart gaps: the recipes already run on older multiblocks and products (`docs/eras/uxv.md:794`, `opv.md:856`). Closed by link nodes in `pl-data-{uxv,opv}.mjs`; no recipe changed, so no T1 run. Machine links carry no arrow (a machine is not built from a machine).

- **uxv.pasta:** chart gap. Hot strip mill (EV), coated conductor line (LuV) and nitride magnet works (UEV) are linked; used by the UXV hull and cables.
- **uxv.chips:** chart gap. Crystal growth furnace, photonic foundry, VUV CaF2 optic (UHV), e-beam furnace (UEV) and MOCVD (UV) are linked.
- **opv.strand:** chart gap. PBO fibre (UHV) and the cage part (UIV) are the line's real inputs.
- **opv.beam:** chart gap. Antimatter trap, SRF sheet (UV), SPS, crystal growth (UHV), e-beam (UEV), lead polymer liner (UIV) and titanium plate (EV) are linked.
- **opv.antimatter:** chart gap. Positron accumulator, positron cartridge, MBE (UHV), fuel fabrication (IV), MK cryostat module (UIV) and indium (LuV) are linked.
- **opv.bulge:** chart gap. Hot cell (IV) and the nuclear clock (UHV) are linked; e-beam and titanium plate are linked once in opv.beam (a chart may link a target once).

Other lines read keep once content crossings count; uev (4 fix) and the ZPM to UV fixes belong to RF-3G and RF-3F.

## Design lines, not chart clusters (RF-3G)

The audit now measures each design line: numbered rows where a chart has them (MAX `l<n>_<i>` keys: 46 lines, not 8 clusters), otherwise each chain to its own end product inside a cluster (`era.cluster#end`). RF-3H's era-aware skips and content crossings are unchanged. Per era it reports design lines (era doc `## New process lines`; MAX `## Lines`, L47 and up are planned), chart lines, and design lines missing from the charts, with whether the dump holds them (`03_design_lines.csv`, `03_missing_lines.csv`; the named match is a token heuristic over the doc's stage names, count difference is the firm figure).

| Era | Design | Chart | Real (4+) | Missing (count) | Keep / fix / merge |
|---|---|---|---|---|---|
| zpm | 14 | 14 | 1 | 0 | 1 / 4 / 1 |
| uv | 22 | 17 | 3 | 5 | 4 / 10 / 3 |
| uhv | 32 | 27 | 9 | 5 | 0 / 10 / 6 (the rest keep) |
| uev | 40 | 11 | 4 | 29 | 9 fix / 2 keep |
| uiv | 46 | 37 | 36 | 9 | |
| uxv | 49 | 49 | 30 | 0 | |
| opv | 45 | 45 | 22 | 0 | |
| max | 46 | 46 | 40 | 0 | data only |

- **ZPM 14 vs 14:** every design line is a chain with its own end (`zpm.naquadria` and the fuel loop have no sink, so each is one line).
- **UV 17 vs 22:** five lines of `uv.pluto` and `uv.kuiper` are one-step fractions in the chart; the doc counts them as lines. Chart completion, not a pack change.
- **MAX 46:** reproduces the 46 built rows; L47 to L57 are planned and not counted as missing.
- Per-line verdicts shift in eras outside RF-3G because a cluster that held several chains is now judged chain by chain; the cluster-level table above is the RF-3C/3H record.

## UHV and UEV resolutions (RF-3G)

Stop rule hit: UEV's chart holds 11 of its 40 design lines (29 missing) and UHV is 5 short, so chart completion exceeds about 20 lines. Done: Part A and the cheap UEV chart repairs (uev still reads 9 fix, 2 keep: the rest of the fixes need the missing lines); the rest is listed.

- **uev.pressure:** chart gaps fixed in `pl-data-uev.mjs`. The fibre preform was an unconnected raw: now SiC fibre to BN-coated fibre (`boron_nitride`) to preform (`assembler`) to CVI plate, a 6-step line. The nitride magnet takes hydrogen from HV syngas (`pl_hv:shifted`, 5 eras back) and the SX blade takes platinum from the EV plant (`pl_ev:pt`). Both arrows verified by pl-check.
- **uev.isotopes:** the Ca-48 chain was cut in two by a missing `from` (enriched chloride); closed, now 4 steps. Flerovium stays 2 and 4 steps: the Pu-244 target, Ca-48 beam and SRF cavity feeds need the doc's lines 2, 5 and the UV cavity chain (items exist; chart lines missing).
- **uev.light:** He-3 now comes from the EV Moon cell (`pl_ev:he3`, 4 eras back). SNSPD and the photonic chip need FZ wafer and SiN litho chains (doc lines 18, 21; missing).
- **uev.stars:** unchanged: needs the Barnard rhenium and carbonyl lines (doc 10, 15).
- **uhv.ground and uhv.mercury:** unchanged (stop rule); doc lines for the Proxima ground and Mercury regolith chains are not in the chart as chains.
- **Open (not fixed):** UEV 29 and UHV 5 missing design lines; UEV has 8 of its 11 chart lines still at fix. Recommended follow-up: a chart-completion package for UEV (about 29 lines) and one for UHV (5), after which the verdicts are re-read.

T1 not run: no recipe changed.
## Proposed DECISIONS line

RF-3C/3H: line audit tool and CSV added (era-aware skips, content crossings from recipes); lines judged by step count, reach back, destinations, skip route and duplicates; chart lines from ZPM sit far below the AGENTS.md:18 guide.
