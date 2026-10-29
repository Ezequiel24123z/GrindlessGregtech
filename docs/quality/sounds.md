# Working sounds of our special multiblocks (QR-E0)

Mechanism, generator and standard; three pilot loops are wired and generated. Phase 2 generates the rest from the candidate list.

## Mechanism (GTM 7.5.3, source evidence, tag v7.5.3-1.20.1)

- A machine's working sound belongs to its **recipe type**: `GTRecipeType.sound` (a `SoundEntry`), set by `GTRecipeTypeBuilder.setSound` (`integration/kjs/builders/GTRecipeTypeBuilder.java`, which ends in `type.setSound(sound)`).
- `RecipeLogic.updateSound()` (`api/machine/trait/RecipeLogic.java`, client only, called from `onStatusSynced`): while `isWorking() && machine.shouldWorkingPlaySound()` it calls `machine.getRecipeType().getSound().playAutoReleasedSound(predicate, pos, loop=true, delay=0, volume=1, pitch=1)`. That is an `AutoReleasedSound` (`api/sound/AutoReleasedSound.java`): a looping `AbstractTickableSoundInstance` on `soundEntry.getMainEvent()` with `Attenuation.LINEAR`, released when the predicate fails. Nothing plays on the server.
- A multi-mode controller plays the sound of the **active mode's** recipe type: our own type (`gtceu:mega_chemical_complex`) gets its own loop, a mode that reuses a GTM type keeps GTM's.
- Registering a GTM `SoundEntry` is **Java only** (GTM docs `Modpacks/Other-Topics/Custom-Sounds.md`; `GTSoundEntries.init` freezes `GTRegistries.SOUNDS`). Supported path from KubeJS: `ExistingSoundEntry(SoundEvent, SoundSource)` (`api/sound/ExistingSoundEntry.java`) wraps any `SoundEvent`, and a `SoundEntry` is what `GTRecipeType.setSound` takes.
- Our design: ONE startup script, `pack/kubejs/startup_scripts/grindless/sounds.js`:
  1. `StartupEvents.registry('sound_event')` creates `grindless:<id>` per wired sound (so `/playsound grindless:<id>` works).
  2. In the `gtceu:machine` registry event (fires after `gtceu:recipe_type`, so every type of ours exists) it takes `GTRegistries.RECIPE_TYPES.get(<type id>)` and calls `type.setSound(new ExistingSoundEntry(SoundEvent.createVariableRangeEvent(grindless:<id>), SoundSource.BLOCKS))`.
  - Era files keep their stock `.setSound(GTSoundEntries.X)` as the fallback; no era file is edited.
- Resources: `pack/kubejs/assets/grindless/sounds/<id>.ogg` (mono Ogg Vorbis, 44.1 kHz) and the generated `pack/kubejs/assets/grindless/sounds.json` (volume, `attenuation_distance`, `stream: false`). Mono is mandatory: Minecraft attenuates only mono (GTM docs).
- Limits: the sound is per recipe type, not per machine; controllers sharing a type share the loop. It plays for every working machine of that type in range (linear fall-off to `attenuation_distance` blocks).

## How to add a sound

1. Row in `tools/assets/sounds.json`: `id` (`loop_<machine>`), `recipeType`, `prompt`, `duration` (0.5-30 s), `loop: true`, `promptInfluence`, `volume`, `attenuation`, `quality` (libvorbis -q).
2. `powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\New-MachineSound.ps1 -Only <id>`. The key is read at runtime from `C:\Nueva carpeta\elevenlabskey.txt` or `GG_ELEVENLABS_KEY`, sent only as `xi-api-key`. `-Plan` shows the plan tier and what would run, `-Force` regenerates, `-IndexOnly` rebuilds `sounds.json` without an API call.
3. Add `'gtceu:<type>': '<id>'` to `WIRING` in `sounds.js` (the integrator stamps the `// priority:` header).
4. `node --test tools/analysis/test/sounds.test.mjs` (spec, sounds.json, files and wiring agree; size budget; part of the Node suite).

The generator downloads a pinned portable ffmpeg (7.1.1 essentials, SHA-256 checked) into the gitignored `.work/`, calls `POST /v1/sound-generation?output_format=mp3_44100_128` with `loop: true`, `duration_seconds`, `prompt_influence`, model `eleven_text_to_sound_v2`, and converts to mono Ogg Vorbis (trim to the duration, no fades, no metadata). It refuses the free plan.

## Budget and quality rules

