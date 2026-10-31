# RF-3C: Line audit, Steam to OpV

Read-only audit of every process line in the quest chart (`tools/quests/processing-lines/pl-data-*.mjs`, one cluster = one line), measured against the `v0.17.0-max` dump. Reproduce with:

`node tools/analysis/line-audit.mjs --dump <dump> --out docs/reforge/data` (writes `03_lines.csv`; about 3 s).

No pack content changed. MAX rows (8 lines, 5 to 7 steps) are data only: RF-7A decides.

## Method

- **Steps:** the longest chain of machine steps (machine or `ours` node, or an item crafted straight from items). Machine outputs add no step. A *real* line has at least 4 (AGENTS.md:18).
- **Reuse:** crossings are link nodes into another era's chapter; `reach_back` is the largest era distance.
- **Destination:** consumers of each end product in the dump (recycling, decomposition and repacking recipes ignored). Travel keys (`grindless:*_key`) are consumed by use and count as having a sink.
- **Skip route:** a recipe outside the line, not of a type the line owns, producing the end product with fewer steps from base than the line, from obtainable non-same-material inputs. It is a lower-bound depth heuristic, not a price comparison, so it can only produce `fix`, never `remove`.
- **Duplicate:** at least 4 shared intermediates covering 75% of the smaller line (or the same products and at least 2 shared).
- **Verdicts:** `keep`, `fix`, `merge`, `remove`; rules in `judge()`. Short-line and isolation rules apply from EV on, the reach-back rule from LuV on.

Limits: the chart covers chart lines, not every multiblock; the cost matrix lists key items only; skippability ignores recipe cost. Verdicts are leads for the packages below, to be confirmed against `docs/eras/<era>.md`.

## Per era (guide: AGENTS.md:18)

| Era | Lines | Real (4+) | Crossings | Keep | Fix | Merge | Remove | Guide |
|---|---|---|---|---|---|---|---|---|
| steam | 7 | 2 | 0 | 5 | 2 | 0 | 0 | |
| lv | 12 | 3 | 4 | 5 | 7 | 0 | 0 | |
| mv | 9 | 4 | 8 | 7 | 1 | 1 | 0 | |
| hv | 8 | 2 | 5 | 6 | 2 | 0 | 0 | |
| ev | 9 | 3 | 2 | 3 | 6 | 0 | 0 | 11 |
| iv | 10 | 4 | 7 | 4 | 6 | 0 | 0 | 15 |
| luv | 18 | 5 | 16 | 3 | 15 | 0 | 0 | 20 |
| zpm | 6 | 1 | 1 | 0 | 6 | 0 | 0 | 27 |
| uv | 8 | 3 | 4 | 2 | 6 | 0 | 0 | 36 |
| uhv | 9 | 7 | 0 | 3 | 6 | 0 | 0 | |
| uev | 4 | 2 | 0 | 0 | 4 | 0 | 0 | |
| uiv | 5 | 5 | 0 | 5 | 0 | 0 | 0 | |
| uxv | 8 | 8 | 0 | 6 | 2 | 0 | 0 | |
| opv | 8 | 8 | 0 | 4 | 4 | 0 | 0 | |
| max | 8 | 8 | 0 | data only | | | | |

Findings:

- **Guide gap.** The guide counts progression multiblocks (EV 11 to UV ~36) and, from ZPM, lines (14, 21). Chart lines are far fewer from ZPM (6) and UV (8). The chart is either incomplete there or the lines do not exist. Needs the era docs plus the multiblock registry to settle; do not pad.
- **Real lines are scarce.** Only 3 of 9 EV and 1 of 6 ZPM lines have 4 steps. Most ZPM to UV lines are 1 to 3 steps, which are conversions, not chains.
- **Reach back.** LuV has 16 crossings, but ZPM has 1, UV 4 and UHV to OpV none: the late era lines are isolated and nothing reuses earlier infrastructure.
- **Isolation.** UHV to OpV: 11 lines of 4 to 6 steps have no crossing and no consumer line (uhv.isotopes, optics, life, antimatter; uev.light, stars; uxv.pasta, chips; opv.strand, beam, antimatter, bulge).

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
| RF-3H | uxv, opv | same as RF-3G | same |

Each package needs era docs by section, may touch the pl-data, recipes, quests, lang and tests, and is for the integrator to scope into contracts. MAX stays with RF-7A.

## Proposed DECISIONS line

RF-3C: line audit tool and CSV added; lines judged by step count, reach back, destinations, skip route and duplicates; chart lines from ZPM sit far below the AGENTS.md:18 guide.
