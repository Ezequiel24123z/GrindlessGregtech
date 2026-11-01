# Phase 6A: assets audit

Package RF-6A (issue #43). Audit only: no texture, sound, model, blockstate or generator was changed. Regenerate every number below with:

```
node tools/analysis/assets-audit.mjs --gtm-jar <gtceu-1.20.1-7.5.3.jar> [--summary]
```

It writes `docs/reforge/data/06_textures.csv` (2608 rows) and `06_sounds.csv` (414 rows) and runs in about 30 s (0 sandbox errors). Without `--gtm-jar` the `gtceu:` references are reported as "unchecked" instead of verified. Tests: `tools/analysis/test/assets-audit.test.mjs` (9 pass).

## 1. Method and thresholds

- **References** come from running the startup scripts in a `node:vm` sandbox and recording every item, block, fluid, machine and recipe-type registration (`collectReferences`), plus the model JSONs. A texture is *missing* if referenced and absent, *orphan* if present and unreferenced.
- **Pixels**: own PNG decoder on `node:zlib`. Per file: size, frame count, opacity, colour count, mean luminance/hue/saturation, light direction, alpha-mask hash.
- **Recolour** = same alpha mask, luminance correlation >= 0.97 and a different hue/saturation/luminance (pixel-identical files included). **Inconsistent** = non-16x16 size, animation strip without `.mcmeta`, overlay >60% opaque, lighting from the wrong side, <=3 colours, or era luminance z-score > 3. **Placeholder** = flat or tint-only. All limits are in `LIMITS` in the tool.
- **Sounds**: a pure-JS Ogg Vorbis decoder measures length, RMS, peak, loop seam (jump ratio, start/end level), share of energy above 4 kHz and envelope repetition. Level checks: peak > -1 dBFS, RMS > -14 or < -34 dBFS, or > 4 dB from the pack median after the index volume. Loop checks: length outside 4-12 s, seam ratio > 4, start/end mismatch > 3 dB. Annoying: > 45% of energy above 4 kHz or an envelope repeating (strength > 0.85) within 2 s. Repeated: one loop shared by > 5 controllers.
- **Caveat on levels**: no reference decoder (ffmpeg/Python) was available. Durations match the spec exactly and GTM's built-ins decode to plausible levels (-7 to -26 dBFS peak), but absolute dB values may carry a small scale error. Relative comparisons (our loops vs GTM's, loop vs loop) are reliable.

## 2. Counts per era and category (texture files)

| era | files | missing | placeholder | inconsistent | recolour | orphan |
|---|---|---|---|---|---|---|
| steam | 71 | 0 | 0 | 14 | 0 | 0 |
| lv | 83 | 1 | 0 | 6 | 44 | 2 |
| mv | 51 | 0 | 0 | 12 | 2 | 2 |
| hv | 33 | 0 | 0 | 6 | 4 | 2 |
| ev | 52 | 1 | 0 | 10 | 3 | 2 |
| iv | 88 | 1 | 0 | 14 | 12 | 2 |
| luv | 105 | 2 | 0 | 14 | 8 | 2 |
| zpm | 148 | 2 | 0 | 28 | 10 | 2 |
| uv | 184 | 0 | 0 | 22 | 34 | 2 |
| uhv | 230 | 0 | 0 | 33 | 51 | 6 |
| uev | 309 | 0 | 0 | 33 | 194 | 6 |
| uiv | 313 | 0 | 0 | 23 | 221 | 6 |
| uxv | 294 | 43 | 0 | 22 | 121 | 6 |
| opv | 294 | 0 | 0 | 45 | 162 | 6 |
| max | 303 | 0 | 0 | 10 | 236 | 7 |
| other | 50 | 0 | 0 | 6 | 1 | 6 |

"other" = no era in the path (covers, machine bases, keys, `sky/pluto`, lunar and Martian samples, 7 gtceu casings). A file can be in several categories. External references: 173 `gtceu:` textures (all exist in the 7.5.3 jar), 11 `gtnn:` (unchecked).

