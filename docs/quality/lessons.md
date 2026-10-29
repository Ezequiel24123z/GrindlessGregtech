# Lessons from the quality review (QR)

What the global quality review (2026-10-28/29, `DECISIONS.md` "Quality review") found, why it happened, and the checklist every
new era follows so it does not happen again. The per-area standards live in the sibling files (`emi.md`, `structures.md`,
`recipes.md`, `items.md`, `sounds.md`, `forming.md`); this page only keeps root causes and rules.

## Root causes found

| # | Symptom the owner saw | Root cause | Fix and guard |
|---|---|---|---|
| 1 | EMI showed no GT process, workstation or use at all | A `Predicates.custom` preview supplier called `Java.to`, which KubeJS 2001.6.5 does not have. GTM builds every multiblock preview eagerly before its process pages, so one throwing supplier aborted GTM's whole EMI plugin; EMI still reported a successful reload (`emi.md`, "Original root cause") | Suppliers reuse GTM's typed candidates (QR-A0). Client suites wait for EMI's reload and run the coverage audit; known gaps only shrink (`emi_runtime_known.json`) |
| 2 | Multiblocks that are one giant block in game, hollow in the preview | Rhino initialises a `const` once per function call, so a per-cell `const edge = ...` kept the first cell's value (`structures.md`, "Finding") | `var` in loops and in functions that run more than once; a Node test forbids the pattern |
| 3 | "Cubes or rectangles of one block" | No design rule for shape: structures were sized for function only | Structure rubric and gate (`structure-quality.mjs`): no solid cuboid, no one-casing box, no block above 70 %, 3+ blocks, 2+ kinds of functional detail. Steam to UHV now pass with no baseline entry (QR-S1..S4) |
| 4 | Controllers and parts on the crafting table at UEV | Recipes were written at design time with the cheapest form, and nothing measured it | Recipe ladder and gate (`recipe-quality.mjs`): no crafting table from IV; IV machine + fluid, LuV assembly line, ZPM+ research; a complexity floor per tier (QR-R1..R4) |
| 5 | Items nobody can make or use, machines with no recipes | Recipe types registered before their first recipe; items added for later packages that never came | `process-audit.mjs`: no_use, 0-recipe types, no craft recipe. A type is registered only with its first recipe |
| 6 | Matter or energy from nothing | `sic_epi` 2000 mB hydrogen in, 2800 out; `culture_seed` 1 -> 2 with no feed | Process audit `self_gain`; replication now eats agar (QR-R4), sic_epi in QR-R5 |
| 7 | "Boring" one-in-one-out steps | Steps added to lengthen a chain rather than to model a process | `trivial_step` finding: each step gets a real second input, fluid or byproduct, or merges with its neighbour |
| 8 | Machines with no explanation | Info pages were optional | Every multiblock ships an EMI info page in en_us and es_es (M-INFO); `m_info_missing` is a process-audit finding (QR-I1..I5) |
| 9 | Previews forming in the preview but not in the world | Gravity blocks (sand, gravel, regolith), doors and fumaroles placed with no support | Forming sweep builds every controller from its own pattern (QR-B1); gravity blocks sit on the bottom layer or on a pattern block |
| 10 | Every bench run aborted at startup | `sounds.js` used `console.error` for a recipe type that exists only for one design choice; KubeJS aborts startup on it | Optional types are skipped with an info log, never `console.error` |
| 11 | Two recipes of one type that never run | GTM's lookup ignores counts, so two recipes that differ only in amounts collide | Two recipes of one type differ in at least one ingredient; the lookup guard bench test |
| 12 | Gate false positives that blocked fixes | Chain depth depended on recipe order (byproduct loops lowered depth); `observatory` forced to tier 7 | Depth is order-independent (3f1f1282); directories without a single era get no `eraTier` |
| 13 | Cost raised by quantity instead of complexity | A 4:1 laser module block made a 32-block structure cost 128 modules (QR-R4, reverted) | Structure blocks wrap their component 1:1 plus a housing, a domain part and a fluid (product rule 2) |
| 14 | Old shapes in comments, docs and tests | Reshapes updated the pattern but not the header comment | Each structure handoff lists stale comments; a mechanical pass (QR-M1) fixes them |

## Checklist for every new era (UIV, UXV and later)

Design (`docs/eras/<era>.md`):
- [ ] Each multiblock has a silhouette that says its process, with sizes and the blocks it uses; none is a box of one casing.
- [ ] Each controller, hatch and part names its recipe form on the ladder: research item, era fluid, 3 domain inputs, 8+ distinct ingredients from UXV.
- [ ] Each process step names its second input or byproduct and where every byproduct goes; nothing comes from nothing.
- [ ] Structure blocks used in bulk wrap their component 1:1.

Build (each package):
- [ ] `structure-quality.mjs --static --check`, `recipe-quality.mjs --check` and `process-audit.mjs` pass with **no new baseline entry**; new content never enters a baseline.
- [ ] Every recipe type has a recipe, every item a craft recipe and a use (or a stated future use), every multiblock an info page in both languages.
- [ ] No `const` in loops, no `Java.to` in suppliers, no `console.error` for optional content.
- [ ] Two recipes of one type differ in an ingredient; research ids are unique (check the dump).
- [ ] The era's forming sweep (`gg_test_form_sweep_<era>`) passes.
- [ ] Sound candidates for the era's special multiblocks are listed (`sounds.md`).

Integration (once per batch):
- [ ] Regenerate the EMI expectations, the process-audit registry, the form-sweep id list and the pack index once.
- [ ] Full forming sweep, a fresh dump, process-audit rebaseline, and the client EMI audit before a release.
