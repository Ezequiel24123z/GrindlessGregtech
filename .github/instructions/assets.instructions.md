---
applyTo: "tools/assets/**,pack/kubejs/assets/**"
---
# Asset rules

- Our textures are procedural 16x16 pixel art written by `tools/assets/Build-*Textures.ps1` (shared library `tools/assets/Pixel.Lib.ps1`). Nothing from GTM or other mods is copied or retouched. Style: GregTech's, light from the top left.
- Never open or hand-edit the PNGs or `.png.mcmeta` under `pack/kubejs/assets/grindless/textures/`. Edit the generator (palettes in `New-Palette`, text maps where `.` keeps a pixel and `_` erases it), then run that one script. Review with its `Build-*Preview.ps1` or `-Preview` (previews are not published).
- Overlays follow GTM's casing convention: transparent background, details only on the overlay, `_active` animated as a vertical strip with its `.mcmeta`, `_emissive` with only the pixels that glow. Without `overlay_front_paused`, GTM uses `overlay_front`.
- `tools/assets/README.md` is large: read only the row of your script in the top table and your machine's section (`git grep -n "<machine>" tools/assets/README.md`).
- A new generator adds one row to that table and its own section; do not rewrite other sections.
- Licences: check `CREDITS.md` before copying anything (MIT or LGPL: with attribution; GPL, non-commercial or all rights reserved: ideas only). Every new asset gets a credit line, proposed in the handoff; the integrator appends it to `CREDITS.md` ("Assets").
- Models, blockstates and EMI JSON under `pack/kubejs/assets/` are hand-written and package-owned; `lang/*.json` are shared aggregates (edit only when the contract lists them; machine names go in the machine's `*_lang.js`).