| sounds | rows | missing | repeated | level | loop | annoying | orphan |
|---|---|---|---|---|---|---|---|
| grindless events | 98 | 36 | 0 | 54 | 12 | 13 | 0 |
| GTM built-ins used | 16 | 0 | 0 | 0 | 0 | 0 | 0 |
| machines | 300 | 8 | 0 | n/a | n/a | n/a | n/a |

## 3. Texture findings (worst 30 per category; the full lists are in the CSV)

### 3.1 Missing: 50 (43 items, 7 blocks), none placeholder

All 43 items are `uxv` and come from `uxv/spin_rows.js` (`annealed_mram_wafer`, `annealed_mtj_wafer`, `annealed_mu_foil`, `annealed_saf_wafer`, `cofe_me_wafer`, `contacted_sot_stack`, `dysco3_boule/polished_slice/slice`, `etched_mram_wafer`, `etched_mtj_wafer`, `fgt_raw_crystal`, `finemet_charge_dust`, `five_n_{cobalt,gallium,iron,manganese,nickel,silicon}`, `ga2o3_{efg_plate,epi_wafer,gated_wafer,slice}`, and 13 more). They render as the missing-texture cube in game. Seven blocks:

1. `block/ev_tripod/solar_wing_panel`
2. `block/heliostat/mirror`
3. `block/iv/hermean_thin_film_panel`
4. `block/luv/cryogenic_fuel_tank`
5. `block/luv/orbital_solar_panel`
6. `block/zpm/aerogel_fuel_tank`
7. `block/zpm/naquadah_fuel_tank`

