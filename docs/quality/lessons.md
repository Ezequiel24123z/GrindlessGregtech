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
| 15 | Each era reshaped file by file, with silhouettes that did not match from one machine to the next | No shared shape vocabulary per era; a helper used at script top level breaks when it loads after its user | One shape helper per era (`uev/shapes.js`: hall, tower, ring, gantry, dish, mast, dome, ridge; `uiv/shapes.js`: halls, beamlines, drums, cryostat stacks, shaft, torus, lattice shells, fusion annulus), used only inside registry callbacks (QR-S5, QR-S6). Size grows with the era by silhouette, not by bulk: median blocks per structure UHV 211, UV 273, UEV 349, UIV 517 |
| 16 | Controllers that need their own product: 110 machines unreachable on main after QR-R2 and QR-R4 (mercury solar works, fumarole condenser, ark biosphere, BN reactor, PIT line, fibre draw tower, light sail fab, heat source works, zone refining tower and everything after them); QR-R5 repeated it once (the SiC device fab researched from a SiC plate only its own line makes, which stranded six UHV machines) | "Own-line" research and domain items were picked from what the machine makes; T0 had no reachability check and native reachability needs a dump | `recipe-cycles.mjs` (in T0) fails on any controller that cannot be built from what exists before it; research and domain inputs come from earlier machines (QR-F3). The integrator reruns it after every merge, because two packages that each pass alone can form a cycle together |
| 17 | "Depth raisers": QR-R6's first handoff met the UEV complexity floor by pasting one deep part (the HfTaCN heating element) as a consumable into yarns, wafers, preforms and targets, and 1000 mB of helium into about 20 assembler rows | The complexity score counts depth and distinct inputs but cannot see whether an input belongs to the item's process | The review rejects it: a machine's heater or tool is never a per-item consumable, an inert gas only where the process needs one, and the score is raised by a real step or an intermediate of the item's own line (QR-R6 repair) |
| 18 | Twin recipes: after QR-R6 the UEV energy and dynamo hatches of each amperage had the same inputs, so GTM's lookup always picked the energy hatch and the dynamo hatches could not be made; QR-R7 hit the same on UIV | The repair changed inputs after the bench lookup guard had run, and no static check compares input lists of one recipe type | Energy hatches take voltage coils and dynamo hatches springs (GTM's own split); the lookup guard reruns after any repair that changes inputs, and a static twin check joins T0 (QR-F4) |
| 19 | The release obtain audit failed after every gate passed: 26 groups visible but unobtainable. Eleven controllers needed something only they or a later era make (the BN reactor UEV SiC fibre, the event horizon interferometer a UEV atom interferometer, the Barnard drill rhenium that only its own core rock gives, the levitation melter the rhea it first makes, the neutron-star machines einsteinium only they produce), and the six machines that make the parts of the first UIV circuit needed UIV circuits | `recipe-cycles.mjs` assumes every non-Grindless item obtainable, so a cycle through a GTM or addon item that only our recipes make (ENTE wire, rhenium, einsteinium, GT-- optical circuits) or through a circuit tag whose only real member needs the machines using it stays invisible; nothing checks that an input comes from the same or an earlier era; the obtain audit needs a full dump, so it ran only at release | Inputs come from earlier machines of the same or an earlier era, and machines on a tier's circuit bootstrap path take the previous tier's circuits, as GTM does (fix 0bd61dc6). QR-F5 adds static checks to T0: era order of inputs, and foreign ids and circuit tags whose only source is our recipes tracked by `recipe-cycles.mjs` |
| 20 | The release quest generator would have dropped 80 Multiblocks quests: they had fallen out of every tier gate. QR packages moved controllers to later-era parts (launch road machines to platinum and regolith, the Io intake to the sulfur concrete it feeds, the orbital station to Io germanium, the PIT line to hBN that needs the Mk3) and researched three works with what only they unlock (PBO plant with the elevator cable, tether works with the elevator motor, nitride magnet works with Barnard iron behind the UEV hull) | Releases and QR packages ran only the obtain pass and `recipe-cycles.mjs`; neither checks per-era order, and the model ignored GTM's generated research recipes, so a research deadlock was invisible | Inputs and research moved to earlier items; the model synthesises GTM research (scanner/station + item + data item); release checklist runs gate and eras for steam up to the implemented era on the batch dump; the quest generator skips eras after the implemented one |

## Results (v0.13.0)