- Each `.ogg` at most 100 KB (enforced by the test): 8 s mono at `-q 1` is 47-63 KB. Pack budget for sounds: 2 MB (about 30 loops).
- Loop length 8 s, never over 12 s. Prompts: "seamless looping", no voices, no music.
- Volume 0.6-0.7, attenuation 24-32 blocks for big multiblocks (default 16).
- Only the signature multiblock of a line gets a loop; no loops for small machines.
- Seam: the API's `loop: true` makes the clip loop smoothly; ffmpeg only trims. If a seam is audible, regenerate (`-Force`).
- Cost: a pilot loop is about 160 credits (of 40000 per month on Starter).

## Licence (proposed CREDITS line)

Plan at generation: ElevenLabs **Starter**, active (`GET /v1/user/subscription`). Outputs generated on a paid plan carry a commercial licence with no attribution; the free plan has none, so the generator blocks it. ElevenLabs keeps a licence to use outputs for its service. Terms: https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform and https://elevenlabs.io/terms-of-use.

Proposed `CREDITS.md` line: `Machine working-sound loops (pack/kubejs/assets/grindless/sounds/*.ogg): generated with ElevenLabs Sound Effects on the Starter plan (commercial licence for outputs generated while subscribed, no attribution; https://elevenlabs.io/terms-of-use).`

Risk: the licence covers audio generated while subscribed, so every batch must be generated during an active paid plan.

## Pilot

| Sound | Recipe type | Machine | Why |
|---|---|---|---|
| `loop_observatory` | `gtceu:radio_astronomy` | Observatory | signature science multiblock, calm hum |
| `loop_mega_chemical_complex` | `gtceu:mega_chemical_complex` | Mega Chemical Complex (LuV) | big chemical plant, own recipe type |
| `loop_plasma_quench_caster` | `gtceu:plasma_quench` | Plasma Quench Caster (ZPM) | fusion-like energy machine |

## Candidates per era for Phase 2

Signature multiblocks with their own recipe type (`startup_scripts/grindless/<era>/<file>.js`); Phase 2 reads the type id from each `event.create(...)`.

- steam: horizon_collector, coking_battery, blast_furnace
- lv: sulfide_roaster, heliostat_tower
- mv: ore_plant, biorefinery, mega_polymer_works
- hv: refinery, reformer, syngas_plant
- ev: extraction_cascade, cryogenic_plant, combined_cycle_and_hot_mill, platinum_plant, lunar_power_and_antenna
- iv: fission_reactor, hot_cell, heavy_water_plant, fluorspar_kiln, naquadah_plant, uranium_cycle, tritium_removal
- luv: hts_magnet_works, helium_refrigerator, io_orbit, europa, asteroid_belt, biofoundry
- zpm: magnet_works, saturn_siphon, qubits, naquadria
- uv: fusion, starshot, thorium, accelerators, cold, photonics
- uhv: swarm, antimatter, gate, power_devices, elevator
- uev: fusion, electron_beam, megabar, earth_orbit, composites
- uiv: matrioshka, rx_j1856, levitation_melter, mk5, metallic_hydrogen

Files that create several types in a loop (`k === ...`, `uev/composites.js`) get one loop per type or share one.

### QR-E1 status (steam to uev, done)

52 further loops generated on the Starter plan (6 s, `-q 0`, 22-50 KB each; pack total about 2.0 MB for 55 loops; about 3100 credits). All wired in `sounds.js`; rows in `tools/assets/sounds.json`. One loop per signature type (steam: horizon_collection, coking, steelmaking; lv: sulfide_roasting, solar_steam; mv: ore_processing, bio_distillation, polymer_works; hv: refining, reforming, syngas; ev: solvent_extraction, cryogenic_processing, combined_cycle, hot_rolling, pgm_refining, lunar_solar, deep_space_tracking; iv: fission_core, hot_cell, isotope_exchange, fluorspar_digestion, naquadah_refining, in_situ_leaching, fuel_fabrication, detritiation; luv: magnet_winding, closed_loop_cooling, electrodynamic_tether, thermochemical_hydrogen, asteroid_processing, optical_mining, sterile_culture; zpm: naquadria_magnets, gas_giant_siphon, qubit_fabrication, naquadria_refining; uv: laser_fusion, light_sail, pyroprocessing, synchrotron, superfluid_helium, fibre_draw; uhv: dyson_swarm, positron_accumulation, warp_gate, silicon_carbide, pbo_synthesis; uev: megabar_synthesis, electron_beam_refining, quantum_degenerate_gas, chemical_vapour_infiltration).

Left without a loop: secondary types of multi-type files (e.g. conversion/second-stage types), `uev` fusion (its type `fusion_reactor` is GTM's own, shared with the stock reactor), looped families in `uev/composites.js` other than the CVI furnace, UIV (parked), and the budget-limited remainder of uhv/uev lines. Multi-mode controllers keep GTM sounds for GTM types.

## T3 check

See the handoff for the run id: the client log must show no `Unable to play unknown soundEvent` / missing-sound warning for `grindless:loop_*`, and a working pilot machine must start its loop.
