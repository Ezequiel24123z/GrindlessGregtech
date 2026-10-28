---
applyTo: "pack/config/ftbquests/**,tools/quests/**,docs/quests.md"
---
# Quest rules

- Quests are short, in English, give a small reward, and never block recipes. Before writing a chapter, look at how other packs solve it; copy and adapt only from packs whose licence allows it (`CREDITS.md`, "Quests"), always with attribution (proposed in the handoff).
- Guide: `docs/quests.md`. Read only the section you need: layout §4, dependencies §5, tasks §6, rewards §7, writing and banned phrases §8, ids §10, tools §11, the era's chapter plan §14, Processing Lines §17, Power §18, Multiblocks §19.

## Generated chapters (never edit the SNBT by hand)
| Chapter | Source to edit | Regenerate |
|---|---|---|
| `chapters/ev_age.snbt` | `tools/quests/ev-chapter/quests-data.mjs` | `node tools/quests/ev-chapter/gen.mjs` |
| `chapters/luv_age.snbt` | `tools/quests/luv-chapter/quests-data.mjs` | `node tools/quests/luv-chapter/gen.mjs` |
| `chapters/pl_*.snbt`, `chapters/power.snbt`, the Processing Lines group in `chapter_groups.snbt`, their entries in `tools/quests/lint-config.json` | `tools/quests/processing-lines/pl-data-*.mjs`, `power-data.mjs` | `tools/quests/processing-lines/run.ps1 -Dump <kubejs-exported> -Write` |
| `chapters/multiblocks.snbt`, its entries in `tools/quests/lint-config.json` | `tools/quests/multiblocks/mb-data.mjs` | `node tools/quests/multiblocks/gen.mjs --dump <kubejs-exported> --write` (after the Processing Lines run) |

- A quest package edits only the data file. It may run the generator to lint the result, but restores the chapter before committing (`git restore <chapter>`). The integrator regenerates generated chapters, `lint-config.json` and `chapter_groups.snbt` once per batch.

## Ids and saves
- Ids are 16 uppercase hex digits from `0000000000000001` to `7FFFFFFFFFFFFFFF` (first digit 0-7; 8-F fails silently in FTB Quests 2001.4). New ids: first digit 1-7, never repeated in the book.
- A quest or task that still means the same thing keeps its id, even when it moves chapter, place, text or tasks. A quest is removed only if it has no equivalent.
- `node tools/quests/fix-ids.mjs --write` clears the high bit; run it only when the linter reports `id-range`.

## Checks
- T0 runs `node tools/quests/lint.mjs` on the whole book. A chapter is ready with 0 errors and 0 warnings (or explained ones in `lint-config.json`, each with its reason).
- When a chapter's quest or dependency count changes, update `GG_QUESTS_EXPECTED` in `tools/test/overlay/kubejs/server_scripts/gg_test_quests.js` (the linter prints both numbers).
- The in-game quest tests (`gg_test_quests`, `gg_test_quest_book`) are proven mechanisms: they run in the integrator's T2/T3, not per quest package.