| Area | When the review started | At release | Kept by |
|---|---|---|---|
| Structures | 173 of 234 fail the rubric | 0, no baseline (UIV included); 234 of 234 form in the world | `structure-quality.mjs`, forming sweep |
| Recipes | 393 baselined recipe/output pairs | 52, all justified below; no controller unreachable | `recipe-quality.mjs`, `recipe-cycles.mjs`, `recipe-twins.test.mjs` |
| Processes | 329 findings: 216 multiblocks without info, 39 machines and 20 recipe types with no recipe, 16 machines with no craft, 5 unused items | 30 on the last pre-release dump (3 self-gain, 27 trivial steps); the release dump drops those fixed in wave 2 | `process-audit.mjs` |
| EMI | GTM's plugin aborted: no GT process, workstation or preview | Plugin loads; each multiblock of ours has an info page in English and Spanish | client EMI audit, `emi_runtime_known.json` |
| Sounds | none of ours | 52 recipe types with a working loop | `sounds.md` |

Deferred, with the reason (each stays baselined only until its fix lands):
- 50 UIV parts below the UIV floor: they need a real intermediate of their own line, not filler; done in the UIV build (v0.14.0), `recipes.md` "UIV own-line intermediate pending".
- UEV target wheel and its blank: titanium plus berkelium oxide has no honest deeper chain yet.
- UIV one-in-one-out steps (poled LNOI wafer, annealed neon cone, C-12 ion-milled plate, MH braid) and the report-only fusion ash fluids (He-3/He-3, p-Li-6, p-N-15; shared ZPM fusion table).
- UIV doubts for the UIV build: the decay heat vault has only generator recipes; the TFLN fab tooltip says cleanroom but its recipes do not require one; BMG flexspline machining is a second source of ZrTiCuNiBe glass dust.
- EMI: 9 addon multiblocks show no preview (GTM assembly line, cleanroom, data bank and others); the next client audit tells whether the mod turned the preview off on purpose.

## Checklist for every new era (UIV, UXV and later)

Design (`docs/eras/<era>.md`):
- [ ] Each multiblock has a silhouette that says its process, with sizes and the blocks it uses; none is a box of one casing.
- [ ] Each controller, hatch and part names its recipe form on the ladder: research item, era fluid, 3 domain inputs, 8+ distinct ingredients from UXV.
- [ ] A controller's research item and domain inputs come from machines built before it, never from the machine itself or anything after it.
- [ ] Machines that make the parts of the era's first circuit take the previous era's circuits; no input belongs to a later era.
- [ ] Each process step names its second input or byproduct and where every byproduct goes; nothing comes from nothing.
- [ ] Each input of a component belongs to its own process; no generic deep part or gas added only to clear the complexity floor.
- [ ] Structure blocks used in bulk wrap their component 1:1.
- [ ] Shapes come from the era's shape helper (`<era>/shapes.js`), called inside registry callbacks; a new silhouette goes into the helper, not into one file.

Build (each package):
- [ ] `structure-quality.mjs --static --check`, `recipe-quality.mjs --check` and `process-audit.mjs` pass with **no new baseline entry**; new content never enters a baseline.
- [ ] `recipe-cycles.mjs` reports 0 unreachable controllers and `era-order` finds no machine recipe taking a later-era item (both run in T0; `--explain <id>` shows why one is stuck).
- [ ] Every recipe type has a recipe, every item a craft recipe and a use (or a stated future use), every multiblock an info page in both languages.
- [ ] No `const` in loops, no `Java.to` in suppliers, no `console.error` for optional content.
- [ ] Two recipes of one type differ in an ingredient; research ids are unique (check the dump). Rerun the bench lookup guard (`gg_test_recipe_lookup`) after any repair that changes inputs.
- [ ] The era's forming sweep (`gg_test_form_sweep_<era>`) passes.
- [ ] Sound candidates for the era's special multiblocks are listed (`sounds.md`).

Integration (once per batch):
- [ ] Regenerate the EMI expectations, the process-audit registry, the form-sweep id list and the pack index once.
- [ ] After each merge, rerun `recipe-cycles.mjs`, `recipe-quality.mjs --check` and `structure-quality.mjs --static --check` on the merged tree.
- [ ] Full forming sweep, a fresh dump, process-audit rebaseline, and the client EMI audit before a release.
- [ ] Run the obtain audit (`reachability.mjs --pass obtain`) on the batch dump before handing the release over; it is the only check that sees every mod's recipes.
- [ ] Run the gate and eras passes for steam up to the implemented era on the same dump; they are the only checks that see era order and research deadlocks.
