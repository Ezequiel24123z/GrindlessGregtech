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
- **Verdicts:** `keep`, `fix`, `merge`, `remove`; rules in `judge()`. Short-line and isolation rules apply from EV on, the reach-back rule from LuV on.
- **Roles (LD-T1):** implements the line rule of `docs/eras/ev.md:481-500`. A declared `role` (power, resource, infrastructure, research, travel) is tested against the dump and, if it holds, the line is not judged as production; a failed role is judged as production with the failure in the reason. `line` joins clusters of one chapter into one line, `extends` (3 steps or fewer) makes a branch end that needs a consumer, `keepShort` lets a short production line stay with its reason listed, and a short line of ours that replaces a stock chain is a fold. The skip route also drops ores with no vein, same-material loops, parallel sources of earlier lines and fold chains. The role, fold and resource tests are approximations; the audit prints each failed role. **LD-T2:** the role tests follow RF-3S's intent: infrastructure follows consumers up to three hops to a machine, structure, casing or suit part, and a machine or structure block placed in the world needs no consumer; research and travel accept consumption as a material when the recipe's output is a research item, a travel part or a site machine; resource also accepts site fluids, air and consumable capture gear beside wear parts, and still needs an end product that feeds a line. Recycling, packing and decomposition are never uses.

Limits: the chart covers chart lines, not every multiblock; the cost matrix lists key items only; skippability ignores recipe cost. Verdicts are leads for the packages below, to be confirmed against `docs/eras/<era>.md`.

## Current state (batch 16 close, 2026-11-03)

Regenerated against the batch 16 dump `84c44332278e` (`data/03_lines.csv`, 285 rows: a cluster gives one row per end product, and `line` joins clusters into one line). 258 keep, 26 fix, 1 merge, 0 remove; batch 3 had 190 keep and 157 fix of 395.

| Era | Rows | Lines | Real (4+) | Longest | Keep | Fix | Merge |
|---|---|---|---|---|---|---|---|
| steam | 4 | 4 | 3 | 6 | 4 | 0 | 0 |
| lv | 10 | 9 | 4 | 10 | 9 | 1 | 0 |
| mv | 11 | 7 | 6 | 10 | 10 | 1 | 0 |
| hv | 14 | 7 | 8 | 20 | 14 | 0 | 0 |
| ev | 20 | 8 | 16 | 24 | 18 | 2 | 0 |
| iv | 15 | 9 | 9 | 12 | 15 | 0 | 0 |
| luv | 32 | 13 | 12 | 13 | 30 | 2 | 0 |
| zpm | 25 | 11 | 8 | 24 | 25 | 0 | 0 |
| uv | 12 | 6 | 11 | 18 | 10 | 2 | 0 |
| uhv | 14 | 10 | 12 | 23 | 13 | 1 | 0 |
| uev | 13 | 11 | 10 | 19 | 13 | 0 | 0 |
| uiv | 29 | 10 | 27 | 11 | 25 | 4 | 0 |
| uxv | 22 | 10 | 19 | 27 | 18 | 3 | 1 |
| opv | 21 | 9 | 21 | 23 | 21 | 0 | 0 |
| max | 32 | 21 | 22 | 33 | 22 | 10 | 0 |
| maxplus | 11 | 11 | 11 | 39 | 11 | 0 | 0 |

The 27 rows left are tracked in #284:
- Feeder ends that the D4 and D5 charts close as `dest` rows, which the per-end-product split counts as lines of 1 to 3 steps (UIV I2 L32 and I9 L23; UXV X5 L31, X6 L39, X7 L49; MAX M3, M4, M5 and M8). Their clusters' longest rows run 4 to 9 steps.
- Bypasses: LV fertilizer, MV silicon and UV superfluid helium; a shorter stock recipe makes the same end product (LV and MV costs are only reviewed, AGENTS.md principle 2).
- Short or isolated:
  - EV lunar titanium: 3 steps, a resource route with no declared role.
  - EV nano circuits: 15 steps, no crossing.
  - LuV Mond ends iridium and osmium: 2 steps, the platinum plant's asteroid mode.
  - MAX Penrose payload: 3 steps.
  - UIV I2 L9 and I9 L39: isolated.
- Reach-back: UV spent fuel and UHV betavoltaics cross only the previous era.
- Merge: UXV X2 (the sensor) shares 7 intermediates with X1.

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