`docs/reforge/00_diagnosis.md` quoted 211 items without a texture by name; the resolved figure (reference vs file, after models) is 43 items + 7 blocks. Retired `grindless:{uev,uiv,uxv}_<family>` components (RF-3A, #40) are not in the missing set; their textures, if any remain, count as "to be removed", not missing.

### 3.2 Placeholder: 0

No flat-colour textures and no fluid relies on tint only.

### 3.3 Inconsistent: 298 in total (reasons: 256 "overlay N% opaque", 36 "only N colours", 6 lit from the bottom-right; some files have several)

- **21 multiblock `overlay_front` (and `_active`) textures share one 76%-opaque mask** and are recolours of each other, across uv, uev, uhv, uiv and zpm: `accelerator_driven_reactor`, `antimatter_trap`, `calutron`, `carbonyl_refinery`, `heavy_ion_cyclotron`, `high_flux_reactor`, `laser_sail_launcher`, `matrioshka_computer`, `muon_fusion_cell`, `naquadah_fuel_works`, `naquadria_refinery`, `nuclear_clock_lab`, `organoid_array`, `positronium_condensate_lab`, `pyroprocessing_cell`, `r_process_decompressor`, `superheavy_chemistry_lab`, `swarm_control_station`, `synchrotron`, `transuranium_facility`, `xenobotany_greenhouse`. They look like one shared placeholder front.
- **9 `opv` items have only 3 colours and recolour 5 others**: `activated_absorber_tile`, `cm245_fraction`, `cooled_antihydrogen`, `cooled_octupole_winding`, `gasb_kerf_dust`, `gasb_wafer`, `ingaassb_epi_wafer`, `magnesium_fluoride_dust`, `octupole_tape`.
- 484 overlay textures are 80% opaque, and 256 front overlays exceed the 60% limit. Most are intentional full-face controller art, so treat the 60% rule as a screening heuristic, not a defect: only the 21-cluster above is a clear problem.

### 3.4 Recolour-only: 91 clusters, 1103 files (18 pixel-identical)

The largest clusters have 127, 70, 57, 56, 50 and 50 items. By era: steam 0, lv 44, mv 2, hv 4, ev 3, iv 12, luv 8, zpm 10, uv 34, uhv 51, uev 194, uiv 221, uxv 121, opv 162, max 236. The share of an era's items that sit in a cluster is the clearest identity signal (section 6): uiv 205/215, max 227/258, uev 183/207, opv 158/217, uxv 115/164, lv 28/33, against steam 0/5, mv 0/1, ev 0/5.

Examples worth fixing first: the 31-item `max` cluster (`max_smes_cell` and the max items), the 13-file `wireless_{dynamo,energy}_cover_<tier>` clusters, and 4 pixel-identical `max_parallel_hatch` overlays.

### 3.5 Orphans: 59

`block/cover` 30 (`wireless_{dynamo,energy}_cover_<tier>` for 15 tiers), `block/machines` 24, `block/multiblock` 3, `item/max_smes_cell`, `sky/pluto`. **Probable false positives**: covers and machine textures are resolved by GTM naming conventions (cover and overlay lookups by tier/name), not by KubeJS registrations, so the tool cannot see the reference. Only `max_smes_cell` and `sky/pluto` are likely real orphans; verify before deleting anything.

## 4. Sound findings

### 4.1 Missing: 36 of 98 events have no `.ogg` (62 files exist)

They are silent in game (the event is registered, the file absent). The 36: `loop_stellar_elevator`, `loop_plasma_mass_filter`, `loop_stellar_condensation_tower`, `loop_accretion_disk_skimmer`, `loop_frc_former`, `loop_bz_dynamo`, `loop_pasta_extractor`, `loop_pasta_phase_sorter`, `loop_pasta_draw_bench`, `loop_pasta_laminator`, `loop_polar_cap_tap`, `loop_ejecta_knot_sweeper`, `loop_annihilation_laser_works`, `loop_field_frozen_press`, `loop_tetron_fab`, `loop_gamma_optics_works`, `loop_magnetic_pair_converter`, `loop_antihydrogen_foundry`, `loop_annihilation_engine`, `loop_jet_beam_line`, `loop_spallation_target_station`, `loop_antiproton_decelerator`, `loop_strangelet_vault`, `loop_strangelet_distiller`, `loop_kugelblitz_forge`, `loop_hawking_collector`, `loop_atom_interferometer_works`, `loop_membrane_line`, `loop_rydberg_array_works`, `loop_photon_ring_imager`, `loop_geroch_winch`, `loop_gene_ark`, `loop_cluster_light_furnace`, `loop_mass_stream_injector`, `loop_accretion_feeder`, `loop_mirror_shell`. They need the generation script (ElevenLabs key), so this is a generator/run job, not art.

8 machines have no sound at all: `mercury_solar_field`, `microgravity_smelter`, `wake_shield_facility`, `orbital_solar_station`, `gravitational_wave_detector`, `coilgun_launcher`, `zero_g_crystal_grower`, `organoid_lab`. Of the 300 machine rows, the sound source is: wired loop 97, GTM sound entry 154, GTM built-in 31, none 18 (the 8 above plus controllers whose type has no sound and no fallback). The 00_diagnosis figure of 243 multiblocks without a sound was a by-name check; the resolved gap is 8 silent machines plus the 36 silent events above.

### 4.2 Repeated: none above the threshold

No loop is shared by more than 5 controllers. The repetition is in the GTM fallbacks: `chemical` 33 machines, `arc` 31, `motor` 28, `miner` 13, `furnace` 9, `assembler` 8, `science` 2. GTM loops are only 0.2-4 s long, and `miner` is loud (about -16 dBFS RMS).

### 4.3 Badly levelled: 54 of 62 files

Every pack loop is 15-25 dB louder (effective) than the GTM built-ins: our RMS is about -9 to -19 dBFS, GTM's about -16 to -44, and the index volume of 0.6-0.7 only takes off about 3 dB. Peaks reach 0 to +5 dBFS (encoder overs from hot sources). Loudest: `loop_fission_reactor` (rms -7.4, peak +1.9), `loop_optical_miner` (-7.5, +5.4), `loop_power_devices_fab` (-7.5), `loop_laser_fusion_chamber` (-8.5), `loop_mnt_collider` (-7.9), `loop_gas_giant_siphon` (-8.8), `loop_synchrotron`, `loop_cvi_furnace`, `loop_electron_beam_furnace`, `loop_fluorspar_kiln`, `loop_warp_gate`, `loop_dyson_swarm`. Too quiet: `loop_biorefinery` (-32.9), `loop_platinum_plant` (-32.6), `loop_heliostat_tower` (-31.7), `loop_vdw_stacking_cell` (-32.1), `loop_naquadria_magnet_works` (-24).

### 4.4 Loop problems: 12 files

Seam jump or start/end mismatch (no crossfade is applied; `-t duration` just trims): `loop_biorefinery` (13.6 dB mismatch), `loop_extraction_cascade` (seam x5.5), `loop_fission_reactor` (x18, 5.2 dB), `loop_hot_cell` (x4.8, 6.6 dB), `loop_lunar_power` (x7.6), `loop_naquadah_plant` (4.7 dB), `loop_naquadria_magnet_works` (6.4 dB), `loop_observatory` (8 s, x5.6), `loop_power_devices_fab` (3.3 dB), `loop_racetrack_fab` (x6.8), `loop_refinery` (x8.9), `loop_shequid_works` (x4.8). These click or pump on every repeat.

### 4.5 Annoying: 13 files

High-frequency hiss and/or a short repeating envelope: `loop_qubit_fab` (99.8% above 4 kHz), `loop_io_tether` (98.9%), `loop_superfluid_helium` (98.9%), `loop_dyson_swarm` (96%), `loop_hts_magnet_works` (93%), `loop_platinum_plant` (92%), `loop_antimatter_accumulator` (82%), `loop_cryogenic_plant` (81%, cycle strength 0.8 at 0.16 s), `loop_optical_miner` (74%), `loop_horizon_collector` (59%), `loop_tritium_removal` (51%), `loop_thorium_pyro` (48%), `loop_mtj_sputter_cluster` (envelope repeating every 0.26 s, strength 0.91).

## 5. How sounds are wired today

- **Source of truth**: `pack/kubejs/startup_scripts/grindless/sounds.js`. The `WIRING` map (recipe type -> event id) starts at `sounds.js:17`; the header comment at `:9-11` explains how to add one.
- **Registration**: `StartupEvents.registry('sound_event')` creates `grindless:<id>` for each event (`sounds.js:119-120`).
- **Attachment**: the machine-registry callback wraps `ExistingSoundEntry(SoundEvent.createVariableRangeEvent(RL(NS, WIRING[typeId])), SoundSource.BLOCKS)` and calls `type.setSound(entry)` (`sounds.js:131-139`). The sound belongs to the **recipe type**, not the machine: controllers sharing a type share the loop, and multi-mode controllers play the active mode's type.
- **Fallback**: era files call `.setSound(GTSoundEntries.X)` on recipe types without a loop (136 call sites). `GTSoundEntries` is a proxy in the audit sandbox so those arguments are readable.
- **Playback**: GTM `RecipeLogic.updateSound` starts a looping `AutoReleasedSound`. Loops must be mono, because Minecraft only attenuates mono sources.
- **Assets**: index `pack/kubejs/assets/grindless/sounds.json`; files `pack/kubejs/assets/grindless/sounds/<id>.ogg`.
- **Generation**: spec `tools/assets/sounds.json` (id, recipeType, prompt, duration, volume, attenuation, quality) and `tools/assets/New-MachineSound.ps1`: ElevenLabs sound-generation (mp3), then ffmpeg to mono Ogg Vorbis, 44.1 kHz, `-q:a 1`, trimmed to `duration`, no fades, no loudness normalisation.
- **Standard**: `docs/quality/sounds.md` (100 KB budget, 8 s loops, never over 12 s; ElevenLabs Starter plan, commercial licence). `tools/analysis/test/sounds.test.mjs` checks that spec, index and `WIRING` agree, but not that the `.ogg` exists or how loud it is. That is why 36 missing files pass T0.

## 6. Per-tier visual-identity assessment

Item textures per era (n = items with a file; mean colours, saturation, luminance; share in a recolour cluster):

| era | n | colours | sat | lum | in cluster | verdict |
|---|---|---|---|---|---|---|
| steam | 5 | 15.8 | 0.59 | 0.51 | 0% | strong: hand-drawn, saturated brass and iron |
| lv | 33 | 11.9 | 0.27 | 0.40 | 85% | components are tier-stamped; low colour count |
| mv | 1 | 7.0 | 0.35 | 0.53 | 0% | too small a sample; machines carry the identity |
| hv | 7 | 15.0 | 0.34 | 0.54 | 29% | decent |
| ev | 5 | 18.8 | 0.42 | 0.50 | n/a | good variety, few items |
| iv | 22 | 17.6 | 0.33 | 0.51 | 32% | good; the strongest mid-game identity (Venus, Mercury, fission art) |
| luv | 28 | 18.3 | 0.37 | 0.48 | 11% | good |
| zpm | 40 | 17.6 | 0.36 | 0.49 | 5% | good, but its multiblock fronts join the 21-cluster |
| uv | 96 | 65.4 | 0.21 | 0.35 | 27% | rich but dark and desaturated |
| uhv | 110 | 40.2 | 0.26 | 0.38 | 37% | mixed; 51 recolours |
| uev | 207 | 14.4 | 0.23 | 0.46 | 88% | weak: a tint over a shared body |
| uiv | 215 | 15.5 | 0.29 | 0.45 | 95% | weakest: nearly every item is a recolour |
| uxv | 164 | 64.8 | 0.21 | 0.33 | 70% | 43 items missing a texture, 121 recolours |
| opv | 217 | 43.4 | 0.21 | 0.35 | 73% | many 3-colour wafers and dusts |
| max | 258 | 74.0 | 0.24 | 0.29 | 88% | many colours but one dark look; 236 recolours |

Reading: **steam to ZPM have real identity** (few clusters, 12-19 colours, distinct palettes). **UEV, UIV, OpV and MAX are tint swaps**: the generator draws one body per component family and changes the palette, so a UEV and a UIV motor differ only in colour. UV, UXV and MAX use many colours but converge on the same dark, desaturated look (luminance 0.29-0.35), so the top eras read as one block. Era luminance and saturation should walk visibly (brighter and more saturated at ZPM, deeper and more metallic at UV/UHV, then a distinct signature per era above that) instead of all landing near 0.3.

## 7. Generator changes that would fix what

The generators are about 195 `Build-*.ps1` scripts in `tools/assets/` sharing `Pixel.Lib.ps1` (`New-Palette` at `:62`, `Shade`, `Mix`, `Add-Outline`, `Save-Png`). README sections used: `## Regenerate` (`README.md:120`), `## How to retouch` (`:152`). Never hand-edit PNGs: changes go through the scripts.

| Problem | Fix in the generators | Findings addressed |
|---|---|---|
| 43 missing uxv items, 7 missing blocks | Add the missing outputs to the era builders (`Build-Uxv*`, the solar, heliostat, tank builders), or drop the registrations (RF-3A style) if the item is cut | 3.1 |
| 21-cluster shared multiblock front | Give each controller its own face: per-controller pattern seeds and a motif keyed on the machine (calutron coils, synchrotron ring, trap field), using the existing `Build-*Textures.ps1` controller pattern | 3.3 |
| Tint-swap eras (uev, uiv, opv, max) | One shared "component body" function that takes a per-era *style* (shape language, wear, trim, panel lines, not just palette); era identity table in a new `Era.Lib.ps1` consumed by `Build-UevComponentsTextures`, `UivComponents`, `OpVComponents`, `Max*` | 3.4, 6 |
| 3-colour opv wafers/dusts | Reuse the wafer/dust shading helpers from lower eras (`Shade`/`Mix` ramps with 8+ colours) | 3.3 |
| Dark, desaturated top eras | Per-era luminance/saturation targets in the palette spec, validated by this tool's era z-score | 6 |
| Pixel-identical overlays | Parameterise the overlay builder by machine | 3.4 |
| Sound gaps | Run `New-MachineSound.ps1` for the 36 missing ids; wire sounds for the 8 silent machines | 4.1 |
| Level and loop defects | Extend `New-MachineSound.ps1`: loudness-normalise to about -24 dBFS RMS, peak limit -3 dBFS, 150 ms equal-power crossfade of tail and head for seamless loops, low-pass above about 9 kHz for the hiss files; or regenerate the 13 annoying loops with revised prompts | 4.3-4.5 |
| Silent events pass T0 | Add a test: every index event has an `.ogg` and a peak under -3 dBFS (using this tool's decoder) | 4.1 |

## 8. Needs genuine art work

Generators can vary palette, pattern and shape, but not invent new visual ideas. Needs a human artist (or a deliberate art pass), count about 10 work items:

1. **Era signature language for UEV, UIV, OpV and MAX** (the weakest tiers, 1,000+ items): a defined shape language and motifs per era; the generator then applies it.
2. **The 21 multiblock controller faces**: one illustrated front per machine, then generator-reproducible.
3. **Hero art for the 7 missing blocks** (solar wings, heliostat mirror, thin-film panel, fuel tanks).
4. **The 43 uxv spin-row items**: wafers, boules and crystals of exotic materials; a base sheet for each family (wafer, boule, slice, foil, stack).
5. **Loop sounds for 13 annoying and 12 seamed loops**: a human sound designer may do better than regeneration for hero machines (fission reactor, cryogenic plant, qubit fab).
6. **Quest chapter icons and questbook imagery**, and `sky/pluto` and planet skyboxes, if the Phase 6 scope includes them.

Licence notes (`CREDITS.md:9`): GTM textures are referenced, not copied (LGPL-3.0, attribution). Any outside art must be MIT/LGPL with attribution; GPL, non-commercial or all-rights-reserved art is ideas only. Sound generation stays on the ElevenLabs Starter plan (commercial) per `docs/quality/sounds.md`.

## 9. Proposed follow-up packages (later, from these findings)

| id | scope | allowed files (proposal) |
|---|---|---|
| RF-6B | Fix 50 missing textures (add builders or remove registrations) | `tools/assets/Build-Uxv*.ps1`, the solar/tank builders, their outputs |
| RF-6C | Unique faces for the 21 controllers | `tools/assets/Build-*Textures.ps1` for those machines, outputs |
| RF-6D | Era-style library and rework of uev, uiv, opv, max components | new `tools/assets/Era.Lib.ps1`, the four component builders, outputs |
| RF-6E | Sound pipeline: normalise and crossfade, then regenerate/fix the 36 missing, 13 annoying and 12 seamed loops, wire the 8 silent machines | `tools/assets/New-MachineSound.ps1`, `sounds.json`, `.ogg` files, `sounds.js`, `sounds.test.mjs` |
| RF-6F | Tests: event-has-file and level gates; add the audit to the validator | `tools/analysis/**` |

RF-6E and RF-6F touch the shared `sounds.js`/`WIRING` mechanism: serialise them. 6B-6D touch disjoint builders and can run in parallel (at most two at once).

## 10. Caveats

- Orphan findings for covers and `block/machines` are probably GTM naming-convention references (section 3.5).
- Level figures carry a small absolute-scale uncertainty (section 1); relative findings hold.
- The retired RF-3A components, if present in the CSV, are "to be removed", not missing.
- Overlay opacity > 60% is a screening heuristic; 256 hits are mostly intentional.
- GTM-side textures and sounds are audited only where a Grindless machine uses them (173 textures, 16 sound entries).

Proposed DECISIONS line: "Audit of 2026-11 (RF-6A): 50 textures and 36 sound files missing; era identity is weakest at UEV, UIV, OpV and MAX; generators fix most of it, art needed for era signatures and controller faces." No CREDITS change.
