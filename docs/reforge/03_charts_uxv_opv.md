# RF-3N: UXV and OpV process-line charts (issue #61)

Chart data only (`pl-data-uxv.mjs`, `pl-data-opv.mjs`); no recipe changes. Local `line-audit` run, dump `rf3a/out4`.

## Verdict counts (fix verdicts per design line)

| Era | Design lines | Fix before | Fix after | Chart gaps fixed | Real problems left |
|---|---|---|---|---|---|
| UXV | 49 | 20 | 5 | 15 | 5 |
| OpV | 45 | 24 | 8 | 16 | 8 |

pl-check `--era uxv` and `--era opv`: 0 issues.

## Missing lines (`data/03_missing_lines.csv`)

All 30 UXV and 4 OpV rows are false positives of the token heuristic: every design line 1-49 (UXV) and 1-45 (OpV) already has a chart row (`missing_by_count` = 0). Lines added: 0. Designed-not-built: 0.

## Chart gaps fixed

The chart started at an intermediate item, so the real earlier steps (recipes that exist in the dump) were missing. Each fix prepends those steps.

- UXV: L12 (boron nitride reactor), L15 (vdW stacking cell), L17 (EBF), L19, L20 (hot cell, partitioning plant), L26 (stellar elevator), L28 (plasma quench caster), L31 (naquadria magnet works), L33, L35, L39 (pasta extractor and sorter), L34, L49 (tetrataenite ingot), L36 (europium reductor), L42 (platinum plant).
- OpV: L2, L3, L5, L7, L8, L14, L15, L18, L21, L28, L33, L37, L39, L40, L41, L44 (first producer machine plus its main input added in front of each row).
- Rows were also renumbered sequentially (UXV) because the audit only splits rows when all keys match `l<N>_<i>`.

## Real problems (still fix; need a content package)

Proposed fix for all: add a real earlier machine step (or a branch crossing another line) so the line has 4+ steps. A content package would touch `pack/kubejs/server_scripts/grindless/<uxv|opv>/*.js`, `pack/kubejs/data/grindless/tables/`, `client_scripts/grindless/*_lang.js`, `lang/*.json`, the era quests and `docs/eras/<era>.md`.

| Era | Line | Problem | Proposed fix |
|---|---|---|---|
| UXV | L21 | 3 steps; the ion-track membrane branch exists but is not a drawn side branch | Make the membrane a required input of an extra step, or draw the branch once the step is added |
| UXV | L23 | 3 steps | Add a target-preparation step before the hot cell |
| UXV | L24 | MNT collider chain has no crossing | Make one of its products an input of another line |
| UXV | L41 | KrF laser premix comes from a plain mixer | Move the premix to a machine step (gas blender or reactor line) |
| UXV | L43 | gas stopping cell: helium, liquid helium, He-6n only | Add an isotope-separation step |
| OpV | L6 | 3 steps after prefix | Add a fibre pre-treatment machine step |
| OpV | L20 | 3 steps after prefix | Add a beryllium refining step before the ingot |
| OpV | L22 | Li-6 hydride from a chemical reactor, no machine prefix | Enrichment step before the hydride |
| OpV | L26 | lithium, 2-3 steps | Same enrichment line as L22 (merge) |
| OpV | L31 | 3 steps after prefix | Add a curium purification step |
| OpV | L32 | B4C-10 dust from a chemical reactor, 2 steps | Boron-10 enrichment step |
| OpV | L34 | silicon carbide from a mixer, 2 steps | Add a CVD or crystal-growth step, or fold into L35 |
| OpV | L35 | 3 steps after prefix | Add a doping step |

Proposed DECISIONS line: "RF-3N: UXV and OpV charts completed; remaining short lines (UXV 5, OpV 8) are content problems, not chart gaps."
