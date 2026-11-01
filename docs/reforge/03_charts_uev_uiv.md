# RF-3K: UEV and UIV process-line charts

Chart data only (`tools/quests/processing-lines/pl-data-uev.mjs`, `pl-data-uiv.mjs`); no recipe was changed. `pl-check` for uev and uiv: 0 issues (UEV 63 -> 177 arrows, UIV 289 -> 305). Local audit run on the RF-3A dump (`line-audit.mjs`).

## Verdict counts (before -> after)

| Era | Design lines | Chart lines | Missing (<40 % of stages) | keep | fix | merge | remove |
|-----|--------------|-------------|---------------------------|------|-----|-------|--------|
| UEV | 40 | 11 -> 35 | 29 -> 5 | 2 -> 10 | 9 -> 25 | 0 | 0 |
| UIV | 46 | 37 -> 39 | 9 -> 7 | 27 -> 29 | 10 -> 10 | 0 | 0 |

The UEV `fix` count rises because 24 lines that were never drawn are now audited. Each new `fix` is an honest finding about the recipes (below), not a chart error. "Missing" is a token heuristic over stage names; it is not proof a line is absent from the dump.

## Lines added to the charts

**UEV (24 chains, all arrows verified):** Ca-48 beam extended to the beam (7 steps); Pu-244, Cf-249 and tennessine targets; Li-6 and K-40 into the degenerate EOS model; ammonia borane to superhydride; rhenium and SX blade; hafnium; tantalum; HfTaCN coil block; tungsten divertor (+ Wf/W tile); YSZ coating; niobium SRF cavities; hBN; graphene; SiN waveguide; InAs quantum dots; SDD; PPKTP; TGG isolator (to the SPDC source); CNT muscle; hollow-core fibre; lobster-eye MCP; ULE cavity; aerogel.

**UIV:** GdBCO motor bulk (design line 23, 5 steps); glassy-carbon wick + droplet sheet into the droplet radiator module (design lines 19 and 20); a link from the element 120 line (9) to the UEV Nb3Sn cavity (line 32 shares the foil step but has no room for a second link) and from line 13 to UEV hafnia (these draw real reuse but do not satisfy the audit's reach-2 rule, see below).

**Designed, not built (or not a 4-step chain in the dump):**
- UEV: #25 proton-boron power, #28 degenerate matter (Sirius B: only the EOS step exists), #35 FFKM seals (`ffkm_dust` -> `ffkm_seal`, 2 steps), #6 ion-track membrane (built in the UIV foil line instead), #30 K-40 as designed (calutron salt; the chart shows the built Rock salt route).
- UIV: #1 MH cable (`metallic_hydrogen_single_wire` + `ffkm_seal`, 2 steps), #21 C-12 spreader, #25 polarised protium, #27 He-3 power, #28 p-N-15 power, #45 neon moderator (`solid_neon_cone` has no producer: 3 steps).

## Fix verdicts: chart gap or real problem

Chart gaps (fixed above): Ca-48, superhydride, Brayton wheel, SNSPD, optical computer, etc. were short because their upstream was not drawn; all now have full chains. After drawing them, none of the remaining `fix` verdicts is a chart gap: the recipes themselves have no crossing and no consumer, or are too short.

**Real problem A: short (<4 steps).** flerovium_atoms (2), plutonium_244_target (3), cf249_target_wheel (3), degenerate_eos_model (2), lay_superhydride_ingot (3), brayton_turbine_wheel (3), sx_blade (3), coated_sx_blade (3), divertor (3), wf_w_tile (3), optical_computer (3), polarised_dhe3_fuel (3), iron_pentacarbonyl (1), UIV L42 (3), UIV L20 as designed.
Proposed fix: give each a real upstream step (a second reactor stage, a purified or isotope-split feedstock) or fold it into the neighbouring chain as a branch. Files a content package touches: `pack/kubejs/server_scripts/grindless/uev/{isotopes,superheavy,megabar,electron_beam,photonics,sirius,fusion}.js`, `.../uiv/{memories_cryostat,metallic_hydrogen,matrioshka}.js`, matching `startup_scripts/grindless/<era>/` registrations, `client_scripts/grindless/*_lang.js` names, `tools/test` zones if a tier is added.

**Real problem B: isolated (no earlier-era input, no consumer line).** UEV: ca48_beam, tennessine_sample, hftacn_coil_block, snspd, hbn_emitter_chip, graphene_modulator, ktp_electroded_wafer, spdc_source, cnt_coiled_muscle, ule_cavity, fe60_record, aerogel_tile. UIV: L3 lonsdaleite bearing, L4 sled charge, L23 and L39 (UIV motor and conveyor), L9 and L32 (element 120, 119), L13 BEUV driver ASIC, L38 gamma Bragg mirror.
Most end products do feed a machine recipe (for example cnt_coiled_muscle -> UEV robot arm), but no line and no recipe two or more eras back. Proposed fix: make one earlier-era line product a real input of the line (for example UHV or earlier foils, alloys or gases) so it crosses with reach >= 2 (the audit rule from LuV on). The chart links already added (UEV Nb3Sn cavity into the element 120 line, hafnia into line 13) are only one era back and the audit's per-row mode ignores consumed links, so they do not clear the verdict. Files: same as A plus the `uiv/isotopes.js`, `uiv/compression_hall.js`, `uiv/cygnus.js` scripts for the UIV lines.

**Real problem C: bypass.** UIV L14 BEUV mirror: `gtceu:assembler` recipe (9 < 11 steps) skips the line. Proposed fix: remove or gate the assembler recipe in `uiv/beuv_stm.js`.

## Risks

- Link nodes added to UIV rows are a chart annotation only; row-mode lines (`lN_M` keys) ignore consumed links in the audit.
- Row-mode lines 19/20 share one sink, so the audit reports the orifice plate as that line's end product.
- Shared audit outputs and generated chapters were not committed; the integrator regenerates them.
