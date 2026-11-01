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

## UIV fixes (RF-3Q)

- **A. L42 mK cryostat**: fixed. New upstream stage Pr₆O₁₁ → EBF → Pr metal (existing `memories_cryostat` recipe, no table change), then levitation melter → PrNi₅, two cryostat-works steps and the dilution unit: 9 chart nodes instead of 3.
- **A. L20 droplet sheet**: merged into L19. The orifice plate, EB-distilled Sn and collector are already side inputs of the radiator module recipe (`matrioshka.json`); no separate droplet generator exists, so the doc row is rewritten and no recipe changes.
- **B. L3 lonsdaleite bearing**: fixed, +1 LuV `magnetic_bearing` (housing) in `metallic_hydrogen.json`.
- **B. L4 sled charge**: fixed, +4 UHV `pbo_fibre` (overwrap) in `levitation_melter.json`.
- **B. L39 UIV conveyor**: fixed, +4 LuV `itbtc_coated_conductor` (guideway) in `levitation_melter.json`.
- **B. L23 UIV motor**: fixed, +2 LuV `superconducting_coil` in `uiv_components.json`.
- **B. L38 gamma Bragg mirror**: fixed, +1 LuV `sapphire_test_mass` (substrate) in `j0437.json`.
- **B. L13 driver ASIC**: fixed, kept UHV `vuv_frequency_comb` on the `beuv_lithography` develop step in `beuv_stm.json`. The exposure step already uses all 4 item slots.
- **B. L9 element 120 and L32 element 119**: fixed through the shared `ion_track` recipe in `superheavy.json` (heavy_ion_irradiation), now with a kept UHV `californium_252` source (fission-fragment track count cross-checks the beam fluence). The recoil separator takes only 2 item inputs and the chemical reactor of `etched_membrane` is full, so the input sits on the ion-track step. The same recipe also feeds the other superheavy (UEV and UXV) lines.
- **C. L14 BEUV mirror**: kept as is. The `assembler/beuv_mirror` cap is the last step of the line, not a bypass: the BEUV scanner's assembly-line research requires `beuv_mirror`, so moving the cap into `beuv_lithography` would make that research circular. The real gap was the chart, which showed only a short chain; it now draws B₄C → SPS → target → MBE → La/B₄C multilayer → LaN barrier → mirror (7 nodes, two UHV machine crossings).
- Chart: link nodes `x3_brg`, `x4_pbo`, `x23_coil`, `x39_cc`, `x9_cf` (shared by L9 and L32), `x13_comb`, `x38_mass` in `pl-data-uiv.mjs`; `uiv.md` rows and crossings 101 to 110 updated.

## UEV fixes (RF-3P1)

All real recipes already existed, so every fix is a chart change in `pl-data-uev.mjs`; no recipe, table or startup change.

- **flerovium_atoms and plutonium_244_target**: merged into one chain: Pu-244 → oxide → ampoule → target → heavy ion cyclotron → recoil gas → recoil separator (also fed by the etched membrane chain) → atoms.
- **sx_blade, coated_sx_blade and brayton_turbine_wheel**: merged into one chain: rhenium → 6N Re → master alloy → blade → heat treatment → bond coat (EV platinum link) → EB furnace (also fed by the YSZ ingot chain) → coated blade → single-crystal foundry → wheel (7 steps).
- **divertor and wf_w_tile**: new upstream stages tungsten dust → ingot → wire → coated wire → fibre preform, then both branch off (5 steps each).
- **optical_computer**: merged with the SiN waveguide chain (wafer to annealed chip → waveguide circuit → quantum photonic chip → hall).
- **lay_superhydride_ingot**: the ammonia borane chain feeds the last megabar press in the same chain.
- **degenerate_eos_model**: Li-6 and K-40 calutron chains meet in one model node; `keepShort` (single recipe use).
- **cf249_target_wheel, polarised_dhe3_fuel, iron_pentacarbonyl**: kept short with a `keepShort` reason each (branch end; one blend recipe fed by the EV helium-3 link; two-machine mining line).

## UEV fixes (RF-3P2)

Nine recipe rows gain one input from UV or earlier (reach 2+); link nodes `x_*` in `pl-data-uev.mjs`. Costs and times unchanged.

- **ca48_beam**: kept `srf_cryomodule` (UV) in `assembler/ca48_beam`.
- **tennessine_sample**: `silica_aerogel` x1 (ZPM), `superheavy_chemistry`.
- **hftacn_coil_block**: `uranium_rhodium_dinaquadide_single_wire` x2 (ZPM).
- **snspd**: `normal_optical_pipe` (LuV) in `cool_and_package`.
- **hbn_emitter_chip**: `ingaas_pump_module` (UV); **graphene_modulator**: `ytterbium_fibre` (UV).
- **spdc_source**: `photonic_chip` (UV).
- **cnt_coiled_muscle**: `superconducting_coil` (LuV); **ule_cavity**: `sapphire_test_mass` (LuV).
- **ktp_electroded_wafer**: left isolated; its row has no free chart slot for a link (layout rules), so it stays for a follow-up.
- **fe60_record**, **flerovium_atoms**: `role: 'research'`. **aerogel_tile**, **lay_superhydride_ingot**: `role: 'infrastructure'`.

## Risks

- Link nodes added to UIV rows are a chart annotation only; row-mode lines (`lN_M` keys) ignore consumed links in the audit.
- Row-mode lines 19/20 share one sink, so the audit reports the orifice plate as that line's end product.
- Shared audit outputs and generated chapters were not committed; the integrator regenerates them.

## UIV line 13 (RF-3W, issue #92, 2026-11-01)

The BEUV driver ASIC line moved to its own cluster `beuv` (the audit reads links only for non-row clusters), draws the UEV HfO2 and UHV comb links, and ends in the photonic tensor core. Audit: UIV 0 fix rows.
