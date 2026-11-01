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

Limits: the chart covers chart lines, not every multiblock; the cost matrix lists key items only; skippability ignores recipe cost. Verdicts are leads for the packages below, to be confirmed against `docs/eras/<era>.md`.

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
## Proposed DECISIONS line

RF-3C/3H: line audit tool and CSV added (era-aware skips, content crossings from recipes); lines judged by step count, reach back, destinations, skip route and duplicates; chart lines from ZPM sit far below the AGENTS.md:18 guide.
