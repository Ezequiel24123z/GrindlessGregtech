# Research: quest books of five GregTech packs, and their licences

Work package RF-4B (#35). Research only: no quest, generator or credit file was changed. Nothing here is quoted at length; quests are described by paraphrase, file path and quest id.

## 1. Method

Shallow sparse clones (outside the repo) at the commits below, measured with scripts that parse the SNBT or BetterQuesting JSON. Counts are per chapter file, not by eye.

| Pack | Repository (branch) | Commit | Date | Quest format and location |
|---|---|---|---|---|
| Star Technology (ST) | StarT-Dev-Team/Star-Technology (main) | `b88b5ba114f3edc4450f8d8ba68b7d3e36e56f18` | 2026-10-26 | FTB SNBT, `config/ftbquests/quests/chapters/*.snbt`; text in `kubejs/assets/ftbquestlocalizer/lang/en_us.json` (`{key}` placeholders) |
| GTCP Modern (GTCP) | GregTechCEu/GregTech-Modern-Community-Pack (main), pack 1.15.0 | `97dda0249bea94b77462a30b6e2414dc7d1c9034` | 2026-09-04 | FTB SNBT, `config/ftbquests/quests/chapters/*.snbt` (+ `reward_tables/`); text inline |
| Monifactory (Moni) | Omicron-Industries/Monifactory (main), MC 1.20.1 | `a2067cd093e543f84d5fc2e9b30933d98472a7db` | 2026-10-23 | FTB SNBT, `config/ftbquests/quests/chapters/*.snbt`; text inline |
| Cosmic Frontiers (CF) | Frontiers-PackForge/CosmicFrontiers (main-1.21.1), 0.8.1 | `321a9cf15517641168a00aa85e54b999351e08f9` | 2026-10-25 | FTB SNBT, `overrides/config/ftbquests/quests/chapters/*.snbt`; text in `.../quests/lang/en_us.snbt` (keys `quest.<ID>.title`, `.quest_desc`, `.quest_subtitle`, `chapter.<ID>.title`) |
| GTNH | GTNewHorizons/GT-New-Horizons-Modpack (master), 2.9.0 | `79f9a03b5dd9e492d28998b9dee0ea1d1822a6b1` | 2026-10-31 | BetterQuesting JSON, `config/betterquesting/DefaultQuests/` |

Tier of a chapter was taken from its title where it has one, otherwise inferred from the histogram of `gtceu:<tier>_` machine and component items its tasks ask for. Chapter file names are often misleading (CF, Moni), so tiers below follow titles and items. "Words" are description words after resolving lang keys.

## 2. Pack by pack

### 2.1 Star Technology (MIT)

24 chapters, 1934 quests, 134 quest links. Groups: *Through the Ages* (the tier spine), a progression group (processing lines), extras.

| Chapter (file) | Tier (inferred) | Quests |
|---|---|---|
| `early_game` | Steam/LV | 77 |
| `industrial_revolution` | LV/MV | 82 |
| `automation_age` | MV–IV | 94 |
| `futuristic_mechanisms` | EV–ZPM | 76 |
| `preparing_for_dimensional_travel` | ZPM/UV | 44 |
| `adventures_in_abydos` | UV/UHV | 89 |
| `a_portal_of_lost_worlds` | UHV | 42 |
| `draconic_age_part_1` | UEV/UIV | 94 |
| `the_stars_await_greatness` | endgame | 57 |
| `resource_production` 125, `line_of_progression` 55, `pl1` 101, `pl2` 105, `pl3` 174, `pl4` 186, `pl5` 68, `nuclear_fission` 44 | processing lines and progression | 858 |
| `power` 148, `applied_energistics` 133, `gcrops` 42, `quality_of_life` 26, `shop` 42 | extras | 391 |
| `welcome` 11, `mechanics` 19 | reading | 30 |

- **Shape:** 2693 tasks: 2253 item, 432 checkmark, 4 structure, 4 dimension. Average 8.0 description words per quest (tier chapters ~10–16, `early_game` 27, max 141); only 724 quests have any text. 1.41 dependencies per quest. 1033 item rewards, 971 of them a `kubejs:coin`; 916 quests have none. 206 gear-shaped quests (milestone machines).
- **Processing-line chapters `pl1`–`pl5`:** 68–186 quests each, almost no text, 24–113 checkmarks per chapter used as step labels, item tasks track each intermediate. They are chemistry/material lines, not chip lines.
- **`mechanics` / `line_of_progression`:** long reading quests (avg 105 words, max 374; checkmark only) teaching parallels, overclocking and so on; the progression chapter is a text-light pointer map.

### 2.2 GTCP Modern (LGPL-2.1)

17 chapters, 563 quests, 114 quest links, 821 tasks (744 item, 76 checkmark, 1 dimension). Average 85.1 words per quest, 1.58 dependencies, 4 starts in the whole book (every tier chapter has zero starts: it begins from the previous tier's exit). 146 item rewards, `choice` rewards 8; 432 quests have no reward.

| Chapter | Tier | Quests | Avg words |
|---|---|---|---|
| `steam_age` | Steam | 40 | 110.8 |
| `lv__low_voltage` | LV | 75 | 95 |
| `mv__medium_voltage` | MV | 74 | 94 |
| `hv__high_voltage` | HV | 45 | 77 |
| `ev__extreme_voltage` | EV | 62 | 81 |
| `iv__insane_voltage` | IV | 37 | 63 |
| `luv__ludicrous_voltage` | LuV | 37 | 84 |
| `zpm__zero_point_module` | ZPM | 27 | 64 |
| `uv__ultimate_voltage` | UV | 20 | 49 |
| `heating_coils` 4, `ore_generation` 39, `ore_processing` 20, `renewability` 20, `tips_and_tricks_2` 21 (223 words), `gtceu` 25, `progression` 17 (cross-links), `multiblock_dilemma` (0 own quests, 28 quest links to tier quests: a curated multiblock index) | topic | 146 + links |

### 2.3 Monifactory (LGPL-3.0)

14 chapters, 844 quests, 134 quest links, 1387 tasks (1217 item, 100 checkmark, 41 stat, 24 gamestage, 3 dimension). Average 51 words per quest, 1.32 dependencies, 151 starts (the `omnium` chapter alone has 118 stat-task starts). All hexagon except 8 squares. Rewards are currency items (`kubejs:moni_nickel` 265, `moni_quarter` 201, `moni_dollar` 34); 301 quests have none. Chapter `title` fields are item names, so tiers come from content.

| Chapter | Tier | Quests |
|---|---|---|
| `the_factory` | Steam/LV | 71 |
| `groundwork` | MV–HV | 71 |
| `into_the_microverse` | (dimension tasks, microverse) | 42 |
| `scaling_up` | HV–IV | 104 |
| `some_assembly_required` | LuV–ZPM | 48 |
| `feeding_the_machine` | UV/ZPM | 58 |
| `home_stretch` | UHV+/MAX | 43 |
| `matterenergy` 57, `omnium` 119, `power_generation` 30, `progression` 96, `renewable_production` 71, `simulating_resources` 9, `dependency_chain` 25 (gamestage helper) | guides | 407 |

Prose is long in the early chapters (`groundwork` 86, `the_factory` 85, `matterenergy` 84, `some_assembly_required` 80 words).

### 2.4 Cosmic Frontiers (LGPL-3.0)

14 chapters, 629 quests, 25 quest links, 773 tasks (652 item, 104 checkmark, 9 custom `cosmiccore:deed`, 5 location). Average 20.8 words (all text in lang), 1.20 dependencies, 61 starts, 6 item rewards in the whole book (623 quests have none). 41 gear and 15 rsquare shapes.

| Chapter title (file) | Tier | Quests |
|---|---|---|
| The First Steps (`fthe_first_steps__steam`) | Steam | 124 |
| Lights, Camera, Action! (`lights_camera_action__elv`) | LV | 114 |
| Even Deeper! And Higher! (`fto_the_skies_r_esteam7`) | MV | 107 |
| Skies of Storm and Sea (`fthe_grid_r_6hv7`) | HV | 143 |
| A Lone Thread (`ffate_lostr_6ev7`) | EV | 2 |
| IV, LuV, ZPM, UV, UHV chapters | empty stubs (6 chapters with 0 quests) | 0 |
| `general_progression` 88, `power_problems` 21, `baubles_and_trinkets` 25, `enew_start_here` 5 | other | 139 |

CF has content only to HV; it is the least useful source above that.

### 2.5 GTNH (CC BY-NC-SA 4.0: ideas only)

BetterQuesting JSON, 46 quest lines (`QuestLinesOrder.txt`), 3814 quest files (3944 line placements, some shared). Fourteen tier lines, 1283 quests, average 67 words, 641 main quests (`isMain`), 1797 reward entries. Dominant task types: `bq_standard:retrieval` and `optional_retrieval` (submit items), also `crafting`, `checkbox`, `hunt`, `location`, `fluid`. 1.3–1.9 tasks and 1.3–2.2 prerequisites per quest (rising towards UIV). Items are metaitems by damage value, not registry ids.

| Tier line | Quests | Avg words | Main |
|---|---|---|---|
| Tier 0 Stone | 92 | 95 | 38 |
| 0.5 Steam | 115 | 69 | 27 |
| LV | 159 | 78 | 46 |
| MV | 150 | 56 | 45 |
| HV | 121 | 51 | 57 |
| EV | 94 | 51 | 51 |
| IV | 132 | 40 | 106 |
| LuV | 83 | 63 | 59 |
| ZPM | 70 | 62 | 42 |
| UV | 52 | 101 | 28 |
| UHV | 49 | 71 | 28 |
| UEV | 63 | 80 | 36 |
| UIV | 57 | 100 | 44 |
| UMV | 46 | 82 | 34 |

Rewards fall with tier (LV 318, MV 298, HV 245, EV 172, IV 170, LuV 98, ZPM 46, UV 7, UHV 20, UEV 13, UIV 5, UMV 2). Topic lines: MultiblockGoals 164 quests (124 words each), HowtoGeneratePower 167, SpaceRace 143, MassProcessing 76, PowerfulNuclear 60, WorkingwithOil 46 (169 words), Tips and Tricks 33 (279 words), Endgame Goals 31.

## 3. Cross-pack scaling

Quests per tier chapter (tier assignment as in section 1; blank = no such chapter).

| Tier | GTNH | GTCP | ST (chapter) | Moni (chapter) | CF |
|---|---|---|---|---|---|
| Stone/Steam | 92 + 115 | 40 | 77 (`early_game`, with LV) | 71 (`the_factory`, with LV) | 124 |
| LV | 159 | 75 | (shared) | (shared) | 114 |
| MV | 150 | 74 | 82 (with LV) | 71 (with HV) | 107 |
| HV | 121 | 45 | 94 (MV–IV) | (shared) | 143 |
| EV | 94 | 62 | 76 (EV–ZPM) | 104 (HV–IV) | 2 |
| IV | 132 | 37 | (shared) | (shared) | 0 |
| LuV | 83 | 37 | (shared) | 48 (LuV–ZPM) | 0 |
| ZPM | 70 | 27 | 44 | (shared) | 0 |
| UV | 52 | 20 | 89 (UV/UHV) | 58 | 0 |
| UHV | 49 | — | 42 | 43 (UHV+) | 0 |
| UEV–UMV | 63, 57, 46 | — | 94 + 57 | — | — |

How growth behaves:

- **GTNH** peaks at LV (159) and then declines to about 50–60 per tier, but never collapses; every tier to UMV keeps a full line, prose lengthens again at UV and above, and the mix of main quests is highest at IV (106 of 132).
- **GTCP** peaks at LV/MV (75/74) and shrinks to 20 at UV; its late chapters are compact but keep long prose (49–84 words).
- **ST** grows in the late game: each late chapter is 42–94 quests and the extra volume sits in five processing-line chapters (100–186 quests each) with almost no text. Its quests get short, not fewer.
- **Moni** keeps 40–100 quests per later chapter and adds guide chapters for its own systems.
- **CF** is front-loaded (114–143 per early tier) and stops at HV.

Pattern worth copying for "longer and more numerous in advanced eras": ST's approach, where counts rise by adding tracked-item process lines (cheap to read, many quests) rather than prose.

## 4. How each book teaches wafers, circuits, processes and multiblocks

Quest ids are the SNBT `id` of the quest in the named chapter file.

### Star Technology (all in `automation_age.snbt` unless noted)

- **Teaching style:** one quest per product, short or no text, chained item tasks. A chip quest asks lens, wafer and chip in one quest. A processor is a four-step ladder (processor → assembly → computer → mainframe); the mainframe is a `gear` quest. Multiblocks are item tasks on the controller plus casings (5 of 42 casing tasks use a count above 1); only 4 `structure` tasks exist (UV/UHV and UEV chapters). Reward is a small coin.
- **Chain 1, MV–HV circuits:** mv_circuit_assembler `75942788374CDEF3`; phosphorus boule `6EB85BBD539AEB57` → phosphorus wafer `2CABFCC73E33E133`; chip quests with lens + wafer + chip (lpic `2681E878121B1CF6`, mpic `2D4F9DFF6B559C65`, hpic `05F2C7351FF1B0E5`); cleanroom `17C1292018AE363E`; microchip processor `088FE0CF9D07F9C6` → micro processor `363F5B598683A074` → assembly `7399429099302C6C` → computer `52FE319F5E176C37` → hv_circuit_assembler `47CD61D6ECD3DC7D` → mainframe `62BA581B2918BB7B`.
- **Chain 2, EV:** ev_circuit_assembler `574ECD841D0D2AD7` → nano processor `0514DE717001A062` → assembly `497833345EB46A47` → computer `0C0C0FBDE1760110`.
- **Chain 3, `futuristic_mechanisms.snbt`:** qbit_cpu `1E1DF0982ECDD7D0` → quantum processor `06780B462515CAE2` → assembly `4E77319DB3B30062` → computer `421DF7880AD00F58` → mainframe `79428BAEAA7856E1`; crystal line raw chip `5E3F7C06E05628F6` → engraved `5935F9CB5E1C099B` → crystal processor `70C2BB4FAA2FB1F2` → assembly `744CAEF994308983` → computer `30A1077A14212FE2` → mainframe `3FC351F05F2AC743`; Assembly Line `0094C2E72105E8CA`.

### GTCP Modern (`mv__medium_voltage.snbt`, `hv__high_voltage.snbt`)

- **Teaching style:** long explanatory text (60–110 words) with item tasks for each product; a tier chapter teaches every wafer by name with its lens. Cleanroom has its own quest naming the filter casing. Text warns about dead ends. Most tier quests give nothing; rewards appear in Steam and LV.
- **Chain 1, MV wafers:** silicon boule + wafer `71412502C81F21C1`; IC wafer with ruby lens `6F6D2829FC42F21C`; RAM wafer with emerald lens `1E7BF65DB32B8B3E`; ULPIC wafer with sapphire lens `16A1EF8B80A96633`.
- **Chain 2, MV circuits:** basic integrated circuit `5C17BF90DA2AAEEE` → good `60D7F6C1EE918B66` → advanced `26394C1290D70AB6`; mv_circuit_assembler `0DE5C3FBC9A6A690`; microchip processor `5E76D4C24026157D` → micro processor `38DE506FF5B32031` → assembly `5063FDFFBE3E4855` → computer `4AFD3073C731A1E4`.
- **Chain 3, HV:** cleanroom (filter casing) `3568BC9742092FC5`, hv_circuit_assembler `6B1595678ECB7AC8`, micro processor mainframe `14D277A164202FF8`. The EV rows already adapted in CREDITS.md (*Nano CPUs*, *NOR Gates*) come from `ev__extreme_voltage.snbt`.

### Monifactory

- **Teaching style:** medium-length text with hexagon quests; the circuit ladder is split by chapter. Multiblocks (including its own Advanced Microverse Projector) are taught with item-set tasks on the structure blocks, counts above 1 on casings in 78 tasks (the most of any pack). Rewards are coins. Recipes differ from stock GTM (steel, rubber), so check facts against our dump.
- **Chain 1, `groundwork.snbt`:** silicon boule `5567F5E5926664F4` → silicon wafer `5BC89A6032EC5EF5` → Circuit Wafers (ilc wafer + chip) `7AA5FD63FA3BA43C`; phosphorus boule `349869EBF2D9FAF1`.
- **Chain 2, `some_assembly_required.snbt`:** Assembly Line `6DAB13A7BDECE94E`; naquadah boule `0889C9E0DD0FDF06` → advanced SoC wafer `7ECA688A91A1392A`; qbit CPU chip `1903B26C95DD325A`; Advanced Microverse Projector `52F1953ED72A8AA6`.
- **Chain 3, `scaling_up.snbt`:** nano CPU chip `1207189AD233A746`; SoC wafer `360B577684B1AB1B`.

### Cosmic Frontiers

- **Teaching style:** very short lang text, almost no rewards, a custom circuit ladder (`cosmiccore:hex_processor` → assembly → supercomputer → mainframe) and custom `deed` tasks. Only HV and earlier are filled.
- **Chain 1, MV chapter:** silicon boule `37BDEA4FF6C6ECF1` → wafer `44503C71CC992EF4` → ILC wafer + amethyst lens `0292F63DC3EC6E1F`; RAM wafer + emerald lens `0407A0291D69959D`; ULPIC wafer + sapphire lens `6286BBDCED944054`.
- **Chain 2, HV chapter:** cleanroom `0D3CDC269478EEBE` → hex processor `1329F2A5C5F92752` → assembly `6D0EE8632300E103` → supercomputer `53233A66F859C1F5` → mainframe `254BB28ACDB58EBE`.

### GTNH (ideas only)

- **Teaching style:** long chatty text, `retrieval` submit tasks (consumes items, unlike our rule), non-main side quests such as "Cheaper X Circuits" at every tier, quest lines per tier plus topic lines (MultiblockGoals teaches Assembly Line, id 1412 (350 words) and Cleanroom, id 940 (554 words), fusion in LuV–UV).
- **Chain 1, circuits LV–MV:** Empty Circuit Board 748 → Good Circuits 717; Basic Circuit Assembler 795; monocrystalline boules 782 → Silicon Wafer 792 → Integrated Circuit 794 → Good Integrated Circuits 793 → Advanced Circuits 838.
- **Chain 2, HV–EV:** Phosphorus Doped Wafer 1238; NOR and NAND Chips 1239; Integrated Processor 1016; Processor Assembly 1017; Workstations 1014; Advanced Circuit Assembler 1221 and II 1222; Mainframes 1225; EV Circuit Assembler 1223; NanoCPU Wafer and Chip 1249; Nano Processor 1248.
- **Chain 3, IV–LuV:** IV Circuit Assembler 1669; Naquadah Doped Wafer 1671; SoC 1673; ASoC 1685; QBit Wafer and Chip 1679; LuV Circuit Assembler 1683; Crystal Chips 1687; Crystal Processors 1686.
- (Ids are `questIDLow` values; names are as displayed in the book.)

### Synthesis

| Aspect | ST | GTCP | Moni | CF | GTNH |
|---|---|---|---|---|---|
| Text per quest | very short | long | medium-long | short | long |
| Wafer + lens in one quest | yes | no (one quest per wafer) | partly | yes (lens per wafer) | separate |
| Processor ladder | 4 quests, mainframe gear | 4 quests | split across chapters | 4 custom | many, incl. side quests |
| Multiblock teaching | item task, controller + casings | text + cleanroom | item sets with counts | item tasks | dedicated topic line |
| Rewards | small coin | mostly none | coin | none | many, shrinking |
| Dependency style | 1.4/quest | 1.6/quest, no starts | 1.3/quest | 1.2/quest | 1.3–2.2/quest |

## 5. Mapping to our six chapters per era

Each source is labelled by licence: **C** = copy and adapt with CREDITS.md attribution per chapter and quest (ST MIT, GTCP LGPL-2.1, Moni/CF LGPL-3.0); **I** = ideas only (GTNH). Our layout rules (`docs/quests.md` section 4) and the chained-tasks rule (section 6) stay; the sources' tasks are mostly already of that type.

| Our chapter | Best source chains | Use |
|---|---|---|
| What's new | GTCP tier chapters' opening and exit quests (e.g. `mv__medium_voltage.snbt`); ST `line_of_progression.snbt` as a map; GTNH tier-line first quests | C (GTCP, ST); I (GTNH) |
| Materials processing | ST `pl1`–`pl5` (item-tracked process lines, one quest per intermediate, checkmark labels); ST `resource_production`; GTCP `ore_processing.snbt`; Moni `renewable_production` | C; the rate of ~100+ quests per line suits UV and above where our process lines grow x1.5 per era |
| Wafers and circuits | ST `automation_age`/`futuristic_mechanisms` ladders (chain 1–3); GTCP MV wafer chain; Moni `groundwork`/`some_assembly_required` wafer chains; CF MV lens table | C; GTNH chains only as the shape of the ladder (I) |
| Machines and multiblocks | ST gear milestones and Assembly Line quest `0094C2E72105E8CA`; Moni item sets with counts (78 tasks) for casing blocks; GTCP `multiblock_dilemma` curated index; GTNH MultiblockGoals line | C (ST, GTCP, Moni); I (GTNH) |
| Integration | ST `applied_energistics.snbt` (already credited), `power.snbt`; CF AE2 chapters (already credited); Moni `matterenergy` | C |
| Capstone project | ST late chapters (`the_stars_await_greatness`, `draconic_age_part_1`) and Moni `home_stretch`; GTNH Endgame Goals and SpaceRace | C (ST, Moni); I (GTNH) |

"Every new mechanic must explain what it is for, how it is made, what it needs, what it unlocks and how to automate it": no source does this in one place; ST/Moni give what it needs and what it unlocks via chained tasks, GTCP gives purpose and warnings in prose, GTNH gives automation advice in topic lines. All five would still need a rewrite against our recipes.

Caveat on copying: our recipes and balance differ (GTM 7.5.3 dump, Grindless multiblocks), so any text that states a number, recipe or machine name must be re-checked; docs/quests.md already says this for Moni.

## 6. Licences

Each verdict comes from the repository's LICENSE file; no separate licence or notice file for configs, quests or lang was found in any of the five repositories (the only LICENSE files are at the root).

| Pack | Licence | LICENSE URL | Scope | Obligations | Verdict |
|---|---|---|---|---|---|
| Star Technology | MIT, "Copyright (c) 2023 trulyno" | https://github.com/StarT-Dev-Team/Star-Technology/blob/main/LICENSE | Whole repo (code, configs, quests, lang) | Keep copyright and licence notice | Copy and adapt; credit each chapter and quest in CREDITS.md |
| GTCP Modern | LGPL-2.1 (or later) | https://github.com/GregTechCEu/GregTech-Modern-Community-Pack/blob/main/LICENSE | Whole repo | Attribution; derived files stay under the LGPL | Copy and adapt; credit in CREDITS.md. README credits ursamina and Deepacat |
| Monifactory | LGPL-3.0 (or later) | https://github.com/Omicron-Industries/Monifactory/blob/main/LICENSE.md | Whole repo | Attribution; derived files stay under the LGPL. README credits Exaxxion, Nomifactory CEu (Tracer4b) and "certain new quests from GregTech Community Pack" | Copy and adapt; name Moni and, where it matters, the upstream pack in the credit line |
| Cosmic Frontiers | LGPL-3.0 | https://github.com/Frontiers-PackForge/CosmicFrontiers/blob/main-1.21.1/LICENSE | Whole repo (README credits only third-party assets and mods) | As above | Copy and adapt; credit |
| GTNH | CC BY-NC-SA 4.0 (the LICENSE file is the CC text; GitHub shows it as "Other") | https://github.com/GTNewHorizons/GT-New-Horizons-Modpack/blob/master/LICENSE | Whole repo | NonCommercial and ShareAlike; attribution | **Ideas only**: do not copy text or structure; this matches the AGENTS.md rule for non-commercial licences |

Notes:

- `docs/quests.md` section 2 already lists ST, GTCP, Moni and CF correctly; GTNH was "reference only" and is now verified as above.
- LGPL-2.1 and LGPL-3.0 sources are mixed in our book, so CREDITS.md should keep the licence per row (as it already does).
- Not verified: whether the 1.12 Nomifactory/GTCP quests that Monifactory inherited carry extra terms. When copying Moni, prefer chapters the Moni team wrote (see the Moni commit history) and cite the pack, not the upstream.
- Each copied quest or chapter needs a CREDITS.md row naming pack, file path, licence and the quest id(s).

## 7. Conversion notes for our generators

Field and format notes only; the generators in `tools/quests/` were not changed. The book is read by `tools/quests/lib/book.mjs` (chapter fields, `{key}` lang placeholders, `data.snbt`, `chapter_groups.snbt`), so FTB SNBT sources load as they are.

**FTB SNBT sources (ST, GTCP, Moni, CF)**

- Chapter keys seen: `id`, `filename`, `group`, `order_index`, `icon`, `default_quest_shape`, `progression_mode`, `subtitle`, `quest_links[]`, `quests[]`. Quest keys: `id`, `x`, `y`, `shape`, `size`, `dependencies`, `description`, `tasks[]`, `rewards[]`, `optional`. Task types: `item`, `checkmark`, `structure`, `dimension`, `location`, `observation`, `stat`, `gamestage`, custom.
- ids are 16 hex characters; copied quests must be given new ids (keep a mapping for credits), and `fix-ids.mjs` / the linter treat duplicates as errors.
- Descriptions: ST uses `{ftbquests.<chapter>.<name>.description}` with text in a KubeJS lang file (contains mojibake `Â§`); CF uses `quest.<ID>.*` keys in a `lang/en_us.snbt`; Moni and GTCP are inline with `&` colour codes. Resolve to inline text before adapting.
- Layout differs: ST/Moni use their own grids; re-place to our columns every 2 and rows every 1.5 (`docs/quests.md` section 4). Moni hexagon default matches ours.
- Rewards: ST coin and Moni currency items are `kubejs:` items that do not exist here; replace with our small useful rewards (section 7) or drop them.
- Item ids need no remap for `gtceu:` (same GTM). Custom items (`cosmiccore:*`, `start_core:*`, Moni's monilabs machines) do not exist here and need a replacement or dropping.
- `quest_links` (GTCP `multiblock_dilemma`) are linked quests (`linked_quest`, `x`, `y`): our book does not need them unless we add an index chapter.

**BetterQuesting (GTNH; ideas only, so conversion is for reading, never for import)**

- Layout: `QuestLinesOrder.txt` (line order); `QuestLines/<Name>-<id>/` holds placement JSON per quest (`questIDHigh`, `questIDLow`, `x`, `y`, `sizeX`, `sizeY`, pixel grid, 48 px per square); `Quests/<name>-<id>/<quest>.json` holds `preRequisites`, `properties.betterquesting` (`name`, `desc`, `icon`, `isMain`, `questLogic`, `taskLogic`, `visibility`), `tasks` (`taskID`: `bq_standard:retrieval`, `optional_retrieval`, `crafting`, `checkbox`, `hunt`, `location`, `fluid`) and `rewards` (`bq_standard:item`).
- If ever needed for analysis: `preRequisites` ↔ `dependencies`, `checkbox` ↔ `checkmark`, `retrieval` ↔ `item` with `consume_items` forced to false per our rule 6, `optional_retrieval` ↔ `optional_task`, `isMain` ↔ non-optional. Items are metaitems by damage value (`gregtech:gt.metaitem.01`), so there is no 1:1 map to `gtceu:` ids and recipes differ. Names carry `§` codes and text is non-copyable.

## 8. Proposed lines (for the integrator)

- **DECISIONS:** Quest rebuild may copy and adapt chapters from Star Technology (MIT), GTCP Modern (LGPL-2.1), Monifactory and Cosmic Frontiers (LGPL-3.0), each chapter and quest credited in CREDITS.md; GTNH is CC BY-NC-SA 4.0, ideas only. Late eras add tracked-item process-line quests (the ST pattern) instead of long prose.
- **CREDITS (Quests table, one row per copied chapter):** `| <what> | <pack> (<repo>), <chapter file> quest ids ... | <licence> | Adapted text and structure; new ids; recipes checked against GTM 7.5.3 |`; plus one GTNH row: `| Tier-line scaling and the circuit ladder as a teaching order | GTNH (GTNewHorizons/GT-New-Horizons-Modpack), config/betterquesting/DefaultQuests | CC BY-NC-SA 4.0 | Ideas only; nothing copied |`.
